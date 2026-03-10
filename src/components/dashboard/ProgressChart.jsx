import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function ProgressChart({ assessments = [] }) {
  // Prepare data from pre/post assessments
  const chartData = assessments
    .filter(a => a.assessment_type === 'pre' || a.assessment_type === 'post')
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .map((a, idx) => ({
      name: a.assessment_type === 'pre' ? 'Pre' : 'Post',
      score: a.total_score || 0,
      legal: a.legal_readiness_score || 0,
      financial: a.financial_readiness_score || 0,
      confidence: a.confidence_score || 0,
      date: new Date(a.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : 0;
  const previousScore = chartData.length > 1 ? chartData[chartData.length - 2].score : 0;
  const improvement = latestScore - previousScore;

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#143A50]" />
            Progress Over Time
          </CardTitle>
          <CardDescription>Track your growth across assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">Complete assessments to see progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#143A50]" />
              Progress Over Time
            </CardTitle>
            <CardDescription>Track your growth across assessments</CardDescription>
          </div>
          {improvement !== 0 && (
            <div className={`text-sm font-bold ${improvement > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {improvement > 0 ? '↑' : '↓'} {Math.abs(improvement)} points
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Score Trend */}
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">Overall Score Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#143A50" 
                  strokeWidth={2}
                  dot={{ fill: '#143A50', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          {chartData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-3">Score by Category</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend />
                  <Bar dataKey="legal" fill="#143A50" name="Legal Readiness" />
                  <Bar dataKey="financial" fill="#1E4F58" name="Financial Readiness" />
                  <Bar dataKey="confidence" fill="#E5C089" name="Confidence" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}