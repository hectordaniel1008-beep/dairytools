import { Scale, Weight, TrendingUp, Activity, AlertTriangle } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import { useEmpresa } from '../../context/EmpresaContext'
import styles from '../dashboard/Dashboard.module.css'
import modStyles from './PesajeDashboard.module.css'

const kpis = [
  { titulo: 'Pesajes Hoy',         valor: '34',   variacion: -4.2,  icono: <Scale size={22} />,      color: 'warning'   as const, descripcion: 'Meta: 40 pesajes' },
  { titulo: 'Peso Promedio Bovino',valor: '487',  unidad: 'kg', variacion: 1.8, icono: <Weight size={22} />,     color: 'primary'   as const, descripcion: 'Hato: 48 cabezas' },
  { titulo: 'Pesajes del Mes',     valor: '318',  variacion: 6.4,   icono: <TrendingUp size={22} />, color: 'secondary' as const, descripcion: 'Todas las especies' },
  { titulo: 'Animales Monitoreados',valor: '74',  variacion: undefined, icono: <Activity size={22} />,    color: 'primary'   as const, descripcion: 'Bovinos, porcinos y ovinos' },
]

const pesajesPorEspecie = [
  { especie: 'Bovino',  cantidad: 48, promedio: 487, min: 312, max: 598 },
  { especie: 'Porcino', cantidad: 18, promedio: 92,  min: 68,  max: 120 },
  { especie: 'Ovino',   cantidad: 8,  promedio: 58,  min: 42,  max: 74  },
]

const alertas = [
  { id: 1, msg: 'Animal #15 — pérdida de peso > 5% respecto al último pesaje', tipo: 'warning' },
  { id: 2, msg: '5 animales pendientes de pesaje mensual', tipo: 'info' },
]

const especieColors: Record<string, string> = {
  Bovino:  'var(--color-primary)',
  Porcino: 'var(--color-warning)',
  Ovino:   'var(--color-secondary)',
}

export default function PesajeDashboard() {
  const { empresaActual } = useEmpresa()

  return (
    <div className={styles.page}>
      <div className={modStyles.hero}>
        <div className={modStyles.heroIcon}><Scale size={26} /></div>
        <div>
          <h2 className={modStyles.heroTitle}>Pesaje</h2>
          <p className={modStyles.heroSub}>
            {empresaActual?.nombre ?? 'Empresa'} · Dashboard del módulo
          </p>
        </div>
      </div>

      <section>
        <h3 className={styles.sectionTitle}>Indicadores</h3>
        <div className={styles.kpiGrid}>
          {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
        </div>
      </section>

      <div className={styles.bottomGrid}>
        {/* Resumen por especie */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Resumen por especie</h3>
          </div>
          <div className={modStyles.especieList}>
            {pesajesPorEspecie.map((e) => (
              <div key={e.especie} className={modStyles.especieRow}>
                <div
                  className={modStyles.especieDot}
                  style={{ background: especieColors[e.especie] }}
                />
                <div className={modStyles.especieInfo}>
                  <div className={modStyles.especieHeader}>
                    <span className={modStyles.especieNombre}>{e.especie}</span>
                    <span className={modStyles.especieCantidad}>{e.cantidad} animales</span>
                  </div>
                  <div className={modStyles.especieStats}>
                    <span>Prom: <strong>{e.promedio} kg</strong></span>
                    <span>Mín: {e.min} kg</span>
                    <span>Máx: {e.max} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <a href="/pesaje/registros" className={modStyles.verTodo}>
            Ver todos los registros →
          </a>
        </section>
      </div>
    </div>
  )
}
