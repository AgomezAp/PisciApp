import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { CicloService } from '../../core/services/ciclo.service';
import { TanqueService } from '../../core/services/tanque.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../core/services/venta.service';

@Component({
  selector: 'app-empresa',
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.css'
})
export class EmpresaComponent implements OnInit {
  vistaActual: 'ciclos' | 'tanques' | 'ventas' = 'ciclos';
  ciclos: any[] = [];
  tanques: any[] = [];
  ventas: any[] = [];
  compradores: any[] = [];
  tanquesDisponibles: any[] = [];
  tanquesDisponiblesCantidad = 0;
  usuario_id: number = 0;
  tipoTanques: string[] = ['Estanque de manantial', 'Estanque de arroyo o río' , 'Estanque de lluvia', 'Estanque de tierra',
    'Estanque de concreto', 'Estanque con geomembrana', 'Estanque de fibra de vidrio', 'Estanque de reproducción', 'Estanque de alevinaje',
    'Estanque de cría', 'Estanque de engorde', 'Estanque de almacenamiento', 'Estanque de cuarentena'];
  especiesDisponibles: string[] = ['Tilapia', 'Carpa', 'Salmón', 'Trucha', 'Bagre', 'Rodaballo', 'Bacalao', 'Atún'];
  cargando: boolean = false;
  mostrarModalCiclo = false;
  mostrarModalTanque = false;
  mostrarModalVenta = false;
  modoEdicion = false;
  tanqueIdEditar: number | null = null;
  costoUnidad: number | null = null;
  clienteExistente: boolean = false
  nuevoCiclo = {
    tanques: null as number | null,
    numero_peces: null as number | null,
    costos: null as number | null,
    costos_transporte: null as number | null,
    especie: "",
    fecha_inicio: ""
  };
  nuevoTanque = {
    forma: '',
    profundidad: null as number | null,
    largo: null as number | null,
    ancho: null as number | null,
    diametro: null as number | null,
    tipoTanque: ''
  };
  nuevaVenta = {
    ciclo_id_usuario: null as number | null,
    precio: null as number | null,
    toneladas: null as number | null,
    comprador_id: null as number | null
  };
  nuevoComprador = {
    nombre: '',
    empresa: '',
    direccion: '',
    correo: '',
    telefono: ''

  }

  constructor(
    private cicloService: CicloService,
    private tanqueService: TanqueService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private ventaService: VentaService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;

    if (!this.usuario_id) {
      this.notificationService.error('Usuario no autenticado');
      this.router.navigate(['/login']);
      return;
    }

    this.cargarDatos();
  }

  cambiarVista(vista: 'ciclos' | 'tanques' | 'ventas'): void {
    this.vistaActual = vista;
    if (vista === 'ciclos' && this.ciclos.length === 0) {
      this.cargarCiclos();
    } else if (vista === 'tanques' && this.tanques.length === 0) {
      this.cargarTanques();
    } else if (vista === 'ventas' && this.tanques.length === 0) {
      this.cargarVentas();
    }
  }

  private cargarDatos(): void {
    this.cargarCiclos();
    this.cargarTanques();
    this.cargarVentas()
  }

  private cargarCiclos(): void {
    this.cargando = true;
    this.cicloService.obtenerCicloPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        this.ciclos = Array.isArray(data) ? data : [data];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar ciclos:', err);
        this.notificationService.error('Error al cargar los ciclos');
        this.ciclos = [];
        this.cargando = false;
      }
    });
  }

  private cargarTanques(): void {
    this.cargando = true;
    this.tanqueService.obtenerTanquesPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        this.tanques = data;
        this.tanquesDisponibles = this.tanques.filter(tanque => tanque.disponible === true);
        this.tanquesDisponiblesCantidad = this.tanquesDisponibles.length;
        this.cargando = false;
        console.log('disponibles',this.tanquesDisponibles)
      },
      error: (err) => {
        console.error('Error al cargar tanques:', err);
        this.notificationService.error('Error al cargar los tanques');
        this.tanques = [];
        this.cargando = false;
      }
    });
  }

  private cargarVentas(): void {
    this.cargando = true;
    this.ventaService.obtenerVentas().subscribe({
      next: (data) => {
        this.ventas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar las ventas', err);
        this.ventas = [];
        this.cargando = false
      }
    });
  }

  abrirModalCiclo() {
    this.mostrarModalCiclo = true;
    this.nuevoCiclo = {tanques: null as number | null,
      numero_peces: null as number | null,
      costos: null as number | null,
      costos_transporte: null as number | null,
      especie: "",
      fecha_inicio: "" };
      this.costoUnidad = 0;
  }

  abrirModalTanque(): void {
    this.modoEdicion = false;
    this.tanqueIdEditar = null;
    this.mostrarModalTanque = true;
    this.nuevoTanque = {forma: '',
      profundidad: null as number | null,
      largo: null as number | null,
      ancho: null as number | null,
      diametro: null as number | null,
      tipoTanque: ''};

  }
  agregarTanque() {
    if (this.modoEdicion && this.tanqueIdEditar) {
      this.actualizarTanque();
    } else {
      const datos = {
        ...this.nuevoTanque,
        usuario_id: this.usuario_id
      };
      this.tanqueService.crearTanque(datos).subscribe({
        next: (tanque) => {
          this.tanques.push(tanque);
          this.tanquesDisponibles = this.tanques.filter(tanque => tanque.disponible === true);
          this.tanquesDisponiblesCantidad = this.tanquesDisponibles.length;
          this.cargarTanques();
          this.cerrarModalTanque();
          this.notificationService.success('Tanque creado exitosamente')
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Error al crear el tanque');
        }
      });

    }
  }

  actualizarTanque(): void {
    if (!this.tanqueIdEditar) return;
    const datos = {
      ...this.nuevoTanque,
      usuario_id: this.usuario_id
    };
    this.tanqueService.editarTanque(this.tanqueIdEditar, datos).subscribe({
      next: () => {
        this.notificationService.success('Tanque editado correctamente');
        this.cargarDatos();
        this.cerrarModalTanque();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Error al editar ');
      }
    });
  }

  agregarCiclo(){
    this.nuevoCiclo.costos = (this.nuevoCiclo.numero_peces ?? 0) * (this.costoUnidad ?? 0);
    const datos = {
      ...this.nuevoCiclo,
      tanques: Number(this.nuevoCiclo.tanques),
      usuario_id: this.usuario_id
    };
    console.log(datos);
    this.cicloService.crearCiclo(datos).subscribe({
      next: (ciclo) => {
        this.notificationService.success('Ciclo creado Correctamente');
        this.cargarCiclos();
        this.cargarTanques();
        this.cerrarModalCiclo();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Error al crear ciclo')
      }
    });
  }

  cerrarModalTanque() {
    this.mostrarModalTanque = false;
    this.modoEdicion = false;
    this.tanqueIdEditar = null;
  }

  cerrarModalCiclo() {
    this.mostrarModalCiclo = false
  }


  editarTanque(tanque: any): void {
    this.modoEdicion = true;
    this.tanqueIdEditar = tanque.id;
    this.mostrarModalTanque = true;

    this.nuevoTanque = {
      forma: tanque.forma || '',
      profundidad: tanque.profundidad || null,
      largo: tanque.largo || null, 
      ancho: tanque.ancho || null,
      diametro: tanque.diametro || null,
      tipoTanque: tanque.tipoTanque || '',
    };
  }

  // eliminarCiclo(cicloId: number): void {
  //   if (!confirm('¿Estás seguro de eliminar este ciclo? Esta acción no se puede deshacer.')) {
  //     return;
  //   }

  //   this.cicloService.eliminarCiclo(cicloId, this.usuario_id).subscribe({
  //     next: () => {
  //       this.notificationService.success('Ciclo eliminado correctamente');
  //       this.cargarCiclos();
  //     },
  //     error: (err) => {
  //       console.error('Error al eliminar ciclo:', err);
  //       this.notificationService.error('Error al eliminar el ciclo');
  //     }
  //   });
  // }

  eliminarTanque(tanqueId: number): void {
    this.notificationService.confirm(
      'Estas seguro de eliminar este tanque? ',
      () => {
        this.tanqueService.eliminarTanque(tanqueId).subscribe({
          next: () => {
            this.notificationService.success('Tanque Eliminado');
            this.cargarTanques();
          },
          error: (err) => {
            console.error('Error al eliminar el tanque', err)
            this.notificationService.error('Error al eliminar el tanque0');
          }
        });
      },
      '¿Eliminar Tanque?'
    );
  }

  agregarVenta() {

  }
  onCicloSeleccionado(event: any) {}

  onClienteExistenteChange() {}

  cerrarModalVenta() {}
}
