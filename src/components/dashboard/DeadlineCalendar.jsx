import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, addDays, isAfter, isBefore, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth } from 'date-fns';
import { Calendar, Plus, Clock, CheckCircle2, Trash2, Bell, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

const TYPE_COLORS = {
  draft_review: 'bg-blue-500',
  final_assembly: 'bg-purple-500',
  submission_prep: 'bg-amber-500',
  other: 'bg-slate-500',
  grant_deadline: 'bg-red-500',
};

const TYPE_LABELS = {
  draft_review: 'Draft Review',
  final_assembly: 'Final Assembly',
  submission_prep: 'Submission Prep',
  other: 'Other',
};

export default function DeadlineCalendar({ userEmail, savedOpportunities = [] }) {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({
    title: '',
    deadline_type: 'draft_review',
    due_date: '',
    linked_opportunity_id: '',
    linked_opportunity_title: '',
    notes: '',
    reminder_days_before: [7, 3, 1],
  });

  const { data: internalDeadlines = [] } = useQuery({
    queryKey: ['internal-deadlines', userEmail],
    queryFn: () => base44.entities.InternalDeadline.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.InternalDeadline.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-deadlines', userEmail] });
      setShowForm(false);
      setForm({ title: '', deadline_type: 'draft_review', due_date: '', linked_opportunity_id: '', linked_opportunity_title: '', notes: '', reminder_days_before: [7, 3, 1] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => base44.entities.InternalDeadline.update(id, { is_completed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['internal-deadlines', userEmail] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.InternalDeadline.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['internal-deadlines', userEmail] }),
  });

  // Build all deadline events (grant + internal)
  const grantEvents = savedOpportunities
    .filter(opp => opp.deadline || opp.deadline_full)
    .map(opp => ({
      id: `grant-${opp.id}`,
      title: opp.title,
      date: new Date(opp.deadline || opp.deadline_full),
      type: 'grant_deadline',
      source: 'grant',
      funder: opp.funder_name,
    }));

  const internalEvents = internalDeadlines
    .filter(d => !d.is_completed)
    .map(d => ({
      id: d.id,
      title: d.title,
      date: new Date(d.due_date),
      type: d.deadline_type,
      source: 'internal',
      raw: d,
    }));

  const allEvents = [...grantEvents, ...internalEvents].sort((a, b) => a.date - b.date);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0=Sun

  const getEventsForDay = (day) =>
    allEvents.filter(e => isSameDay(e.date, day));

  const today = new Date();
  const upcomingEvents = allEvents.filter(e => isAfter(e.date, today) || isSameDay(e.date, today)).slice(0, 8);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setForm(f => ({ ...f, due_date: format(day, 'yyyy-MM-dd') }));
    setShowForm(true);
  };

  const handleLinkedOpportunityChange = (oppId) => {
    const opp = savedOpportunities.find(o => o.id === oppId);
    setForm(f => ({
      ...f,
      linked_opportunity_id: oppId,
      linked_opportunity_title: opp?.title || '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...form, user_email: userEmail });
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#143A50]/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#143A50]" />
            </div>
            <div>
              <CardTitle>Deadline Calendar</CardTitle>
              <CardDescription>Grant deadlines + internal milestones with email reminders</CardDescription>
            </div>
          </div>
          <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58]" onClick={() => { setSelectedDay(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Internal Deadline
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-semibold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h3>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-0 text-center text-xs font-medium text-slate-500 mb-1">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0 border-l border-t border-slate-200">
              {/* Padding for first week */}
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} className="min-h-[64px] border-r border-b border-slate-200 bg-slate-50/50" />
              ))}
              {calendarDays.map(day => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, today);
                const isPast = isBefore(day, today) && !isToday;
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[64px] border-r border-b border-slate-200 p-1 cursor-pointer hover:bg-blue-50/50 transition-colors ${isPast ? 'bg-slate-50/70' : ''} ${isToday ? 'bg-blue-50' : ''}`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-[#143A50] text-white' : isPast ? 'text-slate-400' : 'text-slate-700'}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(e => (
                        <div key={e.id} className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${TYPE_COLORS[e.type]}`} title={e.title}>
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-slate-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[key]}`} />
                  {label}
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS.grant_deadline}`} />
                Grant Deadline
              </div>
            </div>
          </div>

          {/* Upcoming list */}
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 text-sm">Upcoming ({upcomingEvents.length})</h4>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">No upcoming deadlines</div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {upcomingEvents.map(e => {
                  const daysUntil = Math.ceil((e.date - today) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntil <= 3;
                  return (
                    <div key={e.id} className={`p-3 rounded-lg border text-sm ${isUrgent ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_COLORS[e.type]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate text-xs">{e.title}</p>
                          <p className="text-xs text-slate-500">{format(e.date, 'MMM d, yyyy')}</p>
                          <Badge variant="outline" className={`text-[10px] mt-1 ${isUrgent ? 'border-red-400 text-red-600' : ''}`}>
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                          </Badge>
                        </div>
                        {e.source === 'internal' && (
                          <div className="flex gap-1">
                            <button onClick={() => completeMutation.mutate(e.id)} title="Mark complete" className="text-emerald-500 hover:text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteMutation.mutate(e.id)} title="Delete" className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed */}
            {internalDeadlines.filter(d => d.is_completed).length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-400 mb-2">COMPLETED</p>
                <div className="space-y-1">
                  {internalDeadlines.filter(d => d.is_completed).slice(0, 3).map(d => (
                    <div key={d.id} className="flex items-center gap-2 text-xs text-slate-400 line-through">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {d.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Add Deadline Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#143A50]" />
              Add Internal Deadline
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                placeholder="e.g. Draft review for Smith Foundation"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type *</Label>
                <Select value={form.deadline_type} onValueChange={v => setForm(f => ({ ...f, deadline_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft_review">Draft Review</SelectItem>
                    <SelectItem value="final_assembly">Final Assembly</SelectItem>
                    <SelectItem value="submission_prep">Submission Prep</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  required
                />
              </div>
            </div>
            {savedOpportunities.length > 0 && (
              <div>
                <Label>Link to Opportunity (optional)</Label>
                <Select value={form.linked_opportunity_id} onValueChange={handleLinkedOpportunityChange}>
                  <SelectTrigger><SelectValue placeholder="Select opportunity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {savedOpportunities.map(opp => (
                      <SelectItem key={opp.id} value={opp.id}>{opp.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Any details about this milestone..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <Bell className="w-3.5 h-3.5 flex-shrink-0" />
              Email reminders will be sent automatically 7 days, 3 days, and 1 day before the due date.
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#143A50] hover:bg-[#1E4F58]" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save Deadline'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}