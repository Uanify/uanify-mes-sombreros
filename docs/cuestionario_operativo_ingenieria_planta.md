# Cuestionario Operativo de Planta: Validación con Ingeniería
**Tombstone Hats ↔ Uanify MES**  
*Guía de Preguntas Técnicas y Operativas de Piso para la Reunión con el Ing. Carlos Ortiz / Ingeniería de Procesos.*  
*(Documento independiente y complementario al Dossier de CONTPAQi).*

---

## 1. Reglas de Producción, Lotes y Fraccionamiento en Rampa

1. **Tamaño Estándar de Lote y Excepciones:**
   - *Pregunta:* La torre madre que sale de prensas/engomado viaja en **60 piezas** y en rampa se divide en **4 sublotes de 15 piezas**. ¿Esto es una regla matemática estricta al 100%, o existen pedidos especiales o modelos donde viajan lotes de 30, 45, 100 o piezas sueltas?
   - *Por qué importa:* Para definir si el sistema bloquea números no múltiplos de 15 o si dejamos el campo de piezas editable al momento de crear y fraccionar lotes.
2. **Quién opera físicamente el fraccionamiento en Rampa (D-05):**
   - *Pregunta:* En la mesa de rampa, ¿quién recibe físicamente la torre de 60 sombreros y la separa en las torres de 15? ¿Es un auxiliar de rampa, un almacenista de WIP o el supervisor de la nave?
   - *Por qué importa:* Para saber si esa estación requiere una terminal fija en la mesa de rampa o si el supervisor lo hace desde su tablet móvil caminando por la nave.
3. **Manejo de Sombreros con Merma o Retrabajo en Tránsito:**
   - *Pregunta:* Si en una torre de 15 piezas se detecta 1 sombrero con defecto (mancha o deformación): ¿esa pieza defectuosa continúa físicamente en la torre viajando hasta el almacén de segundas al final, o se retira físicamente de inmediato en la estación y la torre sigue con 14 piezas?
   - *Por qué importa:* Para que el conteo en pantalla coincida exactamente con lo que el operador tiene físicamente en sus manos.

---

## 2. Padrón de Operadores, Asignaciones y Pago por Destajo

1. **Operadores por Estación y Destajos:**
   - *Pregunta:* Sabemos que en Prensas y Adorno pegan stickers individuales del operador en la mica para el pago de destajo. En las demás estaciones (Almacén MP, Engomado, Rampa, Desmanchado, Empaque): ¿cómo trabajan? ¿Hay un operador titular fijo por turno, operan en cuadrillas o rota el personal?
   - *Por qué importa:* En el MES registraremos obligatoriamente el operador que procesó cada lote para asegurar 100% de trazabilidad de mano de obra. Queremos pre-cargar a los titulares para que el supervisor confirme con 1 solo toque en la tablet sin entorpecer el ritmo de trabajo.
2. **Facultades del Ingeniero en el Sistema:**
   - *Pregunta:* Como Ingeniero de Procesos, ¿Carlos dará de alta a los supervisores de turno y a los operadores de máquina conforme roten las cuadrillas?
   - *Por qué importa:* Dejamos al rol Ingeniero con facultades completas de gestión de personal de piso y departamentos, reservando para Dirección únicamente la administración de licencias y directivos.

---

## 3. Rutas de Fabricación, Tiempos y Cuellos de Botella

1. **Secuencia de Estaciones por Modelo:**
   - *Pregunta:* Modelos como *1000X Master Telar Denver, Bullrider, El Viejonón, Laredo o Frontier*: ¿todos siguen exactamente las mismas 14 estaciones o hay modelos (como campanas preformadas o laqueados especiales) que se saltan estaciones o tienen pasos adicionales?
   - *Por qué importa:* El sistema cuenta con rutas configurables por modelo para que al escanear el QR calcule automáticamente la siguiente estación correcta sin error humano.
2. **Takt Time y Tiempos de Ciclo Oficiales:**
   - *Pregunta:* Para la meta semanal de 4,250 piezas (~850 pzas/día): ¿tienen cronometrados los tiempos estándar por pieza en prensas, ribeteado y adorno, o el ritmo lo marca el flujo libre de los operadores?
   - *Por qué importa:* Para calibrar los umbrales de alerta del Andon cuando una estación comience a rezagarse y genere cuello de botella.

---

## 4. Control de Paros de Línea e Incidencias (Mantenimiento)

1. **Cómo registran hoy los paros:**
   - *Pregunta:* Cuando se para una prensa por cambio de horma, falla eléctrica o caída de vapor de la caldera: ¿llevan hoy alguna libreta o reporte en papel, o simplemente se avisa de palabra al mecánico?
   - *Por qué importa:* Para saber si en esta primera etapa les interesa que el supervisor registre el motivo del paro en la tablet (ej. cambio de horma, falla de caldera, falta de material) para generar métricas OEE, o si prefieren arrancar primero solo con el avance de lotes.
2. **Catálogo de Hormas y Moldes:**
   - *Pregunta:* ¿Tienen un inventario codificado de las hormas de aluminio fundido (Denver, Bullrider, Low Crown, etc.) y en qué prensa específica está montada cada una, o el cambio se decide al momento según el pedido del día?

---

## 5. Inspección de Calidad y Venta de Segundas

1. **Aprobación de Calidad en Filtros (C-XX y D-11):**
   - *Pregunta:* ¿Quién valida y aprueba formalmente que un lote pasa el filtro de calidad? ¿Es el mismo supervisor del área, o tienen a un auditor/inspector de calidad independiente?
   - *Por qué importa:* Si el supervisor tiene la presión de cumplir su meta diaria de piezas, poner a un auditor independiente evita que apruebe sombreros dudosos para "cumplir con el número".
2. **Destino de las Segundas:**
   - *Pregunta:* Los sombreros que quedan como segundas: ¿se acumulan para venta de remate en fábrica, se desbaratan para recuperar material, o se retrabajan al final del turno?

---

## 6. Tarjetas Viajeras Físicas y Hardware de Piso

1. **Impresión de la Tarjeta Viajera:**
   - *Pregunta:* La tarjeta viajera física de papel que viaja dentro de la mica: ¿dónde se imprime hoy? ¿La imprime programación en hoja de papel carta convencional o tienen impresora térmica de etiquetas?
   - *Por qué importa:* Para diseñar la plantilla exacta de impresión con código QR en PDF lista para cortar y meter a la mica existente sin cambiarles el proceso.
2. **Puntos de Conexión Wi-Fi en Nave:**
   - *Pregunta:* ¿Tienen identificados puntos ciegos o zonas de la nave (hacia almacén trasero o embarque) donde el Wi-Fi pierda señal?
   - *Por qué importa:* Para garantizar que las tablets almacenen los escaneos en memoria local y sincronicen en automático sin perder información.

---

## Matriz Resumen de Validación Rápida en la Mesa

| # | Pregunta Clave para el Ingeniero | Opciones de Respuesta | Decisión en Software |
| :--- | :--- | :--- | :--- |
| **1** | ¿Lotes siempre de 60 pzas (4x15)? | A) Siempre estrictos<br>B) Hay pedidos especiales variables | A = Bloqueo a múltiplos de 15.<br>B = Campo de piezas editable. |
| **2** | ¿Merma viaja en la torre o se retira? | A) Viaja en la torre hasta segundas<br>B) Se aparta físicamente en la estación | A = Sublote viaja con pieza marcada.<br>B = Restar pieza del conteo activo. |
| **3** | ¿Quién aprueba calidad final? | A) El supervisor de turno<br>B) Auditor de calidad independiente | A = Rol Supervisor.<br>B = Crear usuario Auditor de Calidad. |
| **4** | ¿Registrar paros de máquina desde ya? | A) Sí, queremos registrar paros y causas<br>B) No, arrancar solo con flujo de lotes | A = Activar bitácora de paros rápida.<br>B = Ocultar paros para Fase 2. |
| **5** | ¿Impresión de tarjetas viajeras? | A) Hoja de papel carta convencional<br>B) Impresora de etiquetas en rollo | A = Generador PDF formato carta.<br>B = Plantilla para etiqueta térmica. |
