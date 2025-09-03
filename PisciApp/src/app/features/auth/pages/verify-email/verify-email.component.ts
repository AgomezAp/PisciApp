import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent {
  verifyForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Inicializamos el form
    this.verifyForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      codigo: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });

    // 📩 Escuchamos query params
    this.route.queryParamMap.subscribe((params) => {
      const correo = params.get('correo');
      if (correo) {
        this.verifyForm.patchValue({ correo });
      }
    });
  }

  onSubmit() {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { correo, codigo } = this.verifyForm.value;

    this.authService.verifyEmail(correo, codigo).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Correo verificado con éxito 🎉';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error verificando el código';
      },
    });
  }
}
