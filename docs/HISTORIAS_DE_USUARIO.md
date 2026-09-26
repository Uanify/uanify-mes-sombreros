# 🤠 Catálogo Integral de Historias de Usuario (User Stories)
## Tombstone Hats MES · Control de Planta, Trazabilidad y Tablero Andon
> **Documento de Especificación Ágil de Historias de Usuario**  
> **Versión del Sistema:** `v2.18.0` | **Fecha:** 25 de Septiembre de 2026  
> **Planta Matriz:** San Francisco del Rincón, Guanajuato | **Cliente:** Tombstone Hats  
> **Estatus:** Base completa para revisión y validación de alcance con Dirección e Ingeniería.

---

## 📌 Guía de Clasificación de Estatus

Cada historia de usuario cuenta con un indicador de estado para facilitar tu revisión:
* **`[✅ Implementado v2.18.0]`**: Funcionalidad ya programada, probada y desplegada en la versión actual.
* **`[🟡 En Revisión / Propuesto]`**: Funcionalidad planteada en el alcance que requiere confirmación de reglas con el cliente.
* **`[⏳ Fase 2 / Escalabilidad]`**: Funcionalidad contemplada en la arquitectura técnica para activarse en una etapa posterior.

---

## 📑 Índice de Módulos de Historias de Usuario

1. [Módulo 0: Autenticación, Seguridad y RBAC](#módulo-0-autenticación-seguridad-y-control-de-acceso-rbac)
2. [Módulo 1: Terminal de Supervisor, Escaneo QR y Control de Piso](#módulo-1-terminal-de-supervisor-escaneo-qr-y-control-de-piso)
3. [Módulo 2: Tablero Andon Digital en Nave Central](#módulo-2-tablero-andon-digital-en-nave-central)
4. [Módulo 3: Almacenes Físicos, Inventarios, Catálogo de Sombreros y Hormas](#módulo-3-almacenes-físicos-inventarios-catálogo-de-sombreros-y-hormas)
5. [Módulo 4: Padrón de Operadores y Mano de Obra](#módulo-4-padrón-de-operadores-y-mano-de-obra)
6. [Módulo 5: Analítica & KPIs de Planta (Ingeniería y Dirección)](#módulo-5-analítica--kpis-de-planta-ingeniería-y-dirección)
7. [Módulo 6: Configuración de Planta, Rutas y CONTPAQi ERP (COMPAC)](#módulo-6-configuración-de-planta-rutas-y-contpaqi-erp-compac)
8. [Módulo 7: Generación de Tarjetas Viajeras, Pedidos y Compras (Nuevas Propuestas)](#módulo-7-generación-de-tarjetas-viajeras-pedidos-y-compras-nuevas-propuestas)

---

## Módulo 0: Autenticación, Seguridad y Control de Acceso (RBAC)

### US-01: Selección de Perfil y Login Rápido
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Operador, Supervisor, Ingeniero o Administrador de planta.
* **Quiero:** Poder seleccionar mi usuario desde un selector visual o ingresar con un PIN rápido de 4 dígitos.
* **Para:** Acceder a la plataforma en menos de 3 segundos desde la tablet o computadora sin teclear correos largos en piso de producción.
* **Criterios de Aceptación:**
  * Al ingresar al sistema sin sesión activa se muestra el selector de perfiles con avatars y roles claros (Edmundo - Admin, Carlos - Ingeniero, Juan Manuel - Supervisor Depts 05-08, Roberto - Supervisor Depts 01-04).
  * La sesión seleccionada se almacena en memoria local (`localStorage`) para no perderse si se refresca la página.

### US-02: Ocultamiento Estricto de Módulos No Autorizados
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de línea (`Juan Manuel` / `Roberto`).
* **Quiero:** Que en mi menú de navegación únicamente se muestren los módulos que me corresponden (Terminal y Tablero Andon).
* **Para:** No distraerme con módulos administrativos ni ver candados disuasorios (`🔒`) o alertas de permiso denegado.
* **Criterios de Aceptación:**
  * Si el usuario no tiene permiso para `analytics`, `config`, `inventory` u `operators`, los botones no se muestran en el DOM o tienen `display: none`.
  * La barra lateral solo muestra las opciones autorizadas.

### US-03: Matriz de Permisos Modulares por Usuario
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Administrador (`Edmundo González`).
* **Quiero:** Un modal interactivo donde pueda marcar o desmarcar permisos módulo por módulo para cualquier usuario.
* **Para:** Ajustar las facultades de cada mando de planta de acuerdo con la evolución del equipo.
* **Criterios de Aceptación:**
  * Modal `modalEditPermissions` con checkboxes para cada módulo (`Andon`, `Terminal`, `Almacenes`, `Operadores`, `Analítica`, `Configuración`).
  * Los cambios se aplican de inmediato en la sesión activa y persisten en la base local.

### US-04: Cierre de Sesión Seguro
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Cualquier usuario del sistema.
* **Quiero:** Un botón accesible de "Cerrar Sesión" en la barra superior o lateral.
* **Para:** Dejar la terminal libre cuando cambio de turno o entrego la tablet a otro compañero.
* **Criterios de Aceptación:**
  * Al pulsar "Cerrar Sesión" se purga la sesión activa y se regresa de inmediato a la pantalla de Login RBAC.

---

## Módulo 1: Terminal de Supervisor, Escaneo QR y Control de Piso

### US-05: Escaneo de Tarjeta Viajera con Cámara en Vivo
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de línea.
* **Quiero:** Abrir el escáner de cámara web/tablet con retícula visual industrial para leer el código QR de la tarjeta viajera de la torre de sombreros.
* **Para:** Identificar de inmediato el lote sin teclear números de folio manualmente.
* **Criterios de Aceptación:**
  * La cámara se activa mediante `getUserMedia` y ajusta el enfoque.
  * Al detectar el QR, decodifica: Orden (`15068`), Lote (`49,386`), Sublote (`0` si es madre o `1..4`), Modelo (`Denver Master`), Talla (`56`), Falda (`9.0 cm`).

### US-06: Verificación Previa Obligatoria de Tarjeta Física (Mica de Piso)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de línea.
* **Quiero:** Que tras escanear el QR se despliegue en pantalla una réplica visual idéntica de la tarjeta viajera física para cotejar contra la torre.
* **Para:** Asegurar al 100% que la mica que tengo en las manos coincide con el lote digital antes de autorizar cualquier movimiento.
* **Criterios de Aceptación:**
  * Modal visual con encabezado departamental (`TARJETA HIDRÁULICAS - ADORNO`), sticker de operador (`JORGE`), modelo, falda, doblado, talla y cantidad (15 o 60 pzas).
  * Dos botones táctiles gigantes: `"Tarjeta Incorrecta / Re-escanear"` vs `"Confirmar y Proceder"`.

### US-07: Depósito y Traspaso Automático por Secuencia de Ruta
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de línea.
* **Quiero:** Que al confirmar el trabajo en mi estación, el sistema calcule automáticamente cuál es el departamento siguiente según la ruta del modelo y deposite el lote en el almacén intermedio correspondiente.
* **Para:** No tener que seleccionar a mano a dónde mandar el sombrero, evitando errores de desvío de producto.
* **Criterios de Aceptación:**
  * El sistema consulta la secuencia del modelo (`El Viejonón`, `Denver`, etc.) y transfiere el lote al almacén de amortiguamiento de la siguiente estación.
  * Se genera una notificación toast de confirmación y se actualiza el contador de piezas en rampa.

### US-08: Asignación del Operador Responsable (Destajo / Nómina)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de línea.
* **Quiero:** Seleccionar con un toque táctil el nombre del operador que procesó la torre en la máquina antes de dar la salida.
* **Para:** Que quede registrado el récord de mano de obra y se acumulen las piezas procesadas al destajo del operador.
* **Criterios de Aceptación:**
  * Selector rápido con los operadores asignados a esa estación (ej. `Jorge Mendoza`, `Melany Ramos`).
  * El récord guarda: `Fecha`, `Hora`, `Lote`, `Estación`, `Operador`, `Piezas`.

### US-09: Fraccionamiento de Lote Madre (60 a 15 piezas) en Rampa (D-05)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor o Encargado de Rampa (D-05).
* **Quiero:** Poder escanear el Lote Madre de 60 piezas y pulsar un botón `"Fraccionar Lote en 4 Sublotes de 15 pzas"`.
* **Para:** Dividir la torre madre en 4 sublotes individuales (`49,633-1`, `49,633-2`, `49,633-3`, `49,633-4`) para que viajen de forma independiente a ribeteado y adorno.
* **Criterios de Aceptación:**
  * El botón solo se habilita si el lote es de 60 piezas y está en la Rampa D-05.
  * El sistema genera los 4 registros de sublote con 15 piezas cada uno y descuenta el lote madre de 60 piezas.

### US-10: Restricción Departamental Estricta para Supervisores
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Administrador de planta.
* **Quiero:** Que cada supervisor solo pueda mover lotes que estén en sus departamentos autorizados (ej. Roberto solo D-01 a D-04; Juan Manuel solo D-05 a D-08).
* **Para:** Evitar que un supervisor firme por error el avance de un departamento que no le corresponde supervisar.
* **Criterios de Aceptación:**
  * Si Juan Manuel intenta procesar un lote ubicado en Prensas (D-03), el sistema bloquea la acción con un mensaje indicando que la estación pertenece a Roberto Méndez.

### US-11: Monitor de Almacenes Intermedios ("Mis Almacenes")
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de línea.
* **Quiero:** Una vista consolidada en mi tablet con tarjetas de cada uno de mis departamentos asignados, mostrando cuántos lotes y piezas tengo retenidas en el buffer.
* **Para:** Ver el estado de mi línea sin tener que caminar de un extremo a otro de la nave.
* **Criterios de Aceptación:**
  * Tarjetas por departamento con indicador numérico de piezas activas, capacidad máxima WIP y barra de saturación cromática (Verde si <70%, Amarillo si >70%, Rojo si >90%).

### US-12: Mapa de Proceso y Rastreador de Lote en Tiempo Real (Value Stream Map)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor, Ingeniero o Administrador.
* **Quiero:** Buscar cualquier folio de lote o sublote y ver una línea de tiempo horizontal con todas las estaciones del proceso.
* **Para:** Saber exactamente en qué departamento físico está la torre en este segundo, qué operador la trabajó y cuánto tiempo lleva detenida.
* **Criterios de Aceptación:**
  * Despliegue secuencial: estaciones completadas con palomita verde (✅), estación activa con badge pulsante (**📍 AQUÍ ESTÁ EL LOTE**), y próximas estaciones por recorrer.
  * Botones de avance rápido (`⏩`) o retroceso (`⏮️`) para corregir desfasamientos de piso.

---

## Módulo 2: Tablero Andon Digital en Nave Central

### US-13: Semáforos Visuales de Avance por Estación en Piso
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Operadores y Supervisores en la nave de producción.
* **Quiero:** Ver una pantalla Smart TV central con el estado en tiempo real de los 14 departamentos en verde, amarillo o rojo.
* **Para:** Detectar a 20 metros de distancia si alguna estación está parada o acumulando material.
* **Criterios de Aceptación:**
  * Cada departamento tiene su semáforo visible con piezas acumuladas y Takt Time.

### US-14: Control de Takt Time Estándar (42 segundos)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Procesos y Supervisores.
* **Quiero:** Un reloj de Takt Time en el Andon que marque el ritmo de 42 segundos por pieza.
* **Para:** Asegurar que la nave mantenga el ritmo necesario para cumplir la meta diaria de 850 piezas sin requerir tiempo extra.
* **Criterios de Aceptación:**
  * Indicador de Takt Time con comparativa de tiempo real vs estándar.

### US-15: Monitoreo de Meta Diaria y Meta Semanal (4,250 piezas)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Dirección (`Edmundo`) y Supervisores.
* **Quiero:** Un velocímetro de avance con las piezas terminadas hoy contra la meta diaria (850 pzas) y el acumulado semanal contra 4,250 piezas.
* **Para:** Conocer el porcentaje exacto de cumplimiento de la semana al instante.
* **Criterios de Aceptación:**
  * Barra de progreso con porcentaje, piezas faltantes y proyección de cierre de turno.

### US-16: Comparativa Hora por Hora de Producción (Reemplazo del Pizarrón)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de producción.
* **Quiero:** Una tabla horaria (07:00-08:00, 08:00-09:00... hasta las 15:30) que muestre las piezas programadas vs las piezas reales producidas.
* **Para:** Eliminar el pizarrón blanco de pared donde antes se anotaba con plumón cada hora.
* **Criterios de Aceptación:**
  * Tabla con meta por hora (~106 pzas/hora), producido real y delta (+/-). Resalta en rojo las horas con déficit.

### US-17: Inicio de Turno Dinámico con el Primer Escaneo del Día
* **Estatus:** `[🟡 En Revisión / Propuesto]`
* **Como:** Ingeniero de Procesos.
* **Quiero:** Que el cronómetro de Takt Time y el cálculo de horas efectivas de producción se disparen automáticamente al registrar el **primer código QR del día**.
* **Para:** Medir el tiempo real de precalentamiento y arranque de línea (*ramp-up*) sin penalizar artificialmente la primera hora del turno si la caldera tardó en alcanzar temperatura.
* **Criterios de Aceptación:**
  * El sistema detecta el primer escaneo después de las 06:30 AM y fija la hora de arranque real de la jornada.

---

## Módulo 3: Almacenes Físicos, Inventarios, Catálogo de Sombreros y Hormas

### US-18: Catálogo Maestro de Sombreros Fabricados y Variaciones
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Almacenista, Ingeniero o Vendedor.
* **Quiero:** Consultar la lista maestra de sombreros que produce la planta (*Denver Master*, *El Viejonón*, *Chaparral*, *Sonora*, etc.) con sus tallas (54 a 61), faldas (3.5" a 4.5"), toquillas y precios B2B.
* **Para:** Tener centralizadas las especificaciones técnicas de producto terminado.
* **Criterios de Aceptación:**
  * Tabla estandarizada con thumbnail del sombrero, código, nombre, material, tallas disponibles, dimensiones de copa/falda, horma asociada, precio y estatus.

### US-19: Visor de Ficha Técnica de Sombrero
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de Adorno, Calidad o Ingeniero.
* **Quiero:** Pulsar el botón `"Ficha"` en cualquier sombrero y abrir un modal técnico con la foto en alta resolución, dimensiones exactas y materiales de ensamble.
* **Para:** Comparar el sombrero físico en mesa de ensamble contra su especificación de diseño oficial.
* **Criterios de Aceptación:**
  * Modal `modalHatTechnicalSheet` con layout técnico: foto lateral del sombrero, tabla de variaciones de talla, horma requerida y lista de componentes (toquilla, tafilete, herrajes).

### US-20: Alta y Edición de Sombreros con Carga de Fotos Drag & Drop
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Producto / Administrador.
* **Quiero:** Registrar un nuevo modelo de sombrero arrastrando una fotografía o seleccionándola desde mi dispositivo, guardándose offline en Base64.
* **Para:** Dar de alta nuevos estilos de temporada sin depender de servidores externos ni enlaces rotos.
* **Criterios de Aceptación:**
  * Dropzone interactivo con preview inmediato, validación de formato (.jpg, .png, .webp) y botón de eliminar foto.
  * Al guardar, el sombrero se añade de inmediato a la tabla y persiste en almacenamiento local.

### US-21: Catálogo Maestro de Hormas y Moldes Maquinados de Aluminio
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de Prensas / Ingeniero.
* **Quiero:** Consultar las hormas de aluminio de los racks de planta (`#54 Johnson`, `#55 Viejonón`, `#57 Sonora`, etc.) con su aleación, temperatura de vapor requerida (165°C-180°C) y presión de prensado.
* **Para:** Montar la horma correcta en la prensa `Michelagnoli` correspondiente y evitar quemar campanas.
* **Criterios de Aceptación:**
  * Tabla con thumbnail de la horma, código de rack, nombre, máquina asignada, temperatura/presión estándar y ciclo de vida útil acumulado.

### US-22: Ficha Técnica y Control de Ciclos de Vida de Hormas
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Encargado de Mantenimiento / Prensas.
* **Quiero:** Abrir la ficha técnica de una horma y consultar su barra de progreso de desgaste (ciclos de prensado acumulados vs vida útil de 50,000 golpes).
* **Para:** Mandar a rectificar o pulir el molde antes de que provoque imperfecciones en la copa del sombrero.
* **Criterios de Aceptación:**
  * Modal `modalMoldTechnicalSheet` con gráfico de barra de vida útil, ciclos restantes y moldes complementarios requeridos.

### US-23: Monitor de los 5 Almacenes Físicos de Planta
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Almacenista General / Ingeniero.
* **Quiero:** Consultar el stock consolidado en los 5 almacenes clave: Materia Prima (D-01), Rampa WIP (D-05), Pulmón Pre-Prensas, Producto Terminado y Almacén de Merma/Retrabajo (D-12).
* **Para:** Saber en qué almacén físico está concentrado el inventario de la fábrica.
* **Criterios de Aceptación:**
  * Selector de almacén, desglose de lotes por almacén y valorización estimada.

### US-24: Control de Inventario de Tafiletes por Talla Crítica (#54 a #60)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Supervisor de Ribeteado (D-06).
* **Quiero:** Ver en una tabla cuántos tafiletes de cuero foliados con oro Tombstone hay en stock para cada talla craneal.
* **Para:** Alertar al taller de corte antes de que se agote una talla y frene la línea de producción.
* **Criterios de Aceptación:**
  * Tabla por tallas con cantidad disponible, stock mínimo de seguridad y pastilla de alerta si está por debajo de 50 piezas.

### US-25: Kárdex General de Movimientos y Transferencias
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Administrador / Auditor de Inventarios.
* **Quiero:** Un historial cronológico de todas las entradas, salidas, mermas y traspasos entre almacenes con fecha, hora, lote y usuario responsable.
* **Para:** Rastrear cualquier discrepancia física de inventario contra lo registrado en el sistema.
* **Criterios de Aceptación:**
  * Tabla de kárdex con filtros multi-criterio por tipo de movimiento (Entrada, Traspaso, Ajuste, Merma) y rango de fechas.

---

## Módulo 4: Padrón de Operadores y Mano de Obra

### US-26: Directorio Integral de Operadores de Planta
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Procesos / Supervisor.
* **Quiero:** Una lista de todos los operarios de la planta con su número de nómina, departamento, máquina asignada y turno.
* **Para:** Saber quién está activo en cada puesto sin darles cuentas de acceso ni contraseñas innecesarias.
* **Criterios de Aceptación:**
  * Tabla con foto/avatar del operador, nómina, nombre completo, departamento, máquina, piezas procesadas en el turno y estatus activo/inactivo.

### US-27: Conteo Diario de Piezas Procesadas por Operador (Destajo)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Recursos Humanos / Nóminas / Supervisor.
* **Quiero:** Ver en tiempo real la sumatoria de sombreros que cada trabajador ha procesado el día de hoy.
* **Para:** Validar la nómina por destajo y calcular bonos de productividad sin vales de libreta de papel.
* **Criterios de Aceptación:**
  * Contador dinámico de piezas que se incrementa cada vez que un supervisor transfiere un lote asignado a ese operador.

### US-28: Alta y Edición de Operadores
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Administrador o Ingeniero.
* **Quiero:** Dar de alta nuevos trabajadores asignándoles su máquina y estación correspondiente.
* **Para:** Mantener el padrón actualizado cuando entra nuevo personal o hay rotación de puestos.
* **Criterios de Aceptación:**
  * Modal `modalCreateOperator` con validación de nómina única y selección de estación de trabajo.

---

## Módulo 5: Analítica & KPIs de Planta (Ingeniería y Dirección)

### US-29: Tablero Centralizado de OEE (Eficiencia Global de Planta)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Procesos (`Carlos`) y Dirección (`Edmundo`).
* **Quiero:** Consultar el indicador OEE de la planta desagregado en sus tres factores: Disponibilidad, Rendimiento y Calidad.
* **Para:** Saber con precisión matemática en cuál de los tres pilares estamos perdiendo capacidad productiva.
* **Criterios de Aceptación:**
  * Tarjetas de OEE global (ej. 83.4%) con sub-métricas: Disponibilidad (91.2%), Rendimiento (88.7%) y Calidad (98.2%), con semáforo estándar internacional.

### US-30: Valorización Financiera de Producción en Vivo
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Administrador (`Edmundo`).
* **Quiero:** Ver el valor comercial en pesos mexicanos ($ MXN) de todo el lote que se encuentra en proceso y terminado, calculado a precio de catálogo ($1,310 MXN).
* **Para:** Conocer el valor del inventario en piso en cualquier momento de la semana.
* **Criterios de Aceptación:**
  * Tarjeta de valor total (ej. `$801,720 MXN`), porcentaje destinado a pedidos mayoristas B2B (72%), valor recuperable en segundas ($17,030 MXN) y costo de merma ($18,340 MXN).

### US-31: KPIs de Cumplimiento por Supervisor y Tramo Departamental
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Dirección e Ingeniería.
* **Quiero:** Comparar el rendimiento del tramo de Roberto Méndez (D-01 a D-04) contra el tramo de Juan Manuel Pérez (D-05 a D-08).
* **Para:** Identificar cuál supervisor tiene saturada su línea o acumulando retrasos en el flujo.
* **Criterios de Aceptación:**
  * Gráficas comparativas de piezas entregadas a tiempo, tiempo promedio de ciclo y tasa de defectos por supervisor.

### US-32: Balanceo de Líneas y Detección de Cuellos de Botella
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Procesos.
* **Quiero:** Una gráfica de barras con el tiempo de ciclo real de cada departamento comparado contra la línea roja del Takt Time (42s).
* **Para:** Detectar qué máquina está trabajando por encima del ritmo (cuello de botella) y balancear operadores.
* **Criterios de Aceptación:**
  * Gráfica donde Prensas de Vapor (D-03) o Ribeteado (D-06) resaltan si superan los 42 segundos estándar.

### US-33: Bitácora de Paros e Incidencias SMED (Tiempos Muertos)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Procesos / Supervisor.
* **Quiero:** Registrar y consultar los paros de máquina (cambios de horma, caídas de caldera de vapor, desabasto de insumos, fallas mecánicas) con hora de inicio, fin y duración.
* **Para:** Analizar las causas raíz de paros mediante un diagrama de Pareto y reducir el tiempo de cambio de molde (SMED).
* **Criterios de Aceptación:**
  * Tabla histórica con fecha, estación, tipo de paro, duración en minutos e impacto estimado en piezas no producidas.

### US-34: Matriz de Materiales (BOM) y Simulación de Proveedores
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Procesos / Compras.
* **Quiero:** Consultar la lista de materiales requerida para armar cada modelo de sombrero (campana, adhesivo, badana de piel, toquilla, herrajes) y simular el impacto en costos si cambio de proveedor de materia prima.
* **Para:** Evaluar márgenes de rentabilidad antes de autorizar órdenes de compra mayoristas.
* **Criterios de Aceptación:**
  * Tabla BOM interactiva con desglose de insumos, unidad de medida, proveedor actual, costo unitario y costo total por sombrero.

---

## Módulo 6: Configuración de Planta, Rutas y CONTPAQi ERP (COMPAC)

### US-35: CRUD Integral de Departamentos y Almacenes Intermedios
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Procesos / Administrador.
* **Quiero:** Crear, editar y dar de baja departamentos de planta, asignándoles su código (`D-XX`), nombre, supervisor responsable, Takt Time estándar y capacidad buffer WIP.
* **Para:** Modelar la estructura física de la fábrica y adaptarla si se agrega una nueva máquina o área de trabajo.
* **Criterios de Aceptación:**
  * Modal `modalCreateStation` y `modalEditStation` con validación de código único y persistencia en base local.

### US-36: Modelador de Rutas y Secuencias por Modelo con Drag & Drop
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Procesos.
* **Quiero:** Una pantalla donde seleccione un modelo de sombrero y pueda reordenar visualmente sus pasos de fabricación arrastrando y soltando las estaciones (`⠿`), o agregando/quitando filtros de calidad.
* **Para:** Configurar que los sombreros de 2 piezas sigan una ruta larga (14 pasos) y los de campana preformada sigan una ruta corta sin troquelado ni rampa.
* **Criterios de Aceptación:**
  * Interfaz drag & drop táctil y de cursor. Los cambios se guardan por modelo y determinan a qué estación se transfiere el lote al escanear.

### US-37: CRUD de Puntos de Inspección de Calidad (`C-XX`) y Tolerancias
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Ingeniero de Calidad / Procesos.
* **Quiero:** Dar de alta puntos de inspección intermedios (`C-01` a `C-04`) con sus tolerancias dimensionales en falda y copa, criterios de inspección e inspector asignado.
* **Para:** Asegurar que los estándares de calidad de Tombstone se cumplan antes de autorizar el paso del lote a empaque.
* **Criterios de Aceptación:**
  * Tabla y modal de filtros de calidad con captura de tolerancias numéricas (ej. `± 2 mm` en falda) e inspectores responsables.

### US-38: Configuración del Horario de Turno Único de Planta
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Administrador de planta.
* **Quiero:** Configurar la hora de entrada (`07:00`), hora de salida (`15:30`), horario de comida/descanso (`12:00 a 12:45`) y días laborables (`Lunes a Viernes`).
* **Para:** Que todos los cálculos de Takt Time, horas efectivas de producción y Andon estén sincronizados con la jornada real de Tombstone.
* **Criterios de Aceptación:**
  * Formulario de turno con previsualización en vivo de minutos netos de producción (465 min netos).

### US-39: Monitor Aislado de Integración CONTPAQi ERP (COMPAC)
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Administrador / Encargado de Sistemas.
* **Quiero:** Un módulo técnico aislado dentro de Configuración con el estatus de conexión ODBC al servidor de COMPAC, prueba de ping en vivo y mapeo de almacenes contables.
* **Para:** Monitorear el enlace con el ERP sin interferir con la operación en piso ni exponer configuraciones fiscales a los supervisores.
* **Criterios de Aceptación:**
  * Botón `"Probar Conexión con CONTPAQi ERP"` que simula el handshake ODBC con la base de datos SQL Server y arroja diagnóstico de latencia y estado.
  * Tabla de mapeo de bodegas (Almacén 01 Materia Prima, Almacén 05 WIP, Almacén 10 Terminado).

### US-40: Emisión de Vales de Salida y Remisión B2B
* **Estatus:** `[✅ Implementado v2.18.0]`
* **Como:** Administrador (`Edmundo`).
* **Quiero:** Generar un vale de camioneta digital al concluir un lote en empaque, indicando piezas de primera aprobadas, mermas y cliente destino.
* **Para:** Entregar el comprobante al chofer de reparto y sincronizar el descuento de inventario en COMPAC.
* **Criterios de Aceptación:**
  * Modal de emisión de vale con folio único, desglose de piezas, firma de entrega y opción de exportación a CSV/Excel.

---

## Módulo 7: Generación de Tarjetas Viajeras, Pedidos y Compras (Nuevas Propuestas)

### US-41: Módulo Propio de Generación e Impresión de Tarjetas Viajeras
* **Estatus:** `[🟡 En Revisión / Propuesto]`
* **Como:** Encargado de Almacén de Materia Prima (D-01) o Programación.
* **Quiero:** Un botón en el sistema para generar la tarjeta viajera con su formato estándar (datos fijos, O. Prod, modelo, talla, falda y código QR) y mandarla a imprimir directamente a una impresora láser de oficina conectada en red.
* **Para:** Independizarnos del sistema de etiquetas actual y asegurar que cada torre salga a piso con su QR legible desde el primer minuto.
* **Criterios de Aceptación:**
  * Generador de plantilla de impresión en tamaño carta/media carta para recortar y colocar dentro de la mica transparente existente.
  * Folios secuenciales automáticos sin duplicados y registro de reimpresiones en caso de extravío.

### US-42: Registro de Pedidos de Clientes Mayoristas y Metas de Stock
* **Estatus:** `[🟡 En Revisión / Propuesto]`
* **Como:** Área de Ventas / Planeación.
* **Quiero:** Capturar los pedidos de clientes mayoristas (ej. 300 sombreros Viejonón para *Tiendas Western*) con fecha compromiso de entrega.
* **Para:** Que el sistema genere automáticamente las órdenes de producción necesarias y establezca la prioridad de fabricación en piso.
* **Criterios de Aceptación:**
  * Pantalla de pedidos con estatus de avance porcentual en tiempo real (% fabricado vs % solicitado).

### US-43: Solicitudes a Compras y Recepción de Materia Prima
* **Estatus:** `[🟡 En Revisión / Propuesto]`
* **Como:** Almacenista de Materia Prima / Compras.
* **Quiero:** Registrar la entrada de rollos de telar, campanas de lana, piel para tafiletes y cajas al almacén D-01, con alertas automáticas cuando el stock llegue a un nivel crítico.
* **Para:** Evitar desabastos de insumos que detengan las prensas de vapor o las mesas de ribeteado.
* **Criterios de Aceptación:**
  * Formulario de recepción de materia prima con afectación al inventario inicial de planta y semáforos de stock mínimo.

### US-44: Modo Sin Conexión a Internet (Offline Cache y Sincronización)
* **Estatus:** `[🟡 En Revisión / Propuesto]`
* **Como:** Supervisor con tablet en zonas de la nave con Wi-Fi débil o intermitente.
* **Quiero:** Que la aplicación me permita seguir escaneando lotes y registrando avances aunque se corte la señal momentáneamente, y que se sincronice sola al reconectarse.
* **Para:** No frenar el trabajo de los operarios por problemas de red local.
* **Criterios de Aceptación:**
  * Almacenamiento temporal de eventos en cola local (`IndexedDB / localStorage`). Al recuperar conexión a la red, los movimientos se envían al servidor en el orden cronológico exacto.

### US-45: Auditoría y Venta de Segundas de Fábrica (Proceso de Viernes)
* **Estatus:** `[🟡 En Revisión / Propuesto]`
* **Como:** Inspector de Calidad / Supervisor.
* **Quiero:** Un módulo específico para auditar las piezas defectuosas acumuladas en la semana en el Almacén D-12 (Merma y Segundas), clasificándolas en: a) Recuperables por reproceso, b) Segunda de fábrica para venta de remate en mostrador, o c) Desecho total.
* **Para:** Formalizar el ritual semanal de recuperación de merma de los viernes y monetizar las piezas con defectos menores.
* **Criterios de Aceptación:**
  * Pantalla de revisión de segundas con registro de causas de defecto (mancha, deformación, costura) y reasignación de estatus en inventario.

---

## 📊 Matriz de Resumen y Cobertura

| Módulo | Historias Implementadas (`v2.18.0`) | Historias Propuestas / Por Validar | Total Historias |
|---|:---:|:---:|:---:|
| **0. Seguridad y RBAC** | 4 (US-01 a US-04) | 0 | 4 |
| **1. Terminal y Escaneo QR** | 8 (US-05 a US-12) | 0 | 8 |
| **2. Tablero Andon** | 4 (US-13 a US-16) | 1 (US-17) | 5 |
| **3. Almacenes, Sombreros y Hormas** | 8 (US-18 a US-25) | 0 | 8 |
| **4. Padrón de Operadores** | 3 (US-26 a US-28) | 0 | 3 |
| **5. Analítica & KPIs** | 6 (US-29 a US-34) | 0 | 6 |
| **6. Configuración y COMPAC** | 6 (US-35 a US-40) | 0 | 6 |
| **7. Tarjetas, Pedidos y Compras** | 0 | 5 (US-41 a US-45) | 5 |
| **TOTAL GENERAL** | **39 Historias Listas** | **6 Historias a Validar** | **45 Historias** |

---

### 💡 Recomendación para tu Revisión:
1. Revisa las historias del **Módulo 1** y **Módulo 3** para confirmar que el flujo de escaneo y el catálogo de sombreros reflejen exactamente lo que necesitas.
2. Analiza las **5 historias del Módulo 7 (US-41 a US-45)**: son las que provienen de la propuesta de tu amigo y de las pláticas recientes. Dime cuáles de esas 5 quieres que incorporemos formalmente en el sistema ahora o cuáles dejamos para la Fase 2.
