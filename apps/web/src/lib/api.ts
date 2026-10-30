export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  audio_text: string;
}

export interface VoiceConfig {
  tts: {
    provider: string;
    voices: string[];
    ready: boolean;
  };
  stt: {
    provider: string;
    languages: string[];
    ready: boolean;
  };
}

export interface VoicesResponse {
  provider: string;
  voices: Array<{
    id: string;
    name: string;
    language: string;
    gender: string;
    description: string;
  }>;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3003/api';

export async function sendMessage(message: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  
  if (!res.ok) {
    throw new Error('Failed to send message');
  }
  
  return res.json();
}



// ─── Cinema Data API ─────────────────────────────────────────────

interface MovieFilters {
  city?: string
  format?: string
  language?: string
  isPremiere?: boolean
  genre?: string
}

interface ShowtimeFilters {
  movieId?: string
  cinemaId?: string
  date?: string
  format?: string
  language?: string
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json()
}

export function fetchMovies(filters?: MovieFilters) {
  const params = new URLSearchParams()
  if (filters?.city) params.set('city', filters.city)
  if (filters?.format) params.set('format', filters.format)
  if (filters?.language) params.set('language', filters.language)
  if (filters?.isPremiere) params.set('isPremiere', 'true')
  if (filters?.genre) params.set('genre', filters.genre)
  const qs = params.toString()
  return apiFetch<{ movies: Record<string, unknown>[] }>(`/movies${qs ? `?${qs}` : ''}`)
}

export function fetchShowtimes(filters?: ShowtimeFilters) {
  const params = new URLSearchParams()
  if (filters?.movieId) params.set('movieId', filters.movieId)
  if (filters?.cinemaId) params.set('cinemaId', filters.cinemaId)
  if (filters?.date) params.set('date', filters.date)
  if (filters?.format) params.set('format', filters.format)
  if (filters?.language) params.set('language', filters.language)
  const qs = params.toString()
  return apiFetch<{ showtimes: Record<string, unknown>[] }>(`/showtimes${qs ? `?${qs}` : ''}`)
}

export function fetchCinemas(city?: string) {
  const qs = city ? `?city=${encodeURIComponent(city)}` : ''
  return apiFetch<{ cinemas: Record<string, unknown>[] }>(`/cinemas${qs}`)
}

export function fetchPromotions(type?: string) {
  const qs = type ? `?type=${type}` : ''
  return apiFetch<{ promotions: Record<string, unknown>[] }>(`/promotions${qs}`)
}

export function fetchSeatLayout(cinemaId: string, screenNumber: number) {
  return apiFetch<Record<string, unknown>>(`/seats/${cinemaId}/${screenNumber}`)
}

export function fetchTicketTypes(format?: string) {
  const qs = format ? `?format=${format}` : ''
  return apiFetch<{ ticketTypes: Record<string, unknown>[]; ticketPackages?: Record<string, unknown>[] }>(`/tickets${qs}`)
}

export function fetchConcessions(category?: string) {
  const qs = category ? `?category=${category}` : ''
  return apiFetch<{ categories: Record<string, unknown>[] }>(`/concessions${qs}`)
}

export function fetchMovie(movieId: string) {
  return apiFetch<Record<string, unknown>>(`/movies/${movieId}`)
}
