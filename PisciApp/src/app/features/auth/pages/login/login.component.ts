import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { TwofaService } from '../../../../core/services/twofa.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;
  showTwofa = false;
  twofaCode: string = '';
  userId: number | null = null;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private twofaService: TwofaService
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = null; // Limpiar error anterior

      this.loginForm.get('contrasena')?.setErrors(null);

      const formValues = { ...this.loginForm.value };

      this.authService.login(formValues).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.requires2FA) {
            // Caso login con 2FA habilitado ⚡
            this.showTwofa = true; // flag UI
            this.userId = response.userId; // guardamos userId para el paso 2FA
          } else {
            // Caso login normal ✅
            this.router.navigate(['/inventory']);
          }
        },
        error: (error) => {
          this.loading = false;

          console.error('Error de login:', error.message);

          this.errorMessage = error.message;

          // Errores específicos
          if (error.message.toLowerCase().includes('credencial')) {
            this.loginForm
              .get('contrasena')
              ?.setErrors({ backend: error.message });
          } else if (
            error.message.toLowerCase().includes('correo') ||
            error.message.toLowerCase().includes('email')
          ) {
            this.loginForm.get('correo')?.setErrors({ backend: error.message });
          } else {
            this.errorMessage = error.message; // Error general
          }
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
  verificar2FA() {
    if (!this.userId || !this.twofaCode) return;

    this.twofaService.verificarLogin(this.userId, this.twofaCode).subscribe({
      next: (res) => {
        // 🚀 Guardar token de acceso
        localStorage.setItem('accessToken', res.accessToken);
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Error al validar 2FA';
      },
    });
  }
  // 🔥 Método auxiliar para limpiar errores cuando el usuario empiece a escribir
  onInputChange() {
    if (this.errorMessage) {
      this.errorMessage = null;
    }

    // Limpiar errores de backend cuando el usuario modifique los campos
    const correoControl = this.loginForm.get('correo');
    const contrasenaControl = this.loginForm.get('contrasena');

    if (correoControl?.errors?.['backend']) {
      const errors = { ...correoControl.errors };
      delete errors['backend'];
      correoControl.setErrors(Object.keys(errors).length ? errors : null);
    }

    if (contrasenaControl?.errors?.['backend']) {
      const errors = { ...contrasenaControl.errors };
      delete errors['backend'];
      contrasenaControl.setErrors(Object.keys(errors).length ? errors : null);
    }
  }
}
