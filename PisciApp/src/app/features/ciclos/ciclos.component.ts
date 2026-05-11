import { Component, OnInit } from '@angular/core';
import { CicloService } from '../../core/services/ciclo.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables, Point } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { TanqueService } from '../../core/services/tanque.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-ciclos',
  standalone: true,
  imports: [DatePipe, CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './ciclos.component.html',
  styleUrls: ['./ciclos.component.css']
})
export class CiclosComponent implements OnInit {
  ciclos: any[] = [];
  tanques: any[] = [];
  tanquesdisponibles: any[] = [];
  cicloSeleccionado: any = null;
  tanqueSeleccionado: any = null;
  usuario_id: number = 1;
  nombresAlimentos: string[] = [];
  nombresQuimicos: string[] = [];

  nombreTanques: string[] = [];

  //Modales
  mostrarModalCierre = false;
  fraseConfirmacion = '';
  fraseUser = '';
  cierre = {
    usuario_id: 0,
    ciclo_id: 0,
    fecha_fin: ''
  }
  mostrarModalAlimento = false;
  nuevoAlimento = {
    cantidad: 0,
    costo: 0,
    nombre: '',
    descripcion: ''
  };
  mostrarModalQuimico = false;
  nuevoQuimico = {
    cantidad: 0,
    costo: 0,
    nombre: '',
    descripcion: ''
  };
  mostrarModalBajas = false;
  nuevoBajas = {
    cantidad: 0,
    tanque_id: 0
  };
  mostrarModalMovimiento = false;
  nuevoMovimiento = {
    origen: 0,
    destino: 0,
    cantidad: 0
  };


  
  // Graficas
  alimentosChart: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  quimicosChart: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  bajasChart: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  tanquesChart: ChartData<"pie", (number | Point | null)[], unknown> = {
  labels: [],
  datasets: []
  };
  movimientosChart: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  medicionesChart: any = {
    labels: [],
    datasets: []
  };

  chartType: 'bar' | 'line' = 'bar';
  activeDataTab: string = 'alimentos';
  activeChartTab: string = 'tanques';

  chartOptionsA: ChartOptions = {
    responsive: true,
    plugins: { 
      title: { display: true, text: 'Alimentos - Cantidad y Costo por Fecha' },
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const fecha = context[0].label;
            const nombres = this.nombresAlimentos[index] || 'N/A';
            return [`Fecha: ${fecha}`, `Alimentos: ${nombres}`];
          },
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (datasetLabel.includes('Cantidad')) {
              return `${datasetLabel}: ${value} kg`;
            } else if (datasetLabel.includes('Costo')) {
              return `${datasetLabel}: $${value.toLocaleString()}`;
            }
            return `${datasetLabel}: ${value}`;
          }
        }
      },
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: { 
        position: 'left',
        beginAtZero: true,
        title: { display: true, text: 'Cantidad (kg)' }
      },
      y1: { 
        position: 'right',
        beginAtZero: true,
        title: { display: true, text: 'Costo ($)' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  chartOptionsQ: ChartOptions = {
    responsive: true,
    plugins: { 
      title: { display: true, text: 'Químicos - Cantidad y Costo por Fecha' },
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const fecha = context[0].label;
            const nombres = this.nombresQuimicos[index] || 'N/A';
            return [`Fecha: ${fecha}`, `Químicos: ${nombres}`];
          },
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (datasetLabel.includes('Cantidad')) {
              return `${datasetLabel}: ${value} kg`;
            } else if (datasetLabel.includes('Costo')) {
              return `${datasetLabel}: $${value.toLocaleString()}`;
            }
            return `${datasetLabel}: ${value}`;
          }
        }
      },
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: { 
        position: 'left',
        beginAtZero: true,
        title: { display: true, text: 'Cantidad (kg)' }
      },
      y1: { 
        position: 'right',
        beginAtZero: true,
        title: { display: true, text: 'Costo ($)' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  chartOptionB: ChartOptions = {
    responsive: true,
    plugins: {
      title: {display: true, text: 'Cantidad Vs Fecha'},
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const fecha = context[0].label;
            const tanques = this.nombreTanques[index] || 'N/A';
            return [`Fecha: ${fecha}`, `tanque: ${tanques}`];
          },
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            if (datasetLabel.includes('Cantidad')) {
              return `${datasetLabel}: ${value}`;
            } 
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: { 
        position: 'left', 
        title: { display: true, text: 'Cantidad peces' } 
      }
    }
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Distribucion de Peces por Tanque'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a:number, b:number) => a + b, 0);
            const porcentaje = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} peces (${porcentaje}%)`;
          }
        }
      },
      legend: {
        position: 'bottom'
      }
    }
  };

  movimientosChartOptions: ChartOptions = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      title: {
        display: true,
        text: 'Movimientos de Peces entre Tanques'
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const label = context[0].label;
            return `Movimiento: ${label}`;
          },
          label: (context) => {
            const value = context.parsed.x;
            const fecha = context.dataset.label;
            return [`Cantidad: ${value} peces`, `Fecha: ${fecha}`];
          }
        }
      },
      legend: {
        position: 'top'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Cantidad de Peces'
        },
        beginAtZero: true
      },
      y: {
        title: {
          display: true,
          text: 'Rutas de Movimiento'
        }
      }
    }
  };

  medicionesChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top'},
      title: {display: true, text: 'Mediciones del tanque'}
    },
    scales: {
      x: {
        type: 'category',
        title: { display: true, text: 'Fecha'},
        ticks: {
          font: { size: 10},
          maxRotation: 45,
          minRotation: 30,
          autoSkip: true,
          maxTicksLimit: 6
        }
      },
      y: {
        type: 'linear',
        beginAtZero: true,
        title: {display: true, text: 'Valor'},
        ticks: { font: {size: 10}}
      }
    }
  };

  constructor(
    private cicloService: CicloService,
    private authService: AuthService,
    private tanqueService: TanqueService,
    private notificacionService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;

    this.cicloService.obtenerCicloPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        this.ciclos = Array.isArray(data) ? data : [data];
        if (this.ciclos.length > 1) {
          this.seleccionarCiclo(this.ciclos[0]);
        } else {
          this.cicloSeleccionado = null
        }

        // --- Datos de prueba SOLO si no hay ciclos --- ELIMINAR
        if (this.ciclos.length === 0) {
          this.ciclos = [{
            id: 1,
            alimentos: [
              { createdAt: '2025-09-01', cantidad: 20, costo: 1000, nombre: 'Alimento A' },
              { createdAt: '2025-09-02', cantidad: 25, costo: 800, nombre: 'Alimento B' }
            ],
            quimicos: [
              { createdAt: '2025-09-01', cantidad: 5, costo: 300, nombre: 'Químico X' },
              { createdAt: '2025-09-02', cantidad: 6, costo: 260, nombre: 'Químico Y' }
            ],
            bajas_ciclo: [
              { createdAt: '2025-09-01', cantidad: 2, tanque_id: 1 },
              { createdAt: '2025-09-02', cantidad: 1, tanque_id: 2 }
            ],
            ciclotanques_ciclo: [
              { tanque_id: 1, numero_peces: 100 },
              { tanque_id: 2, numero_peces: 130 }
            ],
            movimientos_tanque: [
              { origen: 1, destino: 2, cantidad: 10, createdAt: '2025-09-01' },
              { origen: 2, destino: 1, cantidad: 5, createdAt: '2025-09-02' }
            ]
          }];
          this.seleccionarCiclo(this.ciclos[0]);
        }
        // --- Fin datos de prueba --- ELIMINAR
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.tanqueService.obtenerTanquesPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        this.tanques = data;
        this.tanquesdisponibles = data.filter((tanque: any) => tanque.disponible === true);
      },
      error: (err) => {
        console.error(err)
      }
    });
  }

  getDiasCiclo(): number {
    if (!this.cicloSeleccionado?.fecha_inicio) return 0;
    const inicio = new Date(this.cicloSeleccionado.fecha_inicio);
    const fin = this.cicloSeleccionado.fecha_fin
      ? new Date(this.cicloSeleccionado.fecha_fin)
      : new Date();
    return Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  }

  getTotalBajas(): number {
    return (this.cicloSeleccionado?.bajas_ciclo || [])
      .reduce((s: number, b: any) => s + (b.cantidad || 0), 0);
  }

  getTotalCostos(): number {
    const al = (this.cicloSeleccionado?.alimentos || [])
      .reduce((s: number, a: any) => s + (a.costo || 0), 0);
    const qu = (this.cicloSeleccionado?.quimicos || [])
      .reduce((s: number, q: any) => s + (q.costo || 0), 0);
    return al + qu + (this.cicloSeleccionado?.costos || 0) + (this.cicloSeleccionado?.costos_transporte || 0);
  }

  setChartTab(tab: string) {
    this.activeChartTab = tab;
  }

  seleccionarCiclo(ciclo: any) {
    this.cicloSeleccionado = ciclo;
    this.activeChartTab = 'tanques';
    this.crearGraficaAlimentos();
    this.crearGraficaQuimicos();
    this.crearGraficaBajas();
    this.crearGraficaTanques();
    this.crearGraficaMovimientos();
    console.log(this.cicloSeleccionado)
  }
  getTanqueNombre(tanque_id: number): string {
  const tanque = this.tanques?.find(t => t.id === tanque_id);
  return tanque?.nombre || ('Tanque ' + tanque_id);
}

  crearGraficaAlimentos() {
    const alimentos = this.cicloSeleccionado.alimentos || [];
    
    // Agrupar por fecha
    const datosPorFecha: { [fecha: string]: { cantidad: number, costo: number, nombres: Set<string> } } = {};
    
    alimentos.forEach((a: any) => {
      const fecha = new Date(a.createdAt).toLocaleDateString();
      if (!datosPorFecha[fecha]) {
        datosPorFecha[fecha] = { cantidad: 0, costo: 0, nombres: new Set<string>() };
      }
      datosPorFecha[fecha].cantidad += a.cantidad;
      datosPorFecha[fecha].costo += a.costo;
      datosPorFecha[fecha].nombres.add(a.nombre);
    });
    
    // Ordenar fechas
    const fechasOrdenadas = Object.keys(datosPorFecha).sort((a, b) => {
      return new Date(a.split('/').reverse().join('-')).getTime() - 
             new Date(b.split('/').reverse().join('-')).getTime();
    });
    
    const cantidades = fechasOrdenadas.map(f => datosPorFecha[f].cantidad);
    const costos = fechasOrdenadas.map(f => datosPorFecha[f].costo);
    this.nombresAlimentos = fechasOrdenadas.map(f => Array.from(datosPorFecha[f].nombres).join(', '));

    this.alimentosChart = {
      labels: fechasOrdenadas,
      datasets: [
        {
          label: 'Cantidad (kg)',
          data: cantidades,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          yAxisID: 'y',
          fill: false
        },
        {
          label: 'Costo ($)',
          data: costos,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          yAxisID: 'y1',
          fill: false
        }
      ]
    };
  }

  crearGraficaQuimicos() {
    const quimicos = this.cicloSeleccionado.quimicos || [];
    
    // Agrupar por fecha
    const datosPorFecha: { [fecha: string]: { cantidad: number, costo: number, nombres: Set<string> } } = {};
    
    quimicos.forEach((q: any) => {
      const fecha = new Date(q.createdAt).toLocaleDateString();
      if (!datosPorFecha[fecha]) {
        datosPorFecha[fecha] = { cantidad: 0, costo: 0, nombres: new Set<string>() };
      }
      datosPorFecha[fecha].cantidad += q.cantidad;
      datosPorFecha[fecha].costo += q.costo;
      datosPorFecha[fecha].nombres.add(q.nombre);
    });
    
    // Ordenar fechas
    const fechasOrdenadas = Object.keys(datosPorFecha).sort((a, b) => {
      return new Date(a.split('/').reverse().join('-')).getTime() - 
             new Date(b.split('/').reverse().join('-')).getTime();
    });
    
    const cantidades = fechasOrdenadas.map(f => datosPorFecha[f].cantidad);
    const costos = fechasOrdenadas.map(f => datosPorFecha[f].costo);
    this.nombresQuimicos = fechasOrdenadas.map(f => Array.from(datosPorFecha[f].nombres).join(', '));

    this.quimicosChart = {
      labels: fechasOrdenadas,
      datasets: [
        {
          label: 'Cantidad (kg)',
          data: cantidades,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          yAxisID: 'y',
          fill: false
        },
        {
          label: 'Costo ($)',
          data: costos,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          tension: 0.4,
          yAxisID: 'y1',
          fill: false
        }
      ]
    };
  }

  crearGraficaBajas() {
    const bajas = this.cicloSeleccionado.bajas_ciclo || [];
    const fechas = bajas.map((a: any) => new Date(a.createdAt).toLocaleDateString());
    const cantidades = bajas.map((a: any) => a.cantidad);
    this.nombreTanques = bajas.map((a: any) => a.tanque_id)

    this.bajasChart = {
      labels: fechas,
      datasets: [
        {
          label: 'Bajas diarias',
          data: cantidades,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          yAxisID: 'y',
        }
      ]
    };
  }

  crearGraficaTanques() {
    const tanques = this.cicloSeleccionado.ciclotanques_ciclo || [];

    if (tanques.length === 0) return;
    
    const labels = tanques.map((t: any) => `Tanque ${t.tanque_id}`);
    const datos = tanques.map((t: any) => t.numero_peces);

    const colores = [
      '#FF6384', '#36A2EB', 
      '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40'
    ];

    this.tanquesChart = {
      labels: labels,
      datasets: [{
        data: datos,
        backgroundColor: colores.slice(0, tanques.length),
        borderColor: colores.slice(0, tanques.length),
        borderWidth: 2
      }]
    };
  }

  crearGraficaMovimientos() {
    const movimientos = this.cicloSeleccionado.movimientos_tanque || [];

    if(movimientos.length === 0) return;

    const movimientosAgrupados: { [key: string]: {cantidades: number[], fechas: string[] }} = {};
    console.log(movimientosAgrupados)
    movimientos.forEach((mov: any) => {
      const ruta = `${this.getTanqueNombre(mov.origen)} ➡️ ${this.getTanqueNombre(mov.destino)}`;
      const fecha = new Date(mov.createdAt).toLocaleDateString('es-ES');

      if(!movimientosAgrupados[ruta]) {
        movimientosAgrupados[ruta] = { cantidades: [], fechas: []};
      }
      movimientosAgrupados[ruta].cantidades.push(mov.cantidad);
      movimientosAgrupados[ruta].fechas.push(fecha);
    });

    const rutas = Object.keys(movimientosAgrupados);

    const fechasUnicas = [...new Set(movimientos.map((m: any) => 
      new Date(m.createdAt).toLocaleDateString('es-ES')
    ))].sort();

    const coloresMovimientos = [
      'rgba(54, 162, 235, 0.8)',   // Azul
      'rgba(255, 99, 132, 0.8)',   // Rojo
      'rgba(75, 192, 192, 0.8)',   // Verde agua
      'rgba(255, 205, 86, 0.8)',   // Amarillo
      'rgba(153, 102, 255, 0.8)',  // Morado
      'rgba(255, 159, 64, 0.8)'    // Naranja
    ];

    const datasets = fechasUnicas.map((fecha, index) => {
      const data = rutas.map(ruta => {
        const movimiento = movimientosAgrupados[ruta];
        const indiceFecha = movimiento.fechas.indexOf(fecha as string);
        return indiceFecha !== -1 ? movimiento.cantidades[indiceFecha] : 0;
      });
      return {
        label: fecha,
        data: data as number[],
        backgroundColor: coloresMovimientos[index % coloresMovimientos.length],
        borderColor: coloresMovimientos[index % coloresMovimientos.length].replace('0.8', '1'),
        borderWidth: 1
      };
    });
    this.movimientosChart = {
      labels: rutas,
      datasets: datasets as any
    };
  }

  

  cambiarTipoGrafico() {
    this.chartType = this.chartType === 'line' ? 'bar' : 'line';
  }

  agregarAlimento() {
    const datos = { ...this.nuevoAlimento};
    this.cicloService.ingresarAlimento(datos, this.cicloSeleccionado.id).subscribe({
      next: () => {
        this.cerrarModalAlimento();
        this.notificacionService.success('Datos de alimento actualizados');
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.error('Error al agregar alimento');
      }
    });
  };
  abrirModalAlimentos() {
    this.mostrarModalAlimento = true;
    this.nuevoAlimento = { cantidad: 0, costo: 0, nombre: '', descripcion: ''};
  };
  cerrarModalAlimento() {
    this.mostrarModalAlimento = false;
  };

  agregarQuimico() {
    const datos = { ...this.nuevoQuimico};
    this.cicloService.ingresarQuimico(datos, this.cicloSeleccionado.id).subscribe({
      next: () => {
        this.cerrarModalQuimico();
        this.notificacionService.success('Datos de quimico actualizados');
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.error('Error al agregar quimico');
      }
    });
  };
  abrirModalQuimico() {
    this.mostrarModalQuimico = true;
    this.nuevoQuimico = { cantidad: 0, costo: 0, nombre: '', descripcion: ''};
  };
  cerrarModalQuimico() {
    this.mostrarModalQuimico = false;
  };

  agregarBaja() {
    const datos = { ...this.nuevoBajas};
    this.cicloService.actualizarBajas(datos, this.cicloSeleccionado.id).subscribe({
      next: () => {
        this.cerrarModalBajas();
        this.notificacionService.success('Datos de bajas actualizados');
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.error('Error al agregar baja');
      }
    });
  }
  abrirModalBajas() {
    this.mostrarModalBajas = true;
    this.nuevoBajas = { cantidad: 0, tanque_id: 0 };
  }
  cerrarModalBajas() {
    this.mostrarModalBajas = false;
  }

  agregarMovimiento() {
    const datos = { ...this.nuevoMovimiento};
    console.log(this.nuevoMovimiento);
    this.cicloService.cambiarTanque(datos, this.cicloSeleccionado.id).subscribe({
      next: () => {
        this.cerrarModalMovimiento();
        this.notificacionService.success('Datos de alimento actualizados');
      },
      error: (err) => {
        console.error(err);
        this.notificacionService.error('Error al agregar movimiento');
      }
    });
  }
  abrirModalMovimiento() {
    this.mostrarModalMovimiento = true;
    this.nuevoBajas = {cantidad: 0, tanque_id: 0 };
  }
  cerrarModalMovimiento() {
    this.mostrarModalMovimiento = false;
  }

  terminarCiclo() {
    this.mostrarModalCierre = true;
    this.fraseConfirmacion = `CerrarCiclo${this.cicloSeleccionado.id}`;
    this.fraseUser = '';
    this.cierre = {
      usuario_id: this.usuario_id,
      ciclo_id: this.cicloSeleccionado.id,
      fecha_fin: new Date().toISOString()
    };
    console.log(this.cierre)
  }

  confirmarCierre() {
    if (this.fraseConfirmacion === this.fraseUser) {
      this.cicloService.cerrarCiclo(this.cierre).subscribe({
        next: () => {
          this.notificacionService.success(`El ciclo con el id ${this.cierre.ciclo_id} cerrado`)
          this.mostrarModalCierre = false;
        }
      })
    } else {
      this.notificacionService.error('El mensaje de confirmacion no coincide ')
    }
  }
  
  getTanqueInfo(tanque_id: number): any {
    return this.tanques?.find(t => t.id === tanque_id)
  }

  seleccionarTanque(tanque: any): void {
    if(tanque) {
      this.tanqueSeleccionado = tanque;
    }
  }

  agregarCiclo(): any {
    this.router.navigate(['/inicio'], { queryParams: { abrirModalCiclo: true}})
  }

  agregarTanque(): any {
    this.router.navigate(['/inicio'], { queryParams: { abrirModalTanque: true}})

  }


}
