import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('nuevacontrasena');
  const confirm = control.get('confirmarcontrasena');
  if (!password || !confirm) return null;
  return password.value === confirm.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-contrasena-olvidada',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contrasena-olvidada.component.html',
  styleUrl: './contrasena-olvidada.component.css'
})
export class ContrasenaOlvidadaComponent implements OnInit {
  step: 'request' | 'reset' | 'done' = 'request';
  token: string | null = null;

  requestForm: FormGroup;
  resetForm: FormGroup;

  requestLoading = false;
  resetLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.requestForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group(
      {
        nuevacontrasena: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmarcontrasena: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (this.token) {
      this.step = 'reset';
    }
  }

  onRequestSubmit(): void {
    if (this.requestForm.invalid) return;
    this.requestLoading = true;
    this.errorMessage = '';

    const { correo } = this.requestForm.value;
    this.authService.forgotPassword(correo).subscribe({
      next: () => {
        this.requestLoading = false;
        this.step = 'done';
        this.successMessage = 'Te enviamos un enlace a tu correo para restablecer tu contraseña.';
      },
      error: (err: any) => {
        this.requestLoading = false;
        this.errorMessage = err.message || 'No se pudo enviar el correo. Intenta de nuevo.';
      },
    });
  }

  onResetSubmit(): void {
    if (this.resetForm.invalid || !this.token) return;
    this.resetLoading = true;
    this.errorMessage = '';

    const { nuevacontrasena } = this.resetForm.value;
    this.authService.resetPassword(this.token, nuevacontrasena).subscribe({
      next: () => {
        this.resetLoading = false;
        this.step = 'done';
        this.successMessage = '¡Contraseña restablecida con éxito! Redirigiendo al inicio de sesión...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err: any) => {
        this.resetLoading = false;
        this.errorMessage = err.message || 'El enlace es inválido o expiró. Solicita uno nuevo.';
      },
    });
  }
}
