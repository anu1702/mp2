import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPopularMovies, posterUrl } from '../api/tmdb.ts'
import Nav from '../components/Nav.tsx'
import Pager from '../components/Pager.tsx'
import { useBrowse } from '../context/BrowseContext.tsx'
import { pageCount, pageItems, pageLabel } from '../paging.ts'
import type { Movie } from '../types.ts'
import styles from './ListView.module.css'

type SortKey = 'title' | 'rating' | 'year'
type SortOrder = 'asc' | 'desc'

function releaseYear(date: string): string {
  return date ? date.slice(0, 4) : 'Unknown'
}

function sortMovies(movies: Movie[], key: SortKey, order: SortOrder): Movie[] {
  const direction = order === 'asc' ? 1 : -1
  return [...movies].sort((a, b) => {
    let result = 0
    if (key === 'title') result = a.title.localeCompare(b.title)
    else if (key === 'rating') result = a.vote_average - b.vote_average
    else result = a.release_date.slice(0, 4).localeCompare(b.release_date.slice(0, 4))
    if (result === 0) return a.title.localeCompare(b.title)
    return result * direction
  })
}

export default function ListView() {
  const { setIds } = useBrowse()
  const [movies, setMovies] = useState<Movie[]>([])
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    getPopularMovies()
      .then((results) => {
        if (active) setMovies(results)
      })
      .catch(() => {
        if (active) setError('TMDB could not be reached. Try again in a moment.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const visibleMovies = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = needle
      ? movies.filter((movie) => movie.title.toLowerCase().includes(needle))
      : movies
    return sortMovies(filtered, sortKey, sortOrder)
  }, [movies, query, sortKey, sortOrder])
  const pages = pageCount(visibleMovies.length)
  const currentPage = Math.min(page, pages)
  const shownMovies = pageItems(visibleMovies, currentPage)

  useEffect(() => {
    if (loading || error) return
    setIds(visibleMovies.map((movie) => movie.id))
  }, [visibleMovies, loading, error, setIds])

  function onSortKeyChange(value: string) {
    if (value === 'title' || value === 'rating' || value === 'year') {
      setSortKey(value)
      setPage(1)
    }
  }

  function goToPage(nextPage: number) {
    setPage(nextPage)
    window.scrollTo(0, 0)
  }

  return (
    <section className={styles.page}>
      <Nav />
      <header className={styles.header}>
        <h1>Movies</h1>
        <p>Search the loaded list by title, then sort the matches.</p>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.field}>
          <span>Search</span>
          <input
            type="search"
            value={query}
            placeholder="Filter by title"
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            autoComplete="off"
          />
        </label>
        <label className={styles.field}>
          <span>Sort by</span>
          <select value={sortKey} onChange={(event) => onSortKeyChange(event.target.value)}>
            <option value="title">Title</option>
            <option value="rating">Rating</option>
            <option value="year">Year</option>
          </select>
        </label>
        <div className={styles.order} role="group" aria-label="Sort order">
          <button
            type="button"
            className={sortOrder === 'asc' ? styles.pressed : undefined}
            aria-pressed={sortOrder === 'asc'}
            onClick={() => {
              setSortOrder('asc')
              setPage(1)
            }}
          >
            Ascending
          </button>
          <button
            type="button"
            className={sortOrder === 'desc' ? styles.pressed : undefined}
            aria-pressed={sortOrder === 'desc'}
            onClick={() => {
              setSortOrder('desc')
              setPage(1)
            }}
          >
            Descending
          </button>
        </div>
      </div>

      <p className={styles.count} aria-live="polite">
        {loading ? 'Loading movies…' : pageLabel(visibleMovies.length, currentPage)}
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
      {!loading && visibleMovies.length === 0 ? (
        <p className={styles.empty}>No movies match that search.</p>
      ) : null}

      <Pager page={currentPage} pageCount={pages} loading={loading} onPageChange={goToPage} />

      <ul className={styles.list}>
        {shownMovies.map((movie) => {
          const src = posterUrl(movie.poster_path)
          return (
            <li key={movie.id}>
              <Link className={styles.row} to={`/movie/${movie.id}`}>
              {src ? (
                <img src={src} alt={`${movie.title} poster`} />
              ) : (
                <div className={styles.placeholder} role="img" aria-label={`No poster for ${movie.title}`}>
                  No poster
                </div>
              )}
              <div>
                <h2>{movie.title}</h2>
                <p className={styles.meta}>
                  <span>{releaseYear(movie.release_date)}</span>
                  <span>{movie.vote_average.toFixed(1)} / 10</span>
                </p>
                <p className={styles.overview}>
                  {movie.overview || 'No overview has been added for this title yet.'}
                </p>
              </div>
              </Link>
            </li>
          )
        })}
      </ul>
      {shownMovies.length > 0 ? (
        <Pager page={currentPage} pageCount={pages} loading={loading} onPageChange={goToPage} />
      ) : null}
    </section>
  )
}
