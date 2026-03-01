// ─── Form / User Input Types ─────────────────────────────────────────────────

export type Identity =
  | 'Local Undergraduate'
  | 'Non-Local Undergraduate'
  | 'Exchange Student'

export type Gender = 'Male' | 'Female'

export type BudgetOption =
  | 'HK$ 15,000 - 20,000'
  | 'HK$ 20,000 - 25,000'
  | 'HK$ 25,000 - 30,000'
  | 'HK$ 30,000+'

export type RoomType = 'Single Room' | 'Double Room' | 'Triple Room'

export interface FormData {
  identity: Identity
  gender: Gender
  budget: BudgetOption
  roomTypes: RoomType[]
  priorities: string[]
  additionalInfo: string
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

export interface Message {
  id: number
  sender: 'user' | 'bot'
  text: string
  timestamp: number
}

export interface Session {
  id: string
  title: string
  formData: FormData
  messages: Message[]
  createdAt: number
  lastUpdated: number
}

// ─── Hall / Recommendation Types ─────────────────────────────────────────────

/**
 * A single hall recommendation item returned by POST /api/recommend/
 * Also used as the data shape for FacilitiesModal.
 */
export interface HallRecommendationItem {
  hall_id: string
  name: string
  reason: string
  image_url?: string
  price_info?: string
  facilities?: string[]
  website_url?: string
}

// ─── API Response Types ───────────────────────────────────────────────────────

/** POST /api/recommend/ response */
export interface RecommendationResponse {
  recommendations: HallRecommendationItem[]
  timestamp: string
}

/** GET/POST /api/profile/ response */
export interface UserProfile {
  user_id: string
  form_preferences?: {
    identity?: string
    gender?: string
    budget_range?: string
    room_types?: string[]
    priorities?: string[]
    additional_info?: string
  }
  inferred_preferences?: string
  memory_id?: string
  last_recommendation?: HallRecommendationItem[]
  updated_at?: string
}
