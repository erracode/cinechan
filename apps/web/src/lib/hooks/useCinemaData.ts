import { useQuery } from '@tanstack/react-query'
import {
  fetchMovies, fetchShowtimes, fetchCinemas,
  fetchSeatLayout, fetchTicketTypes, fetchConcessions,
  fetchPromotions, fetchMovie,
} from '#/lib/api'

export function useMovies(filters?: Parameters<typeof fetchMovies>[0]) {
  return useQuery({
    queryKey: ['movies', filters],
    queryFn: () => fetchMovies(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useShowtimes(filters?: Parameters<typeof fetchShowtimes>[0]) {
  return useQuery({
    queryKey: ['showtimes', filters],
    queryFn: () => fetchShowtimes(filters),
    staleTime: 1000 * 30,
  })
}

export function useCinemas(city?: string) {
  return useQuery({
    queryKey: ['cinemas', city],
    queryFn: () => fetchCinemas(city),
    staleTime: 1000 * 60 * 10,
  })
}

export function usePromotions(type?: string) {
  return useQuery({
    queryKey: ['promotions', type],
    queryFn: () => fetchPromotions(type),
    staleTime: 1000 * 60 * 10,
  })
}

export function useSeatLayout(cinemaId: string, screenNumber: number) {
  return useQuery({
    queryKey: ['seats', cinemaId, screenNumber],
    queryFn: () => fetchSeatLayout(cinemaId, screenNumber),
    staleTime: 1000 * 10,
    enabled: cinemaId.length > 0 && screenNumber > 0,
  })
}

export function useTicketTypes(format?: string) {
  return useQuery({
    queryKey: ['tickets', format],
    queryFn: () => fetchTicketTypes(format),
    staleTime: 1000 * 60 * 5,
  })
}

export function useConcessions(category?: string) {
  return useQuery({
    queryKey: ['concessions', category],
    queryFn: () => fetchConcessions(category),
    staleTime: 1000 * 60 * 5,
  })
}

export function useMovie(id: string) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchMovie(id),
    staleTime: 1000 * 60 * 5,
    enabled: id.length > 0,
  })
}
