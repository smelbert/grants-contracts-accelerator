import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, FileText, History, Search } from 'lucide-react';
import DocumentCoachTab from '@/components/ai/DocumentCoachTab';
import PreviousSubmissionsTab from '@/components/ai/PreviousSubmissionsTab';
import GrantFitEvaluator from '@/components/ai/GrantFitEvaluator';

export default function AIDocumentReview() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: orgProfile } = useQuery({
    queryKey: ['org-profile', user?.email],
    queryFn: async () => {
      const orgs = await base44.entities.Organization.filter({ primary_contact_email: user.email });
      return orgs[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: enrollment } = useQuery({
    queryKey: ['incubateher-enrollment-review', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({ participant_email: user.email, role: 'participant' });
      return enrollments.find(e => e.cohort_id) || null;
    },
    enabled: !!user?.email,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[#E5C089]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#143A50]">AI Document Coach</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Expert-level review from a coach who's written federal, state, local & corporate grants — personalized to your organization.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <Tabs defaultValue="company_docs">
          <TabsList className="w-full mb-8 h-auto p-1 bg-slate-100 rounded-xl grid grid-cols-3 gap-1">
            <TabsTrigger
              value="company_docs"
              className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#143A50] text-slate-500"
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Company Documents</span>
            </TabsTrigger>
            <TabsTrigger
              value="previous_submissions"
              className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#143A50] text-slate-500"
            >
              <History className="w-4 h-4" />
              <span className="font-medium">Previous Submissions</span>
            </TabsTrigger>
            <TabsTrigger
              value="should_i_apply"
              className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#AC1A5B] text-slate-500"
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">Should I Apply?</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Company Documents */}
          <TabsContent value="company_docs">
            <div className="text-xs text-slate-400 mb-5 px-1">
              Paste any current or draft document — proposals, capability statements, program descriptions, budget narratives, needs statements, and more. The AI coach reviews it like a seasoned grant writer and program officer.
            </div>
            <DocumentCoachTab orgProfile={orgProfile} enrollment={enrollment} />
          </TabsContent>

          {/* Tab 2: Previous Submissions */}
          <TabsContent value="previous_submissions">
            <div className="text-xs text-slate-400 mb-5 px-1">
              Share a grant, proposal, pitch, or contract you've already submitted — won, lost, or pending. Get a full post-mortem coaching review to understand what worked, what hurt, and how to do better next time.
            </div>
            <PreviousSubmissionsTab orgProfile={orgProfile} />
          </TabsContent>

          {/* Tab 3: Should I Apply? */}
          <TabsContent value="should_i_apply">
            <div className="text-xs text-slate-400 mb-5 px-1">
              Paste the URL or text of a grant opportunity, RFP, or contract. The AI evaluates your fit and tells you whether to apply, consider, or skip — based on your organization profile.
            </div>
            <GrantFitEvaluator userOrgProfile={orgProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}