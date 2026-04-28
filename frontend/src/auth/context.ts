import { createContext } from 'react'
import type { StudentSummary } from '../api/types'

export type AuthSession = {
  token: string
  student: StudentSummary
}

export type AuthContextValue = {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
