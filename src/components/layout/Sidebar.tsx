import { NavLink, useLocation } from 'react-router-dom'
import { Milk, Sprout, Scale, Settings, X } from 'lucide-react'
import styles from './Sidebar.module.css'

interface NavModule {
  label: string
  icon: React.ReactNode
  base: string
  dashboardTo: string
  registrosTo: string
  mapaTo: string
}

const navModules: NavModule[] = [
  { label: 'Producción de Leche', icon: <Milk size={18} />,   base: '/leche',   dashboardTo: '/leche/dashboard',   registrosTo: '/leche/registros',   mapaTo: '/leche/mapa' },
  { label: 'Producción Agrícola', icon: <Sprout size={18} />, base: '/agricola', dashboardTo: '/agricola/dashboard', registrosTo: '/agricola/registros', mapaTo: '/agricola/mapa' },
  { label: 'Pesaje',              icon: <Scale size={18} />,  base: '/pesaje',   dashboardTo: '/pesaje/dashboard',   registrosTo: '/pesaje/registros',   mapaTo: '/pesaje/mapa' },
]

interface Props {
  onClose?: () => void
}

export default function Sidebar({ onClose }: Props) {
  const location = useLocation()

  return (
    <aside className={styles.sidebar}>

      {/* ── Logo + botón cerrar en móvil ── */}
      <div className={styles.appBrand}>
        <img src="/logo.jpeg" alt="DairyTools" className={styles.appLogo} />
        <div className={styles.appBrandText}>
          <span className={styles.appName}>DairyTools</span>
        </div>
        {/* Botón cerrar — solo visible en móvil */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">
          <X size={18} />
        </button>
      </div>

      {/* ── Módulos ── */}
      <nav className={styles.nav}>
        {navModules.map((mod) => {
          const isModuleActive = location.pathname.startsWith(mod.base)
          return (
            <div key={mod.base}>
              <NavLink
                to={mod.dashboardTo}
                className={() => `${styles.navItem} ${isModuleActive ? styles.groupActive : ''}`}
              >
                <span className={styles.navIcon}>{mod.icon}</span>
                <span className={styles.navText}>{mod.label}</span>
              </NavLink>

              {isModuleActive && (
                <div className={styles.subItems}>
                  <NavLink to={mod.registrosTo} className={({ isActive }) => `${styles.subItem} ${isActive ? styles.subActive : ''}`}>
                    Registros
                  </NavLink>
                  <NavLink to={mod.mapaTo} className={({ isActive }) => `${styles.subItem} ${isActive ? styles.subActive : ''}`}>
                    Mapa
                  </NavLink>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className={styles.spacer} />

      <div className={styles.navBottom}>
        <NavLink to="/configuracion" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <span className={styles.navIcon}><Settings size={18} /></span>
          <span className={styles.navText}>Configuración</span>
        </NavLink>
      </div>

    </aside>
  )
}
