import { useState } from 'react'
import { login, signup } from '../services/service'
import { useAuth } from '../context/AuthContext'

interface Props {
  onAuthSuccess: () => void
  onBack: () => void
  onSignupSuccess: (email: string) => void
}

type View = 'login' | 'register'

const CARD_W = 387
const CARD_H = 506
const NAV_BG = '#505FFF'

export function AuthScreen({ onAuthSuccess, onSignupSuccess }: Props) {
  const { setAuth } = useAuth()
  const [view, setView] = useState<View>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const [acceptAge, setAcceptAge] = useState(false)
  const [acceptChildData, setAcceptChildData] = useState(false)

  const canRegister = (): boolean =>
    acceptAge && acceptChildData && regPassword === regConfirm && !!regEmail

  const switchAuthTab = (next: View) => {
    setView(next)
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
    } catch {
      setError('Error al iniciar sesión')
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
      await signup(regName || null, regEmail, regPassword, regConfirm)
      onSignupSuccess(regEmail)
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const navTitle = view === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARSE'

  // Register view needs taller card
  const cardHeight = view === 'register' ? 'auto' : CARD_H
  const cardMinHeight = view === 'register' ? 580 : CARD_H

  return (
    <div
      className={`auth-outer auth-outer--${view} fixed inset-0 overflow-hidden`}
      style={{
        backgroundImage: "url('/assets/backgrounds/menu/sky 1.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#9FE3D8',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

        @keyframes cloudSlow {
          from { transform: translateX(-30px); }
          to   { transform: translateX(30px); }
        }

        .auth-card * {
          font-family: 'Nunito', sans-serif;
        }

        .nav-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 20px;
          letter-spacing: 0.12em;
          color: white;
          text-shadow:
            0 2px 0 rgba(0,0,0,0.20),
            0 0 12px rgba(255,255,255,0.15);
        }

        .field-label {
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: #999;
          text-transform: uppercase;
        }

        .field-input {
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #444;
          background: #F5F5F5;
          border: 1.5px solid #E0E0E0;
          border-radius: 10px;
          padding: 10px 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }

        .field-input::placeholder {
          color: #C0C0C0;
          font-weight: 500;
        }

        .field-input:focus {
          border-color: #5DCEF8;
        }

        .consent-section-label {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: #E83A3A;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .consent-text {
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          font-size: 10px;
          color: #777;
          line-height: 1.4;
        }

        .tab-active {
          background: linear-gradient(180deg, #FFE066 0%, #FFC93D 100%);
          color: #7C5400;
          box-shadow: 0 2px 0 #DAA520;
          border-radius: 999px;
          font-weight: 900;
        }

        .tab-inactive {
          background: transparent;
          color: #666;
          font-weight: 800;
          border-radius: 999px;
        }

        .btn-green {
          background: linear-gradient(180deg, #B3E665 0%, #7BC340 60%, #5FA628 100%);
          border: 2px solid #4F8C20;
          box-shadow: 0 4px 0 #3D6E18, 0 6px 14px rgba(120,200,80,0.30), inset 0 2px 0 rgba(255,255,255,0.5);
          color: white;
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 18px;
          letter-spacing: 0.14em;
          text-shadow: 0 1px 2px rgba(0,0,0,0.25);
          border-radius: 999px;
          width: 100%;
          padding: 13px 0;
          cursor: pointer;
          transition: transform 0.1s;
        }

        .btn-green:active { transform: scale(0.96) translateY(2px); }
        .btn-green:disabled { opacity: 0.5; cursor: not-allowed; }

        .fields-box {
          background: #F5F5F5;
          border-radius: 14px;
          padding: 14px 14px 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Spacer flexible que pega el botón al fondo de la card en desktop.
           En móvil (incluido landscape) lo colapsamos para que el botón quede pegado al formulario.
           La coma en la media query es OR — aplica si la pantalla es estrecha (portrait)
           O baja (landscape de móvil), cubriendo ambas orientaciones. */
        .login-spacer { flex: 1 1 auto; }
        @media (max-width: 640px), (max-height: 600px) {
          .login-spacer { display: none; }
          /* La card del auth se ajusta a su contenido para que no quede
             un hueco vacío debajo del botón cuando el spacer está colapsado. */
          .auth-card {
            height: auto !important;
            min-height: 0 !important;
          }
          /* Anula el gap-3 del form — así fields-box y botón quedan juntos */
          .login-form { gap: 0 !important; }
          /* En móvil/landscape corto, registrarse SÍ necesita scroll porque el formulario
             + checkboxes de consentimiento puede exceder el viewport. Login cabe siempre.
             Por defecto el outer está oculto (sin scroll en web), aquí lo reactivamos solo
             para registrarse en móvil. */
          .auth-outer--register { overflow-y: auto !important; }
          .auth-inner { overflow-y: visible !important; }
        }
      `}</style>

      <img
        src="/assets/backgrounds/menu/clouds_1 1.png"
        alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ top: '8%', left: 0, width: '100%', opacity: 0.85, animation: 'cloudSlow 18s ease-in-out infinite alternate' }}
      />
      <img
        src="/assets/backgrounds/menu/clouds_2 1.png"
        alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ bottom: '6%', left: 0, width: '100%', opacity: 0.7, animation: 'cloudSlow 24s ease-in-out infinite alternate-reverse' }}
      />

      {/* Wrapper de scroll: min-h-full centra cuando entra todo y permite crecer +
          que el viewport empuje al outer (overflow-y-auto) en móvil / pantallas cortas. */}
      <div className="relative min-h-full flex items-center justify-center p-4">
      <div
        className="auth-card relative flex flex-col rounded-3xl overflow-hidden"
        style={{
          width: CARD_W,
          height: cardHeight,
          minHeight: cardMinHeight,
          maxWidth: 'calc(100vw - 32px)',
          background: 'white',
          boxShadow: '0 24px 60px rgba(0,0,0,0.28), 0 8px 16px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <header
          className="relative flex items-center justify-center flex-shrink-0"
          style={{ background: NAV_BG, height: 62 }}
        >
          <h1 className="nav-title select-none">{navTitle}</h1>
        </header>

        <div className={`auth-inner auth-inner--${view} flex-1 flex flex-col px-6 py-5 overflow-y-auto`}>
          {error && (
            <div
              className="w-full px-3 py-2 rounded-lg text-xs font-semibold mb-3 flex-shrink-0"
              style={{ background: '#FEE', border: '1px solid #FCC', color: '#C33', fontFamily: 'Nunito, sans-serif' }}
            >
              {error}
            </div>
          )}

          {view === 'login' && (
            <>
              <TabSwitcher active="login" onSwitch={switchAuthTab} />
              <form onSubmit={handleLogin} className="login-form flex flex-col gap-3 mt-4 flex-1">
                <div className="fields-box">
                  <FormField
                    label="CORREO ELECTRÓNICO"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="tu@correo.com"
                    required
                  />
                  <FormField
                    label="CONTRASEÑA"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Tú contraseña"
                    required
                  />
                </div>
                <div className="login-spacer" />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-green"
                >
                  {loading ? 'CARGANDO...' : 'ENTRAR'}
                </button>
              </form>
            </>
          )}

          {view === 'register' && (
            <>
              <TabSwitcher active="register" onSwitch={switchAuthTab} />
              <form onSubmit={handleRegister} className="flex flex-col gap-3 mt-4 flex-1">
                {/* Fields box */}
                <div className="fields-box">
                  <FormField
                    label="NOMBRE COMPLETO"
                    type="text"
                    value={regName}
                    onChange={setRegName}
                    placeholder="tu@correo.com"
                  />
                  <FormField
                    label="CORREO ELECTRÓNICO"
                    type="email"
                    value={regEmail}
                    onChange={setRegEmail}
                    placeholder="Tú contraseña"
                    required
                  />
                  <FormField
                    label="CONTRASEÑA"
                    type="password"
                    value={regPassword}
                    onChange={setRegPassword}
                    placeholder="Tú contraseña"
                    required
                    minLength={8}
                  />
                  <FormField
                    label="CONFIRMAR CONTRASEÑA"
                    type="password"
                    value={regConfirm}
                    onChange={setRegConfirm}
                    placeholder="Tú contraseña"
                    required
                    minLength={8}
                  />
                </div>

                {/* Consent section */}
                <div style={{ marginTop: 2 }}>
                  <div className="consent-section-label">CONSENTIMIENTO</div>
                  <ConsentCheckbox
                    checked={acceptAge}
                    onChange={setAcceptAge}
                    label="Confirmo que soy mayor de 18 años."
                  />
                  <div style={{ marginTop: 6 }}>
                    <ConsentCheckbox
                      checked={acceptChildData}
                      onChange={setAcceptChildData}
                      label="Como tutor/docente, confirmo que tengo autorización parental o tutela legal  para gestionar los datos de los estudiantes que añada a mi cuenta"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !canRegister()}
                  className="btn-green"
                  style={{ marginTop: 4 }}
                >
                  {loading ? 'CARGANDO...' : 'ENTRAR'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

function TabSwitcher({ active, onSwitch }: {
  active: 'login' | 'register'
  onSwitch: (next: 'login' | 'register') => void
}) {
  return (
    <div
      className="w-full flex p-1 rounded-full flex-shrink-0"
      style={{ background: '#F0F0F0' }}
    >
      {(['login', 'register'] as const).map((id) => {
        const isActive = active === id
        const label = id === 'login' ? 'Iniciar sesión' : 'Registrarse'
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSwitch(id)}
            className={`flex-1 py-2.5 text-sm transition-all ${isActive ? 'tab-active' : 'tab-inactive'}`}
            style={{ fontFamily: 'Nunito, sans-serif', border: 'none', cursor: 'pointer' }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function FormField({
  label, type, value, onChange, placeholder, required, minLength,
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
    <div className="flex flex-col gap-1 w-full">
      <label className="field-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="field-input"
      />
    </div>
  )
}

function ConsentCheckbox({ checked, onChange, label }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: '#5DCEF8', marginTop: 2, width: 14, height: 14, flexShrink: 0 }}
      />
      <span className="consent-text">{label}</span>
    </label>
  )
}
