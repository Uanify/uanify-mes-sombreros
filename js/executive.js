/**
 * UANIFY MES · DASHBOARD EJECUTIVO (EDMUNDO / DIRECCIÓN & COMPAC)
 * Convierte métricas de piso a valor financiero y gestiona órdenes mayoristas B2B
 */

window.initExecutiveView = function() {
  updateExecutiveMetrics();

  EventBus.on('piece-registered', () => {
    updateExecutiveMetrics();
  });

  EventBus.on('scrap-registered', () => {
    updateExecutiveMetrics();
  });
};

function updateExecutiveMetrics() {
  const totalValue = UanifyState.producedTotal * UanifyState.unitPriceMxn;
  const scrapCost = UanifyState.scrapTotal * UanifyState.unitPriceMxn;
  const secondGradeValue = UanifyState.secondGradeTotal * (UanifyState.unitPriceMxn * 0.5); // 50% descuento en saldos

  const fmt = (num) => '$' + num.toLocaleString('es-MX') + ' MXN';

  const revEl = document.getElementById('execRevenueValue');
  const scrapEl = document.getElementById('execScrapCost');
  const secondEl = document.getElementById('execSecondGradeValue');

  if (revEl) revEl.textContent = fmt(totalValue);
  if (scrapEl) scrapEl.textContent = fmt(scrapCost);
  if (secondEl) secondEl.textContent = fmt(secondGradeValue);

  const fulEl = document.getElementById('execFulfillment');
  if (fulEl) {
    const rate = Math.min(100, Math.round((UanifyState.producedTotal / UanifyState.metaShiftTotal) * 1000) / 10);
    fulEl.textContent = `${rate}%`;
  }

  const revTrendEl = document.getElementById('execRevenueTrend');
  if (revTrendEl) {
    revTrendEl.textContent = `${UanifyState.producedTotal} texanas terminadas @ $${UanifyState.unitPriceMxn.toLocaleString('es-MX')} prom. (Catálogo Tombstone)`;
  }

  const fulTrendEl = document.getElementById('execFulfillmentTrend');
  if (fulTrendEl) {
    const ordersReady = Math.min(14, Math.max(1, Math.floor(UanifyState.producedTotal / 45)));
    fulTrendEl.textContent = `${ordersReady} de 14 pedidos mayoristas completados`;
  }

  const secTrendEl = document.getElementById('execSecondGradeTrend');
  if (secTrendEl) {
    secTrendEl.textContent = `${UanifyState.secondGradeTotal} piezas regulares para remate (50% desc.)`;
  }

  const scrapTrendEl = document.getElementById('execScrapTrend');
  if (scrapTrendEl) {
    const totalProcessed = UanifyState.producedTotal + UanifyState.scrapTotal;
    const scrapPct = totalProcessed > 0 ? ((UanifyState.scrapTotal / totalProcessed) * 100).toFixed(1) : '0.0';
    scrapTrendEl.textContent = `${UanifyState.scrapTotal} piezas con daño total (${scrapPct}% merma)`;
  }
}

window.emitirValeEntrega = function() {
  const c = UanifyState.compacSync || { customer: 'Sombreros La Herradura S.A. de C.V.', activeOrderB2B: 'OC-2026-8841' };
  if (window.UanifyUI && window.UanifyUI.alert) {
    window.UanifyUI.alert(
      'Vale de Entrega Digital & CONTPAQi ERP',
      `Cliente: ${c.customer}\nOrden de Compra: ${c.activeOrderB2B}\nLote entregado: 350 texanas Master Telar\nTransporte: Camioneta del cliente en andén de carga B2B\n\nPre-factura emitida y descuento de inventario procesado en CONTPAQi.`
    );
  }
};

