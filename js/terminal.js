/**
 * UANIFY MES · TERMINAL DE PLANTA & ESCÁNER DE TARJETA VIAJERA
 *
 * REGLAS DE NEGOCIO INDUSTRIALES (Tombstone Hats · San Francisco del Rincón):
 * ─ Extracción integral de metadatos desde código QR (Cero captura manual de modelo/talla).
 * ─ Verificación previa obligatoria de la tarjeta física contra el código QR antes de mover o registrar.
 * ─ Supervisores operan exclusivamente en los departamentos asignados a su perfil (RBAC estricto).
 * ─ El sistema calcula automáticamente la estación de destino según la ruta configurada del sombrero.
 * ─ Las piezas con merma viajan físicamente con el lote hasta el punto de segregación en control de calidad.
 * ─ Almacenes intermedios departamentales auditables mediante modal de piso.
 * ─ Escáner QR heroico con soporte de pantalla completa para tabletas industriales.
 */

window.initTerminalView = function() {
  const terminalProduced = document.getElementById('terminalProduced');
  const terminalScrap    = document.getElementById('terminalScrap');
  const terminalSecond   = document.getElementById('terminalSecondGrade');

  // Elementos de Escáner y Cámara
  const cameraWrapper      = document.getElementById('cameraScannerWrapper');
  const videoFeed          = document.getElementById('qrCameraVideo');
  const btnToggleCamera    = document.getElementById('btnToggleCamera');
  const btnToggleFullscreen= document.getElementById('btnToggleFullscreen');
  const btnExitFullscreen  = document.getElementById('btnExitFullscreenScanner');
  const btnFlipCamera      = document.getElementById('btnFlipCamera');
  const fsTopBar           = document.getElementById('fsTopBar');
  const cameraPlaceholder  = document.getElementById('cameraPlaceholderMsg');
  const cameraReticle      = document.getElementById('cameraReticleOverlay');
  const cameraStatusBadge  = document.getElementById('cameraStatusBadge');
  const manualQrInput      = document.getElementById('manualQrInput');
  const btnScanQr          = document.getElementById('btnScanQr');

  // Botones de Simulación Rápida
  const btnSimSublot3      = document.getElementById('btnSimulateScanSublot3');
  const btnSimMotherLot    = document.getElementById('btnSimulateScanMotherLot');
  const btnSimScrapLot     = document.getElementById('btnSimulateScanScrapLot');

  // Trigger de Tarjeta Viajera Oficial (Mica de Piso)
  const btnOpenTravelerModal = document.getElementById('btnOpenTravelerModal');
  const bttActiveLotPill     = document.getElementById('bttActiveLotPill');

  // Ficha de Lote Activo Escaneado
  const activeLotBadgeStatus   = document.getElementById('activeLotBadgeStatus');
  const activeSublotTypeBadge  = document.getElementById('activeSublotTypeBadge');
  const activeLotOProdText     = document.getElementById('activeLotOProdText');
  const lotOriginStationText   = document.getElementById('lotOriginStationText');
  const lotCurrentStationText  = document.getElementById('lotCurrentStationText');
  const lotTargetStationText   = document.getElementById('lotTargetStationText');
  const lotMetaModel           = document.getElementById('lotMetaModel');
  const lotMetaSpecs           = document.getElementById('lotMetaSpecs');
  const lotMetaOperator        = document.getElementById('lotMetaOperator');
  const lotMetaPieces          = document.getElementById('lotMetaPieces');
  const lotScrapBannerContainer= document.getElementById('lotScrapBannerContainer');
  const btnDepositToNextBuffer = document.getElementById('btnDepositToNextBuffer');

  // Acciones Rápidas
  const btnSubdivideLot  = document.getElementById('btnSubdivideLot');
  const btnReportScrap   = document.getElementById('btnReportScrap');
  const btnReportStop    = document.getElementById('btnReportStop');

  // Modal de Verificación de Tarjeta Escaneada
  const modalVerifyScannedCard    = document.getElementById('modalVerifyScannedCard');
  const btnCloseVerifyCardModal   = document.getElementById('btnCloseVerifyCardModal');
  const btnRejectScannedCard      = document.getElementById('btnRejectScannedCard');
  const btnConfirmScannedCard     = document.getElementById('btnConfirmScannedCard');
  const verifyCardReplicaContainer= document.getElementById('verifyCardReplicaContainer');
  const verifyLotId               = document.getElementById('verifyLotId');
  const verifySublot              = document.getElementById('verifySublot');
  const verifyModel               = document.getElementById('verifyModel');
  const verifySpecs               = document.getElementById('verifySpecs');
  const verifyOProd               = document.getElementById('verifyOProd');
  const verifyOperator            = document.getElementById('verifyOperator');
  const verifyOriginStation       = document.getElementById('verifyOriginStation');
  const verifyTargetStation       = document.getElementById('verifyTargetStation');
  const verifyScrapStatus         = document.getElementById('verifyScrapStatus');

  // Modal de Visor de Tarjeta Viajera Oficial
  const modalTravelerCardViewer   = document.getElementById('modalTravelerCardViewer');
  const btnCloseTravelerCardModal = document.getElementById('btnCloseTravelerCardModal');
  const btnDismissTravelerModal   = document.getElementById('btnDismissTravelerCardModal');
  const travelerCardModalContent  = document.getElementById('travelerCardModalContent');
  const btnModalViewHatSpec       = document.getElementById('btnModalViewHatSpec');

  // Modal de Almacén Intermedio de Departamento
  const modalDeptWarehouse        = document.getElementById('modalDeptWarehouse');
  const btnCloseDeptWarehouseModal= document.getElementById('btnCloseDeptWarehouseModal');
  const btnDismissDeptWarehouseModal= document.getElementById('btnDismissDeptWarehouseModal');
  const deptWarehouseModalTitle   = document.getElementById('deptWarehouseModalTitle');
  const deptWarehouseModalSub     = document.getElementById('deptWarehouseModalSub');
  const deptWarehouseTableBody    = document.getElementById('deptWarehouseTableBody');
  const warehouseFilterModel      = document.getElementById('warehouseFilterModel');
  const warehouseFilterType       = document.getElementById('warehouseFilterType');
  const warehouseFilterStatus     = document.getElementById('warehouseFilterStatus');

  // Mapa de Planta de Departamentos
  const plantDepartmentsGrid      = document.getElementById('plantDepartmentsGrid');
  const btnFilterPlantAll         = document.getElementById('btnFilterPlantAllDepts');
  const btnFilterPlantMyDepts     = document.getElementById('btnFilterPlantMyDepts');
  let currentPlantMapFilter       = 'all';
  let currentInspectedWarehouseDept = 'D-05';

  // Modal de Ficha Técnica
  const hatSpecModal              = document.getElementById('hatSpecModal');
  const btnCloseHatSpecModal      = document.getElementById('btnCloseHatSpecModal');
  const btnOkHatSpecModal         = document.getElementById('btnOkHatSpecModal');

  // Estado Local de la Terminal
  let mediaStream = null;
  let currentFacingMode = 'environment';
  let activeScannedLot = UanifyState.activeLots[0] || null;
  let candidateScannedLot = null;

  // ── 1. GESTIÓN DE CÁMARA WEB & PANTALLA COMPLETA ───────────────────────────
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      window.UanifyUI.toast(
        'El navegador no soporta acceso directo a la cámara. Puedes utilizar la pistola USB o el ingreso manual.',
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
        'No se pudo acceder a la cámara del dispositivo. Usa el campo manual o pistola USB para leer la tarjeta.',
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

  function enterFullscreenScanner() {
    if (cameraWrapper) {
      cameraWrapper.classList.add('is-fullscreen');
      if (fsTopBar) fsTopBar.style.display = 'flex';
      if (!mediaStream) startCamera();
    }
  }

  function exitFullscreenScanner() {
    if (cameraWrapper) {
      cameraWrapper.classList.remove('is-fullscreen');
      if (fsTopBar) fsTopBar.style.display = 'none';
    }
  }

  if (btnToggleFullscreen) btnToggleFullscreen.addEventListener('click', enterFullscreenScanner);
  if (btnExitFullscreen)   btnExitFullscreen.addEventListener('click', exitFullscreenScanner);

  // ── 2. GENERADOR DE RÉPLICA DE TARJETA VIAJERA (HTML OFICIAL) ─────────────
  function generateTravelerCardHtml(lotData) {
    if (!lotData) return '';
    const isSublot = typeof lotData.sublotNum === 'number' && lotData.sublotNum > 0;
    const stickerClass = lotData.stickerType === 'magenta' ? 'sticker-magenta' : 'sticker-blue';

    return `
      <div class="tombstone-traveler-sleeve">
        <div class="traveler-sleeve-header">
          <div class="traveler-string-indicator"></div>
          <div class="traveler-hole-punch"></div>
        </div>
        <div class="traveler-paper-tag">
          ${lotData.operatorSticker ? `<div class="traveler-operator-sticker ${stickerClass}">${lotData.operatorSticker}</div>` : ''}
          <div class="traveler-route-title">${lotData.route || 'TARJETA HIDRAULICAS - ADORNO'}</div>
          <div class="traveler-model-name">${lotData.model}</div>
          <div class="traveler-oprod-row">
            <span>O. PROD :</span>
            <span>${lotData.oProd}</span>
          </div>
          <div class="traveler-brand-divider">
            <div class="traveler-hat-logo">🤠 TOMBSTONE®</div>
            <div class="traveler-clase-tag">*** CLASE ***</div>
          </div>
          <div class="traveler-quality-title">${lotData.clase || '1,000X MASTER TELAR'}</div>
          <div class="traveler-finish-title">${lotData.finish || 'LAQUEADOS'}</div>
          <div class="traveler-specs-grid">
            <div class="traveler-spec-row">
              <span class="traveler-spec-label">FALDA</span>
              <span class="traveler-spec-val">${lotData.brim || '9 1/2'}</span>
            </div>
            <div class="traveler-spec-row">
              <span class="traveler-spec-label">DOBLADO</span>
              <span class="traveler-spec-val">${lotData.bend || 'ARRIBA'}</span>
            </div>
            <div class="traveler-spec-row">
              <span class="traveler-spec-label">TALLA</span>
              <span class="traveler-spec-val"># ${lotData.size}</span>
            </div>
          </div>
          <div class="traveler-qty-banner">
            ${lotData.pieces || 15} Pzas
          </div>
          <div class="traveler-footer-box">
            <div class="traveler-lote-box">
              LOTE: ${lotData.lotId}
            </div>
            <div class="traveler-sublot-badge-box ${!isSublot ? 'is-lote-madre' : ''}" title="${isSublot ? `Tarjeta de Sublote #${lotData.sublotNum}` : 'Tarjeta de Lote Madre (Sin número abajo a la derecha)'}">
              ${isSublot 
                ? `<span class="sublot-num">${lotData.sublotNum}</span><span class="sublot-label">SUBLOTE</span>` 
                : `<span style="font-size:8.5px; font-weight:800; text-align:center; color:#94A3B8; line-height:1.1;">LOTE<br>(VACÍO)</span>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── 3. PARSER Y EXTRACCIÓN INTEGRAL DE CÓDIGO QR ───────────────────────────
  function parseQrPayload(raw) {
    const text = String(raw || '').trim();
    if (!text) return null;

    // A) Formato Delimitado con Pipes (e.g. TB|49633|3|VIEJONON|9 1/2|55|15071|JORGE|D-05|D-06|OK)
    if (text.startsWith('TB|') || text.includes('|')) {
      const parts = text.split('|');
      const lotId = parts[1] || '49,633';
      const sublotNum = parseInt(parts[2], 10) || null;
      const model = parts[3] || 'VIEJONON';
      const brim = parts[4] || '9 1/2';
      const size = parts[5] || '55';
      const oProd = parts[6] || '15071';
      const operator = parts[7] || 'JORGE';
      const currentStationCode = parts[8] || 'D-05';
      const scrapFlag = parts[10] || '';
      const hasScrap = scrapFlag.toUpperCase().includes('SCRAP');
      const scrapReason = hasScrap ? (scrapFlag.split(':')[1] || 'Defecto marcado en inspección') : '';

      return matchOrCreateLot({
        lotId,
        sublotNum,
        model,
        brim,
        size,
        oProd,
        operator,
        currentStationCode,
        hasScrap,
        scrapReason
      });
    }

    // B) Formato JSON
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const obj = JSON.parse(text);
        return matchOrCreateLot(obj);
      } catch (e) {
        console.warn('Error parsing JSON QR:', e);
      }
    }

    // C) Formato Sublote Guion (e.g. 49633-3, 1094-01)
    if (text.includes('-')) {
      const parts = text.split('-');
      const baseClean = parts[0].replace(/[,.]/g, '');
      const sNum = parseInt(parts[1], 10);
      const matched = UanifyState.activeLots.find(l => l.lotId.replace(/[,.]/g, '') === baseClean);
      if (matched) {
        return matchOrCreateLot({
          ...matched,
          sublotNum: sNum,
          operatorSticker: matched.operatorSticker || 'JORGE'
        });
      }
    }

    // D) Formato Número de Lote Simple (e.g. 49633, 49386, 49842, 1094)
    const cleanNum = text.replace(/[,.]/g, '');
    const found = UanifyState.activeLots.find(l => l.lotId.replace(/[,.]/g, '') === cleanNum);
    if (found) {
      return matchOrCreateLot(found);
    }

    // Fallback: usar el primer lote activo
    return matchOrCreateLot(UanifyState.activeLots[0]);
  }

  function matchOrCreateLot(data) {
    const rawLotId = String(data.lotId || '49,633');
    const existing = UanifyState.activeLots.find(l => 
      l.lotId === rawLotId || l.lotId.replace(/,/g, '') === rawLotId.replace(/,/g, '')
    ) || UanifyState.activeLots[0];

    const route = UanifyState.getLotRoute(existing.lotId);
    let stepIndex = typeof existing.currentStepIndex === 'number' ? existing.currentStepIndex : 5;

    // Si data provee un código de estación específico
    if (data.currentStationCode && route && route.steps) {
      const idx = route.steps.findIndex(s => s.code === data.currentStationCode);
      if (idx !== -1) stepIndex = idx;
    }

    const currentStep = route.steps[stepIndex] || route.steps[0];
    const prevStep = stepIndex > 0 ? route.steps[stepIndex - 1] : { code: 'D-00', name: 'Almacén de Materia Prima' };
    const nextStep = stepIndex < route.steps.length - 1 ? route.steps[stepIndex + 1] : { code: 'D-11', name: 'Almacén de Producto Terminado' };

    const isSublot = typeof data.sublotNum === 'number' && data.sublotNum > 0;
    const pieces = isSublot ? 15 : (data.pieces || existing.pieces || 60);

    return {
      ...existing,
      ...data,
      lotId: existing.lotId,
      sublotNum: isSublot ? data.sublotNum : (data.sublotNum === null ? null : (existing.isSubdivided ? 3 : null)),
      model: data.model || existing.model,
      brim: data.brim || existing.brim,
      size: data.size || existing.size,
      bend: data.bend || existing.bend || 'ARRIBA',
      clase: data.clase || existing.clase || '1,000X MASTER TELAR',
      finish: data.finish || existing.finish || 'LAQUEADOS',
      oProd: data.oProd || existing.oProd,
      pieces: pieces,
      operator: data.operator || existing.operator,
      operatorSticker: data.operatorSticker || (isSublot ? (data.operator || 'JORGE') : null),
      currentStepIndex: stepIndex,
      currentStationCode: currentStep.code,
      currentStationName: currentStep.name,
      originStationCode: prevStep.code,
      originStationName: prevStep.name,
      targetStationCode: nextStep.code,
      targetStationName: nextStep.name,
      hasScrap: Boolean(data.hasScrap || existing.hasScrap),
      scrapReason: data.scrapReason || existing.scrapReason || (existing.hasScrap ? 'Quemado por prensa de vapor' : '')
    };
  }

  // ── 4. FLUJO DE VERIFICACIÓN PREVIA TRAS ESCANEO QR (RF-56) ───────────────
  function triggerScanEvaluation(query) {
    const lot = parseQrPayload(query);
    if (!lot) {
      window.UanifyUI.toast('No se pudo interpretar el código leído. Intenta de nuevo.', 'error', 'Error de Lectura QR');
      return;
    }

    candidateScannedLot = lot;

    // Llenar datos en el Modal de Verificación
    if (verifyCardReplicaContainer) {
      verifyCardReplicaContainer.innerHTML = generateTravelerCardHtml(lot);
    }
    if (verifyLotId) verifyLotId.textContent = lot.lotId;
    if (verifySublot) {
      verifySublot.textContent = lot.sublotNum ? `Sublote #${lot.sublotNum} (15 piezas)` : `Lote Completo Madre (${lot.pieces} piezas)`;
    }
    if (verifyModel) verifyModel.textContent = `${lot.clase} · ${lot.model}`;
    if (verifySpecs) verifySpecs.textContent = `Talla #${lot.size} | Falda ${lot.brim} | Doblado ${lot.bend}`;
    if (verifyOProd) verifyOProd.textContent = `#${lot.oProd}`;
    if (verifyOperator) verifyOperator.textContent = lot.operatorSticker || lot.operator || 'Sin Asignar';
    if (verifyOriginStation) verifyOriginStation.textContent = `${lot.originStationCode} ${lot.originStationName}`;
    if (verifyTargetStation) verifyTargetStation.textContent = `${lot.targetStationCode} ${lot.targetStationName}`;
    
    if (verifyScrapStatus) {
      if (lot.hasScrap) {
        verifyScrapStatus.innerHTML = `<span style="color:#B91C1C; font-weight:800;">⚠️ Contiene 1 Sombrero con Merma (${lot.scrapReason})</span>`;
      } else {
        verifyScrapStatus.innerHTML = `<span style="color:#15803D; font-weight:700;">✅ Sin Mermas (15 pzas íntegras)</span>`;
      }
    }

    // Salir de pantalla completa si estaba activa para mostrar modal
    exitFullscreenScanner();

    // Abrir modal de verificación
    if (modalVerifyScannedCard) {
      modalVerifyScannedCard.style.display = 'flex';
    }
  }

  // Eventos de Verificación de Tarjeta
  if (btnScanQr) {
    btnScanQr.addEventListener('click', () => {
      const q = manualQrInput ? manualQrInput.value.trim() : '';
      triggerScanEvaluation(q || '49633-3');
    });
  }

  if (manualQrInput) {
    manualQrInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerScanEvaluation(manualQrInput.value.trim());
      }
    });
  }

  // Botones de Simulación Rápida
  if (btnSimSublot3) {
    btnSimSublot3.addEventListener('click', () => {
      if (manualQrInput) manualQrInput.value = '49633-3';
      triggerScanEvaluation('TB|49633|3|VIEJONON|9 1/2|55|15071|JORGE|D-05|D-06|OK');
    });
  }

  if (btnSimMotherLot) {
    btnSimMotherLot.addEventListener('click', () => {
      if (manualQrInput) manualQrInput.value = '49386';
      triggerScanEvaluation('TB|49386|0|CHAPARRAL|9.0 Cm|56|15068|SIN_OPERADOR|D-04|D-05|OK');
    });
  }

  if (btnSimScrapLot) {
    btnSimScrapLot.addEventListener('click', () => {
      if (manualQrInput) manualQrInput.value = '49842';
      triggerScanEvaluation('TB|49842|0|MAGNUM|9 1/2|57|15075|MELANY|D-05|D-06|SCRAP:Quemado por prensa de vapor');
    });
  }

  // Cancelar Verificación
  const closeVerifyModal = () => {
    if (modalVerifyScannedCard) modalVerifyScannedCard.style.display = 'none';
    candidateScannedLot = null;
  };

  if (btnCloseVerifyCardModal) btnCloseVerifyCardModal.addEventListener('click', closeVerifyModal);
  if (btnRejectScannedCard) {
    btnRejectScannedCard.addEventListener('click', () => {
      closeVerifyModal();
      window.UanifyUI.toast(
        'Escaneo descartado sin aplicar cambios. Puedes escanear la tarjeta correcta.',
        'info',
        'Verificación Cancelada'
      );
    });
  }

  // Confirmar Coincidencia
  if (btnConfirmScannedCard) {
    btnConfirmScannedCard.addEventListener('click', () => {
      if (!candidateScannedLot) return;
      activeScannedLot = candidateScannedLot;
      closeVerifyModal();

      renderActiveScannedLotCard(activeScannedLot);

      window.UanifyUI.toast(
        `Tarjeta viajera verificada. Lote ${activeScannedLot.lotId}${activeScannedLot.sublotNum ? '-' + activeScannedLot.sublotNum : ''} cargado en la terminal. Siguiente paso: depositar en ${activeScannedLot.targetStationName}.`,
        'success',
        '✅ Tarjeta Confirmada'
      );
    });
  }

  // ── 5. RENDERIZADO DE LA FICHA DEL LOTE ACTIVO EN TERMINAL ─────────────────
  function renderActiveScannedLotCard(lot) {
    if (!lot) return;

    const folioDisplay = lot.sublotNum ? `${lot.motherLotId || lot.lotId.split('-')[0]}-${lot.sublotNum}` : lot.lotId;
    if (activeLotBadgeStatus) {
      activeLotBadgeStatus.textContent = `LOTE ACTIVO: ${folioDisplay}`;
    }
    if (activeSublotTypeBadge) {
      activeSublotTypeBadge.textContent = lot.sublotNum ? `Sublote #${lot.sublotNum} (15 pzas)` : `Lote Madre (${lot.pieces || 60} pzas)`;
    }
    if (bttActiveLotPill) {
      bttActiveLotPill.textContent = `Lote ${folioDisplay}`;
    }
    if (activeLotOProdText) {
      activeLotOProdText.textContent = `O. Prod: #${lot.oProd || lot.orderNumber || '15071'}`;
    }

    if (lotOriginStationText) {
      lotOriginStationText.textContent = `${lot.originStationCode || 'D-04'} ${lot.originStationName || 'Rampa de Ensamble'}`;
    }
    if (lotCurrentStationText) {
      lotCurrentStationText.textContent = `${lot.currentStationCode || 'D-04'} ${lot.currentStationName || 'Rampa de Ensamble'}`;
    }
    if (lotTargetStationText) {
      lotTargetStationText.textContent = `${lot.targetStationCode || 'D-05'} ${lot.targetStationName || 'Prensas de Hormado'}`;
    }

    const modelName = lot.model || lot.modelName || 'Chaparral';
    const claseName = lot.clase || '1000X Master Telar';
    if (lotMetaModel) lotMetaModel.textContent = `${claseName} · ${modelName}`;
    if (lotMetaSpecs) lotMetaSpecs.textContent = `Talla #${lot.size || '55'} | Falda ${lot.brim || '9 1/2 cm'} | ${lot.bend || 'Doblado Arriba'}`;
    if (lotMetaOperator) lotMetaOperator.textContent = lot.operatorSticker || lot.operator || 'Jorge (Prensas)';
    if (lotMetaPieces) lotMetaPieces.textContent = `${lot.pieces || 15} piezas`;

    if (btnDepositToNextBuffer) {
      btnDepositToNextBuffer.textContent = `📥 Depositar Lote en Almacén de ${lot.targetStationCode || 'D-05'} ${lot.targetStationName || 'Prensas de Hormado'}`;
    }

    if (lotScrapBannerContainer) {
      if (lot.hasScrap) {
        lotScrapBannerContainer.innerHTML = `
          <div class="lot-scrap-alert-banner">
            <span style="font-size:18px;">⚠️</span>
            <div>
              <strong>Contiene 1 sombrero marcado como merma (${lot.scrapReason || 'Defecto en proceso'}):</strong>
              <div style="font-size:11.5px; margin-top:2px; color:#7F1D1D;">
                La pieza defectuosa continúa físicamente en la torre de 15 sombreros y acompaña al lote hasta el punto de segregación y auditoría física final.
              </div>
            </div>
          </div>
        `;
      } else {
        lotScrapBannerContainer.innerHTML = `
          <div class="lot-clean-banner">
            <span style="font-size:16px;">✅</span>
            <span><strong>Lote íntegro:</strong> 15 sombreros conformados sin mermas registradas.</span>
          </div>
        `;
      }
    }

    // Botón Principal de Depósito
    if (btnDepositToNextBuffer) {
      btnDepositToNextBuffer.textContent = `📥 Depositar Lote en Almacén de ${lot.targetStationCode} ${lot.targetStationName}`;
    }
  }

  // ── 6. DEPÓSITO CON VALIDACIÓN DE PERMISOS DE SUPERVISOR (RF-57 & RF-58) ────
  if (btnDepositToNextBuffer) {
    btnDepositToNextBuffer.addEventListener('click', () => {
      if (!activeScannedLot) return;

      const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
      const isSuperUser = user.role === 'admin' || user.role === 'ingeniero' || 
                          (user.assignedDepartments && user.assignedDepartments.includes('*'));

      const currentStationCode = activeScannedLot.currentStationCode || 'D-05';

      // Validación de Restricción Departamental
      if (!isSuperUser && (!user.assignedDepartments || !user.assignedDepartments.includes(currentStationCode))) {
        window.UanifyUI.toast(
          `No tienes autorización para trasladar este lote. Se encuentra en ${activeScannedLot.currentStationName} (${currentStationCode}), pero tus departamentos asignados son: ${user.assignedDepartments.join(', ')}.`,
          'warning',
          '🔒 Restricción de Supervisor'
        );
        return;
      }

      // Proceder con el avance automático al siguiente almacén
      const res = UanifyState.advanceLot(activeScannedLot.lotId);
      if (res) {
        // Incrementar piezas procesadas
        const st = UanifyState.stations.find(s => s.code === currentStationCode);
        if (st) st.produced += (activeScannedLot.pieces || 15);
        UanifyState.producedTotal += (activeScannedLot.pieces || 15);
        if (terminalProduced) terminalProduced.textContent = `${UanifyState.producedTotal} pzas`;

        // Registrar en buffer del siguiente departamento
        const bufferItem = {
          id: 'buf-' + Date.now(),
          lotId: `${activeScannedLot.lotId}${activeScannedLot.sublotNum ? '-' + activeScannedLot.sublotNum : ''}`,
          pieces: activeScannedLot.pieces || 15,
          model: `${activeScannedLot.model} (${activeScannedLot.size})`,
          originDeptCode: currentStationCode,
          originDeptName: activeScannedLot.currentStationName,
          targetDeptCode: activeScannedLot.targetStationCode,
          targetDeptName: activeScannedLot.targetStationName,
          waitingMinutes: 1,
          notes: activeScannedLot.hasScrap ? `1 Sombrero con merma (${activeScannedLot.scrapReason})` : 'Lote íntegro listo para recolección'
        };

        if (!UanifyState.bufferReadyLots) UanifyState.bufferReadyLots = [];
        UanifyState.bufferReadyLots.unshift(bufferItem);

        // Actualizar datos del lote activo
        activeScannedLot = matchOrCreateLot({
          ...activeScannedLot,
          currentStationCode: activeScannedLot.targetStationCode
        });
        renderActiveScannedLotCard(activeScannedLot);

        // Refrescar mapa de planta y almacenes
        renderPlantDepartmentsGrid();

        window.UanifyUI.toast(
          `¡Lote ${activeScannedLot.lotId} depositado con éxito! Se encuentra listo en el almacén de entrada de "${activeScannedLot.currentStationName}". Movimiento registrado por ${user.name}.`,
          'success',
          '📥 Depósito en Almacén Concluido'
        );
      }
    });
  }

  // ── 7. MODAL DE VISUALIZACIÓN DE TARJETA VIAJERA OFICIAL ───────────────────
  if (btnOpenTravelerModal) {
    btnOpenTravelerModal.addEventListener('click', () => {
      if (!activeScannedLot) return;
      if (travelerCardModalContent) {
        travelerCardModalContent.innerHTML = generateTravelerCardHtml(activeScannedLot);
      }
      if (modalTravelerCardViewer) {
        modalTravelerCardViewer.style.display = 'flex';
      }
    });
  }

  const closeTravelerModal = () => {
    if (modalTravelerCardViewer) modalTravelerCardViewer.style.display = 'none';
  };

  if (btnCloseTravelerCardModal) btnCloseTravelerCardModal.addEventListener('click', closeTravelerModal);
  if (btnDismissTravelerModal)   btnDismissTravelerModal.addEventListener('click', closeTravelerModal);

  // Apertura de Ficha Técnica desde la Tarjeta
  if (btnModalViewHatSpec) {
    btnModalViewHatSpec.addEventListener('click', () => {
      closeTravelerModal();
      if (typeof window.openHatTechnicalSheet === 'function') {
        window.openHatTechnicalSheet('SOM-02');
      }
    });
  }

  // ── 8. MAPA GENERAL DE DEPARTAMENTOS & ALMACENES INTERMEDIOS (RF-59) ──────
  function renderPlantDepartmentsGrid() {
    if (!plantDepartmentsGrid) return;
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const myDepts = user.assignedDepartments || ['*'];
    const isSuperUser = myDepts.includes('*') || user.role === 'admin' || user.role === 'ingeniero';

    // Lista de estaciones de manufactura
    const stations = UanifyState.stations || [];

    const filtered = stations.filter(st => {
      if (currentPlantMapFilter === 'my-depts') {
        if (isSuperUser) return true;
        return myDepts.includes(st.code);
      }
      return true;
    });

    plantDepartmentsGrid.innerHTML = filtered.map(st => {
      const isAssigned = isSuperUser || myDepts.includes(st.code);
      
      // Contar lotes presentes en este departamento
      const lotCount = countLotsAtStation(st.code);
      const scrapWarningCount = countScrapLotsAtStation(st.code);

      return `
        <div class="dept-plant-card ${isAssigned ? 'is-assigned-to-me' : ''}">
          <div class="dept-card-header">
            <div>
              <span class="dept-code-tag">${st.icon || '🏭'} ${st.code}</span>
              <h4 class="dept-name-heading">${st.name}</h4>
            </div>
            ${isAssigned ? `<span class="dept-assigned-badge">⭐ Mi Depto</span>` : ''}
          </div>

          <div class="dept-card-stats">
            <div class="dept-card-stat-item">
              <span class="dept-card-stat-val">${lotCount.lots}</span>
              <span class="dept-card-stat-lbl">Lotes en Almacén</span>
            </div>
            <div class="dept-card-stat-item">
              <span class="dept-card-stat-val">${lotCount.pieces} pzas</span>
              <span class="dept-card-stat-lbl">En Proceso / Espera</span>
            </div>
          </div>

          ${scrapWarningCount > 0 ? `
            <div style="font-size:11px; color:#B91C1C; background:#FEF2F2; padding:4px 8px; border-radius:6px; margin-bottom:12px; font-weight:700;">
              ⚠️ ${scrapWarningCount} lote(s) con sombrero de merma en torre
            </div>
          ` : ''}

          <button type="button" class="btn-primary btn-touch-lg" style="width:100%;" onclick="window.openDeptWarehouseModal('${st.code}')">
            📦 Ver Almacén Intermedio
          </button>
        </div>
      `;
    }).join('');
  }

  function countLotsAtStation(code) {
    let lots = 0;
    let pieces = 0;

    // Lotes activos en este depto
    (UanifyState.activeLots || []).forEach(l => {
      if (l.currentStationCode === code || (code === 'D-05' && !l.currentStationCode)) {
        lots++;
        pieces += (l.pieces || 15);
      }
    });

    // Lotes en buffer esperando recolección
    (UanifyState.bufferReadyLots || []).forEach(b => {
      if (b.originDeptCode === code || b.targetDeptCode === code) {
        lots++;
        pieces += (b.pieces || 15);
      }
    });

    // Mínimo de muestra para realismo de planta
    if (lots === 0) {
      if (code === 'D-01' || code === 'D-02' || code === 'D-06') {
        lots = 2;
        pieces = 30;
      } else if (code === 'D-07' || code === 'D-10') {
        lots = 1;
        pieces = 15;
      }
    }

    return { lots, pieces };
  }

  function countScrapLotsAtStation(code) {
    let scrapLots = 0;
    (UanifyState.activeLots || []).forEach(l => {
      if ((l.currentStationCode === code || (code === 'D-05' && !l.currentStationCode)) && l.hasScrap) {
        scrapLots++;
      }
    });
    return scrapLots;
  }

  if (btnFilterPlantAll) {
    btnFilterPlantAll.addEventListener('click', () => {
      currentPlantMapFilter = 'all';
      btnFilterPlantAll.classList.add('active');
      if (btnFilterPlantMyDepts) btnFilterPlantMyDepts.classList.remove('active');
      renderPlantDepartmentsGrid();
    });
  }

  if (btnFilterPlantMyDepts) {
    btnFilterPlantMyDepts.addEventListener('click', () => {
      currentPlantMapFilter = 'my-depts';
      btnFilterPlantMyDepts.classList.add('active');
      if (btnFilterPlantAll) btnFilterPlantAll.classList.remove('active');
      renderPlantDepartmentsGrid();
    });
  }

  // ── 9. MODAL DE ALMACÉN INTERMEDIO POR DEPARTAMENTO ───────────────────────
  window.openDeptWarehouseModal = function(deptCode) {
    currentInspectedWarehouseDept = deptCode;
    const st = UanifyState.stations.find(s => s.code === deptCode) || { code: deptCode, name: 'Departamento' };

    if (deptWarehouseModalTitle) {
      deptWarehouseModalTitle.textContent = `📦 Almacén Intermedio · ${st.code} ${st.name}`;
    }
    if (deptWarehouseModalSub) {
      deptWarehouseModalSub.textContent = `Lotes y sublotes en proceso o en espera de recolección en este almacén.`;
    }

    renderDeptWarehouseTable();

    if (modalDeptWarehouse) modalDeptWarehouse.style.display = 'flex';
  };

  function renderDeptWarehouseTable() {
    if (!deptWarehouseTableBody) return;
    const modelFilter = warehouseFilterModel ? warehouseFilterModel.value : 'all';
    const typeFilter  = warehouseFilterType ? warehouseFilterType.value : 'all';
    const statusFilter= warehouseFilterStatus ? warehouseFilterStatus.value : 'all';

    // Obtener lotes para este departamento
    let lotsList = [];

    (UanifyState.activeLots || []).forEach(l => {
      if (l.currentStationCode === currentInspectedWarehouseDept || (currentInspectedWarehouseDept === 'D-05' && !l.currentStationCode)) {
        lotsList.push({
          folio: l.lotId,
          sublotNum: l.sublotNum || (l.isSubdivided ? 3 : null),
          model: l.model,
          clase: l.clase,
          pieces: l.pieces || 15,
          operator: l.operatorSticker || l.operator || 'Jorge',
          targetDept: l.targetStationName || 'Siguiente Estación',
          hasScrap: l.hasScrap,
          scrapReason: l.scrapReason
        });
      }
    });

    (UanifyState.bufferReadyLots || []).forEach(b => {
      if (b.originDeptCode === currentInspectedWarehouseDept || b.targetDeptCode === currentInspectedWarehouseDept) {
        lotsList.push({
          folio: b.lotId,
          sublotNum: b.lotId.includes('-') ? parseInt(b.lotId.split('-')[1], 10) : null,
          model: b.model,
          clase: '1000X MASTER TELAR',
          pieces: b.pieces,
          operator: 'Recolector',
          targetDept: b.targetDeptName,
          hasScrap: b.notes.includes('merma'),
          scrapReason: b.notes
        });
      }
    });

    // Si está vacío, agregar un par de lotes de muestra coherentes
    if (lotsList.length === 0) {
      lotsList.push({
        folio: '49,633-1',
        sublotNum: 1,
        model: 'VIEJONON',
        clase: '1,000X MASTER TELAR',
        pieces: 15,
        operator: 'Jorge',
        targetDept: 'D-06 Recorte',
        hasScrap: false
      });
      lotsList.push({
        folio: '49,386',
        sublotNum: null,
        model: 'CHAPARRAL',
        clase: '1,000X MASTER TELAR',
        pieces: 60,
        operator: 'Pedro Morales',
        targetDept: 'D-05 Prensas',
        hasScrap: false
      });
    }

    // Filtrar
    const filtered = lotsList.filter(item => {
      if (modelFilter !== 'all' && !item.model.toUpperCase().includes(modelFilter.toUpperCase())) {
        return false;
      }
      if (typeFilter === 'sublot' && !item.sublotNum) return false;
      if (typeFilter === 'mother' && item.sublotNum) return false;
      if (statusFilter === 'clean' && item.hasScrap) return false;
      if (statusFilter === 'scrap' && !item.hasScrap) return false;
      return true;
    });

    if (filtered.length === 0) {
      deptWarehouseTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">
            No hay lotes que coincidan con los filtros en este almacén.
          </td>
        </tr>
      `;
      return;
    }

    deptWarehouseTableBody.innerHTML = filtered.map(item => `
      <tr>
        <td>
          <strong style="font-family:'JetBrains Mono'; color:var(--color-brand);">${item.folio}</strong>
          ${item.sublotNum ? `<span class="badge-subtle" style="font-weight:700; margin-left:4px;">Sublote #${item.sublotNum}</span>` : '<span class="badge-subtle" style="margin-left:4px;">Lote Madre</span>'}
        </td>
        <td><strong>${item.model}</strong> (${item.clase})</td>
        <td><strong style="color:var(--text-primary);">${item.pieces} pzas</strong></td>
        <td>${item.operator}</td>
        <td>➔ ${item.targetDept}</td>
        <td>
          ${item.hasScrap 
            ? `<span style="color:#B91C1C; font-weight:800; font-size:11.5px;">⚠️ Sombrero Merma</span>` 
            : `<span style="color:#16A34A; font-weight:700; font-size:11.5px;">✅ Íntegro</span>`}
        </td>
        <td>
          <button type="button" class="btn-secondary btn-table-action" onclick="window.inspectSpecificLotCard('${item.folio}')">
            🏷️ Ver Tarjeta
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.inspectSpecificLotCard = function(lotId) {
    if (modalDeptWarehouse) modalDeptWarehouse.style.display = 'none';
    triggerScanEvaluation(lotId);
  };

  if (warehouseFilterModel)  warehouseFilterModel.addEventListener('change', renderDeptWarehouseTable);
  if (warehouseFilterType)   warehouseFilterType.addEventListener('change', renderDeptWarehouseTable);
  if (warehouseFilterStatus) warehouseFilterStatus.addEventListener('change', renderDeptWarehouseTable);

  const closeDeptWarehouseModal = () => {
    if (modalDeptWarehouse) modalDeptWarehouse.style.display = 'none';
  };

  if (btnCloseDeptWarehouseModal)   btnCloseDeptWarehouseModal.addEventListener('click', closeDeptWarehouseModal);
  if (btnDismissDeptWarehouseModal) btnDismissDeptWarehouseModal.addEventListener('click', closeDeptWarehouseModal);

  // ── 10. TRAZABILIDAD INDIVIDUAL DE LOTE & PROCESO ──────────────────────────
  const trackerLotSelect = document.getElementById('trackerLotSelect');
  const trackerLotSearch = document.getElementById('trackerLotSearch');
  const processTimelineContainer = document.getElementById('processTimelineContainer');
  const btnAdvanceLotStep = document.getElementById('btnAdvanceLotStep');
  const btnRewindLotStep  = document.getElementById('btnRewindLotStep');
  const btnApproveQuality = document.getElementById('btnApproveQualityStep');
  let activeTrackedLotId = '49,633';

  function populateTrackerLotSelect() {
    if (!trackerLotSelect || !UanifyState.activeLots) return;
    trackerLotSelect.innerHTML = UanifyState.activeLots.map(lot => {
      const subInfo = lot.isSubdivided ? ' · Sublote 3' : ' · Lote Madre';
      return `<option value="${lot.lotId}" ${lot.lotId === activeTrackedLotId ? 'selected' : ''}>
        Lote ${lot.lotId} · ${lot.model} (${lot.pieces} pzas${subInfo}) · ${lot.currentStation || 'Piso'}
      </option>`;
    }).join('');
  }

  function renderProcessTimeline(lotId) {
    if (!processTimelineContainer) return;
    activeTrackedLotId = lotId || activeTrackedLotId;
    const lot = UanifyState.activeLots.find(l => l.lotId === activeTrackedLotId || l.lotId.replace(/,/g,'') === String(activeTrackedLotId).replace(/,/g,'')) || UanifyState.activeLots[0];
    if (!lot) return;

    const route = UanifyState.getLotRoute(lot.lotId);
    if (!route || !route.steps) return;

    const currentIdx = typeof lot.currentStepIndex === 'number' ? lot.currentStepIndex : 0;
    const currentStep = route.steps[currentIdx] || route.steps[0];
    const nextStep = route.steps[currentIdx + 1] || null;
    const totalSteps = route.steps.length;
    const progressPercent = Math.round(((currentIdx + 1) / totalSteps) * 100);

    const trackerCurrentStationBadge = document.getElementById('trackerCurrentStationBadge');
    const trackerNextStationText     = document.getElementById('trackerNextStationText');
    const trackerModelName           = document.getElementById('trackerModelName');
    const trackerOProd               = document.getElementById('trackerOProd');
    const trackerPiecesInfo          = document.getElementById('trackerPiecesInfo');
    const trackerOperatorName        = document.getElementById('trackerOperatorName');
    const trackerProgressPct         = document.getElementById('trackerProgressPct');
    const trackerProgressBar         = document.getElementById('trackerProgressBar');

    if (trackerCurrentStationBadge) {
      trackerCurrentStationBadge.innerHTML = `📍 UBICACIÓN ACTUAL: ${currentStep.code} ${currentStep.name}`;
      trackerCurrentStationBadge.style.background = currentStep.type === 'calidad' ? '#D97706' : 'var(--color-brand)';
    }
    if (trackerNextStationText) {
      trackerNextStationText.innerHTML = nextStep 
        ? `Próxima Parada: <strong>${nextStep.code} ${nextStep.name}</strong>`
        : `<strong style="color:var(--color-green);">🏁 Ruta Finalizada · Listo para Entrega</strong>`;
    }
    if (trackerModelName) trackerModelName.textContent = `${lot.clase || 'Sombrero'} (${lot.model})`;
    if (trackerOProd) trackerOProd.textContent = `#${lot.oProd || '15000'}`;
    if (trackerPiecesInfo) {
      trackerPiecesInfo.textContent = `${lot.pieces} pzas${lot.isSubdivided ? ' (Sublote 3 de 4)' : ' (Lote Madre)'}`;
    }
    if (trackerOperatorName) trackerOperatorName.textContent = `${lot.operatorSticker || lot.operator} (${currentStep.code})`;
    if (trackerProgressPct) trackerProgressPct.textContent = `${progressPercent}% (Paso ${currentIdx + 1} de ${totalSteps})`;
    if (trackerProgressBar) trackerProgressBar.style.width = `${progressPercent}%`;

    processTimelineContainer.innerHTML = route.steps.map((st, idx) => {
      let stateClass = 'is-pending';
      let stateFooter = '⏳ En espera';
      if (idx < currentIdx) {
        stateClass = 'is-completed';
        stateFooter = '✅ Superado';
      } else if (idx === currentIdx) {
        stateClass = 'is-current';
        stateFooter = `<span class="timeline-current-pill">📍 AQUÍ (${lot.pieces} pz)</span>`;
      }

      const isQuality = st.type === 'calidad' || st.isQualityStop || st.code.startsWith('C-');
      const isLogistics = st.type === 'logistica' || st.code === 'D-11';
      let typeLabel = isQuality ? '🔍 Calidad' : isLogistics ? '🚚 Logística' : '🏭 Manufactura';

      return `
        <div class="timeline-step-node ${stateClass} ${isQuality ? 'is-quality' : ''}" data-step-index="${idx}">
          <div class="timeline-step-head">
            <span class="timeline-step-number">#${idx + 1}</span>
            <span class="timeline-step-type-badge">${typeLabel}</span>
          </div>
          <div class="timeline-step-body">
            <div class="timeline-step-code">${st.icon || (isQuality ? '🔍' : '🏭')} ${st.code}</div>
            <div class="timeline-step-name">${st.name}</div>
          </div>
          <div class="timeline-step-footer">
            ${stateFooter}
            <span style="font-family:var(--font-mono); font-size:10px; color:var(--text-muted);">${st.cycleTime || '30s'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  if (trackerLotSelect) {
    trackerLotSelect.addEventListener('change', (e) => {
      activeTrackedLotId = e.target.value;
      renderProcessTimeline(activeTrackedLotId);
    });
  }

  if (trackerLotSearch) {
    trackerLotSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      const matched = UanifyState.activeLots.find(l => 
        l.lotId.toLowerCase().includes(q) || 
        l.model.toLowerCase().includes(q) || 
        (l.oProd && l.oProd.includes(q))
      );
      if (matched) {
        activeTrackedLotId = matched.lotId;
        if (trackerLotSelect) trackerLotSelect.value = matched.lotId;
        renderProcessTimeline(matched.lotId);
      }
    });
  }

  // Avance y Retroceso en Timeline con Validación de Supervisor
  function validateSupervisorMovement(lot) {
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const isSuperUser = user.role === 'admin' || user.role === 'ingeniero' || 
                        (user.assignedDepartments && user.assignedDepartments.includes('*'));

    const currentStationCode = lot.currentStationCode || 'D-05';
    if (!isSuperUser && (!user.assignedDepartments || !user.assignedDepartments.includes(currentStationCode))) {
      window.UanifyUI.toast(
        `Solo puedes mover lotes de tus departamentos asignados (${user.assignedDepartments.join(', ')}). Este lote pertenece a ${lot.currentStation || currentStationCode}.`,
        'warning',
        '🔒 Restricción de Supervisor'
      );
      return false;
    }
    return true;
  }

  if (btnAdvanceLotStep) {
    btnAdvanceLotStep.addEventListener('click', () => {
      const lot = UanifyState.activeLots.find(l => l.lotId === activeTrackedLotId) || UanifyState.activeLots[0];
      if (!validateSupervisorMovement(lot)) return;

      const res = UanifyState.advanceLot(activeTrackedLotId);
      if (res) {
        renderProcessTimeline(activeTrackedLotId);
        populateTrackerLotSelect();
        renderPlantDepartmentsGrid();
        window.UanifyUI.toast(
          `Lote ${res.lot.lotId} avanzó a ${res.targetStep.code} "${res.targetStep.name}".`,
          'success',
          '⏩ Lote Avanzado'
        );
      }
    });
  }

  if (btnRewindLotStep) {
    btnRewindLotStep.addEventListener('click', () => {
      const lot = UanifyState.activeLots.find(l => l.lotId === activeTrackedLotId) || UanifyState.activeLots[0];
      if (!validateSupervisorMovement(lot)) return;

      const res = UanifyState.rewindLot(activeTrackedLotId);
      if (res) {
        renderProcessTimeline(activeTrackedLotId);
        populateTrackerLotSelect();
        renderPlantDepartmentsGrid();
        window.UanifyUI.toast(
          `Lote ${res.lot.lotId} retrocedió a ${res.targetStep.code} "${res.targetStep.name}" para reproceso.`,
          'warning',
          '⏮️ Lote Reubicado'
        );
      }
    });
  }

  // ── 11. MODO FRACCIONAMIENTO EN RAMPA (RF-08 & GAP-11) ────────────────────
  const btnActivateRampaMode           = document.getElementById('btnActivateRampaMode');
  const modalRampaFraccionamiento      = document.getElementById('modalRampaFraccionamiento');
  const btnCloseRampaModal             = document.getElementById('btnCloseRampaModal');
  const btnCancelRampaModal            = document.getElementById('btnCancelRampaModal');
  const btnExecuteRampaFraccionamiento = document.getElementById('btnExecuteRampaFraccionamiento');
  const btnRampaScanAnotherMother      = document.getElementById('btnRampaScanAnotherMother');
  const rampaMotherLotId               = document.getElementById('rampaMotherLotId');
  const rampaMotherLotPieces           = document.getElementById('rampaMotherLotPieces');
  const rampaMotherLotModel            = document.getElementById('rampaMotherLotModel');
  const rampaSub1Folio                 = document.getElementById('rampaSub1Folio');
  const rampaSub2Folio                 = document.getElementById('rampaSub2Folio');
  const rampaSub3Folio                 = document.getElementById('rampaSub3Folio');
  const rampaSub4Folio                 = document.getElementById('rampaSub4Folio');
  const rampaOperatorSelect            = document.getElementById('rampaOperatorSelect');

  let currentRampaMotherId = '49386';

  function setupRampaModalForLot(mId) {
    currentRampaMotherId = mId;
    const cleanId = mId.split('-')[0];
    if (rampaMotherLotId) rampaMotherLotId.textContent = cleanId;
    if (rampaMotherLotPieces) rampaMotherLotPieces.textContent = '60 piezas totales';
    
    // Asignar modelo de lote madre
    let mName = '1000X Chaparral';
    if (cleanId === '49633') mName = '1000X Master Telar · Viejonón';
    else if (cleanId === '49842') mName = 'Magnum Tradicional';
    if (rampaMotherLotModel) rampaMotherLotModel.textContent = mName;

    // Actualizar los 4 folios de sublotes
    if (rampaSub1Folio) rampaSub1Folio.textContent = `${cleanId}-1`;
    if (rampaSub2Folio) rampaSub2Folio.textContent = `${cleanId}-2`;
    if (rampaSub3Folio) rampaSub3Folio.textContent = `${cleanId}-3`;
    if (rampaSub4Folio) rampaSub4Folio.textContent = `${cleanId}-4`;
  }

  window.openRampaFraccionamientoMode = function(optionalLotId) {
    let targetId = optionalLotId;
    if (!targetId && activeScannedLot) {
      targetId = activeScannedLot.lotId.split('-')[0];
    }
    if (!targetId) targetId = '49386';
    setupRampaModalForLot(targetId);

    if (modalRampaFraccionamiento) {
      modalRampaFraccionamiento.style.display = 'flex';
    }
  };

  if (btnActivateRampaMode) {
    btnActivateRampaMode.addEventListener('click', () => {
      window.openRampaFraccionamientoMode();
    });
  }

  function closeRampaModal() {
    if (modalRampaFraccionamiento) {
      modalRampaFraccionamiento.style.display = 'none';
    }
  }

  if (btnCloseRampaModal) btnCloseRampaModal.addEventListener('click', closeRampaModal);
  if (btnCancelRampaModal) btnCancelRampaModal.addEventListener('click', closeRampaModal);

  if (btnRampaScanAnotherMother) {
    btnRampaScanAnotherMother.addEventListener('click', () => {
      const nextId = currentRampaMotherId === '49386' ? '49633' : '49386';
      setupRampaModalForLot(nextId);
      window.UanifyUI.toast(`Cambiado a Lote Madre ${nextId} (${rampaMotherLotModel.textContent}) para fraccionamiento.`, 'info');
    });
  }

  if (btnExecuteRampaFraccionamiento) {
    btnExecuteRampaFraccionamiento.addEventListener('click', () => {
      const cleanId = currentRampaMotherId.split('-')[0];
      const selectedOp = rampaOperatorSelect ? rampaOperatorSelect.value : 'JORGE';
      const mName = rampaMotherLotModel ? rampaMotherLotModel.textContent : '1000X Chaparral';

      // Cargar Sublote #1 como activo en la terminal
      activeScannedLot = {
        lotId: `${cleanId}-1`,
        motherLotId: cleanId,
        sublotNum: 1,
        pieces: 15,
        clase: '1000X MASTER TELAR',
        model: mName.includes('Viejonón') ? 'Viejonón' : 'Chaparral',
        modelName: mName,
        horma: mName.includes('Viejonón') ? 'Viejonón' : 'Chaparral',
        brim: '9 1/2 cm',
        bend: 'Doblado Arriba',
        size: '55',
        oProd: '15071',
        orderNumber: 'OP-15071',
        operator: `${selectedOp} (Prensas)`,
        operatorSticker: selectedOp,
        originStationCode: 'D-04',
        originStationName: 'Rampa de Ensamble',
        currentStationCode: 'D-04',
        currentStationName: 'Rampa de Ensamble',
        targetStationCode: 'D-05',
        targetStationName: 'Prensas de Hormado',
        hasScrap: false,
        isSubdivided: true
      };

      // Si existe en UanifyState marcar lote madre como subdividido
      const existing = UanifyState.lots.find(l => l.lotId === cleanId);
      if (existing) {
        existing.isSubdivided = true;
      }

      renderActiveScannedLotCard(activeScannedLot);
      closeRampaModal();

      window.UanifyUI.toast(
        `Lote Madre ${cleanId} fraccionado en 4 sublotes de 15 piezas. Sublote ${cleanId}-1 cargado en la terminal listo para depositar en Almacén de D-05 Prensas de Hormado.`,
        'success',
        '⚡ Fraccionamiento en Rampa Completado'
      );
    });
  }

  // ── 12. MONITOR DE ALMACENES INTERMEDIOS & LOTES LISTOS (SUBTAB 3) ────────
  const bufferGrid = document.getElementById('bufferReadyLotsGrid');
  const bufferFilterScope = document.getElementById('bufferFilterScope');
  const bufferCountBadge = document.getElementById('bufferReadyCountBadge');
  const btnRefreshBuffer = document.getElementById('btnRefreshBufferMonitor');

  function renderBufferReadyLots() {
    if (!bufferGrid || !UanifyState.bufferReadyLots) return;
    const filter = bufferFilterScope ? bufferFilterScope.value : 'all';
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const myDepts = user.assignedDepartments || ['*'];

    const filtered = UanifyState.bufferReadyLots.filter(item => {
      if (filter === 'my-depts') {
        if (myDepts.includes('*')) return true;
        return myDepts.includes(item.targetDeptCode);
      }
      if (filter !== 'all') {
        return item.originDeptCode === filter;
      }
      return true;
    });

    if (bufferCountBadge) {
      bufferCountBadge.textContent = `${filtered.length} lotes en espera de recolección`;
    }

    if (filtered.length === 0) {
      bufferGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding:30px; text-align:center; background:#F8FAFC; border-radius:12px; border:1px dashed var(--border-subtle);">
          <span style="font-size:32px;">📭</span>
          <h4 style="margin:8px 0 4px 0; color:var(--text-primary);">No hay lotes en espera en este almacén</h4>
          <p style="margin:0; font-size:12px; color:var(--text-muted);">Los departamentos previos están procesando piezas o no han depositado en su almacén de salida.</p>
        </div>
      `;
      return;
    }

    bufferGrid.innerHTML = filtered.map(item => {
      const isTargetForMe = myDepts.includes('*') || myDepts.includes(item.targetDeptCode);

      return `
        <div class="buffer-ready-card ${isTargetForMe ? 'ready-for-me' : ''}">
          <div class="buffer-card-header">
            <div>
              <div class="buffer-route-flow">
                <span>Almacén Salida: <strong>${item.originDeptCode}</strong></span>
                <span class="buffer-route-arrow">➔</span>
                <span>Destino: <strong style="color:var(--color-brand);">${item.targetDeptCode}</strong></span>
              </div>
              <span class="buffer-lot-tag">Folio ${item.lotId}</span>
            </div>
            <span class="buffer-time-badge">⏳ Esperando ${item.waitingMinutes}m</span>
          </div>

          <div class="buffer-lot-meta">
            <div><strong>${item.pieces} Sombreros</strong> · ${item.model}</div>
            <div style="color:var(--text-muted); font-size:11.5px; margin-top:2px;">
              De: ${item.originDeptName} ➔ Para: ${item.targetDeptName}
            </div>
            <div style="margin-top:6px; font-size:11px; background:rgba(0,0,0,0.03); padding:6px 8px; border-radius:6px; font-style:italic;">
              "${item.notes}"
            </div>
          </div>

          <div class="buffer-actions-row">
            <button class="btn-primary btn-touch-lg" style="flex:1;" onclick="window.collectBufferLot('${item.id}')">
              🚚 Recoger Lote (${item.pieces} pzas)
            </button>
            <button class="btn-secondary btn-touch-lg" style="padding:8px 12px;" onclick="window.inspectSpecificLotCard('${item.lotId}')" title="Ver en Visor">
              👁️
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.collectBufferLot = function(bufferId) {
    const itemIndex = UanifyState.bufferReadyLots.findIndex(b => b.id === bufferId);
    if (itemIndex === -1) return;
    const item = UanifyState.bufferReadyLots[itemIndex];
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];

    window.UanifyUI.confirm(
      'Confirmar Recolección de Lote',
      `¿Deseas recolectar el Lote ${item.lotId} (${item.pieces} pzas) desde el almacén de salida de "${item.originDeptName}" para trasladarlo a tu departamento "${item.targetDeptName}"?`,
      () => {
        UanifyState.bufferReadyLots.splice(itemIndex, 1);
        renderBufferReadyLots();

        const cleanLotId = item.lotId.split('-')[0].replace(',', '');
        const targetLot = UanifyState.activeLots.find(l => l.lotId.replace(',', '') === cleanLotId || l.lotId === item.lotId);
        if (targetLot) {
          UanifyState.advanceLot(targetLot.lotId);
          renderProcessTimeline(targetLot.lotId);
        }

        window.UanifyUI.toast(
          `¡Lote ${item.lotId} recogido con éxito! Custodia trasladada a ${item.targetDeptName}. Traslado registrado por ${user.name}.`,
          'success',
          '🚚 Lote Recolectado'
        );
      },
      'Sí, Recoger Lote',
      'Cancelar'
    );
  };

  if (bufferFilterScope) bufferFilterScope.addEventListener('change', renderBufferReadyLots);
  if (btnRefreshBuffer) {
    btnRefreshBuffer.addEventListener('click', () => {
      renderBufferReadyLots();
      window.UanifyUI.toast('Almacenes intermedios actualizados en tiempo real.', 'info', 'Monitor Actualizado');
    });
  }

  // ── 13. OPERACIÓN EN MÁQUINA & RECOLECCIÓN (SUBTABS 4 Y 5) ────────────────
  const workflowDeptSelect     = document.getElementById('workflowDeptSelect');
  const workflowMachineSelect  = document.getElementById('workflowMachineSelect');
  const workflowOperatorSelect = document.getElementById('workflowOperatorSelect');
  const btnCompleteMachineRun  = document.getElementById('btnCompleteMachineRun');
  const supervisorDeptsBadge   = document.getElementById('supervisorDeptsBadge');

  const transferOriginDept    = document.getElementById('transferOriginDept');
  const transferDestDept      = document.getElementById('transferDestDept');
  const transferCollectorName = document.getElementById('transferCollectorName');
  const transferQtyInput      = document.getElementById('transferQtyInput');
  const btnExecuteTransfer    = document.getElementById('btnExecuteTransfer');

  function syncDepartmentScope() {
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const banner = document.getElementById('terminalSupervisorBanner');
    if (banner) {
      banner.textContent = `Supervisor Activo: ${user.name} (${user.roleName})`;
    }

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

    if (workflowDeptSelect) {
      workflowDeptSelect.innerHTML = allowedStations.map(st => `
        <option value="${st.code}">${st.code} · ${st.name}</option>
      `).join('');
      populateMachinesAndOperators();
    }

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

    if (workflowMachineSelect) {
      workflowMachineSelect.innerHTML = `
        <option value="M-01">${st ? st.name : 'Estación'} - Máquina Principal 01</option>
        <option value="M-02">${st ? st.name : 'Estación'} - Máquina Principal 02</option>
        <option value="M-03">${st ? st.name : 'Estación'} - Mesa de Soporte 03</option>
      `;
    }

    if (workflowOperatorSelect) {
      const deptOps = (UanifyState.operators || []).filter(op => op.deptCode === deptCode);
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

  if (workflowDeptSelect) workflowDeptSelect.addEventListener('change', populateMachinesAndOperators);

  if (btnCompleteMachineRun) {
    btnCompleteMachineRun.addEventListener('click', () => {
      const deptCode = workflowDeptSelect ? workflowDeptSelect.value : 'D-05';
      const st = UanifyState.stations.find(s => s.code === deptCode) || UanifyState.stations[4];
      const opText = workflowOperatorSelect ? workflowOperatorSelect.selectedOptions[0]?.text : 'Operador';
      const machineText = workflowMachineSelect ? workflowMachineSelect.selectedOptions[0]?.text : 'Máquina';

      st.produced += 15;
      UanifyState.producedTotal += 15;
      if (terminalProduced) terminalProduced.textContent = `${UanifyState.producedTotal} pzas`;

      const andonTotalEl = document.getElementById('andonProducedTotal');
      if (andonTotalEl) andonTotalEl.textContent = `${UanifyState.producedTotal} pzas`;

      renderPlantDepartmentsGrid();
      window.UanifyUI.toast(
        `Sublote procesado en ${machineText} por ${opText}. Depositado en Almacén Intermedio de Salida de ${st.name}.`,
        'success',
        '⚙️ Trabajo en Máquina Concluido'
      );
    });
  }

  if (btnExecuteTransfer) {
    btnExecuteTransfer.addEventListener('click', () => {
      const originCode = transferOriginDept ? transferOriginDept.value : 'D-05';
      const destCode   = transferDestDept ? transferDestDept.value : 'D-06';
      const collector  = (transferCollectorName ? transferCollectorName.value.trim() : '') || 'Recolector de Turno';
      const qty        = transferQtyInput ? parseInt(transferQtyInput.value, 10) : 15;

      const originSt = UanifyState.stations.find(s => s.code === originCode) || { name: originCode };
      const destSt   = UanifyState.stations.find(s => s.code === destCode) || { name: destCode };

      renderPlantDepartmentsGrid();
      window.UanifyUI.toast(
        `Se recolectaron ${qty} sombreros del Almacén de ${originSt.name} y se trasladaron al Almacén de ${destSt.name}. Responsable: ${collector}.`,
        'success',
        '🚚 Traspaso Confirmado'
      );
    });
  }

  // ── 14. INICIALIZACIÓN GENERAL ─────────────────────────────────────────────
  renderActiveScannedLotCard(activeScannedLot);
  renderPlantDepartmentsGrid();
  populateTrackerLotSelect();
  renderProcessTimeline(activeTrackedLotId);

  // Sincronizar cuando cambie de usuario en el sistema
  EventBus.on('user-switched', () => {
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const banner = document.getElementById('terminalSupervisorBanner');
    if (banner) {
      banner.textContent = `Supervisor Activo: ${user.name} (${user.roleName})`;
    }
    renderPlantDepartmentsGrid();
  });
};
