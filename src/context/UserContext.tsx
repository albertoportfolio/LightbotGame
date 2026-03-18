import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../services/service'

// Estado del contexto de usuario: el jugador actualmente seleccionado
interface UserState {
  selectedUser: User | null
  setSelectedUser: (user: User | null) => void
}

const UserContext = createContext<UserState | null>(null)

// Provider que mantiene en memoria el usuario (jugador) seleccionado por el tutor
export function UserProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </UserContext.Provider>
  )
}

// Hook para acceder al contexto de usuario (selectedUser, setSelectedUser)
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser debe usarse dentro de <UserProvider>')
  return ctx
}
