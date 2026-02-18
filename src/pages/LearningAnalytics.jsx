import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  Clock, 
  BarChart3,
  CheckCircle2,
  Target,
  Trophy
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LearningAnalytics() {
  const [selectedPath, setSelectedPath] = useState('all');
  const [timeframe, setTimeframe] = useState('30');

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: learningContent = [] } = useQuery({
    queryKey: ['learning-content'],
    queryFn: () => base44.entities.LearningContent.list()
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['all-user-progress'],
    queryFn: () => base44.entities.UserProgress.list()
  });

  const { data: paths = [] } = useQuery({
    queryKey: ['curated-paths'],
    queryFn: () => base44.entities.CuratedPath.list()
  });

  const { data: pathProgress = [] } = useQuery({
    queryKey: ['path-progress'],
    queryFn: () => base44.entities.PathProgress.list()
  });

  // Calculate metrics
  const totalEnrollments = userProgress.length;
  const completedCourses = userProgress.filter(p => p.is_completed).length;
  const avgCompletionRate = totalEnrollments > 0 
    ? ((completedCourses / totalEnrollments) * 100).toFixed(1)
    : 0;

  const totalPathsStarted = pathProgress.filter(p => p.is_started).length;
  const totalPathsCompleted = pathProgress.filter(p => p.is_completed).length;
  const pathCompletionRate = totalPathsStarted > 0
    ? ((totalPathsCompleted / totalPathsStarted) * 100).toFixed(1)
    : 0;

  const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0);
  const avgTimePerCourse = totalEnrollments > 0
    ? Math.round(totalTimeSpent / totalEnrollments)
    : 0;

  const activeUsers = new Set(userProgress.map(p => p.user_email)).size;

  // Most popular courses
  const coursePopularity = {};
  userProgress.forEach(progress => {
    if (!coursePopularity[progress.content_id]) {
      coursePopularity[progress.content_id] = {
        enrollments: 0,
        completions: 0
      };
    }
    coursePopularity[progress.content_id].enrollments++;
    if (progress.is_completed) {
      coursePopularity[progress.content_id].completions++;
    }
  });

  const popularCourses = Object.entries(coursePopularity)
    .map(([contentId, stats]) => {
      const content = learningContent.find(c => c.id === contentId);
      return {
        title: content?.title || 'Unknown',
        ...stats,
        completionRate: stats.enrollments > 0 
          ? ((stats.completions / stats.enrollments) * 100).toFixed(1)
          : 0
      };
    })
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 10);

  // Engagement over time
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const engagementData = last30Days.map(date => {
    const dayProgress = userProgress.filter(p => 
      p.created_date?.startsWith(date) || p.updated_date?.startsWith(date)
    );
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      enrollments: dayProgress.length,
      completions: dayProgress.filter(p => p.completion_date?.startsWith(date)).length
    };
  });

  // Completion rate by content type
  const typeStats = {};
  learningContent.forEach(content => {
    if (!typeStats[content.content_type]) {
      typeStats[content.content_type] = { enrollments: 0, completions: 0 };
    }
    const progress = userProgress.filter(p => p.content_id === content.id);
    typeStats[content.content_type].enrollments += progress.length;
    typeStats[content.content_type].completions += progress.filter(p => p.is_completed).length;
  });

  const typeChartData = Object.entries(typeStats).map(([type, stats]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    completionRate: stats.enrollments > 0 
      ? parseFloat(((stats.completions / stats.enrollments) * 100).toFixed(1))
      : 0,
    enrollments: stats.enrollments
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Learning Analytics</h1>
          <p className="text-slate-600">Track engagement, completion rates, and program performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Active Learners</p>
                  <p className="text-2xl font-bold text-slate-900">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Completion Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{avgCompletionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Path Completion</p>
                  <p className="text-2xl font-bold text-slate-900">{pathCompletionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Time/Course</p>
                  <p className="text-2xl font-bold text-slate-900">{avgTimePerCourse}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment & Completion Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="enrollments" stroke="#3B82F6" strokeWidth={2} name="Enrollments" />
                      <Line type="monotone" dataKey="completions" stroke="#10B981" strokeWidth={2} name="Completions" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate by Content Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={typeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completionRate" fill="#3B82F6" name="Completion %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Course Performance Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularCourses.map((course, idx) => (
                    <div key={idx} className="border-b border-slate-200 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{course.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                            <span>{course.enrollments} enrollments</span>
                            <span>{course.completions} completions</span>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {course.completionRate}% completion
                        </Badge>
                      </div>
                      <Progress value={parseFloat(course.completionRate)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <div className="grid gap-6">
              {paths.map(path => {
                const pathProgressData = pathProgress.filter(p => p.path_id === path.id);
                const started = pathProgressData.filter(p => p.is_started).length;
                const completed = pathProgressData.filter(p => p.is_completed).length;
                const completionRate = started > 0 ? ((completed / started) * 100).toFixed(1) : 0;

                return (
                  <Card key={path.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="mb-2">{path.path_name}</CardTitle>
                          <p className="text-sm text-slate-600">{path.description}</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">
                          {path.difficulty_level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-600">Started</p>
                          <p className="text-2xl font-bold text-slate-900">{started}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Completed</p>
                          <p className="text-2xl font-bold text-green-600">{completed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Completion Rate</p>
                          <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Modules</p>
                          <p className="text-2xl font-bold text-slate-900">{path.module_sequence?.length || 0}</p>
                        </div>
                      </div>
                      <Progress value={parseFloat(completionRate)} className="h-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* User Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Learning Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-5xl font-bold text-blue-600">{Math.round(totalTimeSpent / 60)}</p>
                    <p className="text-slate-600 mt-2">Total Hours Spent Learning</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{avgTimePerCourse}</p>
                      <p className="text-sm text-slate-600">Avg Minutes/Course</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{totalEnrollments}</p>
                      <p className="text-sm text-slate-600">Total Enrollments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learner Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Active Learners</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Courses Completed</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{completedCourses}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Paths Completed</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">{totalPathsCompleted}</span>
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