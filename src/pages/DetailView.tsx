import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMovieDetails, posterUrl } from '../api/tmdb.ts'
import Nav from '../components/Nav.tsx'
import { useBrowse } from '../context/BrowseContext.tsx'
import type { MovieDetails } from '../types.ts'
import styles from './DetailView.module.css'

function releaseYear(date: string): string {
  return date ? date.slice(0, 4) : 'Unknown'
}

function formatRuntime(minutes: number | null): string {
  if (!minutes) return 'Unknown'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}

function languageName(code: string): string {
  if (!code) return 'Unknown'
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code
  } catch {
    return code.toUpperCase()
  }
}

export default function DetailView() {
  const { id } = useParams()
  const movieId = Number(id)
  const validId = Number.isInteger(movieId) && movieId > 0
  const { ids } = useBrowse()
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(validId)
  const [error, setError] = useState(validId ? '' : 'That movie link is not valid.')

  const index = ids.indexOf(movieId)
  const canCycle = index >= 0 && ids.length > 1
  const previousId = canCycle ? ids[(index - 1 + ids.length) % ids.length] : null
  const nextId = canCycle ? ids[(index + 1) % ids.length] : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [movieId])

  useEffect(() => {
    if (!validId) return
    let active = true
    setLoading(true)
    setError('')
    setDetails(null)
    getMovieDetails(movieId)
      .then((movie) => {
        if (active) setDetails(movie)
      })
      .catch(() => {
        if (active) setError('That movie could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [movieId, validId])

  const backdrop = details ? posterUrl(details.backdrop_path, 'w1280') : null
  const poster = details ? posterUrl(details.poster_path, 'w342') : null

  return (
    <article className={styles.page}>
      <Nav />
      <div className={styles.hero}>
        {backdrop ? <img className={styles.backdrop} src={backdrop} alt="" /> : null}
      </div>

      {loading ? <p className={styles.status}>Loading movie…</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {details ? (
        <div className={styles.content}>
          {poster ? (
            <img className={styles.poster} src={poster} alt={`${details.title} poster`} />
          ) : (
            <div className={styles.posterMissing} role="img" aria-label={`No poster for ${details.title}`}>
              No poster
            </div>
          )}
          <div>
            <h1>
              {details.title} <span>{releaseYear(details.release_date)}</span>
            </h1>
            {details.tagline ? <p className={styles.tagline}>{details.tagline}</p> : null}
            <dl className={styles.facts}>
              <div>
                <dt>Rating</dt>
                <dd>
                  {details.vote_average.toFixed(1)} / 10
                  <span> from {details.vote_count.toLocaleString()} votes</span>
                </dd>
              </div>
              <div>
                <dt>Runtime</dt>
                <dd>{formatRuntime(details.runtime)}</dd>
              </div>
              <div>
                <dt>Language</dt>
                <dd>{languageName(details.original_language)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{details.status}</dd>
              </div>
            </dl>
            {details.genres.length > 0 ? (
              <ul className={styles.genres}>
                {details.genres.map((genre) => (
                  <li key={genre.id}>{genre.name}</li>
                ))}
              </ul>
            ) : null}
            <p className={styles.overview}>
              {details.overview || 'No overview has been added for this title yet.'}
            </p>
          </div>
        </div>
      ) : null}

      <nav className={styles.pager} aria-label="More movies">
        {previousId !== null ? (
          <Link className={`${styles.pagerLink} ${styles.previous}`} to={`/movie/${previousId}`}>
            ← Previous
          </Link>
        ) : (
          <span className={`${styles.pagerDisabled} ${styles.previous}`}>← Previous</span>
        )}
        <p>{index >= 0 ? `${index + 1} of ${ids.length}` : 'Movie'}</p>
        {nextId !== null ? (
          <Link className={`${styles.pagerLink} ${styles.next}`} to={`/movie/${nextId}`}>
            Next →
          </Link>
        ) : (
          <span className={`${styles.pagerDisabled} ${styles.next}`}>Next →</span>
        )}
      </nav>
    </article>
  )
}
