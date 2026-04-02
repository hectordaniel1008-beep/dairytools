import { useEffect, useState } from 'react'
import { Users, Plus, Edit, Trash2, Search, Save, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import styles from './Usuarios.module.css'
import mStyles from '../ModalForm.module.css'
import { usuariosService } from '../../api/services'

interface UsuarioRow {
    id: number
    nombre: string
    email: string
    es_superadmin: boolean
    estatus: boolean
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

    useEffect(() => {
        listarUsuarios()
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
                        <Users size={22} />
                    </div>
                    <div>
                        <h2 className={styles.pageTitle}>Usuarios</h2>
                        <p className={styles.pageSubtitle}>Gestiona los usuarios del sistema</p>
                    </div>
                </div>
                <button className={styles.primaryButton} onClick={abrirModalNuevo}>
                    <Plus size={16} /> Nuevo usuario
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
                            autoComplete="email"
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
                        <button
                            className={mStyles.btnCancel}
                            onClick={() => {
                                setModalOpen(false)
                                setSelectedUsuario(null)
                            }}
                        >
                            <X size={15} /> Cancelar
                        </button>
                        <button className={mStyles.btnSave} onClick={handleGuardar} disabled={isSaving}>
                            <Save size={15} />{' '}
                            {isSaving ? 'Guardando...' : selectedUsuario ? 'Actualizar' : 'Guardar'}
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
                        <button className={mStyles.btnSave} onClick={confirmarEliminar}>
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
