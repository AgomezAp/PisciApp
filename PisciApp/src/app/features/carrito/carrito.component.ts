import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService, ItemCarrito } from '../../core/services/carrito.service';
import { CompraService, CompraResponse } from '../../core/services/compra.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component'; 

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy {
  items: ItemCarrito[] = [];
  bubbles: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private carritoService: CarritoService,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    this.carritoService.carrito$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => (this.items = items));
    
    this.generateBubbles();
  }

  generateBubbles() {
    this.bubbles = Array.from({ length: 15 }, () => {
      const size = Math.random() * 40 + 10;
      const left = Math.random() * 100;
      const delay = Math.random() * 15;
      const duration = Math.random() * 10 + 15;
      
      return {
        'width': `${size}px`,
        'height': `${size}px`,
        'left': `${left}%`,
        'animation-delay': `${delay}s`,
        'animation-duration': `${duration}s`
      };
    });
  }

  quitar(id: number): void {
    this.carritoService.quitarProducto(id);
  }

  incrementar(id: number | undefined): void {
    if (id === undefined) return;
    
    const item = this.items.find(i => i.producto.id === id);
    if (item) {
      this.carritoService.agregarProducto(item.producto);
    }
  }

  decrementar(id: number | undefined): void {
    if (id === undefined) return;
    
    const item = this.items.find(i => i.producto.id === id);
    if (item && item.cantidad > 1) {
      this.carritoService.quitarProducto(id);
      setTimeout(() => {
        this.carritoService.agregarProducto(item.producto);
      }, 10);
    } else if (item && item.cantidad === 1) {
      this.quitar(id);
    }
  }

  total(): number {
    return this.carritoService.total();
  }

  vaciarCarrito(): void {
    this.carritoService.limpiarCarrito();
  }

  realizarPedido(): void {
    if (this.items.length === 0) return;

    this.compraService.checkout(this.items).subscribe({
      next: (res: CompraResponse) => {
        alert(`🐠 ¡Compra realizada con éxito! ID: ${res.compraId}`);
        this.vaciarCarrito();
      },
      error: (err: unknown) => {
        console.error('Error en checkout:', err);
        alert('🐡 Error al procesar la compra');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}