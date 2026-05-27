import { Milk } from 'lucide-react'
import { tiposSalidaLecheService } from '../../api/services'
import CatalogoSimplePage from './CatalogoSimplePage'

export default function TiposSalidaLechePage() {
    return (
        <CatalogoSimplePage
            title="Tipos de salidas de leche"
            singular="Tipo de salida de leche"
            icon={Milk}
            service={tiposSalidaLecheService}
        />
    )
}
