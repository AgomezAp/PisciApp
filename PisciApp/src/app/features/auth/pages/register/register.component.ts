import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
declare const google: any;
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
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
  ngOnInit(): void {
    this.loadGoogleScript().then(() => {
      // inicializa Google solo cuando el script ya está cargado
      google.accounts.id.initialize({
        client_id:
          '686048642614-rn8l8btsrt7cfg16chpukrmk39n6g3vn.apps.googleusercontent.com', // ⚡ pon aquí tu client_id
        callback: (resp: any) => this.handleGoogleResponse(resp),
      });

      google.accounts.id.renderButton(document.getElementById('google-btn'), {
        theme: 'outline', // outline | filled_blue | filled_black
        size: 'large', // small | medium | large
        text: 'continue_with', // o 'signin_with'
        locale: 'es', // para el idioma
        shape: 'rectangular', // o pill
      });
    });
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
    loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = 'google-script';
      if (document.getElementById(id)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = id;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  // 👇 callback cuando Google devuelve el idToken
  handleGoogleResponse(response: any) {
    console.log('✅ Google ID Token recibido:', response.credential);

    this.authService.loginWithGoogle(response.credential).subscribe({
      next: () => {
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        console.error('❌ Error login con Google:', err);
      },
    });
  }
}
