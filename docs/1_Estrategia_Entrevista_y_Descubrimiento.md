# 🤠 Uanify × Tombstone Hats (San Francisco del Rincón)
## Estrategia de Descubrimiento y Levantamiento de Requerimientos de Planta

> **Rol:** Socio técnico & Consultor Senior — Uanify  
> **Fecha:** Septiembre 2026  
> **Cliente:** Tombstone Hats ([tombstone.mx](https://tombstone.mx/)) — Planta Matriz San Francisco del Rincón, Gto.  
> **Contacto Dirección:** Edmundo ("Mundo") | **Contacto Planta:** Ingeniero de Producción  
> **Objetivo:** Identificar cuellos de botella reales → Diseñar propuesta técnica y comercial irresistible (MES, IoT, Inventarios)

---

## 🎯 Marco Estratégico General

Antes de entrar a cualquier reunión, debemos operar con la mentalidad de un **médico que diagnostica, no de un vendedor que presenta**. El cliente debe sentir que lo entendemos mejor de lo que ellos se entienden a sí mismos.

### Principios de la Sesión de Descubrimiento

| Principio | Aplicación práctica |
|---|---|
| **Pain-first, solution-last** | No mencionamos tecnología en los primeros 60 min. Solo escuchamos y documentamos. |
| **ROI como idioma nativo** | Cada dolor debe traducirse a dinero: tiempo perdido × costo/hora, defectos × costo unitario, retrasos × penalizaciones. |
| **Visión modular, propuesta integral** | Exploramos todo, pero proponemos por fases para reducir fricción de entrada. |
| **Elevar al interlocutor** | Hacemos que el director se vea como un visionario ante su propia junta al adoptar nuestra solución. |

---

## 🎓 CAPÍTULO CERO: Lo que DEBES Saber del Negocio Sombrerero en San Pancho
*(Guía de supervivencia industrial para consultores de software)*

San Francisco del Rincón ("San Pancho"), Guanajuato, es la **Capital Mundial del Sombrero**: produce 8 de cada 10 sombreros en México y exporta millones a EE.UU. (Texas, California, mercado western/vaquero). Para hablar con Edmundo y el Ingeniero como un par, necesitas dominar estas 5 dimensiones del negocio:

### 1. Anatomía y Vocabulario Técnico del Sombrero
No le digas "el gorro" ni "la parte de adentro". Usa estos términos exactos:
* **Campana (Cone / Hood):** Es la materia prima en bruto (forma de campana cónica sin planchar). De ahí nace todo.
* **Copa (Crown):** La parte superior que cubre la cabeza. Se moldea con calor y vapor sobre una horma metálica.
* **Falda o Ala (Brim):** El borde circular. Se corta con una cuchilla circular y luego se plancha o riza.
* **Horma / Molde:** Estructura de aluminio o madera que le da la forma (ej. *Fedora, Texana Cowboy, Pachuco, Cordobés*).
* **Tafilete o Badana:** La banda interior (de cuero de res, cerdo o tela) que hace contacto con la frente. Es lo que define el confort y la talla (tallas 54 a 61 cm de circunferencia).
* **Toquilla:** El cinturón o adorno decorativo exterior (cinta de tela, cuero trenzado o hebilla vaquera).
* **Forro (Lining):** La tela de satín o seda interior con el logo estampado de la fábrica o marca.

### 2. Tipos de Materiales y Calidades ("Las X")
* **Fieltro de Lana:** El más común, térmico, accesible. Se usa en otoño/invierno.
* **Pelo de Conejo / Liebre / Castor:** Gama premium y alta gama vaquera. Suave, repelente al agua.
* **¿Qué significan las "X"? (2X, 4X, 10X, 100X):** Representa el porcentaje de pureza de pelo fino vs. lana común. Un sombrero 4X es gama comercial media; un 20X o 100X es de lujo y vale miles de pesos.
* **Palma / Paja Shantung / Papel Arroz:** Sombreros de primavera/verano (ligeros, frescos).

### 3. Dinámica Comercial: ¿Cómo Gana Dinero Esta Fábrica?
* **Venta Mayorista B2B (80% del volumen):** Venden lotes de 100 a 2,000 sombreros a distribuidores, tiendas vaqueras y cadenas en EE.UU. o México. El precio promedio mayoreo oscila entre $250 y $800 MXN por pieza (en tienda se revende al triple: $900 a $2,500 MXN).
* **Fabricación por Lotes / Corridas:** Una planta no fabrica sombreros uno por uno. Fabrican "corridas" de un solo modelo, color y horma (ej. *Lote 405: 300 piezas Fedora Negro Lana 4X, tallas 56 a 60*).
* **El Peligro de las "Segundas" (Defectuosos):** Un sombrero con una quemada de vapor, una costura de tafilete jalada o una mancha de pegamento no se puede tirar, pero se degrada a "Segunda" y se tiene que rematar al 50% del costo en tianguis o saldos, comiéndose el margen del lote.

### 4. La Regla de Oro Laboral: "El Destajo" vs. Sueldo Fijo
* En San Pancho, casi todos los operarios en mesas (costureras de tafilete, adornadoras) cobran por **Destajo** (pago por pieza completada), no por quincena fija.
* **Implicación crítica para Uanify:**
  * Si el conteo en papel se equivoca, el operario siente que le están robando su sueldo del día.
  * **Argumento de venta de Uanify:** Nuestro sistema con pedal o pulsador le da transparencia total al operario: *"Hoy llevas 120 piezas = tu destajo de hoy está asegurado sin que nadie te quite una sola pieza en la libreta"*. Esto convierte a los operarios en aliados de la adopción del software.

### 5. Métricas Lean Manufacturing que el Ingeniero Vive a Diario
* **Takt Time (Ritmo de la planta):** El tiempo que debe tardar en salir un sombrero terminado para cumplir la meta del día. (Ejemplo: si la jornada es de 8 horas = 28,800 segundos, y la meta son 700 sombreros, el Takt Time son ~41 segundos por sombrero).
* **Cuello de Botella:** La máquina o puesto más lento que frena a todos los demás. En sombreros suele ser el **Hormado de Prensas de Vapor** o la **Costura del Tafilete**.
* **SMED (Single Minute Exchange of Die):** El tiempo que tarda el operario en cambiar el molde de aluminio caliente de la prensa para empezar a hacer otro modelo. Si tardan 30 minutos cambiando moldes con la máquina fría, la planta pierde dinero.
* **OEE (Overall Equipment Effectiveness):** La métrica reina del ingeniero: Disponibilidad × Eficiencia × Calidad. Si el OEE supera el 80%, la planta es eficiente; si está abajo del 65%, hay fugas graves de dinero.

---

### 1.1 Investigación de la Empresa (2-4 horas antes)

**Fuentes a revisar:**
- Sitio web, redes sociales, LinkedIn de directivos clave
- Directorio DUNS / IMSS si aplica (tamaño de planta, nómina estimada)
- Reseñas en Google Maps de su punto de venta o distribución
- Proveedores y clientes que mencionan públicamente (redes B2B)
- Patentes o marcas registradas en el IMPI

**Preguntas que debes poder responder ANTES de entrar:**
- [ ] ¿Cuántos trabajadores tiene la planta?
- [ ] ¿Venden directo, a través de distribuidores, o ambos?
- [ ] ¿Tienen presencia online / e-commerce?
- [ ] ¿Han recibido inversión o son empresa familiar?
- [ ] ¿Cuántos SKUs / modelos de sombrero producen aproximadamente?

### 1.2 Hipótesis de Dolor Iniciales (Sector Manufacturero Textil/Artesanal)

Llega con estas hipótesis y valídalas o descártalas durante la reunión:

| Hipótesis | Señal de validación |
|---|---|
| **Control de producción manual o en Excel** | Mencionan "nos fijamos en el piso", "mi maestro sabe cuánto se produce" |
| **Inventario de materia prima desconocido en tiempo real** | "A veces se para la línea porque nos quedamos sin X material" |
| **Pedidos B2B sin trazabilidad** | "Los clientes llaman para saber el status de su pedido" |
| **Merma y defectos sin medición sistemática** | "Sabemos que hay merma pero no sabemos exactamente cuánta" |
| **Cuellos de botella en procesos específicos** | "Aquí siempre se acumula el trabajo / aquí siempre esperamos" |
| **Onboarding lento de operarios** | "Se tarda mucho en aprender el oficio" |
| **Falta de visibilidad para dirección** | "El director no sabe qué pasa en piso en tiempo real" |

---

## 🎤 FASE 2: Estructura de la Sesión de Descubrimiento

### Agenda Recomendada (90 minutos)

```
[00:00 - 00:10]  Apertura y encuadre
[00:10 - 00:40]  Entendimiento del negocio y operación actual
[00:40 - 01:05]  Exploración de dolores y fricciones
[01:05 - 01:20]  Validación de prioridades y visión futura
[01:20 - 01:30]  Cierre y acuerdos de próximos pasos
```

---

### BLOQUE 1 — Apertura y Encuadre (10 min)

**Objetivo:** Establecer confianza, posicionarnos como socios, no proveedores.

**Script de apertura sugerido:**

> *"Muchas gracias por su tiempo. Antes de hablar de cualquier solución, lo que nos interesa hoy es entender a fondo su operación. Hemos trabajado con empresas manufactureras y cada planta tiene su propia lógica. Queremos escucharlos primero. Al final de esta sesión, si encontramos que podemos generar valor real, lo vamos a mostrar con números. Si no lo hay, también se los vamos a decir."*

Esto demuestra honestidad y confianza técnica — reduce la guardia del interlocutor.

---

### BLOQUE 2 — Entendimiento del Negocio (30 min)

#### 2A. Visión General del Negocio

| # | Pregunta | Lo que realmente estás buscando |
|---|---|---|
| 1 | ¿Cuánto tiempo llevan en operación? ¿Cómo ha evolucionado la empresa en los últimos 3-5 años? | Madurez, apertura al cambio, historia de inversión |
| 2 | ¿Cuántas personas trabajan en planta vs. administración? | Tamaño real de la operación |
| 3 | ¿Cuál es su capacidad instalada actual? ¿Están operando al 100%? | Headroom de crecimiento y urgencia |
| 4 | ¿Cuáles son sus principales líneas de producto o colecciones? | Complejidad de SKUs |
| 5 | ¿Cuál es su mix de ventas: directa, distribuidores, exportación, online? | Complejidad de cadena de valor |
| 6 | ¿Quiénes son sus clientes más importantes? ¿Tienen contratos de volumen? | Stakes reales, urgencia de entrega |

#### 2B. Operación de Planta

| # | Pregunta | Lo que realmente estás buscando |
|---|---|---|
| 7 | ¿Cómo es su proceso productivo de inicio a fin? (Pídeles que lo dibujen o describan paso a paso) | Mapeo de valor, identificar etapas |
| 8 | ¿Cuántas etapas tiene su proceso? ¿Cuáles son las más críticas o delicadas? | Puntos de falla potencial |
| 9 | ¿Cómo miden actualmente su producción diaria o semanal? ¿Con qué herramientas? | Estado de madurez digital actual |
| 10 | ¿Cómo saben qué fabricar cada semana? ¿Quién toma esa decisión y con qué información? | Planeación de producción — ¿es ad hoc o estructurada? |
| 11 | ¿Cuánto tiempo tarda en promedio producir un lote estándar? | Baseline para mejora de tiempos |

---

### BLOQUE 3 — Exploración de Dolores y Fricciones (25 min)

> **Técnica clave:** Usa preguntas abiertas, deja silencios, escucha activamente. No interrumpas con soluciones. Toma notas visibles (muestra que los estás escuchando con seriedad).

#### 3A. Control de Producción y Eficiencia

| # | Pregunta | Señal de alerta a escuchar |
|---|---|---|
| 12 | ¿Alguna vez han tenido que parar una línea inesperadamente? ¿Por qué? | Falta de materia prima, fallas, desorganización |
| 13 | ¿Cómo identifican cuando hay un cuello de botella en planta? ¿Quién lo detecta? | Reacción vs. prevención |
| 14 | ¿Han perdido pedidos o clientes por no poder entregar a tiempo? | Impacto directo en revenue |
| 15 | ¿Cómo controlan la merma y los productos defectuosos? ¿Tienen un número de referencia? | Oportunidad de ahorro cuantificable |
| 16 | ¿Cuánto tiempo dedica su equipo administrativo a consolidar información de producción? | Ineficiencia operativa — costo oculto |

#### 3B. Inventarios y Materiales

| # | Pregunta | Señal de alerta a escuchar |
|---|---|---|
| 17 | ¿Saben en todo momento cuánta materia prima tienen disponible? ¿Cómo lo controlan? | Excel, libreta, sistema, nada |
| 18 | ¿Han tenido problemas de sobrestock o desabasto de materiales? | Costo de capital inmovilizado vs. paros de línea |
| 19 | ¿Cómo gestionan las órdenes de compra a proveedores? ¿Tienen criterios de reorden? | Proceso manual = riesgo operativo |
| 20 | ¿Cuántos proveedores manejan? ¿Tienen alternativas si uno falla? | Resiliencia de cadena de suministro |

#### 3C. Pedidos y Clientes (B2B / B2C)

| # | Pregunta | Señal de alerta a escuchar |
|---|---|---|
| 21 | ¿Cómo reciben y registran los pedidos de sus clientes hoy? | WhatsApp, email, llamadas = caos |
| 22 | ¿Cómo informan a sus clientes el estatus de un pedido? | Reactividad vs. visibilidad proactiva |
| 23 | ¿Han tenido problemas de pedidos mal tomados, duplicados o perdidos? | Error humano con costo real |
| 24 | ¿Tienen clientes que piden precios especiales o condiciones distintas? | Necesidad de reglas de negocio en portal B2B |
| 25 | ¿Están pensando en vender en línea o ampliar canales? | Apertura a e-commerce o integración ERP |

#### 3D. Visibilidad y Toma de Decisiones

| # | Pregunta | Señal de alerta a escuchar |
|---|---|---|
| 26 | ¿Hoy en día, qué información revisa usted diariamente para tomar decisiones? ¿Dónde la encuentra? | Intuición vs. dato |
| 27 | ¿Qué es lo que más le quita el sueño en términos de operación? | El dolor más profundo y verdadero |
| 28 | ¿Ha habido algún incidente o pérdida significativa que hubiera podido evitarse con mejor información? | Historia emocional = motivación de compra |
| 29 | ¿Qué tan difícil sería para usted mostrarle a un inversionista o socio el desempeño de su planta en tiempo real? | Aspiración de visibilidad ejecutiva |

---

### BLOQUE 4 — Validación de Prioridades y Visión Futura (15 min)

**Objetivo:** Co-construir la visión y priorizar con ellos.

| # | Pregunta |
|---|---|
| 30 | Si tuviera que elegir el problema más urgente de resolver hoy, ¿cuál sería? |
| 31 | ¿En qué área cree que una mejora tendría el mayor impacto en su rentabilidad? |
| 32 | ¿Han intentado resolver alguno de estos problemas antes? ¿Qué pasó? (¿Por qué falló?) |
| 33 | ¿Tienen alguna iniciativa de tecnología o digitalización planeada para este año? |
| 34 | ¿Cuál sería para usted un "home run" — el resultado ideal que esperarían de trabajar con nosotros en 12 meses? |

**Pregunta de cierre de diagnóstico (la más importante):**

> *"Si yo pudiera mostrarle, en un tablero en tiempo real, cuánto está produciendo su planta hoy, dónde se están acumulando los cuellos de botella, y cuánto le está costando cada ineficiencia — ¿eso cambiaría cómo dirige su empresa?"*

---

### BLOQUE 5 — Cierre y Próximos Pasos (10 min)

**Script de cierre:**

> *"Con todo lo que nos han compartido hoy, tenemos claridad suficiente para preparar un diagnóstico preliminar y una propuesta estructurada. En los próximos [X días], les vamos a presentar: (1) nuestra lectura de sus principales oportunidades de mejora, (2) una arquitectura de solución por fases con inversión estimada por módulo, y (3) una proyección de ROI basada en los números que nos compartieron hoy."*

**Acuerdos a confirmar en sala:**
- [ ] Fecha de presentación de propuesta
- [ ] Quiénes estarán presentes (asegurar que el tomador de decisión esté)
- [ ] ¿Podemos hacer un recorrido por planta antes de la propuesta? (CRÍTICO)
- [ ] ¿Nos pueden compartir algún reporte o dato de producción existente?

---

## 🔍 FASE 3: Recorrido por Planta (Si se logra)

### Qué observar durante el recorrido

**Operación física:**
- [ ] ¿Hay tableros de control físicos visibles? ¿Están actualizados?
- [ ] ¿Usan órdenes de trabajo en papel?
- [ ] ¿Hay acumulaciones visibles de WIP (Work In Progress) entre estaciones?
- [ ] ¿Los operarios saben qué deben producir hoy? ¿Cómo lo saben?
- [ ] ¿Hay materiales mal identificados o sin etiqueta?
- [ ] ¿Existe algún sistema de semáforo / andon? ¿Lo usan?

**Tecnología existente:**
- [ ] ¿Qué dispositivos usan? (celular, tablet, computadora, nada)
- [ ] ¿Hay WiFi en planta?
- [ ] ¿Tienen sistema ERP, MRP, WMS, o solo Excel?
- [ ] ¿Cómo registran entradas/salidas de almacén?

**Personas:**
- [ ] ¿Qué tan receptivos son los mandos medios a la tecnología?
- [ ] ¿Quién tiene influencia real sobre la adopción (el jefe de planta, no solo el director)?

---

## 📊 FASE 4: Estructuración de la Propuesta Post-Discovery

### 4.1 Mapa de Dolores → Módulos de Solución

Después de la sesión, mapea cada dolor a una capacidad de solución:

| Dolor identificado | Módulo propuesto | KPI de impacto |
|---|---|---|
| Sin visibilidad de producción en tiempo real | **Control MES / Dashboard de Planta** | OEE, producción vs. meta, eficiencia por línea |
| Inventario de MP desconocido | **Gestión de Inventarios (WMS ligero)** | Reducción de paros por desabasto, costo de inventario |
| Pedidos por WhatsApp/teléfono | **Portal de Pedidos B2B** | Reducción de errores, tiempo de toma de pedido |
| Merma sin medir | **Trazabilidad y Calidad** | % de merma, costo de no-calidad |
| Director sin visibilidad | **Dashboard Ejecutivo (BI)** | Decisiones basadas en dato, no intuición |
| Planeación de producción manual | **Módulo de Planeación/MRP** | Reducción de paros, mejor uso de capacidad |

### 4.2 Estructura de Propuesta por Tiers

```
┌─────────────────────────────────────────────────────┐
│  TIER 1 — VISIBILIDAD INMEDIATA (Quick Win, 4-8 sem)│
│  Dashboard de producción + Inventario básico         │
│  Inversión: $XX,XXX MXN / Mes o proyecto             │
│  ROI esperado: Reducción X% tiempo administrativo    │
├─────────────────────────────────────────────────────┤
│  TIER 2 — CONTROL OPERATIVO (3-6 meses)             │
│  Control MES + Trazabilidad + Calidad                │
│  Inversión: $XXX,XXX MXN                             │
│  ROI esperado: Reducción X% merma, +X% OEE          │
├─────────────────────────────────────────────────────┤
│  TIER 3 — PLATAFORMA INTEGRAL (6-18 meses)          │
│  Portal B2B + MRP/Planeación + ERP lite              │
│  Inversión: $X,XXX,XXX MXN                          │
│  ROI esperado: X meses de payback, X% revenue uplift │
└─────────────────────────────────────────────────────┘
```

### 4.3 Calculadora de ROI (Llenar con datos de la entrevista)

```
EJEMPLO DE CÁLCULO DE ROI — MÓDULO DE CONTROL DE PRODUCCIÓN:

Datos capturados en entrevista:
  - Producción diaria: _____ unidades
  - Precio promedio por sombrero: $_____ MXN
  - Operarios en planta: _____
  - Costo promedio por hora/operario: $_____ MXN
  - Horas de paro no planeado por semana: _____
  - % de merma estimado: _____%
  - Horas/semana en reporteo manual: _____

Impacto calculado:
  - Ahorro por reducción de paros (30%): $_____ /año
  - Ahorro por reducción de merma (20%): $_____ /año
  - Ahorro en tiempo administrativo: $_____ /año
  ─────────────────────────────────────────────────
  BENEFICIO TOTAL ANUAL ESTIMADO: $_________ MXN
  INVERSIÓN MÓDULO TIER 1: $_________ MXN
  PAYBACK: _____ meses
```

---

## 🏗️ FASE 5: Arquitectura Técnica Preliminar (Para Propuesta)

### Stack Recomendado (Escalable, Limpio, Costo-efectivo)

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│   Web App (React/Next.js) + Mobile (PWA o React Native)     │
│   Dashboard Ejecutivo | Portal Operarios | Portal B2B       │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE NEGOCIO (API)                     │
│   Node.js / Python FastAPI — REST + WebSockets (real-time)  │
│   Módulos: Producción | Inventario | Pedidos | Calidad      │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE DATOS                             │
│   PostgreSQL (core) + Redis (tiempo real) + S3 (archivos)  │
├─────────────────────────────────────────────────────────────┤
│                 INFRAESTRUCTURA (Cloud-first)                │
│   AWS / GCP — Escalable, Pay-per-use, Seguro                │
│   CI/CD con GitHub Actions | Monitoreo con Sentry/Datadog   │
└─────────────────────────────────────────────────────────────┘
```

**Consideraciones para manufactura:**
- **Offline-first:** La solución debe funcionar con conectividad limitada en piso
- **Dispositivos simples:** Tablets económicas / celulares Android básicos para operarios
- **Integración:** API-first para futura conexión con ERP (SAP, Aspel, CONTPAQi)
- **Escalabilidad:** Arquitectura multi-tenant si Uanify quiere replicar el modelo en otros clientes industriales

---

## 🤝 Perfil de Stakeholders — Cómo Tratar a Cada Interlocutor Clave

| Interlocutor Real | Sus Miedos / Objeciones | Su Aspiración / Triunfo | Estrategia de Posicionamiento Uanify |
|---|---|---|---|
| **Edmundo ("Mundo")** *(Dirección / Amigo de Prepa La Salle)* | • Quedar mal con su familia si una inversión no rinde.<br>• Que la relación de amistad choque con temas de negocio o entregas.<br>• Complejidad de adopción por parte del personal de planta. | • Modernizar la fábrica de su familia con tecnología de punta.<br>• Tener control ejecutivo en tiempo real sin estar metido en piso todo el día.<br>• Convertir la fábrica en un referente industrial en San Pancho. | **Socio Estratégico de Confianza:** Mantener la calidez del trato personal pero elevando la conversación al rigor técnico y financiero. Presentar contratos claros, SLAs y fases medibles que le den tranquilidad total ante su familia y socios. |
| **Ingeniero de Producción** *(El "Mero Mero" en Piso)* | • Que Uanify sea un proveedor "de oficina" que no entiende la grasa, el vapor y el ritmo de planta.<br>• Que el software sea una carga de trabajo extra o un sistema de fiscalización que lo exponga.<br>• Que el software falle y pare la línea. | • Automatizar el vaciado de datos y dejar de lidiar con pizarrones y papeles.<br>• Demostrar a Dirección con métricas duras (OEE, tiempos de ciclo) las mejoras que ha logrado.<br>• Contar con herramientas profesionales para justificar compras y balanceo de líneas. | **Su Aliado Técnico ("El Brazo de Software que le faltaba"):** Hablarle en su idioma (Lean, Takt time, cuellos de botella, paros no programados). Decirle explícitamente: *"Nosotros no venimos a decirte cómo hacer tu trabajo; venimos a programar exactamente lo que tú necesitas para que tu operación rinda al máximo y tus reportes salgan solos en 1 clic."* |
| **Supervisores y Maestros de Taller** *(Operación física en San Pancho)* | • Que la tecnología los reemplace o los haga ver lentos.<br>• No saber usar computadoras o tablets complicadas. | • Que los operarios no se retrasen y que las máquinas no fallen sin aviso. | **Diseño Cero Fricción:** Involucrarlos en la ergonomía (pedales, botoneras gigantes, pizarrones digitales visibles a 10 metros). Garantizar capacitación paciente y respeto a su oficio artesanal. |

---

## ✅ Checklist Pre-Reunión

### 48 horas antes:
- [ ] Investigar la empresa (LinkedIn, web, noticias)
- [ ] Preparar carpeta de presentación Uanify (credenciales + casos de uso industria)
- [ ] Imprimir o tener digital: lista de preguntas + hoja de captura de datos
- [ ] Confirmar asistentes y roles en la reunión

### 24 horas antes:
- [ ] Preparar 2-3 "insights" sobre el sector manufacturero de sombreros / textiles para demostrar que llegaste preparado
- [ ] Llevar calculadora de ROI lista (hoja de Excel o Notion con fórmulas)
- [ ] Llevar laptop con demos o prototipos si los tienes

### En la reunión:
- [ ] Tomar notas visibles — muestra que escuchas
- [ ] Confirmar números reales: producción diaria, número de operarios, costo promedio
- [ ] Pedir tour de planta si no está confirmado
- [ ] Agendar fecha de presentación de propuesta ANTES de salir

---

## 📅 Roadmap de Trabajo Post-Sesión

```
DÍA 1-2    → Consolidar notas y validar hipótesis
DÍA 3-4    → Calcular ROI con datos reales de la sesión
DÍA 5-7    → Diseñar arquitectura modular y propuesta comercial por tiers
DÍA 8-10   → Preparar deck ejecutivo (máx 15 slides, orientado a negocio)
DÍA 10-12  → Presentación de propuesta (con el tomador de decisión en sala)
```

---

*Documento vivo — Uanify Consulting / Actualizar con notas de cada sesión*
