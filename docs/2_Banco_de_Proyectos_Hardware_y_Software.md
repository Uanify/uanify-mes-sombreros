# 🤠 Uanify × Tombstone Hats — Banco de Proyectos de Planta
## Documento Vivo de Soluciones Hardware / Software (Industria 4.0)

> **Cliente:** Tombstone Hats ([tombstone.mx](https://tombstone.mx/)) — San Francisco del Rincón, Gto.  
> **Estado:** 🟡 Listo para validación en visita de planta  
> **Última actualización:** Septiembre 2026  
> **Contacto Dirección:** Edmundo ("Mundo") | **Contacto Planta:** Ingeniero de Producción  
> **Prototipo Live:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)

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

# ✅ PROYECTO 1 — Sistema MES de Avances por Fracciones, Lotes & Tarjetas Viajeras QR
## `[PRIORIDAD ALTA — Requerimiento Central Validado en Visita]`

### 🎯 Problema que resuelve (Confirmado en Planta)
Actualmente el flujo de producción de Tombstone Hats opera con:
- **Tarjetas Viajeras de papel** que se llenan a mano con pluma en cada estación.
- **Lotes madre de 60 piezas** que al pasar la rampa hacia el almacén de alineado/hidráulico se dividen físicamente en **4 sublotes de 15 piezas** mediante un archivo de Excel y cambio manual de tarjetas.
- **10 almacenes intermedios (WIP)** donde no se tiene visibilidad en tiempo real de cuántas piezas hay en espera.
- **Pizarrones físicos** que se actualizan de forma inconsistente.

**El Ingeniero de Producción (Carlos) definió el requerimiento exacto:**
> *"Nosotros estamos pensando con tarjetas de producción por lote... Ahorita sería la parte de irnos por lotes, no traemos tanto la parte de pieza por pieza. Módulos físicos en puntos estratégicos con escáner de QR o barras para registrar los avances de cada fracción y saber qué tenemos en cada almacén."*

---

### 📐 Alcance Funcional Validado

| Módulo Funcional | Descripción Operativa en Planta Tombstone |
|---|---|
| **Generador de Tarjetas Viajeras con QR** | Sustituye el llenado a mano. Genera la tarjeta del lote madre (60 pzas) con modelo, talla, horma y código QR único. |
| **Fraccionador de Lotes en Rampa (Alineado)** | Al cruzar la rampa de naves, un solo escaneo divide automáticamente el lote de 60 pzas en 4 tarjetas hijas de 15 pzas (`351-01`, `351-02`, etc.). |
| **Avance de Fracción por Almacén WIP** | El supervisor o auxiliar escanea con pistola QR el lote al terminar una fracción y el sistema actualiza de inmediato el stock en el almacén siguiente. |
| **Asignación de Operarios por Fracción** | Vincula el lote/sublote al número de empleado que lo procesó para control de calidad y posterior cálculo de destajo. |
| **Tablero Andon TV en Nave Central** | Pantalla de 50" que muestra el avance hora por hora, semáforos por estación y acumulación de cuellos de botella. |
| **Registro de Segundas (Venta de Viernes)** | Clasifica piezas con defectos estéticos leves como "Producto Regular / Segunda" para venta de saldo los viernes. |

---

### 🔌 Arquitectura de Hardware de Planta (Adaptada a Restricciones de Tombstone)

> ⚠️ **Restricción Ambiental Clave:** En el área de prensas y recorte de falda hay **alto nivel de polvo**. Además, los operarios tienen **prohibido el uso de celular**. Por ende, la captura es a través de terminales de supervisor y escáneres específicos.

#### **Esquema de Hardware Recomendado (Módulos Físicos Estratégicos):**
```
┌────────────────────────────────────────────────────────────────────────┐
│ Puntos de Almacén WIP: Pistolas lectoras de QR / Barras industriales  │
│                        conectadas por USB o Bluetooth                  │
│ Terminales de Supervisor: Tablets de uso rudo (Carcasa IP65 antipolvo) │
│                        en montajes articulados en 4 puntos de planta   │
│ Nave Central: Smart TV 50" conectada a red para Tablero Andon         │
│ Servidor / Edge Gateway: Mini PC en red local LAN (con repetidores     │
│                          existentes en planta, tolerancia a cortes)    │
└────────────────────────────────────────────────────────────────────────┘
```
- ✅ **Cero riesgo de polvo:** Lectores sellados y tablets con fundas industriales.
- ✅ **Cero fricción con operarios:** No usan celulares personales; el supervisor o auxiliar valida el lote en 1 segundo con la pistola QR.
- ✅ **Presupuesto eficiente:** No se compran 50 tablets; solo se instalan **4 a 6 estaciones de escaneo estratégico**.

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

# 💡 PROYECTO 2 — Control de Subensambles (Tafiletes por Talla) & Matriz de Materiales
## `[PRIORIDAD MEDIA-ALTA — Fase 2]`

### 🎯 Problema que resuelve (Confirmado en Planta)
1. **Desabasto en Adorno 1:** Los tafiletes se elaboran en un subensamble paralelo. Actualmente los supervisores se comunican de forma verbal y a gritos: *"¿Tienes tafilete talla 57? Sí, 150"*. Si no hay tafiletes listos de la talla del lote de sombreros que entra a la mesa, la línea se detiene.
2. **Cambio Masivo de Materiales:** Si cambia el proveedor de una laca o pintura (ej. pintura Taiwan 1125), el Ingeniero tiene que editar manualmente ficha por ficha.

### 📐 Solución Uanify:
* **Monitor de Stock de Tafiletes por Talla en Pantalla:** Semáforo en vivo (Verde = Abastecido, Amarillo = En Límite, Rojo = Crítico) para tallas 55 a 60 cm.
* **Matriz Maestra de Materiales:** Cambio masivo de insumos en 1 solo clic aplicado a todos los productos que consumen ese material.
* **Trazabilidad de Químicos y Rollos de Telar:** Registro de entrada desde factura de compras y descuento automático por lote producido.

---

# 💡 PROYECTO 3 — Integración CONTPAQi (COMPAC) & Vales de Entrega Mayorista
## `[PRIORIDAD ALTA — Fase 2/3]`

### 🎯 Problema que resuelve (Confirmado en Planta)
Actualmente, cuando el cliente mayorista llega con su camioneta:
1. Se genera un **vale de salida en papel**.
2. Ese vale se descuenta manualmente en un archivo de Excel de órdenes de producción.
3. El papel viaja a oficinas donde una persona vuelve a capturar todo en **COMPAC (CONTPAQi)** para emitir la factura.

### 📐 Solución Uanify:
* **Vale de Entrega Digital:** El almacén genera el vale de salida escaneando los lotes entregados al camión.
* **Enlace con COMPAC:** Sincronización mediante la API o base de datos de CONTPAQi (en coordinación con la ingeniera de soporte externa de COMPAC) para timbrar la factura y descontar inventarios contables sin recaptura.

---

# 💡 PROYECTO 4 — Fichas Técnicas & Costeo de Accesorios (Carteras, Cintos, Horquillas)
## `[PRIORIDAD MEDIA-BAJA — Fase 3]`

### 🎯 Problema que resuelve (Confirmado en Planta)
El 70% de la producción de Tombstone son sombreros y texanas. El 30% restante son accesorios (carteras, cintos, mariconeras, bolsitas, horquillas). Los ingenieros confirmaron que aquí no se requiere un flujo complejo en piso, sino:
* **Fichas Técnicas Digitales:** Catálogo visual con imágenes, medidas, herrajes y desglose de materiales.
* **Ficha de Costeo Automático:** Cálculo del costo de producción según los insumos asignados en la ficha.

---

# 💡 PROYECTO 5 — Control de Calidad, Reparaciones & Registro de Segundas (Viernes)
## `[INTEGRADO EN FASE 1 Y 2]`

### 🎯 Problema que resuelve (Confirmado en Planta)
En Tombstone existen **4 puntos de inspección de calidad**. Si una pieza sale defectuosa:
* **Si tiene arreglo:** Se regresa a la fracción previa (ej. volver a aplicar pintura o planchar falda).
* **Si es defecto cosmético menor:** Se clasifica como **"Producto Regular / Segunda"**. Se aparta en el almacén de saldos y **los días viernes se vende en lote a clientes mayoristas**.
* **Si es daño destructivo:** Se manda como merma y se repone la pieza para que el lote de 60 salga completo.

### 📐 Solución Uanify:
* Registro digital de motivos de defecto por operario y máquina.
* Inventario acumulado de "Segundas" en tiempo real para agilizar la venta de remate de los viernes.

---

# 💡 PROYECTO 6 — Productividad por Operador & Nómina de Destajo Digital
## `[EVOLUCIÓN FUTURA — Fase 3]`

### 🎯 Problema que resuelve (Confirmado en Planta)
Los operarios cobran por **destajo** (por pieza terminada). Actualmente los supervisores anotan a mano en tarjetas o libretas lo que hace cada persona, provocando disputas semanales de sueldos.
* **Solución Uanify:** Al escanear el lote o sublote con la tarjeta viajera, se asocia el número de empleado del operario. El sistema calcula en automático el importe a pagar por destajo por turno y semana, eliminando papel y discusiones.
* **Impacto:** Transparencia laboral, auditoría automática de piezas producidas y pago justo basado en datos reales del sistema.

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
