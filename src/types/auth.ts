export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminSession {
  token: string
  adminId: string
}