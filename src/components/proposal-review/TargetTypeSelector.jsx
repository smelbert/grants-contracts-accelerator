import React from 'react';
import { cn } from '@/lib/utils';
import { Award, ClipboardCheck, Heart } from 'lucide-react';

const TYPES = [
  {
    key: 'grant',
    label: 'Grant',
    icon: Award,
    description: 'Foundation, government, or institutional grant application',
  },
  {
    key: 'rfp',
    label: 'RFP / RFI',
    icon: ClipboardCheck,
    description: 'Organizational procurement — RFP, RFI, or RFQ response',
  },
  {
    key: 'donor',
    label: 'Donor Pitch',
    icon: Heart,
    description: 'Case for support to an individual, corporate, or foundation donor',
  },
];

export default function TargetTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {TYPES.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              'text-left rounded-xl border p-4 transition-all',
              active
                ? 'border-[#143A50] bg-[#143A50]/5 ring-2 ring-[#143A50]/20'
                : 'border-slate-200 bg-white hover:border-[#143A50]/40 hover:bg-slate-50'
            )}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                  active ? 'bg-[#143A50] text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                <t.icon className="w-5 h-5" />
              </div>
              <span className={cn('font-semibold', active ? 'text-[#143A50]' : 'text-slate-800')}>
                {t.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}