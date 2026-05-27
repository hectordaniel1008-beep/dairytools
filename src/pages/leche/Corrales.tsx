import { PenSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { establosService, corralesService } from '../../api/services'
import { useEmpresa } from '../../context/EmpresaContext'
import CatalogoSimplePage from './CatalogoSimplePage'

interface CatalogoOption {
    id: number
    descripcion: string
}

export default function CorralesPage() {
    const { empresaActual } = useEmpresa()
    const [establos, setEstablos] = useState<CatalogoOption[]>([])

    useEffect(() => {
        if (!empresaActual?.id) {
            setEstablos([])
            return
        }

        establosService.listar()
            .then((response) => {
                setEstablos(response.data?.data ?? [])
            })
            .catch((err) => {
                console.error(err)
                setEstablos([])
            })
    }, [empresaActual?.id])

    return (
        <CatalogoSimplePage
            title="Corrales"
            singular="Corral"
            icon={PenSquare}
            service={corralesService}
            fields={[
                { name: 'descripcion', label: 'Descripcion', required: true, placeholder: 'Nombre del corral' },
                { name: 'establoId', label: 'Id establo', required: true, type: 'select' },
            ]}
            fieldRenderers={{
                establoId: (row) => row.establo?.descripcion ?? String(row.establoId ?? ''),
            }}
            optionsByField={{
                establoId: establos,
            }}
        />
    )
}
