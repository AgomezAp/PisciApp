import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TanqueService } from '../../core/services/tanque.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CicloService } from '../../core/services/ciclo.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-inicio',
  imports: [NavbarComponent, NgFor, NgIf, FormsModule, DatePipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit{
  tanques: any[] = [];
  ciclos: any = null;
  usuario_id = 0;
  tanquesDisponibles = 0;
  mostrarModal = false;
  nuevoTanque = {
    nombre: '',
    volumen: 0,
    tipoTanque: ''
  };

  constructor(
    private tanqueService: TanqueService,
    private cicloService: CicloService,
    private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;
    console.log(this.usuario_id)
    this.tanqueService.obtenerTanquesPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        this.tanques = data;
        this.tanquesDisponibles = this.tanques.filter(tanque => tanque.disponible === true).length;
        console.log(data);
      },
      error: (err) => {
        console.error(err)
      }
    })
    this.cicloService.obtenerCicloPorUsuario(this.usuario_id).subscribe({
  next: (data) => {
    // Si data es un objeto, conviértelo en array
    if (Array.isArray(data)) {
      this.ciclos = data;
    } else if (data) {
      this.ciclos = [data];
    } else {
      this.ciclos = [];
    }
    console.log(this.ciclos.length);
    console.log(this.ciclos);
  },
  error: (err) => {
    console.error(err)
  }
});

  }

  abrirModal() {
    this.mostrarModal = true;
    this.nuevoTanque = { nombre: '', volumen: 0, tipoTanque: ''};
  }
  cerrarModal() {
    this.mostrarModal =false;
  }

  agregarTanque() {
    const datos = {
      ...this.nuevoTanque,
      usuario_id: this.usuario_id
    };
    this.tanqueService.crearTanque(datos).subscribe({
      next: (tanque) => {
        this.tanques.push(tanque);
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
