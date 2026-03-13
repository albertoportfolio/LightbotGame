const isAndroidEmulator = window.location.hostname === '10.0.2.2'

export const API_URL = isAndroidEmulator
  ? 'http://10.0.2.2:3333/api/v1'
  : 'https://lightbot.duckdns.org/api/v1'
// ─── Types ───────────────────────────────────────────────────────────────────

export interface Tutor {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string | null
}

export interface User {
  id: number
  name: string
  currentLevel: number
  tutorId: number | null
  createdAt: string
  updatedAt: string | null
}

interface AuthResponse {
  data: { tutor: Tutor; token: string }
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

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? res.statusText)
  }
  return res.json()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signup(
  fullName: string | null,
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password, passwordConfirmation }),
  })
  return handleResponse<AuthResponse>(res)
}

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

export async function logout(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? res.statusText)
  }
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile(token: string): Promise<ProfileResponse> {
  const res = await fetch(`${API_URL}/account/profile`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  return handleResponse<ProfileResponse>(res)
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUsers(token: string): Promise<UsersListResponse> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  return handleResponse<UsersListResponse>(res)
}

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

export async function deleteUser(
  token: string,
  id: number
): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? res.statusText)
  }
}
