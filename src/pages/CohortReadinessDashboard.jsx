import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Search, BarChart3, Building2, TrendingUp } from 'lucide-react';
import {
  FUNDING_LANES,
  LEVEL_CONFIG,
  LEVEL_ORDER,
  computeLaneReadiness,
  avgLaneScore,
  levelFromScore,
} from '@/lib/cohortReadiness';
import OrgReadinessCard from '@/components/cohort-readiness/OrgReadinessCard';

export default function CohortReadinessDashboard() {
  const [selectedCohortId, setSelectedCohortId] = useState('all');
  const [search, setSearch] = useState('');
  const [laneFilter, setLaneFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  const { data: cohorts, isLoading: cohortsLoading } = useQuery({
    queryKey: ['programCohorts'],
    queryFn: () => base44.entities.ProgramCohort.filter({ is_active: true }, '-created_date', 100),
  });

  // Coach scoping: emails of orgs assigned to this coach (admins bypass).
  const { data: coachOrgEmails } = useQuery({
    queryKey: ['coachScopedEmails', user?.email],
    queryFn: async () => {
      if (!user?.email || isAdmin) return null;
      const [clientStages, mentorships, orgs] = await Promise.all([
        base44.entities.ClientStage.filter({ assigned_coach: user.email }),
        base44.entities.Mentorship.filter({ mentor_email: user.email }),
        base44.entities.Organization.list(300),
      ]);
      const assignedOrgIds = new Set(clientStages.map(cs => cs.organization_id).filter(Boolean));
      const emails = new Set();
      orgs.forEach(o => { if (assignedOrgIds.has(o.id) && o.primary_contact_email) emails.add(o.primary_contact_email.toLowerCase()); });
      mentorships.forEach(m => { if (m.mentee_email) emails.add(m.mentee_email.toLowerCase()); });
      return emails;
    },
    enabled: !!user?.email && !isAdmin,
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['cohortEnrollments', selectedCohortId],
    queryFn: async () => {
      if (selectedCohortId === 'all') return base44.entities.ProgramEnrollment.list('-enrolled_date', 500);
      return base44.entities.ProgramEnrollment.filter({ cohort_id: selectedCohortId }, '-enrolled_date', 500);
    },
    enabled: !!user?.email,
  });

  const { data: organizations } = useQuery({
    queryKey: ['allOrganizationsDash'],
    queryFn: () => base44.entities.Organization.list(300),
  });

  const { data: fundingAssessments } = useQuery({
    queryKey: ['fundingReadinessAll'],
    queryFn: () => base44.entities.FundingReadinessAssessment.list('-assessment_date', 500),
  });

  const { data: documents } = useQuery({
    queryKey: ['allDocumentsDash'],
    queryFn: () => base44.entities.Document.list('-created_date', 500),
  });

  const orgByEmail = useMemo(() => {
    const m = new Map();
    (organizations || []).forEach(o => {
      if (o.primary_contact_email) m.set(o.primary_contact_email.toLowerCase(), o);
    });
    return m;
  }, [organizations]);

  const latestAssessmentByEmail = useMemo(() => {
    const m = new Map();
    (fundingAssessments || []).forEach(a => {
      if (!a.user_email) return;
      const key = a.user_email.toLowerCase();
      const existing = m.get(key);
      if (!existing || new Date(a.assessment_date || 0) > new Date(existing.assessment_date || 0)) {
        m.set(key, a);
      }
    });
    return m;
  }, [fundingAssessments]);

  const docsByEmail = useMemo(() => {
    const m = new Map();
    (documents || []).forEach(d => {
      const email = d.created_by?.toLowerCase();
      if (!email) return;
      if (!m.has(email)) m.set(email, []);
      m.get(email).push(d);
    });
    return m;
  }, [documents]);

  const rows = useMemo(() => {
    let list = (enrollments || []).filter(
      e => e.role !== 'facilitator' && e.enrollment_status !== 'withdrawn' && e.participant_email
    );
    if (!isAdmin && coachOrgEmails) {
      list = list.filter(e => coachOrgEmails.has(e.participant_email.toLowerCase()));
    }
    return list.map(e => {
      const email = e.participant_email.toLowerCase();
      const org = orgByEmail.get(email);
      const assessment = latestAssessmentByEmail.get(email);
      const docs = docsByEmail.get(email) || [];
      const lanes = FUNDING_LANES.map(lane => computeLaneReadiness(lane, docs, assessment?.overall_score));
      const avg = avgLaneScore(lanes);
      return {
        enrollment: e,
        email,
        orgName: e.organization_name || org?.organization_name || e.participant_name || email,
        org,
        assessment,
        lanes,
        avgScore: avg,
        avgLevel: levelFromScore(avg),
        cohortId: e.cohort_id,
      };
    });
  }, [enrollments, orgByEmail, latestAssessmentByEmail, docsByEmail, isAdmin, coachOrgEmails]);

  const filtered = useMemo(() => {
    let r = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x => x.orgName.toLowerCase().includes(q) || x.email.includes(q));
    }
    if (levelFilter !== 'all') {
      r = r.filter(x => {
        const lvl = laneFilter === 'all' ? x.avgLevel : x.lanes[FUNDING_LANES.findIndex(l => l.id === laneFilter)].laneLevel;
        return lvl === levelFilter;
      });
    }
    // sort by chosen lane score (or avg) desc
    r = [...r].sort((a, b) => {
      const sa = laneFilter === 'all' ? a.avgScore : a.lanes[FUNDING_LANES.findIndex(l => l.id === laneFilter)].laneScore;
      const sb = laneFilter === 'all' ? b.avgScore : b.lanes[FUNDING_LANES.findIndex(l => l.id === laneFilter)].laneScore;
      return sb - sa;
    });
    return r;
  }, [rows, search, levelFilter, laneFilter]);

  // summary counts for the active lane (or avg)
  const summary = useMemo(() => {
    const targetLaneIdx = laneFilter === 'all' ? -1 : FUNDING_LANES.findIndex(l => l.id === laneFilter);
    const counts = { highly_ready: 0, ready: 0, building_readiness: 0, not_ready: 0 };
    rows.forEach(x => {
      const lvl = targetLaneIdx === -1 ? x.avgLevel : x.lanes[targetLaneIdx].laneLevel;
      counts[lvl] = (counts[lvl] || 0) + 1;
    });
    return counts;
  }, [rows, laneFilter]);

  const isLoading = cohortsLoading || enrollmentsLoading;

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#143A50] flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#E5C089]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Cohort Funding Lane Readiness</h1>
              <p className="text-slate-600 text-sm">
                Track each organization's readiness across the four funding lanes — who's grant-ready and who needs capacity-building.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Cohort</label>
            <Select value={selectedCohortId} onValueChange={setSelectedCohortId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All cohorts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cohorts</SelectItem>
                {(cohorts || []).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.program_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Funding lane</label>
            <Select value={laneFilter} onValueChange={setLaneFilter}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lanes (overall)</SelectItem>
                {FUNDING_LANES.map(l => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Readiness level</label>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {LEVEL_ORDER.map(lv => (
                  <SelectItem key={lv} value={lv}>{LEVEL_CONFIG[lv].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {LEVEL_ORDER.map(lv => (
            <Card key={lv} className={`${LEVEL_CONFIG[lv].bg} ${LEVEL_CONFIG[lv].border} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${LEVEL_CONFIG[lv].text}`}>{LEVEL_CONFIG[lv].label}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${LEVEL_CONFIG[lv].dot}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1">{summary[lv] || 0}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {laneFilter === 'all' ? 'overall' : FUNDING_LANES.find(l => l.id === laneFilter)?.label.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 max-w-md"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#143A50]" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No organizations found</p>
              <p className="text-sm text-slate-400">
                {rows.length === 0
                  ? 'No enrolled organizations in this cohort yet.'
                  : 'No organizations match the current filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 px-1">
              Showing {filtered.length} organization{filtered.length === 1 ? '' : 's'} · sorted by{' '}
              {laneFilter === 'all' ? 'overall readiness' : `${FUNDING_LANES.find(l => l.id === laneFilter)?.label} readiness`}
            </p>
            {filtered.map((row, idx) => (
              <motion.div key={row.enrollment.id || row.email} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.03, 0.3) }}>
                <OrgReadinessCard row={row} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 text-xs text-slate-400 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          Readiness blends the latest Funding Readiness Assessment score (50%) with completed key documents per lane (50%).
        </div>
      </div>
    </div>
  );
}