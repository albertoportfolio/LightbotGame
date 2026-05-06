import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import { getUsers, createUser, type User } from '../services/service'

interface Props {
  onContinue: () => void
  onBack: () => void
}

// Pantalla de selección de jugador con el mismo chassis "comic-card" que TutorProfileScreen.
// Si hay exactamente 1 usuario, auto-selecciona y continúa sin renderizar UI.
// Estados visibles:
//  - 0 usuarios → formulario de creación inline
//  - 2+ usuarios → lista con el indicador verde en el jugador actual + "+ AÑADIR USUARIO"
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
      className="relative flex flex-col items-center overflow-y-auto py-8 px-4"
      style={{
        minHeight: '100dvh',
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

      <style>{`
        .usr-wrap { position: relative; width: 100%; max-width: 370px; overflow: visible; z-index: 10; margin: auto 0; }
        .usr-card {
          background: #ffffff;
          border: 5px solid #ffffff;
          border-radius: 26px;
          box-shadow: 0 12px 0 rgba(56,189,248,0.25), 0 18px 40px rgba(14,165,233,0.35);
          width: 100%; overflow: hidden; position: relative;
        }
        .usr-header {
          background: #505FFF; color: #ffffff;
          font-weight: 900; font-size: 18px; letter-spacing: 0.16em;
          text-align: center; padding: 14px 16px;
          text-shadow: 0 2px 0 rgba(0,0,0,0.25); text-transform: uppercase;
        }
        .usr-body { padding: 18px 18px 18px; display: flex; flex-direction: column; gap: 12px; }
        .usr-greeting { color: #475569; font-size: 13px; }
        .usr-greeting strong { color: #0f172a; font-weight: 800; }
        .usr-label { color: #64748b; font-size: 13px; }

        .usr-list-card {
          background: #f3f5f9; border-radius: 18px; padding: 10px;
          display: flex; flex-direction: column; gap: 8px;
          box-shadow: inset 0 -2px 0 rgba(0,0,0,0.04);
          max-height: 60vh; overflow-y: auto;
        }

        .usr-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 14px;
          background: #ffffff; border: 2px solid transparent;
          cursor: pointer; text-align: left;
          width: 100%; font: inherit;
          transition: border-color 150ms, transform 0.08s;
        }
        .usr-row:hover { border-color: #cffafe; }
        .usr-row:active { transform: translateY(1px); }

        .usr-avatar {
          width: 44px; height: 44px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 18px; color: #ffffff;
          flex-shrink: 0;
          background: linear-gradient(180deg, #5eead4 0%, #2dd4bf 100%);
          box-shadow: 0 3px 0 #0e7490;
        }
        .usr-info { flex: 1; min-width: 0; }
        .usr-name {
          color: #1f2937; font-weight: 800; font-size: 14px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .usr-level { color: #6b7280; font-size: 12px; }

        /* Círculo verde con triángulo blanco "play" — visible sólo al hacer hover
           sobre el row. Reservamos su espacio siempre con opacity (no display)
           para que el layout no salte al entrar/salir el cursor. */
        .usr-arrow {
          width: 32px; height: 32px; border-radius: 999px;
          background: linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%);
          box-shadow: 0 2px 0 #2f7a1c, 0 3px 8px rgba(95,191,63,0.35);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; position: relative;
          opacity: 0;
          transition: opacity 150ms ease;
        }
        .usr-arrow::after {
          content: ''; display: block;
          width: 0; height: 0;
          border-left: 9px solid #ffffff;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          margin-left: 2px;
        }
        .usr-row:hover .usr-arrow { opacity: 1; }

        .usr-add {
          background: #ffffff; border: 2px dashed #cbd5e1;
          color: #475569; padding: 12px; border-radius: 14px;
          font-weight: 800; font-size: 13px; letter-spacing: 0.06em;
          cursor: pointer; text-transform: uppercase;
          transition: background 150ms;
        }
        .usr-add:hover { background: #f1f5f9; }

        /* Form de creación: input claro + botón verde 3D */
        .usr-form { display: flex; flex-direction: column; gap: 10px; padding: 4px 2px 2px; }
        .usr-input-label {
          color: #475569; font-weight: 800; font-size: 11px;
          letter-spacing: 0.16em; text-transform: uppercase;
        }
        .usr-input {
          width: 100%; padding: 11px 14px; border-radius: 12px;
          font-size: 14px; font-weight: 600; color: #0f172a;
          background: #ffffff; border: 2px solid #e2e8f0;
          outline: none; transition: border-color 150ms;
        }
        .usr-input::placeholder { color: #94a3b8; font-weight: 500; }
        .usr-input:focus { border-color: #505FFF; }

        .usr-submit {
          width: 100%; padding: 13px 0; border-radius: 14px;
          font-weight: 900; font-size: 14px; letter-spacing: 0.14em;
          color: #ffffff; text-shadow: 0 2px 0 rgba(0,0,0,0.22);
          border: none; cursor: pointer; text-transform: uppercase;
          background: linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%);
          box-shadow: 0 4px 0 #2f7a1c, 0 6px 14px rgba(95,191,63,0.35);
          transition: transform 0.08s;
        }
        .usr-submit:active { transform: translateY(2px); box-shadow: 0 2px 0 #2f7a1c; }
        .usr-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .usr-error {
          background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;
          padding: 10px 12px; border-radius: 12px;
          font-size: 13px; font-weight: 700;
        }

        .usr-empty {
          color: #6b7280; font-size: 13px; text-align: center;
          padding: 8px 4px;
        }

        /* X morada — idéntica a la de TutorProfileScreen */
        .usr-close {
          position: absolute; top: -18px; right: -18px;
          width: 46px; height: 46px; border-radius: 999px;
          background: linear-gradient(180deg, #d8b4fe 0%, #c4b5fd 100%);
          border: none; cursor: pointer; padding: 0; font-size: 0; color: transparent;
          box-shadow: 0 4px 0 #8b5cf6, 0 6px 14px rgba(139,92,246,0.35);
          z-index: 10;
        }
        .usr-close::before, .usr-close::after {
          content: ''; position: absolute; top: 50%; left: 50%;
          width: 22px; height: 4px; border-radius: 2px; background: #ffffff;
        }
        .usr-close::before { transform: translate(-50%, -50%) rotate(45deg); }
        .usr-close::after  { transform: translate(-50%, -50%) rotate(-45deg); }
        .usr-close:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #8b5cf6, 0 4px 10px rgba(139,92,246,0.35);
        }
      `}</style>

      <div className="usr-wrap">
        <button className="usr-close" onClick={onBack} aria-label="Volver" />
        <div className="usr-card">
          <div className="usr-header">Seleccionar Jugador</div>

          <div className="usr-body">
            {tutor && (
              <p className="usr-greeting">
                Hola, <strong>{tutor.fullName || tutor.email || 'Usuario'}</strong>
              </p>
            )}

            {error && <div className="usr-error">{error}</div>}

            {users.length === 0 ? (
              // ── Empty: el tutor no tiene jugadores → crear el primero ──
              <>
                <p className="usr-empty">
                  No tienes ningún jugador todavía. Crea uno para empezar.
                </p>
                <CreateForm
                  name={newName}
                  onNameChange={setNewName}
                  onSubmit={handleCreate}
                  loading={creating}
                  error={createError}
                />
              </>
            ) : (
              // ── 2+ jugadores: lista + indicador verde + añadir/crear ──
              <>
                <p className="usr-label">Selecciona un jugador:</p>
                <div className="usr-list-card">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelect(user)}
                      className="usr-row"
                    >
                      <div className="usr-avatar">
                        {user.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div className="usr-info">
                        <div className="usr-name">{user.name}</div>
                        <div className="usr-level">Nivel: {user.currentLevel + 1}</div>
                      </div>
                      <span className="usr-arrow" aria-hidden="true" />
                    </button>
                  ))}

                  {!showCreate ? (
                    <button
                      className="usr-add"
                      onClick={() => { setShowCreate(true); setNewName(''); setCreateError('') }}
                    >
                      + Añadir usuario
                    </button>
                  ) : (
                    <CreateForm
                      name={newName}
                      onNameChange={setNewName}
                      onSubmit={handleCreate}
                      loading={creating}
                      error={createError}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
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
    <form onSubmit={onSubmit} className="usr-form">
      {error && <div className="usr-error">{error}</div>}
      <label className="usr-input-label">Nombre del jugador</label>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Ej: María, Pablo..."
        required
        className="usr-input"
      />
      <button type="submit" disabled={loading} className="usr-submit">
        {loading ? 'Creando...' : 'Crear y Jugar'}
      </button>
    </form>
  )
}
