# Banco Unificado de Dudas y Validaciones Técnicas
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Documento Unificado Oficial de Preguntas Clave y Acuerdos Técnicos con el Cliente.*

> **Versión:** `v2.44.0`  
> **Fecha:** 7 de Octubre de 2026  
> **Estado:** Oficial para Validación Técnica  
> **Cliente:** Tombstone Hats (Edmundo González / Ing. Carlos Ortiz)  
> **Proveedor:** Uanify (Andrés Villanueva)

---

## 1. Mermas y Piezas de Segunda

### Hecho Confirmado en Planta:
El lote principal no se detiene cuando se detectan piezas de segunda o defectos menores en línea; las piezas defectuosas se apartan físicamente y el resto de la pila continúa su avance normal por los departamentos.

### Definición Técnica para MVP:
El sistema incluye la captura de la cantidad de piezas retiradas, el tipo de afectación (Segunda o Merma), la causa raíz de la falla (poro en lienzo, mancha de acabado, quemadura de vapor, deformación de ala) y la estación donde se detectó. Esta información se almacena como **histórico para consulta y cálculo de KPIs de calidad**.

### Puntos por Validar con el Cliente:
* ¿El registro histórico y conteo para KPIs cubre al 100% la necesidad actual de planta, o requieren que estas piezas descuenten inventario de alguna forma específica en el sistema administrativo más adelante?

---

## 2. Puntos de Control de Calidad y Derivación de Rechazos

### Hecho Confirmado en Planta:
Existen 4 filtros de inspección en línea atendidos por 6 inspectores exclusivos de calidad.

### Definición Técnica para MVP:
En las terminales de los filtros de calidad, el **Inspector de Calidad** revisa el lote físico y tiene únicamente dos acciones directas: **Aprobar** (el lote avanza al almacén siguiente) o **Rechazar** (se abre el flujo de resolución de no conformidad).

### Puntos por Validar con el Cliente:
* Cuando un inspector rechaza un lote, ¿quién debe tener la facultad en la aplicación para dictaminar hacia dónde se dirige (Reproceso a estación anterior seleccionada, Segunda o Merma)?
  * Opción 1: Exclusivamente el **Supervisor del área**.
  * Opción 2: El **Ingeniero Admin / Ingeniero de Calidad**.
  * Opción 3: Cualquiera de los dos (indistintamente quien se encuentre en piso).
* En el caso de **Reprocesos**: ¿El sistema debe permitir seleccionar libremente cualquier departamento anterior de la ruta, o solo el departamento inmediatamente previo? *(Recomendación: permitir seleccionar libremente el departamento que causó el defecto).*

---

## 3. Bitácora de Paros Productivos de Máquina

### Hecho Confirmado en Planta:
Actualmente los paros no se digitalizan; cuando ocurre una falla se avisa verbalmente al mecánico de mantenimiento. En Prensas (cuello de botella) se requiere registrar los paros de inicio a fin.

### Definición Técnica para MVP:
La terminal de piso contará con un módulo táctil rápido para registrar eventos improductivos indicando: Estación/Máquina, Operador en turno, Hora de inicio, Hora de fin y Motivo de detención.

### Puntos por Validar con el Cliente:
* **Umbral mínimo de tiempo:** ¿A partir de cuántos minutos de detención se debe exigir el registro de un paro (ej. eventos mayores a 5 minutos, o registrar cualquier pausa)?
* **Catálogo de causas:** Se propone un catálogo base táctil con: *Cambio de horma / molde, Falla mecánica de prensa, Falta de vapor en caldera, Falta de material / lienzos, Mantenimiento eléctrico*. ¿Desean agregar o acotar motivos específicos para su nave?

---

## 4. Ingesta de Órdenes e Impresión de Tarjetas Viajeras

### Hecho Confirmado en Planta:
Las órdenes provienen de CONTPAQi Comercial. La partición de lotes y las tarjetas viajeras hoy se gestionan con formatos en hoja carta de oficina que se recortan e insertan en fundas plásticas cosidas.

### Definición Técnica para MVP:
El Ingeniero Admin consulta las órdenes directamente en el MES desde la base de datos SQL Server de CONTPAQi. Define manualmente la partición de lotes madre (base 60 piezas) y sublotes (15 piezas), y **desde la misma pantalla manda a imprimir las tarjetas viajeras oficiales con sus códigos QR** en hojas tamaño carta estándar para recortar.

### Puntos por Validar con el Cliente:
* **Medidas exactas de micas:** ¿Cuáles son las dimensiones físicas en centímetros de las fundas plásticas que utilizan actualmente en planta para calibrar los márgenes de impresión y que encajen sin problema?
* **Datos impresos en la tarjeta:** Se propone imprimir: Folio de Lote / Sublote, Código QR de alta densidad, Modelo de sombrero, Talla, Horma asignada, Orden de producción y Fecha. ¿Requieren algún dato adicional visible en la mica?

---

## 5. Método de Acceso y Autenticación en Terminales de Piso

### Hecho Confirmado en Planta:
Las 6 terminales táctiles estarán ubicadas en puntos fijos de la nave y serán compartidas entre supervisores e inspectores que rotan por las áreas de trabajo.

### Definición Técnica para MVP:
El sistema cuenta con 3 perfiles de acceso bien diferenciados:
1. **Ingeniero Admin** (Acceso total a catálogos, enlace CONTPAQi, creación de lotes e impresión).
2. **Supervisor de Planta** (Consulta de WIP de sus almacenes, depósito de lotes, Modo Rampa y paros).
3. **Inspector de Calidad** (Validación de filtros de calidad).

### Puntos por Validar con el Cliente:
* Para garantizar rapidez y ergonomía en las pantallas táctiles compartidas, ¿prefieren:
  * **PIN numérico de 4 dígitos** por usuario con teclado táctil en pantalla (sin necesidad de escribir contraseñas largas con guantes o dedos ocupados)?
  * O **Usuario y contraseña tradicional** alfanumérica?
