/**
 * UANIFY MES · CONSOLA DE INGENIERÍA & OEE
 * Bottleneck detection, pipeline balance, downtime table and shift simulator
 */

window.initEngineerView = function() {
  renderPipeline();
  renderDowntimes();
  updateOeeScores();

  EventBus.on('piece-registered', () => {
    renderPipeline();
    updateOeeScores();
  });

  EventBus.on('scrap-registered', () => {
    updateOeeScores();
  });

  EventBus.on('status-updated', () => {
    renderDowntimes();
    renderPipeline();
  });

  // Buttons for Simulation
  const btnSimulate = document.getElementById('btnSimulateShift');
  if (btnSimulate) {
    btnSimulate.addEventListener('click', () => {
      // Simulate 1 hour of plant production across all stations
      UanifyState.stations.forEach(st => {
        const added = Math.floor(Math.random() * 12) + 8;
        st.produced += added;
        UanifyState.producedTotal += added;
      });

      // Advance hourly
      const currentH = UanifyState.hourlyData.find(h => h.produced < h.target);
      if (currentH) {
        currentH.produced += Math.floor(Math.random() * 20) + 40;
      }

      IndustrialAudio.playPedalClick();
      EventBus.emit('piece-registered');
      alert('⚡ Simulación: Se ha añadido 1 hora de producción en piso a todas las estaciones de San Pancho.');
    });
  }

  const btnReset = document.getElementById('btnResetSimulation');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('¿Reiniciar métricas del turno de demostración?')) {
        location.reload();
      }
    });
  }
};

function renderPipeline() {
  const container = document.getElementById('pipelineViz');
  if (!container) return;

  const maxWip = 50;

  container.innerHTML = UanifyState.stations.map(st => {
    const isBottleneck = st.wipWaiting >= 30;
    const barWidth = Math.min(100, Math.round((st.wipWaiting / maxWip) * 100));

    return `
      <div class="pipe-row">
        <span class="pipe-name">${st.name}</span>
        <div class="pipe-track">
          <div class="pipe-fill ${isBottleneck ? 'bottleneck' : ''}" style="width: ${barWidth}%;"></div>
        </div>
        <span class="pipe-count ${isBottleneck ? 'color-amber' : ''}">
          ${st.wipWaiting} pzas cola
        </span>
      </div>
    `;
  }).join('');
}

function renderDowntimes() {
  const tbody = document.getElementById('downtimeTbody');
  if (!tbody) return;

  tbody.innerHTML = UanifyState.downtimes.map(d => {
    return `
      <tr>
        <td><strong>${d.time}</strong></td>
        <td>${d.station}</td>
        <td>${d.cause}</td>
        <td><span class="color-red">${d.duration}</span></td>
        <td>${d.impact}</td>
      </tr>
    `;
  }).join('');
}

function updateOeeScores() {
  const avail = 94.2;
  const perf = Math.min(99.0, Math.round((UanifyState.producedTotal / 650) * 91.8 * 10) / 10);
  const qual = Math.round(((UanifyState.producedTotal - UanifyState.scrapTotal) / UanifyState.producedTotal) * 1000) / 10;
  const oee = Math.round(((avail / 100) * (perf / 100) * (qual / 100)) * 1000) / 10;

  const scoreEl = document.getElementById('oeeGlobalScore');
  const qualEl = document.getElementById('oeeQualBadge');
  const perfEl = document.getElementById('oeePerfBadge');

  if (scoreEl) scoreEl.textContent = `${oee}%`;
  if (qualEl) qualEl.textContent = `${qual}%`;
  if (perfEl) perfEl.textContent = `${perf}%`;
}
