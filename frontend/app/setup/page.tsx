'use client'

import { useRouter } from 'next/navigation'
import SetupForm from '@/components/SetupForm'
import { api } from '@/lib/api'
import type { FormData } from '@/types'

export default function SetupPage() {
  const router = useRouter()

  const handleStart = async (data: FormData) => {
    try {
      // Save profile to backend
      await api.createProfile(data)
      
      // Navigate to chat page
      router.push('/chat')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save preferences. Please try again.')
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  return <SetupForm onStart={handleStart} onBack={handleBack} />
}
