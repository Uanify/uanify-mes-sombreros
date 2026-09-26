# Banco Oficial de Dudas Técnicas y Validaciones con el Cliente
## Tombstone Hats MES · Control de Planta, Trazabilidad y Tablero Andon
> **Instrumento de Descubrimiento Técnico y Minuta de Acuerdos de Planta**  
> **Versión:** 1.0.0 | **Fecha:** 26 de Septiembre de 2026  
> **Participantes Objetivo:** Edmundo González (Dirección General), Ing. Carlos Ortiz (Ingeniería de Procesos)  
> **Desarrollador / Consultor:** Uanify  

---

## Proposito del Documento

Este documento concentra de forma estructurada todas las preguntas, supuestos operativos y puntos de decisión técnica identificados durante el análisis de ingeniería y modelado del sistema MES para la planta matriz de Tombstone Hats en San Francisco del Rincón, Guanajuato.

Su objetivo es servir como guía de entrevista ejecutiva en las sesiones de validación con Dirección e Ingeniería, asegurando que cada funcionalidad implementada responda con fidelidad a la operación real de la fábrica y no a supuestos teóricos.

---

## 1. Roles, Permisos y Usuarios de Planta

### DUD-01: Facultades del Rol Ingeniero (Carlos Ortiz)
* **Pregunta para el Cliente:** ¿Confirmamos que el Ingeniero de Procesos tendrá autorización para dar de alta y editar **Supervisores de Planta** y **Operadores de Piso**, pero **NO** podrá crear otros Administradores ni modificar la matriz global de permisos del sistema?
* **Justificación / Origen:** En planta, Carlos necesita dar de alta cuadrillas de operarios y supervisores conforme a la rotación de turnos sin esperar a Dirección, pero la administración de accesos directivos y configuraciones de COMPAC debe quedar blindada para Edmundo.
* **Impacto en el Software:** 
  * El botón "+ Registrar Usuario" para rol Ingeniero se limita a los tipos `Supervisor` y `Operador`.
  * La edición de la matriz RBAC modular queda oculta para el Ingeniero.
* **Estatus:** Validado internamente con Andrés · Por ratificar con Edmundo.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

### DUD-02: Autoridad y Rol para Inspección de Calidad (C-XX y D-11)
* **Pregunta para el Cliente:** ¿Quién es la persona física que aprueba o rechaza los lotes en la mesa de inspección de calidad? ¿Es el mismo supervisor del tramo departamental (Juan Manuel / Roberto) o existe un **Auditor / Inspector de Calidad independiente**?
* **Justificación / Origen:** Si el mismo supervisor de producción que tiene la presión de cumplir la meta diaria es quien aprueba la calidad, existe el riesgo operativo de que apruebe sombreros dudosos para no frenar su número. Si existe un auditor de calidad independiente, este debe tener su propio usuario y pantalla enfocada en checklists de defectos.
* **Impacto en el Software:**
  * Si es independiente: Se formaliza el rol `Auditor de Calidad` con pantalla exclusiva de aprobación/rechazo de lotes.
  * Si es el supervisor: Se mantiene el rol `Supervisor` asignándole el departamento de calidad.
* **Estatus:** Pendiente de confirmación con el cliente.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

## 2. Jerarquía de Producción, Lotes y Fraccionamiento

### DUD-03: Tamaño de Lotes Madre y Fraccionamiento (60 vs 15 piezas)
* **Pregunta para el Cliente:** ¿El lote madre que sale de Materia Prima siempre es de **estrictamente 60 piezas** y se divide en **4 sublotes de 15 piezas**, o existen órdenes, modelos o pedidos especiales con cantidades diferentes (ej. 30, 45, 100 piezas)? ¿El sistema debe permitir editar la cantidad de piezas al crear el lote?
* **Justificación / Origen:** En las fotos de las tarjetas viajeras de planta se observaron lotes madre de 60 piezas (tarjeta con lote 49,842) y sublotes de 15 piezas con número de sublote al calce (lote 49,633-3). Se debe confirmar si esta regla aplica al 100% de los modelos o si hay excepciones.
* **Impacto en el Software:**
  * Si es fijo: El sistema bloquea cualquier cantidad que no sea múltiplo de 15 o fracción exacta de 60.
  * Si es flexible: El sistema incorpora un campo editable con cálculo automático de sublotes según el total de piezas de la orden.
* **Estatus:** Pendiente de confirmación con el cliente.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

### DUD-04: Operador Responsable del Fraccionamiento en Rampa (D-05)
* **Pregunta para el Cliente:** Físicamente en la nave de producción, ¿quién es la persona encargada de recibir la torre madre de 60 piezas en la rampa y desglosarla en las 4 torres de 15 sombreros? ¿Es un auxiliar de rampa, un almacenista de WIP o el supervisor del área?
* **Justificación / Origen:** Necesitamos saber si esa persona contará con una tablet fija en la mesa de rampa o si el supervisor que camina por la nave realiza el escaneo de fraccionamiento.
* **Impacto en el Software:** Determina si el botón "Fraccionar Lote Madre" se opera desde la vista general del supervisor o desde una terminal simplificada de estación para el despachador de rampa.
* **Estatus:** Pendiente de confirmación con el cliente.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

## 3. Asignación de Operadores y Pago por Destajo

### DUD-05: Alcance de los Stickers de Operador por Departamento
* **Pregunta para el Cliente:** ¿En qué departamentos específicos es obligatorio registrar qué operador procesó el lote? Sabemos que en algunas estaciones no se maneja sticker individual (por ejemplo en almacenes o engomado químico). ¿Cuáles estaciones sí pagan destajo por operador y cuáles son de trabajo grupal/logístico?
* **Justificación / Origen:** En la evidencia fotográfica vimos stickers individuales (ej. JORGE en prensas, MELANY en adorno). No todas las 14 estaciones requieren forzar la selección de un operador individual al transferir el lote.
* **Impacto en el Software:**
  * En el catálogo de departamentos se añade la casilla: `Requiere Operador Individual (Destajo)` [Sí / No].
  * Si la estación no lo requiere, la Terminal del Supervisor omite el paso de seleccionar operador y transfiere de inmediato, agilizando el flujo.
* **Estatus:** Validado internamente con Andrés · Por mapear lista exacta con Carlos Ortiz.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

## 4. Control de Paros de Máquina e Incidencias (SMED)

### DUD-06: Registro Actual y Requerido de Paros de Máquina
* **Pregunta para el Cliente:** Actualmente, ¿cómo registran los tiempos muertos y paros de máquina (cambios de horma en prensas, caídas de caldera de vapor, mantenimiento)? ¿Llevan alguna bitácora en papel o Excel? ¿Qué información exacta les interesa capturar en el sistema (máquina, motivo, duración, técnico que atendió)?
* **Justificación / Origen:** El concepto de bitácora de paros proviene de metodologías de Lean Manufacturing / OEE para justificar por qué una línea no alcanzó la meta de 850 piezas/turno. Se debe confirmar si desean que los supervisores registren los paros desde la tablet o si prefieren mantener el MVP centrado exclusivamente en el avance de lotes sin paros por el momento.
* **Impacto en el Software:**
  * Si se incluye en MVP: Se conserva la sub-pestaña técnica en Analítica y el botón de paro rápido en Terminal.
  * Si se pospone: Se oculta para Fase 2 para no saturar al supervisor con captura de tiempos muertos.
* **Estatus:** Pendiente de definir prioridad con Edmundo y Carlos.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

## 5. Gestión de Mermas, Defectos y Segundas

### DUD-07: Flujo y Frecuencia de Revisión de Segundas y Retrabajos
* **Pregunta para el Cliente:** ¿Cómo gestionan físicamente las piezas con defectos menores (manchas, deformación leve, costura)? ¿Se revisan y retrabajan día con día al momento, o se acumulan en un almacén intermedio para una auditoría periódica de venta de remate?
* **Justificación / Origen:** En el diseño preliminar se modeló una hipótesis de "revisión de segundas los viernes" basada en prácticas regionales de San Pancho. Es indispensable validar el flujo real exacto de Tombstone para no forzar ninguna regla de días específicos en el software.
* **Impacto en el Software:**
  * Se congela cualquier lógica asociada a un día de la semana.
  * El sistema maneja un almacén general de `Segundas y Retrabajo (D-12)` con estatus abierto para que el supervisor o auditor lo consulte cuando la planta lo requiera.
* **Estatus:** Validado internamente con Andrés · Por definir con el cliente.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

## 6. Dinámica de Turno y Tablero Andon

### DUD-08: Inicio de Turno Oficial vs Disparo Dinámico por Primer QR
* **Pregunta para el Cliente:** El turno oficial de planta es de 07:00 a 15:30 hrs. ¿Prefieren que el reloj del Tablero Andon y las metas hora por hora arranquen estrictamente a las 07:00:00, o les interesa que el sistema detecte automáticamente el **primer escaneo QR del día** para registrar el tiempo real de precalentamiento y arranque de línea (ramp-up)?
* **Justificación / Origen:** Si la caldera tarda 15 o 20 minutos en alcanzar temperatura o el personal se coloca el equipo de protección, un inicio fijo marca la primera hora con déficit artificial. Un inicio dinámico mide con exactitud el tiempo de preparación de planta.
* **Impacto en el Software:**
  * Si prefieren fijo: El sistema mantiene los bloques rígidos de 07:00 a 15:30.
  * Si prefieren dinámico: Se implementa la historia `US-17` para ajustar el cálculo al primer código detectado después de las 06:30 AM.
* **Estatus:** Propuesta con valor agregado · Por validar con Carlos Ortiz.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

## 7. Tarjetas Viajeras y Generación de Etiquetas

### DUD-09: Emisión e Impresión de Tarjetas Viajeras Físicas
* **Pregunta para el Cliente:** ¿Cómo generan e imprimen hoy las tarjetas viajeras de papel? ¿Las imprime la oficina de programación al recibir el pedido, o tienen tarjetas en blanco en la rampa donde anotan con pluma? ¿Qué equipo de impresión utilizan (impresora láser de oficina en hoja carta o impresora térmica de etiquetas autoadhesivas en rollo)?
* **Justificación / Origen:** La propuesta de software de Ricardo sugiere que el sistema genere una plantilla de formato fijo y mande a imprimir en hoja de papel carta convencional en una impresora de red en el área donde nace el lote, para recortar y colocar dentro de la mica de plástico existente.
* **Impacto en el Software:** Define el módulo de generación de QR y plantillas de impresión (formato PDF/HTML para impresora láser vs comandos ZPL para impresoras Zebra).
* **Estatus:** Pendiente de validación con el cliente.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

## 8. Integración con CONTPAQi Comercial / Producción (COMPAC)

### DUD-10: Contacto de Sistemas, Versión de Licenciamiento y Alcance del Enlace
* **Pregunta para el Cliente:** ¿Con quién de su equipo interno o asesor externo de sistemas nos ponemos en contacto para revisar la versión exacta de COMPAC que utilizan (Comercial / Producción / AdminPAQ), el tipo de base de datos (Microsoft SQL Server) y el acceso a la red local?
* **Justificación / Origen:** Para dimensionar la viabilidad y fases de integración técnica, se necesita saber si se puede realizar un enlace directo mediante vistas/tablas intermedias de SQL Server o si para el MVP se debe operar mediante exportación/importación de archivos Excel/CSV entre ambos sistemas.
* **Impacto en el Software:**
  * Fase MVP: El sistema opera con exportación/importación de pedidos y emisión de vales de camioneta en CSV.
  * Fase 2: Sincronización automática de órdenes y existencias vía servicio local de Windows.
* **Estatus:** Pendiente de asignar contacto por parte de Edmundo.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

## 9. Hardware y Conectividad en Nave Industrial

### DUD-11: Tipo de Dispositivos y Cobertura de Red en Piso
* **Pregunta para el Cliente:** 
  1. ¿Cuentan con cobertura de red Wi-Fi estable en todas las estaciones de la nave central (desde almacén de materia prima hasta empaque y embarques)?
  2. ¿Tienen preferencia por tabletas tipo iPad o prefieren tablets Android de uso rudo industrial (con funda de protección contra caídas y polvo de talco/apresto)?
  3. ¿Los supervisores portarán la tablet consigo caminando por la nave, o se contemplan soportes fijos en las mesas de trabajo principales?
* **Justificación / Origen:** Define la arquitectura de resiliencia del software (necesidad de modo offline con sincronización en cola) y los accesorios de hardware a cotizar en la propuesta económica.
* **Impacto en el Software:** Si hay zonas sin señal, se vuelve prioritario activar el almacenamiento local (`IndexedDB`) para que ningún escaneo se detenga por caída de red.
* **Estatus:** Pendiente de confirmar con Edmundo y Carlos.
* **Respuesta / Minuta del Cliente:** [Espacio para captura en reunión]

---

## Matriz Resumen de Puntos Clave para la Reunión Ejecutiva

| Folio | Tema Central | Pregunta Clave | Decisión a Tomar |
|---|---|---|---|
| **DUD-01** | Permisos Ingeniero | ¿Carlos puede crear supervisores y operadores únicamente? | Confirmar alcance de permisos RBAC. |
| **DUD-02** | Aprobación Calidad | ¿El supervisor aprueba la calidad o hay un auditor independiente? | Definir si se crea rol de Auditor de Calidad. |
| **DUD-03** | Tamaño de Lote | ¿Siempre son 60 pzas (4x15) o hay excepciones editables? | Dejar campo de piezas fijo o editable. |
| **DUD-04** | Operación Rampa | ¿Quién realiza físicamente la división de torres en D-05? | Asignar la pantalla de fraccionamiento al puesto real. |
| **DUD-05** | Operadores / Destajo | ¿En qué estaciones específicas sí aplica el sticker individual? | Marcar estaciones con destajo obligatorio vs grupales. |
| **DUD-06** | Bitácora de Paros | ¿Registran hoy tiempos muertos o se implementará de cero? | Incluir en MVP o mover a Fase 2. |
| **DUD-07** | Mermas y Segundas | ¿Cómo y cuándo revisan las piezas con defecto menor? | Ajustar el módulo de segundas al flujo real de planta. |
| **DUD-08** | Inicio de Turno | ¿Inicio de turno rígido (07:00) o dinámico al primer QR? | Configurar reloj de Takt Time en el Andon. |
| **DUD-09** | Impresión Tarjetas | ¿Dónde y en qué impresora imprimen hoy las tarjetas viajeras? | Diseñar plantilla en hoja carta o rollo de etiqueta. |
| **DUD-10** | Enlace COMPAC | ¿Contacto técnico para revisar licencia y base de datos SQL? | Definir si MVP arranca con CSV o enlace directo. |
| **DUD-11** | Tablets y Wi-Fi | ¿Preferencia de tablets (iPad vs Android rudo) y cobertura Wi-Fi? | Activar modo offline y definir especificación de hardware. |
