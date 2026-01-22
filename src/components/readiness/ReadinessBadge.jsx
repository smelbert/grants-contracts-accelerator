import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGE_CONFIG = {
  self_attested_ready: {
    icon: Shield,
    label: 'Self-Attested Ready',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Organization has self-attested readiness'
  },
  coach_verified_ready: {
    icon: ShieldCheck,
    label: 'Coach-Verified Ready',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    description: 'Organization readiness verified by coach'
  }
};

export default function ReadinessBadge({ type, fundingLane, compact = false, showTooltip = false }) {
  const config = BADGE_CONFIG[type] || BADGE_CONFIG.self_attested_ready;
  const Icon = config.icon;

  if (compact) {
    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.color}`}
    >
      <Icon className="w-5 h-5" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{config.label}</span>
        {fundingLane && (
          <span className="text-xs opacity-80 capitalize">{fundingLane} Ready</span>
        )}
      </div>
    </motion.div>
  );
}