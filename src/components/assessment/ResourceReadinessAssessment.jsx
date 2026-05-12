import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Sparkles, FileText, Target, RotateCcw, Download, Eye } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'org_type',
    question: 'What best describes your organization?',
    multi: false,
    options: [
      { value: 'nonprofit', label: '501(c)(3) Nonprofit', icon: '🏛️' },
      { value: 'faith_based', label: 'Faith-Based Organization', icon: '✝️' },
      { value: 'for_profit', label: 'For-Profit / Small Business', icon: '💼' },
      { value: 'solopreneur', label: 'Solopreneur / Freelancer', icon: '🧑‍💻' },
      { value: 'community_based', label: 'Community-Based / Informal Group', icon: '🤝' },
    ]
  },
  {
    id: 'stage',
    question: 'What stage is your organization at?',
    multi: false,
    options: [
      { value: 'seed', label: 'Just Starting (0–2 years)', icon: '🌱' },
      { value: 'growth', label: 'Growing (2–5 years)', icon: '📈' },
      { value: 'scale', label: 'Established (5+ years)', icon: '🏆' },
    ]
  },
  {
    id: 'legal',
    question: 'Which of these legal / governance documents do you have?',
    multi: true,
    options: [
      { value: 'articles', label: 'Articles of Incorporation' },
      { value: 'bylaws', label: 'Bylaws' },
      { value: 'ein', label: 'EIN / Tax ID' },
      { value: '501c3', label: '501(c)(3) Determination Letter' },
      { value: 'board', label: 'Active Board of Directors' },
      { value: 'none', label: 'None of these yet', exclusive: true },
    ]
  },
  {
    id: 'financial',
    question: 'Which financial documents / systems do you have in place?',
    multi: true,
    options: [
      { value: 'budget', label: 'Annual Operating Budget' },
      { value: 'statements', label: 'Financial Statements (P&L / Balance Sheet)' },
      { value: 'audit', label: 'Audit or Financial Review' },
      { value: 'accounting', label: 'Accounting Software (QuickBooks, etc.)' },
      { value: 'bank', label: 'Separate Business Bank Account' },
      { value: 'none', label: 'None of these yet', exclusive: true },
    ]
  },
  {
    id: 'programs',
    question: 'How well-documented are your programs / services?',
    multi: false,
    options: [
      { value: 'none', label: 'We have ideas but nothing written down', icon: '💭' },
      { value: 'basic', label: 'We have basic descriptions', icon: '📝' },
      { value: 'detailed', label: 'We have detailed program plans', icon: '📋' },
      { value: 'evaluated', label: 'We track outcomes and evaluate impact', icon: '📊' },
    ]
  },
  {
    id: 'funding_goals',
    question: 'What types of funding are you pursuing? (select all that apply)',
    multi: true,
    options: [
      { value: 'grants', label: 'Grants (foundations, government)' },
      { value: 'contracts', label: 'Contracts / RFPs' },
      { value: 'donors', label: 'Individual Donors / Major Gifts' },
      { value: 'faith_giving', label: 'Congregational / Faith-Based Giving' },
      { value: 'events', label: 'Fundraising Events' },
      { value: 'earned_revenue', label: 'Earned Revenue / Fee for Service' },
    ]
  },
  {
    id: 'grant_experience',
    question: 'What is your grant writing experience level?',
    multi: false,
    options: [
      { value: 'none', label: 'Never applied for a grant', icon: '🆕' },
      { value: 'tried', label: "Applied but haven't won yet", icon: '🔄' },
      { value: 'some', label: 'Won 1–3 grants', icon: '✅' },
      { value: 'experienced', label: 'Regularly win grants', icon: '🏅' },
    ]
  },
  {
    id: 'gaps',
    question: 'Where do you feel your biggest gaps are? (select all that apply)',
    multi: true,
    options: [
      { value: 'board_governance', label: 'Board & Governance' },
      { value: 'financial_systems', label: 'Financial Systems' },
      { value: 'grant_writing', label: 'Grant Writing Skills' },
      { value: 'program_documentation', label: 'Program Documentation' },
      { value: 'donor_relations', label: 'Donor Relationships' },
      { value: 'contracts_rfp', label: 'Contracts & RFPs' },
      { value: 'strategic_plan', label: 'Strategic Planning' },
      { value: 'evaluation', label: 'Data & Evaluation' },
    ]
  },
];

// Scoring and recommendation logic
function computeResults(answers, templates) {
  const { org_type, stage, legal = [], financial = [], programs, funding_goals = [], grant_experience, gaps = [] } = answers;

  // Compute readiness score out of 100
  let score = 0;

  // Legal (25 pts)
  if (!legal.includes('none')) {
    score += Math.min(25, legal.length * 5);
  }

  // Financial (25 pts)
  if (!financial.includes('none')) {
    score += Math.min(25, financial.length * 5);
  }

  // Programs (20 pts)
  const programScore = { none: 0, basic: 8, detailed: 15, evaluated: 20 };
  score += programScore[programs] || 0;

  // Grant experience (15 pts)
  const grantScore = { none: 0, tried: 5, some: 10, experienced: 15 };
  score += grantScore[grant_experience] || 0;

  // Stage bonus (15 pts)
  const stageScore = { seed: 5, growth: 10, scale: 15 };
  score += stageScore[stage] || 0;

  score = Math.min(100, score);

  let readinessLevel, readinessLabel, readinessColor, readinessDescription;
  if (score < 30) {
    readinessLevel = 'foundation_building';
    readinessLabel = 'Foundation Building';
    readinessColor = 'red';
    readinessDescription = "You're in the early stages of building organizational infrastructure. Focus on the foundational documents and systems first.";
  } else if (score < 60) {
    readinessLevel = 'prepare_first';
    readinessLabel = 'Prepare First';
    readinessColor = 'amber';
    readinessDescription = "You have some pieces in place but need to strengthen your infrastructure before actively pursuing major funding.";
  } else if (score < 80) {
    readinessLevel = 'nearly_ready';
    readinessLabel = 'Nearly Ready';
    readinessColor = 'blue';
    readinessDescription = "You're in solid shape! Fill in the remaining gaps and you'll be highly competitive for funding.";
  } else {
    readinessLevel = 'apply_now';
    readinessLabel = 'Apply Now';
    readinessColor = 'green';
    readinessDescription = "Your organization is well-positioned. Start applying and use targeted templates to strengthen your proposals.";
  }

  // Build prioritized template recommendations
  const allTemplates = templates || [];
  const scored = allTemplates.map(t => {
    let relevance = 0;
    const name = (t.template_name || '').toLowerCase();
    const cat = t.category || '';
    const tFundingLane = t.funding_lane || '';
    const tOrgType = t.org_type || [];

    // Match org type
    if (tOrgType.length === 0 || tOrgType.includes(org_type) || tOrgType.includes('nonprofit')) relevance += 2;

    // Match stage
    if (t.maturity_level === 'all' || t.maturity_level === stage) relevance += 2;

    // Match gaps
    if (gaps.includes('board_governance') && (cat === 'foundational' || name.includes('board') || name.includes('bylaw'))) relevance += 5;
    if (gaps.includes('financial_systems') && (cat === 'financial_compliance' || name.includes('budget') || name.includes('financial'))) relevance += 5;
    if (gaps.includes('grant_writing') && (cat === 'grant_writing')) relevance += 5;
    if (gaps.includes('program_documentation') && (cat === 'foundational' || name.includes('program') || name.includes('logic model'))) relevance += 5;
    if (gaps.includes('donor_relations') && (cat === 'donor_philanthropy' || name.includes('donor') || name.includes('stewardship'))) relevance += 5;
    if (gaps.includes('contracts_rfp') && (cat === 'contracts_rfp' || name.includes('contract') || name.includes('rfp'))) relevance += 5;
    if (gaps.includes('strategic_plan') && (cat === 'strategic' || name.includes('strategic'))) relevance += 5;
    if (gaps.includes('evaluation') && (cat === 'evaluation_impact' || name.includes('evaluation') || name.includes('logic model'))) relevance += 5;

    // Match funding goals
    if (funding_goals.includes('grants') && (tFundingLane === 'grants' || cat === 'grant_writing')) relevance += 3;
    if (funding_goals.includes('contracts') && (tFundingLane === 'contracts' || cat === 'contracts_rfp')) relevance += 3;
    if (funding_goals.includes('donors') && (tFundingLane === 'donors' || cat === 'donor_philanthropy')) relevance += 3;
    if ((funding_goals.includes('donors') || funding_goals.includes('faith_giving')) && name.includes('board member')) relevance += 4;

    // Foundational docs always relevant for low scorers
    if (score < 50 && cat === 'foundational') relevance += 3;

    return { ...t, relevance };
  });

  scored.sort((a, b) => b.relevance - a.relevance);
  const recommended = scored.filter(t => t.relevance > 0).slice(0, 8);

  return { score, readinessLevel, readinessLabel, readinessColor, readinessDescription, recommended };
}

const colorMap = {
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', bar: 'bg-red-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', bar: 'bg-amber-500' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', bar: 'bg-blue-500' },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', bar: 'bg-green-500' },
};

export default function ResourceReadinessAssessment({ open, onClose, onUseTemplate }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['published-templates-assessment'],
    queryFn: async () => {
      const all = await base44.entities.Template.list('-created_date');
      return all.filter(t => t.is_active !== false && t.is_published === true);
    },
    enabled: open,
  });

  const question = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;
  const currentAnswer = answers[question?.id];

  const handleSelect = (value, exclusive) => {
    if (!question) return;
    if (!question.multi) {
      setAnswers(prev => ({ ...prev, [question.id]: value }));
    } else {
      setAnswers(prev => {
        const current = Array.isArray(prev[question.id]) ? prev[question.id] : [];
        if (exclusive) return { ...prev, [question.id]: [value] };
        const withoutExclusive = current.filter(v => {
          const opt = question.options.find(o => o.value === v);
          return !opt?.exclusive;
        });
        if (withoutExclusive.includes(value)) {
          return { ...prev, [question.id]: withoutExclusive.filter(v => v !== value) };
        }
        return { ...prev, [question.id]: [...withoutExclusive, value] };
      });
    }
  };

  const isAnswered = () => {
    if (!question) return false;
    const ans = answers[question.id];
    if (!question.multi) return !!ans;
    return Array.isArray(ans) && ans.length > 0;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      // Compute results
      setResults(computeResults(answers, templates));
    }
  };

  const handleBack = () => {
    if (results) { setResults(null); return; }
    setStep(s => Math.max(0, s - 1));
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  const isSelected = (value) => {
    const ans = answers[question?.id];
    if (!question?.multi) return ans === value;
    return Array.isArray(ans) && ans.includes(value);
  };

  const colors = results ? colorMap[results.readinessColor] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#143A50]">
            <Target className="w-5 h-5 text-[#E5C089]" />
            Readiness & Resource Matcher
          </DialogTitle>
        </DialogHeader>

        {!results ? (
          <div>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-500 mb-1">
                <span>Question {step + 1} of {totalSteps}</span>
                <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
              </div>
              <Progress value={((step + 1) / totalSteps) * 100} className="h-2" />
            </div>

            {/* Question */}
            <h3 className="text-lg font-semibold text-[#143A50] mb-4">{question.question}</h3>
            {question.multi && (
              <p className="text-sm text-slate-500 mb-3">Select all that apply</p>
            )}

            <div className="space-y-2 mb-6">
              {question.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value, opt.exclusive)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    isSelected(opt.value)
                      ? 'border-[#143A50] bg-[#143A50]/5 text-[#143A50] font-medium'
                      : 'border-slate-200 hover:border-[#143A50]/40 text-slate-700'
                  }`}
                >
                  {question.multi ? (
                    isSelected(opt.value)
                      ? <CheckCircle2 className="w-5 h-5 text-[#143A50] flex-shrink-0" />
                      : <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  ) : (
                    <span className="text-xl flex-shrink-0">{opt.icon || '•'}</span>
                  )}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isAnswered()}
                className="bg-[#143A50] hover:bg-[#1E4F58]"
              >
                {step === totalSteps - 1 ? (
                  <><Sparkles className="w-4 h-4 mr-2" />See My Results</>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <ResultsPanel
            results={results}
            colors={colors}
            onReset={handleReset}
            onUseTemplate={onUseTemplate}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResultsPanel({ results, colors, onReset, onUseTemplate, onClose }) {
  const { score, readinessLabel, readinessDescription, recommended } = results;

  return (
    <div>
      {/* Score Card */}
      <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-5 mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-slate-600">Your Readiness Score</p>
            <p className={`text-3xl font-bold ${colors.text}`}>{score}/100</p>
            <Badge className={`${colors.bg} ${colors.text} border ${colors.border} mt-1`}>{readinessLabel}</Badge>
          </div>
          <div className="w-24 h-24 relative flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <path
                d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"
                fill="none"
                stroke={score >= 80 ? '#16a34a' : score >= 60 ? '#2563eb' : score >= 30 ? '#d97706' : '#dc2626'}
                strokeWidth="3"
                strokeDasharray={`${(score / 100) * 100.53} 100.53`}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute text-lg font-bold ${colors.text}`}>{score}%</span>
          </div>
        </div>
        <p className="text-sm text-slate-700">{readinessDescription}</p>
      </div>

      {/* Recommended Templates */}
      <div className="mb-4">
        <h4 className="font-semibold text-[#143A50] mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#E5C089]" />
          Your Prioritized Template Recommendations ({recommended.length})
        </h4>
        {recommended.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No templates matched yet — more are being added soon!</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {recommended.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#143A50]/30 bg-white">
                <span className="text-sm font-bold text-[#143A50] w-6 flex-shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">{t.template_name}</p>
                  {t.purpose && <p className="text-xs text-slate-500 truncate">{t.purpose}</p>}
                </div>
                <Button
                  size="sm"
                  className="bg-[#143A50] hover:bg-[#1E4F58] flex-shrink-0 text-xs"
                  onClick={() => { onUseTemplate(t); onClose(); }}
                >
                  Use It
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <Button variant="outline" onClick={onReset} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />Retake
        </Button>
        <Button onClick={onClose} className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]">
          Browse All Resources
        </Button>
      </div>
    </div>
  );
}