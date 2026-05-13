import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users, Mail, Shield, CheckCircle2, AlertCircle, Clock,
  Plus, Search, ChevronDown, ChevronUp, Sparkles, UserPlus,
  Eye, Save, RefreshCw, X, Loader2, Copy, ExternalLink, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// ─── Access Templates ────────────────────────────────────────────────────────
const ACCESS_TEMPLATES = [
  {
    id: 'community_starter',
    label: 'Community Starter',
    description: 'New business owners / entrepreneurs. Community access only to start.',
    access_level: 'community_only',
    learning_hub_access: false,
    coaching_access: false,
    entry_point: 'community',
    color: 'bg-slate-100 text-slate-700',
    disabled_tabs: {
      Learning: true,
      BoutiqueServices: true,
      MyMentorship: true,
    },
  },
  {
    id: 'entrepreneur_full',
    label: 'Entrepreneur — Full Access',
    description: 'Entrepreneurs with full platform access: workspace, learning, community.',
    access_level: 'full_platform',
    learning_hub_access: true,
    coaching_access: false,
    entry_point: 'workshop',
    color: 'bg-emerald-100 text-emerald-800',
    disabled_tabs: {},
  },
  {
    id: 'coaching_client',
    label: 'Coaching Client',
    description: 'Users enrolled in coaching services. Coaching portal + workspace.',
    access_level: 'coaching_portal',
    learning_hub_access: true,
    coaching_access: true,
    entry_point: 'coaching',
    color: 'bg-blue-100 text-blue-800',
    disabled_tabs: { MyMentorship: false },
  },
  {
    id: 'workshop_attendee',
    label: 'Workshop Attendee',
    description: 'Attended a workshop. Community + learning hub access.',
    access_level: 'community_only',
    learning_hub_access: true,
    coaching_access: false,
    entry_point: 'workshop',
    color: 'bg-purple-100 text-purple-800',
    disabled_tabs: { BoutiqueServices: true, MyMentorship: true },
  },
];

// All nav pages grouped (mirrors layout.js)
const PORTAL_TABS = {
  'Workspace': [
    { page: 'GrantReadinessDashboard', label: 'Grant Readiness Dashboard' },
    { page: 'FundingReadinessAssessment', label: 'Funding Readiness' },
    { page: 'AIDocumentReview', label: 'AI Document Review' },
    { page: 'AnalyzeOpportunities', label: 'Analyze Opportunities' },
    { page: 'GrantAssistant', label: 'Grant Assistant' },
    { page: 'Projects', label: 'Projects' },
    { page: 'Documents', label: 'Documents' },
    { page: 'DocumentAssembly', label: 'Document Assembly' },
    { page: 'Opportunities', label: 'Funding Opportunities' },
    { page: 'GrantDiscovery', label: 'Grant Discovery (AI)' },
    { page: 'ProposalReview', label: 'Proposal Review & Mock Interview' },
    { page: 'InKindTracker', label: 'In-Kind Tracker' },
  ],
  'Premium Services': [
    { page: 'BoutiqueServices', label: 'Boutique Services' },
  ],
  'Learning': [
    { page: 'Learning', label: 'Learning Hub' },
    { page: 'ResourceLibrary', label: 'Resource Library' },
    { page: 'GrantGlossary', label: 'Grant Glossary' },
  ],
  'Community': [
    { page: 'Community', label: 'Community Spaces' },
    { page: 'ProgramCalendar', label: 'Calendar' },
    { page: 'ProgramMessaging', label: 'Program Messaging' },
    { page: 'MyMentorship', label: 'My Mentorship' },
  ],
  'Resources': [
    { page: 'Blog', label: 'Blog' },
    { page: 'LocalBusinessNews', label: 'Ohio Business News' },
  ],
};

// ─── Onboarding Status Badge ─────────────────────────────────────────────────
function OnboardingStatus({ access, hasLoggedIn }) {
  const steps = [
    { label: 'Invited', done: true },
    { label: 'Logged In', done: hasLoggedIn },
    { label: 'ToS Accepted', done: access?.legal_acknowledged },
    { label: 'Profile Set', done: false }, // could be enhanced
  ];
  const completedSteps = steps.filter(s => s.done).length;
  const pct = Math.round((completedSteps / steps.length) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-1.5 bg-[#143A50] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">{completedSteps}/{steps.length}</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {steps.map(s => (
          <span key={s.label} className={`text-xs px-1.5 py-0.5 rounded-full ${s.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
            {s.done ? '✓' : '○'} {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserOnboarding() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('invite');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Invite form
  const [emails, setEmails] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('community_starter');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Access editor dialog
  const [editingUser, setEditingUser] = useState(null);
  const [pendingAccess, setPendingAccess] = useState({});
  const [isSavingAccess, setIsSavingAccess] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users-onboard'],
    queryFn: () => base44.entities.User.list('-created_date')
  });

  const { data: accessLevels = [] } = useQuery({
    queryKey: ['all-access-levels-onboard'],
    queryFn: () => base44.entities.UserAccessLevel.list()
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['userInvitations-onboard'],
    queryFn: () => base44.entities.UserInvitation.list('-created_date', 100)
  });

  const getAccess = (email) => accessLevels.find(a => a.user_email === email);
  const getInvite = (email) => invitations.find(i => i.recipient_email === email);
  // A user "has logged in" if they exist in the User entity (they get added on first login)
  const hasLoggedIn = (email) => !!users.find(u => u.email === email);

  // ── Invite ────────────────────────────────────────────────────────────────
  const handleInvite = async () => {
    const emailList = emails.split('\n').map(e => e.trim()).filter(e => e.includes('@'));
    if (!emailList.length) { toast.error('Please enter at least one valid email'); return; }
    setIsSending(true);
    try {
      const template = ACCESS_TEMPLATES.find(t => t.id === selectedTemplate);
      // 1. Send invitations
      await base44.functions.invoke('bulkInviteUsers', {
        emails: emailList,
        role: 'user',
        custom_message: customMessage || `You've been invited to the EIS platform. As a ${template.label}, you'll have access to the tools and resources to grow your business.`
      });

      // 2. Pre-create UserAccessLevel records so access is ready on first login
      for (const email of emailList) {
        const existing = getAccess(email);
        const accessData = {
          user_email: email,
          access_level: template.access_level,
          entry_point: template.entry_point,
          learning_hub_access: template.learning_hub_access,
          coaching_access: template.coaching_access,
          disabled_tabs: template.disabled_tabs || {},
        };
        if (existing) {
          await base44.entities.UserAccessLevel.update(existing.id, accessData);
        } else {
          await base44.entities.UserAccessLevel.create(accessData);
        }
      }

      queryClient.invalidateQueries(['userInvitations-onboard']);
      queryClient.invalidateQueries(['all-access-levels-onboard']);
      toast.success(`${emailList.length} invitation(s) sent with "${template.label}" access pre-configured!`);
      setEmails('');
      setCustomMessage('');
    } catch (err) {
      toast.error('Failed: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // ── Access Editor ─────────────────────────────────────────────────────────
  const openAccessEditor = (u) => {
    const access = getAccess(u.email);
    setPendingAccess({
      access_level: access?.access_level || 'community_only',
      learning_hub_access: access?.learning_hub_access || false,
      coaching_access: access?.coaching_access || false,
      disabled_tabs: access?.disabled_tabs || {},
    });
    setEditingUser(u);
  };

  const applyTemplate = (templateId) => {
    const t = ACCESS_TEMPLATES.find(x => x.id === templateId);
    if (!t) return;
    setPendingAccess({
      access_level: t.access_level,
      learning_hub_access: t.learning_hub_access,
      coaching_access: t.coaching_access,
      disabled_tabs: t.disabled_tabs || {},
    });
  };

  const toggleTab = (page, enabled) => {
    setPendingAccess(prev => {
      const tabs = { ...prev.disabled_tabs };
      if (!enabled) tabs[page] = true;
      else delete tabs[page];
      return { ...prev, disabled_tabs: tabs };
    });
  };

  const saveAccess = async () => {
    if (!editingUser) return;
    setIsSavingAccess(true);
    try {
      const existing = getAccess(editingUser.email);
      if (existing) {
        await base44.entities.UserAccessLevel.update(existing.id, pendingAccess);
      } else {
        await base44.entities.UserAccessLevel.create({ user_email: editingUser.email, ...pendingAccess });
      }
      queryClient.invalidateQueries(['all-access-levels-onboard']);
      toast.success('Access updated for ' + editingUser.full_name);
      setEditingUser(null);
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setIsSavingAccess(false);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  // Combine invited (not yet logged in) + existing users
  const invitedNotYetLogged = invitations.filter(inv =>
    inv.status !== 'expired' && !users.find(u => u.email === inv.recipient_email)
  );

  const allEntries = [
    ...users.map(u => ({ type: 'user', email: u.email, name: u.full_name, id: u.id, role: u.role, _user: u })),
    ...invitedNotYetLogged.map(inv => ({ type: 'invited', email: inv.recipient_email, name: inv.recipient_email, id: inv.id, role: 'user', _inv: inv })),
  ];

  const filtered = allEntries.filter(e => {
    const matchSearch = !search || e.email?.toLowerCase().includes(search.toLowerCase()) || e.name?.toLowerCase().includes(search.toLowerCase());
    const access = getAccess(e.email);
    if (statusFilter === 'all') return matchSearch;
    if (statusFilter === 'pending_tos') return matchSearch && !access?.legal_acknowledged;
    if (statusFilter === 'no_access') return matchSearch && !access;
    if (statusFilter === 'invited') return matchSearch && e.type === 'invited';
    return matchSearch;
  });

  const stats = {
    total: allEntries.length,
    loggedIn: users.length,
    tosAccepted: accessLevels.filter(a => a.legal_acknowledged).length,
    pendingInvites: invitedNotYetLogged.length,
    noAccess: users.filter(u => !getAccess(u.email)).length,
  };

  const template = ACCESS_TEMPLATES.find(t => t.id === selectedTemplate);
  const validEmails = emails.split('\n').map(e => e.trim()).filter(e => e.includes('@'));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Onboarding & Access Control</h1>
            <p className="text-slate-500 text-sm mt-1">Invite business owners and entrepreneurs, configure what they see, and track their onboarding progress</p>
          </div>
          <Badge className="bg-[#143A50]/10 text-[#143A50] border-[#143A50]/20 gap-1.5 px-3 py-1.5">
            <Shield className="w-3.5 h-3.5" /> Admin Only
          </Badge>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Members', value: stats.total, color: 'text-slate-900' },
            { label: 'Logged In', value: stats.loggedIn, color: 'text-emerald-700' },
            { label: 'ToS Accepted', value: stats.tosAccepted, color: 'text-emerald-700' },
            { label: 'Pending Invites', value: stats.pendingInvites, color: 'text-amber-600' },
            { label: 'No Access Set', value: stats.noAccess, color: stats.noAccess > 0 ? 'text-red-600' : 'text-emerald-700' },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="invite" className="gap-1.5"><UserPlus className="w-4 h-4" /> Invite Users</TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5"><Users className="w-4 h-4" /> Members & Access ({filtered.length})</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5"><Sparkles className="w-4 h-4" /> Access Templates</TabsTrigger>
          </TabsList>

          {/* ── INVITE TAB ── */}
          <TabsContent value="invite" className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Left: Email input */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4" /> Email Addresses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="One email per line:&#10;jane@example.com&#10;john@mybusiness.com"
                    value={emails}
                    onChange={e => setEmails(e.target.value)}
                    rows={7}
                    className="font-mono text-sm"
                  />
                  {validEmails.length > 0 && (
                    <p className="text-xs text-emerald-700 font-medium">✓ {validEmails.length} valid email(s)</p>
                  )}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Personal Message (optional)</label>
                    <Textarea
                      placeholder="Add a personal note to include in the invitation email..."
                      value={customMessage}
                      onChange={e => setCustomMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Right: Access template selector */}
              <div className="space-y-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4" /> Access Template</CardTitle>
                    <CardDescription>Choose what this user type can access when they log in</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ACCESS_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedTemplate === t.id ? 'border-[#143A50] bg-[#143A50]/5' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={`${t.color} text-xs`}>{t.label}</Badge>
                          {selectedTemplate === t.id && <CheckCircle2 className="w-4 h-4 text-[#143A50]" />}
                        </div>
                        <p className="text-xs text-slate-500">{t.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${t.learning_hub_access ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {t.learning_hub_access ? '✓' : '✗'} Learning Hub
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${t.coaching_access ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {t.coaching_access ? '✓' : '✗'} Coaching
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                            {t.access_level?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Button
                  className="w-full bg-[#143A50] hover:bg-[#1E4F58] gap-2 h-11"
                  disabled={isSending || validEmails.length === 0}
                  onClick={handleInvite}
                >
                  {isSending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><UserPlus className="w-4 h-4" /> Invite {validEmails.length > 0 ? validEmails.length : ''} {validEmails.length === 1 ? 'Person' : 'People'} as {template?.label}</>
                  }
                </Button>
                <p className="text-xs text-slate-400 text-center">Access is pre-configured automatically — they'll have the right permissions the moment they log in.</p>
              </div>
            </div>
          </TabsContent>

          {/* ── MEMBERS TAB ── */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="pl-9" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm">
                <option value="all">All Members</option>
                <option value="invited">Invited (not logged in)</option>
                <option value="pending_tos">Pending ToS</option>
                <option value="no_access">No Access Configured</option>
              </select>
            </div>

            <div className="space-y-2">
              {filtered.map(entry => {
                const access = getAccess(entry.email);
                const tosOk = access?.legal_acknowledged;
                const loggedIn = entry.type === 'user';
                return (
                  <Card key={entry.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${loggedIn ? 'bg-[#143A50]' : 'bg-slate-300'}`}>
                          {(entry.name?.[0] || entry.email?.[0] || '?').toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-900 text-sm">{entry.name !== entry.email ? entry.name : 'Invited'}</p>
                            <p className="text-xs text-slate-500">{entry.email}</p>
                            {!loggedIn && <Badge className="bg-amber-100 text-amber-700 text-xs">Never Logged In</Badge>}
                            {loggedIn && !tosOk && <Badge className="bg-red-100 text-red-700 text-xs">ToS Pending</Badge>}
                            {tosOk && <Badge className="bg-emerald-100 text-emerald-700 text-xs">ToS ✓</Badge>}
                            {access && <Badge className="bg-slate-100 text-slate-600 text-xs capitalize">{access.access_level?.replace(/_/g, ' ')}</Badge>}
                            {!access && <Badge className="bg-red-100 text-red-600 text-xs">No Access Set</Badge>}
                          </div>
                          <OnboardingStatus access={access} hasLoggedIn={loggedIn} />
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0">
                          {loggedIn && (
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => openAccessEditor(entry._user)}>
                              <Settings className="w-3.5 h-3.5" /> Edit Access
                            </Button>
                          )}
                          {!loggedIn && (
                            <Badge className="bg-amber-50 text-amber-600 text-xs">Awaiting Login</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No members found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TEMPLATES TAB ── */}
          <TabsContent value="templates">
            <div className="grid md:grid-cols-2 gap-4">
              {ACCESS_TEMPLATES.map(t => (
                <Card key={t.id} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${t.color} text-sm px-3 py-1`}>{t.label}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{t.description}</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Access Level', value: t.access_level?.replace(/_/g, ' ') },
                        { label: 'Learning Hub', value: t.learning_hub_access ? 'Enabled' : 'Disabled' },
                        { label: 'Coaching Portal', value: t.coaching_access ? 'Enabled' : 'Disabled' },
                        { label: 'Entry Point', value: t.entry_point },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-medium text-slate-900 capitalize">{value}</span>
                        </div>
                      ))}
                    </div>
                    {Object.keys(t.disabled_tabs || {}).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-1.5">Hidden Sections:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(t.disabled_tabs).map(page => (
                            <span key={page} className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded">{page}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">Access templates are applied at invite time. You can override any individual user's access from the Members tab.</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Access Editor Dialog ── */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Edit Access — {editingUser?.full_name || editingUser?.email}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Quick apply template */}
            <div>
              <p className="text-sm font-semibold mb-2">Quick Apply Template</p>
              <div className="flex flex-wrap gap-2">
                {ACCESS_TEMPLATES.map(t => (
                  <Button key={t.id} size="sm" variant="outline" onClick={() => applyTemplate(t.id)} className="text-xs gap-1">
                    <Sparkles className="w-3 h-3" /> {t.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Access Level */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-40">Access Level</label>
              <Select value={pendingAccess.access_level} onValueChange={v => setPendingAccess(p => ({ ...p, access_level: v }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community_only">Community Only</SelectItem>
                  <SelectItem value="coaching_portal">Coaching Portal</SelectItem>
                  <SelectItem value="full_platform">Full Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Feature flags */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'learning_hub_access', label: 'Learning Hub Access' },
                { key: 'coaching_access', label: 'Coaching Access' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
                  <span className="text-sm text-slate-700">{label}</span>
                  <Switch
                    checked={!!pendingAccess[key]}
                    onCheckedChange={v => setPendingAccess(p => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}
            </div>

            {/* Per-section tab toggles */}
            {Object.entries(PORTAL_TABS).map(([group, tabs]) => (
              <div key={group}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{group}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {tabs.map(({ page, label }) => {
                    const enabled = !pendingAccess.disabled_tabs?.[page];
                    return (
                      <div key={page} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}>
                        <span className={`text-sm ${enabled ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                        <Switch checked={enabled} onCheckedChange={v => toggleTab(page, v)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button className="flex-1 bg-[#143A50] hover:bg-[#1E4F58] gap-2" onClick={saveAccess} disabled={isSavingAccess}>
                {isSavingAccess ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Access</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}