import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { EmpresaProvider } from './context/EmpresaContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Auth
import LoginPage from './pages/auth/Login'

// Leche
import LecheDashboard from './pages/leche/LecheDashboard'
import LechePage from './pages/leche/Leche'
import LecheMapa from './pages/leche/LecheMapa'

// Agrícola
import AgricolaDashboard from './pages/agricola/AgricolaDashboard'

// Pesaje
import PesajeDashboard from './pages/pesaje/PesajeDashboard'

// Configuración
import ConfiguracionPage from './pages/configuracion/Configuracion'
import UsuariosPage from './pages/configuracion/Usuarios'
import EmpresasPage from './pages/configuracion/Empresas'

export default function App() {
  return (
    <AuthProvider>
      <EmpresaProvider>
        <BrowserRouter>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Privadas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/leche/dashboard" replace />} />

              {/* Módulo: Producción de Leche */}
              <Route path="leche">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<LecheDashboard />} />
                <Route path="registros" element={<LechePage />} />
                <Route path="mapa" element={<LecheMapa />} />
              </Route>

              {/* Módulo: Producción Agrícola */}
              <Route path="agricola">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AgricolaDashboard />} />
              </Route>

              {/* Módulo: Pesaje */}
              <Route path="pesaje">
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PesajeDashboard />} />
              </Route>

              <Route path="configuracion">
                <Route index element={<ConfiguracionPage />} />
                <Route path="usuarios" element={<UsuariosPage />} />
                <Route path="empresas" element={<EmpresasPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/leche/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </EmpresaProvider>
    </AuthProvider>
  )
}
