# Guía Ejecutiva y Técnica: Integración CONTPAQi (Compaq) ↔ MES
**Objetivo de la Reunión:** Conocer el uso actual del sistema CONTPAQi en Compras y Almacén, evaluar la viabilidad técnica para consultar/leer información de entradas de mercancía y definir el flujo para la recepción en planta y generación inicial de lotes en el MES.

---

## 1. Contexto General y Propósito

### ¿Qué queremos resolver?
Actualmente, el proceso de compra y recepción inicial se gestiona a través de CONTPAQi (Comercial / Factura Electrónica / Producción). Para evitar la doble captura y asegurar trazabilidad desde el minuto cero:
- **Deseamos que el MES lea automáticamente** las Órdenes de Compra (OC), Recepciones o Facturas de Proveedores registradas en CONTPAQi.
- **Evitar errores humanos** de captura manual de material, código de proveedor, unidades y cantidades al momento de recibir en el muelle de planta.
- **Alimentar el inicio del flujo MES:** cuando Almacén recibe materia prima (paja, fieltros, herrajes, toquillas, etc.) o libera material a la línea, el MES debe conocer previamente qué lote/orden de compra autorizada respalda esa entrada.

---

## 2. Mapa Rápido de Participantes y Expectativas

| Rol | Persona / Área | Qué esperamos descubrir en la reunión |
| :--- | :--- | :--- |
| **Compras** | Compras / Adquisiciones | ¿En qué momento se crea la Orden de Compra? ¿Cuándo se considera autorizada? ¿Qué catálogo de códigos de producto usan? |
| **Almacén Materia Prima** | Almacenistas / Recepción | ¿Qué documento físico o digital usan para recibir (Remisión, Factura XML, OC impresa)? ¿Cómo dan entrada hoy en el sistema? |
| **Sistemas / Asesor CONTPAQi** | TI / Soporte CONTPAQi | ¿Qué versión exacta tienen instalada? ¿Cómo está la base de datos (SQL Server)? ¿Hay APIs, SDK, o acceso a vistas de base de datos? |

---

## 3. Cuestionario Clave para la Reunión

### Bloque A: Operación Actual en CONTPAQi (El "Día a Día")
1. **¿Qué producto exacto de CONTPAQi utilizan para Compras y Almacén?**
   - *(¿CONTPAQi Comercial Premium, Comercial Pro, AdminPAQ, o Factura Electrónica?)*
2. **¿Cuál es el flujo estándar desde que compran hasta que el material entra al almacén?**
   - *¿Requisición → Orden de Compra → Recepción de Mercancía → Factura/Compra?*
3. **¿En qué momento exacto se da la entrada formal al inventario en CONTPAQi?**
   - ¿Se captura una "Recepción de Compra" antes de que llegue la factura?
   - ¿O esperan a tener el XML/Factura del proveedor para registrar la compra en el sistema?
4. **¿Cómo se identifican los materiales en CONTPAQi?**
   - ¿Tienen códigos internos estandarizados para materias primas (ej. rollos de toquilla, hormas, fieltros, cintas)?
   - ¿Manejan número de lote del proveedor o pedimento aduanal dentro de CONTPAQi?

---

### Bloque B: Viabilidad Técnica de Consulta y Lectura (Hacia el Asesor de Sistemas/Compaq)
1. **¿Dónde está instalada la base de datos de CONTPAQi?**
   - ¿Está en un servidor local dentro de la red de planta (LAN)? ¿En la nube / hosting remoto?
   - Motor de base de datos: *(Típicamente Microsoft SQL Server en las versiones actuales).*
2. **¿Se nos puede otorgar un usuario de base de datos con permisos estrictamente de "Solo Lectura" (`db_datareader`)?**
   - *Nota de tranquilidad para el asesor:* **No pretendemos escribir ni modificar tablas de CONTPAQi directamente**, únicamente consultar mediante vistas o queries SQL (`SELECT`) las órdenes de compra autorizadas y documentos de recepción.
3. **Alternativas técnicas reconocidas por CONTPAQi:**
   - **Opción 1 (Recomendada y más ágil):** Vistas SQL directas en modo lectura a las tablas de documentos (`admDocumentos`, `admMovimientos`, `admProductos`).
   - **Opción 2 (SDK Oficial de CONTPAQi):** ¿Cuentan con licencias del SDK de CONTPAQi Comercial para integración por servicios?
   - **Opción 3 (Exportaciones programadas / Webhooks):** ¿Tienen algún proceso que exporte reportes en Excel, XML o CSV a una carpeta compartida de red cada cierto intervalo?

---

### Bloque C: Casos Especiales y "Fricciones" Operativas
1. **¿Qué pasa con entregas parciales?**
   - Si se ordenaron 100 docenas de toquillas y el proveedor solo entrega 40 hoy: ¿CONTPAQi genera recepciones parciales ligadas a la misma Orden de Compra?
2. **¿Qué ocurre si llega material sin Orden de Compra previa o urgente?**
   - ¿Cómo lo gestiona Almacén hoy en día?
3. **Devoluciones o material rechazado por Calidad:**
   - Si en el muelle de recepción Calidad rechaza materia prima defectuosa: ¿se regresa de inmediato sin registrar entrada, o se hace una devolución sobre compra en CONTPAQi?

---

## 4. Opciones de Arquitectura para Conectar con Nuestro MES

```
[CONTPAQi SQL Server] 
         │ (Solo Lectura / Query SELECT)
         ▼
[Servicio Conector MES (Bridge)]
         │ (JSON / REST API Local)
         ▼
[Módulo de Recepción MES] ───► Generación de QR de Lote de Materia Prima
```

1. **Nivel 1 — Lectura Directa SQL (Rápida, No invasiva, Cero costo de licencias):**
   - Creamos un puente local seguro que hace consultas de solo lectura cada X minutos o bajo demanda cuando el almacenista teclea o escanea el folio de la Orden de Compra.
2. **Nivel 2 — Integración vía SDK / API de CONTPAQi:**
   - Más formal, pero requiere que el servidor tenga instalado el SDK de CONTPAQi y puede implicar configuraciones adicionales de licenciamiento.
3. **Nivel 3 — Lectura de XML del Proveedor (Plan B de contingencia):**
   - Si por políticas no hubiera acceso a la base de datos de CONTPAQi, el MES puede tener un lector del archivo XML/PDF de la factura del proveedor en el momento de recepción.

---

## 5. Próximos Pasos y Entregables Deseables al Terminar la Reunión

Al cerrar la sesión, debemos salir con los siguientes acuerdos concretos:
- [ ] Versión exacta de CONTPAQi en uso y tipo de base de datos.
- [ ] Decisión sobre si nos autorizan crear un usuario de consulta SQL de solo lectura en la red local.
- [ ] Diccionario o ejemplo de 1 factura/orden de compra real para conocer la estructura de datos (nombres de campos: código de material, descripción, cantidad, folio, fecha, proveedor).
- [ ] Persona de contacto técnico (asesor externo o interno) con quien coordinar la prueba de conexión.
