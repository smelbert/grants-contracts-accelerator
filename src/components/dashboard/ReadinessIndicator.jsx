import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Shield } from 'lucide-react';

const STATUS_CONFIG = {
  pre_funding: {
    label: 'Foundation Building',
    color: 'amber',
    icon: Clock,
    description: 'Focus on building infrastructure before pursuing funding',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    iconBg: 'bg-amber-100',
  },
  grant_eligible: {
    label: 'Grant-Eligible',
    color: 'emerald',
    icon: CheckCircle2,
    description: 'Ready to pursue grant opportunities',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
  },
  contract_ready: {
    label: 'Contract-Ready',
    color: 'blue',
    icon: Shield,
    description: 'Prepared for government contracts and RFPs',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    iconBg: 'bg-blue-100',
  },
  relationship_building: {
    label: 'Relationship Building',
    color: 'violet',
    icon: TrendingUp,
    description: 'Focus on building funder relationships',
    bgClass: 'bg-violet-50',
    textClass: 'text-violet-700',
    borderClass: 'border-violet-200',
    iconBg: 'bg-violet-100',
  },
  scaling: {
    label: 'Scaling & Sustainability',
    color: 'indigo',
    icon: TrendingUp,
    description: 'Ready for diversified funding strategies',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
  },
};

export default function ReadinessIndicator({ status, showDescription = true, size = 'default' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pre_funding;
  const Icon = config.icon;

  if (size === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgClass} ${config.borderClass} border`}>
        <Icon className={`w-4 h-4 ${config.textClass}`} />
        <span className={`text-sm font-medium ${config.textClass}`}>{config.label}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl ${config.bgClass} ${config.borderClass} border`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.iconBg}`}>
          <Icon className={`w-5 h-5 ${config.textClass}`} />
        </div>
        <div>
          <p className={`font-semibold ${config.textClass}`}>{config.label}</p>
          {showDescription && (
            <p className="text-sm text-slate-600 mt-1">{config.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}