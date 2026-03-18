import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FundingReadinessAssessmentForm from '@/components/assessment/FundingReadinessAssessmentForm';
import AssessmentProgressChart from '@/components/assessment/AssessmentProgressChart';
import { FileText, History, TrendingUp } from 'lucide-react';
import FundingReadinessGapDashboard from '@/components/assessment/FundingReadinessGapDashboard';

export default function FundingReadinessAssessmentPage() {
  const [activeTab, setActiveTab] = useState('assessment');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: assessments = [], refetch } = useQuery({
    queryKey: ['funding-readiness-assessments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.FundingReadinessAssessment.filter({
        user_email: user.email
      }, '-assessment_date');
    },
    enabled: !!user?.email
  });

  const latestAssessment = assessments[0];

  const getLevelColor = (level) => {
    switch (level) {
      case 'highly_ready': return 'text-green-600 bg-green-50';
      case 'ready': return 'text-blue-600 bg-blue-50';
      case 'building_readiness': return 'text-amber-600 bg-amber-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  const getLevelLabel = (level) => {
    return level?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#143A50] mb-2">
            Funding Readiness Assessment
          </h1>
          <p className="text-slate-600">
            Evaluate your organization's readiness to pursue grants and contracts
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Take Assessment
            </TabsTrigger>
            <TabsTrigger value="current" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Score &amp; Gap Plan
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment">
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-[#143A50] mb-2">Before You Begin</h3>
              <ul className="text-sm text-slate-700 space-y-1 list-disc ml-5">
                <li>Answer honestly - this helps you plan effectively</li>
                <li>Takes about 5 minutes to complete</li>
                <li>Results are saved and you can track progress over time</li>
              </ul>
            </div>
            <FundingReadinessAssessmentForm onComplete={() => {
              refetch();
              setActiveTab('current');
            }} />
          </TabsContent>

          <TabsContent value="current">
            {latestAssessment ? (
              <div className="space-y-6">
                <Card className={`border-2 ${getLevelColor(latestAssessment.readiness_level)}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl">Your Current Readiness</CardTitle>
                    <CardDescription>
                      Assessed on {new Date(latestAssessment.assessment_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-5xl font-bold text-[#143A50]">
                          {latestAssessment.overall_score}/100
                        </div>
                        <div className={`text-lg font-semibold mt-2 px-3 py-1 rounded-full inline-block ${getLevelColor(latestAssessment.readiness_level)}`}>
                          {getLevelLabel(latestAssessment.readiness_level)}
                        </div>
                      </div>
                    </div>

                    {latestAssessment.score_breakdown && (
                      <div className="space-y-3 mb-6">
                        <h4 className="font-semibold text-[#143A50]">Score Breakdown</h4>
                        {Object.entries(latestAssessment.score_breakdown).map(([key, value]) => {
                          const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                          return (
                            <div key={key}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{label}</span>
                                <span className="text-slate-600">{value.score}/{value.max} points</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-[#143A50] h-2 rounded-full transition-all" 
                                  style={{ width: `${value.percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Legal Status</span>
                          <span className="text-sm text-slate-600">{latestAssessment.legal_status}</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Financial Records</span>
                          <span className="text-sm text-slate-600">{latestAssessment.financial_records}</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Program Clarity</span>
                          <span className="text-sm text-slate-600">{latestAssessment.program_clarity}</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Capacity</span>
                          <span className="text-sm text-slate-600">{latestAssessment.capacity}</span>
                        </div>
                      </div>
                    </div>

                    {latestAssessment.notes && (
                      <div className="mt-4 bg-slate-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-slate-700 mb-1">Notes:</p>
                        <p className="text-sm text-slate-600">{latestAssessment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <FundingReadinessGapDashboard assessment={latestAssessment} />

                {assessments.length > 0 && (
                  <AssessmentProgressChart assessments={assessments} />
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No assessment completed yet</p>
                  <p className="text-sm text-slate-500 mt-2">Take your first assessment to see your readiness score</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            {assessments.length > 0 ? (
              <div className="space-y-4">
                {assessments.map((assessment, idx) => (
                  <Card key={assessment.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Assessment #{assessments.length - idx}
                          </CardTitle>
                          <CardDescription>
                            {new Date(assessment.assessment_date).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-[#143A50]">
                            {assessment.overall_score}/100
                          </div>
                          <div className={`text-sm font-semibold mt-1 px-2 py-1 rounded-full ${getLevelColor(assessment.readiness_level)}`}>
                            {getLevelLabel(assessment.readiness_level)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No assessment history yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}