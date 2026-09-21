/**
 * UANIFY MES · DASHBOARD EJECUTIVO (EDMUNDO / DIRECCIÓN)
 * Converts floor operational metrics into executive financials (MXN)
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
  // Financial calculation: Total hats produced * average wholesale price
  const totalValue = UanifyState.producedTotal * UanifyState.unitPriceMxn;
  const scrapCost = UanifyState.scrapTotal * UanifyState.unitPriceMxn;

  // Format MXN Currency
  const fmt = (num) => '$' + num.toLocaleString('es-MX') + ' MXN';

  const revEl = document.getElementById('execRevenueValue');
  const scrapEl = document.getElementById('execScrapCost');

  if (revEl) revEl.textContent = fmt(totalValue);
  if (scrapEl) scrapEl.textContent = fmt(scrapCost);

  // Fulfillment %
  const fulEl = document.getElementById('execFulfillment');
  if (fulEl) {
    const rate = Math.min(100, Math.round((UanifyState.producedTotal / UanifyState.metaShiftTotal) * 1000) / 10);
    fulEl.textContent = `${rate}%`;
  }
}
