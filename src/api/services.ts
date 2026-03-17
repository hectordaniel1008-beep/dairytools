import api from './client'
import type {
  ApiResponse,
  User,
  Notification,
  ProduccionLeche,
  ProduccionAgricola,
  Pesaje,
  PaginationParams,
} from '../types'

// ============================================
// Auth
// ============================================
export const authService = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login.php', { email, password }),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout.php'),

  perfil: () =>
    api.get<ApiResponse<User>>('/auth/perfil.php'),
}

// ============================================
// Notificaciones
// ============================================
export const notificacionesService = {
  listar: () =>
    api.get<ApiResponse<Notification[]>>('/notificaciones/listar.php'),

  marcarLeida: (id: number) =>
    api.put<ApiResponse<null>>(`/notificaciones/actualizar.php`, { id }),
}

// ============================================
// Producción de Leche
// ============================================
export const lecheService = {
  listar: (params?: PaginationParams) =>
    api.get<ApiResponse<ProduccionLeche[]>>('/leche/listar.php', { params }),

  obtener: (id: number) =>
    api.get<ApiResponse<ProduccionLeche>>(`/leche/obtener.php?id=${id}`),

  crear: (data: Omit<ProduccionLeche, 'id'>) =>
    api.post<ApiResponse<ProduccionLeche>>('/leche/crear.php', data),

  actualizar: (id: number, data: Partial<ProduccionLeche>) =>
    api.put<ApiResponse<ProduccionLeche>>('/leche/actualizar.php', { id, ...data }),

  eliminar: (id: number) =>
    api.delete<ApiResponse<null>>(`/leche/eliminar.php?id=${id}`),

  resumen: () =>
    api.get<ApiResponse<{ total_dia: number; total_mes: number; promedio: number }>>(
      '/leche/resumen.php'
    ),
}

// ============================================
// Producción Agrícola
// ============================================
export const agricolaService = {
  listar: (params?: PaginationParams) =>
    api.get<ApiResponse<ProduccionAgricola[]>>('/agricola/listar.php', { params }),

  obtener: (id: number) =>
    api.get<ApiResponse<ProduccionAgricola>>(`/agricola/obtener.php?id=${id}`),

  crear: (data: Omit<ProduccionAgricola, 'id'>) =>
    api.post<ApiResponse<ProduccionAgricola>>('/agricola/crear.php', data),

  actualizar: (id: number, data: Partial<ProduccionAgricola>) =>
    api.put<ApiResponse<ProduccionAgricola>>('/agricola/actualizar.php', { id, ...data }),

  eliminar: (id: number) =>
    api.delete<ApiResponse<null>>(`/agricola/eliminar.php?id=${id}`),

  resumen: () =>
    api.get<ApiResponse<{ total_dia: number; total_mes: number; cultivos: number }>>(
      '/agricola/resumen.php'
    ),
}

// ============================================
// Pesaje
// ============================================
export const pesajeService = {
  listar: (params?: PaginationParams) =>
    api.get<ApiResponse<Pesaje[]>>('/pesaje/listar.php', { params }),

  obtener: (id: number) =>
    api.get<ApiResponse<Pesaje>>(`/pesaje/obtener.php?id=${id}`),

  crear: (data: Omit<Pesaje, 'id'>) =>
    api.post<ApiResponse<Pesaje>>('/pesaje/crear.php', data),

  actualizar: (id: number, data: Partial<Pesaje>) =>
    api.put<ApiResponse<Pesaje>>('/pesaje/actualizar.php', { id, ...data }),

  eliminar: (id: number) =>
    api.delete<ApiResponse<null>>(`/pesaje/eliminar.php?id=${id}`),

  resumen: () =>
    api.get<ApiResponse<{ pesajes_hoy: number; peso_promedio: number; total_mes: number }>>(
      '/pesaje/resumen.php'
    ),
}
