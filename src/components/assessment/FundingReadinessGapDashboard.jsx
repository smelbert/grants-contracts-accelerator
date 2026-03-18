import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  Scale, DollarSign, BookOpen, Users, Zap
} from 'lucide-react';

// ── Config ────────────────────────────────────────────────────────────────────
const AREA_CONFIG = {
  legal_status: {
    label: 'Legal Structure',
    icon: Scale,
    color: '#143A50',
    barColor: 'bg-[#143A50]',
    maxPoints: 30,
    descriptions: {
      full: 'Formal entity with EIN and dedicated bank account',
      partial: 'Formal entity, but missing EIN or bank account',
      none: 'No formal legal structure yet',
    },
    gapActions: {
      full: null,
      partial: {
        title: 'Complete your legal setup',
        steps: [
          'Apply for an EIN at IRS.gov (free, takes 15 minutes)',
          'Open a dedicated business checking account',
          'Ensure your entity registration is current with the state',
        ],
        timeline: '1–2 weeks',
        impact: '+15 pts',
      },
      none: {
        title: 'Establish your legal entity',
        steps: [
          'Choose a business structure (LLC, nonprofit 501c3, etc.)',
          'Register with your state Secretary of State',
          'Apply for an EIN at IRS.gov',
          'Open a dedicated business bank account',
        ],
        timeline: '1–2 months',
        impact: '+30 pts',
      },
    },
  },
  financial_records: {
    label: 'Financial Records',
    icon: DollarSign,
    color: '#1E4F58',
    barColor: 'bg-[#1E4F58]',
    maxPoints: 25,
    descriptions: {
      professional: 'Professional financial statements and budget',
      basic: 'Basic tracking (spreadsheets or simple software)',
      none: 'No formal financial tracking',
    },
    gapActions: {
      professional: null,
      basic: {
        title: 'Upgrade to professional financials',
        steps: [
          'Hire a bookkeeper or CPA for quarterly reviews',
          'Create a formal annual budget with variance tracking',
          'Produce P&L and balance sheet statements monthly',
        ],
        timeline: '2–3 months',
        impact: '+13 pts',
      },
      none: {
        title: 'Implement financial tracking',
        steps: [
          'Sign up for QuickBooks, Wave (free), or similar',
          'Record all income and expenses from today forward',
          'Reconcile your business bank account monthly',
          'Create a basic annual budget',
        ],
        timeline: '1–4 weeks to start',
        impact: '+25 pts',
      },
    },
  },
  program_clarity: {
    label: 'Program / Service Clarity',
    icon: BookOpen,
    color: '#A65D40',
    barColor: 'bg-[#A65D40]',
    maxPoints: 25,
    descriptions: {
      documented: 'Clear, documented programs with measurable outcomes',
      developing: 'Programs exist but not fully documented',
      exploring: 'Still exploring what I offer',
    },
    gapActions: {
      documented: null,
      developing: {
        title: 'Document your programs fully',
        steps: [
          'Write a 1-page program description for each offering',
          'Define measurable outcomes (e.g. "90% of clients improve X")',
          'Identify target population with demographics',
          'Build a logic model (Inputs → Activities → Outputs → Outcomes)',
        ],
        timeline: '3–6 weeks',
        impact: '+13 pts',
      },
      exploring: {
        title: 'Define and document your offerings',
        steps: [
          'Brainstorm and narrow down your 1–3 core services',
          'Write a one-sentence mission aligned to each service',
          'Document who you serve (target population)',
          'Describe at least 2 measurable outcomes per program',
        ],
        timeline: '1–2 months',
        impact: '+25 pts',
      },
    },
  },
  capacity: {
    label: 'Organizational Capacity',
    icon: Users,
    color: '#AC1A5B',
    barColor: 'bg-[#AC1A5B]',
    maxPoints: 20,
    descriptions: {
      ready: 'Have capacity to take on funded work',
      tight: 'Currently at capacity',
      overextended: 'Already overextended',
    },
    gapActions: {
      ready: null,
      tight: {
        title: 'Create capacity before applying',
        steps: [
          'Map current time commitments to identify what can be delegated',
          'Recruit 1–2 trained volunteers or part-time staff',
          'Streamline operations — automate or batch repetitive tasks',
        ],
        timeline: '1–3 months',
        impact: '+10 pts',
      },
      overextended: {
        title: 'Resolve capacity constraints first',
        steps: [
          'Conduct a workload audit — what is taking most of your time?',
          'Pause non-essential activities temporarily',
          'Hire or recruit at least one additional team member',
          'Do not apply for major grants until capacity improves',
        ],
        timeline: '3–6 months',
        impact: '+20 pts',
      },
    },
  },
};

const LEVEL_ORDER = {
  full: 0, professional: 0, documented: 0, ready: 0,
  partial: 1, basic: 1, developing: 1, tight: 1,
  none: 2, exploring: 2, overextended: 2,
};

const getPriorityLabel = (pct) => {
  if (pct === 100) return { label: 'Achieved', color: 'bg-green-100 text-green-800' };
  if (pct >= 50) return { label: 'Partial Gap', color: 'bg-amber-100 text-amber-800' };
  return { label: 'Critical Gap', color: 'bg-red-100 text-red-800' };
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FundingReadinessGapDashboard({ assessment }) {
  if (!assessment?.score_breakdown) return null;

  const { score_breakdown, legal_status, financial_records, program_clarity, capacity } = assessment;
  const rawValues = { legal_status, financial_records, program_clarity, capacity };

  // Sort areas by gap size (biggest gap first)
  const areas = Object.entries(AREA_CONFIG).map(([key, cfg]) => {
    const bd = score_breakdown[key] || { score: 0, max: cfg.maxPoints, percentage: 0 };
    const rawVal = rawValues[key] || 'none';
    const gap = bd.max - bd.score;
    return { key, cfg, bd, rawVal, gap };
  }).sort((a, b) => b.gap - a.gap);

  const criticalGaps = areas.filter(a => a.bd.percentage < 50);
  const partialGaps = areas.filter(a => a.bd.percentage >= 50 && a.bd.percentage < 100);
  const achieved = areas.filter(a => a.bd.percentage === 100);

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-2xl font-bold text-red-700">{criticalGaps.length}</p>
          <p className="text-xs text-red-600 font-medium mt-1">Critical Gaps</p>
          <p className="text-xs text-slate-500">0–49% of max points</p>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-2xl font-bold text-amber-700">{partialGaps.length}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Partial Gaps</p>
          <p className="text-xs text-slate-500">50–99% of max points</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-2xl font-bold text-green-700">{achieved.length}</p>
          <p className="text-xs text-green-600 font-medium mt-1">Strengths</p>
          <p className="text-xs text-slate-500">100% of max points</p>
        </div>
      </div>

      {/* Visual score bars — biggest gap first */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-[#E5C089]" />
            Gap Analysis — Focus Areas Ranked by Impact
          </CardTitle>
          <p className="text-sm text-slate-500">Areas at the top have the most points available to gain</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {areas.map(({ key, cfg, bd, rawVal }) => {
            const { label: priorityLabel, color: priorityColor } = getPriorityLabel(bd.percentage);
            const gapAction = cfg.gapActions[rawVal];
            const Icon = cfg.icon;

            return (
              <div key={key} className={`rounded-xl border p-4 ${bd.percentage === 100 ? 'bg-green-50/50 border-green-200' : bd.percentage >= 50 ? 'bg-amber-50/30 border-amber-200' : 'bg-red-50/30 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-white border">
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{cfg.label}</span>
                      <Badge className={`text-xs ${priorityColor}`}>{priorityLabel}</Badge>
                      {bd.percentage < 100 && (
                        <Badge variant="outline" className="text-xs text-slate-500">
                          +{bd.max - bd.score} pts available
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{cfg.descriptions[rawVal] || rawVal}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold" style={{ color: cfg.color }}>{bd.score}/{bd.max}</p>
                    <p className="text-xs text-slate-400">{bd.percentage}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                  <div
                    className={`h-3 rounded-full transition-all ${cfg.barColor}`}
                    style={{ width: `${bd.percentage}%` }}
                  />
                </div>

                {/* Gap action steps */}
                {gapAction && (
                  <div className="bg-white rounded-lg border border-slate-200 p-3 mt-2">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-[#AC1A5B]" />
                        {gapAction.title}
                      </p>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">{gapAction.impact}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{gapAction.timeline}</span>
                      </div>
                    </div>
                    <ol className="space-y-1">
                      {gapAction.steps.map((step, i) => (
                        <li key={i} className="text-xs text-slate-600 flex gap-2">
                          <span className="shrink-0 font-bold text-slate-400">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {bd.percentage === 100 && (
                  <div className="flex items-center gap-2 text-sm text-green-700 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Strength — no action needed here</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick-win callout */}
      {partialGaps.length > 0 && (
        <Card className="border-[#E5C089] bg-[#E5C089]/10">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-semibold text-[#143A50] mb-1">💡 Quickest Wins</p>
            <p className="text-sm text-slate-700">
              Your partial gaps (<strong>{partialGaps.map(a => a.cfg.label).join(', ')}</strong>) already have a foundation.
              Closing these first is the fastest path to a higher score — each requires incremental improvements you may be able to complete in weeks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}