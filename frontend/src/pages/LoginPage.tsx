import { type FormEvent, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { usePageMeta } from '../hooks/usePageMeta'

type LocationState = {
  from?: string
}

export function LoginPage() {
  usePageMeta('Student Login', 'Sign in to access your student profile and personal learning details.')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = useMemo(() => {
    const state = location.state as LocationState | null
    const nextPath = state?.from && state.from !== '/login' ? state.from : '/student/profile'
    return nextPath
  }, [location.state])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const username = String(formData.get('username') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!username || !password) {
      setError('Username and password are required.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await login(username, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Unable to sign in right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/student/profile" replace />
  }

  return (
    <div className="page">
      <section className="section">
        <div className="container narrow">
          <p className="hero-pill">Student Access</p>
          <h1>Login to your profile</h1>
          <p>Use your student credentials to view and update your personal profile.</p>

          <form className="inquiry-form auth-form" onSubmit={(event) => void handleSubmit(event)}>
            <label>
              Username
              <input name="username" autoComplete="username" required placeholder="Enter username" />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Enter password"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
            {error ? <p className="status-text">{error}</p> : null}
            <p className="note">Demo account: student_demo / Student@123</p>
          </form>
        </div>
      </section>
    </div>
  )
}
