import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Target, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const MODULES_DATA = [
  {
    number: 1,
    title: 'The Funding & Procurement Ecosystem',
    subtitle: 'Understanding how money actually moves',
    purpose: 'Establish foundational literacy in how funding decisions are structured, governed, and executed across public and private sectors. This module prevents misclassification errors that lead to compliance failures and strategic misalignment.',
    rationale: 'Strong programs fail when consultants misunderstand how money moves, who decides, and what rules govern access. This module establishes the non-negotiable baseline for all subsequent strategy and writing work.',
    competencies: [
      'Distinguish grants, contracts, RFPs, RFQs, RFIs, sponsorships',
      'Differentiate public vs private funding structures',
      'Understand reimbursement vs upfront funding models',
      'Identify structural reasons proposals fail regardless of merit'
    ],
    levels: {
      level1: 'Identify and classify funding mechanisms accurately',
      level2: 'Compare strategic implications across mechanisms',
      level3: 'Advise pursue/no-pursue decisions'
    },
    outputs: [
      'Funding mechanism classification exercise',
      'Failure analysis case study'
    ]
  },
  {
    number: 2,
    title: 'How Funders & Evaluators Think',
    subtitle: 'Applying reviewer logic to proposal design',
    purpose: 'Shift consultants from "writer mindset" to "evaluator mindset" by grounding proposal decisions in scoring logic, risk tolerance, and cognitive load.',
    competencies: [
      'Understand reviewer scoring criteria',
      'Identify red flags triggering rejection',
      'Apply funder priorities to design decisions',
      'Conduct reviewer-perspective analysis'
    ],
    levels: {
      level1: 'Recognize criteria and scoring language',
      level2: 'Draft to evaluator priorities',
      level3: 'Engineer scoring advantage'
    },
    outputs: [
      'Annotated reviewer scorecard',
      'Rejection trigger identification exercise'
    ]
  },
  {
    number: 3,
    title: 'Ethics, Compliance & Professional Standards',
    subtitle: 'Protecting integrity, credibility, and eligibility',
    purpose: 'Codify ethical conduct, compliance discipline, and professional boundaries as mandatory—not optional—consultant behavior.',
    competencies: [
      'Apply Grant Professionals Association ethics framework',
      'Apply EIS internal quality standards',
      'Identify and manage conflicts of interest',
      'Maintain professional boundaries'
    ],
    levels: {
      level1: 'Follow standards',
      level2: 'Flag ethical risks',
      level3: 'Exercise compliance authority'
    },
    outputs: [
      'Ethics scenario analysis',
      'Conflict-of-interest identification exercise'
    ],
    critical: true
  },
  {
    number: 4,
    title: 'EIS Voice, Style & Brand Protection',
    subtitle: 'Writing that protects institutional credibility',
    purpose: 'Standardize the EIS voice to ensure consistency, credibility, and risk mitigation across all submissions.',
    competencies: [
      'Strategic, clear, grounded writing',
      'Data-supported storytelling',
      'Avoid inflated claims and vague outcomes',
      'Identify red-flag language (trauma dumping, overpromising)'
    ],
    levels: {
      level1: 'Apply approved voice',
      level2: 'Adjust voice strategically',
      level3: 'Enforce standards'
    },
    outputs: [
      'Voice compliance editing exercise',
      'Red-flag language correction task'
    ]
  },
  {
    number: 5,
    title: 'Using Templates Strategically',
    subtitle: 'Compliance before customization',
    purpose: 'Prevent misuse of templates while teaching disciplined, compliant adaptation.',
    competencies: [
      'Understand template purpose and structure',
      'Distinguish use vs customization',
      'Maintain compliance while adapting',
      'Avoid common template errors'
    ],
    levels: {
      level1: 'Use templates correctly',
      level2: 'Adapt with justification',
      level3: 'Approve adaptations'
    },
    outputs: [
      'Template alignment exercise',
      'Customization risk analysis'
    ]
  },
  {
    number: 6,
    title: 'Drafting Core Narrative Sections',
    subtitle: 'From need to outcomes',
    purpose: 'Build foundational narrative competence aligned to funder logic.',
    competencies: [
      'Writing needs statements',
      'Program descriptions',
      'SMART outcomes',
      'Alignment to funder priorities'
    ],
    levels: {
      level1: 'Draft assigned sections',
      level2: 'Lead full narratives',
      level3: 'Set framing strategy'
    },
    outputs: [
      'Need statement draft',
      'Program narrative with outcomes'
    ]
  },
  {
    number: 7,
    title: 'Internal Review & Revision Cycles',
    subtitle: 'Professional response to feedback',
    purpose: 'Normalize revision as a quality control process, not a personal critique.',
    competencies: [
      'Pre-review quality checks',
      'Instruction compliance',
      'Internal QA checklist usage',
      'Professional feedback incorporation'
    ],
    levels: {
      level1: 'Revise responsively',
      level2: 'Self-QA before submission',
      level3: 'Final QA authority'
    },
    outputs: [
      'Revised draft with change log',
      'QA checklist completion'
    ]
  },
  {
    number: 8,
    title: 'Translating Vision into Fundable Strategy',
    subtitle: 'Strategy before writing',
    purpose: 'Shift consultants from transcription to strategic interpretation.',
    competencies: [
      'Strategic discovery',
      'Identifying fundable elements',
      'Strategy brief development',
      'Alignment to priorities'
    ],
    outputs: [
      'Strategy brief from raw client input'
    ]
  },
  {
    number: 9,
    title: 'Proposal Architecture & Story Spine',
    subtitle: 'Designing the reviewer journey',
    competencies: [
      'Proposal architecture',
      'Story spine creation',
      'Logical flow',
      'Reviewer journey mapping'
    ],
    outputs: [
      'Proposal outline + spine rationale'
    ]
  },
  {
    number: 10,
    title: 'Budgets, Scopes & Narrative Alignment',
    subtitle: 'Numbers tell a story too',
    competencies: [
      'Scope-to-cost alignment',
      'Budget justifications',
      'Unallowable cost identification',
      'Reimbursement logic'
    ],
    outputs: [
      'Budget narrative alignment exercise'
    ],
    critical: true
  },
  {
    number: 11,
    title: 'Client Communication Protocols',
    subtitle: 'Boundaries protect quality',
    competencies: [
      'Communication authorization rules',
      'CC and approval protocols',
      'Expectation management',
      'Boundary enforcement'
    ],
    outputs: [
      'Client email simulation (protocol review)'
    ]
  },
  {
    number: 12,
    title: 'QA, Risk & Self-Review',
    subtitle: 'Catching issues before they escalate',
    competencies: [
      'Advanced QA frameworks',
      'Risk identification',
      'Self-review discipline'
    ],
    outputs: [
      'Risk audit of sample proposal'
    ]
  },
  {
    number: 13,
    title: 'Mentoring Level 1 Consultants',
    subtitle: 'Developing others without lowering standards',
    competencies: [
      'Feedback delivery',
      'Coaching vs fixing',
      'Standards preservation',
      'Documentation'
    ],
    outputs: [
      'Mentorship plan + feedback sample'
    ],
    levelRequired: 'level-2'
  },
  {
    number: 14,
    title: 'Leading Proposal & Capture Strategy',
    subtitle: 'Setting direction, not just drafting',
    competencies: [
      'Capture strategy',
      'Cross-functional leadership',
      'Stakeholder alignment',
      'Strategic decision-making'
    ],
    levelRequired: 'level-2'
  },
  {
    number: 15,
    title: 'Advanced Reviewer Psychology',
    subtitle: 'Competitive positioning at scale',
    competencies: [
      'Evaluator bias',
      'Strategic positioning',
      'Differentiation'
    ],
    levelRequired: 'level-3'
  },
  {
    number: 16,
    title: 'Final QA & Risk Management',
    subtitle: 'Institutional protection role',
    competencies: [
      'Final authority protocols',
      'Risk escalation',
      'Compliance validation'
    ],
    levelRequired: 'level-3'
  },
  {
    number: 17,
    title: 'Coaching Across Skill Levels',
    subtitle: 'Systematic consultant development',
    competencies: [
      'Level-based coaching',
      'Performance evaluation',
      'Career development'
    ],
    levelRequired: 'level-3'
  },
  {
    number: 18,
    title: 'Pricing, Scope & Feasibility',
    subtitle: 'Business-minded consulting',
    competencies: [
      'Pricing logic',
      'Feasibility assessment',
      'Resource planning'
    ],
    levelRequired: 'level-3'
  },
  {
    number: 19,
    title: 'Training & Onboarding New Consultants',
    subtitle: '⚠ Scope Clarification (IMPORTANT)',
    purpose: 'Prepare senior consultants to support onboarding and training delivery under EIS leadership.',
    rationale: 'This module does NOT authorize independent trainers.',
    competencies: [
      'Training support techniques',
      'Onboarding facilitation assistance',
      'Assessment support',
      'Culture stewardship'
    ],
    levelRequired: 'level-3',
    critical: true,
    warning: 'Institutional Rule: This module does NOT authorize independent trainers.'
  }
];

export default function ModuleDetailView({ moduleNumber, currentLevel }) {
  const module = MODULES_DATA.find(m => m.number === moduleNumber);
  
  if (!module) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-slate-500">
          Module not found
        </CardContent>
      </Card>
    );
  }

  const canAccess = !module.levelRequired || (currentLevel && 
    ['level-1', 'level-2', 'level-3'].indexOf(currentLevel) >= 
    ['level-1', 'level-2', 'level-3'].indexOf(module.levelRequired));

  return (
    <Card className={`${module.critical ? 'border-2 border-amber-400' : ''}`}>
      <CardHeader className={module.critical ? 'bg-amber-50' : 'bg-slate-50'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#143A50] text-white flex items-center justify-center font-bold">
                {module.number}
              </div>
              <div>
                <CardTitle className="text-xl text-[#143A50]">{module.title}</CardTitle>
                <p className="text-sm text-slate-600 mt-1">{module.subtitle}</p>
              </div>
            </div>
            {module.warning && (
              <div className="flex items-center gap-2 p-2 bg-red-100 border border-red-300 rounded-lg mt-2">
                <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0" />
                <p className="text-xs text-red-800 font-semibold">{module.warning}</p>
              </div>
            )}
          </div>
          {module.levelRequired && (
            <Badge className={canAccess ? 'bg-green-600' : 'bg-slate-400'}>
              Requires {module.levelRequired.replace('-', ' ').toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Purpose & Rationale */}
        {(module.purpose || module.rationale) && (
          <div className="space-y-3">
            {module.purpose && (
              <div>
                <h4 className="font-semibold text-sm text-[#143A50] mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Purpose
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">{module.purpose}</p>
              </div>
            )}
            {module.rationale && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm text-blue-900 mb-1">Why This Module Exists</h4>
                <p className="text-sm text-blue-800">{module.rationale}</p>
              </div>
            )}
          </div>
        )}

        {/* Key Competencies */}
        <div>
          <h4 className="font-semibold text-sm text-[#143A50] mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Key Competencies (Overlap Across Contexts)
          </h4>
          <div className="space-y-2">
            {module.competencies.map((comp, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <CheckCircle2 className="w-4 h-4 text-[#143A50] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700">{comp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Level-Based Expectations */}
        {module.levels && (
          <div>
            <h4 className="font-semibold text-sm text-[#143A50] mb-3">Level-Based Expectations</h4>
            <div className="space-y-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-semibold text-sm text-green-900">🟢 Level 1: </span>
                <span className="text-sm text-green-800">{module.levels.level1}</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-semibold text-sm text-blue-900">🔵 Level 2: </span>
                <span className="text-sm text-blue-800">{module.levels.level2}</span>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="font-semibold text-sm text-purple-900">🟣 Level 3: </span>
                <span className="text-sm text-purple-800">{module.levels.level3}</span>
              </div>
            </div>
          </div>
        )}

        {/* Required Outputs */}
        {module.outputs && module.outputs.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-[#143A50] mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Required Outputs
            </h4>
            <ul className="space-y-2">
              {module.outputs.map((output, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-[#AC1A5B] font-bold">→</span>
                  {output}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { MODULES_DATA };