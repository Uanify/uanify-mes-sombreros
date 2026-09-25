# 🤠 SISTEMA TOMBSTONE MES · DOCUMENTO MAESTRO DE ARQUITECTURA Y PROYECTO
> **Fuente Única de Verdad (Single Source of Truth) para el Desarrollo, Reglas de Negocio y Operación de Planta**  
> **Versión Actual:** `v2.16.0` | **Fecha de Actualización:** 24 de Septiembre de 2026  
> **Cliente:** Tombstone Hats (San Francisco del Rincón, Guanajuato) | **Desarrollador:** [Uanify](https://github.com/Uanify)  
> **Demostración en Producción:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)

---

## 📌 1. Información General y Alcance del Proyecto

El sistema **Tombstone Hats MES** (Manufacturing Execution System) es una plataforma digital de control de piso y tablero Andon industrial diseñada específicamente para resolver las ineficiencias de conteo manual, discrepancias en almacenes intermedios, balanceo de líneas y visibilidad directiva en la planta matriz de **Tombstone Hats** en San Francisco del Rincón, Guanajuato.

### Objetivos Clave de Negocio
1. **Eliminar el papel y los "vales de libreta":** Digitalizar el avance de piezas y nómina por destajo mediante escaneo de códigos QR en tarjetas viajeras.
2. **Tablero Andon Digital en Nave Central:** Sustituir pizarrones manuales por una pantalla Smart TV de 50" con semáforos en tiempo real, Takt Time y estado hora por hora.
3. **Control de Almacenes Intermedios (WIP):** Evitar acumulaciones y cuellos de botella mediante alertas automáticas al superar umbrales (ej. >70 piezas en rampa).
4. **Visibilidad Directiva y Financiera:** Conversión instantánea de piezas terminadas a valor comercial ($801,720+ MXN en corrida @ $1,310 catálogo Tombstone) y cálculo de OEE en vivo.
5. **Sincronización con COMPAC:** Compatibilidad con el sistema administrativo/contable para órdenes de compra y facturación.

---

## 🏭 2. Mapeo del Proceso Productivo Real (Planta Tombstone)

A partir del diagnóstico técnico y entrevistas en planta con Dirección (**Edmundo González**) e Ingeniería de Producción (**Carlos Ortiz**), el sistema modela fielmente la realidad física del proceso:

### Tipos de Producto
1. **Sombreros de 2 Piezas (Producto Campeón):** Copa y falda moldeadas y termo-fusionadas con adhesivo especial y calor. Requiere fraccionamiento de lote en rampa.
2. **Campana Preformada (Fieltro/Lana):** Proceso directo y corto de una sola pieza, saltando etapas de ensamble de copa/falda.
3. **Línea de Accesorios y Toquillas:** Taller paralelo para toquillas de piel, herrajes metálicos y plumas.

---

## 📜 8. Historial de Versiones (SemVer)

- **`v2.16.0` (2026-09-24):**
  - **Rutas y Secuencias Específicas por Modelo con Drag & Drop (`⠿`):** Implementación de reordenamiento visual y táctil mediante arrastre de elementos para las secuencias de manufactura asignadas a cada modelo individual de sombrero (`El Viejonón`, `Denver Master`, `Chaparral`, etc.).
  - **Delimitación de Alcance en Secuencias:** Restricción estricta para que en el constructor de secuencias únicamente se puedan agregar o quitar asignaciones de pasos de ese modelo (`+ Asignar al Final de la Secuencia`, `🗑️ Quitar de la Secuencia`), impidiendo crear, editar o eliminar departamentos o filtros de calidad maestros desde esta pantalla.
  - **CRUD Integral de Filtros de Calidad (`C-XX`):** Nueva sección dedicada en Configuración de Planta para dar de alta, editar y eliminar puntos de inspección y tolerancias (`C-01` a `C-04`), vinculando ubicación física, tolerancias paramétricas, inspectores asignados y sincronización automática con `stations`.
  - **Persistencia y Reactividad Global:** Sincronización transparente de las secuencias de ruta y filtros de calidad en `localStorage` con emisión de eventos vía `EventBus`.

- **`v2.15.0` (2026-09-24):**
  - **Módulo General de Almacén & Control de Inventarios:** Consolidación de todos los almacenes físicos y de amortiguamiento (Materia Prima, Rampa WIP, Pulmón Pre-Prensas, Segundas de Viernes y Producto Terminado), subensambles de tafiletes por talla y nuevo **Kárdex & Movimientos de Almacén** con bitácora de transferencias.
  - **Unificación del Catálogo Maestro de Hormas y Moldes:** Eliminación de la duplicidad del catálogo de hormas que existía en Ingeniería. Centralización exclusiva en el módulo de Almacenes con persistencia (`uanify_custom_molds`).
  - **Reubicación Exclusiva de "Registrar Horma":** El botón `+ Registrar Nueva Horma` ahora se muestra única y exclusivamente dentro de la sub-pestaña del catálogo de hormas, eliminándose del encabezado global.
  - **CRUD Integral de Departamentos y Almacenes Intermedios para Ingeniería:** Herramienta administrativa para crear, consultar, editar y dar de baja departamentos vinculados con su almacén intermedio (Código, Nombre, Tipo de Proceso, Almacén Intermedio, Ubicación, Capacidad Buffer WIP, Takt Time, Supervisor, Máquinas, Estatus Activo/Inactivo y Operadores asignados), con persistencia y reactividad en tiempo real.
  - **Delimitación Limpia de Dominios:** Separación rigurosa entre Configuración de Planta (catálogos y definiciones técnicas), Almacenes (custodia física y movimientos), Ingeniería (analítica y balanceo OEE/BOM) y Operación en Piso (Terminal táctil y Andon).

- **`v2.14.0` (2026-09-24):**
  - **Rediseño Ergonómico de Terminal y Verificación de Mica:** Extracción total de datos por QR sin captura manual, verificación previa de tarjeta física escaneada, depósito automático por secuencia de ruta y restricción departamental para supervisores.
  - **Botones Grandes y Ergonomía Táctil Universal:** Alturas de 48px a 56px para optimización táctil en tabletas.


### Tamaño de Lotes y Trazabilidad Viajera
- **Lote Madre:** **60 piezas** que ingresan desde almacén de materia prima (copas y faldas sin conformar).
- **Rampa de Fraccionamiento:** Al llegar a la rampa de ensamble, el lote madre de 60 se divide en **4 sublotes de 15 piezas** (ej. lote `49,633` se desglosa en sublotes `1`, `2`, `3` y `4`).
- **Tarjeta Viajera Física con Código QR:** Cada torre de 15 piezas lleva adherida una tarjeta viajera protegida en mica transparente que viaja con el lote hasta empaque.

### 2.1 Anatomía y Especificación Oficial de la Tarjeta Viajera (Evidencia Fotográfica de Planta)
A partir de las tarjetas viajeras capturadas directamente en las líneas de ensamble de San Francisco del Rincón:
1. **Porta-Gafete y Mica Protectora:** Funda plástica transparente con orificio superior reforzado para colgar de la torre de sombreros con cordel.
2. **Sticker Redondo de Operador (Esquina Superior Izquierda):** Calcomanía azul rotulada con el nombre del operario responsable (ej. `JORGE`).
3. **Encabezado de Ruta Departamental:** `TARJETA HIDRÁULICAS - ADORNO` (define el tramo del flujo entre estaciones).
4. **Nombre del Modelo / Horma:** Tipografía destacada (ej. `CHAPARRAL`, `VIEJONON`, `JOHNSON LONA`, `SONORA`).
5. **Orden de Producción (`O. PROD:`):** Folio numérico único (ej. `15068`, `15071`).
6. **Logotipo Oficial Tombstone Hats:** Silueta de sombrero vaquero con la leyenda `*** CLASE ***`.
7. **Calidad y Material:** `1,000X MASTER TELAR`.
8. **Acabado:** `LAQUEADOS`.
9. **Cuadrícula Técnica:**
   - `FALDA:` Medida en centímetros o pulgadas (ej. `9.0 Cm` o `9 1/2`).
   - `DOBLADO:` Sentido de planchado del ala (`ABAJO` o `ARRIBA`).
   - `TALLA:` Talla craneal numérica (ej. `# 55`, `# 56`).
10. **Cantidad de Piezas:** `15 Pzas`.
11. **Recuadro Inferior Izquierdo (LOTE):** Número de lote madre (ej. `LOTE: 49,386`, `LOTE: 49,633`).
12. **REGLA CRUCIAL DEL RECUADRO INFERIOR DERECHO (Distinción Lote vs Sublote):**
    - **Tarjeta de Lote Madre:** **NO TIENE NÚMERO** abajo a la derecha (el recuadro permanece vacío o sin numeración).
    - **Tarjeta de Sublote:** **TIENE EL NÚMERO DE SUBLOTE** correspondiente de ese lote madre (ej. número `3` para el tercer sublote).
    - **Digitalización QR:** El lector web y cámara decodifican la tarjeta viajera identificando automáticamente si es lote madre o el sublote específico.

### Los 14 Departamentos y Almacenes Modelados
| Código | Departamento / Estación | Tipo | Takt Time Std | Capacidad Turno Único | Supervisor / Responsable |
|---|---|---|---|---|---|
| **D-01** | Almacén Materia Prima & Campanas | Logística | 20s | 850 pzas | J. Alatorre |
| **D-02** | Engomado & Apresto Químico | Proceso | 35s | 850 pzas | R. Méndez |
| **D-03** | Prensas de Hormado a Vapor (Matriz) | Proceso Cuello de Botella | 42s | 850 pzas | C. Ortiz |
| **D-04** | Troquelado & Asentado de Falda | Proceso | 30s | 850 pzas | M. Torres |
| **D-05** | Almacén Intermedio: Rampa (Fracc. 15 pzas) | Almacén WIP | 15s | 850 pzas | J. M. Pérez |
| **D-06** | Ribeteado & Tafilete Interior | Proceso | 45s | 850 pzas | L. García |
| **D-07** | Subensamble: Taller de Toquillas & Piel | Subproceso | 25s | 850 pzas | E. Rocha |
| **D-08** | Montaje de Toquillas, Plumas & Herrajes | Proceso | 38s | 850 pzas | S. Vargas |
| **D-09** | Enformado & Planchado Final | Proceso | 32s | 850 pzas | F. Delgado |
| **D-10** | Almacén Pulmón Pre-Calidad | Almacén WIP | 15s | 850 pzas | J. M. Pérez |
| **D-11** | Inspección de Calidad (Audit 100%) | Control de Calidad | 40s | 850 pzas | B. Fonseca |
| **D-12** | Almacén de Merma & Retrabajo | Calidad / Scrap | N/A | — | B. Fonseca |
| **D-13** | Empaque B2B & Embalaje de Cajas | Empaque | 28s | 850 pzas | G. Luna |
| **D-14** | Embarques & Salida a Mayoristas | Distribución | 20s | 850 pzas | H. Estrada |

---

## ⏰ 3. Régimen Operativo de Turno Único

Confirmado tras el diagnóstico presencial en la fábrica:
- **Jornada de Trabajo:** **Turno Único** de Lunes a Viernes, de **07:00 a 15:30 hrs** (8.5 horas totales).
- **Receso de Almuerzo:** **12:00 a 12:45 hrs** (45 minutos de comedor de personal).
- **Tiempo Efectivo de Producción:** 465 minutos netos por turno.
- **Meta Diaria de Planta:** **850 piezas terminadas**.
- **Takt Time Estándar:** **42 segundos por pieza** (ritmo requerido para cumplir la meta sin horas extra).
- **Políticas de Sistema:** Queda estrictamente deshabilitado cualquier selector de turnos múltiples ("Turno 1 / Turno 2") en el código e interfaz para evitar discrepancias contables.

---

## 👥 4. Matriz de Roles y Permisos (RBAC)

El sistema cuenta con un motor de permisos modulares persistente en memoria y configurable por el Administrador:

```
[Administrador (Edmundo)] ───► Acceso Total + Gestión de Usuarios & Permisos
[Ingeniero (Carlos)]     ───► Andon + Terminal + Consola Ingeniería + Rutas & Calidad
[Supervisor (Juan M.)]   ───► Tablero Andon + Terminal de Planta (Lotes & QR) [Ocultamiento Estricto]
```

### Tabla de Usuarios Preconfigurados
| Usuario ID | Nombre | Rol | Permisos por Defecto | Estado |
|---|---|---|---|---|
| `admin-1` | **Edmundo González** | `admin` (👑 Administrador) | `andon`, `terminal`, `engineer`, `executive`, `config` | Activo |
| `ing-1` | **Ing. Carlos Ortiz** | `ingeniero` (⚡ Ingeniero de Procesos) | `andon`, `terminal`, `engineer`, `config` | Activo |
| `sup-1` | **Juan Manuel Pérez** | `supervisor` (📱 Supervisor de Línea) | `andon`, `terminal` | Activo |
| `sup-2` | **Roberto Méndez** | `supervisor` (📱 Supervisor de Línea) | `andon`, `terminal` | Activo |

### Comportamiento de Seguridad en UI:
- **Seguridad RBAC por Ocultamiento Estricto:** Los módulos a los que el usuario no tiene acceso según su perfil se ocultan completamente del menú de navegación (`display: none`). No se muestran iconos de candados (`🔒`) ni opciones deshabilitadas, ofreciendo una experiencia limpia y sin distracciones.
- El Administrador puede abrir el modal `modalEditPermissions` para marcar/desmarcar módulos individualmente para cualquier usuario, o dar de alta nuevos supervisores con `modalCreateUser`.
- El Ingeniero de Procesos cuenta con facultades para crear supervisores de planta, dar de alta filtros de calidad (`C-XX`) y modelar rutas de fabricación por modelo.

---

## 🖥️ 5. Arquitectura de Hardware en Nave Industrial

Siguiendo las decisiones tomadas en planta con base en los audios de levantamiento:

1. **Pantalla Central Andon (Smart TV 50"):**
   - Instalada en la viga central de la nave entre prensas y rampa.
   - Proyecta continuamente el **Módulo 1: Tablero Andon Digital**.
   - Visibilidad a 20 metros de distancia: semáforos verde/amarillo/rojo, piezas producidas vs meta semanal (4,250 pzas) y gráfico hora por hora.
2. **Terminales Portátiles para Supervisores (Dispositivos Táctiles Industriales / Rugged):**
   - Funda industrial de uso rudo anticaídas con touch targets ergonómicos (>= 44px).
   - Utilizadas por supervisores en **Rampa (D-05)** y **Almacén Pulmón (D-10)**.
   - Escaneo directo mediante cámara web en vivo (`getUserMedia`) o lector láser de código de barras/QR adherido a la tarjeta viajera.
3. **Cero Pedales Físicos:**
   - Se descartó la instalación de pedales o pulsadores cableados en máquinas para evitar tropiezos, paros por mantenimiento de cables y desbalanceo en puestos manuales.
4. **Cero Alertas Sonoras:**
   - La planta de San Francisco del Rincón tiene ruido ambiente de vapor y motores. Las alertas sonoras generan fatiga auditiva innecesaria; el sistema emplea semáforos visuales de alto contraste.

---

## 📋 5.1 Catálogo Oficial de Requerimientos de Software (SRS / PRD)
Todos los requerimientos funcionales (`RF-01` a `RF-40`) y no funcionales (`RNF-01` a `RNF-12`) del sistema se encuentran catalogados y bajo control de versiones formal en el documento:
- **Documento Oficial de Requerimientos:** [docs/REQUERIMIENTOS_DEL_SISTEMA.md](docs/REQUERIMIENTOS_DEL_SISTEMA.md)

---

## 🎨 6. Sistema de Diseño: "Tradicional Moderno Contemporáneo"

- **Estilo:** Light Mode SaaS Industrial con identidad del clúster sombrerero de Guanajuato.
- **Paleta de Colores Oficial:**
  - `Fondo Principal`: `#F8FAFC` (Slate ultraclaro, limpio y reflectante).
  - `Superficies y Tarjetas`: `#FFFFFF` con bordes sutiles `#E2E8F0`.
  - `Acento de Marca Primario`: `#8B5E3C` (Cuero Artesanal) y `#6E4426` (Cuero Oscuro).
  - `Acento Ámbar / Alerta`: `#B45309` y fondo `#FEF3C7`.
  - `Acento Verde / OK`: `#15803D` y fondo `#DCFCE7`.
  - `Acento Pizarra / Títulos`: `#0F172A` y subtítulos `#475569`.
- **Tipografías:**
  - Títulos y métricas display: **Outfit** (moderno, geométrico y premium).
  - Cuerpo de texto y controles: **Inter** (alta legibilidad).
  - Códigos de lote, horas y Takt Time: **JetBrains Mono** (precisión técnica).
- **Regla Estricta de Cursor Interactivo:** Todo elemento interactivo (botones, selectores, pestañas, modales) tiene forzado `cursor: pointer !important`.

---

## 💻 7. Arquitectura de Software & Despliegue

- **Estructura del Proyecto:**
  ```
  uanify-mes-sombreros/
  ├── assets/                # Logotipos SVG y recursos visuales
  ├── css/
  │   ├── styles.css         # Tokens de diseño, layout sidebar, resets y cursor
  │   └── components.css     # Tarjetas Andon, tablas, modales, pills y botones
  ├── js/
  │   ├── app.js             # Estado central UanifyState, RBAC, reloj y EventBus
  │   ├── andon.js           # Lógica del Tablero Andon y avance hora por hora
  │   ├── terminal.js        # Terminal iPad de escaneo QR y registro de lotes
  │   ├── engineer.js        # Consola de ingeniería, stock de tafiletes y OEE
  │   ├── executive.js       # Métricas de dirección y enlace COMPAC
  │   └── config.js          # Configuración de 14 depts, Turno Único y RBAC
  ├── docs/                  # Minutas de reunión y banco de proyectos hardware/software
  ├── AGENTS.md              # Reglas maestras de desarrollo y comportamiento del agente
  ├── SISTEMA_TOMBSTONE_MES.md # Documento Maestro de Arquitectura (Este archivo)
  ├── package.json           # Metadatos SemVer (v2.7.0)
  ├── README.md              # Documentación pública y Changelog
  └── index.html             # Shell principal de la aplicación SPA
  ```

- **Mecanismo de Despliegue:**
  - Repositorio: `https://github.com/Uanify/uanify-mes-sombreros.git`
  - Servidor de Producción: **GitHub Pages** (`https://uanify.github.io/uanify-mes-sombreros/`)
  - **Cache Busting Automático:** Para evitar que la CDN de GitHub Pages entregue hojas de estilo o scripts cacheados, todos los links y scripts en `index.html` incluyen el parámetro de versión `?v=2.9.0`.

---

## 📜 8. Historial de Versiones (SemVer)

- **`v2.9.0` (2026-09-24):**
  - **Mapa de Proceso y Rastreador Visual de Lotes en Planta:** Incorporación de la sub-pestaña `🗺️ Mapa de Proceso & Rastreador de Lote` en la Terminal para que supervisores, ingenieros y dirección consulten con un clic la ubicación física en tiempo real de cualquier lote de producción (`49,633`, `49,386`, `49,842`).
  - **Línea de Tiempo Interactiva (Value Stream Mapping Industrial):** Visualización tipo cronograma / diagrama de flujo de todas las estaciones y filtros de calidad según el tipo de sombrero, con distinción cromática de estaciones completadas (✅), estación activa con badge pulsante (**📍 AQUÍ ESTÁ EL LOTE**), operador responsable, piezas en proceso y paradas siguientes.
  - **Desplazamiento Dinámico del Lote:** Capacidad operativa para avanzar (`⏩`) o retroceder (`⏮️`) el lote entre estaciones con sincronización en `UanifyState` y `localStorage`, o reubicarlo directamente haciendo clic sobre cualquier nodo de la línea de tiempo.
  - **Gestor de Rutas de Fabricación y Secuencias por Modelo:** Módulo administrativo en Configuración (`📐 Rutas & Secuencias por Modelo`) accesible para **Ingeniero** y **Admin**, que permite ordenar e intercalar departamentos de manufactura y paradas de calidad (botones `▲ Subir`, `▼ Bajar`, `+ Agregar Parada` y `🗑️ Quitar`) según el sombrero de cada lote (1000X Master Telar, Campana Preformada, Laqueados Especiales).
  - **Registro Dinámico de Áreas de Control de Calidad (`C-XX`):** Modal para dar de alta puntos de inspección intermedios y finales (`C-01`, `C-02`, `C-03`, `C-04`...) con captura de tolerancias/criterios de calidad, inspector a cargo y tiempo de ciclo, integrándose automáticamente tanto al catálogo maestro como a las secuencias de rutas.
  - **Ampliación de Permisos para Ingeniería:** Concesión de acceso al módulo de Configuración de Planta al rol Ingeniero (`Ing. Carlos Ortiz`) para modelar y auditar directamente rutas y criterios de calidad.
- **`v2.8.4` (2026-09-24):**
  - **Corrección de Arquitectura de Sub-Pestañas en Todos los Módulos:** Resolución de conflicto de especificidad CSS entre `.sub-tab-content.d-none` y `.active`. Se garantizó la alternancia limpia e instantánea de vistas secundarias en Andon, Terminal de Almacenes, Consola de Ingeniería, Dashboard Directivo y Configuración de Planta.
  - **Definición Informativa del Horario de Turno:** Incorporación de formulario de configuración de turno (Entrada, Salida, Horario de Comida/Descanso, Días Laborables) con previsualización en tiempo real y persistencia en almacenamiento local para sincronización con el pie de la barra lateral.
  - **Alta Dinámica de Departamentos con Multi-Operadores y Supervisor:** Modal integral de creación de departamentos (`D-XX`) con captura de Takt Time, selección de supervisor responsable y asignación de múltiples operadores de piso mediante lista de verificación interactiva con alta rápida.
  - **Columna de Operadores Asignados en Configuración:** Vista tabular enriquecida que muestra las insignias de todos los operadores asignados a cada estación de trabajo.
- **`v2.8.3` (2026-09-24):**
  - **Barra Lateral Plegable (Icon-Only Mode):** Integración de botón toggle en encabezado del sidebar para colapsar la barra lateral a 72px, ganando espacio horizontal en piso y persistiendo en `localStorage`.
  - **Versión del Sistema Prominente y de Alto Contraste:** Rediseño del badge `.system-version-pill` con fondo sólido de marca `#8B5E3C` y texto `#FFFFFF` en negrita, garantizando total visibilidad en el navbar.
  - **Enfoque de Diseño Tablet-First y 100% Responsivo:** Adaptación ergonómica integral para pantallas táctiles de 768px a 1024px, zonas táctiles mínimas de 44px para dedos, y desplazamiento horizontal táctil suave en tablas de datos y sub-pestañas.
  - **Supresión de Menciones de Hardware Específico:** Eliminación de los términos "iPad" y "Tablet" en la interfaz gráfica, estandarizando la terminología industrial neutra (*Terminal de Planta*, *Cámara de tu dispositivo*).
  - **Seguridad RBAC por Ocultamiento Estricto:** Los módulos a los que el usuario no tiene acceso no muestran candados ni advertencias disuasorias; se ocultan completamente del menú de navegación.
- **`v2.8.2` (2026-09-24):**
  - **Corrección de Cuadrícula Principal (Frontend):** Remoción de etiqueta `</div>` sobrante en el sidebar que provocaba la ruptura del layout principal y el desplazamiento vertical hacia abajo.
  - **Ajuste de Superposición en Tarjetas Viajeras:** Modificación del margen del encabezado departamental (`padding: 0 46px 6px`) para garantizar total legibilidad cuando está presente el sticker circular del operador.
  - **Lote Madre 60 Piezas (Magnum · Melany):** Incorporación del lote `49,842` correspondiente a la ruta Prensas a Patio, con 60 piezas completas, sticker magenta y recuadro inferior derecho vacío.
- **`v2.8.1` (2026-09-23):**
  - **Réplica Física de Tarjeta Viajera (Evidencia Fotográfica de Planta):** Implementación de la vista idéntica de la tarjeta con mica protectora, orificio para cordel, sticker de operador (`JORGE`), ruta departamental `TARJETA HIDRÁULICAS - ADORNO`, lote y especificaciones (`FALDA: 9.0 Cm` / `9 1/2`, `DOBLADO: ABAJO` / `ARRIBA`).
  - **Regla Visual de Lote vs Sublote:**
    - **Lote Madre (ej. 49,386 Chaparral):** El recuadro inferior derecho NO tiene número.
    - **Sublote (ej. 49,633-3 Viejonón):** El recuadro inferior derecho muestra el número del sublote (`3`).
  - **Hormas Reales de Fábrica:** Incorporación de las hormas de aluminio de los racks de planta (`#54 JOHNSON LONA`, `#53 JOHNSON LONA`, `#57 SONORA`, `#53 CHAPARRAL LONA`, `#56 CHAPARRAL`, `#55 VIEJONON`) y prensas `Michelagnoli`.
- **`v2.8.0` (2026-09-23):**
  - **Navegación Interna por Sub-Pestañas:** Implementación de sub-tabs en los 5 módulos para una navegación limpia sin saturación visual.
  - **Meta Semanal:** Reemplazo de meta diaria rígida por Meta Semanal (4,250 pzas/semana) editable desde configuración y visible en Andon.
  - **Flujo de Planta Departamental:** Modelo de trabajo en máquina por operadores, depósito en almacén intermedio de salida y recolección para traspaso al siguiente departamento.
  - **Lector QR de Pantalla Completa:** Visor en vivo con cámara web mediante `getUserMedia` y retícula visual industrial compatible con cualquier dispositivo.
  - **Asignación Departamental por Supervisor:** Los supervisores solo operan en sus departamentos asignados (D-01 a D-04 o D-05 a D-08). Ingeniería tiene alcance global y puede crear supervisores (pero no ingenieros).
  - **Padrón de Operadores de Planta:** Registro de mano de obra con número de nómina, departamento y máquina asignada (sin acceso/login al sistema).
  - **Catálogo de Hormas y Moldes:** Registro de hormas (Denver, Bullrider, Viejonón, Laredo, etc.) con asignación a prensas de vapor.
  - **KPIs Exclusivos:** Panel de rendimiento restringido a Ingeniería y Dirección.
  - **Prohibición de Alertas Nativas:** Supresión total de `alert()`, `confirm()` y `prompt()`; estandarización con notificaciones toast y modales in-app `UanifyUI`.
- **`v2.7.0` (2026-09-23):**
  - Estandarización total a Turno Único (07:00 a 15:30 hrs).
  - Incorporación de insignias visibles de versión `v2.7.0` en sidebar y footer.
  - Creación del Documento Maestro `SISTEMA_TOMBSTONE_MES.md`.
  - Aplicación de regla de cursor interactivo universal `cursor: pointer !important`.
- **`v2.6.0` (2026-09-23):**
  - Sistema de Roles y Permisos Modulares (RBAC): Admin, Ingeniero y Supervisor.
  - Tabla de administración de usuarios y modal para editar accesos módulo por módulo.
  - Bloqueo contextual de pestañas no autorizadas.
- **`v2.5.0` (2026-09-23):**
  - Rediseño a Light Theme Tradicional Moderno Contemporáneo (Cuero Artesanal `#8B5E3C`).
  - Navegación lateral izquierda fija con soporte responsivo para tablet.
  - Supresión completa de sonidos y pedales físicos.
  - Módulo iPad para escaneo de lotes en rampa con tarjeta viajera QR.
- **`v2.0.0` (2026-09-21):**
  - Modelado de 14 departamentos de planta y fraccionamiento 60 a 15 pzas.
  - Catálogo de 18 hormas de aluminio.
- **`v1.0.0` (2026-09-21):**
  - Prototipo inicial de Tablero Andon y simulador de planta.
