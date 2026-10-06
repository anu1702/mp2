import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

const STORAGE_KEY = 'mp2-browse-ids'

interface BrowseContextValue {
  ids: number[]
  setIds: (ids: number[]) => void
}

const BrowseContext = createContext<BrowseContextValue | null>(null)

function readIds(): number[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is number => typeof id === 'number')
  } catch {
    return []
  }
}

export function BrowseProvider({ children }: { children: ReactNode }) {
  const [ids, setIdsState] = useState<number[]>(readIds)

  const setIds = useCallback((next: number[]) => {
    setIdsState(next)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Previous and next still work until the page is reloaded.
    }
  }, [])

  const value = useMemo(() => ({ ids, setIds }), [ids, setIds])

  return <BrowseContext.Provider value={value}>{children}</BrowseContext.Provider>
}

export function useBrowse(): BrowseContextValue {
  const value = useContext(BrowseContext)
  if (!value) throw new Error('useBrowse must be used within BrowseProvider')
  return value
}
