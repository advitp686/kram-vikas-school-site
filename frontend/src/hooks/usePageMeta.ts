import { useEffect } from 'react'

const APP_NAME = 'Kram Vikas After School Institute'
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    document.head.appendChild(tag)
  }
  Object.entries(attributes).forEach(([key, value]) => {
    tag?.setAttribute(key, value)
  })
}

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: `${title} | ${APP_NAME}` })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: `${SITE_URL}${window.location.pathname}` })
  }, [title, description])
}
