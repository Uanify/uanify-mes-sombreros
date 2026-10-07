# Banco Unificado de Dudas y Validaciones Técnicas
**Tombstone Hats MES · Preguntas Clave y Acuerdos de Planta**  
*Documento Unificado Oficial para Seguimiento Técnico con el Cliente.*

> **Versión:** `v2.44.0`  
> **Fecha:** 7 de Octubre de 2026  
> **Cliente:** Tombstone Hats (Edmundo González / Ing. Carlos Ortiz)  
> **Proveedor:** Uanify (Andrés Villanueva)

---

## 1. Mermas y Piezas de Segunda
1. **Alcance de Mermas y Segundas:**
   * *Estado:* Acordado registrar cantidad de piezas, motivo/causa raíz, estación y lote de origen como **histórico para KPIs y consulta**.
   * *Pregunta al Cliente:* ¿Requieren algún tratamiento adicional o integración posterior con almacén de CONTPAQi, o el registro histórico actual cubre al 100% su necesidad operativa?

## 2. Control de Calidad y Derivación de Rechazos
1. **Atribución de Decisión tras Rechazo:**
   * *Definición:* El Inspector de Calidad solo tiene atribución de **Aprobar** o **Rechazar**.
   * *Pregunta al Cliente:* Cuando un lote es rechazado en un filtro, ¿quién debe dictaminar en el sistema si se va a Reproceso, Segunda o Merma? ¿El Supervisor de área, el Ingeniero de Calidad, o indistintamente cualquiera de los dos?

## 3. Bitácora de Paros Productivos
1. **Criterios y Datos Obligatorios:**
   * *Definición:* Se capturará inicio, fin, máquina, operador y causa.
   * *Pregunta al Cliente:* ¿A partir de cuántos minutos de detención se debe exigir el registro de un paro (ej. paros mayores a 5 o 10 minutos)? ¿Desean un catálogo cerrado específico de motivos para su planta?

## 4. Ingesta de Órdenes e Impresión de Tarjetas
1. **Formato Físico de Tarjetas Viajeras:**
   * *Definición:* El sistema generará e imprimirá directamente las tarjetas con códigos QR desde la vista de programación en hojas de oficina para recortar e introducir en micas.
   * *Validación con el Cliente:* ¿Qué medidas físicas exactas tienen las micas plásticas actuales de planta para calibrar los márgenes de impresión?

## 5. Autenticación y Acceso en Piso
1. **Método de Login en Terminales:**
   * *Definición:* Se contemplan 3 perfiles: Ingeniero Admin (acceso total), Supervisor de Planta e Inspector de Calidad.
   * *Pregunta al Cliente:* En las terminales táctiles compartidas, ¿prefieren inicio de sesión mediante PIN numérico de 4 dígitos por supervisor/inspector, o selección de usuario con contraseña alfanumérica?
