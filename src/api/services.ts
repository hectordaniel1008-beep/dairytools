import api from './client'
import type {
  ApiResponse,
  LoginResponse,
  Notification,
  ProduccionLeche,
  ProduccionAgricola,
  Pesaje,
  PaginationParams,
  Empresa,
  UsuarioCatalogo,
} from '@/types'

export interface EmpresaPayload {
  nombre: string
  clave: string
  color?: string
  estatus?: boolean
  logoUrl?: string
}

export interface UsuarioPayload {
  nombre: string
  email: string
  password: string
  es_superadmin?: boolean
  estatus?: boolean
}

export type UsuarioActualizarPayload = Partial<
  Omit<UsuarioPayload, 'password'> & { password?: string }
>

// ── Auth ─────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  perfil: () =>
    api.get<ApiResponse<LoginResponse>>('/auth/perfil'),

  cambiarEmpresa: (empresa_id: number) =>
    api.post<ApiResponse<{ empresa_activa: import('../types').Empresa }>>(
      '/auth/cambiar-empresa',
      { empresa_id }
    ),
}

// ── Notificaciones ───────────────────────────────────────────
export const notificacionesService = {
  listar: () =>
    api.get<ApiResponse<Notification[]>>('/notificaciones'),

  marcarLeida: (id: number) =>
    api.patch<ApiResponse<null>>(`/notificaciones/${id}/leer`),
}

// ── Producción de Leche ──────────────────────────────────────
export const lecheService = {
  listar: (params?: PaginationParams) =>
    api.get<ApiResponse<ProduccionLeche[]>>('/leche', { params }),

  obtener: (id: number) =>
    api.get<ApiResponse<ProduccionLeche>>(`/leche/${id}`),

  crear: (data: Omit<ProduccionLeche, 'id' | 'created_at'>) =>
    api.post<ApiResponse<ProduccionLeche>>('/leche', data),

  actualizar: (id: number, data: Partial<ProduccionLeche>) =>
    api.patch<ApiResponse<ProduccionLeche>>(`/leche/${id}`, data),

  eliminar: (id: number) =>
    api.delete<ApiResponse<null>>(`/leche/${id}`),

  resumen: () =>
    api.get<ApiResponse<{ total_dia: number; total_mes: number; promedio: number }>>(
      '/leche/resumen'
    ),
}

// ── Producción Agrícola ──────────────────────────────────────
export const agricolaService = {
  listar: (params?: PaginationParams) =>
    api.get<ApiResponse<ProduccionAgricola[]>>('/agricola', { params }),

  obtener: (id: number) =>
    api.get<ApiResponse<ProduccionAgricola>>(`/agricola/${id}`),

  crear: (data: Omit<ProduccionAgricola, 'id' | 'created_at'>) =>
    api.post<ApiResponse<ProduccionAgricola>>('/agricola', data),

  actualizar: (id: number, data: Partial<ProduccionAgricola>) =>
    api.patch<ApiResponse<ProduccionAgricola>>(`/agricola/${id}`, data),

  eliminar: (id: number) =>
    api.delete<ApiResponse<null>>(`/agricola/${id}`),

  resumen: () =>
    api.get<ApiResponse<{ total_dia: number; total_mes: number; cultivos: number }>>(
      '/agricola/resumen'
    ),
}

// ── Empresas ───────────────────────────────────────────────────
export const empresasService = {
  listar: () => api.get<ApiResponse<Empresa[]>>('/empresas'),

  obtener: (id: number) => api.get<ApiResponse<Empresa>>(`/empresas/${id}`),

  crear: (data: EmpresaPayload) => api.post<ApiResponse<Empresa>>('/empresas', data),

  actualizar: (id: number, data: Partial<EmpresaPayload>) =>
    api.patch<ApiResponse<Empresa>>(`/empresas/${id}`, data),

  eliminar: (id: number) => api.delete<ApiResponse<null>>(`/empresas/${id}`),
}

// ── Usuarios (catálogo) ──────────────────────────────────────
export const usuariosService = {
  listar: () => api.get<ApiResponse<UsuarioCatalogo[]>>('/usuarios'),

  obtener: (id: number) => api.get<ApiResponse<UsuarioCatalogo>>(`/usuarios/${id}`),

  crear: (data: UsuarioPayload) =>
    api.post<ApiResponse<UsuarioCatalogo>>('/usuarios', data),

  actualizar: (id: number, data: UsuarioActualizarPayload) =>
    api.patch<ApiResponse<UsuarioCatalogo>>(`/usuarios/${id}`, data),

  eliminar: (id: number) => api.delete<ApiResponse<null>>(`/usuarios/${id}`),
}

// ── Pesaje ───────────────────────────────────────────────────
export const pesajeService = {
  listar: (params?: PaginationParams) =>
    api.get<ApiResponse<Pesaje[]>>('/pesaje', { params }),

  obtener: (id: number) =>
    api.get<ApiResponse<Pesaje>>(`/pesaje/${id}`),

  crear: (data: Omit<Pesaje, 'id' | 'created_at'>) =>
    api.post<ApiResponse<Pesaje>>('/pesaje', data),

  actualizar: (id: number, data: Partial<Pesaje>) =>
    api.patch<ApiResponse<Pesaje>>(`/pesaje/${id}`, data),

  eliminar: (id: number) =>
    api.delete<ApiResponse<null>>(`/pesaje/${id}`),

  resumen: () =>
    api.get<ApiResponse<{ pesajes_hoy: number; peso_promedio: number; total_mes: number }>>(
      '/pesaje/resumen'
    ),
}
