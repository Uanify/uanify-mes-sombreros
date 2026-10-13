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
      usersTableBody.innerHTML = filtered.map(u => {
        let roleBadgeClass = 'role-badge-supervisor';
        if (u.role === 'ingeniero' || u.role === 'admin') roleBadgeClass = 'role-badge-ingeniero';
        else if (u.role === 'calidad') roleBadgeClass = 'role-badge-calidad';

        // Sintetizar permisos modulares para evitar sobrecarga visual
        let permInfo = '';
        if (u.role === 'ingeniero' || u.role === 'admin' || (u.permissions && u.permissions.length >= (AvailableModules || []).length)) {
          permInfo = `<span class="badge-subtle" style="background:#F0FDF4; color:#16A34A; border:1px solid #BBF7D0; font-weight:700; font-size:11px; padding:3px 8px;">Acceso Total (Todos los Módulos)</span>`;
        } else if (u.role === 'calidad') {
          permInfo = `
            <span class="badge-subtle" style="background:#FAF5FF; color:#7E22CE; border:1px solid #E9D5FF; font-weight:700; font-size:11px; padding:3px 8px;">Filtros de Calidad C1 a C5</span>
            <span class="table-cell-subtext" style="display:block; margin-top:2px;">Terminal de Inspección, Andon, Almacén</span>
          `;
        } else {
          const permPills = (u.permissions || []).map(p => {
            const mod = AvailableModules.find(m => m.id === p);
            return `<span class="perm-pill" style="font-size:10.5px; padding:2px 7px;">${mod ? mod.name : p}</span>`;
          }).join(' ');
          permInfo = `<div style="display:flex; flex-wrap:wrap; gap:3px; max-width:280px;">${permPills}</div>`;
        }

        // Departamentos asignados compactos con botón de ver detalle
        let deptsInfo = '';
        if (u.assignedDepartments && (u.assignedDepartments.includes('*') || u.role === 'admin' || u.role === 'ingeniero')) {
          deptsInfo = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge-subtle" style="font-weight:700; font-size:11px; padding:3px 8px; color:var(--color-brand); background:rgba(139, 94, 60, 0.08); border:1px solid rgba(139, 94, 60, 0.25);">Supervisión Global (14 Áreas)</span>
              <button type="button" class="btn-subtle" onclick="window.viewUserDepts('${u.id}')" style="font-size:11px; padding:2px 8px; height:24px; cursor:pointer;" title="Consultar todas las áreas asignadas">Ver Áreas</button>
            </div>
          `;
        } else if (u.assignedDepartments && u.assignedDepartments.length > 0) {
          deptsInfo = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge-subtle" style="font-weight:700; font-size:11.5px; padding:3px 8px; color:var(--text-primary); background:#F1F5F9; border:1px solid var(--border-medium);">
                ${u.assignedDepartments.length} Departamento${u.assignedDepartments.length !== 1 ? 's' : ''} Asignado${u.assignedDepartments.length !== 1 ? 's' : ''}
              </span>
              <button type="button" class="btn-secondary" onclick="window.viewUserDepts('${u.id}')" style="font-size:11.5px; padding:3px 10px; height:28px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Ver detalle de departamentos y estaciones asignadas">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Ver Detalle
              </button>
            </div>
          `;
        } else {
          deptsInfo = `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Sin departamentos asignados</span>`;
        }

        return `
          <tr>
            <td class="col-name">
              <div class="table-cell-primary" style="font-size:14px; font-weight:700;">${u.name}</div>
            </td>
            <td style="text-align:center;">
              <span class="role-badge ${roleBadgeClass}" style="margin:0 auto; font-size:11.5px; padding:4px 10px;">${u.badge || u.roleName}</span>
            </td>
            <td>
              ${deptsInfo}
            </td>
            <td>
              ${permInfo}
            </td>
            <td class="col-actions" style="text-align:center;">
              <div class="action-btns-cell" style="justify-content:center;">
                <button type="button" class="btn-table-action btn-action-edit" onclick="openEditUserModal('${u.id}')" title="Editar permisos y departamentos">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                ${u.id !== 'admin-1' ? `
                  <button type="button" class="btn-table-action btn-action-delete" onclick="deleteUser('${u.id}')" title="Eliminar usuario">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                ` : `
                  <button type="button" class="btn-table-action btn-action-delete" disabled style="opacity:0.35; cursor:not-allowed !important; background:#F8FAFC; border-color:#E2E8F0; color:#94A3B8;" title="Usuario Principal (Protegido contra eliminación)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </button>
                `}
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

  // ── VISOR DE DEPARTAMENTOS ASIGNADOS A UN USUARIO ──────────────────────────
  window.viewUserDepts = function(userId) {
    const user = UanifyState.users.find(u => u.id === userId);
    const modal = document.getElementById('modalUserDeptsViewer');
    const titleEl = document.getElementById('userDeptsViewerTitle');
    const subEl = document.getElementById('userDeptsViewerSubtitle');
    const listEl = document.getElementById('userDeptsViewerList');
    if (!user || !modal || !listEl) return;

    if (titleEl) titleEl.textContent = `Departamentos Asignados · ${user.name}`;
    if (subEl) subEl.textContent = `${user.badge || user.roleName} · Estaciones de trabajo asignadas`;

    const userDepts = user.assignedDepartments || [];
    const isGlobal = userDepts.includes('*') || user.role === 'admin' || user.role === 'ingeniero';

    let deptsToShow = [];
    if (isGlobal) {
      deptsToShow = UanifyState.stations || [];
    } else {
      deptsToShow = (UanifyState.stations || []).filter(s => userDepts.includes(s.code));
    }

    if (deptsToShow.length === 0) {
      listEl.innerHTML = `
        <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:13px; background:#F8FAFC; border-radius:8px;">
          Este usuario no tiene estaciones ni departamentos asignados actualmente.
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

  window.openCreateUserModal = function() {
    if (!modalCreateUser) return;
    configureUserRoleOptions();
    const nameInput = document.getElementById('newUserName');
    if (nameInput) nameInput.value = '';
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
    });
  }

  if (formCreateUser) {
    formCreateUser.addEventListener('submit', (e) => {
      e.preventDefault();
      const activeUser = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
      const name = document.getElementById('newUserName')?.value.trim();
      const email = document.getElementById('newUserEmail')?.value.trim() || 'usuario@tombstone.mx';
      const role = selectNewRole ? selectNewRole.value : 'supervisor';

      if (!name) {
        window.UanifyUI.toast('Por favor ingresa el nombre completo del usuario.', 'warning', 'Nombre Requerido');
        return;
      }

      // Restricción: Los ingenieros no pueden crear otros ingenieros ni administradores
      const roleDef = RoleFixedPermissions[role] || RoleFixedPermissions.supervisor;
      let assignedDepts = ['D-05', 'D-06'];

      if (role === 'ingeniero') {
        assignedDepts = ['*'];
      } else if (role === 'calidad') {
        assignedDepts = ['C-01', 'C-02', 'C-03', 'C-04'];
      }

      const newUser = {
        id: 'usr-' + Date.now().toString(36),
        name,
        email,
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
        `Usuario "${name}" (${roleDef.roleName}) creado exitosamente con permisos automáticos de su rol.`,
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

    // Configurar vista previa de permisos según rol
    updateRolePermsPreview(user.role, 'editRolePermsTitle', 'editRolePermsDesc');
    const editRoleSelect = document.getElementById('editUserRoleSelect');
    if (editRoleSelect) {
      editRoleSelect.onchange = (e) => {
        updateRolePermsPreview(e.target.value, 'editRolePermsTitle', 'editRolePermsDesc');
      };
    }

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

      const roleDef = RoleFixedPermissions[role] || RoleFixedPermissions.supervisor;

      user.name = name;
      user.email = email;
      user.role = role;
      user.permissions = [...roleDef.perms];

      if (role === 'ingeniero') {
        user.roleName = roleDef.roleName;
        user.badge = roleDef.badge;
        user.assignedDepartments = ['*'];
      } else if (role === 'calidad') {
        user.roleName = roleDef.roleName;
        user.badge = roleDef.badge;
        user.assignedDepartments = selectedDepts.length > 0 ? selectedDepts : ['C-01', 'C-02', 'C-03', 'C-04'];
      } else {
        const deptNames = selectedDepts.map(c => {
          const st = (UanifyState.stations || []).find(s => s.code === c);
          return st ? st.name : c;
        });
        user.roleName = `Supervisor (${deptNames.length > 0 ? deptNames.join(', ') : 'Sin Deptos'})`;
        user.badge = 'Supervisor';
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

      const savedDeptNames = user.assignedDepartments.includes('*')
        ? 'Todos los Departamentos'
        : user.assignedDepartments.map(c => {
            const st = (UanifyState.stations || []).find(s => s.code === c);
            return st ? st.name : c;
          }).join(', ');

      window.UanifyUI.toast(
        `Usuario "${user.name}" actualizado. Departamentos asignados: ${savedDeptNames || 'Ninguno'}.`,
        'success',
        'OK Usuario y Deptos Actualizados'
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

  // ── 9. MODAL: GESTIÓN RELACIONAL DE DEPARTAMENTO (PROCESOS, MÁQUINAS CON ID, ALMACENES & SUPERVISIÓN) ─
  const modalCreateDept = document.getElementById('modalCreateDepartment');
  const btnOpenCreateDept = document.getElementById('btnOpenCreateDeptModal');
  const btnCloseCreateDept = document.getElementById('btnCloseCreateDeptModal');
  const btnCancelCreateDept = document.getElementById('btnCancelCreateDept');
  const formCreateDept = document.getElementById('formCreateDepartment');
  const newDeptSupervisor = document.getElementById('newDeptSupervisor');
  const newDeptOperatorsList = document.getElementById('newDeptOperatorsList');
  const deptProcessesContainer = document.getElementById('deptProcessesContainer');
  const btnDeptAddProcessRow = document.getElementById('btnDeptAddProcessRow');

  // Estado temporal de procesos y máquinas para el modal en edición/creación
  let currentModalProcesses = [];

  // Toggle colapsable para secciones del modal de departamento (acordeón ergonómico)
  window.toggleModalCollapse = function(secId) {
    const sec = document.getElementById(secId);
    if (!sec) return;
    sec.classList.toggle('active');
  };

  // Buscador interactivo de supervisores en el modal
  const newDeptSupervisorSearch = document.getElementById('newDeptSupervisorSearch');
  if (newDeptSupervisorSearch && newDeptSupervisor) {
    newDeptSupervisorSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const options = Array.from(newDeptSupervisor.options);
      let firstVisible = null;
      options.forEach(opt => {
        const matches = opt.textContent.toLowerCase().includes(q);
        opt.style.display = matches ? '' : 'none';
        if (matches && !firstVisible) firstVisible = opt;
      });
      if (firstVisible && !options.find(o => o.selected && o.style.display !== 'none')) {
        firstVisible.selected = true;
      }
      if (newDeptSupervisor._uanifySelect) {
        newDeptSupervisor._uanifySelect.updateLabel();
      }
    });
  }

  function renderModalProcessesUI() {
    if (!deptProcessesContainer) return;
    if (currentModalProcesses.length === 0) {
      deptProcessesContainer.innerHTML = `
        <div style="padding:14px; text-align:center; background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:8px; color:var(--text-secondary); font-size:12px;">
          No hay procesos registrados para este departamento. Haz clic en <strong>"+ Agregar Proceso"</strong> para asociar operaciones o filtros de calidad.
        </div>
      `;
      return;
    }

    deptProcessesContainer.innerHTML = currentModalProcesses.map((proc, pIdx) => {
      const cleanProcName = (proc.name || '').replace(/^(PROC-\d+|C-\d+)\s*[-·:]?\s*/i, '');
      const machinesListHtml = (proc.machines || []).map((m, mIdx) => {
        const machVal = (m.name || m.id || '').trim();
        return `
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
            <input type="text" class="form-input form-input-sm proc-mach-name" data-pidx="${pIdx}" data-midx="${mIdx}" value="${machVal}" placeholder="Nombre de máquina o puesto (ej. Mesa de Tendido 12m Alumínio, Cortadora KM-01)" style="min-height:38px; font-size:13px; flex:1;" required>
            <button type="button" class="btn-table-action btn-action-delete" style="min-height:38px; min-width:38px; width:38px; height:38px; flex-shrink:0;" onclick="window.removeMachineFromProcess(${pIdx}, ${mIdx})" title="Quitar máquina">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        `;
      }).join('');

      return `
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:8px; padding:12px; position:relative; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:12px; font-weight:800; color:var(--color-brand); background:rgba(139, 94, 60, 0.1); padding:2px 8px; border-radius:6px;">
                Proceso #${pIdx+1}
              </span>
            </div>
            <button type="button" class="btn-table-action btn-action-delete" style="height:28px; width:28px;" onclick="window.removeProcessRow(${pIdx})" title="Eliminar este proceso">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>

          <!-- Solo nombre del proceso limpio (sin IDs, sin tipo, sin ciclo) -->
          <div style="margin-bottom:10px;">
            <label class="field-label" style="font-size:11px; margin-bottom:4px;">
              <span>Nombre de la Operación / Proceso:</span>
              <span class="info-tip">
                <button type="button" class="info-tip-btn" aria-label="Información">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><circle cx="12" cy="8" r="1.25" fill="currentColor"/></svg>
                </button>
                <span class="info-tip-popup">Nombre de la operación productiva o parada de control de calidad.</span>
              </span>
            </label>
            <input type="text" class="form-input form-input-sm proc-field-name" data-pidx="${pIdx}" value="${cleanProcName}" placeholder="ej. Tendido de Rollos, Baño de Dope, Calidad Final" style="height:36px; font-size:12.5px;" required>
          </div>

          <!-- Sub-lista: Máquinas y Áreas de Trabajo Limpias (sin IDs) -->
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">
                🏭 Máquinas & Puestos de Trabajo
              </span>
              <button type="button" class="btn-secondary btn-sm" style="min-height:26px; font-size:10.5px; padding:0 8px; font-weight:700;" onclick="window.addMachineToProcess(${pIdx})">
                + Agregar Máquina / Puesto
              </button>
            </div>
            <div class="proc-machines-list" data-pidx="${pIdx}">
              ${machinesListHtml || '<div style="font-size:11.5px; color:var(--text-muted); font-style:italic; padding:4px 0;">No hay máquinas registradas en este proceso aún.</div>'}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Sincronizar inputs al escribir para no perder valores
    deptProcessesContainer.querySelectorAll('.proc-field-name').forEach(input => {
      input.addEventListener('input', (e) => {
        const pIdx = parseInt(e.target.getAttribute('data-pidx'), 10);
        if (currentModalProcesses[pIdx]) currentModalProcesses[pIdx].name = e.target.value;
      });
    });
    deptProcessesContainer.querySelectorAll('.proc-mach-name').forEach(input => {
      input.addEventListener('input', (e) => {
        const pIdx = parseInt(e.target.getAttribute('data-pidx'), 10);
        const mIdx = parseInt(e.target.getAttribute('data-midx'), 10);
        if (currentModalProcesses[pIdx] && currentModalProcesses[pIdx].machines[mIdx]) {
          currentModalProcesses[pIdx].machines[mIdx].name = e.target.value;
        }
      });
    });
  }

  // Funciones de gestión en modal expuestas globalmente
  window.removeProcessRow = function(pIdx) {
    if (currentModalProcesses.length <= 1) {
      window.UanifyUI.toast('Un departamento debe tener al menos 1 proceso asignado.', 'warning');
      return;
    }
    currentModalProcesses.splice(pIdx, 1);
    renderModalProcessesUI();
  };

  window.addMachineToProcess = function(pIdx) {
    if (!currentModalProcesses[pIdx]) return;
    if (!Array.isArray(currentModalProcesses[pIdx].machines)) {
      currentModalProcesses[pIdx].machines = [];
    }
    const nextMachNum = currentModalProcesses[pIdx].machines.length + 1;
    currentModalProcesses[pIdx].machines.push({
      id: `MAQ-${nextMachNum}`,
      name: `Estación / Máquina ${nextMachNum}`,
      status: 'operativa'
    });
    renderModalProcessesUI();
  };

  window.removeMachineFromProcess = function(pIdx, mIdx) {
    if (currentModalProcesses[pIdx] && currentModalProcesses[pIdx].machines) {
      currentModalProcesses[pIdx].machines.splice(mIdx, 1);
      renderModalProcessesUI();
    }
  };

  window.addProcessRowToDeptModal = function() {
    const nextPNum = currentModalProcesses.length + 1;
    currentModalProcesses.push({
      id: `PROC-${Date.now()}-${nextPNum}`,
      code: `PROC-${String(nextPNum).padStart(2, '0')}`,
      name: `Proceso ${nextPNum}`,
      type: 'manufactura',
      cycleTime: '35s',
      machines: [
        { id: `MAQ-${nextPNum}`, name: `Estación ${nextPNum}`, status: 'operativa' }
      ]
    });
    renderModalProcessesUI();
  };

  function openCreateDeptModal() {
    if (!modalCreateDept) return;

    const editModeInput = document.getElementById('deptModalEditMode');
    const origCodeInput = document.getElementById('deptModalOriginalCode');
    const modalTitle = document.getElementById('deptModalTitle');

    if (editModeInput) editModeInput.value = 'create';
    if (origCodeInput) origCodeInput.value = '';
    if (modalTitle) modalTitle.textContent = 'Nuevo Departamento & Estructura Relacional';

    // Sugerir código D-XX
    const newDeptCodeInput = document.getElementById('newDeptCode');
    const nextNum = (UanifyState.stations || []).length + 1;
    const nextCode = `D-${String(nextNum).padStart(2, '0')}`;
    if (newDeptCodeInput) newDeptCodeInput.value = nextCode;

    const nameInput = document.getElementById('newDeptName');
    const descInput = document.getElementById('newDeptDesc');
    const cycleTimeInput = document.getElementById('newDeptCycleTime');
    const warehouseInput = document.getElementById('newDeptWarehouse');
    const locationInput = document.getElementById('newDeptWarehouseLocation');
    const capacityInput = document.getElementById('newDeptCapacity');

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (cycleTimeInput) cycleTimeInput.value = '35s';
    if (warehouseInput) warehouseInput.value = `Buffer Entrada (ALM-${nextCode}), Buffer Salida (ALM-${nextCode}-S)`;
    if (locationInput) locationInput.value = 'Nave Central - Pasillo 2';
    if (capacityInput) capacityInput.value = '180';

    // Inicializar procesos relacionales con estructura por defecto
    currentModalProcesses = [
      {
        id: `PROC-${nextCode}-01`,
        code: `PROC-01`,
        name: `Operación Primaria ${nextCode}`,
        deptCode: nextCode,
        type: 'manufactura',
        cycleTime: '20s',
        machines: [
          { id: 'MAQ-01', name: 'Estación de Trabajo Primaria', status: 'operativa' }
        ]
      },
      {
        id: `PROC-${nextCode}-02`,
        code: `PROC-02`,
        name: `Operación Secundaria / Inspección`,
        deptCode: nextCode,
        type: 'manufactura',
        cycleTime: '15s',
        machines: [
          { id: 'MAQ-02', name: 'Estación Auxiliar / Banco', status: 'operativa' }
        ]
      }
    ];
    renderModalProcessesUI();

    // Poblar supervisores
    if (newDeptSupervisor && UanifyState.users) {
      const supervisors = UanifyState.users.filter(u => u.role === 'supervisor' || u.role === 'admin' || u.role === 'ingeniero');
      newDeptSupervisor.innerHTML = supervisors.map(s => `
        <option value="${s.id}">${s.name} (${s.roleName || s.role})</option>
      `).join('');
    }

    // Poblar lista de operadores existentes con checkboxes
    if (newDeptOperatorsList && UanifyState.operators) {
      newDeptOperatorsList.innerHTML = UanifyState.operators.map(op => `
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; padding:3px 0;">
          <input type="checkbox" class="dept-op-cb" value="${op.empId || op.id}" style="cursor:pointer; accent-color:var(--color-brand);">
          <span><strong>${op.name}</strong> · ${op.deptCode || 'Sin Depto'} (${op.machine || 'Puesto'})</span>
        </label>
      `).join('');
    }

    // En acordeón ergonómico, abrir secciones 1 y 2 por defecto
    document.querySelectorAll('#modalCreateDepartment .modal-collapse-section').forEach((sec, idx) => {
      if (idx === 0 || idx === 1) sec.classList.add('active');
      else sec.classList.remove('active');
    });

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
    if (modalTitle) modalTitle.textContent = `Editar Departamento ${station.code} - ${station.name}`;

    const codeInput = document.getElementById('newDeptCode');
    const nameInput = document.getElementById('newDeptName');
    const descInput = document.getElementById('newDeptDesc');
    const cycleTimeInput = document.getElementById('newDeptCycleTime');
    const warehouseInput = document.getElementById('newDeptWarehouse');
    const locationInput = document.getElementById('newDeptWarehouseLocation');
    const capacityInput = document.getElementById('newDeptCapacity');

    if (codeInput) codeInput.value = station.code || '';
    if (nameInput) nameInput.value = station.name || '';
    if (descInput) descInput.value = station.desc || station.note || '';
    if (cycleTimeInput) cycleTimeInput.value = station.cycleTime || '35s';
    if (warehouseInput) warehouseInput.value = station.intermediateWarehouse || (`Buffer Intermedio ${station.code}`);
    if (locationInput) locationInput.value = station.warehouseLocation || 'Nave Central';
    if (capacityInput) capacityInput.value = station.wipCapacity || station.target || 180;

    // Obtener procesos asociados desde UanifyState.processes o construir a partir de station
    let linkedProcesses = (UanifyState.processes || []).filter(p => p.deptCode === station.code);
    if (linkedProcesses.length === 0) {
      const procStrings = (station.processes ? station.processes.split(/[,;]/) : [station.name]).map(p => p.trim()).filter(Boolean);
      const parsedMachines = rawMachines.map((raw, rIdx) => {
        // Limpiar prefijo tipo ID si existiese (ej. "MAQ-01 Celda...")
        const cleanName = raw.replace(/^[A-Z0-9\-]+\s+/i, '').trim();
        return {
          id: `MAQ-${String(rIdx + 1).padStart(2, '0')}`,
          name: cleanName || raw.trim(),
          status: 'operativa'
        };
      });

      linkedProcesses = procStrings.map((procName, pIdx) => {
        const isQ = procName.toLowerCase().includes('calidad') || procName.startsWith('C-') || station.type === 'calidad';
        return {
          id: `PROC-${station.code}-${pIdx+1}`,
          code: isQ ? (procName.match(/C-\d+/) ? procName.match(/C-\d+/)[0] : `C-0${pIdx+1}`) : `PROC-${String(pIdx+1).padStart(2, '0')}`,
          name: procName,
          deptCode: station.code,
          type: isQ ? 'calidad' : (station.type === 'prensas' ? 'prensas' : 'manufactura'),
          cycleTime: station.cycleTime || '30s',
          machines: pIdx === 0 ? parsedMachines : [{ id: `MAQ-0${pIdx+1}`, name: `Estación ${procName}`, status: 'operativa' }]
        };
      });
    }

    currentModalProcesses = JSON.parse(JSON.stringify(linkedProcesses));
    renderModalProcessesUI();

    const supSearchInput = document.getElementById('newDeptSupervisorSearch');
    if (supSearchInput) supSearchInput.value = '';

    // En acordeón ergonómico, abrir la primera sección por defecto para evitar colapsos visuales y scroll infinito
    document.querySelectorAll('#modalCreateDepartment .modal-collapse-section').forEach((sec, idx) => {
      if (idx === 0 || idx === 1) sec.classList.add('active');
      else sec.classList.remove('active');
    });

    // Poblar supervisores
    if (newDeptSupervisor && UanifyState.users) {
      const supervisors = UanifyState.users.filter(u => u.role === 'supervisor' || u.role === 'admin' || u.role === 'ingeniero');
      newDeptSupervisor.innerHTML = supervisors.map(s => `
        <option value="${s.id}" ${s.name === station.operator ? 'selected' : ''}>${s.name} (${s.roleName || s.role})</option>
      `).join('');
    }

    // Poblar operadores y marcar los asignados
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
      `¿Estás seguro de eliminar el departamento ${station.code} - "${station.name}"? Esta acción removerá sus procesos, maquinaria y almacenes asociados de la configuración.`,
      () => {
        UanifyState.stations = UanifyState.stations.filter(s => s.code !== deptCode && s.id !== deptCode);
        // Remover también procesos asociados
        if (UanifyState.processes) {
          UanifyState.processes = UanifyState.processes.filter(p => p.deptCode !== deptCode);
          try {
            localStorage.setItem('uanify_processes', JSON.stringify(UanifyState.processes));
          } catch (e) {
            console.warn('Error saving processes after delete:', e);
          }
        }

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
          `Departamento ${station.code} "${station.name}" y sus procesos eliminados del catálogo.`,
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
      const desc = document.getElementById('newDeptDesc')?.value.trim() || 'Proceso de fabricación en planta';
      const cycleTime = document.getElementById('newDeptCycleTime')?.value.trim() || '35s';
      const warehouse = document.getElementById('newDeptWarehouse')?.value.trim() || `Buffer Intermedio ${name}`;
      const location = document.getElementById('newDeptWarehouseLocation')?.value.trim() || 'Nave Central';
      const capacity = parseInt(document.getElementById('newDeptCapacity')?.value, 10) || 180;
      const supUserId = newDeptSupervisor?.value;
      const supervisor = UanifyState.users.find(u => u.id === supUserId) || UanifyState.users[0];

      if (!name) {
        window.UanifyUI.toast('Por favor ingresa el nombre del departamento.', 'warning', 'Campo Requerido');
        return;
      }

      if (currentModalProcesses.length === 0) {
        window.UanifyUI.toast('Debes registrar al menos un proceso para este departamento.', 'warning', 'Procesos Requeridos');
        return;
      }

      // Validar y vincular formalmente deptCode a los procesos y sus máquinas
      currentModalProcesses.forEach((p, idx) => {
        p.deptCode = code;
        if (!p.code) p.code = `PROC-${String(idx+1).padStart(2, '0')}`;
        if (!p.id) p.id = `PROC-${code}-${idx+1}`;
        if (!Array.isArray(p.machines)) p.machines = [];
      });

      // Actualizar colección formal UanifyState.processes
      if (!UanifyState.processes) UanifyState.processes = [];
      // Quitar los procesos viejos del departamento si es edición o reemplazo
      UanifyState.processes = UanifyState.processes.filter(p => p.deptCode !== (isEdit ? origCode : code));
      // Insertar los procesos actualizados
      UanifyState.processes.push(...currentModalProcesses);
      try {
        localStorage.setItem('uanify_processes', JSON.stringify(UanifyState.processes));
      } catch (err) {
        console.warn('Error saving uanify_processes:', err);
      }

      // Consolidar strings para compatibilidad con vistas Andon y Terminal
      const processesSummary = currentModalProcesses.map(p => `${p.code} ${p.name}`).join(', ');
      const allMachsSummary = currentModalProcesses.flatMap(p => (p.machines || []).map(m => `${m.id} ${m.name}`)).join(', ');

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
          machine: quickOpMachine || 'MAQ-01',
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
          op.deptCode = '';
          op.department = 'Sin Asignar';
          op.deptName = 'Sin Asignar';
        }
      });

      const hasCalidad = currentModalProcesses.some(p => p.type === 'calidad' || (p.code && p.code.startsWith('C-')));
      const hasPrensas = currentModalProcesses.some(p => p.type === 'prensas');
      const inferredType = hasCalidad ? 'calidad' : (hasPrensas || code === 'D-05' ? 'prensas' : (code === 'D-11' ? 'logistica' : 'manufactura'));

      if (isEdit) {
        const stIndex = (UanifyState.stations || []).findIndex(s => s.code === origCode || s.id === origCode);
        if (stIndex !== -1) {
          const st = UanifyState.stations[stIndex];
          st.code = code;
          st.name = name;
          st.desc = desc;
          st.processes = processesSummary;
          st.type = inferredType;
          st.cycleTime = cycleTime;
          st.intermediateWarehouse = warehouse;
          st.warehouseLocation = location;
          st.wipCapacity = capacity;
          st.target = capacity;
          st.machines = allMachsSummary || 'Estación manual EST-01';
          st.operator = supervisor.name;
          st.note = desc;
        }
      } else {
        const newStation = {
          id: 'dept-' + code.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          code: code,
          name: name,
          desc: desc,
          processes: processesSummary,
          type: inferredType,
          intermediateWarehouse: warehouse,
          warehouseLocation: location,
          wipCapacity: capacity,
          target: capacity,
          produced: 0,
          scrap: 0,
          wipWaiting: 0,
          cycleTime: cycleTime,
          machines: allMachsSummary || 'Estación manual EST-01',
          operator: supervisor.name,
          note: `Departamento registrado. Supervisado por ${supervisor.name}.`
        };

        if (!UanifyState.stations) UanifyState.stations = [];
        UanifyState.stations.push(newStation);
      }

      // Asignar departamento al supervisor si no tiene acceso global '*' (Relación M:N)
      if (supervisor.assignedDepartments && supervisor.assignedDepartments[0] !== '*') {
        if (!supervisor.assignedDepartments.includes(code)) {
          supervisor.assignedDepartments.push(code);
        }
      }

      // Guardar departamentos en localStorage
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

      const totalMachinesCount = currentModalProcesses.reduce((acc, p) => acc + (p.machines ? p.machines.length : 0), 0);
      window.UanifyUI.toast(
        isEdit 
          ? `Departamento ${code} "${name}" actualizado con ${currentModalProcesses.length} proceso(s) y ${totalMachinesCount} máquina(s) con ID.`
          : `Departamento ${code} "${name}" registrado exitosamente con ${currentModalProcesses.length} procesos, ${totalMachinesCount} máquinas con ID y supervisor ${supervisor.name}.`,
        'success',
        isEdit ? ' Departamento Actualizado' : ' Departamento Creado'
      );
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
    const machInp = document.getElementById('procStandaloneMachines');
    const deptSelect = document.getElementById('procStandaloneDept');

    if (nameInp) nameInp.value = '';
    if (cycleInp) cycleInp.value = '35s';
    if (machInp) machInp.value = '';

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
      const machRaw = document.getElementById('procStandaloneMachines')?.value.trim() || '';

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

      // Convertir máquinas
      const machinesList = machRaw ? machRaw.split(',').map((m, i) => {
        const cleanM = m.trim();
        return { id: `M-${i+1}`, name: cleanM, status: 'operativa' };
      }).filter(m => m.name) : [];

      const targetDept = (UanifyState.stations || []).find(s => s.code === targetDeptCode || s.id === targetDeptCode);
      const newProcObj = {
        id: `PROC-${targetDeptCode}-${Date.now().toString().slice(-4)}`,
        code: `PROC-${String(UanifyState.processes.length + 1).padStart(2, '0')}`,
        name: procName,
        deptCode: targetDeptCode,
        type: procType,
        cycleTime: procCycle,
        machines: machinesList
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
    const taktEl = document.getElementById('deptViewerTakt');
    const cycleEl = document.getElementById('deptViewerCycle');
    const procListEl = document.getElementById('deptViewerProcessesList');
    const machListEl = document.getElementById('deptViewerMachinesList');
    const whListEl = document.getElementById('deptViewerWarehousesList');

    if (titleEl) titleEl.textContent = station.name;
    if (subEl) subEl.textContent = `Detalles de flujo operativo y estaciones para ${station.name}`;
    if (supEl) supEl.textContent = station.operator || 'Supervisor Asignado';
    if (cycleEl) cycleEl.textContent = station.cycleTime || '35s';

    // Procesos formales
    let deptProcesses = (UanifyState.processes || []).filter(p => p.deptCode === station.code);
    if (deptProcesses.length === 0 && station.processes) {
      deptProcesses = station.processes.split(/[,;]/).map(p => ({
        name: p.trim().replace(/^(PROC-\d+|C-\d+)\s*/i, ''),
        type: p.toLowerCase().includes('calidad') ? 'calidad' : 'manufactura'
      })).filter(p => p.name);
    }

    if (procListEl) {
      if (deptProcesses.length > 0) {
        procListEl.innerHTML = deptProcesses.map((p, idx) => {
          const isQ = p.type === 'calidad' || (p.name && p.name.toLowerCase().includes('calidad'));
          const cleanName = (p.name || '').replace(/^(PROC-\d+|C-\d+)\s*/i, '');
          const badgeClass = isQ ? 'chip-clean chip-clean-quality' : 'chip-clean chip-clean-process';
          const icon = isQ ? '🔬' : '⚙️';
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border:1px solid var(--border-subtle); padding:8px 12px; border-radius:8px;">
              <span class="${badgeClass}">${icon} ${cleanName}</span>
              <span style="font-size:12px; color:var(--text-secondary);">${isQ ? 'Punto de Calidad' : 'Etapa Productiva'}</span>
            </div>
          `;
        }).join('');
      } else {
        procListEl.innerHTML = '<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Sin procesos asignados</span>';
      }
    }

    // 2. Filtros de Calidad vinculados al departamento
    const qualListEl = document.getElementById('deptViewerQualityList');
    const deptQualities = (UanifyState.qualityAreas || []).filter(q => q.deptCode === station.code || q.deptCode === station.id);
    if (qualListEl) {
      if (deptQualities.length > 0) {
        qualListEl.innerHTML = deptQualities.map(q => `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#FFFBEB; border:1px solid #FDE68A; padding:8px 12px; border-radius:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="chip-clean chip-clean-quality" style="font-weight:700;">🔬 ${q.name}</span>
              <span style="font-size:11.5px; color:#B45309; font-weight:600;">(${q.code})</span>
            </div>
            <div style="font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-brand);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>${q.inspector || 'Inspector por asignar'}</span>
            </div>
          </div>
        `).join('');
      } else {
        qualListEl.innerHTML = '<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Sin filtros de calidad asignados a este departamento.</span>';
      }
    }

    // 3. Máquinas y sus Operadores asignados
    let allMachines = [];
    deptProcesses.forEach(proc => {
      if (Array.isArray(proc.machines) && proc.machines.length > 0) {
        proc.machines.forEach(m => {
          if (m && m.name && !allMachines.some(existing => existing.name === m.name)) {
            allMachines.push({ ...m, processName: proc.name });
          }
        });
      }
    });

    if (allMachines.length === 0 && station.machines) {
      allMachines = station.machines.split(/[,;]/).map(m => {
        const clean = m.trim().replace(/^[A-Z0-9\-]+\s+/i, '');
        return { name: clean || m.trim(), processName: station.name };
      }).filter(m => m.name);
    }

    if (machListEl) {
      if (allMachines.length > 0) {
        machListEl.innerHTML = allMachines.map(m => {
          const cleanM = (m.name || '').replace(/^[A-Z0-9\-]+\s+/i, '');
          // Buscar operadores asignados a esta máquina en el padrón
          const assignedOps = (UanifyState.operators || []).filter(op => {
            return (op.machine && op.machine.toLowerCase() === cleanM.toLowerCase()) ||
                   (Array.isArray(m.operatorIds) && (m.operatorIds.includes(op.empId) || m.operatorIds.includes(op.id)));
          });

          const opsHtml = assignedOps.length > 0
            ? assignedOps.map(op => `<span style="display:inline-flex; align-items:center; gap:4px; font-size:11.5px; background:#EFF6FF; color:#1E40AF; padding:2px 8px; border-radius:6px; font-weight:600;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${op.name}</span>`).join(' ')
            : `<span style="font-size:11.5px; color:var(--text-muted); font-style:italic;">Sin operador fijo</span>`;

          return `
            <div style="background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:8px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <div>
                <div style="font-size:13px; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
                  <span class="chip-clean chip-clean-machine" style="font-size:12px; padding:4px 10px;">🏭 ${cleanM}</span>
                  ${m.processName ? `<span style="font-size:11.5px; color:var(--text-muted);">· ${m.processName}</span>` : ''}
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--text-muted);">Operador(es):</span>
                ${opsHtml}
              </div>
            </div>
          `;
        }).join('');
      } else {
        machListEl.innerHTML = '<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Sin máquinas asignadas</span>';
      }
    }

    // 4. Almacenes Buffer y su capacidad WIP
    const whList = (station.intermediateWarehouse ? station.intermediateWarehouse.split(/[,;]/) : ['Buffer de Espera']).map(w => w.trim().replace(/\s*\([A-Z0-9\-]+\)/gi, '')).filter(Boolean);
    if (whListEl) {
      if (whList.length > 0) {
        const whCap = station.wipCapacity || 180;
        whListEl.innerHTML = whList.map(w => `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border:1px solid var(--border-subtle); padding:10px 12px; border-radius:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="chip-clean-wh" style="font-size:12.5px;">📦 ${w}</span>
              <span style="font-size:11.5px; color:var(--text-muted);">Buffer de Salida / Traspaso</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:11.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Capacidad WIP:</span>
              <span style="font-family:var(--font-mono); font-size:12.5px; font-weight:700; color:var(--color-brand); background:rgba(139,94,60,0.08); padding:2px 8px; border-radius:6px; border:1px solid rgba(139,94,60,0.2);">${whCap} piezas</span>
            </div>
          </div>
        `).join('');
      } else {
        whListEl.innerHTML = '<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Sin almacenes asociados</span>';
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
      const currMach = op.machine ? `<span style="font-size:11px; color:var(--color-brand); font-weight:600;">[${op.machine}]</span>` : '';
      return `
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; padding:4px 0; border-bottom:1px solid #F1F5F9;">
          <input type="checkbox" class="mach-standalone-op-cb" value="${op.empId || op.id}" ${isDeptMatch ? '' : ''} style="cursor:pointer; accent-color:var(--color-brand); width:15px; height:15px;">
          <span style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <strong>${op.name}</strong> ${deptTag} ${currMach}
          </span>
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

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${procs.length} procesos`;
    }

    if (filtered.length === 0) {
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
      cfgProcessesTable.innerHTML = filtered.map(p => {
        const dept = (UanifyState.stations || []).find(s => s.code === p.deptCode);
        const deptLabel = dept ? dept.name : (p.deptCode || 'Sin Departamento');

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
              <span style="font-family:var(--font-mono); font-size:13px; font-weight:700; color:var(--text-secondary);">${p.cycleTime || '35s'}</span>
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
      if (searchInp) searchInp.addEventListener('input', renderProcessesConfig);
      if (deptFilter) deptFilter.addEventListener('change', renderProcessesConfig);
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInp) searchInp.value = '';
          if (deptFilter) deptFilter.value = 'all';
          renderProcessesConfig();
        });
      }
      window.resetProcFilters = () => {
        if (searchInp) searchInp.value = '';
        if (deptFilter) deptFilter.value = 'all';
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
    const cycleEl = document.getElementById('procViewerCycle');
    const machListEl = document.getElementById('procViewerMachinesList');
    const countBadge = document.getElementById('procViewerMachCountBadge');
    const selectNewMach = document.getElementById('procViewerNewMachineSelect');

    if (titleEl) titleEl.textContent = proc.name;
    if (deptEl) deptEl.textContent = dept ? dept.name : (proc.deptCode || 'General');
    if (cycleEl) cycleEl.textContent = proc.cycleTime || '35s';

    // Obtener todas las máquinas registradas en el sistema
    let allSystemMachines = [];
    (UanifyState.processes || []).forEach(p => {
      (p.machines || []).forEach(m => {
        if (m && m.name && !allSystemMachines.some(x => x.name.toLowerCase() === m.name.toLowerCase())) {
          allSystemMachines.push({ ...m });
        }
      });
    });

    // Agregar también las máquinas que estén en las estaciones si no están ya
    (UanifyState.stations || []).forEach(st => {
      if (st.machines) {
        const rawList = st.machines.split(/[,;]/).map(m => m.trim().replace(/^[A-Z0-9\-]+\s+/i, '')).filter(Boolean);
        rawList.forEach(mName => {
          if (!allSystemMachines.some(x => x.name.toLowerCase() === mName.toLowerCase())) {
            allSystemMachines.push({ id: `M-${allSystemMachines.length+1}`, name: mName, type: 'maquinaria', status: 'operativa' });
          }
        });
      }
    });

    const currentMachines = proc.machines || [];

    // Poblar selector de máquinas disponibles (QUE NO ESTÉN ASIGNADAS A ESTE PROCESO)
    if (selectNewMach) {
      selectNewMach.innerHTML = '<option value="">Seleccionar máquina disponible...</option>';
      const availableToAdd = allSystemMachines.filter(m => 
        !currentMachines.some(cm => cm.name.toLowerCase() === m.name.toLowerCase())
      );

      if (availableToAdd.length === 0) {
        selectNewMach.innerHTML = '<option value="">No hay más máquinas disponibles en catálogo</option>';
        selectNewMach.disabled = true;
      } else {
        selectNewMach.disabled = false;
        availableToAdd.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.name;
          opt.textContent = `🏭 ${m.name}`;
          selectNewMach.appendChild(opt);
        });
      }
    }

    if (countBadge) {
      countBadge.textContent = `${currentMachines.length} máquina(s) vinculada(s)`;
    }

    // Renderizar máquinas vinculadas con operador asignado y botón de desvincular
    if (machListEl) {
      if (currentMachines.length === 0) {
        machListEl.innerHTML = `
          <div style="text-align:center; padding:24px 16px; background:#F8FAFC; border:1px dashed var(--border-subtle); border-radius:10px;">
            <p style="margin:0; font-size:13px; color:var(--text-muted); font-style:italic;">No hay máquinas asignadas a este proceso actualmente.</p>
            <p style="margin:4px 0 0 0; font-size:11.5px; color:var(--text-secondary);">Selecciona una máquina arriba para vincularla a este proceso.</p>
          </div>
        `;
      } else {
        machListEl.innerHTML = currentMachines.map((m, idx) => {
          const cleanM = (m.name || '').replace(/^[A-Z0-9\-]+\s+/i, '');
          // Buscar operadores de esta máquina
          const assignedOps = (UanifyState.operators || []).filter(op => {
            return (op.machine && op.machine.toLowerCase().includes(cleanM.toLowerCase())) ||
                   (Array.isArray(m.operatorIds) && (m.operatorIds.includes(op.empId) || m.operatorIds.includes(op.id)));
          });

          const opsHtml = assignedOps.length > 0
            ? assignedOps.map(op => `<span style="display:inline-flex; align-items:center; gap:4px; font-size:11.5px; background:#EFF6FF; color:#1E40AF; padding:3px 8px; border-radius:6px; font-weight:600;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${op.name}</span>`).join(' ')
            : `<span style="font-size:11.5px; color:var(--text-muted); font-style:italic;">Sin operador asignado</span>`;

          return `
            <div style="background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:10px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="chip-clean chip-clean-machine" style="font-size:12.5px; padding:5px 12px; font-weight:700;">
                  🏭 ${cleanM}
                </span>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--text-muted);">Operador:</span>
                  ${opsHtml}
                </div>
              </div>
              <div>
                <button type="button" class="btn-table-action btn-action-delete" onclick="window.unassignMachineFromProc('${encodeURIComponent(m.name)}')" title="Desvincular máquina de este proceso" style="min-width:32px; min-height:32px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    modal.classList.add('active');
  }

  // Desvincular máquina de un proceso
  window.unassignMachineFromProc = function(encodedMachName) {
    const machName = decodeURIComponent(encodedMachName);
    if (!activeProcessViewingId || !UanifyState.processes) return;

    const proc = UanifyState.processes.find(p => p.id === activeProcessViewingId || p.code === activeProcessViewingId);
    if (!proc || !proc.machines) return;

    proc.machines = proc.machines.filter(m => m.name.toLowerCase() !== machName.toLowerCase());

    if (window.UanifyUI && typeof window.UanifyUI.toast === 'function') {
      window.UanifyUI.toast(`Máquina "${machName}" desvinculada del proceso`, 'success');
    }

    openProcessDetailViewer(activeProcessViewingId);
    renderProcessesConfig();
    if (typeof renderDepartmentsConfig === 'function') renderDepartmentsConfig();
  };

  // Asignar máquina a un proceso
  const btnAssign = document.getElementById('btnAssignMachineToProc');
  if (btnAssign) {
    btnAssign.addEventListener('click', () => {
      const select = document.getElementById('procViewerNewMachineSelect');
      if (!select || !select.value) {
        if (window.UanifyUI && typeof window.UanifyUI.toast === 'function') {
          window.UanifyUI.toast('Por favor selecciona una máquina para vincular', 'warning');
        }
        return;
      }

      const machName = select.value;
      if (!activeProcessViewingId || !UanifyState.processes) return;

      const proc = UanifyState.processes.find(p => p.id === activeProcessViewingId || p.code === activeProcessViewingId);
      if (!proc) return;

      if (!Array.isArray(proc.machines)) proc.machines = [];
      if (proc.machines.some(m => m.name.toLowerCase() === machName.toLowerCase())) {
        if (window.UanifyUI && typeof window.UanifyUI.toast === 'function') {
          window.UanifyUI.toast('Esta máquina ya está asignada a este proceso', 'warning');
        }
        return;
      }

      proc.machines.push({
        id: `M-${Date.now().toString().slice(-4)}`,
        name: machName,
        type: 'maquinaria',
        status: 'operativa'
      });

      if (window.UanifyUI && typeof window.UanifyUI.toast === 'function') {
        window.UanifyUI.toast(`Máquina "${machName}" vinculada exitosamente al proceso`, 'success');
      }

      openProcessDetailViewer(activeProcessViewingId);
      renderProcessesConfig();
      if (typeof renderDepartmentsConfig === 'function') renderDepartmentsConfig();
    });
  }

  window.openProcessDetailViewer = openProcessDetailViewer;

  // ── CATÁLOGO DEDICADO 2: ALMACENES INTERMEDIOS BUFFER ────────────────────
  const cfgWarehousesTable = document.getElementById('cfgWarehousesTable');
  let whFiltersBound = false;

  function renderWarehousesConfig() {
    if (!cfgWarehousesTable) return;
    const stations = UanifyState.stations || [];
    const searchInp = document.getElementById('whSearchInput');
    const deptFilter = document.getElementById('whDeptFilter');
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
          location: st.warehouseLocation || 'Nave Central - Pasillo de Traspaso',
          capacity: st.wipCapacity || 180,
          currentWip: st.wipWaiting || Math.floor((st.wipCapacity || 180) * 0.35)
        });
      });
    });

    // Poblar selector de departamentos
    if (deptFilter && deptFilter.options.length <= 1) {
      deptFilter.innerHTML = '<option value="all">Todos los Departamentos</option>' +
        stations.map(st => `<option value="${st.code}">${st.code} · ${st.name}</option>`).join('');
    }

    const q = searchInp ? searchInp.value.toLowerCase().trim() : '';
    const selectedDept = deptFilter ? deptFilter.value : 'all';

    const filtered = warehousesList.filter(w => {
      const matchSearch = !q ||
        w.name.toLowerCase().includes(q) ||
        w.location.toLowerCase().includes(q) ||
        w.deptName.toLowerCase().includes(q) ||
        w.deptCode.toLowerCase().includes(q);

      const matchDept = selectedDept === 'all' || w.deptCode === selectedDept;

      return matchSearch && matchDept;
    });

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${warehousesList.length} almacenes buffer`;
    }

    if (filtered.length === 0) {
      cfgWarehousesTable.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="6">
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
      cfgWarehousesTable.innerHTML = filtered.map(w => {
        const fillPct = Math.min(100, Math.round((w.currentWip / w.capacity) * 100));
        const fillPill = fillPct > 85
          ? `<span class="status-pill status-danger" style="font-size:11.5px; font-weight:700;">${w.currentWip} pzas (${fillPct}%)</span>`
          : fillPct > 60
          ? `<span class="status-pill status-warning" style="font-size:11.5px; font-weight:700;">${w.currentWip} pzas (${fillPct}%)</span>`
          : `<span class="status-pill status-active" style="font-size:11.5px; font-weight:700;">${w.currentWip} pzas (${fillPct}%)</span>`;

        return `
          <tr>
            <td class="col-name">
              <div class="table-cell-primary" style="font-size:14px; font-weight:700;">📦 ${w.name}</div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">Tipo: <strong>Buffer de Traspaso / Salida</strong></div>
            </td>
            <td>
              <span class="chip-clean" style="font-size:12px; font-weight:600; color:var(--color-brand); background:rgba(139,94,60,0.08); border:1px solid rgba(139,94,60,0.2);">
                🏢 ${w.deptCode} · ${w.deptName}
              </span>
            </td>
            <td>
              <span style="font-size:12.5px; color:var(--text-secondary);">📍 ${w.location}</span>
            </td>
            <td style="text-align:center;">
              <span style="font-family:var(--font-mono); font-size:13px; font-weight:700; color:var(--text-primary);">${w.capacity} pzas</span>
            </td>
            <td style="text-align:center;">${fillPill}</td>
            <td class="col-actions" style="text-align:center;">
              <button class="btn-icon" title="Ver estructura de departamento" onclick="window.openDeptDetailViewer('${w.deptCode}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!whFiltersBound) {
      if (searchInp) searchInp.addEventListener('input', renderWarehousesConfig);
      if (deptFilter) deptFilter.addEventListener('change', renderWarehousesConfig);
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInp) searchInp.value = '';
          if (deptFilter) deptFilter.value = 'all';
          renderWarehousesConfig();
        });
      }
      window.resetWhFilters = () => {
        if (searchInp) searchInp.value = '';
        if (deptFilter) deptFilter.value = 'all';
        renderWarehousesConfig();
      };
      whFiltersBound = true;
    }
  }

  // ── CATÁLOGO DEDICADO 3: MAQUINARIA & EQUIPOS DE TRABAJO ──────────────────
  const cfgMachinesTable = document.getElementById('cfgMachinesTable');
  let machFiltersBound = false;

  function renderMachinesConfig() {
    if (!cfgMachinesTable) return;
    const procs = UanifyState.processes || [];
    const searchInp = document.getElementById('machSearchInput');
    const deptFilter = document.getElementById('machDeptFilter');
    const statusFilter = document.getElementById('machStatusFilter');
    const countBadge = document.getElementById('machFilteredCountBadge');
    const btnReset = document.getElementById('btnResetMachFilters');

    // Consolidar lista de todas las máquinas vinculadas a procesos y departamentos
    let machinesList = [];
    procs.forEach(p => {
      const dept = (UanifyState.stations || []).find(s => s.code === p.deptCode);
      (p.machines || []).forEach(m => {
        // Buscar operadores asignados a esta máquina
        const assignedOps = (UanifyState.operators || []).filter(o => 
          o.machine && o.machine.toLowerCase().includes(m.name.toLowerCase())
        );

        machinesList.push({
          id: m.id || `M-${machinesList.length+1}`,
          name: m.name,
          procId: p.id,
          procName: p.name,
          deptCode: p.deptCode,
          deptName: dept ? dept.name : p.deptCode,
          status: m.status || 'operativa',
          operators: assignedOps
        });
      });
    });

    // Poblar selector de departamentos
    if (deptFilter && deptFilter.options.length <= 1 && UanifyState.stations) {
      deptFilter.innerHTML = '<option value="all">Todos los Departamentos</option>' +
        UanifyState.stations.map(st => `<option value="${st.code}">${st.code} · ${st.name}</option>`).join('');
    }

    const q = searchInp ? searchInp.value.toLowerCase().trim() : '';
    const selectedDept = deptFilter ? deptFilter.value : 'all';
    const selectedStatus = statusFilter ? statusFilter.value : 'all';

    const filtered = machinesList.filter(m => {
      const matchSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.procName.toLowerCase().includes(q) ||
        m.deptName.toLowerCase().includes(q) ||
        m.deptCode.toLowerCase().includes(q) ||
        m.operators.some(o => o.name.toLowerCase().includes(q));

      const matchDept = selectedDept === 'all' || m.deptCode === selectedDept;
      const matchStatus = selectedStatus === 'all' || m.status === selectedStatus;

      return matchSearch && matchDept && matchStatus;
    });

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${machinesList.length} máquinas`;
    }

    if (filtered.length === 0) {
      cfgMachinesTable.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="6">
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
      cfgMachinesTable.innerHTML = filtered.map(m => {
        const isOp = m.status === 'operativa';
        const statusBadge = isOp
          ? '<span class="status-pill status-active" style="font-size:11.5px;">✓ Operativa</span>'
          : '<span class="status-pill status-warning" style="font-size:11.5px;">🛠 Mantenimiento</span>';

        let opsHtml = '';
        if (m.operators.length > 0) {
          opsHtml = m.operators.map(o => `<span class="chip-clean" style="font-size:11.5px; background:#F1F5F9;" title="No. Nómina: ${o.empId}">👤 ${o.name}</span>`).join(' ');
        } else {
          opsHtml = '<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Sin operador asignado</span>';
        }

        return `
          <tr>
            <td class="col-name">
              <div class="table-cell-primary" style="font-size:14px; font-weight:700;">🏭 ${m.name}</div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">Identificador: <strong>${m.id}</strong></div>
            </td>
            <td>
              <span style="font-size:13px; font-weight:600; color:var(--text-primary);">⚙️ ${m.procName}</span>
            </td>
            <td>
              <span class="chip-clean" style="font-size:12px; font-weight:600; color:var(--color-brand); background:rgba(139,94,60,0.08); border:1px solid rgba(139,94,60,0.2);">
                🏢 ${m.deptCode} · ${m.deptName}
              </span>
            </td>
            <td style="text-align:center;">${statusBadge}</td>
            <td>
              <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
                ${opsHtml}
              </div>
            </td>
            <td class="col-actions" style="text-align:center;">
              <button class="btn-icon" title="Ver estructura de departamento" onclick="window.openDeptDetailViewer('${m.deptCode}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (!machFiltersBound) {
      if (searchInp) searchInp.addEventListener('input', renderMachinesConfig);
      if (deptFilter) deptFilter.addEventListener('change', renderMachinesConfig);
      if (statusFilter) statusFilter.addEventListener('change', renderMachinesConfig);
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInp) searchInp.value = '';
          if (deptFilter) deptFilter.value = 'all';
          if (statusFilter) statusFilter.value = 'all';
          renderMachinesConfig();
        });
      }
      window.resetMachFilters = () => {
        if (searchInp) searchInp.value = '';
        if (deptFilter) deptFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        renderMachinesConfig();
      };
      machFiltersBound = true;
    }
  }

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
  function renderQualityFiltersConfig() {
    if (!cfgQualityTable) return;
    const areas = UanifyState.qualityAreas || [];

    const searchInput = document.getElementById('qualitySearchInput');
    const inspectorFilter = document.getElementById('qualityInspectorFilter');
    const countBadge = document.getElementById('qualityFilteredCountBadge');
    const btnReset = document.getElementById('btnResetQualityFilters');

    // Poblar selector de inspectores si está vacío
    if (inspectorFilter && inspectorFilter.options.length <= 1) {
      const inspectors = [...new Set(areas.map(a => a.inspector).filter(Boolean))];
      inspectors.forEach(insp => {
        const opt = document.createElement('option');
        opt.value = insp;
        opt.textContent = ` ${insp}`;
        inspectorFilter.appendChild(opt);
      });
    }

    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const insp = inspectorFilter ? inspectorFilter.value : 'all';

    const filtered = areas.filter(item => {
      const matchSearch = !q ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.criteria && item.criteria.toLowerCase().includes(q)) ||
        (item.tolerances && item.tolerances.toLowerCase().includes(q)) ||
        (item.inspector && item.inspector.toLowerCase().includes(q));

      const matchInsp = insp === 'all' || item.inspector === insp;

      return matchSearch && matchInsp;
    });

    if (countBadge) {
      countBadge.textContent = `Mostrando ${filtered.length} de ${areas.length} filtros de calidad`;
    }

    if (filtered.length === 0) {
      cfgQualityTable.innerHTML = `
        <tr class="table-empty-row">
          <td colspan="3">
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

    cfgQualityTable.innerHTML = filtered.map(q => {
      const dept = (UanifyState.stations || []).find(s => s.code === q.deptCode || s.id === q.deptCode);
      const deptName = dept ? dept.name : (q.deptCode ? `Depto ${q.deptCode}` : 'Sin Depto asignado');
      return `
        <tr>
          <td class="col-name">
            <div class="table-cell-primary" style="font-size:14px; font-weight:700;">${q.name}</div>
            <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">Código: <strong>${q.code}</strong></div>
          </td>
          <td>
            <div style="font-size:13px; font-weight:600; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-brand);"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3"/></svg>
              <span>${deptName}</span>
            </div>
          </td>
          <td>
            <div style="font-size:13px; font-weight:600; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-brand);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${q.inspector || '<span style="color:var(--text-muted); font-style:italic;">Sin inspector asignado</span>'}
            </div>
          </td>
          <td class="col-actions" style="text-align:center;">
            ${canManage ? `
              <div class="action-btns-cell" style="justify-content:center;">
                <button type="button" class="btn-table-action btn-action-edit" onclick="window.openEditQualityModal('${q.code}')" title="Editar Filtro de Calidad">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button type="button" class="btn-table-action btn-action-delete" onclick="window.deleteQualityFilter('${q.code}')" title="Eliminar Filtro de Calidad">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (inspectorFilter) inspectorFilter.value = 'all';
          renderQualityFiltersConfig();
        });
      }
      window.resetQualityFilters = function() {
        if (searchInput) searchInput.value = '';
        if (inspectorFilter) inspectorFilter.value = 'all';
        renderQualityFiltersConfig();
      };
    }
  }

  function populateQualityDeptSelect(selectedDeptCode = '') {
    const deptEl = document.getElementById('newQualityDept');
    if (!deptEl || !UanifyState.stations) return;
    deptEl.innerHTML = `
      <option value="">-- Seleccionar Departamento Responsable --</option>
      ${UanifyState.stations.map(st => `
        <option value="${st.code || st.id}" ${st.code === selectedDeptCode ? 'selected' : ''}>
          ${st.name}
        </option>
      `).join('')}
    `;
  }

  function populateQualityInspectorsSelect(selectedInspector = '') {
    const inspectorEl = document.getElementById('newQualityInspector');
    if (!inspectorEl) return;

    // Obtener inspectores y usuarios disponibles
    const users = UanifyState.users || [];
    // Priorizar usuarios con rol calidad o inspectores, e incluir supervisores e ingenieros
    let eligible = users.filter(u => u.role === 'calidad' || (u.roleName && u.roleName.toLowerCase().includes('inspector')));
    if (eligible.length === 0) {
      eligible = users.filter(u => u.role === 'calidad' || u.role === 'supervisor' || u.role === 'ingeniero' || u.role === 'admin');
    }

    inspectorEl.innerHTML = `
      <option value="">-- Seleccionar Inspector Responsable --</option>
      ${users.map(u => `
        <option value="${u.name}" ${u.name === selectedInspector ? 'selected' : ''}>
          ${u.name} (${u.roleName || u.role})
        </option>
      `).join('')}
    `;
    if (selectedInspector) {
      inspectorEl.value = selectedInspector;
    } else {
      inspectorEl.value = '';
    }
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
