# Guía de Decisión: CONTPAQi (Compaq) ↔ Uanify MES
**Reunión con Compras, Almacén y Soporte CONTPAQi**  
*Objetivo: Evaluar el uso real de CONTPAQi, definir si conviene pagar integración o si operamos gratis y de forma autónoma.*

---

## 1. Decisión Central: ¿Pagar o No Pagar CONTPAQi?

| Área | ¿Usa CONTPAQi hoy? | ¿Se necesita para el MES? | Decisión Económica |
| :--- | :--- | :--- | :--- |
| **Producción (Piso)** | **NO.** Se maneja con tarjetas viajeras y papel. | **NO.** El MES opera 100% autónomo con QR y base local. | **$0.** No se requiere nada de CONTPAQi en piso. |
| **Recepción (Entradas)** | Compras genera OC y Almacén recibe con papel/factura. | Solo para leer qué material llegó (código, cantidad, proveedor). | **No pagar licencias extras.** Si cobran por conectar APIs, usamos lectura directa SQL ($0) o lectura directa de XML ($0). |
| **Embarque (Salidas)** | Usan vale de papel y Excel; luego facturan manual en COMPAC. | El MES genera el vale digital de salida. | **$0.** Contabilidad factura con el reporte digital del MES. |

> **Criterio Clave:** No pagar pólizas, módulos SDK ni licencias adicionales. El MES puede operar sin costo extra.

---

## 2. Antecedentes Validados en Planta

- **Soporte actual:** Póliza anual con una ingeniera externa (no hay desarrollador interno).
- **Riesgo de licencia:** Carlos advirtió en audio: *"Hay licencias que si quieres integrar con otros softwares, te bloquea"*.
- **Infraestructura:** La fábrica ya tiene servidor físico en red local (LAN), módem de fibra y repetidores Wi-Fi.
- **Piso:** Operarios tienen prohibido el celular. Todo el escaneo lo hacen supervisores/almacenistas en terminales fijas o tablets de uso rudo.

---

## 3. Postura en la Mesa

| Rol | Preocupación típica | Mensaje clave a transmitir |
| :--- | :--- | :--- |
| **Compras** | "Me van a cambiar cómo compro o pedir doble captura." | Su proceso en CONTPAQi sigue idéntico; el MES solo lee lo que ya capturan. |
| **Almacén** | "El sistema me va a quitar tiempo en muelle." | En vez de cotejar papel y capturar en PC, validan en pantalla táctil y sale el QR del lote. |
| **Ing. CONTPAQi** | "Van a mover mi base de datos" o intentará vender módulos. | **Postura:** No escribimos datos (solo consulta `SELECT`). Si cobran por APIs, no las compramos; usamos lector de XML. |

---

## 4. Preguntas Concretas para la Reunión (Con Justificación y Detalle)

### A. Con la Ingeniera de CONTPAQi (Técnico / Costo)

1. **¿Qué producto y versión exacta tienen instalada?**
   - *Por qué importa:* Si es *CONTPAQi Comercial Premium*, la base de datos corre nativa sobre Microsoft SQL Server en la red local. Eso nos permite hacer consultas directas de forma estándar, rápida y limpia.
2. **¿Conectar o consultar requiere comprar licencias SDK, módulos adicionales o pagar póliza de desarrollo?**  
   - *Criterio de decisión:* Si la respuesta es SÍ → **Se descarta pagar inmediatamente.** Uanify MES no depende de su API ni vamos a encarecer el proyecto por trabas de licenciamiento de CONTPAQi.
3. **¿Nos autoriza un usuario de base de datos de Solo Lectura (`db_datareader`)?**  
   - *Detalle técnico para ella:* No vamos a alterar tablas, no ejecutaremos `INSERT`, `UPDATE` ni `DELETE`. Solo requerimos permisos de consulta `SELECT` sobre tablas de documentos y movimientos de compras. Es la práctica estándar de la industria, toma 5 minutos configurarlo en SQL Server Management Studio y tiene **cero riesgo de corrupción de datos**.
4. **¿Manejan una sola empresa en la BD o varias razones sociales?**
   - *Por qué importa:* Saber si compran con una razón social y facturan con otra, para apuntar la consulta a la base de datos correcta.

### B. Con Compras y Almacén (Operación Fina de Entrada)

1. **¿Cuál es el documento físico o digital exacto con el que el chofer entrega en muelle?**
   - *Por qué importa:* Necesitamos saber si el almacenista tiene en la mano la copia de la Orden de Compra interna, la Remisión de entrega del proveedor, o la Factura impresa con su archivo XML.
2. **¿En qué momento exacto entra el material a CONTPAQi?**  
   - *Dilema operativo:* ¿Capturan una *"Recepción de Compra"* al momento en que el camión descarga? ¿O el material se baja a piso y se espera 3 a 5 días hasta que el proveedor manda el XML formal para capturarlo en CONTPAQi?
   - *Impacto:* Si esperan días a que llegue la factura, **conectar el MES a las facturas de CONTPAQi frenaría la fábrica**. En ese caso, el lote del MES debe nacer de la Orden de Compra previa o de la remisión física para que producción arranque de inmediato.
3. **Catálogo de Materiales y Lotes de Proveedor:**
   - ¿Las materias primas (rollos de toquilla, campanas de fieltro, conos de hilo, herrajes) ya tienen un código interno estandarizado en CONTPAQi o usan descripciones libres?
   - ¿Registran en algún campo el número de lote del proveedor o pedimento aduanal para trazabilidad?
4. **Entregas Parciales y Rechazos de Calidad:**
   - Si pidieron 5,000 toquillas y llegaron 3,200: ¿CONTPAQi deja el saldo pendiente en automático en la misma orden o exige crear otra?
   - Si al descargar se detecta materia prima defectuosa (fieltro manchado o paja rota): ¿se rechaza en el momento sin registrar entrada, o se registra todo y luego se tramita una nota de crédito/devolución?

---

## 5. Las 3 Opciones de Conexión: Detalle Técnico y Decisión

| Opción | Método | Costo | Dependencia | Viabilidad |
| :--- | :--- | :---: | :---: | :--- |
| **1. SQL Directo (Recomendada)** | Consultas `SELECT` en red local a tablas de compras (`admDocumentos`, `admMovimientos`). | **$0** | Mínima (solo usuario de lectura). | **Alta.** Inmediata si la ingeniera da acceso. |
| **2. SDK CONTPAQi** | Librerías oficiales de CONTPAQi. | **Variable / Alto** | Alta (licencias y soporte). | **Solo si ya está pagado.** Si cobran, descartar. |
| **3. Lector XML CFDI (Autónoma)** | Almacén carga el XML de la factura del proveedor al MES. | **$0** | **Cero dependencia de CONTPAQi.** | **100% viable.** Plan infalible si CONTPAQi pone trabas o cobros. |

### Cómo funciona cada alternativa en la práctica:

* **Opción 1 — SQL Server Directo (Vía Rápida e Invisible):**  
  Instalamos un conector local ligero en el servidor de la planta. Cuando Almacén recibe un camión, la tablet del MES consulta por red local las órdenes de compra autorizadas en CONTPAQi. El almacenista toca la orden en pantalla, valida las piezas y se generan los códigos QR de los lotes al instante. **Cero doble captura, cero costo de licencias.**
* **Opción 2 — SDK Oficial de CONTPAQi:**  
  Solo se toma en cuenta si la ingeniera demuestra que la membresía anual que ya pagan ya incluye las librerías activadas y no requiere cobrar honorarios extras de desarrollo. Si pide un solo peso adicional, **se descarta en la misma reunión**.
* **Opción 3 — Recepción Autónoma por Archivo XML (El Respaldo Infalible):**  
  Si la ingeniera de CONTPAQi pone pretextos técnicos, burocracia o pretende cobrar licencias caras: **no nos detenemos ni gastamos un peso**. El proveedor siempre envía el archivo `.XML` del CFDI por correo. Uanify MES cuenta con un lector nativo de XML: el almacenista arrastra el XML a la tablet, el sistema lee automáticamente el RFC, productos, cantidades y descripciones, y emite las etiquetas QR de lote en 2 segundos. **Cero pesos, cero ataduras y 100% de autonomía para la planta.**

---

## 6. Acuerdos al Salir de la Reunión

- [ ] **Decisión económica tomada:** ¿Cobran por conectar CONTPAQi? (Si cobran → Nos vamos por Opción 3: XML directo sin costo).
- [ ] **Ficha técnica:** Versión exacta de software y motor de BD (ej. *Comercial Premium v10 / SQL Server 2019 LAN*).
- [ ] **Autorización del usuario de lectura:** Visto bueno de la ingeniera para crear `uanify_reader` con rol `db_datareader`.
- [ ] **Muestras de datos reales recopiladas:**
  - 1 Orden de Compra real con partidas (PDF o captura).
  - 1 Documento de Entrada / Recepción de Almacén.
  - 1 Archivo XML de factura de proveedor representativo (fieltro, paja o toquilla).
- [ ] **Contacto directo de la Ingeniera Externa:** Teléfono y correo para agendar la sesión técnica de prueba de 15 minutos.
