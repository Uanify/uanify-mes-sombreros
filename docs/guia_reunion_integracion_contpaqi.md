# Dossier Estratégico y Técnico: Conexión CONTPAQi (Compaq) ↔ Uanify MES
**Guía de Trabajo y Evaluación de Costo-Beneficio para Reunión con Compras, Almacén y Soporte CONTPAQi**  
*Objetivo: Determinar el uso real de CONTPAQi en Producción/Almacén, evaluar si se justifica seguir pagando licencias/membresías extra, o si Uanify MES puede operar de forma autónoma sin costos adicionales.*

---

## 1. El Dilema Central: ¿Pagar o No Pagar CONTPAQi? ¿Qué Tanto se Necesita?

El propósito de fondo de esta reunión es responder con claridad empresarial: **¿Vale la pena pagar o renovar integraciones de CONTPAQi para Producción y Almacén, o podemos prescindir de ello y trabajar de otra forma sin gastar?**

### Diagnóstico de la Situación:
1. **En Producción Real (Piso de Fábrica):**
   - CONTPAQi **no opera en piso**. La producción no se mueve por CONTPAQi.
   - Todo el avance de lotes, estaciones, destajos, mermas y tiempos se gestiona físicamente con tarjetas viajeras, pizarrones y reportes verbales.
   - **Conclusión:** Para la operación interna de manufactura, **CONTPAQi es 100% prescindible**. Uanify MES resuelve todo el piso de forma autónoma con su base de datos local y códigos QR.
2. **En Recepción de Materia Prima (Entradas):**
   - Se necesita saber qué material llegó para crear el lote inicial (paja, fieltro, toquilla, herrajes).
   - **¿Qué necesitamos leer de CONTPAQi?** Únicamente la Orden de Compra autorizada o la Factura del proveedor (folio, proveedor, código de material, cantidad de piezas/rollos).
   - **La pregunta económica:** Si la ingeniera externa o CONTPAQi pretenden cobrar una licencia cara, módulo de integración o póliza de desarrollo para "conectar APIs": **¿Se debe pagar? NO.**
   - **Alternativa sin costo:**
     - *Ruta A:* Si la BD está en SQL Server local, se hace una consulta de Solo Lectura gratuita (`SELECT`). Cero pesos adicionales.
     - *Ruta B (Autonomía Total sin pagar nada a CONTPAQi):* Almacén carga el archivo XML/PDF de la factura del proveedor directamente en Uanify MES. El sistema extrae los datos y crea los lotes. **Cero dependencia y cero pago de pólizas a CONTPAQi.**
3. **En Salidas / Embarque (Camioneta del Cliente):**
   - Actualmente opera con un vale de salida en papel y un archivo de Excel manual.
   - Uanify MES genera el vale de entrega digital automático. Contabilidad solo toma el resumen final para timbrar la factura en su CONTPAQi habitual.

---

## 2. Antecedentes Clave de las Grabaciones en Planta

En las sesiones previas de levantamiento con Carlos (Ingeniero de Procesos) y Edmundo (Dirección), se confirmaron aspectos críticos:

1. **La "Ingeniera Externa de Soporte":**
   - La empresa no cuenta con un desarrollador interno de CONTPAQi. Pagan una **membresía anual de soporte** con una ingeniera externa.
   - *Cita de Carlos en planta:* *"Tenemos una persona que nos ayuda con el Compact. Es una muchacha, es una ingeniera. Ella es de Compact. Es una membresía que se paga anual. Tenemos el servicio de todo lo de la contabilidad, la facturación."*
2. **El "Bloqueo" por tipo de licencia:**
   - *Advertencia textual de Carlos:* *"Hay unas licencias que a lo mejor te dan lo que necesites, pero si quieres hacer integraciones con otros softwares, pues te bloquea."*
   - **Criterio rector:** Bajo ninguna circunstancia debemos entrar en un esquema donde ellos o nosotros tengamos que pagar upgrades de software o licencias especiales a CONTPAQi si podemos extraer la información directamente o prescindir de la conexión directa.
3. **El flujo real actual (El "Puente de Papel y Excel"):**
   - > *"Viene el cliente, trae su camioneta, se genera un vale de salida donde se pone todo el producto que se les entrega. Ese vale, en un Excel se tienen capturadas las órdenes de producción y se va descontando lo que se va entregando. El vale pasa a contabilidad y sobre ese vale se hace la facturación del cliente en COMPAC."*

---

## 3. Mapa de Personas en la Mesa y Postura Recomendada

| Participante | Su Rol / Interés | Su Miedo o Resistencia Típica | Postura / Argumento Clave a Usar |
| :--- | :--- | :--- | :--- |
| **Responsable de Compras** | Emitir OC a proveedores de fieltros, telas, toquillas, cajas. | *“Me van a pedir capturar el doble o cambiar cómo compro.”* | Su operación en CONTPAQi no cambia; el MES solo tomará lo que ellos ya capturan para facilitarle la vida a Almacén. |
| **Encargado de Almacén** | Recibir camiones en muelle, contar bultos/piezas y acomodar. | *“El sistema me va a quitar tiempo o no sé usar software complejo.”* | Con Uanify, en vez de cotejar papel contra bulto y luego ir a teclear a una PC, el sistema le muestra la OC en pantalla táctil y al dar OK imprime/genera el QR del lote. |
| **Ingeniera Externa de CONTPAQi** | Cobro de póliza anual, defender su control sobre el sistema. | *“Van a meter mano a mi base de datos, desconfigurar algo y me van a culpar”* o *“Les voy a querer vender un módulo extra”*. | **Postura firme y tranquila:** No vamos a modificar CONTPAQi ni comprar módulos adicionales. Solicitamos un usuario SQL de **Solo Lectura (`db_datareader`)**. Si no es viable, operamos de forma paralela con lectura de XML del proveedor sin requerir soporte de ella. |

---

## 4. Respuestas y Hechos Ya Confirmados (Lo que YA Está Resuelto)

Para no perder tiempo indagando temas ya validados en piso con Carlos y Edmundo:

| # | Tema | Estatus | Hecho Confirmado en Planta |
| :--- | :--- | :--- | :--- |
| **R1** | **Infraestructura y Servidor** | **CONFIRMADO** | La planta **ya cuenta con servidor local físico, módem de fibra y repetidores Wi-Fi** distribuidos en naves (*Carlos: "Tenemos el servidor, el módem y los repetidores. Por la conexión no habría problema"*). La base de datos corre en red local (LAN). |
| **R2** | **Quién da el soporte de COMPAC** | **CONFIRMADO** | No hay personal de sistemas interno para COMPAC. Tienen contratada una **póliza / membresía anual con una ingeniera externa** que administra contabilidad y facturación. |
| **R3** | **Riesgo de bloqueo de APIs / SDK** | **CONFIRMADO** | La licencia que tienen contratada es estándar/básica. Carlos advirtió: *"Hay unas licencias que a lo mejor te dan lo que necesites, pero si quieres hacer integraciones con otros softwares, pues te bloquea"*. Por lo tanto, **la decisión es no pagar licencias ni APIs adicionales**. |
| **R4** | **Flujo actual de entrega y salida** | **CONFIRMADO** | Actualmente opera con **vales de salida en papel físico** cotejados contra un **Excel de órdenes de producción**, que luego se pasa a contabilidad para timbrar factura en COMPAC. |
| **R5** | **Uso de dispositivos por operarios** | **CONFIRMADO** | Los operarios tienen **prohibido el celular en piso**. El software lo operan exclusivamente supervisores y almacenistas en terminales institucionales de uso rudo. |
| **R6** | **Estructura de Pedidos y Lotes** | **CONFIRMADO** | Los pedidos se desglosan por modelo, talla y volumen (ej. 10,500 piezas = 7,500 Denver, 2,000 Viejonón, 1,000 Laredo). Los lotes viajan en 60 piezas y se fraccionan en rampa a sublotes de 15 piezas. |

---

## 5. Cuestionario Quirúrgico: Preguntas Abiertas por Resolver en la Reunión

Llevar en mano estas preguntas clave para definir la decisión de integración:

### Bloque A: Con la Ingeniera Externa / Soporte CONTPAQi (Evaluación Técnica y de Costo)
1. **Confirmar producto y versión instalada:**
   - *¿Es CONTPAQi Comercial Premium, Comercial Pro o Factura Electrónica? ¿Qué versión?*
   - *(Comercial Premium corre sobre Microsoft SQL Server nativo en la red local).*
2. **¿Existe costo adicional por consultar la información?**
   - Si la respuesta es que se requiere un módulo adicional, licencias SDK o cobro por desarrollo: **se descarta esa vía de inmediato.**
3. **Viabilidad de Usuario SQL de Solo Lectura:**
   - **¿Nos puede habilitar un usuario SQL estándar con rol `db_datareader`?**
   - *Argumento:* "No vamos a modificar registros ni tocar tablas. Solo queremos leer las órdenes de compra autorizadas para poblar la recepción de materia prima".
4. **Estructura de Empresas en BD:**
   - ¿Tienen una sola empresa/base de datos dada de alta en SQL Server o manejan diferentes razones sociales?

### Bloque B: Con Compras y Almacén (Operación Fina de Recepción)
1. **¿Cuál es el documento exacto con el que el chofer/proveedor entrega en muelle?**
   - *(¿El chofer entrega copia de la OC, Remisión física del proveedor, o la Factura impresa con su XML por correo?).*
2. **Momento del registro en CONTPAQi:**
   - ¿Capturan en CONTPAQi una *"Recepción de Compra"* al descargar el camión? ¿O esperan varios días hasta que el proveedor envía la factura formal para capturarla?
   - *(Crítico: Si esperan días, la integración directa con CONTPAQi frenaría la producción; nos convendría recibir directo en el MES con la OC o remisión).*
3. **Catálogo de Materiales y Lotes de Proveedor:**
   - ¿Las materias primas (rollos de toquilla, campanas de fieltro, conos de hilo, herrajes) ya tienen un código interno estandarizado en CONTPAQi?
   - ¿Capturan lote de proveedor o pedimento aduanal en CONTPAQi?
4. **Entregas Parciales y Rechazos de Calidad:**
   - Si el proveedor entrega solo una parte del pedido: ¿CONTPAQi deja la orden con saldo pendiente en automático?
   - Si al descargar se detecta material defectuoso: ¿se rechaza en el momento sin registrar entrada, o se registra todo y luego se tramita una devolución en CONTPAQi?

---

## 6. Las 3 Alternativas Técnicas y Decisión Económica

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MATRIZ DE DECISIÓN UANIFY MES                          │
├────────────────────────────┬────────────────────────────┬───────────────────────┤
│ Opción 1: SQL Directo      │ Opción 2: SDK CONTPAQi     │ Opción 3: XML CFDI    │
│ (Solo Lectura · Gratuita)  │ (Módulo / Póliza de Pago)  │ (100% Autónoma · $0)  │
├────────────────────────────┼────────────────────────────┼───────────────────────┤
│ • Consulta tablas SQL LAN  │ • Requiere licencias SDK   │ • Lee XML del CFDI    │
│ • Rápida y sin costo       │ • Cobros de la ingeniera   │ • Cero dependencia    │
│ • La opción ideal si dan   │ • NO RECOMENDADA si        │ • Si CONTPAQi cobra o │
│   acceso de lectura        │   implica costo extra      │   pone trabas, se usa │
└────────────────────────────┴────────────────────────────┴───────────────────────┘
```

1. **Opción 1 — Acceso SQL Server Solo Lectura (Recomendada si la autorizan):**
   - Un servicio conector local (Bridge) consulta cada que se recibe una orden en almacén (`SELECT * FROM admDocumentos WHERE ...`). Cero costo de licencias, cero alteración a CONTPAQi.
2. **Opción 2 — SDK de CONTPAQi (Solo si ya está pagado y sin costo extra):**
   - Si la ingeniera externa ya cuenta con las librerías activas en la membresía actual. Si pide pagos adicionales, **se rechaza**.
3. **Opción 3 — Recepción Autónoma por XML del CFDI (Plan sin costo y sin ataduras):**
   - El almacenista recibe el material escaneando o cargando el archivo XML de la factura que mandó el proveedor.
   - El MES extrae el RFC, partidas, cantidades y descripciones, genera los códigos QR de los lotes y comienza a producir.
   - **Beneficio:** Funciona desde el día 1, no depende de la ingeniera externa, no cuesta un solo centavo extra y no depende de la versión de CONTPAQi.

---

## 7. Checklist de Salida (Entregables Obligatorios al Terminar la Reunión)

Al levantarse de la mesa, debes salir con estos puntos resueltos:

- [ ] **Decisión económica:** ¿La integración con CONTPAQi requiere pagar licencias o soporte extra? (Si es sí → Nos vamos por la Opción 3 de XML directo).
- [ ] **Nombre exacto del software y motor:** (ej. CONTPAQi Comercial Premium v10 sobre SQL Server).
- [ ] **Visto bueno para usuario SQL de solo lectura:** (`uanify_reader` con rol `db_datareader`).
- [ ] **Muestra de datos reales:**
  - 1 Orden de Compra real con partidas (PDF o captura).
  - 1 Recepción / Factura de materia prima con partidas.
  - 1 Archivo XML de proveedor típico (fieltro, toquilla o campana).
- [ ] **Contacto de la Ingeniera Externa:** Nombre, teléfono y correo para la sesión de prueba técnica de 20 minutos.
