import { useEffect, useMemo, useState } from 'react'
import { getProgramLevels, getWorksheets } from '../api/client'
import type { ProgramLevel, Worksheet } from '../api/types'
import { usePageMeta } from '../hooks/usePageMeta'

function getWorksheetLink(sheet: Worksheet) {
  return sheet.preview_url || sheet.file_url || ''
}

export function WorksheetsPage() {
  usePageMeta(
    'Worksheets',
    'Browse sample worksheets by level and subject for self-paced skill practice.',
  )
  const [programLevels, setProgramLevels] = useState<ProgramLevel[]>([])
  const [worksheets, setWorksheets] = useState<Worksheet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [levelFilter, setLevelFilter] = useState('All')
  const [subjectFilter, setSubjectFilter] = useState('All')

  useEffect(() => {
    let isMounted = true

    const loadLevels = async () => {
      try {
        const levels = await getProgramLevels()
        if (isMounted) {
          setProgramLevels(levels)
        }
      } catch {
        if (isMounted) {
          setError('Unable to load worksheet filters.')
        }
      }
    }

    void loadLevels()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadWorksheets = async () => {
      setIsLoading(true)
      setError('')
      try {
        const payload = await getWorksheets({
          level: levelFilter === 'All' ? undefined : levelFilter,
          subject: subjectFilter === 'All' ? undefined : subjectFilter,
        })
        if (isMounted) {
          setWorksheets(payload.items)
        }
      } catch {
        if (isMounted) {
          setError('Unable to load worksheets at the moment.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadWorksheets()
    return () => {
      isMounted = false
    }
  }, [levelFilter, subjectFilter])

  const subjects = useMemo(
    () => ['All', ...new Set(worksheets.map((sheet) => sheet.subject))],
    [worksheets],
  )

  const levelMap = useMemo(() => {
    return new Map(programLevels.map((level) => [level.slug, level.name]))
  }, [programLevels])

  return (
    <div className="page">
      <section className="section">
        <div className="container">
          <p className="hero-pill">Practice Resources</p>
          <h1>Sample worksheets</h1>
          <p>Browse sample practice sheets by level and subject.</p>

          <div className="filters">
            <label>
              Level
              <select
                value={levelFilter}
                onChange={(event) => {
                  setLevelFilter(event.target.value)
                  setSubjectFilter('All')
                }}
              >
                <option value="All">All</option>
                {programLevels.map((level) => (
                  <option key={level.id} value={level.slug}>
                    {level.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Subject
              <select
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? <p className="status-text">Loading worksheets...</p> : null}
          {error ? <p className="status-text">{error}</p> : null}

          {worksheets.length > 0 ? (
            <div className="card-grid">
              {worksheets.map((sheet) => {
                const worksheetLink = getWorksheetLink(sheet)
                return (
                  <article key={sheet.id} className="content-card">
                    <p className="badge">{levelMap.get(sheet.level_slug) ?? sheet.level_slug}</p>
                    <h3>{sheet.title}</h3>
                    <p>
                      <strong>Subject:</strong> {sheet.subject}
                    </p>
                    <p>
                      <strong>Difficulty:</strong> {sheet.difficulty}
                    </p>
                    <p>
                      <strong>Pages:</strong> {sheet.pages}
                    </p>
                    <div className="cta-row">
                      {worksheetLink ? (
                        <a href={worksheetLink} className="btn btn-ghost">
                          {sheet.preview_url ? 'Preview Sample' : 'Open Worksheet'}
                        </a>
                      ) : (
                        <button type="button" className="btn btn-ghost" disabled>
                          Preview Unavailable
                        </button>
                      )}
                      {sheet.file_url ? (
                        <a href={sheet.file_url} className="btn btn-primary">
                          Download Pack
                        </a>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <article className="content-card empty-card">
              <h3>No worksheets match the selected filters.</h3>
              <p>Try switching the level or subject filters to see the available demo worksheet packs.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
