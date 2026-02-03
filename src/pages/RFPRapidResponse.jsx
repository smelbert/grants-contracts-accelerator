import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  X, 
  Zap, 
  FileText,
  AlertCircle,
  TrendingUp,
  Users,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SERVICE_TIERS = [
  {
    id: 'rapid',
    name: 'Rapid Review',
    price: 1250,
    timeline: '48 hours – 7 days until due',
    features: [
      'Up to 15 pages',
      'Compliance + scoring alignment',
      'Refinement notes',
      '1 annotated draft',
      '1 summary sheet'
    ],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'priority',
    name: 'Priority Review',
    price: 1850,
    timeline: '24-48 hours',
    popular: true,
    features: [
      'Up to 20 pages',
      'Everything in Rapid Review',
      '30-min debrief call',
      'Priority turnaround'
    ],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'emergency',
    name: 'Emergency Review',
    price: 2500,
    timeline: 'Same-day / <24 hours',
    features: [
      'Up to 25 pages',
      'Everything in Priority',
      'Submission readiness checklist',
      'Urgent support'
    ],
    color: 'from-red-500 to-orange-500'
  }
];

export default function RFPRapidResponse() {
  const [selectedTier, setSelectedTier] = useState('priority');
  const [showIntake, setShowIntake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intakeData, setIntakeData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    proposal_type: '',
    deadline: '',
    page_count: '',
    current_status: '',
    specific_concerns: '',
    draft_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tier = SERVICE_TIERS.find(t => t.id === selectedTier);
      
      // Create booking
      const booking = await base44.entities.BoutiqueServiceBooking.create({
        service_type: 'rfp_rapid_response',
        tier: tier.name,
        user_email: intakeData.email,
        user_name: intakeData.name,
        organization_name: intakeData.organization,
        phone: intakeData.phone,
        deadline: intakeData.deadline,
        intake_data: intakeData,
        price_paid: tier.price,
        payment_status: 'pending'
      });

      // Create Stripe checkout
      const response = await base44.functions.invoke('createCheckoutSession', {
        priceId: null, // Will need to create prices for these
        checkoutType: 'service',
        metadata: {
          booking_id: booking.id,
          service_type: 'rfp_rapid_response',
          tier: selectedTier
        }
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to process booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showIntake) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowIntake(false)}
            className="mb-6"
          >
            ← Back to Service Overview
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>RFP Rapid Response Intake</CardTitle>
              <CardDescription>
                Tell us about your proposal so we can provide targeted support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      required
                      value={intakeData.name}
                      onChange={(e) => setIntakeData({...intakeData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      required
                      type="email"
                      value={intakeData.email}
                      onChange={(e) => setIntakeData({...intakeData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input
                      required
                      value={intakeData.phone}
                      onChange={(e) => setIntakeData({...intakeData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Organization *</Label>
                    <Input
                      required
                      value={intakeData.organization}
                      onChange={(e) => setIntakeData({...intakeData, organization: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Type of Proposal/RFP *</Label>
                  <Input
                    required
                    value={intakeData.proposal_type}
                    onChange={(e) => setIntakeData({...intakeData, proposal_type: e.target.value})}
                    placeholder="e.g., Federal grant, State RFP, Foundation proposal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Submission Deadline *</Label>
                    <Input
                      required
                      type="datetime-local"
                      value={intakeData.deadline}
                      onChange={(e) => setIntakeData({...intakeData, deadline: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Page Count *</Label>
                    <Input
                      required
                      type="number"
                      value={intakeData.page_count}
                      onChange={(e) => setIntakeData({...intakeData, page_count: e.target.value})}
                      placeholder="Number of pages"
                    />
                  </div>
                </div>

                <div>
                  <Label>Current Status of Draft *</Label>
                  <Textarea
                    required
                    value={intakeData.current_status}
                    onChange={(e) => setIntakeData({...intakeData, current_status: e.target.value})}
                    placeholder="Briefly describe how complete your draft is and what sections exist"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Specific Concerns or Questions</Label>
                  <Textarea
                    value={intakeData.specific_concerns}
                    onChange={(e) => setIntakeData({...intakeData, specific_concerns: e.target.value})}
                    placeholder="What are you most worried about? What feedback do you need?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Link to Draft (Google Doc, Dropbox, etc.)</Label>
                  <Input
                    value={intakeData.draft_url}
                    onChange={(e) => setIntakeData({...intakeData, draft_url: e.target.value})}
                    placeholder="https://"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Ensure viewing permissions are enabled. You can also email your draft after booking.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">Selected Service</span>
                    <Badge className="bg-[#143A50]">
                      {SERVICE_TIERS.find(t => t.id === selectedTier)?.name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Investment</span>
                    <span className="text-2xl font-bold text-[#143A50]">
                      ${SERVICE_TIERS.find(t => t.id === selectedTier)?.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#143A50] hover:bg-[#1E4F58]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-700">Boutique Service</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            RFP Rapid Response Clinic
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Strategic refinement for proposals due within 24 hours–7 days
          </p>
          <Button 
            onClick={() => setShowIntake(true)}
            className="bg-[#143A50] hover:bg-[#1E4F58] h-12 px-8 text-lg"
          >
            Start Intake
          </Button>
        </div>

        {/* Who This Is For */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: TrendingUp, title: 'Nonprofits', desc: 'Organizations seeking funding to expand programs, serve communities, and create impact.' },
            { icon: Users, title: 'Small Businesses & Consultants', desc: 'Entrepreneurs responding to government or corporate RFPs with limited proposal support.' },
            { icon: FileText, title: 'Individual Applicants', desc: 'Individuals applying for grants, fellowships, or competitive opportunities.' }
          ].map((item, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <item.icon className="w-10 h-10 text-[#143A50] mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Tiers */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Investment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_TIERS.map((tier) => (
              <Card
                key={tier.id}
                className={`relative cursor-pointer transition-all hover:shadow-xl ${
                  selectedTier === tier.id ? 'ring-2 ring-[#143A50]' : ''
                } ${tier.popular ? 'scale-105' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#143A50]">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    ${tier.price.toLocaleString()}
                  </div>
                  <CardDescription>{tier.timeline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
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
          <p className="text-center text-sm text-slate-600 mt-6">
            Add-ons: Extra pages $75/page • 2nd revision $350
          </p>
        </div>

        {/* What's Included / Not Included */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                What This Service Includes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Review of Existing Draft', desc: 'Comprehensive analysis of your current proposal content and structure' },
                { title: 'Compliance & Eligibility Check', desc: 'Verification that your proposal meets all technical requirements' },
                { title: 'Alignment to Scoring Criteria', desc: 'Assessment of how well your proposal addresses reviewer priorities' },
                { title: 'Language Refinement', desc: 'Recommendations for clarity, impact, and persuasive strength' },
                { title: 'Go / No-Go Recommendation', desc: 'Strategic guidance on whether to submit, revise, or pause' }
              ].map((item, idx) => (
                <div key={idx}>
                  <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-600">{item.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <X className="w-5 h-5" />
                What This Is Not
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                'No net-new writing – We refine what exists, not create from scratch',
                'No budget development – Financial planning is not included',
                'No attachments or appendices – Focus is on narrative content only',
                'No guarantee of funding – This is advisory support, not an outcome promise'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white border-none">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Strategic Feedback?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Start your intake now and receive expert guidance before your deadline.
            </p>
            <Button
              onClick={() => setShowIntake(true)}
              size="lg"
              className="bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90 h-12 px-8"
            >
              Start Intake
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}