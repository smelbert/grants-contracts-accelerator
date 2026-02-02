import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
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
  Badge as BadgeIcon,
  Video,
  AlertTriangle,
  DollarSign,
  Bell,
  HelpCircle,
  Calculator,
  Plus,
  User,
  Mail,
  Calendar,
  MessageSquare,
  MessageCircle
} from 'lucide-react';

// User Portal Navigation with Groups
const getUserPortalNav = () => [
  {
    groupName: 'Overview',
    items: [
      { name: 'Dashboard', page: 'Home', icon: LayoutDashboard, dataTour: 'dashboard' },
      { name: 'Grant Dashboard', page: 'GrantDashboard', icon: DollarSign },
    ]
  },
  {
    groupName: 'Funding',
    items: [
      { name: 'Opportunities', page: 'Opportunities', icon: Search, dataTour: 'opportunities' },
      { name: 'AI Funding Matcher', page: 'AIFundingMatcher', icon: Sparkles },
      { name: 'Application Tracker', page: 'ApplicationTracker', icon: CheckCircle2, dataTour: 'workflows' },
    ]
  },
  {
    groupName: 'Workspace',
    items: [
      { name: 'Projects', page: 'Projects', icon: FileText },
      { name: 'Documents', page: 'Documents', icon: FileText },
      { name: 'Templates', page: 'Templates', icon: BookOpen, dataTour: 'templates' },
      { name: 'AI Drafting Tools', page: 'BoilerplateBuilder', icon: Sparkles },
      { name: 'Budget Builder', page: 'BudgetBuilder', icon: Calculator },
    ]
  },
  {
    groupName: 'Workflows',
    items: [
      { name: 'Proposal Workflows', page: 'ProposalWorkflows', icon: CheckCircle2 },
      { name: 'Team Collaboration', page: 'TeamCollaboration', icon: Users },
      { name: 'Readiness Assessment', page: 'GrantReadinessAssessment', icon: BadgeIcon },
      { name: 'Readiness Checklists', page: 'ReadinessChecklists', icon: CheckCircle2 },
    ]
  },
  {
    groupName: 'Learning',
    items: [
      { name: 'Learning Hub', page: 'Learning', icon: BookOpen, dataTour: 'learning' },
      { name: 'Events', page: 'Events', icon: Calendar },
      { name: 'Live Streams', page: 'LiveStreams', icon: Video },
    ]
  },
  {
    groupName: 'Community',
    items: [
      { name: 'Discussions', page: 'Discussions', icon: MessageSquare },
      { name: 'Chat', page: 'Chat', icon: MessageCircle },
      { name: 'Community Groups', page: 'Community', icon: Users },
    ]
  },
  {
    groupName: 'Tools',
    items: [
      { name: 'Email Hub', page: 'EmailHub', icon: Mail },
      { name: 'Website Builder', page: 'WebsiteBuilder', icon: LayoutDashboard },
    ]
  },
  {
    groupName: 'Settings',
    items: [
      { name: 'My Organization', page: 'Profile', icon: Building2 },
      { name: 'Organization Settings', page: 'OrganizationSettings', icon: SettingsIcon },
      { name: 'Readiness Status', page: 'ReadinessStatus', icon: BadgeIcon },
      { name: 'Developer Tools', page: 'DeveloperTools', icon: Shield },
      { name: 'Settings', page: 'Settings', icon: SettingsIcon },
    ]
  },
];

// Coach Portal Navigation
const getCoachPortalNav = () => [
  { name: 'Coach Dashboard', page: 'CoachDashboard', icon: LayoutDashboard },
  { name: 'My Profile', page: 'CoachProfile', icon: User },
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
  { name: 'Admin Dashboard', page: 'AdminDashboard', icon: Shield },
  { name: 'Community Spaces', page: 'SpaceManagement', icon: LayoutDashboard },
  { name: 'Organizations', page: 'OrganizationsOverview', icon: Building2 },
  { name: 'Grant Submission', page: 'GrantSubmission', icon: Plus },
  { name: 'Readiness Logic', page: 'ReadinessLogic', icon: SettingsIcon },
  { name: 'Template Library', page: 'TemplateLibrary', icon: BookOpen },
  { name: 'AI Content Management', page: 'AIContentManagement', icon: Sparkles },
  { name: 'AI Guardrails', page: 'AIGuardrails', icon: Sparkles },
  { name: 'Coaches & Staff', page: 'CoachesStaff', icon: Users },
  { name: 'Profile Manager', page: 'CoachProfileManager', icon: Users },
  { name: 'Pricing & Monetization', page: 'Pricing', icon: DollarSign },
  { name: 'Ethics & Compliance', page: 'EthicsCompliance', icon: Shield },
  { name: 'Platform Settings', page: 'PlatformSettings', icon: SettingsIcon },
];

const getNavItems = (portalView) => {
  // Coach and Admin portals return flat arrays, User portal returns grouped arrays
  if (portalView === 'coach') {
    const items = getCoachPortalNav();
    return [{ groupName: 'Menu', items }];
  }
  if (portalView === 'admin') {
    const items = getAdminPortalNav();
    return [{ groupName: 'Menu', items }];
  }
  return getUserPortalNav();
};

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalView, setPortalView] = useState(() => {
    return localStorage.getItem('portalView') || 'auto';
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handlePortalChange = (view) => {
    setPortalView(view);
    localStorage.setItem('portalView', view);
  };

  const effectiveRole = portalView === 'auto' ? user?.role : portalView;
  const navItems = getNavItems(effectiveRole);

  // Show onboarding flow for all users
  const showOnboardingFlow = user && currentPageName !== 'CoachProfileSetup';

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Portal color schemes
  const portalColors = {
    user: { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-600', accentHover: 'hover:bg-emerald-700' },
    coach: { bg: 'bg-green-50', border: 'border-green-200', accent: 'bg-green-600', accentHover: 'hover:bg-green-700' },
    admin: { bg: 'bg-red-50', border: 'border-red-200', accent: 'bg-red-600', accentHover: 'hover:bg-red-700' }
  };

  const currentPortalColors = portalColors[effectiveRole] || portalColors.user;

  // Skip layout for onboarding and coach setup
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
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm leading-tight">Grants + Contracts</p>
              <p className="text-xs text-slate-500">Accelerator</p>
            </div>
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
                                ? `${currentPortalColors.bg} ${currentPortalColors.border.replace('border-', 'text-')}`
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <item.icon className={`w-4 h-4 ${isActive ? currentPortalColors.accent.replace('bg-', 'text-') : 'text-slate-400 group-hover:text-slate-600'}`} />
                            <span className="truncate">{item.name}</span>
                            {isActive && (
                              <ChevronRight className={`w-3 h-3 ml-auto flex-shrink-0 ${currentPortalColors.accent.replace('bg-', 'text-').replace('600', '400')}`} />
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">GC Accelerator</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>
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
                                    ? `${currentPortalColors.bg} ${currentPortalColors.border.replace('border-', 'text-')}`
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <item.icon className={`w-4 h-4 ${isActive ? currentPortalColors.accent.replace('bg-', 'text-') : 'text-slate-400'}`} />
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
      <main className="lg:pl-64">
        {children}
      </main>

      {/* Onboarding Flow */}
      {showOnboardingFlow && (
        <OnboardingFlow 
          userEmail={user.email} 
          userRole={effectiveRole} 
        />
      )}
    </div>
  );
}