# 🤠 Tombstone Hats MES · Control de Planta & Tablero Andon
### Digitalización Industrial para Planta Matriz Tombstone en San Francisco del Rincón, Guanajuato

[![Versión](https://img.shields.io/badge/Versi%C3%B3n-2.7.0-8B5E3C?style=flat-square&logo=git)](https://github.com/Uanify/uanify-mes-sombreros)
[![Despliegue](https://img.shields.io/badge/GitHub%20Pages-Live-green?style=flat-square)](https://uanify.github.io/uanify-mes-sombreros/)
[![Operación](https://img.shields.io/badge/R%C3%A9gimen-Turno%20%C3%9Anico-blue?style=flat-square)](https://uanify.github.io/uanify-mes-sombreros/)

Sistema MES interactivo desarrollado por **[Uanify](https://github.com/Uanify)** para la reunión de diagnóstico y levantamiento técnico con **Dirección (Edmundo)** y el **Ingeniero de Producción**.

- **Web Oficial del Cliente:** [Tombstone Hats](https://tombstone.mx/)
- **Demostración en Vivo:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)
- **Organización:** [Uanify](https://github.com/Uanify)

---

## 🎯 Caso de Uso Tombstone Hats

Tombstone Hats es una de las marcas insignia de sombreros, texanas y moda vaquera en México y EE.UU., fabricados en el clúster de San Francisco del Rincón.

Este prototipo MES resuelve el dolor operativo central identificado en el piso:
1. **Prensas de Hormado térmico y vapor:** Conteo automático e infalible con pedales/pulsadores Poka-Yoke de ciclos de prensado para modelos emblemáticos (*1000X Master Telar Denver, El Viejonón, Laredo, Frontier*).
2. **Sustitución de pizarrones manuales:** Pantallas Smart TV en la nave central con avance hora por hora, métricas de cumplimiento y Takt Time.
3. **Consola para el Ingeniero de Producción:** Detección de cuellos de botella entre hormado y ribeteado de tafilete, y cálculo automático del **OEE** (*Disponibilidad × Rendimiento × Calidad*).
4. **Visibilidad Financiera para Edmundo:** Conversión instantánea de texanas terminadas a valor monetario ($801,720+ MXN en lote del turno @ $1,310 catálogo Tombstone), costo de merma y payback proyectado en **2.1 meses**.

---

## 🚀 Módulos del Sistema

| Módulo | Usuario | Funcionalidad Clave |
|---|---|---|
| **1. 📺 Tablero Andon (Piso)** | Supervisores y Operarios | Pantalla de 50" en nave central. Estado en vivo de las 6 estaciones Tombstone, ritmo Takt Time (42s) y avance hora por hora. |
| **2. ⚙️ Terminal Puesto / Prensas** | Operarios de Estación | Simulador de **Pedal Mecánico de Prensas** (+1 Texana Tombstone OK). Selector de catálogo (Denver, Viejonón, Laredo, Frontier), reporte de mermas y paros de máquina (cambio de horma SMED, vapor). *Atajo: Tecla ESPACIO o ENTER.* |
| **3. 📊 Consola de Ingeniería** | Ingeniero de Producción | Métricas OEE desagregadas (A: 94.2%, P: 91.8%, Q: 97.8%), visualizador de cuellos de botella (WIP) y bitácora de minutos perdidos por paro. |
| **4. 💼 Dashboard Ejecutivo** | Edmundo (Dirección) | Métricas directivas en tiempo real: valor del lote ($801,720 MXN), cumplimiento de pedidos B2B mayoristas y propuesta comercial por fases. |

---

## 🎩 Proceso Productivo Tombstone Modelado

1. **Engomado & Apresto:** Inmersión y rigidez química de campanas y telares 1000X Master Telar.
2. **Prensas de Hormado:** Moldeado con vapor a alta temperatura en hormas Denver, Bullrider y Laredo.
3. **Troquelado de Falda & Plancha:** Corte circular de ala y asentado de falda de 4" a 4.5".
4. **Ribeteado & Tafilete:** Costura de badana interior de piel con estampado dorado Tombstone.
5. **Toquillas, Plumas & Herrajes:** Ensamble de toquilla de piel, plumas y pin plateado Tombstone.
6. **Inspección de Calidad & Cajas B2B:** Control de calidad de primera, etiquetado y empaque para mayoristas.

---

## 💻 Acceso Directo y Ejecución

- **Link para Tablet / Móvil:** [https://uanify.github.io/uanify-mes-sombreros/](https://uanify.github.io/uanify-mes-sombreros/)
- **Documentación Ejecutiva:** Consulta la carpeta `docs/` con las guías de descubrimiento y banco de proyectos adaptadas a Tombstone Hats.

---

## 📜 Historial de Versiones (Changelog)

### [2.7.0] - 2026-09-23
- **Estandarización a Turno Único:** Consolidación de toda la operativa a un solo turno formal (07:00 a 15:30 hrs · Lunes a Viernes), eliminando selectores obsoletos de turnos múltiples y ajustando descansos/comidas (12:00 a 12:45).
- **Control de Versiones y Cursor Interactivo:** Integración de la versión visible `v2.7.0` en sidebar y footer, badges sincronizados y regla obligatoria de `cursor: pointer` en todos los componentes interactivos.

### [2.6.0] - 2026-09-23
- **Sistema RBAC (Roles & Permisos Modulares):** Implementación de roles Admin (Edmundo), Ingeniero (Carlos) y Supervisor (Juan Manuel), con tabla de gestión de usuarios, edición de permisos granulares por módulo y bloqueo contextual de tabs.

### [2.5.0] - 2026-09-23
- **Rediseño Light Tradicional Moderno Contemporáneo:** Sustitución total del tema oscuro por interfaz limpia con tonos neutros cálidos, acentos cuero artesanal (`#8B5E3C`) y barra de navegación lateral izquierda fija.
- **Eliminación Total de Audio:** Supresión de sintetizadores de voz y alertas sonoras para un entorno de planta no invasivo.
- **Terminal iPad Móvil de Supervisores:** Reemplazo del modelo de pedal fijo por terminal digital táctil para escaneo de códigos QR en tarjetas viajeras.

### [2.0.0] - 2026-09-21
- **Modelado Real de Planta:** 14 departamentos, lotes madre de 60 pzas, fraccionamiento a sublotes de 15 pzas en rampa y catálogo de 18 hormas de aluminio.

### [1.0.0] - 2026-09-21
- **Lanzamiento Inicial:** Prototipo base de Tablero Andon, simulación de prensas y consola directiva.
