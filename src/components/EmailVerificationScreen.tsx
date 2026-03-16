import { useState } from 'react'
import { resendVerification } from '../services/service'

interface Props {
  email: string
  onBackToLogin: () => void
}

export function EmailVerificationScreen({ email, onBackToLogin }: Props) {
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResend = async () => {
    setResending(true)
    setError('')
    setMessage('')
    try {
      const res = await resendVerification(email)
      setMessage(res.message)
    } catch (err: any) {
      setError(err.message || 'Error al reenviar el correo')
    } finally {
      setResending(false)
    }
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        height: '100dvh',
        background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)',
      }}
    >
      {/* Background stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width: i % 3 === 0 ? 3 : 1.5,
            height: i % 3 === 0 ? 3 : 1.5,
            top: `${(i * 37 + 11) % 100}%`,
            left: `${(i * 53 + 7) % 100}%`,
            opacity: 0.3 + (i % 5) * 0.12,
            animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${(i % 4) * 0.5}s`,
          }}
        />
      ))}

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 rounded-3xl w-full text-center"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 60px rgba(100,150,255,0.2)',
          maxWidth: 420,
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, rgba(99,179,237,0.2), rgba(72,187,120,0.2))',
            border: '2px solid rgba(99,179,237,0.3)',
          }}
        >
          <span className="text-4xl">📧</span>
        </div>

        {/* Title */}
        <h2
          className="font-black text-2xl tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Verifica tu correo
        </h2>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <p className="text-white/70 text-sm">
            Hemos enviado un enlace de verificación a:
          </p>
          <p
            className="text-white font-bold text-base px-4 py-2 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {email}
          </p>
          <p className="text-white/50 text-xs mt-1">
            Revisa tu bandeja de entrada (y la carpeta de spam).
            Haz clic en el enlace para activar tu cuenta.
          </p>
        </div>

        {/* Success message */}
        {message && (
          <div
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'rgba(72,187,120,0.15)',
              border: '1px solid rgba(72,187,120,0.3)',
              color: '#48bb78',
            }}
          >
            {message}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'rgba(252,129,129,0.15)',
              border: '1px solid rgba(252,129,129,0.3)',
              color: '#fc8181',
            }}
          >
            {error}
          </div>
        )}

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: 'rgba(99,179,237,0.15)',
            border: '1px solid rgba(99,179,237,0.3)',
            color: '#63b3ed',
          }}
        >
          {resending ? 'Reenviando...' : 'Reenviar correo de verificación'}
        </button>

        {/* Back to login */}
        <button
          onClick={onBackToLogin}
          className="w-full py-3 rounded-xl font-black text-white text-sm transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
            boxShadow: '0 3px 0 #1a365d',
          }}
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    </div>
  )
}
