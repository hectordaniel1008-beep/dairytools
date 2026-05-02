// ============================================================
//  Tipos globales — alineados con la API PHP
// ============================================================

// ── Empresa ─────────────────────────────────────────────────
export interface Empresa {
  id: number
  nombre: string
  clave: string           // antes "rfc", renombrado en la BD
  color?: string
  rol: 'admin' | 'supervisor' | 'operador'  // rol del usuario EN esta empresa
  es_default?: number      // 1 si es la empresa predeterminada del usuario
  rfc: string             // nuevo campo para el RFC
}

// ── Usuario ──────────────────────────────────────────────────
export interface User {
  id: number
  nombre: string
  email: string
  es_superadmin: boolean
}

/** Catálogo de usuarios (configuración); incluye estatus de cuenta */
export interface UsuarioCatalogo {
  id: number
  nombre: string
  email: string
  es_superadmin: boolean
  estatus: boolean
}

// ── Estado de autenticación ──────────────────────────────────
export interface AuthState {
  user: User | null
  empresaActiva: Empresa | null   // empresa seleccionada en la sesión actual
  empresas: Empresa[]        // todas las empresas accesibles
  isAuthenticated: boolean
  isLoading: boolean
}

// ── Notificaciones ───────────────────────────────────────────
export interface Notification {
  id: number
  titulo: string
  mensaje: string
  tipo: 'info' | 'warning' | 'error' | 'success'
  leida: boolean
  fecha: string
}

// ── Producción de Leche ──────────────────────────────────────
export interface ProduccionLeche {
  id: number
  empresa_id: number
  fecha: string
  animal_id?: number
  animal_nombre: string
  cantidad_litros: number
  turno: 'mañana' | 'tarde'
  observaciones?: string
  created_at?: string
}

// ── Producción Agrícola ──────────────────────────────────────
export interface ProduccionAgricola {
  id: number
  empresa_id: number
  fecha: string
  cultivo: string
  parcela: string
  cantidad_kg: number
  calidad: 'A' | 'B' | 'C'
  responsable?: string
  observaciones?: string
  created_at?: string
}

// ── Pesaje ───────────────────────────────────────────────────
export interface Pesaje {
  id: number
  empresa_id: number
  fecha: string
  animal_id?: number
  animal_nombre: string
  peso_kg: number
  tipo: 'bovino' | 'porcino' | 'ovino'
  operador?: string
  observaciones?: string
  created_at?: string
}

// ── Respuesta estándar de la API ─────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data?: T
  mensaje?: string
  total?: number
}

// Respuesta paginada de la API
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  mensaje?: string
}

// ── Parámetros de paginación ─────────────────────────────────
export interface PaginationParams {
  pagina?: number
  limite?: number
  busqueda?: string
  fecha_inicio?: string
  fecha_fin?: string
}

// ── Respuesta del login ──────────────────────────────────────
export interface LoginResponse {
  user: User
  empresa_activa: Empresa
  empresas: Empresa[]
}
