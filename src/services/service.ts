// Detecta si se ejecuta en emulador Android para usar IP especial en vez de localhost
const API_HOST = window.location.hostname
      
      
     // export const API_URL = 'https://lightbot.duckdns.org/api/v1'
       export const API_URL = `http://${API_HOST}:3333/api/v1`
// ─── Types ───────────────────────────────────────────────────────────────────

// Datos del tutor (profesor/padre) que gestiona usuarios
export interface Tutor {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string | null
}

// Datos de un jugador (hijo/alumno) asociado a un tutor
export interface User {
  id: number
  name: string
  currentLevel: number
  tutorId: number | null
  createdAt: string 
  updatedAt: string | null
}

// Respuesta del endpoint de login: contiene el token JWT y los datos del tutor
interface AuthResponse {
  data: { tutor: Tutor; token: string }
}

interface MessageResponse {
  message: string
}

interface ProfileResponse {
  data: Tutor
}

interface UserResponse {
  data: User
}

interface UsersListResponse {
  data: User[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Callback global que se invoca cuando el servidor responde 401 (token inválido/caducado/ausente)
let onUnauthorizedCallback: (() => void) | null = null

// Registra el callback que se ejecutará ante un 401. Se llama desde App.tsx al montar.
export function setOnUnauthorized(cb: () => void) {
  onUnauthorizedCallback = cb
}

// Genera los headers con Content-Type y Authorization Bearer para peticiones autenticadas
function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Procesa la respuesta HTTP: lanza Error con mensaje legible si no es ok (incluyendo errores de VineJS)
// Si el servidor responde 401, invoca el callback de sesión expirada antes de lanzar el error
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      onUnauthorizedCallback?.()
    }
    const body = await res.json().catch(() => ({ message: res.statusText }))
    // VineJS validation errors come as { errors: [{ message, field }] }
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      throw new Error(body.errors.map((e: { message: string }) => e.message).join('. '))
    }
    throw new Error(body.message ?? res.statusText)
  }
  return res.json()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

// Registra un nuevo tutor enviando nombre, email y contraseña. Devuelve mensaje de verificación
export async function signup(
  fullName: string | null,
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<MessageResponse> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password, passwordConfirmation }),
  })
  return handleResponse<MessageResponse>(res)
}

// Reenvía el correo de verificación al email indicado
export async function resendVerification(email: string): Promise<MessageResponse> {
  const res = await fetch(`${API_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return handleResponse<MessageResponse>(res)
}

// Inicia sesión con email y contraseña. Devuelve token JWT y datos del tutor
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<AuthResponse>(res)
}

// Cierra la sesión del tutor invalidando el token en el servidor
// Si el token ya expiró (401), invoca el callback de sesión expirada y no lanza error
export async function logout(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    if (res.status === 401) {
      onUnauthorizedCallback?.()
      return
    }
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? res.statusText)
  }
}

// ─── Push Notifications ──────────────────────────────────────────────────────

// Registra el token FCM de notificaciones push para la sesión actual del tutor
export async function registerPushToken(
  token: string,
  fcmToken: string
): Promise<void> {
  const res = await fetch(`${API_URL}/notifications/register`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ fcmToken }),
  })
  await handleResponse<{ message: string }>(res)
}

// ─── Profile ─────────────────────────────────────────────────────────────────

// Obtiene el perfil del tutor autenticado
export async function getProfile(token: string): Promise<ProfileResponse> {
  const res = await fetch(`${API_URL}/account/profile`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  return handleResponse<ProfileResponse>(res)
}

// Actualiza el nombre del tutor autenticado
export async function updateProfile(
  token: string,
  data: { fullName: string }
): Promise<ProfileResponse> {
  const res = await fetch(`${API_URL}/account/profile`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<ProfileResponse>(res)
}

// Elimina permanentemente la cuenta del tutor y todos sus datos asociados
export async function deleteAccount(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/account/profile`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    if (res.status === 401) {
      onUnauthorizedCallback?.()
      return
    }
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? res.statusText)
  }
}

// ─── Users ───────────────────────────────────────────────────────────────────

// Lista todos los usuarios (jugadores) asociados al tutor autenticado
export async function getUsers(token: string): Promise<UsersListResponse> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  return handleResponse<UsersListResponse>(res)
}

// Obtiene los datos de un usuario específico por su ID
export async function getUser(
  token: string,
  id: number
): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  return handleResponse<UserResponse>(res)
}

// Crea un nuevo usuario (jugador) con el nombre indicado, asociado al tutor autenticado
export async function createUser(
  token: string,
  data: { name: string }
): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<UserResponse>(res)
}

// Actualiza nombre y/o nivel actual de un usuario existente
export async function updateUser(
  token: string,
  id: number,
  data: { name?: string; currentLevel: number }
): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<UserResponse>(res)
}

// Elimina un usuario permanentemente por su ID
export async function deleteUser(
  token: string,
  id: number
): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    if (res.status === 401) {
      onUnauthorizedCallback?.()
      return
    }
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? res.statusText)
  }
}
