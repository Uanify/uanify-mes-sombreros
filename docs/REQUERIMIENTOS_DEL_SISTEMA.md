# 📋 ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS / PRD)
# SISTEMA TOMBSTONE HATS MES · CONTROL DE PLANTA & ANDON
> **Documento Oficial de Requerimientos de Software y Trazabilidad de Funcionalidades**  
> **Código de Documento:** `SRS-MES-TH-2026-v2.9.0` | **Versión:** `v2.9.0`  
> **Fecha de Emisión / Última Actualización:** 24 de Septiembre de 2026  
> **Cliente:** Tombstone Hats (Planta Matriz · San Francisco del Rincón, Guanajuato)  
> **Desarrollador / Proveedor Tecnológico:** [Uanify](https://github.com/Uanify)  
> **Entorno de Producción en Vivo:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)

---

## 📌 1. Propósito, Alcance y Metodología de Mantenimiento

### 1.1 Propósito
Este documento formaliza y cataloga la totalidad de **Requerimientos Funcionales (RF)**, **Requerimientos No Funcionales (RNF)** y **Reglas Operativas de Negocio** que rigen el sistema **Tombstone Hats MES** (Manufacturing Execution System). Sirve como instrumento contractual y técnico de validación entre **Dirección (Edmundo González)**, **Ingeniería de Planta (Ing. Carlos Ortiz)** y el equipo de ingeniería de software de **Uanify**.

### 1.2 Regla de Mantenimiento Obligatorio y Continuo (Regla 0.4 de AGENTS.md)
> [!IMPORTANT]
> **Este documento es de actualización obligatoria e irrevocable tras cada interacción, cambio o nueva funcionalidad solicitada por el usuario.**  
> Ninguna característica, modificación de flujo, alta de entidad o ajuste de diseño se considera completado si no cuenta con su respectivo código de requerimiento registrado, detallado y marcado como implementado en este documento.

---

## 👥 2. Matriz de Roles y Perfiles de Usuario (RBAC)

| ID Rol | Nombre Oficial | Usuario Modelo | Módulos Autorizados | Alcance Departamental | Facultades Clave |
|---|---|---|---|---|---|
| `admin` | **Administrador General** | Edmundo González | Andon, Terminal, Ingeniería, Dirección, Configuración | Global (`*` - Todos) | Gestión total del sistema, alta/baja de usuarios de todos los roles, edición de permisos, parámetros financieros y enlace COMPAC. |
| `ingeniero` | **Ingeniero de Procesos** | Ing. Carlos Ortiz | Andon, Terminal, Ingeniería, Configuración | Global (`*` - Todos) | Auditoría de OEE y cuellos de botella, modelado de rutas y secuencias por modelo, registro de áreas de calidad, alta de supervisores. |
| `supervisor` | **Supervisor de Nave / Almacén** | Juan Manuel Pérez / Roberto Méndez | Andon, Terminal | Restringido a departamentos asignados (ej. D-05 a D-08) | Consulta de mapa de proceso y rastreo de lotes, control de avance de máquinas, registro de mermas/paros, recolección y traspaso de lotes. |
| `operador` | **Operador de Planta (Mano de Obra)** | Jorge, Melany, Pedro Morales, etc. | Sin acceso directo al sistema (Padrón de mano de obra) | Máquina asignada | Procesamiento físico de piezas en máquina bajo supervisión y registro en tarjetas viajeras. |

---

## ⚙️ 3. Requerimientos Funcionales (RF)

### Bloque A: Tablero Andon & Monitoreo de Piso
- **`RF-01` Semáforos de Estado Departamental en Tiempo Real:** El sistema debe desplegar en una vista tipo Smart TV industrial el estado operativo de todas las estaciones de planta clasificado por colores normalizados (Verde = Operando, Amarillo = Advertencia WIP / Cuello de Botella, Rojo = Paro de Línea).
- **`RF-02` Ritmo Takt Time y Cronómetro de Ciclo:** Debe exhibir el Takt Time de referencia de planta (42 segundos por pieza) calculando la cadencia teórica para cumplir la meta de producción sin desviaciones.
- **`RF-03` Avance Hora por Hora de Producción:** Debe incluir una gráfica y tabla horaria (07:00 a 15:00 hrs) que compare la producción meta vs la producción real acumulada hora a hora.
- **`RF-04` Bitácora de Paros e Incidencias en Nave:** Registro cronológico de paros en piso con motivo, estación afectada, duración y piezas impactadas.

---

### Bloque B: Terminal de Planta, Lotes & Trazabilidad QR
- **`RF-05` Trazabilidad QR con Cámara Web en Vivo:** La terminal debe integrar un visor de cámara web estándar mediante `navigator.mediaDevices.getUserMedia()` con retícula industrial para escanear en tiempo real el código QR de las tarjetas viajeras en cualquier dispositivo.
- **`RF-06` Entrada Manual / Alternativa de Código de Barras o Folio:** Debe permitir la captura por teclado, lector USB o pistola de códigos de barras si la cámara no está activa.
- **`RF-07` Gestión de Lote Madre de 60 Piezas:** El sistema debe modelar el lote madre estándar de 60 piezas procedente de almacén de materia prima.
- **`RF-08` Fraccionamiento en Rampa a Sublotes de 15 Piezas:** En la estación de rampa (ensamble de copa y falda para sombreros de 2 piezas), el sistema debe permitir fraccionar el lote de 60 piezas en 4 sublotes independientes de 15 piezas cada uno (ej. `49633-1` al `49633-4`).
- **`RF-09` Distinción Visual Estricta Lote vs Sublote en Tarjeta Viajera:**
  - Si es **Tarjeta de Lote Madre**, el recuadro inferior derecho **NO TIENE NÚMERO** (permanece vacío).
  - Si es **Tarjeta de Sublote**, el recuadro inferior derecho **MUESTRA EL NÚMERO DE SUBLOTE** asignado (1, 2, 3 o 4).
- **`RF-10` Réplica Física Oficial de Tarjeta Viajera (Evidencia Planta GTO):** La interfaz debe proyectar la réplica visual idéntica de la tarjeta con mica protectora, orificio para cordel, sticker circular con nombre del operador responsable (ej. `JORGE`, `MELANY`), ruta departamental (ej. `TARJETA HIDRAULICAS - ADORNO`), folio de orden, modelo, talla, medida de falda y sentido de doblado.
- **`RF-11` Operación en Máquina y Depósito en Almacén de Salida:** Cada operador procesa su lote en su máquina específica y, al concluir, lo deposita formalmente en el almacén intermedio de salida de su departamento.
- **`RF-12` Recolección y Traspaso entre Departamentos:** El recolector del siguiente departamento debe poder ingresar al sistema, verificar las piezas disponibles en el almacén de origen y confirmar el traslado físico hacia su departamento receptor.
- **`RF-13` Clasificación y Registro de Mermas / Defectos:** Modal de clasificación que permita tipificar fallas críticas (quemado en vapor, rotura al troquelar, costura chueca) con reemplazo automático por pieza de saldo para mantener el lote completo de 60 piezas.
- **`RF-14` Segundas de Viernes:** Separación de piezas con defectos estéticos menores no estructurales hacia el almacén de saldos para venta de remate con descuento.

---

### Bloque C: Mapa de Proceso & Rastreo Visual de Lotes (Value Stream Mapping)
- **`RF-15` Rastreador de Lotes para Supervisores:** Sub-pestaña interactiva en Terminal (`subtab-terminal-tracker`) que permite a supervisores, ingenieros y directivos consultar la ubicación exacta de cualquier lote en planta.
- **`RF-16` Línea de Tiempo de Proceso Dinámica:** Gráfico secuencial de nodos horizontales que muestra todas las estaciones de manufactura, almacenes intermedios y paradas de control de calidad por las que debe pasar el lote.
- **`RF-17` Indicadores de Estado de Nodo en Línea de Tiempo:**
  - ✅ **Completado:** Estaciones superadas con éxito con borde verde.
  - 📍 **ACTUAL (AQUÍ ESTÁ EL LOTE):** Nodo resaltado en cuero de marca con badge pulsante, piezas presentes y operador responsable.
  - ⏳ **Pendiente:** Estaciones futuras en espera de arribo.
- **`RF-18` Diferenciación Visual de Tipo de Parada:** Distinción cromática e iconográfica entre departamentos de manufactura (`🏭`), paradas de control de calidad (`🔍`) y almacenes/embarque (`🚚`).
- **`RF-19` Controles Operativos de Avance y Retroceso de Lote:** Botones para avanzar (`⏩`) al siguiente departamento o retroceder (`⏮️`) a la estación previa por ajuste o retrabajo.
- **`RF-20` Reubicación Táctil en Línea de Tiempo:** Capacidad de hacer clic sobre cualquier nodo de la línea de tiempo para reubicar el lote directamente en caso de corrección física en piso.
- **`RF-21` Liberación de Filtro de Calidad In-App:** Botón contextual que se habilita únicamente cuando el lote se encuentra en una estación de inspección (`C-XX`) para certificar la calidad y permitir su paso.

---

### Bloque D: Rutas de Fabricación y Secuencias por Modelo
- **`RF-22` Rutas de Fabricación Configurables por Modelo de Sombrero:** Módulo administrativo en Configuración (`subtab-config-routes`) que permite definir secuencias de pasos adaptadas a la naturaleza constructiva de cada producto:
  - *1000X Master Telar (Viejonón, Denver, Chaparral):* Ruta completa de 2 piezas con fraccionamiento en rampa y 3 filtros de calidad.
  - *Campana Preformada / Fieltro (Magnum, Frontier):* Ruta directa de 1 pieza que omite corte y alambrado inicial.
  - *Laqueados Especiales (Laredo, Sonora):* Ruta con prensas hidráulicas, doble laqueado y tolerancias de alta exigencia.
- **`RF-23` Reordenamiento de Secuencia (Subir / Bajar):** Controles `▲` y `▼` para intercambiar dinámicamente el orden de los departamentos en la línea de producción.
- **`RF-24` Inserción y Supresión de Pasos:** Capacidad de seleccionar cualquier estación o filtro de calidad del catálogo e insertarlo en la ruta, así como eliminar pasos no pertinentes.
- **`RF-25` Persistencia y Sincronización de Rutas:** Guardado persistente en almacenamiento local (`uanify_production_routes`) y emisión de eventos para sincronizar de inmediato la línea de tiempo del rastreador.

---

### Bloque E: Gestión de Calidad, Departamentos & Mano de Obra
- **`RF-26` Registro Dinámico de Áreas de Control de Calidad (`C-XX`):** Modal en Configuración para registrar nuevos filtros de inspección (`C-01`, `C-02`, `C-03`, `C-04`...) con criterios de tolerancia, inspector responsable y tiempo de ciclo.
- **`RF-27` Alta Dinámica de Departamentos (`D-XX`):** Modal para crear nuevas estaciones de trabajo con código, nombre, tipo, Takt Time, asignación de supervisor y multi-selección de operadores.
- **`RF-28` Asignación Múltiple de Operadores a Estaciones:** Lista de verificación (checkboxes) que permite vincular múltiples trabajadores del padrón de planta a un mismo departamento con badges visibles en la tabla maestra.
- **`RF-29` Padrón de Operadores de Planta:** Registro de mano de obra con número de nómina, departamento y máquina asignada (sin credenciales de acceso al sistema).
- **`RF-30` Delimitación de Acceso por Supervisor:** Cada supervisor únicamente visualiza y opera los departamentos que tiene asignados en su perfil (`assignedDepartments`).

---

### Bloque F: Parámetros Generales, Turno Único & RBAC
- **`RF-31` Definición Informativa de Horario de Turno:** Campos configurables para hora de entrada (`07:00`), hora de salida (`15:30`), horario de comida (`12:00 a 12:45`) y días hábiles (`Lunes a Viernes`), sincronizados con el pie del sidebar y encabezados.
- **`RF-32` Meta Semanal de Planta:** Campo rector para establecer la meta semanal de producción (4,250 piezas/semana).
- **`RF-33` Sistema de Permisos Modulares RBAC:** Motor de permisos granulares (`andon`, `terminal`, `engineer`, `executive`, `config`) editable por el Administrador.
- **`RF-34` Seguridad RBAC por Ocultamiento Estricto (Sin Candados):** Las opciones no autorizadas se ocultan completamente del menú de navegación (`display: none`), sin candados ni advertencias disuasorias.
- **`RF-35` Barra Lateral Plegable con Persistencia:** Botón toggle para colapsar la barra lateral a 72px (modo sólo iconos) para maximizar el área de trabajo en pantallas táctiles, con persistencia en `localStorage`.

---

### Bloque G: Consola de Ingeniería, OEE & Dirección
- **`RF-36` Desglose Matemático de OEE:** Cálculo dinámico de Disponibilidad ($A$), Rendimiento ($P$) y Calidad ($Q$) con OEE global de planta.
- **`RF-37` Control de Subensambles (Tafiletes por Talla):** Monitoreo de stock de badanas de piel por tallas (55 a 60 cm), existencias reservadas y disponibles.
- **`RF-38` Catálogo de Hormas y Moldes:** Registro de hormas de aluminio fundido (Roper, Chaparral, Viejón, Laredo, Frontier) vinculadas a prensas de vapor e hidráulicas.
- **`RF-39` Valorización Financiera en Tiempo Real:** Conversión automática de piezas producidas a valor monetario de catálogo Tombstone ($1,310 MXN/pza), costo de merma y valor de segundas.
- **`RF-40` Enlace e Integración con COMPAC (CONTPAQi):** Generación de vales de entrega digitales y preparación de pre-facturas para mayoristas sincronizables con CONTPAQi.

---

## 🛡️ 4. Requerimientos No Funcionales (RNF)

| Código | Requerimiento No Funcional | Especificación Técnica |
|---|---|---|
| **`RNF-01`** | **Costo $0 USD Inicial** | Cero contratación de APIs o servicios de pago sin autorización previa expresa de Andrés. |
| **`RNF-02`** | **Identidad Visual Light Mode Tradicional Moderno** | Fondo `#F8FAFC`, tarjetas `#FFFFFF`, texto `#0F172A` y color de marca Cuero Artesanal `#8B5E3C`. Prohibidos fondos oscuros tipo consola. |
| **`RNF-03`** | **Cero Audio en Planta** | Supresión total de sintetizadores de voz, sirenas o campanas sonoras para evitar contaminación auditiva en planta. |
| **`RNF-04`** | **Enfoque Tablet-First y 100% Responsivo** | Diseñado y optimizado primordialmente para pantallas táctiles de 768px a 1024px; touch targets mínimos de 42-44px. |
| **`RNF-05`** | **Prohibición de Hardware Propietario en UI** | Prohibido usar explícitamente las palabras "iPad", "Tablet" o "Tableta" en la interfaz gráfica. |
| **`RNF-06`** | **Cero Alertas Nativas de Navegador** | Prohibido el uso de `alert()`, `confirm()` y `prompt()`. Todo diálogo debe emplear `UanifyUI.toast` y `UanifyUI.confirm`. |
| **`RNF-07`** | **Cursor Interactivo Universal** | Todo botón, enlace, selector, nodo o tab clickeable debe tener `cursor: pointer !important`. |
| **`RNF-08`** | **Persistencia Local de Alta Disponibilidad** | Los datos maestros, rutas y estados se almacenan en `localStorage` del navegador para operar con o sin conexión a internet. |
| **`RNF-09`** | **Control Estricto de Versiones (SemVer)** | Toda modificación relevante debe incrementar la versión SemVer sincronizándola en 5 archivos maestros con cache-busting `?v=X.Y.Z`. |
| **`RNF-10`** | **Rendimiento Ultrarrápido (<1.0s)** | Arquitectura Vanilla JS y CSS nativo sin frameworks pesados ni empaquetadores lentos para respuesta inmediata en piso. |
| **`RNF-11`** | **Fidelidad al Clúster Sombrerero** | Cero datos artificiales o de relleno; modelos, hormas, prensas y procesos reales de San Francisco del Rincón. |
| **`RNF-12`** | **Actualización Obligatoria de Requerimientos** | Obligación de mantener sincronizado este documento con cada requerimiento y cambio solicitado por el cliente. |

---

## 📊 5. Matriz de Trazabilidad de Requerimientos vs Versiones

| Código | Descripción Sintética | Módulo Afectado | Versión Introducida | Estado Actual |
|---|---|---|---|---|
| **RF-01** | Tablero Andon con Semáforos en Nave Central | Tablero Andon | `v1.0.0` | ✅ En Producción |
| **RF-02** | Takt Time de Referencia (42s) | Andon / Terminal | `v1.0.0` | ✅ En Producción |
| **RF-03** | Avance Hora por Hora de Producción | Tablero Andon | `v1.0.0` | ✅ En Producción |
| **RF-04** | Bitácora de Paros e Incidencias | Tablero Andon | `v2.0.0` | ✅ En Producción |
| **RF-05** | Trazabilidad QR con Cámara Web en Vivo | Terminal de Planta | `v2.8.0` | ✅ En Producción |
| **RF-06** | Entrada Alternativa Manual de Códigos | Terminal de Planta | `v2.5.0` | ✅ En Producción |
| **RF-07** | Lotes Madre de 60 Piezas | Planta General | `v2.0.0` | ✅ En Producción |
| **RF-08** | Fraccionamiento en Rampa a 15 Piezas | Terminal de Planta | `v2.0.0` | ✅ En Producción |
| **RF-09** | Distinción Lote (Vacío) vs Sublote (#) en Tarjeta | Terminal de Planta | `v2.8.1` | ✅ En Producción |
| **RF-10** | Réplica Oficial de Tarjeta Viajera con Mica | Terminal de Planta | `v2.8.1` | ✅ En Producción |
| **RF-11** | Trabajo en Máquina & Almacén de Salida | Terminal de Planta | `v2.8.0` | ✅ En Producción |
| **RF-12** | Recolección y Traspaso entre Depts | Terminal de Planta | `v2.8.0` | ✅ En Producción |
| **RF-13** | Reporte de Merma y Sustitución de Saldo | Terminal de Planta | `v2.7.0` | ✅ En Producción |
| **RF-14** | Segundas para Venta de Viernes | Terminal / Dirección | `v2.7.0` | ✅ En Producción |
| **RF-15** | Rastreador de Lote para Supervisores | Terminal de Planta | `v2.9.0` | ✅ En Producción |
| **RF-16** | Línea de Tiempo de Proceso (Value Stream Map) | Terminal de Planta | `v2.9.0` | ✅ En Producción |
| **RF-17** | Indicador Activo "AQUÍ ESTÁ EL LOTE" | Terminal de Planta | `v2.9.0` | ✅ En Producción |
| **RF-18** | Diferenciación Manufactura vs Calidad | Terminal / Config | `v2.9.0` | ✅ En Producción |
| **RF-19** | Controles de Avance y Retroceso de Lote | Terminal de Planta | `v2.9.0` | ✅ En Producción |
| **RF-20** | Reubicación Táctil en Línea de Tiempo | Terminal de Planta | `v2.9.0` | ✅ En Producción |
| **RF-21** | Liberación In-App de Filtro de Calidad | Terminal de Planta | `v2.9.0` | ✅ En Producción |
| **RF-22** | Rutas de Fabricación por Modelo de Sombrero | Configuración | `v2.9.0` | ✅ En Producción |
| **RF-23** | Reordenamiento de Secuencia (▲ / ▼) | Configuración | `v2.9.0` | ✅ En Producción |
| **RF-24** | Inserción y Quitado de Pasos en Rutas | Configuración | `v2.9.0` | ✅ En Producción |
| **RF-25** | Persistencia de Rutas en LocalStorage | Configuración | `v2.9.0` | ✅ En Producción |
| **RF-26** | Registro de Áreas de Control de Calidad (`C-XX`) | Configuración | `v2.9.0` | ✅ En Producción |
| **RF-27** | Alta Dinámica de Departamentos (`D-XX`) | Configuración | `v2.8.4` | ✅ En Producción |
| **RF-28** | Asignación Multi-Operador a Estaciones | Configuración | `v2.8.4` | ✅ En Producción |
| **RF-29** | Padrón de Operadores de Planta | Configuración | `v2.8.0` | ✅ En Producción |
| **RF-30** | Delimitación Departamental por Supervisor | Terminal / Config | `v2.8.0` | ✅ En Producción |
| **RF-31** | Horario de Turno Informativo Configurable | Configuración | `v2.8.4` | ✅ En Producción |
| **RF-32** | Meta Semanal de Planta (4,250 pzas) | Configuración | `v2.8.0` | ✅ En Producción |
| **RF-33** | Matriz de Roles y Permisos RBAC | Configuración | `v2.6.0` | ✅ En Producción |
| **RF-34** | Ocultamiento Estricto de Módulos (Sin Candados) | Navegación General | `v2.8.3` | ✅ En Producción |
| **RF-35** | Barra Lateral Plegable con Persistencia | Navegación General | `v2.8.3` | ✅ En Producción |
| **RF-36** | Desglose Matemático de OEE de Planta | Ingeniería | `v2.0.0` | ✅ En Producción |
| **RF-37** | Stock de Tafiletes por Talla (55-60) | Ingeniería | `v2.0.0` | ✅ En Producción |
| **RF-38** | Catálogo de Hormas y Moldes de Aluminio | Ingeniería | `v2.8.0` | ✅ En Producción |
| **RF-39** | Valorización Financiera en Tiempo Real | Dirección | `v2.0.0` | ✅ En Producción |
| **RF-40** | Enlace y Vales de Entrega COMPAC | Dirección | `v2.5.0` | ✅ En Producción |
