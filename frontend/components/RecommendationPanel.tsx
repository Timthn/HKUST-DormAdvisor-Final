'use client'

import React, { useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, ChevronRight, Settings, ChevronDown, Plus, X, RefreshCw } from 'lucide-react';
import { HallDataMap, FormData, RoomType, BudgetOption } from '@/types';
import { HALL_FACILITIES } from '@/lib/constants';

interface RecommendationPanelProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  aiAnalysis: string;
  isAnalyzing: boolean;
  onShowFacilities: (hallName: string) => void;
  onResubmit: () => void;
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  formData,
  setFormData,
  aiAnalysis,
  isAnalyzing,
  onShowFacilities,
  onResubmit
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new analysis arrives
  useEffect(() => {
    if (aiAnalysis && panelRef.current) {
      panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [aiAnalysis]);

  // Helper for form manipulation
  const toggleRoomType = (type: RoomType) => {
    setFormData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(type) 
        ? prev.roomTypes.filter(t => t !== type)
        : [...prev.roomTypes, type]
    }));
  };

  const removePriority = (index: number) => {
    setFormData(prev => ({
      ...prev,
      priorities: prev.priorities.filter((_, i) => i !== index)
    }));
  };

  const addPriority = (val: string) => {
     if(!val) return;
     setFormData(prev => ({
       ...prev,
       priorities: [...prev.priorities, val]
     }));
  };

  const [customPriority, setCustomPriority] = React.useState('');

  // Extract recommended halls from analysis text (simple keyword matching for demo)
  // In a real app, the LLM would return a structured JSON list of IDs.
  const recommendedHalls = Object.keys(HALL_FACILITIES).filter(hall => 
    aiAnalysis.includes(hall)
  );
  
  // Default to showing top 3 if none specific found (fallback)
  const displayHalls = recommendedHalls.length > 0 
    ? recommendedHalls 
    : ['Hall IV', 'Hall II', 'Hall I'];

  return (
    <div className="hidden md:flex md:w-[45%] flex-col bg-white h-full border-l border-gray-200">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white z-10 sticky top-0">
        <h2 className="text-[#003366] font-bold text-lg flex items-center gap-2">
           Smart Analysis Report
        </h2>
        <div className="flex gap-2">
          {formData.roomTypes.slice(0, 2).map((t, i) => (
            <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">{t}</span>
          ))}
          {formData.roomTypes.length > 2 && <span className="text-[10px] text-gray-400">+{formData.roomTypes.length - 2}</span>}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50" ref={panelRef}>
        {!aiAnalysis ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 min-h-[400px]">
             {isAnalyzing ? (
               <>
                 <div className="relative">
                   <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
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
            {/* Analysis Box */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 mb-6 relative shadow-sm">
              <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
                <MessageSquare size={64} className="text-indigo-600" />
              </div>
              <h3 className="text-indigo-900 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Sparkles size={16} className="text-indigo-600" />
                Advisor's Review
              </h3>
              <p className="text-sm text-gray-700 leading-7 text-justify relative z-10 font-medium">
                {aiAnalysis}
              </p>
            </div>

            {/* Hall Cards */}
            {displayHalls.map((hallName) => {
              const hall = HALL_FACILITIES[hallName];
              if (!hall) return null;
              return (
                <div key={hallName} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#003366] transition-colors">{hall.name}</h3>
                    {hall.tags && hall.tags.length > 0 && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white uppercase tracking-wide ${hall.tagColor || 'bg-gray-500'}`}>
                        {hall.tags[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">{hall.features}</p>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => onShowFacilities(hallName)} 
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 hover:text-[#003366] transition-colors"
                    >
                      View Facilities
                    </button>
                    <button 
                      onClick={() => window.open('https://shrl.hkust.edu.hk/residential-halls/ug', '_blank')} 
                      className="px-4 py-2 rounded-lg bg-[#003366] text-white text-xs font-semibold hover:bg-[#002244] transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      Details <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Divider */}
            <div className="my-8 border-t border-gray-200 dashed"></div>
            
            {/* Resubmit Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-5 text-[#003366]">
                <Settings size={20} />
                <h3 className="font-bold text-base">Adjust & Re-analyze</h3>
              </div>
              
              <div className="space-y-5">
                {/* Budget */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Budget</label>
                  <div className="relative">
                    <select 
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value as BudgetOption})}
                      className="w-full bg-gray-50 text-gray-700 rounded-lg p-3 pr-8 text-sm focus:ring-2 focus:ring-[#003366]/20 border border-gray-200 outline-none font-medium appearance-none"
                    >
                      <option>HK$ 2000 - 3000</option>
                      <option>HK$ 3000 - 5000</option>
                      <option>HK$ 5000 - 8000</option>
                      <option>HK$ 8000+</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Room Types */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Room Type</label>
                  <div className="flex flex-wrap gap-2">
                    {(['Single Room', 'Double Room', 'Triple Room', 'En-suite', 'Sea View'] as RoomType[]).map(type => (
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
                </div>

                {/* Priorities */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Priorities</label>
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addPriority(customPriority);
                          setCustomPriority('');
                        }
                      }}
                      placeholder="e.g., Quiet..." 
                      className="flex-1 bg-gray-50 text-gray-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#003366]/20 border border-gray-200"
                    />
                    <button 
                      onClick={() => {
                        addPriority(customPriority);
                        setCustomPriority('');
                      }} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg px-3 flex items-center justify-center border border-gray-200"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={onResubmit} 
                  disabled={isAnalyzing}
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all mt-4 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:transform-none"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Updating Analysis...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Update Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationPanel;