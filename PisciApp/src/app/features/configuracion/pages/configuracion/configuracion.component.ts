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
import { UsuarioService } from '../../../../core/services/usuario.service';
import { EmpresaService } from '../../../../core/services/empresa.service';
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

  empresa: any = {
    nombre: '',
    direccion: '',
    departamento: '',
    ciudad: '',
    codigo_postal: '',
    pais: '',
    especies: [],
    actividad: []
  };
  isUpdatingEmpresa: boolean = false;
  isLoadingEmpresa: boolean = false;


  constructor(
    private authService: AuthService,
    private twofaService: TwofaService,
    private notification: NotificationService,
    private preferenciaService: PreferenciaService,
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe((u) => {
      if (u) {
        this.user = { ...u };
        this.notiEmail = u.noti_email ?? false;
        this.notiAlertas = u.noti_alertas ?? false;
        this.tema = u.tema ?? 'claro';
        this.idioma = u.idioma ?? 'es';
        this.cargarEmpresa();
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

  actualizarEmpresa(): void {
    if (!this.user?.id) {
      this.notification.error('Sin acceso debes iniciar sesion');
      return;
    }

    this.isUpdatingEmpresa = true;

    const datosEmpresa = {
      nombre: this.empresa.nombre,
      direccion: this.empresa.direccion,
      departamento: this.empresa.departamento,
      ciudad: this.empresa.ciudad,
      codigo_postal: this.empresa.codigo_postal,
      pais: this.empresa.pais,
      especies: Array.isArray(this.empresa.especies) ?
        this.empresa.especies :
        (this.empresa.especies ? JSON.parse(this.empresa.especies) : []),
      actividad: Array.isArray(this.empresa.actividad) ?
        this.empresa.actividad :
        (this.empresa.actividad ? JSON.parse(this.empresa.actividad) : [])
    };

    console.log("DATOS EMPRESASS",datosEmpresa)

    this.empresaService.editarEmpresa(datosEmpresa, this.user.id).subscribe({
      next: (response) => {
        this.notification.success('Informacio Actualizada');
        this.isUpdatingEmpresa = false;
        this.cargarEmpresa();
      },
      error: (err) => {
        console.error('Error al actualizar');
        this.isUpdatingEmpresa = false;
      }
    });
  }

  cargarEmpresa(): void {
    if (!this.user?.id) {
      this.notification.error('Sin acceso debes iniciar sesion');
      return;
    }

    this.isLoadingEmpresa = true;
    this.empresaService.verEmpresa(this.user.id).subscribe({
      next: (data) => {
        if (data) {
          this.empresa = {
            nombre: data.nombre || '',
            direccion: data.direccion || '',
            departamento: data.departamento || '',
            ciudad: data.ciudad || '',
            codigo_postal: data.codigo_postal || '',
            pais: data.pais || '',
            especies: data.especies ?
              (Array.isArray(data.especies) ? data.especies : JSON.parse(data.especies)) : [],
            actividad: data.actividad ?
              (Array.isArray(data.actividad) ? data.actividad : JSON.parse(data.actividad)) : [],
          };
        }
        this.isLoadingEmpresa = false;
      },
      error: (err) => {
        console.error('Error cargando empresa:', err);
        this.isLoadingEmpresa = false;
      }
    });
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
  actualizarPerfil() {
    if (!this.user) return;

    this.usuarioService
      .updateProfile({
        nombre: this.user.nombre,
        telefono: this.user.telefono,
        ciudad: this.user.ciudad,
        departamento: this.user.departamento,
        foto_perfil: this.user.foto_perfil,
      })
      .subscribe({
        next: (res) => {
          this.notification.success('Perfil actualizado correctamente');
          this.authService.getProfile().subscribe(); // ⚡ refresca datos en frontend
        },
        error: (err) => {
          this.notification.error('Error al actualizar perfil');
          console.error(err);
        },
      });
  }
  onFotoPerfilChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.usuarioService.subirFotoPerfil(file).subscribe({
        next: (res) => {
          this.user!.foto_perfil = res.url; // se actualiza a la URL del servidor
          this.notification.success('Foto actualizada correctamente');
        },
        error: () => this.notification.error('Error subiendo foto'),
      });
    }
  }
}
