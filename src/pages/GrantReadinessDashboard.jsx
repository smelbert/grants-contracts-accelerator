import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReadinessScoreCard from '@/components/dashboard/ReadinessScoreCard';
import DocumentTrackerPanel from '@/components/dashboard/DocumentTrackerPanel';
import GrantPipelineTracker from '@/components/dashboard/GrantPipelineTracker';
import EligibilityAnalyzer from '@/components/dashboard/EligibilityAnalyzer';
import StrategicGuidancePanel from '@/components/dashboard/StrategicGuidancePanel';
import CuratedResourcesPanel from '@/components/dashboard/CuratedResourcesPanel';
import ProgressChart from '@/components/dashboard/ProgressChart';
import GrowthAnalytics from '@/components/dashboard/GrowthAnalytics';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GrantReadinessDashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organization } = useQuery({
    queryKey: ['organization', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const orgs = await base44.entities.Organization.filter({
        primary_contact_email: user.email
      });
      return orgs[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: readinessProfile } = useQuery({
    queryKey: ['readiness-profile', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      // Fetch could be extended if ReadinessProfile has organization link
      return null; // Placeholder for now
    },
    enabled: !!organization?.id,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ProgramAssessment.filter({
        participant_email: user.email
      }, '-created_date', 10);
    },
    enabled: !!user?.email,
  });

  const { data: checklist } = useQuery({
    queryKey: ['readiness-checklist', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      const checklists = await base44.entities.ReadinessChecklist.filter({
        funding_lane: 'grants'
      });
      return checklists[0] || null;
    },
    enabled: !!organization?.id,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      return await base44.entities.Project.filter({
        organization_id: organization.id
      }, '-created_date', 20);
    },
    enabled: !!organization?.id,
  });

  const { data: fundingOpportunities = [] } = useQuery({
    queryKey: ['funding-opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.list('-posted_date', 100),
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Grant Readiness Dashboard</h1>
            <p className="text-slate-600 mt-1">Assess your organization's readiness for funding</p>
          </div>
          <Link to={createPageUrl('FundingReadinessAssessment')}>
            <Button className="bg-[#143A50] hover:bg-[#1E4F58]">
              <ChevronRight className="w-4 h-4 mr-2" />
              Take Assessment
            </Button>
          </Link>
        </div>

        {/* Alert if no organization profile */}
        {!organization && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900">Organization Profile Needed</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Complete your organization profile to unlock full readiness analytics.
                  </p>
                  <Link to={createPageUrl('Profile')} className="mt-3 inline-block">
                    <Button size="sm" variant="outline">Complete Profile</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phase 1: Core Readiness */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#143A50] text-white flex items-center justify-center text-sm font-bold">1</div>
            Your Readiness Profile
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ReadinessScoreCard readinessProfile={readinessProfile} assessments={assessments} />
            <div className="lg:col-span-2">
              <DocumentTrackerPanel checklist={checklist} />
            </div>
          </div>
        </div>

        {/* Curated Grant Opportunities from Memos */}
        <GrantMemoOpportunitiesPanel opportunities={fundingOpportunities} />

        {/* Phase 2: Discovery & Strategy */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#AC1A5B] text-white flex items-center justify-center text-sm font-bold">2</div>
            Funding Strategy
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GrantPipelineTracker projects={projects} />
            <EligibilityAnalyzer organization={organization} fundingOpportunities={fundingOpportunities} />
          </div>
        </div>

        {/* Phase 3: Strategic Coaching */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1E4F58] text-white flex items-center justify-center text-sm font-bold">3</div>
            Strategic Coaching
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StrategicGuidancePanel organization={organization} readinessScore={Math.round(assessments.length > 0 ? assessments[assessments.length - 1].total_score || 0 : 0)} />
            <CuratedResourcesPanel readinessScore={Math.round(assessments.length > 0 ? assessments[assessments.length - 1].total_score || 0 : 0)} fundingLane={organization?.funding_lane || 'grants'} />
          </div>
        </div>

        {/* Phase 4: Performance Analytics */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E5C089] text-[#143A50] flex items-center justify-center text-sm font-bold">4</div>
            Performance Analytics
          </h2>

          <ProgressChart assessments={assessments} />
          <GrowthAnalytics projects={projects} readinessProfile={readinessProfile} assessments={assessments} />
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Active Projects</p>
              <p className="text-3xl font-bold text-[#143A50] mt-2">{projects.filter(p => ['planning', 'in_progress', 'review', 'submitted'].includes(p.status)).length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Documents Complete</p>
              <p className="text-3xl font-bold text-[#143A50] mt-2">{checklist?.checklist_items?.filter(i => i.completed || i.status === 'approved').length || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Opportunities Found</p>
              <p className="text-3xl font-bold text-[#143A50] mt-2">{fundingOpportunities.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Assessments Completed</p>
              <p className="text-3xl font-bold text-[#143A50] mt-2">{assessments.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#143A50]" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to={createPageUrl('FundingReadinessAssessment')}>
                <div className="p-4 rounded-lg border border-slate-200 hover:border-[#143A50] hover:bg-slate-50 transition-all cursor-pointer">
                  <p className="font-medium text-slate-900">Take Readiness Assessment</p>
                  <p className="text-sm text-slate-600 mt-1">Get a personalized score and improvement recommendations</p>
                </div>
              </Link>

              <Link to={createPageUrl('Documents')}>
                <div className="p-4 rounded-lg border border-slate-200 hover:border-[#143A50] hover:bg-slate-50 transition-all cursor-pointer">
                  <p className="font-medium text-slate-900">Upload Documents</p>
                  <p className="text-sm text-slate-600 mt-1">Complete your document vault with required materials</p>
                </div>
              </Link>

              <Link to={createPageUrl('Opportunities')}>
                <div className="p-4 rounded-lg border border-slate-200 hover:border-[#143A50] hover:bg-slate-50 transition-all cursor-pointer">
                  <p className="font-medium text-slate-900">Browse Opportunities</p>
                  <p className="text-sm text-slate-600 mt-1">Search and save funding opportunities aligned with your readiness</p>
                </div>
              </Link>

              <Link to={createPageUrl('Learning')}>
                <div className="p-4 rounded-lg border border-slate-200 hover:border-[#143A50] hover:bg-slate-50 transition-all cursor-pointer">
                  <p className="font-medium text-slate-900">Learning Hub</p>
                  <p className="text-sm text-slate-600 mt-1">Access training and resources on grant writing</p>
                </div>
              </Link>

              <Link to={createPageUrl('GrantAssistant')}>
                <div className="p-4 rounded-lg border border-slate-200 hover:border-[#143A50] hover:bg-slate-50 transition-all cursor-pointer">
                  <p className="font-medium text-slate-900">AI Grant Assistant</p>
                  <p className="text-sm text-slate-600 mt-1">Get personalized guidance on your funding strategy</p>
                </div>
              </Link>

              <Link to={createPageUrl('Projects')}>
                <div className="p-4 rounded-lg border border-slate-200 hover:border-[#143A50] hover:bg-slate-50 transition-all cursor-pointer">
                  <p className="font-medium text-slate-900">Track Your Projects</p>
                  <p className="text-sm text-slate-600 mt-1">Manage grants, proposals, and deadlines in one place</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}