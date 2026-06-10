# DairyTools - Contexto del Proyecto

## Información General

**Nombre**: DairyTools  
**Descripción**: Sistema de Gestión para control agropecuario (AgroApp)  
**Repositorio**: https://github.com/hectordaniel1008-beep/dairytools  
**Creado**: 17 de Marzo de 2026  
**Última actualización**: 6 de Junio de 2026  
**Rama principal**: `master`  
**Visibilidad**: Pública  
**Licencia**: Sin especificar

---

## Composición del Código

### Lenguajes
| Lenguaje   | Bytes   | Porcentaje |
|-----------|---------|-----------|
| TypeScript | 207,400 | 65.2%     |
| CSS       | 89,492  | 28.1%     |
| HTML      | 745     | 0.2%      |

**Stack Tecnológico Principal**: TypeScript + React

---

## Tecnologías Utilizadas

### Frontend
- **React 19** + **TypeScript** — interfaz de usuario moderna
- **Vite** — bundler ultrarrápido con SWC
- **React Router v7** — navegación SPA (Single Page Application)
- **Axios** — cliente HTTP para consumir APIs NestJS
- **Lucide React** — librería de iconos
- **CSS Modules** — estilos encapsulados sin dependencias externas

### Backend
- **NestJS** — framework TypeScript para API REST
- **Autenticación**: Tokens JWT en interceptores de Axios

---

## Estructura del Proyecto

```
src/
├── api/
│   ├── client.ts              # Instancia Axios + interceptores (token JWT)
│   └── services.ts            # Servicios HTTP por módulo
├── components/
│   ├── layout/
│   │   ├── AppLayout          # Wrapper principal (sidebar + topbar + outlet)
│   │   ├── Sidebar            # Menú lateral con logo
│   │   └── Topbar             # Barra superior (usuario + notificaciones)
│   └── ui/
│       ├── KpiCard            # Tarjeta de indicador reutilizable
│       └── ProtectedRoute     # Guard de rutas privadas
├── context/
│   └── AuthContext.tsx        # Estado global de autenticación
├── pages/
│   ├── auth/Login             # Pantalla de inicio de sesión
│   ├── dashboard/             # Dashboard con KPIs y actividad
│   ├── leche/                 # Módulo Producción de Leche
│   ├── agricola/              # Módulo Producción Agrícola
│   ├── pesaje/                # Módulo Pesaje
│   └── configuracion/         # Módulo Configuración (Empresas, Usuarios)
├── types/
│   └── index.ts               # Interfaces TypeScript globales
└── index.css                  # Variables CSS (tema de colores)
```

---

## Módulos Implementados

| Módulo                   | Ruta               | Estado              |
|--------------------------|-------------------|---------------------|
| Autenticación            | `/login`           | ✅ Completo         |
| Dashboard                | `/dashboard`       | ✅ Completo         |
| Producción de Leche      | `/leche`           | ✅ Plantilla        |
| Producción Agrícola      | `/agricola`        | ✅ Plantilla        |
| Pesaje                   | `/pesaje`          | ✅ Plantilla        |
| Configuración            | `/configuracion`   | ✅ Completo         |
| └─ Empresas              | `/configuracion/empresas` | ✅ Disponible    |
| └─ Usuarios              | `/configuracion/usuarios` | ✅ Disponible    |

---

## Guía de Inicio Rápido

### Instalación
```bash
npm install
```

### Configuración
```bash
cp .env.example .env
# Edita .env y configura:
# VITE_API_URL=http://localhost:3000/api
```

### Desarrollo
```bash
npm run dev
# → Abre http://localhost:3000
```

### Producción
```bash
npm run build
# → Genera carpeta dist/ optimizada
```

---

## Convención de API (NestJS)

### Endpoints del Servidor NestJS
```
GET    /api/leche              # Listar registros
POST   /api/leche              # Crear registro
PATCH  /api/leche/:id          # Actualizar registro
DELETE /api/leche/:id          # Eliminar registro

GET    /api/configuracion/empresas
POST   /api/configuracion/empresas
PATCH  /api/configuracion/empresas/:id
DELETE /api/configuracion/empresas/:id

GET    /api/configuracion/usuarios
POST   /api/configuracion/usuarios
PATCH  /api/configuracion/usuarios/:id
DELETE /api/configuracion/usuarios/:id
```

### Respuesta Esperada
```json
{
  "success": true,
  "data": [ /* datos */ ],
  "mensaje": "OK",
  "total": 50,
  "pagina": 1
}
```

### Autenticación
- Los tokens JWT se incluyen automáticamente en el header `Authorization` gracias al interceptor de Axios
- Ver `src/api/client.ts` para detalles de configuración

---

## Personalización del Tema

Edita las variables CSS en `src/index.css`:

```css
:root {
  --color-primary:      #1a6fc4;   /* Azul principal */
  --color-secondary:    #2da44e;   /* Verde principal */
  --sidebar-bg:         #0f2a4a;   /* Fondo del menú lateral */
  --color-error:        #d1293d;
  --color-warning:      #e8a30b;
  --color-success:      #2da44e;
  /* ... más variables */
}
```

---

## Notas de Desarrollo

- **Estado Global**: AuthContext maneja la autenticación y permisos
- **Rutas Protegidas**: El componente `ProtectedRoute` valida autenticación
- **HTTP Client**: Axios configurado con interceptores para JWT
- **Sin UI Framework**: Todo es CSS Modules puro para máxima personalización
- **Componentes Reutilizables**: KpiCard y otros componentes base están listos
- **Backend**: API REST construida con NestJS, totalmente tipada con TypeScript

---

## Próximos Pasos

1. Completar plantillas de módulos (Leche, Agrícola, Pesaje)
2. Implementar validaciones de formularios avanzadas
3. Añadir más indicadores KPI personalizados
4. Configurar tests unitarios e integración
5. Implementar roles y permisos granulares en Usuarios

---

**Última revisión**: 10 de Junio de 2026  
**Mantenedor**: @hectordaniel1008-beep
