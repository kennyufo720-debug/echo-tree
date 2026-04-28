export interface Event {
  id: string
  title: string
  artist: string
  venue: string
  city: string
  date: string
  time: string
  image: string
  category: string
  priceFrom: number
  priceTo: number
  totalSeats: number
  availableSeats: number
  status: 'on-sale' | 'sold-out' | 'coming-soon'
  tags: string[]
  videoId?: string
}

export interface SeatSection {
  id: string
  name: string
  color: string
  price: number
  totalSeats: number
  availableSeats: number
  rows: SeatRow[]
}

export interface SeatRow {
  row: string
  seats: Seat[]
}

export interface Seat {
  id: string
  number: number
  status: 'available' | 'selected' | 'sold' | 'reserved'
}

export interface Order {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  seats: { section: string; row: string; seat: number }[]
  totalAmount: number
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: string
  ticketCode: string
}

export interface User {
  id: string
  name: string
  phone: string
  verified: boolean
}
