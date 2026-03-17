import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Cierra el sidebar al navegar en móvil
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className={styles.layout}>

      {/* Overlay oscuro en móvil */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — recibe estado abierto/cerrado */}
      <div className={`${styles.sidebarWrap} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Área principal */}
      <div className={styles.main}>
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

    </div>
  )
}
