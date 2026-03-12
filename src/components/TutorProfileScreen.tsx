import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import {
  logout,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
} from '../services/service'

interface Props {
  onBack: () => void
  onLogout: () => void
}

type Modal = 'none' | 'create' | 'edit' | 'delete'

export function TutorProfileScreen({ onBack, onLogout }: Props) {
  const { token, tutor, clearAuth } = useAuth()
  const { selectedUser, setSelectedUser } = useUser()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<Modal>('none')
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Form fields
  const [formName, setFormName] = useState('')
  const [formLevel, setFormLevel] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Load users on mount
  useEffect(() => {
    if (token) {
      loadUsers()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadUsers = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await getUsers(token)
  //console.log('usuarios:', JSON.stringify(data)) --> para ver los usuarios que llama por consola
      const res = await getUsers(token)
      setUsers(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [])
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!token) return
    try {
      await logout(token)
    } catch {
      // Ignore logout errors
    }
    setSelectedUser(null)
    clearAuth()
    onLogout()
  }

  const openCreate = () => {
    setFormName('')
    setFormError('')
    setModal('create')
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setFormName(user.name)
    setFormLevel(String(user.currentLevel))
    setFormError('')
    setModal('edit')
  }

  const openDelete = (user: User) => {
    setEditingUser(user)
    setModal('delete')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setFormLoading(true)
    setFormError('')
    try {
      await createUser(token, { name: formName })
      setModal('none')
      await loadUsers()
    } catch (err: any) {
      setFormError(err.message || 'Error al crear usuario')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !editingUser) return
    setFormLoading(true)
    setFormError('')
    try {
      const currentLevel = parseInt(formLevel, 10)
      if (isNaN(currentLevel)) {
        setFormError('El nivel debe ser un número válido')
        setFormLoading(false)
        return
      }
      const res = await updateUser(token, editingUser.id, { name: formName, currentLevel })
      // If this user is selected, update context
      if (selectedUser?.id === editingUser.id) {
        setSelectedUser(res.data)
      }
      setModal('none')
      await loadUsers()
    } catch (err: any) {
      setFormError(err.message || 'Error al modificar usuario')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !editingUser) return
    setFormLoading(true)
    try {
      await deleteUser(token, editingUser.id)
      // If this user was selected, clear selection
      if (selectedUser?.id === editingUser.id) {
        setSelectedUser(null)
      }
      setModal('none')
      await loadUsers()
    } catch (err: any) {
      setFormError(err.message || 'Error al borrar usuario')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
  }

  return (
    <div
      className="relative flex flex-col items-center overflow-y-auto py-8"
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

      {/* Main card */}
      <div
        className="relative z-10 flex flex-col gap-5 px-6 py-8 rounded-3xl w-full"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 60px rgba(100,150,255,0.2)',
          maxWidth: 480,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-white/50 hover:text-white text-xl transition-colors leading-none"
          >
            ←
          </button>
          <h2
            className="font-black text-xl tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #63b3ed, #f6e05e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Perfil del Tutor
          </h2>
          <div style={{ width: 24 }} />
        </div>

        {/* Tutor info */}
        {tutor && (
          <div
            className="flex items-center gap-4 px-4 py-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-full font-black text-lg"
              style={{
                width: 52,
                height: 52,
                background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {tutor.initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white font-bold text-base truncate">
                {tutor.fullName || 'Sin nombre'}
              </span>
              <span className="text-white/50 text-sm truncate">{tutor.email}</span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: 'rgba(252,129,129,0.15)',
            border: '1px solid rgba(252,129,129,0.3)',
            color: '#fc8181',
          }}
        >
          Cerrar sesión
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

        {/* Users section header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Usuarios</h3>
          <button
            onClick={openCreate}
            className="px-3 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
              color: '#fff',
            }}
          >
            + Nuevo
          </button>
        </div>

        {/* Selected user indicator */}
        {selectedUser && (
          <div
            className="flex items-center justify-between px-3 py-2 rounded-xl text-sm"
            style={{
              background: 'rgba(99,179,237,0.12)',
              border: '1px solid rgba(99,179,237,0.3)',
            }}
          >
            <span className="text-white/70">
              Usuario activo: <strong className="text-white">{selectedUser.name}</strong>
            </span>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-white/40 hover:text-white text-xs transition-colors"
            >
              Deseleccionar
            </button>
          </div>
        )}

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

        {/* Users list */}
        <div className="flex flex-col gap-2" style={{ maxHeight: 320, overflowY: 'auto' }}>
          {loading ? (
            <p className="text-white/40 text-sm text-center py-4">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">
              No hay usuarios. Crea uno para empezar.
            </p>
          ) : (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isSelected={selectedUser?.id === user.id}
                onSelect={() => handleSelectUser(user)}
                onEdit={() => openEdit(user)}
                onDelete={() => openDelete(user)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Create modal */}
      {modal === 'create' && (
        <ModalOverlay onClose={() => setModal('none')}>
          <h3
            className="font-black text-lg"
            style={{
              background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Nuevo Usuario
          </h3>
          {formError && <ErrorBanner message={formError} />}
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <ModalInput
              label="Nombre"
              value={formName}
              onChange={setFormName}
              placeholder="Nombre del usuario"
              required
            />
            <ModalSubmit loading={formLoading} label="Crear" />
          </form>
        </ModalOverlay>
      )}

      {/* Edit modal */}
      {modal === 'edit' && editingUser && (
        <ModalOverlay onClose={() => setModal('none')}>
          <h3
            className="font-black text-lg"
            style={{
              background: 'linear-gradient(135deg, #f6e05e, #f6ad55)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Modificar Usuario
          </h3>
          {formError && <ErrorBanner message={formError} />}
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <ModalInput
              label="Nombre"
              value={formName}
              onChange={setFormName}
              placeholder="Nombre del usuario"
              required
            />
            <ModalInput
              label="Nivel actual"
              type="number"
              value={formLevel}
              onChange={setFormLevel}
              placeholder="Ej: 5"
            />
            <ModalSubmit loading={formLoading} label="Guardar" />
          </form>
        </ModalOverlay>
      )}

      {/* Delete confirm modal */}
      {modal === 'delete' && editingUser && (
        <ModalOverlay onClose={() => setModal('none')}>
          <h3
            className="font-black text-lg"
            style={{
              background: 'linear-gradient(135deg, #fc8181, #f56565)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Borrar Usuario
          </h3>
          {formError && <ErrorBanner message={formError} />}
          <p className="text-white/60 text-sm">
            ¿Seguro que quieres borrar a <strong className="text-white">{editingUser.name}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setModal('none')}
              className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #fc8181, #f56565)',
                color: '#fff',
              }}
            >
              {formLoading ? 'Borrando...' : 'Borrar'}
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function UserCard({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  user: User
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
      style={{
        background: isSelected
          ? 'rgba(99,179,237,0.15)'
          : 'rgba(255,255,255,0.04)',
        border: isSelected
          ? '1px solid rgba(99,179,237,0.4)'
          : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Avatar */}
      <div
        className="flex items-center justify-center rounded-full font-bold text-sm"
        style={{
          width: 36,
          height: 36,
          background: isSelected
            ? 'linear-gradient(135deg, #63b3ed, #48bb78)'
            : 'rgba(255,255,255,0.1)',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        {user.name?.charAt(0).toUpperCase() ?? '?'}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-white font-semibold text-sm truncate">{user.name}</span>
        <span className="text-white/40 text-xs">
          Nivel: {user.currentLevel}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onSelect}
          className="px-2 py-1 rounded-lg text-xs font-bold transition-all active:scale-95"
          style={{
            background: isSelected
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(99,179,237,0.2)',
            color: isSelected ? 'rgba(255,255,255,0.5)' : '#63b3ed',
            border: '1px solid transparent',
          }}
          title={isSelected ? 'Ya seleccionado' : 'Seleccionar'}
        >
          {isSelected ? 'Activo' : 'Elegir'}
        </button>
        <button
          onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all text-sm"
          title="Editar"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
          title="Borrar"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

function ModalOverlay({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative flex flex-col gap-4 px-6 py-6 rounded-2xl w-full"
        style={{
          background: 'linear-gradient(145deg, #1a2a4a, #0d1b2e)',
          border: '2px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 40px rgba(100,150,255,0.15)',
          maxWidth: 380,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white/30 hover:text-white text-lg transition-colors"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

function ModalInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
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

function ModalSubmit({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-xl font-black text-white text-sm transition-all active:scale-95 disabled:opacity-50"
      style={{
        background: 'linear-gradient(135deg, #63b3ed, #48bb78)',
        boxShadow: '0 3px 0 #1a365d',
      }}
    >
      {loading ? 'Cargando...' : label}
    </button>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="px-4 py-2 rounded-xl text-sm font-semibold"
      style={{
        background: 'rgba(252,129,129,0.15)',
        border: '1px solid rgba(252,129,129,0.3)',
        color: '#fc8181',
      }}
    >
      {message}
    </div>
  )
}
