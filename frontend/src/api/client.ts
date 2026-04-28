import type {
  Announcement,
  ApiMeta,
  FAQ,
  InquiryPayload,
  InquiryResponse,
  LearningModule,
  PageSection,
  ProgramLevel,
  SiteConfig,
  StudentLoginPayload,
  StudentLoginResponse,
  StudentProfile,
  StudentProfileUpdatePayload,
  Teacher,
  Testimonial,
  Worksheet,
} from './types'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'
).replace(/\/+$/, '')

type SuccessEnvelope<T> = {
  success: true
  data: T
  message: string
  meta?: ApiMeta
}

type ErrorEnvelope = {
  success: false
  error?: {
    code?: string
    fields?: Record<string, string[]>
  }
  message?: string
}

type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type RequestOptions = RequestInit & {
  authToken?: string
}

function firstFieldMessage(fields?: Record<string, string[]>) {
  if (!fields) {
    return ''
  }

  for (const messages of Object.values(fields)) {
    const firstMessage = messages.find(Boolean)
    if (firstMessage) {
      return firstMessage
    }
  }

  return ''
}

export class ApiError extends Error {
  fields?: Record<string, string[]>

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.fields = fields
  }
}

async function request<T>(path: string, init?: RequestOptions): Promise<SuccessEnvelope<T>> {
  const headers = new Headers(init?.headers ?? {})
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (init?.authToken) {
    headers.set('Authorization', `Token ${init.authToken}`)
  }

  const requestInit = { ...(init ?? {}) } as RequestOptions
  delete requestInit.authToken
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestInit,
      headers,
    })
  } catch {
    throw new ApiError('Unable to reach the server. Please check that the backend is running.')
  }

  const rawPayload = await response.text()
  let payload: Envelope<T>
  try {
    payload = JSON.parse(rawPayload) as Envelope<T>
  } catch {
    throw new ApiError(`Unexpected server response (${response.status}).`)
  }

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`
    const fields = payload.success ? undefined : payload.error?.fields
    const message = payload.message || firstFieldMessage(fields) || fallbackMessage
    throw new ApiError(message, fields)
  }

  if (!payload.success) {
    const message = payload.message ?? payload.error?.code ?? 'Request failed'
    const fields = payload.error?.fields
    throw new ApiError(message, fields)
  }

  return payload
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const payload = await request<SiteConfig>('/site-config')
  return payload.data
}

export async function getProgramLevels(): Promise<ProgramLevel[]> {
  const payload = await request<ProgramLevel[]>('/program-levels')
  return payload.data
}

export async function getProgramLevel(slug: string): Promise<ProgramLevel> {
  const payload = await request<ProgramLevel>(`/program-levels/${slug}`)
  return payload.data
}

export async function getLearningModules(): Promise<LearningModule[]> {
  const payload = await request<LearningModule[]>('/learning-modules')
  return payload.data
}

export async function getWorksheets(filters: {
  level?: string
  subject?: string
  difficulty?: string
  page?: number
}): Promise<{ items: Worksheet[]; meta?: ApiMeta }> {
  const params = new URLSearchParams()
  if (filters.level) {
    params.set('level', filters.level)
  }
  if (filters.subject) {
    params.set('subject', filters.subject)
  }
  if (filters.difficulty) {
    params.set('difficulty', filters.difficulty)
  }
  if (filters.page) {
    params.set('page', String(filters.page))
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  const payload = await request<Worksheet[]>(`/worksheets${query}`)
  return { items: payload.data, meta: payload.meta }
}

export async function getTeachers(): Promise<Teacher[]> {
  const payload = await request<Teacher[]>('/teachers')
  return payload.data
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const payload = await request<Testimonial[]>('/testimonials')
  return payload.data
}

export async function getFaqs(): Promise<FAQ[]> {
  const payload = await request<FAQ[]>('/faqs')
  return payload.data
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const payload = await request<Announcement[]>('/announcements')
  return payload.data
}

export async function getPageSections(page?: string): Promise<PageSection[]> {
  const query = page ? `?page=${encodeURIComponent(page)}` : ''
  const payload = await request<PageSection[]>(`/page-sections${query}`)
  return payload.data
}

export async function submitInquiry(payload: InquiryPayload): Promise<InquiryResponse> {
  const response = await request<InquiryResponse>('/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function loginStudent(payload: StudentLoginPayload): Promise<StudentLoginResponse> {
  const response = await request<StudentLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function logoutStudent(authToken: string): Promise<void> {
  await request<Record<string, never>>('/auth/logout', {
    method: 'POST',
    authToken,
  })
}

export async function getStudentProfile(authToken: string): Promise<StudentProfile> {
  const response = await request<StudentProfile>('/students/profile', {
    authToken,
  })
  return response.data
}

export async function updateStudentProfile(
  authToken: string,
  payload: StudentProfileUpdatePayload,
): Promise<StudentProfile> {
  const response = await request<StudentProfile>('/students/profile', {
    method: 'PATCH',
    authToken,
    body: JSON.stringify(payload),
  })
  return response.data
}
