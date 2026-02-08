import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield } from 'lucide-react';

const LEGEND = {
  K: { label: 'Knowledge / Recognition', color: 'bg-blue-100 text-blue-800' },
  A: { label: 'Application / Drafting', color: 'bg-green-100 text-green-800' },
  L: { label: 'Leadership / Authority', color: 'bg-purple-100 text-purple-800' },
  QA: { label: 'Final Quality Authority', color: 'bg-red-100 text-red-800' },
  '⚠': { label: 'Escalation Required', color: 'bg-amber-100 text-amber-800' }
};

const CURRICULUM_MAP = [
  {
    id: 1,
    competency: 'Funding & Procurement Ecosystem',
    category: 'CORE',
    level1: {
      grants: 'K: Identify grant types, funder roles',
      rfp: 'K: Identify solicitation types & sections'
    },
    level2: {
      grants: 'A: Compare grant strategies',
      rfp: 'A: Compare bid types & risk'
    },
    level3: {
      grants: 'L: Advise pursue/no-pursue',
      rfp: 'L: Advise bid strategy & positioning'
    }
  },
  {
    id: 2,
    competency: 'Funder / Reviewer / Evaluator Psychology',
    category: 'CORE',
    level1: {
      grants: 'K: Recognize scoring criteria',
      rfp: 'K: Recognize evaluation factors'
    },
    level2: {
      grants: 'A: Anticipate reviewer reactions',
      rfp: 'A: Draft to evaluator priorities'
    },
    level3: {
      grants: 'L: Engineer scoring advantage',
      rfp: 'L: Shape evaluation experience'
    }
  },
  {
    id: 3,
    competency: 'Ethics, Compliance & Risk',
    category: 'CORE – NON-NEGOTIABLE',
    level1: {
      grants: 'K: Follow compliance rules',
      rfp: 'K: Follow instructions verbatim'
    },
    level2: {
      grants: 'A: Flag risks ⚠',
      rfp: 'A: Identify disqualifiers ⚠'
    },
    level3: {
      grants: 'QA: Final compliance authority',
      rfp: 'QA: Final compliance authority'
    },
    note: 'Aligned to professional ethics including Grant Professionals Association'
  },
  {
    id: 4,
    competency: 'EIS Voice, Brand & Credibility',
    category: 'CORE',
    level1: {
      grants: 'A: Apply approved voice',
      rfp: 'A: Apply approved voice'
    },
    level2: {
      grants: 'A: Adjust tone strategically',
      rfp: 'A: Balance precision & persuasion'
    },
    level3: {
      grants: 'QA: Enforce voice standards',
      rfp: 'QA: Enforce voice standards'
    }
  },
  {
    id: 5,
    competency: 'Proposal Architecture & Structure',
    category: 'CORE',
    level1: {
      grants: 'K/A: Follow required sections',
      rfp: 'K/A: Follow solicitation order'
    },
    level2: {
      grants: 'A: Design narrative flow',
      rfp: 'A: Design compliant structure'
    },
    level3: {
      grants: 'L: Approve or redesign',
      rfp: 'L: Approve or redesign'
    }
  },
  {
    id: 6,
    competency: 'Narrative Strategy & Writing',
    category: 'CORE',
    level1: {
      grants: 'A: Draft assigned sections',
      rfp: 'A: Draft assigned sections'
    },
    level2: {
      grants: 'A: Lead full narrative',
      rfp: 'A: Lead full response'
    },
    level3: {
      grants: 'L: Set strategic framing',
      rfp: 'L: Set strategic framing'
    }
  },
  {
    id: 7,
    competency: 'Budget, Pricing & Scope Alignment',
    category: 'CORE, HIGH RISK',
    level1: {
      grants: 'K: Understand budget logic',
      rfp: 'K: Understand pricing basics'
    },
    level2: {
      grants: 'A: Align narrative to numbers',
      rfp: 'A: Align scope & pricing'
    },
    level3: {
      grants: 'L: Advise feasibility',
      rfp: 'L: Support pricing decisions'
    }
  },
  {
    id: 8,
    competency: 'Client & Stakeholder Communication',
    category: 'CORE',
    level1: {
      grants: 'Observe only',
      rfp: 'Observe only'
    },
    level2: {
      grants: 'Communicate (CC required)',
      rfp: 'Communicate (CC required)'
    },
    level3: {
      grants: 'Lead strategy conversations',
      rfp: 'Lead strategy conversations'
    }
  },
  {
    id: 9,
    competency: 'Quality Assurance & Review Cycles',
    category: 'CORE',
    level1: {
      grants: 'Revise based on feedback',
      rfp: 'Revise based on feedback'
    },
    level2: {
      grants: 'Self-QA & peer review',
      rfp: 'Self-QA & peer review'
    },
    level3: {
      grants: 'QA: Final authority',
      rfp: 'QA: Final authority'
    }
  },
  {
    id: 10,
    competency: 'Mentorship, Onboarding & Training Support',
    category: 'ADVANCED',
    level1: {
      grants: 'Receive mentorship',
      rfp: 'Receive mentorship'
    },
    level2: {
      grants: 'Mentor Level 1',
      rfp: 'Mentor Level 1'
    },
    level3: {
      grants: 'Support training (non-authorized)',
      rfp: 'Support training (non-authorized)'
    },
    note: 'Level 3 consultants do NOT hold independent trainer authorization'
  }
];

const getLevelBadge = (level) => {
  switch(level) {
    case 'level-1': return { emoji: '🟢', label: 'L1', color: 'bg-green-100 text-green-800' };
    case 'level-2': return { emoji: '🔵', label: 'L2', color: 'bg-blue-100 text-blue-800' };
    case 'level-3': return { emoji: '🟣', label: 'L3', color: 'bg-purple-100 text-purple-800' };
    default: return { emoji: '', label: '', color: '' };
  }
};

const parseIndicator = (text) => {
  const match = text.match(/^([KAL]|QA|⚠):/);
  return match ? match[1] : null;
};

export default function VisualCurriculumMap({ currentLevel }) {
  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card className="border-2 border-[#143A50]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            How to Read the Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(LEGEND).map(([key, { label, color }]) => (
              <div key={key} className="flex items-center gap-2">
                <Badge className={color}>{key}</Badge>
                <span className="text-xs text-slate-600">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border">
            <p className="text-xs text-slate-700">
              <strong>Level Indicators:</strong> 🟢 L1 (Foundation) • 🔵 L2 (Intermediate) • 🟣 L3 (Senior)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Full Map */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
          <CardTitle className="text-xl">
            EIS Strategic Translator Curriculum Map
          </CardTitle>
          <p className="text-sm text-white/80">Level × Competency × Context</p>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="full" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
              <TabsTrigger value="full">Full Map</TabsTrigger>
              <TabsTrigger value="grants">Grants Lens</TabsTrigger>
              <TabsTrigger value="rfp">RFP/RFQ/RFI Lens</TabsTrigger>
            </TabsList>

            <TabsContent value="full" className="m-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="border border-slate-300 p-3 text-left text-sm font-semibold w-64">#</th>
                      <th className="border border-slate-300 p-3 text-left text-sm font-semibold">Competency</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold">🟢 L1 - Grants</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold">🟢 L1 - RFP</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold">🔵 L2 - Grants</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold">🔵 L2 - RFP</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold">🟣 L3 - Grants</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold">🟣 L3 - RFP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CURRICULUM_MAP.map((comp) => {
                      const l1Indicator = parseIndicator(comp.level1.grants);
                      const l2Indicator = parseIndicator(comp.level2.grants);
                      const l3Indicator = parseIndicator(comp.level3.grants);
                      
                      return (
                        <tr key={comp.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#143A50]">{comp.id}</span>
                              <Badge variant="outline" className="text-xs">{comp.category}</Badge>
                            </div>
                          </td>
                          <td className="border border-slate-300 p-3">
                            <div className="font-semibold text-sm text-slate-900">{comp.competency}</div>
                            {comp.note && (
                              <div className="text-xs text-amber-700 mt-1 flex items-start gap-1">
                                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{comp.note}</span>
                              </div>
                            )}
                          </td>
                          <td className="border border-slate-300 p-2 text-xs bg-green-50/30">{comp.level1.grants}</td>
                          <td className="border border-slate-300 p-2 text-xs bg-green-50/30">{comp.level1.rfp}</td>
                          <td className="border border-slate-300 p-2 text-xs bg-blue-50/30">{comp.level2.grants}</td>
                          <td className="border border-slate-300 p-2 text-xs bg-blue-50/30">{comp.level2.rfp}</td>
                          <td className="border border-slate-300 p-2 text-xs bg-purple-50/30">{comp.level3.grants}</td>
                          <td className="border border-slate-300 p-2 text-xs bg-purple-50/30">{comp.level3.rfp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="grants" className="m-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border border-slate-300 p-3 text-left text-sm font-semibold">#</th>
                      <th className="border border-slate-300 p-3 text-left text-sm font-semibold">Competency</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold bg-green-50">🟢 Level 1</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold bg-blue-50">🔵 Level 2</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold bg-purple-50">🟣 Level 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CURRICULUM_MAP.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-3 font-bold text-[#143A50]">{comp.id}</td>
                        <td className="border border-slate-300 p-3">
                          <div className="font-semibold text-sm">{comp.competency}</div>
                          <Badge variant="outline" className="text-xs mt-1">{comp.category}</Badge>
                        </td>
                        <td className="border border-slate-300 p-3 text-sm bg-green-50/50">{comp.level1.grants}</td>
                        <td className="border border-slate-300 p-3 text-sm bg-blue-50/50">{comp.level2.grants}</td>
                        <td className="border border-slate-300 p-3 text-sm bg-purple-50/50">{comp.level3.grants}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="rfp" className="m-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border border-slate-300 p-3 text-left text-sm font-semibold">#</th>
                      <th className="border border-slate-300 p-3 text-left text-sm font-semibold">Competency</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold bg-green-50">🟢 Level 1</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold bg-blue-50">🔵 Level 2</th>
                      <th className="border border-slate-300 p-3 text-center text-sm font-semibold bg-purple-50">🟣 Level 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CURRICULUM_MAP.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-3 font-bold text-[#143A50]">{comp.id}</td>
                        <td className="border border-slate-300 p-3">
                          <div className="font-semibold text-sm">{comp.competency}</div>
                          <Badge variant="outline" className="text-xs mt-1">{comp.category}</Badge>
                        </td>
                        <td className="border border-slate-300 p-3 text-sm bg-green-50/50">{comp.level1.rfp}</td>
                        <td className="border border-slate-300 p-3 text-sm bg-blue-50/50">{comp.level2.rfp}</td>
                        <td className="border border-slate-300 p-3 text-sm bg-purple-50/50">{comp.level3.rfp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Critical Rules */}
      <Card className="border-2 border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Critical Non-Negotiables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border border-red-200">
            <p className="text-sm font-semibold text-red-900 mb-1">Competency #3: Ethics & Compliance</p>
            <p className="text-sm text-red-800">
              Aligned to professional ethics including Grant Professionals Association. Level 3 holds final compliance authority.
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-red-200">
            <p className="text-sm font-semibold text-red-900 mb-1">Competency #7: Budget & Pricing</p>
            <p className="text-sm text-red-800">
              HIGH RISK area. Level 1 observes only. Level 3 advises on feasibility and pricing decisions.
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-red-200">
            <p className="text-sm font-semibold text-red-900 mb-1">Competency #10: Training Authorization</p>
            <p className="text-sm text-red-800">
              ❗ Explicit Rule: Level 3 consultants do NOT hold independent trainer authorization. They support training but cannot certify others.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}