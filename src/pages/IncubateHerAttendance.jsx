import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, Users, Search, Download, Video, Monitor, FileDown, Printer } from 'lucide-react';
import { toast } from 'sonner';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';

// ─────────────────────────────────────────────
// PARTICIPANT VIEW — mark that you watched recording
// ─────────────────────────────────────────────
function ParticipantAttendanceView({ user, enrollment }) {
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['program-sessions-participant'],
    queryFn: () => base44.entities.ProgramSession.list('session_order')
  });

  const { data: myAttendance = [] } = useQuery({
    queryKey: ['my-attendance', enrollment?.id],
    queryFn: () => base44.entities.SessionAttendance.filter({ enrollment_id: enrollment.id }),
    enabled: !!enrollment?.id
  });

  const markRecordingMutation = useMutation({
    mutationFn: async ({ sessionId, watched }) => {
      const existing = myAttendance.find(a => a.session_id === sessionId);
      const now = new Date().toISOString();
      if (existing) {
        return await base44.entities.SessionAttendance.update(existing.id, {
          watched_recording: watched,
          watched_recording_date: watched ? now : null,
          attendance_type: existing.attended ? 'live' : (watched ? 'recording' : 'absent')
        });
      } else {
        return await base44.entities.SessionAttendance.create({
          enrollment_id: enrollment.id,
          session_id: sessionId,
          participant_email: user.email,
          attended: false,
          watched_recording: watched,
          watched_recording_date: watched ? now : null,
          attendance_type: watched ? 'recording' : 'absent'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      toast.success('Session recording marked as watched!');
    }
  });

  const getAttendance = (sessionId) => myAttendance.find(a => a.session_id === sessionId);

  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Video className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-900">Missed a session? Watch the recording.</p>
          <p className="text-sm text-blue-800">
            If you couldn't attend a live session, watch the recording and check the box below to mark it complete for your attendance record.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const attendance = getAttendance(session.id);
          const attendedLive = attendance?.attended;
          const watchedRecording = attendance?.watched_recording;

          return (
            <Card key={session.id} className={`border-2 ${attendedLive ? 'border-green-300' : watchedRecording ? 'border-blue-300' : 'border-slate-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{session.session_title}</p>
                      {attendedLive && (
                        <Badge className="bg-green-100 text-green-800 text-xs">✓ Attended Live</Badge>
                      )}
                      {!attendedLive && watchedRecording && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">✓ Watched Recording</Badge>
                      )}
                      {!attendedLive && !watchedRecording && (
                        <Badge className="bg-slate-100 text-slate-600 text-xs">Not yet attended</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      {session.start_time && ` • ${session.start_time}`}
                    </p>
                    {session.description && (
                      <p className="text-sm text-slate-600 mt-1">{session.description}</p>
                    )}
                  </div>

                  {/* Only show recording checkbox if they didn't attend live */}
                  {!attendedLive && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Checkbox
                        id={`recording-${session.id}`}
                        checked={watchedRecording || false}
                        onCheckedChange={(checked) =>
                          markRecordingMutation.mutate({ sessionId: session.id, watched: checked })
                        }
                        disabled={markRecordingMutation.isPending}
                      />
                      <label htmlFor={`recording-${session.id}`} className="text-sm text-slate-700 cursor-pointer">
                        <span className="flex items-center gap-1.5">
                          <Monitor className="w-4 h-4 text-slate-400" />
                          I watched the recording
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sessions.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No sessions scheduled yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {sessions.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {myAttendance.filter(a => a.attended).length}
              </p>
              <p className="text-xs text-slate-600">Attended Live</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {myAttendance.filter(a => a.watched_recording && !a.attended).length}
              </p>
              <p className="text-xs text-slate-600">Watched Recording</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-700">
                {sessions.length - myAttendance.filter(a => a.attended || a.watched_recording).length}
              </p>
              <p className="text-xs text-slate-600">Sessions Remaining</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN VIEW — mark live attendance per session
// ─────────────────────────────────────────────
function AdminAttendanceView() {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: sessions = [] } = useQuery({
    queryKey: ['program-sessions'],
    queryFn: () => base44.entities.ProgramSession.list('session_order')
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['program-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.filter({ role: 'participant' })
  });

  const { data: allAttendance = [] } = useQuery({
    queryKey: ['session-attendance'],
    queryFn: () => base44.entities.SessionAttendance.list()
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ enrollmentId, sessionId, attended }) => {
      const existing = allAttendance.find(
        a => a.enrollment_id === enrollmentId && a.session_id === sessionId
      );
      const enrollment = enrollments.find(e => e.id === enrollmentId);
      if (existing) {
        return await base44.entities.SessionAttendance.update(existing.id, {
          attended,
          attendance_type: attended ? 'live' : (existing.watched_recording ? 'recording' : 'absent'),
          attendance_marked_by: user?.email
        });
      } else {
        return await base44.entities.SessionAttendance.create({
          enrollment_id: enrollmentId,
          session_id: sessionId,
          participant_email: enrollment?.participant_email,
          attended,
          attendance_type: attended ? 'live' : 'absent',
          attendance_marked_by: user?.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-attendance']);
      toast.success('Attendance updated');
    }
  });

  const isAttended = (enrollmentId, sessionId) =>
    allAttendance.some(a => a.enrollment_id === enrollmentId && a.session_id === sessionId && a.attended);

  const watchedRecording = (enrollmentId, sessionId) =>
    allAttendance.some(a => a.enrollment_id === enrollmentId && a.session_id === sessionId && a.watched_recording && !a.attended);

  const currentSession = sessions.find(s => s.id === selectedSession);

  const filteredEnrollments = enrollments.filter(e =>
    (e.participant_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.participant_email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateRate = (enrollmentId) => {
    const total = sessions.length;
    const counted = allAttendance.filter(
      a => a.enrollment_id === enrollmentId && (a.attended || a.watched_recording)
    ).length;
    return total > 0 ? Math.round((counted / total) * 100) : 0;
  };

  const exportCSV = () => {
    const sessionHeaders = sessions.map(s =>
      `"${s.session_title} (${new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})"`
    ).join(',');

    const header = `"Name","Email","Organization",${sessionHeaders},"Sessions Attended Live","Sessions via Recording","Total Sessions Counted","Completion Rate (%)"`;

    const rows = enrollments.map(enrollment => {
      const sessionCols = sessions.map(session => {
        const attended = isAttended(enrollment.id, session.id);
        const watched = watchedRecording(enrollment.id, session.id);
        if (attended) return '"Live"';
        if (watched) return '"Recording"';
        return '"Absent"';
      }).join(',');

      const liveCount = allAttendance.filter(a => a.enrollment_id === enrollment.id && a.attended).length;
      const recCount = allAttendance.filter(a => a.enrollment_id === enrollment.id && a.watched_recording && !a.attended).length;
      const total = liveCount + recCount;
      const rate = calculateRate(enrollment.id);

      return `"${enrollment.participant_name}","${enrollment.participant_email}","${enrollment.organization_name || ''}",${sessionCols},${liveCount},${recCount},${total},${rate}`;
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IncubateHer-Attendance-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Session Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Select Session to Take Attendance</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a session..." />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.session_title} — {new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Search Participants</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance for selected session */}
      {selectedSession ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#143A50]" />
              {currentSession?.session_title} — {currentSession && new Date(currentSession.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardTitle>
            <p className="text-sm text-slate-500">Check each participant who attended live (Google Meet or in-person)</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredEnrollments.map(enrollment => {
                const attended = isAttended(enrollment.id, selectedSession);
                const watched = watchedRecording(enrollment.id, selectedSession);
                return (
                  <div key={enrollment.id} className={`flex items-center justify-between p-3 rounded-lg border ${attended ? 'bg-green-50 border-green-200' : watched ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={attended}
                        onCheckedChange={(checked) =>
                          markAttendanceMutation.mutate({ enrollmentId: enrollment.id, sessionId: selectedSession, attended: checked })
                        }
                      />
                      <div>
                        <p className="font-medium text-slate-900">{enrollment.participant_name}</p>
                        <p className="text-sm text-slate-500">{enrollment.participant_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {attended && <Badge className="bg-green-100 text-green-800">✓ Live</Badge>}
                      {!attended && watched && <Badge className="bg-blue-100 text-blue-800">Recording</Badge>}
                      {!attended && !watched && <Badge className="bg-slate-100 text-slate-600">Absent</Badge>}
                    </div>
                  </div>
                );
              })}
              {filteredEnrollments.length === 0 && (
                <p className="text-center py-8 text-slate-500">No participants found</p>
              )}
            </div>

            {/* Session Quick Stats */}
            <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                {allAttendance.filter(a => a.session_id === selectedSession && a.attended).length} attended live
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>
                {allAttendance.filter(a => a.session_id === selectedSession && a.watched_recording && !a.attended).length} watched recording
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span>
                {enrollments.length - allAttendance.filter(a => a.session_id === selectedSession && (a.attended || a.watched_recording)).length} absent
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Select a session above to take attendance</p>
        </div>
      )}

      {/* All-participant overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>All Participants — Attendance Overview</CardTitle>
              <p className="text-sm text-slate-500">Live + recording counted toward attendance rate</p>
            </div>
            <Button onClick={exportCSV} variant="outline" size="sm" className="flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-3 font-semibold">Participant</th>
                  {sessions.map(s => (
                    <th key={s.id} className="text-center p-3 font-semibold min-w-[80px] text-xs">
                      <div>{new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </th>
                  ))}
                  <th className="text-center p-3 font-semibold text-xs">Live</th>
                  <th className="text-center p-3 font-semibold text-xs">Recording</th>
                  <th className="text-center p-3 font-semibold">Completion</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map(enrollment => {
                const rate = calculateRate(enrollment.id);
                const liveCount = allAttendance.filter(a => a.enrollment_id === enrollment.id && a.attended).length;
                const recCount = allAttendance.filter(a => a.enrollment_id === enrollment.id && a.watched_recording && !a.attended).length;
                return (
                  <tr key={enrollment.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-medium">{enrollment.participant_name}</p>
                      <p className="text-xs text-slate-500">{enrollment.participant_email}</p>
                    </td>
                    {sessions.map(session => {
                      const attended = isAttended(enrollment.id, session.id);
                      const watched = watchedRecording(enrollment.id, session.id);
                      return (
                        <td key={session.id} className="text-center p-2">
                          <button
                            title={attended ? "Click to remove live attendance" : "Click to mark attended live"}
                            onClick={() => markAttendanceMutation.mutate({ enrollmentId: enrollment.id, sessionId: session.id, attended: !attended })}
                            className="text-lg hover:scale-125 transition-transform cursor-pointer"
                          >
                            {attended ? (
                              <span className="text-green-600">●</span>
                            ) : watched ? (
                              <span className="text-blue-400">◐</span>
                            ) : (
                              <span className="text-slate-300">○</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-center p-2 text-sm font-medium text-green-700">{liveCount}</td>
                    <td className="text-center p-2 text-sm font-medium text-blue-600">{recCount}</td>
                    <td className="text-center p-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <Badge className={rate >= 80 ? 'bg-green-100 text-green-800' : rate >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}>
                          {rate}%
                        </Badge>
                        <span className="text-xs text-slate-400">{liveCount + recCount}/{sessions.length}</span>
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-6 text-xs text-slate-500">
            <span><span className="text-green-600 font-bold">●</span> Attended live</span>
            <span><span className="text-blue-400 font-bold">◐</span> Watched recording</span>
            <span><span className="text-slate-300 font-bold">○</span> Absent</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-[#AC1A5B]" />
          <div><p className="text-2xl font-bold">{enrollments.length}</p><p className="text-xs text-slate-600">Total Participants</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-[#143A50]" />
          <div><p className="text-2xl font-bold">{sessions.length}</p><p className="text-xs text-slate-600">Sessions</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div><p className="text-2xl font-bold">{allAttendance.filter(a => a.attended).length}</p><p className="text-xs text-slate-600">Live Attendances</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Video className="w-8 h-8 text-blue-500" />
          <div><p className="text-2xl font-bold">{allAttendance.filter(a => a.watched_recording && !a.attended).length}</p><p className="text-xs text-slate-600">Watched Recording</p></div>
        </CardContent></Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function IncubateHerAttendance() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollment } = useQuery({
    queryKey: ['my-enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({ participant_email: user.email });
      return enrollments.find(e => e.cohort_id) || null;
    },
    enabled: !!user?.email
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader
        title={isAdmin ? 'Attendance Tracking' : 'My Attendance'}
        subtitle={isAdmin ? 'Mark live attendance & view recording completions' : 'Track your session attendance and mark recordings watched'}
      />

      <div className="max-w-6xl mx-auto p-6">
        {isAdmin ? (
          <AdminAttendanceView />
        ) : (
          enrollment ? (
            <ParticipantAttendanceView user={user} enrollment={enrollment} />
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Not Enrolled</h3>
                <p className="text-slate-500">You don't have an active enrollment in this program.</p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <CoBrandedFooter />
    </div>
  );
}