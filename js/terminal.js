/**
 * UANIFY MES · TERMINAL DE PLANTA & ESCÁNER DE TARJETA VIAJERA (iPAD / WEB)
 *
 * REGLAS DE NEGOCIO INDUSTRIALES (Tombstone Hats · San Francisco del Rincón):
 * ─ Tarjetas viajeras impresas en Ingeniería. Lotes fraccionados de 60 a 15 piezas.
 * ─ Cámara web en vivo integrada mediante getUserMedia para escanear en cualquier dispositivo web.
 * ─ Supervisores operan exclusivamente en los departamentos asignados a su perfil.
 * ─ Ingeniería y Admin pueden auditar y operar en cualquier departamento.
 * ─ Flujo departamental: Operador procesa lote en Máquina X → deposita en Almacén de Salida →
 *   Recolector del siguiente departamento recoge sombreros y los lleva a su estación.
 * ─ Alertas visuales estandarizadas con UanifyUI.toast (prohibido alert nativo).
 */

window.initTerminalView = function() {
  const terminalProduced = document.getElementById('terminalProduced');
  const terminalScrap    = document.getElementById('terminalScrap');
  const terminalSecond   = document.getElementById('terminalSecondGrade');
  const modelSelect      = document.getElementById('tombstoneModelSelect');
  const modelSkuEl       = document.getElementById('terminalModelSku');

  const btnScanQr        = document.getElementById('btnScanQr');
  const manualQrInput    = document.getElementById('manualQrInput');
  const btnSubdivideLot  = document.getElementById('btnSubdivideLot');
  const sublotsContainer = document.getElementById('sublotsContainer');
  const sublotsCountBadge= document.getElementById('sublotsCountBadge');

  // Elementos de Cámara Web
  const videoFeed          = document.getElementById('qrCameraVideo');
  const btnToggleCamera    = document.getElementById('btnToggleCamera');
  const btnFlipCamera      = document.getElementById('btnFlipCamera');
  const cameraPlaceholder  = document.getElementById('cameraPlaceholderMsg');
  const cameraReticle      = document.getElementById('cameraReticleOverlay');
  const cameraStatusBadge  = document.getElementById('cameraStatusBadge');
  let mediaStream          = null;
  let currentFacingMode    = 'environment';

  // Elementos de Operación en Máquina & Almacén
  const workflowDeptSelect     = document.getElementById('workflowDeptSelect');
  const workflowMachineSelect  = document.getElementById('workflowMachineSelect');
  const workflowOperatorSelect = document.getElementById('workflowOperatorSelect');
  const btnCompleteMachineRun  = document.getElementById('btnCompleteMachineRun');
  const supervisorDeptsBadge   = document.getElementById('supervisorDeptsBadge');
  const terminalSupervisorBanner = document.getElementById('terminalSupervisorBanner');

  // Elementos de Recolección y Traspaso
  const transferOriginDept    = document.getElementById('transferOriginDept');
  const transferDestDept      = document.getElementById('transferDestDept');
  const transferCollectorName = document.getElementById('transferCollectorName');
  const transferQtyInput      = document.getElementById('transferQtyInput');
  const btnExecuteTransfer    = document.getElementById('btnExecuteTransfer');
  const transferPiecesWaiting = document.getElementById('transferPiecesWaiting');

  // ── 1. GESTIÓN DE CÁMARA WEB EN VIVO (CUALQUIER DISPOSITIVO CON NAVEGADOR) ──
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      window.UanifyUI.toast(
        'El navegador no soporta acceso directo a la cámara. Puedes utilizar el ingreso manual por teclado o pistola USB.',
        'warning',
        'Cámara no soportada'
      );
      return;
    }

    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }

      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoFeed) {
        videoFeed.srcObject = mediaStream;
        await videoFeed.play();
      }

      if (cameraPlaceholder) cameraPlaceholder.style.display = 'none';
      if (cameraReticle)     cameraReticle.style.display = 'flex';
      if (btnToggleCamera)   btnToggleCamera.textContent = '⏹️ Apagar Cámara Web';
      if (btnFlipCamera)     btnFlipCamera.style.display = 'inline-flex';
      if (cameraStatusBadge) {
        cameraStatusBadge.textContent = '🟢 Cámara en vivo activa';
        cameraStatusBadge.style.background = '#ECFDF5';
        cameraStatusBadge.style.color = '#047857';
      }

      window.UanifyUI.toast('Visor de cámara iniciado en vivo. Apunta al código QR de la tarjeta viajera.', 'success', 'Cámara Activa');
    } catch (err) {
      console.warn('Error al iniciar cámara:', err);
      if (cameraStatusBadge) {
        cameraStatusBadge.textContent = '⚠️ Sin acceso a cámara';
        cameraStatusBadge.style.background = '#FEF2F2';
        cameraStatusBadge.style.color = '#B91C1C';
      }
      window.UanifyUI.toast(
        'No se pudo acceder a la cámara del dispositivo (permiso no otorgado o sin cámara disponible). Usa el campo manual abajo para ingresar el código.',
        'warning',
        'Acceso a Cámara'
      );
    }
  }

  function stopCamera() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    if (videoFeed) videoFeed.srcObject = null;
    if (cameraPlaceholder) cameraPlaceholder.style.display = 'flex';
    if (cameraReticle)     cameraReticle.style.display = 'none';
    if (btnToggleCamera)   btnToggleCamera.textContent = '▶️ Activar Cámara Web';
    if (btnFlipCamera)     btnFlipCamera.style.display = 'none';
    if (cameraStatusBadge) {
      cameraStatusBadge.textContent = 'Cámara inactiva';
      cameraStatusBadge.style.background = '#F1F5F9';
      cameraStatusBadge.style.color = '#64748B';
    }
  }

  if (btnToggleCamera) {
    btnToggleCamera.addEventListener('click', () => {
      if (mediaStream) {
        stopCamera();
      } else {
        startCamera();
      }
    });
  }

  if (btnFlipCamera) {
    btnFlipCamera.addEventListener('click', () => {
      currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
      startCamera();
    });
  }

  // ── 2. SELECTOR DE MODELOS TOMBSTONE ──
  if (modelSelect) {
    modelSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      UanifyState.selectedModelIndex = idx;
      const model = UanifyState.activeModels[idx];
      if (model && modelSkuEl) {
        modelSkuEl.textContent =
          `SKU: ${model.sku} | Talla: ${model.size} | Horma: ${model.crownHorma} | ${model.tipo} | ${model.material}`;
      }
    });
  }

  // Flash visual en visor del escáner
  function flashScannerVisual(success = true) {
    const vf = document.getElementById('cameraScannerWrapper');
    if (vf) {
      vf.style.outline = success ? '4px solid var(--color-green)' : '4px solid var(--color-red)';
      setTimeout(() => {
        vf.style.outline = 'none';
      }, 400);
    }
  }

  // ── 3. ESCANEAR TARJETA VIAJERA ──
  if (btnScanQr) {
    btnScanQr.addEventListener('click', () => {
      const query = (manualQrInput ? manualQrInput.value.trim() : '') || '1094-01';
      flashScannerVisual(true);

      const lot = UanifyState.activeLots[0];
      window.UanifyUI.toast(
        `Sublote ${query} | Lote Madre: ${lot.lotId} (60 pzas) | Horma: ${lot.horma} | Talla: ${lot.size} | Estación actual: ${lot.currentStation}`,
        'success',
        '🏷️ Tarjeta Viajera Validada'
      );
    });
  }

  // ── 4. FRACCIONAR LOTE EN RAMPA (60 → 15 pzas) ──
  if (btnSubdivideLot) {
    btnSubdivideLot.addEventListener('click', () => {
      flashScannerVisual(true);
      const lot = UanifyState.activeLots[0];
      lot.isSubdivided = true;
      renderSublots();
      EventBus.emit('lot-subdivided', lot);
      window.UanifyUI.toast(
        `Lote ${lot.lotId} fraccionado en 4 tarjetas de 15 piezas cada una (1094-01 al 1094-04). Listas para distribuirse a prensas y mesas.`,
        'success',
        '✂️ Fraccionamiento en Rampa'
      );
    });
  }

  function renderSublots() {
    if (!sublotsContainer) return;
    const lot = UanifyState.activeLots[0];
    if (!lot.isSubdivided) {
      sublotsContainer.innerHTML = `
        <div style="font-size:12px; color:var(--text-muted); padding:10px; background:var(--bg-core); border-radius:8px; border:1px solid var(--border-subtle);">
          Lote <strong style="color:var(--color-brand);">${lot.lotId}</strong> en proceso de 60 pzas.
          Presiona <strong>"Fraccionar Lote Madre"</strong> para dividirlo en tarjetas viajeras de 15 pzas.
        </div>`;
      if (sublotsCountBadge) sublotsCountBadge.textContent = 'Madre (60 pzas)';
      return;
    }

    if (sublotsCountBadge) sublotsCountBadge.textContent = `${lot.sublots.length} activos (15 pzas c/u)`;

    sublotsContainer.innerHTML = lot.sublots.map(sl => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#FFFFFF; border:1px solid var(--border-subtle); padding:10px 12px; border-radius:8px; margin-bottom:6px; box-shadow:var(--shadow-sm);">
        <div>
          <strong style="color:var(--color-brand); font-family:'JetBrains Mono'; font-size:12.5px;">${sl.id}</strong>
          <span style="font-size:11.5px; color:var(--text-primary); margin-left:6px; font-weight:600;">${sl.pieces} pzas</span>
          <small style="display:block; font-size:10.5px; color:var(--text-muted); margin-top:2px;">
            Estación: ${sl.station} | Op: ${sl.operator || 'Sin asignar'}
          </small>
          <small style="display:block; font-size:10px; font-weight:700; color:${sl.status === 'En Proceso' ? 'var(--color-green)' : 'var(--color-amber)'}; margin-top:2px;">
            ● ${sl.status}
          </small>
        </div>
        <button class="btn-secondary" style="padding:6px 10px; font-size:11.5px;"
          onclick="darAvanceSublote('${sl.id}')">
          📤 Dar Avance
        </button>
      </div>
    `).join('');
  }
  renderSublots();

  window.darAvanceSublote = function(sublotId) {
    flashScannerVisual(true);
    const lot = UanifyState.activeLots[0];
    const sl  = lot.sublots.find(s => s.id === sublotId);
    if (sl) {
      sl.station = 'Almacén Intermedio de Salida';
      sl.status  = 'Listo en Almacén';
      renderSublots();
      EventBus.emit('piece-registered');
      window.UanifyUI.toast(
        `Sublote ${sublotId} (15 pzas) colocado en Almacén Intermedio de Salida para recolección del siguiente departamento.`,
        'success',
        'Depósito en Almacén'
      );
    }
  };

  // ── 5. ASIGNACIÓN DE DEPARTAMENTOS POR ROL Y SUPERVISOR ──
  function syncDepartmentScope() {
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    if (terminalSupervisorBanner) {
      terminalSupervisorBanner.textContent = `Usuario Activo: ${user.name} (${user.roleName})`;
    }

    // Filtrar departamentos según asignación del usuario
    let allowedStations = UanifyState.stations;
    if (user.role === 'supervisor') {
      allowedStations = UanifyState.stations.filter(st => {
        return user.assignedDepartments && user.assignedDepartments.includes(st.code);
      });
      if (supervisorDeptsBadge) {
        supervisorDeptsBadge.textContent = `Mis Depts Asignados: ${user.assignedDepartments.join(', ')}`;
      }
    } else {
      if (supervisorDeptsBadge) {
        supervisorDeptsBadge.textContent = `Acceso Global: Todos los Depts (D-01 a D-14)`;
      }
    }

    // Llenar selector de departamento en subtab de máquina
    if (workflowDeptSelect) {
      workflowDeptSelect.innerHTML = allowedStations.map(st => `
        <option value="${st.code}">${st.code} · ${st.name}</option>
      `).join('');
      populateMachinesAndOperators();
    }

    // Llenar selectores de transferencia departamental
    if (transferOriginDept) {
      transferOriginDept.innerHTML = UanifyState.stations.map(st => `
        <option value="${st.code}">${st.code} · ${st.name}</option>
      `).join('');
    }
    if (transferDestDept) {
      transferDestDept.innerHTML = UanifyState.stations.slice(1).map(st => `
        <option value="${st.code}">${st.code} · ${st.name}</option>
      `).join('');
    }
  }

  function populateMachinesAndOperators() {
    if (!workflowDeptSelect) return;
    const deptCode = workflowDeptSelect.value;
    const st = UanifyState.stations.find(s => s.code === deptCode);

    // Máquinas
    if (workflowMachineSelect) {
      workflowMachineSelect.innerHTML = `
        <option value="M-01">${st ? st.name : 'Estación'} - Máquina Principal 01</option>
        <option value="M-02">${st ? st.name : 'Estación'} - Máquina Principal 02</option>
        <option value="M-03">${st ? st.name : 'Estación'} - Mesa de Soporte 03</option>
      `;
    }

    // Operadores registrados en este departamento
    if (workflowOperatorSelect) {
      const deptOps = UanifyState.operators.filter(op => op.deptCode === deptCode);
      if (deptOps.length > 0) {
        workflowOperatorSelect.innerHTML = deptOps.map(op => `
          <option value="${op.empId}">${op.empId} · ${op.name} (${op.machine})</option>
        `).join('');
      } else {
        workflowOperatorSelect.innerHTML = `
          <option value="OP-GENERIC">${st ? st.operator : 'Operador de Turno Único'}</option>
        `;
      }
    }
  }

  if (workflowDeptSelect) {
    workflowDeptSelect.addEventListener('change', populateMachinesAndOperators);
  }

  // ── 6. FINALIZAR PIEZAS EN MÁQUINA Y DEPOSITAR EN ALMACÉN INTERMEDIO ──
  if (btnCompleteMachineRun) {
    btnCompleteMachineRun.addEventListener('click', () => {
      const deptCode = workflowDeptSelect ? workflowDeptSelect.value : 'D-05';
      const st = UanifyState.stations.find(s => s.code === deptCode) || UanifyState.stations[4];
      const opText = workflowOperatorSelect ? workflowOperatorSelect.selectedOptions[0]?.text : 'Operador';
      const machineText = workflowMachineSelect ? workflowMachineSelect.selectedOptions[0]?.text : 'Máquina';

      // Incrementar producción
      st.produced += 15;
      UanifyState.producedTotal += 15;
      if (terminalProduced) terminalProduced.textContent = `${st.produced} pzas`;

      const andonTotalEl = document.getElementById('andonProducedTotal');
      if (andonTotalEl) andonTotalEl.textContent = `${UanifyState.producedTotal} pzas`;

      flashScannerVisual(true);
      EventBus.emit('piece-registered', { station: st, total: UanifyState.producedTotal });

      window.UanifyUI.toast(
        `Sublote 1094-01 (15 pzas) procesado en ${machineText} por ${opText}. Depositado en Almacén Intermedio de Salida de ${st.name}.`,
        'success',
        '⚙️ Trabajo en Máquina Concluido'
      );
    });
  }

  // ── 7. RECOLECCIÓN Y TRASPASO AL SIGUIENTE DEPARTAMENTO ──
  if (btnExecuteTransfer) {
    btnExecuteTransfer.addEventListener('click', () => {
      const originCode = transferOriginDept ? transferOriginDept.value : 'D-05';
      const destCode   = transferDestDept ? transferDestDept.value : 'D-06';
      const collector  = (transferCollectorName ? transferCollectorName.value.trim() : '') || 'Recolector de Turno';
      const qty        = transferQtyInput ? parseInt(transferQtyInput.value, 10) : 15;

      const originSt = UanifyState.stations.find(s => s.code === originCode) || { name: originCode };
      const destSt   = UanifyState.stations.find(s => s.code === destCode) || { name: destCode };

      flashScannerVisual(true);
      window.UanifyUI.toast(
        `Se recolectaron ${qty} sombreros del Almacén de ${originSt.name} y se trasladaron al Almacén de ${destSt.name}. Responsable de traslado: ${collector}.`,
        'success',
        '🚚 Recolección y Traspaso Confirmado'
      );
    });
  }

  // ── 8. MODALES DE SCRAP Y PAROS ──
  const modalScrap     = document.getElementById('modalScrap');
  const btnReportScrap = document.getElementById('btnReportScrap');
  const btnCloseScrap  = document.getElementById('btnCloseScrapModal');
  const modalStop      = document.getElementById('modalStop');
  const btnReportStop  = document.getElementById('btnReportStop');
  const btnCloseStop   = document.getElementById('btnCloseStopModal');

  if (btnReportScrap && modalScrap) btnReportScrap.addEventListener('click', () => modalScrap.classList.add('active'));
  if (btnCloseScrap  && modalScrap) btnCloseScrap.addEventListener('click',  () => modalScrap.classList.remove('active'));
  if (btnReportStop  && modalStop)  btnReportStop.addEventListener('click',  () => modalStop.classList.add('active'));
  if (btnCloseStop   && modalStop)  btnCloseStop.addEventListener('click',   () => modalStop.classList.remove('active'));

  // Registro de Merma o Segunda
  document.querySelectorAll('.scrap-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const reason    = btn.getAttribute('data-reason');
      const isSeconda = btn.getAttribute('data-type') === 'segunda';
      flashScannerVisual(false);

      const deptCode = workflowDeptSelect ? workflowDeptSelect.value : 'D-05';
      const station  = UanifyState.stations.find(s => s.code === deptCode) || UanifyState.stations[4];

      if (isSeconda) {
        UanifyState.secondGradeTotal++;
        if (terminalSecond) terminalSecond.textContent = `${UanifyState.secondGradeTotal} pzas`;
        window.UanifyUI.toast(
          `Pieza regular con detalle ("${reason}") enviada al almacén de saldo para la venta de viernes. Total semanal: ${UanifyState.secondGradeTotal} pzas.`,
          'warning',
          '📦 Segunda / Saldo Registrado'
        );
      } else {
        station.scrap++;
        UanifyState.scrapTotal++;
        if (terminalScrap) terminalScrap.textContent = `${station.scrap} pzas`;
        window.UanifyUI.toast(
          `Merma irrecuperable por "${reason}" en ${station.name}. Se sustituyó con pieza de respaldo para mantener el lote completo de 60 pzas.`,
          'error',
          '⚠️ Merma Registrada'
        );
      }

      if (modalScrap) modalScrap.classList.remove('active');
      EventBus.emit('scrap-registered', { station, reason });
    });
  });

  // Registro de Paro
  document.querySelectorAll('.stop-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stopReason = btn.getAttribute('data-stop');
      flashScannerVisual(false);

      const deptCode = workflowDeptSelect ? workflowDeptSelect.value : 'D-05';
      const station  = UanifyState.stations.find(s => s.code === deptCode) || UanifyState.stations[4];
      station.status = 'stopped';

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      UanifyState.downtimes.unshift({
        time: timeStr,
        station: station.name,
        cause: stopReason,
        duration: 'En curso...',
        impact: 'Calculando'
      });

      if (modalStop) modalStop.classList.remove('active');
      EventBus.emit('status-updated');

      window.UanifyUI.toast(
        `Paro en ${station.name} por motivo: "${stopReason}". El semáforo Andon se iluminó en ROJO para intervención del supervisor.`,
        'error',
        '🛑 Paro de Línea Reportado'
      );
    });
  });

  // Reaccionar cuando se cambie de usuario en el sidebar
  EventBus.on('user-switched', () => {
    syncDepartmentScope();
  });

  syncDepartmentScope();
};
