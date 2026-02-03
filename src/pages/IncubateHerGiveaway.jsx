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
          subtitle="Opportunity for program completers"
        />

        <div className="max-w-4xl mx-auto p-6">
          <Card className="text-center py-12">
            <CardContent>
              <Gift className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Giveaway Not Yet Revealed
              </h3>
              <p className="text-slate-600">
                Details about the program giveaway will be shared by your facilitator during the final session.
              </p>
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
          <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <Trophy className="w-6 h-6" />
                Congratulations! You're the Winner!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-800 mb-4">
                You have been selected as the winner of the {cohort?.giveaway_prize_description || 'program giveaway'}!
              </p>
              <p className="text-yellow-800">
                An EIS team member will contact you shortly with next steps.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#143A50]" />
              About the Giveaway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">
              {cohort?.giveaway_prize_description || 'As a program completer, you are eligible for our exclusive giveaway opportunity.'}
            </p>
            
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Important:</strong> Federal grants are excluded from this opportunity. This giveaway is for non-federal funding opportunities only.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className={isEligible ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-slate-300'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Eligibility Status</CardTitle>
              {isEligible ? (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Eligible
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-600">
                  <XCircle className="w-4 h-4 mr-1" />
                  Not Yet Eligible
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eligibilityRequirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {req.met ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-300 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={req.met ? 'text-slate-700' : 'text-slate-500'}>
                    {req.requirement}
                  </span>
                </div>
              ))}
            </div>

            {!isEligible && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-slate-700 text-sm">
                  Complete the items above to become eligible for the giveaway drawing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giveaway Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-[#E5C089] mt-1">•</span>
                <span>Must complete all program requirements to be eligible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E5C089] mt-1">•</span>
                <span>Winner will be selected via random drawing from eligible participants</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E5C089] mt-1">•</span>
                <span>Federal grants are excluded from this opportunity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E5C089] mt-1">•</span>
                <span>Winner will be announced during the final program session</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E5C089] mt-1">•</span>
                <span>This is a readiness-focused program; no funding is guaranteed</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}