import { Users, Plus, Edit, Trash2, Search } from 'lucide-react'
import { useState } from 'react'
import styles from './Usuarios.module.css'

const mockUsuarios = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@dairytools.com', rol: 'Admin', estado: 'Activo' },
    { id: 2, nombre: 'María García', email: 'maria@dairytools.com', rol: 'Supervisor', estado: 'Activo' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@dairytools.com', rol: 'Operador', estado: 'Inactivo' },
]

export default function UsuariosPage() {
    const [busqueda, setBusqueda] = useState('')
    const [usuarios] = useState(mockUsuarios)

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
                <button className={styles.primaryButton}>
                    <Plus size={16} /> Nuevo usuario
                </button>
            </div>

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
                                <th className={styles.th}>Estado</th>
                                <th className={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length > 0 ? (
                                filtrados.map((usuario) => (
                                    <tr key={usuario.id} className={styles.rowHover}>
                                        <td className={styles.td} data-label="Nombre">{usuario.nombre}</td>
                                        <td className={`${styles.td} ${styles.cellMuted}`} data-label="Email">{usuario.email}</td>
                                        <td className={styles.td} data-label="Rol">
                                            <span className={styles.roleBadge}>
                                                {usuario.rol}
                                            </span>
                                        </td>
                                        <td className={styles.td} data-label="Estado">
                                            <span className={`${styles.statusBadge} ${usuario.estado === 'Activo' ? styles.statusActive : styles.statusInactive}`}>
                                                {usuario.estado}
                                            </span>
                                        </td>
                                        <td className={styles.actionCell} data-label="Acciones">
                                            <div className={styles.actions}>
                                                <button className={styles.actionButton} title="Editar">
                                                    <Edit size={14} />
                                                </button>
                                                <button className={`${styles.actionButton} ${styles.dangerButton}`} title="Eliminar">
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
        </div>
    )
}
