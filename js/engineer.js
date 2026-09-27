/**
 * UANIFY MES · CONSOLA DE INGENIERÍA & ANALÍTICA DE PLANTA
 * Tombstone Hats — Planta Matriz San Francisco del Rincón
 *
 * SIMULADOR INDUSTRIAL AVANZADO HORA POR HORA:
 * ─ Escenarios dinámicos para las 9 horas del Turno Único (07:00 a 15:30 hrs).
 * ─ Variaciones realistas de producción, mermas, segundas y tiempos de ciclo.
 * ─ Detección rotativa de cuellos de botella y balanceo de WIP intermedio.
 * ─ Bitácora viva de eventos SMED y paros de máquina con timestamps reales.
 * ─ KPIs dinámicos de supervisores (Juan Manuel, Roberto, Auxiliar de Rampa).
 * ─ Recálculo matemático integral de OEE (Disponibilidad, Rendimiento, Calidad).
 * ─ Valorización financiera en MXN, saldos y costo de desperdicio.
 * ─ Consumo acumulado en Matriz de Materiales (BOM).
 */

// ── ESCENARIOS HORARIOS REALISTAS DE LA JORNADA INDUSTRIAL TOMBSTONE ─────────
const SHIFT_HOURLY_SCENARIOS = [
  {
    stepIndex: 0,
    hourLabel: '07:00 - 08:00',
    title: 'Arranque de Línea & Calentamiento de Prensas',
    pctOfDay: 15,
    producedDelta: 72,
    scrapDelta: 1,
    secondGradeDelta: 1,
    downtime: { time: '07:45', station: 'Prensas Vapor #2', cause: 'Cambio de horma Roper a Viejón (SMED)', duration: '14 min', impact: '-22 pzas' },
    bottleneckDept: 'Corte de Cuadros (D-01)',
    bottleneckWip: 28,
    stationWips: { 'corte': 28, 'alambrado': 18, 'dope': 14, 'refuerzos': 10, 'calidad1': 7, 'prensas': 16, 'recorte': 12, 'pintura': 9, 'calidad2': 6, 'brillo': 7, 'temperado': 5, 'adorno': 6, 'calidad3': 5, 'embarque': 4 },
    sup1Takt: 43.8, sup1Fulfill: 89.2, sup1Scrap: 1.2, sup1Grade: 'En Meta (B+)',
    sup2Takt: 34.6, sup2Fulfill: 92.5, sup2Scrap: 1.5, sup2Grade: 'Sobresaliente (A)',
    auxTakt: 15.1, auxFulfill: 96.4, auxScrap: 0.2, auxGrade: 'Excelente (A+)',
    availPct: 95.5,
    notes: 'Encendido de calderas en Nave Central y estiramiento inicial de lienzos de telar.'
  },
  {
    stepIndex: 1,
    hourLabel: '08:00 - 09:00',
    title: 'Velocidad de Crucero & Carga en Camas de Dope',
    pctOfDay: 28,
    producedDelta: 96,
    scrapDelta: 1,
    secondGradeDelta: 2,
    downtime: { time: '08:50', station: 'Englopado / Dope (Camas)', cause: 'Recarga y filtrado de resina selladora en tinas', duration: '8 min', impact: '-12 pzas' },
    bottleneckDept: 'Englopado / Baño de Dope (D-03)',
    bottleneckWip: 36,
    stationWips: { 'corte': 16, 'alambrado': 22, 'dope': 36, 'refuerzos': 14, 'calidad1': 10, 'prensas': 20, 'recorte': 14, 'pintura': 11, 'calidad2': 7, 'brillo': 9, 'temperado': 7, 'adorno': 8, 'calidad3': 6, 'embarque': 5 },
    sup1Takt: 42.1, sup1Fulfill: 93.4, sup1Scrap: 1.4, sup1Grade: 'Sobresaliente (A)',
    sup2Takt: 35.4, sup2Fulfill: 94.8, sup2Scrap: 1.7, sup2Grade: 'Sobresaliente (A)',
    auxTakt: 14.6, auxFulfill: 97.6, auxScrap: 0.2, auxGrade: 'Excelente (A+)',
    availPct: 94.7,
    notes: 'Corte operando a buen ritmo. Camas de secado acumulando sombreros en sellado.'
  },
  {
    stepIndex: 2,
    hourLabel: '09:00 - 10:00',
    title: 'Lote Denver & Prensas a Pleno Vapor',
    pctOfDay: 42,
    producedDelta: 104,
    scrapDelta: 2,
    secondGradeDelta: 3,
    downtime: { time: '09:35', station: 'Prensas Hidráulicas', cause: 'Calibración de presión a 70 PSI en Prensa Michelagnoli P-01', duration: '10 min', impact: '-16 pzas' },
    bottleneckDept: 'Prensas de Hormado (D-05)',
    bottleneckWip: 44,
    stationWips: { 'corte': 12, 'alambrado': 15, 'dope': 18, 'refuerzos': 15, 'calidad1': 12, 'prensas': 44, 'recorte': 16, 'pintura': 13, 'calidad2': 8, 'brillo': 10, 'temperado': 9, 'adorno': 10, 'calidad3': 7, 'embarque': 6 },
    sup1Takt: 40.9, sup1Fulfill: 95.4, sup1Scrap: 1.9, sup1Grade: 'Excelente (A+)',
    sup2Takt: 36.0, sup2Fulfill: 93.9, sup2Scrap: 1.6, sup2Grade: 'Sobresaliente (A)',
    auxTakt: 14.3, auxFulfill: 98.3, auxScrap: 0.1, auxGrade: 'Excelente (A+)',
    availPct: 93.8,
    notes: 'Batería de prensas trabajando a 125°C. Rampa fraccionando sublotes de 15 piezas.'
  },
  {
    stepIndex: 3,
    hourLabel: '10:00 - 11:00',
    title: 'Pico Productivo Matutino & Túnel de Secado',
    pctOfDay: 55,
    producedDelta: 110,
    scrapDelta: 1,
    secondGradeDelta: 4,
    downtime: { time: '10:20', station: 'Cabina de Pintura PT-01', cause: 'Limpieza de toberas de aspersión y filtro de laca blanca', duration: '7 min', impact: '-9 pzas' },
    bottleneckDept: 'Pintura y Secado (D-07)',
    bottleneckWip: 33,
    stationWips: { 'corte': 10, 'alambrado': 11, 'dope': 14, 'refuerzos': 12, 'calidad1': 9, 'prensas': 22, 'recorte': 18, 'pintura': 33, 'calidad2': 14, 'brillo': 15, 'temperado': 11, 'adorno': 12, 'calidad3': 8, 'embarque': 8 },
    sup1Takt: 39.7, sup1Fulfill: 97.2, sup1Scrap: 1.6, sup1Grade: 'Excelente (A+)',
    sup2Takt: 35.8, sup2Fulfill: 95.3, sup2Scrap: 1.5, sup2Grade: 'Excelente (A+)',
    auxTakt: 14.1, auxFulfill: 98.9, auxScrap: 0.2, auxGrade: 'Excelente (A+)',
    availPct: 94.3,
    notes: 'Volumen máximo de la mañana. Túnel infrarrojo curando laca semi-brillo.'
  },
  {
    stepIndex: 4,
    hourLabel: '11:00 - 12:00',
    title: 'Convergencia de Subensambles (Tafiletes)',
    pctOfDay: 68,
    producedDelta: 102,
    scrapDelta: 2,
    secondGradeDelta: 3,
    downtime: { time: '11:15', station: 'Adorno (Tafilete y Toquilla)', cause: 'Coordinación entre naves de tafiletes talla 58', duration: '9 min', impact: '-12 pzas' },
    bottleneckDept: 'Adorno 1 (Tafilete + Toquilla) (D-10)',
    bottleneckWip: 39,
    stationWips: { 'corte': 9, 'alambrado': 9, 'dope': 12, 'refuerzos': 10, 'calidad1': 7, 'prensas': 16, 'recorte': 15, 'pintura': 19, 'calidad2': 12, 'brillo': 14, 'temperado': 17, 'adorno': 39, 'calidad3': 13, 'embarque': 10 },
    sup1Takt: 41.4, sup1Fulfill: 95.0, sup1Scrap: 1.8, sup1Grade: 'Sobresaliente (A)',
    sup2Takt: 36.3, sup2Fulfill: 94.2, sup2Scrap: 1.6, sup2Grade: 'Sobresaliente (A)',
    auxTakt: 14.4, auxFulfill: 98.1, auxScrap: 0.1, auxGrade: 'Excelente (A+)',
    availPct: 93.9,
    notes: 'Pegado de badana interior y colocación de toquillas de piel con herraje níquel.'
  },
  {
    stepIndex: 5,
    hourLabel: '12:00 - 12:45',
    title: 'Receso Comida & Mantenimiento Preventivo',
    pctOfDay: 75,
    producedDelta: 28,
    scrapDelta: 0,
    secondGradeDelta: 1,
    downtime: { time: '12:20', station: 'Calderas Centrales', cause: 'Purga y descalcificación preventiva de calderas de vapor', duration: '15 min', impact: '-18 pzas' },
    bottleneckDept: 'Línea Balanceada (Receso de Personal)',
    bottleneckWip: 14,
    stationWips: { 'corte': 6, 'alambrado': 6, 'dope': 8, 'refuerzos': 7, 'calidad1': 5, 'prensas': 9, 'recorte': 8, 'pintura': 10, 'calidad2': 7, 'brillo': 8, 'temperado': 7, 'adorno': 14, 'calidad3': 8, 'embarque': 8 },
    sup1Takt: 42.2, sup1Fulfill: 93.8, sup1Scrap: 1.6, sup1Grade: 'Sobresaliente (A)',
    sup2Takt: 36.7, sup2Fulfill: 93.0, sup2Scrap: 1.5, sup2Grade: 'Sobresaliente (A)',
    auxTakt: 14.8, auxFulfill: 97.4, auxScrap: 0.2, auxGrade: 'Excelente (A+)',
    availPct: 94.6,
    notes: 'Pausa de alimentos en comedor de planta. Equipos térmicos en mantenimiento autónomo.'
  },
  {
    stepIndex: 6,
    hourLabel: '12:45 - 13:45',
    title: 'Reanudación Vigorosa & Paso a Calidad 3',
    pctOfDay: 85,
    producedDelta: 106,
    scrapDelta: 2,
    secondGradeDelta: 3,
    downtime: { time: '13:10', station: 'Recorte y Refaldeado', cause: 'Reemplazo de cuchilla rotativa en mesa de ala 4 1/4"', duration: '6 min', impact: '-8 pzas' },
    bottleneckDept: 'Calidad 3 (Producto Terminado) (C-03)',
    bottleneckWip: 31,
    stationWips: { 'corte': 8, 'alambrado': 8, 'dope': 10, 'refuerzos': 8, 'calidad1': 6, 'prensas': 13, 'recorte': 14, 'pintura': 13, 'calidad2': 9, 'brillo': 11, 'temperado': 12, 'adorno': 16, 'calidad3': 31, 'embarque': 18 },
    sup1Takt: 40.1, sup1Fulfill: 96.6, sup1Scrap: 1.8, sup1Grade: 'Excelente (A+)',
    sup2Takt: 35.7, sup2Fulfill: 95.2, sup2Scrap: 1.6, sup2Grade: 'Excelente (A+)',
    auxTakt: 14.2, auxFulfill: 98.6, auxScrap: 0.1, auxGrade: 'Excelente (A+)',
    availPct: 94.7,
    notes: 'Reanudación en todas las áreas. Mezzanine de inspección final auditando sombreros.'
  },
  {
    stepIndex: 7,
    hourLabel: '13:45 - 14:45',
    title: 'Sprint de Confección & Empaque B2B',
    pctOfDay: 95,
    producedDelta: 108,
    scrapDelta: 1,
    secondGradeDelta: 2,
    downtime: { time: '14:05', station: 'Embarque B2B', cause: 'Acomodo de pallets en camión de cliente de Monterrey', duration: '11 min', impact: '-14 pzas' },
    bottleneckDept: 'Embarque & Vale COMPAC (D-11)',
    bottleneckWip: 37,
    stationWips: { 'corte': 6, 'alambrado': 6, 'dope': 7, 'refuerzos': 6, 'calidad1': 4, 'prensas': 9, 'recorte': 10, 'pintura': 9, 'calidad2': 6, 'brillo': 8, 'temperado': 9, 'adorno': 11, 'calidad3': 13, 'embarque': 37 },
    sup1Takt: 39.4, sup1Fulfill: 98.4, sup1Scrap: 1.6, sup1Grade: 'Excelente (A+)',
    sup2Takt: 35.1, sup2Fulfill: 96.6, sup2Scrap: 1.5, sup2Grade: 'Excelente (A+)',
    auxTakt: 14.0, auxFulfill: 99.1, auxScrap: 0.1, auxGrade: 'Excelente (A+)',
    availPct: 95.0,
    notes: 'Empaque de cajas master de 12 sombreros. Embarque mayorista en ruta a tiempo.'
  },
  {
    stepIndex: 8,
    hourLabel: '14:45 - 15:30',
    title: 'Cierre de Jornada, Auditoría Final & Vales',
    pctOfDay: 100,
    producedDelta: 64,
    scrapDelta: 1,
    secondGradeDelta: 2,
    downtime: { time: '15:15', station: 'Auditoría General', cause: 'Cierre de turno y conciliación de tarjetas viajeras con micas', duration: '5 min', impact: '0 pzas' },
    bottleneckDept: 'Línea Concluida · Meta Diaria Alcanzada',
    bottleneckWip: 8,
    stationWips: { 'corte': 4, 'alambrado': 4, 'dope': 5, 'refuerzos': 4, 'calidad1': 3, 'prensas': 6, 'recorte': 5, 'pintura': 4, 'calidad2': 3, 'brillo': 4, 'temperado': 4, 'adorno': 5, 'calidad3': 5, 'embarque': 8 },
    sup1Takt: 40.3, sup1Fulfill: 101.6, sup1Scrap: 1.7, sup1Grade: 'Excelente (A+)',
    sup2Takt: 35.7, sup2Fulfill: 101.1, sup2Scrap: 1.6, sup2Grade: 'Excelente (A+)',
    auxTakt: 14.1, auxFulfill: 99.6, auxScrap: 0.1, auxGrade: 'Excelente (A+)',
    availPct: 95.2,
    notes: 'Jornada concluida. Meta diaria de 850 piezas superada satisfactoriamente.'
  }
];

// Estado interno del simulador
let currentScenarioIndex = 5; // Inicia en 12:00 a 12:45 (estado medio del día)

window.initEngineerView = function() {
  renderPipeline();
  renderMaterialMatrix();
  renderDowntimes();
  updateOeeScores();
  renderSupervisorKpis();
  updateSimulationHeader();

  EventBus.on('piece-registered', () => {
    renderPipeline();
    updateOeeScores();
    renderSupervisorKpis();
    renderMaterialMatrix();
    updateSimulationHeader();
  });
  EventBus.on('scrap-registered', () => {
    updateOeeScores();
    renderSupervisorKpis();
  });
  EventBus.on('status-updated', () => {
    renderPipeline();
    renderDowntimes();
  });
  EventBus.on('user-switched', () => {
    checkKpisAccess();
  });

  // 1. Simular avance de 1 hora de producción con variación rica
  const btnSimulate = document.getElementById('btnSimulateShift');
  if (btnSimulate) {
    btnSimulate.addEventListener('click', () => {
      advanceSimulationHour(false);
    });
  }

  // 2. Simular turno completo (todas las horas de un solo golpe)
  const btnSimulateFull = document.getElementById('btnSimulateFullShift');
  if (btnSimulateFull) {
    btnSimulateFull.addEventListener('click', () => {
      advanceSimulationHour(true);
    });
  }

  // 3. Reiniciar simulación de turno
  const btnReset = document.getElementById('btnResetSimulation');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      window.UanifyUI.confirm(
        '¿Reiniciar Simulación de Turno?',
        'Esta acción restablecerá los contadores de piezas, scrap, paros y OEE al estado matutino de inicio de jornada. ¿Deseas continuar?',
        () => {
          resetSimulationData();
        },
        'Sí, Reiniciar',
        'Cancelar'
      );
    });
  }

  // Cambio masivo de material
  const btnMassChange = document.getElementById('btnMassChange');
  if (btnMassChange) {
    btnMassChange.addEventListener('click', () => {
      window.UanifyUI.toast(
        'Material actualizado en 47 fichas técnicas: "Pintura Taiwan 1125" reemplazada exitosamente por "Pintura Premium X200" sin edición manual.',
        'success',
        'Cambio Masivo de Material'
      );
    });
  }

  checkKpisAccess();
};

// ── MOTOR DE AVANCE DE SIMULACIÓN ───────────────────────────────────────────
function advanceSimulationHour(toFullShift = false) {
  if (toFullShift) {
    currentScenarioIndex = SHIFT_HOURLY_SCENARIOS.length - 1;
  } else {
    currentScenarioIndex = (currentScenarioIndex + 1) % SHIFT_HOURLY_SCENARIOS.length;
  }

  const sc = SHIFT_HOURLY_SCENARIOS[currentScenarioIndex];

  // 1. Actualizar piezas producidas, scrap y segundas
  const deltaProd = toFullShift ? Math.max(120, 860 - UanifyState.producedTotal) : sc.producedDelta;
  UanifyState.producedTotal += deltaProd;
  UanifyState.scrapTotal += sc.scrapDelta;
  UanifyState.secondGradeTotal += sc.secondGradeDelta;

  // 2. Actualizar producción de estaciones proporcionalmente con variaciones naturales
  UanifyState.stations.forEach(st => {
    const isFast = st.id === 'corte' || st.id === 'embarque';
    const isQuality = st.id.startsWith('calidad');
    const factor = isFast ? 1.15 : isQuality ? 0.95 : 1.0;
    const added = Math.round((deltaProd / 14) * factor) + (Math.floor(Math.random() * 3) - 1);
    st.produced += Math.max(2, added);
    
    // Asignar WIP dinámico según el escenario de la hora
    if (sc.stationWips && sc.stationWips[st.id] !== undefined) {
      st.wipWaiting = sc.stationWips[st.id] + (Math.floor(Math.random() * 3) - 1);
    }
  });

  // 3. Registrar nuevo evento en la bitácora de paros SMED
  if (sc.downtime) {
    const exists = UanifyState.downtimes.some(d => d.time === sc.downtime.time && d.station === sc.downtime.station);
    if (!exists) {
      UanifyState.downtimes.unshift({ ...sc.downtime });
    }
  }

  // 4. Actualizar stock de subensamble de tafiletes (descontar piezas consumidas)
  if (UanifyState.tafileteStock) {
    UanifyState.tafileteStock.forEach(t => {
      const consumed = Math.round(deltaProd * (t.size === '57' ? 0.35 : t.size === '56' || t.size === '58' ? 0.22 : 0.07));
      t.stock = Math.max(15, t.stock - consumed + (Math.floor(Math.random() * 8) + 4)); // reabastecimiento continuo
      t.available = Math.max(10, t.stock - t.reserved);
    });
  }

  // 5. Actualizar avance horario en Tablero Andon si existe
  if (UanifyState.hourlyData && UanifyState.hourlyData.length) {
    const hourMapIndex = Math.min(UanifyState.hourlyData.length - 1, currentScenarioIndex);
    UanifyState.hourlyData[hourMapIndex].produced = Math.min(130, deltaProd);
  }

  // 6. Notificar al bus y refrescar todas las vistas
  EventBus.emit('piece-registered');
  if (window.updateExecutiveMetrics) window.updateExecutiveMetrics();

  window.UanifyUI.toast(
    `${toFullShift ? 'Jornada completa simulada' : 'Hora ' + sc.hourLabel + ' simulada'}: +${deltaProd} pzas · Cuello: ${sc.bottleneckDept}. OEE: ${document.getElementById('oeeGlobalScore')?.textContent || '86%'}.`,
    'success',
    toFullShift ? 'Turno Completo Simulado' : 'Simulación de Hora Completada'
  );
}

// ── REINICIAR SIMULACIÓN A ESTADO MATUTINO BASE ──────────────────────────────
function resetSimulationData() {
  currentScenarioIndex = 0;
  const sc = SHIFT_HOURLY_SCENARIOS[0];

  UanifyState.producedTotal = 612;
  UanifyState.scrapTotal = 14;
  UanifyState.secondGradeTotal = 26;

  // Restaurar estaciones
  UanifyState.stations.forEach((st, idx) => {
    st.produced = Math.round(612 / 14) + (idx % 3);
    if (sc.stationWips && sc.stationWips[st.id] !== undefined) {
      st.wipWaiting = sc.stationWips[st.id];
    }
  });

  // Restaurar bitácora a eventos iniciales
  UanifyState.downtimes = [
    { time: '07:45', station: 'Prensas Vapor (Copa) #2', cause: 'Cambio de horma: Roper a Viejón (SMED)', duration: '14 min', impact: '-22 pzas' },
    { time: '09:20', station: 'Englopado / Dope (Camas)', cause: 'Ajuste de fórmula de sellador en tina principal', duration: '8 min', impact: '-10 pzas' },
    { time: '11:10', station: 'Prensas Vapor #1', cause: 'Baja presión de vapor en caldera', duration: '12 min', impact: '-18 pzas' },
    { time: '12:35', station: 'Adorno 1 (Tafilete/Toquilla)', cause: 'Sin tafiletes talla 58 en subensamble', duration: '9 min', impact: '-12 pzas' }
  ];

  EventBus.emit('piece-registered');
  if (window.updateExecutiveMetrics) window.updateExecutiveMetrics();

  window.UanifyUI.toast(
    'Simulación restablecida al estado base de las 07:00 hrs (612 piezas producidas).',
    'info',
    'Simulación Reiniciada'
  );
}

// ── ACTUALIZAR CABECERA DE SIMULACIÓN ─────────────────────────────────────────
function updateSimulationHeader() {
  const sc = SHIFT_HOURLY_SCENARIOS[currentScenarioIndex] || SHIFT_HOURLY_SCENARIOS[0];
  const simText = document.getElementById('simHourText');
  if (simText) {
    simText.textContent = `Hora Simulada: ${sc.hourLabel} (${sc.title} · ${sc.pctOfDay}%)`;
  }
}

// ── RESTRICCIÓN DE ACCESO A SUBTAB KPIS (SOLO INGENIEROS Y ADMIN) ────────────
function checkKpisAccess() {
  const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
  const kpisBtn = document.querySelector('.sub-tab-btn[data-subtab="subtab-analytics-kpis"]') || document.querySelector('.sub-tab-btn[data-subtab="subtab-engineer-kpis"]');
  const kpisContent = document.getElementById('subtab-analytics-kpis') || document.getElementById('subtab-engineer-kpis');

  const canAccess = (user.role === 'admin' || user.role === 'ingeniero');

  if (kpisBtn) {
    if (!canAccess) {
      kpisBtn.style.opacity = '0.5';
      kpisBtn.title = 'Exclusivo para Ingenieros y Administradores';
    } else {
      kpisBtn.style.opacity = '1';
      kpisBtn.title = '';
    }
  }

  if (kpisContent && !canAccess && kpisContent.classList.contains('active')) {
    const firstBtn = document.querySelector('.sub-tab-btn[data-subtab="subtab-analytics-oee"]') || document.querySelector('.sub-tab-btn[data-subtab="subtab-engineer-oee"]');
    if (firstBtn) firstBtn.click();
    window.UanifyUI.toast(
      'El apartado de KPIs de Supervisores y Departamentos es de acceso exclusivo para Ingeniería y Dirección.',
      'error',
      'Acceso Restringido'
    );
  }
}

// ── PIPELINE DE WIP & DETECCIÓN DE CUELLOS DE BOTELLA ────────────────────────
function renderPipeline() {
  const container = document.getElementById('pipelineViz');
  if (!container) return;

  const sc = SHIFT_HOURLY_SCENARIOS[currentScenarioIndex] || SHIFT_HOURLY_SCENARIOS[0];
  const alertEl = document.getElementById('bottleneckAlert');
  if (alertEl) {
    alertEl.textContent = sc.bottleneckDept;
  }

  const maxWip = 45;
  container.innerHTML = UanifyState.stations.map(st => {
    const isBottleneck = st.wipWaiting >= 25;
    const isQuality    = st.id.startsWith('calidad');
    const barWidth     = Math.min(100, Math.round((st.wipWaiting / maxWip) * 100));

    return `
      <div class="pipe-row">
        <span class="pipe-name" style="${isQuality ? 'color:#B45309; font-weight:700;' : ''}">
          ${st.name}
        </span>
        <div class="pipe-track">
          <div class="pipe-fill ${isBottleneck ? 'bottleneck' : ''}" style="width: ${barWidth}%;"></div>
        </div>
        <span class="pipe-count ${isBottleneck ? 'color-amber' : ''}">
          ${st.wipWaiting} pzas
        </span>
      </div>
    `;
  }).join('');
}

// ── TABLA DINÁMICA DE KPIS DE SUPERVISORES ──────────────────────────────────
function renderSupervisorKpis() {
  const tbody = document.getElementById('supervisorKpisTableBody');
  if (!tbody) return;

  const sc = SHIFT_HOURLY_SCENARIOS[currentScenarioIndex] || SHIFT_HOURLY_SCENARIOS[0];

  tbody.innerHTML = `
    <tr>
      <td><strong>Juan Manuel Pérez</strong></td>
      <td><span class="badge-subtle">Prensas de Hormado a Brillo y Pulido</span></td>
      <td><span style="font-family:var(--font-mono); font-weight:700;">${sc.sup1Takt}s</span></td>
      <td><strong style="color:var(--color-green);">${sc.sup1Fulfill}%</strong></td>
      <td>${sc.sup1Scrap}%</td>
      <td><span class="badge-status" style="background:var(--color-green-bg); color:var(--color-green);">${sc.sup1Grade}</span></td>
    </tr>
    <tr>
      <td><strong>Roberto Méndez</strong></td>
      <td><span class="badge-subtle">Corte de Telar a Engomado y Secado</span></td>
      <td><span style="font-family:var(--font-mono); font-weight:700;">${sc.sup2Takt}s</span></td>
      <td><strong style="color:var(--color-brand);">${sc.sup2Fulfill}%</strong></td>
      <td>${sc.sup2Scrap}%</td>
      <td><span class="badge-status" style="background:var(--color-green-bg); color:var(--color-green);">${sc.sup2Grade}</span></td>
    </tr>
    <tr>
      <td><strong>Auxiliar de Rampa</strong></td>
      <td><span class="badge-subtle">Prensas de Hormado (Rampa)</span></td>
      <td><span style="font-family:var(--font-mono); font-weight:700;">${sc.auxTakt}s</span></td>
      <td><strong style="color:var(--color-green);">${sc.auxFulfill}%</strong></td>
      <td>${sc.auxScrap}%</td>
      <td><span class="badge-status" style="background:var(--color-green-bg); color:var(--color-green);">${sc.auxGrade}</span></td>
    </tr>
  `;
}

// ── MATRIZ DE MATERIALES (BOM) CON CONSUMO ACUMULADO ────────────────────────
function renderMaterialMatrix() {
  const container = document.getElementById('materialMatrixBody');
  if (!container) return;

  const pzas = UanifyState.producedTotal;
  const materials = [
    { name: 'Pintura Taiwan 1125',    cat: 'Acabados',     usedIn: 47, consumed: (pzas * 0.08).toFixed(1) + ' L', notes: 'Posible cambio de proveedor' },
    { name: 'Resina / Dope Sellador', cat: 'Englopado',    usedIn: 60, consumed: (pzas * 0.12).toFixed(1) + ' L', notes: 'Común a todos los modelos de telar' },
    { name: 'Sellador Brochas',       cat: 'Refuerzos',    usedIn: 60, consumed: (pzas * 15).toLocaleString() + ' ml', notes: 'Aplicado en área de patio exterior' },
    { name: 'Telar Fino Rollo',       cat: 'Materia Prima',usedIn: 38, consumed: (pzas * 1.2).toFixed(1) + ' m', notes: 'Producto campeón 70% del volumen' },
    { name: 'Alambre Ala (Memoria)',  cat: 'Insumos',      usedIn: 52, consumed: (pzas * 0.95).toFixed(1) + ' m', notes: 'Calibre 19 para memoria de falda' },
    { name: 'Tafilete / Badana 57cm', cat: 'Subensamble',  usedIn: 34, consumed: Math.round(pzas * 0.35) + ' pzas', notes: 'Talla más vendida en México' },
    { name: 'Tafilete / Badana 58cm', cat: 'Subensamble',  usedIn: 28, consumed: Math.round(pzas * 0.25) + ' pzas', notes: 'Talla regular mayorista' },
    { name: 'Toquilla Cuero Natural', cat: 'Adorno',       usedIn: 60, consumed: (pzas * 0.85).toFixed(1) + ' m', notes: 'Subensamble paralelo en mesa de adorno' },
    { name: 'Barniz / Brillo Poliuretano', cat: 'Acabados',usedIn: 44, consumed: (pzas * 22).toLocaleString() + ' ml', notes: 'Post-inspección Calidad 2' }
  ];

  container.innerHTML = materials.map(m => `
    <tr>
      <td><strong style="font-size:12.5px; color:var(--text-primary);">${m.name}</strong></td>
      <td style="text-align:center;"><span class="badge-subtle" style="font-size:11px; display:inline-block; margin:0 auto;">${m.cat}</span></td>
      <td style="text-align:center;"><strong style="font-family:'JetBrains Mono', monospace; font-size:12.5px;">${m.usedIn} fichas</strong></td>
      <td style="text-align:center;"><span class="table-badge-code" style="margin:0 auto; font-size:11.5px;">${m.consumed}</span></td>
      <td style="color:var(--text-secondary); font-size:11.5px;">${m.notes}</td>
    </tr>
  `).join('');
}

// ── BITÁCORA DE PAROS ────────────────────────────────────────────────────────
function renderDowntimes() {
  const container = document.getElementById('downtimeTbody');
  if (!container || !UanifyState.downtimes) return;

  container.innerHTML = UanifyState.downtimes.map(d => `
    <tr>
      <td class="col-code" style="text-align:center;"><span class="table-badge-code" style="margin:0 auto;">${d.time}</span></td>
      <td><strong>${d.station}</strong></td>
      <td>${d.cause}</td>
      <td style="text-align:center;"><span class="badge-subtle" style="font-family:'JetBrains Mono', monospace; color:var(--color-red); border-color:rgba(239, 68, 68, 0.25); font-weight:700; display:inline-block; margin:0 auto;">${d.duration}</span></td>
      <td style="text-align:center;"><span class="badge-subtle" style="font-family:'JetBrains Mono', monospace; font-weight:700; color:var(--color-amber, #D97706); border-color:rgba(217, 119, 6, 0.25); display:inline-block; margin:0 auto;">${d.impact}</span></td>
    </tr>
  `).join('');
}

// ── OEE GLOBAL MATEMÁTICO ────────────────────────────────────────────────────
function updateOeeScores() {
  const sc = SHIFT_HOURLY_SCENARIOS[currentScenarioIndex] || SHIFT_HOURLY_SCENARIOS[0];
  const avail = sc.availPct || 94.5;
  const perf  = Math.min(99.5, Math.round((UanifyState.producedTotal / (UanifyState.metaShiftTotal * (sc.pctOfDay / 100))) * 91.8 * 10) / 10);
  const qual  = Math.round(((UanifyState.producedTotal - UanifyState.scrapTotal) / UanifyState.producedTotal) * 1000) / 10;
  const oee   = Math.round(((avail / 100) * (perf / 100) * (qual / 100)) * 1000) / 10;

  const availBadge = document.getElementById('oeeAvailBadge');
  const availBar   = document.getElementById('oeeAvailBar');
  const availDet   = document.getElementById('oeeAvailDetail');

  const perfBadge  = document.getElementById('oeePerfBadge');
  const perfBar    = document.getElementById('oeePerfBar');
  const perfDet    = document.getElementById('oeePerfDetail');

  const qualBadge  = document.getElementById('oeeQualBadge');
  const qualBar    = document.getElementById('oeeQualBar');
  const qualDet    = document.getElementById('oeeQualDetail');

  const scoreEl    = document.getElementById('oeeGlobalScore');
  const verdictEl  = document.getElementById('oeeGlobalVerdict');

  if (availBadge) availBadge.textContent = `${avail}%`;
  if (availBar) availBar.style.width = `${avail}%`;
  if (availDet) availDet.textContent = `Tiempo productivo real vs. programado (${sc.downtime ? sc.downtime.cause : 'Paros acumulados'})`;

  if (perfBadge) perfBadge.textContent = `${perf}%`;
  if (perfBar) perfBar.style.width = `${perf}%`;
  if (perfDet) perfDet.textContent = `Velocidad real de ciclo vs. tiempo estándar (Takt objetivo: ${UanifyState.taktTimeSec}s)`;

  if (qualBadge) qualBadge.textContent = `${qual}%`;
  if (qualBar) qualBar.style.width = `${qual}%`;
  if (qualDet) qualDet.textContent = `Primeras calidades sin retrabajo (${UanifyState.scrapTotal} mermas de ${UanifyState.producedTotal} sombreros procesados)`;

  if (scoreEl) scoreEl.textContent = `${oee}%`;
  if (verdictEl) {
    verdictEl.textContent = oee >= 85 
      ? `Nivel de Clase Mundial PyME (>85%). Excelente control de tiempos y cero cuellos de botella críticos.`
      : `Eficiencia Operativa en Rango Aceptable (${oee}%). Desahogando ${sc.bottleneckDept}.`;
  }
}

