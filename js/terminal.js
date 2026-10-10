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

  // Elementos de Contenedores de Estado en Escáner
  const terminalScannerEmptyState          = document.getElementById('terminalScannerEmptyState');
  const terminalScannedLotActionsContainer = document.getElementById('terminalScannedLotActionsContainer');
  const btnLaunchFullscreenScanner         = document.getElementById('btnLaunchFullscreenScanner');
  const btnScanAnotherLot                  = document.getElementById('btnScanAnotherLot');

  // Modal / Kiosko Aislado de Pantalla Completa para Escáner QR
  const kioskQrScannerModal       = document.getElementById('kioskQrScannerModal');
  const btnCloseKioskScannerModal = document.getElementById('btnCloseKioskScannerModal');
  const btnKioskSimulateScan      = document.getElementById('btnKioskSimulateScan');
  const kioskSimRandom            = document.getElementById('kioskSimRandom');
  const kioskSimSublot3           = document.getElementById('kioskSimSublot3');
  const kioskSimMotherLot         = document.getElementById('kioskSimMotherLot');
  const kioskSimScrapLot          = document.getElementById('kioskSimScrapLot');
  const kioskSimQualityStop       = document.getElementById('kioskSimQualityStop');
  const kioskSimFinalLot          = document.getElementById('kioskSimFinalLot');
  const kioskSimUnauthorized      = document.getElementById('kioskSimUnauthorized');

  // Elementos de Escáner y Cámara
  const cameraWrapper      = document.getElementById('cameraScannerWrapper');
  const videoFeed          = document.getElementById('qrCameraVideo');
  const cameraPlaceholder  = document.getElementById('cameraPlaceholderMsg');
  const cameraReticle      = document.getElementById('cameraReticleOverlay');
  const cameraStatusBadge  = document.getElementById('cameraStatusBadge');

  // Botones de Simulación Rápida (Vista previa en empty state)
  const btnSimRandom       = document.getElementById('btnSimulateScanRandom');
  const btnSimSublot3      = document.getElementById('btnSimulateScanSublot3');
  const btnSimMotherLot    = document.getElementById('btnSimulateScanMotherLot');
  const btnSimScrapLot     = document.getElementById('btnSimulateScanScrapLot');
  const btnSimQualityStop  = document.getElementById('btnSimulateScanQualityStop');
  const btnSimFinalLot     = document.getElementById('btnSimulateScanFinalLot');
  const btnSimUnauthorized = document.getElementById('btnSimulateScanUnauthorized');

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

  // ── 1. GESTIÓN DE CÁMARA WEB & KIOSKO DE PANTALLA COMPLETA ────────────────
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.info('Dispositivo sin soporte getUserMedia directo.');
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
      if (cameraStatusBadge) {
        cameraStatusBadge.textContent = ' Cámara en vivo activa';
        cameraStatusBadge.style.background = '#ECFDF5';
        cameraStatusBadge.style.color = '#047857';
      }
    } catch (err) {
      console.warn('Cámara en vivo no disponible o denegada:', err);
    }
  }

  function stopCamera() {
    try {
      if (videoFeed && videoFeed.srcObject) {
        const stream = videoFeed.srcObject;
        if (stream && typeof stream.getTracks === 'function') {
          stream.getTracks().forEach(track => {
            try {
              track.stop();
              track.enabled = false;
            } catch (e) {}
          });
        }
        videoFeed.srcObject = null;
        try { videoFeed.pause(); } catch (e) {}
      }

      if (mediaStream) {
        if (typeof mediaStream.getTracks === 'function') {
          mediaStream.getTracks().forEach(track => {
            try {
              track.stop();
              track.enabled = false;
            } catch (e) {}
          });
        }
        mediaStream = null;
      }
    } catch (err) {
      console.warn('Error al detener la cámara:', err);
    }

    if (cameraPlaceholder) cameraPlaceholder.style.display = 'flex';
    if (cameraReticle)     cameraReticle.style.display = 'none';
    if (cameraStatusBadge) {
      cameraStatusBadge.textContent = ' Cámara apagada';
      cameraStatusBadge.style.background = '#F1F5F9';
      cameraStatusBadge.style.color = 'var(--text-muted)';
    }
  }

  // Apagar la cámara de inmediato si la pestaña o ventana pierde visibilidad
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopCamera();
    }
  });

  // Apagar la cámara si se abandona la página
  window.addEventListener('beforeunload', stopCamera);
  window.addEventListener('pagehide', stopCamera);

  // Apagar la cámara si se cambia de módulo en la app
  if (window.EventBus) {
    window.EventBus.on('tab-changed', (newTab) => {
      if (newTab !== 'terminal') {
        stopCamera();
        if (kioskQrScannerModal) kioskQrScannerModal.style.display = 'none';
      }
    });
  }

  // ── Mover el modal del kiosko al root de <body> para escapar stacking contexts ──
  // El parent (.sub-tab-content) tiene animation: fadeIn que crea un containing block
  // para position:fixed, impidiendo cobertura 100vw/100vh real.
  if (kioskQrScannerModal && kioskQrScannerModal.parentElement !== document.body) {
    document.body.appendChild(kioskQrScannerModal);
  }

  // ── Gestión del Modo de Inmersión en Pantalla Completa (US-KIOSK) ──
  // La inmersión se mantiene activa desde el escaneo del código QR y durante toda
  // la atención/procesamiento del lote en piso, hasta concluir el movimiento o descartarlo.
  function requestAppFullscreen() {
    try {
      const rootEl = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (rootEl.requestFullscreen) {
          rootEl.requestFullscreen().catch(() => {});
        } else if (rootEl.webkitRequestFullscreen) {
          rootEl.webkitRequestFullscreen();
        }
      }
    } catch (e) { /* Fullscreen API no disponible en navegador, degradar suavemente */ }
  }

  function exitAppFullscreen() {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (e) { /* Ignorar error al salir */ }
  }

  function openKioskScanner() {
    if (kioskQrScannerModal) {
      kioskQrScannerModal.style.display = 'flex';
      startCamera();
      // Solicitar pantalla completa en la app
      requestAppFullscreen();
    }
  }

  function closeKioskScanner() {
    if (kioskQrScannerModal) {
      kioskQrScannerModal.style.display = 'none';
      stopCamera();
      // NOTA: NO salimos de pantalla completa aquí si el usuario va a revisar
      // o procesar el lote escaneado, manteniéndose en modo inmersivo de planta.
    }
  }

  // Finaliza la sesión del lote actual y devuelve la vista limpia del escáner
  function finishLotSession() {
    activeScannedLot = null;
    candidateScannedLot = null;
    if (terminalScannedLotActionsContainer) {
      terminalScannedLotActionsContainer.style.display = 'none';
    }
    if (terminalScannerEmptyState) {
      terminalScannerEmptyState.style.display = 'block';
    }
    // Salir del modo pantalla completa al completar lo correspondiente con el lote
    exitAppFullscreen();
  }

  if (btnLaunchFullscreenScanner) {
    btnLaunchFullscreenScanner.addEventListener('click', openKioskScanner);
  }

  if (btnCloseKioskScannerModal) {
    btnCloseKioskScannerModal.addEventListener('click', closeKioskScanner);
  }

  // Catálogo de Lotes de Planta para Simulación Aleatoria y Pruebas
  const PLANT_SIM_LOTS = [
    {
      payload: 'TB|49633|3|VIEJONON|9 1/2|55|15071|JORGE|D-05|D-06|OK',
      name: 'Sublote #3 (Viejonón #55 · D-05 a D-06)'
    },
    {
      payload: 'TB|49386|0|CHAPARRAL|9.0 Cm|56|15068|SIN_OPERADOR|D-04|D-05|OK',
      name: 'Lote Madre 60 pzas (Chaparral #56 · D-04 a D-05)'
    },
    {
      payload: 'TB|49842|0|MAGNUM|9 1/2|57|15075|MELANY|D-05|D-06|SCRAP:Quemado por prensa de vapor',
      name: 'Lote con Merma Registrada (Magnum #57 · Merma en Prensa)'
    },
    {
      payload: 'TB|49633|2|VIEJONON|9 1/2|55|15071|LUPITA|C-02|D-07|OK',
      name: 'Parada en Filtro de Calidad (C-02 Inspección intermedia)'
    },
    {
      payload: 'TB|49720|1|DENVER|9 1/2|58|15082|CARMEN|D-10|PT|OK',
      name: 'Lote en Empaque Final (D-10 · Ingreso a Producto Terminado)'
    },
    {
      payload: 'TB|49700|0|DENVER|9 1/2|58|15080|RAUL|D-01|D-02|OK',
      name: 'Lote en Depto Ajeno (D-01 Corte · Validación RBAC)'
    }
  ];

  function pickRandomSimLot() {
    const idx = Math.floor(Math.random() * PLANT_SIM_LOTS.length);
    return PLANT_SIM_LOTS[idx];
  }

  if (btnKioskSimulateScan) {
    btnKioskSimulateScan.addEventListener('click', () => {
      closeKioskScanner();
      const sim = pickRandomSimLot();
      window.UanifyUI.toast(`Simulando escaneo aleatorio: ${sim.name}`, 'info', 'QR Aleatorio Disparado');
      triggerScanEvaluation(sim.payload);
    });
  }

  if (kioskSimRandom) {
    kioskSimRandom.addEventListener('click', () => {
      closeKioskScanner();
      const sim = pickRandomSimLot();
      window.UanifyUI.toast(`Simulando escaneo aleatorio: ${sim.name}`, 'info', 'QR Aleatorio Disparado');
      triggerScanEvaluation(sim.payload);
    });
  }

  if (kioskSimSublot3) {
    kioskSimSublot3.addEventListener('click', () => {
      closeKioskScanner();
      triggerScanEvaluation('TB|49633|3|VIEJONON|9 1/2|55|15071|JORGE|D-05|D-06|OK');
    });
  }

  if (kioskSimMotherLot) {
    kioskSimMotherLot.addEventListener('click', () => {
      closeKioskScanner();
      triggerScanEvaluation('TB|49386|0|CHAPARRAL|9.0 Cm|56|15068|SIN_OPERADOR|D-04|D-05|OK');
    });
  }

  if (kioskSimScrapLot) {
    kioskSimScrapLot.addEventListener('click', () => {
      closeKioskScanner();
      triggerScanEvaluation('TB|49842|0|MAGNUM|9 1/2|57|15075|MELANY|D-05|D-06|SCRAP:Quemado por prensa de vapor');
    });
  }

  if (kioskSimQualityStop) {
    kioskSimQualityStop.addEventListener('click', () => {
      closeKioskScanner();
      triggerScanEvaluation('TB|49633|2|VIEJONON|9 1/2|55|15071|LUPITA|C-02|D-07|OK');
    });
  }

  if (kioskSimFinalLot) {
    kioskSimFinalLot.addEventListener('click', () => {
      closeKioskScanner();
      triggerScanEvaluation('TB|49720|1|DENVER|9 1/2|58|15082|CARMEN|D-10|PT|OK');
    });
  }

  if (kioskSimUnauthorized) {
    kioskSimUnauthorized.addEventListener('click', () => {
      closeKioskScanner();
      triggerScanEvaluation('TB|49700|0|DENVER|9 1/2|58|15080|RAUL|D-01|D-02|OK');
    });
  }

  if (btnScanAnotherLot) {
    btnScanAnotherLot.addEventListener('click', () => {
      finishLotSession();
      window.UanifyUI.toast('Terminal lista para escanear un nuevo código QR.', 'info', 'Nuevo Escaneo');
    });
  }

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
            <div class="traveler-hat-logo"> TOMBSTONE®</div>
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

    // A) Formato Delimitado con Pipes Oficial de la Propuesta Técnica:
    // LOTE_ID|TIPO|MODELO|CALIDAD|TALLA|ORD_PROD|TOTAL_PZAS|SUBLOTE_NUM
    // ej. LT-2026-0941|S|1000XMT|PRIMERA|59|OP-2026-112|15|2
    // O formato previo con prefijo TB|...
    if (text.includes('|')) {
      const parts = text.split('|');
      let lotId = parts[0];
      let sublotNum = null;
      let model = '1000X Master Telar';
      let brim = '9 1/2';
      let size = '55';
      let oProd = '15071';
      let operator = 'JORGE';
      let currentStationCode = 'D-05';
      let pieces = 15;
      let hasScrap = false;
      let scrapReason = '';

      if (parts[0] === 'TB') {
        // Formato legado TB|49633|3|VIEJONON|...
        lotId = parts[1] || '49,633';
        sublotNum = parseInt(parts[2], 10) || null;
        model = parts[3] || 'VIEJONON';
        brim = parts[4] || '9 1/2';
        size = parts[5] || '55';
        oProd = parts[6] || '15071';
        operator = parts[7] || 'JORGE';
        currentStationCode = parts[8] || 'D-05';
        const scrapFlag = parts[10] || '';
        hasScrap = scrapFlag.toUpperCase().includes('SCRAP');
        scrapReason = hasScrap ? (scrapFlag.split(':')[1] || 'Defecto en inspección') : '';
      } else {
        // Formato oficial de la propuesta:
        // parts[0] = LOTE_ID (ej. LT-2026-0941 o 49633)
        // parts[1] = TIPO ('M' o 'S')
        // parts[2] = MODELO
        // parts[3] = CALIDAD
        // parts[4] = TALLA
        // parts[5] = ORD_PROD
        // parts[6] = TOTAL_PZAS
        // parts[7] = SUBLOTE_NUM
        lotId = parts[0] || '49,633';
        const tipo = (parts[1] || 'M').toUpperCase();
        model = parts[2] || '1000X Master Telar';
        size = parts[4] || '55';
        oProd = parts[5] || '15071';
        pieces = parseInt(parts[6], 10) || (tipo === 'S' ? 15 : 60);
        sublotNum = parts[7] ? parseInt(parts[7], 10) : (tipo === 'S' ? 1 : null);
      }

      return matchOrCreateLot({
        lotId,
        sublotNum,
        pieces,
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

    // Excepción y validación de permisos de Supervisor al escanear QR
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const isSuperUser = user.role === 'admin' || user.role === 'ingeniero' || 
                        (user.assignedDepartments && user.assignedDepartments.includes('*'));
    const lotStation = lot.currentStationCode || 'D-05';

    if (!isSuperUser && (!user.assignedDepartments || !user.assignedDepartments.includes(lotStation))) {
      const myDeptNames = (user.assignedDepartments || []).map(c => {
        const st = (UanifyState.stations || []).find(s => s.code === c);
        return st ? st.name : c;
      }).join(', ');
      window.UanifyUI.toast(
        `⛔ Restricción Departamental: Este lote se encuentra en ${lot.currentStationCode} (${lot.currentStationName}), pero como Supervisor solo tienes asignados: ${myDeptNames}.`,
        'danger',
        'Acceso No Autorizado al Lote'
      );
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
        verifyScrapStatus.innerHTML = `<span style="color:#B91C1C; font-weight:800;"> Contiene 1 Sombrero con Merma (${lot.scrapReason})</span>`;
      } else {
        verifyScrapStatus.innerHTML = `<span style="color:#15803D; font-weight:700;">OK Sin Mermas (15 pzas íntegras)</span>`;
      }
    }

    // Cerrar kiosko si estuviera abierto y abrir modal de verificación
    closeKioskScanner();
    if (modalVerifyScannedCard) {
      modalVerifyScannedCard.style.display = 'flex';
    }
  }

  // Botones de Simulación Rápida (En Empty State)
  if (btnSimRandom) {
    btnSimRandom.addEventListener('click', () => {
      const sim = pickRandomSimLot();
      window.UanifyUI.toast(`Disparando QR aleatorio: ${sim.name}`, 'info', 'Simulación de Planta');
      triggerScanEvaluation(sim.payload);
    });
  }

  if (btnSimSublot3) {
    btnSimSublot3.addEventListener('click', () => {
      triggerScanEvaluation('TB|49633|3|VIEJONON|9 1/2|55|15071|JORGE|D-05|D-06|OK');
    });
  }

  if (btnSimMotherLot) {
    btnSimMotherLot.addEventListener('click', () => {
      triggerScanEvaluation('TB|49386|0|CHAPARRAL|9.0 Cm|56|15068|SIN_OPERADOR|D-04|D-05|OK');
    });
  }

  if (btnSimScrapLot) {
    btnSimScrapLot.addEventListener('click', () => {
      triggerScanEvaluation('TB|49842|0|MAGNUM|9 1/2|57|15075|MELANY|D-05|D-06|SCRAP:Quemado por prensa de vapor');
    });
  }

  if (btnSimQualityStop) {
    btnSimQualityStop.addEventListener('click', () => {
      triggerScanEvaluation('TB|49633|2|VIEJONON|9 1/2|55|15071|LUPITA|C-02|D-07|OK');
    });
  }

  if (btnSimFinalLot) {
    btnSimFinalLot.addEventListener('click', () => {
      triggerScanEvaluation('TB|49720|1|DENVER|9 1/2|58|15082|CARMEN|D-10|PT|OK');
    });
  }

  if (btnSimUnauthorized) {
    btnSimUnauthorized.addEventListener('click', () => {
      // Simula escaneo de lote en Corte de Telar (D-01), que no pertenece a supervisores de hormado
      triggerScanEvaluation('TB|49700|0|DENVER|9 1/2|58|15080|RAUL|D-01|D-02|OK');
    });
  }

  // Cancelar Verificación
  const closeVerifyModal = () => {
    if (modalVerifyScannedCard) modalVerifyScannedCard.style.display = 'none';
    candidateScannedLot = null;
    exitAppFullscreen();
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

      // Progresión de UI: Ocultar escáner inicial y revelar opciones del lote
      if (terminalScannerEmptyState) {
        terminalScannerEmptyState.style.display = 'none';
      }
      if (terminalScannedLotActionsContainer) {
        terminalScannedLotActionsContainer.style.display = 'block';
      }

      renderActiveScannedLotCard(activeScannedLot);

      // Disparo dinámico de inicio de turno (US-17) con el primer QR confirmado del día
      if (UanifyState.shiftSchedule && UanifyState.shiftSchedule.mode !== 'fixed') {
        const startRes = UanifyState.recordShiftFirstScan(activeScannedLot.lotId);
        if (startRes && startRes.isFirst) {
          window.UanifyUI.toast(
            `Inicio dinámico de jornada registrado a las ${startRes.actualTime} con Lote ${activeScannedLot.lotId}. Ramp-up de arranque calculado: ${startRes.rampUpMinutes} min.`,
            'info',
            'Arranque de Turno Dinámico (US-17)'
          );
        }
      }

      window.UanifyUI.toast(
        `Tarjeta viajera verificada. Lote ${activeScannedLot.lotId}${activeScannedLot.sublotNum ? '-' + activeScannedLot.sublotNum : ''} cargado en la terminal. Siguiente paso: depositar en ${activeScannedLot.targetStationName}.`,
        'success',
        'OK Tarjeta Confirmada'
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
      lotOriginStationText.textContent = lot.originStationName || 'Rampa de Ensamble';
    }
    if (lotCurrentStationText) {
      lotCurrentStationText.textContent = lot.currentStationName || 'Rampa de Ensamble';
    }
    if (lotTargetStationText) {
      lotTargetStationText.textContent = lot.targetStationName || 'Prensas de Hormado';
    }

    const modelName = lot.model || lot.modelName || 'Chaparral';
    const claseName = lot.clase || '1000X Master Telar';
    if (lotMetaModel) lotMetaModel.textContent = `${claseName} · ${modelName}`;
    if (lotMetaSpecs) lotMetaSpecs.textContent = `Talla #${lot.size || '55'} | Falda ${lot.brim || '9 1/2 cm'} | ${lot.bend || 'Doblado Arriba'}`;
    if (lotMetaOperator) lotMetaOperator.textContent = lot.operatorSticker || lot.operator || 'Jorge (Prensas)';
    if (lotMetaPieces) lotMetaPieces.textContent = `${lot.pieces || 15} piezas`;

    // Poblar Selector Universal de Operador por Estación (D-01 a D-14)
    const depositOperatorSelect = document.getElementById('depositOperatorSelect');
    if (depositOperatorSelect) {
      const currentStationCode = lot.currentStationCode || 'D-05';
      const st = (UanifyState.stations || []).find(s => s.code === currentStationCode);
      const deptOps = (UanifyState.operators || []).filter(op => op.deptCode === currentStationCode);

      let optionsHtml = '';
      if (deptOps.length > 0) {
        optionsHtml = deptOps.map(op => `
          <option value="${op.name} (${op.payrollNumber})">${op.name} (${op.payrollNumber})</option>
        `).join('');
        if (st && st.operator) {
          optionsHtml += `<option value="${st.operator}">${st.operator} (Titular de Área)</option>`;
        }
      } else {
        const titular = st ? st.operator : 'Operador de Turno';
        optionsHtml = `
          <option value="${titular}">${titular} (Titular de Área)</option>
          <option value="Cuadrilla de Turno">Cuadrilla General de Turno</option>
        `;
      }
      depositOperatorSelect.innerHTML = optionsHtml;

      // Preseleccionar si el lote ya tenía operador registrado
      if (lot.operatorSticker || lot.operator) {
        const currentOp = lot.operatorSticker || lot.operator;
        for (let i = 0; i < depositOperatorSelect.options.length; i++) {
          if (depositOperatorSelect.options[i].value.includes(currentOp) || currentOp.includes(depositOperatorSelect.options[i].value)) {
            depositOperatorSelect.selectedIndex = i;
            break;
          }
        }
      }
    }

    if (btnDepositToNextBuffer) {
      btnDepositToNextBuffer.textContent = `Depositar Lote en Almacén de ${lot.targetStationName || 'Prensas de Hormado'} (+${lot.pieces || 15} pzas)`;
    }

    if (lotScrapBannerContainer) {
      if (lot.hasScrap) {
        lotScrapBannerContainer.innerHTML = `
          <div class="lot-scrap-alert-banner" style="display:flex; align-items:flex-start; gap:10px; background:#FEF2F2; border:1.5px solid #FCA5A5; border-radius:10px; padding:12px 14px;">
            <span style="font-size:20px; line-height:1;">⚠️</span>
            <div>
              <strong style="color:#B91C1C; font-size:13px;">Lote con Merma Registrada (${lot.scrapReason || 'Defecto en proceso'}):</strong>
              <div style="font-size:11.5px; margin-top:2px; color:#7F1D1D;">
                La pieza con defecto viaja con la torre hasta el punto de segregación e inspección final.
              </div>
            </div>
          </div>
        `;
      } else {
        lotScrapBannerContainer.innerHTML = '';
      }
    }

    // ── GESTIÓN DE PUNTOS DE CONTROL DE CALIDAD (C-01 a C-04 / Rol Calidad e Ingeniero) ──
    const qualityActionsContainer = document.getElementById('qualityActionsContainer');
    const qualityCheckTitle = document.getElementById('qualityCheckTitle');
    const qualityDestinationPanel = document.getElementById('qualityDestinationPanel');
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const isQualityRole = user.role === 'calidad' || user.role === 'ingeniero' || user.role === 'admin';
    const isQualityStop = (lot.currentStationCode && lot.currentStationCode.startsWith('C-')) ||
                          (lot.targetStationCode && lot.targetStationCode.startsWith('C-')) ||
                          (lot.currentStationName && lot.currentStationName.toLowerCase().includes('calidad'));

    if (qualityActionsContainer) {
      if (isQualityStop || isQualityRole) {
        qualityActionsContainer.style.display = 'block';
        if (qualityCheckTitle) {
          qualityCheckTitle.textContent = `Filtro de Inspección: ${lot.currentStationCode || 'C-01'} · ${lot.currentStationName || 'Control de Calidad'}`;
        }
        // Configurar texto dinámico de retorno según filtro de calidad C1-C5
        const reworkBtn = document.getElementById('btnQualitySendRework');
        if (reworkBtn) {
          const code = lot.currentStationCode || '';
          if (code.includes('C2') || code === 'C-02') {
            reworkBtn.textContent = '🔄 Reproceso a D06 Refuerzo (C2)';
          } else if (code.includes('C3') || code === 'C-03') {
            reworkBtn.textContent = '🔄 Reproceso a D06 Pintura (C3)';
          } else if (code.includes('C4') || code === 'C-04') {
            reworkBtn.textContent = '🔄 Reproceso a D07 Hidráulicas Alineado (C4)';
          } else if (code.includes('C5') || code === 'C-05') {
            reworkBtn.textContent = '🔄 Reproceso a D10 Adorno (C5)';
          } else {
            reworkBtn.textContent = '🔄 Enviar a Reproceso Prioritario';
          }
        }
      } else {
        qualityActionsContainer.style.display = 'none';
      }
      if (qualityDestinationPanel) qualityDestinationPanel.style.display = 'none';
    }

    const isSublot = typeof lot.sublotNum === 'number' && lot.sublotNum > 0;
    const isMotherLot = !isSublot || lot.sublotNum === 0 || (lot.pieces && lot.pieces >= 60);
    const isFinalLot = lot.targetStationCode === 'PT' || lot.currentStationCode === 'D-10';

    // ── PANEL CONTEXTUAL DINÁMICO DE OPCIONES SEGÚN EL TIPO Y ESTADO DEL LOTE ──
    const dynamicLotOptionsContainer = document.getElementById('dynamicLotOptionsContainer');
    const dynamicLotTypeBadge        = document.getElementById('dynamicLotTypeBadge');
    const dynamicLotOptionsList      = document.getElementById('dynamicLotOptionsList');

    if (dynamicLotOptionsContainer && dynamicLotOptionsList) {
      dynamicLotOptionsContainer.style.display = 'block';

      const isQualityFilter = (lot.currentStationCode && lot.currentStationCode.startsWith('C-')) ||
                              (lot.targetStationCode && lot.targetStationCode.startsWith('C-'));

      if (dynamicLotTypeBadge) {
        if (lot.hasScrap) {
          dynamicLotTypeBadge.textContent = 'Lote con Merma Activa';
          dynamicLotTypeBadge.style.background = '#DC2626';
        } else if (isQualityFilter) {
          dynamicLotTypeBadge.textContent = 'Punto de Calidad / Inspección';
          dynamicLotTypeBadge.style.background = '#D97706';
        } else if (isFinalLot) {
          dynamicLotTypeBadge.textContent = 'Empaque Final (Salida PT)';
          dynamicLotTypeBadge.style.background = '#16A34A';
        } else if (isMotherLot) {
          dynamicLotTypeBadge.textContent = 'Lote Madre (60 piezas)';
          dynamicLotTypeBadge.style.background = '#0284C7';
        } else {
          dynamicLotTypeBadge.textContent = `Sublote #${lot.sublotNum} (15 pzas)`;
          dynamicLotTypeBadge.style.background = 'var(--color-brand)';
        }
      }

      let optionsListHtml = '';

      if (isMotherLot && !isFinalLot) {
        optionsListHtml += `
          <div style="background:#FFFFFF; border:1px solid #BAE6FD; border-radius:8px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div>
              <strong style="color:#0369A1; font-size:13px;">⚙️ Modo Rampa (Fraccionamiento en 4 Sublotes)</strong>
              <div style="font-size:11.5px; color:#0284C7;">Dividir lote madre de 60 piezas en 4 sublotes trazables de 15 pzas (con tarjetas viajeras independientes).</div>
            </div>
            <span class="badge-status" style="background:#E0F2FE; color:#0369A1; font-weight:800; font-size:11px;">Disponible abajo</span>
          </div>
        `;
      }

      if (lot.hasScrap) {
        optionsListHtml += `
          <div style="background:#FEF2F2; border:1px solid #FCA5A5; border-radius:8px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div>
              <strong style="color:#B91C1C; font-size:13px;">⚠️ Contiene 1 Pieza No Conforme (${lot.scrapReason || 'Merma'})</strong>
              <div style="font-size:11.5px; color:#7F1D1D;">La pieza defectuosa viaja señalada en la torre hasta la inspección final o estación de segregación.</div>
            </div>
            <span class="badge-status" style="background:#FEE2E2; color:#B91C1C; font-weight:800; font-size:11px;">Advertencia</span>
          </div>
        `;
      }

      if (isQualityFilter || isQualityRole) {
        optionsListHtml += `
          <div style="background:#FFFBEB; border:1px solid #FCD34D; border-radius:8px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div>
              <strong style="color:#92400E; font-size:13px;">🛡️ Aprobación de Calidad / Decisión de Destino</strong>
              <div style="font-size:11.5px; color:#B45309;">El inspector valida especificaciones. Si rechaza, puede enviar a reproceso departamental o merma definitiva.</div>
            </div>
            <span class="badge-status" style="background:#FEF3C7; color:#92400E; font-weight:800; font-size:11px;">Acción de Calidad</span>
          </div>
        `;
      }

      if (isFinalLot) {
        optionsListHtml += `
          <div style="background:#F0FDF4; border:1px solid #86EFAC; border-radius:8px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div>
              <strong style="color:#15803D; font-size:13px;">📦 Cierre de Producción e Ingreso a Almacén PT</strong>
              <div style="font-size:11.5px; color:#166534;">Este lote ha completado la ruta productiva. El depósito sella la orden e ingresa al inventario de despacho.</div>
            </div>
            <span class="badge-status" style="background:#DCFCE7; color:#15803D; font-weight:800; font-size:11px;">Entrega Final</span>
          </div>
        `;
      }

      // Opción estándar presente en todo lote
      optionsListHtml += `
        <div style="background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:8px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <div>
            <strong style="color:var(--text-primary); font-size:13px;">➡️ Depósito a Buffer Siguiente (${lot.targetStationCode} ${lot.targetStationName})</strong>
            <div style="font-size:11.5px; color:var(--text-secondary);">Transfiere físicamente las ${lot.pieces || 15} piezas al pulmón del siguiente departamento con firma de operador.</div>
          </div>
          <span class="badge-status" style="background:var(--color-brand-light); color:var(--color-brand); font-weight:800; font-size:11px;">Flujo Estándar</span>
        </div>
      `;

      dynamicLotOptionsList.innerHTML = optionsListHtml;
    }

    // Modo Rampa visible exclusivamente si es lote madre
    const terminalRampaActionContainer = document.getElementById('terminalRampaActionContainer');
    if (terminalRampaActionContainer) {
      terminalRampaActionContainer.style.display = isMotherLot && !isFinalLot ? 'block' : 'none';
    }

    // Asegurar que el bloque de conclusión esté oculto al renderizar lote inicialmente
    const lotDepositSuccessWrap = document.getElementById('lotDepositSuccessWrap');
    const lotMainActionButtonsGroup = document.getElementById('lotMainActionButtonsGroup');
    if (lotDepositSuccessWrap && !lot._isDepositedJustNow) {
      lotDepositSuccessWrap.style.display = 'none';
    }
    if (lotMainActionButtonsGroup && !lot._isDepositedJustNow) {
      lotMainActionButtonsGroup.style.display = 'flex';
    }

    // Botón Principal de Depósito
    if (btnDepositToNextBuffer) {
      btnDepositToNextBuffer.textContent = `Depositar Lote en Almacén de ${lot.targetStationCode} ${lot.targetStationName}`;
    }
  }

  // Manejadores del Flujo de Calidad MVP
  const btnApproveQualityLot = document.getElementById('btnApproveQualityLot');
  const btnRejectQualityLot = document.getElementById('btnRejectQualityLot');
  const qualityDestinationPanel = document.getElementById('qualityDestinationPanel');
  const btnQualitySendRework = document.getElementById('btnQualitySendRework');
  const btnQualitySendScrap = document.getElementById('btnQualitySendScrap');

  if (btnApproveQualityLot) {
    btnApproveQualityLot.addEventListener('click', () => {
      if (!activeScannedLot) return;
      const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
      const res = UanifyState.advanceLot(activeScannedLot.lotId);
      if (res) {
        activeScannedLot = matchOrCreateLot({
          ...activeScannedLot,
          currentStationCode: res.targetStep.code,
          hasScrap: false
        });
        activeScannedLot._isDepositedJustNow = true;
        renderActiveScannedLotCard(activeScannedLot);
        renderPlantDepartmentsGrid();

        const lotDepositSuccessWrap = document.getElementById('lotDepositSuccessWrap');
        const lotMainActionButtonsGroup = document.getElementById('lotMainActionButtonsGroup');
        const lotDepositSuccessMessage = document.getElementById('lotDepositSuccessMessage');
        if (lotDepositSuccessWrap) lotDepositSuccessWrap.style.display = 'block';
        if (lotMainActionButtonsGroup) lotMainActionButtonsGroup.style.display = 'none';
        if (lotDepositSuccessMessage) {
          lotDepositSuccessMessage.textContent = `Lote APROBADO por Calidad (${user.name}). Avanzó a ${res.targetStep.code} ${res.targetStep.name}.`;
        }

        window.UanifyUI.toast(
          `¡Lote ${activeScannedLot.lotId} APROBADO por Calidad (${user.name})! Avanzó con éxito a ${res.targetStep.code} ${res.targetStep.name}.`,
          'success',
          'Lote Aprobado en Calidad'
        );
      }
    });
  }

  if (btnRejectQualityLot) {
    btnRejectQualityLot.addEventListener('click', () => {
      if (!activeScannedLot) return;
      if (qualityDestinationPanel) {
        qualityDestinationPanel.style.display = qualityDestinationPanel.style.display === 'none' ? 'block' : 'none';
      }
      window.UanifyUI.toast(
        `Lote ${activeScannedLot.lotId} marcado con NO CONFORMIDAD. Selecciona el destino correspondiente (Reproceso, Segunda o Merma).`,
        'warning',
        'Lote Rechazado en Inspección'
      );
    });
  }

  if (btnQualitySendRework) {
    btnQualitySendRework.addEventListener('click', () => {
      if (!activeScannedLot) return;
      const res = UanifyState.rewindLot(activeScannedLot.lotId);
      if (res) {
        activeScannedLot = matchOrCreateLot({
          ...activeScannedLot,
          currentStationCode: res.targetStep.code,
          hasScrap: true,
          scrapReason: 'Reproceso por defecto en acabado'
        });
        activeScannedLot._isDepositedJustNow = true;
        renderActiveScannedLotCard(activeScannedLot);
        renderPlantDepartmentsGrid();
        if (qualityDestinationPanel) qualityDestinationPanel.style.display = 'none';

        const lotDepositSuccessWrap = document.getElementById('lotDepositSuccessWrap');
        const lotMainActionButtonsGroup = document.getElementById('lotMainActionButtonsGroup');
        const lotDepositSuccessMessage = document.getElementById('lotDepositSuccessMessage');
        if (lotDepositSuccessWrap) lotDepositSuccessWrap.style.display = 'block';
        if (lotMainActionButtonsGroup) lotMainActionButtonsGroup.style.display = 'none';
        if (lotDepositSuccessMessage) {
          lotDepositSuccessMessage.textContent = `Lote retornado a ${res.targetStep.code} ${res.targetStep.name} para reproceso prioritario.`;
        }

        window.UanifyUI.toast(
          `Lote ${activeScannedLot.lotId} retornado a ${res.targetStep.code} ${res.targetStep.name} para reproceso prioritario.`,
          'warning',
          'Enviado a Reproceso'
        );
      }
    });
  }

  if (btnQualitySendScrap) {
    btnQualitySendScrap.addEventListener('click', () => {
      if (!activeScannedLot) return;
      const pzas = activeScannedLot.pieces || 15;
      activeScannedLot.hasScrap = true;
      activeScannedLot.scrapReason = 'Merma definitiva rechazada en inspección';
      UanifyState.scrapTotal = (UanifyState.scrapTotal || 0) + pzas;
      const scrapEl = document.getElementById('terminalScrap');
      if (scrapEl) scrapEl.textContent = `${UanifyState.scrapTotal} pzas`;

      // Registrar formalmente en Kárdex ALM-05
      const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
      if (!UanifyState.inventoryMovements) UanifyState.inventoryMovements = [];
      const newDocId = 'MER-' + Date.now().toString().slice(-4);
      UanifyState.inventoryMovements.unshift({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shift: 'Turno Único',
        type: 'Registro Merma Definitiva',
        originWh: activeScannedLot.currentStationCode || 'C-01',
        origin: activeScannedLot.currentStationName || 'Control de Calidad',
        destWh: 'ALM-05',
        dest: 'ALM-05 Merma & Segundas',
        item: `Lote ${activeScannedLot.lotId} (${activeScannedLot.model})`,
        qty: `${pzas} pzas`,
        user: user.name,
        doc: newDocId,
        notes: 'Rechazado en punto de inspección de calidad'
      });

      activeScannedLot._isDepositedJustNow = true;
      renderActiveScannedLotCard(activeScannedLot);
      renderPlantDepartmentsGrid();
      if (qualityDestinationPanel) qualityDestinationPanel.style.display = 'none';

      const lotDepositSuccessWrap = document.getElementById('lotDepositSuccessWrap');
      const lotMainActionButtonsGroup = document.getElementById('lotMainActionButtonsGroup');
      const lotDepositSuccessMessage = document.getElementById('lotDepositSuccessMessage');
      if (lotDepositSuccessWrap) lotDepositSuccessWrap.style.display = 'block';
      if (lotMainActionButtonsGroup) lotMainActionButtonsGroup.style.display = 'none';
      if (lotDepositSuccessMessage) {
        lotDepositSuccessMessage.textContent = `Lote clasificado como MERMA definitiva (${pzas} pzas) e ingresado a ALM-05 (Doc ${newDocId}).`;
      }

      window.UanifyUI.toast(
        `Lote ${activeScannedLot.lotId} clasificado como MERMA definitiva (${pzas} pzas). Registrado en Kárdex ALM-05 (Doc ${newDocId}).`,
        'danger',
        'Merma Registrada'
      );
    });
  }

  // Manejador de Registro de Piezas de Segunda (RF-80)
  const btnQualitySendSecond = document.getElementById('btnQualitySendSecond');
  if (btnQualitySendSecond) {
    btnQualitySendSecond.addEventListener('click', () => {
      if (!activeScannedLot) return;
      const segundasCount = 2; // Piezas segregadas por detalle menor
      const causa = 'Poro o deshilachado leve en telar';
      
      UanifyState.secondGradeTotal = (UanifyState.secondGradeTotal || 0) + segundasCount;
      if (terminalSecond) terminalSecond.textContent = `${UanifyState.secondGradeTotal} pzas`;
      
      if (activeScannedLot.pieces && activeScannedLot.pieces > segundasCount) {
        activeScannedLot.pieces -= segundasCount;
      }
      
      if (qualityDestinationPanel) qualityDestinationPanel.style.display = 'none';
      renderActiveScannedLotCard(activeScannedLot);

      // Registrar en historial Kárdex de Inventarios (ALM-05)
      const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
      if (!UanifyState.inventoryMovements) UanifyState.inventoryMovements = [];
      const newDocId = 'SEG-' + Date.now().toString().slice(-4);
      UanifyState.inventoryMovements.unshift({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shift: 'Turno Único',
        type: 'Segregación Segunda',
        originWh: activeScannedLot.currentStationCode || 'C-01',
        origin: activeScannedLot.currentStationName || 'Piso',
        destWh: 'ALM-05',
        dest: 'ALM-05 Merma & Segundas',
        item: `Lote ${activeScannedLot.lotId} (${activeScannedLot.model || 'Sombrero'})`,
        qty: `${segundasCount} pzas`,
        user: user.name,
        doc: newDocId,
        notes: `Causa: ${causa}`
      });

      window.UanifyUI.toast(
        `Se separaron ${segundasCount} piezas como SEGUNDA (Causa: ${causa}). Ingresadas a ALM-05. El lote continúa con ${activeScannedLot.pieces} piezas conformes.`,
        'warning',
        'Piezas de Segunda Registradas'
      );
    });
  }

  // ── MANEJADORES DE RETORNO Y NUEVO ESCANEO POST-DEPÓSITO ──
  const btnFinishLotAndScanNext = document.getElementById('btnFinishLotAndScanNext');
  const btnFinishLotGoHome      = document.getElementById('btnFinishLotGoHome');

  if (btnFinishLotAndScanNext) {
    btnFinishLotAndScanNext.addEventListener('click', () => {
      activeScannedLot = null;
      candidateScannedLot = null;
      if (terminalScannedLotActionsContainer) terminalScannedLotActionsContainer.style.display = 'none';
      if (terminalScannerEmptyState) terminalScannerEmptyState.style.display = 'none';
      openKioskScanner();
    });
  }

  if (btnFinishLotGoHome) {
    btnFinishLotGoHome.addEventListener('click', () => {
      finishLotSession();
      window.UanifyUI.toast('Consola de piso restablecida.', 'info', 'Operación Concluida');
    });
  }

  // ── MANEJADOR DE REGISTRO DE MERMA / DEFECTO DESDE EL LOTE ESCANEADO ──
  const btnScannedLotRegisterScrap = document.getElementById('btnScannedLotRegisterScrap');
  const modalScrap                 = document.getElementById('modalScrap');
  const btnCloseScrapModal         = document.getElementById('btnCloseScrapModal');
  const btnCancelScrapModal        = document.getElementById('btnCancelScrapModal');
  const btnSubmitScrapRecord       = document.getElementById('btnSubmitScrapRecord');
  const scrapModalLotBadge         = document.getElementById('scrapModalLotBadge');
  const scrapDispositionType       = document.getElementById('scrapDispositionType');
  const scrapPiecesCount           = document.getElementById('scrapPiecesCount');
  const scrapRootCauseSelect       = document.getElementById('scrapRootCauseSelect');
  const scrapNotesInput            = document.getElementById('scrapNotesInput');

  function openScrapModal() {
    if (!activeScannedLot) return;
    if (scrapModalLotBadge) {
      const folio = activeScannedLot.sublotNum ? `${activeScannedLot.lotId}-${activeScannedLot.sublotNum}` : activeScannedLot.lotId;
      scrapModalLotBadge.textContent = `Lote #${folio} (${activeScannedLot.model})`;
    }
    if (scrapPiecesCount) scrapPiecesCount.value = '1';
    if (scrapNotesInput) scrapNotesInput.value = '';
    if (modalScrap) modalScrap.classList.add('active');
  }

  function closeScrapModal() {
    if (modalScrap) modalScrap.classList.remove('active');
  }

  if (btnScannedLotRegisterScrap) {
    btnScannedLotRegisterScrap.addEventListener('click', openScrapModal);
  }

  if (btnCloseScrapModal) btnCloseScrapModal.addEventListener('click', closeScrapModal);
  if (btnCancelScrapModal) btnCancelScrapModal.addEventListener('click', closeScrapModal);

  if (btnSubmitScrapRecord) {
    btnSubmitScrapRecord.addEventListener('click', () => {
      if (!activeScannedLot) {
        closeScrapModal();
        return;
      }

      const disposition = scrapDispositionType ? scrapDispositionType.value : 'merma';
      const pieces = parseInt(scrapPiecesCount ? scrapPiecesCount.value : 1, 10) || 1;
      const rootCause = scrapRootCauseSelect ? scrapRootCauseSelect.value : 'Defecto de proceso';
      const notes = scrapNotesInput ? scrapNotesInput.value.trim() : '';
      const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];

      activeScannedLot.hasScrap = true;
      activeScannedLot.scrapReason = rootCause;
      activeScannedLot.scrapPieces = (activeScannedLot.scrapPieces || 0) + pieces;

      if (disposition === 'segunda') {
        UanifyState.secondGradeTotal = (UanifyState.secondGradeTotal || 0) + pieces;
        if (terminalSecond) terminalSecond.textContent = `${UanifyState.secondGradeTotal} pzas`;
      } else {
        UanifyState.scrapTotal = (UanifyState.scrapTotal || 0) + pieces;
        if (terminalScrap) terminalScrap.textContent = `${UanifyState.scrapTotal} pzas`;
      }

      // Registrar formalmente en Kárdex de Almacén y Control de Inventarios (ALM-05)
      if (!UanifyState.inventoryMovements) UanifyState.inventoryMovements = [];
      const newDocId = (disposition === 'segunda' ? 'SEG-' : 'MER-') + Date.now().toString().slice(-4);
      UanifyState.inventoryMovements.unshift({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shift: 'Turno Único',
        type: disposition === 'segunda' ? 'Segregación Segunda' : 'Registro Merma',
        originWh: activeScannedLot.currentStationCode || 'D-05',
        origin: activeScannedLot.currentStationName || 'Piso',
        destWh: 'ALM-05',
        dest: 'ALM-05 Merma & Segundas',
        item: `Lote ${activeScannedLot.lotId}${activeScannedLot.sublotNum ? '-' + activeScannedLot.sublotNum : ''} (${activeScannedLot.model})`,
        qty: `${pieces} pza${pieces > 1 ? 's' : ''}`,
        user: user.name,
        doc: newDocId,
        notes: notes ? `${rootCause} · Nota: ${notes}` : rootCause
      });

      renderActiveScannedLotCard(activeScannedLot);
      renderPlantDepartmentsGrid();
      closeScrapModal();

      window.UanifyUI.toast(
        `Defecto registrado (${pieces} pza${pieces > 1 ? 's' : ''} - ${rootCause}). Guardado en bitácora e inventario de merma ALM-05 (Doc ${newDocId}).`,
        disposition === 'segunda' ? 'warning' : 'danger',
        disposition === 'segunda' ? 'Segunda Registrada' : 'Merma Registrada'
      );
    });
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
        const myDeptNames = user.assignedDepartments.map(c => {
          const st = (UanifyState.stations || []).find(s => s.code === c);
          return st ? st.name : c;
        }).join(', ');
        window.UanifyUI.toast(
          `No tienes autorización para trasladar este lote. Se encuentra en ${activeScannedLot.currentStationName}, pero tus departamentos asignados son: ${myDeptNames}.`,
          'warning',
          'Restricción de Supervisor'
        );
        return;
      }

      // Disparo dinámico de inicio de turno si no se había disparado
      if (UanifyState.shiftSchedule && UanifyState.shiftSchedule.mode !== 'fixed') {
        UanifyState.recordShiftFirstScan(activeScannedLot.lotId);
      }

      // Obtener Operador Seleccionado (Rastreabilidad Universal Obligatoria)
      const depositOperatorSelect = document.getElementById('depositOperatorSelect');
      const chosenOperator = depositOperatorSelect ? depositOperatorSelect.value : (activeScannedLot.operator || 'Operador de Turno');

      // Asignar al lote
      activeScannedLot.operator = chosenOperator;
      activeScannedLot.operatorSticker = chosenOperator.split(' (')[0];

      if (!activeScannedLot.history) activeScannedLot.history = [];
      activeScannedLot.history.push({
        timestamp: new Date().toISOString(),
        stationCode: currentStationCode,
        stationName: activeScannedLot.currentStationName,
        operator: chosenOperator,
        pieces: activeScannedLot.pieces || 15
      });

      // Incrementar piezas al destajo del operador en el Padrón si coincide
      if (UanifyState.operators) {
        const matchedOp = UanifyState.operators.find(op => 
          chosenOperator.includes(op.payrollNumber) || chosenOperator.includes(op.name)
        );
        if (matchedOp) {
          matchedOp.piecesToday = (matchedOp.piecesToday || 0) + (activeScannedLot.pieces || 15);
        }
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
          operator: chosenOperator,
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
        activeScannedLot._isDepositedJustNow = true;
        renderActiveScannedLotCard(activeScannedLot);

        // Desplegar panel de conclusión con opciones aisladas
        const lotDepositSuccessWrap = document.getElementById('lotDepositSuccessWrap');
        const lotMainActionButtonsGroup = document.getElementById('lotMainActionButtonsGroup');
        const lotDepositSuccessMessage = document.getElementById('lotDepositSuccessMessage');
        if (lotDepositSuccessWrap) lotDepositSuccessWrap.style.display = 'block';
        if (lotMainActionButtonsGroup) lotMainActionButtonsGroup.style.display = 'none';
        if (lotDepositSuccessMessage) {
          lotDepositSuccessMessage.textContent = `Lote transferido con éxito al almacén de "${activeScannedLot.currentStationName}". Operador: ${chosenOperator}. Firma: ${user.name}.`;
        }

        // Refrescar mapa de planta y almacenes
        renderPlantDepartmentsGrid();

        window.UanifyUI.toast(
          `¡Lote ${activeScannedLot.lotId} depositado con éxito! Se encuentra listo en el almacén de entrada de "${activeScannedLot.currentStationName}".`,
          'success',
          'Depósito en Almacén Concluido'
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

  // ── 8. MAPA GENERAL DE ALMACENES FÍSICOS & PULMONES WIP (CENTRADOS EN ALMACENES) ──────
  function renderPlantDepartmentsGrid() {
    if (!plantDepartmentsGrid) return;
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const myDepts = user.assignedDepartments || ['*'];
    const isSuperUser = myDepts.includes('*') || user.role === 'admin' || user.role === 'ingeniero';

    // VISTA UNIFICADA: TODOS LOS ALMACENES Y PULMONES INTERMEDIOS DE PLANTA AL MISMO NIVEL
    const stations = UanifyState.stations || [];
    plantDepartmentsGrid.innerHTML = stations.map(st => {
      const isAssigned = isSuperUser || myDepts.includes(st.code);
      const lotCount = countLotsAtStation(st.code);
      const scrapWarningCount = countScrapLotsAtStation(st.code);
      const isQuality = st.type === 'calidad' || (st.code && st.code.startsWith('C-'));

      return `
        <div class="dept-plant-card ${isAssigned ? 'is-assigned-to-me' : ''}" onclick="window.openDeptWarehouseModal('${st.code}')" style="cursor:pointer;" title="Toca para auditar almacén de ${st.name}">
          <div class="dept-card-header">
            <div>
              <span class="dept-code-tag">${st.code || 'ALM'} · ${isQuality ? 'Calidad' : 'Almacén WIP'}</span>
              <h4 class="dept-name-heading">${st.name}</h4>
              <span style="font-size:11px; color:var(--text-muted); display:block; margin-top:2px;">📍 ${st.intermediateWarehouse || 'Área de Proceso'}</span>
            </div>
            ${isAssigned ? `<span class="dept-assigned-badge">Mi Asignación</span>` : ''}
          </div>

          <div class="dept-card-stats">
            <div class="dept-card-stat-item">
              <span class="dept-card-stat-val">${lotCount.lots}</span>
              <span class="dept-card-stat-lbl">Lotes en Stock</span>
            </div>
            <div class="dept-card-stat-item">
              <span class="dept-card-stat-val">${lotCount.pieces} pzas</span>
              <span class="dept-card-stat-lbl">Piezas en Tránsito</span>
            </div>
          </div>

          ${scrapWarningCount > 0 ? `
            <div style="font-size:11px; color:#B91C1C; background:#FEF2F2; padding:4px 8px; border-radius:6px; margin-bottom:8px; font-weight:700;">
              ⚠️ ${scrapWarningCount} lote(s) con merma
            </div>
          ` : ''}

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-size:11px; color:var(--text-secondary); font-weight:600;">Capacidad: ${st.wipCapacity || 150} pzas</span>
            <span style="font-size:12px; font-weight:800; color:var(--color-brand);">Auditar Almacén ↗</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function getLotsInWarehouse(whCode) {
    const list = [];
    (UanifyState.activeLots || []).forEach(l => {
      if (whCode === 'ALM-02' && (l.currentStationCode === 'D-04' || l.currentStationCode === 'D-05' || !l.currentStationCode)) {
        list.push(l);
      } else if (whCode === 'ALM-03' && (l.currentStationCode === 'D-02' || l.currentStationCode === 'D-03')) {
        list.push(l);
      } else if (whCode === 'ALM-04' && (l.currentStationCode === 'D-10' || l.currentStationCode === 'D-11' || l.currentStationCode === 'PT')) {
        list.push(l);
      } else if (whCode === 'ALM-05' && l.hasScrap) {
        list.push(l);
      } else if (whCode === 'ALM-01' && (l.currentStationCode === 'D-01' || !l.currentStationCode)) {
        list.push(l);
      }
    });

    if (list.length === 0) {
      if (whCode === 'ALM-02') {
        list.push({ lotId: '49386', model: 'Chaparral', pieces: 60, operator: 'Pedro Morales', hasScrap: false });
        list.push({ lotId: '49633-1', model: 'Viejonón', pieces: 15, operator: 'Jorge', hasScrap: false });
      } else if (whCode === 'ALM-03') {
        list.push({ lotId: '49633-3', model: 'Viejonón', pieces: 15, operator: 'Jorge Ramírez', hasScrap: false });
      } else if (whCode === 'ALM-05') {
        list.push({ lotId: '49842', model: 'Magnum', pieces: 15, operator: 'Melany', hasScrap: true, scrapReason: 'Quemado por vapor' });
      } else {
        list.push({ lotId: '49720-1', model: 'Denver', pieces: 15, operator: 'Carmen', hasScrap: false });
      }
    }
    return list;
  }

  window.openPhysicalWarehouseModal = function(whCode) {
    const whMap = {
      'ALM-01': 'D-01',
      'ALM-02': 'D-04',
      'ALM-03': 'D-05',
      'ALM-04': 'D-10',
      'ALM-05': 'D-06'
    };
    const deptMapped = whMap[whCode] || 'D-05';
    window.openDeptWarehouseModal(deptMapped);
  };

  function countLotsAtStation(code) {
    let lots = 0;
    let pieces = 0;

    (UanifyState.activeLots || []).forEach(l => {
      if (l.currentStationCode === code || (code === 'D-05' && !l.currentStationCode)) {
        lots++;
        pieces += (l.pieces || 15);
      }
    });

    (UanifyState.bufferReadyLots || []).forEach(b => {
      if (b.originDeptCode === code || b.targetDeptCode === code) {
        lots++;
        pieces += (b.pieces || 15);
      }
    });

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

  // ── 9. MODAL DE ALMACÉN INTERMEDIO POR DEPARTAMENTO ───────────────────────
  window.openDeptWarehouseModal = function(deptCode) {
    currentInspectedWarehouseDept = deptCode;
    const st = UanifyState.stations.find(s => s.code === deptCode) || { code: deptCode, name: 'Departamento' };

    if (deptWarehouseModalTitle) {
      deptWarehouseModalTitle.textContent = `Almacén Intermedio · ${st.name}`;
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
        targetDept: 'Recorte y Alambrado',
        hasScrap: false
      });
      lotsList.push({
        folio: '49,386',
        sublotNum: null,
        model: 'CHAPARRAL',
        clase: '1,000X MASTER TELAR',
        pieces: 60,
        operator: 'Pedro Morales',
        targetDept: 'Prensas de Hormado',
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
        <td>→ ${item.targetDept}</td>
        <td>
          ${item.hasScrap 
            ? `<span style="color:#B91C1C; font-weight:800; font-size:11.5px;"> Sombrero Merma</span>` 
            : `<span style="color:#16A34A; font-weight:700; font-size:11.5px;">OK Íntegro</span>`}
        </td>
        <td>
          <button type="button" class="btn-secondary btn-table-action" onclick="window.inspectSpecificLotCard('${item.folio}')">
            Ver Tarjeta
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
      trackerCurrentStationBadge.innerHTML = `UBICACIÓN ACTUAL: ${currentStep.code} ${currentStep.name}`;
      trackerCurrentStationBadge.style.background = currentStep.type === 'calidad' ? '#D97706' : 'var(--color-brand)';
    }
    if (trackerNextStationText) {
      trackerNextStationText.innerHTML = nextStep 
        ? `Próxima Parada: <strong>${nextStep.code} ${nextStep.name}</strong>`
        : `<strong style="color:var(--color-green);"> Ruta Finalizada · Listo para Entrega</strong>`;
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
      let stateFooter = 'En espera';
      if (idx < currentIdx) {
        stateClass = 'is-completed';
        stateFooter = 'OK Superado';
      } else if (idx === currentIdx) {
        stateClass = 'is-current';
        stateFooter = `<span class="timeline-current-pill"> AQUÍ (${lot.pieces} pz)</span>`;
      }

      const isQuality = st.type === 'calidad' || st.isQualityStop || st.code.startsWith('C-');
      const isLogistics = st.type === 'logistica' || st.code === 'D-11';
      let typeLabel = isQuality ? ' Calidad' : isLogistics ? ' Logística' : ' Manufactura';

      return `
        <div class="timeline-step-node ${stateClass} ${isQuality ? 'is-quality' : ''}" data-step-index="${idx}">
          <div class="timeline-step-head">
            <span class="timeline-step-number">#${idx + 1}</span>
            <span class="timeline-step-type-badge">${typeLabel}</span>
          </div>
          <div class="timeline-step-body">
            <div class="timeline-step-name" style="font-weight:700; font-size:13.5px; color:var(--text-primary);">${st.name}</div>
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
      const myDeptNames = user.assignedDepartments.map(c => {
        const st = (UanifyState.stations || []).find(s => s.code === c);
        return st ? st.name : c;
      }).join(', ');
      window.UanifyUI.toast(
        `Solo puedes mover lotes de tus departamentos asignados (${myDeptNames}). Este lote pertenece a ${lot.currentStationName || lot.currentStation || 'otra estación'}.`,
        'warning',
        'Restricción de Supervisor'
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
          '>> Lote Avanzado'
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
          '<< Lote Reubicado'
        );
      }
    });
  }

  // ── 11. MODO FRACCIONAMIENTO EN RAMPA (STEPPER INDUSTRIAL & CAMBIO DE TARJETAS) ────
  const btnActivateRampaMode           = document.getElementById('btnActivateRampaMode');
  const modalRampaFraccionamiento      = document.getElementById('modalRampaFraccionamiento');
  const btnCloseRampaModal             = document.getElementById('btnCloseRampaModal');
  const btnCancelRampaModal            = document.getElementById('btnCancelRampaModal');
  const btnRampaBackToStep1            = document.getElementById('btnRampaBackToStep1');
  const btnRampaFinishScanning         = document.getElementById('btnRampaFinishScanning');
  const btnExecuteRampaFraccionamiento = document.getElementById('btnExecuteRampaFraccionamiento');
  const rampaBatchQrInput              = document.getElementById('rampaBatchQrInput');
  const btnAddLotToRampaBatch          = document.getElementById('btnAddLotToRampaBatch');
  const btnRampaScanCamera             = document.getElementById('btnRampaScanCamera');
  const rampaBatchQueueContainer       = document.getElementById('rampaBatchQueueContainer');
  const rampaBatchCountText            = document.getElementById('rampaBatchCountText');
  const rampaBatchTotalPiecesText      = document.getElementById('rampaBatchTotalPiecesText');
  const rampaStep2SummaryList          = document.getElementById('rampaStep2SummaryList');
  const rampaOperatorSelect            = document.getElementById('rampaOperatorSelect');

  // Elementos del Stepper de Rampa
  const rampaStepperStep1              = document.getElementById('rampaStepperStep1');
  const rampaStepperStep2              = document.getElementById('rampaStepperStep2');
  const rampaStepContent1              = document.getElementById('rampaStepContent1');
  const rampaStepContent2              = document.getElementById('rampaStepContent2');

  let currentRampaStep = 1;

  // Cola de Lotes Madre Escaneados en Rampa
  let rampaMotherBatchQueue = [
    { lotId: '49386', model: '1000X Chaparral', pieces: 60, station: 'D-04', order: 'OP-15068' }
  ];

  function renderRampaBatchQueue() {
    if (!rampaBatchQueueContainer) return;
    
    if (rampaMotherBatchQueue.length === 0) {
      rampaBatchQueueContainer.innerHTML = `
        <div style="text-align:center; padding:18px; color:var(--text-muted); font-size:12.5px;">
          No hay lotes en la sesión. Escanea o ingresa el número de Lote Madre para agregarlo.
        </div>
      `;
      if (rampaBatchCountText) rampaBatchCountText.textContent = '0 lotes';
      if (rampaBatchTotalPiecesText) rampaBatchTotalPiecesText.textContent = 'Total: 0 piezas';
      return;
    }

    const totalPieces = rampaMotherBatchQueue.reduce((acc, l) => acc + (l.pieces || 60), 0);
    if (rampaBatchCountText) {
      rampaBatchCountText.textContent = `${rampaMotherBatchQueue.length} ${rampaMotherBatchQueue.length === 1 ? 'lote' : 'lotes'}`;
    }
    if (rampaBatchTotalPiecesText) {
      rampaBatchTotalPiecesText.textContent = `Total: ${totalPieces} piezas`;
    }

    rampaBatchQueueContainer.innerHTML = rampaMotherBatchQueue.map((lot, idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:8px; padding:10px 14px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-family:'JetBrains Mono', monospace; font-weight:800; font-size:14px; color:var(--color-brand);">${lot.lotId}</span>
          <span class="badge-subtle" style="font-weight:700;">${lot.model}</span>
          <span style="font-size:12px; color:var(--text-secondary);">${lot.pieces} pzas (${lot.order || 'OP'})</span>
        </div>
        <button type="button" class="btn-secondary" onclick="window.removeLotFromRampaBatch(${idx})" style="padding:4px 10px; font-size:11px; color:#DC2626; border-color:#FCA5A5; height:30px;">
          ✕ Quitar
        </button>
      </div>
    `).join('');
  }

  function renderRampaStep2Summary() {
    if (!rampaStep2SummaryList) return;
    if (rampaMotherBatchQueue.length === 0) {
      rampaStep2SummaryList.innerHTML = `
        <div style="text-align:center; padding:12px; color:var(--text-muted); font-size:12px;">
          No hay lotes escaneados en esta sesión.
        </div>
      `;
      return;
    }

    rampaStep2SummaryList.innerHTML = rampaMotherBatchQueue.map(m => `
      <div style="background:#FFFFFF; border:1px solid var(--border-medium); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-family:'JetBrains Mono', monospace; font-weight:800; color:var(--color-brand); font-size:13px;">Lote Madre: ${m.lotId}</span>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
            Modelo: <strong>${m.model}</strong> · ${m.order || 'OP-15068'}
          </div>
        </div>
        <div style="text-align:right;">
          <span class="badge-subtle" style="background:#FEF3C7; color:#92400E; font-weight:800;">
            4 Sublotes (15 pzas c/u)
          </span>
          <div style="font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted); margin-top:2px;">
            ${m.lotId}-1, ${m.lotId}-2, ${m.lotId}-3, ${m.lotId}-4
          </div>
        </div>
      </div>
    `).join('');
  }

  window.removeLotFromRampaBatch = function(index) {
    rampaMotherBatchQueue.splice(index, 1);
    renderRampaBatchQueue();
  };

  function goToRampaStep(stepNum) {
    if (stepNum === 2 && rampaMotherBatchQueue.length === 0) {
      window.UanifyUI.toast('Debes escanear al menos un lote madre en la sesión para continuar.', 'warning');
      return;
    }

    currentRampaStep = stepNum;

    // Actualizar estados visuales del Stepper
    if (rampaStepperStep1) {
      rampaStepperStep1.classList.remove('active', 'completed');
      if (stepNum === 1) rampaStepperStep1.classList.add('active');
      else rampaStepperStep1.classList.add('completed');
    }
    if (rampaStepperStep2) {
      rampaStepperStep2.classList.remove('active', 'completed');
      if (stepNum === 2) rampaStepperStep2.classList.add('active');
    }

    // Alternar paneles de contenido
    if (rampaStepContent1) rampaStepContent1.style.display = (stepNum === 1) ? 'block' : 'none';
    if (rampaStepContent2) rampaStepContent2.style.display = (stepNum === 2) ? 'block' : 'none';

    // Manejar visibilidad de botones del footer
    if (btnCancelRampaModal) btnCancelRampaModal.style.display = (stepNum === 1) ? 'inline-flex' : 'none';
    if (btnRampaBackToStep1) btnRampaBackToStep1.style.display = (stepNum === 2) ? 'inline-flex' : 'none';
    if (btnRampaFinishScanning) btnRampaFinishScanning.style.display = (stepNum === 1) ? 'inline-flex' : 'none';
    if (btnExecuteRampaFraccionamiento) btnExecuteRampaFraccionamiento.style.display = (stepNum === 2) ? 'inline-flex' : 'none';

    if (stepNum === 2) {
      renderRampaStep2Summary();
    }
  }
  window.goToRampaStep = goToRampaStep;

  if (btnRampaFinishScanning) {
    btnRampaFinishScanning.addEventListener('click', () => goToRampaStep(2));
  }
  if (btnRampaBackToStep1) {
    btnRampaBackToStep1.addEventListener('click', () => goToRampaStep(1));
  }

  function addLotToRampaBatchByQuery(query) {
    const cleanId = String(query).trim().replace(/^TB\|/i, '').split('|')[0] || query;
    if (!cleanId) return;

    // Validación 1: Verificar si ya está en la sesión
    if (rampaMotherBatchQueue.some(l => l.lotId === cleanId)) {
      window.UanifyUI.toast(`El lote ${cleanId} ya fue escaneado en esta sesión.`, 'info');
      return;
    }

    // Validación 2: Buscar lote en el sistema
    const knownLot = (UanifyState.activeLots || []).find(l => l.lotId === cleanId || l.lotId.replace(/,/g, '') === cleanId.replace(/,/g, ''));
    
    // Validación 3: Permisos del usuario actual sobre el departamento o lote
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const isSuperUser = user.role === 'admin' || user.role === 'ingeniero';
    const userDepts = user.assignedDepartments || [];
    
    const lotStation = knownLot ? (knownLot.currentStationCode || 'D-04') : 'D-04';

    // Si el usuario no tiene acceso al departamento de Rampa (D-04 / D-05) ni es admin/ingeniero, mostrar alerta clara
    if (!isSuperUser && !userDepts.includes('*') && !userDepts.includes('D-04') && !userDepts.includes('D-05') && !userDepts.includes(lotStation)) {
      window.UanifyUI.toast(
        `⛔ No tienes permisos para operar en Rampa. Tu usuario (${user.name}) tiene asignadas las áreas: [${userDepts.join(', ') || 'Sin Asignar'}].`,
        'error',
        'Permiso Denegado'
      );
      return;
    }

    const modelName = knownLot ? (knownLot.model || '1000X Master Telar') : (cleanId === '49633' ? 'Viejonón 1000X' : cleanId === '49842' ? 'Magnum' : 'Chaparral');
    const pieces = knownLot ? (knownLot.pieces || 60) : 60;

    rampaMotherBatchQueue.push({
      lotId: cleanId,
      model: modelName,
      pieces: pieces,
      station: lotStation,
      order: knownLot ? (knownLot.oProd || 'OP-15071') : 'OP-15071'
    });

    if (rampaBatchQrInput) rampaBatchQrInput.value = '';
    renderRampaBatchQueue();

    window.UanifyUI.toast(`Lote Madre ${cleanId} escaneado correctamente (${rampaMotherBatchQueue.length} en la sesión).`, 'success');
  }

  if (btnAddLotToRampaBatch) {
    btnAddLotToRampaBatch.addEventListener('click', () => {
      const val = rampaBatchQrInput ? rampaBatchQrInput.value.trim() : '';
      if (!val) {
        window.UanifyUI.toast('Escanea o escribe el número de lote madre para agregarlo.', 'warning');
        return;
      }
      addLotToRampaBatchByQuery(val);
    });
  }

  if (rampaBatchQrInput) {
    rampaBatchQrInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = rampaBatchQrInput.value.trim();
        if (val) addLotToRampaBatchByQuery(val);
      }
    });
  }

  if (btnRampaScanCamera) {
    btnRampaScanCamera.addEventListener('click', () => {
      window.UanifyUI.toast('Apunta la cámara al código QR de la tarjeta del lote madre en Rampa.', 'info');
      if (typeof window.openKioskScanner === 'function') {
        window.openKioskScanner();
      }
    });
  }

  window.openRampaFraccionamientoMode = function(optionalLotId) {
    if (optionalLotId) {
      if (!rampaMotherBatchQueue.some(l => l.lotId === optionalLotId)) {
        addLotToRampaBatchByQuery(optionalLotId);
      }
    }
    goToRampaStep(1);
    renderRampaBatchQueue();

    if (modalRampaFraccionamiento) {
      modalRampaFraccionamiento.style.display = 'flex';
      setTimeout(() => {
        if (rampaBatchQrInput) rampaBatchQrInput.focus();
      }, 100);
    }
  };

  if (btnActivateRampaMode) {
    btnActivateRampaMode.addEventListener('click', () => {
      window.openRampaFraccionamientoMode();
    });
  }

  const btnHeroActivateRampa = document.getElementById('btnHeroActivateRampa');
  if (btnHeroActivateRampa) {
    btnHeroActivateRampa.addEventListener('click', () => {
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

  // Ejecución masiva de cambio de tarjetas al finalizar la sesión
  if (btnExecuteRampaFraccionamiento) {
    btnExecuteRampaFraccionamiento.addEventListener('click', () => {
      if (rampaMotherBatchQueue.length === 0) {
        window.UanifyUI.toast('Debes escanear al menos un lote madre en la sesión.', 'warning');
        return;
      }

      const selectedOp = rampaOperatorSelect ? rampaOperatorSelect.value : 'JORGE';
      const pzasPerSublot = 15;
      const countLots = rampaMotherBatchQueue.length;
      let totalNewSublots = 0;

      // Procesar cada lote madre en la cola
      rampaMotherBatchQueue.forEach(m => {
        const cleanId = m.lotId;
        const totalPzas = m.pieces || 60;
        const numSublots = 4;
        totalNewSublots += numSublots;

        // Marcar en estado global si existe
        const existing = (UanifyState.lots || []).find(l => l.lotId === cleanId);
        if (existing) {
          existing.isSubdivided = true;
        }

        // Generar y agregar sublotes a la lista activa
        for (let s = 1; s <= numSublots; s++) {
          const sublotId = `${cleanId}-${s}`;
          const newSublot = {
            lotId: sublotId,
            motherLotId: cleanId,
            sublotNum: s,
            totalSublots: numSublots,
            pieces: pzasPerSublot,
            clase: '1000X MASTER TELAR',
            model: m.model,
            currentStationCode: 'D-05',
            currentStationName: 'Prensas de Hormado',
            targetStationCode: 'D-06',
            targetStationName: 'Pintura y Acabados',
            operator: `${selectedOp} (Prensas)`,
            operatorSticker: selectedOp,
            hasScrap: false,
            isSubdivided: true
          };
          
          if (!UanifyState.activeLots.some(l => l.lotId === sublotId)) {
            UanifyState.activeLots.push(newSublot);
          }
        }
      });

      // Poner el primer sublote del primer lote procesado en terminal
      const firstMother = rampaMotherBatchQueue[0];
      activeScannedLot = (UanifyState.activeLots || []).find(l => l.lotId === `${firstMother.lotId}-1`) || {
        lotId: `${firstMother.lotId}-1`,
        model: firstMother.model,
        pieces: pzasPerSublot,
        currentStationCode: 'D-05',
        currentStationName: 'Prensas de Hormado',
        targetStationCode: 'D-06',
        targetStationName: 'Pintura y Acabados',
        operator: selectedOp
      };

      // Limpiar cola tras procesar
      const processedCount = rampaMotherBatchQueue.length;
      rampaMotherBatchQueue = [];
      closeRampaModal();

      renderPlantDepartmentsGrid();
      if (terminalScannerEmptyState) terminalScannerEmptyState.style.display = 'none';
      if (terminalScannedLotActionsContainer) terminalScannedLotActionsContainer.style.display = 'block';
      renderActiveScannedLotCard(activeScannedLot);

      window.UanifyUI.toast(
        `Tarjetas cambiadas con éxito: ${processedCount} lotes madre divididos en ${totalNewSublots} torres de 15 piezas. Listos para continuar a Prensas.`,
        'success',
        'Cambio de Tarjetas Concluido'
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
          <span style="font-size:32px;"></span>
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
                <span class="buffer-route-arrow">→</span>
                <span>Destino: <strong style="color:var(--color-brand);">${item.targetDeptCode}</strong></span>
              </div>
              <span class="buffer-lot-tag">Folio ${item.lotId}</span>
            </div>
            <span class="buffer-time-badge">Esperando ${item.waitingMinutes}m</span>
          </div>

          <div class="buffer-lot-meta">
            <div><strong>${item.pieces} Sombreros</strong> · ${item.model}</div>
            <div style="color:var(--text-muted); font-size:11.5px; margin-top:2px;">
              De: ${item.originDeptName} → Para: ${item.targetDeptName}
            </div>
            <div style="margin-top:6px; font-size:11px; background:rgba(0,0,0,0.03); padding:6px 8px; border-radius:6px; font-style:italic;">
              "${item.notes}"
            </div>
          </div>

          <div class="buffer-actions-row">
            <button class="btn-primary btn-touch-lg" style="flex:1;" onclick="window.collectBufferLot('${item.id}')">
               Recoger Lote (${item.pieces} pzas)
            </button>
            <button class="btn-secondary btn-touch-lg" style="padding:8px 12px;" onclick="window.inspectSpecificLotCard('${item.lotId}')" title="Ver en Visor">
              
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
          ' Lote Recolectado'
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
        const deptNames = user.assignedDepartments.map(code => {
          const s = UanifyState.stations.find(st => st.code === code);
          return s ? s.name : code;
        }).join(', ');
        supervisorDeptsBadge.textContent = `Mis Departamentos Asignados: ${deptNames}`;
      }
    } else {
      if (supervisorDeptsBadge) {
        supervisorDeptsBadge.textContent = `Acceso Global: Todas las Estaciones de Planta`;
      }
    }

    if (workflowDeptSelect) {
      workflowDeptSelect.innerHTML = allowedStations.map(st => `
        <option value="${st.code}">${st.name}</option>
      `).join('');
      populateMachinesAndOperators();
    }

    if (transferOriginDept) {
      transferOriginDept.innerHTML = UanifyState.stations.map(st => `
        <option value="${st.code}">${st.name}</option>
      `).join('');
    }
    if (transferDestDept) {
      transferDestDept.innerHTML = UanifyState.stations.slice(1).map(st => `
        <option value="${st.code}">${st.name}</option>
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
        'Trabajo en Máquina Concluido'
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
        ' Traspaso Confirmado'
      );
    });
  }

  // ── 14. INICIALIZACIÓN GENERAL ─────────────────────────────────────────────
  // Inicialmente solo el escáner está accesible; las opciones y acciones se revelan tras leer el QR
  if (terminalScannerEmptyState) terminalScannerEmptyState.style.display = 'block';
  if (terminalScannedLotActionsContainer) terminalScannedLotActionsContainer.style.display = 'none';

  renderPlantDepartmentsGrid();

  // Sincronizar cuando cambie de usuario en el sistema
  EventBus.on('user-switched', () => {
    const user = UanifyState.users.find(u => u.id === UanifyState.currentUser) || UanifyState.users[0];
    const banner = document.getElementById('terminalSupervisorBanner');
    const badge = document.getElementById('terminalDeptsCountBadge');
    if (banner) {
      banner.textContent = `Supervisor Activo: ${user.name} (${user.roleName})`;
    }
    if (badge) {
      if (user.role === 'admin' || user.role === 'ingeniero') {
        badge.textContent = 'Áreas Asignadas: Toda la Planta (Auditor)';
      } else if (user.assignedDepartments && user.assignedDepartments.length > 0) {
        badge.textContent = `Áreas Asignadas: ${user.assignedDepartments.join(', ')}`;
      } else {
        badge.textContent = 'Áreas Asignadas: Línea Principal';
      }
    }
    renderPlantDepartmentsGrid();
  });

  // ── SISTEMA INTEGRAL DE PARO DE LÍNEA: STEPPER, CRONÓMETRO Y WIDGET FLOTANTE (RF-92) ──
  const modalStop = document.getElementById('modalStop');
  const btnCloseStopModal = document.getElementById('btnCloseStopModal');
  const stopOptBtns = document.querySelectorAll('.stop-opt-btn');

  // Elementos del Stepper
  const stepperStep1 = document.getElementById('stepperStep1');
  const stepperStep2 = document.getElementById('stepperStep2');
  const stepperStep3 = document.getElementById('stepperStep3');
  const stopStepContent1 = document.getElementById('stopStepContent1');
  const stopStepContent2 = document.getElementById('stopStepContent2');
  const stopStepContent3 = document.getElementById('stopStepContent3');

  // Selectores y campos
  const stopDeptSelect = document.getElementById('stopDeptSelect');
  const stopMachineSelect = document.getElementById('stopMachineSelect');
  const stopNotesInput = document.getElementById('stopNotesInput');
  const stopImpactSelect = document.getElementById('stopImpactSelect');
  const stopConfirmDeptText = document.getElementById('stopConfirmDeptText');
  const stopConfirmMachText = document.getElementById('stopConfirmMachText');
  const stopConfirmCauseText = document.getElementById('stopConfirmCauseText');

  // Botones de acción del modal
  const btnStopBackStep = document.getElementById('btnStopBackStep');
  const btnStopNextToStep2 = document.getElementById('btnStopNextToStep2');
  const btnStartDowntimeTimer = document.getElementById('btnStartDowntimeTimer');
  const btnMinimizeStopModal = document.getElementById('btnMinimizeStopModal');
  const btnFinishDowntimeStop = document.getElementById('btnFinishDowntimeStop');

  // Display de cronómetro y detalles
  const modalStopTimerDisplay = document.getElementById('modalStopTimerDisplay');
  const modalStopStartTime = document.getElementById('modalStopStartTime');
  const modalStopStation = document.getElementById('modalStopStation');
  const modalStopCause = document.getElementById('modalStopCause');
  const modalStopUser = document.getElementById('modalStopUser');

  // Widget flotante global
  const globalActiveDowntimeWidget = document.getElementById('globalActiveDowntimeWidget');
  const floatingDowntimeTime = document.getElementById('floatingDowntimeTime');
  const floatingDowntimeMeta = document.getElementById('floatingDowntimeMeta');

  let currentStopStep = 1;
  let selectedStopCause = 'Cambio de horma / molde (SMED)';
  let activeDowntimeTimerInterval = null;

  // Poblar selectores de departamentos y máquinas
  function populateStopDeptSelect() {
    if (!stopDeptSelect || !window.UanifyState || !window.UanifyState.stations) return;
    stopDeptSelect.innerHTML = window.UanifyState.stations.map(st => `
      <option value="${st.code}">${st.code} - ${st.name}</option>
    `).join('');

    populateStopMachineSelect();
  }

  function populateStopMachineSelect() {
    if (!stopMachineSelect || !stopDeptSelect) return;
    const selectedDeptCode = stopDeptSelect.value;
    const dept = (window.UanifyState.stations || []).find(s => s.code === selectedDeptCode);
    
    // Buscar en UanifyState.processes primero
    const deptProcs = (window.UanifyState.processes || []).filter(p => p.deptCode === selectedDeptCode);
    let machOptions = [];
    deptProcs.forEach(p => {
      (p.machines || []).forEach(m => {
        if (m && m.id) machOptions.push(`${m.id} ${m.name}`);
      });
    });

    if (machOptions.length === 0 && dept && dept.machines) {
      machOptions = dept.machines.split(/[,;]/).map(m => m.trim()).filter(Boolean);
    }
    if (machOptions.length === 0) {
      machOptions = [`MAQ-01 Celda de ${dept ? dept.name : 'Trabajo'}`];
    }

    stopMachineSelect.innerHTML = machOptions.map(m => `
      <option value="${m}">${m}</option>
    `).join('');
  }

  if (stopDeptSelect) {
    stopDeptSelect.addEventListener('change', populateStopMachineSelect);
  }

  // Selección de motivo de paro en Paso 1
  stopOptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stopOptBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedStopCause = btn.getAttribute('data-stop') || 'Ajuste operativo / Mantenimiento';
      // Auto avanzar al Paso 2
      goToStopStep(2);
    });
  });

  function goToStopStep(stepNum) {
    // Si hay un paro corriendo y se intenta retroceder, no permitir romper el cronómetro
    if (window.UanifyState.activeDowntime && stepNum < 3) {
      window.UanifyUI.toast('Hay un paro de máquina activo corriendo. Finalízalo o minimízalo.', 'info');
      return;
    }

    currentStopStep = stepNum;

    // Actualizar encabezados y contenido del stepper
    [stepperStep1, stepperStep2, stepperStep3].forEach((el, idx) => {
      if (!el) return;
      el.classList.remove('active', 'completed');
      if (idx + 1 === stepNum) el.classList.add('active');
      else if (idx + 1 < stepNum) el.classList.add('completed');
    });

    if (stopStepContent1) stopStepContent1.style.display = (stepNum === 1) ? 'block' : 'none';
    if (stopStepContent2) stopStepContent2.style.display = (stepNum === 2) ? 'block' : 'none';
    if (stopStepContent3) stopStepContent3.style.display = (stepNum === 3) ? 'block' : 'none';

    // Manejo de botones del footer según el paso
    if (btnStopBackStep) btnStopBackStep.style.display = (stepNum === 2) ? 'inline-flex' : 'none';
    if (btnStopNextToStep2) btnStopNextToStep2.style.display = (stepNum === 1) ? 'inline-flex' : 'none';
    if (btnStartDowntimeTimer) btnStartDowntimeTimer.style.display = (stepNum === 2) ? 'inline-flex' : 'none';
    if (btnMinimizeStopModal) btnMinimizeStopModal.style.display = (stepNum === 3) ? 'inline-flex' : 'none';
    if (btnFinishDowntimeStop) btnFinishDowntimeStop.style.display = (stepNum === 3) ? 'inline-flex' : 'none';

    if (stepNum === 2) {
      const selectedDeptCode = stopDeptSelect ? stopDeptSelect.value : 'D-05';
      const dept = (window.UanifyState.stations || []).find(s => s.code === selectedDeptCode);
      if (stopConfirmDeptText) stopConfirmDeptText.textContent = dept ? `${dept.code} - ${dept.name}` : selectedDeptCode;
      if (stopConfirmMachText) stopConfirmMachText.textContent = stopMachineSelect ? stopMachineSelect.value : 'MAQ-01';
      if (stopConfirmCauseText) stopConfirmCauseText.textContent = selectedStopCause;
    }
  }
  window.goToStopStep = goToStopStep;

  if (btnStopNextToStep2) {
    btnStopNextToStep2.addEventListener('click', () => goToStopStep(2));
  }

  if (btnStopBackStep) {
    btnStopBackStep.addEventListener('click', () => goToStopStep(1));
  }

  // Formateador de segundos a HH:MM:SS
  function formatSecondsToHMS(totalSecs) {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Función para arrancar o sincronizar cronómetro
  function startDowntimeClockRunning() {
    if (activeDowntimeTimerInterval) clearInterval(activeDowntimeTimerInterval);

    const updateDisplays = () => {
      if (!window.UanifyState.activeDowntime) return;
      const startMs = window.UanifyState.activeDowntime.startTimestamp;
      const nowMs = Date.now();
      const elapsedSecs = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      const formattedHMS = formatSecondsToHMS(elapsedSecs);

      if (modalStopTimerDisplay) modalStopTimerDisplay.textContent = formattedHMS;
      if (floatingDowntimeTime) floatingDowntimeTime.textContent = formattedHMS;
    };

    updateDisplays();
    activeDowntimeTimerInterval = setInterval(updateDisplays, 1000);

    // Mostrar widget flotante global permanente
    if (globalActiveDowntimeWidget) {
      globalActiveDowntimeWidget.style.display = 'flex';
      if (floatingDowntimeMeta && window.UanifyState.activeDowntime) {
        floatingDowntimeMeta.textContent = `${window.UanifyState.activeDowntime.station} · ${window.UanifyState.activeDowntime.cause}`;
      }
    }
  }

  // Botón: Comenzar Paro & Correr Cronómetro (Paso 2 -> Paso 3)
  if (btnStartDowntimeTimer) {
    btnStartDowntimeTimer.addEventListener('click', () => {
      const selectedDeptCode = stopDeptSelect ? stopDeptSelect.value : 'D-05';
      const dept = (window.UanifyState.stations || []).find(s => s.code === selectedDeptCode);
      const machine = stopMachineSelect ? stopMachineSelect.value : 'MAQ-01';
      const notes = stopNotesInput ? stopNotesInput.value.trim() : '';
      const impact = stopImpactSelect ? stopImpactSelect.value : 'Línea Detenida';
      const user = window.UanifyState.users.find(u => u.id === window.UanifyState.currentUser) || { name: 'Supervisor de Turno' };

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Crear objeto de paro activo persistente
      const activeDowntime = {
        id: 'stop-' + Date.now(),
        startTimestamp: now.getTime(),
        time: timeStr,
        deptCode: selectedDeptCode,
        station: dept ? `${dept.code} (${machine.split(' ')[0]})` : machine,
        fullStationName: dept ? `${dept.code} - ${dept.name} [${machine}]` : machine,
        machine: machine,
        cause: selectedStopCause,
        notes: notes,
        impact: impact,
        reportedBy: user.name,
        status: 'running'
      };

      window.UanifyState.activeDowntime = activeDowntime;
      try {
        localStorage.setItem('uanify_active_downtime', JSON.stringify(activeDowntime));
      } catch (e) {
        console.warn('Error saving active downtime:', e);
      }

      // Llenar datos en Paso 3
      if (modalStopStartTime) modalStopStartTime.textContent = `${timeStr} hrs`;
      if (modalStopStation) modalStopStation.textContent = activeDowntime.fullStationName;
      if (modalStopCause) modalStopCause.textContent = activeDowntime.cause;
      if (modalStopUser) modalStopUser.textContent = activeDowntime.reportedBy;

      goToStopStep(3);
      startDowntimeClockRunning();

      window.UanifyUI.toast(
        `Paro iniciado a las ${timeStr} en ${activeDowntime.station}. Cronómetro corriendo en vivo.`,
        'warning',
        'Cronómetro de Paro Activado'
      );
    });
  }

  // Minimizar modal para operar libremente mientras corre
  if (btnMinimizeStopModal) {
    btnMinimizeStopModal.addEventListener('click', () => {
      closeStopModal();
      window.UanifyUI.toast(
        'El cronómetro sigue corriendo en segundo plano. Haz clic en el indicador flotante rojo para volver al paro.',
        'info',
        'Cronómetro en Segundo Plano'
      );
    });
  }

  // Parar Registro y Guardar en Bitácora
  if (btnFinishDowntimeStop) {
    btnFinishDowntimeStop.addEventListener('click', () => {
      if (!window.UanifyState.activeDowntime) return;

      const active = window.UanifyState.activeDowntime;
      const endMs = Date.now();
      const elapsedSecs = Math.max(1, Math.floor((endMs - active.startTimestamp) / 60000));
      const durationStr = elapsedSecs >= 60 
        ? `${Math.floor(elapsedSecs / 60)}h ${elapsedSecs % 60} min`
        : `${elapsedSecs} min`;

      const now = new Date();
      const endTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Crear registro final para la bitácora
      const finishedRecord = {
        time: active.time,
        endTime: endTimeStr,
        station: active.station,
        cause: active.cause + (active.notes ? ` (${active.notes})` : ''),
        duration: durationStr,
        impact: active.impact || 'Línea Detenida',
        user: active.reportedBy
      };

      if (!window.UanifyState.downtimes) window.UanifyState.downtimes = [];
      window.UanifyState.downtimes.unshift(finishedRecord);

      // Limpiar estado activo
      window.UanifyState.activeDowntime = null;
      try {
        localStorage.removeItem('uanify_active_downtime');
      } catch (e) {}

      if (activeDowntimeTimerInterval) {
        clearInterval(activeDowntimeTimerInterval);
        activeDowntimeTimerInterval = null;
      }

      if (globalActiveDowntimeWidget) {
        globalActiveDowntimeWidget.style.display = 'none';
      }

      // Re-renderizar bitácora Andon y Consola de Ingeniería
      if (typeof window.renderDowntimes === 'function') {
        window.renderDowntimes();
      }

      closeStopModal();
      goToStopStep(1);

      window.UanifyUI.toast(
        `Paro finalizado (${durationStr}). Registrado formalmente en la bitácora de planta y tablero Andon.`,
        'success',
        'Paro Guardado en Bitácora'
      );
    });
  }

  // Función global para re-abrir el modal con el cronómetro corriendo desde el widget flotante
  window.openRunningDowntimeModal = function() {
    if (modalStop) {
      if (window.UanifyState.activeDowntime) {
        const active = window.UanifyState.activeDowntime;
        if (modalStopStartTime) modalStopStartTime.textContent = `${active.time} hrs`;
        if (modalStopStation) modalStopStation.textContent = active.fullStationName || active.station;
        if (modalStopCause) modalStopCause.textContent = active.cause;
        if (modalStopUser) modalStopUser.textContent = active.reportedBy || 'Supervisor';
        goToStopStep(3);
      } else {
        goToStopStep(1);
      }
      modalStop.classList.add('active');
    }
  };

  // Restaurar paro activo desde localStorage si la página se recargó
  try {
    const savedActiveDowntime = localStorage.getItem('uanify_active_downtime');
    if (savedActiveDowntime) {
      window.UanifyState.activeDowntime = JSON.parse(savedActiveDowntime);
      startDowntimeClockRunning();
    }
  } catch (e) {
    console.warn('Error recovering active downtime:', e);
  }

  function openStopModal() {
    populateStopDeptSelect();
    if (window.UanifyState.activeDowntime) {
      window.openRunningDowntimeModal();
    } else {
      goToStopStep(1);
      if (modalStop) modalStop.classList.add('active');
    }
  }

  function closeStopModal() {
    if (modalStop) modalStop.classList.remove('active');
  }

  if (btnReportStop) {
    btnReportStop.addEventListener('click', openStopModal);
  }

  if (btnCloseStopModal) {
    btnCloseStopModal.addEventListener('click', closeStopModal);
  }

  if (modalStop) {
    modalStop.addEventListener('click', (e) => {
      if (e.target === modalStop) closeStopModal();
    });
  }

  // Bitácora de Paros de Prensa (RF-79 botón secundario en Terminal)
  const btnPrensasStops = document.querySelectorAll('.btn-prensas-stop');
  btnPrensasStops.forEach(btn => {
    btn.addEventListener('click', () => {
      openStopModal();
    });
  });

  // Exportación Nativa de Pre-reporte Semanal de Destajo a Excel/CSV (RF-82)
  const btnExportDestajoExcel = document.getElementById('btnExportDestajoExcel');
  if (btnExportDestajoExcel) {
    btnExportDestajoExcel.addEventListener('click', () => {
      const csvRows = [
        ['No. Nomina', 'Operador', 'Departamento', 'Maquina', 'Tipo Pago', 'Tarifa ($/pza)', 'Piezas Producidas', 'Total Destajo ($ MXN)', 'Estatus'],
        ['OP-0101', 'Juan Manuel Torres', 'D-02 Prensas', 'Prensa Hidraulica #04', 'Destajo', '18.50', '85', '$1,572.50', 'Activo'],
        ['OP-0102', 'Carlos Hernandez', 'D-02 Prensas', 'Prensa Vapor #02', 'Destajo', '18.50', '92', '$1,702.00', 'Activo'],
        ['OP-0105', 'Martin Rocha', 'D-05 Alambrado', 'Engargoladora #01', 'Destajo', '14.20', '88', '$1,249.60', 'Activo'],
        ['OP-0108', 'Ana Laura Gomez', 'S-01 Tafiletes', 'Mesa Tafilete #03', 'Destajo', '12.00', '150', '$1,800.00', 'Activo'],
        ['OP-0110', 'Rosa Maria Santos', 'S-02 Toquillas', 'Taller Toquilla #01', 'Destajo', '11.50', '110', '$1,265.00', 'Activo'],
        ['OP-0114', 'Jorge Ortiz', 'D-10 Adorno', 'Mesa Adorno #02', 'Destajo', '22.00', '78', '$1,716.00', 'Activo'],
        ['OP-0118', 'Pedro Infante G.', 'D-07 Prensas Hidraulicas', 'Hidraulica #01', 'Destajo', '16.50', '80', '$1,320.00', 'Activo']
      ];
      
      const csvContent = '\uFEFF' + csvRows.map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Pre_Reporte_Destajo_Semana_Tombstone_MES.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.UanifyUI.toast(
        'Archivo Excel/CSV descargado con éxito: Pre-reporte semanal de nómina a destajo para corte de los viernes.',
        'success',
        'Exportación Concluida'
      );
    });
  }
};
