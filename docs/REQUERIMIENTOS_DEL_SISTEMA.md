# 📋 ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS / PRD)

# SISTEMA TOMBSTONE HATS MES · CONTROL DE PLANTA & ANDON

> **Documento Oficial de Requerimientos de Software y Trazabilidad de Funcionalidades**  
> **Código de Documento:** `SRS-MES-TH-2026-v2.15.0` | **Versión:** `v2.15.0`  
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

El sistema implementa un modelo de **Control de Acceso Basado en Roles (RBAC)** estricto y adaptado a la jerarquía operativa de la planta de sombreros de San Francisco del Rincón.

### 2.1 Definición Exhaustiva de Roles y Capacidades

```
┌────────────────────────────────────────────────────────────────────────┐
│                   JERARQUÍA OPERATIVA TOMBSTONE HATS                   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        [ADMINISTRADOR GENERAL]             [INGENIERO DE PLANTA]
          (Edmundo González)                  (Ing. Carlos Ortiz)
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    ▼
                        [SUPERVISOR DE NAVE]
                 (Juan Manuel Pérez / Roberto Méndez)
                                    │
                                    ▼
                        [OPERADORES DE PLANTA]
                 (Jorge, Melany, Pedro Morales, etc.)
```

#### 👑 1. Administrador General (`admin`)
- **Usuario de Referencia:** Edmundo González (Director / Gerente General).
- **Acceso a Módulos:** Acceso total e irrestricto a los **7 módulos** (`andon`, `terminal`, `inventory`, `operators`, `engineer`, `executive`, `config`).
- **Alcance Departamental:** Global (`*` - Todas las estaciones de planta).
- **Funcionalidades y Capacidades Específicas:**
  - **Gestión Integral de Usuarios:** Dar de alta, editar credenciales, modificar roles y dar de baja a cualquier usuario del sistema (incluyendo ingenieros y supervisores).
  - **Asignación Departamental y Permisos:** Modificar la matriz de permisos modulares y asignar/desasignar departamentos supervisados.
  - **Parámetros Financieros y de Negocio:** Consultar y ajustar el valor comercial de catálogo por sombrero ($1,310 MXN), costo promedio de merma y valor de recuperación en segundas.
  - **Enlace COMPAC / CONTPAQi:** Supervisar el valor acumulado en piso de producción, generar vales de traspaso a producto terminado y preparar pre-facturas para mayoristas.
  - **Control de Metas Globales:** Modificar la meta de producción semanal de planta (ej. 4,250 pzas/semana).
  - **Auditoría Global:** Visualizar la totalidad de métricas de OEE, paros de línea y balances de inventario.

#### 🛠️ 2. Ingeniero de Procesos y Planta (`ingeniero`)
- **Usuario de Referencia:** Ing. Carlos Ortiz (Jefe de Ingeniería y Mejora Continua).
- **Acceso a Módulos:** Autorizado en **6 módulos** (`andon`, `terminal`, `inventory`, `operators`, `engineer`, `config`). Módulo de `executive` restringido por defecto.
- **Alcance Departamental:** Global (`*` - Todas las estaciones de planta).
- **Funcionalidades y Capacidades Específicas:**
  - **Consola de Rendimiento e Ingeniería (`engineer`):** Monitorear en tiempo real el OEE desagregado (Disponibilidad $A$, Rendimiento $P$, Calidad $Q$), Takt Time de referencia (42s) y desviaciones horarias de línea.
  - **Análisis de Paros SMED:** Auditar la bitácora de paros no programados (fallas mecánicas, falta de vapor en caldera, cambios de hormas de aluminio) para aplicar acciones correctivas.
  - **Modelado de Rutas de Fabricación por Modelo (`subtab-config-routes`):** Crear, editar y reordenar secuencias de manufactura para cada tipo de sombrero (1000X Master Telar, Campana Preformada, Laqueados Especiales), insertando o suprimiendo estaciones.
  - **Catálogo de Puntos de Calidad (`C-XX`):** Dar de alta y configurar nuevas estaciones de inspección de calidad (criterios de tolerancia, tiempo estándar de ciclo e inspector responsable).
  - **Auditoría de Almacenes e Inventarios (`inventory`):** Monitorear el inventario de moldes de hormas de aluminio maquinado (Johnson, Sonora, Chaparral, Denver, etc.), estatus de calentamiento y desgaste de prensas.
  - **Gestión del Padrón de Operadores:** Consultar rendimientos individuales por operador, dar de alta operadores y actualizar sus máquinas asignadas.
  - **Alta de Supervisores:** Registrar nuevos supervisores de línea y asignarles departamentos operativos.

#### 📋 3. Supervisor de Nave / Almacén (`supervisor`)
- **Usuarios de Referencia:** Juan Manuel Pérez (Área de Prensas a Terminado, Depts D-05 a D-08), Roberto Méndez (Área de Telar y Preparación, Depts D-01 a D-04).
- **Acceso a Módulos:** Autorizado en **2 módulos primarios** (`andon`, `terminal`). Los módulos de configuración, finanzas e ingeniería avanzada se mantienen ocultos.
- **Alcance Departamental:** **Delimitado estrictamente** a los departamentos asignados en su perfil (`assignedDepartments`).
- **Funcionalidades y Capacidades Específicas:**
  - **Escaneo y Trazabilidad QR en Vivo:** Utilizar la cámara web o pistola de códigos para escanear las tarjetas viajeras físicas al ingresar a su departamento.
  - **Rastreador de Lotes & Value Stream Map:** Consultar en el mapa de línea de tiempo interactivo la ubicación física de cualquier lote en planta, su progreso porcentual y operador asignado.
  - **Avance y Retroceso Operativo:** Confirmar el avance de lote al siguiente departamento o retrocederlo para retrabajo en caso de requerir ajuste técnico.
  - **Fraccionamiento en Rampa (Sombreros 2 Piezas):** Ejecutar la partición del lote madre de 60 piezas en 4 sublotes de 15 piezas cada uno en la estación de ensamble.
  - **Depósito en Almacén de Salida:** Marcar el lote como terminado en máquina y depositarlo formalmente en el almacén intermedio de salida de su estación.
  - **Monitor de Almacenes y Recolección:** Consultar qué lotes están listos en los almacenes del departamento anterior para autorizar y ejecutar su recolección física.
  - **Registro de Mermas y Segundas:** Tipificar mermas por falla física en máquina (con solicitud de reposición por pieza de saldo) o destinar piezas a "Segundas de Viernes".
  - **Liberación de Filtros de Calidad:** Certificar y autorizar el paso de lotes en las estaciones de control de calidad asignadas.

#### 👷 4. Operador de Planta / Mano de Obra (`operador`)
- **Usuarios de Referencia:** Jorge, Melany, Pedro Morales, etc.
- **Acceso a Módulos:** **Sin acceso interactivo directo al software** (no cuentan con usuario ni contraseña en la interfaz digital para evitar distracciones en máquina).
- **Papel en el Sistema:**
  - **Identificación en Padrón de Mano de Obra:** Cada operador está registrado con Número de Nómina, Nombre, Departamento Base, Máquina/Puesto asignado y Estatus.
  - **Vínculo Físico con Tarjeta Viajera:** El nombre del operador responsable se proyecta en el sticker circular de la réplica de la tarjeta viajera física con mica protectora que acompaña al lote.
  - **Cómputo de Rendimiento:** El sistema calcula las piezas procesadas por operador a partir de las confirmaciones de lote registradas por el supervisor en la terminal.

---

### 2.2 Matriz Detallada de Permisos por Acción

| Acción / Funcionalidad del Sistema                                   | Administrador (`admin`) | Ingeniero (`ingeniero`) | Supervisor (`supervisor`) | Operador (`operador`) |
| :------------------------------------------------------------------- | :---------------------: | :---------------------: | :-----------------------: | :-------------------: |
| **Visualizar Tablero Andon General**                                 |           ✅            |           ✅            |            ✅             |       📺 (En TV)      |
| **Escanear Tarjetas QR con Cámara Web**                              |           ✅            |           ✅            |            ✅             |          ❌           |
| **Captura Manual de Lote / Folio de Orden**                          |           ✅            |           ✅            |            ✅             |          ❌           |
| **Avanzar / Retroceder Lotes en Línea de Tiempo**                    |           ✅            |           ✅            |     ✅ (Depts propios)    |          ❌           |
| **Fraccionar Lote Madre (60 a 15 pzas en Rampa)**                    |           ✅            |           ✅            |     ✅ (Depts propios)    |          ❌           |
| **Recolectar Lote de Almacén Previo**                                |           ✅            |           ✅            |     ✅ (Depts propios)    |          ❌           |
| **Registrar Mermas y Segundas de Viernes**                           |           ✅            |           ✅            |     ✅ (Depts propios)    |          ❌           |
| **Liberar Filtro de Calidad (`C-XX`)**                               |           ✅            |           ✅            |     ✅ (Asignado)         |          ❌           |
| **Auditar OEE, Takt Time y Balanceo de Línea**                       |           ✅            |           ✅            |            ❌             |          ❌           |
| **Registrar Paros e Incidencias SMED**                               |           ✅            |           ✅            |            ❌             |          ❌           |
| **Consultar Almacenes e Inventario de Hormas**                       |           ✅            |           ✅            |            ❌             |          ❌           |
| **Consultar Padrón de Operadores**                                   |           ✅            |           ✅            |            ❌             |          ❌           |
| **Crear / Editar / Eliminar Operadores de Planta**                   |           ✅            |           ✅            |            ❌             |          ❌           |
| **Crear / Editar / Reordenar Rutas de Fabricación**                  |           ✅            |           ✅            |            ❌             |          ❌           |
| **Dar de Alta Nuevas Áreas de Calidad (`C-XX`)**                     |           ✅            |           ✅            |            ❌             |          ❌           |
| **Dar de Alta Nuevos Departamentos (`D-XX`)**                        |           ✅            |           ✅            |            ❌             |          ❌           |
| **Editar Departamentos Asignados a Supervisores**                    |           ✅            |           ✅            |            ❌             |          ❌           |
| **Gestionar Usuarios del Sistema y Roles RBAC**                      |           ✅            |           ❌            |            ❌             |          ❌           |
| **Consultar Valuación Financiera y Enlace COMPAC**                   |           ✅            |           ❌            |            ❌             |          ❌           |
| **Modificar Horario de Turno y Meta Semanal de Planta**              |           ✅            |           ❌            |            ❌             |          ❌           |

---

## ⚙️ 3. Requerimientos Funcionales (RF)

### Bloque A: Tablero Andon & Monitoreo de Piso

- **`RF-01` Semáforos de Estado Departamental en Tiempo Real (Alta Intensidad Visual):** El sistema debe desplegar en una vista tipo Smart TV industrial el estado operativo de todas las estaciones de planta con semáforos de **alta saturación y contraste visual** (Verde Esmeralda Sólido `#16A34A` con resplandor = Operando, Ámbar Industrial `#D97706` = Advertencia WIP / Cuello de Botella, Rojo Carmesí `#DC2626` con pulso dinámico = Paro de Línea) legibles a más de 15 metros de distancia en nave.
- **`RF-02` Ritmo Takt Time y Cronómetro de Ciclo:** Debe exhibir el Takt Time de referencia de planta (42 segundos por pieza) calculando la cadencia teórica para cumplir la meta de producción sin desviaciones.
- **`RF-03` Avance Hora por Hora de Producción:** Debe incluir una gráfica y tabla horaria (07:00 a 15:00 hrs) que compare la producción meta vs la producción real acumulada hora a hora.
- **`RF-04` Bitácora de Paros e Incidencias en Nave [Bajo Revisión / Pendiente de Aprobación de Cliente · Ref: GAP-10]:** Registro cronológico de paros en piso con motivo, estación afectada, duración y piezas impactadas. *Justificación Técnica Lean:* Permite cuantificar la Disponibilidad del equipo para el cálculo de OEE. *Punto Pendiente:* Se consultará con el cliente si este registro agrega valor a su supervisión en planta o si genera fricción administrativa innecesaria en la fase inicial.

---

### Bloque B: Terminal de Planta, Lotes & Trazabilidad QR

- **`RF-05` Trazabilidad QR con Cámara Web en Vivo:** La terminal debe integrar un visor de cámara web estándar mediante `navigator.mediaDevices.getUserMedia()` con retícula industrial para escanear en tiempo real el código QR de las tarjetas viajeras en cualquier dispositivo.
- **`RF-06` Entrada Manual / Alternativa de Código de Barras o Folio:** Debe permitir la captura por teclado, lector USB o pistola de códigos de barras si la cámara no está activa.
- **`RF-07` Gestión de Lote Madre de 60 Piezas:** El sistema debe modelar el lote madre estándar de 60 piezas procedente de almacén de materia prima.
- **`RF-08` Fraccionamiento en Rampa a Sublotes de 15 Piezas (Modo Rampa Activable Bajo Demanda · Ref: GAP-11):** En la estación D-04 de ensamble y rampa, el supervisor u operador encargado debe activar explícitamente el **"Modo Fraccionamiento en Rampa"** (`#modalRampaFraccionamiento`) para dividir el lote madre de 60 piezas en 4 sublotes independientes de 15 piezas cada uno (ej. `49386-1` al `49386-4`), asignando al operador de prensas y visualizando las 4 micas viajeras generadas. *Puntos Pendientes con Cliente:* Destino físico de la mica original del Lote Madre y momento/punto de impresión de las 4 micas de sublote.
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
  - _1000X Master Telar (Viejonón, Denver, Chaparral):_ Ruta completa de 2 piezas con fraccionamiento en rampa y 3 filtros de calidad.
  - _Campana Preformada / Fieltro (Magnum, Frontier):_ Ruta directa de 1 pieza que omite corte y alambrado inicial.
  - _Laqueados Especiales (Laredo, Sonora):_ Ruta con prensas hidráulicas, doble laqueado y tolerancias de alta exigencia.
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

### Bloque G: Consola Especializada de Ingeniería & Rendimiento

- **`RF-36` Desglose Matemático de OEE de Planta:** Cálculo dinámico y en tiempo real de Disponibilidad ($A$), Rendimiento ($P$) y Calidad ($Q$) con OEE global Tombstone (>80% clase mundial).
- **`RF-37` Gráficas de Avance Horario vs Takt Time:** Visualización de producción real hora a hora contra la meta programada de 850 pzas/turno para identificar desviaciones y fatiga de línea.
- **`RF-38` Bitácora de Paros e Incidencias SMED:** Registro de minutos perdidos por cambio de moldes de horma, mantenimiento mecánico o fallas de vapor.
- **`RF-39` Valorización Financiera en Tiempo Real:** Conversión automática de piezas producidas a valor monetario de catálogo Tombstone ($1,310 MXN/pza), costo de merma y valor de segundas.
- **`RF-40` Enlace e Integración con COMPAC (CONTPAQi):** Generación de vales de entrega digitales y preparación de pre-facturas para mayoristas sincronizables con CONTPAQi.

---

### Bloque H: Acceso, Autenticación Visual & Sesión de Planta (Login RBAC)

- **`RF-41` Pantalla de Login Formal con Selector de Usuario:** Interfaz dedicada de acceso inicial (`#loginScreen`) que no exige contraseñas por teclado sino que despliega una cuadrícula interactiva con las tarjetas de los usuarios de planta (Edmundo González - Admin, Ing. Carlos Ortiz - Ingeniero, Juan Manuel Pérez - Supervisor Depts 05-08, Roberto Méndez - Supervisor Depts 01-04), visualizando avatar, rol, badge y departamentos asignados, con botón "Ingresar a Planta Tombstone" y persistencia de sesión.
- **`RF-42` Cierre de Sesión y Conmutación Rápida:** Botón en la barra lateral "Cerrar Sesión / Cambiar Usuario" que suspende la sesión activa y retorna a la pantalla de login para conmutar de rol entre turnos o auditorías.

---

### Bloque I: Almacenes Físicos, Hormas & Personal de Planta

- **`RF-43` Monitor de Almacenes Intermedios & Lotes Listos para Recolección:** Subpestaña en la Terminal de Supervisor para consultar los almacenes de salida de todos los departamentos en tiempo real y conocer qué lotes han sido concluidos por el departamento previo y están esperando a ser recogidos por el siguiente departamento, con botón de recolección directa "Recoger Lote".
- **`RF-44` Módulo Centralizado de Almacenes e Inventarios (`inventory`):** Módulo dedicado en la barra lateral para el control de:
  - Almacenes físicos de planta (Materia Prima, Rampa WIP, Pulmón Pre-Prensas, Producto Terminado y Merma de Segundas para Venta de Viernes) con capacidades y stocks.
  - Catálogo maestro de moldes de hormas de aluminio maquinado (Johnson, Sonora, Chaparral, Viejonón, Denver, Bullrider, Laredo, Frontier) con estatus y prensa vinculada.
  - Subensambles de tafiletes de piel por talla (55 a 60).
- **`RF-45` Padrón de Operadores para Consulta de Ingeniería y Supervisión (`operators`):** Módulo dedicado en la barra lateral para la consulta y auditoría de la mano de obra de nave, con buscador en vivo, filtros por departamento y estatus, métricas de piezas procesadas hoy por operador y botón de registro de operador.
- **`RF-46` Consola Especializada de Rendimiento e Ingeniería (`engineer`):** Módulo reestructurado para análisis exclusivo de KPIs de ingeniería: OEE desagregado, gráficas horarias vs Takt Time, bitácora de paros e incidencias y balanceo de estaciones.

---

### Bloque J: Estandarización de Interfaz, Modales y CRUDs Operativos (v2.12.0)

- **`RF-47` Cabeceras de Módulo Fijas al Scroll (`.view-hero-bar`):** En todos los módulos de la aplicación (Terminal, Andon, Almacenes, Operadores, Ingeniería, Dirección, Configuración), el contenedor de cabecera debe mantenerse fijado en la parte superior (`position: sticky; top: 0; z-index: 100`) durante el desplazamiento vertical, garantizando accesibilidad permanente a títulos y botones de acción.
- **`RF-48` Estandarización Estricta de Modales y Diálogos:** Todos los modales del sistema deben respetar rígidamente la arquitectura unificada de cuatro partes: contenedor backdrop, caja modal (`.modal-box`), encabezado fijo superior (`.modal-header`), cuerpo con scroll central (`.modal-body`), y pie de página fijo inferior (`.modal-footer`). Supresión total de alertas nativas de navegador (`alert()` y `confirm()`) sustituidas por componentes asíncronos propios.
- **`RF-49` CRUD Completo de Supervisores y Asignación Departamental:** Modal integral de edición para que administradores e ingenieros modifiquen nombre, correo, rol y asignación departamental interactiva sobre los 14 departamentos de la planta Tombstone (D-01 a D-14), con selección rápida y conteo dinámico de operadores bajo supervisión.
- **`RF-50` CRUD Completo de Operadores de Planta:** Gestión integral de la mano de obra registrada en planta matriz con botones funcionales de alta, edición y baja validada, sincronizado en el padrón de operadores y la tabla de configuración.
- **`RF-51` Notificaciones Toast y Alertas de Éxito Estéticas Premium:** Sistema de alertas no intrusivas con diseño glassmorphic de alta gama (`toast-success`), degradado suave esmeralda, icono SVG, temporizador de 4.5s y pausa interactiva al hacer hover.

---

### Bloque K: Digitalización de Pizarras Físicas de Nave (Evidencia de Planta Tombstone)

- **`RF-52` Réplica Digital del Tablero Físico "1000 X M.T Prensas Secas" (Avance Horario Diagonal & Matriz Semanal):**
  - **Origen:** Evidencia física directa fotografiada en el departamento de Prensas de la planta matriz.
  - **Arquitectura de Datos y Procesos Reales:**
    1. **5 Procesos Reales de Prensas:** `HORMADO`, `REPLANCHAR COPA`, `RECORTAR COPAS`, `PEGAR COPA C/FALDA` (ensamble en rampa) y `REPLANCHADO C/ALAMBRE`.
    2. **Avance Hora por Hora (08:00 a 18:00 hrs):** Cuadrícula horaria con celdas partidas en diagonal: Meta en el cuadrante inferior derecho (165 pzas en horas normales; 90 pzas en horas de comida/descanso de 10:00-11:00 y 14:00-15:00) y Real en el cuadrante superior izquierdo con semaforización condicional (**Verde** $\ge$ Meta, **Rojo** $<$ Meta). Meta diaria total: `1,500 PZS POR PROCESO`.
    3. **Avance Semanal de Ciclo Sombrerero (Jueves a Miércoles):** Matriz de avance diario de 6 días operativos (Jueves, Viernes, Sábado, Lunes, Martes, Miércoles) con meta semanal de `7,500 PZS POR PROCESO` y sumatoria acumulada de planta.
- **`RF-53` Impresión Oficial de Tarjeta Viajera (PDF/Mica):** Formato reglamentario de planta a escala 1:1 listo para corte y enmicado en porta-gafete con cordel. Reservado operativamente para las áreas de Compras y Almacén de Materia Prima.
- **`RF-54` Ficha Técnica Visual con Fotografía Oficial de Modelo:** Consulta gráfica integrada de especificaciones, tolerancias y fotografía ilustrativa del sombrero terminado para auditorías en piso y puestos de adorno.

---

### Bloque L: Rediseño Ergonómico de Terminal de Supervisor, Extracción QR y Almacenes Intermedios (v2.14.0)

- **`RF-55` Extracción Integral de Metadatos desde Código QR (Cero Captura Manual de Modelo):**
  - **Problema que Resuelve:** Los supervisores en planta tenían que seleccionar manualmente el modelo o ingresar campos redundantes que ya pertenecen a la tarjeta física.
  - **Especificación:** Al escanear el código QR (o ingresar el folio de lote/sublote), el sistema extrae automáticamente la totalidad de la información operativa: Folio de Lote Madre, Número de Sublote, Modelo Comercial, Horma de Copa, Medida de Falda, Talla numérica, Doblado, Orden de Producción, Operador Responsable, Estación de Origen y Estación de Destino. Se elimina todo selector manual de modelo en la pantalla de escaneo.
- **`RF-56` Verificación Previa Obligatoria de Tarjeta Viajera Escaneada (Mica Física vs Payload QR):**
  - **Flujo Operativo:** Tras disparar la lectura del código QR (mediante cámara web o pistola USB), el sistema no aplica cambios de estado inmediatamente. En su lugar, despliega un modal de verificación (`#modalVerifyScannedCard`) proyectando la réplica fiel de la tarjeta física (mica de piso) junto con los metadatos desglosados.
  - **Control de Error en Mano:** El supervisor cuenta con dos opciones táctiles:
    1. **"❌ Tarjeta Incorrecta / Escanear de Nuevo":** Descarta el escaneo sin registrar movimientos ni alterar el lote activo, permitiendo reintentar la lectura.
    2. **"✅ Confirmar Coincidencia y Proceder":** Confirma la coincidencia entre la mica física en mano y el sistema, cargando el lote para su posterior depósito.
- **`RF-57` Depósito Automático en Almacén Siguiente según Secuencia de Ruta Configurada:**
  - **Cálculo de Destino:** Al confirmar una tarjeta verificada, el sistema consulta automáticamente la ruta de fabricación configurada para el tipo de sombrero (`routeId`). Identifica la posición actual (`currentStepIndex`) y calcula de forma inmediata el departamento siguiente (`targetStep`).
  - **Acción Táctil:** Habilita el botón prominente: `📥 Depositar Lote en Almacén de [Siguiente Depto]`, transfiriendo la custodia al almacén de entrada de la estación subsecuente.
- **`RF-58` Restricción Departamental Estricta de Custodia y Movimiento para Perfil Supervisor:**
  - **Regla RBAC Industrial:** Un supervisor de planta **no puede mover libremente cualquier lote a cualquier departamento**. Únicamente está facultado para operar y trasladar los lotes correspondientes a sus departamentos asignados (`assignedDepartments`).
  - **Seguridad en Piso:** Si un supervisor intenta transferir un lote cuya estación origen no pertenece a su alcance supervisado, el sistema bloquea la acción y emite una advertencia formal con los departamentos bajo su responsabilidad. Los perfiles Administrador e Ingeniero mantienen facultad de auditoría global (`*`).
- **`RF-59` Mapa General de Planta y Consulta Departamental de Almacenes Intermedios con Filtros:**
  - **Supervisión Macro de Nave:** Sustitución de la consulta restrictiva lote por lote por un mapa general de planta que despliega la totalidad de los 14 departamentos de manufactura y paradas de calidad.
  - **Modal de Almacén Intermedio:** Cada departamento cuenta con un botón táctil `📦 Ver Almacén Intermedio`, el cual abre una ventana modal (`#modalDeptWarehouse`) listando el inventario en proceso (WIP) y sombreros almacenados en su pulmón, con filtros dinámicos por modelo de sombrero, tipo de lote (Lote Madre 60pz vs Sublote 15pz) y estado de calidad.
  - **Regla de Traspaso:** El movimiento físico y traspaso entre plantas se efectúa exclusivamente mediante el escaneo de la tarjeta viajera física.
- **`RF-60` Trazabilidad de Piezas con Merma en Tránsito y Escáner QR en Pantalla Completa:**
  - **Comportamiento de Piezas con Merma:** Cuando un sombrero dentro de una torre es clasificado con merma o defecto, la pieza continúa físicamente acompañando al lote en su avance por la línea hasta el filtro de calidad/separación física final, mostrándose un banner de advertencia en el detalle del lote.
  - **Modo Pantalla Completa:** Opción táctil `⛶ Pantalla Completa` para expandir el visor de escaneo a la totalidad de la pantalla de la tableta, optimizando ergonomía en condiciones de iluminación variable en nave industrial.
- **`RF-61` Ergonomía Táctil Universal y Botones Grandes para Tabletas en TODOS los Módulos:**
  - **Alcance Global:** Estandarización de touch-targets en la totalidad de los 7 módulos (Andon, Terminal, Almacenes/Inventarios, Operadores, Ingeniería, Dirección, Configuración) y modales del sistema MES.
  - **Jerarquía de Alturas Táctiles:** Botones Hero y de acción primordial de 52px a 56px (`.btn-touch-hero`); botones estándar de modales, formularios y filtros de 48px (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`); botones de navegación de 48px (`.nav-btn`); botones de pestañas de 44px a 46px (`.sub-tab-btn`); acciones de tabla y registros de 38px a 42px (`.btn-table-action`, `.btn-sm`); botones de cierre de modal de 44x44px (`.modal-close`); controles de formulario de 48px (`--form-height: 48px`).
  - **Zonas de Seguridad:** Espaciado mínimo de 8px a 12px entre elementos interactivos y supresión del retraso de toque de 300ms (`touch-action: manipulation;`).

---

### Bloque M: Almacén & Control de Inventarios, Unificación de Catálogos y CRUD de Departamentos (v2.15.0)

- **`RF-62` CRUD Integral de Departamentos y Almacenes Intermedios para Ingeniería:**
  - **Propósito:** Permitir a ingenieros y administradores configurar la estructura departamental de planta junto con su almacén intermedio asociado y propiedades físicas.
  - **Especificación Funcional (CRUD Completo):**
    - **Create (Alta):** Generación automática del código correlativo (`D-XX`), captura de Nombre, Tipo de Proceso (Corte, Prensado, Acabado, Ensamble, Empaque, etc.), Almacén Intermedio Asociado (`ALM-XX`), Ubicación en Nave, Capacidad Máxima del Buffer WIP (pzas), Takt Time Teórico (seg/pza), Máquinas/Prensas Asignadas, Supervisor a Cargo, Estatus Operativo (🟢 Activo / 🔴 Inactivo) y checklist multi-selección de Operadores asignados.
    - **Read (Consulta Maestra):** Tabla exhaustiva en Configuración con columnas de Código, Nombre y Proceso, Almacén Intermedio y Ubicación, Takt Time y Capacidad Buffer WIP, Supervisor, Máquinas, Estatus y Acciones.
    - **Update (Edición Completa):** Modal interactivo (`#modalCreateDepartment`) prellenado con los valores actuales que permite modificar cualquiera de sus propiedades físicas, técnicas u operativas sin alterar el historial de lotes previos.
    - **Delete (Baja Validada):** Supresión controlada con confirmación in-app (`UanifyUI.confirm`) que previene la eliminación accidental si hay lotes activos asignados.
    - **Persistencia y Reactividad:** Guardado en `localStorage` (`uanify_custom_stations`) y propagación instantánea a través del `EventBus` (`stations-updated`) hacia el Tablero Andon, Terminal de Supervisor y Mapas de Planta.

- **`RF-63` Unificación de Catálogos Maestros y Módulo General de Almacén & Inventarios:**
  - **Eliminación de Redundancia y Duplicidad:** Supresión total del catálogo duplicado de hormas de aluminio que anteriormente coexistía en la Consola de Ingeniería. Centralización única y definitiva del catálogo de moldes y hormas exclusivamente dentro del módulo **Almacén & Control de Inventarios** (`subtab-inventory-molds`).
  - **Ubicación Exclusiva del Botón "Registrar Horma":** El botón interactivo `🎩 + Registrar Nueva Horma` se despliega única y exclusivamente dentro de la pestaña del catálogo maestro de hormas y moldes (`subtab-inventory-molds`), eliminándose por completo de la cabecera global del módulo para no invadir las pestañas de Almacenes Físicos, Subensambles o Kárdex.
  - **Módulo General de Almacén & Inventarios:** Evolución del módulo hacia una plataforma escalable para la custodia de todos los inventarios de planta:
    1. *Almacenes Físicos:* Existencias y capacidades de Materia Prima, Rampa WIP, Pulmón Pre-Prensas, Almacén de Segundas de Viernes y Almacén Fiscal de Producto Terminado.
    2. *Catálogo Maestro de Moldes y Hormas:* Modelos de hormas de aluminio maquinado (Johnson, Sonora, Chaparral, Viejonón, Denver, Bullrider, Laredo, Frontier), estatus de disponibilidad, prensa asignada y alta de nuevos moldes con persistencia (`uanify_custom_molds`).
    3. *Subensambles y Tafiletes:* Existencias de tafiletes de piel por talla (55 a 60).
    4. *Kárdex & Movimientos de Almacén:* Bitácora cronológica de entradas, traspasos y salidas físicas con folio de lote, almacén origen/destino y custodio responsable.
  - **Delimitación Estricta de Dominios del Sistema:**
    - *Configuración de Planta & Catálogos Maestros:* Configuración técnica estructural (Departamentos con Almacenes Intermedios, Rutas de Fabricación, Permisos RBAC, Padrón de Operadores).
    - *Almacén & Control de Inventarios:* Gestión física de materiales, stocks, moldes y movimientos.
    - *Consola de Ingeniería & Rendimiento:* Herramientas analíticas puras (OEE, Balanceo de Línea & Cuellos de Botella, Matriz de Materiales BOM con cambio masivo de proveedor, KPIs de Rendimiento).
    - *Operación en Piso:* Ejecución en tiempo real (Terminal de Supervisor con lector QR ergonómico, verificación de micas viajeras, fraccionamiento en rampa y Tablero Andon).

---

## 🏭 4. Módulos del Sistema vs. Proceso de Producción Real & Análisis de Gaps

Esta sección desglosa las capacidades funcionales de cada uno de los **7 módulos** del sistema frente al flujo real de manufactura de sombreros de paja telar, fieltro y campana en la planta matriz de San Francisco del Rincón, Guanajuato. Su propósito explícito es **auditar y detectar qué pasos del proceso físico real hacen falta agregar o ajustar en el software**.

### 4.1 Capacidades Funcionales por Módulo del Sistema

#### 1. Módulo Terminal de Planta & Trazabilidad de Lotes (`terminal`)
- **Propósito:** Estación táctil de piso de nave para supervisores de línea.
- **Capacidades Operativas Actuales:**
  - **Escáner QR en Vivo:** Lectura por cámara web integrada o lector USB de la tarjeta viajera física.
  - **Identificación de Tarjeta Viajera Oficial:** Renderiza la réplica exacta de la tarjeta con mica protectora de planta (folio de orden, modelo, talla, medida de falda, sticker del operador y sentido de doblado).
  - **Control de Lote Madre y Sublotes:** Distingue si la tarjeta corresponde al lote madre de 60 piezas (recuadro inferior vacío) o a un sublote fraccionado (1, 2, 3 o 4) tras la estación de rampa.
  - **Línea de Tiempo de Proceso (Value Stream Map):** Diagrama interactivo de estaciones con el pin animado *"AQUÍ ESTÁ EL LOTE"*, avance paso a paso, retroceso por retrabajo o reubicación táctil.
  - **Liberación de Filtros de Calidad:** Certificación y firma digital de aprobación en nodos de inspección (`C-01` a `C-04`).
  - **Almacén de Salida Departamental:** Depósito formal de piezas concluidas en máquina hacia el almacén intermedio.
  - **Monitor de Almacenes Intermedios:** Vista en vivo de qué departamentos previos ya tienen lotes concluidos listos para ser recogidos por el recolector del siguiente departamento.
  - **Registro de Mermas y Segundas:** Tipificación de defectos con sustitución automática por piezas de saldo o envío al lote de "Segundas de Viernes".

#### 2. Módulo Tablero Andon & Monitoreo en Nave (`andon`)
- **Propósito:** Tablero de visualización tipo Smart TV industrial para toda la nave de producción.
- **Capacidades Operativas Actuales:**
  - **Semáforos de Estado en Tiempo Real:** 14 estaciones con codificación de color normalizada (Verde = Operando, Amarillo = WIP elevado / Cuello de botella, Rojo = Paro de línea).
  - **Takt Time de Planta (42s):** Indicador de cadencia de producción por pieza.
  - **Curva Horaria de Producción:** Comparativa gráfica y tabular de Meta vs Producción Real hora a hora (07:00 a 15:00 hrs).
  - **Bitácora de Paros e Incidencias en Piso:** Registro de motivos de paro, minutos detenidos y piezas impactadas.

#### 3. Módulo Central de Almacenes & Hormas (`inventory`)
- **Propósito:** Control de inventarios intermedios, materia prima y moldes mecánicos de prensado.
- **Capacidades Operativas Actuales:**
  - **Saldos de Almacenes Físicos:** Materia Prima, Rampa WIP, Pulmón Pre-Prensas, Producto Terminado y Almacén de Segundas de Viernes.
  - **Catálogo Maestro de Hormas de Aluminio Maquinado:** Registro de modelos tradicionales (Johnson, Sonora, Chaparral, Viejonón, Denver, Bullrider, Laredo, Frontier), estatus de disponibilidad y prensa hidráulica/térmica asignada.
  - **Inventario de Subensambles:** Control de existencias de tafiletes de piel por talla (55 a 60).

#### 4. Módulo de Padrón de Operadores (`operators`)
- **Propósito:** Gestión y consulta del personal de mano de obra operativa de planta.
- **Capacidades Operativas Actuales:**
  - **Directorio Maestro de Trabajadores:** Número de nómina, nombre, departamento base, máquina/puesto asignado y estatus operativo.
  - **Métricas Individuales de Producción:** Conteo en tiempo real de piezas procesadas hoy por cada operador.
  - **CRUD Completo:** Búsqueda en vivo, filtrado por estación, alta de nuevo personal, edición de asignación de máquina y baja con confirmación in-app.

#### 5. Módulo de Rendimiento e Ingeniería de Planta (`engineer`)
- **Propósito:** Consola analítica para el Ing. Carlos Ortiz y equipo de mejora continua.
- **Capacidades Operativas Actuales:**
  - **Desglose Matemático de OEE:** Disponibilidad ($A$), Rendimiento ($P$) y Calidad ($Q$) con OEE global Tombstone (>80%).
  - **Análisis de Capacidad y Takt Time:** Detección de desviaciones horarias contra la meta programada de 850 pzas/turno.
  - **Auditoría de Paros SMED:** Análisis de tiempos muertos por cambio de horma, fallas de vapor o mantenimiento preventivo.
  - **Simulador Operativo:** Motor de generación de eventos para pruebas de estrés de línea y validación de cadencias.

#### 6. Módulo de Dirección General & Enlace COMPAC (`executive`)
- **Propósito:** Consola gerencial para Edmundo González y Dirección General.
- **Capacidades Operativas Actuales:**
  - **Valorización Financiera en Vivo:** Multiplicación de piezas terminadas por precio de catálogo ($1,310 MXN), valuación de merma y valor de rescate en segundas.
  - **Enlace COMPAC / CONTPAQi:** Preparación de vales de traspaso a producto terminado y generación de pre-facturas por lote para mayoristas.

#### 7. Módulo de Configuración de Planta & Rutas de Fabricación (`config`)
- **Propósito:** Parametrización técnica del sistema y modelado de procesos.
- **Capacidades Operativas Actuales:**
  - **Modelador de Rutas por Modelo de Sombrero:** Definición y reordenamiento de secuencias departamentales (`▲`/`▼`) adaptadas a cada estilo (1000X Master Telar, Campana Preformada, Laqueados Especiales).
  - **Catálogo de Puntos de Calidad (`C-XX`):** Registro de tolerancias, tiempos y responsables de inspección.
  - **Catálogo Departamental (`D-XX`):** Alta y edición de estaciones con asignación multi-operador.
  - **Gestión RBAC y Supervisores:** Asignación de departamentos a supervisores y matriz de permisos.
  - **Turno y Metas:** Configuración del horario laboral único (07:00 a 15:30 hrs) y meta semanal (4,250 pzas).

---

### 4.2 Mapeo del Proceso Físico Real de Sombreros vs Sistema

La manufactura de sombreros finos en San Francisco del Rincón combina artesanía de precisión y prensado térmico/hidráulico de alta presión. A continuación se mapea cada paso físico real contra la cobertura actual del sistema:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               FLUJO DE MANUFACTURA REAL DE SOMBREROS TOMBSTONE (SFR)                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
 [1. Materia Prima] ──► [2. Corte Telar] ──► [3. Engomado / Dope] ──► [4. Rampa Ensamble]
                                                                             │ (Fracciona a 15p)
                                                                             ▼
 [8. Terminado Adorno] ◄── [7. Laqueado] ◄── [6. Rebabado/Ribete] ◄── [5. Prensas y Hormas]
          │
          ▼
 [9. Montaje Tafilete] ──► [10. Calidad Final] ──► [11. Empaque y Traspaso COMPAC]
```

| Paso Físico Real en Planta | Descripción de la Operación en Piso | Estación / Código | Cobertura en el Sistema | Estatus / Soporte Digital |
| :--- | :--- | :---: | :--- | :---: |
| **1. Recepción de Materia Prima** | Ingreso de lienzos de telar de paja fina, fieltros de lana/liebre, toquillas, rollos de tafilete de piel y herrajes. | Almacén MP | Módulo `inventory` (Almacén Materia Prima). | ✅ Cubierto |
| **2. Corte y Troquelado** | Corte de lienzos circulares para falda/ala y piezas de copa con suajes mecánicos. | D-01 Corte | Registrado como estación D-01 en rutas. | ✅ Cubierto |
| **3. Engomado y Apresto (Dope)** | Inmersión o aspersión en tinas de apresto/resina para conferir rigidez a la fibra. Tiempo de secado en túnel. | D-02 Engomado | Registrado como estación D-02 en rutas. | ✅ Cubierto |
| **4. Rampa de Ensamble (2 Piezas)** | Cosido de copa con falda en máquina especial de cadeneta. **El lote madre de 60 piezas se fracciona físicamente en 4 grupos de 15 piezas.** | D-03 Rampa | Botón de fraccionamiento a 4 sublotes con tarjetas viajeras 1, 2, 3 y 4 (`RF-08`, `RF-09`). | ✅ Cubierto |
| **5. Filtro de Calidad Intermedio 1** | Inspección de costura de rampa y simetría antes de someter a calor y prensa. | C-01 Calidad Rampa | Parada de calidad con certificación in-app (`RF-21`, `RF-26`). | ✅ Cubierto |
| **6. Prensas Hidráulicas y Vapor** | Conformado térmico con vapor a presión (60-80 PSI) y horma de aluminio maquinado caliente a 110-130°C. Planchado de falda y copa. | D-04 Prensas | Mapeo de prensas y catálogo de hormas maquinadas (`RF-44`). | ✅ Cubierto |
| **7. Rebabado y Recorte de Falda** | Corte perimetral exacto del ancho de ala (ej. falda 3 1/2", 4", 4 1/4") según orden de producción. | D-05 Rebabado | Estación registrada en rutas de fabricación. | ✅ Cubierto |
| **8. Ribeteado del Ala** | Colocación de cinta de ribete en el borde de la falda con máquina ribeteadora. | D-06 Ribeteado | Estación registrada en rutas de fabricación. | ✅ Cubierto |
| **9. Filtro de Calidad Intermedio 2** | Inspección de forma, simetría de copa y medida exacta de falda. | C-02 Calidad Horma | Parada de calidad con firma digital. | ✅ Cubierto |
| **10. Laqueado Nitrocelulósico** | Aplicación de barniz especial en cabina con pistola de aspersión y secado para brillo y resistencia al agua. | D-07 Laqueado | Estación registrada en rutas de fabricación. | ✅ Cubierto |
| **11. Adorno Exterior** | Colocación de toquilla vaquera (piel, fieltro o listón), pluma decorativa y hebilla metálica de marca Tombstone. | D-08 Adorno | Estación registrada en rutas de fabricación. | ✅ Cubierto |
| **12. Confección y Montaje de Tafilete** | Corte y grabado foliado en oro del tafilete de piel badana por talla (55 a 60), con costura de hilván interior. | D-09 Tafiletes | Control de stock de tafiletes por talla en `inventory`. | ✅ Cubierto |
| **13. Empegostado y Pegado de Forro** | Fijación del forro de satín interior con el escudo bordado Tombstone mediante adhesivo térmico. | D-10 Forrado | Estación registrada en rutas de fabricación. | ✅ Cubierto |
| **14. Inspección Final de Calidad** | Auditoría al 100% de tolerancias: talla, manchado de laca, textura, costura, centrado de toquilla. | C-03 Calidad Final | Filtro de calidad final antes de embalaje. | ✅ Cubierto |
| **15. Etiquetado, Empaque y COMPAC** | Colocación de tag de precio comercial, guardado en caja de cartón individual Tombstone Hats y traspaso contable. | D-11 Empaque | Generación de vales y enlace con CONTPAQi Comercial (`RF-40`). | ✅ Cubierto |

---

### 4.3 Matriz de Detección de Gaps (Pasos Faltantes a Agregar o Ajustar)

A partir del análisis del proceso productivo físico en San Francisco del Rincón, se han detectado los siguientes **Gaps Operativos (puntos que hacen falta validar, detallar o implementar en el sistema)**. Esta matriz sirve de guía directa para la siguiente sesión de validación con **Edmundo González (Dirección)** y el **Ing. Carlos Ortiz (Ingeniería)**:

| # Gap | Dimensión / Área | Paso Físico Real / Situación en Planta | Estado Actual en el Software | Propuesta de Ajuste / Requerimiento Sugerido |
| :---: | :--- | :--- | :--- | :--- |
| **GAP-01** | **Impresión de Tarjetas Viajeras (Área Compras/Almacén)** | La impresión de tarjetas viajeras se origina exclusivamente en el área de Compras y Almacén de Materia Prima al liberar una orden. **En la Terminal de Supervisor no tiene caso ni se requiere imprimir tarjetas**. | Retirado el botón de impresión del módulo Terminal de Supervisor (`v2.14.0`). Queda pendiente implementar la cola de impresión centralizada exclusivamente en los módulos de Compras / Almacén. | Posponer e implementar formalmente en el módulo de Compras/Almacén central. |
| **GAP-02** | **Identificación de Sublotes en Tafilete** | Tras el fraccionamiento en rampa a 4 sublotes de 15 piezas, los sombreros se separan físicamente en racks o diablos rodantes. Existe riesgo de que una pieza del sublote 1 se mezcle físicamente con el sublote 3 en adorno. | La tarjeta viajera digital muestra el número 1, 2, 3 o 4, pero **las 15 piezas físicas no tienen marca individual**. | Evaluar si se requiere generar un micro-código o sello de tinta para estampar en el revés del tafilete o en el cartoncillo protector de cada pieza del sublote. |
| **GAP-03** | **Monitoreo de Presión de Caldera de Vapor** | Las prensas hidráulicas y térmicas dependen críticamente de la caldera de vapor (60 a 80 PSI continuos). Si la caldera pierde presión, las piezas quedan mal hormadas o arrugadas. | Los paros de vapor se registran manualmente en la bitácora de paros del Tablero Andon. | Evaluar integración con transductor de presión IoT o sensor digital para registrar paros automáticos si la presión de caldera cae de 55 PSI. |
| **GAP-04** | **Consumo de Químicos (Laca y Dope)** | En engomado y laqueado se consumen litros de laca nitrocelulósica, solventes thiner y tinas de apresto, cuyo costo impacta directamente en el costo unitario del sombrero. | El módulo `inventory` controla almacenes de piezas y hormas de aluminio, pero **no registra consumos de químicos por lote**. | Decidir si el gasto de laca y solventes se controla como insumo directo en el MES por lote o si permanece como costo indirecto de fabricación (CIF) en COMPAC. |
| **GAP-05** | **Ciclo de Vida y Temperatura de Hormas** | Los moldes de aluminio maquinado sufren fatiga térmica y desgaste en aristas tras miles de prensadas, y requieren calentamiento previo a 120°C antes de iniciar el turno. | El sistema lista las hormas (Johnson, Sonora, Chaparral, etc.) y su estatus (Montada, En Espera, Mantenimiento), pero **no cuenta número acumulado de prensadas**. | Agregar contador de ciclos de prensado por horma de aluminio para programar rectificación y pulido preventivo cada 10,000 golpes. |
| **GAP-06** | **Cálculo de Nómina a Destajo por Operador** | En el clúster sombrerero de Guanajuato, gran parte de la mano de obra cobra a destajo (tarifa fijada por pieza producida en su máquina específica). | El módulo `operators` computa las piezas procesadas hoy por cada operador, pero **no calcula el acumulado semanal ni la tarifa en pesos por pieza**. | Evaluar si se agrega un campo de tarifa de destajo por operación ($/pza) para generar el pre-reporte de nómina de viernes exportable a Excel. |
| **GAP-07** | **Sincronización Bidireccional CONTPAQi** | Dirección requiere que al liberarse el lote en Empaque (`C-03`), el movimiento de entrada a producto terminado impacte automáticamente el inventario fiscal de CONTPAQi Comercial. | El sistema genera el vale digital y pre-factura en pantalla (`RF-40`), pero **no escribe directamente vía ODBC/API en la base de datos de CONTPAQi**. | Definir con el contador y sistemas de Tombstone si el enlace será mediante archivo de intercambio (.CSV/.TXT) o vía servicio de integración de base de datos local. |
| **GAP-08** | **Carga Masiva de Fichas Técnicas con Foto** | Cada temporada Tombstone lanza variantes con combinación de falda, toquilla, plumaje y color de laca. | La ruta se configura por modelo base, pero **no muestra la fotografía de referencia visual del modelo terminado** para el operador de adorno. | Permitir subir o asociar la fotografía de muestra de la ficha técnica oficial para que el supervisor y el operador de adorno vean en pantalla cómo debe quedar el sombrero. |
| **GAP-09** | **Especificación del Payload QR y Segregación Física de Mermas** | **1) Formato QR:** Falta acordar con el cliente si sus impresoras de etiquetas pueden generar códigos 2D de alta densidad con el payload completo o si mandarán un folio simple enlazado a la base de datos.<br>**2) Segregación de Sombreros:** Se detectó que cuando una pieza de la torre se marca con merma, continúa avanzando físicamente con el lote hasta un punto indeterminado donde se extrae. | El sistema soporta ambos formatos de QR (`TB\|...` y folio simple) y mantiene la advertencia visual de pieza en tránsito (`RF-60`). | Validar en mesa técnica con Tombstone: capacidad de su hardware de impresión y estación exacta donde se extrae físicamente el sombrero de merma. |
| **GAP-10** | **Justificación y Viabilidad Operativa de la Bitácora de Paros de Máquina** | En la manufactura Lean/MES tradicional, la bitácora de paros permite registrar fallas de equipo para calcular la Disponibilidad del OEE. Sin embargo, en la operación física de Tombstone, el ritmo se rige por avance de lotes en micas viajeras. | Actualmente existe la bitácora en Tablero Andon (`RF-04`), pero está marcada **bajo revisión**. Exigir a supervisores u operarios registrar cada micro-paro puede generar fricción administrativa excesiva en piso. | Consultar formalmente con Edmundo González y el Ing. Carlos Ortiz: ¿Tienen interés real en registrar motivos de paros de máquina en la terminal, o prefieren omitir este módulo para mantener la operación 100% enfocada en el flujo de lotes y escaneo QR? |
| **GAP-11** | **Protocolo de Fraccionamiento en Rampa e Impresión/Asignación de Micas de Sublote** | En la estación D-04 de Ensamble y Rampa, el lote madre de 60 piezas se fracciona físicamente en 4 torres de 15 sombreros para ingresar a prensas.<br>**Punto 1:** ¿Qué sucede físicamente con la tarjeta del Lote Madre al fraccionarse? (¿Se archiva en rampa o acompaña a la torre 1?).<br>**Punto 2:** ¿En qué momento y dónde se imprimen las tarjetas viajeras de los 4 sublotes? | Se implementó el **Modo Fraccionamiento en Rampa** activable bajo demanda (`RF-08`) que genera los 4 folios derivados (`[Lote]-1` al `[Lote]-4`) y visualiza sus micas reglamentarias. | Definir con Tombstone: 1) si las 4 tarjetas de sublote ya vienen impresas desde Almacén de Materia Prima en una funda múltiple, o 2) si Rampa contará con una impresora local de etiquetas para emitirlas en piso en el momento del fraccionamiento. |

---

## 🏷️ 5. Propuestas de Nomenclatura Comercial del Software

Para dotar al sistema de una identidad de producto formal que conserve el prestigio de la marca **Tombstone Hats** combinado con un nombre genérico de software industrial o MES (Manufacturing Execution System), se presentan **10 propuestas categorizadas** para consideración del cliente:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│               CATÁLOGO DE NOMBRES COMERCIALES PARA EL SOFTWARE                │
└────────────────────────────────────────────────────────────────────────────────┘
 1. LÍNEA INDUSTRIAL & MES:
    • Tombstone MES (Manufacturing Execution System) ── [RECOMENDADO TÉCNICO]
    • Tombstone Flow (Flujo Continuo de Planta)
    • Tombstone Apex (Precisión & Alto Rendimiento)
    • Tombstone PlantaOS (Sistema Operativo de Planta)

 2. LÍNEA TRADICIÓN SOMBRERERA & ARTESANAL:
    • Tombstone Hornero (Inspirado en el molde y alma del sombrero) ── [RECOMENDADO PLANTA]
    • Tombstone TelarOS (Tributo a la fibra y origen del sombrero fino)
    • Tombstone MasterCraft (La maestría artesanal de San Francisco del Rincón)

 3. LÍNEA PRODUCTO TECNOLÓGICO & SAAS (UANIFY):
    • Uanify MES · Tombstone Edition (Co-branding tecnológico oficial)
    • Tombstone Pulse (El pulso y ritmo cardíaco de la fábrica)
    • Tombstone Operix (Control de operaciones y piso de manufactura)
```

### 5.1 Justificación y Recomendación de Selección

1. **Opción 1: `Tombstone MES` (La opción más formal y estándar a nivel industrial):**
   - *Por qué funciona:* "MES" es el acrónimo universal en la industria manufacturera global (Siemens, Rockwell, SAP). Transmite seriedad inmediata a auditores, inversionistas y clientes mayoristas en Estados Unidos y México.
   - *Subtítulo recomendado:* `Tombstone MES · Sistema Integral de Control de Manufactura & Piso`.

2. **Opción 2: `Tombstone Hornero` (La opción con mayor arraigo cultural sombrerero):**
   - *Por qué funciona:* El *hornero* es la figura central del taller tradicional; es quien domina el vapor, el aluminio y le da el alma y la forma al sombrero. Para los supervisores y operadores de San Francisco del Rincón, este nombre genera empatía y pertenencia inmediata sin sonar ajeno.
   - *Subtítulo recomendado:* `Tombstone Hornero · Control Digital de Planta y Trazabilidad`.

3. **Opción 3: `Tombstone Flow` (La opción de Lean Manufacturing moderna):**
   - *Por qué funciona:* Refleja la eliminación de cuellos de botella, el flujo continuo de una pieza o lote de 15 piezas y la sincronización con el Takt Time de 42 segundos.
   - *Subtítulo recomendado:* `Tombstone Flow · Manufactura Sincronizada en Tiempo Real`.

4. **Opción 4: `Uanify MES · Tombstone Edition` (La opción de producto de software distribuible):**
   - *Por qué funciona:* Posiciona a la solución como un producto de software robusto desarrollado por Uanify con parametrización personalizada de clase mundial para Tombstone Hats.

> [!TIP]
> **Recomendación Estratégica:** Utilizar comercialmente **`Tombstone MES`** como denominación formal en contratos, auditorías y manuales técnicos, y utilizar **`Tombstone Hornero`** o **`Tombstone Flow`** como nombre de producto operativo en el encabezado visible para los supervisores en la planta.

---

## 🛡️ 6. Requerimientos No Funcionales (RNF)

| Código       | Requerimiento No Funcional                          | Especificación Técnica                                                                                                                   |
| ------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **`RNF-01`** | **Costo $0 USD Inicial**                            | Cero contratación de APIs o servicios de pago sin autorización previa expresa de Andrés.                                                 |
| **`RNF-02`** | **Identidad Visual Light Mode Tradicional Moderno** | Fondo `#F8FAFC`, tarjetas `#FFFFFF`, texto `#0F172A` y color de marca Cuero Artesanal `#8B5E3C`. Prohibidos fondos oscuros tipo consola. |
| **`RNF-03`** | **Cero Audio en Planta**                            | Supresión total de sintetizadores de voz, sirenas o campanas sonoras para evitar contaminación auditiva en planta.                       |
| **`RNF-04`** | **Enfoque Tablet-First y Botones Grandes en TODOS los Módulos** | Diseñado y optimizado para pantallas táctiles de 768px a 1024px y puestos de trabajo; botones estándar de 48px, botones Hero de 52-56px, acciones de tabla de 38-42px y controles de 48px con separación segura de 8-12px. |
| **`RNF-05`** | **Prohibición de Hardware Propietario en UI**       | Prohibido usar explícitamente las palabras "iPad", "Tablet" o "Tableta" en la interfaz gráfica.                                          |
| **`RNF-06`** | **Cero Alertas Nativas de Navegador**               | Prohibido el uso de `alert()`, `confirm()` y `prompt()`. Todo diálogo debe emplear `UanifyUI.toast` y `UanifyUI.confirm`.                |
| **`RNF-07`** | **Cursor Interactivo Universal**                    | Todo botón, enlace, selector, nodo o tab clickeable debe tener `cursor: pointer !important`.                                             |
| **`RNF-08`** | **Persistencia Local de Alta Disponibilidad**       | Los datos maestros, rutas y estados se almacenan en `localStorage` del navegador para operar con o sin conexión a internet.              |
| **`RNF-09`** | **Control Estricto de Versiones (SemVer)**          | Toda modificación relevante debe incrementar la versión SemVer sincronizándola en 5 archivos maestros con cache-busting `?v=X.Y.Z`.      |
| **`RNF-10`** | **Rendimiento Ultrarrápido (<1.0s)**                | Arquitectura Vanilla JS y CSS nativo sin frameworks pesados ni empaquetadores lentos para respuesta inmediata en piso.                   |
| **`RNF-11`** | **Fidelidad al Clúster Sombrerero**                 | Cero datos artificiales o de relleno; modelos, hormas, prensas y procesos reales de San Francisco del Rincón.                            |
| **`RNF-12`** | **Actualización Obligatoria de Requerimientos**     | Obligación de mantener sincronizado este documento con cada requerimiento y cambio solicitado por el cliente.                            |

---

## 📊 7. Matriz de Trazabilidad de Requerimientos vs Versiones

| Código    | Descripción Sintética                                       | Módulo Afectado              | Versión Introducida | Estado Actual    |
| --------- | ----------------------------------------------------------- | ---------------------------- | ------------------- | ---------------- |
| **RF-01** | Tablero Andon con Semáforos en Nave Central                 | Tablero Andon                | `v1.0.0`            | ✅ En Producción |
| **RF-02** | Takt Time de Referencia (42s)                               | Andon / Terminal             | `v1.0.0`            | ✅ En Producción |
| **RF-03** | Avance Hora por Hora de Producción                          | Tablero Andon                | `v1.0.0`            | ✅ En Producción |
| **RF-04** | Bitácora de Paros e Incidencias                             | Tablero Andon                | `v2.0.0`            | ✅ En Producción |
| **RF-05** | Trazabilidad QR con Cámara Web en Vivo                      | Terminal de Planta           | `v2.8.0`            | ✅ En Producción |
| **RF-06** | Entrada Alternativa Manual de Códigos                       | Terminal de Planta           | `v2.5.0`            | ✅ En Producción |
| **RF-07** | Lotes Madre de 60 Piezas                                    | Planta General               | `v2.0.0`            | ✅ En Producción |
| **RF-08** | Fraccionamiento en Rampa a 15 Piezas                        | Terminal de Planta           | `v2.0.0`            | ✅ En Producción |
| **RF-09** | Distinción Lote (Vacío) vs Sublote (#) en Tarjeta           | Terminal de Planta           | `v2.8.1`            | ✅ En Producción |
| **RF-10** | Réplica Oficial de Tarjeta Viajera con Mica                 | Terminal de Planta           | `v2.8.1`            | ✅ En Producción |
| **RF-11** | Trabajo en Máquina & Almacén de Salida                      | Terminal de Planta           | `v2.8.0`            | ✅ En Producción |
| **RF-12** | Recolección y Traspaso entre Depts                          | Terminal de Planta           | `v2.8.0`            | ✅ En Producción |
| **RF-13** | Reporte de Merma y Sustitución de Saldo                     | Terminal de Planta           | `v2.7.0`            | ✅ En Producción |
| **RF-14** | Segundas para Venta de Viernes                              | Terminal / Dirección         | `v2.7.0`            | ✅ En Producción |
| **RF-15** | Rastreador de Lote para Supervisores                        | Terminal de Planta           | `v2.9.0`            | ✅ En Producción |
| **RF-16** | Línea de Tiempo de Proceso (Value Stream Map)               | Terminal de Planta           | `v2.9.0`            | ✅ En Producción |
| **RF-17** | Indicador Activo "AQUÍ ESTÁ EL LOTE"                        | Terminal de Planta           | `v2.9.0`            | ✅ En Producción |
| **RF-18** | Diferenciación Manufactura vs Calidad                       | Terminal / Config            | `v2.9.0`            | ✅ En Producción |
| **RF-19** | Controles de Avance y Retroceso de Lote                     | Terminal de Planta           | `v2.9.0`            | ✅ En Producción |
| **RF-20** | Reubicación Táctil en Línea de Tiempo                       | Terminal de Planta           | `v2.9.0`            | ✅ En Producción |
| **RF-21** | Liberación In-App de Filtro de Calidad                      | Terminal de Planta           | `v2.9.0`            | ✅ En Producción |
| **RF-22** | Rutas de Fabricación por Modelo de Sombrero                 | Configuración                | `v2.9.0`            | ✅ En Producción |
| **RF-23** | Reordenamiento de Secuencia (▲ / ▼)                         | Configuración                | `v2.9.0`            | ✅ En Producción |
| **RF-24** | Inserción y Quitado de Pasos en Rutas                       | Configuración                | `v2.9.0`            | ✅ En Producción |
| **RF-25** | Persistencia de Rutas en LocalStorage                       | Configuración                | `v2.9.0`            | ✅ En Producción |
| **RF-26** | Registro de Áreas de Control de Calidad (`C-XX`)            | Configuración                | `v2.9.0`            | ✅ En Producción |
| **RF-27** | Alta Dinámica de Departamentos (`D-XX`)                     | Configuración                | `v2.8.4`            | ✅ En Producción |
| **RF-28** | Asignación Multi-Operador a Estaciones                      | Configuración                | `v2.8.4`            | ✅ En Producción |
| **RF-29** | Padrón de Operadores de Planta                              | Configuración                | `v2.8.0`            | ✅ En Producción |
| **RF-30** | Delimitación Departamental por Supervisor                   | Terminal / Config            | `v2.8.0`            | ✅ En Producción |
| **RF-31** | Horario de Turno Informativo Configurable                   | Configuración                | `v2.8.4`            | ✅ En Producción |
| **RF-32** | Meta Semanal de Planta (4,250 pzas)                         | Configuración                | `v2.8.0`            | ✅ En Producción |
| **RF-33** | Matriz de Roles y Permisos RBAC                             | Configuración                | `v2.6.0`            | ✅ En Producción |
| **RF-34** | Ocultamiento Estricto de Módulos (Sin Candados)             | Navegación General           | `v2.8.3`            | ✅ En Producción |
| **RF-35** | Barra Lateral Plegable con Persistencia                     | Navegación General           | `v2.8.3`            | ✅ En Producción |
| **RF-36** | Desglose Matemático de OEE de Planta                        | Ingeniería                   | `v2.0.0`            | ✅ En Producción |
| **RF-37** | Gráficas de Avance Horario vs Takt Time                     | Ingeniería                   | `v2.10.0`           | ✅ En Producción |
| **RF-38** | Bitácora de Paros e Incidencias SMED                        | Ingeniería                   | `v2.10.0`           | ✅ En Producción |
| **RF-39** | Valorización Financiera en Tiempo Real                      | Dirección                    | `v2.0.0`            | ✅ En Producción |
| **RF-40** | Enlace y Vales de Entrega COMPAC                            | Dirección                    | `v2.5.0`            | ✅ En Producción |
| **RF-41** | Pantalla de Login Formal con Selector de Usuario            | Acceso / Login               | `v2.10.0`           | ✅ En Producción |
| **RF-42** | Cierre de Sesión y Conmutación Rápida                       | Barra Lateral / Login        | `v2.10.0`           | ✅ En Producción |
| **RF-43** | Monitor de Almacenes Intermedios & Lotes Listos             | Terminal de Planta           | `v2.10.0`           | ✅ En Producción |
| **RF-44** | Módulo Central de Almacenes & Hormas (`inventory`)          | Almacenes e Inventarios      | `v2.10.0`           | ✅ En Producción |
| **RF-45** | Módulo de Padrón de Operadores (`operators`)                | Padrón de Mano de Obra       | `v2.10.0`           | ✅ En Producción |
| **RF-46** | Consola Especializada de Ingeniería (`engineer`)            | Consola de Ingeniería        | `v2.10.0`           | ✅ En Producción |
| **RF-47** | Cabeceras de Módulo Fijas con Botones de Acción al Scroll   | Interfaz / Todos los Módulos | `v2.12.0`           | ✅ En Producción |
| **RF-48** | Estandarización Estricta de Modales (Cabecera y Pie Fijos)  | Modales / Interfaz           | `v2.12.0`           | ✅ En Producción |
| **RF-49** | CRUD Completo de Supervisores y Asignación Departamental    | Configuración / RBAC         | `v2.12.0`           | ✅ En Producción |
| **RF-50** | CRUD Completo de Operadores (Altas, Bajas y Modificaciones) | Operadores / Configuración   | `v2.12.0`           | ✅ En Producción |
| **RF-51** | Notificaciones Toast y Alertas de Éxito Estéticas Premium   | Notificaciones / UX          | `v2.12.0`           | ✅ En Producción |
| **RF-52** | Réplica Digital de Pizarra Física "1000 X M.T Prensas"      | Andon / Ingeniería           | `v2.13.0`           | ✅ En Producción |
| **RF-53** | Impresión Oficial de Tarjeta Viajera (PDF/Mica)             | Terminal / Almacén           | `v2.13.0`           | ✅ En Producción |
| **RF-54** | Ficha Técnica Visual con Fotografía Oficial de Modelo       | Terminal / Calidad           | `v2.13.0`           | ✅ En Producción |
| **RF-55** | Extracción Integral de Metadatos desde QR (Sin Input Manual)| Terminal de Supervisor       | `v2.14.0`           | ✅ En Producción |
| **RF-56** | Verificación Previa Obligatoria de Tarjeta Viajera (Mica)   | Terminal de Supervisor       | `v2.14.0`           | ✅ En Producción |
| **RF-57** | Depósito Automático en Almacén Siguiente por Ruta de Modelo | Terminal de Supervisor       | `v2.14.0`           | ✅ En Producción |
| **RF-58** | Restricción Departamental Estricta para Supervisores        | Terminal / Seguridad RBAC    | `v2.14.0`           | ✅ En Producción |
| **RF-59** | Mapa de Planta y Almacenes Intermedios Departamentales      | Terminal de Supervisor       | `v2.14.0`           | ✅ En Producción |
| **RF-60** | Trazabilidad de Mermas en Tránsito y Escáner Fullscreen     | Terminal de Supervisor       | `v2.14.0`           | ✅ En Producción |
| **RF-61** | Ergonomía Táctil Universal y Botones Grandes para Tabletas  | Interfaz / Todos los Módulos | `v2.14.0`           | ✅ En Producción |
| **RF-62** | CRUD Integral de Departamentos y Almacenes Intermedios      | Configuración de Planta      | `v2.15.0`           | ✅ En Producción |
| **RF-63** | Unificación de Catálogos de Hormas y Módulo General Almacén | Almacenes e Inventarios      | `v2.15.0`           | ✅ En Producción |
