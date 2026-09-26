import React from 'react';
import { Lock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { LEVEL_NAMES, LEVEL_DESCRIPTIONS } from '@/lib/assessmentConfig';
import { scoreTrack } from '@/lib/assessmentScoring';

export default function ChecklistStep({ items, level, trackKey, responses, onToggle, allItems, structure }) {
  const trackLabel = trackKey === 'grant' ? 'Grant Funding' : 'Proposals & Contracts';
  const levelName = LEVEL_NAMES[trackKey]?.[level] || `Level ${level}`;
  const levelDesc = LEVEL_DESCRIPTIONS[trackKey]?.[level] || '';

  // Live level score
  const levelItems = items;
  let earned = 0, available = 0;
  levelItems.forEach(item => {
    available += item.points;
    if (responses[item.id]) earned += item.points;
  });
  const pct = available > 0 ? Math.round((earned / available) * 100) : 0;

  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-semibold text-[#7E5F22] uppercase tracking-wider">{trackLabel}</p>
        <h2 className="text-2xl font-serif text-[#143A50] mt-0.5">Level {level} of 3 · {levelName}</h2>
        {levelDesc && <p className="text-sm text-slate-600 mt-1 italic">{levelDesc}</p>}
      </div>

      {/* Live level score bar */}
      <div className="mb-5 p-3 bg-[#143A50]/5 rounded-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-[#143A50]">This level's score</span>
          <span className="text-xs font-semibold text-[#143A50]">{earned}/{available} pts · {pct}%</span>
        </div>
        <div className="h-1.5 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-[#143A50] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <label
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              responses[item.id] ? 'border-[#143A50] bg-[#143A50]/5' : 'border-slate-200 hover:border-[#E5C089] hover:bg-[#F9F4EF]'
            }`}
          >
            <Checkbox
              checked={responses[item.id] || false}
              onCheckedChange={() => onToggle(item.id)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <span className="text-sm text-slate-800">{item.text}</span>
              {item.is_gate && (
                <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E5C089]/20 text-[#7E5F22]">
                  <Lock className="w-2.5 h-2.5" /> gate
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{item.points}pt{item.points > 1 ? 's' : ''}</span>
          </label>
        ))}
      </div>
    </div>
  );
}