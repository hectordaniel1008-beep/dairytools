import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Milk, Sprout, Scale, Settings, X, ChevronRight } from 'lucide-react'
import styles from './Sidebar.module.css'

interface SubItem {
  label: string
  to: string
}

interface NavModule {
  label: string
  icon: React.ReactNode
  base: string
  subItems: SubItem[]
}

const navModules: NavModule[] = [
  {
    label: 'Producción de Leche',
    icon: <Milk size={18} />,
    base: '/leche',
    subItems: [
      { label: 'Dashboard', to: '/leche/dashboard' },
      { label: 'Registros', to: '/leche/registros' },
      { label: 'Mapa', to: '/leche/mapa' },
    ],
  },
  {
    label: 'Producción Agrícola',
    icon: <Sprout size={18} />,
    base: '/agricola',
    subItems: [
      { label: 'Dashboard', to: '/agricola/dashboard' },
    ],
  },
  {
    label: 'Pesaje',
    icon: <Scale size={18} />,
    base: '/pesaje',
    subItems: [
      { label: 'Dashboard', to: '/pesaje/dashboard' },
    ],
  },
  {
    label: 'Configuración',
    icon: <Settings size={18} />,
    base: '/configuracion',
    subItems: [
      { label: 'Empresas', to: '/configuracion/empresas' },
      { label: 'Usuarios', to: '/configuracion/usuarios' },
    ],
  },
]

interface Props {
  onClose?: () => void
}

export default function Sidebar({ onClose }: Props) {
  const location = useLocation()

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    navModules.forEach((m) => {
      init[m.base] = location.pathname.startsWith(m.base)
    })
    return init
  })

  function toggleModule(base: string) {
    setExpanded((prev) => ({ ...prev, [base]: !prev[base] }))
  }

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
          const isOpen = expanded[mod.base] ?? false
          return (
            <div key={mod.base}>
              <button
                className={`${styles.navItem} ${isModuleActive ? styles.groupActive : ''}`}
                onClick={() => toggleModule(mod.base)}
              >
                <span className={styles.navIcon}>{mod.icon}</span>
                <span className={styles.navText}>{mod.label}</span>
                <ChevronRight size={14} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
              </button>

              {isOpen && (
                <div className={styles.subItems}>
                  {mod.subItems.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) => `${styles.subItem} ${isActive ? styles.subActive : ''}`}
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className={styles.spacer} />

    </aside>
  )
}
