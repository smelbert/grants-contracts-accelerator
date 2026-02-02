import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COACHING_PACKAGES = [
  {
    id: 'one_time',
    name: 'Single Session',
    price: 150,
    priceId: null, // Will be created on-demand
    description: 'Perfect for a quick consultation or specific challenge',
    features: ['1 hour coaching session', 'Follow-up email summary', 'Action items'],
    sessions: 1,
  },
  {
    id: '3_session',
    name: '3-Session Package',
    price: 450,
    priceId: 'price_1SwWy3E5G1vBjFLaiMpyL64G',
    description: 'Ideal for focused project support',
    features: ['3 hour-long sessions', 'Document reviews', 'Email support', 'Resource recommendations'],
    sessions: 3,
    savings: 'Save $150',
  },
  {
    id: '6_session',
    name: '6-Session Package',
    price: 850,
    priceId: 'price_1SwWy3E5G1vBjFLa5zZpOM4K',
    description: 'Best for comprehensive capacity building',
    popular: true,
    features: ['6 hour-long sessions', 'Unlimited document reviews', 'Priority email & chat support', 'Custom templates', 'Video feedback'],
    sessions: 6,
    savings: 'Save $400',
  },
  {
    id: 'monthly_ongoing',
    name: 'Monthly Coaching',
    price: 99,
    priceId: 'price_1SwWy3E5G1vBjFLany4Ze29s',
    description: 'Ongoing support with flexible scheduling',
    recurring: true,
    features: ['Monthly coaching sessions', 'Continuous support', 'Access to coaching portal', 'All platform features'],
    isSubscription: true,
  },
];

export default function CoachingCheckout({ coachingType, userEmail, userName, onSuccess }) {
  const [selectedPackage, setSelectedPackage] = useState('6_session');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (window.self !== window.top) {
      toast.error('Checkout must be completed in a published app, not in the preview.');
      return;
    }

    const selectedPlan = COACHING_PACKAGES.find(p => p.id === selectedPackage);
    if (!selectedPlan || !selectedPlan.priceId) {
      toast.error('Please select a valid package');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        priceId: selectedPlan.priceId,
        checkoutType: 'coaching',
        metadata: {
          coaching_package: selectedPackage,
          coaching_type: coachingType,
          user_name: userName,
        },
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const selectedPlan = COACHING_PACKAGES.find(p => p.id === selectedPackage);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Coaching Package</h2>
        <p className="text-slate-600">Select the package that best fits your goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {COACHING_PACKAGES.map((pkg) => (
          <Card
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPackage === pkg.id 
                ? 'ring-2 ring-[#143A50] bg-[#143A50]/5' 
                : 'hover:border-[#143A50]/30'
            } ${pkg.popular ? 'relative' : ''}`}
          >
            {pkg.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#143A50]">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{pkg.name}</CardTitle>
                  {pkg.savings && (
                    <Badge variant="outline" className="text-green-600 border-green-600 mb-2">
                      {pkg.savings}
                    </Badge>
                  )}
                  <CardDescription>{pkg.description}</CardDescription>
                </div>
                <RadioGroup value={selectedPackage}>
                  <RadioGroupItem value={pkg.id} />
                </RadioGroup>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900">
                  ${pkg.price}
                </span>
                {pkg.isSubscription && <span className="text-slate-600">/month</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Package Summary */}
      {selectedPlan && (
        <Card className="mb-6 bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 mb-1">Selected Package</p>
                <p className="text-xl font-bold">{selectedPlan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  ${selectedPlan.price}
                  {selectedPlan.isSubscription && <span className="text-lg">/mo</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={isProcessing || !selectedPlan?.priceId}
        className="w-full h-14 text-lg bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Complete Enrollment
          </>
        )}
      </Button>

      <p className="text-xs text-slate-500 text-center mt-4">
        Secured by Stripe • 30-day money-back guarantee
      </p>
    </div>
  );
}