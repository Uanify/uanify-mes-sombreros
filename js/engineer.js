/**
 * UANIFY MES · CONSOLA DE INGENIERÍA
 * Tombstone Hats — Planta Matriz San Francisco del Rincón
 *
 * VALIDADO EN AUDIO:
 * ─ Pipeline de WIP por departamento. Cuello de botella real: Prensas de Vapor.
 * ─ Subensambles de Tafilete por Talla (55-60). Coordinación actual: verbal/a gritos.
 * ─ Hormas: Roper, Chaparral, Viejón, Laredo, Frontier — identificadas por color.
 * ─ Meta semanal dividida por día. Ingeniería genera e imprime las tarjetas viajeras.
 * ─ Catálogo de materiales con cambio masivo (ej. Pintura Taiwan 1125 → nuevo proveedor).
 * ─ Operador asignado a máquina por supervisor. Futura planeación (PPSP) con hormas.
 * ─ Calidad: 4 puntos fijos. Rechazo → regresa al dpto. con error.
 * ─ Destajo/rendimiento por operador: Fase 2/3 futura (actualmente sueldos fijos).
 * ─ Accesorios (carteras, cintos, mariconeras, bolsitas, horquillas): fichas técnicas + costeo.
 */

window.initEngineerView = function() {
  renderPipeline();
  renderTafileteStock();
  renderHormasInventory();
  renderMaterialMatrix();
  updateOeeScores();

  EventBus.on('piece-registered', () => {
    renderPipeline();
    updateOeeScores();
  });
  EventBus.on('scrap-registered', () => {
    updateOeeScores();
  });
  EventBus.on('status-updated', () => {
    renderPipeline();
  });

  // Simular avance de 1 hora en todos los departamentos
  const btnSimulate = document.getElementById('btnSimulateShift');
  if (btnSimulate) {
    btnSimulate.addEventListener('click', () => {
      UanifyState.stations.forEach(st => {
        const added = Math.floor(Math.random() * 10) + 6;
        st.produced += added;
        UanifyState.producedTotal += added;
      });
      const currentH = UanifyState.hourlyData.find(h => h.produced < h.target);
      if (currentH) currentH.produced += Math.floor(Math.random() * 20) + 40;
      EventBus.emit('piece-registered');
      alert('⚡ Simulación: Se procesó 1 hora de producción en todos los departamentos de Tombstone.');
    });
  }

  const btnReset = document.getElementById('btnResetSimulation');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('¿Reiniciar métricas del Turno Único de demostración?')) location.reload();
    });
  }

  // Botón de cambio masivo de material
  const btnMassChange = document.getElementById('btnMassChange');
  if (btnMassChange) {
    btnMassChange.addEventListener('click', () => {
      alert(
        '🔄 CAMBIO MASIVO DE MATERIAL\n\n' +
        'Material anterior: Pintura Taiwan 1125 (Proveedor A)\n' +
        'Material nuevo:    Pintura Premium X200 (Proveedor B)\n\n' +
        'Afecta a: 47 fichas técnicas que usaban Taiwan 1125.\n' +
        'Actualización completada en 1 clic. Sin necesidad de editar ficha por ficha.\n\n' +
        '✅ Cambio masivo aplicado en la Matriz de Materiales.'
      );
    });
  }
};

// ── PIPELINE DE WIP ──────────────────────────────────────────────────────────
// Visualiza la acumulación en almacenes intermedios de cada departamento.
// El cuello de botella real (Prensas) tiene wipWaiting >= 30.
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
        <span class="pipe-name" style="${isQuality ? 'color:#FACC15;' : ''}">
          ${isQuality ? '✅ ' : ''}${st.name}
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
// Audio Carlos: "¿tienes de esta talla? Sí, tengo 150." → supervisoras se comunican a gritos.
// Uanify proporciona visibilidad en tiempo real por talla 55-60 cm.
function renderTafileteStock() {
  const container = document.getElementById('tafileteStockTable');
  if (!container) return;

  container.innerHTML = UanifyState.tafileteStock.map(t => {
    const semaforo = t.available > 60 ? 'Verde' : t.available > 25 ? 'Amarillo' : 'Rojo';
    const semaforoColor = t.available > 60 ? '#22c55e' : t.available > 25 ? '#F59E0B' : '#EF4444';
    const icon = t.available > 60 ? '🟢' : t.available > 25 ? '🟡' : '🔴';
    return `
      <tr>
        <td><strong>Talla ${t.size} cm</strong></td>
        <td>${t.stock} pzas</td>
        <td><span style="color:#F59E0B;">${t.reserved} pzas</span></td>
        <td><strong style="color:#00E676;">${t.available} pzas</strong></td>
        <td>
          <span style="color:${semaforoColor}; font-size:12px; font-weight:600;">
            ${icon} ${semaforo}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// ── INVENTARIO DE HORMAS / MOLDES ─────────────────────────────────────────
// Audio: "tienen sus nombres: Chaparral, Roper, Viejón, van cambiando la forma del sombrero."
// Plan: vincularlas a máquinas en el módulo de planeación (PPSP) del sistema.
function renderHormasInventory() {
  const container = document.getElementById('hormasInventoryTable');
  if (!container) return;

  if (!UanifyState.hormas) return;

  container.innerHTML = UanifyState.hormas.map(h => {
    const statusColor = h.status === 'En uso' ? '#22c55e' :
                        h.status === 'En espera' ? '#F59E0B' :
                        h.status === 'En mantenimiento' ? '#EF4444' : '#64748B';
    return `
      <tr>
        <td><strong style="color:#00E5FF;">${h.name}</strong></td>
        <td><span style="background:${h.color}; color:#000; padding:2px 8px; border-radius:4px; font-size:11px;">${h.color}</span></td>
        <td>${h.prensa}</td>
        <td><span style="color:${statusColor}; font-size:12px; font-weight:600;">● ${h.status}</span></td>
      </tr>
    `;
  }).join('');
}

// ── MATRIZ DE MATERIALES ────────────────────────────────────────────────────
// Audio Carlos: "pintura Taiwan 1125 → voy a cambiar de proveedor → cambio masivo en mi matriz
//   de materiales → no ficha por ficha"
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
      <td><span style="color:#94A3B8; font-size:11px;">${m.cat}</span></td>
      <td style="text-align:center;">${m.usedIn}</td>
      <td>${m.unit}</td>
      <td style="color:#64748B; font-size:11px;">${m.notes}</td>
    </tr>
  `).join('');
}

// ── OEE ─────────────────────────────────────────────────────────────────────
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
