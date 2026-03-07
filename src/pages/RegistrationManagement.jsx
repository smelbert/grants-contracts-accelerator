import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, CheckCircle2, Clock, Search, ChevronDown, ChevronUp,
  FileText, Shield, AlertCircle, RefreshCw, Calendar, Building2,
  Mail, Phone, ExternalLink
} from 'lucide-react';
import RegistrationAttachments from '@/components/incubateher/RegistrationAttachments';
import { toast } from 'sonner';

export default function RegistrationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('enrollments');
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['all-program-enrollments'],
    queryFn: () => base44.asServiceRole.entities.ProgramEnrollment.list('-created_date')
  });

  const { data: allAccessLevels = [] } = useQuery({
    queryKey: ['all-access-levels-reg'],
    queryFn: () => base44.asServiceRole.entities.UserAccessLevel.list('-created_date')
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers-reg'],
    queryFn: () => base44.asServiceRole.entities.User.list('-created_date')
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['registrationSubmissions'],
    queryFn: () => base44.entities.RegistrationSubmission.list('-created_date')
  });

  const syncProfileMutation = useMutation({
    mutationFn: (enrollmentId) => base44.functions.invoke('syncJotformToProfile', { enrollment_id: enrollmentId }),
    onSuccess: () => toast.success('Profile synced from JotForm data'),
    onError: () => toast.error('Sync failed')
  });

  const syncAllMutation = useMutation({
    mutationFn: async () => {
      const incubateherEnrollments = enrollments.filter(e => e.cohort_id && e.role === 'participant');
      if (incubateherEnrollments.length === 0) return { synced: 0 };
      const cohortId = incubateherEnrollments[0].cohort_id;
      return base44.functions.invoke('syncJotformToProfile', { sync_all: true, cohort_id: cohortId });
    },
    onSuccess: (res) => toast.success(`Synced ${res?.data?.synced || 0} profiles`),
    onError: () => toast.error('Bulk sync failed')
  });

  const getAccessForEmail = (email) => allAccessLevels.find(a => a.user_email === email);
  const getUserForEmail = (email) => users.find(u => u.email === email);

  // Filter
  const filteredEnrollments = enrollments.filter(e =>
    !searchTerm ||
    e.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.participant_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAccess = allAccessLevels.filter(a =>
    !searchTerm ||
    a.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(s =>
    !searchTerm ||
    s.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const tosSignedCount = allAccessLevels.filter(a => a.legal_acknowledged).length;
  const tosPendingCount = allAccessLevels.filter(a => !a.legal_acknowledged).length;
  const participantCount = enrollments.filter(e => e.role === 'participant').length;
  const activeEnrollments = enrollments.filter(e => e.enrollment_status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Registration Management</h1>
          <p className="text-slate-500 text-sm">Program enrollments, site registrations, legal acknowledgements, and JotForm data sync</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Enrolled', value: enrollments.length, color: 'text-[#143A50]', icon: Users },
            { label: 'Active Participants', value: activeEnrollments, color: 'text-emerald-700', icon: CheckCircle2 },
            { label: 'Platform Users', value: users.length, color: 'text-blue-700', icon: Users },
            { label: 'ToS Signed', value: tosSignedCount, color: 'text-emerald-700', icon: Shield },
            { label: 'ToS Pending', value: tosPendingCount, color: 'text-amber-600', icon: AlertCircle },
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

        {/* Bulk Sync Banner */}
        <div className="mb-6 p-4 bg-[#143A50] text-white rounded-2xl flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">Sync JotForm Data → Organization Profiles</p>
            <p className="text-white/70 text-xs mt-0.5">
              JotForm registration data (org type, budget, goals, experience) hasn't been synced to Organization profiles yet for all participants.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#E5C089] text-[#143A50] font-semibold hover:bg-[#d4af76] shrink-0"
            onClick={() => syncAllMutation.mutate()}
            disabled={syncAllMutation.isPending}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncAllMutation.isPending ? 'animate-spin' : ''}`} />
            {syncAllMutation.isPending ? 'Syncing...' : 'Sync All Profiles'}
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="enrollments">Program Enrollments ({filteredEnrollments.length})</TabsTrigger>
            <TabsTrigger value="legal">Legal / ToS ({filteredAccess.length})</TabsTrigger>
            <TabsTrigger value="submissions">Form Submissions ({filteredSubmissions.length})</TabsTrigger>
          </TabsList>

          {/* Enrollments */}
          <TabsContent value="enrollments">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                {enrollmentsLoading ? (
                  <div className="py-12 text-center text-slate-500">Loading...</div>
                ) : filteredEnrollments.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">No enrollments found</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredEnrollments.map(enrollment => {
                      const access = getAccessForEmail(enrollment.participant_email);
                      const isExpanded = expandedRow === enrollment.id;
                      const jd = enrollment.jotform_data || {};
                      const hasJotformData = Object.keys(jd).length > 0;

                      return (
                        <div key={enrollment.id}>
                          <div
                            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer"
                            onClick={() => setExpandedRow(isExpanded ? null : enrollment.id)}
                          >
                            <div className="w-9 h-9 rounded-full bg-[#143A50] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {enrollment.participant_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 text-sm">{enrollment.participant_name}</p>
                              <p className="text-xs text-slate-500">{enrollment.participant_email}</p>
                              {enrollment.organization_name && (
                                <p className="text-xs text-[#143A50]">{enrollment.organization_name}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge className={enrollment.enrollment_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}>
                                {enrollment.enrollment_status || 'active'}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">{enrollment.role}</Badge>
                              {access?.legal_acknowledged
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" title="ToS Signed" />
                                : <AlertCircle className="w-4 h-4 text-amber-400" title="ToS Pending" />
                              }
                              {hasJotformData && <Badge className="bg-[#E5C089]/30 text-[#7a5c1e] text-xs">JotForm ✓</Badge>}
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-6 pb-5 bg-slate-50 border-t border-slate-100 space-y-4">
                              {/* Progress */}
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 pt-3">
                                {[
                                  { label: 'Pre-Assessment', done: enrollment.pre_assessment_completed },
                                  { label: 'Post-Assessment', done: enrollment.post_assessment_completed },
                                  { label: 'Consultation', done: enrollment.consultation_completed },
                                  { label: 'Documents', done: enrollment.documents_uploaded },
                                  { label: 'Attendance', done: enrollment.attendance_complete },
                                  { label: 'Completed', done: enrollment.program_completed },
                                ].map(({ label, done }) => (
                                  <div key={label} className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg border border-slate-200">
                                    {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-slate-300" />}
                                    <span className="text-xs text-slate-600 text-center leading-tight">{label}</span>
                                  </div>
                                ))}
                              </div>

                              {/* JotForm Data */}
                              {hasJotformData && (
                                <div className="bg-white border border-slate-200 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">JotForm Registration Data</p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs gap-1"
                                      onClick={(e) => { e.stopPropagation(); syncProfileMutation.mutate(enrollment.id); }}
                                      disabled={syncProfileMutation.isPending}
                                    >
                                      <RefreshCw className="w-3 h-3" /> Sync to Profile
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(jd).filter(([, v]) => v).map(([key, val]) => (
                                      <div key={key} className="p-2 bg-slate-50 rounded">
                                        <p className="text-xs text-slate-400 capitalize">{key.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-slate-800 font-medium">{String(val)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Legal Status */}
                              <div className={`p-3 rounded-lg border text-sm ${access?.legal_acknowledged ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                {access?.legal_acknowledged ? (
                                  <span className="text-emerald-800">
                                    <strong>✓ ToS Accepted</strong>
                                    {access.legal_acknowledged_date && ` — ${new Date(access.legal_acknowledged_date).toLocaleDateString()}`}
                                  </span>
                                ) : (
                                  <span className="text-amber-800">⚠ Terms of Service not yet accepted</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal / ToS */}
          <TabsContent value="legal">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Terms of Service & Legal Acknowledgements</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {filteredAccess.map(access => {
                    const user = getUserForEmail(access.user_email);
                    return (
                      <div key={access.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold flex-shrink-0">
                          {access.user_email?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{user?.full_name || access.user_email}</p>
                          <p className="text-xs text-slate-500">{access.user_email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-xs capitalize">{access.entry_point || 'platform'}</Badge>
                          {access.legal_acknowledged ? (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs text-emerald-700 font-medium">
                                {access.legal_acknowledged_date
                                  ? new Date(access.legal_acknowledged_date).toLocaleDateString()
                                  : 'Signed'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-400" />
                              <span className="text-xs text-amber-700">Pending</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredAccess.length === 0 && (
                    <div className="py-12 text-center text-slate-500 text-sm">No records found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Submissions */}
          <TabsContent value="submissions">
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Entry</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Payment</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Survey</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Files</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSubmissions.map(sub => (
                        <React.Fragment key={sub.id}>
                          <tr
                            className="hover:bg-slate-50 cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === sub.id ? null : sub.id)}
                          >
                            <td className="px-4 py-3">{sub.user_name || '—'}</td>
                            <td className="px-4 py-3 text-slate-600">{sub.user_email}</td>
                            <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{sub.entry_point || '—'}</Badge></td>
                            <td className="px-4 py-3">
                              <Badge className={sub.payment_status === 'paid' ? 'bg-green-100 text-green-800' : sub.payment_status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}>
                                {sub.payment_status || 'n/a'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {sub.survey_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-slate-300" />}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{new Date(sub.created_date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {(sub.attachments || []).length} file(s)
                              {expandedRow === sub.id ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />}
                            </td>
                          </tr>
                          {expandedRow === sub.id && (
                            <tr className="bg-slate-50">
                              <td colSpan={7} className="px-6 py-4">
                                <RegistrationAttachments
                                  submission={sub}
                                  onUpdated={() => queryClient.invalidateQueries(['registrationSubmissions'])}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {filteredSubmissions.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No submissions found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}