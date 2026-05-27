import { Warehouse } from 'lucide-react'
import { almacenesService } from '../../api/services'
import CatalogoSimplePage from './CatalogoSimplePage'

export default function AlmacenesPage() {
    return (
        <CatalogoSimplePage
            title="Almacenes"
            singular="Almacen"
            icon={Warehouse}
            service={almacenesService}
        />
    )
}
