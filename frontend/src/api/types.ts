export type SiteConfig = {
  name: string
  tagline: string
  mission: string
  phone: string
  email: string
  timings: string
  address: string
  logo_url: string
}

export type ProgramLevel = {
  id: number
  name: string
  slug: string
  age_group: string
  description: string
  subjects: string[]
  learning_outcomes: string[]
  daily_minutes: string
  sheet_levels: string
  display_order: number
}

export type LearningModule = {
  step: string
  title: string
  text: string
  display_order: number
}

export type Worksheet = {
  id: number
  title: string
  level_slug: string
  subject: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  pages: number
  preview_url: string
  file_url: string
  is_public: boolean
  updated_at: string
}

export type Teacher = {
  id: number
  full_name: string
  photo_url: string
  subjects: string[]
  experience_years: number
  qualification: string
  bio: string
  awards: string[]
}

export type Testimonial = {
  id: number
  quote: string
  parent: string
  learner_class: string
}

export type FAQ = {
  id: number
  question: string
  answer: string
}

export type Announcement = {
  id: number
  title: string
  body: string
  published_at: string
}

export type PageSectionItem = {
  id: number
  label: string
  title: string
  body: string
  display_order: number
}

export type PageSection = {
  id: number
  page: string
  section_key: string
  eyebrow: string
  heading: string
  body: string
  note: string
  items: PageSectionItem[]
  display_order: number
}

export type InquiryPayload = {
  student_name: string
  guardian_name: string
  phone: string
  email: string
  target_class: string
  message?: string
  preferred_contact_time?: string
  branch?: string
}

export type InquiryResponse = {
  id: number
  status: string
  created_at: string
}

export type StudentLoginPayload = {
  username: string
  password: string
}

export type StudentSummary = {
  username: string
  email: string
  student_code: string
  full_name: string
}

export type StudentLoginResponse = {
  token: string
  student: StudentSummary
}

export type StudentProfile = {
  username: string
  email: string
  student_code: string
  full_name: string
  class_level: string
  section: string
  date_of_birth: string | null
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  address: string
  interests: string[]
  goals: string
  joined_on: string | null
  created_at: string
  updated_at: string
}

export type StudentProfileUpdatePayload = Partial<
  Pick<
    StudentProfile,
    | 'full_name'
    | 'class_level'
    | 'section'
    | 'date_of_birth'
    | 'guardian_name'
    | 'guardian_phone'
    | 'guardian_email'
    | 'address'
    | 'interests'
    | 'goals'
    | 'joined_on'
  >
>

export type ApiMeta = {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export const defaultSiteConfig: SiteConfig = {
  name: 'Kram Vikas After School Institute',
  tagline: 'Structured self-paced learning from Nursery to Class 5',
  mission:
    'Build confident, independent learners through calm daily worksheet practice, teacher mentoring, and measurable mastery tracking.',
  phone: '+91-98765-43210',
  email: 'hello@kramvikas.edu',
  timings: 'Monday to Saturday, 3:00 PM to 8:00 PM',
  address: 'Sunrise Enclave, Sector 8, Near Central Park',
  logo_url: '/brand/logo.png',
}
