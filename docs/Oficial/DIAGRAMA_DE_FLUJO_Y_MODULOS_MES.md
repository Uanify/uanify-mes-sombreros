# Diagrama de Flujo del Sistema & Catálogo de Módulos (MVP)
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Documento Oficial de Procesos, Flujo por Rol y Arquitectura Modular.*

> **Versión:** `v2.44.0`  
> **Fecha:** 7 de Octubre de 2026  
> **Estado:** Documento Oficial de Entrega  
> **Cliente:** Tombstone Hats  
> **Proveedor:** Uanify

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
* **Ingesta de Órdenes:** Lectura directa de órdenes de producción activas en la base de datos Microsoft SQL Server de CONTPAQi.
* **Partición y Creación de Lotes:** Pantalla para programar el volumen de la orden, definiendo lotes madre y número de sublotes.
* **Centro de Impresión de Tarjetas:** Generación de formatos estándar en papel carta listos para recortar e introducir en micas viajeras de piso con códigos QR.

### Módulo 2: Monitoreo de Piso y WIP por Almacén
* **Avance Real vs. Programado:** Medidor visual de piezas completadas frente a las requeridas por cada orden activa.
* **Mapa de Almacenes Intermedios:** Visualización en tiempo real del inventario en proceso (WIP) depositado en cada buffer y almacén entre estaciones.
* **Bitácora Mínima del Lote:** Consulta rápida del historial de movimientos, hora y usuario que depositó cada lote o sublote.

### Módulo 3: Terminal Táctil de Piso (Supervisores)
* **Escaneo de Lotes:** Identificación de tarjeta viajera mediante cámara integrada o lector óptico industrial.
* **Registro de Depósito:** Confirmación de depósito en el almacén intermedio correspondiente.
* **Modo Rampa (Fraccionamiento Multi-QR):** Escaneo en lote para desactivar la tarjeta madre y activar los códigos QR de los sublotes de 15 piezas.
* **Captura de Paros de Máquina:** Registro de tiempo improductivo indicando operador, máquina y motivo de falla.

### Módulo 4: Puntos de Control de Calidad e Inspección
* **Validación de Filtro:** Aprobación o rechazo de piezas en los puntos oficiales de revisión.
* **Resolución de Rechazos (Supervisor / Ingeniero):**
  * Asignación manual de estación de retorno para **Reprocesos**.
  * Captura de piezas y causa raíz para **Segundas** (histórico).
  * Captura de piezas y motivo para **Mermas** (histórico).

### Módulo 5: Pre-Nómina de Destajo y Reportes
* **Cálculo de Destajo Semanal:** Conteo acumulado de piezas procesadas por cada operador fijo con su tarifa asignada ($/pza).
* **Exportación Administrativa:** Descarga en un clic en formato Microsoft Excel para nómina.

### Módulo 6: Microservicio Puente CONTPAQi SQL Server
* **Integración Local:** Vistas y Stored Procedures en SQL Server para sincronizar catálogos, registrar salida de producto terminado con folio de lote MES y descontar consumos de materia prima.
