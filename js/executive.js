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
}

window.emitirValeEntrega = function() {
  const c = UanifyState.compacSync;
  alert(`🚚 VALE DE ENTREGA GENERADO Y ENVIADO A COMPAC:\n\nCliente: ${c.customer}\nOrden de Compra: ${c.activeOrderB2B}\nLote entregado: 350 texanas Master Telar\nTransporte: Camioneta del cliente en andén de carga\n\n✅ Pre-factura emitida y descuento de inventario procesado en CONTPAQi.`);
};
