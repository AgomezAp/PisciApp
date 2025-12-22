import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  `,
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent {
  @Input() show: boolean = false;
}
