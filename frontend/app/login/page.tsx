'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password)

      if (result.error) {
        setError(result.error.message)
      } else {
        // Redirect to setup page on successful login
        router.push('/setup')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-hkust-blue mb-2">
            HKUST Dorm Advisor
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hkust-blue focus:border-transparent"
              placeholder="your.email@connect.ust.hk"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hkust-blue focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-hkust-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-hkust-blue hover:underline text-sm"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:underline text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
