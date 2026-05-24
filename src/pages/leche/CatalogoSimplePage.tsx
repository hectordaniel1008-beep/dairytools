import { useEffect, useState, type ComponentType } from 'react'
import { Edit, Plus, Save, Search, Trash2, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import { useEmpresa } from '../../context/EmpresaContext'
import mStyles from '../ModalForm.module.css'
import styles from './Productos.module.css'

interface CatalogoRow {
  id: number
  descripcion?: string
  nombre?: string
  rfc?: string
  estatus?: boolean
}

interface CatalogoService {
  listar: () => Promise<{ data?: { data?: CatalogoRow[] } }>
  crear: (data: Record<string, string>) => Promise<unknown>
  actualizar: (id: number, data: Record<string, string>) => Promise<unknown>
  eliminar: (id: number) => Promise<unknown>
}

interface CatalogoField {
  name: string
  label: string
  required?: boolean
  placeholder?: string
}

interface Props {
  title: string
  singular: string
  icon: ComponentType<{ size?: number }>
  service: CatalogoService
  fields?: CatalogoField[]
}

const DEFAULT_FIELDS: CatalogoField[] = [
  { name: 'descripcion', label: 'Descripcion', required: true }
]

function getDescripcion(row?: Partial<CatalogoRow> | null) {
  return row?.descripcion || row?.nombre || ''
}

function buildInitialForm(fields: CatalogoField[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = ''
    return acc
  }, {})
}

function getFieldValue(row: CatalogoRow, fieldName: string) {
  if (fieldName === 'descripcion') return getDescripcion(row)
  return String(row[fieldName as keyof CatalogoRow] ?? '')
}

export default function CatalogoSimplePage({ title, singular, icon: Icon, service, fields = DEFAULT_FIELDS }: Props) {
  const { empresaActual } = useEmpresa()
  const [rows, setRows] = useState<CatalogoRow[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<CatalogoRow | null>(null)
  const [form, setForm] = useState<Record<string, string>>(() => buildInitialForm(fields))
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!empresaActual?.id) return

    setModalOpen(false)
    setConfirmOpen(false)
    setSelectedRow(null)
    setBusqueda('')
    setForm(buildInitialForm(fields))
    listar()
  }, [empresaActual?.id])

  async function listar() {
    setLoading(true)
    setError('')

    try {
      const response = await service.listar()
      setRows(response.data?.data ?? [])
    } catch (err) {
      console.error(err)
      setError(`No se pudo cargar ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  function abrirNuevo() {
    setSelectedRow(null)
    setForm(buildInitialForm(fields))
    setError('')
    setModalOpen(true)
  }

  function abrirEditar(row: CatalogoRow) {
    setSelectedRow(row)
    setForm(fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.name] = getFieldValue(row, field.name)
      return acc
    }, {}))
    setError('')
    setModalOpen(true)
  }

  function abrirEliminar(row: CatalogoRow) {
    setSelectedRow(row)
    setError('')
    setConfirmOpen(true)
  }

  async function guardar() {
    const payload = fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.name] = (form[field.name] ?? '').trim()
      return acc
    }, {})

    const missingField = fields.find(field => field.required && !payload[field.name])
    if (missingField) {
      setError(`${missingField.label} es obligatorio`)
      return
    }

    if (payload.descripcion) {
      const duplicado = rows.some(row =>
        getDescripcion(row).toLowerCase() === payload.descripcion.toLowerCase() &&
        row.id !== selectedRow?.id
      )

      if (duplicado) {
        setError(`Ya existe ${singular.toLowerCase()} con esa descripcion`)
        return
      }
    }

    setIsSaving(true)
    setError('')

    try {
      if (selectedRow) {
        await service.actualizar(selectedRow.id, payload)
      } else {
        await service.crear(payload)
      }

      setModalOpen(false)
      setSelectedRow(null)
      setForm(buildInitialForm(fields))
      await listar()
    } catch (err) {
      console.error(err)
      setError(`No se pudo guardar ${singular.toLowerCase()}`)
    } finally {
      setIsSaving(false)
    }
  }

  async function confirmarEliminar() {
    if (!selectedRow) return

    setIsDeleting(true)
    setError('')

    try {
      await service.eliminar(selectedRow.id)
      setRows(prev => prev.filter(row => row.id !== selectedRow.id))
      setConfirmOpen(false)
      setSelectedRow(null)
    } catch (err) {
      console.error(err)
      setError(`No se pudo eliminar ${singular.toLowerCase()}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const filtrados = rows.filter(row => {
    const term = busqueda.toLowerCase()
    return fields.some(field => getFieldValue(row, field.name).toLowerCase().includes(term))
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <div className={styles.iconBadge}>
            <Icon size={16} />
          </div>
          <h2 className={styles.title}>{title}</h2>
        </div>

        <div className={styles.searchWrap}>
          <span className={styles.searchButton} aria-hidden="true">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.searchInput}
            autoComplete="off"
          />
        </div>

        <div className={styles.controls}>
          <button type="button" onClick={abrirNuevo} className={styles.primaryButton}>
            <Plus size={15} /> Nuevo
          </button>
        </div>
      </div>

      {error && !modalOpen && !confirmOpen && <p className={styles.errorText}>{error}</p>}

      <div className={styles.content}>
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ minWidth: 560 }}>
            <colgroup>
              {fields.map(field => (
                <col key={field.name} />
              ))}
              <col style={{ width: '120px' }} />
            </colgroup>
            <thead>
              <tr>
                {fields.map(field => (
                  <th key={field.name} className={styles.tableHeader}>{field.label}</th>
                ))}
                <th className={`${styles.tableHeader} ${styles.actionsHeader}`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={fields.length + 1} className={styles.emptyCell}>Cargando...</td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 1} className={styles.emptyCell}>No hay registros</td>
                </tr>
              ) : (
                filtrados.map(row => (
                  <tr key={row.id} className={styles.tableRow}>
                    {fields.map(field => (
                      <td key={field.name} className={field.name === 'descripcion' ? styles.nameCell : undefined}>
                        {getFieldValue(row, field.name)}
                      </td>
                    ))}
                    <td className={styles.actionsCell}>
                      <div className={styles.actions}>
                        <button type="button" onClick={() => abrirEditar(row)} className={styles.actionButton} title="Editar">
                          <Edit size={14} />
                        </button>
                        <button type="button" onClick={() => abrirEliminar(row)} className={`${styles.actionButton} ${styles.actionDangerButton}`} title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedRow ? `Editar ${singular.toLowerCase()}` : `Nuevo ${singular.toLowerCase()}`}
      >
        <div className={mStyles.form}>
          {fields.map((field, index) => (
            <div key={field.name} className={mStyles.field}>
              <label htmlFor={field.name} className={mStyles.label}>
                {field.label}{field.required ? ' *' : ''}
              </label>
              <input
                id={field.name}
                name={field.name}
                value={form[field.name] ?? ''}
                onChange={(e) => setForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                className={mStyles.input}
                placeholder={field.placeholder ?? field.label}
                autoComplete="off"
                autoFocus={index === 0}
              />
            </div>
          ))}

          {error && <p className={mStyles.errorText}>{error}</p>}

          <div className={mStyles.actions}>
            <button type="button" className={mStyles.btnCancel} onClick={() => setModalOpen(false)}>
              <X size={15} /> Cancelar
            </button>
            <button type="button" className={mStyles.btnSave} onClick={guardar} disabled={isSaving}>
              <Save size={15} /> {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar eliminacion"
        width={420}
      >
        <div className={mStyles.form}>
          <p>
            Estas seguro de que deseas eliminar <strong>{getDescripcion(selectedRow ?? {})}</strong>?
          </p>
          {error && <p className={mStyles.errorText}>{error}</p>}
          <div className={mStyles.actions}>
            <button type="button" className={mStyles.btnCancel} onClick={() => setConfirmOpen(false)}>
              <X size={15} /> Cancelar
            </button>
            <button type="button" className={mStyles.btnDanger} onClick={confirmarEliminar} disabled={isDeleting}>
              <Trash2 size={15} /> {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
