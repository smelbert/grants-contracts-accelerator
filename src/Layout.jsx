import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import AIOnboardingAssistant from '@/components/onboarding/AIOnboardingAssistant';
import IncubateHerOnboarding from '@/components/incubateher/IncubateHerOnboarding';
import NotificationBell from '@/components/notifications/NotificationBell';
import GlobalActivityTracker from '@/components/activity/GlobalActivityTracker';
import SubmitTestimonialForm from '@/components/testimonials/SubmitTestimonialForm';
import LegalAcknowledgement from '@/components/legal/LegalAcknowledgement';
import IncubateHerProgramGate from '@/components/incubateher/IncubateHerProgramGate';
import { 
  LayoutDashboard, 
  Search, 
  Sparkles, 
  BookOpen, 
  Users, 
  Building2,
  FileText,
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Shield,
  CheckCircle2,
  Star,
  Badge as BadgeIcon,
  Video,
  AlertTriangle,
  DollarSign,
  Bell,
  Gift,
  HelpCircle,
  Calculator,
  Plus,
  User,
  Mail,
  Calendar,
  MessageSquare,
  MessageCircle,
  Palette,
  Target,
  TrendingUp,
  Settings,
  Flag,
  Download
} from 'lucide-react';

// Public pages that skip the authenticated layout entirely
const PUBLIC_PAGES = ['PublicHome', 'AboutEIS', 'IncubateHerPublic', 'Blog', 'BlogPost', 'TermsOfService', 'Register', 'Landing', 'Pricing'];

// User Portal Navigation with Groups
const getUserPortalNav = () => [
  {
    groupName: 'Overview',
    items: [
      { name: 'Dashboard', page: 'Home', icon: LayoutDashboard, dataTour: 'dashboard' },
    ]
  },
  {
    groupName: 'Workspace',
    items: [
      { name: 'Funding Readiness', page: 'FundingReadinessAssessment', icon: CheckCircle2 },
      { name: 'AI Document Review', page: 'AIDocumentReview', icon: Sparkles },
      { name: 'Projects', page: 'Projects', icon: FileText },
      { name: 'Documents', page: 'Documents', icon: FileText },
      { name: 'Funding Opportunities', page: 'Opportunities', icon: TrendingUp },
    ]
  },
  {
    groupName: 'Premium Services',
    items: [
      { name: 'Boutique Services', page: 'BoutiqueServices', icon: Sparkles, hideForIncubateHer: true },
    ]
  },
  {
    groupName: 'Learning',
    items: [
      { name: 'Learning Hub', page: 'Learning', icon: BookOpen, dataTour: 'learning', requiresAccess: 'learning_hub', hideForIncubateHer: true },
      { name: 'Resource Library', page: 'ResourceLibrary', icon: FileText, hideForIncubateHer: true },
    ]
  },
  {
    groupName: 'IncubateHer Program',
    items: [
      { name: 'Program Overview', page: 'IncubateHerOverview', icon: Target },
      { name: 'My Profile', page: 'IncubateHerProfileIntake', icon: User },
      { name: 'Learning Hub', page: 'IncubateHerLearning', icon: BookOpen },
      { name: 'Document Templates', page: 'IncubateHerDocuments', icon: FileText },
      { name: 'Workbook', page: 'IncubateHerWorkbook', icon: BookOpen },
      { name: 'Assessments & Evaluations', page: 'IncubateHerAssessments', icon: CheckCircle2 },
      { name: 'Consultations', page: 'IncubateHerConsultations', icon: MessageSquare },
      { name: 'Completion Tracker', page: 'IncubateHerCompletion', icon: TrendingUp },
      // Giveaway hidden until March 5, 2026 (Thursday)
      ...(new Date() >= new Date('2026-03-05T00:00:00') ? [{ name: 'Giveaway', page: 'IncubateHerGiveaway', icon: Sparkles }] : []),
      { name: 'My Attendance', page: 'IncubateHerAttendance', icon: Calendar, hideForIncubateHer: true },
    ]
  },
  {
    groupName: 'Community',
    items: [
      { name: 'Community Spaces', page: 'Community', icon: Users },
      { name: 'Calendar', page: 'ProgramCalendar', icon: Calendar },
      { name: 'Program Messaging', page: 'ProgramMessaging', icon: MessageCircle },
      { name: 'My Mentorship', page: 'MyMentorship', icon: Target, hideForIncubateHer: true },
    ]
  },
  {
    groupName: 'Resources',
    items: [
      { name: 'Blog', page: 'Blog', icon: BookOpen },
    ]
  },
  {
    groupName: 'Settings',
    items: [
      { name: 'My Profile', page: 'MyProfile', icon: User },
      { name: 'My Organization', page: 'Profile', icon: Building2 },
      { name: 'Settings', page: 'Settings', icon: SettingsIcon },
    ]
  },
];

// Coach Portal Navigation
const getCoachPortalNav = () => [
  { name: 'Coach Dashboard', page: 'CoachDashboard', icon: LayoutDashboard },
  { name: 'My Profile', page: 'CoachProfile', icon: User },
  { name: 'Training Framework', page: 'TrainingFramework', icon: BookOpen },
  { name: 'Pre-Assessment', page: 'TrainingPreAssessment', icon: FileText },
  { name: 'Post-Assessment', page: 'TrainingPostAssessment', icon: FileText },
  { name: 'Mentor Dashboard', page: 'MentorDashboard', icon: Target },
  { name: 'Assigned Organizations', page: 'AssignedOrganizations', icon: Building2 },
  { name: 'Review Queue', page: 'ReviewQueue', icon: FileText },
  { name: 'Video Feedback', page: 'VideoFeedback', icon: Video },
  { name: 'Grant Submission', page: 'GrantSubmission', icon: Plus },
  { name: 'Teaching & Content', page: 'TeachingContent', icon: BookOpen },
  { name: 'Flags & Notes', page: 'FlagsNotes', icon: AlertTriangle },
  { name: 'Settings', page: 'Settings', icon: SettingsIcon },
];

// Admin Portal Navigation
const getAdminPortalNav = () => [
  {
    groupName: 'Overview',
    items: [
      { name: 'Admin Dashboard', page: 'AdminDashboard', icon: Shield },
    ]
  },
  {
    groupName: 'Community & Engagement',
    items: [
      { name: 'Community Spaces', page: 'SpaceManagement', icon: LayoutDashboard },
      { name: 'Live Rooms', page: 'LiveRoomManagement', icon: Video },
      { name: 'Event Management', page: 'EventManagement', icon: Calendar },
      { name: 'Member & Role Management', page: 'MemberManagement', icon: Users },
      { name: 'Registration Management', page: 'RegistrationManagement', icon: Users },
      { name: 'Community Spaces Manager', page: 'CommunityAdmin', icon: MessageCircle },
      { name: 'Community Moderation', page: 'CommunityModerationDashboard', icon: AlertTriangle },
    ]
  },
  {
    groupName: 'Organizations & Content',
    items: [
      { name: 'Organizations', page: 'OrganizationsOverview', icon: Building2 },
      { name: 'Template Library', page: 'TemplateLibrary', icon: BookOpen },
      { name: 'Grant Submission', page: 'GrantSubmission', icon: Plus },
      { name: 'Readiness Logic', page: 'ReadinessLogic', icon: SettingsIcon },
    ]
  },
  {
    groupName: 'AI & Automation',
    items: [
      { name: 'AI Content Management', page: 'AIContentManagement', icon: Sparkles },
      { name: 'AI Guardrails', page: 'AIGuardrails', icon: Sparkles },
      { name: 'Workflows & Automation', page: 'WorkflowsAutomation', icon: SettingsIcon },
    ]
  },
  {
    groupName: 'Team & Staff',
    items: [
      { name: 'Coaches & Staff', page: 'CoachesStaff', icon: Users },
      { name: 'Profile Manager', page: 'CoachProfileManager', icon: Users },
      { name: 'Mentor Management', page: 'MentorManagement', icon: Users },
    ]
  },
  {
    groupName: 'Training System',
    items: [
      { name: 'Training Framework', page: 'TrainingFramework', icon: BookOpen },
      { name: 'Content Editor', page: 'TrainingFrameworkEditor', icon: FileText },
      { name: 'Live Sessions', page: 'LiveSessionManagement', icon: Video },
      { name: 'Assessment Management', page: 'AssessmentManagement', icon: FileText },
      { name: 'Promotion Gates', page: 'PromotionGateConfig', icon: Target },
    ]
  },
  {
    groupName: 'Boutique Services',
    items: [
      { name: 'RFP Rapid Response', page: 'RFPRapidResponse', icon: Sparkles },
      { name: 'Grant Readiness Intensive', page: 'GrantReadinessIntensive', icon: Target },
      { name: 'Strategy Reset', page: 'StrategyReset', icon: TrendingUp },
    ]
  },
  {
    groupName: 'IncubateHer Program',
    items: [
      { name: 'Program Dashboard', page: 'IncubateHerAdmin', icon: Target },
      { name: 'Participants', page: 'IncubateHerParticipants', icon: Users },
      { name: 'Program Control', page: 'IncubateHerProgramControl', icon: Settings },
      { name: 'Participant Workbooks', page: 'IncubateHerParticipantWorkbooks', icon: BookOpen },
      { name: 'Document Templates', page: 'IncubateHerDocuments', icon: FileText },
      { name: 'Template Editor', page: 'DocumentTemplateEditor', icon: FileText },
      { name: 'Learning Content Editor', page: 'LearningContentManagement', icon: FileText },
      { name: 'Workbook Content Editor', page: 'IncubateHerWorkbookEditor', icon: FileText },
      { name: 'Email Templates', page: 'IncubateHerEmailTemplates', icon: Mail },
      { name: 'Program Announcements', page: 'ProgramAnnouncements', icon: Bell },
      { name: 'Program Messaging', page: 'ProgramMessaging', icon: MessageCircle },
      { name: 'Attendance Tracking', page: 'IncubateHerAttendance', icon: Calendar },
      { name: 'CUL Dashboard', page: 'IncubateHerCULDashboard', icon: TrendingUp },
      { name: 'CUL Report Builder', page: 'IncubateHerReport', icon: FileText },
      { name: 'Giveaway Draw', page: 'IncubateHerGiveawayDraw', icon: Gift },
      { name: 'Content Export', page: 'AdminContentExport', icon: Download },
    ]
  },
  {
    groupName: 'Analytics & Reporting',
    items: [
      { name: 'Program Analytics', page: 'ProgramAnalytics', icon: TrendingUp },
      { name: 'All Assessments & Surveys', page: 'AssessmentSurveyAdmin', icon: FileText },
    ]
  },
  {
    groupName: 'Program Setup',
    items: [
      { name: 'Program Management', page: 'ProgramManagement', icon: Settings },
      { name: 'Program Modules', page: 'ProgramModuleManager', icon: BookOpen },
      { name: 'Certificate Templates', page: 'CertificateTemplates', icon: BadgeIcon },
      { name: 'Issued Certificates', page: 'IssuedCertificates', icon: BadgeIcon },
    ]
  },
  {
    groupName: 'SaaS Management',
    items: [
      { name: 'Platform Hub', page: 'PlatformManagement', icon: LayoutDashboard },
      { name: 'SaaS Dashboard', page: 'SaaSAdminDashboard', icon: TrendingUp },
      { name: 'Opportunity Reports', page: 'OpportunityReports', icon: Flag },
      { name: 'Blog Management', page: 'BlogManagement', icon: BookOpen },
      { name: 'Support Tickets', page: 'SupportTickets', icon: MessageSquare },
      { name: 'Testimonials', page: 'TestimonialManagement', icon: Target },
      { name: 'FAQ Management', page: 'FAQManagement', icon: HelpCircle },
      { name: 'User Activity Analytics', page: 'UserActivityAnalytics', icon: TrendingUp },
      { name: 'Audit Logs', page: 'AuditLogs', icon: Shield },
    ]
  },
  {
    groupName: 'Platform Configuration',
    items: [
      { name: 'Registration Pages', page: 'RegistrationBuilder', icon: Plus },
      { name: 'Subscription Plans', page: 'SubscriptionPlans', icon: DollarSign },
      { name: 'Learning Hub Content', page: 'LearningContentManagement', icon: BookOpen },
      { name: 'Learning Hub Access', page: 'LearningHubAccess', icon: BookOpen },
      { name: 'Branding & Theme', page: 'BrandingSettings', icon: Palette },
      { name: 'Email Hub', page: 'EmailHub', icon: Mail },
      { name: 'Website Builder', page: 'WebsiteBuilder', icon: LayoutDashboard },
      { name: 'Platform Settings', page: 'PlatformSettings', icon: SettingsIcon },
      { name: 'Developer Tools', page: 'DeveloperTools', icon: Shield },
    ]
  },
];

const getNavItems = (portalView, userAccess, userRole, incubateHerEnrollment) => {
  if (portalView === 'coach') {
    const items = getCoachPortalNav();
    return [{ groupName: 'Menu', items }];
  }
  if (portalView === 'admin') {
    return getAdminPortalNav();
  }
  
  const isIncubateHerParticipant = !!incubateHerEnrollment;
  
  const userNav = getUserPortalNav();
  const filteredNav = userNav.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (item.requiresAccess === 'learning_hub' && userAccess && !userAccess.learning_hub_access) {
        return false;
      }
      if (item.requiresRole === 'admin' && userRole !== 'admin') {
        return false;
      }
      if (item.hideForIncubateHer && isIncubateHerParticipant) {
        return false;
      }
      if (userAccess?.disabled_tabs?.[item.page]) return false;
      return true;
    })
  })).filter(group => group.items.length > 0);
  
  return filteredNav;
};

// Wrapper that bypasses layout for public pages
function PublicWrapper({ children }) {
  return <>{children}</>;
}

export default function Layout({ children, currentPageName }) {
  const isPublic = PUBLIC_PAGES.includes(currentPageName);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLegalAcknowledgement, setShowLegalAcknowledgement] = useState(false);
  const [portalView, setPortalView] = useState(() => {
    return localStorage.getItem('portalView') || 'auto';
  });

  const { data: user, isLoading: userIsLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
    enabled: !isPublic,
    staleTime: 1000 * 60 * 5,
    retry: false, // Don't retry on auth failures
  });

  const { data: userAccess, refetch: refetchAccess } = useQuery({
    queryKey: ['userAccess', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        const access = await base44.entities.UserAccessLevel.filter({
          user_email: user.email
        });
        return access[0] || null; // Return null if no record exists
      } catch (error) {
        console.error('UserAccess query error:', error);
        return null; // Return null on error to allow app to continue
      }
    },
    enabled: !isPublic && !!user?.email,
    retry: 1,
  });

  const { data: incubateHerEnrollment } = useQuery({
    queryKey: ['incubateher-enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        const enrollments = await base44.entities.ProgramEnrollment.filter({
          participant_email: user.email,
          role: 'participant'
        });
        console.log(`[IncubateHer] Found ${enrollments.length} enrollments for ${user.email}`, enrollments);
        const result = enrollments.find(e => e.cohort_id) || null;
        console.log(`[IncubateHer] Selected enrollment:`, result);
        return result;
      } catch (error) {
        console.error(`[IncubateHer] Enrollment query error for ${user.email}:`, error);
        return null;
      }
    },
    enabled: !isPublic && !!user?.email,
    retry: 1
  });

  React.useEffect(() => {
    if (isPublic || !user) return;
    // Skip legal acknowledgement for IncubateHer participants—they go through IncubateHerProgramGate instead
    if (incubateHerEnrollment) {
      return;
    }
    if (userAccess === null) {
      // New user without UserAccessLevel record—show legal acknowledgement
      setShowLegalAcknowledgement(true);
    } else if (userAccess && !userAccess.legal_acknowledged) {
      // Existing user who hasn't acknowledged legal terms
      setShowLegalAcknowledgement(true);
    }
  }, [user, userAccess, isPublic, incubateHerEnrollment]);

  const handleLegalAccept = async () => {
    if (!user?.email) return;
    
    if (userAccess?.id) {
      await base44.entities.UserAccessLevel.update(userAccess.id, {
        legal_acknowledged: true,
        legal_acknowledged_date: new Date().toISOString()
      });
    } else {
      await base44.entities.UserAccessLevel.create({
        user_email: user.email,
        access_level: 'community_only',
        legal_acknowledged: true,
        legal_acknowledged_date: new Date().toISOString()
      });
    }
    
    setShowLegalAcknowledgement(false);
    refetchAccess();
  };

  const handlePortalChange = (view) => {
    setPortalView(view);
    localStorage.setItem('portalView', view);
  };

  // Render public pages without any authenticated layout
  if (isPublic) {
    return <>{children}</>;
  }

  // Show loading screen while user is being fetched (prevents white flash)
  if (userIsLoading && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#143A50] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const effectiveRole = portalView === 'auto' ? user?.role : portalView;
  const navItems = getNavItems(effectiveRole, userAccess, user?.role, incubateHerEnrollment);
  const handleLogout = () => { base44.auth.logout(); };

  const portalColors = {
    user: { bg: 'bg-[#E5C089]/10', border: 'border-[#E5C089]', accent: 'bg-[#143A50]', accentHover: 'hover:bg-[#1E4F58]', text: 'text-[#143A50]' },
    coach: { bg: 'bg-[#1E4F58]/10', border: 'border-[#1E4F58]', accent: 'bg-[#1E4F58]', accentHover: 'hover:bg-[#143A50]', text: 'text-[#1E4F58]' },
    admin: { bg: 'bg-[#AC1A5B]/10', border: 'border-[#AC1A5B]', accent: 'bg-[#AC1A5B]', accentHover: 'hover:bg-[#A65D40]', text: 'text-[#AC1A5B]' }
  };

  const currentPortalColors = portalColors[effectiveRole] || portalColors.user;

  if ((currentPageName === 'Home' || currentPageName === 'CoachProfileSetup') && !user) {
    return children;
  }

  const canSwitchPortals = user?.role === 'owner' || user?.role === 'admin' || user?.role === 'coach';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-slate-200 px-6 py-8">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
              alt="Elbert Innovative Solutions" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Portal Switcher */}
          {canSwitchPortals && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Portal View</p>
              <select
                value={portalView}
                onChange={(e) => handlePortalChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="auto">Auto ({user?.role})</option>
                {(user?.role === 'owner' || user?.role === 'admin') && (
                  <>
                    <option value="admin">Admin Portal</option>
                    <option value="coach">Coach Portal</option>
                    <option value="user">User Portal</option>
                  </>
                )}
                {user?.role === 'coach' && (
                  <>
                    <option value="coach">Coach Portal</option>
                    <option value="user">User Portal</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-1 flex-col mt-6 overflow-y-auto">
            <ul className="flex flex-1 flex-col gap-6">
              {navItems.map((group, groupIdx) => (
                <li key={groupIdx}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                    {group.groupName}
                  </p>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = currentPageName === item.page;
                      return (
                        <li key={item.name}>
                          <Link
                            to={createPageUrl(item.page)}
                            data-tour={item.dataTour}
                            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                              isActive
                                ? `${currentPortalColors.bg} ${currentPortalColors.text} border-l-4 ${currentPortalColors.border}`
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <item.icon className={`w-4 h-4 ${isActive ? currentPortalColors.text : 'text-slate-400 group-hover:text-slate-600'}`} />
                            <span className="truncate">{item.name}</span>
                            {isActive && (
                              <ChevronRight className={`w-3 h-3 ml-auto flex-shrink-0 ${currentPortalColors.text}`} />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>

          {/* User */}
          {user && (
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user.full_name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="space-y-1 mb-3">
                <a href="https://www.elbertinnovativesolutions.org/" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-[#143A50] hover:bg-[#E5C089]/20">
                    Visit EIS Website
                  </Button>
                </a>
                <Link to={createPageUrl('PublicHome')}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600">
                    Public Home
                  </Button>
                </Link>
                <Link to={createPageUrl('AboutEIS')}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600">
                    About EIS
                  </Button>
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-slate-600 hover:text-slate-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Global Top Bar - Mobile */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
              alt="EIS" 
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell userEmail={user?.email} />
            <Button variant="ghost" size="icon">
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Global Top Bar - Desktop */}
      <div className="hidden lg:block lg:pl-64 sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-end gap-4 px-6 py-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="w-5 h-5 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-slate-900/50 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 right-0 w-72 bg-white z-50 shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <span className="font-semibold text-slate-900">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="p-4 overflow-y-auto">
                {canSwitchPortals && (
                  <div className="mb-4 px-3">
                    <p className="text-xs text-slate-500 mb-2">Portal View</p>
                    <select
                      value={portalView}
                      onChange={(e) => handlePortalChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="auto">Auto ({user?.role})</option>
                      {(user?.role === 'owner' || user?.role === 'admin') && (
                        <>
                          <option value="admin">Admin Portal</option>
                          <option value="coach">Coach Portal</option>
                          <option value="user">User Portal</option>
                        </>
                      )}
                      {user?.role === 'coach' && (
                        <>
                          <option value="coach">Coach Portal</option>
                          <option value="user">User Portal</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
                <ul className="space-y-6">
                  {navItems.map((group, groupIdx) => (
                    <li key={groupIdx}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                        {group.groupName}
                      </p>
                      <ul className="space-y-1">
                        {group.items.map((item) => {
                          const isActive = currentPageName === item.page;
                          return (
                            <li key={item.name}>
                              <Link
                                to={createPageUrl(item.page)}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                                  isActive
                                    ? `${currentPortalColors.bg} ${currentPortalColors.text} border-l-4 ${currentPortalColors.border}`
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <item.icon className={`w-4 h-4 ${isActive ? currentPortalColors.text : 'text-slate-400'}`} />
                                <span className="truncate">{item.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
                {user && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="px-3 mb-4">
                      <p className="text-sm font-medium text-slate-900">{user.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-slate-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {user && <GlobalActivityTracker userEmail={user.email} />}

      <main className="lg:pl-64">
        {children}
      </main>

      {/* Footer */}
      <footer className="lg:pl-64 bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-slate-900">
                ©{new Date().getFullYear()} Elbert Innovative Solutions. All rights reserved.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Proprietary content protected by intellectual property law.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm items-center">
              <Link to={createPageUrl('TermsOfService')} className="text-slate-600 hover:text-[#143A50]">
                Terms of Service
              </Link>
              <Link to={createPageUrl('AboutEIS')} className="text-slate-600 hover:text-[#143A50]">
                About EIS
              </Link>
              <a href="https://www.elbertinnovativesolutions.org/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#143A50]">
                Visit Our Website
              </a>
              {user && (
                <SubmitTestimonialForm
                  trigger={
                    <button className="text-slate-600 hover:text-[#143A50] text-sm underline underline-offset-2">
                      Leave a Testimonial / Give Feedback
                    </button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* IncubateHer Program Gate */}
      {user && incubateHerEnrollment && (!userAccess || !userAccess?.legal_acknowledged) && (
        <IncubateHerProgramGate
          user={user}
          userAccess={userAccess}
          enrollment={incubateHerEnrollment}
          onComplete={() => refetchAccess()}
        />
      )}

      {/* Generic Legal Acknowledgement */}
      {user && !(incubateHerEnrollment && userAccess?.entry_point === 'incubateher_program') && showLegalAcknowledgement && (
        <div className="fixed inset-0 z-[9999] bg-white overflow-auto flex items-center justify-center p-4">
          <LegalAcknowledgement
            open={true}
            onAccept={handleLegalAccept}
          />
        </div>
      )}

      {/* IncubateHer Onboarding Tour */}
      {user && incubateHerEnrollment && userAccess?.entry_point === 'incubateher_program' && userAccess?.legal_acknowledged && (
        <IncubateHerOnboarding
          userEmail={user.email}
          show={true}
        />
      )}
    </div>
  );
}