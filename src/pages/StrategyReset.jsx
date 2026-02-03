import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  CheckCircle2, 
  Users,
  TrendingUp,
  Lightbulb,
  Target,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SERVICE_TIERS = [
  {
    id: 'mini_retreat',
    name: 'Virtual Mini-Retreat',
    price: 4500,
    duration: '3 hours',
    features: [
      'Intake + workbook',
      'Facilitation',
      'Summary + findings',
      'Digital delivery'
    ],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'half_day',
    name: 'Half-Day Session',
    price: 6500,
    duration: '4 hours',
    bestValue: true,
    features: [
      'Everything in Mini-Retreat',
      'Decision log',
      '90-day priorities map',
      'Virtual or local in-person'
    ],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'full_day',
    name: 'Full-Day Retreat',
    price: 9500,
    duration: '6-7 hours',
    features: [
      'Everything in Half-Day',
      'Implementation roadmap',
      'Facilitation artifacts',
      'Comprehensive strategy reset'
    ],
    color: 'from-amber-500 to-orange-500'
  }
];

export default function StrategyReset() {
  const [selectedTier, setSelectedTier] = useState('half_day');
  const [showIntake, setShowIntake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intakeData, setIntakeData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    team_size: '',
    participants: '',
    current_challenge: '',
    desired_outcome: '',
    urgency: '',
    preferred_format: 'virtual',
    preferred_dates: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tier = SERVICE_TIERS.find(t => t.id === selectedTier);
      
      const booking = await base44.entities.BoutiqueServiceBooking.create({
        service_type: 'strategy_reset',
        tier: tier.name,
        user_email: intakeData.email,
        user_name: intakeData.name,
        organization_name: intakeData.organization,
        phone: intakeData.phone,
        intake_data: intakeData,
        price_paid: tier.price,
        payment_status: 'pending'
      });

      toast.success('Request submitted! We\'ll contact you to schedule your session.');
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to process request. Please try again.');
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
              <CardTitle>Strategy Reset Session Request</CardTitle>
              <CardDescription>
                Tell us about your organization and what you hope to accomplish
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Your Role *</Label>
                    <Input
                      required
                      value={intakeData.role}
                      onChange={(e) => setIntakeData({...intakeData, role: e.target.value})}
                      placeholder="e.g., Executive Director, Board Chair"
                    />
                  </div>
                  <div>
                    <Label>Leadership Team Size *</Label>
                    <select
                      required
                      value={intakeData.team_size}
                      onChange={(e) => setIntakeData({...intakeData, team_size: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="2_5">2-5 people</option>
                      <option value="6_10">6-10 people</option>
                      <option value="11_plus">11+ people</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Who will participate in the session? *</Label>
                  <Input
                    required
                    value={intakeData.participants}
                    onChange={(e) => setIntakeData({...intakeData, participants: e.target.value})}
                    placeholder="e.g., Executive team, Board members, Department heads"
                  />
                </div>

                <div>
                  <Label>What is the current challenge or tension? *</Label>
                  <Textarea
                    required
                    value={intakeData.current_challenge}
                    onChange={(e) => setIntakeData({...intakeData, current_challenge: e.target.value})}
                    placeholder="Describe what's creating pressure or misalignment in your organization"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>What would a successful outcome look like? *</Label>
                  <Textarea
                    required
                    value={intakeData.desired_outcome}
                    onChange={(e) => setIntakeData({...intakeData, desired_outcome: e.target.value})}
                    placeholder="What do you hope to walk away with after this session?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>How urgent is this? *</Label>
                  <select
                    required
                    value={intakeData.urgency}
                    onChange={(e) => setIntakeData({...intakeData, urgency: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select...</option>
                    <option value="immediate">Immediate - Within 2 weeks</option>
                    <option value="soon">Soon - Within 1 month</option>
                    <option value="planning">Planning - Within 2-3 months</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Preferred Format *</Label>
                    <select
                      required
                      value={intakeData.preferred_format}
                      onChange={(e) => setIntakeData({...intakeData, preferred_format: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="virtual">Virtual</option>
                      <option value="in_person">In-person (if local)</option>
                      <option value="either">Either works</option>
                    </select>
                  </div>
                  <div>
                    <Label>Preferred Dates/Timeframe</Label>
                    <Input
                      value={intakeData.preferred_dates}
                      onChange={(e) => setIntakeData({...intakeData, preferred_dates: e.target.value})}
                      placeholder="e.g., Week of March 15th"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">Selected Service</span>
                    <Badge className="bg-[#143A50]">
                      {SERVICE_TIERS.find(t => t.id === selectedTier)?.name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Starting Investment</span>
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
                      Submitting...
                    </>
                  ) : (
                    'Request Strategy Reset'
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  We'll contact you within 24 hours to discuss your needs and schedule your session
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-700">Boutique Service</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Strategy Reset Session
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-2">
            A focused reset to realign priorities, capacity, and direction.
          </p>
          <p className="text-lg text-slate-500 mb-8">
            Clarity before expansion. Alignment before action.
          </p>
          <Button 
            onClick={() => setShowIntake(true)}
            className="bg-[#143A50] hover:bg-[#1E4F58] h-12 px-8 text-lg"
          >
            Request Strategy Reset
          </Button>
        </div>

        {/* Why This Matters */}
        <Card className="mb-16 bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white border-none">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold mb-4">Why a Strategy Reset</h2>
            <p className="text-blue-100">
              When organizations move too quickly without alignment, they exhaust people and resources. This session creates space to pause, assess, and reset direction responsibly.
            </p>
          </CardContent>
        </Card>

        {/* Who This Is For */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Users, title: 'Leadership Teams Under Pressure' },
            { icon: TrendingUp, title: 'Organizations Preparing for Growth' },
            { icon: Target, title: 'Boards Seeking Clarity' },
            { icon: RefreshCw, title: 'Teams Navigating Change' }
          ].map((item, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6 text-center">
                <item.icon className="w-10 h-10 text-[#143A50] mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
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
                } ${tier.bestValue ? 'scale-105' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
              >
                {tier.bestValue && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#143A50]">
                    Best Value
                  </Badge>
                )}
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                    <RefreshCw className="w-6 h-6 text-white" />
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
            Add-ons: Board variant module $1,500 • Travel billed separately
          </p>
        </div>

        {/* What You'll Walk Away With */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[
            { icon: Lightbulb, title: 'Clear Priorities', desc: 'Aligned understanding of what matters most and what can wait' },
            { icon: Users, title: 'Shared Understanding', desc: 'Leadership alignment on direction, capacity, and tradeoffs' },
            { icon: Target, title: 'Identified Risks & Constraints', desc: 'Honest assessment of limitations and potential pitfalls' },
            { icon: CheckCircle2, title: 'Recommended Next Steps', desc: 'Strategic guidance on the most responsible path forward' }
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

        {/* CTA */}
        <Card className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white border-none">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Reset Your Strategy?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Begin the intake process and we'll design a session tailored to your organization's needs.
            </p>
            <Button
              onClick={() => setShowIntake(true)}
              size="lg"
              className="bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90 h-12 px-8"
            >
              Request Strategy Reset
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}