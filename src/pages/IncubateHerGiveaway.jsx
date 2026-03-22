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

  const { data: winnerEnrollment } = useQuery({
    queryKey: ['giveaway-winner', enrollment?.cohort_id],
    queryFn: async () => {
      const all = await base44.entities.ProgramEnrollment.filter({ cohort_id: enrollment.cohort_id, giveaway_winner: true });
      return all[0] || null;
    },
    enabled: !!cohort?.giveaway_revealed && !!enrollment?.cohort_id
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
  const alreadyApplied = !!existingApplication || applicationSubmitted;
  const [optedOut, setOptedOut] = useState(false);

  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.GiveawayEligiblePool.create({
        participant_email: user.email,
        participant_name: user.full_name || enrollment?.participant_name,
        enrollment_id: enrollment?.id,
        pre_assessment_completed: !!preCompleted,
        post_assessment_completed: !!postCompleted,
        program_evaluation_completed: !!evalCompleted,
        applied_date: new Date().toISOString(),
        status: 'pending_review'
      });
      // Also flag on enrollment
      if (enrollment?.id) {
        await base44.entities.ProgramEnrollment.update(enrollment.id, { giveaway_eligible: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['giveaway-application']);
      queryClient.invalidateQueries(['enrollment']);
      setApplicationSubmitted(true);
      toast.success('You\'ve been added to the giveaway pool!');
    }
  });

  // Auto-enroll when all 3 assessments complete and not already applied and not opted out
  useEffect(() => {
    if (
      allRequiredMet &&
      !alreadyApplied &&
      !optedOut &&
      !submitApplicationMutation.isPending &&
      enrollment?.id &&
      user?.email &&
      assessments !== undefined // data has loaded
    ) {
      submitApplicationMutation.mutate();
    }
  }, [allRequiredMet, alreadyApplied, optedOut, enrollment?.id, user?.email, assessments]);

  const optOutMutation = useMutation({
    mutationFn: async () => {
      if (existingApplication?.id) {
        await base44.entities.GiveawayEligiblePool.delete(existingApplication.id);
      }
      if (enrollment?.id) {
        await base44.entities.ProgramEnrollment.update(enrollment.id, { giveaway_eligible: false });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['giveaway-application']);
      queryClient.invalidateQueries(['enrollment']);
      setOptedOut(true);
      setApplicationSubmitted(false);
      toast.success('You have been removed from the giveaway pool.');
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader title="Program Giveaway" subtitle="Up to 20 applicants will be selected" />

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Winner is YOU */}
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

        {/* Winner announced (someone else won) */}
        {cohort?.giveaway_revealed && winnerEnrollment && !isWinner && (
          <Card className="border-2 border-[#E5C089] bg-gradient-to-br from-[#143A50]/5 to-[#E5C089]/10 shadow-lg">
            <CardContent className="pt-8 text-center">
              <Trophy className="w-16 h-16 text-[#E5C089] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#143A50] mb-2">🏆 Giveaway Winner Announced!</h2>
              <p className="text-lg font-semibold text-[#AC1A5B] mb-1">{winnerEnrollment.participant_name}</p>
              <p className="text-slate-600 text-sm">Has been selected as the IncubateHer Giveaway winner!</p>
              <div className="mt-4 bg-[#143A50] text-white rounded-lg p-4 text-sm">
                Thank you to everyone who participated. Your dedication to building your funding readiness is truly inspiring!
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

        {/* Application Status */}
        {cohort?.giveaway_revealed ? (
          <Card className="border-2 border-slate-300 bg-slate-50">
            <CardContent className="pt-6 pb-6 text-center">
              <Trophy className="w-10 h-10 text-[#E5C089] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">Giveaway Closed</h3>
              <p className="text-slate-500 text-sm">The winner has been selected. The giveaway is now closed.</p>
            </CardContent>
          </Card>
        ) : optedOut ? (
          <Card className="border-2 border-slate-300 bg-slate-50">
            <CardContent className="pt-6 pb-6 text-center">
              <LogOut className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">You've Opted Out</h3>
              <p className="text-slate-500 text-sm mb-4">You are not currently in the giveaway pool. You can re-enter below.</p>
              <Button
                className="bg-[#AC1A5B] hover:bg-[#8e1549] text-white"
                onClick={() => { setOptedOut(false); submitApplicationMutation.mutate(); }}
                disabled={submitApplicationMutation.isPending}
              >
                <Gift className="w-4 h-4 mr-2" />
                Re-enter the Giveaway
              </Button>
            </CardContent>
          </Card>
        ) : alreadyApplied ? (
          <Card className="border-2 border-green-400 bg-green-50">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 mb-1">✅ You're In the Giveaway Pool!</h3>
                  <p className="text-green-700 text-sm">
                    Because you've completed all required assessments, you've been automatically entered. You'll be notified of the winner announcement.
                  </p>
                  {existingApplication?.applied_date && (
                    <p className="text-xs text-green-600 mt-1">Enrolled: {new Date(existingApplication.applied_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs text-slate-500 mb-2">Don't wish to participate?</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-500 border-slate-300 hover:text-red-600 hover:border-red-300"
                  onClick={() => optOutMutation.mutate()}
                  disabled={optOutMutation.isPending}
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  {optOutMutation.isPending ? 'Removing...' : 'Opt Out of Giveaway'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : submitApplicationMutation.isPending ? (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-green-700 font-medium">Adding you to the giveaway pool...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#AC1A5B]" />
                Enter the Giveaway
              </CardTitle>
              <p className="text-sm text-slate-600">
                Complete all three required items above to be automatically entered.
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
                {submitApplicationMutation.isPending ? 'Entering...' : 'Enter the Giveaway'}
              </Button>
              {!allRequiredMet && (
                <p className="text-xs text-slate-500 text-center mt-3">
                  Complete your Pre-Assessment, Post-Assessment, and Program Evaluation to be entered.
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