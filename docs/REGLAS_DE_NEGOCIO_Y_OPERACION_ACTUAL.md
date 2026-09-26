# Tombstone Hats · Reglas de Negocio y Operación Actual de Planta
## Sustento Técnico de Procesos, Dinámica en Piso y Levantamiento Fidedigno

> **Documento Maestro de Operación y Reglas de Negocio Validadas**  
> **Cliente:** Tombstone Hats ([tombstone.mx](https://tombstone.mx/))  
> **Planta Matriz:** San Francisco del Rincón, Guanajuato  
> **Interlocutores Validados:** Edmundo González ("Mundo", Director/Administrador General) e Ing. Carlos Ortiz (Jefe de Producción e Ingeniería)  
> **Contacto Oficial:** `making.tombstone@gmail.com`  
> **Fuentes de Sustento:** Grabaciones directas de audio en piso de producción, levantamiento técnico presencial, fotografías de pizarrones y maquinaria, y validaciones directas de arquitectura.  
> **Versión de Referencia:** `v2.18.0` | **Fecha de Actualización:** 26 de Septiembre de 2026  
> **Directiva de Integridad:** Este documento contiene exclusivamente información confirmada y validada. Cualquier regla en proceso de definición se delimita explícitamente en su sección correspondiente.

---

## 1. Perfil de Manufactura y Mix de Productos

### 1.1 Producto Campeón: Texanas y Sombreros de Telar (~70% del Volumen)
La manufactura principal de la nave corresponde a texanas y sombreros vaqueros fabricados a base de telar de papel tratado / hilo de paja (*Master Telar Denver*, *El Viejonón*, *Chaparral*, *Sonora*, *Magnum*, *Laredo*, *Frontier*).

Se fabrican bajo dos métodos constructivos:
1. **Sombrero de 2 Piezas:**
   * La copa y la falda se cortan de rollos/cuadros de telar por separado en los departamentos iniciales.
   * Ambas piezas viajan de forma independiente hasta las prensas de hormado, donde se ensamblan y fusionan mediante adhesivo termoactivable activado por el calor y presión de las prensas.
2. **Sombrero de 1 Pieza (Integral):**
   * La copa y la falda se tejen o moldean como una sola estructura continua desde el inicio.
3. **Campana Preformada (Fieltro de Lana / Pelo):**
   * Materia prima importada o adquirida en campana cerrada preformada. Omite el corte de cuadros y el engomado inicial, incorporándose directamente al proceso a partir de las prensas de vapor y hormado.

### 1.2 Línea de Accesorios (~30% del Volumen · Fuera de Alcance Fase 1)
Fabricación de carteras, cintos vaqueros, mariconeras, bolsos y horquillas.
* **Declaración Oficial del Ing. Carlos Ortiz en Planta:**
  > *"Ahí principalmente son las fichas técnicas de los productos y accesorios. De la ficha técnica jalar tu ficha de costos. No es un proceso de flujo complejo como aquí."*
* **Regla de Alcance:** La línea de accesorios no requiere monitoreo de flujo de línea en piso en la Fase 1; únicamente requiere catálogo digital de fichas técnicas y vinculación con la matriz de costos y BOM.

---

## 2. Régimen Laboral y Horarios Operativos de Planta

### 2.1 Estandarización a Turno Único
La planta opera formal y consolidadamente bajo un solo turno diurno:
* **Días Hábiles:** Lunes a Viernes (Sábado y Domingo no laborables de producción regular).
* **Horario de Jornada:** **07:00 a 15:30 hrs** (8.5 horas brutas = 510 minutos).
* **Horario de Almuerzo / Comedor:** **12:00 a 12:45 hrs** (45 minutos de receso de comedor de personal).
* **Tiempo Efectivo Neto de Producción:** **465 minutos diarios** (7.75 horas netas).
* **Meta Diaria de Salida:** **850 piezas terminadas** empacadas al día.
* **Meta Semanal:** **4,250 piezas terminadas** semanales (850 pzas/día x 5 días).
* **Takt Time Estándar Requerido:** **42 segundos por pieza** (465 min netos x 60 seg = 27,900 seg / 850 pzas = 32.8s ciclo puro, balanceado con tolerancias a 42s estándar de salida).

### 2.2 Política de Prohibición de Turnos Múltiples
Queda estrictamente prohibido en el sistema presentar selectores de "Turno 1 / Turno 2 / Turno 3". Toda la contabilidad horaria, cálculo de destajo y métricas Andon se rigen bajo el Turno Único.

### 2.3 Modalidad de Inicio de Turno y Medición de Ramp-up (US-17)
* **Realidad de Piso:** La caldera de vapor tarda entre 10 y 25 minutos en alcanzar temperatura y presión de régimen, y el personal realiza alistamiento de herramientas y equipo de protección antes de ingresar la primera pieza.
* **Regla de Negocio:** El sistema opera en modalidad **Dinámica** (predeterminada): el reloj de turno y la primera hora de producción miden el arranque al momento en que se escanea el primer código QR del día en Terminal, calculando los minutos de preparación (*ramp-up*) para no castigar artificialmente el cumplimiento de la hora 07:00-08:00. Dispone de alternativa **Rígida** (07:00:00) en el panel de Configuración si Dirección así lo determina.

---

## 3. Flujo Productivo de los 14 Puntos de Control y Cuello de Botella

El proceso de manufactura se compone de 14 estaciones secuenciales identificadas físicamente en la nave:

| Código | Nombre Oficial de Estación | Tipo de Operación | Operador Titular / Cuadrilla | Dinámica de Piso Validada |
|---|---|---|---|---|
| **D-01** | Corte de Cuadros (Telar) | Corte Materia Prima | J. Alatorre | Solicitud y desbobinado de telares. Corte de cuadrados de copa y falda. |
| **D-02** | Alambrado de Ala | Ensamble Preliminar | R. Méndez | Costura e inserción manual de alambre galvanizado con memoria en el borde de la falda. |
| **D-03** | Englopado / Baño de Dope | Impregnación Química | M. Torres | Sumergido en tina con sellador químico (Dope). Cada cama de secado alberga 1 lote completo con su tarjeta viajera. |
| **D-04** | Refuerzos (Pintola / Brocha) | Preparación de Cuerpo | L. Morales | Aplicación perimetral de sellador extra en área de patio exterior para dar rigidez al ala. |
| **C-01** | Control de Calidad 1 | Inspección Fija | Inspector C-01 | **Punto de Calidad Obligatorio.** Inspección post-englopado y refuerzos. Si no pasa, regresa a D-03/D-04; si pasa, libera a Rampa D-05. |
| **D-05** | Prensas de Hormado (Copa y Falda) | Termoformado a Vapor | J. Mendoza / Cuadrilla Prensas | **Cuello de Botella de la Fábrica.** Prensas secas, de vapor e hidráulicas. Entrada al área de Rampa y fraccionamiento de tarjetas. |
| **D-06** | Recorte y Refaldeado | Corte Perimetral | P. Rocha | Corte y desorillado exacto del ancho de la falda según especificación (3.5", 4", 4.5", 5"). Ubicado en área de patio exterior. |
| **D-07** | Pintura y Secado | Acabado Color | S. Vargas | Cabinas de aplicación por pistola de aire (ej. Pintura Taiwan 1125). |
| **C-02** | Control de Calidad 2 | Inspección Fija | Inspector C-02 | **Punto de Calidad Obligatorio.** Misma área física inspecciona cobertura uniforme de pintura y adherencia previo al barniz. |
| **D-08** | Brillo y Acabado Laqueado | Acabado Final Superficie | C. Delgado | Aplicación de laca brillante / mate y túnel de secado infrarrojo. |
| **D-09** | Temperado y Asentado de Falda | Termofijado de Curva | H. Estrada | Planchado de curvatura vaquera del ala (doblado arriba / abajo / plano). |
| **D-10** | Adorno 1 (Tafilete y Toquilla) | Subensamble Final | B. Lozano / Cuadrilla Adorno | **Cruce de 3 Subensambles:** Se une el cuerpo del sombrero con su tafilete interior según la talla exacta y la toquilla exterior decorativa. |
| **C-03** | Control de Calidad 3 / Final | Inspección Pieza por Pieza | Inspector C-03 | **Punto de Calidad Obligatorio.** Revisión del 100% de sombreros terminados. Piezas con defecto menor van a D-12; aprobadas van a D-13. |
| **D-11** | Empaque y Almacén PT | Acondicionamiento | G. Luna | Colocación en cajas individuales o a granel con bolsa antipolvo y horma plástica protectora. |
| **D-12** | Almacén de Segundas y Retrabajos | Almacén Especial | Auditor Calidad | Custodia de producto con defecto superficial o para venta de remate en mostrador. |
| **D-13** | Embarques y Salida | Despacho B2B | H. Estrada | Validación contra pedidos mayoristas, emisión de vales de salida en papel y entrega a camioneta del cliente. |

### 3.1 Cuello de Botella Físico Confirmado (Prensas de Hormado Secas y Vapor)
El Ing. Carlos Ortiz confirmó en el recorrido que las Prensas representan el punto más restringido del flujo:
* Cada sombrero pasa múltiples veces por la maquinaria (primero prensado de copa, luego prensado de falda, replanchado de copa y replanchado con alambre).
* En piso existe un pizarrón físico de control rotulado como *"1000 X M.T PRENSAS SECAS"* donde se anotan las metas y producciones hora por hora para 5 operaciones críticas: Hormado, Replanchar Copa, Recortar Copas, Pegar Copa c/ Falda y Replanchado c/ Alambre.

---

## 4. Gestión de Hormas y Moldes Maquinados

El Ing. Carlos Ortiz mostró físicamente el almacén de moldes ubicado junto a las prensas:
* **Identificación Visual por Color y Nombre:** Las hormas se distinguen mediante un código de color pintado en el metal y su nombre técnico:
  * **Roper:** Identificador Beige (Prensa de Vapor #1).
  * **Chaparral:** Identificador Azul (Prensa de Vapor #2).
  * **Viejón:** Identificador Rojo (Prensa Hidráulica #3).
  * **Laredo:** Identificador Verde (Prensa de Vapor #3).
  * **Frontier:** Identificador Gris (Bodega de respaldo).
* **Asignación en Planeación (PPSP):** Para arrancar una orden de producción, la horma correspondiente debe estar montada y precalentada en la prensa asignada. El cambio de horma (*SMED*) genera un tiempo muerto programado de entre 10 y 15 minutos.

---

## 5. Dinámica de Lotes, Fraccionamiento y Tarjetas Viajeras

### 5.1 Jerarquía Estándar de Producción
1. **Lote Madre (60 Piezas):**
   * Nace en Almacén de Materia Prima / Corte de Cuadros (D-01).
   * Viaja como una sola torre de 60 piezas durante la fase húmeda y de preparación inicial (Alambrado D-02, Englopado/Dope D-03, Refuerzos D-04, Calidad 1 C-01).
2. **Fraccionamiento Físico en la Rampa de Ensamble (D-05):**
   * Al llegar a la rampa de prensas, un auxiliar de línea divide físicamente la torre de 60 sombreros en **4 sublotes de 15 piezas cada uno** (ej. Lote `49,633` se divide en `49,633-1`, `49,633-2`, `49,633-3` y `49,633-4`).
   * *Excepción confirmada en audio:* Ciertas órdenes de gran volumen generan esquemas de lotificación mayores (ej. Lote `1,094` dividido hasta en 14 sublotes según el archivo Excel lotificador del cliente).
3. **Sublote (15 Piezas):**
   * Es la unidad estándar de trabajo para las estaciones de mano de obra intensiva (Recorte D-06, Pintura D-07, Brillo D-08, Temperado D-09 y Adorno 1 D-10).
   * 15 piezas corresponden a la cantidad óptima que cabe en las mesas de trabajo y estantes individuales de los operarios de adorno.

### 5.2 La Tarjeta Viajera Física de Piso
* Cada lote y sublote viaja acompañado obligatoriamente de una tarjeta de cartulina protegida dentro de una mica de plástico transparente con borde cosido en lona y cinta de transporte.
* **Encabezado Institucional:** Rótulo en tinta según la sección (ej. `TARJETA HIDRÁULICAS - ADORNO` o `TARJETA PRENSAS - PATIO`).
* **Metadatos en la Tarjeta:** Orden de Producción (`O.P.`), Folio de Lote, Modelo, Horma, Talla, Ancho de Falda, Doblado, Color y Cantidad de Piezas (15 ó 60).
* **Sticker Adhesivo de Operador:** En la esquina superior izquierda se pega un sticker de papel de color amarillo o verde con el nombre del operario en turno (ej. `JORGE`, `MELANY`).
* **Sublote en Esquina Inferior Derecha:** Las tarjetas de sublote llevan impreso en gran tamaño el número de fracción (`1`, `2`, `3`, `4`). Las tarjetas de lote madre llevan esa casilla vacía.

---

## 6. Asignación de Mano de Obra, Padrón y Trazabilidad de Operadores

### 6.1 Realidad Operativa Actual en Planta
* **Estaciones con Destajo Individual:** En Prensas (D-05), Troquelado (D-06) y Adorno (D-10), los operarios trabajan a destajo y pegan su sticker personal de papel en la tarjeta viajera física para cobrar su nómina por pieza producida.
* **Estaciones Continuas / Grupales:** En Almacén de Materia Prima (D-01), Engomado (D-02), Rampa (D-05), Inspecciones de Calidad (C-01 a C-04) y Empaque (D-11), el trabajo se realiza por cuadrilla o por el titular del área, y físicamente hoy en día **no pegan sticker de papel**.

### 6.2 Regla de Negocio Implementada en el Software (Trazabilidad 100%)
* A solicitud expresa de Dirección, el software registra el operador responsable en el 100% de los lotes a lo largo de las 14 estaciones sin excepción.
* **Mecanismo de Preselección Inteligente (Cero Fricción):**
  * En estaciones logísticas/cuadrilla sin sticker físico, el selector de la Terminal preselecciona de forma automática al operario titular del área o cuadrilla de turno (`J. Alatorre`, `R. Méndez`, `J. M. Pérez`, `G. Luna`), permitiendo confirmar el depósito del lote con **1 solo toque**.
  * En estaciones de destajo individual, el supervisor confirma o selecciona al operador específico de la máquina.
  * Cada avance de lote genera un registro histórico inmutable: `Fecha/Hora`, `Folio Lote`, `Departamento`, `Operador Asignado` y `Piezas Validadas`, abonando automáticamente al kárdex del padrón de operadores.

---

## 7. Política de Lote Completo, Rechazos de Calidad y Venta de Segundas

El Ing. Carlos Ortiz estableció taxativamente la política de calidad:
> *"¿Un lote puede salir incompleto? No, no debería de salir incompleto. Deben de salir lotes completos."*

### 7.1 Manejo de Defectos y Desviaciones
1. **Defecto Reparable (Compostura):**
   * Si una pieza presenta una falla subsanable (ej. rebaba en recorte, detalle de pintura menor), el lote o la pieza se regresa a la estación previa responsable para su corrección.
2. **Defecto No Reparable (Merma Crítica):**
   * Si la pieza se quema en prensa de vapor o sufre rotura de telar irreparable, no puede continuar hacia el cliente final.
   * **Sustitución Inmediata:** Para evitar que el lote viaje con 14 ó 59 piezas, la pieza dañada se retira y se sustituye con una pieza en blanco idéntica del inventario de amortiguamiento, manteniendo la integridad del lote de 15 ó 60 piezas.
3. **Destino de la Pieza Dañada (Almacén de Segundas D-12):**
   * La pieza retirada se transfiere físicamente al almacén de segundas (D-12).
   * Al final del ciclo de producción semanal, las piezas acumuladas en D-12 se clasifican como *Producto Regular / Segunda de Fábrica* y se venden a clientes mayoristas de saldo a precio de recuperación de material ($350 - $450 MXN), evitando pérdida total.

---

## 8. Sincronización de Subensambles en Adorno 1 (D-10)

En el departamento de Adorno 1 convergen tres flujos independientes que deben coordinarse con precisión para poder armar el sombrero:
1. **Cuerpo del Sombrero:** Proviene del túnel de secado y temperado de falda (D-09).
2. **Tafilete Interior:** Tira de piel o sintético cosida al interior de la copa. Requiere coincidencia exacta con la talla del sombrero (54 a 61).
3. **Toquilla Exterior:** Cinto decorativo de piel, fieltro, crin de caballo o herrajes metálicos que abraza la base de la copa.

### 8.1 Problema Operativo Actual
Actualmente la coordinación entre la supervisora de adorno y las preparadoras de tafilete se realiza de manera **verbal a gritos o caminando por la nave**:
> *"Oye, ¿tienes de esta talla, de este modelo?" — "Sí." — "¿Cuántos?" — "150." — "Déjate, paso 150."*

### 8.2 Regla de Negocio en Software
El supervisor debe poder visualizar en su pantalla los inventarios disponibles en los buffers de subensamble de tafiletes por talla y toquillas antes de liberar el lote a las mesas de adorno, eliminando retrasos por desabasto de componentes en mesa.

---

## 9. Despacho a Mayoristas y Puente con CONTPAQi Comercial (COMPAC)

### 9.1 Flujo Actual de Entrega
1. **Llegada del Cliente:** El cliente mayorista acude a la planta en su camioneta o transporte de carga.
2. **Vale de Salida Físico (Papel):** En el área de embarque se llena a mano un vale de papel foliado anotando los sombreros entregados por modelo, talla y cantidad.
3. **Descuento Manual en Excel:** En la oficina de programación se tiene un archivo Excel con las órdenes de producción vigentes; el encargado descuenta manualmente las piezas entregadas en el vale.
4. **Facturación en COMPAC:** El vale en papel se entrega al departamento contable, donde una capturista registra la venta en el sistema **CONTPAQi Comercial** (al que en planta llaman "COMPAC") para timbrar la factura CFDI.

### 9.2 Soporte de CONTPAQi y Restricciones Técnicas
* La empresa cuenta con una póliza de soporte anual con una ingeniera de sistemas externa especializada en CONTPAQi.
* **Regla de Alcance:** El MES no reemplaza la contabilidad ni la facturación de COMPAC. El MES digitaliza el vale de salida en piso y provee el puente de datos (vía ODBC de solo lectura en base SQL o exportación estandarizada) para eliminar la doble captura manual en Excel.

---

## 10. Condiciones Ambientales y Restricciones de Planta

| Restricción / Condición | Declaración / Hecho Validado | Impacto en Diseño del Sistema |
|---|---|---|
| **Polvo Severo en Piso** | Carlos: *"En el área de prensas y recorte hay mucho polvo. El polvo llega a dañar los equipos."* | No colocar computadoras de escritorio expuestas en naves de prensas. Uso de tablets táctiles selladas con funda de uso rudo y lectores QR ópticos industriales. |
| **Prohibición de Teléfonos Celulares** | Carlos: *"Los operarios tienen prohibido el celular en piso."* | El software no se diseña como app móvil para operarios. La interfaz es operada exclusivamente por supervisores y jefes de línea en terminales táctiles institucionales. |
| **Infraestructura de Red** | Planta cuenta con servidor local, módem de fibra y repetidores Wi-Fi distribuidos en naves. | Arquitectura basada en **Edge Local** (red local de planta). El sistema funciona de manera autónoma sin depender de internet para la operación de escaneo y tablero Andon. |
| **Ergonomía Táctil en Piso** | Supervisores portan guantes de trabajo o tienen dedos manchados de dope/adhesivo. | Botones gigantes táctiles (*touch targets* >48px), contrastes industriales de alta visibilidad (#0F172A, #F8FAFC, #8B5E3C) y navegación rápida sin escribir texto manual en piso. |

---

## 11. Flujo Operativo Óptimo de Piso (Happy Path de Terminal con PIN y Depósito Instantáneo)

Este apartado define la especificación estándar del flujo de mayor velocidad en planta, diseñado para operar en un ritmo inferior a 3 segundos por lote y sin distracción manual de los mandos medios.

### 11.1 Disposición Física de las Terminales
1. **Modalidad Estación Fija (Kiosko de Departamento):**
   * La tablet se encuentra montada en un brazo articulado o pedestal de uso rudo en el departamento crítico (ej. Prensas de Hormado D-05, Recorte D-06 o Mesa de Rampa).
   * La terminal tiene preconfigurada su estación base; cualquier lote leído en ella asume por defecto la estación de trabajo física donde está anclada.
2. **Modalidad Supervisor Móvil:**
   * La tablet es portada por el supervisor asignado a un tramo departamental específico (ej. Roberto Méndez para D-01 a D-04; Juan Manuel Pérez para D-05 a D-08).
   * La terminal opera dentro del radio de los departamentos autorizados para ese supervisor según su perfil RBAC.

### 11.2 Secuencia de Pasos del Happy Path Operativo

```
[PASO 1: 2 SEGUNDOS]
Supervisor digita PIN de 4 dígitos en Numpad táctil
→ Auto-submit instantáneo (sin botón 'Entrar')
→ Terminal desbloqueada y firmada con nombre y tramo departamental

[PASO 2: 1 SEGUNDO]
Supervisor apunta cámara del lector al código QR de la mica protectora física
→ Lectura óptica automática en <500ms
→ Extracción integral: Orden, Folio Lote, Sublote, Modelo, Talla, Falda

[PASO 3: AUTOMÁTICO <100ms]
Cruce de Datos: [Lote Escaneado] + [Estación de la Tablet / Supervisor]
→ Sistema valida: "Lote 49,633-3 completó su paso por D-05 Prensas de Hormado"
→ Consulta ruta activa del modelo: "Siguiente estación según receta: D-06 Recorte y Refaldeado"
→ Asigna automáticamente al operador titular preseleccionado o cuadrilla

[PASO 4: 1 TOQUE <1 SEGUNDO]
Supervisor pulsa botón táctil verde gigante: "Depositar Lote en Almacén de D-06 Recorte"
→ Lote transferido al buffer intermedio de la siguiente estación
→ Piezas (+15) acreditadas al destajo del operador en el Padrón
→ Contador horario y Tablero Andon actualizados en tiempo real
→ Cero formularios manuales · Retorno automático a cámara lista para el siguiente lote
```

### 11.3 Lo que Hace y lo que NO Hace el Supervisor
* **Lo que SÍ hace el supervisor:**
  1. Digitar su PIN de 4 dígitos al iniciar turno o retomar la tablet.
  2. Apuntar la cámara de la tableta al código QR dentro de la mica de piso.
  3. Cotejar en 1 segundo que los datos en pantalla coincidan con la cartulina física.
  4. Confirmar con 1 solo toque en el botón verde de avance de lote.
* **Lo que NUNCA debe hacer el supervisor (Cero Fricción):**
  * NO teclea correos electrónicos ni contraseñas alfanuméricas complejas.
  * NO escribe manualmente el modelo, talla, ancho de falda ni orden de producción (todo viene encriptado en el QR).
  * NO tiene que buscar ni seleccionar a qué departamento mandar el sombrero (la ruta programada por ingeniería decide el destino en automático).
  * NO tiene que llenar reportes de papel ni vales de libreta para comprobar el avance del destajo.

---

## 12. Matriz de Roles y Responsabilidades Validadas

| Perfil / Rol | Titulares en Planta | Responsabilidades y Atribuciones Validadas |
|---|---|---|
| **Administrador General** | Edmundo González ("Mundo") | Acceso total a todos los módulos. Auditoría de producción, métricas financieras, configuración de parámetros de turno y gestión de usuarios administradores e ingenieros. |
| **Ingeniero de Procesos** | Ing. Carlos Ortiz | Control de Takt Time, edición de rutas de fabricación por modelo, asignación de moldes/hormas a prensas, altas de departamentos/estaciones, creación y asignación de supervisores y operarios. |
| **Supervisores de Línea** | Juan Manuel Pérez (Depts 05-08) / Roberto Méndez (Depts 01-04) | Escaneo de tarjetas viajeras con cámara, verificación física de micas, asignación de operadores, confirmación de avance de lotes en sus departamentos autorizados y reporte de paros/mermas. |
| **Auditores de Calidad** | Inspectores C-01, C-02, C-03 | Liberación de puntos de control de calidad in-app (`Liberar Lote`), reporte de causas de defecto y desvío de piezas a retrabajo o segundas (D-12). |
| **Operadores de Piso** | Cuadrillas de 14 Estaciones | Ejecución física de la manufactura. Sin interacción directa con el software; su trabajo se registra mediante la lectura de sus tarjetas viajeras por el supervisor. |

---

## 13. Historial de Control de Cambios del Documento

| Fecha | Versión | Cambios Realizados y Justificación Técnica |
|---|---|---|
| **26/09/2026** | `v2.18.0` | **Incorporación del Flujo Operativo Óptimo de Piso (Sección 11):** Definición detallada del Happy Path de escaneo ultrarrápido con PIN de 4 dígitos, cruce automático de Lote + Estación para cálculo de destino sin formularios, y delimitación clara de acciones del supervisor. |
| **26/09/2026** | `v2.18.0` | **Creación inicial del Documento Maestro de Operación y Reglas de Negocio Validadas.** Consolidación fidedigna de las grabaciones de audio en planta, levantamiento presencial de procesos, inventario de hormas por color, flujo de 14 puntos, fraccionamiento de 60 a 15 pzas en rampa, y supresión de supuestos no confirmados. |

> **Compromiso de Sincronización Continua (`REGLA 0.36`):** Este documento se mantendrá sincronizado de forma obligatoria e inmediata ante cualquier nuevo descubrimiento, ajuste de proceso o acuerdo formal alcanzado en las reuniones de trabajo con Tombstone Hats.
