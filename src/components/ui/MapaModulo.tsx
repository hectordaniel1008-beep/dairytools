import { useState } from 'react'
import { MapPin, Navigation, Crosshair, Trash2, Download, Info } from 'lucide-react'
import styles from './MapaModulo.module.css'

interface Marcador {
  id: number
  lat: number
  lng: number
  etiqueta: string
  tipo: 'parcela' | 'animal' | 'punto'
  color: string
}

interface Props {
  titulo: string
  // Coordenadas centro del mapa (ajustar a la ubicación del rancho)
  lat?: number
  lng?: number
  zoom?: number
}

// Coordenadas de ejemplo — cambiar por las del rancho real
const DEFAULT_LAT  = 25.4232
const DEFAULT_LNG  = -100.9963
const DEFAULT_ZOOM = 15

const TIPOS = [
  { value: 'parcela', label: 'Parcela',  color: '#2da44e' },
  { value: 'animal',  label: 'Animal',   color: '#1e5a96' },
  { value: 'punto',   label: 'Punto',    color: '#e69519' },
]

export default function MapaModulo({
  titulo,
  lat  = DEFAULT_LAT,
  lng  = DEFAULT_LNG,
  zoom = DEFAULT_ZOOM,
}: Props) {
  const [marcadores, setMarcadores] = useState<Marcador[]>([
    { id: 1, lat: lat + 0.001,  lng: lng + 0.001,  etiqueta: 'Parcela A1', tipo: 'parcela', color: '#2da44e' },
    { id: 2, lat: lat - 0.0005, lng: lng + 0.0008, etiqueta: 'Corral #1',  tipo: 'animal',  color: '#1e5a96' },
  ])
  const [tipoActivo, setTipoActivo] = useState<'parcela' | 'animal' | 'punto'>('punto')
  const [etiqueta,   setEtiqueta]   = useState('')
  const [modoMarcar, setModoMarcar] = useState(false)
  const [seleccionado, setSeleccionado] = useState<number | null>(null)

  function agregarMarcador() {
    // En producción esto recibirá las coordenadas del click en el mapa
    // Por ahora simula un marcador aleatorio cerca del centro
    const tipoObj = TIPOS.find(t => t.value === tipoActivo)!
    const nuevo: Marcador = {
      id:       Date.now(),
      lat:      lat + (Math.random() - 0.5) * 0.004,
      lng:      lng + (Math.random() - 0.5) * 0.004,
      etiqueta: etiqueta || `${tipoObj.label} ${marcadores.length + 1}`,
      tipo:     tipoActivo,
      color:    tipoObj.color,
    }
    setMarcadores(prev => [...prev, nuevo])
    setEtiqueta('')
    setModoMarcar(false)
  }

  function eliminarMarcador(id: number) {
    setMarcadores(prev => prev.filter(m => m.id !== id))
    setSeleccionado(null)
  }

  // Construir URL de embed de Google Maps con marcadores
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&t=h`

  return (
    <div className={styles.page}>
      <div className={styles.layout}>

        {/* ── Panel lateral de control ── */}
        <aside className={styles.panel}>
          <h3 className={styles.panelTitle}>{titulo} — Mapa</h3>

          {/* Modo marcar */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Agregar marcador</p>

            <div className={styles.tipoGrid}>
              {TIPOS.map(t => (
                <button
                  key={t.value}
                  className={`${styles.tipoBtn} ${tipoActivo === t.value ? styles.tipoBtnActive : ''}`}
                  style={tipoActivo === t.value ? { borderColor: t.color, color: t.color } : {}}
                  onClick={() => setTipoActivo(t.value as typeof tipoActivo)}
                >
                  <span className={styles.tipoDot} style={{ background: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>

            <input
              className={styles.input}
              placeholder="Etiqueta (opcional)"
              value={etiqueta}
              onChange={e => setEtiqueta(e.target.value)}
            />

            <button
              className={`${styles.actionBtn} ${modoMarcar ? styles.actionBtnActive : ''}`}
              onClick={() => setModoMarcar(!modoMarcar)}
            >
              <Crosshair size={15} />
              {modoMarcar ? 'Cancelar selección' : 'Seleccionar en mapa'}
            </button>

            <button className={styles.primaryBtn} onClick={agregarMarcador}>
              <MapPin size={15} /> Agregar marcador
            </button>
          </div>

          {/* Herramientas */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Herramientas</p>
            <div className={styles.toolGroup}>
              <button className={styles.toolBtn}>
                <Navigation size={15} /> Mi ubicación
              </button>
              <button className={styles.toolBtn}>
                <Download size={15} /> Exportar KML
              </button>
            </div>
          </div>

          {/* Lista de marcadores */}
          <div className={styles.section} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <p className={styles.sectionLabel}>
              Marcadores <span className={styles.count}>{marcadores.length}</span>
            </p>
            <div className={styles.marcadorList}>
              {marcadores.map(m => (
                <div
                  key={m.id}
                  className={`${styles.marcadorItem} ${seleccionado === m.id ? styles.marcadorSelected : ''}`}
                  onClick={() => setSeleccionado(seleccionado === m.id ? null : m.id)}
                >
                  <MapPin size={14} style={{ color: m.color, flexShrink: 0 }} />
                  <div className={styles.marcadorInfo}>
                    <span className={styles.marcadorLabel}>{m.etiqueta}</span>
                    <span className={styles.marcadorCoords}>
                      {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                    </span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={e => { e.stopPropagation(); eliminarMarcador(m.id) }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {marcadores.length === 0 && (
                <p className={styles.empty}>Sin marcadores aún</p>
              )}
            </div>
          </div>

          {/* Nota */}
          <div className={styles.nota}>
            <Info size={13} />
            <span>Configura las coordenadas del rancho en el componente MapaModulo.tsx</span>
          </div>
        </aside>

        {/* ── Mapa ── */}
        <div className={styles.mapWrap}>
          {modoMarcar && (
            <div className={styles.mapOverlay}>
              <div className={styles.mapOverlayMsg}>
                <Crosshair size={20} />
                Haz clic en el mapa para colocar el marcador
              </div>
            </div>
          )}
          <iframe
            className={styles.map}
            src={mapSrc}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa"
          />
        </div>

      </div>
    </div>
  )
}
