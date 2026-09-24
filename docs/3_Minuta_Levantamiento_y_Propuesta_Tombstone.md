# 🤠 Uanify × Tombstone Hats (San Francisco del Rincón)
## Minuta Ejecutiva de Levantamiento en Planta y Propuesta Técnica Integral

> **Documento:** Minuta Técnica de Levantamiento & Propuesta de Solución Industria 4.0  
> **Fecha de Reunión en Planta:** Septiembre 2026  
> **Fecha de Entrega de Propuesta:** Principios de la próxima semana (compromiso acordado)  
> **Empresa:** Tombstone Hats ([tombstone.mx](https://tombstone.mx/)) — San Francisco del Rincón, Guanajuato  
> **Destinatario:** Edmundo ("Mundo") e Ing. Carlos (Jefe de Producción)  
> **Correo oficial para entrega:** `making.tombstone@gmail.com`  
> **Elaborado por:** Equipo de Consultoría y Arquitectura de Software — Uanify  
> **Prototipo Interactivo Desplegado:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)

---

## 📋 Resumen Ejecutivo

Con base en la reunión, recorrido técnico y audios grabados en la planta de **Tombstone Hats**, se levantaron a detalle las dinámicas operativas, restricciones físicas y prioridades estratégicas.

El objetivo central acordado (citado literalmente del audio):
> *"Lo que queremos es generar información que nos ayude a nosotros a tomar decisiones, desde la parte del flujo de la producción y el monitoreo, saber cómo va avanzando. Si yo quiero consultar un lote, en dónde está, saber qué tengo en cada departamento o en esta fracción. Esa es la prioridad."*

---

## 🏭 1. Diagnóstico Operativo de Planta (Levantamiento en Sitio)

### 1.1 Mix de Fabricación y Productos

* **Producto Campeón (~70% del volumen):** Sombreros y Texanas de **Telar** (Master Telar Denver, El Viejonón, Laredo, Frontier, Chaparral).
  * **Dos variantes de construcción:**
    1. **Sombrero de 2 piezas:** Copa y falda se cortan de cuadros de telar por separado. Se fusionan mediante pegamento activado por calor en las prensas.
    2. **Sombrero de 1 pieza:** Proceso integral (copa y falda como una sola unidad).
  * **Campana preformada (fieltro de lana/pelo):** Omite el proceso de corte de cuadros; entra directamente a prensas.

* **Línea de Accesorios (~30% del volumen):** Carteras, cintos vaqueros, mariconeras, bolsitas y horquillas. El Ing. Carlos confirmó en audio:
  > *"Ahí principalmente son las fichas técnicas de los productos y accesorios. De la ficha técnica jalar tu ficha de costos. No es un proceso de flujo complejo como aquí."*
  * **Requerimiento accesorios:** Fichas técnicas digitales + cálculo de costo automático. No requiere MES de flujo en Fase 1.

### 1.2 Inventario de Hormas / Moldes (Validado en Recorrido Visual)

El Ing. Carlos mostró físicamente las hormas identificadas por **color y nombre** en el almacén de prensas:

| Horma | Color ID | Tipo de Prensa | Estado |
|---|---|---|---|
| **Roper** | Beige | Prensa Vapor #1 | En uso activo |
| **Chaparral** | Azul | Prensa Vapor #2 | En uso activo |
| **Viejón** | Rojo | Hidráulica #3 | En espera |
| **Laredo** | Verde | Prensa Vapor #3 | En mantenimiento |
| **Frontier** | Gris | Sin asignar | Bodega |

> 📌 Carlos confirma en audio: *"Manejamos dos tipos de máquinas: la parte de prensas y la parte de hidráulicas. Las formas se tienen que cargar al inventario y se puedan ir asignando a las máquinas para hacer la planeación, la programación (PPSP)."*

### 1.3 El Flujo Real de los 14 Puntos de Control (Validado por Carlos)

El Ing. Carlos describió verbalmente y mostró físicamente el flujo completo. Se identificaron **14 puntos de control** (11 departamentos + 3 inspecciones de calidad fijas):

```
[D-01] Corte de Cuadros
   ↓ (solicitud al almacén de materiales; el producto campeón inicia aquí)
[D-02] Alambrado de Ala
   ↓ (colocación de alambre de memoria; varias estaciones de trabajo)
[D-03] Englopado / Baño de Dope (Camas)
   ↓ (baño de sellador; secado en camas. CADA CAMA = 1 LOTE. Tarjeta viajera en la cama.)
[D-04] Refuerzos (Pintola / Brocha)
   ↓ (aplicación de sellador en área de patio exterior)
[C-01] ✅ CALIDAD 1 — Post-Dope / Refuerzos
   ↓ (primer punto de inspección de calidad. Libera o regresa.)
[D-05] Prensas de Hormado (Copa y Falda)
   ↓ (cuello de botella. Entrada al almacén de alineado: RAMPA → cambio de tarjeta madre
      por tarjetas hijas de sublote de 15 pzas. Auxiliar hace el cambio físico.)
[D-06] Recorte y Refaldeado
   ↓ (corte perimetral de falda; área de chicas en patio exterior)
[D-07] Pintura y Secado
   ↓ (pistola con pintola; ej. Pintura Taiwan 1125)
[C-02] ✅ CALIDAD 2 — Post-Pintura
   ↓ (mismo espacio físico revisa pintura y brillo secuencialmente)
[D-08] Brillo / Acabado
   ↓
[D-09] Temperado / Refaldear
   ↓
[D-10] Adorno 1 (Tafilete + Toquilla)
   ↓ (cruce de 3 subensambles: cuerpo + tafilete por talla + toquilla)
[C-03] ✅ CALIDAD 3 / FINAL — Producto Terminado
   ↓ (inspector revisa pieza a pieza. Liberados pasan al mezzanine de acumulación diaria)
[D-11] Embarque → Vale de Salida → COMPAC
```

> ⚠️ **PRENSAS = Cuello de Botella confirmado.** Carlos describe que el lote entra y sale múltiples veces de las prensas (copa en el primer paso, falda en el segundo, etc.) antes de avanzar.

### 1.4 El Fraccionamiento de Lotes en la Rampa

Este es el proceso más crítico a digitalizar, citado literalmente por Carlos en el audio:

> *"Aquí nosotros tenemos un archivo de Excel y nos hace el lotificador. Físicamente hacemos cambios de tarjeta. Llega el lote a la rampita, de aquí hacia la derecha. Físicamente los parten y les ponen otra etiqueta. El lote 351, agarro mis tarjetas del 351 y digo: aquí está el 1, aquí está el 2, aquí está el 3, aquí está el 4."*

Y en otro momento del audio:
> *"¿Cómo se ve aquí visualmente? 1,094. Así que tenemos 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14. Estos son los sublotes que se obtienen del lote completo."*

**Regla validada:**
* El número de sublotes puede ser mayor de 4 (ej. lote 1094 tiene hasta 14 sublotes).
* El número depende del volumen de la orden de producción.
* En la rampa, el auxiliar recibe la tarjeta madre de 60 pzas y la intercambia por las tarjetas hijas de sus sublotes (15 pzas cada una), las cuenta físicamente y las pone a los operadores.

**Propuesta Uanify:** Al escanear el QR del lote en la rampa, el sistema genera automáticamente los sublotes e imprime (o muestra en pantalla) las tarjetas hijas con sus QR individuales. El auxiliar ya solo confirma el conteo físico.

### 1.5 Regla del Lote Completo y Manejo de Saldos ("Venta de Viernes")

Citado textualmente del audio:
> *"¿Un lote puede salir incompleto? No, no debería de salir incompleto. Deben de salir lotes completos."*
> *"Supongamos que hay un lote de 60. Dos no van. ¿Qué pasa con esos? Se mandan con los saldos de calidad."*
> *"Se pueden crear lotes [de saldo]."*

**Reglas de Negocio validadas:**
1. Si una pieza tiene defecto **con arreglo posible** → se regresa al departamento anterior donde está el error para compostura.
2. Si una pieza tiene defecto **sin arreglo** → se manda al almacén de saldos como "Producto Regular / Segunda".
3. Para mantener el lote completo de 60 pzas, se sustituye la pieza defectuosa con una del inventario de saldo.
4. **Viernes:** se consolida todo el saldo de la semana y se vende al cliente como lote de segunda, recuperando el costo de material.

> *"Al final, toda esa merma se acumula y se vende a los clientes como un producto de segunda."*

### 1.6 Subensambles en Adorno 1: Tafiletes por Talla

Validado en audio (Carlos):
> *"En el departamento de Adorno 1, el producto se queda a espera de otros dos subensambles: el tapilete, que es una parte que se le encarga al sombrero, y la toquilla, que es el cintito que lleva en la parte de arriba."*
> *"Ahorita [la coordinación] es de manera verbal entre los supervisores. 'Oye, ¿tienes de esta talla, de este modelo?' 'Sí.' '¿Cuántos?' '150.' 'Déjate, paso 150.'"*

**Requerimiento directo del Ing. Carlos:**
> *"Que el supervisor pueda revisar qué es lo que tiene en su inventario en proceso. Poder saber qué tengo en cada almacén. Y poder ligar esos lotes para empezarlos a procesar en Adorno 1."*

### 1.7 Despacho a Clientes y Enlace CONTPAQi (COMPAC)

El proceso de entrega descrito literalmente en audio:
> *"Viene el cliente, trae su camioneta, se genera un vale de salida donde se pone todo el producto que se les entrega. Ese vale, en un Excel se tienen capturadas las órdenes de producción y se va descontando lo que se va entregando. El vale pasa a contabilidad y sobre ese vale se hace la facturación del cliente. En COMPAC."*

Sobre el formato de pedidos (citado del audio):
> *"El cliente dice: 'Yo quiero que me entreguen 10,500 piezas. Van a ser 7,500 de esta, 2,000 de esta, 1,000 de esta y 500 de esta.' Así es como está establecido."*

Sobre la ingeniera de COMPAC (audio):
> *"Tenemos una persona que nos ayuda con el Compact. Es una muchacha, es una ingeniera. Ella es de Compact. Es una membresía que se paga anual. Tenemos el servicio de todo lo de la contabilidad, la facturación."*

> ⚠️ **Acción pendiente:** Verificar el tipo de licencia de COMPAC con la ingeniera externa para determinar si permite integración API. Carlos comenta: *"Hay unas licencias que a lo mejor te dan lo que necesites, pero si quieres hacer integraciones con otros softwares, pues te bloquea."*

---

## 🛡️ 2. Restricciones Físicas y Ambientales Confirmadas en Audio

| Restricción | Declaración Exacta en Audio | Solución Uanify |
|---|---|---|
| **Polvo severo** (Prensas y Recortes) | *"Sí tiene que ser resistente al polvo, porque en el área de prensas hay mucho, mucho polvo. El polvo llega a dañar los equipos."* | Tablets con carcasa IP65, lectores QR sellados |
| **Sin celulares para operarios** | *"Ya si tienen pero lo tienen prohibido."* | Módulos físicos de escaneo QR para supervisores/auxiliares |
| **Red existente** | *"Tenemos el servidor, el módem y los repetidores. Por la conexión no habría problema."* | Edge local + sincronización a nube |
| **Solo supervisores con dispositivo** | *"Los supervisores deberían tener acceso a revisar qué es lo que tienen en su inventario."* | App para supervisores. Operarios no tocan la app. |

### 2.4 Esquema de Roles de Usuario y Permisos Modulares (RBAC)
Para garantizar la seguridad y evitar saturación en piso, el sistema implementa **3 perfiles de acceso claramente diferenciados**:
1. **👑 Administrador (Dirección General / Mundo):**
   - Acceso total a todos los módulos (Andon, Lotes/QR, Ingeniería, COMPAC, Configuración).
   - Capacidad exclusiva de dar de alta usuarios y configurar permisos modulares específicos para cada puesto.
2. **⚙️ Ingeniero de Procesos (Ing. Carlos):**
   - Acceso a Tablero Andon e Ingeniería & Subensambles (OEE, matriz de materiales con cambio masivo en 1 clic, inventario de hormas y stock de tafiletes por talla).
3. **📋 Supervisor de Nave y Almacenes (iPad en Almacenes Intermedios):**
   - Interfaz simplificada y táctil para iPad sin elementos distractores.
   - Escaneo de tarjetas viajeras con QR, fraccionamiento en rampa (60 a 15 pzas), y reporte de mermas/segundas y paros de línea.

> 📌 **Hardware acordado:** Carlos en audio: *"Para mí sería la parte de módulos físicos. Varios módulos físicos. Para que vayamos registrando por lotes. Ahorita no traemos tanto la parte de pieza por pieza."*

---

## 🚀 3. Roadmap de Implementación Validado en Reunión

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ FASE 1 — INMEDIATA (4 semanas) · Lo que Carlos pidió                           │
│ • Sistema MES: Registro de avance de lotes/fracciones en 14 puntos de control  │
│ • Tablero Andon TV (50") en Nave Central: metas h×h, semáforos, WIP por dpto.  │
│ • Fraccionador Digital de Rampa: lote 60 pzas → sublotes de 15 pzas con QR     │
│ • Módulos físicos de escaneo QR (pistolas) en almacenes intermedios            │
│ • Módulo de Saldos / Segundas (Venta de Viernes)                               │
│ • Consulta de lotes: "¿Dónde está mi lote 1094?"                               │
├────────────────────────────────────────────────────────────────────────────────┤
│ FASE 2 — SIGUIENTE (4 semanas)                                                 │
│ • Monitor de Subensambles: Tafiletes por Talla (55-60) en Adorno 1             │
│ • Vale de Entrega Digital para camión del cliente                               │
│ • Puente de Integración con COMPAC / CONTPAQi (pendiente verificación licencia)│
│ • Matriz de Materiales + Cambio Masivo (ej. Pintura Taiwan 1125 → nuevo)       │
│ • Inventario de Hormas vinculado a prensas (módulo PPSP de planeación)         │
├────────────────────────────────────────────────────────────────────────────────┤
│ FASE 3 — CONSOLIDACIÓN (A convenir)                                            │
│ • Fichas Técnicas + Costeo de Accesorios (Carteras, Cintos, Horquillas, etc.)  │
│ • Destajo / Rendimiento por Operador (actualmente sueldos fijos)               │
│ • Analítica avanzada: OEE, Takt Time predictivo, balanceo de líneas            │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## ❓ 4. Dudas Abiertas para Afinar la Propuesta

1. **Integración COMPAC:** Coordinar llamada técnica breve con la ingeniera externa para verificar:
   - ¿Qué versión de licencia tienen? ¿Permite integración API o conexión a base de datos?
   - ¿La base de datos es SQL Server? ¿En la nube o instalación local?

2. **Diagrama de Flujo de Proceso:** Carlos ofrece enviar el diagrama que ya tienen. Edmundo menciona correo `making.tombstone@gmail.com`. Necesitamos:
   - Diagrama del producto campeón (telar, 2 piezas)
   - Diagrama de campana preformada (fieltro)
   - Diagrama de accesorios (si lo tienen)

3. **Inventario de materiales:** ¿Tienen catálogo de materiales existente (Excel, COMPAC o papel)? Esto acelera la carga inicial al sistema.

4. **Ubicación física de módulos QR:** Definir los 4–6 puntos exactos donde se instalarán los lectores fijos (sugeridos: Rampa, Salida de Prensas, Salida de Recortes, Salida de Brillos, Mesa de Adorno 1, Mesa de Calidad Final).

5. **Turnos y Horarios Operativos [CONFIRMADO]:** La planta opera de manera consolidada en **Turno Único** de 07:00 a 15:30 hrs (Lunes a Viernes), con meta diaria de 850 piezas y 42 segundos de Takt Time estándar. Queda formalizado el esquema de 3 roles en el sistema MES: Administrador (acceso total y gestión de permisos), Ingeniero de Producción (Takt Time, líneas, BOMs) y Supervisor de Línea (escaneo de lotes en iPad, alertas WIP y paros Andon).

---

## 📅 5. Compromisos y Calendario

| Fecha | Hito Acordado | Responsable |
|---|---|---|
| **Inmediato (hoy)** | Entrega de minuta de levantamiento y prototipo interactivo en vivo | Uanify |
| **Viernes / Lunes** | Recepción de diagramas de flujo de proceso y contacto de COMPAC vía `making.tombstone@gmail.com` | Tombstone Hats |
| **Principios de la próxima semana** | Envío de Propuesta Formal Técnico-Económica (cotización hardware IP65 + software MES por fases) | Uanify |
| **Semana entrante** | Sesión de revisión (presencial o videollamada) para definir fecha de arranque del piloto Fase 1 | Uanify & Tombstone |

---

*Uanify — Consultoría en Transformación Digital e Industria 4.0*  
*Contacto: contacto@uanify.com | Referencia del proyecto: Tombstone Hats MES 2026*
