import { useCallback, useEffect, useState } from 'react'
import { Search, Plus, Edit2, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { productosService } from '../../api/services'

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
  proveedorUltimaCompra: number
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
  division: '',
  proveedorUltimaCompra: '',
  codigoErp: '',
  codigoProveedor: '',
  codigoAlimentacion: '',
  unidadMedidaId: ''
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [tiposProducto, setTiposProducto] = useState<CatalogoSimple[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<CatalogoSimple[]>([])
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
    cargarCatalogos().catch((err) => {
      console.error(err)
      setError('No se pudieron cargar los catalogos')
    })
    cargarProductos()
  }, [cargarCatalogos, cargarProductos])

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
      division: producto.division.toString(),
      proveedorUltimaCompra: producto.proveedorUltimaCompra.toString(),
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
    division: parseInt(form.division),
    proveedorUltimaCompra: parseInt(form.proveedorUltimaCompra),
    codigoErp: form.codigoErp.trim(),
    codigoProveedor: form.codigoProveedor.trim(),
    codigoAlimentacion: form.codigoAlimentacion.trim(),
    unidadMedidaId: parseInt(form.unidadMedidaId)
  })

  const handleGuardar = async () => {
    const payload = buildPayload()
    const hasInvalidNumber = [
      payload.tipoProductoId,
      payload.division,
      payload.proveedorUltimaCompra,
      payload.unidadMedidaId
    ].some(Number.isNaN)

    if (!payload.nombre || !payload.codigoErp || !payload.codigoProveedor || !payload.codigoAlimentacion || hasInvalidNumber) {
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
    <div style={{ padding: '0 0.75rem 0.375rem', maxWidth: '100%', margin: '0 auto', height: '100%', minHeight: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.375rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: '150px' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={16} />
          </div>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>Productos</h2>
        </div>

        <div style={{ position: 'relative', flex: '0 1 340px', minWidth: '220px', maxWidth: '360px', marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={ejecutarBusqueda}
            title="Buscar"
            aria-label="Buscar productos"
            style={{ position: 'absolute', right: '0.375rem', top: '50%', transform: 'translateY(-50%)', width: '1.5rem', height: '1.5rem', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Search size={15} />
          </button>
          <input
            type="text"
            placeholder="Buscar por nombre o codigo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={handleBusquedaKeyDown}
            style={{ width: '100%', padding: '0.35rem 2rem 0.35rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
            autoComplete="off"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={abrirModalNuevo} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}>
            <Plus size={15} /> Nuevo
          </button>
        </div>
      </div>

      {error && !modalOpen && !confirmOpen && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', margin: '0 0 0.25rem 0', padding: '0.375rem 0.65rem', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>
          {error}
        </p>
      )}

      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', scrollbarGutter: 'stable' }}>
          <table style={{ width: '100%', minWidth: '1120px', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: 'var(--color-bg-subtle)' }}>
                {['Nombre', 'Tipo', 'Division', 'Proveedor', 'Codigo ERP', 'Codigo proveedor', 'Codigo alimentacion', 'Unidad', 'Acciones'].map((header) => (
                  <th key={header} style={{ padding: '0.5rem 0.6rem', textAlign: header === 'Acciones' ? 'center' : 'left', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg-subtle)', position: 'sticky', top: 0, zIndex: 2 }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>Cargando productos...</td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>No hay productos registrados</td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{producto.nombre}</td>
                    <td style={{ padding: '0.45rem 0.6rem' }}>{producto.tipoProducto?.descripcion || producto.tipoProductoId}</td>
                    <td style={{ padding: '0.45rem 0.6rem' }}>{producto.division}</td>
                    <td style={{ padding: '0.45rem 0.6rem' }}>{producto.proveedorUltimaCompra}</td>
                    <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>{producto.codigoErp}</td>
                    <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>{producto.codigoProveedor}</td>
                    <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>{producto.codigoAlimentacion}</td>
                    <td style={{ padding: '0.45rem 0.6rem' }}>{producto.unidadMedida?.descripcion || producto.unidadMedidaId}</td>
                    <td style={{ padding: '0.45rem 0.6rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button onClick={() => abrirModalEditar(producto)} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => { setError(''); setSelectedProducto(producto); setConfirmOpen(true) }} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Eliminar">
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)', flexShrink: 0 }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Mostrando {productos.length} de {pagination.total} productos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} title="Anterior" aria-label="Anterior" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: pagination.page === 1 ? 0.5 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, padding: '0.5rem 0.75rem' }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} title="Siguiente" aria-label="Siguiente" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: pagination.page === pagination.totalPages ? 0.5 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedProducto ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.25rem', lineHeight: 1 }}>x</button>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <Field label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} maxLength={200} />
                <SelectField label="Tipo de producto *" name="tipoProductoId" value={form.tipoProductoId} onChange={handleChange} options={tiposProducto} />
                <Field label="Division *" name="division" value={form.division} onChange={handleChange} type="number" />
                <Field label="Proveedor ultima compra *" name="proveedorUltimaCompra" value={form.proveedorUltimaCompra} onChange={handleChange} type="number" />
                <Field label="Codigo ERP *" name="codigoErp" value={form.codigoErp} onChange={handleChange} maxLength={50} />
                <Field label="Codigo proveedor *" name="codigoProveedor" value={form.codigoProveedor} onChange={handleChange} maxLength={50} />
                <Field label="Codigo alimentacion *" name="codigoAlimentacion" value={form.codigoAlimentacion} onChange={handleChange} maxLength={50} />
                <SelectField label="Unidad de medida *" name="unidadMedidaId" value={form.unidadMedidaId} onChange={handleChange} options={unidadesMedida} />
              </div>
              {error && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', margin: '0 0 1rem 0', padding: '0.75rem 1rem', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)' }}>{error}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button onClick={() => setModalOpen(false)} disabled={isSaving} style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: isSaving ? 'not-allowed' : 'pointer' }}>Cancelar</button>
                <button onClick={handleGuardar} disabled={isSaving} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}>{isSaving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>Confirmar eliminacion</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: 0, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>Estas seguro de que deseas eliminar el producto "{selectedProducto?.nombre}"?</p>
              {error && (
                <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', margin: '1rem 0 0 0', padding: '0.75rem 1rem', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)' }}>
                  {error}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <button onClick={() => { setConfirmOpen(false); setSelectedProducto(null); setError('') }} disabled={isDeleting} style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.6 : 1 }}>Cancelar</button>
              <button onClick={handleEliminar} disabled={isDeleting} style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.6 : 1 }}>{isDeleting ? 'Eliminando...' : 'Eliminar'}</button>
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
}

function Field({ label, name, value, onChange, type = 'text', maxLength }: FieldProps) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} maxLength={maxLength} style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }} />
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
    <div>
      <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
        <option value="">Selecciona...</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.descripcion}</option>
        ))}
      </select>
    </div>
  )
}
