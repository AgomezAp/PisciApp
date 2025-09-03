import { Component, Input } from '@angular/core';
import { TwofaService } from '../../../../core/services/twofa.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-twofa',
  imports: [CommonModule,FormsModule],
  templateUrl: './twofa.component.html',
  styleUrl: './twofa.component.css',
})
export class TwofaComponent {
  @Input() userId!: number;
  code: string = '';
  error: string | null = null;

  constructor(private twofaService: TwofaService, private router: Router) {}

  verificar() {
    this.twofaService.verificarLogin(this.userId, this.code).subscribe({
      next: (res) => {
        // guardar el access token en local/session storage
        localStorage.setItem('accessToken', res.accessToken);
        this.router.navigate(['/inventory']); // redirige a la app
      },
      error: (err) => {
        this.error = err.message || 'Error al verificar 2FA';
      },
    });
  }
}
