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

- Al completar cualquier conjunto relevante de cambios, nueva feature, corrección de bug o refactorización, **se debe incrementar el número de versión (SemVer)** de la aplicación (ej. `2.8.4` -> `2.9.0`).
- La versión debe mantenerse estrictamente sincronizada en:
  1. `package.json` (campo `"version"`).
  2. `index.html` (badge `.system-version-pill` en sidebar y `.footer-version-tag` en footer, y query params de assets CSS/JS `?v=X.Y.Z` para cache busting en GitHub Pages).
  3. `js/app.js` (propiedad `UanifyState.version`).
  4. `README.md` (badge de versión del encabezado y sección Changelog).
  5. `SISTEMA_TOMBSTONE_MES.md` (encabezado del documento maestro y sección Historial de Versiones).
  6. `docs/REQUERIMIENTOS_DEL_SISTEMA.md` (encabezado de versión y matriz de trazabilidad).

---

## REGLA 0.4: Documentación Continua y Mantenimiento Obligatorio de Requerimientos

1. **Nombre Oficial del Software:** La plataforma se llama **Tombstone Hats MES** (o **Uanify MES Sombreros**).
2. **Documento de Requerimientos de Software (SRS / PRD):** El archivo [docs/REQUERIMIENTOS_DEL_SISTEMA.md](file:///C:/Users/andre/.gemini/antigravity-ide/scratch/uanify-mes-sombreros/docs/REQUERIMIENTOS_DEL_SISTEMA.md) es el **catálogo oficial de requerimientos funcionales (`RF-XX`) y no funcionales (`RNF-XX`)** del sistema.
3. **Documento Maestro de Arquitectura y Reglas:** El archivo [SISTEMA_TOMBSTONE_MES.md](file:///C:/Users/andre/.gemini/antigravity-ide/scratch/uanify-mes-sombreros/SISTEMA_TOMBSTONE_MES.md) en la raíz del proyecto es la **fuente única de verdad** para conocer toda la arquitectura técnica, modelos de datos, reglas de negocio y operativas de planta.
4. **OBLIGACIÓN DE ACTUALIZACIÓN CONTINUA DE REQUERIMIENTOS (MANDATORIA):**
   > [!CRITICAL]
   > **Ante cualquier solicitud del usuario, cambio en la operativa, nueva característica o ajuste de diseño, ES OBLIGATORIO ACTUALIZAR:**
   > 1. `docs/REQUERIMIENTOS_DEL_SISTEMA.md`: Registrar o actualizar el código de requerimiento (`RF-XX` / `RNF-XX`), descripción técnica, versión y estado en la matriz de trazabilidad.
   > 2. `SISTEMA_TOMBSTONE_MES.md`: Reflejar la arquitectura, procesos y reglas actualizadas.
   > 3. `README.md`: Documentar los cambios en el Changelog y actualizar links.
   > 
   > **Ninguna tarea se considerará concluida si no se ha sincronizado formalmente el documento de requerimientos.**

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



---

## REGLA 0.19: Sistema Unificado de Componentes de Formulario (MANDATORIA)

**Todo control de formulario - input, select, textarea, input[type=time], input[type=date], input[type=number] - debe usar SIEMPRE las clases del sistema de diseno estandarizado en css/components.css. Queda estrictamente prohibido usar atributos style="" inline para sobreescribir tamano, padding, font-size, border o color de estos controles.**

### 1. Tokens de Formulario
- --form-height: 42px (altura minima tactil ergonomica)
- --form-radius: 10px (border-radius uniforme)
- --form-border / --form-border-focus
- --form-shadow-focus (ring brand rgba(139, 94, 60, 0.14))

### 2. Tabla de Clases Obligatorias

| Elemento | Clase Obligatoria | Prohibido inline |
|---|---|---|
| Texto / Email / Busqueda | .form-input | style="padding:..." |
| Select / Combobox | .custom-select | style="font-size:..." |
| Input de hora | input[type="time"] + .form-input | style inline |
| Input de fecha | input[type="date"] + .form-input | style inline |
| Numero | input[type="number"] + .form-input | Spinners nativos visibles |
| Textarea | textarea.form-input | height fijo inline |
| Label | .field-label | Spans/p sin clase |
| Hint / ayuda | .field-hint | Texto gris inline |
| Grupo de campo | .form-group | Divs flotantes sin clase |

### 3. Select / Combobox
- Siempre usar .custom-select - lleva flecha SVG automatica en brand color al focus.
- Para filtros y barras de busqueda, usar .custom-select.select-sm (34px, 12px font).
- PROHIBIDO: style="font-size:12px; padding:6px 10px;" o similar.

### 4. Date/Time Pickers
- Usar input[type="time"], input[type="date"] o input[type="datetime-local"] con .form-input.
- El icono nativo se colorea automaticamente con brand color via ::-webkit-calendar-picker-indicator.
- PROHIBIDO usar librerias de datepicker externas sin aprobacion de Andres.

### 5. Filter Bars
- Usar siempre .filter-bar como contenedor para agrupar filtros de busqueda.
- Los .custom-select dentro de .filter-bar adoptan tamano compacto automaticamente.
- PROHIBIDO: style="display:flex; gap:12px; background:#F8FAFC; ...".

### 6. Estados de Validacion
- Invalido: clase .is-invalid en el control (borde y ring rojo)
- Valido: clase .is-valid (borde y ring verde)
- Mensaje de error: elemento .field-error debajo del control

---

## REGLA 0.20: Sistema Unificado de Modales (MANDATORIA)

**Todos los modales usan la estructura de 4 partes obligatoria. Prohibido usar style="" en .modal-header, .modal-body o .modal-footer.**

Estructura obligatoria:
.modal-backdrop > .modal-box > .modal-header + .modal-body (o form.modal-body) + .modal-footer

Reglas clave:
1. max-width por defecto: 520px. Solo se permite sobreescribir en .modal-box con style="max-width:640px".
2. Activar/desactivar: classList.add/remove('active') en .modal-backdrop.
3. Para confirmaciones simples de 1-2 lineas usar UanifyUI.confirm(). No abrir modal completo.
4. Footer: Cancelar a la izquierda (.btn-secondary), accion principal a la derecha (.btn-primary).
5. modal-body es scrollable, modal-header y modal-footer son fijos (flex-shrink: 0).

---

## REGLA 0.21: Sistema Unificado de Botones (MANDATORIA)

**Todos los botones usan las clases estandar. Prohibido definir padding, border-radius, font-size o background-color con style="" inline.**

| Clase Base | Uso | Modificadores |
|---|---|---|
| btn-primary | Accion principal, confirmacion | btn-sm, btn-lg, btn-full, btn-icon |
| btn-secondary | Cancelar, accion secundaria | btn-sm, btn-lg, btn-full, btn-icon |
| btn-danger | Eliminar, accion destructiva | btn-sm, btn-lg, btn-full, btn-icon |

---

## REGLA 0.22: Sistema Unificado de Notificaciones (MANDATORIA)

**Toda notificacion, alerta o feedback usa UanifyUI. Prohibido alert(), confirm(), prompt() nativos.**

- UanifyUI.toast('Mensaje', 'success'|'error'|'warning'|'info', 'Titulo');
- UanifyUI.confirm('Titulo', 'Descripcion', onConfirm, 'Si confirmar', 'Cancelar');

Reglas:
1. Maximo 1 toast por accion del usuario.
2. Tipo correcto: success (completado), error (fallo bloqueante), warning (no bloqueante), info (contextual).
3. Titulos concisos (2-4 palabras en espanol).

---

## REGLA 0.23: Prohibicion de style="" Inline para Componentes Sistematizados

Los siguientes componentes tienen CSS completamente sistematizado. El uso de style="" inline sobre sus propiedades es una violacion de codigo:

| Componente | Propiedades PROHIBIDAS inline |
|---|---|
| .form-input, .custom-select, input[type=*] | font-size, padding, border, border-radius, color, width |
| .btn-primary/secondary/danger | padding, font-size, background, border-radius, color |
| .modal-backdrop, .modal-box | padding (solo max-width en .modal-box permitido) |
| .modal-header, .modal-body, .modal-footer | display, flex-direction, gap, padding, justify-content |
| .field-label | font-size, font-weight, margin-bottom |

Excepciones permitidas con style="":
- display: none / display: flex para mostrar/ocultar desde JS dinamicamente.
- max-width en .modal-box para variantes de modal ancho.
- Propiedades de posicion en overlays y animaciones unicas.

---

## REGLA 0.24: Consistencia de Estructura de Vistas

1. Encabezado de vista: Toda vista usa .view-hero-bar para titulo + subtitulo + KPI banner.
2. Grids responsivos: grid-template-columns: repeat(auto-fill, minmax(Xpx, 1fr)) sin breakpoints manuales.
3. Sub-pestanas: .sub-nav-tabs > .sub-tab-btn[data-subtab] activa .sub-tab-content[id].
4. Prohibido scroll infinito vertical: encapsular tablas en contenedores scrollables .data-table-wrapper.

---

## REGLA 0.25: Integridad de Datos en localStorage

1. Prefijo estandar: Todas las claves usan uanify_ (ej. uanify_logged_user, uanify_shift_schedule).
2. try/catch obligatorio: Todo acceso a localStorage o sessionStorage debe estar protegido.
3. Prohibido: Almacenar contrasenas, tokens de API o datos sensibles en localStorage.
4. Validacion de esquema: Verificar que la estructura es valida antes de usar datos almacenados.

---

## REGLA 0.26: Cabeceras de Módulo Fijas al Scroll (MANDATORIA)

**En todos los módulos del sistema (Terminal, Andon, Almacén, Operadores, Ingeniería, Dirección, Configuración), el encabezado `.view-hero-bar` debe permanecer sticky/fijo al hacer scroll vertical.**

1. **Elementos Fijos:** El título del módulo (`.view-title`), el texto descriptivo (`.view-subtitle`) y los botones de acción/guardado (ej. `💾 Guardar Configuración`, `+ Registrar Operador`, `Simular`) deben quedar siempre visibles y accesibles en la parte superior del viewport sin importar cuánto descienda el usuario en la página.
2. **Estilo Glassmorphism:** La barra hero fija debe incorporar `background: rgba(248, 250, 252, 0.95); backdrop-filter: blur(12px);` y una elevación sutil para que el contenido pase por debajo con legibilidad impecable.
3. **Responsividad:** En pantallas tablet/móviles (<= 1024px), los márgenes y paddings negativos deben adaptarse automáticamente (`margin: -16px -18px 16px -18px; padding: 14px 18px;`).

---

## REGLA 0.27: Estructura Estricta de Modales y Diálogos de Confirmación (MANDATORIA)

**Todos los modales y ventanas de diálogo in-app deben implementar obligatoriamente la arquitectura de 4 partes con cabecera y pie fijos:**

1. **Cabecera Fija Superior (`.modal-header`):**
   - Debe tener `position: sticky; top: 0; z-index: 10; background: #FFFFFF; flex-shrink: 0;`.
   - Contiene el título (`h3`), subtítulo opcional (`.modal-header-sub`) y obligatoriamente el botón de cierre táctil (`.modal-close` con `&times;`).
2. **Cuerpo Central Desplazable (`.modal-body`):**
   - Debe tener `flex: 1; min-height: 0; overflow-y: auto;`.
   - Contiene todos los campos del formulario, selectores y notas operativas. Es el único elemento que genera scroll.
3. **Pie Fijo Inferior (`.modal-footer`):**
   - Debe tener `position: sticky; bottom: 0; z-index: 10; background: #FAFAFA; flex-shrink: 0;`.
   - Contiene los botones de acción fijados: botón secundario a la izquierda (`.btn-secondary` "Cancelar") y botón primario de acción/guardado a la derecha (`.btn-primary`).
4. **Formularios Integrados:** Cuando un modal utiliza un elemento `<form>`, este debe envolver directamente a `.modal-body` y `.modal-footer` con la regla `.modal-box > form { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; height: 100%; }`.
5. **Diálogo de Confirmación In-App (`UanifyUI.confirm`):** Debe seguir exactamente esta misma estructura, incluyendo botón de cierre (`.modal-close`) en la esquina superior derecha y pie con botones Cancelar y Confirmar.

---

## REGLA 0.28: CRUD Completo de Supervisores y Asignación Departamental (MANDATORIA)

1. **Edición Integral de Usuario / Supervisor:** La plataforma debe permitir editar Nombre, Correo Electrónico, Rol y Permisos Modulares de cualquier usuario existente.
2. **Asignación Departamental Interactiva:**
   - Para el rol Supervisor, debe desplegarse un panel con los 14 departamentos de planta (D-01 a D-14) mediante checkboxes interactivos.
   - Debe incluir botones de acción rápida: "Seleccionar Todos" y "Limpiar Selección".
   - Debe calcular y mostrar información en tiempo real: número de estaciones asignadas y cantidad total de operadores de planta bajo el mando del supervisor en esas áreas.
3. **Sincronización Inmediata:** Al guardar los cambios, la tabla de usuarios (`#usersTableBody`), los badges informativos y el selector de usuario activo del sidebar (`#sidebarUserSelect`) deben actualizarse de inmediato sin requerir recargar la página.
4. **Eliminación Segura:** La baja de usuarios debe requerir confirmación modal in-app via `UanifyUI.confirm()` y no permitir la eliminación del Administrador General principal.

---

## REGLA 0.29: CRUD Completo de Operadores de Planta (MANDATORIA)

1. **Disponibilidad Dual:** La gestión de operadores debe estar plenamente funcional tanto en el módulo de *Configuración de Planta* (`subtab-config-operators`) como en el módulo de *Padrón de Operadores de Planta* (`view-operators`).
2. **Acciones por Registro:** Cada fila de operador debe incluir obligatoriamente los botones `✏️ Editar` y `🗑️ Eliminar`.
3. **Formulario Unificado Alta/Edición:**
   - El modal de operador (`#modalRegisterOperator`) debe admitir tanto el alta de nuevo personal como la edición de personal existente (`#opOriginalEmpId`).
   - Campos requeridos: No. Nómina (identificador único), Nombre Completo, Departamento Asignado (select con las 14 estaciones), Máquina / Puesto de Trabajo, Estatus Operativo (Activo, Incapacidad, Capacitación, Baja Temporal) y Turno.
4. **Actualización de Métricas:** Al registrar, modificar o dar de baja a un operador, el banner de estadísticas de planta (`#opStatTotal`, `#opStatActive`, etc.) debe recalcularse y reflejar los valores vigentes al instante.

---

## REGLA 0.30: Diseño Estético Premium de Alertas de Éxito y Toasts (MANDATORIA)

**Las alertas y notificaciones del sistema deben tener un aspecto visual pulido, sofisticado y moderno (anti-genérico).**

1. **Acrílico Glassmorphism:** Fondo degradado translúcido con desenfoque de fondo (`backdrop-filter: blur(16px)`), bordes sutiles y radio de curvatura suave (`14px`).
2. **Tipología de Éxito (`toast-success`):**
   - Fondo sutil degradado esmeralda (`linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 253, 244, 0.95))`).
   - Borde refinado en verde esmeralda translúcido (`rgba(16, 185, 129, 0.38)`).
   - Icono distintivo: Badge circular de 34x34px con gradiente esmeralda (`#10B981` a `#059669`), sombra verde brillante e icono SVG de checkmark en blanco.
   - Título en color verde bosque intenso (`#065F46`) con peso bold/extra-bold (`font-weight: 800`).
3. **Barra de Progreso Regresiva (`.toast-progress`):** Cada toast debe incorporar una barra inferior animada de 3px que desciende progresivamente a lo largo de 4.5 segundos.
4. **Pausa Ergonómica:** Al colocar el cursor sobre el toast (`mouseenter`), la cuenta regresiva debe pausarse automáticamente para permitir la lectura tranquila del mensaje, y reanudarse al salir (`mouseleave`).
