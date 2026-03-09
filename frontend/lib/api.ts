/**
 * API Client for Backend Communication
 */
import axios, { AxiosInstance } from 'axios'
import { getAccessToken } from './supabase'
import type { RecommendationResponse, UserProfile, FormData } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

// ─── Axios client (for non-streaming requests) ────────────────────────────────

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    })

    if (!DEV_MODE) {
      this.client.interceptors.request.use(async (config) => {
        const token = await getAccessToken()
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
      })
    } else {
      console.log('[DEV_MODE] Skipping authentication')
    }
  }

  // ── Profile API ─────────────────────────────────────────────────────────────

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>('/api/profile/')
    return response.data
  }

  /**
   * Save form preferences. Backend only does UPDATE (profile row created by DB trigger).
   * Body structure: { form_preferences: { identity, gender, budget_range, room_types, priorities, additional_info } }
   */
  async saveProfile(data: FormData): Promise<UserProfile> {
    const body = {
      form_preferences: {
        identity: data.identity,
        gender: data.gender,
        budget_range: data.budget,
        room_types: data.roomTypes,
        priorities: data.priorities,
        additional_info: data.additionalInfo,
      },
    }
    const response = await this.client.post<UserProfile>('/api/profile/', body)
    return response.data
  }

  // ── Recommendation API ──────────────────────────────────────────────────────

  async generateRecommendations(): Promise<RecommendationResponse> {
    const response = await this.client.post<RecommendationResponse>('/api/recommend/')
    return response.data
  }

  async refreshRecommendations(): Promise<RecommendationResponse> {
    const response = await this.client.get<RecommendationResponse>('/api/recommend/refresh')
    return response.data
  }

  // ── Chat History ────────────────────────────────────────────────────────────

  async getChatHistory(limit: number = 50): Promise<any> {
    const response = await this.client.get('/api/chat/history', { params: { limit } })
    return response.data
  }

  // ── Health Check ────────────────────────────────────────────────────────────

  async healthCheck(): Promise<any> {
    const response = await this.client.get('/api/health')
    return response.data
  }
}

export const api = new APIClient()

/** Remove Bailian footnote refs [^0], [^1] and definition lines [^n]: [title](url) for display. */
export function stripFootnoteRefs(text: string): string {
  if (!text?.trim()) return text
  // Remove footnote definition lines: [^0]: [title](url) or [^0]: ...
  let out = text.replace(/\n?\s*\[\^[0-9]+\]:\s*[^\n]*(?=\n|$)/g, '')
  // Remove inline markers [^0], [^1], ...
  out = out.replace(/\[\^[0-9]+\]/g, '')
  return out.replace(/\n{3,}/g, '\n\n').trim()
}

// ─── SSE Streaming Chat (cannot use axios — requires fetch + ReadableStream) ──

/**
 * Sends a chat message and streams the response via SSE.
 *
 * @param message      User's message text
 * @param onChunk      Called with each incremental text chunk as it arrives
 * @param onDone       Called with the full assembled response when stream ends
 * @param onError      Called if the request or stream fails
 */
export async function streamChatMessage(
  message: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void,
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (!DEV_MODE) {
    const token = await getAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let fullText = ''

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      onError(`HTTP ${response.status}: ${await response.text()}`)
      return
    }

    if (!response.body) {
      onError('No response body')
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') {
          onDone(fullText)
          return
        }
        try {
          const parsed = JSON.parse(payload)
          if (parsed.error) {
            onError(parsed.error)
            return
          }
          if (parsed.text) {
            fullText += parsed.text
            onChunk(parsed.text)
          }
        } catch {
          // skip malformed SSE line
        }
      }
    }

    // Stream ended without [DONE] — still call onDone
    onDone(fullText)
  } catch (err: any) {
    onError(err.message || 'Network error')
  }
}
