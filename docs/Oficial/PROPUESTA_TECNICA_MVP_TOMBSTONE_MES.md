# Propuesta Técnica y Arquitectura Operativa · MES Tombstone Hats (MVP)
**Estrategia de Digitalización y Control de Manufactura · Uanify**  
*Documento de Especificación de Alcance, Procesos de Piso y Modelo Operativo.*

> **Versión Oficial:** `v2.44.0`  
> **Fecha:** 7 de Octubre de 2026  
> **Cliente:** Tombstone Hats (San Francisco del Rincón, Guanajuato)  
> **Dirección y Validación:** Edmundo González / Ing. Carlos Ortiz  
> **Líder de Proyecto:** Andrés Villanueva (Uanify)

---

## 1. Resumen Ejecutivo y Enfoque Estratégico ($0 Costo en Licenciamiento Externo)

La presente propuesta define la arquitectura, flujos operativos y alcance funcional del **Sistema MES (Manufacturing Execution System) para Tombstone Hats**, diseñado bajo el estándar industrial del Clúster Sombrerero de San Francisco del Rincón.

El sistema está enfocado en resolver las dos necesidades críticas de planta:
* **Conocer el avance real de la orden de producción vs. lo programado.**
* **Visualizar el inventario en proceso (WIP) actual por almacén intermedio** (dónde se encuentran físicamente los sombreros en tiempo real).

### Directrices Rectoras de la Estrategia (2 Opciones):
* **Opción A (Recomendada):** Sistema MES Integral con enlace nativo a Microsoft SQL Server de CONTPAQi Comercial 11, trazabilidad por códigos QR en tarjetas viajeras y monitoreo de WIP por almacén intermedio. Operado en tablets/pantallas táctiles utilizando la cámara integrada del dispositivo.
* **Opción B (Con Hardware de Escaneo):** Todo el alcance de la Opción A, complementado con kits de lectores ópticos industriales 2D (código QR) vía USB/Bluetooth en modo emulación teclado (HID) montados en estaciones clave para acelerar el escaneo continuo.

---

## 2. Ingesta de Órdenes, Creación de Lotes e Impresión de Tarjetas

* **Emisión de Tarjetas Directa en Planta:**
  El Ingeniero Admin consulta en el MES la orden proveniente de CONTPAQi Comercial. Asigna manualmente la cantidad de lotes madre (base 60 pzas) y sublotes (15 pzas) conforme a la programación. Desde la misma pantalla genera e imprime las tarjetas viajeras oficiales con sus códigos QR en hojas tamaño carta estándar de oficina para recortar e introducirlas en fundas plásticas cosidas.
* **Fraccionamiento en Rampa (D-05):**
  El supervisor recoge en Ingeniería el juego de tarjetas de sublote. En Rampa se realiza el cambio físico; la **Tarjeta Madre original se archiva en la mesa de rampa** como bitácora y control histórico.
* **Escaneo de Avance:**
  Se realiza **AL SALIR del departamento** por el usuario/supervisor que concluye el proceso al depositar en el almacén intermedio.

---

## 3. Gestión de Calidad, Piezas de Segunda y Reprocesos

* **Estructura de Calidad y Decisión:**
  El **Inspector de Calidad** valida físicamente las piezas en los filtros oficiales y registra en sistema: **Aprobar** o **Rechazar**. Ante una no conformidad, el Supervisor o Ingeniero dictamina en pantalla:
  * **Reproceso:** Selecciona manualmente en el sistema a qué estación o proceso anterior debe regresar el lote para ser corregido.
  * **Segunda:** El lote principal no se detiene; se captura la cantidad de piezas separadas y su causa raíz.
  * **Merma:** Registro de piezas descartadas definitivamente con su causa de falla.
* **Alcance de Mermas y Segundas en MVP:**
  Registro obligatorio del número de piezas y la **Causa Raíz** (ej. poro en lienzo, mancha de acabado, quemadura de vapor). Estrictamente captura y registro histórico para consulta y KPIs. No se incluye recosteo contable automático ni facturación especial en esta fase.

---

## 4. Módulo de Destajo y Bitácora de Paros Productivos

* **Pre-nómina Semanal a Destajo:**
  Cálculo automático del acumulado de piezas concluidas por operador conforme a la tarifa fija asignada ($/pza). Generación de **Pre-reporte de corte los viernes** con función obligatoria de **exportación nativa a Microsoft Excel** para conciliación administrativa.
* **Bitácora de Paros Productivos:**
  Panel táctil con botones rápidos para registro de paro operativo: Estación/Máquina, operador, hora inicio, hora fin y motivo general. Mapeo y registro histórico para análisis de disponibilidad.

---

## 5. Subensambles (Tafiletes y Toquillas) y Ficha Técnica con Fotos

* **Semáforo de Buffer en Adorno:**
  Tafiletes y Toquillas alimentan a Adorno como buffers independientes según la orden de producción. La terminal de Adorno despliega un semáforo de disponibilidad por talla y modelo para evitar cuellos de botella antes de iniciar el ensamble.
* **Ficha Técnica Visual Multiperspectiva:**
  En Adorno e Inspección Final se muestran en pantalla **varias fotografías de la muestra oficial del modelo autorizado** (diferentes ángulos de armado, detalle de toquilla, herraje, color de fieltro y doblado de falda) para confrontar físicamente el sombrero terminado contra el estándar autorizado de planta.

---

## 6. Módulo Puente CONTPAQi Comercial 11 (Arquitectura SQL Server Validada)

Tras la reunión de validación técnica con la **Ing. Lupita López (Soporte CONTPAQi)** y **Edmundo Quezada**, se definieron los lineamientos definitivos para la conexión:

```mermaid
graph TD
    subgraph MES_TOMBSTONE["Tombstone MES (Piso de Producción)"]
        VALE[Vale de Salida / Lote Concluido\nRef: Folio Lote MES]
        MP_CONS[Consumo Real de Materia Prima\nLienzo, Tafilete, Herrajes]
    end

    subgraph SQL_BRIDGE["Microservicio Puente SQL Server (Local / Red Planta)"]
        SP_IN[Stored Procedure:\nIngreso Producto Terminado]
        SP_OUT[Stored Procedure:\nDescarga de Materia Prima]
        V_CAT[Vistas SQL de Catálogos:\nFamilias PIEL001, TEL001, SAT]
    end

    subgraph CONTPAQI_DBS["CONTPAQi Comercial 11.3.1 (Microsoft SQL Server)"]
        DB_INT[(BD Empresa Interna / Fiscal)]
    end

    VALE -->|Dispara| SP_IN
    MP_CONS -->|Descarga| SP_OUT
    SP_IN --> DB_INT
    SP_OUT --> DB_INT
    V_CAT -.->|Sincroniza Códigos| MES_TOMBSTONE
```

### Acuerdos Técnicos y Ventajas Estratégicas:
* **Acceso Nativo Vía Microsoft SQL Server ($0 Costo en Licencias Adicionales):** No se utiliza el SDK de CONTPAQi. Se trabaja mediante Vistas y Procedimientos Almacenados directamente sobre el motor SQL Server sin consumir licencias concurrentes.
* **Manejo de Lotes Desacoplado:** El MES inyecta el producto terminado insertando el **Folio del Lote del MES en el campo de referencia/observaciones de la partida**.
* **Catálogo de Materiales Estructurado:** Clasificación por Familias + Consecutivo único (ej. `PIEL001` = Sintético Poring, `TEL001` = Fieltro) con trazabilidad de origen ligada al folio de factura del proveedor.

---

## 7. Perfiles de Acceso (3 Roles)

* **Ingeniero (Admin Mayor):** Acceso total. Administración de órdenes, creación y partición de lotes, impresión de tarjetas viajeras, configuración de rutas, almacenes y usuarios. *(Dirección General opera con perfil Ingeniero Admin para consulta y auditoría total).*
* **Supervisor de Planta:** Consulta de WIP de sus almacenes asignados, registro de depósito de lotes, Modo Rampa, captura de paros de máquina y resolución de reprocesos.
* **Inspector de Calidad:** Acceso exclusivo a los filtros de calidad para aprobar o rechazar lotes.

---

## 8. Infraestructura y Conectividad

* **Conectividad 100% En Línea (Sin Modo Offline):**
  El sistema requiere red Wi-Fi estable y continua en las zonas de trabajo de la nave para actualización inmediata del WIP entre almacenes.
* **Administración y Custodia de Infraestructura:**
  Uanify aloja y administra el servidor de aplicaciones en la nube, la base de datos principal y el microservicio puente SQL local.
* **Entrega Autónoma en caso de no contratar póliza:**
  Si el cliente decide prescindir de la póliza de soporte y mantenimiento al término del proyecto, se le entrega el paquete completo de instaladores, código de despliegue y scripts de base de datos local para que asuma su operación independiente sin servicios administrados de Uanify.

---

## 9. Metodología de Entrega y Cronograma (12 Semanas Totales)

| Fase | Duración | Actividades Clave |
|:---|:---:|:---|
| **Fase 1: Desarrollo e Integraciones** | 8 semanas | Construcción de módulos, vistas de almacén, terminal QR y puente SQL CONTPAQi. |
| **Fase 2: Pruebas UAT en Planta** | 1 semana | Despliegue en piso, pruebas con usuarios reales y validación de tarjetas viajeras. |
| **Fase 3: Refinamiento y Ajustes** | 2 semanas | Ajustes de ergonomía táctil, afinación de vistas y validación de descargas SQL. |
| **Fase 4: Pruebas Finales y Go-Live** | 1 semana | Puesta en marcha oficial en nave industrial y arranque productivo. |
| **TOTAL** | **12 semanas** | **Entrega formal del sistema en piso.** |

> **Garantía Post-Arranque:** **5 semanas de soporte correctivo directo** incluidas a partir del Go-Live formal en nave industrial.

---

## 10. Modelo Comercial e Inversión Estimada

### 10.1 Inversión en Desarrollo de Software (12 Semanas de Proyecto):
* **Rango de Inversión del MVP:** **[Pendiente de definir tras análisis del diagrama de flujo y catálogo de módulos]**

### 10.2 Hardware de Piso e Insumos (Estimación para 6 Estaciones de Nave):
Se presenta la estimación de adquisición de equipos comerciales de uso rudo para las 6 estaciones oficiales:

| Concepto de Hardware | Especificación Técnica | Cantidad | Costo Unitario Estimado | Inversión Total Estimada |
|:---|:---|:---:|:---:|:---:|
| **Tablets de Planta (Android)** | Pantalla 11", 128GB ROM, Wi-Fi 5GHz (Samsung Galaxy Tab A9+ o Lenovo M11) | 6 pzas | $4,200 – $4,800 MXN | **$25,200 – $28,800 MXN** |
| **Fundas de Uso Rudo con Correa** | Carcasa antichoque tricapa con soporte giratorio 360° para piso industrial | 6 pzas | $650 – $850 MXN | **$3,900 – $5,100 MXN** |
| **Soportes Articulados de Mesa** | Brazo metálico de sujeción fija para mesas de Rampa, Adorno y Prensas | 6 pzas | $750 – $950 MXN | **$4,500 – $5,700 MXN** |
| **Subtotal Hardware Base (Opción A):** | *Operación mediante cámara integrada de alta resolución* | — | — | **$33,600 – $39,600 MXN + IVA** |
| **Lectores Ópticos 2D (Solo Opción B)** | Escáner industrial 2D/QR alámbrico/inalámbrico USB emulación teclado (HID) | 6 pzas | $1,800 – $2,500 MXN | **$10,800 – $15,000 MXN** |
| **Total Hardware Completo (Opción B):** | *Kits de Tablets + Soportes + Escáneres Ópticos 2D* | — | — | **$44,400 – $54,600 MXN + IVA** |

*Nota: Los equipos pueden ser adquiridos directamente por Tombstone Hats bajo la ficha técnica recomendada o provistos por Uanify sin sobreprecio de gestión.*

### 10.3 Póliza Opcional de Mantenimiento y Soporte Continuo (Post-Garantía):
Al concluir las **5 semanas de garantía post-arranque**, se ofrece una póliza de servicio mensual opcional para garantizar la continuidad operativa:
* **Rango de Inversión Mensual:** **$4,500 – $7,500 MXN + IVA / mes**
* **Servicios Administrados Incluidos:**
  * Respaldos diarios automáticos y cifrados de la base de datos en nube.
  * Supervisión y monitoreo de disponibilidad del servidor y red local.
  * Mantenimiento preventivo y afinación de consultas SQL al microservicio de CONTPAQi Comercial.
  * Soporte técnico correctivo ante incidencias y dudas operativas de supervisores.
  * Actualizaciones menores de seguridad y ajustes de flujo en terminales de piso.

---

## 11. Supuestos y Exclusiones del MVP

### Supuestos Obligatorios:
* Red local Wi-Fi con cobertura estable y continua en los puntos de almacén y calidad de la nave.
* Servidor de CONTPAQi Comercial accesible en red local con credenciales a Microsoft SQL Server.
* Impresora láser de oficina funcional para impresión de tarjetas en papel carta estándar.

### Exclusiones Explícitas del Alcance:
* **Modo Offline:** No se contempla almacenamiento en desconexión.
* **Algoritmos automáticos de optimización de corte o loteo:** La partición la define el usuario.
* **Kárdex contable valorizado:** Se entrega bitácora física de movimientos por lote; la contabilidad de costos permanece en CONTPAQi.
* **Pantallas Smart TV / Andon en vigas:** La visualización se concentra en tablets y PCs.
* **Sensores IoT / Telemetría física en prensas:** El registro de paros es por captura manual táctil.
