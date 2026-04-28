import { usePageSections } from '../hooks/usePageSections'
import { usePageMeta } from '../hooks/usePageMeta'

type LegalPageProps = {
  contentPage: 'privacy' | 'terms'
  title: string
  intro: string
}

export function LegalPage({ contentPage, title, intro }: LegalPageProps) {
  const { sections } = usePageSections(contentPage)
  const mainSection = sections.find((section) => section.section_key === 'main')
  const pageTitle = mainSection?.heading.trim() || title
  const pageIntro = mainSection?.body.trim() || intro
  const paragraphs = mainSection?.items.length
    ? mainSection.items
        .map((item) => item.body.trim() || item.title.trim())
        .filter(Boolean)
    : [
        'By using this website, you agree to share admission inquiry details voluntarily. We do not sell personal data and only use submitted information for communication about classes and assessments.',
      ]

  usePageMeta(pageTitle, pageIntro)

  return (
    <div className="page">
      <section className="section">
        <div className="container narrow">
          <h1>{pageTitle}</h1>
          <p>{pageIntro}</p>
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  )
}
