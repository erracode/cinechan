export type AgeRating = 'TBC' | '7-A' | '12-A' | '15-A' | '18-A'

export type ScreenFormat = '2D' | '3D' | 'XD' | 'DBOX' | 'PREMIUM'

export type Language = 'Doblada' | 'Subtitulada'

export type PromotionType = 'combo' | 'bank' | 'loyalty' | 'discount'

export type SeatStatus = 'available' | 'occupied' | 'blocked' | 'selected'

export const AGE_RATING_LABELS: Record<AgeRating, string> = {
  'TBC': 'Por Confirmar',
  '7-A': '+7 Años',
  '12-A': '+12 Años',
  '15-A': '+15 Años',
  '18-A': '+18 Años',
}

export const SCREEN_FORMATS: ScreenFormat[] = ['2D', '3D', 'XD', 'DBOX', 'PREMIUM']

export const FORMAT_SURCHARGES: Record<ScreenFormat, number> = {
  '2D': 0,
  '3D': 2.00,
  'XD': 3.00,
  'DBOX': 5.00,
  'PREMIUM': 2.50,
}

export const FORMAT_LABELS: Record<ScreenFormat, string> = {
  '2D': '2D',
  '3D': '3D',
  'XD': 'XD',
  'DBOX': 'D-BOX',
  'PREMIUM': 'Premium',
}

export interface CinemaService {
  id: string
  name: string
}

export interface Cinema {
  id: string
  name: string
  city: string
  address: string
  phone?: string
  services: CinemaService[]
  screens: CinemaScreen[]
  schedule: string
}

export interface CinemaScreen {
  number: number
  name: string
  formats: ScreenFormat[]
  totalSeats: number
}

export interface Movie {
  id: string
  title: string
  originalTitle?: string
  synopsis: string
  duration: number
  rating: AgeRating
  genre: string
  director?: string
  actors: string[]
  posterUrl: string
  trailerUrl?: string
  formats: ScreenFormat[]
  languages: Language[]
  isPremiere: boolean
  isComingSoon: boolean
  releaseDate: string
  isReRelease?: boolean
}

export interface Showtime {
  id: string
  movieId: string
  cinemaId: string
  screenNumber: number
  datetime: string
  format: ScreenFormat
  language: Language
  availableSeats: number
  totalSeats: number
  price: number
}

export interface SeatPosition {
  areaNumber: number
  rowIndex: number
  columnIndex: number
}

export interface Seat {
  id: string
  rowName: string
  columnIndex: number
  rowIndex: number
  status: SeatStatus
  isWheelchair?: boolean
}

export interface SeatRow {
  name: string
  seats: Seat[]
}

export interface SeatLayout {
  cinemaId: string
  screenNumber: number
  areaNumber: number
  areaName: string
  totalSeats: number
  rows: SeatRow[]
  screenPosition: {
    left: number
    width: number
    top: number
  }
  boundaryLeft: number
  boundaryRight: number
  boundaryTop: number
  columnCount: number
  rowCount: number
}

export interface TicketType {
  id: string
  name: string
  description: string
  price: number
  isLoyaltyOnly: boolean
  isPackageTicket?: boolean
  requiresBinPromo?: string[]
  maxPerOrder: number
}

export interface TicketPackage {
  id: string
  name: string
  description: string
  price: number
  ticketTypes: { ticketTypeId: string; quantity: number }[]
  binDetails?: string[]
}

export interface ConcessionCategory {
  id: string
  name: string
  items: ConcessionItem[]
}

export interface ConcessionModifier {
  id: string
  name: string
  description: string
  price: number
}

export interface ConcessionBuyOption {
  description: string
  price: number
  promoCode?: string
}

export interface ConcessionItem {
  id: string
  name: string
  description: string
  longDescription?: string
  price: number
  categoryId: string
  modifiers?: ConcessionModifier[]
  buyOptions: ConcessionBuyOption[]
  imageUrl?: string
}

export interface Promotion {
  id: string
  name: string
  description: string
  type: PromotionType
  price?: number
  includes: string[]
  bankBin?: string[]
  bankName?: string
  ticketTypeIds?: string[]
}

export interface FormatInfo {
  code: ScreenFormat
  name: string
  surcharge: number
}

export interface MovieFilter {
  city?: string
  cinemaId?: string
  format?: ScreenFormat
  language?: Language
  isPremiere?: boolean
  genre?: string
}

export interface ShowtimeFilter {
  movieId?: string
  cinemaId?: string
  date?: string
  format?: ScreenFormat
  language?: Language
}
