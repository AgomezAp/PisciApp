import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  userInitials: string = 'U';
  private sub!: Subscription;

  menuAbierto = false;
  sidebarColapsado = false;
  textoBusqueda: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe((u) => {
      this.user = u;
      this.userInitials = this.getInitials(u?.nombre || 'Usuario');
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  private getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenuMobile() {
    this.menuAbierto = false;
  }

  toggleSidebar() {
    this.sidebarColapsado = !this.sidebarColapsado;
    document.documentElement.style.setProperty(
      '--sidebar-width',
      this.sidebarColapsado ? '64px' : '260px'
    );
  }

  onBuscar() {
    if(this.textoBusqueda.trim()) {
      console.log('Buscando:', this.textoBusqueda);
    }
  }

  onEnterBusqueda(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onBuscar();
    }
  }

  perfil() {
    this.router.navigate(['/configuracion'])
  }
}
