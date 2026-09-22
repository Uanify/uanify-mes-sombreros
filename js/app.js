/**
 * UANIFY MES · GLOBAL APP CONTROLLER
 * Personalizado para Planta de Producción Tombstone Hats (San Pancho, Gto.)
 */

const UanifyState = {
  activeTab: 'andon',
  soundEnabled: true,
  currentShift: 'Turno 1 (Matutino · 07:00 - 15:30)',
  
  // Tombstone Hats Operational Metrics
  metaShiftTotal: 850,
  producedTotal: 612,
  scrapTotal: 14,
  taktTimeSec: 42,
  unitPriceMxn: 1310, // Precio promedio catálogo Tombstone (Línea Master Telar / Texanas)
  
  // Modelos activos de Tombstone Hats
  activeModels: [
    { id: 'denver', name: '1000X Master Telar Denver', sku: 'TB-1000X-DNV-58', price: 1310, material: 'Telar Fino 1000X / Toquilla Piel', size: '58 (7 1/4)' },
    { id: 'viejonon', name: '1000X Master Telar El Viejonón', sku: 'TB-1000X-VJN-57', price: 1310, material: 'Telar Master / Horma Bullrider', size: '57 (7 1/8)' },
    { id: 'laredo', name: '1000X Master Telar Laredo F10', sku: 'TB-1000X-LRD-58', price: 1310, material: 'Master Telar / Plancha Falda 4"', size: '58 (7 1/4)' },
    { id: 'frontier', name: '1000X Master Telar Frontier F9', sku: 'TB-1000X-FRN-59', price: 1310, material: 'Fieltro / Copa Gota de Agua', size: '59 (7 3/8)' }
  ],
  selectedModelIndex: 0,

  // Estaciones reales de manufactura en planta Tombstone
  stations: [
    {
      id: 'apresto',
      code: 'EST-01',
      name: 'Engomado & Apresto',
      desc: 'Rigidez química de campanas y telares',
      target: 150,
      produced: 118,
      scrap: 2,
      wipWaiting: 14,
      cycleTime: '36s',
      status: 'running',
      operator: 'Raúl Mendoza'
    },
    {
      id: 'prensas',
      code: 'EST-02',
      name: 'Prensas de Hormado Tombstone',
      desc: 'Hormas térmicas Denver / Bullrider / Laredo',
      target: 140,
      produced: 98,
      scrap: 4,
      wipWaiting: 46, // Cuello de botella
      cycleTime: '26s',
      status: 'running',
      operator: 'Juan Manuel Pérez (P-04)'
    },
    {
      id: 'corte',
      code: 'EST-03',
      name: 'Troquelado de Falda & Plancha',
      desc: 'Corte de ala circular y asentado de falda',
      target: 145,
      produced: 104,
      scrap: 1,
      wipWaiting: 9,
      cycleTime: '28s',
      status: 'running',
      operator: 'Carlos Ortiz'
    },
    {
      id: 'ribete',
      code: 'EST-04',
      name: 'Ribeteado & Tafilete Tombstone',
      desc: 'Costura de badana con sello dorado Tombstone',
      target: 135,
      produced: 96,
      scrap: 3,
      wipWaiting: 16,
      cycleTime: '44s',
      status: 'warning',
      operator: 'María Elena Gómez'
    },
    {
      id: 'adorno',
      code: 'EST-05',
      name: 'Toquillas, Plumas & Herrajes',
      desc: 'Ensamble de toquilla y pin de plata Tombstone',
      target: 140,
      produced: 101,
      scrap: 2,
      wipWaiting: 11,
      cycleTime: '40s',
      status: 'running',
      operator: 'Sofía Rocha'
    },
    {
      id: 'empaque',
      code: 'EST-06',
      name: 'Inspección de Calidad & Cajas B2B',
      desc: 'Control de calidad final y encajonado mayorista',
      target: 140,
      produced: 95,
      scrap: 2,
      wipWaiting: 6,
      cycleTime: '30s',
      status: 'running',
      operator: 'Fernando Valdivia'
    }
  ],

  // Bitácora de Paros (Downtimes)
  downtimes: [
    { time: '07:45', station: 'Prensas Hormado #2', cause: 'Cambio de molde a Texana Denver F10 (SMED)', duration: '14 min', impact: '-22 pzas' },
    { time: '09:20', station: 'Engomado & Apresto', cause: 'Ajuste de fórmula de resina en tina', duration: '8 min', impact: '-10 pzas' },
    { time: '11:10', station: 'Prensas Hormado #1', cause: 'Baja presión en línea de caldera de vapor', duration: '12 min', impact: '-18 pzas' },
    { time: '12:35', station: 'Ribeteado & Tafilete', cause: 'Rotura de hilo de pespunte en tafilete de piel', duration: '5 min', impact: '-6 pzas' }
  ],

  // Registro hora por hora
  hourlyData: [
    { hour: '07:00', target: 100, produced: 92 },
    { hour: '08:00', target: 110, produced: 88 },
    { hour: '09:00', target: 110, produced: 104 },
    { hour: '10:00', target: 110, produced: 108 },
    { hour: '11:00', target: 110, produced: 96 },
    { hour: '12:00', target: 110, produced: 112 },
    { hour: '13:00', target: 110, produced: 12 }, // Hora en curso
    { hour: '14:00', target: 90,  produced: 0 }
  ]
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

// Sintetizador de audio industrial
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

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Pestañas de Navegación
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

  // Control de sonido
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
