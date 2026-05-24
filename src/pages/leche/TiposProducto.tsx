import { Tags } from 'lucide-react'
import { tiposProductoService } from '../../api/services'
import CatalogoSimplePage from './CatalogoSimplePage'

export default function TiposProductoPage() {
  return (
    <CatalogoSimplePage
      title="Tipos de producto"
      singular="Tipo de producto"
      icon={Tags}
      service={tiposProductoService}
    />
  )
}
