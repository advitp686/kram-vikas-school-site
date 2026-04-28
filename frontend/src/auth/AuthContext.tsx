import { useState, type ReactNode } from 'react'
import { ApiError, loginStudent, logoutStudent } from '../api/client'
import { AuthContext, type AuthSession } from './context'

const SESSION_STORAGE_KEY = 'kv_student_session'

function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (
      typeof parsed?.token === 'string' &&
      typeof parsed?.student?.username === 'string' &&
      typeof parsed?.student?.student_code === 'string'
    ) {
      return parsed
    }
  } catch {
    // Falls through to clear invalid persisted state.
  }

  localStorage.removeItem(SESSION_STORAGE_KEY)
  return null
}

function persistSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())

  const login = async (username: string, password: string) => {
    const response = await loginStudent({ username, password })
    const nextSession: AuthSession = {
      token: response.token,
      student: response.student,
    }
    setSession(nextSession)
    persistSession(nextSession)
  }

  const logout = async () => {
    const authToken = session?.token
    if (authToken) {
      try {
        await logoutStudent(authToken)
      } catch (error) {
        if (!(error instanceof ApiError)) {
          throw error
        }
      }
    }
    setSession(null)
    persistSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: session !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
