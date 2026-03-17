// ============================================
// Tipos Globales de la Aplicación
// ============================================

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'supervisor' | 'operador';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  fecha: string;
}

// --- Producción de Leche ---
export interface ProduccionLeche {
  id: number;
  fecha: string;
  animal_id: number;
  animal_nombre: string;
  cantidad_litros: number;
  turno: 'mañana' | 'tarde';
  observaciones?: string;
}

// --- Producción Agrícola ---
export interface ProduccionAgricola {
  id: number;
  fecha: string;
  cultivo: string;
  parcela: string;
  cantidad_kg: number;
  calidad: 'A' | 'B' | 'C';
  responsable: string;
  observaciones?: string;
}

// --- Pesaje ---
export interface Pesaje {
  id: number;
  fecha: string;
  animal_id: number;
  animal_nombre: string;
  peso_kg: number;
  tipo: 'bovino' | 'porcino' | 'ovino';
  operador: string;
  observaciones?: string;
}

// --- Dashboard ---
export interface KpiCard {
  titulo: string;
  valor: string | number;
  unidad?: string;
  variacion?: number;       // porcentaje respecto al período anterior
  icono: string;
  color: 'primary' | 'secondary' | 'warning' | 'error';
}

// --- API ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  mensaje?: string;
  total?: number;
  pagina?: number;
}

export interface PaginationParams {
  pagina?: number;
  limite?: number;
  busqueda?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}
