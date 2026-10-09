# Tombstone Hats MES · Control de Planta & Tablero Andon
### Digitalización Industrial para Planta Matriz Tombstone en San Francisco del Rincón, Guanajuato

[![Versión](https://img.shields.io/badge/Versi%C3%B3n-2.50.0-8B5E3C?style=flat-square&logo=git)](https://github.com/Uanify/uanify-mes-sombreros)
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

## Arquitectura Funcional Tombstone Hats · 7 Módulos del MVP (v2.50.0)

Alineada estrictamente con el **Diagrama de Flujo del Sistema & Catálogo de Módulos (MVP)**:

| Módulo | Usuario Objetivo | Funcionalidad Clave del Alcance Oficial |
|---|---|---|
| **Módulo 1: Programación, Loteo e Impresión** | Ingeniería Admin | Ingesta de pedidos CONTPAQi SQL Server, captura de fecha compromiso con semáforo, partición en lotes madre (60 pzas) y Centro de Impresión de Tarjetas Viajeras oficiales con QR en hoja carta para fundas plásticas. |
| **Módulo 2: Monitoreo de Piso, WIP y Tablero 5 KPIs** | Supervisores, Dirección y Planta | (1) WIP en vivo por departamento, (2) Piezas producidas por área, (3) Consumo materiales vs. BOM, (4) Mapeo de reprocesos C1-C5 con causa raíz y depto causante, (5) Tiempo de entrega vs. fecha compromiso. |
| **Módulo 3: Terminal Táctil de Piso** | Supervisores y Operadores | Consola táctil de piso regida por el usuario activo (RBAC y departamentos asignados): escáner QR de tarjeta viajera, registro de depósito en almacén intermedio, división en sublotes de 15 pzas en D07/Rampa y captura ágil de paros. |
| **Módulo 4: Puntos de Control e Inspección (C1 a C5)** | Calidad y Supervisores | Aprobación/Rechazo en filtros C1 a C5 con retornos de reproceso específicos (C1 descuenta en corte, C2 retorna a D06 Refuerzo, C3 retorna a D06 Pintura, C4 retorna a D07 Hidráulicas Alineado, C5 retorna a D10 Adorno). |
| **Módulo 5: Subensambles (T5) & Ficha Técnica Multiperspectiva** | Operación y Calidad Final | Semáforo de buffer en Adorno (tafiletes por talla 55-60) y visualización de fotografías oficiales autorizadas de muestra en múltiples perspectivas (Frente, Hendidura de copa, Toquilla/herraje, Tafilete interior, Ángulo 3/4) para cotejo físico. |
| **Módulo 6: Pre-Nómina de Destajo y Reportes** | Recursos Humanos e Ingeniería | Acumulado semanal de piezas concluidas por operador con base en tarifa fija ($/pza) y exportación administrativa en 1 clic a Microsoft Excel / CSV. |
| **Módulo 7: Microservicio Puente CONTPAQi SQL Server** | TI e Integración LAN | Vistas y SPs en red local ($0 licencias SDK) para sincronización de pedidos, salida de materia prima y entrada de producto terminado con folio de lote MES en observaciones. |

---

## Historial de Versiones (Changelog)

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
- **Regla 0.35 y 0.37 en AGENTS.md:** Documentación exhaustiva de los estándares de tablas, inputs y botones para garantizar la escalabilidad y consistencia futura del software.

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
