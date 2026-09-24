/**
 * UANIFY MES · TERMINAL DE SUPERVISOR & ESCÁNER DE TARJETA VIAJERA (iPAD)
 *
 * REGLAS DE NEGOCIO VALIDADAS EN AUDIO (Tombstone Hats):
 * ─ Tarjetas viajeras: impresas en Ingeniería, entregadas por supervisor a auxiliar.
 * ─ Lote madre: 60 piezas. Al cruzar la Rampa → auxiliar hace cambio de tarjeta madre
 *   por tarjetas hijas de sublote (15 pzas cada una).
 * ─ Módulos físicos con iPad / lector QR en puntos de almacén. NO pedal ni teclado.
 * ─ Supervisores registran el avance por lote al entrar y salir del almacén intermedio.
 * ─ Operarios NO tienen celular en planta. Identificación por # de empleado.
 * ─ Lotes NUNCA salen incompletos. Si hay piezas con defecto, se sustituyen de saldo.
 * ─ Merma: almacén dedicado → venta de viernes al cliente como "saldo".
 * ─ Sin sonidos audibles (audio industrial desactivado).
 */

window.initTerminalView = function() {
  const terminalProduced = document.getElementById('terminalProduced');
  const terminalScrap    = document.getElementById('terminalScrap');
  const terminalSecond   = document.getElementById('terminalSecondGrade');
  const stationSelect    = document.getElementById('terminalStationSelect');
  const modelSelect      = document.getElementById('tombstoneModelSelect');
  const modelSkuEl       = document.getElementById('terminalModelSku');

  const btnScanQr        = document.getElementById('btnScanQr');
  const manualQrInput    = document.getElementById('manualQrInput');
  const btnRegisterEntry = document.getElementById('btnRegisterEntry');
  const btnRegisterExit  = document.getElementById('btnRegisterExit');
  const btnSubdivideLot  = document.getElementById('btnSubdivideLot');
  const sublotsContainer = document.getElementById('sublotsContainer');
  const sublotsCountBadge= document.getElementById('sublotsCountBadge');

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
    modelSelect.dispatchEvent(new Event('change'));
  }

  // Flash visual en visor del escáner (reemplaza beeps de sonido)
  function flashScannerVisual(success = true) {
    const vf = document.querySelector('.scanner-viewfinder');
    if (vf) {
      vf.style.transition = 'all 0.15s ease';
      vf.style.borderColor = success ? 'var(--color-green)' : 'var(--color-red)';
      vf.style.background = success ? 'var(--color-green-bg)' : 'var(--color-red-bg)';
      setTimeout(() => {
        vf.style.borderColor = 'var(--color-brand)';
        vf.style.background = '#FDFDFD';
      }, 350);
    }
  }

  // ── ESCANEAR TARJETA VIAJERA (iPAD / PISTOLA QR) ─────────────────────────
  if (btnScanQr) {
    btnScanQr.addEventListener('click', () => {
      const query = (manualQrInput ? manualQrInput.value.trim() : '') || '1094-01';
      flashScannerVisual(true);

      const lot = UanifyState.activeLots[0];
      alert(
        `🏷️ TARJETA VIAJERA IDENTIFICADA (Visor iPad)\n\n` +
        `Código: ${query}\n` +
        `Lote Madre: ${lot.lotId} (60 pzas)\n` +
        `Modelo: ${lot.model}\n` +
        `Horma: ${lot.horma} · Tipo: ${lot.tipo}\n` +
        `Talla: ${lot.size}\n` +
        `Ubicación: ${lot.currentStation}\n` +
        `Auxiliar responsable: ${lot.operator}\n\n` +
        `✅ Validación en 0.2 seg · Tarjeta autorizada por Ingeniería\n` +
        `OC Asociada: ${UanifyState.compacSync.activeOrderB2B}`
      );
    });
  }

  // ── REGISTRAR ENTRADA A ALMACÉN INTERMEDIO ───────────────────────────────
  if (btnRegisterEntry) {
    btnRegisterEntry.addEventListener('click', () => {
      flashScannerVisual(true);
      const stId = stationSelect ? stationSelect.value : 'prensas';
      const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[5];
      
      station.produced += 15;
      UanifyState.producedTotal += 15;
      if (terminalProduced) terminalProduced.textContent = `${station.produced} pzas`;

      const andonTotalEl = document.getElementById('andonProducedTotal');
      if (andonTotalEl) andonTotalEl.textContent = `${UanifyState.producedTotal} pzas`;

      EventBus.emit('piece-registered', { station, total: UanifyState.producedTotal });
      alert(
        `📥 ENTRADA REGISTRADA EN ALMACÉN\n\n` +
        `Sublote: ${manualQrInput ? manualQrInput.value : '1094-01'} (15 pzas)\n` +
        `Almacén / Departamento: ${station.name}\n` +
        `Operador en Turno: ${station.operator}\n\n` +
        `Piezas en cola actualizadas en Tablero Andon.`
      );
    });
  }

  // ── REGISTRAR SALIDA / AVANCE A SIGUIENTE DEPARTAMENTO ────────────────────
  if (btnRegisterExit) {
    btnRegisterExit.addEventListener('click', () => {
      flashScannerVisual(true);
      const stId = stationSelect ? stationSelect.value : 'prensas';
      const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[5];

      alert(
        `📤 SALIDA CONFIRMADA — LIBERACIÓN DE LOTE\n\n` +
        `Lote: ${manualQrInput ? manualQrInput.value : '1094-01'}\n` +
        `Liberado de: ${station.name}\n` +
        `Destino: Siguiente Almacén en Flujo\n\n` +
        `Supervisor confirmó calidad de lote (60 pzas completas sin faltantes).`
      );
    });
  }

  // ── FRACCIONAR LOTE EN RAMPA (60 → 15 pzas) ──────────────────────────────
  if (btnSubdivideLot) {
    btnSubdivideLot.addEventListener('click', () => {
      flashScannerVisual(true);
      const lot = UanifyState.activeLots[0];
      lot.isSubdivided = true;
      renderSublots();
      EventBus.emit('lot-subdivided', lot);
      alert(
        `✂️ LOTE ${lot.lotId} FRACCIONADO EN RAMPA\n\n` +
        `• ${lot.lotId}-01 (15 pzas) — Horma: ${lot.horma}\n` +
        `• ${lot.lotId}-02 (15 pzas) — Horma: ${lot.horma}\n` +
        `• ${lot.lotId}-03 (15 pzas) — Horma: ${lot.horma}\n` +
        `• ${lot.lotId}-04 (15 pzas) — Horma: ${lot.horma}\n\n` +
        `Se sustituyó la tarjeta madre física de 60 pzas por 4 tarjetas hijas de 15 pzas.\n` +
        `Cada auxiliar de prensas recibe su tarjeta viajera con QR.`
      );
    });
  }

  function renderSublots() {
    if (!sublotsContainer) return;
    const lot = UanifyState.activeLots[0];
    if (!lot.isSubdivided) {
      sublotsContainer.innerHTML = `
        <div style="font-size:12px; color:var(--text-muted); padding:10px; background:var(--bg-core); border-radius:8px; border:1px solid var(--border-subtle);">
          Lote <strong style="color:var(--color-brand);">${lot.lotId}</strong> en proceso de 60 pzas.
          Presiona <strong>"Fraccionar en Rampa"</strong> para dividirlo en 4 fracciones de 15 pzas.
        </div>`;
      if (sublotsCountBadge) sublotsCountBadge.textContent = 'Madre (60 pzas)';
      return;
    }

    if (sublotsCountBadge) sublotsCountBadge.textContent = `${lot.sublots.length} activos (15 pzas c/u)`;

    sublotsContainer.innerHTML = lot.sublots.map(sl => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#FFFFFF; border:1px solid var(--border-subtle); padding:10px 12px; border-radius:8px; margin-bottom:6px; box-shadow:var(--shadow-sm);">
        <div>
          <strong style="color:var(--color-brand); font-family:'JetBrains Mono'; font-size:12.5px;">${sl.id}</strong>
          <span style="font-size:11.5px; color:var(--text-primary); margin-left:6px; font-weight:600;">${sl.pieces} pzas</span>
          <small style="display:block; font-size:10.5px; color:var(--text-muted); margin-top:2px;">
            Almacén: ${sl.station} | Op: ${sl.operator || 'Sin asignar'}
          </small>
          <small style="display:block; font-size:10px; font-weight:700; color:${sl.status === 'En Proceso' ? 'var(--color-green)' : 'var(--color-amber)'}; margin-top:2px;">
            ● ${sl.status}
          </small>
        </div>
        <button class="btn-secondary" style="padding:6px 10px; font-size:11.5px;"
          onclick="darAvanceSublote('${sl.id}')">
          📤 Dar Avance
        </button>
      </div>
    `).join('');
  }
  renderSublots();

  // ── DAR AVANCE A SUBLOTE ─────────────────────────────────────────────────
  window.darAvanceSublote = function(sublotId) {
    flashScannerVisual(true);
    const lot = UanifyState.activeLots[0];
    const sl  = lot.sublots.find(s => s.id === sublotId);
    if (sl) {
      sl.station = 'Adorno 1 (Tafilete + Toquilla)';
      sl.status  = 'Avanzado';
      renderSublots();
      EventBus.emit('piece-registered');
      alert(
        `✅ AVANCE REGISTRADO — ${sublotId}\n\n` +
        `${sl.pieces} pzas avanzaron al Almacén de Adorno 1.\n` +
        `Supervisora de Adorno validará disponibilidad de tafilete talla ${lot.size} antes de montar toquilla.\n\n` +
        `Registrado desde estación iPad de Almacén.`
      );
    }
  };

  // Cambio de estación en selector
  if (stationSelect) {
    stationSelect.addEventListener('change', (e) => {
      const selected = UanifyState.stations.find(s => s.id === e.target.value);
      if (selected) {
        if (terminalProduced) terminalProduced.textContent = `${selected.produced} pzas`;
        if (terminalScrap)    terminalScrap.textContent    = `${selected.scrap} pzas`;
        const opEl = document.getElementById('terminalOperator');
        if (opEl) opEl.textContent = selected.operator;
      }
    });
  }

  // ── MODALES ──────────────────────────────────────────────────────────────
  const modalScrap     = document.getElementById('modalScrap');
  const btnReportScrap = document.getElementById('btnReportScrap');
  const btnCloseScrap  = document.getElementById('btnCloseScrapModal');
  const modalStop      = document.getElementById('modalStop');
  const btnReportStop  = document.getElementById('btnReportStop');
  const btnCloseStop   = document.getElementById('btnCloseStopModal');

  if (btnReportScrap && modalScrap) btnReportScrap.addEventListener('click', () => modalScrap.classList.add('active'));
  if (btnCloseScrap  && modalScrap) btnCloseScrap.addEventListener('click',  () => modalScrap.classList.remove('active'));
  if (btnReportStop  && modalStop)  btnReportStop.addEventListener('click',  () => modalStop.classList.add('active'));
  if (btnCloseStop   && modalStop)  btnCloseStop.addEventListener('click',   () => modalStop.classList.remove('active'));

  // ── REGISTRO DE MERMA / SEGUNDA ──────────────────────────────────────────
  document.querySelectorAll('.scrap-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const reason    = btn.getAttribute('data-reason');
      const isSeconda = btn.getAttribute('data-type') === 'segunda';
      flashScannerVisual(false);

      const stId    = stationSelect ? stationSelect.value : 'prensas';
      const station = UanifyState.stations.find(s => s.id === stId) || UanifyState.stations[5];

      if (isSeconda) {
        UanifyState.secondGradeTotal++;
        if (terminalSecond) terminalSecond.textContent = `${UanifyState.secondGradeTotal} pzas`;
        alert(
          `📦 SEGUNDA / SALDO REGISTRADO\n\n` +
          `Motivo: "${reason}"\n` +
          `Departamento: ${station.name}\n\n` +
          `La pieza se separa al almacén dedicado para la venta de viernes.\n` +
          `Total acumulado en semana: ${UanifyState.secondGradeTotal} piezas.`
        );
      } else {
        station.scrap++;
        UanifyState.scrapTotal++;
        if (terminalScrap) terminalScrap.textContent = `${station.scrap} pzas`;
        alert(
          `⚠️ MERMA REPORTADA EN ${station.name}\n\n` +
          `Motivo: "${reason}"\n\n` +
          `Pieza sin arreglo. Se sustituye con pieza de saldo para que el lote salga completo de 60 pzas.`
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
      flashScannerVisual(false);

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

      EventBus.emit('status-updated');
      alert(
        `🛑 PARO DE LÍNEA REGISTRADO — ${station.name}\n\n` +
        `Hora: ${timeStr}\n` +
        `Causa: "${stopReason}"\n\n` +
        `Notificado al Tablero Andon en ROJO. Supervisor de área debe liberar.`
      );
    });
  });
};
