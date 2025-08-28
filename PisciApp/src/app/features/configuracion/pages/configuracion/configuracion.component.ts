import { Component, OnDestroy, OnInit } from '@angular/core';
import { TwofaService } from '../../../../core/services/twofa.service';
import { AuthService, User } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-configuracion',
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    MatExpansionModule,
    MatFormFieldModule, // 👈 Asegúrate de tener estos
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  standalone: true,
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
})
export class ConfiguracionComponent implements OnInit, OnDestroy {
  activeTab: string = 'perfil';

  user: User | null = null; // 👈 usuario real desde el AuthService
  private sub!: Subscription;

  // otras preferencias
  notiEmail: boolean = false;
  notiAlertas: boolean = false;
  tema: string = 'claro';
  idioma: string = 'es';

  qrCodeUrl: string | null = null;
  tokenInput: string = '';
  constructor(
    private authService: AuthService,
    private twofaService: TwofaService
  ) {}

  ngOnInit(): void {
    // me suscribo al usuario real
    this.sub = this.authService.currentUser$.subscribe((u) => {
      if (u) {
        this.user = { ...u }; // clonar para edición local
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  // método de guardar cambios (ejemplo)
  actualizarPerfil() {
    console.log('Datos actualizados:', this.user);
    // aquí deberías llamar a un servicio que pegue al backend:
    // this.http.put(`${apiUrl}/users/${this.user.id}`, this.user)...
  }
  activar2FA() {
    this.twofaService.activar().subscribe({
      next: (res) => {
        this.qrCodeUrl = res.qrCodeUrl; // Mostrar el QR en template
      },
      error: () => alert('Error al activar 2FA'),
    });
  }

  confirmar2FA() {
    this.twofaService.confirmar(this.tokenInput).subscribe({
      next: (res) => {
        if (res.success) {
          this.user!.twofa_enabled = res.twofa_enabled;
          this.qrCodeUrl = null;
          this.tokenInput = '';
        }
      },
    });
  }

  desactivar2FA() {
    this.twofaService.desactivar(this.tokenInput).subscribe({
      next: (res) => {
        if (res.success) {
       this.user!.twofa_enabled = false;
          this.tokenInput = '';
        }
      },
    });
  }
}
