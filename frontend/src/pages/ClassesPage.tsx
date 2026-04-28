import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProgramLevels } from '../api/client'
import type { ProgramLevel } from '../api/types'
import { usePageMeta } from '../hooks/usePageMeta'

export function ClassesPage() {
  usePageMeta(
    'Classes',
    'Explore Nursery to Class 5 programs with daily worksheet targets and measurable outcomes.',
  )
  const [programs, setPrograms] = useState<ProgramLevel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const levels = await getProgramLevels()
        if (isMounted) {
          setPrograms(levels)
        }
      } catch {
        if (isMounted) {
          setError('Unable to load classes right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="page">
      <section className="section">
        <div className="container">
          <p className="hero-pill">Classes</p>
          <h1>Programs from Nursery to Class 5</h1>
          <p>Each level has age-appropriate goals, daily sheet targets, and measurable advancement points.</p>
          {isLoading ? <p className="status-text">Loading classes...</p> : null}
          {error ? <p className="status-text">{error}</p> : null}
          {programs.length > 0 ? (
            <div className="card-grid">
              {programs.map((program) => (
                <article key={program.id} className="content-card">
                  <p className="badge">{program.age_group}</p>
                  <h3>{program.name}</h3>
                  <p>{program.description}</p>
                  <p>
                    <strong>Subjects:</strong> {program.subjects.join(', ')}
                  </p>
                  <p>
                    <strong>Daily sheet time:</strong> {program.daily_minutes}
                  </p>
                  <p>
                    <strong>Sheet band:</strong> {program.sheet_levels}
                  </p>
                  <Link to={`/classes/${program.slug}`} className="text-link">
                    View full details
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <article className="content-card empty-card">
              <h3>No class programs are available right now.</h3>
              <p>The class catalog will show here as soon as the API responds with live program levels.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
