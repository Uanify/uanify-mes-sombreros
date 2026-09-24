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
    { id: 'andon',     name: 'Tablero Andon (Piso)' },
    { id: 'terminal',  name: 'Lotes, QR & Almacenes (iPad)' },
    { id: 'engineer',  name: 'Ingeniería & Subensambles' },
    { id: 'executive', name: 'Dirección & COMPAC' },
    { id: 'config',    name: 'Configuración de Planta' }
  ];

  // ── 1. RENDER DE DEPARTAMENTOS ───────────────────────────────────────────
  function renderDepartmentsConfig() {
    if (!tableBody || !UanifyState || !UanifyState.stations) return;

    tableBody.innerHTML = UanifyState.stations.map((st, idx) => {
      const isQuality = st.id.startsWith('calidad');
      const badgeStyle = isQuality 
        ? 'background:var(--color-amber-bg); color:var(--color-amber); border:1px solid var(--color-amber-border);'
        : 'background:var(--color-green-bg); color:var(--color-green); border:1px solid var(--color-green-border);';

      return `
        <tr>
          <td><strong style="font-family:'JetBrains Mono'; color:var(--color-brand);">${st.code || 'D-' + String(idx+1).padStart(2,'0')}</strong></td>
          <td><strong>${st.name}</strong></td>
          <td><span class="badge-subtle">${isQuality ? 'Control de Calidad' : 'Proceso Productivo'}</span></td>
          <td><span style="font-family:'JetBrains Mono';">${st.cycleTime || '35s'}</span></td>
          <td>${st.target || 850} pzas</td>
          <td>${st.operator}</td>
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

      const deptsInfo = (u.assignedDepartments && u.assignedDepartments[0] !== '*') 
        ? `<div style="font-size:10.5px; color:var(--color-brand); margin-top:3px; font-weight:600;">Depts: ${u.assignedDepartments.join(', ')}</div>` 
        : `<div style="font-size:10.5px; color:var(--text-muted); margin-top:3px;">Acceso Global</div>`;

      return `
        <tr>
          <td>
            <strong>${u.name}</strong>
            <small style="display:block; color:var(--text-muted); font-size:11px;">${u.email}</small>
          </td>
          <td>
            <span class="role-badge ${roleBadgeClass}">${u.badge || u.roleName}</span>
            ${deptsInfo}
          </td>
          <td>
            <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:420px;">
              ${permPills}
            </div>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="openEditPermissionsModal('${u.id}')">
                ✏️ Permisos
              </button>
              ${u.id !== 'admin-1' ? `
                <button class="btn-secondary" style="padding:4px 8px; font-size:11px; color:var(--color-red); border-color:var(--color-red-border);" onclick="deleteUser('${u.id}')">
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

    operatorsTableBody.innerHTML = UanifyState.operators.map(op => `
      <tr>
        <td><strong style="font-family:'JetBrains Mono'; color:var(--color-brand); font-size:12px;">${op.empId}</strong></td>
        <td><strong>${op.name}</strong></td>
        <td><span class="badge-subtle">${op.deptCode} · ${op.deptName}</span></td>
        <td>${op.machine}</td>
        <td><span class="badge-status" style="background:var(--color-green-bg); color:var(--color-green); font-weight:700;">● ${op.status}</span></td>
      </tr>
    `).join('');
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

  // ── 4. GUARDAR PARÁMETROS GENERALES (META SEMANAL) ───────────────────────
  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      const newWeeklyGoal = parseInt(cfgShiftGoal ? cfgShiftGoal.value : 4250, 10);
      const newTakt = parseInt(cfgTaktTime ? cfgTaktTime.value : 42, 10);
      
      UanifyState.metaWeeklyTotal = newWeeklyGoal;
      UanifyState.metaShiftTotal = Math.round(newWeeklyGoal / 5);
      UanifyState.taktTimeSec = newTakt;

      const goalEl = document.getElementById('andonGoalTotal');
      const taktEl = document.getElementById('andonTaktTime');
      if (goalEl) goalEl.textContent = `${newWeeklyGoal.toLocaleString()} pzas/sem`;
      if (taktEl) taktEl.textContent = `${newTakt} seg/pza`;

      window.UanifyUI.toast(
        `Meta Semanal fijada en ${newWeeklyGoal.toLocaleString()} piezas (~${UanifyState.metaShiftTotal} pzas/día en Turno Único). Takt Time: ${newTakt}s. Sincronizado con Tablero Andon.`,
        'success',
        '⚙️ Parámetros de Planta Guardados'
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

  // ── 6. MODAL: REGISTRAR OPERADOR DE PLANTA ────────────────────────────────
  const modalOperator = document.getElementById('modalRegisterOperator');
  const btnOpenOperator = document.getElementById('btnOpenRegisterOperatorModal');
  const btnCloseOperator = document.getElementById('btnCloseRegisterOperatorModal');
  const formOperator = document.getElementById('formRegisterOperator');

  if (btnOpenOperator && modalOperator) {
    btnOpenOperator.addEventListener('click', () => {
      modalOperator.classList.add('active');
    });
  }

  if (btnCloseOperator && modalOperator) {
    btnCloseOperator.addEventListener('click', () => {
      modalOperator.classList.remove('active');
    });
  }

  if (formOperator) {
    formOperator.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newOperatorName')?.value.trim();
      const empId = document.getElementById('newOperatorPayroll')?.value.trim();
      const deptCode = document.getElementById('newOperatorDept')?.value || 'D-05';
      const machine = document.getElementById('newOperatorMachine')?.value.trim();

      if (!name || !empId) {
        window.UanifyUI.toast('Por favor ingresa nombre y número de nómina del operador.', 'warning', 'Datos Incompletos');
        return;
      }

      const st = UanifyState.stations.find(s => s.id === deptCode || s.code === deptCode);
      const deptName = st ? st.name : 'Prensas Hidráulicas';
      const resolvedCode = st ? st.code : 'D-05';

      const newOp = {
        empId,
        name,
        deptCode: resolvedCode,
        deptName,
        machine: machine || 'Máquina de Línea',
        shift: 'Turno Único',
        status: 'Activo'
      };

      if (!UanifyState.operators) UanifyState.operators = [];
      UanifyState.operators.push(newOp);

      renderOperatorsTable();
      modalOperator.classList.remove('active');
      formOperator.reset();

      window.UanifyUI.toast(
        `Operador ${name} (${empId}) incorporado a ${deptName} (${newOp.machine}).`,
        'success',
        '👷 Operador Registrado'
      );
    });
  }

  // ── 7. MODAL: EDITAR PERMISOS DE USUARIO ──────────────────────────────────
  const modalEditPerms = document.getElementById('modalEditPermissions');
  const btnCloseEditPerms = document.getElementById('btnCloseEditPermsModal');
  const formEditPerms = document.getElementById('formEditPermissions');

  if (btnCloseEditPerms && modalEditPerms) {
    btnCloseEditPerms.addEventListener('click', () => {
      modalEditPerms.classList.remove('active');
    });
  }

  window.openEditPermissionsModal = function(userId) {
    const user = UanifyState.users.find(u => u.id === userId);
    if (!user || !modalEditPerms) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserNameTitle').textContent = user.name;
    document.getElementById('editUserRoleBadge').textContent = user.badge || user.roleName;

    document.querySelectorAll('.edit-perm-cb').forEach(cb => {
      cb.checked = user.permissions.includes(cb.value);
    });

    modalEditPerms.classList.add('active');
  };

  if (formEditPerms) {
    formEditPerms.addEventListener('submit', (e) => {
      e.preventDefault();
      const userId = document.getElementById('editUserId').value;
      const user = UanifyState.users.find(u => u.id === userId);
      if (!user) return;

      const newPerms = [];
      document.querySelectorAll('.edit-perm-cb:checked').forEach(cb => {
        newPerms.push(cb.value);
      });

      user.permissions = newPerms;
      renderUsersTable();
      modalEditPerms.classList.remove('active');

      if (UanifyState.currentUser === user.id) {
        if (typeof window.switchActiveUser === 'function') {
          window.switchActiveUser(user.id);
        }
      }

      window.UanifyUI.toast(
        `Permisos actualizados para ${user.name}: ${user.permissions.join(', ')}.`,
        'success',
        '✅ Permisos Actualizados'
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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initConfigView());
} else {
  window.initConfigView();
}
