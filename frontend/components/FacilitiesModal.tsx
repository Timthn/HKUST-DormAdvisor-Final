'use client'

import React from 'react'
import { X, ExternalLink, CheckCircle } from 'lucide-react'
import type { HallRecommendationItem, PriceInfoByType } from '@/types'

const isPriceObject = (value: HallRecommendationItem['price_info']): value is PriceInfoByType => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

interface FacilitiesModalProps {
  hall: HallRecommendationItem | null
  onClose: () => void
}

export default function FacilitiesModal({ hall, onClose }: FacilitiesModalProps) {
  if (!hall) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">

        {/* Hero Image */}
        <div className="relative h-52 bg-gray-200 overflow-hidden">
          {hall.image_url ? (
            <img src={hall.image_url} alt={hall.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#003366] to-[#002244]" />
          )}
          {/* Hall name overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
            <h3 className="text-2xl font-bold text-white">{hall.name}</h3>
            <p className="text-white/80 text-sm mt-0.5 line-clamp-1">{hall.reason}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Prices */}
          <div className="mb-6">
            {isPriceObject(hall.price_info) ? (
              <>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">
                  Prices by Identity
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {hall.price_info.new_local && (
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                        New Local
                      </div>
                      <div className="font-bold text-[#003366] text-sm leading-snug">
                        {hall.price_info.new_local}
                      </div>
                    </div>
                  )}
                  {hall.price_info.continuing_local && (
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                        Continuing Local
                      </div>
                      <div className="font-bold text-[#003366] text-sm leading-snug">
                        {hall.price_info.continuing_local}
                      </div>
                    </div>
                  )}
                  {hall.price_info.new_non_local && (
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                        New Non-Local
                      </div>
                      <div className="font-bold text-[#003366] text-sm leading-snug">
                        {hall.price_info.new_non_local}
                      </div>
                    </div>
                  )}
                  {hall.price_info.continuing_non_local && (
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                        Continuing Non-Local
                      </div>
                      <div className="font-bold text-[#003366] text-sm leading-snug">
                        {hall.price_info.continuing_non_local}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Price
                </span>
                <span className="font-bold text-[#003366] text-lg">
                  {hall.price_info || '—'}
                </span>
              </div>
            )}
          </div>

          {/* Facilities */}
          {hall.facilities && hall.facilities.length > 0 && (
            <>
              <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">
                Facilities &amp; Amenities
              </h4>
              <ul className="space-y-2.5 mb-6">
                {hall.facilities.map((facility, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-[#003366] flex-shrink-0" />
                    {facility}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
            >
              Back to Chat
            </button>
            <button
              onClick={() => hall.website_url && window.open(hall.website_url, '_blank')}
              disabled={!hall.website_url}
              className="flex-1 bg-[#003366] hover:bg-[#002244] text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              View website
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
