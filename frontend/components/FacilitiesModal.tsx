'use client'

import React from 'react';
import { X, Wind, LayoutGrid, Dumbbell, Coffee, Shirt, ExternalLink } from 'lucide-react';
import { HallDetails } from '@/types';

interface FacilitiesModalProps {
  hall: HallDetails | null;
  onClose: () => void;
}

const FacilitiesModal: React.FC<FacilitiesModalProps> = ({ hall, onClose }) => {
  if (!hall) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-[#003366] p-6 text-white flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {hall.name} Facilities
            </h3>
            <p className="text-blue-200 text-sm mt-1 leading-relaxed opacity-90">{hall.features}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Avg. Price</span>
              <span className="font-bold text-[#003366] text-lg">{hall.avgPrice}</span>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Room Types</span>
              <span className="font-bold text-[#003366] text-lg">{hall.roomTypes}</span>
            </div>
          </div>

          <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide border-b pb-2">Amenities</h4>
          <ul className="space-y-4 text-sm text-gray-600">
            <li className="flex items-center justify-between group">
              <span className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <Wind size={18} className="text-gray-500 group-hover:text-blue-500"/>
                </div>
                 Air Conditioning
              </span>
              <span className="font-medium text-gray-900">{hall.ac}</span>
            </li>
            <li className="flex items-center justify-between group">
              <span className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <LayoutGrid size={18} className="text-gray-500 group-hover:text-blue-500"/>
                </div>
                 Bathroom
              </span>
              <span className="font-medium text-gray-900">{hall.bathroom}</span>
            </li>
            <li className="flex items-center justify-between group">
              <span className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <Dumbbell size={18} className="text-gray-500 group-hover:text-blue-500"/>
                </div>
                 Gym
              </span>
              <span className="font-medium text-gray-900">{hall.gym}</span>
            </li>
            <li className="flex items-center justify-between group">
              <span className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <Coffee size={18} className="text-gray-500 group-hover:text-blue-500"/>
                </div>
                 Common Space
              </span>
              <span className="font-medium text-gray-900">{hall.common}</span>
            </li>
            <li className="flex items-center justify-between group">
              <span className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <Shirt size={18} className="text-gray-500 group-hover:text-blue-500"/>
                </div>
                 Laundry
              </span>
              <span className="font-medium text-gray-900">{hall.laundry}</span>
            </li>
          </ul>

          <div className="mt-8 flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-colors"
            >
              Close
            </button>
            <button 
              onClick={() => window.open('https://shrl.hkust.edu.hk/residential-halls/ug', '_blank')} 
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white font-bold py-3 rounded-xl transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Book via Official Site
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesModal;