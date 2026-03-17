import { useState } from 'react'
import { Plus, Search, Filter, Milk, Save, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import styles from '../ModulePage.module.css'
import mStyles from '../ModalForm.module.css'

const mockData = [
  { id: 1, fecha: '2025-03-16', animal_nombre: 'Vaca #12', cantidad_litros: 45, turno: 'mañana', observaciones: '' },
  { id: 2, fecha: '2025-03-16', animal_nombre: 'Vaca #7',  cantidad_litros: 38, turno: 'mañana', observaciones: '' },
  { id: 3, fecha: '2025-03-16', animal_nombre: 'Vaca #3',  cantidad_litros: 52, turno: 'tarde',  observaciones: 'Producción alta' },
  { id: 4, fecha: '2025-03-15', animal_nombre: 'Vaca #12', cantidad_litros: 41, turno: 'mañana', observaciones: '' },
  { id: 5, fecha: '2025-03-15', animal_nombre: 'Vaca #7',  cantidad_litros: 36, turno: 'tarde',  observaciones: '' },
]

const FORM_INIT = { fecha: '', animal_nombre: '', cantidad_litros: '', turno: 'mañana', observaciones: '' }

export default function LechePage() {
  const [busqueda, setBusqueda]   = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState(FORM_INIT)
  const [registros, setRegistros] = useState(mockData)

  const filtrado = registros.filter(r =>
    r.animal_nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleGuardar() {
    if (!form.fecha || !form.animal_nombre || !form.cantidad_litros) return
    setRegistros(prev => [{
      id: Date.now(),
      fecha: form.fecha,
      animal_nombre: form.animal_nombre,
      cantidad_litros: Number(form.cantidad_litros),
      turno: form.turno as 'mañana' | 'tarde',
      observaciones: form.observaciones,
    }, ...prev])
    setForm(FORM_INIT)
    setModalOpen(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.moduleIcon} style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
            <Milk size={22} />
          </div>
          <div>
            <h2 className={styles.title}>Producción de Leche</h2>
            <p className={styles.subtitle}>Registros de producción diaria</p>
          </div>
        </div>
        <button className={styles.btnPrimary} onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Nuevo registro
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input type="text" className={styles.searchInput} placeholder="Buscar por animal…"
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <button className={styles.btnOutline}><Filter size={15} /> Filtros</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>
            <th>Fecha</th><th>Animal</th><th>Litros</th><th>Turno</th><th>Observaciones</th><th>Acciones</th>
          </tr></thead>
          <tbody>
            {filtrado.map(row => (
              <tr key={row.id}>
                <td>{row.fecha}</td>
                <td>{row.animal_nombre}</td>
                <td><span className={styles.pill} style={{ background:'var(--color-primary-bg)', color:'var(--color-primary)' }}>{row.cantidad_litros} L</span></td>
                <td className={styles.capitalize}>{row.turno}</td>
                <td className={styles.muted}>{row.observaciones || '—'}</td>
                <td><div className={styles.rowActions}>
                  <button className={styles.actionBtn}>Editar</button>
                  <button className={`${styles.actionBtn} ${styles.danger}`}>Eliminar</button>
                </div></td>
              </tr>
            ))}
            {filtrado.length === 0 && <tr><td colSpan={6} className={styles.empty}>Sin registros</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo registro de leche">
        <div className={mStyles.form}>
          <div className={mStyles.row2}>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Fecha *</label>
              <input type="date" name="fecha" className={mStyles.input} value={form.fecha} onChange={handleChange} />
            </div>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Turno *</label>
              <select name="turno" className={mStyles.input} value={form.turno} onChange={handleChange}>
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
              </select>
            </div>
          </div>
          <div className={mStyles.field}>
            <label className={mStyles.label}>Animal *</label>
            <input type="text" name="animal_nombre" className={mStyles.input} placeholder="Ej. Vaca #12" value={form.animal_nombre} onChange={handleChange} />
          </div>
          <div className={mStyles.field}>
            <label className={mStyles.label}>Cantidad (litros) *</label>
            <input type="number" name="cantidad_litros" className={mStyles.input} placeholder="0" min="0" step="0.5" value={form.cantidad_litros} onChange={handleChange} />
          </div>
          <div className={mStyles.field}>
            <label className={mStyles.label}>Observaciones</label>
            <textarea name="observaciones" className={mStyles.textarea} rows={3} placeholder="Notas adicionales…" value={form.observaciones} onChange={handleChange} />
          </div>
          <div className={mStyles.actions}>
            <button className={mStyles.btnCancel} onClick={() => setModalOpen(false)}><X size={15}/> Cancelar</button>
            <button className={mStyles.btnSave} onClick={handleGuardar}><Save size={15}/> Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
