import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Search, Shield, Edit, X, Building2, Mail, 
  Phone, Calendar, CheckCircle2, AlertCircle, FileText,
  RefreshCw, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ROLE_OPTIONS = [
  { value: 'user', label: 'User', color: 'bg-slate-100 text-slate-800' },
  { value: 'coach', label: 'Coach', color: 'bg-blue-100 text-blue-800' },
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' },
  { value: 'owner', label: 'Owner', color: 'bg-purple-100 text-purple-800' },
];

function getRoleColor(role) {
  return ROLE_OPTIONS.find(r => r.value === role)?.color || 'bg-slate-100 text-slate-800';
}

export default function MemberManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [expandedLegal, setExpandedLegal] = useState({});
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.asServiceRole.entities.User.list('-created_date')
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments-member'],
    queryFn: () => base44.asServiceRole.entities.ProgramEnrollment.filter({ role: 'participant' })
  });

  const { data: allAccessLevels = [] } = useQuery({
    queryKey: ['all-access-levels'],
    queryFn: () => base44.asServiceRole.entities.UserAccessLevel.list()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['all-organizations-member'],
    queryFn: () => base44.asServiceRole.entities.Organization.list()
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, updates }) => {
      return await base44.asServiceRole.entities.User.update(userId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      toast.success('Role updated');
    }
  });

  const syncProfileMutation = useMutation({
    mutationFn: async (enrollmentId) => {
      return await base44.functions.invoke('syncJotformToProfile', { enrollment_id: enrollmentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-organizations-member']);
      toast.success('Profile synced from registration data');
    },
    onError: () => toast.error('Sync failed')
  });

  const getEnrollmentForUser = (email) => enrollments.find(e => e.participant_email === email);
  const getAccessForUser = (email) => allAccessLevels.find(a => a.user_email === email);
  const getOrgForUser = (email) => organizations.find(o => o.primary_contact_email === email);

  const filteredUsers = users.filter(user => {
    const matchSearch = !searchQuery ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = ROLE_OPTIONS.reduce((acc, r) => {
    acc[r.value] = users.filter(u => u.role === r.value).length;
    return acc;
  }, {});

  const tosSignedCount = allAccessLevels.filter(a => a.legal_acknowledged).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-7 h-7 text-[#143A50]" />
            <h1 className="text-2xl font-bold text-slate-900">Member & Role Management</h1>
          </div>
          <p className="text-slate-500 text-sm">Manage all platform members, roles, enrollment links, and legal acceptance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {ROLE_OPTIONS.map(r => (
            <Card key={r.value} className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{roleCounts[r.value] || 0}</p>
                <Badge className={`${r.color} text-xs mt-1`}>{r.label}s</Badge>
              </CardContent>
            </Card>
          ))}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{tosSignedCount}</p>
              <p className="text-xs text-slate-500 mt-1">ToS Signed</p>
            </CardContent>
          </Card>
        </div>

        {/* Search / Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm min-w-[140px]"
          >
            <option value="all">All Roles</option>
            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {/* Members Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Members ({filteredUsers.length})</CardTitle>
            <CardDescription>Click a member to view their full profile, enrollment, and legal status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500">Loading...</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map(member => {
                  const enrollment = getEnrollmentForUser(member.email);
                  const access = getAccessForUser(member.email);
                  const org = getOrgForUser(member.email);
                  const tosOk = access?.legal_acknowledged;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition group cursor-pointer"
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#143A50] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {member.full_name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{member.full_name || 'No name'}</p>
                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                        {org?.organization_name && (
                          <p className="text-xs text-[#143A50] truncate">{org.organization_name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {enrollment && (
                          <Badge className="bg-[#AC1A5B]/10 text-[#AC1A5B] border-[#AC1A5B]/20 text-xs">
                            IncubateHer
                          </Badge>
                        )}
                        <Badge className={`${getRoleColor(member.role)} text-xs`}>
                          {member.role || 'user'}
                        </Badge>
                        {tosOk ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" title="ToS Signed" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-400" title="ToS Pending" />
                        )}
                        <Edit className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Detail Dialog */}
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Member Details</DialogTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedMember(null)}><X className="w-4 h-4" /></Button>
              </div>
            </DialogHeader>

            {selectedMember && (() => {
              const enrollment = getEnrollmentForUser(selectedMember.email);
              const access = getAccessForUser(selectedMember.email);
              const org = getOrgForUser(selectedMember.email);
              const jd = enrollment?.jotform_data || {};

              return (
                <Tabs defaultValue="profile">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                    <TabsTrigger value="legal">Legal / ToS</TabsTrigger>
                    <TabsTrigger value="role">Role</TabsTrigger>
                  </TabsList>

                  {/* Profile */}
                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-14 h-14 rounded-full bg-[#143A50] flex items-center justify-center text-white font-bold text-xl">
                        {selectedMember.full_name?.[0]?.toUpperCase() || selectedMember.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{selectedMember.full_name || 'No name'}</h3>
                        <p className="text-sm text-slate-600">{selectedMember.email}</p>
                        <Badge className={`${getRoleColor(selectedMember.role)} mt-1`}>{selectedMember.role || 'user'}</Badge>
                      </div>
                    </div>

                    {org ? (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Organization', value: org.organization_name },
                          { label: 'Type', value: org.organization_type },
                          { label: 'EIN', value: org.ein },
                          { label: 'Founded', value: org.founding_year },
                          { label: 'Annual Budget', value: org.annual_budget },
                          { label: 'Grant Experience', value: org.grant_experience_level },
                          { label: 'Service Area', value: org.geographic_service_area },
                          { label: 'People Served/yr', value: org.annual_people_served },
                        ].map(({ label, value }) => value ? (
                          <div key={label} className="p-3 bg-white border border-slate-200 rounded-lg">
                            <p className="text-xs text-slate-500 font-medium">{label}</p>
                            <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
                          </div>
                        ) : null)}
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                        No organization profile yet.
                        {enrollment && (
                          <Button
                            size="sm"
                            className="ml-3 bg-[#143A50] text-white text-xs"
                            onClick={() => syncProfileMutation.mutate(enrollment.id)}
                            disabled={syncProfileMutation.isPending}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            {syncProfileMutation.isPending ? 'Syncing...' : 'Sync from JotForm Data'}
                          </Button>
                        )}
                      </div>
                    )}

                    {org && (
                      <Link to={createPageUrl('OrganizationsOverview')}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" /> View in Organizations
                        </Button>
                      </Link>
                    )}
                  </TabsContent>

                  {/* Enrollment */}
                  <TabsContent value="enrollment" className="space-y-4 mt-4">
                    {enrollment ? (
                      <>
                        <div className="p-4 bg-[#AC1A5B]/5 border border-[#AC1A5B]/20 rounded-xl">
                          <p className="font-semibold text-[#AC1A5B] mb-3 text-sm">IncubateHer Enrollment</p>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: 'Status', value: enrollment.enrollment_status },
                              { label: 'Role', value: enrollment.role },
                              { label: 'Organization', value: enrollment.organization_name },
                              { label: 'Phone', value: enrollment.phone_number },
                            ].map(({ label, value }) => value ? (
                              <div key={label}>
                                <p className="text-xs text-slate-500">{label}</p>
                                <p className="text-sm font-medium text-slate-900 capitalize">{value}</p>
                              </div>
                            ) : null)}
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Pre-Assessment', done: enrollment.pre_assessment_completed },
                            { label: 'Post-Assessment', done: enrollment.post_assessment_completed },
                            { label: 'Consultation', done: enrollment.consultation_completed },
                            { label: 'Documents', done: enrollment.documents_uploaded },
                            { label: 'Program Complete', done: enrollment.program_completed },
                            { label: 'Giveaway Eligible', done: enrollment.giveaway_eligible },
                          ].map(({ label, done }) => (
                            <div key={label} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                              {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                              <span className="text-xs text-slate-700">{label}</span>
                            </div>
                          ))}
                        </div>

                        {/* JotForm Raw Data */}
                        {Object.keys(jd).length > 0 && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <button
                              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-sm font-semibold text-slate-700"
                              onClick={() => setExpandedLegal(p => ({ ...p, jd: !p.jd }))}
                            >
                              JotForm Registration Data
                              {expandedLegal.jd ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {expandedLegal.jd && (
                              <div className="p-4 grid grid-cols-2 gap-2">
                                {Object.entries(jd).map(([key, val]) => val ? (
                                  <div key={key} className="p-2 bg-white border border-slate-100 rounded">
                                    <p className="text-xs text-slate-400 capitalize">{key.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-slate-800 font-medium">{String(val)}</p>
                                  </div>
                                ) : null)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Sync button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-[#143A50] border-[#143A50]"
                          onClick={() => syncProfileMutation.mutate(enrollment.id)}
                          disabled={syncProfileMutation.isPending}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {syncProfileMutation.isPending ? 'Syncing...' : 'Sync JotForm → Organization Profile'}
                        </Button>
                      </>
                    ) : (
                      <div className="py-12 text-center text-slate-500">
                        <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm">Not enrolled in IncubateHer program</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Legal / ToS */}
                  <TabsContent value="legal" className="space-y-4 mt-4">
                    {access ? (
                      <>
                        <div className={`p-4 rounded-xl border-2 ${access.legal_acknowledged ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
                          <div className="flex items-start gap-3">
                            {access.legal_acknowledged
                              ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                              : <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            }
                            <div>
                              <p className={`font-semibold ${access.legal_acknowledged ? 'text-emerald-900' : 'text-amber-900'}`}>
                                {access.legal_acknowledged ? 'Terms of Service Accepted' : 'Terms of Service Not Yet Accepted'}
                              </p>
                              {access.legal_acknowledged_date && (
                                <p className="text-sm text-slate-600 mt-1">
                                  Accepted on: {new Date(access.legal_acknowledged_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Access Level', value: access.access_level },
                            { label: 'Entry Point', value: access.entry_point },
                            { label: 'Learning Hub', value: access.learning_hub_access ? 'Enabled' : 'Disabled' },
                            { label: 'Access Created', value: access.created_date ? new Date(access.created_date).toLocaleDateString() : null },
                          ].map(({ label, value }) => value ? (
                            <div key={label} className="p-3 bg-white border border-slate-200 rounded-lg">
                              <p className="text-xs text-slate-500">{label}</p>
                              <p className="text-sm font-semibold text-slate-900 capitalize">{value}</p>
                            </div>
                          ) : null)}
                        </div>
                      </>
                    ) : (
                      <div className="py-12 text-center text-slate-500">
                        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm">No legal acknowledgement record found</p>
                        <p className="text-xs text-slate-400 mt-1">This user has not yet logged in after the ToS requirement was added</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Role */}
                  <TabsContent value="role" className="space-y-4 mt-4">
                    {currentUser?.id === selectedMember.id ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 text-center">
                        You cannot change your own role
                      </div>
                    ) : (
                      <div>
                        <Label className="mb-3 block font-semibold">Platform Role</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {ROLE_OPTIONS.map(r => (
                            <button
                              key={r.value}
                              onClick={() => updateRoleMutation.mutate({ userId: selectedMember.id, updates: { role: r.value } })}
                              className={`p-3 rounded-xl border-2 transition text-left ${selectedMember.role === r.value ? 'border-[#143A50] bg-[#143A50]/5' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                              <Badge className={`${r.color} text-xs mb-1`}>{r.label}</Badge>
                              <p className="text-xs text-slate-600">
                                {r.value === 'user' && 'Standard participant access'}
                                {r.value === 'coach' && 'Coach portal + review queue'}
                                {r.value === 'admin' && 'Full admin portal access'}
                                {r.value === 'owner' && 'Super admin — all access'}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}