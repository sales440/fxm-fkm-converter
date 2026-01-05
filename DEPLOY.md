# Guía de Despliegue en Railway

Esta aplicación está configurada para desplegarse automáticamente en Railway a través de GitHub.

## Repositorio
[https://github.com/sales440/fxm-fkm-converter](https://github.com/sales440/fxm-fkm-converter)

## Configuración de Despliegue (Importante)

Para asegurar un despliegue exitoso, el proyecto incluye configuraciones específicas para Railway:

### 1. Archivo `nixpacks.toml`
Este archivo le dice a Railway cómo construir y ejecutar la aplicación.
- **Providers**: Fuerza el uso de `node` en lugar de la detección automática de Vite.
- **Fases**: Define explícitamente `pnpm install` y `pnpm build`.
- **Start**: Define `pnpm start` como comando de inicio.

### 2. Scripts en `package.json`
- **start**: `serve -s dist/public -l $PORT` (Servidor de producción estático)
- **preview**: Configurado idéntico a `start` para actuar como fallback si Railway intenta usar `preview`.

## Pasos para Desplegar

1.  **Inicia sesión en Railway**: [railway.app](https://railway.app/) (con tu cuenta de GitHub).
2.  **Nuevo Proyecto**: Botón **+ New Project** -> **Deploy from GitHub repo**.
3.  **Seleccionar Repo**: Elige `sales440/fxm-fkm-converter`.
4.  **Deploy Now**: Railway detectará automáticamente el archivo `nixpacks.toml` y usará la configuración correcta.
5.  **Dominio Público**:
    *   Ve a la pestaña **Settings** -> **Networking**.
    *   Haz clic en **Generate Domain** para obtener tu URL pública.

## Solución de Problemas Comunes

### Error: "Healthcheck failed" o "Service Unavailable"
Si el despliegue falla con estos errores, verifica:
1.  Que `nixpacks.toml` esté presente en la raíz.
2.  Que el comando de inicio esté usando el puerto `$PORT` (la variable de entorno que inyecta Railway).
3.  Que la carpeta `dist/public` exista después del build (el script `build` debe generarla).

### Actualizaciones
Cualquier cambio que subas a la rama `main` de GitHub (`git push`) disparará un nuevo despliegue automático en Railway.
