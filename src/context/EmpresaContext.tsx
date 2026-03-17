import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// ============================================
// Tipos
// ============================================
export interface Empresa {
  id: number
  nombre: string
  rfc: string
  logo?: string          // URL o iniciales de fallback
  color?: string         // color de acento opcional por empresa
}

interface EmpresaContextType {
  empresas: Empresa[]
  empresaActual: Empresa | null
  setEmpresaActual: (e: Empresa) => void
  isLoading: boolean
}

// ============================================
// Datos demo — reemplazar con llamada al servidor
// ============================================
const DEMO_EMPRESAS: Empresa[] = [
  { id: 1, nombre: 'Granja Eucaliptos', rfc: 'GEU-001', color: '#1a6fc4' },
  { id: 2, nombre: 'Agropecuaria del Norte', rfc: 'ADN-002', color: '#2da44e' },
  { id: 3, nombre: 'Ganadería La Esperanza', rfc: 'GLE-003', color: '#7c3aed' },
]

// ============================================
// Context
// ============================================
const EmpresaContext = createContext<EmpresaContextType | null>(null)

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresaActual, setEmpresaActualState] = useState<Empresa | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    cargarEmpresas()
  }, [])

  async function cargarEmpresas() {
    setIsLoading(true)
    try {
      // TODO: cuando el servidor esté listo, reemplaza esto por:
      // const { data } = await api.get<ApiResponse<Empresa[]>>('/empresas/listar.php')
      // const lista = data.data
      const lista = DEMO_EMPRESAS

      setEmpresas(lista)

      // Restaurar empresa guardada en localStorage
      const guardadaId = localStorage.getItem('empresaId')
      const encontrada = lista.find((e) => String(e.id) === guardadaId)
      setEmpresaActualState(encontrada ?? lista[0] ?? null)
    } catch (err) {
      console.error('Error al cargar empresas:', err)
      setEmpresas(DEMO_EMPRESAS)
      setEmpresaActualState(DEMO_EMPRESAS[0])
    } finally {
      setIsLoading(false)
    }
  }

  function setEmpresaActual(e: Empresa) {
    setEmpresaActualState(e)
    localStorage.setItem('empresaId', String(e.id))
  }

  return (
    <EmpresaContext.Provider value={{ empresas, empresaActual, setEmpresaActual, isLoading }}>
      {children}
    </EmpresaContext.Provider>
  )
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext)
  if (!ctx) throw new Error('useEmpresa debe usarse dentro de <EmpresaProvider>')
  return ctx
}

/** Devuelve las iniciales de un nombre de empresa (máx 2 letras) */
export function getIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
