import React from 'react';
import { LEVEL_NAMES } from '@/lib/assessmentConfig';

export default function ScoreCard({ trackKey, trackResult }) {
  const trackLabel = trackKey === 'grant' ? 'GRANT FUNDING' : 'PROPOSALS & CONTRACTS';
  const band = trackResult.band;

  return (
    <div className="bg-white rounded-2xl border border-[#E5C089]/30 p-6 sm:p-8 shadow-sm">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{trackLabel}</p>
      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-6xl font-serif text-[#143A50]">{trackResult.percent}%</span>
        <span className={`text-2xl font-serif ${band.textColorClass}`}>{band.label}</span>
      </div>
      <p className="text-sm text-slate-600 mb-4">{band.description}</p>
      <div className="border-l-2 border-[#E5C089] pl-4 mb-6">
        <p className="text-sm text-slate-700 italic">{band.interpretation}</p>
      </div>

      {/* Level sub-scores */}
      <div>
        <h4 className="text-sm font-semibold text-[#143A50] mb-3">Level Scores</h4>
        <div className="space-y-3">
          {trackResult.levelScores.map(ls => (
            <div key={ls.level}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600">Level {ls.level} · {LEVEL_NAMES[trackKey]?.[ls.level]}</span>
                <span className="text-xs font-medium text-[#143A50]">
                  {ls.scoreString} · {ls.percent}% · {ls.band.label}
                </span>
              </div>
              <div className="h-2 bg-[#F9F4EF] rounded-full overflow-hidden">
                <div className="h-full bg-[#143A50] rounded-full transition-all duration-500" style={{ width: `${ls.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}