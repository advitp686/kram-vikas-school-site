import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAnnouncements,
  getLearningModules,
  getProgramLevels,
  getSiteConfig,
  getTestimonials,
} from '../api/client'
import {
  type Announcement,
  defaultSiteConfig,
  type LearningModule,
  type PageSectionItem,
  type ProgramLevel,
  type SiteConfig,
  type Testimonial,
} from '../api/types'
import { usePageSections } from '../hooks/usePageSections'
import { usePageMeta } from '../hooks/usePageMeta'

const fallbackMetrics: PageSectionItem[] = [
  {
    id: 1,
    label: '',
    title: 'Daily',
    body: 'guided worksheet practice with mentor feedback',
    display_order: 1,
  },
  {
    id: 2,
    label: '',
    title: 'Weekly',
    body: 'progress updates that parents can actually act on',
    display_order: 2,
  },
  {
    id: 3,
    label: '',
    title: 'Personalized',
    body: 'level mapping based on mastery, not age alone',
    display_order: 3,
  },
]

const fallbackSnapshotItems: PageSectionItem[] = [
  {
    id: 1,
    label: '',
    title: 'Diagnostic start',
    body: 'We place each learner at a level that builds confidence first.',
    display_order: 1,
  },
  {
    id: 2,
    label: '',
    title: 'Daily correction loop',
    body: 'Mentors review work quickly so misunderstandings do not pile up.',
    display_order: 2,
  },
  {
    id: 3,
    label: '',
    title: 'Measured advancement',
    body: 'Children move forward only when accuracy, speed, and stamina are stable.',
    display_order: 3,
  },
]

export function HomePage() {
  usePageMeta(
    'Home',
    'After-school self-paced learning from Nursery to Class 5 with worksheets and expert teachers.',
  )
  const [institution, setInstitution] = useState<SiteConfig>(defaultSiteConfig)
  const [methodStages, setMethodStages] = useState<LearningModule[]>([])
  const [programs, setPrograms] = useState<ProgramLevel[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { sections: pageSections } = usePageSections('home')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const [siteConfig, modules, levels, feedback, latestAnnouncements] = await Promise.all([
          getSiteConfig(),
          getLearningModules(),
          getProgramLevels(),
          getTestimonials(),
          getAnnouncements(),
        ])

        if (!isMounted) {
          return
        }

        if (Object.keys(siteConfig).length > 0) {
          setInstitution(siteConfig)
        }
        setMethodStages(modules)
        setPrograms(levels)
        setTestimonials(feedback)
        setAnnouncements(latestAnnouncements)
      } catch {
        if (isMounted) {
          setError('Unable to load live data. Please check backend service.')
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

  const spotlightPrograms = programs.slice(0, 3)
  const familyTestimonials = testimonials.slice(0, 3)
  const heroSection = pageSections.find((section) => section.section_key === 'hero')
  const metricsSection = pageSections.find((section) => section.section_key === 'metrics')
  const snapshotSection = pageSections.find((section) => section.section_key === 'snapshot')
  const heroTagline =
    heroSection?.eyebrow.trim() || institution.tagline.trim() || 'Structured self-paced learning from Nursery to Class 5'
  const heroHeading = heroSection?.heading.trim() || 'Independent learners are built one sheet at a time.'
  const metricItems = metricsSection?.items.length ? metricsSection.items : fallbackMetrics
  const snapshotEyebrow = snapshotSection?.eyebrow.trim() || 'Progress Snapshot'
  const snapshotHeading = snapshotSection?.heading.trim() || 'Calm structure. Clear outcomes. Visible growth.'
  const snapshotItems = snapshotSection?.items.length ? snapshotSection.items : fallbackSnapshotItems

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-pill">{heroTagline}</p>
            <h1>{heroHeading}</h1>
            <p>{institution.mission}</p>
            <div className="hero-metrics" aria-label="Key highlights">
              {metricItems.map((item) => (
                <article key={`${item.display_order}-${item.title}`} className="metric-card">
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </article>
              ))}
            </div>
            <div className="cta-row">
              <Link to="/admissions" className="btn btn-primary">
                Book Assessment
              </Link>
              <Link to="/method" className="btn btn-ghost">
                Explore Method
              </Link>
            </div>
          </div>
          <aside className="hero-card">
            <div className="hero-card-head">
              <p className="hero-card-kicker">{snapshotEyebrow}</p>
              <span className="hero-card-status">Live model</span>
            </div>
            <h2>{snapshotHeading}</h2>
            <ul className="hero-feature-list">
              {snapshotItems.map((item) => (
                <li key={`${item.display_order}-${item.title}`}>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </li>
              ))}
            </ul>
            <div className="hero-card-band">
              <div>
                <span className="hero-band-label">Parent support</span>
                <p>{institution.timings}</p>
              </div>
              <div>
                <span className="hero-band-label">Admissions desk</span>
                <p>{institution.phone}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {isLoading ? <p className="status-text">Loading latest updates...</p> : null}
          {error ? <p className="status-text">{error}</p> : null}
          <div className="section-head">
            <h2>Latest announcements</h2>
            <Link to="/admissions" className="text-link">
              Start admission process
            </Link>
          </div>
          {announcements.length > 0 ? (
            <div className="card-grid">
              {announcements.map((announcement) => (
                <article key={announcement.id} className="content-card">
                  <p className="badge">Announcement</p>
                  <h3>{announcement.title}</h3>
                  <p>{announcement.body}</p>
                  <p className="note">
                    <strong>Published:</strong>{' '}
                    {new Date(announcement.published_at).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <article className="content-card empty-card">
              <h3>Fresh center updates will appear here.</h3>
              <p>
                The admissions and announcements board is ready, but no active update is published at
                the moment.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>How the learning path works</h2>
          {methodStages.length > 0 ? (
            <div className="timeline">
              {methodStages.map((stage) => (
                <article key={stage.step} className="timeline-card">
                  <span>{stage.step}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.text}</p>
                </article>
              ))}
            </div>
          ) : (
            <article className="content-card empty-card">
              <h3>Learning stages are being refreshed.</h3>
              <p>Once the backend is available, the full diagnostic-to-advancement flow will show here.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <div className="section-head">
            <h2>Programs by class band</h2>
            <Link to="/classes" className="text-link">
              View all classes
            </Link>
          </div>
          {spotlightPrograms.length > 0 ? (
            <div className="card-grid">
              {spotlightPrograms.map((program) => (
                <article key={program.id} className="content-card">
                  <p className="badge">{program.age_group}</p>
                  <h3>{program.name}</h3>
                  <p>{program.description}</p>
                  <p>
                    <strong>Subjects:</strong> {program.subjects.join(', ')}
                  </p>
                  <p>
                    <strong>Daily target:</strong> {program.daily_minutes}
                  </p>
                  <Link to={`/classes/${program.slug}`} className="text-link">
                    Explore program
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <article className="content-card empty-card">
              <h3>Programs will appear once the live catalog is available.</h3>
              <p>The class structure is supported end to end and will populate from the API.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Parent feedback</h2>
            <p className="section-caption">Families value consistency, transparency, and visible skill growth.</p>
          </div>
          {familyTestimonials.length > 0 ? (
            <div className="card-grid">
              {familyTestimonials.map((entry) => (
                <blockquote key={entry.id} className="quote-card">
                  <p>"{entry.quote}"</p>
                  <footer>
                    {entry.parent}, {entry.learner_class}
                  </footer>
                </blockquote>
              ))}
            </div>
          ) : (
            <article className="content-card empty-card">
              <h3>Parent testimonials will be published here.</h3>
              <p>The section is live and waiting for approved family feedback entries.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
