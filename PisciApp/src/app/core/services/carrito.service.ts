import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from './producto.service';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private items: ItemCarrito[] = [];
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);

  carrito$ = this.carritoSubject.asObservable();

  // ✅ NUEVO MÉTODO: Obtener items del carrito
  getItems(): ItemCarrito[] {
    return [...this.items]; // Retorna una copia para evitar mutaciones directas
  }

  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const index = this.items.findIndex(i => i.producto.id === producto.id);
    if (index > -1) {
      // verificar stock
      if (this.items[index].cantidad + cantidad > producto.stock) {
        alert(`No hay suficiente stock. Stock disponible: ${producto.stock}`);
        return;
      }
      this.items[index].cantidad += cantidad;
    } else {
      if (cantidad > producto.stock) {
        alert(`No hay suficiente stock. Stock disponible: ${producto.stock}`);
        return;
      }
      this.items.push({ producto, cantidad });
    }
    this.carritoSubject.next(this.items);
  }

  quitarProducto(productoId: number): void {
    this.items = this.items.filter(i => i.producto.id !== productoId);
    this.carritoSubject.next(this.items);
  }

  limpiarCarrito(): void {
    this.items = [];
    this.carritoSubject.next(this.items);
  }

  total(): number {
    return this.items.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0);
  }

  // ✅ Método para actualizar cantidad directamente
  actualizarCantidad(productoId: number, nuevaCantidad: number) {
    const index = this.items.findIndex(i => i.producto.id === productoId);
    if (index === -1) return;

    // No permitimos que la cantidad sea menor que 1
    if (nuevaCantidad < 1) {
      this.quitarProducto(productoId);
      return;
    }

    // No permitimos superar el stock
    if (nuevaCantidad > this.items[index].producto.stock) {
      alert(`No hay suficiente stock. Stock disponible: ${this.items[index].producto.stock}`);
      return;
    }

    this.items[index].cantidad = nuevaCantidad;
    this.carritoSubject.next(this.items);
  }
}