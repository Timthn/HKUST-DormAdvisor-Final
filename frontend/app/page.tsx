'use client'

import { useRouter } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const router = useRouter()

  const handleLogin = () => {
    router.push('/login')
  }

  const handleGuest = () => {
    router.push('/setup')
  }

  return <LandingPage onLogin={handleLogin} onGuest={handleGuest} />
}
