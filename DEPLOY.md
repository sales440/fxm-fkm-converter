# Guía de Despliegue Rápido en Railway

¡Tu código ya está en GitHub! Sigue estos pasos simplificados para desplegar tu aplicación en minutos.

## 1. Repositorio GitHub (Ya creado)
Tu código se encuentra en: [https://github.com/sales440/fxm-fkm-converter](https://github.com/sales440/fxm-fkm-converter)

## 2. Despliegue en Railway

1.  **Inicia sesión en Railway**: Ve a [railway.app](https://railway.app/) e inicia sesión con tu cuenta de GitHub.
2.  **Nuevo Proyecto**: Haz clic en el botón **+ New Project**.
3.  **Seleccionar Repositorio**:
    *   Elige la opción **Deploy from GitHub repo**.
    *   Busca y selecciona `sales440/fxm-fkm-converter`.
4.  **Despliegue Automático**:
    *   Haz clic en **Deploy Now**.
    *   Railway detectará automáticamente la configuración (Node.js, pnpm build, pnpm start).
    *   Espera unos minutos a que el proceso termine (verás logs de instalación y construcción).
5.  **Obtener URL Pública**:
    *   Una vez que el despliegue esté "Active" (verde), ve a la pestaña **Settings**.
    *   Baja a la sección **Networking**.
    *   Haz clic en **Generate Domain**.
    *   ¡Listo! Esa es la URL de tu aplicación (ej. `fxm-fkm-converter-production.up.railway.app`).

## 3. Verificación
Abre la URL generada y prueba la aplicación. Debería funcionar exactamente igual que en el entorno de desarrollo.

---
**Nota**: Si realizas cambios futuros en el código y haces un `git push` a GitHub, Railway detectará el cambio y volverá a desplegar la aplicación automáticamente.
