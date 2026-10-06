export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  vote_average: number
  genre_ids?: number[]
}

export interface Genre {
  id: number
  name: string
}

export interface MovieDetails {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  runtime: number | null
  tagline: string
  status: string
  original_language: string
  genres: Genre[]
}
