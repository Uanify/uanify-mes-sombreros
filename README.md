# 🤠 Tombstone Hats MES · Control de Planta & Tablero Andon
### Digitalización Industrial para Planta Matriz Tombstone en San Francisco del Rincón, Guanajuato

[![Versión](https://img.shields.io/badge/Versi%C3%B3n-2.17.0-8B5E3C?style=flat-square&logo=git)](https://github.com/Uanify/uanify-mes-sombreros)
[![Despliegue](https://img.shields.io/badge/GitHub%20Pages-Live-green?style=flat-square)](https://uanify.github.io/uanify-mes-sombreros/)
[![Operación](https://img.shields.io/badge/R%C3%A9gimen-Turno%20%C3%9Anico-blue?style=flat-square)](https://uanify.github.io/uanify-mes-sombreros/)

Sistema MES interactivo desarrollado por **[Uanify](https://github.com/Uanify)** para la digitalización integral de Planta Matriz Tombstone Hats en San Francisco del Rincón, Guanajuato.

- **Web Oficial del Cliente:** [Tombstone Hats](https://tombstone.mx/)
- **Demostración en Vivo:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)
- **Organización:** [Uanify](https://github.com/Uanify)

---

## 🎯 Arquitectura Funcional Tombstone Hats (v2.17.0)

El sistema MES está estructurado en 7 módulos especializados con autenticación visual por roles (RBAC):

| Módulo | Usuario Objetivo | Funcionalidad Clave |
|---|---|---|
| **0. 🔐 Pantalla de Login RBAC** | Todos los Perfiles | Selector interactivo de usuario de planta (Edmundo - Admin, Carlos - Ingeniero, Juan Manuel - Supervisor Depts 05-08, Roberto - Supervisor Depts 01-04) con persistencia de sesión y logout. |
| **1. 🏷️ Terminal de Supervisor** | Supervisores y Operación | Registro de QR con cámara web en vivo, visor oficial de tarjeta viajera, mapa de proceso/tracker de lotes, **Monitor de Almacenes Intermedios** (lotes listos para recolección entre departamentos) y recolección/traspaso. |
| **2. 📺 Tablero Andon (Piso)** | Pantallas Nave Central | Monitoreo visual de avance de estaciones en tiempo real, Takt Time (42s) y comparación hora por hora de producción. |
| **3. 📦 Almacén & Control de Inventarios** | Almacenistas, Supervisores e Ingeniería | Módulo unificado para 5 almacenes físicos (Materia Prima, Rampa WIP, Pulmón Pre-Prensas, Terminado, Merma de Viernes), catálogo unificado de moldes/hormas de aluminio maquinado con alta interactiva, stock de tafiletes por talla y Kárdex general de movimientos con filtrado avanzado y acciones estandarizadas. |
| **4. 👷 Padrón de Operadores** | Ingenieros y Supervisores | Directorio integral de mano de obra en planta con máquina asignada, piezas procesadas hoy, turno y filtros dinámicos estandarizados. |
| **5. 📊 Consola de Ingeniería** | Ingeniero de Procesos | Análisis de OEE desagregado (Disponibilidad, Rendimiento, Calidad), balanceo de líneas & cuellos de botella, matriz de materiales (BOM) con cambio de proveedor y KPIs. |
| **6. 💼 Dirección & COMPAC** | Edmundo (Dirección) | Métricas ejecutivas, valorización del lote en catálogo ($1,310 MXN), vales de entrega digital y enlace con CONTPAQi. |
| **7. ⚙️ Configuración & Catálogos Maestros** | Admin & Ingeniero | CRUD integral de Departamentos y Almacenes Intermedios, Rutas y Secuencias por Modelo con Drag & Drop, Filtros de Calidad y Tolerancias, Usuarios RBAC y parámetros de turno con tablas normalizadas. |

---

## 🎩 Proceso Productivo Tombstone Modelado

1. **Engomado & Apresto:** Inmersión y rigidez química de campanas y telares 1000X Master Telar.
2. **Prensas de Hormado:** Moldeado con vapor a alta temperatura en hormas Denver, Bullrider y Laredo.
3. **Troquelado de Falda & Plancha:** Corte circular de ala y asentado de falda de 4" a 4.5".
4. **Ribeteado & Tafilete:** Costura de badana interior de piel con estampado dorado Tombstone.
5. **Toquillas, Plumas & Herrajes:** Ensamble de toquilla de piel, plumas y pin plateado Tombstone.
6. **Inspección de Calidad & Cajas B2B:** Control de calidad de primera, etiquetado y empaque para mayoristas.

---

## 💻 Acceso Directo y Ejecución

- **Link para Dispositivo Móvil:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)
- **Documento Maestro del Proyecto:** [SISTEMA_TOMBSTONE_MES.md](SISTEMA_TOMBSTONE_MES.md) — Fuente única de verdad de arquitectura, procesos de planta y reglas de negocio.
- **Especificación de Requerimientos de Software (SRS / PRD):** [docs/REQUERIMIENTOS_DEL_SISTEMA.md](docs/REQUERIMIENTOS_DEL_SISTEMA.md) — Catálogo exhaustivo de requerimientos funcionales (`RF-01` a `RF-66`), no funcionales y matriz de trazabilidad.
- **Documentación Ejecutiva:** Consulta la carpeta `docs/` con las guías de descubrimiento y banco de proyectos adaptadas a Tombstone Hats.

---

## 📜 Historial de Versiones (Changelog)

### [2.17.0] - 2026-09-25
- **Estandarización Universal de Tablas, Columnas y Acciones (Regla 0.35 de AGENTS.md):** Homogeneización visual y funcional estricta en la totalidad de tablas del sistema (Departamentos, Filtros de Calidad, Usuarios RBAC, Padrón de Operadores, Almacenes Físicos, Moldes/Hormas y Kárdex).
- **Barra de Filtros Multi-Criterio Reactiva (`.uanify-filter-toolbar`):** Búsqueda de texto en vivo por código/nombre/responsable, filtros selectivos contextuales por proceso/tipo/estatus, contador dinámico "Mostrando X de Y registros" y botón `🔄 Limpiar Filtros`.
- **Estandarización de Celdas y Jerarquía de Contenido:** Códigos con badge monoespaciado `.table-badge-code`, títulos en `.table-cell-primary` con subtítulos descriptivos `.table-cell-subtext`, y pastillas de estatus `.table-status-pill` con punto luminoso pulsante (`.status-dot`).
- **Sección de Acciones Uniforme (`.action-btns-cell`):** Botones touch tablet-first de 38px de altura mínima, centrados, con estilos normalizados: `✏️ Editar` (`.btn-action-edit`), `🗑️ Eliminar/Baja` (`.btn-action-delete`), `👁️ Ver Lotes/Detalle` (`.btn-action-view`), todos con `cursor: pointer !important`.
- **Estado Vacío Estilizado (`.table-empty-row`):** Iconografía temática, mensaje explicativo y botón directo para resetear filtros cuando una búsqueda no arroje resultados.

### [2.9.0] - 2026-09-24
- **Mapa de Proceso Interactivo y Rastreador de Lote para Supervisores:** Nueva sub-pestaña `🗺️ Mapa de Proceso & Rastreador de Lote` en Terminal para consultar al instante la ubicación física de cualquier lote (`49,633`, `49,386`, `49,842`).
- **Línea de Tiempo Visual (Value Stream Map):** Despliegue secuencial de todas las estaciones y filtros de calidad según el modelo de sombrero, indicando pasos completados (✅), estación activa con indicador pulsante (**📍 AQUÍ ESTÁ EL LOTE**), operador a cargo, tiempo de ciclo y próximas paradas.
- **Acciones Operativas de Desplazamiento:** Controles para avanzar (`⏩`) o retroceder (`⏮️`) el lote a lo largo de la línea de tiempo, o reubicarlo directamente haciendo clic sobre cualquier nodo del mapa.
- **Rutas de Fabricación y Secuencias Configurables por Modelo:** Nueva pestaña en Configuración (`📐 Rutas & Secuencias por Modelo`) accesible para **Ingeniero** y **Admin**, que permite ordenar e intercalar departamentos y filtros de calidad (subir `▲`, bajar `▼`, agregar y remover pasos) según el modelo de sombrero (1000X Telar, Campana Preformada, Laqueados Especiales).
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
- **Seguridad RBAC por Ocultamiento Estricto:** Eliminación de iconos de candados 🔒; los módulos no autorizados se ocultan completamente de la barra de navegación para un entorno más limpio y seguro.

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

### [2.16.0] - 2026-09-24
- **Rutas y Secuencias Específicas por Modelo con Drag & Drop (`⠿`):** Reordenamiento interactivo táctil y de cursor para secuencias de manufactura vinculadas estrictamente a modelos específicos de sombreros (`El Viejonón`, `Denver Master`, `Chaparral`, etc.).
- **Restricción Estricta de Alcance en Secuencias:** El constructor de rutas se limita a asignar y desasignar pasos para el modelo en cuestión (`+ Asignar al Final de la Secuencia`, `🗑️ Quitar de la Secuencia`), garantizando que no se puedan crear, editar ni eliminar departamentos o filtros de calidad desde este editor.
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
