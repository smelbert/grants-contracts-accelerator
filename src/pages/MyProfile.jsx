import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp,
  Calendar,
  Building2,
  Star,
  ShoppingBag,
  CreditCard,
  Download,
  Video,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Sparkles,
  Crown,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MyProfile() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserProgress.filter({
        user_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: allLearningContent = [] } = useQuery({
    queryKey: ['learning-content'],
    queryFn: () => base44.entities.LearningContent.list()
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.UserBadge.filter({
        user_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: organization } = useQuery({
    queryKey: ['user-organization', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const orgs = await base44.entities.Organization.filter({
        primary_contact_email: user.email
      });
      return orgs[0];
    },
    enabled: !!user?.email
  });

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({
        created_by: user.email
      });
      return subs[0];
    },
    enabled: !!user?.email
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['user-invoices', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Invoice.filter({
        created_by: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: coachingBookings = [] } = useQuery({
    queryKey: ['coaching-bookings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ConsultationBooking.filter({
        client_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: boutiquePurchases = [] } = useQuery({
    queryKey: ['boutique-purchases', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.BoutiqueServiceBooking.filter({
        client_email: user.email
      });
    },
    enabled: !!user?.email
  });

  // Calculate overall stats
  const completedCourses = userProgress.filter(p => p.is_completed).length;
  const inProgressCourses = userProgress.filter(p => p.is_started && !p.is_completed).length;
  const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0);
  const averageProgress = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / userProgress.length)
    : 0;

  // Group progress by content type
  const progressByType = allLearningContent.reduce((acc, content) => {
    const progress = userProgress.find(p => p.content_id === content.id);
    if (progress) {
      const type = content.content_type;
      if (!acc[type]) acc[type] = { total: 0, completed: 0 };
      acc[type].total++;
      if (progress.is_completed) acc[type].completed++;
    }
    return acc;
  }, {});

  const badgeCategories = badges.reduce((acc, badge) => {
    const category = badge.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 border-2 border-[#E5C089]">
          <CardContent className="py-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white text-3xl font-bold flex items-center justify-center">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#143A50] mb-2">
                  {user?.full_name || 'User Profile'}
                </h1>
                
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  
                  {organization && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{organization.organization_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {new Date(user?.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Badge className="bg-[#143A50] text-white">
                    {user?.role === 'admin' ? 'Administrator' : user?.role === 'coach' ? 'Coach' : 'Participant'}
                  </Badge>
                  {enrollments.length > 0 && (
                    <Badge variant="outline" className="border-[#AC1A5B] text-[#AC1A5B]">
                      {enrollments.length} Program{enrollments.length > 1 ? 's' : ''} Enrolled
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#143A50]">{completedCourses}</div>
                    <div className="text-xs text-slate-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#143A50]">{badges.length}</div>
                    <div className="text-xs text-slate-600">Badges</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#143A50]">{Math.round(totalTimeSpent / 60)}h</div>
                    <div className="text-xs text-slate-600">Learning Time</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#143A50]">{averageProgress}%</div>
                    <div className="text-xs text-slate-600">Avg Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="portal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portal">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Customer Portal
            </TabsTrigger>
            <TabsTrigger value="progress">
              <TrendingUp className="w-4 h-4 mr-2" />
              Learning Progress
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="w-4 h-4 mr-2" />
              Badges & Achievements
            </TabsTrigger>
            <TabsTrigger value="activity">
              <BookOpen className="w-4 h-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          {/* Customer Portal Tab */}
          <TabsContent value="portal" className="space-y-6">
            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white rounded-lg">
                      <div>
                        <div className="text-sm opacity-90">Current Plan</div>
                        <div className="text-2xl font-bold capitalize">{subscription.tier} Tier</div>
                        <div className="text-sm opacity-90 mt-1">
                          ${subscription.monthly_cost}/month
                        </div>
                      </div>
                      <Badge className={subscription.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>
                        {subscription.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Billing Cycle Start:</span>
                        <div className="font-medium">{new Date(subscription.billing_cycle_start).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Next Billing Date:</span>
                        <div className="font-medium">{new Date(subscription.billing_cycle_end).toLocaleDateString()}</div>
                      </div>
                      {subscription.payment_method_last4 && (
                        <div>
                          <span className="text-slate-500">Payment Method:</span>
                          <div className="font-medium">{subscription.payment_method_brand} •••• {subscription.payment_method_last4}</div>
                        </div>
                      )}
                    </div>

                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription className="text-xs">
                        <strong>Subscription Policy:</strong> All subscriptions renew automatically unless canceled prior to renewal. 
                        No pro-rated refunds or credits for partial months or unused access. By purchasing, you agree to these terms 
                        and authorize recurring charges until canceled.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.location.href = createPageUrl('SubscriptionPlans')}>
                        Change Plan
                      </Button>
                      <Button variant="outline" size="sm">Update Payment Method</Button>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = 'mailto:support@elbertinnovativesolutions.org'}>
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 mb-4">No active subscription</p>
                    <Button 
                      className="bg-[#143A50]"
                      onClick={() => window.location.href = createPageUrl('SubscriptionPlans')}
                    >
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Available Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { tier: 'base', name: 'Base Tier', price: 25, icon: Star, color: 'emerald', features: ['Funding readiness dashboard', 'Limited opportunity feed', 'Basic AI tools', 'Core templates'] },
                    { tier: 'mid', name: 'Mid Tier', price: 149, icon: Sparkles, color: 'blue', features: ['Everything in Base', 'Advanced templates', 'Live trainings', 'Group coaching labs'] },
                    { tier: 'premium', name: 'Premium', price: 299, icon: Crown, color: 'violet', features: ['Everything in Mid', 'Document review', 'Grant development', 'Contract writing support'] }
                  ].map((plan) => {
                    const Icon = plan.icon;
                    const isCurrent = subscription?.tier === plan.tier;
                    return (
                      <Card key={plan.tier} className={isCurrent ? 'border-2 border-[#143A50]' : ''}>
                        <CardHeader>
                          <Icon className={`w-6 h-6 text-${plan.color}-600 mb-2`} />
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <p className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 mb-4">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs">
                                <Check className={`w-3 h-3 text-${plan.color}-600 mt-0.5 flex-shrink-0`} />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          {isCurrent ? (
                            <Badge className="w-full justify-center">Current Plan</Badge>
                          ) : (
                            <Button size="sm" className="w-full" onClick={() => window.location.href = createPageUrl('SubscriptionPlans')}>
                              {subscription ? 'Switch Plan' : 'Subscribe'}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Digital Products & Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  My Digital Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userProgress.filter(p => p.is_started).map((progress) => {
                    const content = allLearningContent.find(c => c.id === progress.content_id);
                    if (!content) return null;
                    return (
                      <div key={progress.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#E5C089]/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-[#143A50]" />
                          </div>
                          <div>
                            <h4 className="font-medium">{content.title}</h4>
                            <p className="text-xs text-slate-500">
                              {progress.progress_percentage}% complete
                            </p>
                          </div>
                        </div>
                        <Link to={createPageUrl('Learning')}>
                          <Button size="sm" variant="outline">Continue</Button>
                        </Link>
                      </div>
                    );
                  })}

                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#E5C089]/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-[#143A50]" />
                        </div>
                        <div>
                          <h4 className="font-medium">Program Access</h4>
                          <p className="text-xs text-slate-500">
                            Enrolled {new Date(enrollment.enrollment_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link to={createPageUrl('IncubateHerOverview')}>
                        <Button size="sm" variant="outline">Access</Button>
                      </Link>
                    </div>
                  ))}

                  {userProgress.filter(p => p.is_started).length === 0 && enrollments.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-500 mb-4">No digital products purchased yet</p>
                      <Link to={createPageUrl('Learning')}>
                        <Button variant="outline">Browse Learning Hub</Button>
                      </Link>
                    </div>
                  )}
                </div>

                <Alert className="mt-4">
                  <FileText className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    <strong>Digital Products Policy:</strong> Due to the digital nature of products and immediate access to content, 
                    once payment has been rendered, all sales are final and no refunds will be given. Please make sure you are certain 
                    before making your purchase.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Coaching Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  My Coaching Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coachingBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{booking.service_type}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                            <Clock className="w-4 h-4" />
                            {booking.scheduled_date ? new Date(booking.scheduled_date).toLocaleString() : 'Not scheduled'}
                          </div>
                        </div>
                        <Badge variant={
                          booking.status === 'completed' ? 'default' : 
                          booking.status === 'scheduled' ? 'outline' : 
                          'secondary'
                        }>
                          {booking.status}
                        </Badge>
                      </div>

                      {booking.status === 'scheduled' && (
                        <Alert className="mb-3">
                          <AlertCircle className="w-4 h-4" />
                          <AlertDescription className="text-xs">
                            <strong>Cancellation Policy:</strong> Cancellations made less than 48 hours before your scheduled session 
                            will be considered a no-show. No refunds or credits will be issued for no-shows.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        {booking.status === 'scheduled' && (
                          <>
                            <Button size="sm" variant="outline">Join Session</Button>
                            <Button size="sm" variant="outline">Reschedule</Button>
                          </>
                        )}
                        {booking.status === 'pending' && (
                          <Button size="sm">Schedule Now</Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {boutiquePurchases.map((purchase) => (
                    <div key={purchase.id} className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{purchase.service_name}</h4>
                          <div className="text-sm text-slate-600 mt-1">
                            {purchase.service_type} • ${purchase.total_paid}
                          </div>
                        </div>
                        <Badge className="bg-purple-600">{purchase.status}</Badge>
                      </div>
                      
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription className="text-xs">
                          <strong>Boutique Service Policy:</strong> Services include upfront planning and team costs. 
                          Deposits are non-refundable. Cancellations before service date may receive partial refund minus 20% administrative fee.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ))}

                  {(coachingBookings.length === 0 && boutiquePurchases.length === 0) && (
                    <div className="text-center py-8">
                      <Video className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-500 mb-4">No coaching sessions booked yet</p>
                      <Link to={createPageUrl('BoutiqueServices')}>
                        <Button variant="outline">Book a Session</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Billing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(invoice.invoice_date).toLocaleDateString()} • 
                          {' '}{new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'pending' ? 'secondary' : 'destructive'}>
                          {invoice.status}
                        </Badge>
                        {invoice.invoice_pdf_url && (
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {invoices.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No billing history available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Refund & Policies Info */}
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="w-5 h-5" />
                  Important Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-amber-900">Chargeback Protection</h4>
                  <p className="text-amber-800">
                    By completing your purchase, you agree to our refund policy and understand that initiating a chargeback 
                    or payment dispute violates these terms. We reserve the right to deny refund requests if materials were 
                    accessed, downloaded, or used prior to the request.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 text-amber-900">Payment Plan Agreement</h4>
                  <p className="text-amber-800">
                    If you select a payment plan, you are responsible for completing all payments. Failure to complete scheduled 
                    payments will result in suspension of access to the program. This is not a 'pay-as-you-go' program. By signing 
                    this agreement, you acknowledge you are fully responsible for the full cost of the program.
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 text-amber-900">Need Help?</h4>
                  <p className="text-amber-800">
                    For questions about billing, refunds, or cancellations, please contact our support team. 
                    We're here to help ensure you have the best experience possible.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-amber-700 hover:bg-amber-800"
                    onClick={() => window.location.href = 'mailto:support@elbertinnovativesolutions.org'}
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Completion</span>
                      <span className="text-sm text-slate-600">{averageProgress}%</span>
                    </div>
                    <Progress value={averageProgress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-slate-900">{userProgress.length}</div>
                      <div className="text-xs text-slate-600">Total Courses</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-slate-900">{completedCourses}</div>
                      <div className="text-xs text-slate-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <div className="text-2xl font-bold text-slate-900">{inProgressCourses}</div>
                      <div className="text-xs text-slate-600">In Progress</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Star className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-slate-900">{Math.round(totalTimeSpent / 60)}</div>
                      <div className="text-xs text-slate-600">Hours Logged</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress by Content Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(progressByType).map(([type, stats]) => (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{type}</span>
                        <span className="text-sm text-slate-600">
                          {stats.completed} / {stats.total} completed
                        </span>
                      </div>
                      <Progress 
                        value={(stats.completed / stats.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userProgress.map((progress) => {
                    const content = allLearningContent.find(c => c.id === progress.content_id);
                    if (!content) return null;
                    
                    return (
                      <div key={progress.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{content.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {content.content_type}
                            </Badge>
                            {progress.is_completed && (
                              <Badge className="bg-green-600 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#143A50]">
                            {progress.progress_percentage}%
                          </div>
                          {progress.time_spent_minutes > 0 && (
                            <div className="text-xs text-slate-500">
                              {Math.round(progress.time_spent_minutes)} min
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {userProgress.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      No learning progress yet. Start a course to see your progress here!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            {Object.entries(badgeCategories).map(([category, categoryBadges]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryBadges.map((badge) => (
                      <div 
                        key={badge.id} 
                        className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-200"
                      >
                        <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                        <div className="font-semibold text-sm text-[#143A50]">{badge.badge_name}</div>
                        {badge.earned_date && (
                          <div className="text-xs text-slate-500 mt-1">
                            Earned {new Date(badge.earned_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {categoryBadges.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      No badges in this category yet. Keep learning to earn badges!
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {badges.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">
                    No badges earned yet. Complete courses and participate in programs to earn achievements!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Learning Activity */}
                  {userProgress
                    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
                    .slice(0, 5)
                    .map((progress) => {
                      const content = allLearningContent.find(c => c.id === progress.content_id);
                      if (!content) return null;
                      
                      return (
                        <div key={progress.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            progress.is_completed ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {progress.is_completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{content.title}</h4>
                            <p className="text-xs text-slate-500">
                              {progress.is_completed ? 'Completed' : `${progress.progress_percentage}% complete`} • 
                              {' '}{new Date(progress.updated_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                  {/* Enrollment Activity */}
                  {enrollments
                    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
                    .slice(0, 3)
                    .map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">Program Enrollment</h4>
                          <p className="text-xs text-slate-500">
                            Joined {new Date(enrollment.enrollment_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}

                  {/* Badge Activity */}
                  {badges
                    .sort((a, b) => new Date(b.earned_date) - new Date(a.earned_date))
                    .slice(0, 3)
                    .map((badge) => (
                      <div key={badge.id} className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Award className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{badge.badge_name} Badge Earned</h4>
                          <p className="text-xs text-slate-500">
                            Earned {new Date(badge.earned_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {userProgress.length === 0 && enrollments.length === 0 && badges.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      No activity yet. Start learning to see your activity here!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}