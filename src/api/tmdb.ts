import axios from 'axios'
import type { Genre, Movie, MovieDetails } from '../types.ts'

const client = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
  },
})

interface MovieListResponse {
  results: Movie[]
  total_pages: number
}

function uniqueMovies(movies: Movie[]): Movie[] {
  const seen = new Set<number>()
  return movies.filter((movie) => {
    if (seen.has(movie.id)) return false
    seen.add(movie.id)
    return true
  })
}

async function getMoviePages(
  path: string,
  params: Record<string, string | number>,
  pages: number[],
): Promise<Movie[]> {
  const responses = await Promise.all(
    pages.map((page) =>
      client.get<MovieListResponse>(path, {
        params: { ...params, page, language: 'en-US' },
      }),
    ),
  )
  return uniqueMovies(responses.flatMap((response) => response.data.results))
}

const CATALOG_SIZE = 500
const TMDB_PAGE_SIZE = 20
const REQUEST_BATCH = 5
let catalogRequest: Promise<Movie[]> | null = null

export function getPopularMovies(): Promise<Movie[]> {
  if (catalogRequest) return catalogRequest
  catalogRequest = fetchCatalog().catch((error: unknown) => {
    catalogRequest = null
    throw error
  })
  return catalogRequest
}

async function fetchCatalog(): Promise<Movie[]> {
  const pageCount = CATALOG_SIZE / TMDB_PAGE_SIZE
  const movies: Movie[] = []
  for (let start = 1; start <= pageCount; start += REQUEST_BATCH) {
    const pages: number[] = []
    for (let page = start; page < start + REQUEST_BATCH && page <= pageCount; page += 1) {
      pages.push(page)
    }
    const batch = await Promise.all(pages.map((page) => getMoviePages('/movie/popular', {}, [page])))
    movies.push(...batch.flat())
  }
  return uniqueMovies(movies).slice(0, CATALOG_SIZE)
}

export async function getGenres(): Promise<Genre[]> {
  const response = await client.get<{ genres: Genre[] }>('/genre/movie/list', {
    params: { language: 'en-US' },
  })
  return response.data.genres
}

export function posterUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w780' | 'w1280' = 'w185',
): string | null {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  const response = await client.get<MovieDetails>(`/movie/${id}`, {
    params: { language: 'en-US' },
  })
  const movie = response.data
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview ?? '',
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date ?? '',
    vote_average: movie.vote_average ?? 0,
    vote_count: movie.vote_count ?? 0,
    runtime: movie.runtime,
    tagline: movie.tagline ?? '',
    status: movie.status ?? 'Unknown',
    original_language: movie.original_language ?? '',
    genres: movie.genres ?? [],
  }
}
