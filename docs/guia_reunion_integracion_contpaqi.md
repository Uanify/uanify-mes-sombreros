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

## 4. Preguntas Concretas para la Reunión

### A. Con la Ingeniera de CONTPAQi (Técnico / Costo)
1. **¿Qué versión exacta tienen?** (Ej. Comercial Premium sobre SQL Server local).
2. **¿Conectar requiere pagar licencias o módulos extra?**  
   - Si la respuesta es SÍ → **Se descarta pagar.**
3. **¿Nos autoriza un usuario de base de datos de Solo Lectura (`db_datareader`)?**  
   - Cero riesgo, sin costo y sin modificar datos de CONTPAQi.
4. **¿Manejan una sola empresa en la BD o varias razones sociales?**

### B. Con Compras y Almacén (Operación de Entrada)
1. **¿Con qué documento físico llega el camión?** (¿Copia de OC, Remisión del proveedor o Factura impresa?).
2. **¿En qué momento dan entrada al sistema?**  
   - ¿Al descargar el camión o esperan días a que llegue la factura formal?  
   - *(Si esperan días, el MES debe recibir con la OC o remisión para no parar planta).*
3. **¿Tienen códigos estandarizados de materias primas y capturan lote de proveedor?**
4. **¿Cómo gestionan entregas parciales y rechazos de calidad en muelle?**

---

## 5. Las 3 Opciones de Conexión

| Opción | Método | Costo | Dependencia | Viabilidad |
| :--- | :--- | :---: | :---: | :--- |
| **1. SQL Directo (Recomendada)** | Consultas `SELECT` en red local a tablas de compras (`admDocumentos`). | **$0** | Mínima (solo usuario de lectura). | **Alta.** Inmediata si la ingeniera da acceso. |
| **2. SDK CONTPAQi** | Librerías oficiales de CONTPAQi. | **Variable / Alto** | Alta (licencias y soporte). | **Solo si ya está pagado.** Si cobran, descartar. |
| **3. Lector XML CFDI (Autónoma)** | Almacén carga el XML de la factura del proveedor al MES. | **$0** | **Cero dependencia de CONTPAQi.** | **100% viable.** Plan infalible si CONTPAQi pone trabas o cobros. |

---

## 6. Acuerdos al Salir de la Reunión

- [ ] ¿Cobran por conectar CONTPAQi? (Si cobran → Nos vamos por Opción 3: XML directo).
- [ ] Versión exacta de software y motor de BD (ej. SQL Server 2019 LAN).
- [ ] Visto bueno para usuario SQL de solo lectura (`uanify_reader`).
- [ ] Copia o captura de: 1 Orden de Compra real, 1 Entrada de Almacén y 1 archivo XML de proveedor.
- [ ] Contacto de la ingeniera externa (teléfono y correo) para prueba técnica de 15 min.
