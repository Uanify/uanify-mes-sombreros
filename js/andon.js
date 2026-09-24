/**
 * UANIFY MES · TABLERO ANDON CONTROLLER
 * Tombstone Hats — Planta Matriz San Francisco del Rincón
 *
 * Validado en audio: 14 departamentos/puntos reales incluyendo 4 inspecciones de calidad.
 * El Tablero Andon muestra semáforos, WIP por almacén, avance h×h y cuello de botella (Prensas).
 */

window.initAndonView = function() {
  renderStations();
  renderHourlyProgress();
  renderDowntimes();
  updateAndonTotals();

  EventBus.on('piece-registered', () => {
    updateAndonTotals();
    renderStations();
    renderHourlyProgress();
  });
  EventBus.on('status-updated', () => {
    renderStations();
    renderDowntimes();
  });
  EventBus.on('lot-subdivided', () => {
    renderStations();
  });
};

function renderStations() {
  const grid = document.getElementById('stationsGrid');
  if (!grid) return;

  grid.innerHTML = UanifyState.stations.map(st => {
    const pct = Math.min(100, Math.round((st.produced / st.target) * 100));
    const statusText  = st.status === 'running' ? 'OPERANDO' : st.status === 'warning' ? 'AJUSTE' : 'PARO';
    const statusClass = `status-${st.status}`;
    const isBottleneck = st.wipWaiting >= 30;
    const isQuality    = st.id.startsWith('calidad');
    const cardBorder   = isQuality ? 'border-color: rgba(250,204,21,0.35);' : '';

    return `
      <div class="station-card ${statusClass}" data-station-id="${st.id}" style="${cardBorder}">
        <div class="station-header">
          <div>
            <span class="station-num">${st.code} ${isQuality ? '· ✅ PUNTO DE CALIDAD' : ''}</span>
            <h4 class="station-name">${st.name}</h4>
            <small style="font-size:10px; color:#64748B; display:block; margin-top:2px;">${st.desc}</small>
          </div>
          <span class="status-indicator">
            <span class="pulse-dot"></span> ${statusText}
          </span>
        </div>

        <div class="station-metrics-row">
          <div>
            <span class="sm-label">Avance / Lotes Procesados</span>
            <span class="sm-val">${st.produced} <small style="font-size:10px; color:#94A3B8;">/ ${st.target}</small></span>
          </div>
          <div>
            <span class="sm-label">En Almacén WIP (Cola)</span>
            <span class="sm-val ${isBottleneck ? 'color-amber' : ''}">${st.wipWaiting} pzas${isBottleneck ? ' ⚠️' : ''}</span>
          </div>
        </div>

        <div class="station-progress">
          <div class="sp-labels">
            <span>Cumplimiento Turno Único</span>
            <strong>${pct}%</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${pct >= 90 ? 'fill-green' : pct >= 70 ? 'fill-brand' : 'fill-red'}" style="width: ${pct}%;"></div>
          </div>
        </div>

        <div class="station-footer">
          <span>👤 ${st.operator}</span>
          <span>⚡ Ciclo: ${st.cycleTime}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderHourlyProgress() {
  const container = document.getElementById('hourlyBars');
  if (!container) return;

  container.innerHTML = UanifyState.hourlyData.map((h, idx) => {
    const isCurrent = idx === 6;
    const overTarget = h.produced > h.target;
    return `
      <div class="hour-col ${isCurrent ? 'current' : ''}">
        <span class="hour-time">${h.hour}</span>
        <div class="hour-pzas" style="color: ${overTarget ? 'var(--color-green)' : h.produced > 0 ? 'var(--color-brand)' : 'var(--text-muted)'}">${h.produced}</div>
        <div class="hour-target">Meta: ${h.target}</div>
      </div>
    `;
  }).join('');
}

function renderDowntimes() {
  const container = document.getElementById('downtimeListAndon') || document.getElementById('downtimeList');
  if (!container) return;

  if (!UanifyState.downtimes.length) {
    container.innerHTML = `<p style="font-size:11px; color:#64748B; text-align:center; padding:12px;">Sin paros registrados en este Turno Único.</p>`;
    return;
  }

  container.innerHTML = UanifyState.downtimes.map(d => `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:8px 12px; border-bottom:1px solid rgba(255,255,255,0.05);">
      <div>
        <strong style="color:#F59E0B; font-size:12px;">🛑 ${d.time} — ${d.station}</strong>
        <div style="font-size:11px; color:#94A3B8; margin-top:2px;">${d.cause}</div>
      </div>
      <div style="text-align:right; min-width:80px;">
        <div style="font-size:11px; color:#F59E0B;">${d.duration}</div>
        <div style="font-size:11px; color:#EF4444;">${d.impact}</div>
      </div>
    </div>
  `).join('');
}

function updateAndonTotals() {
  const prodEl = document.getElementById('andonProducedTotal');
  if (prodEl) prodEl.textContent = `${UanifyState.producedTotal} pzas`;

  // OEE = Disponibilidad × Rendimiento × Calidad
  const avail = 0.942;
  const perf  = Math.min(1, (UanifyState.producedTotal / UanifyState.metaShiftTotal) * (8 / 6.5));
  const qual  = (UanifyState.producedTotal - UanifyState.scrapTotal) / UanifyState.producedTotal;
  const oee   = Math.round(avail * perf * qual * 1000) / 10;

  const oeeEl = document.getElementById('andonGlobalOee');
  if (oeeEl) oeeEl.textContent = `${oee}%`;
}
