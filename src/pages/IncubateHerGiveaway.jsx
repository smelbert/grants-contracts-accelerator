import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, CheckCircle2, XCircle, AlertCircle, Trophy, Send, LogOut } from 'lucide-react';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { toast } from 'sonner';

export default function IncubateHerGiveaway() {
  const queryClient = useQueryClient();
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments.find(e => e.cohort_id) || enrollments[0];
    },
    enabled: !!user?.email
  });

  const { data: cohort } = useQuery({
    queryKey: ['cohort', enrollment?.cohort_id],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({ id: enrollment.cohort_id });
      return cohorts[0];
    },
    enabled: !!enrollment?.cohort_id
  });

  const { data: existingApplication } = useQuery({
    queryKey: ['giveaway-application', user?.email],
    queryFn: async () => {
      const apps = await base44.entities.GiveawayEligiblePool.filter({ participant_email: user.email });
      return apps[0];
    },
    enabled: !!user?.email
  });

  // Check for completed assessments from ProgramAssessment records
  const { data: assessments } = useQuery({
    queryKey: ['assessments', enrollment?.id],
    queryFn: async () => {
      return await base44.entities.ProgramAssessment.filter({ enrollment_id: enrollment.id });
    },
    enabled: !!enrollment?.id
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.GiveawayEligiblePool.create({
        participant_email: user.email,
        participant_name: user.full_name,
        enrollment_id: enrollment?.id,
        pre_assessment_completed: preCompleted,
        post_assessment_completed: postCompleted,
        program_evaluation_completed: evalCompleted,
        applied_date: new Date().toISOString(),
        status: 'pending_review'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['giveaway-application']);
      setApplicationSubmitted(true);
      toast.success('Interest submitted! You will be notified of next steps.');
    }
  });

  // Derive completion from both enrollment flags and actual assessment records
  const preCompleted = enrollment?.pre_assessment_completed ||
    assessments?.some(a => a.assessment_type === 'pre' && !a.is_draft);
  const postCompleted = enrollment?.post_assessment_completed ||
    assessments?.some(a => a.assessment_type === 'post' && !a.is_draft);
  const evalCompleted = enrollment?.program_evaluation_completed ||
    assessments?.some(a => a._form_type === 'evaluation' || a.assessment_type === 'evaluation');

  const requiredItems = [
    { label: 'Pre-Assessment', met: !!preCompleted },
    { label: 'Post-Assessment', met: !!postCompleted },
    { label: 'Program Evaluation', met: !!evalCompleted },
  ];
  const allRequiredMet = requiredItems.every(r => r.met);
  const isWinner = enrollment?.giveaway_winner || false;
  const alreadyApplied = existingApplication || applicationSubmitted;

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader title="Program Giveaway" subtitle="Up to 20 applicants will be selected" />

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {isWinner && (
          <Card className="border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 via-white to-yellow-50 shadow-xl">
            <CardContent className="pt-8 text-center">
              <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-yellow-900 mb-2">🎉 CONGRATULATIONS! 🎉</h2>
              <p className="text-xl text-yellow-800 font-semibold">You're a Winner!</p>
              <div className="mt-4 bg-[#143A50] text-white rounded-lg p-4">
                <p className="font-semibold mb-2">📧 Next Steps</p>
                <p className="text-sm">An EIS team member will contact you within 48 hours to begin your grant writing journey!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prize Info */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-2xl"><Gift className="w-6 h-6" /> About the Grand Prize</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-gradient-to-br from-[#143A50]/5 to-[#E5C089]/10 border-2 border-[#E5C089] rounded-xl p-6">
              <p className="text-slate-800 text-lg leading-relaxed">
                {cohort?.giveaway_prize_description || 'Comprehensive grant writing support for a non-federal funding opportunity — including personalized funder research, narrative development, budget preparation, and submission guidance.'}
              </p>
            </div>
            <Alert className="mt-4 border-[#AC1A5B] bg-[#AC1A5B]/5">
              <AlertCircle className="w-5 h-5 text-[#AC1A5B]" />
              <AlertDescription>
                <strong className="text-[#AC1A5B]">Important:</strong> Federal grants are excluded. Up to 20 applicants will be selected.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Required Status */}
        <Card className={allRequiredMet ? 'border-2 border-green-400' : 'border-2 border-amber-300'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {allRequiredMet ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
              Required Completions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {requiredItems.map((req) => (
              <div key={req.label} className={`flex items-center gap-3 p-3 rounded-lg ${req.met ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                {req.met ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                <span className={`font-medium ${req.met ? 'text-slate-800' : 'text-amber-800'}`}>{req.label}</span>
                {req.met
                  ? <Badge className="ml-auto bg-green-100 text-green-800">Complete</Badge>
                  : <Badge className="ml-auto bg-amber-100 text-amber-800">Pending</Badge>}
              </div>
            ))}
            {!allRequiredMet && (
              <p className="text-sm text-amber-700 font-medium mt-2">
                ⚠️ Please complete all three required items before submitting your interest.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Application */}
        {alreadyApplied ? (
          <Card className="border-2 border-green-400 bg-green-50">
            <CardContent className="pt-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Interest Submitted!</h3>
              <p className="text-green-700">
                Your giveaway interest has been received. You'll be notified of the next steps.
              </p>
              {existingApplication?.applied_date && (
                <p className="text-sm text-green-600 mt-2">Submitted: {new Date(existingApplication.applied_date).toLocaleDateString()}</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#AC1A5B]" />
                Submit Your Interest
              </CardTitle>
              <p className="text-sm text-slate-600">
                Complete all three required items above, then click the button below to enter the giveaway pool.
              </p>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="w-full bg-[#AC1A5B] hover:bg-[#8e1549] text-white"
                disabled={!allRequiredMet || submitApplicationMutation.isPending}
                onClick={() => submitApplicationMutation.mutate()}
              >
                <Send className="w-5 h-5 mr-2" />
                {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit My Interest'}
              </Button>
              {!allRequiredMet && (
                <p className="text-xs text-slate-500 text-center mt-3">
                  Complete your Pre-Assessment, Post-Assessment, and Program Evaluation to unlock this button.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rules */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white rounded-t-xl">
            <CardTitle>📋 Eligibility Requirements</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-sm text-slate-600">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Required to Enter</h4>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-[#143A50] font-bold">✓</span><span>Complete the pre-assessment</span></li>
                <li className="flex gap-2"><span className="text-[#143A50] font-bold">✓</span><span>Complete the post-assessment</span></li>
                <li className="flex gap-2"><span className="text-[#143A50] font-bold">✓</span><span>Complete the program evaluation</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Selection</h4>
              <p>Up to 20 applicants will be selected. The winner will be announced via email and notified in the portal.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Terms</h4>
              <ul className="space-y-1">
                <li>• Prize is non-transferable, no cash value</li>
                <li>• Federal grant opportunities excluded</li>
                <li>• Winner must initiate within 60 days of notification</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <CoBrandedFooter />
    </div>
  );
}