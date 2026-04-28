import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { ApiError, getStudentProfile, updateStudentProfile } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { usePageMeta } from '../hooks/usePageMeta'

type ProfileFormState = {
  full_name: string
  class_level: string
  section: string
  date_of_birth: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  address: string
  interests: string
  goals: string
  joined_on: string
}

const initialFormState: ProfileFormState = {
  full_name: '',
  class_level: '',
  section: '',
  date_of_birth: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_email: '',
  address: '',
  interests: '',
  goals: '',
  joined_on: '',
}

function toFormState(profile: {
  full_name: string
  class_level: string
  section: string
  date_of_birth: string | null
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  address: string
  interests: string[]
  goals: string
  joined_on: string | null
}): ProfileFormState {
  return {
    full_name: profile.full_name ?? '',
    class_level: profile.class_level ?? '',
    section: profile.section ?? '',
    date_of_birth: profile.date_of_birth ?? '',
    guardian_name: profile.guardian_name ?? '',
    guardian_phone: profile.guardian_phone ?? '',
    guardian_email: profile.guardian_email ?? '',
    address: profile.address ?? '',
    interests: profile.interests.join(', '),
    goals: profile.goals ?? '',
    joined_on: profile.joined_on ?? '',
  }
}

export function StudentProfilePage() {
  usePageMeta('Student Profile', 'Manage student personal profile details and guardian information.')
  const { session } = useAuth()
  const [formState, setFormState] = useState<ProfileFormState>(initialFormState)
  const [studentCode, setStudentCode] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      return
    }

    let isMounted = true

    const loadProfile = async () => {
      setIsLoading(true)
      setError('')
      try {
        const profile = await getStudentProfile(session.token)
        if (!isMounted) {
          return
        }
        setStudentCode(profile.student_code)
        setUsername(profile.username)
        setEmail(profile.email)
        setUpdatedAt(profile.updated_at)
        setFormState(toFormState(profile))
      } catch {
        if (isMounted) {
          setError('Unable to load student profile. Please login again.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()
    return () => {
      isMounted = false
    }
  }, [session])

  if (!session) {
    return null
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setFormState((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setStatusMessage('')

    try {
      const profile = await updateStudentProfile(session.token, {
        full_name: formState.full_name.trim(),
        class_level: formState.class_level.trim(),
        section: formState.section.trim(),
        date_of_birth: formState.date_of_birth || null,
        guardian_name: formState.guardian_name.trim(),
        guardian_phone: formState.guardian_phone.trim(),
        guardian_email: formState.guardian_email.trim(),
        address: formState.address.trim(),
        interests: formState.interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        goals: formState.goals.trim(),
        joined_on: formState.joined_on || null,
      })
      setUpdatedAt(profile.updated_at)
      setFormState(toFormState(profile))
      setStatusMessage('Profile updated successfully.')
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.fields ? Object.values(err.fields).flat().join(' ') : ''
        setError(fieldErrors || err.message)
      } else {
        setError('Unable to update profile right now. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="page">
      <section className="section">
        <div className="container profile-shell">
          <article className="content-card profile-overview">
            <div className="section-head profile-overview-head">
              <div>
                <p className="hero-pill">Student Profile</p>
                <h1>Personal details</h1>
                <p>
                  Review academic and guardian information, then update anything that has changed for
                  the current session.
                </p>
              </div>
              {statusMessage ? <p className="form-success profile-status-chip">{statusMessage}</p> : null}
            </div>
            {isLoading ? <p className="status-text">Loading profile...</p> : null}
            {error ? <p className="status-text">{error}</p> : null}
            <div className="profile-summary-grid">
              <article className="profile-stat-card">
                <span className="profile-stat-label">Student Code</span>
                <strong>{studentCode || '-'}</strong>
              </article>
              <article className="profile-stat-card">
                <span className="profile-stat-label">Username</span>
                <strong>{username || '-'}</strong>
              </article>
              <article className="profile-stat-card">
                <span className="profile-stat-label">Email</span>
                <strong>{email || '-'}</strong>
              </article>
              <article className="profile-stat-card">
                <span className="profile-stat-label">Last Updated</span>
                <strong>{updatedAt ? new Date(updatedAt).toLocaleString() : '-'}</strong>
              </article>
            </div>
          </article>

          <div className="two-col profile-layout">
            <aside className="content-card profile-side-card">
              <h2>Profile snapshot</h2>
              <p>
                Keep student and guardian details current so progress reviews, class communication, and
                admissions support stay accurate.
              </p>
              <div className="profile-facts">
                <div className="profile-fact">
                  <span className="profile-fact-label">Current class</span>
                  <strong>{formState.class_level || 'Not added yet'}</strong>
                </div>
                <div className="profile-fact">
                  <span className="profile-fact-label">Section</span>
                  <strong>{formState.section || 'Not added yet'}</strong>
                </div>
                <div className="profile-fact">
                  <span className="profile-fact-label">Guardian contact</span>
                  <strong>{formState.guardian_phone || 'Not added yet'}</strong>
                </div>
                <div className="profile-fact">
                  <span className="profile-fact-label">Joined on</span>
                  <strong>{formState.joined_on || 'Not added yet'}</strong>
                </div>
              </div>
            </aside>

            <form className="inquiry-form profile-form" onSubmit={(event) => void handleSubmit(event)}>
              <p className="form-section-label">Student information</p>
              <label>
                Full Name
                <input
                  name="full_name"
                  value={formState.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />
              </label>
              <div className="profile-grid">
                <label>
                  Class
                  <input
                    name="class_level"
                    value={formState.class_level}
                    onChange={handleChange}
                    placeholder="e.g. Class 3"
                  />
                </label>
                <label>
                  Section
                  <input
                    name="section"
                    value={formState.section}
                    onChange={handleChange}
                    placeholder="e.g. A"
                  />
                </label>
              </div>
              <div className="profile-grid">
                <label>
                  Date of Birth
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formState.date_of_birth}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Joined On
                  <input
                    type="date"
                    name="joined_on"
                    value={formState.joined_on}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <p className="form-section-label">Guardian information</p>
              <label>
                Guardian Name
                <input
                  name="guardian_name"
                  value={formState.guardian_name}
                  onChange={handleChange}
                  placeholder="Enter guardian name"
                />
              </label>
              <div className="profile-grid">
                <label>
                  Guardian Phone
                  <input
                    name="guardian_phone"
                    value={formState.guardian_phone}
                    onChange={handleChange}
                    placeholder="Enter guardian phone"
                  />
                </label>
                <label>
                  Guardian Email
                  <input
                    type="email"
                    name="guardian_email"
                    value={formState.guardian_email}
                    onChange={handleChange}
                    placeholder="Enter guardian email"
                  />
                </label>
              </div>
              <label>
                Address
                <input
                  name="address"
                  value={formState.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </label>

              <p className="form-section-label">Learning details</p>
              <label>
                Interests (comma separated)
                <input
                  name="interests"
                  value={formState.interests}
                  onChange={handleChange}
                  placeholder="Math puzzles, Reading, Coding"
                />
              </label>
              <label>
                Academic Goals
                <textarea
                  name="goals"
                  rows={4}
                  value={formState.goals}
                  onChange={handleChange}
                  placeholder="Describe current learning goals"
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={isSaving || isLoading}>
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
              {statusMessage ? <p className="form-success form-success-inline">{statusMessage}</p> : null}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
