import { AdminSession } from "../types/auth"

const ADMIN_KEY = "admin_session"

export function saveAdminSession(session: AdminSession) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(session))
}

export function getAdminSession(): AdminSession | null {
  const raw = localStorage.getItem(ADMIN_KEY)
  return raw ? JSON.parse(raw) : null
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminSession()
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY)
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_KEY)
}