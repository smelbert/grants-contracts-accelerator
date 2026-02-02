import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-xl">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Payment Cancelled
          </h1>
          <p className="text-slate-600 mb-8">
            Your payment was not processed. No charges have been made to your account.
          </p>

          <div className="flex flex-col gap-3">
            <Link to={createPageUrl('SubscriptionPlans')}>
              <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
                View Plans Again
              </Button>
            </Link>
            <Link to={createPageUrl('Home')}>
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}