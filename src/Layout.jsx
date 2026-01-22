import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Shield
} from 'lucide-react';

const getNavItems = (userRole) => {
  const baseItems = [
    { name: 'Dashboard', page: 'Home', icon: LayoutDashboard, roles: ['user', 'coach', 'owner', 'admin', 'staff', 'board'] },
    { name: 'Opportunities', page: 'Opportunities', icon: Search, roles: ['user', 'coach', 'owner', 'admin', 'staff'] },
    { name: 'Documents', page: 'Documents', icon: FileText, roles: ['user', 'coach', 'owner', 'admin', 'staff'] },
    { name: 'AI Writer', page: 'BoilerplateBuilder', icon: Sparkles, roles: ['user', 'coach', 'owner', 'admin', 'staff'] },
    { name: 'Templates', page: 'Templates', icon: BookOpen, roles: ['user', 'coach', 'owner', 'admin', 'staff'] },
    { name: 'Learning', page: 'Learning', icon: BookOpen, roles: ['user', 'coach', 'owner', 'admin', 'staff', 'board'] },
    { name: 'Community', page: 'Community', icon: Users, roles: ['user', 'coach', 'owner', 'admin', 'staff'] },
    { name: 'Profile', page: 'Profile', icon: Building2, roles: ['user', 'coach', 'owner', 'admin', 'staff', 'board'] },
  ];

  const coachItems = [
    { name: 'Coach Dashboard', page: 'CoachDashboard', icon: Users, roles: ['coach', 'owner', 'admin'] },
  ];

  const adminItems = [
    { name: 'Admin Dashboard', page: 'AdminDashboard', icon: Shield, roles: ['owner', 'admin'] },
  ];

  const settingsItem = { name: 'Settings', page: 'Settings', icon: SettingsIcon, roles: ['user', 'coach', 'owner', 'admin', 'staff', 'board'] };

  const role = userRole || 'user';
  const allItems = [...baseItems, ...coachItems, ...adminItems, settingsItem];
  
  return allItems.filter(item => item.roles.includes(role));
};

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Skip layout for onboarding and coach setup
  if ((currentPageName === 'Home' || currentPageName === 'CoachProfileSetup') && !user) {
    return children;
  }

  const navItems = getNavItems(user?.role);

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

          {/* Role Badge */}
          {user?.role && user.role !== 'user' && (
            <div className="mb-4">
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-1 flex-col mt-6">
            <ul className="flex flex-1 flex-col gap-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <li key={item.name}>
                    <Link
                      to={createPageUrl(item.page)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      {item.name}
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto text-emerald-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
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

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">GC Accelerator</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </header>

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
              <nav className="p-4">
                {user?.role && user.role !== 'user' && (
                  <div className="mb-4 px-3">
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                )}
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = currentPageName === item.page;
                    return (
                      <li key={item.name}>
                        <Link
                          to={createPageUrl(item.page)}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
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
    </div>
  );
}