# FXM to FKM Motor Converter

Conversor profesional de motores FAGOR FXM a FKM con reportes PDF y Excel de alta calidad.

## Características

- 🔍 **Búsqueda bidireccional**: FXM ↔ FKM
- 📊 **Reportes profesionales**: Exportación a PDF y Excel con imágenes de encoders y conectores
- 🌐 **Multiidioma**: Español e Inglés
- 📱 **Responsive**: Diseño adaptable a todos los dispositivos
- 📈 **Comparación múltiple**: Selecciona varios motores y exporta un reporte consolidado
- 📝 **Historial de conversiones**: Guarda automáticamente tus conversiones recientes
- 🔧 **Filtros avanzados**: Filtra por par, velocidad, inercia y más
- 🎨 **Interfaz moderna**: Diseño profesional con tema oscuro/claro

## Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Reportes**: jsPDF + ExcelJS
- **Routing**: Wouter
- **Estado**: React Context API

## Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/sales440/fxm-fkm-converter.git
cd fxm-fkm-converter

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`

## Despliegue en Railway

### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Regístrate con tu cuenta de GitHub

2. **Conectar repositorio**
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Autoriza Railway para acceder a tus repositorios
   - Selecciona `sales440/fxm-fkm-converter`

3. **Configurar el proyecto**
   - Railway detectará automáticamente que es un proyecto Node.js
   - El build command será: `pnpm install && pnpm build`
   - El start command será: `pnpm preview`

4. **Desplegar**
   - Haz clic en "Deploy"
   - Railway generará una URL pública automáticamente
   - El despliegue tomará 2-3 minutos

### Opción 2: Despliegue con Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Autenticar
railway login

# Inicializar proyecto
railway init

# Desplegar
railway up
```

## Scripts Disponibles

```bash
pnpm dev          # Iniciar servidor de desarrollo
pnpm build        # Construir para producción
pnpm preview      # Vista previa de la build de producción
pnpm lint         # Ejecutar linter
```

## Estructura del Proyecto

```
fxm-fkm-converter/
├── client/
│   ├── public/
│   │   ├── fxm_motors.json           # Base de datos de motores FXM
│   │   ├── fkm_motors.json           # Base de datos de motores FKM
│   │   ├── encoder-industrial.png    # Imagen de encoder
│   │   └── connector-industrial.png  # Imagen de conector
│   └── src/
│       ├── components/               # Componentes React
│       ├── contexts/                 # Contextos (idioma, tema, historial)
│       ├── lib/                      # Utilidades (exportadores PDF/Excel)
│       ├── pages/                    # Páginas (Home, NotFound)
│       └── types/                    # Tipos TypeScript
├── package.json
├── vite.config.ts
└── README.md
```

## Base de Datos de Motores

Los motores están almacenados en archivos JSON estáticos:

- `client/public/fxm_motors.json`: 1,200+ motores FXM
- `client/public/fkm_motors.json`: 1,200+ motores FKM

Cada motor incluye especificaciones eléctricas, dimensiones mecánicas, y recomendaciones de encoders/conectores.

## Funcionalidades Principales

### 1. Búsqueda de Motores
- Búsqueda por modelo (ej: FXM 74.30A.xx.x10)
- Normalización automática de formatos alternativos
- Filtros avanzados por especificaciones

### 2. Reportes Profesionales
- **PDF**: Logo FAGOR, tablas formateadas, imágenes de componentes
- **Excel**: Múltiples hojas, formato condicional, imágenes embebidas
- **Consolidado**: Comparación múltiple en un solo archivo

### 3. Historial de Conversiones
- Guarda automáticamente las últimas 10 conversiones
- Persistencia en localStorage
- Panel lateral deslizable

### 4. Comparación Múltiple
- Selecciona varios motores FXM
- Exporta reporte consolidado con todas las conversiones
- Visualización en panel flotante

## Contacto

**FAGOR Automation USA**  
1755 Park Street, Naperville, IL 60563  
Tel: +1 (630) 851-3050

## Licencia

© 2024 FAGOR Automation. All rights reserved.
