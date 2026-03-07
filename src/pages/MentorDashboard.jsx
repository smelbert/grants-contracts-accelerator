import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, Calendar, Target, CheckCircle2, Star, Clock, 
  Video, MessageSquare, Plus, Edit, TrendingUp, Award, Loader2
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';

export default function MentorDashboard() {
  const queryClient = useQueryClient();
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showGoalUpdateModal, setShowGoalUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [sessionForm, setSessionForm] = useState({ scheduled_date: '', duration_minutes: 60, agenda: '', meeting_link: '' });
  const [sessionNotes, setSessionNotes] = useState({ session: null, notes: '' });
  const [goalUpdate, setGoalUpdate] = useState({ progress: 0, notes: '' });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: mentorProfile } = useQuery({
    queryKey: ['my-mentor-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const list = await base44.entities.Mentor.filter({ mentor_email: user.email });
      return list[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: myMentorships = [] } = useQuery({
    queryKey: ['my-mentorships-coach', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Mentorship.filter({ mentor_email: user.email, status: 'active' });
    },
    enabled: !!user?.email
  });

  const { data: allSessions = [] } = useQuery({
    queryKey: ['coach-sessions', myMentorships],
    queryFn: async () => {
      if (!myMentorships.length) return [];
      const ids = myMentorships.map(m => m.id);
      const sessions = await base44.entities.MentorshipSession.list('-scheduled_date', 200);
      return sessions.filter(s => ids.includes(s.mentorship_id));
    },
    enabled: !!myMentorships.length
  });

  const { data: allGoals = [] } = useQuery({
    queryKey: ['coach-goals', myMentorships],
    queryFn: async () => {
      if (!myMentorships.length) return [];
      const ids = myMentorships.map(m => m.id);
      const goals = await base44.entities.MentorshipGoal.list();
      return goals.filter(g => ids.includes(g.mentorship_id));
    },
    enabled: !!myMentorships.length
  });

  const addSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.MentorshipSession.create({
      ...data,
      mentorship_id: selectedMentorship.id,
      status: 'scheduled'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['coach-sessions']);
      setShowSessionModal(false);
      setSessionForm({ scheduled_date: '', duration_minutes: 60, agenda: '', meeting_link: '' });
      toast.success('Session scheduled');
    }
  });

  const completeSessionMutation = useMutation({
    mutationFn: async ({ sessionId, notes }) => {
      await base44.entities.MentorshipSession.update(sessionId, {
        notes,
        status: 'completed',
        completed_date: new Date().toISOString()
      });
      const mentorship = myMentorships.find(m => allSessions.find(s => s.id === sessionId && s.mentorship_id === m.id));
      if (mentorship) {
        await base44.entities.Mentorship.update(mentorship.id, {
          total_sessions: (mentorship.total_sessions || 0) + 1
        });
      }
      if (mentorProfile) {
        await base44.entities.Mentor.update(mentorProfile.id, {
          total_sessions_completed: (mentorProfile.total_sessions_completed || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coach-sessions', 'my-mentor-profile']);
      setShowNotesModal(false);
      setSessionNotes({ session: null, notes: '' });
      toast.success('Session completed');
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MentorshipGoal.update(id, {
      ...data,
      status: data.progress >= 100 ? 'completed' : 'in_progress'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['coach-goals']);
      setShowGoalUpdateModal(false);
      setSelectedGoal(null);
      toast.success('Goal updated');
    }
  });

  const upcomingSessions = allSessions.filter(s => s.status === 'scheduled' && !isPast(new Date(s.scheduled_date)));
  const completedSessions = allSessions.filter(s => s.status === 'completed');
  const activeGoals = allGoals.filter(g => g.status !== 'completed');
  const completedGoals = allGoals.filter(g => g.status === 'completed');

  const getSessionsForMentorship = (id) => allSessions.filter(s => s.mentorship_id === id);
  const getGoalsForMentorship = (id) => allGoals.filter(g => g.mentorship_id === id);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#143A50] flex items-center justify-center text-white font-bold text-lg">
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mentor Dashboard</h1>
              <p className="text-slate-500 text-sm">Welcome back, {user?.full_name}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Mentees', value: myMentorships.length, color: 'text-[#143A50]', icon: Users },
            { label: 'Upcoming Sessions', value: upcomingSessions.length, color: 'text-[#AC1A5B]', icon: Calendar },
            { label: 'Active Goals', value: activeGoals.length, color: 'text-amber-600', icon: Target },
            { label: 'Sessions Completed', value: completedSessions.length, color: 'text-emerald-700', icon: CheckCircle2 },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-8 h-8 ${color}`} />
                <div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="mentees">
          <TabsList className="mb-6">
            <TabsTrigger value="mentees">My Mentees ({myMentorships.length})</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="goals">Goals Tracking</TabsTrigger>
          </TabsList>

          {/* Mentees */}
          <TabsContent value="mentees">
            {myMentorships.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No mentees assigned yet</h3>
                  <p className="text-slate-500 text-sm">Your program administrator will assign participants to you.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myMentorships.map(mentorship => {
                  const sessions = getSessionsForMentorship(mentorship.id);
                  const goals = getGoalsForMentorship(mentorship.id);
                  const upcoming = sessions.filter(s => s.status === 'scheduled' && !isPast(new Date(s.scheduled_date)));
                  const completed = sessions.filter(s => s.status === 'completed');
                  const goalsCompleted = goals.filter(g => g.status === 'completed').length;

                  return (
                    <Card key={mentorship.id} className="border-0 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#AC1A5B] flex items-center justify-center text-white font-bold">
                              {mentorship.mentee_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{mentorship.mentee_name}</p>
                              <p className="text-xs text-slate-500">{mentorship.mentee_email}</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                        </div>

                        {mentorship.focus_areas?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {mentorship.focus_areas.map(a => (
                              <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <p className="text-lg font-bold text-[#143A50]">{upcoming.length}</p>
                            <p className="text-xs text-slate-500">Upcoming</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <p className="text-lg font-bold text-emerald-700">{completed.length}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <p className="text-lg font-bold text-amber-600">{goalsCompleted}/{goals.length}</p>
                            <p className="text-xs text-slate-500">Goals</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-[#143A50] hover:bg-[#1E4F58] text-xs gap-1"
                            onClick={() => { setSelectedMentorship(mentorship); setShowSessionModal(true); }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Schedule Session
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => setSelectedMentorship(selectedMentorship?.id === mentorship.id ? null : mentorship)}
                          >
                            {selectedMentorship?.id === mentorship.id ? 'Hide' : 'Details'}
                          </Button>
                        </div>

                        {/* Expanded Details */}
                        {selectedMentorship?.id === mentorship.id && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                            {upcoming.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2">Next Session:</p>
                                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                                  <p className="font-medium">{format(new Date(upcoming[0].scheduled_date), 'MMM d, yyyy • h:mm a')}</p>
                                  {upcoming[0].agenda && <p className="text-slate-600 text-xs mt-1">{upcoming[0].agenda}</p>}
                                  {upcoming[0].meeting_link && (
                                    <a href={upcoming[0].meeting_link} target="_blank" rel="noopener noreferrer">
                                      <Button size="sm" className="mt-2 bg-[#AC1A5B] text-xs gap-1">
                                        <Video className="w-3 h-3" /> Join
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                            {goals.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2">Goals:</p>
                                <div className="space-y-2">
                                  {goals.map(g => (
                                    <div key={g.id} className="p-2 bg-slate-50 rounded">
                                      <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-700">{g.goal_title}</span>
                                        <button onClick={() => { setSelectedGoal(g); setGoalUpdate({ progress: g.progress_percentage || 0, notes: g.notes || '' }); setShowGoalUpdateModal(true); }} className="text-[#143A50] underline">Update</button>
                                      </div>
                                      <Progress value={g.progress_percentage || 0} className="h-1.5" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Sessions */}
          <TabsContent value="sessions">
            <div className="space-y-4">
              {upcomingSessions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</p>
                  <div className="space-y-2">
                    {upcomingSessions.map(session => {
                      const mentorship = myMentorships.find(m => m.id === session.mentorship_id);
                      return (
                        <Card key={session.id} className="border-0 shadow-sm border-l-4 border-l-[#143A50]">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">{mentorship?.mentee_name}</p>
                                <p className="text-sm text-slate-600">
                                  {format(new Date(session.scheduled_date), 'EEEE, MMM d, yyyy • h:mm a')} • {session.duration_minutes} min
                                </p>
                                {session.agenda && <p className="text-sm text-slate-600 mt-1 italic">"{session.agenda}"</p>}
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                {session.meeting_link && (
                                  <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" className="bg-[#AC1A5B] text-xs gap-1">
                                      <Video className="w-3 h-3" /> Join
                                    </Button>
                                  </a>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => { setSessionNotes({ session, notes: '' }); setShowNotesModal(true); }}
                                >
                                  Complete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {completedSessions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Completed ({completedSessions.length})</p>
                  <div className="space-y-2">
                    {completedSessions.slice(0, 10).map(session => {
                      const mentorship = myMentorships.find(m => m.id === session.mentorship_id);
                      return (
                        <Card key={session.id} className="border-0 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{mentorship?.mentee_name}</p>
                                <p className="text-sm text-slate-500">{format(new Date(session.scheduled_date), 'MMM d, yyyy')} • {session.duration_minutes} min</p>
                                {session.notes && <p className="text-xs text-slate-600 mt-1">{session.notes}</p>}
                              </div>
                              <div className="text-right">
                                <Badge className="bg-emerald-100 text-emerald-800">Done</Badge>
                                {session.mentee_rating && (
                                  <div className="flex gap-0.5 mt-1 justify-end">
                                    {[1,2,3,4,5].map(i => (
                                      <Star key={i} className={`w-3 h-3 ${i <= session.mentee_rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {allSessions.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No sessions yet. Schedule one from the Mentees tab.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Goals */}
          <TabsContent value="goals">
            <div className="space-y-4">
              {activeGoals.length === 0 && completedGoals.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No goals yet. Goals are set by mentees from their dashboard.</p>
                </div>
              )}
              {[...activeGoals, ...completedGoals].map(goal => {
                const mentorship = myMentorships.find(m => m.id === goal.mentorship_id);
                return (
                  <Card key={goal.id} className="border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 mr-4">
                          <p className="font-semibold text-slate-900">{goal.goal_title}</p>
                          <p className="text-xs text-slate-500">Mentee: {mentorship?.mentee_name}</p>
                          {goal.description && <p className="text-sm text-slate-600 mt-1">{goal.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            goal.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {goal.status?.replace(/_/g, ' ')}
                          </Badge>
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => { setSelectedGoal(goal); setGoalUpdate({ progress: goal.progress_percentage || 0, notes: goal.notes || '' }); setShowGoalUpdateModal(true); }}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <Progress value={goal.progress_percentage || 0} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">{goal.progress_percentage || 0}% complete</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Session with {selectedMentorship?.mentee_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Date & Time *</Label>
              <Input type="datetime-local" className="mt-1" value={sessionForm.scheduled_date} onChange={e => setSessionForm(p => ({ ...p, scheduled_date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (minutes)</Label>
                <Input type="number" className="mt-1" value={sessionForm.duration_minutes} onChange={e => setSessionForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) }))} />
              </div>
              <div>
                <Label>Meeting Link</Label>
                <Input className="mt-1" value={sessionForm.meeting_link} onChange={e => setSessionForm(p => ({ ...p, meeting_link: e.target.value }))} placeholder="Zoom / Meet URL" />
              </div>
            </div>
            <div>
              <Label>Agenda</Label>
              <Textarea className="mt-1" value={sessionForm.agenda} onChange={e => setSessionForm(p => ({ ...p, agenda: e.target.value }))} rows={3} placeholder="Topics to cover..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSessionModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-[#143A50]" onClick={() => addSessionMutation.mutate(sessionForm)} disabled={!sessionForm.scheduled_date || addSessionMutation.isPending}>
                {addSessionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Session Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Session — Add Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Session Notes / Summary</Label>
              <Textarea
                className="mt-1"
                value={sessionNotes.notes}
                onChange={e => setSessionNotes(p => ({ ...p, notes: e.target.value }))}
                rows={4}
                placeholder="What was discussed? Key takeaways? Next steps?"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowNotesModal(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-emerald-700 hover:bg-emerald-800"
                onClick={() => completeSessionMutation.mutate({ sessionId: sessionNotes.session?.id, notes: sessionNotes.notes })}
                disabled={completeSessionMutation.isPending}
              >
                {completeSessionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Complete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Update Modal */}
      <Dialog open={showGoalUpdateModal} onOpenChange={setShowGoalUpdateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Goal Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm font-medium text-slate-900">{selectedGoal?.goal_title}</p>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <Label>Progress</Label>
                <span className="text-[#143A50] font-bold">{goalUpdate.progress}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={goalUpdate.progress}
                onChange={e => setGoalUpdate(p => ({ ...p, progress: parseInt(e.target.value) }))}
                className="w-full accent-[#143A50]"
              />
              <Progress value={goalUpdate.progress} className="h-2 mt-2" />
            </div>
            <div>
              <Label>Coach Notes</Label>
              <Textarea className="mt-1" value={goalUpdate.notes} onChange={e => setGoalUpdate(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Observations, suggestions..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowGoalUpdateModal(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-[#143A50]"
                onClick={() => updateGoalMutation.mutate({ id: selectedGoal.id, data: { progress_percentage: goalUpdate.progress, notes: goalUpdate.notes } })}
                disabled={updateGoalMutation.isPending}
              >
                {updateGoalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}