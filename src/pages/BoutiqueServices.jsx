import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Target, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

const SERVICES = [
  {
    id: 'rfp_rapid_response',
    title: 'RFP Rapid Response Clinic',
    description: 'Strategic refinement for proposals due within 24 hours–7 days',
    icon: Zap,
    priceFrom: 1250,
    features: ['Compliance check', 'Scoring alignment', 'Go/No-Go guidance'],
    color: 'from-red-500 to-orange-500',
    page: 'RFPRapidResponse'
  },
  {
    id: 'grant_readiness',
    title: 'Grant Readiness Intensive',
    description: 'Assess readiness. Build credibility. Pursue funding strategically.',
    icon: Target,
    priceFrom: 1500,
    features: ['Readiness assessment', 'Strengths & gaps analysis', 'Strategic guidance'],
    color: 'from-green-500 to-emerald-500',
    page: 'GrantReadinessIntensive'
  },
  {
    id: 'strategy_reset',
    title: 'Strategy Reset Session',
    description: 'Realign priorities, capacity, and direction through facilitated sessions',
    icon: RefreshCw,
    priceFrom: 4500,
    features: ['Leadership alignment', 'Priority mapping', 'Implementation roadmap'],
    color: 'from-amber-500 to-orange-500',
    page: 'StrategyReset'
  }
];

export default function BoutiqueServices() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#AC1A5B] text-white">Premium Services</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Boutique Services
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            High-touch, expert-led services designed for organizations with urgent needs and complex challenges
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id} className="hover:shadow-xl transition-all">
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-slate-600">Starting at</span>
                      <span className="text-2xl font-bold text-[#143A50]">
                        ${service.priceFrom.toLocaleString()}
                      </span>
                    </div>
                    
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link to={createPageUrl(service.page)}>
                      <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]">
                        Learn More & Book
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why Choose Boutique Services */}
        <Card className="bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white border-none">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold text-center mb-8">Why Choose Boutique Services?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-[#E5C089]" />
                <h3 className="font-semibold mb-2">Rapid Turnaround</h3>
                <p className="text-blue-100 text-sm">
                  Get expert guidance when you need it most, with fast turnaround times
                </p>
              </div>
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-[#E5C089]" />
                <h3 className="font-semibold mb-2">Tailored Expertise</h3>
                <p className="text-blue-100 text-sm">
                  Work directly with experienced consultants who understand your context
                </p>
              </div>
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-[#E5C089]" />
                <h3 className="font-semibold mb-2">Actionable Results</h3>
                <p className="text-blue-100 text-sm">
                  Walk away with clear guidance, not generic advice
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}