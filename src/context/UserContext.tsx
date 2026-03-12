import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../services/service'

interface UserState {
  selectedUser: User | null
  setSelectedUser: (user: User | null) => void
}

const UserContext = createContext<UserState | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser debe usarse dentro de <UserProvider>')
  return ctx
}
