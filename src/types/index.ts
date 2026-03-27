export interface Location {
  id: string
  name: string
  lat: number
  lng: number
  country: string
  continent: string
  type: 'city' | 'landmark' | 'region' | 'body_of_water' | 'other'
}

export interface HistoricalEvent {
  id: string
  location_id: string
  title: string
  description: string
  year_start: number
  year_end: number | null
  era: string
  tags: string[]
}

export interface HuntChallenge {
  id: string
  event_id: string
  prompt_text: string
  hints: string[]
  difficulty: 1 | 2 | 3 | 4 | 5
  fun_fact: string
  // Joined from relations
  event?: HistoricalEvent
  location?: Location
}

export interface Score {
  id: string
  user_id: string
  challenge_id: string
  distance_km: number
  year_diff: number
  distance_score: number
  time_score: number
  total_score: number
  played_at: string
}

export interface GlobePoint {
  lat: number
  lng: number
}

export type ZoomTier = 1 | 2 | 3
