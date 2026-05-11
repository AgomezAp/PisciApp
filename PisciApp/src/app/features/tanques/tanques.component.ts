import { Component, OnInit } from '@angular/core';
import { TanqueService } from '../../core/services/tanque.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

Chart.register(...registerables);

@Component({
  selector: 'app-tanques',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './tanques.component.html',
  styleUrl: './tanques.component.css'
})
export class TanquesComponent implements OnInit {
  tanques: any[] = [];
  tanqueSeleccionado: any = null;
  usuario_id: number = 0;

  // ── Stats globales ──────────────────────────────────────────────
  stats = { total: 0, ocupados: 0, disponibles: 0, volumenTotal: 0 };

  // ── Última lectura registrada ───────────────────────────────────
  ultimaLectura: any = null;

  // ── Dos gráficas separadas ──────────────────────────────────────
  chartPrimario: any = { labels: [], datasets: [] };
  chartCalidad:  any = { labels: [], datasets: [] };

  baseChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 10, usePointStyle: true, font: { size: 11 } }
      }
    },
    scales: {
      x: {
        type: 'category',
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { size: 10 }, maxRotation: 40, autoSkip: true, maxTicksLimit: 8 }
      },
      y: {
        type: 'linear',
        beginAtZero: false,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { size: 10 } }
      }
    }
  };

  constructor(
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
        this.calcularStats();
      },
      error: (err) => console.error(err)
    });
  }

  calcularStats() {
    this.stats = {
      total:        this.tanques.length,
      ocupados:     this.tanques.filter(t => !t.disponible).length,
      disponibles:  this.tanques.filter(t =>  t.disponible).length,
      volumenTotal: this.tanques.reduce((s, t) => s + (t.volumen || 0), 0)
    };
  }

  seleccionarTanque(tanque: any) {
    this.tanqueSeleccionado = tanque;
    this.calcularUltimaLectura();
    this.prepararCharts();
  }

  calcularUltimaLectura() {
    const meds = this.tanqueSeleccionado?.mediciones;
    this.ultimaLectura = meds?.length ? meds[meds.length - 1] : null;
  }

  /** Devuelve la clase CSS de alerta según el parámetro y su valor */
  alertClass(tipo: string, valor: number): string {
    const ranges: Record<string, [number, number, number, number]> = {
      temp: [10, 14, 22, 28],
      ox:   [0,   5,  9, 99],
      ph:   [6,  6.8, 8, 9]
    };
    const r = ranges[tipo];
    if (!r) return 'kpi-ok';
    if (valor < r[0] || valor > r[3]) return 'kpi-danger';
    if (valor < r[1] || valor > r[2]) return 'kpi-warn';
    return 'kpi-ok';
  }

  prepararCharts() {
    const meds = this.tanqueSeleccionado?.mediciones;
    if (!meds?.length) {
      this.chartPrimario = { labels: [], datasets: [] };
      this.chartCalidad  = { labels: [], datasets: [] };
      return;
    }

    const labels = meds.map((m: any) => m.fecha);

    this.chartPrimario = {
      labels,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: meds.map((m: any) => m.temperatura),
          borderColor: '#0097a7',
          backgroundColor: 'rgba(0,151,167,0.08)',
          fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Oxígeno (mg/L)',
          data: meds.map((m: any) => m.oxigeno_disuelto),
          borderColor: '#43a047',
          backgroundColor: 'rgba(67,160,71,0.08)',
          fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
          borderWidth: 2
        }
      ]
    };

    this.chartCalidad = {
      labels,
      datasets: [
        {
          label: 'pH',
          data: meds.map((m: any) => m.ph),
          borderColor: '#fbc02d',
          backgroundColor: 'rgba(251,192,45,0.08)',
          fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Salinidad (ppt)',
          data: meds.map((m: any) => m.salinidad),
          borderColor: '#7e57c2',
          backgroundColor: 'rgba(126,87,194,0.08)',
          fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
          borderWidth: 2
        },
        {
          label: 'Nitratos (mg/L)',
          data: meds.map((m: any) => m.nitratos),
          borderColor: '#ef5350',
          backgroundColor: 'rgba(239,83,80,0.08)',
          fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
          borderWidth: 2
        }
      ]
    };
  }
}
