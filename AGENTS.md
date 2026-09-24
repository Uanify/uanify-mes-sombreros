# Reglas Maestras de Desarrollo · Uanify MES Tombstone Hats

Este archivo unifica y formaliza las directrices de ingeniería, arquitectura, diseño y operación para el desarrollo del sistema **Tombstone Hats MES** desarrollado por **Uanify**.

---

## REGLA 0: Mentalidad de Producción Real para Usuarios Finales (MANDATORIA)

**SIEMPRE trabajar como si esto fuera la versión productiva que van a usar clientes reales y que pagan dinero, desde el primer día.**

1. **Cero textos de prueba visibles:** Queda estrictamente prohibido mostrar "demo", "ejemplo", "placeholder", "mock", "prueba" o "modo local" en interfaces de usuario final.
2. **Sin accesos de prueba o bypass de desarrollador expuestos:** La pantalla y el panel deben verse 100% como un software comercial terminado de clase industrial.
3. **Sin datos artificiales obvios (Estándar de Oro Clúster Sombrerero San Francisco del Rincón):** 
   - Modelos reales: *1000X Master Telar Denver, El Viejonón, Laredo, Frontier, Bullrider*.
   - Hormas de aluminio: *Denver 4 1/4", Bullrider 4 1/2", Low Crown, Texana Tradicional*.
   - Flujo de planta: *Engomado, Prensas, Troquelado, Almacén Intermedio Rampa (fraccionamiento 60 a 15 pzas), Ribeteado de Tafilete, Calidad Final y Enlace COMPAC*.
4. **Cada pantalla debe estar lista para operar en piso o sala de juntas:** Si Edmundo González o el Ingeniero de Producción entran a la plataforma, deben ver un sistema operativo, coherente y robusto.

---

## REGLA 0.1: Prioridad a Opciones Gratuitas y Escalables ($0 USD Inicial)

**SIEMPRE implementar la opción gratuita, funcional y con capacidad de escalar a futuro.**

1. **Costo $0 USD por defecto:** Todo componente, librería, base de datos y despliegue debe utilizar tiers gratuitos y código abierto (ej. GitHub Pages, Edge Local en navegadores de piso, exportación nativa de datos sin APIs de cobro recurrente).
2. **Diseño con capacidad de escalar:** La arquitectura debe ser modular y limpia para que, cuando la planta requiera servidores locales IP65 o integración COMPAC en red local, la transición sea inmediata.
3. **ALERTA DE PAGO OBLIGATORIA (MÁXIMA PRIORIDAD):**
   > [!CRITICAL]
   > **Si para cualquier funcionalidad, herramienta o servicio es necesario pagar algo o incurrir en costos recurrentes, SE LE DEBE INFORMAR A ANDRÉS CON MÁXIMA PRIORIDAD ANTES DE IMPLEMENTARLO O CONTRATARLO.** Jamás asumir o comprometer gasto alguno sin su aprobación explícita previa.

---

## REGLA 0.2: Apariencia Light Mode Tradicional Moderno Contemporáneo (#8B5E3C) & Cero Sonidos

**La identidad visual principal es Light Mode con el color de marca Cuero Artesanal `#8B5E3C` y acentos ámbar/slate.**

### 1. Requisitos de Modo Claro Industrial
- **Tema Claro por defecto:** Interfaz limpia, clara y luminosa (`background: #F8FAFC`, tarjetas `#FFFFFF`), con textos oscuros legibles (`#0F172A`) y acentos de contraste en gris pizarra (`#1E293B`, `#334155`).
- **Prohibición de Fondos Oscuros Residuales:** Queda prohibido el uso de temas oscuros o contenedores negros tipo arcade en el tablero Andon y módulos de gestión.
- **Cero Audio o Alertas Sonoras:** La planta no debe emitir ruidos molestos ni voces sintéticas; las alertas son estrictamente visuales (semáforos Andon, pills pulsantes y badges de estado).

### 2. Versión del Sistema y Cursor Interactivo
- **Versión del Sistema Visible:** En el encabezado del sidebar (`.system-version-pill`) y en el pie de página (`.footer-version-tag`), la versión SemVer del sistema (ej. `v2.7.0`) debe estar claramente visible en todo momento.
- **REGLA DE CURSOR INTERACTIVO (OBLIGATORIA):**
  > [!CRITICAL]
  > **Todo elemento clickeable (botones, enlaces `<a>`, selectores, tabs, tarjetas con acción) DEBE mostrar `cursor: pointer !important` al pasar el mouse por encima.** Jamás dejar un botón o tarjeta interactiva con cursor por defecto.

---

## REGLA 0.3: Control de Versiones Automático (Version Bump Obligatorio)

- Al completar cualquier conjunto relevante de cambios, nueva feature, corrección de bug o refactorización, **se debe incrementar el número de versión (SemVer)** de la aplicación (ej. `2.6.0` -> `2.7.0`).
- La versión debe mantenerse estrictamente sincronizada en:
  1. `package.json` (campo `"version"`).
  2. `index.html` (badge `.system-version-pill` en sidebar y `.footer-version-tag` en footer, y query params de assets CSS/JS `?v=X.Y.Z` para cache busting en GitHub Pages).
  3. `js/app.js` (propiedad `UanifyState.version`).
  4. `README.md` (badge de versión del encabezado y sección Changelog).

---

## REGLA 0.4: Operación Consolidada en Turno Único & RBAC

1. **Régimen de Operación:** La planta opera formalmente en **Turno Único (07:00 a 15:30 hrs · Lunes a Viernes)**, con un receso/comida programado de 12:00 a 12:45 hrs.
   - Meta diaria del turno: **850 piezas/día**.
   - Takt Time estándar: **42 segundos por pieza**.
   - Queda prohibido reactivar selectores de turnos múltiples ficticios.
2. **Seguridad Basada en Roles (RBAC):**
   - **Administrador (👑 Admin):** Acceso a todos los módulos y capacidad exclusiva de gestionar usuarios y editar permisos.
   - **Ingeniero de Producción (⚡ Ingeniero):** Acceso a Tablero Andon, Ingeniería & Subensambles y Dirección & COMPAC.
   - **Supervisor de Línea (📱 Supervisor):** Acceso a Tablero Andon y Terminal iPad de Lotes y Almacenes; pestañas restringidas bloqueadas con candado y aviso de seguridad.

---

## REGLA 0.5: Cero Fallos en Compilación y Despliegue (Build & Deployment Hygiene)

- **Validación previa obligatoria:** Verificar que no existan errores de sintaxis, imports rotos ni inconsistencias de DOM antes de desplegar.
- **Despliegue a Producción:** Tras confirmar los cambios, realizar commit y push a la rama `main` en `https://github.com/Uanify/uanify-mes-sombreros.git` y verificar con el subagente de navegación en `https://uanify.github.io/uanify-mes-sombreros/`.
