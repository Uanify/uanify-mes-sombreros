# Dossier Estratégico y Técnico: Conexión CONTPAQi (Compaq) ↔ Uanify MES
**Guía de Trabajo para Reunión con Compras, Almacén y Soporte CONTPAQi**  
*Consolidación de hechos de planta, reglas de negocio y arquitectura de integración para recepción de materia prima.*

---

## 1. Contexto General y Propósito

En las sesiones previas de levantamiento con Carlos (Ingeniero de Procesos) y Edmundo (Dirección), se confirmaron aspectos críticos sobre cómo opera hoy CONTPAQi en la empresa:

1. **La "Ingeniera Externa de Soporte":**
   - La empresa no cuenta con un desarrollador interno de CONTPAQi.
   - Pagan una **membresía anual de soporte** con una ingeniera externa certificada por CONTPAQi.
   - *Cita de Carlos en planta:* *"Tenemos una persona que nos ayuda con el Compact. Es una muchacha, es una ingeniera. Ella es de Compact. Es una membresía que se paga anual. Tenemos el servicio de todo lo de la contabilidad, la facturación."*
2. **El "Bloqueo" por tipo de licencia:**
   - *Advertencia textual de Carlos:* *"Hay unas licencias que a lo mejor te dan lo que necesites, pero si quieres hacer integraciones con otros softwares, pues te bloquea."*
   - Por ello, **no podemos asumir que tienen el SDK o API de CONTPAQi habilitado**, ni debemos depender de que compren módulos caros adicionales.
3. **El flujo real de salida y entrada actual (El "Puente de Papel y Excel"):**
   - Actualmente, los pedidos y entregas operan con hojas de Excel y vales físicos en papel:
     > *"Viene el cliente, trae su camioneta, se genera un vale de salida donde se pone todo el producto que se les entrega. Ese vale, en un Excel se tienen capturadas las órdenes de producción y se va descontando lo que se va entregando. El vale pasa a contabilidad y sobre ese vale se hace la facturación del cliente en COMPAC."*
   - **En Compras / Recepción de Materia Prima ocurre exactamente lo mismo:** Compras genera la OC o recibe facturas; Almacén recibe en muelle con remisiones o facturas impresas, y luego se captura en CONTPAQi a mano para "dar entrada".
4. **El objetivo primordial de Uanify MES:**
   - **Al Inicio (Recepción):** El MES debe leer la Orden de Compra / Recepción de CONTPAQi para que el almacenista, al recibir materia prima (fieltros, paja, toquillas, herrajes), valide cantidades con un clic/escaneo y genere de inmediato el código QR del lote inicial sin recaptura manual.
   - **Al Final (Embarque):** El MES genera el vale de salida digital para la camioneta y le reporta a CONTPAQi lo entregado para su facturación automática.

---

## 2. Mapa de Personas en la Mesa y Postura Recomendada

| Participante | Su Rol / Interés | Su Miedo o Resistencia Típica | Postura / Argumento Clave a Usar |
| :--- | :--- | :--- | :--- |
| **Responsable de Compras** | Emitir OC a proveedores de fieltros, telas, toquillas, cajas. | *“Me van a pedir capturar el doble o cambiar cómo compro.”* | El proceso de compra no cambia en CONTPAQi; el MES solo tomará lo que ellos ya capturan para facilitarle la vida a Almacén. |
| **Encargado de Almacén** | Recibir camiones en muelle, contar bultos/piezas y acomodar. | *“El sistema me va a quitar tiempo o no sé usar software complejo.”* | Con Uanify, en vez de cotejar papel contra bulto y luego ir a teclear a una PC, el sistema le muestra la OC en pantalla táctil y al dar OK imprime/genera el QR del lote. |
| **Ingeniera Externa de CONTPAQi** | Soporte técnico, estabilidad de la base de datos y cobro de póliza. | *“Van a meter mano a mi base de datos, desconfigurar algo y me van a culpar.”* | **Tranquilidad absoluta:** No vamos a escribir datos en CONTPAQi. Solicitamos un usuario SQL de **Solo Lectura (`SELECT` / `db_datareader`)** o vistas específicas. Cero riesgo de corrupción. |

---

## 3. Respuestas y Hechos Ya Confirmados (Lo que YA Está Resuelto)

Para no perder tiempo indagando temas ya validados en piso con Carlos y Edmundo, estos son los hechos confirmados:

| # | Tema | Estatus | Hecho Confirmado en Planta |
| :--- | :--- | :--- | :--- |
| **R1** | **Infraestructura y Servidor** | **CONFIRMADO** | La planta **ya cuenta con servidor local físico, módem de fibra y repetidores Wi-Fi** distribuidos en naves (*Carlos: "Tenemos el servidor, el módem y los repetidores. Por la conexión no habría problema"*). La base de datos corre en red local (LAN). |
| **R2** | **Quién da el soporte de COMPAC** | **CONFIRMADO** | No hay personal de sistemas interno para COMPAC. Tienen contratada una **póliza / membresía anual con una ingeniera externa** que les da el servicio de contabilidad y facturación. |
| **R3** | **Riesgo de bloqueo de APIs / SDK** | **CONFIRMADO** | La licencia que tienen contratada es estándar/básica. Carlos advirtió: *"Hay unas licencias que a lo mejor te dan lo que necesites, pero si quieres hacer integraciones con otros softwares, pues te bloquea"*. Por lo tanto, **la ruta de integración no debe depender de comprar módulos de API**, sino de lectura directa SQL / Vistas. |
| **R4** | **Flujo actual de entrega y salida** | **CONFIRMADO** | Actualmente opera con **vales de salida en papel físico**. Esos vales se cotejan contra un **archivo Excel de órdenes de producción** donde se descuenta manualmente lo entregado, y ese vale físico pasa a contabilidad para que facturen en COMPAC. (El objetivo del MES es eliminar ese Excel y ese vale manual). |
| **R5** | **Uso de dispositivos por operarios** | **CONFIRMADO** | Los operarios tienen **estrictamente prohibido el celular en piso**. El software no será usado por operarios; la recepción y los escaneos son operados exclusivamente por supervisores y almacenistas en terminales institucionales de uso rudo. |
| **R6** | **Estructura de Pedidos y Lotes** | **CONFIRMADO** | Los pedidos de clientes se desglosan por modelo, talla y volumen (ej. 10,500 piezas = 7,500 Denver, 2,000 Viejonón, 1,000 Laredo). Los lotes madre en piso viajan de 60 piezas y se fraccionan en rampa a sublotes de 15 piezas. |

---

## 4. Cuestionario Quirúrgico: Preguntas Abiertas por Resolver en la Reunión

Estas son **estrictamente las preguntas que debes llevar en mano** para definir los acuerdos técnicos y operativos:

### Bloque A: Con la Ingeniera Externa / Soporte CONTPAQi (Validación Técnica)
1. **Confirmar producto y versión exacta instalada:**
   - *¿Es CONTPAQi Comercial Premium, Comercial Pro o Factura Electrónica? ¿Qué versión (v9, v10, v11)?*
   - *(Sabemos que corre en el servidor local, pero requerimos confirmar el nombre de la instancia SQL Server).*
2. **Validación del Usuario de Consulta (Solo Lectura):**
   - Dado que no queremos alterar el sistema ni forzar compra de APIs: **¿Nos puede crear un usuario SQL con rol de solo lectura (`db_datareader`) o unas vistas específicas a las tablas de compras/recepciones?**
   - *Argumento a mencionar:* "Ingeniera, no vamos a escribir nada en CONTPAQi, solo queremos hacer SELECT de las órdenes autorizadas para que el almacenista no recapture a mano".
3. **Estructura de Empresas en BD:**
   - ¿Tienen una sola empresa/base de datos dada de alta en SQL Server o manejan diferentes razones sociales para comprar y facturar?

### Bloque B: Con Compras y Almacén (Operación Fina de Recepción)
1. **¿Cuál es el documento físico/digital exacto con el que el chofer/proveedor entrega en muelle?**
   - *(Sabemos que en salidas usan vale en papel y Excel; requerimos confirmar en ENTRADAS si el almacenista recibe con la copia de la OC, con la Remisión o con la Factura impresa).*
2. **Momento del registro en CONTPAQi:**
   - ¿Registran en CONTPAQi un documento de *"Recepción de Compra"* al momento de descargar el camión? ¿O el material se descarga y se espera hasta que el proveedor envíe el XML/Factura formal días después?
   - *(Crítico: Si esperan días al XML, el MES debe leer la Orden de Compra previa para no tener el material detenido en el patio sin lote).*
3. **Catálogo de Materiales y Lotes de Proveedor:**
   - ¿Las materias primas (rollos de toquilla, campanas de fieltro, conos de hilo, herrajes) ya tienen un código interno estandarizado en CONTPAQi?
   - ¿Capturan en algún campo de CONTPAQi el lote del proveedor o pedimento aduanal?
4. **Entregas Parciales y Rechazos de Calidad:**
   - Si el proveedor entrega solo una parte del pedido: ¿CONTPAQi deja la orden con saldo pendiente en automático?
   - Si al descargar se detecta material defectuoso: ¿se rechaza en el momento sin registrar entrada, o se registra todo y luego se tramita una devolución en CONTPAQi?

---

## 5. Estrategia de Conexión: Las 3 Alternativas Técnicas

Presenta estas opciones en este orden. Esto demuestra que tenemos control total y una alternativa inmediata si CONTPAQi pone restricciones:

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
   - Se crea un conector ligero (Bridge local).
   - Consulta las tablas estándar de CONTPAQi Comercial (`admDocumentos`, `admMovimientos`, `admProductos`, `admProveedores`).
   - El almacenista ingresa en la tablet el número de OC (ej. `OC-8841`) o el proveedor; el sistema trae las partidas y crea los lotes.
2. **Opción 2 — SDK de CONTPAQi:**
   - Se utiliza si la ingeniera externa insiste en usar las librerías oficiales de CONTPAQi. Dependerá de si su póliza lo cubre sin costo extra.
3. **Opción 3 — Lectura Directa de XML del Proveedor (Respaldo Infalible):**
   - Si la ingeniera externa pone trabas burocráticas o demoras técnicas, **el MES no se detiene**: el módulo de recepción de Uanify procesa el archivo XML del CFDI del proveedor, extrayendo código SAT, descripción y piezas para iniciar el lote.

---

## 6. Checklist de Salida (Entregables Obligatorios al Terminar la Reunión)

Al levantarse de la mesa, debes salir con estos puntos acordados y anotados:

- [ ] **Nombre exacto del software:** (ej. CONTPAQi Comercial Premium v10.x).
- [ ] **Ubicación y motor de la BD:** (ej. Servidor Windows `192.168.1.X`, MS SQL Server 2019).
- [ ] **Acuerdo sobre el usuario de consulta:** Visto bueno de la ingeniera para crear un usuario SQL `uanify_reader` con rol exclusivo `db_datareader`.
- [ ] **Muestra de datos reales:** Una copia en PDF/captura de pantalla de:
  - 1 Orden de Compra con partidas.
  - 1 Recepción o Factura de materia prima con partidas.
  - 1 Ficha de catálogo de producto/materia prima.
- [ ] **Contacto directo de la Ingeniera Externa:** Nombre, teléfono y correo para la sesión de prueba técnica de 20 minutos.
