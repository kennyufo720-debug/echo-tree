import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Database Types ─────────────────────────────────────────

export interface DBUser {
  id: string
  phone: string
  verified: boolean
  points: number
  created_at: string
  updated_at: string
}

export interface DBOrder {
  id: string
  user_phone: string
  event_id: string
  event_title: string
  event_date: string
  event_venue: string
  seats: { section: string; row: string; seat: number }[]
  total_amount: number
  status: 'pending' | 'paid' | 'cancelled'
  ticket_code: string
  created_at: string
}

export interface DBConversation {
  id: string
  user_phone: string
  contact_name: string
  contact_avatar: string
  created_at: string
}

export interface DBMessage {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  read: boolean
  created_at: string
}

export interface DBStoreOrder {
  id: string
  user_phone: string
  item_id: string
  name: string
  image: string
  points: number
  created_at: string
}

export interface DBPointTransaction {
  id: string
  user_phone: string
  type: 'earn' | 'redeem'
  description: string
  points: number
  created_at: string
}

export interface DBEvent {
  id: string
  title: string
  artist: string
  venue: string
  city: string
  date: string
  time: string
  image: string
  category: string
  price_from: number
  price_to: number
  total_seats: number
  available_seats: number
  status: 'on-sale' | 'sold-out' | 'coming-soon'
  tags: string[]
  video_id?: string
  image_position?: string
  created_at: string
}

export interface DBForumPost {
  id: string
  title: string
  content: string
  author: string
  author_avatar: string
  category: string
  tags: string[]
  likes: number
  views: number
  pinned: boolean
  hot: boolean
  created_at: string
}

export interface DBForumComment {
  id: string
  post_id: string
  author: string
  author_avatar: string
  content: string
  likes: number
  created_at: string
}

export interface DBArtistForest {
  id: string
  name: string
  artist: string
  trees: number
  co2: number
  fans: number
  badge: string
  zone: string
  description: string
  globe_x: number
  globe_y: number
  color: string
  grad_from: string
  grad_to: string
  image: string
  rank: number
  created_at: string
}
