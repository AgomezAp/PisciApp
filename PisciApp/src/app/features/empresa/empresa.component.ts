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
  mostrarModalMovimiento = false;
  modoEdicion = false;
  tanqueIdEditar: number | null = null;
  costoUnidad: number | null = null;
  clienteExistente: boolean = false;
  cicloSeleccionadoMovimiento: any = null
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
  };
  nuevoMovimiento = {
    origen: null as number | null,
    destino: null as number | null,
    cantidad: null as number | null
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
        this.tanques = data.map((tanque: any) => ({
          ...tanque,
          numero_peces: 0
        }));
        this.tanquesDisponibles = this.tanques.filter(tanque => tanque.disponible === true);
        this.tanquesDisponiblesCantidad = this.tanquesDisponibles.length;
        this.cargando = false;
        this.cargarPecesEnTanques();
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

  private cargarPecesEnTanques(): void {
    this.ciclos.forEach(ciclo => {
      if (!ciclo.fecha_fin) {
        this.cicloService.obtenerCicloTanques(ciclo.id).subscribe({
          next: (cicloTanques: any[]) => {
            cicloTanques.forEach(ct => {
              const tanque = this.tanques.find(t => t.id === ct.tanque_id);
              if (tanque) {
                tanque.numero_peces = (tanque.numero_peces || 0) + (ct.numero_peces || 0);
              }
            });
          },
          error: (err) => {
            console.error('Error al cargar peces del ciclo', ciclo.id, err);
          }
        });
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

  abrirModalVenta(): void {
    this.mostrarModalVenta = true;
    this.clienteExistente = false;
    this.nuevaVenta = {
      ciclo_id_usuario: null,
      precio: null,
      toneladas: null,
      comprador_id: null
    };
    this.nuevoComprador = {
      nombre: '',
      empresa: '',
      direccion: '',
      correo: '',
      telefono: ''
    };
    this.cargarCompradores();
  }

  private cargarCompradores(): void {
    this.ventaService.obtenerCompradores().subscribe({
      next: (data) => {
        this.compradores = data.compradores || [];
      },
      error: (err) => {
        console.error('Error al cargar compradores:', err);
        this.compradores = [];
      }
    });
  }

  onCicloSeleccionado(event: any): void {
    const cicloId = this.nuevaVenta.ciclo_id_usuario;
    if (cicloId) {
      const ciclo = this.ciclos.find(c => c.ciclo_id_usuario === cicloId);
      if (ciclo) {
        console.log('Ciclo seleccionado:', ciclo);
      }
    }
  }

  onClienteExistenteChange(): void {
    if (this.clienteExistente) {
      this.nuevaVenta.comprador_id = null;
      this.nuevoComprador = {
        nombre: '',
        empresa: '',
        direccion: '',
        correo: '',
        telefono: ''
      };
    } else {
      this.nuevaVenta.comprador_id = null;
    }
  }

  agregarVenta(): void {
    if (!this.nuevaVenta.ciclo_id_usuario || !this.nuevaVenta.toneladas || !this.nuevaVenta.precio) {
      this.notificationService.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const datos: any = {
      ciclo_id_usuario: this.nuevaVenta.ciclo_id_usuario,
      toneladas: this.nuevaVenta.toneladas,
      precio: this.nuevaVenta.precio
    };

    if (this.clienteExistente) {
      if (!this.nuevaVenta.comprador_id) {
        this.notificationService.error('Selecciona un cliente');
        return;
      }
      datos.comprador_id = this.nuevaVenta.comprador_id;
    } else {
      if (!this.nuevoComprador.nombre || !this.nuevoComprador.empresa || 
          !this.nuevoComprador.direccion || !this.nuevoComprador.correo) {
        this.notificationService.error('Completa todos los datos del cliente');
        return;
      }
      datos.nombre = this.nuevoComprador.nombre;
      datos.empresa = this.nuevoComprador.empresa;
      datos.direccion = this.nuevoComprador.direccion;
      datos.correo = this.nuevoComprador.correo;
      datos.telefono = this.nuevoComprador.telefono || '';
    }

    this.cargando = true;
    this.ventaService.crearVenta(datos).subscribe({
      next: (response) => {
        this.notificationService.success('Venta registrada exitosamente');
        this.cargarVentas();
        this.cargarCiclos();
        this.cerrarModalVenta();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al crear venta:', err);
        this.notificationService.error(err?.error?.error || 'Error al registrar la venta');
        this.cargando = false;
      }
    });
  }

  cerrarModalVenta(): void {
    this.mostrarModalVenta = false;
  }

  abrirModalMovimientoDesde(ciclo: any): void {
    this.cicloSeleccionadoMovimiento = ciclo;
    this.mostrarModalMovimiento = true;
    this.nuevoMovimiento = {
      origen: null,
      destino: null,
      cantidad: null
    };
    this.cargarTanques();
  }

  cerrarModalMovimiento(): void {
    this.mostrarModalMovimiento = false;
    this.cicloSeleccionadoMovimiento = null;
  }

  agregarMovimiento(): void {
    if (!this.nuevoMovimiento.origen || !this.nuevoMovimiento.destino || !this.nuevoMovimiento.cantidad) {
      this.notificationService.error('Completa todos los campos');
      return;
    }

    if (this.nuevoMovimiento.origen === this.nuevoMovimiento.destino) {
      this.notificationService.error('El tanque origen y destino no pueden ser el mismo');
      return;
    }

    const datos = {
      origen: this.nuevoMovimiento.origen,
      destino: this.nuevoMovimiento.destino,
      cantidad: this.nuevoMovimiento.cantidad
    };

    this.cicloService.cambiarTanque(datos, this.cicloSeleccionadoMovimiento.id).subscribe({
      next: () => {
        this.notificationService.success('Movimiento registrado exitosamente');
        this.cargarCiclos();
        this.cargarTanques();
        this.cerrarModalMovimiento();
      },
      error: (err) => {
        console.error('Error al registrar movimiento:', err);
        this.notificationService.error(err?.error?.error || 'Error al registrar el movimiento');
      }
    });
  }

  getTanqueNombre(tanque_id: number): string {
    const tanque = this.tanques?.find(t => t.id === tanque_id);
    return tanque?.nombre || ('Tanque ' + tanque_id);
  }

  abrirModalVentaDesde(ciclo: any): void {
    this.nuevaVenta.ciclo_id_usuario = ciclo.ciclo_id_usuario;
    this.abrirModalVenta();
  }
}
