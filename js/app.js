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

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    const defaultTitle = type === 'success' ? 'Operación Exitosa' 
      : type === 'warning' ? 'Advertencia de Línea' 
      : type === 'error' ? 'Error Operativo' 
      : 'Notificación de Planta';

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-body">
        <div class="toast-title">${title || defaultTitle}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button type="button" class="toast-close" aria-label="Cerrar">&times;</button>
      <div class="toast-progress"></div>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    let autoDismissTimer = null;

    const removeToast = () => {
      if (toast.classList.contains('removing')) return;
      toast.classList.add('removing');
      setTimeout(() => {
        if (toast.isConnected) toast.remove();
      }, 260);
    };

    closeBtn.addEventListener('click', removeToast);

    // Auto-cierre con timer y pausa en hover
    const startTimer = () => {
      autoDismissTimer = setTimeout(removeToast, 4500);
    };

    toast.addEventListener('mouseenter', () => {
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
      const prog = toast.querySelector('.toast-progress');
      if (prog) prog.style.animationPlayState = 'paused';
    });

    toast.addEventListener('mouseleave', () => {
      const prog = toast.querySelector('.toast-progress');
      if (prog) prog.style.animationPlayState = 'running';
      autoDismissTimer = setTimeout(removeToast, 2000);
    });

    container.appendChild(toast);
    startTimer();
  },

  confirm(title, message, onConfirm, okText = 'Confirmar', cancelText = 'Cancelar') {
    const modal = document.getElementById('uanifyConfirmModal');
    if (!modal) {
      if (onConfirm) onConfirm();
      return;
    }
    const titleEl = document.getElementById('confirmModalTitle') || document.getElementById('uanifyConfirmTitle');
    const msgEl = document.getElementById('confirmModalMessage') || document.getElementById('uanifyConfirmMessage');
    const okBtn = document.getElementById('confirmModalBtnOk') || document.getElementById('uanifyConfirmOkBtn');
    const cancelBtn = document.getElementById('confirmModalBtnCancel') || document.getElementById('uanifyConfirmCancelBtn');
    const closeBtn = document.getElementById('confirmModalCloseBtn');

    if (titleEl) titleEl.textContent = title || 'Confirmación Requerida';
    if (msgEl) msgEl.textContent = message || '¿Está seguro de realizar esta acción en planta?';
    if (okBtn) okBtn.textContent = okText;
    if (cancelBtn) {
      cancelBtn.style.display = '';
      cancelBtn.textContent = cancelText;
    }

    const cleanup = () => {
      modal.classList.remove('active');
      if (okBtn) okBtn.onclick = null;
      if (cancelBtn) cancelBtn.onclick = null;
      if (closeBtn) closeBtn.onclick = null;
    };

    if (okBtn) {
      okBtn.onclick = () => {
        cleanup();
        if (typeof onConfirm === 'function') onConfirm();
      };
    }

    if (cancelBtn) {
      cancelBtn.onclick = () => {
        cleanup();
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        cleanup();
      };
    }

    modal.classList.add('active');
  },

  alert(title, message, okText = 'Entendido') {
    const modal = document.getElementById('uanifyConfirmModal');
    if (!modal) return;

    const titleEl = document.getElementById('confirmModalTitle') || document.getElementById('uanifyConfirmTitle');
    const msgEl = document.getElementById('confirmModalMessage') || document.getElementById('uanifyConfirmMessage');
    const okBtn = document.getElementById('confirmModalBtnOk') || document.getElementById('uanifyConfirmOkBtn');
    const cancelBtn = document.getElementById('confirmModalBtnCancel') || document.getElementById('uanifyConfirmCancelBtn');
    const closeBtn = document.getElementById('confirmModalCloseBtn');

    if (titleEl) titleEl.textContent = title || 'Aviso de Planta';
    if (msgEl) msgEl.textContent = message || '';
    if (okBtn) okBtn.textContent = okText;
    if (cancelBtn) cancelBtn.style.display = 'none';

    const cleanup = () => {
      modal.classList.remove('active');
      if (cancelBtn) cancelBtn.style.display = '';
      if (okBtn) okBtn.onclick = null;
      if (closeBtn) closeBtn.onclick = null;
    };

    if (okBtn) okBtn.onclick = cleanup;
    if (closeBtn) closeBtn.onclick = cleanup;

    modal.classList.add('active');
  }
};

const UanifyState = {
  version: '2.14.0',
  activeTab: 'terminal',
  currentShift: 'Turno Único (07:00 - 15:30 · Lunes a Viernes)',
  shiftSchedule: {
    start: '07:00',
    end: '15:30',
    lunch: '12:00 a 12:45 hrs',
    days: 'Lunes a Viernes',
    summary: 'Turno Único (07:00 - 15:30 · Lunes a Viernes)'
  },
  
  // ─── GESTIÓN DE USUARIOS Y ROLES (RBAC) ──────────────────────────────────
  currentUser: 'admin-1',
  users: [
    {
      id: 'admin-1',
      name: 'Edmundo González',
      email: 'egonzalez@tombstone.mx',
      role: 'admin',
      roleName: 'Administrador General',
      permissions: ['terminal', 'andon', 'inventory', 'operators', 'engineer', 'executive', 'config'],
      assignedDepartments: ['*'],
      badge: '👑 Admin'
    },
    {
      id: 'ing-1',
      name: 'Ing. Carlos Ortiz',
      email: 'cortiz@tombstone.mx',
      role: 'ingeniero',
      roleName: 'Ingeniero de Procesos',
      permissions: ['terminal', 'andon', 'inventory', 'operators', 'engineer', 'config'],
      assignedDepartments: ['*'],
      badge: '⚙️ Ingeniero'
    },
    {
      id: 'sup-1',
      name: 'Juan Manuel Pérez',
      email: 'jperez@tombstone.mx',
      role: 'supervisor',
      roleName: 'Supervisor de Nave (Depts 05-08)',
      permissions: ['terminal', 'andon', 'inventory', 'operators'],
      assignedDepartments: ['D-05', 'D-06', 'D-07', 'D-08'],
      badge: '📋 Supervisor'
    },
    {
      id: 'sup-2',
      name: 'Roberto Méndez',
      email: 'rmendez@tombstone.mx',
      role: 'supervisor',
      roleName: 'Supervisor de Preparación (Depts 01-04)',
      permissions: ['terminal', 'andon', 'inventory', 'operators'],
      assignedDepartments: ['D-01', 'D-02', 'D-03', 'D-04'],
      badge: '📋 Supervisor'
    }
  ],

  // ─── REGISTRO CENTRAL DE ALMACENES DE PLANTA (FÍSICOS & WIP) ─────────────
  warehouses: [
    {
      id: 'wh-raw',
      code: 'ALM-01',
      name: 'Almacén 1: Materia Prima & Rollos',
      type: 'Materia Prima / Corte',
      location: 'Nave A - Acceso Proveedores',
      stock: '1,850 m²',
      items: 'Rollos de Telar 1000X Blanco, Hilo de Unión, Alambre Galvanizado Cal. 19',
      capPercent: 82,
      status: 'Óptimo',
      statusClass: 'badge-status-green'
    },
    {
      id: 'wh-rampa',
      code: 'ALM-02',
      name: 'Almacén 2: Rampa WIP & Pulmón de Fraccionamiento',
      type: 'WIP Intermedio',
      location: 'Rampa Central (Paso a Prensas)',
      stock: '240 sombreros',
      items: '4 Lotes Madre (60 pzas) y 8 Sublotes (15 pzas) en ensamblado',
      capPercent: 65,
      status: 'Flujo Normal',
      statusClass: 'badge-status-blue'
    },
    {
      id: 'wh-press',
      code: 'ALM-03',
      name: 'Almacén 3: Pulmón Pre-Prensas & Vapor',
      type: 'Pulmón de Proceso',
      location: 'Batería de Prensas Michelagnoli',
      stock: '75 sombreros',
      items: 'Sublotes en espera de ciclo de vapor caliente y prensado hidráulico',
      capPercent: 50,
      status: 'Normal',
      statusClass: 'badge-status-green'
    },
    {
      id: 'wh-finish',
      code: 'ALM-04',
      name: 'Almacén 4: Producto Terminado & Embarque',
      type: 'Producto Terminado',
      location: 'Nave B - Andén de Carga',
      stock: '520 sombreros',
      items: 'Sombreros 1000X inspeccionados, con toquilla y tafilete listos para distribución',
      capPercent: 70,
      status: 'Listo para Entrega',
      statusClass: 'badge-status-green'
    },
    {
      id: 'wh-scrap',
      code: 'ALM-05',
      name: 'Almacén 5: Merma & Segundas (Venta de Viernes)',
      type: 'Saldos y Merma',
      location: 'Área de Segregación Almacén 5',
      stock: '26 sombreros',
      items: 'Sombreros regulares con detalles cosméticos leves para remate al mayoreo cada viernes',
      capPercent: 26,
      status: 'Venta Programada Viernes',
      statusClass: 'badge-status-amber'
    }
  ],

  // ─── MONITOR DE ALMACENES INTERMEDIOS & LOTES LISTOS (BUFFER READY) ───────
  // Permite saber a cualquier supervisor si el departamento previo ya concluyó y colocó lotes en su almacén de salida
  bufferReadyLots: [
    {
      id: 'buf-101',
      lotId: '1094',
      isSublot: false,
      pieces: 60,
      model: '1000X Master Telar Denver',
      originDeptCode: 'D-01',
      originDeptName: 'Corte de Telar',
      targetDeptCode: 'D-02',
      targetDeptName: 'Englopado y Camas',
      waitingMinutes: 8,
      status: 'Listo para Recoger',
      notes: '60 lienzos cortados con troquel de precisión listos para baño térmico.'
    },
    {
      id: 'buf-102',
      lotId: '1093',
      isSublot: false,
      pieces: 60,
      model: '1000X Master Telar El Viejonón',
      originDeptCode: 'D-02',
      originDeptName: 'Englopado y Camas',
      targetDeptCode: 'D-03',
      targetDeptName: 'Refuerzos de Corona',
      waitingMinutes: 14,
      status: 'Listo para Recoger',
      notes: 'Camas terminadas y englopadas listas para refuerzo de corona.'
    },
    {
      id: 'buf-103',
      lotId: '49,633-1',
      isSublot: true,
      sublotNumber: '1',
      pieces: 15,
      model: '1000X Master Telar El Viejonón',
      originDeptCode: 'D-05',
      originDeptName: 'Prensas de Hormado',
      targetDeptCode: 'D-06',
      targetDeptName: 'Recorte y Alambrado',
      waitingMinutes: 5,
      status: 'Listo para Recoger',
      notes: 'Prensado en Michelagnoli P-02 con horma #55 Viejonón completado.'
    },
    {
      id: 'buf-104',
      lotId: '49,633-2',
      isSublot: true,
      sublotNumber: '2',
      pieces: 15,
      model: '1000X Master Telar El Viejonón',
      originDeptCode: 'D-06',
      originDeptName: 'Recorte y Alambrado',
      targetDeptCode: 'D-09',
      targetDeptName: 'Pintura y Matizado',
      waitingMinutes: 11,
      status: 'Listo para Recoger',
      notes: 'Falda perfilada a 4 1/4" con alambre calibre 19 engarzado.'
    },
    {
      id: 'buf-105',
      lotId: '49,633-3',
      isSublot: true,
      sublotNumber: '3',
      pieces: 15,
      model: '1000X Master Telar Chaparral',
      originDeptCode: 'D-09',
      originDeptName: 'Pintura y Matizado',
      targetDeptCode: 'D-10',
      targetDeptName: 'Brillo y Acabado',
      waitingMinutes: 19,
      status: 'Listo para Recoger',
      notes: 'Matizado blanco aplicado y curado en túnel infrarrojo.'
    },
    {
      id: 'buf-106',
      lotId: '49,633-4',
      isSublot: true,
      sublotNumber: '4',
      pieces: 15,
      model: '1000X Master Telar Denver',
      originDeptCode: 'D-12',
      originDeptName: 'Adorno (Tafilete y Toquilla)',
      targetDeptCode: 'C-03',
      targetDeptName: 'Calidad 3 (Auditoría Final)',
      waitingMinutes: 6,
      status: 'Listo para Recoger',
      notes: 'Tafilete de piel fina talla 58 y toquilla con herraje níquel montados.'
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
      routeId: 'route-telar-1000x',
      currentStepIndex: 5, // Paso 6: D-05 Prensas de Hormado
      model: 'VIEJONON',
      oProd: '15071',
      clase: '1,000X MASTER TELAR',
      finish: 'LAQUEADOS',
      brim: '9 1/2',
      bend: 'ARRIBA',
      size: '55',
      pieces: 15,
      totalPieces: 60,
      currentStation: 'Prensas de Hormado (Fraccionamiento Rampa)',
      currentStationCode: 'D-05',
      operator: 'Jorge',
      operatorSticker: 'JORGE',
      status: 'En Prensas de Hormado · Sublote #3 Fraccionado',
      isSubdivided: true,
      sublots: [
        { id: '49633-1', sublotNum: 1, pieces: 15, station: 'Prensas Hidráulicas', status: 'En Proceso', operator: 'Jorge', operatorSticker: 'JORGE' },
        { id: '49633-2', sublotNum: 2, pieces: 15, station: 'Prensas Hidráulicas', status: 'En Proceso', operator: 'Jorge', operatorSticker: 'JORGE' },
        { id: '49633-3', sublotNum: 3, pieces: 15, station: 'Almacén Hidráulicas → Adorno', status: 'Listo para Recolección', operator: 'Jorge', operatorSticker: 'JORGE' },
        { id: '49633-4', sublotNum: 4, pieces: 15, station: 'Almacén Hidráulicas → Adorno', status: 'En Espera', operator: 'Jorge', operatorSticker: 'JORGE' }
      ]
    },
    {
      lotId: '49,386',
      route: 'TARJETA HIDRAULICAS - ADORNO',
      routeId: 'route-telar-1000x',
      currentStepIndex: 4, // Paso 5: C-01 Calidad 1
      model: 'CHAPARRAL',
      oProd: '15068',
      clase: '1,000X MASTER TELAR',
      finish: 'LAQUEADOS',
      brim: '9.0 Cm',
      bend: 'ABAJO',
      size: '56',
      pieces: 15,
      totalPieces: 60,
      currentStation: 'Calidad 1 (Post-Dope)',
      currentStationCode: 'C-01',
      operator: 'Pedro Morales',
      operatorSticker: null,
      status: 'En Inspección de Calidad 1 (Post-Dope)',
      isSubdivided: false,
      sublots: []
    },
    {
      lotId: '49,842',
      route: 'TARJETA PRENSAS - PATIO',
      routeId: 'route-campana-preformada',
      currentStepIndex: 2, // Paso 3: D-05 Prensas de Hormado
      model: 'MAGNUM',
      oProd: '15377',
      clase: '1,000X MASTER',
      finish: 'LAQUEADOS',
      brim: '7 1/2',
      bend: 'ARRIBA',
      size: '52',
      pieces: 60,
      totalPieces: 60,
      currentStation: 'Prensas de Hormado (Moldeo)',
      currentStationCode: 'D-05',
      operator: 'Melany',
      operatorSticker: 'MELANY',
      stickerType: 'magenta',
      status: 'Lote Madre 60 pzas en Prensas de Patio',
      isSubdivided: false,
      sublots: []
    }
  ],

  // ─── ÁREAS DE CONTROL DE CALIDAD (PARADAS DE INSPECCIÓN) ───────────────────
  qualityAreas: [
    {
      code: 'C-01',
      name: 'Calidad 1 (Post-Dope / Refuerzos)',
      desc: '1er punto de inspección. Libera o rechaza el lote tras sellado y secado en camas.',
      criteria: 'Rigidez uniforme de telares, sin burbujas de dope, sellado perimetral.',
      inspector: 'Inspectora de Calidad (Turno)',
      cycleTime: '18s',
      status: 'Activo'
    },
    {
      code: 'C-02',
      name: 'Calidad 2 (Post-Pintura)',
      desc: '2do punto de inspección. Verifica uniformidad y tono de pintura antes de brillo.',
      criteria: 'Tono según muestra patrón, sin escurrimientos, recubrimiento parejo.',
      inspector: 'Inspectora de Calidad (Turno)',
      cycleTime: '16s',
      status: 'Activo'
    },
    {
      code: 'C-03',
      name: 'Calidad 3 (Producto Terminado)',
      desc: '3er punto de inspección previo a empaque y embarque final.',
      criteria: 'Alineación de copa y ala, costura de tafilete, toquilla y herrajes firmes.',
      inspector: 'Ing. Carlos Ortiz / Inspectora',
      cycleTime: '25s',
      status: 'Activo'
    }
  ],

  // ─── RUTAS Y SECUENCIAS PRODUCTIVAS POR MODELO DE SOMBRERO ─────────────────
  productionRoutes: [
    {
      id: 'route-telar-1000x',
      name: '1000X Master Telar (Viejonón, Denver, Chaparral)',
      modelKeyword: '1000X Master Telar',
      category: 'Sombrero 2 Piezas (Copa y Falda)',
      desc: 'Ruta completa con fraccionamiento en rampa de 60 a 15 piezas y 3 filtros de calidad.',
      steps: [
        { order: 1,  code: 'D-01', name: 'Corte de Cuadros',                 type: 'manufactura', icon: '✂️' },
        { order: 2,  code: 'D-02', name: 'Alambrado de Ala',                 type: 'manufactura', icon: '🧵' },
        { order: 3,  code: 'D-03', name: 'Englopado / Baño de Dope',         type: 'manufactura', icon: '🧪' },
        { order: 4,  code: 'D-04', name: 'Refuerzos (Pintola / Brocha)',     type: 'manufactura', icon: '🖌️' },
        { order: 5,  code: 'C-01', name: 'Calidad 1 (Post-Dope)',            type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 6,  code: 'D-05', name: 'Prensas de Hormado (Rampa 15pz)',  type: 'manufactura', icon: '⚙️' },
        { order: 7,  code: 'D-06', name: 'Recorte y Refaldeado',             type: 'manufactura', icon: '📐' },
        { order: 8,  code: 'D-07', name: 'Pintura y Secado',                 type: 'manufactura', icon: '🎨' },
        { order: 9,  code: 'C-02', name: 'Calidad 2 (Post-Pintura)',         type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 10, code: 'D-08', name: 'Brillo / Acabado',                 type: 'manufactura', icon: '✨' },
        { order: 11, code: 'D-09', name: 'Temperado / Refaldear',            type: 'manufactura', icon: '♨️' },
        { order: 12, code: 'D-10', name: 'Adorno 1 (Tafilete + Toquilla)',   type: 'manufactura', icon: '🤠' },
        { order: 13, code: 'C-03', name: 'Calidad 3 (Producto Terminado)',   type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 14, code: 'D-11', name: 'Embarque & Vale COMPAC',           type: 'logistica',   icon: '🚚' }
      ]
    },
    {
      id: 'route-campana-preformada',
      name: 'Campana Preformada / Fieltro (Magnum, Frontier)',
      modelKeyword: 'Campana Preformada / Fieltro',
      category: 'Sombrero 1 Pieza (Moldeo Directo)',
      desc: 'Ruta directa sin corte de cuadros ni alambrado. Ingresa directo a sellado y prensas.',
      steps: [
        { order: 1,  code: 'D-03', name: 'Englopado / Baño de Dope',         type: 'manufactura', icon: '🧪' },
        { order: 2,  code: 'C-01', name: 'Calidad 1 (Post-Dope)',            type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 3,  code: 'D-05', name: 'Prensas de Hormado (Moldeo)',      type: 'manufactura', icon: '⚙️' },
        { order: 4,  code: 'D-06', name: 'Recorte y Refaldeado',             type: 'manufactura', icon: '📐' },
        { order: 5,  code: 'D-07', name: 'Pintura y Secado',                 type: 'manufactura', icon: '🎨' },
        { order: 6,  code: 'C-02', name: 'Calidad 2 (Post-Pintura)',         type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 7,  code: 'D-08', name: 'Brillo / Acabado',                 type: 'manufactura', icon: '✨' },
        { order: 8,  code: 'D-09', name: 'Temperado / Refaldear',            type: 'manufactura', icon: '♨️' },
        { order: 9,  code: 'D-10', name: 'Adorno 1 (Tafilete + Toquilla)',   type: 'manufactura', icon: '🤠' },
        { order: 10, code: 'C-03', name: 'Calidad 3 (Producto Terminado)',   type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 11, code: 'D-11', name: 'Embarque & Vale COMPAC',           type: 'logistica',   icon: '🚚' }
      ]
    },
    {
      id: 'route-laqueado-premium',
      name: 'Laqueados Premium Especiales (Laredo, Bullrider, Sonora)',
      modelKeyword: 'Laqueados Especiales',
      category: 'Sombrero Especial Alta Densidad',
      desc: 'Ruta con doble fijado térmico en prensas hidráulicas, barniz poliéster y control riguroso.',
      steps: [
        { order: 1,  code: 'D-01', name: 'Corte de Cuadros',                 type: 'manufactura', icon: '✂️' },
        { order: 2,  code: 'D-02', name: 'Alambrado de Ala',                 type: 'manufactura', icon: '🧵' },
        { order: 3,  code: 'D-03', name: 'Englopado Especial Reforzado',      type: 'manufactura', icon: '🧪' },
        { order: 4,  code: 'C-01', name: 'Calidad 1 (Post-Dope)',            type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 5,  code: 'D-05', name: 'Prensas Hidráulicas Michelagnoli', type: 'manufactura', icon: '⚙️' },
        { order: 6,  code: 'D-06', name: 'Recorte y Refaldeado de Precisión',type: 'manufactura', icon: '📐' },
        { order: 7,  code: 'D-07', name: 'Pintura y Secado (Laca Taiwan)',   type: 'manufactura', icon: '🎨' },
        { order: 8,  code: 'C-02', name: 'Calidad 2 (Post-Pintura)',         type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 9,  code: 'D-08', name: 'Brillo / Acabado Espejo',          type: 'manufactura', icon: '✨' },
        { order: 10, code: 'D-10', name: 'Adorno 1 (Badana Piel + Pin)',     type: 'manufactura', icon: '🤠' },
        { order: 11, code: 'C-03', name: 'Calidad 3 (Liberación Comercial)', type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 12, code: 'D-11', name: 'Embarque & COMPAC',                 type: 'logistica',   icon: '🚚' }
      ]
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
  },

  // ─── MÉTODOS DE TRAZABILIDAD DE LOTES Y MAPA DE PROCESO ────────────────────
  getLotRoute(lotId) {
    const lot = this.activeLots.find(l => l.lotId === lotId || l.lotId.replace(/,/g, '') === String(lotId).replace(/,/g, ''));
    if (!lot) return this.productionRoutes[0];
    const route = this.productionRoutes.find(r => r.id === lot.routeId) || this.productionRoutes[0];
    return route;
  },

  moveLotToStep(lotId, targetStepIndex) {
    const lot = this.activeLots.find(l => l.lotId === lotId || l.lotId.replace(/,/g, '') === String(lotId).replace(/,/g, ''));
    if (!lot) return null;
    const route = this.getLotRoute(lotId);
    if (!route || !route.steps) return null;

    targetStepIndex = Math.max(0, Math.min(targetStepIndex, route.steps.length - 1));
    const targetStep = route.steps[targetStepIndex];
    lot.currentStepIndex = targetStepIndex;
    lot.currentStationCode = targetStep.code;
    lot.currentStation = targetStep.name;
    lot.status = `En ${targetStep.name} (${targetStep.code})`;

    // Sincronizar sub-lotes si existen
    if (lot.sublots && lot.sublots.length > 0) {
      lot.sublots.forEach(sl => {
        sl.station = targetStep.name;
      });
    }

    try {
      localStorage.setItem('uanify_active_lots', JSON.stringify(this.activeLots));
    } catch (e) {
      console.warn('Error saving activeLots:', e);
    }

    if (typeof EventBus !== 'undefined') {
      EventBus.emit('lot-moved', { lot, targetStep, route });
    }
    return { lot, targetStep, route };
  },

  advanceLot(lotId) {
    const lot = this.activeLots.find(l => l.lotId === lotId || l.lotId.replace(/,/g, '') === String(lotId).replace(/,/g, ''));
    if (!lot) return null;
    const nextIdx = (typeof lot.currentStepIndex === 'number' ? lot.currentStepIndex : 0) + 1;
    return this.moveLotToStep(lotId, nextIdx);
  },

  rewindLot(lotId) {
    const lot = this.activeLots.find(l => l.lotId === lotId || l.lotId.replace(/,/g, '') === String(lotId).replace(/,/g, ''));
    if (!lot) return null;
    const prevIdx = (typeof lot.currentStepIndex === 'number' ? lot.currentStepIndex : 0) - 1;
    return this.moveLotToStep(lotId, prevIdx);
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

// Nombres descriptivos de los 7 módulos de planta
const ModuleNames = {
  terminal: 'Terminal de Supervisor & Lotes',
  andon: 'Tablero Andon (Piso)',
  inventory: 'Almacenes & Hormas',
  operators: 'Padrón de Operadores',
  engineer: 'Consola de Ingeniería & Rendimiento',
  executive: 'Dirección & COMPAC',
  config: 'Configuración de Planta & Usuarios'
};

// Actualizar visualmente la barra lateral según los permisos del usuario activo
// REGLA UX RBAC: Opciones no permitidas se OCULTAN por completo (sin candados ni bloqueos visibles)
function updateUserInterface() {
  const user = getCurrentUser();
  const navBtns = document.querySelectorAll('.nav-btn');

  // Actualizar el chip de usuario en la barra lateral
  const sidebarUserName   = document.getElementById('sidebarUserName');
  const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
  const sidebarUserRoleBadge = document.getElementById('sidebarUserRoleBadge');

  let avatarIcon = '📋';
  if (user.role === 'admin')     avatarIcon = '👑';
  if (user.role === 'ingeniero') avatarIcon = '⚙️';

  if (sidebarUserAvatar)   sidebarUserAvatar.textContent   = avatarIcon;
  if (sidebarUserName)     sidebarUserName.textContent     = user.name;
  if (sidebarUserRoleBadge) sidebarUserRoleBadge.textContent = user.badge;

  navBtns.forEach(btn => {
    const tab = btn.getAttribute('data-tab');
    const isAllowed = user.permissions.includes(tab);
    
    // Regla UX RBAC: Jamás mostrar candado 🔒; simplemente ocultar la opción de navegación
    const lockIcon = btn.querySelector('.tab-lock-icon');
    if (lockIcon) lockIcon.remove();
    btn.classList.remove('nav-btn-restricted');

    // Mostrar u ocultar completamente la opción
    btn.style.display = isAllowed ? 'flex' : 'none';
  });

  // Ocultar también títulos de grupo si todos sus botones están ocultos
  document.querySelectorAll('.nav-tabs').forEach(group => {
    const buttons = group.querySelectorAll('.nav-btn');
    const hasVisible = Array.from(buttons).some(b => b.style.display !== 'none');
    const groupTitle = group.previousElementSibling;
    if (groupTitle && groupTitle.classList.contains('nav-group-title')) {
      groupTitle.style.display = hasVisible ? 'block' : 'none';
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
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-subtab');
        const parentView = btn.closest('.view-panel');
        if (!parentView) return;

        // Desactivar botones hermanos
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Ocultar todos los subtab contents del panel
        parentView.querySelectorAll('.sub-tab-content').forEach(content => {
          content.classList.remove('active');
          content.classList.remove('d-none');
          content.style.setProperty('display', 'none', 'important');
        });

        // Mostrar el subtab seleccionado
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.remove('d-none');
          targetContent.classList.add('active');
          targetContent.style.setProperty('display', 'block', 'important');
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

  // Selector de usuario activo — ya no existe el <select>, el logout abre el login screen
  // (la lógica de logout está en initLoginScreen())

  function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) clockEl.textContent = now.toTimeString().split(' ')[0];
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Restaurar horario de turno guardado si existe
  try {
    const savedSchedule = localStorage.getItem('uanify_shift_schedule');
    if (savedSchedule) {
      const parsed = JSON.parse(savedSchedule);
      UanifyState.shiftSchedule = parsed;
      UanifyState.currentShift = parsed.summary || `Turno Único (${parsed.start} - ${parsed.end})`;
      const shiftTitleEl = document.querySelector('.shift-title');
      if (shiftTitleEl) {
        shiftTitleEl.textContent = `Turno Único (${parsed.start} - ${parsed.end})`;
      }
    }
  } catch (e) {
    console.warn('Error al restaurar horario de turno:', e);
  }

  // Restaurar departamentos personalizados si existen
  try {
    const savedStations = localStorage.getItem('uanify_custom_stations');
    if (savedStations) {
      const parsed = JSON.parse(savedStations);
      if (Array.isArray(parsed) && parsed.length > 0) {
        UanifyState.stations = parsed;
      }
    }
  } catch (e) {
    console.warn('Error al restaurar departamentos:', e);
  }

  // Restaurar áreas de calidad personalizadas si existen
  try {
    const savedQuality = localStorage.getItem('uanify_quality_areas');
    if (savedQuality) {
      const parsed = JSON.parse(savedQuality);
      if (Array.isArray(parsed) && parsed.length > 0) {
        UanifyState.qualityAreas = parsed;
      }
    }
  } catch (e) {
    console.warn('Error al restaurar áreas de calidad:', e);
  }

  // Restaurar rutas y secuencias por modelo si existen
  try {
    const savedRoutes = localStorage.getItem('uanify_production_routes');
    if (savedRoutes) {
      const parsed = JSON.parse(savedRoutes);
      if (Array.isArray(parsed) && parsed.length > 0) {
        UanifyState.productionRoutes = parsed;
      }
    }
  } catch (e) {
    console.warn('Error al restaurar rutas de producción:', e);
  }

  // Restaurar estado dinámico de lotes activos si existe
  try {
    const savedLots = localStorage.getItem('uanify_active_lots');
    if (savedLots) {
      const parsed = JSON.parse(savedLots);
      if (Array.isArray(parsed) && parsed.length > 0) {
        UanifyState.activeLots = parsed;
      }
    }
  } catch (e) {
    console.warn('Error al restaurar lotes activos:', e);
  }

  // Control de Barra Lateral Plegable (Icon-Only Mode para maximizar espacio de piso)
  const appLayout = document.querySelector('.app-layout');
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');

  // Restaurar estado previo o colapsar automáticamente en tabletas si no hay preferencia
  const savedSidebar = localStorage.getItem('uanify_sidebar_collapsed');
  if (savedSidebar !== null) {
    if (savedSidebar === 'true') {
      appLayout.classList.add('sidebar-collapsed');
    } else {
      appLayout.classList.remove('sidebar-collapsed');
    }
  } else if (window.innerWidth <= 1024) {
    appLayout.classList.add('sidebar-collapsed');
  }

  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      appLayout.classList.toggle('sidebar-collapsed');
      const isCollapsed = appLayout.classList.contains('sidebar-collapsed');
      localStorage.setItem('uanify_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    });
  }

  // ── 1. CONTROL DE PANTALLA DE LOGIN CON SELECTOR DE USUARIO (RBAC) ────────
  function initLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    const usersGrid   = document.getElementById('loginUsersGrid');
    const btnSubmit   = document.getElementById('btnLoginSubmit');
    const btnSidebarLogout = document.getElementById('btnSidebarLogout');

    let selectedUserId = localStorage.getItem('uanify_logged_user') || UanifyState.currentUser || 'admin-1';

    function renderUserGrid() {
      if (!usersGrid) return;
      usersGrid.innerHTML = UanifyState.users.map(u => {
        const isSel = u.id === selectedUserId;
        let icon = '📋';
        if (u.role === 'admin') icon = '👑';
        if (u.role === 'ingeniero') icon = '⚙️';
        const deptsText = u.assignedDepartments.includes('*') ? 'Todos los Depts' : u.assignedDepartments.join(', ');

        return `
          <div class="login-user-card ${isSel ? 'selected' : ''}" data-user-id="${u.id}">
            <div class="login-user-card-head">
              <span class="login-user-card-icon">${icon}</span>
              <div class="login-user-card-check">✓</div>
            </div>
            <div>
              <div class="login-user-name">${u.name}</div>
              <div class="login-user-role">${u.roleName}</div>
            </div>
            <div class="login-user-depts">
              <span>📍</span> <span>${deptsText}</span>
            </div>
          </div>
        `;
      }).join('');

      usersGrid.querySelectorAll('.login-user-card').forEach(card => {
        card.addEventListener('click', () => {
          selectedUserId = card.getAttribute('data-user-id');
          renderUserGrid();
        });
      });
    }


    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        const user = UanifyState.users.find(u => u.id === selectedUserId);
        if (!user) return;

        UanifyState.currentUser = selectedUserId;
        localStorage.setItem('uanify_logged_user', selectedUserId);
        sessionStorage.setItem('uanify_logged_in', 'true');

        if (loginScreen) loginScreen.style.display = 'none';
        if (appLayout) appLayout.style.display = 'flex';

        window.switchActiveUser(selectedUserId);

        window.UanifyUI.toast(
          `¡Bienvenido a Planta Tombstone, ${user.name}! Sesión activa en rol: ${user.roleName}.`,
          'success',
          'Acceso Concedido'
        );
      });
    }

    if (btnSidebarLogout) {
      btnSidebarLogout.addEventListener('click', () => {
        sessionStorage.removeItem('uanify_logged_in');
        if (appLayout) appLayout.style.display = 'none';
        if (loginScreen) {
          loginScreen.style.display = 'flex';
          selectedUserId = UanifyState.currentUser;
          renderUserGrid();
        }
        window.UanifyUI.toast('Sesión cerrada. Selecciona tu perfil para ingresar.', 'info', 'Cierre de Sesión');
      });
    }

    // Inicializar grid
    renderUserGrid();

    // Comprobación de estado de sesión
    const isLoggedIn = sessionStorage.getItem('uanify_logged_in') === 'true';
    if (!isLoggedIn && loginScreen && appLayout) {
      loginScreen.style.display = 'flex';
      appLayout.style.display = 'none';
    } else if (loginScreen && appLayout) {
      loginScreen.style.display = 'none';
      appLayout.style.display = 'flex';
    }
  }

  // ── 2. RENDER DE SECCIÓN ALMACÉN E INVENTARIO ────────────────────────────
  function renderInventorySection() {
    const overviewGrid = document.getElementById('warehousesOverviewGrid');
    const tableBody = document.getElementById('warehousesTableBody');
    const moldsTableBody = document.getElementById('inventoryMoldsTableBody');
    const tafileteGrid = document.getElementById('inventoryTafileteGrid');

    // Cards resumen de almacenes
    if (overviewGrid && UanifyState.warehouses) {
      overviewGrid.innerHTML = UanifyState.warehouses.map(wh => `
        <div class="warehouse-card">
          <div class="warehouse-card-header">
            <div>
              <span class="warehouse-code-badge">${wh.code}</span>
              <h4 style="font-size:14px; font-weight:700; margin:6px 0 2px 0;">${wh.name}</h4>
              <span style="font-size:11px; color:var(--text-muted);">${wh.location}</span>
            </div>
            <span class="badge-status ${wh.statusClass}">${wh.status}</span>
          </div>
          <div class="warehouse-stock-big">${wh.stock}</div>
          <div class="warehouse-items-desc">${wh.items}</div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px; font-weight:600;">
              <span>Ocupación de Capacidad:</span>
              <span style="color:var(--color-brand);">${wh.capPercent}%</span>
            </div>
            <div class="progress-track" style="height:6px;">
              <div class="progress-fill fill-brand" style="width:${wh.capPercent}%;"></div>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Tabla de almacenes
    if (tableBody && UanifyState.warehouses) {
      tableBody.innerHTML = UanifyState.warehouses.map(wh => `
        <tr>
          <td><strong style="font-family:'JetBrains Mono'; color:var(--color-brand);">${wh.code}</strong></td>
          <td><strong>${wh.name}</strong><br><small style="color:var(--text-muted); font-size:11px;">${wh.location}</small></td>
          <td><span class="badge-subtle">${wh.type}</span></td>
          <td><strong style="font-size:13.5px;">${wh.stock}</strong></td>
          <td style="font-size:12px; max-width:280px; color:var(--text-secondary);">${wh.items}</td>
          <td>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:11.5px; font-weight:700;">${wh.capPercent}%</span>
              <div class="progress-track" style="width:60px; height:5px;">
                <div class="progress-fill fill-brand" style="width:${wh.capPercent}%;"></div>
              </div>
            </div>
          </td>
          <td><span class="badge-status ${wh.statusClass}">● ${wh.status}</span></td>
        </tr>
      `).join('');
    }

    // Tabla de moldes y hormas de aluminio
    if (moldsTableBody && UanifyState.molds) {
      moldsTableBody.innerHTML = UanifyState.molds.map(m => {
        let statusBadge = '<span class="badge-status" style="background:#ECFDF5; color:#047857; font-weight:700;">● Disponible</span>';
        if (m.status === 'En Uso') {
          statusBadge = '<span class="badge-status" style="background:#FEF3C7; color:#B45309; font-weight:700;">⚙️ En Uso</span>';
        }
        return `
          <tr>
            <td><strong style="font-family:'JetBrains Mono'; color:var(--color-brand);">${m.code}</strong></td>
            <td><strong>${m.name}</strong></td>
            <td><span class="badge-subtle">${m.tipo}</span></td>
            <td><strong>${m.size}</strong></td>
            <td style="font-size:12px;">${m.material}</td>
            <td><span style="font-size:12px; font-family:'JetBrains Mono';">${m.machine}</span></td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');
    }

    // Inventario de subensambles (Tafiletes)
    if (tafileteGrid) {
      const tafiletes = [
        { size: '54', name: 'Talla 54 (6 3/4)', stock: 48, min: 25, status: 'Óptimo' },
        { size: '55', name: 'Talla 55 (6 7/8)', stock: 92, min: 30, status: 'Óptimo' },
        { size: '56', name: 'Talla 56 (7)', stock: 114, min: 40, status: 'Óptimo' },
        { size: '57', name: 'Talla 57 (7 1/8)', stock: 86, min: 35, status: 'Óptimo' },
        { size: '58', name: 'Talla 58 (7 1/4)', stock: 135, min: 45, status: 'Óptimo' },
        { size: '59', name: 'Talla 59 (7 3/8)', stock: 64, min: 25, status: 'Óptimo' },
        { size: '60', name: 'Talla 60 (7 1/2)', stock: 32, min: 20, status: 'Alerta Stock' }
      ];

      tafileteGrid.innerHTML = tafiletes.map(t => `
        <div class="tafilete-card card-glass" style="padding:14px; border:1px solid var(--border-subtle); border-radius:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="font-size:14px; color:var(--text-primary);">${t.name}</strong>
            <span class="badge-status ${t.status === 'Óptimo' ? 'badge-status-green' : 'badge-status-amber'}">${t.status}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:baseline;">
            <div>
              <span style="font-size:11px; color:var(--text-muted); display:block;">Stock Listo para Adorno:</span>
              <strong style="font-size:20px; font-family:var(--font-display); color:var(--color-brand);">${t.stock} pzas</strong>
            </div>
            <span style="font-size:11px; color:var(--text-muted);">Mínimo: ${t.min}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // ── 3. RENDER DE PADRÓN DE OPERADORES DIRECTORY ──────────────────────────
  function renderOperatorsDirectory() {
    const tableBody = document.getElementById('operatorsDirectoryTableBody');
    const searchInput = document.getElementById('operatorSearchInput');
    const deptFilter = document.getElementById('operatorDeptFilter');
    const statusFilter = document.getElementById('operatorStatusFilter');
    const badgeCount = document.getElementById('operatorsFilteredCountBadge');
    if (!tableBody || !UanifyState.operators) return;

    function doRender() {
      const q = (searchInput ? searchInput.value.toLowerCase().trim() : '');
      const dept = (deptFilter ? deptFilter.value : 'all');
      const st = (statusFilter ? statusFilter.value : 'all');

      const filtered = UanifyState.operators.filter(op => {
        const matchSearch = !q || op.name.toLowerCase().includes(q) || op.empId.toLowerCase().includes(q) || op.machine.toLowerCase().includes(q);
        const matchDept = dept === 'all' || op.deptCode === dept;
        const matchStatus = st === 'all' || op.status === st;
        return matchSearch && matchDept && matchStatus;
      });

      if (badgeCount) {
        badgeCount.textContent = `Mostrando ${filtered.length} de ${UanifyState.operators.length} operadores`;
      }

      tableBody.innerHTML = filtered.map(op => {
        const pzas = op.pzasToday || Math.floor(Math.random() * 30 + 70);
        let statusBg = 'var(--color-green-bg)';
        let statusColor = 'var(--color-green)';
        if (op.status === 'Incapacidad') {
          statusBg = 'var(--color-red-bg)';
          statusColor = 'var(--color-red)';
        } else if (op.status === 'Capacitación') {
          statusBg = 'var(--color-amber-bg)';
          statusColor = 'var(--color-amber)';
        } else if (op.status === 'Baja Temporal') {
          statusBg = '#F1F5F9';
          statusColor = '#64748B';
        }

        return `
          <tr>
            <td><strong style="font-family:'JetBrains Mono'; color:var(--color-brand);">${op.empId}</strong></td>
            <td><strong>${op.name}</strong></td>
            <td><span class="badge-subtle">${op.deptCode} · ${op.deptName}</span></td>
            <td style="font-size:12px;">${op.machine}</td>
            <td><span style="font-size:11.5px; color:var(--text-secondary);">${op.shift || 'Turno Único'}</span></td>
            <td><strong style="color:var(--color-brand);">${pzas} pzas</strong></td>
            <td><span class="badge-status" style="background:${statusBg}; color:${statusColor}; font-weight:700;">● ${op.status}</span></td>
            <td>
              <div style="display:flex; gap:6px;">
                <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.openEditOperatorModal('${op.empId}')">
                  ✏️ Editar
                </button>
                <button class="btn-secondary" style="padding:4px 8px; font-size:11px; color:var(--color-red); border-color:var(--color-red-border);" onclick="window.deleteOperator('${op.empId}')">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (searchInput) searchInput.addEventListener('input', doRender);
    if (deptFilter) deptFilter.addEventListener('change', doRender);
    if (statusFilter) statusFilter.addEventListener('change', doRender);

    doRender();
  }

  window.renderOperatorsDirectory = renderOperatorsDirectory;

  window.updateOperatorStats = function() {
    const totalEl = document.getElementById('opStatTotal');
    const activeEl = document.getElementById('opStatActive');
    const avgPzasEl = document.getElementById('opStatAvgPzas');
    const effEl = document.getElementById('opStatEfficiency');
    if (!UanifyState.operators) return;

    const total = UanifyState.operators.length;
    const active = UanifyState.operators.filter(o => o.status === 'Activo').length;
    
    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (avgPzasEl) avgPzasEl.textContent = total > 0 ? (87.4).toFixed(1) : '0';
    if (effEl) effEl.textContent = '92.3%';
  };

  initLoginScreen();
  initSubTabs();
  updateUserInterface();
  renderInventorySection();
  renderOperatorsDirectory();
  window.updateOperatorStats();

  if (window.initAndonView)     window.initAndonView();
  if (window.initTerminalView)  window.initTerminalView();
  if (window.initEngineerView)  window.initEngineerView();
  if (window.initExecutiveView) window.initExecutiveView();
  if (window.initConfigView)    window.initConfigView();
});
