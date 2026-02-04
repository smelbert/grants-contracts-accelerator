import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, DollarSign, MessageSquare, HelpCircle, Shield, 
  Star, FileText, Settings, TrendingUp, ArrowRight 
} from 'lucide-react';

export default function PlatformManagement() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
    enabled: user?.role === 'admin'
  });

  const { data: supportTickets = [] } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => base44.entities.SupportTicket.list(),
    enabled: user?.role === 'admin'
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => base44.entities.Testimonial.list(),
    enabled: user?.role === 'admin'
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => base44.entities.FAQItem.list(),
    enabled: user?.role === 'admin'
  });

  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
            <p className="text-slate-600">This page is only available to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const openTickets = supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const pendingTestimonials = testimonials.filter(t => !t.admin_approved && t.approved_for_website).length;
  const publishedFaqs = faqs.filter(f => f.is_published).length;

  const managementSections = [
    {
      title: 'Analytics & Insights',
      description: 'Monitor platform performance and user engagement',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-600',
      cards: [
        {
          title: 'SaaS Dashboard',
          description: 'Revenue, subscribers, and growth metrics',
          link: 'SaaSAdminDashboard',
          icon: TrendingUp,
          badge: `${activeSubscriptions} active`
        },
        {
          title: 'Audit Logs',
          description: 'Track all system activities and changes',
          link: 'AuditLogs',
          icon: Shield
        }
      ]
    },
    {
      title: 'User Management',
      description: 'Manage subscribers and their experiences',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      cards: [
        {
          title: 'Subscription Plans',
          description: 'Manage pricing and subscription tiers',
          link: 'SubscriptionPlans',
          icon: DollarSign
        },
        {
          title: 'Member Management',
          description: 'View and manage all platform users',
          link: 'MemberManagement',
          icon: Users,
          badge: `${subscriptions.length} users`
        }
      ]
    },
    {
      title: 'Customer Support',
      description: 'Handle user inquiries and feedback',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-600',
      cards: [
        {
          title: 'Support Tickets',
          description: 'Manage customer support requests',
          link: 'SupportTickets',
          icon: MessageSquare,
          badge: openTickets > 0 ? `${openTickets} open` : null,
          badgeVariant: openTickets > 0 ? 'destructive' : 'default'
        },
        {
          title: 'Testimonials',
          description: 'Review and approve user testimonials',
          link: 'TestimonialManagement',
          icon: Star,
          badge: pendingTestimonials > 0 ? `${pendingTestimonials} pending` : null,
          badgeVariant: 'default'
        },
        {
          title: 'FAQ Management',
          description: 'Create and organize help articles',
          link: 'FAQManagement',
          icon: HelpCircle,
          badge: `${publishedFaqs} published`
        }
      ]
    },
    {
      title: 'Platform Configuration',
      description: 'Configure platform settings and features',
      icon: Settings,
      color: 'bg-orange-100 text-orange-600',
      cards: [
        {
          title: 'Platform Settings',
          description: 'General platform configuration',
          link: 'PlatformSettings',
          icon: Settings
        },
        {
          title: 'Branding & Theme',
          description: 'Customize platform appearance',
          link: 'BrandingSettings',
          icon: Settings
        },
        {
          title: 'Ethics & Compliance',
          description: 'Platform policies and guidelines',
          link: 'EthicsCompliance',
          icon: Shield
        }
      ]
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Platform Management</h1>
        <p className="text-slate-600 mt-2">Centralized control for all platform operations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTestimonials}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Published FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{publishedFaqs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="space-y-12">
        {managementSections.map((section, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                <section.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                <p className="text-sm text-slate-600">{section.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {section.cards.map((card, cardIdx) => (
                <Card key={cardIdx} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link to={createPageUrl(card.link)}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <card.icon className="w-5 h-5 text-slate-600" />
                        </div>
                        {card.badge && (
                          <Badge variant={card.badgeVariant || 'outline'}>
                            {card.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      <CardDescription className="text-sm">{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-[#143A50] font-medium group-hover:gap-2 transition-all">
                        Manage <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}