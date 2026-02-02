import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Video, 
  Calendar, 
  Download, 
  CheckCircle2, 
  Clock,
  Users,
  FileText,
  Sparkles,
  PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MyClassroomPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['myEnrollments', user?.email],
    queryFn: () => base44.entities.UserEnrollment.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: allContent = [] } = useQuery({
    queryKey: ['learningContent'],
    queryFn: () => base44.entities.LearningContent.list(),
  });

  const { data: liveRooms = [] } = useQuery({
    queryKey: ['myLiveRooms'],
    queryFn: () => base44.entities.LiveRoom.list(),
  });

  const enrolledContent = enrollments.map(enrollment => {
    const content = allContent.find(c => c.id === enrollment.content_id);
    return { ...enrollment, content };
  }).filter(e => e.content);

  const activeEnrollments = enrolledContent.filter(e => e.status === 'active');
  const completedEnrollments = enrolledContent.filter(e => e.status === 'completed');

  const upcomingRooms = liveRooms
    .filter(room => new Date(room.scheduled_start) > new Date())
    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Classroom</h1>
          <p className="text-slate-600">Your learning journey and enrolled courses</p>
        </div>

        {/* Welcome Message */}
        {activeEnrollments.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name}!</h2>
                  <p className="text-emerald-50 mb-4">
                    You're enrolled in {activeEnrollments.length} {activeEnrollments.length === 1 ? 'course' : 'courses'}. 
                    Keep up the great work!
                  </p>
                </div>
                <Sparkles className="w-12 h-12 text-emerald-100" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Courses</p>
                  <p className="text-3xl font-bold text-slate-900">{activeEnrollments.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-3xl font-bold text-slate-900">{completedEnrollments.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Upcoming Sessions</p>
                  <p className="text-3xl font-bold text-slate-900">{upcomingRooms.length}</p>
                </div>
                <Video className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">Active Courses</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeEnrollments.length > 0 ? (
                  activeEnrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              {enrollment.content.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {enrollment.content.description}
                            </CardDescription>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700">
                            {enrollment.enrollment_type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Progress */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-600">Progress</span>
                              <span className="text-sm font-semibold text-slate-900">
                                {enrollment.progress_percentage || 0}%
                              </span>
                            </div>
                            <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                          </div>

                          {/* Course Info */}
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            {enrollment.content.duration_minutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {enrollment.content.duration_minutes} mins
                              </div>
                            )}
                            {enrollment.content.curriculum_sections?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {enrollment.content.curriculum_sections.length} sections
                              </div>
                            )}
                            {enrollment.cohort_id && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Cohort: {enrollment.cohort_id}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Link to={createPageUrl(`LearningModule?id=${enrollment.content.id}`)}>
                              <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Continue Learning
                              </Button>
                            </Link>
                            {enrollment.content.handouts?.length > 0 && (
                              <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Handouts ({enrollment.content.handouts.length})
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Courses</h3>
                      <p className="text-slate-600 mb-4">Start your learning journey today!</p>
                      <Link to={createPageUrl('Learning')}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                          Browse Courses
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedEnrollments.length > 0 ? (
                  completedEnrollments.map((enrollment) => (
                    <Card key={enrollment.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <CardTitle className="text-xl">
                                {enrollment.content.title}
                              </CardTitle>
                            </div>
                            <CardDescription>
                              Completed on {format(new Date(enrollment.completed_date), 'MMMM d, yyyy')}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Link to={createPageUrl(`LearningModule?id=${enrollment.content.id}`)}>
                          <Button variant="outline">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Review Course
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-slate-600">No completed courses yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Live Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Live Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingRooms.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingRooms.map((room) => (
                      <div key={room.id} className="p-3 bg-slate-50 rounded-lg">
                        <h4 className="font-medium text-slate-900 text-sm mb-2">
                          {room.room_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(room.scheduled_start), 'MMM d, h:mm a')}
                        </div>
                        {room.meeting_url && (
                          <Button size="sm" variant="outline" className="w-full" asChild>
                            <a href={room.meeting_url} target="_blank" rel="noopener noreferrer">
                              <Video className="w-3 h-3 mr-2" />
                              Join Session
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No upcoming sessions
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Preparation Materials */}
            {activeEnrollments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preparation Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Review course handouts before each session</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Complete practice exercises regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Participate actively in live sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Connect with your cohort members</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}