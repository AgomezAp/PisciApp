import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { EmpresaService } from '../../core/services/empresa.service';

@Component({
  selector: 'app-inicio-perfil',
  imports: [NavbarComponent, CommonModule],
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


  // Recordatorios
  recordatorios: string[] = [  ];

  // Datos de empresa
  empresa: any = null;
  especiePrincipal: string = 'TILAPIA ROJA';
  ubicacionNombre: string = 'Piscipap';
  ubicacionDireccion: string = 'Calle 38# 23 54 | Risaralda | 66003 | Colombia';

  // Balance económico
  anioActual: number = new Date().getFullYear();
  gastosFormateados: string = '0,00 $';
  ingresosFormateados: string = '0,00 $';
  balanceFormateados: string = '0,00 $';

  // Biomasa
  biomasaActual: string = '0,00';
  biomasaProyectada: string = '0,00';
  diasProyeccion: number = 30;

  // Estadísticas
  capacidadMaxima: string = '0 kg';
  capacidadSub: string = 'Equivale al 100% usando capacidad de máximo 4 peces/m3';
  mortalidad: string = '0';
  mortalidadSub: string = 'Es decir, 0% de mortalidad para los 0 días registrados';

  constructor(
    private authService: AuthService,
    private router: Router,
    private empresaService: EmpresaService
  ) {}

  ngOnInit(): void {
     const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;
    this.cargarDatosUsuario();
    this.checkMobile();
  }

  ngOnDestroy(): void {
    // Limpieza si es necesario
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
    // Cerrar el dropdown si cambiamos a desktop
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
}
