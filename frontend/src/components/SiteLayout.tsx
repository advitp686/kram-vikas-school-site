import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { getSiteConfig } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { defaultSiteConfig, type SiteConfig } from '../api/types'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/method', label: 'Method' },
  { to: '/classes', label: 'Classes' },
  { to: '/worksheets', label: 'Worksheets' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/parent-corner', label: 'Parent Corner' },
  { to: '/admissions', label: 'Admissions' },
]

export function SiteLayout() {
  const year = new Date().getFullYear()
  const [institution, setInstitution] = useState<SiteConfig>(defaultSiteConfig)
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const data = await getSiteConfig()
        if (isMounted && Object.keys(data).length > 0) {
          setInstitution(data)
        }
      } catch {
        // Keeps fallback content when API is unavailable.
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // UI still clears local session on logout flow.
    }
  }

  const hasLogo = institution.logo_url.trim().length > 0

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            {hasLogo ? (
              <img className="brand-logo" src={institution.logo_url} alt={`${institution.name} logo`} />
            ) : (
              <span className="brand-mark" aria-hidden="true">
                KV
              </span>
            )}
          </div>
          <nav className="nav-scroll" aria-label="Primary">
            <div className="nav-links">
              {navItems.map((item) => (
                <NavLink
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <NavLink
                  to="/student/profile"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  My Profile
                </NavLink>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Login
                </NavLink>
              )}
              {isAuthenticated ? (
                <button type="button" className="nav-link nav-link-button" onClick={() => void handleLogout()}>
                  Logout
                </button>
              ) : null}
            </div>
          </nav>
        </div>
      </header>

      <main className="page-main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <p className="footer-eyebrow">Academic Progress, Thoughtfully Structured</p>
            <h3>{institution.name}</h3>
            <p>{institution.mission}</p>
          </div>
          <div>
            <h3>Contact</h3>
            <p>{institution.phone}</p>
            <p>{institution.email}</p>
            <p>{institution.address}</p>
          </div>
          <div>
            <h3>Hours</h3>
            <p>{institution.timings}</p>
            <p>
              <NavLink to="/privacy">Privacy</NavLink> | <NavLink to="/terms">Terms</NavLink>
            </p>
          </div>
        </div>
        <p className="container footer-note">Copyright {year} {institution.name}. All rights reserved.</p>
      </footer>
    </div>
  )
}
