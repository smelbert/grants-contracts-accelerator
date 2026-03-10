import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function ReadinessScoreCard({ readinessProfile, assessments }) {
  // Calculate overall score from available sources
  const getOverallScore = () => {
    const scores = [];
    
    // From ProgramAssessment (post-assessment if available)
    if (assessments?.length > 0) {
      const postAssessment = assessments.find(a => a.assessment_type === 'post');
      if (postAssessment?.total_score) scores.push(postAssessment.total_score);
    }
    
    // From ReadinessProfile scores
    if (readinessProfile?.governance_score) scores.push(readinessProfile.governance_score);
    if (readinessProfile?.financial_readiness_score) scores.push(readinessProfile.financial_readiness_score);
    if (readinessProfile?.operational_capacity_score) scores.push(readinessProfile.operational_capacity_score);
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getStatus = (score) => {
    if (score < 40) return 'Early Stage';
    if (score < 60) return 'Developing';
    if (score < 80) return 'Ready';
    return 'Advanced';
  };

  const getStatusColor = (score) => {
    if (score < 40) return 'bg-red-100 text-red-700';
    if (score < 60) return 'bg-amber-100 text-amber-700';
    if (score < 80) return 'bg-emerald-100 text-emerald-700';
    return 'bg-blue-100 text-blue-700';
  };

  const score = getOverallScore();
  const status = getStatus(score);
  const statusColor = getStatusColor(score);

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-2 border-[#143A50]/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#143A50]" />
            Grant Readiness Score
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-[#143A50] mb-2">{score}</div>
          <div className="text-sm text-slate-600 mb-3">out of 100</div>
          <Badge className={statusColor}>{status}</Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium text-slate-900">{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
          <div className="text-center">
            <div className="text-sm font-medium text-slate-900">{readinessProfile?.governance_score || 0}</div>
            <div className="text-xs text-slate-600">Governance</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-slate-900">{readinessProfile?.financial_readiness_score || 0}</div>
            <div className="text-xs text-slate-600">Financial</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-slate-900">{readinessProfile?.operational_capacity_score || 0}</div>
            <div className="text-xs text-slate-600">Operations</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-slate-900">{readinessProfile?.classification_state === 'grant_eligible' ? 'Yes' : 'No'}</div>
            <div className="text-xs text-slate-600">Grant Eligible</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}