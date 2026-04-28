import { useEffect, useState } from 'react'
import { getFaqs, getSiteConfig } from '../api/client'
import { defaultSiteConfig, type FAQ, type SiteConfig } from '../api/types'
import { usePageSections } from '../hooks/usePageSections'
import { usePageMeta } from '../hooks/usePageMeta'

const weeklyPlan = [
  { day: 'Monday', focus: 'New concept sheets + correction loop' },
  { day: 'Tuesday', focus: 'Reinforcement sheets + timing drill' },
  { day: 'Wednesday', focus: 'Mixed practice + mentor feedback' },
  { day: 'Thursday', focus: 'Skill gap targeting sheets' },
  { day: 'Friday', focus: 'Mastery check + advance prep' },
  { day: 'Saturday', focus: 'Parent review and next-week target' },
]

export function ParentCornerPage() {
  usePageMeta(
    'Parent Corner',
    'Find weekly structure, parent support details, and FAQs about the learning model.',
)
  const [institution, setInstitution] = useState<SiteConfig>(defaultSiteConfig)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true)
  const { sections } = usePageSections('parent_corner')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoadingFaqs(true)

      const [siteConfigResult, faqResult] = await Promise.allSettled([getSiteConfig(), getFaqs()])

      if (!isMounted) {
        return
      }

      if (
        siteConfigResult.status === 'fulfilled' &&
        Object.keys(siteConfigResult.value).length > 0
      ) {
        setInstitution(siteConfigResult.value)
      }

      if (faqResult.status === 'fulfilled') {
        setFaqs(faqResult.value)
      } else {
        setFaqs([])
      }

      setIsLoadingFaqs(false)
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const introSection = sections.find((section) => section.section_key === 'intro')
  const weeklyPlanSection = sections.find((section) => section.section_key === 'weekly_plan')
  const faqHeadingSection = sections.find((section) => section.section_key === 'faq_heading')
  const pageEyebrow = introSection?.eyebrow.trim() || 'Parent Corner'
  const pageHeading =
    introSection?.heading.trim() || 'Clear communication, weekly structure, transparent progress'
  const pageBody =
    introSection?.body.trim() ||
    'Review the weekly rhythm and stay aligned on how learners build consistency at the center.'
  const weeklyRows = weeklyPlanSection?.items.length
    ? weeklyPlanSection.items.map((item) => ({
        day: item.label || item.title,
        focus: item.body,
      }))
    : weeklyPlan
  const faqHeading = faqHeadingSection?.heading.trim() || 'Frequently asked questions'

  return (
    <div className="page">
      <section className="section">
        <div className="container">
          <p className="hero-pill">{pageEyebrow}</p>
          <h1>{pageHeading}</h1>
          <p>{pageBody}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Center Focus</th>
                </tr>
              </thead>
              <tbody>
                {weeklyRows.map((item) => (
                  <tr key={item.day}>
                    <td>{item.day}</td>
                    <td>{item.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note">
            Parent support line: {institution.phone} | Email: {institution.email}
          </p>
        </div>
      </section>
      <section className="section section-cream">
        <div className="container">
          <h2>{faqHeading}</h2>
          {isLoadingFaqs ? (
            <p className="status-text">Loading parent support FAQs...</p>
          ) : faqs.length > 0 ? (
            <div className="faq-grid">
              {faqs.map((faq) => (
                <article key={faq.id} className="content-card">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </article>
              ))}
            </div>
          ) : (
            <article className="content-card empty-card">
              <h3>The FAQ library is currently empty.</h3>
              <p>Once live parent support questions are published, they will appear in this section.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
