import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, Users, Search, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function IncubateHerAttendance() {
  const [selectedSession, setSelectedSession] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['program-sessions'],
    queryFn: () => base44.entities.ProgramSession.list('-session_date')
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['program-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.filter({ role: 'participant' })
  });

  const { data: allAttendance = [] } = useQuery({
    queryKey: ['session-attendance'],
    queryFn: () => base44.entities.SessionAttendance.list()
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ enrollmentId, sessionId, attended }) => {
      const existing = allAttendance.find(
        a => a.enrollment_id === enrollmentId && a.session_id === sessionId
      );

      if (existing) {
        return await base44.entities.SessionAttendance.update(existing.id, { attended });
      } else {
        const enrollment = enrollments.find(e => e.id === enrollmentId);
        return await base44.entities.SessionAttendance.create({
          enrollment_id: enrollmentId,
          session_id: sessionId,
          participant_email: enrollment.participant_email,
          participant_name: enrollment.participant_name,
          attended
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-attendance']);
      toast.success('Attendance updated');
    }
  });

  const isAttended = (enrollmentId, sessionId) => {
    return allAttendance.some(
      a => a.enrollment_id === enrollmentId && a.session_id === sessionId && a.attended
    );
  };

  const filteredEnrollments = enrollments.filter(e =>
    e.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.participant_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSessions = selectedSession === 'all'
    ? sessions
    : sessions.filter(s => s.id === selectedSession);

  const calculateAttendanceRate = (enrollmentId) => {
    const total = sessions.length;
    const attended = allAttendance.filter(
      a => a.enrollment_id === enrollmentId && a.attended
    ).length;
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Admin Access Required</h3>
            <p className="text-slate-600">This page is only accessible to program administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Attendance Tracking</h1>
              <p className="text-slate-600">Mark and track participant attendance</p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search participants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {sessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.topic} - {new Date(session.session_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Participant Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Participant</th>
                    {filteredSessions.map(session => (
                      <th key={session.id} className="text-center p-3 font-semibold min-w-[120px]">
                        <div className="text-xs text-slate-600">
                          {new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{session.topic}</div>
                      </th>
                    ))}
                    <th className="text-center p-3 font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map(enrollment => {
                    const rate = calculateAttendanceRate(enrollment.id);
                    return (
                      <tr key={enrollment.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{enrollment.participant_name}</p>
                            <p className="text-sm text-slate-600">{enrollment.participant_email}</p>
                          </div>
                        </td>
                        {filteredSessions.map(session => {
                          const attended = isAttended(enrollment.id, session.id);
                          return (
                            <td key={session.id} className="text-center p-3">
                              <Checkbox
                                checked={attended}
                                onCheckedChange={(checked) => {
                                  markAttendanceMutation.mutate({
                                    enrollmentId: enrollment.id,
                                    sessionId: session.id,
                                    attended: checked
                                  });
                                }}
                                className="mx-auto"
                              />
                            </td>
                          );
                        })}
                        <td className="text-center p-3">
                          <Badge
                            className={
                              rate >= 80
                                ? 'bg-green-100 text-green-800'
                                : rate >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {rate}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-[#AC1A5B]" />
                <div>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                  <p className="text-sm text-slate-600">Total Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-[#AC1A5B]" />
                <div>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                  <p className="text-sm text-slate-600">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {allAttendance.filter(a => a.attended).length}
                  </p>
                  <p className="text-sm text-slate-600">Total Attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      enrollments.reduce((sum, e) => sum + calculateAttendanceRate(e.id), 0) /
                        (enrollments.length || 1)
                    )}%
                  </p>
                  <p className="text-sm text-slate-600">Avg. Attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}