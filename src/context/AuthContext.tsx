import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthState, User, Empresa } from '../types'
import { authService } from '../api/services'

interface AuthContextType extends AuthState {
  login:            (email: string, password: string) => Promise<void>
  logout:           () => void
  setEmpresaActiva: (empresa: Empresa) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const ESTADO_VACIO: AuthState = {
  user:            null,
  empresaActiva:   null,
  empresas:        [],
  isAuthenticated: false,
  isLoading:       false,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ...ESTADO_VACIO,
    isLoading: true,   // true solo al inicio mientras verificamos la cookie
  })

  useEffect(() => {
    verificarSesion()
  }, [])  // ejecutar UNA sola vez al montar

  async function verificarSesion() {
    try {
      const { data: res } = await authService.perfil()

      if (res.success && res.data) {
        const defaultEmpresa = res.data.empresas?.find(e => e.es_default)
          ?? res.data.empresa_activa
          ?? res.data.empresas?.[0]
          ?? null

        setState({
          user:            res.data.user,
          empresaActiva:   defaultEmpresa,
          empresas:        res.data.empresas ?? [],
          isAuthenticated: true,
          isLoading:       false,
        })
      } else {
        // La API respondió pero sin datos válidos
        setState(ESTADO_VACIO)
      }
    } catch {
      // 401 = sin cookie = usuario no logueado. Es el estado normal al entrar.
      // NO redirigir aquí, ProtectedRoute se encarga de eso.
      setState(ESTADO_VACIO)
    }
  }

  async function login(email: string, password: string) {
    const { data: res } = await authService.login(email, password)

    if (!res.success || !res.data) {
      throw new Error(res.mensaje ?? 'Credenciales inválidas')
    }

    const { user, empresa_activa, empresas } = res.data

    // Buscar la empresa marcada como default, si no la primera
    const defaultEmpresa = empresas?.find(e => e.es_default) ?? empresa_activa ?? empresas?.[0] ?? null

    setState({
      user,
      empresaActiva:   defaultEmpresa,
      empresas:        empresas       ?? [],
      isAuthenticated: true,
      isLoading:       false,
    })
  }

  async function logout() {
    try { await authService.logout() } catch { /* ignorar errores de red */ }
    setState(ESTADO_VACIO)
  }

  function setEmpresaActiva(empresa: Empresa) {
    setState(prev => ({ ...prev, empresaActiva: empresa }))
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setEmpresaActiva }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
