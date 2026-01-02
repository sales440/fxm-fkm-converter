# Guía de Despliegue en Railway vía GitHub

Esta guía detalla los pasos para desplegar la aplicación "Conversor de Motores FXM a FKM" en Railway utilizando GitHub.

## 1. Preparación del Repositorio en GitHub

Como ya tienes una cuenta de GitHub (`sales440`), sigue estos pasos para subir tu código:

1.  **Descarga el código fuente**: Descarga el archivo ZIP del proyecto desde el entorno de desarrollo de Manus.
2.  **Descomprime el archivo**: Extrae el contenido en una carpeta local en tu computadora.
3.  **Crea un nuevo repositorio en GitHub**:
    *   Ve a [github.com/new](https://github.com/new).
    *   Nombre del repositorio: `fxm-fkm-converter` (o el nombre que prefieras).
    *   Visibilidad: **Público** o **Privado** (según tu preferencia).
    *   No inicialices con README, .gitignore o licencia (ya los tenemos).
    *   Haz clic en **Create repository**.
4.  **Sube el código**:
    *   Si tienes Git instalado, abre una terminal en la carpeta del proyecto y ejecuta:
        ```bash
        git init
        git add .
        git commit -m "Initial commit: FXM to FKM Converter App"
        git branch -M main
        git remote add origin https://github.com/sales440/fxm-fkm-converter.git
        git push -u origin main
        ```
    *   Si prefieres usar la interfaz web:
        *   En la página de tu nuevo repositorio, haz clic en "uploading an existing file".
        *   Arrastra todos los archivos de tu carpeta (asegúrate de incluir los ocultos como `.gitignore` si es posible, aunque lo crítico es `package.json`, `vite.config.ts`, `client/`, `server/`).

## 2. Despliegue en Railway

1.  **Inicia sesión en Railway**: Ve a [railway.app](https://railway.app/) e inicia sesión con tu cuenta de GitHub.
2.  **Crea un nuevo proyecto**:
    *   Haz clic en **+ New Project**.
    *   Selecciona **Deploy from GitHub repo**.
    *   Selecciona el repositorio `fxm-fkm-converter` que acabas de crear.
3.  **Configuración (Automática)**:
    *   Railway detectará automáticamente que es un proyecto Node.js.
    *   Leerá el `package.json` y usará los scripts:
        *   **Install Command**: `pnpm install` (Railway detecta pnpm automáticamente).
        *   **Build Command**: `pnpm run build`.
        *   **Start Command**: `pnpm start`.
4.  **Variables de Entorno (Opcional)**:
    *   Esta aplicación es estática y no requiere variables de entorno críticas para funcionar básicamente.
    *   Si en el futuro agregas funcionalidades que requieran secretos, ve a la pestaña **Variables** en tu servicio de Railway y agrégalas allí.
5.  **Despliegue**:
    *   Railway comenzará el despliegue automáticamente. Puedes ver el progreso en la pestaña **Deployments**.
    *   Una vez finalizado (marcado como "Active"), Railway te proporcionará una URL pública (ej. `fxm-fkm-converter-production.up.railway.app`).
6.  **Generar Dominio**:
    *   Si no se generó automáticamente, ve a la pestaña **Settings** -> **Networking** y haz clic en **Generate Domain** para obtener una URL pública accesible.

## 3. Verificación

1.  Abre la URL proporcionada por Railway.
2.  Verifica que la aplicación cargue correctamente.
3.  Prueba una búsqueda de motor (ej. `FXM 75.30A`) para asegurar que la base de datos se cargó bien.
4.  Prueba la generación de PDF y Excel.

## Solución de Problemas Comunes

*   **Error de Build**: Si el build falla, revisa los logs en Railway. Asegúrate de que todas las dependencias estén en `package.json`.
*   **Puerto**: La aplicación está configurada para escuchar en el puerto proporcionado por la variable de entorno `PORT` (Railway lo inyecta automáticamente) o en el 3000 por defecto. El archivo `server/index.ts` maneja esto correctamente: `const port = process.env.PORT || 3000;`.

¡Listo! Tu aplicación estará en línea y lista para ser usada por FAGOR Automation.
