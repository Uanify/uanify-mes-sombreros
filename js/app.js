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
  version: '2.18.0',
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
      permissions: ['terminal', 'andon', 'inventory', 'operators', 'analytics', 'engineer', 'executive', 'config'],
      assignedDepartments: ['*'],
      badge: 'Admin'
    },
    {
      id: 'ing-1',
      name: 'Ing. Carlos Ortiz',
      email: 'cortiz@tombstone.mx',
      role: 'ingeniero',
      roleName: 'Ingeniero de Procesos',
      permissions: ['terminal', 'andon', 'inventory', 'operators', 'analytics', 'engineer', 'config'],
      assignedDepartments: ['*'],
      badge: 'Ingeniero'
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

  // ─── KÁRDEX & MOVIMIENTOS HISTÓRICOS DE ALMACÉN ───────────────────────────
  inventoryMovements: [
    { time: '12:45', type: 'Traspaso WIP', origin: 'ALM-INT-02 Alambrado', dest: 'ALM-INT-03 Camas Dope', item: 'Lote #1094 (Denver 1000X)', qty: '60 pzas', user: 'Rocío Morales', doc: 'TR-8841' },
    { time: '12:15', type: 'Entrada MP', origin: 'Proveedor Celaya', dest: 'ALM-01 Materia Prima', item: 'Rollo Telar 1000X Blanco (150m)', qty: '4 rollos', user: 'Esteban Lozano', doc: 'REM-4412' },
    { time: '11:50', type: 'Fraccionamiento Rampa', origin: 'ALM-02 Rampa WIP', dest: 'ALM-03 Pulmón Prensas', item: 'Sublote #1093-B (Viejonón 500X)', qty: '15 pzas', user: 'Auxiliar Rampa', doc: 'SUB-1093B' },
    { time: '11:20', type: 'Salida a Embarque', origin: 'ALM-INT-C3 Mezzanine', dest: 'ALM-04 Producto Terminado', item: 'Lote #1091 (Laredo Black 200X)', qty: '60 pzas', user: 'Inspectora Calidad', doc: 'VAL-0982' },
    { time: '10:40', type: 'Merma a Segundas', origin: 'ALM-INT-C2 Calidad 2', dest: 'ALM-05 Saldos de Viernes', item: 'Sombreros Denver (Tono disparejo)', qty: '2 pzas', user: 'Marcos Villegas', doc: 'SAL-0145' },
    { time: '09:30', type: 'Traspaso Subensamble', origin: 'ALM-INT-10 Adorno', dest: 'Mesa Ensamble Adorno 1', item: 'Tafiletes Piel Talla 57', qty: '60 pzas', user: 'María Elena Gómez', doc: 'TAF-5701' },
    { time: '08:15', type: 'Entrada MP', origin: 'Curtiduría León', dest: 'ALM-01 Materia Prima', item: 'Badanas Piel Cabra Especial', qty: '300 pzas', user: 'Almacenista Central', doc: 'REM-4409' }
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
  // Catálogo Oficial de Hormas y Moldes de San Francisco del Rincón (Validado en Fábrica)
  molds: [
    {
      code: 'HRM-JHN-54',
      name: '#54 JOHNSON LONA',
      tipo: 'Johnson',
      material: 'Aluminio Maquinado 6061-T6',
      alloy: 'Aluminio Maquinado 6061-T6',
      size: '54 (6 3/4)',
      machine: 'Prensa Hidráulica Michelagnoli P-01',
      status: 'En Uso',
      crown: '4 1/4" Gota Regular',
      brim: '4 1/4" Doblado Abajo',
      operatingTemp: '115°C - 125°C',
      pressure: '70 PSI Continuos',
      cycleCount: 6420,
      maxCycles: 10000,
      lastMaint: '12-Sep-2026',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="gAlum" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs><rect width="100%" height="100%" fill="#0F172A" rx="12"/><rect x="70" y="215" width="260" height="24" rx="4" fill="#334155"/><circle cx="95" cy="227" r="5" fill="#94A3B8"/><circle cx="305" cy="227" r="5" fill="#94A3B8"/><path d="M 90 215 C 105 180, 130 190, 140 140 C 145 100, 165 75, 185 70 C 200 68, 205 82, 205 82 C 205 82, 210 68, 225 70 C 245 75, 265 100, 270 140 C 280 190, 305 180, 320 215 Z" fill="url(#gAlum)" stroke="#F8FAFC" stroke-width="2"/><path d="M 145 150 Q 205 165 265 150" fill="none" stroke="#F1F5F9" stroke-width="1.5" opacity="0.75"/><rect x="150" y="172" width="100" height="20" rx="3" fill="#1E293B"/><text x="200" y="186" fill="#38BDF8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">HRM-JHN-54</text></svg>')
    },
    {
      code: 'HRM-JHN-53',
      name: '#53 JOHNSON LONA',
      tipo: 'Johnson',
      material: 'Aluminio Maquinado 6061-T6',
      alloy: 'Aluminio Maquinado 6061-T6',
      size: '53 (6 5/8)',
      machine: 'Prensa Hidráulica Michelagnoli P-01',
      status: 'Disponible',
      crown: '4 1/8" Regular',
      brim: '4" Doblado Abajo',
      operatingTemp: '115°C - 125°C',
      pressure: '70 PSI Continuos',
      cycleCount: 3180,
      maxCycles: 10000,
      lastMaint: '05-Sep-2026',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="gAlum2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs><rect width="100%" height="100%" fill="#0F172A" rx="12"/><rect x="70" y="215" width="260" height="24" rx="4" fill="#334155"/><circle cx="95" cy="227" r="5" fill="#94A3B8"/><circle cx="305" cy="227" r="5" fill="#94A3B8"/><path d="M 90 215 C 105 180, 130 190, 140 140 C 145 100, 165 75, 185 70 C 200 68, 205 82, 205 82 C 205 82, 210 68, 225 70 C 245 75, 265 100, 270 140 C 280 190, 305 180, 320 215 Z" fill="url(#gAlum2)" stroke="#F8FAFC" stroke-width="2"/><rect x="150" y="172" width="100" height="20" rx="3" fill="#1E293B"/><text x="200" y="186" fill="#38BDF8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">HRM-JHN-53</text></svg>')
    },
    {
      code: 'HRM-SNR-57',
      name: '#57 SONORA',
      tipo: 'Sonora',
      material: 'Aluminio Fundido A-356',
      alloy: 'Aluminio Termo-Fundido A-356',
      size: '57 (7 1/8)',
      machine: 'Prensa Hidráulica Michelagnoli P-02',
      status: 'En Uso',
      crown: '4 1/4" Sonora Plana',
      brim: '4 1/4" Perfil Plano',
      operatingTemp: '120°C - 130°C',
      pressure: '75 PSI Continuos',
      cycleCount: 8910,
      maxCycles: 12000,
      lastMaint: '18-Ago-2026',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="gAlum3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs><rect width="100%" height="100%" fill="#0F172A" rx="12"/><rect x="70" y="215" width="260" height="24" rx="4" fill="#334155"/><circle cx="95" cy="227" r="5" fill="#94A3B8"/><circle cx="305" cy="227" r="5" fill="#94A3B8"/><path d="M 90 215 C 105 180, 130 190, 140 140 C 145 100, 165 75, 185 70 C 200 68, 205 82, 205 82 C 205 82, 210 68, 225 70 C 245 75, 265 100, 270 140 C 280 190, 305 180, 320 215 Z" fill="url(#gAlum3)" stroke="#F8FAFC" stroke-width="2"/><rect x="150" y="172" width="100" height="20" rx="3" fill="#1E293B"/><text x="200" y="186" fill="#38BDF8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">HRM-SNR-57</text></svg>')
    },
    {
      code: 'HRM-CHP-53',
      name: '#53 CHAPARRAL LONA',
      tipo: 'Chaparral',
      material: 'Aluminio Maquinado 6061-T6',
      alloy: 'Aluminio Maquinado 6061-T6',
      size: '53 (6 5/8)',
      machine: 'Prensa Hidráulica P-03',
      status: 'Disponible',
      crown: '4 1/2" Texana Tradicional',
      brim: '9.0 cm Curvatura Abajo',
      operatingTemp: '115°C - 125°C',
      pressure: '70 PSI',
      cycleCount: 4230,
      maxCycles: 10000,
      lastMaint: '10-Sep-2026',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="gAlum4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs><rect width="100%" height="100%" fill="#0F172A" rx="12"/><rect x="70" y="215" width="260" height="24" rx="4" fill="#334155"/><circle cx="95" cy="227" r="5" fill="#94A3B8"/><circle cx="305" cy="227" r="5" fill="#94A3B8"/><path d="M 90 215 C 105 180, 130 190, 140 140 C 145 100, 165 75, 185 70 C 200 68, 205 82, 205 82 C 205 82, 210 68, 225 70 C 245 75, 265 100, 270 140 C 280 190, 305 180, 320 215 Z" fill="url(#gAlum4)" stroke="#F8FAFC" stroke-width="2"/><rect x="150" y="172" width="100" height="20" rx="3" fill="#1E293B"/><text x="200" y="186" fill="#38BDF8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">HRM-CHP-53</text></svg>')
    },
    {
      code: 'HRM-CHP-56',
      name: '#56 CHAPARRAL',
      tipo: 'Chaparral',
      material: 'Aluminio Maquinado 6061-T6',
      alloy: 'Aluminio Maquinado 6061-T6',
      size: '56 (7)',
      machine: 'Prensa Hidráulica P-03',
      status: 'En Uso',
      crown: '4 1/2" Texana Tradicional',
      brim: '9.0 cm Curvatura Abajo',
      operatingTemp: '115°C - 125°C',
      pressure: '70 PSI',
      cycleCount: 7520,
      maxCycles: 10000,
      lastMaint: '28-Ago-2026',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="gAlum5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs><rect width="100%" height="100%" fill="#0F172A" rx="12"/><rect x="70" y="215" width="260" height="24" rx="4" fill="#334155"/><circle cx="95" cy="227" r="5" fill="#94A3B8"/><circle cx="305" cy="227" r="5" fill="#94A3B8"/><path d="M 90 215 C 105 180, 130 190, 140 140 C 145 100, 165 75, 185 70 C 200 68, 205 82, 205 82 C 205 82, 210 68, 225 70 C 245 75, 265 100, 270 140 C 280 190, 305 180, 320 215 Z" fill="url(#gAlum5)" stroke="#F8FAFC" stroke-width="2"/><rect x="150" y="172" width="100" height="20" rx="3" fill="#1E293B"/><text x="200" y="186" fill="#38BDF8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">HRM-CHP-56</text></svg>')
    },
    {
      code: 'HRM-VJN-55',
      name: '#55 EL VIEJONÓN',
      tipo: 'Viejón',
      material: 'Aluminio Termo-Fundido CNC',
      alloy: 'Aluminio Termo-Fundido CNC',
      size: '55 (6 7/8)',
      machine: 'Prensa Hidráulica P-02',
      status: 'En Uso',
      crown: '5" Corona Viejón',
      brim: '9 1/2" Curva Arriba',
      operatingTemp: '125°C - 135°C',
      pressure: '80 PSI',
      cycleCount: 9400,
      maxCycles: 10000,
      lastMaint: '20-Ago-2026',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="gAlum6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs><rect width="100%" height="100%" fill="#0F172A" rx="12"/><rect x="70" y="215" width="260" height="24" rx="4" fill="#334155"/><circle cx="95" cy="227" r="5" fill="#94A3B8"/><circle cx="305" cy="227" r="5" fill="#94A3B8"/><path d="M 90 215 C 105 180, 130 190, 140 140 C 145 100, 165 75, 185 70 C 200 68, 205 82, 205 82 C 205 82, 210 68, 225 70 C 245 75, 265 100, 270 140 C 280 190, 305 180, 320 215 Z" fill="url(#gAlum6)" stroke="#F8FAFC" stroke-width="2"/><rect x="150" y="172" width="100" height="20" rx="3" fill="#1E293B"/><text x="200" y="186" fill="#38BDF8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">HRM-VJN-55</text></svg>')
    },
    {
      code: 'HRM-DNV-58',
      name: '#58 DENVER MASTER',
      tipo: 'Roper',
      material: 'Aluminio Maquinado 6061-T6',
      alloy: 'Aluminio Maquinado 6061-T6',
      size: '58 (7 1/4)',
      machine: 'Prensa Hidráulica P-01',
      status: 'Disponible',
      crown: '4 1/4" Gota Tear Drop',
      brim: '4 1/4" Curva Arriba',
      operatingTemp: '115°C - 125°C',
      pressure: '70 PSI',
      cycleCount: 5120,
      maxCycles: 10000,
      lastMaint: '01-Sep-2026',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="gAlum7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="50%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs><rect width="100%" height="100%" fill="#0F172A" rx="12"/><rect x="70" y="215" width="260" height="24" rx="4" fill="#334155"/><circle cx="95" cy="227" r="5" fill="#94A3B8"/><circle cx="305" cy="227" r="5" fill="#94A3B8"/><path d="M 90 215 C 105 180, 130 190, 140 140 C 145 100, 165 75, 185 70 C 200 68, 205 82, 205 82 C 205 82, 210 68, 225 70 C 245 75, 265 100, 270 140 C 280 190, 305 180, 320 215 Z" fill="url(#gAlum7)" stroke="#F8FAFC" stroke-width="2"/><rect x="150" y="172" width="100" height="20" rx="3" fill="#1E293B"/><text x="200" y="186" fill="#38BDF8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">HRM-DNV-58</text></svg>')
    },
    {
      code: 'HRM-BLR-58',
      name: '#58 BULLRIDER RODEO',
      tipo: 'Bullrider',
      material: 'Hierro Gris Fundido Nodular',
      alloy: 'Hierro Nodular Pesado',
      size: '58 (7 1/4)',
      machine: 'Prensa Hidráulica P-04',
      status: 'Disponible',
      crown: '4 3/4" Rodeo Rígido',
      brim: '4 1/2" Curva Pronunciada',
      operatingTemp: '130°C - 140°C',
      pressure: '85 PSI',
      cycleCount: 1820,
      maxCycles: 15000,
      lastMaint: '14-Jul-2026',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="gIron" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#64748B"/><stop offset="50%" stop-color="#475569"/><stop offset="100%" stop-color="#1E293B"/></linearGradient></defs><rect width="100%" height="100%" fill="#0F172A" rx="12"/><rect x="70" y="215" width="260" height="24" rx="4" fill="#1E293B"/><circle cx="95" cy="227" r="5" fill="#64748B"/><circle cx="305" cy="227" r="5" fill="#64748B"/><path d="M 90 215 C 105 180, 130 190, 140 140 C 145 100, 165 75, 185 70 C 200 68, 205 82, 205 82 C 205 82, 210 68, 225 70 C 245 75, 265 100, 270 140 C 280 190, 305 180, 320 215 Z" fill="url(#gIron)" stroke="#94A3B8" stroke-width="2"/><rect x="150" y="172" width="100" height="20" rx="3" fill="#0F172A"/><text x="200" y="186" fill="#F8FAFC" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">HRM-BLR-58</text></svg>')
    }
  ],

  // ─── CATÁLOGO OFICIAL DE SOMBREROS TERMINADOS (TOMBSTONE HATS) ─────────────
  // Con variaciones de talla, faldas, toquillas, horma asignada y fotografía técnica
  hatCatalog: [
    {
      id: 'SOM-01',
      code: 'TB-1000X-DNV',
      name: '1000X Master Telar Denver',
      family: 'Telar Shantung',
      material: 'Telar Shantung 1000X Fino',
      category: 'Texana Vaquera de Gala',
      crown: '4 1/4" Gota (Tear Drop)',
      brim: '4 1/4" Curvada Arriba',
      band: 'Toquilla Piel Vacuno Chocolate c/Herraje Plata',
      moldCode: 'HRM-DNV-58',
      moldName: '#58 DENVER MASTER',
      sizes: ['55', '56', '57', '58', '59', '60'],
      taktTime: '42s / estación',
      price: 1450,
      status: 'Activo',
      finish: 'Nitrocelulósica Satinada',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="cGrad1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#EAD7BB"/><stop offset="100%" stop-color="#B8976C"/></linearGradient><linearGradient id="bGrd1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#8C6843"/><stop offset="20%" stop-color="#EAD7BB"/><stop offset="80%" stop-color="#EAD7BB"/><stop offset="100%" stop-color="#8C6843"/></linearGradient></defs><rect width="100%" height="100%" fill="#F8FAFC" rx="12"/><ellipse cx="200" cy="225" rx="140" ry="16" fill="#000" opacity="0.12"/><path d="M 40 185 C 80 225, 320 225, 360 185 C 330 170, 270 195, 200 195 C 130 195, 70 170, 40 185 Z" fill="url(#bGrd1)" stroke="#8C6843" stroke-width="2"/><path d="M 125 185 C 120 115, 140 70, 165 65 C 185 62, 200 82, 200 82 C 200 82, 215 62, 235 65 C 260 70, 280 115, 275 185 Z" fill="url(#cGrad1)" stroke="#8C6843" stroke-width="2"/><path d="M 180 65 Q 200 95 220 65" fill="none" stroke="#684A2C" stroke-width="3" stroke-linecap="round"/><path d="M 124 175 Q 200 190 276 175 L 275 186 Q 200 200 125 186 Z" fill="#3E2713"/><circle cx="200" cy="187" r="4.5" fill="#E2E8F0" stroke="#475569"/></svg>'),
      notes: 'Tejido shantung 1000X cerrado con baño de laca nitrocelulósica satinada. Ribete reforzado de precisión en San Francisco del Rincón.'
    },
    {
      id: 'SOM-02',
      code: 'TB-1000X-VJN',
      name: '1000X Master Telar El Viejonón',
      family: 'Telar Shantung',
      material: 'Master Telar Fino / Horma Viejón',
      category: 'Texana Clásica Norteña',
      crown: '5" Corona Viejón',
      brim: '9 1/2" Curva Arriba',
      band: 'Toquilla Cinta Negra con Pespunte Marfil',
      moldCode: 'HRM-VJN-55',
      moldName: '#55 EL VIEJONÓN',
      sizes: ['54', '55', '56', '57', '58'],
      taktTime: '45s / estación',
      price: 1310,
      status: 'Activo',
      finish: 'Laqueado Semi-Brillo',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="cGrad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#D4A373"/><stop offset="100%" stop-color="#A97142"/></linearGradient><linearGradient id="bGrd2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#70441D"/><stop offset="20%" stop-color="#D4A373"/><stop offset="80%" stop-color="#D4A373"/><stop offset="100%" stop-color="#70441D"/></linearGradient></defs><rect width="100%" height="100%" fill="#F8FAFC" rx="12"/><ellipse cx="200" cy="225" rx="140" ry="16" fill="#000" opacity="0.12"/><path d="M 35 180 C 80 230, 320 230, 365 180 C 330 165, 270 195, 200 195 C 130 195, 70 165, 35 180 Z" fill="url(#bGrd2)" stroke="#70441D" stroke-width="2"/><path d="M 125 185 C 118 105, 140 60, 165 55 C 185 52, 200 75, 200 75 C 200 75, 215 52, 235 55 C 260 60, 282 105, 275 185 Z" fill="url(#cGrad2)" stroke="#70441D" stroke-width="2"/><path d="M 180 55 Q 200 88 220 55" fill="none" stroke="#502E11" stroke-width="3.5" stroke-linecap="round"/><path d="M 124 175 Q 200 190 276 175 L 275 186 Q 200 200 125 186 Z" fill="#0F172A"/><circle cx="200" cy="187" r="4.5" fill="#F1F5F9" stroke="#94A3B8"/></svg>'),
      notes: 'Modelo emblema de la fábrica Tombstone. Corona profunda con hendidura tradicional de vaquero bravío.'
    },
    {
      id: 'SOM-03',
      code: 'TB-1000X-CHP',
      name: '1000X Master Telar Chaparral',
      family: 'Telar Shantung',
      material: 'Telar Shantung Blanco / Toquilla Texana',
      category: 'Línea de Trabajo Pesado & Lienzo',
      crown: '4 1/2" Copa Chaparral',
      brim: '9.0 cm Curvatura Abajo',
      band: 'Toquilla Cuero Natural Repujado',
      moldCode: 'HRM-CHP-56',
      moldName: '#56 CHAPARRAL',
      sizes: ['55', '56', '57', '58'],
      taktTime: '40s / estación',
      price: 1310,
      status: 'Activo',
      finish: 'Sellado Repelente al Agua',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="cGrad3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FAEDCD"/><stop offset="100%" stop-color="#D4A373"/></linearGradient><linearGradient id="bGrd3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#99582A"/><stop offset="20%" stop-color="#FAEDCD"/><stop offset="80%" stop-color="#FAEDCD"/><stop offset="100%" stop-color="#99582A"/></linearGradient></defs><rect width="100%" height="100%" fill="#F8FAFC" rx="12"/><ellipse cx="200" cy="225" rx="140" ry="16" fill="#000" opacity="0.12"/><path d="M 40 185 C 80 225, 320 225, 360 185 C 330 170, 270 195, 200 195 C 130 195, 70 170, 40 185 Z" fill="url(#bGrd3)" stroke="#99582A" stroke-width="2"/><path d="M 125 185 C 120 115, 140 70, 165 65 C 185 62, 200 82, 200 82 C 200 82, 215 62, 235 65 C 260 70, 280 115, 275 185 Z" fill="url(#cGrad3)" stroke="#99582A" stroke-width="2"/><path d="M 124 175 Q 200 190 276 175 L 275 186 Q 200 200 125 186 Z" fill="#78350F"/><circle cx="200" cy="187" r="4.5" fill="#F8FAFC" stroke="#B45309"/></svg>'),
      notes: 'Horma de 1 sola pieza con falda de caída suave para protección solar extrema en jaripeos y faenas.'
    },
    {
      id: 'SOM-04',
      code: 'TB-LQ-SNR',
      name: 'Laqueado Especial Sonora Blanco',
      family: 'Telar Shantung',
      material: 'Laca Nitro Blanco Espejo / Telar Fino',
      category: 'Gala & Artistas',
      crown: '4 1/4" Sonora Plana',
      brim: '4 1/4" Perfil Plano Rígido',
      band: 'Toquilla Charol Negro con Broche Niquelado',
      moldCode: 'HRM-SNR-57',
      moldName: '#57 SONORA',
      sizes: ['56', '57', '58', '59'],
      taktTime: '48s / estación',
      price: 1450,
      status: 'Activo',
      finish: 'Laca Espejo Extra Blanco',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="cGrad4" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#E2E8F0"/></linearGradient><linearGradient id="bGrd4" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#94A3B8"/><stop offset="20%" stop-color="#FFFFFF"/><stop offset="80%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient></defs><rect width="100%" height="100%" fill="#0F172A" rx="12"/><ellipse cx="200" cy="225" rx="140" ry="16" fill="#000" opacity="0.3"/><path d="M 40 185 C 80 220, 320 220, 360 185 C 330 170, 270 195, 200 195 C 130 195, 70 170, 40 185 Z" fill="url(#bGrd4)" stroke="#CBD5E1" stroke-width="2"/><path d="M 125 185 C 120 115, 140 70, 165 65 C 185 62, 200 82, 200 82 C 200 82, 215 62, 235 65 C 260 70, 280 115, 275 185 Z" fill="url(#cGrad4)" stroke="#CBD5E1" stroke-width="2"/><path d="M 124 175 Q 200 190 276 175 L 275 186 Q 200 200 125 186 Z" fill="#0F172A"/><circle cx="200" cy="187" r="4.5" fill="#E2E8F0" stroke="#94A3B8"/></svg>'),
      notes: 'Pintura y matizado blanco nieve en cabina PT-01 con 3 capas de sellador epóxico y pulido a espejo.'
    },
    {
      id: 'SOM-05',
      code: 'TB-1000X-FRN',
      name: '1000X Master Telar Frontier F9',
      family: 'Telar Shantung',
      material: 'Telar / Copa Gota de Agua Reforzada',
      category: 'Rodeo Competencia',
      crown: '4 3/4" Gota Alta',
      brim: '4 1/2" Curva Arriba',
      band: 'Toquilla Piel Pespuntada Hilo Encerado',
      moldCode: 'HRM-DNV-58',
      moldName: '#58 DENVER MASTER',
      sizes: ['55', '56', '57', '58', '59'],
      taktTime: '42s / estación',
      price: 1310,
      status: 'Activo',
      finish: 'Satinado Térmico',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="cGrad5" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#E9EDC9"/><stop offset="100%" stop-color="#CCD5AE"/></linearGradient><linearGradient id="bGrd5" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#7F8760"/><stop offset="20%" stop-color="#E9EDC9"/><stop offset="80%" stop-color="#E9EDC9"/><stop offset="100%" stop-color="#7F8760"/></linearGradient></defs><rect width="100%" height="100%" fill="#F8FAFC" rx="12"/><ellipse cx="200" cy="225" rx="140" ry="16" fill="#000" opacity="0.12"/><path d="M 40 185 C 80 225, 320 225, 360 185 C 330 170, 270 195, 200 195 C 130 195, 70 170, 40 185 Z" fill="url(#bGrd5)" stroke="#7F8760" stroke-width="2"/><path d="M 125 185 C 120 115, 140 70, 165 65 C 185 62, 200 82, 200 82 C 200 82, 215 62, 235 65 C 260 70, 280 115, 275 185 Z" fill="url(#cGrad5)" stroke="#7F8760" stroke-width="2"/><path d="M 124 175 Q 200 190 276 175 L 275 186 Q 200 200 125 186 Z" fill="#3F4E28"/><circle cx="200" cy="187" r="4.5" fill="#E2E8F0" stroke="#475569"/></svg>'),
      notes: 'Construcción en 2 piezas (copa + falda pegadas con calor en Rampa) con alambre de memoria cal. 19.'
    },
    {
      id: 'SOM-06',
      code: 'TB-500X-MGN',
      name: 'Campana Fieltro Magnum 500X',
      family: 'Fieltro Lana',
      material: 'Fieltro Lana Fina / Copa Redonda',
      category: 'Invierno & Charro Ligero',
      crown: '4 1/4" Copa Redonda',
      brim: '4 1/4" Doblez Suave',
      band: 'Toquilla Fieltro Tono a Tono con Herraje Bronce',
      moldCode: 'HRM-BLR-58',
      moldName: '#58 BULLRIDER RODEO',
      sizes: ['56', '57', '58', '59', '60'],
      taktTime: '36s (Proceso Corto Campana)',
      price: 1150,
      status: 'Bajo Pedido',
      finish: 'Cepillado Fino',
      photo: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="cGrad6" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0F172A"/></linearGradient><linearGradient id="bGrd6" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#020617"/><stop offset="20%" stop-color="#334155"/><stop offset="80%" stop-color="#334155"/><stop offset="100%" stop-color="#020617"/></linearGradient></defs><rect width="100%" height="100%" fill="#F8FAFC" rx="12"/><ellipse cx="200" cy="225" rx="140" ry="16" fill="#000" opacity="0.12"/><path d="M 40 185 C 80 225, 320 225, 360 185 C 330 170, 270 195, 200 195 C 130 195, 70 170, 40 185 Z" fill="url(#bGrd6)" stroke="#0F172A" stroke-width="2"/><path d="M 125 185 C 120 115, 140 70, 165 65 C 185 62, 200 82, 200 82 C 200 82, 215 62, 235 65 C 260 70, 280 115, 275 185 Z" fill="url(#cGrad6)" stroke="#0F172A" stroke-width="2"/><path d="M 124 175 Q 200 190 276 175 L 275 186 Q 200 200 125 186 Z" fill="#B45309"/><circle cx="200" cy="187" r="4.5" fill="#FDE68A" stroke="#78350F"/></svg>'),
      notes: 'Campana preformada de proceso corto. Prensado en seco con vapor caliente sin etapa de corte de rollo.'
    }
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
    { id: 'viejonon',  name: '1000X Master Telar El Viejonón', sku: 'TB-1000X-VJN-55', price: 1310, material: 'Master Telar / Horma Viejón',          size: '55 (6 7/8)', crownHorma: 'Viejón',   tipo: '2 piezas', brim: '9 1/2', bend: 'ARRIBA' },
    { id: 'denver',    name: '1000X Master Telar Denver',     sku: 'TB-1000X-DNV-58', price: 1310, material: 'Telar Fino 1000X / Toquilla Piel',     size: '58 (7 1/4)', crownHorma: 'Roper',    tipo: '2 piezas', brim: '4 1/4"', bend: 'ARRIBA' },
    { id: 'chaparral', name: '1000X Master Telar Chaparral',  sku: 'TB-1000X-CHP-56', price: 1310, material: 'Telar Blanco / Toquilla Texana',      size: '56 (7)',     crownHorma: 'Chaparral',tipo: '1 pieza',  brim: '9.0 Cm', bend: 'ABAJO' },
    { id: 'laredo',    name: '1000X Master Telar Laredo F10', sku: 'TB-1000X-LRD-58', price: 1310, material: 'Master Telar / Falda 4" Plana',        size: '58 (7 1/4)', crownHorma: 'Laredo',   tipo: '1 pieza',  brim: '4.00"', bend: 'PLANA' },
    { id: 'frontier',  name: '1000X Master Telar Frontier F9',sku: 'TB-1000X-FRN-59', price: 1310, material: 'Telar / Copa Gota de Agua',            size: '59 (7 3/8)', crownHorma: 'Frontier', tipo: '2 piezas', brim: '4 1/2"', bend: 'ARRIBA' },
    { id: 'magnum',    name: 'Campana Fieltro Magnum 500X',    sku: 'TB-500X-MGN-57',  price: 1150, material: 'Fieltro Lana / Copa Redonda',           size: '57 (7 1/8)', crownHorma: 'Magnum',   tipo: '1 pieza (Campana)', brim: '4 1/4"', bend: 'ARRIBA' },
    { id: 'sonora',    name: 'Laqueado Especial Sonora Blanco',sku: 'TB-LQ-SNR-57',   price: 1450, material: 'Laca Nitro Blanco Espejo',              size: '57 (7 1/8)', crownHorma: 'Sonora',   tipo: '2 piezas', brim: '4 1/4"', bend: 'PLANA' },
    { id: 'bullrider', name: 'Bullrider Rodeo Heavy Duty',    sku: 'TB-BLR-58-HD',    price: 1390, material: 'Hierro Forjado Prensado Rígido',        size: '58 (7 1/4)', crownHorma: 'Bullrider',tipo: '2 piezas', brim: '4 1/2"', bend: 'ARRIBA' }
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
      location: 'Filtro Entrada a Prensas (Nave 1)',
      desc: '1er punto de inspección. Libera o rechaza el lote tras sellado y secado en camas.',
      criteria: 'Rigidez uniforme de telares, sin burbujas de dope, sellado perimetral.',
      inspector: 'Inspectora de Calidad (Turno)',
      cycleTime: '18s',
      status: 'Activo'
    },
    {
      code: 'C-02',
      name: 'Calidad 2 (Post-Pintura)',
      location: 'Salida Cabina de Pintura (Nave 2)',
      desc: '2do punto de inspección. Verifica uniformidad y tono de pintura antes de brillo.',
      criteria: 'Tono según muestra patrón, sin escurrimientos, recubrimiento parejo.',
      inspector: 'Inspectora de Calidad (Turno)',
      cycleTime: '16s',
      status: 'Activo'
    },
    {
      code: 'C-03',
      name: 'Calidad 3 (Producto Terminado)',
      location: 'Mezzanine de Empaque & Traspaso',
      desc: '3er punto de inspección previo a empaque y embarque final.',
      criteria: 'Alineación de copa y ala, costura de tafilete, toquilla y herrajes firmes.',
      inspector: 'Ing. Carlos Ortiz / Inspectora',
      cycleTime: '25s',
      status: 'Activo'
    },
    {
      code: 'C-04',
      name: 'Calidad 4 (Post-Laqueado Especial)',
      location: 'Túnel de Secado Infrarrojo (Nave 2)',
      desc: '4to punto de inspección para modelos de alto brillo y resistencia térmica.',
      criteria: 'Cero piel de naranja, adherencia clase 5B, brillo espejo uniforme.',
      inspector: 'Inspectora de Calidad (Turno)',
      cycleTime: '20s',
      status: 'Activo'
    }
  ],

  // ─── RUTAS Y SECUENCIAS PRODUCTIVAS POR MODELO DE SOMBRERO ─────────────────
  productionRoutes: [
    {
      id: 'route-model-viejonon',
      modelId: 'viejonon',
      name: '1000X Master Telar El Viejonón',
      sku: 'TB-1000X-VJN-55',
      category: 'Sombrero 2 Piezas (Copa y Falda)',
      desc: 'Ruta completa tradicional con fraccionamiento en rampa de 60 a 15 piezas y 3 filtros de calidad.',
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
      id: 'route-model-denver',
      modelId: 'denver',
      name: '1000X Master Telar Denver',
      sku: 'TB-1000X-DNV-58',
      category: 'Sombrero 2 Piezas (Copa y Falda)',
      desc: 'Ruta completa con horma Roper 4 1/4" y adorno de toquilla de piel con herraje níquel.',
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
      id: 'route-model-chaparral',
      modelId: 'chaparral',
      name: '1000X Master Telar Chaparral',
      sku: 'TB-1000X-CHP-56',
      category: 'Sombrero 1 Pieza (Falda 9.0 Cm)',
      desc: 'Ruta de 1 pieza con falda de 9.0 cm doblada abajo y toquilla texana fina.',
      steps: [
        { order: 1,  code: 'D-01', name: 'Corte de Cuadros',                 type: 'manufactura', icon: '✂️' },
        { order: 2,  code: 'D-03', name: 'Englopado / Baño de Dope',         type: 'manufactura', icon: '🧪' },
        { order: 3,  code: 'C-01', name: 'Calidad 1 (Post-Dope)',            type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 4,  code: 'D-05', name: 'Prensas de Hormado (Rampa 15pz)',  type: 'manufactura', icon: '⚙️' },
        { order: 5,  code: 'D-06', name: 'Recorte y Refaldeado',             type: 'manufactura', icon: '📐' },
        { order: 6,  code: 'D-07', name: 'Pintura y Secado',                 type: 'manufactura', icon: '🎨' },
        { order: 7,  code: 'C-02', name: 'Calidad 2 (Post-Pintura)',         type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 8,  code: 'D-08', name: 'Brillo / Acabado',                 type: 'manufactura', icon: '✨' },
        { order: 9,  code: 'D-09', name: 'Temperado / Refaldear',            type: 'manufactura', icon: '♨️' },
        { order: 10, code: 'D-10', name: 'Adorno 1 (Tafilete + Toquilla)',   type: 'manufactura', icon: '🤠' },
        { order: 11, code: 'C-03', name: 'Calidad 3 (Producto Terminado)',   type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 12, code: 'D-11', name: 'Embarque & Vale COMPAC',           type: 'logistica',   icon: '🚚' }
      ]
    },
    {
      id: 'route-model-laredo',
      modelId: 'laredo',
      name: '1000X Master Telar Laredo F10',
      sku: 'TB-1000X-LRD-58',
      category: 'Sombrero Laqueado Especial (Falda Plana)',
      desc: 'Ruta con prensas hidráulicas Michelagnoli, doble laqueado y filtro C-04 post-secado.',
      steps: [
        { order: 1,  code: 'D-01', name: 'Corte de Cuadros',                 type: 'manufactura', icon: '✂️' },
        { order: 2,  code: 'D-02', name: 'Alambrado de Ala',                 type: 'manufactura', icon: '🧵' },
        { order: 3,  code: 'D-03', name: 'Englopado Especial Reforzado',      type: 'manufactura', icon: '🧪' },
        { order: 4,  code: 'C-01', name: 'Calidad 1 (Post-Dope)',            type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 5,  code: 'D-05', name: 'Prensas Hidráulicas Michelagnoli', type: 'manufactura', icon: '⚙️' },
        { order: 6,  code: 'D-06', name: 'Recorte y Refaldeado de Precisión',type: 'manufactura', icon: '📐' },
        { order: 7,  code: 'D-07', name: 'Pintura y Secado (Laca Taiwan)',   type: 'manufactura', icon: '🎨' },
        { order: 8,  code: 'C-04', name: 'Calidad 4 (Post-Laqueado)',        type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 9,  code: 'D-08', name: 'Brillo / Acabado Espejo',          type: 'manufactura', icon: '✨' },
        { order: 10, code: 'D-10', name: 'Adorno 1 (Badana Piel + Pin)',     type: 'manufactura', icon: '🤠' },
        { order: 11, code: 'C-03', name: 'Calidad 3 (Liberación Comercial)', type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 12, code: 'D-11', name: 'Embarque & COMPAC',                 type: 'logistica',   icon: '🚚' }
      ]
    },
    {
      id: 'route-model-frontier',
      modelId: 'frontier',
      name: '1000X Master Telar Frontier F9',
      sku: 'TB-1000X-FRN-59',
      category: 'Sombrero 2 Piezas (Copa Gota de Agua)',
      desc: 'Ruta con conformación especial de copa de gota de agua y ribete de precisión.',
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
      id: 'route-model-magnum',
      modelId: 'magnum',
      name: 'Campana Fieltro Magnum 500X',
      sku: 'TB-500X-MGN-57',
      category: 'Sombrero 1 Pieza (Moldeo Directo Fieltro)',
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
      id: 'route-model-sonora',
      modelId: 'sonora',
      name: 'Laqueado Especial Sonora Blanco',
      sku: 'TB-LQ-SNR-57',
      category: 'Sombrero Laqueado Blanco Espejo',
      desc: 'Ruta con acabado laqueado blanco espejo, secado en túnel UV y filtro C-04.',
      steps: [
        { order: 1,  code: 'D-01', name: 'Corte de Cuadros',                 type: 'manufactura', icon: '✂️' },
        { order: 2,  code: 'D-02', name: 'Alambrado de Ala',                 type: 'manufactura', icon: '🧵' },
        { order: 3,  code: 'D-03', name: 'Englopado Especial Reforzado',      type: 'manufactura', icon: '🧪' },
        { order: 4,  code: 'C-01', name: 'Calidad 1 (Post-Dope)',            type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 5,  code: 'D-05', name: 'Prensas Hidráulicas Michelagnoli', type: 'manufactura', icon: '⚙️' },
        { order: 6,  code: 'D-06', name: 'Recorte y Refaldeado de Precisión',type: 'manufactura', icon: '📐' },
        { order: 7,  code: 'D-07', name: 'Pintura y Secado (Laca Taiwan)',   type: 'manufactura', icon: '🎨' },
        { order: 8,  code: 'C-04', name: 'Calidad 4 (Post-Laqueado)',        type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 9,  code: 'D-08', name: 'Brillo / Acabado Espejo',          type: 'manufactura', icon: '✨' },
        { order: 10, code: 'D-10', name: 'Adorno 1 (Badana Piel + Pin)',     type: 'manufactura', icon: '🤠' },
        { order: 11, code: 'C-03', name: 'Calidad 3 (Liberación Comercial)', type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 12, code: 'D-11', name: 'Embarque & COMPAC',                 type: 'logistica',   icon: '🚚' }
      ]
    },
    {
      id: 'route-model-bullrider',
      modelId: 'bullrider',
      name: 'Bullrider Rodeo Heavy Duty',
      sku: 'TB-BLR-58-HD',
      category: 'Sombrero Rodeo Heavy Duty',
      desc: 'Ruta con prensado en horma metálica caliente a 130°C y doble endurecedor.',
      steps: [
        { order: 1,  code: 'D-01', name: 'Corte de Cuadros',                 type: 'manufactura', icon: '✂️' },
        { order: 2,  code: 'D-02', name: 'Alambrado de Ala',                 type: 'manufactura', icon: '🧵' },
        { order: 3,  code: 'D-03', name: 'Englopado / Baño de Dope',         type: 'manufactura', icon: '🧪' },
        { order: 4,  code: 'C-01', name: 'Calidad 1 (Post-Dope)',            type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 5,  code: 'D-05', name: 'Prensas de Hormado (Rampa 15pz)',  type: 'manufactura', icon: '⚙️' },
        { order: 6,  code: 'D-06', name: 'Recorte y Refaldeado',             type: 'manufactura', icon: '📐' },
        { order: 7,  code: 'D-07', name: 'Pintura y Secado',                 type: 'manufactura', icon: '🎨' },
        { order: 8,  code: 'C-02', name: 'Calidad 2 (Post-Pintura)',         type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 9,  code: 'D-08', name: 'Brillo / Acabado',                 type: 'manufactura', icon: '✨' },
        { order: 10, code: 'D-09', name: 'Temperado / Refaldear',            type: 'manufactura', icon: '♨️' },
        { order: 11, code: 'D-10', name: 'Adorno 1 (Tafilete + Toquilla)',   type: 'manufactura', icon: '🤠' },
        { order: 12, code: 'C-03', name: 'Calidad 3 (Producto Terminado)',   type: 'calidad',     icon: '🔍', isQualityStop: true },
        { order: 13, code: 'D-11', name: 'Embarque & Vale COMPAC',           type: 'logistica',   icon: '🚚' }
      ]
    },
    // Compatibilidad retroactiva de IDs generales
    {
      id: 'route-telar-1000x',
      name: 'Familia General: 1000X Master Telar (2 Piezas)',
      modelKeyword: '1000X Master Telar',
      category: 'Familia Base Telar',
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
      name: 'Familia General: Campana Preformada / Fieltro',
      modelKeyword: 'Campana Preformada / Fieltro',
      category: 'Familia Base Fieltro',
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
      name: 'Familia General: Laqueados Especiales',
      modelKeyword: 'Laqueados Especiales',
      category: 'Familia Base Laqueados',
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
      type: 'proceso',
      intermediateWarehouse: 'Buffer Entrada Telar (ALM-INT-01)',
      warehouseLocation: 'Nave A - Pasillo 1 (Junto a Rollos)',
      wipCapacity: 180,
      machines: 'Mesa de Tendido 12m, Cortadora Circular KM-01',
      note: 'Inicio de proceso para telares. Campana preformada omite este paso.'
    },
    {
      id: 'alambrado',
      code: 'D-02',
      name: 'Alambrado de Ala',
      desc: 'Colocación de alambre de memoria en el perímetro de la falda + costura',
      target: 145, produced: 124, scrap: 2, wipWaiting: 15, cycleTime: '38s',
      status: 'running', operator: 'Rocío Morales',
      type: 'proceso',
      intermediateWarehouse: 'Pulmón Alambrado (ALM-INT-02)',
      warehouseLocation: 'Nave A - Estaciones de Cosido',
      wipCapacity: 160,
      machines: 'Máquinas de Coser Perimetral Singer Heavy Duty S-01 a S-04',
      note: 'Opera con varias personas en estaciones de trabajo. Supervisor asigna lotes.'
    },
    {
      id: 'dope',
      code: 'D-03',
      name: 'Englopado / Baño de Dope',
      desc: 'Baño de dope (sellador) en esquina. Secado en camas. Cada cama = 1 lote.',
      target: 140, produced: 110, scrap: 1, wipWaiting: 22, cycleTime: '45s',
      status: 'running', operator: 'Pedro Torres',
      type: 'proceso',
      intermediateWarehouse: 'Camas de Secado Dope (ALM-INT-03)',
      warehouseLocation: 'Área Químicos - Nave B Esquina Norte',
      wipCapacity: 200,
      machines: 'Tinas de Inmersión Dope T-01, Camas de Secado 1 a 6',
      note: 'Tarjetas viajeras se identifican por cama. Lote se arma de nuevo al secar.'
    },
    {
      id: 'refuerzos',
      code: 'D-04',
      name: 'Refuerzos (Pintola / Brocha)',
      desc: 'Aplicación de sellador con brocha y refuerzos con pintola (patio exterior)',
      target: 140, produced: 118, scrap: 1, wipWaiting: 11, cycleTime: '30s',
      status: 'running', operator: 'Luis Salas',
      type: 'proceso',
      intermediateWarehouse: 'Pulmón Patio Refuerzos (ALM-INT-04)',
      warehouseLocation: 'Patio Exterior Techado Refuerzos',
      wipCapacity: 150,
      machines: 'Compresor Industrial 15HP, Pistolas de Aspersión HVLP-01/02',
      note: 'Cierra el tejido del telar. Después regresa al almacén y entra a Calidad 1.'
    },
    {
      id: 'calidad1',
      code: 'C-01',
      name: 'Calidad 1 (Post-Dope / Refuerzos)',
      desc: '1er punto de inspección de calidad. Libera o rechaza el lote al siguiente dpto.',
      target: 140, produced: 115, scrap: 2, wipWaiting: 10, cycleTime: '18s',
      status: 'running', operator: 'Inspectora de Calidad (turno)',
      type: 'calidad',
      intermediateWarehouse: 'Inspección C-01 / Buffer Liberación',
      warehouseLocation: 'Filtro de Inspección Entrada a Prensas',
      wipCapacity: 120,
      machines: 'Mesa de Inspección Iluminada 5000K, Calibrador de Espesor',
      note: 'Si pasa → avanza. Si no → regresa al dpto. con error. Si no tiene arreglo → saldo.'
    },
    {
      id: 'prensas',
      code: 'D-05',
      name: 'Prensas de Hormado (Copa y Falda)',
      desc: 'Prensas de vapor y calor con hormas metálicas. Múltiples entradas/salidas por fracción.',
      target: 140, produced: 98, scrap: 4, wipWaiting: 46,  // ← cuello de botella
      cycleTime: '26s', status: 'running', operator: 'Juan Manuel Pérez',
      type: 'prensas',
      intermediateWarehouse: 'Pulmón Pre-Prensas & Vapor (ALM-03)',
      warehouseLocation: 'Batería Central de Prensas Michelagnoli',
      wipCapacity: 250,
      machines: 'Prensas de Vapor Michelagnoli P-01 a P-04, Prensa Hidráulica H-01',
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
      type: 'proceso',
      intermediateWarehouse: 'Pulmón Exterior Recortes (ALM-INT-06)',
      warehouseLocation: 'Patio Exterior de Recortes',
      wipCapacity: 160,
      machines: 'Mesas Circulares de Corte Refaldeador R-01 a R-03',
      note: 'Área exterior (patio). También área de polvo. Se almacena antes de pintura.'
    },
    {
      id: 'pintura',
      code: 'D-07',
      name: 'Pintura y Secado',
      desc: 'Aplicación de pintura con pistola (ej. Pintura Taiwan 1125) y secado.',
      target: 135, produced: 96, scrap: 2, wipWaiting: 16, cycleTime: '42s',
      status: 'warning', operator: 'Marcos Villegas',
      type: 'proceso',
      intermediateWarehouse: 'Buffer Cabinas Pintura (ALM-INT-07)',
      warehouseLocation: 'Cabinas de Aspersión Nave Central',
      wipCapacity: 150,
      machines: 'Cabina de Pintura con Extracción C-01, Pistolas Taiwan 1125',
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
      type: 'calidad',
      intermediateWarehouse: 'Inspección C-02 Pintura/Brillo (ALM-INT-C2)',
      warehouseLocation: 'Salida Cabinas de Pintura',
      wipCapacity: 110,
      machines: 'Cámara de Luz D65 para Inspección de Tono de Pintura',
      note: 'Si hay error de pintura → regresa a Pintura. Si no tiene arreglo → saldo.'
    },
    {
      id: 'brillo',
      code: 'D-08',
      name: 'Brillo / Acabado',
      desc: 'Aplicación de brillo/barniz. Mismo punto de revisión que Calidad 2 (área compartida).',
      target: 130, produced: 91, scrap: 1, wipWaiting: 9, cycleTime: '22s',
      status: 'running', operator: 'Marcos Villegas',
      type: 'proceso',
      intermediateWarehouse: 'Túnel Secado Brillo (ALM-INT-08)',
      warehouseLocation: 'Área Continua a Pintura Nave Central',
      wipCapacity: 130,
      machines: 'Túnel Infrarrojo de Curado de Laca T-01',
      note: 'El mismo espacio físico revisa pintura y brillo secuencialmente.'
    },
    {
      id: 'temperado',
      code: 'D-09',
      name: 'Temperado / Refaldear',
      desc: 'Proceso de calor/temperado final. Perfilado de ala (refaldear).',
      target: 130, produced: 100, scrap: 1, wipWaiting: 9, cycleTime: '34s',
      status: 'running', operator: 'Operario Temperado',
      type: 'proceso',
      intermediateWarehouse: 'Almacén Pulmón Pre-Adorno (ALM-INT-09)',
      warehouseLocation: 'Paso Intermedio hacia Mesas de Adorno',
      wipCapacity: 140,
      machines: 'Hornos de Calor Seco H-01/02, Conformadoras de Ala',
      note: 'Después de aquí pasa al almacén previo a Adorno 1.'
    },
    {
      id: 'adorno',
      code: 'D-10',
      name: 'Adorno 1 (Tafilete + Toquilla)',
      desc: '3 subensambles convergen: cuerpo del sombrero + tafilete (por talla 55-60) + toquilla.',
      target: 140, produced: 101, scrap: 2, wipWaiting: 12, cycleTime: '40s',
      status: 'running', operator: 'María Elena Gómez',
      type: 'proceso',
      intermediateWarehouse: 'Almacén Tafiletes & Mesa Adorno (ALM-INT-10)',
      warehouseLocation: 'Nave de Confección & Adornos',
      wipCapacity: 180,
      machines: 'Pegadoras Térmicas de Badana, Planchas de Toquilla P-01',
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
      type: 'calidad',
      intermediateWarehouse: 'Mezzanine Inspección Final (C-03)',
      warehouseLocation: 'Mezzanine Central de San Francisco del Rincón',
      wipCapacity: 200,
      machines: 'Mesa de Revisión 360°, Medidores de Confort y Talla',
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
      type: 'logistica',
      intermediateWarehouse: 'Andén de Embarque & PT (ALM-04)',
      warehouseLocation: 'Nave B - Andén de Carga y Salida',
      wipCapacity: 600,
      machines: 'Terminal POS de Vale Digital, Báscula de Plataforma 500kg',
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

    // 1. Coincidencia directa por routeId
    let route = this.productionRoutes.find(r => r.id === lot.routeId);
    if (route) return route;

    // 2. Coincidencia por modelo específico
    if (lot.model) {
      const norm = lot.model.toLowerCase();
      route = this.productionRoutes.find(r => 
        (r.modelId && norm.includes(r.modelId.toLowerCase())) ||
        (r.name && r.name.toLowerCase().includes(norm))
      );
      if (route) return route;
    }

    return this.productionRoutes[0];
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
  inventory: 'Catálogos & Almacenes',
  operators: 'Padrón de Operadores',
  analytics: 'Analítica & KPIs de Planta',
  engineer: 'Analítica & KPIs de Planta',
  executive: 'Analítica & KPIs de Planta',
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
    const isAllowed = user.permissions.includes(tab) ||
      (tab === 'analytics' && (user.permissions.includes('engineer') || user.permissions.includes('executive') || user.role === 'admin' || user.role === 'ingeniero'));
    
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
  const hasAccessToActive = user.permissions.includes(UanifyState.activeTab) ||
    (UanifyState.activeTab === 'analytics' && (user.permissions.includes('engineer') || user.permissions.includes('executive') || user.role === 'admin' || user.role === 'ingeniero'));

  if (!hasAccessToActive) {
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

      // Validación de Permisos por Rol (RBAC) con retrocompatibilidad para analytics
      const isAllowed = user.permissions.includes(targetTab) ||
        (targetTab === 'analytics' && (user.permissions.includes('engineer') || user.permissions.includes('executive') || user.role === 'admin' || user.role === 'ingeniero'));

      if (!isAllowed) {
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

// Función para enriquecer departamentos con propiedades completas de Almacén Intermedio
function enrichStationWithDefaults(st, idx) {
  if (!st) return st;
  if (!st.type) {
    if (st.code === 'D-05' || (st.id && st.id.includes('prensa'))) st.type = 'prensas';
    else if ((st.code && st.code.startsWith('C-')) || (st.id && st.id.includes('calidad'))) st.type = 'calidad';
    else if (st.code === 'D-11' || (st.id && st.id.includes('embarque'))) st.type = 'logistica';
    else st.type = 'proceso';
  }
  if (!st.intermediateWarehouse) {
    if (st.code === 'D-01') st.intermediateWarehouse = 'Buffer Entrada Telar (ALM-INT-01)';
    else if (st.code === 'D-02') st.intermediateWarehouse = 'Pulmón Alambrado (ALM-INT-02)';
    else if (st.code === 'D-03') st.intermediateWarehouse = 'Camas de Secado Dope (ALM-INT-03)';
    else if (st.code === 'D-04') st.intermediateWarehouse = 'Pulmón Patio Refuerzos (ALM-INT-04)';
    else if (st.code === 'C-01') st.intermediateWarehouse = 'Inspección C-01 / Buffer Liberación';
    else if (st.code === 'D-05') st.intermediateWarehouse = 'Pulmón Pre-Prensas & Vapor (ALM-03)';
    else if (st.code === 'D-06') st.intermediateWarehouse = 'Pulmón Exterior Recortes (ALM-INT-06)';
    else if (st.code === 'D-07') st.intermediateWarehouse = 'Buffer Cabinas Pintura (ALM-INT-07)';
    else if (st.code === 'C-02') st.intermediateWarehouse = 'Inspección C-02 Pintura/Brillo (ALM-INT-C2)';
    else if (st.code === 'D-08') st.intermediateWarehouse = 'Túnel Secado Brillo (ALM-INT-08)';
    else if (st.code === 'D-09') st.intermediateWarehouse = 'Almacén Pulmón Pre-Adorno (ALM-INT-09)';
    else if (st.code === 'D-10') st.intermediateWarehouse = 'Almacén Tafiletes & Mesa Adorno (ALM-INT-10)';
    else if (st.code === 'C-03') st.intermediateWarehouse = 'Mezzanine Inspección Final (C-03)';
    else if (st.code === 'D-11') st.intermediateWarehouse = 'Andén de Embarque & PT (ALM-04)';
    else st.intermediateWarehouse = `Almacén Intermedio ${st.name} (ALM-INT-${st.code || idx+1})`;
  }
  if (!st.warehouseLocation) {
    if (st.code === 'D-01' || st.code === 'D-02') st.warehouseLocation = 'Nave A - Pasillo 1';
    else if (st.code === 'D-03' || st.code === 'D-04') st.warehouseLocation = 'Área Químicos / Patio Exterior';
    else if (st.code === 'D-05') st.warehouseLocation = 'Batería Central de Prensas Michelagnoli';
    else if (st.code === 'D-07' || st.code === 'D-08') st.warehouseLocation = 'Cabinas de Aspersión Nave Central';
    else if (st.code === 'D-10') st.warehouseLocation = 'Nave de Confección & Adornos';
    else if (st.code === 'D-11') st.warehouseLocation = 'Andén de Carga Nave B';
    else st.warehouseLocation = 'Nave Central Tombstone';
  }
  if (!st.machines) {
    if (st.code === 'D-05') st.machines = 'Prensas de Vapor Michelagnoli P-01 a P-04, Prensa Hidráulica H-01';
    else if (st.code === 'D-01') st.machines = 'Mesa de Tendido 12m, Cortadora Circular KM-01';
    else if (st.code === 'D-02') st.machines = 'Máquinas de Coser Singer Heavy Duty S-01 a S-04';
    else if (st.code === 'D-03') st.machines = 'Tinas de Inmersión Dope T-01, Camas de Secado 1 a 6';
    else if (st.code === 'D-07') st.machines = 'Cabina de Pintura con Extracción, Pistolas Taiwan 1125';
    else if (st.code === 'D-10') st.machines = 'Pegadoras Térmicas de Badana, Planchas de Toquilla';
    else st.machines = 'Estación manual / Herramientas de mano';
  }
  if (!st.wipCapacity) {
    st.wipCapacity = st.target || 150;
  }
  return st;
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

  // Enriquecer estaciones con propiedades de Almacén Intermedio si faltan
  if (UanifyState.stations && Array.isArray(UanifyState.stations)) {
    UanifyState.stations = UanifyState.stations.map((st, idx) => enrichStationWithDefaults(st, idx));
  }

  // Restaurar moldes personalizados si existen
  try {
    const savedMolds = localStorage.getItem('uanify_custom_molds');
    if (savedMolds) {
      const parsedMolds = JSON.parse(savedMolds);
      if (Array.isArray(parsedMolds) && parsedMolds.length > 0) {
        UanifyState.molds = parsedMolds;
      }
    }
  } catch (e) {
    console.warn('Error al restaurar catálogo de moldes:', e);
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

    // Tabla de almacenes (con Filtros y Acciones - Regla 0.35)
    let whFiltersBound = false;
    function renderWarehousesTable() {
      if (!tableBody || !UanifyState.warehouses) return;
      const searchInput = document.getElementById('whSearchInput');
      const typeFilter = document.getElementById('whTypeFilter');
      const statusFilter = document.getElementById('whStatusFilter');
      const countBadge = document.getElementById('whFilteredCountBadge');
      const btnReset = document.getElementById('btnResetWhFilters');

      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const type = typeFilter ? typeFilter.value : 'all';
      const st = statusFilter ? statusFilter.value : 'all';

      const filtered = UanifyState.warehouses.filter(wh => {
        const matchSearch = !q ||
          wh.name.toLowerCase().includes(q) ||
          wh.code.toLowerCase().includes(q) ||
          wh.location.toLowerCase().includes(q) ||
          wh.items.toLowerCase().includes(q);
        const matchType = type === 'all' || wh.type.includes(type);
        const matchStatus = st === 'all' || wh.status.includes(st);
        return matchSearch && matchType && matchStatus;
      });

      if (countBadge) {
        countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.warehouses.length} almacenes`;
      }

      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr class="table-empty-row">
            <td colspan="8">
              <div class="table-empty-content">
                <span class="table-empty-icon">🔍</span>
                <span class="table-empty-title">No se encontraron almacenes coincidentes</span>
                <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
                <button type="button" class="btn-reset-filters" onclick="window.resetWhFilters()">🔄 Limpiar Filtros</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = filtered.map(wh => {
          let statusPillClass = 'status-active';
          if (wh.statusClass && wh.statusClass.includes('amber')) statusPillClass = 'status-warning';
          else if (wh.statusClass && wh.statusClass.includes('red')) statusPillClass = 'status-danger';

          return `
            <tr>
              <td class="col-code"><span class="table-badge-code">${wh.code}</span></td>
              <td class="col-name">
                <div class="table-cell-primary">${wh.name}</div>
                <span class="table-cell-subtext">📍 ${wh.location}</span>
              </td>
              <td><span class="badge-subtle">${wh.type}</span></td>
              <td><strong style="font-size:13.5px; font-family:'JetBrains Mono';">${wh.stock}</strong></td>
              <td style="font-size:12px; max-width:280px; color:var(--text-secondary);">${wh.items}</td>
              <td>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:11.5px; font-weight:700;">${wh.capPercent}%</span>
                  <div class="progress-track" style="width:60px; height:5px;">
                    <div class="progress-fill fill-brand" style="width:${wh.capPercent}%;"></div>
                  </div>
                </div>
              </td>
              <td class="col-status">
                <span class="table-status-pill ${statusPillClass}">
                  <span class="status-dot"></span>${wh.status}
                </span>
              </td>
              <td class="col-actions">
                <div class="action-btns-cell">
                  <button type="button" class="btn-table-action btn-action-view" onclick="window.viewWarehouseDetails('${wh.code}')" title="Ver lotes e inventario">
                    👁️ Ver Lotes
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }

      if (!whFiltersBound) {
        whFiltersBound = true;
        if (searchInput) searchInput.addEventListener('input', renderWarehousesTable);
        if (typeFilter) typeFilter.addEventListener('change', renderWarehousesTable);
        if (statusFilter) statusFilter.addEventListener('change', renderWarehousesTable);
        if (btnReset) {
          btnReset.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (typeFilter) typeFilter.value = 'all';
            if (statusFilter) statusFilter.value = 'all';
            renderWarehousesTable();
          });
        }
        window.resetWhFilters = function() {
          if (searchInput) searchInput.value = '';
          if (typeFilter) typeFilter.value = 'all';
          if (statusFilter) statusFilter.value = 'all';
          renderWarehousesTable();
        };
      }
    }
    renderWarehousesTable();

    // ── 1. Catálogo Oficial de Sombreros (con Filtros, Ficha Técnica y Fotos - RF-67) ──
    const hatsTableBody = document.getElementById('tblInventoryHatsBody');
    let hatFiltersBound = false;

    function renderHatCatalogTable() {
      if (!hatsTableBody || !UanifyState.hatCatalog) return;
      const searchInput = document.getElementById('hatSearchInput');
      const materialFilter = document.getElementById('hatMaterialFilter');
      const statusFilter = document.getElementById('hatStatusFilter');
      const countBadge = document.getElementById('hatFilteredCountBadge');
      const btnReset = document.getElementById('btnResetHatFilters');

      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const mat = materialFilter ? materialFilter.value : 'all';
      const st = statusFilter ? statusFilter.value : 'all';

      const filtered = UanifyState.hatCatalog.filter(h => {
        const matchSearch = !q ||
          h.name.toLowerCase().includes(q) ||
          h.code.toLowerCase().includes(q) ||
          (h.family && h.family.toLowerCase().includes(q)) ||
          (h.material && h.material.toLowerCase().includes(q)) ||
          (h.moldName && h.moldName.toLowerCase().includes(q)) ||
          (h.crown && h.crown.toLowerCase().includes(q));
        const matchMat = mat === 'all' || (h.family && h.family.toLowerCase().includes(mat.toLowerCase())) || (h.material && h.material.toLowerCase().includes(mat.toLowerCase()));
        const matchStatus = st === 'all' || h.status === st;
        return matchSearch && matchMat && matchStatus;
      });

      if (countBadge) {
        countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.hatCatalog.length} modelos`;
      }

      if (filtered.length === 0) {
        hatsTableBody.innerHTML = `
          <tr class="table-empty-row">
            <td colspan="8">
              <div class="table-empty-content">
                <span class="table-empty-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <span class="table-empty-title">No se encontraron modelos de sombrero coincidentes</span>
                <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
                <button type="button" class="btn-reset-filters" onclick="window.resetHatFilters()">Limpiar Filtros</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        hatsTableBody.innerHTML = filtered.map(h => {
          const isActive = h.status === 'Activo';
          const sizeChips = (h.sizes || []).map(s => `<span class="hat-size-chip">${s}</span>`).join('');
          return `
            <tr>
              <td class="col-code"><span class="table-badge-code">${h.code}</span></td>
              <td class="col-name">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div class="table-thumb-wrapper" onclick="window.openHatTechnicalSheet('${h.id}')" title="Ver ficha técnica" style="cursor:pointer;">
                    <img src="${h.photo}" class="table-thumb-img" alt="${h.name}">
                  </div>
                  <div>
                    <div class="table-cell-primary" style="cursor:pointer;" onclick="window.openHatTechnicalSheet('${h.id}')">${h.name}</div>
                    <span class="table-cell-subtext">${h.material} · ${h.category}</span>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-size:12px;"><strong>Copa:</strong> ${h.crown || 'Regular'}</div>
                <div style="font-size:11.5px; color:var(--text-secondary);"><strong>Falda:</strong> ${h.brim || '4 1/4"'}</div>
              </td>
              <td>
                <div class="hat-variations-cell">${sizeChips}</div>
              </td>
              <td>
                <span class="badge-subtle" style="font-family:'JetBrains Mono'; font-weight:700;">${h.moldName || h.moldCode || 'Horma Std'}</span>
              </td>
              <td>
                <strong style="color:var(--color-green); font-family:'JetBrains Mono'; font-size:13px;">$${Number(h.price || 1310).toLocaleString()} MXN</strong>
              </td>
              <td class="col-status">
                <span class="table-status-pill ${isActive ? 'status-active' : 'status-warning'}">
                  <span class="status-dot"></span>${h.status}
                </span>
              </td>
              <td class="col-actions">
                <div class="action-btns-cell">
                  <button type="button" class="btn-table-action btn-action-view" onclick="window.openHatTechnicalSheet('${h.id}')" title="Ver ficha técnica oficial con foto">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Ficha
                  </button>
                  <button type="button" class="btn-table-action btn-action-edit" onclick="window.editHat('${h.id}')" title="Editar especificaciones de modelo">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </button>
                  <button type="button" class="btn-table-action btn-action-delete" onclick="window.deleteHat('${h.id}')" title="Descontinuar modelo del catálogo">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Baja
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }

      if (!hatFiltersBound) {
        hatFiltersBound = true;
        if (searchInput) searchInput.addEventListener('input', renderHatCatalogTable);
        if (materialFilter) materialFilter.addEventListener('change', renderHatCatalogTable);
        if (statusFilter) statusFilter.addEventListener('change', renderHatCatalogTable);
        if (btnReset) {
          btnReset.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (materialFilter) materialFilter.value = 'all';
            if (statusFilter) statusFilter.value = 'all';
            renderHatCatalogTable();
          });
        }
        window.resetHatFilters = function() {
          if (searchInput) searchInput.value = '';
          if (materialFilter) materialFilter.value = 'all';
          if (statusFilter) statusFilter.value = 'all';
          renderHatCatalogTable();
        };
      }
    }
    renderHatCatalogTable();
    window.renderHatCatalogTable = renderHatCatalogTable;

    // ── 2. Tabla de moldes y hormas de aluminio (con Filtros, Foto y Ficha - RF-67) ──
    let moldFiltersBound = false;
    function renderInventoryMoldsTable() {
      if (!moldsTableBody || !UanifyState.molds) return;
      const searchInput = document.getElementById('moldSearchInput');
      const typeFilter = document.getElementById('moldTypeFilter');
      const statusFilter = document.getElementById('moldStatusFilter');
      const countBadge = document.getElementById('moldsFilteredCountBadge');
      const btnReset = document.getElementById('btnResetMoldFilters');

      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const type = typeFilter ? typeFilter.value : 'all';
      const st = statusFilter ? statusFilter.value : 'all';

      const filtered = UanifyState.molds.filter(m => {
        const matchSearch = !q ||
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          (m.machine && m.machine.toLowerCase().includes(q)) ||
          (m.material && m.material.toLowerCase().includes(q)) ||
          (m.alloy && m.alloy.toLowerCase().includes(q));
        const matchType = type === 'all' || (m.name && m.name.toLowerCase().includes(type.toLowerCase())) || (m.tipo && m.tipo.toLowerCase().includes(type.toLowerCase()));
        const matchStatus = st === 'all' || m.status === st;
        return matchSearch && matchType && matchStatus;
      });

      if (countBadge) {
        countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.molds.length} moldes`;
      }

      if (filtered.length === 0) {
        moldsTableBody.innerHTML = `
          <tr class="table-empty-row">
            <td colspan="9">
              <div class="table-empty-content">
                <span class="table-empty-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <span class="table-empty-title">No se encontraron moldes de horma coincidentes</span>
                <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
                <button type="button" class="btn-reset-filters" onclick="window.resetMoldFilters()">Limpiar Filtros</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        moldsTableBody.innerHTML = filtered.map(m => {
          const isAvailable = m.status === 'Disponible';
          const cyclePercent = Math.min(100, Math.round(((m.cycleCount || 0) / (m.maxCycles || 10000)) * 100));
          return `
            <tr>
              <td class="col-code"><span class="table-badge-code">${m.code}</span></td>
              <td class="col-name">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div class="table-thumb-wrapper" onclick="window.openMoldTechnicalSheet('${m.code}')" title="Ver ficha técnica de molde" style="cursor:pointer;">
                    <img src="${m.photo || ''}" class="table-thumb-img" alt="${m.name}">
                  </div>
                  <div>
                    <div class="table-cell-primary" style="cursor:pointer;" onclick="window.openMoldTechnicalSheet('${m.code}')">${m.name}</div>
                    <span class="table-cell-subtext">Copa ${m.crown || 'Regular'} · Falda ${m.brim || '4 1/4"'}</span>
                  </div>
                </div>
              </td>
              <td><span class="badge-subtle">${m.tipo || 'Horma Texana'}</span></td>
              <td><strong>${m.size}</strong></td>
              <td style="font-size:12px;">${m.alloy || m.material || 'Aluminio Maquinado'}</td>
              <td><span style="font-size:12px; font-family:'JetBrains Mono'; font-weight:700;">${m.machine || 'Prensa Vapor'}</span></td>
              <td>
                <div style="min-width:110px;">
                  <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:3px; font-family:'JetBrains Mono';">
                    <span>${(m.cycleCount || 0).toLocaleString()} / ${(m.maxCycles || 10000).toLocaleString()}</span>
                    <span style="color:var(--text-muted); font-size:10px;">${cyclePercent}%</span>
                  </div>
                  <div class="progress-track" style="height:5px;">
                    <div class="progress-fill fill-brand" style="width:${cyclePercent}%;"></div>
                  </div>
                </div>
              </td>
              <td class="col-status">
                <span class="table-status-pill ${isAvailable ? 'status-active' : 'status-warning'}">
                  <span class="status-dot"></span>${m.status}
                </span>
              </td>
              <td class="col-actions">
                <div class="action-btns-cell">
                  <button type="button" class="btn-table-action btn-action-view" onclick="window.openMoldTechnicalSheet('${m.code}')" title="Ver ficha técnica y ciclos de prensado">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Ficha
                  </button>
                  <button type="button" class="btn-table-action btn-action-edit" onclick="window.editMold('${m.code}')" title="Editar especificación de molde">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </button>
                  <button type="button" class="btn-table-action btn-action-delete" onclick="window.deleteMold('${m.code}')" title="Dar de baja molde">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Baja
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }

      if (!moldFiltersBound) {
        moldFiltersBound = true;
        if (searchInput) searchInput.addEventListener('input', renderInventoryMoldsTable);
        if (typeFilter) typeFilter.addEventListener('change', renderInventoryMoldsTable);
        if (statusFilter) statusFilter.addEventListener('change', renderInventoryMoldsTable);
        if (btnReset) {
          btnReset.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (typeFilter) typeFilter.value = 'all';
            if (statusFilter) statusFilter.value = 'all';
            renderInventoryMoldsTable();
          });
        }
        window.resetMoldFilters = function() {
          if (searchInput) searchInput.value = '';
          if (typeFilter) typeFilter.value = 'all';
          if (statusFilter) statusFilter.value = 'all';
          renderInventoryMoldsTable();
        };
      }
    }
    renderInventoryMoldsTable();
    window.renderInventoryMoldsTable = renderInventoryMoldsTable;

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

    // Kárdex de movimientos de almacén (con Filtros y Acciones - Regla 0.35)
    const kardexBody = document.getElementById('inventoryKardexTableBody');
    let kardexFiltersBound = false;
    function renderInventoryKardexTable() {
      if (!kardexBody || !UanifyState.inventoryMovements) return;
      const searchInput = document.getElementById('kardexSearchInput');
      const typeFilter = document.getElementById('kardexTypeFilter');
      const countBadge = document.getElementById('kardexFilteredCountBadge');
      const btnReset = document.getElementById('btnResetKardexFilters');

      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const type = typeFilter ? typeFilter.value : 'all';

      const filtered = UanifyState.inventoryMovements.filter(m => {
        const matchSearch = !q ||
          m.item.toLowerCase().includes(q) ||
          m.origin.toLowerCase().includes(q) ||
          m.dest.toLowerCase().includes(q) ||
          m.user.toLowerCase().includes(q) ||
          m.doc.toLowerCase().includes(q);
        const matchType = type === 'all' || m.type.includes(type);
        return matchSearch && matchType;
      });

      if (countBadge) {
        countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.inventoryMovements.length} movimientos`;
      }

      if (filtered.length === 0) {
        kardexBody.innerHTML = `
          <tr class="table-empty-row">
            <td colspan="8">
              <div class="table-empty-content">
                <span class="table-empty-icon">🔍</span>
                <span class="table-empty-title">No se encontraron movimientos registrados</span>
                <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
                <button type="button" class="btn-reset-filters" onclick="window.resetKardexFilters()">🔄 Limpiar Filtros</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        kardexBody.innerHTML = filtered.map(m => {
          let typeBadge = '<span class="badge-subtle">Traspaso WIP</span>';
          if (m.type.includes('Entrada')) typeBadge = '<span class="badge-status" style="background:var(--color-green-bg); color:var(--color-green); border:1px solid var(--color-green-border);">📥 Entrada MP</span>';
          else if (m.type.includes('Salida')) typeBadge = '<span class="badge-status" style="background:var(--color-blue-bg); color:var(--color-blue); border:1px solid var(--color-blue-border);">🚚 Embarque</span>';
          else if (m.type.includes('Merma') || m.type.includes('Segundas')) typeBadge = '<span class="badge-status" style="background:var(--color-amber-bg); color:var(--color-amber); border:1px solid var(--color-amber-border);">⚠️ Saldos</span>';
          else if (m.type.includes('Fraccionamiento')) typeBadge = '<span class="badge-status" style="background:var(--color-purple-bg, #FAF5FF); color:var(--color-purple, #7E22CE); border:1px solid var(--color-purple-border, #E9D5FF);">✂️ Rampa</span>';

          return `
            <tr>
              <td class="col-code"><span class="table-badge-code">${m.time}</span></td>
              <td class="col-name">${typeBadge}</td>
              <td><span style="font-weight:600; font-size:12px;">${m.origin}</span></td>
              <td><strong style="font-weight:700; font-size:12px; color:var(--color-brand);">→ ${m.dest}</strong></td>
              <td><strong>${m.item}</strong></td>
              <td><strong style="font-family:'JetBrains Mono'; font-size:13px;">${m.qty}</strong></td>
              <td><span style="font-size:11.5px; color:var(--text-secondary);">👤 ${m.user}</span></td>
              <td class="col-status"><span class="table-badge-code" style="color:var(--text-primary); font-size:11px;">${m.doc}</span></td>
              <td class="col-actions">
                <div class="action-btns-cell">
                  <button type="button" class="btn-table-action btn-action-view" onclick="window.viewKardexDoc('${m.doc}', '${m.item}')" title="Ver vale de traspaso">
                    👁️ Detalle
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }

      if (!kardexFiltersBound) {
        kardexFiltersBound = true;
        if (searchInput) searchInput.addEventListener('input', renderInventoryKardexTable);
        if (typeFilter) typeFilter.addEventListener('change', renderInventoryKardexTable);
        if (btnReset) {
          btnReset.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (typeFilter) typeFilter.value = 'all';
            renderInventoryKardexTable();
          });
        }
        window.resetKardexFilters = function() {
          if (searchInput) searchInput.value = '';
          if (typeFilter) typeFilter.value = 'all';
          renderInventoryKardexTable();
        };
      }
    }
    renderInventoryKardexTable();
  }

  // Helpers para acciones en almacén
  window.viewWarehouseDetails = function(whCode) {
    const wh = (UanifyState.warehouses || []).find(w => w.code === whCode);
    if (!wh) return;
    window.UanifyUI.toast(
      `Almacén ${wh.name} (${wh.code}) en ${wh.location}. Existencias: ${wh.stock}. Custodia: ${wh.items}. Ocupación: ${wh.capPercent}%.`,
      'info',
      '📦 Detalle de Almacén'
    );
  };

  window.viewKardexDoc = function(docFolio, item) {
    window.UanifyUI.toast(
      `Vale oficial ${docFolio} registrado en Kárdex. Movimiento verificado por Logística MES para ${item || 'lote'}.`,
      'info',
      '📋 Vale de Movimiento'
    );
  };

  // ── GESTIÓN DE FOTOGRAFÍAS Y MODALES DE CATÁLOGO (RF-67) ──
  function initPhotoUploads() {
    // Configuración de foto para Sombreros
    const hatDropzone = document.getElementById('hatPhotoDropzone');
    const hatFileInput = document.getElementById('hatPhotoFileInput');
    const hatPrompt = document.getElementById('hatPhotoDropzonePrompt');
    const hatPreviewWrap = document.getElementById('hatPhotoPreviewWrap');
    const hatPreviewImg = document.getElementById('hatPhotoPreviewImg');
    const hatPhotoData = document.getElementById('newHatPhotoData');
    const btnRemoveHat = document.getElementById('btnRemoveHatPhoto');

    if (hatDropzone && hatFileInput) {
      hatDropzone.addEventListener('click', (e) => {
        if (e.target.closest('#btnRemoveHatPhoto')) return;
        hatFileInput.click();
      });

      hatDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        hatDropzone.classList.add('dragover');
      });

      hatDropzone.addEventListener('dragleave', () => {
        hatDropzone.classList.remove('dragover');
      });

      hatDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        hatDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleHatFile(e.dataTransfer.files[0]);
        }
      });

      hatFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleHatFile(e.target.files[0]);
        }
      });

      function handleHatFile(file) {
        if (!file.type.startsWith('image/')) {
          window.UanifyUI.toast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).', 'warning');
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target.result;
          if (hatPhotoData) hatPhotoData.value = dataUrl;
          if (hatPreviewImg) hatPreviewImg.src = dataUrl;
          if (hatPrompt) hatPrompt.style.display = 'none';
          if (hatPreviewWrap) hatPreviewWrap.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }

      if (btnRemoveHat) {
        btnRemoveHat.addEventListener('click', (e) => {
          e.stopPropagation();
          if (hatFileInput) hatFileInput.value = '';
          if (hatPhotoData) hatPhotoData.value = '';
          if (hatPreviewImg) hatPreviewImg.src = '';
          if (hatPreviewWrap) hatPreviewWrap.style.display = 'none';
          if (hatPrompt) hatPrompt.style.display = 'flex';
        });
      }
    }

    // Configuración de foto para Moldes / Hormas
    const moldDropzone = document.getElementById('moldPhotoDropzone');
    const moldFileInput = document.getElementById('moldPhotoFileInput');
    const moldPrompt = document.getElementById('moldPhotoDropzonePrompt');
    const moldPreviewWrap = document.getElementById('moldPhotoPreviewWrap');
    const moldPreviewImg = document.getElementById('moldPhotoPreviewImg');
    const btnRemoveMold = document.getElementById('btnRemoveMoldPhoto');
    let currentMoldPhotoBase64 = '';

    if (moldDropzone && moldFileInput) {
      moldDropzone.addEventListener('click', (e) => {
        if (e.target.closest('#btnRemoveMoldPhoto')) return;
        moldFileInput.click();
      });

      moldDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        moldDropzone.classList.add('dragover');
      });

      moldDropzone.addEventListener('dragleave', () => {
        moldDropzone.classList.remove('dragover');
      });

      moldDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        moldDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleMoldFile(e.dataTransfer.files[0]);
        }
      });

      moldFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleMoldFile(e.target.files[0]);
        }
      });

      function handleMoldFile(file) {
        if (!file.type.startsWith('image/')) {
          window.UanifyUI.toast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).', 'warning');
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          currentMoldPhotoBase64 = ev.target.result;
          if (moldPreviewImg) moldPreviewImg.src = currentMoldPhotoBase64;
          if (moldPrompt) moldPrompt.style.display = 'none';
          if (moldPreviewWrap) moldPreviewWrap.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }

      if (btnRemoveMold) {
        btnRemoveMold.addEventListener('click', (e) => {
          e.stopPropagation();
          if (moldFileInput) moldFileInput.value = '';
          currentMoldPhotoBase64 = '';
          if (moldPreviewImg) moldPreviewImg.src = '';
          if (moldPreviewWrap) moldPreviewWrap.style.display = 'none';
          if (moldPrompt) moldPrompt.style.display = 'flex';
        });
      }

      window.getUploadedMoldPhoto = () => currentMoldPhotoBase64;
      window.setUploadedMoldPhoto = (url) => {
        currentMoldPhotoBase64 = url;
        if (url) {
          if (moldPreviewImg) moldPreviewImg.src = url;
          if (moldPrompt) moldPrompt.style.display = 'none';
          if (moldPreviewWrap) moldPreviewWrap.style.display = 'block';
        } else {
          if (moldFileInput) moldFileInput.value = '';
          if (moldPreviewImg) moldPreviewImg.src = '';
          if (moldPreviewWrap) moldPreviewWrap.style.display = 'none';
          if (moldPrompt) moldPrompt.style.display = 'flex';
        }
      };
    }
  }

  // ── MODALES Y CRUD DE CATÁLOGOS (RF-67) ──
  function initCatalogModals() {
    // Modal Registrar Sombrero
    const btnOpenHat = document.getElementById('btnOpenRegisterHatModal');
    const modalHat = document.getElementById('modalRegisterHat');
    const btnCloseHat = document.getElementById('btnCloseRegisterHatModal');
    const btnCancelHat = document.getElementById('btnCancelRegisterHatModal');
    const formHat = document.getElementById('formRegisterHat');

    if (btnOpenHat && modalHat) {
      btnOpenHat.addEventListener('click', () => {
        document.getElementById('hatEditMode').value = 'create';
        document.getElementById('origHatId').value = '';
        document.getElementById('modalRegisterHatTitle').textContent = 'Registrar Modelo de Sombrero';
        if (formHat) formHat.reset();
        const codeInput = document.getElementById('newHatCode');
        if (codeInput) codeInput.value = `SOM-0${(UanifyState.hatCatalog || []).length + 1}`;
        const removePhotoBtn = document.getElementById('btnRemoveHatPhoto');
        if (removePhotoBtn) removePhotoBtn.click();
        modalHat.style.display = 'flex';
      });
    }

    const closeHatModal = () => { if (modalHat) modalHat.style.display = 'none'; };
    if (btnCloseHat) btnCloseHat.addEventListener('click', closeHatModal);
    if (btnCancelHat) btnCancelHat.addEventListener('click', closeHatModal);

    if (formHat) {
      formHat.addEventListener('submit', (e) => {
        e.preventDefault();
        const editMode = document.getElementById('hatEditMode').value;
        const origId = document.getElementById('origHatId').value;
        const code = document.getElementById('newHatCode').value.trim();
        const name = document.getElementById('newHatName').value.trim();
        const family = document.getElementById('newHatFamily').value;
        const price = parseFloat(document.getElementById('newHatPrice').value) || 1310;
        const crown = document.getElementById('newHatCrown').value.trim();
        const brim = document.getElementById('newHatBrim').value.trim();
        const band = document.getElementById('newHatBand').value.trim();
        const moldCode = document.getElementById('newHatMold').value;
        const moldObj = (UanifyState.molds || []).find(m => m.code === moldCode);
        const moldName = moldObj ? moldObj.name : moldCode;
        const photoData = document.getElementById('newHatPhotoData').value;

        const checkedSizes = [];
        document.querySelectorAll('.hat-size-cb:checked').forEach(cb => checkedSizes.push(cb.value));

        const photoUrl = photoData || 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><defs><linearGradient id="cG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#EAD7BB"/><stop offset="100%" stop-color="#B8976C"/></linearGradient></defs><rect width="100%" height="100%" fill="#F8FAFC" rx="12"/><ellipse cx="200" cy="225" rx="140" ry="16" fill="#000" opacity="0.12"/><path d="M 40 185 C 80 225, 320 225, 360 185 C 330 170, 270 195, 200 195 C 130 195, 70 170, 40 185 Z" fill="#B8976C" stroke="#8C6843" stroke-width="2"/><path d="M 125 185 C 120 115, 140 70, 165 65 C 185 62, 200 82, 200 82 C 200 82, 215 62, 235 65 C 260 70, 280 115, 275 185 Z" fill="url(#cG)" stroke="#8C6843" stroke-width="2"/><path d="M 124 175 Q 200 190 276 175 L 275 186 Q 200 200 125 186 Z" fill="#3E2713"/></svg>');

        if (editMode === 'edit') {
          const item = (UanifyState.hatCatalog || []).find(h => h.id === origId);
          if (item) {
            item.code = code;
            item.name = name;
            item.family = family;
            item.material = `${family} Fino Especial`;
            item.price = price;
            item.crown = crown;
            item.brim = brim;
            item.band = band;
            item.moldCode = moldCode;
            item.moldName = moldName;
            item.sizes = checkedSizes.length ? checkedSizes : ['55', '56', '57', '58'];
            if (photoData) item.photo = photoUrl;
            window.UanifyUI.toast(`Modelo "${name}" actualizado correctamente en el catálogo.`, 'success', 'Ficha Actualizada');
          }
        } else {
          const newHat = {
            id: `SOM-${String((UanifyState.hatCatalog || []).length + 1).padStart(2, '0')}`,
            code,
            name,
            family,
            material: `${family} Calidad Exportación`,
            category: 'Texana Fina San Francisco del Rincón',
            crown,
            brim,
            band,
            moldCode,
            moldName,
            sizes: checkedSizes.length ? checkedSizes : ['55', '56', '57', '58'],
            taktTime: '42s / estación',
            price,
            status: 'Activo',
            finish: 'Nitrocelulósica Satinada',
            photo: photoUrl,
            notes: 'Registrado desde la consola industrial Uanify MES.'
          };
          UanifyState.hatCatalog.push(newHat);
          window.UanifyUI.toast(`Modelo "${name}" (${code}) registrado exitosamente con ficha técnica y foto.`, 'success', 'Nuevo Modelo Registrado');
        }

        closeHatModal();
        if (typeof window.renderHatCatalogTable === 'function') window.renderHatCatalogTable();
      });
    }

    // Modales de Fichas Técnicas
    const sheetHatModal = document.getElementById('modalHatTechnicalSheet');
    const btnCloseHatSheet = document.getElementById('btnCloseHatSheetModal');
    const btnOkHatSheet = document.getElementById('btnOkHatSheetModal');
    const btnPrintHatSheet = document.getElementById('btnPrintHatTechnicalSheet');

    const closeHatSheet = () => { if (sheetHatModal) sheetHatModal.style.display = 'none'; };
    if (btnCloseHatSheet) btnCloseHatSheet.addEventListener('click', closeHatSheet);
    if (btnOkHatSheet) btnOkHatSheet.addEventListener('click', closeHatSheet);
    if (btnPrintHatSheet) {
      btnPrintHatSheet.addEventListener('click', () => {
        window.UanifyUI.toast('Enviando ficha técnica de producto a la impresora de Ingeniería...', 'info', 'Impresión de Ficha Técnica');
      });
    }

    const sheetMoldModal = document.getElementById('modalMoldTechnicalSheet');
    const btnCloseMoldSheet = document.getElementById('btnCloseMoldSheetModal');
    const btnOkMoldSheet = document.getElementById('btnOkMoldSheetModal');

    const closeMoldSheet = () => { if (sheetMoldModal) sheetMoldModal.style.display = 'none'; };
    if (btnCloseMoldSheet) btnCloseMoldSheet.addEventListener('click', closeMoldSheet);
    if (btnOkMoldSheet) btnOkMoldSheet.addEventListener('click', closeMoldSheet);

    // Modal Registrar Mold
    const formMold = document.getElementById('formRegisterMold');
    if (formMold) {
      formMold.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('newMoldCode').value.trim();
        const name = document.getElementById('newMoldName').value.trim();
        const tipo = document.getElementById('newMoldType').value;
        const size = document.getElementById('newMoldSize').value.trim();
        const alloy = document.getElementById('newMoldAlloy').value.trim();
        const machine = document.getElementById('newMoldLocation').value;
        const temp = document.getElementById('newMoldTemp').value.trim();
        const status = document.getElementById('newMoldStatus').value;
        const photo = (typeof window.getUploadedMoldPhoto === 'function' && window.getUploadedMoldPhoto()) ||
          'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><rect width="100%" height="100%" fill="#0F172A" rx="12"/><rect x="70" y="215" width="260" height="24" rx="4" fill="#334155"/><path d="M 90 215 C 105 180, 130 190, 140 140 C 145 100, 165 75, 185 70 C 200 68, 205 82, 205 82 C 205 82, 210 68, 225 70 C 245 75, 265 100, 270 140 C 280 190, 305 180, 320 215 Z" fill="#94A3B8" stroke="#F8FAFC" stroke-width="2"/><text x="200" y="186" fill="#38BDF8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">' + code + '</text></svg>');

        const existing = (UanifyState.molds || []).find(m => m.code === code);
        if (existing) {
          existing.name = name;
          existing.tipo = tipo;
          existing.size = size;
          existing.alloy = alloy;
          existing.machine = machine;
          existing.operatingTemp = temp;
          existing.status = status;
          if (photo) existing.photo = photo;
          window.UanifyUI.toast(`Horma "${name}" actualizada en el catálogo maestro.`, 'success', 'Molde Actualizado');
        } else {
          UanifyState.molds.push({
            code,
            name,
            tipo,
            size,
            alloy,
            material: alloy,
            machine,
            operatingTemp: temp,
            pressure: '70 PSI Continuos',
            status,
            crown: '4 1/4" Regular',
            brim: '4 1/4" Doblado Abajo',
            cycleCount: 0,
            maxCycles: 10000,
            lastMaint: 'Fecha de Alta',
            photo
          });
          window.UanifyUI.toast(`Horma "${name}" (${code}) registrada en catálogo de moldes maquinados con foto técnica.`, 'success', 'Molde Registrado');
        }

        const modalRegisterMold = document.getElementById('modalRegisterMold');
        if (modalRegisterMold) modalRegisterMold.classList.remove('active');
        if (typeof window.renderInventoryMoldsTable === 'function') window.renderInventoryMoldsTable();
      });
    }

    // Operaciones globales edit / delete para sombreros y moldes
    window.editHat = function(hatId) {
      const hat = (UanifyState.hatCatalog || []).find(h => h.id === hatId);
      if (!hat) return;
      const modalHat = document.getElementById('modalRegisterHat');
      if (!modalHat) return;

      document.getElementById('hatEditMode').value = 'edit';
      document.getElementById('origHatId').value = hat.id;
      document.getElementById('modalRegisterHatTitle').textContent = `Editar Modelo · ${hat.name}`;
      document.getElementById('newHatCode').value = hat.code;
      document.getElementById('newHatName').value = hat.name;
      document.getElementById('newHatFamily').value = hat.family;
      document.getElementById('newHatPrice').value = hat.price;
      document.getElementById('newHatCrown').value = hat.crown;
      document.getElementById('newHatBrim').value = hat.brim;
      document.getElementById('newHatBand').value = hat.band;
      document.getElementById('newHatMold').value = hat.moldCode;

      // Checkboxes de tallas
      document.querySelectorAll('.hat-size-cb').forEach(cb => {
        cb.checked = (hat.sizes || []).includes(cb.value);
      });

      // Preview de foto
      const hatPhotoData = document.getElementById('newHatPhotoData');
      const hatPreviewImg = document.getElementById('hatPhotoPreviewImg');
      const hatPreviewWrap = document.getElementById('hatPhotoPreviewWrap');
      const hatPrompt = document.getElementById('hatPhotoDropzonePrompt');
      if (hatPhotoData) hatPhotoData.value = hat.photo || '';
      if (hatPreviewImg) hatPreviewImg.src = hat.photo || '';
      if (hatPrompt) hatPrompt.style.display = hat.photo ? 'none' : 'flex';
      if (hatPreviewWrap) hatPreviewWrap.style.display = hat.photo ? 'block' : 'none';

      modalHat.style.display = 'flex';
    };

    window.deleteHat = function(hatId) {
      const hat = (UanifyState.hatCatalog || []).find(h => h.id === hatId);
      if (!hat) return;
      window.UanifyUI.confirm(
        '¿Descontinuar Modelo de Sombrero?',
        `¿Confirmas dar de baja del catálogo activo al modelo "${hat.name}" (${hat.code})? Su historial de órdenes pasadas se mantendrá intacto.`,
        () => {
          hat.status = 'Descontinuado';
          if (typeof window.renderHatCatalogTable === 'function') window.renderHatCatalogTable();
          window.UanifyUI.toast(`Modelo "${hat.name}" marcado como descontinuado.`, 'info', 'Catálogo Actualizado');
        },
        'Sí, Descontinuar',
        'Cancelar'
      );
    };

    window.editMold = function(moldCode) {
      const mold = (UanifyState.molds || []).find(m => m.code === moldCode);
      if (!mold) return;
      const modalRegisterMold = document.getElementById('modalRegisterMold');
      if (!modalRegisterMold) return;

      document.getElementById('newMoldCode').value = mold.code;
      document.getElementById('newMoldName').value = mold.name;
      document.getElementById('newMoldType').value = mold.tipo || 'Denver';
      document.getElementById('newMoldSize').value = mold.size;
      document.getElementById('newMoldAlloy').value = mold.alloy || mold.material || 'Aluminio Maquinado 6061-T6';
      document.getElementById('newMoldLocation').value = mold.machine;
      document.getElementById('newMoldTemp').value = mold.operatingTemp || '115°C - 125°C';
      document.getElementById('newMoldStatus').value = mold.status;

      if (typeof window.setUploadedMoldPhoto === 'function') {
        window.setUploadedMoldPhoto(mold.photo || '');
      }

      modalRegisterMold.classList.add('active');
    };

    window.deleteMold = function(moldCode) {
      const mold = (UanifyState.molds || []).find(m => m.code === moldCode);
      if (!mold) return;
      window.UanifyUI.confirm(
        '¿Dar de Baja Horma de Aluminio?',
        `¿Confirmas la baja técnica de la horma "${mold.name}" (${mold.code}) de la prensa "${mold.machine}"?`,
        () => {
          mold.status = 'Mantenimiento';
          if (typeof window.renderInventoryMoldsTable === 'function') window.renderInventoryMoldsTable();
          window.UanifyUI.toast(`Horma "${mold.name}" retirada de servicio a taller de mantenimiento.`, 'info', 'Horma en Mantenimiento');
        },
        'Sí, Dar de Baja',
        'Cancelar'
      );
    };
  }

  // ── FICHA TÉCNICA OFICIAL DE SOMBRERO ──
  window.openHatTechnicalSheet = function(hatId) {
    const hat = (UanifyState.hatCatalog || []).find(h => h.id === hatId || h.code === hatId);
    const modal = document.getElementById('modalHatTechnicalSheet');
    if (!hat || !modal) return;

    const title = document.getElementById('hatTechnicalSheetTitle');
    const img = document.getElementById('hatSheetImg');
    const pName = document.getElementById('hatSheetPhotoName');
    const pMat = document.getElementById('hatSheetPhotoMaterial');
    const pCode = document.getElementById('hatSheetPhotoCode');
    const pPrice = document.getElementById('hatSheetPhotoPrice');
    const crown = document.getElementById('hatSheetCrown');
    const brim = document.getElementById('hatSheetBrim');
    const band = document.getElementById('hatSheetBand');
    const finish = document.getElementById('hatSheetFinish');
    const mold = document.getElementById('hatSheetMold');
    const sizesCont = document.getElementById('hatSheetSizesContainer');

    if (title) title.textContent = `Ficha Técnica · ${hat.name}`;
    if (img) img.src = hat.photo || '';
    if (pName) pName.textContent = hat.name;
    if (pMat) pMat.textContent = `${hat.material} · ${hat.family}`;
    if (pCode) pCode.textContent = hat.code;
    if (pPrice) pPrice.textContent = `$${Number(hat.price || 1310).toLocaleString()} MXN`;
    if (crown) crown.textContent = hat.crown || '4 1/4" Tear Drop';
    if (brim) brim.textContent = hat.brim || '4 1/4" Curvada Arriba';
    if (band) band.textContent = hat.band || 'Toquilla Piel Vacuno';
    if (finish) finish.textContent = hat.finish || 'Nitrocelulósica Satinada';
    if (mold) mold.textContent = hat.moldName || hat.moldCode || '#58 DENVER MASTER';

    if (sizesCont) {
      sizesCont.innerHTML = (hat.sizes || []).map(s => `<span class="hat-size-chip">${s}</span>`).join('');
    }

    modal.style.display = 'flex';
  };

  // ── FICHA TÉCNICA DE MOLDE DE ALUMINIO ──
  window.openMoldTechnicalSheet = function(moldCode) {
    const mold = (UanifyState.molds || []).find(m => m.code === moldCode);
    const modal = document.getElementById('modalMoldTechnicalSheet');
    if (!mold || !modal) return;

    const title = document.getElementById('moldSheetTitle');
    const img = document.getElementById('moldSheetImg');
    const pCode = document.getElementById('moldSheetPhotoCode');
    const pName = document.getElementById('moldSheetPhotoName');
    const alloy = document.getElementById('moldSheetAlloy');
    const size = document.getElementById('moldSheetSize');
    const crown = document.getElementById('moldSheetCrown');
    const brim = document.getElementById('moldSheetBrim');
    const machine = document.getElementById('moldSheetMachine');
    const temp = document.getElementById('moldSheetTemp');
    const pressure = document.getElementById('moldSheetPressure');
    const cyclesText = document.getElementById('moldSheetCyclesText');
    const cyclesPercent = document.getElementById('moldSheetCyclesPercent');
    const cyclesBar = document.getElementById('moldSheetCyclesBar');
    const statusCont = document.getElementById('moldSheetStatusContainer');

    if (title) title.textContent = `Ficha Técnica de Molde · ${mold.name}`;
    if (img) img.src = mold.photo || '';
    if (pCode) pCode.textContent = mold.code;
    if (pName) pName.textContent = mold.name;
    if (alloy) alloy.textContent = mold.alloy || mold.material || 'Aluminio Maquinado 6061-T6';
    if (size) size.textContent = mold.size || '55 (6 7/8)';
    if (crown) crown.textContent = mold.crown || '4 1/4" Regular';
    if (brim) brim.textContent = mold.brim || '4 1/4" Doblado Abajo';
    if (machine) machine.textContent = mold.machine || 'Prensa Michelagnoli P-01';
    if (temp) temp.textContent = mold.operatingTemp || '115°C - 125°C';
    if (pressure) pressure.textContent = mold.pressure || '70 PSI Continuos';

    const cyc = mold.cycleCount || 0;
    const maxCyc = mold.maxCycles || 10000;
    const pct = Math.min(100, Math.round((cyc / maxCyc) * 100));

    if (cyclesText) cyclesText.textContent = `${cyc.toLocaleString()} / ${maxCyc.toLocaleString()}`;
    if (cyclesPercent) cyclesPercent.textContent = `${pct}%`;
    if (cyclesBar) cyclesBar.style.width = `${pct}%`;

    if (statusCont) {
      const isAvail = mold.status === 'Disponible' || mold.status === 'En Uso';
      statusCont.innerHTML = `<span class="table-status-pill ${isAvail ? 'status-active' : 'status-warning'}"><span class="status-dot"></span> ${mold.status}</span>`;
    }

    modal.style.display = 'flex';
  };

  window.renderInventorySection = renderInventorySection;

  // ── 3. RENDER DE PADRÓN DE OPERADORES DIRECTORY (REGLA 0.35) ─────────────
  function renderOperatorsDirectory() {
    const tableBody = document.getElementById('operatorsDirectoryTableBody');
    const searchInput = document.getElementById('operatorSearchInput');
    const deptFilter = document.getElementById('operatorDeptFilter');
    const statusFilter = document.getElementById('operatorStatusFilter');
    const badgeCount = document.getElementById('operatorsFilteredCountBadge');
    const btnReset = document.getElementById('btnResetOperatorFilters');
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

      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr class="table-empty-row">
            <td colspan="8">
              <div class="table-empty-content">
                <span class="table-empty-icon">🔍</span>
                <span class="table-empty-title">No se encontraron operadores coincidentes</span>
                <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
                <button type="button" class="btn-reset-filters" onclick="window.resetOperatorFilters()">🔄 Limpiar Filtros</button>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = filtered.map(op => {
        const pzas = op.pzasToday || Math.floor(Math.random() * 30 + 70);
        let statusClass = 'status-active';
        if (op.status === 'Incapacidad') statusClass = 'status-danger';
        else if (op.status === 'Capacitación') statusClass = 'status-warning';

        return `
          <tr>
            <td class="col-code"><span class="table-badge-code">${op.empId}</span></td>
            <td class="col-name">
              <div class="table-cell-primary">${op.name}</div>
            </td>
            <td><span class="badge-subtle">${op.deptCode} · ${op.deptName}</span></td>
            <td style="font-size:12px;">⚙️ ${op.machine}</td>
            <td><span style="font-size:11.5px; color:var(--text-secondary);">${op.shift || 'Turno Único'}</span></td>
            <td><strong style="color:var(--color-brand); font-size:13px;">${pzas} pzas</strong></td>
            <td class="col-status">
              <span class="table-status-pill ${statusClass}">
                <span class="status-dot"></span>${op.status}
              </span>
            </td>
            <td class="col-actions">
              <div class="action-btns-cell">
                <button type="button" class="btn-table-action btn-action-edit" onclick="window.openEditOperatorModal('${op.empId}')" title="Editar operador">
                  ✏️ Editar
                </button>
                <button type="button" class="btn-table-action btn-action-delete" onclick="window.deleteOperator('${op.empId}')" title="Eliminar operador">
                  🗑️ Baja
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
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (deptFilter) deptFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        doRender();
      });
    }

    window.resetOperatorFilters = function() {
      if (searchInput) searchInput.value = '';
      if (deptFilter) deptFilter.value = 'all';
      if (statusFilter) statusFilter.value = 'all';
      doRender();
    };

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
  initPhotoUploads();
  initCatalogModals();
  renderInventorySection();
  renderOperatorsDirectory();
  window.updateOperatorStats();

  if (window.initAndonView)     window.initAndonView();
  if (window.initTerminalView)  window.initTerminalView();
  if (window.initEngineerView)  window.initEngineerView();
  if (window.initExecutiveView) window.initExecutiveView();
  if (window.initConfigView)    window.initConfigView();
});
