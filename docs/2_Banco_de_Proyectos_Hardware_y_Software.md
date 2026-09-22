# 🏭 Uanify × Fábrica de Sombreros — Banco de Proyectos
## Documento Vivo de Ideas e Implementaciones Hardware/Software

> **Estado:** 🟡 En construcción — Pre-visita de planta  
> **Última actualización:** Septiembre 2026  
> **Próximo hito:** Visita a planta (Martes o Jueves — San Pancho, ~10:30-11:00 AM)  
> **Contacto cliente:** Amigo del equipo — Director / Área de Dirección  
> **Ingeniero clave:** Ingeniero de Producción (mero mero — definirá specs del Proyecto 1)

---

## 📌 Contexto Operativo (Capturado del Audio)

| Aspecto | Estado Actual |
|---|---|
| Tipo de empresa | Fábrica familiar de sombreros y accesorios (carteras, etc.) |
| Ubicación | San Pancho (aprox. 40-45 min desde Punta del Este) |
| Rol del contacto | Dirección — involucrado en producción, RRHH, ingeniería |
| Madurez digital | Baja — mayormente papel y Excel |
| Maquinaria | Mix de máquinas mecánicas/automáticas + puestos manuales operados por persona |
| Control actual de producción | Personas en cada puesto registran a mano piezas y tiempos |
| Visualización de KPIs | **Pizarrones físicos** en cada área de producción |
| Metodologías | Ya aplican algunas metodologías tipo lean/industrial (visión avanzada para su tamaño) |
| Apertura a tecnología | **Alta** — el director y el ingeniero ya están pidiendo software activamente |

---

## 🚦 Mapa de Prioridades

```
PRIORIDAD 1 (Entrada)    ██████████  Captura de KPIs de Producción (lo que pide el ingeniero)
PRIORIDAD 2 (Siguiente)  ████████░░  Control de Inventarios
PRIORIDAD 3 (Futuro)     ██████░░░░  Gestión de Pedidos B2B
PRIORIDAD 4 (Futuro)     █████░░░░░  Trazabilidad / Calidad
PRIORIDAD 5 (Futuro)     ████░░░░░░  RRHH / Nómina / Rendimiento por operario
```

---

---

# ✅ PROYECTO 1 — Sistema de Captura de KPIs de Producción (MES Ligero)
## `[PRIORIDAD ALTA — Lo que pide el ingeniero]`

### 🎯 Problema que resuelve

Actualmente cada puesto de producción tiene **una persona que anota a mano** cuántas piezas se procesan y cuánto tiempo tarda cada operación. Esta información:
- No es consistente (no siempre se hace)
- No es en tiempo real
- Termina en **pizarrones físicos** por área
- No está centralizada ni es analizable históricamente

**El ingeniero de producción quiere:** métricas de máquinas y puestos, tanto automáticos como manuales, en un sistema digital.

---

### 📐 Alcance Funcional

| Funcionalidad | Descripción |
|---|---|
| **Captura de producción** | Registrar piezas completadas por puesto / máquina |
| **Captura de tiempos** | Tiempo de ciclo por pieza o lote (inicio/fin de operación) |
| **KPIs por puesto** | Rendimiento actual vs. meta, piezas/hora, eficiencia |
| **Dashboard en tiempo real** | Vista de toda la planta para supervisores e ingeniería |
| **Pizarrón digital** | Reemplazar los pizarrones### 🔌 Variantes de Implementación (Evaluar en Visita)

> 💡 **Nota de Ingeniería de Planta (San Pancho):** En las estaciones de prensado térmico y hormado a vapor de sombreros, los operarios usan guantes de calor o tienen manos con restos de apresto/cola. Una pantalla táctil capacitiva común puede sufrir o dificultar el ritmo de trabajo. Presentamos 4 enfoques:

#### **Opción A — Tablet Industrial / Rugged por Puesto (Interacción rica)**
```
[Operario]  →  [Tablet Android con funda de uso rudo]  →  [App PWA / Local]  →  [Edge Gateway]  →  [Dashboard]
                  Botón "Iniciar Lote" / "Finalizar"
                  Captura de motivo de paro / defectos
```
- ✅ Permite seleccionar modelo de sombrero, talla, color y reportar causas de paro.
- ✅ Implementación rápida sin cableado mecánico.
- ⚠️ Requiere disciplina del operario; sensible a caídas o suciedad si no tiene protección IP adecuada.
- 💰 Costo hardware: ~$2,500–$4,000 MXN por puesto (tablet + soporte articulado + funda ruda).

---

#### **Opción B — Sensores IoT no Invasivos en Máquinas (100% Automático)**
```
[Máquina / Prensa]  →  [Sensor Inductivo / Final de Carrera / Óptico]  →  [Nodo ESP32 Industrial]  →  [Dashboard]
                       Detecta carrera del pistón o cierre de prensa
```
- ✅ Conteo infalible: no depende de que el operario recuerde presionar nada.
- ✅ Captura exacta de tiempos de ciclo y tiempos muertos entre prensadas.
- ⚠️ No registra por sí solo el motivo si la máquina se detiene (requiere complemento).
- 💰 Costo hardware: ~$800–$1,800 MXN por máquina (sensor + caja IP65 + ESP32).

---

#### **Opción C — Cajas de Pulsadores Industriales / Pedales (Ergonomía Poka-Yoke) ⭐ RECOMENDADA PARA PRENSAS**
```
[Operario en Prensa]  →  [Pedal de pie o Botonera Industrial IP65]  →  [Nodo Microcontrolador]  →  [Dashboard]
                         (Verde = Pieza OK | Rojo = Defecto | Amarillo = Asistencia)
```
- ✅ **A prueba de planta:** Operable con guantes térmicos, manos húmedas o con pedal al cerrar prensa.
- ✅ Costo ultra bajo, mantenimiento cero, prácticamente indestructible.
- ✅ Elimina distracciones: el operario no quita la vista del proceso de hormado.
- 💰 Costo hardware: ~$600–$1,200 MXN por estación.

---

#### **Opción D — Enfoque Híbrido Uanify (El Estándar Profesional)**
```
┌────────────────────────────────────────────────────────────────────────┐
│ Prensas y Maquinaria Automática: Sensores IoT o Pedales (Conteo exacto)│
│ Puestos Manuales (Adorno/Ribete): Botoneras o Tablets compartidas     │
│ En Planta (Piso): Pantallas TV / Monitores (Pizarrón Digital Andon)    │
│ Gateway Local: Mini PC / Raspberry Pi (Edge Computing Offline-First)   │
└────────────────────────────────────────────────────────────────────────┘
```
- ✅ Cubre toda la diversidad de estaciones (desde prensas calientes hasta mesas de costura y empaque).
- ✅ Funciona aunque se corte el internet en la nave industrial.
- ✅ Proporciona visibilidad instantánea en piso para los operarios y en móvil para dirección.

---

### 🖥️ Componentes de Software y Arquitectura Resiliente

| Componente | Tecnología sugerida | Rol Crítico |
|---|---|---|
| **Edge Gateway Local** | Mini PC / Raspberry Pi (Docker, Mosquitto MQTT, SQLite/PostgreSQL) | **Tolerancia a fallas:** Captura datos localmente en la nave. Si el internet cae, nada se pierde; sincroniza a la nube en reconexión. |
| **App de Registro / PWA** | Vue.js / React + Tailwind (Modo Alto Contraste) | Interfaz con botones gigantes para operarios y supervisores. |
| **Backend en la Nube** | Node.js / FastAPI + PostgreSQL / TimescaleDB | Procesamiento analítico, reportes históricos, cálculo de OEE. |
| **Tablero Andon Digital** | Pantalla Web TV (Full Screen Kiosk) | Sustituye los pizarrones de tiza/marcador: muestra meta por hora, piezas reales y color (verde/rojo). |
| **Consola de Ingeniería** | Web Dashboard Responsivo | Para que el Ingeniero de Producción configure metas por modelo, turnos y balanceo de líneas. |

---

| Componente | Aplicación | Costo Aprox. |
|---|---|---|
| Mini PC Industrial / Gateway | Servidor local maestro de planta (Edge broker) | $4,500–$7,500 MXN (1 por planta) |
| Cajas de pulsadores / Pedales | Prensas de vapor, troqueles y puestos manuales | $600–$1,200 MXN c/u |
| Sensores inductivos / mecánicos | Prensas neumáticas e hidráulicas | $350–$900 MXN c/u |
| Nodos de comunicación (ESP32/Wired) | Conexión de sensores/pulsadores a red local | $300–$600 MXN c/u |
| Pantallas Smart TV (43"–50") | Reemplazo de pizarrones por nave (Tablero Andon) | $5,000–$7,500 MXN c/u |
| Cableado Ethernet / AP Industrial | Cobertura WiFi/red en nave de producción | $3,000–$6,000 MXN general |

---

### 🎩 Mapeo Preliminar del Proceso Sombrerero (Para hablar el mismo idioma en San Pancho)

Durante la visita, el Ingeniero de Producción evaluará si realmente entendemos su piso. En San Pancho, las etapas estándar de fabricación de sombrero y accesorios son:

```
[1. MATERIA PRIMA]        → Fieltro de lana/pelo, trenza de palma, lona o papel shantung.
                               ↓
[2. APRESTO Y ENGOMADO]   → Aplicación de químicos/resinas para dar rigidez al material.
                               ↓
[3. HORMADO / PRENSADO]   → ⚠️ ETAPA CRÍTICA: Prensas calientes con vapor y moldes metálicos.
                               ↓
[4. CORTE Y PLANCHADO]    → Corte de sobra de ala (troquelado) y planchado de falda.
                               ↓
[5. EMBELLECIMIENTO]      → Ribeteado de ala, costura de tafilete (sudorera interna de piel/tela).
                               ↓
[6. ACABADO Y TOQUILLA]   → Colocación de toquilla exterior, forro interno, herrajes y plancha final.
                               ↓
[7. INSPECCIÓN Y EMPAQUE] → Control de calidad visual, etiquetado y encajonado.
```

> **En Accesorios (Carteras/Cintos):** Despiece/corte de piel (suajadora) → rebajado → pegado/ensamble → costura/pespunte → herrajes y pulido de cantos.

---

### ❓ Preguntas Clave para el Ingeniero (Visita de Planta)

- [ ] ¿En qué etapa del proceso se les hace el mayor cuello de botella (prensado, costura de tafilete, acabado)?
- [ ] ¿Cómo manejan el cambio de moldes/hormas en las prensas? ¿Cuánto tiempo muerto les toma?
- [ ] ¿Cuántas estaciones de trabajo activas tienen por turno?
- [ ] ¿Cuántas máquinas son mecánicas/automáticas vs. puestos 100% artesanales/manuales?
- [ ] ¿Qué KPIs específicos reporta hoy el Ingeniero a Dirección (OEE, piezas/hora, paros no programados, % merma)?
- [ ] ¿Qué información anotan hoy a mano en los pizarrones físicos? (¿Podemos tomarle foto a los pizarrones actuales?)
- [ ] ¿Tienen WiFi o conectividad estable en el piso de la nave o predomina estructura de lámina sin señal?
- [ ] ¿Cuál es la meta estándar de piezas por operario/hora según su balanceo de línea?

---

### ⏱️ Guía Táctica de la Visita (San Pancho — 11:00 AM a 2:00 PM)

| Horario | Actividad | Objetivo Uanify |
|---|---|---|
| **11:00 – 11:20** | Café de bienvenida con Edmundo y el Ingeniero | **Rapport y Alianza:** Validar que venimos a potenciar el trabajo del Ingeniero, no a auditarlo ni juzgarlo. |
| **11:20 – 12:30** | Recorrido guiado de inicio a fin del proceso en piso | **Levantamiento técnico:** Tomar fotos de máquinas, prensas, conexiones eléctricas, pizarrones actuales y anotar flujos de piezas. |
| **12:30 – 01:15** | Mesa de trabajo en oficina / sala de juntas | **Aterrizar requerimientos:** Revisar con el Ingeniero el formato actual que usan para registrar y las fallas recurrentes. |
| **01:15 – 01:45** | Validación de visión con Edmundo (Dirección) | **Alineación de valor:** Contrastar lo visto en piso con las metas de negocio (crecimiento, reducción de mermas, pedidos a tiempo). |
| **01:45 – 02:00** | Cierre y calendario de entrega de propuesta | **Compromiso formal:** Agendar fecha exacta para presentar la propuesta técnica/económica formal de Uanify. |

### 📅 Estimación de Tiempos de Implementación (Fase 1)

| Etapa | Duración | Entregables Uanify |
|---|---|---|
| **Semana 1** | 5 días | Levantamiento en sitio, especificación de señales de máquinas y wireframes finales. |
| **Semana 2–3** | 10 días | Desarrollo de Edge Broker local, API de captura, Tablero Andon TV y simulador/pedal. |
| **Semana 4** | 5 días | Pruebas de campo en piloto (1 prensa + 1 estación manual), validación con operarios. |
| **Semana 5–6** | 10 días | Roll-out general a las 6 estaciones de la nave, instalación de pantallas TV y capacitación. |

---

## 📚 REGLAS DE NEGOCIO INDUSTRIALES QUE DEBES CONOCER PARA LA VISITA
*(Conceptos esenciales para entender cómo opera la fábrica y cómo estructurar el software)*

### 1. La "Receta" del Sombrero (BOM — Bill of Materials)
En manufactura, cada producto terminado tiene una lista de ingredientes fija llamada BOM. En esta fábrica, para hacer **1 Sombrero Terminado estándar**, se consumen:
* **1 Campana de lana o pelo** (materia prima principal, importada o nacional).
* **0.03 a 0.05 litros de apresto / engomado** (químico que da rigidez al fieltro).
* **62 a 65 cm de Tafilete / Badana** (tira de cuero o tela según la talla del sombrero).
* **1.10 a 1.30 metros de cinta de toquilla** (adorno perimetral exterior).
* **1 Forro interior** (satín bordado o impreso con la marca).
* **1 Caja individual o colectiva** (empaque para flete mayorista).

> 💡 **Por qué esto te importa como consultor:**  
> Cuando el Proyecto 1 (MES) registra que una prensa terminó 100 sombreros, el software puede **descontar en automático** 100 campanas y 63 metros de tafilete en el Proyecto 2 (Inventarios). Eso es lo que impresiona a un director.

---

### 2. Tallas y "Curvas de Producción" (El lenguaje de los pedidos)
Los sombreros no se producen en cantidades al azar. Se miden en **centímetros de circunferencia craneal**:
* Tallas comunes: **55 (6 7/8), 56 (7), 57 (7 1/8), 58 (7 1/4), 59 (7 3/8), 60 (7 1/2)**.
* **La Curva Mayorista:** Cuando una tienda en Guadalajara, Monterrey o Texas pide un lote de 120 sombreros, pide una "curva" estándar:
  * *10% talla 55 | 25% talla 56 | 35% talla 57 (la más vendida en México) | 20% talla 58 | 10% talla 59-60*.
* **Regla de Planta:** Si una estación produce puras tallas 55 porque es más fácil hormarlas, se genera sobrestock que no se vende. El software debe permitir al Ingeniero fijar la **meta por corrida y talla**.

---

### 3. Clasificación de Calidad: Primeras, Segundas y Mermas
* **Primera Calidad (A-Grade):** Producto perfecto. Se va a empaque para cliente mayorista al 100% de su precio comercial.
* **Segunda Calidad (B-Grade):** Sombrero con un defecto cosmético leve (una ligera mancha de calor, ala con 2mm de desnivel, costura no uniforme). **No se desecha:** se aparta y se vende a precio de remate o liquidación.
* **Merma / Scrap (C-Grade):** Campana rota por la prensa, quemada por vapor descalibrado o fieltro picado. Es pérdida directa de materia prima.
* **Impacto en el software:** El Ingeniero necesita saber con exactitud si el problema de calidad es por **falla de máquina** (vapor/prensa) o por **falla de operario** (mala colocación en la horma).

---

### 4. El "Vale de Destajo" (El corazón laboral de la planta)
* Los operarios en talleres y fábricas de San Pancho cobran por **Destajo** (cuota monetaria por pieza procesada).
* **El dolor actual:** Al final del turno, el supervisor pasa con una libreta y firma un "vale de papel" con las piezas que dice haber hecho cada persona. Hay discusiones semanales: *"Oye, yo hice 130 y me apuntaste 115"*.
* **La solución Uanify:** Cada pulsación del pedal o botonera suma a la cuenta del operario asignado. Al terminar el turno, el sistema imprime o muestra en pantalla el reporte exacto de nómina por destajo. Cero discusiones y transparencia absoluta.

---

### 🎯 Problema que resuelve
Sin visibilidad en tiempo real de materiales disponibles, la planta puede para por faltante sin haberlo visto venir.

### Ideas de implementación
- **App web / tablet** para registrar entradas y salidas de almacén
- **Códigos QR o códigos de barras** en cada material / rollo / caja
- **Alertas automáticas** cuando un material llega al punto de reorden
- **Integración con Proyecto 1:** Si la producción consume X unidades, el inventario se descuenta automáticamente

### Preguntas pendientes
- [ ] ¿Cómo reciben la materia prima actualmente? ¿Hay persona de almacén?
- [ ] ¿Cuántos SKUs de materiales manejan?
- [ ] ¿Tienen algún sistema aunque sea básico de inventario?

---

# 💡 PROYECTO 3 — Portal de Pedidos B2B
## `[PRIORIDAD MEDIA-BAJA — Futuro próximo]`

### 🎯 Problema que resuelve
Pedidos tomados por WhatsApp, teléfono o email = errores, pedidos perdidos, sin trazabilidad.

### Ideas de implementación
- **Portal web para distribuidores / clientes mayoristas** — hacen su pedido directamente
- **Catálogo digital** con modelos, colores, tallas disponibles según inventario real
- **Status de pedido en tiempo real** — el cliente ve en qué etapa está su sombrero
- **Reglas de negocio:** precios por volumen, condiciones de pago, mínimos de pedido
- **Integración con Proyecto 1:** El pedido entra al portal y genera automáticamente la orden de producción

### Preguntas pendientes
- [ ] ¿Cómo reciben pedidos actualmente?
- [ ] ¿Tienen clientes fijos / distribuidores recurrentes?
- [ ] ¿Venden online? ¿Planean hacerlo?

---

# 💡 PROYECTO 4 — Trazabilidad y Control de Calidad
## `[PRIORIDAD MEDIA-BAJA — Futuro]`

### 🎯 Problema que resuelve
Sin trazabilidad, no saben cuánta merma generan ni en qué etapa del proceso se generan los defectos.

### Ideas de implementación
- **Registro de defectos por etapa** — el operario o supervisor marca si una pieza salió defectuosa y el tipo de defecto
- **Trazabilidad de lote** — desde materia prima hasta producto terminado
- **QR/código en cada pieza o lote** — escaneado en cada etapa para confirmar el paso
- **Dashboard de calidad** — % de merma por área, por operario, por máquina, por día
- **Integración con Proyecto 1:** La merma se registra en el mismo sistema que la producción

---

# 💡 PROYECTO 5 — Dashboard Ejecutivo / Business Intelligence
## `[PRIORIDAD BAJA — Consolidación]`

### 🎯 Problema que resuelve
El director no tiene visibilidad en tiempo real del estado de la empresa — toma decisiones con intuición o con datos del día anterior.

### Ideas de implementación
- **Dashboard ejecutivo** con KPIs clave: producción del día, pedidos en proceso, inventario crítico, eficiencia de planta
- **Acceso desde celular** — el director ve su planta desde donde esté
- **Alertas inteligentes** — "La prensa 3 lleva 2 horas sin registrar actividad"
- **Comparativos históricos** — esta semana vs. semana pasada vs. meta del mes
- **Integración de todos los proyectos anteriores** — este es el tablero que une todo

---

# 💡 PROYECTO 6 — Rendimiento por Operario / Módulo de RRHH Operativo
## `[PRIORIDAD BAJA — Futuro]`

### 🎯 Problema que resuelve
Sin datos individuales, no es posible detectar quién necesita capacitación, quién es el mejor operario, ni cómo incentivar el rendimiento.

### Ideas de implementación
- **Asociar registros del Proyecto 1 a un operario específico** (login simple con QR o PIN)
- **Ranking de rendimiento** — piezas/hora por operario, calidad de su trabajo
- **Sistema de bonos por desempeño** — automatizar el cálculo de incentivos
- **Onboarding digital** — guías en tablet para que nuevos operarios aprendan su puesto

---

---

## 📊 Matriz de Prioridad — Impacto vs. Esfuerzo

```
IMPACTO
  │
A │  [P1 Producción]            ← Quick Win + Lo que piden
L │
T │                [P5 BI Dashboard]     ← Depende de P1-P4
O │
  │
M │     [P4 Trazabilidad]   [P2 Inventarios]
E │
D │
I │           [P3 Pedidos B2B]
O │
  │
B │                    [P6 RRHH]
A │
J │
O └────────────────────────────────────────────
       BAJO          MEDIO          ALTO
                   ESFUERZO
```

---

## 🔗 Visión de Integración — Cómo se Conectan los Proyectos

```
[P3 Pedidos B2B]  →  Genera Orden de Producción
                              ↓
[P2 Inventarios]  →  Valida disponibilidad de materiales
                              ↓
[P1 Control MES]  →  Ejecuta y registra la producción en tiempo real
                              ↓
[P4 Trazabilidad] →  Confirma calidad y cierra el lote
                              ↓
[P5 Dashboard]    →  El director ve todo en un solo lugar
                              ↑
[P6 RRHH]         →  Añade capa de rendimiento por persona
```

> Cada proyecto tiene valor por sí solo. Juntos forman una plataforma de manufactura integral.

---

## 📝 Notas de la Visita de Planta
*[Sección para llenar durante/después de la visita]*

**Fecha de visita:** _________________  
**Asistentes Uanify:** _________________  
**Asistentes cliente:** _________________  

### Observaciones de planta:
- 

### Datos capturados:
- Número de puestos de producción: ___
- Número de máquinas automáticas: ___
- Número de puestos manuales: ___
- Tipos de máquinas: ___
- Conectividad WiFi en planta: ☐ Sí / ☐ No / ☐ Parcial
- Dispositivos existentes en planta: ___
- Sistemas existentes (ERP/Excel/papel): ___

### Decisiones tomadas:
- 

---

*Documento vivo — Uanify / Actualizar con cada sesión y visita*
