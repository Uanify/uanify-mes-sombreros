/**
 * UANIFY MES · GLOBAL APP CONTROLLER
 * Sistema MES para Planta Matriz Tombstone Hats (San Francisco del Rincón, Gto.)
 * Basado en levantamiento técnico de planta: Lotes de 60 pzas, fraccionamiento a 15 pzas,
 * almacenes intermedios (WIP), subensambles de tafilete por talla e integración CONTPAQi (COMPAC).
 */

const UanifyState = {
  activeTab: 'andon',
  soundEnabled: true,
  currentShift: 'Turno 1 (Matutino · 07:00 - 15:30)',
  
  // Métricas Generales Tombstone Hats
  metaShiftTotal: 850,
  producedTotal: 612,
  scrapTotal: 14,
  secondGradeTotal: 26, // Sombreros de segunda / regulares (para venta de viernes)
  taktTimeSec: 42,
  unitPriceMxn: 1310, // Precio promedio catálogo Tombstone (Master Telar)
  
  // Modelos del Catálogo Oficial Tombstone Hats
  activeModels: [
    { id: 'denver', name: '1000X Master Telar Denver', sku: 'TB-1000X-DNV-58', price: 1310, material: 'Telar Fino 1000X / Toquilla Piel', size: '58 (7 1/4)', crownHorma: 'Denver' },
    { id: 'viejonon', name: '1000X Master Telar El Viejonón', sku: 'TB-1000X-VJN-57', price: 1310, material: 'Master Telar / Horma Bullrider', size: '57 (7 1/8)', crownHorma: 'Viejón' },
    { id: 'laredo', name: '1000X Master Telar Laredo F10', sku: 'TB-1000X-LRD-58', price: 1310, material: 'Master Telar / Falda 4" Plana', size: '58 (7 1/4)', crownHorma: 'Laredo' },
    { id: 'frontier', name: '1000X Master Telar Frontier F9', sku: 'TB-1000X-FRN-59', price: 1310, material: 'Telar / Copa Gota de Agua', size: '59 (7 3/8)', crownHorma: 'Frontier' },
    { id: 'chaparral', name: '1000X Master Telar Chaparral', sku: 'TB-1000X-CHP-56', price: 1310, material: 'Telar Blanco / Toquilla Texana', size: '56 (7)', crownHorma: 'Chaparral' }
  ],
  selectedModelIndex: 0,

  // Lotes Madres (60 pzas) y Sublotes (15 pzas)
  activeLots: [
    {
      lotId: 'L-1094',
      model: '1000X Master Telar Denver',
      size: '58',
      totalPieces: 60,
      currentStation: 'Hidráulico & Alineado (Rampa)',
      operator: 'Juan Manuel Pérez (P-04)',
      status: 'Fraccionando en sublotes',
      isSubdivided: true,
      sublots: [
        { id: 'L-1094-01', pieces: 15, station: 'Pintura & Secado', status: 'En Proceso', operator: 'Carlos Ortiz' },
        { id: 'L-1094-02', pieces: 15, station: 'Pintura & Secado', status: 'En Proceso', operator: 'Carlos Ortiz' },
        { id: 'L-1094-03', pieces: 15, station: 'Almacén Alineado', status: 'En Espera', operator: 'Sin Asignar' },
        { id: 'L-1094-04', pieces: 15, station: 'Almacén Alineado', status: 'En Espera', operator: 'Sin Asignar' }
      ]
    },
    {
      lotId: 'L-1095',
      model: '1000X Master Telar El Viejonón',
      size: '57',
      totalPieces: 60,
      currentStation: 'Prensas de Hormado',
      operator: 'Raúl Mendoza',
      status: 'Hormado Térmico',
      isSubdivided: false,
      sublots: []
    },
    {
      lotId: 'L-1096',
      model: '1000X Master Telar Laredo F10',
      size: '58',
      totalPieces: 60,
      currentStation: 'Englobado (Baño Dope)',
      operator: 'Pedro Torres',
      status: 'Secado en Cama #3',
      isSubdivided: false,
      sublots: []
    }
  ],

  // Stock de Subensambles (Tafiletes por Talla listos para Adorno 1)
  tafileteStock: [
    { size: '55', stock: 85, reserved: 30, available: 55 },
    { size: '56', stock: 140, reserved: 60, available: 80 },
    { size: '57', stock: 230, reserved: 120, available: 110 }, // Talla estrella
    { size: '58', stock: 165, reserved: 90, available: 75 },
    { size: '59', stock: 75, reserved: 30, available: 45 },
    { size: '60', stock: 40, reserved: 15, available: 25 }
  ],

  // Almacenes Intermedios y Estaciones de Producción en Planta Tombstone
  stations: [
    {
      id: 'corte',
      code: 'ALM-01',
      name: 'Tendido, Corte & Cuadros',
      desc: 'Tendido de telar y corte en cuadros para copa/falda',
      target: 150,
      produced: 135,
      scrap: 1,
      wipWaiting: 18,
      cycleTime: '32s',
      status: 'running',
      operator: 'Esteban Lozano'
    },
    {
      id: 'alambrado',
      code: 'ALM-02',
      name: 'Alambrado & Costura de Ala',
      desc: 'Colocación de alambre de memoria en falda',
      target: 145,
      produced: 124,
      scrap: 2,
      wipWaiting: 15,
      cycleTime: '38s',
      status: 'running',
      operator: 'Rocío Morales'
    },
    {
      id: 'dope',
      code: 'ALM-03',
      name: 'Englobado & Baño de Dope',
      desc: 'Sellado químico de poros y secado en camas por lote',
      target: 140,
      produced: 110,
      scrap: 1,
      wipWaiting: 22,
      cycleTime: '45s',
      status: 'running',
      operator: 'Pedro Torres'
    },
    {
      id: 'prensas',
      code: 'ALM-04',
      name: 'Prensas de Hormado Térmico',
      desc: 'Hormas Denver, Viejón, Laredo, Roper a vapor',
      target: 140,
      produced: 98,
      scrap: 4,
      wipWaiting: 46, // Cuello de botella detectado en planta
      cycleTime: '26s',
      status: 'running',
      operator: 'Juan Manuel Pérez (P-04)'
    },
    {
      id: 'alineado',
      code: 'ALM-05',
      name: 'Hidráulico & Fraccionado (Rampa)',
      desc: 'Almacén de alineado donde lote de 60 se divide a 15 pzas',
      target: 140,
      produced: 102,
      scrap: 2,
      wipWaiting: 14,
      cycleTime: '24s',
      status: 'running',
      operator: 'Auxiliar de Línea (Rampa)'
    },
    {
      id: 'refaldeado',
      code: 'ALM-06',
      name: 'Refaldeado & Recorte de Falda',
      desc: 'Corte perimetral con cuchilla circular y perfilado',
      target: 145,
      produced: 104,
      scrap: 1,
      wipWaiting: 10,
      cycleTime: '28s',
      status: 'running',
      operator: 'Carlos Ortiz'
    },
    {
      id: 'pintura',
      code: 'ALM-07',
      name: 'Pintura, Secado & Brillo',
      desc: 'Aplicación de sellador, pintura con pistola y barniz',
      target: 135,
      produced: 96,
      scrap: 2,
      wipWaiting: 16,
      cycleTime: '42s',
      status: 'warning',
      operator: 'Marcos Villegas'
    },
    {
      id: 'adorno',
      code: 'ALM-08',
      name: 'Adorno 1 (Pegado Tafilete & Toquilla)',
      desc: 'Cruce de 3 subensambles: cuerpo + tafilete + toquilla',
      target: 140,
      produced: 101,
      scrap: 2,
      wipWaiting: 12,
      cycleTime: '40s',
      status: 'running',
      operator: 'María Elena Gómez'
    },
    {
      id: 'calidad',
      code: 'ALM-09',
      name: 'Inspección Final de Calidad & Segundas',
      desc: 'Separación de Primera (A) vs Segundas/Mermas de viernes',
      target: 140,
      produced: 95,
      scrap: 2,
      wipWaiting: 8,
      cycleTime: '25s',
      status: 'running',
      operator: 'Inspectora de Calidad'
    },
    {
      id: 'embarque',
      code: 'ALM-10',
      name: 'Producto Terminado & Vale COMPAC',
      desc: 'Carga a camioneta de mayoristas con vale de entrega',
      target: 140,
      produced: 90,
      scrap: 0,
      wipWaiting: 5,
      cycleTime: '20s',
      status: 'running',
      operator: 'Fernando Valdivia (Almacén)'
    }
  ],

  // Paros de Máquina Registrados
  downtimes: [
    { time: '07:45', station: 'Prensas Hormado #2', cause: 'Cambio de molde a Texana Denver F10 (SMED)', duration: '14 min', impact: '-22 pzas' },
    { time: '09:20', station: 'Englobado (Baño Dope)', cause: 'Ajuste de fórmula de laca/resina en tina', duration: '8 min', impact: '-10 pzas' },
    { time: '11:10', station: 'Prensas Hormado #1', cause: 'Baja presión de vapor en caldera matriz', duration: '12 min', impact: '-18 pzas' },
    { time: '12:35', station: 'Adorno 1 (Tafilete)', cause: 'Falta de tafiletes talla 58 en stock de subensamble', duration: '9 min', impact: '-12 pzas' }
  ],

  // Avance Hora por Hora
  hourlyData: [
    { hour: '07:00', target: 100, produced: 92 },
    { hour: '08:00', target: 110, produced: 88 },
    { hour: '09:00', target: 110, produced: 104 },
    { hour: '10:00', target: 110, produced: 108 },
    { hour: '11:00', target: 110, produced: 96 },
    { hour: '12:00', target: 110, produced: 112 },
    { hour: '13:00', target: 110, produced: 12 }, // En curso
    { hour: '14:00', target: 90,  produced: 0 }
  ],

  // Integración COMPAC / CONTPAQi
  compacSync: {
    status: 'Conectado · Sincronizado',
    lastSync: 'Hace 4 minutos',
    activeOrderB2B: 'OC-2026-4421',
    customer: 'Distribuidora Western de Monterrey S.A. de C.V.',
    orderQuantity: 10500,
    deliveredSoFar: 3680,
    pendingQuantity: 6820,
    invoiceStatus: 'Pre-factura generada en COMPAC'
  }
};

// Event bus
const EventBus = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
};

// Sintetizador de audio industrial (clicks de pistola QR, pedal, alertas)
const IndustrialAudio = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playPedalClick() {
    if (!UanifyState.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(920, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch(e) {}
  },
  playQrBeep() {
    if (!UanifyState.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch(e) {}
  },
  playAlert(type) {
    if (!UanifyState.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const freq = type === 'stop' ? 220 : 330;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch(e) {}
  }
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  // Pestañas de navegación
  const navBtns = document.querySelectorAll('.nav-btn');
  const viewPanels = document.querySelectorAll('.view-panel');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      UanifyState.activeTab = targetTab;

      navBtns.forEach(b => b.classList.remove('active'));
      viewPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`view-${targetTab}`);
      if (targetPanel) targetPanel.classList.add('active');

      EventBus.emit('tab-changed', targetTab);
    });
  });

  // Reloj en tiempo real
  function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
      clockEl.textContent = now.toTimeString().split(' ')[0];
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Sonido
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      UanifyState.soundEnabled = !UanifyState.soundEnabled;
      soundToggle.classList.toggle('muted', !UanifyState.soundEnabled);
      const soundText = soundToggle.querySelector('.sound-text');
      if (soundText) {
        soundText.textContent = UanifyState.soundEnabled ? 'Audio ON' : 'Audio OFF';
      }
      IndustrialAudio.playPedalClick();
    });
  }

  // Inicializar submódulos
  if (window.initAndonView) window.initAndonView();
  if (window.initTerminalView) window.initTerminalView();
  if (window.initEngineerView) window.initEngineerView();
  if (window.initExecutiveView) window.initExecutiveView();
});
