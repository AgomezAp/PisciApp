import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TanqueService } from '../../core/services/tanque.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { CicloService } from '../../core/services/ciclo.service';
import { forkJoin } from 'rxjs';
import { InventarioService } from '../../core/services/inventario.service';

@Component({
  selector: 'app-diario',
  imports: [CommonModule, FormsModule],
  templateUrl: './diario.component.html',
  styleUrl: './diario.component.css'
})
export class DiarioComponent implements OnInit {
  usuario_id: number = 0;
  tanques: any[] = [];
  ciclos: any[] = [];
  mediciones: any[] = [];
  historial: any[] = [];
  alimentos: any[] = [];
  quimicos: any[] = [];
  bajas: any[] = [];
  ultimaMedicion: any = null;
  tanque_id: number = 0;
  ciclo_id: number = 0;
  mostrarHistorial: boolean = false;
  cargando: boolean = false;
  inventario: any[] = [];
  alimentoInventario: any[] = [];
  quimicoInventario: any[] = [];

  calidadAgua: { [key: string]: number | null } = {
    temperatura: null,
    oxigeno_disuelto: null,
    ph: null,
    nitritos: null,
    amoniaco: null,
    nitratos: null,
    salinidad: null
  };

  causasBajas: string[] = ['Aparece flotando', 'Ajuste de inventario', 'Traslado']

  readonly calidadAguaParams: string[] = [
    'temperatura',
    'oxigeno_disuelto',
    'ph',
    'nitritos',
    'amoniaco',
    'nitratos',
    'salinidad'
  ];

  constructor(
    private authService: AuthService,
    private tanqueService: TanqueService,
    private notificacionService: NotificationService,
    private cicloService: CicloService,
    private inventarioService: InventarioService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
    this.agregarAlimento();
    this.agregarQuimico();
    this.agregarBaja();
  }

  agregarAlimento(): void {
    this.alimentos.push({
      cantidad: null as number | null,
      costo: null as number | null,
      costo_insumo_total: null as number | null,
      cantidad_unidades: null as number | null,
      peso_por_unidad: null as number | null,
      total_kg_disponible: null as number | null,
      costo_por_kg: null as number | null,
      unidad_medida: null as string | null, 
      nombre: '',
      descripcion: ''
    });
  }

  eliminarAlimento(index: number): void {
    if (this.alimentos.length > 1){
      this.alimentos.splice(index, 1);
    }
  }

  agregarQuimico(): void {
    this.quimicos.push({
      cantidad: null as number | null,
      costo: null as number | null,
      costo_insumo_total: null as number | null,
      cantidad_unidades: null as number | null,
      peso_por_unidad: null as number | null,
      total_kg_disponible: null as number | null,
      costo_por_kg: null as number | null,
      unidad_medida: null as string | null,
      nombre: '',
      descripcion: ''
    });
  }

  eliminarQuimico(index: number): void {
    if (this.quimicos.length > 1){
      this.quimicos.splice(index, 1);
    }
  }

  agregarBaja(): void {
    this.bajas.push({
      cantidad: null as number | null,
      causas: ''
    });
  }

  eliminarBaja(index: number): void {
    if (this.bajas.length > 1){
      this.bajas.splice(index, 1);
    }
  }

  private cargarDatos(): void {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;
    console.log(this.usuario_id)
    this.cargando = true;
    forkJoin({
      tanques: this.tanqueService.obtenerTanquesPorUsuario(this.usuario_id),
      ciclos: this.cicloService.obtenerCicloPorUsuario(this.usuario_id),
      inventario: this.inventarioService.obtenerInventario(),
    }).subscribe({
      next: (data) => {
        this.tanques = data.tanques;
        this.ciclos = Array.isArray(data.ciclos) ? data.ciclos : [data.ciclos];
        this.inventario = data.inventario;
        this.cargando = false;
        
        this.alimentoInventario = this.inventario.filter(item =>
          item.tipo_material === 'Alimento'
        )
        this.quimicoInventario = this.inventario.filter(item =>
          item.tipo_material === 'Quimico'
        )
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.notificacionService.error('Error al cargar datos iniciales');
        this.cargando = false;
      }
    });
  }

  onAlimentoSeleccionado(event: any, index: number): void {
    const nombreSeleccionado = event.target.value;
    
    if (!nombreSeleccionado || nombreSeleccionado === '') {
      this.alimentos[index] = {
        cantidad: null,
        costo: null,
        costo_insumo_total: null,
        cantidad_unidades: null,
        peso_por_unidad: null,
        total_kg_disponible: null,
        costo_por_kg: null,
        unidad_medida: null,
        nombre: '',
        descripcion: ''
      };
      return;
    }
    const alimento = this.alimentoInventario.find(a => 
      (a.nombre) === nombreSeleccionado
    );
    if (alimento) {
      this.alimentos[index].nombre = nombreSeleccionado;
      
      const costoTotal = alimento.costo_insumo  || 0;
      const cantidadUnidades = alimento.cantidad  || 1;
      const pesoPorUnidad = alimento.peso_unidad  || 1;
      const unidadMedida = alimento.unidad_medida  || 'kg';
    
      const totalDisponible = cantidadUnidades * pesoPorUnidad;
      const costoPorUnidad = totalDisponible > 0 ? costoTotal / totalDisponible : 0;
      
      this.alimentos[index].costo_insumo_total = costoTotal;
      this.alimentos[index].cantidad_unidades = cantidadUnidades;
      this.alimentos[index].peso_por_unidad = pesoPorUnidad;
      this.alimentos[index].total_kg_disponible = totalDisponible;
      this.alimentos[index].costo_por_kg = costoPorUnidad;
      this.alimentos[index].unidad_medida = unidadMedida;
    
      if (this.alimentos[index].cantidad && this.alimentos[index].cantidad > 0) {
        const costoCalculado = costoPorUnidad * this.alimentos[index].cantidad;
        this.alimentos[index].costo = Math.round(costoCalculado);
      } else {
        this.alimentos[index].costo = 0;
      }
      
      console.log('Alimento seleccionado:', {
        nombre: nombreSeleccionado,
        unidad_medida: unidadMedida,
        costo_total_inventario: costoTotal,
        cantidad_unidades: cantidadUnidades,
        peso_por_unidad: pesoPorUnidad,
        total_disponible: totalDisponible,
        costo_por_unidad: costoPorUnidad,
        cantidad_solicitada: this.alimentos[index].cantidad,
        costo_calculado: this.alimentos[index].costo
      });
    }
  }

  onQuimicoSeleccionado(event: any, index: number): void {
    const nombreSeleccionado = event.target.value;
    
    if (!nombreSeleccionado || nombreSeleccionado === '') {
      this.quimicos[index] = {
        cantidad: null,
        costo: null,
        costo_insumo_total: null,
        cantidad_unidades: null,
        peso_por_unidad: null,
        total_kg_disponible: null,
        costo_por_kg: null,
        unidad_medida: null,
        nombre: '',
        descripcion: ''
      };
      return;
    }

    const quimico = this.quimicoInventario.find(q => 
      (q.producto?.nombre || q.nombre) === nombreSeleccionado
    );
    
    if (quimico) {
      this.quimicos[index].nombre = nombreSeleccionado;
      
      const costoTotal = quimico.costo_insumo || quimico.producto?.costo_insumo || 0;
      const cantidadUnidades = quimico.cantidad || quimico.producto?.cantidad || 1;
      const pesoPorUnidad = quimico.peso_unidad || quimico.producto?.peso_unidad || 1;
      const unidadMedida = quimico.unidad_medida || quimico.producto?.unidad_medida || 'kg';
    
      const totalDisponible = cantidadUnidades * pesoPorUnidad;
      const costoPorUnidad = totalDisponible > 0 ? costoTotal / totalDisponible : 0;
      
      this.quimicos[index].costo_insumo_total = costoTotal;
      this.quimicos[index].cantidad_unidades = cantidadUnidades;
      this.quimicos[index].peso_por_unidad = pesoPorUnidad;
      this.quimicos[index].total_kg_disponible = totalDisponible;
      this.quimicos[index].costo_por_kg = costoPorUnidad;
      this.quimicos[index].unidad_medida = unidadMedida;
    
      if (this.quimicos[index].cantidad && this.quimicos[index].cantidad > 0) {
        const costoCalculado = costoPorUnidad * this.quimicos[index].cantidad;
        this.quimicos[index].costo = Math.round(costoCalculado);
      } else {
        this.quimicos[index].costo = 0;
      }
      
      console.log('Químico seleccionado:', {
        nombre: nombreSeleccionado,
        unidad_medida: unidadMedida,
        costo_total_inventario: costoTotal,
        cantidad_unidades: cantidadUnidades,
        peso_por_unidad: pesoPorUnidad,
        total_disponible: totalDisponible,
        costo_por_unidad: costoPorUnidad,
        cantidad_solicitada: this.quimicos[index].cantidad,
        costo_calculado: this.quimicos[index].costo
      });
    }
  }

  onAlimentoCantidadChange(index: number): void {
    const alimento = this.alimentos[index];
    if (alimento.costo_por_kg && alimento.cantidad && alimento.cantidad > 0) {
      const costoCalculado = alimento.costo_por_kg * alimento.cantidad;
      alimento.costo = Math.round(costoCalculado);
      
      console.log('Cantidad alimento cambiada:', {
        cantidad_solicitada: alimento.cantidad,
        costo_por_kg: alimento.costo_por_kg,
        costo_calculado_exacto: costoCalculado,
        costo_redondeado: alimento.costo
      });
    } else {
      alimento.costo = 0;
    }
  }

  onQuimicoCantidadChange(index: number): void {
    const quimico = this.quimicos[index];
    if (quimico.costo_por_kg && quimico.cantidad && quimico.cantidad > 0) {
      const costoCalculado = quimico.costo_por_kg * quimico.cantidad;
      quimico.costo = Math.round(costoCalculado);
      
      console.log('Cantidad químico cambiada:', {
        cantidad_solicitada: quimico.cantidad,
        costo_por_kg: quimico.costo_por_kg,
        costo_calculado_exacto: costoCalculado,
        costo_redondeado: quimico.costo
      });
    } else {
      quimico.costo = 0;
    }
  }

  onTanqueChange(): void {
    if (!this.tanque_id) return;
    this.resetFormularios();
    this.ciclo_id = this.obtenerCicloDelTanque(this.tanque_id);
    console.log("El cicloooooo",this.ciclo_id)
    this.cargarMediciones(this.tanque_id);
  }

  private obtenerCicloDelTanque(tanque_id: number): number {
    for (const ciclo of this.ciclos) {
      if (ciclo.fecha_fin) continue;

      const ciclotanques = Array.isArray(ciclo.ciclotanques_ciclo) 
        ? ciclo.ciclotanques_ciclo 
        : Object.values(ciclo.ciclotanques_ciclo || {});

      const relacion = ciclotanques.find((t: any) => Number(t.tanque_id) === Number(tanque_id));
      if (relacion) return ciclo.id;
    }
    return 0;
  }

  private cargarMediciones(tanque_id: number): void {
    this.tanqueService.obtenerMedicionesTanque(tanque_id).subscribe({
      next: (data) => {
        this.mediciones = data;
        this.ultimaMedicion = this.mediciones.length > 0 
          ? this.mediciones[this.mediciones.length - 1] 
          : null;

        this.cargarHistorial(tanque_id, this.ciclo_id);
      },
      error: (err) => {
        console.error('Error al cargar mediciones:', err);
        this.notificacionService.error('Error al cargar las mediciones del tanque');
      }
    });
  }

  private cargarHistorial(tanque_id: number, ciclo_id: number): void {
    const cicloActual = this.ciclos.find((c: any) => c.id === ciclo_id);
    if (!cicloActual) {
      this.historial = [];
      return;
    }

    this.historial = this.mediciones.map((medicion: any) => {
      const fecha = medicion.fecha || medicion.createdAt?.split('T')[0];
      const alimento = cicloActual.alimentos?.find((a: any) => 
        a.fecha?.split('T')[0] === fecha && Number(a.tanque_id) === Number(tanque_id)
      );

      const bajas = cicloActual.bajas_ciclo?.find((b: any) => 
        b.fecha?.split('T')[0] === fecha && Number(b.tanque_id) === Number(tanque_id)
      );

      return {
        fecha: fecha,
        tanque_id: medicion.tanque_id,
        temperatura: medicion.temperatura,
        oxigeno_disuelto: medicion.oxigeno_disuelto,
        ph: medicion.ph,
        alimento: alimento?.nombre || '-',
        cantidad_alimento: alimento?.cantidad || '-',
        bajas: bajas?.cantidad || 0
      };
    }).reverse();
  }

  getTanqueNombre(tanque_id: number): string {
    const tanque = this.tanques?.find(t => t.id === tanque_id);
    return tanque?.nombre || `Tanque #${tanque_id}`;
  }

  getSemaforo(param: string, valor: number): 'rojo' | 'amarillo' | 'verde' {
    if (valor === null || valor === undefined) return 'verde';

    const rangos: { [key: string]: { rojo: [number, number][], amarillo: [number, number][] } } = {
      temperatura: {
        rojo: [[-Infinity, 20], [32, Infinity]],
        amarillo: [[20, 24], [30, 32]]
      },
      oxigeno_disuelto: {
        rojo: [[-Infinity, 3]],
        amarillo: [[3, 5]]
      },
      ph: {
        rojo: [[-Infinity, 6], [9, Infinity]],
        amarillo: [[6, 6.5], [8.5, 9]]
      },
      nitritos: {
        rojo: [[1, Infinity]],
        amarillo: [[0.25, 1]]
      },
      amoniaco: {
        rojo: [[0.05, Infinity]],
        amarillo: [[0.02, 0.05]]
      },
      nitratos: {
        rojo: [[100, Infinity]],
        amarillo: [[50, 100]]
      },
      salinidad: {
        rojo: [[1, Infinity]],
        amarillo: [[0.5, 1]]
      }
    };

    const config = rangos[param];
    if (!config) return 'verde';

    for (const [min, max] of config.rojo) {
      if (valor >= min && valor <= max) return 'rojo';
    }
    for (const [min, max] of config.amarillo) {
      if (valor >= min && valor <= max) return 'amarillo';
    }
    return 'verde';
  }

  getCalidadAguaGlobal(): string {
    const valores = Object.entries(this.calidadAgua)
      .filter(([_, v]) => v !== null && v !== undefined)
      .map(([k, v]) => this.getSemaforo(k, v as number));

    if (valores.length === 0) return 'Sin datos';

    const rojos = valores.filter(c => c === 'rojo').length;
    const amarillos = valores.filter(c => c === 'amarillo').length;

    if (rojos >= 1) return 'Crítico';
    if (amarillos >= 3) return 'Alto Riesgo';
    if (amarillos > 0) return 'Vigilancia';
    return 'Óptimo';
  }

  tieneDatosCalidadAgua(): boolean {
    return Object.values(this.calidadAgua).some(v => v !== null && v !== undefined);
  }

  formatearParametro(param: string): string {
    const nombres: { [key: string]: string } = {
      temperatura: 'Temperatura',
      oxigeno_disuelto: 'Oxígeno Disuelto',
      ph: 'pH',
      nitritos: 'Nitritos',
      amoniaco: 'Amoníaco',
      nitratos: 'Nitratos',
      salinidad: 'Salinidad'
    };
    return nombres[param] || param;
  }

  getPlanAccion(param: string, color: 'rojo' | 'amarillo' | 'verde'): string {
    const planes: { [key: string]: { [key: string]: string } } = {
      temperatura: {
        rojo: 'Cambio de agua gradual y aislar el tanque del clima.',
        amarillo: 'Reducir la alimentación y monitorear 3 veces al día.',
        verde: 'Mantener rutina y registrar diario.'
      },
      oxigeno_disuelto: {
        rojo: '¡Emergencia! Parar comida, máxima aireación y cambio de agua.',
        amarillo: 'Reducir comida, aumentar aireación y medir cada 3 horas.',
        verde: 'Mantener aireación y limpiar difusores.'
      },
      ph: {
        rojo: 'Cambio de agua parcial y usar buffer natural (piedra caliza/turba) GRADUAL',
        amarillo: 'Verificar y corregir la alcalinidad.',
        verde: 'pH óptimo, mantener.'
      },
      nitritos: {
        rojo: 'Cambio de agua grande y añadir sal común (1-2 g/L).',
        amarillo: 'Cambio de agua del 20% y añadir sal preventiva (0.5 g/L).',
        verde: 'Mantener buen oxígeno para las bacterias.'
      },
      amoniaco: {
        rojo: 'Cambio de agua grande y usar neutralizador químico de emergencia.',
        amarillo: 'Cambio de agua del 20% y reducir la comida a la mitad.',
        verde: 'No sobrealimentar y mantener el filtro biológico.'
      },
      nitratos: {
        rojo: 'Cambios de agua frecuentes (25-30%) hasta bajar.',
        amarillo: 'Cambio de agua programado del 15% semanal.',
        verde: 'Mantener cambios de agua regulares.'
      },
      salinidad: {
        rojo: 'Ajustar muy lentamente (1-2 ppt por día) con cambios de agua.',
        amarillo: 'Ajustar lentamente hacia el centro del rango ideal.',
        verde: 'Salinidad óptima.'
      }
    };
    return planes[param]?.[color] || '';
  }

  private guardarCalidadAgua() {
    return this.tieneDatosCalidadAgua()
      ? this.tanqueService.crearMediciones(this.tanque_id, this.calidadAgua)
      : null
  }

  private guardarAlimentos() {
    if (!this.ciclo_id || this.ciclo_id === 0) return null;

    const items = this.alimentos.filter(a =>
      a &&
      a.nombre &&
      a.nombre.trim() !== '' &&
      a.cantidad != null &&
      a.cantidad > 0 &&
      a.costo != null &&
      a.costo > 0
    );
    if (items.length === 0) return null;

    return forkJoin(
      items.map(a => this.cicloService.ingresarAlimento({
        nombre: a.nombre,
        cantidad: Number(a.cantidad),
        costo: Number(a.costo),
        observacion: a.descripcion || ''
      }, this.ciclo_id))
    );
  }
  
  private guardarQuimicos() {
    if (!this.ciclo_id || this.ciclo_id === 0) return null;

    const items = this.quimicos.filter(q =>
      q &&
      q.nombre &&
      q.nombre.trim() !== '' &&
      q.cantidad != null &&
      q.cantidad > 0 &&
      q.costo != null &&
      q.costo > 0
    );
    if (items.length === 0) return null;

    return forkJoin(
      items.map(q => this.cicloService.ingresarQuimico({
        nombre: q.nombre,
        cantidad: Number(q.cantidad),
        costo: Number(q.costo),
        observacion: q.descripcion || ''
      }, this.ciclo_id))
    );
  }

  private guardarBajas() {
    if (!this.ciclo_id || this.ciclo_id === 0) return null;

    const items = this.bajas.filter(b =>
      b &&
      b.cantidad != null &&
      b.cantidad > 0 &&
      b.causas &&
      b.causas.trim() !== ''
    );

    if (items.length === 0) return null;

    return forkJoin(
      items.map(b => this.cicloService.actualizarBajas({
        cantidad: Number(b.cantidad),
        tanque_id: this.tanque_id,
        causa: b.causas
      }, this.ciclo_id))
    );
  }

  guardarDiario() {
    if (!this.tanque_id || this.tanque_id === 0) {
      this.notificacionService.error('Debe seleccionar un tanque');
      return;
    }

    this.cargando = true;

    const tareas = [
      this.guardarCalidadAgua(),
      this.guardarAlimentos(),
      this.guardarQuimicos(),
      this.guardarBajas()
    ].filter(t => t !== null);

    if (tareas.length === 0) {
      this.notificacionService.error('Debe ingresar al menos un dato para guardar');
      this.cargando = false;
      return;
    }

    forkJoin(tareas).subscribe({
      next: () => {
        const mensaje = this.ciclo_id 
          ? 'Reporte diario guardado correctamente' 
          : 'Calidad del agua guardada correctamente';
        this.notificacionService.success(mensaje);
        this.resetFormularios();
        this.cargarMediciones(this.tanque_id);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.notificacionService.error('Error al guardar los datos');
        this.cargando = false
      }
    });
  }

  private resetFormularios(): void {
    this.calidadAgua = {
      temperatura: null,
      oxigeno_disuelto: null,
      ph: null,
      nitritos: null,
      amoniaco: null,
      nitratos: null,
      salinidad: null
    };
    this.alimentos = [];
    this.quimicos = [];
    this.bajas = [];
    
    this.agregarAlimento();
    this.agregarQuimico();
    this.agregarBaja();
  }

  toggleHistorial(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  exportarCSV(): void {
    if (this.historial.length === 0) {
      this.notificacionService.error('No hay datos para exportar');
      return;
    }

    const headers = ['Fecha', 'Tanque', 'Temperatura', 'Oxígeno', 'pH', 'Alimento', 'Cantidad', 'Bajas'];
    const rows = this.historial.map(h => [
      h.fecha,
      this.getTanqueNombre(h.tanque_id),
      h.temperatura,
      h.oxigeno_disuelto,
      h.ph,
      h.alimento,
      h.cantidad_alimento,
      h.bajas
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${this.getTanqueNombre(this.tanque_id)}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    this.notificacionService.success('CSV exportado correctamente');
  }
}
