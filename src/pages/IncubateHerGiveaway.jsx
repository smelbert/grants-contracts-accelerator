import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, CheckCircle2, XCircle, AlertCircle, Trophy, Send } from 'lucide-react';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { toast } from 'sonner';

export default function IncubateHerGiveaway() {
  const queryClient = useQueryClient();
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [selfReport, setSelfReport] = useState({
    sessions_attended_live: '',
    videos_watched: '',
    workbook_percent: '',
    has_documents: false,
    additional_notes: ''
  });

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
      return enrollments[0];
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

  // Check for existing giveaway application
  const { data: existingApplication } = useQuery({
    queryKey: ['giveaway-application', user?.email],
    queryFn: async () => {
      const apps = await base44.entities.GiveawayEligiblePool.filter({ participant_email: user.email });
      return apps[0];
    },
    enabled: !!user?.email
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      // Save self-report to giveaway pool
      await base44.entities.GiveawayEligiblePool.create({
        participant_email: user.email,
        participant_name: user.full_name,
        enrollment_id: enrollment?.id,
        sessions_attended_live: selfReport.sessions_attended_live,
        videos_watched: selfReport.videos_watched,
        workbook_percent: selfReport.workbook_percent,
        has_documents: selfReport.has_documents,
        additional_notes: selfReport.additional_notes,
        pre_assessment_completed: enrollment?.pre_assessment_completed || false,
        post_assessment_completed: enrollment?.post_assessment_completed || false,
        program_evaluation_completed: enrollment?.program_evaluation_completed || false,
        applied_date: new Date().toISOString(),
        status: 'pending_review'
      });

      // Notify admin
      await base44.integrations.Core.SendEmail({
        to: 'admin@elbertinnovativesolutions.org',
        subject: `IncubateHer Giveaway Application: ${user.full_name}`,
        body: `A new giveaway application has been submitted.\n\nParticipant: ${user.full_name} (${user.email})\n\nSelf-Report:\n- Sessions attended live: ${selfReport.sessions_attended_live}\n- Videos watched: ${selfReport.videos_watched}\n- Workbook completed: ${selfReport.workbook_percent}%\n- Documents completed: ${selfReport.has_documents ? 'Yes' : 'No'}\n- Pre-Assessment: ${enrollment?.pre_assessment_completed ? '✓' : '✗'}\n- Post-Assessment: ${enrollment?.post_assessment_completed ? '✓' : '✗'}\n\nNotes: ${selfReport.additional_notes || 'None'}\n\nLog in to review: https://app.elbertinnovativesolutions.org`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['giveaway-application']);
      setApplicationSubmitted(true);
      toast.success('Application submitted! You will be notified of next steps.');
    }
  });

  const giveawayRevealed = cohort?.giveaway_revealed || false;

  // Required items (non-negotiable)
  const requiredItems = [
    { label: 'Pre-Assessment', met: enrollment?.pre_assessment_completed || false },
    { label: 'Post-Assessment', met: enrollment?.post_assessment_completed || false },
  ];
  const allRequiredMet = requiredItems.every(r => r.met);

  const isWinner = enrollment?.giveaway_winner || false;
  const alreadyApplied = existingApplication || applicationSubmitted;

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader title="Program Giveaway" subtitle="Apply below — up to 20 applicants will be selected" />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
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
          <CardHeader className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white">
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
        <Card className={allRequiredMet ? 'border-2 border-green-400' : 'border-2 border-red-300'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {allRequiredMet ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
              Required Items (Must Complete to Apply)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {requiredItems.map((req) => (
              <div key={req.label} className={`flex items-center gap-3 p-3 rounded-lg ${req.met ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {req.met ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                <span className={`font-medium ${req.met ? 'text-slate-800' : 'text-red-700'}`}>{req.label}</span>
                {req.met ? <Badge className="ml-auto bg-green-100 text-green-800">Complete</Badge> : <Badge className="ml-auto bg-red-100 text-red-800">Incomplete</Badge>}
              </div>
            ))}
            {!allRequiredMet && (
              <p className="text-sm text-red-700 font-medium mt-2">
                ⚠️ You must complete all three required items before submitting your giveaway application.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        {alreadyApplied ? (
          <Card className="border-2 border-green-400 bg-green-50">
            <CardContent className="pt-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Application Submitted!</h3>
              <p className="text-green-700">
                Your giveaway application has been received. You'll be notified of the next steps.
              </p>
              {existingApplication?.applied_date && (
                <p className="text-sm text-green-600 mt-2">Submitted: {new Date(existingApplication.applied_date).toLocaleDateString()}</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className={!allRequiredMet ? 'opacity-60 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#AC1A5B]" />
                Giveaway Application
              </CardTitle>
              <p className="text-sm text-slate-600">
                Be honest — this helps us understand your journey. You can still apply even if you didn't complete everything. The three assessments above are the only non-negotiables.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session attendance */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  How many sessions did you attend <strong>in-person or online (live)?</strong>
                </label>
                <select
                  value={selfReport.sessions_attended_live}
                  onChange={(e) => setSelfReport(p => ({ ...p, sessions_attended_live: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143A50]"
                >
                  <option value="">Select...</option>
                  <option value="0">0 (watched recordings only)</option>
                  <option value="1">1 session</option>
                  <option value="2">2 sessions</option>
                  <option value="3">3 sessions (all of them)</option>
                </select>
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Approximately how many <strong>session recordings or videos</strong> did you watch?
                </label>
                <select
                  value={selfReport.videos_watched}
                  onChange={(e) => setSelfReport(p => ({ ...p, videos_watched: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143A50]"
                >
                  <option value="">Select...</option>
                  <option value="0">None</option>
                  <option value="1-2">1–2 videos</option>
                  <option value="3-5">3–5 videos</option>
                  <option value="6+">6 or more</option>
                </select>
              </div>

              {/* Workbook */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Approximately how much of the <strong>workbook</strong> did you complete? (Optional — not required)
                </label>
                <select
                  value={selfReport.workbook_percent}
                  onChange={(e) => setSelfReport(p => ({ ...p, workbook_percent: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143A50]"
                >
                  <option value="">Select...</option>
                  <option value="0">None / Just started</option>
                  <option value="25">About 25%</option>
                  <option value="50">About 50%</option>
                  <option value="75">About 75%</option>
                  <option value="100">Nearly all / complete</option>
                </select>
              </div>

              {/* Documents */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <Checkbox
                  id="has-docs"
                  checked={selfReport.has_documents}
                  onCheckedChange={(v) => setSelfReport(p => ({ ...p, has_documents: v }))}
                  className="mt-0.5"
                />
                <label htmlFor="has-docs" className="text-sm font-medium text-slate-700 cursor-pointer">
                  I have completed (or made significant progress on) the required documents for funding readiness.
                  <span className="block text-xs text-slate-500 mt-0.5">e.g., business overview, budget, capability statement, project description</span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Anything else you'd like us to know? <span className="font-normal text-slate-500">(Optional)</span>
                </label>
                <Textarea
                  placeholder="Share any context about your participation — e.g., you had prior commitments, dropped in and out, etc. Be honest!"
                  value={selfReport.additional_notes}
                  onChange={(e) => setSelfReport(p => ({ ...p, additional_notes: e.target.value }))}
                  rows={4}
                />
              </div>

              <Button
                size="lg"
                className="w-full bg-[#AC1A5B] hover:bg-[#8e1549] text-white"
                disabled={!selfReport.sessions_attended_live || !selfReport.videos_watched || !selfReport.workbook_percent || submitApplicationMutation.isPending}
                onClick={() => submitApplicationMutation.mutate()}
              >
                <Send className="w-5 h-5 mr-2" />
                {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit My Giveaway Application'}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                By submitting, you confirm that your responses are honest and accurate.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Rules */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
            <CardTitle>📋 Official Giveaway Rules</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-sm text-slate-600">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Non-Negotiable Requirements</h4>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-[#143A50] font-bold">✓</span><span>Complete the pre-assessment</span></li>
                <li className="flex gap-2"><span className="text-[#143A50] font-bold">✓</span><span>Complete the post-assessment</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Optional (but noted in your application)</h4>
              <ul className="space-y-1">
                <li className="flex gap-2"><span className="text-[#E5C089]">⭐</span><span>Attending sessions (in-person or online)</span></li>
                <li className="flex gap-2"><span className="text-[#E5C089]">⭐</span><span>Watching session recordings</span></li>
                <li className="flex gap-2"><span className="text-[#E5C089]">⭐</span><span>Workbook completion (any amount helps)</span></li>
                <li className="flex gap-2"><span className="text-[#E5C089]">⭐</span><span>Document completion</span></li>
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