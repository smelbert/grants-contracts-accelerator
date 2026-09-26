import React from 'react';
import { LEVEL_CONFIG } from '@/lib/cohortReadiness';

export default function LaneReadinessBadge({ level, score, size = 'sm' }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.not_ready;
  const padding = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${padding} font-medium whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
      {typeof score === 'number' && <span className="opacity-70">{score}</span>}
    </span>
  );
}