# Tombstone Hats MES · Diagramas de Flujos Principales por Actor / Usuario

> **Documento Oficial de Procesos, Interacción y Flujos de Usuario (User Flows & Architecture)**  
> **Versión del Sistema:** `v2.40.0` | **Fecha:** 2 de Octubre de 2026  
> **Planta Matriz:** San Francisco del Rincón, Guanajuato | **Cliente:** Tombstone Hats  
> **Directiva:** Diagramas de flujo en formato Mermaid estándar para todos los actores clave del sistema MES (Supervisor de Piso, Operador de Planta / Mano de Obra, Almacenista / Logística WIP, Inspector de Calidad, Ingeniero de Procesos y Director General / Administrador).

---

## Índice de Actores y Flujos

1. [Mapa de Actores del Ecosistema MES](#1-mapa-de-actores-del-ecosistema-mes)
2. [Actor 1: Supervisor de Piso (Terminal Tablet / QR Kiosko)](#2-actor-1-supervisor-de-piso-terminal-tablet--qr-kiosko)
3. [Actor 2: Operador de Planta (Mano de Obra / Destajo en Estación)](#3-actor-2-operador-de-planta-mano-de-obra--destajo-en-estación)
4. [Actor 3: Almacenista & Logística WIP (Almacenes Intermedios y Kárdex)](#4-actor-3-almacenista--logística-wip-almacenes-intermedios-y-kárdex)
5. [Actor 4: Inspector de Calidad (Filtros C-01 a C-04 y Segundas)](#5-actor-4-inspector-de-calidad-filtros-c-01-a-c-04-y-segundas)
6. [Actor 5: Ingeniero de Procesos y Planta (Carlos Ortiz)](#6-actor-5-ingeniero-de-procesos-y-planta-carlos-ortiz)
7. [Actor 6: Director General / Administrador (Edmundo González)](#7-actor-6-director-general--administrador-edmundo-gonzález)
8. [Matriz de Interacción Cruzada entre Actores (End-to-End)](#8-matriz-de-interacción-cruzada-entre-actores-end-to-end)

---

## 1. Mapa de Actores del Ecosistema MES

```mermaid
graph TD
    classDef admin fill:#FDF8F5,stroke:#8B5E3C,stroke-width:2px,color:#0F172A;
    classDef piso fill:#EFF6FF,stroke:#1D4ED8,stroke-width:2px,color:#0F172A;
    classDef quality fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A;

    subgraph PisoManufactura["Piso de Producción & Naves de Trabajo"]
        OP["Operador de Planta (Mano de Obra)"]:::piso
        SUP["Supervisor de Piso (Terminal QR Tablet)"]:::piso
        ALM["Almacenista & Custodio WIP"]:::piso
        QC["Inspector de Calidad (C-01 a C-04)"]:::quality
    end

    subgraph GestionTecnicaYDireccion["Gestión Técnica & Dirección"]
        ING["Ingeniero de Procesos (Ing. Carlos Ortiz)"]:::admin
        DIR["Director / Administrador (Edmundo González)"]:::admin
    end

    OP -->|"Sticker / Entrega de Lote"| SUP
    SUP -->|"Escaneo QR & Depósito"| ALM
    ALM -->|"Custodia & Traspaso"| SUP
    SUP -->|"Lote a Inspección"| QC
    QC -->|"Aprobado / Scrap / Segunda"| SUP
    SUP -->|"Datos de Piso en Tiempo Real"| ING
    ING -->|"Rutas, Hormas & Balanceo"| SUP
    ING -->|"OEE, Costos & Reportes"| DIR
    DIR -->|"Metas Semanales & Decisiones B2B"| ING
```

---

## 2. Actor 1: Supervisor de Piso (Terminal Tablet / QR Kiosko)

El Supervisor (`Juan Manuel Pérez`, `Roberto Méndez`) opera en piso con tablet industrial o estación táctil. Su flujo principal es la lectura de la tarjeta viajera, validación de lote y registro de avance departamental.

```mermaid
flowchart TD
    classDef start fill:#DCFCE7,stroke:#15803D,stroke-width:2px,color:#0F172A;
    classDef action fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1.5px,color:#0F172A;
    classDef decision fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A;
    classDef warning fill:#FEE2E2,stroke:#B91C1C,stroke-width:1.5px,color:#0F172A;
    classDef brand fill:#FDF8F5,stroke:#8B5E3C,stroke-width:2px,color:#8B5E3C;

    A["Inicio: Supervisor accede a Terminal"]:::start --> B["Login con PIN táctil de 4 dígitos"]:::action
    B --> C["Sistema valida RBAC y filtra sus Departamentos asignados"]:::action
    C --> D["Pantalla Inicial Limpia: Sólo Botón 'Escanear QR'"]:::brand
    
    D --> E["Supervisor pulsa 'Iniciar Escaneo QR'"]:::action
    E --> F["Se activa Kiosko Fullscreen con cámara o simulador industrial"]:::action
    
    F --> G{"Lectura de QR Exitosa?"}:::decision
    G -- No --> F
    G -- Sí --> H["Cierre de Kiosko y Revelación Progresiva del Lote"]:::action

    H --> I{"Lote pertenece a departamento asignado?"}:::decision
    I -- No --> J["Alerta In-App: 'Departamento no autorizado para este supervisor'"]:::warning
    J --> D

    I -- Sí --> K["Despliegue de Datos del Lote:<br/>• Modelo, Horma, Talla, Falda<br/>• Piezas (15 ó 60)<br/>• Operador sugerido"]:::brand

    K --> L{"Acción a realizar por Supervisor"}:::decision

    L -- "Avanzar Lote" --> M["Confirma Operador titular o selecciona de lista"]:::action
    M --> N["Pulsa 'Depositar en Almacén Siguiente'"]:::action
    N --> O["Lote avanza a estación subsecuente según Ruta oficial"]:::action
    O --> P["Se actualiza Tablero Andon y Kárdex de Operador"]:::action

    L -- "Registrar Paro" --> Q["Abre menú de Paro / SMED"]:::action
    Q --> R["Selecciona causa (Cambio Horma, Falla Prensa, Falta Vapor)"]:::action
    R --> S["Alerta Andon visual se activa en color Ámbar/Rojo"]:::warning

    L -- "Reportar Defecto" --> T["Registra piezas mermadas o daño en tránsito"]:::warning
    T --> U["Notifica a Control de Calidad"]:::action

    P --> V["Fin del ciclo: Terminal vuelve a estado inicial listo para próximo QR"]:::start
    S --> V
    U --> V
```

---

## 3. Actor 2: Operador de Planta (Mano de Obra / Destajo en Estación)

Los operadores de planta (`Salvador Macías`, `Jorge Martínez`, `Melany Luna`, etc.) trabajan directamente en las prensas, mesas de adorno y acabado. **No inician sesión en el software con contraseñas**, pero interactúan físicamente mediante su sticker en la tarjeta viajera física y su número de nómina.

```mermaid
flowchart TD
    classDef start fill:#DCFCE7,stroke:#15803D,stroke-width:2px,color:#0F172A;
    classDef physical fill:#EFF6FF,stroke:#1D4ED8,stroke-width:1.5px,color:#0F172A;
    classDef decision fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A;
    classDef system fill:#FDF8F5,stroke:#8B5E3C,stroke-width:2px,color:#8B5E3C;

    A["Inicio: Operador llega a su Puesto / Máquina asignada"]:::start --> B["Toma lote/sublote del Almacén Intermedio de entrada"]:::physical
    B --> C["Verifica especificaciones en Tarjeta Viajera física<br/>(Horma, Talla, Falda, Modelo)"]:::physical
    
    C --> D["Ejecuta la operación manual / maquinado<br/>(ej. Prensado vapor 120°C, Recorte, Tafilete)"]:::physical
    
    D --> E{"Se detectó merma durante el proceso?"}:::decision
    E -- Sí --> F["Separa la pieza defectuosa física"]:::physical
    F --> G["Informa a Supervisor para ajuste en sistema"]:::physical
    
    E -- No --> H["Completa las piezas del lote (15 ó 60 pzas)"]:::physical
    
    H --> I["Coloca su sticker físico en la esquina superior de la Tarjeta"]:::physical
    G --> I

    I --> J["Deposita la torre terminada en Mesa de Salida / Almacén Intermedio"]:::physical
    
    J --> K["Supervisor escanea QR y valida nómina del Operador"]:::system
    K --> L["Software abona automáticamente las piezas a su No. de Nómina"]:::system
    L --> M["Métrica de Operador visible en Directorio General y Nómina"]:::system
```

---

## 4. Actor 3: Almacenista & Logística WIP (Almacenes Intermedios y Kárdex)

El Almacenista supervisa la custodia física y digital de los 5 almacenes intermedios (`A-01` Materia Prima a `A-05` Producto Terminado), el inventario de subensambles (tafiletes de piel por talla) y la emisión de vales de traspaso.

```mermaid
flowchart TD
    classDef start fill:#DCFCE7,stroke:#15803D,stroke-width:2px,color:#0F172A;
    classDef action fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1.5px,color:#0F172A;
    classDef decision fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A;
    classDef brand fill:#FDF8F5,stroke:#8B5E3C,stroke-width:2px,color:#8B5E3C;

    A["Inicio: Almacenista ingresa al Módulo Almacenes"]:::start --> B["Visualiza Cards de Ocupación de los 5 Almacenes Físicos"]:::action
    
    B --> C{"Tipo de Consulta o Gestión"}:::decision

    C -- "Inventario de Almacén" --> D["Revisa stock en custodia y porcentaje de capacidad buffer"]:::action
    D --> E["Filtra almacén específico (ej. A-02 Encolado / A-03 Prensas)"]:::action
    E --> F["Abre 'Ver Lotes en Custodia' para auditar folios físicos"]:::brand

    C -- "Subensambles & Tafiletes" --> G["Abre pestaña Tafiletes & Subensambles"]:::action
    G --> H["Supervisa Grid responsivo de tallas (54 a 60)"]:::brand
    H --> I{"Existencia de tafiletes <= Mínimo de Seguridad?"}:::decision
    I -- Sí --> J["Se activa badge 'Atención Stock' y alerta para preparación en mesa"]:::action
    I -- No --> K["Estatus 'Disponible'"]:::action

    C -- "Kárdex & Movimientos" --> L["Abre pestaña Kárdex General de Movimientos"]:::action
    L --> M["Aplica filtros por Tipo (Entrada, Traspaso, Salida B2B) y Almacén"]:::action
    M --> N["Audita Folio de Movimiento, piezas y custodio responsable"]:::brand
    N --> O["Genera o consulta Vale Oficial In-App con sello digital"]:::action
```

---

## 5. Actor 4: Inspector de Calidad (Filtros C-01 a C-04 y Segundas)

El Inspector de Calidad supervisa los 4 filtros estratégicos (`C-01` Inspección Tras Encolado, `C-02` Control Hormado Vapor, `C-03` Revisión Pintura/Matizado y `C-04` Auditoría Final Pre-Empaque).

```mermaid
flowchart TD
    classDef start fill:#DCFCE7,stroke:#15803D,stroke-width:2px,color:#0F172A;
    classDef action fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1.5px,color:#0F172A;
    classDef decision fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A;
    classDef scrap fill:#FEE2E2,stroke:#B91C1C,stroke-width:2px,color:#B91C1C;
    classDef brand fill:#FDF8F5,stroke:#8B5E3C,stroke-width:2px,color:#8B5E3C;

    A["Inicio: Lote arriba a Estación de Filtro de Calidad"]:::start --> B["Inspector escanea QR de Tarjeta Viajera"]:::action
    B --> C["Carga Criterios de Aceptación y Tolerancias de la Ficha Oficial"]:::brand

    C --> D["Inspección Dimensional y Visual:<br/>• Curva y simetría de falda<br/>• Dureza y termoactivación de copa<br/>• Tono de teñido / acabado superficial"]:::action

    D --> E{"Resultado de Inspección"}:::decision

    E -- "100% Conforme" --> F["Sella digitalmente 'Aprobado Calidad'"]:::brand
    F --> G["Lote avanza a estación subsecuente sin restricciones"]:::action

    E -- "Defecto Crítico Irrecuperable" --> H["Clasifica como SCRAP / Merma Industrial"]:::scrap
    H --> I["Captura motivo en catálogo de fallas y piezas mermadas"]:::scrap
    I --> J["Se descuenta de inventario y se registra en Matriz OEE"]:::scrap

    E -- "Defecto Menor Estético" --> K["Clasifica como Sombrero de Segunda (Remate)"]:::action
    K --> L["Se etiqueta lote especial de liquidación viernes"]:::action
    L --> M["Inventario se desvía a Bodega de Remate"]:::action
```

---

## 6. Actor 5: Ingeniero de Procesos y Planta (Carlos Ortiz)

El Ingeniero gestiona la arquitectura operativa de la fábrica: balanceo de líneas, catálogo maestro de hormas y moldes, rutas por modelo (BOM/Secuencia) y KPIs de OEE.

```mermaid
flowchart TD
    classDef start fill:#DCFCE7,stroke:#15803D,stroke-width:2px,color:#0F172A;
    classDef action fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1.5px,color:#0F172A;
    classDef decision fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A;
    classDef brand fill:#FDF8F5,stroke:#8B5E3C,stroke-width:2px,color:#8B5E3C;

    A["Inicio: Ing. Carlos Ortiz ingresa a Consola de Ingeniería"]:::start --> B{"Área de Gestión"}:::decision

    B -- "Catálogo de Hormas & Moldes" --> C["Supervisa vida útil de moldes de aluminio (ciclos vapor)"]:::action
    C --> D["Asigna hormas a prensas hidráulicas Michelagnoli"]:::action
    D --> E["Registra nuevas hormas o retira moldes con desgaste de flanco"]:::brand

    B -- "Rutas & Secuencias (BOM)" --> F["Abre Editor de Secuencias Departamentales por Modelo"]:::action
    F --> G["Selecciona Modelo de Sombrero (ej. Denver 1000X)"]:::action
    G --> H["Configura secuencia con Drag & Drop (manija ⠿)"]:::brand
    H --> I["Inserta o remueve estaciones y filtros de calidad"]:::action
    I --> J["Guarda Secuencia Oficial de Ruta"]:::action

    B -- "Monitoreo OEE & Balanceo" --> K["Abre Tablero Andon y Módulo de Analítica"]:::action
    K --> L["Monitorea Takt Time real vs estándar (42s)"]:::brand
    L --> M{"Detecta cuello de botella en estación?"}:::decision
    M -- Sí --> N["Reasigna operadores flotantes o activa prensa de relevo"]:::action
    M -- No --> O["Línea operando a cadencia óptima"]:::action
```

---

## 7. Actor 6: Director General / Administrador (Edmundo González)

El Director ("Mundo") tiene visión ejecutiva holística. Su enfoque se centra en el cumplimiento de la meta semanal (4,250 pzas), valorización financiera, costos de scrap y vinculación con la empresa comercial (CONTPAQi ERP).

```mermaid
flowchart TD
    classDef start fill:#DCFCE7,stroke:#15803D,stroke-width:2px,color:#0F172A;
    classDef action fill:#FFFFFF,stroke:#CBD5E1,stroke-width:1.5px,color:#0F172A;
    classDef decision fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A;
    classDef brand fill:#FDF8F5,stroke:#8B5E3C,stroke-width:2px,color:#8B5E3C;

    A["Inicio: Edmundo González ingresa a Consola Directiva"]:::start --> B{"Módulo Ejecutivo"}:::decision

    B -- "Tablero Andon Ejecutivo" --> C["Monitorea producción en tiempo real hora por hora"]:::action
    C --> D["Verifica cumplimiento de Meta Semanal (4,250 pzas)"]:::brand
    D --> E{"Desviación en rendimiento > 10%?"}:::decision
    E -- Sí --> F["Convoca a reunión relámpago con Ing. Ortiz y Supervisores"]:::action
    E -- No --> G["Ritmo normal de entrega"]:::action

    B -- "Finanzas & Valorización" --> H["Audita Valor Producido hoy en MXN"]:::brand
    H --> I["Revisa Costo acumulado de Scrap y mermas"]:::action
    I --> J["Supervisa Saldo de Piezas de Segunda para liquidación"]:::action

    B -- "Enlace ERP CONTPAQi" --> K["Abre panel de sincronización comercial"]:::action
    K --> L["Revisa salidas de producto terminado B2B para embarque"]:::brand
    L --> M["Audita vales de entrega a camioneta de distribución"]:::action
```

---

## 8. Matriz de Interacción Cruzada entre Actores (End-to-End)

Diagrama de secuencia de interacción integral desde la creación del lote hasta el embarque final:

```mermaid
sequenceDiagram
    autonumber
    actor Ing as Ingeniero (Carlos)
    actor Alm as Almacenista (A-01)
    actor Op as Operador (Piso)
    actor Sup as Supervisor (Terminal QR)
    actor QC as Calidad (Filtro C)
    actor Dir as Director (Edmundo)

    Note over Ing,Dir: 1. PROGRAMACIÓN & PREPARACIÓN
    Ing->>Alm: Emite Orden de Producción & Tarjeta Viajera (60 pzas)
    Alm->>Op: Entrega cuadros de telar cortados + Tarjeta física con mica

    Note over Op,Sup: 2. TRANSFORMACIÓN & DESTAJO
    Op->>Op: Realiza proceso en máquina (Prensado / Hormado vapor)
    Op->>Op: Pega sticker físico con su nombre en la tarjeta
    Op->>Sup: Deja torre terminada en Mesa de Almacén Intermedio

    Note over Sup,QC: 3. LECTURA QR & TRAZABILIDAD
    Sup->>Sup: Inicia Escáner Kiosko Fullscreen en Tablet
    Sup->>Sup: Lee código QR de la tarjeta viajera
    Sup->>Sup: Confirma operador en sistema & pulsa "Depositar"
    
    opt Lote requiere Inspección de Calidad
        Sup->>QC: Turna lote al Filtro C correspondiente
        QC->>QC: Valida tolerancias y sella digitalmente Aprobado
    end

    Note over Sup,Dir: 4. ANDON EN VIVO & DIRECCIÓN
    Sup->>Dir: Avance de piezas se refleja en Tablero Andon & OEE
    Dir->>Dir: Monitorea valor producido en MXN y cumplimiento de Meta
