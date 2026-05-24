import { Ruler } from 'lucide-react'
import { unidadesMedidaService } from '../../api/services'
import CatalogoSimplePage from './CatalogoSimplePage'

export default function UnidadesMedidaPage() {
  return (
    <CatalogoSimplePage
      title="Unidades de medida"
      singular="Unidad de medida"
      icon={Ruler}
      service={unidadesMedidaService}
    />
  )
}
