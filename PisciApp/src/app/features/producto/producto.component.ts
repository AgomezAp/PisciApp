import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService, Producto } from '../../core/services/producto.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CarritoService, ItemCarrito } from '../../core/services/carrito.service';
import { NotificationService } from '../../core/services/notification.service';


@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private notificacionService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (res) => {
        console.log('Respuesta API:', res);
        this.productos = res.data;
      },
      error: (err) => alert('Error cargando productos')
    });
  }
  getCantidadEnCarrito(producto: Producto): number {
  const item = this.carritoService.getItems().find((i: ItemCarrito) => i.producto.id === producto.id);
  return item ? item.cantidad : 0;
}


agregarAlCarrito(producto: Producto): void {
  const disponible = this.getDisponible(producto);

  if (disponible <= 0) {
    this.notificacionService.error("no hay stock")
  }

  this.carritoService.agregarProducto(producto, 1);
}

getDisponible(producto: Producto): number {
  const item = this.carritoService.getItems().find((i: ItemCarrito) => i.producto.id === producto.id);
  const cantidadEnCarrito = item ? item.cantidad : 0;
  return producto.stock - cantidadEnCarrito;
}


}
