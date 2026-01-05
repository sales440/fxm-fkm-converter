#!/bin/sh
# Script de arranque robusto para Railway
# Ignora argumentos inyectados y usa variables de entorno explícitas

echo "Iniciando servidor personalizado..."
echo "PORT detectado: $PORT"

# Si PORT no está definido, usar 3000 por defecto
if [ -z "$PORT" ]; then
  export PORT=3000
fi

# Ejecutar serve explícitamente en el puerto correcto
# -s: Single page application (redirige todo a index.html)
# -l: Listen port
# -n: No clipboard
# dist/public: Directorio de salida
echo "Ejecutando: serve -s dist/public -l $PORT -n"
exec ./node_modules/.bin/serve -s dist/public -l $PORT -n
