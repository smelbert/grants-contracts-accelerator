import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, DollarSign, Calendar, Bookmark, BookmarkCheck,
  ExternalLink, MapPin, TrendingUp, X, ShieldCheck,
  AlertTriangle, Flag, Clock, Archive, ChevronRight,
  Link2, CheckCircle2, RefreshCw, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, isPast, isWithinInterval, addDays } from 'date-fns';
import QuickPasteOpportunity from '@/components/opportunities/QuickPasteOpportunity';

// Grants = emerald/green, Contracts = blue/indigo, Donors = purple/pink, Public = amber/orange
const LANE_CONFIG = {
  grants:       { color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-800 border-emerald-300', bar: 'from-emerald-400 to-green-500',   cardBorder: 'border-l-emerald-400', hoverBorder: 'hover:border-emerald-300' },
  contracts:    { color: 'bg-blue-600',    light: 'bg-blue-50 text-blue-800 border-blue-300',          bar: 'from-blue-500 to-indigo-600',     cardBorder: 'border-l-blue-500',    hoverBorder: 'hover:border-blue-300' },
  donors:       { color: 'bg-purple-500',  light: 'bg-purple-50 text-purple-800 border-purple-300',   bar: 'from-purple-500 to-pink-500',     cardBorder: 'border-l-purple-400',  hoverBorder: 'hover:border-purple-300' },
  public_funds: { color: 'bg-amber-500',   light: 'bg-amber-50 text-amber-800 border-amber-300',      bar: 'from-amber-400 to-orange-500',    cardBorder: 'border-l-amber-400',   hoverBorder: 'hover:border-amber-300' },
};

const TYPE_LABELS = {
  grant: 'Grant', contract: 'Contract', rfp: 'RFP', rfq: 'RFQ',
  donor_program: 'Donor Program', public_fund: 'Public Fund', rfi: 'RFI'
};

function DeadlineBadge({ deadline, rolling }) {
  if (rolling) return (
    <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
      <RefreshCw className="w-3 h-3" /> Rolling
    </span>
  );
  if (!deadline) return null;
  const d = new Date(deadline);
  const daysLeft = differenceInDays(d, new Date());
  if (isPast(d)) return (
    <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0.5">
      <Archive className="w-3 h-3" /> Expired
    </span>
  );
  if (daysLeft <= 7) return (
    <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5 font-semibold animate-pulse">
      <Clock className="w-3 h-3" /> {daysLeft}d left!
    </span>
  );
  if (daysLeft <= 30) return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
      <Clock className="w-3 h-3" /> {daysLeft}d left
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-600 border border-slate-200 rounded-full px-2 py-0.5">
      <Calendar className="w-3 h-3" /> Due {format(d, 'MMM d, yyyy')}
    </span>
  );
}

function ValidationBadge({ vettingInfo, aiVetted }) {
  if (!aiVetted && !vettingInfo) return (
    <span className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-500 border border-slate-200 rounded-full px-2 py-0.5">
      <Clock className="w-3 h-3" /> Pending Review
    </span>
  );
  if (vettingInfo && !vettingInfo.is_legitimate) return (
    <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5">
      <AlertTriangle className="w-3 h-3" /> Flagged
    </span>
  );
  if (vettingInfo?.is_legitimate && vettingInfo?.score >= 80) return (
    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
      <ShieldCheck className="w-3 h-3" /> Verified
    </span>
  );
  if (aiVetted) return (
    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
      <ShieldCheck className="w-3 h-3" /> Vetted
    </span>
  );
  return null;
}

function AmountDisplay({ min, max }) {
  if (!min && !max) return null;
  const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
      <DollarSign className="w-3.5 h-3.5" />
      {min ? fmt(min) : ''}{min && max ? ' – ' : ''}{max ? fmt(max) : (min ? '+' : '')}
    </span>
  );
}

function OpportunityCard({ opp, isSaved, onSave, onUnsave, onClick, onReport, vettingInfo, dim = false }) {
  const lane = LANE_CONFIG[opp.funding_lane] || LANE_CONFIG.grants;
  const deadline = opp.deadline || opp.deadline_full;

  return (
    <div
      className={`group relative bg-white rounded-2xl border-l-4 border border-slate-200 ${lane.hoverBorder} hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${lane.cardBorder} ${dim ? 'opacity-60' : ''}`}
      onClick={onClick}
    >

      <div className="pl-4 pr-4 pt-4 pb-3 flex-1">
        {/* Top row: badges + bookmark */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${lane.light}`}>
              {TYPE_LABELS[opp.type] || opp.type}
            </span>
            <ValidationBadge vettingInfo={vettingInfo} aiVetted={opp.ai_vetted} />
            <DeadlineBadge deadline={deadline} rolling={opp.rolling_deadline} />
          </div>
          <button
            className="shrink-0 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            onClick={(e) => { e.stopPropagation(); isSaved ? onUnsave() : onSave(); }}
          >
            {isSaved
              ? <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              : <Bookmark className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            }
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-[#143A50] transition-colors">
          {opp.title}
        </h3>

        {/* Funder */}
        {opp.funder_name && (
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
            <Building2 className="w-3 h-3" /> {opp.funder_name}
          </p>
        )}

        {/* Description */}
        {opp.description && (
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">{opp.description}</p>
        )}

        {/* Key metrics row */}
        <div className="flex flex-wrap items-center gap-3">
          <AmountDisplay min={opp.amount_min} max={opp.amount_max} />
          {opp.geographic_focus && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {opp.geographic_focus}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <ChevronRight className="w-3 h-3" /> Click to view details
        </span>
        <button
          className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
          onClick={(e) => { e.stopPropagation(); onReport(); }}
        >
          <Flag className="w-3 h-3" /> Report
        </button>
      </div>
    </div>
  );
}

function OpportunityDetailModal({ opp, isSaved, onClose, onSave, onUnsave, onReport, vettingInfo }) {
  const lane = LANE_CONFIG[opp.funding_lane] || LANE_CONFIG.grants;
  const deadline = opp.deadline || opp.deadline_full;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Gradient header */}
        <div className={`h-3 bg-gradient-to-r ${lane.bar} w-full`} />
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${lane.light}`}>
                {TYPE_LABELS[opp.type] || opp.type}
              </span>
              <ValidationBadge vettingInfo={vettingInfo} aiVetted={opp.ai_vetted} />
              <DeadlineBadge deadline={deadline} rolling={opp.rolling_deadline} />
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mt-1">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{opp.title}</h2>
          {opp.funder_name && <p className="text-slate-600 flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {opp.funder_name}</p>}
        </div>

        <div className="p-6 space-y-6">
          {/* Key info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(opp.amount_min || opp.amount_max) && (
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium mb-1">Award Amount</p>
                <AmountDisplay min={opp.amount_min} max={opp.amount_max} />
              </div>
            )}
            {deadline && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Deadline</p>
                <p className="text-sm font-semibold text-slate-900">{format(new Date(deadline), 'MMM d, yyyy')}</p>
              </div>
            )}
            {opp.rolling_deadline && (
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium mb-1">Deadline</p>
                <p className="text-sm font-semibold text-emerald-700">Rolling — Apply Anytime</p>
              </div>
            )}
            {opp.geographic_focus && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Geography</p>
                <p className="text-sm font-semibold text-slate-900">{opp.geographic_focus}</p>
              </div>
            )}
          </div>

          {opp.description && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">About This Opportunity</h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{opp.description}</p>
            </div>
          )}

          {opp.eligibility_summary && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Eligibility</h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{opp.eligibility_summary}</p>
            </div>
          )}

          {(opp.sector_focus?.length > 0 || opp.required_org_types?.length > 0) && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {opp.sector_focus?.map((s, i) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}
                {opp.required_org_types?.map((t, i) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}
              </div>
            </div>
          )}

          {/* Vetting panel */}
          {vettingInfo && (
            <div className={`rounded-xl p-4 border-2 ${vettingInfo.is_legitimate ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {vettingInfo.is_legitimate
                  ? <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                }
                <div>
                  <p className={`font-semibold mb-1 ${vettingInfo.is_legitimate ? 'text-green-900' : 'text-red-900'}`}>
                    {vettingInfo.is_legitimate ? `AI Verified (${vettingInfo.score}/100)` : 'Flagged for Review'}
                  </p>
                  <p className="text-sm text-slate-700">{vettingInfo.notes}</p>
                  {vettingInfo.red_flags?.length > 0 && (
                    <ul className="mt-2 text-xs text-slate-600 space-y-1">
                      {vettingInfo.red_flags.map((f, i) => <li key={i}>• {f}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
            <Button
              onClick={isSaved ? onUnsave : onSave}
              className={`flex-1 ${isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#143A50] hover:bg-[#1E4F58]'}`}
            >
              {isSaved ? <><BookmarkCheck className="w-4 h-4 mr-2" />Saved</> : <><Bookmark className="w-4 h-4 mr-2" />Save Opportunity</>}
            </Button>
            {(opp.application_url || opp.source_url) && (
              <Button variant="outline" className="flex-1" asChild>
                <a href={opp.application_url || opp.source_url} target="_blank" rel="noopener noreferrer">
                  Apply / Learn More <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
            <Button variant="ghost" onClick={onReport} className="text-slate-500 hover:text-red-600">
              <Flag className="w-4 h-4 mr-2" /> Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportDialog({ opp, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const reasons = [
    { value: 'suspicious_funder', label: 'Suspicious or unknown funder' },
    { value: 'unrealistic_amounts', label: 'Unrealistic funding amounts' },
    { value: 'fake_contact_info', label: 'Fake or invalid contact info' },
    { value: 'scam_indicators', label: 'Appears to be a scam' },
    { value: 'duplicate_listing', label: 'Duplicate listing' },
    { value: 'outdated_info', label: 'Outdated or incorrect information' },
    { value: 'other', label: 'Other concern' },
  ];
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6" onClick={onClose}>
      <Card className="max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Report Opportunity</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
          <CardDescription>Help keep the platform safe by flagging suspicious listings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-sm">
            <p className="font-medium text-slate-900 line-clamp-2">{opp.title}</p>
            <p className="text-slate-500 text-xs mt-0.5">{opp.funder_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm">
              <option value="">Select a reason...</option>
              {reasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Details (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" placeholder="Any additional context..." />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={() => onSubmit(reason, description)} disabled={!reason} className="flex-1 bg-red-600 hover:bg-red-700">
              <Flag className="w-4 h-4 mr-2" /> Submit Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OpportunitiesPage() {
  const [search, setSearch] = useState('');
  const [lane, setLane] = useState('all');
  const [type, setType] = useState('all');
  const [selected, setSelected] = useState(null);
  const [reportingOpp, setReportingOpp] = useState(null);
  const [quickPasteOpen, setQuickPasteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list('-created_date', 200),
  });

  const { data: savedOpportunities = [] } = useQuery({
    queryKey: ['saved-opportunities', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.OpportunityComment.filter({ user_email: user.email, is_saved: true });
    },
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: (opp) => base44.entities.OpportunityComment.create({ opportunity_id: opp.id, user_email: user.email, user_name: user.full_name, is_saved: true, comment_text: '' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['saved-opportunities'] }); toast.success('Saved!'); }
  });

  const unsaveMutation = useMutation({
    mutationFn: async (id) => {
      const s = savedOpportunities.find(x => x.opportunity_id === id);
      if (s) await base44.entities.OpportunityComment.delete(s.id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['saved-opportunities'] }); toast.success('Removed from saved'); }
  });

  const reportMutation = useMutation({
    mutationFn: ({ opportunityId, reason, description }) => base44.entities.OpportunityReport.create({ opportunity_id: opportunityId, reported_by_email: user.email, report_reason: reason, description: description || '', status: 'pending' }),
    onSuccess: () => { toast.success('Report submitted. Thank you!'); setReportingOpp(null); }
  });

  const isSaved = (id) => savedOpportunities.some(s => s.opportunity_id === id);
  const getVetting = (opp) => { try { return opp.ai_vetting_notes ? JSON.parse(opp.ai_vetting_notes) : null; } catch { return null; } };

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const matchesFilters = (opp) => {
    const matchSearch = !search || opp.title?.toLowerCase().includes(search.toLowerCase()) || opp.description?.toLowerCase().includes(search.toLowerCase()) || opp.funder_name?.toLowerCase().includes(search.toLowerCase());
    const matchLane = lane === 'all' || opp.funding_lane === lane;
    const matchType = type === 'all' || opp.type === type;
    return matchSearch && matchLane && matchType;
  };

  // Only show active (non-archived, non-expired)
  const activeOpps = opportunities.filter(opp => {
    if (opp.status === 'archived') return false;
    if (opp.rolling_deadline) return true;
    const d = opp.deadline || opp.deadline_full;
    return !d || !isPast(new Date(d));
  }).filter(matchesFilters);

  // Archived = past deadline OR explicitly archived
  const archivedOpps = opportunities.filter(opp => {
    if (opp.status === 'archived') return true;
    if (opp.rolling_deadline) return false;
    const d = opp.deadline || opp.deadline_full;
    return d && isPast(new Date(d));
  }).filter(matchesFilters);

  const savedOpps = activeOpps.filter(opp => isSaved(opp.id));

  // Sort active: closing soon first
  const sortedActive = [...activeOpps].sort((a, b) => {
    const da = a.rolling_deadline ? Infinity : (a.deadline || a.deadline_full ? new Date(a.deadline || a.deadline_full).getTime() : Infinity);
    const db = b.rolling_deadline ? Infinity : (b.deadline || b.deadline_full ? new Date(b.deadline || b.deadline_full).getTime() : Infinity);
    return da - db;
  });

  const urgentCount = sortedActive.filter(o => {
    const d = o.deadline || o.deadline_full;
    return d && differenceInDays(new Date(d), new Date()) <= 14;
  }).length;

  const renderGrid = (list, dim = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {list.map(opp => (
        <OpportunityCard
          key={opp.id}
          opp={opp}
          isSaved={isSaved(opp.id)}
          onSave={() => saveMutation.mutate(opp)}
          onUnsave={() => unsaveMutation.mutate(opp.id)}
          onClick={() => setSelected(opp)}
          onReport={() => setReportingOpp(opp)}
          vettingInfo={getVetting(opp)}
          dim={dim}
        />
      ))}
    </div>
  );

  const EmptyState = ({ icon: Icon, title, subtitle }) => (
    <div className="py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <p className="font-semibold text-slate-900 text-lg mb-1">{title}</p>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50] mx-auto mb-4" />
        <p className="text-slate-600">Loading opportunities...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#143A50] flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Funding Opportunities</h1>
              <p className="text-slate-500 text-sm mt-0.5">Discover grants, contracts & more matched to your mission</p>
            </div>
          </div>
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <Button onClick={() => setQuickPasteOpen(true)} className="bg-[#143A50] hover:bg-[#1E4F58] gap-2 shrink-0">
              <Link2 className="w-4 h-4" /> Add via URL or Text
            </Button>
          )}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Active', value: activeOpps.length, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { label: 'Closing Soon', value: urgentCount, color: urgentCount > 0 ? 'text-red-700 bg-red-50 border-red-200' : 'text-slate-600 bg-slate-50 border-slate-200' },
            { label: 'Saved', value: savedOpportunities.length, color: 'text-blue-700 bg-blue-50 border-blue-200' },
            { label: 'Archived', value: archivedOpps.length, color: 'text-slate-600 bg-slate-50 border-slate-200' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl border px-4 py-3 text-center ${color}`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search by title, funder, keywords..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-slate-50 border-slate-200" />
            </div>
            <div className="flex gap-2">
              <select value={lane} onChange={(e) => setLane(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-700 min-w-[130px]">
                <option value="all">All Lanes</option>
                <option value="grants">Grants</option>
                <option value="contracts">Contracts</option>
                <option value="donors">Donors</option>
                <option value="public_funds">Public Funds</option>
              </select>
              <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-700 min-w-[120px]">
                <option value="all">All Types</option>
                <option value="grant">Grant</option>
                <option value="contract">Contract</option>
                <option value="rfp">RFP</option>
                <option value="rfq">RFQ</option>
                <option value="donor_program">Donor Program</option>
                <option value="public_fund">Public Fund</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active">
          <TabsList className="mb-6 bg-white border border-slate-200 p-1 rounded-xl h-auto gap-1">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-[#143A50] data-[state=active]:text-white text-sm px-4 py-2">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Active ({sortedActive.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-lg data-[state=active]:bg-[#143A50] data-[state=active]:text-white text-sm px-4 py-2">
              <BookmarkCheck className="w-4 h-4 mr-1.5" /> Saved ({savedOpps.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="rounded-lg data-[state=active]:bg-[#143A50] data-[state=active]:text-white text-sm px-4 py-2">
              <Archive className="w-4 h-4 mr-1.5" /> Past / Archived ({archivedOpps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {urgentCount > 0 && (
              <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
                <Clock className="w-4 h-4 shrink-0" />
                <span><strong>{urgentCount} {urgentCount === 1 ? 'opportunity is' : 'opportunities are'}</strong> closing within 14 days — listed first.</span>
              </div>
            )}
            {sortedActive.length === 0
              ? <EmptyState icon={Search} title="No active opportunities found" subtitle="Try adjusting your search or filters" />
              : renderGrid(sortedActive)
            }
          </TabsContent>

          <TabsContent value="saved">
            {savedOpps.length === 0
              ? <EmptyState icon={Bookmark} title="No saved opportunities yet" subtitle="Click the bookmark icon on any opportunity to save it for later" />
              : renderGrid(savedOpps)
            }
          </TabsContent>

          <TabsContent value="archived">
            <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              <Archive className="w-4 h-4 shrink-0" />
              <span>These opportunities have passed their deadline or been archived. Save them to track for the next funding cycle.</span>
            </div>
            {archivedOpps.length === 0
              ? <EmptyState icon={Archive} title="No archived opportunities" subtitle="Expired opportunities will appear here automatically" />
              : renderGrid(archivedOpps, true)
            }
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail modal */}
      {selected && (
        <OpportunityDetailModal
          opp={selected}
          isSaved={isSaved(selected.id)}
          onClose={() => setSelected(null)}
          onSave={() => { saveMutation.mutate(selected); setSelected(null); }}
          onUnsave={() => { unsaveMutation.mutate(selected.id); setSelected(null); }}
          onReport={() => { setReportingOpp(selected); setSelected(null); }}
          vettingInfo={getVetting(selected)}
        />
      )}

      {/* Report dialog */}
      {reportingOpp && (
        <ReportDialog
          opp={reportingOpp}
          onClose={() => setReportingOpp(null)}
          onSubmit={(reason, desc) => reportMutation.mutate({ opportunityId: reportingOpp.id, reason, description: desc })}
        />
      )}

      {/* Quick paste */}
      <QuickPasteOpportunity
        open={quickPasteOpen}
        onClose={() => setQuickPasteOpen(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['opportunities'] })}
      />
    </div>
  );
}