import { useCallback, useEffect, useState } from 'react'
import { Search, Plus, Edit, Trash2, Package, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { productosService } from '../../api/services'
import { useEmpresa } from '../../context/EmpresaContext'
import styles from './Productos.module.css'

interface CatalogoSimple {
  id: number
  descripcion: string
}

interface Producto {
  id: number
  nombre: string
  tipoProductoId: number
  tipoProducto?: CatalogoSimple
  division: number
  proveedorId: number
  proveedor?: CatalogoSimple
  proveedorUltimaCompra: string
  codigoErp: string
  codigoProveedor: string
  codigoAlimentacion: string
  unidadMedidaId: number
  unidadMedida?: CatalogoSimple
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

const ITEMS_PER_PAGE = 25

const FORM_INIT = {
  nombre: '',
  tipoProductoId: '',
  proveedorId: '',
  proveedorUltimaCompra: '',
  codigoErp: '',
  codigoProveedor: '',
  codigoAlimentacion: '',
  unidadMedidaId: ''
}

export default function ProductosPage() {
  const { empresaActual } = useEmpresa()
  const [productos, setProductos] = useState<Producto[]>([])
  const [tiposProducto, setTiposProducto] = useState<CatalogoSimple[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<CatalogoSimple[]>([])
  const [proveedores, setProveedores] = useState<CatalogoSimple[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 0
  })
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [form, setForm] = useState(FORM_INIT)

  const cargarCatalogos = useCallback(async () => {
    const response = await productosService.catalogos()
    if (response.data?.success) {
      setTiposProducto(response.data.data?.tiposProducto || [])
      setUnidadesMedida(response.data.data?.unidadesMedida || [])
      setProveedores(response.data.data?.proveedores || [])
    }
  }, [])

  const cargarProductos = useCallback(async (page = 1, search = '') => {
    setLoading(true)
    setError('')

    try {
      const response = await productosService.listar(page, ITEMS_PER_PAGE, search)
      if (response.data?.success) {
        setProductos(response.data.data || [])
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: ITEMS_PER_PAGE,
          totalPages: 0
        })
      } else {
        setError('No se pudieron cargar los productos')
      }
    } catch (err) {
      console.error(err)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!empresaActual?.id) return

    setModalOpen(false)
    setConfirmOpen(false)
    setSelectedProducto(null)
    setBusqueda('')
    setForm(FORM_INIT)
    cargarCatalogos().catch((err) => {
      console.error(err)
      setError('No se pudieron cargar los catalogos')
    })
    cargarProductos()
  }, [empresaActual?.id, cargarCatalogos, cargarProductos])

  const ejecutarBusqueda = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    cargarProductos(1, busqueda)
  }

  const handleBusquedaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      ejecutarBusqueda()
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      cargarProductos(newPage, busqueda)
    }
  }

  const abrirModalNuevo = () => {
    setForm({
      ...FORM_INIT,
      tipoProductoId: tiposProducto[0]?.id.toString() || '',
      proveedorId: proveedores[0]?.id.toString() || '',
      unidadMedidaId: unidadesMedida[0]?.id.toString() || ''
    })
    setSelectedProducto(null)
    setModalOpen(true)
    setError('')
  }

  const abrirModalEditar = (producto: Producto) => {
    setSelectedProducto(producto)
    setForm({
      nombre: producto.nombre,
      tipoProductoId: producto.tipoProductoId.toString(),
      proveedorId: producto.proveedorId?.toString() || '',
      proveedorUltimaCompra: producto.proveedorUltimaCompra || '',
      codigoErp: producto.codigoErp,
      codigoProveedor: producto.codigoProveedor,
      codigoAlimentacion: producto.codigoAlimentacion,
      unidadMedidaId: producto.unidadMedidaId.toString()
    })
    setModalOpen(true)
    setError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const buildPayload = () => ({
    nombre: form.nombre.trim(),
    tipoProductoId: parseInt(form.tipoProductoId),
    proveedorId: parseInt(form.proveedorId),
    proveedorUltimaCompra: form.proveedorUltimaCompra.trim(),
    codigoErp: form.codigoErp.trim(),
    codigoProveedor: form.codigoProveedor.trim(),
    codigoAlimentacion: form.codigoAlimentacion.trim(),
    unidadMedidaId: parseInt(form.unidadMedidaId)
  })

  const handleGuardar = async () => {
    const payload = buildPayload()
    const hasInvalidNumber = [
      payload.tipoProductoId,
      payload.proveedorId,
      payload.unidadMedidaId
    ].some(Number.isNaN)

    if (!payload.nombre || !payload.proveedorUltimaCompra || !payload.codigoErp || !payload.codigoProveedor || !payload.codigoAlimentacion || hasInvalidNumber) {
      setError('Todos los campos son obligatorios')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      if (selectedProducto) {
        await productosService.actualizar(selectedProducto.id, payload)
      } else {
        await productosService.crear(payload)
      }

      setModalOpen(false)
      setForm(FORM_INIT)
      cargarProductos(pagination.page, busqueda)
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el producto')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEliminar = async () => {
    if (!selectedProducto) return

    setIsDeleting(true)
    setError('')

    try {
      await productosService.eliminar(selectedProducto.id)
      setConfirmOpen(false)
      setSelectedProducto(null)
      cargarProductos(pagination.page, busqueda)
    } catch (err) {
      console.error(err)
      setError('No se pudo eliminar el producto')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <div className={styles.iconBadge}>
            <Package size={16} />
          </div>
          <h2 className={styles.title}>Productos</h2>
        </div>

        <div className={styles.searchWrap}>
          <button
            type="button"
            onClick={ejecutarBusqueda}
            title="Buscar"
            aria-label="Buscar productos"
            className={styles.searchButton}
          >
            <Search size={15} />
          </button>
          <input
            type="text"
            placeholder="Buscar por nombre o codigo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={handleBusquedaKeyDown}
            className={styles.searchInput}
            autoComplete="off"
          />
        </div>

        <div className={styles.controls}>
          <button type="button" onClick={abrirModalNuevo} className={styles.primaryButton}>
            <Plus size={15} /> Nuevo
          </button>
        </div>
      </div>

      {error && !modalOpen && !confirmOpen && <p className={styles.errorText}>{error}</p>}

      <div className={styles.content}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <colgroup>
              <col className={styles.colNombre} />
              <col className={styles.colTipo} />
              <col className={styles.colProveedor} />
              <col className={styles.colProveedorUltimaCompra} />
              <col className={styles.colCodigoErp} />
              <col className={styles.colCodigoProveedor} />
              <col className={styles.colCodigoAlimentacion} />
              <col className={styles.colUnidad} />
              <col className={styles.colAcciones} />
            </colgroup>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Nombre</th>
                <th className={styles.tableHeader}>Tipo</th>
                <th className={styles.tableHeader}>Proveedor</th>
                <th className={styles.tableHeader}>Prov. ult. compra</th>
                <th className={styles.tableHeader}>Codigo ERP</th>
                <th className={styles.tableHeader}>Codigo proveedor</th>
                <th className={styles.tableHeader}>Codigo alimentacion</th>
                <th className={styles.tableHeader}>Unidad</th>
                <th className={`${styles.tableHeader} ${styles.actionsHeader}`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    Cargando productos...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} className={styles.tableRow}>
                    <td className={styles.nameCell}>{producto.nombre}</td>
                    <td>{producto.tipoProducto?.descripcion || producto.tipoProductoId}</td>
                    <td>{producto.proveedor?.descripcion || producto.proveedorId}</td>
                    <td>{producto.proveedorUltimaCompra}</td>
                    <td className={styles.claveCell}>{producto.codigoErp}</td>
                    <td className={styles.claveCell}>{producto.codigoProveedor}</td>
                    <td className={styles.claveCell}>{producto.codigoAlimentacion}</td>
                    <td>{producto.unidadMedida?.descripcion || producto.unidadMedidaId}</td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(producto)}
                          className={styles.actionButton}
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setError('')
                            setSelectedProducto(producto)
                            setConfirmOpen(true)
                          }}
                          className={`${styles.actionButton} ${styles.actionDangerButton}`}
                          title="Eliminar"
                        >
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

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Mostrando {productos.length} de {pagination.total} productos
            </div>
            <div className={styles.paginationControls}>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                title="Anterior"
                aria-label="Anterior"
                className={styles.paginationButton}
              >
                <ChevronLeft size={16} />
              </button>
              <span className={styles.paginationCurrent}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                title="Siguiente"
                aria-label="Siguiente"
                className={styles.paginationButton}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedProducto ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className={styles.modalClose}
                aria-label="Cerrar"
              >
                x
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <Field label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} maxLength={200} autoFocus />
                <SelectField label="Tipo de producto *" name="tipoProductoId" value={form.tipoProductoId} onChange={handleChange} options={tiposProducto} />
                <SelectField label="Proveedor *" name="proveedorId" value={form.proveedorId} onChange={handleChange} options={proveedores} />
                <Field label="Proveedor ultima compra *" name="proveedorUltimaCompra" value={form.proveedorUltimaCompra} onChange={handleChange} maxLength={100} />
                <Field label="Codigo ERP *" name="codigoErp" value={form.codigoErp} onChange={handleChange} maxLength={50} />
                <Field label="Codigo proveedor *" name="codigoProveedor" value={form.codigoProveedor} onChange={handleChange} maxLength={50} />
                <Field label="Codigo alimentacion *" name="codigoAlimentacion" value={form.codigoAlimentacion} onChange={handleChange} maxLength={50} />
                <SelectField label="Unidad de medida *" name="unidadMedidaId" value={form.unidadMedidaId} onChange={handleChange} options={unidadesMedida} />
              </div>
              {error && <p className={styles.modalError}>{error}</p>}
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setModalOpen(false)} disabled={isSaving} className={styles.secondaryButton}>
                  <X size={15} /> Cancelar
                </button>
                <button type="button" onClick={handleGuardar} disabled={isSaving} className={styles.primaryButton}>
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmHeader}>
              <h3 className={styles.modalTitle}>Confirmar eliminacion</h3>
            </div>
            <div className={styles.confirmBody}>
              <p className={styles.confirmText}>Estas seguro de que deseas eliminar el producto "{selectedProducto?.nombre}"?</p>
              {error && <p className={styles.modalError}>{error}</p>}
            </div>
            <div className={styles.confirmFooter}>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false)
                  setSelectedProducto(null)
                  setError('')
                }}
                disabled={isDeleting}
                className={styles.secondaryButton}
              >
                <X size={15} /> Cancelar
              </button>
              <button type="button" onClick={handleEliminar} disabled={isDeleting} className={styles.dangerButton}>
                <Trash2 size={15} /> {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface FieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  maxLength?: number
  autoFocus?: boolean
}

function Field({ label, name, value, onChange, type = 'text', maxLength, autoFocus = false }: FieldProps) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={styles.formLabel}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className={styles.formInput}
      />
    </div>
  )
}

interface SelectFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: CatalogoSimple[]
}

function SelectField({ label, name, value, onChange, options }: SelectFieldProps) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={styles.formLabel}>{label}</label>
      <select id={name} name={name} value={value} onChange={onChange} className={styles.formInput}>
        <option value="">Selecciona...</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.descripcion}</option>
        ))}
      </select>
    </div>
  )
}
