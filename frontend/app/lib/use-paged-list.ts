import { useRef, useState } from 'react'

/**
 * Paging for a list that is already filtered and sorted. Keeps the page number
 * in range when the list shrinks, and brings the top of the list back into view
 * when the page changes (on a phone the Next button sits far below it).
 */
export function usePagedList<T>(rows: T[], initialPageSize = 20) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const topRef = useRef<HTMLDivElement>(null)

  const lastPage = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, lastPage)
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize)

  return {
    page: current,
    pageSize,
    pageRows,
    topRef,
    /** Call whenever a filter or search term changes. */
    reset: () => setPage(1),
    goTo: (next: number) => {
      setPage(next)
      topRef.current?.scrollIntoView({ block: 'start' })
    },
    changePageSize: (next: number) => {
      setPageSize(next)
      setPage(1)
    },
  }
}
