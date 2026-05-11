const fs = require('fs');
const path = 'c:\\Users\\DESARROLLO\\Documents\\Codigos\\PisciApp\\PisciApp\\src\\app\\features\\empresa\\empresa.component.html';
const content = fs.readFileSync(path, 'utf8');

const modalStartRegex = /<!-- Modal Editar\/Agregar Tanque -->[\s\S]*?(?=<!-- Modal Confirmar Eliminación -->)/;

const newModalHtml = `<!-- Modal Editar/Agregar Tanque -->
  <div class="modal-backdrop" *ngIf="mostrarModalTanque">
    <div class="modal">
      <h3>{{ modoEdicion ? 'Ajustar Infraestructura' : 'Nueva Infraestructura' }}</h3>
      <form (ngSubmit)="agregarTanque()">
        <div class="form-group">
          <label>Morfología del estanque *</label>
          <select [(ngModel)]="nuevoTanque.forma" name="forma" required>
            <option value="" disabled selected>Identifica la forma</option>
            <option value="Rectangular">Geometría Rectangular</option>
            <option value="Redondo">Geometría Circular</option>
          </select>
        </div>

        <div class="form-group">
          <label>Nivel de Profundidad (m) *</label>
          <input type="number" [(ngModel)]="nuevoTanque.profundidad" name="profundidad" required min="0" step="0.1" placeholder="Ej: 1.5" />
        </div>

        <div class="form-row" *ngIf="nuevoTanque.forma === 'Rectangular'">
          <div class="form-group">
            <label>Largo (m) *</label>
            <input type="number" [(ngModel)]="nuevoTanque.largo" name="largo" required min="0" />
          </div>
          <div class="form-group">
            <label>Ancho (m) *</label>
            <input type="number" [(ngModel)]="nuevoTanque.ancho" name="ancho" required min="0" />
          </div>
        </div>

        <div class="form-group" *ngIf="nuevoTanque.forma === 'Redondo'">
          <label>Diámetro operativo (m) *</label>
          <input type="number" [(ngModel)]="nuevoTanque.diametro" name="diametro" required min="0" />
        </div>

        <div class="tanque-dibujo" *ngIf="nuevoTanque.forma">
          <div *ngIf="nuevoTanque.forma === 'Rectangular' && (nuevoTanque.largo || 0) > 0 && (nuevoTanque.ancho || 0) > 0">
            <svg width="200" height="200" viewBox="-10 -10 220 220" style="max-width: 100%; border-radius: 8px;">
              <defs>
                <pattern id="waterPatternRect" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0,10 Q5,5 10,10 T20,10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"></path>
                </pattern>
                <linearGradient id="rectGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#80deea" />
                  <stop offset="100%" stop-color="#00acc1" />
                </linearGradient>
              </defs>
              <g [ngStyle]="{'transform': 'scale(' + (200 / Math.max(nuevoTanque.largo || 1, nuevoTanque.ancho || 1)) + ')', 'transform-origin': 'center'}">
                <rect 
                  [attr.x]="100 - (nuevoTanque.largo || 1)/2" 
                  [attr.y]="100 - (nuevoTanque.ancho || 1)/2" 
                  [attr.width]="nuevoTanque.largo || 1" 
                  [attr.height]="nuevoTanque.ancho || 1" 
                  fill="url(#rectGrad)" stroke="#00838f" stroke-width="2" rx="4" />
                <rect 
                  [attr.x]="100 - (nuevoTanque.largo || 1)/2" 
                  [attr.y]="100 - (nuevoTanque.ancho || 1)/2" 
                  [attr.width]="nuevoTanque.largo || 1" 
                  [attr.height]="nuevoTanque.ancho || 1" 
                  fill="url(#waterPatternRect)" rx="4" />
              </g>
            </svg>
            <div style="text-align: center; color: #00838f; font-size: 0.85rem; margin-top: 8px;">
              Volumen estimado: {{ (nuevoTanque.largo * nuevoTanque.ancho * (nuevoTanque.profundidad || 1)).toFixed(2) }} m³
            </div>
          </div>

          <div *ngIf="nuevoTanque.forma === 'Redondo' && (nuevoTanque.diametro || 0) > 0">
            <svg width="200" height="200" viewBox="0 0 200 200" style="max-width: 100%;">
              <defs>
                <pattern id="waterPatternCirc" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0,10 Q5,5 10,10 T20,10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"></path>
                </pattern>
                <radialGradient id="circGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stop-color="#80deea" />
                  <stop offset="100%" stop-color="#00acc1" />
                </radialGradient>
              </defs>
              <g [ngStyle]="{'transform': 'scale(' + (180 / (nuevoTanque.diametro || 1)) + ')', 'transform-origin': 'center'}">
                <circle cx="100" cy="100" [attr.r]="(nuevoTanque.diametro || 1)/2" fill="url(#circGrad)" stroke="#00838f" stroke-width="2" />
                <circle cx="100" cy="100" [attr.r]="(nuevoTanque.diametro || 1)/2" fill="url(#waterPatternCirc)" />
              </g>
            </svg>
            <div style="text-align: center; color: #00838f; font-size: 0.85rem; margin-top: 8px;">
              Volumen estimado: {{ (3.14159 * Math.pow((nuevoTanque.diametro)/2, 2) * (nuevoTanque.profundidad || 1)).toFixed(2) }} m³
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" (click)="cerrarModal(false)">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="!nuevoTanque.forma">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
  
  `;

const processed = content.replace(modalStartRegex, newModalHtml);
fs.writeFileSync(path, processed, 'utf8');
console.log('HTML Modal Upgraded!');
