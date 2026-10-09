# Catálogo Maestro de Casos de Prueba (QA) · Alcance Oficial MVP
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Matriz de Pruebas de Calidad, Validación de Piso y Criterios de Aceptación.*

> **Fecha:** Octubre 2026 | **Versión:** `v2.50.0`  
> **Planta Matriz:** San Francisco del Rincón, Gto. | **Cliente:** Tombstone Hats  
> **Estructura:** 7 Módulos Oficiales del MVP, Tablets T1 a T6, Filtros C1 a C5 y Casos Límite de Planta.

---

## Módulo 1: Programación, Loteo e Impresión (Ingeniería Admin)

| ID | Caso de Prueba | Tipo | Entrada / Pasos | Resultado Esperado | Estatus |
|---|---|---|---|---|---|
| **TC-M1-01** | Lectura de pedidos desde SQL Server local | Integración | Sincronizar catálogo desde vista `vw_PedidosPendientes`. | Se despliegan órdenes con folio, modelo, cliente y piezas sin errores de red. | Pasa |
| **TC-M1-02** | Creación de lote madre de 60 piezas | Funcional | Seleccionar O.P. de 120 pzas y generar lotes. | Genera exactamente 2 lotes madre de 60 pzas con folios secuenciales. | Pasa |
| **TC-M1-03** | Lote remanente menor a 60 piezas | Borde | O.P. de 85 pzas. | Genera 1 lote de 60 pzas y 1 lote de 25 pzas debidamente rotulado. | Pasa |
| **TC-M1-04** | Registro de fecha compromiso de entrega | Validación | Capturar fecha compromiso menor a fecha actual. | Sistema previene captura o emite advertencia de fecha extemporánea. | Pasa |
| **TC-M1-05** | Impresión de tarjetas viajeras en hoja carta | Físico / Print | Clic en "Imprimir Tarjetas QR". | Formato imprimible en hoja carta con QR nítido, datos legibles y márgenes de corte. | Pasa |

---

## Módulo 2: Monitoreo de Piso, WIP por Almacén y Tablero de 5 KPIs

| ID | Caso de Prueba | Tipo | Entrada / Pasos | Resultado Esperado | Estatus |
|---|---|---|---|---|---|
| **TC-M2-01** | Actualización en vivo del WIP por buffer | Reactividad | Completar lote en T1 Prensas y depositar en buffer. | WIP de Prensas decrementa y buffer hacia T1 Alambrado incrementa de inmediato. | Pasa |
| **TC-M2-02** | KPI 1: Piezas activas en piso | Precisión | Consultar total de piezas en planta. | Suma coincide exactamente con la suma de lotes en estaciones y buffers. | Pasa |
| **TC-M2-03** | KPI 2: Piezas producidas por área en el turno | Precisión | Escanear salida de 3 lotes de 60 pzas en T1. | Contador acumula exactamente 180 piezas en el turno actual. | Pasa |
| **TC-M2-04** | KPI 3: Consumo de materiales vs BOM | Cálculo | Comparar consumo reportado vs lista teórica de O.P. | Muestra delta porcentual (dentro de tolerancia ±2% o alerta de sobreconsumo). | Pasa |
| **TC-M2-05** | KPI 4: Mapeo de reprocesos C1-C5 con causa raíz | Trazabilidad | Registrar rechazo en filtro C3 (Pintura). | Gráfica y tabla incrementan reproceso en C3 con motivo registrado. | Pasa |
| **TC-M2-06** | KPI 5: Semáforo de entrega vs compromiso | Visual | Consultar orden con entrega hoy vs vencida. | Muestra badge verde (a tiempo), amarillo (<24h) o rojo (vencida). | Pasa |

---

## Módulo 3: Terminal Táctil de Piso (Supervisores y Tablets T1 a T6)

| ID | Caso de Prueba | Tipo | Entrada / Pasos | Resultado Esperado | Estatus |
|---|---|---|---|---|---|
| **TC-M3-01** | Lectura QR vía cámara en tablet (Redmi Pad SE) | Hardware | Presentar tarjeta física frente a la cámara de la tablet. | Enfoque y lectura exitosa en < 1.5 segundos; carga ficha de lote en pantalla. | Pasa |
| **TC-M3-02** | Lectura QR vía escáner óptico 2D (HID) | Hardware | Escanear código con pistola 2D USB/Bluetooth. | Input captura cadena QR y dispara búsqueda automática sin presionar enter. | Pasa |
| **TC-M3-03** | Depósito táctil en almacén intermedio | Ergonomía | Pulsar botón "Confirmar Depósito" (altura >42px). | Registra fecha/hora, estación, usuario y mueve el lote al buffer de salida. | Pasa |
| **TC-M3-04** | División de lote en 4 sublotes de 15 pzas en T4 | Regla Crítica | En T4 (Alineado/Rampa), ejecutar fraccionamiento. | Lote de 60 pasa a estado "Fraccionado"; se activan sublotes -1, -2, -3 y -4 de 15 pzas. | Pasa |
| **TC-M3-05** | Validación de suma al fraccionar | Validación | Intentar fraccionar 60 piezas en sublotes que sumen 58. | Sistema bloquea guardado y exige cuadre exacto de unidades. | Pasa |
| **TC-M3-06** | Registro ágil de paros de máquina | Operativo | Clic en "Paro de Línea" > seleccionar "Cambio de Horma". | Inicia cronómetro de paro y notifica al tablero Andon sin bloquear la app. | Pasa |

---

## Módulo 4: Puntos de Control de Calidad e Inspección (Filtros C1 a C5)

| ID | Caso de Prueba | Tipo | Entrada / Pasos | Resultado Esperado | Estatus |
|---|---|---|---|---|---|
| **TC-M4-01** | Inspección en Filtro C1 (Revisión de cuadros) | Flujo Calidad | Validar cuadros de telar antes de prensas. | Si pasa, autoriza ingreso a T1 Prensas; si no, descuenta lienzo defectuoso. | Pasa |
| **TC-M4-02** | Inspección en Filtro C2 (Refuerzo a pistola) | Flujo Calidad | Calidad en refuerzo: dictaminar "Rechazado". | Modal permite enviar piezas a reproceso en D06_REF sin cancelar el lote. | Pasa |
| **TC-M4-03** | Inspección en Filtro C3 (Pintura) | Flujo Calidad | Calidad tras pintura: enviar 2 piezas a reproceso. | 58 piezas avanzan a C3 Brillo; 2 piezas quedan en retrabajo de pintura. | Pasa |
| **TC-M4-04** | Inspección en Filtro C4 (Hidráulicas / Alineado) | Flujo Calidad | Revisión geométrica y de copa en T4. | Si aprueba, avanza a T1 Refaldeo; si falla, reingresa a prensa hidráulica. | Pasa |
| **TC-M4-05** | Inspección en Filtro C5 (Calidad Final) | Flujo Calidad | Revisión de adorno, parche, toquilla y empaque. | Aprobado habilita salida a Producto Terminado; rechazo regresa a adorno. | Pasa |
| **TC-M4-06** | Dictamen de Segundas y Mermas | Inventario | Lote de 15 pzas: 13 Aprobadas, 1 Segunda, 1 Merma. | Suma 15. Merma se descuenta; Segunda se etiqueta con precio especial. | Pasa |

---

## Módulo 5: Subensambles (T5) y Ficha Técnica Multiperspectiva

| ID | Caso de Prueba | Tipo | Entrada / Pasos | Resultado Esperado | Estatus |
|---|---|---|---|---|---|
| **TC-M5-01** | Semáforo de tafiletes por talla (55 a 60) | Visual / Buffer | Consultar disponibilidad de talla 57 requerida por O.P. | Muestra cantidad disponible y color (verde: cubierto, rojo: faltante). | Pasa |
| **TC-M5-02** | Consulta de Ficha Técnica Multiperspectiva | UI / UX | Abrir ficha técnica de modelo Denver 1000X. | Despliega fotos autorizadas (frente, perfil, toquilla, forro, doblado) con zoom. | Pasa |
| **TC-M5-03** | Carga rápida sin degradación de red de planta | Rendimiento | Consultar fotos en tablet con WiFi estándar. | Imágenes optimizadas cargan en < 1 segundo sin congelar la interfaz. | Pasa |

---

## Módulo 6: Pre-Nómina de Destajo y Reportes

| ID | Caso de Prueba | Tipo | Entrada / Pasos | Resultado Esperado | Estatus |
|---|---|---|---|---|---|
| **TC-M6-01** | Cálculo acumulado por operador y tarifa | Financiero | Operador con 240 piezas en Prensas a $3.50/pza. | Total acumulado calculado exactamente en $840.00 MXN. | Pasa |
| **TC-M6-02** | Filtro semanal de nómina | Filtro | Seleccionar semana actual de Lunes a Viernes. | Agrupa registros únicamente del turno único y fechas comprendidas. | Pasa |
| **TC-M6-03** | Exportación de reporte a Microsoft Excel | Descarga | Clic en botón "Exportar Excel (.xlsx)". | Genera y descarga archivo estructurado con columnas completas y totales. | Pasa |

---

## Módulo 7: Microservicio Puente CONTPAQi SQL Server

| ID | Caso de Prueba | Tipo | Entrada / Pasos | Resultado Esperado | Estatus |
|---|---|---|---|---|---|
| **TC-M7-01** | Conexión a base de datos de CONTPAQi | Conectividad | Ejecutar test de conexión a SQL Server en red local. | Conexión exitosa sin necesidad de licencias SDK o DLLs de cobro. | Pasa |
| **TC-M7-02** | Inserción de entrada de producto terminado | Escritura | Lote supera C5 y se libera en T6. | Procedimiento almacenado inserta entrada con folio de lote en observaciones. | Pasa |
| **TC-M7-03** | Tolerancia a cortes de red local | Resiliencia | Simular caída temporal de WiFi al liberar lote. | Sistema guarda en cola local (`localStorage`) y reintenta sincronizar al reconectar. | Pasa |
