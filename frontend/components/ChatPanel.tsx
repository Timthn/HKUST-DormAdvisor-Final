'use client'

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Menu, Send, LogOut } from 'lucide-react';
import { Message } from '@/types';
import { BOT_AVATAR_URL } from '@/lib/constants';

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isTyping,
  inputText,
  setInputText,
  onSendMessage,
  onToggleSidebar,
  onLogout,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      onSendMessage();
    }
  };

  return (
    <div className="w-full md:w-[55%] flex flex-col border-r border-gray-200 bg-[#f7f9fc] relative">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
             <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-gray-800 font-bold tracking-wide text-sm">HKUST Dorm Advisor</h1>
            <span className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full mb-6 ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
            {msg.sender === 'bot' && (
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 mr-3 mt-1 flex-shrink-0 shadow-sm overflow-hidden">
                <img src={BOT_AVATAR_URL} alt="Bot" className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.sender === 'bot' 
                ? 'bg-white text-gray-700 rounded-tl-none border border-gray-100 chat-markdown overflow-x-auto' 
                : 'bg-[#2b5dad] text-white rounded-tr-none whitespace-pre-line'
            }`}>
              {msg.sender === 'bot' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex w-full mb-6 justify-start animate-pulse">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-100 mr-3 mt-1"></div>
              <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none border border-gray-100 text-xs text-gray-400">
                Thinking...
              </div>
           </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="max-w-3xl mx-auto relative flex items-center gap-2">
          <div className="flex-1 relative group">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about dorms (e.g., 'Does Hall 6 have a sea view?')"
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm py-3.5 pl-5 pr-5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all"
            />
          </div>
          <button 
            onClick={onSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-[#2b5dad] text-white p-3.5 rounded-full hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-300 disabled:shadow-none transform active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;