import { Milk, TrendingUp, Droplets, CalendarDays, AlertTriangle } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import { useEmpresa } from '../../context/EmpresaContext'
import styles from '../dashboard/Dashboard.module.css'
import modStyles from './LecheDashboard.module.css'

// Datos de ejemplo — reemplazar con lecheService.resumen()
const kpis = [
  { titulo: 'Producción Hoy',     valor: '1,240', unidad: 'L',  variacion: 8.3,  icono: <Milk size={22} />,       color: 'primary'   as const, descripcion: 'Meta: 1,500 L' },
  { titulo: 'Producción del Mes', valor: '28,450', unidad: 'L', variacion: 12.1, icono: <TrendingUp size={22} />, color: 'secondary' as const, descripcion: 'Mes anterior: 25,370 L' },
  { titulo: 'Promedio por Animal',valor: '31.2',  unidad: 'L',  variacion: 3.5,  icono: <Droplets size={22} />,   color: 'primary'   as const, descripcion: 'Por ordeña' },
  { titulo: 'Días sin Incidencias',valor: '12',                  variacion: undefined, icono: <CalendarDays size={22} />, color: 'secondary' as const, descripcion: 'Racha actual' },
]

const registrosHoy = [
  { animal: 'Vaca #12', manana: 24, tarde: 21, total: 45 },
  { animal: 'Vaca #7',  manana: 20, tarde: 18, total: 38 },
  { animal: 'Vaca #3',  manana: 28, tarde: 24, total: 52 },
  { animal: 'Vaca #19', manana: 22, tarde: 19, total: 41 },
  { animal: 'Vaca #5',  manana: 18, tarde: 16, total: 34 },
]

const alertas = [
  { id: 1, msg: 'Vaca #8 — producción 35% por debajo del promedio', tipo: 'warning' },
  { id: 2, msg: 'Pendiente registro turno tarde — 3 animales',       tipo: 'info' },
]

export default function LecheDashboard() {
  const { empresaActual } = useEmpresa()

  return (
    <div className={styles.page}>
      {/* Hero del módulo */}
      <div className={modStyles.hero}>
        <div className={modStyles.heroIcon}><Milk size={26} /></div>
        <div>
          <h2 className={modStyles.heroTitle}>Producción de Leche</h2>
          <p className={modStyles.heroSub}>
            {empresaActual?.nombre ?? 'Empresa'} · Dashboard del módulo
          </p>
        </div>
      </div>

      {/* KPIs */}
      <section>
        <h3 className={styles.sectionTitle}>Indicadores</h3>
        <div className={styles.kpiGrid}>
          {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
        </div>
      </section>

      {/* Panel inferior */}
      <div className={styles.bottomGrid}>
        {/* Tabla de hoy */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Registros de hoy por animal</h3>
            <span className={styles.cardBadge}>{registrosHoy.length} animales</span>
          </div>
          <table className={modStyles.table}>
            <thead>
              <tr>
                <th>Animal</th>
                <th>Mañana (L)</th>
                <th>Tarde (L)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {registrosHoy.map((r) => (
                <tr key={r.animal}>
                  <td>{r.animal}</td>
                  <td>{r.manana}</td>
                  <td>{r.tarde}</td>
                  <td>
                    <span className={modStyles.totalPill}>{r.total} L</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Alertas */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Alertas y Avisos</h3>
            <span className={styles.cardBadge}>{alertas.length}</span>
          </div>
          <div className={modStyles.alertList}>
            {alertas.map((a) => (
              <div key={a.id} className={`${modStyles.alertItem} ${modStyles[a.tipo]}`}>
                <AlertTriangle size={15} className={modStyles.alertIcon} />
                <p>{a.msg}</p>
              </div>
            ))}
          </div>
          <a href="/leche/registros" className={modStyles.verTodo}>
            Ver todos los registros →
          </a>
        </section>
      </div>
    </div>
  )
}
