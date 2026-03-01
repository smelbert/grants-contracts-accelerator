import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Calendar, FileText, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';

const COHORT_MIX = [
  { label: 'Current Incubate Her', count: 12 },
  { label: 'Past Accelerate Her', count: 9 },
  { label: 'Past Incubate Her', count: 6 },
  { label: 'Both / Alumni of Both', count: 5 },
  { label: 'Observer / Guest', count: 3 },
];

const PARTICIPATION_PLAN = [
  { label: 'All 3 sessions (Mon/Thu virtual + Sat in-person)', count: 21 },
  { label: 'Two virtual sessions only', count: 7 },
  { label: 'Drop-in / as available', count: 6 },
  { label: 'Saturday in-person only', count: 1 },
];

const CONSULTATION_DEMAND = [
  { label: 'Yes (strong demand)', count: 24, color: 'bg-green-600' },
  { label: 'Maybe / need more info', count: 8, color: 'bg-amber-500' },
  { label: 'No', count: 3, color: 'bg-slate-400' },
];

const MISS_PLAN = [
  { label: 'Want workbook + recordings', count: 19 },
  { label: 'Not applicable (will attend live)', count: 13 },
  { label: 'Workbook only', count: 1 },
  { label: 'Not specified', count: 2 },
];

const TEACHING_IMPLICATIONS = [
  {
    theme: '"Everything!" is the dominant need',
    signal: '"Everything!" was the top-selected area — a signal of overwhelm, uncertainty about sequence, and decision fatigue, not just content gaps.',
    implication: 'Win the room fastest by giving them a map before giving them more information. Lead with sequence, not volume.',
    icon: MapPin,
    color: 'border-l-[#AC1A5B]',
    badgeColor: 'bg-[#AC1A5B]',
  },
  {
    theme: 'Funding Pathway + Documents = practical pain point',
    signal: 'Even those not choosing "Everything!" consistently pointed to foundational infrastructure: Funding Pathway Strategy, W-9/compliance, and data planning.',
    implication: 'Separate clearly: (1) Readiness Documents — what you must have. (2) Opportunity-Fit Strategy — what you pursue and why. (3) Narrative + Proof — what you say and show.',
    icon: FileText,
    color: 'border-l-[#143A50]',
    badgeColor: 'bg-[#143A50]',
  },
  {
    theme: 'Barriers center on financial readiness + confidence + "where do I look?"',
    signal: 'Credit/debt/revenue constraints, knowledge gaps ("I\'m a sponge"), not knowing where to look, and internal approvals/authority barriers appear repeatedly.',
    implication: 'Normalize that funding barriers are often systems problems, not character flaws. Include at least one "funding path for early-stage" section.',
    icon: AlertTriangle,
    color: 'border-l-[#E5C089]',
    badgeColor: 'bg-[#E5C089] text-slate-900',
  },
];

const THEMES = [
  {
    label: 'Theme A: "Where do I find opportunities?"',
    reveal: 'They need a repeatable search + filter routine, not a one-time list.',
    teach: [
      'The difference between grants, contracts, sponsorships, and private capital',
      'How to build a weekly funding rhythm (30–45 min with a tracking template)',
      'How to identify opportunities aligned to their stage',
    ],
  },
  {
    label: 'Theme B: "Do I have to pay money to win money?"',
    reveal: 'Confusion about match requirements, application fees vs. participation costs, and grantmaking logic.',
    teach: ['A quick myth-busting moment early prevents side-quest questions later.'],
  },
  {
    label: 'Theme C: Relationship-building + follow-up etiquette',
    reveal: 'They\'re ready for the "beyond the application" layer: influence, stakeholder strategy, and partnership behaviors.',
    teach: ['Guide on follow-up etiquette and building relationships with opportunity-connected people.'],
  },
];

const READINESS_SIGNALS = [
  {
    title: '1) High "consultation expectation" — set crisp boundaries early',
    detail: '24 people want 1-on-1 consideration and 8 are "maybe." Clearly position: what "eligible" means (documents + attendance + assessments), how selection works, and what to submit to be considered.',
  },
  {
    title: '2) Attendance variability — design for modular wins',
    detail: 'Meaningful drop-in and virtual-only segments exist. Each session should produce a standalone deliverable completable even if they miss another session.',
  },
  {
    title: '3) Many are early-stage or cash-constrained',
    detail: '"No income," "debt," and "credit score and revenue" show up as real friction. Include at least one "funding path for early-stage" section that doesn\'t shame them for imperfect books.',
  },
];

function StatBar({ label, count, total, color = 'bg-[#143A50]' }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-40 shrink-0 text-slate-700">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
        <div className={`${color} h-4 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-10 text-right font-semibold text-slate-900">{count}</div>
    </div>
  );
}

export default function RegistrationInsightsBrief() {
  const total = 35;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-[#AC1A5B] bg-[#AC1A5B]/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="w-7 h-7 text-[#AC1A5B] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-[#AC1A5B]">Registration Insights Brief</h2>
              <p className="text-slate-600 text-sm mt-1">
                <strong>IncubateHer Workshops — n = {total} registrants.</strong> Snapshot of who's in the room, what they need, and how to teach this cohort effectively.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cohort Mix + Participation Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-[#143A50]" /> Cohort Mix</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {COHORT_MIX.map(row => (
              <StatBar key={row.label} label={row.label} count={row.count} total={total} color="bg-[#143A50]" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-[#1E4F58]" /> How They Plan to Participate</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {PARTICIPATION_PLAN.map(row => (
              <StatBar key={row.label} label={row.label} count={row.count} total={total} color="bg-[#1E4F58]" />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Consultation Demand + If They Miss */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Demand for 1-on-1 Document Review</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {CONSULTATION_DEMAND.map(row => (
              <div key={row.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{row.label}</span>
                <Badge className={row.color}>{row.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">If They Miss Live Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {MISS_PLAN.map(row => (
              <StatBar key={row.label} label={row.label} count={row.count} total={total} color="bg-[#A65D40]" />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* What They Want Help With */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#E5C089]" />
            What They Want Help With — The Loudest Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {TEACHING_IMPLICATIONS.map((item) => (
            <div key={item.theme} className={`border-l-4 ${item.color} pl-4 py-3 bg-slate-50 rounded-r-lg`}>
              <div className="flex items-start gap-2 mb-2">
                <item.icon className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                <p className="font-semibold text-slate-900 text-sm">{item.theme}</p>
              </div>
              <p className="text-sm text-slate-600 mb-2">{item.signal}</p>
              <div className="flex items-start gap-2">
                <Badge className={`${item.badgeColor} shrink-0 text-xs`}>Teaching Implication</Badge>
                <p className="text-sm text-slate-700">{item.implication}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Themes from Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#143A50]" />
            What They're Asking (and What It Reveals)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {THEMES.map((theme) => (
            <div key={theme.label} className="border border-slate-200 rounded-lg p-4">
              <p className="font-semibold text-slate-900 text-sm mb-1">{theme.label}</p>
              <p className="text-sm text-slate-600 italic mb-2">What it reveals: {theme.reveal}</p>
              <ul className="space-y-1">
                {theme.teach.map((t, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-[#AC1A5B] shrink-0">•</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Readiness Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Readiness Signals to Be Aware of Before You Teach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {READINESS_SIGNALS.map((s) => (
            <div key={s.title} className="border-l-4 border-l-amber-400 pl-4 py-2">
              <p className="font-semibold text-slate-900 text-sm mb-1">{s.title}</p>
              <p className="text-sm text-slate-600">{s.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Teaching Recommendations */}
      <Card className="bg-[#143A50] text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#E5C089]" />
            Recommendations for How You Teach This Cohort
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-slate-100">
          <div>
            <p className="font-semibold text-[#E5C089] mb-2">Your Best Opening (5–7 minutes)</p>
            <p className="text-sm mb-2">Give them a calm, confident frame:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex gap-2"><span className="text-[#E5C089]">"</span>You're not behind — you're building a system."</li>
              <li className="flex gap-2"><span className="text-[#E5C089]">"</span>We're moving from random searches to a repeatable funding strategy."</li>
              <li className="flex gap-2"><span className="text-[#E5C089]">"</span>Today is about clarity, sequence, and confidence."</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[#E5C089] mb-2">Teach in 3 Lanes (Simple + Sticky)</p>
            <div className="grid grid-cols-3 gap-3">
              {['Readiness (foundation)', 'Fit (what to pursue, what to skip)', 'Execution (how to package + submit + follow up)'].map((lane, i) => (
                <div key={lane} className="bg-white/10 rounded-lg p-3 text-center text-sm">{lane}</div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#E5C089] mb-2">The Map They're Craving</p>
            <div className="flex flex-wrap gap-1 items-center text-xs">
              {['Idea', 'Readiness Docs', 'Eligibility', 'Opportunity Match', 'Narrative + Budget', 'Submission', 'Follow-up', 'Reporting / Relationship'].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <span className="bg-white/20 px-2 py-1 rounded">{step}</span>
                  {i < arr.length - 1 && <span className="text-[#E5C089]">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}