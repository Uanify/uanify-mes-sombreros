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
            <span class="station-num">${st.code} ${isQuality ? '· OK PUNTO DE CALIDAD' : ''}</span>
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
        <strong style="color:#F59E0B; font-size:12px;"> ${d.time} — ${d.station}</strong>
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
