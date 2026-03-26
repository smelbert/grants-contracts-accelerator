import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, DollarSign, Target, Building2, CheckCircle2 } from 'lucide-react';

function FitScoreBadge({ score }) {
  const color = score >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : score >= 60 ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${color}`}>
      <Target className="w-3.5 h-3.5" />
      {score}% Match
    </div>
  );
}

export default function GrantResultCard({ grant }) {
  return (
    <Card className="bg-white border border-slate-200 hover:border-[#143A50]/30 hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#143A50] text-lg leading-snug line-clamp-2">
              {grant.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-600 truncate">{grant.funder}</span>
              {grant.source_type && (
                <Badge variant="outline" className="text-xs capitalize">
                  {grant.source_type}
                </Badge>
              )}
            </div>
          </div>
          {grant.fit_score && <FitScoreBadge score={grant.fit_score} />}
        </div>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
          {grant.summary}
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm mb-4">
          {grant.amount && (
            <div className="flex items-center gap-1.5 text-slate-700">
              <DollarSign className="w-4 h-4 text-[#E5C089]" />
              <span className="font-medium">{grant.amount}</span>
            </div>
          )}
          {grant.deadline && (
            <div className="flex items-center gap-1.5 text-slate-700">
              <Calendar className="w-4 h-4 text-[#AC1A5B]" />
              <span>{grant.deadline}</span>
            </div>
          )}
          {grant.eligibility && (
            <div className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="truncate max-w-xs">{grant.eligibility}</span>
            </div>
          )}
        </div>

        {grant.match_reasons?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {grant.match_reasons.map((reason, i) => (
              <Badge key={i} className="bg-[#143A50]/5 text-[#143A50] border border-[#143A50]/10 text-xs font-normal">
                {reason}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {grant.rfp_url && (
            <a href={grant.rfp_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] text-white">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Apply
              </Button>
            </a>
          )}
          {grant.details_url && (
            <a href={grant.details_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}