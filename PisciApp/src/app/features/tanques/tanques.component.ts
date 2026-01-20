import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TanqueService } from '../../core/services/tanque.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartType,Chart, registerables, ChartOptions } from 'chart.js';
import { BaseChartDirective } from "ng2-charts";

Chart.register(...registerables);
@Component({
  selector: 'app-tanques',
  imports: [NavbarComponent, CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './tanques.component.html',
  styleUrl: './tanques.component.css'
})
export class TanquesComponent implements OnInit {
  tanques: any[] = [];
  tanqueSeleccionado: any = null;
  usuario_id: number = 0;
  graficoMediciones: any = { labels: [], datasets: [] };
  graficoTipo: ChartType = 'line';

  graficoMedicioneOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Temperatura y Oxigeno' }
    },
    scales: {
      x: {
        type: 'category',
        title: { display: true, text: 'Fecha' },
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 30,
          autoSkip: true,
          maxTicksLimit: 6
        }
      },
      y: {
        type: 'linear',
        beginAtZero: true,
        title: { display: true, text: 'Valor' },
        ticks: { font: { size: 10 } }
      }
    }
  }

  constructor (
    private tanqueService: TanqueService,
    private notificacionService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.usuario_id = user ? user.id : 0;
    this.tanqueService.obtenerTanquesPorUsuario(this.usuario_id).subscribe({
      next: (data) => {
        this.tanques = data;
        // this.tanques = [
        //   {
        //     id: 1,
        //     nombre: 'Tanque Norte',
        //     volumen: 12,
        //     disponible: true,
        //     mediciones: [
        //       { fecha: '2025-09-01', temperatura: 16, oxigeno_disuelto: 14.2, ph: 7.1, salinidad: 0.5, nitratos: 2.2},
        //       { fecha: '2025-09-02', temperatura: 25, oxigeno_disuelto: 7.0, ph: 7.3, salinidad: 0.6, nitratos: 2.0},
        //       { fecha: '2025-09-03', temperatura: 23, oxigeno_disuelto: 2.5, ph: 7.0, salinidad: 0.4, nitratos: 2.5},
        //       { fecha: '2025-09-04', temperatura: 21, oxigeno_disuelto: 6.9, ph: 7.1, salinidad: 0.5, nitratos: 2.2},
        //       { fecha: '2025-09-05', temperatura: 19, oxigeno_disuelto: 7.3, ph: 7.3, salinidad: 0.6, nitratos: 2.0},
        //       { fecha: '2025-09-06', temperatura: 20, oxigeno_disuelto: 7.1, ph: 7.0, salinidad: 0.4, nitratos: 2.5},
        //       { fecha: '2025-09-07', temperatura: 22, oxigeno_disuelto: 6.8, ph: 7.1, salinidad: 0.5, nitratos: 2.2},
        //       { fecha: '2025-09-08', temperatura: 24, oxigeno_disuelto: 7.0, ph: 7.3, salinidad: 0.6, nitratos: 2.0},
        //       { fecha: '2025-09-09', temperatura: 23, oxigeno_disuelto: 7.2, ph: 7.0, salinidad: 0.4, nitratos: 2.5},
        //       { fecha: '2025-09-10', temperatura: 21, oxigeno_disuelto: 2.7, ph: 7.1, salinidad: 0.5, nitratos: 2.2},
        //       { fecha: '2025-09-11', temperatura: 20, oxigeno_disuelto: 7.4, ph: 7.3, salinidad: 0.6, nitratos: 2.0},
        //       { fecha: '2025-09-12', temperatura: 12, oxigeno_disuelto: 7.0, ph: 7.0, salinidad: 0.4, nitratos: 2.5},
        //       { fecha: '2025-09-13', temperatura: 18, oxigeno_disuelto: 7.3, ph: 7.0, salinidad: 0.4, nitratos: 2.5}
        //     ]
        //   }
        // ];
        console.log(data)
      },
      error: (err) => {
        console.error(err);
      }
    });
    
  }

  seleccionarTanque(tanque: any) {
    this.tanqueSeleccionado = tanque
    this.prepararGraficoMediciones()
  }

  prepararGraficoMediciones() {
    if (!this.tanqueSeleccionado || !this.tanqueSeleccionado.mediciones || this.tanqueSeleccionado.mediciones.length === 0) {
      this.graficoMediciones = { labels: [], datasets: []};
      return;
    }
    const labels = this.tanqueSeleccionado.mediciones.map((m: any) => m.fecha);
    const temperaturas = this.tanqueSeleccionado.mediciones.map((m: any) => m.temperatura);
    const oxigenos = this.tanqueSeleccionado.mediciones.map((m: any) => m.oxigeno_disuelto);
    const phs = this.tanqueSeleccionado.mediciones.map((m: any) => m.ph);
    const salinidades = this.tanqueSeleccionado.mediciones.map((m: any) => m.salinidad);
    const nitratos = this.tanqueSeleccionado.mediciones.map((m: any) => m.nitratos);

    this.graficoMediciones = {
      labels: labels,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: temperaturas,
          borderColor: '#0097a7',
          backgroundColor: 'rgba(0,151,167,0.15)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Oxigeno (mg/L)',
          data: oxigenos,
          borderColor: '#388e3c',
          backgroundColor: 'rgba(56,142,60,0.15)',
          fill: true,
          tension: 0.3
        },
        {
        label: 'pH',
        data: phs,
        borderColor: '#fbc02d',
        backgroundColor: 'rgba(251,192,45,0.15)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Salinidad (ppt)',
        data: salinidades,
        borderColor: '#7e57c2',
        backgroundColor: 'rgba(126,87,194,0.15)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Nitratos (mg/L)',
        data: nitratos,
        borderColor: '#d32f2f',
        backgroundColor: 'rgba(211,47,47,0.15)',
        fill: true,
        tension: 0.3
      }
      ]
    };
  }

}
