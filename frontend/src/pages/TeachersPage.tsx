import { useEffect, useState } from 'react'
import { getTeachers } from '../api/client'
import type { Teacher } from '../api/types'
import { usePageMeta } from '../hooks/usePageMeta'

function getTeacherInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function TeachersPage() {
  usePageMeta(
    'Teachers',
    'Meet experienced mentors guiding Nursery to Class 5 learners through structured progression.',
  )
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const rows = await getTeachers()
        if (isMounted) {
          setTeachers(rows)
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
          <p className="hero-pill">Mentor Team</p>
          <h1>Talented teachers across early and primary grades</h1>
          <p>Every class band is guided by specialists with worksheet-driven teaching experience.</p>
          {isLoading ? <p className="status-text">Loading teacher profiles...</p> : null}
          {teachers.length > 0 ? (
            <div className="card-grid">
              {teachers.map((teacher) => (
                <article key={teacher.id} className="content-card teacher-card">
                  <div className="teacher-card-head">
                    {teacher.photo_url ? (
                      <img
                        src={teacher.photo_url}
                        alt={teacher.full_name}
                        className="teacher-photo"
                      />
                    ) : (
                      <div className="teacher-photo teacher-photo-fallback" aria-hidden="true">
                        {getTeacherInitials(teacher.full_name)}
                      </div>
                    )}
                    <div>
                      <h3>{teacher.full_name}</h3>
                      <p className="teacher-role">{teacher.qualification || 'Academic Mentor'}</p>
                    </div>
                  </div>
                  <p>
                    <strong>Expertise:</strong> {teacher.subjects.join(', ')}
                  </p>
                  <p>
                    <strong>Experience:</strong> {teacher.experience_years} years
                  </p>
                  {teacher.awards.length > 0 ? (
                    <p>
                      <strong>Highlights:</strong> {teacher.awards.join(', ')}
                    </p>
                  ) : null}
                  <p>{teacher.bio}</p>
                </article>
              ))}
            </div>
          ) : (
            <article className="content-card empty-card">
              <h3>Teacher profiles are being prepared.</h3>
              <p>The mentor section is ready to display the live teaching roster once available.</p>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
