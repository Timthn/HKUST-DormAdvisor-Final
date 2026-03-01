'use client'

import React, { useState } from 'react'
import { MessageSquare, ChevronDown, Plus, X, ArrowLeft } from 'lucide-react'
import type { FormData, Identity, Gender, BudgetOption, RoomType } from '@/types'

interface SetupFormProps {
  onStart: (data: FormData) => void
  onBack: () => void
  existingData?: FormData
}

const IDENTITY_OPTIONS: Identity[] = [
  'Local Undergraduate',
  'Non-Local Undergraduate',
  'Exchange Student',
]

const GENDER_OPTIONS: Gender[] = ['Male', 'Female']

const BUDGET_OPTIONS: BudgetOption[] = [
  'HK$ 15,000 - 20,000',
  'HK$ 20,000 - 25,000',
  'HK$ 25,000 - 30,000',
  'HK$ 30,000+',
]

const ROOM_TYPE_OPTIONS: RoomType[] = ['Single Room', 'Double Room', 'Triple Room']

export default function SetupForm({ onStart, onBack, existingData }: SetupFormProps) {
  const [formData, setFormData] = useState<FormData>(
    existingData || {
      identity: 'Local Undergraduate',
      gender: 'Male',
      budget: 'HK$ 15,000 - 20,000',
      roomTypes: [],
      priorities: [],
      additionalInfo: '',
    }
  )
  const [customPriority, setCustomPriority] = useState('')

  const toggleRoomType = (type: RoomType) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(type)
        ? prev.roomTypes.filter(t => t !== type)
        : [...prev.roomTypes, type],
    }))
  }

  const addPriority = () => {
    if (customPriority.trim()) {
      setFormData(prev => ({ ...prev, priorities: [...prev.priorities, customPriority.trim()] }))
      setCustomPriority('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-10 animate-in slide-in-from-bottom-8 duration-500 relative">

        <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-4 mb-8 mt-6">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003366]">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Preference Form</h2>
            <p className="text-sm text-gray-500">Tell us about your preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Identity */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Identity</label>
            <div className="relative">
              <select
                value={formData.identity}
                onChange={(e) => setFormData({ ...formData, identity: e.target.value as Identity })}
                className="w-full bg-gray-50 text-gray-800 rounded-xl p-3.5 pr-10 appearance-none focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 outline-none font-medium transition-all"
              >
                {IDENTITY_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
            <div className="relative">
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full bg-gray-50 text-gray-800 rounded-xl p-3.5 pr-10 appearance-none focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 outline-none font-medium transition-all"
              >
                {GENDER_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Budget (Yearly)</label>
            <div className="relative">
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value as BudgetOption })}
                className="w-full bg-gray-50 text-gray-800 rounded-xl p-3.5 pr-10 appearance-none focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 outline-none font-medium transition-all"
              >
                {BUDGET_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={18} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 ml-1">
              * Note: Hall charges do not include air-conditioning fees. For details, please refer to{' '}
              <a href="https://shrl.hkust.edu.hk" target="_blank" rel="noreferrer" className="text-[#003366] hover:underline">SHRL website</a>.
            </p>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Room Type</label>
            <div className="flex flex-wrap gap-2.5">
              {ROOM_TYPE_OPTIONS.map(type => (
                <button
                  key={type}
                  onClick={() => toggleRoomType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    formData.roomTypes.includes(type)
                      ? 'bg-[#003366] text-white border-[#003366] shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Factors */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Priority Factors <span className="text-gray-400 font-normal ml-1">Optional</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.priorities.map((p, idx) => (
                <span key={idx} className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
                  {p}
                  <X size={14} className="cursor-pointer hover:text-orange-900" onClick={() => setFormData(prev => ({ ...prev, priorities: prev.priorities.filter((_, i) => i !== idx) }))} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPriority}
                onChange={(e) => setCustomPriority(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addPriority() }}
                placeholder="e.g., Quiet, Near Gym..."
                className="flex-1 bg-gray-50 text-gray-800 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 transition-all"
              />
              <button onClick={addPriority} className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl px-4 flex items-center justify-center border border-gray-200 transition-colors">
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Additional Remarks */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Additional Remarks <span className="text-gray-400 font-normal ml-1">Optional</span>
            </label>
            <textarea
              rows={3}
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              placeholder="e.g. I am a night owl, I love playing basketball..."
              className="w-full bg-gray-50 text-gray-800 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 resize-none transition-all"
            />
          </div>

          <button
            onClick={() => onStart(formData)}
            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all mt-4 transform hover:-translate-y-0.5 active:scale-95"
          >
            Start Chat Recommendation
          </button>
        </div>
      </div>
    </div>
  )
}
