import { Apple } from 'lucide-react'
import { dietasService } from '../../api/services'
import CatalogoSimplePage from './CatalogoSimplePage'

export default function DietasPage() {
    return (
        <CatalogoSimplePage
            title="Dietas"
            singular="Dieta"
            icon={Apple}
            service={dietasService}
        />
    )
}
