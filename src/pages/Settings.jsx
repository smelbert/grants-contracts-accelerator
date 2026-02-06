import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Settings as SettingsIcon, CreditCard, Receipt, 
  Check, Sparkles, Crown, Star, Download, AlertCircle, Users
} from 'lucide-react';
import { format } from 'date-fns';
import TeamManagement from '@/components/settings/TeamManagement';

const TIER_CONFIG = {
  base: {
    name: 'Base Tier',
    price: 25,
    icon: Star,
    color: 'emerald',
    features: [
      'Funding readiness dashboard',
      'Limited opportunity feed',
      'Basic AI boilerplate builder',
      'Core templates',
      'Intro learning content'
    ]
  },
  mid: {
    name: 'Mid Tier',
    price: 149,
    icon: Sparkles,
    color: 'blue',
    features: [
      'Everything in Base',
      'Advanced templates',
      'Live trainings & webinars',
      'Group coaching labs',
      'Expanded AI tools',
      'Priority opportunity alerts'
    ]
  },
  premium: {
    name: 'Premium Services',
    price: 299,
    icon: Crown,
    color: 'violet',
    features: [
      'Everything in Mid',
      'Document review',
      'Grant draft review',
      'Full grant/RFP development',
      'Contract writing support',
      'Fiscal sponsor matchmaking'
    ]
  }
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [changingTier, setChangingTier] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Determine if user is viewing from coach portal
  const portalView = localStorage.getItem('portalView') || 'auto';
  const isCoachView = portalView === 'coach' || (portalView === 'auto' && user?.role === 'coach');

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', user?.email],
    queryFn: () => base44.entities.Invoice.filter({ created_by: user?.email }, '-invoice_date', 10),
    enabled: !!user?.email,
  });

  const subscription = subscriptions?.[0];

  const changeTierMutation = useMutation({
    mutationFn: async ({ newTier }) => {
      if (subscription) {
        return base44.entities.Subscription.update(subscription.id, {
          tier: newTier,
          monthly_cost: TIER_CONFIG[newTier].price
        });
      } else {
        return base44.entities.Subscription.create({
          tier: newTier,
          status: 'active',
          monthly_cost: TIER_CONFIG[newTier].price,
          billing_cycle_start: new Date().toISOString().split('T')[0],
          billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      setChangingTier(null);
    },
  });

  const currentTier = subscription?.tier || 'base';
  const currentConfig = TIER_CONFIG[currentTier];

  if (subsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-slate-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Settings
            </h1>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue={isCoachView ? "profile" : "billing"} className="space-y-6">
          <TabsList>
            {isCoachView && <TabsTrigger value="profile">Profile Settings</TabsTrigger>}
            {!isCoachView && (
              <>
                <TabsTrigger value="billing">Billing & Subscription</TabsTrigger>
                <TabsTrigger value="team">Team Management</TabsTrigger>
              </>
            )}
          </TabsList>

          {isCoachView && (
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your coach profile and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Full Name</label>
                      <p className="text-slate-900">{user?.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Email</label>
                      <p className="text-slate-900">{user?.email}</p>
                    </div>
                  </div>
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      To update your professional profile, expertise, and availability, visit <strong>My Profile</strong> from the coach menu.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {!isCoachView && <TabsContent value="billing" className="space-y-6">
        {/* Current Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className={`border-2 border-${currentConfig.color}-200 bg-${currentConfig.color}-50/50`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <currentConfig.icon className={`w-8 h-8 text-${currentConfig.color}-600`} />
                  <div>
                    <CardTitle className="text-xl">{currentConfig.name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      ${currentConfig.price}/month
                    </p>
                  </div>
                </div>
                <Badge className={`bg-${currentConfig.color}-100 text-${currentConfig.color}-700 border-${currentConfig.color}-200`}>
                  Current Plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentConfig.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className={`w-4 h-4 text-${currentConfig.color}-600 mt-0.5 flex-shrink-0`} />
                    {feature}
                  </li>
                ))}
              </ul>
              {subscription?.billing_cycle_end && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Next billing date: {format(new Date(subscription.billing_cycle_end), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Change Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(TIER_CONFIG).map(([tier, config]) => {
              const isCurrent = tier === currentTier;
              const Icon = config.icon;
              return (
                <Card key={tier} className={isCurrent ? 'border-2 border-slate-300' : ''}>
                  <CardHeader>
                    <Icon className={`w-6 h-6 text-${config.color}-600 mb-2`} />
                    <CardTitle className="text-base">{config.name}</CardTitle>
                    <p className="text-2xl font-bold text-slate-900">${config.price}<span className="text-sm text-slate-500 font-normal">/mo</span></p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5 mb-4">
                      {config.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className={`w-3 h-3 text-${config.color}-500 mt-0.5 flex-shrink-0`} />
                          {feature}
                        </li>
                      ))}
                      {config.features.length > 3 && (
                        <li className="text-xs text-slate-500">+ {config.features.length - 3} more</li>
                      )}
                    </ul>
                    <Button
                      onClick={() => changeTierMutation.mutate({ newTier: tier })}
                      disabled={isCurrent || changeTierMutation.isPending}
                      className={`w-full ${isCurrent ? '' : `bg-${config.color}-600 hover:bg-${config.color}-700`}`}
                      variant={isCurrent ? 'outline' : 'default'}
                    >
                      {changeTierMutation.isPending && changingTier === tier ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : tier === 'base' && currentTier !== 'base' ? (
                        'Downgrade'
                      ) : (
                        'Upgrade'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription?.payment_method_last4 ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {subscription.payment_method_brand || 'Card'} •••• {subscription.payment_method_last4}
                      </p>
                      <p className="text-sm text-slate-500">Default payment method</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    No payment method on file. Add a card to continue your subscription.
                  </AlertDescription>
                </Alert>
              )}
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Billing History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Billing History
              </CardTitle>
              <CardDescription>View and download past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : invoices?.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">
                          ${invoice.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(invoice.invoice_date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                          {invoice.status}
                        </Badge>
                        {invoice.invoice_pdf_url && (
                          <Button variant="ghost" size="sm" onClick={() => window.open(invoice.invoice_pdf_url, '_blank')}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">No invoices yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
          </TabsContent>}

          {!isCoachView && (
            <TabsContent value="team">
              <TeamManagement currentUser={user} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}