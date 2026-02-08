import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Lock, AlertCircle } from 'lucide-react';

const COMPETENCY_MATRIX = [
  {
    area: 'Funding Ecosystem Knowledge',
    level1: 'Identify types & rules',
    level2: 'Compare mechanisms & strategies',
    level3: 'Advise on pursuit decisions',
    description: 'Understanding the landscape of grants, contracts, and funding mechanisms'
  },
  {
    area: 'Funder / Reviewer Perspective',
    level1: 'Recognize scoring criteria',
    level2: 'Anticipate reviewer reactions',
    level3: 'Design strategy to influence scores',
    description: 'Thinking from the perspective of decision-makers and evaluators'
  },
  {
    area: 'Compliance & Ethics',
    level1: 'Follow rules & templates',
    level2: 'Flag risks & gaps',
    level3: 'Final authority on compliance',
    description: 'Maintaining ethical standards and regulatory compliance'
  },
  {
    area: 'EIS Voice & Brand',
    level1: 'Apply voice consistently',
    level2: 'Adjust voice strategically',
    level3: 'Enforce & teach voice standards',
    description: 'Representing EIS brand and communication standards'
  },
  {
    area: 'Proposal Architecture',
    level1: 'Follow structure',
    level2: 'Design structure',
    level3: 'Approve or redesign structure',
    description: 'Organizing and structuring proposals effectively'
  },
  {
    area: 'Narrative Strategy',
    level1: 'Draft assigned sections',
    level2: 'Lead full narratives',
    level3: 'Set strategic framing',
    description: 'Crafting compelling and strategic narratives'
  },
  {
    area: 'Budget & Scope Alignment',
    level1: 'Understand basics',
    level2: 'Co-develop & align',
    level3: 'Advise on pricing & feasibility',
    description: 'Aligning financial planning with program scope'
  },
  {
    area: 'Client Communication',
    level1: 'Observe only',
    level2: 'Communicate (copied)',
    level3: 'Lead client strategy',
    description: 'Managing client relationships and expectations'
  },
  {
    area: 'Quality Assurance',
    level1: 'Revise based on feedback',
    level2: 'Self-QA & peer review',
    level3: 'Final QA authority',
    description: 'Ensuring quality and accuracy of deliverables'
  },
  {
    area: 'Mentorship & Training',
    level1: 'Receive mentorship',
    level2: 'Mentor Level 1',
    level3: 'Train & certify others',
    description: 'Developing and supporting team members'
  }
];

const CONTEXT_LENSES = {
  shared: [
    'Strategic translation',
    'Reviewer psychology',
    'Compliance logic',
    'Ethics & credibility',
    'Proposal architecture',
    'Internal QA processes'
  ],
  grants: {
    decisionAuthority: 'Program officers, panels',
    evaluationStyle: 'Narrative + mission fit',
    budgets: 'Programmatic justification',
    languageTone: 'Persuasive & impact-driven',
    risk: 'Mission drift'
  },
  procurement: {
    decisionAuthority: 'Procurement officers, evaluators',
    evaluationStyle: 'Point-based + compliance-heavy',
    budgets: 'Cost realism & scope alignment',
    languageTone: 'Precise, contractual, defensible',
    risk: 'Disqualification'
  }
};

export default function CompetencyMatrix({ currentLevel, completedCompetencies = [] }) {
  const getLevelColor = (level) => {
    switch(level) {
      case 'level-1': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'level-2': return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'level-3': return 'bg-amber-50 border-amber-200 text-amber-900';
      default: return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  const isCompetencyCompleted = (area, level) => {
    return completedCompetencies.some(c => 
      c.competency_area === area && c.level === level
    );
  };

  const canAccessLevel = (level) => {
    if (!currentLevel) return false;
    const levels = ['level-1', 'level-2', 'level-3'];
    const currentIndex = levels.indexOf(currentLevel);
    const targetIndex = levels.indexOf(level);
    return targetIndex <= currentIndex;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>EIS Strategic Translator Competency Matrix</span>
            {currentLevel && (
              <Badge className={getLevelColor(currentLevel)}>
                Your Level: {currentLevel.replace('-', ' ').toUpperCase()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-6">
            This matrix shows the same competencies across all levels, with increasing depth, authority, and risk exposure as you advance.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-3 text-left font-semibold">Competency Area</th>
                  <th className="border border-slate-300 p-3 text-left font-semibold">Level 1: Foundation</th>
                  <th className="border border-slate-300 p-3 text-left font-semibold">Level 2: Intermediate</th>
                  <th className="border border-slate-300 p-3 text-left font-semibold">Level 3: Senior</th>
                </tr>
              </thead>
              <tbody>
                {COMPETENCY_MATRIX.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-3">
                      <div className="font-semibold text-sm text-[#143A50]">{comp.area}</div>
                      <div className="text-xs text-slate-500 mt-1">{comp.description}</div>
                    </td>
                    <td className={`border border-slate-300 p-3 ${!canAccessLevel('level-1') ? 'opacity-50' : ''}`}>
                      <div className="flex items-start gap-2">
                        {isCompetencyCompleted(comp.area, 'level-1') ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : !canAccessLevel('level-1') ? (
                          <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm">{comp.level1}</span>
                      </div>
                    </td>
                    <td className={`border border-slate-300 p-3 ${!canAccessLevel('level-2') ? 'opacity-50' : ''}`}>
                      <div className="flex items-start gap-2">
                        {isCompetencyCompleted(comp.area, 'level-2') ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : !canAccessLevel('level-2') ? (
                          <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm">{comp.level2}</span>
                      </div>
                    </td>
                    <td className={`border border-slate-300 p-3 ${!canAccessLevel('level-3') ? 'opacity-50' : ''}`}>
                      <div className="flex items-start gap-2">
                        {isCompetencyCompleted(comp.area, 'level-3') ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : !canAccessLevel('level-3') ? (
                          <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm">{comp.level3}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grants vs. RFPs/RFQs/RFIs — Context Lenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Rather than separate tracks, we teach core competencies once and apply them through different contexts.
          </p>

          <Tabs defaultValue="shared">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="shared">Shared Foundations</TabsTrigger>
              <TabsTrigger value="grants">Grants Lens</TabsTrigger>
              <TabsTrigger value="procurement">Procurement Lens</TabsTrigger>
            </TabsList>

            <TabsContent value="shared" className="space-y-3">
              <p className="text-sm text-slate-600 mb-3">
                These foundations are taught once and applied everywhere:
              </p>
              <div className="grid gap-2">
                {CONTEXT_LENSES.shared.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                    <CheckCircle2 className="w-4 h-4 text-[#143A50]" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="grants" className="space-y-3">
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-sm mb-1">Decision Authority</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.grants.decisionAuthority}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-sm mb-1">Evaluation Style</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.grants.evaluationStyle}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-sm mb-1">Budgets</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.grants.budgets}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-sm mb-1">Language Tone</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.grants.languageTone}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-sm mb-1">Primary Risk</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.grants.risk}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="procurement" className="space-y-3">
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-sm mb-1">Decision Authority</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.procurement.decisionAuthority}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-sm mb-1">Evaluation Style</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.procurement.evaluationStyle}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-sm mb-1">Budgets</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.procurement.budgets}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-sm mb-1">Language Tone</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.procurement.languageTone}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-sm mb-1">Primary Risk</h4>
                  <p className="text-sm text-slate-700">{CONTEXT_LENSES.procurement.risk}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}