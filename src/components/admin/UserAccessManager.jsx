import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { toast } from 'sonner';

// All nav tabs grouped by portal — mirrors what's in Layout.js
const PORTAL_TABS = {
  'User Portal': [
    { page: 'Home', label: 'Dashboard' },
    { page: 'FundingReadinessAssessment', label: 'Funding Readiness' },
    { page: 'AIDocumentReview', label: 'AI Document Review' },
    { page: 'Projects', label: 'Projects' },
    { page: 'Documents', label: 'Documents' },
    { page: 'Opportunities', label: 'Funding Opportunities' },
    { page: 'BoutiqueServices', label: 'Boutique Services' },
    { page: 'Learning', label: 'Learning Hub' },
    { page: 'ResourceLibrary', label: 'Resource Library' },
    { page: 'ProgramCalendar', label: 'Program Calendar' },
    { page: 'Community', label: 'Community Spaces' },
    { page: 'Events', label: 'Events' },
    { page: 'ProgramMessaging', label: 'Program Messaging' },
    { page: 'MyMentorship', label: 'My Mentorship' },
    { page: 'Blog', label: 'Blog' },
    { page: 'MyProfile', label: 'My Profile' },
    { page: 'Profile', label: 'My Organization' },
    { page: 'Settings', label: 'Settings' },
  ],
  'IncubateHer Program': [
    { page: 'IncubateHerOverview', label: 'Program Overview' },
    { page: 'IncubateHerProfileIntake', label: 'My Profile' },
    { page: 'IncubateHerLearning', label: 'Learning Hub' },
    { page: 'IncubateHerDocuments', label: 'Document Templates' },
    { page: 'IncubateHerSchedule', label: 'Schedule & Videos' },
    { page: 'IncubateHerWorkbook', label: 'Workbook' },
    { page: 'IncubateHerAssessments', label: 'Assessments & Evaluations' },
    { page: 'IncubateHerConsultations', label: 'Consultations' },
    { page: 'IncubateHerCompletion', label: 'Completion Tracker' },
    { page: 'IncubateHerGiveaway', label: 'Giveaway' },
  ],
  'Coach Portal': [
    { page: 'CoachDashboard', label: 'Coach Dashboard' },
    { page: 'CoachProfile', label: 'My Profile' },
    { page: 'TrainingFramework', label: 'Training Framework' },
    { page: 'MentorDashboard', label: 'Mentor Dashboard' },
    { page: 'AssignedOrganizations', label: 'Assigned Organizations' },
    { page: 'ReviewQueue', label: 'Review Queue' },
    { page: 'VideoFeedback', label: 'Video Feedback' },
    { page: 'TeachingContent', label: 'Teaching & Content' },
    { page: 'FlagsNotes', label: 'Flags & Notes' },
  ],
};

const accessOptions = ['community_only', 'coaching_portal', 'full_platform'];

export default function UserAccessManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: accessLevels = [] } = useQuery({
    queryKey: ['all-access-levels'],
    queryFn: () => base44.entities.UserAccessLevel.list()
  });

  const updateAccessMutation = useMutation({
    mutationFn: async ({ userEmail, data }) => {
      const existing = accessLevels.find(a => a.user_email === userEmail);
      if (existing) {
        return base44.entities.UserAccessLevel.update(existing.id, data);
      } else {
        return base44.entities.UserAccessLevel.create({ user_email: userEmail, ...data });
      }
    },
    onSuccess: (_, { userEmail }) => {
      queryClient.invalidateQueries(['all-access-levels']);
      setPendingChanges(prev => { const n = { ...prev }; delete n[userEmail]; return n; });
      toast.success('User access updated');
    }
  });

  const getUserAccess = (email) => accessLevels.find(a => a.user_email === email);

  const handleFieldChange = (email, field, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [email]: { ...prev[email], [field]: value }
    }));
  };

  const handleTabToggle = (email, page, enabled, currentAccess) => {
    const existing = { ...(currentAccess?.disabled_tabs || {}) };
    if (!enabled) {
      existing[page] = true;
    } else {
      delete existing[page];
    }
    handleFieldChange(email, 'disabled_tabs', existing);
  };

  const handleSave = (email) => {
    const changes = pendingChanges[email];
    if (!changes) return;
    updateAccessMutation.mutate({ userEmail: email, data: changes });
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" /> User Access Management
          </CardTitle>
          <CardDescription>Control what each user can see across all portals. Toggle individual tabs on/off per user.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.map(user => {
              const access = getUserAccess(user.email);
              const pending = pendingChanges[user.email] || {};
              const isExpanded = expandedUser === user.email;
              const hasPending = !!pendingChanges[user.email];

              const currentAccessLevel = pending.access_level ?? access?.access_level ?? 'community_only';
              const disabledTabs = pending.disabled_tabs ?? access?.disabled_tabs ?? {};

              return (
                <div key={user.email} className="border rounded-lg overflow-hidden">
                  {/* User Row Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedUser(isExpanded ? null : user.email)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#143A50]/10 flex items-center justify-center text-sm font-medium text-[#143A50]">
                        {(user.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.full_name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{currentAccessLevel.replace(/_/g, ' ')}</Badge>
                      {hasPending && <Badge className="text-xs bg-amber-100 text-amber-700">Unsaved</Badge>}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Panel */}
                  {isExpanded && (
                    <div className="border-t p-4 bg-slate-50 space-y-6">
                      {/* Access Level */}
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-semibold w-32">Access Level</Label>
                        <Select
                          value={currentAccessLevel}
                          onValueChange={v => handleFieldChange(user.email, 'access_level', v)}
                        >
                          <SelectTrigger className="h-8 text-sm w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {accessOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt.replace(/_/g, ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Per-Portal Tab Toggles */}
                      {Object.entries(PORTAL_TABS).map(([portalName, tabs]) => (
                        <div key={portalName}>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{portalName}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {tabs.map(({ page, label }) => {
                              const isEnabled = !disabledTabs[page];
                              return (
                                <div key={page} className="flex items-center justify-between bg-white border rounded-md px-3 py-2">
                                  <span className="text-sm text-slate-700">{label}</span>
                                  <Switch
                                    checked={isEnabled}
                                    onCheckedChange={v => handleTabToggle(user.email, page, v, { ...access, disabled_tabs: disabledTabs })}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Save */}
                      {hasPending && (
                        <Button size="sm" onClick={() => handleSave(user.email)} className="gap-1 bg-[#143A50] hover:bg-[#1E4F58]">
                          <Save className="w-3 h-3" /> Save Changes
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredUsers.length === 0 && (
              <p className="text-center text-slate-500 py-8">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}