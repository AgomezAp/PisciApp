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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
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
      this.errorMessage = null; // 🔥 Limpiar error anterior

      // 🔥 Limpiar errores anteriores del backend
      this.loginForm.get('contrasena')?.setErrors(null);

      const formValues = { ...this.loginForm.value };

      this.authService.login(formValues).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Login exitoso:', response);
          this.router.navigate(['/inventory']);
        },
        error: (error) => {
          this.loading = false;

          // 🔥 El servicio ErrorService ya procesó el error
          console.error('Error de login:', error.message);

          // ✅ Mostrar error general (opcional)
          this.errorMessage = error.message;

          // ✅ Mostrar error específico en el campo contraseña
          this.loginForm.get('contrasena')?.setErrors({
            backend: error.message,
          });

          // 🔥 Si quieres mostrar diferentes errores según el tipo:
          if (error.message.toLowerCase().includes('credencial')) {
            this.loginForm.get('contrasena')?.setErrors({
              backend: error.message,
            });
          } else if (
            error.message.toLowerCase().includes('correo') ||
            error.message.toLowerCase().includes('email')
          ) {
            this.loginForm.get('correo')?.setErrors({
              backend: error.message,
            });
          } else {
            // Error general
            this.errorMessage = error.message;
          }
        },
      });
    } else {
      // 🔥 Marcar todos los campos como tocados para mostrar errores
      this.loginForm.markAllAsTouched();
    }
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
