import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Shield,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SERVICE_TIERS = [
  {
    id: 'standard',
    name: 'Standard Readiness',
    price: 1500,
    duration: '90 minutes',
    features: [
      'Intake + workbook',
      'Readiness rubric',
      '1-2 page summary',
      'Foundation assessment'
    ],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'funding_path',
    name: 'Readiness + Funding Path',
    price: 2250,
    duration: '120 minutes',
    recommended: true,
    features: [
      'Everything in Standard',
      'Prioritized funding lanes',
      'Funder type guidance',
      'Do/don\'t recommendations'
    ],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'capacity_build',
    name: 'Readiness + Capacity Build',
    price: 3250,
    duration: '2-2.5 hours',
    features: [
      'Everything in Funding Path',
      '30/60/90 readiness plan',
      'Template recommendations',
      'Implementation roadmap'
    ],
    color: 'from-green-500 to-emerald-500'
  }
];

export default function GrantReadinessIntensive() {
  const [selectedTier, setSelectedTier] = useState('funding_path');
  const [showIntake, setShowIntake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intakeData, setIntakeData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    organization_age: '',
    annual_budget: '',
    staff_count: '',
    previous_grants: '',
    grant_history: '',
    primary_goal: '',
    specific_questions: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tier = SERVICE_TIERS.find(t => t.id === selectedTier);
      
      const booking = await base44.entities.BoutiqueServiceBooking.create({
        service_type: 'grant_readiness_intensive',
        tier: tier.name,
        user_email: intakeData.email,
        user_name: intakeData.name,
        organization_name: intakeData.organization,
        phone: intakeData.phone,
        intake_data: intakeData,
        price_paid: tier.price,
        payment_status: 'pending'
      });

      toast.success('Intake submitted! Redirecting to payment...');
      // In real implementation, redirect to Stripe checkout
      
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
              <CardTitle>Grant Readiness Intensive Intake</CardTitle>
              <CardDescription>
                Help us understand your organization and readiness goals
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
                    <Label>Organization Name *</Label>
                    <Input
                      required
                      value={intakeData.organization}
                      onChange={(e) => setIntakeData({...intakeData, organization: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Organization Age *</Label>
                    <select
                      required
                      value={intakeData.organization_age}
                      onChange={(e) => setIntakeData({...intakeData, organization_age: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="less_than_1">Less than 1 year</option>
                      <option value="1_3">1-3 years</option>
                      <option value="3_5">3-5 years</option>
                      <option value="5_plus">5+ years</option>
                    </select>
                  </div>
                  <div>
                    <Label>Annual Budget *</Label>
                    <select
                      required
                      value={intakeData.annual_budget}
                      onChange={(e) => setIntakeData({...intakeData, annual_budget: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="under_50k">Under $50K</option>
                      <option value="50k_250k">$50K-$250K</option>
                      <option value="250k_1m">$250K-$1M</option>
                      <option value="1m_plus">$1M+</option>
                    </select>
                  </div>
                  <div>
                    <Label>Staff Count *</Label>
                    <select
                      required
                      value={intakeData.staff_count}
                      onChange={(e) => setIntakeData({...intakeData, staff_count: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="0">All volunteer</option>
                      <option value="1_3">1-3 staff</option>
                      <option value="4_10">4-10 staff</option>
                      <option value="10_plus">10+ staff</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Have you applied for grants before? *</Label>
                  <select
                    required
                    value={intakeData.previous_grants}
                    onChange={(e) => setIntakeData({...intakeData, previous_grants: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select...</option>
                    <option value="never">Never applied</option>
                    <option value="applied_not_funded">Applied but not funded</option>
                    <option value="funded_once">Funded once</option>
                    <option value="multiple_grants">Multiple grants received</option>
                  </select>
                </div>

                {intakeData.previous_grants !== 'never' && (
                  <div>
                    <Label>Tell us about your grant history</Label>
                    <Textarea
                      value={intakeData.grant_history}
                      onChange={(e) => setIntakeData({...intakeData, grant_history: e.target.value})}
                      placeholder="What grants have you applied for or received? What worked or didn't work?"
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <Label>What is your primary goal for this intensive? *</Label>
                  <Textarea
                    required
                    value={intakeData.primary_goal}
                    onChange={(e) => setIntakeData({...intakeData, primary_goal: e.target.value})}
                    placeholder="e.g., Understand if we're ready to pursue federal grants, identify gaps before applying, get honest feedback on our capacity"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Specific Questions or Concerns</Label>
                  <Textarea
                    value={intakeData.specific_questions}
                    onChange={(e) => setIntakeData({...intakeData, specific_questions: e.target.value})}
                    placeholder="What keeps you up at night about grant readiness?"
                    rows={3}
                  />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-700">Boutique Service</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Grant Readiness Intensive
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Assess readiness. Build credibility. Pursue funding strategically.
          </p>
          <Button 
            onClick={() => setShowIntake(true)}
            className="bg-[#143A50] hover:bg-[#1E4F58] h-12 px-8 text-lg"
          >
            Start Readiness Intake
          </Button>
        </div>

        {/* Why It Matters */}
        <Card className="mb-16 bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white border-none">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold mb-4">Why Grant Readiness Matters</h2>
            <p className="text-blue-100">
              Many organizations pursue grants before they are positioned to manage them. This intensive helps you determine whether your programs, capacity, and infrastructure align with funder expectations—before time and energy are spent applying.
            </p>
          </CardContent>
        </Card>

        {/* Service Tiers */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Investment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_TIERS.map((tier) => (
              <Card
                key={tier.id}
                className={`relative cursor-pointer transition-all hover:shadow-xl ${
                  selectedTier === tier.id ? 'ring-2 ring-[#143A50]' : ''
                } ${tier.recommended ? 'scale-105' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
              >
                {tier.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#143A50]">
                    Recommended
                  </Badge>
                )}
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    ${tier.price.toLocaleString()}
                  </div>
                  <CardDescription>{tier.duration}</CardDescription>
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
            Add-ons: Additional program review $750 • Board briefing $600
          </p>
        </div>

        {/* Who This Is For */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Target, title: 'First-Time Grant Seekers', desc: 'Organizations preparing to apply for their first grant' },
            { icon: AlertTriangle, title: 'Previously Denied', desc: 'Organizations that have been denied funding and want to understand why' },
            { icon: Shield, title: 'Strategic Leaders', desc: 'Leaders unsure which grants to pursue or when to pursue them' },
            { icon: TrendingUp, title: 'Scaling Organizations', desc: 'Teams needing clarity before scaling programs or operations' }
          ].map((item, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <item.icon className="w-10 h-10 text-[#143A50] mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white border-none">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Assess Your Funding Readiness?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Begin your strategic assessment and receive expert guidance on your path forward.
            </p>
            <Button
              onClick={() => setShowIntake(true)}
              size="lg"
              className="bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90 h-12 px-8"
            >
              Start Readiness Intake
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}