import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { InventarioService } from '../../core/services/inventario.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventario',
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  usuario_id: number = 0;
  inventario: any[] = [];
  mostrarModalAgregar: boolean = false;

  nuevoItem = {
    tipo_material: '',
    nombre: '',
    provedor: '',
    cantidad: 0,
    costo_insumo: 0.0,
    costo_transporte: 0.0,
    fecha_caducidad: new Date(),
    peso_unidad: 0.0,
    granularidad: 0.0,
  }




  constructor (
    private authService: AuthService,
    private notificacionService: NotificationService,
    private inventarioService: InventarioService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;
    this.inventarioService.obtenerInventario(this.usuario_id).subscribe({
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
    
    // this.inventarioService.crearInventario(this.nuevoItem).subscribe({
    //   next: (data) => {
    //     this.inventario.push(data);
    //     this.notificacionService.success('Inventario agregado correctamente');
    //     this.mostrarAgregar();
    //     this.nuevoItem = {
    //       tipo_material: '',
    //       nombre: '',
    //       provedor: '',
    //       cantidad: 0,
    //       costo_insumo: 0.0,
    //       costo_transporte: 0.0,
    //       fecha_caducidad: new Date(),
    //       peso_unidad: 0.0,
    //       granularidad: 0.0,
    //     };
    //   },
    //   error: (err) => {
    //     this.notificacionService.error('Error al agregar inventario')
    //   }
    // });
  }

  mostrarAgregar(): void {
    this.mostrarModalAgregar = !this.mostrarModalAgregar
  }
}
