import styles from './Pager.module.css'

interface PagerProps {
  page: number
  pageCount: number
  loading: boolean
  onPageChange: (page: number) => void
}

export default function Pager({ page, pageCount, loading, onPageChange }: PagerProps) {
  return (
    <div className={styles.pager}>
      <button type="button" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <p>
        Page {page} of {pageCount}
      </p>
      <button
        type="button"
        disabled={page >= pageCount || loading}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}
