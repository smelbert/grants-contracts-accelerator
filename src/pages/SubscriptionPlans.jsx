import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, Users, Zap, Crown, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SUBSCRIPTION_PLANS = [
  {
    id: 'community',
    name: 'Community Membership',
    price: '$29',
    interval: 'month',
    priceId: 'price_1SwWy3E5G1vBjFLa1XH9yVIE',
    description: 'Perfect for getting started and connecting with peers',
    icon: Users,
    features: [
      'Access to all community spaces',
      'Participate in discussions',
      'Attend live events and workshops',
      'Basic templates and resources',
      'Email support',
    ],
    color: 'from-blue-500 to-cyan-500',
    accessLevel: 'community_only',
  },
  {
    id: 'coaching',
    name: 'Coaching Portal',
    price: '$99',
    interval: 'month',
    priceId: 'price_1SwWy3E5G1vBjFLany4Ze29s',
    description: 'Includes everything in Community plus personalized coaching',
    icon: Sparkles,
    popular: true,
    features: [
      'Everything in Community Membership',
      '1-on-1 coaching sessions',
      'Document review and feedback',
      'Personalized action plans',
      'Priority support',
      'Video feedback on proposals',
    ],
    color: 'from-purple-500 to-pink-500',
    accessLevel: 'coaching_portal',
  },
  {
    id: 'full_platform',
    name: 'Full Platform Access',
    price: '$199',
    interval: 'month',
    priceId: 'price_1SwWy3E5G1vBjFLa8hpGAttx',
    description: 'Complete access to all premium features and content',
    icon: Crown,
    features: [
      'Everything in Coaching Portal',
      'Unlimited coaching sessions',
      'AI-powered proposal assistance',
      'Advanced templates and tools',
      'Custom training and workshops',
      'White-glove support',
      'API access for integrations',
    ],
    color: 'from-amber-500 to-orange-500',
    accessLevel: 'full_platform',
  },
];

export default function SubscriptionPlans() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ['user-subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user.email,
        status: 'active'
      });
      return subs[0] || null;
    },
    enabled: !!user?.email,
  });

  const handleSubscribe = async (plan) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    // Check if running in iframe
    if (window.self !== window.top) {
      toast.error('Checkout must be completed in a published app, not in the preview.');
      return;
    }

    setIsProcessing(true);
    setProcessingPlanId(plan.id);

    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        priceId: plan.priceId,
        checkoutType: 'subscription',
        metadata: {
          plan_name: plan.name,
          access_level: plan.accessLevel,
        },
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
      setIsProcessing(false);
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#E5C089] text-[#143A50]">Pricing Plans</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Growth Path
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select the plan that best fits your organization's needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="mb-8 border-[#143A50] border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Active Subscription</p>
                    <p className="text-sm text-slate-600">{currentSubscription.plan_name}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentSubscription?.plan_name === plan.name;
            
            return (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                  plan.popular ? 'ring-2 ring-[#143A50] scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-[#143A50] text-white px-3 py-1 text-xs font-semibold">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${plan.color} mx-auto mb-4 flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">/{plan.interval}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isProcessing || isCurrentPlan}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-[#143A50] hover:bg-[#1E4F58]' 
                        : 'bg-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    {isProcessing && processingPlanId === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : currentSubscription ? (
                      'Switch Plan'
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <p className="text-slate-600">
            Questions about plans? <a href="mailto:drelbert@elbertinnovativesolutions.org" className="text-[#143A50] underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
}