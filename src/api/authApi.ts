import { request } from "./http"
import { AdminLoginRequest, AdminSession } from "../types/auth"

export async function loginAdmin(
  payload: AdminLoginRequest
): Promise<AdminSession> {

  const session = await request<AdminSession>("api/Auth/login", {
    method: "POST",
    data: payload
  })

  // store token
  localStorage.setItem("token", session.token)

  return session
}