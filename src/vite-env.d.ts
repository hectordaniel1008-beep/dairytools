/// <reference types="vite/client" />

// Declaración de módulos CSS — permite importar archivos .css y .module.css
declare module '*.css' {
  const styles: Record<string, string>
  export default styles
}

declare module '*.module.css' {
  const styles: Record<string, string>
  export default styles
}

// Declaración de imágenes y otros assets
declare module '*.svg' { const src: string; export default src }
declare module '*.png' { const src: string; export default src }
declare module '*.jpg' { const src: string; export default src }
declare module '*.jpeg' { const src: string; export default src }
declare module '*.gif' { const src: string; export default src }
declare module '*.webp' { const src: string; export default src }
declare module '*.ico' { const src: string; export default src }

// Variables de entorno tipadas (VITE_*)
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Agrega aquí otras variables VITE_ que uses
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
