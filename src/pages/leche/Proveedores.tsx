import { Truck } from 'lucide-react'
import { proveedoresService } from '../../api/services'
import CatalogoSimplePage from './CatalogoSimplePage'

export default function ProveedoresPage() {
  return (
    <CatalogoSimplePage
      title="Proveedores"
      singular="Proveedor"
      icon={Truck}
      service={proveedoresService}
      fields={[
        { name: 'descripcion', label: 'Descripcion', required: true, placeholder: 'Nombre del proveedor' },
        { name: 'rfc', label: 'RFC', required: true, placeholder: 'RFC del proveedor' },
      ]}
    />
  )
}
