import { useState } from 'react'
import { Plus, Search, Filter, Sprout, Save, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import styles from '../ModulePage.module.css'
import mStyles from '../ModalForm.module.css'

const mockData = [
  { id: 1, fecha: '2025-03-16', cultivo: 'Maíz',  parcela: 'B3', cantidad_kg: 200, calidad: 'A', responsable: 'Juan López' },
  { id: 2, fecha: '2025-03-16', cultivo: 'Trigo', parcela: 'A1', cantidad_kg: 350, calidad: 'B', responsable: 'María García' },
  { id: 3, fecha: '2025-03-15', cultivo: 'Sorgo', parcela: 'C2', cantidad_kg: 180, calidad: 'A', responsable: 'Carlos Ruiz' },
  { id: 4, fecha: '2025-03-15', cultivo: 'Maíz',  parcela: 'B1', cantidad_kg: 290, calidad: 'A', responsable: 'Juan López' },
]

const calidadColors: Record<string, string> = {
  A: 'var(--color-secondary)', B: 'var(--color-warning)', C: 'var(--color-error)',
}

const FORM_INIT = { fecha: '', cultivo: '', parcela: '', cantidad_kg: '', calidad: 'A', responsable: '', observaciones: '' }

export default function AgricolaPage() {
  const [busqueda, setBusqueda]   = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState(FORM_INIT)
  const [registros, setRegistros] = useState(mockData)

  const filtrado = registros.filter(r =>
    r.cultivo.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.parcela.toLowerCase().includes(busqueda.toLowerCase())
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleGuardar() {
    if (!form.fecha || !form.cultivo || !form.parcela || !form.cantidad_kg) return
    setRegistros(prev => [{
      id: Date.now(),
      fecha: form.fecha,
      cultivo: form.cultivo,
      parcela: form.parcela,
      cantidad_kg: Number(form.cantidad_kg),
      calidad: form.calidad,
      responsable: form.responsable,
    }, ...prev])
    setForm(FORM_INIT)
    setModalOpen(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.moduleIcon} style={{ background: 'var(--color-secondary-bg)', color: 'var(--color-secondary)' }}>
            <Sprout size={22} />
          </div>
          <div>
            <h2 className={styles.title}>Producción Agrícola</h2>
            <p className={styles.subtitle}>Control de cosechas por cultivo y parcela</p>
          </div>
        </div>
        <button className={styles.btnPrimary} style={{ background: 'var(--color-secondary)' }} onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Nuevo registro
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input type="text" className={styles.searchInput} placeholder="Buscar por cultivo o parcela…"
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <button className={styles.btnOutline}><Filter size={15} /> Filtros</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>
            <th>Fecha</th><th>Cultivo</th><th>Parcela</th><th>Cantidad</th><th>Calidad</th><th>Responsable</th><th>Acciones</th>
          </tr></thead>
          <tbody>
            {filtrado.map(row => (
              <tr key={row.id}>
                <td>{row.fecha}</td>
                <td>{row.cultivo}</td>
                <td>{row.parcela}</td>
                <td><span className={styles.pill} style={{ background:'var(--color-secondary-bg)', color:'var(--color-secondary)' }}>{row.cantidad_kg} kg</span></td>
                <td><span className={styles.pill} style={{ background:`${calidadColors[row.calidad]}22`, color:calidadColors[row.calidad] }}>Calidad {row.calidad}</span></td>
                <td>{row.responsable}</td>
                <td><div className={styles.rowActions}>
                  <button className={styles.actionBtn}>Editar</button>
                  <button className={`${styles.actionBtn} ${styles.danger}`}>Eliminar</button>
                </div></td>
              </tr>
            ))}
            {filtrado.length === 0 && <tr><td colSpan={7} className={styles.empty}>Sin registros</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo registro agrícola">
        <div className={mStyles.form}>
          <div className={mStyles.row2}>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Fecha *</label>
              <input type="date" name="fecha" className={mStyles.input} value={form.fecha} onChange={handleChange} />
            </div>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Calidad</label>
              <select name="calidad" className={mStyles.input} value={form.calidad} onChange={handleChange}>
                <option value="A">A — Alta</option>
                <option value="B">B — Media</option>
                <option value="C">C — Baja</option>
              </select>
            </div>
          </div>
          <div className={mStyles.row2}>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Cultivo *</label>
              <input type="text" name="cultivo" className={mStyles.input} placeholder="Ej. Maíz" value={form.cultivo} onChange={handleChange} />
            </div>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Parcela *</label>
              <input type="text" name="parcela" className={mStyles.input} placeholder="Ej. B3" value={form.parcela} onChange={handleChange} />
            </div>
          </div>
          <div className={mStyles.row2}>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Cantidad (kg) *</label>
              <input type="number" name="cantidad_kg" className={mStyles.input} placeholder="0" min="0" value={form.cantidad_kg} onChange={handleChange} />
            </div>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Responsable</label>
              <input type="text" name="responsable" className={mStyles.input} placeholder="Nombre" value={form.responsable} onChange={handleChange} />
            </div>
          </div>
          <div className={mStyles.field}>
            <label className={mStyles.label}>Observaciones</label>
            <textarea name="observaciones" className={mStyles.textarea} rows={3} placeholder="Notas…" value={form.observaciones} onChange={handleChange} />
          </div>
          <div className={mStyles.actions}>
            <button className={mStyles.btnCancel} onClick={() => setModalOpen(false)}><X size={15}/> Cancelar</button>
            <button className={mStyles.btnSave} style={{ background:'var(--color-secondary)' }} onClick={handleGuardar}><Save size={15}/> Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
