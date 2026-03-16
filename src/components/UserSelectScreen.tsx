import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { getUsers, createUser, type User } from '../services/service'

interface Props {
  onContinue: () => void
  onBack: () => void
}

export function UserSelectScreen({ onContinue, onBack }: Props) {
  const { token, tutor } = useAuth()
  const { setSelectedUser } = useUser()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    if (token) loadUsers()
    else setLoading(false)
  }, [token])

  const loadUsers = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await getUsers(token)
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
      setUsers(list)

      // Si hay exactamente 1 usuario, seleccionar y continuar
      if (list.length === 1) {
        setSelectedUser(list[0])
        onContinue()
        return
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (user: User) => {
    setSelectedUser(user)
    onContinue()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newName.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      const res = await createUser(token, { name: newName.trim() })
      const created = res.data ?? res
      setSelectedUser(created as User)
      onContinue()
    } catch (err: any) {
      setCreateError(err.message || 'Error al crear usuario')
    } finally {
      setCreating(false)
    }
  }

  // Mientras carga, mostrar pantalla de carga
  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          height: '100dvh',
          background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)',
        }}
      >
        <p className="text-white/60 text-lg font-semibold">Cargando...</p>
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto py-8"
      style={{
        height: '100dvh',
        background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)',
      }}
    >
      {/* Estrellas de fondo */}
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
            {users.length === 0 ? 'Crear Jugador' : 'Elegir Jugador'}
          </h2>
        </div>

        {/* Saludo al tutor */}
        {tutor && (
          <p className="text-white/50 text-sm">
            Hola, <strong className="text-white/70">{tutor.fullName || tutor.email}</strong>
          </p>
        )}

        {/* Error global */}
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

        {/* Sin usuarios → formulario de creación directo */}
        {users.length === 0 && !loading && (
          <>
            <p className="text-white/40 text-sm text-center">
              No tienes ningún jugador. Crea uno para empezar a jugar.
            </p>
            <CreateForm
              name={newName}
              onNameChange={setNewName}
              onSubmit={handleCreate}
              loading={creating}
              error={createError}
            />
          </>
        )}

        {/* Varios usuarios → lista para elegir */}
        {users.length > 1 && (
          <>
            <p className="text-white/40 text-sm">
              Selecciona con quién quieres jugar:
            </p>
            <div className="flex flex-col gap-2" style={{ maxHeight: 280, overflowY: 'auto', overflowX: 'hidden' }}>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full font-bold text-sm"
                    style={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-white font-semibold text-sm truncate">
                      {user.name}
                    </span>
                    <span className="text-white/40 text-xs">
                      Nivel: {user.currentLevel + 1}
                    </span>
                  </div>
                  <span className="text-white/30 text-lg">›</span>
                </button>
              ))}
            </div>

            {/* Separador + crear nuevo */}
            {!showCreate ? (
              <button
                onClick={() => { setShowCreate(true); setNewName(''); setCreateError('') }}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{
                  background: 'rgba(99,179,237,0.1)',
                  border: '1px solid rgba(99,179,237,0.25)',
                  color: '#63b3ed',
                }}
              >
                + Crear nuevo jugador
              </button>
            ) : (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <CreateForm
                  name={newName}
                  onNameChange={setNewName}
                  onSubmit={handleCreate}
                  loading={creating}
                  error={createError}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Formulario de creación reutilizable ─────────────────────────────────────

function CreateForm({
  name,
  onNameChange,
  onSubmit,
  loading,
  error,
}: {
  name: string
  onNameChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  error: string
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{
            background: 'rgba(252,129,129,0.15)',
            border: '1px solid rgba(252,129,129,0.3)',
            color: '#fc8181',
          }}
        >
          {error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-white/50 text-xs uppercase tracking-widest font-semibold">
          Nombre del jugador
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej: María, Pablo..."
          required
          className="w-full px-4 py-3 rounded-xl text-white text-sm font-medium outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(99,179,237,0.5)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-2xl font-black text-white text-lg transition-all active:scale-95 disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
          boxShadow: '0 4px 0 #1a365d',
        }}
      >
        {loading ? 'Creando...' : 'Crear y Jugar'}
      </button>
    </form>
  )
}
