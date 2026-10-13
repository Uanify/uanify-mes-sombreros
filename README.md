# Tombstone Hats MES · Control de Planta & Tablero Andon
### Digitalización Industrial para Planta Matriz Tombstone en San Francisco del Rincón, Guanajuato

[![Versión](https://img.shields.io/badge/Versi%C3%B3n-2.94.0-8B5E3C?style=flat-square&logo=git)](https://github.com/Uanify/uanify-mes-sombreros)
[![Despliegue](https://img.shields.io/badge/GitHub%20Pages-Live-green?style=flat-square)](https://uanify.github.io/uanify-mes-sombreros/)
[![Operación](https://img.shields.io/badge/R%C3%A9gimen-Turno%20%C3%9Anico-blue?style=flat-square)](https://uanify.github.io/uanify-mes-sombreros/)

Sistema MES interactivo desarrollado por **[Uanify](https://github.com/Uanify)** para la digitalización integral de Planta Matriz Tombstone Hats en San Francisco del Rincón, Guanajuato.

- **Web Oficial del Cliente:** [Tombstone Hats](https://tombstone.mx/)
- **Demostración en Vivo:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)
- **Organización:** [Uanify](https://github.com/Uanify)
- **Diagrama de Flujo y Catálogo de Módulos (MVP Oficial):** [docs/Oficial/DIAGRAMA_DE_FLUJO_Y_MODULOS_MES.md](file:///c:/Users/andre/.gemini/antigravity-ide/scratch/uanify-mes-sombreros/docs/Oficial/DIAGRAMA_DE_FLUJO_Y_MODULOS_MES.md)
- **Propuesta Técnica y Arquitectura Operativa MVP:** [docs/Oficial/PROPUESTA_TECNICA_MVP_TOMBSTONE_MES.md](file:///c:/Users/andre/.gemini/antigravity-ide/scratch/uanify-mes-sombreros/docs/Oficial/PROPUESTA_TECNICA_MVP_TOMBSTONE_MES.md)
- **Banco Unificado de Dudas y Validaciones Técnicas:** [docs/Oficial/BANCO_UNIFICADO_DUDAS_Y_VALIDACIONES.md](file:///c:/Users/andre/.gemini/antigravity-ide/scratch/uanify-mes-sombreros/docs/Oficial/BANCO_UNIFICADO_DUDAS_Y_VALIDACIONES.md)
- **Documento Maestro de Arquitectura y Reglas:** [SISTEMA_TOMBSTONE_MES.md](file:///c:/Users/andre/.gemini/antigravity-ide/scratch/uanify-mes-sombreros/SISTEMA_TOMBSTONE_MES.md)
- **Requerimientos del Sistema (PRD / SRS):** [docs/Interno/REQUERIMIENTOS_DEL_SISTEMA.md](file:///c:/Users/andre/.gemini/antigravity-ide/scratch/uanify-mes-sombreros/docs/Interno/REQUERIMIENTOS_DEL_SISTEMA.md)

---

## Arquitectura Funcional Tombstone Hats · 7 Módulos del MVP (v2.94.0)

Alineada estrictamente con el **Diagrama de Flujo del Sistema & Catálogo de Módulos (MVP)**:

| Módulo | Usuario Objetivo | Funcionalidad Clave del Alcance Oficial |
|---|---|---|
| **Módulo 1: Programación, Loteo e Impresión** | Ingeniería Admin | Ingesta de pedidos CONTPAQi SQL Server, captura de fecha compromiso con semáforo, segmentación manual flexible de lotes y sublotes, y Centro de Impresión de Tarjetas Viajeras oficiales con QR en hoja carta para fundas plásticas. |
| **Módulo 2: Monitoreo de Piso, WIP y Tablero 5 KPIs** | Supervisores, Dirección y Planta | (1) WIP en vivo por departamento, (2) Piezas producidas por área, (3) Consumo materiales vs. BOM, (4) Mapeo de reprocesos C1-C5 con causa raíz y depto causante, (5) Tiempo de entrega vs. fecha compromiso. |
| **Módulo 3: Terminal Táctil de Piso** | Supervisores y Operadores | Consola táctil de piso regida por el usuario activo (RBAC y departamentos asignados): escáner QR de tarjeta viajera, registro de depósito en almacén intermedio, división en sublotes en D07/Rampa y captura ágil de paros con stepper y cronómetro. |
| **Módulo 4: Puntos de Control e Inspección (C1 a C5)** | Calidad y Supervisores | Aprobación/Rechazo en filtros C1 a C5 con retornos de reproceso específicos (C1 descuenta en corte, C2 retorna a D06 Refuerzo, C3 retorna a D06 Pintura, C4 retorna a D07 Hidráulicas Alineado, C5 retorna a D10 Adorno). |
| **Módulo 5: Subensambles (T5) & Ficha Técnica Multiperspectiva** | Operación y Calidad Final | Semáforo de buffer en Adorno (tafiletes por talla) y visualización de fotografías oficiales autorizadas de muestra en múltiples perspectivas (Frente, Hendidura de copa, Toquilla/herraje, Tafilete interior, Ángulo 3/4) para cotejo físico. |
| **Módulo 6: Pre-Nómina de Destajo y Reportes** | Recursos Humanos e Ingeniería | Acumulado semanal de piezas concluidas por operador con base en tarifa fija ($/pza) y exportación administrativa en 1 clic a Microsoft Excel / CSV. |
| **Módulo 7: Microservicio Puente CONTPAQi SQL Server** | TI e Integración LAN | Vistas y SPs en red local ($0 licencias SDK) para sincronización de pedidos, salida de materia prima y entrada de producto terminado con folio de lote MES en observaciones. |

---

## Historial de Versiones (Changelog)

### [2.91.0] - 2026-10-13
- **Optimización Integral de Almacenes Intermedios Buffer & Erradicación de Scroll Horizontal:**
  - **Eliminación Total de Tipo y Ubicación Física:** Se removió el concepto de "Tipo de Almacén" y "Ubicación Física" tanto del listado como de las fichas informativas de almacenes buffer.
  - **Remoción de Columna WIP:** Se eliminó la columna "Nivel WIP Actual" del catálogo de almacenes buffer, enfocando la vista en la gestión estructural de capacidades y asignación departamental.
  - **Filtrado Multi-Criterio Avanzado:** Incorporación de filtros simultáneos por (1) Buscador rápido, (2) Departamento asignado, (3) Supervisor a cargo y (4) Rango de capacidad máxima (Hasta 150 pzas, 151 a 200 pzas, Más de 200 pzas).
  - **Resolución de Estado de Carga:** Se eliminó el texto estático residual *"Cargando almacenes..."*, inicializando y sincronizando el conteo dinámico real de almacenes en la barra de filtros.
  - **Blindaje Anti-Scroll Horizontal en Modales y Formularios:** Se aplicó `overflow-x: hidden !important` y `box-sizing: border-box` en la capa de componentes base (`.modal-body`), corrigiendo los desbordamientos indeseados en modales de creación.
  - **Estandarización de Botones de Acción:** Botón de ver detalle estandarizado con `.btn-table-action` (32x32px, azul suave con icono SVG y cursor: pointer).

### [2.90.0] - 2026-10-13
- **Optimización Integral del Catálogo de Procesos & Gestión Modular de Maquinaria/Operadores:**
  - **Eliminación de Códigos Técnicos Invasivos:** Se removió la visualización del código en el listado de procesos, mostrando denominaciones limpias y oficiales.
  - **Remoción Total del Concepto de Tipo:** Se eliminó por completo la columna y el filtro de "Tipo" tanto de la tabla como de la barra de herramientas de procesos.
  - **Depuración de Columnas en Tabla Principal:** Se retiró la columna de máquinas asignadas del listado para evitar saturación visual por volumetría.
  - **Estandarización de Botones de Acción:** Se sustituyó el botón de ver detalle por la clase estandarizada `.btn-table-action` (azul suave `32x32px` con `cursor: pointer`).
  - **Modal Dedicado de Detalle de Proceso con Asignación/Desvinculación:**
    - Visualización completa de todas las máquinas asignadas al proceso y sus operadores respectivos del padrón de planta.
    - Desvinculación inmediata de máquinas con confirmación y toast reactivo.
    - Selector dinámico de asignación que lista únicamente máquinas que **no** se encuentren vinculadas a dicho proceso.

### [2.89.0] - 2026-10-13
- **Optimización de Visualización & Filtrado Multi-Criterio en Catálogo de Departamentos:**
  - **Eliminación de Códigos Técnicos Invasivos:** Se removió la visualización del código en el nombre del departamento, presentando una vista limpia con únicamente la denominación oficial.
  - **Remoción de Columna Tiempo de Ciclo:** Se retiró la columna de Tiempo de Ciclo de la tabla principal de Departamentos para dar prioridad a las relaciones operativas clave.
  - **Visualización Homologada de Almacenes Buffer Múltiples:** Los almacenes buffer se gestionan y presentan con la misma estructura ergonómica que los procesos vinculados (`.chip-clean` individuales con badge interactivo `+N más`).
  - **Filtrado Multi-Propiedad Extendido:** Se incorporaron selectores de filtrado simultáneos por Supervisor, por Familia de Proceso y por Almacén Buffer de Salida, con sincronización de contador reactivo y botón de restablecimiento.

### [2.88.0] - 2026-10-13
- **Eliminación de Pestañas Superiores Redundantes en Configuración de Planta:**
  - **Navegación Unificada Directa desde el Navbar / Sidebar:** Toda la navegación entre entidades maestras (Departamentos, Procesos, Almacenes Buffer, Maquinaria, Calidad, Rutas, Turno, RBAC, ERP) se gestiona de forma directa, limpia y exclusiva desde el menú lateral (`#mainNav`).
  - **Limpieza Visual Integral:** Se eliminó la fila superior de sub-pestañas redundantes (`.sub-nav-tabs`) de la vista `#view-config`, otorgando el 100% del área útil de pantalla a los catálogos y formularios de gestión de planta.
  - **Enrutamiento Directo e Invocación de Renders:** Al hacer clic en cualquier entidad de configuración desde el sidebar, `js/app.js` activa directamente el contenedor de la entidad y ejecuta su función de renderizado (`renderDepartmentsConfig()`, `renderProcessesConfig()`, `renderWarehousesConfig()`, etc.).

### [2.87.0] - 2026-10-12
- **Manejador Global Universal de Cierre de Modales (Regla 0.20):**
  - **Cierre Inmediato Garantizado:** Se implementó `initGlobalModalHandlers()` en `js/app.js`, que intercepta universalmente cualquier botón de cierre `.modal-close` o con atributo `data-dismiss="modal"` y remueve la clase `.active` de forma inmediata.
  - **Doble Protección por Clic Fuera y Tecla Escape:** Se habilitó el cierre al hacer clic directamente en el backdrop (`.modal-backdrop`) fuera del cuerpo del modal y mediante la pulsación de la tecla `Escape`.
  - **Listeners Específicos:** Se agregaron listeners directos en `js/config.js` para `btnCloseDeptViewerModal` y `btnCloseDeptViewerBtn` (botón 'Cerrar Detalle').

### [2.86.0] - 2026-10-12
- **Corrección Arquitectónica: Asignación Estricta de WIP y Capacidad por Almacén Buffer:**
  - **El WIP le pertenece exclusivamente al Almacén Buffer:** Se eliminó la columna errónea de "Capacidad WIP" de la tabla maestra de Departamentos, dado que los departamentos representan estaciones de flujo productivo y mano de obra, mientras que el almacenamiento temporal y el stock en tránsito (WIP) se concentran físicamente en los pulmones y almacenes intermedios de acopio.
  - **Refactorización de Formularios y Vistas:** Se trasladó el atributo de Capacidad Máxima WIP a los Almacenes Intermedios Buffer (`#subtab-config-warehouses`, modales de alta y visor de detalle de departamento), asociando a los departamentos únicamente su Tiempo de Ciclo estándar de manufactura.
  - **Visor de Departamento:** Muestra claramente el tiempo de ciclo operativo por estación y desglosa en la sección de almacenes la capacidad WIP específica de cada pulmón de salida.

### [2.85.0] - 2026-10-12
- **Separación Estricta de Entidades en Listados y Navegación Independientes:**
  - **Listados Dedicados e Individuales:** Se desacopló la vista mixta y se implementaron 5 catálogos independientes con sus propias tablas, filtros y modales:
    1. *Catálogo de Departamentos* (`#subtab-config-depts`): listado de estaciones con supervisor, capacidad WIP, tiempo de ciclo, procesos y almacén de transferencia.
    2. *Catálogo de Procesos* (`#subtab-config-procs`): listado oficial de procesos (manufactura / calidad), tiempo de ciclo y maquinaria asignada vinculado a su departamento.
    3. *Catálogo de Almacenes Intermedios Buffer* (`#subtab-config-warehouses`): listado de almacenes físicos, ubicación en nave, capacidad máxima y nivel WIP en vivo.
    4. *Catálogo de Maquinaria & Estaciones de Trabajo* (`#subtab-config-machines`): listado de máquinas y prensas, proceso asociado, estatus operativo y padrón de operadores asignados.
    5. *Catálogo de Filtros de Calidad C-XX* (`#subtab-config-quality`): tolerancias, criterios e inspectores responsables.
  - **Navegación Modular en Sidebar y Barra de Pestañas:** Tanto la barra lateral izquierda como la barra de sub-pestañas de Configuración cuentan con botones directos e independientes para cada una de las 5 entidades, manteniendo la vinculación jerárquica estricta (`Depto -> Procesos -> Máquinas -> Operadores` y `Depto -> Almacenes / Filtros de Calidad`).

### [2.84.0] - 2026-10-12
- **Corrección Integral y Blindaje de Apertura de Modales y Formularios:**
  - **Resolución de Referencia `selectNewRole` y Exposición de `window.openCreateUserModal`:** Se corrigió la asignación de variable del selector de roles en `js/config.js` (`document.getElementById('newRoleSelect')`), eliminando el bloqueo que impedía el despliegue del modal de usuarios y la inicialización de listeners.
  - **Apertura Dual e Inquebrantable de Modales:** Se dotó a los botones de creación (`+ Crear Nuevo Usuario`, `+ Nuevo Departamento`, etc.) de manejadores duales (event listener + `onclick` directo en DOM) garantizando despliegue inmediato en cualquier dispositivo o interacción.
  - **Blindaje CSS para Modales (`.modal-backdrop.active`):** Se definió `display: flex !important;` en `css/components.css` para sobreescribir cualquier conflicto de estilos inline residuales.
  - **Filtrado Seguro de Procesos:** Se protegió la evaluación de `st.processes` con `typeof st.processes === 'string'` evitando interrupciones en tiempo de ejecución.

### [2.83.0] - 2026-10-12
- **Segmentación Directa en Barra Lateral por Entidad & Optimización Total de Pestañas y Filtros:**
  - **Barra Lateral Segmentada por Entidades de Configuración:** En el sidebar izquierdo se desglosó el grupo "Configuración de Planta" en accesos directos por entidad con iconos dedicados: *Departamentos & Almacenes*, *Filtros de Calidad (C-XX)*, *Rutas de Fabricación*, *Parámetros de Turno*, *Usuarios & Permisos (RBAC)* e *Integración CONTPAQi / ERP*.
  - **Navegación Fluida e Inmediata entre Pestañas:** Se optimizó `initSubTabs()` eliminando capas anidadas conflictivas. Cada pestaña responde al primer clic instantáneamente y se mantiene sincronizada bidireccionalmente con la barra lateral.
  - **Rediseño Profesional de Barras de Filtrado Multi-Criterio:** Separación limpia de `.filter-toolbar-inputs` y `.filter-toolbar-actions` (badge de conteo y botón Limpiar alineados a la derecha), con selectores compactos (`select-sm`, 40px) y anchos adaptativos ergonómicos para evitar cualquier desborde o apiñamiento visual.

### [2.82.0] - 2026-10-12
- **Segmentación de Sub-Navegación en Configuración & Jerarquía Relacional Completa:**
  - **Segmentación de Pestañas en 3 Categorías Industriales:** Para evitar ruido visual y saturación horizontal de pestañas en pantallas táctiles y escritorio, la navegación de Configuración se organizó en 3 grandes grupos con selectores tipo pill:
    1. *Estructura & Calidad:* Departamentos, Procesos, Máquinas, Almacenes Intermedios y Filtros de Calidad (`C-XX`).
    2. *Rutas & Parámetros:* Rutas & Secuencias de Fabricación por Modelo y Parámetros de Turno & Alertas WIP.
    3. *Usuarios & ERP:* Usuarios & Privilegios RBAC e Integración CONTPAQi / ERP.
  - **Jerarquía Relacional de Planta Estricta:**
    - **Departamento:** Contiene múltiples procesos únicos, múltiples almacenes únicos y múltiples filtros de calidad únicos.
    - **Proceso:** Contiene una o varias máquinas / estaciones de trabajo.
    - **Máquina / Puesto:** Permite asignar uno o más operadores del padrón de planta (`modalCreateMachineStandalone`).
    - **Filtro de Calidad (`C-XX`):** Requiere asignación obligatoria de **Departamento Responsable** (`modalCreateQualityArea`), reflejado en una nueva columna de la tabla maestra de calidad.
  - **Visor Enriquecido de Departamento:** La ventana modal de detalle (`modalDeptDetailViewer`) ahora desglosa de manera integral: (1) Procesos de fabricación, (2) Filtros de calidad vinculados, (3) Máquinas con sus operadores asignados y (4) Almacenes intermedios buffer.
  - **Sincronización en Tabla Maestra de Departamentos:** Los chips de procesos ahora incorporan los filtros de calidad correspondientes al departamento.

### [2.81.0] - 2026-10-12
- **Consolidación a 1 Solo Padrón de Operadores en todo el Sistema MES:**
  - **Ubicación Única Centralizada:** Se eliminó la sub-pestaña duplicada de operadores dentro del módulo de Configuración de Planta (`subtab-config-operators`), dejando el **Padrón de Operadores** como una vista única, accesible e integrada en el sidebar (`data-tab="operators"`).
  - **Limpieza de Interfaz:** La sub-navegación de Configuración se redujo a 5 sub-pestañas operativas limpias (*Departamentos & Almacenes*, *Filtros de Calidad*, *Rutas & Secuencias*, *Parámetros & Turno*, *Usuarios RBAC*, *Integración COMPAC*).
  - **Sincronización Normativa:** Actualización de la **Regla 0.29** en `AGENTS.md` y de los requerimientos en `docs/Interno/REQUERIMIENTOS_DEL_SISTEMA.md`.

### [2.80.0] - 2026-10-12
- **Gestión Jerárquica y Creación Independiente de Máquinas (Máquina ⊂ Proceso ⊂ Departamento):**
  - **Botón y Modal `+ Nueva Máquina`:** Se implementó la capacidad de dar de alta máquinas y estaciones de trabajo de forma independiente, asignándolas de manera relacional al proceso específico al que pertenecen dentro de su respectivo departamento.
  - **Cascada y Tarjeta de Contexto en Tiempo Real:** El modal cuenta con selección dinámica de departamento, filtrado de procesos existentes de dicho departamento y previsualización de la ruta jerárquica asignada (`Departamento → Proceso`).
  - **Refactorización del Modal de Proceso:** Se enriqueció la descripción del campo de máquinas en `+ Nuevo Proceso` para clarificar que múltiples máquinas operan dentro de un mismo proceso.
  - **Actualización del Visor de Departamento:** El visor de departamento muestra de forma explícita a qué proceso pertenece cada máquina instalada.

### [2.79.0] - 2026-10-12
- **Consolidación Integral a 3 Roles Oficiales en todo el Sistema MES:**
  - **Homologación de Perfiles de Acceso:** En estricto apego al alcance técnico y propuesta oficial, se unificó la jerarquía del sistema en exactamente 3 roles con privilegios inmutables:
    1. **Ingeniero (Admin Mayor):** Acceso total e irrestricto (Dirección General e Ingeniería de Planta).
    2. **Supervisor de Planta:** Acceso a Terminal de Piso de sus áreas asignadas, Escaneo QR, Almacenes Intermedios, Padrón de Operadores y Andon.
    3. **Inspector de Calidad:** Acceso a Terminal de Piso para dictamen y liberación/rechazo en los 5 filtros de calidad (C1 a C5), Almacenes y Andon.
  - *(Nota Operativa: El personal de máquina conforma el Padrón de Operadores sin usuario de login).*
  - **Actualización de UI y Filtros:** Selectores de roles en creación/edición de usuarios y filtros de tabla depurados para reflejar únicamente las 3 opciones oficiales.
  - **Actualización Documental & Reglas:** Sincronización en `AGENTS.md` (Regla 0.5) y `docs/Interno/REQUERIMIENTOS_DEL_SISTEMA.md`.

### [2.78.0] - 2026-10-12
- **Corrección Estructural y Ergonómica del Modal de Departamento:**
  - **Reparación de Nombres Truncados de Máquinas:** Se corrigió el bug de truncamiento en el input de máquina (que mostraba erróneamente `de Tendido 12m Alumínio` en lugar de `Mesa de Tendido 12m Alumínio`) eliminando particiones defectuosas y reparando el estado en memoria.
  - **Arquitectura de Scroll Fijo & Limpieza Visual:** Se eliminaron scrolls dobles y estilos inline que desbordaban la caja modal. Encabezado y pie de página ahora son estrictamente estáticos con scroll central exclusivo en `.modal-body`.
  - **Acordeón Ergonómico Limpio:** Las secciones inician en un estado equilibrado y legible sin amontonar los 4 bloques simultáneamente.

### [2.75.0] - 2026-10-12
- **Permisos Inmutables por Rol & Eliminación de Correo en Alta de Usuario:**
  - **Permisos Automatizados e Inalterables:** Se reemplazó el checklist manipulable de permisos modulares por una matriz estricta e inmutable vinculada al rol asignado (*Administrador General*, *Ingeniero de Procesos y Calidad*, *Supervisor de Planta*, *Inspector de Calidad*). Al cambiar el rol se previsualiza dinámicamente el alcance sin checklists arbitrarios.
  - **Eliminación del Campo Correo:** Se suprimió el input visible de correo electrónico en la creación de usuario.
- **Asignación Relacional Jerárquica en Operadores (Máquina ⊂ Proceso ⊂ Departamento):**
  - **Cascada Dinámica:** El formulario de alta y edición de operador permite seleccionar el *Departamento*, derivando sus *Procesos* asociados, y de este se desprenden las *Máquinas y Puestos de Trabajo* instalados.
  - **Tarjeta de Contexto Operativo:** Visualización en tiempo real de la jerarquía asignada y reflejo explícito en la tabla del Padrón de Operadores.

### [2.74.0] - 2026-10-12
- **Depuración Integral del Padrón de Operadores (Mano de Obra):**
  - **Supresión de Mención de Turno Único:** Se eliminó la etiqueta redundante de `Turno Único` debajo del nombre del operador y de los filtros de búsqueda, dado que el régimen de planta es Turno Único implícito.
  - **Eliminación de Piezas Procesadas Hoy y Estatus:** Se suprimieron las columnas de *Piezas Procesadas Hoy* y *Estatus*, así como los filtros de estatus, turnos y rendimiento.
  - **Estructura Limpia de 5 Columnas:** La tabla ahora presenta de forma ágil: *No. Nómina*, *Nombre del Operador*, *Departamento Asignado*, *Máquina / Puesto* y *Acciones*.

### [2.73.0] - 2026-10-12
- **Depuración Integral del Catálogo y Gestión de Usuarios (RBAC):**
  - **Eliminación de IDs Técnicos, Correo y Estatus:** Se suprimió la columna `ID`, el subtítulo de `Correo` y la columna de `Estatus` de la tabla de usuarios, dejando una vista limpia con Nombre del Usuario, Rol en Planta, Departamentos Asignados, Permisos Modulares y Acciones.
  - **Integración Completa de Roles Oficiales de Planta:** Se alinearon los roles en filtros y modales incorporando explícitamente a: *Administrador General*, *Ingeniero de Procesos y Calidad*, *Supervisor de Planta* e *Inspector de Calidad (Paradas C1 a C5)*.
  - **Consulta Limpia de Departamentos Asignados (Modal Dedicado):** Se reemplazó el listado abrumador de departamentos en celda por un badge sintetizado con botón **"Ver Detalle"**, abriendo un modal enfocado (`#modalUserDeptsViewer`) que detalla las estaciones y operadores a cargo sin saturar la tabla.

### [2.72.0] - 2026-10-12
- **Depuración de Parámetros de Turno & Operación de Planta:**
  - **Eliminación de Takt Time Estándar:** Se removió definitivamente el campo de Takt Time de la tarjeta de parámetros operativos, ya que la métrica rectora de planta es el avance real de lotes y el monitoreo WIP.
  - **Supresión de Modo de Arranque de Turno (US-17):** Se retiró el contenedor de estado y botón de arranque dinámico del formulario de configuración para evitar controles innecesarios en la vista del administrador.
  - **Eliminación de Días de Operación de Planta:** Se suprimió el campo de texto de días laborables, manteniendo únicamente el horario formal de jornada (Entrada, Salida y Receso/Comida con cálculo de duración).

### [2.71.0] - 2026-10-12
- **Depuración Integral de Filtros de Calidad: Criterios, Ubicación y Asignación de Inspector Requerida:**
  - **Eliminación de Ubicación y Criterios:** Se suprimieron de la tabla y del modal los campos redundantes de *Ubicación / Área en Planta* y *Criterios de Inspección / Tolerancias*, reduciendo la tabla a 3 columnas limpias: *Filtro de Calidad*, *Inspector Responsable* y *Acciones*.
  - **Asignación de Inspector Obligatoria y Sin Valor por Defecto:** El modal de alta de filtro ahora inicia con `-- Seleccionar Inspector Responsable --` sin inspector precargado y valida obligatoriamente que se elija un usuario del sistema antes de guardar.
  - **Población Dinámica de Usuarios:** El selector de inspector lista a los usuarios registrados en el sistema MES con su nombre y rol correspondiente.
- **Depuración y Limpieza del Catálogo de Filtros de Calidad:**
  - **Eliminación de IDs/Códigos Técnicos:** Se suprimió la columna `Código` (`C-XX`) de la tabla de Filtros de Calidad, priorizando el nombre operativo claro del punto de inspección.
  - **Eliminación de Tiempo de Ciclo y Ritmos Teóricos:** Se removió la columna y campo de `Tiempo de Ciclo` tanto de la tabla como del modal de captura de filtros.
  - **Supresión de Estatus:** Siguiendo la regla operativa de que el estatus carece de funcionalidad y agrega ruido visual, se eliminó la columna `Estatus`, las pills asociadas y el selector de filtro por estatus en la barra de herramientas.
  - **Formulario y Tabla Limpios:** La tabla ahora presenta 4 columnas legibles: *Filtro de Calidad & Área*, *Criterios & Tolerancias*, *Inspector Responsable* y *Acciones*.

### [2.69.0] - 2026-10-12
- **Modal de Departamentos Colapsable, Purga de Takt Time/Ubicación y Búsqueda Ágil de Supervisores:**
  - **Secciones Colapsables en Acordeón (.modal-collapse-section):** Las secciones 1 a 4 del formulario de alta/edición de departamentos ahora son plegables con chevron interactivo y cabeceras ergonómicas.
  - **Depuración de Campos No Operativos:** Se eliminaron del modal y de la tabla el campo **Takt Time / Ritmo Estándar**, la **Descripción Técnica & Criterios Operativos**, la **Ubicación Física de Almacenes**, así como el código de proceso, tipo y ciclo, dejando una captura limpia enfocada en: Nombre, Capacidad WIP, Procesos, Máquinas, Almacenes y Supervisión.
  - **Búsqueda Dinámica de Supervisores:** Se integró un campo de búsqueda en vivo (`#newDeptSupervisorSearch`) dentro del selector de supervisores para filtrar instantáneamente por nombre.
  - **Tooltips Estandarizados (Micro-puntos ⓘ):** Todos los textos descriptivos extensos fueron reemplazados por tooltips contextuales para mantener los formularios limpios y legibles.
- **Sub-pestañas Sticky, Tooltips Prioritarios, Creación Dedicada de Procesos/Almacenes y Catálogo Limpio de Departamentos:**
  - **Sub-navegación Sticky (.sub-nav-tabs):** Las pestañas internas de cada módulo ahora se mantienen fijas en la parte superior (`position: sticky; top: 72px; z-index: 95`) al hacer scroll vertical en pantalla, sin desaparecer ni quedar ocultas.
  - **Prioridad Absoluta de Tooltips & Info-tips (.info-tip-popup):** Los tooltips ahora cuentan con elevación de capa máxima (`z-index: 99999999 !important`), garantizando que se desplieguen siempre por encima de pestañas fijas y cabeceras.
  - **Creación Standalone de Procesos y Almacenes (Regla de Unicidad):**
    - Modal `+ Nuevo Proceso`: Permite crear procesos de manufactura o calidad y asignarlos a un departamento específico. Valida que si un proceso ya está asignado no se pueda duplicar en otro.
    - Modal `+ Nuevo Almacén Buffer`: Permite registrar almacenes intermedios WIP asignados de forma exclusiva a un departamento.
  - **Catálogo Limpio de Departamentos (Sin IDs Técnicos Invasivos):**
    - Se eliminaron los códigos crudos (`D-XX`, `PROC-XX`, `TEN-01`, `ALM-INT-01`) de la vista principal para centrarse en nombres legibles de planta.
    - Columna independiente para el **Supervisor Asignado**.
    - Procesos y Máquinas compactados con vista de los primeros 2 elementos y botón interactivo `+N más...` para consultar el desglose completo.
    - Modal `Visor de Detalles del Departamento` para inspeccionar la estructura relacional completa sin saturar la tabla.
- **Paro de Línea con Stepper Guiado, Cronómetro Vivo y Widget Flotante Global (RF-92):**
  - **Stepper de 3 Fases para Registro de Paros:**
    1. *Paso 1 (Estación & Motivo):* Selección de departamento, máquina o puesto de trabajo afectado y motivo principal de paro (SMED por cambio de molde, falta de vapor en caldera, falta de tafiletes/toquillas, falla mecánica/eléctrica o descanso/comida).
    2. *Paso 2 (Confirmación & Detalle):* Resumen del paro, captura opcional de observaciones de mantenimiento e impacto estimado en producción.
    3. *Paso 3 (Cronómetro Vivo Industrial):* Conteo automático segundo a segundo (`HH:MM:SS`) del tiempo muerto real transcurrido con hora de inicio y supervisor responsable.
  - **Multitarea y Widget Flotante Global Permanente:**
    - Botón *Minimizar y Continuar* que permite al operador o supervisor navegar por cualquier módulo o realizar lecturas QR sin detener el conteo.
    - Se despliega automáticamente un **Widget Flotante Global** (`#globalActiveDowntimeWidget`) en la esquina inferior derecha con indicador pulsante rojo, tiempo transcurrido en vivo y metadatos del paro.
    - Al hacer clic en el widget desde cualquier pantalla, se reabre instantáneamente el cronómetro para finalizar el registro (*Parar Registro & Guardar en Bitácora*).
  - **Persistencia en LocalStorage e Inyección en Bitácora Andon:**
    - Si la terminal se recarga o se cambia de pestaña, el paro activo se restaura automáticamente calculando con precisión los segundos transcurridos desde `startTimestamp`.
    - Al finalizar el paro, se calcula la duración exacta y se guarda en `UanifyState.downtimes`, actualizando la bitácora del Andon y la consola analítica de ingeniería.

### [2.63.0] - 2026-10-09
- **Modelo Relacional de Base de Datos y Entidades Estructuradas:**
  - **Relación Departamento → Procesos (1:N) & Almacenes (1:N) & Supervisores (M:N):**
    - Se estructura formalmente la colección relacional `UanifyState.processes` vinculada mediante clave foránea `deptCode`.
    - Un departamento agrupa uno o varios procesos de manufactura o paradas de inspección de calidad (donde los puntos de calidad `C-01` a `C-05` son tratados formalmente como entidades de proceso de tipo `calidad`).
    - Un departamento tiene asignados formalmente sus almacenes intermedios (buffers WIP de entrada y salida).
    - Un supervisor puede ser asignado a coordinar más de un departamento simultáneamente (`user.assignedDepartments`).
  - **Entidad Proceso → Máquinas y Áreas de Trabajo con ID Formal (1:N):**
    - Dentro de cada proceso se modela y gestiona una colección estructurada de máquinas y puestos de trabajo con su identificador único industrial (`PRE-01`, `PRE-02`, `HID-01`, `COR-01`, `COS-01`, etc.).
    - Nuevo gestor interactivo en el modal de departamento para agregar, remover y editar dinámicamente procesos y sus máquinas con ID asignado.
    - Persistencia automática de `uanify_processes` en `localStorage` sincronizada con `uanify_custom_stations`.
  - **Filtrado Multi-Criterio y Paginación Industrial:**
    - Filtro simultáneo por texto, supervisor y tipo de proceso con selector de página estandarizado y botonera unificada.

### [2.62.0] - 2026-10-09
- **Modelo Relacional de Planta & Configuración Estandarizada:**
  - **Eliminación del término "CRUD de Planta":** Reemplazado por interfaz industrial profesional *Departamentos, Procesos & Almacenes*.
  - **Entidades Relacionadas de Planta:**
    - Estructuración de que un departamento cuenta con 1 o varios **procesos** vinculados (manufactura, prensas o paradas de calidad).
    - Un departamento puede disponer de 1 o múltiples **almacenes intermedios** (buffers WIP de entrada y salida).
    - Un supervisor puede coordinar **más de un departamento** simultáneamente.
    - Registro explícito de **máquinas / áreas de trabajo** por proceso con su **identificador único formal** (ej. `PRE-01`, `COR-01`, `COS-01`, etc.) para mantenimiento y trazabilidad.
  - **Puntos de Calidad como Procesos:** Se formalizó que los puntos de control e inspección (`C-01` a `C-05`) son tratados como entidades de proceso de tipo calidad.
  - **Supresión de Estatus Innecesario:** Eliminada la columna y el selector de estatus activo/inactivo para departamentos, reflejando que las áreas físicas de nave existen de manera permanente.
  - **Filtrado Multi-Criterio Robusto & Paginación Industrial:** Implementada barra de filtros por búsqueda libre, supervisor y tipo de proceso, junto con paginación integrada (`.uanify-pagination-bar`) y botones de acción unificados (`.btn-table-action`).
  - **Alineación de Botón "Guardar Configuración":** Retirado del encabezado global de la vista y reubicado exclusivamente dentro de la sub-pestaña de Parámetros & Turno donde surte efecto operativo real.
- **Unificación Operativa del Mapa de Almacenes al Mismo Nivel:**
  - **Eliminación de Distinción Artificial:** Se suprimió la clasificación de "Almacenes Principales", reconociendo que **todos los almacenes y pulmones intermedios de planta operan al mismo nivel de relevancia industrial**.
  - **Homogeneización Visual:** Se eliminaron los botones divisores y se estructuraron todas las estaciones y almacenes con sus respectivos inventarios y lotes en tránsito en una cuadrícula única.
- **Sintetización Completa de Textos y Despliegue de Tooltips (.info-tip):**
  - Condensación de títulos y subtítulos en toda la interfaz eliminando redundancias y párrafos extensos.
  - Toda información descriptiva o de apoyo reside en micro-tooltips interactivos con icono ⓘ.

### [2.60.0] - 2026-10-09
- **Alineación Completa al Alcance Ejecutivo Oficial del Sistema (MVP):**
  - **Saneamiento Terminológico:** Sustitución definitiva del término "tarjeta madre" por **"Tarjeta Viajera de Lote"**, y eliminación de referencias a "carritos".
  - **Lotes y Sublotes Flexibles:** Eliminación de tamaños fijos rígidos; el sistema y la documentación formalizan que los tamaños de lotes y números de sublotes son definidos libremente por el usuario según la orden.
  - **Funcionalidades Alternas Industriales:** Integración formal de la bitácora de paros de máquina, semáforo de buffer para tafiletes/toquillas, visor de fotos de fichas técnicas, desvío de segundas/mermas sin frenar línea y pre-nómina a destajo en Excel.
  - **Sincronización Automatizada con Google Drive:** Documentos oficiales en Drive estructurados en carpetas `Oficial` e `Interno` con indentación jerárquica estandarizada.

### [2.54.0] - 2026-10-09
- **Flujo Oficial de Segmentación Manual Previa a Impresión (Módulo 1 MVP):**
  - **Ingesta Diaria de Pedidos desde ERP:** Botón `Sincronizar Pedidos SQL` que descarga las órdenes más recientes desde CONTPAQi SQL en red local.
  - **Estado "Pendiente de Segmentar":** Las órdenes recién llegadas ingresan bloqueadas para impresión, mostrando el botón prominente `Segmentar Lotes`.
  - **Proceso de Segmentación de Lotes y Sublotes:** El usuario define manualmente el tamaño de lote madre (60 pzas estándar) y el número de sublotes de rampa (15 pzas).
  - **Habilitación Condicional de Impresión:** Una vez confirmada la segmentación por Ingeniería, la fila se actualiza a color verde activo, desbloqueando `Ver Lotes` e `Imprimir QR`.

### [2.53.0] - 2026-10-09
- **Implementación de Partición y Creación Manual de Lotes (Módulo 1 MVP):**
  - **Modal Interactivo de Loteo:** Habilitado el botón `+ Nueva Orden de Producción` con captura de Folio O.P., Pedido ERP, Cliente, Modelo de Sombrero y Fecha Compromiso.
  - **Cálculo de Loteo en Tiempo Real:** Entrada numérica de piezas totales que calcula y visualiza automáticamente el número de lotes madre (60 pzas) y el número resultante de sublotes para Rampa (15 pzas).
  - **Generación Automática de Tarjetas QR:** Al crear la orden, se generan las tarjetas viajeras en el Centro de Impresión y se actualiza la cartera de producción con navegación directa a la vista de impresión en hoja carta.

### [2.52.0] - 2026-10-09
- **Corrección de Diseño de Tarjetas KPI en Programación & Lotes (Módulo 1):**
  - **Reemplazo de Grid Roto:** Eliminación de clases desfasadas (`dashboard-kpi-grid` / `kpi-card`) sin propiedades CSS y adopción del estándar industrial unificado `.exec-kpi-grid` y `.exec-card`.
  - **Tarjetas en Fila y Proporción:** Restituida la distribución horizontal uniforme en tarjetas cuadradas limpias con padding de 20px, sombras suaves `card-glass`, métricas de 26px en tipografía display y badges alineados a la derecha.
  - **Alineación de Barra Lateral:** El sidebar arranca en modo expandido por defecto para evitar cortes de texto en pantallas amplias de escritorio y tablet horizontal.

### [2.51.0] - 2026-10-09
- **Optimización Integral de Documentación Interna:** Alineación completa de `CASOS_DE_PRUEBA.md`, `HISTORIAS_DE_USUARIO.md`, `DIAGRAMAS_DE_FLUJO_USUARIOS.md`, `REGLAS_DE_NEGOCIO_Y_OPERACION_ACTUAL.md` y `GLOSARIO_Y_TERMINOLOGIA_PLANTA.md` al alcance oficial del MVP de 7 Módulos y Filtros C1 a C5.
- **Depuración de Documentos Redundantes:** Eliminación de notas de trabajo preliminares (`1_Estrategia...`, `2_Banco...`, `3_Minuta...`), borradores `.html` / `.pdf` y temporales `.docx`.
- **Corrección de Sintaxis en Configuración:** Resuelta duplicación de identificador `btnSaveConfig` en `js/config.js`, asegurando 0 errores de compilación/evaluación.

### [2.50.0] - 2026-10-09
- **Rediseño Integral de Tooltips Informativos (`Blue Industrial High-Contrast`):**
  - **Paleta Azul Industrial y Alto Contraste:** Sustitución del fondo y tono café por botones táctiles ergonómicos azul cielo/zafiro (`#E0F2FE` fondo, `#BAE6FD` borde, `#0284C7` icono e interacción hover/active a `#0284C7` sólido).
  - **Nuevo Icono SVG Nítido y Claramente Distinguible:** Reemplazo del diseño anterior con líneas delgadas difíciles de leer por un icono informativo con círculo exterior de 2.3px de grosor, barra vertical de alta visibilidad y punto superior relleno (`fill="currentColor"`), haciéndolo 100% reconocible en cualquier pantalla y tableta de planta.
  - **Posicionamiento Dinámico en Pantalla (Fixed Viewport Clamping):** Reescritura del algoritmo de cálculo a coordenadas de viewport (`getBoundingClientRect`), asegurando que las ventanas flotantes jamás queden cortadas por los bordes de la pantalla ni invadan botones o pestañas superiores.
- **Ergonomía Tablet-First:** Cursor `pointer !important` en todos los disparadores y soporte táctil sin retardo.

### [2.49.0] - 2026-10-09
- **Corrección de Jerarquía DOM y Despliegue de Sub-pestañas (`Layout Fix`):**
  - **Causa Raíz Diagnosticada:** Existía una etiqueta de cierre huérfana `</div>` al final del contenedor de atención del lote escaneado, provocando que la sub-pestaña `subtab-terminal-scanner` se cerrara antes de tiempo. Esto causaba que los contenedores subsiguientes (`subtab-terminal-tracker` y `subtab-terminal-metrics`) quedaran expulsados del flujo del panel, generando pantalla vacía y empalme al hacer clic en las pestañas.
  - **Validación Automatizada de Árbol DOM:** Auditoría matemática estricta de balance de etiquetas `<div>` (`net change = 0`) en las 7 secciones del sistema, asegurando que cada `.sub-tab-content` sea hijo directo y autónomo de su respectivo `.view-panel`.
  - **Navegación Táctil Inmediata:** Restaurada la visualización fluida de *Mapa de Almacenes Intermedios* y *Métricas & Recuentos de Turno*.
- **Erradicación del Selector Artificial de Hardware de Tablet:**
  - Se eliminó el selector manual de tablets (T1-T6) de la interfaz de la Terminal de Planta.
  - La terminal se rige **100% por la identidad del usuario autenticado (RBAC)** y su matriz de departamentos y almacenes asignados (ej. Roberto supervisa D-01 a D-04; Juan Manuel supervisa D-05 a D-08; Carlos y Edmundo auditan toda la planta).
  - Cumplimiento estricto de la regla de no depender del hardware físico sino del usuario que inicia sesión.
- **Limpieza de Vocabulario Prohibido (`REGLA 0.12`):** Erradicadas menciones residuales de hardware y marcas de tablet en títulos y subtítulos.
- **Ergonomía Tablet-First en Programación & Lotes (`REGLA 0.40`):**
  - **Eliminación de Scroll Vertical Excesivo:** Estructuración de la vista en dos sub-pestañas táctiles inmediatas (`.sub-nav-tabs`):
    1. *Cartera de Pedidos & Lotes Madre (60):* Tabla de órdenes CONTPAQi SQL Server con cálculo de días y semáforos, y acciones rápidas.
    2. *Centro de Impresión de Tarjetas QR (Fundas):* Previsualización e impresión por lote en formato hoja carta para fundas plásticas cosidas.
  - **Navegación Fluida Bidireccional:** El botón "Ver Lotes" y "Imprimir QR" conmuta automáticamente a la sub-pestaña de impresión; botón "Volver a Pedidos" regresa de inmediato a la lista sin scroll manual.
  - **Regla Maestra 0.40 en AGENTS.md:** Prohibición formal de apilar paneles complejos verticalmente para preservar ergonomía tablet.
- **Alineación Integral con el Alcance Oficial del Diagrama de Flujo & Catálogo de Módulos (MVP):**
  - **Módulo 1 (Programación, Loteo e Impresión):** Incorporado en el sidebar para perfiles Admin e Ingeniero. Tabla en vivo de pedidos de CONTPAQi SQL Server con cálculo de días y semáforos de entrega, detalle de lotes madre asociados (60 pzas) y Centro de Impresión de Tarjetas Viajeras oficiales con códigos QR en formato estándar carta para fundas plásticas cosidas.
  - **Módulo 2 (Tablero de los 5 KPIs Rectores):** Implementada sub-pestaña preferente en Andon con métricas exactas: (1) WIP en vivo por almacén/depto, (2) Piezas producidas por estación, (3) Consumo de materia prima vs. BOM estándar CONTPAQi, (4) Mapeo de reprocesos C1-C5 con causa raíz y estación causante, (5) Tiempo de entrega vs. fecha compromiso.
  - **Módulo 3 (Terminal Táctil con Selector T1 a T6):** Banner táctil en Terminal de Planta con selector directo de Tablets T1 a T6 (T1 Prensas D02/D05/D07/D08, T2 Patio Endopado D03, T3 Pintura y Refuerzo D06/C2/C3, T4 Hidráulicas Alineado D07/C4/D09, T5 Toquilla y Tafilete Subensambles, T6 Calidad Final D10/C5/Embarque).
  - **Módulo 4 (Control de Inspección y Retornos C1 a C5):** Rebobinado automático de lotes rechazados a sus estaciones específicas (C1 descuenta material en corte; C2 a Refuerzo D06; C3 a Pintura D06; C4 a Hidráulicas Alineado D07; C5 a Adorno D10).
  - **Módulo 5 (Ficha Técnica Multiperspectiva y Muestras Oficiales AWS S3):** Selector de ángulos de cotejo físico en la ficha técnica del sombrero (Frente, Hendidura de copa, Toquilla/herraje, Tafilete interior, Ángulo 3/4) y semáforo de buffer de tafiletes por talla en subensambles.
  - **Módulo 6 y 7:** Pre-nómina de destajo exportable a Excel y panel de sincronización con CONTPAQi Comercial LAN.
- **Módulo Aislado e Inmersivo de Lote Escaneado (`RF-89`):**
  - El escaneo QR abre el visor en pantalla completa y transiciona directamente a la confirmación de coincidencia de tarjeta viajera física (`#modalVerifyScannedCard`).
  - Al confirmar, el lote se gestiona en un módulo inmersivo dedicado que no expulsa al usuario al sistema principal.
  - Opciones de lote condicionales: Depósito a siguiente almacén, registro detallado de merma/producto no conforme a Kárdex de ALM-05 con captura de causa raíz, y panel de calidad con aprobación directa o bifurcación por rechazo (Reproceso, Segunda o Merma definitiva).
  - Al concluir el depósito, panel de cierre con dos opciones táctiles claras: *📷 Escanear Siguiente Lote* o *⬅ Volver a Consola Principal*.
- **Aislamiento Previo de Acciones del Supervisor:**
  - Consola limpia con 3 tarjetas rectoras: Escáner QR, Modo Rampa y Registro de Paro.
  - Eliminados simuladores de desarrollo y textos de prueba visibles.
- **Corrección de Scroll y Orden de Sub-pestañas:**
  - Corrección de visualización inmediata en "Mapa de Almacenes Intermedios" y "Métricas y Rendimiento" mediante reset instantáneo de scroll en `initSubTabs()` y reordenamiento coherente en el DOM.

### [2.42.0] - 2026-10-04
- **Modo Rampa Multi-QR Batch & Validación de Estación (`RF-86`):**
  - Cola dinámica de escaneo de múltiples tarjetas de Lote Madre antes de ejecutar la división en torres de 15 piezas.
  - Validación de arribo a estación de Rampa y autorización de puesto del supervisor.
- **Mapa de Planta Centrado en Almacenes Físicos (`RF-87`):**
  - Reestructuración visual en 5 almacenes reales de piso (ALM-01 a ALM-05) y pulmones de proceso.
- **Flujo Integral de Mermas y Registro Kárdex (`RF-88`):**
  - Botón táctil directo de reporte de merma sobre el lote escaneado, canalización a ALM-05 y registro inmediato en historial Kárdex.
- **Eliminación de Módulo de Reubicación Errónea:**
  - Retirada la sección de reubicación manual no contemplada para asegurar trazabilidad estricta.

### [2.41.0] - 2026-10-04
- **Arquitectura Tablet-First Heroica en Terminal de Planta (`RF-85`):**
  - **Tres Acciones Primordiales en Estado Vacío:** La terminal presenta 3 tarjetas heroicas ergonómicas con botones táctiles de 48px:
    1. *Abrir Escáner QR:* Kiosko modal inmersivo con retícula visual y detección continua.
    2. *Modo Rampa (Fraccionamiento D-05):* Activación directa para dividir lotes madre en 4 sublotes de 15 piezas y auditar tarjetas viajeras.
    3. *Reportar Paro de Máquina:* Acceso instantáneo a la bitácora de tiempos muertos (cambio de horma SMED, falta de vapor o mantenimiento) con reflejo en vivo en el Andon.
  - **Eliminación de Selectores Manuales Antipadrón:** Retirado el combobox manual de selección de estación del hero bar y el badge estático "Lote Activo: 1094", dado que el código QR define automáticamente el tramo y departamento.
  - **Diferenciación Visual en Tablero Andon:** Mayor contraste de color en tarjetas de estación y distintivo dorado con doble borde para los 4 filtros de calidad obligatorios.
  - **Estandarización de Textos de Custodia:** Actualización de folios y sellos de auditoría de Kárdex al control interno de almacén de Tombstone.
  - **Actualización Documental y Dudas de Cliente:** Cierre formal de preguntas resueltas en planta y registro de nueva consulta sobre muestreo AQL vs inspección 100% en filtros de calidad (`DUD-13`).

### [2.40.0] - 2026-10-03
- **Arquitectura Oficial de Integración CONTPAQi SQL Server & Compras ($0 USD Licencias):**
  - Validación con la Ing. Lupita López (Soporte CONTPAQi): integración limpia vía Stored Procedures y Vistas directamente en Microsoft SQL Server sin consumir licencias de usuarios concurrentes de CONTPAQi Comercial ni depender del SDK.
  - Soporte de estructura dual de bases de datos: BD Interna (Órdenes de Compra y seguimiento a entregas parciales con vales internos) y BD Fiscal (Recepción física y validación de XML de factura).
  - Trazabilidad desacoplada de lotes: inserción del producto terminado con el folio de lote del MES embebido en la referencia de la partida para facturación directa en CONTPAQi.
  - Catálogo de materiales por familias estructuradas (`PIEL001`, `TEL001`) con trazabilidad de origen ligada al folio de factura del proveedor.

### [2.39.0] - 2026-10-03
- **Formalización de Arquitectura Operativa MVP y Validación Técnica de Planta:**
  - Consolidación del padrón oficial de 108 operadores fijos en 14 áreas, logística de recolectores de pasillo y fraccionamiento de tarjetas viajeras en Rampa con archivo de tarjeta madre.
  - Reglas de negocio confirmadas para piezas de segunda (avance continuo del lote, registro obligatorio de causas raíz e inventario virtual para venta directa) y enrutamiento dinámico de reprocesos por tipo de falla.
  - Sincronización del buffer de subensambles (Tafiletes y Toquillas) mediante semáforos de disponibilidad para Adorno e inclusión de fotografía del modelo terminado en ficha técnica.
  - Protocolo de registro de paros de inicio a fin en Prensas con mapeo de hormas por número de máquina y pre-reporte semanal de corte de destajo los viernes con exportación nativa a Excel.

### [2.38.0] - 2026-10-02
- **Componente Universal Custom Select Dropdown UI (`UanifySelect`) & Limpieza de Tooltips/Modales:**
  - **Sustitución Total del Menú Desplegable Nativo del Sistema Operativo:** Implementación del componente universal interactivo `UanifySelect` (`.uanify-select-wrapper`, `.uanify-select-trigger`, `.uanify-select-menu`) con trigger táctil de 48px, chevron animado, elevación flotante desacoplada y buscador integrado para listas con más de 7 opciones (rutas de modelo, departamentos y operadores).
  - **Corrección de Persistencia en Tooltips:** Remoción de `:focus-within` y adición de auto-cierre en `mouseleave` y `blur`, evitando que las burbujas de ayuda queden pegadas al hacer clic.
  - **Unificación de Cierre de Modales:** Retiro de botones redundantes de "Cerrar/Cancelar" en los pies de modales informativos, dejando el cierre estrictamente centralizado en la `×` superior derecha.
- **Estandarización Rigurosa del Padrón de Operadores y Directorio de Mano de Obra (Reglas 0.33, 0.35, 0.37):**
  - **Erradicación de Botones Rectangulares de Texto Plano:** Sustitución definitiva de botones `[Editar]` y `[Baja]` por botones ergonómicos touch tablet-first de 32x32px (`.btn-table-action.btn-action-edit` y `.btn-table-action.btn-action-delete`) con paleta suave pastel (`#F1F5F9`/`#E2E8F0` para editar y `#FEF2F2`/`#FEE2E2` para baja) con iconos SVG claros y tooltips nativos `title="Editar Operador"` y `title="Dar de Baja Operador"`.
  - **Buscador Limpio con Icono SVG Aislado:** Envoltura del vector SVG en `<span class="search-icon">` para erradicar cualquier empalme visual o artefacto de texto sobre el input `#operatorSearchInput`.
  - **Alineación Estricta 1:1 de Columnas:** Anchos fijos milimétricos y centrado estricto para No. Nómina (`110px`), Turno (`110px`), Piezas Procesadas Hoy (`160px` con badge monospace bold centrado), Estatus (`120px` con píldora y dot luminoso centrado) y Acciones (`100px`).

### [2.32.0] - 2026-09-27
- **Estandarización Rigurosa de Tabla Kárdex de Movimientos y Modal de Vale Oficial (`Reglas 0.33, 0.35, 0.37`):**
  - **Erradicación de Botones Rectangulares de Texto Plano:** Sustitución definitiva de botones `[Detalle]` por botones ergonómicos touch tablet-first de 32x32px (`.btn-table-action.btn-action-view`) con fondo pastel suave verde `#F0FDF4`, borde `#DCFCE7`, icono SVG de documento oficial y tooltip nativo explicativo `title="Ver Vale Oficial de Traspaso / Detalle de Movimiento"` sin texto visible.
  - **Alineación Estricta 1:1 de Columnas en Kárdex:** Asignación explícita de anchos y alineación centrada para Hora (`85px`), Tipo de Movimiento con badges de estado (`150px`), Cantidad en tipografía monoespaciada bold (`100px`), Folio / Doc (`120px`) y Acciones (`90px`).
  - **Modal Oficial In-App de Vale de Traspaso (`UanifyUI.alert`):** Al accionar el botón de cada fila, se despliega una ventana modal in-app con los detalles completos del movimiento, folio, origen, destino, piezas, custodio responsable y sello de auditoría de Logística MES.
  - **Buscador Limpio Multi-Criterio:** Input de búsqueda con vector SVG de lupa alineado a 12px y selector de tipo de movimiento con ancho ergonómico.

### [2.31.0] - 2026-09-27
- **Estandarización Universal de Tablas de Almacenes Físicos & Kárdex (Reglas 0.33, 0.35, 0.37):**
  - **Erradicación de Botones Rectangulares de Texto Plano:** Sustitución definitiva de botones toscos de texto plano (`[Ver Lotes]`) por botones ergonómicos touch tablet-first de 32x32px (`.btn-table-action.btn-action-view`) con fondo pastel suave verde `#F0FDF4`, borde `#DCFCE7`, icono SVG de documento/ojo centrado y tooltip nativo explicativo `title="Ver Lotes e Inventario en Custodia"` sin texto visible.
  - **Buscadores Limpios sin Empalme de Texto:** Reemplazo de cualquier remanente de texto plano en buscadores por vector SVG de lupa alineado a 12px y padding de 38px en `#whSearchInput` y `#kardexSearchInput`.
  - **Alineación Estricta 1:1 de Columnas:** Anchos fijos milimétricos en cabeceras `<th>` y centrado de Tipo, Stock Actual (monospace bold), Capacidad (porcentaje + progress bar) y Estatus (`.table-status-pill`) en `#warehousesTable` y `#inventoryKardexTable`.
  - **Estandarización de Kárdex de Traspasos:** Centrado de Cantidad en tipografía monoespaciada bold, centrado de Folio y botón ergonómico de 32x32px con tooltip explicativo `title="Ver Vale Oficial de Traspaso"`.

### [2.30.0] - 2026-09-27
- **Estandarización Universal de Tablas de Catálogo de Sombreros y Hormas / Moldes (`Reglas 0.33, 0.35, 0.37`):**
  - **Alineación Estricta de Columnas 1:1 en Catálogos Maestros:** Anchos explícitos milimétricos y alineación centrada para Tallas, Estatus, Horma Compatible, Valor Catálogo y Acciones en `#tblInventoryHats` y `#tblInventoryMolds`.
  - **Botones de Fila de Icono Puro Cuadrados (32x32px) y Paleta Suave Pastel:** Erradicación definitiva de botones toscos rectangulares de texto (`[Ficha] [Editar] [Baja]`), reemplazándolos por botones ergonómicos touch tablet-first con iconos SVG nítidos y tooltips descriptivos (Ficha Técnica en verde pastel `#F0FDF4`, Editar en gris suave `#F1F5F9`, y Baja/Mantenimiento en rojo pastel `#FEF2F2`).
  - **Ergonomía Táctil en Botones Primarios (48px):** Ajuste a `min-height: 48px;` en los botones neurálgicos de cabecera (`+ Registrar Nuevo Sombrero` y `+ Registrar Nueva Horma`).
  - **Consumo de Información Vía Tooltips en Modales de Alta (`Regla 0.37`):** Integración de iconos interactivos `.info-tooltip-icon` en todos los campos de formulario de registro de sombreros y hormas, eliminando sobrecarga visual.

### [2.29.0] - 2026-09-27
- **Motor de Simulación Horaria Avanzada con Variabilidad Industrial y Progresión Completa:**
  - **Simulación Dinámica Hora a Hora (07:00 a 15:30 hrs):** Implementación de catálogo exhaustivo de 9 horas de jornada con variaciones estocásticas realistas en piezas producidas, mermas de calidad, piezas de segunda y fluctuaciones de WIP.
  - **Avance Acelerado de Turno Completo:** Nuevo control "Simular Turno Completo" que proyecta la jornada industrial completa hasta las 15:30 hrs con un solo clic, permitiendo visualizar la capacidad total de la planta.
  - **Reactividad Integral en las 6 Sub-Pestañas de Analítica:**
    1. *OEE & Eficiencia Global:* Recálculo matemático y reactivo de Disponibilidad, Rendimiento, Calidad y OEE Global con actualización de barras de progreso y veredicto.
    2. *Resumen Financiero & Valorización:* Actualización en vivo del valor producido en MXN, porcentaje de fulfillment B2B, saldos de remate de viernes y costo de scrap con trends contextuales.
    3. *KPIs de Supervisores:* Rendimiento dinámico por departamento (Prensas, Acabado, Rampa) con takts reales, piezas procesadas y calificaciones actualizadas.
    4. *Balanceo de Líneas & Cuellos de Botella:* Rotación de cuellos de botella por estación según avance de la jornada con alerta diagnóstica y visualización de WIP acumulado.
    5. *Bitácora de Paros & SMED:* Registro secuencial de eventos de paro y cambios de horma con timestamps de la hora simulada.
    6. *Matriz de Materiales (BOM):* Consumo acumulado de metros de telar, litros de apresto/dope, rollos de alambre, tafiletes y barniz.
  - **Sincronización Total con Tablero Andon:** Emisión de eventos `piece-registered` hacia el bus global para reflejar la evolución horaria en los semáforos y gráficas de piso.

### [2.28.0] - 2026-09-27
- **Limpieza Integral de Integración CONTPAQi / ERP y Estado Previo a Homologación Técnica:**
  - **Eliminación Total de Datos Simulados / Mock:** Se retiraron parámetros ficticios de IP (`192.168.1.50:9005`), bases de datos mock (`ct_tombstone_comercial`), mapeos prefijados de almacenes, órdenes de compra mayorista simuladas (`#OC-2026-9420`) y registros de auditoría inventados.
  - **Estado Limpio Profesional (Empty State Industrial):** El módulo `subtab-config-compac` se configuró en modo neutro en espera de especificación técnica, con estado visual `Sin Configuración Activa` y tarjeta central informativa.
  - **Matriz de Prerrequisitos para Revisión Técnica con Edmundo:** Checklist estructurado para la sesión técnica con Dirección (Edmundo González) y Soporte de Sistemas: 1) Protocolo de Conectividad (ODBC vs REST Gateway), 2) Base de Datos y Credenciales de Empresa, 3) Homologación 1 a 1 de Almacenes MES vs Bodegas Fiscales, 4) Reglas de Salidas B2B y Vales de Camioneta.
  - **Sincronización de Parámetros de Turno:** La tarjeta de enlace COMPAC en `subtab-config-params` se dejó limpia y libre de valores predefinidos, mostrando estado pendiente de asignación.

### [2.27.0] - 2026-09-27
- **Estandarización de Selectores de Tiempo y Consumo de Especificaciones Vía Tooltips (`Regla 0.37`):**
  - **Selectores Intuitivos de Receso / Comida:** Sustitución del input de texto plano manual por dos selectores nativos de hora (`Inicio Receso` y `Fin Receso`) con cálculo automático de duración en tiempo real (45 min) y preservación de compatibilidad con formato de sistema (`"12:00 a 12:45 hrs"`).
  - **Eliminación de "Resumen Informativo del Turno":** Se retiró el input redundante de resumen para aportar limpieza y concisión al formulario.
  - **Consumo de Información de Inputs Vía Tooltips:** Supresión de textos explicativos permanentes bajo inputs de metas, takt time, lote madre y umbrales Andon; toda especificación se consulta bajo demanda mediante iconos interactivos `.info-tooltip-icon` en los labels.
  - **Régimen Dinámico de Turno US-17 No Configurable:** Erradicación de radio buttons de modo; el sistema opera en modo dinámico permanente en tiempo real midiendo el arranque al primer QR de planta.
  - **Eliminación del Selector de Modo Operativo de Rampa:** Retiro del control de fraccionamiento de 60 a 15 piezas, supeditando la decisión técnica al criterio del operador en su estación.

### [2.21.0] - 2026-09-26
- **Rediseño Ergonómico de Sub-Pestañas y Corrección de Espaciado Superior (`RF-72`):**
  - **Eliminación del Anclaje Sticky Invasivo:** Se removió la propiedad `position: sticky; top: 76px;` de `.sub-nav-tabs` que provocaba que al hacer scroll las pestañas secundarias se estrellaran y quedaran pegadas con 0px de separación contra el encabezado superior del módulo.
  - **Margen Superior y Respiración Visual:** Se estableció un `margin: 20px 0 24px 0;` dedicado en desktop y `16px 0 20px 0;` en tablet/móvil, garantizando una separación cómoda, limpia y equilibrada respecto al título del módulo y a las tarjetas de trabajo.
  - **Diseño Moderno Segmented Control (Pills Hug-Content):** Se transformó el contenedor de una barra vacía al 100% de ancho a una cápsula compacta de ajuste automático (`width: fit-content; max-width: 100%;`) con fondo sutil (`#F1F5F9`), bordes suavizados de 12px y botones tipo chip interactivo con estado activo en tarjeta blanca elevada con sombra táctil.

### [2.20.0] - 2026-09-26
- **Erradicación Total de Códigos Técnicos de Departamento en Login y Pantallas de Planta (`RF-72`, `RF-73`):**
  - **Selector de Perfiles de Login:** Los supervisores ya no muestran `(Depts 05-08)` en su rol ni listas de códigos `D-05, D-06...` en su ficha de acceso; ahora visualizan sus nombres de cargo y tramo departamental real (*Supervisor de Hormado & Acabado · Prensas de Hormado · Recorte y Alambrado · Planchado y Horno · Brillo y Pulido*).
  - **Terminal, Timeline y Modales:** Sustitución integral de textos estáticos y dinámicos que contenían `D-01` a `D-14` por sus nombres industriales oficiales (*Corte de Telar, Englopado y Camas, Refuerzos de Corona, Engomado y Secado, Prensas de Hormado, Recorte y Alambrado, etc.*) en el visor de tarjeta viajera, almacén intermedio, flujo secuencial de ruta, modales de verificación y selector de altas de operadores.
  - **Preservación de Capa Lógica:** Los identificadores técnicos internos (`code`, `deptCode`, `assignedDepartments`) se mantienen intactos a nivel de lógica de datos, garantizando cero impacto en validaciones de permisos RBAC y trazabilidad.

### [2.19.0] - 2026-09-26
- **Consola Maestra SuperAdmin Uanify (`RF-71`):** Entorno exclusivo y sigiloso para Uanify (oculto para el cliente) accesible mediante PIN maestro `0000`/`9999` en login, atajo `Ctrl+Shift+U` o 5 toques en el logo de la barra lateral. Permite alternar de inmediato entre el **Modo Demostración Mock** (datos enriquecidos de fábrica) y el **Modo Sesión Limpia** (0 lotes y contadores reseteados para pruebas en vivo desde cero), con descarga gratuita de snapshots JSON ($0 USD) y carga de respaldos locales.
- **Navegación Ergonómica por Chips en Sub-Pestañas (`RF-72`):** Rediseño de la barra interna de sub-pestañas (`.sub-nav-tabs`) con disposición flex-wrap responsive, eliminación definitiva del scrollbar horizontal antiestético en Windows y optimización visual tipo chips/pastillas industriales.
- **Priorización Visual del Nombre del Departamento (`RF-72`):** Erradicación de los códigos técnicos (ej. `D-01`, `D-05`) como elemento visual primario forzado; la interfaz ahora muestra protagónica y claramente los nombres reales de planta (*Prensas de Hormado*, *Corte de Cuadros*, *Alambrado de Ala*, *Rampa de Ensamble*) en tablas, tarjetas, selectores de terminal, timeline y botones de depósito.
- **Teclado Táctil Numpad de PIN de 4 Dígitos con Auto-Submit (`US-01`, `TC-SEC-08`):** Acceso rápido de piso en menos de 2 segundos, con feedback luminoso en dots y animación de sacudida en error.

### [2.18.0] - 2026-09-25
- **Catálogo de Sombreros Fabricados y Variaciones (`RF-67`):** Nuevo catálogo maestro en Almacenes para registrar y consultar modelos fabricados (Denver Master, El Viejonón, Chaparral, Sonora Ranchero, Frontier Western, Magnum 1000X), variantes de talla (54 a 61), faldas (3.5" a 4.5"), toquillas y precios B2B.
- **Visor de Ficha Técnica de Producto (`RF-67`):** Modal interactivo con fotografía industrial, dimensiones de copa y falda, horma de prensa requerida, materiales de ensamble y parámetros estándar de manufactura.
- **Hormas y Moldes Maquinados con Ficha Técnica (`RF-68`):** Enriquecimiento del catálogo de hormas de aluminio maquinado (aleación, temperatura óptima 165°C-180°C, presión 6-8 bar, ciclos acumulados con barra de vida útil y moldes complementarios).
- **Carga de Fotos en Sombreros y Hormas con Drag & Drop (`RF-67`, `RF-68`):** Dropzone interactivo de imagen con soporte para arrastrar o examinar archivo local, conversión instantánea a Base64 offline y previsualización en vivo.
- **Estilo Industrial Tradición Moderno y Reemplazo de Emojis (`RF-69`):** Sustitución de emojis informales en navegación, botones y encabezados por iconografía SVG de precisión técnica y badges industriales sobrios en paleta pizarra (`#0F172A`), blanco frío (`#F8FAFC`) y cuero artesanal (`#8B5E3C`).
- **Sub-pestañas Fijas con el Scroll (Sticky Sub-tabs · `RF-69`):** Fijación flotante de las sub-tabs (`position: sticky; top: 76px; z-index: 95; backdrop-filter: blur(12px)`) en todos los módulos para navegación continua sin regresar a la parte superior.
- **Ergonomía Táctil y Botones Tablet-First (`RF-69`):** Zonas táctiles de 42-46px en modales y 38-42px en tablas, estados activos con micro-interacción `:active { transform: scale(0.97) }` y `cursor: pointer !important`.
- **Integración Aislada de CONTPAQi ERP (COMPAC) en Configuración (`RF-70`):** Reubicación de la integración ERP dentro de una sub-pestaña técnica en Configuración, con monitor de enlace ODBC, prueba de ping, mapeo de almacenes B2B y emisor de vales de camioneta.
- **Módulo Único Centralizado de Analítica & KPIs de Planta (`RF-70`):** Fusión de la consola de ingeniería y el dashboard directivo en una sola vista integral (`Analítica & KPIs de Planta`), accesible para Administradores e Ingenieros con 6 sub-pestañas especializadas (OEE, Finanzas de Lote, Rendimiento de Supervisores, Balanceo & Cuellos, Bitácora SMED y Matriz BOM).

### [2.17.0] - 2026-09-25
- **Estandarización Universal de Tablas, Columnas y Acciones (Regla 0.35 de AGENTS.md):** Homogeneización visual y funcional estricta en la totalidad de tablas del sistema (Departamentos, Filtros de Calidad, Usuarios RBAC, Padrón de Operadores, Almacenes Físicos, Moldes/Hormas y Kárdex).
- **Barra de Filtros Multi-Criterio Reactiva (`.uanify-filter-toolbar`):** Búsqueda de texto en vivo por código/nombre/responsable, filtros selectivos contextuales por proceso/tipo/estatus, contador dinámico "Mostrando X de Y registros" y botón `Limpiar Filtros`.
- **Estandarización de Celdas y Jerarquía de Contenido:** Códigos con badge monoespaciado `.table-badge-code`, títulos en `.table-cell-primary` con subtítulos descriptivos `.table-cell-subtext`, y pastillas de estatus `.table-status-pill` con punto luminoso pulsante (`.status-dot`).
- **Sección de Acciones Uniforme (`.action-btns-cell`):** Botones touch tablet-first de 38px de altura mínima, centrados, con estilos normalizados: `Editar` (`.btn-action-edit`), `Eliminar/Baja` (`.btn-action-delete`), `Ver Lotes/Detalle` (`.btn-action-view`), todos con `cursor: pointer !important`.
- **Estado Vacío Estilizado (`.table-empty-row`):** Iconografía temática, mensaje explicativo y botón directo para resetear filtros cuando una búsqueda no arroje resultados.

### [2.9.0] - 2026-09-24
- **Mapa de Proceso Interactivo y Rastreador de Lote para Supervisores:** Nueva sub-pestaña ` Mapa de Proceso & Rastreador de Lote` en Terminal para consultar al instante la ubicación física de cualquier lote (`49,633`, `49,386`, `49,842`).
- **Línea de Tiempo Visual (Value Stream Map):** Despliegue secuencial de todas las estaciones y filtros de calidad según el modelo de sombrero, indicando pasos completados (OK), estación activa con indicador pulsante (**[AQUÍ ESTÁ EL LOTE]**), operador a cargo, tiempo de ciclo y próximas paradas.
- **Acciones Operativas de Desplazamiento:** Controles para avanzar (`>>`) o retroceder (`<<`) el lote a lo largo de la línea de tiempo, o reubicarlo directamente haciendo clic sobre cualquier nodo del mapa.
- **Rutas de Fabricación y Secuencias Configurables por Modelo:** Nueva pestaña en Configuración (`Rutas & Secuencias por Modelo`) accesible para **Ingeniero** y **Admin**, que permite ordenar e intercalar departamentos y filtros de calidad (subir `▲`, bajar `▼`, agregar y remover pasos) según el modelo de sombrero (1000X Telar, Campana Preformada, Laqueados Especiales).
- **Registro Dinámico de Áreas de Control de Calidad (`C-XX`):** Modal para dar de alta estaciones de inspección de calidad (`C-01`, `C-02`, `C-03`, `C-04`...) con criterios de tolerancia, inspector responsable y tiempo de ciclo, integrándose tanto a la tabla de departamentos como a las rutas de producto.
- **Ampliación de Permisos de Ingeniería:** Concesión de acceso al módulo de Configuración para el rol Ingeniero (`Ing. Carlos Ortiz`) para modelar flujos de planta y criterios de calidad.

### [2.8.4] - 2026-09-24
- **Corrección de Navegación por Sub-Pestañas en Todos los Módulos:** Corrección de colisión entre selectores CSS `.sub-tab-content.d-none` y `.active`. Limpieza de clases inactivas y enlace robusto de eventos de click en todos los módulos (Andon, Terminal, Ingeniería, Dirección y Configuración).
- **Definición de Horario de Turno (Informativo de Planta):** Implementación de campos configurables para hora de entrada (`07:00`), hora de salida (`15:30`), horario de comida/descanso (`12:00 a 12:45`) y días laborables (`Lunes a Viernes`), con previsualización dinámica y persistencia en `localStorage`.
- **Alta Integral de Departamentos con Asignación de Supervisor y Multi-Operadores:** Modal administrativo en Configuración para registrar nuevos departamentos (`D-XX`), asociar su supervisor responsable y seleccionar múltiples operadores asignados mediante checklist interactivo con opción de alta rápida.
- **Visualización de Operadores por Departamento:** Integración de columna "Operadores Asignados" en la tabla maestra de estaciones con badges visuales por cada trabajador en piso.

### [2.8.3] - 2026-09-24
- **Barra Lateral Plegable (Icon-Only Mode):** Incorporación de botón toggle en encabezado del sidebar para colapsar la barra lateral a 72px, expandiendo el área útil de trabajo en planta; persistencia automática en `localStorage` y colapso por defecto en resoluciones de tableta.
- **Versión del Sistema Visible y Prominente:** Rediseño del badge `.system-version-pill` con fondo sólido de marca `#8B5E3C`, texto blanco en negrita y alto contraste para visibilidad instantánea.
- **Enfoque de Diseño Tablet-First y 100% Responsivo:** Optimización completa para pantallas táctiles de 768px a 1024px (touch targets >= 44px, desplazamiento horizontal táctil suave en tablas y tabs sin desbordamiento lateral).
- **Supresión de Menciones de Hardware Específico:** Eliminación total de las palabras "iPad" y "Tablet" en la interfaz de usuario, empleando términos profesionales neutros (Terminal de Planta, Cámara de tu dispositivo).
- **Seguridad RBAC por Ocultamiento Estricto:** Eliminación de iconos de candados ; los módulos no autorizados se ocultan completamente de la barra de navegación para un entorno más limpio y seguro.

### [2.8.2] - 2026-09-24
- **Corrección Estructural Crítica del Frontend:** Eliminación de etiqueta `</div>` sobrante en el sidebar que provocaba cierre prematuro del `<aside>`, ruptura de la cuadrícula principal y desplazamiento vertical masivo del contenido.
- **Ajuste de Margen y Clearance en Tarjeta Viajera:** Corrección del espaciado del encabezado departamental (`TARJETA HIDRAULICAS - ADORNO` y `TARJETA PRENSAS - PATIO`) para que el sticker del operador (`JORGE`, `MELANY`) no se superponga sobre el texto.
- **Incorporación de Lote Madre 60 Pzas (Magnum · Melany):** Integración del Lote `49,842` (Ruta Prensas a Patio, 60 piezas completas, sticker magenta de Melany y recuadro inferior derecho vacío).

### [2.8.1] - 2026-09-23
- **Réplica Física de Tarjeta Viajera (Validada con Fotos de Planta):** Implementación de la vista idéntica de la tarjeta con mica protectora, orificio para cordel, sticker de operador (`JORGE`), ruta departamental `TARJETA HIDRÁULICAS - ADORNO`, lote y especificaciones (`FALDA: 9.0 Cm` / `9 1/2`, `DOBLADO: ABAJO` / `ARRIBA`).
- **Regla Visual de Lote vs Sublote:**
  - **Lote Madre (ej. 49,386 Chaparral):** El recuadro inferior derecho NO tiene número.
  - **Sublote (ej. 49,633-3 Viejonón):** El recuadro inferior derecho muestra el número del sublote (`3`).
- **Hormas Reales de Fábrica:** Incorporación de las hormas de aluminio de los racks de planta (`#54 JOHNSON LONA`, `#53 JOHNSON LONA`, `#57 SONORA`, `#53 CHAPARRAL LONA`, `#56 CHAPARRAL`, `#55 VIEJONON`) y prensas `Michelagnoli`.

### [2.8.0] - 2026-09-23
- **Navegación Interna por Sub-Pestañas:** Organización de vistas complejas mediante sub-tabs en cada uno de los 5 módulos para una interfaz despejada.
- **Meta Semanal:** Sustitución de meta rígida por Meta Semanal de Producción (4,250 pzas/semana).
- **Flujo Departamental Completo:** Máquinas, operadores, depósito en almacén intermedio de salida y recolección para traspaso al siguiente departamento.
- **Lector QR de Pantalla Completa en Vivo:** Integración de cámara web con `getUserMedia` y retícula visual compatible con cualquier navegador y dispositivo.
- **Asignación Departamental para Supervisores:** Restricción de permisos para que cada supervisor solo opere en sus departamentos asignados.
- **Padrón de Operadores de Planta:** Registro de mano de obra con número de nómina, departamento y máquina asignada (sin acceso al sistema).
- **Catálogo de Hormas:** Registro de moldes de sombreros de San Francisco del Rincón con asignación a prensas de vapor.
- **KPIs Exclusivos:** Rendimiento de departamentos y supervisores restringido a Ingeniería y Dirección.
- **Alertas Estandarizadas In-App:** Supresión total de alertas nativas del navegador (`alert`, `confirm`); estandarización con notificaciones toast y modales in-app `UanifyUI`.

### [2.35.0] - 2026-09-27
- **Erradicación de Limitación de Ancho Fijo y Fluidez Responsiva Universal (Tablets y Monitores Ultra-Anchos):**
  - **Supresión de `max-width: 1600px` en Contenedor Principal (`.app-content`):** Se eliminó el tope artificial que confinaba la interfaz a 1600px y dejaba un espacio blanco desproporcionado a la derecha en pantallas de alta resolución (2133px, 2560px, 4K) o con zoom reducido (< 100%).
  - **Alineación y Expansión Fluida 100%:** `.app-content` ahora utiliza `width: calc(100% - var(--sidebar-width)); max-width: 100%; box-sizing: border-box;` tanto en modo expandido como colapsado (`sidebar-collapsed`), distribuyendo armoniosamente el contenido de todos los módulos de extremo a extremo.
  - **Reingeniería de Grids para Tablets y Desktops:** `.stations-grid` en Tablero Andon ahora implementa `repeat(auto-fill, minmax(285px, 1fr))` en pantallas grandes (5-7 columnas simétricas sin huecos) y `minmax(260px, 1fr)` en tabletas (2-3 columnas táctiles ergonómicas en iPad vertical y horizontal).
  - **Blindaje Táctil en Tablets (`@media (max-width: 1024px)`):** Preservación estricta de botones de fila de 32x32px (`.btn-table-action`), scroll horizontal suave en tablas (`-webkit-overflow-scrolling: touch`) y flex-wrap optimizado en banners de KPIs y barras heroicas.
  - **Sincronización de Cache Busting de Hojas de Estilo:** Actualización de `css/styles.css?v=2.35.0` y `css/components.css?v=2.35.0` para garantizar recarga instantánea en navegadores cliente.

### [2.34.0] - 2026-09-27
- **Homologación Integral Universal de Tablas y Buscadores del Sistema (Reglas 0.33, 0.35, 0.37):**
  - **Buscadores de Configuración con SVG Aislado:** Blindaje definitivo de los inputs de búsqueda en Usuarios RBAC, Padrón de Operadores Config, Departamentos y Filtros de Calidad C-XX envolviendo el vector SVG en `<span class="search-icon">` con padding izquierdo seguro de 38px, erradicando cualquier empalme de texto.
  - **Estandarización 1:1 de Tablas de Configuración:** Anchos explícitos milimétricos y centrado estricto en celdas de códigos, roles, nóminas, piezas procesadas hoy, tiempos de ciclo y botones de acción en Usuarios RBAC, Padrón de Operadores, Departamentos y Calidad C-XX.
  - **Estabilidad de Tablas de Analítica & Rendimiento:** Anchos fijos y centrado en KPIs de Supervisores, Bitácora SMED / Paros y Matriz BOM para evitar fluctuaciones dimensionales y movimientos bruscos de columnas durante la simulación acelerada de turnos.

### [2.26.0] - 2026-09-26
- **Reingeniería de Rutas & Secuencias Departamentales:** Supresión total de flechas direccionales (`▲`, `▼`), estandarizando el reordenamiento de pasos al Drag & Drop con manija de agarre (`⠿`).
- **Estado Inicial Deseleccionado y Prompt Amigable:** La pantalla ahora inicia sin ningún sombrero seleccionado, presentando un estado vacío claro que invita al usuario a elegir un modelo específico antes de desplegar el constructor.
- **Modo Borrador y Restablecimiento sin Guardar:** Las ediciones (reordenamiento, adición o supresión de pasos) operan en un búfer local aislado y no impactan la producción hasta confirmar con `Guardar Secuencia de Ruta`. Se integró el botón `Restablecer Secuencia` para descartar cambios pendientes y regresar al estado original.
- **Instrucciones No Invasivas Vía Tooltip:** Remoción del banner permanente voluminoso, sustituyéndolo por un botón discreto de ayuda con tooltip informativo para maximizar el área útil de trabajo.
- **Experiencia de Selectores Mejorada:** Menú de modelos con metadata clara (Nombre, SKU, Categoría) y menú de estaciones agrupado por optgroups industriales (`Departamentos de Manufactura` vs `Filtros de Calidad C-XX`).

### [2.25.0] - 2026-09-26
- **Estandarización de Tablas de Padrón de Operadores (Configuración y Directorio):** Alineación estricta de encabezados con anchos explícitos, métricas de piezas procesadas hoy en badge mono destacado centrado, estatus centrado y correspondencia 1:1 de columnas.
- **Botones de Fila de Icono Cuadrados y Paleta Suave:** Integración homogénea de botones de 32x32px para editar (`#F1F5F9`/`#E2E8F0`) y eliminar (`#FEF2F2`/`#FEE2E2`) con iconos SVG nítidos y tooltips descriptivos.
- **Consistencia Dual de Operadores:** Normalización idéntica tanto en el módulo de Configuración (`subtab-config-operators`) como en el Directorio General de Mano de Obra (`view-operators`).
- **Sincronización Universal de Versión:** Actualización transversal del sistema a `v2.25.0` en login, sidebar, package.json y documentación viva.

### [2.24.0] - 2026-09-26
- **Estandarización de Tabla Usuarios (RBAC) y Sintetización de Permisos:** Eliminación de saturación visual por píldoras múltiples de permisos modulares; agrupación en badges inteligentes (`Acceso Total (Todos los Módulos)`, `Acceso Avanzado (6 Módulos)` y píldoras compactas para supervisores).
- **Simetría Milimétrica en Botones de Fila con Protección de Superusuario:** Estandarización de botones cuadrados compactos (32x32px) con iconos SVG claros para editar y eliminar en todas las filas. Para el usuario principal (`admin-1`), se implementó un botón con candado SVG suave desactivado que preserva la alineación estricta de dos acciones sin textos planos asimétricos.
- **Buscador de Usuarios Limpio:** Input de búsqueda con vector SVG de lupa alineado a 12px y padding de 38px, eliminando empalmes de texto.
- **Sincronización de Versión del Sistema:** Actualización universal de versión a `v2.24.0` en login, sidebar, package.json y documentación técnica.

### [2.23.0] - 2026-09-26
- **Desglose Estricto de Columnas en Calidad (7 Columnas 1:1):** Separación de `Inspector Responsable` y `Tiempo de Ciclo` en columnas independientes con alineación perfecta, evitando que el estatus y los botones de acción se desplacen hacia columnas previas.
- **Sintetización de Criterios y Tolerancias:** Remoción de párrafos redundantes en celdas de inspección para lograr una vista compacta de 52px de altura uniforme.
- **Estandarización de Modales de Calidad:** Inputs con foco de marca y unificación estricta del botón `Guardar Filtro de Calidad` a `--color-brand`.

### [2.22.0] - 2026-09-26
- **Estandarización Universal de Inputs y Selects:** Todos los dropdowns `<select>` implementan flecha chevron SVG industrial estilizada (`appearance: none; background-image: data:image/svg+xml`), padding de seguridad a 36px y foco cuero de marca `#8B5E3C`.
- **Buscadores sin Empalme:** Reemplazo de texto plano en buscadores por vector SVG de lupa posicionado a 12px con padding izquierdo seguro a 38px en todos los módulos.
- **Alineación Estricta 1:1 de Tablas:** Corrección del desfase de columnas en Departamentos y Filtros de Calidad; eliminación de descripciones largas innecesarias en celdas para evitar saturación visual y sobrecarga de información.
- **Botones de Acción de Icono Puro con Colores Suaves Pastel:** Los botones de fila en todas las tablas (`.btn-table-action`) se estandarizaron como botones cuadrados compactos de 32x32px con iconos SVG claros (Editar en gris suave `#F1F5F9`/`#E2E8F0`, Eliminar en rojo pastel `#FEF2F2`/`#FEE2E2`, Ver/Ficha en verde pastel `#F0FDF4`/`#DCFCE7`), sin texto intrusivo y con tooltips nativos en `title`.
- **Estandarización de Paleta de Botones del Sistema:** Unificación de todos los botones primarios a `--color-brand` artesanal, eliminando colores arbitrarios o ad-hoc en módulos aislados.
### [2.94.0] - 2026-10-13
- **Estandarización y Homologación de Usuarios & Permisos RBAC:**
  - Supresión del icono de candado en las acciones del usuario principal (Edmundo González) en apego estricto a la Regla 0.13 de AGENTS.md (cero candados visuales en interfaces).
  - Igualación de diseño, botones de acción (Editar y Eliminar) y alineación simétrica de celdas entre todos los perfiles Ingeniero (Admin Mayor).
  - Incorporación de paginación de usuarios (rango, total y botones Anterior/Siguiente) y alineación de encabezados (Nombre de Usuario con correo secundario, Rol Asignado, Departamentos Asignados, Permisos Modulares y Acciones).
  - Protección de borrado en cascada: el sistema valida que siempre permanezca al menos un Ingeniero (Admin Mayor) activo antes de procesar bajas.

### [2.93.0] - 2026-10-13
- **Homologación Visual y Estructural de Filtros de Calidad (C-XX) con Almacenes Buffer:**
  - Estructura y jerarquía de tabla idéntica a Almacenes Buffer: Filtro de Calidad, Departamento Asignado (chip de marca `#8B5E3C`), Inspector Responsable (con icono SVG), Tiempo de Ciclo (en tipografía mono y centrado) y Acciones.
  - Toolbar de filtrado simétrica: buscador por nombre y departamento, selector de filtro por departamento, selector por inspector, badge de conteo y botón restablecer.
  - Supresión de subtítulos artificiales de código repetido en celdas, armonizando la interfaz visual y la coherencia de entidades en el módulo de configuración.

### [2.92.0] - 2026-10-13
- **Segmentación Dedicada en Sidebar:** Desglose del grupo Configuración en accesos directos por entidad (Departamentos, Almacenes Intermedios, Procesos Productivos, Maquinaria & Equipos, Filtros de Calidad, Rutas por Modelo, Parámetros de Turno, Usuarios RBAC, Integración CONTPAQi).
- **Asignación Flexible Multi-Operador en Maquinaria:** Nuevo modal independiente para asignar 1 o múltiples operadores a cualquier máquina directamente desde el catálogo maestro, con búsqueda en tiempo real y persistencia.
- **Paginación Uniforme en Todos los Catálogos:** Implementación de barras de paginación industrial (8 registros por página) para Departamentos, Procesos, Almacenes Buffer, Maquinaria y Filtros de Calidad.
- **Rediseño Profesional de Toolbars de Filtrado:** Alineación horizontal ergonómica, eliminación de identificadores artificiales visibles y columnas simplificadas.

### [2.16.0] - 2026-09-24
- **Rutas y Secuencias Específicas por Modelo con Drag & Drop (`⠿`):** Reordenamiento interactivo táctil y de cursor para secuencias de manufactura vinculadas estrictamente a modelos específicos de sombreros (`El Viejonón`, `Denver Master`, `Chaparral`, etc.).
- **Restricción Estricta de Alcance en Secuencias:** El constructor de rutas se limita a asignar y desasignar pasos para el modelo en cuestión (`+ Asignar al Final de la Secuencia`, `Quitar de la Secuencia`), garantizando que no se puedan crear, editar ni eliminar departamentos o filtros de calidad desde este editor.
- **CRUD Integral de Filtros de Calidad (`C-XX`):** Nueva sub-pestaña dedicada en Configuración para registrar, editar y dar de baja puntos de inspección y tolerancias de calidad con ubicación física, criterios, tolerancias numéricas e inspector asignado.
- **Sincronización Reactiva:** Sincronización en tiempo real entre `qualityAreas`, `stations` y secuencias de rutas con almacenamiento persistente en `localStorage`.

### [2.15.0] - 2026-09-24
- **Módulo General de Almacén & Control de Inventarios:** Consolidación de inventarios físicos (5 almacenes), tafiletes por talla, catálogo de moldes y nuevo Kárdex cronológico de movimientos.
- **Unificación de Catálogo Maestro de Hormas:** Eliminación del catálogo duplicado en Ingeniería; el botón `+ Registrar Nueva Horma` ahora vive exclusivamente dentro de la sub-pestaña del catálogo de hormas.
- **CRUD Integral de Departamentos y Almacenes Intermedios:** Alta, edición, consulta y baja de departamentos vinculados con almacenes intermedios, capacidades WIP, Takt Time y asignación multi-operador con botones táctiles de 48px.
- **Reestructuración de Arquitectura de Información:** Separación nítida entre Configuración de Planta, Almacén & Inventarios, Consola de Ingeniería y Operación en Piso.

### [2.14.0] - 2026-09-24
- **Terminal de Supervisor Heroica Tablet-First:** Botones gigantes (48px-52px), supresión de scroll vertical y layout de alto impacto para tabletas industriales.
- **Extracción Integral desde Código QR:** Cero selección manual de modelo; todos los metadatos de sombrero, talla, falda, lote, sublote y orden se extraen automáticamente del QR.
- **Modal Obligatorio de Verificación Previa:** Comparación visual obligatoria de la tarjeta física (mica de piso) contra la pantalla antes de confirmar movimientos ("Tarjeta Incorrecta / Escanear de Nuevo" vs "Confirmar y Proceder").
- **Depósito Automático en Almacén Siguiente:** Cálculo automático del departamento destino a partir de la ruta secuencial del modelo de sombrero.
- **Restricción Departamental Estricta:** Los supervisores solo pueden mover lotes que pertenezcan a sus estaciones asignadas (`assignedDepartments`).
- **Mapa de Planta y Almacenes Intermedios:** Sustitución de la búsqueda lote por lote por supervisión macro de 14 departamentos con modal de almacén intermedio y filtros por modelo/tipo/calidad.
- **Escáner QR en Pantalla Completa:** Modalidad fullscreen inmersiva con botón flotante de salida y retícula de puntería.
- **Trazabilidad de Mermas en Tránsito:** Las piezas con defecto acompañan físicamente al lote hasta la estación de separación y auditoría final.

### [2.8.0] - 2026-09-23
- **Estandarización a Turno Único:** Consolidación de toda la operativa a un solo turno formal (07:00 a 15:30 hrs · Lunes a Viernes), eliminando selectores obsoletos de turnos múltiples y ajustando descansos/comidas (12:00 a 12:45).
- **Control de Versiones y Cursor Interactivo:** Integración de la versión visible `v2.7.0` en sidebar y footer, badges sincronizados y regla obligatoria de `cursor: pointer` en todos los componentes interactivos.

### [2.6.0] - 2026-09-23
- **Sistema RBAC (Roles & Permisos Modulares):** Implementación de roles Admin (Edmundo), Ingeniero (Carlos) y Supervisor (Juan Manuel), con tabla de gestión de usuarios, edición de permisos granulares por módulo y bloqueo contextual de tabs.

### [2.5.0] - 2026-09-23
- **Rediseño Light Tradicional Moderno Contemporáneo:** Sustitución total del tema oscuro por interfaz limpia con tonos neutros cálidos, acentos cuero artesanal (`#8B5E3C`) y barra de navegación lateral izquierda fija.
- **Eliminación Total de Audio:** Supresión de sintetizadores de voz y alertas sonoras para un entorno de planta no invasivo.
- **Terminal iPad Móvil de Supervisores:** Reemplazo del modelo de pedal fijo por terminal digital táctil para escaneo de códigos QR en tarjetas viajeras.

### [2.0.0] - 2026-09-21
- **Modelado Real de Planta:** 14 departamentos, lotes madre de 60 pzas, fraccionamiento a sublotes de 15 pzas en rampa y catálogo de 18 hormas de aluminio.

### [1.0.0] - 2026-09-21
- **Lanzamiento Inicial:** Prototipo base de Tablero Andon, simulación de prensas y consola directiva.
