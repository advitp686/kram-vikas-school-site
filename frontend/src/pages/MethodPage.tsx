import { useEffect, useState } from 'react'
import { getLearningModules } from '../api/client'
import type { LearningModule } from '../api/types'
import { usePageSections } from '../hooks/usePageSections'
import { usePageMeta } from '../hooks/usePageMeta'

export function MethodPage() {
  usePageMeta(
    'Learning Method',
    'Understand the Kumon-style self-paced process: diagnostic assessment, sheet practice, review, and advancement.',
  )
  const [methodStages, setMethodStages] = useState<LearningModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { sections } = usePageSections('method')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const stages = await getLearningModules()
        if (isMounted) {
          setMethodStages(stages)
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

  const introSection = sections.find((section) => section.section_key === 'intro')
  const benefitsSection = sections.find((section) => section.section_key === 'benefits')
  const introEyebrow = introSection?.eyebrow.trim() || 'Kumon-Style Method'
  const introHeading = introSection?.heading.trim() || 'Self-paced progression with measurable mastery'
  const introBody =
    introSection?.body.trim() ||
    'The model is built around frequent worksheet practice, immediate correction, and level advancement tests. Children move by performance, not by calendar month.'
  const benefitCards = benefitsSection?.items.length
    ? benefitsSection.items
    : [
        {
          id: 1,
          label: '',
          title: 'Sheet Volume',
          body: 'Students receive manageable daily packets designed for confidence and repetition quality.',
          display_order: 1,
        },
        {
          id: 2,
          label: '',
          title: 'Teacher Feedback',
          body: 'Mentors review errors immediately so misconceptions are corrected before they become habits.',
          display_order: 2,
        },
        {
          id: 3,
          label: '',
          title: 'Parent Visibility',
          body: 'Parents see progression reports with speed, accuracy, consistency, and next-level readiness.',
          display_order: 3,
        },
      ]

  return (
    <div className="page">
      <section className="section">
        <div className="container narrow">
          <p className="hero-pill">{introEyebrow}</p>
          <h1>{introHeading}</h1>
          <p>{introBody}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {isLoading ? <p className="status-text">Loading learning modules...</p> : null}
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
              <h3>Learning modules are being loaded.</h3>
              <p>The step-by-step method will appear here once the live curriculum data is available.</p>
            </article>
          )}
        </div>
      </section>
      <section className="section section-cream">
        <div className="container card-grid">
          {benefitCards.map((item) => (
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
