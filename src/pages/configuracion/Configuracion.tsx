import { Building2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ConfiguracionPage() {
    return (
        <div className="flex flex-col gap-5 max-w-[1280px]">
            <div className="flex flex-col gap-4 sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-bg)] text-[var(--color-primary)]">
                        <Building2 size={22} />
                    </div>
                    <div>
                        <h2 className="font-bold leading-tight text-[var(--font-size-xl)]">Configuración</h2>
                        <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">Selecciona una opción para administrar el sistema.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Link
                    to="/configuracion/empresas"
                    className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-sm)] transition duration-150 ease-in-out hover:border-[var(--color-secondary)] hover:bg-[var(--color-bg-subtle)]"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-[14px] bg-[var(--color-secondary-bg)] text-[var(--color-secondary)] flex items-center justify-center">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-[var(--font-size-lg)] font-semibold">Empresas</h3>
                            <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">Gestiona las empresas vinculadas.</p>
                        </div>
                    </div>
                    <span className="text-[var(--color-secondary)] text-[var(--font-size-sm)] font-medium">Ir a Empresas →</span>
                </Link>

                <Link
                    to="/configuracion/usuarios"
                    className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-[var(--shadow-sm)] transition duration-150 ease-in-out hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-subtle)]"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-[14px] bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-[var(--font-size-lg)] font-semibold">Usuarios</h3>
                            <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">Gestiona los usuarios del sistema.</p>
                        </div>
                    </div>
                    <span className="text-[var(--color-primary)] text-[var(--font-size-sm)] font-medium">Ir a Usuarios →</span>
                </Link>


            </div>
        </div>
    )
}
