import { Milk, Sprout, Scale, Activity } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import styles from './Dashboard.module.css'

// Datos de ejemplo — reemplazar con llamadas a la API
const kpis = [
  {
    titulo: 'Producción de Leche Hoy',
    valor: '1,240',
    unidad: 'L',
    variacion: 8.3,
    icono: <Milk size={22} />,
    color: 'primary' as const,
    descripcion: 'Meta diaria: 1,500 L',
  },
  {
    titulo: 'Cosecha Agrícola del Mes',
    valor: '18.4',
    unidad: 'ton',
    variacion: 12.1,
    icono: <Sprout size={22} />,
    color: 'secondary' as const,
    descripcion: '3 cultivos activos',
  },
  {
    titulo: 'Pesajes Realizados Hoy',
    valor: '34',
    variacion: -4.2,
    icono: <Scale size={22} />,
    color: 'warning' as const,
    descripcion: 'Peso promedio: 480 kg',
  },
  {
    titulo: 'Actividad Total del Mes',
    valor: '312',
    variacion: 5.7,
    icono: <Activity size={22} />,
    color: 'primary' as const,
    descripcion: 'Registros en todos los módulos',
  },
]

const actividadReciente = [
  { id: 1, modulo: 'Leche',    desc: 'Registro de 45 L — Vaca #12',       hora: '08:30', tipo: 'leche' },
  { id: 2, modulo: 'Pesaje',   desc: 'Pesaje bovino — Animal #47: 512 kg', hora: '08:15', tipo: 'pesaje' },
  { id: 3, modulo: 'Agrícola', desc: 'Cosecha maíz — Parcela B3: 200 kg',  hora: '07:50', tipo: 'agricola' },
  { id: 4, modulo: 'Leche',    desc: 'Registro de 38 L — Vaca #7',         hora: '07:30', tipo: 'leche' },
  { id: 5, modulo: 'Pesaje',   desc: 'Pesaje bovino — Animal #22: 498 kg', hora: '07:10', tipo: 'pesaje' },
]

const moduloColors: Record<string, string> = {
  leche:    'var(--color-primary)',
  agricola: 'var(--color-secondary)',
  pesaje:   'var(--color-warning)',
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className={styles.page}>
      {/* Encabezado */}
      <div className={styles.hero}>
        <div>
          <h2 className={styles.greeting}>¡Buenos días! 👋</h2>
          <p className={styles.date}>{today}</p>
        </div>
        <div className={styles.heroBadge}>
          <span className={styles.heroDot} />
          DairyToolsApp operativo
        </div>
      </div>

      {/* KPIs */}
      <section>
        <h3 className={styles.sectionTitle}>Indicadores del día</h3>
        <div className={styles.kpiGrid}>
          {kpis.map((kpi, i) => (
            <KpiCard key={i} {...kpi} />
          ))}
        </div>
      </section>

      {/* Panel inferior */}
      <div className={styles.bottomGrid}>
        {/* Actividad reciente */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Actividad Reciente</h3>
            <span className={styles.cardBadge}>{actividadReciente.length} registros</span>
          </div>
          <div className={styles.activityList}>
            {actividadReciente.map((item) => (
              <div key={item.id} className={styles.activityItem}>
                <span
                  className={styles.activityDot}
                  style={{ background: moduloColors[item.tipo] }}
                />
                <div className={styles.activityBody}>
                  <span className={styles.activityModule}>{item.modulo}</span>
                  <p className={styles.activityDesc}>{item.desc}</p>
                </div>
                <span className={styles.activityTime}>{item.hora}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Accesos rápidos */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Accesos Rápidos</h3>
          </div>
          <div className={styles.quickLinks}>
            {[
              { label: 'Nuevo registro de leche', icono: <Milk size={18} />,   color: 'primary',   href: '/leche' },
              { label: 'Registrar cosecha',        icono: <Sprout size={18} />, color: 'secondary', href: '/agricola' },
              { label: 'Registrar pesaje',         icono: <Scale size={18} />,  color: 'warning',   href: '/pesaje' },
            ].map((link) => (
              <a key={link.href} href={link.href} className={`${styles.quickLink} ${styles[link.color]}`}>
                <span className={styles.quickIcon}>{link.icono}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          {/* Resumen de módulos */}
          <div className={styles.cardHeader} style={{ marginTop: '20px' }}>
            <h3 className={styles.cardTitle}>Estado de Módulos</h3>
          </div>
          <div className={styles.moduleStatus}>
            {[
              { nombre: 'Producción de Leche', ok: true,  val: '83% de meta' },
              { nombre: 'Producción Agrícola', ok: true,  val: '3 cultivos' },
              { nombre: 'Pesaje',              ok: false, val: 'Pendientes: 5' },
            ].map((m) => (
              <div key={m.nombre} className={styles.moduleRow}>
                <span className={`${styles.statusDot} ${m.ok ? styles.statusOk : styles.statusWarn}`} />
                <span className={styles.moduleName}>{m.nombre}</span>
                <span className={styles.moduleVal}>{m.val}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
