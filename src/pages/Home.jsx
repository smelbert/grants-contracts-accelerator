import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Calendar, 
  FileText, 
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Bookmark,
  Bell,
  User,
  Target,
  Zap,
  DollarSign
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

export default function HomePage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: savedOpportunities = [] } = useQuery({
    queryKey: ['saved-opportunities', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const saved = await base44.entities.OpportunityComment.filter({
        user_email: user.email,
        is_saved: true
      });
      
      // Fetch full opportunity details
      const opportunityIds = saved.map(s => s.opportunity_id);
      if (opportunityIds.length === 0) return [];
      
      const opportunities = await base44.entities.FundingOpportunity.list('-posted_date', 100);
      return opportunities.filter(opp => opportunityIds.includes(opp.id));
    },
    enabled: !!user?.email,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['boutique-bookings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.BoutiqueServiceBooking.filter({
        user_email: user.email
      }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const { data: recentDocuments = [] } = useQuery({
    queryKey: ['recent-documents', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Document.filter({
        owner_email: user.email
      }, '-updated_date', 5);
    },
    enabled: !!user?.email,
  });

  const { data: allOpportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list('-posted_date', 50),
  });

  // Calculate upcoming deadlines
  const upcomingDeadlines = savedOpportunities
    .filter(opp => {
      const deadline = opp.deadline || opp.deadline_full;
      if (!deadline) return false;
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const thirtyDaysFromNow = addDays(now, 30);
      return isAfter(deadlineDate, now) && isBefore(deadlineDate, thirtyDaysFromNow);
    })
    .sort((a, b) => {
      const aDate = new Date(a.deadline || a.deadline_full);
      const bDate = new Date(b.deadline || b.deadline_full);
      return aDate - bDate;
    })
    .slice(0, 5);

  // Get active bookings
  const activeBookings = bookings.filter(b => 
    ['intake_pending', 'scheduled', 'in_progress'].includes(b.booking_status)
  );

  // Simple recommendations based on saved opportunities
  const recommendations = allOpportunities
    .filter(opp => !savedOpportunities.some(saved => saved.id === opp.id))
    .filter(opp => {
      if (savedOpportunities.length === 0) return true;
      // Match funding lane
      const savedLanes = [...new Set(savedOpportunities.map(s => s.funding_lane))];
      return savedLanes.includes(opp.funding_lane);
    })
    .slice(0, 4);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-slate-600 mt-1">Here's what's happening with your funding journey</p>
          </div>
          <Button className="bg-[#143A50] hover:bg-[#1E4F58]">
            <Link to={createPageUrl('Opportunities')} className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Browse Opportunities
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Saved Opportunities</p>
                  <p className="text-3xl font-bold text-slate-900">{savedOpportunities.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Upcoming Deadlines</p>
                  <p className="text-3xl font-bold text-slate-900">{upcomingDeadlines.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Services</p>
                  <p className="text-3xl font-bold text-slate-900">{activeBookings.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Recent Documents</p>
                  <p className="text-3xl font-bold text-slate-900">{recentDocuments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </div>
                <Link to={createPageUrl('Opportunities')}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              <CardDescription>Opportunities with deadlines in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((opp) => {
                    const deadline = new Date(opp.deadline || opp.deadline_full);
                    const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysUntil <= 7;

                    return (
                      <Link key={opp.id} to={createPageUrl('Opportunities')}>
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUrgent ? 'bg-red-100' : 'bg-amber-100'}`}>
                            <Calendar className={`w-5 h-5 ${isUrgent ? 'text-red-600' : 'text-amber-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 line-clamp-1">{opp.title}</p>
                            <p className="text-sm text-slate-600 line-clamp-1">{opp.funder_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={isUrgent ? "destructive" : "outline"} className="text-xs">
                                {daysUntil} {daysUntil === 1 ? 'day' : 'days'} left
                              </Badge>
                              {opp.amount_min && (
                                <span className="text-xs text-slate-500">
                                  ${opp.amount_min.toLocaleString()}+
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Boutique Services Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <CardTitle>Boutique Services</CardTitle>
                </div>
                <Link to={createPageUrl('BoutiqueServices')}>
                  <Button variant="ghost" size="sm">Browse</Button>
                </Link>
              </div>
              <CardDescription>Your active service bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-3">No active services</p>
                  <Link to={createPageUrl('BoutiqueServices')}>
                    <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58]">
                      Explore Services
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((booking) => {
                    const statusConfig = {
                      intake_pending: { icon: AlertCircle, color: 'bg-amber-100 text-amber-700', label: 'Intake Pending' },
                      scheduled: { icon: Calendar, color: 'bg-blue-100 text-blue-700', label: 'Scheduled' },
                      in_progress: { icon: Zap, color: 'bg-purple-100 text-purple-700', label: 'In Progress' }
                    };
                    const config = statusConfig[booking.booking_status] || statusConfig.intake_pending;
                    const Icon = config.icon;

                    return (
                      <div key={booking.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{booking.tier}</p>
                            <p className="text-sm text-slate-600 capitalize">{booking.service_type.replace(/_/g, ' ')}</p>
                          </div>
                          <Badge className={config.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        {booking.coach_assigned && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                            <User className="w-4 h-4" />
                            <span>Coach: {booking.coach_assigned}</span>
                          </div>
                        )}
                        {booking.scheduled_date && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(booking.scheduled_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <CardTitle>Recent Documents</CardTitle>
                </div>
                <Link to={createPageUrl('Documents')}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              <CardDescription>Your recently updated documents</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-3">No recent documents</p>
                  <Link to={createPageUrl('Documents')}>
                    <Button size="sm" variant="outline">Create Document</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentDocuments.map((doc) => (
                    <Link key={doc.id} to={createPageUrl('Documents')}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 line-clamp-1">{doc.title}</p>
                          <p className="text-xs text-slate-500">
                            Updated {format(new Date(doc.updated_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Recommended for You</CardTitle>
                  <CardDescription>Based on your saved opportunities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-3">Save opportunities to get recommendations</p>
                  <Link to={createPageUrl('Opportunities')}>
                    <Button size="sm" variant="outline">Browse Opportunities</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((opp) => (
                    <Link key={opp.id} to={createPageUrl('Opportunities')}>
                      <div className="p-3 rounded-lg hover:bg-emerald-50 transition-colors border border-emerald-100">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 line-clamp-1">{opp.title}</p>
                            <p className="text-sm text-slate-600 line-clamp-1">{opp.funder_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-emerald-50 text-emerald-700 text-xs">
                                {opp.funding_lane}
                              </Badge>
                              {opp.amount_min && (
                                <span className="text-xs font-medium text-emerald-700">
                                  ${opp.amount_min.toLocaleString()}+
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications Center */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle>Notifications & Reminders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 3).map((opp) => {
                const deadline = new Date(opp.deadline || opp.deadline_full);
                const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 7;

                return (
                  <div key={`notif-${opp.id}`} className={`flex items-start gap-3 p-3 rounded-lg border ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                    <AlertCircle className={`w-5 h-5 mt-0.5 ${isUrgent ? 'text-red-600' : 'text-amber-600'}`} />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {isUrgent ? 'Urgent:' : 'Reminder:'} {opp.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Deadline is {format(deadline, 'MMMM d, yyyy')} ({daysUntil} {daysUntil === 1 ? 'day' : 'days'} remaining)
                      </p>
                    </div>
                    <Link to={createPageUrl('Opportunities')}>
                      <Button size="sm" variant={isUrgent ? "destructive" : "outline"}>
                        View
                      </Button>
                    </Link>
                  </div>
                );
              })}

              {activeBookings.filter(b => b.booking_status === 'intake_pending').map((booking) => (
                <div key={`notif-booking-${booking.id}`} className="flex items-start gap-3 p-3 rounded-lg border bg-purple-50 border-purple-200">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Complete Your Service Intake</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {booking.tier} - {booking.service_type.replace(/_/g, ' ')} is waiting for your intake information
                    </p>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Complete
                  </Button>
                </div>
              ))}

              {upcomingDeadlines.length === 0 && activeBookings.filter(b => b.booking_status === 'intake_pending').length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">You're all caught up!</p>
                  <p className="text-xs text-slate-500 mt-1">No urgent reminders at the moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}