import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Package, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { productosService } from '../../api/services'
import styles from './Productos.module.css'

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

  // Manejo de scroll virtual
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / VIRTUAL_ITEM_HEIGHT)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / VIRTUAL_ITEM_HEIGHT) + 1,
      productos.length
    )
    return { startIndex, endIndex }
  }, [scrollTop, containerHeight, productos.length])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)

    // Detectar si necesita cargar más datos
    const scrollHeight = e.currentTarget.scrollHeight
    const clientHeight = e.currentTarget.clientHeight
    const scrollBottom = newScrollTop + clientHeight

    // Si está cerca del final y hay más páginas
    if (
      scrollBottom >= scrollHeight - 100 &&
      pagination.page < pagination.totalPages &&
      !loading
    ) {
      cargarProductos(pagination.page + 1, busqueda)
    }
  }, [pagination, loading, busqueda, cargarProductos])

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

    // Generar clave automáticamente
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
      cargarProductos(1, busqueda)
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
      cargarProductos(1, busqueda)
    } catch (err) {
      console.error(err)
      setError('No se pudo eliminar el producto')
    }
  }

  // Renderizado de items virtuales
  const renderVirtualItem = (producto: Producto, index: number) => (
    <div
      key={producto.id}
      className={styles.productoCard}
      style={{
        position: 'absolute',
        top: index * VIRTUAL_ITEM_HEIGHT,
        height: VIRTUAL_ITEM_HEIGHT,
        width: '100%'
      }}
    >
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.productInfo}>
            <h3 className={styles.productName}>{producto.nombre}</h3>
            <p className={styles.productClave}>{producto.clave}</p>
          </div>
          <div className={styles.cardActions}>
            <button
              onClick={() => abrirModalEditar(producto)}
              className={styles.actionButton}
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                setSelectedProducto(producto)
                setConfirmOpen(true)
              }}
              className={styles.actionButton}
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.productDetails}>
            {producto.categoria && (
              <span className={styles.category}>{producto.categoria}</span>
            )}
            {producto.precio && (
              <span className={styles.price}>${producto.precio.toFixed(2)}</span>
            )}
            {producto.unidad && (
              <span className={styles.unit}>{producto.unidad}</span>
            )}
            {producto.stock !== undefined && (
              <span className={styles.stock}>Stock: {producto.stock}</span>
            )}
          </div>
          {producto.descripcion && (
            <p className={styles.description}>{producto.descripcion}</p>
          )}
        </div>
      </div>
    </div>
  )

  // Renderizado de cards para móviles
  const renderMobileCard = (producto: Producto) => (
    <div key={producto.id} className={styles.mobileCard}>
      <div className={styles.mobileCardHeader}>
        <div className={styles.mobileProductInfo}>
          <h3 className={styles.mobileProductName}>{producto.nombre}</h3>
          <p className={styles.mobileProductClave}>{producto.clave}</p>
        </div>
        <div className={styles.mobileCardActions}>
          <button
            onClick={() => abrirModalEditar(producto)}
            className={styles.mobileActionButton}
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedProducto(producto)
              setConfirmOpen(true)
            }}
            className={styles.mobileActionButton}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className={styles.mobileCardBody}>
        <div className={styles.mobileProductDetails}>
          {producto.categoria && (
            <span className={styles.mobileCategory}>{producto.categoria}</span>
          )}
          {producto.precio && (
            <span className={styles.mobilePrice}>${producto.precio.toFixed(2)}</span>
          )}
          {producto.unidad && (
            <span className={styles.mobileUnit}>{producto.unidad}</span>
          )}
          {producto.stock !== undefined && (
            <span className={styles.mobileStock}>Stock: {producto.stock}</span>
          )}
        </div>
        {producto.descripcion && (
          <p className={styles.mobileDescription}>{producto.descripcion}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Package size={22} />
          </div>
          <div>
            <h2 className={styles.pageTitle}>Productos</h2>
            <p className={styles.pageSubtitle}>Gestiona el catálogo de productos</p>
          </div>
        </div>
        <button className={styles.primaryButton} onClick={abrirModalNuevo}>
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {error && !modalOpen && !confirmOpen && (
        <p className={styles.errorText}>{error}</p>
      )}

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            className={styles.searchInput}
            autoComplete="off"
          />
        </div>
        <button className={styles.secondaryButton}>
          <Filter size={16} /> Filtros
        </button>
      </div>

      <div className={styles.content}>
        {/* Vista Desktop - Scroll Virtual */}
        <div className={styles.desktopView}>
          <div
            className={styles.virtualContainer}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
          >
            <div
              className={styles.virtualScroll}
              style={{ height: productos.length * VIRTUAL_ITEM_HEIGHT }}
            >
              {loading && productos.length === 0 ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Cargando productos...</p>
                </div>
              ) : productos.length === 0 ? (
                <div className={styles.emptyState}>
                  <Package size={48} />
                  <p>No hay productos registrados</p>
                  <button onClick={abrirModalNuevo} className={styles.primaryButton}>
                    <Plus size={16} /> Crear primer producto
                  </button>
                </div>
              ) : (
                productos
                  .slice(visibleRange.startIndex, visibleRange.endIndex)
                  .map((producto, index) =>
                    renderVirtualItem(producto, visibleRange.startIndex + index)
                  )
              )}
            </div>
          </div>
        </div>

        {/* Vista Mobile - Cards */}
        <div className={styles.mobileView}>
          {loading && productos.length === 0 ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Cargando productos...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={48} />
              <p>No hay productos registrados</p>
              <button onClick={abrirModalNuevo} className={styles.primaryButton}>
                <Plus size={16} /> Crear primer producto
              </button>
            </div>
          ) : (
            <div className={styles.mobileCardsContainer}>
              {productos.map(renderMobileCard)}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setModalOpen(false)} className={styles.modalClose}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Nombre del producto"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Clave *</label>
                  <input
                    type="text"
                    name="clave"
                    value={form.clave}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Clave del producto"
                    readOnly={!selectedProducto}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Categoría</label>
                  <input
                    type="text"
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Categoría"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Precio</label>
                  <input
                    type="number"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Unidad</label>
                  <select
                    name="unidad"
                    value={form.unidad}
                    onChange={handleChange}
                    className={styles.formInput}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Litro">Litro</option>
                    <option value="Kilo">Kilo</option>
                    <option value="Pieza">Pieza</option>
                    <option value="Caja">Caja</option>
                    <option value="Paquete">Paquete</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Código de Barras</label>
                  <input
                    type="text"
                    name="codigoBarras"
                    value={form.codigoBarras}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Código de barras"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    className={styles.formTextarea}
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="estatus"
                    checked={form.estatus}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  Activo
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setModalOpen(false)}
                className={styles.secondaryButton}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className={styles.primaryButton}
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {error && (
              <p className={styles.errorText}>{error}</p>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmHeader}>
              <h3>Confirmar Eliminación</h3>
            </div>
            <div className={styles.confirmBody}>
              <p>
                ¿Estás seguro de que deseas eliminar el producto "
                {selectedProducto?.nombre}"? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className={styles.confirmFooter}>
              <button
                onClick={() => setConfirmOpen(false)}
                className={styles.secondaryButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className={styles.dangerButton}
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
