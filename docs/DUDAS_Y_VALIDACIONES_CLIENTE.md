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
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Carlos Ortiz puede crear/asignar supervisores y cuadrillas de operarios; solo Edmundo González (Admin) gestiona roles directivos y configuraciones globales.
* **Respuesta / Minuta del Cliente:** Acordado con Dirección e Ingeniería.

---

### DUD-02: Autoridad y Rol para Inspección de Calidad (C-XX y D-11)
* **Pregunta para el Cliente:** ¿Quién es la persona física que aprueba o rechaza los lotes en la mesa de inspección de calidad? ¿Es el mismo supervisor del tramo departamental o existe un **Auditor / Inspector de Calidad independiente**?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Existen **6 inspectores exclusivos de calidad** en 4 filtros estratégicos. El supervisor o ingeniero de calidad determina el destino formal (reproceso con ruta al área causante, o segregación a segundas).
* **Respuesta / Minuta del Cliente:** Confirmado en entrevista técnica del 3 de Octubre de 2026.

---

## 2. Jerarquía de Producción, Lotes y Fraccionamiento

### DUD-03: Tamaño de Lotes Madre y Fraccionamiento (60 vs 15 piezas)
* **Pregunta para el Cliente:** ¿El lote madre que sale de Materia Prima siempre es de estrictamente 60 piezas y se divide en 4 sublotes de 15 piezas, o existen órdenes, modelos o pedidos especiales con cantidades diferentes?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Los lotes **no son fijos de 60 piezas**; son editables y parametrizables según la Orden de Producción del cliente (desde 4 hasta 14 sublotes de 15 a 60 pzas).
* **Respuesta / Minuta del Cliente:** Confirmado por Carlos Ortiz. El sistema soporta fraccionamiento dinámico.

---

### DUD-04: Operador Responsable del Fraccionamiento en Rampa (D-05)
* **Pregunta para el Cliente:** Físicamente en la nave de producción, ¿quién es la persona encargada de recibir la torre madre en la rampa y desglosarla? ¿Dónde nacen las tarjetas?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Las tarjetas madre y de sublotes se imprimen en **Ingeniería**. El supervisor recoge las micas de sublote y efectúa el cambio físico en rampa; la tarjeta madre queda archivada en mesa de rampa como control histórico.
* **Respuesta / Minuta del Cliente:** Acordado en cuestionario de ingeniería del 3 de Octubre de 2026.

---

## 3. Asignación de Operadores y Pago por Destajo

### DUD-05: Digitalización Universal de Operadores en las 14 Estaciones
* **Pregunta para el Cliente:** ¿Cómo se organiza el personal en piso para efectos de trazabilidad y destajo?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Padrón total de **108 operarios fijos** (no rotan entre departamentos). Se genera pre-reporte semanal de destajo ($/pza) con corte los viernes y exportación nativa a Excel/CSV. Si un operario falta, su máquina no se cubre.
* **Respuesta / Minuta del Cliente:** Confirmado por Carlos Ortiz.

---

## 4. Control de Paros de Máquina e Incidencias (SMED)

### DUD-06: Registro Actual y Requerido de Paros de Máquina
* **Pregunta para el Cliente:** ¿Cómo registran los tiempos muertos y qué se requiere en el MES?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Registro de tiempos muertos de inicio a fin en Prensas y estaciones mediante botones rápidos de paro: *Cambio de horma (SMED), Falla mecánica, Falta de vapor en caldera, Falta de material*. Se refleja en vivo en Tablero Andon.
* **Respuesta / Minuta del Cliente:** Confirmado e implementado en el sistema.

---

## 5. Gestión de Mermas, Defectos y Segundas

### DUD-07: Flujo y Frecuencia de Revisión de Segundas y Retrabajos
* **Pregunta para el Cliente:** ¿Cómo gestionan físicamente las piezas con defectos menores y qué ocurre con el lote?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Las piezas de segunda se separan físicamente y **se venden directamente**. En el sistema se registra la pieza defectuosa con su causa raíz, pero **el lote y su tarjeta viajera NO se detienen**; continúan avanzando con las piezas buenas restantes. Los reprocesos se retornan al área causante del defecto.
* **Respuesta / Minuta del Cliente:** Confirmado por Carlos Ortiz.

---

## 6. Dinámica de Turno y Tablero Andon

### DUD-08: Inicio de Turno Oficial vs Disparo Dinámico por Primer QR
* **Pregunta para el Cliente:** ¿Inicio fijo a las 07:00 o dinámico con el 1er QR?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Turno Único (07:00 a 15:30 hrs · Lunes a Viernes). Modo dual implementado en Configuración con disparo dinámico automático al primer QR escaneado para medir ramp-up de calderas.

---

## 7. Tarjetas Viajeras y Generación de Etiquetas

### DUD-09: Emisión e Impresión de Tarjetas Viajeras Físicas
* **Pregunta para el Cliente:** ¿Dónde y con qué equipo se imprimen las tarjetas viajeras?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Se imprimen en **Ingeniería** mediante **impresora láser de oficina en hojas de papel tamaño carta estándar**; se recortan y se insertan en fundas plásticas cosidas existentes.

---

## 8. Integración con CONTPAQi Comercial / Producción (COMPAC)

### DUD-10: Contacto de Sistemas, Versión de Licenciamiento y Alcance del Enlace
* **Pregunta para el Cliente:** ¿Cómo interactúa el sistema con CONTPAQi sin incurrir en costos de licencia API?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO ($0 USD).** Licencias confirmadas: CONTPAQi Comercial 11.3.1, Contabilidad 18.3.1, Bancos 18.3.1, Nómina 18.2.2. Soporte externo de Lupita López. La integración se ejecuta mediante **Stored Procedures y Vistas de SQL Server en red local**, leyendo tablas nativas (`mgw10008` documentos modelo, `mgw10005` existencias) y emitiendo Vales Digitales de Salida para timbrado comercial sin costos de licenciamiento de terceros.

---

## 9. Hardware y Conectividad en Nave Industrial

### DUD-11: Tipo de Dispositivos y Cobertura de Red en Piso
* **Pregunta para el Cliente:** ¿Dispositivos de captura en piso y ergonomía?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** Se establecen **6 estaciones físicas con terminal táctil** en nave: (1) Prensas, (2) Calidad Refuerzo/Pintura, (3) Patio Endopado, (4) Calidad Hidráulicas, (5) Adorno/Toquillas, (6) Calidad Final y Embarque. Sistema diseñado con arquitectura Tablet-First ergonómica y modo offline-ready.

### DUD-12: Despliegue de Pantallas Físicas Smart TV en Nave Central
* **Pregunta para el Cliente:** ¿Se compran pantallas físicas Smart TV para Andon?
* **Estatus:** ✅ **CONFIRMADO Y RESUELTO.** No se contemplan pantallas físicas de televisión en esta etapa para no inflar presupuesto. El Tablero Andon opera vía web en tablets y PCs de planta.

---

## 10. Nueva Duda Técnica Abierta (Por Validar en Siguiente Sesión)

### DUD-13: Criterio de Inspección en los 4 Filtros de Calidad: ¿100% de Lotes o Muestreo AQL por Modelo?
* **Pregunta para el Cliente:** Dado que se confirmaron 4 filtros de calidad con 6 inspectores exclusivos, ¿todos los lotes de cualquier modelo pasan forzosamente por los 4 filtros, o en modelos estándar de alta velocidad se realiza muestreo aleatorio (AQL) y solo en modelos premium (1000X Master Denver) se inspecciona el 100% de las piezas?
* **Justificación / Origen:** Si todos los lotes pasan al 100%, la cola de inspección puede convertirse en cuello de botella. El sistema debe permitir parametrizar en la Ruta de Fabricación si el filtro es de inspección total o de validación por muestreo de sublote.
* **Estatus:** 🟡 **ABIERTA / PENDIENTE DE RESPUESTA POR CLIENTE.** Registrada para la siguiente sesión con Ing. Carlos Ortiz.

---

## Matriz Resumen de Puntos Clave

| Folio | Tema Central | Pregunta Clave | Estado | Decisión / Acuerdo |
|---|---|---|---|---|
| **DUD-01** | Permisos Ingeniero | ¿Carlos crea solo supervisores y cuadrillas? | ✅ Resuelto | Sí, blindando configuración directiva a Edmundo. |
| **DUD-02** | Aprobación Calidad | ¿Inspectores independientes en calidad? | ✅ Resuelto | Sí, 6 inspectores dedicados en 4 filtros. |
| **DUD-03** | Tamaño de Lote | ¿Lotes fijos o editables según OP? | ✅ Resuelto | Editables según la orden de producción. |
| **DUD-04** | Operación Rampa | ¿Dónde nacen micas y quién fracciona? | ✅ Resuelto | Impresión en Ingeniería, fraccionamiento en D-05. |
| **DUD-05** | Operadores / Destajo | ¿Padrón y pre-reporte semanal? | ✅ Resuelto | 108 operarios fijos, reporte semanal de viernes a Excel. |
| **DUD-06** | Bitácora de Paros | ¿Registro de paros en Prensas? | ✅ Resuelto | Sí, de inicio a fin con botones rápidos y Andon vivo. |
| **DUD-07** | Mermas y Segundas | ¿Flujo de segundas sin frenar lote? | ✅ Resuelto | Segundas se venden; lote continúa con piezas buenas. |
| **DUD-08** | Inicio de Turno | ¿Arranque de turno Andon? | ✅ Resuelto | Turno único con arranque dinámico al 1er escaneo QR. |
| **DUD-09** | Impresión Tarjetas | ¿Dónde y qué papel? | ✅ Resuelto | Ingeniería, hoja carta láser convencional. |
| **DUD-10** | Enlace COMPAC | ¿Integración económica sin APIs de pago? | ✅ Resuelto | Stored Procedures y Vistas SQL Server en red local ($0). |
| **DUD-11** | Terminales Piso | ¿Puntos de captura en nave? | ✅ Resuelto | 6 terminales táctiles en estaciones clave. |
| **DUD-12** | Pantallas Smart TV | ¿Pantallas físicas de TV en nave? | ✅ Resuelto | Pausadas; Andon corre vía web en tablets y PCs. |
| **DUD-13** | Muestreo Calidad | ¿Inspección 100% o muestreo AQL según modelo? | 🟡 Abierta | Registrar en siguiente sesión con Carlos Ortiz. |
