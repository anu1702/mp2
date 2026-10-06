import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGenres, getPopularMovies, posterUrl } from '../api/tmdb.ts'
import Nav from '../components/Nav.tsx'
import Pager from '../components/Pager.tsx'
import { useBrowse } from '../context/BrowseContext.tsx'
import { pageCount, pageItems, pageLabel } from '../paging.ts'
import type { Genre, Movie } from '../types.ts'
import styles from './GalleryView.module.css'

export default function GalleryView() {
  const { setIds } = useBrowse()
  const [genres, setGenres] = useState<Genre[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const orderedGenres = useMemo(
    () => [...genres].sort((a, b) => a.name.localeCompare(b.name)),
    [genres],
  )

  const filteredMovies = useMemo(() => {
    if (selected.length === 0) return movies
    return movies.filter((movie) => selected.every((id) => movie.genre_ids?.includes(id)))
  }, [movies, selected])

  const pages = pageCount(filteredMovies.length)
  const currentPage = Math.min(page, pages)
  const shownMovies = pageItems(filteredMovies, currentPage)

  useEffect(() => {
    let active = true
    getGenres()
      .then((results) => {
        if (active) setGenres(results)
      })
      .catch(() => {
        if (active) setError('Genres could not be loaded.')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    getPopularMovies()
      .then((results) => {
        if (!active) return
        setMovies(results)
        setError('')
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

  useEffect(() => {
    if (loading || error) return
    setIds(filteredMovies.map((movie) => movie.id))
  }, [filteredMovies, loading, error, setIds])

  function toggleGenre(id: number) {
    setPage(1)
    setSelected((current) =>
      current.includes(id) ? current.filter((genreId) => genreId !== id) : [...current, id],
    )
  }

  function clearGenres() {
    setPage(1)
    setSelected([])
  }

  function goToPage(nextPage: number) {
    setPage(nextPage)
    window.scrollTo(0, 0)
  }

  return (
    <section className={styles.page}>
      <Nav />
      <header className={styles.header}>
        <h1>Gallery</h1>
        <p>Choose one or more genres. A movie stays only when it belongs to every genre you select.</p>
      </header>

      <div className={styles.filters} role="group" aria-label="Filter by genre">
        {orderedGenres.map((genre) => {
          const pressed = selected.includes(genre.id)
          return (
            <button
              key={genre.id}
              type="button"
              className={pressed ? styles.pressed : undefined}
              aria-pressed={pressed}
              onClick={() => toggleGenre(genre.id)}
            >
              {genre.name}
            </button>
          )
        })}
        {selected.length > 0 ? (
          <button type="button" className={styles.clear} onClick={clearGenres}>
            Clear
          </button>
        ) : null}
      </div>

      <p className={styles.count} aria-live="polite">
        {loading ? 'Loading posters…' : pageLabel(filteredMovies.length, currentPage)}
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
      {!loading && filteredMovies.length === 0 && !error ? (
        <p className={styles.empty}>No posters match those genres.</p>
      ) : null}

      <Pager page={currentPage} pageCount={pages} loading={loading} onPageChange={goToPage} />

      <ul className={styles.grid}>
        {shownMovies.map((movie) => {
          const src = posterUrl(movie.poster_path, 'w342')
          return (
            <li key={movie.id}>
              <Link className={styles.card} to={`/movie/${movie.id}`}>
              {src ? (
                <img src={src} alt={`${movie.title} poster`} />
              ) : (
                <div className={styles.placeholder} role="img" aria-label={`No poster for ${movie.title}`}>
                  No poster
                </div>
              )}
              <h2>{movie.title}</h2>
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
