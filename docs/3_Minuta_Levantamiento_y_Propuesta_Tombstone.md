# 🤠 Uanify × Tombstone Hats (San Francisco del Rincón)
## Minuta Ejecutiva de Levantamiento en Planta y Propuesta Técnica Integral

> **Documento:** Minuta Técnica de Levantamiento & Propuesta de Solución Industria 4.0  
> **Fecha de Reunión en Planta:** Septiembre 2026  
> **Fecha de Entrega de Propuesta:** Principios de la próxima semana (Compromiso acordado)  
> **Empresa:** Tombstone Hats ([tombstone.mx](https://tombstone.mx/)) — San Francisco del Rincón, Guanajuato  
> **Destinatario y Envío Oficial:** Edmundo ("Mundo") e Ing. Carlos  
> **Correo Oficial para Propuesta y Diagramas:** `making.tombstone@gmail.com`  
> **Elaborado por:** Equipo de Consultoría y Arquitectura de Software — Uanify  
> **Prototipo Interactivo Desplegado:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)

---

## 📋 Resumen Ejecutivo

Tras la reunión y recorrido técnico realizado en las instalaciones de la planta matriz de **Tombstone Hats** en San Francisco del Rincón ("San Pancho"), Guanajuato, se levantaron a detalle las dinámicas operativas, restricciones físicas y prioridades estratégicas de Dirección y Producción.

El objetivo central acordado es **eliminar la ceguera operativa** en el piso de manufactura, transitando de un control manual basado en tarjetas viajeras de papel, pizarrones físicos y hojas de Excel desconectadas, hacia un **Sistema MES (Manufacturing Execution System) ágil y robusto**, adaptado a las condiciones reales de planta (polvo, operarios sin celular, lotes fraccionados y enlace con CONTPAQi).

---

## 🏭 1. Diagnóstico Operativo de Planta (Levantamiento en Sitio)

### 1.1 El Producto y Mix de Fabricación
* **El Producto Campeón (70% del volumen):** Sombreros y Texanas de **Telar** (gamas como *Master Telar Denver, El Viejonón, Laredo, Frontier*).
  * **Proceso de origen:** Inicia en el almacén de materiales con rollos de tela que se tienden y se cortan en cuadros.
  * **Construcción:** Existen dos variantes:
    1. *Sombreros de 2 piezas:* Copa y falda/ala se procesan por separado y se fusionan mediante pegamento térmico y calor.
    2. *Sombreros de 1 pieza:* Moldeado integral de la pieza.
* **Campana Preformada (Fieltro de lana y pelo fino):** Línea que omite el corte de cuadros e inicia directamente en las prensas de vapor y hormas.
* **Línea de Accesorios (30% del volumen):** Carteras, cintos vaqueros, mariconeras, bolsitas y horquillas. Se requiere ficha técnica y costeo más que control de flujo por fracciones.

### 1.2 Mapeo de Hormas y Maquinaria
* **Inventario de Hormas / Moldes:** Formas comerciales como *Chaparral, Roper, Viejón*, identificadas por colores y formas.
* **Dos tipos principales de maquinaria:**
  1. *Prensas de vapor y calor:* Donde se da la forma inicial a copa y falda con moldes de aluminio.
  2. *Prensas hidráulicas:* Para conformado fino y alineado.

### 1.3 El Flujo de Lotes y la Dinámica de la "Rampa" (Cuello de Botella Operativo)
Actualmente el flujo de producción opera bajo una regla crítica de lotificación:
1. **Lote Madre (60 piezas):** Nace en Ingeniería / Almacén de Materiales con una tarjeta viajera de papel. Pasa por Corte de cuadros, Englopado (baño de dope en esquina y secado en camas, donde cada cama representa 1 lote), Refuerzos con pistola y Prensas de vapor.
2. **Fraccionamiento en Rampa (Hacia Nave de Hidráulicas):**
   * Al cruzar la rampa hacia la otra nave (almacén de alineado), el lote madre de 60 piezas **se subdivide físicamente en 4 sublotes de 15 piezas** (ejemplo: Lote `351` se divide en `351-01`, `351-02`, `351-03`, `351-04`).
   * *Situación actual:* Se hace de manera artesanal: una persona consulta un archivo de Excel "lotificador", busca tarjetas impresas en una mesa y las intercambia una por una a mano.
   * *Requerimiento:* Digitalizar y automatizar este fraccionamiento en el sistema con un solo escaneo.

### 1.4 La Regla del "Lote Completo" y la Gestión de "Segundas" (Venta de Viernes)
* **Regla estricta:** Ningún lote debe salir incompleto al siguiente departamento. Si entran 60 piezas, deben salir 60 piezas.
* **Tratamiento de defectos en los 4 puntos de inspección de calidad:**
  * *Con defecto recuperable:* Se regresa a la fracción anterior para compostura inmediata (ej. retoque de pintura o rebajado).
  * *Con defecto cosmético no recuperable:* Se clasifica como **"Producto Regular / Segunda"**.
  * Si un lote de 60 piezas tiene 2 piezas de menor calidad, se documentan **58 piezas de primera + 2 piezas de segunda** (o se sustituyen con saldo de reposición para mantener la orden íntegra).
  * **Venta de Viernes:** Toda la merma y producto regular se almacena en un área específica. **Los días viernes se consolidan y se venden al cliente como lote de segunda**, recuperando el costo del material.

### 1.5 Subensambles Críticos: Tafiletes por Talla en Adorno 1
* En el departamento de **Adorno 1**, el sombrero recibe 3 componentes simultáneos:
  1. El cuerpo del sombrero procesado.
  2. El **tafilete (badana interior)**, confeccionado en un área de subensamble por tallas: **55, 56, 57, 58, 59 y 60 cm**.
  3. La **toquilla** (cinto exterior).
* *Dolor actual:* Los supervisores coordinan esto a gritos entre naves: *"¿Tienes tafilete de la 57 para este lote? Sí, tengo 150"*. Si la talla no coincide, el lote de sombreros se queda parado en mesa.
* *Requerimiento:* Tablero digital de stock de tafiletes por talla en tiempo real.

### 1.6 Despacho, Camiones y Puente CONTPAQi (COMPAC)
* Las órdenes de clientes mayoristas (ej. 10,500 piezas: 7,500 de un modelo, 2,000 de otro, 1,000 de otro) se capturan en Excel y CONTPAQi.
* El cliente envía su propio camión o camioneta a planta.
* El almacén genera un **Vale de Salida en papel**, se descuenta a mano del Excel de órdenes de producción y viaja físicamente a la oficina administrativa para que la contadora / encargada facture en **COMPAC**.
* Cuentan con soporte de una ingeniera externa especializada en CONTPAQi con membresía anual.
* *Requerimiento Uanify:* Generar el vale de salida digital y crear el puente de datos hacia CONTPAQi para evitar la doble captura.

---

## 🛡️ 2. Restricciones Físicas y Ambientales de Planta (Hardware)

Durante la visita se identificaron 3 restricciones determinantes para el diseño tecnológico:

| Restricción Identificada | Impacto Técnico | Solución Propuesta Uanify |
|---|---|---|
| **Alto nivel de polvo** en Prensas y Recorte | Daña ventiladores y puertos de computadoras estándar. | Terminales de supervisor con **carcasa industrial IP65** (selladas contra polvo) y lectores QR sellados. |
| **Celulares estrictamente prohibidos** para operarios | No es viable pedirles que descarguen una app móvil en su celular personal. | **Módulos Físicos Estratégicos:** Pistolas lectoras de QR fijas en los almacenes intermedios (WIP) y tablets únicamente para supervisores. |
| **Infraestructura de Red existente** | Cuentan con módem, servidor administrativo y repetidores Wi-Fi en nave. | Arquitectura **Edge Local con sincronización a la Nube**: opera 100% en red local aunque se corte el internet; sincroniza en automático. |

> 📌 **Conclusión sobre Hardware:** Se descarta la opción inicial de un pedal o cámara con IA por cada máquina individual (demasiado invasivo y costoso en Fase 1). Se aprueba el modelo de **Módulos de Escaneo QR por Almacén Intermedio (WIP)** operados por supervisores y auxiliares.

---

## 🚀 3. Propuesta de Solución Faseada (Roadmap de Implementación)

Para garantizar un retorno de inversión inmediato sin detener la producción, proponemos un despliegue en **3 Fases**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ FASE 1 (Inmediata - 4 semanas)                                         │
│ • Sistema MES Base con Tarjetas Viajeras QR                            │
│ • Fraccionador Automático de Rampa (Lote 60 → 4 Sublotes de 15)        │
│ • Registro de Avance en 10 Almacenes WIP con Pistolas QR              │
│ • Tablero Andon TV de 50" en Nave Central (Metas Hora × Hora)         │
│ • Módulo de Registro de Segundas y Mermas (Venta de Viernes)          │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 2 (Siguiente - 4 semanas)                                         │
│ • Monitor de Subensambles: Tafiletes por Talla (55-60) en Adorno 1    │
│ • Vales de Salida Digitales para Camiones de Clientes                 │
│ • Puente de Integración con CONTPAQi (Facturación e Inventarios)      │
│ • Matriz Maestra de Materiales (Cambio masivo de tintas/químicos)     │
├────────────────────────────────────────────────────────────────────────┤
│ FASE 3 (Consolidación - A convenir)                                    │
│ • Módulo de Cálculo de Destajo Automático por Operador y Fracción      │
│ • Fichas Técnicas Digitales y Costeo para Accesorios (Carteras/Cintos)│
│ • Analítica Predictiva de Takt Time y OEE Avanzado                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 4. Prototipo Funcional Entregado y Validado

El prototipo interactivo ya refleja exactamente la operación de Tombstone Hats y puede consultarse en vivo desde cualquier tablet, PC o teléfono móvil en:

👉 **[https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)**

### Módulos Interactivos Disponibles en el Prototipo:
1. **Tablero Andon Digital (Piso de Nave):**
   * Vista de las 10 estaciones reales de Tombstone: *Corte, Englopado/Dope, Refuerzos, Prensas de Vapor, Recorte y Alambrado, Alineado/Hidráulico, Pintura y Brillo, Temperado/Refaldear, Adorno 1 (Tafiletes) y Calidad/Embarque*.
   * Semáforos en tiempo real, piezas producidas vs. meta de 850 pzas/turno, Takt Time (42 seg/pza) y OEE global.
2. **Terminal de Supervisor & Lotes QR:**
   * Lote madre activo `L-1094` (60 piezas, Sombrero Master Telar Denver 1000X, Talla 57, Horma Roper).
   * Botón interactivo para simular el **Escaneo de Tarjeta Viajera con Pistola QR**.
   * Botón interactivo para **Fraccionar Lote en la Rampa** en 4 sublotes de 15 piezas (`L-1094-01` a `04`) con asignación a operarios.
   * Registro clasificado de **Merma vs. Producto Regular/Segunda** (acumulado para venta de viernes).
3. **Consola de Ingeniería & Subensambles:**
   * Monitor en vivo de stock de **Tafiletes por Talla** (tallas 55 a 60 cm) con alertas de desabasto en Adorno 1.
   * Registro de inventario de **Hormas/Moldes** (Chaparral, Roper, Viejón, etc.) vinculadas a prensas.
   * Matriz de materiales con simulador de cambio masivo (ej. cambio de proveedor de pintura Taiwan 1125).
4. **Dashboard de Dirección & Vales CONTPAQi:**
   * Cumplimiento de pedidos mayoristas (Orden #9420 de 10,500 piezas).
   * Generador de **Vales de Entrega Digital** para camión del cliente con desglose de lotes y estado de sincronización hacia CONTPAQi.

---

## ❓ 5. Dudas Técnicas para Afinar en la Propuesta Final

Conforme a lo acordado al cierre de la reunión, dejamos asentados los puntos que revisaremos con el equipo de Tombstone a principios de la próxima semana:

1. **Integración CONTPAQi:**
   * ¿Podemos coordinar una breve llamada técnica de 20 minutos con la ingeniera externa de soporte de COMPAC para conocer si la base de datos está en SQL Server y qué versión de licencia tienen activa?
2. **Diagramas de Flujo de Proceso:**
   * En cuanto nos envíen por correo el diagrama de flujo del producto campeón y sus variantes (1 pieza vs 2 piezas), ajustaremos las fracciones en el MES para que el mapeo sea 100% idéntico a sus códigos internos.
3. **Ubicación Física de los Módulos de Escaneo:**
   * Definir los 4 a 6 puntos exactos donde se colocarán los soportes de escáneres QR (sugeridos: Rampa de corte/englopado, Salida de Prensas, Rampa de Alineado/Hidráulico, Salida de Brillos, Mesa de Adorno 1 y Mesa de Calidad Final).

---

## 📅 6. Próximos Pasos y Calendario de Acuerdos

| Fecha | Hito Acordado | Responsable |
|---|---|---|
| **Inmediato (Hoy)** | Entrega de minuta de levantamiento y prototipo interactivo desplegado en web. | Uanify |
| **Viernes / Lunes temprano** | Recepción de diagramas de flujo de proceso y contacto de CONTPAQi vía `making.tombstone@gmail.com`. | Tombstone Hats |
| **Principios de la próxima semana** | Envío de la Propuesta Formal Técnico-Económica desglosada con cotización de hardware IP65 y software MES. | Uanify |
| **Semana entrante** | Sesión de revisión en planta o videollamada para definir fecha de arranque del piloto en Fase 1. | Uanify & Tombstone |

---

*Uanify — Consultoría en Transformación Digital e Industria 4.0*  
*Contacto: contacto@uanify.com | San Francisco del Rincón & León, Guanajuato*
