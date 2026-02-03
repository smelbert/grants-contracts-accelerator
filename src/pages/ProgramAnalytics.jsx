import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Users, Award, FileText, Download, 
  CheckCircle2, Clock, Target, BookOpen, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLORS = ['#143A50', '#AC1A5B', '#E5C089', '#A65D40', '#1E4F58', '#B5A698'];

export default function ProgramAnalyticsPage() {
  const [dateRange, setDateRange] = useState('all');

  const { data: enrollments } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const { data: assessments } = useQuery({
    queryKey: ['all-assessments'],
    queryFn: () => base44.entities.ProgramAssessment.list()
  });

  const { data: templates } = useQuery({
    queryKey: ['template-usage'],
    queryFn: () => base44.entities.Template.list()
  });

  const { data: projects } = useQuery({
    queryKey: ['all-projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const { data: documents } = useQuery({
    queryKey: ['all-documents'],
    queryFn: () => base44.entities.Document.list()
  });

  const { data: discussions } = useQuery({
    queryKey: ['all-discussions'],
    queryFn: () => base44.entities.Discussion.list()
  });

  const { data: cohorts } = useQuery({
    queryKey: ['all-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  // Calculate metrics
  const totalEnrollments = enrollments?.length || 0;
  const completedPrograms = enrollments?.filter(e => e.program_completed).length || 0;
  const completionRate = totalEnrollments > 0 ? ((completedPrograms / totalEnrollments) * 100).toFixed(1) : 0;

  const preAssessments = assessments?.filter(a => a.assessment_type === 'pre') || [];
  const postAssessments = assessments?.filter(a => a.assessment_type === 'post') || [];
  
  const assessmentPairs = preAssessments.map(pre => {
    const post = postAssessments.find(p => p.enrollment_id === pre.enrollment_id);
    return { pre, post };
  }).filter(pair => pair.post);

  const averageImprovement = assessmentPairs.length > 0
    ? (assessmentPairs.reduce((sum, pair) => sum + (pair.post.total_score - pair.pre.total_score), 0) / assessmentPairs.length).toFixed(1)
    : 0;

  const avgPreScore = preAssessments.length > 0
    ? (preAssessments.reduce((sum, a) => sum + a.total_score, 0) / preAssessments.length).toFixed(1)
    : 0;

  const avgPostScore = postAssessments.length > 0
    ? (postAssessments.reduce((sum, a) => sum + a.total_score, 0) / postAssessments.length).toFixed(1)
    : 0;

  // Engagement metrics
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const totalDocuments = documents?.length || 0;
  const communityPosts = discussions?.length || 0;

  // Assessment completion rates
  const preAssessmentComplete = enrollments?.filter(e => e.pre_assessment_completed).length || 0;
  const postAssessmentComplete = enrollments?.filter(e => e.post_assessment_completed).length || 0;
  const consultationComplete = enrollments?.filter(e => e.consultation_completed).length || 0;

  // Score distribution data
  const scoreDistribution = [
    { range: '0-20', count: preAssessments.filter(a => a.total_score <= 20).length },
    { range: '21-40', count: preAssessments.filter(a => a.total_score > 20 && a.total_score <= 40).length },
    { range: '41-60', count: preAssessments.filter(a => a.total_score > 40 && a.total_score <= 60).length },
    { range: '61-80', count: preAssessments.filter(a => a.total_score > 60 && a.total_score <= 80).length },
    { range: '81-100', count: preAssessments.filter(a => a.total_score > 80).length }
  ];

  // Growth data
  const growthData = assessmentPairs.map((pair, idx) => ({
    name: `P${idx + 1}`,
    pre: pair.pre.total_score,
    post: pair.post.total_score,
    growth: pair.post.total_score - pair.pre.total_score
  }));

  // Template category usage
  const templateByCategory = templates?.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {}) || {};

  const templateData = Object.entries(templateByCategory).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').toUpperCase(),
    value
  }));

  // Enrollment by cohort
  const enrollmentByCohort = cohorts?.map(cohort => {
    const cohortEnrollments = enrollments?.filter(e => e.cohort_id === cohort.id) || [];
    const completed = cohortEnrollments.filter(e => e.program_completed).length;
    return {
      name: cohort.program_name?.substring(0, 30) + '...' || 'Unknown',
      enrolled: cohortEnrollments.length,
      completed,
      rate: cohortEnrollments.length > 0 ? ((completed / cohortEnrollments.length) * 100).toFixed(0) : 0
    };
  }) || [];

  const handleExportReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_enrollments: totalEnrollments,
        completion_rate: completionRate + '%',
        average_score_improvement: averageImprovement,
        active_projects: activeProjects,
        total_documents: totalDocuments,
        community_posts: communityPosts
      },
      performance: {
        avg_pre_score: avgPreScore,
        avg_post_score: avgPostScore,
        participants_with_improvement: assessmentPairs.length
      },
      engagement: {
        pre_assessment_completion: ((preAssessmentComplete / totalEnrollments) * 100).toFixed(1) + '%',
        post_assessment_completion: ((postAssessmentComplete / totalEnrollments) * 100).toFixed(1) + '%',
        consultation_completion: ((consultationComplete / totalEnrollments) * 100).toFixed(1) + '%'
      }
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `program-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Report exported successfully');
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Program Analytics Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Comprehensive insights into program performance, engagement, and impact
            </p>
          </div>
          <Button onClick={handleExportReport} className="bg-[#143A50]">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Enrollments</p>
                <p className="text-3xl font-bold text-slate-900">{totalEnrollments}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Score Growth</p>
                <p className="text-3xl font-bold text-[#AC1A5B]">+{averageImprovement}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#AC1A5B]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#AC1A5B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Projects</p>
                <p className="text-3xl font-bold text-[#143A50]">{activeProjects}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#143A50]/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-[#143A50]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="impact">Impact Story</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Score Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pre" fill="#64748b" name="Pre-Assessment" />
                    <Bar dataKey="post" fill="#10b981" name="Post-Assessment" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pre-Assessment Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#AC1A5B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">Average Pre-Assessment Score</p>
                  <p className="text-4xl font-bold text-slate-900">{avgPreScore}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">Average Post-Assessment Score</p>
                  <p className="text-4xl font-bold text-green-600">{avgPostScore}</p>
                </div>
                <div className="p-4 bg-[#AC1A5B]/10 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">Participants with Complete Data</p>
                  <p className="text-4xl font-bold text-[#AC1A5B]">{assessmentPairs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Completion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Pre-Assessment</span>
                      <span className="text-sm text-slate-600">
                        {((preAssessmentComplete / totalEnrollments) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${(preAssessmentComplete / totalEnrollments) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Post-Assessment</span>
                      <span className="text-sm text-slate-600">
                        {((postAssessmentComplete / totalEnrollments) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 transition-all"
                        style={{ width: `${(postAssessmentComplete / totalEnrollments) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">1-on-1 Consultation</span>
                      <span className="text-sm text-slate-600">
                        {((consultationComplete / totalEnrollments) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#AC1A5B] transition-all"
                        style={{ width: `${(consultationComplete / totalEnrollments) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Category Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={templateData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {templateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-[#143A50]" />
                  <p className="text-sm font-medium text-slate-600">Documents Created</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{totalDocuments}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-5 h-5 text-[#AC1A5B]" />
                  <p className="text-sm font-medium text-slate-600">Templates Available</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{templates?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-5 h-5 text-[#1E4F58]" />
                  <p className="text-sm font-medium text-slate-600">Community Posts</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{communityPosts}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment & Completion by Cohort</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={enrollmentByCohort}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrolled" fill="#143A50" name="Enrolled" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrollmentByCohort.map((cohort, idx) => (
                    <div key={idx} className="border-b border-slate-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-900">{cohort.name}</span>
                        <Badge>{cohort.rate}% completion</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span>{cohort.enrolled} enrolled</span>
                        <span>•</span>
                        <span>{cohort.completed} completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">Active Programs</p>
                      <p className="text-slate-600">{cohorts?.filter(c => c.is_active).length || 0} cohorts running</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-900">Completed Participants</p>
                      <p className="text-slate-600">{completedPrograms} graduated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#E5C089]/20 rounded-lg">
                    <Users className="w-5 h-5 text-[#143A50]" />
                    <div>
                      <p className="font-medium text-slate-900">Currently Enrolled</p>
                      <p className="text-slate-600">{totalEnrollments - completedPrograms} in progress</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Impact Story Tab */}
        <TabsContent value="impact" className="space-y-6">
          <Card className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Your Impact Story</CardTitle>
              <p className="text-slate-200">Quantitative and qualitative evidence of program effectiveness</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 p-6 rounded-lg">
                  <Award className="w-8 h-8 text-[#E5C089] mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Participant Growth</h3>
                  <p className="text-3xl font-bold text-[#E5C089] mb-2">+{averageImprovement} points</p>
                  <p className="text-sm text-slate-200">
                    Average score improvement from pre to post assessment demonstrates measurable skill development
                  </p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-[#E5C089] mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Program Completion</h3>
                  <p className="text-3xl font-bold text-[#E5C089] mb-2">{completionRate}%</p>
                  <p className="text-sm text-slate-200">
                    High completion rate indicates strong participant engagement and program design
                  </p>
                </div>
              </div>

              <div className="bg-white/10 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Evidence-Based Outcomes</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#E5C089] mt-0.5" />
                    <div>
                      <p className="font-medium">Assessment Data Shows Learning</p>
                      <p className="text-sm text-slate-200">
                        {assessmentPairs.length} participants with complete before/after data demonstrate knowledge gains
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#E5C089] mt-0.5" />
                    <div>
                      <p className="font-medium">Active Application of Skills</p>
                      <p className="text-sm text-slate-200">
                        {activeProjects} active projects show participants applying what they learned
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#E5C089] mt-0.5" />
                    <div>
                      <p className="font-medium">Resource Utilization</p>
                      <p className="text-sm text-slate-200">
                        {totalDocuments} documents created and {templates?.length || 0} templates accessed demonstrate sustained engagement
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#E5C089] mt-0.5" />
                    <div>
                      <p className="font-medium">Community Building</p>
                      <p className="text-sm text-slate-200">
                        {communityPosts} community discussions foster peer learning and support networks
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Why These Metrics Matter</h3>
                <p className="text-slate-200 leading-relaxed">
                  Every data point tells part of your story. Pre/post assessments prove learning. Completion rates show program effectiveness. 
                  Document creation demonstrates real-world application. Community engagement reflects peer support. Together, these metrics 
                  provide quantitative evidence for funders while the individual stories provide the qualitative context that brings the 
                  numbers to life. This dashboard transforms your work into a compelling narrative backed by data.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}