import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WorkshopCheckout({ registrationPage, registrationData, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (window.self !== window.top) {
      toast.error('Checkout must be completed in a published app, not in the preview.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create registration submission first
      const submission = await base44.entities.RegistrationSubmission.create({
        registration_page_id: registrationPage.id,
        user_email: registrationData.email,
        user_name: registrationData.name,
        entry_point: 'workshop',
        registration_data: registrationData,
        payment_status: 'pending',
      });

      // Create Stripe checkout session
      const response = await base44.functions.invoke('createCheckoutSession', {
        priceId: registrationPage.pricing.stripe_price_id || 'price_1SwWy3E5G1vBjFLae1pLG0bF',
        checkoutType: 'workshop',
        metadata: {
          registration_page_id: registrationPage.id,
          submission_id: submission.id,
          access_level: registrationPage.access_level,
          workshop_name: registrationPage.title,
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

  const amount = registrationPage.pricing?.amount || 99;
  const currency = registrationPage.pricing?.currency || 'USD';

  return (
    <Card className="border-2 border-[#143A50]/20">
      <CardHeader className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
        <CardTitle>Workshop Registration</CardTitle>
        <CardDescription className="text-blue-100">
          Complete your registration with secure payment
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <span className="text-slate-700">Workshop</span>
            <span className="font-semibold text-slate-900">{registrationPage.title}</span>
          </div>

          {registrationPage.offering_details?.dates && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>{registrationPage.offering_details.dates}</span>
            </div>
          )}

          {registrationPage.offering_details?.duration && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{registrationPage.offering_details.duration}</span>
            </div>
          )}

          {registrationPage.offering_details?.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              <span>{registrationPage.offering_details.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-lg font-semibold text-slate-900">Total</span>
            <span className="text-2xl font-bold text-[#143A50]">
              ${amount.toFixed(2)} {currency}
            </span>
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full bg-[#143A50] hover:bg-[#1E4F58] h-12 text-base"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5 mr-2" />
              Complete Registration
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center mt-4">
          Secured by Stripe • Your payment information is encrypted
        </p>
      </CardContent>
    </Card>
  );
}