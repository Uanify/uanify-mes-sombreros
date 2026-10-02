# Tombstone Hats MES · Glosario y Diccionario Oficial de Términos

> **Documento Oficial de Homologación Terminológica y Léxico de Planta**  
> **Versión del Sistema:** `v2.40.0` | **Fecha de Emisión:** 2 de Octubre de 2026  
> **Cliente:** Tombstone Hats (San Francisco del Rincón, Guanajuato)  
> **Interlocutores:** Edmundo González ("Mundo", Director General) e Ing. Carlos Ortiz (Jefe de Producción e Ingeniería)  
> **Objetivo:** Concentrar y contrastar los términos del software frente al vocabulario real utilizado por los trabajadores, supervisores y directivos en el piso de producción, identificando discrepancias para validación y ratificación inmediata.

---

## Guía de Interpretación de Estatus de Homologación

Cada término cuenta con un indicador de validación con el cliente:
- **`[CONFIRMADO EN PLANTA]`**: Término extraído directamente de grabaciones de audio en piso, pizarrones físicos de fábrica o minutas de levantamiento con Edmundo / Carlos Ortiz.
- **`[PROPUESTA MES / TÉCNICO]`**: Término informático o estándar industrial (ISA-95 / Lean Manufacturing) empleado en la arquitectura del software que debe ser confirmado con el cliente para verificar si en su fábrica lo llaman de otra manera.
- **`[POR VALIDAR CON CLIENTE]`**: Término con posibles variaciones regionales (San Francisco del Rincón / León) o discrepancia entre el ERP y la jerga de piso.

---

## 1. Términos de Producto, Materiales y Anatomía del Sombrero

| Término en Software MES | Término Real en Planta / Alternativa | Estatus | Definición Operativa | Pregunta de Confirmación para el Cliente |
|---|---|---|---|---|
| **Copa** | Copa / Corona | `[CONFIRMADO EN PLANTA]` | Parte superior del sombrero que cubre la cabeza. Se troquela y horma con calor y vapor en moldes de aluminio. | ¿En órdenes de producción siempre se rotula como "Copa" o utilizan también "Corona"? |
| **Falda** | Falda / Ala | `[CONFIRMADO EN PLANTA]` | Parte exterior circular del sombrero que da la sombra. Se corta perimetralmente en pulgadas (ej. 3.5", 4", 4 1/4", 4.5"). | ¿En las tarjetas viajeras prefieren el término tradicional "Falda" o también se le dice "Ala"? |
| **Telar Shantung 1000X** | Telar / Papel Telar / Rollo | `[CONFIRMADO EN PLANTA]` | Hilo de papel arroz tratado con celulosa trenzado en patrones finos (~70% de la producción de Tombstone). | ¿El material principal se documenta como "Telar Shantung", "Master Telar" o sólo "Telar"? |
| **Campana** | Campana de Fieltro / Cono | `[CONFIRMADO EN PLANTA]` | Estructura cónica de lana o pelo preformada que se adquiere como materia prima cerrada, omitiendo corte y engomado inicial. | ¿Las campanas de fieltro ingresan con código de material propio o se les asigna O.P. directa en prensas? |
| **Tafilete** | Tafilete / Badana | `[CONFIRMADO EN PLANTA]` | Banda interior de piel genuina de cabra o res con costura perimetral que se ajusta a la cabeza y define la talla exacta (54 a 61). | ¿En almacén le llaman exclusivamente "Tafilete" o el personal de adorno también lo nombra "Badana"? |
| **Toquilla** | Toquilla / Cintillo / Cinto | `[CONFIRMADO EN PLANTA]` | Cinto exterior decorativo que abraza la base de la copa (fieltro, piel, crin de caballo o herrajes metálicos de 3 piezas). | ¿Las toquillas se manejan como subensamble codificado o como accesorio final? |
| **Alambre de Memoria** | Alambre galvanizado / Alambrado | `[CONFIRMADO EN PLANTA]` | Alambre metálico que se inserta y cose en el borde de la falda (D-02) para permitir doblar el ala sin que pierda curvatura. | ¿Utilizan calibre único de alambre o varía según si el sombrero es de telar o lona? |
| **Dope / Apresto** | Dope / Engomado / Goma | `[CONFIRMADO EN PLANTA]` | Solución química adhesiva/selladora en la que se sumergen los lienzos de telar (D-03) para dar rigidez termoactivable. | En las tinas químicas de D-03, ¿el término oficial en planta es "Dope", "Apresto" o "Engomado"? |
| **Curva de Doblado** | Doblado / Quebrado / Planchado | `[CONFIRMADO EN PLANTA]` | Configuración geométrica de la falda (ej. "ARRIBA", "ABAJO", "PLANO", "TEXANA"). | En las tarjetas viajeras aparece "DOBLADO: ABAJO" o "ARRIBA". ¿Hay otros términos oficiales como "Levantado"? |

---

## 2. Términos de Maquinaria, Hormas y Utillaje

| Término en Software MES | Término Real en Planta / Alternativa | Estatus | Definición Operativa | Pregunta de Confirmación para el Cliente |
|---|---|---|---|---|
| **Horma de Aluminio** | Horma / Molde Maquinado | `[CONFIRMADO EN PLANTA]` | Pieza metálica maquinada en fundición de aluminio según siluetas vaqueras (Denver, Bullrider, Viejón, Chaparral, Laredo, etc.). | ¿En piso le llaman "Horma", "Molde" o indistintamente ambos? |
| **Prensa Michelagnoli** | Prensa Hidráulica / Prensa de Vapor | `[CONFIRMADO EN PLANTA]` | Prensas térmicas de alta presión y vapor utilizadas para fusionar copa y falda y dar forma definitiva al sombrero. | ¿Tienen identificadas las prensas por número (#1, #2, #3) o por marca (Michelagnoli)? |
| **Prensas Secas** | Prensas Secas | `[CONFIRMADO EN PLANTA]` | Prensas sin inyección de vapor utilizadas para replanchado de copas y unión preliminar previo al acabado final. | En el pizarrón de piso dice *"1000 X M.T PRENSAS SECAS"*. ¿Desean conservar este nombre exacto en el Andon? |
| **Cambio de Horma (SMED)** | Cambio de Modelo / Ajuste de Horma | `[PROPUESTA MES / TÉCNICO]` | Tiempo muerto programado (10 a 15 minutos) requerido para desatornillar un molde frío/caliente, colocar el nuevo y esperar temperatura. | En las bitácoras de paros, ¿los supervisores anotan "Cambio de Horma", "Ajuste de Molde" o "Cambio de Modelo"? |
| **Rampa** | Rampa / Mesa de Ensamble | `[CONFIRMADO EN PLANTA]` | Zona física ubicada inmediatamente antes de las prensas donde se reciben los lotes de 60 piezas y se dividen en sublotes de 15. | ¿La rampa se considera una estación formal o una mesa de amortiguamiento logístico de D-05? |
| **Túnel de Secado / Horno** | Túnel Infrarrojo / Horno de Curado | `[CONFIRMADO EN PLANTA]` | Equipo térmico continuo para curar la laca y pintura tras la aplicación de brillo y acabados. | ¿El tiempo de permanencia en el túnel es fijo o varía según el clima/humedad ambiente? |

---

## 3. Términos de Producción, Lotes y Trazabilidad

| Término en Software MES | Término Real en Planta / Alternativa | Estatus | Definición Operativa | Pregunta de Confirmación para el Cliente |
|---|---|---|---|---|
| **Lote Madre** | Lote / Torre de 60 / Pedido | `[CONFIRMADO EN PLANTA]` | Conjunto de 60 piezas que viaja junto desde el corte de materia prima (D-01) hasta la rampa de prensas (D-05). | En piso le llaman "Lote", "Torre" o "Lote Madre". ¿Cuál prefieren en el encabezado de las pantallas? |
| **Sublote** | Fracción de 15 / Sublote / Docena | `[CONFIRMADO EN PLANTA]` | Fracción de 15 sombreros en que se divide el lote madre en rampa. 15 piezas caben perfectamente en las mesas de adorno. | En las tarjetas aparece el número grande "1, 2, 3, 4". ¿En piso dicen "Sublote 3" o "Fracción 3"? |
| **Tarjeta Viajera** | Tarjeta de Producción / Boleta / Vale | `[CONFIRMADO EN PLANTA]` | Documento físico de cartulina protegido dentro de una mica cosida con cordel que acompaña obligatoriamente a cada lote. | En fábrica dicen "Tarjeta Viajera". ¿Hay alguna sección que la llame "Boleta" o "Hoja de Ruta"? |
| **Mica Protectora** | Mica / Funda de Lona | `[CONFIRMADO EN PLANTA]` | Funda de plástico transparente de alta resistencia con borde cosido en lona que resguarda la tarjeta del vapor, adhesivo y polvo. | ¿Las micas se reutilizan indefinidamente al llegar al almacén de producto terminado? |
| **Sticker de Operador** | Sticker / Pegatina / Calca de Destajo | `[CONFIRMADO EN PLANTA]` | Etiqueta adhesiva circular o rectangular de color con el nombre del trabajador (ej. JORGE, MELANY) que valida su pago por destajo. | ¿El sticker se compra preimpreso con el nombre del operario o ellos lo escriben con plumón? |
| **Destajo** | Pago por Pieza / Destajo | `[CONFIRMADO EN PLANTA]` | Esquema de remuneración a los operarios de prensas y adorno en función del número exacto de sombreros procesados y validados. | ¿La tarifa de destajo es plana por sombrero o cambia según el modelo (ej. Denver vs Bullrider)? |
| **Orden de Producción (O.P.)** | O.P. / Pedido / Orden de Corte | `[CONFIRMADO EN PLANTA]` | Número maestro emitido por Planeación/Ingeniería que agrupa los lotes requeridos para surtir una orden mayorista. | ¿El folio de O.P. proviene de un Excel interno o se genera automáticamente en CONTPAQi Comercial? |

---

## 4. Términos de Calidad, Rechazos y Salidas Comerciales

| Término en Software MES | Término Real en Planta / Alternativa | Estatus | Definición Operativa | Pregunta de Confirmación para el Cliente |
|---|---|---|---|---|
| **Merma / Scrap** | Merma / Basura / Desecho / Roto | `[CONFIRMADO EN PLANTA]` | Pieza con defecto crítico no recuperable (quemada en prensa, rasgada en telar) que se destruye o desecha. | ¿En los reportes de Carlos Ortiz se registra como "Merma" o como "Scrap"? |
| **Sombrero de Segunda** | Segunda / Remate / Saldo / Barata | `[CONFIRMADO EN PLANTA]` | Sombrero con imperfección estética menor no apto para pedido A, pero vendido los viernes en mostrador a precio de recuperación. | ¿En almacén D-12 le llaman formalmente "Segundas" o "Lotes de Remate"? |
| **Compostura / Retrabajo** | Compostura / Retrabajo / Corrección | `[CONFIRMADO EN PLANTA]` | Pieza desviada temporalmente a la estación anterior para corregir rebaba, hilo suelto o gota de pintura antes de continuar. | ¿La compostura se le descuenta de destajo al operador que cometió el detalle o sólo se le exige corregirla? |
| **Filtro de Calidad (C-01 a C-04)** | Mesa de Inspección / Calidad | `[PROPUESTA MES / TÉCNICO]` | Puntos de control intermedios obligatorios donde se detiene el lote para validar tolerancias antes de pasar a la siguiente fase. | ¿En la nave dicen "Filtro de Calidad", "Mesa de Revisión" o "Paso por Calidad"? |
| **Vale de Traspaso** | Vale de Movimiento / Remisión Interna | `[CONFIRMADO EN PLANTA]` | Comprobante físico o digital que ampara la transferencia de producto entre almacenes intermedios o entrega a camioneta. | ¿Actualmente los vales de salida a camioneta se llenan en libreta de notas o en talonario foliado? |

---

## 5. Términos de Roles, Supervisión y Sistema

| Término en Software MES | Término Real en Planta / Alternativa | Estatus | Definición Operativa | Pregunta de Confirmación para el Cliente |
|---|---|---|---|---|
| **Supervisor de Piso** | Supervisor de Línea / Encargado de Nave | `[CONFIRMADO EN PLANTA]` | Responsable operativo de tramos departamentales (ej. Roberto D-01 a D-04; Juan Manuel D-05 a D-08). Porta la tablet. | ¿Tienen nombramiento formal de "Supervisores" o de "Jefes de Área"? |
| **Operador de Planta** | Operario / Mano de Obra / Trabajador | `[CONFIRMADO EN PLANTA]` | Personal técnico manual en máquinas. Tienen No. de Nómina pero no credenciales de login al software. | ¿Se les identifica internamente como "Operadores", "Operarios" o "Personal de Piso"? |
| **Takt Time** | Ritmo / Cadencia / Segundos por Pieza | `[PROPUESTA MES / TÉCNICO]` | Métrica de ingeniería (42 segundos estándar) para cumplir la meta de 850 sombreros diarios en 465 minutos netos. | ¿El concepto "Takt Time" es utilizado por los supervisores o prefieren llamarle "Ritmo de Salida"? |
| **Tablero Andon** | Pizarrón de Piso / Pantalla Andon | `[CONFIRMADO EN PLANTA]` | Pantalla visual que proyecta en tiempo real los semáforos de las 14 estaciones, avance de piezas y estado hora por hora. | En planta tienen un pizarrón blanco manual. ¿Al sistema digital le llaman formalmente "Tablero Andon"? |
| **Terminal de Supervisor** | Escáner / Kiosko Tablet / iPad de Piso | `[PROPUESTA MES / TÉCNICO]` | Aplicación web en modo pantalla completa donde el supervisor escanea el código QR de las tarjetas viajeras. | ¿El personal de piso se refiere a este dispositivo como "La Tablet", "El Escáner" o "La Terminal"? |
| **Turno Único** | Turno de Día / Jornada Normal | `[CONFIRMADO EN PLANTA]` | Jornada laboral oficial de Lunes a Viernes de 07:00 a 15:30 hrs con 45 min de comida (12:00 a 12:45 hrs). | ¿Queda 100% descartado que en temporadas altas (Navidad / Feria) se habilite un segundo turno nocturno? |
| **COMPAC / CONTPAQi** | El Sistema / El Comercial / COMPAC | `[CONFIRMADO EN PLANTA]` | Sistema ERP administrativo y comercial donde la empresa emite facturas, timbra y lleva inventarios fiscales. | En las grabaciones dicen "El COMPAC". ¿El sistema comercial específico es CONTPAQi Comercial Premium? |

---

## 6. Hallazgos Terminológicos y Recomendaciones para la Reunión con Edmundo y Carlos

1. **"Falda" vs "Ala":** En el argot sombrerero de Guanajuato, muchos clientes finales dicen "Ala", pero en las tarjetas impresas de Tombstone dice `"FALDA: 9.0 Cm"` o `"FALDA: 4 1/4"`. Se recomienda mantener **Falda** en la interfaz para apegarse a su documentación física.
2. **"Lote Madre" vs "Lote":** En el software se utiliza "Lote Madre" para distinguirlo del "Sublote" de 15 piezas. Es vital confirmar si los supervisores entienden "Lote Madre" o si prefieren "Lote Completo (60 pzas)".
3. **"Dope":** Es un término técnico heredado de la industria textil y aeronáutica que en planta usan para la resina de rigidez. Se recomienda mantenerlo con la leyenda complementaria "Engomado / Dope".
4. **"Takt Time":** Mientras que Carlos Ortiz (Ingeniero) domina la terminología Lean (`Takt Time: 42s`), los supervisores de piso se orientan más por `"Piezas por Hora" (ej. 100 pzas/hora)`. En el Tablero Andon se recomienda mostrar ambos valores.
