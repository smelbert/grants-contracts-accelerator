import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Target, Plus, CheckCircle2, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function MyMentorshipPage() {
  const queryClient = useQueryClient();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [sessionData, setSessionData] = useState({
    scheduled_date: '',
    duration_minutes: 60,
    agenda: ''
  });
  const [goalData, setGoalData] = useState({
    goal_title: '',
    description: '',
    target_date: ''
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myMentorship } = useQuery({
    queryKey: ['my-mentorship', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const mentorships = await base44.entities.Mentorship.filter({
        mentee_email: user.email,
        status: 'active'
      });
      return mentorships[0];
    },
    enabled: !!user?.email
  });

  const { data: mentor } = useQuery({
    queryKey: ['mentor-info', myMentorship?.mentor_email],
    queryFn: async () => {
      if (!myMentorship?.mentor_email) return null;
      const mentors = await base44.entities.Mentor.filter({
        mentor_email: myMentorship.mentor_email
      });
      return mentors[0];
    },
    enabled: !!myMentorship?.mentor_email
  });

  const { data: sessions } = useQuery({
    queryKey: ['my-sessions', myMentorship?.id],
    queryFn: async () => {
      if (!myMentorship?.id) return [];
      return await base44.entities.MentorshipSession.filter({
        mentorship_id: myMentorship.id
      }, '-scheduled_date');
    },
    enabled: !!myMentorship?.id
  });

  const { data: goals } = useQuery({
    queryKey: ['my-goals', myMentorship?.id],
    queryFn: async () => {
      if (!myMentorship?.id) return [];
      return await base44.entities.MentorshipGoal.filter({
        mentorship_id: myMentorship.id
      });
    },
    enabled: !!myMentorship?.id
  });

  const scheduleSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.MentorshipSession.create({
      ...data,
      mentorship_id: myMentorship.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-sessions']);
      setShowScheduleModal(false);
      setSessionData({ scheduled_date: '', duration_minutes: 60, agenda: '' });
      toast.success('Session scheduled successfully');
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.MentorshipGoal.create({
      ...data,
      mentorship_id: myMentorship.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-goals']);
      setShowGoalModal(false);
      setGoalData({ goal_title: '', description: '', target_date: '' });
      toast.success('Goal created successfully');
    }
  });

  const upcomingSessions = sessions?.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduled_date) > new Date()
  ) || [];

  const completedSessions = sessions?.filter(s => s.status === 'completed') || [];

  if (!myMentorship) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Mentor Assigned</h2>
            <p className="text-slate-600">You don't have a mentor assigned yet. Check back later or contact your program administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Mentorship</h1>
        <p className="text-slate-600 mt-1">Track your progress and schedule sessions</p>
      </div>

      {/* Mentor Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Mentor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{mentor?.mentor_name}</h3>
              <p className="text-sm text-slate-600">{myMentorship.mentor_email}</p>
              {mentor?.specialties && (
                <div className="flex gap-2 mt-3">
                  {mentor.specialties.map((specialty, idx) => (
                    <Badge key={idx} variant="outline">
                      {specialty.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}
              {mentor?.bio && (
                <p className="text-sm text-slate-600 mt-3">{mentor.bio}</p>
              )}
            </div>
            <div className="text-right">
              <Badge className="mb-2">{myMentorship.total_sessions || 0} sessions</Badge>
              {mentor?.rating && (
                <p className="text-sm text-slate-600">⭐ {mentor.rating.toFixed(1)} rating</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Sessions
              </CardTitle>
              <Button size="sm" onClick={() => setShowScheduleModal(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Upcoming</h4>
                {upcomingSessions.length === 0 ? (
                  <p className="text-sm text-slate-500">No upcoming sessions</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="p-3 bg-slate-50 rounded-lg">
                        <p className="font-medium text-sm">{format(new Date(session.scheduled_date), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-slate-600">{format(new Date(session.scheduled_date), 'h:mm a')} • {session.duration_minutes} min</p>
                        {session.agenda && <p className="text-xs text-slate-600 mt-1">{session.agenda}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  {completedSessions.length} completed sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Goals
              </CardTitle>
              <Button size="sm" onClick={() => setShowGoalModal(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals?.map((goal) => (
                <div key={goal.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{goal.goal_title}</h4>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                      {goal.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${goal.progress_percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{goal.progress_percentage || 0}% complete</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Session Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); scheduleSessionMutation.mutate(sessionData); }} className="space-y-4">
            <div>
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={sessionData.scheduled_date}
                onChange={(e) => setSessionData({ ...sessionData, scheduled_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={sessionData.duration_minutes}
                onChange={(e) => setSessionData({ ...sessionData, duration_minutes: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Agenda</Label>
              <Textarea
                value={sessionData.agenda}
                onChange={(e) => setSessionData({ ...sessionData, agenda: e.target.value })}
                placeholder="What would you like to discuss?"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-[#143A50]">Schedule Session</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Goal Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createGoalMutation.mutate(goalData); }} className="space-y-4">
            <div>
              <Label>Goal Title</Label>
              <Input
                value={goalData.goal_title}
                onChange={(e) => setGoalData({ ...goalData, goal_title: e.target.value })}
                placeholder="e.g., Complete grant proposal"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={goalData.description}
                onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                placeholder="Describe your goal in detail..."
              />
            </div>
            <div>
              <Label>Target Date</Label>
              <Input
                type="date"
                value={goalData.target_date}
                onChange={(e) => setGoalData({ ...goalData, target_date: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowGoalModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-[#143A50]">Create Goal</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}