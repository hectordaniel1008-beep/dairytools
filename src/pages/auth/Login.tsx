import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import styles from './Login.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Decoración de fondo */}
      <div className={styles.bg}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <img src="/logo.jpeg" alt="DairyTools" className={styles.logoImg} />
          <div>
            <h1 className={styles.logoTitle}>DairyTools</h1>
          </div>
        </div>

        <h2 className={styles.title}>Bienvenido</h2>
        <p className={styles.subtitle}>Ingresa tus credenciales para continuar</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                className={styles.input}
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPwd ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Panel demo — eliminar cuando conectes el servidor */}
        <div className={styles.demoBox}>
          <p className={styles.demoTitle}>🧪 Accesos de prueba</p>
          {[
            { email: 'admin@dairytools.com', pwd: 'admin123', rol: 'Admin' },
            { email: 'supervisor@dairytools.com', pwd: 'super123', rol: 'Supervisor' },
            { email: 'operador@dairytools.com', pwd: 'oper123', rol: 'Operador' },
          ].map((u) => (
            <button
              key={u.email}
              type="button"
              className={styles.demoUser}
              onClick={() => { setEmail(u.email); setPassword(u.pwd) }}
            >
              <span className={styles.demoRol}>{u.rol}</span>
              <span className={styles.demoEmail}>{u.email}</span>
            </button>
          ))}
        </div>

        <p className={styles.footer}>
          © {new Date().getFullYear()} DairyToolsApp · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
