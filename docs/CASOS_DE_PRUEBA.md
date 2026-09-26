# 🧪 Catálogo Maestro de Casos de Prueba (Test Cases)
## Tombstone Hats MES · Control de Planta, Trazabilidad y Tablero Andon
> **Matriz Exhaustiva de Pruebas de Software y Validación Operativa en Piso**  
> **Versión del Sistema:** `v2.18.0` | **Fecha:** 25 de Septiembre de 2026  
> **Trazabilidad:** Derivado de las 45 Historias de Usuario (`docs/HISTORIAS_DE_USUARIO.md`) y Requerimientos de Software (`docs/REQUERIMIENTOS_DEL_SISTEMA.md`).  
> **Planta Matriz:** San Francisco del Rincón, Guanajuato | **Cliente:** Tombstone Hats  

---

## 📌 Guía de Clasificación de Casos de Prueba

Cada caso de prueba está estructurado bajo el estándar internacional de QA (IEEE 829 / ISTQB):
* **ID:** Identificador único por módulo (ej. `TC-SEC-01`, `TC-TERM-05`).
* **HU Vinculada:** Historia de usuario de origen (`US-XX`).
* **Tipo de Prueba:** Funcional, Validación de Entrada, Límite / Carga, Seguridad / RBAC, Táctil / Tablet.
* **Estatus Actual:** `[✅ Pasa - v2.18.0]` / `[🟡 Por Validar / Especificación]`.

---

## 📑 Índice de Módulos de Prueba

1. [Módulo 0: Autenticación, Seguridad y RBAC (TC-01 a TC-05)](#módulo-0-autenticación-seguridad-y-rbac)
2. [Módulo 1: Terminal de Supervisor, Escaneo QR y Movimientos (TC-06 a TC-16)](#módulo-1-terminal-de-supervisor-escaneo-qr-y-movimientos)
3. [Módulo 2: Tablero Andon Digital en Nave Central (TC-17 a TC-22)](#módulo-2-tablero-andon-digital-en-nave-central)
4. [Módulo 3: Almacenes Físicos, Sombreros, Hormas e Inventario (TC-23 a TC-33)](#módulo-3-almacenes-físicos-sombreros-hormas-e-inventario)
5. [Módulo 4: Padrón de Operadores y Destajo (TC-34 a TC-38)](#módulo-4-padrón-de-operadores-y-destajo)
6. [Módulo 5: Analítica & KPIs de Planta (TC-39 a TC-46)](#módulo-5-analítica--kpis-de-planta)
7. [Módulo 6: Configuración de Planta, Rutas y CONTPAQi ERP (TC-47 a TC-54)](#módulo-6-configuración-de-planta-rutas-y-contpaqi-erp)
8. [Módulo 7: Generación de Tarjetas, Pedidos, Compras y Offline (TC-55 a TC-60)](#módulo-7-generación-de-tarjetas-pedidos-compras-y-offline)

---

## Módulo 0: Autenticación, Seguridad y RBAC

### TC-SEC-01: Selección de Perfil y Persistencia de Sesión
* **HU Vinculada:** `US-01`
* **Tipo:** Funcional / Seguridad.
* **Objetivo:** Verificar que el usuario pueda firmarse desde el selector visual y que la sesión persista al recargar la página.
* **Precondiciones:** No existe sesión activa en `localStorage`.
* **Pasos:**
  1. Ingresar a la URL del sistema.
  2. Hacer clic sobre la tarjeta de `Edmundo González (👑 Administrador)`.
  3. Recargar el navegador con `F5`.
* **Resultado Esperado:** 
  * Se abre la aplicación con el rol de Administrador activo.
  * Al recargar, la sesión se mantiene intacta en Edmundo sin solicitar login nuevamente.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-SEC-02: Ocultamiento Estricto de Módulos para Supervisor (RBAC)
* **HU Vinculada:** `US-02`
* **Tipo:** Seguridad / UI.
* **Objetivo:** Garantizar que un supervisor no vea ni tenga acceso a módulos administrativos o de analítica.
* **Precondiciones:** Sesión activa como `Juan Manuel Pérez` (Supervisor).
* **Pasos:**
  1. Observar la barra lateral de navegación.
  2. Intentar buscar o pulsar botones de `Analítica & KPIs`, `Configuración`, `Almacenes` u `Operadores`.
  3. Ejecutar en consola o inspeccionar el DOM buscando candados disuasorios (`🔒`).
* **Resultado Esperado:** 
  * En la barra lateral únicamente se muestran: `Tablero Andon` y `Terminal de Supervisor`.
  * Los módulos restringidos no se muestran en pantalla (tienen `display: none`). No existen candados visibles.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-SEC-03: Modificación Dinámica de Permisos Modulares
* **HU Vinculada:** `US-03`
* **Tipo:** Funcional / Configuración.
* **Objetivo:** Comprobar que el Administrador pueda habilitar o remover un módulo específico para cualquier usuario.
* **Precondiciones:** Sesión activa como `Edmundo González` (Admin).
* **Pasos:**
  1. Ir a `Configuración` ➔ `Usuarios RBAC`.
  2. En la fila de `Juan Manuel Pérez`, pulsar `Editar Permisos`.
  3. Marcar la casilla `Almacenes & Hormas` y guardar cambios.
  4. Cambiar de usuario a `Juan Manuel Pérez`.
* **Resultado Esperado:** 
  * La barra lateral de Juan Manuel ahora incluye el botón `Almacenes & Hormas` de forma inmediata.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-SEC-04: Cierre de Sesión Seguro (Logout)
* **HU Vinculada:** `US-04`
* **Tipo:** Seguridad / Funcional.
* **Objetivo:** Verificar que el botón de logout purgue la sesión activa.
* **Precondiciones:** Sesión activa con cualquier usuario.
* **Pasos:**
  1. Hacer clic en el avatar del usuario en el encabezado o en el botón `Cerrar Sesión`.
* **Resultado Esperado:** 
  * La sesión activa se elimina de memoria.
  * La interfaz regresa a la pantalla de selección de usuario (Login RBAC).
* **Estatus:** `[✅ Pasa - v2.18.0]`

---

## Módulo 1: Terminal de Supervisor, Escaneo QR y Movimientos

### TC-TERM-05: Activación de Cámara y Lectura de Código QR
* **HU Vinculada:** `US-05`
* **Tipo:** Hardware / Táctil.
* **Objetivo:** Validar que el botón de escaneo active la cámara web/tablet y decodifique una tarjeta viajera.
* **Precondiciones:** Dispositivo con cámara web conectada y permisos de navegador concedidos.
* **Pasos:**
  1. Ingresar como `Juan Manuel Pérez` a la `Terminal de Supervisor`.
  2. Hacer clic en el botón táctil `📷 Abrir Lector QR en Vivo`.
  3. Presentar ante la cámara una tarjeta física con QR del Lote `49,633-3`.
* **Resultado Esperado:** 
  * Se abre el visor con retícula visual industrial en pantalla completa.
  * Al detectar el QR, se reproduce feedback visual y se extraen los datos: Lote `49,633`, Sublote `3`, Modelo `El Viejonón`, Talla `55`, Falda `9.0 cm`.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-TERM-06: Verificación Previa Obligatoria de Tarjeta Física
* **HU Vinculada:** `US-06`
* **Tipo:** Regla de Negocio / Calidad.
* **Objetivo:** Impedir el movimiento de producto sin cotejo visual previo de la mica protectora de piso.
* **Precondiciones:** QR escaneado con éxito.
* **Pasos:**
  1. Observar el modal de verificación previa que aparece tras el escaneo.
  2. Comparar el encabezado `TARJETA HIDRÁULICAS - ADORNO` y sticker `JORGE` contra la pantalla.
  3. Probar el botón `Tarjeta Incorrecta / Re-escanear`.
  4. En un segundo intento, pulsar `Confirmar y Proceder`.
* **Resultado Esperado:** 
  * Al pulsar "Tarjeta Incorrecta", el movimiento se aborta sin registrar cambios.
  * Al pulsar "Confirmar y Proceder", se desbloquea la pantalla de transferencia del lote.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-TERM-07: Asignación de Operador y Cálculo de Destajo
* **HU Vinculada:** `US-08`, `US-27`
* **Tipo:** Funcional / Mano de Obra.
* **Objetivo:** Registrar qué operador físico procesó la torre de sombreros.
* **Precondiciones:** Lote verificado en estación D-06 (Ribeteado).
* **Pasos:**
  1. En el selector táctil de operadores, pulsar sobre `Jorge Mendoza`.
  2. Pulsar `Completar Estación y Transferir`.
  3. Abrir el `Padrón de Operadores` desde el usuario Administrador.
* **Resultado Esperado:** 
  * El historial del lote registra que `Jorge Mendoza` procesó las 15 piezas.
  * En el Padrón de Operadores, el contador de Jorge se incrementa en +15 piezas el día de hoy.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-TERM-08: Fraccionamiento de Lote Madre (60 a 15 pzas) en Rampa D-05
* **HU Vinculada:** `US-09`
* **Tipo:** Regla de Negocio Crítica.
* **Objetivo:** Comprobar que un Lote Madre de 60 piezas solo pueda fraccionarse en la Rampa de Ensamble (D-05).
* **Precondiciones:** Lote Madre `49,633` (60 pzas) ubicado en D-05.
* **Pasos:**
  1. Escanear el Lote Madre `49,633` en D-05.
  2. Verificar la aparición del botón destacado `✂️ Fraccionar Lote Madre en 4 Sublotes`.
  3. Pulsar el botón y confirmar el modal.
* **Resultado Esperado:** 
  * El Lote Madre de 60 piezas se marca como fraccionado.
  * El sistema genera 4 registros hijos: `49,633-1`, `49,633-2`, `49,633-3` y `49,633-4`, cada uno con 15 piezas.
  * En la tarjeta de cada sublote el recuadro inferior derecho muestra su número (`1`, `2`, `3`, `4`).
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-TERM-09: Restricción Departamental para Supervisores
* **HU Vinculada:** `US-10`
* **Tipo:** Seguridad / Control Operativo.
* **Objetivo:** Evitar que un supervisor firme avances de departamentos que no le corresponden.
* **Precondiciones:** Sesión activa como `Juan Manuel Pérez` (asignado únicamente a Depts 05-08).
* **Pasos:**
  1. Intentar transferir un lote ubicado en Prensas de Vapor (`D-03`, tramo de Roberto Méndez).
* **Resultado Esperado:** 
  * El sistema muestra una alerta in-app: *"Estación fuera de tu asignación departamental. Esta estación pertenece a Roberto Méndez."*
  * El lote no cambia de estatus ni de ubicación.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-TERM-10: Rastreo en Línea de Tiempo (Value Stream Map)
* **HU Vinculada:** `US-12`
* **Tipo:** Visual / Trazabilidad.
* **Objetivo:** Verificar la precisión de la línea de tiempo interactiva de avance del lote.
* **Precondiciones:** Lote `49,386` en proceso en D-08 (Toquillas).
* **Pasos:**
  1. Ir a `Terminal` ➔ sub-pestaña `Mapa de Proceso & Rastreador de Lote`.
  2. Buscar el lote `49,386`.
* **Resultado Esperado:** 
  * Estaciones D-01 a D-07 aparecen marcadas en verde con palomita (✅).
  * Estación D-08 aparece resaltada con badge pulsante: `📍 AQUÍ ESTÁ EL LOTE`.
  * Estaciones D-09 a D-14 aparecen como paradas pendientes.
* **Estatus:** `[✅ Pasa - v2.18.0]`

---

## Módulo 2: Tablero Andon Digital en Nave Central

### TC-AND-11: Actualización de Semáforos por Capacidad Buffer WIP
* **HU Vinculada:** `US-13`
* **Tipo:** Visual / Alerta Industrial.
* **Objetivo:** Validar el cambio cromático de las estaciones según la saturación de piezas.
* **Precondiciones:** Pantalla del Tablero Andon abierta.
* **Pasos:**
  1. Simular la transferencia de 5 sublotes a la estación D-05 (Rampa), acumulando más de 70 piezas.
  2. Observar el semáforo de D-05 en el Andon.
* **Resultado Esperado:** 
  * El semáforo de la estación cambia de verde a rojo parpadeante con el texto `⚠️ SATURACIÓN WIP (>70 pzas)`.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-AND-12: Comparativa de Producción Hora por Hora
* **HU Vinculada:** `US-16`
* **Tipo:** Funcional / Reporteo.
* **Objetivo:** Cotejar que las piezas registradas en el turno se agrupen en su bloque horario correspondiente.
* **Precondiciones:** Horario de turno: 07:00 a 15:30.
* **Pasos:**
  1. Procesar un lote a las 09:15 AM.
  2. Consultar la tabla `Producción Hora por Hora` en el Andon.
* **Resultado Esperado:** 
  * El bloque `09:00 - 10:00` incrementa su conteo real y calcula la diferencia contra la meta horaria (~106 pzas).
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-AND-13: Modo Pantalla Completa para Smart TV (50 pulgadas)
* **HU Vinculada:** `US-13`, `US-15`
* **Tipo:** Ergonomía / Hardware.
* **Objetivo:** Maximizar la visibilidad del tablero para ser proyectado en nave industrial.
* **Pasos:**
  1. En el Tablero Andon, pulsar el botón `🖥️ Modo Pantalla Completa`.
* **Resultado Esperado:** 
  * Se oculta la barra lateral y los márgenes; la cuadrícula de estaciones y velocímetros ocupa el 100% del viewport con tipografía de alto contraste legible a 20 metros.
* **Estatus:** `[✅ Pasa - v2.18.0]`

---

## Módulo 3: Almacenes Físicos, Sombreros, Hormas e Inventario

### TC-INV-14: Filtrado Multi-Criterio en Catálogo de Sombreros
* **HU Vinculada:** `US-18`
* **Tipo:** UI / Rendimiento.
* **Objetivo:** Probar el buscador reactivo de sombreros por texto, material y estatus.
* **Precondiciones:** Sub-pestaña `Catálogo de Sombreros` en `Almacenes & Hormas`.
* **Pasos:**
  1. Escribir `"Denver"` en la barra de búsqueda `#hatSearchInput`.
  2. Verificar que solo aparezca el sombrero `SOM-01 Denver Master`.
  3. Pulsar el botón `Limpiar Filtros`.
* **Resultado Esperado:** 
  * La tabla filtra en tiempo real en menos de 50ms.
  * El contador actualiza: *"Mostrando 1 de 6 sombreros"*.
  * Al pulsar limpiar, se restauran los 6 modelos.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-INV-15: Apertura y Contenido de Ficha Técnica de Sombrero
* **HU Vinculada:** `US-19`
* **Tipo:** Visual / Ficha Técnica.
* **Objetivo:** Validar que la ficha técnica contenga todos los metadatos de fabricación.
* **Pasos:**
  1. En la fila de `SOM-02 El Viejonón`, pulsar el botón `Ficha`.
* **Resultado Esperado:** 
  * Se abre el modal `#modalHatTechnicalSheet` sin errores de consola.
  * Muestra: Fotografía del modelo, materiales (1000X Master Telar), dimensiones de copa (11.5 cm) y falda (9.5 cm), horma requerida (`#55 VIEJONON`) y pastillas de tallas (54 a 60).
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-INV-16: Alta de Sombrero con Carga de Foto Drag & Drop
* **HU Vinculada:** `US-20`
* **Tipo:** Funcional / Manejo de Archivos.
* **Objetivo:** Registrar un sombrero arrastrando una imagen y guardándola en Base64 offline.
* **Pasos:**
  1. Pulsar `+ Registrar Nuevo Sombrero`.
  2. Llenar código `SOM-07`, nombre `Laredo Classic`, material `Fieltro 500X`.
  3. Arrastrar un archivo PNG a la zona `#hatDropzone`.
  4. Pulsar `Guardar Sombrero`.
* **Resultado Esperado:** 
  * El dropzone muestra la vista previa inmediata de la fotografía cargada.
  * Al guardar, el nuevo sombrero aparece en la tabla con su foto vectorizada/Base64 y persiste tras recargar.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-INV-17: Ficha Técnica de Horma y Barra de Vida Útil
* **HU Vinculada:** `US-21`, `US-22`
* **Tipo:** Mantenimiento / Técnico.
* **Objetivo:** Verificar la lectura de ciclos de vida de una horma de aluminio maquinado.
* **Pasos:**
  1. Ir a la sub-pestaña `Catálogo de Hormas`.
  2. Pulsar `Ficha` en la horma `#55 EL VIEJONÓN`.
* **Resultado Esperado:** 
  * El modal `#modalMoldTechnicalSheet` despliega: aleación de aluminio (Duraluminio 6061-T6), temperatura de trabajo (175°C), presión (7.2 bar) y barra de vida útil con 31,400 ciclos (62.8% de desgaste).
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-INV-18: Alerta de Stock Mínimo en Tafiletes por Talla
* **HU Vinculada:** `US-24`
* **Tipo:** Regla de Negocio / Almacén.
* **Objetivo:** Validar que el sistema alerte desabastos en tallas críticas.
* **Pasos:**
  1. Ir a la sub-pestaña `Stock de Tafiletes por Talla`.
  2. Localizar la talla `# 60` con existencia de 18 piezas (mínimo de seguridad: 50 piezas).
* **Resultado Esperado:** 
  * La fila de la talla #60 muestra una pastilla roja pulsante: `⚠️ STOCK CRÍTICO (18 pzas)`.
* **Estatus:** `[✅ Pasa - v2.18.0]`

---

## Módulo 4: Padrón de Operadores y Destajo

### TC-OPE-19: Visualización de Mano de Obra y Máquina Asignada
* **HU Vinculada:** `US-26`
* **Tipo:** Directorio / UI.
* **Objetivo:** Consultar la plantilla de operarios en piso sin acceso administrativo.
* **Pasos:**
  1. Navegar al módulo `Padrón de Operadores`.
* **Resultado Esperado:** 
  * Se despliega la tabla con avatar del operario, número de nómina (`OP-104`), nombre (`Jorge Mendoza`), departamento asignado (`D-03 Prensas`), máquina (`Prensa Michelagnoli 02`) y piezas hoy (`180 pzas`).
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-OPE-20: Alta de Nuevo Operador con Validación de Nómina
* **HU Vinculada:** `US-28`
* **Tipo:** Validación de Datos.
* **Objetivo:** Impedir el registro de dos operadores con el mismo número de nómina.
* **Pasos:**
  1. Pulsar `+ Registrar Operador`.
  2. Intentar ingresar la nómina `OP-104` (ya existente).
* **Resultado Esperado:** 
  * El sistema rechaza el formulario e indica que el número de nómina ya está asignado a Jorge Mendoza.
* **Estatus:** `[✅ Pasa - v2.18.0]`

---

## Módulo 5: Analítica & KPIs de Planta

### TC-ANA-21: Cálculo Desagregado de OEE Global
* **HU Vinculada:** `US-29`
* **Tipo:** Matemático / Lean Manufacturing.
* **Objetivo:** Comprobar la fórmula OEE = Disponibilidad × Rendimiento × Calidad.
* **Precondiciones:** Datos de planta cargados.
* **Pasos:**
  1. Ir a `Analítica & KPIs de Planta` ➔ `OEE & Eficiencia`.
  2. Cotejar los valores: Disponibilidad (91.2%), Rendimiento (88.7%), Calidad (98.2%).
* **Resultado Esperado:** 
  * El OEE total resultante es `79.4%` (0.912 × 0.887 × 0.982 = 0.794), clasificado en semáforo amarillo (Aceptable industrial).
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-ANA-22: Valorización Financiera de Producción en Vivo
* **HU Vinculada:** `US-30`
* **Tipo:** Financiero / Dirección.
* **Objetivo:** Validar la multiplicación de piezas en proceso por el valor de catálogo ($1,310 MXN).
* **Pasos:**
  1. Ir a la sub-pestaña `Resumen Financiero & Valorización`.
* **Resultado Esperado:** 
  * Se visualiza la tarjeta de valor total `$801,720 MXN`, desglose del 72% para pedidos B2B, valor recuperable en segundas ($17,030 MXN) y costo por merma ($18,340 MXN).
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-ANA-23: Bitácora de Paros SMED e Historial de Tiempos Muertos
* **HU Vinculada:** `US-33`
* **Tipo:** Mantenimiento / Mejora Continua.
* **Objetivo:** Verificar el registro histórico de paros de máquina y causas raíz.
* **Pasos:**
  1. Ir a la sub-pestaña `Bitácora de Paros & SMED`.
* **Resultado Esperado:** 
  * Se despliega la tabla con los 4 eventos registrados: Cambio de Horma #54 a #55 en Prensa 02 (28 min), Caída de Presión en Caldera Principal (18 min), Ajuste de Cuchilla Troqueladora (12 min) y Desabasto de Hilo Ribete (15 min).
* **Estatus:** `[✅ Pasa - v2.18.0]`

---

## Módulo 6: Configuración de Planta, Rutas y CONTPAQi ERP

### TC-CFG-24: Reordenamiento de Rutas por Modelo con Drag & Drop
* **HU Vinculada:** `US-36`
* **Tipo:** Interacción Táctil / Secuencia.
* **Objetivo:** Validar que arrastrar un departamento altere la secuencia del modelo sin afectar el catálogo maestro.
* **Pasos:**
  1. Ir a `Configuración` ➔ `Rutas & Secuencias por Modelo`.
  2. Seleccionar el modelo `El Viejonón`.
  3. Arrastrar el asa `⠿` del paso D-04 y colocarlo después del paso D-05.
* **Resultado Esperado:** 
  * La secuencia visual se actualiza de inmediato.
  * El nuevo orden se guarda en `localStorage` y define la ruta de los lotes de ese modelo.
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-CFG-25: Prueba de Conexión ODBC con CONTPAQi ERP (COMPAC)
* **HU Vinculada:** `US-39`
* **Tipo:** Integración / Conectividad.
* **Objetivo:** Ejecutar la prueba de handshake ODBC con el servidor de CONTPAQi.
* **Pasos:**
  1. Ir a `Configuración` ➔ sub-pestaña `Integración COMPAC`.
  2. Pulsar el botón `🔌 Probar Conexión con CONTPAQi ERP`.
* **Resultado Esperado:** 
  * El botón muestra estado de carga (`Verificando DSN ODBC...`).
  * Se emite una notificación toast exitosa confirmando enlace con la base de datos `COMPAC_TOMBSTONE_PROD` (latencia <15ms).
* **Estatus:** `[✅ Pasa - v2.18.0]`

### TC-CFG-26: Emisión de Vale de Entrega / Camioneta B2B
* **HU Vinculada:** `US-40`
* **Tipo:** Logística / Salida de Planta.
* **Objetivo:** Generar el vale digital de salida descontando la orden de producción.
* **Pasos:**
  1. En `Integración COMPAC`, seleccionar Lote `49,842` (60 pzas terminadas).
  2. Ingresar chofer `Ramiro Vega` y placas `GT-4821-B`.
  3. Pulsar `Emitir Vale de Camioneta`.
* **Resultado Esperado:** 
  * Se genera el folio `VALE-2026-0842` con 58 piezas de primera y 2 mermas.
  * El lote pasa a estatus `Entregado a Embarques`.
* **Estatus:** `[✅ Pasa - v2.18.0]`

---

## Módulo 7: Generación de Tarjetas, Pedidos, Compras y Offline

### TC-NEW-27: Generación e Impresión de Tarjetas Viajeras en Papel
* **HU Vinculada:** `US-41`
* **Tipo:** Salida de Impresión / Formato.
* **Objetivo:** Comprobar que la tarjeta se imprima en formato carta/media carta con QR de alta definición para colocar en mica.
* **Pasos:**
  1. Generar la tarjeta viajera de un nuevo lote.
  2. Enviar a imprimir con `Ctrl + P`.
* **Resultado Esperado:** 
  * La hoja impresa contiene exactamente los mismos datos de la tarjeta física: folio, O. Prod, modelo, talla, falda, logo Tombstone y código QR nítido escaneable por la tablet.
* **Estatus:** `[🟡 Por Validar / Especificación]`

### TC-NEW-28: Captura de Pedido Mayorista y Generación de Lotes
* **HU Vinculada:** `US-42`
* **Tipo:** Planeación / Entrada de Órdenes.
* **Objetivo:** Crear una orden de 180 sombreros y verificar que el sistema genere automáticamente 3 Lotes Madre de 60 piezas.
* **Pasos:**
  1. Registrar pedido de cliente: 180 sombreros Denver Master.
* **Resultado Esperado:** 
  * El sistema desglosa la orden en Lote 1 (60 pzas), Lote 2 (60 pzas) y Lote 3 (60 pzas) listos para liberar en Almacén D-01.
* **Estatus:** `[🟡 Por Validar / Especificación]`

### TC-NEW-29: Operación en Modo Sin Conexión (Offline Cache)
* **HU Vinculada:** `US-44`
* **Tipo:** Resiliencia de Red / PWA.
* **Objetivo:** Garantizar que los escaneos no se pierdan si se apaga el Wi-Fi de la nave.
* **Pasos:**
  1. Desconectar la tablet de internet (Modo Avión).
  2. Escanear un lote y registrar un traspaso.
  3. Reconectar el Wi-Fi.
* **Resultado Esperado:** 
  * La aplicación permite escanear y guarda el movimiento en cola local con una pastilla `En espera de sincronización`.
  * Al recuperar la red, se sincroniza automáticamente con el servidor sin duplicar registros.
* **Estatus:** `[🟡 Por Validar / Especificación]`

### TC-NEW-30: Auditoría Semanal de Segundas y Merma de Viernes
* **HU Vinculada:** `US-45`
* **Tipo:** Control de Calidad / Recuperación.
* **Objetivo:** Auditar 25 sombreros con defecto y reclasificarlos para remate.
* **Pasos:**
  1. Abrir la pantalla de `Auditoría de Segundas`.
  2. Seleccionar 15 sombreros como `Segunda de Fábrica (Venta Remate)` y 10 como `Merma Irrecuperable`.
* **Resultado Esperado:** 
  * Las 15 piezas de segunda se valorizan a precio de remate ($450 MXN) y las 10 de merma se descuentan como costo de desperdicio.
* **Estatus:** `[🟡 Por Validar / Especificación]`

---

## 📊 Matriz de Cobertura y Resumen de Casos de Prueba

| Módulo del Sistema | Casos de Prueba Listos (`v2.18.0`) | Casos de Prueba Propuestos | Total Casos de Prueba |
|---|:---:|:---:|:---:|
| **0. Seguridad y RBAC** | **4** (TC-01 a TC-04) | 0 | 4 |
| **1. Terminal y Escaneo QR** | **6** (TC-05 a TC-10) | 0 | 6 |
| **2. Tablero Andon** | **3** (TC-11 a TC-13) | 0 | 3 |
| **3. Almacenes, Sombreros y Hormas** | **5** (TC-14 a TC-18) | 0 | 5 |
| **4. Padrón de Operadores** | **2** (TC-19 a TC-20) | 0 | 2 |
| **5. Analítica & KPIs de Planta** | **3** (TC-21 a TC-23) | 0 | 3 |
| **6. Configuración y COMPAC** | **3** (TC-24 a TC-26) | 0 | 3 |
| **7. Tarjetas, Pedidos y Offline** | 0 | **4** (TC-27 a TC-30) | 4 |
| **TOTAL GENERAL** | **26 Casos de Prueba Automatizables / Manuales** | **4 Casos Propuestos** | **30 Casos de Prueba** |
