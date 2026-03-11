'use client'

import React from 'react'
import { Sparkles, Settings, ChevronDown, ChevronRight, Plus, X, RefreshCw } from 'lucide-react'
import type { HallRecommendationItem, FormData, RoomType, BudgetOption, Identity, Gender } from '@/types'

const IDENTITY_OPTIONS: Identity[] = [
  'New local undergraduate',
  'Continuing local undergraduate',
  'New non-local undergraduate',
  'Continuing non-local undergraduate',
]
const GENDER_OPTIONS: Gender[] = ['Male', 'Female']
const BUDGET_OPTIONS: BudgetOption[] = [
  'HK$ 14,000 - 20,000',
  'HK$ 20,000 - 26,000',
  'HK$ 26,000 - 38,000',
  'HK$ 38,000+',
]
const ROOM_TYPE_OPTIONS: RoomType[] = ['Single Room', 'Double Room', 'Triple Room']

interface RecommendationPanelProps {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  recommendations: HallRecommendationItem[]
  isAnalyzing: boolean
  onShowFacilities: (hall: HallRecommendationItem) => void
  onResubmit: () => void
}

export default function RecommendationPanel({
  formData,
  setFormData,
  recommendations,
  isAnalyzing,
  onShowFacilities,
  onResubmit,
}: RecommendationPanelProps) {
  const [customPriority, setCustomPriority] = React.useState('')

  const toggleRoomType = (type: RoomType) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(type)
        ? prev.roomTypes.filter(t => t !== type)
        : [...prev.roomTypes, type],
    }))
  }

  const removePriority = (index: number) => {
    setFormData(prev => ({ ...prev, priorities: prev.priorities.filter((_, i) => i !== index) }))
  }

  const addPriority = () => {
    if (!customPriority.trim()) return
    setFormData(prev => ({ ...prev, priorities: [...prev.priorities, customPriority.trim()] }))
    setCustomPriority('')
  }

  const hasRecommendations = recommendations.length > 0

  return (
    <div className="hidden md:flex md:w-[45%] flex-col bg-white h-full border-l border-gray-200">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center px-6 bg-white z-10 sticky top-0">
        <h2 className="text-[#003366] font-bold text-lg">Recommended Choices for You</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {/* Loading / empty state */}
        {!hasRecommendations ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 min-h-[400px]">
            {isAnalyzing ? (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full animate-pulse" />
                  <Sparkles className="animate-spin text-[#2b5dad] relative z-10" size={40} />
                </div>
                <p className="text-sm text-[#2b5dad] font-medium animate-pulse">AI is analyzing your needs...</p>
              </>
            ) : (
              <p className="text-sm">Waiting for analysis...</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Hall Cards */}
            {recommendations.map((hall) => (
              <div
                key={hall.hall_id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#003366] transition-colors mb-2">
                  {hall.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                  {hall.reason}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onShowFacilities(hall)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 hover:text-[#003366] transition-colors"
                  >
                    View details
                  </button>
                  <button
                    onClick={() => hall.website_url && window.open(hall.website_url, '_blank')}
                    disabled={!hall.website_url}
                    className="px-4 py-2 rounded-lg bg-[#003366] text-white text-xs font-semibold hover:bg-[#002244] transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    View Website <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* Adjust & Re-analyze Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-5 text-[#003366]">
                <Settings size={20} />
                <h3 className="font-bold text-base">Adjust & Re-analyze</h3>
              </div>

              <div className="space-y-4">
                {/* Identity */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Identity</label>
                  <div className="relative">
                    <select
                      value={formData.identity}
                      onChange={(e) => setFormData({ ...formData, identity: e.target.value as Identity })}
                      className="w-full bg-gray-50 text-gray-700 rounded-lg p-3 pr-8 text-sm focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 outline-none font-medium appearance-none"
                    >
                      {IDENTITY_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Gender</label>
                  <div className="relative">
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                      className="w-full bg-gray-50 text-gray-700 rounded-lg p-3 pr-8 text-sm focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 outline-none font-medium appearance-none"
                    >
                      {GENDER_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Budget (Yearly) */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Budget (Yearly)</label>
                  <div className="relative">
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value as BudgetOption })}
                      className="w-full bg-gray-50 text-gray-700 rounded-lg p-3 pr-8 text-sm focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 outline-none font-medium appearance-none"
                    >
                      {BUDGET_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 ml-0.5">
                    * Note: Hall charges do not include air-conditioning fees. For details, please refer to{' '}
                    <a
                      href="https://shrl.hkust.edu.hk"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#003366] hover:underline"
                    >
                      SHRL website
                    </a>.
                  </p>
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Room Type</label>
                  <div className="flex flex-wrap gap-2">
                    {ROOM_TYPE_OPTIONS.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleRoomType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          formData.roomTypes.includes(type)
                            ? 'bg-[#003366] text-white border-[#003366] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 ml-0.5">
                    * Note: Single rooms typically cost over HK$30,000 per year. Please make sure to increase your budget accordingly.
                  </p>
                </div>

                {/* Priorities */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Priorities</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.priorities.map((p, idx) => (
                      <span key={idx} className="bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5">
                        {p}
                        <X size={12} className="cursor-pointer hover:text-orange-900" onClick={() => removePriority(idx)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPriority}
                      onChange={(e) => setCustomPriority(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addPriority() }}
                      placeholder="e.g., Quiet..."
                      className="flex-1 bg-gray-50 text-gray-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 border border-gray-200"
                    />
                    <button onClick={addPriority} className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg px-3 flex items-center justify-center border border-gray-200">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Additional Remarks */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Additional Remarks</label>
                  <textarea
                    rows={2}
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    placeholder="e.g. I am a night owl..."
                    className="w-full bg-gray-50 text-gray-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 resize-none"
                  />
                </div>

                <button
                  onClick={onResubmit}
                  disabled={isAnalyzing}
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all mt-2 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:transform-none"
                >
                  {isAnalyzing ? (
                    <><RefreshCw className="animate-spin" size={18} /> Updating...</>
                  ) : (
                    <><RefreshCw size={18} /> Update Recommendations</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
