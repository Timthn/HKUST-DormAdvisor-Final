'use client'

import React, { useState } from 'react';
import { Home, ShieldCheck, X, User, Lock, ArrowRight } from 'lucide-react';
import { BACKGROUND_IMAGE, COLORS } from '@/lib/constants';

interface LandingPageProps {
  onLogin: () => void;
  onGuest: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onGuest }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[#003366]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#003366]/90 mix-blend-multiply z-10"></div>
        {/* Background Image */}
        <div className="absolute inset-0 opacity-80" 
             style={{ 
               backgroundImage: `url("${BACKGROUND_IMAGE}")`, 
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}>
        </div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center justify-center gap-2 mb-6 text-white/90 uppercase tracking-[0.2em] text-sm font-semibold">
            <Home size={18} /> HKUST Dorm
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-2xl">
            Welcome Home.
          </h1>
          <p className="text-xl md:text-2xl text-blue-50 font-light max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
            Find your perfect dorm at HKUST with AI-powered guidance.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#C5A059] hover:bg-[#b08d4a] text-white text-lg font-bold py-4 px-12 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 animate-in fade-in zoom-in duration-1000 delay-200 flex items-center gap-3 backdrop-blur-sm bg-opacity-95"
        >
          <ShieldCheck size={20} />
          Login with School Account
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={24} />
            </button>
            
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Home className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-[#003366] mb-1">HKUST Dorm</h2>
              <p className="text-gray-500 text-sm mb-8">Sign in with your ITSC account</p>
              
              <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                <div className="space-y-5 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ITSC ID / Email</label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                      <input type="text" placeholder="chan@connect.ust.hk" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                      <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 outline-none transition-all font-medium" />
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full bg-[#003366] text-white font-bold py-3.5 rounded-lg hover:bg-[#002244] transition-all mt-4 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-95">
                    Enter System <ArrowRight size={18} />
                  </button>
                </div>
              </form>
              
              <div className="mt-8 flex justify-between text-xs font-medium text-gray-400 border-t border-gray-100 pt-6">
                <span className="cursor-pointer hover:text-[#003366] transition-colors">Forgot Password?</span>
                <span className="cursor-pointer hover:text-[#003366] transition-colors" onClick={onGuest}>Continue as Guest</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
