import React from 'react';
import { TRACKS } from '@/lib/assessmentConfig';

export default function TrackStep({ track, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-serif text-[#143A50] mb-1">Choose your track</h2>
      <p className="text-sm text-slate-600 mb-6">Select the funding path you'd like to assess. You can choose grants, contracts, or both.</p>
      <div className="space-y-3">
        {TRACKS.map(t => (
          <button
            key={t.value}
            onClick={() => onSelect(t.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              track === t.value
                ? 'border-[#143A50] bg-[#143A50]/5 shadow-sm'
                : 'border-slate-200 hover:border-[#E5C089] hover:bg-[#F9F4EF]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#143A50]">{t.label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{t.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                track === t.value ? 'border-[#143A50] bg-[#143A50]' : 'border-slate-300'
              }`}>
                {track === t.value && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}