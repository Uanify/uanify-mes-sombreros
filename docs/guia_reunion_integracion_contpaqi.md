# Dossier Estratégico y Técnico: Conexión CONTPAQi (Compaq) ↔ Uanify MES
**Para uso exclusivo de los Socios / Directores de Uanify**  
*Consolidación de audios de levantamiento en planta (Carlos e Ing. Externa), minutas y arquitectura técnica del MES para la reunión con Compras, Almacén y el Proveedor de Software CONTPAQi.*

---

## 1. Antecedentes Clave Extraídos de las Transcripciones y Audios de Planta

En las sesiones previas de levantamiento con Carlos (Ingeniero de Procesos) y Edmundo (Dirección), se confirmaron aspectos críticos sobre cómo opera hoy CONTPAQi en la empresa:

1. **La "Ingeniera Externa de Soporte":**
   - La empresa no cuenta con un desarrollador interno de CONTPAQi.
   - Pagan una **membresía anual de soporte** con una ingeniera externa certificada por CONTPAQi.
   - *Cita de Carlos en audio:* *"Tenemos una persona que nos ayuda con el Compact. Es una muchacha, es una ingeniera. Ella es de Compact. Es una membresía que se paga anual. Tenemos el servicio de todo lo de la contabilidad, la facturación."*
2. **El "Bloqueo" por tipo de licencia:**
   - *Advertencia textual de Carlos en audio:* *"Hay unas licencias que a lo mejor te dan lo que necesites, pero si quieres hacer integraciones con otros softwares, pues te bloquea."*
   - Por ello, **no podemos asumir que tienen el SDK o API de CONTPAQi habilitado**, ni debemos depender de que compren módulos caros adicionales.
3. **El flujo real de salida y entrada actual (El "Puente de Papel y Excel"):**
   - Actualmente, los pedidos y entregas operan con hojas de Excel y vales físicos en papel:
     > *"Viene el cliente, trae su camioneta, se genera un vale de salida donde se pone todo el producto que se les entrega. Ese vale, en un Excel se tienen capturadas las órdenes de producción y se va descontando lo que se va entregando. El vale pasa a contabilidad y sobre ese vale se hace la facturación del cliente en COMPAC."*
   - **En Compras / Recepción de Materia Prima ocurre exactamente lo mismo:** Compras genera la OC o recibe facturas; Almacén recibe en muelle con remisiones o facturas impresas, y luego se captura en CONTPAQi a mano para "dar entrada".
4. **El objetivo primordial de Uanify MES:**
   - **Al Inicio (Recepción):** El MES debe leer la Orden de Compra / Recepción de CONTPAQi para que el almacenista, al recibir materia prima (fieltros, paja, toquillas, herrajes), valide cantidades con un clic/escaneo y genere de inmediato el código QR del lote inicial sin recaptura manual.
   - **Al Final (Embarque):** El MES genera el vale de salida digital para la camioneta y le reporta a CONTPAQi lo entregado para su facturación automática.

---

## 2. Mapa de Personas en la Mesa y su Psicología en la Reunión

| Participante | Su Rol / Interés | Su Miedo o Resistencia Típica | Cómo abordarlo / Argumento clave |
| :--- | :--- | :--- | :--- |
| **Responsable de Compras** | Emitir OC a proveedores de fieltros, telas, toquillas, cajas. | *“Me van a pedir capturar el doble o cambiar cómo compro.”* | El proceso de compra no cambia en CONTPAQi; el MES solo tomará lo que ellos ya capturan para facilitarle la vida a Almacén. |
| **Encargado de Almacén** | Recibir camiones en muelle, contar bultos/piezas y acomodar. | *“El sistema me va a quitar tiempo o no sé usar software complejo.”* | Con Uanify, en vez de cotejar papel contra bulto y luego ir a teclear a una PC, el sistema le muestra la OC en pantalla táctil y al dar OK imprime/genera el QR del lote. |
| **Ingeniera Externa de CONTPAQi** | Soporte técnico, estabilidad de la base de datos y cobro de póliza. | *“Van a meter mano a mi base de datos, desconfigurar algo y me van a culpar.”* | **Tranquilidad absoluta:** No vamos a escribir datos en CONTPAQi. Solicitamos un usuario SQL de **Solo Lectura (`SELECT` / `db_datareader`)** o vistas específicas. Cero riesgo de corrupción. |

---

## 3. Cuestionario Quirúrgico (Preguntas Clave para el Socio)

Tu socio debe llevar estas preguntas anotadas. Están divididas por área para no revolver temas:

### Bloque A: A la Ingeniera Externa / TI (Técnico y Licenciamiento)
1. **¿Qué producto y versión exacta tienen instalada?**
   - *¿Es CONTPAQi Comercial Premium, Comercial Pro, Factura Electrónica o el antiguo AdminPAQ?*
   - *(Dato vital: Comercial Premium maneja base de datos MS SQL Server nativa).*
2. **¿Dónde está montada la base de datos?**
   - ¿Es un servidor físico o virtual en la red local (LAN) de la fábrica, o está en un servidor externo/remoto?
3. **Validación de la advertencia de Carlos (Licencia y APIs):**
   - ¿La licencia actual tiene activo el SDK de CONTPAQi?
   - Si no tiene SDK o requiere costo extra: **¿Nos pueden dar acceso de solo lectura (SQL Server `db_datareader`) a la base de datos?**
4. **¿Existen catálogos o empresas secundarias?**
   - En CONTPAQi, ¿tienen una sola base de datos de empresa o tienen razones sociales distintas para compra y venta?

### Bloque B: A Compras y Almacén (Operación y Datos)
1. **¿Cuál es el documento "disparador" con el que Almacén recibe?**
   - ¿El almacenista recibe con la Orden de Compra impresa?
   - ¿Recibe con la Remisión o Factura física del proveedor?
   - ¿O esperan a que Compras les avise por WhatsApp/correo qué va a llegar?
2. **Entradas de inventario:**
   - ¿En CONTPAQi generan un documento de *“Recepción de Compra”* cuando llega el camión y días después capturan la *“Compra/Factura”*?
   - ¿O solo capturan directo la Factura cuando el proveedor manda el XML?
   - *(Importante: Si esperan días para registrar la factura, el MES necesita leer desde la Orden de Compra para no frenar la descarga en planta).*
3. **Codificación de Materias Primas:**
   - ¿Tienen catálogo estandarizado de materiales en CONTPAQi? (ej. código para rollo de toquilla negro, fieltro Denver 9 1/2, tafilete talla 57).
   - ¿Registran número de lote del proveedor o pedimento aduanal en CONTPAQi?
4. **Discrepancias y Entregas Parciales:**
   - Si pidieron 5,000 toquillas y llegaron 3,200: ¿CONTPAQi mantiene el saldo pendiente en la misma orden? ¿Cómo lo marcan hoy?
5. **Rechazo en Calidad:**
   - Si el fieltro llega manchado o la paja rota: ¿se rechaza antes de registrar en CONTPAQi o se registra y luego se hace devolución?

---

## 4. Estrategia de Conexión: Las 3 Alternativas Técnicas

Presentar estas opciones en orden. Esto demuestra que tenemos control total y no nos quedaremos varados si CONTPAQi pone pretextos:

```
                  ┌─────────────────────────────────────────────────┐
                  │          OPCIÓN 1 (La Recomendada)              │
                  │   Conexión Directa SQL Server (Solo Lectura)    │
                  │   • Cero costo de licencias adicionales         │
                  │   • No altera ni pone en riesgo CONTPAQi        │
                  │   • Consultas instantáneas por folio de OC      │
                  └────────────────────────┬────────────────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌─────────────────────────────────┐                       ┌─────────────────────────────────┐
│     OPCIÓN 2 (Plan Formal)      │                       │     OPCIÓN 3 (Plan Respaldo)    │
│  SDK Oficial de CONTPAQi        │                       │  Lector de Factura XML (CFDI)   │
│  • Usa funciones de su librería │                       │  • Si la ingeniera no da acceso │
│  • Requiere validar si su       │                       │  • Almacén sube/escanea el XML  │
│    membresía lo permite         │                       │    del proveedor en el MES      │
└─────────────────────────────────┘                       └─────────────────────────────────┘
```

1. **Opción 1 — Acceso SQL Solo Lectura (Recomendada):**
   - Creamos un conector ligero (Bridge local).
   - Consulta las tablas estándar de CONTPAQi Comercial (`admDocumentos`, `admMovimientos`, `admProductos`, `admProveedores`).
   - El almacenista ingresa en la tablet el número de OC (ej. `OC-8841`) o el proveedor; el sistema trae las partidas y crea los lotes.
2. **Opción 2 — SDK de CONTPAQi:**
   - Se utiliza si la ingeniera externa insiste en usar las librerías oficiales de CONTPAQi. Dependerá de si su póliza lo cubre sin costo extra.
3. **Opción 3 — Lectura Directa de XML del Proveedor (Respaldo Infalible):**
   - Si la ingeniera externa pone trabas burocráticas o demoras técnicas, **el MES no se detiene**: el módulo de recepción de Uanify puede procesar el archivo XML del CFDI del proveedor, extrayendo código SAT, descripción y piezas para iniciar el lote.

---

## 5. Checklist de Salida (Entregables Obligatorios al Terminar la Reunión)

Al levantarse de la mesa, tu socio debe tener palomeados estos puntos:

- [ ] **Nombre exacto del software:** (ej. CONTPAQi Comercial Premium v10.x).
- [ ] **Ubicación y motor de la BD:** (ej. Servidor Windows `192.168.1.X`, MS SQL Server 2019).
- [ ] **Acuerdo sobre el usuario de consulta:** Visto bueno de la ingeniera para crear un usuario SQL `uanify_reader` con rol exclusivo `db_datareader`.
- [ ] **Muestra de datos reales:** Una copia en PDF/captura de pantalla de:
  - 1 Orden de Compra con partidas.
  - 1 Recepción o Factura de materia prima con partidas.
  - 1 Ficha de catálogo de producto/materia prima.
- [ ] **Contacto directo de la Ingeniera Externa:** Nombre, teléfono y correo para la sesión de prueba técnica de 20 minutos.
