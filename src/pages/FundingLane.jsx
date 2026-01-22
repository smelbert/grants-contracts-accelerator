import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, ArrowLeft, CheckCircle2, Circle, BookOpen, FileText, 
  Search, Users, AlertTriangle, Sparkles, ExternalLink
} from 'lucide-react';
import CivicToolkit from '@/components/civic/CivicToolkit';

const LANE_CONFIG = {
  grants: {
    title: 'Grants & Foundations',
    description: 'Foundation grants, government grants, and fellowships',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    checklist: [
      { id: 'nonprofit_status', label: '501(c)(3) status or fiscal sponsor', critical: true },
      { id: 'board', label: 'Active board of directors', critical: true },
      { id: 'mission', label: 'Clear mission statement', critical: true },
      { id: 'programs', label: 'Defined programs or services', critical: false },
      { id: 'budget', label: 'Annual operating budget', critical: false },
      { id: 'financials', label: 'Financial statements or 990', critical: false },
      { id: 'track_record', label: 'Track record of impact', critical: false },
    ],
  },
  contracts: {
    title: 'Contracts & RFPs',
    description: 'Government contracts and procurement opportunities',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    checklist: [
      { id: 'legal_entity', label: 'Registered business entity', critical: true },
      { id: 'ein', label: 'EIN/Tax ID number', critical: true },
      { id: 'duns', label: 'DUNS/UEI number', critical: true },
      { id: 'sam', label: 'SAM.gov registration', critical: true },
      { id: 'capability', label: 'Capability statement', critical: false },
      { id: 'past_performance', label: 'Past performance documentation', critical: false },
      { id: 'insurance', label: 'Required insurance coverage', critical: false },
    ],
  },
  donors: {
    title: 'Donors & Philanthropy',
    description: 'Individual donors, major gifts, and fundraising',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    checklist: [
      { id: 'story', label: 'Compelling organizational story', critical: true },
      { id: 'case', label: 'Case for support document', critical: false },
      { id: 'impact', label: 'Impact metrics and stories', critical: false },
      { id: 'donor_list', label: 'Donor tracking system', critical: false },
      { id: 'acknowledgment', label: 'Thank you/acknowledgment process', critical: false },
      { id: 'website', label: 'Donation-enabled website', critical: false },
    ],
  },
  public_funds: {
    title: 'Public Funding & Civic',
    description: 'City and county funding, civic engagement',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    checklist: [
      { id: 'local_presence', label: 'Established local presence', critical: true },
      { id: 'community_need', label: 'Documented community need', critical: true },
      { id: 'relationships', label: 'Relationships with local officials', critical: false },
      { id: 'coalition', label: 'Community coalition or partnerships', critical: false },
      { id: 'advocacy', label: 'Understanding of advocacy vs lobbying', critical: false },
    ],
  },
};

export default function FundingLanePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const lane = urlParams.get('lane') || 'grants';
  const [activeTab, setActiveTab] = useState('overview');
  const [completedItems, setCompletedItems] = useState([]);

  const config = LANE_CONFIG[lane];

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const organization = organizations?.[0];

  const toggleItem = (itemId) => {
    setCompletedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const progress = config ? Math.round((completedItems.length / config.checklist.length) * 100) : 0;

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid funding lane</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-${config.color}-50/30`}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Link 
            to={createPageUrl('Home')}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`h-2 w-24 bg-gradient-to-r ${config.gradient} rounded-full mb-4`} />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {config.title}
          </h1>
          <p className="text-slate-500 mt-1">{config.description}</p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Readiness Progress</span>
                <span className={`text-sm font-semibold text-${config.color}-600`}>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {progress < 50 && (
                <p className="text-xs text-slate-500 mt-2">
                  Complete critical items first to improve your readiness score.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border border-slate-200 p-1 mb-6 w-full justify-start">
              <TabsTrigger value="overview" className={`data-[state=active]:bg-${config.color}-600 data-[state=active]:text-white`}>
                Overview
              </TabsTrigger>
              <TabsTrigger value="checklist" className={`data-[state=active]:bg-${config.color}-600 data-[state=active]:text-white`}>
                Checklist
              </TabsTrigger>
              {lane === 'public_funds' && (
                <TabsTrigger value="toolkit" className={`data-[state=active]:bg-${config.color}-600 data-[state=active]:text-white`}>
                  Civic Toolkit
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to={createPageUrl(`Opportunities?lane=${lane}`)}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-6 text-center">
                        <Search className={`w-8 h-8 mx-auto text-${config.color}-600 mb-2`} />
                        <p className="text-sm font-medium">Find Opportunities</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to={createPageUrl('Learning')}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-6 text-center">
                        <BookOpen className={`w-8 h-8 mx-auto text-${config.color}-600 mb-2`} />
                        <p className="text-sm font-medium">Learn More</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to={createPageUrl('BoilerplateBuilder')}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-6 text-center">
                        <Sparkles className={`w-8 h-8 mx-auto text-${config.color}-600 mb-2`} />
                        <p className="text-sm font-medium">AI Writer</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to={createPageUrl('Community')}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-6 text-center">
                        <Users className={`w-8 h-8 mx-auto text-${config.color}-600 mb-2`} />
                        <p className="text-sm font-medium">Get Support</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* Education Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What You Need to Know</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate max-w-none text-sm">
                    {lane === 'grants' && (
                      <>
                        <p>Grants are non-repayable funds from foundations, corporations, or government agencies. They typically:</p>
                        <ul>
                          <li>Require 501(c)(3) status or a fiscal sponsor</li>
                          <li>Have specific eligibility criteria and reporting requirements</li>
                          <li>Take 3-12 months from application to funding</li>
                          <li>Often require matching funds or sustainability plans</li>
                        </ul>
                      </>
                    )}
                    {lane === 'contracts' && (
                      <>
                        <p>Government contracts are agreements to provide goods or services. Key considerations:</p>
                        <ul>
                          <li>Registration requirements (SAM.gov, certifications)</li>
                          <li>Compliance and reporting obligations</li>
                          <li>Competitive bidding processes</li>
                          <li>Performance-based deliverables</li>
                        </ul>
                      </>
                    )}
                    {lane === 'donors' && (
                      <>
                        <p>Individual and major donor fundraising builds sustainable support:</p>
                        <ul>
                          <li>Relationship-focused, not transactional</li>
                          <li>Requires consistent communication</li>
                          <li>Often provides unrestricted funding</li>
                          <li>Takes time to cultivate but provides stability</li>
                        </ul>
                      </>
                    )}
                    {lane === 'public_funds' && (
                      <>
                        <p>Public funding comes through civic engagement and government relationships:</p>
                        <ul>
                          <li>Understand the difference between advocacy and lobbying</li>
                          <li>Build relationships before you need funding</li>
                          <li>Engage in public comment periods</li>
                          <li>Coalition building strengthens your voice</li>
                        </ul>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="checklist">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Readiness Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {config.checklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                          completedItems.includes(item.id)
                            ? `bg-${config.color}-50 border-${config.color}-200`
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {completedItems.includes(item.id) ? (
                            <CheckCircle2 className={`w-5 h-5 text-${config.color}-600`} />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                          <span className={completedItems.includes(item.id) ? 'text-slate-700' : 'text-slate-600'}>
                            {item.label}
                          </span>
                        </div>
                        {item.critical && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            Critical
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {lane === 'public_funds' && (
              <TabsContent value="toolkit">
                <CivicToolkit />
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}