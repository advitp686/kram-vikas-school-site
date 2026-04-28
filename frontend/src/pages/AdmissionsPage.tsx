import { type FormEvent, useEffect, useState } from 'react'
import { getProgramLevels, getSiteConfig, submitInquiry } from '../api/client'
import { defaultSiteConfig, type ProgramLevel, type SiteConfig } from '../api/types'
import { usePageSections } from '../hooks/usePageSections'
import { usePageMeta } from '../hooks/usePageMeta'

export function AdmissionsPage() {
  usePageMeta(
    'Admissions',
    'Book a diagnostic assessment and submit admission inquiries for Nursery to Class 5.',
  )
  const [institution, setInstitution] = useState<SiteConfig>(defaultSiteConfig)
  const [programs, setPrograms] = useState<ProgramLevel[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { sections } = usePageSections('admissions')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const [siteConfig, levels] = await Promise.all([getSiteConfig(), getProgramLevels()])
        if (!isMounted) {
          return
        }
        if (Object.keys(siteConfig).length > 0) {
          setInstitution(siteConfig)
        }
        setPrograms(levels)
      } catch {
        // Fallback to defaults when API is unavailable.
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const introSection = sections.find((section) => section.section_key === 'intro')
  const pageEyebrow = introSection?.eyebrow.trim() || institution.tagline || 'Admissions'
  const pageHeading = introSection?.heading.trim() || 'Book a diagnostic assessment'
  const pageBody =
    introSection?.body.trim() ||
    'Submit your details and our team will call you back for counseling, level check, and a personalized worksheet plan.'
  const pageNote =
    introSection?.note.trim() || 'Families usually receive a callback within one working day.'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const formData = new FormData(form)
    setIsSubmitting(true)
    setSubmitError('')
    setIsSubmitted(false)

    try {
      await submitInquiry({
        student_name: String(formData.get('studentName') ?? ''),
        guardian_name: String(formData.get('guardianName') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        email: String(formData.get('email') ?? ''),
        target_class: String(formData.get('targetClass') ?? ''),
        message: String(formData.get('message') ?? ''),
        preferred_contact_time: String(formData.get('preferredContactTime') ?? ''),
        branch: String(formData.get('branch') ?? ''),
      })
      setIsSubmitted(true)
      form.reset()
    } catch {
      setSubmitError('Unable to submit inquiry right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page">
      <section className="section">
        <div className="container two-col">
          <div className="content-card section-copy-card">
            <p className="hero-pill">{pageEyebrow}</p>
            <h1>{pageHeading}</h1>
            <p>{pageBody}</p>
            <p>{pageNote}</p>
            <p>
              <strong>Phone:</strong> {institution.phone}
            </p>
            <p>
              <strong>Email:</strong> {institution.email}
            </p>
            <p>
              <strong>Center hours:</strong> {institution.timings}
            </p>
            <p>
              <strong>Address:</strong> {institution.address}
            </p>
          </div>

          <form className="inquiry-form" onSubmit={(event) => void handleSubmit(event)}>
            <label>
              Student Name
              <input required name="studentName" placeholder="Enter student name" />
            </label>
            <label>
              Guardian Name
              <input required name="guardianName" placeholder="Enter guardian name" />
            </label>
            <label>
              Phone Number
              <input
                required
                name="phone"
                placeholder="Enter contact number"
                pattern="[0-9+\-\s]{10,15}"
              />
            </label>
            <label>
              Email
              <input required type="email" name="email" placeholder="Enter email" />
            </label>
            <label>
              Target Class
              <select required name="targetClass" defaultValue="">
                <option value="" disabled>
                  Select class
                </option>
                {programs.map((program) => (
                  <option key={program.id} value={program.name}>
                    {program.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Preferred Contact Time
              <input name="preferredContactTime" placeholder="e.g. 4 PM - 6 PM" />
            </label>
            <label>
              Branch
              <input name="branch" placeholder="e.g. Sector 8" />
            </label>
            <label>
              Message
              <textarea
                name="message"
                rows={4}
                placeholder="Share your child goals or academic concerns"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
            </button>
            {isSubmitted ? (
              <p className="form-success">
                Inquiry captured. Our admissions team will contact you shortly.
              </p>
            ) : null}
            {submitError ? <p className="status-text">{submitError}</p> : null}
          </form>
        </div>
      </section>
    </div>
  )
}
