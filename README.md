# 🤠 Tombstone Hats MES · Control de Planta & Tablero Andon
### Digitalización Industrial para Planta Matriz Tombstone en San Francisco del Rincón, Guanajuato

[![Versión](https://img.shields.io/badge/Versi%C3%B3n-2.9.0-8B5E3C?style=flat-square&logo=git)](https://github.com/Uanify/uanify-mes-sombreros)
[![Despliegue](https://img.shields.io/badge/GitHub%20Pages-Live-green?style=flat-square)](https://uanify.github.io/uanify-mes-sombreros/)
[![Operación](https://img.shields.io/badge/R%C3%A9gimen-Turno%20%C3%9Anico-blue?style=flat-square)](https://uanify.github.io/uanify-mes-sombreros/)

Sistema MES interactivo desarrollado por **[Uanify](https://github.com/Uanify)** para la reunión de diagnóstico y levantamiento técnico con **Dirección (Edmundo)** y el **Ingeniero de Producción**.

- **Web Oficial del Cliente:** [Tombstone Hats](https://tombstone.mx/)
- **Demostración en Vivo:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)
- **Organización:** [Uanify](https://github.com/Uanify)

---

## 🎯 Caso de Uso Tombstone Hats

Tombstone Hats es una de las marcas insignia de sombreros, texanas y moda vaquera en México y EE.UU., fabricados en el clúster de San Francisco del Rincón.

Este prototipo MES resuelve el dolor operativo central identificado en el piso:
1. **Prensas de Hormado térmico y vapor:** Conteo automático e infalible con pedales/pulsadores Poka-Yoke de ciclos de prensado para modelos emblemáticos (*1000X Master Telar Denver, El Viejonón, Laredo, Frontier*).
2. **Sustitución de pizarrones manuales:** Pantallas Smart TV en la nave central con avance hora por hora, métricas de cumplimiento y Takt Time.
3. **Consola para el Ingeniero de Producción:** Detección de cuellos de botella entre hormado y ribeteado de tafilete, y cálculo automático del **OEE** (*Disponibilidad × Rendimiento × Calidad*).
4. **Visibilidad Financiera para Edmundo:** Conversión instantánea de texanas terminadas a valor monetario ($801,720+ MXN en lote del turno @ $1,310 catálogo Tombstone), costo de merma y payback proyectado en **2.1 meses**.

---

## 🚀 Módulos del Sistema

| Módulo | Usuario | Funcionalidad Clave |
|---|---|---|
| **1. 📺 Tablero Andon (Piso)** | Supervisores y Operarios | Pantalla de 50" en nave central. Estado en vivo de las estaciones Tombstone, ritmo Takt Time (42s) y avance hora por hora. |
| **2. ⚙️ Terminal Puesto / Prensas** | Operarios de Estación | Simulador de **Pedal Mecánico de Prensas** (+1 Texana Tombstone OK). Selector de catálogo (Denver, Viejonón, Laredo, Frontier), reporte de mermas y paros de máquina (cambio de horma SMED, vapor). *Atajo: Tecla ESPACIO o ENTER.* |
| **3. 📊 Consola de Ingeniería** | Ingeniero de Producción | Métricas OEE desagregadas (A: 94.2%, P: 91.8%, Q: 97.8%), visualizador de cuellos de botella (WIP) y bitácora de minutos perdidos por paro. |
| **4. 💼 Dashboard Ejecutivo** | Edmundo (Dirección) | Métricas directivas en tiempo real: valor del lote ($801,720 MXN), cumplimiento de pedidos B2B mayoristas y propuesta comercial por fases. |
| **5. 🛠️ Configuración & Planta** | Admin & Ingeniero | Parámetros generales, gestión RBAC, padrón de operadores, catálogo departamental, registro de filtros de calidad y secuencias de rutas por modelo. |

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
- **Documentación Ejecutiva:** Consulta la carpeta `docs/` con las guías de descubrimiento y banco de proyectos adaptadas a Tombstone Hats.

---

## 📜 Historial de Versiones (Changelog)

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

### [2.7.0] - 2026-09-23
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
