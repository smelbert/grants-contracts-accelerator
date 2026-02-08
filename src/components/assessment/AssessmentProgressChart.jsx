import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function AssessmentProgressChart({ assessments }) {
  if (!assessments || assessments.length === 0) {
    return null;
  }

  // Prepare timeline data
  const timelineData = assessments
    .slice()
    .reverse()
    .map((assessment, idx) => ({
      assessment: `#${idx + 1}`,
      date: new Date(assessment.assessment_date).toLocaleDateString(),
      score: assessment.overall_score,
      legal: assessment.score_breakdown?.legal_status?.score || 0,
      financial: assessment.score_breakdown?.financial_records?.score || 0,
      program: assessment.score_breakdown?.program_clarity?.score || 0,
      capacity: assessment.score_breakdown?.capacity?.score || 0
    }));

  // Prepare radar data for latest assessment
  const latestAssessment = assessments[0];
  const radarData = latestAssessment.score_breakdown ? [
    {
      category: 'Legal Status',
      value: latestAssessment.score_breakdown.legal_status?.percentage || 0,
      fullMark: 100
    },
    {
      category: 'Financial Records',
      value: latestAssessment.score_breakdown.financial_records?.percentage || 0,
      fullMark: 100
    },
    {
      category: 'Program Clarity',
      value: latestAssessment.score_breakdown.program_clarity?.percentage || 0,
      fullMark: 100
    },
    {
      category: 'Capacity',
      value: latestAssessment.score_breakdown.capacity?.percentage || 0,
      fullMark: 100
    }
  ] : [];

  // Calculate progress trend
  const getProgressTrend = () => {
    if (assessments.length < 2) return null;
    
    const latest = assessments[0].overall_score;
    const previous = assessments[1].overall_score;
    const change = latest - previous;
    
    return {
      change,
      percentage: previous > 0 ? ((change / previous) * 100).toFixed(1) : 0,
      icon: change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus,
      color: change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-slate-600'
    };
  };

  const trend = getProgressTrend();

  return (
    <div className="space-y-6">
      {trend && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${trend.change > 0 ? 'bg-green-50' : trend.change < 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                <trend.icon className={`w-8 h-8 ${trend.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-600">Progress Since Last Assessment</p>
                <p className={`text-2xl font-bold ${trend.color}`}>
                  {trend.change > 0 ? '+' : ''}{trend.change} points ({trend.change > 0 ? '+' : ''}{trend.percentage}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Progress Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="breakdown">Current Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="assessment" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#143A50" 
                    strokeWidth={3}
                    name="Overall Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="legal" 
                    stroke="#1E4F58" 
                    strokeWidth={2}
                    name="Legal"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="financial" 
                    stroke="#E5C089" 
                    strokeWidth={2}
                    name="Financial"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="program" 
                    stroke="#AC1A5B" 
                    strokeWidth={2}
                    name="Program"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="capacity" 
                    stroke="#A65D40" 
                    strokeWidth={2}
                    name="Capacity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="breakdown">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar 
                    name="Current Level" 
                    dataKey="value" 
                    stroke="#143A50" 
                    fill="#143A50" 
                    fillOpacity={0.3} 
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center text-sm text-slate-600">
                Each axis shows percentage of maximum possible score in that category
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {assessments.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['legal_status', 'financial_records', 'program_clarity', 'capacity'].map((category) => {
                const latest = assessments[0].score_breakdown?.[category]?.score || 0;
                const previous = assessments[1].score_breakdown?.[category]?.score || 0;
                const change = latest - previous;
                const label = category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className={`font-semibold ${
                      change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {change > 0 ? '+' : ''}{change} points
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}