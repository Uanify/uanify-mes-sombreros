# Cuestionario Operativo de Planta: Dudas Abiertas con Ingeniería
**Tombstone Hats ↔ Tombstone MES**  
*Guía de Preguntas Técnicas y Operativas de Piso para el Ing. Carlos Ortiz.*  
*(Exclusivamente dudas NO resueltas en los audios ni en el levantamiento previo. Documento complementario a la Guía de CONTPAQi).*

---

## 1. Impresión de Tarjetas Viajeras y Código QR Físico

* **Lo que ya sabemos:** Las tarjetas de cartulina viajan dentro de micas de plástico cosidas, con O.P., modelo, horma, talla y color.
* **La duda abierta para Carlos:**
  1. **¿Dónde y en qué equipo imprimen hoy físicamente las tarjetas?**
     - ¿Las imprime la oficina de programación en una impresora láser convencional en hoja de papel carta o tienen impresora térmica de etiquetas en rollo (Zebra)?
     - *Por qué importa:* Para entregarles la plantilla de impresión exacta del código QR lista para mandar a imprimir y recortar a la medida de la mica sin alterar su rutina actual.

---

## 2. Paros de Máquina e Incidencias en Piso (Mantenimiento)

* **Lo que ya sabemos:** Las prensas son el cuello de botella físico y los cambios de horma tardan de 10 a 15 min.
* **La duda abierta para Carlos:**
  1. **¿Llevan hoy alguna libreta o registro escrito de paros de máquina?**
     - Cuando se cae la caldera de vapor, falla una prensa o falta material: ¿anotan en algún lado el tiempo y motivo, o solo se avisa de palabra al mecánico?
     - *Decisión para el software:* ¿Desean que en esta primera versión los supervisores registren en la tablet los paros de máquina (con botones rápidos de motivo: cambio de horma, falla mecánica, vapor), o prefieren arrancar primero solo con el avance de lotes y dejar los paros para una segunda etapa?

---

## 3. Dinámica en Rampa y Conteo Físico en Desviaciones

* **Lo que ya sabemos:** El lote de 60 pzas se fracciona en 4 sublotes de 15 pzas en Rampa (D-05), y los lotes no deben salir incompletos (la pieza dañada se retira a segundas y se reemplaza con una blanca de amortiguamiento).
* **La duda abierta para Carlos:**
  1. **¿Quién opera físicamente la mesa de Rampa (D-05)?**
     - ¿Es un auxiliar fijo de esa mesa o el supervisor general de prensas?
     - *Por qué importa:* Para saber si en la mesa de rampa dejamos una terminal fija o si el supervisor lo hace desde la tablet que lleva en la mano.
  2. **¿El stock de piezas de amortiguamiento ("blancas") siempre está disponible al lado de la línea?**
     - Si se quema una pieza en vapor y en ese momento no hay pieza blanca de repuesto idéntica: ¿el lote de 15 se detiene ahí en espera, o avanza temporalmente con 14 sombreros?
     - *Por qué importa:* Para saber si el sistema debe permitir registrar excepciones temporales de sublotes con 14 piezas.

---

## 4. Coordinación de Subensambles en Adorno 1 (D-10)

* **Lo que ya sabemos:** En Adorno 1 se unen cuerpo, tafilete interior (por talla) y toquilla exterior. Hoy se coordinan a gritos o caminando por la nave para ver si hay tafiletes listos.
* **La duda abierta para Carlos:**
  1. **¿Los tafiletes y toquillas se fabrican por lote programado o tienen un inventario colchón permanente?**
     - *Por qué importa:* Saber si Carlos quiere que en la tablet se registre cuándo las preparadoras terminan un lote de tafiletes (para que la supervisora de adorno vea en verde "Tafiletes talla 57 listos en buffer: 150 pzas"), o si esa parte se seguirá coordinando en piso por ahora.

---

## 5. Inspección de Calidad Final (C-03 / D-11)

* **Lo que ya sabemos:** Hay 3 filtros de calidad (post-englopado, post-pintura y final antes de empaque) y las piezas defectuosas van al almacén de segundas (D-12).
* **La duda abierta para Carlos:**
  1. **¿Quién tiene la última palabra para aprobar el lote en C-03?**
     - ¿Es el mismo supervisor del turno (Juan Manuel / Roberto) o cuentan con un inspector/auditor de calidad independiente asignado a la mesa?
     - *Por qué importa:* Si es un auditor independiente, el sistema le da un perfil exclusivo de "Auditor de Calidad" enfocado en checklists de inspección, evitando que el supervisor de producción sea "juez y parte".

---

## 6. Cobertura de Red Wi-Fi en la Nave

* **Lo que ya sabemos:** Tienen servidor local, módem de fibra y repetidores Wi-Fi en naves.
* **La duda abierta para Carlos:**
  1. **¿Hay zonas de sombra o desconexión detectadas en el recorrido de la nave?**
     - Específicamente hacia el almacén de materia prima al fondo, o en la zona de embarques/patio exterior.
     - *Por qué importa:* Para calibrar la memoria de almacenamiento local (IndexedDB) de las tablets, de modo que si un supervisor escanea en una esquina sin señal, el registro se guarde localmente y se transmita en automático al volver a tener cobertura.

---

## Matriz Resumen de Acuerdos Rápidos (Solo Dudas Abiertas)

| # | Punto Clave a Definir | Opción A | Opción B | Decisión en Software |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Impresora de tarjetas viajeras | Hoja carta estándar (láser) | Impresora térmica en rollo (Zebra) | Formato PDF carta vs ZPL |
| **2** | Registro de paros de máquina | Registrar paros en tablet ya | Arrancar solo con lotes; paros en Fase 2 | Activar botón de paros en MVP |
| **3** | Operación en mesa de Rampa | Terminal fija en mesa | Supervisor en tablet móvil | Interfaz dedicada vs Terminal móvil |
| **4** | Aprobación de calidad final | Mismo supervisor de línea | Auditor de calidad independiente | Rol Supervisor vs Rol Auditor Calidad |
| **5** | Buffer de tafiletes en sistema | Monitorear buffer en tablet | Dejarlo como proceso manual por ahora | Activar sub-inventario de tafiletes |
