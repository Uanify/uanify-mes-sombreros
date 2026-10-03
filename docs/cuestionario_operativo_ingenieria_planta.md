# Cuestionario Operativo de Planta: Validación Técnica con Ingeniería (CERRADO)
**Tombstone Hats ↔ Tombstone MES**  
*Auditoría de Piso y Puntos Críticos de Operación con el Ing. Carlos Ortiz.*  
*(Documento consolidado con acuerdos definitivos de planta y especificación técnica para el MVP).*

> **Estado:**  **VALIDADO Y CERRADO POR INGENIERÍA**  
> **Fecha de Validación:** 3 de Octubre de 2026  
> **Interlocutor Principal:** Ing. Carlos Ortiz (Ingeniería de Planta Tombstone Hats)  
> **Versión de Sistema Relacionada:** `v2.39.0`

---

### Resumen Ejecutivo de Hechos Confirmados por Planta:
1. **Puntos de Inspección de Calidad:** Son **4 puntos de revisión oficiales** a cargo de **6 inspectores exclusivos de calidad**. El Supervisor e Ingeniero de Calidad son quienes determinan el destino formal: reproceso, merma o segundas.
2. **Operadores de Piso:** Están **100% fijos** en sus departamentos (no rotan entre áreas). Total de 108 operadores distribuidos en 14 áreas.
3. **Ausentismo / Cobertura:** Si un operario falta, **no se cubre la máquina** por el momento (permanece detenida).
4. **Maquinaria:** Actualmente **NO cuenta con códigos visibles**. Se identificará por número de máquina para asignación de hormas en Prensas.
5. **Supervisores:** Atienden **múltiples departamentos** simultáneamente.
6. **Lotes Flexibles:** El tamaño del lote **no es fijo de 60 pzas**; es editable según la Orden de Producción (desde 4 hasta 14 sublotes de 15 a 60 pzas).
7. **Rutas:** Cambian según el tipo y calidad del sombrero.
8. **Impresión de Tarjetas:** Impresora láser de oficina en **hoja tamaño carta estándar**; se recortan las tarjetas y se insertan en fundas de plástico cosidas.
9. **Sistemas Administrativos:** CONTPAQi Comercial 11.3.1, Contabilidad 18.3.1, Bancos 18.3.1, Nómina 18.2.2.

---

## 1. Fraccionamiento en Rampa y Movimiento Físico de Lotes (D-05)

* **Nacimiento de las tarjetas de sublote:**  
  * *Respuesta de Carlos:* Las tarjetas se imprimen en **Ingeniería**, tanto la tarjeta madre como las tarjetas de sublotes. El supervisor se encarga de ir a Ingeniería a recoger las tarjetas y realizar el cambio físico de tarjeta de lote madre a tarjetas de lote-sublote.
* **Destino de la tarjeta del Lote Madre:**  
  * *Respuesta de Carlos:* Se **archiva en la mesa de rampa como control** histórico y trazabilidad.
* **Momento exacto del escaneo por el supervisor:**  
  * *Respuesta de Carlos:* Se escanea **AL SALIR del departamento**. El supervisor o auxiliar de producción del departamento que concluye el lote registra el avance y marca el lote como listo en el almacén intermedio.
* **Traslado físico en pasillos (Recolectores):**  
  * *Respuesta de Carlos:* Los operadores colocan el sombrero terminado del carrito en pilas de 60 pzas (torres), y una **persona dedicada (auxiliar/recolector)** los recolecta físicamente y los traslada al siguiente proceso.

---

## 2. Padrón de Operadores y Pago por Destajo

* **Padrón Total (108 Operadores Fijos):**  
  * Corte (2), Prensas (19), Endopado (9), Recortado (4), Alambrado (8), Pintura/Acabados (18: Brochas 4, Refuerzo 6, Pintura 5, Brillo 3), Prensas Hidráulicas (8), Refaldeo (3), Pegado y Perforado (4), Adorno (11), Embarque (4), Tafiletes (9), Toquillas (7), Almacén MP (2), Inspectores de Calidad (6).
* **Tarifas y Preconteo de Nómina a Destajo:**  
  * *Respuesta de Carlos:* Hoy se lleva tarifa fija en pesos por pieza ($/pza). **Sí se requiere que el sistema emita un reporte semanal de destajo (corte de los viernes)**, y es indispensable que el sistema cuente con la **alternativa de exportar datos nativos a Excel** para análisis y dispersión de nómina.
* **Comodines o ausencias:**  
  * *Respuesta de Carlos:* Por el momento **no se cubre la máquina** si un operario falta.

---

## 3. Tiempos Muertos y Bitácora de Paros de Máquina

* **Registro actual:**  
  * Se avisa de palabra al mecánico cuando ocurre una falla.
* **Alcance en el sistema MES:**  
  * *Respuesta de Carlos:* **Registrar paros de producción de inicio a fin.** Se habilitará en la terminal de Prensas botones rápidos: *Cambio de Horma, Falla Mecánica, Falta de Vapor en Caldera, Falta de Material*.

---

## 4. Coordinación de Subensambles en Adorno (Tafilete y Toquilla)

* **Dinámica de Preparación:**  
  * Tafilete (9 personas) y Toquilla (7 personas) trabajan independientemente alimentando a Adorno (11 personas).
* **Visibilidad del buffer en la terminal:**  
  * *Respuesta de Carlos:* **La idea es que el sistema arroje un semáforo de que se puede procesar este producto ya que está disponible.** Adorno visualiza semáforo en verde cuando el buffer de tafiletes/toquillas de la talla y modelo requeridos cuenta con stock suficiente.

---

## 5. Control de Hormas de Aluminio y Fichas Técnicas con Foto

* **Contador de uso de moldes:**  
  * *Respuesta de Carlos:* **Solo se necesita saber qué horma está montada en qué número de máquina para la planeación del día.** (No se requiere contador preventivo de ciclos de prensa por el momento).
* **Fotografía de la Ficha Técnica autorizada:**  
  * *Respuesta de Carlos:* **Sí.** En Adorno y Calidad Final se debe visualizar la foto real del modelo terminado autorizado para comparar el armado físico contra el estándar.

---

## 6. Formato de Impresión de Tarjetas y Hardware de Piso

* **Tipo de impresora:**  
  * *Respuesta de Carlos:* **Impresora de oficina en hoja tamaño carta estándar**, las cuales se recortan e insertan en fundas plásticas cosidas.
* **Puntos Físicos Oficiales para Lectores / Tablets (6 Estaciones Confirmadas):**  
  1. **Prensas** (Control de Hormas y Paros de Máquina).
  2. **Calidad Refuerzos y Pintura** (Filtro 1 de Calidad).
  3. **Patio Endopado** (Control de secado y flujo a hidráulicas).
  4. **Calidad Hidráulicas** (Filtro 2 de Calidad).
  5. **Toquilla y Adorno** (Subensambles y Ficha Técnica con Foto).
  6. **Calidad Final y Embarque** (Filtro 3, Segundas y Vales de Salida).
* **Conectividad Wi-Fi:**  
  * Sin zonas de sombra críticas reportadas; se mantendrá la arquitectura offline-first con sincronización automática por robustez.

---

## 7. Gestión de Calidad, Piezas de Segunda y Despacho

* **Personal de Calidad:**  
  * Son personas exclusivas: Inspectores de Calidad en línea (6 inspectores), Supervisor de Calidad e Ingeniero de Calidad.
* **Ruta de Reprocesos:**  
  * **Varía según el defecto:** No regresa por defecto al departamento inmediato anterior; se redirige al área donde se originó la desviación.
* **Piezas de "Segunda":**  
  * *Tratamiento en Sistema:* Registro de piezas defectuosas, inventario virtual de segunda y **registro obligatorio de la causa raíz**.
  * *Tratamiento Físico:* Los sombreros de segunda **se venden**.
  * *Tarjeta Viajera:* El lote **no se detiene**; se da avance continuo a las piezas conformes hasta concluir el lote.
* **Despacho y Vales de Salida:**  
  * El sistema MES genera el **Vale de Salida Oficial** al despachar el pedido, el cual se enlazará a CONTPAQi Comercial para la facturación.
* **Criterio de Inclusión de Tafilete / Toquilla:**  
  * Depende estrictamente de la **Orden de Producción del cliente** (especificado en el pedido).

---

## Matriz Resumen de Acuerdos Cerrados

| # | Punto Operativo | Decisión Acordada | Implementación Técnica MES |
| :--- | :--- | :--- | :--- |
| **1** | Impresión de tarjetas | En Ingeniería en hoja carta láser | Plantilla de impresión en PDF carta (4-6 tarjetas por hoja) |
| **2** | Momento de escaneo | Al terminar lote en el departamento saliente | Botón de salida "Completar Lote" por Supervisor/Auxiliar |
| **3** | Pre-reporte de destajo | Sí, corte semanal de los viernes | Módulo de cálculo $/pza con exportación nativa a Excel |
| **4** | Registro de paros | Sí, de inicio a fin en Prensas | Botones rápidos de paro y cálculo de tiempo muerto |
| **5** | Buffer de subensambles | Semáforo de disponibilidad para Adorno | Semáforo Verde/Ámbar/Rojo por modelo y talla |
| **6** | Control de hormas | Solo asignación horma ↔ # máquina | Matriz de planeación diaria de Prensas |
| **7** | Fichas técnicas | Mostrar fotografía real autorizada | Visor de imagen en Adorno e Inspección Final |
| **8** | Puntos de captura | 6 estaciones estratégicas en nave | Perfiles de terminal adaptados a las 6 estaciones |
| **9** | Piezas de segunda | Registrar causa, inventario y venta directa | Submódulo de segundas sin frenar avance del lote |
| **10** | Reprocesos | Retorno al área causante del defecto | Enrutamiento condicional según motivo de no-conformidad |
