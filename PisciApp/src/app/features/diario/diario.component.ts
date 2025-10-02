import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { TanqueService } from '../../core/services/tanque.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { CicloService } from '../../core/services/ciclo.service';
@Component({
  selector: 'app-diario',
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './diario.component.html',
  styleUrl: './diario.component.css'
})
export class DiarioComponent implements OnInit {
  usuario_id: number = 0;
  tanques: any[] = [];
  ciclos: any[] = [];
  mediciones: any[] = [];
  historial: any[] = [];
  ultimaMedicion: any = {};
  tanque_id: number = 0;
  ciclo_id: number = 0;
  mostrarhistorial: boolean = false


  calidadAgua: { [key: string]: number | null } = {
    temperatura: null,
    oxigeno_disuelto: null,
    ph: null,
    nitritos: null,
    amoniaco: null,
    nitratos: null,
    dureza: null,
    salinidad: null
  };
  nuevoAlimento = {
    cantidad: 0,
    costo: 0,
    nombre: '',
    descripcion: ''
  };
  nuevoBajas = {
    cantidad: 0,
    tanque_id: 0
  };


  constructor(
    private authService: AuthService,
    private tanqueService: TanqueService,
    private notificacionService: NotificationService,
    private cicloService: CicloService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;

    this.tanqueService.obtenerTanquesPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        this.tanques = data;
        console.log('tanques', this.tanques);
      },
      error: (err) => {
        console.error(err)
      }
    });
    this.cicloService.obtenerCicloPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        this.ciclos = data
        console.log('ciclos', this.ciclos);

      },
      error: (err) => {
        console.error(err)
      }
    })
  }
  onTanqueChange() {
    this.getMediciones(Number(this.tanque_id));
    let cicloEncontrado = null;
    for (const ciclo of this.ciclos) {
      if (Array.isArray(ciclo.ciclotanques_ciclo)) {
        const lista = Array.isArray(ciclo.ciclotanques_ciclo)
          ? ciclo.ciclotanques_ciclo : Object.values(ciclo.ciclotanques_ciclo);
        const relacion = lista.find(
          (t: any) => Number(t.tanque_id) === Number(this.tanque_id));
        if (relacion) {
          cicloEncontrado = ciclo;
          break;
        }
      }
    }
    this.ciclo_id = cicloEncontrado ? cicloEncontrado.id : null;
    this.tablaHistorial(Number(this.tanque_id), this.ciclo_id);

    console.log(this.ciclo_id)
  }
  getTanqueNombre(tanque_id: number): string {
    const tanque = this.tanques?.find(t => t.id === tanque_id);
    return tanque?.nombre || ('Tanque ' + tanque_id);
  }

  getMediciones(tanque_id: number): void {
    console.log("Si las mediciones");
    this.tanqueService.obtenerMedicionesTanque(tanque_id).subscribe({
      next: (data) => {
        this.mediciones = data;
        if (this.mediciones.length > 0) {
          this.ultimaMedicion = [this.mediciones[this.mediciones.length - 1]];
        } else {
          this.ultimaMedicion = [{
            temperatura: 0,
            oxigeno_disuelto: 0,
            ph: 0,
            nitritos: 0,
            amoniaco: 0,
            nitratos: 0,
            dureza: 0,
            salinidad: 0
          }];
        }
        console.log('Ultima mediciones', this.ultimaMedicion)
      } 
    })
  }

  getSemaforo(param: string, valor: number): 'rojo' | 'amarillo' | 'verde' {
    switch (param) {
      case 'temperatura':
        if (valor < 20 || valor > 32) return 'rojo';
        if ((valor >= 20 && valor < 24) || (valor > 30 && valor <= 32)) return 'amarillo'
        return 'verde';
      case 'oxigeno':
        if (valor < 3) return 'rojo';
        if (valor >= 3 && valor <= 5) return 'amarillo'
        return 'verde';
      case 'ph':
        if (valor < 6 || valor > 9) return 'rojo';
        if ((valor >= 6 && valor < 6.5) || (valor > 8.5 && valor <= 9)) return 'amarillo'
        return 'verde';
      case 'nitritos':
        if (valor >= 1) return 'rojo';
        if (valor >= 0.25 && valor < 1) return 'amarillo'
        return 'verde';
      case 'amoniaco':
        if (valor > 0.05) return 'rojo';
        if (valor >= 0.02 && valor <= 0.05) return 'amarillo'
        return 'verde';
      case 'nitratos':
        if (valor > 100) return 'rojo';
        if (valor > 50 && valor <= 100) return 'amarillo'
        return 'verde';
      case 'dureza':
        if (valor < 50 || valor > 300) return 'rojo';
        if ((valor >= 50 && valor < 100) || (valor > 250 && valor <= 300)) return 'amarillo'
        return 'verde';
      case 'salinidad':
        if (valor > 1) return 'rojo';
        if (valor > 0.5) return 'amarillo';
        return 'verde'
      default:
        return 'verde';
    }
  }

  getCalidadAguaGlobal(): string {
    const params = Object.keys(this.calidadAgua);
    let verdes = 0, amarillos = 0, rojos = 0;

    for (const param of params) {
      const valor = this.calidadAgua[param] ?? 0;
      const color = this.getSemaforo(param, valor);
      if (color === 'verde') verdes++;
      else if (color === 'amarillo') amarillos++;
      else if (color === 'rojo') rojos++;
    }
    if (rojos >= 1) return 'Critico';
    if (amarillos >= 3) return 'Alto Riesgo';
    if (amarillos > 0) return 'Vigilancia';
    return 'Optimo'
  }

  get calidadAguaParams(): string[] {
    return Object.keys(this.calidadAgua);
  }
  tieneDatosCalidadAgua(): boolean {
    return Object.values(this.calidadAgua).some(v => v !== null && v !== undefined);
  }

  formatearParametro(param: string): string {
    return param.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  getPlanAccion(param: string, color: 'rojo' | 'amarillo' | 'verde'): string {
    switch (param) {
      case 'temperatura':
        if (color === 'rojo') return 'Cambio de agua gradual y aislar el tanque del clima.';
        if (color === 'amarillo') return 'Reducir la alimentación y monitorear 3 veces al día.';
        return 'Mantener rutina y registrar diario.';
      case 'oxigeno_disuelto':
        if (color === 'rojo') return '¡Emergencia! Parar comida, máxima aireación y cambio de agua.';
        if (color === 'amarillo') return 'Reducir comida, aumentar aireación y medir cada 3 horas.';
        return 'Mantener aireación y limpiar difusores.';
      case 'ph':
        if (color === 'rojo') return 'Cambio de agua parcial y usar buffer natural (piedra caliza/turba) GRADUAL';
        if (color === 'amarillo') return 'Verificar y corregir la alcalinidad (dureza carbonatada).';
        return 'pH óptimo.';
      case 'nitritos':
        if (color === 'rojo') return 'Cambio de agua grande y añadir sal común (1-2 gramos por litro).';
        if (color === 'amarillo') return 'Cambio de agua del 20% y añadir sal preventiva (0.5 g/L).';
        return 'Mantener buen oxígeno para las bacterias.';
      case 'amoniaco':
        if (color === 'rojo') return 'Cambio de agua grande y usar neutralizador químico de emergencia.';
        if (color === 'amarillo') return 'Cambio de agua del 20% y reducir la comida a la mitad.';
        return 'No sobrealimentar y mantener el filtro biológico.';
      case 'nitratos':
        if (color === 'rojo') return 'Cambios de agua frecuentes (25-30%) hasta bajar.';
        if (color === 'amarillo') return 'Cambio de agua programado del 15% semanal.';
        return 'Mantener cambios de agua regulares.';
      case 'dureza':
        if (color === 'rojo') return 'Cambiar fuente de agua o usar agua osmotizada para ajustar.';
        if (color === 'amarillo') return 'Ajustar gradualmente con cambios de agua.';
        return 'Mantener fuente de agua estable.';
      case 'salinidad':
        if (color === 'rojo') return 'Ajustar muy lentamente (1-2 ppt por día) con cambios de agua.';
        if (color === 'amarillo') return 'Ajustar lentamente hacia el centro del rango ideal.';
        return 'Salinidad óptima.';
      default:
        return '';
    }
  }

  guardarDiario() {
    console.log(this.tanque_id)
    console.log(this.calidadAgua)
    console.log(this.nuevoAlimento)
    console.log(this.nuevoBajas)
    console.log(this.ciclo_id)

    const calidadAguaCompleta = Object.values(this.calidadAgua).every(v => v !== null && v !== undefined);
    if (calidadAguaCompleta) {
      this.tanqueService.crearMediciones(this.tanque_id, this.calidadAgua).subscribe({
        next: () => this.notificacionService.success('Mediciones de calidad guardadas correctamente'),
        error: () => this.notificacionService.error('Error al guardar mediciones de calidad')
      });
    } else {
      this.notificacionService.error('Las mediciones de calidad no se guardaron correctamente')
    }

    if (this.ciclo_id) {
      const alimentoCompleto = Object.values(this.nuevoAlimento).every(v => v !== null && v !== undefined && v !== '');
      if (!alimentoCompleto) {
        this.cicloService.ingresarAlimento(this.nuevoAlimento, this.ciclo_id).subscribe({
          next: () => this.notificacionService.success("Alimentación guardada correctamente"),
          // error: () => this.notificacionService.error("Error al guardar alimentación")
        });
      } else {
        this.notificacionService.error('La alimentacion no se guardo correctamente')
      }

      const bajasCompleto = Object.values(this.nuevoAlimento).every(v => v !== null && v !== undefined && v !== '');
      if (!bajasCompleto) {
        this.cicloService.actualizarBajas(this.nuevoBajas, this.ciclo_id).subscribe({
          next: () => this.notificacionService.success("Bajas guardadas correctamente"),
          // error: () => this.notificacionService.error("Error al guardar bajas")
        });
      } else {
        this.notificacionService.error('Las bajas no se guardaron correctamente')
      }
    }
  }

  tablaHistorial(tanque_id: number, ciclo_id: number) {
    if (!Array.isArray(this.mediciones)) {
      this.historial = [];
      console.log('No mhay')
      return;
    }
    console.log(this.mediciones, tanque_id, ciclo_id)
    const medicionesTanque = this.mediciones;
    console.log("medicionesTanque", medicionesTanque)
    // Filtra el ciclo actual
    const cicloActual = this.ciclos.find((c: any) => c.id === ciclo_id);

    this.historial = medicionesTanque.map((medicion: any) => {
      // Buscar alimento y bajas solo en el ciclo actual
      const alimento = cicloActual?.alimentos?.find(
        (a: any) => a.fecha === medicion.fecha && Number(a.tanque_id) === Number(tanque_id)
      ) || null;

      const bajas = cicloActual?.bajas?.find(
        (b: any) => b.fecha === medicion.fecha && Number(b.tanque_id) === Number(tanque_id)
      ) || null;

      return {
        tanque_id: medicion.tanque_id,
        calidadAgua: {
          temperatura: medicion.temperatura,
          oxigeno_disuelto: medicion.oxigeno_disuelto,
          ph: medicion.ph
        },
        alimento: alimento,
        bajas: bajas
      };
    });
    console.log("thishistorial", this.historial);
  }

  mostrarHistorialF() {
    this.mostrarhistorial = !this.mostrarhistorial
  }
}
