import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthState, User } from '../types'
import { authService } from '../api/services'

// ============================================
// Context de Autenticación
// ============================================

// -------------------------------------------------------------------
// MODO DEMO — usuarios de prueba mientras el servidor PHP no está listo
// Elimina este bloque (y la lógica DEMO_MODE en login()) cuando
// conectes tu servidor real.
// -------------------------------------------------------------------
const DEMO_MODE = true   // ← cambia a false cuando tengas el servidor

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@dairytools.com': {
    password: 'admin123',
    user: { id: 1, nombre: 'Administrador', email: 'admin@dairytools.com', rol: 'admin' },
  },
  'supervisor@dairytools.com': {
    password: 'super123',
    user: { id: 2, nombre: 'María García', email: 'supervisor@dairytools.com', rol: 'supervisor' },
  },
  'operador@dairytools.com': {
    password: 'oper123',
    user: { id: 3, nombre: 'Juan López', email: 'operador@dairytools.com', rol: 'operador' },
  },
}
// -------------------------------------------------------------------

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
  })

  // Verificar sesión al cargar
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr)
        setState({ user, token, isAuthenticated: true, isLoading: false })
      } catch {
        clearSession()
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }))
    }
  }, [])

  function clearSession() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
  }

  async function login(email: string, password: string) {
    // --- DEMO: validación local sin servidor ---
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 600)) // simula latencia de red
      const demo = DEMO_USERS[email.toLowerCase()]
      if (!demo || demo.password !== password) {
        throw new Error('Credenciales incorrectas')
      }
      const token = 'demo-token'
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(demo.user))
      setState({ user: demo.user, token, isAuthenticated: true, isLoading: false })
      return
    }
    // --- PRODUCCIÓN: llama al servidor PHP ---
    const { data: res } = await authService.login(email, password)
    if (res.success) {
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setState({ user, token, isAuthenticated: true, isLoading: false })
    } else {
      throw new Error(res.mensaje ?? 'Credenciales inválidas')
    }
  }

  function logout() {
    if (!DEMO_MODE) authService.logout().catch(() => { })
    clearSession()
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
