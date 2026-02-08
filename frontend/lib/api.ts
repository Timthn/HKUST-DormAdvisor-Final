/**
 * API Client for Backend Communication
 * Handles all HTTP requests to FastAPI backend
 */
import axios, { AxiosInstance } from 'axios'
import { getAccessToken } from './supabase'
import type { ChatResponse, RecommendationResponse, UserProfile, FormData } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(async (config) => {
      const token = await getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  // ========== Chat API ==========

  async sendChatMessage(message: string): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/api/chat/', { message })
    return response.data
  }

  async getChatHistory(limit: number = 50): Promise<any> {
    const response = await this.client.get('/api/chat/history', { params: { limit } })
    return response.data
  }

  // ========== Recommendation API ==========

  async generateRecommendations(): Promise<RecommendationResponse> {
    const response = await this.client.post<RecommendationResponse>('/api/recommend/')
    return response.data
  }

  async refreshRecommendations(): Promise<RecommendationResponse> {
    const response = await this.client.get<RecommendationResponse>('/api/recommend/refresh')
    return response.data
  }

  // ========== Profile API ==========

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>('/api/profile/')
    return response.data
  }

  async createProfile(data: FormData): Promise<UserProfile> {
    const profileData = {
      identity: data.identity,
      budget_range: data.budget,
      preferences: {
        room_types: data.roomTypes,
        priorities: data.priorities,
        additional_info: data.additionalInfo,
      },
    }
    const response = await this.client.post<UserProfile>('/api/profile/', profileData)
    return response.data
  }

  async updateProfile(data: Partial<FormData>): Promise<UserProfile> {
    const profileData: any = {}
    if (data.identity) profileData.identity = data.identity
    if (data.budget) profileData.budget_range = data.budget
    if (data.roomTypes || data.priorities || data.additionalInfo) {
      profileData.preferences = {
        room_types: data.roomTypes || [],
        priorities: data.priorities || [],
        additional_info: data.additionalInfo || '',
      }
    }
    const response = await this.client.patch<UserProfile>('/api/profile/', profileData)
    return response.data
  }

  // ========== Health Check ==========

  async healthCheck(): Promise<any> {
    const response = await this.client.get('/api/health')
    return response.data
  }
}

// Export singleton instance
export const api = new APIClient()
