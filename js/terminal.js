/**
 * UANIFY MES · TERMINAL DE SUPERVISOR / OPERARIO & ESCÁNER DE TARJETA VIAJERA
 * Implementa la lógica operativa validada en planta:
 * - Escaneo QR de Tarjeta Viajera (Lote de 60 pzas)
 * - Fraccionamiento de Lote en 4 Sublotes de 15 pzas (Rampa / Alineado)
 * - Registro de Avance de Fracción por Almacén
 * - Asignación de Operarios y Registro de Segundas para los viernes
 */

window.initTerminalView = function() {
  const pedalBtn = document.getElementById('pedalBtn');
  const counterVisual = document.getElementById('pedalCounterVisual');
  const terminalProduced = document.getElementById('terminalProduced');
  const terminalScrap = document.getElementById('terminalScrap');
  const stationSelect = document.getElementById('terminalStationSelect');
  const modelSelect = document.getElementById('tombstoneModelSelect');
  const modelSkuEl = document.getElementById('terminalModelSku');

  const btnScanQr = document.getElementById('btnScanQr');
  const btnSubdivideLot = document.getElementById('btnSubdivideLot');
  const lotSelector = document.getElementById('lotSelector');
  const sublotsContainer = document.getElementById('sublotsContainer');

  // Selector de modelos Tombstone
  if (modelSelect) {
    modelSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      UanifyState.selectedModelIndex = idx;
      const model = UanifyState.activeModels[idx];
      if (model && modelSkuEl) {
        modelSkuEl.textContent = `SKU: ${model.sku} | Talla: ${model.size} | Horma: ${model.crownHorma} | ${model.material}`;
      }
    });
  }

  // Cronómetro de ciclo
  let cycleStart = Date.now();
  let timerInterval = null;

  function runCycleStopwatch() {
    if (timerInterval) clearInterval(timerInterval);
    cycleStart = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - cycleStart) / 100);
      const secs = Math.floor(elapsed / 10);
      const ms = elapsed % 10;
      const display = `00:${secs < 10 ? '0' : ''}${secs}.${ms}`;
      const el = document.getElementById('cycleStopwatch');
      if (el) el.textContent = display;
    }, 100);
  }
  runCycleStopwatch();

  // Escanear Tarjeta Viajera (Pistola QR)
  if (btnScanQr) {
    btnScanQr.addEventListener('click', () => {
      IndustrialAudio.playQrBeep();
      const lot = UanifyState.activeLots[0];
      alert(`🏷️ TARJETA VIAJERA ESCANEADA (QR):\n\nLote: ${lot.lotId}\nModelo: ${lot.model}\nTalla: ${lot.size}\nPiezas en Lote: ${lot.totalPieces} pzas\nUbicación actual: ${lot.currentStation}\nOperador asignado: ${lot.operator}\n\nDatos cargados al sistema en 0.2 segundos.`);
    });
  }

  // Fraccionar Lote en Sublotes (Rampa de Alineado)
  if (btnSubdivideLot) {
    btnSubdivideLot.addEventListener('click', () => {
      IndustrialAudio.playPedalClick();
      const lot = UanifyState.activeLots[0];
      lot.isSubdivided = true;
      renderSublots();
      EventBus.emit('lot-subdivided', lot);
      alert(`📦 LOTE ${lot.lotId} FRACCIONADO EN 4 SUBLOTES DE 15 PZAS:\n\n• ${lot.lotId}-01 (15 pzas)\n• ${lot.lotId}-02 (15 pzas)\n• ${lot.lotId}-03 (15 pzas)\n• ${lot.lotId}-04 (15 pzas)\n\nSe generaron 4 tarjetas viajeras hijas con QR listos para asignar a operarios.`);
    });
  }

  function renderSublots() {
    if (!sublotsContainer) return;
    const lot = UanifyState.activeLots[0];
    if (!lot.isSubdivided) {
      sublotsContainer.innerHTML = `<p style="font-size:11px; color:#94A3B8;">Lote completo de 60 piezas. Presiona "Fraccionar Lote" en la rampa de alineado para dividir en 4 sublotes de 15 piezas.</p>`;
      return;
    }

    sublotsContainer.innerHTML = lot.sublots.map(sl => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); padding:8px 12px; border-radius:8px; margin-bottom:6px;">
        <div>
          <strong style="color:#00E5FF; font-family:'JetBrains Mono'; font-size:12px;">${sl.id}</strong>
          <span style="font-size:11px; color:#E2E8F0; margin-left:8px;">${sl.pieces} pzas</span>
          <small style="display:block; font-size:10px; color:#94A3B8;">Estación: ${sl.station} | Op: ${sl.operator}</small>
        </div>
        <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="darAvanceSublote('${sl.id}')">Dar Avance</button>
      </div>
    `).join('');
  }
  renderSublots();

  window.darAvanceSublote = function(sublotId) {
    IndustrialAudio.playQrBeep();
    const lot = UanifyState.activeLots[0];
    const sl = lot.sublots.find(s => s.id === sublotId);
    if (sl) {
      sl.station = 'Adorno 1 (Tafilete)';
      sl.status = 'Avanzado';
      renderSublots();
      EventBus.emit('piece-registered');
      alert(`✅ AVANCE REGISTRADO PARA ${sublotId}:\nEl sublote de ${sl.pieces} pzas avanzó a Almacén de Adorno 1.`);
    }
  };

  // Botón Principal de Conteo / Pedal
  function triggerPieceRegistration() {
    IndustrialAudio.playPedalClick();

    if (pedalBtn) {
      pedalBtn.classList.add('pedal-pressed');
      setTimeout(() => pedalBtn.classList.remove('pedal-pressed'), 120);
    }

    const stId = stationSelect ? stationSelect.value : 'prensas';
    const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[3];

    station.produced++;
    UanifyState.producedTotal++;
    UanifyState.hourlyData[6].produced++;

    if (counterVisual) counterVisual.textContent = station.produced;
    if (terminalProduced) terminalProduced.textContent = `${station.produced} pzas`;

    runCycleStopwatch();
    EventBus.emit('piece-registered', { station, total: UanifyState.producedTotal });
  }

  if (pedalBtn) {
    pedalBtn.addEventListener('click', triggerPieceRegistration);
  }

  // Atajo de teclado ESPACIO / ENTER
  window.addEventListener('keydown', (e) => {
    if (UanifyState.activeTab === 'terminal') {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          triggerPieceRegistration();
        }
      }
    }
  });

  // Cambio de estación
  if (stationSelect) {
    stationSelect.addEventListener('change', (e) => {
      const selected = UanifyState.stations.find(s => s.id === e.target.value);
      if (selected) {
        if (counterVisual) counterVisual.textContent = selected.produced;
        if (terminalProduced) terminalProduced.textContent = `${selected.produced} pzas`;
        if (terminalScrap) terminalScrap.textContent = `${selected.scrap} pzas`;
        const opEl = document.getElementById('terminalOperator');
        if (opEl) opEl.textContent = selected.operator;
      }
    });
  }

  // Modales
  const modalScrap = document.getElementById('modalScrap');
  const btnReportScrap = document.getElementById('btnReportScrap');
  const btnCloseScrap = document.getElementById('btnCloseScrapModal');

  const modalStop = document.getElementById('modalStop');
  const btnReportStop = document.getElementById('btnReportStop');
  const btnCloseStop = document.getElementById('btnCloseStopModal');

  if (btnReportScrap && modalScrap) {
    btnReportScrap.addEventListener('click', () => modalScrap.classList.add('active'));
  }
  if (btnCloseScrap && modalScrap) {
    btnCloseScrap.addEventListener('click', () => modalScrap.classList.remove('active'));
  }

  if (btnReportStop && modalStop) {
    btnReportStop.addEventListener('click', () => modalStop.classList.add('active'));
  }
  if (btnCloseStop && modalStop) {
    btnCloseStop.addEventListener('click', () => modalStop.classList.remove('active'));
  }

  // Registro de Merma o Segunda
  document.querySelectorAll('.scrap-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const reason = btn.getAttribute('data-reason');
      IndustrialAudio.playAlert('scrap');

      const isSecond = btn.getAttribute('data-type') === 'segunda';
      const stId = stationSelect ? stationSelect.value : 'prensas';
      const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[3];

      if (isSecond) {
        UanifyState.secondGradeTotal++;
        alert(`📦 PRODUCTO REGULAR / SEGUNDA REGISTRADO:\nMotivo: "${reason}"\n\nSeparado en almacén de saldos para venta de viernes.`);
      } else {
        station.scrap++;
        UanifyState.scrapTotal++;
        if (terminalScrap) terminalScrap.textContent = `${station.scrap} pzas`;
        alert(`⚠️ MERMA REGISTRADA EN ${station.name}:\n"${reason}"\n\nDescontado de producción efectiva.`);
      }

      modalScrap.classList.remove('active');
      EventBus.emit('scrap-registered', { station, reason });
    });
  });

  // Registro de Paro
  document.querySelectorAll('.stop-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stopReason = btn.getAttribute('data-stop');
      IndustrialAudio.playAlert('stop');

      const stId = stationSelect ? stationSelect.value : 'prensas';
      const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[3];
      station.status = 'stopped';

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      UanifyState.downtimes.unshift({
        time: timeStr,
        station: station.name,
        cause: stopReason,
        duration: 'En curso...',
        impact: 'Calculando'
      });

      modalStop.classList.remove('active');

      const statusBadge = document.getElementById('terminalMachineStatus');
      if (statusBadge) {
        statusBadge.textContent = 'MÁQUINA DETENIDA';
        statusBadge.className = 'badge-status status-stopped';
      }

      EventBus.emit('status-updated');
      alert(`🛑 PARO DE LÍNEA REGISTRADO EN TOMBSTONE:\n${station.name}\nMotivo: "${stopReason}"\n\nNotificado al Ingeniero y Andon en ROJO.`);
    });
  });
};
