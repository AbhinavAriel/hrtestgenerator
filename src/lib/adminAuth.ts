import { AdminSession } from "../types/auth"

const ADMIN_KEY = "admin_session"

export function saveAdminSession(session: AdminSession) {
  if (!session?.token || !session?.user?.id) {
    console.error("Invalid admin session:", session)
    return
  }

  localStorage.setItem(ADMIN_KEY, JSON.stringify(session))
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== "object") return null

    return parsed as AdminSession
  } catch (err) {
    console.error("Error parsing admin session:", err)
    return null
  }
}


export function isAdminAuthenticated(): boolean {
  const session = getAdminSession()

  if (!session) return false

  if (!session.token || !session.user?.id) {
    return false
  }

  // expiry check (backend gives UTC string)
  if (session.expiresAtUtc) {
    const expiry = new Date(session.expiresAtUtc).getTime()

    if (Date.now() > expiry) {
      clearAdminSession()
      return false
    }
  }

  return true
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY)
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_KEY)
}