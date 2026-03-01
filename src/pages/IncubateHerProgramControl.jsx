import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Lock, Unlock, Calendar, Users, Save, X, Filter, CheckCircle2, 
  XCircle, AlertCircle, FileText, Settings, Download, Gift, Award,
  Search, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function IncubateHerProgramControl() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('access');
  
  // Access Control State
  const [editingUser, setEditingUser] = useState(null);
  const [bulkUnlockDate, setBulkUnlockDate] = useState('');
  
  // Attendance State
  const [selectedSession, setSelectedSession] = useState('all');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  
  // Facilitator Console State
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [consultationRecap, setConsultationRecap] = useState({
    strengths: '',
    gaps: '',
    readiness_level: '',
    next_steps: '',
    internal_notes: ''
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Role check
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#143A50] mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Admin Access Required</h3>
            <p className="text-slate-600">This page is only accessible to program administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: cohort, isLoading: cohortLoading } = useQuery({
    queryKey: ['admin-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['incubateher-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.filter({ role: 'participant' })
  });

  const { data: userAccessLevels = [], isLoading: accessLoading } = useQuery({
    queryKey: ['user-access-levels'],
    queryFn: () => base44.entities.UserAccessLevel.filter({ entry_point: 'incubateher_program' })
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['program-sessions'],
    queryFn: () => base44.entities.ProgramSession.list('-session_date')
  });

  const { data: allAttendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['session-attendance'],
    queryFn: () => base44.entities.SessionAttendance.list()
  });

  const isLoading = cohortLoading || enrollmentsLoading || accessLoading || sessionsLoading || attendanceLoading;

  // Access Control Mutations
  const updateAccessMutation = useMutation({
    mutationFn: async ({ userEmail, featureUnlocks }) => {
      const access = userAccessLevels.find(a => a.user_email === userEmail);
      if (access) {
        await base44.entities.UserAccessLevel.update(access.id, { feature_unlocks: featureUnlocks });
      } else {
        await base44.entities.UserAccessLevel.create({
          user_email: userEmail,
          access_level: 'full_platform',
          entry_point: 'incubateher_program',
          feature_unlocks: featureUnlocks
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-access-levels'] });
      toast.success('Access updated successfully');
      setEditingUser(null);
    }
  });

  const bulkUnlockMutation = useMutation({
    mutationFn: async ({ feature, unlockDate }) => {
      const updates = enrollments.map(enrollment => {
        const access = userAccessLevels.find(a => a.user_email === enrollment.participant_email);
        const currentUnlocks = access?.feature_unlocks || {};
        
        return access
          ? base44.entities.UserAccessLevel.update(access.id, {
              feature_unlocks: { ...currentUnlocks, [feature]: unlockDate }
            })
          : base44.entities.UserAccessLevel.create({
              user_email: enrollment.participant_email,
              access_level: 'full_platform',
              entry_point: 'incubateher_program',
              feature_unlocks: { [feature]: unlockDate }
            });
      });
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-access-levels'] });
      toast.success('Bulk unlock successful');
      setBulkUnlockDate('');
    }
  });

  // Attendance Mutations
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

  // Consultation Mutation
  const submitConsultationRecapMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ConsultationRecap.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['consultations']);
      toast.success('Consultation recap saved');
      setConsultationRecap({ strengths: '', gaps: '', readiness_level: '', next_steps: '', internal_notes: '' });
    }
  });

  // Admin Settings Mutations
  const toggleGiveawayMutation = useMutation({
    mutationFn: async (revealed) => {
      return await base44.entities.ProgramCohort.update(cohort.id, {
        giveaway_revealed: revealed
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cohort']);
      toast.success('Giveaway visibility updated');
    }
  });

  const drawWinnerMutation = useMutation({
    mutationFn: async () => {
      const eligible = enrollments.filter(e => e.giveaway_eligible);
      
      if (eligible.length === 0) {
        throw new Error('No eligible participants');
      }

      const winner = eligible[Math.floor(Math.random() * eligible.length)];
      
      await base44.entities.GiveawayWinner.create({
        cohort_id: cohort.id,
        enrollment_id: winner.id,
        participant_email: winner.participant_email,
        participant_name: winner.participant_name,
        draw_timestamp: new Date().toISOString(),
        drawn_by: user?.email,
        prize_description: cohort.giveaway_prize_description
      });

      await base44.entities.ProgramEnrollment.update(winner.id, {
        giveaway_winner: true
      });

      return winner;
    },
    onSuccess: (winner) => {
      queryClient.invalidateQueries(['incubateher-enrollments']);
      toast.success(`Winner selected: ${winner.participant_name}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const restrictedFeatures = [
    { page: 'AIDocumentReview', label: 'AI Document Review' },
    { page: 'Projects', label: 'Projects' },
    { page: 'Documents', label: 'Documents' },
    { page: 'Opportunities', label: 'Funding Opportunities' },
    { page: 'BoutiqueServices', label: 'Boutique Services' },
    { page: 'Community', label: 'Community Spaces' },
    { page: 'Events', label: 'Events' },
    { page: 'MyMentorship', label: 'My Mentorship' }
  ];

  const isAttended = (enrollmentId, sessionId) => {
    return allAttendance.some(
      a => a.enrollment_id === enrollmentId && a.session_id === sessionId && a.attended
    );
  };

  const calculateAttendanceRate = (enrollmentId) => {
    const total = sessions.length;
    const attended = allAttendance.filter(
      a => a.enrollment_id === enrollmentId && a.attended
    ).length;
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = e.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.participant_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'not_started') return matchesSearch && !e.pre_assessment_completed;
    if (filterStatus === 'in_progress') return matchesSearch && e.pre_assessment_completed && !e.program_completed;
    if (filterStatus === 'complete') return matchesSearch && e.program_completed;
    if (filterStatus === 'missing_pre_test') return matchesSearch && !e.pre_assessment_completed;
    if (filterStatus === 'needs_consultation') return matchesSearch && e.pre_assessment_completed && !e.consultation_completed;
    if (filterStatus === 'missing_docs') return matchesSearch && !e.documents_uploaded;
    
    return matchesSearch;
  });

  const attendanceFilteredEnrollments = enrollments.filter(e =>
    e.participant_name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
    e.participant_email.toLowerCase().includes(attendanceSearch.toLowerCase())
  );

  const filteredSessions = selectedSession === 'all'
    ? sessions
    : sessions.filter(s => s.id === selectedSession);

  const completedCount = enrollments.filter(e => e.program_completed).length;
  const totalEnrolled = enrollments.length;
  const eligibleCount = enrollments.filter(e => e.giveaway_eligible).length;

  const handleExportAttendance = async () => {
    try {
      const csvData = [
        ['Participant', 'Email', ...sessions.map(s => new Date(s.session_date).toLocaleDateString()), 'Attendance Rate'],
        ...enrollments.map(e => [
          e.participant_name,
          e.participant_email,
          ...sessions.map(s => isAttended(e.id, s.id) ? '✓' : '✗'),
          `${calculateAttendanceRate(e.id)}%`
        ])
      ];
      
      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incubateher-attendance-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Attendance report downloaded');
    } catch (error) {
      toast.error('Failed to export attendance');
    }
  };

  const handleExportAssessments = async () => {
    try {
      const csvData = [
        ['Participant', 'Email', 'Pre-Assessment', 'Post-Assessment', 'Consultation', 'Documents'],
        ...enrollments.map(e => [
          e.participant_name,
          e.participant_email,
          e.pre_assessment_completed ? 'Complete' : 'Pending',
          e.post_assessment_completed ? 'Complete' : 'Pending',
          e.consultation_completed ? 'Complete' : 'Pending',
          e.documents_uploaded ? 'Uploaded' : 'Missing'
        ])
      ];
      
      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incubateher-assessments-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Assessment report downloaded');
    } catch (error) {
      toast.error('Failed to export assessments');
    }
  };

  const handleExportMetrics = async () => {
    try {
      const avgAttendance = Math.round(
        enrollments.reduce((sum, e) => sum + calculateAttendanceRate(e.id), 0) / (enrollments.length || 1)
      );
      
      const csvData = [
        ['Metric', 'Value'],
        ['Total Enrolled', totalEnrolled],
        ['Completed', completedCount],
        ['Completion Rate', `${totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0}%`],
        ['Average Attendance', `${avgAttendance}%`],
        ['Pre-Assessments Complete', enrollments.filter(e => e.pre_assessment_completed).length],
        ['Post-Assessments Complete', enrollments.filter(e => e.post_assessment_completed).length],
        ['Consultations Complete', enrollments.filter(e => e.consultation_completed).length],
        ['Documents Uploaded', enrollments.filter(e => e.documents_uploaded).length],
        ['Giveaway Eligible', eligibleCount]
      ];
      
      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incubateher-metrics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Metrics report downloaded');
    } catch (error) {
      toast.error('Failed to export metrics');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#143A50] mx-auto mb-4" />
          <p className="text-slate-600">Loading program data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#143A50] mb-2">IncubateHer Program Control</h1>
          <p className="text-slate-600">Comprehensive program management - access, attendance, facilitation, and settings</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Enrolled</p>
                  <p className="text-3xl font-bold text-[#143A50]">{totalEnrolled}</p>
                </div>
                <Users className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                </div>
                <Award className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-[#AC1A5B]">
                    {totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0}%
                  </p>
                </div>
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg. Attendance</p>
                  <p className="text-3xl font-bold text-[#E5C089]">
                    {Math.round(
                      enrollments.reduce((sum, e) => sum + calculateAttendanceRate(e.id), 0) /
                        (enrollments.length || 1)
                    )}%
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="facilitation">Facilitation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Access Control Tab */}
          <TabsContent value="access" className="space-y-6">
            {/* Bulk Unlock Section */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Feature Unlock</CardTitle>
                <CardDescription>Set unlock dates for all participants at once</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Select Unlock Date</Label>
                    <Input
                      type="datetime-local"
                      value={bulkUnlockDate}
                      onChange={(e) => setBulkUnlockDate(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {restrictedFeatures.map(feature => (
                      <AlertDialog key={feature.page}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!bulkUnlockDate || bulkUnlockMutation.isPending}
                          >
                            <Unlock className="w-4 h-4 mr-2" />
                            Unlock {feature.label}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Bulk Unlock</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will unlock "{feature.label}" for all {enrollments.length} participants on {format(new Date(bulkUnlockDate), 'PPP p')}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => bulkUnlockMutation.mutate({ feature: feature.page, unlockDate: bulkUnlockDate })}
                              className="bg-[#143A50]"
                            >
                              Confirm Unlock
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Participants */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants ({enrollments.length})
              </h2>

              {enrollments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No participants enrolled yet</p>
                  </CardContent>
                </Card>
              ) : (
                enrollments.map(enrollment => {
                const userAccess = userAccessLevels.find(a => a.user_email === enrollment.participant_email);
                const featureUnlocks = userAccess?.feature_unlocks || {};
                const isEditing = editingUser === enrollment.participant_email;

                return (
                  <Card key={enrollment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{enrollment.participant_name}</CardTitle>
                          <CardDescription>{enrollment.participant_email}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(isEditing ? null : enrollment.participant_email)}
                        >
                          {isEditing ? <X className="w-4 h-4" /> : 'Edit Access'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <EditUserAccess
                          userEmail={enrollment.participant_email}
                          featureUnlocks={featureUnlocks}
                          restrictedFeatures={restrictedFeatures}
                          onSave={(email, unlocks) => updateAccessMutation.mutate({ userEmail: email, featureUnlocks: unlocks })}
                          onCancel={() => setEditingUser(null)}
                        />
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {restrictedFeatures.map(feature => {
                            const unlockDate = featureUnlocks[feature.page];
                            const isUnlocked = unlockDate && new Date(unlockDate) <= new Date();
                            
                            return (
                              <div
                                key={feature.page}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  isUnlocked
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isUnlocked ? (
                                    <Unlock className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-slate-400" />
                                  )}
                                  <span className="text-sm font-medium">{feature.label}</span>
                                </div>
                                {unlockDate && (
                                  <Badge variant="outline" className="text-xs">
                                    {format(new Date(unlockDate), 'MMM d')}
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
              )}
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search participants..."
                        value={attendanceSearch}
                        onChange={(e) => setAttendanceSearch(e.target.value)}
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
                      {attendanceFilteredEnrollments.map(enrollment => {
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
          </TabsContent>

          {/* Facilitation Tab */}
          <TabsContent value="facilitation" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Participants</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="missing_pre_test">Missing Pre-Test</SelectItem>
                      <SelectItem value="needs_consultation">Needs Consultation</SelectItem>
                      <SelectItem value="missing_docs">Missing Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participant Roster ({filteredEnrollments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEnrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="border-l-4 border-l-[#143A50]">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{enrollment.participant_name}</h4>
                            <p className="text-sm text-slate-600">{enrollment.participant_email}</p>
                            
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {enrollment.pre_assessment_completed ? (
                                <Badge className="bg-green-100 text-green-800">Pre-Test ✓</Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600">Pre-Test Missing</Badge>
                              )}
                              
                              {enrollment.consultation_completed ? (
                                <Badge className="bg-green-100 text-green-800">Consultation ✓</Badge>
                              ) : (
                                <Badge variant="outline">Consultation Pending</Badge>
                              )}
                              
                              {enrollment.documents_uploaded ? (
                                <Badge className="bg-green-100 text-green-800">Docs ✓</Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600">Docs Missing</Badge>
                              )}
                              
                              {enrollment.post_assessment_completed ? (
                                <Badge className="bg-green-100 text-green-800">Post-Test ✓</Badge>
                              ) : (
                                <Badge variant="outline">Post-Test Pending</Badge>
                              )}
                            </div>
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Add Recap
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Consultation Recap: {enrollment.participant_name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Strengths Identified</label>
                                  <Textarea
                                    value={consultationRecap.strengths}
                                    onChange={(e) => setConsultationRecap({...consultationRecap, strengths: e.target.value})}
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Gaps Identified</label>
                                  <Textarea
                                    value={consultationRecap.gaps}
                                    onChange={(e) => setConsultationRecap({...consultationRecap, gaps: e.target.value})}
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Readiness Level</label>
                                  <Select 
                                    value={consultationRecap.readiness_level}
                                    onValueChange={(val) => setConsultationRecap({...consultationRecap, readiness_level: val})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_ready">Not Ready</SelectItem>
                                      <SelectItem value="emerging">Emerging</SelectItem>
                                      <SelectItem value="competitive">Competitive</SelectItem>
                                      <SelectItem value="highly_competitive">Highly Competitive</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Recommended Next Steps</label>
                                  <Textarea
                                    value={consultationRecap.next_steps}
                                    onChange={(e) => setConsultationRecap({...consultationRecap, next_steps: e.target.value})}
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Internal Notes (EIS Only)</label>
                                  <Textarea
                                    value={consultationRecap.internal_notes}
                                    onChange={(e) => setConsultationRecap({...consultationRecap, internal_notes: e.target.value})}
                                    rows={2}
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    if (!consultationRecap.strengths || !consultationRecap.gaps || !consultationRecap.readiness_level || !consultationRecap.next_steps) {
                                      toast.error('Please fill in all required fields');
                                      return;
                                    }
                                    submitConsultationRecapMutation.mutate({
                                      enrollment_id: enrollment.id,
                                      participant_email: enrollment.participant_email,
                                      consultant_email: user?.email,
                                      consultation_date: new Date().toISOString(),
                                      ...consultationRecap
                                    });
                                  }}
                                  className="w-full bg-[#143A50]"
                                  disabled={submitConsultationRecapMutation.isPending}
                                >
                                  {submitConsultationRecapMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    'Save Consultation Recap'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Program Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Program Name</label>
                  <Input value={cohort?.program_name || ''} disabled />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Program Code</label>
                  <Input value={cohort?.program_code || ''} disabled />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Giveaway Revealed to Participants</p>
                    <p className="text-sm text-slate-600">Toggle visibility of giveaway page</p>
                  </div>
                  <Switch
                    checked={cohort?.giveaway_revealed || false}
                    onCheckedChange={(checked) => toggleGiveawayMutation.mutate(checked)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Giveaway Prize Description</label>
                  <Input 
                    value={cohort?.giveaway_prize_description || ''} 
                    placeholder="Enter prize description..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Giveaway Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong>Important:</strong> Federal grants are excluded. Only eligible participants who completed all requirements can win.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Eligible Pool ({eligibleCount} participants)</h4>
                  <div className="space-y-2">
                    {enrollments.filter(e => e.giveaway_eligible).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <p className="font-medium">{enrollment.participant_name}</p>
                          <p className="text-sm text-slate-600">{enrollment.participant_email}</p>
                        </div>
                        {enrollment.giveaway_winner && (
                          <Badge className="bg-yellow-500">Winner</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {eligibleCount > 0 && !enrollments.some(e => e.giveaway_winner) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="lg"
                        className="w-full bg-[#E5C089] hover:bg-[#d4af78] text-[#143A50]"
                        disabled={drawWinnerMutation.isPending}
                      >
                        <Gift className="w-5 h-5 mr-2" />
                        {drawWinnerMutation.isPending ? 'Drawing...' : 'Draw Random Winner'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Winner Selection</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will randomly select one winner from {eligibleCount} eligible participants. This action is permanent and cannot be undone. Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => drawWinnerMutation.mutate()}
                          className="bg-[#E5C089] hover:bg-[#d4af78] text-[#143A50]"
                        >
                          Draw Winner
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Attendance Report</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Export attendance records for all sessions (CSV format)
                  </p>
                  <Button variant="outline" onClick={handleExportAttendance} disabled={enrollments.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Attendance
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Assessment Summary</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Aggregate pre/post assessment scores and completion status (CSV format)
                  </p>
                  <Button variant="outline" onClick={handleExportAssessments} disabled={enrollments.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Assessments
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Completion Metrics</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Completion rates, consultation counts, document submission rates (CSV format)
                  </p>
                  <Button variant="outline" onClick={handleExportMetrics} disabled={enrollments.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EditUserAccess({ userEmail, featureUnlocks, restrictedFeatures, onSave, onCancel }) {
  const [unlocks, setUnlocks] = useState(featureUnlocks);

  const handleUnlockChange = (page, date) => {
    setUnlocks(prev => ({
      ...prev,
      [page]: date
    }));
  };

  const handleToggle = (page, enabled) => {
    if (enabled) {
      setUnlocks(prev => ({
        ...prev,
        [page]: new Date().toISOString()
      }));
    } else {
      const newUnlocks = { ...unlocks };
      delete newUnlocks[page];
      setUnlocks(newUnlocks);
    }
  };

  return (
    <div className="space-y-4">
      {restrictedFeatures.map(feature => {
        const unlockDate = unlocks[feature.page];
        const isEnabled = !!unlockDate;

        return (
          <div key={feature.page} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3 flex-1">
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(feature.page, checked)}
              />
              <Label className="cursor-pointer">{feature.label}</Label>
            </div>
            {isEnabled && (
              <Input
                type="datetime-local"
                value={(() => { try { const d = new Date(unlockDate); return isNaN(d.getTime()) ? '' : format(d, "yyyy-MM-dd'T'HH:mm"); } catch { return ''; } })()}
                onChange={(e) => handleUnlockChange(feature.page, e.target.value)}
                className="max-w-xs"
              />
            )}
          </div>
        );
      })}
      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave(userEmail, unlocks)}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}