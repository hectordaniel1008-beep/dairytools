import { useState } from 'react'
import { Bell, ChevronDown, LogOut, User, Check, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useEmpresa, getIniciales } from '../../context/EmpresaContext'
import { useNavigate } from 'react-router-dom'
import styles from './Topbar.module.css'

interface Props {
  onMenuToggle: () => void
}

export default function Topbar({ onMenuToggle }: Props) {
  const { user, logout } = useAuth()
  const { empresas, empresaActual, setEmpresaActual } = useEmpresa()
  const navigate = useNavigate()

  const [menuOpen,    setMenuOpen]    = useState(false)
  const [notiOpen,    setNotiOpen]    = useState(false)
  const [empresaOpen, setEmpresaOpen] = useState(false)

  function handleLogout() { logout(); navigate('/login') }

  const initials     = user?.nombre ? user.nombre.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'U'
  const accentColor  = empresaActual?.color ?? 'var(--color-primary)'
  const empresaInic  = empresaActual ? getIniciales(empresaActual.nombre) : '?'

  return (
    <header className={styles.topbar}>

      {/* ── Izquierda: hamburguesa (móvil) + selector empresa ── */}
      <div className={styles.left}>

        {/* Botón hamburguesa — solo móvil */}
        <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="Abrir menú">
          <Menu size={20} />
        </button>

        {/* Selector de empresa */}
        <div className={styles.empresaWrap}>
          <button
            className={styles.empresaBtn}
            onClick={() => { setEmpresaOpen(!empresaOpen); setMenuOpen(false); setNotiOpen(false) }}
          >
            <div className={styles.empresaLogo} style={{ background: accentColor }}>
              {empresaInic}
            </div>
            <div className={styles.empresaInfo}>
              <span className={styles.empresaNombre}>{empresaActual?.nombre ?? 'Sin empresa'}</span>
              <span className={styles.empresaSub}>{empresaActual?.rfc ?? ''}</span>
            </div>
            <ChevronDown size={14} className={`${styles.empresaChevron} ${empresaOpen ? styles.open : ''}`} />
          </button>

          {empresaOpen && (
            <div className={styles.empresaDropdown}>
              <p className={styles.dropLabel}>Seleccionar empresa</p>
              {empresas.map(emp => (
                <button key={emp.id} className={styles.empresaOption}
                  onClick={() => { setEmpresaActual(emp); setEmpresaOpen(false) }}>
                  <div className={styles.optionLogo} style={{ background: emp.color ?? 'var(--color-primary)' }}>
                    {getIniciales(emp.nombre)}
                  </div>
                  <span className={styles.optionNombre}>{emp.nombre}</span>
                  {empresaActual?.id === emp.id && <Check size={13} className={styles.optionCheck} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Derecha: notificaciones + usuario ── */}
      <div className={styles.actions}>

        {/* Notificaciones */}
        <div className={styles.notifWrap}>
          <button className={styles.iconBtn}
            onClick={() => { setNotiOpen(!notiOpen); setMenuOpen(false); setEmpresaOpen(false) }}>
            <Bell size={18} />
            <span className={styles.notifDot} />
          </button>

          {notiOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <span>Notificaciones</span>
                <button className={styles.markAll}>Marcar todas leídas</button>
              </div>
              {[
                { id: 1, msg: 'Nuevo registro de leche ingresado', time: 'Hace 5 min', tipo: 'info' },
                { id: 2, msg: 'Peso promedio por debajo del límite', time: 'Hace 1 h', tipo: 'warning' },
                { id: 3, msg: 'Cosecha agrícola completada', time: 'Hace 3 h', tipo: 'success' },
              ].map(n => (
                <div key={n.id} className={`${styles.notifItem} ${styles[n.tipo]}`}>
                  <span className={styles.notifDotColor} />
                  <div>
                    <p className={styles.notifMsg}>{n.msg}</p>
                    <p className={styles.notifTime}>{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.sep} />

        {/* Usuario */}
        <div className={styles.userWrap}>
          <button className={styles.userBtn}
            onClick={() => { setMenuOpen(!menuOpen); setNotiOpen(false); setEmpresaOpen(false) }}>
            <div className={styles.avatar}>{initials}</div>
            {/* Nombre y rol — ocultos en móvil */}
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.nombre ?? 'Usuario'}</span>
              <span className={styles.userRole}>{user?.rol ?? 'operador'}</span>
            </div>
            <ChevronDown size={14} className={styles.chevron} />
          </button>

          {menuOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem}><User size={15} /> Mi perfil</button>
              <div className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={handleLogout}>
                <LogOut size={15} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
