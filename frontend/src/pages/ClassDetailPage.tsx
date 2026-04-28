import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProgramLevel } from '../api/client'
import type { ProgramLevel } from '../api/types'
import { usePageMeta } from '../hooks/usePageMeta'

export function ClassDetailPage() {
  usePageMeta(
    'Class Details',
    'View class-specific outcomes, worksheet levels, and daily practice plans.',
  )
  const { slug } = useParams()
  const [program, setProgram] = useState<ProgramLevel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (!slug) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      try {
        const data = await getProgramLevel(slug)
        if (isMounted) {
          setProgram(data)
        }
      } catch {
        if (isMounted) {
          setNotFound(true)
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
  }, [slug])

  if (isLoading) {
    return (
      <div className="page">
        <section className="section">
          <div className="container narrow">
            <p className="status-text">Loading class details...</p>
          </div>
        </section>
      </div>
    )
  }

  if (!program || notFound) {
    return (
      <div className="page">
        <section className="section">
          <div className="container narrow">
            <h1>Program not found</h1>
            <p>The selected class page is unavailable. Please return to classes.</p>
            <Link to="/classes" className="btn btn-primary">
              Back to Classes
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="section">
        <div className="container narrow">
          <p className="hero-pill">{program.age_group}</p>
          <h1>{program.name}</h1>
          <p>{program.description}</p>
          <p>
            <strong>Subjects covered:</strong> {program.subjects.join(', ')}
          </p>
          <p>
            <strong>Daily worksheet time:</strong> {program.daily_minutes}
          </p>
          <p>
            <strong>Sheet progression band:</strong> {program.sheet_levels}
          </p>
          <h2>Expected learning outcomes</h2>
          <ul className="list">
            {program.learning_outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
          <div className="cta-row">
            <Link to="/admissions" className="btn btn-primary">
              Request Assessment
            </Link>
            <Link to="/worksheets" className="btn btn-ghost">
              View Sample Sheets
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
