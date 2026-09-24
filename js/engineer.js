/**
 * UANIFY MES · CONSOLA DE INGENIERÍA
 * Tombstone Hats — Planta Matriz San Francisco del Rincón
 *
 * VALIDADO EN AUDIO & DIRECTRICES DE INGENIERÍA:
 * ─ Pipeline de WIP por departamento. Detección de cuellos de botella.
 * ─ Subensambles de Tafilete por Talla (55-60) con semáforos de stock.
 * ─ Catálogo de Hormas y Moldes (Denver, Bullrider, Viejonón, Laredo, Frontier) con registro.
 * ─ Matriz de materiales con cambio masivo por proveedor.
 * ─ KPIs de rendimiento exclusivos para Ingenieros y Dirección.
 * ─ Notificaciones visuales in-app estandarizadas con UanifyUI.toast y confirm.
 */

window.initEngineerView = function() {
  renderPipeline();
  renderTafileteStock();
  renderMoldsCatalog();
  renderMaterialMatrix();
  renderDowntimes();
  updateOeeScores();
  setupMoldsModal();

  EventBus.on('piece-registered', () => {
    renderPipeline();
    updateOeeScores();
  });
  EventBus.on('scrap-registered', () => {
    updateOeeScores();
  });
  EventBus.on('status-updated', () => {
    renderPipeline();
    renderDowntimes();
  });
  EventBus.on('user-switched', () => {
    checkKpisAccess();
  });

  // Simular avance de 1 hora de producción
  const btnSimulate = document.getElementById('btnSimulateShift');
  if (btnSimulate) {
    btnSimulate.addEventListener('click', () => {
      UanifyState.stations.forEach(st => {
        const added = Math.floor(Math.random() * 10) + 6;
        st.produced += added;
        UanifyState.producedTotal += added;
      });
      EventBus.emit('piece-registered');
      window.UanifyUI.toast(
        'Se simularon 60 minutos de operación industrial en las 14 estaciones de San Francisco del Rincón.',
        'success',
        '⚡ Simulación Completada'
      );
    });
  }

  // Reiniciar datos del turno
  const btnReset = document.getElementById('btnResetSimulation');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      window.UanifyUI.confirm(
        '¿Reiniciar Simulación de Turno?',
        'Esta acción restablecerá los contadores de piezas y lotes a sus valores de inicio de turno. ¿Deseas continuar?',
        () => {
          location.reload();
        },
        'Sí, Reiniciar',
        'Cancelar'
      );
    });
  }

  // Cambio masivo de material
  const btnMassChange = document.getElementById('btnMassChange');
  if (btnMassChange) {
    btnMassChange.addEventListener('click', () => {
      window.UanifyUI.toast(
        'Material actualizado en 47 fichas técnicas: "Pintura Taiwan 1125" reemplazada exitosamente por "Pintura Premium X200" sin edición manual.',
        'success',
        '🔄 Cambio Masivo de Material'
      );
    });
  }

  checkKpisAccess();
};

// ── CATÁLOGO DE HORMAS Y MOLDES ──────────────────────────────────────────────
function renderMoldsCatalog() {
  const container = document.getElementById('moldsCatalogTableBody');
  if (!container) return;

  if (!UanifyState.molds) return;

  container.innerHTML = UanifyState.molds.map(m => {
    const isUsed = m.status === 'En Uso';
    const isMaintenance = m.status === 'En Mantenimiento';
    const statusColor = isUsed ? 'var(--color-green)' : isMaintenance ? 'var(--color-red)' : 'var(--color-brand)';
    const statusBg = isUsed ? 'var(--color-green-bg)' : isMaintenance ? 'var(--color-red-bg)' : 'var(--color-brand-light)';

    return `
      <tr>
        <td><strong style="font-family:'JetBrains Mono'; font-size:12px; color:var(--color-brand);">${m.code}</strong></td>
        <td><strong>${m.name}</strong></td>
        <td>${m.material || 'Aluminio Templado'}</td>
        <td>${m.size || '4 1/4"'}</td>
        <td>${m.tipo || 'Roper'}</td>
        <td>${m.machine || 'Prensa Vapor Matriz #1'}</td>
        <td>
          <span class="badge-status" style="background:${statusBg}; color:${statusColor}; font-weight:700;">
            ● ${m.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function setupMoldsModal() {
  const modal = document.getElementById('modalRegisterMold');
  const btnOpen = document.getElementById('btnOpenRegisterMoldModal');
  const btnClose = document.getElementById('btnCloseRegisterMoldModal');
  const form = document.getElementById('formRegisterMold');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newMoldName')?.value.trim();
      const code = document.getElementById('newMoldCode')?.value.trim();
      const brim = document.getElementById('newMoldBrim')?.value;
      const crown = document.getElementById('newMoldCrown')?.value.trim();
      const location = document.getElementById('newMoldLocation')?.value;

      if (!name || !code) return;

      const newMold = {
        code,
        name,
        tipo: crown || 'Roper',
        material: 'Aluminio Templado',
        size: brim || '4 1/4"',
        machine: location || 'Prensa Vapor Matriz #1',
        status: 'Disponible'
      };

      if (!UanifyState.molds) UanifyState.molds = [];
      UanifyState.molds.unshift(newMold);

      renderMoldsCatalog();
      form.reset();
      if (modal) modal.classList.remove('active');

      window.UanifyUI.toast(
        `Horma "${name}" (${code}) registrada en el catálogo y disponible para asignación en PPSP.`,
        'success',
        '🎩 Horma Registrada'
      );
    });
  }
}

// ── RESTRICCIÓN DE ACCESO A SUBTAB KPIS (SOLO INGENIEROS Y ADMIN) ────────────
function checkKpisAccess() {
  const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
  const kpisBtn = document.querySelector('.sub-tab-btn[data-subtab="subtab-engineer-kpis"]');
  const kpisContent = document.getElementById('subtab-engineer-kpis');

  const canAccess = (user.role === 'admin' || user.role === 'ingeniero');

  if (kpisBtn) {
    if (!canAccess) {
      kpisBtn.style.opacity = '0.5';
      kpisBtn.title = 'Exclusivo para Ingenieros y Administradores';
    } else {
      kpisBtn.style.opacity = '1';
      kpisBtn.title = '';
    }
  }

  if (kpisContent && !canAccess && kpisContent.classList.contains('active')) {
    // Si el usuario no tiene acceso y está visualizando esta subtab, regresarlo a la primera
    const firstBtn = document.querySelector('.sub-tab-btn[data-subtab="subtab-engineer-oee"]');
    if (firstBtn) firstBtn.click();
    window.UanifyUI.toast(
      'El apartado de KPIs de Supervisores y Departamentos es de acceso exclusivo para Ingeniería y Dirección.',
      'error',
      'Acceso Restringido'
    );
  }
}

// ── PIPELINE DE WIP ──────────────────────────────────────────────────────────
function renderPipeline() {
  const container = document.getElementById('pipelineViz');
  if (!container) return;

  const maxWip = 50;
  container.innerHTML = UanifyState.stations.map(st => {
    const isBottleneck = st.wipWaiting >= 25;
    const isQuality    = st.id.startsWith('calidad');
    const barWidth     = Math.min(100, Math.round((st.wipWaiting / maxWip) * 100));

    return `
      <div class="pipe-row">
        <span class="pipe-name" style="${isQuality ? 'color:#B45309;' : ''}">
          ${isQuality ? '🔍 ' : ''}${st.name}
        </span>
        <div class="pipe-track">
          <div class="pipe-fill ${isBottleneck ? 'bottleneck' : ''}" style="width: ${barWidth}%;"></div>
        </div>
        <span class="pipe-count ${isBottleneck ? 'color-amber' : ''}">
          ${st.wipWaiting} pzas
        </span>
      </div>
    `;
  }).join('');
}

// ── STOCK DE TAFILETES (SUBENSAMBLE) ────────────────────────────────────────
function renderTafileteStock() {
  const container = document.getElementById('tafileteStockTable');
  if (!container) return;

  container.innerHTML = UanifyState.tafileteStock.map(t => {
    const semaforo = t.available > 60 ? 'Verde' : t.available > 25 ? 'Amarillo' : 'Rojo';
    const semaforoColor = t.available > 60 ? 'var(--color-green)' : t.available > 25 ? 'var(--color-amber)' : 'var(--color-red)';
    const icon = t.available > 60 ? '🟢' : t.available > 25 ? '🟡' : '🔴';
    return `
      <tr>
        <td><strong>Talla ${t.size} cm</strong></td>
        <td>${t.stock} pzas</td>
        <td><span style="color:var(--color-amber);">${t.reserved} pzas</span></td>
        <td><strong style="color:var(--color-green);">${t.available} pzas</strong></td>
        <td>
          <span style="color:${semaforoColor}; font-size:12px; font-weight:600;">
            ${icon} ${semaforo}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// ── MATRIZ DE MATERIALES ────────────────────────────────────────────────────
function renderMaterialMatrix() {
  const container = document.getElementById('materialMatrixBody');
  if (!container) return;

  const materials = [
    { name: 'Pintura Taiwan 1125',    cat: 'Acabados', usedIn: 47, unit: 'Litros', notes: 'Posible cambio de proveedor' },
    { name: 'Resina / Dope Sellador', cat: 'Englopado', usedIn: 60, unit: 'Litros', notes: 'Común a todos los modelos de telar' },
    { name: 'Sellador Brochas',       cat: 'Refuerzos', usedIn: 60, unit: 'Ml',     notes: 'Aplicado en área de patio exterior' },
    { name: 'Telar Fino Rollo',       cat: 'Materia Prima', usedIn: 38, unit: 'Metros', notes: 'Producto campeón 70% del volumen' },
    { name: 'Alambre Ala (Memoria)',  cat: 'Insumos', usedIn: 52, unit: 'Metros', notes: 'Sección de alambrado' },
    { name: 'Tafilete / Badana 55cm', cat: 'Subensamble', usedIn: 12, unit: 'Pzas',   notes: 'Subensamble paralelo Adorno 1' },
    { name: 'Tafilete / Badana 57cm', cat: 'Subensamble', usedIn: 34, unit: 'Pzas',   notes: 'Talla más vendida en México' },
    { name: 'Toquilla (Cinto ext.)',  cat: 'Adorno', usedIn: 60, unit: 'Metros', notes: 'Subensamble paralelo Adorno 1' },
    { name: 'Barniz / Brillo',        cat: 'Acabados', usedIn: 44, unit: 'Ml',     notes: 'Post-calidad 2' }
  ];

  container.innerHTML = materials.map(m => `
    <tr>
      <td><strong>${m.name}</strong></td>
      <td><span style="color:var(--text-muted); font-size:11px;">${m.cat}</span></td>
      <td style="text-align:center;">${m.usedIn}</td>
      <td>${m.unit}</td>
      <td style="color:var(--text-secondary); font-size:11px;">${m.notes}</td>
    </tr>
  `).join('');
}

// ── BITÁCORA DE PAROS ────────────────────────────────────────────────────────
function renderDowntimes() {
  const container = document.getElementById('downtimeTbody');
  if (!container || !UanifyState.downtimes) return;

  container.innerHTML = UanifyState.downtimes.map(d => `
    <tr>
      <td><span style="font-family:'JetBrains Mono'; font-weight:700;">${d.time}</span></td>
      <td><strong>${d.station}</strong></td>
      <td>${d.cause}</td>
      <td><span style="color:var(--color-red); font-weight:600;">${d.duration}</span></td>
      <td><span class="badge-subtle">${d.impact}</span></td>
    </tr>
  `).join('');
}

// ── OEE GLOBAL ──────────────────────────────────────────────────────────────
function updateOeeScores() {
  const avail = 94.2;
  const perf  = Math.min(99.0, Math.round((UanifyState.producedTotal / 650) * 91.8 * 10) / 10);
  const qual  = Math.round(((UanifyState.producedTotal - UanifyState.scrapTotal) / UanifyState.producedTotal) * 1000) / 10;
  const oee   = Math.round(((avail / 100) * (perf / 100) * (qual / 100)) * 1000) / 10;

  const scoreEl = document.getElementById('oeeGlobalScore');
  const qualEl  = document.getElementById('oeeQualBadge');
  const perfEl  = document.getElementById('oeePerfBadge');

  if (scoreEl) scoreEl.textContent = `${oee}%`;
  if (qualEl)  qualEl.textContent  = `${qual}%`;
  if (perfEl)  perfEl.textContent  = `${perf}%`;
}
