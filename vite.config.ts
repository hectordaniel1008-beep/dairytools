import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      '.trycloudflare.com', // Permite cualquier dominio que termine en .trycloudflare.com
      // 'otro-dominio.com' // Puedes añadir más si es necesario
    ],
  },
})
