# Diagrama de Flujo del Sistema & Catálogo de Módulos (MVP)
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Documento Oficial de Procesos, Flujo por Rol y Arquitectura Modular.*

> **Fecha:** 7 de Octubre de 2026  
> **Cliente:** Tombstone Hats (San Francisco del Rincón, Guanajuato)  
> **Líder de Proyecto:** Andrés Villanueva (Uanify)

---

## 1. Diagrama de Flujo General del Sistema (End-to-End)

```mermaid
graph TD
    classDef role fill:#1E293B,stroke:#0F172A,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef proc fill:#F8FAFC,stroke:#8B5E3C,stroke-width:2px,color:#0F172A;
    classDef alm fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E,font-weight:bold;
    classDef check fill:#FEE2E2,stroke:#DC2626,stroke-width:2px,color:#991B1B,font-weight:bold;

    subgraph ROL_ING["Ingeniero Admin (Programación & Catálogos)"]
        O1["Ingesta de Orden desde CONTPAQi SQL"]:::proc
        O2["Definición de Lotes Madre (60) y Sublotes (15)"]:::proc
        O3["Impresión In-App de Tarjetas Viajeras QR"]:::proc
        O1 --> O2 --> O3
    end

    subgraph PISO_SUPERVISOR["Supervisor de Planta (Movimiento en Piso & Rampa)"]
        S1["Inicio en D-01 Corte / D-02 Prensas"]:::proc
        S2["Depósito en Almacén Salida Prensas"]:::alm
        S3["Fraccionamiento en Rampa (Modo Rampa Multi-QR)"]:::proc
        S4["Depósito en Almacén Intermedio Siguiente"]:::alm
        O3 -.-> S1 --> S2 --> S3 --> S4
    end

    subgraph FILTRO_CALIDAD["Inspector de Calidad & Supervisor (Filtros de Inspección)"]
        C1{"Inspección en Filtro Calidad"}:::check
        C_OK["Aprobado: Continúa a Almacén Entrada"]:::alm
        C_NOK["Rechazado: Inspector Marca No Conformidad"]:::check
        C_DEC{"Decisión Supervisor / Ingeniero"}:::proc
        C_REP["Reproceso:\nSelecciona Estación Anterior"]:::proc
        C_SEG["Segunda:\nRegistro Histórico + Causa Raíz"]:::proc
        C_MER["Merma:\nRegistro Pieza Descartada + Causa"]:::proc

        S4 --> C1
        C1 -->|Apto| C_OK
        C1 -->|Defecto| C_NOK --> C_DEC
        C_DEC -->|Reprocesar| C_REP --> S1
        C_DEC -->|Segunda| C_SEG --> C_OK
        C_DEC -->|Merma| C_MER
    end

    subgraph CIERRE_CONTPAQ["Cierre de Lote & Enlace CONTPAQi"]
        END_DEP["Almacén Producto Terminado"]:::alm
        SP_CONTPAQ["Descarga de Materia Prima en SQL\nIngreso PT con Folio de Lote MES"]:::proc
        C_OK -.-> END_DEP --> SP_CONTPAQ
    end
```

---

## 2. Catálogo de Módulos y Funcionalidades del Sistema

### Módulo 1: Programación, Loteo e Impresión (Ingeniería Admin)
* **Ingesta de Órdenes:** Lectura directa de órdenes de producción activas en la base de datos Microsoft SQL Server de CONTPAQi Comercial.
* **Partición y Creación de Lotes:** Pantalla para programar el volumen de la orden, definiendo lotes madre y número de sublotes según la planeación semanal.
* **Centro de Impresión de Tarjetas:** Generación e impresión directa de tarjetas viajeras con códigos QR en hojas tamaño carta estándar de oficina para recortar e introducir en fundas plásticas cosidas.

### Módulo 2: Monitoreo de Piso y WIP por Almacén Intermedio
* **Avance Real vs. Programado:** Indicador visual en tiempo real de piezas completadas frente a la meta programada por cada orden de producción.
* **Mapa de Almacenes Intermedios:** Visualización en vivo del inventario en proceso (WIP) depositado en cada buffer y almacén entre estaciones de trabajo.
* **Bitácora Mínima del Lote:** Consulta rápida del historial de movimientos, hora exacta, estación y usuario responsable del depósito de cada lote o sublote.

### Módulo 3: Terminal Táctil de Piso (Supervisores)
* **Escaneo de Lotes:** Identificación de tarjeta viajera mediante cámara integrada de la tablet (Xiaomi Redmi Pad SE / Samsung) o lector óptico industrial 2D (Opción B).
* **Registro de Depósito:** Confirmación de depósito en el almacén intermedio correspondiente al concluir el trabajo en la estación.
* **Modo Rampa (Fraccionamiento Multi-QR):** Escaneo en lote para archivar la tarjeta madre de 60 piezas y activar formalmente los códigos QR de los sublotes de 15 piezas.
* **Captura de Paros de Máquina:** Registro ágil de paros productivos con motivo de catálogo táctil (cambio de horma, falla mecánica, falta de vapor, falta de material) y tiempos de detención.

### Módulo 4: Puntos de Control de Calidad e Inspección
* **Validación de Filtro:** Inspección física por parte del Inspector de Calidad con dos opciones directas: Aprobar o Rechazar.
* **Resolución de Rechazos (Supervisor / Ingeniero):**
  * Asignación manual de estación de retorno para **Reprocesos**.
  * Captura de piezas y causa raíz para **Segundas** (histórico para KPIs).
  * Captura de piezas y motivo para **Mermas** (histórico para KPIs).

### Módulo 5: Subensambles y Ficha Técnica Multiperspectiva
* **Semáforo de Buffer en Adorno:** Monitoreo visual de disponibilidad de inventario intermedio en subensambles (Tafiletes y Toquillas) para evitar paros en Adorno.
* **Ficha Técnica Visual con Fotos Oficiales:** Despliegue en pantalla de varias fotografías de la muestra oficial autorizada del sombrero (almacenadas en AWS S3) en diferentes perspectivas (armado, doblado, toquilla, herraje) para comparación física en Adorno e Inspección Final.

### Módulo 6: Pre-Nómina de Destajo y Reportes
* **Cálculo de Destajo Semanal:** Acumulado automático de piezas concluidas por operador con base en su tarifa fija ($/pza).
* **Exportación Administrativa:** Descarga en un clic en formato nativo Microsoft Excel para conciliación de nómina.

### Módulo 7: Microservicio Puente CONTPAQi SQL Server
* **Integración Local ($0 Licencias SDK):** Vistas y Procedimientos Almacenados en Microsoft SQL Server dentro de red local para sincronizar catálogos, registrar entrada de producto terminado con el folio del lote MES en observaciones y descargar materia prima consumida.
