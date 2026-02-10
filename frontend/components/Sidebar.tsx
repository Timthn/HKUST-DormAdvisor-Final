'use client'

import React from 'react';
import { LayoutGrid, Plus, Clock, Trash2, LogOut } from 'lucide-react';
import { Session } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  currentSessionId: string | null;
  onSwitchSession: (session: Session) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSwitchSession,
  onNewChat,
  onDeleteSession,
  onLogout
}) => {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 bg-[#003366] text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <LayoutGrid size={20} />
            History
          </h2>
          <p className="text-blue-200 text-xs mt-1">Previous Consultations</p>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <button 
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#003366] font-bold py-3 rounded-xl transition-colors border border-blue-200"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-10">
              <Clock className="mx-auto mb-3 opacity-30" size={40} />
              <p>No history yet</p>
            </div>
          ) : (
            sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => onSwitchSession(session)}
                className={`p-3.5 rounded-xl cursor-pointer border transition-all relative group ${
                  currentSessionId === session.id 
                    ? 'bg-[#003366] border-[#003366] text-white shadow-lg' 
                    : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm truncate pr-6 block">{session.title}</span>
                  <button 
                    onClick={(e) => onDeleteSession(e, session.id)}
                    className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md ${
                      currentSessionId === session.id ? 'hover:bg-blue-800 text-blue-200' : 'hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className={`text-[10px] flex items-center gap-1.5 ${
                  currentSessionId === session.id ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  <Clock size={10} />
                  {new Date(session.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 text-sm w-full px-4 py-3 rounded-xl transition-colors font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;