import { Component, OnInit } from '@angular/core';
import { TanqueService } from '../../core/services/tanque.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CicloService } from '../../core/services/ciclo.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-inicio',
  imports: [NgFor, NgIf, FormsModule, DatePipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  tanques: any[] = [];
  tanquesDisponibles: any[] = [];
  ciclos: any = null;
  usuario_id = 0;
  tanquesDisponiblesCantidad = 0;
  mostrarModalTanque = false;
  mostrarModalCiclo = false;
  supervivencia = 0;
  especiesDisponibles: string[] = ['Tilapia', 'Carpa', 'Salmón', 'Trucha', 'Bagre', 'Rodaballo', 'Bacalao', 'Atún'];
  tipoTanques: string[] = ['Estanque de manantial', 'Estanque de arroyo o río' , 'Estanque de lluvia', 'Estanque de tierra',
    'Estanque de concreto', 'Estanque con geomembrana', 'Estanque de fibra de vidrio', 'Estanque de reproducción', 'Estanque de alevinaje',
    'Estanque de cría', 'Estanque de engorde', 'Estanque de almacenamiento', 'Estanque de cuarentena'];
  especies: string[] = []
  costoUnidad: number = 0;

  nuevoTanque = {
  forma: '',
  profundidad: 0,
  largo: 0,
  ancho: 0,
  diametro: 0,
  tipoTanque: ''
  };
  nuevoCiclo = {
    tanques: 0,
    numero_peces: 0,
    costos: 0,
    costos_transporte: 0,
    especie: "",
    fecha_inicio: ""
  };

  constructor(
    private tanqueService: TanqueService,
    private cicloService: CicloService,
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;
    this.tanqueService.obtenerTanquesPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        this.tanques = data;
        console.log(this.tanques)
        this.tanquesDisponibles = this.tanques.filter(tanque => tanque.disponible === true);
        this.tanquesDisponiblesCantidad = this.tanques.filter(tanque => tanque.disponible === true).length;
        console.log(this.tanquesDisponibles)

      },
      error: (err) => {
        console.error(err)
      }
    });
    this.cicloService.obtenerCicloPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        console.log('el ciclo', data)
        console.log('el ciclo id', this.usuario_id)

        if (Array.isArray(data)) {
          this.ciclos = data;
        } else if (data) {
          this.ciclos = [data];
        } else {
          this.ciclos = [];
        }
        this.especies = Array.from(new Set(this.ciclos.map((ciclo: any) => ciclo.especie).filter((e: any) => !!e)))
        if (this.ciclos.length > 0) {
          const cicloActual = this.ciclos[this.ciclos.length - 1];
            this.supervivencia = ((cicloActual.total_bajas ?? 0) / cicloActual.numero_peces) * 100;
        } else {
          this.supervivencia = -1;
        }
        console.log('el ciclo', data)
      },
      error: (err) => {
        console.error(err)
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['abrirModalCiclo'] === 'true') {
        this.abrirModalCiclo();
        this.router.navigate(['/inicio'], {replaceUrl: true})
      }
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['abrirModalTanque'] === 'true') {
        this.abrirModalTanque();
        this.router.navigate(['/inicio'], {replaceUrl: true})
      }
    })
  }

  abrirModalTanque() {
    this.mostrarModalTanque = true;
    this.nuevoTanque = {forma: '',
      profundidad: 0,
      largo: 0,
      ancho: 0,
      diametro: 0,
      tipoTanque: ''};
  }
  cerrarModalTanque() {
    this.mostrarModalTanque = false;
  }
  abrirModalCiclo() {
    this.mostrarModalCiclo = true;
    this.nuevoCiclo = {tanques: 0,
      numero_peces: 0,
      costos: 0,
      costos_transporte: 0,
      especie: "",
      fecha_inicio: "" };
  }
  cerrarModalCiclo() {
    this.mostrarModalCiclo = false;
  }

  agregarTanque() {
    const datos = {
      ...this.nuevoTanque,
      usuario_id: this.usuario_id
    };
    this.tanqueService.crearTanque(datos).subscribe({
      next: (tanque) => {
        this.tanques.push(tanque);
        this.tanquesDisponibles = this.tanques.filter(tanque => tanque.disponible === true);
        this.tanquesDisponiblesCantidad = this.tanquesDisponibles.length;
        this.cerrarModalTanque();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  agregarCiclo() {
    this.nuevoCiclo.costos = this.nuevoCiclo.numero_peces * this.costoUnidad;
    const datos = {
      ...this.nuevoCiclo,
      tanques: Number(this.nuevoCiclo.tanques),
      usuario_id: this.usuario_id
    };
    console.log(datos)
    this.cicloService.crearCiclo(datos).subscribe({
      next: (ciclo) => {
        this.ciclos.push(ciclo);
        this.cerrarModalCiclo();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  infoTanque() {
    this.router.navigate(['/ciclos']);
  }
  infoCiclo() {
    this.router.navigate(['/ciclos']);
  }
}
