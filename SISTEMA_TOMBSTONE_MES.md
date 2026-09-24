# 🤠 SISTEMA TOMBSTONE MES · DOCUMENTO MAESTRO DE ARQUITECTURA Y PROYECTO
> **Fuente Única de Verdad (Single Source of Truth) para el Desarrollo, Reglas de Negocio y Operación de Planta**  
> **Versión Actual:** `v2.8.1` | **Fecha de Actualización:** 23 de Septiembre de 2026  
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
[Ingeniero (Carlos)]     ───► Tablero Andon + Consola Ingeniería + Dirección/COMPAC
[Supervisor (Juan M.)]   ───► Tablero Andon + Terminal iPad (Lotes & QR) [Tabs Bloqueadas con Candado]
```

### Tabla de Usuarios Preconfigurados
| Usuario ID | Nombre | Rol | Permisos por Defecto | Estado |
|---|---|---|---|---|
| `admin-1` | **Edmundo González** | `admin` (👑 Administrador) | `andon`, `terminal`, `engineer`, `executive`, `config` | Activo |
| `ing-1` | **Ing. Carlos Ortiz** | `ingeniero` (⚡ Ingeniero de Producción) | `andon`, `engineer`, `executive` | Activo |
| `sup-1` | **Juan Manuel Pérez** | `supervisor` (📱 Supervisor de Línea) | `andon`, `terminal` | Activo |

### Comportamiento de Seguridad en UI:
- Los botones de navegación de pestañas no autorizadas muestran un icono de candado (`🔒`) y un badge "Bloqueado por Rol".
- Al intentar acceder a un módulo restringido, se muestra un banner de seguridad con el rol requerido y la instrucción de solicitar permisos al Administrador.
- El Administrador puede abrir el modal `modalEditPermissions` para marcar/desmarcar módulos individualmente para cualquier usuario, o dar de alta nuevos supervisores con `modalCreateUser`.

---

## 🖥️ 5. Arquitectura de Hardware en Nave Industrial

Siguiendo las decisiones tomadas en planta con base en los audios de levantamiento:

1. **Pantalla Central Andon (Smart TV 50"):**
   - Instalada en la viga central de la nave entre prensas y rampa.
   - Proyecta continuamente el **Módulo 1: Tablero Andon Digital**.
   - Visibilidad a 20 metros de distancia: semáforos verde/amarillo/rojo, piezas producidas vs meta del turno (850 pzas) y gráfico hora por hora.
2. **Terminales Portátiles para Supervisores (iPad 10.2" / Android Rugged):**
   - Funda industrial de uso rudo anticaídas.
   - Utilizadas por supervisores en **Rampa (D-05)** y **Almacén Pulmón (D-10)**.
   - Escaneo mediante cámara del iPad o lector láser Bluetooth de código de barras/QR adherido a la tarjeta viajera.
3. **Cero Pedales Físicos:**
   - Se descartó la instalación de pedales o pulsadores cableados en máquinas para evitar tropiezos, paros por mantenimiento de cables y desbalanceo en puestos manuales.
4. **Cero Alertas Sonoras:**
   - La planta de San Francisco del Rincón tiene ruido ambiente de vapor y motores. Las alertas sonoras generan fatiga auditiva innecesaria; el sistema emplea semáforos visuales de alto contraste.

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
  - **Cache Busting Automático:** Para evitar que la CDN de GitHub Pages entregue hojas de estilo o scripts cacheados, todos los links y scripts en `index.html` incluyen el parámetro de versión `?v=2.8.1`.

---

## 📜 8. Historial de Versiones (SemVer)

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
