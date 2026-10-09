# Diagrama de Flujo del Sistema & Catálogo de Módulos (MVP)
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Documento Ejecutivo para Cliente y Planta: Cómo Funciona el Sistema MES y su Empate con la Producción Real.*

> **Versión:** `v2.58.0`  
> **Fecha:** 9 de Octubre de 2026  
> **Estado:** Documento Oficial de Especificación de Procesos y Software  
> **Cliente:** Tombstone Hats (Edmundo González / Ing. Carlos Ortiz)  
> **Proveedor / Arquitectura:** Uanify (Andrés Villanueva)

---

## 1. Resumen Ejecutivo: ¿Qué hace el Sistema MES en la Fábrica?

El **Tombstone Hats MES** es el cerebro operativo que digitaliza el piso de planta y conecta la administración (CONTPAQi) con el trabajo diario de los operadores:

1. **Elimina recapturas y errores:** Toma los pedidos directo de CONTPAQi y permite planear la producción semanal.
2. **Controla el avance físico con Códigos QR:** Sigue el sombrero desde que se unen copa y falda en Prensas hasta que se empaca en Embarque.
3. **Controla cuellos de botella y almacenes intermedios:** Muestra en vivo cuántas piezas hay esperando en cada área de la fábrica (WIP).
4. **Resuelve fallas y calidad sin detener la línea:** Permite desviar piezas con defecto a Reproceso, Segunda o Merma con causa justificada, mientras las piezas buenas siguen avanzando.
5. **Genera pre-nómina de destajo automática:** Calcula cada viernes las piezas concluidas por cada operario según su tarifa en pesos, exportable a Excel en un clic.

---

## 2. Diagrama de Flujo Ejecutivo: Fábrica Física + Capacidades del Sistema MES

Este diagrama muestra las **4 grandes fases de la producción**, cómo interactúa el operador en la nave física y **qué herramientas y funciones alternas tiene el sistema MES** en cada punto:

```mermaid
flowchart TD
    classDef erp fill:#0F172A,stroke:#334155,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef mesMain fill:#1D4ED8,stroke:#3B82F6,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef fabrica fill:#334155,stroke:#64748B,stroke-width:2px,color:#FFFFFF;
    classDef calidad fill:#9A3412,stroke:#F97316,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef alterno fill:#581C87,stroke:#A855F7,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef kpi fill:#064E3B,stroke:#10B981,stroke-width:1px,color:#ECFDF5;

    %% FASE 1: PLANEACIÓN
    subgraph FASE1 ["FASE 1: Planificación, Loteo e Impresión"]
        ERP_IN[("CONTPAQi Comercial\nPedidos autorizados y materiales")]:::erp
        MES_PLAN["[MES] Módulo de Ingeniería\n• Lectura de Pedidos SQL\n• Segmentación de Lotes (60) y Sublotes (15)\n• Captura de Fecha Compromiso\n• Generación de Tarjetas Viajeras con QR\n• Bloqueo de impresión hasta segmentar"]:::mesMain
        
        ERP_IN -->|Lectura automática| MES_PLAN
    end

    %% FASE 2: NACIMIENTO Y TRAMO TORRE 60
    subgraph FASE2 ["FASE 2: Nacimiento del Lote y Tramo Inicial (Torre 60 pzas)"]
        CORTE["[Fábrica] Corte y Preparación\nCopa y falda por separado"]:::fabrica
        PRENSAS["[Fábrica] Prensas Calientes\nUnión copa y falda con horma montada\n(Nace el lote de 60 piezas)"]:::fabrica
        
        MES_PISO1["[MES] Terminal de Prensas\n• Escaneo QR de nacimiento de lote\n• Asignación de Horma a máquina\n• Depósito en almacén de salida"]:::mesMain

        PARO["[MES FUNCIONALIDAD ALTERNA]\nBitácora Táctil de Paros de Máquina\n• Registro de detención: falta de vapor,\nfalla mecánica, cambio de molde\n• Cronómetro en vivo de tiempo muerto"]:::alterno

        TRAMO_INICIAL["[Fábrica] Alambrado, Endopado y Pintura\nAvance físico en torres de 60 piezas"]:::fabrica

        MES_PLAN --> CORTE --> PRENSAS
        PRENSAS <--> MES_PISO1
        PRENSAS -.->|Si máquina se detiene| PARO
        PRENSAS --> TRAMO_INICIAL
    end

    %% FASE 3: FRACCIONAMIENTO EN RAMPA
    subgraph FASE3 ["FASE 3: Mesa de Rampa y Fraccionamiento (Almacén D-05)"]
        RAMPA_FIS["[Fábrica] Mesa de Rampa\nLa torre de 60 se divide en 4 carritos de 15 piezas\npara moldeado y secado ágil"]:::fabrica
        
        MES_RAMPA["[MES] Modo Rampa en Terminal\n• Escaneo de Tarjeta Madre de 60\n• Software desactiva Tarjeta Madre\n• Software activa 4 Sublotes (15 pzas c/u)\n• Habilita trazabilidad individual por carrito"]:::mesMain

        TRAMO_INICIAL --> RAMPA_FIS
        RAMPA_FIS <--> MES_RAMPA
    end

    %% FASE 4: ENSAMBLE, CALIDAD Y DESPACHO
    subgraph FASE4 ["FASE 4: Ensamble, Filtros de Calidad y Embarque"]
        HID_ADORNO["[Fábrica] Hidráulicas, Pre-adorno y Adorno\nArmado final del sombrero en carritos de 15"]:::fabrica

        SUB_BUF["[MES FUNCIONALIDAD ALTERNA]\nSemáforo de Subensambles (Tafiletes y Toquillas)\n• Monitoreo de stock intermedio por talla\n• Semáforo VERDE en Adorno para ensamblar\n• Semáforo ROJO si faltan insumos"]:::alterno

        FICHA_FOTO["[MES FUNCIONALIDAD ALTERNA]\nFicha Técnica con Fotos Oficiales\n• Galería de fotos en alta resolución\n• Comparación visual en pantalla del modelo\nautorizado contra la pieza física"]:::alterno

        CALIDAD_GATE{"[MES] Filtros de Calidad (C1 a C5)\nInspector: ¿Aprobado?"}:::calidad

        RECHAZO_FLOW["[MES RESOLUCIÓN DE CALIDAD]\n• Reproceso: Retorno a estación causante\n• Segunda: Venta directa con descuento\n• Merma: Registro de causa raíz y desecho\n(El lote conforme sigue su avance sin frenarse)"]:::calidad

        EMBARQUE["[Fábrica] Empaque y Embarque\nReagrupación en cajas de 60 piezas"]:::fabrica

        MES_SALIDA["[MES] Despacho y Cierre\n• Generación de Vale de Salida con QR\n• Liquidación de Orden en piso\n• Cálculo automático de Destajo Semanal (Excel)"]:::mesMain

        ERP_OUT[("CONTPAQi Comercial\n• Entrada de Producto Terminado\n• Folio MES en Observaciones\n• Descarga de Materia Prima")]:::erp

        RAMPA_FIS --> HID_ADORNO
        SUB_BUF -.->|Alimenta insumos| HID_ADORNO
        FICHA_FOTO -.->|Guía visual| HID_ADORNO
        HID_ADORNO --> CALIDAD_GATE
        CALIDAD_GATE -->|Sí: Pasa| EMBARQUE
        CALIDAD_GATE -.->|No: Rechazo| RECHAZO_FLOW
        RECHAZO_FLOW -.->|Retorno| HID_ADORNO
        EMBARQUE <--> MES_SALIDA
        MES_SALIDA -->|Escritura SQL ($0 USD)| ERP_OUT
    end

    %% MONITOREO EJECUTIVO TRANSVERSAL
    subgraph ANDON ["TABLERO DIRECTIVO EN VIVO (ANDON)"]
        KPI_WIP(["KPI 1: Inventario WIP por Almacén"]):::kpi
        KPI_PROD(["KPI 2: Avance Real vs Programado"]):::kpi
        KPI_QUAL(["KPI 3: Segundas, Mermas y Reprocesos"]):::kpi
        KPI_PARO(["KPI 4: Paros y Tiempos Muertos de Prensa"]):::kpi
        KPI_TIME(["KPI 5: Semáforo de Entrega vs Fecha Compromiso"]):::kpi
    end

    MES_PISO1 -.-> ANDON
    MES_RAMPA -.-> ANDON
    CALIDAD_GATE -.-> ANDON
    PARO -.-> ANDON
    MES_SALIDA -.-> ANDON
```

---

## 3. Funcionalidades Alternas y de Soporte del Sistema MES

Además del camino estándar de avance de lotes, el sistema cuenta con módulos diseñados para resolver contingencias operativas en la fábrica:

### 1. Bitácora Táctil de Paros de Máquina
* **Dónde opera:** En terminales de Prensas y estaciones críticas de planta.
* **Propósito:** Registrar tiempos muertos de inicio a fin cuando una máquina se detiene.
* **Catálogo de Motivos Táctil:** *Cambio de horma/molde, Falla mecánica de prensa, Falta de vapor en caldera, Falta de lienzo/material, Mantenimiento eléctrico*.
* **Impacto:** Alimenta el KPI de Tiempos Muertos en el Tablero Andon para que Mantenimiento y Dirección identifiquen máquinas problemáticas.

### 2. Semáforo de Buffer de Subensambles (Tafiletes y Toquillas)
* **Dónde opera:** En el área de Adorno y estaciones de costura de accesorios.
* **Propósito:** Evitar que los operadores de Adorno inicien un lote de sombreros si el área de tafiletes o toquillas no ha terminado los insumos de esa talla.
* **Visualización:**
  * 🟢 **Verde:** Stock completo (más de 60 piezas disponibles de esa talla).
  * 🟡 **Amarillo:** Stock parcial (insumos en proceso de costura).
  * 🔴 **Rojo:** Sin existencias (línea detenida por falta de subensamble).

### 3. Ficha Técnica Multiperspectiva con Fotos Oficiales
* **Dónde opera:** En Adorno e Inspección Final de Calidad.
* **Propósito:** Garantizar que el armado de adornos, herrajes y doblado de toquillas sea idéntico a la muestra física que aprobó el cliente.
* **Visualización:** Despliega en pantalla fotos oficiales en alta resolución tomadas desde múltiples ángulos (vista frontal, lateral, detalle de herraje y detalle de doblado).

### 4. Flujo de Segundas y Mermas sin Detener la Línea
* **Dónde opera:** En todos los puntos de inspección y terminales de salida.
* **Propósito:** Registrar piezas defectuosas retiradas de la torre sin congelar el lote.
* **Manejo:** El lote continúa con las piezas conformes restantes; las piezas defectuosas se clasifican como "Segunda" (para venta directa con descuento) o "Merma", asociando siempre la causa raíz del defecto (mancha de acabado, rotura de falda, poro en lienzo, etc.).

### 5. Pre-Nómina Automatizada a Destajo y Exportación Excel
* **Dónde opera:** En el módulo administrativo de Ingeniería / Recursos Humanos.
* **Propósito:** Eliminar los cuadernos y libretas donde los supervisores anotaban a mano las piezas de cada operador.
* **Manejo:** El sistema suma las piezas registradas por número de nómina en cada estación, aplica la tarifa en pesos ($/pza) y genera la tabla de corte semanal de los viernes con descarga inmediata a Excel.

---

## 4. Catálogo Detallado de los 7 Módulos del Sistema MES (MVP)

### Módulo 1: Programación, Loteo e Impresión (Ingeniería Admin)
* **Lectura SQL de Pedidos:** Consulta automática de pedidos autorizados en CONTPAQi sin recapturas.
* **Captura de Fecha Compromiso:** Establece la fecha meta para proyectar el semáforo de entrega.
* **Segmentación Manual Obligatoria:** Permite al Ingeniero definir el número de lotes madre (60 pzas) y sublotes (15 pzas) según la orden. El sistema bloquea la impresión de códigos QR hasta que la segmentación es confirmada.
* **Generador de Tarjetas Viajeras en PDF Carta:** Exporta la plantilla de tarjetas con códigos QR de alta densidad, especificación de horma, modelo y talla listas para imprimir en impresora láser de oficina y recortar.

### Módulo 2: Monitoreo Andon & Tablero Ejecutivo (Piso de Planta)
* **WIP en Tiempo Real:** Visualización gráfica de piezas acumuladas en cada almacén intermedio entre departamentos.
* **Tablero de 5 KPIs Rectores:**
  1. *Avance Real vs. Programado por Orden*.
  2. *WIP Activo y Piezas Producidas por Área*.
  3. *Costo de Materiales vs. BOM*.
  4. *Mapeo de Reprocesos con Causa Raíz*.
  5. *Tiempo de Entrega vs. Fecha Compromiso*.
* **Semáforos Visuales:** Alertas inmediatas en pantalla sin ruidos ni bocinas molestas.

### Módulo 3: Terminal Táctil de Piso (Tablets T1 a T6)
* **Diseño Ergonómico Tablet-First:** Botones e inputs de más de 42px diseñados para operarse con guantes o dedos con polvo.
* **Lector QR de Pantalla Completa:** Lectura instantánea utilizando la cámara trasera de la tablet o escáner 2D USB/Bluetooth en modo emulación teclado.
* **Modo Rampa (Fraccionamiento):** Asistente paso a paso para desactivar el lote madre de 60 piezas y dar de alta los 4 sublotes de 15 piezas con un solo toque.
* **Bitácora Táctil de Paros de Máquina:** Cronómetro táctil para registrar detenciones en Prensas indicando número de máquina, operador y motivo (cambio de horma, falla mecánica, falta de vapor o falta de material).

### Módulo 4: Filtros de Calidad y No Conformidades (C1 a C5)
* **Terminal de Aprobación Rápida:** Botones de "Aprobar" y "Rechazar" para inspectores de calidad exclusivos.
* **Dictamen de Rechazo:** Modal exclusivo para Supervisor o Ingeniero de Calidad para definir:
  * *Reproceso:* Retorno digital a la estación causante (flechas de retorno en diagrama).
  * *Segunda:* Desvío a almacén de remate registrando causa raíz para KPIs.
  * *Merma:* Desecho definitivo de piezas con afectación a costos.

### Módulo 5: Subensambles y Fichas Técnicas Multiperspectiva
* **Semáforo de Suministro para Adorno:** Monitoreo visual de stock de tafiletes y toquillas para garantizar que Adorno no inicie un lote si faltan componentes.
* **Ficha Técnica Visual con Fotos Oficiales:** Visor de imágenes en alta resolución mostrando la muestra física aprobada desde múltiples perspectivas (armado, doblado, costura y herraje).

### Módulo 6: Pre-Nómina de Destajo y Reportes Administrativos
* **Cálculo Automático por Operador:** Multiplica piezas concluidas por la tarifa fija ($/pza) de cada área.
* **Exportación Directa a Excel:** Generación del reporte de corte semanal de los viernes en formato `.xlsx` limpio y sin macros para RH y Nóminas.

### Módulo 7: Conector Puente CONTPAQi Comercial SQL Server
* **Integración Nativa ($0 USD Licencias SDK):** Lee pedidos y materias primas mediante vistas SQL y registra la entrada de producto terminado escribiendo el folio del lote MES en las observaciones de CONTPAQi.
