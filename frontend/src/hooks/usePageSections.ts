import { useEffect, useState } from 'react'
import { getPageSections } from '../api/client'
import type { PageSection } from '../api/types'

export function usePageSections(page: string) {
  const [sections, setSections] = useState<PageSection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (isMounted) {
        setSections([])
      }
      setIsLoading(true)
      try {
        const rows = await getPageSections(page)
        if (isMounted) {
          setSections(rows)
        }
      } catch {
        if (isMounted) {
          setSections([])
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
  }, [page])

  return { sections, isLoading }
}
