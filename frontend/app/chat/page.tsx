'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ChatPanel from '@/components/ChatPanel'
import RecommendationPanel from '@/components/RecommendationPanel'
import FacilitiesModal from '@/components/FacilitiesModal'
import { api, streamChatMessage } from '@/lib/api'
import { getSession, signOut } from '@/lib/supabase'
import type { Session, FormData, Message, HallRecommendationItem } from '@/types'

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
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId] = useState<string | null>(null)
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
        text: " Welcome to HKUST Dorm Advisor! (Development Mode)\n\nStart chatting or fill in your preferences to get hall recommendations.",
        timestamp: Date.now(),
      }])
      loadSessions()
    }
  }, [])

  const checkAuth = async () => {
    const session = await getSession()
    if (!session) {
      router.push('/') // Auth is handled by LandingPage modal at /
    } else {
      await loadProfile()
      loadSessions()
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

      // Show welcome message with preferences summary
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

      // If last_recommendation exists → use it; otherwise generate fresh
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

  const loadSessions = () => {
    const saved = localStorage.getItem('hkust_dorm_sessions')
    if (saved) setSessions(JSON.parse(saved))
  }

  // ── Chat: SSE streaming ─────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return

    const userText = inputText
    setInputText('')

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: Date.now(),
    }])

    setIsTyping(true)

    // Add an empty bot placeholder message that we will update in-place
    const botMsgId = Date.now() + 1
    streamingMsgIdRef.current = botMsgId
    setMessages(prev => [...prev, {
      id: botMsgId,
      sender: 'bot',
      text: '',
      timestamp: Date.now(),
    }])

    await streamChatMessage(
      userText,
      // onChunk: append each text fragment to the placeholder message
      (chunk) => {
        setMessages(prev => prev.map(m =>
          m.id === botMsgId ? { ...m, text: m.text + chunk } : m
        ))
      },
      // onDone: streaming finished — nothing extra to do (text already in state)
      (_fullText) => {
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
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSwitchSession={() => {}}
        onNewChat={() => router.push('/setup')}
        onDeleteSession={() => {}}
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
