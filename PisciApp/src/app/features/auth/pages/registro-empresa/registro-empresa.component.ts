import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EmpresaService } from '../../../../core/services/empresa.service';

@Component({
  selector: 'app-registro-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './registro-empresa.component.html',
  styleUrl: './registro-empresa.component.css'
})
export class RegistroEmpresaComponent implements OnInit {
  empresaForm!: FormGroup;
  especiesSeleccionadas: string[] = [];
  actividadesSeleccionadas: string[] = [];
  nuevaEspecie: string = '';
  nuevaActividad: string = '';
  cargando: boolean = false;
  formSubmitted: boolean = false;
  usuario_id: number = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private empresaService: EmpresaService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.notificationService.error('Debe iniciar sesión primero');
      this.router.navigate(['/login']);
      return;
    }
    this.usuario_id = user.id;

    // Inicializar formulario
    this.empresaForm = this.fb.group({
      nombre: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      departamento: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      codigo_postal: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      pais: ['', [Validators.required]]
    });
  }

  agregarEspecie(): void {
    const especie = this.nuevaEspecie.trim();
    if (especie && !this.especiesSeleccionadas.includes(especie)) {
      this.especiesSeleccionadas.push(especie);
      this.nuevaEspecie = '';
    }
  }

  eliminarEspecie(especie: string): void {
    this.especiesSeleccionadas = this.especiesSeleccionadas.filter(e => e !== especie);
  }

  agregarActividad(): void {
    const actividad = this.nuevaActividad.trim();
    if (actividad && !this.actividadesSeleccionadas.includes(actividad)) {
      this.actividadesSeleccionadas.push(actividad);
      this.nuevaActividad = '';
    }
  }

  eliminarActividad(actividad: string): void {
    this.actividadesSeleccionadas = this.actividadesSeleccionadas.filter(a => a !== actividad);
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.empresaForm.invalid) {
      this.notificationService.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (this.especiesSeleccionadas.length === 0) {
      this.notificationService.error('Debe agregar al menos una especie');
      return;
    }

    this.cargando = true;

    const empresaData = {
      usuario_id: this.usuario_id,
      ...this.empresaForm.value,
      especies: this.especiesSeleccionadas,
      actividad: this.actividadesSeleccionadas
    };

    this.empresaService.crearEmpresa(empresaData).subscribe({
      next: () => {
        this.notificationService.success('Empresa registrada exitosamente');
        this.router.navigate(['/inicioPerfil']);
      },
      error: (err) => {
        console.error('Error al registrar empresa:', err);
        this.notificationService.error(err.error?.error || 'Error al registrar la empresa');
        this.cargando = false;
      }
    });
  }
}
