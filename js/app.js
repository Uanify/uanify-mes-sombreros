/**
 * UANIFY MES · GLOBAL APP CONTROLLER
 * State management, navigation, audio synthesis and real-time event dispatcher
 */

const UanifyState = {
  activeTab: 'andon',
  soundEnabled: true,
  currentShift: 'Turno 1 (Matutino)',
  
  // San Pancho Hat Manufacturing Data
  metaShiftTotal: 850,
  producedTotal: 612,
  scrapTotal: 15,
  taktTimeSec: 42,
  unitPriceMxn: 450,
  
  // Real Plant Stations
  stations: [
    {
      id: 'apresto',
      code: 'EST-01',
      name: 'Engomado & Apresto',
      desc: 'Rigidez química de campanas',
      target: 150,
      produced: 118,
      scrap: 2,
      wipWaiting: 12,
      cycleTime: '38s',
      status: 'running', // running, warning, stopped
      operator: 'Raúl Mendoza'
    },
    {
      id: 'prensas',
      code: 'EST-02',
      name: 'Prensas de Hormado',
      desc: 'Moldeado térmico a vapor',
      target: 140,
      produced: 98,
      scrap: 5,
      wipWaiting: 44, // Cuello de botella detectado
      cycleTime: '25s',
      status: 'running',
      operator: 'Juan Manuel Pérez (P-04)'
    },
    {
      id: 'corte',
      code: 'EST-03',
      name: 'Corte & Planchado Falda',
      desc: 'Troquelado de ala circular',
      target: 145,
      produced: 104,
      scrap: 1,
      wipWaiting: 8,
      cycleTime: '29s',
      status: 'running',
      operator: 'Carlos Ortiz'
    },
    {
      id: 'ribete',
      code: 'EST-04',
      name: 'Ribeteado & Tafilete',
      desc: 'Costura sudorera interna',
      target: 135,
      produced: 96,
      scrap: 3,
      wipWaiting: 15,
      cycleTime: '45s',
      status: 'warning',
      operator: 'María Elena Gómez'
    },
    {
      id: 'adorno',
      code: 'EST-05',
      name: 'Toquilla & Acabado',
      desc: 'Colocación forro y herrajes',
      target: 140,
      produced: 101,
      scrap: 2,
      wipWaiting: 10,
      cycleTime: '40s',
      status: 'running',
      operator: 'Sofía Rocha'
    },
    {
      id: 'empaque',
      code: 'EST-06',
      name: 'Calidad & Empaque',
      desc: 'Inspección final y caja B2B',
      target: 140,
      produced: 95,
      scrap: 2,
      wipWaiting: 5,
      cycleTime: '32s',
      status: 'running',
      operator: 'Fernando Valdivia'
    }
  ],

  // Downtime Log (Paros de Hoy)
  downtimes: [
    { time: '07:45', station: 'Prensas Hormado #2', cause: 'Cambio de molde a Fedora 4X (SMED)', duration: '14 min', impact: '-22 pzas' },
    { time: '09:20', station: 'Engomado & Apresto', cause: 'Falta de resina / químico en tina', duration: '8 min', impact: '-10 pzas' },
    { time: '11:10', station: 'Prensas Hormado #1', cause: 'Baja presión de caldera de vapor', duration: '12 min', impact: '-18 pzas' },
    { time: '12:35', station: 'Ribeteado & Tafilete', cause: 'Rotura de aguja en máquina de coser', duration: '5 min', impact: '-6 pzas' }
  ],

  // Hora por Hora
  hourlyData: [
    { hour: '07:00', target: 100, produced: 92 },
    { hour: '08:00', target: 110, produced: 88 },
    { hour: '09:00', target: 110, produced: 104 },
    { hour: '10:00', target: 110, produced: 108 },
    { hour: '11:00', target: 110, produced: 96 },
    { hour: '12:00', target: 110, produced: 112 },
    { hour: '13:00', target: 110, produced: 12 }, // En curso
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

// Sound Synthesizer (Zero asset dependency)
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
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
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

// Initialize App Shell
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs
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

  // Clock
  function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
      clockEl.textContent = now.toTimeString().split(' ')[0];
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Audio Toggle
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

  // Init modules
  if (window.initAndonView) window.initAndonView();
  if (window.initTerminalView) window.initTerminalView();
  if (window.initEngineerView) window.initEngineerView();
  if (window.initExecutiveView) window.initExecutiveView();
});
