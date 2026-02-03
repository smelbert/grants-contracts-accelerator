import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, queryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Target, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MentorDashboardPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: mentorProfile } = useQuery({
    queryKey: ['mentor-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.Mentor.filter({ mentor_email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });

  const { data: myMentorships } = useQuery({
    queryKey: ['my-mentorships', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Mentorship.filter({
        mentor_email: user.email,
        status: 'active'
      });
    },
    enabled: !!user?.email
  });

  const { data: upcomingSessions } = useQuery({
    queryKey: ['upcoming-sessions', myMentorships],
    queryFn: async () => {
      if (!myMentorships?.length) return [];
      const mentorshipIds = myMentorships.map(m => m.id);
      const allSessions = await base44.entities.MentorshipSession.list('-scheduled_date');
      return allSessions.filter(s => 
        mentorshipIds.includes(s.mentorship_id) && 
        s.status === 'scheduled' &&
        new Date(s.scheduled_date) > new Date()
      ).slice(0, 5);
    },
    enabled: !!myMentorships?.length
  });

  const { data: goals } = useQuery({
    queryKey: ['mentee-goals', myMentorships],
    queryFn: async () => {
      if (!myMentorships?.length) return [];
      const mentorshipIds = myMentorships.map(m => m.id);
      const allGoals = await base44.entities.MentorshipGoal.list();
      return allGoals.filter(g => mentorshipIds.includes(g.mentorship_id));
    },
    enabled: !!myMentorships?.length
  });

  const activeMentees = myMentorships?.length || 0;
  const totalSessions = mentorProfile?.total_sessions_completed || 0;
  const activeGoals = goals?.filter(g => g.status === 'in_progress').length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mentor Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {user?.full_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Mentees</p>
                <p className="text-3xl font-bold text-slate-900">{activeMentees}</p>
              </div>
              <Users className="w-8 h-8 text-[#143A50]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-slate-900">{upcomingSessions?.length || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#AC1A5B]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Goals</p>
                <p className="text-3xl font-bold text-slate-900">{activeGoals}</p>
              </div>
              <Target className="w-8 h-8 text-[#E5C089]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Sessions</p>
                <p className="text-3xl font-bold text-slate-900">{totalSessions}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mentees">
        <TabsList>
          <TabsTrigger value="mentees">My Mentees</TabsTrigger>
          <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="goals">Goals Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="mentees" className="space-y-4">
          {myMentorships?.map((mentorship) => (
            <Link key={mentorship.id} to={createPageUrl('MentorshipDetail') + `?id=${mentorship.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{mentorship.mentee_name}</h3>
                      <p className="text-sm text-slate-600">{mentorship.mentee_email}</p>
                      {mentorship.focus_areas && (
                        <div className="flex gap-2 mt-2">
                          {mentorship.focus_areas.slice(0, 3).map((area, idx) => (
                            <Badge key={idx} variant="outline">{area}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge>{mentorship.total_sessions || 0} sessions</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {upcomingSessions?.map((session) => {
            const mentorship = myMentorships?.find(m => m.id === session.mentorship_id);
            return (
              <Card key={session.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{mentorship?.mentee_name}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {format(new Date(session.scheduled_date), 'MMMM d, yyyy • h:mm a')}
                      </p>
                      {session.agenda && (
                        <p className="text-sm text-slate-600 mt-2">{session.agenda}</p>
                      )}
                    </div>
                    <Badge>{session.duration_minutes} min</Badge>
                  </div>
                  {session.meeting_link && (
                    <Button className="mt-4" asChild>
                      <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                        Join Meeting
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {goals?.map((goal) => {
            const mentorship = myMentorships?.find(m => m.id === goal.mentorship_id);
            return (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{goal.goal_title}</h3>
                      <p className="text-sm text-slate-600">{mentorship?.mentee_name}</p>
                    </div>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'outline'}>
                      {goal.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress_percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{goal.progress_percentage || 0}% complete</p>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}