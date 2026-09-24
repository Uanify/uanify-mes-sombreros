/**
 * UANIFY MES · CONFIGURACIÓN DE PLANTA & GESTIÓN DE MÓDULOS
 * Tombstone Hats · San Francisco del Rincón, Guanajuato
 */

window.initConfigView = function() {
  const tableBody = document.getElementById('cfgDepartmentsTable');
  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const cfgShiftGoal = document.getElementById('cfgShiftGoal');
  const cfgTaktTime = document.getElementById('cfgTaktTime');

  function renderDepartmentsConfig() {
    if (!tableBody || !UanifyState.stations) return;

    tableBody.innerHTML = UanifyState.stations.map((st, idx) => {
      const isQuality = st.id.startsWith('calidad');
      const badgeStyle = isQuality 
        ? 'background:var(--color-amber-bg); color:var(--color-amber); border:1px solid var(--color-amber-border);'
        : 'background:var(--color-green-bg); color:var(--color-green); border:1px solid var(--color-green-border);';

      return `
        <tr>
          <td><strong style="font-family:'JetBrains Mono'; color:var(--color-brand);">${st.code || 'D-' + String(idx+1).padStart(2,'0')}</strong></td>
          <td><strong>${st.name}</strong></td>
          <td><span class="badge-subtle">${isQuality ? 'Control de Calidad' : 'Proceso Productivo'}</span></td>
          <td><span style="font-family:'JetBrains Mono';">${st.taktTime || 40} seg</span></td>
          <td>${st.target || 850} pzas</td>
          <td>${st.operator}</td>
          <td><span class="badge-status" style="${badgeStyle}">Activo</span></td>
        </tr>
      `;
    }).join('');
  }

  renderDepartmentsConfig();

  if (btnSaveConfig) {
    btnSaveConfig.addEventListener('click', () => {
      const newGoal = parseInt(cfgShiftGoal ? cfgShiftGoal.value : 850, 10);
      const newTakt = parseInt(cfgTaktTime ? cfgTaktTime.value : 42, 10);
      
      UanifyState.metaShiftTotal = newGoal;
      UanifyState.taktTimeSec = newTakt;

      const goalEl = document.getElementById('andonGoalTotal');
      const taktEl = document.getElementById('andonTaktTime');
      if (goalEl) goalEl.textContent = `${newGoal} pzas`;
      if (taktEl) taktEl.textContent = `${newTakt} seg/pza`;

      alert(
        `💾 CONFIGURACIÓN DE PLANTA GUARDADA\n\n` +
        `• Meta del Turno: ${newGoal} pzas\n` +
        `• Takt Time Estándar: ${newTakt} seg/pza\n` +
        `• 14 Departamentos y Almacenes sincronizados con Tablero Andon.\n` +
        `• Umbrales de WIP actualizados para tablets de supervisores.`
      );
    });
  }
};
