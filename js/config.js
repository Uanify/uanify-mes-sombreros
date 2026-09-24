/**
 * UANIFY MES · CONFIGURACIÓN DE PLANTA & GESTIÓN DE USUARIOS Y OPERADORES (RBAC)
 * Tombstone Hats · San Francisco del Rincón, Guanajuato
 *
 * REGLAS DE NEGOCIO VALIDADAS:
 * ─ Meta semanal como métrica central de producción de planta.
 * ─ Operadores de planta: Padrón de mano de obra asignados a máquina. No son usuarios del sistema.
 * ─ Gestión de usuarios:
 *   - Administradores pueden crear Admins, Ingenieros y Supervisores.
 *   - Ingenieros pueden crear Supervisores únicamente (no otros ingenieros ni administradores).
 * ─ Todos los diálogos usan UanifyUI.toast y UanifyUI.confirm (prohibido alert nativo).
 */

window.initConfigView = function() {
  const tableBody = document.getElementById('cfgDepartmentsTable');
  const usersTableBody = document.getElementById('usersTableBody');
  const operatorsTableBody = document.getElementById('operatorsTableBody');
  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const cfgShiftGoal = document.getElementById('cfgShiftGoal');
  const cfgTaktTime = document.getElementById('cfgTaktTime');

  const AvailableModules = [
    { id: 'terminal',  name: 'Terminal de Supervisor' },
    { id: 'andon',     name: 'Tablero Andon (Piso)' },
    { id: 'inventory', name: 'Almacenes & Hormas' },
    { id: 'operators', name: 'Padrón de Operadores' },
    { id: 'engineer',  name: 'Consola de Ingeniería' },
    { id: 'executive', name: 'Dirección & COMPAC' },
    { id: 'config',    name: 'Configuración de Planta' }
  ];

  // ── 1. RENDER DE DEPARTAMENTOS ───────────────────────────────────────────
  function renderDepartmentsConfig() {
    if (!tableBody || !UanifyState || !UanifyState.stations) return;

    tableBody.innerHTML = UanifyState.stations.map((st, idx) => {
      const isQuality = st.type === 'calidad' || (st.code && st.code.startsWith('C-')) || st.id.startsWith('calidad') || st.id.includes('calidad');
      const isLogistics = st.type === 'logistica' || st.id.includes('almacen') || st.id.includes('logistica') || st.code === 'D-11';
      let badgeStyle = 'background:var(--color-green-bg); color:var(--color-green); border:1px solid var(--color-green-border);';
      let typeLabel = 'Proceso Productivo';
      if (isQuality) {
        badgeStyle = 'background:var(--color-amber-bg); color:var(--color-amber); border:1px solid var(--color-amber-border);';
        typeLabel = 'Control de Calidad';
      } else if (isLogistics) {
        badgeStyle = 'background:var(--color-blue-bg); color:var(--color-blue); border:1px solid var(--color-blue-border);';
        typeLabel = 'Logística y Almacén';
      }

      // Buscar operadores asignados a este departamento
      const deptOps = (UanifyState.operators || []).filter(op => 
        op.deptCode === st.code || op.department === st.name || (op.deptName && op.deptName === st.name)
      );
      const opsBadges = deptOps.length > 0
        ? deptOps.map(o => `<span class="badge-subtle" style="font-size:10.5px; margin-right:4px; display:inline-block; margin-bottom:2px;" title="${o.machine || ''}">👤 ${o.name.split(' ')[0]}</span>`).join('')
        : `<span style="color:var(--text-muted); font-size:11px;">1 asignado (${st.operator})</span>`;

      return `
        <tr>
          <td><strong style="font-family:'JetBrains Mono'; color:var(--color-brand);">${st.code || 'D-' + String(idx+1).padStart(2,'0')}</strong></td>
          <td><strong>${st.name}</strong></td>
          <td><span class="badge-subtle">${typeLabel}</span></td>
          <td><span style="font-family:'JetBrains Mono';">${st.cycleTime || '35s'}</span></td>
          <td>${st.target || 850} pzas</td>
          <td><strong>${st.operator}</strong></td>
          <td>${opsBadges}</td>
          <td><span class="badge-status" style="${badgeStyle}">Activo</span></td>
        </tr>
      `;
    }).join('');
  }

  // ── 2. RENDER DE USUARIOS Y ROLES (RBAC) ─────────────────────────────────
  function renderUsersTable() {
    if (!usersTableBody || !UanifyState || !UanifyState.users) return;

    usersTableBody.innerHTML = UanifyState.users.map(u => {
      let roleBadgeClass = 'role-badge-supervisor';
      if (u.role === 'admin') roleBadgeClass = 'role-badge-admin';
      else if (u.role === 'ingeniero') roleBadgeClass = 'role-badge-ingeniero';

      const permPills = u.permissions.map(p => {
        const mod = AvailableModules.find(m => m.id === p);
        return `<span class="perm-pill">${mod ? mod.name : p}</span>`;
      }).join(' ');

      // Contar operadores en los departamentos asignados
      let deptsInfo = '';
      if (u.assignedDepartments && (u.assignedDepartments.includes('*') || u.role === 'admin' || u.role === 'ingeniero')) {
        const totalOps = (UanifyState.operators || []).length;
        deptsInfo = `
          <div style="font-size:11px; font-weight:700; color:var(--color-brand); display:flex; align-items:center; gap:4px; margin-top:3px;">
            <span>👑 Acceso Global (14 Áreas)</span>
          </div>
          <small style="color:var(--text-muted); font-size:10.5px;">Supervisión total · ${totalOps} operadores</small>
        `;
      } else if (u.assignedDepartments && u.assignedDepartments.length > 0) {
        const pills = u.assignedDepartments.map(d => `<span class="badge-subtle" style="font-weight:700; font-size:10px; padding:2px 6px;">${d}</span>`).join(' ');
        const assignedOps = (UanifyState.operators || []).filter(o => u.assignedDepartments.includes(o.deptCode)).length;
        deptsInfo = `
          <div style="display:flex; flex-wrap:wrap; gap:3px; margin-top:3px; max-width:240px;">${pills}</div>
          <small style="display:block; color:var(--text-secondary); font-size:10.5px; margin-top:2px;">
            <strong>${u.assignedDepartments.length} depts</strong> asignados · <strong>${assignedOps} operadores</strong> a cargo
          </small>
        `;
      } else {
        deptsInfo = `<span style="font-size:11px; color:var(--text-muted);">Sin departamentos asignados</span>`;
      }

      return `
        <tr>
          <td>
            <strong>${u.name}</strong>
            <small style="display:block; color:var(--text-muted); font-size:11px;">${u.email}</small>
          </td>
          <td>
            <span class="role-badge ${roleBadgeClass}">${u.badge || u.roleName}</span>
          </td>
          <td>
            ${deptsInfo}
          </td>
          <td>
            <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:380px;">
              ${permPills}
            </div>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="openEditUserModal('${u.id}')">
                ✏️ Editar Usuario & Deptos
              </button>
              ${u.id !== 'admin-1' ? `
                <button class="btn-secondary" style="padding:4px 8px; font-size:11px; color:var(--color-red); border-color:var(--color-red-border);" onclick="deleteUser('${u.id}')" title="Eliminar usuario">
                  🗑️
                </button>
              ` : '<span style="font-size:10px; color:var(--text-muted); font-weight:700;">(Principal)</span>'}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    syncSidebarUserSelector();
  }

  // ── 3. RENDER DE PADRÓN DE OPERADORES DE PLANTA ──────────────────────────
  function renderOperatorsTable() {
    if (!operatorsTableBody || !UanifyState || !UanifyState.operators) return;

    operatorsTableBody.innerHTML = UanifyState.operators.map(op => {
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
          <td><strong style="font-family:'JetBrains Mono'; color:var(--color-brand); font-size:12px;">${op.empId}</strong></td>
          <td><strong>${op.name}</strong></td>
          <td><span class="badge-subtle">${op.deptCode} · ${op.deptName}</span></td>
          <td style="font-size:12px;">${op.machine}</td>
          <td><strong style="color:var(--color-brand);">${pzas} pzas</strong></td>
          <td><span class="badge-status" style="background:${statusBg}; color:${statusColor}; font-weight:700;">● ${op.status}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.openEditOperatorModal('${op.empId}')">✏️ Editar</button>
              <button class="btn-secondary" style="padding:4px 8px; font-size:11px; color:var(--color-red); border-color:var(--color-red-border);" onclick="window.deleteOperator('${op.empId}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Sincronizar el selector de usuario del sidebar
  function syncSidebarUserSelector() {
    const userSelect = document.getElementById('sidebarUserSelect');
    if (!userSelect || !UanifyState || !UanifyState.users) return;

    userSelect.innerHTML = UanifyState.users.map(u => `
      <option value="${u.id}" ${u.id === UanifyState.currentUser ? 'selected' : ''}>
        ${u.name} (${u.roleName})
      </option>
    `).join('');
  }

  renderDepartmentsConfig();
  renderUsersTable();
  renderOperatorsTable();

  // Escuchar cambio de pestañas para re-renderizar
  if (typeof EventBus !== 'undefined') {
    EventBus.on('tab-changed', (tab) => {
      if (tab === 'config') {
        renderDepartmentsConfig();
        renderUsersTable();
        renderOperatorsTable();
      }
    });
  }

  // ── Sincronización en vivo de los inputs del Horario de Turno
  const cfgShiftStart = document.getElementById('cfgShiftStart');
  const cfgShiftEnd = document.getElementById('cfgShiftEnd');
  const cfgShiftLunch = document.getElementById('cfgShiftLunch');
  const cfgShiftDays = document.getElementById('cfgShiftDays');
  const cfgShiftSummary = document.getElementById('cfgShiftSummary');

  function updateShiftSummaryPreview() {
    const start = cfgShiftStart?.value || '07:00';
    const end = cfgShiftEnd?.value || '15:30';
    const days = cfgShiftDays?.value || 'Lunes a Viernes';
    if (cfgShiftSummary) {
      cfgShiftSummary.value = `Turno Único (${start} - ${end} · ${days})`;
    }
  }

  [cfgShiftStart, cfgShiftEnd, cfgShiftDays].forEach(input => {
    if (input) input.addEventListener('input', updateShiftSummaryPreview);
  });

  // Cargar valores iniciales si están en UanifyState
  if (UanifyState.shiftSchedule) {
    if (cfgShiftStart) cfgShiftStart.value = UanifyState.shiftSchedule.start;
    if (cfgShiftEnd) cfgShiftEnd.value = UanifyState.shiftSchedule.end;
    if (cfgShiftLunch) cfgShiftLunch.value = UanifyState.shiftSchedule.lunch;
    if (cfgShiftDays) cfgShiftDays.value = UanifyState.shiftSchedule.days;
    updateShiftSummaryPreview();
  }

  // ── 4. GUARDAR PARÁMETROS GENERALES & HORARIO DE TURNO ───────────────────
  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      const newWeeklyGoal = parseInt(cfgShiftGoal ? cfgShiftGoal.value : 4250, 10);
      const newTakt = parseInt(cfgTaktTime ? cfgTaktTime.value : 42, 10);
      
      UanifyState.metaWeeklyTotal = newWeeklyGoal;
      UanifyState.metaShiftTotal = Math.round(newWeeklyGoal / 5);
      UanifyState.taktTimeSec = newTakt;

      // Guardar Horario Informativo del Turno
      const shiftStart = cfgShiftStart ? cfgShiftStart.value : '07:00';
      const shiftEnd = cfgShiftEnd ? cfgShiftEnd.value : '15:30';
      const shiftLunch = cfgShiftLunch ? cfgShiftLunch.value : '12:00 a 12:45 hrs';
      const shiftDays = cfgShiftDays ? cfgShiftDays.value : 'Lunes a Viernes';
      const shiftSummary = `Turno Único (${shiftStart} - ${shiftEnd} · ${shiftDays})`;

      UanifyState.shiftSchedule = {
        start: shiftStart,
        end: shiftEnd,
        lunch: shiftLunch,
        days: shiftDays,
        summary: shiftSummary
      };
      UanifyState.currentShift = shiftSummary;
      localStorage.setItem('uanify_shift_schedule', JSON.stringify(UanifyState.shiftSchedule));

      // Actualizar pie de barra lateral
      const shiftTitleEl = document.querySelector('.shift-title');
      if (shiftTitleEl) {
        shiftTitleEl.textContent = `Turno Único (${shiftStart} - ${shiftEnd})`;
      }

      const goalEl = document.getElementById('andonGoalTotal');
      const taktEl = document.getElementById('andonTaktTime');
      if (goalEl) goalEl.textContent = `${newWeeklyGoal.toLocaleString()} pzas/sem`;
      if (taktEl) taktEl.textContent = `${newTakt} seg/pza`;

      window.UanifyUI.toast(
        `Horario guardado: ${shiftStart} a ${shiftEnd} hrs (${shiftDays}). Meta Semanal: ${newWeeklyGoal.toLocaleString()} pzas (~${UanifyState.metaShiftTotal} pzas/día). Takt: ${newTakt}s.`,
        'success',
        '⏰ Horario y Configuración Guardados'
      );
    });
  }

  // ── 5. MODAL: CREAR NUEVO USUARIO (CON REGLA INGENIERO / ADMIN) ───────────
  const modalCreateUser = document.getElementById('modalCreateUser');
  const btnOpenCreate = document.getElementById('btnOpenCreateUserModal');
  const btnCloseCreate = document.getElementById('btnCloseCreateUserModal');
  const formCreateUser = document.getElementById('formCreateUser');
  const selectNewRole = document.getElementById('newRoleSelect');

  function configureUserRoleOptions() {
    const activeUser = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    if (!selectNewRole) return;

    if (activeUser.role === 'ingeniero') {
      // Ingenieros solo pueden crear supervisores
      selectNewRole.innerHTML = `
        <option value="supervisor" selected>Supervisor de Piso / Nave (Permitido para Ingeniería)</option>
      `;
    } else {
      // Admins pueden crear cualquier rol
      selectNewRole.innerHTML = `
        <option value="supervisor" selected>Supervisor de Nave (Acceso Piso & Terminal)</option>
        <option value="ingeniero">Ingeniero de Procesos (Acceso Piso, Terminal & Consola)</option>
        <option value="admin">Administrador General (Acceso Total)</option>
      `;
    }
  }

  if (btnOpenCreate && modalCreateUser) {
    btnOpenCreate.addEventListener('click', () => {
      configureUserRoleOptions();
      modalCreateUser.classList.add('active');
    });
  }

  if (btnCloseCreate && modalCreateUser) {
    btnCloseCreate.addEventListener('click', () => {
      modalCreateUser.classList.remove('active');
    });
  }

  if (selectNewRole) {
    selectNewRole.addEventListener('change', (e) => {
      const role = e.target.value;
      const checkboxes = document.querySelectorAll('.new-perm-cb');
      checkboxes.forEach(cb => {
        const mod = cb.value;
        if (role === 'admin') {
          cb.checked = true;
        } else if (role === 'ingeniero') {
          cb.checked = (mod === 'andon' || mod === 'terminal' || mod === 'engineer');
        } else if (role === 'supervisor') {
          cb.checked = (mod === 'andon' || mod === 'terminal');
        }
      });
    });
  }

  if (formCreateUser) {
    formCreateUser.addEventListener('submit', (e) => {
      e.preventDefault();
      const activeUser = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
      const name = document.getElementById('newUserName')?.value.trim();
      const email = document.getElementById('newUserEmail')?.value.trim();
      const role = selectNewRole ? selectNewRole.value : 'supervisor';

      if (!name || !email) {
        window.UanifyUI.toast('Por favor completa todos los campos del usuario.', 'warning', 'Campos Incompletos');
        return;
      }

      // Restricción: Los ingenieros no pueden crear otros ingenieros ni administradores
      if (activeUser.role === 'ingeniero' && (role === 'ingeniero' || role === 'admin')) {
        window.UanifyUI.toast('Los Ingenieros de Procesos únicamente tienen autorización para crear usuarios con rol Supervisor.', 'error', 'Permiso Denegado');
        return;
      }

      const selectedPerms = [];
      document.querySelectorAll('.new-perm-cb:checked').forEach(cb => {
        selectedPerms.push(cb.value);
      });

      let roleName = 'Supervisor de Nave';
      let badge = '📋 Supervisor';
      let assignedDepts = ['D-05', 'D-06'];

      if (role === 'admin') {
        roleName = 'Administrador General';
        badge = '👑 Admin';
        assignedDepts = ['*'];
      } else if (role === 'ingeniero') {
        roleName = 'Ingeniero de Procesos';
        badge = '⚙️ Ingeniero';
        assignedDepts = ['*'];
      }

      const newUser = {
        id: 'usr-' + Date.now().toString(36),
        name,
        email,
        role,
        roleName,
        badge,
        assignedDepartments: assignedDepts,
        permissions: selectedPerms.length > 0 ? selectedPerms : ['andon', 'terminal']
      };

      UanifyState.users.push(newUser);
      renderUsersTable();
      modalCreateUser.classList.remove('active');
      formCreateUser.reset();

      window.UanifyUI.toast(
        `Usuario "${name}" (${roleName}) creado exitosamente con permisos: ${newUser.permissions.join(', ')}.`,
        'success',
        '✅ Usuario Creado'
      );
    });
  }

  // ── 6. MODAL Y CRUD: OPERADORES DE PLANTA (MANO DE OBRA) ────────────────
  const modalOperator = document.getElementById('modalRegisterOperator');
  const btnOpenOperator = document.getElementById('btnOpenRegisterOperatorModal') || document.getElementById('btnOpenCreateOperatorModal');
  const btnCloseOperator = document.getElementById('btnCloseRegisterOperatorModal');
  const formOperator = document.getElementById('formRegisterOperator');

  function populateOperatorDeptsSelect() {
    const select = document.getElementById('newOperatorDept');
    if (!select || !UanifyState || !UanifyState.stations) return;
    const currentVal = select.value;
    select.innerHTML = UanifyState.stations.map(s => `
      <option value="${s.code}">${s.code} · ${s.name}</option>
    `).join('');
    if (currentVal) select.value = currentVal;
  }

  window.openCreateOperatorModal = function() {
    if (!modalOperator) return;
    populateOperatorDeptsSelect();
    if (formOperator) formOperator.reset();

    const origId = document.getElementById('opOriginalEmpId');
    const title = document.getElementById('operatorModalTitle');
    const sub = document.getElementById('operatorModalSubtitle');
    const submitBtn = document.getElementById('btnSubmitOperator');

    if (origId) origId.value = '';
    if (title) title.textContent = '👷 Registrar Operador de Planta (Mano de Obra)';
    if (sub) sub.textContent = 'Asignación de personal de piso a máquinas y estaciones';
    if (submitBtn) submitBtn.textContent = '💾 Guardar Operador';

    modalOperator.classList.add('active');
  };

  window.openEditOperatorModal = function(empId) {
    const op = UanifyState.operators.find(o => o.empId === empId);
    if (!op || !modalOperator) return;
    populateOperatorDeptsSelect();

    const origId = document.getElementById('opOriginalEmpId');
    const payroll = document.getElementById('newOperatorPayroll');
    const name = document.getElementById('newOperatorName');
    const dept = document.getElementById('newOperatorDept');
    const machine = document.getElementById('newOperatorMachine');
    const status = document.getElementById('newOperatorStatus');
    const shift = document.getElementById('newOperatorShift');
    const title = document.getElementById('operatorModalTitle');
    const sub = document.getElementById('operatorModalSubtitle');
    const submitBtn = document.getElementById('btnSubmitOperator');

    if (origId) origId.value = op.empId;
    if (payroll) payroll.value = op.empId;
    if (name) name.value = op.name;
    if (dept) dept.value = op.deptCode;
    if (machine) machine.value = op.machine;
    if (status) status.value = op.status;
    if (shift) shift.value = op.shift || 'Turno Único';
    if (title) title.textContent = `✏️ Editar Operador · ${op.name}`;
    if (sub) sub.textContent = `Modificando estación, máquina y estatus de ${op.empId}`;
    if (submitBtn) submitBtn.textContent = '💾 Actualizar Operador';

    modalOperator.classList.add('active');
  };

  if (btnOpenOperator) {
    btnOpenOperator.addEventListener('click', () => window.openCreateOperatorModal());
  }

  if (btnCloseOperator && modalOperator) {
    btnCloseOperator.addEventListener('click', () => {
      modalOperator.classList.remove('active');
    });
  }

  if (formOperator) {
    formOperator.addEventListener('submit', (e) => {
      e.preventDefault();
      const origId = document.getElementById('opOriginalEmpId')?.value;
      const name = document.getElementById('newOperatorName')?.value.trim();
      const empId = document.getElementById('newOperatorPayroll')?.value.trim();
      const deptCode = document.getElementById('newOperatorDept')?.value || 'D-05';
      const machine = document.getElementById('newOperatorMachine')?.value.trim();
      const status = document.getElementById('newOperatorStatus')?.value || 'Activo';
      const shift = document.getElementById('newOperatorShift')?.value || 'Turno Único';

      if (!name || !empId) {
        window.UanifyUI.toast('Por favor ingresa nombre y número de nómina del operador.', 'warning', 'Datos Incompletos');
        return;
      }

      const st = UanifyState.stations.find(s => s.code === deptCode || s.id === deptCode);
      const deptName = st ? st.name : 'Prensas Hidráulicas';
      const resolvedCode = st ? st.code : deptCode;

      if (origId) {
        // Modo Edición
        const op = UanifyState.operators.find(o => o.empId === origId);
        if (op) {
          op.empId = empId;
          op.name = name;
          op.deptCode = resolvedCode;
          op.deptName = deptName;
          op.machine = machine || 'Máquina de Línea';
          op.status = status;
          op.shift = shift;

          renderOperatorsTable();
          if (typeof window.renderOperatorsDirectory === 'function') window.renderOperatorsDirectory();
          if (typeof window.updateOperatorStats === 'function') window.updateOperatorStats();
          modalOperator.classList.remove('active');

          window.UanifyUI.toast(
            `Operador "${name}" (${empId}) actualizado en ${resolvedCode} · ${deptName}.`,
            'success',
            '✅ Operador Actualizado'
          );
          return;
        }
      }

      // Modo Nuevo Registro
      const duplicate = UanifyState.operators.find(o => o.empId === empId);
      if (duplicate) {
        window.UanifyUI.toast(`El número de nómina "${empId}" ya existe en el padrón (${duplicate.name}).`, 'warning', 'Nómina Duplicada');
        return;
      }

      const newOp = {
        empId,
        name,
        deptCode: resolvedCode,
        deptName,
        machine: machine || 'Máquina de Línea',
        shift,
        status,
        pzasToday: Math.floor(Math.random() * 25 + 75)
      };

      if (!UanifyState.operators) UanifyState.operators = [];
      UanifyState.operators.push(newOp);

      renderOperatorsTable();
      if (typeof window.renderOperatorsDirectory === 'function') window.renderOperatorsDirectory();
      if (typeof window.updateOperatorStats === 'function') window.updateOperatorStats();
      modalOperator.classList.remove('active');
      formOperator.reset();

      window.UanifyUI.toast(
        `Operador ${name} (${empId}) incorporado a ${deptName} (${newOp.machine}).`,
        'success',
        '👷 Operador Registrado'
      );
    });
  }

  window.deleteOperator = function(empId) {
    const op = UanifyState.operators.find(o => o.empId === empId);
    if (!op) return;

    window.UanifyUI.confirm(
      '¿Dar de Baja al Operador?',
      `¿Confirmas la baja y retiro de nómina del operador "${op.name}" (Nómina: ${op.empId}) de la estación ${op.deptCode} · ${op.deptName}?`,
      () => {
        UanifyState.operators = UanifyState.operators.filter(o => o.empId !== empId);
        renderOperatorsTable();
        if (typeof window.renderOperatorsDirectory === 'function') window.renderOperatorsDirectory();
        if (typeof window.updateOperatorStats === 'function') window.updateOperatorStats();
        window.UanifyUI.toast(`Operador "${op.name}" (${empId}) dado de baja del padrón.`, 'info', 'Operador Eliminado');
      },
      'Sí, Dar de Baja',
      'Cancelar'
    );
  };

  // ── 7. MODAL Y CRUD: EDITAR USUARIO & DEPARTAMENTOS ASIGNADOS ────────────
  const modalEditPerms = document.getElementById('modalEditPermissions');
  const btnCloseEditPerms = document.getElementById('btnCloseEditPermsModal');
  const formEditPerms = document.getElementById('formEditPermissions');

  if (btnCloseEditPerms && modalEditPerms) {
    btnCloseEditPerms.addEventListener('click', () => {
      modalEditPerms.classList.remove('active');
    });
  }

  function updateSupervisorDeptsSummary() {
    const checkboxes = document.querySelectorAll('.edit-dept-cb:checked');
    const countEl = document.getElementById('editSelectedDeptsCount');
    const opBadge = document.getElementById('editDeptsOperatorsCountBadge');
    if (!countEl) return;

    const selectedCodes = Array.from(checkboxes).map(cb => cb.value);
    countEl.textContent = selectedCodes.length;

    if (opBadge && UanifyState.operators) {
      const totalOpsInDepts = UanifyState.operators.filter(o => selectedCodes.includes(o.deptCode)).length;
      opBadge.textContent = `${totalOpsInDepts} operadores a cargo`;
    }
  }

  window.openEditUserModal = function(userId) {
    const user = UanifyState.users.find(u => u.id === userId);
    if (!user || !modalEditPerms) return;

    const idInput = document.getElementById('editUserId');
    const nameTitle = document.getElementById('editUserNameTitle');
    const nameInput = document.getElementById('editUserNameInput');
    const emailInput = document.getElementById('editUserEmailInput');
    const roleSelect = document.getElementById('editUserRoleSelect');
    const roleBadge = document.getElementById('editUserRoleBadge');
    const deptsGrid = document.getElementById('editDeptsCheckboxesGrid');

    if (idInput) idInput.value = user.id;
    if (nameTitle) nameTitle.textContent = user.name;
    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
    if (roleSelect) roleSelect.value = user.role;
    if (roleBadge) roleBadge.textContent = user.badge || user.roleName;

    // Renderizar los 14 departamentos con checkboxes interactivos y detalle de operadores
    if (deptsGrid && UanifyState.stations) {
      const userDepts = user.assignedDepartments || [];
      const isGlobal = userDepts.includes('*') || user.role === 'admin' || user.role === 'ingeniero';

      deptsGrid.innerHTML = UanifyState.stations.map(st => {
        const isChecked = isGlobal || userDepts.includes(st.code);
        const opCount = (UanifyState.operators || []).filter(o => o.deptCode === st.code).length;
        return `
          <label class="perm-check-item" style="display:flex; align-items:center; gap:8px; font-size:12px; padding:6px 8px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:6px; cursor:pointer;">
            <input type="checkbox" class="edit-dept-cb" value="${st.code}" ${isChecked ? 'checked' : ''} style="cursor:pointer;">
            <div style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:var(--text-primary); font-family:var(--font-mono); font-size:11.5px;">${st.code}</strong>
                <small style="color:var(--text-muted); font-size:10px;">${opCount} ops</small>
              </div>
              <span style="display:block; color:var(--text-secondary); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${st.name}</span>
            </div>
          </label>
        `;
      }).join('');

      deptsGrid.querySelectorAll('.edit-dept-cb').forEach(cb => {
        cb.addEventListener('change', updateSupervisorDeptsSummary);
      });
      updateSupervisorDeptsSummary();
    }

    // Botones Seleccionar Todos y Limpiar
    const btnAll = document.getElementById('btnSelectAllDepts');
    const btnClear = document.getElementById('btnClearAllDepts');
    if (btnAll) {
      btnAll.onclick = () => {
        document.querySelectorAll('.edit-dept-cb').forEach(cb => cb.checked = true);
        updateSupervisorDeptsSummary();
      };
    }
    if (btnClear) {
      btnClear.onclick = () => {
        document.querySelectorAll('.edit-dept-cb').forEach(cb => cb.checked = false);
        updateSupervisorDeptsSummary();
      };
    }

    // Permisos modulares RBAC
    document.querySelectorAll('.edit-perm-cb').forEach(cb => {
      cb.checked = user.permissions.includes(cb.value);
    });

    modalEditPerms.classList.add('active');
  };

  window.openEditPermissionsModal = window.openEditUserModal;

  if (formEditPerms) {
    formEditPerms.addEventListener('submit', (e) => {
      e.preventDefault();
      const userId = document.getElementById('editUserId').value;
      const user = UanifyState.users.find(u => u.id === userId);
      if (!user) return;

      const name = document.getElementById('editUserNameInput')?.value.trim() || user.name;
      const email = document.getElementById('editUserEmailInput')?.value.trim() || user.email;
      const role = document.getElementById('editUserRoleSelect')?.value || user.role;

      // Departamentos asignados
      const selectedDepts = [];
      document.querySelectorAll('.edit-dept-cb:checked').forEach(cb => {
        selectedDepts.push(cb.value);
      });

      const newPerms = [];
      document.querySelectorAll('.edit-perm-cb:checked').forEach(cb => {
        newPerms.push(cb.value);
      });

      user.name = name;
      user.email = email;
      user.role = role;
      user.permissions = newPerms;

      if (role === 'admin') {
        user.roleName = 'Administrador General';
        user.badge = '👑 Admin';
        user.assignedDepartments = ['*'];
      } else if (role === 'ingeniero') {
        user.roleName = 'Ingeniero de Procesos';
        user.badge = '⚙️ Ingeniero';
        user.assignedDepartments = ['*'];
      } else {
        user.roleName = `Supervisor (${selectedDepts.length > 0 ? selectedDepts.join(', ') : 'Sin Deptos'})`;
        user.badge = '📋 Supervisor';
        user.assignedDepartments = selectedDepts.length > 0 ? selectedDepts : [];
      }

      renderUsersTable();
      syncSidebarUserSelector();
      modalEditPerms.classList.remove('active');

      if (UanifyState.currentUser === user.id) {
        if (typeof window.switchActiveUser === 'function') {
          window.switchActiveUser(user.id);
        }
      }

      window.UanifyUI.toast(
        `Usuario "${user.name}" actualizado. Departamentos asignados: ${user.assignedDepartments.join(', ') || 'Ninguno'}.`,
        'success',
        '✅ Usuario y Deptos Actualizados'
      );
    });
  }

  // ── 8. ELIMINAR USUARIO ──────────────────────────────────────────────────
  window.deleteUser = function(userId) {
    const user = UanifyState.users.find(u => u.id === userId);
    if (!user) return;

    window.UanifyUI.confirm(
      '¿Eliminar Usuario del Sistema?',
      `¿Confirmas la baja de acceso para "${user.name}" (${user.roleName})? Ya no podrá ingresar a la terminal ni a los tableros.`,
      () => {
        UanifyState.users = UanifyState.users.filter(u => u.id !== userId);
        if (UanifyState.currentUser === userId) {
          UanifyState.currentUser = 'admin-1';
          if (typeof window.switchActiveUser === 'function') {
            window.switchActiveUser('admin-1');
          }
        }
        renderUsersTable();
        window.UanifyUI.toast(`Usuario "${user.name}" eliminado del sistema.`, 'info', 'Usuario Eliminado');
      },
      'Sí, Eliminar',
      'Cancelar'
    );
  };

  // ── 9. MODAL: DAR DE ALTA DEPARTAMENTO (CON SUPERVISOR Y VARIOS OPERADORES) ─
  const modalCreateDept = document.getElementById('modalCreateDepartment');
  const btnOpenCreateDept = document.getElementById('btnOpenCreateDeptModal');
  const btnCloseCreateDept = document.getElementById('btnCloseCreateDeptModal');
  const btnCancelCreateDept = document.getElementById('btnCancelCreateDept');
  const formCreateDept = document.getElementById('formCreateDepartment');
  const newDeptSupervisor = document.getElementById('newDeptSupervisor');
  const newDeptOperatorsList = document.getElementById('newDeptOperatorsList');

  function openCreateDeptModal() {
    if (!modalCreateDept) return;

    // Sugerir código D-XX
    const newDeptCodeInput = document.getElementById('newDeptCode');
    if (newDeptCodeInput) {
      const nextNum = UanifyState.stations.length + 1;
      newDeptCodeInput.value = `D-${String(nextNum).padStart(2, '0')}`;
    }

    // Poblar supervisores
    if (newDeptSupervisor && UanifyState.users) {
      const supervisors = UanifyState.users.filter(u => u.role === 'supervisor' || u.role === 'admin' || u.role === 'ingeniero');
      newDeptSupervisor.innerHTML = supervisors.map(s => `
        <option value="${s.id}">${s.name} (${s.roleName})</option>
      `).join('');
    }

    // Poblar lista de operadores existentes con checkboxes
    if (newDeptOperatorsList && UanifyState.operators) {
      newDeptOperatorsList.innerHTML = UanifyState.operators.map(op => `
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; padding:3px 0;">
          <input type="checkbox" class="dept-op-cb" value="${op.id}" style="cursor:pointer; accent-color:var(--color-brand);">
          <span><strong>${op.name}</strong> · ${op.deptCode || 'Sin Depto'} (${op.machine || 'Puesto'})</span>
        </label>
      `).join('');
    }

    modalCreateDept.classList.add('active');
  }

  if (btnOpenCreateDept) btnOpenCreateDept.addEventListener('click', openCreateDeptModal);
  if (btnCloseCreateDept) btnCloseCreateDept.addEventListener('click', () => modalCreateDept.classList.remove('active'));
  if (btnCancelCreateDept) btnCancelCreateDept.addEventListener('click', () => modalCreateDept.classList.remove('active'));

  if (formCreateDept) {
    formCreateDept.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('newDeptCode')?.value.trim() || 'D-15';
      const name = document.getElementById('newDeptName')?.value.trim();
      const desc = document.getElementById('newDeptDesc')?.value.trim() || 'Proceso de fabricación en planta';
      const type = document.getElementById('newDeptType')?.value || 'proceso';
      const cycleTime = document.getElementById('newDeptCycleTime')?.value.trim() || '35s';
      const supUserId = newDeptSupervisor?.value;
      const supervisor = UanifyState.users.find(u => u.id === supUserId) || UanifyState.users[0];

      if (!name) {
        window.UanifyUI.toast('Por favor ingresa el nombre del departamento.', 'warning', 'Campo Requerido');
        return;
      }

      // Si se especificó un operador rápido, crearlo
      const quickOpName = document.getElementById('newDeptQuickOpName')?.value.trim();
      const quickOpMachine = document.getElementById('newDeptQuickOpMachine')?.value.trim();
      if (quickOpName) {
        if (!UanifyState.operators) UanifyState.operators = [];
        UanifyState.operators.push({
          id: 'op-' + Date.now(),
          empId: 'TB-' + (8000 + UanifyState.operators.length + 1),
          payrollNo: 'TB-' + (8000 + UanifyState.operators.length + 1),
          name: quickOpName,
          deptCode: code,
          department: name,
          deptName: name,
          machine: quickOpMachine || 'Estación Principal',
          shift: 'Turno Único',
          producedToday: 0,
          status: 'Activo'
        });
      }

      // Asignar operadores seleccionados
      const checkedOps = formCreateDept.querySelectorAll('.dept-op-cb:checked');
      checkedOps.forEach(cb => {
        const op = UanifyState.operators.find(o => o.id === cb.value);
        if (op) {
          op.deptCode = code;
          op.department = name;
          op.deptName = name;
        }
      });

      // Crear nuevo departamento en stations
      const newStation = {
        id: 'dept-' + code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        code: code,
        name: name,
        desc: desc,
        target: 850,
        produced: 0,
        scrap: 0,
        wipWaiting: 0,
        cycleTime: cycleTime,
        status: 'running',
        operator: supervisor.name,
        note: `Departamento registrado. Supervisado por ${supervisor.name}.`
      };

      if (!UanifyState.stations) UanifyState.stations = [];
      UanifyState.stations.push(newStation);

      // Asignar departamento al supervisor si no tiene acceso global '*'
      if (supervisor.assignedDepartments && supervisor.assignedDepartments[0] !== '*') {
        if (!supervisor.assignedDepartments.includes(code)) {
          supervisor.assignedDepartments.push(code);
        }
      }

      // Guardar en localStorage
      try {
        localStorage.setItem('uanify_custom_stations', JSON.stringify(UanifyState.stations));
      } catch (err) {
        console.warn('Error saving stations:', err);
      }

      // Re-renderizar tablas e interfaces
      renderDepartmentsConfig();
      renderOperatorsTable();
      renderUsersTable();

      if (typeof EventBus !== 'undefined') {
        EventBus.emit('stations-updated', UanifyState.stations);
      }

      modalCreateDept.classList.remove('active');
      formCreateDept.reset();

      const assignedOpsCount = checkedOps.length + (quickOpName ? 1 : 0);
      window.UanifyUI.toast(
        `Departamento ${code} "${name}" registrado exitosamente con supervisor ${supervisor.name} y ${assignedOpsCount} operador(es) asignados.`,
        'success',
        '🏢 Departamento Creado'
      );
    });
  }

  // ── 6. ALTA DE ÁREA DE CONTROL DE CALIDAD ──────────────────────────────────
  const modalCreateQuality = document.getElementById('modalCreateQualityArea');
  const btnOpenCreateQuality = document.getElementById('btnOpenCreateQualityModal');
  const btnCloseCreateQuality = document.getElementById('btnCloseCreateQualityModal');
  const btnCancelCreateQuality = document.getElementById('btnCancelCreateQuality');
  const formCreateQuality = document.getElementById('formCreateQualityArea');

  if (btnOpenCreateQuality && modalCreateQuality) {
    btnOpenCreateQuality.addEventListener('click', () => {
      // Sugerir siguiente código C-0X
      const existingQualityCodes = (UanifyState.stations || [])
        .filter(s => s.code && s.code.startsWith('C-'))
        .map(s => parseInt(s.code.replace('C-', ''), 10))
        .filter(n => !isNaN(n));
      const nextNum = existingQualityCodes.length > 0 ? Math.max(...existingQualityCodes) + 1 : 4;
      const nextCode = `C-${String(nextNum).padStart(2, '0')}`;
      const codeInput = document.getElementById('newQualityCode');
      if (codeInput) codeInput.value = nextCode;

      modalCreateQuality.classList.add('active');
    });
  }

  function closeQualityModal() {
    if (modalCreateQuality) modalCreateQuality.classList.remove('active');
  }

  if (btnCloseCreateQuality) btnCloseCreateQuality.addEventListener('click', closeQualityModal);
  if (btnCancelCreateQuality) btnCancelCreateQuality.addEventListener('click', closeQualityModal);

  if (formCreateQuality) {
    formCreateQuality.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = (document.getElementById('newQualityCode')?.value || 'C-04').trim().toUpperCase();
      const name = (document.getElementById('newQualityName')?.value || '').trim();
      const desc = (document.getElementById('newQualityDesc')?.value || '').trim();
      const inspector = document.getElementById('newQualityInspector')?.value || 'Inspectora de Calidad';
      const cycleTime = document.getElementById('newQualityCycleTime')?.value || '18s';

      if (!name) {
        window.UanifyUI.toast('Ingresa el nombre del filtro de calidad.', 'warning');
        return;
      }

      const newQualityStation = {
        id: 'calidad-' + code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        code: code,
        name: name,
        desc: desc || `Filtro de calidad de planta: ${name}`,
        criteria: desc,
        target: 850,
        produced: 0,
        scrap: 0,
        wipWaiting: 0,
        cycleTime: cycleTime,
        status: 'running',
        operator: inspector,
        type: 'calidad',
        isQualityStop: true,
        note: `Área de Calidad registrada. Auditor responsable: ${inspector}.`
      };

      if (!UanifyState.stations) UanifyState.stations = [];
      UanifyState.stations.push(newQualityStation);

      if (!UanifyState.qualityAreas) UanifyState.qualityAreas = [];
      UanifyState.qualityAreas.push({
        code: code,
        name: name,
        desc: desc,
        criteria: desc,
        inspector: inspector,
        cycleTime: cycleTime,
        status: 'Activo'
      });

      try {
        localStorage.setItem('uanify_custom_stations', JSON.stringify(UanifyState.stations));
        localStorage.setItem('uanify_quality_areas', JSON.stringify(UanifyState.qualityAreas));
      } catch (err) {
        console.warn('Error saving quality areas:', err);
      }

      renderDepartmentsConfig();
      populateAddStepStations();

      if (typeof EventBus !== 'undefined') {
        EventBus.emit('stations-updated', UanifyState.stations);
      }

      closeQualityModal();
      formCreateQuality.reset();

      window.UanifyUI.toast(
        `Área de Control de Calidad ${code} "${name}" registrada exitosamente. Ya puedes integrarla en las secuencias de rutas de fabricación.`,
        'success',
        '🔍 Área de Calidad Creada'
      );
    });
  }

  // ── 7. RUTAS Y SECUENCIAS POR MODELO (INGENIERO & ADMIN) ────────────────────
  const cfgRouteModelSelect = document.getElementById('cfgRouteModelSelect');
  const cfgRouteCategoryBadge = document.getElementById('cfgRouteCategoryBadge');
  const cfgRouteStepsCountBadge = document.getElementById('cfgRouteStepsCountBadge');
  const cfgRouteDesc = document.getElementById('cfgRouteDesc');
  const addStepStationSelect = document.getElementById('addStepStationSelect');
  const btnAddStepToRoute = document.getElementById('btnAddStepToRoute');
  const btnSaveRouteSequence = document.getElementById('btnSaveRouteSequence');
  const routeSequenceList = document.getElementById('routeSequenceList');

  let activeRouteId = 'route-telar-1000x';

  function populateRouteModels() {
    if (!cfgRouteModelSelect || !UanifyState.productionRoutes) return;
    cfgRouteModelSelect.innerHTML = UanifyState.productionRoutes.map(r => `
      <option value="${r.id}" ${r.id === activeRouteId ? 'selected' : ''}>
        ${r.name} (${r.category})
      </option>
    `).join('');
  }

  function populateAddStepStations() {
    if (!addStepStationSelect || !UanifyState.stations) return;
    addStepStationSelect.innerHTML = UanifyState.stations.map(st => {
      const isQuality = st.type === 'calidad' || (st.code && st.code.startsWith('C-')) || st.id.startsWith('calidad');
      const icon = isQuality ? '🔍' : '🏭';
      const typeTxt = isQuality ? 'Control de Calidad' : 'Manufactura';
      return `<option value="${st.code}">${icon} ${st.code} - ${st.name} [${typeTxt}]</option>`;
    }).join('');
  }

  function renderRouteSequence() {
    if (!routeSequenceList || !UanifyState.productionRoutes) return;
    const route = UanifyState.productionRoutes.find(r => r.id === activeRouteId) || UanifyState.productionRoutes[0];
    if (!route) return;

    if (cfgRouteCategoryBadge) cfgRouteCategoryBadge.textContent = route.category;
    if (cfgRouteStepsCountBadge) cfgRouteStepsCountBadge.textContent = `${route.steps.length} Pasos`;
    if (cfgRouteDesc) cfgRouteDesc.textContent = route.desc;

    // Verificar permisos: Ingeniero y Admin tienen permiso de edición
    const currentUser = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const canEdit = currentUser.role === 'admin' || currentUser.role === 'ingeniero';

    if (!canEdit) {
      if (btnSaveRouteSequence) btnSaveRouteSequence.disabled = true;
      if (btnAddStepToRoute) btnAddStepToRoute.disabled = true;
    } else {
      if (btnSaveRouteSequence) btnSaveRouteSequence.disabled = false;
      if (btnAddStepToRoute) btnAddStepToRoute.disabled = false;
    }

    routeSequenceList.innerHTML = route.steps.map((st, idx) => {
      const isQuality = st.type === 'calidad' || st.isQualityStop || (st.code && st.code.startsWith('C-'));
      const isFirst = idx === 0;
      const isLast = idx === route.steps.length - 1;
      const typeTag = isQuality 
        ? `<span class="badge-quality">🔍 Filtro de Calidad</span>`
        : `<span class="badge-subtle" style="font-size:10.5px;">🏭 Manufactura</span>`;

      return `
        <div class="sequence-builder-item ${isQuality ? 'is-quality-step' : ''}" data-index="${idx}">
          <div class="sequence-item-info">
            <span class="sequence-order-badge">#${idx + 1}</span>
            <strong style="font-family:var(--font-mono); color:var(--color-brand); font-size:12.5px; min-width:44px;">${st.code}</strong>
            <span style="font-weight:700; color:var(--text-primary); font-size:13.5px;">${st.name}</span>
            ${typeTag}
          </div>
          ${canEdit ? `
          <div class="sequence-controls">
            <button type="button" class="btn-seq-move" data-action="up" data-index="${idx}" ${isFirst ? 'disabled' : ''} title="Subir paso">▲</button>
            <button type="button" class="btn-seq-move" data-action="down" data-index="${idx}" ${isLast ? 'disabled' : ''} title="Bajar paso">▼</button>
            <button type="button" class="btn-seq-delete" data-action="delete" data-index="${idx}" title="Eliminar paso de la ruta">🗑️</button>
          </div>
          ` : `<span style="font-size:11px; color:var(--text-muted);">Solo lectura</span>`}
        </div>
      `;
    }).join('');

    // Handlers para reordenar y eliminar
    routeSequenceList.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (action === 'up' && idx > 0) {
          const temp = route.steps[idx];
          route.steps[idx] = route.steps[idx - 1];
          route.steps[idx - 1] = temp;
          renderRouteSequence();
        } else if (action === 'down' && idx < route.steps.length - 1) {
          const temp = route.steps[idx];
          route.steps[idx] = route.steps[idx + 1];
          route.steps[idx + 1] = temp;
          renderRouteSequence();
        } else if (action === 'delete') {
          if (route.steps.length <= 2) {
            window.UanifyUI.toast('Una ruta debe tener al menos 2 pasos.', 'warning');
            return;
          }
          const removed = route.steps.splice(idx, 1)[0];
          renderRouteSequence();
          window.UanifyUI.toast(`Paso "${removed.code} ${removed.name}" removido de la ruta. Guarda los cambios para aplicar en planta.`, 'info');
        }
      });
    });
  }

  if (cfgRouteModelSelect) {
    cfgRouteModelSelect.addEventListener('change', (e) => {
      activeRouteId = e.target.value;
      renderRouteSequence();
    });
  }

  if (btnAddStepToRoute) {
    btnAddStepToRoute.addEventListener('click', () => {
      const code = addStepStationSelect ? addStepStationSelect.value : null;
      if (!code) return;
      const st = UanifyState.stations.find(s => s.code === code);
      if (!st) return;

      const route = UanifyState.productionRoutes.find(r => r.id === activeRouteId);
      if (!route) return;

      const isQuality = st.type === 'calidad' || (st.code && st.code.startsWith('C-')) || st.id.startsWith('calidad');
      const newStep = {
        order: route.steps.length + 1,
        code: st.code,
        name: st.name,
        type: isQuality ? 'calidad' : (st.code === 'D-11' ? 'logistica' : 'manufactura'),
        icon: isQuality ? '🔍' : '🏭',
        isQualityStop: isQuality,
        cycleTime: st.cycleTime || '30s'
      };

      route.steps.push(newStep);
      renderRouteSequence();
      window.UanifyUI.toast(`Estación "${st.code} ${st.name}" agregada a la ruta. Recuerda presionar "Guardar Secuencia de Ruta".`, 'success');
    });
  }

  if (btnSaveRouteSequence) {
    btnSaveRouteSequence.addEventListener('click', () => {
      const route = UanifyState.productionRoutes.find(r => r.id === activeRouteId);
      if (!route) return;

      // Normalizar número de órdenes
      route.steps.forEach((st, idx) => {
        st.order = idx + 1;
      });

      try {
        localStorage.setItem('uanify_production_routes', JSON.stringify(UanifyState.productionRoutes));
      } catch (e) {
        console.warn('Error saving production routes:', e);
      }

      if (typeof EventBus !== 'undefined') {
        EventBus.emit('production-routes-updated', route);
      }

      window.UanifyUI.toast(
        `Secuencia de ruta para "${route.name}" guardada exitosamente (${route.steps.length} pasos). Los lotes asociados a este modelo seguirán este nuevo flujo de manufactura y calidad.`,
        'success',
        '📐 Ruta Guardada'
      );
    });
  }

  // Inicializar selectores y secuencia
  populateRouteModels();
  populateAddStepStations();
  renderRouteSequence();

  // Actualizar si el usuario activo cambia en el sidebar
  EventBus.on('user-switched', () => {
    renderRouteSequence();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initConfigView());
} else {
  window.initConfigView();
}
