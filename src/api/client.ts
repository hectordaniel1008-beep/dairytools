import axios from 'axios'

// ============================================================
//  Cliente HTTP — NestJS backend
// ============================================================
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
  timeout: 15000,
})

// Rutas que NO deben disparar renovación de token
const RUTAS_PUBLICAS = [
  '/auth/login',
  '/auth/logout',
  '/auth/refresh',
  '/auth/perfil',
]

let renovando = false
let cola: Array<() => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    const esPublica = RUTAS_PUBLICAS.some(r => original?.url?.includes(r))
    if (esPublica || original?._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (renovando) {
      return new Promise((resolve) => {
        cola.push(() => resolve(api(original)))
      })
    }

    original._retry = true
    renovando       = true

    try {
      await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      cola.forEach(fn => fn())
      cola = []
      return api(original)
    } catch {
      cola = []
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      renovando = false
    }
  }
)

export default api
