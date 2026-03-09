const ADMIN_STORAGE_KEY = "assessment_admin_session";

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAdminToken() {
  return getAdminSession()?.token || "";
}

export function isAdminAuthenticated() {
  const session = getAdminSession();
  return Boolean(session?.token);
}

export function saveAdminSession(session) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}