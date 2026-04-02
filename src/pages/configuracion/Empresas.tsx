import { useEffect, useState } from 'react'
import { Building2, Plus, Edit, Trash2, Search, Save, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import styles from './Empresas.module.css'
import mStyles from '../ModalForm.module.css'
import { empresasService } from '../../api/services'

interface EmpresaRow {
    id: number
    nombre: string
    clave: string
    color?: string
    estatus: boolean
}

const FORM_INIT = {
    nombre: '',
    clave: '',
    color: '#1e5a96',
    estatus: true,
}

const COLOR_PALETTE = [
    '#1e5a96',
    '#f97316',
    '#16a34a',
    '#0ea5e9',
    '#8b5cf6',
    '#db2777',
]

function getColorClass(color?: string) {
    switch (color?.toLowerCase()) {
        case '#1e5a96':
            return styles.colorBadgeBlue
        case '#f97316':
            return styles.colorBadgeOrange
        case '#16a34a':
            return styles.colorBadgeGreen
        case '#0ea5e9':
            return styles.colorBadgeSky
        case '#8b5cf6':
            return styles.colorBadgePurple
        case '#db2777':
            return styles.colorBadgePink
        default:
            return styles.colorBadgeDefault
    }
}

export default function EmpresasPage() {
    const [busqueda, setBusqueda] = useState('')
    const [empresas, setEmpresas] = useState<EmpresaRow[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [empresaParaEliminar, setEmpresaParaEliminar] = useState<EmpresaRow | null>(null)
    const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaRow | null>(null)
    const [form, setForm] = useState(FORM_INIT)
    const [isSaving, setIsSaving] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        listarEmpresas()
    }, [])

    function generarColorAleatorio() {
        return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
    }

    function abrirModalNueva() {
        setSelectedEmpresa(null)
        setForm(FORM_INIT)
        setError('')
        setModalOpen(true)
    }

    function abrirModalEdicion(empresa: EmpresaRow) {
        setSelectedEmpresa(empresa)
        setForm({
            nombre: empresa.nombre,
            clave: empresa.clave,
            color: empresa.color ?? generarColorAleatorio(),
            estatus: empresa.estatus,
        })
        setError('')
        setModalOpen(true)
    }

    async function listarEmpresas() {
        setLoading(true)
        setError('')
        try {
            const response = await empresasService.listar()
            const empresasData = (response.data?.data ?? []).map((empresa: any) => ({
                ...empresa,
                estatus: empresa.estatus ?? true,
            })) as EmpresaRow[]
            setEmpresas(empresasData)
        } catch (err) {
            console.error(err)
            setError('No se pudo cargar la lista de empresas')
        } finally {
            setLoading(false)
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: name === 'estatus' ? value === 'true' : value,
        }))
    }

    async function handleGuardar() {
        if (!form.nombre.trim() || !form.clave.trim()) {
            setError('Nombre y clave son obligatorios')
            return
        }

        setIsSaving(true)
        setError('')

        try {
            if (selectedEmpresa) {
                await empresasService.actualizar(selectedEmpresa.id, {
                    nombre: form.nombre.trim(),
                    clave: form.clave.trim(),
                    estatus: form.estatus,
                })
            } else {
                await empresasService.crear({
                    nombre: form.nombre.trim(),
                    clave: form.clave.trim(),
                    color: generarColorAleatorio(),
                    estatus: form.estatus,
                })
            }

            setForm(FORM_INIT)
            setSelectedEmpresa(null)
            setModalOpen(false)
            await listarEmpresas()
        } catch (err) {
            console.error(err)
            setError(selectedEmpresa ? 'No se pudo actualizar la empresa' : 'No se pudo crear la empresa')
        } finally {
            setIsSaving(false)
        }
    }

    function handleEliminar(empresa: EmpresaRow) {
        setEmpresaParaEliminar(empresa)
        setConfirmOpen(true)
    }

    async function confirmarEliminar() {
        if (!empresaParaEliminar) return

        try {
            await empresasService.eliminar(empresaParaEliminar.id)
            setEmpresas((prev) => prev.filter((empresa) => empresa.id !== empresaParaEliminar.id))
            setConfirmOpen(false)
            setEmpresaParaEliminar(null)
        } catch (err) {
            console.error(err)
            setError('No se pudo eliminar la empresa')
        }
    }

    function cancelarEliminar() {
        setConfirmOpen(false)
        setEmpresaParaEliminar(null)
    }

    const filtradas = empresas.filter(
        (empresa) =>
            empresa.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            empresa.clave.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Building2 size={22} />
                    </div>
                    <div>
                        <h2 className={styles.pageTitle}>Empresas</h2>
                        <p className={styles.pageSubtitle}>Gestiona las empresas vinculadas</p>
                    </div>
                </div>
                <button className={styles.primaryButton} onClick={abrirModalNueva}>
                    <Plus size={16} /> Nueva empresa
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.controls}>
                    <div className={styles.searchWrapper}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o clave..."
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
                                <th className={styles.th}>Clave</th>
                                <th className={styles.th}>Color</th>
                                <th className={styles.th}>ESTATUS</th>
                                <th className={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyRow}>
                                        Cargando empresas...
                                    </td>
                                </tr>
                            ) : filtradas.length > 0 ? (
                                filtradas.map((empresa) => (
                                    <tr key={empresa.id} className={styles.rowHover}>
                                        <td className={styles.td} data-label="Nombre">{empresa.nombre}</td>
                                        <td className={`${styles.td} ${styles.cellMuted}`} data-label="Clave">{empresa.clave}</td>
                                        <td className={styles.td} data-label="Color">
                                            <span
                                                className={styles.colorBadge}
                                                style={{ '--badge-color': empresa.color ?? 'var(--color-bg-subtle)' } as React.CSSProperties}
                                                aria-label={empresa.color ? `Color ${empresa.color}` : 'Sin color'}
                                            />
                                        </td>
                                        <td className={styles.td} data-label="Estatus">
                                            <span className={styles.roleBadge}>
                                                {empresa.estatus ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className={styles.actionCell} data-label="Acciones">
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionButton}
                                                    title="Editar"
                                                    onClick={() => abrirModalEdicion(empresa)}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className={`${styles.actionButton} ${styles.dangerButton}`}
                                                    title="Eliminar"
                                                    onClick={() => handleEliminar(empresa)}
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
                                        No se encontraron empresas
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
                    setSelectedEmpresa(null)
                }}
                title={selectedEmpresa ? 'Editar empresa' : 'Nueva empresa'}
            >
                <div className={mStyles.form}>
                    <div className={mStyles.field}>
                        <label className={mStyles.label}>Nombre *</label>
                        <input
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            className={mStyles.input}
                            placeholder="Nombre de la empresa"
                        />
                    </div>

                    <div className={mStyles.field}>
                        <label className={mStyles.label}>Clave *</label>
                        <input
                            name="clave"
                            value={form.clave}
                            onChange={handleChange}
                            className={mStyles.input}
                            placeholder="Clave de la empresa"
                        />
                    </div>

                    <div className={mStyles.field}>
                        <label htmlFor="estatus" className={mStyles.label}>Estatus *</label>
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
                                setSelectedEmpresa(null)
                            }}
                        >
                            <X size={15} /> Cancelar
                        </button>
                        <button className={mStyles.btnSave} onClick={handleGuardar} disabled={isSaving}>
                            <Save size={15} /> {isSaving ? 'Guardando...' : selectedEmpresa ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={confirmOpen}
                onClose={cancelarEliminar}
                title="Confirmar eliminación"
                width={420}
            >
                <div className={mStyles.form}>
                    <p>¿Estás seguro de que deseas eliminar la empresa <strong>{empresaParaEliminar?.nombre}</strong>?</p>
                    {error && <p className={mStyles.errorText}>{error}</p>}
                    <div className={mStyles.actions}>
                        <button className={mStyles.btnCancel} onClick={cancelarEliminar}>
                            <X size={15} /> Cancelar
                        </button>
                        <button
                            className={mStyles.btnSave}
                            onClick={confirmarEliminar}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
