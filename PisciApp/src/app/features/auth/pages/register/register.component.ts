import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // 👉 Regex de contraseña fuerte (igual que el backend)
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    this.registerForm = this.fb.group(
      {
        nombre: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        telefono: [
          '',
          [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)],
        ],
        departamento: ['', Validators.required],
        ciudad: ['', Validators.required],
        contrasena: [
          '',
          [Validators.required, Validators.pattern(strongPasswordRegex)], // 👈 aquí validamos igual que backend
        ],
        confirmarContrasena: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      {
        validators: this.passwordsMatchValidator, // 👈 validador custom
      }
    );
  }

  // 👇 Validador personalizado para comparar contraseñas
  private passwordsMatchValidator(form: FormGroup) {
    const contrasena = form.get('contrasena')?.value;
    const confirmarContrasena = form.get('confirmarContrasena')?.value;
    return contrasena === confirmarContrasena
      ? null
      : { passwordsMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { confirmarContrasena, terms, ...userData } = this.registerForm.value;

    this.loading = true;
    this.errorMessage = null;

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/verify-email'], {
          queryParams: { correo: userData.correo },
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'No se pudo registrar';
      },
    });
  }

  onRegisterWithGoogle() {
    this.authService.registerWithGoogle();
  }
}
