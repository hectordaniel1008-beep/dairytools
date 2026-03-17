import styles from './KpiCard.module.css'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  titulo: string
  valor: string | number
  unidad?: string
  variacion?: number
  icono: React.ReactNode
  color?: 'primary' | 'secondary' | 'warning' | 'error'
  descripcion?: string
}

export default function KpiCard({
  titulo,
  valor,
  unidad,
  variacion,
  icono,
  color = 'primary',
  descripcion,
}: Props) {
  const isPositive = variacion !== undefined && variacion >= 0

  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>{icono}</div>
        {variacion !== undefined && (
          <span className={`${styles.badge} ${isPositive ? styles.up : styles.down}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(variacion)}%
          </span>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.titulo}>{titulo}</p>
        <div className={styles.valorRow}>
          <span className={styles.valor}>{valor}</span>
          {unidad && <span className={styles.unidad}>{unidad}</span>}
        </div>
        {descripcion && <p className={styles.descripcion}>{descripcion}</p>}
      </div>
    </div>
  )
}
