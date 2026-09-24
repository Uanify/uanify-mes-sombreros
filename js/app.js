/**
 * UANIFY MES · GLOBAL APP CONTROLLER
 * Sistema MES para Planta Matriz Tombstone Hats (San Francisco del Rincón, Gto.)
 * 
 * DATOS VALIDADOS EN AUDIOS DE PLANTA (Septiembre 2026):
 * ─ Lotes madre: variable (ej. 1094), fraccionados en sublotes de 15 pzas en la Rampa
 * ─ Departamentos reales: Corte→Englopado(camas)→Refuerzos→Calidad1→Prensas(múltiples
 *   entradas)→Recortes/Alambrado→Englopado2→Calidad2→Pintura→Brillo→Temperado/Refaldeado→
 *   Adorno1(tafilete+toquilla)→Calidad3→Embarque
 * ─ Módulos físicos (QR/barras) por lote en almacenes intermedios. NO por pieza.
 * ─ Tarjetas viajeras se imprimen en Ingeniería. Supervisores las distribuyen.
 * ─ Merma se separa en almacén dedicado, se vende los viernes.
 * ─ COMPAC (CONTPAQi): ingeniera externa, membresía anual; al final del proceso.
 * ─ Accesorios (carteras, cintos, mariconeras, bolsitas, horquillas) = fichas técnicas + costeo.
 * ─ Sueldos aún son fijos (no destajo por pieza), destajo es Fase 2/3 futura.
 * ─ Supervisores sí tienen acceso a dispositivos; operarios NO tienen celular en planta.
 * ─ Hay 3 almacenes de materiales físicos separados.
 * ─ Tarjeta del lote inicial: 60 piezas hasta la rampa; sublotes (ej. 1094-01 a 1094-14).
 * ─ Sombreros de 2 piezas (copa + falda pegadas con calor) y 1 pieza. Campana preformada = proceso corto.
 */

// ─── SISTEMA ESTANDARIZADO DE NOTIFICACIONES Y MODALES (PROHIBIDO ALERT/CONFIRM) ───
window.UanifyUI = {
  toast(message, type = 'info', title = '') {
    const container = document.getElementById('uanifyToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `uanify-toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error')   icon = '🚨';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" aria-label="Cerrar">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 250);
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.isConnected) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 250);
      }
    }, 4500);
  },

  confirm(title, message, onConfirm, okText = 'Confirmar', cancelText = 'Cancelar') {
    const modal = document.getElementById('uanifyConfirmModal');
    if (!modal) {
      if (onConfirm) onConfirm();
      return;
    }
    const titleEl = document.getElementById('uanifyConfirmTitle');
    const msgEl = document.getElementById('uanifyConfirmMessage');
    const okBtn = document.getElementById('uanifyConfirmOkBtn');
    const cancelBtn = document.getElementById('uanifyConfirmCancelBtn');

    if (titleEl) titleEl.textContent = title || 'Confirmación Requerida';
    if (msgEl) msgEl.textContent = message || '¿Está seguro de realizar esta acción?';
    if (okBtn) okBtn.textContent = okText;
    if (cancelBtn) cancelBtn.textContent = cancelText;

    const cleanup = () => {
      modal.classList.remove('active');
      okBtn.onclick = null;
      cancelBtn.onclick = null;
    };

    okBtn.onclick = () => {
      cleanup();
      if (typeof onConfirm === 'function') onConfirm();
    };

    cancelBtn.onclick = () => {
      cleanup();
    };

    modal.classList.add('active');
  }
};

const UanifyState = {
  version: '2.8.2',
  activeTab: 'andon',
  currentShift: 'Turno Único (07:00 - 15:30 · Lunes a Viernes)',
  
  // ─── GESTIÓN DE USUARIOS Y ROLES (RBAC) ──────────────────────────────────
  currentUser: 'admin-1',
  users: [
    {
      id: 'admin-1',
      name: 'Edmundo González',
      email: 'egonzalez@tombstone.mx',
      role: 'admin',
      roleName: 'Administrador General',
      permissions: ['andon', 'terminal', 'engineer', 'executive', 'config'],
      assignedDepartments: ['*'],
      badge: '👑 Admin'
    },
    {
      id: 'ing-1',
      name: 'Ing. Carlos Ortiz',
      email: 'cortiz@tombstone.mx',
      role: 'ingeniero',
      roleName: 'Ingeniero de Procesos',
      permissions: ['andon', 'terminal', 'engineer'],
      assignedDepartments: ['*'],
      badge: '⚙️ Ingeniero'
    },
    {
      id: 'sup-1',
      name: 'Juan Manuel Pérez',
      email: 'jperez@tombstone.mx',
      role: 'supervisor',
      roleName: 'Supervisor de Nave y Almacenes (Depts 05-08)',
      permissions: ['andon', 'terminal'],
      assignedDepartments: ['D-05', 'D-06', 'D-07', 'D-08'],
      badge: '📋 Supervisor'
    },
    {
      id: 'sup-2',
      name: 'Roberto Méndez',
      email: 'rmendez@tombstone.mx',
      role: 'supervisor',
      roleName: 'Supervisor de Preparación y Corte (Depts 01-04)',
      permissions: ['andon', 'terminal'],
      assignedDepartments: ['D-01', 'D-02', 'D-03', 'D-04'],
      badge: '📋 Supervisor'
    }
  ],
  
  // Métricas Generales Tombstone Hats
  metaWeeklyTotal: 4250,     // Meta Semanal de Producción (5 días x 850 pzas/día)
  metaShiftTotal: 850,       // Meta estimada por turno único diario
  producedTotal: 612,
  scrapTotal: 14,
  secondGradeTotal: 26,      // Sombreros Regulares/Segunda → almacén dedicado → venta de viernes
  taktTimeSec: 42,
  unitPriceMxn: 1310,
  
  // Padrón de Operadores de Planta (NO acceden al sistema, gestionados por supervisores/ingenieros)
  operators: [
    { empId: 'EMP-101', name: 'Pedro Morales', deptCode: 'D-01', deptName: 'Corte de Telar', machine: 'Cortadora Automática C-01', shift: 'Turno Único', status: 'Activo' },
    { empId: 'EMP-102', name: 'Mateo Sánchez', deptCode: 'D-02', deptName: 'Englopado y Camas', machine: 'Englopadora Térmica E-01', shift: 'Turno Único', status: 'Activo' },
    { empId: 'EMP-103', name: 'Rosa Ibarra', deptCode: 'D-03', deptName: 'Refuerzos de Corona', machine: 'Prensa de Forros R-01', shift: 'Turno Único', status: 'Activo' },
    { empId: 'EMP-104', name: 'Javier Luna', deptCode: 'D-05', deptName: 'Prensas Hidráulicas', machine: 'Prensa Hidráulica P-01', shift: 'Turno Único', status: 'Activo' },
    { empId: 'EMP-105', name: 'Martín Delgado', deptCode: 'D-05', deptName: 'Prensas Hidráulicas', machine: 'Prensa Hidráulica P-02', shift: 'Turno Único', status: 'Activo' },
    { empId: 'EMP-106', name: 'Guadalupe Torres', deptCode: 'D-09', deptName: 'Pintura y Matizado', machine: 'Cabina de Aspersión PT-01', shift: 'Turno Único', status: 'Activo' },
    { empId: 'EMP-107', name: 'Esteban Rocha', deptCode: 'D-12', deptName: 'Adorno (Tafilete y Toquilla)', machine: 'Mesa de Ribeteado M-01', shift: 'Turno Único', status: 'Activo' }
  ],

  // Catálogo Oficial de Hormas y Moldes de San Francisco del Rincón (Validado en Fábrica)
  molds: [
    { code: 'HRM-JHN-54', name: '#54 JOHNSON LONA', tipo: 'Johnson', material: 'Aluminio Termo-Fundido', size: '54 (6 3/4)', machine: 'Prensa Hidráulica Michelagnoli P-01', status: 'En Uso' },
    { code: 'HRM-JHN-53', name: '#53 JOHNSON LONA', tipo: 'Johnson', material: 'Aluminio Termo-Fundido', size: '53 (6 5/8)', machine: 'Prensa Hidráulica Michelagnoli P-01', status: 'Disponible' },
    { code: 'HRM-SNR-57', name: '#57 SONORA', tipo: 'Sonora', material: 'Aluminio Termo-Fundido', size: '57 (7 1/8)', machine: 'Prensa Hidráulica Michelagnoli P-02', status: 'En Uso' },
    { code: 'HRM-CHP-53', name: '#53 CHAPARRAL LONA', tipo: 'Chaparral', material: 'Aluminio Termo-Fundido', size: '53 (6 5/8)', machine: 'Prensa Hidráulica P-03', status: 'Disponible' },
    { code: 'HRM-CHP-56', name: '#56 CHAPARRAL', tipo: 'Chaparral', material: 'Aluminio Termo-Fundido', size: '56 (7)', machine: 'Prensa Hidráulica P-03', status: 'En Uso' },
    { code: 'HRM-VJN-55', name: '#55 EL VIEJONÓN', tipo: 'Viejón', material: 'Aluminio Termo-Fundido', size: '55 (6 7/8)', machine: 'Prensa Hidráulica P-02', status: 'En Uso' },
    { code: 'HRM-DNV-58', name: '#58 DENVER MASTER', tipo: 'Roper', material: 'Aluminio Termo-Fundido', size: '58 (7 1/4)', machine: 'Prensa Hidráulica P-01', status: 'Disponible' },
    { code: 'HRM-BLR-58', name: '#58 BULLRIDER RODEO', tipo: 'Bullrider', material: 'Hierro Fundido', size: '58 (7 1/4)', machine: 'Prensa Hidráulica P-04', status: 'Disponible' }
  ],

  // Verificar si el usuario activo tiene acceso a operar sobre un departamento
  canCurrentUserAccessDept(deptCode) {
    const user = this.users.find(u => u.id === this.currentUser);
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'ingeniero') return true;
    if (user.assignedDepartments && (user.assignedDepartments.includes('*') || user.assignedDepartments.includes(deptCode))) {
      return true;
    }
    return false;
  },

  // Catálogo Oficial Tombstone (con hormas reales: Roper, Chaparral, Viejón, Laredo, Frontier, Sonora, Johnson)
  activeModels: [
    { id: 'viejonon',  name: '1000X Master Telar El Viejonón',sku: 'TB-1000X-VJN-55', price: 1310, material: 'Master Telar / Horma Viejón',          size: '55 (6 7/8)', crownHorma: 'Viejón',   tipo: '2 piezas', brim: '9 1/2', bend: 'ARRIBA' },
    { id: 'chaparral', name: '1000X Master Telar Chaparral',  sku: 'TB-1000X-CHP-56', price: 1310, material: 'Telar Blanco / Toquilla Texana',      size: '56 (7)',     crownHorma: 'Chaparral',tipo: '1 pieza',  brim: '9.0 Cm', bend: 'ABAJO' },
    { id: 'denver',    name: '1000X Master Telar Denver',     sku: 'TB-1000X-DNV-58', price: 1310, material: 'Telar Fino 1000X / Toquilla Piel',     size: '58 (7 1/4)', crownHorma: 'Roper',    tipo: '2 piezas', brim: '4 1/4"', bend: 'ARRIBA' },
    { id: 'laredo',    name: '1000X Master Telar Laredo F10', sku: 'TB-1000X-LRD-58', price: 1310, material: 'Master Telar / Falda 4" Plana',        size: '58 (7 1/4)', crownHorma: 'Laredo',   tipo: '1 pieza',  brim: '4.00"', bend: 'PLANA' },
    { id: 'frontier',  name: '1000X Master Telar Frontier F9',sku: 'TB-1000X-FRN-59', price: 1310, material: 'Telar / Copa Gota de Agua',            size: '59 (7 3/8)', crownHorma: 'Frontier', tipo: '2 piezas', brim: '4 1/2"', bend: 'ARRIBA' }
  ],
  selectedModelIndex: 0,

  // ─── LOTES Y TARJETAS VIAJERAS REALES DE PLANTA TOMBSTONE HATS ────────────
  // REGLA FÍSICA VALIDADA CON FOTOS:
  // - Tarjeta de LOTE MADRE: NO TIENE NÚMERO abajo a la derecha.
  // - Tarjeta de SUBLOTE: TIENE EL NÚMERO DE SUBLOTE abajo a la derecha (ej. "3").
  // - Porta-gafete con mica transparente y orificio para cordel en las torres de 15 sombreros.
  activeLots: [
    {
      lotId: '49,633',
      route: 'TARJETA HIDRAULICAS - ADORNO',
      model: 'VIEJONON',
      oProd: '15071',
      clase: '1,000X MASTER TELAR',
      finish: 'LAQUEADOS',
      brim: '9 1/2',
      bend: 'ARRIBA',
      size: '55',
      pieces: 15,
      totalPieces: 60,
      currentStation: 'Almacén Hidráulicas → Adorno',
      operator: 'Jorge',
      operatorSticker: 'JORGE',
      status: 'Fraccionado en 4 sublotes de 15 pzas',
      isSubdivided: true,
      sublots: [
        { id: '49633-1', sublotNum: 1, pieces: 15, station: 'Prensas Hidráulicas', status: 'En Proceso', operator: 'Jorge', operatorSticker: 'JORGE' },
        { id: '49633-2', sublotNum: 2, pieces: 15, station: 'Prensas Hidráulicas', status: 'En Proceso', operator: 'Jorge', operatorSticker: 'JORGE' },
        { id: '49633-3', sublotNum: 3, pieces: 15, station: 'Almacén Hidráulicas → Adorno', status: 'Listo para Recolección', operator: 'Jorge', operatorSticker: 'JORGE' },
        { id: '49633-4', sublotNum: 4, pieces: 15, station: 'Almacén Hidráulicas → Adorno', status: 'En Espera', operator: 'Jorge', operatorSticker: 'JORGE' }
      ]
    },
    {
      lotId: '49,842',
      route: 'TARJETA PRENSAS - PATIO',
      model: 'MAGNUM',
      oProd: '15877',
      clase: '1,000X MASTER TELAR',
      finish: 'LAQUEADOS',
      brim: '7 1/2',
      bend: 'ARRIBA',
      size: '52',
      pieces: 60,
      totalPieces: 60,
      cardColor: 'blue',
      verticalText: 'M A G N U M',
      penNote: 'D-120',
      currentStation: 'Patio Exterior de Secado',
      operator: 'Melany',
      operatorSticker: 'MELANY',
      operatorColor: 'pink',
      status: 'Lote Madre de 60 Pzas en Patio',
      isSubdivided: false,
      sublots: []
    },
    {
      lotId: '49,386',
      route: 'TARJETA HIDRAULICAS - ADORNO',
      model: 'CHAPARRAL',
      oProd: '15068',
      clase: '1,000X MASTER TELAR',
      finish: 'LAQUEADOS',
      brim: '9.0 Cm',
      bend: 'ABAJO',
      size: '56',
      pieces: 15,
      totalPieces: 60,
      cardColor: 'yellow',
      currentStation: 'Prensas Hidráulicas Michelagnoli',
      operator: 'Pedro Morales',
      operatorSticker: null,
      status: 'Lote Madre en Proceso',
      isSubdivided: false,
      sublots: []
    }
  ],

  // ─── SUBENSAMBLES ───────────────────────────────────────────────────────────
  // Tafiletes (badana interior) fabricados en sub-área paralela.
  // Tallas 55–60 cm. Actualmente coordinadas "a gritos" entre naves.
  // En Adorno 1 también se ensambla la Toquilla (cintito exterior).
  tafileteStock: [
    { size: '55', stock: 85,  reserved: 30,  available: 55 },
    { size: '56', stock: 140, reserved: 60,  available: 80 },
    { size: '57', stock: 230, reserved: 120, available: 110 }, // Talla + vendida en México
    { size: '58', stock: 165, reserved: 90,  available: 75  },
    { size: '59', stock: 75,  reserved: 30,  available: 45  },
    { size: '60', stock: 40,  reserved: 15,  available: 25  }
  ],

  // ─── HORMAS / MOLDES ────────────────────────────────────────────────────────
  // Inventario real mencionado en audio por Carlos.
  // Se identifican por color y forma. Se asignan a prensas de vapor e hidráulicas.
  // Prioridad: cargarlas al sistema para vincularlas a la programación (PPSP).
  hormas: [
    { id: 'roper',     name: 'Roper',     color: 'Beige',  prensa: 'Prensa Vapor #1',  status: 'En uso'       },
    { id: 'chaparral', name: 'Chaparral', color: 'Azul',   prensa: 'Prensa Vapor #2',  status: 'En uso'       },
    { id: 'viejon',    name: 'Viejón',    color: 'Rojo',   prensa: 'Hidráulica #3',    status: 'En espera'    },
    { id: 'laredo',    name: 'Laredo',    color: 'Verde',  prensa: 'Prensa Vapor #3',  status: 'En mantenimiento' },
    { id: 'frontier',  name: 'Frontier',  color: 'Gris',   prensa: 'Sin asignar',      status: 'Bodega'       }
  ],

  // ─── DEPARTAMENTOS REALES (validados en audio) ─────────────────────────────
  // FLUJO REAL (Audio Carlos): Corte de cuadros → [Inspección MP] → Alambrado
  //   → Englopado/Dope (camas) → Refuerzos (pintola/brocha) → [Calidad 1]
  //   → Prensas Vapor (Copa y Falda, múltiples entradas) → Recorte/Refaldeado
  //   → Almacén → Pintura + Secado → [Calidad 2 Pintura] → Brillo → [Calidad 3 Brillo]
  //   → Temperado/Refaldear → Adorno 1 (cruce tafilete + toquilla + cuerpo)
  //   → [Calidad 4 Final] → Embarque (vale COMPAC)
  //
  // 4 puntos de inspección de calidad fijos definidos por Carlos.
  // Merma puede sacar en CUALQUIER punto; si tiene arreglo se regresa al dpto. previo.
  // Producto sin arreglo = "saldo/segunda" → almacén de saldos → venta de viernes.
  // Lotes NO salen incompletos (regla estricta). Si faltan piezas, se reponen de saldo.
  stations: [
    {
      id: 'corte',
      code: 'D-01',
      name: 'Corte de Cuadros',
      desc: 'Tendido de rollos de telar y corte en cuadros (copa y falda por separado)',
      target: 150, produced: 135, scrap: 1, wipWaiting: 18, cycleTime: '32s',
      status: 'running', operator: 'Esteban Lozano',
      note: 'Inicio de proceso para telares. Campana preformada omite este paso.'
    },
    {
      id: 'alambrado',
      code: 'D-02',
      name: 'Alambrado de Ala',
      desc: 'Colocación de alambre de memoria en el perímetro de la falda + costura',
      target: 145, produced: 124, scrap: 2, wipWaiting: 15, cycleTime: '38s',
      status: 'running', operator: 'Rocío Morales',
      note: 'Opera con varias personas en estaciones de trabajo. Supervisor asigna lotes.'
    },
    {
      id: 'dope',
      code: 'D-03',
      name: 'Englopado / Baño de Dope',
      desc: 'Baño de dope (sellador) en esquina. Secado en camas. Cada cama = 1 lote.',
      target: 140, produced: 110, scrap: 1, wipWaiting: 22, cycleTime: '45s',
      status: 'running', operator: 'Pedro Torres',
      note: 'Tarjetas viajeras se identifican por cama. Lote se arma de nuevo al secar.'
    },
    {
      id: 'refuerzos',
      code: 'D-04',
      name: 'Refuerzos (Pintola / Brocha)',
      desc: 'Aplicación de sellador con brocha y refuerzos con pintola (patio exterior)',
      target: 140, produced: 118, scrap: 1, wipWaiting: 11, cycleTime: '30s',
      status: 'running', operator: 'Luis Salas',
      note: 'Cierra el tejido del telar. Después regresa al almacén y entra a Calidad 1.'
    },
    {
      id: 'calidad1',
      code: 'C-01',
      name: 'Calidad 1 (Post-Dope / Refuerzos)',
      desc: '1er punto de inspección de calidad. Libera o rechaza el lote al siguiente dpto.',
      target: 140, produced: 115, scrap: 2, wipWaiting: 10, cycleTime: '18s',
      status: 'running', operator: 'Inspectora de Calidad (turno)',
      note: 'Si pasa → avanza. Si no → regresa al dpto. con error. Si no tiene arreglo → saldo.'
    },
    {
      id: 'prensas',
      code: 'D-05',
      name: 'Prensas de Hormado (Copa y Falda)',
      desc: 'Prensas de vapor y calor con hormas metálicas. Múltiples entradas/salidas por fracción.',
      target: 140, produced: 98, scrap: 4, wipWaiting: 46,  // ← cuello de botella
      cycleTime: '26s', status: 'running', operator: 'Juan Manuel Pérez',
      note: 'Área de mayor polvo. 2 tipos: Prensas de vapor (copa) + Hidráulicas (alineado). ' +
            'Un lote puede entrar/salir varias veces (copa 1er paso, falda 2o paso, etc.).'
    },
    {
      id: 'recortes',
      code: 'D-06',
      name: 'Recorte y Refaldeado',
      desc: 'Corte perimetral de exceso de falda con cuchilla circular. Perfilado de orilla.',
      target: 145, produced: 104, scrap: 1, wipWaiting: 10, cycleTime: '28s',
      status: 'running', operator: 'Chicas de recortes (área exterior)',
      note: 'Área exterior (patio). También área de polvo. Se almacena antes de pintura.'
    },
    {
      id: 'pintura',
      code: 'D-07',
      name: 'Pintura y Secado',
      desc: 'Aplicación de pintura con pistola (ej. Pintura Taiwan 1125) y secado.',
      target: 135, produced: 96, scrap: 2, wipWaiting: 16, cycleTime: '42s',
      status: 'warning', operator: 'Marcos Villegas',
      note: 'Pintura con pistola/pistolas. El material puede cambiar por proveedor: ' +
            'cambio masivo en matriz de materiales. Post-pintura → Calidad 2.'
    },
    {
      id: 'calidad2',
      code: 'C-02',
      name: 'Calidad 2 (Post-Pintura)',
      desc: '2do punto de inspección. Verifica calidad de pintura antes de brillo.',
      target: 130, produced: 94, scrap: 1, wipWaiting: 8, cycleTime: '16s',
      status: 'running', operator: 'Inspectora de Calidad (turno)',
      note: 'Si hay error de pintura → regresa a Pintura. Si no tiene arreglo → saldo.'
    },
    {
      id: 'brillo',
      code: 'D-08',
      name: 'Brillo / Acabado',
      desc: 'Aplicación de brillo/barniz. Mismo punto de revisión que Calidad 2 (área compartida).',
      target: 130, produced: 91, scrap: 1, wipWaiting: 9, cycleTime: '22s',
      status: 'running', operator: 'Marcos Villegas',
      note: 'El mismo espacio físico revisa pintura y brillo secuencialmente.'
    },
    {
      id: 'temperado',
      code: 'D-09',
      name: 'Temperado / Refaldear',
      desc: 'Proceso de calor/temperado final. Perfilado de ala (refaldear).',
      target: 130, produced: 100, scrap: 1, wipWaiting: 9, cycleTime: '34s',
      status: 'running', operator: 'Operario Temperado',
      note: 'Después de aquí pasa al almacén previo a Adorno 1.'
    },
    {
      id: 'adorno',
      code: 'D-10',
      name: 'Adorno 1 (Tafilete + Toquilla)',
      desc: '3 subensambles convergen: cuerpo del sombrero + tafilete (por talla 55-60) + toquilla.',
      target: 140, produced: 101, scrap: 2, wipWaiting: 12, cycleTime: '40s',
      status: 'running', operator: 'María Elena Gómez',
      note: 'Coordinación actual: supervisores a gritos entre naves. ' +
            'Si no hay tafilete de la talla del lote → línea parada. ' +
            'Avance se da al pegar tafilete. Adornadoras ponen etiquetas adicionales.'
    },
    {
      id: 'calidad3',
      code: 'C-03',
      name: 'Calidad 3 (Producto Terminado)',
      desc: '3er punto de inspección (hay 4 en total). Calidad final antes de embarque.',
      target: 140, produced: 95, scrap: 2, wipWaiting: 8, cycleTime: '25s',
      status: 'running', operator: 'Inspectora de Calidad (turno)',
      note: 'Productos liberados van arriba (mezzanine). Se acumula producción del día. ' +
            'Saldos/segundas van al almacén dedicado para venta de viernes.'
    },
    {
      id: 'embarque',
      code: 'D-11',
      name: 'Producto Terminado y Vale COMPAC',
      desc: 'Carga al camión del cliente. Vale de salida digital → sincronización COMPAC (ingeniera externa).',
      target: 140, produced: 90, scrap: 0, wipWaiting: 5, cycleTime: '20s',
      status: 'running', operator: 'Fernando Valdivia (Almacén)',
      note: 'Cliente siempre trae su camión. Vale en papel → se descuenta en Excel de órdenes → ' +
            'pasa a contabilidad → factura en COMPAC. Ingeniera externa de COMPAC (membresía anual).'
    }
  ],

  // ─── PAROS REGISTRADOS ──────────────────────────────────────────────────────
  downtimes: [
    { time: '07:45', station: 'Prensas Vapor (Copa) #2',      cause: 'Cambio de horma: Roper a Viejón (SMED)',             duration: '14 min', impact: '-22 pzas' },
    { time: '09:20', station: 'Englopado / Dope (Camas)',      cause: 'Ajuste de fórmula de sellador en tina principal',    duration: '8 min',  impact: '-10 pzas' },
    { time: '11:10', station: 'Prensas Vapor #1',             cause: 'Baja presión de vapor en caldera',                   duration: '12 min', impact: '-18 pzas' },
    { time: '12:35', station: 'Adorno 1 (Tafilete/Toquilla)', cause: 'Sin tafiletes talla 58 en subensamble. Supervisoras tuvieron que coordinar de otra nave.', duration: '9 min', impact: '-12 pzas' }
  ],

  // ─── AVANCE HORA × HORA ────────────────────────────────────────────────────
  // Meta semanal → dividida por día → dividida por hora (base de referencia actual)
  hourlyData: [
    { hour: '07:00', target: 100, produced: 92 },
    { hour: '08:00', target: 110, produced: 88 },
    { hour: '09:00', target: 110, produced: 104 },
    { hour: '10:00', target: 110, produced: 108 },
    { hour: '11:00', target: 110, produced: 96  },
    { hour: '12:00', target: 110, produced: 112 },
    { hour: '13:00', target: 110, produced: 12  }, // En curso
    { hour: '14:00', target: 90,  produced: 0   }
  ],

  // ─── INTEGRACIÓN COMPAC / CONTPAQi ────────────────────────────────────────
  // Audio confirma: COMPAC interviene al inicio (órdenes) y al final (facturación).
  // Ingeniera EXTERNA de soporte de COMPAC (membresía anual pagada).
  // Licencia actual: posiblemente básica; necesita verificar si permite integración API.
  // Vale en papel → Excel de órdenes → descuento manual → factura COMPAC.
  // Requerimiento Uanify: generar vale digital + puente datos a COMPAC (sin recaptura).
  compacSync: {
    status: 'Conectado · Sincronizado',
    lastSync: 'Hace 4 minutos',
    activeOrderB2B: 'OC-2026-9420',
    // Audio: "el cliente dice yo quiero 10,500 piezas → 7,500 de esta, 2,000 de otra, 1,000 de esta"
    customer: 'Distribuidora Western de Monterrey S.A. de C.V.',
    orderQuantity: 10500,
    orderBreakdown: [
      { model: '1000X Master Telar Denver',     qty: 7500  },
      { model: '1000X Master Telar Viejonón',   qty: 2000  },
      { model: '1000X Master Telar Laredo F10', qty: 1000  }
    ],
    deliveredSoFar: 3680,
    pendingQuantity: 6820,
    invoiceStatus: 'Pre-factura generada en COMPAC',
    compacContact: 'Ingeniera externa (membresía anual)',
    note: 'Verificar tipo de licencia COMPAC para determinar viabilidad de integración API.'
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

// Sintetizador de audio industrial (Desactivado por especificación de planta)
const IndustrialAudio = {
  playPedalClick() {},
  playQrBeep() {},
  playAlert() {}
};

// Helper para obtener el usuario activo
function getCurrentUser() {
  return UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
}

// Nombres descriptivos de los 5 módulos
const ModuleNames = {
  andon: 'Tablero Andon (Piso)',
  terminal: 'Lotes, QR & Almacenes (iPad)',
  engineer: 'Ingeniería & Subensambles',
  executive: 'Dirección & COMPAC',
  config: 'Configuración de Planta & Usuarios'
};

// Actualizar visualmente la barra lateral según los permisos del usuario activo
function updateUserInterface() {
  const user = getCurrentUser();
  const navBtns = document.querySelectorAll('.nav-btn');
  const userSelect = document.getElementById('sidebarUserSelect');
  const userRoleBadge = document.getElementById('sidebarUserRoleBadge');

  if (userSelect && userSelect.value !== user.id) {
    userSelect.value = user.id;
  }
  if (userRoleBadge) {
    userRoleBadge.textContent = user.badge;
  }

  navBtns.forEach(btn => {
    const tab = btn.getAttribute('data-tab');
    const isAllowed = user.permissions.includes(tab);
    
    // Indicador visual de bloqueo
    let lockIcon = btn.querySelector('.tab-lock-icon');
    if (!isAllowed) {
      btn.classList.add('nav-btn-restricted');
      if (!lockIcon) {
        lockIcon = document.createElement('span');
        lockIcon.className = 'tab-lock-icon';
        lockIcon.textContent = '🔒';
        lockIcon.title = `Acceso restringido para rol: ${user.roleName}`;
        btn.appendChild(lockIcon);
      }
    } else {
      btn.classList.remove('nav-btn-restricted');
      if (lockIcon) lockIcon.remove();
    }
  });
}

// Cambiar de usuario activo (Simulación de login / perfiles para demo)
window.switchActiveUser = function(userId) {
  const user = UanifyState.users.find(u => u.id === userId);
  if (!user) return;
  UanifyState.currentUser = userId;
  updateUserInterface();
  
  // Si el usuario actual no tiene permiso a la pestaña activa, moverlo a la primera permitida
  if (!user.permissions.includes(UanifyState.activeTab)) {
    const fallbackTab = user.permissions[0] || 'andon';
    const fallbackBtn = document.querySelector(`.nav-btn[data-tab="${fallbackTab}"]`);
    if (fallbackBtn) fallbackBtn.click();
  }

  EventBus.emit('user-switched', user);
};

// Manejador de navegación de sub-pestañas internas en cada módulo
function initSubTabs() {
  document.querySelectorAll('.sub-nav-tabs').forEach(tabBar => {
    const buttons = tabBar.querySelectorAll('.sub-tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-subtab');
        const parentView = btn.closest('.view-panel');
        if (!parentView) return;

        // Desactivar botones hermanos
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Mostrar solo el subtab target dentro de este panel
        parentView.querySelectorAll('.sub-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  });
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('.nav-btn');
  const viewPanels = document.querySelectorAll('.view-panel');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      const user = getCurrentUser();

      // Validación de Permisos por Rol (RBAC)
      if (!user.permissions.includes(targetTab)) {
        UanifyUI.toast(
          `Tu usuario (${user.name} - ${user.roleName}) no tiene permisos para acceder a "${ModuleNames[targetTab] || targetTab}". Solicita acceso a un Administrador en Configuración.`,
          'error',
          'Acceso Restringido por Rol'
        );
        return;
      }

      UanifyState.activeTab = targetTab;
      navBtns.forEach(b => b.classList.remove('active'));
      viewPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPanel = document.getElementById(`view-${targetTab}`);
      if (targetPanel) targetPanel.classList.add('active');
      EventBus.emit('tab-changed', targetTab);
    });
  });

  // Selector de usuario activo en el sidebar
  const userSelect = document.getElementById('sidebarUserSelect');
  if (userSelect) {
    userSelect.addEventListener('change', (e) => {
      window.switchActiveUser(e.target.value);
    });
  }

  function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) clockEl.textContent = now.toTimeString().split(' ')[0];
  }
  setInterval(updateClock, 1000);
  updateClock();

  initSubTabs();
  updateUserInterface();

  if (window.initAndonView)     window.initAndonView();
  if (window.initTerminalView)  window.initTerminalView();
  if (window.initEngineerView)  window.initEngineerView();
  if (window.initExecutiveView) window.initExecutiveView();
  if (window.initConfigView)    window.initConfigView();
});
