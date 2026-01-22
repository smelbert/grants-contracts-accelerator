import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Lock } from 'lucide-react';

const LANE_CONFIG = {
  grants: {
    title: 'Grants & Foundations',
    description: 'Foundation grants, government grants, and fellowships',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
  contracts: {
    title: 'Contracts & RFPs',
    description: 'Government contracts and procurement opportunities',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  donors: {
    title: 'Donors & Philanthropy',
    description: 'Individual donors, major gifts, and fundraising',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
  },
  public_funds: {
    title: 'Public Funding & Civic',
    description: 'City and county funding, civic engagement',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
};

export default function FundingLaneCard({ lane, icon: Icon, isAccessible = true, progress = 0 }) {
  const config = LANE_CONFIG[lane];

  return (
    <motion.div
      whileHover={isAccessible ? { y: -4 } : {}}
      className={`relative overflow-hidden rounded-2xl border ${config.borderColor} ${isAccessible ? 'cursor-pointer' : 'opacity-75'}`}
    >
      <Link to={isAccessible ? createPageUrl(`FundingLane?lane=${lane}`) : '#'} className="block">
        {/* Gradient header */}
        <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
        
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${config.iconBg}`}>
              <Icon className={`w-6 h-6 ${config.textColor}`} />
            </div>
            {!isAccessible && (
              <div className="p-2 bg-slate-100 rounded-lg">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-900">{config.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Readiness</span>
              <span className={config.textColor}>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${config.gradient}`}
              />
            </div>
          </div>

          {isAccessible && (
            <div className={`mt-4 flex items-center text-sm font-medium ${config.textColor}`}>
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}