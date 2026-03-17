import { Navigate, Outlet, useLocation } from "react-router-dom"
import { isAdminAuthenticated } from "../lib/adminAuth"

export function RequireAdmin() {
  const location = useLocation()
  const isAuth = isAdminAuthenticated()

  if (!isAuth) {
    return (
      <Navigate
        to="/admin-login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}