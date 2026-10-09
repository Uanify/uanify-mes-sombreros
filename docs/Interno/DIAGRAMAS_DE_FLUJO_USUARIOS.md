# Flujos de Usuario e Interacción (User Flows) · Alcance Oficial MVP
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Mapeo Operativo por Rol y Puntos de Decisión en Planta.*

> **Fecha:** Octubre 2026 | **Versión:** `v2.50.0`  
> **Planta Matriz:** San Francisco del Rincón, Gto. | **Cliente:** Tombstone Hats  
> **Arquitectura:** Flujo Físico-Digital en Turno Único (07:00 - 15:30), Tablets T1 a T6 y Filtros C1 a C5.

---

## 1. Mapa de Actores del Ecosistema

```mermaid
graph TD
    classDef admin fill:#FDF8F5,stroke:#8B5E3C,stroke-width:2px,color:#0F172A;
    classDef piso fill:#EFF6FF,stroke:#1D4ED8,stroke-width:2px,color:#0F172A;
    classDef quality fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A;

    DIR["Dirección General\n(Edmundo González)"]:::admin
    ING["Ingeniería & Planeación\n(Ing. Carlos Ortiz)"]:::admin
    SUP["Supervisores de Piso\n(Tablets T1 a T6)"]:::piso
    CAL["Inspectores de Calidad\n(Filtros C1 a C5)"]:::quality
    OP["Operadores en Estación\n(Padrón / Destajo)"]:::piso
    CPQ["CONTPAQi Comercial\n(SQL Server Local)"]:::admin

    CPQ -->|Lectura Pedidos| ING
    ING -->|Tarjetas QR Lote 60| SUP
    OP -->|Piezas en Máquina| SUP
    SUP -->|Lote a Revisión| CAL
    CAL -->|Aprobado / Reproceso| SUP
    SUP -->|Avance & Paros| DIR
    SUP -->|Lote Liberado T6| CPQ
```

---

## 2. Flujo 1: Ingeniero de Producción (Programación & Tarjetas)

```mermaid
flowchart TD
    A([Inicio: Nueva Orden en CONTPAQi]) --> B[Consultar Pedidos Pendientes en MES]
    B --> C[Confirmar Fecha Compromiso con Cliente]
    C --> D[Calcular y Generar Lotes Madre de 60 Piezas]
    D --> E[Imprimir Tarjetas Viajeras con Código QR en Hoja Carta]
    E --> F[Introducir en Micas Cosidas y Entregar a Piso]
    F --> G([Fin: Lote en Piso])
```

---

## 3. Flujo 2: Supervisor de Piso (Tablets T1 a T6 & Almacenes)

```mermaid
flowchart TD
    A([Llegada de Lote a Estación]) --> B[Escanear Código QR con Tablet o Lector 2D]
    B --> C{¿Estación es T4 Alineado/Rampa?}
    C -- Sí --> D[Fraccionar Lote Madre 60 pzas en 4 Sublotes de 15 pzas]
    C -- No --> E[Procesar Lote en Máquina Asignada]
    D --> E
    E --> F{¿Hubo Paro o Interrupción?}
    F -- Sí --> G[Registrar Paro Táctil: Motivo y Tiempo]
    F -- No --> H[Finalizar Piezas en Estación]
    G --> H
    H --> I[Confirmar Depósito en Buffer de Salida]
    I --> J([Lote Disponible para Siguiente Estación])
```

---

## 4. Flujo 3: Inspector de Calidad (Filtros C1 a C5)

```mermaid
flowchart TD
    A([Lote Presentado en Punto de Control]) --> B[Inspección Física de Piezas]
    B --> C{¿Cumple Estándar?}
    C -- Pasa 100% --> D[Dictamen: Aprobado]
    D --> E[Avanzar Lote a Siguiente Estación]
    C -- Detecta Fallas --> F[Dictamen: Rechazado]
    F --> G[Desglosar Piezas Afectadas]
    G --> H{Tipo de Defecto}
    H -- Reprocesable --> I[Enviar a Estación de Origen C2-C5]
    H -- Cosmético Leve --> J[Registrar como Segunda con Folio]
    H -- Destructivo --> K[Registrar Merma y Descontar Piezas]
    I --> L[Actualizar Registro y Bitácora]
    J --> L
    K --> L
    L --> E
```

---

## 5. Flujo 4: Cierre de Lote y Enlace ERP (T6 a CONTPAQi)

```mermaid
flowchart TD
    A([Lote Supera Calidad Final C5]) --> B[Escanear Salida en T6 Liberación]
    B --> C[Verificar Piezas Totales vs Orden Original]
    C --> D[Microservicio Local Conecta a SQL Server]
    D --> E[Insertar Entrada de Producto Terminado en CONTPAQi]
    E --> F[Registrar Folio de Lote MES en Observaciones de P.T.]
    F --> G[Descargar Consumo de Materia Prima de la Orden]
    G --> H([Fin: Orden Concluida y Costeada])
```
