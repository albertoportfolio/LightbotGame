import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUser } from '../context/UserContext'
import {
  logout,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  deleteAccount,
  type User,
} from '../services/service'

interface Props {
  onBack: () => void
  onLogout: () => void
}

type Modal = 'none' | 'create' | 'edit' | 'delete' | 'editProfile' | 'deleteAccount'

// Pantalla de perfil del tutor: muestra info del tutor, lista de usuarios con CRUD (crear/editar/borrar)
export function TutorProfileScreen({ onBack, onLogout }: Props) {
  const { token, tutor, setAuth, clearAuth } = useAuth()
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

  // Profile edit / delete account fields
  const [profileName, setProfileName] = useState('')
  const [confirmText, setConfirmText] = useState('')

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
    setFormLevel(String(user.currentLevel + 1)) // Mostrar el nivel actual +1 para que sea más intuitivo
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
      const res = await updateUser(token, editingUser.id, { name: formName, currentLevel: currentLevel - 1 }) // Restar 1 para guardar el nivel correcto
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

  // ── Profile edit / delete account ──

  const openEditProfile = () => {
    setProfileName(tutor?.fullName || '')
    setFormError('')
    setModal('editProfile')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setFormLoading(true)
    setFormError('')
    try {
      const res = await updateProfile(token, { fullName: profileName })
      // Update the tutor in AuthContext and localStorage
      setAuth(token, res.data)
      setModal('none')
    } catch (err: any) {
      setFormError(err.message || 'Error al actualizar el nombre')
    } finally {
      setFormLoading(false)
    }
  }

  const openDeleteAccount = () => {
    setConfirmText('')
    setFormError('')
    setModal('deleteAccount')
  }

  const shouldAllowDelete = (): boolean => {
    return confirmText === tutor?.email
  }

  const handleDeleteAccount = async () => {
    if (!token || !shouldAllowDelete()) return
    setFormLoading(true)
    setFormError('')
    try {
      await deleteAccount(token)
      setSelectedUser(null)
      clearAuth()
      onLogout()
    } catch (err: any) {
      setFormError(err.message || 'Error al eliminar la cuenta')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #1a1a5e 0%, #0d2137 50%, #0a0a2e 100%)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="relative min-h-full flex flex-col items-center py-8 px-4">
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

      <style>{`
        .tut-wrap { position: relative; width: 100%; max-width: 400px; overflow: visible; z-index: 10; }
        .tut-card {
          background: #ffffff;
          border: 5px solid #ffffff;
          border-radius: 26px;
          box-shadow: 0 12px 0 rgba(56,189,248,0.25), 0 18px 40px rgba(14,165,233,0.35);
          width: 100%; overflow: hidden; position: relative;
        }
        .tut-header {
          background: #505FFF; color: #ffffff;
          font-weight: 900; font-size: 20px; letter-spacing: 0.18em;
          text-align: center; padding: 16px 16px;
          text-shadow: 0 2px 0 rgba(0,0,0,0.25); text-transform: uppercase;
        }
        .tut-body { padding: 20px 18px 22px; display: flex; flex-direction: column; gap: 14px; }
        .tut-tutor { display: flex; align-items: center; gap: 14px; padding: 4px 4px; }
        .tut-avatar {
          width: 48px; height: 48px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 20px; color: #ffffff;
          flex-shrink: 0; box-shadow: 0 3px 0 rgba(0,0,0,0.18);
        }
        .tut-avatar--dark { background: linear-gradient(180deg, #2b2b35 0%, #18181f 100%); }
        .tut-avatar--cyan { background: linear-gradient(180deg, #5eead4 0%, #2dd4bf 100%); box-shadow: 0 3px 0 #0e7490; }
        .tut-tutor-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .tut-tutor-name-row { display: flex; align-items: center; gap: 6px; }
        .tut-tutor-name {
          color: #1f2937; font-weight: 900; font-size: 15px;
          letter-spacing: 0.06em; text-transform: uppercase;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .tut-tutor-edit {
          width: 22px; height: 22px; border: none; padding: 0; cursor: pointer;
          background: transparent; color: #6b7280; font-size: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .tut-tutor-email { color: #6b7280; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tut-section-label {
          color: #6b7280; font-weight: 900; font-size: 12px;
          letter-spacing: 0.18em; text-transform: uppercase; padding-left: 4px;
        }
        .tut-active-pill {
          background: rgba(99,179,237,0.18); color: #1f3a8a;
          border: 1px solid rgba(99,179,237,0.45);
          padding: 6px 10px; border-radius: 10px; font-size: 12px;
        }
        .tut-error {
          background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;
          padding: 8px 12px; border-radius: 10px; font-size: 13px; font-weight: 700;
        }
        .tut-users-card {
          background: #f3f5f9; border-radius: 18px; padding: 10px;
          display: flex; flex-direction: column; gap: 8px;
          box-shadow: inset 0 -2px 0 rgba(0,0,0,0.04);
        }
        .tut-empty { color: #6b7280; font-size: 13px; text-align: center; padding: 14px 0; }
        .tut-user-row {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 10px; border-radius: 14px;
          background: #ffffff; border: 2px solid transparent;
          transition: border-color 150ms;
        }
        .tut-user-row.is-active { border-color: #67e8f9; background: #ecfeff; }
        .tut-user-info { flex: 1; min-width: 0; }
        .tut-user-name { color: #1f2937; font-weight: 800; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tut-user-level { color: #6b7280; font-size: 11px; }
        .tut-pill {
          padding: 4px 9px; border-radius: 999px;
          font-weight: 800; font-size: 10px; letter-spacing: 0.04em;
          border: none; cursor: pointer; flex-shrink: 0;
          text-transform: capitalize;
        }
        .tut-pill--active { background: #e5e7eb; color: #4b5563; cursor: default; }
        .tut-pill--choose { background: #cffafe; color: #0e7490; }
        .tut-pill--choose:hover { background: #a5f3fc; }
        .tut-iconbtn-img {
          width: 34px; height: 34px;
          border: none; cursor: pointer; padding: 0;
          background: transparent; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.08s;
        }
        .tut-iconbtn-img:active { transform: translateY(1px); }
        .tut-iconbtn-img img {
          width: 100%; height: 100%; object-fit: contain;
          display: block; pointer-events: none;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.18));
        }
        .tut-add {
          background: #ffffff; border: 2px dashed #cbd5e1;
          color: #475569; padding: 12px; border-radius: 14px;
          font-weight: 800; font-size: 13px; letter-spacing: 0.06em;
          cursor: pointer; text-transform: uppercase;
          transition: background 150ms;
        }
        .tut-add:hover { background: #f1f5f9; }
        .tut-account { display: flex; gap: 10px; }
        .tut-account-btn {
          flex: 1; padding: 10px 0; border-radius: 12px;
          font-weight: 800; font-size: 12px; cursor: pointer; border: none;
          letter-spacing: 0.04em;
        }
        .tut-account-btn--logout { background: #fef3c7; color: #92400e; }
        .tut-account-btn--delete { background: #fee2e2; color: #b91c1c; }
        .tut-close {
          position: absolute; top: -18px; right: -18px;
          width: 46px; height: 46px; border-radius: 999px;
          background: linear-gradient(180deg, #d8b4fe 0%, #c4b5fd 100%);
          border: none; cursor: pointer; padding: 0; font-size: 0; color: transparent;
          box-shadow: 0 4px 0 #8b5cf6, 0 6px 14px rgba(139,92,246,0.35);
          z-index: 10;
        }
        .tut-close::before, .tut-close::after {
          content: ''; position: absolute; top: 50%; left: 50%;
          width: 22px; height: 4px; border-radius: 2px; background: #ffffff;
        }
        .tut-close::before { transform: translate(-50%, -50%) rotate(45deg); }
        .tut-close::after  { transform: translate(-50%, -50%) rotate(-45deg); }
        .tut-close:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #8b5cf6, 0 4px 10px rgba(139,92,246,0.35);
        }

        /* ── Modal: misma "tarjeta cómic" con header morado y body blanco ── */
        .tut-modal-bg {
          position: fixed; inset: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(2px);
          padding: 24px 16px;
        }
        .tut-modal-wrap { position: relative; width: 100%; max-width: 340px; overflow: visible; }
        .tut-modal-card {
          background: #ffffff;
          border: 5px solid #ffffff;
          border-radius: 26px;
          box-shadow: 0 12px 0 rgba(56,189,248,0.25), 0 18px 40px rgba(14,165,233,0.35);
          width: 100%; overflow: hidden; position: relative;
        }
        .tut-modal-header {
          background: #505FFF; color: #ffffff;
          font-weight: 900; font-size: 17px; letter-spacing: 0.16em;
          text-align: center; padding: 14px 16px;
          text-shadow: 0 2px 0 rgba(0,0,0,0.25); text-transform: uppercase;
        }
        .tut-modal-body {
          padding: 18px 18px 18px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .tut-modal-text { color: #475569; font-size: 13px; line-height: 1.45; }
        .tut-modal-text strong { color: #0f172a; }
        .tut-modal-text--danger { color: #b91c1c; font-weight: 800; }

        .tut-input-group { display: flex; flex-direction: column; gap: 6px; }
        .tut-input-label {
          color: #475569; font-weight: 800; font-size: 11px;
          letter-spacing: 0.16em; text-transform: uppercase;
        }
        .tut-input {
          width: 100%; padding: 11px 14px; border-radius: 12px;
          font-size: 14px; font-weight: 600; color: #0f172a;
          background: #f3f5f9;
          border: 2px solid #e2e8f0;
          outline: none; transition: border-color 150ms, background 150ms;
        }
        .tut-input::placeholder { color: #94a3b8; font-weight: 500; }
        .tut-input:focus { border-color: #505FFF; background: #ffffff; }

        .tut-submit {
          width: 100%; padding: 13px 0; border-radius: 14px;
          font-weight: 900; font-size: 14px; letter-spacing: 0.14em;
          color: #ffffff; text-shadow: 0 2px 0 rgba(0,0,0,0.22);
          border: none; cursor: pointer; text-transform: uppercase;
          background: linear-gradient(180deg, #8ee36f 0%, #5fbf3f 100%);
          box-shadow: 0 4px 0 #2f7a1c, 0 6px 14px rgba(95,191,63,0.35);
          transition: transform 0.08s;
        }
        .tut-submit:active { transform: translateY(2px); box-shadow: 0 2px 0 #2f7a1c; }
        .tut-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        .tut-btn-row { display: flex; gap: 10px; }
        .tut-btn {
          flex: 1; padding: 12px 0; border-radius: 14px;
          font-weight: 900; font-size: 13px; letter-spacing: 0.1em;
          border: none; cursor: pointer; text-transform: uppercase;
          transition: transform 0.08s;
        }
        .tut-btn:active { transform: translateY(2px); }
        .tut-btn--cancel {
          background: #e5e7eb; color: #475569;
          box-shadow: 0 4px 0 #94a3b8;
        }
        .tut-btn--danger {
          background: linear-gradient(180deg, #fca5a5 0%, #ef4444 100%);
          color: #ffffff; text-shadow: 0 2px 0 rgba(0,0,0,0.22);
          box-shadow: 0 4px 0 #b91c1c, 0 6px 14px rgba(239,68,68,0.35);
        }
        .tut-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tut-error-banner {
          background: #fee2e2; color: #b91c1c;
          border: 1px solid #fecaca;
          padding: 10px 12px; border-radius: 12px;
          font-size: 13px; font-weight: 700;
        }
      `}</style>

      <div className="tut-wrap">
        <button className="tut-close" onClick={onBack} aria-label="Cerrar perfil" />
        <div className="tut-card">
          <div className="tut-header">PERFIL DEL TUTOR</div>
          <div className="tut-body">
            {tutor && (
              <div className="tut-tutor">
                <div className="tut-avatar tut-avatar--dark">
                  {(tutor.initials || tutor.fullName?.charAt(0) || 'P').toUpperCase()}
                </div>
                <div className="tut-tutor-info">
                  <div className="tut-tutor-name-row">
                    <span className="tut-tutor-name">{tutor.fullName || 'Profesor'}</span>
                    <button className="tut-tutor-edit" onClick={openEditProfile} title="Editar nombre">✏️</button>
                  </div>
                  <span className="tut-tutor-email">{tutor.email}</span>
                </div>
              </div>
            )}

            <div className="tut-section-label">Usuarios</div>

            {error && <div className="tut-error">{error}</div>}

            <div className="tut-users-card">
              {selectedUser && (
                <div className="tut-active-pill">
                  Usuario activo: <strong>{selectedUser.name}</strong>
                </div>
              )}

              {loading ? (
                <p className="tut-empty">Cargando usuarios...</p>
              ) : users.length === 0 ? (
                <p className="tut-empty">No hay usuarios. Crea uno para empezar.</p>
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

              <button className="tut-add" onClick={openCreate}>+ Añadir usuario</button>
            </div>

            <div className="tut-account">
              <button className="tut-account-btn tut-account-btn--logout" onClick={handleLogout}>
                Cerrar sesión
              </button>
              <button className="tut-account-btn tut-account-btn--delete" onClick={openDeleteAccount}>
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Create modal */}
      {modal === 'create' && (
        <ModalOverlay title="Nuevo Usuario" onClose={() => setModal('none')}>
          {formError && <ErrorBanner message={formError} />}
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
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
        <ModalOverlay title="Modificar Usuario" onClose={() => setModal('none')}>
          {formError && <ErrorBanner message={formError} />}
          <form onSubmit={handleUpdate} className="flex flex-col gap-3">
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

      {/* Edit profile name modal */}
      {modal === 'editProfile' && (
        <ModalOverlay title="Modificar Nombre" onClose={() => setModal('none')}>
          {formError && <ErrorBanner message={formError} />}
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-3">
            <ModalInput
              label="Nombre completo"
              value={profileName}
              onChange={setProfileName}
              placeholder="Tu nombre"
              required
            />
            <ModalSubmit loading={formLoading} label="Guardar" />
          </form>
        </ModalOverlay>
      )}

      {/* Delete account confirm modal */}
      {modal === 'deleteAccount' && (
        <ModalOverlay title="Eliminar Cuenta" onClose={() => setModal('none')}>
          {formError && <ErrorBanner message={formError} />}
          <p className="tut-modal-text">
            Esta acción eliminará permanentemente tu cuenta, todos tus usuarios y su progreso.
            <strong> No se puede deshacer.</strong>
          </p>
          <p className="tut-modal-text">
            Escribe <strong className="tut-modal-text--danger">{tutor?.email}</strong> para confirmar:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={tutor?.email || ''}
            className="tut-input"
          />
          <div className="tut-btn-row">
            <button onClick={() => setModal('none')} className="tut-btn tut-btn--cancel">
              Cancelar
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={formLoading || !shouldAllowDelete()}
              className="tut-btn tut-btn--danger"
            >
              {formLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Delete user confirm modal */}
      {modal === 'delete' && editingUser && (
        <ModalOverlay title="Borrar Usuario" onClose={() => setModal('none')}>
          {formError && <ErrorBanner message={formError} />}
          <p className="tut-modal-text">
            ¿Seguro que quieres borrar a <strong>{editingUser.name}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div className="tut-btn-row">
            <button onClick={() => setModal('none')} className="tut-btn tut-btn--cancel">
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={formLoading}
              className="tut-btn tut-btn--danger"
            >
              {formLoading ? 'Borrando...' : 'Borrar'}
            </button>
          </div>
        </ModalOverlay>
      )}
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

// Tarjeta de usuario con avatar cyan, nombre, nivel, badge de estado y botones de editar/borrar
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
    <div className={`tut-user-row ${isSelected ? 'is-active' : ''}`}>
      <div className="tut-avatar tut-avatar--cyan" style={{ width: 40, height: 40, fontSize: 16 }}>
        {user.name?.charAt(0).toUpperCase() ?? '?'}
      </div>
      <div className="tut-user-info">
        <div className="tut-user-name">{user.name}</div>
        <div className="tut-user-level">Nivel: {user.currentLevel + 1}</div>
      </div>
      <button
        onClick={onSelect}
        disabled={isSelected}
        className={`tut-pill ${isSelected ? 'tut-pill--active' : 'tut-pill--choose'}`}
        title={isSelected ? 'Ya seleccionado' : 'Seleccionar'}
      >
        {isSelected ? 'Activo' : 'Elegir'}
      </button>
      <button onClick={onEdit} className="tut-iconbtn-img" title="Editar" aria-label="Editar usuario">
        <img src="/assets/buttons/icon/Propiedad%201=settings_btn.png" alt="" />
      </button>
      <button onClick={onDelete} className="tut-iconbtn-img" title="Borrar" aria-label="Borrar usuario">
        <img src="/assets/buttons/icon/Propiedad%201=close_btn.png" alt="" />
      </button>
    </div>
  )
}

// Overlay modal con la "tarjeta cómic": header morado con título + body blanco + X morada arriba-derecha.
// `title` se renderiza como header; los hijos van dentro del body.
function ModalOverlay({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="tut-modal-bg">
      <div className="tut-modal-wrap">
        <button className="tut-close" onClick={onClose} aria-label="Cerrar" />
        <div className="tut-modal-card">
          <div className="tut-modal-header">{title}</div>
          <div className="tut-modal-body">{children}</div>
        </div>
      </div>
    </div>
  )
}

// Input reutilizable para modales con label uppercase y estilo claro
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
    <div className="tut-input-group">
      <label className="tut-input-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="tut-input"
      />
    </div>
  )
}

// Botón de submit verde 3D con estado de carga
function ModalSubmit({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="tut-submit">
      {loading ? 'Cargando...' : label}
    </button>
  )
}

// Banner rojo reutilizable para mostrar mensajes de error en modales
function ErrorBanner({ message }: { message: string }) {
  return <div className="tut-error-banner">{message}</div>
}
