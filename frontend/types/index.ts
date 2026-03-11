// ─── Form / User Input Types ─────────────────────────────────────────────────

export type Identity =
  | 'New local undergraduate'
  | 'Continuing local undergraduate'
  | 'New non-local undergraduate'
  | 'Continuing non-local undergraduate'

export type Gender = 'Male' | 'Female'

export type BudgetOption =
  | 'HK$ 14,000 - 20,000'
  | 'HK$ 20,000 - 26,000'
  | 'HK$ 26,000 - 38,000'
  | 'HK$ 38,000+'

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

// ─── Hall / Recommendation Types ─────────────────────────────────────────────

export interface PriceInfoByType {
  new_local?: string
  continuing_local?: string
  new_non_local?: string
  continuing_non_local?: string
}

/**
 * A single hall recommendation item returned by POST /api/recommend/
 * Also used as the data shape for FacilitiesModal.
 */
export interface HallRecommendationItem {
  hall_id: string
  name: string
  reason: string
  image_url?: string
  price_info?: string | PriceInfoByType
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
