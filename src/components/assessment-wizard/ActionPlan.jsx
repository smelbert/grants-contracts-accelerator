import React from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import { PRIORITY_LABELS } from '@/lib/assessmentConfig';

export default function ActionPlan({ actionPlan }) {
  if (!actionPlan || actionPlan.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5C089]/30 p-6">
        <h3 className="text-lg font-serif text-[#143A50] mb-2">Action Plan</h3>
        <p className="text-sm text-slate-600">All items checked — no gaps to address.</p>
      </div>
    );
  }

  const fixFirst = actionPlan.filter(a => a.rank <= 1);
  const strengthen = actionPlan.filter(a => a.rank >= 2);

  return (
    <div className="space-y-6">
      {/* Fix these first */}
      {fixFirst.length > 0 && (
        <div className="bg-[#AC1A5B]/5 rounded-2xl border border-[#AC1A5B]/20 p-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-[#AC1A5B]" />
            <h3 className="text-lg font-serif text-[#AC1A5B]">Fix these first</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            {fixFirst.length} critical {fixFirst.length === 1 ? 'item is' : 'items are'} blocking your submission — these gate items must be resolved before you apply. Nothing else matters until these are handled.
          </p>
          <div className="space-y-2">
            {fixFirst.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#AC1A5B]/10">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#AC1A5B] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${PRIORITY_LABELS[item.rank].badgeClass}`}>{PRIORITY_LABELS[item.rank].label}</span>
                    <span className="text-[10px] text-slate-500">{item.trackName} · {item.levelName}</span>
                    {item.is_gate && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#E5C089]/20 text-[#7E5F22]"><Lock className="w-2.5 h-2.5" /> gate</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Then strengthen these */}
      {strengthen.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5C089]/30 p-6">
          <h3 className="text-lg font-serif text-[#143A50] mb-1">Then strengthen these</h3>
          <p className="text-sm text-slate-600 mb-4">
            Foundational items unlock the rest of your readiness; competitive-edge items set you apart. Work through these in order.
          </p>
          <div className="space-y-2">
            {strengthen.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[#F9F4EF] rounded-lg">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center ${PRIORITY_LABELS[item.rank].badgeClass}`}>{fixFirst.length + i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${PRIORITY_LABELS[item.rank].badgeClass}`}>{PRIORITY_LABELS[item.rank].label}</span>
                    <span className="text-[10px] text-slate-500">{item.trackName} · {item.levelName}</span>
                  </div>
                  <p className="text-sm text-slate-800">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}