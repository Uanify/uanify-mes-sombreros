# Diagrama de Flujo del Sistema & Catálogo de Módulos (MVP)
**Tombstone Hats MES · Control de Planta & Trazabilidad**  
*Documento Ejecutivo para Cliente y Planta: Cómo Funciona el Sistema MES y su Empate con la Producción Real.*

> **Versión:** `v2.57.0`  
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

## 3. ¿Cómo se Empata la Fábrica con el Sistema MES? (Matriz Clara por Etapa)

| Etapa de la Fábrica | Lo que Ocurre en la Fábrica Física | Lo que Hace el Sistema MES Digital | Herramientas y Flujos Alternos Disponibles |
| :--- | :--- | :--- | :--- |
| **1. Programación de Pedidos** | Ventas cierra el pedido con el cliente y lo captura en CONTPAQi Comercial en oficina. | **Lee la orden directo de CONTPAQi** por SQL, registra la fecha de entrega y calcula el semáforo de tiempo. | **Segmentación Manual:** El usuario decide cuántos lotes de 60 piezas y sublotes de 15 se crearán. **Bloqueo Inteligente:** No permite imprimir tarjetas viajeras hasta que la orden esté segmentada. |
| **2. Emisión de Tarjetas Viajeras** | Se imprimen las tarjetas en papel bond carta, se recortan y se insertan en fundas plásticas cosidas (micas). | **Genera plantilla en PDF con Códigos QR:** Códigos únicos de alta densidad con modelo, horma, talla y folio oficial. | **Reimpresión de Tarjetas:** Si una mica se daña o se ensucia en piso, se puede reimprimir el QR manteniendo el mismo folio histórico. |
| **3. Nacimiento del Lote (Prensas)** | El operador monta la horma de aluminio en la prensa caliente y une copa con falda. Se monta la torre de 60 piezas en el carrito con su mica. | **Activa el Lote Madre:** El supervisor escanea el QR con la tablet. El sistema valida que la horma montada coincida con la del modelo, arranca el conteo de piezas y suma al WIP de Prensas. | **Bitácora de Paros de Máquina:** Si la prensa se detiene por falta de vapor, falla mecánica o cambio de molde, el operador/supervisor abre la bitácora táctil e inicia un paro con cronómetro en vivo. |
| **4. Flujo Inicial (Alambrado, Endopado, Pintura)** | Los operadores trabajan en sus máquinas fijas y el recolector traslada las torres de 60 piezas de un área a otra. | **Registro de Salida por Área:** Al salir de cada departamento se escanea el lote; el sistema descuenta el inventario del almacén anterior y lo suma al siguiente en tiempo real. | **Captura de Mermas Rápidas:** Si en el camino se detecta un sombrero roto o manchado, se aparta físicamente y en la pantalla se captura la pieza retirada y su causa raíz sin frenar el resto del lote. |
| **5. Fraccionamiento en Rampa (D-05)** | En la mesa de rampa, la torre de 60 piezas se divide en 4 carritos de 15 piezas para permitir secado rápido y moldeo hidráulico. Se archiva la tarjeta madre. | **Modo Rampa Digital:** Al escanear la tarjeta madre de 60 piezas, el sistema la desactiva y **activa automáticamente los 4 Sublotes de 15 piezas**, asignando un QR independiente a cada carrito. | **Trazabilidad Independiente:** Si un carrito de 15 se retrasa en secado, los otros 3 carritos pueden avanzar sin esperarlo. |
| **6. Hidráulicas y Pre-adorno** | Los operadores moldean el ala y la copa en prensas hidráulicas y perforan ventilación en carritos de 15 piezas. | **Seguimiento por Sublote:** Cada escaneo actualiza el estatus del sublote de 15 piezas y acredita las piezas al preconteo del operador de la máquina. | **Control de Reprocesos:** Si una prensa hidráulica deja el ala chueca, el inspector regresa ese carrito a alineado sin afectar la producción de los demás. |
| **7. Ensamble en Adorno** | Operadores cosen tafiletes, toquillas, parches y herrajes al sombrero según el catálogo autorizado. | **Control de Estación de Adorno:** Registra las piezas concluidas por operario para el pago a destajo semanal. | **Semáforo de Subensambles:** Pantalla que muestra el stock disponible de tafiletes y toquillas. Muestra semáforo VERDE si hay insumos suficientes o ROJO si faltan piezas para evitar paros.<br>**Ficha Técnica con Fotos:** Galería táctil con fotos de la muestra oficial en alta resolución (frente, perfil, doblado, herraje) para comparar la pieza física. |
| **8. Control de Calidad (C1 a C5)** | Los 6 inspectores exclusivos de calidad revisan visualmente el sombrero en puntos estratégicos de la nave. | **Terminal de Filtros de Calidad:** Inspector presiona "Aprobado" (avanza a siguiente área) o "Rechazado" (abre flujo de no conformidad). | **Resolución de No Conformidades:** Supervisor e Ingeniero dictaminan el destino:<br>1. *Reproceso:* Regresa a la estación causante del defecto.<br>2. *Segunda:* Envío a remate registrando causa raíz.<br>3. *Merma:* Desecho con afectación a costos. |
| **9. Empaque y Embarque** | Los 4 sublotes de 15 piezas aprobados se vuelven a juntar en una caja de cartón de 60 piezas, se embalan y se cargan al camión. | **Liberación y Vale de Salida:** El sistema liquida la orden en piso, da de baja los sublotes y **emite el Vale de Salida Digital con código QR** para entrega al transportista. | **Auditoría de Pedido Completo:** El sistema valida que los 4 sublotes estén aprobados antes de permitir la emisión del Vale de Salida. |
| **10. Nómina a Destajo (Viernes)** | Recursos Humanos y Producción calculan el pago semanal de los 108 operadores por piezas producidas. | **Módulo Pre-Nómina de Destajo:** Multiplica automáticamente las piezas buenas concluidas por cada operador por la tarifa en pesos ($/pza) de su área. | **Exportación a Excel en 1 Clic:** Descarga el corte semanal sin fórmulas complejas, listo para dispersión bancaria sin recapturas manuales. |
| **11. Cierre en CONTPAQi Comercial** | Administración revisa facturación y costo de inventario final en oficina. | **Conector SQL Local ($0 USD):** Inserta la entrada de producto terminado en CONTPAQi con el folio del lote MES en observaciones y da salida a la materia prima consumida. | **Cero Licencias Adicionales:** Funciona directo con la base de datos SQL Server de CONTPAQi existente en la planta. |

---

## 4. Funcionalidades Alternas y de Soporte del Sistema MES

Además del camino feliz de producción, el sistema cuenta con módulos diseñados para resolver contingencias en la fábrica:

### 1. Bitácora Táctil de Paros de Máquina
* **Dónde opera:** En terminales de Prensas y estaciones críticas.
* **Propósito:** Registrar tiempos muertos de inicio a fin cuando una máquina se detiene.
* **Catálogo de Motivos Táctil:** *Cambio de horma/molde, Falla mecánica de prensa, Falta de vapor en caldera, Falta de lienzo/material, Mantenimiento eléctrico*.
* **Impacto:** Alimenta el KPI de Tiempos Muertos en el Tablero Andon para que el Jefe de Mantenimiento identifique máquinas problemáticas.

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
* **Visualización:** Despliega en pantalla fotos oficiales en alta resolución tomadas desde 4 ángulos (vista frontal, lateral, detalle de herraje y detalle de doblado).

### 4. Flujo de Segundas y Mermas sin Detener la Línea
* **Dónde opera:** En todos los puntos de inspección y terminales de salida.
* **Propósito:** Registrar piezas defectuosas retiradas de la torre sin congelar el lote.
* **Manejo:** El lote continúa con las piezas conformes restantes; las piezas defectuosas se clasifican como "Segunda" (para venta directa con descuento) o "Merma", asociando siempre la causa raíz del defecto (mancha de acabado, rotura de falda, poro en lienzo, etc.).

### 5. Pre-Nómina Automatizada a Destajo y Exportación Excel
* **Dónde opera:** En el módulo administrativo de Ingeniería / Recursos Humanos.
* **Propósito:** Eliminar los cuadernos y libretas donde los supervisores anotaban a mano las piezas de cada operador.
* **Manejo:** El sistema suma las piezas registradas por número de nómina en cada estación, aplica la tarifa en pesos ($/pza) y genera la tabla de corte semanal de los viernes con descarga inmediata a Excel.

---

## 5. Catálogo Resumido de los 7 Módulos del Sistema MES

1. **Módulo 1: Programación, Loteo e Impresión:** Conexión SQL CONTPAQi, segmentación de lotes (60 y 15 pzas) y generación de tarjetas viajeras en PDF con código QR.
2. **Módulo 2: Monitoreo Andon & Tablero Ejecutivo:** Tablero visual en tiempo real de WIP por almacén, avance de órdenes y 5 KPIs rectores de planta.
3. **Módulo 3: Terminal Táctil de Piso:** Interfaz ergonómica para escaneo QR, confirmación de depósitos intermedios, Modo Rampa y bitácora de paros de máquina.
4. **Módulo 4: Control de Calidad y No Conformidades:** Inspección en 5 filtros con dictamen de Aprobado, Reproceso (con retorno a estación causante), Segunda y Merma.
5. **Módulo 5: Subensambles y Fichas Técnicas:** Semáforo de buffer para tafiletes/toquillas y visor de fotos oficiales autorizadas en alta definición.
6. **Módulo 6: Pre-Nómina de Destajo y Reportes:** Conteo automático de piezas concluidas por operario, cálculo de nómina semanal y descarga nativa a Microsoft Excel.
7. **Módulo 7: Conector Local CONTPAQi Comercial SQL:** Sincronización transparente de pedidos, materias primas y entrada de producto terminado a costo $0 USD en licencias SDK.
