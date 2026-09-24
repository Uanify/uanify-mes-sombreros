# Reglas Maestras de Desarrollo · Uanify MES Tombstone Hats

Este archivo unifica y formaliza las directrices de ingeniería, arquitectura, diseño y operación para el desarrollo del sistema **Tombstone Hats MES** desarrollado por **Uanify**.

---

## REGLA 0: Mentalidad de Producción Real para Usuarios Finales (MANDATORIA)

**SIEMPRE trabajar como si esto fuera la versión productiva que van a usar clientes reales y que pagan dinero, desde el primer día.**

1. **Cero textos de prueba visibles:** Queda estrictamente prohibido mostrar "demo", "ejemplo", "placeholder", "mock", "prueba" o "modo local" en interfaces de usuario final.
2. **Sin accesos de prueba o bypass de desarrollador expuestos:** La pantalla y el panel deben verse 100% como un software comercial terminado de clase industrial.
3. **Sin datos artificiales obvios (Estándar de Oro Clúster Sombrerero San Francisco del Rincón):** 
   - Modelos reales: *1000X Master Telar Denver, El Viejonón, Laredo, Frontier, Bullrider*.
   - Hormas de aluminio: *Denver 4 1/4", Bullrider 4 1/2", Low Crown, Texana Tradicional*.
   - Flujo de planta: *Engomado, Prensas, Troquelado, Almacén Intermedio Rampa (fraccionamiento 60 a 15 pzas), Ribeteado de Tafilete, Calidad Final y Enlace COMPAC*.
4. **Cada pantalla debe estar lista para operar en piso o sala de juntas:** Si Edmundo González o el Ingeniero de Producción entran a la plataforma, deben ver un sistema operativo, coherente y robusto.

---

## REGLA 0.1: Prioridad a Opciones Gratuitas y Escalables ($0 USD Inicial)

**SIEMPRE implementar la opción gratuita, funcional y con capacidad de escalar a futuro.**

1. **Costo $0 USD por defecto:** Todo componente, librería, base de datos y despliegue debe utilizar tiers gratuitos y código abierto (ej. GitHub Pages, Edge Local en navegadores de piso, exportación nativa de datos sin APIs de cobro recurrente).
2. **Diseño con capacidad de escalar:** La arquitectura debe ser modular y limpia para que, cuando la planta requiera servidores locales IP65 o integración COMPAC en red local, la transición sea inmediata.
3. **ALERTA DE PAGO OBLIGATORIA (MÁXIMA PRIORIDAD):**
   > [!CRITICAL]
   > **Si para cualquier funcionalidad, herramienta o servicio es necesario pagar algo o incurrir en costos recurrentes, SE LE DEBE INFORMAR A ANDRÉS CON MÁXIMA PRIORIDAD ANTES DE IMPLEMENTARLO O CONTRATARLO.** Jamás asumir o comprometer gasto alguno sin su aprobación explícita previa.

---

## REGLA 0.2: Apariencia Light Mode Tradicional Moderno Contemporáneo (#8B5E3C) & Cero Sonidos

**La identidad visual principal es Light Mode con el color de marca Cuero Artesanal `#8B5E3C` y acentos ámbar/slate.**

### 1. Requisitos de Modo Claro Industrial
- **Tema Claro por defecto:** Interfaz limpia, clara y luminosa (`background: #F8FAFC`, tarjetas `#FFFFFF`), con textos oscuros legibles (`#0F172A`) y acentos de contraste en gris pizarra (`#1E293B`, `#334155`).
- **Prohibición de Fondos Oscuros Residuales:** Queda prohibido el uso de temas oscuros o contenedores negros tipo arcade en el tablero Andon y módulos de gestión.
- **Cero Audio o Alertas Sonoras:** La planta no debe emitir ruidos molestos ni voces sintéticas; las alertas son estrictamente visuales (semáforos Andon, pills pulsantes y badges de estado).

### 2. Versión del Sistema y Cursor Interactivo
- **Versión del Sistema Visible:** En el encabezado del sidebar (`.system-version-pill`) y en el pie de página (`.footer-version-tag`), la versión SemVer del sistema (ej. `v2.7.0`) debe estar claramente visible en todo momento.
- **REGLA DE CURSOR INTERACTIVO (OBLIGATORIA):**
  > [!CRITICAL]
  > **Todo elemento clickeable (botones, enlaces `<a>`, selectores, tabs, tarjetas con acción) DEBE mostrar `cursor: pointer !important` al pasar el mouse por encima.** Jamás dejar un botón o tarjeta interactiva con cursor por defecto.

---

## REGLA 0.3: Control de Versiones Automático (Version Bump Obligatorio)

- Al completar cualquier conjunto relevante de cambios, nueva feature, corrección de bug o refactorización, **se debe incrementar el número de versión (SemVer)** de la aplicación (ej. `2.6.0` -> `2.7.0`).
- La versión debe mantenerse estrictamente sincronizada en:
  1. `package.json` (campo `"version"`).
  2. `index.html` (badge `.system-version-pill` en sidebar y `.footer-version-tag` en footer, y query params de assets CSS/JS `?v=X.Y.Z` para cache busting en GitHub Pages).
  3. `js/app.js` (propiedad `UanifyState.version`).
  4. `README.md` (badge de versión del encabezado y sección Changelog).
  5. `SISTEMA_TOMBSTONE_MES.md` (encabezado del documento maestro y sección Historial de Versiones).

---

## REGLA 0.4: Documentación Continua y Mantenimiento de `README.md` y `SISTEMA_TOMBSTONE_MES.md`

1. **Nombre Oficial del Software:** La plataforma se llama **Tombstone Hats MES** (o **Uanify MES Sombreros**).
2. **Documento Maestro de Arquitectura y Reglas:** El archivo `SISTEMA_TOMBSTONE_MES.md` en la raíz del proyecto es la **fuente única de verdad** para conocer toda la arquitectura técnica, modelos de datos, reglas de negocio y operativas de planta.
3. **Obligación de Actualización Continua:**
   - Tras cualquier cambio relevante, integración de módulos o mejoras arquitectónicas, **evaluar y actualizar obligatoriamente `README.md` y `SISTEMA_TOMBSTONE_MES.md`** para reflejar:
     - Nuevas características o especificaciones de UX añadidas.
     - Cambios en el proceso de planta (departamentos, tiempos de ciclo, tamaños de lote y rampa).
     - Modificaciones en la matriz RBAC de roles y permisos.
     - Políticas operativas (horarios, turnos y Takt Time).

---

## REGLA 0.5: Operación Consolidada en Turno Único & RBAC

1. **Régimen de Operación:** La planta opera formalmente en **Turno Único (07:00 a 15:30 hrs · Lunes a Viernes)**, con un receso/comida programado de 12:00 a 12:45 hrs.
   - Meta diaria del turno: **850 piezas/día**.
   - Takt Time estándar: **42 segundos por pieza**.
   - Queda prohibido reactivar selectores de turnos múltiples ficticios.
2. **Seguridad Basada en Roles (RBAC):**
   - **Administrador (👑 Admin):** Acceso a todos los módulos y capacidad exclusiva de gestionar usuarios y editar permisos.
   - **Ingeniero de Producción (⚡ Ingeniero):** Acceso a Tablero Andon, Ingeniería & Subensambles y Dirección & COMPAC.
   - **Supervisor de Línea (📱 Supervisor):** Acceso a Tablero Andon y Terminal iPad de Lotes y Almacenes; pestañas restringidas bloqueadas con candado y aviso de seguridad.

---

## REGLA 0.6: Cero Fallos en Compilación y Despliegue (Build & Deployment Hygiene)

- **Validación previa obligatoria:** Verificar que no existan errores de sintaxis, imports rotos ni inconsistencias de DOM antes de desplegar.
- **Despliegue a Producción:** Tras confirmar los cambios, realizar commit y push a la rama `main` en `https://github.com/Uanify/uanify-mes-sombreros.git` y verificar con el subagente de navegación en `https://uanify.github.io/uanify-mes-sombreros/`.

---

## REGLA 0.7: Prohibición Estricta de Diálogos Nativos del Navegador (`alert`, `confirm`, `prompt`)

**Queda estrictamente prohibido el uso de ventanas modales nativas del navegador (`alert()`, `confirm()`, `prompt()`).**
1. **Componentes In-App Estandarizados:** Todas las notificaciones de éxito, error, advertencia o confirmación deben renderizarse con la capa de interfaz estandarizada `UanifyUI`:
   - Notificaciones y toasts: `UanifyUI.toast(mensaje, tipo, titulo)` con tipo `'success'`, `'warning'`, `'error'` o `'info'`.
   - Modales de confirmación interactivos: `UanifyUI.confirm(titulo, mensaje, onConfirm, okText, cancelText)`.
2. **Cero Bloqueo de Hilo:** Las alertas in-app no congelan la ejecución del hilo principal del navegador ni alteran la experiencia visual de piso.

---

## REGLA 0.8: Navegación Interna por Sub-Pestañas (Sub-tabs)

**La navegación entre secciones dentro de un mismo módulo debe resolverse mediante sub-pestañas (.sub-nav-tabs).**
- Queda prohibido el scroll infinito vertical o apilar múltiples tablas complejas en una sola vista.
- Cada vista cuenta con botones `.sub-tab-btn` que activan su respectivo contenedor `.sub-tab-content`, manteniendo la interfaz limpia, rápida y organizada para operadores y directivos.

---

## REGLA 0.9: Flujo Operativo Departamental (Máquinas → Almacén Intermedio → Recolección)

**El sistema refleja el flujo físico real de la nave industrial de Tombstone Hats:**
1. **Padrón de Operadores (Sin Login):** Los operadores de planta son registrados con su número de nómina, departamento y máquina asignada. **No son usuarios del sistema** (no tienen credenciales ni acceso a la app); son gestionados por Supervisores, Ingenieros y Admins.
2. **Operación en Máquina:** El operador asignado procesa el lote o sublote en su máquina (ej. Prensas Hidráulicas, Cabina de Pintura, Ribeteado).
3. **Depósito en Almacén Intermedio:** Al concluir el trabajo, el lote se registra y se deposita físicamente en el almacén intermedio de salida de ese departamento.
4. **Recolección y Traspaso:** El auxiliar o recolector del siguiente departamento acude físicamente al almacén de salida, recoge las piezas y las traslada al almacén de entrada de su departamento para reiniciar el ciclo en sus propias máquinas.

---

## REGLA 0.10: Matriz de Asignaciones, Hormas y Métricas Clave

1. **Meta Semanal Rectora:** La meta rectora de la planta se define como **Meta Semanal (4,250 piezas/semana)** correspondiente al Turno Único de Lunes a Viernes (~850 pzas/día).
2. **Asignación Departamental para Supervisores:** Cada usuario con rol Supervisor únicamente tiene visibilidad y capacidad de acción sobre los departamentos que tiene asignados (un supervisor puede tener múltiples departamentos a cargo, ej. D-05 a D-08).
3. **Privilegios de Ingeniería:** Los usuarios Ingenieros pueden ver y auditar todos los departamentos, y tienen la facultad de dar de alta nuevos Supervisores de Planta, pero **NO pueden crear otros Ingenieros ni Administradores** (facultad exclusiva de Dirección/Admin).
4. **Acceso Exclusivo a KPIs de Rendimiento:** La sección de métricas y KPIs de rendimiento de Supervisores y Departamentos es de acceso exclusivo para Ingeniería y Dirección.
5. **Catálogo de Hormas y Moldes:** Registro centralizado de hormas de aluminio fundido (Denver, Bullrider, Viejonón, Laredo, Frontier, Chaparral) con especificación de copa, falda, máquina asignada y estado.
6. **Lector QR de Pantalla Completa con Cámara Web:** La terminal de piso despliega directamente el flujo de video en vivo de la cámara del dispositivo mediante la API estándar `navigator.mediaDevices.getUserMedia()`, garantizando compatibilidad universal en iPads, tablets Android, laptops y teléfonos.

