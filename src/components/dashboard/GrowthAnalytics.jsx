import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Target, TrendingUp } from 'lucide-react';

export default function GrowthAnalytics({ projects = [], readinessProfile = null, assessments = [] }) {
  // Calculate funding pipeline analytics
  const totalFundingAsked = projects
    .filter(p => ['planning', 'in_progress', 'review', 'submitted'].includes(p.status))
    .reduce((sum, p) => sum + (p.amount_asked || 0), 0);

  const totalFundingAwarded = projects
    .filter(p => p.status === 'completed' && p.amount_awarded)
    .reduce((sum, p) => sum + (p.amount_awarded || 0), 0);

  const successRate = projects.length > 0 
    ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100)
    : 0;

  // Status distribution
  const statusCounts = {
    planning: projects.filter(p => p.status === 'planning').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    submitted: projects.filter(p => p.status === 'submitted').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  const statusData = [
    { name: 'Planning', value: statusCounts.planning, fill: '#3b82f6' },
    { name: 'In Progress', value: statusCounts.in_progress, fill: '#f59e0b' },
    { name: 'Submitted', value: statusCounts.submitted, fill: '#8b5cf6' },
    { name: 'Completed', value: statusCounts.completed, fill: '#10b981' },
  ].filter(d => d.value > 0);

  // Readiness category breakdown
  const readinessMetrics = [
    { name: 'Governance', value: readinessProfile?.governance_score || 0 },
    { name: 'Financial', value: readinessProfile?.financial_readiness_score || 0 },
    { name: 'Operations', value: readinessProfile?.operational_capacity_score || 0 },
  ];

  const avgAssessmentScore = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + (a.total_score || 0), 0) / assessments.length)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#AC1A5B]" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium">Success Rate</p>
              <p className="text-3xl font-bold text-emerald-900 mt-1">{successRate}%</p>
              <p className="text-xs text-emerald-600 mt-1">{projects.filter(p => p.status === 'completed').length} of {projects.length}</p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Amount Awarded</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">${(totalFundingAwarded / 1000).toFixed(0)}K</p>
              <p className="text-xs text-blue-600 mt-1">Across completed projects</p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">In Pipeline</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">${(totalFundingAsked / 1000).toFixed(0)}K</p>
              <p className="text-xs text-purple-600 mt-1">Pending or in progress</p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-700 font-medium">Avg Assessment</p>
              <p className="text-3xl font-bold text-amber-900 mt-1">{avgAssessmentScore}%</p>
              <p className="text-xs text-amber-600 mt-1">Readiness score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status Distribution</CardTitle>
          <CardDescription>Your projects by stage</CardDescription>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} projects`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600">No projects yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Readiness Metrics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#143A50]" />
            Organizational Readiness
          </CardTitle>
          <CardDescription>Your scores across key readiness dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={readinessMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="value" fill="#143A50" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {readinessMetrics.map((metric) => (
              <div key={metric.name} className="text-center">
                <p className="text-sm font-medium text-slate-900">{metric.name}</p>
                <p className="text-2xl font-bold text-[#143A50] mt-1">{metric.value}</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-[#143A50] h-1.5 rounded-full transition-all" 
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}