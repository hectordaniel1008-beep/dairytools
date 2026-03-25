import { createContext, useContext, type ReactNode } from 'react'
import type { Empresa } from '../types'
import { useAuth } from './AuthContext'
import { authService } from '../api/services'

// ============================================================
//  Context de Empresa
//  Las empresas ya vienen del login en AuthContext.
//  Este context solo expone los datos y el cambio de empresa,
//  sin estado duplicado.
// ============================================================

interface EmpresaContextType {
  empresas:        Empresa[]
  empresaActual:   Empresa | null
  setEmpresaActual:(e: Empresa) => Promise<void>
  isLoading:       boolean
}

const EmpresaContext = createContext<EmpresaContextType | null>(null)

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const { empresas, empresaActiva, isLoading, setEmpresaActiva } = useAuth()

  async function setEmpresaActual(empresa: Empresa) {
    try {
      // Notificar al servidor — genera un nuevo token JWT con la empresa seleccionada
      await authService.cambiarEmpresa(empresa.id)
      // Actualizar estado local
      setEmpresaActiva(empresa)
    } catch (err) {
      console.error('Error al cambiar empresa:', err)
      throw err
    }
  }

  return (
    <EmpresaContext.Provider
      value={{
        empresas,
        empresaActual:   empresaActiva,
        setEmpresaActual,
        isLoading,
      }}
    >
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
    .map(w => w[0].toUpperCase())
    .join('')
}
