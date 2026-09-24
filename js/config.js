/**
 * UANIFY MES · CONFIGURACIÓN DE PLANTA & GESTIÓN DE USUARIOS Y ROLES (RBAC)
 * Tombstone Hats · San Francisco del Rincón, Guanajuato
 */

window.initConfigView = function() {
  const tableBody = document.getElementById('cfgDepartmentsTable');
  const usersTableBody = document.getElementById('usersTableBody');
  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const cfgShiftGoal = document.getElementById('cfgShiftGoal');
  const cfgTaktTime = document.getElementById('cfgTaktTime');

  // Módulos del sistema con etiquetas legibles
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

  // Escuchar cambio de pestañas para re-renderizar
  if (typeof EventBus !== 'undefined') {
    EventBus.on('tab-changed', (tab) => {
      if (tab === 'config') {
        renderDepartmentsConfig();
        renderUsersTable();
      }
    });
  }

  // ── 3. GUARDAR PARÁMETROS GENERALES ──────────────────────────────────────
  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      const newGoal = parseInt(cfgShiftGoal ? cfgShiftGoal.value : 850, 10);
      const newTakt = parseInt(cfgTaktTime ? cfgTaktTime.value : 42, 10);
      
      UanifyState.metaShiftTotal = newGoal;
      UanifyState.taktTimeSec = newTakt;

      const goalEl = document.getElementById('andonGoalTotal');
      const taktEl = document.getElementById('andonTaktTime');
      if (goalEl) goalEl.textContent = `${newGoal} pzas`;
      if (taktEl) taktEl.textContent = `${newTakt} seg/pza`;

      alert(
        `💾 CONFIGURACIÓN DE PLANTA GUARDADA\n\n` +
        `• Meta del Turno: ${newGoal} pzas\n` +
        `• Takt Time Estándar: ${newTakt} seg/pza\n` +
        `• 14 Departamentos y Almacenes sincronizados con Tablero Andon.\n` +
        `• Políticas de acceso y usuarios vigentes.`
      );
    });
  }

  // ── 4. MODAL: CREAR NUEVO USUARIO ─────────────────────────────────────────
  const modalCreateUser = document.getElementById('modalCreateUser');
  const btnOpenCreate = document.getElementById('btnOpenCreateUserModal');
  const btnCloseCreate = document.getElementById('btnCloseCreateUserModal');
  const formCreateUser = document.getElementById('formCreateUser');

  if (btnOpenCreate && modalCreateUser) {
    btnOpenCreate.addEventListener('click', () => {
      modalCreateUser.classList.add('active');
    });
  }

  if (btnCloseCreate && modalCreateUser) {
    btnCloseCreate.addEventListener('click', () => {
      modalCreateUser.classList.remove('active');
    });
  }

  // Pre-configurar permisos por defecto al cambiar de rol en el modal de creación
  const selectNewRole = document.getElementById('newRoleSelect');
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
      const name = document.getElementById('newUserName').value.trim();
      const email = document.getElementById('newUserEmail').value.trim();
      const role = document.getElementById('newRoleSelect').value;

      if (!name || !email) {
        alert('Por favor completa todos los campos del usuario.');
        return;
      }

      const selectedPerms = [];
      document.querySelectorAll('.new-perm-cb:checked').forEach(cb => {
        selectedPerms.push(cb.value);
      });

      let roleName = 'Supervisor de Nave';
      let badge = '📋 Supervisor';
      if (role === 'admin') {
        roleName = 'Administrador General';
        badge = '👑 Admin';
      } else if (role === 'ingeniero') {
        roleName = 'Ingeniero de Procesos';
        badge = '⚙️ Ingeniero';
      }

      const newUser = {
        id: 'usr-' + Date.now().toString(36),
        name,
        email,
        role,
        roleName,
        badge,
        permissions: selectedPerms.length > 0 ? selectedPerms : ['andon']
      };

      UanifyState.users.push(newUser);
      renderUsersTable();
      modalCreateUser.classList.remove('active');
      formCreateUser.reset();

      alert(
        `✅ USUARIO CREADO EXITOSAMENTE\n\n` +
        `Nombre: ${name}\n` +
        `Rol: ${roleName}\n` +
        `Permisos activos: ${newUser.permissions.join(', ')}\n\n` +
        `El usuario ya está disponible en el selector de perfiles del sistema.`
      );
    });
  }

  // ── 5. MODAL: EDITAR PERMISOS DE USUARIO ──────────────────────────────────
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

      // Si se modificaron los permisos del usuario activo en sesión, refrescar UI
      if (UanifyState.currentUser === user.id) {
        if (typeof window.switchActiveUser === 'function') {
          window.switchActiveUser(user.id);
        }
      }

      alert(
        `✅ PERMISOS ACTUALIZADOS\n\n` +
        `Usuario: ${user.name} (${user.roleName})\n` +
        `Nuevos permisos: ${user.permissions.join(', ')}\n\n` +
        `Los cambios tienen efecto inmediato en la barra lateral.`
      );
    });
  }

  // ── 6. ELIMINAR USUARIO ──────────────────────────────────────────────────
  window.deleteUser = function(userId) {
    const user = UanifyState.users.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`¿Estás seguro de eliminar el usuario "${user.name}" (${user.roleName})?`)) {
      UanifyState.users = UanifyState.users.filter(u => u.id !== userId);
      if (UanifyState.currentUser === userId) {
        UanifyState.currentUser = 'admin-1';
        if (typeof window.switchActiveUser === 'function') {
          window.switchActiveUser('admin-1');
        }
      }
      renderUsersTable();
      alert(`🗑️ Usuario "${user.name}" eliminado del sistema.`);
    }
  };
};

// Auto-inicializar independientemente del orden de carga de scripts
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initConfigView());
} else {
  window.initConfigView();
}
