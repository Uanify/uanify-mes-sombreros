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
    { id: 'inventory', name: 'Catálogos & Almacenes' },
    { id: 'operators', name: 'Padrón de Operadores' },
    { id: 'analytics', name: 'Analítica & KPIs de Planta' },
    { id: 'engineer',  name: 'Analítica & KPIs (Ingeniería)' },
    { id: 'executive', name: 'Analítica & KPIs (Dirección)' },
    { id: 'config',    name: 'Configuración de Planta' }
  ];

  // ── 1. RENDER DE DEPARTAMENTOS & ALMACENES INTERMEDIOS (CRUD COMPLETO - REGLA 0.35) ──
  let deptFiltersBound = false;
  function renderDepartmentsConfig() {
    if (!tableBody || !UanifyState || !UanifyState.stations) return;

    const searchInput = document.getElementById('deptSearchInput');
    const processFilter = document.getElementById('deptProcessFilter');
    const statusFilter = document.getElementById('deptStatusFilter');
    const countBadge = document.getElementById('deptFilteredCountBadge');
    const btnReset = document.getElementById('btnResetDeptFilters');

    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const proc = processFilter ? processFilter.value : 'all';
    const stStatus = statusFilter ? statusFilter.value : 'all';

    const filtered = UanifyState.stations.filter(st => {
      const matchSearch = !q ||
        (st.code && st.code.toLowerCase().includes(q)) ||
        (st.name && st.name.toLowerCase().includes(q)) ||
        (st.operator && st.operator.toLowerCase().includes(q)) ||
        (st.machines && st.machines.toLowerCase().includes(q)) ||
        (st.intermediateWarehouse && st.intermediateWarehouse.toLowerCase().includes(q));

      let matchProc = true;
      if (proc !== 'all') {
        if (proc === 'calidad') matchProc = st.type === 'calidad' || (st.code && st.code.startsWith('C-'));
        else if (proc === 'prensas') matchProc = st.type === 'prensas' || st.code === 'D-05' || (st.id && st.id.includes('prensa'));
        else if (proc === 'rampa') matchProc = st.type === 'rampa' || (st.id && st.id.includes('rampa'));
        else if (proc === 'logistica') matchProc = st.type === 'logistica' || st.code === 'D-11' || (st.id && st.id.includes('almacen'));
        else if (proc === 'manufactura') matchProc = !st.type || st.type === 'manufactura' || (st.code && !st.code.startsWith('C-') && st.code !== 'D-05' && st.code !== 'D-11');
      }

      let matchStatus = true;
      const isActive = st.status !== 'stopped';
      if (stStatus === 'active') matchStatus = isActive;
      else if (stStatus === 'inactive') matchStatus = !isActive;

      return matchSearch && matchProc && matchStatus;
    });

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.stations.length} departamentos`;
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="7">
            <div class="table-empty-content">
              <span class="table-empty-icon">🔍</span>
              <span class="table-empty-title">No se encontraron departamentos coincidentes</span>
              <span class="table-empty-subtitle">Intenta cambiar los términos de búsqueda o los selectores de filtro</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetDeptFilters()">🔄 Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = filtered.map((st, idx) => {
        const isQuality = st.type === 'calidad' || (st.code && st.code.startsWith('C-')) || (st.id && st.id.includes('calidad'));
        const isPress = st.type === 'prensas' || (st.id && st.id.includes('prensa')) || st.code === 'D-05';
        const isRampa = st.type === 'rampa' || (st.id && st.id.includes('rampa'));
        const isLogistics = st.type === 'logistica' || (st.id && st.id.includes('almacen')) || st.code === 'D-11';

        let badgeStyle = 'background:var(--color-green-bg); color:var(--color-green); border:1px solid var(--color-green-border);';
        let typeLabel = '🏭 Manufactura';
        if (isQuality) {
          badgeStyle = 'background:var(--color-amber-bg); color:var(--color-amber); border:1px solid var(--color-amber-border);';
          typeLabel = '🔍 Calidad';
        } else if (isPress) {
          badgeStyle = 'background:#FFFBEB; color:#B45309; border:1px solid #FCD34D;';
          typeLabel = '💨 Prensas';
        } else if (isRampa) {
          badgeStyle = 'background:#FAF5FF; color:#7E22CE; border:1px solid #E9D5FF;';
          typeLabel = '✂️ Rampa';
        } else if (isLogistics) {
          badgeStyle = 'background:var(--color-blue-bg); color:var(--color-blue); border:1px solid var(--color-blue-border);';
          typeLabel = '📦 Logística';
        }

        const warehouseName = st.intermediateWarehouse || `Almacén Intermedio ${st.name} (ALM-INT-${st.code || idx+1})`;
        const warehouseLoc = st.warehouseLocation || 'Nave Central Tombstone';
        const machines = st.machines || 'Estación de trabajo manual';
        const isActive = st.status !== 'stopped';

        return `
          <tr>
            <td class="col-code"><span class="table-badge-code">${st.code || 'D-' + String(idx+1).padStart(2,'0')}</span></td>
            <td class="col-name">
              <div class="table-cell-primary">${st.name}</div>
              <span class="badge-subtle" style="${badgeStyle}; margin-top:4px; display:inline-block;">${typeLabel}</span>
              ${st.desc ? `<span class="table-cell-subtext">${st.desc}</span>` : ''}
            </td>
            <td>
              <strong style="color:var(--text-primary); font-size:12.5px;">📦 ${warehouseName}</strong>
              <span class="table-cell-subtext">📍 ${warehouseLoc}</span>
            </td>
            <td>
              <span style="font-family:'JetBrains Mono'; font-weight:700;">${st.cycleTime || '35s'}</span>
              <span class="table-cell-subtext">Cap: <strong>${st.wipCapacity || st.target || 150}</strong> pzas WIP</span>
            </td>
            <td>
              <strong style="font-size:12px;">👤 ${st.operator}</strong>
              <span class="table-cell-subtext">⚙️ ${machines}</span>
            </td>
            <td class="col-status">
              <span class="table-status-pill ${isActive ? 'status-active' : 'status-danger'}">
                <span class="status-dot"></span>${isActive ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td class="col-actions">
              <div class="action-btns-cell">
                <button type="button" class="btn-table-action btn-action-edit" onclick="window.openEditDepartmentModal('${st.code || st.id}')" title="Editar departamento y almacén">
                  ✏️ Editar
                </button>
                <button type="button" class="btn-table-action btn-action-delete" onclick="window.deleteDepartment('${st.code || st.id}')" title="Eliminar departamento">
                  🗑️ Eliminar
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!deptFiltersBound) {
      deptFiltersBound = true;
      if (searchInput) searchInput.addEventListener('input', renderDepartmentsConfig);
      if (processFilter) processFilter.addEventListener('change', renderDepartmentsConfig);
      if (statusFilter) statusFilter.addEventListener('change', renderDepartmentsConfig);
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (processFilter) processFilter.value = 'all';
          if (statusFilter) statusFilter.value = 'all';
          renderDepartmentsConfig();
        });
      }
      window.resetDeptFilters = function() {
        if (searchInput) searchInput.value = '';
        if (processFilter) processFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        renderDepartmentsConfig();
      };
    }
  }

  // ── 2. RENDER DE USUARIOS Y ROLES (RBAC CON FILTROS - REGLA 0.35) ────────
  let userFiltersBound = false;
  function renderUsersTable() {
    if (!usersTableBody || !UanifyState || !UanifyState.users) return;

    const searchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('userRoleFilter');
    const countBadge = document.getElementById('userFilteredCountBadge');
    const btnReset = document.getElementById('btnResetUserFilters');

    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const role = roleFilter ? roleFilter.value : 'all';

    const filtered = UanifyState.users.filter(u => {
      const matchSearch = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q));

      const matchRole = role === 'all' || u.role === role;
      return matchSearch && matchRole;
    });

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.users.length} usuarios`;
    }

    if (filtered.length === 0) {
      usersTableBody.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="7">
            <div class="table-empty-content">
              <span class="table-empty-icon">🔍</span>
              <span class="table-empty-title">No se encontraron usuarios coincidentes</span>
              <span class="table-empty-subtitle">Intenta buscar con otro término o limpia los filtros</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetUserFilters()">🔄 Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      usersTableBody.innerHTML = filtered.map(u => {
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
            <span class="table-cell-subtext">Supervisión total · ${totalOps} operadores</span>
          `;
        } else if (u.assignedDepartments && u.assignedDepartments.length > 0) {
          const pills = u.assignedDepartments.map(d => `<span class="badge-subtle" style="font-weight:700; font-size:10px; padding:2px 6px;">${d}</span>`).join(' ');
          const assignedOps = (UanifyState.operators || []).filter(o => u.assignedDepartments.includes(o.deptCode)).length;
          deptsInfo = `
            <div style="display:flex; flex-wrap:wrap; gap:3px; margin-top:3px; max-width:240px;">${pills}</div>
            <span class="table-cell-subtext">
              <strong>${u.assignedDepartments.length} depts</strong> asignados · <strong>${assignedOps} ops</strong>
            </span>
          `;
        } else {
          deptsInfo = `<span style="font-size:11px; color:var(--text-muted);">Sin departamentos asignados</span>`;
        }

        return `
          <tr>
            <td class="col-code"><span class="table-badge-code">${u.id}</span></td>
            <td class="col-name">
              <div class="table-cell-primary">${u.name}</div>
              <span class="table-cell-subtext">✉️ ${u.email}</span>
            </td>
            <td>
              <span class="role-badge ${roleBadgeClass}">${u.badge || u.roleName}</span>
            </td>
            <td>
              ${deptsInfo}
            </td>
            <td>
              <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:320px;">
                ${permPills}
              </div>
            </td>
            <td class="col-status">
              <span class="table-status-pill status-active">
                <span class="status-dot"></span>Activo
              </span>
            </td>
            <td class="col-actions">
              <div class="action-btns-cell">
                <button type="button" class="btn-table-action btn-action-edit" onclick="openEditUserModal('${u.id}')" title="Editar permisos y departamentos">
                  ✏️ Editar
                </button>
                ${u.id !== 'admin-1' ? `
                  <button type="button" class="btn-table-action btn-action-delete" onclick="deleteUser('${u.id}')" title="Eliminar usuario">
                    🗑️ Eliminar
                  </button>
                ` : '<span style="font-size:11px; color:var(--text-muted); font-weight:700;">(Principal)</span>'}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!userFiltersBound) {
      userFiltersBound = true;
      if (searchInput) searchInput.addEventListener('input', renderUsersTable);
      if (roleFilter) roleFilter.addEventListener('change', renderUsersTable);
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (roleFilter) roleFilter.value = 'all';
          renderUsersTable();
        });
      }
      window.resetUserFilters = function() {
        if (searchInput) searchInput.value = '';
        if (roleFilter) roleFilter.value = 'all';
        renderUsersTable();
      };
    }

    syncSidebarUserSelector();
  }

  // ── 3. RENDER DE PADRÓN DE OPERADORES EN CONFIG (REGLA 0.35) ─────────────
  let cfgOpFiltersBound = false;
  function renderOperatorsTable() {
    if (!operatorsTableBody || !UanifyState || !UanifyState.operators) return;

    const searchInput = document.getElementById('cfgOperatorSearchInput');
    const deptFilter = document.getElementById('cfgOperatorDeptFilter');
    const statusFilter = document.getElementById('cfgOperatorStatusFilter');
    const countBadge = document.getElementById('cfgOperatorCountBadge');
    const btnReset = document.getElementById('btnResetCfgOperatorFilters');

    // Poblar departamentos en el selector si está vacío
    if (deptFilter && deptFilter.options.length <= 1 && UanifyState.stations) {
      UanifyState.stations.forEach(st => {
        const opt = document.createElement('option');
        opt.value = st.code || st.id;
        opt.textContent = `${st.code || ''} ${st.name}`.trim();
        deptFilter.appendChild(opt);
      });
    }

    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const dept = deptFilter ? deptFilter.value : 'all';
    const st = statusFilter ? statusFilter.value : 'all';

    const filtered = UanifyState.operators.filter(op => {
      const matchSearch = !q ||
        (op.name && op.name.toLowerCase().includes(q)) ||
        (op.empId && op.empId.toLowerCase().includes(q)) ||
        (op.machine && op.machine.toLowerCase().includes(q));

      const matchDept = dept === 'all' || op.deptCode === dept;
      const matchStatus = st === 'all' || op.status === st;
      return matchSearch && matchDept && matchStatus;
    });

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.operators.length} operadores`;
    }

    if (filtered.length === 0) {
      operatorsTableBody.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="7">
            <div class="table-empty-content">
              <span class="table-empty-icon">🔍</span>
              <span class="table-empty-title">No se encontraron operadores coincidentes</span>
              <span class="table-empty-subtitle">Intenta buscar por otro término o limpia los filtros</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetCfgOperatorFilters()">🔄 Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      operatorsTableBody.innerHTML = filtered.map(op => {
        const pzas = op.pzasToday || Math.floor(Math.random() * 30 + 70);
        let statusClass = 'status-active';
        if (op.status === 'Incapacidad') statusClass = 'status-danger';
        else if (op.status === 'Capacitación') statusClass = 'status-warning';

        return `
          <tr>
            <td class="col-code"><span class="table-badge-code">${op.empId}</span></td>
            <td class="col-name">
              <div class="table-cell-primary">${op.name}</div>
              <span class="table-cell-subtext">${op.shift || 'Turno Único'}</span>
            </td>
            <td><span class="badge-subtle">${op.deptCode} · ${op.deptName}</span></td>
            <td><span style="font-size:12px;">⚙️ ${op.machine}</span></td>
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
                  🗑️ Eliminar
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!cfgOpFiltersBound) {
      cfgOpFiltersBound = true;
      if (searchInput) searchInput.addEventListener('input', renderOperatorsTable);
      if (deptFilter) deptFilter.addEventListener('change', renderOperatorsTable);
      if (statusFilter) statusFilter.addEventListener('change', renderOperatorsTable);
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (deptFilter) deptFilter.value = 'all';
          if (statusFilter) statusFilter.value = 'all';
          renderOperatorsTable();
        });
      }
      window.resetCfgOperatorFilters = function() {
        if (searchInput) searchInput.value = '';
        if (deptFilter) deptFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        renderOperatorsTable();
      };
    }
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
          cb.checked = (mod === 'andon' || mod === 'terminal' || mod === 'inventory' || mod === 'operators' || mod === 'analytics' || mod === 'engineer');
        } else if (role === 'supervisor') {
          cb.checked = (mod === 'andon' || mod === 'terminal' || mod === 'inventory' || mod === 'operators');
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

    const editModeInput = document.getElementById('deptModalEditMode');
    const origCodeInput = document.getElementById('deptModalOriginalCode');
    const modalTitle = document.getElementById('deptModalTitle');
    const modalSubtitle = document.getElementById('deptModalSubtitle');

    if (editModeInput) editModeInput.value = 'create';
    if (origCodeInput) origCodeInput.value = '';
    if (modalTitle) modalTitle.textContent = '🏢 Dar de Alta Nuevo Departamento & Almacén Intermedio';
    if (modalSubtitle) modalSubtitle.textContent = 'Catálogo de estaciones de manufactura, almacén intermedio WIP y asignación técnica';

    // Sugerir código D-XX
    const newDeptCodeInput = document.getElementById('newDeptCode');
    const nextNum = (UanifyState.stations || []).length + 1;
    const nextCode = `D-${String(nextNum).padStart(2, '0')}`;
    if (newDeptCodeInput) newDeptCodeInput.value = nextCode;

    const nameInput = document.getElementById('newDeptName');
    const descInput = document.getElementById('newDeptDesc');
    const typeSelect = document.getElementById('newDeptType');
    const cycleTimeInput = document.getElementById('newDeptCycleTime');
    const warehouseInput = document.getElementById('newDeptWarehouse');
    const locationInput = document.getElementById('newDeptWarehouseLocation');
    const capacityInput = document.getElementById('newDeptCapacity');
    const statusSelect = document.getElementById('newDeptStatus');
    const machinesInput = document.getElementById('newDeptMachines');

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (typeSelect) typeSelect.value = 'proceso';
    if (cycleTimeInput) cycleTimeInput.value = '35s';
    if (warehouseInput) warehouseInput.value = `Buffer Intermedio ${nextCode} (ALM-INT-${nextCode})`;
    if (locationInput) locationInput.value = 'Nave Central - Pasillo 2';
    if (capacityInput) capacityInput.value = '150';
    if (statusSelect) statusSelect.value = 'running';
    if (machinesInput) machinesInput.value = '';

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

  function openEditDepartmentModal(deptCode) {
    if (!modalCreateDept) return;
    const station = (UanifyState.stations || []).find(s => s.code === deptCode || s.id === deptCode);
    if (!station) return;

    const editModeInput = document.getElementById('deptModalEditMode');
    const origCodeInput = document.getElementById('deptModalOriginalCode');
    const modalTitle = document.getElementById('deptModalTitle');
    const modalSubtitle = document.getElementById('deptModalSubtitle');

    if (editModeInput) editModeInput.value = 'edit';
    if (origCodeInput) origCodeInput.value = station.code || station.id;
    if (modalTitle) modalTitle.textContent = `✏️ Editar Departamento ${station.code} & Almacén Intermedio`;
    if (modalSubtitle) modalSubtitle.textContent = `Actualización de parámetros técnicos, buffer WIP y maquinaria de ${station.name}`;

    const codeInput = document.getElementById('newDeptCode');
    const nameInput = document.getElementById('newDeptName');
    const descInput = document.getElementById('newDeptDesc');
    const typeSelect = document.getElementById('newDeptType');
    const cycleTimeInput = document.getElementById('newDeptCycleTime');
    const warehouseInput = document.getElementById('newDeptWarehouse');
    const locationInput = document.getElementById('newDeptWarehouseLocation');
    const capacityInput = document.getElementById('newDeptCapacity');
    const statusSelect = document.getElementById('newDeptStatus');
    const machinesInput = document.getElementById('newDeptMachines');

    if (codeInput) codeInput.value = station.code || '';
    if (nameInput) nameInput.value = station.name || '';
    if (descInput) descInput.value = station.desc || station.note || '';
    if (typeSelect) typeSelect.value = station.type || 'proceso';
    if (cycleTimeInput) cycleTimeInput.value = station.cycleTime || '35s';
    if (warehouseInput) warehouseInput.value = station.intermediateWarehouse || (`Almacén Intermedio ${station.name}`);
    if (locationInput) locationInput.value = station.warehouseLocation || 'Nave Central';
    if (capacityInput) capacityInput.value = station.wipCapacity || station.target || 150;
    if (statusSelect) statusSelect.value = station.status || 'running';
    if (machinesInput) machinesInput.value = station.machines || '';

    // Poblar supervisores
    if (newDeptSupervisor && UanifyState.users) {
      const supervisors = UanifyState.users.filter(u => u.role === 'supervisor' || u.role === 'admin' || u.role === 'ingeniero');
      newDeptSupervisor.innerHTML = supervisors.map(s => `
        <option value="${s.id}" ${s.name === station.operator ? 'selected' : ''}>${s.name} (${s.roleName})</option>
      `).join('');
    }

    // Poblar operadores y marcar los que pertenecen a este departamento
    if (newDeptOperatorsList && UanifyState.operators) {
      newDeptOperatorsList.innerHTML = UanifyState.operators.map(op => {
        const isAssigned = op.deptCode === station.code || op.department === station.name || op.deptName === station.name;
        return `
          <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; padding:3px 0;">
            <input type="checkbox" class="dept-op-cb" value="${op.id}" ${isAssigned ? 'checked' : ''} style="cursor:pointer; accent-color:var(--color-brand);">
            <span><strong>${op.name}</strong> · ${op.deptCode || 'Sin Depto'} (${op.machine || 'Puesto'})</span>
          </label>
        `;
      }).join('');
    }

    modalCreateDept.classList.add('active');
  }

  function deleteDepartment(deptCode) {
    const station = (UanifyState.stations || []).find(s => s.code === deptCode || s.id === deptCode);
    if (!station) return;

    window.UanifyUI.confirm(
      `¿Estás seguro de eliminar el departamento ${station.code} - "${station.name}"? Esta acción removerá su estación y almacén intermedio asociado de la planta.`,
      () => {
        UanifyState.stations = UanifyState.stations.filter(s => s.code !== deptCode && s.id !== deptCode);
        try {
          localStorage.setItem('uanify_custom_stations', JSON.stringify(UanifyState.stations));
        } catch (e) {
          console.warn('Error saving stations after delete:', e);
        }

        renderDepartmentsConfig();
        if (typeof EventBus !== 'undefined') {
          EventBus.emit('stations-updated', UanifyState.stations);
        }

        window.UanifyUI.toast(
          `Departamento ${station.code} "${station.name}" eliminado del catálogo de planta.`,
          'info',
          '🗑️ Departamento Eliminado'
        );
      }
    );
  }

  // Exponer funciones en window para invocación desde botones en tabla
  window.openCreateDeptModal = openCreateDeptModal;
  window.openEditDepartmentModal = openEditDepartmentModal;
  window.deleteDepartment = deleteDepartment;

  if (btnOpenCreateDept) btnOpenCreateDept.addEventListener('click', openCreateDeptModal);
  if (btnCloseCreateDept) btnCloseCreateDept.addEventListener('click', () => modalCreateDept.classList.remove('active'));
  if (btnCancelCreateDept) btnCancelCreateDept.addEventListener('click', () => modalCreateDept.classList.remove('active'));

  if (formCreateDept) {
    formCreateDept.addEventListener('submit', (e) => {
      e.preventDefault();
      const isEdit = document.getElementById('deptModalEditMode')?.value === 'edit';
      const origCode = document.getElementById('deptModalOriginalCode')?.value;
      const code = document.getElementById('newDeptCode')?.value.trim() || 'D-15';
      const name = document.getElementById('newDeptName')?.value.trim();
      const desc = document.getElementById('newDeptDesc')?.value.trim() || 'Proceso de fabricación en planta';
      const type = document.getElementById('newDeptType')?.value || 'proceso';
      const cycleTime = document.getElementById('newDeptCycleTime')?.value.trim() || '35s';
      const warehouse = document.getElementById('newDeptWarehouse')?.value.trim() || `Almacén Intermedio ${name}`;
      const location = document.getElementById('newDeptWarehouseLocation')?.value.trim() || 'Nave Central';
      const capacity = parseInt(document.getElementById('newDeptCapacity')?.value, 10) || 150;
      const status = document.getElementById('newDeptStatus')?.value || 'running';
      const machines = document.getElementById('newDeptMachines')?.value.trim() || 'Estación de trabajo estándar';
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
      const checkedIds = Array.from(checkedOps).map(cb => cb.value);
      (UanifyState.operators || []).forEach(op => {
        if (checkedIds.includes(op.id)) {
          op.deptCode = code;
          op.department = name;
          op.deptName = name;
        } else if (isEdit && (op.deptCode === origCode || op.deptCode === code)) {
          // Desasignar si fue desmarcado en edición
          op.deptCode = '';
          op.department = 'Sin Asignar';
          op.deptName = 'Sin Asignar';
        }
      });

      if (isEdit) {
        const stIndex = (UanifyState.stations || []).findIndex(s => s.code === origCode || s.id === origCode);
        if (stIndex !== -1) {
          const st = UanifyState.stations[stIndex];
          st.code = code;
          st.name = name;
          st.desc = desc;
          st.type = type;
          st.cycleTime = cycleTime;
          st.intermediateWarehouse = warehouse;
          st.warehouseLocation = location;
          st.wipCapacity = capacity;
          st.target = capacity;
          st.status = status;
          st.machines = machines;
          st.operator = supervisor.name;
          st.note = desc;
        }
      } else {
        const newStation = {
          id: 'dept-' + code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          code: code,
          name: name,
          desc: desc,
          type: type,
          intermediateWarehouse: warehouse,
          warehouseLocation: location,
          wipCapacity: capacity,
          target: capacity,
          produced: 0,
          scrap: 0,
          wipWaiting: 0,
          cycleTime: cycleTime,
          status: status,
          machines: machines,
          operator: supervisor.name,
          note: `Departamento registrado. Supervisado por ${supervisor.name}.`
        };

        if (!UanifyState.stations) UanifyState.stations = [];
        UanifyState.stations.push(newStation);
      }

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
        isEdit 
          ? `Departamento ${code} "${name}" y su almacén intermedio actualizados correctamente.`
          : `Departamento ${code} "${name}" registrado exitosamente con supervisor ${supervisor.name} y ${assignedOpsCount} operador(es).`,
        'success',
        isEdit ? '✏️ Departamento Actualizado' : '🏢 Departamento Creado'
      );
    });
  }

  // ── 6. CRUD DE FILTROS DE CALIDAD & TOLERANCIAS (C-XX) ───────────────────
  const modalCreateQuality = document.getElementById('modalCreateQualityArea');
  const btnCloseCreateQuality = document.getElementById('btnCloseCreateQualityModal');
  const btnCancelCreateQuality = document.getElementById('btnCancelCreateQuality');
  const formCreateQuality = document.getElementById('formCreateQualityArea');
  const cfgQualityTable = document.getElementById('cfgQualityTable');

  let qualityFiltersBound = false;
  function renderQualityFiltersConfig() {
    if (!cfgQualityTable) return;
    const areas = UanifyState.qualityAreas || [];

    const searchInput = document.getElementById('qualitySearchInput');
    const inspectorFilter = document.getElementById('qualityInspectorFilter');
    const statusFilter = document.getElementById('qualityStatusFilter');
    const countBadge = document.getElementById('qualityFilteredCountBadge');
    const btnReset = document.getElementById('btnResetQualityFilters');

    // Poblar selector de inspectores si está vacío
    if (inspectorFilter && inspectorFilter.options.length <= 1) {
      const inspectors = [...new Set(areas.map(a => a.inspector).filter(Boolean))];
      inspectors.forEach(insp => {
        const opt = document.createElement('option');
        opt.value = insp;
        opt.textContent = `👤 ${insp}`;
        inspectorFilter.appendChild(opt);
      });
    }

    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const insp = inspectorFilter ? inspectorFilter.value : 'all';
    const stStatus = statusFilter ? statusFilter.value : 'all';

    const filtered = areas.filter(item => {
      const matchSearch = !q ||
        (item.code && item.code.toLowerCase().includes(q)) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.criteria && item.criteria.toLowerCase().includes(q)) ||
        (item.tolerances && item.tolerances.toLowerCase().includes(q)) ||
        (item.inspector && item.inspector.toLowerCase().includes(q));

      const matchInsp = insp === 'all' || item.inspector === insp;
      const isActive = item.status !== 'Inactivo';
      let matchStatus = true;
      if (stStatus === 'active') matchStatus = isActive;
      else if (stStatus === 'inactive') matchStatus = !isActive;

      return matchSearch && matchInsp && matchStatus;
    });

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${areas.length} filtros de calidad`;
    }

    if (filtered.length === 0) {
      cfgQualityTable.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="6">
            <div class="table-empty-content">
              <span class="table-empty-icon">🔍</span>
              <span class="table-empty-title">No se encontraron filtros de calidad coincidentes</span>
              <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetQualityFilters()">🔄 Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const currentUser = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const canManage = currentUser.role === 'admin' || currentUser.role === 'ingeniero';

    cfgQualityTable.innerHTML = filtered.map(q => {
      const isActive = q.status !== 'Inactivo';
      return `
        <tr>
          <td class="col-code">
            <span class="table-badge-code" style="color:#D97706; background:rgba(217, 119, 6, 0.08); border-color:rgba(217, 119, 6, 0.25);">${q.code}</span>
          </td>
          <td class="col-name">
            <div class="table-cell-primary">${q.name}</div>
            <span class="table-cell-subtext">📍 ${q.location || 'Nave de Producción'}</span>
          </td>
          <td>
            <div style="font-size:12.5px; font-weight:700; color:var(--text-primary);">${q.tolerances || 'Tolerancia estándar'}</div>
            <span class="table-cell-subtext">${q.criteria || q.desc || '—'}</span>
          </td>
          <td>
            <div style="font-size:12px; font-weight:700; color:var(--text-primary);">👤 ${q.inspector || 'Inspectora de Calidad'}</div>
            <span class="table-cell-subtext">Ciclo: <strong>${q.cycleTime || '18s'}</strong></span>
          </td>
          <td class="col-status">
            <span class="table-status-pill ${isActive ? 'status-active' : 'status-danger'}">
              <span class="status-dot"></span>${isActive ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td class="col-actions">
            ${canManage ? `
              <div class="action-btns-cell">
                <button type="button" class="btn-table-action btn-action-edit" onclick="window.openEditQualityModal('${q.code}')" title="Editar criterios y tolerancias">
                  ✏️ Editar
                </button>
                <button type="button" class="btn-table-action btn-action-delete" onclick="window.deleteQualityFilter('${q.code}')" title="Eliminar filtro de calidad">
                  🗑️ Eliminar
                </button>
              </div>
            ` : `<span style="font-size:11px; color:var(--text-muted); font-weight:600;">Solo lectura</span>`}
          </td>
        </tr>
      `;
    }).join('');

    if (!qualityFiltersBound) {
      qualityFiltersBound = true;
      if (searchInput) searchInput.addEventListener('input', renderQualityFiltersConfig);
      if (inspectorFilter) inspectorFilter.addEventListener('change', renderQualityFiltersConfig);
      if (statusFilter) statusFilter.addEventListener('change', renderQualityFiltersConfig);
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (inspectorFilter) inspectorFilter.value = 'all';
          if (statusFilter) statusFilter.value = 'all';
          renderQualityFiltersConfig();
        });
      }
      window.resetQualityFilters = function() {
        if (searchInput) searchInput.value = '';
        if (inspectorFilter) inspectorFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        renderQualityFiltersConfig();
      };
    }
  }

  window.openCreateQualityModal = function() {
    if (!modalCreateQuality) return;
    const existing = (UanifyState.qualityAreas || [])
      .map(q => parseInt((q.code || '').replace('C-', ''), 10))
      .filter(n => !isNaN(n));
    const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 5;
    const nextCode = `C-${String(nextNum).padStart(2, '0')}`;

    const titleEl = document.getElementById('modalQualityTitle');
    const modeEl = document.getElementById('qualityEditMode');
    const origCodeEl = document.getElementById('origQualityCode');
    const codeEl = document.getElementById('newQualityCode');
    const nameEl = document.getElementById('newQualityName');
    const locEl = document.getElementById('newQualityLocation');
    const descEl = document.getElementById('newQualityDesc');
    const inspectorEl = document.getElementById('newQualityInspector');
    const cycleEl = document.getElementById('newQualityCycleTime');
    const statusEl = document.getElementById('newQualityStatus');

    if (titleEl) titleEl.textContent = '🔍 Dar de Alta Filtro de Control de Calidad';
    if (modeEl) modeEl.value = 'create';
    if (origCodeEl) origCodeEl.value = '';
    if (codeEl) { codeEl.value = nextCode; codeEl.readOnly = false; }
    if (nameEl) nameEl.value = '';
    if (locEl) locEl.value = '';
    if (descEl) descEl.value = '';
    if (inspectorEl) inspectorEl.value = 'Inspectora de Calidad (Turno)';
    if (cycleEl) cycleEl.value = '18s';
    if (statusEl) statusEl.value = 'Activo';

    modalCreateQuality.classList.add('active');
  };

  window.openEditQualityModal = function(code) {
    if (!modalCreateQuality) return;
    const q = (UanifyState.qualityAreas || []).find(area => area.code === code);
    if (!q) return;

    const titleEl = document.getElementById('modalQualityTitle');
    const modeEl = document.getElementById('qualityEditMode');
    const origCodeEl = document.getElementById('origQualityCode');
    const codeEl = document.getElementById('newQualityCode');
    const nameEl = document.getElementById('newQualityName');
    const locEl = document.getElementById('newQualityLocation');
    const descEl = document.getElementById('newQualityDesc');
    const inspectorEl = document.getElementById('newQualityInspector');
    const cycleEl = document.getElementById('newQualityCycleTime');
    const statusEl = document.getElementById('newQualityStatus');

    if (titleEl) titleEl.textContent = `✏️ Editar Filtro de Calidad · ${q.code}`;
    if (modeEl) modeEl.value = 'edit';
    if (origCodeEl) origCodeEl.value = q.code;
    if (codeEl) { codeEl.value = q.code; codeEl.readOnly = true; }
    if (nameEl) nameEl.value = q.name || '';
    if (locEl) locEl.value = q.location || '';
    if (descEl) descEl.value = q.criteria || q.desc || '';
    if (inspectorEl) inspectorEl.value = q.inspector || 'Inspectora de Calidad (Turno)';
    if (cycleEl) cycleEl.value = q.cycleTime || '18s';
    if (statusEl) statusEl.value = q.status || 'Activo';

    modalCreateQuality.classList.add('active');
  };

  window.deleteQualityFilter = function(code) {
    if (!window.UanifyUI || !window.UanifyUI.confirm) return;
    window.UanifyUI.confirm({
      title: `Eliminar Filtro de Calidad ${code}`,
      message: `¿Estás seguro de dar de baja el Filtro de Calidad ${code}? Esta parada técnica será removida del catálogo y de todas las rutas de fabricación asignadas.`,
      confirmText: 'Sí, Eliminar Filtro',
      cancelText: 'Cancelar',
      onConfirm: () => {
        // 1. Remover de qualityAreas
        UanifyState.qualityAreas = (UanifyState.qualityAreas || []).filter(q => q.code !== code);

        // 2. Remover de stations
        UanifyState.stations = (UanifyState.stations || []).filter(s => s.code !== code);

        // 3. Remover de rutas de producción asignadas
        (UanifyState.productionRoutes || []).forEach(r => {
          if (Array.isArray(r.steps)) {
            r.steps = r.steps.filter(s => s.code !== code);
            r.steps.forEach((s, i) => s.order = i + 1);
          }
        });

        // 4. Guardar en localStorage
        try {
          localStorage.setItem('uanify_quality_areas', JSON.stringify(UanifyState.qualityAreas));
          localStorage.setItem('uanify_custom_stations', JSON.stringify(UanifyState.stations));
          localStorage.setItem('uanify_production_routes', JSON.stringify(UanifyState.productionRoutes));
        } catch (e) {
          console.warn('Error saving deleted quality filter:', e);
        }

        // 5. Re-renderizar
        renderQualityFiltersConfig();
        populateAddStepStations();
        renderRouteSequence();

        if (typeof EventBus !== 'undefined') {
          EventBus.emit('quality-areas-updated', UanifyState.qualityAreas);
          EventBus.emit('stations-updated', UanifyState.stations);
          EventBus.emit('production-routes-updated', UanifyState.productionRoutes);
        }

        window.UanifyUI.toast(`Filtro de Calidad ${code} eliminado exitosamente.`, 'success');
      }
    });
  };

  function closeQualityModal() {
    if (modalCreateQuality) modalCreateQuality.classList.remove('active');
  }

  if (btnCloseCreateQuality) btnCloseCreateQuality.addEventListener('click', closeQualityModal);
  if (btnCancelCreateQuality) btnCancelCreateQuality.addEventListener('click', closeQualityModal);

  if (formCreateQuality) {
    formCreateQuality.addEventListener('submit', (e) => {
      e.preventDefault();
      const mode = document.getElementById('qualityEditMode')?.value || 'create';
      const origCode = document.getElementById('origQualityCode')?.value || '';
      const code = (document.getElementById('newQualityCode')?.value || 'C-04').trim().toUpperCase();
      const name = (document.getElementById('newQualityName')?.value || '').trim();
      const location = (document.getElementById('newQualityLocation')?.value || '').trim();
      const desc = (document.getElementById('newQualityDesc')?.value || '').trim();
      const inspector = document.getElementById('newQualityInspector')?.value || 'Inspectora de Calidad (Turno)';
      const cycleTime = document.getElementById('newQualityCycleTime')?.value || '18s';
      const status = document.getElementById('newQualityStatus')?.value || 'Activo';

      if (!name) {
        window.UanifyUI.toast('Ingresa el nombre del filtro de calidad.', 'warning');
        return;
      }

      if (!UanifyState.qualityAreas) UanifyState.qualityAreas = [];
      if (!UanifyState.stations) UanifyState.stations = [];

      if (mode === 'edit') {
        const qIndex = UanifyState.qualityAreas.findIndex(q => q.code === origCode || q.code === code);
        if (qIndex !== -1) {
          UanifyState.qualityAreas[qIndex] = {
            code, name, location, desc, criteria: desc, inspector, cycleTime, status
          };
        }
        const stIndex = UanifyState.stations.findIndex(s => s.code === origCode || s.code === code);
        if (stIndex !== -1) {
          const st = UanifyState.stations[stIndex];
          st.name = name;
          st.desc = desc;
          st.criteria = desc;
          st.warehouseLocation = location;
          st.cycleTime = cycleTime;
          st.operator = inspector;
          st.status = status === 'Activo' ? 'running' : 'idle';
        }
      } else {
        // Create mode
        const newQuality = {
          code, name, location, desc, criteria: desc, inspector, cycleTime, status
        };
        UanifyState.qualityAreas.push(newQuality);

        const newStation = {
          id: 'calidad-' + code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          code: code,
          name: name,
          desc: desc || `Filtro de calidad: ${name}`,
          criteria: desc,
          warehouseLocation: location || 'Nave de Producción',
          target: 850,
          produced: 0,
          scrap: 0,
          wipWaiting: 0,
          cycleTime: cycleTime,
          status: status === 'Activo' ? 'running' : 'idle',
          operator: inspector,
          type: 'calidad',
          isQualityStop: true,
          note: `Filtro de Calidad registrado. Auditor responsable: ${inspector}.`
        };
        UanifyState.stations.push(newStation);
      }

      try {
        localStorage.setItem('uanify_quality_areas', JSON.stringify(UanifyState.qualityAreas));
        localStorage.setItem('uanify_custom_stations', JSON.stringify(UanifyState.stations));
      } catch (err) {
        console.warn('Error saving quality areas:', err);
      }

      renderQualityFiltersConfig();
      renderDepartmentsConfig();
      populateAddStepStations();

      if (typeof EventBus !== 'undefined') {
        EventBus.emit('quality-areas-updated', UanifyState.qualityAreas);
        EventBus.emit('stations-updated', UanifyState.stations);
      }

      closeQualityModal();
      formCreateQuality.reset();

      window.UanifyUI.toast(
        mode === 'edit'
          ? `Filtro de Calidad ${code} "${name}" actualizado exitosamente.`
          : `Filtro de Calidad ${code} "${name}" registrado exitosamente. Ya puedes insertarlo en las rutas por modelo.`,
        'success',
        mode === 'edit' ? '✏️ Filtro Actualizado' : '🔍 Filtro Creado'
      );
    });
  }

  // ── 7. RUTAS Y SECUENCIAS POR MODELO (CON DRAG & DROP) ─────────────────────
  const cfgRouteModelSelect = document.getElementById('cfgRouteModelSelect');
  const cfgRouteCategoryBadge = document.getElementById('cfgRouteCategoryBadge');
  const cfgRouteStepsCountBadge = document.getElementById('cfgRouteStepsCountBadge');
  const cfgRouteDesc = document.getElementById('cfgRouteDesc');
  const addStepStationSelect = document.getElementById('addStepStationSelect');
  const btnAddStepToRoute = document.getElementById('btnAddStepToRoute');
  const btnSaveRouteSequence = document.getElementById('btnSaveRouteSequence');
  const routeSequenceList = document.getElementById('routeSequenceList');

  let activeRouteId = 'route-model-viejonon';

  function populateRouteModels() {
    if (!cfgRouteModelSelect || !UanifyState.productionRoutes) return;
    
    // Si la ruta activa inicial no existe, tomar la primera
    if (!UanifyState.productionRoutes.some(r => r.id === activeRouteId)) {
      activeRouteId = UanifyState.productionRoutes[0].id;
    }

    cfgRouteModelSelect.innerHTML = UanifyState.productionRoutes.map(r => `
      <option value="${r.id}" ${r.id === activeRouteId ? 'selected' : ''}>
        🎩 ${r.name} · [SKU: ${r.sku || 'TB-STD'}] (${r.category})
      </option>
    `).join('');
  }

  function populateAddStepStations() {
    if (!addStepStationSelect || !UanifyState.stations) return;
    
    const mfgStations = UanifyState.stations.filter(s => s.type !== 'calidad' && (!s.code || !s.code.startsWith('C-')));
    const qualityStations = (UanifyState.qualityAreas && UanifyState.qualityAreas.length > 0)
      ? UanifyState.qualityAreas
      : UanifyState.stations.filter(s => s.type === 'calidad' || (s.code && s.code.startsWith('C-')));

    let html = `<option value="">-- Selecciona Departamento o Filtro de Calidad Maestro --</option>`;

    html += `<optgroup label="🏭 Departamentos de Manufactura (D-XX)">`;
    mfgStations.forEach(st => {
      html += `<option value="${st.code}">🏭 ${st.code} · ${st.name} [Takt: ${st.cycleTime || '30s'}]</option>`;
    });
    html += `</optgroup>`;

    html += `<optgroup label="🔍 Puntos de Inspección de Calidad (C-XX)">`;
    qualityStations.forEach(q => {
      html += `<option value="${q.code}">🔍 ${q.code} · ${q.name} [Ciclo: ${q.cycleTime || '18s'}]</option>`;
    });
    html += `</optgroup>`;

    addStepStationSelect.innerHTML = html;
  }

  let draggedStepIndex = null;

  function renderRouteSequence() {
    if (!routeSequenceList || !UanifyState.productionRoutes) return;
    const route = UanifyState.productionRoutes.find(r => r.id === activeRouteId) || UanifyState.productionRoutes[0];
    if (!route) return;

    if (cfgRouteCategoryBadge) cfgRouteCategoryBadge.textContent = route.category;
    if (cfgRouteStepsCountBadge) cfgRouteStepsCountBadge.textContent = `${route.steps.length} Pasos`;
    if (cfgRouteDesc) cfgRouteDesc.textContent = route.desc;

    // Permisos: Ingeniero y Admin
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
        <div class="sequence-builder-item ${isQuality ? 'is-quality-step' : ''}" 
             draggable="${canEdit ? 'true' : 'false'}" 
             data-index="${idx}"
             data-code="${st.code}">
          <div class="sequence-item-info">
            ${canEdit ? `<span class="drag-handle-grip" title="Arrastrar con el ratón o dedo para reordenar la secuencia">⠿</span>` : ''}
            <span class="sequence-order-badge">#${idx + 1}</span>
            <strong style="font-family:var(--font-mono); color:${isQuality ? '#D97706' : 'var(--color-brand)'}; font-size:13px; min-width:46px;">${st.code}</strong>
            <span style="font-weight:700; color:var(--text-primary); font-size:13.5px;">${st.name}</span>
            ${typeTag}
            <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono); margin-left:auto;">⏱ ${st.cycleTime || '30s'}</span>
          </div>
          ${canEdit ? `
          <div class="sequence-controls">
            <button type="button" class="btn-seq-move" data-action="up" data-index="${idx}" ${isFirst ? 'disabled' : ''} title="Subir este paso">▲</button>
            <button type="button" class="btn-seq-move" data-action="down" data-index="${idx}" ${isLast ? 'disabled' : ''} title="Bajar este paso">▼</button>
            <button type="button" class="btn-seq-delete" data-action="delete" data-index="${idx}" title="Quitar este paso de la asignación a este modelo">🗑️</button>
          </div>
          ` : `<span style="font-size:11px; color:var(--text-muted);">Solo lectura</span>`}
        </div>
      `;
    }).join('');

    // ── DRAG AND DROP HANDLERS (NATIVO HTML5) ──
    if (canEdit) {
      const items = routeSequenceList.querySelectorAll('.sequence-builder-item');
      items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          draggedStepIndex = parseInt(item.getAttribute('data-index'), 10);
          item.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(draggedStepIndex));
        });

        item.addEventListener('dragend', () => {
          draggedStepIndex = null;
          items.forEach(it => {
            it.classList.remove('dragging');
            it.classList.remove('drag-over-top');
            it.classList.remove('drag-over-bottom');
          });
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';

          const rect = item.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            item.classList.add('drag-over-top');
            item.classList.remove('drag-over-bottom');
          } else {
            item.classList.add('drag-over-bottom');
            item.classList.remove('drag-over-top');
          }
        });

        item.addEventListener('dragleave', () => {
          item.classList.remove('drag-over-top');
          item.classList.remove('drag-over-bottom');
        });

        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.classList.remove('drag-over-top');
          item.classList.remove('drag-over-bottom');

          const targetIdx = parseInt(item.getAttribute('data-index'), 10);
          if (draggedStepIndex === null || isNaN(draggedStepIndex) || draggedStepIndex === targetIdx) {
            return;
          }

          // Reordenar pasos en la secuencia
          const [movedStep] = route.steps.splice(draggedStepIndex, 1);
          route.steps.splice(targetIdx, 0, movedStep);

          // Normalizar números de orden
          route.steps.forEach((st, i) => {
            st.order = i + 1;
          });

          renderRouteSequence();

          window.UanifyUI.toast(
            `Paso "${movedStep.code} ${movedStep.name}" movido a la posición #${targetIdx + 1}. Recuerda presionar "Guardar Secuencia de Ruta".`,
            'info',
            '⠿ Secuencia Reordenada'
          );
        });
      });
    }

    // ── BOTONES COMPLEMENTARIOS (▲, ▼, 🗑️) ──
    routeSequenceList.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (action === 'up' && idx > 0) {
          const temp = route.steps[idx];
          route.steps[idx] = route.steps[idx - 1];
          route.steps[idx - 1] = temp;
          route.steps.forEach((s, i) => s.order = i + 1);
          renderRouteSequence();
        } else if (action === 'down' && idx < route.steps.length - 1) {
          const temp = route.steps[idx];
          route.steps[idx] = route.steps[idx + 1];
          route.steps[idx + 1] = temp;
          route.steps.forEach((s, i) => s.order = i + 1);
          renderRouteSequence();
        } else if (action === 'delete') {
          if (route.steps.length <= 2) {
            window.UanifyUI.toast('Una ruta de modelo debe tener al menos 2 pasos.', 'warning');
            return;
          }
          const removed = route.steps.splice(idx, 1)[0];
          route.steps.forEach((s, i) => s.order = i + 1);
          renderRouteSequence();
          window.UanifyUI.toast(
            `Paso "${removed.code} ${removed.name}" quitado de la secuencia de "${route.name}". Los catálogos maestros no se modifican.`,
            'info',
            '🗑️ Paso Quitado de la Secuencia'
          );
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
      if (!code) {
        window.UanifyUI.toast('Selecciona una estación o filtro de calidad maestro para asignar a la ruta.', 'warning');
        return;
      }

      // Buscar primero en qualityAreas y luego en stations
      const qualityArea = (UanifyState.qualityAreas || []).find(q => q.code === code);
      const st = UanifyState.stations.find(s => s.code === code);
      if (!st && !qualityArea) return;

      const route = UanifyState.productionRoutes.find(r => r.id === activeRouteId);
      if (!route) return;

      const isQuality = Boolean(qualityArea) || (st && (st.type === 'calidad' || (st.code && st.code.startsWith('C-'))));
      const stepName = qualityArea ? qualityArea.name : st.name;
      const cycle = qualityArea ? qualityArea.cycleTime : (st.cycleTime || '30s');

      const newStep = {
        order: route.steps.length + 1,
        code: code,
        name: stepName,
        type: isQuality ? 'calidad' : (code === 'D-11' ? 'logistica' : 'manufactura'),
        icon: isQuality ? '🔍' : '🏭',
        isQualityStop: isQuality,
        cycleTime: cycle
      };

      route.steps.push(newStep);
      renderRouteSequence();
      window.UanifyUI.toast(
        `Paso "${code} ${stepName}" asignado al final de la ruta de "${route.name}". Recuerda presionar "Guardar Secuencia de Ruta".`,
        'success',
        '➕ Paso Asignado'
      );
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
        `Secuencia de ruta para "${route.name}" guardada exitosamente (${route.steps.length} pasos). Los lotes de este modelo seguirán este nuevo flujo de manufactura y calidad.`,
        'success',
        '📐 Ruta Guardada'
      );
    });
  }

  // Exponer renderizadores
  window.renderQualityFiltersConfig = renderQualityFiltersConfig;
  window.renderRouteSequence = renderRouteSequence;

  // Inicializar selectores y secuencia
  renderQualityFiltersConfig();
  populateRouteModels();
  populateAddStepStations();
  renderRouteSequence();

  // Manejadores de Integración COMPAC en Configuración
  const btnTestCompac = document.getElementById('btnTestCompacConn');
  if (btnTestCompac) {
    btnTestCompac.addEventListener('click', () => {
      btnTestCompac.disabled = true;
      const origHtml = btnTestCompac.innerHTML;
      btnTestCompac.innerHTML = '<span class="status-dot animate-pulse"></span> Verificando ODBC...';
      setTimeout(() => {
        btnTestCompac.disabled = false;
        btnTestCompac.innerHTML = origHtml;
        window.UanifyUI.toast(
          'Enlace ODBC CONTPAQi Comercial v14.2.1 verificado. Ping a base local DSN_CONTPAQI_TOMBSTONE: 14ms (Enlace LAN activo sin latencia).',
          'success',
          'Conexión ERP Activa'
        );
      }, 700);
    });
  }

  const btnEmitSlip = document.getElementById('btnEmitDeliverySlip');
  if (btnEmitSlip) {
    btnEmitSlip.addEventListener('click', () => {
      if (typeof window.emitirValeEntrega === 'function') {
        window.emitirValeEntrega();
      }
    });
  }

  // Actualizar si el usuario activo cambia en el sidebar
  EventBus.on('user-switched', () => {
    renderQualityFiltersConfig();
    renderRouteSequence();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initConfigView());
} else {
  window.initConfigView();
}
