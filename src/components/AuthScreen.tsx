import { useState } from 'react'
import { login, signup } from '../services/service'
import { useAuth } from '../context/AuthContext'

interface Props {
  onAuthSuccess: () => void
  onBack: () => void
}

type Tab = 'login' | 'register'

export function AuthScreen({ onAuthSuccess, onBack }: Props) {
  const { setAuth } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const switchTab = (t: Tab) => {
    setTab(t)
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      setAuth(res.data.token, res.data.tutor)
      onAuthSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (regPassword !== regConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const res = await signup(regName || null, regEmail, regPassword, regConfirm)
      setAuth(res.data.token, res.data.tutor)
      onAuthSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)' }}
    >
      {/* Estrellas de fondo */}
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
            height: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
            top: `${(i * 37 + 11) % 100}%`,
            left: `${(i * 53 + 7) % 100}%`,
            opacity: 0.3 + (i % 5) * 0.12,
            animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${(i % 4) * 0.5}s`,
          }}
        />
      ))}

      {/* Tarjeta principal */}
      <div
        className="relative z-10 flex flex-col gap-5 px-8 py-10 rounded-3xl w-full"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 60px rgba(100,150,255,0.2)',
          maxWidth: 420,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-white/50 hover:text-white text-xl transition-colors leading-none"
          >
            ←
          </button>
          <h2
            className="font-black text-2xl tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #63b3ed, #f6e05e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {tab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
          <button
            onClick={() => switchTab('login')}
            className="flex-1 py-2.5 text-sm font-bold transition-all"
            style={{
              background: tab === 'login' ? 'rgba(99,179,237,0.25)' : 'transparent',
              color: tab === 'login' ? '#63b3ed' : 'rgba(255,255,255,0.4)',
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => switchTab('register')}
            className="flex-1 py-2.5 text-sm font-bold transition-all"
            style={{
              background: tab === 'register' ? 'rgba(99,179,237,0.25)' : 'transparent',
              color: tab === 'register' ? '#63b3ed' : 'rgba(255,255,255,0.4)',
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className="px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'rgba(252,129,129,0.15)',
              border: '1px solid rgba(252,129,129,0.3)',
              color: '#fc8181',
            }}
          >
            {error}
          </div>
        )}

        {/* Login form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <InputField
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="tu@correo.com"
              required
            />
            <InputField
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Tu contraseña"
              required
            />
            <SubmitButton loading={loading} label="Entrar" />
          </form>
        )}

        {/* Register form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <InputField
              label="Nombre completo"
              type="text"
              value={regName}
              onChange={setRegName}
              placeholder="Tu nombre (opcional)"
            />
            <InputField
              label="Correo electrónico"
              type="email"
              value={regEmail}
              onChange={setRegEmail}
              placeholder="tu@correo.com"
              required
            />
            <InputField
              label="Contraseña"
              type="password"
              value={regPassword}
              onChange={setRegPassword}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
            />
            <InputField
              label="Confirmar contraseña"
              type="password"
              value={regConfirm}
              onChange={setRegConfirm}
              placeholder="Repite la contraseña"
              required
              minLength={8}
            />
            <SubmitButton loading={loading} label="Crear cuenta" />
          </form>
        )}

        {/* Footer hint */}
        <p className="text-white/30 text-xs text-center">
          {tab === 'login'
            ? '¿No tienes cuenta? Pulsa "Registrarse" arriba'
            : '¿Ya tienes cuenta? Pulsa "Iniciar Sesión" arriba'}
        </p>
      </div>
    </div>
  )
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/50 text-xs uppercase tracking-widest font-semibold">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full px-4 py-3 rounded-xl text-white text-sm font-medium outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(99,179,237,0.5)')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
      />
    </div>
  )
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-2xl font-black text-white text-lg transition-all active:scale-95 disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
        boxShadow: '0 4px 0 #1a365d',
      }}
    >
      {loading ? 'Cargando...' : label}
    </button>
  )
}
