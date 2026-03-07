import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Users, MousePointer, BookOpen, TrendingUp, Clock, Activity } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

const EVENT_LABELS = {
  course_viewed: { label: 'Course Viewed', color: 'bg-blue-100 text-blue-800' },
  section_navigated: { label: 'Section Navigated', color: 'bg-indigo-100 text-indigo-800' },
  section_completed: { label: 'Section Completed', color: 'bg-green-100 text-green-800' },
  course_completed: { label: 'Course Completed', color: 'bg-emerald-100 text-emerald-800' },
  page_visit: { label: 'Page Visit', color: 'bg-purple-100 text-purple-800' },
  learning_activity: { label: 'Learning Activity', color: 'bg-orange-100 text-orange-800' },
};

export default function UserActivityAnalytics() {
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('7');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['analytics-events'],
    queryFn: async () => {
      const [activities, progress, pageVisits] = await Promise.all([
        base44.entities.LearningActivity.list('-created_date', 200),
        base44.entities.UserProgress.list('-updated_date', 200),
        base44.entities.UserActivity.filter({ activity_type: 'page_visit' }, '-created_date', 500),
      ]);

      const activityEvents = (activities || []).map(a => ({
        id: a.id,
        event: a.activity_type || 'learning_activity',
        user_email: a.participant_email || a.created_by || '',
        course_title: a.content_id || '',
        timestamp: a.created_date,
        details: a,
        source: 'activity'
      }));

      const progressEvents = (progress || []).map(p => ({
        id: p.id,
        event: p.is_completed ? 'course_completed' : 'course_progress_updated',
        user_email: p.participant_email || p.created_by || '',
        course_title: p.content_id || '',
        timestamp: p.updated_date,
        progress_percent: p.progress_percentage,
        details: p,
        source: 'progress'
      }));

      const pageEvents = (pageVisits || []).map(v => ({
        id: v.id,
        event: 'page_visit',
        user_email: v.user_email || '',
        course_title: v.metadata?.page || '',
        timestamp: v.created_date,
        duration: v.metadata?.duration_seconds,
        clicks: v.metadata?.clicks,
        keystrokes: v.metadata?.keystrokes,
        details: v,
        source: 'page_visit'
      }));

      return [...activityEvents, ...progressEvents, ...pageEvents].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    },
    enabled: user?.role === 'admin' || user?.role === 'owner',
  });

  // Also fetch user progress for per-user summary
  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-user-progress'],
    queryFn: () => base44.entities.UserProgress.list('-updated_date', 500),
    enabled: user?.role === 'admin' || user?.role === 'owner',
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['all-enrollments-analytics'],
    queryFn: () => base44.entities.ProgramEnrollment.list('-created_date', 200),
    enabled: user?.role === 'admin' || user?.role === 'owner',
  });

  if (userLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-500">Admin access required.</p></div>;
  }

  const cutoff = subDays(new Date(), parseInt(dayFilter));

  const filtered = events.filter(e => {
    const matchSearch = !search || (e.user_email || '').toLowerCase().includes(search.toLowerCase());
    const matchEvent = eventFilter === 'all' || e.event === eventFilter;
    const matchDate = isAfter(new Date(e.timestamp), cutoff);
    return matchSearch && matchEvent && matchDate;
  });

  // Per-user summary
  const userSummary = {};
  allProgress.forEach(p => {
    const email = p.participant_email || p.created_by || 'unknown';
    if (!userSummary[email]) userSummary[email] = { email, courses_viewed: 0, courses_completed: 0, last_active: null };
    userSummary[email].courses_viewed++;
    if (p.is_completed) userSummary[email].courses_completed++;
    if (!userSummary[email].last_active || p.updated_date > userSummary[email].last_active) {
      userSummary[email].last_active = p.updated_date;
    }
  });

  const topUsers = Object.values(userSummary)
    .filter(u => !search || u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.courses_viewed - a.courses_viewed)
    .slice(0, 20);

  const totalCourseCompletions = allProgress.filter(p => p.is_completed).length;
  const activeUserCount = Object.keys(userSummary).length;
  const recentEvents = events.filter(e => isAfter(new Date(e.timestamp), subDays(new Date(), 7)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="w-7 h-7 text-[#143A50]" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Activity Analytics</h1>
          <p className="text-sm text-slate-500">Granular view of what users are clicking and using</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-slate-500">Active Users</span>
            </div>
            <p className="text-2xl font-bold">{activeUserCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-green-500" />
              <span className="text-xs text-slate-500">Course Completions</span>
            </div>
            <p className="text-2xl font-bold">{totalCourseCompletions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <MousePointer className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-slate-500">Events (7d)</span>
            </div>
            <p className="text-2xl font-bold">{recentEvents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-slate-500">Total Enrollments</span>
            </div>
            <p className="text-2xl font-bold">{allEnrollments.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Feed</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-40">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input placeholder="Filter by email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
                </div>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="page_visit">Page Visits</SelectItem>
                    <SelectItem value="course_completed">Completions</SelectItem>
                    <SelectItem value="course_progress_updated">Progress</SelectItem>
                    <SelectItem value="learning_activity">Activities</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dayFilter} onValueChange={setDayFilter}>
                  <SelectTrigger className="w-28 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24h</SelectItem>
                    <SelectItem value="7">Last 7d</SelectItem>
                    <SelectItem value="30">Last 30d</SelectItem>
                    <SelectItem value="90">Last 90d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">No events found</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filtered.map((e, idx) => (
                    <div key={e.id + idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${EVENT_LABELS[e.event]?.color || 'bg-slate-100 text-slate-700'}`}>
                            {EVENT_LABELS[e.event]?.label || e.event}
                          </Badge>
                          <span className="text-xs text-slate-500 truncate">{e.user_email}</span>
                        </div>
                        {e.course_title && (
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {e.source === 'page_visit' ? `Page: ${e.course_title}` : `Content: ${e.course_title}`}
                          </p>
                        )}
                        {e.progress_percent != null && (
                          <p className="text-xs text-slate-500">Progress: {e.progress_percent}%</p>
                        )}
                        {e.source === 'page_visit' && (
                          <p className="text-xs text-slate-400">
                            {e.duration != null ? `${e.duration}s` : ''}{e.clicks != null ? ` · ${e.clicks} clicks` : ''}{e.keystrokes != null ? ` · ${e.keystrokes} keys` : ''}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {e.timestamp ? format(new Date(e.timestamp), 'MMM d, h:mm a') : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Per-User Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Users by Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {topUsers.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No data</p>
                ) : topUsers.map(u => (
                  <div key={u.email} className="p-3 rounded-lg border border-slate-100">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.email}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-slate-500">{u.courses_viewed} tracked</span>
                      <span className="text-xs text-green-600">{u.courses_completed} completed</span>
                    </div>
                    {u.last_active && (
                      <p className="text-xs text-slate-400 mt-1">
                        Last: {format(new Date(u.last_active), 'MMM d')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}