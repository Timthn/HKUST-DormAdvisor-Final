export type Identity = 'Undergraduate' | 'Postgraduate' | 'Exchange Student';
export type BudgetOption = 'HK$ 2000 - 3000' | 'HK$ 3000 - 5000' | 'HK$ 5000 - 8000' | 'HK$ 8000+';
export type RoomType = 'Single Room' | 'Double Room' | 'Triple Room' | 'En-suite' | 'Sea View';

export interface FormData {
  identity: Identity;
  budget: BudgetOption;
  roomTypes: RoomType[];
  priorities: string[];
  additionalInfo: string;
}

export interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  formData: FormData;
  messages: Message[];
  aiAnalysis: string;
  createdAt: number;
  lastUpdated: number;
}

export interface HallDetails {
  name: string;
  avgPrice: string;
  roomTypes: string;
  ac: string;
  bathroom: string;
  gym: string;
  common: string;
  laundry: string;
  features: string;
  tags?: string[];
  tagColor?: string;
}

export interface HallDataMap {
  [key: string]: HallDetails;
}

// API Response Types
export interface ChatResponse {
  answer: string;
  rag_source?: string;
  timestamp: string;
}

export interface HallRecommendation {
  name: string;
  tags: string[];
  score: number;
  reason?: string;
}

export interface RecommendationResponse {
  advisor_comment: string;
  recommendations: HallRecommendation[];
  timestamp: string;
}

export interface UserProfile {
  id: string;
  identity: string;
  budget_range: string;
  preferences: {
    room_types: string[];
    priorities: string[];
    additional_info?: string;
  };
  updated_at: string;
}
