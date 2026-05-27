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
  PaginatedResponse, // added PaginatedResponse to the import list
} from '@/types'

export interface EmpresaPayload {
  nombre: string
  clave: string
  rfc?: string
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

  obtenerEmpresas: (usuarioId: number) =>
    api.get<ApiResponse<any[]>>(`/usuarios/${usuarioId}/empresas`),

  actualizarEmpresas: (usuarioId: number, asignaciones: any[]) =>
    api.patch<ApiResponse<null>>(`/usuarios/${usuarioId}/empresas`, asignaciones),
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

// ── Productos ────────────────────────────────────────────────
export const productosService = {
  listar: (page?: number, limit?: number, search?: string) =>
    api.get<PaginatedResponse<any>>('/leche/productos', {
      params: { page, limit, search }
    }),

  obtener: (id: number) =>
    api.get<ApiResponse<any>>(`/leche/productos/${id}`),

  crear: (data: any) =>
    api.post<ApiResponse<any>>('/leche/productos', data),

  actualizar: (id: number, data: any) =>
    api.patch<ApiResponse<any>>(`/leche/productos/${id}`, data),

  eliminar: (id: number) =>
    api.delete<ApiResponse<null>>(`/leche/productos/${id}`),

  catalogos: () =>
    api.get<ApiResponse<any>>('/leche/productos/catalogos'),
}

// ── Catálogos de Productos ──────────────────────────────────
const CATALOG_ROUTE_RETRY_STATUSES = [404, 405]

function shouldTryNextCatalogRoute(err: any, retryStatuses = CATALOG_ROUTE_RETRY_STATUSES) {
  return retryStatuses.includes(err?.response?.status)
}

async function tryCatalogRoutes<T>(requests: Array<() => Promise<T>>, retryStatuses?: number[]) {
  let lastError: unknown

  for (const request of requests) {
    try {
      return await request()
    } catch (err) {
      lastError = err
      if (!shouldTryNextCatalogRoute(err, retryStatuses)) throw err
    }
  }

  throw lastError
}

function catalogoListFromCatalogos(key: string) {
  return async () => {
    const response = await productosService.catalogos()
    return {
      ...response,
      data: {
        success: response.data.success,
        data: response.data.data?.[key] ?? [],
      },
    }
  }
}

function createCatalogService(paths: string[], catalogosKey: string) {
  return {
    listar: catalogoListFromCatalogos(catalogosKey),

    obtener: (id: number) =>
      tryCatalogRoutes(paths.map(path => () => api.get<ApiResponse<any>>(`${path}/${id}`))),

    crear: (data: any) =>
      tryCatalogRoutes(paths.map(path => () => api.post<ApiResponse<any>>(path, data))),

    actualizar: (id: number, data: any) =>
      tryCatalogRoutes(paths.flatMap(path => [
        () => api.patch<ApiResponse<any>>(`${path}/${id}`, data),
        () => api.put<ApiResponse<any>>(`${path}/${id}`, data),
      ])),

    eliminar: (id: number) =>
      tryCatalogRoutes(paths.map(path => () => api.delete<ApiResponse<null>>(`${path}/${id}`))),
  }
}

export const tiposProductoService = {
  ...createCatalogService([
    '/leche/productos/tipos-producto',
    '/leche/productos/tipo-producto',
    '/leche/productos/tipos',
  ], 'tiposProducto'),
}

export const proveedoresService = {
  ...createCatalogService([
    '/leche/productos/proveedores',
    '/leche/productos/proveedor',
    '/leche/proveedores',
  ], 'proveedores'),

  listar: () =>
    tryCatalogRoutes<any>([
      () => api.get<ApiResponse<any[]> | PaginatedResponse<any>>('/leche/productos/proveedores'),
      () => api.get<ApiResponse<any[]> | PaginatedResponse<any>>('/leche/productos/proveedor'),
      () => api.get<ApiResponse<any[]> | PaginatedResponse<any>>('/leche/proveedores'),
      catalogoListFromCatalogos('proveedores'),
    ], [400, 404, 405]),
}

export const unidadesMedidaService = {
  ...createCatalogService([
    '/leche/productos/unidades-medida',
    '/leche/productos/unidad-medida',
    '/leche/productos/unidades',
  ], 'unidadesMedida'),
}

function createCatalogGeneralService(basePath: string) {
  return {
    listar: () =>
      api.get<ApiResponse<any[]>>(`/catalogos-generales/${basePath}`),

    crear: (data: any) =>
      api.post<ApiResponse<any>>(`/catalogos-generales/${basePath}`, data),

    actualizar: (id: number, data: any) =>
      api.patch<ApiResponse<any>>(`/catalogos-generales/${basePath}/${id}`, data),

    eliminar: (id: number) =>
      api.delete<ApiResponse<null>>(`/catalogos-generales/${basePath}/${id}`),
  }
}

export const establosService = createCatalogGeneralService('establos')
export const dietasService = createCatalogGeneralService('dietas')
export const almacenesService = createCatalogGeneralService('almacenes')
export const tiposSalidaLecheService = createCatalogGeneralService('tipos-salida-leche')
export const corralesService = createCatalogGeneralService('corrales')
