import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Tutor } from '../services/service'

// Estado del contexto de autenticación: token JWT, datos del tutor y funciones para login/logout
interface AuthState {
  token: string | null
  tutor: Tutor | null
  setAuth: (token: string, tutor: Tutor) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthState | null>(null)

// Provider que persiste token y tutor en localStorage y los expone a toda la app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token'))
  const [tutor, setTutor] = useState<Tutor | null>(
    () => {
      const saved = localStorage.getItem('tutor')
      return saved ? JSON.parse(saved) : null
    }
  )

  const setAuth = (t: string, tu: Tutor) => {
    localStorage.setItem('token', t)           // ← guardar
    localStorage.setItem('tutor', JSON.stringify(tu))
    setToken(t)
    setTutor(tu)
  }

  const clearAuth = () => {
    setToken(null)
    setTutor(null)
    localStorage.removeItem('token')           // ← borrar al logout
    localStorage.removeItem('tutor')
  }

  return (
    <AuthContext.Provider value={{ token, tutor, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para acceder al contexto de autenticación (token, tutor, setAuth, clearAuth)
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
