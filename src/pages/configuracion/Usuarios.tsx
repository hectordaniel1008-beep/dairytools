import { useEffect, useState } from 'react'
import { Users, Plus, Edit, Trash2, Search, Save, X, Building2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import styles from './Usuarios.module.css'
import mStyles from '../ModalForm.module.css'
import panelStyles from './SidePanel.module.css'
import { usuariosService } from '../../api/services'
import { empresasService } from '../../api/services'

interface UsuarioRow {
    id: number
    nombre: string
    email: string
    es_superadmin: boolean
    estatus: boolean
}

interface EmpresaRow {
    id: number
    nombre: string
    clave: string
    color?: string
    estatus: boolean
    rfc: string
}

interface UsuarioEmpresa {
    empresaId: number
    esDefault: boolean
}

const FORM_INIT = {
    nombre: '',
    email: '',
    password: '',
    es_superadmin: false,
    estatus: true,
}

function rolLabel(esSuperadmin: boolean) {
    return esSuperadmin ? 'Superadmin' : 'Usuario'
}

export default function UsuariosPage() {
    const [busqueda, setBusqueda] = useState('')
    const [usuarios, setUsuarios] = useState<UsuarioRow[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [usuarioParaEliminar, setUsuarioParaEliminar] = useState<UsuarioRow | null>(null)
    const [selectedUsuario, setSelectedUsuario] = useState<UsuarioRow | null>(null)
    const [form, setForm] = useState(FORM_INIT)
    const [isSaving, setIsSaving] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [panelOpen, setPanelOpen] = useState(false)
    const [empresas, setEmpresas] = useState<EmpresaRow[]>([])
    const [usuarioEmpresas, setUsuarioEmpresas] = useState<UsuarioEmpresa[]>([])
    const [selectedEmpresaDefault, setSelectedEmpresaDefault] = useState<number | null>(null)
    const [loadingEmpresas, setLoadingEmpresas] = useState(false)

    useEffect(() => {
        listarUsuarios()
        listarEmpresas()
    }, [])

    function abrirModalNuevo() {
        setSelectedUsuario(null)
        setForm(FORM_INIT)
        setError('')
        setModalOpen(true)
    }

    function abrirModalEdicion(usuario: UsuarioRow) {
        setSelectedUsuario(usuario)
        setForm({
            nombre: usuario.nombre,
            email: usuario.email,
            password: '',
            es_superadmin: usuario.es_superadmin,
            estatus: usuario.estatus,
        })
        setError('')
        setModalOpen(true)
    }

    async function listarUsuarios() {
        setLoading(true)
        setError('')
        try {
            const response = await usuariosService.listar()
            const rows = (response.data?.data ?? []).map((u: UsuarioRow) => ({
                ...u,
                estatus: u.estatus ?? true,
            })) as UsuarioRow[]
            setUsuarios(rows)
        } catch (err) {
            console.error(err)
            setError('No se pudo cargar la lista de usuarios')
        } finally {
            setLoading(false)
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target
        if (name === 'es_superadmin' || name === 'estatus') {
            setForm((prev) => ({
                ...prev,
                [name]: value === 'true',
            }))
            return
        }
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    async function handleGuardar() {
        if (!form.nombre.trim() || !form.email.trim()) {
            setError('Nombre y correo son obligatorios')
            return
        }

        // Validar nombre duplicado
        const nombreExistente = usuarios.find(u =>
            u.nombre.toLowerCase() === form.nombre.trim().toLowerCase() &&
            u.id !== selectedUsuario?.id
        )

        if (nombreExistente) {
            setError('El nombre de usuario ya está registrado')
            return
        }

        // Validar correo duplicado
        const emailExistente = usuarios.find(u =>
            u.email.toLowerCase() === form.email.trim().toLowerCase() &&
            u.id !== selectedUsuario?.id
        )

        if (emailExistente) {
            setError('El correo electrónico ya está registrado')
            return
        }

        if (!selectedUsuario && !form.password.trim()) {
            setError('La contraseña es obligatoria para un usuario nuevo')
            return
        }

        if (form.password.trim() && form.password.trim().length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setIsSaving(true)
        setError('')

        try {
            if (selectedUsuario) {
                const payload: {
                    nombre: string
                    email: string
                    es_superadmin: boolean
                    estatus: boolean
                    password?: string
                } = {
                    nombre: form.nombre.trim(),
                    email: form.email.trim(),
                    es_superadmin: form.es_superadmin,
                    estatus: form.estatus,
                }
                if (form.password.trim()) {
                    payload.password = form.password.trim()
                }
                await usuariosService.actualizar(selectedUsuario.id, payload)
            } else {
                await usuariosService.crear({
                    nombre: form.nombre.trim(),
                    email: form.email.trim(),
                    password: form.password.trim(),
                    es_superadmin: form.es_superadmin,
                    estatus: form.estatus,
                })
            }

            setForm(FORM_INIT)
            setSelectedUsuario(null)
            setModalOpen(false)
            await listarUsuarios()
        } catch (err) {
            console.error(err)
            setError(
                selectedUsuario ? 'No se pudo actualizar el usuario' : 'No se pudo crear el usuario'
            )
        } finally {
            setIsSaving(false)
        }
    }

    function handleEliminar(usuario: UsuarioRow) {
        setError('')
        setUsuarioParaEliminar(usuario)
        setConfirmOpen(true)
    }

    async function confirmarEliminar() {
        if (!usuarioParaEliminar) return

        try {
            await usuariosService.eliminar(usuarioParaEliminar.id)
            setUsuarios((prev) => prev.filter((u) => u.id !== usuarioParaEliminar.id))
            setConfirmOpen(false)
            setUsuarioParaEliminar(null)
        } catch (err) {
            console.error(err)
            setError('No se pudo eliminar el usuario')
        }
    }

    function cancelarEliminar() {
        setConfirmOpen(false)
        setUsuarioParaEliminar(null)
    }

    async function listarEmpresas() {
        try {
            const response = await empresasService.listar()
            const empresasData = (response.data?.data ?? []).map((empresa: any) => ({
                ...empresa,
                estatus: empresa.estatus ?? true,
            })) as EmpresaRow[]
            setEmpresas(empresasData)
        } catch (err) {
            console.error(err)
        }
    }

    function abrirPanelAsignarEmpresas(usuario: UsuarioRow) {
        setSelectedUsuario(usuario)
        setPanelOpen(true)
        setError('')
        // Aquí cargaremos las empresas asignadas al usuario
        cargarEmpresasUsuario(usuario.id)
    }

    async function cargarEmpresasUsuario(usuarioId: number) {
        setLoadingEmpresas(true)
        try {
            const response = await usuariosService.obtenerEmpresas(usuarioId)
            setUsuarioEmpresas(response.data?.data ?? [])

            // Establecer la empresa por defecto seleccionada
            const defaultEmpresa = response.data?.data?.find((ue: any) => ue.esDefault)
            if (defaultEmpresa) {
                setSelectedEmpresaDefault(defaultEmpresa.empresaId)
            }
        } catch (err) {
            console.error(err)
            setError('No se pudo cargar las empresas del usuario')
        } finally {
            setLoadingEmpresas(false)
        }
    }

    function handleEmpresaToggle(empresaId: number) {
        setUsuarioEmpresas(prev => {
            const existe = prev.find(ue => ue.empresaId === empresaId)
            if (existe) {
                // Si intenta deseleccionar y es la última empresa, no permitir
                if (prev.length === 1) {
                    setError('No puede deseleccionar la última empresa. El usuario debe tener al menos una empresa asignada.')
                    return prev
                }
                setError('')
                const next = prev.filter(ue => ue.empresaId !== empresaId)
                if (existe.esDefault) {
                    const nextDefaultId = next[0]?.empresaId ?? null
                    setSelectedEmpresaDefault(nextDefaultId)
                    return next.map((ue, index) => ({ ...ue, esDefault: index === 0 }))
                }
                return next
            } else {
                setError('')
                return [...prev, { empresaId, esDefault: false }]
            }
        })
    }

    function handleSeleccionarTodas() {
        const todasAsignadas = empresas.every(empresa =>
            usuarioEmpresas.some(ue => ue.empresaId === empresa.id)
        )

        if (todasAsignadas) {
            // Deseleccionar todas
            setUsuarioEmpresas([])
            setSelectedEmpresaDefault(null)
        } else {
            // Seleccionar todas
            const nuevasAsignaciones = empresas.map(empresa => ({
                empresaId: empresa.id,
                esDefault: false
            }))
            setUsuarioEmpresas(nuevasAsignaciones)
        }
    }

    function handleEmpresaDefaultChange(empresaId: number) {
        setSelectedEmpresaDefault(empresaId)
        setUsuarioEmpresas(prev =>
            prev.map(ue => ({
                ...ue,
                esDefault: ue.empresaId === empresaId
            }))
        )
    }

    async function handleGuardarAsignacion() {
        if (!selectedUsuario) return

        // Validar que se seleccione al menos una empresa
        if (usuarioEmpresas.length === 0) {
            setError('Debe seleccionar al menos una empresa para el usuario')
            return
        }

        const hasDefault = usuarioEmpresas.some(ue => ue.esDefault)
        const asignaciones = hasDefault
            ? usuarioEmpresas
            : usuarioEmpresas.map((ue, index) => ({ ...ue, esDefault: index === 0 }))

        setIsSaving(true)
        setError('')

        try {
            await usuariosService.actualizarEmpresas(selectedUsuario.id, asignaciones)
            setPanelOpen(false)
            setError('')
        } catch (err) {
            console.error(err)
            setError('No se pudo guardar la asignación de empresas')
        } finally {
            setIsSaving(false)
        }
    }

    function cerrarPanel() {
        setPanelOpen(false)
        setSelectedUsuario(null)
        setUsuarioEmpresas([])
        setSelectedEmpresaDefault(null)
    }

    const filtrados = usuarios.filter(
        (u) =>
            u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.email.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Users size={16} />
                    </div>
                    <div>
                        <h2 className={styles.pageTitle}>Usuarios</h2>
                    </div>
                </div>
                <button className={styles.primaryButton} onClick={abrirModalNuevo}>
                    <Plus size={15} /> Nuevo usuario
                </button>
            </div>

            {error && !modalOpen && !confirmOpen && (
                <p className={mStyles.errorText} style={{ margin: 0 }}>
                    {error}
                </p>
            )}

            <div className={styles.card}>
                <div className={styles.controls}>
                    <div className={styles.searchWrapper}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className={styles.searchInput}
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.th}>Nombre</th>
                                <th className={styles.th}>Email</th>
                                <th className={styles.th}>Rol</th>
                                <th className={styles.th}>Estatus</th>
                                <th className={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyRow}>
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : filtrados.length > 0 ? (
                                filtrados.map((usuario) => (
                                    <tr key={usuario.id} className={styles.rowHover}>
                                        <td className={styles.td} data-label="Nombre">
                                            {usuario.nombre}
                                        </td>
                                        <td className={`${styles.td} ${styles.cellMuted}`} data-label="Email">
                                            {usuario.email}
                                        </td>
                                        <td className={styles.td} data-label="Rol">
                                            <span className={styles.roleBadge}>
                                                {rolLabel(usuario.es_superadmin)}
                                            </span>
                                        </td>
                                        <td className={styles.td} data-label="Estatus">
                                            <span className={styles.roleBadge}>
                                                {usuario.estatus ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>

                                        <td className={styles.actionCell} data-label="Acciones">
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionButton}
                                                    title="Editar"
                                                    onClick={() => abrirModalEdicion(usuario)}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className={styles.actionButton}
                                                    title="Asignar empresas"
                                                    onClick={() => abrirPanelAsignarEmpresas(usuario)}
                                                >
                                                    <Building2 size={14} />
                                                </button>
                                                <button
                                                    className={`${styles.actionButton} ${styles.dangerButton}`}
                                                    title="Eliminar"
                                                    onClick={() => handleEliminar(usuario)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className={styles.emptyRow}>
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setSelectedUsuario(null)
                }}
                title={selectedUsuario ? 'Editar usuario' : 'Nuevo usuario'}
            >
                <div className={mStyles.form}>
                    <div className={mStyles.field}>
                        <label className={mStyles.label}>Nombre *</label>
                        <input
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            className={mStyles.input}
                            placeholder="Nombre completo"
                            autoComplete="name"
                            autoFocus
                        />
                    </div>

                    <div className={mStyles.field}>
                        <label className={mStyles.label}>Correo *</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className={mStyles.input}
                            placeholder="correo@ejemplo.com"
                            autoComplete="off"
                        />
                    </div>

                    <div className={mStyles.field}>
                        <label className={mStyles.label}>
                            Contraseña {selectedUsuario ? '(opcional)' : '*'}
                        </label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            className={mStyles.input}
                            placeholder={
                                selectedUsuario ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'
                            }
                            autoComplete="new-password"
                        />
                    </div>

                    <div className={mStyles.field}>
                        <label htmlFor="es_superadmin" className={mStyles.label}>
                            Rol *
                        </label>
                        <select
                            id="es_superadmin"
                            name="es_superadmin"
                            value={String(form.es_superadmin)}
                            onChange={handleChange}
                            className={mStyles.input}
                        >
                            <option value="false">Usuario</option>
                            <option value="true">Superadmin</option>
                        </select>
                    </div>

                    <div className={mStyles.field}>
                        <label htmlFor="estatus" className={mStyles.label}>
                            Estado *
                        </label>
                        <select
                            id="estatus"
                            name="estatus"
                            value={String(form.estatus)}
                            onChange={handleChange}
                            className={mStyles.input}
                        >
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </select>
                    </div>

                    {error && <p className={mStyles.errorText}>{error}</p>}

                    <div className={mStyles.actions}>
                        <button className={mStyles.btnSave} onClick={handleGuardar} disabled={isSaving}>
                            <Save size={15} />{' '}
                            {isSaving ? 'Guardando...' : selectedUsuario ? 'Actualizar' : 'Guardar'}
                        </button>
                        <button
                            className={mStyles.btnCancel}
                            onClick={() => {
                                setModalOpen(false)
                                setSelectedUsuario(null)
                            }}
                        >
                            <X size={15} /> Cancelar
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal open={confirmOpen} onClose={cancelarEliminar} title="Confirmar eliminación" width={420}>
                <div className={mStyles.form}>
                    <p>
                        ¿Estás seguro de que deseas eliminar al usuario{' '}
                        <strong>{usuarioParaEliminar?.nombre}</strong>?
                    </p>
                    {error && <p className={mStyles.errorText}>{error}</p>}
                    <div className={mStyles.actions}>
                        <button className={mStyles.btnCancel} onClick={cancelarEliminar}>
                            <X size={15} /> Cancelar
                        </button>
                        <button className={mStyles.btnDanger} onClick={confirmarEliminar}>
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Panel lateral para asignar empresas */}
            <div className={`${panelStyles.panelOverlay} ${panelOpen ? panelStyles.open : ''}`} onClick={cerrarPanel} />
            <div className={`${panelStyles.panel} ${panelOpen ? panelStyles.open : ''}`}>
                <div className={panelStyles.panelHeader}>
                    <h3 className={panelStyles.panelTitle}>
                        Asignar empresas a {selectedUsuario?.nombre}
                    </h3>
                    <button type="button" className={panelStyles.panelClose} onClick={cerrarPanel} aria-label="Cerrar panel">
                        <X size={20} />
                    </button>
                </div>

                <div className={panelStyles.panelContent}>
                    {error && <div className={panelStyles.panelError}>{error}</div>}

                    {loadingEmpresas ? (
                        <div className={panelStyles.loadingText}>
                            Cargando empresas...
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                                    <input
                                        type="checkbox"
                                        style={{ marginRight: '8px' }}
                                        checked={empresas.length > 0 && empresas.every(empresa =>
                                            usuarioEmpresas.some(ue => ue.empresaId === empresa.id)
                                        )}
                                        onChange={handleSeleccionarTodas}
                                    />
                                    Seleccionar todas las empresas
                                </label>
                            </div>

                            <p style={{ marginBottom: '16px', color: 'var(--color-text-muted)' }}>
                                Selecciona las empresas a las que el usuario tendrá acceso y elige una como predeterminada.
                            </p>

                            {empresas.map((empresa) => {
                                const isAsignada = usuarioEmpresas.some(ue => ue.empresaId === empresa.id)
                                const isDefault = usuarioEmpresas.some(ue => ue.empresaId === empresa.id && ue.esDefault)

                                return (
                                    <div key={empresa.id} className={panelStyles.empresaItem}>
                                        <input
                                            type="checkbox"
                                            className={panelStyles.empresaCheckbox}
                                            checked={isAsignada}
                                            aria-label={`Asignar empresa ${empresa.nombre}`}
                                            onChange={() => handleEmpresaToggle(empresa.id)}
                                        />
                                        <div className={panelStyles.empresaInfo}>
                                            <div className={panelStyles.empresaNombre}>{empresa.nombre}</div>
                                            <div className={panelStyles.empresaClave}>{empresa.clave} • {empresa.rfc}</div>
                                        </div>
                                        {isAsignada && (
                                            <input
                                                type="radio"
                                                className={panelStyles.empresaRadio}
                                                name="empresaDefault"
                                                checked={isDefault}
                                                aria-label={`Empresa predeterminada ${empresa.nombre}`}
                                                onChange={() => handleEmpresaDefaultChange(empresa.id)}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>

                <div className={panelStyles.panelActions}>
                    <button className={mStyles.btnCancel} onClick={cerrarPanel}>
                        <X size={15} /> Cancelar
                    </button>
                    <button
                        className={mStyles.btnSave}
                        onClick={handleGuardarAsignacion}
                        disabled={isSaving || usuarioEmpresas.length === 0}
                    >
                        <Save size={15} /> {isSaving ? 'Guardando...' : 'Guardar asignación'}
                    </button>
                </div>
            </div>
        </div>
    )
}
