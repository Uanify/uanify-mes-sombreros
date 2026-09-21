/**
 * UANIFY MES · TERMINAL DE PUESTO & SIMULADOR DE PEDAL
 * Ergonomic pulse counting, cycle timer, scrap and stoppage reporting
 */

window.initTerminalView = function() {
  const pedalBtn = document.getElementById('pedalBtn');
  const counterVisual = document.getElementById('pedalCounterVisual');
  const terminalProduced = document.getElementById('terminalProduced');
  const terminalScrap = document.getElementById('terminalScrap');
  const stationSelect = document.getElementById('terminalStationSelect');

  // Cycle Timer
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

  // Register Piece Action
  function triggerPieceRegistration() {
    IndustrialAudio.playPedalClick();

    // Haptic/visual button push
    if (pedalBtn) {
      pedalBtn.classList.add('pedal-pressed');
      setTimeout(() => pedalBtn.classList.remove('pedal-pressed'), 120);
    }

    // Find active station
    const stId = stationSelect ? stationSelect.value : 'prensas';
    const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[1];

    station.produced++;
    UanifyState.producedTotal++;

    // Increment current hour in demo
    UanifyState.hourlyData[6].produced++;

    // Update UI
    if (counterVisual) counterVisual.textContent = station.produced;
    if (terminalProduced) terminalProduced.textContent = `${station.produced} pzas`;

    // Reset cycle stopwatch
    runCycleStopwatch();

    EventBus.emit('piece-registered', { station, total: UanifyState.producedTotal });
  }

  if (pedalBtn) {
    pedalBtn.addEventListener('click', triggerPieceRegistration);
  }

  // Keyboard shortcut (Space / Enter) when in terminal view
  window.addEventListener('keydown', (e) => {
    if (UanifyState.activeTab === 'terminal') {
      if (e.code === 'Space' || e.code === 'Enter') {
        // Prevent page scrolling on space
        if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          triggerPieceRegistration();
        }
      }
    }
  });

  // Station Change
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

  // MODALS LOGIC
  const modalScrap = document.getElementById('modalScrap');
  const btnReportScrap = document.getElementById('btnReportScrap');
  const btnCloseScrap = document.getElementById('btnCloseScrapModal');

  const modalStop = document.getElementById('modalStop');
  const btnReportStop = document.getElementById('btnReportStop');
  const btnCloseStop = document.getElementById('btnCloseStopModal');

  if (btnReportScrap && modalScrap) {
    btnReportScrap.addEventListener('click', () => {
      modalScrap.classList.add('active');
    });
  }

  if (btnCloseScrap && modalScrap) {
    btnCloseScrap.addEventListener('click', () => {
      modalScrap.classList.remove('active');
    });
  }

  if (btnReportStop && modalStop) {
    btnReportStop.addEventListener('click', () => {
      modalStop.classList.add('active');
    });
  }

  if (btnCloseStop && modalStop) {
    btnCloseStop.addEventListener('click', () => {
      modalStop.classList.remove('active');
    });
  }

  // Scrap Option Click
  document.querySelectorAll('.scrap-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const reason = btn.getAttribute('data-reason');
      IndustrialAudio.playAlert('scrap');

      const stId = stationSelect ? stationSelect.value : 'prensas';
      const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[1];
      station.scrap++;
      UanifyState.scrapTotal++;

      if (terminalScrap) terminalScrap.textContent = `${station.scrap} pzas`;
      modalScrap.classList.remove('active');

      EventBus.emit('scrap-registered', { station, reason });
      alert(`⚠️ Defecto registrado en ${station.name}:\n"${reason}"\n\nRegistrado en base de datos local y contabilizado para OEE.`);
    });
  });

  // Stop Option Click
  document.querySelectorAll('.stop-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stopReason = btn.getAttribute('data-stop');
      IndustrialAudio.playAlert('stop');

      const stId = stationSelect ? stationSelect.value : 'prensas';
      const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[1];
      station.status = 'stopped';

      // Log in downtimes
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
      alert(`🛑 PARO DE LÍNEA REGISTRADO:\n${station.name}\nMotivo: "${stopReason}"\n\nEl Tablero Andon ha cambiado a ROJO y la alerta fue enviada al Ingeniero.`);
    });
  });
};
