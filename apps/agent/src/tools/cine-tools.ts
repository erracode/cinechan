import {
  movies, cinemas, promotions,
  ticketTypes, ticketPackages,
  concessionCategories, getSeatLayout,
  generateShowtimes, calculatePrice,
} from "../mock/cinema-data.js"
import type { Movie, Showtime, Cinema, Promotion, ScreenFormat, Language, ConcessionItem, ConcessionCategory, TicketType } from "@cinechan/shared"

export const getMovies = async (city?: string, format?: ScreenFormat, language?: Language, isPremiere?: boolean, genre?: string) => {
  let filtered: Movie[] = movies

  if (city) {
    const cinemaIds = new Set(cinemas.filter(c => c.city.toLowerCase() === city.toLowerCase()).map(c => c.id))
    if (cinemaIds.size > 0) {
      const playingIds = new Set(generateShowtimes().filter(s => cinemaIds.has(s.cinemaId)).map(s => s.movieId))
      filtered = filtered.filter(m => playingIds.has(m.id))
    }
  }

  if (format) filtered = filtered.filter(m => m.formats.includes(format))
  if (language) filtered = filtered.filter(m => m.languages.includes(language))
  if (isPremiere != null) filtered = filtered.filter(m => m.isPremiere === isPremiere)
  if (genre) filtered = filtered.filter(m => m.genre.toLowerCase() === genre.toLowerCase())

  return {
    movies: filtered.map(m => ({
      id: m.id,
      title: m.title,
      originalTitle: m.originalTitle,
      rating: m.rating,
      genre: m.genre,
      duration: m.duration,
      formats: m.formats,
      languages: m.languages,
      isPremiere: m.isPremiere,
      isReRelease: m.isReRelease,
      releaseDate: m.releaseDate,
      posterUrl: m.posterUrl,
      synopsis: m.synopsis.slice(0, 200),
      director: m.director,
      actors: m.actors.slice(0, 3),
    })),
  }
}

export const getMovieDetails = async (movieId: string) => {
  const movie = movies.find(m => m.id === movieId)
  if (!movie) return { error: "Película no encontrada" }
  return movie
}

export const getShowtimes = async (
  movieId?: string, cinemaId?: string,
  date?: string, format?: ScreenFormat, language?: Language,
) => {
  const results = generateShowtimes(movieId, cinemaId, date, format, language)

  return {
    showtimes: results.map(s => {
      const movie = movies.find(m => m.id === s.movieId)
      const cinema = cinemas.find(c => c.id === s.cinemaId)
      return { ...s, movieTitle: movie?.title, cinemaName: cinema?.name }
    }),
  }
}

export const getCinemas = async (city?: string) => {
  let filtered = cinemas
  if (city) filtered = filtered.filter(c => c.city.toLowerCase() === city.toLowerCase())
  return { cinemas: filtered }
}

export const getPromotions = async (type?: string, bankBin?: string) => {
  let filtered: Promotion[] = promotions
  if (type) filtered = filtered.filter(p => p.type === type)
  if (bankBin) filtered = filtered.filter(p => p.bankBin?.includes(bankBin))
  return { promotions: filtered }
}

export const getSeats = async (cinemaId: string, screenNumber: number) => {
  return getSeatLayout(cinemaId, screenNumber)
}

export const getTicketTypes = async (cinemaId?: string, format?: ScreenFormat) => {
  let types: TicketType[] = ticketTypes
  if (format) {
    const surcharge = calculatePrice(format, "general") / calculatePrice("2D", "general")
    types = types.map(t => ({
      ...t,
      price: Math.round(t.price * surcharge * 100) / 100,
    }))
  }
  return { ticketTypes: types }
}

export const getConcessions = async (categoryId?: string) => {
  let categories: ConcessionCategory[] = concessionCategories
  if (categoryId) categories = categories.filter(c => c.id === categoryId)
  return { categories }
}

export const getRecommendations = async (genre?: string) => {
  let filtered = movies
  if (genre) filtered = movies.filter(m => m.genre.toLowerCase() === genre.toLowerCase())

  const sorted = filtered.sort((a, b) => {
    const ratingOrder: Record<string, number> = { "18-A": 5, "15-A": 4, "12-A": 3, "7-A": 2, "TBC": 1 }
    return (ratingOrder[b.rating] ?? 0) - (ratingOrder[a.rating] ?? 0)
  })

  return {
    recommendations: sorted.slice(0, 3).map(m => ({
      id: m.id,
      title: m.title,
      rating: m.rating,
      genre: m.genre,
      duration: m.duration,
      isPremiere: m.isPremiere,
    })),
  }
}

export const getConcessionItem = async (itemId: string) => {
  for (const cat of concessionCategories) {
    const item = cat.items.find(i => i.id === itemId)
    if (item) return { item: { ...item, category: cat.name } }
  }
  return { error: "Producto no encontrado" }
}
