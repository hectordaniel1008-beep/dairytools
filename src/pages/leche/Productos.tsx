import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { productosService } from '../../api/services'

interface Producto {
  id: number
  nombre: string
  clave: string
  categoria?: string
  precio?: number
  unidad?: string
  descripcion?: string
  estatus: boolean
  stock?: number
  codigoBarras?: string
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

const ITEMS_PER_PAGE = 15

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
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
  const [form, setForm] = useState({
    nombre: '',
    clave: '',
    categoria: '',
    precio: '',
    unidad: '',
    descripcion: '',
    stock: '',
    codigoBarras: '',
    estatus: true
  })

  // Cargar productos con paginación
  const cargarProductos = useCallback(async (page = 1, search = busqueda) => {
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
  }, [busqueda])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  // Manejo de búsqueda
  const handleBusqueda = (value: string) => {
    setBusqueda(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarProductos(1, busqueda)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [busqueda, cargarProductos])

  // Manejo de paginación
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      cargarProductos(newPage, busqueda)
    }
  }

  // Manejo de formulario
  const resetForm = () => {
    setForm({
      nombre: '',
      clave: '',
      categoria: '',
      precio: '',
      unidad: '',
      descripcion: '',
      stock: '',
      codigoBarras: '',
      estatus: true
    })
  }

  const abrirModalNuevo = async () => {
    resetForm()
    setSelectedProducto(null)
    setModalOpen(true)
    setError('')

    try {
      const response = await productosService.generarClave()
      if (response.data?.success) {
        setForm(prev => ({ ...prev, clave: response.data.data?.clave || '' }))
      }
    } catch (err) {
      console.error('Error al generar clave:', err)
    }
  }

  const abrirModalEditar = (producto: Producto) => {
    setSelectedProducto(producto)
    setForm({
      nombre: producto.nombre,
      clave: producto.clave,
      categoria: producto.categoria || '',
      precio: producto.precio?.toString() || '',
      unidad: producto.unidad || '',
      descripcion: producto.descripcion || '',
      stock: producto.stock?.toString() || '',
      codigoBarras: producto.codigoBarras || '',
      estatus: producto.estatus
    })
    setModalOpen(true)
    setError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.clave.trim()) {
      setError('Nombre y clave son obligatorios')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const productoData = {
        ...form,
        precio: form.precio ? parseFloat(form.precio) : undefined,
        stock: form.stock ? parseFloat(form.stock) : undefined
      }

      if (selectedProducto) {
        await productosService.actualizar(selectedProducto.id, productoData)
      } else {
        await productosService.crear(productoData)
      }

      setModalOpen(false)
      resetForm()
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

    try {
      await productosService.eliminar(selectedProducto.id)
      setConfirmOpen(false)
      setSelectedProducto(null)
      cargarProductos(pagination.page, busqueda)
    } catch (err) {
      console.error(err)
      setError('No se pudo eliminar el producto')
    }
  }

  const handleSeedData = async () => {
    try {
      const response = await productosService.seedData()
      if (response.data?.success) {
        cargarProductos(1, busqueda)
      } else {
        setError('No se pudieron cargar los datos de prueba')
      }
    } catch (err) {
      console.error(err)
      setError('Error al cargar datos de prueba')
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Productos</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Gestiona el catálogo de productos</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSeedData}
            style={{
              background: 'var(--color-bg-subtle)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Package size={16} /> Cargar datos de prueba
          </button>
          <button
            onClick={abrirModalNuevo}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </div>

      {error && !modalOpen && !confirmOpen && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', margin: '0 0 1rem 0', padding: '0.75rem 1rem', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '400px' }}>
          <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              background: 'var(--color-bg)',
              color: 'var(--color-text-primary)'
            }}
            autoComplete="off"
          />
        </div>
      </div>

      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {/* Tabla para desktop */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-subtle)' }}>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-border)' }}>Nombre</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-border)' }}>Clave</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-border)' }}>Categoría</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-border)' }}>Precio</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-border)' }}>Unidad</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-border)' }}>Stock</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-border)' }}>Estado</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-border)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      <div style={{ width: '2rem', height: '2rem', border: '2px solid var(--color-border)', borderTop: '2px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                      <p>Cargando productos...</p>
                    </div>
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      <Package size={48} style={{ marginBottom: '1rem' }} />
                      <p style={{ margin: '0 0 1.5rem 0', fontSize: 'var(--font-size-base)' }}>No hay productos registrados</p>
                      <button onClick={abrirModalNuevo} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={16} /> Crear primer producto
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{producto.nombre}</div>
                      {producto.descripcion && (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', lineHeight: 1.3, margin: '0.25rem 0 0 0' }}>{producto.descripcion}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 500, color: 'var(--color-text-primary)' }}>{producto.clave}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {producto.categoria && (
                        <span style={{ background: 'var(--color-secondary-bg)', color: 'var(--color-secondary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', fontWeight: 500, display: 'inline-block' }}>
                          {producto.categoria}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--color-success)' }}>
                      {producto.precio ? `$${(typeof producto.precio === 'string' ? parseFloat(producto.precio) : producto.precio).toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)' }}>{producto.unidad || '-'}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {producto.stock != null ? (typeof producto.stock === 'string' ? parseFloat(producto.stock) : producto.stock).toString() : '-'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 500,
                        display: 'inline-block',
                        background: producto.estatus ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                        color: producto.estatus ? 'var(--color-success)' : 'var(--color-danger)'
                      }}>
                        {producto.estatus ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => abrirModalEditar(producto)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)',
                            padding: '0.375rem',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProducto(producto)
                            setConfirmOpen(true)
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)',
                            padding: '0.375rem',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Mostrando {productos.length} de {pagination.total} productos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  opacity: pagination.page === 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, padding: '0.5rem 0.75rem' }}>
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  opacity: pagination.page === pagination.totalPages ? 0.5 : 1
                }}
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal simplificado */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.25rem', lineHeight: 1 }}>
                ×
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
                    placeholder="Nombre del producto"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Clave *</label>
                  <input
                    type="text"
                    name="clave"
                    value={form.clave}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
                    placeholder="Clave del producto"
                    readOnly={!selectedProducto}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Categoría</label>
                  <input
                    type="text"
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
                    placeholder="Categoría"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Precio</label>
                  <input
                    type="number"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                  style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: isSaving ? 'not-allowed' : 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardar}
                  disabled={isSaving}
                  style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
              {error && (
                <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', margin: '0', padding: '0.75rem 1rem', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)' }}>
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>Confirmar Eliminación</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: 0, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                ¿Estás seguro de que deseas eliminar el producto "{selectedProducto?.nombre}"? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                style={{ background: 'var(--color-danger)', color: 'white', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
