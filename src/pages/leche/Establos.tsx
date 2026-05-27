import { Building2 } from 'lucide-react'
import { establosService } from '../../api/services'
import CatalogoSimplePage from './CatalogoSimplePage'

export default function EstablosPage() {
    return (
        <CatalogoSimplePage
            title="Establos"
            singular="Establo"
            icon={Building2}
            service={establosService}
            fields={[
                { name: 'descripcion', label: 'Descripcion', required: true, placeholder: 'Nombre del establo' },
                { name: 'numero', label: 'Numero', required: true, placeholder: 'Numero del establo' },
            ]}
        />
    )
}
