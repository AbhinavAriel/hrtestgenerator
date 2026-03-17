export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminSession {
  token: string

  user: {
    id: string
    fullName: string
    email: string
    roles: string[]
  }

  expiresAtUtc?: string
}