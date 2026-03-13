import { request } from "./http"
import { AdminLoginRequest, AdminSession } from "../types/auth"

export async function loginAdmin(
  payload: AdminLoginRequest
): Promise<AdminSession> {

  return request<AdminSession>("/api/Auth/login", {
    method: "POST",
    data: payload
  })
}