import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, CheckCircle2, XCircle, AlertCircle, Trophy } from 'lucide-react';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';

export default function IncubateHerGiveaway() {
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
      const cohorts = await base44.entities.ProgramCohort.filter({
        id: enrollment.cohort_id
      });
      return cohorts[0];
    },
    enabled: !!enrollment?.cohort_id
  });

  const giveawayRevealed = cohort?.giveaway_revealed || false;

  if (!giveawayRevealed) {
    return (
      <div className="min-h-screen bg-slate-50">
        <CoBrandedHeader 
          title="Program Giveaway"
          subtitle="Exclusive opportunity for program completers"
        />

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Card className="text-center py-12 border-2 border-dashed border-[#E5C089] bg-gradient-to-br from-[#E5C089]/10 to-white">
            <CardContent>
              <div className="relative inline-block mb-6">
                <Gift className="w-20 h-20 text-[#AC1A5B] animate-pulse" />
                <div className="absolute -top-2 -right-2">
                  <span className="flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#AC1A5B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-[#AC1A5B]"></span>
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#143A50] mb-3">
                Something Special is Coming...
              </h3>
              <p className="text-slate-700 text-lg mb-4">
                An exciting giveaway opportunity awaits! 
              </p>
              <p className="text-slate-600 max-w-lg mx-auto">
                Details will be revealed during your final program session. Focus on completing all program requirements to ensure your eligibility!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Get Ready to Compete!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-slate-700">
                  To be eligible for the giveaway, make sure you complete:
                </p>
                <div className="grid gap-3">
                  {[
                    'Attend all program sessions',
                    'Complete pre & post assessments',
                    'Finish your one-on-one consultation',
                    'Submit all required documents',
                    'Complete the workbook exercises'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-[#143A50] flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-[#E5C089]/20 border border-[#E5C089] rounded-lg">
                  <p className="text-sm text-[#143A50] font-semibold text-center">
                    🌟 Stay engaged and complete the program to maximize your chances! 🌟
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <CoBrandedFooter />
      </div>
    );
  }

  const isEligible = enrollment?.giveaway_eligible || false;
  const isWinner = enrollment?.giveaway_winner || false;
  const programComplete = enrollment?.program_completed || false;

  const eligibilityRequirements = [
    {
      requirement: 'Complete all program sessions',
      met: enrollment?.attendance_complete || false
    },
    {
      requirement: 'Complete pre and post assessments',
      met: (enrollment?.pre_assessment_completed && enrollment?.post_assessment_completed) || false
    },
    {
      requirement: 'Complete one-on-one consultation',
      met: enrollment?.consultation_completed || false
    },
    {
      requirement: 'Submit required documents',
      met: enrollment?.documents_uploaded || false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Program Giveaway"
        subtitle="Exclusive opportunity for program completers"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {isWinner && (
          <Card className="border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 via-white to-yellow-50 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="relative inline-block mx-auto mb-4">
                <Trophy className="w-24 h-24 text-yellow-500 drop-shadow-lg" />
                <div className="absolute inset-0 animate-ping">
                  <Trophy className="w-24 h-24 text-yellow-400 opacity-50" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-yellow-900">
                🎉 CONGRATULATIONS! 🎉
              </CardTitle>
              <p className="text-xl text-yellow-800 font-semibold mt-2">
                You're the Grand Prize Winner!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white border-2 border-yellow-300 rounded-lg p-6">
                <h4 className="font-bold text-yellow-900 text-lg mb-3">🏆 Your Prize:</h4>
                <p className="text-yellow-800 text-lg mb-4 leading-relaxed">
                  {cohort?.giveaway_prize_description || 'Comprehensive grant writing support for a non-federal funding opportunity, including personalized funder research, narrative development, budget preparation, and submission guidance.'}
                </p>
              </div>
              
              <div className="bg-[#143A50] text-white rounded-lg p-4 text-center">
                <p className="font-semibold text-lg mb-2">📧 Next Steps</p>
                <p>
                  An EIS team member will contact you within 48 hours to schedule your first strategy session and begin your grant writing journey!
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-yellow-700 text-sm mt-4">
                <span className="animate-pulse">🌟</span>
                <span>You earned this through your dedication and hard work!</span>
                <span className="animate-pulse">🌟</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Gift className="w-6 h-6" />
              About the Grand Prize
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#143A50]/5 to-[#E5C089]/10 border-2 border-[#E5C089] rounded-xl p-6">
                <h4 className="font-bold text-[#143A50] text-xl mb-3 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-[#AC1A5B]" />
                  The Prize
                </h4>
                <p className="text-slate-800 text-lg leading-relaxed">
                  {cohort?.giveaway_prize_description || 'One lucky program completer will receive comprehensive grant writing support for a non-federal funding opportunity. This includes personalized assistance in identifying suitable funders, developing a compelling narrative, and completing the full application process.'}
                </p>
              </div>

              <div className="bg-white border-2 border-[#E5C089] rounded-lg p-6">
                <h4 className="font-bold text-[#143A50] mb-4 text-lg">✨ What's Included:</h4>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-[#E5C089]/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#143A50] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Personalized Funder Research</p>
                      <p className="text-sm text-slate-600">Identify the perfect funding opportunities for your organization</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#E5C089]/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#143A50] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Expert Strategy Session</p>
                      <p className="text-sm text-slate-600">One-on-one consultation with EIS grant writing specialist</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#E5C089]/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#143A50] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Full Narrative Development</p>
                      <p className="text-sm text-slate-600">Compelling grant narrative crafted with your unique story</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#E5C089]/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#143A50] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Budget Preparation & Justification</p>
                      <p className="text-sm text-slate-600">Professional budget with detailed justifications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#E5C089]/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#143A50] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Submission Guidance</p>
                      <p className="text-sm text-slate-600">Final review and step-by-step submission support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Alert className="border-[#AC1A5B] bg-[#AC1A5B]/5">
              <AlertCircle className="w-5 h-5 text-[#AC1A5B]" />
              <AlertDescription className="text-slate-800">
                <strong className="text-[#AC1A5B]">Important Note:</strong> This prize is for non-federal funding opportunities only (state/local government, foundations, corporate giving, etc.). Federal grants are not included.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className={isEligible ? 'border-4 border-green-500 shadow-lg' : 'border-2 border-slate-300'}>
          <CardHeader className={isEligible ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-slate-50'}>
            <div className="flex items-center justify-between">
              <CardTitle className={isEligible ? 'text-white text-xl' : 'text-slate-900 text-xl'}>
                Your Eligibility Status
              </CardTitle>
              {isEligible ? (
                <Badge className="bg-white text-green-600 text-base px-4 py-2">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  ✨ Eligible for Drawing!
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-600 text-base px-4 py-2">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  In Progress
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {eligibilityRequirements.map((req, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    req.met ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  {req.met ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={req.met ? 'text-slate-800 font-medium' : 'text-slate-600'}>
                    {req.requirement}
                  </span>
                </div>
              ))}
            </div>

            {isEligible ? (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-center">
                <p className="text-lg font-bold mb-2">🎉 You're Entered in the Drawing! 🎉</p>
                <p className="text-sm opacity-90">
                  The winner will be announced during the final session. Good luck!
                </p>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-[#AC1A5B]/10 border-2 border-[#AC1A5B] rounded-lg">
                <p className="text-[#AC1A5B] font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Complete the remaining requirements
                </p>
                <p className="text-slate-700 text-sm">
                  Finish all requirements above to become eligible for the giveaway drawing and increase your chances of winning!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
            <CardTitle className="text-xl">📋 Official Giveaway Rules</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Eligibility Requirements</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#143A50] font-bold mt-1">✓</span>
                  <span>Complete all three program sessions with at least 80% attendance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#143A50] font-bold mt-1">✓</span>
                  <span>Successfully complete both pre-assessment and post-assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#143A50] font-bold mt-1">✓</span>
                  <span>Participate in your scheduled one-on-one consultation with EIS staff</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#143A50] font-bold mt-1">✓</span>
                  <span>Submit all required documents (organizational overview, budget, case for support, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#143A50] font-bold mt-1">✓</span>
                  <span>Must be in good standing with no program violations</span>
                </li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-slate-900 mb-3">Winner Selection Process</h4>
              <div className="space-y-3 text-slate-700 text-sm">
                <p>
                  <strong className="text-slate-900">Random Drawing:</strong> All eligible participants who meet the requirements above will be entered into a random drawing. The selection will be conducted by EIS staff using a fair and transparent randomization method.
                </p>
                <p>
                  <strong className="text-slate-900">Announcement:</strong> The winner will be announced during the final program session and will receive follow-up communication via email within 48 hours.
                </p>
                <p>
                  <strong className="text-slate-900">Redemption Period:</strong> Winner must initiate the grant writing process within 60 days of notification. The support must be used within 6 months of award notification.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-slate-900 mb-3">Terms & Conditions</h4>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#E5C089] mt-1">•</span>
                  <span>Prize is non-transferable and has no cash value</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E5C089] mt-1">•</span>
                  <span>Federal grant opportunities are excluded from this prize</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E5C089] mt-1">•</span>
                  <span>Winner must collaborate actively with EIS staff throughout the grant writing process</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E5C089] mt-1">•</span>
                  <span>EIS will provide support and guidance, but funding approval is not guaranteed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E5C089] mt-1">•</span>
                  <span>This opportunity focuses on building capacity and readiness, not guaranteed outcomes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E5C089] mt-1">•</span>
                  <span>Winner agrees to participate in a follow-up case study/testimonial if selected</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}