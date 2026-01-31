import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Award, 
  Brain, 
  Target, 
  Calendar,
  BarChart3,
  Flame,
  Trophy,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import GamificationDashboard from '@/components/learning/GamificationDashboard';
import Leaderboard from '@/components/learning/Leaderboard';
import PersonalizedLearningPath from '@/components/learning/PersonalizedLearningPath';
import { format } from 'date-fns';

export default function LearningProgressPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress-all', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: srData = [] } = useQuery({
    queryKey: ['all-sr-data', user?.email],
    queryFn: () => base44.entities.SpacedRepetition.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: allContent = [] } = useQuery({
    queryKey: ['all-learning-content'],
    queryFn: () => base44.entities.LearningContent.list(),
  });

  const { data: streak } = useQuery({
    queryKey: ['learning-streak', user?.email],
    queryFn: () => base44.entities.LearningStreak.filter({ user_email: user?.email }).then(res => res[0]),
    enabled: !!user?.email,
  });

  // Calculate metrics
  const completedModules = userProgress.filter(p => p.completed);
  const completionRate = allContent.length > 0 
    ? (completedModules.length / allContent.length) * 100 
    : 0;

  const avgQuizScore = userProgress.length > 0
    ? userProgress.reduce((acc, p) => {
        const scores = p.quiz_scores || [];
        const moduleAvg = scores.length > 0
          ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
          : 0;
        return acc + moduleAvg;
      }, 0) / userProgress.length
    : 0;

  const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0);

  const weakModules = userProgress.filter(p => {
    const avg = p.quiz_scores?.length > 0
      ? p.quiz_scores.reduce((sum, s) => sum + s.score, 0) / p.quiz_scores.length
      : null;
    return avg && avg < 70;
  });

  // SR Metrics
  const cardsReviewed = srData.length;
  const avgRetention = srData.length > 0
    ? srData.reduce((sum, sr) => sum + sr.ease_factor, 0) / srData.length
    : 2.5;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Learning Progress</h1>
          <p className="text-slate-600">Track your growth and achievements</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Course Completion</p>
                  <p className="text-3xl font-bold text-slate-900">{Math.round(completionRate)}%</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {completedModules.length} of {allContent.length} modules
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <Progress value={completionRate} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Quiz Score</p>
                  <p className="text-3xl font-bold text-slate-900">{Math.round(avgQuizScore)}%</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {userProgress.reduce((sum, p) => sum + (p.quiz_scores?.length || 0), 0)} quizzes taken
                  </p>
                </div>
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <Progress value={avgQuizScore} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Time Invested</p>
                  <p className="text-3xl font-bold text-slate-900">{Math.round(totalTimeSpent / 60)}h</p>
                  <p className="text-xs text-slate-500 mt-1">{totalTimeSpent} minutes</p>
                </div>
                <Calendar className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Current Streak</p>
                  <p className="text-3xl font-bold text-slate-900">{streak?.current_streak || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">days in a row</p>
                </div>
                <Flame className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="spaced-rep">Spaced Repetition</TabsTrigger>
            <TabsTrigger value="gamification">Achievements</TabsTrigger>
            <TabsTrigger value="recommendations">Learning Path</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Performance by Funding Lane
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['grants', 'contracts', 'donors', 'public_funds'].map(lane => {
                    const laneProgress = userProgress.filter(p => {
                      const module = allContent.find(c => c.id === p.learning_content_id);
                      return module?.funding_lane === lane;
                    });
                    const laneCompleted = laneProgress.filter(p => p.completed).length;
                    const laneTotal = allContent.filter(c => c.funding_lane === lane).length;
                    const laneRate = laneTotal > 0 ? (laneCompleted / laneTotal) * 100 : 0;

                    return (
                      <div key={lane}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{lane.replace('_', ' ')}</span>
                          <span>{laneCompleted}/{laneTotal}</span>
                        </div>
                        <Progress value={laneRate} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userProgress
                      .sort((a, b) => new Date(b.last_accessed) - new Date(a.last_accessed))
                      .slice(0, 5)
                      .map(p => {
                        const module = allContent.find(c => c.id === p.learning_content_id);
                        return module ? (
                          <div key={p.id} className="flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{module.title}</p>
                              <p className="text-xs text-slate-500">
                                {p.last_accessed && format(new Date(p.last_accessed), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            {p.completed && (
                              <Badge className="bg-emerald-100 text-emerald-800">
                                Completed
                              </Badge>
                            )}
                          </div>
                        ) : null;
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Top Performing Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {userProgress
                    .filter(p => p.quiz_scores?.length > 0)
                    .map(p => ({
                      ...p,
                      avgScore: p.quiz_scores.reduce((sum, s) => sum + s.score, 0) / p.quiz_scores.length
                    }))
                    .sort((a, b) => b.avgScore - a.avgScore)
                    .slice(0, 5)
                    .map(p => {
                      const module = allContent.find(c => c.id === p.learning_content_id);
                      return module ? (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <span className="truncate">{module.title}</span>
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {Math.round(p.avgScore)}%
                          </Badge>
                        </div>
                      ) : null;
                    })}
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {weakModules.length === 0 ? (
                    <p className="text-sm text-slate-500">Great job! No weak areas detected.</p>
                  ) : (
                    weakModules.map(p => {
                      const module = allContent.find(c => c.id === p.learning_content_id);
                      const avg = p.quiz_scores.reduce((sum, s) => sum + s.score, 0) / p.quiz_scores.length;
                      return module ? (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <span className="truncate">{module.title}</span>
                          <Badge className="bg-orange-100 text-orange-800">
                            {Math.round(avg)}%
                          </Badge>
                        </div>
                      ) : null;
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Spaced Repetition Tab */}
          <TabsContent value="spaced-rep" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Brain className="w-10 h-10 text-purple-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">{cardsReviewed}</p>
                  <p className="text-sm text-slate-600">Cards Reviewed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">{Math.round(avgRetention * 100)}%</p>
                  <p className="text-sm text-slate-600">Avg Retention</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">
                    {srData.filter(sr => new Date(sr.next_review_date) <= new Date()).length}
                  </p>
                  <p className="text-sm text-slate-600">Due for Review</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GamificationDashboard userEmail={user?.email} />
              <Leaderboard userEmail={user?.email} />
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            {user && <PersonalizedLearningPath userEmail={user.email} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}