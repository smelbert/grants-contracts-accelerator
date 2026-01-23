import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, AlertCircle, XCircle, ArrowRight, Award, TrendingUp, Wrench } from 'lucide-react';
import AssessmentResults from '../components/assessment/AssessmentResults';

const ASSESSMENT_DATA = {
  level1: {
    title: "Level 1 — Foundational Readiness",
    subtitle: "Are you structurally eligible to pursue grants?",
    maxScore: 15,
    sections: [
      {
        name: "Business Status & Structure",
        items: [
          "Organization is legally registered (LLC, Corporation, nonprofit, etc.)",
          "EIN obtained",
          "Business/organizational bank account established",
          "Legal status clearly identified (for-profit, nonprofit, fiscal sponsor)"
        ]
      },
      {
        name: "Mission & Impact",
        items: [
          "Clear mission statement",
          "Defined population or community served",
          "Specific community, workforce, or economic impact articulated"
        ]
      },
      {
        name: "Services & Market",
        items: [
          "Services or programs clearly defined",
          "Target customers/participants identified",
          "Evidence of demand (interest, pilots, MOUs, contracts, waitlists)"
        ]
      },
      {
        name: "Financial Basics",
        items: [
          "Startup or operating budget drafted",
          "Clear funding amount identified",
          "Planned and allowable use of funds outlined"
        ]
      },
      {
        name: "Mindset & Ethics",
        items: [
          "Understanding that grants are competitive, not guaranteed",
          "Willingness to invest in preparation before applying",
          "Understanding that grant writers cannot be paid from grant funds"
        ]
      }
    ]
  },
  level2: {
    title: "Level 2 — Fundability Readiness",
    subtitle: "Would a funder trust you with their money?",
    maxScore: 20,
    sections: [
      {
        name: "Governance & Leadership",
        items: [
          "Leadership roles clearly defined (Executive, Program, Finance)",
          "Decision-making authority is clear",
          "Board of Directors is active (if nonprofit)",
          "Board understands fiduciary and fundraising responsibilities"
        ]
      },
      {
        name: "Program Design",
        items: [
          "Clear problem/need statement supported by data",
          "Program activities clearly outlined",
          "Logical connection between activities → outcomes",
          "Realistic implementation timeline identified"
        ]
      },
      {
        name: "Evaluation & Outcomes",
        items: [
          "Outputs and outcomes clearly defined",
          "Success metrics identified",
          "Data collection method identified",
          "Responsibility for evaluation assigned"
        ]
      },
      {
        name: "Financial Controls",
        items: [
          "Ability to track grant funds separately",
          "Basic financial controls in place",
          "Experience managing restricted funds or contracts",
          "Cash flow capacity for reimbursement-based grants"
        ]
      },
      {
        name: "Partnerships",
        items: [
          "Strategic partners identified (if applicable)",
          "Partner roles clearly defined",
          "Willingness to formalize partnerships (MOUs/letters)"
        ]
      }
    ]
  },
  level3: {
    title: "Level 3 — Competitive Readiness",
    subtitle: "Are you ready for state, federal, and highly competitive funding?",
    maxScore: 20,
    sections: [
      {
        name: "Compliance & Infrastructure",
        items: [
          "Organization is in good standing with the state",
          "No unresolved audit or compliance issues",
          "Required registrations completed (e.g., SAM.gov / UEI if applicable)",
          "Insurance and risk requirements can be met"
        ]
      },
      {
        name: "Grant Strategy",
        items: [
          "Clear understanding of funder priorities",
          "Ability to assess alignment (and say no to misfit funding)",
          "Grant calendar or pipeline identified",
          "Long-term sustainability beyond one grant considered"
        ]
      },
      {
        name: "Grant History & Learning",
        items: [
          "Prior grant or contract experience (awarded or not)",
          "Ability to articulate lessons learned",
          "Willingness to respond to reviewer feedback",
          "Basic grant tracking system in place"
        ]
      },
      {
        name: "Capacity & Professional Standards",
        items: [
          "Internal point person for grants identified",
          "Timely review and approval processes established",
          "Agreement that payment for grant writing is due regardless of award",
          "Understanding that writing ≠ funding guarantee"
        ]
      }
    ]
  }
};

export default function GrantReadinessAssessmentPage() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [responses, setResponses] = useState({
    level1: {},
    level2: {},
    level3: {}
  });
  const [showResults, setShowResults] = useState(false);

  const queryClient = useQueryClient();

  const { data: previousAssessments = [] } = useQuery({
    queryKey: ['grantReadinessAssessments'],
    queryFn: () => base44.entities.GrantReadinessAssessment.list('-assessment_date')
  });

  const saveAssessmentMutation = useMutation({
    mutationFn: (data) => base44.entities.GrantReadinessAssessment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grantReadinessAssessments'] });
    }
  });

  const handleToggle = (level, itemKey, checked) => {
    setResponses({
      ...responses,
      [level]: {
        ...responses[level],
        [itemKey]: checked
      }
    });
  };

  const calculateScore = (level) => {
    return Object.values(responses[level]).filter(Boolean).length;
  };

  const handleComplete = () => {
    const level1Score = calculateScore('level1');
    const level2Score = calculateScore('level2');
    const level3Score = calculateScore('level3');
    const totalScore = level1Score + level2Score + level3Score;

    let readinessLevel;
    if (totalScore >= 40) readinessLevel = 'apply_now';
    else if (totalScore >= 25) readinessLevel = 'prepare_first';
    else readinessLevel = 'foundation_building';

    const assessmentData = {
      assessment_date: new Date().toISOString(),
      level_1_responses: responses.level1,
      level_1_score: level1Score,
      level_2_responses: responses.level2,
      level_2_score: level2Score,
      level_3_responses: responses.level3,
      level_3_score: level3Score,
      total_score: totalScore,
      readiness_level: readinessLevel
    };

    saveAssessmentMutation.mutate(assessmentData);
    setShowResults(true);
  };

  const renderLevel = (levelKey, levelData) => {
    let itemIndex = 0;
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{levelData.title}</h2>
          <p className="text-slate-600 italic">{levelData.subtitle}</p>
        </div>

        {levelData.sections.map((section, sectionIdx) => (
          <Card key={sectionIdx}>
            <CardHeader>
              <CardTitle className="text-lg">{section.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => {
                const key = `item_${itemIndex++}`;
                return (
                  <div key={key} className="flex items-start gap-3">
                    <Checkbox
                      id={key}
                      checked={responses[levelKey]?.[key] || false}
                      onCheckedChange={(checked) => handleToggle(levelKey, key, checked)}
                      className="mt-0.5"
                    />
                    <label htmlFor={key} className="text-sm text-slate-700 cursor-pointer flex-1">
                      {item}
                    </label>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center justify-between pt-4">
          <div className="text-lg font-semibold text-slate-900">
            Level {currentLevel} Score: {calculateScore(levelKey)} / {levelData.maxScore}
          </div>
          {currentLevel < 3 ? (
            <Button onClick={() => setCurrentLevel(currentLevel + 1)} className="bg-emerald-600 hover:bg-emerald-700">
              Next Level <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
              Complete Assessment
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (showResults) {
    const totalScore = calculateScore('level1') + calculateScore('level2') + calculateScore('level3');
    return (
      <AssessmentResults
        totalScore={totalScore}
        level1Score={calculateScore('level1')}
        level2Score={calculateScore('level2')}
        level3Score={calculateScore('level3')}
        onRetake={() => {
          setShowResults(false);
          setCurrentLevel(1);
          setResponses({ level1: {}, level2: {}, level3: {} });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Grant Readiness Assessment™</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            This tool helps organizations assess readiness to pursue grant funding responsibly and strategically. 
            Scoring high does not guarantee funding—but it significantly increases competitiveness.
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-700">Assessment Progress</span>
              <span className="text-sm text-slate-600">Level {currentLevel} of 3</span>
            </div>
            <Progress value={(currentLevel / 3) * 100} className="h-2" />
            <div className="flex justify-between mt-3 text-xs text-slate-600">
              <span className={currentLevel >= 1 ? 'text-emerald-600 font-medium' : ''}>Foundational</span>
              <span className={currentLevel >= 2 ? 'text-emerald-600 font-medium' : ''}>Fundability</span>
              <span className={currentLevel >= 3 ? 'text-emerald-600 font-medium' : ''}>Competitive</span>
            </div>
          </CardContent>
        </Card>

        {/* Level Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={currentLevel === 1 ? 'default' : 'outline'}
            onClick={() => setCurrentLevel(1)}
            className={currentLevel === 1 ? 'bg-emerald-600' : ''}
          >
            Level 1
          </Button>
          <Button
            variant={currentLevel === 2 ? 'default' : 'outline'}
            onClick={() => setCurrentLevel(2)}
            className={currentLevel === 2 ? 'bg-emerald-600' : ''}
          >
            Level 2
          </Button>
          <Button
            variant={currentLevel === 3 ? 'default' : 'outline'}
            onClick={() => setCurrentLevel(3)}
            className={currentLevel === 3 ? 'bg-emerald-600' : ''}
          >
            Level 3
          </Button>
        </div>

        {/* Current Level Content */}
        {currentLevel === 1 && renderLevel('level1', ASSESSMENT_DATA.level1)}
        {currentLevel === 2 && renderLevel('level2', ASSESSMENT_DATA.level2)}
        {currentLevel === 3 && renderLevel('level3', ASSESSMENT_DATA.level3)}

        {/* Previous Assessments */}
        {previousAssessments.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Previous Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previousAssessments.slice(0, 3).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="text-slate-600">
                      {new Date(assessment.assessment_date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{assessment.total_score} / 55</span>
                      <Badge className={
                        assessment.readiness_level === 'apply_now' ? 'bg-green-100 text-green-800' :
                        assessment.readiness_level === 'prepare_first' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {assessment.readiness_level.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}