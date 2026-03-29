import { useState } from 'react'
import { Plus, Search, Filter, Scale, Save, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import styles from '../ModulePage.module.css'
import mStyles from '../ModalForm.module.css'

const mockData = [
  { id: 1, fecha: '2025-03-16', animal_nombre: 'Animal #47', peso_kg: 512, tipo: 'bovino', operador: 'Pedro Sánchez' },
  { id: 2, fecha: '2025-03-16', animal_nombre: 'Animal #22', peso_kg: 498, tipo: 'bovino', operador: 'Pedro Sánchez' },
  { id: 3, fecha: '2025-03-16', animal_nombre: 'Animal #5', peso_kg: 89, tipo: 'porcino', operador: 'Ana Martínez' },
  { id: 4, fecha: '2025-03-15', animal_nombre: 'Animal #31', peso_kg: 475, tipo: 'bovino', operador: 'Pedro Sánchez' },
  { id: 5, fecha: '2025-03-15', animal_nombre: 'Animal #12', peso_kg: 62, tipo: 'ovino', operador: 'Ana Martínez' },
]

const tipoColors: Record<string, { bg: string; text: string }> = {
  bovino: { bg: 'var(--color-primary-bg)', text: 'var(--color-primary)' },
  porcino: { bg: '#fff6e6', text: 'var(--color-warning)' },
  ovino: { bg: 'var(--color-secondary-bg)', text: 'var(--color-secondary)' },
}

const FORM_INIT = { fecha: '', animal_nombre: '', peso_kg: '', tipo: 'bovino', operador: '', observaciones: '' }

export default function PesajePage() {
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(FORM_INIT)
  const [registros, setRegistros] = useState(mockData)

  const filtrado = registros.filter(r =>
    r.animal_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.tipo.toLowerCase().includes(busqueda.toLowerCase())
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleGuardar() {
    if (!form.fecha || !form.animal_nombre || !form.peso_kg) return
    setRegistros(prev => [{
      id: Date.now(),
      fecha: form.fecha,
      animal_nombre: form.animal_nombre,
      peso_kg: Number(form.peso_kg),
      tipo: form.tipo,
      operador: form.operador,
    }, ...prev])
    setForm(FORM_INIT)
    setModalOpen(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.moduleIcon} style={{ background: '#fff6e6', color: 'var(--color-warning)' }}>
            <Scale size={22} />
          </div>
          <div>
            <h2 className={styles.title}>Pesaje</h2>
            <p className={styles.subtitle}>Control de pesos por especie</p>
          </div>
        </div>
        <button className={styles.btnPrimary} style={{ background: '#e69519' }} onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Nuevo pesaje
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input type="text" className={styles.searchInput} placeholder="Buscar por animal o tipo…"
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <button className={styles.btnOutline}><Filter size={15} /> Filtros</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>
            <th>Fecha</th><th>Animal</th><th>Peso</th><th>Tipo</th><th>Operador</th><th>Acciones</th>
          </tr></thead>
          <tbody>
            {filtrado.map(row => (
              <tr key={row.id}>
                <td>{row.fecha}</td>
                <td>{row.animal_nombre}</td>
                <td><span className={styles.pill} style={{ background: '#fff6e6', color: 'var(--color-warning)' }}>{row.peso_kg} kg</span></td>
                <td><span className={styles.pill} style={{ background: tipoColors[row.tipo].bg, color: tipoColors[row.tipo].text }}>{row.tipo.charAt(0).toUpperCase() + row.tipo.slice(1)}</span></td>
                <td>{row.operador}</td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo pesaje">
        <div className={mStyles.form}>
          <div className={mStyles.row2}>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Fecha *</label>
              <input type="date" name="fecha" className={mStyles.input} value={form.fecha} onChange={handleChange} title='Fecha' />
            </div>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Tipo *</label>
              <select name="tipo" className={mStyles.input} value={form.tipo} onChange={handleChange} title='Tipo'>
                <option value="bovino">Bovino</option>
                <option value="porcino">Porcino</option>
                <option value="ovino">Ovino</option>
              </select>
            </div>
          </div>
          <div className={mStyles.field}>
            <label className={mStyles.label}>Animal *</label>
            <input type="text" name="animal_nombre" className={mStyles.input} placeholder="Ej. Animal #47" value={form.animal_nombre} onChange={handleChange} />
          </div>
          <div className={mStyles.row2}>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Peso (kg) *</label>
              <input type="number" name="peso_kg" className={mStyles.input} placeholder="0" min="0" step="0.1" value={form.peso_kg} onChange={handleChange} />
            </div>
            <div className={mStyles.field}>
              <label className={mStyles.label}>Operador</label>
              <input type="text" name="operador" className={mStyles.input} placeholder="Nombre" value={form.operador} onChange={handleChange} />
            </div>
          </div>
          <div className={mStyles.field}>
            <label className={mStyles.label}>Observaciones</label>
            <textarea name="observaciones" className={mStyles.textarea} rows={3} placeholder="Notas…" value={form.observaciones} onChange={handleChange} />
          </div>
          <div className={mStyles.actions}>
            <button className={mStyles.btnCancel} onClick={() => setModalOpen(false)}><X size={15} /> Cancelar</button>
            <button className={mStyles.btnSave} style={{ background: '#e69519' }} onClick={handleGuardar}><Save size={15} /> Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
