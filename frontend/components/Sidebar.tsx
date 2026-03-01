'use client'

import React from 'react'
import { LayoutGrid, Plus, LogOut } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onLogout: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onLogout,
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
            Menu
          </h2>
          <p className="text-blue-200 text-xs mt-1">HKUST Dorm Advisor</p>
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

        <div className="flex-1" />

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
  )
}

export default Sidebar
