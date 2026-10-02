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
  renderPrensasWhiteboard();
  updateShiftDynamicBadge();

  EventBus.on('piece-registered', () => {
    updateAndonTotals();
    renderStations();
    renderHourlyProgress();
    updatePrensasFromPiece();
  });
  EventBus.on('status-updated', () => {
    renderStations();
    renderDowntimes();
  });
  EventBus.on('lot-subdivided', () => {
    renderStations();
  });
  EventBus.on('shift-dynamic-started', () => {
    updateShiftDynamicBadge();
    renderHourlyProgress();
  });
  EventBus.on('shift-dynamic-reset', () => {
    updateShiftDynamicBadge();
    renderHourlyProgress();
  });
  const hourlyDateSelect = document.getElementById('andonHourlyDateFilter');
  if (hourlyDateSelect && !hourlyDateSelect.dataset.bound) {
    hourlyDateSelect.dataset.bound = 'true';
    hourlyDateSelect.addEventListener('change', () => {
      renderHourlyProgress(hourlyDateSelect.value);
      window.UanifyUI.toast(
        `Curva de avance hora por hora actualizada: ${hourlyDateSelect.options[hourlyDateSelect.selectedIndex].text}.`,
        'info',
        'Filtro de Fecha Andon'
      );
    });
  }
};

function renderStations() {
  const grid = document.getElementById('stationsGrid');
  if (!grid) return;

  grid.innerHTML = UanifyState.stations.map(st => {
    const pct = Math.min(100, Math.round((st.produced / st.target) * 100));
    const statusText  = st.status === 'running' 
      ? 'OPERANDO' 
      : st.status === 'warning' 
        ? 'AJUSTE / SETUP (En Tolerancia)' 
        : 'PARO DE LÍNEA';
    const statusClass = `status-${st.status}`;
    const isBottleneck = st.wipWaiting >= 30;
    const isQuality    = st.id.startsWith('calidad') || (st.code && st.code.startsWith('C-')) || (st.type === 'calidad');
    const qualityClass = isQuality ? 'station-quality-checkpoint' : '';

    return `
      <div class="station-card ${statusClass} ${qualityClass}" data-station-id="${st.id}">
        <div class="station-header">
          <div>
            <span class="station-num" style="${isQuality ? 'background:#FEF3C7; color:#92400E; border-color:#FCD34D; font-weight:800;' : ''}">
              ${isQuality ? '🔍 Filtro de Calidad Obligatorio' : 'Estación de Manufactura'}
            </span>
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
            <span class="sm-val ${isBottleneck ? 'color-amber' : ''}">${st.wipWaiting} pzas${isBottleneck ? ' ' : ''}</span>
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
          <span> ${st.operator}</span>
          <span> Ciclo: ${st.cycleTime}</span>
        </div>
      </div>
    `;
  }).join('');
}

let currentHourlyDateKey = 'today';
function renderHourlyProgress(dateKey) {
  const container = document.getElementById('hourlyBars');
  if (!container) return;

  if (dateKey) currentHourlyDateKey = dateKey;
  const key = currentHourlyDateKey;

  const actualStart = UanifyState.shiftSchedule?.actualStartTime;
  const isDynamic = UanifyState.shiftSchedule?.mode !== 'fixed';

  let data = UanifyState.hourlyData;
  if (key === 'yesterday') {
    // Curva cerrada de ayer (26/09/2026): 850 piezas totales cumplidas
    data = [
      { hour: '07:00', target: 110, produced: 114 },
      { hour: '08:00', target: 115, produced: 118 },
      { hour: '09:00', target: 115, produced: 122 },
      { hour: '10:00', target: 115, produced: 108 },
      { hour: '11:00', target: 115, produced: 116 },
      { hour: '12:00', target: 0,   produced: 0   }, // Comida 12:00 a 12:45
      { hour: '13:00', target: 95,  produced: 98  },
      { hour: '14:00', target: 115, produced: 120 },
      { hour: '15:00', target: 70,  produced: 54  }
    ];
  } else if (key === 'prevDay') {
    // Curva cerrada del 25/09/2026: 862 piezas totales
    data = [
      { hour: '07:00', target: 110, produced: 112 },
      { hour: '08:00', target: 115, produced: 120 },
      { hour: '09:00', target: 115, produced: 125 },
      { hour: '10:00', target: 115, produced: 114 },
      { hour: '11:00', target: 115, produced: 118 },
      { hour: '12:00', target: 0,   produced: 0   }, // Comida
      { hour: '13:00', target: 95,  produced: 101 },
      { hour: '14:00', target: 115, produced: 116 },
      { hour: '15:00', target: 70,  produced: 56  }
    ];
  }

  container.innerHTML = data.map((h, idx) => {
    const isCurrent = (key === 'today' && idx === 6);
    const isLunch = h.target === 0;
    const overTarget = h.produced >= h.target && h.target > 0;
    const pct = h.target > 0 ? Math.min(130, Math.round((h.produced / h.target) * 100)) : 0;
    const isFirstHour = idx === 0;

    let subNote = '';
    if (isFirstHour && actualStart && isDynamic && key === 'today') {
      subNote = `<span style="font-size:9.5px; color:#0284C7; font-weight:700; display:block; margin-top:4px;">Inicio: ${actualStart}</span>`;
    } else if (key !== 'today' && isFirstHour) {
      subNote = `<span style="font-size:9.5px; color:#16A34A; font-weight:700; display:block; margin-top:4px;">Turno Cerrado</span>`;
    }

    if (isLunch) {
      return `
        <div class="hour-col meal-hour" style="background:#F1F5F9; border-style:dashed;">
          <span class="hour-time" style="color:var(--text-muted);">${h.hour}</span>
          <div style="font-size:12px; font-weight:800; color:var(--text-muted); margin:8px 0;">COMIDA</div>
          <span style="font-size:10px; color:var(--text-muted);">12:00 - 12:45</span>
        </div>
      `;
    }

    return `
      <div class="hour-col ${isCurrent ? 'current' : ''}">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <span class="hour-time">${h.hour}</span>
          ${h.produced > 0 ? `<span class="badge-status" style="font-size:9.5px; padding:1px 5px; background:${overTarget ? '#DCFCE7; color:#15803D;' : '#FEF3C7; color:#B45309;'}">${pct}%</span>` : ''}
        </div>
        <div class="hour-pzas" style="color: ${overTarget ? 'var(--color-green)' : h.produced > 0 ? 'var(--color-brand)' : 'var(--text-muted)'}; margin:4px 0 2px;">
          ${h.produced} <small style="font-size:11px; font-weight:600; color:var(--text-muted);">pzas</small>
        </div>
        <div class="hour-target" style="font-size:11px;">Meta: <strong>${h.target}</strong></div>
        <div style="width:100%; height:5px; background:#E2E8F0; border-radius:99px; overflow:hidden; margin-top:6px;">
          <div style="width:${Math.min(100, pct)}%; height:100%; background:${overTarget ? 'var(--color-green)' : pct > 0 ? 'var(--color-brand)' : 'transparent'}; border-radius:99px;"></div>
        </div>
        ${subNote}
      </div>
    `;
  }).join('');
}

function updateShiftDynamicBadge() {
  const badgeText = document.getElementById('andonShiftStartText');
  const bannerTime = document.getElementById('andonShiftStartTime');
  const sched = UanifyState.shiftSchedule || {};

  if (sched.mode === 'fixed') {
    if (badgeText) badgeText.innerHTML = `<strong>Arranque Rígido:</strong> ${sched.start || '07:00'} hrs (Horario Oficial de Planta)`;
    if (bannerTime) bannerTime.textContent = `${sched.start || '07:00'} (Fijo)`;
  } else {
    if (sched.actualStartTime) {
      if (badgeText) badgeText.innerHTML = `<strong>Arranque Real:</strong> ${sched.actualStartTime} hrs · Primer Lote: #${sched.firstLotId || '49,633'} <span style="color:#0284C7; font-weight:700;">(Ramp-up Calderas: +${sched.rampUpMinutes} min)</span>`;
      if (bannerTime) bannerTime.textContent = `${sched.actualStartTime} (+${sched.rampUpMinutes}m)`;
    } else {
      if (badgeText) badgeText.innerHTML = `<strong>Arranque Dinámico:</strong> Esperando 1er escaneo QR del día...`;
      if (bannerTime) bannerTime.textContent = `En espera 1er QR`;
    }
  }
}

let andonStopFiltersBound = false;
function renderDowntimes() {
  const container = document.getElementById('downtimeListAndon') || document.getElementById('downtimeList');
  if (!container) return;

  const searchInput = document.getElementById('andonStopSearch');
  const deptFilter = document.getElementById('andonStopDeptFilter');
  const severityFilter = document.getElementById('andonStopSeverityFilter');
  const countBadge = document.getElementById('andonStopFilteredCountBadge');
  const btnReset = document.getElementById('btnResetAndonStopFilters');

  if (deptFilter && deptFilter.options.length <= 1 && UanifyState.stations) {
    UanifyState.stations.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st.name;
      opt.textContent = `${st.code || ''} ${st.name}`.trim();
      deptFilter.appendChild(opt);
    });
  }

  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const dept = deptFilter ? deptFilter.value : 'all';
  const sev = severityFilter ? severityFilter.value : 'all';

  const filtered = (UanifyState.downtimes || []).filter(d => {
    const matchSearch = !q ||
      d.station.toLowerCase().includes(q) ||
      d.cause.toLowerCase().includes(q) ||
      d.time.includes(q);

    const matchDept = (dept === 'all' || d.station.toLowerCase().includes(dept.toLowerCase()) || dept.toLowerCase().includes(d.station.toLowerCase()));

    let matchSev = true;
    const durMins = parseInt(d.duration, 10) || 0;
    if (sev === 'critical') matchSev = (durMins > 10);
    else if (sev === 'minor') matchSev = (durMins <= 10);

    return matchSearch && matchDept && matchSev;
  });

  if (countBadge) {
    countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.downtimes.length} paros`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:24px 12px; color:var(--text-muted);">
        <p style="font-size:13px; font-weight:700; margin-bottom:4px; color:var(--text-secondary);">Sin paros ni incidencias coincidentes</p>
        <span style="font-size:11.5px;">Intenta cambiar los filtros de estación o severidad</span>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(d => {
      const durMins = parseInt(d.duration, 10) || 0;
      const isCritical = durMins > 10;
      return `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.05); gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge-subtle" style="font-family:var(--font-mono); font-size:11px; font-weight:700;">${d.time}</span>
              <strong style="color:${isCritical ? '#EF4444' : '#F59E0B'}; font-size:13px;">${d.station}</strong>
              <span class="badge-status" style="background:${isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'}; color:${isCritical ? '#EF4444' : '#D97706'}; font-size:10px; padding:2px 6px;">
                ${isCritical ? 'Crítico' : 'Menor'}
              </span>
            </div>
            <div style="font-size:12px; color:#94A3B8; margin-top:4px;">${d.cause}</div>
          </div>
          <div style="text-align:right; min-width:85px;">
            <div style="font-size:12px; font-weight:700; font-family:var(--font-mono); color:${isCritical ? '#EF4444' : '#F59E0B'};">${d.duration}</div>
            <div style="font-size:11px; color:#EF4444; font-family:var(--font-mono); font-weight:600;">${d.impact}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (!andonStopFiltersBound) {
    andonStopFiltersBound = true;
    if (searchInput) searchInput.addEventListener('input', renderDowntimes);
    if (deptFilter) deptFilter.addEventListener('change', renderDowntimes);
    if (severityFilter) severityFilter.addEventListener('change', renderDowntimes);
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (deptFilter) deptFilter.value = 'all';
        if (severityFilter) severityFilter.value = 'all';
        renderDowntimes();
      });
    }
    window.resetAndonStopFilters = function() {
      if (searchInput) searchInput.value = '';
      if (deptFilter) deptFilter.value = 'all';
      if (severityFilter) severityFilter.value = 'all';
      renderDowntimes();
    };
  }
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

// ─── CONTROLADOR DE PIZARRA DIGITAL "1000 X M.T PRENSAS SECAS" (RF-52) ───
// Datos fidedignos fotografiados en la nave de planta matriz de San Francisco del Rincón:
const PrensasWhiteboardConfig = {
  dailyTarget: 1500,
  weeklyTarget: 7500,
  hourlyTargets: [165, 165, 90, 165, 165, 165, 90, 165, 165, 165],
  hours: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00', '4:00-5:00', '5:00-6:00'],
  days: ['JUEVES', 'VIERNES', 'SABADO', 'LUNES', 'MARTES', 'MIERCOLES']
};

const PrensasPhotoState = {
  // Procesos oficiales del pizarrón físico de planta
  processes: [
    {
      id: 'p1_hormado',
      name: 'HORMADO',
      hourly: [260, 360, 190, 100, 120, 220, 120, 80, 180, 0],
      weekly: { JUEVES: 1685, VIERNES: 1700, SABADO: 0, LUNES: 1030, MARTES: 1450, MIERCOLES: 1520 }
    },
    {
      id: 'p2_replanchar_copa',
      name: 'REPLANCHAR COPA',
      hourly: [300, 180, 180, 100, 240, 190, 60, 0, 180, 30],
      weekly: { JUEVES: 2095, VIERNES: 1160, SABADO: 0, LUNES: 1410, MARTES: 1480, MIERCOLES: 1550 }
    },
    {
      id: 'p3_recortar_copas',
      name: 'RECORTAR COPAS',
      hourly: [240, 300, 120, 60, 240, 180, 120, 0, 120, 130],
      weekly: { JUEVES: 1615, VIERNES: 1810, SABADO: 0, LUNES: 1370, MARTES: 1510, MIERCOLES: 1490 }
    },
    {
      id: 'p4_pegar_copa_falda',
      name: 'PEGAR COPA C/FALDA',
      hourly: [60, 120, 60, 60, 120, 120, 60, 190, 120, 60],
      weekly: { JUEVES: 1650, VIERNES: 2130, SABADO: 0, LUNES: 1345, MARTES: 1030, MIERCOLES: 1420 }
    },
    {
      id: 'p5_replanchado_alambre',
      name: 'REPLANCHADO C/ALAMBRE',
      hourly: [150, 180, 120, 180, 180, 290, 120, 240, 240, 250],
      weekly: { JUEVES: 1520, VIERNES: 1170, SABADO: 0, LUNES: 1440, MARTES: 1950, MIERCOLES: 1680 }
    }
  ]
};

// Cargar estado inicial guardado o desde foto
let currentPrensasBoard = null;
try {
  const saved = localStorage.getItem('uanify_prensas_board');
  if (saved) {
    currentPrensasBoard = JSON.parse(saved);
  } else {
    currentPrensasBoard = JSON.parse(JSON.stringify(PrensasPhotoState));
  }
} catch (e) {
  currentPrensasBoard = JSON.parse(JSON.stringify(PrensasPhotoState));
}

function renderPrensasWhiteboard() {
  renderPrensasHourlyTable();
  renderPrensasWeeklyTable();
  setupPrensasWhiteboardEvents();
}

function renderPrensasHourlyTable() {
  const tbody = document.getElementById('tbodyPrensasHourly');
  if (!tbody || !currentPrensasBoard) return;

  tbody.innerHTML = currentPrensasBoard.processes.map((proc, pIdx) => {
    let rowTotal = 0;

    const hourCells = PrensasWhiteboardConfig.hourlyTargets.map((target, hIdx) => {
      const actual = proc.hourly[hIdx] !== undefined ? proc.hourly[hIdx] : 0;
      rowTotal += actual;

      const meets = actual >= target;
      const markerClass = meets ? 'wb-val-green' : 'wb-val-red';

      return `
        <td class="wb-td wb-td-split ${target === 90 ? 'meal-cell' : ''}" title="Hora ${PrensasWhiteboardConfig.hours[hIdx]} · Meta: ${target} pzas | Real: ${actual} pzas">
          <div class="wb-diagonal-box">
            <span class="wb-val-actual ${markerClass}">${actual}</span>
            <span class="wb-val-target">${target}</span>
          </div>
        </td>
      `;
    }).join('');

    const meetsDailyTarget = rowTotal >= PrensasWhiteboardConfig.dailyTarget;
    const totalClass = meetsDailyTarget ? 'wb-total-green' : 'wb-total-red';

    return `
      <tr>
        <td class="wb-td wb-td-process">
          <span class="proc-name">${proc.name}</span>
        </td>
        ${hourCells}
        <td class="wb-td wb-td-total ${totalClass}">
          <span class="proc-total-number">${rowTotal}</span>
          <small class="proc-total-sub">/ ${PrensasWhiteboardConfig.dailyTarget}</small>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPrensasWeeklyTable() {
  const tbody = document.getElementById('tbodyPrensasWeekly');
  if (!tbody || !currentPrensasBoard) return;

  tbody.innerHTML = currentPrensasBoard.processes.map(proc => {
    let weekTotal = 0;

    const dayCells = PrensasWhiteboardConfig.days.map(day => {
      const val = proc.weekly[day] || 0;
      weekTotal += val;
      const isZero = val === 0;
      const meets = val >= 1500;
      const valClass = isZero ? 'wb-val-zero' : (meets ? 'wb-val-green' : 'wb-val-red');

      return `
        <td class="wb-td wb-td-day">
          <span class="wb-day-number ${valClass}">${isZero ? '—' : val}</span>
        </td>
      `;
    }).join('');

    const meetsWeeklyTarget = weekTotal >= PrensasWhiteboardConfig.weeklyTarget;
    const weekTotalClass = meetsWeeklyTarget ? 'wb-total-green' : 'wb-total-red';

    return `
      <tr>
        <td class="wb-td wb-td-process">
          <span class="proc-name">${proc.name}</span>
        </td>
        ${dayCells}
        <td class="wb-td wb-td-total ${weekTotalClass}">
          <span class="proc-total-number">${weekTotal}</span>
          <small class="proc-total-sub">/ ${PrensasWhiteboardConfig.weeklyTarget}</small>
        </td>
      </tr>
    `;
  }).join('');
}

function setupPrensasWhiteboardEvents() {
  const btnLoadPhoto = document.getElementById('btnLoadPhotoData');
  if (btnLoadPhoto && !btnLoadPhoto.dataset.bound) {
    btnLoadPhoto.dataset.bound = 'true';
    btnLoadPhoto.addEventListener('click', () => {
      currentPrensasBoard = JSON.parse(JSON.stringify(PrensasPhotoState));
      try {
        localStorage.setItem('uanify_prensas_board', JSON.stringify(currentPrensasBoard));
      } catch (e) {}
      renderPrensasHourlyTable();
      renderPrensasWeeklyTable();
      UanifyUI.toast(
        'Se han cargado los valores exactos fotografiados en el pizarrón de la nave (Línea Prensas Secas 1000 X M.T).',
        'success',
        'Pizarrón de Planta Restaurado'
      );
    });
  }

  const btnSimulate = document.getElementById('btnSimulateWhiteboardHour');
  if (btnSimulate && !btnSimulate.dataset.bound) {
    btnSimulate.dataset.bound = 'true';
    btnSimulate.addEventListener('click', () => {
      // Simular incremento en la hora activa (columna 8 o 9)
      currentPrensasBoard.processes.forEach(proc => {
        const delta = Math.floor(Math.random() * 25) + 15;
        // Sumar a la última hora con actividad o a la hora 9
        proc.hourly[9] = (proc.hourly[9] || 0) + delta;
      });
      try {
        localStorage.setItem('uanify_prensas_board', JSON.stringify(currentPrensasBoard));
      } catch (e) {}
      renderPrensasHourlyTable();
      renderPrensasWeeklyTable();
      UanifyUI.toast(
        'Se han sumado lotes procesados en la hora 5:00-6:00 en las 5 prensas.',
        'info',
        'Avance en Línea Simulado'
      );
    });
  }

  const btnPrint = document.getElementById('btnPrintWhiteboardReport');
  if (btnPrint && !btnPrint.dataset.bound) {
    btnPrint.dataset.bound = 'true';
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}

function updatePrensasFromPiece() {
  if (!currentPrensasBoard) return;
  // Si se registra una pieza en el sistema, incrementa sutilmente la estación de Prensas
  const p = currentPrensasBoard.processes[0];
  if (p) {
    p.hourly[8] = (p.hourly[8] || 0) + 1;
    renderPrensasHourlyTable();
  }
}
