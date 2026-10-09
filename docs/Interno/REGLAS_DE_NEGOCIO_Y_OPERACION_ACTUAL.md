# Reglas de Negocio y Operación de Planta · Alcance Oficial MVP
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Directrices Operativas, Restricciones y Reglas de Negocio Validadas en Piso.*

> **Fecha:** Octubre 2026 | **Versión:** `v2.50.0`  
> **Planta Matriz:** San Francisco del Rincón, Gto. | **Cliente:** Tombstone Hats  
> **Interlocutores:** Edmundo González (Director) e Ing. Carlos Ortiz (Producción)

---

## 1. Régimen de Trabajo y Horarios

1. **Turno Único Obligatorio:** Lunes a Viernes de **07:00 a 15:30 hrs** (receso de comida: 12:00 a 12:45 hrs).
2. **Meta Diaria de Planta:** **850 piezas terminadas/día** (4,250 pzas/semana).
3. **Takt Time Estándar:** **42 segundos por pieza**.
4. **Prohibición de Múltiples Turnos:** Queda prohibido habilitar selectores de "Turno 2" o "Turno 3" en el sistema.

---

## 2. Unidades de Manejo y Trazabilidad

1. **Lote Principal:** Nace en **T1 Prensas** tras la unión de copa y falda. Toda la fase húmeda y de pintura transita en lotes definidos por el usuario según la orden.
2. **Fraccionamiento a Sublotes:** Se realiza en **T4 Hidráulicas - Alineado / Rampa** dividiéndose en sublotes según la planeación del usuario para el secado y mesas de pre-adorno y adorno.
3. **Identificación Física:** Cada lote o sublote viaja con una **Tarjeta Viajera con Código QR** impresa en hoja carta dentro de una funda plástica transparente cosida.
4. **Cero Login para Operadores:** Los operadores no acceden al software. Su trabajo es registrado por el Supervisor de su área mediante escaneo QR y captura de destajo.

---

## 3. Matriz de Tablets de Piso y Puntos de Calidad

| Estación / Tablet | Departamento Físico | Operación Real | Filtro de Calidad Asociado |
|---|---|---|---|
| **T1** | Prensas | Unión copa-falda (nace lote 60 pzas), replanchado y refaldeo | **C1** (revisión cuadros previo a prensas) |
| **T1** | Alambrado | Recorte de falda, inserción de alambre y costura | - |
| **T2** | Endopado | Baño químico de rigidez con alambre | - |
| **T3** | Pintura | Refuerzo a pistola, pintura y brillo | **C2** (refuerzo) y **C3** (pintura) |
| **T4** | Hidráulicas / Alineado | Alineado final y fraccionamiento a 15 pzas | **C4** (hidráulicas y geometría) |
| **T4** | Pre-adorno | Perforado y pegado de tafilete | - |
| **T5** | Subensambles | Buffer de tafiletes por talla (55-60) y toquillas | Semáforo de disponibilidad |
| **T6** | Adorno | Colocación de etiquetas, parche, toquilla y empaque | **C5** (calidad final antes de empaque) |
| **T6** | Liberación / Embarque | Registro de entrega al cliente y enlace CONTPAQi | Cierre de orden |

---

## 4. Gestión de Defectos y Calidad (Filtros C1 a C5)

1. **Aprobado:** Lote completo avanza inmediatamente a la siguiente estación.
2. **Reproceso:** Las piezas defectuosas retornan obligatoriamente a la estación que originó el defecto:
   - C2 regresa a Pintura-Refuerzo.
   - C3 regresa a Pintura.
   - C4 regresa a Prensas Hidráulicas.
   - C5 regresa a Adorno.
3. **Segunda:** Piezas con fallas estéticas menores no reprocesables; se etiquetan para venta con descuento y se registran en el KPI.
4. **Merma:** Piezas inservibles destruidas; se descuentan formalmente de la orden en el ERP para ajuste de inventario.

---

## 5. Integración con CONTPAQi Comercial

1. **Lectura SQL Server ($0 Licencias):** Lectura directa de pedidos y listas de materiales (BOM) en la red local.
2. **Escritura al Liberar:** Al concluir en T6, el microservicio inserta la entrada de producto terminado anotando el número de lote MES en el campo de observaciones, descargando los componentes teóricos consumidos.
