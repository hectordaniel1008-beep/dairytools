import { Sprout, BarChart3, Layers, CloudSun, AlertTriangle } from 'lucide-react'
import KpiCard from '../../components/ui/KpiCard'
import { useEmpresa } from '../../context/EmpresaContext'
import styles from '../dashboard/Dashboard.module.css'
import modStyles from './AgricolaDashboard.module.css'

const kpis = [
  { titulo: 'Cosecha del Mes',      valor: '18.4',  unidad: 'ton', variacion: 12.1,  icono: <Sprout size={22} />,    color: 'secondary' as const, descripcion: '3 cultivos activos' },
  { titulo: 'Cosecha Hoy',         valor: '870',   unidad: 'kg',  variacion: 5.2,   icono: <BarChart3 size={22} />, color: 'primary'   as const, descripcion: '4 parcelas activas' },
  { titulo: 'Parcelas en Proceso', valor: '7',                     variacion: undefined, icono: <Layers size={22} />,    color: 'warning'   as const, descripcion: 'De 12 parcelas totales' },
  { titulo: 'Condición Climática', valor: 'Buena',                 variacion: undefined, icono: <CloudSun size={22} />,  color: 'secondary' as const, descripcion: 'Sin alertas' },
]

const cultivos = [
  { nombre: 'Maíz',  parcelas: 3, kgMes: 8200, calidad: 'A', pct: 72 },
  { nombre: 'Trigo', parcelas: 2, kgMes: 6100, calidad: 'B', pct: 55 },
  { nombre: 'Sorgo', parcelas: 2, kgMes: 4100, calidad: 'A', pct: 38 },
]

const alertas = [
  { id: 1, msg: 'Parcela C1 — humedad por debajo del mínimo recomendado', tipo: 'warning' },
  { id: 2, msg: 'Cosecha de trigo programada para mañana — Parcelas A1, A2', tipo: 'info' },
]

export default function AgricolaDashboard() {
  const { empresaActual } = useEmpresa()

  return (
    <div className={styles.page}>
      <div className={modStyles.hero}>
        <div className={modStyles.heroIcon}><Sprout size={26} /></div>
        <div>
          <h2 className={modStyles.heroTitle}>Producción Agrícola</h2>
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
        {/* Resumen de cultivos */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Producción por cultivo — mes actual</h3>
          </div>
          <div className={modStyles.cultivoList}>
            {cultivos.map((c) => (
              <div key={c.nombre} className={modStyles.cultivoRow}>
                <div className={modStyles.cultivoHeader}>
                  <span className={modStyles.cultivoNombre}>{c.nombre}</span>
                  <span className={modStyles.cultivoKg}>{c.kgMes.toLocaleString()} kg</span>
                </div>
                <div className={modStyles.progressBar}>
                  <div className={modStyles.progressFill} style={{ width: `${c.pct}%` }} />
                </div>
                <div className={modStyles.cultivoMeta}>
                  <span>{c.parcelas} parcelas</span>
                  <span className={`${modStyles.calidad} ${modStyles['cal' + c.calidad]}`}>
                    Calidad {c.calidad}
                  </span>
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
          <a href="/agricola/registros" className={modStyles.verTodo}>
            Ver todos los registros →
          </a>
        </section>
      </div>
    </div>
  )
}
