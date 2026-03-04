export type LoginRequest = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  email: string
  name: string
  role: "USER" | "ADMIN"
}

export type LoginResponse = {
  user: AuthUser
  token: string
}

export const DEMO_CREDENTIALS: LoginRequest = {
  email: "user@demo.com",
  password: "User123!",
}