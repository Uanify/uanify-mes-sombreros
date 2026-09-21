# 🏭 Uanify MES · Control de Producción y Tablero Andon
### Prototipo Digital para Fábrica de Sombreros y Accesorios en San Francisco del Rincón, Gto.

Prototipo interactivo desarrollado por **[Uanify](https://github.com/Uanify)** para el levantamiento y validación en piso con **Dirección (Edmundo)** y el **Ingeniero de Producción**.

---

## 🎯 Objetivo de la Demostración

Demostrar en vivo cómo la sustitución de pizarrones físicos y hojas de papel por un **Sistema MES Ligero & Edge IoT** genera:
1. **Visibilidad en tiempo real (100% en vivo)** en pantallas TV de planta y dispositivos móviles.
2. **Ergonomía a prueba de planta (Poka-Yoke):** Conteo infalible con pedales o botoneras industriales en prensas de vapor sin pantallas táctiles frágiles.
3. **Métricas duras para Ingeniería:** Cálculo automático de **OEE (Disponibilidad × Rendimiento × Calidad)** y detección visual de cuellos de botella (WIP).
4. **Traducción Financiera para Dirección:** Valor monetario de la producción diaria ($ MXN), costo de mermas y reducción de horas de oficina.

---

## 🚀 Las 4 Vistas del Prototipo

| Módulo | Audiencia | Características Principales |
|---|---|---|
| **1. 📺 Tablero Andon (Piso)** | Operarios y Supervisores | Diseñado para Smart TV de 50" en nave central. Reemplaza los pizarrones de tiza. Semáforo Verde/Amarillo/Rojo, avance hora por hora y ritmo *Takt Time*. |
| **2. ⚙️ Terminal Puesto / Prensas** | Operarios de Estación | Simulador de **Pedal Mecánico de Prensa** (+1 Sombrero OK). Modal para reportar mermas (quemado por vapor, rotura) y paros de máquina (cambio de horma SMED, falta de vapor). *Atajo: Tecla ESPACIO o ENTER.* |
| **3. 📊 Consola de Ingeniería** | Ingeniero de Producción | Métricas OEE desagregadas (A: 94.2%, P: 91.8%, Q: 97.6%), visualizador de cuellos de botella entre estaciones y bitácora de paros no programados. |
| **4. 💼 Dashboard Ejecutivo** | Edmundo (Dirección) | KPIs financieros: Valor del lote ($275,400+ MXN), cumplimiento de pedidos B2B, retorno de inversión (Payback en 2.8 meses) y roadmap por fases. |

---

## 🎩 Procesos de Fabricación de Sombreros Modelados

El sistema refleja fielmente las 6 estaciones de la industria de San Pancho:
1. **Engomado & Apresto:** Inmersión y rigidez química de campanas de lana, palma o fieltro.
2. **Prensas de Hormado:** Moldeado con vapor de caldera a alta temperatura y prensas de calor.
3. **Corte & Planchado:** Troquelado circular de sobra de ala y asentamiento de falda.
4. **Ribeteado & Tafilete:** Costura de sudorera interior de piel/tela y ribete perimetral.
5. **Toquilla & Acabado:** Adorno exterior, forros interiores, herrajes y plancha final.
6. **Calidad & Empaque:** Inspección visual de defectos, etiquetado y encajonado mayorista.

---

## 🔌 Arquitectura de Hardware de Planta Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│ Prensas Térmicas: Pedales de pie o Sensores Inductivos      │
│ Puestos de Costura/Adorno: Botoneras Industriales IP65      │
│ Nave Central: Pantallas Smart TV 50" (Tablero Andon Kiosk)  │
│ Gateway de Planta: Mini PC / Raspberry Pi (Edge Broker local│
│                    con tolerancia a fallas de internet)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Ejecución Local y Despliegue

```bash
# Abrir directamente en navegador:
double-click index.html
```

*Desarrollado con arquitectura limpia, sin dependencias externas pesadas, compatible 100% con GitHub Pages y navegadores móviles.*
