import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Archive, ArrowRight, BookOpen, Building, ChevronRight, FileText, Home, Layers, MapPin, Milk, Package, Scale, Settings, Sprout, User, X } from 'lucide-react'
import styles from './Sidebar.module.css'

interface SubItem {
  label: string
  to?: string
  subItems?: SubItem[]
  icon?: React.ReactNode
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
      { label: 'Dashboard', to: '/leche/dashboard', icon: <Home size={14} /> },
      { label: 'Registros', to: '/leche/registros', icon: <FileText size={14} /> },
      { label: 'Mapa', to: '/leche/mapa', icon: <MapPin size={14} /> },
      { label: 'Productos', to: '/leche/productos', icon: <Package size={14} /> },
      {
        label: 'Catálogos',
        icon: <BookOpen size={14} />,
        subItems: [
          { label: 'Tipo de producto', to: '/leche/tipos-producto', icon: <Package size={14} /> },
          { label: 'Proveedor', to: '/leche/proveedores', icon: <User size={14} /> },
          { label: 'Unidades de medida', to: '/leche/unidades-medida', icon: <Scale size={14} /> },
        ],
      },
      {
        label: 'Catalogos generales',
        icon: <Layers size={14} />,
        subItems: [
          { label: 'Establos', to: '/leche/catalogos-generales/establos', icon: <Building size={14} /> },
          { label: 'Dietas', to: '/leche/catalogos-generales/dietas', icon: <Sprout size={14} /> },
          { label: 'Almacenes', to: '/leche/catalogos-generales/almacenes', icon: <Archive size={14} /> },
          { label: 'Tipos de salidas de leche', to: '/leche/catalogos-generales/tipos-salida-leche', icon: <ArrowRight size={14} /> },
          { label: 'Corrales', to: '/leche/catalogos-generales/corrales', icon: <MapPin size={14} /> },
        ],
      },
    ],
  },
  {
    label: 'Producción Agrícola',
    icon: <Sprout size={18} />,
    base: '/agricola',
    subItems: [
      { label: 'Dashboard', to: '/agricola/dashboard', icon: <Home size={14} /> },
    ],
  },
  {
    label: 'Pesaje',
    icon: <Scale size={18} />,
    base: '/pesaje',
    subItems: [
      { label: 'Dashboard', to: '/pesaje/dashboard', icon: <Home size={14} /> },
    ],
  },
  {
    label: 'Configuración',
    icon: <Settings size={18} />,
    base: '/configuracion',
    subItems: [
      { label: 'Empresas', to: '/configuracion/empresas', icon: <Building size={14} /> },
      { label: 'Usuarios', to: '/configuracion/usuarios', icon: <User size={14} /> },
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

  const [subExpanded, setSubExpanded] = useState<Record<string, boolean>>({})

  function toggleModule(base: string) {
    setExpanded((prev) => ({ ...prev, [base]: !prev[base] }))
  }

  function toggleSub(base: string, label: string) {
    const key = `${base}-${label}`
    setSubExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function renderSubItems(items: SubItem[], base: string, level: number = 0) {
    return items.map((item) => {
      if (item.subItems) {
        const key = `${base}-${item.label}`
        const isOpen = subExpanded[key] ?? false
        return (
          <div key={item.label}>
            <button
              className={`${styles.subItem} ${styles.subGroup} ${item.icon ? styles.hasIcon : ''}`}
              onClick={() => toggleSub(base, item.label)}
            >
              {item.icon && <span className={styles.subIcon}>{item.icon}</span>}
              <span>{item.label}</span>
              <ChevronRight size={14} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
            </button>
            {isOpen && (
              <div className={styles.nestedItems}>
                {renderSubItems(item.subItems, base, level + 1)}
              </div>
            )}
          </div>
        )
      } else {
        return (
          <NavLink
            key={item.to}
            to={item.to!}
            className={({ isActive }) => `${styles.subItem} ${item.icon ? styles.hasIcon : ''} ${isActive ? styles.subActive : ''}`}
          >
            {item.icon && <span className={styles.subIcon}>{item.icon}</span>}
            {item.label}
          </NavLink>
        )
      }
    })
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
                  {renderSubItems(mod.subItems, mod.base)}
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
