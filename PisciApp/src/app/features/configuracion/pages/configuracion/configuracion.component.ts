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
import { NotificationService } from '../../../../core/services/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PreferenciaService } from '../../../../core/services/preferencias.service';
@Component({
  selector: 'app-configuracion',
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  standalone: true,
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css',
})
export class ConfiguracionComponent implements OnInit, OnDestroy {
  activeTab: string = 'perfil';

  user: User | null = null; // 👈 usuario real desde el AuthService
  private sub!: Subscription;
  isActivating2FA = false;
  isConfirming2FA = false;
  isDeactivating2FA = false;
  // otras preferencias
  notiEmail: boolean = false;
  notiAlertas: boolean = false;
  tema: string = 'claro';
  idioma: string = 'es';

  qrCodeUrl: string | null = null;
  tokenInput: string = '';
  constructor(
    private authService: AuthService,
    private twofaService: TwofaService,
    private notification: NotificationService,
    private preferenciaService: PreferenciaService
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe((u) => {
      if (u) {
        this.user = { ...u };
        this.notiEmail = u.noti_email ?? false;
        this.notiAlertas = u.noti_alertas ?? false;
        this.tema = u.tema ?? 'claro';
        this.idioma = u.idioma ?? 'es';
      }
    });

    // 👇 fuerza a traer siempre datos frescos desde backend
    this.authService.getProfile().subscribe();
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
    this.isActivating2FA = true;

    this.twofaService.activar().subscribe({
      next: (res) => {
        this.qrCodeUrl = res.qrCodeUrl;
        this.notification.info(
          'Escanea el código QR y confirma con tu app de autenticación.',
          '2FA activación'
        );
        this.isActivating2FA = false;
      },
      error: (error) => {
        this.notification.error('Error al activar 2FA');
        this.isActivating2FA = false;
        console.error('Error al activar 2FA:', error);
      },
    });
  }

  confirmar2FA() {
    // Validación básica
    if (!this.tokenInput || this.tokenInput.length < 6) {
      this.notification.error(
        'Por favor ingresa un código de 6 dígitos válido.'
      );
      return;
    }

    this.isConfirming2FA = true;

    this.twofaService.confirmar(this.tokenInput).subscribe({
      next: (res) => {
        if (res.success) {
          this.user!.twofa_enabled = res.twofa_enabled;
          this.qrCodeUrl = null;
          this.tokenInput = '';
          this.notification.success(
            'La verificación 2FA fue habilitada correctamente.'
          );
          this.isConfirming2FA = false;
        } else {
          this.notification.error(
            'No se pudo confirmar 2FA, intenta de nuevo.'
          );
          this.isConfirming2FA = false;
        }
      },
      error: (error) => {
        this.notification.error('El código ingresado no es válido.');
        this.isConfirming2FA = false;
        console.error('Error al confirmar 2FA:', error);
      },
    });
  }

  desactivar2FA() {
    // Validación básica
    if (!this.tokenInput || this.tokenInput.length < 6) {
      this.notification.error(
        'Por favor ingresa un código de 6 dígitos válido.'
      );
      return;
    }

    this.notification.confirm('¿Seguro que deseas desactivar el 2FA?', () => {
      this.isDeactivating2FA = true;

      this.twofaService.desactivar(this.tokenInput).subscribe({
        next: (res) => {
          if (res.success) {
            this.user!.twofa_enabled = false;
            this.tokenInput = '';
            this.notification.success(
              res.message || '2FA desactivado correctamente.'
            );
          } else {
            this.notification.error(
              res.message || 'No se pudo desactivar el 2FA.'
            );
          }
          this.isDeactivating2FA = false;
        },
        error: (error) => {
          this.notification.error('El código ingresado no es válido.');
          this.isDeactivating2FA = false;
          console.error('Error al desactivar 2FA:', error);
        },
      });
    });
  }

  cancelar2FA() {
    this.qrCodeUrl = null;
    this.tokenInput = '';
    this.isActivating2FA = false;
    this.isConfirming2FA = false;

    this.notification.info('Proceso de activación 2FA cancelado.');
  }

  cancelarDesactivacion() {
    this.tokenInput = '';
    this.isDeactivating2FA = false;

    this.notification.info('Cancelaste la desactivación del 2FA.');
  }
  guardarNotificaciones() {
    this.preferenciaService
      .actualizarPreferencias({
        noti_email: this.notiEmail,
        noti_alertas: this.notiAlertas,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.notification.success(res.message);
          } else {
            this.notification.error(res.message);
          }
        },
        error: (err) => {
          this.notification.error('Error al guardar notificaciones');
          console.error(err);
        },
      });
  }
  guardarPreferencias() {
    this.preferenciaService
      .actualizarPreferencias({
        tema: this.tema,
        idioma: this.idioma,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.notification.success(res.message);
          } else {
            this.notification.error(res.message);
          }
        },
        error: (err) => {
          this.notification.error('Error al guardar preferencias');
          console.error(err);
        },
      });
  }
}
