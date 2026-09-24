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
   - **Supervisor de Línea (📱 Supervisor):** Acceso a Tablero Andon y Lotes, QR & Almacenes; pestañas restringidas OCULTAS por completo (sin candados ni opciones deshabilitadas).

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
6. **Lector QR de Pantalla Completa con Cámara Web:** La terminal de piso despliega directamente el flujo de video en vivo de la cámara del dispositivo mediante la API estándar `navigator.mediaDevices.getUserMedia()`, garantizando compatibilidad universal en dispositivos móviles, laptops y terminales de piso.

---

## REGLA 0.11: Enfoque de Diseño Tablet-First y 100% Responsivo (MANDATORIA)

**Todo el sistema debe estar concebido y optimizado primordialmente con enfoque Tablet-First.**
1. **Optimización para Pantallas Táctiles (768px a 1024px):** Las vistas principales (Andon, Terminal de Almacenes, Fichas de Hormas, Vales de Pago y Configuración) deben funcionar de forma fluida y ergonómica en pantallas táctiles de planta, tanto en orientación horizontal como vertical.
2. **Dimensiones de Toque Ergonómicas:** Todo botón, selector, input y pestaña debe tener una altura táctil mínima de 42-44px para permitir una interacción rápida y precisa con los dedos sin errores de puntería.
3. **Tablas y Pestañas Adaptables:** Toda tabla de datos debe estar encapsulada en contenedores con desplazamiento táctil suave (`-webkit-overflow-scrolling: touch;`), y los encabezados de sub-pestañas deben desplazarse horizontalmente sin deformar la estructura de la aplicación.
4. **Cero Desbordamiento Horizontal:** La interfaz nunca debe desbordarse involuntariamente a los lados ni cortar información crítica.

---

## REGLA 0.12: Prohibición Estricta de Palabras "iPad" o "Tablet/Tableta" en la Interfaz de Usuario

**Queda terminantemente prohibido colocar explícitamente las palabras "iPad", "Tablet" o "Tableta" en la interfaz de usuario.**
- No deben aparecer en textos, encabezados, títulos, badges, tooltips, opciones de formularios ni placeholders.
- En su lugar, utilizar siempre términos profesionales neutros:
  - *Terminal de Planta* o *Terminal de Piso*
  - *Lotes, QR & Almacenes*
  - *Supervisor de Piso y Almacenes*
  - *Cámara de tu dispositivo* o *Dispositivo móvil*

---

## REGLA 0.13: Seguridad RBAC por Ocultamiento Estricto (Sin Candados Visuales)

**Las restricciones de acceso NO deben mostrar iconos de candados 🔒 ni botones bloqueados.**
1. **Ocultamiento Total:** Si un usuario no cuenta con autorización para un módulo o pestaña según su matriz de permisos, dicha opción simplemente **NO DEBE APARECER** en la barra lateral ni en los menús (`display: none`).
2. **Cero Frustración de Usuario:** El operador o supervisor únicamente visualiza las herramientas a las que tiene acceso legítimo, evitando distracciones o sensación de bloqueo.
3. **Agrupadores Limpios:** Si todos los elementos de un grupo de navegación están restringidos, el título de la sección (`.nav-group-title`) también debe ocultarse automáticamente.

---

## REGLA 0.14: Barra Lateral Plegable (Collapsible Sidebar) & Versión Prominente

1. **Barra Lateral Plegable:** La barra de navegación lateral izquierda debe contar con un botón toggle accesible para alternar entre modo completo y modo icono/plegado (~72px), liberando el máximo espacio de visualización para tarjetas y tablas operativas.
2. **Persistencia y Adaptación:** El estado plegado se almacena en `localStorage` (`uanify_sidebar_collapsed`) y se inicializa colapsado en pantallas táctiles (resolución <= 1024px) por ergonomía de planta.
3. **Versión SemVer Visible y Prominente:** El badge de versión (`.system-version-pill`) en el encabezado del sidebar debe ser de alto contraste, nítido y siempre legible (`color: #FFF`, fondo cuero de marca `#8B5E3C`).

---

## REGLA 0.15: Trazabilidad QR y Generación en Tarjetas Viajeras

1. **Información Embebida:** El código QR de cada tarjeta viajera contiene la información operativa estructurada del lote madre (60 pzas) o sublote (15 pzas), incluyendo modelo, orden de producción, talla, calidad y tramo departamental.
2. **Generación Física:** La generación e impresión formal de estos códigos QR se realiza en el departamento de Ingeniería al momento de emitir las tarjetas viajeras oficiales de planta.

---

## REGLA 0.16: Definición Informativa del Horario de Turno

1. **Propósito Informativo:** El horario de operación del Turno Único (Entrada, Salida, Horario de Comida/Descanso y Días Laborables) se define en el módulo de Configuración como un dato maestro de referencia de planta.
2. **Previsualización y Sincronización:** Al editar los campos en Configuración, el sistema genera automáticamente un texto resumen normalizado (ej. `07:00 a 15:30 hrs · Lunes a Viernes (Comida: 12:00 a 12:45)`) que se almacena en `localStorage` (`uanify_shift_schedule`) y actualiza dinámicamente la leyenda informativa en el pie de la barra lateral izquierda.

---

## REGLA 0.17: Alta Dinámica de Departamentos con Supervisor y Multi-Operadores

1. **Gestión Integral de Estaciones / Departamentos:** Se debe permitir dar de alta nuevos departamentos (`D-XX`) desde la interfaz de Configuración de Planta.
2. **Asignación de Supervisor:** Todo departamento registrado debe tener asignado un supervisor de planta responsable, vinculando bidireccionalmente el departamento a la lista de áreas a cargo del supervisor.
3. **Asignación Múltiple de Operadores:** Al registrar un departamento, el sistema debe permitir seleccionar uno o múltiples operadores de piso existentes mediante una lista de verificación interactiva, o bien permitir dar de alta un nuevo operador de forma inmediata en el mismo flujo.
4. **Visualización en Catálogo:** La tabla maestra de departamentos debe listar de manera explícita y mediante badges individuales los operadores asignados a cada estación de trabajo.

---

## REGLA 0.18: Rutas Productivas por Modelo, Áreas de Calidad y Línea de Tiempo de Trazabilidad

1. **Consulta Visual de Ubicación de Lotes (Supervisor de Piso):** El supervisor (así como ingeniería y dirección) debe poder consultar en cualquier momento dónde se encuentra un lote específico a través de un mapa de proceso visual o línea de tiempo interactiva (Value Stream Map).
2. **Visualización de Nodos y Filtros de Calidad:** La línea de tiempo debe reflejar todos los pasos departamentales y las paradas de control de calidad (`C-XX`) por las que transita el lote, destacando de manera prominente la estación activa (**📍 AQUÍ ESTÁ EL LOTE**), las estaciones ya superadas (✅) y los pasos pendientes (⏳).
3. **Secuencias Dependientes del Tipo de Sombrero (Rutas de Fabricación):** Cada modelo de sombrero (ej. 1000X Master Telar, Campana Preformada de 1 pieza, Laqueados Especiales) posee su propia secuencia departamental. Estas rutas deben ser configurables, permitiendo reordenar (subir/bajar) los pasos, agregar o remover departamentos y filtros de calidad.
4. **Facultad de Configuración para Ingeniería y Dirección:** La creación de áreas de calidad (`C-XX`) y la edición de las secuencias de rutas de fabricación son facultades exclusivas de los roles **Ingeniero** y **Administrador**.


