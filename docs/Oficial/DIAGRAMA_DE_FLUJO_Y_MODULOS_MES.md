# Diagrama de Flujo del Sistema & Catálogo de Módulos (MVP)
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Documento Oficial de Procesos Físicos de Fábrica, Interacción Digital del Software y Catálogo de Módulos.*

> **Versión:** `v2.55.0`  
> **Fecha:** 9 de Octubre de 2026  
> **Estado:** Documento Oficial de Especificación de Procesos y Software  
> **Cliente:** Tombstone Hats (Edmundo González / Ing. Carlos Ortiz)  
> **Proveedor / Arquitectura:** Uanify (Andrés Villanueva)

---

## 1. Alcance General: Operación de Fábrica vs. Funcionalidades del Software MES

Para garantizar total claridad entre el mundo físico de la nave industrial y el sistema digital, este documento desglosa explícitamente:
1. **La Operación Física de la Fábrica:** Qué hacen los operadores, mecánicos, recolectores y supervisores en piso con las máquinas, hormas, carritos y materiales.
2. **Las Funcionalidades del Software MES:** Qué ejecuta el sistema en cada pantalla, qué botones o modales existen, qué cálculos matemáticos realiza, cómo gestiona la base de datos y cómo interactúa con CONTPAQi.

---

## 2. Diagrama de Flujo Integral (Fábrica + Sistema MES)

El siguiente diagrama detalla la interacción paso a paso entre la operación física en nave y las acciones del software:

```mermaid
flowchart TD
    classDef erp fill:#0F172A,stroke:#334155,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef mesSoftware fill:#1D4ED8,stroke:#3B82F6,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef plantaFisica fill:#334155,stroke:#64748B,stroke-width:2px,color:#FFFFFF;
    classDef calidad fill:#B45309,stroke:#F59E0B,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef rampa fill:#4C1D95,stroke:#8B5CF6,stroke-width:2px,color:#FFFFFF,font-weight:bold;

    %% FASE 1: INGESTA Y PROGRAMACIÓN
    subgraph FASE1 ["FASE 1: Planificación, Loteo e Impresión"]
        ERP_SQL[("CONTPAQi Comercial SQL\nPedidos y Lista Materiales")]:::erp
        MES_ING["[MES] Módulo Ingeniería\n1. Lectura SQL de Pedidos Pendientes\n2. Captura Fecha Compromiso\n3. Modal: Segmentación Manual de Lotes Madre (60) y Sublotes (15)\n4. Bloqueo de Impresión hasta segmentar"]:::mesSoftware
        MES_PRINT["[MES] Centro de Impresión QR\n1. Genera Códigos QR de Lote Madre y Sublote\n2. Exporta Plantilla PDF Carta\n3. Habilita estatus 'Activo en Piso'"]:::mesSoftware
        FIS_IMPR["[Fábrica] Operación Física\n1. Impresión láser en papel bond\n2. Recorte manual de tarjetas\n3. Inserción en micas plásticas cosidas"]:::plantaFisica

        ERP_SQL -->|Lectura de Pedidos| MES_ING
        MES_ING -->|Segmentación Confirmada| MES_PRINT
        MES_PRINT -->|PDF Listo| FIS_IMPR
    end

    %% FASE 2: PREPARACIÓN Y NACIMIENTO DE LOTE
    subgraph FASE2 ["FASE 2: Nacimiento de Lote Madre (Prensas T1)"]
        FIS_CORTE["[Fábrica] Corte y Preparación\nCopa y Falda por separado (sin lote)"]:::plantaFisica
        C1{"[Calidad C1]\nRevisión de Cuadros"}:::calidad
        FIS_PRENSAS["[Fábrica] D-02 Prensas Calientes\nUnión de Copa y Falda con Horma montada"]:::plantaFisica
        MES_T1["[MES] Terminal T1 Prensas\n1. Registro de Horma montada en Prensa #X\n2. Escaneo QR de Tarjeta Madre (60 pzas)\n3. Captura de Paro de Máquina si ocurre falla\n4. Confirmación de salida a Almacén Intermedio"]:::mesSoftware

        FIS_IMPR --> FIS_CORTE
        FIS_CORTE --> C1
        C1 -->|Aprobado| FIS_PRENSAS
        C1 -.->|Defecto| RECH_C1["[Fábrica] Descarte de Lienzo\n(Cálculo Merma Material)"]:::plantaFisica
        FIS_PRENSAS <--> MES_T1
    end

    %% FASE 3: PRIMER TRAMO HASTA RAMPA
    subgraph FASE3 ["FASE 3: Tramo Lote Madre (60 pzas)"]
        FIS_TRAMO1["[Fábrica] Flujo de Lote Madre\n1. D-05 Alambrado\n2. D-03 Endopado\n3. D-06 Refuerzo Pintura\n4. D-07 Replanchado"]:::plantaFisica
        MES_ESC_T2_T3["[MES] Terminales T2 y T3\n1. Escaneo QR de Lote Madre al salir\n2. Registro de Mermas/Segundas con causa raíz\n3. Filtro C2 (Aprobar o Reenviar a Refuerzo)"]:::mesSoftware

        MES_T1 --> FIS_TRAMO1
        FIS_TRAMO1 <--> MES_ESC_T2_T3
    end

    %% FASE 4: FRACCIONAMIENTO EN RAMPA
    subgraph FASE4 ["FASE 4: Fraccionamiento en Rampa (D-05 Almacén Intermedio)"]
        FIS_RAMPA["[Fábrica] Mesa de Rampa\n1. Se divide la torre de 60 pzas en 4 carritos de 15 pzas\n2. Se archiva físicamente la Tarjeta Madre\n3. Se colocan las 4 Tarjetas de Sublote en cada carrito"]:::rampa
        MES_RAMPA["[MES] Modo Rampa en Terminal T4\n1. Escaneo de Tarjeta Madre\n2. Software desactiva Tarjeta Madre\n3. Software activa los 4 Sublotes (15 pzas cada uno)\n4. Habilita trazabilidad individual por sublote"]:::mesSoftware

        FIS_TRAMO1 --> FIS_RAMPA
        FIS_RAMPA <--> MES_RAMPA
    end

    %% FASE 5: TRAMO SUBLOTES HASTA ADORNO
    subgraph FASE5 ["FASE 5: Tramo Sublotes (15 pzas) y Subensambles"]
        FIS_TRAMO2["[Fábrica] Hidráulicas y Refaldeo\nProcesamiento ágil en carritos de 15 pzas"]:::plantaFisica
        MES_C4["[MES] Filtro C4 Calidad Hidráulicas\n1. Aprobación de Sublote\n2. Reenvío a Hidráulicas si hay defecto"]:::calidad
        MES_T5_BUF["[MES] T5 Subensambles (Tafiletes y Toquillas)\n1. Conteo de piezas concluidas\n2. Semáforo Verde/Ámbar/Rojo en Adorno si hay stock suficiente"]:::mesSoftware
        FIS_ADORNO["[Fábrica] D-10 Adorno\nColocación de Tafilete, Toquilla, Herraje y Parche"]:::plantaFisica
        MES_T6_FICHA["[MES] Terminal T6 Adorno\n1. Visor de Ficha Técnica Multiperspectiva con Fotos Oficiales\n2. Escaneo de Sublote terminado\n3. Registro de Operador por nómina para destajo"]:::mesSoftware

        MES_RAMPA --> FIS_TRAMO2
        FIS_TRAMO2 --> MES_C4
        MES_C4 --> FIS_ADORNO
        MES_T5_BUF -.->|Disponibilidad| MES_T6_FICHA
        FIS_ADORNO <--> MES_T6_FICHA
    end

    %% FASE 6: CALIDAD FINAL, EMBARQUE Y RETORNO ERP
    subgraph FASE6 ["FASE 6: Inspección Final, Despacho y Cierre Administrativo"]
        C5{"[Calidad C5]\nInspección Final"}:::calidad
        MES_C5["[MES] Terminal Calidad Final\n1. Aprobar Lote o Dictaminar No Conformidad\n2. Si Rechaza: Redirigir a Adorno / Pintura\n3. Si Segundas: Registro de causa raíz y envío a almacén de remate"]:::mesSoftware
        FIS_EMB["[Fábrica] D-11 Embarque\n1. Reagrupación de sublotes en caja de 60 pzas\n2. Embalaje y carga a transporte"]:::plantaFisica
        MES_LIB["[MES] Despacho y Vale de Salida\n1. Generación de Vale de Salida Digital con QR\n2. Liquidación de Orden de Producción\n3. Cálculo automático de Destajo Semanal"]:::mesSoftware
        ERP_OUT[("CONTPAQi Comercial SQL\n1. Entrada de PT con Folio MES en Observaciones\n2. Descarga de Materia Prima según BOM")]:::erp

        FIS_ADORNO --> C5
        C5 <--> MES_C5
        MES_C5 -->|Aprobado| FIS_EMB
        FIS_EMB <--> MES_LIB
        MES_LIB -->|Escritura SQL ($0 Costo)| ERP_OUT
    end
```

---

## 3. Matriz Comparativa: Operación de Fábrica vs. Funcionalidades del Sistema MES

La siguiente tabla define de forma inequívoca la responsabilidad física en la fábrica frente a la función que ejecuta el software en cada etapa:

| Etapa | Operación en la Fábrica (Físico) | Funcionalidad del Sistema MES (Software) | Actor Responsable |
| :--- | :--- | :--- | :--- |
| **1. Ingesta de Pedidos** | Ventas y Dirección registran los pedidos en CONTPAQi Comercial en oficina. | **Conexión SQL Server ($0 USD):** Consulta vistas de pedidos autorizados y materias primas sin licencias SDK. | Sistema / Ingeniero Admin |
| **2. Programación de Orden** | Ingeniería define la prioridad de fabricación de la semana en la nave. | **Gestión de Fechas y Semáforos:** Registra la Fecha Compromiso; calcula días restantes y proyecta semáforo de entrega. | Ingeniero Admin |
| **3. Partición de Lotes (Loteo)** | Se determina cuántas piezas correrán por torre (base 60) y carritos (15 pzas). | **Segmentación Manual & Validación Matemática:** Modal interactivo para configurar tamaño de lote madre y calcular submúltiplos de sublotes. Bloquea impresión si la orden está sin segmentar. | Ingeniero Admin |
| **4. Emisión de Tarjetas Viajeras** | Se imprimen las tarjetas en papel bond tamaño carta, se recortan con guillotina y se insertan en fundas plásticas cosidas. | **Generador de Tarjetas y Códigos QR:** Emite el documento de impresión en PDF estructurado con códigos QR únicos por lote madre y sublotes, modelo, horma, talla y folio. | Ingeniero Admin |
| **5. Montaje de Hormas en Prensas** | Los operadores de prensas montan la horma de aluminio fundido en la máquina asignada (prensa 1 a 19). | **Matriz de Asignación Horma ↔ Máquina:** Registra qué modelo/horma está operando en qué prensa para validar compatibilidad con el lote. | Supervisor de Prensas |
| **6. Paros de Máquina** | Una prensa se detiene por falla mecánica, falta de vapor o cambio de molde; el operador avisa al mecánico. | **Bitácora Táctil de Tiempos Muertos:** Botones táctiles grandes para iniciar paro indicando máquina, operador y motivo; cronómetro en vivo; registro de fin de paro y cálculo de minutos improductivos. | Supervisor de Planta |
| **7. Avance por Departamentos** | Los operadores concluyen el proceso en su máquina y apilan las piezas en el carrito del área. | **Escaneo de Salida & Depósito Intermedio:** Lector QR por cámara o escáner 2D; registra operador por nómina, fecha/hora y mueve el lote al almacén de salida. | Supervisor / Auxiliar |
| **8. Traslado entre Áreas** | El recolector de planta traslada físicamente el carrito de la salida de un área a la entrada de la siguiente. | **Monitoreo de WIP en Almacenes:** El Andon y las terminales descuentan el inventario del área anterior y aumentan el stock disponible en la estación destino. | Recolector / MES |
| **9. Fraccionamiento en Rampa (D-05)** | En la mesa de rampa se desarma la torre de 60 pzas en 4 carritos de 15 pzas. Se archiva la tarjeta madre y se colocan las de sublote. | **Módulo de Fraccionamiento Rampa:** Escaneo de la tarjeta madre de 60 pzas; el sistema desactiva el lote madre y habilita los 4 sublotes individuales con trazabilidad independiente. | Supervisor de Rampa |
| **10. Inspección de Calidad (C1-C5)** | El inspector revisa físicamente costuras, planchado, simetría y manchas en el sombrero. | **Terminal de Filtros de Calidad:** Botones exclusivos de "Aprobar" o "Rechazar"; si rechaza, despliega modal para definir Reproceso (con retorno a estación causante), Segunda o Merma con causa raíz obligatoria. | Inspector de Calidad |
| **11. Subensambles (Tafilete / Toquilla)** | Operadores preparan tafiletes cosidos y toquillas adornadas en áreas de soporte. | **Semáforo de Buffer de Ensamble:** Verifica existencias de subensambles por modelo y talla; muestra semáforo verde en Adorno cuando hay insumos para ensamblar. | Supervisor de Adorno |
| **12. Armado Final (Adorno)** | Operadores colocan tafilete, toquilla y herrajes según la muestra física autorizada. | **Visor de Ficha Técnica Multiperspectiva:** Despliega en pantalla fotos oficiales de alta resolución desde diferentes ángulos para que el operador compare la pieza física contra el estándar. | Operador / Supervisor |
| **13. Empaque y Embarque** | Se empacan los sombreros en cajas de cartón de 60 piezas, se embalan y se cargan al camión. | **Módulo de Liberación y Vale de Salida:** Cierra los 4 sublotes, genera Vale de Salida con QR para transportista y liquida la Orden en el MES. | Supervisor de Embarques |
| **14. Cálculo de Nómina a Destajo** | Se concilia el pago semanal de los operadores por piezas trabajadas el día viernes. | **Pre-Nómina Automatizada a Destajo:** Cruza piezas escaneadas por número de nómina x tarifa $/pza de cada departamento; genera reporte descargable en Excel sin recapturas. | Ingeniero / RH |
| **15. Cierre Contable CONTPAQi** | Administración consulta la factura y afecta contablemente el inventario final. | **Actualización SQL Automática:** El sistema inserta la entrada de producto terminado en CONTPAQi con el folio de lote MES en las observaciones y descarga las materias primas consumidas. | Conector SQL MES |

---

## 4. Detalle de Módulos y Funcionalidades del Software MES (MVP)

### Módulo 1: Ingeniería, Programación & Loteo
* **Ingesta SQL de Pedidos:** Lectura directa de pedidos desde CONTPAQi sin intervención manual ni duplicidad de datos.
* **Segmentación Manual de Lotes:** Control estricto para definir tamaño de lote madre (estándar 60 piezas) y cantidad de sublotes (estándar 15 piezas).
* **Bloqueo Inteligente de Impresión:** La plataforma bloquea el botón de imprimir tarjetas viajeras hasta que el usuario confirme la segmentación manual.
* **Generación de Tarjetas Viajeras en PDF:** Renderiza hojas tamaño carta con códigos QR de alta densidad, especificaciones de modelo, talla, horma y folio.

### Módulo 2: Monitoreo Andon & Tablero Ejecutivo de Planta
* **WIP por Almacén Intermedio:** Medidor de inventario en proceso en tiempo real entre estaciones.
* **Control de 5 KPIs Rectores:**
  1. *Avance Real vs. Programado por Orden*.
  2. *WIP Activo en Nave*.
  3. *Piezas de Segunda y Mermas por Estación*.
  4. *Tiempos Muertos / Paros Acumulados*.
  5. *Semáforo de Entrega vs. Fecha Compromiso*.
* **Mapa de Calor de Cuellos de Botella:** Identificación visual de estaciones saturadas.

### Módulo 3: Terminal Táctil de Piso (Tablets T1 a T6)
* **Lector QR Integrado:** Escaneo instantáneo por cámara web de tablet o pistola 2D USB/Bluetooth.
* **Registro de Depósito Rápido:** Interfaz con botones táctiles grandes (mínimo 44px de altura ergonómica).
* **Modo Rampa:** Flujo guiado para fraccionar lotes madre de 60 piezas en sublotes de 15 piezas.
* **Bitácora de Paros de Máquina:** Cronómetro táctil para registrar causa y duración de detenciones en prensas.

### Módulo 4: Filtros de Calidad y No Conformidades (C1 a C5)
* **Módulo de Dictamen Rápido:** Opciones de aprobación o rechazo en un solo toque.
* **Matriz de Reproceso Dinámico:** Capacidad de redirigir el lote a cualquier estación previa causante del error.
* **Captura de Causa Raíz:** Catálogo estandarizado de fallas (manchas, roturas, desalineado, tono) para análisis de mermas y segundas.

### Módulo 5: Subensambles y Fichas Técnicas
* **Semáforo de Suministro para Adorno:** Alerta visual sobre existencia de tafiletes y toquillas para evitar paros de línea.
* **Visor de Ficha Técnica:** Galería de imágenes multiperspectiva de modelos oficiales autorizados.

### Módulo 6: Pre-Nómina de Destajo y Reportes
* **Cálculo de Destajo por Operador:** Conteo auditado por número de nómina y tarifa $/pza.
* **Exportación Directa a Excel:** Descarga inmediata en formato `.xlsx` limpio y estructurado para el corte de los viernes.

### Módulo 7: Conector Local CONTPAQi Comercial SQL Server
* **Integración Local ($0 Costo en Licencias SDK):** Procedimientos almacenados para sincronización bidireccional entre la base de datos de piso y el ERP administrativo.
