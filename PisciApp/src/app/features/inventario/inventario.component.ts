import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { InventarioService } from '../../core/services/inventario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  usuario_id: number = 0;
  inventario: any[] = [];
  mostrarModalAgregar: boolean = false;
  mostrarModalEditar: boolean = false;
  busquedaInventario: string = '';
  filtroTipoInventario: string = '';
  itemEditando: any = null
  datosGenerales: boolean = true;
  datosFisicos: boolean = false;
  datosEconomicos: boolean = false;

  // ✅ ACTUALIZADO: Agregado unidad_medida
  nuevoItem = {
    tipo_material: '',
    nombre: '',
    lote: null as number | null,
    provedor: '',
    cantidad: null as number | null,
    costo_insumo: null as number | null,
    costo_transporte: null as number | null,
    fecha_caducidad: new Date(),
    peso_unidad: null as number | null,
    unidad_medida: '', 
    granularidad: null as number | null,
  }

  // ✅ NUEVO: Opciones de unidades de medida
  unidadesMedida: string[] = [
    'kg',
    'gramos',
    'toneladas',
    'litros',
    'ml',
    'unidades',
    'm',
    'cm',
    'lb',
    'oz'
  ];

  constructor (
    private authService: AuthService,
    private notificacionService: NotificationService,
    private inventarioService: InventarioService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;
    this.inventarioService.obtenerInventario().subscribe({
      next: (data) => {
        console.log('data',data);
        if (data && data.length > 0) {
          console.log('aca en el 1 if')
          this.inventario = data;
        } else {
          console.log('else')
          this.cargarInventarioFalso();
        }
      }
    });
    console.log(this.inventario)
  }

  mostrarSeccion(seccion: 'generales' | 'fisicos' | 'economicos'): void {
    if (seccion === 'generales') {
      this.datosGenerales = true;
      this.datosFisicos = false;
      this.datosEconomicos = false;
    } else if(seccion === 'fisicos') {
      this.datosGenerales = false;
      this.datosFisicos = true;
      this.datosEconomicos = false;
    } else if (seccion === 'economicos') {
      this.datosGenerales = false;
      this.datosFisicos = false;
      this.datosEconomicos = true;
    } else {
      this.datosGenerales = false;
      this.datosFisicos = false;
      this.datosEconomicos = false;
    }
  }

  // Datos falsos para pruebas de frontend
  cargarInventarioFalso(): void {
    this.inventario = [
      { id: 1, nombre: 'Producto A', cantidad: 10, descripcion: 'Descripción del producto A' },
      { id: 2, nombre: 'Producto B', cantidad: 5, descripcion: 'Descripción del producto B' },
      { id: 3, nombre: 'Producto C', cantidad: 20, descripcion: 'Descripción del producto C' },
      { id: 4, nombre: 'Producto D', cantidad: 15, descripcion: 'Descripción del producto D' },
      { id: 5, nombre: 'Producto E', cantidad: 8, descripcion: 'Descripción del producto E' },
      { id: 6, nombre: 'Producto F', cantidad: 12, descripcion: 'Descripción del producto F' },
      { id: 7, nombre: 'Producto G', cantidad: 30, descripcion: 'Descripción del producto G' },
      { id: 8, nombre: 'Producto H', cantidad: 25, descripcion: 'Descripción del producto H' },
      { id: 9, nombre: 'Producto I', cantidad: 18, descripcion: 'Descripción del producto I' },
      { id: 10, nombre: 'Producto J', cantidad: 22, descripcion: 'Descripción del producto J' }
    ];
  }

  agregarInventario(): void {
    console.log(this.nuevoItem);
    this.inventarioService.crearInventario(this.nuevoItem).subscribe({
      next: (data) => {
        this.inventario.push(data);
        this.mostrarAgregar();
        this.notificacionService.success('Inventario agregado correctamente');
        this.resetFormulario();
      },
      error: (err) => {
        this.notificacionService.error('Error al agregar inventario')
      }
    });
  }

  get inventarioFiltrado(): any[] {
    let lista = this.inventario;
    if (this.filtroTipoInventario) {
      lista = lista.filter(item => item.tipo_material === this.filtroTipoInventario)
    }
    if (this.busquedaInventario) {
      lista = lista.filter(item => 
        item.nombre?.toLowerCase().includes(this.busquedaInventario.toLowerCase())
      )
    }
    return lista
  }

  mostrarAgregar(): void {
    this.mostrarModalAgregar = !this.mostrarModalAgregar
  }

  mostrarEditar(item: any): void {
    this.itemEditando = { ...item};
    console.log(this.itemEditando);
    this.nuevoItem = {...item};
    this.mostrarModalEditar = true
  }

  cerrarModal(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarModalInventario();
    }
  }

  cerrarModalInventario(): void {
    this.mostrarModalAgregar = false;
    this.mostrarModalEditar = false;
    this.resetFormulario();
  }

  // ✅ NUEVO: Método para resetear formulario
  private resetFormulario(): void {
    this.nuevoItem = {
      tipo_material: '',
      nombre: '',
      lote: null as number | null,
      provedor: '',
      cantidad: null as number | null,
      costo_insumo: null as number | null,
      costo_transporte: null as number | null,
      fecha_caducidad: new Date(),
      peso_unidad: null as number | null,
      unidad_medida: '', 
      granularidad: null as number | null,
    };
  }

  actualizarItem(): void {
    if (this.itemEditando) {
      this.inventarioService.actualizarItem(this.nuevoItem, this.itemEditando.id).subscribe({
        next: (data) => {
          const index = this.inventario.findIndex(item => item.id === this.itemEditando.id);
          if (index !== -1) {
            this.inventario[index] = data;
          }
          this.cerrarModalInventario();
          this.notificacionService.success("Elemento Actualizado");
        },
        error: (err) => {
          this.notificacionService.error("Error al actualizar");
        }
      })
    }
  }

  eliminarItem(id: number): void {
    this.notificacionService.confirm(
      `Seguro que quiere eliminar el elemento con el id: ${id}`,
      () => {
        this.inventarioService.eliminarItem(id).subscribe({
          next: () => {
            this.inventario = this.inventario.filter(item => item.id !== id);
            this.notificacionService.success('Elemento eliminado')
          },
          error: (err) => {
            this.notificacionService.error('Error')
          }
        });
      },
      '¿Eliminar elemento?'
    );
  }
}