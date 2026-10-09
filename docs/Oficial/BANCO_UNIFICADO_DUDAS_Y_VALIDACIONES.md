# Banco Unificado de Dudas y Validaciones Técnicas
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Documento Unificado Oficial de Preguntas y Respuestas Técnicas (Cerradas y Pendientes de Definición con el Cliente).*

> **Versión:** `v2.55.0`  
> **Fecha:** 9 de Octubre de 2026  
> **Estado:** Documento Oficial de Preguntas y Respuestas  
> **Cliente:** Tombstone Hats (Edmundo González / Ing. Carlos Ortiz)  
> **Proveedor:** Uanify (Andrés Villanueva)

---

## 1. Dudas Ya Respondidas y Acordadas con el Cliente

### Pregunta 1.1: ¿Cómo se manejan las piezas de segunda o mermas durante el avance de un lote?
**Respuesta Confirmada:**
El lote principal no se detiene cuando se apartan piezas defectuosas; las piezas aptas continúan su avance. El sistema registra las piezas retiradas, su clasificación (Segunda o Merma) y la causa raíz del defecto. Físicamente, las piezas de segunda se almacenan para venta directa con descuento y no frenan el flujo de la orden.

### Pregunta 1.2: ¿Cuántos filtros de inspección de calidad existen y quién decide el destino de un lote rechazado?
**Respuesta Confirmada:**
Existen 4 puntos de inspección en línea atendidos por 6 inspectores exclusivos de calidad. Cuando se detecta una desviación grave, el Inspector no aprueba el lote y el Supervisor del área o el Ingeniero de Calidad determinan formalmente si se envía a Reproceso, Segunda o Merma.

### Pregunta 1.3: En caso de Reproceso, ¿hacia dónde regresa el lote?
**Respuesta Confirmada:**
El lote no regresa por defecto al departamento inmediato anterior; se redirige específicamente a la estación donde se originó el defecto (por ejemplo, si en Inspección Final se detecta falla de costura, regresa a Adorno o Ribeteado).

### Pregunta 1.4: ¿En qué momento exacto del flujo se realiza el escaneo del lote?
**Respuesta Confirmada:**
Se escanea al salir del departamento. El supervisor o auxiliar del departamento saliente registra el lote y lo deposita en el almacén intermedio correspondiente.

### Pregunta 1.5: ¿Cómo se realiza el traslado físico entre departamentos?
**Respuesta Confirmada:**
Los operadores dejan el producto terminado en torres sobre carritos. Un auxiliar/recolector dedicado de planta acude al almacén de salida y traslada físicamente las piezas al almacén de entrada de la siguiente estación.

### Pregunta 1.6: ¿Dónde y en qué formato se imprimen las tarjetas viajeras?
**Respuesta Confirmada:**
Las tarjetas se imprimen exclusivamente en el área de Ingeniería en una impresora láser de oficina sobre papel bond tamaño carta estándar. Las tarjetas se recortan y se introducen en fundas plásticas cosidas (micas) que viajan con el lote físico.

### Pregunta 1.7: ¿El tamaño del lote madre es estrictamente fijo de 60 piezas?
**Respuesta Confirmada:**
No es fijo. Si bien 60 piezas es el estándar de manejo en torres y carritos, el tamaño del lote madre es configurable por el Ingeniero de Producción según la orden (de 4 a 14 sublotes de 15 a 60 piezas).

### Pregunta 1.8: ¿Cómo se gestionan los operadores en el sistema?
**Respuesta Confirmada:**
Los 108 operadores de planta están 100% fijos en sus estaciones y no tienen usuario ni contraseña en el sistema. Los supervisores e ingenieros son quienes operan las terminales de planta y asignan el trabajo por número de nómina.

### Pregunta 1.9: ¿Qué control se requiere sobre las hormas de aluminio en Prensas?
**Respuesta Confirmada:**
Para el MVP únicamente se requiere saber qué horma está montada en qué número de máquina para la planeación del día. No se requiere contador de ciclos ni mantenimiento predictivo de molde por el momento.

### Pregunta 1.10: ¿Cómo se coordina el subensamble de tafiletes y toquillas con Adorno?
**Respuesta Confirmada:**
Tafiletes (9 personas) y Toquillas (7 personas) trabajan independientemente alimentando a Adorno (11 personas). El sistema debe mostrar un semáforo visual de disponibilidad de stock por modelo y talla en la estación de Adorno para saber si ya se cuenta con insumos completos antes de iniciar el ensamble.

---

## 2. Dudas y Cuestiones Pendientes por Definir con el Cliente

### Pregunta 2.1: ¿Cuál es el criterio operativo para marcar un Paro de Producción (a nivel proceso, máquina o departamento)?
* **Contexto:** En planta ocurren detenciones por cambio de horma, fallas mecánicas, falta de vapor o falta de material.
* **Cuestión Pendiente:**
  * ¿El paro se marca **a nivel de Máquina individual** (afectando únicamente a una prensa específica mientras las demás 18 prensas siguen trabajando), **a nivel de Departamento completo** (se detiene toda el área de Prensas), o **a nivel de Proceso/Línea**?
  * ¿A partir de cuántos minutos de detención se debe exigir el registro obligatorio del evento en la terminal (ej. cualquier pausa mayor a 3 minutos, 5 minutos, o solo paros mayores a 15 minutos)?
  * ¿Quién debe cerrar o levantar el paro: el operador notificando verbalmente al supervisor, o el mecánico de mantenimiento que acudió a reparar?

### Pregunta 2.2: ¿Cuál es el viaje físico y proceso actual completo de las Tarjetas Viajeras (Lotes y Sublotes)?
* **Contexto:** Se requiere mapear el ciclo de vida exacto de la tarjeta de papel desde que se emite hasta que se archiva.
* **Cuestión Pendiente:**
  * **Emisión inicial:** El Ingeniero segmenta la orden en Ingeniería e imprime la tarjeta del Lote Madre y las tarjetas de Sublote. ¿El supervisor recoge ambas tarjetas desde el día 1, o el lote madre viaja solo con su tarjeta madre durante las primeras estaciones (Corte, Prensas, Engomado)?
  * **Fraccionamiento en Rampa (D-05 Almacén Intermedio):** Al llegar el lote madre de 60 piezas a la rampa y fraccionarse en 4 sublotes de 15 piezas:
    * ¿Qué ocurre físicamente con la tarjeta madre original? (¿Se archiva de inmediato en una carpeta física en la mesa de rampa, o acompaña al primer sublote?).
    * ¿Quién coloca las nuevas tarjetas de sublote en las micas de los carritos de 15 piezas?
  * **Destino final de las tarjetas:** Cuando los 4 sublotes de 15 piezas superan Calidad Final y se empacan en cajas de 60 piezas para Embarque:
    * ¿Las 4 tarjetas de sublote se introducen dentro de la caja de cartón con el producto para el cliente, se entregan al chofer con la remisión, o se retiran y se archivan en oficina de Producción/Embarques?

### Pregunta 2.3: ¿Cuáles son las medidas exactas de las fundas plásticas (micas) para la impresión?
* **Contexto:** Se generará una plantilla en PDF para impresión directa en hojas tamaño carta estándar de oficina.
* **Cuestión Pendiente:**
  * ¿Cuáles son las medidas en centímetros de ancho y alto de la ventana visible de la funda de plástico cosida?
  * ¿Cuántas tarjetas caben idealmente en una hoja tamaño carta (4 por hoja en formato 10x13 cm, o 6 por hoja en formato 9x10 cm)?

### Pregunta 2.4: ¿Qué método de autenticación prefieren para los Supervisores en las terminales de planta?
* **Contexto:** Las 6 terminales táctiles estarán en puntos fijos de la nave y serán compartidas entre supervisores e inspectores que usan guantes o tienen manos con adhesivo y polvo de sombreros.
* **Cuestión Pendiente:**
  * ¿Prefieren inicio de sesión rápido mediante **PIN numérico de 4 dígitos** en teclado táctil grande en pantalla?
  * ¿O prefieren el esquema clásico de **Usuario y contraseña** alfanumérica?

### Pregunta 2.5: En los filtros de Calidad, ¿el Inspector puede dictaminar directamente el destino o requiere firma/aprobación del Supervisor?
* **Contexto:** Actualmente 6 inspectores revisan los lotes en 4 estaciones de calidad.
* **Cuestión Pendiente:**
  * Si el Inspector marca "Rechazado", ¿el mismo inspector elige si se va a Reproceso a Pintura / Adorno en la pantalla, o el sistema debe requerir que el **Supervisor de Área** ingrese su PIN para autorizar a qué departamento regresa el lote?

### Pregunta 2.6: En el reporte de Destajo, ¿se requiere capturar mermas por culpa del operador para descontar de su pago semanal?
* **Contexto:** El sistema generará el preconteo semanal de destajo (piezas producidas x tarifa $/pza) los viernes con exportación a Excel.
* **Cuestión Pendiente:**
  * ¿El pago a destajo se calcula estrictamente sobre piezas buenas que salieron de su máquina, o existen penalizaciones/descuentos sobre el pago de nómina si una pieza fue dañada por negligencia del operador en esa máquina?
