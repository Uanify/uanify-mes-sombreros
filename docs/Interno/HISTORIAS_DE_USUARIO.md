# Historias de Usuario (User Stories) · Alcance Oficial MVP
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Documento Interno de Ingeniería y QA · Alineado al Diagrama de Flujo y Catálogo Oficial del MVP.*

> **Fecha:** Octubre 2026 | **Versión:** `v2.50.0`  
> **Planta Matriz:** San Francisco del Rincón, Gto. | **Cliente:** Tombstone Hats  
> **Reglas Clave:** Turno Único (07:00-15:30), Tablets T1 a T6, Filtros C1 a C5, $0 USD en APIs/licencias.

---

## Módulo 1: Programación, Loteo e Impresión (Ingeniería Admin)

### US-M1-01: Ingesta de Pedidos desde CONTPAQi SQL Server
- **Como:** Ingeniero de Producción / Administrador.
- **Quiero:** Consultar las órdenes de producción y pedidos pendientes leídos directamente desde SQL Server de CONTPAQi.
- **Para:** Evitar recapturas manuales en Excel y sincronizar el folio del pedido, modelo, cantidad y lista de materiales (BOM).
- **Criterios de Aceptación:**
  - Tabla de órdenes leídas con estado, modelo, piezas totales y cliente.
  - Sincronización local directa sin costos de licencias SDK.

### US-M1-02: Captura de Fecha Compromiso y Segmentación de Lotes y Sublotes
- **Como:** Ingeniero de Producción.
- **Quiero:** Registrar la fecha compromiso pactada con el cliente y segmentar la orden en lotes y sublotes según la planeación semanal.
- **Para:** Establecer el punto de partida de la trazabilidad y calcular el semáforo de entrega en piso.
- **Criterios de Aceptación:**
  - Asignación automática de folio de lote: `LOT-{AÑO}-{ORDEN}-{SECUENCIA}` (ej. `LOT-2026-0842-A`).
  - Definición de sublotes que se activarán posteriormente en Rampa/Alineado (T4).

### US-M1-03: Impresión de Tarjetas Viajeras con Código QR
- **Como:** Ingeniero de Producción.
- **Quiero:** Generar e imprimir hojas carta de oficina con las tarjetas viajeras y sus códigos QR listos para recortar.
- **Para:** Introducirlas en las fundas plásticas protectoras cosidas que viajan físicamente con el lote en piso.
- **Criterios de Aceptación:**
  - Hoja carta con QR legible, folio, modelo, talla, horma, fecha y tramo.
  - Bloqueo de impresión hasta que la segmentación de lotes sea confirmada.

---

## Módulo 2: Monitoreo de Piso, WIP por Almacén y Tablero de 5 KPIs

### US-M2-01: Visualización de Inventario en Proceso (WIP) en Tiempo Real
- **Como:** Director de Planta / Ingeniero de Producción.
- **Quiero:** Ver en una sola pantalla cuántos sombreros se encuentran detenidos o procesándose en cada estación y almacén intermedio.
- **Para:** Identificar cuellos de botella al instante y balancear las cargas de trabajo entre estaciones.
- **Criterios de Aceptación:**
  - Tarjetas por estación (T1 Prensas, T1 Alambrado, T2 Endopado, T3 Pintura, T4 Hidráulicas/Rampa, T5 Subensambles, T6 Adorno).
  - Contador de piezas y semáforo de saturación en buffer.

### US-M2-02: Tablero de 5 KPIs Industriales en Vivo
- **Como:** Director de Planta (Edmundo González) / Producción.
- **Quiero:** Consultar los 5 indicadores clave del turno sin hacer clics adicionales:
  1. **WIP en Vivo:** Piezas activas en piso por buffer.
  2. **Piezas por Área:** Conteo escaneado acumulado por estación en el turno.
  3. **Materiales vs. BOM:** Materia prima entregada vs consumo teórico CONTPAQi.
  4. **Mapeo de Reprocesos C1-C5:** Conteo de piezas rechazadas por estación de origen y causa raíz.
  5. **Entrega vs. Compromiso:** Semáforo visual (Verde: a tiempo, Ámbar: riesgo, Rojo: atrasado).
- **Para:** Tomar decisiones operativas inmediatas en sala de juntas o pasillo de planta.
- **Criterios de Aceptación:**
  - Actualización automática reactiva sin recargar página.
  - Diseño Light Mode industrial (`#8B5E3C` / Slate) legible a distancia.

---

## Módulo 3: Terminal Táctil de Piso (Supervisores y Tablets T1 a T6)

### US-M3-01: Escaneo Táctil de Tarjetas Viajeras (Cámara / Lector 2D)
- **Como:** Supervisor de Línea asignado a tablet (T1 a T6).
- **Quiero:** Escanear el código QR de la tarjeta viajera usando la cámara integrada o un lector USB/Bluetooth.
- **Para:** Registrar la entrada del lote a la estación en menos de 2 segundos sin teclear.
- **Criterios de Aceptación:**
  - Detección inmediata y despliegue de datos del lote (modelo, piezas, horma, siguiente paso).
  - Botones táctiles grandes (mínimo 44px de altura) optimizados para dedos con guantes o adhesivo.

### US-M3-02: Confirmación de Depósito en Almacén Intermedio
- **Como:** Supervisor de Línea.
- **Quiero:** Registrar el término del proceso en la estación y confirmar el depósito del lote en el buffer de salida.
- **Para:** Que el auxiliar o recolector de la siguiente estación sepa que el lote está disponible para traspaso.
- **Criterios de Aceptación:**
  - Registro de piezas conformes depositadas.
  - Descuento inmediato del WIP en la estación actual y traspaso al buffer siguiente.

### US-M3-03: Fraccionamiento de Lote Madre a 4 Sublotes de 15 Pzas (T4 · Rampa)
- **Como:** Supervisor en T4 (Hidráulicas - Alineado / Rampa).
- **Quiero:** Archivar el lote madre de 60 piezas y activar formalmente los 4 códigos QR de 15 piezas cada uno.
- **Para:** Adaptar el volumen de piezas al tamaño de las mesas de pre-adorno y adorno (T5/T6).
- **Criterios de Aceptación:**
  - Modal táctil de fraccionamiento con validación de suma exacta (15 x 4 = 60).
  - Trazabilidad heredada: cada sublote conserva modelo, O.P. y folio padre.

### US-M3-04: Captura de Paros de Máquina
- **Como:** Supervisor de Línea.
- **Quiero:** Declarar paros de línea con un toque (cambio de horma, falla de vapor, falta de material, ajuste mecánico).
- **Para:** Medir tiempos muertos reales y justificar la productividad del turno.
- **Criterios de Aceptación:**
  - Botón táctil prominente de paro.
  - Catálogo de motivos predefinidos sin necesidad de escribir texto libre.

---

## Módulo 4: Puntos de Control de Calidad e Inspección (Filtros C1 a C5)

### US-M4-01: Dictamen de Calidad en Filtros C1 a C5
- **Como:** Inspector de Calidad / Supervisor.
- **Quiero:** Inspeccionar físicamente el lote y seleccionar con un toque: **Aprobar** o **Rechazar**.
  - **C1:** Revisión de cuadros (previo a prensas).
  - **C2:** Calidad refuerzo (pistola).
  - **C3:** Calidad pintura.
  - **C4:** Calidad hidráulicas / alineado.
  - **C5:** Calidad final y terminado.
- **Para:** Evitar que defectos avancen a estaciones posteriores consumiendo mano de obra innecesaria.
- **Criterios de Aceptación:**
  - Aprobado: avanza automáticamente a la siguiente estación.
  - Rechazado: abre modal de resolución de defectos.

### US-M4-02: Resolución de Rechazos (Reproceso, Segundas y Mermas)
- **Como:** Supervisor / Ingeniero de Calidad.
- **Quiero:** Dictaminar las piezas rechazadas especificando cantidad, tipo y destino:
  - **Reproceso:** Envía las piezas a la estación de origen (C2 a Refuerzo, C3 a Pintura, C4 a Alineado, C5 a Adorno).
  - **Segunda:** Registra piezas con defectos cosméticos leves vendibles a menor precio.
  - **Merma:** Registra desperdicio irrecuperable y descuenta piezas del lote.
- **Para:** Alimentar el KPI de reprocesos y descontar inventario en CONTPAQi.
- **Criterios de Aceptación:**
  - Desglose numérico obligatorio: suma de Aprobadas + Reproceso + Segunda + Merma = Total lote.
  - Registro de motivo y causa raíz en la bitácora del lote.

---

## Módulo 5: Subensambles (T5) y Ficha Técnica Multiperspectiva

### US-M5-01: Semáforo de Buffer de Tafiletes y Toquillas (T5)
- **Como:** Supervisor de Adorno / Subensambles.
- **Quiero:** Ver el semáforo de disponibilidad de tafiletes por talla (55 a 60) y toquillas preparadas en buffer.
- **Para:** Garantizar que Adorno nunca se detenga por falta de componentes interiores o exteriores.
- **Criterios de Aceptación:**
  - Semáforo Verde (stock suficiente para la orden actual), Ámbar (stock justo), Rojo (falta stock).

### US-M5-02: Ficha Técnica Visual Multiperspectiva (AWS S3)
- **Como:** Operador / Inspector en Adorno (T6).
- **Quiero:** Ver fotos autorizadas del sombrero en alta resolución desde múltiples perspectivas (armado, doblado, toquilla, herraje, costura).
- **Para:** Contrastar físicamente la pieza con el estándar aprobado por el cliente antes de colocar el parche final y empacar.
- **Criterios de Aceptación:**
  - Carrusel o galería táctil rápida por modelo.
  - Carga optimizada de imágenes alojadas en repositorio estático/S3.

---

## Módulo 6: Pre-Nómina de Destajo y Reportes

### US-M6-01: Acumulado Semanal de Destajo por Operador
- **Como:** Administrador / Contador de Planta.
- **Quiero:** Consultar el número exacto de piezas procesadas por cada operador en el turno y su pago acumulado según su tarifa ($/pza).
- **Para:** Calcular la nómina de destajo semanal en minutos sin conciliar libretas de papel ni stickers extraviados.
- **Criterios de Aceptación:**
  - Tabla desglosada por operador, nómina, estación, piezas validadas y monto total en MXN.
  - Filtro por fecha, semana y estación.

### US-M6-02: Exportación de Nómina a Microsoft Excel
- **Como:** Contador / Recursos Humanos.
- **Quiero:** Descargar el reporte de destajo y producción en un archivo Excel (`.xlsx` o `.csv`) en un solo clic.
- **Para:** Importarlo directamente al sistema contable sin manipulación intermedia.
- **Criterios de Aceptación:**
  - Descarga limpia con encabezados estandarizados.

---

## Módulo 7: Microservicio Puente CONTPAQi SQL Server

### US-M7-01: Lectura Local de Catálogos y Pedidos ($0 Licencias)
- **Como:** Administrador del Sistema.
- **Quiero:** Que el microservicio lea las tablas de CONTPAQi Comercial en red local vía SQL Server sin consumir licencias SDK adicionales.
- **Para:** Mantener actualizados clientes, modelos, lista de materiales y órdenes sin costo recurrente.
- **Criterios de Aceptación:**
  - Conexión por red local mediante vistas y credenciales seguras.

### US-M7-02: Registro de Salida y Cierre de Orden en CONTPAQi
- **Como:** Supervisor de Embarque / Liberación (T6).
- **Quiero:** Que al liberarse el lote tras pasar C5, se inserte la entrada de producto terminado y se descuente la materia prima con el folio del lote en observaciones.
- **Para:** Cerrar el ciclo contable de inventarios de forma 100% automatizada.
- **Criterios de Aceptación:**
  - Inserción de registro de entrada con lote y fecha.
  - Alerta en pantalla si la conexión de red local estuviera temporalmente inaccesible.
