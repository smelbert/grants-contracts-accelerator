import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  Loader2,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const buildContextFromOpportunity = (opp) => {
  const parts = [`Title: ${opp.title}`];
  if (opp.funder_name) parts.push(`Funder: ${opp.funder_name}`);
  if (opp.type) parts.push(`Type: ${opp.type}`);
  if (opp.funding_lane) parts.push(`Funding Lane: ${opp.funding_lane}`);
  if (opp.amount_min || opp.amount_max) {
    const min = opp.amount_min ? `$${Number(opp.amount_min).toLocaleString()}` : '';
    const max = opp.amount_max ? `$${Number(opp.amount_max).toLocaleString()}` : '';
    parts.push(`Funding Range: ${min || '—'} to ${max || '—'}`);
  }
  if (opp.eligibility_summary) parts.push(`Eligibility: ${opp.eligibility_summary}`);
  if (opp.description) parts.push(`Description: ${opp.description}`);
  return parts.join('\n');
};

export default function TargetContextPanel({
  contextLabel,
  contextPlaceholder,
  onContextChange,
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('paste'); // 'paste' | 'saved'
  const [pasted, setPasted] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['review-saved-opportunities'],
    queryFn: async () => {
      const list = await base44.entities.FundingOpportunity.list('-created_date', 50);
      return list || [];
    },
    enabled: open && mode === 'saved',
  });

  const filtered = (opportunities || []).filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.title || '').toLowerCase().includes(q) ||
      (o.funder_name || '').toLowerCase().includes(q)
    );
  });

  const handleModeChange = (m) => {
    setMode(m);
    if (m === 'paste') {
      onContextChange(pasted);
    } else {
      const sel = (opportunities || []).find((o) => o.id === selectedId);
      onContextChange(sel ? buildContextFromOpportunity(sel) : '');
    }
  };

  const handlePaste = (v) => {
    setPasted(v);
    onContextChange(v);
  };

  const handleSelect = (opp) => {
    setSelectedId(opp.id);
    onContextChange(buildContextFromOpportunity(opp));
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2 text-left">
          <ClipboardCheck className="w-4 h-4 text-[#143A50] flex-shrink-0" />
          <span className="font-semibold text-slate-800">{contextLabel}</span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            — optional, but recommended for a tailored review
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === 'paste' ? 'default' : 'outline'}
              className={cn(mode === 'paste' && 'bg-[#143A50] hover:bg-[#1E4F58]')}
              onClick={() => handleModeChange('paste')}
            >
              <FileText className="w-4 h-4" /> Paste Guidelines
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'saved' ? 'default' : 'outline'}
              className={cn(mode === 'saved' && 'bg-[#143A50] hover:bg-[#1E4F58]')}
              onClick={() => handleModeChange('saved')}
            >
              <Building2 className="w-4 h-4" /> Pick Saved Opportunity
            </Button>
          </div>

          {mode === 'paste' ? (
            <Textarea
              placeholder={contextPlaceholder}
              value={pasted}
              onChange={(e) => handlePaste(e.target.value)}
              rows={6}
              className="bg-white text-sm resize-none"
            />
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search saved opportunities by title or funder..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#143A50]/20"
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading saved opportunities...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-400">
                  No saved opportunities found. Save one on the Funding Opportunities page first,
                  or switch to paste mode.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {filtered.map((opp) => {
                    const selected = opp.id === selectedId;
                    return (
                      <button
                        key={opp.id}
                        type="button"
                        onClick={() => handleSelect(opp)}
                        className={cn(
                          'w-full text-left rounded-lg border p-3 transition-all',
                          selected
                            ? 'border-[#143A50] bg-[#143A50]/5 ring-1 ring-[#143A50]/30'
                            : 'border-slate-200 bg-white hover:border-[#143A50]/40'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{opp.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {opp.funder_name || 'Unknown funder'}
                              {opp.type ? ` · ${opp.type.toUpperCase()}` : ''}
                            </p>
                          </div>
                          {selected && (
                            <CheckCircle2 className="w-4 h-4 text-[#143A50] flex-shrink-0" />
                          )}
                        </div>
                        {opp.eligibility_summary && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {opp.eligibility_summary}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}