# Project TODO

## Estructura de datos y componentes base
- [ ] Copiar base de datos de motores al proyecto
- [ ] Crear tipos TypeScript para motores FXM y FKM
- [ ] Diseñar interfaz de usuario con tema corporativo
- [ ] Implementar componente de búsqueda de motores FXM

## Funcionalidad de búsqueda y conversión
- [ ] Crear lógica de búsqueda y filtrado de motores FXM
- [ ] Implementar algoritmo de conversión FXM a FKM equivalente
- [ ] Mostrar resultados de conversión con opciones FKM

## Generador de reportes comparativos
- [ ] Diseñar plantilla de reporte comparativo
- [ ] Implementar comparación de especificaciones técnicas
- [ ] Mostrar diferencias en dimensiones (L, AC, N, D, E, M)
- [ ] Comparar características eléctricas (Mo, Mn, Mp, Io, rpm, J, Pcal)
- [ ] Generar reporte en formato PDF
- [ ] Generar reporte en formato Excel
- [ ] Añadir soporte multiidioma (ES, EN, EU, FR, DE, IT, ZH, PT)

## Pruebas y validación
- [ ] Probar búsqueda de motores FXM
- [ ] Validar conversión a FKM equivalentes
- [ ] Verificar generación de reportes PDF
- [ ] Verificar generación de reportes Excel
- [ ] Probar cambio de idioma

## Diseño Profesional FAGOR
- [x] Copiar logo de FAGOR al proyecto
- [x] Actualizar header con logo FAGOR (izquierda) y dirección USA (derecha)
- [x] Aplicar esquema de colores corporativo de FAGOR (rojo y negro)
- [x] Mejorar diseño profesional de la aplicación
- [x] Aplicar títulos en ROJO (color FAGOR)
- [x] Usar fuente Arial en toda la aplicación
- [x] Títulos en BOLD con color blanco donde sea apropiado

## Exportación de Reportes
- [x] Instalar librerías jsPDF y xlsx
- [x] Implementar exportación a PDF con membrete FAGOR
- [x] Implementar exportación a Excel con membrete FAGOR
- [x] Incluir logo y datos de FAGOR en reportes exportados

## Filtros Avanzados
- [x] Agregar filtro por rango de torque (Mo)
- [x] Agregar filtro por rango de velocidad (RPM)
- [x] Agregar filtro por dimensiones específicas
- [x] Implementar UI de filtros avanzados

## Diagramas Técnicos
- [x] Crear componente de diagrama dimensional
- [x] Mostrar comparación visual de dimensiones FXM vs FKM
- [x] Agregar leyendas y anotaciones técnicas

## Correcciones Urgentes
- [x] Corregir lógica de búsqueda para soportar diferentes formatos de modelo
- [x] Hacer búsqueda más flexible (ignorar mayúsculas, espacios, puntos)
- [x] Validar que la búsqueda funcione con FXM75.30A.E1.000

## Búsqueda Bidireccional FXM ↔ FKM
- [x] Implementar detección automática del tipo de motor (FXM o FKM)
- [x] Crear función de búsqueda FKM a FXM
- [x] Actualizar función findEquivalentFKM para soportar búsqueda inversa
- [x] Modificar interfaz para mostrar dirección de conversión
- [x] Actualizar títulos y etiquetas según dirección de búsqueda
- [x] Adaptar reportes PDF/Excel para ambas direcciones
- [x] Probar búsqueda FKM→FXM con ejemplos
- [x] Validar que los reportes muestren correctamente la dirección de conversión
