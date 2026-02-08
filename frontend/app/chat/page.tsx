'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ChatPanel from '@/components/ChatPanel'
import RecommendationPanel from '@/components/RecommendationPanel'
import FacilitiesModal from '@/components/FacilitiesModal'
import { api } from '@/lib/api'
import { getSession } from '@/lib/supabase'
import { HALL_FACILITIES } from '@/lib/constants'
import type { Session, FormData, Message, HallDetails } from '@/types'

// Development mode flag - set to true to skip authentication
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

export default function ChatPage() {
  const router = useRouter()
  
  // Navigation State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewingFacilityHall, setViewingFacilityHall] = useState<HallDetails | null>(null)

  // Data State
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Active Session State
  const [formData, setFormData] = useState<FormData>({
    identity: 'Undergraduate',
    budget: 'HK$ 3000 - 5000',
    roomTypes: [],
    priorities: [],
    additionalInfo: ''
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState('')
  
  // UI Status State
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    if (!DEV_MODE) {
      checkAuth()
    } else {
      console.log('⚠️ DEV_MODE: Skipping authentication check')
      // In dev mode, show a welcome message
      setMessages([{
        id: Date.now(),
        sender: 'bot',
        text: "👋 Welcome to HKUST Dorm Advisor! (Development Mode)\n\nYou can start chatting with me to get hall recommendations. Try asking about different halls or your preferences!",
        timestamp: Date.now()
      }])
    }
    loadSessions()
  }, [])

  const checkAuth = async () => {
    const session = await getSession()
    if (!session) {
      router.push('/login')
    } else {
      loadProfile()
    }
  }

  const loadProfile = async () => {
    try {
      const profile = await api.getProfile()
      setFormData({
        identity: profile.identity as any,
        budget: profile.budget_range as any,
        roomTypes: profile.preferences.room_types as any,
        priorities: profile.preferences.priorities,
        additionalInfo: profile.preferences.additional_info || ''
      })
      
      // Generate initial analysis
      generateInitialAnalysis()
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const generateInitialAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const result = await api.generateRecommendations()
      setAiAnalysis(result.advisor_comment)
      
      setMessages([{
        id: Date.now(),
        sender: 'bot',
        text: "Welcome! I've analyzed your preferences and generated recommendations for you. Check out the right panel!",
        timestamp: Date.now()
      }])
    } catch (error) {
      console.error('Failed to generate analysis:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadSessions = () => {
    const saved = localStorage.getItem('hkust_dorm_sessions')
    if (saved) setSessions(JSON.parse(saved))
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return
    
    const userMsg: Message = { 
      id: Date.now(), 
      sender: 'user', 
      text: inputText, 
      timestamp: Date.now() 
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    try {
      const response = await api.sendChatMessage(inputText)
      
      setMessages(prev => [...prev, {
        id: Date.now(), 
        sender: 'bot', 
        text: response.answer, 
        timestamp: Date.now()
      }])
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleResubmitAnalysis = async () => {
    setIsAnalyzing(true)
    setAiAnalysis('')

    try {
      // Update profile first
      await api.updateProfile(formData)
      
      // Generate new recommendations
      const result = await api.refreshRecommendations()
      setAiAnalysis(result.advisor_comment)

      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: "I've updated the recommendations based on your new criteria.",
        timestamp: Date.now()
      }])
    } catch (error) {
      console.error('Failed to resubmit:', error)
    } finally {
      setIsAnalyzing(false)
    }
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
        onLogout={() => router.push('/')}
      />
      
      <FacilitiesModal 
        hall={viewingFacilityHall} 
        onClose={() => setViewingFacilityHall(null)} 
      />

      <ChatPanel 
        messages={messages}
        isTyping={isTyping}
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      <RecommendationPanel 
        formData={formData}
        setFormData={setFormData}
        aiAnalysis={aiAnalysis}
        isAnalyzing={isAnalyzing}
        onShowFacilities={(name) => setViewingFacilityHall(HALL_FACILITIES[name] || null)}
        onResubmit={handleResubmitAnalysis}
      />
    </div>
  )
}
