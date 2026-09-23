/**
 * UANIFY MES · CONSOLA DE INGENIERÍA & OEE
 * Control de cuellos de botella, stock de subensambles (Tafiletes por talla) y paros SMED
 */

window.initEngineerView = function() {
  renderPipeline();
  renderDowntimes();
  renderTafileteStock();
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

  // Simular avance de 1 hora
  const btnSimulate = document.getElementById('btnSimulateShift');
  if (btnSimulate) {
    btnSimulate.addEventListener('click', () => {
      UanifyState.stations.forEach(st => {
        const added = Math.floor(Math.random() * 10) + 6;
        st.produced += added;
        UanifyState.producedTotal += added;
      });

      const currentH = UanifyState.hourlyData.find(h => h.produced < h.target);
      if (currentH) {
        currentH.produced += Math.floor(Math.random() * 20) + 40;
      }

      IndustrialAudio.playPedalClick();
      EventBus.emit('piece-registered');
      alert('⚡ Simulación de Planta: Se procesó 1 hora de producción en todos los departamentos de Tombstone.');
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
    const isBottleneck = st.wipWaiting >= 25;
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

function renderTafileteStock() {
  const container = document.getElementById('tafileteStockTable');
  if (!container) return;

  container.innerHTML = UanifyState.tafileteStock.map(t => `
    <tr>
      <td><strong>Talla ${t.size}</strong></td>
      <td>${t.stock} pzas</td>
      <td><span style="color:#F59E0B;">${t.reserved} pzas</span></td>
      <td><strong style="color:#00E676;">${t.available} pzas</strong></td>
      <td>
        <span class="badge-subtle" style="color:${t.available > 40 ? '#00E676' : '#FF1744'};">
          ${t.available > 40 ? '✅ Abastecido' : '⚠️ Crítico'}
        </span>
      </td>
    </tr>
  `).join('');
}

function renderDowntimes() {
  const tbody = document.getElementById('downtimeTbody');
  if (!tbody) return;

  tbody.innerHTML = UanifyState.downtimes.map(d => `
    <tr>
      <td><strong>${d.time}</strong></td>
      <td>${d.station}</td>
      <td>${d.cause}</td>
      <td><span class="color-red">${d.duration}</span></td>
      <td>${d.impact}</td>
    </tr>
  `).join('');
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
