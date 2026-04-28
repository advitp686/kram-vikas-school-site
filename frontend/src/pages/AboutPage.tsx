import { useEffect, useState } from 'react'
import { getSiteConfig } from '../api/client'
import { defaultSiteConfig, type SiteConfig } from '../api/types'
import { usePageSections } from '../hooks/usePageSections'
import { usePageMeta } from '../hooks/usePageMeta'

export function AboutPage() {
  usePageMeta(
    'About',
    'Learn about Kram Vikas mission, values, and structured academic approach for young learners.',
  )
  const [institution, setInstitution] = useState<SiteConfig>(defaultSiteConfig)
  const { sections } = usePageSections('about')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const data = await getSiteConfig()
        if (isMounted && Object.keys(data).length > 0) {
          setInstitution(data)
        }
      } catch {
        // Keep fallback values.
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const introSection = sections.find((section) => section.section_key === 'intro')
  const valuesSection = sections.find((section) => section.section_key === 'values')
  const introEyebrow = introSection?.eyebrow.trim() || 'About the Institution'
  const introBody =
    introSection?.body.trim() ||
    'Our after-school center combines structured worksheets with personal teacher guidance. Learners build consistency through short daily goals and rise through difficulty levels only when mastery is demonstrated.'
  const introNote =
    introSection?.note.trim() ||
    'We serve Nursery to Class 5 with a calm learning environment, low student-teacher ratio, and measurable academic checkpoints for families.'
  const valueCards = valuesSection?.items.length
    ? valuesSection.items
    : [
        {
          id: 1,
          label: '',
          title: 'Our Vision',
          body: 'Create self-driven learners who can handle school curriculum confidently and independently.',
          display_order: 1,
        },
        {
          id: 2,
          label: '',
          title: 'Our Culture',
          body: 'Consistency over pressure. Precision over speed. Mentoring over rote repetition.',
          display_order: 2,
        },
        {
          id: 3,
          label: '',
          title: 'Our Promise',
          body: 'Clear levels, transparent reviews, and professional teachers for every class band.',
          display_order: 3,
        },
      ]

  return (
    <div className="page">
      <section className="section">
        <div className="container narrow">
          <p className="hero-pill">{introEyebrow}</p>
          <h1>{institution.name}</h1>
          <p>
            <strong>{institution.tagline}</strong>
          </p>
          <p>{institution.mission}</p>
          <p>{introBody}</p>
          <p>{introNote}</p>
        </div>
      </section>
      <section className="section section-cream">
        <div className="container card-grid">
          {valueCards.map((item) => (
            <article key={`${item.display_order}-${item.title}`} className="content-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
