import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Award, Download, Star, Mail, Heart, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { toast } from 'sonner';

export default function IncubateHerCompletion() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: enrollment, refetch } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!user?.email
  });

  const { data: myAttendance = [] } = useQuery({
    queryKey: ['my-attendance-completion', enrollment?.id],
    queryFn: () => base44.entities.SessionAttendance.filter({ enrollment_id: enrollment.id }),
    enabled: !!enrollment?.id
  });

  const { data: workbookResponses = [] } = useQuery({
    queryKey: ['workbook-responses-completion', user?.email],
    queryFn: () => base44.entities.WorkbookResponse.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: assessmentRecords = [] } = useQuery({
    queryKey: ['all-assessments-completion', enrollment?.id],
    queryFn: () => base44.entities.ProgramAssessment.filter({ enrollment_id: enrollment.id }),
    enabled: !!enrollment?.id
  });

  const evaluationRecord = assessmentRecords.find(a => a._form_type === 'evaluation' || a.assessment_type === 'evaluation');
  const evaluationCompleted = !!evaluationRecord && !evaluationRecord.is_draft;

  const updateEnrollmentMutation = useMutation({
    mutationFn: async (updates) => {
      await base44.entities.ProgramEnrollment.update(enrollment.id, updates);
    },
    onSuccess: () => {
      refetch();
      toast.success('Progress updated');
    }
  });

  const sessionsAttended = myAttendance.filter(a => a.attended || a.watched_recording).length;
  const workbookCompleted = workbookResponses.filter(r => r.responses && Object.keys(r.responses).length > 0).length;

  // ─── REQUIRED milestones (non-negotiable) ───
  const requiredMilestones = [
    {
      id: 'pre_assessment',
      title: 'Pre-Assessment',
      description: 'Complete the pre-program readiness assessment',
      completed: enrollment?.pre_assessment_completed || false,
      selfSelect: false,
      link: '/IncubateHerPreAssessment'
    },
    {
      id: 'post_assessment',
      title: 'Post-Assessment',
      description: 'Complete the post-program assessment',
      completed: enrollment?.post_assessment_completed || false,
      selfSelect: false,
      link: '/IncubateHerPostAssessment'
    },
    {
      id: 'program_evaluation',
      title: 'Program Evaluation',
      description: 'Complete the program evaluation survey',
      completed: evaluationCompleted,
      selfSelect: false,
      link: '/IncubateHerEvaluation'
    }
  ];

  // ─── OPTIONAL milestones (self-reported / self-select) ───
  const optionalMilestones = [
    {
      id: 'attendance',
      title: 'Session Attendance',
      description: `Attend sessions in-person or watch recordings — tracked by admin (${sessionsAttended} session(s) counted so far)`,
      completed: sessionsAttended > 0,
      selfSelect: false,
      optional: true
    },
    {
      id: 'workbook',
      title: 'Workbook Exercises',
      description: `Complete workbook exercises — ${workbookCompleted} page(s) with responses`,
      completed: workbookCompleted > 0,
      selfSelect: false,
      optional: true,
      progress: workbookCompleted
    },
    {
      id: 'documents',
      title: 'Required Documents Completed',
      description: 'Self-report: check this box to confirm your required funding documents are ready',
      completed: enrollment?.documents_uploaded || false,
      selfSelect: true,
      optional: true
    }
  ];

  const completedRequired = requiredMilestones.filter(m => m.completed).length;
  const allRequiredComplete = completedRequired === requiredMilestones.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader
        title="Completion Tracker"
        subtitle="Track your progress toward program completion"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Deadline Banners */}
        <div className="space-y-3">
          <div className="bg-red-600 text-white rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-100" />
            <div>
              <p className="font-bold text-base">⏰ Assessment Deadline: March 10, 2026 at 5:00 PM</p>
              <p className="text-red-100 text-sm mt-1">
                Pre-assessments, post-assessments, and program evaluations must be submitted by <strong>March 10th at 5:00 PM</strong>.
              </p>
            </div>
          </div>
          <div className="bg-amber-600 text-white rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-100" />
            <div>
              <p className="font-bold text-base">📅 Consultation Request Deadline: March 16, 2026 at Midnight</p>
              <p className="text-amber-100 text-sm mt-1">
                All requests for one-on-one consultations must be submitted by <strong>March 16th at midnight</strong>. Once scheduled, consultations may take place anytime through <strong>May 2026</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Overall required progress */}
        <Card className="border-l-4 border-l-[#143A50]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Required Progress</CardTitle>
              <Badge variant="outline" className="text-lg px-4 py-1">
                {completedRequired} / {requiredMilestones.length} Required
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={Math.round((completedRequired / requiredMilestones.length) * 100)} className="h-3" />
            <p className="text-sm text-slate-600">
              You have completed <strong>{completedRequired} of {requiredMilestones.length}</strong> required items.
            </p>
            {allRequiredComplete && (
              <p className="text-green-700 font-semibold text-sm">
                ✅ You meet the minimum requirements for one-on-one consultations and the giveaway!
              </p>
            )}
          </CardContent>
        </Card>

        {allRequiredComplete && (
          <Card className="border-2 border-[#E5C089] bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-2xl">
                <Heart className="w-6 h-6 text-[#E5C089]" />
                Thank You for Completing the IncubateHer Program!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-200 text-lg">
                Congratulations! You've completed all required assessments and evaluations. Your dedication to building your funding foundation is truly commendable.
              </p>
              <div className="bg-white/10 rounded-xl p-5 border border-[#E5C089]/40">
                <p className="text-[#E5C089] font-semibold text-base mb-2">📅 Schedule Your One-on-One Consultation</p>
                <p className="text-slate-200 mb-4">
                  Please reach out to <strong className="text-white">Dr. Charles Watterson</strong> directly to schedule your personalized one-on-one consultation session.
                </p>
                <a
                  href="mailto:cwatterson@columbusurbanleague.org"
                  className="inline-flex items-center gap-2 bg-[#E5C089] text-[#143A50] font-semibold px-5 py-3 rounded-lg hover:bg-[#d4ae72] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  cwatterson@columbusurbanleague.org
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {allRequiredComplete && (
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Award className="w-6 h-6" />
                Requirements Met — You're Eligible!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-800">
                You've completed all three required assessments. You're eligible to request a one-on-one consultation and apply for the giveaway!
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button className="bg-green-700 hover:bg-green-800" onClick={() => window.location.href = '/IncubateHerConsultations'}>
                  Book a Consultation
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/IncubateHerGiveaway'}>
                  Apply for Giveaway
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Required milestones */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#AC1A5B] text-white text-xs flex items-center justify-center">!</span>
            Required Items
          </h2>
          <div className="space-y-3">
            {requiredMilestones.map((milestone) => (
              <Card key={milestone.id} className={milestone.completed ? 'bg-green-50 border-green-200' : 'border-amber-200 bg-amber-50/30'}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 ${milestone.completed ? 'text-green-600' : 'text-amber-500'}`}>
                      {milestone.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Required</Badge>
                      </div>
                      <p className="text-slate-600 text-sm mt-1">{milestone.description}</p>
                    </div>
                    {milestone.completed ? (
                      <Badge className="bg-green-600 text-white">Complete</Badge>
                    ) : (
                      milestone.link && (
                        <Button size="sm" variant="outline" onClick={() => window.location.href = milestone.link}>
                          Go Complete
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Optional milestones */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#E5C089]" />
            Optional Items
          </h2>
          <p className="text-sm text-slate-500 mb-3">
            These are not required but show your engagement and are noted in your giveaway application.
          </p>
          <div className="space-y-3">
            {optionalMilestones.map((milestone) => (
              <Card key={milestone.id} className={milestone.completed ? 'bg-slate-50 border-slate-200' : ''}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-4">
                    {milestone.selfSelect ? (
                      <Checkbox
                        checked={!!milestone.completed}
                        onCheckedChange={(checked) => updateEnrollmentMutation.mutate({ documents_uploaded: !!checked })}
                        className="mt-1 cursor-pointer"
                      />
                    ) : (
                      <div className={`mt-0.5 ${milestone.completed ? 'text-green-600' : 'text-slate-300'}`}>
                        {milestone.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                        <Badge variant="outline" className="text-slate-500 text-xs">Optional</Badge>
                        {milestone.selfSelect && <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 text-xs">Self-Select</Badge>}
                      </div>
                      <p className="text-slate-600 text-sm mt-1">{milestone.description}</p>
                    </div>
                    {milestone.completed && (
                      <Badge className="bg-slate-500 text-white">Done</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <Card>
          <CardHeader><CardTitle>Next Steps</CardTitle></CardHeader>
          <CardContent>
            {!allRequiredComplete ? (
              <div className="space-y-2">
                <p className="text-slate-700 mb-3 font-medium">Complete these required items to unlock consultations and the giveaway:</p>
                <ul className="space-y-2">
                  {requiredMilestones.filter(m => !m.completed).map(m => (
                    <li key={m.id} className="flex items-center gap-2 text-slate-600">
                      <span className="text-[#AC1A5B]">→</span>
                      <span>{m.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-slate-700">
                You've completed all required items! Head to the <strong>Consultations</strong> page to book your one-on-one, or visit the <strong>Giveaway</strong> page to apply.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}