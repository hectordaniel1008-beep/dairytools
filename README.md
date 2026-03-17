# AgroApp — Sistema de Gestión

Plantilla React + TypeScript + SWC con autenticación, dashboard y tres módulos principales.

## Tecnologías

- **React 19** + **TypeScript**
- **Vite** con plugin **@vitejs/plugin-react-swc** (compilación rápida con SWC)
- **React Router v7** — navegación SPA
- **Axios** — cliente HTTP para el servidor PHP
- **Lucide React** — iconos
- **CSS Modules** — estilos encapsulados sin dependencias de UI externas

---

## Estructura del proyecto

```
src/
├── api/
│   ├── client.ts          # Instancia Axios + interceptores (token JWT)
│   └── services.ts        # Servicios por módulo (auth, leche, agrícola, pesaje)
├── components/
│   ├── layout/
│   │   ├── AppLayout      # Wrapper principal (sidebar + topbar + outlet)
│   │   ├── Sidebar        # Menú lateral con logo de empresa
│   │   └── Topbar         # Barra superior con usuario y notificaciones
│   └── ui/
│       ├── KpiCard        # Tarjeta de indicador reutilizable
│       └── ProtectedRoute # Guard de rutas privadas
├── context/
│   └── AuthContext.tsx    # Estado global de autenticación
├── pages/
│   ├── auth/Login         # Pantalla de inicio de sesión
│   ├── dashboard/         # Dashboard con KPIs y actividad reciente
│   ├── leche/             # Módulo Producción de Leche
│   ├── agricola/          # Módulo Producción Agrícola
│   └── pesaje/            # Módulo Pesaje
├── types/index.ts         # Interfaces TypeScript globales
└── index.css              # Variables CSS (tema de colores)
```

---

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la URL del servidor PHP
cp .env.example .env
# Edita .env y ajusta VITE_API_URL

# 3. Ejecutar en modo desarrollo
npm run dev
# → Abre http://localhost:3000

# 4. Compilar para producción
npm run build
```

---

## Personalización del tema

Edita las variables CSS en `src/index.css`:

```css
:root {
  --color-primary:   #1a6fc4;   /* Azul principal */
  --color-secondary: #2da44e;   /* Verde principal */
  --sidebar-bg:      #0f2a4a;   /* Fondo del menú lateral */
  /* ... */
}
```

---

## Conexión con el servidor PHP

Todos los servicios están en `src/api/services.ts`. Cada módulo sigue la convención:

```
GET  /leche/listar.php
POST /leche/crear.php
PUT  /leche/actualizar.php
DEL  /leche/eliminar.php?id=N
```

El token JWT se adjunta automáticamente en cada petición mediante el interceptor de Axios en `src/api/client.ts`.

### Respuesta esperada del servidor

```json
{
  "success": true,
  "data": [ ... ],
  "mensaje": "OK",
  "total": 50,
  "pagina": 1
}
```

---

## Módulos incluidos

| Módulo               | Ruta          | Estado         |
|----------------------|---------------|----------------|
| Dashboard            | `/dashboard`  | ✅ Completo    |
| Producción de Leche  | `/leche`      | ✅ Plantilla   |
| Producción Agrícola  | `/agricola`   | ✅ Plantilla   |
| Pesaje               | `/pesaje`     | ✅ Plantilla   |
| Configuración        | `/configuracion` | 🔜 Pendiente |
