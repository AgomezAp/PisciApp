import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { EmpresaService } from '../../core/services/empresa.service';
import { CicloService } from '../../core/services/ciclo.service';
import { VentaService } from '../../core/services/venta.service';

@Component({
  selector: 'app-inicio-perfil',
  imports: [CommonModule],
  templateUrl: './inicio-perfil.component.html',
  styleUrl: './inicio-perfil.component.css'
})
export class InicioPerfilComponent implements OnInit, OnDestroy {
  userName: string = 'Usuario';
  userEmail: string = '';
  userInitials: string = 'U';
  isMobile: boolean = false;
  perfilMobileAbierto: boolean = false;
  usuario_id: number = 0;


  recordatorios: string[] = [  ];

  empresa: any = null;
  especiePrincipal: string = 'TILAPIA ROJA';
  ubicacionNombre: string = 'Piscipap';
  ubicacionDireccion: string = 'Calle 38# 23 54 | Risaralda | 66003 | Colombia';

  anioActual: number = new Date().getFullYear();
  gastosFormateados: string = '0,00 $';
  ingresosFormateados: string = '0,00 $';
  balanceFormateados: string = '0,00 $';

  biomasaActual: string = '0,00';
  biomasaProyectada: string = '0,00';
  diasProyeccion: number = 30;

  capacidadMaxima: string = '0 kg';
  capacidadSub: string = 'Equivale al 100% usando capacidad de máximo 4 peces/m3';
  mortalidad: string = '0';
  mortalidadSub: string = 'Es decir, 0% de mortalidad para los 0 días registrados';

  constructor(
    private authService: AuthService,
    private router: Router,
    private empresaService: EmpresaService,
    private cicloService: CicloService,
    private ventaService: VentaService
  ) {}

  ngOnInit(): void {
     const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;
    this.cargarDatosUsuario();
    this.cargarBalanceEconomico();
    this.cargarCapacidadMaxima();
    this.checkMobile();
  }

  ngOnDestroy(): void {
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  private cargarDatosUsuario(): void {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;
    if (user) {
      this.userName = user.nombre || 'Usuario';
      this.userEmail = user.correo || '';
      this.userInitials = this.getInitials(this.userName);
    }
    this.empresaService.verEmpresa(this.usuario_id).subscribe((empresa: any[]) => {
      this.empresa = empresa;
      console.log(this.empresa);
        }, error => {
      this.router.navigate(['/registroempresa']);
    });
  }

  private getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth <= 1200;
    if (!this.isMobile) {
      this.perfilMobileAbierto = false;
    }
  }

  togglePerfilMobile(): void {
    this.perfilMobileAbierto = !this.perfilMobileAbierto;
  }

  perfil() {
    this.router.navigate(['/configuracion'])
  }

  private cargarBalanceEconomico(): void {
    let gastosTotales = 0;
    let ingresosTotales = 0;

    this.cicloService.obtenerCicloPorUsuario(this.usuario_id).subscribe({
      next: (ciclos: any[]) => {
        const ciclosCerrados = ciclos.filter(ciclo => ciclo.fecha_fin !== null && ciclo.fecha_fin !== undefined);
        
        gastosTotales = ciclosCerrados.reduce((total, ciclo) => {
          const costos = ciclo.costos || 0;
          return total + costos;
        }, 0);

        this.gastosFormateados = this.formatearMoneda(gastosTotales);
        this.calcularUtilidad(ingresosTotales, gastosTotales);
      },
      error: (error) => {
        console.error('Error al cargar ciclos:', error);
        this.gastosFormateados = '0,00 $';
      }
    });

    this.ventaService.obtenerVentas().subscribe({
      next: (ventas: any[]) => {
        ingresosTotales = ventas.reduce((total, venta) => {
          const precio = venta.precio || 0;
          return total + precio;
        }, 0);

        this.ingresosFormateados = this.formatearMoneda(ingresosTotales);
        this.calcularUtilidad(ingresosTotales, gastosTotales);
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        this.ingresosFormateados = '0,00 $';
      }
    });
  }

  private calcularUtilidad(ingresos: number, gastos: number): void {
    const utilidad = ingresos - gastos;
    this.balanceFormateados = this.formatearMoneda(utilidad);
  }

  private formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }

  private cargarCapacidadMaxima(): void {
    this.ventaService.obtenerVentas().subscribe({
      next: (ventas: any[]) => {
        if (ventas.length === 0) {
          this.capacidadMaxima = '0 toneladas';
          this.capacidadSub = 'No hay ventas registradas';
          return;
        }

        const totalToneladas = ventas.reduce((total, venta) => {
          const toneladas = venta.toneladas || 0;
          return total + toneladas;
        }, 0);

        const promedioToneladas = totalToneladas / ventas.length;

        this.capacidadMaxima = `${promedioToneladas.toFixed(2)} toneladas`;
        this.capacidadSub = `Promedio calculado con ${ventas.length} venta${ventas.length !== 1 ? 's' : ''} registrada${ventas.length !== 1 ? 's' : ''}`;
      },
      error: (error) => {
        console.error('Error al cargar capacidad máxima:', error);
        this.capacidadMaxima = '0 toneladas';
        this.capacidadSub = 'Error al calcular capacidad';
      }
    });
  }
}
