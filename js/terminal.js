/**
 * UANIFY MES · TERMINAL DE SUPERVISOR & ESCÁNER DE TARJETA VIAJERA
 *
 * REGLAS DE NEGOCIO VALIDADAS EN AUDIO (Tombstone Hats):
 * ─ Tarjetas viajeras: impresas en Ingeniería, entregadas por supervisor a auxiliar.
 * ─ Lote madre: 60 piezas. Al cruzar la Rampa → auxiliar hace cambio de tarjeta madre
 *   por tarjetas hijas de sublote (15 pzas cada una). El sistema lotificador (Excel actual)
 *   define la subdivisión; Uanify digitaliza y automatiza este proceso.
 * ─ Módulos físicos con pistola QR en puntos de almacén. NO pedal por pieza.
 * ─ Supervisores registran el avance por lote; pueden tener acceso a dispositivo.
 * ─ Operarios NO tienen celular en planta. Identificación por # de empleado.
 * ─ Lotes NUNCA salen incompletos. Si hay piezas con defecto, se sustituyen de saldo.
 * ─ Merma: almacén dedicado → venta de viernes al cliente como "saldo".
 * ─ 4 puntos de inspección de calidad fijos (definidos por Carlos en audio).
 * ─ Registro de avance: por lote al entrar/salir de almacén intermedio.
 */

window.initTerminalView = function() {
  const pedalBtn       = document.getElementById('pedalBtn');
  const counterVisual  = document.getElementById('pedalCounterVisual');
  const terminalProduced = document.getElementById('terminalProduced');
  const terminalScrap  = document.getElementById('terminalScrap');
  const stationSelect  = document.getElementById('terminalStationSelect');
  const modelSelect    = document.getElementById('tombstoneModelSelect');
  const modelSkuEl     = document.getElementById('terminalModelSku');

  const btnScanQr      = document.getElementById('btnScanQr');
  const btnSubdivideLot = document.getElementById('btnSubdivideLot');
  const sublotsContainer = document.getElementById('sublotsContainer');

  // Selector de modelos Tombstone
  if (modelSelect) {
    modelSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      UanifyState.selectedModelIndex = idx;
      const model = UanifyState.activeModels[idx];
      if (model && modelSkuEl) {
        modelSkuEl.textContent =
          `SKU: ${model.sku} | Talla: ${model.size} | Horma: ${model.crownHorma} | ${model.tipo} | ${model.material}`;
      }
    });
    // Trigger inicial
    modelSelect.dispatchEvent(new Event('change'));
  }

  // Cronómetro de ciclo (tiempo entre escaneos)
  let cycleStart = Date.now();
  let timerInterval = null;

  function runCycleStopwatch() {
    if (timerInterval) clearInterval(timerInterval);
    cycleStart = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - cycleStart) / 100);
      const secs = Math.floor(elapsed / 10);
      const ms   = elapsed % 10;
      const display = `00:${secs < 10 ? '0' : ''}${secs}.${ms}`;
      const el = document.getElementById('cycleStopwatch');
      if (el) el.textContent = display;
    }, 100);
  }
  runCycleStopwatch();

  // ── ESCANEAR TARJETA VIAJERA (Pistola QR) ────────────────────────────────
  // Audio: "lector de QR o barras en puntos estratégicos de la planta"
  // Supervisor o auxiliar escanea al llegar el lote a un almacén intermedio.
  if (btnScanQr) {
    btnScanQr.addEventListener('click', () => {
      IndustrialAudio.playQrBeep();
      const lot = UanifyState.activeLots[0];
      alert(
        `🏷️ TARJETA VIAJERA ESCANEADA (Pistola QR/Barras)\n\n` +
        `Lote: ${lot.lotId}\n` +
        `Modelo: ${lot.model}\n` +
        `Horma: ${lot.horma} · Tipo: ${lot.tipo}\n` +
        `Talla: ${lot.size}\n` +
        `Piezas: ${lot.totalPieces} pzas (lote madre completo)\n` +
        `Ubicación actual: ${lot.currentStation}\n` +
        `Auxiliar asignado: ${lot.operator}\n\n` +
        `Tarjeta generada en Ingeniería. Sistema registra avance en 0.2 segundos.\n` +
        `OC asociada: ${UanifyState.compacSync.activeOrderB2B}`
      );
    });
  }

  // ── FRACCIONAR LOTE EN RAMPA ─────────────────────────────────────────────
  // Audio Carlos: "físicamente hacemos cambio de tarjeta... lote 351 lleva el 1,2,3 y 4.
  //   Hay también 1094 con sublotes del 01 al 14."
  // El auxiliar quita la tarjeta madre de 60 pzas y pone las tarjetas hijas de 15 pzas.
  // Uanify reemplaza: un escaneo genera automáticamente los sublotes e imprime las tarjetas hijas.
  if (btnSubdivideLot) {
    btnSubdivideLot.addEventListener('click', () => {
      IndustrialAudio.playPedalClick();
      const lot = UanifyState.activeLots[0];
      lot.isSubdivided = true;
      renderSublots();
      EventBus.emit('lot-subdivided', lot);
      alert(
        `📦 LOTE ${lot.lotId} FRACCIONADO EN SUBLOTES DE 15 PZAS\n\n` +
        `• ${lot.lotId}-01 (15 pzas) — Horma: ${lot.horma}\n` +
        `• ${lot.lotId}-02 (15 pzas) — Horma: ${lot.horma}\n` +
        `• ${lot.lotId}-03 (15 pzas) — Horma: ${lot.horma}\n` +
        `• ${lot.lotId}-04 (15 pzas) — Horma: ${lot.horma}\n\n` +
        `Se generaron 4 tarjetas viajeras hijas con QR.\n` +
        `El auxiliar hace el cambio físico de tarjeta madre → tarjetas hijas.\n` +
        `Asignar a operarios por número de empleado.`
      );
    });
  }

  function renderSublots() {
    if (!sublotsContainer) return;
    const lot = UanifyState.activeLots[0];
    if (!lot.isSubdivided) {
      sublotsContainer.innerHTML = `
        <p style="font-size:11px; color:#94A3B8; padding:8px;">
          Lote <strong style="color:#00E5FF;">${lot.lotId}</strong> completo (${lot.totalPieces} pzas).
          Al cruzar la Rampa hacia la Nave de Hidráulicos, presiona "Fraccionar en Rampa"
          para dividir en sublotes de 15 pzas y generar tarjetas hijas con QR.
        </p>`;
      return;
    }

    sublotsContainer.innerHTML = lot.sublots.map(sl => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); padding:8px 12px; border-radius:8px; margin-bottom:6px;">
        <div>
          <strong style="color:#00E5FF; font-family:'JetBrains Mono'; font-size:12px;">${sl.id}</strong>
          <span style="font-size:11px; color:#E2E8F0; margin-left:8px;">${sl.pieces} pzas</span>
          <small style="display:block; font-size:10px; color:#94A3B8; margin-top:2px;">
            Almacén: ${sl.station} | Op: ${sl.operator || 'Sin asignar'}
          </small>
          <small style="display:block; font-size:10px; color:${sl.status === 'En Proceso' ? '#22c55e' : '#F59E0B'};">
            ● ${sl.status}
          </small>
        </div>
        <button class="btn-secondary" style="padding:4px 8px; font-size:11px;"
          onclick="darAvanceSublote('${sl.id}')">
          📤 Dar Avance
        </button>
      </div>
    `).join('');
  }
  renderSublots();

  // ── DAR AVANCE A SUBLOTE (QR en Almacén Intermedio) ──────────────────────
  window.darAvanceSublote = function(sublotId) {
    IndustrialAudio.playQrBeep();
    const lot = UanifyState.activeLots[0];
    const sl  = lot.sublots.find(s => s.id === sublotId);
    if (sl) {
      sl.station = 'Adorno 1 (Tafilete + Toquilla)';
      sl.status  = 'Avanzado';
      renderSublots();
      EventBus.emit('piece-registered');
      alert(
        `✅ AVANCE REGISTRADO — ${sublotId}\n\n` +
        `${sl.pieces} pzas avanzaron a Almacén de Adorno 1.\n` +
        `Supervisora de Adorno validará disponibilidad de tafilete talla ${lot.size} antes de procesar.\n\n` +
        `Registrado por: Supervisor (módulo físico QR)`
      );
    }
  };

  // ── BOTÓN DE CONTEO MANUAL / PEDAL ──────────────────────────────────────
  // Audio: "ahorita no traemos la parte de pieza por pieza, sería la parte de lotes"
  // Este botón se mantiene para demostración. En producción real el registro es por lote con QR.
  function triggerPieceRegistration() {
    IndustrialAudio.playPedalClick();
    if (pedalBtn) {
      pedalBtn.classList.add('pedal-pressed');
      setTimeout(() => pedalBtn.classList.remove('pedal-pressed'), 120);
    }

    const stId = stationSelect ? stationSelect.value : 'prensas';
    const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[5];
    station.produced++;
    UanifyState.producedTotal++;
    UanifyState.hourlyData[6].produced++;

    if (counterVisual)   counterVisual.textContent  = station.produced;
    if (terminalProduced) terminalProduced.textContent = `${station.produced} pzas`;

    runCycleStopwatch();
    EventBus.emit('piece-registered', { station, total: UanifyState.producedTotal });
  }

  if (pedalBtn) pedalBtn.addEventListener('click', triggerPieceRegistration);

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

  // Cambio de estación en selector
  if (stationSelect) {
    stationSelect.addEventListener('change', (e) => {
      const selected = UanifyState.stations.find(s => s.id === e.target.value);
      if (selected) {
        if (counterVisual)    counterVisual.textContent   = selected.produced;
        if (terminalProduced) terminalProduced.textContent = `${selected.produced} pzas`;
        if (terminalScrap)    terminalScrap.textContent    = `${selected.scrap} pzas`;
        const opEl = document.getElementById('terminalOperator');
        if (opEl) opEl.textContent = selected.operator;
      }
    });
  }

  // ── MODALES ─────────────────────────────────────────────────────────────
  const modalScrap  = document.getElementById('modalScrap');
  const btnReportScrap = document.getElementById('btnReportScrap');
  const btnCloseScrap  = document.getElementById('btnCloseScrapModal');
  const modalStop   = document.getElementById('modalStop');
  const btnReportStop  = document.getElementById('btnReportStop');
  const btnCloseStop   = document.getElementById('btnCloseStopModal');

  if (btnReportScrap && modalScrap) btnReportScrap.addEventListener('click', () => modalScrap.classList.add('active'));
  if (btnCloseScrap  && modalScrap) btnCloseScrap.addEventListener('click',  () => modalScrap.classList.remove('active'));
  if (btnReportStop  && modalStop)  btnReportStop.addEventListener('click',  () => modalStop.classList.add('active'));
  if (btnCloseStop   && modalStop)  btnCloseStop.addEventListener('click',   () => modalStop.classList.remove('active'));

  // ── REGISTRO DE MERMA / SEGUNDA ──────────────────────────────────────────
  // Audio: merma → almacén dedicado → venta de viernes.
  // Si tiene arreglo → regresa al dpto. previo. Si no → saldo/segunda.
  // Audio: "Producto sin arreglo → saldo. Se pueden crear lotes [de saldo]."
  document.querySelectorAll('.scrap-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const reason    = btn.getAttribute('data-reason');
      const isSeconda = btn.getAttribute('data-type') === 'segunda';
      IndustrialAudio.playAlert('scrap');

      const stId    = stationSelect ? stationSelect.value : 'prensas';
      const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[5];

      if (isSeconda) {
        UanifyState.secondGradeTotal++;
        alert(
          `📦 SALDO / SEGUNDA REGISTRADA\n\n` +
          `Motivo: "${reason}"\n` +
          `Departamento: ${station.name}\n\n` +
          `Pieza separada al almacén de saldos.\n` +
          `Acumuladas esta semana: ${UanifyState.secondGradeTotal} pzas para venta de viernes.`
        );
      } else {
        station.scrap++;
        UanifyState.scrapTotal++;
        if (terminalScrap) terminalScrap.textContent = `${station.scrap} pzas`;
        alert(
          `⚠️ MERMA REGISTRADA EN ${station.name}\n\n` +
          `Motivo: "${reason}"\n\n` +
          `Pieza sin posibilidad de arreglo. Descontada de producción efectiva.\n` +
          `El lote se repone con pieza de saldo para mantenerlo completo (60 pzas).`
        );
      }

      if (modalScrap) modalScrap.classList.remove('active');
      EventBus.emit('scrap-registered', { station, reason });
    });
  });

  // ── REGISTRO DE PARO ─────────────────────────────────────────────────────
  document.querySelectorAll('.stop-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stopReason = btn.getAttribute('data-stop');
      IndustrialAudio.playAlert('stop');

      const stId    = stationSelect ? stationSelect.value : 'prensas';
      const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[5];
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

      if (modalStop) modalStop.classList.remove('active');

      const statusBadge = document.getElementById('terminalMachineStatus');
      if (statusBadge) {
        statusBadge.textContent = 'MÁQUINA / ÁREA DETENIDA';
        statusBadge.className = 'badge-status status-stopped';
      }

      EventBus.emit('status-updated');
      alert(
        `🛑 PARO REGISTRADO — ${station.name}\n\n` +
        `Hora: ${timeStr}\n` +
        `Motivo: "${stopReason}"\n\n` +
        `Notificado al Ingeniero de Procesos y Tablero Andon en ROJO.\n` +
        `Supervisor debe confirmar reanudación para cerrar el paro.`
      );
    });
  });
};
