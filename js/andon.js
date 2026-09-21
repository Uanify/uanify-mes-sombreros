/**
 * UANIFY MES · TABLERO ANDON CONTROLLER
 * Renders floor TV display, machine states and hourly production bars
 */

window.initAndonView = function() {
  renderStations();
  renderHourlyProgress();

  EventBus.on('piece-registered', () => {
    updateAndonTotals();
    renderStations();
    renderHourlyProgress();
  });

  EventBus.on('status-updated', () => {
    renderStations();
  });
};

function renderStations() {
  const grid = document.getElementById('stationsGrid');
  if (!grid) return;

  grid.innerHTML = UanifyState.stations.map(st => {
    const pct = Math.min(100, Math.round((st.produced / st.target) * 100));
    const statusText = st.status === 'running' ? 'OPERANDO' : st.status === 'warning' ? 'AJUSTE' : 'PARO';
    const statusClass = `status-${st.status}`;

    return `
      <div class="station-card ${statusClass}" data-station-id="${st.id}">
        <div class="station-header">
          <div>
            <span class="station-num">${st.code}</span>
            <h4 class="station-name">${st.name}</h4>
          </div>
          <span class="status-indicator">
            <span class="pulse-dot"></span> ${statusText}
          </span>
        </div>

        <div class="station-metrics-row">
          <div>
            <span class="sm-label">Producidas</span>
            <span class="sm-val">${st.produced} <small style="font-size:10px; color:#64748B;">/ ${st.target}</small></span>
          </div>
          <div>
            <span class="sm-label">Mermas / Scrap</span>
            <span class="sm-val ${st.scrap > 3 ? 'color-red' : ''}">${st.scrap} pzas</span>
          </div>
        </div>

        <div class="station-progress">
          <div class="sp-labels">
            <span>Cumplimiento</span>
            <strong>${pct}%</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill fill-cyan" style="width: ${pct}%;"></div>
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
    const isCurrent = idx === 6; // Hour 13:00 is active in demo
    return `
      <div class="hour-col ${isCurrent ? 'current' : ''}">
        <span class="hour-time">${h.hour}</span>
        <div class="hour-pzas">${h.produced}</div>
        <div class="hour-target">Meta: ${h.target}</div>
      </div>
    `;
  }).join('');
}

function updateAndonTotals() {
  const prodEl = document.getElementById('andonProducedTotal');
  if (prodEl) prodEl.textContent = `${UanifyState.producedTotal} pzas`;

  // Calculate live global OEE estimate
  const avail = 0.942;
  const perf = (UanifyState.producedTotal / UanifyState.metaShiftTotal) * (8 / 6.5); // Adjusted for shift progress
  const qual = (UanifyState.producedTotal - UanifyState.scrapTotal) / UanifyState.producedTotal;
  const oee = Math.round(avail * Math.min(1, perf) * qual * 1000) / 10;

  const oeeEl = document.getElementById('andonGlobalOee');
  if (oeeEl) oeeEl.textContent = `${oee}%`;
}
