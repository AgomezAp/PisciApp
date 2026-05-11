const fs = require('fs');
const path = 'c:\\Users\\DESARROLLO\\Documents\\Codigos\\PisciApp\\PisciApp\\src\\app\\features\\empresa\\empresa.component.css';
const cssContent = `
/* ==================== VARIABLES Y ESTADO GENERAL ==================== */
:root {
  --primary-teal: #0097A7;
  --secondary-teal: #00BCD4;
  --bg-gradient: #f0f2f5;
  --white-glass: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  --text-dark: #222222;
  --text-muted: #666666;
  --danger: #f44336;
  --success: #10b981;
  --warning: #facc15;
}

.empresa-wrapper {
  background: var(--bg-gradient);
  min-height: 100vh;
  padding-bottom: 40px;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--text-dark);
}

/* ==================== DASHBOARD HEADER ==================== */
.dashboard-header {
  background: transparent;
  padding: 32px 24px 16px 24px;
  color: var(--text-dark);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  color: var(--primary-teal);
}

.header-content p {
  font-size: 1rem;
  margin: 0;
  color: var(--text-muted);
}

.empresa-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 10;
}

/* ==================== TABS NAVEGACIÓN ==================== */
.tabs-navbar {
  display: flex;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
  gap: 8px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 24px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-btn:hover {
  background: #E0F7FA;
  color: var(--primary-teal);
}

.tab-btn.active {
  background: var(--primary-teal);
  color: white;
  box-shadow: 0 4px 8px rgba(0, 151, 167, 0.2);
}

/* ==================== CONTENT SECTIONS ==================== */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}

.section-actions h2 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text-dark);
}

/* ==================== STATS CARDS (MINI DASHBOARD) ==================== */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--card-shadow);
  border: 1px solid #E2E8F0;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--secondary-teal);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon .material-icons {
  font-size: 24px;
}

.stat-icon.loop-icon { background: #E0F7FA; color: #0097A7; }
.stat-icon.fish-icon { background: #E8EAF6; color: #3F51B5; }
.stat-icon.money-icon { background: #E8F5E9; color: #4CAF50; }

.stat-icon.pool-icon { background: #E1F5FE; color: #0288D1; }
.stat-icon.available-icon { background: #E8F5E9; color: #388E3C; }
.stat-icon.capacity-icon { background: #EDE7F6; color: #512DA8; }

.stat-icon.revenue-icon { background: #E8F5E9; color: #388E3C; }
.stat-icon.scale-icon { background: #FFF8E1; color: #FBC02D; }
.stat-icon.deal-icon { background: #F3E5F5; color: #7B1FA2; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* ==================== CHARTS WRAPPER ==================== */
.chart-wrapper {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid #E2E8F0;
}

.chart-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-dark);
}

.canvas-container {
  height: 250px;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
}
.canvas-container.canvas-bar {
  height: 300px;
}

/* ==================== CRUDS GRID CARDS ==================== */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.modern-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.modern-card:hover {
  box-shadow: var(--card-shadow);
  border-color: var(--secondary-teal);
}

.modern-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modern-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-teal);
}

.modern-card-title h3 {
  margin: 0;
  font-size: 1.1rem;
}

.modern-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 6px;
  border-bottom: 1px dashed #f0f0f0;
}

.data-row:last-child {
  border-bottom: none;
}

.label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.value {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.95rem;
}

.value.highlight {
  color: var(--primary-teal);
  font-size: 1.05rem;
}

.text-danger {
  color: var(--danger);
}

.modern-card-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  border-radius: 6px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary-light { background: #E0F7FA; color: var(--primary-teal); }
.primary-light:not(:disabled):hover { background: #B2EBF2; }

.neutral { background: #f5f5f5; color: var(--text-dark); }
.neutral:not(:disabled):hover { background: #e0e0e0; }

.danger { background: #ffebee; color: var(--danger); }
.danger:not(:disabled):hover { background: #ffcdd2; }

/* ==================== BADGES ==================== */
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-active { background: #E8F5E9; color: #2E7D32; }
.badge-closed { background: #FFEBEE; color: #C62828; }
.badge-disponible { background: #E1F5FE; color: #0277BD; }
.badge-ocupado { background: #FFF8E1; color: #F57F17; }

.pill-tag {
  background: #f0f0f0;
  color: #333;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* ==================== EMPTY STATE ==================== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  border: 1px solid #E2E8F0;
}

.empty-icon-wrapper {
  background: #E0F7FA;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
  color: var(--primary-teal);
}

.empty-icon-wrapper .material-icons {
  font-size: 32px;
}

/* ==================== VENTAS TABLE ==================== */
.ventas-wrapper {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--card-shadow);
  border: 1px solid #E2E8F0;
  overflow-x: auto;
}

.corporate-table {
  width: 100%;
  border-collapse: collapse;
}

.corporate-table th {
  background: #f8f9fa;
  color: var(--text-muted);
  padding: 12px;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.corporate-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.corporate-table tr:hover td {
  background: #f5f5f5;
}

.text-right { text-align: right; }
.font-bold { font-weight: 600; }
.text-success { color: var(--success); }

/* ==================== BUTTONS ==================== */
.btn-primary {
  background: var(--primary-teal);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-primary:hover {
  background: #00838F;
  box-shadow: 0 2px 6px rgba(0, 151, 167, 0.3);
}

/* ==================== ANIMATIONS ==================== */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==================== MODALES ==================== */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.modal h3 {
  color: var(--primary-teal);
  font-size: 1.3rem;
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.modal label {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.modal input, .modal select {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: #fafafa;
}

.modal input:focus, .modal select:focus {
  border-color: var(--secondary-teal);
  outline: none;
  background: white;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn-secondary {
  background: #f0f0f0;
  color: var(--text-dark);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover { background: #e0e0e0; }

.tanque-dibujo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0;
  padding: 16px;
  background: #E0F7FA;
  border-radius: 8px;
  border: 1px dashed #00BCD4;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 768px) {
  .stats-panel { grid-template-columns: 1fr; }
  .tabs-navbar { flex-direction: column; padding: 12px; }
  .form-row { flex-direction: column; gap: 0; }
  .header-content h1 { font-size: 1.6rem; }
}
`;
fs.writeFileSync(path, cssContent, 'utf8');
console.log('CSS Replaced Correctly!');
