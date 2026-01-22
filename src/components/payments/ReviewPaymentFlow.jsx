import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, DollarSign, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const REVIEW_PRICING = {
  single_document: {
    label: 'Single Document Review',
    price: 49,
    description: 'Basic document review with inline feedback'
  },
  proposal_section: {
    label: 'Proposal Section Review',
    price: 99,
    description: 'Detailed review of a proposal section'
  },
  full_proposal: {
    label: 'Full Proposal Review',
    price: 149,
    description: 'Complete proposal review with strategic feedback'
  },
  contract_rfp: {
    label: 'Contract/RFP Response Review',
    price: 199,
    description: 'Comprehensive review for government contracts or RFPs'
  }
};

export default function ReviewPaymentFlow({ 
  documentId, 
  reviewType = 'single_document',
  onPaymentComplete,
  onCancel 
}) {
  const [processing, setProcessing] = useState(false);
  const pricing = REVIEW_PRICING[reviewType];

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    onPaymentComplete?.();
  };

  return (
    <div className="space-y-6">
      {/* Pricing Info */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            {pricing.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900">${pricing.price}</span>
            <span className="text-slate-500">one-time</span>
          </div>
          <p className="text-sm text-slate-600">{pricing.description}</p>
        </CardContent>
      </Card>

      {/* Ethical Disclosure */}
      <Alert className="bg-emerald-50 border-emerald-200">
        <Info className="w-4 h-4 text-emerald-600" />
        <AlertDescription className="text-emerald-700 text-sm">
          <strong>Optional & Transparent:</strong> Review improves clarity and alignment—not outcomes. 
          This is not required to proceed on the platform.
        </AlertDescription>
      </Alert>

      {/* What's Included */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">What's Included:</p>
        <ul className="space-y-2">
          {[
            'Inline comments and tracked changes',
            'Written feedback summary',
            'Optional video walkthrough',
            '3-5 day turnaround',
            'One round of clarifications'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <Alert className="bg-slate-50 border-slate-200">
        <AlertDescription className="text-xs text-slate-600">
          <strong>Disclaimer:</strong> Review improves clarity and alignment — not outcomes. 
          This service provides expert feedback but does not guarantee funding success.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          disabled={processing}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {processing ? 'Processing...' : `Pay $${pricing.price}`}
        </Button>
      </div>
    </div>
  );
}