import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, Package, Users, CheckCircle2, 
  Edit, Plus, Trash2, TrendingUp, Crown,
  Gift, Zap, Info, AlertCircle, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const [editingTier, setEditingTier] = useState(null);
  const [editingBundle, setEditingBundle] = useState(null);
  const [showNewTier, setShowNewTier] = useState(false);
  const [showNewBundle, setShowNewBundle] = useState(false);

  const queryClient = useQueryClient();

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: (data) => base44.entities.Subscription.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      setShowNewTier(false);
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      setEditingTier(null);
    }
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['subscriptions'])
  });

  const activeTiers = subscriptions.filter(s => s.is_active);
  const tiersByLevel = {
    free: activeTiers.filter(t => t.tier_level === 'free'),
    base: activeTiers.filter(t => t.tier_level === 'base'),
    mid: activeTiers.filter(t => t.tier_level === 'mid'),
    premium: activeTiers.filter(t => t.tier_level === 'premium')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-indigo-600" />
                Pricing & Monetization
              </h1>
              <p className="text-slate-600 mt-2">Manage subscription tiers, bundles, and revenue streams</p>
            </div>
          </div>

          <Alert className="bg-indigo-50 border-indigo-200 mb-6">
            <Info className="w-4 h-4 text-indigo-600" />
            <AlertDescription className="text-indigo-800">
              <strong>Platform Revenue Model:</strong> Freemium base with tiered subscriptions, 
              pay-per-review services, and optional premium bundles.
            </AlertDescription>
          </Alert>
        </motion.div>

        <Tabs defaultValue="tiers" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="tiers">Subscription Tiers</TabsTrigger>
            <TabsTrigger value="reviews">Review Pricing</TabsTrigger>
            <TabsTrigger value="bundles">Bundles & Packages</TabsTrigger>
            <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
          </TabsList>

          {/* Subscription Tiers */}
          <TabsContent value="tiers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Subscription Tiers</h2>
              <Button onClick={() => setShowNewTier(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tier
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Free Tier */}
              <Card className="border-2 border-slate-200">
                <CardHeader className="bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Free</Badge>
                    <Users className="w-5 h-5 text-slate-600" />
                  </div>
                  <CardTitle className="text-2xl">Community</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-slate-900">$0</span>
                    <span className="text-slate-600">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>Access to basic templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>Community learning hub</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>Grant readiness assessment</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-400">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <span>No AI assistance</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Base Tier */}
              <Card className="border-2 border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-600">Base</Badge>
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-slate-900">$49</span>
                    <span className="text-slate-600">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>All Community features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>AI funding matcher</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>Budget builder tool</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>2 AI document reviews/month</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Mid Tier */}
              <Card className="border-2 border-purple-200 shadow-lg">
                <CardHeader className="bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-600">Mid</Badge>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">Growth</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-slate-900">$149</span>
                    <span className="text-slate-600">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>All Starter features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>Priority AI assistance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>5 coach reviews/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>Team collaboration (5 users)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Premium Tier */}
              <Card className="border-2 border-amber-300 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-3 py-1 font-bold">
                  POPULAR
                </div>
                <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-gradient-to-r from-amber-600 to-orange-600">Premium</Badge>
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-slate-900">$299</span>
                    <span className="text-slate-600">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>All Growth features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>Unlimited AI assistance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>15 coach reviews/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>Dedicated success manager</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>White-glove grant submission</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Review Pricing */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>À La Carte Review Services</CardTitle>
                <CardDescription>Pay-per-review pricing for non-subscription users or overages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 border-2 border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Star className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Quick Review</h3>
                        <p className="text-sm text-slate-600">AI-assisted feedback</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-slate-900">$29</span>
                      <span className="text-slate-600">/document</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        24-hour turnaround
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        AI-powered insights
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 border-2 border-purple-200 rounded-xl bg-purple-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Coach Review</h3>
                        <p className="text-sm text-slate-600">Expert human feedback</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-slate-900">$99</span>
                      <span className="text-slate-600">/document</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        2-3 day turnaround
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Expert grant writer review
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Detailed feedback doc
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 border-2 border-amber-200 rounded-xl bg-amber-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <Crown className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Video Review</h3>
                        <p className="text-sm text-slate-600">Live walkthrough</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-slate-900">$199</span>
                      <span className="text-slate-600">/document</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        1-week turnaround
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        15-min video feedback
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Screen-share walkthrough
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bundles */}
          <TabsContent value="bundles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Service Bundles</h2>
              <Button onClick={() => setShowNewBundle(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Bundle
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-emerald-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Grant Launch Package</CardTitle>
                    <Badge className="bg-emerald-600">Best Value</Badge>
                  </div>
                  <CardDescription>Everything to submit your first grant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-900">$499</span>
                    <span className="text-slate-600 ml-2 line-through">$697 value</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Readiness assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      3 coach document reviews
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      1 video feedback session
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      30-day platform access
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-200">
                <CardHeader>
                  <CardTitle>Capacity Building Sprint</CardTitle>
                  <CardDescription>3-month intensive readiness program</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-900">$1,299</span>
                    <span className="text-slate-600 ml-2 line-through">$1,897 value</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Weekly coaching calls
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Unlimited document reviews
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Grant readiness certification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      3-month platform access
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-600">Monthly Recurring Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">$47,890</p>
                  <p className="text-sm text-emerald-600 flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4" />
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-600">Active Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">347</p>
                  <p className="text-sm text-slate-600 mt-2">
                    87% retention rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-600">Review Revenue (À La Carte)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">$8,340</p>
                  <p className="text-sm text-slate-600 mt-2">
                    84 reviews this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-600">Average Revenue Per User</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">$162</p>
                  <p className="text-sm text-slate-600 mt-2">
                    Including add-ons
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Free Tier</span>
                      <span className="text-sm text-slate-600">0 users • $0/mo</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400" style={{width: '0%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Starter ($49)</span>
                      <span className="text-sm text-slate-600">156 users • $7,644/mo</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Growth ($149)</span>
                      <span className="text-sm text-slate-600">127 users • $18,923/mo</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{width: '37%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Professional ($299)</span>
                      <span className="text-sm text-slate-600">64 users • $19,136/mo</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{width: '18%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}