import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, MapPin, ExternalLink, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const READINESS_CONFIG = {
  ready: {
    label: 'Good Fit',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  partial: {
    label: 'Partial Fit',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  not_ready: {
    label: 'Not Ready Yet',
    icon: AlertTriangle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

const LANE_COLORS = {
  grants: 'bg-emerald-500',
  contracts: 'bg-blue-500',
  donors: 'bg-violet-500',
  public_funds: 'bg-amber-500',
};

export default function OpportunityCard({ opportunity, readinessStatus = 'ready', onViewDetails }) {
  const readinessConfig = READINESS_CONFIG[readinessStatus];
  const ReadinessIcon = readinessConfig.icon;

  const formatAmount = (min, max) => {
    const formatter = (val) => {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
      return `$${val}`;
    };
    if (min && max) return `${formatter(min)} - ${formatter(max)}`;
    if (max) return `Up to ${formatter(max)}`;
    if (min) return `From ${formatter(min)}`;
    return 'Varies';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-slate-100 transition-all duration-300"
    >
      {/* Lane indicator */}
      <div className={`h-1 ${LANE_COLORS[opportunity.funding_lane]}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 line-clamp-2">{opportunity.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{opportunity.funder_name}</p>
          </div>
          <Badge variant="outline" className={readinessConfig.className}>
            <ReadinessIcon className="w-3 h-3 mr-1" />
            {readinessConfig.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <div className="flex items-center text-slate-600">
            <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
            {formatAmount(opportunity.amount_min, opportunity.amount_max)}
          </div>
          {opportunity.deadline && (
            <div className="flex items-center text-slate-600">
              <Calendar className="w-4 h-4 mr-1 text-slate-400" />
              {format(new Date(opportunity.deadline), 'MMM d, yyyy')}
            </div>
          )}
          {opportunity.geographic_focus && (
            <div className="flex items-center text-slate-600">
              <MapPin className="w-4 h-4 mr-1 text-slate-400" />
              {opportunity.geographic_focus}
            </div>
          )}
        </div>

        {/* Eligibility summary */}
        {opportunity.eligibility_summary && (
          <p className="mt-3 text-sm text-slate-500 line-clamp-2">
            {opportunity.eligibility_summary}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(opportunity)}
            className="flex-1"
          >
            View Details
          </Button>
          {opportunity.application_url && readinessStatus === 'ready' && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => window.open(opportunity.application_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Apply
            </Button>
          )}
        </div>

        {/* Warning for not ready */}
        {readinessStatus === 'not_ready' && (
          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              This opportunity may not align with your current readiness level. Consider focusing on building capacity first.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}