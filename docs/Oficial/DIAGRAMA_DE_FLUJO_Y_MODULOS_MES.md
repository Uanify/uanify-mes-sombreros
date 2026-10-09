# Diagrama de Flujo del Sistema & Catálogo de Módulos (MVP)
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Documento Oficial de Procesos, Flujo por Rol y Arquitectura Modular.*

> **Fecha:** 7 de Octubre de 2026  
> **Cliente:** Tombstone Hats (San Francisco del Rincón, Guanajuato)  
> **Líder de Proyecto:** Andrés Villanueva (Uanify)

---

## 1. Diagrama de Flujo General del Sistema (End-to-End)

El siguiente diagrama modela el flujo físico y digital exacto de la nave industrial: el nacimiento del lote en Prensas tras la unión de copa y falda, el tránsito por las 6 tablets de piso (T1 a T6), los 5 puntos de inspección de calidad (C1 a C5) con retorno a reproceso, y las conexiones de lectura y escritura con CONTPAQi Comercial:

```mermaid
graph TD
    classDef contpaq fill:#0F172A,stroke:#334155,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef proc fill:#1E293B,stroke:#0F172A,stroke-width:2px,color:#FFFFFF;
    classDef t1 fill:#1E3A8A,stroke:#3B82F6,stroke-width:2px,color:#FFFFFF;
    classDef t2 fill:#7C2D12,stroke:#EA580C,stroke-width:2px,color:#FFFFFF;
    classDef t3 fill:#064E3B,stroke:#10B981,stroke-width:2px,color:#FFFFFF;
    classDef t4 fill:#1E293B,stroke:#64748B,stroke-width:2px,color:#FFFFFF;
    classDef t5 fill:#831843,stroke:#EC4899,stroke-width:2px,color:#FFFFFF;
    classDef t6 fill:#14532D,stroke:#22C55E,stroke-width:2px,color:#FFFFFF;
    classDef qual fill:#78350F,stroke:#F59E0B,stroke-width:2px,color:#FFFFFF,font-weight:bold;

    CONT_IN["CONTPAQi Comercial\nPedido, lista de materiales y costos"]:::contpaq
    PROG["Programación (Ingeniería)\nOrden, fecha compromiso y tarjetas QR"]:::proc
    CONT_IN -->|Lectura SQL| PROG

    PREP["Corte, Endopado y Entallado\nCopa y falda por separado (sin lote)"]:::proc
    ALM_MP["Almacén Materia Prima\nSalida de material cargada a la orden"]:::proc
    PROG --> PREP
    ALM_MP -.->|KPI Costo Materiales| PREP

    C1{"C1 · Revisión de Cuadros"}:::qual
    PREP --> C1
    C1 -->|Pasa| D02["T1 · Prensas\nUnión copa-falda: Nace lote de 60"]:::t1
    C1 -.->|No pasa| DEF_C1["Cuadros con defecto\n(Descuenta material)"]:::proc

    D05["T1 · Alambrado\nRecorte de falda, alambrado y costura"]:::t1
    D02 --> D05

    D03["T2 · Endopado\nBaño con alambre"]:::t2
    D05 --> D03

    D06_REF["T3 · Pintura - Refuerzo\nRefuerzo a pistola"]:::t3
    D03 --> D06_REF

    C2{"C2 · Calidad Refuerzo"}:::qual
    D06_REF --> C2
    C2 -->|Pasa| D07_REP["T1 · Prensas - Replanchado\nReplanchado con alambre"]:::t1
    C2 -.->|No pasa (Reproceso)| D06_REF

    D06_PIN["T3 · Pintura\nPintura del sombrero"]:::t3
    D07_REP --> D06_PIN

    C3{"C3 · Calidad Pintura"}:::qual
    D06_PIN --> C3
    C3 -->|Pasa| D06_BRI["T3 · Pintura - Brillo\nAcabado de brillo"]:::t3
    C3 -.->|No pasa (Reproceso)| D06_PIN

    D07_ALI["T4 · Hidráulicas - Alineado\nSe divide en sublotes de 15 piezas"]:::t4
    D06_BRI --> D07_ALI

    C4{"C4 · Calidad Hidráulicas"}:::qual
    D07_ALI --> C4
    C4 -->|Pasa| D08["T1 · Prensas - Refaldeo\nFigura final de la falda"]:::t1
    C4 -.->|No pasa (Reproceso)| D07_ALI

    D09["T4 · Pre-adorno\nPerforado y pegado de tafilete"]:::t4
    D08 --> D09

    SUB_BUF["T5 · Tafilete y Toquilla\nSemáforo de disponibilidad por talla"]:::t5
    D10["T6 · Adorno\nEtiquetas, parche y toquilla"]:::t6
    D09 --> D10
    SUB_BUF -.->|Disponibilidad| D10

    C5{"C5 · Calidad Final"}:::qual
    D10 --> C5
    C5 -.->|No pasa (Reproceso)| D10

    LIB["T6 · Producto Liberado y Entrega\nEmbarque registra la entrega al cliente"]:::t6
    C5 -->|Pasa| LIB

    CONT_OUT["CONTPAQi Comercial\nEntrada de producto terminado\nSalida que descuenta el pedido"]:::contpaq
    LIB -->|Escritura SQL| CONT_OUT
```

---

## 2. Catálogo de Módulos y Funcionalidades del Sistema

### Módulo 1: Programación, Loteo e Impresión (Ingeniería Admin)
* **Ingesta de Órdenes:** Lectura directa de pedidos y órdenes de producción desde Microsoft SQL Server de CONTPAQi Comercial.
* **Captura de Fecha Compromiso:** Registro de la fecha límite acordada con el cliente para el cálculo del semáforo de tiempo de entrega.
* **Partición y Creación de Lotes:** Definición de lotes madre (60 pzas) y número de sublotes según la planeación semanal.
* **Centro de Impresión de Tarjetas:** Generación e impresión de tarjetas viajeras con códigos QR en hojas carta de oficina para recortar e introducir en fundas plásticas cosidas.

### Módulo 2: Monitoreo de Piso, WIP por Almacén y Tablero de 5 KPIs
* **WIP en Vivo por Departamento:** Piezas activas depositadas en cada buffer esperando ser procesadas por la siguiente estación.
* **Piezas Producidas por Área:** Conteo en tiempo real de unidades escaneadas de salida por estación, turno y fecha.
* **Consumo de Materiales vs. BOM:** Comparativa entre la materia prima entregada por Almacén y el consumo estándar según la lista de materiales de CONTPAQi.
* **Mapeo de Reprocesos:** Conteo de piezas rechazadas en los filtros C1 a C5 con registro de causa raíz y estación causante.
* **Tiempo de Entrega vs. Fecha Compromiso:** Semáforo visual en el tablero (verde: a tiempo, amarillo: próximo a vencer, rojo: atrasado).

### Módulo 3: Terminal Táctil de Piso (Supervisores y Tablets T1 a T6)
* **Escaneo de Lotes:** Identificación de tarjeta viajera mediante cámara de la tablet (Xiaomi Redmi Pad SE) o lector óptico industrial 2D (Opción B).
* **Registro de Depósito:** Confirmación de depósito en el almacén intermedio correspondiente al concluir el trabajo en la estación.
* **División en Sublotes (T4):** Función para archivar la tarjeta madre de 60 piezas y activar formalmente los códigos QR de los sublotes de 15 piezas.
* **Captura de Paros de Máquina:** Registro ágil de paros productivos con motivo de catálogo táctil (cambio de horma, falla mecánica, falta de vapor, falta de material) y tiempos de detención.

### Módulo 4: Puntos de Control de Calidad e Inspección (Filtros C1 a C5)
* **Validación de Filtro:** Inspección física por parte del Inspector de Calidad con dos opciones directas: Aprobar o Rechazar.
* **Resolución de Rechazos (Supervisor / Ingeniero de Calidad):**
  * Asignación manual de estación de retorno para **Reprocesos** (C2 regresa a Refuerzo, C3 a Pintura, C4 a Alineado, C5 a Adorno).
  * Captura de piezas y causa raíz para **Segundas** (histórico para KPIs).
  * Captura de piezas y motivo para **Mermas** (histórico para KPIs).

### Módulo 5: Subensambles (T5) y Ficha Técnica Multiperspectiva
* **Semáforo de Buffer en Adorno:** Monitoreo visual de disponibilidad de inventario intermedio en subensambles (Tafiletes y Toquillas) para evitar paros en Adorno.
* **Ficha Técnica Visual con Fotos Oficiales (AWS S3):** Despliegue en pantalla de varias fotografías de la muestra oficial autorizada del sombrero en diferentes perspectivas (armado, doblado, toquilla, herraje) para comparación física en Adorno e Inspección Final.

### Módulo 6: Pre-Nómina de Destajo y Reportes
* **Cálculo de Destajo Semanal:** Acumulado automático de piezas concluidas por operador con base en su tarifa fija ($/pza).
* **Exportación Administrativa:** Descarga en un clic en formato nativo Microsoft Excel para conciliación de nómina.

### Módulo 7: Microservicio Puente CONTPAQi SQL Server
* **Integración Local ($0 Licencias SDK):** Vistas y Procedimientos Almacenados en Microsoft SQL Server dentro de red local para sincronizar catálogos, registrar entrada de producto terminado con el folio del lote MES en observaciones y descargar materia prima consumida.
