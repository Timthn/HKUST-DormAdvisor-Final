'use client'

import React, { useState } from 'react'
import { Home, ShieldCheck, X, User, Lock, Mail, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { BACKGROUND_IMAGE } from '@/lib/constants'
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase'
import { api } from '@/lib/api'
import type { UserProfile } from '@/types'
import { useRouter } from 'next/navigation'

function hasFormPreferences(profile: UserProfile): boolean {
  const fp = profile?.form_preferences
  if (!fp) return false
  return (
    (fp.identity != null && fp.identity !== '') ||
    (fp.budget_range != null && fp.budget_range !== '') ||
    (Array.isArray(fp.room_types) && fp.room_types.length > 0) ||
    (Array.isArray(fp.priorities) && fp.priorities.length > 0)
  )
}

type ModalView = 'login' | 'register' | 'verification_sent'

export default function LandingPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [view, setView] = useState<ModalView>('login')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPw, setShowLoginPw] = useState(false)

  // Register state
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [showRegPw, setShowRegPw] = useState(false)

  const openModal = () => {
    setView('login')
    setLoginError('')
    setRegError('')
    setShowModal(true)
  }

  const closeModal = () => setShowModal(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const { error } = await signInWithEmail(loginEmail, loginPassword)
      if (error) {
        setLoginError(error.message)
        return
      }
      try {
        const profile = await api.getProfile()
        if (hasFormPreferences(profile)) {
          router.push('/chat')
        } else {
          router.push('/setup')
        }
      } catch {
        // 404 or network: no profile or not loaded → show setup
        router.push('/setup')
      }
    } catch {
      setLoginError('An unexpected error occurred.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.')
      return
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.')
      return
    }
    setRegLoading(true)
    try {
      const { error } = await signUpWithEmail(regEmail, regPassword)
      if (error) {
        setRegError(error.message)
      } else {
        setView('verification_sent')
      }
    } catch {
      setRegError('An unexpected error occurred.')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a1628]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#0a1628]/90 mix-blend-multiply z-10" />
        <div
          className="absolute inset-0 opacity-60"
          style={{ backgroundImage: `url("${BACKGROUND_IMAGE}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      </div>

      {/* Hero */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center justify-center gap-2 mb-6 text-white/80 uppercase tracking-[0.2em] text-sm font-semibold">
            <Home size={18} /> HKUST Dorm Advisor
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-2xl">
            Welcome Home.
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 font-light max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
            Find your perfect dorm at HKUST with AI-powered guidance.
          </p>
        </div>

        <button
          onClick={openModal}
          className="bg-[#C5A059] hover:bg-[#b08d4a] text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl transition-all transform hover:-translate-y-1 animate-in fade-in zoom-in duration-1000 delay-200 flex items-center gap-3"
        >
          <ShieldCheck size={20} />
          Login with School Account
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">

            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
              <X size={22} />
            </button>

            {/* ── Login View ── */}
            {view === 'login' && (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-[#003366] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Home className="text-white" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-[#003366] mb-1">HKUST Dorm</h2>
                <p className="text-gray-500 text-sm mb-7">Sign in with your ITSC account</p>

                <form onSubmit={handleLogin}>
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ITSC ID / EMAIL</label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3.5 top-3.5 text-gray-400" size={17} />
                        <input
                          type="text"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="chan@connect.ust.hk"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">PASSWORD</label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={17} />
                        <input
                          type={showLoginPw ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none transition-all"
                        />
                        <button type="button" onClick={() => setShowLoginPw(p => !p)} className="absolute right-3.5 top-3.5 text-gray-400">
                          {showLoginPw ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-[#003366] text-white font-bold py-3.5 rounded-lg hover:bg-[#002244] transition-all mt-2 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loginLoading ? 'Signing in...' : <><span>Enter System</span><ArrowRight size={18} /></>}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  <button
                    onClick={() => { setRegError(''); setView('register') }}
                    className="text-sm text-gray-500 hover:text-[#003366] transition-colors font-medium"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {/* ── Register View ── */}
            {view === 'register' && (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-[#003366] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Home className="text-white" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-[#003366] mb-1">HKUST Dorm</h2>
                <p className="text-gray-500 text-sm mb-7">Create your student account</p>

                <form onSubmit={handleRegister}>
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">EMAIL</label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={17} />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="chan@connect.ust.hk"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">PASSWORD</label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={17} />
                        <input
                          type={showRegPw ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none transition-all"
                        />
                        <button type="button" onClick={() => setShowRegPw(p => !p)} className="absolute right-3.5 top-3.5 text-gray-400">
                          {showRegPw ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">CONFIRM PASSWORD</label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={17} />
                        <input
                          type="password"
                          value={regConfirm}
                          onChange={(e) => setRegConfirm(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {regError && <p className="text-red-500 text-sm">{regError}</p>}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full bg-[#003366] text-white font-bold py-3.5 rounded-lg hover:bg-[#002244] transition-all mt-2 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {regLoading ? 'Sending...' : <><Mail size={18} /><span>Send Verification</span></>}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  <span className="text-sm text-gray-500">Already have an account?{' '}</span>
                  <button
                    onClick={() => { setLoginError(''); setView('login') }}
                    className="text-sm text-[#003366] font-semibold hover:underline"
                  >
                    Login here
                  </button>
                </div>
              </div>
            )}

            {/* ── Verification Sent View ── */}
            {view === 'verification_sent' && (
              <div className="p-10 text-center">
                <div className="w-14 h-14 bg-[#003366] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Home className="text-white" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-[#003366] mb-6">HKUST Dorm</h2>
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="text-green-500" size={36} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Verification Sent!</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  We've sent a verification link to your email address.<br />
                  Please check your inbox to activate your account.
                </p>
                <button
                  onClick={() => setView('login')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
