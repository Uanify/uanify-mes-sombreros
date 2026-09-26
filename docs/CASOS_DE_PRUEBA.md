# Catálogo Maestro de Casos de Prueba Exhaustivos (Test Cases)
## Tombstone Hats MES · Control de Planta, Trazabilidad y Tablero Andon
> **Matriz Integral de Aseguramiento de Calidad (QA), Casos Positivos, Negativos, Límites y Pruebas en Piso**  
> **Versión del Sistema:** `v2.18.0` | **Fecha:** 25 de Septiembre de 2026  
> **Cobertura:** 96 Casos de Prueba estructurados para las 45 Historias de Usuario (`docs/HISTORIAS_DE_USUARIO.md`) y Requerimientos Funcionales (`docs/REQUERIMIENTOS_DEL_SISTEMA.md`).  
> **Planta Matriz:** San Francisco del Rincón, Guanajuato | **Cliente:** Tombstone Hats  

---

##  Metodología de Clasificación de Casos de Prueba

Para garantizar una cobertura rigurosa y no quedarnos solo con el "camino feliz", cada caso de prueba se clasifica bajo 4 categorías:
1. **[Happy Path - Camino Feliz]**: Flujo operativo normal esperado en planta.
2. **[Negative / Bloqueo]**: Intentos deliberados de violar reglas de negocio, ingresar datos erróneos o mover lotes no autorizados.
3. **[Edge Case / Límite]**: Situaciones atípicas de planta (pocas piezas, saturación máxima de rampa, fallas de red, desgaste de hormas).
4. **[Tablet / Ergonomía Táctil]**: Pruebas de usabilidad para dedos en pantalla táctil de 8 a 10 pulgadas.

---

##  Índice de Módulos (96 Casos de Prueba)

1. [Módulo 0: Seguridad, Login RBAC y Sesiones (TC-01 a TC-08)](#módulo-0-seguridad-login-rbac-y-sesiones)
2. [Módulo 1: Terminal de Supervisor, Lector QR y Piso (TC-09 a TC-26)](#módulo-1-terminal-de-supervisor-lector-qr-y-piso)
3. [Módulo 2: Tablero Andon Digital en Nave Central (TC-27 a TC-37)](#módulo-2-tablero-andon-digital-en-nave-central)
4. [Módulo 3: Almacenes Físicos, Sombreros, Hormas e Inventarios (TC-38 a TC-55)](#módulo-3-almacenes-físicos-sombreros-hormas-e-inventarios)
5. [Módulo 4: Padrón de Operadores y Mano de Obra (TC-56 a TC-64)](#módulo-4-padrón-de-operadores-y-mano-de-obra)
6. [Módulo 5: Analítica & KPIs de Planta (TC-65 a TC-76)](#módulo-5-analítica--kpis-de-planta)
7. [Módulo 6: Configuración de Planta, Rutas y CONTPAQi ERP (TC-77 a TC-88)](#módulo-6-configuración-de-planta-rutas-y-contpaqi-erp)
8. [Módulo 7: Generación de Tarjetas, Pedidos, Compras y Offline (TC-89 a TC-96)](#módulo-7-generación-de-tarjetas-pedidos-compras-y-offline)

---

## Módulo 0: Seguridad, Login RBAC y Sesiones

### TC-SEC-01: Selección de Perfil y Persistencia de Sesión
* **HU:** `US-01` | **Categoría:** Happy Path.
* **Objetivo:** Verificar que el usuario pueda firmarse desde el selector visual y que la sesión persista al recargar la página.
* **Precondición:** Sin sesión activa en `localStorage`.
* **Pasos:** 1. Acceder a la URL. 2. Hacer clic en `Edmundo González (Administrador)`. 3. Recargar el navegador con `F5`.
* **Resultado Esperado:** Se abre la aplicación con el rol de Administrador. Al recargar, la sesión se mantiene intacta en Edmundo.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-SEC-02: Ocultamiento Estricto de Menús para Supervisor
* **HU:** `US-02` | **Categoría:** Negative / Seguridad.
* **Objetivo:** Garantizar que un supervisor no vea ni tenga acceso a módulos administrativos o de analítica.
* **Precondición:** Sesión activa como `Juan Manuel Pérez` (Supervisor).
* **Pasos:** 1. Observar la barra lateral. 2. Buscar accesos a `Analítica & KPIs`, `Configuración`, `Almacenes` u `Operadores`.
* **Resultado Esperado:** Solo se muestran `Tablero Andon` y `Terminal de Supervisor`. Los módulos restringidos tienen `display: none`. No existen candados visibles (``).
* **Estatus:** `[Pasa - v2.18.0]`

### TC-SEC-03: Intento de Acceso por URL / Hash a Módulo Prohibido
* **HU:** `US-02` | **Categoría:** Negative / Bloqueo.
* **Objetivo:** Validar que forzar la navegación por selector DOM a una vista no autorizada sea rechazado.
* **Precondición:** Sesión activa como `Roberto Méndez` (Supervisor).
* **Pasos:** 1. Forzar en consola o hash `switchTab('analytics')` o `switchTab('config')`.
* **Resultado Esperado:** El sistema deniega la acción, emite toast de advertencia y redirige a la Terminal autorizada.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-SEC-04: Modificación Dinámica de Permisos por Administrador
* **HU:** `US-03` | **Categoría:** Happy Path.
* **Objetivo:** Comprobar que el Admin pueda habilitar o remover un módulo para cualquier usuario y que se refleje de inmediato.
* **Precondición:** Sesión activa como `Edmundo González`.
* **Pasos:** 1. Ir a `Configuración` → `Usuarios RBAC`. 2. Editar permisos de `Juan Manuel Pérez`. 3. Activar `Almacenes & Hormas` y guardar. 4. Cambiar sesión a Juan Manuel.
* **Resultado Esperado:** La barra lateral de Juan Manuel incluye de inmediato el botón `Almacenes & Hormas`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-SEC-05: Revocación de Permiso en Sesión Concurrente
* **HU:** `US-03` | **Categoría:** Edge Case.
* **Objetivo:** Verificar que revocar un permiso cierre la vista activa si el usuario estaba posicionado en ella.
* **Pasos:** 1. Usuario en pestaña `Almacenes`. 2. Se revoca permiso. 3. Navegar a otra vista.
* **Resultado Esperado:** La pestaña desaparece del menú y no se puede volver a entrar.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-SEC-06: Cierre de Sesión Seguro (Logout)
* **HU:** `US-04` | **Categoría:** Happy Path.
* **Objetivo:** Verificar que el botón de logout purgue la sesión activa de memoria y `localStorage`.
* **Pasos:** 1. Hacer clic en `Cerrar Sesión` en la barra superior.
* **Resultado Esperado:** Se limpia el token/sesión y se muestra la pantalla de selección de usuario (Login RBAC).
* **Estatus:** `[Pasa - v2.18.0]`

### TC-SEC-07: Inactivación de Usuario Administrativo
* **HU:** `US-03` | **Categoría:** Negative / Bloqueo.
* **Objetivo:** Validar que un usuario marcado como `Inactivo` no pueda iniciar sesión.
* **Pasos:** 1. Cambiar estatus de un supervisor a `Inactivo`. 2. Intentar loguearse con su perfil.
* **Resultado Esperado:** El sistema bloquea el acceso con mensaje *"Usuario inactivo. Contacte al Administrador."*
* **Estatus:** `[Pasa - v2.18.0]`

### TC-SEC-08: Autenticación por PIN Rápido en Tablet (4 dígitos)
* **HU:** `US-01` | **Categoría:** Tablet / Ergonomía.
* **Objetivo:** Comprobar el teclado numérico en pantalla para firmarse con PIN de 4 dígitos.
* **Pasos:** 1. Seleccionar usuario. 2. Ingresar PIN `1234` mediante keypad táctil.
* **Resultado Esperado:** El sistema valida el PIN al ingresar el cuarto dígito sin requerir pulsar "Enter".
* **Estatus:** `[Pasa - v2.18.0]`

---

## Módulo 1: Terminal de Supervisor, Lector QR y Piso

### TC-TERM-09: Activación de Cámara Web y Enfoque en Vivo
* **HU:** `US-05` | **Categoría:** Hardware / Cámara.
* **Objetivo:** Validar que el botón de escaneo active la cámara web con `getUserMedia` y retícula visual.
* **Pasos:** 1. En Terminal de Supervisor, pulsar ` Abrir Lector QR en Vivo`.
* **Resultado Esperado:** Se abre la cámara con retícula roja/verde de puntería y botón de cancelar.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-10: Decodificación Exitosa de Tarjeta Viajera QR
* **HU:** `US-05` | **Categoría:** Happy Path.
* **Objetivo:** Leer código QR y extraer los metadatos de la orden.
* **Pasos:** 1. Escanear QR con datos `ORD:15068|LOT:49633|SUB:3|MOD:VIEJONON|TALLA:55|FALDA:9.0`.
* **Resultado Esperado:** El sistema extrae: Orden 15068, Lote 49,633, Sublote 3, Modelo El Viejonón, Talla 55, Falda 9.0 cm.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-11: Escaneo con QR Dañado / Sucio (Lectura Fallida)
* **HU:** `US-05` | **Categoría:** Negative / Falla de Hardware.
* **Objetivo:** Manejar el caso de un código QR manchado con adhesivo o roto.
* **Pasos:** 1. Apuntar cámara a un QR borroso o incompleto durante 10 segundos.
* **Resultado Esperado:** El lector muestra mensaje: *"Código no legible. Ajuste la distancia o ingrese el folio manualmente."*
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-12: Verificación Previa Obligatoria de Tarjeta Física
* **HU:** `US-06` | **Categoría:** Regla de Negocio Crítica.
* **Objetivo:** Impedir el movimiento de producto sin cotejo visual previo de la mica protectora de piso.
* **Pasos:** 1. Escanear QR. 2. Revisar réplica digital con encabezado `TARJETA HIDRÁULICAS - ADORNO` y sticker `JORGE`. 3. Pulsar `Confirmar y Proceder`.
* **Resultado Esperado:** Se desbloquea la pantalla de transferencia del lote solo tras confirmar la verificación visual.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-13: Rechazo de Verificación ("Tarjeta Incorrecta")
* **HU:** `US-06` | **Categoría:** Negative / Prevención de Error.
* **Objetivo:** Comprobar que pulsar "Tarjeta Incorrecta" cancele la operación sin afectar el lote.
* **Pasos:** 1. Escanear QR. 2. En el modal de verificación previa, pulsar `Tarjeta Incorrecta / Re-escanear`.
* **Resultado Esperado:** El modal se cierra, la cámara se reinicia y el lote permanece sin cambios en su estación previa.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-14: Asignación Obligatoria de Operador Responsable
* **HU:** `US-08` | **Categoría:** Validación de Entrada.
* **Objetivo:** Impedir transferir el lote si no se ha seleccionado qué operario lo trabajó.
* **Pasos:** 1. En Terminal, intentar pulsar `Completar Estación` sin tocar ningún operador en el selector.
* **Resultado Esperado:** La acción se bloquea con aviso: *"Debe seleccionar el operador que procesó la torre."*
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-15: Depósito Automático por Secuencia de Ruta del Modelo
* **HU:** `US-07` | **Categoría:** Happy Path.
* **Objetivo:** Comprobar que el lote viaje automáticamente a la estación siguiente según su modelo.
* **Pasos:** 1. Sombrero modelo `Denver Master` en D-03 (Prensas). 2. Confirmar salida.
* **Resultado Esperado:** El lote pasa en automático a D-04 (Troquelado de Falda).
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-16: Salto de Estación No Permitido en la Ruta
* **HU:** `US-07` | **Categoría:** Negative / Bloqueo.
* **Objetivo:** Impedir que un lote salte estaciones obligatorias (ej. brincar de Prensas directo a Adorno sin pasar por Troquelado).
* **Pasos:** 1. Intentar forzar la llegada de un lote de D-03 a D-06.
* **Resultado Esperado:** El sistema bloquea el movimiento indicando que el lote debe pasar primero por D-04 y D-05.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-17: Fraccionamiento de Lote Madre (60 a 15 pzas) en Rampa D-05
* **HU:** `US-09` | **Categoría:** Regla de Negocio Crítica.
* **Objetivo:** Comprobar que un Lote Madre de 60 piezas solo pueda fraccionarse en la Rampa de Ensamble (D-05).
* **Precondición:** Lote Madre `49,633` (60 pzas) en D-05.
* **Pasos:** 1. Escanear Lote `49,633`. 2. Pulsar `Fraccionar Lote Madre en 4 Sublotes`. 3. Confirmar.
* **Resultado Esperado:** El Lote Madre se marca como completado y se generan 4 sublotes (`49,633-1` a `-4`) de 15 piezas cada uno.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-18: Intento de Fraccionar Lote Madre Fuera de Rampa (ej. en D-02)
* **HU:** `US-09` | **Categoría:** Negative / Bloqueo.
* **Objetivo:** Validar que el botón de fraccionar NO aparezca ni se permita en departamentos previos a rampa.
* **Pasos:** 1. Escanear Lote Madre en D-02 (Engomado).
* **Resultado Esperado:** El botón de fraccionar no está visible. Solo se permite transferir las 60 piezas en bloque.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-19: Intento de Re-fraccionar un Sublote (15 pzas)
* **HU:** `US-09` | **Categoría:** Negative / Bloqueo.
* **Objetivo:** Evitar que un sublote de 15 piezas se vuelva a subdividir.
* **Pasos:** 1. Escanear el sublote `49,633-2` (15 pzas) en D-05.
* **Resultado Esperado:** El sistema detecta que es un sublote; no ofrece la opción de fraccionamiento.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-20: Restricción Departamental Estricta de Supervisor
* **HU:** `US-10` | **Categoría:** Seguridad / Roles.
* **Objetivo:** Impedir que Juan Manuel (Depts 05-08) mueva un lote en D-03 (tramo de Roberto).
* **Pasos:** 1. Sesión de Juan Manuel. 2. Intentar transferir lote en D-03.
* **Resultado Esperado:** Movimiento denegado con aviso: *"Estación asignada a Roberto Méndez. No tienes permisos para mover este lote."*
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-21: Registro de Merma en Tránsito (14 buenas + 1 defectuosa)
* **HU:** `US-14` | **Categoría:** Edge Case / Merma.
* **Objetivo:** Registrar que una torre de 15 piezas sufrió un daño en prensas y avanza con 1 merma identificada.
* **Pasos:** 1. En Terminal, marcar `14 piezas conformes` y `1 merma por quemadura de vapor`. 2. Transferir.
* **Resultado Esperado:** El lote viaja con 14 piezas activas a D-04; se registra 1 pieza enviada a la cuenta de merma D-12.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-22: Monitor "Mis Almacenes" y Conteo en Vivo
* **HU:** `US-11` | **Categoría:** Happy Path.
* **Objetivo:** Consultar la carga de piezas en los almacenes asignados al supervisor.
* **Pasos:** 1. Abrir sub-pestaña `Monitor de Almacenes Intermedios`.
* **Resultado Esperado:** Se despliegan tarjetas de cada departamento con piezas en buffer y semáforo cromático.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-23: Alerta de Saturación de Almacén Buffer (>70 piezas)
* **HU:** `US-11` | **Categoría:** Edge Case / Saturación.
* **Objetivo:** Comprobar que superar la capacidad de 70 piezas en rampa dispare alerta roja.
* **Pasos:** 1. Acumular 5 sublotes en D-05 (75 piezas).
* **Resultado Esperado:** La tarjeta de D-05 parpadea en rojo con la leyenda: `SATURACIÓN WIP (75 / 70 pzas)`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-24: Rastreo en Value Stream Map (Línea de Tiempo)
* **HU:** `US-12` | **Categoría:** Visual / Trazabilidad.
* **Objetivo:** Comprobar la precisión del mapa de proceso en vivo de cualquier lote.
* **Pasos:** 1. Ir a `Rastreador de Lote`. 2. Buscar lote `49,842`.
* **Resultado Esperado:** Se visualiza la línea con pasos completados (OK), estación activa (`[AQUÍ ESTÁ EL LOTE]`) y paradas pendientes.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-25: Avance Manual Forzado en Value Stream Map (Ingeniero)
* **HU:** `US-12` | **Categoría:** Happy Path / Administración.
* **Objetivo:** Permitir al Ingeniero reubicar un lote desfasado haciendo clic en un nodo de la línea de tiempo.
* **Pasos:** 1. Sesión de `Carlos Ortiz`. 2. Pulsar botón `Avanzar Lote` en el Value Stream Map.
* **Resultado Esperado:** El lote avanza a la siguiente estación con confirmación y firma de auditoría de Carlos.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-TERM-26: Retroceso de Lote por Retrabajo / Defecto
* **HU:** `US-12` | **Categoría:** Edge Case / Retrabajo.
* **Objetivo:** Regresar un lote de D-09 (Planchado) a D-03 (Prensas) por deformación de copa.
* **Pasos:** 1. Pulsar botón `<< Regresar Lote a Estación Previa`. 2. Seleccionar motivo: `Retrabajo de prensado`.
* **Resultado Esperado:** El lote regresa a D-03 y se registra la incidencia en la bitácora histórica.
* **Estatus:** `[Pasa - v2.18.0]`

---

## Módulo 2: Tablero Andon Digital en Nave Central

### TC-AND-27: Semáforo Verde en Estación con Carga Normal
* **HU:** `US-13` | **Categoría:** Happy Path.
* **Objetivo:** Verificar que una estación con carga menor al 70% se muestre en color verde.
* **Pasos:** 1. Estación D-02 con 25 piezas en buffer (capacidad: 80 pzas).
* **Resultado Esperado:** El semáforo de D-02 se muestra en verde sólido con estatus `OPERACIÓN NORMAL`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-28: Semáforo Amarillo en Estación con Alerta Preventiva
* **HU:** `US-13` | **Categoría:** Edge Case.
* **Objetivo:** Comprobar que una estación entre 70% y 90% pase a color amarillo preventivo.
* **Pasos:** 1. Estación D-03 con 65 piezas (capacidad: 80 pzas).
* **Resultado Esperado:** Semáforo en amarillo ámbar con estatus `ALERTA DE FLUJO (81% WIP)`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-29: Semáforo Rojo Parpadeante en Estación Saturada
* **HU:** `US-13` | **Categoría:** Alerta Industrial.
* **Objetivo:** Comprobar que superar el 90% active el semáforo rojo pulsante.
* **Pasos:** 1. Estación D-05 con 75 piezas (capacidad: 70 pzas).
* **Resultado Esperado:** Semáforo rojo pulsante visible a distancia con texto `SATURACIÓN / PARO INMINENTE`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-30: Cálculo de Takt Time en Vivo (42 segundos)
* **HU:** `US-14` | **Categoría:** Lean Manufacturing.
* **Objetivo:** Comparar el ritmo de salida real de piezas contra el Takt Time estándar de 42 segundos.
* **Pasos:** 1. Consultar el indicador de Takt Time en el encabezado del Andon.
* **Resultado Esperado:** Se visualiza: `Takt Time Std: 42s` vs `Takt Time Actual: 44.2s` (+2.2s de desvío).
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-31: Monitoreo de Meta Diaria de Turno (850 piezas)
* **HU:** `US-15` | **Categoría:** Happy Path.
* **Objetivo:** Validar el velocímetro de avance diario contra 850 piezas terminadas.
* **Pasos:** 1. Registrar 612 piezas completadas en D-13.
* **Resultado Esperado:** Velocímetro muestra `612 / 850 pzas (72.0%)` con barra de avance proporcional.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-32: Monitoreo de Meta Semanal de Producción (4,250 piezas)
* **HU:** `US-15` | **Categoría:** Dirección.
* **Objetivo:** Comprobar el acumulado semanal contra la meta de 4,250 piezas (Lunes a Viernes).
* **Pasos:** 1. Consultar tarjeta de Meta Semanal en Andon.
* **Resultado Esperado:** Muestra piezas acumuladas de la semana (ej. 3,180 pzas) y el % restante para el corte de viernes.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-33: Agrupación en Tabla de Producción Hora por Hora
* **HU:** `US-16` | **Categoría:** Funcional.
* **Objetivo:** Validar que las piezas completadas a las 10:20 AM se sumen en el bloque horario `10:00 - 11:00`.
* **Pasos:** 1. Transferir 15 piezas en empaque a las 10:20 AM.
* **Resultado Esperado:** La fila `10:00 - 11:00` incrementa su producido real en +15 piezas.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-34: Detección de Déficit Horario (Celda en Rojo)
* **HU:** `US-16` | **Categoría:** Visual / Alerta.
* **Objetivo:** Resaltar en rojo los bloques horarios que no alcanzaron la cuota de 106 piezas.
* **Pasos:** 1. Bloque `11:00 - 12:00` cierra con 78 piezas producidas (meta: 106 pzas).
* **Resultado Esperado:** La celda muestra `-28 pzas` con fondo rojo suave de advertencia.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-35: Receso de Almuerzo en Horario (12:00 a 12:45)
* **HU:** `US-16`, `US-38` | **Categoría:** Regla de Negocio.
* **Objetivo:** Verificar que el bloque de 12:00 a 12:45 se marque como comida y no penalice el Takt Time.
* **Pasos:** 1. Consultar el Andon durante el intervalo de comida.
* **Resultado Esperado:** El tablero indica ` RECESO DE ALMUERZO (Línea en Pausa Programada)` y el cronómetro de Takt se congela.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-36: Modo Pantalla Completa para Smart TV (50 pulgadas)
* **HU:** `US-13` | **Categoría:** Ergonomía / TV Nave.
* **Objetivo:** Maximizar el tablero sin barras laterales para visibilidad a 20 metros.
* **Pasos:** 1. En Andon, hacer clic en ` Pantalla Completa`.
* **Resultado Esperado:** La barra lateral colapsa, los textos aumentan de contraste y tamaño, ocupando el 100% de la pantalla.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-AND-37: Inicio Dinámico de Turno con el Primer QR Escaneado
* **HU:** `US-17` | **Categoría:** Edge Case / Arranque.
* **Objetivo:** Iniciar el reloj de producción en el momento del primer escaneo real del día.
* **Pasos:** 1. Son las 07:14 AM. Se escanea el primer lote en D-01.
* **Resultado Esperado:** El sistema registra las 07:14 como hora de arranque real, registrando 14 min de precalentamiento.
* **Estatus:** `[Por Validar / Especificación]`

---

## Módulo 3: Almacenes Físicos, Sombreros, Hormas e Inventarios

### TC-INV-38: Búsqueda Reactiva de Sombreros por Texto en Vivo
* **HU:** `US-18` | **Categoría:** Happy Path / UI.
* **Objetivo:** Filtrar el catálogo escribiendo en el buscador en tiempo real.
* **Pasos:** 1. En `Catálogo de Sombreros`, teclear `"Denver"` en `#hatSearchInput`.
* **Resultado Esperado:** La tabla muestra únicamente `SOM-01 Denver Master` en <50ms.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-39: Filtrado Selectivo por Material de Sombrero
* **HU:** `US-18` | **Categoría:** Filtro Multi-Criterio.
* **Objetivo:** Seleccionar material `1000X Master Telar` en el dropdown.
* **Pasos:** 1. Filtrar por `1000X Master Telar`.
* **Resultado Esperado:** Se muestran solo los modelos fabricados con telar 1000X (Denver, Viejonón, Magnum).
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-40: Botón de Limpiar Filtros en Catálogo
* **HU:** `US-18` | **Categoría:** Ergonomía.
* **Objetivo:** Resetear todos los filtros aplicados en un solo clic.
* **Pasos:** 1. Tener filtros activos. 2. Pulsar `Limpiar Filtros`.
* **Resultado Esperado:** Se limpian los inputs y se restablece la lista completa de sombreros.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-41: Apertura y Despliegue de Ficha Técnica de Sombrero
* **HU:** `US-19` | **Categoría:** Visual / Ficha Técnica.
* **Objetivo:** Consultar la especificación técnica completa de un modelo de sombrero.
* **Pasos:** 1. En la fila de `SOM-02 El Viejonón`, pulsar `Ficha`.
* **Resultado Esperado:** Modal con foto técnica, dimensiones (Copa 11.5 cm, Falda 9.5 cm), horma (#55 Viejonón), tallas (54 a 60) y precio ($1,420 MXN).
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-42: Carga de Fotografía de Sombrero mediante Drag & Drop
* **HU:** `US-20` | **Categoría:** Manejo de Archivos.
* **Objetivo:** Arrastrar una imagen local a la zona dropzone del modal de registro de sombrero.
* **Pasos:** 1. Abrir `+ Registrar Nuevo Sombrero`. 2. Arrastrar imagen `sombrero_chaparral.jpg`.
* **Resultado Esperado:** Vista previa instantánea, conversión a Base64 y botón para remover foto si se desea cambiar.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-43: Carga de Fotografía mediante Selector de Archivo Local
* **HU:** `US-20` | **Categoría:** Tablet / Móvil.
* **Objetivo:** Tocar el dropzone en tablet para abrir la galería de fotos o cámara del dispositivo.
* **Pasos:** 1. Tocar el dropzone. 2. Seleccionar foto desde el explorador del sistema operativo.
* **Resultado Esperado:** La imagen se carga con éxito en la vista previa del formulario.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-44: Registro de Sombrero sin Fotografía (Fallback Vectorial)
* **HU:** `US-20` | **Categoría:** Edge Case.
* **Objetivo:** Validar que si no se proporciona fotografía, el sistema asigne un thumbnail vectorial SVG por defecto.
* **Pasos:** 1. Registrar sombrero llenando campos de texto pero sin cargar foto. 2. Guardar.
* **Resultado Esperado:** Se guarda con éxito y la tabla muestra el icono SVG estilizado de sombrero vaquero. Cero enlaces rotos.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-45: Validación de Código Único de Sombrero (SOM-XX)
* **HU:** `US-20` | **Categoría:** Negative / Validación.
* **Objetivo:** Impedir el registro de dos sombreros con el mismo código.
* **Pasos:** 1. Intentar registrar un sombrero con código `SOM-01` (ya existente).
* **Resultado Esperado:** El sistema bloquea el guardado: *"El código SOM-01 ya está asignado a Denver Master."*
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-46: Catálogo de Hormas y Moldes Maquinados de Aluminio
* **HU:** `US-21` | **Categoría:** Happy Path.
* **Objetivo:** Visualizar las hormas de aluminio maquinado con sus specs mecánicas y térmicas.
* **Pasos:** 1. Ir a sub-pestaña `Catálogo de Hormas`.
* **Resultado Esperado:** Tabla con thumbnail de la horma, código de rack, nombre, máquina asignada, temperatura, presión y vida útil.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-47: Ficha Técnica de Horma y Barra de Vida Útil
* **HU:** `US-22` | **Categoría:** Mantenimiento.
* **Objetivo:** Consultar la vida útil y ciclos de prensado acumulados de una horma.
* **Pasos:** 1. En horma `#55 EL VIEJONÓN`, pulsar `Ficha`.
* **Resultado Esperado:** Modal despliega: Duraluminio 6061-T6, 175°C, 7.2 bar, 31,400 ciclos (62.8% vida útil) y prensas compatibles.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-48: Alerta de Horma con Vida Útil Excedida (>50,000 ciclos)
* **HU:** `US-22` | **Categoría:** Edge Case / Alerta.
* **Objetivo:** Alertar cuando una horma de aluminio supere los 50,000 ciclos y requiera rectificación.
* **Pasos:** 1. Horma con 51,200 ciclos registrados.
* **Resultado Esperado:** La barra de desgaste se colorea en rojo parpadeante con leyenda: ` RECTIFICACIÓN REQUERIDA (102.4%)`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-49: Registro de Nueva Horma con Carga de Foto Drag & Drop
* **HU:** `US-22` | **Categoría:** Happy Path.
* **Objetivo:** Dar de alta un molde de aluminio con fotografía técnica.
* **Pasos:** 1. Pulsar `+ Registrar Nueva Horma`. 2. Llenar aleación, máquina, temp y arrastrar foto. 3. Guardar.
* **Resultado Esperado:** La nueva horma aparece de inmediato en la tabla y persiste en `localStorage`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-50: Consulta de Stock en los 5 Almacenes Físicos
* **HU:** `US-23` | **Categoría:** Happy Path.
* **Objetivo:** Verificar existencias consolidadas en: Materia Prima, Rampa WIP, Pulmón Pre-Calidad, Terminado y Merma.
* **Pasos:** 1. Ir a sub-pestaña `Almacenes Físicos`. 2. Seleccionar almacén `D-05 Rampa WIP`.
* **Resultado Esperado:** Se despliega el desglose de lotes y torres que se encuentran físicamente en rampa.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-51: Consulta de Stock de Tafiletes por Talla (#54 a #60)
* **HU:** `US-24` | **Categoría:** Happy Path.
* **Objetivo:** Verificar inventario de badanas de piel por cada talla craneal.
* **Pasos:** 1. Ir a sub-pestaña `Stock de Tafiletes por Talla`.
* **Resultado Esperado:** Tabla de tallas (54 a 60) con cantidad disponible, stock mínimo y pastilla de estatus.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-52: Alerta Crítica en Tafilete con Existencia < 50 piezas
* **HU:** `US-24` | **Categoría:** Edge Case / Desabasto.
* **Objetivo:** Validar advertencia visual cuando una talla de tafilete esté en riesgo de agotar la línea.
* **Pasos:** 1. Talla `# 60` con existencia de 18 piezas.
* **Resultado Esperado:** Pastilla roja pulsante: `STOCK CRÍTICO (18 pzas)`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-53: Registro Automático en Kárdex tras Movimiento de Lote
* **HU:** `US-25` | **Categoría:** Auditoría.
* **Objetivo:** Comprobar que transferir un lote genere automáticamente un renglón en el Kárdex general.
* **Pasos:** 1. Transferir Lote 49,386 de D-03 a D-04. 2. Abrir sub-pestaña `Kárdex & Movimientos`.
* **Resultado Esperado:** Nuevo registro en Kárdex con timestamp exacto, folio de lote, tipo `Traspaso WIP`, origen D-03 y destino D-04.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-54: Filtrado de Kárdex por Rango de Fechas y Tipo de Movimiento
* **HU:** `US-25` | **Categoría:** Filtro Multi-Criterio.
* **Objetivo:** Consultar únicamente los movimientos de tipo `Merma` en el Kárdex.
* **Pasos:** 1. En dropdown de tipo de movimiento, seleccionar `Merma / Scrap`.
* **Resultado Esperado:** La tabla solo muestra los eventos donde se dieron de baja piezas defectuosas.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-INV-55: Fijación de Pestañas Flotantes con el Scroll (Sticky Tabs)
* **HU:** `US-18`, `RF-69` | **Categoría:** Tablet / CSS.
* **Objetivo:** Comprobar que al hacer scroll hacia abajo en tablas largas, las sub-pestañas permanezcan fijas en pantalla.
* **Pasos:** 1. En catálogo de sombreros, hacer scroll vertical de 500px hacia abajo.
* **Resultado Esperado:** La barra de sub-pestañas permanece anclada (`top: 76px; z-index: 95`) con fondo difuminado, permitiendo cambiar de pestaña sin regresar arriba.
* **Estatus:** `[Pasa - v2.18.0]`

---

## Módulo 4: Padrón de Operadores y Mano de Obra

### TC-OPE-56: Consulta del Directorio de Operadores en Planta
* **HU:** `US-26` | **Categoría:** Happy Path.
* **Objetivo:** Visualizar el padrón de mano de obra con su foto, nómina y máquina.
* **Pasos:** 1. Navegar a `Padrón de Operadores`.
* **Resultado Esperado:** Tabla con lista de operarios, números de nómina (`OP-101` a `OP-112`), estaciones y máquinas asignadas.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-OPE-57: Conteo Acumulado de Piezas por Operador para Destajo
* **HU:** `US-27` | **Categoría:** Happy Path / Nómina.
* **Objetivo:** Verificar que las piezas transferidas en Terminal se sumen al operador en el Padrón.
* **Pasos:** 1. Transferir lote de 15 piezas asignado a `Melany Ramos`. 2. Abrir Padrón de Operadores.
* **Resultado Esperado:** El contador de Melany Ramos se incrementa en +15 piezas el día de hoy.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-OPE-58: Alta de Operador con Validación de Nómina Duplicada
* **HU:** `US-28` | **Categoría:** Negative / Validación.
* **Objetivo:** Impedir el registro de un nuevo trabajador con número de nómina repetido.
* **Pasos:** 1. Pulsar `+ Registrar Operador`. 2. Ingresar nómina `OP-104` (perteneciente a Jorge Mendoza).
* **Resultado Esperado:** El formulario muestra error: *"El número de nómina OP-104 ya existe en el padrón."*
* **Estatus:** `[Pasa - v2.18.0]`

### TC-OPE-59: Edición de Máquina Asignada a Operador
* **HU:** `US-28` | **Categoría:** Happy Path.
* **Objetivo:** Reasignar a un operador de la `Prensa 01` a la `Prensa 03`.
* **Pasos:** 1. En fila de operador, pulsar `Editar`. 2. Cambiar máquina a `Prensa Michelagnoli 03`. 3. Guardar.
* **Resultado Esperado:** La tabla actualiza la máquina asignada y persiste en almacenamiento local.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-OPE-60: Inactivación Temporal de Operador por Incapacidad o Falta
* **HU:** `US-28` | **Categoría:** Edge Case.
* **Objetivo:** Marcar a un operador como Inactivo para que no aparezca en los selectores de la Terminal.
* **Pasos:** 1. Cambiar estatus de operador a `Inactivo`. 2. Abrir Terminal de Supervisor.
* **Resultado Esperado:** El operador inactivo ya no aparece en la lista de selección al transferir lotes.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-OPE-61: Filtrado de Operadores por Departamento
* **HU:** `US-26` | **Categoría:** Filtro Multi-Criterio.
* **Objetivo:** Filtrar el padrón para ver solo los trabajadores de `D-03 Prensas de Hormado`.
* **Pasos:** 1. Seleccionar `D-03` en el dropdown de departamento.
* **Resultado Esperado:** La tabla se reduce a mostrar únicamente los prenseros de planta.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-OPE-62: Búsqueda de Operador por Nombre
* **HU:** `US-26` | **Categoría:** Búsqueda en Vivo.
* **Objetivo:** Encontrar un trabajador tecleando parte de su nombre o apellido.
* **Pasos:** 1. Escribir `"Melany"` en la barra de búsqueda.
* **Resultado Esperado:** Se muestra únicamente el registro de `Melany Ramos`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-OPE-63: Operador Asignado a Turno Único
* **HU:** `US-26` | **Categoría:** Regla de Negocio.
* **Objetivo:** Verificar que todos los operadores estén rotulados bajo el Turno Único (07:00 a 15:30).
* **Pasos:** 1. Revisar la columna Turno en la tabla.
* **Resultado Esperado:** Todos los registros indican `Turno Único (07:00 - 15:30)`. No existen turnos obsoletos (Turno 2 / 3).
* **Estatus:** `[Pasa - v2.18.0]`

### TC-OPE-64: Ergonomía de Botones de Acción en Tablet (38px altura)
* **HU:** `US-26`, `RF-69` | **Categoría:** Tablet / Táctil.
* **Objetivo:** Garantizar que los botones `Editar` y `Baja` sean fáciles de presionar con el dedo.
* **Pasos:** 1. Probar en pantalla táctil de tablet.
* **Resultado Esperado:** Zona táctil de 38px de altura mínima, centrada, con micro-interacción `:active { transform: scale(0.97) }`.
* **Estatus:** `[Pasa - v2.18.0]`

---

## Módulo 5: Analítica & KPIs de Planta

### TC-ANA-65: Cálculo Matemático Desagregado de OEE Global
* **HU:** `US-29` | **Categoría:** Lean Manufacturing.
* **Objetivo:** Comprobar la fórmula OEE = Disponibilidad × Rendimiento × Calidad.
* **Pasos:** 1. Ir a `Analítica & KPIs` → `OEE & Eficiencia`. 2. Cotejar: Disp (91.2%), Rend (88.7%), Cal (98.2%).
* **Resultado Esperado:** OEE calculado = `79.4%` (0.912 × 0.887 × 0.982 = 0.794), clasificado en semáforo amarillo.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-66: Valorización Financiera de Producción en Vivo ($1,310 catálogo)
* **HU:** `US-30` | **Categoría:** Dirección / Finanzas.
* **Objetivo:** Validar la multiplicación de piezas en proceso por el valor de catálogo.
* **Pasos:** 1. Ir a sub-pestaña `Resumen Financiero & Valorización`.
* **Resultado Esperado:** Valor total calculado en `$801,720 MXN` con desglose de pedidos B2B, segundas y merma.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-67: Proporción Destinada a Pedidos Mayoristas B2B (72%)
* **HU:** `US-30` | **Categoría:** Finanzas.
* **Objetivo:** Verificar el porcentaje de sombreros terminados comprometidos con clientes mayoristas.
* **Pasos:** 1. Revisar la tarjeta de desglose B2B.
* **Resultado Esperado:** Tarjeta indica `72.0% Comprometido B2B` con valor comercial estimado de `$577,238 MXN`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-68: Valor Recuperable en Segundas de Fábrica ($17,030 MXN)
* **HU:** `US-30` | **Categoría:** Finanzas / Recuperación.
* **Objetivo:** Calcular el valor comercial de piezas con defecto menor vendibles a precio de remate ($450 MXN).
* **Pasos:** 1. Consultar tarjeta de segundas.
* **Resultado Esperado:** Muestra `$17,030 MXN` recuperables en venta de mostrador de fábrica.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-69: Costo Acumulado de Merma / Scrap ($18,340 MXN)
* **HU:** `US-30` | **Categoría:** Finanzas / Costos.
* **Objetivo:** Reflejar la pérdida financiera por campanas rotas o quemadas en el turno.
* **Pasos:** 1. Consultar tarjeta de merma.
* **Resultado Esperado:** Muestra `$18,340 MXN` de impacto negativo en costo de materia prima desperdiciada.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-70: Ranking de Cumplimiento por Supervisor (Roberto vs Juan Manuel)
* **HU:** `US-31` | **Categoría:** KPIs de Rendimiento.
* **Objetivo:** Comparar el avance del tramo D-01 a D-04 contra el tramo D-05 a D-08.
* **Pasos:** 1. Ir a `KPIs de Rendimiento`.
* **Resultado Esperado:** Gráficas comparativas de piezas entregadas a tiempo, tiempo de ciclo y tasa de defectos por supervisor.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-71: Gráfica de Balanceo de Líneas vs Línea Roja de Takt Time (42s)
* **HU:** `US-32` | **Categoría:** Ingeniería de Procesos.
* **Objetivo:** Visualizar los tiempos de ciclo de cada departamento respecto a los 42 segundos estándar.
* **Pasos:** 1. Ir a sub-pestaña `Balanceo & Cuellos`.
* **Resultado Esperado:** Gráfica de barras horizontales donde las estaciones que superan 42s (D-03 Prensas y D-06 Ribeteado) rebasan la línea roja guía.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-72: Identificación Automática del Cuello de Botella de Planta
* **HU:** `US-32` | **Categoría:** Lean Manufacturing.
* **Objetivo:** Resaltar en la analítica cuál es la estación más lenta de la fábrica.
* **Pasos:** 1. Consultar tarjeta de cuello de botella en `Balanceo & Cuellos`.
* **Resultado Esperado:** Tarjeta destaca: `CUELLO DE BOTELLA PRINCIPAL: D-03 Prensas de Vapor (Tiempo de Ciclo: 48.5s)`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-73: Bitácora de Paros SMED y Registro de Tiempos Muertos
* **HU:** `US-33` | **Categoría:** Mantenimiento / SMED.
* **Objetivo:** Consultar el historial de paros de máquina ocurridos en la semana.
* **Pasos:** 1. Ir a `Bitácora de Paros & SMED`.
* **Resultado Esperado:** Tabla con los 4 eventos: Cambio de Horma #54 a #55 (28 min), Caída de Caldera (18 min), Ajuste de Cuchilla (12 min) y Desabasto de Hilo (15 min).
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-74: Cálculo de Piezas No Producidas por Paro de Máquina
* **HU:** `US-33` | **Categoría:** Matemático / Impacto.
* **Objetivo:** Multiplicar la duración del paro por la tasa de producción teórica (1 pieza cada 42 segundos).
* **Pasos:** 1. Analizar el paro de 28 minutos en Prensa 02.
* **Resultado Esperado:** El sistema calcula: 28 min × (60s / 42s) = ~40 sombreros no producidos por el cambio de horma.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-75: Matriz de Materiales (BOM) por Modelo de Sombrero
* **HU:** `US-34` | **Categoría:** Estructura de Producto.
* **Objetivo:** Consultar el desglose de componentes necesarios para armar un sombrero Denver Master.
* **Pasos:** 1. Ir a sub-pestaña `Matriz BOM`. 2. Seleccionar modelo `Denver Master`.
* **Resultado Esperado:** Desglose: 1 campana telar 1000X, 1 tafilete de piel, 1 toquilla de piel con herraje, 1 pluma natural y pegamento térmico.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-ANA-76: Simulación de Costos por Cambio de Proveedor en BOM
* **HU:** `US-34` | **Categoría:** Dirección / Compras.
* **Objetivo:** Simular el costo total del sombrero si se cambia de proveedor de piel de carnero para tafiletes.
* **Pasos:** 1. En la fila de tafilete, cambiar proveedor de `Pieles del Rincón ($45 MXN)` a `Curtidos León ($38 MXN)`.
* **Resultado Esperado:** El costo total del sombrero disminuye de `$385.50 MXN` a `$378.50 MXN` (-1.8% de costo unitario).
* **Estatus:** `[Pasa - v2.18.0]`

---

## Módulo 6: Configuración de Planta, Rutas y CONTPAQi ERP

### TC-CFG-77: Alta de Nuevo Departamento de Planta (D-XX)
* **HU:** `US-35` | **Categoría:** Happy Path.
* **Objetivo:** Dar de alta una nueva estación con supervisor y Takt Time.
* **Pasos:** 1. En Configuración, pulsar `+ Registrar Estación`. 2. Llenar código `D-15`, nombre `Laqueado Especial`, Takt Time `30s`, Supervisor `Roberto Méndez`. 3. Guardar.
* **Resultado Esperado:** La estación se añade a la tabla maestra y persiste en base local.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-78: Validación de Código de Departamento Duplicado
* **HU:** `US-35` | **Categoría:** Negative / Validación.
* **Objetivo:** Impedir el registro de dos departamentos con el mismo código.
* **Pasos:** 1. Intentar registrar una estación con código `D-03` (ya existente).
* **Resultado Esperado:** El sistema bloquea el guardado: *"El código D-03 ya pertenece a Prensas de Hormado a Vapor."*
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-79: Reordenamiento de Rutas de Fabricación con Drag & Drop
* **HU:** `US-36` | **Categoría:** Interacción Táctil.
* **Objetivo:** Arrastrar una estación para cambiar la secuencia de manufactura de un modelo.
* **Pasos:** 1. Ir a `Rutas & Secuencias por Modelo`. 2. Seleccionar `El Viejonón`. 3. Arrastrar el asa `⠿` del paso D-04 después de D-05.
* **Resultado Esperado:** El orden visual se actualiza de inmediato y se guarda en `localStorage`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-80: Delimitación de Alcance en Secuencias (Sin crear departamentos)
* **HU:** `US-36` | **Categoría:** Seguridad / Integridad.
* **Objetivo:** Comprobar que desde el constructor de rutas solo se puedan reordenar pasos, sin crear ni eliminar departamentos maestros.
* **Pasos:** 1. Inspeccionar la pantalla de rutas.
* **Resultado Esperado:** Solo existen botones para `Subir`, `Bajar`, `Asignar al final` y `Quitar de esta secuencia`. No existen botones de borrar departamento maestro.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-81: Alta de Punto de Inspección de Calidad (C-XX) con Tolerancias
* **HU:** `US-37` | **Categoría:** Happy Path / Calidad.
* **Objetivo:** Registrar una estación de control de calidad con tolerancias dimensionales.
* **Pasos:** 1. Ir a `Filtros de Calidad`. 2. Registrar `C-05 Inspección de Falda`, tolerancia `± 1.5 mm`, inspector `Bernardo Fonseca`.
* **Resultado Esperado:** Se agrega el punto C-05 y queda disponible para intercalarse en las secuencias de rutas.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-82: Validación de Tolerancia Numérica en Puntos de Calidad
* **HU:** `US-37` | **Categoría:** Negative / Validación.
* **Objetivo:** Impedir el guardado de una tolerancia con caracteres no numéricos inválidos.
* **Pasos:** 1. Ingresar tolerancia `"mucho error"` en el campo numérico.
* **Resultado Esperado:** El formulario solicita ingresar un valor dimensional válido (ej. `± 2 mm`).
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-83: Configuración del Horario de Turno Único (07:00 a 15:30)
* **HU:** `US-38` | **Categoría:** Happy Path.
* **Objetivo:** Guardar la jornada laboral y comprobar el cálculo de minutos netos de producción.
* **Pasos:** 1. Configurar entrada `07:00`, salida `15:30`, comida `12:00 a 12:45`. 2. Guardar.
* **Resultado Esperado:** El sistema calcula: 510 min brutos - 45 min comida = `465 minutos netos de producción por turno`.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-84: Prueba de Conexión ODBC con CONTPAQi ERP (COMPAC)
* **HU:** `US-39` | **Categoría:** Conectividad / Handshake.
* **Objetivo:** Comprobar el botón de test ODBC hacia la base de datos de COMPAC.
* **Pasos:** 1. Ir a `Integración COMPAC`. 2. Pulsar ` Probar Conexión con CONTPAQi ERP`.
* **Resultado Esperado:** Botón entra en estado de carga y emite toast de confirmación: *"Conexión ODBC Exitosa con base COMPAC_TOMBSTONE_PROD (Latencia: 12ms)"*.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-85: Mapeo de Bodegas Contables vs Almacenes Físicos
* **HU:** `US-39` | **Categoría:** Integración ERP.
* **Objetivo:** Cotejar que los 5 almacenes del MES correspondan a las bodegas de CONTPAQi.
* **Pasos:** 1. Revisar la tabla de mapeo de bodegas.
* **Resultado Esperado:** Bodega 01 COMPAC → Almacén D-01 Materia Prima; Bodega 05 COMPAC → D-05 Rampa WIP; Bodega 10 COMPAC → D-14 Terminado.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-86: Emisión de Vale de Salida / Camioneta B2B con Placas y Chofer
* **HU:** `US-40` | **Categoría:** Happy Path / Embarques.
* **Objetivo:** Generar el vale digital de entrega al concluir el lote en empaque.
* **Pasos:** 1. En `Integración COMPAC`, seleccionar lote terminado `49,842`. 2. Ingresar chofer `Ramiro Vega`, placas `GT-4821-B`. 3. Pulsar `Emitir Vale de Camioneta`.
* **Resultado Esperado:** Se genera el folio `VALE-2026-0842` con 58 piezas de primera y 2 mermas. El lote se marca como entregado.
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-87: Intento de Emitir Vale con Lote Incompleto
* **HU:** `US-40` | **Categoría:** Negative / Bloqueo.
* **Objetivo:** Impedir la emisión de vale de camioneta a un lote que aún no termina su proceso en planta.
* **Pasos:** 1. Intentar seleccionar un lote ubicado en D-06 (Ribeteado) para emitir vale de camioneta.
* **Resultado Esperado:** El sistema bloquea la acción: *"El lote 49,633 aún se encuentra en proceso (D-06). Solo se pueden emitir vales de lotes terminados en Empaque."*
* **Estatus:** `[Pasa - v2.18.0]`

### TC-CFG-88: Exportación de Vales a Archivo CSV para Carga en COMPAC
* **HU:** `US-40` | **Categoría:** Exportación de Datos.
* **Objetivo:** Descargar la bitácora de vales de salida en archivo CSV para importación contable.
* **Pasos:** 1. En Integración COMPAC, pulsar `Exportar Vales (CSV)`.
* **Resultado Esperado:** Se descarga el archivo `vales_tombstone_2026-09-25.csv` con columnas compatibles con CONTPAQi.
* **Estatus:** `[Pasa - v2.18.0]`

---

## Módulo 7: Generación de Tarjetas, Pedidos, Compras y Offline

### TC-NEW-89: Generación de Plantilla de Tarjeta Viajera Imprimible
* **HU:** `US-41` | **Categoría:** Salida de Impresión.
* **Objetivo:** Generar la tarjeta viajera con datos fijos y QR para imprimir en papel bond.
* **Pasos:** 1. En orden liberada, pulsar `Generar Tarjeta Viajera`.
* **Resultado Esperado:** Vista de impresión con cuadrícula idéntica a la tarjeta real, orificio superior para cordel y código QR de alta resolución.
* **Estatus:** `[Por Validar / Especificación]`

### TC-NEW-90: Re-impresión Controlada de Tarjeta Viajera Extraviada
* **HU:** `US-41` | **Categoría:** Auditoría / Duplicados.
* **Objetivo:** Permitir re-imprimir una tarjeta que se mojó o rompió, registrando motivo y usuario.
* **Pasos:** 1. Solicitar re-impresión de Lote 49,386. 2. Ingresar motivo: `Mica rota en rampa`.
* **Resultado Esperado:** La tarjeta se imprime con marca de agua `COPIA 2 / REIMPRESIÓN` y se audita en el sistema para evitar lotes clonados.
* **Estatus:** `[Por Validar / Especificación]`

### TC-NEW-91: Captura de Pedido Mayorista y Desglose en Lotes de 60
* **HU:** `US-42` | **Categoría:** Planeación de Producción.
* **Objetivo:** Registrar pedido de 180 sombreros y generar automáticamente 3 Lotes Madre de 60 piezas.
* **Pasos:** 1. Capturar pedido: Cliente `Tiendas Western`, 180 piezas Denver Master.
* **Resultado Esperado:** El sistema crea OP-15072 y desglosa Lote 1 (60 pzas), Lote 2 (60 pzas) y Lote 3 (60 pzas).
* **Estatus:** `[Por Validar / Especificación]`

### TC-NEW-92: Manejo de Lotes Excepcionales con Cantidad Distinta a 60 (ej. 45 pzas)
* **HU:** `US-42` | **Categoría:** Edge Case / Excepción.
* **Objetivo:** Permitir la creación de un lote de 45 piezas para completar un pedido especial.
* **Pasos:** 1. Crear lote con parámetro editable: `45 piezas` (3 sublotes de 15).
* **Resultado Esperado:** El sistema valida y genera 3 sublotes en lugar de 4 sin error de división.
* **Estatus:** `[Por Validar / Especificación]`

### TC-NEW-93: Recepción de Materia Prima y Afectación de Stock Inicial
* **HU:** `US-43` | **Categoría:** Almacén D-01.
* **Objetivo:** Registrar la llegada de 500 campanas de telar 1000X desde proveedor.
* **Pasos:** 1. Registrar recepción de insumos en D-01: 500 campanas.
* **Resultado Esperado:** El inventario de materia prima se incrementa en +500 piezas y queda disponible para crear órdenes.
* **Estatus:** `[Por Validar / Especificación]`

### TC-NEW-94: Operación en Modo Sin Conexión (Offline Cache en Tablet)
* **HU:** `US-44` | **Categoría:** Resiliencia de Red.
* **Objetivo:** Seguir escaneando y moviendo lotes aunque se caiga el Wi-Fi de la nave.
* **Pasos:** 1. Poner tablet en Modo Avión. 2. Escanear lote 49,633-1 y registrar avance en D-06.
* **Resultado Esperado:** La app procesa el movimiento en memoria local (`IndexedDB`) con pastilla `En espera de red`.
* **Estatus:** `[Por Validar / Especificación]`

### TC-NEW-95: Sincronización Automática al Restaurar Conexión Wi-Fi
* **HU:** `US-44` | **Categoría:** Sincronización.
* **Objetivo:** Enviar los escaneos acumulados al servidor cuando regresa la señal de internet.
* **Pasos:** 1. Desactivar Modo Avión en la tablet.
* **Resultado Esperado:** La cola de movimientos se sincroniza en orden cronológico exacto; la pastilla cambia a ` Conectado y Sincronizado`.
* **Estatus:** `[Por Validar / Especificación]`

### TC-NEW-96: Auditoría Semanal de Segundas y Merma de Viernes
* **HU:** `US-45` | **Categoría:** Calidad / Proceso de Viernes.
* **Objetivo:** Reclasificar 20 piezas con defecto en D-12 para venta de remate en fábrica.
* **Pasos:** 1. Abrir pantalla de `Revisión de Segundas`. 2. Asignar 15 sombreros a `Segunda de Fábrica ($450 MXN)` y 5 a `Desecho Total`.
* **Resultado Esperado:** Las 15 piezas se mueven al inventario de mostrador y las 5 se purgan como costo de merma definitivo.
* **Estatus:** `[Por Validar / Especificación]`

---

##  Matriz Consolidada de Cobertura de QA

| Módulo del Sistema | Happy Path | Negativos / Bloqueo | Edge Cases / Alertas | Tablet / Táctil | Total Casos de Prueba |
|---|:---:|:---:|:---:|:---:|:---:|
| **0. Seguridad y RBAC** | 3 | 3 | 1 | 1 | **8** |
| **1. Terminal y Escaneo QR** | 5 | 5 | 5 | 3 | **18** |
| **2. Tablero Andon** | 4 | 0 | 5 | 2 | **11** |
| **3. Almacenes, Sombreros y Hormas** | 7 | 2 | 5 | 4 | **18** |
| **4. Padrón de Operadores** | 4 | 2 | 2 | 1 | **9** |
| **5. Analítica & KPIs de Planta** | 5 | 0 | 5 | 2 | **12** |
| **6. Configuración y COMPAC** | 5 | 3 | 2 | 2 | **12** |
| **7. Tarjetas, Pedidos y Offline** | 3 | 1 | 3 | 1 | **8** |
| **TOTALES CONSOLIDADOS** | **36** | **16** | **28** | **16** | **96 Casos de Prueba** |
