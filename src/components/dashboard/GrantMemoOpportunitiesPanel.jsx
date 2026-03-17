import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, MapPin, Calendar, ExternalLink, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

function formatAmount(min, max) {
  if (!min && !max) return null;
  if (min && max && min !== max) {
    return `$${(min / 1000).toFixed(0)}K – $${(max / 1000).toFixed(0)}K`;
  }
  const val = min || max;
  return `$${val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val}`;
}

function DeadlineBadge({ deadline, rolling }) {
  if (rolling) return <Badge className="bg-blue-100 text-blue-700 text-xs">Rolling</Badge>;
  if (!deadline) return <Badge className="bg-slate-100 text-slate-500 text-xs">TBD</Badge>;
  const d = new Date(deadline);
  const now = new Date();
  const daysOut = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  const color = daysOut < 30 ? 'bg-red-100 text-red-700' : daysOut < 60 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
  return <Badge className={`text-xs ${color}`}>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Badge>;
}

function OpportunityCard({ opp }) {
  const [expanded, setExpanded] = useState(false);
  const amount = formatAmount(opp.amount_min, opp.amount_max);

  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-[#143A50]/40 hover:bg-slate-50/50 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm leading-tight">{opp.title}</p>
          {opp.funder_name && opp.funder_name !== opp.title && (
            <p className="text-xs text-slate-500 mt-0.5">{opp.funder_name}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {opp.application_url && (
            <a href={opp.application_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </a>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <DeadlineBadge deadline={opp.deadline} rolling={opp.rolling_deadline} />
        {amount && (
          <Badge className="bg-[#143A50]/10 text-[#143A50] text-xs flex items-center gap-1">
            <DollarSign className="w-3 h-3" />{amount}
          </Badge>
        )}
        {opp.geographic_focus && (
          <Badge className="bg-slate-100 text-slate-600 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" />{opp.geographic_focus.length > 30 ? opp.geographic_focus.substring(0, 28) + '…' : opp.geographic_focus}
          </Badge>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          {opp.description && (
            <p className="text-xs text-slate-700 leading-relaxed">{opp.description}</p>
          )}
          {opp.eligibility_requirements && (
            <div>
              <span className="text-xs font-medium text-slate-500">Match Requirement: </span>
              <span className="text-xs text-slate-700">{opp.eligibility_requirements}</span>
            </div>
          )}
          {opp.internal_notes && (
            <div>
              <span className="text-xs font-medium text-slate-500">Application Path: </span>
              <span className="text-xs text-slate-700">{opp.internal_notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GrantMemoOpportunitiesPanel({ opportunities = [] }) {
  const [showAll, setShowAll] = useState(false);

  // Filter to memo-imported ones (no source_platform, active, grants lane)
  const memoOpps = opportunities.filter(o =>
    o.is_active &&
    o.funding_lane === 'grants' &&
    !o.source_platform &&
    !o.ai_scanned
  );

  if (memoOpps.length === 0) return null;

  const displayed = showAll ? memoOpps : memoOpps.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="w-4 h-4 text-[#143A50]" />
            Curated Grant Opportunities
          </CardTitle>
          <Badge className="bg-[#E5C089]/30 text-[#143A50]">{memoOpps.length} opportunities</Badge>
        </div>
        <p className="text-xs text-slate-500">Grants researched and vetted for your organization type</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayed.map(opp => (
          <OpportunityCard key={opp.id} opp={opp} />
        ))}
        {memoOpps.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[#143A50]"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show ${memoOpps.length - 5} More`}
            {showAll ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}