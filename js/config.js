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

  // ── 1. RENDER DE DEPARTAMENTOS, PROCESOS, ALMACENES & MÁQUINAS (RELACIONAL) ──
  let deptFiltersBound = false;
  let deptCurrentPage = 1;
  const deptItemsPerPage = 7;

  function renderDepartmentsConfig() {
    if (!tableBody || !UanifyState || !UanifyState.stations) return;

    const searchInput = document.getElementById('deptSearchInput');
    const supervisorFilter = document.getElementById('deptSupervisorFilter');
    const processFilter = document.getElementById('deptProcessFilter');
    const warehouseFilter = document.getElementById('deptWarehouseFilter');
    const countBadge = document.getElementById('deptFilteredCountBadge');
    const btnReset = document.getElementById('btnResetDeptFilters');

    // Poblar selector de supervisores dinámicamente si no está poblado
    if (supervisorFilter && supervisorFilter.options.length <= 1 && UanifyState.users) {
      const supervisors = UanifyState.users.filter(u => u.role === 'supervisor' || u.role === 'admin' || u.role === 'ingeniero');
      supervisors.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = `${s.name} (${s.roleName || s.role})`;
        supervisorFilter.appendChild(opt);
      });
    }

    // Poblar selector de almacenes buffer dinámicamente
    if (warehouseFilter && warehouseFilter.options.length <= 1) {
      const allWhNames = new Set();
      UanifyState.stations.forEach(st => {
        const rawWh = (st.intermediateWarehouse || '').split(/[,;]/).map(w => w.trim()).filter(Boolean);
        rawWh.forEach(w => {
          const clean = w.replace(/\s*\([A-Z0-9\-]+\)/gi, '').trim();
          if (clean) allWhNames.add(clean);
        });
      });
      allWhNames.forEach(whName => {
        const opt = document.createElement('option');
        opt.value = whName;
        opt.textContent = whName;
        warehouseFilter.appendChild(opt);
      });
    }

    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedSup = supervisorFilter ? supervisorFilter.value : 'all';
    const selectedProc = processFilter ? processFilter.value : 'all';
    const selectedWh = warehouseFilter ? warehouseFilter.value : 'all';

    const filtered = UanifyState.stations.filter(st => {
      const matchSearch = !q ||
        (st.name && st.name.toLowerCase().includes(q)) ||
        (st.operator && st.operator.toLowerCase().includes(q)) ||
        (st.machines && st.machines.toLowerCase().includes(q)) ||
        (typeof st.processes === 'string' && st.processes.toLowerCase().includes(q)) ||
        (st.intermediateWarehouse && st.intermediateWarehouse.toLowerCase().includes(q));

      let matchSup = true;
      if (selectedSup !== 'all') {
        matchSup = (st.operator && st.operator.includes(selectedSup)) ||
                   (st.supervisors && st.supervisors.some(s => s.includes(selectedSup)));
      }

      let matchProc = true;
      if (selectedProc !== 'all') {
        const procStr = typeof st.processes === 'string' ? st.processes.toLowerCase() : '';
        const isCalidad = st.type === 'calidad' || (st.code && st.code.startsWith('C-')) || procStr.includes('calidad');
        const isPress = st.type === 'prensas' || st.code === 'D-05' || (st.id && st.id.includes('prensa'));
        const isRampa = st.type === 'rampa' || (st.id && st.id.includes('rampa'));
        const isLogistics = st.type === 'logistica' || st.code === 'D-11' || (st.id && st.id.includes('almacen'));

        if (selectedProc === 'calidad') matchProc = isCalidad;
        else if (selectedProc === 'prensas') matchProc = isPress;
        else if (selectedProc === 'rampa') matchProc = isRampa;
        else if (selectedProc === 'logistica') matchProc = isLogistics;
        else if (selectedProc === 'manufactura') matchProc = !isCalidad && !isPress && !isRampa && !isLogistics;
      }

      let matchWh = true;
      if (selectedWh !== 'all') {
        const rawWh = (st.intermediateWarehouse || '').toLowerCase();
        matchWh = rawWh.includes(selectedWh.toLowerCase());
      }

      return matchSearch && matchSup && matchProc && matchWh;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / deptItemsPerPage) || 1;
    if (deptCurrentPage > totalPages) deptCurrentPage = totalPages;
    if (deptCurrentPage < 1) deptCurrentPage = 1;

    const startIndex = (deptCurrentPage - 1) * deptItemsPerPage;
    const endIndex = Math.min(startIndex + deptItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    if (countBadge) {
      countBadge.textContent = `${totalItems} de ${UanifyState.stations.length} departamentos`;
    }

    // Actualizar barras de paginación
    const paginationRange = document.getElementById('deptPaginationRange');
    const paginationTotal = document.getElementById('deptPaginationTotal');
    const pageIndicator = document.getElementById('deptPageIndicator');
    const btnPrev = document.getElementById('btnDeptPrevPage');
    const btnNext = document.getElementById('btnDeptNextPage');

    if (paginationRange) paginationRange.textContent = totalItems === 0 ? '0' : `${startIndex + 1} - ${endIndex}`;
    if (paginationTotal) paginationTotal.textContent = totalItems;
    if (pageIndicator) pageIndicator.textContent = `${deptCurrentPage} / ${totalPages}`;
    if (btnPrev) btnPrev.disabled = (deptCurrentPage <= 1);
    if (btnNext) btnNext.disabled = (deptCurrentPage >= totalPages);

    if (paginatedItems.length === 0) {
      tableBody.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="5">
            <div class="table-empty-content">
              <span class="table-empty-icon"></span>
              <span class="table-empty-title">No se encontraron departamentos coincidentes</span>
              <span class="table-empty-subtitle">Intenta cambiar los términos de búsqueda o los selectores de filtro</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetDeptFilters()">Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = paginatedItems.map((st, idx) => {
        // 1. Procesos formales asociados al departamento desde UanifyState.processes
        let deptProcesses = (UanifyState.processes || []).filter(p => p.deptCode === st.code);
        if (deptProcesses.length === 0 && st.processes) {
          deptProcesses = st.processes.split(/[,;]/).map((p, i) => {
            const trimmed = p.trim();
            const isQ = trimmed.toLowerCase().includes('calidad') || trimmed.startsWith('C-');
            return {
              id: `PROC-${st.code}-${i+1}`,
              code: `PROC-${String(i+1).padStart(2, '0')}`,
              name: trimmed.replace(/^(PROC-\d+|C-\d+)\s*/i, ''),
              type: isQ ? 'calidad' : 'manufactura',
              machines: []
            };
          }).filter(p => p.name);
        }

        const deptQualities = (UanifyState.qualityAreas || []).filter(q => q.deptCode === st.code || q.deptCode === st.id);

        const visibleProcCount = 2;
        const totalProcs = deptProcesses.length + deptQualities.length;
        let processesHtml = '';
        if (totalProcs > 0) {
          const sliceProcs = deptProcesses.slice(0, visibleProcCount);
          processesHtml = sliceProcs.map(p => {
            const cleanName = (p.name || '').replace(/^(PROC-\d+|C-\d+)\s*/i, '');
            const isQ = p.type === 'calidad' || cleanName.toLowerCase().includes('calidad');
            const chipClass = isQ ? 'chip-clean chip-clean-quality' : 'chip-clean chip-clean-process';
            const icon = isQ ? '🔬' : '⚙️';
            return `<span class="${chipClass}" title="${cleanName}">${icon} ${cleanName}</span>`;
          }).join(' ');

          if (deptQualities.length > 0 && deptProcesses.length < 2) {
            processesHtml += ` <span class="chip-clean chip-clean-quality" title="${deptQualities[0].name}">🔬 ${deptQualities[0].name}</span>`;
          }

          if (totalProcs > visibleProcCount) {
            const remaining = totalProcs - visibleProcCount;
            processesHtml += ` <button type="button" class="chip-clean-more" onclick="window.openDeptDetailViewer('${st.code || st.id}')" title="Ver estructura completa">+${remaining} más</button>`;
          }
        } else {
          processesHtml = `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">${st.name}</span>`;
        }

        // 2. Almacenes Buffer asociados (manejados como chips igual que los procesos)
        const rawWhList = (st.intermediateWarehouse ? st.intermediateWarehouse.split(/[,;]/) : [`Buffer Entrada`, `Buffer Salida`]).map(w => w.trim()).filter(Boolean);
        const cleanWhList = rawWhList.map(w => w.replace(/\s*\([A-Z0-9\-]+\)/gi, '').trim());
        
        const visibleWhCount = 2;
        const totalWhs = cleanWhList.length;
        let warehousesHtml = '';
        if (totalWhs > 0) {
          const sliceWhs = cleanWhList.slice(0, visibleWhCount);
          warehousesHtml = sliceWhs.map(wh => {
            return `<span class="chip-clean chip-clean-wh" title="${wh}">📦 ${wh}</span>`;
          }).join(' ');

          if (totalWhs > visibleWhCount) {
            const remainingWh = totalWhs - visibleWhCount;
            warehousesHtml += ` <button type="button" class="chip-clean-more" onclick="window.openDeptDetailViewer('${st.code || st.id}')" title="Ver todos los almacenes">+${remainingWh} más</button>`;
          }
        } else {
          warehousesHtml = `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Buffer central</span>`;
        }

        const supervisorName = st.operator || 'Supervisor Asignado';

        return `
          <tr>
            <td class="col-name">
              <strong style="font-size:14px; font-weight:700; color:var(--text-primary); display:block;">${st.name}</strong>
            </td>
            <td>
              <div class="dept-supervisor-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>${supervisorName}</span>
              </div>
            </td>
            <td>
              <div style="display:flex; flex-wrap:wrap; gap:5px; align-items:center;">
                ${processesHtml}
              </div>
            </td>
            <td>
              <div style="display:flex; flex-wrap:wrap; gap:5px; align-items:center;">
                ${warehousesHtml}
              </div>
            </td>
            <td class="col-actions" style="text-align:center;">
              <div class="action-btns-cell" style="justify-content:center; gap:6px;">
                <button type="button" class="btn-table-action" onclick="window.openDeptDetailViewer('${st.code || st.id}')" title="Ver detalle completo de procesos, máquinas y almacenes" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
                <button type="button" class="btn-table-action btn-action-edit" onclick="window.openEditDepartmentModal('${st.code || st.id}')" title="Editar departamento, procesos y máquinas">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button type="button" class="btn-table-action btn-action-delete" onclick="window.deleteDepartment('${st.code || st.id}')" title="Eliminar departamento">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!deptFiltersBound) {
      deptFiltersBound = true;
      if (searchInput) searchInput.addEventListener('input', () => { deptCurrentPage = 1; renderDepartmentsConfig(); });
      if (supervisorFilter) supervisorFilter.addEventListener('change', () => { deptCurrentPage = 1; renderDepartmentsConfig(); });
      if (processFilter) processFilter.addEventListener('change', () => { deptCurrentPage = 1; renderDepartmentsConfig(); });
      if (warehouseFilter) warehouseFilter.addEventListener('change', () => { deptCurrentPage = 1; renderDepartmentsConfig(); });
      
      const btnPrevPage = document.getElementById('btnDeptPrevPage');
      const btnNextPage = document.getElementById('btnDeptNextPage');
      if (btnPrevPage) {
        btnPrevPage.addEventListener('click', () => {
          if (deptCurrentPage > 1) {
            deptCurrentPage--;
            renderDepartmentsConfig();
          }
        });
      }
      if (btnNextPage) {
        btnNextPage.addEventListener('click', () => {
          if (deptCurrentPage < totalPages) {
            deptCurrentPage++;
            renderDepartmentsConfig();
          }
        });
      }

      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (supervisorFilter) supervisorFilter.value = 'all';
          if (processFilter) processFilter.value = 'all';
          if (warehouseFilter) warehouseFilter.value = 'all';
          deptCurrentPage = 1;
          renderDepartmentsConfig();
        });
      }
      window.resetDeptFilters = function() {
        if (searchInput) searchInput.value = '';
        if (supervisorFilter) supervisorFilter.value = 'all';
        if (processFilter) processFilter.value = 'all';
        if (warehouseFilter) warehouseFilter.value = 'all';
        deptCurrentPage = 1;
        renderDepartmentsConfig();
      };
    }
  }

  // ── 2. RENDER DE USUARIOS Y ROLES (RBAC CON FILTROS - REGLA 0.35) ────────
  let userFiltersBound = false;
  let userCurrentPage = 1;
  const userItemsPerPage = 8;

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

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / userItemsPerPage) || 1;
    if (userCurrentPage > totalPages) userCurrentPage = totalPages;
    if (userCurrentPage < 1) userCurrentPage = 1;

    const startIndex = (userCurrentPage - 1) * userItemsPerPage;
    const endIndex = Math.min(startIndex + userItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.users.length} usuarios`;
    }

    // Actualizar barras de paginación
    const paginationRange = document.getElementById('userPaginationRange');
    const paginationTotal = document.getElementById('userPaginationTotal');
    const pageIndicator = document.getElementById('userPageIndicator');
    const btnPrev = document.getElementById('btnUserPrevPage');
    const btnNext = document.getElementById('btnUserNextPage');

    if (paginationRange) paginationRange.textContent = totalItems === 0 ? '0' : `${startIndex + 1} - ${endIndex}`;
    if (paginationTotal) paginationTotal.textContent = totalItems;
    if (pageIndicator) pageIndicator.textContent = `${userCurrentPage} / ${totalPages}`;
    if (btnPrev) btnPrev.disabled = (userCurrentPage <= 1);
    if (btnNext) btnNext.disabled = (userCurrentPage >= totalPages);

    if (paginatedItems.length === 0) {
      usersTableBody.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="5">
            <div class="table-empty-content">
              <span class="table-empty-icon"></span>
              <span class="table-empty-title">No se encontraron usuarios coincidentes</span>
              <span class="table-empty-subtitle">Intenta buscar con otro término o limpia los filtros</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetUserFilters()">Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      usersTableBody.innerHTML = paginatedItems.map(u => {
        let roleBadgeClass = 'role-badge-supervisor';
        if (u.role === 'ingeniero' || u.role === 'admin') roleBadgeClass = 'role-badge-ingeniero';
        else if (u.role === 'calidad') roleBadgeClass = 'role-badge-calidad';

        // Sintetizar permisos modulares para evitar sobrecarga visual
        let permInfo = '';
        if (u.role === 'ingeniero' || u.role === 'admin' || (u.permissions && u.permissions.length >= (AvailableModules || []).length)) {
          permInfo = `<span class="badge-subtle" style="background:#F0FDF4; color:#16A34A; border:1px solid #BBF7D0; font-weight:700; font-size:11.5px; padding:3px 9px;">Acceso Total (Todos los Módulos)</span>`;
        } else if (u.role === 'calidad') {
          permInfo = `
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span class="badge-subtle" style="background:#FAF5FF; color:#7E22CE; border:1px solid #E9D5FF; font-weight:700; font-size:11.5px; padding:3px 9px; width:fit-content;">Filtros de Calidad C1 a C5</span>
              <span style="font-size:11px; color:var(--text-muted);">Terminal de Inspección, Andon, Almacén</span>
            </div>
          `;
        } else {
          const permPills = (u.permissions || []).map(p => {
            const mod = AvailableModules.find(m => m.id === p);
            return `<span class="perm-pill" style="font-size:10.5px; padding:2px 7px;">${mod ? mod.name : p}</span>`;
          }).join(' ');
          permInfo = `<div style="display:flex; flex-wrap:wrap; gap:4px; max-width:300px;">${permPills}</div>`;
        }

        // Departamentos asignados compactos con badge limpio
        let deptsInfo = '';
        if (u.assignedDepartments && (u.assignedDepartments.includes('*') || u.role === 'admin' || u.role === 'ingeniero')) {
          deptsInfo = `
            <span class="badge-subtle" style="font-weight:700; font-size:11.5px; padding:3px 9px; color:var(--color-brand); background:rgba(139, 94, 60, 0.08); border:1px solid rgba(139, 94, 60, 0.25);">
              Supervisión Global (14 Áreas)
            </span>
          `;
        } else if (u.assignedDepartments && u.assignedDepartments.length > 0) {
          const isQualityUser = u.role === 'calidad';
          const labelPrefix = isQualityUser ? 'Filtro' : 'Departamento';
          deptsInfo = `
            <span class="badge-subtle" style="font-weight:700; font-size:11.5px; padding:3px 9px; color:var(--text-primary); background:#F1F5F9; border:1px solid var(--border-medium);">
              ${u.assignedDepartments.length} ${labelPrefix}${u.assignedDepartments.length !== 1 ? 's' : ''} Asignado${u.assignedDepartments.length !== 1 ? 's' : ''}
            </span>
          `;
        } else {
          deptsInfo = `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Sin asignaciones</span>`;
        }

        return `
          <tr>
            <td class="col-name">
              <div class="table-cell-primary" style="font-size:14px; font-weight:700; color:var(--text-primary);">${u.name}</div>
            </td>
            <td>
              <span class="role-badge ${roleBadgeClass}" style="font-size:11.5px; padding:4px 10px; font-weight:700;">${u.badge || u.roleName}</span>
            </td>
            <td>
              ${deptsInfo}
            </td>
            <td>
              ${permInfo}
            </td>
            <td class="col-actions" style="text-align:center;">
              <div class="action-btns-cell" style="justify-content:center; gap:6px;">
                <button type="button" class="btn-table-action" onclick="window.viewUserDepts('${u.id}')" title="Ver detalle de departamentos y estaciones asignadas" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
                <button type="button" class="btn-table-action btn-action-edit" onclick="openEditUserModal('${u.id}')" title="Editar permisos y departamentos de ${u.name}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button type="button" class="btn-table-action btn-action-delete" onclick="deleteUser('${u.id}')" title="Eliminar usuario ${u.name}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!userFiltersBound) {
      userFiltersBound = true;
      if (searchInput) searchInput.addEventListener('input', () => { userCurrentPage = 1; renderUsersTable(); });
      if (roleFilter) roleFilter.addEventListener('change', () => { userCurrentPage = 1; renderUsersTable(); });
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          if (userCurrentPage > 1) {
            userCurrentPage--;
            renderUsersTable();
          }
        });
      }
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          if (userCurrentPage < totalPages) {
            userCurrentPage++;
            renderUsersTable();
          }
        });
      }
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (roleFilter) roleFilter.value = 'all';
          userCurrentPage = 1;
          renderUsersTable();
        });
      }
      window.resetUserFilters = function() {
        if (searchInput) searchInput.value = '';
        if (roleFilter) roleFilter.value = 'all';
        userCurrentPage = 1;
        renderUsersTable();
      };
    }

    syncSidebarUserSelector();
  }

  // ── VISOR DE DEPARTAMENTOS ASIGNADOS A UN USUARIO ──────────────────────────
  window.viewUserDepts = function(userId) {
    const user = UanifyState.users.find(u => u.id === userId);
    const modal = document.getElementById('modalUserDeptsViewer');
    const titleEl = document.getElementById('userDeptsViewerTitle');
    const subEl = document.getElementById('userDeptsViewerSubtitle');
    const listEl = document.getElementById('userDeptsViewerList');
    if (!user || !modal || !listEl) return;

    if (titleEl) {
      titleEl.textContent = user.role === 'calidad' 
        ? `Filtros de Calidad Asignados · ${user.name}`
        : `Departamentos Asignados · ${user.name}`;
    }
    if (subEl) {
      subEl.textContent = user.role === 'calidad'
        ? `${user.badge || user.roleName} · Puntos de control de calidad bajo supervisión`
        : `${user.badge || user.roleName} · Estaciones de trabajo asignadas`;
    }

    const userDepts = user.assignedDepartments || [];
    const isGlobal = userDepts.includes('*') || user.role === 'admin' || user.role === 'ingeniero';

    if (user.role === 'calidad') {
      const qAreas = (UanifyState.qualityAreas || []).filter(q => userDepts.includes(q.code));
      if (qAreas.length === 0) {
        listEl.innerHTML = `
          <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:13px; background:#F8FAFC; border-radius:8px;">
            Este inspector no tiene puntos de calidad asignados actualmente.
          </div>
        `;
      } else {
        listEl.innerHTML = qAreas.map(qa => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#F8FAFC; border:1px solid var(--border-subtle); border-radius:8px;">
            <div>
              <div style="font-size:13.5px; font-weight:700; color:var(--text-primary);">${qa.name}</div>
              <div style="font-size:11.5px; color:var(--text-muted);">${qa.location || 'Nave de Producción'}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge-subtle" style="font-weight:700; font-size:11px; background:#FAF5FF; color:#7E22CE; border:1px solid #E9D5FF;">${qa.code}</span>
            </div>
          </div>
        `).join('');
      }
    } else {
      let deptsToShow = [];
      if (isGlobal) {
        deptsToShow = (UanifyState.stations || []).filter(s => !s.code.startsWith('C-'));
      } else {
        deptsToShow = (UanifyState.stations || []).filter(s => userDepts.includes(s.code));
      }

      if (deptsToShow.length === 0) {
        listEl.innerHTML = `
          <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:13px; background:#F8FAFC; border-radius:8px;">
            Este usuario no tiene departamentos asignados actualmente.
          </div>
        `;
      } else {
        listEl.innerHTML = deptsToShow.map(st => {
          const opCount = (UanifyState.operators || []).filter(o => o.deptCode === st.code).length;
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#F8FAFC; border:1px solid var(--border-subtle); border-radius:8px;">
              <div>
                <div style="font-size:13.5px; font-weight:700; color:var(--text-primary);">${st.name}</div>
                <div style="font-size:11.5px; color:var(--text-muted);">${st.warehouseLocation || 'Nave de Producción'}</div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="badge-subtle" style="font-weight:700; font-size:11px; background:#FFFFFF;">${opCount} operadores</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    modal.classList.add('active');
  };

  // ── 3. RENDER DE PADRÓN DE OPERADORES EN CONFIG (REGLA 0.35) ─────────────
  let cfgOpFiltersBound = false;
  function renderOperatorsTable() {
    if (!operatorsTableBody || !UanifyState || !UanifyState.operators) return;

    const searchInput = document.getElementById('cfgOperatorSearchInput');
    const deptFilter = document.getElementById('cfgOperatorDeptFilter');
    const statusFilter = document.getElementById('cfgOperatorStatusFilter');
    const shiftFilter = document.getElementById('cfgOperatorShiftFilter');
    const perfFilter = document.getElementById('cfgOperatorPerformanceFilter');
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
    const shift = shiftFilter ? shiftFilter.value : 'all';
    const perf = perfFilter ? perfFilter.value : 'all';

    const filtered = UanifyState.operators.filter(op => {
      const matchSearch = !q ||
        (op.name && op.name.toLowerCase().includes(q)) ||
        (op.empId && op.empId.toLowerCase().includes(q)) ||
        (op.machine && op.machine.toLowerCase().includes(q));

      const matchDept = dept === 'all' || op.deptCode === dept;
      return matchSearch && matchDept;
    });

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${UanifyState.operators.length} operadores`;
    }

    if (filtered.length === 0) {
      operatorsTableBody.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="5">
            <div class="table-empty-content">
              <span class="table-empty-icon"></span>
              <span class="table-empty-title">No se encontraron operadores coincidentes</span>
              <span class="table-empty-subtitle">Intenta buscar por otro término o limpia los filtros</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetCfgOperatorFilters()">Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      operatorsTableBody.innerHTML = filtered.map(op => {
        return `
          <tr>
            <td class="col-code" style="text-align:center;"><span class="table-badge-code" style="margin:0 auto;">${op.empId}</span></td>
            <td class="col-name">
              <div class="table-cell-primary" style="font-size:14px; font-weight:700;">${op.name}</div>
            </td>
            <td><span class="badge-subtle" style="font-weight:600; font-size:12px;">${op.deptCode} · ${op.deptName}</span></td>
            <td>
              <div style="font-size:13px; font-weight:700; color:var(--text-primary);">${op.machine}</div>
              <span class="table-cell-subtext" style="font-size:11.5px; color:var(--text-secondary);">${op.processName || op.deptName}</span>
            </td>
            <td class="col-actions" style="text-align:center;">
              <div class="action-btns-cell" style="justify-content:center;">
                <button type="button" class="btn-table-action btn-action-edit" onclick="window.openEditOperatorModal('${op.empId}')" title="Editar Operador">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button type="button" class="btn-table-action btn-action-delete" onclick="window.deleteOperator('${op.empId}')" title="Dar de Baja Operador">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
      if (shiftFilter) shiftFilter.addEventListener('change', renderOperatorsTable);
      if (perfFilter) perfFilter.addEventListener('change', renderOperatorsTable);
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (deptFilter) deptFilter.value = 'all';
          if (statusFilter) statusFilter.value = 'all';
          if (shiftFilter) shiftFilter.value = 'all';
          if (perfFilter) perfFilter.value = 'all';
          renderOperatorsTable();
        });
      }
      window.resetCfgOperatorFilters = function() {
        if (searchInput) searchInput.value = '';
        if (deptFilter) deptFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        if (shiftFilter) shiftFilter.value = 'all';
        if (perfFilter) perfFilter.value = 'all';
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

  // Escuchar cambio de pestañas para re-renderizar
  if (typeof EventBus !== 'undefined') {
    EventBus.on('tab-changed', (tab) => {
      if (tab === 'config') {
        renderDepartmentsConfig();
        renderUsersTable();
        if (typeof renderProcessesConfig === 'function') renderProcessesConfig();
        if (typeof renderWarehousesConfig === 'function') renderWarehousesConfig();
        if (typeof renderMachinesConfig === 'function') renderMachinesConfig();
      }
    });
  }

  // ── Sincronización en vivo de los inputs del Horario de Turno
  const cfgShiftStart = document.getElementById('cfgShiftStart');
  const cfgShiftEnd = document.getElementById('cfgShiftEnd');
  const cfgShiftLunchStart = document.getElementById('cfgShiftLunchStart');
  const cfgShiftLunchEnd = document.getElementById('cfgShiftLunchEnd');
  const cfgShiftLunchDuration = document.getElementById('cfgShiftLunchDuration');
  const cfgShiftDays = document.getElementById('cfgShiftDays');

  function calculateLunchDuration() {
    if (!cfgShiftLunchStart || !cfgShiftLunchEnd || !cfgShiftLunchDuration) return;
    const startVal = cfgShiftLunchStart.value || '12:00';
    const endVal = cfgShiftLunchEnd.value || '12:45';
    const [startH, startM] = startVal.split(':').map(Number);
    const [endH, endM] = endVal.split(':').map(Number);
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    cfgShiftLunchDuration.textContent = `${diffMinutes} min`;
  }

  if (cfgShiftLunchStart) cfgShiftLunchStart.addEventListener('input', calculateLunchDuration);
  if (cfgShiftLunchEnd) cfgShiftLunchEnd.addEventListener('input', calculateLunchDuration);

  const cfgShiftStartDetails = document.getElementById('cfgShiftStartDetails');
  const btnResetShiftStart = document.getElementById('btnResetShiftStart');

  function renderShiftStartStatus() {
    if (!cfgShiftStartDetails) return;
    const sched = UanifyState.shiftSchedule || {};
    if (sched.actualStartTime) {
      cfgShiftStartDetails.innerHTML = `<strong style="color:var(--color-green);">${sched.actualStartTime} hrs</strong> (Lote #${sched.firstLotId || '49,633'}) · <span style="color:#0284C7; font-weight:700;">Ramp-up: +${sched.rampUpMinutes} min</span>`;
    } else {
      cfgShiftStartDetails.innerHTML = `<span style="color:var(--text-muted);">Esperando primer escaneo QR de la jornada...</span>`;
    }
  }

  // Cargar valores iniciales si están en UanifyState
  if (UanifyState.shiftSchedule) {
    if (cfgShiftStart && UanifyState.shiftSchedule.start) cfgShiftStart.value = UanifyState.shiftSchedule.start;
    if (cfgShiftEnd && UanifyState.shiftSchedule.end) cfgShiftEnd.value = UanifyState.shiftSchedule.end;
    if (cfgShiftDays && UanifyState.shiftSchedule.days) cfgShiftDays.value = UanifyState.shiftSchedule.days;
    
    // Parsear horario de comida existente
    if (UanifyState.shiftSchedule.lunch) {
      const match = UanifyState.shiftSchedule.lunch.match(/(\d{1,2}:\d{2})\s*(?:a|-)\s*(\d{1,2}:\d{2})/i);
      if (match) {
        if (cfgShiftLunchStart) cfgShiftLunchStart.value = match[1];
        if (cfgShiftLunchEnd) cfgShiftLunchEnd.value = match[2];
      }
    }
    calculateLunchDuration();
    renderShiftStartStatus();
  }

  // Reiniciar Arranque para Pruebas / Demostraciones
  if (btnResetShiftStart) {
    btnResetShiftStart.addEventListener('click', () => {
      UanifyState.resetShiftDynamicStart();
      renderShiftStartStatus();
      window.UanifyUI.toast('Arranque dinámico reiniciado. El próximo código QR que escanees en la terminal fijará el nuevo inicio de turno.', 'success', 'Arranque Reiniciado');
    });
  }

  // ── 4. GUARDAR PARÁMETROS GENERALES & HORARIO DE TURNO ───────────────────
  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      const newWeeklyGoal = parseInt(cfgShiftGoal ? cfgShiftGoal.value : 4250, 10);
      
      UanifyState.metaWeeklyTotal = newWeeklyGoal;
      UanifyState.metaShiftTotal = Math.round(newWeeklyGoal / 5);

      // Horario de Turno con selectores estandarizados
      const shiftStart = cfgShiftStart ? cfgShiftStart.value : '07:00';
      const shiftEnd = cfgShiftEnd ? cfgShiftEnd.value : '15:30';
      const lunchStart = cfgShiftLunchStart ? cfgShiftLunchStart.value : '12:00';
      const lunchEnd = cfgShiftLunchEnd ? cfgShiftLunchEnd.value : '12:45';
      const shiftLunch = `${lunchStart} a ${lunchEnd} hrs`;
      const shiftDays = 'Lunes a Viernes';
      const shiftSummary = `Turno Único (${shiftStart} - ${shiftEnd} · ${shiftDays})`;
      const shiftMode = 'dynamic';

      UanifyState.shiftSchedule = {
        ...UanifyState.shiftSchedule,
        start: shiftStart,
        end: shiftEnd,
        lunch: shiftLunch,
        days: shiftDays,
        summary: shiftSummary,
        mode: shiftMode
      };
      UanifyState.currentShift = shiftSummary;
      localStorage.setItem('uanify_shift_schedule', JSON.stringify(UanifyState.shiftSchedule));
      localStorage.setItem('uanify_shift_mode', shiftMode);

      // Actualizar pie de barra lateral
      const shiftTitleEl = document.querySelector('.shift-title');
      if (shiftTitleEl) {
        shiftTitleEl.textContent = `Turno Único (${shiftStart} - ${shiftEnd})`;
      }

      const goalEl = document.getElementById('andonGoalTotal');
      if (goalEl) goalEl.textContent = `${newWeeklyGoal.toLocaleString()} pzas/sem`;

      window.UanifyUI.toast(
        `Horario guardado: ${shiftStart} a ${shiftEnd} hrs · Receso/Comida: ${shiftLunch}. Meta Semanal: ${newWeeklyGoal.toLocaleString()} pzas.`,
        'success',
        'Horario y Parámetros Guardados'
      );
    });
  }

  // ── 5. MODAL: CREAR NUEVO USUARIO (CON REGLA INGENIERO / ADMIN) ───────────
  const modalCreateUser = document.getElementById('modalCreateUser');
  const btnOpenCreate = document.getElementById('btnOpenCreateUserModal');
  const btnCloseCreate = document.getElementById('btnCloseCreateUserModal');
  const formCreateUser = document.getElementById('formCreateUser');
  const selectNewRole = document.getElementById('newRoleSelect');
  const RoleFixedPermissions = {
    ingeniero: {
      title: 'Ingeniero (Admin Mayor · Control Total)',
      desc: 'Acceso total: Ingesta CONTPAQi SQL, Lotes & Tarjetas QR, Terminal de Piso, Andon, Almacenes & Hormas, Operadores, Analítica, Rutas y Configuración General.',
      perms: ['orders', 'terminal', 'andon', 'inventory', 'operators', 'analytics', 'engineer', 'executive', 'config'],
      roleName: 'Ingeniero (Admin Mayor)',
      badge: 'Ingeniero (Admin)'
    },
    supervisor: {
      title: 'Supervisor de Planta (Piso y Almacenes)',
      desc: 'Acceso a Terminal de Piso de sus áreas asignadas, Escaneo QR, Almacenes Intermedios, Padrón de Operadores y Tablero Andon.',
      perms: ['terminal', 'andon', 'inventory', 'operators'],
      roleName: 'Supervisor de Planta',
      badge: 'Supervisor'
    },
    calidad: {
      title: 'Inspector de Calidad (Filtros C1 a C5)',
      desc: 'Acceso a Terminal de Piso para dictamen y liberación/rechazo en los 5 filtros de calidad (C1 a C5), Catálogos y Tablero Andon.',
      perms: ['terminal', 'andon', 'inventory'],
      roleName: 'Inspector de Calidad',
      badge: 'Inspector Calidad'
    }
  };

  function updateRolePermsPreview(role, titleId = 'rolePermsTitle', descId = 'rolePermsDesc') {
    const config = RoleFixedPermissions[role] || RoleFixedPermissions.supervisor;
    const tEl = document.getElementById(titleId);
    const dEl = document.getElementById(descId);
    if (tEl) tEl.textContent = config.title;
    if (dEl) dEl.textContent = config.desc;
  }

  function configureUserRoleOptions() {
    if (!selectNewRole) return;
    selectNewRole.innerHTML = `
      <option value="supervisor" selected>Supervisor de Planta (Piso y Almacenes)</option>
      <option value="calidad">Inspector de Calidad (Filtros C1 a C5)</option>
      <option value="ingeniero">Ingeniero (Admin Mayor · Control Total)</option>
    `;
    updateRolePermsPreview(selectNewRole.value, 'rolePermsTitle', 'rolePermsDesc');
  }

  // Asignación operativa en Modal de Crear Usuario
  const createAssignSection = document.getElementById('createAssignmentSection');
  const createAssignGrid = document.getElementById('createAssignGrid');
  const createAssignSearchInp = document.getElementById('createAssignSearchInp');
  const btnClearCreateAssigns = document.getElementById('btnClearCreateAssigns');

  function renderCreateAssignGrid(role, filterQuery = '') {
    if (!createAssignGrid) return;
    const q = filterQuery.toLowerCase().trim();
    const countBadge = document.getElementById('createSelectedCount');
    const summaryBadge = document.getElementById('createAssignSummaryBadge');
    const titleEl = document.getElementById('createAssignSectionTitle');
    const subEl = document.getElementById('createAssignSectionSubtitle');

    if (role === 'ingeniero') {
      if (createAssignSection) createAssignSection.style.display = 'none';
      return;
    }
    if (createAssignSection) createAssignSection.style.display = 'block';

    if (role === 'calidad') {
      if (titleEl) titleEl.textContent = 'Puntos de Control de Calidad';
      if (subEl) subEl.textContent = 'Selecciona los filtros de calidad a cargo:';
      const areas = UanifyState.qualityAreas || [];
      const filtered = areas.filter(a => !q || (a.name && a.name.toLowerCase().includes(q)) || (a.code && a.code.toLowerCase().includes(q)));
      
      if (filtered.length === 0) {
        createAssignGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:12px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron puntos de calidad</div>';
      } else {
        createAssignGrid.innerHTML = filtered.map(a => `
          <label style="display:flex; align-items:center; gap:8px; font-size:12px; padding:6px 8px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:6px; cursor:pointer;" title="${a.name}">
            <input type="checkbox" class="create-assign-cb" value="${a.code}" style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
            <div style="flex:1; min-width:0;">
              <strong style="display:block; color:var(--text-primary); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.name}</strong>
              <small style="color:var(--text-muted); font-size:10.5px;">${a.location || 'Planta'}</small>
            </div>
          </label>
        `).join('');
      }
    } else {
      // Supervisor: Departamentos
      if (titleEl) titleEl.textContent = 'Departamentos Asignados al Supervisor';
      if (subEl) subEl.textContent = 'Estaciones sobre las cuales tendrá mando operativo:';
      const depts = (UanifyState.stations || []).filter(s => !s.code.startsWith('C-'));
      const filtered = depts.filter(s => !q || (s.name && s.name.toLowerCase().includes(q)) || (s.code && s.code.toLowerCase().includes(q)));

      if (filtered.length === 0) {
        createAssignGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:12px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron departamentos</div>';
      } else {
        createAssignGrid.innerHTML = filtered.map(s => {
          const opCount = (UanifyState.operators || []).filter(o => o.deptCode === s.code).length;
          return `
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; padding:6px 8px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:6px; cursor:pointer;" title="${s.name}">
              <input type="checkbox" class="create-assign-cb" value="${s.code}" style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="color:var(--text-primary); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}</strong>
                  <small style="color:var(--text-muted); font-size:10px; margin-left:4px;">${opCount} ops</small>
                </div>
              </div>
            </label>
          `;
        }).join('');
      }
    }

    const updateCreateAssignCount = () => {
      const checkedBoxes = createAssignGrid.querySelectorAll('.create-assign-cb:checked');
      if (countBadge) countBadge.textContent = checkedBoxes.length;
      if (summaryBadge) {
        if (role === 'calidad') {
          summaryBadge.textContent = `${checkedBoxes.length} punto(s) de inspección`;
        } else {
          const selectedCodes = Array.from(checkedBoxes).map(cb => cb.value);
          const totalOps = (UanifyState.operators || []).filter(o => selectedCodes.includes(o.deptCode)).length;
          summaryBadge.textContent = `${totalOps} operadores a cargo`;
        }
      }
    };

    createAssignGrid.querySelectorAll('.create-assign-cb').forEach(cb => {
      cb.addEventListener('change', updateCreateAssignCount);
    });
    updateCreateAssignCount();
  }

  if (createAssignSearchInp) {
    createAssignSearchInp.addEventListener('input', (e) => {
      const role = selectNewRole ? selectNewRole.value : 'supervisor';
      renderCreateAssignGrid(role, e.target.value);
    });
  }

  if (btnClearCreateAssigns) {
    btnClearCreateAssigns.addEventListener('click', () => {
      document.querySelectorAll('.create-assign-cb').forEach(cb => cb.checked = false);
      const countBadge = document.getElementById('createSelectedCount');
      const summaryBadge = document.getElementById('createAssignSummaryBadge');
      if (countBadge) countBadge.textContent = '0';
      if (summaryBadge) summaryBadge.textContent = '0 asignados';
    });
  }

  window.openCreateUserModal = function() {
    if (!modalCreateUser) return;
    configureUserRoleOptions();
    const nameInput = document.getElementById('newUserName');
    const pinInput = document.getElementById('newUserPin');
    if (nameInput) nameInput.value = '';
    if (pinInput) pinInput.value = '';
    if (createAssignSearchInp) createAssignSearchInp.value = '';
    const initialRole = selectNewRole ? selectNewRole.value : 'supervisor';
    renderCreateAssignGrid(initialRole, '');
    modalCreateUser.classList.add('active');
  };

  if (btnOpenCreate && modalCreateUser) {
    btnOpenCreate.addEventListener('click', () => {
      window.openCreateUserModal();
    });
  }

  if (btnCloseCreate && modalCreateUser) {
    btnCloseCreate.addEventListener('click', () => {
      modalCreateUser.classList.remove('active');
    });
  }

  if (selectNewRole) {
    selectNewRole.addEventListener('change', (e) => {
      updateRolePermsPreview(e.target.value, 'rolePermsTitle', 'rolePermsDesc');
      if (createAssignSearchInp) createAssignSearchInp.value = '';
      renderCreateAssignGrid(e.target.value, '');
    });
  }

  if (formCreateUser) {
    formCreateUser.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newUserName')?.value.trim();
      const pin = document.getElementById('newUserPin')?.value.trim();
      const role = selectNewRole ? selectNewRole.value : 'supervisor';

      if (!name) {
        window.UanifyUI.toast('Por favor ingresa el nombre completo del usuario.', 'warning', 'Nombre Requerido');
        return;
      }
      if (!pin || !/^[0-9]{4}$/.test(pin)) {
        window.UanifyUI.toast('El PIN de acceso debe contener exactamente 4 dígitos numéricos.', 'warning', 'PIN Inválido');
        return;
      }

      const roleDef = RoleFixedPermissions[role] || RoleFixedPermissions.supervisor;
      let assignedDepts = [];

      if (role === 'ingeniero') {
        assignedDepts = ['*'];
      } else {
        const checkedAssigns = document.querySelectorAll('.create-assign-cb:checked');
        assignedDepts = Array.from(checkedAssigns).map(cb => cb.value);
      }

      const newUser = {
        id: 'usr-' + Date.now().toString(36),
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@tombstone.mx`,
        pin,
        role,
        roleName: roleDef.roleName,
        badge: roleDef.badge,
        assignedDepartments: assignedDepts,
        permissions: [...roleDef.perms]
      };

      UanifyState.users.push(newUser);
      renderUsersTable();
      modalCreateUser.classList.remove('active');
      formCreateUser.reset();

      window.UanifyUI.toast(
        `Usuario "${name}" (${roleDef.roleName}) creado exitosamente con PIN de acceso.`,
        'success',
        'Usuario Registrado'
      );
    });
  }

  // ── 6. MODAL Y CRUD: OPERADORES DE PLANTA (MANO DE OBRA) ────────────────
  const modalOperator = document.getElementById('modalRegisterOperator');
  const btnOpenOperator = document.getElementById('btnOpenRegisterOperatorModal') || document.getElementById('btnOpenCreateOperatorModal');
  const btnCloseOperator = document.getElementById('btnCloseRegisterOperatorModal');
  const formOperator = document.getElementById('formRegisterOperator');

  function populateOperatorCascadingSelects(selectedDeptCode = null, selectedProcName = null, selectedMachine = null) {
    const deptSelect = document.getElementById('newOperatorDept');
    const procSelect = document.getElementById('newOperatorProcess');
    const machineSelect = document.getElementById('newOperatorMachineSelect');
    const machineInput = document.getElementById('newOperatorMachine');

    if (!deptSelect || !procSelect || !machineSelect || !UanifyState || !UanifyState.stations) return;

    // 1. Llenar Departamentos
    const deptList = (UanifyState.stations || []).filter(s => !s.code.startsWith('C-'));
    deptSelect.innerHTML = deptList.map(s => `
      <option value="${s.code}">${s.code} · ${s.name}</option>
    `).join('');

    if (selectedDeptCode && Array.from(deptSelect.options).some(o => o.value === selectedDeptCode)) {
      deptSelect.value = selectedDeptCode;
    } else if (deptSelect.options.length > 0) {
      deptSelect.selectedIndex = 0;
    }

    // 2. Función para actualizar procesos a partir del departamento
    const updateProcesses = () => {
      const currentDeptCode = deptSelect.value;
      const st = UanifyState.stations.find(s => s.code === currentDeptCode);
      const deptsProcesses = (st && st.processes && st.processes.length > 0)
        ? st.processes
        : [{ name: st ? st.name : 'Operación Principal' }];

      procSelect.innerHTML = deptsProcesses.map(p => `
        <option value="${p.name}">${p.name}</option>
      `).join('');

      if (selectedProcName && Array.from(procSelect.options).some(o => o.value === selectedProcName)) {
        procSelect.value = selectedProcName;
      } else if (procSelect.options.length > 0) {
        procSelect.selectedIndex = 0;
      }

      if (procSelect._uanifySelect) procSelect._uanifySelect.updateLabel();
      updateMachines();
    };

    // 3. Función para actualizar máquinas a partir del departamento / proceso
    const updateMachines = () => {
      const currentDeptCode = deptSelect.value;
      const st = UanifyState.stations.find(s => s.code === currentDeptCode);
      
      let machineList = [];
      if (st && st.machines) {
        if (typeof st.machines === 'string') {
          machineList = st.machines.split(',').map(m => m.trim()).filter(Boolean);
        } else if (Array.isArray(st.machines)) {
          machineList = st.machines.map(m => typeof m === 'object' ? (m.name || m.code) : m);
        }
      }

      if (machineList.length === 0) {
        machineList = [`Línea / Estación ${st ? st.name : 'General'}`];
      }

      machineSelect.innerHTML = machineList.map(m => `
        <option value="${m}">${m}</option>
      `).join('') + `<option value="otro">-- Otro / Puesto Específico --</option>`;

      if (selectedMachine && Array.from(machineSelect.options).some(o => o.value === selectedMachine)) {
        machineSelect.value = selectedMachine;
        if (machineInput) machineInput.value = selectedMachine;
      } else if (selectedMachine) {
        machineSelect.value = 'otro';
        if (machineInput) machineInput.value = selectedMachine;
      } else {
        machineSelect.selectedIndex = 0;
        if (machineInput) machineInput.value = machineSelect.value !== 'otro' ? machineSelect.value : '';
      }

      if (machineSelect._uanifySelect) machineSelect._uanifySelect.updateLabel();
      updatePreview();
    };

    // 4. Actualizar tarjeta de previsualización
    const updatePreview = () => {
      const currentDeptCode = deptSelect.value;
      const st = UanifyState.stations.find(s => s.code === currentDeptCode);
      const pDept = document.getElementById('opPreviewDept');
      const pProc = document.getElementById('opPreviewProcess');
      const pMach = document.getElementById('opPreviewMachine');

      if (pDept) pDept.textContent = st ? `${st.code} · ${st.name}` : currentDeptCode;
      if (pProc) pProc.textContent = procSelect.value || (st ? st.name : '-');
      const finalMach = (machineInput && machineInput.value.trim()) ? machineInput.value.trim() : (machineSelect.value !== 'otro' ? machineSelect.value : 'Puesto General');
      if (pMach) pMach.textContent = finalMach;
    };

    deptSelect.onchange = () => {
      if (deptSelect._uanifySelect) deptSelect._uanifySelect.updateLabel();
      updateProcesses();
    };

    procSelect.onchange = () => {
      if (procSelect._uanifySelect) procSelect._uanifySelect.updateLabel();
      updateMachines();
    };

    machineSelect.onchange = () => {
      if (machineSelect._uanifySelect) machineSelect._uanifySelect.updateLabel();
      if (machineSelect.value !== 'otro') {
        if (machineInput) machineInput.value = machineSelect.value;
      } else {
        if (machineInput) machineInput.value = '';
        if (machineInput) machineInput.focus();
      }
      updatePreview();
    };

    if (machineInput) {
      machineInput.oninput = () => updatePreview();
    }

    if (deptSelect._uanifySelect) deptSelect._uanifySelect.updateLabel();
    updateProcesses();
  }

  window.openCreateOperatorModal = function() {
    if (!modalOperator) return;
    if (formOperator) formOperator.reset();
    populateOperatorCascadingSelects();

    const origId = document.getElementById('opOriginalEmpId');
    const title = document.getElementById('operatorModalTitle');
    const sub = document.getElementById('operatorModalSubtitle');
    const submitBtn = document.getElementById('btnSubmitOperator');

    if (origId) origId.value = '';
    if (title) title.textContent = 'Registrar Operador de Planta (Mano de Obra)';
    if (sub) sub.textContent = 'Asignación de puesto dentro de proceso y departamento';
    if (submitBtn) submitBtn.textContent = 'Guardar Operador';

    modalOperator.classList.add('active');
  };

  window.openEditOperatorModal = function(empId) {
    const op = UanifyState.operators.find(o => o.empId === empId);
    if (!op || !modalOperator) return;

    populateOperatorCascadingSelects(op.deptCode, op.processName || null, op.machine);

    const origId = document.getElementById('opOriginalEmpId');
    const payroll = document.getElementById('newOperatorPayroll');
    const name = document.getElementById('newOperatorName');
    const title = document.getElementById('operatorModalTitle');
    const sub = document.getElementById('operatorModalSubtitle');
    const submitBtn = document.getElementById('btnSubmitOperator');

    if (origId) origId.value = op.empId;
    if (payroll) payroll.value = op.empId;
    if (name) name.value = op.name;
    if (title) title.textContent = `Editar Operador · ${op.name}`;
    if (sub) sub.textContent = `Modificando asignación de puesto y máquina para nómina ${op.empId}`;
    if (submitBtn) submitBtn.textContent = 'Actualizar Operador';

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
      const procName = document.getElementById('newOperatorProcess')?.value;
      const machineSelectVal = document.getElementById('newOperatorMachineSelect')?.value;
      const machineInputVal = document.getElementById('newOperatorMachine')?.value.trim();
      const machine = machineInputVal || (machineSelectVal !== 'otro' ? machineSelectVal : 'Puesto de Línea');
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
          op.processName = procName || deptName;
          op.machine = machine;
          op.status = status;
          op.shift = shift;

          renderOperatorsTable();
          if (typeof window.renderOperatorsDirectory === 'function') window.renderOperatorsDirectory();
          if (typeof window.updateOperatorStats === 'function') window.updateOperatorStats();
          modalOperator.classList.remove('active');

          window.UanifyUI.toast(
            `Operador "${name}" (${empId}) asignado a: ${machine} (${resolvedCode} · ${deptName}).`,
            'success',
            'Operador Actualizado'
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
        processName: procName || deptName,
        machine: machine || 'Máquina de Línea',
        shift,
        status,
        pzasToday: 85
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
        'Operador Registrado'
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

  // Asignación operativa en Modal de Editar Usuario
  const editAssignSection = document.getElementById('editSupervisorDeptsSection');
  const editAssignGrid = document.getElementById('editDeptsCheckboxesGrid');
  const editAssignSearchInp = document.getElementById('editAssignSearchInp');
  const btnClearAllDepts = document.getElementById('btnClearAllDepts');

  function renderEditAssignGrid(role, selectedCodes = [], filterQuery = '') {
    if (!editAssignGrid) return;
    const q = filterQuery.toLowerCase().trim();
    const countBadge = document.getElementById('editSelectedDeptsCount');
    const summaryBadge = document.getElementById('editDeptsOperatorsCountBadge');
    const titleEl = document.getElementById('editAssignSectionTitle');
    const subEl = document.getElementById('editAssignSectionSubtitle');

    if (role === 'ingeniero') {
      if (editAssignSection) editAssignSection.style.display = 'none';
      return;
    }
    if (editAssignSection) editAssignSection.style.display = 'block';

    if (role === 'calidad') {
      if (titleEl) titleEl.textContent = 'Puntos de Control de Calidad';
      if (subEl) subEl.textContent = 'Filtros de calidad asignados a esta inspectora:';
      const areas = UanifyState.qualityAreas || [];
      const filtered = areas.filter(a => !q || (a.name && a.name.toLowerCase().includes(q)) || (a.code && a.code.toLowerCase().includes(q)));

      if (filtered.length === 0) {
        editAssignGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:12px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron puntos de calidad</div>';
      } else {
        editAssignGrid.innerHTML = filtered.map(a => {
          const isChecked = selectedCodes.includes(a.code);
          return `
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; padding:6px 8px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:6px; cursor:pointer;" title="${a.name}">
              <input type="checkbox" class="edit-dept-cb" value="${a.code}" ${isChecked ? 'checked' : ''} style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
              <div style="flex:1; min-width:0;">
                <strong style="display:block; color:var(--text-primary); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.name}</strong>
                <small style="color:var(--text-muted); font-size:10.5px;">${a.location || 'Planta'}</small>
              </div>
            </label>
          `;
        }).join('');
      }
    } else {
      // Supervisor: Departamentos
      if (titleEl) titleEl.textContent = 'Departamentos Asignados al Supervisor';
      if (subEl) subEl.textContent = 'Estaciones sobre las cuales tiene mando operativo:';
      const depts = (UanifyState.stations || []).filter(s => !s.code.startsWith('C-'));
      const filtered = depts.filter(s => !q || (s.name && s.name.toLowerCase().includes(q)) || (s.code && s.code.toLowerCase().includes(q)));

      if (filtered.length === 0) {
        editAssignGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:12px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron departamentos</div>';
      } else {
        editAssignGrid.innerHTML = filtered.map(s => {
          const isChecked = selectedCodes.includes(s.code);
          const opCount = (UanifyState.operators || []).filter(o => o.deptCode === s.code).length;
          return `
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; padding:6px 8px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:6px; cursor:pointer;" title="${s.name}">
              <input type="checkbox" class="edit-dept-cb" value="${s.code}" ${isChecked ? 'checked' : ''} style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="color:var(--text-primary); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}</strong>
                  <small style="color:var(--text-muted); font-size:10px; margin-left:4px;">${opCount} ops</small>
                </div>
              </div>
            </label>
          `;
        }).join('');
      }
    }

    const updateEditAssignCount = () => {
      const checkedBoxes = editAssignGrid.querySelectorAll('.edit-dept-cb:checked');
      if (countBadge) countBadge.textContent = checkedBoxes.length;
      if (summaryBadge) {
        if (role === 'calidad') {
          summaryBadge.textContent = `${checkedBoxes.length} punto(s) de inspección`;
        } else {
          const codes = Array.from(checkedBoxes).map(cb => cb.value);
          const totalOps = (UanifyState.operators || []).filter(o => codes.includes(o.deptCode)).length;
          summaryBadge.textContent = `${totalOps} operadores a cargo`;
        }
      }
    };

    editAssignGrid.querySelectorAll('.edit-dept-cb').forEach(cb => {
      cb.addEventListener('change', updateEditAssignCount);
    });
    updateEditAssignCount();
  }

  if (editAssignSearchInp) {
    editAssignSearchInp.addEventListener('input', (e) => {
      const role = document.getElementById('editUserRoleSelect')?.value || 'supervisor';
      const currentChecked = Array.from(document.querySelectorAll('.edit-dept-cb:checked')).map(c => c.value);
      renderEditAssignGrid(role, currentChecked, e.target.value);
    });
  }

  if (btnClearAllDepts) {
    btnClearAllDepts.addEventListener('click', () => {
      document.querySelectorAll('.edit-dept-cb').forEach(cb => cb.checked = false);
      const countEl = document.getElementById('editSelectedDeptsCount');
      const opBadge = document.getElementById('editDeptsOperatorsCountBadge');
      if (countEl) countEl.textContent = '0';
      if (opBadge) opBadge.textContent = '0 asignados';
    });
  }

  window.openEditUserModal = function(userId) {
    const user = UanifyState.users.find(u => u.id === userId);
    if (!user || !modalEditPerms) return;

    const idInput = document.getElementById('editUserId');
    const nameInput = document.getElementById('editUserNameInput');
    const pinInput = document.getElementById('editUserPinInput');
    const roleSelect = document.getElementById('editUserRoleSelect');

    if (idInput) idInput.value = user.id;
    if (nameInput) nameInput.value = user.name;
    if (pinInput) pinInput.value = user.pin || '1234';
    if (roleSelect) roleSelect.value = user.role;
    if (editAssignSearchInp) editAssignSearchInp.value = '';

    const userDepts = user.assignedDepartments || [];
    renderEditAssignGrid(user.role, userDepts, '');

    // Configurar vista previa de permisos según rol
    updateRolePermsPreview(user.role, 'editRolePermsTitle', 'editRolePermsDesc');
    if (roleSelect) {
      roleSelect.onchange = (e) => {
        updateRolePermsPreview(e.target.value, 'editRolePermsTitle', 'editRolePermsDesc');
        if (editAssignSearchInp) editAssignSearchInp.value = '';
        renderEditAssignGrid(e.target.value, userDepts, '');
      };
    }

    modalEditPerms.classList.add('active');
  };

  window.openEditPermissionsModal = window.openEditUserModal;

  if (formEditPerms) {
    formEditPerms.onsubmit = function(e) {
      e.preventDefault();
      const userId = document.getElementById('editUserId').value;
      const user = UanifyState.users.find(u => u.id === userId);
      if (!user) return;

      const name = document.getElementById('editUserNameInput')?.value.trim() || user.name;
      const pin = document.getElementById('editUserPinInput')?.value.trim() || user.pin;
      const role = document.getElementById('editUserRoleSelect')?.value || user.role;

      if (!name) {
        window.UanifyUI.toast('Por favor ingresa el nombre del usuario.', 'warning', 'Nombre Requerido');
        return;
      }
      if (!pin || !/^[0-9]{4}$/.test(pin)) {
        window.UanifyUI.toast('El PIN de acceso debe contener exactamente 4 dígitos numéricos.', 'warning', 'PIN Inválido');
        return;
      }

      // Asignaciones
      const selectedCodes = [];
      document.querySelectorAll('.edit-dept-cb:checked').forEach(cb => {
        selectedCodes.push(cb.value);
      });

      const roleDef = RoleFixedPermissions[role] || RoleFixedPermissions.supervisor;

      user.name = name;
      user.pin = pin;
      user.role = role;
      user.permissions = [...roleDef.perms];

      if (role === 'ingeniero') {
        user.roleName = roleDef.roleName;
        user.badge = roleDef.badge;
        user.assignedDepartments = ['*'];
      } else if (role === 'calidad') {
        user.roleName = roleDef.roleName;
        user.badge = roleDef.badge;
        user.assignedDepartments = selectedCodes.length > 0 ? selectedCodes : ['C-01', 'C-02', 'C-03', 'C-04'];
      } else {
        const deptNames = selectedCodes.map(c => {
          const st = (UanifyState.stations || []).find(s => s.code === c);
          return st ? st.name : c;
        });
        user.roleName = `Supervisor (${deptNames.length > 0 ? deptNames.join(', ') : 'Sin Deptos'})`;
        user.badge = 'Supervisor';
        user.assignedDepartments = selectedCodes.length > 0 ? selectedCodes : [];
      }

      renderUsersTable();
      modalEditPerms.classList.remove('active');

      // Actualizar interfaz del usuario activo si es el editado sin reloguear ni duplicar alertas
      if (UanifyState.currentUser === user.id) {
        updateUserInterface();
      }

      const countMsg = user.assignedDepartments.includes('*') 
        ? 'Supervisión Global (14 áreas)' 
        : `${user.assignedDepartments.length} asignaciones`;

      window.UanifyUI.toast(
        `Usuario "${user.name}" actualizado correctamente (${countMsg}).`,
        'success',
        'Usuario Actualizado'
      );
    };
  }

  // ── 8. ELIMINAR USUARIO ──────────────────────────────────────────────────
  window.deleteUser = function(userId) {
    const user = UanifyState.users.find(u => u.id === userId);
    if (!user) return;

    // Validar que siempre quede al menos un Administrador / Ingeniero en el sistema
    const adminCount = UanifyState.users.filter(u => u.role === 'ingeniero' || u.role === 'admin').length;
    if ((user.role === 'ingeniero' || user.role === 'admin') && adminCount <= 1) {
      window.UanifyUI.toast(
        'No es posible eliminar al último Ingeniero (Admin Mayor). La planta requiere al menos un usuario administrador activo.',
        'warning',
        'Operación No Permitida'
      );
      return;
    }

    window.UanifyUI.confirm(
      '¿Eliminar Usuario del Sistema?',
      `¿Confirmas la baja de acceso para "${user.name}" (${user.roleName})? Ya no podrá ingresar a la terminal ni a los tableros.`,
      () => {
        UanifyState.users = UanifyState.users.filter(u => u.id !== userId);
        if (UanifyState.currentUser === userId) {
          const nextAdmin = UanifyState.users.find(u => u.role === 'ingeniero' || u.role === 'admin') || UanifyState.users[0];
          UanifyState.currentUser = nextAdmin ? nextAdmin.id : 'admin-1';
          if (typeof window.switchActiveUser === 'function') {
            window.switchActiveUser(UanifyState.currentUser);
          }
        }
        renderUsersTable();
        window.UanifyUI.toast(`Usuario "${user.name}" eliminado del sistema.`, 'info', 'Usuario Eliminado');
      },
      'Sí, Eliminar',
      'Cancelar'
    );
  };

  // ── 9. MODAL: GESTIÓN RELACIONAL DE DEPARTAMENTO (PROCESOS, MÁQUINAS CON ID, ALMACENES & SUPERVISIÓN) ─
  const modalCreateDept = document.getElementById('modalCreateDepartment');
  const btnOpenCreateDept = document.getElementById('btnOpenCreateDeptModal');
  const btnCloseCreateDept = document.getElementById('btnCloseCreateDeptModal');
  const btnCancelCreateDept = document.getElementById('btnCancelCreateDept');
  const formCreateDept = document.getElementById('formCreateDepartment');
  const newDeptSupervisor = document.getElementById('newDeptSupervisor');
  const newDeptOperatorsList = document.getElementById('newDeptOperatorsList');
  const deptProcessesContainer = document.getElementById('deptProcessesContainer');
  // ── ESTADO TEMPORAL DE ASIGNACIONES RELACIONALES EN MODAL DE DEPARTAMENTO ─
  let modalDeptSelectedProcs = [];
  let modalDeptSelectedWhs = [];
  let modalDeptSelectedQuality = [];
  let modalDeptSelectedSupervisor = '';

  let modalDeptProcsPage = 1;
  let modalDeptWhsPage = 1;
  let modalDeptQualityPage = 1;
  const MODAL_ITEMS_PER_PAGE = 4;

  // Toggle colapsable para secciones del modal de departamento (acordeón ergonómico)
  window.toggleModalCollapse = function(secId) {
    const sec = document.getElementById(secId);
    if (!sec) return;
    sec.classList.toggle('active');
  };

  // 1. RENDERIZADO DE PROCESOS (CONSULTA Y ASIGNACIÓN CON BUSCADOR Y PAGINACIÓN)
  function renderDeptModalProcs() {
    const grid = document.getElementById('deptModalProcsGrid');
    const searchInp = document.getElementById('deptModalProcsSearch');
    const countBadge = document.getElementById('deptModalProcsCountBadge');
    const pageInfo = document.getElementById('deptModalProcsPageInfo');
    const btnPrev = document.getElementById('btnDeptModalProcsPrev');
    const btnNext = document.getElementById('btnDeptModalProcsNext');
    if (!grid) return;

    const q = searchInp ? searchInp.value.toLowerCase().trim() : '';
    const allProcs = (UanifyState.processes || []).filter(p => !p.type?.includes('calidad') && !p.name?.toLowerCase().includes('calidad'));
    
    // Filtrado por nombre
    const filtered = allProcs.filter(p => !q || (p.name && p.name.toLowerCase().includes(q)) || (p.code && p.code.toLowerCase().includes(q)));
    const totalPages = Math.max(1, Math.ceil(filtered.length / MODAL_ITEMS_PER_PAGE));
    if (modalDeptProcsPage > totalPages) modalDeptProcsPage = totalPages;
    if (modalDeptProcsPage < 1) modalDeptProcsPage = 1;

    const startIdx = (modalDeptProcsPage - 1) * MODAL_ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIdx, startIdx + MODAL_ITEMS_PER_PAGE);

    if (countBadge) countBadge.textContent = `${modalDeptSelectedProcs.length} seleccionados`;
    if (pageInfo) pageInfo.textContent = `Página ${modalDeptProcsPage} de ${totalPages} (${filtered.length} total)`;
    if (btnPrev) btnPrev.disabled = modalDeptProcsPage <= 1;
    if (btnNext) btnNext.disabled = modalDeptProcsPage >= totalPages;

    if (pageItems.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:12px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron procesos coincidentes</div>';
      return;
    }

    grid.innerHTML = pageItems.map(p => {
      const isChecked = modalDeptSelectedProcs.includes(p.name);
      return `
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; padding:6px 8px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:6px; cursor:pointer;" title="${p.name}">
          <input type="checkbox" class="dept-proc-cb" value="${p.name}" ${isChecked ? 'checked' : ''} style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
          <div style="flex:1; min-width:0;">
            <strong style="display:block; color:var(--text-primary); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">⚙️ ${p.name}</strong>
            <small style="color:var(--text-muted); font-size:10px;">${p.code || 'Proceso'} · ${p.machines ? p.machines.length : 0} máquinas</small>
          </div>
        </label>
      `;
    }).join('');

    grid.querySelectorAll('.dept-proc-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const val = e.target.value;
        if (e.target.checked) {
          if (!modalDeptSelectedProcs.includes(val)) modalDeptSelectedProcs.push(val);
        } else {
          modalDeptSelectedProcs = modalDeptSelectedProcs.filter(v => v !== val);
        }
        if (countBadge) countBadge.textContent = `${modalDeptSelectedProcs.length} seleccionados`;
      });
    });
  }

  // 2. RENDERIZADO DE ALMACENES BUFFER (CONSULTA Y ASIGNACIÓN CON BUSCADOR Y PAGINACIÓN)
  function renderDeptModalWhs() {
    const grid = document.getElementById('deptModalWhsGrid');
    const searchInp = document.getElementById('deptModalWhsSearch');
    const countBadge = document.getElementById('deptModalWhsCountBadge');
    const pageInfo = document.getElementById('deptModalWhsPageInfo');
    const btnPrev = document.getElementById('btnDeptModalWhsPrev');
    const btnNext = document.getElementById('btnDeptModalWhsNext');
    if (!grid) return;

    const q = searchInp ? searchInp.value.toLowerCase().trim() : '';
    const allWhs = UanifyState.warehouses || [];

    const filtered = allWhs.filter(w => !q || (w.name && w.name.toLowerCase().includes(q)) || (w.code && w.code.toLowerCase().includes(q)));
    const totalPages = Math.max(1, Math.ceil(filtered.length / MODAL_ITEMS_PER_PAGE));
    if (modalDeptWhsPage > totalPages) modalDeptWhsPage = totalPages;
    if (modalDeptWhsPage < 1) modalDeptWhsPage = 1;

    const startIdx = (modalDeptWhsPage - 1) * MODAL_ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIdx, startIdx + MODAL_ITEMS_PER_PAGE);

    if (countBadge) countBadge.textContent = `${modalDeptSelectedWhs.length} seleccionados`;
    if (pageInfo) pageInfo.textContent = `Página ${modalDeptWhsPage} de ${totalPages} (${filtered.length} total)`;
    if (btnPrev) btnPrev.disabled = modalDeptWhsPage <= 1;
    if (btnNext) btnNext.disabled = modalDeptWhsPage >= totalPages;

    if (pageItems.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:12px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron almacenes coincidentes</div>';
      return;
    }

    grid.innerHTML = pageItems.map(w => {
      const isChecked = modalDeptSelectedWhs.includes(w.name);
      return `
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; padding:6px 8px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:6px; cursor:pointer;" title="${w.name}">
          <input type="checkbox" class="dept-wh-cb" value="${w.name}" ${isChecked ? 'checked' : ''} style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
          <div style="flex:1; min-width:0;">
            <strong style="display:block; color:var(--text-primary); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📦 ${w.name}</strong>
            <small style="color:var(--text-muted); font-size:10px;">${w.code || 'ALM'} · ${w.type || 'Buffer'}</small>
          </div>
        </label>
      `;
    }).join('');

    grid.querySelectorAll('.dept-wh-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const val = e.target.value;
        if (e.target.checked) {
          if (!modalDeptSelectedWhs.includes(val)) modalDeptSelectedWhs.push(val);
        } else {
          modalDeptSelectedWhs = modalDeptSelectedWhs.filter(v => v !== val);
        }
        if (countBadge) countBadge.textContent = `${modalDeptSelectedWhs.length} seleccionados`;
      });
    });
  }

  // 3. RENDERIZADO DE PUNTOS DE CONTROL DE CALIDAD (CONSULTA Y ASIGNACIÓN CON BUSCADOR Y PAGINACIÓN)
  function renderDeptModalQuality() {
    const grid = document.getElementById('deptModalQualityGrid');
    const searchInp = document.getElementById('deptModalQualitySearch');
    const countBadge = document.getElementById('deptModalQualityCountBadge');
    const pageInfo = document.getElementById('deptModalQualityPageInfo');
    const btnPrev = document.getElementById('btnDeptModalQualityPrev');
    const btnNext = document.getElementById('btnDeptModalQualityNext');
    if (!grid) return;

    const q = searchInp ? searchInp.value.toLowerCase().trim() : '';
    const allQuality = UanifyState.qualityAreas || [];

    const filtered = allQuality.filter(qa => !q || (qa.name && qa.name.toLowerCase().includes(q)) || (qa.code && qa.code.toLowerCase().includes(q)));
    const totalPages = Math.max(1, Math.ceil(filtered.length / MODAL_ITEMS_PER_PAGE));
    if (modalDeptQualityPage > totalPages) modalDeptQualityPage = totalPages;
    if (modalDeptQualityPage < 1) modalDeptQualityPage = 1;

    const startIdx = (modalDeptQualityPage - 1) * MODAL_ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIdx, startIdx + MODAL_ITEMS_PER_PAGE);

    if (countBadge) countBadge.textContent = `${modalDeptSelectedQuality.length} seleccionados`;
    if (pageInfo) pageInfo.textContent = `Página ${modalDeptQualityPage} de ${totalPages} (${filtered.length} total)`;
    if (btnPrev) btnPrev.disabled = modalDeptQualityPage <= 1;
    if (btnNext) btnNext.disabled = modalDeptQualityPage >= totalPages;

    if (pageItems.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:12px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron puntos de calidad</div>';
      return;
    }

    grid.innerHTML = pageItems.map(qa => {
      const isChecked = modalDeptSelectedQuality.includes(qa.code);
      return `
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; padding:6px 8px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:6px; cursor:pointer;" title="${qa.name}">
          <input type="checkbox" class="dept-qa-cb" value="${qa.code}" ${isChecked ? 'checked' : ''} style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
          <div style="flex:1; min-width:0;">
            <strong style="display:block; color:var(--text-primary); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">🔬 ${qa.name}</strong>
            <small style="color:var(--text-muted); font-size:10px;">${qa.code} · ${qa.location || 'Filtro'}</small>
          </div>
        </label>
      `;
    }).join('');

    grid.querySelectorAll('.dept-qa-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const val = e.target.value;
        if (e.target.checked) {
          if (!modalDeptSelectedQuality.includes(val)) modalDeptSelectedQuality.push(val);
        } else {
          modalDeptSelectedQuality = modalDeptSelectedQuality.filter(v => v !== val);
        }
        if (countBadge) countBadge.textContent = `${modalDeptSelectedQuality.length} seleccionados`;
      });
    });
  }

  // 4. RENDERIZADO DE SUPERVISOR (EXCLUSIVAMENTE 1 MEDIANTE RADIOS CON BUSCADOR POR NOMBRE)
  function renderDeptModalSupervisors(filterQuery = '') {
    const listEl = document.getElementById('deptModalSupervisorsList');
    if (!listEl || !UanifyState.users) return;

    const q = filterQuery.toLowerCase().trim();
    const supervisors = UanifyState.users.filter(u => u.role === 'supervisor' || u.role === 'admin' || u.role === 'ingeniero');
    const filtered = supervisors.filter(s => !q || (s.name && s.name.toLowerCase().includes(q)) || (s.roleName && s.roleName.toLowerCase().includes(q)));

    if (filtered.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; padding:12px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron supervisores coincidentes</div>';
      return;
    }

    listEl.innerHTML = filtered.map(s => {
      const isSelected = modalDeptSelectedSupervisor === s.id || modalDeptSelectedSupervisor === s.name;
      return `
        <label style="display:flex; align-items:center; gap:10px; font-size:12.5px; padding:7px 10px; background:${isSelected ? 'rgba(139, 94, 60, 0.06)' : '#FFFFFF'}; border:1px solid ${isSelected ? 'var(--color-brand)' : 'var(--border-subtle)'}; border-radius:6px; cursor:pointer;" title="${s.name}">
          <input type="radio" name="deptSelectedSupervisorRadio" value="${s.id}" data-name="${s.name}" ${isSelected ? 'checked' : ''} style="cursor:pointer; accent-color:var(--color-brand); width:16px; height:16px;">
          <div style="flex:1; min-width:0;">
            <strong style="display:block; color:var(--text-primary); font-size:12.5px;">${s.name}</strong>
            <small style="color:var(--text-muted); font-size:11px;">${s.badge || s.roleName || 'Supervisor de Planta'}</small>
          </div>
        </label>
      `;
    }).join('');

    listEl.querySelectorAll('input[name="deptSelectedSupervisorRadio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          modalDeptSelectedSupervisor = e.target.value;
          renderDeptModalSupervisors(newDeptSupervisorSearch ? newDeptSupervisorSearch.value : '');
        }
      });
    });
  }

  // Listeners de búsqueda y paginación en el modal de departamento
  const deptModalProcsSearch = document.getElementById('deptModalProcsSearch');
  if (deptModalProcsSearch) {
    deptModalProcsSearch.addEventListener('input', () => {
      modalDeptProcsPage = 1;
      renderDeptModalProcs();
    });
  }
  const btnDeptModalProcsPrev = document.getElementById('btnDeptModalProcsPrev');
  if (btnDeptModalProcsPrev) {
    btnDeptModalProcsPrev.addEventListener('click', () => {
      if (modalDeptProcsPage > 1) {
        modalDeptProcsPage--;
        renderDeptModalProcs();
      }
    });
  }
  const btnDeptModalProcsNext = document.getElementById('btnDeptModalProcsNext');
  if (btnDeptModalProcsNext) {
    btnDeptModalProcsNext.addEventListener('click', () => {
      modalDeptProcsPage++;
      renderDeptModalProcs();
    });
  }
  const btnClearDeptModalProcs = document.getElementById('btnClearDeptModalProcs');
  if (btnClearDeptModalProcs) {
    btnClearDeptModalProcs.addEventListener('click', () => {
      modalDeptSelectedProcs = [];
      renderDeptModalProcs();
    });
  }

  const deptModalWhsSearch = document.getElementById('deptModalWhsSearch');
  if (deptModalWhsSearch) {
    deptModalWhsSearch.addEventListener('input', () => {
      modalDeptWhsPage = 1;
      renderDeptModalWhs();
    });
  }
  const btnDeptModalWhsPrev = document.getElementById('btnDeptModalWhsPrev');
  if (btnDeptModalWhsPrev) {
    btnDeptModalWhsPrev.addEventListener('click', () => {
      if (modalDeptWhsPage > 1) {
        modalDeptWhsPage--;
        renderDeptModalWhs();
      }
    });
  }
  const btnDeptModalWhsNext = document.getElementById('btnDeptModalWhsNext');
  if (btnDeptModalWhsNext) {
    btnDeptModalWhsNext.addEventListener('click', () => {
      modalDeptWhsPage++;
      renderDeptModalWhs();
    });
  }
  const btnClearDeptModalWhs = document.getElementById('btnClearDeptModalWhs');
  if (btnClearDeptModalWhs) {
    btnClearDeptModalWhs.addEventListener('click', () => {
      modalDeptSelectedWhs = [];
      renderDeptModalWhs();
    });
  }

  const deptModalQualitySearch = document.getElementById('deptModalQualitySearch');
  if (deptModalQualitySearch) {
    deptModalQualitySearch.addEventListener('input', () => {
      modalDeptQualityPage = 1;
      renderDeptModalQuality();
    });
  }
  const btnDeptModalQualityPrev = document.getElementById('btnDeptModalQualityPrev');
  if (btnDeptModalQualityPrev) {
    btnDeptModalQualityPrev.addEventListener('click', () => {
      if (modalDeptQualityPage > 1) {
        modalDeptQualityPage--;
        renderDeptModalQuality();
      }
    });
  }
  const btnDeptModalQualityNext = document.getElementById('btnDeptModalQualityNext');
  if (btnDeptModalQualityNext) {
    btnDeptModalQualityNext.addEventListener('click', () => {
      modalDeptQualityPage++;
      renderDeptModalQuality();
    });
  }
  const btnClearDeptModalQuality = document.getElementById('btnClearDeptModalQuality');
  if (btnClearDeptModalQuality) {
    btnClearDeptModalQuality.addEventListener('click', () => {
      modalDeptSelectedQuality = [];
      renderDeptModalQuality();
    });
  }

  const newDeptSupervisorSearch = document.getElementById('newDeptSupervisorSearch');
  if (newDeptSupervisorSearch) {
    newDeptSupervisorSearch.addEventListener('input', (e) => {
      renderDeptModalSupervisors(e.target.value);
    });
  }

  function openCreateDeptModal() {
    if (!modalCreateDept) return;

    const editModeInput = document.getElementById('deptModalEditMode');
    const origCodeInput = document.getElementById('deptModalOriginalCode');
    const modalTitle = document.getElementById('deptModalTitle');

    if (editModeInput) editModeInput.value = 'create';
    if (origCodeInput) origCodeInput.value = '';
    if (modalTitle) modalTitle.textContent = 'Nuevo Departamento & Asignación Relacional';

    const newDeptCodeInput = document.getElementById('newDeptCode');
    const nextNum = (UanifyState.stations || []).length + 1;
    const nextCode = `D-${String(nextNum).padStart(2, '0')}`;
    if (newDeptCodeInput) newDeptCodeInput.value = nextCode;

    const nameInput = document.getElementById('newDeptName');
    if (nameInput) nameInput.value = '';

    // Asignaciones iniciales completamente vacías para un nuevo departamento
    modalDeptSelectedProcs = [];
    modalDeptSelectedWhs = [];
    modalDeptSelectedQuality = [];
    modalDeptSelectedSupervisor = '';

    modalDeptProcsPage = 1;
    modalDeptWhsPage = 1;
    modalDeptQualityPage = 1;

    if (deptModalProcsSearch) deptModalProcsSearch.value = '';
    if (deptModalWhsSearch) deptModalWhsSearch.value = '';
    if (deptModalQualitySearch) deptModalQualitySearch.value = '';
    if (newDeptSupervisorSearch) newDeptSupervisorSearch.value = '';

    // Cerrar inicialmente todos los acordeones para una vista limpia y compacta
    ['secDeptDatos', 'secDeptProcesos', 'secDeptAlmacenes', 'secDeptCalidad', 'secDeptSupervision'].forEach(secId => {
      const el = document.getElementById(secId);
      if (el) el.classList.remove('active');
    });

    renderDeptModalProcs();
    renderDeptModalWhs();
    renderDeptModalQuality();
    renderDeptModalSupervisors();

    modalCreateDept.classList.add('active');
  }

  function openEditDepartmentModal(deptCode) {
    if (!modalCreateDept) return;
    const station = (UanifyState.stations || []).find(s => s.code === deptCode || s.id === deptCode);
    if (!station) return;

    const editModeInput = document.getElementById('deptModalEditMode');
    const origCodeInput = document.getElementById('deptModalOriginalCode');
    const modalTitle = document.getElementById('deptModalTitle');

    if (editModeInput) editModeInput.value = 'edit';
    if (origCodeInput) origCodeInput.value = station.code || station.id;
    if (modalTitle) modalTitle.textContent = `Editar Departamento · ${station.code} - ${station.name}`;

    const codeInput = document.getElementById('newDeptCode');
    const nameInput = document.getElementById('newDeptName');

    if (codeInput) codeInput.value = station.code || '';
    if (nameInput) nameInput.value = station.name || '';

    // Extraer procesos asignados
    const linkedProcs = (UanifyState.processes || []).filter(p => p.deptCode === station.code).map(p => p.name);
    modalDeptSelectedProcs = linkedProcs.length > 0 
      ? linkedProcs 
      : (station.processes ? station.processes.split(/[,;]/).map(p => p.trim()).filter(Boolean) : []);

    // Extraer almacenes asignados
    const linkedWhs = station.intermediateWarehouse 
      ? station.intermediateWarehouse.split(/[,;]/).map(w => w.replace(/\s*\([A-Z0-9\-]+\)/gi, '').trim()).filter(Boolean)
      : [];
    modalDeptSelectedWhs = linkedWhs;

    // Extraer puntos de calidad asignados
    const linkedQualities = (UanifyState.qualityAreas || []).filter(q => q.deptCode === station.code || q.deptCode === station.id).map(q => q.code);
    modalDeptSelectedQuality = linkedQualities;

    // Extraer supervisor único asignado
    const foundSup = (UanifyState.users || []).find(u => u.name === station.operator || (u.assignedDepartments && u.assignedDepartments.includes(station.code)));
    modalDeptSelectedSupervisor = foundSup ? foundSup.id : '';

    modalDeptProcsPage = 1;
    modalDeptWhsPage = 1;
    modalDeptQualityPage = 1;

    if (deptModalProcsSearch) deptModalProcsSearch.value = '';
    if (deptModalWhsSearch) deptModalWhsSearch.value = '';
    if (deptModalQualitySearch) deptModalQualitySearch.value = '';
    // Cerrar inicialmente los acordeones para una vista limpia y compacta
    ['secDeptDatos', 'secDeptProcesos', 'secDeptAlmacenes', 'secDeptCalidad', 'secDeptSupervision'].forEach(secId => {
      const el = document.getElementById(secId);
      if (el) el.classList.remove('active');
    });

    renderDeptModalProcs();
    renderDeptModalWhs();
    renderDeptModalQuality();
    renderDeptModalSupervisors();

    modalCreateDept.classList.add('active');
  }

  function deleteDepartment(deptCode) {
    const station = (UanifyState.stations || []).find(s => s.code === deptCode || s.id === deptCode);
    if (!station) return;

    window.UanifyUI.confirm(
      `¿Estás seguro de eliminar el departamento ${station.code} - "${station.name}"? Esta acción desvinculará sus procesos, maquinaria y almacenes asociados de la configuración.`,
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
          `Departamento ${station.code} "${station.name}" eliminado del catálogo.`,
          'info',
          'Departamento Eliminado'
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

      if (!name) {
        window.UanifyUI.toast('Por favor ingresa el nombre del departamento.', 'warning', 'Campo Requerido');
        return;
      }

      if (!modalDeptSelectedSupervisor) {
        window.UanifyUI.toast('Debes seleccionar exactamente un supervisor responsable.', 'warning', 'Supervisor Requerido');
        return;
      }

      const supervisor = (UanifyState.users || []).find(u => u.id === modalDeptSelectedSupervisor || u.name === modalDeptSelectedSupervisor) || (UanifyState.users || [])[0];

      // Vincular procesos seleccionados a este departamento
      (UanifyState.processes || []).forEach(p => {
        if (modalDeptSelectedProcs.includes(p.name)) {
          p.deptCode = code;
        } else if (p.deptCode === (isEdit ? origCode : code)) {
          p.deptCode = '';
        }
      });

      // Vincular puntos de calidad seleccionados a este departamento
      (UanifyState.qualityAreas || []).forEach(qa => {
        if (modalDeptSelectedQuality.includes(qa.code)) {
          qa.deptCode = code;
        } else if (qa.deptCode === (isEdit ? origCode : code)) {
          qa.deptCode = '';
        }
      });

      const processesSummary = modalDeptSelectedProcs.join(', ');
      const warehousesSummary = modalDeptSelectedWhs.join(', ');

      const hasCalidad = modalDeptSelectedQuality.length > 0;
      const hasPrensas = modalDeptSelectedProcs.some(p => p.toLowerCase().includes('prensa'));
      const inferredType = hasCalidad ? 'calidad' : (hasPrensas || code === 'D-05' ? 'prensas' : (code === 'D-11' ? 'logistica' : 'manufactura'));

      if (isEdit) {
        const stIndex = (UanifyState.stations || []).findIndex(s => s.code === origCode || s.id === origCode);
        if (stIndex !== -1) {
          const st = UanifyState.stations[stIndex];
          st.code = code;
          st.name = name;
          st.processes = processesSummary || name;
          st.type = inferredType;
          st.intermediateWarehouse = warehousesSummary || `Buffer Intermedio ${name}`;
          st.operator = supervisor ? supervisor.name : 'Supervisor de Turno';
        }
      } else {
        const newStation = {
          id: 'dept-' + code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          code: code,
          name: name,
          desc: `Departamento de manufactura en planta ${name}`,
          processes: processesSummary || name,
          type: inferredType,
          intermediateWarehouse: warehousesSummary || `Buffer Intermedio ${name}`,
          warehouseLocation: 'Nave Central',
          wipCapacity: 180,
          target: 180,
          produced: 0,
          scrap: 0,
          wipWaiting: 0,
          cycleTime: '35s',
          machines: 'Estaciones operativas',
          operator: supervisor ? supervisor.name : 'Supervisor de Turno',
          note: `Departamento registrado. Supervisado por ${supervisor ? supervisor.name : 'Planta'}.`
        };

        if (!UanifyState.stations) UanifyState.stations = [];
        UanifyState.stations.push(newStation);
      }

      // Asignar departamento exclusivamente al supervisor seleccionado (Relación estricta de 1 supervisor)
      (UanifyState.users || []).forEach(u => {
        if (u.id === supervisor.id) {
          if (!u.assignedDepartments) u.assignedDepartments = [];
          if (!u.assignedDepartments.includes('*') && !u.assignedDepartments.includes(code)) {
            u.assignedDepartments.push(code);
          }
        } else if (isEdit && u.assignedDepartments && !u.assignedDepartments.includes('*')) {
          u.assignedDepartments = u.assignedDepartments.filter(c => c !== origCode && c !== code);
        }
      });

      // Persistencia
      try {
        localStorage.setItem('uanify_custom_stations', JSON.stringify(UanifyState.stations));
        localStorage.setItem('uanify_processes', JSON.stringify(UanifyState.processes));
        localStorage.setItem('uanify_quality_areas', JSON.stringify(UanifyState.qualityAreas));
        localStorage.setItem('uanify_users', JSON.stringify(UanifyState.users));
      } catch (err) {
        console.warn('Error saving data:', err);
      }

      modalCreateDept.classList.remove('active');
      renderDepartmentsConfig();
      renderUsersTable();

      window.UanifyUI.toast(
        `Departamento ${code} "${name}" guardado exitosamente con ${modalDeptSelectedProcs.length} procesos, ${modalDeptSelectedWhs.length} almacenes y supervisor ${supervisor.name}.`,
        'success',
        'Departamento Guardado'
      );
      if (typeof EventBus !== 'undefined') {
        EventBus.emit('stations-updated', UanifyState.stations);
      }
    });
  }

  // ── 5.1. CREACIÓN INDEPENDIENTE DE PROCESOS (ASIGNACIÓN ÚNICA A DEPARTAMENTO) ──
  const modalCreateProcStandalone = document.getElementById('modalCreateProcessStandalone');
  const btnCloseProcStandalone = document.getElementById('btnCloseCreateProcessStandaloneModal');
  const btnCancelProcStandalone = document.getElementById('btnCancelCreateProcessStandalone');
  const formCreateProcStandalone = document.getElementById('formCreateProcessStandalone');

  function openCreateProcessModal() {
    if (!modalCreateProcStandalone) return;
    const nameInp = document.getElementById('procStandaloneName');
    const cycleInp = document.getElementById('procStandaloneCycle');
    const deptSelect = document.getElementById('procStandaloneDept');

    if (nameInp) nameInp.value = '';
    if (cycleInp) cycleInp.value = '35s';

    // Poblar selector de departamentos disponibles
    if (deptSelect && UanifyState.stations) {
      deptSelect.innerHTML = '<option value="">Selecciona un departamento...</option>' + 
        UanifyState.stations.map(st => `<option value="${st.code || st.id}">${st.name}</option>`).join('');
    }

    modalCreateProcStandalone.classList.add('active');
  }

  if (btnCloseProcStandalone) btnCloseProcStandalone.addEventListener('click', () => modalCreateProcStandalone.classList.remove('active'));
  if (btnCancelProcStandalone) btnCancelProcStandalone.addEventListener('click', () => modalCreateProcStandalone.classList.remove('active'));

  if (formCreateProcStandalone) {
    formCreateProcStandalone.addEventListener('submit', (e) => {
      e.preventDefault();
      const procName = document.getElementById('procStandaloneName')?.value.trim();
      const procType = document.getElementById('procStandaloneType')?.value || 'manufactura';
      const procCycle = document.getElementById('procStandaloneCycle')?.value.trim() || '35s';
      const targetDeptCode = document.getElementById('procStandaloneDept')?.value;

      if (!procName) {
        return window.UanifyUI.toast('Por favor ingresa el nombre del proceso.', 'warning', 'Campo Requerido');
      }
      if (!targetDeptCode) {
        return window.UanifyUI.toast('Debes seleccionar un departamento responsable para este proceso.', 'warning', 'Departamento Requerido');
      }

      // Validar regla de unicidad: Verificar si el proceso con este nombre ya está asignado a otro departamento
      if (!UanifyState.processes) UanifyState.processes = [];
      const existingProc = UanifyState.processes.find(p => p.name.toLowerCase() === procName.toLowerCase());
      if (existingProc && existingProc.deptCode && existingProc.deptCode !== targetDeptCode) {
        const assignedDept = (UanifyState.stations || []).find(s => s.code === existingProc.deptCode);
        const deptLabel = assignedDept ? assignedDept.name : existingProc.deptCode;
        return window.UanifyUI.toast(
          `El proceso "${procName}" ya está asignado exclusivamente al departamento "${deptLabel}". No puede asignarse a más de un departamento.`,
          'error',
          'Asignación Duplicada No Permitida'
        );
      }

      const targetDept = (UanifyState.stations || []).find(s => s.code === targetDeptCode || s.id === targetDeptCode);
      const newProcObj = {
        id: `PROC-${targetDeptCode}-${Date.now().toString().slice(-4)}`,
        code: `PROC-${String(UanifyState.processes.length + 1).padStart(2, '0')}`,
        name: procName,
        deptCode: targetDeptCode,
        type: procType,
        cycleTime: procCycle,
        machines: []
      };

      UanifyState.processes.push(newProcObj);

      // Si el departamento en stations no tiene actualizado el string de procesos, agregar
      if (targetDept) {
        const curr = targetDept.processes ? targetDept.processes.split(/[,;]/).map(x => x.trim()) : [];
        if (!curr.some(x => x.toLowerCase() === procName.toLowerCase())) {
          curr.push(procName);
          targetDept.processes = curr.join(', ');
        }
      }

      try {
        localStorage.setItem('uanify_processes', JSON.stringify(UanifyState.processes));
        localStorage.setItem('uanify_custom_stations', JSON.stringify(UanifyState.stations));
      } catch (err) {
        console.warn('Error saving process:', err);
      }

      modalCreateProcStandalone.classList.remove('active');
      renderDepartmentsConfig();
      if (typeof renderProcessesConfig === 'function') renderProcessesConfig();

      window.UanifyUI.toast(
        `Proceso "${procName}" creado y asignado exitosamente al departamento "${targetDept ? targetDept.name : targetDeptCode}".`,
        'success',
        'Proceso Registrado'
      );
    });
  }

  // ── 5.2. CREACIÓN INDEPENDIENTE DE ALMACÉN INTERMEDIO (ASIGNACIÓN ÚNICA A DEPARTAMENTO) ──
  const modalCreateWhStandalone = document.getElementById('modalCreateWarehouseStandalone');
  const btnCloseWhStandalone = document.getElementById('btnCloseCreateWarehouseStandaloneModal');
  const btnCancelWhStandalone = document.getElementById('btnCancelCreateWarehouseStandalone');
  const formCreateWhStandalone = document.getElementById('formCreateWarehouseStandalone');

  function openCreateWarehouseModal() {
    if (!modalCreateWhStandalone) return;
    const nameInp = document.getElementById('whStandaloneName');
    const capInp = document.getElementById('whStandaloneCap');
    const locInp = document.getElementById('whStandaloneLocation');
    const deptSelect = document.getElementById('whStandaloneDept');

    if (nameInp) nameInp.value = '';
    if (capInp) capInp.value = '180';
    if (locInp) locInp.value = 'Nave Central - Pasillo de Traspaso';

    // Poblar selector de departamentos
    if (deptSelect && UanifyState.stations) {
      deptSelect.innerHTML = '<option value="">Selecciona un departamento...</option>' + 
        UanifyState.stations.map(st => `<option value="${st.code || st.id}">${st.name}</option>`).join('');
    }

    modalCreateWhStandalone.classList.add('active');
  }

  if (btnCloseWhStandalone) btnCloseWhStandalone.addEventListener('click', () => modalCreateWhStandalone.classList.remove('active'));
  if (btnCancelWhStandalone) btnCancelWhStandalone.addEventListener('click', () => modalCreateWhStandalone.classList.remove('active'));

  if (formCreateWhStandalone) {
    formCreateWhStandalone.addEventListener('submit', (e) => {
      e.preventDefault();
      const whName = document.getElementById('whStandaloneName')?.value.trim();
      const whType = document.getElementById('whStandaloneType')?.value || 'Buffer de Salida';
      const whCap = parseInt(document.getElementById('whStandaloneCap')?.value, 10) || 180;
      const whLoc = document.getElementById('whStandaloneLocation')?.value.trim() || 'Nave Central';
      const targetDeptCode = document.getElementById('whStandaloneDept')?.value;

      if (!whName) {
        return window.UanifyUI.toast('Por favor ingresa el nombre del almacén intermedio.', 'warning', 'Nombre Requerido');
      }
      if (!targetDeptCode) {
        return window.UanifyUI.toast('Debes seleccionar el departamento al que pertenecerá este almacén.', 'warning', 'Departamento Requerido');
      }

      // Validar regla de unicidad: Verificar si este almacén ya está asignado a otro departamento
      const stations = UanifyState.stations || [];
      const alreadyAssignedStation = stations.find(s => {
        if (!s.intermediateWarehouse) return false;
        const list = s.intermediateWarehouse.split(/[,;]/).map(w => w.trim().toLowerCase());
        return list.includes(whName.toLowerCase()) && (s.code !== targetDeptCode && s.id !== targetDeptCode);
      });

      if (alreadyAssignedStation) {
        return window.UanifyUI.toast(
          `El almacén "${whName}" ya está asignado exclusivamente al departamento "${alreadyAssignedStation.name}". Un almacén no puede asignarse a más de un departamento.`,
          'error',
          'Almacén ya Asignado'
        );
      }

      // Asociar al departamento destino
      const targetDept = stations.find(s => s.code === targetDeptCode || s.id === targetDeptCode);
      if (targetDept) {
        const curr = targetDept.intermediateWarehouse ? targetDept.intermediateWarehouse.split(/[,;]/).map(x => x.trim()) : [];
        if (!curr.some(x => x.toLowerCase() === whName.toLowerCase())) {
          curr.push(whName);
          targetDept.intermediateWarehouse = curr.join(', ');
        }
        targetDept.warehouseLocation = whLoc;
      }

      // También registrar en UanifyState.warehouses si no existe
      if (!UanifyState.warehouses) UanifyState.warehouses = [];
      const existingWh = UanifyState.warehouses.find(w => w.name.toLowerCase() === whName.toLowerCase());
      if (!existingWh) {
        UanifyState.warehouses.push({
          id: 'wh-int-' + Date.now().toString().slice(-4),
          code: `ALM-INT-${String(UanifyState.warehouses.length + 1).padStart(2, '0')}`,
          name: whName,
          type: whType,
          location: whLoc,
          stock: '0 pzas',
          items: `Pulmón intermedio exclusivo para ${targetDept ? targetDept.name : targetDeptCode}`,
          capPercent: 0,
          status: 'Operativo',
          statusClass: 'badge-status-green',
          assignedDeptCode: targetDeptCode
        });
      }

      try {
        localStorage.setItem('uanify_custom_stations', JSON.stringify(UanifyState.stations));
        localStorage.setItem('uanify_warehouses', JSON.stringify(UanifyState.warehouses));
      } catch (err) {
        console.warn('Error saving warehouse:', err);
      }

      modalCreateWhStandalone.classList.remove('active');
      renderDepartmentsConfig();

      window.UanifyUI.toast(
        `Almacén intermedio "${whName}" asignado exclusivamente al departamento "${targetDept ? targetDept.name : targetDeptCode}".`,
        'success',
        'Almacén Registrado'
      );
    });
  }

  // ── 5.3. VISOR INTERACTIVO DE DETALLES DEL DEPARTAMENTO (SIN IDS TÉCNICOS) ──
  const modalDeptViewer = document.getElementById('modalDeptDetailViewer');
  const btnCloseDeptViewer = document.getElementById('btnCloseDeptViewerModal');
  const btnCloseDeptViewerBtn = document.getElementById('btnCloseDeptViewerBtn');

  function openDeptDetailViewer(deptCode) {
    if (!modalDeptViewer || !UanifyState.stations) return;
    const station = UanifyState.stations.find(s => s.code === deptCode || s.id === deptCode);
    if (!station) return;

    const titleEl = document.getElementById('deptViewerTitle');
    const subEl = document.getElementById('deptViewerSubtitle');
    const supEl = document.getElementById('deptViewerSupervisor');
    const codeBadgeEl = document.getElementById('deptViewerCodeBadge');
    const procListEl = document.getElementById('deptViewerProcessesList');
    const procsCountEl = document.getElementById('deptViewerProcsCount');
    const qualSecEl = document.getElementById('deptViewerQualitySection');
    const qualListEl = document.getElementById('deptViewerQualityList');
    const qualCountEl = document.getElementById('deptViewerQualityCount');
    const whListEl = document.getElementById('deptViewerWarehousesList');
    const whsCountEl = document.getElementById('deptViewerWhsCount');

    if (titleEl) titleEl.innerHTML = `<span>${station.name}</span>`;
    if (subEl) subEl.textContent = `Estructura operativa de procesos, maquinaria y almacenes intermedios para ${station.name}`;
    if (supEl) supEl.textContent = station.operator || 'Supervisor Asignado';
    if (codeBadgeEl) codeBadgeEl.textContent = station.code || 'DEPTO';

    // 1. Procesos asociados al departamento
    let deptProcesses = (UanifyState.processes || []).filter(p => p.deptCode === station.code);
    if (deptProcesses.length === 0 && station.processes) {
      deptProcesses = station.processes.split(/[,;]/).map((p, idx) => {
        const cleanName = p.trim().replace(/^(PROC-\d+|C-\d+)\s*/i, '');
        return {
          id: `PROC-${station.code}-${idx+1}`,
          code: `PROC-${String(idx+1).padStart(2, '0')}`,
          name: cleanName,
          machines: []
        };
      }).filter(p => p.name);
    }

    if (procsCountEl) procsCountEl.textContent = `${deptProcesses.length} ${deptProcesses.length === 1 ? 'proceso' : 'procesos'}`;

    if (procListEl) {
      if (deptProcesses.length > 0) {
        procListEl.innerHTML = deptProcesses.map(p => {
          const cleanName = (p.name || '').replace(/^(PROC-\d+|C-\d+)\s*/i, '');
          const machCount = Array.isArray(p.machines) ? p.machines.length : 0;
          const procId = p.id || p.code;

          return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border:1px solid var(--border-subtle); padding:10px 14px; border-radius:8px; gap:12px;">
              <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                <span class="chip-clean chip-clean-process" style="font-weight:700;">⚙️ ${cleanName}</span>
              </div>
              <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                <span style="font-size:12px; font-weight:700; color:var(--text-secondary); background:#FFFFFF; border:1px solid var(--border-subtle); padding:3px 8px; border-radius:6px;">
                  🏭 ${machCount} ${machCount === 1 ? 'máquina' : 'máquinas'}
                </span>
                <button type="button" class="btn-table-action" onclick="window.openProcessDetailViewer('${procId}')" title="Ver detalle de máquinas asignadas a este proceso" style="height:30px; width:30px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:6px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>
          `;
        }).join('');
      } else {
        procListEl.innerHTML = '<span style="font-size:12px; color:var(--text-muted); font-style:italic; padding:6px 0;">Sin procesos asignados</span>';
      }
    }

    // 2. Filtros de Calidad vinculados al departamento
    const deptQualities = (UanifyState.qualityAreas || []).filter(q => q.deptCode === station.code || q.deptCode === station.id);
    if (qualCountEl) qualCountEl.textContent = `${deptQualities.length} ${deptQualities.length === 1 ? 'filtro' : 'filtros'}`;

    if (qualSecEl) {
      if (deptQualities.length > 0) {
        qualSecEl.style.display = 'block';
        if (qualListEl) {
          qualListEl.innerHTML = deptQualities.map(q => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#FFFBEB; border:1px solid #FDE68A; padding:9px 14px; border-radius:8px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="chip-clean chip-clean-quality" style="font-weight:700;">🔬 ${q.name}</span>
                <span style="font-size:11.5px; color:#B45309; font-weight:700;">(${q.code})</span>
              </div>
              <div style="font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:5px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-brand);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>${q.inspector || 'Inspector por asignar'}</span>
              </div>
            </div>
          `).join('');
        }
      } else {
        qualSecEl.style.display = 'none';
      }
    }

    // 3. Almacenes Intermedios Asignados y Capacidad WIP Limpia
    const rawWhList = (station.intermediateWarehouse ? station.intermediateWarehouse.split(/[,;]/) : []).map(w => w.trim().replace(/\s*\([A-Z0-9\-]+\)/gi, '')).filter(Boolean);
    const whList = rawWhList.length > 0 ? rawWhList : [`Buffer ${station.name}`];
    if (whsCountEl) whsCountEl.textContent = `${whList.length} ${whList.length === 1 ? 'almacén' : 'almacenes'}`;

    if (whListEl) {
      if (whList.length > 0) {
        const defaultCap = station.wipCapacity || 180;
        whListEl.innerHTML = whList.map(w => {
          // Si existe en UanifyState.warehouses buscar su capacidad real, si no usar la de la estación
          const matchedWh = (UanifyState.warehouses || []).find(wh => wh.name.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(wh.name.toLowerCase()));
          const capText = matchedWh?.stock ? matchedWh.stock : `${defaultCap} piezas`;

          return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border:1px solid var(--border-subtle); padding:10px 14px; border-radius:8px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="chip-clean-wh" style="font-size:12.5px; font-weight:700;">📦 ${w}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:11.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Capacidad WIP:</span>
                <span style="font-family:var(--font-mono); font-size:12.5px; font-weight:800; color:var(--color-brand); background:rgba(139,94,60,0.08); padding:3px 10px; border-radius:6px; border:1px solid rgba(139,94,60,0.2);">${capText}</span>
              </div>
            </div>
          `;
        }).join('');
      } else {
        whListEl.innerHTML = '<span style="font-size:12px; color:var(--text-muted); font-style:italic; padding:6px 0;">Sin almacenes asociados</span>';
      }
    }

    modalDeptViewer.classList.add('active');
  }

  if (btnCloseDeptViewer) {
    btnCloseDeptViewer.addEventListener('click', () => {
      if (modalDeptViewer) modalDeptViewer.classList.remove('active');
    });
  }
  if (btnCloseDeptViewerBtn) {
    btnCloseDeptViewerBtn.addEventListener('click', () => {
      if (modalDeptViewer) modalDeptViewer.classList.remove('active');
    });
  }

  // ── 5.3. CREACIÓN INDEPENDIENTE DE MÁQUINA / PUESTO (JERARQUÍA: MÁQUINA ⊂ PROCESO ⊂ DEPARTAMENTO) ──
  const modalCreateMachStandalone = document.getElementById('modalCreateMachineStandalone');
  const btnCloseMachStandalone = document.getElementById('btnCloseCreateMachineStandaloneModal');
  const btnCancelMachStandalone = document.getElementById('btnCancelCreateMachineStandalone');
  const formCreateMachStandalone = document.getElementById('formCreateMachineStandalone');
  const machDeptSelect = document.getElementById('machStandaloneDept');
  const machProcSelect = document.getElementById('machStandaloneProcess');
  const machHierarchyPreview = document.getElementById('machStandaloneHierarchyPreview');

  function updateMachineHierarchyPreview() {
    if (!machHierarchyPreview) return;
    const deptCode = machDeptSelect ? machDeptSelect.value : '';
    const procIdOrName = machProcSelect ? machProcSelect.value : '';
    const dept = (UanifyState.stations || []).find(s => s.code === deptCode || s.id === deptCode);
    const proc = (UanifyState.processes || []).find(p => p.id === procIdOrName || p.name === procIdOrName);

    if (dept && proc) {
      machHierarchyPreview.innerHTML = `<span style="color:var(--color-brand); font-weight:700;">${dept.name}</span> &rarr; <span style="color:var(--text-primary); font-weight:700;">${proc.name}</span>`;
    } else if (dept) {
      machHierarchyPreview.innerHTML = `<span style="color:var(--color-brand); font-weight:700;">${dept.name}</span> &rarr; <span style="color:var(--text-muted); font-style:italic;">(Selecciona proceso)</span>`;
    } else {
      machHierarchyPreview.innerHTML = `<span style="color:var(--text-muted); font-style:italic;">(Selecciona depto y proceso)</span>`;
    }
  }

  function populateMachineDeptSelect(selectedDeptCode = '') {
    if (!machDeptSelect || !UanifyState.stations) return;
    machDeptSelect.innerHTML = '<option value="">Selecciona un departamento...</option>' + 
      UanifyState.stations.map(st => `<option value="${st.code || st.id}" ${st.code === selectedDeptCode ? 'selected' : ''}>${st.name}</option>`).join('');
    populateMachineProcessSelect(selectedDeptCode);
  }

  function populateMachineProcessSelect(deptCode = '') {
    if (!machProcSelect) return;
    if (!deptCode) {
      machProcSelect.innerHTML = '<option value="">Selecciona primero un departamento...</option>';
      updateMachineHierarchyPreview();
      return;
    }

    const availableProcs = (UanifyState.processes || []).filter(p => p.deptCode === deptCode);
    if (availableProcs.length === 0) {
      machProcSelect.innerHTML = '<option value="">Este departamento no tiene procesos aún (crea un proceso primero)</option>';
    } else {
      machProcSelect.innerHTML = '<option value="">Selecciona el proceso de este departamento...</option>' +
        availableProcs.map(p => `<option value="${p.id || p.name}">${p.name}</option>`).join('');
    }
    updateMachineHierarchyPreview();
  }

  if (machDeptSelect) {
    machDeptSelect.addEventListener('change', () => {
      populateMachineProcessSelect(machDeptSelect.value);
    });
  }
  if (machProcSelect) {
    machProcSelect.addEventListener('change', () => {
      updateMachineHierarchyPreview();
    });
  }

  function populateMachineOperatorsList(selectedDeptCode = '') {
    const listContainer = document.getElementById('machStandaloneOperatorsList');
    if (!listContainer) return;
    const allOps = UanifyState.operators || [];
    if (allOps.length === 0) {
      listContainer.innerHTML = '<span style="font-size:12px; color:var(--text-muted); font-style:italic;">No hay operadores registrados en el padrón.</span>';
      return;
    }

    // Ordenar operadores mostrando primero los que ya pertenecen a este departamento si aplica
    listContainer.innerHTML = allOps.map(op => {
      const isDeptMatch = selectedDeptCode && op.deptCode === selectedDeptCode;
      const deptTag = op.deptCode ? `<span style="font-size:11px; color:var(--text-muted);">${op.deptCode}</span>` : '';
      const isOccupied = !!(op.machine && op.machine.trim());
      const currMach = isOccupied 
        ? `<span style="font-size:11px; font-weight:600; color:#B91C1C; background:#FEF2F2; border:1px solid #FECACA; padding:1px 5px; border-radius:4px;" title="Este operador ya está asignado a otra máquina y no puede ser seleccionado">[Ocupado en: ${op.machine}]</span>` 
        : '';

      const rowDisabledStyle = isOccupied 
        ? 'opacity: 0.55; cursor: not-allowed; background: #F8FAFC;' 
        : 'cursor: pointer;';
      const checkboxDisabledAttr = isOccupied ? 'disabled' : '';
      const checkboxCursor = isOccupied ? 'cursor: not-allowed;' : 'cursor: pointer;';

      return `
        <label style="display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:12px; padding:5px 6px; border-bottom:1px solid #F1F5F9; border-radius:5px; transition:background 0.15s ease; ${rowDisabledStyle}" title="${isOccupied ? `Inhabilitado: ${op.name} ya se encuentra operando en ${op.machine}` : ''}">
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" class="mach-standalone-op-cb" value="${op.empId || op.id}" ${checkboxDisabledAttr} style="accent-color:var(--color-brand); width:15px; height:15px; ${checkboxCursor}">
            <span style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <strong>${op.name}</strong> ${deptTag}
            </span>
          </div>
          <div>
            ${currMach}
          </div>
        </label>
      `;
    }).join('');
  }

  function openCreateMachineModal(defaultDeptCode = '') {
    if (!modalCreateMachStandalone) return;
    const nameInp = document.getElementById('machStandaloneName');
    if (nameInp) nameInp.value = '';

    populateMachineDeptSelect(defaultDeptCode);
    populateMachineOperatorsList(defaultDeptCode);
    modalCreateMachStandalone.classList.add('active');
  }

  if (btnCloseMachStandalone) btnCloseMachStandalone.addEventListener('click', () => modalCreateMachStandalone.classList.remove('active'));
  if (btnCancelMachStandalone) btnCancelMachStandalone.addEventListener('click', () => modalCreateMachStandalone.classList.remove('active'));

  if (formCreateMachStandalone) {
    formCreateMachStandalone.addEventListener('submit', (e) => {
      e.preventDefault();
      const machName = document.getElementById('machStandaloneName')?.value.trim();
      const deptCode = machDeptSelect?.value;
      const procVal = machProcSelect?.value;

      if (!machName) {
        return window.UanifyUI.toast('Por favor ingresa el nombre de la máquina o puesto de trabajo.', 'warning', 'Campo Requerido');
      }
      if (!deptCode) {
        return window.UanifyUI.toast('Selecciona el departamento al que pertenecerá la máquina.', 'warning', 'Departamento Requerido');
      }
      if (!procVal) {
        return window.UanifyUI.toast('Selecciona el proceso en el que operará esta máquina.', 'warning', 'Proceso Requerido');
      }

      if (!UanifyState.processes) UanifyState.processes = [];
      const targetProc = UanifyState.processes.find(p => (p.id === procVal || p.name === procVal) && p.deptCode === deptCode);

      if (!targetProc) {
        return window.UanifyUI.toast('El proceso seleccionado no existe o no corresponde a este departamento.', 'error', 'Error de Jerarquía');
      }

      if (!Array.isArray(targetProc.machines)) targetProc.machines = [];

      // Validar si la máquina ya existe en este proceso
      const exists = targetProc.machines.some(m => (m.name || '').toLowerCase() === machName.toLowerCase());
      if (exists) {
        return window.UanifyUI.toast(
          `La máquina "${machName}" ya está registrada en el proceso "${targetProc.name}".`,
          'warning',
          'Máquina Duplicada'
        );
      }

      // Obtener operadores seleccionados con checkbox
      const selectedOpCbs = document.querySelectorAll('.mach-standalone-op-cb:checked');
      const selectedOpIds = Array.from(selectedOpCbs).map(cb => cb.value);

      const nextMachNum = targetProc.machines.length + 1;
      const newMachineObj = {
        id: `M-${nextMachNum}`,
        name: machName,
        status: 'operativa',
        operatorIds: selectedOpIds
      };
      targetProc.machines.push(newMachineObj);

      const targetDept = (UanifyState.stations || []).find(s => s.code === deptCode || s.id === deptCode);

      // Asignar los operadores seleccionados a esta máquina y departamento en UanifyState.operators
      if (selectedOpIds.length > 0 && Array.isArray(UanifyState.operators)) {
        UanifyState.operators.forEach(op => {
          if (selectedOpIds.includes(op.empId) || selectedOpIds.includes(op.id)) {
            op.machine = machName;
            op.deptCode = deptCode;
            if (targetDept) {
              op.deptName = targetDept.name;
              op.department = targetDept.name;
            }
          }
        });
      }

      // Actualizar también en el departamento correspondiente (stations) si aplica
      if (targetDept) {
        const currM = targetDept.machines ? targetDept.machines.split(/[,;]/).map(x => x.trim()) : [];
        if (!currM.some(x => x.toLowerCase() === machName.toLowerCase())) {
          currM.push(machName);
          targetDept.machines = currM.join(', ');
        }
      }

      try {
        localStorage.setItem('uanify_processes', JSON.stringify(UanifyState.processes));
        localStorage.setItem('uanify_custom_stations', JSON.stringify(UanifyState.stations));
        localStorage.setItem('uanify_operators', JSON.stringify(UanifyState.operators));
      } catch (err) {
        console.warn('Error saving machine and operators:', err);
      }

      modalCreateMachStandalone.classList.remove('active');
      renderDepartmentsConfig();
      if (typeof window.renderOperatorsDirectory === 'function') window.renderOperatorsDirectory();

      const opMsg = selectedOpIds.length > 0 ? ` con ${selectedOpIds.length} operador(es) asignado(s)` : '';
      window.UanifyUI.toast(
        `Máquina "${machName}" asignada con éxito al proceso "${targetProc.name}" (${targetDept ? targetDept.name : deptCode})${opMsg}.`,
        'success',
        'Máquina Registrada'
      );
    });
  }

  window.openCreateProcessModal = openCreateProcessModal;
  window.openCreateMachineModal = openCreateMachineModal;
  window.openCreateWarehouseModal = openCreateWarehouseModal;
  window.openDeptDetailViewer = openDeptDetailViewer;

  // ── CATÁLOGO DEDICADO 1: PROCESOS PRODUCTIVOS ────────────────────────────
  const cfgProcessesTable = document.getElementById('cfgProcessesTable');
  let procFiltersBound = false;
  let activeProcessViewingId = null;
  let procCurrentPage = 1;
  const procItemsPerPage = 8;

  function renderProcessesConfig() {
    if (!cfgProcessesTable) return;
    const procs = UanifyState.processes || [];
    const searchInp = document.getElementById('procSearchInput');
    const deptFilter = document.getElementById('procDeptFilter');
    const countBadge = document.getElementById('procFilteredCountBadge');
    const btnReset = document.getElementById('btnResetProcFilters');

    // Poblar selector de departamentos si no está poblado
    if (deptFilter && deptFilter.options.length <= 1 && UanifyState.stations) {
      deptFilter.innerHTML = '<option value="all">Todos los Departamentos</option>' +
        UanifyState.stations.map(st => `<option value="${st.code}">${st.name}</option>`).join('');
    }

    const q = searchInp ? searchInp.value.toLowerCase().trim() : '';
    const selectedDept = deptFilter ? deptFilter.value : 'all';

    const filtered = procs.filter(p => {
      const dept = (UanifyState.stations || []).find(s => s.code === p.deptCode);
      const deptName = dept ? dept.name.toLowerCase() : '';
      const matchSearch = !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        deptName.includes(q);

      const matchDept = selectedDept === 'all' || p.deptCode === selectedDept;

      return matchSearch && matchDept;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / procItemsPerPage) || 1;
    if (procCurrentPage > totalPages) procCurrentPage = totalPages;
    if (procCurrentPage < 1) procCurrentPage = 1;

    const startIndex = (procCurrentPage - 1) * procItemsPerPage;
    const endIndex = Math.min(startIndex + procItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${procs.length} procesos`;
    }

    // Actualizar barras de paginación
    const paginationRange = document.getElementById('procPaginationRange');
    const paginationTotal = document.getElementById('procPaginationTotal');
    const pageIndicator = document.getElementById('procPageIndicator');
    const btnPrev = document.getElementById('btnProcPrevPage');
    const btnNext = document.getElementById('btnProcNextPage');

    if (paginationRange) paginationRange.textContent = totalItems === 0 ? '0' : `${startIndex + 1} - ${endIndex}`;
    if (paginationTotal) paginationTotal.textContent = totalItems;
    if (pageIndicator) pageIndicator.textContent = `${procCurrentPage} / ${totalPages}`;
    if (btnPrev) btnPrev.disabled = (procCurrentPage <= 1);
    if (btnNext) btnNext.disabled = (procCurrentPage >= totalPages);

    if (paginatedItems.length === 0) {
      cfgProcessesTable.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="4">
            <div class="table-empty-content">
              <span class="table-empty-icon"></span>
              <span class="table-empty-title">No se encontraron procesos coincidentes</span>
              <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetProcFilters()">Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      cfgProcessesTable.innerHTML = paginatedItems.map(p => {
        const dept = (UanifyState.stations || []).find(s => s.code === p.deptCode);
        const deptLabel = dept ? dept.name : (p.deptCode || 'Sin Departamento');
        const machCount = (p.machines || []).length;

        return `
          <tr>
            <td class="col-name">
              <div class="table-cell-primary" style="font-size:14px; font-weight:700; color:var(--text-primary);">${p.name}</div>
            </td>
            <td>
              <span class="chip-clean" style="font-size:12px; font-weight:600; color:var(--color-brand); background:rgba(139,94,60,0.08); border:1px solid rgba(139,94,60,0.2);">
                🏢 ${deptLabel}
              </span>
            </td>
            <td style="text-align:center;">
              <span class="chip-clean chip-clean-machine" style="font-size:12px; font-weight:700;">
                🏭 ${machCount} ${machCount === 1 ? 'máquina' : 'máquinas'}
              </span>
            </td>
            <td class="col-actions" style="text-align:center;">
              <div class="action-btns-cell" style="justify-content:center; gap:6px;">
                <button type="button" class="btn-table-action" onclick="window.openProcessDetailViewer('${p.id || p.code}')" title="Ver máquinas vinculadas y operadores asignados" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!procFiltersBound) {
      if (searchInp) searchInp.addEventListener('input', () => { procCurrentPage = 1; renderProcessesConfig(); });
      if (deptFilter) deptFilter.addEventListener('change', () => { procCurrentPage = 1; renderProcessesConfig(); });
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          if (procCurrentPage > 1) {
            procCurrentPage--;
            renderProcessesConfig();
          }
        });
      }
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          if (procCurrentPage < totalPages) {
            procCurrentPage++;
            renderProcessesConfig();
          }
        });
      }
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInp) searchInp.value = '';
          if (deptFilter) deptFilter.value = 'all';
          procCurrentPage = 1;
          renderProcessesConfig();
        });
      }
      window.resetProcFilters = () => {
        if (searchInp) searchInp.value = '';
        if (deptFilter) deptFilter.value = 'all';
        procCurrentPage = 1;
        renderProcessesConfig();
      };
      procFiltersBound = true;
    }
  }

  // ── MODAL: VISOR DE DETALLE DE PROCESO & GESTIÓN DE MÁQUINAS/OPERADORES ──
  function openProcessDetailViewer(procId) {
    const modal = document.getElementById('modalProcessViewerModal');
    if (!modal || !UanifyState.processes) return;

    const proc = UanifyState.processes.find(p => p.id === procId || p.code === procId);
    if (!proc) return;

    activeProcessViewingId = proc.id || proc.code;
    const dept = (UanifyState.stations || []).find(s => s.code === proc.deptCode);

    const titleEl = document.getElementById('procViewerTitle');
    const deptEl = document.getElementById('procViewerDept');
    const machListEl = document.getElementById('procViewerMachinesList');
    const countBadge = document.getElementById('procViewerMachCountBadge');

    if (titleEl) titleEl.innerHTML = `<span>${proc.name}</span>`;
    if (deptEl) deptEl.textContent = dept ? dept.name : (proc.deptCode || 'Departamento');

    // Obtener máquinas asignadas a este proceso
    let currentMachines = proc.machines || [];

    // Si no tiene array machines, revisar si hay máquinas en stations que hagan referencia a este proceso
    if (currentMachines.length === 0 && dept && dept.machines) {
      const rawList = dept.machines.split(/[,;]/).map(m => m.trim().replace(/^[A-Z0-9\-]+\s+/i, '')).filter(Boolean);
      // Asociar si el nombre del proceso coincide o si el proceso es el único
      if (rawList.length > 0) {
        currentMachines = rawList.map((mName, i) => ({
          id: `M-${i+1}`,
          name: mName,
          status: 'operativa'
        }));
      }
    }

    if (countBadge) {
      countBadge.textContent = `${currentMachines.length} ${currentMachines.length === 1 ? 'máquina' : 'máquinas'}`;
    }

    // Renderizar máquinas vinculadas con operador asignado (consulta pura)
    if (machListEl) {
      if (currentMachines.length === 0) {
        machListEl.innerHTML = `
          <div style="text-align:center; padding:24px 16px; background:#F8FAFC; border:1px dashed var(--border-subtle); border-radius:10px;">
            <p style="margin:0; font-size:13px; color:var(--text-muted); font-style:italic;">No hay máquinas asignadas a este proceso actualmente.</p>
            <p style="margin:4px 0 0 0; font-size:11.5px; color:var(--text-secondary);">Las máquinas se asignan a este proceso al momento de crearlas desde "+ Nueva Máquina".</p>
          </div>
        `;
      } else {
        machListEl.innerHTML = currentMachines.map(m => {
          const cleanM = (m.name || '').replace(/^[A-Z0-9\-]+\s+/i, '');
          
          // Buscar en el padrón de operadores cuál está asignado a esta máquina
          const assignedOps = (UanifyState.operators || []).filter(op => {
            return (op.machine && op.machine.toLowerCase().trim() === cleanM.toLowerCase().trim()) ||
                   (op.machine && cleanM.toLowerCase().includes(op.machine.toLowerCase().trim())) ||
                   (Array.isArray(m.operatorIds) && (m.operatorIds.includes(op.empId) || m.operatorIds.includes(op.id)));
          });

          const opsHtml = assignedOps.length > 0
            ? assignedOps.map(op => `
                <span style="display:inline-flex; align-items:center; gap:5px; font-size:12px; background:#EFF6FF; color:#1E40AF; padding:3px 10px; border-radius:6px; font-weight:700; border:1px solid #DBEAFE;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  ${op.name}
                </span>
              `).join(' ')
            : `<span style="font-size:12px; color:var(--text-muted); font-style:italic; background:#F8FAFC; padding:3px 8px; border-radius:6px; border:1px solid var(--border-subtle);">Sin operador asignado</span>`;

          return `
            <div style="background:#F8FAFC; border:1px solid var(--border-subtle); border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="chip-clean chip-clean-machine" style="font-size:13px; padding:6px 14px; font-weight:700;">
                  🏭 ${cleanM}
                </span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--text-muted); letter-spacing:0.5px;">Operador(a):</span>
                ${opsHtml}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    modal.classList.add('active');
  }

  window.openProcessDetailViewer = openProcessDetailViewer;

  // ── CATÁLOGO DEDICADO 2: ALMACENES INTERMEDIOS BUFFER ────────────────────
  const cfgWarehousesTable = document.getElementById('cfgWarehousesTable');
  let whFiltersBound = false;
  let whCurrentPage = 1;
  const whItemsPerPage = 8;

  function renderWarehousesConfig() {
    if (!cfgWarehousesTable) return;
    const stations = UanifyState.stations || [];
    const searchInp = document.getElementById('whSearchInput');
    const deptFilter = document.getElementById('whDeptFilter');
    const supFilter = document.getElementById('whSupervisorFilter');
    const capFilter = document.getElementById('whCapFilter');
    const countBadge = document.getElementById('whFilteredCountBadge');
    const btnReset = document.getElementById('btnResetWhFilters');

    // Construir lista estructurada de almacenes desde las estaciones
    let warehousesList = [];
    stations.forEach(st => {
      const rawWh = st.intermediateWarehouse ? st.intermediateWarehouse.split(/[,;]/).map(w => w.trim()).filter(Boolean) : [`Buffer Entrada`];
      rawWh.forEach((wName, idx) => {
        const cleanName = wName.replace(/\s*\([A-Z0-9\-]+\)/gi, '');
        warehousesList.push({
          id: `WH-${st.code}-${idx+1}`,
          name: cleanName,
          deptCode: st.code,
          deptName: st.name,
          supervisor: st.operator || 'Supervisor Asignado',
          capacity: st.wipCapacity || 180
        });
      });
    });

    // Poblar selector de departamentos
    if (deptFilter && deptFilter.options.length <= 1) {
      deptFilter.innerHTML = '<option value="all">Todos los Departamentos</option>' +
        stations.map(st => `<option value="${st.code}">${st.name}</option>`).join('');
    }

    // Poblar selector de supervisores
    if (supFilter && supFilter.options.length <= 1) {
      const allSups = [...new Set(warehousesList.map(w => w.supervisor).filter(Boolean))].sort();
      supFilter.innerHTML = '<option value="all">Todos los Supervisores</option>' +
        allSups.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    const q = searchInp ? searchInp.value.toLowerCase().trim() : '';
    const selectedDept = deptFilter ? deptFilter.value : 'all';
    const selectedSup = supFilter ? supFilter.value : 'all';
    const selectedCap = capFilter ? capFilter.value : 'all';

    const filtered = warehousesList.filter(w => {
      const matchSearch = !q ||
        w.name.toLowerCase().includes(q) ||
        w.deptName.toLowerCase().includes(q) ||
        w.supervisor.toLowerCase().includes(q);

      const matchDept = selectedDept === 'all' || w.deptCode === selectedDept;
      const matchSup = selectedSup === 'all' || w.supervisor === selectedSup;
      
      let matchCap = true;
      if (selectedCap === 'compact') matchCap = w.capacity <= 150;
      else if (selectedCap === 'medium') matchCap = w.capacity > 150 && w.capacity <= 200;
      else if (selectedCap === 'large') matchCap = w.capacity > 200;

      return matchSearch && matchDept && matchSup && matchCap;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / whItemsPerPage) || 1;
    if (whCurrentPage > totalPages) whCurrentPage = totalPages;
    if (whCurrentPage < 1) whCurrentPage = 1;

    const startIndex = (whCurrentPage - 1) * whItemsPerPage;
    const endIndex = Math.min(startIndex + whItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${warehousesList.length} almacenes buffer`;
    }

    // Actualizar barras de paginación
    const paginationRange = document.getElementById('whPaginationRange');
    const paginationTotal = document.getElementById('whPaginationTotal');
    const pageIndicator = document.getElementById('whPageIndicator');
    const btnPrev = document.getElementById('btnWhPrevPage');
    const btnNext = document.getElementById('btnWhNextPage');

    if (paginationRange) paginationRange.textContent = totalItems === 0 ? '0' : `${startIndex + 1} - ${endIndex}`;
    if (paginationTotal) paginationTotal.textContent = totalItems;
    if (pageIndicator) pageIndicator.textContent = `${whCurrentPage} / ${totalPages}`;
    if (btnPrev) btnPrev.disabled = (whCurrentPage <= 1);
    if (btnNext) btnNext.disabled = (whCurrentPage >= totalPages);

    if (paginatedItems.length === 0) {
      cfgWarehousesTable.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="5">
            <div class="table-empty-content">
              <span class="table-empty-icon"></span>
              <span class="table-empty-title">No se encontraron almacenes coincidentes</span>
              <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetWhFilters()">Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      cfgWarehousesTable.innerHTML = paginatedItems.map(w => {
        return `
          <tr>
            <td class="col-name">
              <div class="table-cell-primary" style="font-size:14px; font-weight:700; color:var(--text-primary);">📦 ${w.name}</div>
            </td>
            <td>
              <span class="chip-clean" style="font-size:12px; font-weight:600; color:var(--color-brand); background:rgba(139,94,60,0.08); border:1px solid rgba(139,94,60,0.2);">
                🏢 ${w.deptName}
              </span>
            </td>
            <td>
              <span style="display:inline-flex; align-items:center; gap:5px; font-size:12.5px; color:var(--text-secondary); font-weight:600;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-brand);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ${w.supervisor}
              </span>
            </td>
            <td style="text-align:center;">
              <span style="font-family:var(--font-mono); font-size:13px; font-weight:700; color:var(--text-primary);">${w.capacity} pzas</span>
            </td>
            <td class="col-actions" style="text-align:center;">
              <div class="action-btns-cell" style="justify-content:center; gap:6px;">
                <button type="button" class="btn-table-action" onclick="window.openDeptDetailViewer('${w.deptCode}')" title="Ver estructura y asignaciones de este departamento" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!whFiltersBound) {
      if (searchInp) searchInp.addEventListener('input', () => { whCurrentPage = 1; renderWarehousesConfig(); });
      if (deptFilter) deptFilter.addEventListener('change', () => { whCurrentPage = 1; renderWarehousesConfig(); });
      if (supFilter) supFilter.addEventListener('change', () => { whCurrentPage = 1; renderWarehousesConfig(); });
      if (capFilter) capFilter.addEventListener('change', () => { whCurrentPage = 1; renderWarehousesConfig(); });
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          if (whCurrentPage > 1) {
            whCurrentPage--;
            renderWarehousesConfig();
          }
        });
      }
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          if (whCurrentPage < totalPages) {
            whCurrentPage++;
            renderWarehousesConfig();
          }
        });
      }
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInp) searchInp.value = '';
          if (deptFilter) deptFilter.value = 'all';
          if (supFilter) supFilter.value = 'all';
          if (capFilter) capFilter.value = 'all';
          whCurrentPage = 1;
          renderWarehousesConfig();
        });
      }
      window.resetWhFilters = () => {
        if (searchInp) searchInp.value = '';
        if (deptFilter) deptFilter.value = 'all';
        if (supFilter) supFilter.value = 'all';
        if (capFilter) capFilter.value = 'all';
        whCurrentPage = 1;
        renderWarehousesConfig();
      };
      whFiltersBound = true;
    }
  }

  // ── CATÁLOGO DEDICADO 3: MAQUINARIA & EQUIPOS DE TRABAJO ──────────────────
  const cfgMachinesTable = document.getElementById('cfgMachinesTable');
  let machFiltersBound = false;
  let machCurrentPage = 1;
  const machItemsPerPage = 8;

  function renderMachinesConfig() {
    if (!cfgMachinesTable) return;
    const procs = UanifyState.processes || [];
    const searchInp = document.getElementById('machSearchInput');
    const deptFilter = document.getElementById('machDeptFilter');
    const opStatusFilter = document.getElementById('machOpStatusFilter');
    const countBadge = document.getElementById('machFilteredCountBadge');
    const btnReset = document.getElementById('btnResetMachFilters');

    // Consolidar lista de todas las máquinas vinculadas a procesos y departamentos
    let machinesList = [];
    procs.forEach(p => {
      const dept = (UanifyState.stations || []).find(s => s.code === p.deptCode);
      (p.machines || []).forEach(m => {
        // Buscar operadores asignados a esta máquina (por nombre o IDs)
        const assignedOps = (UanifyState.operators || []).filter(o => 
          (o.machine && o.machine.toLowerCase().includes(m.name.toLowerCase())) ||
          (Array.isArray(m.operatorIds) && (m.operatorIds.includes(o.empId) || m.operatorIds.includes(o.id)))
        );

        machinesList.push({
          id: m.id || `M-${machinesList.length+1}`,
          name: m.name,
          procId: p.id,
          procName: p.name,
          deptCode: p.deptCode,
          deptName: dept ? dept.name : p.deptCode,
          operators: assignedOps
        });
      });
    });

    // Poblar selector de departamentos
    if (deptFilter && deptFilter.options.length <= 1 && UanifyState.stations) {
      deptFilter.innerHTML = '<option value="all">Todos los Departamentos</option>' +
        UanifyState.stations.map(st => `<option value="${st.code}">${st.name}</option>`).join('');
    }

    const q = searchInp ? searchInp.value.toLowerCase().trim() : '';
    const selectedDept = deptFilter ? deptFilter.value : 'all';
    const selectedOpStatus = opStatusFilter ? opStatusFilter.value : 'all';

    const filtered = machinesList.filter(m => {
      const matchSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.procName.toLowerCase().includes(q) ||
        m.deptName.toLowerCase().includes(q) ||
        m.operators.some(o => o.name.toLowerCase().includes(q));

      const matchDept = selectedDept === 'all' || m.deptCode === selectedDept;

      let matchOp = true;
      if (selectedOpStatus === 'assigned') matchOp = m.operators.length > 0;
      else if (selectedOpStatus === 'unassigned') matchOp = m.operators.length === 0;

      return matchSearch && matchDept && matchOp;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / machItemsPerPage) || 1;
    if (machCurrentPage > totalPages) machCurrentPage = totalPages;
    if (machCurrentPage < 1) machCurrentPage = 1;

    const startIndex = (machCurrentPage - 1) * machItemsPerPage;
    const endIndex = Math.min(startIndex + machItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${machinesList.length} máquinas`;
    }

    // Actualizar barras de paginación
    const paginationRange = document.getElementById('machPaginationRange');
    const paginationTotal = document.getElementById('machPaginationTotal');
    const pageIndicator = document.getElementById('machPageIndicator');
    const btnPrev = document.getElementById('btnMachPrevPage');
    const btnNext = document.getElementById('btnMachNextPage');

    if (paginationRange) paginationRange.textContent = totalItems === 0 ? '0' : `${startIndex + 1} - ${endIndex}`;
    if (paginationTotal) paginationTotal.textContent = totalItems;
    if (pageIndicator) pageIndicator.textContent = `${machCurrentPage} / ${totalPages}`;
    if (btnPrev) btnPrev.disabled = (machCurrentPage <= 1);
    if (btnNext) btnNext.disabled = (machCurrentPage >= totalPages);

    if (paginatedItems.length === 0) {
      cfgMachinesTable.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="5">
            <div class="table-empty-content">
              <span class="table-empty-icon"></span>
              <span class="table-empty-title">No se encontraron máquinas coincidentes</span>
              <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetMachFilters()">Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      cfgMachinesTable.innerHTML = paginatedItems.map(m => {
        let opsHtml = '';
        if (m.operators.length > 0) {
          opsHtml = m.operators.map(o => `
            <span class="chip-clean" style="font-size:11.5px; background:#EFF6FF; color:#1E40AF; border:1px solid #BFDBFE; font-weight:600;" title="No. Nómina: ${o.empId || ''}">
              👤 ${o.name}
            </span>
          `).join(' ');
        } else {
          opsHtml = '<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Sin operador asignado</span>';
        }

        const safeMachName = encodeURIComponent(m.name);
        const safeDeptCode = encodeURIComponent(m.deptCode);

        return `
          <tr>
            <td class="col-name">
              <div class="table-cell-primary" style="font-size:14px; font-weight:700; color:var(--text-primary);">🏭 ${m.name}</div>
            </td>
            <td>
              <span style="font-size:13px; font-weight:600; color:var(--text-primary);">⚙️ ${m.procName}</span>
            </td>
            <td>
              <span class="chip-clean" style="font-size:12px; font-weight:600; color:var(--color-brand); background:rgba(139,94,60,0.08); border:1px solid rgba(139,94,60,0.2);">
                🏢 ${m.deptName}
              </span>
            </td>
            <td>
              <div style="display:flex; flex-wrap:wrap; gap:5px; align-items:center;">
                ${opsHtml}
                <button type="button" class="btn-secondary btn-sm" onclick="window.openAssignMachineOperatorsModal('${safeMachName}', '${safeDeptCode}')" style="min-height:28px; padding:0 8px; font-size:11px; margin-left:4px; font-weight:700; cursor:pointer;" title="Gestionar o asignar operadores a esta máquina">
                  + Asignar
                </button>
              </div>
            </td>
            <td class="col-actions" style="text-align:center;">
              <div class="action-btns-cell" style="justify-content:center; gap:6px;">
                <button type="button" class="btn-table-action" onclick="window.openAssignMachineOperatorsModal('${safeMachName}', '${safeDeptCode}')" title="Asignar o editar operadores de esta máquina" style="background:#F0FDF4; color:#166534; border:1px solid #BBF7D0;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                </button>
                <button type="button" class="btn-table-action" onclick="window.openDeptDetailViewer('${m.deptCode}')" title="Ver estructura completa de este departamento" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!machFiltersBound) {
      if (searchInp) searchInp.addEventListener('input', () => { machCurrentPage = 1; renderMachinesConfig(); });
      if (deptFilter) deptFilter.addEventListener('change', () => { machCurrentPage = 1; renderMachinesConfig(); });
      if (opStatusFilter) opStatusFilter.addEventListener('change', () => { machCurrentPage = 1; renderMachinesConfig(); });
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          if (machCurrentPage > 1) {
            machCurrentPage--;
            renderMachinesConfig();
          }
        });
      }
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          if (machCurrentPage < totalPages) {
            machCurrentPage++;
            renderMachinesConfig();
          }
        });
      }
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInp) searchInp.value = '';
          if (deptFilter) deptFilter.value = 'all';
          if (opStatusFilter) opStatusFilter.value = 'all';
          machCurrentPage = 1;
          renderMachinesConfig();
        });
      }
      window.resetMachFilters = () => {
        if (searchInp) searchInp.value = '';
        if (deptFilter) deptFilter.value = 'all';
        if (opStatusFilter) opStatusFilter.value = 'all';
        machCurrentPage = 1;
        renderMachinesConfig();
      };
      machFiltersBound = true;
    }
  }

  // ── MODAL INDEPENDIENTE: ASIGNACIÓN DIRECTA DE OPERADORES A MÁQUINA ───────
  const modalAssignMach = document.getElementById('modalAssignMachineOperators');
  const btnCloseAssignMach = document.getElementById('btnCloseAssignMachModal');
  const btnCancelAssignMach = document.getElementById('btnCancelAssignMachModal');
  const formAssignMach = document.getElementById('formAssignMachineOperators');
  const assignMachOpSearch = document.getElementById('assignMachOpSearch');

  function openAssignMachineOperatorsModal(encodedMachName, encodedDeptCode) {
    if (!modalAssignMach) return;
    const machName = decodeURIComponent(encodedMachName);
    const deptCode = decodeURIComponent(encodedDeptCode);

    const titleEl = document.getElementById('assignMachTitle');
    const chipEl = document.getElementById('assignMachDeptChip');
    const hiddenName = document.getElementById('assignMachTargetName');
    const hiddenDept = document.getElementById('assignMachTargetDeptCode');
    const listEl = document.getElementById('assignMachOperatorsList');

    const dept = (UanifyState.stations || []).find(s => s.code === deptCode || s.id === deptCode);

    if (titleEl) titleEl.textContent = machName;
    if (chipEl) chipEl.textContent = dept ? dept.name : (deptCode || 'General');
    if (hiddenName) hiddenName.value = machName;
    if (hiddenDept) hiddenDept.value = deptCode;
    if (assignMachOpSearch) assignMachOpSearch.value = '';

    renderAssignModalOpList(machName, deptCode, '');
    modalAssignMach.classList.add('active');
  }

  function renderAssignModalOpList(machName, deptCode, filterQuery = '') {
    const listEl = document.getElementById('assignMachOperatorsList');
    const countBadge = document.getElementById('assignMachSelectedCount');
    if (!listEl) return;

    const allOps = UanifyState.operators || [];
    const q = filterQuery.toLowerCase().trim();

    const filtered = allOps.filter(op => {
      if (!q) return true;
      return (op.name && op.name.toLowerCase().includes(q)) ||
             (op.empId && op.empId.toLowerCase().includes(q)) ||
             (op.department && op.department.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; padding:12px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron operadores con ese criterio</div>';
      return;
    }

    listEl.innerHTML = filtered.map(op => {
      // Verificar si el operador ya tiene asignada esta máquina
      const isAssignedToThis = (op.machine && op.machine.toLowerCase().includes(machName.toLowerCase()));
      const isAssignedToOther = (op.machine && !isAssignedToThis);
      const isDept = op.deptCode === deptCode || op.department === deptCode;
      
      const otherMachBadge = isAssignedToOther 
        ? `<span style="font-size:11px; font-weight:600; color:#B91C1C; background:#FEF2F2; border:1px solid #FECACA; padding:2px 6px; border-radius:4px;" title="Este operador ya está asignado a otra máquina y no puede ser seleccionado">[Ocupado en: ${op.machine}]</span>` 
        : (isAssignedToThis ? `<span style="font-size:11px; font-weight:600; color:#15803D; background:#F0FDF4; border:1px solid #BBF7D0; padding:2px 6px; border-radius:4px;">[Asignado a esta máquina]</span>` : '');

      const rowDisabledStyle = isAssignedToOther 
        ? 'opacity: 0.55; cursor: not-allowed; background: #F8FAFC;' 
        : 'cursor: pointer;';
      const checkboxDisabledAttr = isAssignedToOther ? 'disabled' : '';
      const checkboxCursor = isAssignedToOther ? 'cursor: not-allowed;' : 'cursor: pointer;';

      return `
        <label style="display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:12.5px; padding:7px 8px; border-bottom:1px solid #F1F5F9; border-radius:6px; transition:background 0.15s ease; ${rowDisabledStyle}" title="${isAssignedToOther ? `Inhabilitado: ${op.name} ya se encuentra operando en ${op.machine}` : ''}">
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" class="assign-mach-op-cb" value="${op.empId || op.id}" ${isAssignedToThis ? 'checked' : ''} ${checkboxDisabledAttr} style="accent-color:var(--color-brand); width:16px; height:16px; ${checkboxCursor}">
            <span style="font-weight:600; color:var(--text-primary);">👤 ${op.name}</span>
            <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${op.empId ? `(Nóm: ${op.empId})` : ''}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            ${otherMachBadge}
            <span class="chip-clean" style="font-size:10.5px; padding:2px 6px;">${op.department || op.deptCode || 'Piso'}</span>
          </div>
        </label>
      `;
    }).join('');

    const updateCount = () => {
      const checked = listEl.querySelectorAll('.assign-mach-op-cb:checked').length;
      if (countBadge) countBadge.textContent = `${checked} seleccionado(s)`;
    };

    listEl.querySelectorAll('.assign-mach-op-cb').forEach(cb => {
      cb.addEventListener('change', updateCount);
    });
    updateCount();
  }

  if (assignMachOpSearch) {
    assignMachOpSearch.addEventListener('input', (e) => {
      const machName = document.getElementById('assignMachTargetName')?.value || '';
      const deptCode = document.getElementById('assignMachTargetDeptCode')?.value || '';
      renderAssignModalOpList(machName, deptCode, e.target.value);
    });
  }

  if (btnCloseAssignMach) btnCloseAssignMach.addEventListener('click', () => modalAssignMach.classList.remove('active'));
  if (btnCancelAssignMach) btnCancelAssignMach.addEventListener('click', () => modalAssignMach.classList.remove('active'));

  if (formAssignMach) {
    formAssignMach.addEventListener('submit', (e) => {
      e.preventDefault();
      const machName = document.getElementById('assignMachTargetName')?.value || '';
      const deptCode = document.getElementById('assignMachTargetDeptCode')?.value || '';

      if (!machName) return;

      const checkedBoxes = document.querySelectorAll('.assign-mach-op-cb:checked');
      const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);

      const dept = (UanifyState.stations || []).find(s => s.code === deptCode || s.id === deptCode);

      // Actualizar los operadores en UanifyState.operators
      if (Array.isArray(UanifyState.operators)) {
        UanifyState.operators.forEach(op => {
          const isSelected = selectedIds.includes(op.empId) || selectedIds.includes(op.id);
          const hadThisMach = (op.machine && op.machine.toLowerCase().includes(machName.toLowerCase()));

          if (isSelected) {
            op.machine = machName;
            if (deptCode) op.deptCode = deptCode;
            if (dept) {
              op.deptName = dept.name;
              op.department = dept.name;
            }
          } else if (hadThisMach) {
            // Si estaba asignado a esta máquina pero fue desmarcado, limpiar su asignación
            op.machine = '';
          }
        });
      }

      // Actualizar también en el proceso correspondiente
      (UanifyState.processes || []).forEach(p => {
        (p.machines || []).forEach(m => {
          if (m.name.toLowerCase() === machName.toLowerCase()) {
            m.operatorIds = selectedIds;
          }
        });
      });

      try {
        localStorage.setItem('uanify_operators', JSON.stringify(UanifyState.operators));
        localStorage.setItem('uanify_processes', JSON.stringify(UanifyState.processes));
      } catch (err) {
        console.warn('Error saving operator machine assignments:', err);
      }

      if (window.UanifyUI && typeof window.UanifyUI.toast === 'function') {
        window.UanifyUI.toast(`Asignaciones de la máquina "${machName}" guardadas exitosamente (${selectedIds.length} operador(es))`, 'success');
      }

      modalAssignMach.classList.remove('active');
      renderMachinesConfig();
      if (typeof renderDepartmentsConfig === 'function') renderDepartmentsConfig();
      if (typeof renderProcessesConfig === 'function') renderProcessesConfig();
    });
  }

  window.openAssignMachineOperatorsModal = openAssignMachineOperatorsModal;

  window.renderProcessesConfig = renderProcessesConfig;
  window.renderWarehousesConfig = renderWarehousesConfig;
  window.renderMachinesConfig = renderMachinesConfig;

  // ── 6. CRUD DE FILTROS DE CALIDAD & TOLERANCIAS (C-XX) ───────────────────
  const modalCreateQuality = document.getElementById('modalCreateQualityArea');
  const btnCloseCreateQuality = document.getElementById('btnCloseCreateQualityModal');
  const btnCancelCreateQuality = document.getElementById('btnCancelCreateQuality');
  const formCreateQuality = document.getElementById('formCreateQualityArea');
  const cfgQualityTable = document.getElementById('cfgQualityTable');

  let qualityFiltersBound = false;
  let qualityCurrentPage = 1;
  const qualityItemsPerPage = 8;

  function renderQualityFiltersConfig() {
    if (!cfgQualityTable) return;
    const areas = UanifyState.qualityAreas || [];

    const searchInput = document.getElementById('qualitySearchInput');
    const deptFilter = document.getElementById('qualityDeptFilter');
    const inspectorFilter = document.getElementById('qualityInspectorFilter');
    const countBadge = document.getElementById('qualityFilteredCountBadge');
    const btnReset = document.getElementById('btnResetQualityFilters');

    // Poblar selector de departamentos
    if (deptFilter && deptFilter.options.length <= 1 && UanifyState.stations) {
      deptFilter.innerHTML = '<option value="all">Todos los Departamentos</option>' +
        UanifyState.stations.map(st => `<option value="${st.code}">${st.name}</option>`).join('');
    }

    // Poblar selector de inspectores de la toolbar exclusivamente con inspectores de calidad
    if (inspectorFilter && UanifyState.users) {
      const inspectoresUsers = UanifyState.users.filter(u => {
        const r = (u.role || '').toLowerCase();
        const rn = (u.roleName || '').toLowerCase();
        const b = (u.badge || '').toLowerCase();
        return r === 'calidad' || rn.includes('inspector') || b.includes('inspector');
      });
      const inspectorNames = [...new Set(inspectoresUsers.map(u => u.name).concat(areas.map(a => a.inspector).filter(Boolean)))].sort();
      const currentSelected = inspectorFilter.value || 'all';
      inspectorFilter.innerHTML = '<option value="all">Todos los Inspectores</option>' +
        inspectorNames.map(insp => `<option value="${insp}" ${insp === currentSelected ? 'selected' : ''}>${insp}</option>`).join('');
    }

    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedDept = deptFilter ? deptFilter.value : 'all';
    const selectedInsp = inspectorFilter ? inspectorFilter.value : 'all';

    const filtered = areas.filter(item => {
      const dept = (UanifyState.stations || []).find(s => s.code === item.deptCode || s.id === item.deptCode);
      const deptName = dept ? dept.name.toLowerCase() : '';
      const matchSearch = !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        deptName.includes(q) ||
        (item.inspector && item.inspector.toLowerCase().includes(q));

      const matchDept = selectedDept === 'all' || item.deptCode === selectedDept;
      const matchInsp = selectedInsp === 'all' || item.inspector === selectedInsp;

      return matchSearch && matchDept && matchInsp;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / qualityItemsPerPage) || 1;
    if (qualityCurrentPage > totalPages) qualityCurrentPage = totalPages;
    if (qualityCurrentPage < 1) qualityCurrentPage = 1;

    const startIndex = (qualityCurrentPage - 1) * qualityItemsPerPage;
    const endIndex = Math.min(startIndex + qualityItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${areas.length} filtros de calidad`;
    }

    // Actualizar barras de paginación
    const paginationRange = document.getElementById('qualityPaginationRange');
    const paginationTotal = document.getElementById('qualityPaginationTotal');
    const pageIndicator = document.getElementById('qualityPageIndicator');
    const btnPrev = document.getElementById('btnQualityPrevPage');
    const btnNext = document.getElementById('btnQualityNextPage');

    if (paginationRange) paginationRange.textContent = totalItems === 0 ? '0' : `${startIndex + 1} - ${endIndex}`;
    if (paginationTotal) paginationTotal.textContent = totalItems;
    if (pageIndicator) pageIndicator.textContent = `${qualityCurrentPage} / ${totalPages}`;
    if (btnPrev) btnPrev.disabled = (qualityCurrentPage <= 1);
    if (btnNext) btnNext.disabled = (qualityCurrentPage >= totalPages);

    if (paginatedItems.length === 0) {
      cfgQualityTable.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="5">
            <div class="table-empty-content">
              <span class="table-empty-icon"></span>
              <span class="table-empty-title">No se encontraron filtros de calidad coincidentes</span>
              <span class="table-empty-subtitle">Intenta buscar con otros términos o limpia los filtros</span>
              <button type="button" class="btn-reset-filters" onclick="window.resetQualityFilters()">Limpiar Filtros</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const currentUser = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const canManage = currentUser.role === 'admin' || currentUser.role === 'ingeniero';

    cfgQualityTable.innerHTML = paginatedItems.map(q => {
      const dept = (UanifyState.stations || []).find(s => s.code === q.deptCode || s.id === q.deptCode);
      const deptName = dept ? dept.name : (q.deptCode ? `Depto ${q.deptCode}` : 'Sin Depto asignado');
      const safeDeptCode = q.deptCode || (dept ? dept.code : '');

      return `
        <tr>
          <td class="col-name">
            <div class="table-cell-primary" style="font-size:14px; font-weight:700; color:var(--text-primary);">🛡️ ${q.name}</div>
          </td>
          <td>
            <span class="chip-clean" style="font-size:12px; font-weight:600; color:var(--color-brand); background:rgba(139,94,60,0.08); border:1px solid rgba(139,94,60,0.2);">
              🏢 ${deptName}
            </span>
          </td>
          <td>
            <span style="display:inline-flex; align-items:center; gap:5px; font-size:12.5px; color:var(--text-secondary); font-weight:600;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-brand);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${q.inspector || 'Sin inspector asignado'}
            </span>
          </td>
          <td style="text-align:center;">
            <span style="font-family:var(--font-mono); font-size:13px; font-weight:700; color:var(--text-primary);">${q.cycleTime || '18s'}</span>
          </td>
          <td class="col-actions" style="text-align:center;">
            <div class="action-btns-cell" style="justify-content:center; gap:6px;">
              ${canManage ? `
                <button type="button" class="btn-table-action btn-action-edit" onclick="window.openEditQualityModal('${q.code}')" title="Editar Filtro de Calidad">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button type="button" class="btn-table-action btn-action-delete" onclick="window.deleteQualityFilter('${q.code}')" title="Eliminar Filtro de Calidad">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              ` : `
                <button type="button" class="btn-table-action" onclick="window.openDeptDetailViewer('${safeDeptCode}')" title="Ver estructura y asignaciones de este departamento" style="background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (!qualityFiltersBound) {
      qualityFiltersBound = true;
      if (searchInput) searchInput.addEventListener('input', () => { qualityCurrentPage = 1; renderQualityFiltersConfig(); });
      if (deptFilter) deptFilter.addEventListener('change', () => { qualityCurrentPage = 1; renderQualityFiltersConfig(); });
      if (inspectorFilter) inspectorFilter.addEventListener('change', () => { qualityCurrentPage = 1; renderQualityFiltersConfig(); });
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          if (qualityCurrentPage > 1) {
            qualityCurrentPage--;
            renderQualityFiltersConfig();
          }
        });
      }
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          if (qualityCurrentPage < totalPages) {
            qualityCurrentPage++;
            renderQualityFiltersConfig();
          }
        });
      }
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (deptFilter) deptFilter.value = 'all';
          if (inspectorFilter) inspectorFilter.value = 'all';
          qualityCurrentPage = 1;
          renderQualityFiltersConfig();
        });
      }
      window.resetQualityFilters = function() {
        if (searchInput) searchInput.value = '';
        if (deptFilter) deptFilter.value = 'all';
        if (inspectorFilter) inspectorFilter.value = 'all';
        qualityCurrentPage = 1;
        renderQualityFiltersConfig();
      };
    }
  }

  let modalQualitySelectedDept = '';
  let modalQualitySelectedInspector = '';

  function renderQualityDeptList(filterQuery = '') {
    const listEl = document.getElementById('qualityDeptListContainer');
    const inputHidden = document.getElementById('newQualityDept');
    if (!listEl || !UanifyState.stations) return;

    const q = filterQuery.toLowerCase().trim();
    const stations = UanifyState.stations || [];
    const filtered = stations.filter(st => !q || (st.name && st.name.toLowerCase().includes(q)) || (st.code && st.code.toLowerCase().includes(q)));

    if (filtered.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; padding:10px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron departamentos coincidentes</div>';
      return;
    }

    listEl.innerHTML = filtered.map(st => {
      const code = st.code || st.id;
      const isSelected = modalQualitySelectedDept === code;
      return `
        <label style="display:flex; align-items:center; gap:10px; font-size:12px; padding:6px 10px; background:${isSelected ? 'rgba(139, 94, 60, 0.08)' : '#FFFFFF'}; border:1px solid ${isSelected ? 'var(--color-brand)' : 'var(--border-subtle)'}; border-radius:6px; cursor:pointer;" title="${st.name}">
          <input type="radio" name="qualityDeptSelectedRadio" value="${code}" ${isSelected ? 'checked' : ''} style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
          <div style="flex:1; min-width:0;">
            <strong style="display:block; color:var(--text-primary); font-size:12px;">${st.name}</strong>
            <small style="color:var(--color-brand); font-size:11px; font-weight:600;">${st.code || ''}</small>
          </div>
        </label>
      `;
    }).join('');

    listEl.querySelectorAll('input[name="qualityDeptSelectedRadio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          modalQualitySelectedDept = e.target.value;
          if (inputHidden) inputHidden.value = modalQualitySelectedDept;
          const searchInp = document.getElementById('qualityDeptSearch');
          renderQualityDeptList(searchInp ? searchInp.value : '');
        }
      });
    });
  }

  function renderQualityInspectorList(filterQuery = '') {
    const listEl = document.getElementById('qualityInspectorListContainer');
    const inputHidden = document.getElementById('newQualityInspector');
    if (!listEl) return;

    const q = filterQuery.toLowerCase().trim();
    const users = UanifyState.users || [];

    // REGLA ESTRICTA: Solo deben poder salir inspectores (rol 'calidad' o roleName que incluya 'inspector')
    let inspectores = users.filter(u => {
      const r = (u.role || '').toLowerCase();
      const rn = (u.roleName || '').toLowerCase();
      const b = (u.badge || '').toLowerCase();
      return r === 'calidad' || rn.includes('inspector') || b.includes('inspector');
    });

    // Si por alguna razón no hubiera inspectores dados de alta, tomar los que tengan permisos de inspección
    if (inspectores.length === 0) {
      inspectores = users.filter(u => Array.isArray(u.permissions) && u.permissions.includes('quality'));
    }

    const filtered = inspectores.filter(u => !q || (u.name && u.name.toLowerCase().includes(q)) || (u.payrollNumber && u.payrollNumber.toLowerCase().includes(q)));

    if (filtered.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; padding:10px; font-size:12px; color:var(--text-muted); font-style:italic;">No se encontraron inspectores de calidad coincidentes</div>';
      return;
    }

    listEl.innerHTML = filtered.map(u => {
      const isSelected = modalQualitySelectedInspector === u.name;
      return `
        <label style="display:flex; align-items:center; gap:10px; font-size:12px; padding:6px 10px; background:${isSelected ? 'rgba(139, 94, 60, 0.08)' : '#FFFFFF'}; border:1px solid ${isSelected ? 'var(--color-brand)' : 'var(--border-subtle)'}; border-radius:6px; cursor:pointer;" title="${u.name}">
          <input type="radio" name="qualityInspectorSelectedRadio" value="${u.name}" ${isSelected ? 'checked' : ''} style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
          <div style="flex:1; min-width:0;">
            <strong style="display:block; color:var(--text-primary); font-size:12px;">${u.name}</strong>
            <small style="color:#059669; font-size:11px; font-weight:700;">${u.roleName || 'Inspector de Calidad'} · Nómina #${u.payrollNumber || '-'}</small>
          </div>
        </label>
      `;
    }).join('');

    listEl.querySelectorAll('input[name="qualityInspectorSelectedRadio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          modalQualitySelectedInspector = e.target.value;
          if (inputHidden) inputHidden.value = modalQualitySelectedInspector;
          const searchInp = document.getElementById('qualityInspectorSearch');
          renderQualityInspectorList(searchInp ? searchInp.value : '');
        }
      });
    });
  }

  // Listeners de búsqueda para departamento e inspectores en el modal de calidad
  const qualityDeptSearchInp = document.getElementById('qualityDeptSearch');
  if (qualityDeptSearchInp) {
    qualityDeptSearchInp.addEventListener('input', (e) => {
      renderQualityDeptList(e.target.value);
    });
  }

  const qualityInspectorSearchInp = document.getElementById('qualityInspectorSearch');
  if (qualityInspectorSearchInp) {
    qualityInspectorSearchInp.addEventListener('input', (e) => {
      renderQualityInspectorList(e.target.value);
    });
  }

  function populateQualityDeptSelect(selectedDeptCode = '') {
    modalQualitySelectedDept = selectedDeptCode || '';
    const inputHidden = document.getElementById('newQualityDept');
    if (inputHidden) inputHidden.value = modalQualitySelectedDept;
    if (qualityDeptSearchInp) qualityDeptSearchInp.value = '';
    renderQualityDeptList('');
  }

  function populateQualityInspectorsSelect(selectedInspector = '') {
    modalQualitySelectedInspector = selectedInspector || '';
    const inputHidden = document.getElementById('newQualityInspector');
    if (inputHidden) inputHidden.value = modalQualitySelectedInspector;
    if (qualityInspectorSearchInp) qualityInspectorSearchInp.value = '';
    renderQualityInspectorList('');
  }

  window.openCreateQualityModal = function(defaultDeptCode = '') {
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
    const cycleEl = document.getElementById('newQualityCycleTime');
    const statusEl = document.getElementById('newQualityStatus');

    if (titleEl) titleEl.textContent = ' Dar de Alta Filtro de Control de Calidad';
    if (modeEl) modeEl.value = 'create';
    if (origCodeEl) origCodeEl.value = '';
    if (codeEl) codeEl.value = nextCode;
    if (nameEl) nameEl.value = '';
    if (locEl) locEl.value = '';
    if (descEl) descEl.value = '';
    if (cycleEl) cycleEl.value = '18s';
    if (statusEl) statusEl.value = 'Activo';

    populateQualityDeptSelect(defaultDeptCode);
    populateQualityInspectorsSelect('');

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
    const cycleEl = document.getElementById('newQualityCycleTime');
    const statusEl = document.getElementById('newQualityStatus');

    if (titleEl) titleEl.textContent = `Editar Filtro de Calidad · ${q.name || q.code}`;
    if (modeEl) modeEl.value = 'edit';
    if (origCodeEl) origCodeEl.value = q.code;
    if (codeEl) codeEl.value = q.code;
    if (nameEl) nameEl.value = q.name || '';
    if (locEl) locEl.value = q.location || '';
    if (descEl) descEl.value = q.criteria || q.desc || '';
    if (cycleEl) cycleEl.value = q.cycleTime || '18s';
    if (statusEl) statusEl.value = q.status || 'Activo';

    populateQualityDeptSelect(q.deptCode || '');
    populateQualityInspectorsSelect(q.inspector || '');

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
      const deptCode = (document.getElementById('newQualityDept')?.value || '').trim();
      const location = (document.getElementById('newQualityLocation')?.value || '').trim();
      const inspector = (document.getElementById('newQualityInspector')?.value || '').trim();
      const cycleTime = document.getElementById('newQualityCycleTime')?.value || '18s';
      const status = document.getElementById('newQualityStatus')?.value || 'Activo';

      if (!name) {
        window.UanifyUI.toast('Ingresa el nombre del filtro de calidad.', 'warning');
        return;
      }

      if (!deptCode) {
        window.UanifyUI.toast('Debes seleccionar el Departamento Responsable al que pertenece este filtro.', 'warning');
        return;
      }

      if (!inspector) {
        window.UanifyUI.toast('Debes seleccionar un usuario como Inspector Responsable.', 'warning');
        return;
      }

      if (!UanifyState.qualityAreas) UanifyState.qualityAreas = [];
      if (!UanifyState.stations) UanifyState.stations = [];

      const targetDept = UanifyState.stations.find(s => s.code === deptCode || s.id === deptCode);
      const computedLoc = location || (targetDept ? `Nave ${targetDept.name}` : 'Nave de Producción');

      if (mode === 'edit') {
        const qIndex = UanifyState.qualityAreas.findIndex(q => q.code === origCode || q.code === code);
        if (qIndex !== -1) {
          UanifyState.qualityAreas[qIndex] = {
            code, name, deptCode, location: computedLoc, desc: `Filtro de inspección: ${name}`, criteria: `Inspección ${name}`, inspector, cycleTime, status
          };
        }
        const stIndex = UanifyState.stations.findIndex(s => s.code === origCode || s.code === code);
        if (stIndex !== -1) {
          const st = UanifyState.stations[stIndex];
          st.name = name;
          st.deptCode = deptCode;
          st.warehouseLocation = computedLoc;
          st.cycleTime = cycleTime;
          st.operator = inspector;
          st.status = status === 'Activo' ? 'running' : 'idle';
        }
      } else {
        // Create mode
        const newQuality = {
          code, name, deptCode, location: computedLoc, desc: `Filtro de inspección: ${name}`, criteria: `Inspección ${name}`, inspector, cycleTime, status
        };
        UanifyState.qualityAreas.push(newQuality);

        const newStation = {
          id: 'calidad-' + code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          code: code,
          deptCode: deptCode,
          name: name,
          desc: `Filtro de calidad: ${name}`,
          criteria: `Inspección ${name}`,
          warehouseLocation: computedLoc,
          target: 850,
          produced: 0,
          scrap: 0,
          wipWaiting: 0,
          cycleTime: cycleTime,
          status: status === 'Activo' ? 'running' : 'idle',
          operator: inspector,
          type: 'calidad',
          isQualityStop: true,
          note: `Filtro de Calidad asignado al departamento ${targetDept ? targetDept.name : deptCode}. Auditor: ${inspector}.`
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
        mode === 'edit' ? ' Filtro Actualizado' : ' Filtro Creado'
      );
    });
  }

  // ── 7. RUTAS Y SECUENCIAS POR MODELO (CON DRAG & DROP) ─────────────────────
  const cfgRouteModelSelect = document.getElementById('cfgRouteModelSelect');
  const cfgRouteCategoryBadge = document.getElementById('cfgRouteCategoryBadge');
  const cfgRouteStepsCountBadge = document.getElementById('cfgRouteStepsCountBadge');
  const cfgRouteDesc = document.getElementById('cfgRouteDesc');
  const cfgRouteModelTitle = document.getElementById('cfgRouteModelTitle');
  const cfgRouteModelSku = document.getElementById('cfgRouteModelSku');
  const routeEmptyPrompt = document.getElementById('routeEmptyPrompt');
  const routeDetailContainer = document.getElementById('routeDetailContainer');
  const addStepStationSelect = document.getElementById('addStepStationSelect');
  const btnAddStepToRoute = document.getElementById('btnAddStepToRoute');
  const btnSaveRouteSequence = document.getElementById('btnSaveRouteSequence');
  const btnResetRouteSequence = document.getElementById('btnResetRouteSequence');
  const routeSequenceList = document.getElementById('routeSequenceList');

  // Estado del Constructor de Rutas: Inicialmente VACÍO (sin sombrero seleccionado)
  let activeRouteId = '';
  let workingRouteDraft = null;
  let originalRouteSnapshot = null;
  let hasUnsavedRouteChanges = false;
  let draggedStepIndex = null;

  function populateRouteModels() {
    if (!cfgRouteModelSelect || !UanifyState.productionRoutes) return;

    let html = `<option value="" ${!activeRouteId ? 'selected' : ''}>-- Selecciona un Modelo de Sombrero para Consultar o Editar su Ruta --</option>`;

    UanifyState.productionRoutes.forEach(r => {
      const isSelected = r.id === activeRouteId ? 'selected' : '';
      html += `<option value="${r.id}" ${isSelected}>${r.name} · [SKU: ${r.sku || 'TB-STD'}] (${r.category})</option>`;
    });

    cfgRouteModelSelect.innerHTML = html;

    // Refrescar el label del wrapper custom UanifySelect tras la población dinámica
    if (cfgRouteModelSelect._uanifySelect && cfgRouteModelSelect._uanifySelect.refresh) {
      cfgRouteModelSelect._uanifySelect.refresh();
    }
  }

  function populateAddStepStations() {
    if (!addStepStationSelect || !UanifyState.stations) return;
    
    const mfgStations = UanifyState.stations.filter(s => s.type !== 'calidad' && (!s.code || !s.code.startsWith('C-')));
    const qualityStations = (UanifyState.qualityAreas && UanifyState.qualityAreas.length > 0)
      ? UanifyState.qualityAreas
      : UanifyState.stations.filter(s => s.type === 'calidad' || (s.code && s.code.startsWith('C-')));

    let html = `<option value="">-- Selecciona Departamento o Filtro de Calidad Maestro --</option>`;

    html += `<optgroup label="── Departamentos de Manufactura (D-01 a D-14) ──">`;
    mfgStations.forEach(st => {
      html += `<option value="${st.code}">${st.code} · ${st.name} [Takt: ${st.cycleTime || '30s'}]</option>`;
    });
    html += `</optgroup>`;

    html += `<optgroup label="── Filtros de Control de Calidad (C-01 a C-04) ──">`;
    qualityStations.forEach(q => {
      html += `<option value="${q.code}">${q.code} · ${q.name} [Ciclo: ${q.cycleTime || '18s'}]</option>`;
    });
    html += `</optgroup>`;

    addStepStationSelect.innerHTML = html;
  }

  function renderRouteSequence() {
    if (!routeSequenceList || !UanifyState.productionRoutes) return;

    // Caso 1: Ningún modelo seleccionado inicialmente
    if (!activeRouteId) {
      if (routeEmptyPrompt) routeEmptyPrompt.style.display = 'block';
      if (routeDetailContainer) routeDetailContainer.style.display = 'none';
      if (btnSaveRouteSequence) btnSaveRouteSequence.style.display = 'none';
      if (btnResetRouteSequence) btnResetRouteSequence.style.display = 'none';
      return;
    }

    const route = UanifyState.productionRoutes.find(r => r.id === activeRouteId);
    if (!route) {
      activeRouteId = '';
      if (routeEmptyPrompt) routeEmptyPrompt.style.display = 'block';
      if (routeDetailContainer) routeDetailContainer.style.display = 'none';
      if (btnSaveRouteSequence) btnSaveRouteSequence.style.display = 'none';
      if (btnResetRouteSequence) btnResetRouteSequence.style.display = 'none';
      return;
    }

    // Inicializar workingRouteDraft y snapshot si no existen para este modelo
    if (!workingRouteDraft) {
      originalRouteSnapshot = JSON.parse(JSON.stringify(route.steps || []));
      workingRouteDraft = JSON.parse(JSON.stringify(route.steps || []));
      hasUnsavedRouteChanges = false;
    }

    // Mostrar contenedor de detalle y ocultar prompt vacío
    if (routeEmptyPrompt) routeEmptyPrompt.style.display = 'none';
    if (routeDetailContainer) routeDetailContainer.style.display = 'block';

    // Actualizar encabezados y metadata del sombrero
    if (cfgRouteModelTitle) cfgRouteModelTitle.textContent = route.name;
    if (cfgRouteModelSku) cfgRouteModelSku.textContent = `SKU: ${route.sku || 'TB-STD'} · Código de Ruta: ${route.id}`;
    if (cfgRouteCategoryBadge) cfgRouteCategoryBadge.textContent = route.category;
    if (cfgRouteStepsCountBadge) {
      if (hasUnsavedRouteChanges) {
        cfgRouteStepsCountBadge.innerHTML = `${workingRouteDraft.length} Pasos <span style="display:inline-block; width:7px; height:7px; background:#D97706; border-radius:50%; margin-left:4px;" title="Cambios pendientes sin guardar"></span>`;
      } else {
        cfgRouteStepsCountBadge.textContent = `${workingRouteDraft.length} Pasos`;
      }
    }
    if (cfgRouteDesc) cfgRouteDesc.textContent = route.desc || 'Ruta estándar de manufactura.';

    // Permisos: Ingeniero y Admin
    const currentUser = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const canEdit = currentUser.role === 'admin' || currentUser.role === 'ingeniero';

    // Botones de acción en encabezado
    if (btnSaveRouteSequence) {
      btnSaveRouteSequence.style.display = 'inline-flex';
      btnSaveRouteSequence.disabled = !canEdit;
      if (hasUnsavedRouteChanges) {
        btnSaveRouteSequence.style.boxShadow = '0 0 0 3px rgba(139, 94, 60, 0.25)';
      } else {
        btnSaveRouteSequence.style.boxShadow = 'none';
      }
    }

    if (btnResetRouteSequence) {
      btnResetRouteSequence.style.display = 'inline-flex';
      btnResetRouteSequence.disabled = !canEdit || !hasUnsavedRouteChanges;
      btnResetRouteSequence.style.opacity = hasUnsavedRouteChanges ? '1' : '0.55';
      btnResetRouteSequence.style.cursor = hasUnsavedRouteChanges ? 'pointer' : 'not-allowed';
    }

    if (btnAddStepToRoute) {
      btnAddStepToRoute.disabled = !canEdit;
    }

    // Renderizado de pasos (DRAG & DROP SOLAMENTE - CERO FLECHAS)
    routeSequenceList.innerHTML = workingRouteDraft.map((st, idx) => {
      const isQuality = st.type === 'calidad' || st.isQualityStop || (st.code && st.code.startsWith('C-'));
      const typeTag = isQuality 
        ? `<span class="badge-quality">Filtro de Calidad</span>`
        : `<span class="badge-subtle" style="font-size:10.5px;">Manufactura</span>`;

      return `
        <div class="sequence-builder-item ${isQuality ? 'is-quality-step' : ''}" 
             draggable="${canEdit ? 'true' : 'false'}" 
             data-index="${idx}"
             data-code="${st.code}">
          <div class="sequence-item-info">
            ${canEdit ? `<span class="drag-handle-grip" title="Arrastra para reordenar la secuencia">⠿</span>` : ''}
            <span class="sequence-order-badge">Paso #${idx + 1}</span>
            <span style="font-weight:700; color:var(--text-primary); font-size:14px;">${st.name}</span>
            ${typeTag}
            <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono); margin-left:auto;">Ciclo: ${st.cycleTime || '30s'}</span>
          </div>
          ${canEdit ? `
          <div class="sequence-controls">
            <button type="button" class="btn-table-action btn-action-delete" data-action="delete" data-index="${idx}" title="Quitar este paso de la asignación a este modelo" style="width:32px; height:32px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
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

          // Reordenar pasos en la secuencia borrador
          const [movedStep] = workingRouteDraft.splice(draggedStepIndex, 1);
          workingRouteDraft.splice(targetIdx, 0, movedStep);

          // Normalizar números de orden
          workingRouteDraft.forEach((st, i) => {
            st.order = i + 1;
          });

          hasUnsavedRouteChanges = true;
          renderRouteSequence();

          window.UanifyUI.toast(
            `Paso "${movedStep.code} ${movedStep.name}" movido a la posición #${targetIdx + 1}. Confirma tus cambios presionando "Guardar Secuencia de Ruta".`,
            'info',
            'Secuencia Reordenada (Borrador)'
          );
        });
      });
    }

    // ── BOTÓN DE ELIMINAR PASO DE LA SECUENCIA ──
    routeSequenceList.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (workingRouteDraft.length <= 2) {
          window.UanifyUI.toast('Una ruta de modelo debe tener al menos 2 pasos.', 'warning');
          return;
        }
        const removed = workingRouteDraft.splice(idx, 1)[0];
        workingRouteDraft.forEach((s, i) => s.order = i + 1);
        hasUnsavedRouteChanges = true;
        renderRouteSequence();
        window.UanifyUI.toast(
          `Paso "${removed.code} ${removed.name}" quitado de la secuencia borrador. Recuerda presionar "Guardar Secuencia de Ruta".`,
          'info',
          'Paso Quitado de la Secuencia'
        );
      });
    });
  }

  if (cfgRouteModelSelect) {
    cfgRouteModelSelect.addEventListener('change', (e) => {
      activeRouteId = e.target.value;
      workingRouteDraft = null;
      originalRouteSnapshot = null;
      hasUnsavedRouteChanges = false;
      renderRouteSequence();
    });
  }

  if (btnAddStepToRoute) {
    btnAddStepToRoute.addEventListener('click', () => {
      if (!activeRouteId || !workingRouteDraft) {
        window.UanifyUI.toast('Primero selecciona un modelo de sombrero en el menú superior.', 'warning');
        return;
      }

      const code = addStepStationSelect ? addStepStationSelect.value : null;
      if (!code) {
        window.UanifyUI.toast('Selecciona una estación o filtro de calidad maestro para asignar a la ruta.', 'warning');
        return;
      }

      // Buscar primero en qualityAreas y luego en stations
      const qualityArea = (UanifyState.qualityAreas || []).find(q => q.code === code);
      const st = (UanifyState.stations || []).find(s => s.code === code);
      if (!st && !qualityArea) return;

      const route = UanifyState.productionRoutes.find(r => r.id === activeRouteId);
      if (!route) return;

      const isQuality = Boolean(qualityArea) || (st && (st.type === 'calidad' || (st.code && st.code.startsWith('C-'))));
      const stepName = qualityArea ? qualityArea.name : st.name;
      const cycle = qualityArea ? qualityArea.cycleTime : (st.cycleTime || '30s');

      const newStep = {
        order: workingRouteDraft.length + 1,
        code: code,
        name: stepName,
        type: isQuality ? 'calidad' : (code === 'D-11' ? 'logistica' : 'manufactura'),
        icon: '',
        isQualityStop: isQuality,
        cycleTime: cycle
      };

      workingRouteDraft.push(newStep);
      hasUnsavedRouteChanges = true;
      renderRouteSequence();

      if (addStepStationSelect) addStepStationSelect.value = '';

      window.UanifyUI.toast(
        `Paso "${code} ${stepName}" asignado al final de la ruta borrador de "${route.name}". Confirma tus cambios presionando "Guardar Secuencia de Ruta".`,
        'success',
        '+ Paso Asignado (Borrador)'
      );
    });
  }

  if (btnResetRouteSequence) {
    btnResetRouteSequence.addEventListener('click', () => {
      if (!activeRouteId || !workingRouteDraft) return;

      if (!hasUnsavedRouteChanges) {
        window.UanifyUI.toast('No hay cambios pendientes de guardar en esta secuencia.', 'info');
        return;
      }

      workingRouteDraft = JSON.parse(JSON.stringify(originalRouteSnapshot));
      hasUnsavedRouteChanges = false;
      renderRouteSequence();

      window.UanifyUI.toast(
        'Se restableció la secuencia de la ruta al estado original guardado.',
        'info',
        'Secuencia Restablecida'
      );
    });
  }

  if (btnSaveRouteSequence) {
    btnSaveRouteSequence.addEventListener('click', () => {
      if (!activeRouteId || !workingRouteDraft) {
        window.UanifyUI.toast('Primero selecciona un modelo de sombrero.', 'warning');
        return;
      }

      const route = UanifyState.productionRoutes.find(r => r.id === activeRouteId);
      if (!route) return;

      // Normalizar número de órdenes
      workingRouteDraft.forEach((st, idx) => {
        st.order = idx + 1;
      });

      // Guardar en el estado real
      route.steps = JSON.parse(JSON.stringify(workingRouteDraft));
      originalRouteSnapshot = JSON.parse(JSON.stringify(route.steps));
      hasUnsavedRouteChanges = false;

      try {
        localStorage.setItem('uanify_production_routes', JSON.stringify(UanifyState.productionRoutes));
      } catch (e) {
        console.warn('Error saving production routes:', e);
      }

      if (typeof EventBus !== 'undefined') {
        EventBus.emit('production-routes-updated', route);
      }

      renderRouteSequence();

      window.UanifyUI.toast(
        `Secuencia de ruta para "${route.name}" guardada exitosamente (${route.steps.length} pasos). Los lotes de este modelo seguirán este nuevo flujo de manufactura y calidad.`,
        'success',
        'Ruta Guardada'
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
      btnTestCompac.innerHTML = '<span class="status-dot animate-pulse"></span> Verificando disponibilidad...';
      setTimeout(() => {
        btnTestCompac.disabled = false;
        btnTestCompac.innerHTML = origHtml;
        window.UanifyUI.toast(
          'Módulo en espera de homologación técnica. Los parámetros de red, servidor ODBC y credenciales se configurarán con Edmundo González y el equipo de sistemas.',
          'info',
          'En Espera de Homologación'
        );
      }, 600);
    });
  }

  // Guardar configuración general (parámetros de turno, umbrales WIP, metas)
  function handleSavePlantConfig() {
    const shiftStart = document.getElementById('cfgShiftStart');
    const shiftEnd = document.getElementById('cfgShiftEnd');
    const shiftGoal = document.getElementById('cfgShiftGoal');
    const wipAlert = document.getElementById('cfgWipAlert');
    const wipCritical = document.getElementById('cfgWipCritical');

    if (UanifyState && UanifyState.config) {
      if (shiftStart) UanifyState.config.shiftStart = shiftStart.value;
      if (shiftEnd) UanifyState.config.shiftEnd = shiftEnd.value;
      if (shiftGoal) UanifyState.config.shiftGoal = parseInt(shiftGoal.value, 10) || 4250;
      if (wipAlert) UanifyState.config.wipAlert = parseInt(wipAlert.value, 10) || 70;
      if (wipCritical) UanifyState.config.wipCritical = parseInt(wipCritical.value, 10) || 95;
    }

    try {
      localStorage.setItem('uanify_plant_config', JSON.stringify({
        shiftStart: shiftStart ? shiftStart.value : '07:00',
        shiftEnd: shiftEnd ? shiftEnd.value : '15:30',
        shiftGoal: shiftGoal ? shiftGoal.value : 4250,
        wipAlert: wipAlert ? wipAlert.value : 70,
        wipCritical: wipCritical ? wipCritical.value : 95,
        savedAt: new Date().toISOString()
      }));
    } catch (e) {
      // Ignorar si localstorage falla
    }

    if (window.UanifyUI && window.UanifyUI.toast) {
      window.UanifyUI.toast(
        'Los parámetros de planta, horarios de turno y umbrales de alerta Andon han sido guardados satisfactoriamente.',
        'success',
        'Configuración Guardada'
      );
    }
  }

  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', handleSavePlantConfig);
  }

  const btnSaveParamsSubtab = document.getElementById('btnSaveParamsSubtab');
  if (btnSaveParamsSubtab) {
    btnSaveParamsSubtab.addEventListener('click', handleSavePlantConfig);
  }

  const btnEmitSlip = document.getElementById('btnEmitDeliverySlip');
  if (btnEmitSlip) {
    btnEmitSlip.addEventListener('click', () => {
      if (typeof window.emitirValeEntrega === 'function') {
        window.emitirValeEntrega();
      }
    });
  }

  // ── 10. SINCRONIZACIÓN DE PESTAÑAS DE CONFIGURACIÓN ──
  // Las pestañas se gestionan directamente a través de initSubTabs() en app.js con soporte completo para navegación desde el sidebar y clics directos.

  // Actualizar si el usuario activo cambia en el sidebar
  EventBus.on('user-switched', () => {
    renderQualityFiltersConfig();
    renderRouteSequence();
    if (typeof renderProcessesConfig === 'function') renderProcessesConfig();
    if (typeof renderWarehousesConfig === 'function') renderWarehousesConfig();
    if (typeof renderMachinesConfig === 'function') renderMachinesConfig();
  });

  // Render inicial de las entidades
  if (typeof renderProcessesConfig === 'function') renderProcessesConfig();
  if (typeof renderWarehousesConfig === 'function') renderWarehousesConfig();
  if (typeof renderMachinesConfig === 'function') renderMachinesConfig();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.initConfigView());
} else {
  window.initConfigView();
}
