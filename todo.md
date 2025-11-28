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

## Mejora de Reporte Excel
- [x] Agregar logo de FAGOR en esquina superior izquierda del Excel
- [x] Agregar dirección de FAGOR Automation USA en esquina superior derecha
- [x] Aplicar fondo rojo (#DC2626) a todos los títulos
- [x] Aplicar fuente Arial Bold blanca a todos los títulos
- [x] Mejorar formato general del Excel (bordes, alineación, anchos de columna)
- [x] Probar descarga de Excel con nuevo formato

## Recomendaciones de Encoders y Conectores
- [x] Analizar manual FXM para extraer información de encoders disponibles
- [x] Analizar manual FKM para extraer información de encoders disponibles
- [x] Analizar manual FXM para extraer información de conectores de potencia
- [x] Analizar manual FKM para extraer información de conectores de potencia
- [x] Crear base de datos de encoders por familia de motores
- [x] Crear base de datos de conectores de potencia por familia de motores
- [x] Agregar sección de recomendaciones de encoders al reporte
- [x] Agregar sección de recomendaciones de conectores al reporte
- [x] Actualizar exportación PDF con nueva información
- [x] Actualizar exportación Excel con nueva información
- [x] Probar reportes con recomendaciones completas

## Actualización de Exportaciones con Recomendaciones
- [x] Actualizar exportador PDF para incluir sección de encoders
- [x] Actualizar exportador PDF para incluir sección de conectores
- [x] Actualizar exportador Excel para incluir sección de encoders
- [x] Actualizar exportador Excel para incluir sección de conectores
- [x] Probar exportación PDF con recomendaciones
- [x] Probar exportación Excel con recomendaciones

## Imágenes de Conectores y Diagramas
- [x] Generar imagen de conector MPC-4x1.5
- [x] Generar imagen de conector MPC-4x2.5
- [x] Generar imagen de conector MPC-4x4
- [ ] Generar imagen de conector MPC-4x6
- [ ] Generar imagen de conector MPC-4x10
- [ ] Generar imagen de conector MPC-4x16
- [ ] Generar imagen de conector MPC-4x25
- [x] Generar imagen de conector MC series (FXM)
- [ ] Generar imagen de conector MC 46 (FXM)
- [x] Agregar diagrama comparativo de encoders
- [x] Agregar galería de imágenes de conectores en el reporte
- [ ] Implementar zoom o vista ampliada de imágenes

## Calculadora de Longitud de Cables
- [x] Crear componente CableLengthCalculator
- [x] Implementar fórmula de cálculo según corriente y calibre
- [ ] Agregar tabla de referencia de longitudes máximas
- [x] Integrar calculadora en el reporte comparativo
- [ ] Agregar validación de entradas
- [x] Mostrar advertencias si la longitud es muy corta
- [x] Probar calculadora con diferentes motores

## Corrección de Exportaciones
- [x] Diagnosticar por qué el PDF se genera en blanco
- [x] Corregir exportador PDF para generar contenido correctamente
- [x] Convertir logo de FAGOR a base64 para insertar en Excel
- [x] Implementar inserción de logo como imagen real en Excel (no texto)
- [x] Probar exportación PDF con contenido completo
- [x] Probar exportación Excel con logo de FAGOR como imagen
- [x] Validar que ambos reportes incluyan todas las secciones
