import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Award, Target, Calendar, Download, Filter } from 'lucide-react';

export default function AssessmentAnalytics() {
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState('all');
  const [cohortFilter, setCohortFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['grant-assessments'],
    queryFn: () => base44.entities.GrantWritingAssessment.list('-assessment_date')
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['training-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const typeMatch = assessmentTypeFilter === 'all' || assessment.assessment_type === assessmentTypeFilter;
      const cohortMatch = cohortFilter === 'all' || assessment.training_cohort_id === cohortFilter;
      
      let dateMatch = true;
      if (dateFrom) {
        dateMatch = dateMatch && new Date(assessment.assessment_date) >= new Date(dateFrom);
      }
      if (dateTo) {
        dateMatch = dateMatch && new Date(assessment.assessment_date) <= new Date(dateTo);
      }
      
      return typeMatch && cohortMatch && dateMatch;
    });
  }, [assessments, assessmentTypeFilter, cohortFilter, dateFrom, dateTo]);

  // Calculate statistics
  const stats = useMemo(() => {
    const preAssessments = filteredAssessments.filter(a => a.assessment_type === 'pre');
    const postAssessments = filteredAssessments.filter(a => a.assessment_type === 'post');
    
    const avgPreScore = preAssessments.length > 0
      ? preAssessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / preAssessments.length
      : 0;
    
    const avgPostScore = postAssessments.length > 0
      ? postAssessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / postAssessments.length
      : 0;

    // Find users with both pre and post assessments
    const usersWithBoth = assessments
      .filter(a => a.assessment_type === 'pre')
      .map(pre => {
        const post = assessments.find(p => 
          p.user_email === pre.user_email && 
          p.assessment_type === 'post'
        );
        if (post) {
          return {
            email: pre.user_email,
            name: pre.user_name,
            preScore: pre.overall_score,
            postScore: post.overall_score,
            improvement: post.overall_score - pre.overall_score
          };
        }
        return null;
      })
      .filter(Boolean);

    const avgImprovement = usersWithBoth.length > 0
      ? usersWithBoth.reduce((sum, u) => sum + u.improvement, 0) / usersWithBoth.length
      : 0;

    return {
      totalAssessments: filteredAssessments.length,
      preCount: preAssessments.length,
      postCount: postAssessments.length,
      avgPreScore: avgPreScore.toFixed(1),
      avgPostScore: avgPostScore.toFixed(1),
      avgImprovement: avgImprovement.toFixed(1),
      usersWithBoth
    };
  }, [filteredAssessments, assessments]);

  // Section scores analysis
  const sectionScoresData = useMemo(() => {
    const sections = [
      'needs_assessment',
      'goals_objectives',
      'methods_strategies',
      'evaluation_plan',
      'budget_development',
      'sustainability',
      'organizational_capacity',
      'narrative_writing',
      'compliance_requirements',
      'research_funder_alignment'
    ];

    return sections.map(section => {
      const preScores = filteredAssessments
        .filter(a => a.assessment_type === 'pre' && a.responses?.section_scores?.[section])
        .map(a => a.responses.section_scores[section]);
      
      const postScores = filteredAssessments
        .filter(a => a.assessment_type === 'post' && a.responses?.section_scores?.[section])
        .map(a => a.responses.section_scores[section]);

      const avgPre = preScores.length > 0 ? preScores.reduce((a, b) => a + b, 0) / preScores.length : 0;
      const avgPost = postScores.length > 0 ? postScores.reduce((a, b) => a + b, 0) / postScores.length : 0;

      return {
        section: section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        pre: Math.round(avgPre),
        post: Math.round(avgPost),
        improvement: Math.round(avgPost - avgPre)
      };
    });
  }, [filteredAssessments]);

  // Areas for improvement analysis
  const areasForImprovementData = useMemo(() => {
    const areaCount = {};
    
    filteredAssessments.forEach(assessment => {
      assessment.responses?.areas_for_improvement?.forEach(area => {
        areaCount[area] = (areaCount[area] || 0) + 1;
      });
    });

    return Object.entries(areaCount)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredAssessments]);

  // Level distribution
  const levelDistribution = useMemo(() => {
    const distribution = { 'level-1': 0, 'level-2': 0, 'level-3': 0 };
    
    filteredAssessments
      .filter(a => a.assessment_type === 'pre')
      .forEach(assessment => {
        if (assessment.level_assigned) {
          distribution[assessment.level_assigned]++;
        }
      });

    return [
      { name: 'Level 1 (Beginner)', value: distribution['level-1'], color: '#E5C089' },
      { name: 'Level 2 (Intermediate)', value: distribution['level-2'], color: '#143A50' },
      { name: 'Level 3 (Advanced)', value: distribution['level-3'], color: '#AC1A5B' }
    ];
  }, [filteredAssessments]);

  const handleExportData = () => {
    const csvContent = [
      ['User', 'Email', 'Assessment Type', 'Date', 'Overall Score', 'Level', 'Areas for Improvement'].join(','),
      ...filteredAssessments.map(a => [
        a.user_name || '',
        a.user_email || '',
        a.assessment_type || '',
        new Date(a.assessment_date).toLocaleDateString(),
        a.overall_score || '',
        a.level_assigned || '',
        a.responses?.areas_for_improvement?.join('; ') || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-slate-600">Loading assessment data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Grant Writing Assessment Analytics</h1>
            <p className="text-slate-600">Analyze pre- and post-assessment performance across all participants</p>
          </div>
          <Button onClick={handleExportData} className="bg-[#143A50]">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Assessment Type</Label>
                <Select value={assessmentTypeFilter} onValueChange={setAssessmentTypeFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pre">Pre-Assessment</SelectItem>
                    <SelectItem value="post">Post-Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cohort</Label>
                <Select value={cohortFilter} onValueChange={setCohortFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cohorts</SelectItem>
                    {cohorts.map(cohort => (
                      <SelectItem key={cohort.id} value={cohort.id}>
                        {cohort.program_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-[#143A50]" />
                <div>
                  <p className="text-sm text-slate-600">Total Assessments</p>
                  <p className="text-2xl font-bold">{stats.totalAssessments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-[#E5C089]" />
                <div>
                  <p className="text-sm text-slate-600">Avg Pre Score</p>
                  <p className="text-2xl font-bold">{stats.avgPreScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-[#AC1A5B]" />
                <div>
                  <p className="text-sm text-slate-600">Avg Post Score</p>
                  <p className="text-2xl font-bold">{stats.avgPostScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">Avg Improvement</p>
                  <p className="text-2xl font-bold">+{stats.avgImprovement}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
            <TabsTrigger value="individuals">Individual Progress</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section Scores Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Score Comparison</CardTitle>
                  <CardDescription>Pre vs Post assessment scores by section</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={sectionScoresData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="section" angle={-45} textAnchor="end" height={120} fontSize={11} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pre" fill="#E5C089" name="Pre-Assessment" />
                      <Bar dataKey="post" fill="#143A50" name="Post-Assessment" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Level Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Training Level Distribution</CardTitle>
                  <CardDescription>Initial assessment levels assigned</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={levelDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {levelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle>Most Common Areas for Development</CardTitle>
                <CardDescription>Top areas identified across all assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {areasForImprovementData.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Badge className="w-8 h-8 flex items-center justify-center bg-[#143A50]">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{item.area}</span>
                          <span className="text-sm text-slate-600">{item.count} mentions</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-[#AC1A5B] h-2 rounded-full"
                            style={{ width: `${(item.count / filteredAssessments.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Improvement Analysis</CardTitle>
                <CardDescription>Detailed breakdown of skill rating changes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={sectionScoresData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[-20, 50]} />
                    <YAxis dataKey="section" type="category" width={180} fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="improvement" fill="#22c55e" name="Score Improvement" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individuals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Individual Progress Tracking</CardTitle>
                <CardDescription>Users with completed pre and post assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.usersWithBoth.length === 0 ? (
                    <p className="text-center py-8 text-slate-600">No users with completed pre and post assessments yet</p>
                  ) : (
                    stats.usersWithBoth.map((user, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                          </div>
                          <Badge className={user.improvement > 0 ? 'bg-green-600' : 'bg-slate-600'}>
                            {user.improvement > 0 ? '+' : ''}{user.improvement} points
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600">Pre</span>
                              <span className="text-xs font-medium">{user.preScore}/100</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-[#E5C089] h-2 rounded-full"
                                style={{ width: `${user.preScore}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600">Post</span>
                              <span className="text-xs font-medium">{user.postScore}/100</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-[#143A50] h-2 rounded-full"
                                style={{ width: `${user.postScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">Strongest Improvement</p>
                    <p className="text-sm text-green-700">
                      {sectionScoresData.sort((a, b) => b.improvement - a.improvement)[0]?.section || 'N/A'} 
                      {' '}(+{sectionScoresData.sort((a, b) => b.improvement - a.improvement)[0]?.improvement || 0} points avg)
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-medium text-amber-900 mb-1">Needs More Focus</p>
                    <p className="text-sm text-amber-700">
                      {sectionScoresData.sort((a, b) => a.improvement - b.improvement)[0]?.section || 'N/A'}
                      {' '}(+{sectionScoresData.sort((a, b) => a.improvement - b.improvement)[0]?.improvement || 0} points avg)
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">Completion Rate</p>
                    <p className="text-sm text-blue-700">
                      {stats.usersWithBoth.length} of {stats.preCount} participants completed both assessments
                      {' '}({stats.preCount > 0 ? Math.round((stats.usersWithBoth.length / stats.preCount) * 100) : 0}%)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assessment Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <span className="text-sm font-medium">Pre-Assessments</span>
                      <Badge className="bg-[#E5C089] text-[#143A50]">{stats.preCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <span className="text-sm font-medium">Post-Assessments</span>
                      <Badge className="bg-[#143A50]">{stats.postCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <span className="text-sm font-medium">Both Completed</span>
                      <Badge className="bg-green-600">{stats.usersWithBoth.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}