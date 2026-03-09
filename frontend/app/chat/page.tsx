'use client'

import React, { useState, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ChatPanel from '@/components/ChatPanel'
import RecommendationPanel from '@/components/RecommendationPanel'
import FacilitiesModal from '@/components/FacilitiesModal'
import { api, streamChatMessage, stripFootnoteRefs } from '@/lib/api'
import { getSession, signOut } from '@/lib/supabase'
import type { FormData, Message, HallRecommendationItem } from '@/types'

/** Map API chat_logs row to Message for rendering. role 'user' -> sender 'user', role 'assistant' -> sender 'bot'. */
function mapHistoryToMessages(rows: { id: number; role: string; content: string; created_at: string }[]): Message[] {
  return rows.map((row) => ({
    id: row.id,
    sender: row.role === 'assistant' ? 'bot' : 'user',
    text: row.content ?? '',
    timestamp: new Date(row.created_at).getTime(),
  }))
}

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

const DEFAULT_FORM: FormData = {
  identity: 'Local Undergraduate',
  gender: 'Male',
  budget: 'HK$ 15,000 - 20,000',
  roomTypes: [],
  priorities: [],
  additionalInfo: '',
}

export default function ChatPage() {
  const router = useRouter()

  // ── UI state ────────────────────────────────────────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [modalHall, setModalHall] = useState<HallRecommendationItem | null>(null)

  // ── Data state ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM)
  const [recommendations, setRecommendations] = useState<HallRecommendationItem[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')

  // ── Status state ────────────────────────────────────────────────────────────
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // ── Streaming bot message ref ───────────────────────────────────────────────
  // We insert a placeholder bot message then update it in-place as chunks arrive.
  const streamingMsgIdRef = useRef<number | null>(null)

  // ── Auth check + profile load ───────────────────────────────────────────────
  useEffect(() => {
    if (!DEV_MODE) {
      checkAuth()
    } else {
      console.log('⚠️ DEV_MODE: Skipping authentication check')
      setMessages([{
        id: Date.now(),
        sender: 'bot',
        text: "👋 Welcome to HKUST Dorm Advisor! (Development Mode)\n\nStart chatting or fill in your preferences to get hall recommendations.",
        timestamp: Date.now(),
      }])
    }
  }, [])

  const checkAuth = async () => {
    const session = await getSession()
    if (!session) {
      router.push('/') // Auth is handled by LandingPage modal at /
    } else {
      await loadProfile()
    }
  }

  /**
   * Load profile from backend.
   * If profile has last_recommendation → use it directly (no extra API call).
   * If not → trigger fresh recommendation generation.
   */
  const loadProfile = async () => {
    try {
      const profile = await api.getProfile()

      // Map form_preferences back to FormData
      const fp = profile.form_preferences || {}
      setFormData({
        identity: (fp.identity as FormData['identity']) || DEFAULT_FORM.identity,
        gender: (fp.gender as FormData['gender']) || DEFAULT_FORM.gender,
        budget: (fp.budget_range as FormData['budget']) || DEFAULT_FORM.budget,
        roomTypes: (fp.room_types as FormData['roomTypes']) || [],
        priorities: fp.priorities || [],
        additionalInfo: fp.additional_info || '',
      })

      // Load chat history from DB so user/assistant render in correct bubbles (role -> sender)
      let historyMessages: Message[] = []
      try {
        const { messages: rows } = await api.getChatHistory(50)
        if (Array.isArray(rows) && rows.length > 0) {
          historyMessages = mapHistoryToMessages(rows)
        }
      } catch (e) {
        console.warn('Could not load chat history:', e)
      }

      if (historyMessages.length > 0) {
        setMessages(historyMessages)
        if (profile.last_recommendation?.length) {
          setRecommendations(profile.last_recommendation)
        }
        return
      }

      // No history: show welcome and recommendations
      const welcomeText = [
        "Hello! I've received your preferences 🎯\n",
        `Identity: ${fp.identity || '—'}`,
        `Gender: ${fp.gender || '—'}`,
        `Budget: ${fp.budget_range || '—'}`,
        `Room Type: ${(fp.room_types || []).join(', ') || 'Any'}`,
        `Priority: ${(fp.priorities || []).join(', ') || 'Any'}`,
        '\nAnalyzing the best match for you...',
      ].join('\n')

      setMessages([{ id: Date.now(), sender: 'bot', text: welcomeText, timestamp: Date.now() }])

      if (profile.last_recommendation && profile.last_recommendation.length > 0) {
        setRecommendations(profile.last_recommendation)
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          text: "Analysis complete! Check out the recommendations on the right. 👉\n\nFeel free to ask me for more details about these halls, or questions regarding the application policy.",
          timestamp: Date.now(),
        }])
      } else {
        await generateRecommendations()
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const generateRecommendations = async () => {
    setIsAnalyzing(true)
    try {
      const result = await api.generateRecommendations()
      setRecommendations(result.recommendations || [])
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: "Analysis complete! Check out the recommendations on the right. 👉\n\nFeel free to ask me for more details about these halls, or questions regarding the application policy.",
        timestamp: Date.now(),
      }])
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Sorry, I had trouble generating recommendations. Please try again.',
        timestamp: Date.now(),
      }])
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ── Chat: SSE streaming ─────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return

    const userText = inputText
    setInputText('')

    // Use negative ids for in-session messages so they never collide with history (DB ids are 1,2,3,...)
    const userMsgId = -Date.now()
    const botMsgId = userMsgId - 1
    streamingMsgIdRef.current = botMsgId

    setMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: userText,
      timestamp: Date.now(),
    }])

    setIsTyping(true)

    setMessages(prev => [...prev, {
      id: botMsgId,
      sender: 'bot',
      text: '',
      timestamp: Date.now(),
    }])

    await streamChatMessage(
      userText,
      // onChunk: append each fragment and flush so user sees streamed output
      (chunk) => {
        flushSync(() => {
          setMessages(prev => prev.map(m =>
            m.id === botMsgId ? { ...m, text: m.text + chunk } : m
          ))
        })
      },
      // onDone: replace bot message with cleaned text (strip [^0] refs and footnote definitions)
      (fullText) => {
        const cleaned = stripFootnoteRefs(fullText)
        setMessages(prev => prev.map(m =>
          m.id === botMsgId ? { ...m, text: cleaned } : m
        ))
        setIsTyping(false)
        streamingMsgIdRef.current = null
      },
      // onError
      (errorMsg) => {
        setMessages(prev => prev.map(m =>
          m.id === botMsgId ? { ...m, text: `Sorry, an error occurred: ${errorMsg}` } : m
        ))
        setIsTyping(false)
        streamingMsgIdRef.current = null
      },
    )
  }

  // ── Re-analyze: save updated preferences then regenerate ────────────────────
  const handleResubmitAnalysis = async () => {
    setIsAnalyzing(true)
    setRecommendations([])

    try {
      // Save updated form preferences to backend
      await api.saveProfile(formData)

      // Generate fresh recommendations
      const result = await api.generateRecommendations()
      setRecommendations(result.recommendations || [])

      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: "I've updated the recommendations based on your new criteria. Check the right panel! 👉",
        timestamp: Date.now(),
      }])
    } catch (error) {
      console.error('Failed to resubmit:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={() => router.push('/setup')}
        onLogout={handleLogout}
      />

      <FacilitiesModal
        hall={modalHall}
        onClose={() => setModalHall(null)}
      />

      <ChatPanel
        messages={messages}
        isTyping={isTyping}
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <RecommendationPanel
        formData={formData}
        setFormData={setFormData}
        recommendations={recommendations}
        isAnalyzing={isAnalyzing}
        onShowFacilities={(hall) => setModalHall(hall)}
        onResubmit={handleResubmitAnalysis}
      />
    </div>
  )
}
