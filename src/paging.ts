export const PAGE_SIZE = 50

export function pageCount(total: number): number {
  if (total <= 0) return 1
  return Math.ceil(total / PAGE_SIZE)
}

export function pageItems<T>(items: T[], page: number): T[] {
  const start = (page - 1) * PAGE_SIZE
  return items.slice(start, start + PAGE_SIZE)
}

export function pageLabel(total: number, page: number): string {
  if (total === 0) return '0 movies'
  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)
  const noun = total === 1 ? 'movie' : 'movies'
  return `${start}–${end} of ${total} ${noun}`
}
