import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Target, Plus, CheckCircle2, User, Star, Clock,
  MessageSquare, Video, Loader2, Mail, Award, TrendingUp, Edit
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';

export default function MyMentorship() {
  const queryClient = useQueryClient();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [sessionForm, setSessionForm] = useState({ scheduled_date: '', duration_minutes: 60, agenda: '', meeting_link: '' });
  const [goalForm, setGoalForm] = useState({ goal_title: '', description: '', target_date: '' });
  const [feedbackForm, setFeedbackForm] = useState({ mentee_rating: 5, mentee_feedback: '' });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myMentorship } = useQuery({
    queryKey: ['my-mentorship', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const list = await base44.entities.Mentorship.filter({ mentee_email: user.email, status: 'active' });
      return list[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: mentor } = useQuery({
    queryKey: ['mentor-info', myMentorship?.mentor_email],
    queryFn: async () => {
      if (!myMentorship?.mentor_email) return null;
      const list = await base44.entities.Mentor.filter({ mentor_email: myMentorship.mentor_email });
      return list[0] || null;
    },
    enabled: !!myMentorship?.mentor_email
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['my-sessions', myMentorship?.id],
    queryFn: () => base44.entities.MentorshipSession.filter({ mentorship_id: myMentorship.id }, '-scheduled_date'),
    enabled: !!myMentorship?.id
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['my-goals', myMentorship?.id],
    queryFn: () => base44.entities.MentorshipGoal.filter({ mentorship_id: myMentorship.id }),
    enabled: !!myMentorship?.id
  });

  const scheduleSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.MentorshipSession.create({ ...data, mentorship_id: myMentorship.id, status: 'scheduled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-sessions']);
      setShowSessionModal(false);
      setSessionForm({ scheduled_date: '', duration_minutes: 60, agenda: '', meeting_link: '' });
      toast.success('Session request sent!');
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.MentorshipSession.update(selectedSession.id, {
        ...data,
        status: 'completed',
        completed_date: new Date().toISOString()
      });
      // Update total sessions on mentorship
      await base44.entities.Mentorship.update(myMentorship.id, {
        total_sessions: (myMentorship.total_sessions || 0) + 1
      });
      // Update mentor stats
      if (mentor) {
        const newTotal = (mentor.total_sessions_completed || 0) + 1;
        const allRatings = sessions.filter(s => s.mentee_rating).map(s => s.mentee_rating);
        allRatings.push(data.mentee_rating);
        const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
        await base44.entities.Mentor.update(mentor.id, {
          total_sessions_completed: newTotal,
          rating: Math.round(avgRating * 10) / 10
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-sessions', 'mentor-info', 'my-mentorship']);
      setShowFeedbackModal(false);
      setSelectedSession(null);
      toast.success('Session marked complete. Thank you for your feedback!');
    }
  });

  const saveGoalMutation = useMutation({
    mutationFn: async (data) => {
      if (editingGoal?.id) return base44.entities.MentorshipGoal.update(editingGoal.id, data);
      return base44.entities.MentorshipGoal.create({ ...data, mentorship_id: myMentorship.id, status: 'in_progress' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-goals']);
      setShowGoalModal(false);
      setEditingGoal(null);
      setGoalForm({ goal_title: '', description: '', target_date: '' });
      toast.success(editingGoal ? 'Goal updated' : 'Goal created!');
    }
  });

  const updateGoalProgressMutation = useMutation({
    mutationFn: ({ id, progress }) => base44.entities.MentorshipGoal.update(id, {
      progress_percentage: progress,
      status: progress >= 100 ? 'completed' : 'in_progress'
    }),
    onSuccess: () => queryClient.invalidateQueries(['my-goals'])
  });

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && !isPast(new Date(s.scheduled_date)));
  const pastSessions = sessions.filter(s => s.status === 'completed' || (s.status === 'scheduled' && isPast(new Date(s.scheduled_date))));
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const avgRating = completedSessions.filter(s => s.mentee_rating).length > 0
    ? (completedSessions.filter(s => s.mentee_rating).reduce((a, s) => a + s.mentee_rating, 0) / completedSessions.filter(s => s.mentee_rating).length).toFixed(1)
    : null;

  // No mentor assigned state
  if (!myMentorship) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto pt-16">
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="py-16">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">No Mentor Assigned Yet</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                You haven't been paired with a mentor yet. Your program administrator will assign you a mentor based on your goals and areas of focus.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
                {[
                  { icon: Target, label: 'Set Goals Together' },
                  { icon: Calendar, label: 'Schedule Sessions' },
                  { icon: TrendingUp, label: 'Track Progress' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="p-4 bg-slate-50 rounded-xl">
                    <Icon className="w-6 h-6 text-[#143A50] mx-auto mb-2" />
                    <p className="text-xs text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-8">
                Questions? Contact your program coordinator.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Mentorship</h1>
          <p className="text-slate-500 text-sm">Track progress, schedule sessions, and manage your goals</p>
        </div>

        {/* Mentor Profile Card */}
        <Card className="mb-6 border-0 shadow-sm overflow-hidden">
          <div className="bg-[#143A50] h-2" />
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-[#143A50] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {mentor?.mentor_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{mentor?.mentor_name || myMentorship.mentor_email}</h2>
                    <p className="text-slate-500 text-sm">{myMentorship.mentor_email}</p>
                    {mentor?.availability && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {mentor.availability}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {avgRating && (
                      <div className="flex items-center gap-1 justify-end mb-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-4 h-4 ${i <= Math.round(parseFloat(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                        <span className="text-sm text-slate-600 ml-1">{avgRating}</span>
                      </div>
                    )}
                    <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                  </div>
                </div>

                {mentor?.bio && <p className="text-sm text-slate-600 mt-3">{mentor.bio}</p>}

                {mentor?.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mentor.specialties.map(s => (
                      <Badge key={s} variant="outline" className="text-xs capitalize">
                        {s.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
              {[
                { label: 'Sessions Completed', value: completedSessions.length },
                { label: 'Goals Completed', value: `${completedGoals} / ${goals.length}` },
                { label: 'Started', value: myMentorship.start_date ? format(new Date(myMentorship.start_date), 'MMM yyyy') : 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-[#143A50]">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="sessions">
          <TabsList className="mb-6">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Mentorship Sessions</h3>
              <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] gap-1.5" onClick={() => setShowSessionModal(true)}>
                <Plus className="w-4 h-4" /> Request Session
              </Button>
            </div>

            {upcomingSessions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Upcoming</p>
                <div className="space-y-3">
                  {upcomingSessions.map(session => (
                    <Card key={session.id} className="border-0 shadow-sm border-l-4 border-l-[#143A50]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {format(new Date(session.scheduled_date), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <p className="text-sm text-slate-600">
                              {format(new Date(session.scheduled_date), 'h:mm a')} • {session.duration_minutes} min
                            </p>
                            {session.agenda && (
                              <p className="text-sm text-slate-600 mt-2 italic">"{session.agenda}"</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
                            {session.meeting_link && (
                              <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="bg-[#AC1A5B] hover:bg-[#8b1449] gap-1.5 text-xs">
                                  <Video className="w-3 h-3" /> Join
                                </Button>
                              </a>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => { setSelectedSession(session); setShowFeedbackModal(true); }}
                            >
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {upcomingSessions.length === 0 && (
              <div className="py-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No upcoming sessions. Request one above!</p>
              </div>
            )}

            {completedSessions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Completed ({completedSessions.length})</p>
                <div className="space-y-2">
                  {completedSessions.map(session => (
                    <Card key={session.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {format(new Date(session.scheduled_date), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm text-slate-500">{session.duration_minutes} min</p>
                            {session.notes && <p className="text-sm text-slate-600 mt-1">{session.notes}</p>}
                          </div>
                          <div className="text-right">
                            <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
                            {session.mentee_rating && (
                              <div className="flex gap-0.5 mt-2 justify-end">
                                {[1,2,3,4,5].map(i => (
                                  <Star key={i} className={`w-3 h-3 ${i <= session.mentee_rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">My Goals</h3>
              <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] gap-1.5" onClick={() => { setEditingGoal(null); setGoalForm({ goal_title: '', description: '', target_date: '' }); setShowGoalModal(true); }}>
                <Plus className="w-4 h-4" /> Add Goal
              </Button>
            </div>

            {goals.length === 0 && (
              <div className="py-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                <Target className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No goals yet. Add your first goal!</p>
              </div>
            )}

            <div className="space-y-3">
              {goals.map(goal => (
                <Card key={goal.id} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-4">
                        <p className="font-semibold text-slate-900">{goal.goal_title}</p>
                        {goal.description && <p className="text-sm text-slate-600 mt-1">{goal.description}</p>}
                        {goal.target_date && (
                          <p className="text-xs text-slate-500 mt-1">
                            Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={
                          goal.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          goal.status === 'on_hold' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {goal.status?.replace(/_/g, ' ')}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingGoal(goal); setGoalForm({ goal_title: goal.goal_title, description: goal.description || '', target_date: goal.target_date ? goal.target_date.split('T')[0] : '' }); setShowGoalModal(true); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Progress</span>
                        <span>{goal.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={goal.progress_percentage || 0} className="h-2" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={goal.progress_percentage || 0}
                        onChange={e => updateGoalProgressMutation.mutate({ id: goal.id, progress: parseInt(e.target.value) })}
                        className="w-full accent-[#143A50]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Session with {mentor?.mentor_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Proposed Date & Time *</Label>
              <Input type="datetime-local" className="mt-1" value={sessionForm.scheduled_date} onChange={e => setSessionForm(p => ({ ...p, scheduled_date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (minutes)</Label>
                <Input type="number" className="mt-1" value={sessionForm.duration_minutes} onChange={e => setSessionForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) }))} />
              </div>
              <div>
                <Label>Meeting Link (optional)</Label>
                <Input className="mt-1" value={sessionForm.meeting_link} onChange={e => setSessionForm(p => ({ ...p, meeting_link: e.target.value }))} placeholder="Zoom / Meet URL" />
              </div>
            </div>
            <div>
              <Label>Agenda / Topics</Label>
              <Textarea className="mt-1" value={sessionForm.agenda} onChange={e => setSessionForm(p => ({ ...p, agenda: e.target.value }))} placeholder="What would you like to discuss?" rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSessionModal(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-[#143A50]"
                onClick={() => scheduleSessionMutation.mutate(sessionForm)}
                disabled={!sessionForm.scheduled_date || scheduleSessionMutation.isPending}
              >
                {scheduleSessionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Goal Title *</Label>
              <Input className="mt-1" value={goalForm.goal_title} onChange={e => setGoalForm(p => ({ ...p, goal_title: e.target.value }))} placeholder="e.g., Submit first grant proposal" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={goalForm.description} onChange={e => setGoalForm(p => ({ ...p, description: e.target.value }))} placeholder="More detail about this goal..." rows={3} />
            </div>
            <div>
              <Label>Target Date</Label>
              <Input type="date" className="mt-1" value={goalForm.target_date} onChange={e => setGoalForm(p => ({ ...p, target_date: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowGoalModal(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-[#143A50]"
                onClick={() => saveGoalMutation.mutate(goalForm)}
                disabled={!goalForm.goal_title || saveGoalMutation.isPending}
              >
                {saveGoalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingGoal ? 'Save Changes' : 'Create Goal')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-600">
              Mark this session as completed and optionally rate your experience.
            </p>
            <div>
              <Label className="mb-2 block">Rating</Label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(i => (
                  <button key={i} type="button" onClick={() => setFeedbackForm(p => ({ ...p, mentee_rating: i }))}>
                    <Star className={`w-7 h-7 transition ${i <= feedbackForm.mentee_rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Feedback (optional)</Label>
              <Textarea
                className="mt-1"
                value={feedbackForm.mentee_feedback}
                onChange={e => setFeedbackForm(p => ({ ...p, mentee_feedback: e.target.value }))}
                placeholder="What was most valuable? Any suggestions?"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowFeedbackModal(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-emerald-700 hover:bg-emerald-800"
                onClick={() => submitFeedbackMutation.mutate(feedbackForm)}
                disabled={submitFeedbackMutation.isPending}
              >
                {submitFeedbackMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Complete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}