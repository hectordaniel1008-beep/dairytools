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
import ProductosPage from './pages/leche/Productos'
import TiposProductoPage from './pages/leche/TiposProducto'
import ProveedoresPage from './pages/leche/Proveedores'
import UnidadesMedidaPage from './pages/leche/UnidadesMedida'
import EstablosPage from './pages/leche/Establos'
import DietasPage from './pages/leche/Dietas'
import AlmacenesPage from './pages/leche/Almacenes'
import TiposSalidaLechePage from './pages/leche/TiposSalidaLeche'
import CorralesPage from './pages/leche/Corrales'

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
                <Route path="productos" element={<ProductosPage />} />
                <Route path="tipos-producto" element={<TiposProductoPage />} />
                <Route path="proveedores" element={<ProveedoresPage />} />
                <Route path="unidades-medida" element={<UnidadesMedidaPage />} />
                <Route path="catalogos-generales">
                  <Route path="establos" element={<EstablosPage />} />
                  <Route path="dietas" element={<DietasPage />} />
                  <Route path="almacenes" element={<AlmacenesPage />} />
                  <Route path="tipos-salida-leche" element={<TiposSalidaLechePage />} />
                  <Route path="corrales" element={<CorralesPage />} />
                </Route>
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
                <Route path="empresas" element={<EmpresasPage />} />
                <Route path="usuarios" element={<UsuariosPage />} />
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
