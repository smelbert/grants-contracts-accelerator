import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Clock, Target, TrendingUp, MessageSquare, AlertTriangle, PenLine, ArrowRight, Circle, Calendar, Gift, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';

const STEPS = [
  {
    id: 'pre',
    title: 'Pre-Program Assessment',
    description: 'Establishes your baseline knowledge before the program. Required to unlock the rest of your journey.',
    page: 'IncubateHerPreAssessment',
    color: '#2563EB',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: Target,
  },
  {
    id: 'post',
    title: 'Post-Program Assessment',
    description: 'Measures how much you\'ve grown after completing all sessions. Shows your transformation.',
    page: 'IncubateHerPostAssessment',
    color: '#16A34A',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-300',
    icon: CheckCircle2,
  },
  {
    id: 'evaluation',
    title: 'Program Evaluation',
    description: 'Share your honest feedback about the IncubateHer experience. Helps us improve for future cohorts.',
    page: 'IncubateHerEvaluation',
    color: '#7C3AED',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-300',
    icon: MessageSquare,
  },
  {
    id: 'readiness',
    title: 'Funding Readiness Assessment',
    description: 'A comprehensive deep-dive into your readiness for grants and contracts. Available after Session 2.',
    page: 'FundingReadinessAssessment',
    color: BRAND_COLORS.eisNavy,
    bgLight: 'bg-slate-50',
    borderColor: 'border-slate-300',
    icon: TrendingUp,
    alwaysUnlocked: false,
  },
];

function StepStatus({ completed, inProgress, locked, isNext }) {
  if (completed) return (
    <div className="flex items-center gap-1.5">
      <CheckCircle2 className="w-5 h-5 text-green-600" />
      <span className="text-sm font-semibold text-green-700">Completed</span>
    </div>
  );
  if (locked) return (
    <div className="flex items-center gap-1.5">
      <Lock className="w-4 h-4 text-slate-400" />
      <span className="text-sm text-slate-500">Locked</span>
    </div>
  );
  if (inProgress) return (
    <div className="flex items-center gap-1.5">
      <PenLine className="w-4 h-4 text-amber-600" />
      <span className="text-sm font-semibold text-amber-700">Draft Saved — Resume</span>
    </div>
  );
  if (isNext) return (
    <div className="flex items-center gap-1.5">
      <ArrowRight className="w-4 h-4 text-[#AC1A5B]" />
      <span className="text-sm font-bold text-[#AC1A5B]">Up Next — Action Required</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5">
      <Circle className="w-4 h-4 text-slate-400" />
      <span className="text-sm text-slate-500">Not Started</span>
    </div>
  );
}

export default function IncubateHerAssessments() {
  const navigate = useNavigate();
  const [readinessHistoryOpen, setReadinessHistoryOpen] = useState(false);
  const [showRetakeWarning, setShowRetakeWarning] = useState(false);
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({ participant_email: user.email });
      return enrollments[0];
    },
    enabled: !!user?.email
  });

  const { data: assessmentRecords = [] } = useQuery({
    queryKey: ['all-assessments', enrollment?.id],
    queryFn: () => base44.entities.ProgramAssessment.filter({ enrollment_id: enrollment.id }),
    enabled: !!enrollment?.id
  });

  const { data: readinessHistory = [] } = useQuery({
    queryKey: ['readiness-history', user?.email],
    queryFn: () => base44.entities.FundingReadinessAssessment.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const preRecord = assessmentRecords.find(a => a.assessment_type === 'pre');
  const postRecord = assessmentRecords.find(a => a.assessment_type === 'post');
  const evaluationRecord = assessmentRecords.find(a => a._form_type === 'evaluation' || a.assessment_type === 'evaluation');

  const preCompleted = !!enrollment?.pre_assessment_completed;
  const postCompleted = !!enrollment?.post_assessment_completed;
  const evaluationCompleted = !!evaluationRecord && !evaluationRecord.is_draft;

  const currentDate = new Date();
  const isReadinessUnlocked = currentDate >= new Date('2026-03-05T19:30:00');

  const latestReadiness = readinessHistory.sort((a, b) => new Date(b.assessment_date) - new Date(a.assessment_date))[0];
  const hasReadiness = readinessHistory.length > 0;

  const stepStatus = {
    pre: { completed: preCompleted, inProgress: preRecord?.is_draft && !preCompleted, locked: false },
    post: { completed: postCompleted, inProgress: postRecord?.is_draft && !postCompleted, locked: false },
    evaluation: { completed: evaluationCompleted, inProgress: false, locked: false },
    readiness: { completed: false, inProgress: false, locked: !isReadinessUnlocked },
  };

  // Determine current stage (the first incomplete non-locked step)
  const currentStageId = ['pre', 'post', 'evaluation'].find(id => !stepStatus[id].completed) || 'done';
  const completedCount = ['pre', 'post', 'evaluation', 'readiness'].filter(id => stepStatus[id].completed).length;

  // Progress bar percent based on 3 required steps
  const requiredSteps = ['pre', 'post', 'evaluation'];
  const requiredCompleted = requiredSteps.filter(id => stepStatus[id].completed).length;
  const progressPct = Math.round((requiredCompleted / requiredSteps.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader title="Assessments & Evaluations" subtitle="Your program completion journey" />

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Deadline Banner */}
        <div className="bg-red-600 text-white rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">⏰ Deadline: March 10, 2026 at 5:00 PM</p>
            <p className="text-red-100 text-sm mt-1">All assessments and the program evaluation must be submitted by this date.</p>
          </div>
        </div>

        {/* Progress Summary */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your Progress</h2>
                <p className="text-sm text-slate-600">
                  {requiredCompleted === 3
                    ? '🎉 All required steps complete! Great work.'
                    : currentStageId === 'pre'
                    ? 'Start with your Pre-Program Assessment to begin your journey.'
                    : currentStageId === 'post'
                    ? "You've completed the Pre-Assessment — now take the Post-Assessment."
                    : currentStageId === 'evaluation'
                    ? "Almost done! Complete the Program Evaluation to finish."
                    : 'All done!'}
                </p>
              </div>
              <Badge className={requiredCompleted === 3 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                {requiredCompleted} / 3 Required
              </Badge>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? '#16A34A' : BRAND_COLORS.eisGold }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-500">
              <span>Pre-Assessment</span>
              <span>Post-Assessment</span>
              <span>Evaluation</span>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Journey */}
        <div className="space-y-4">
          {STEPS.map((step, idx) => {
            const status = stepStatus[step.id];
            const isNext = step.id === currentStageId && !status.completed && !status.locked;
            const Icon = step.icon;
            const stepNum = idx + 1;

            return (
              <div
                key={step.id}
                className={`relative rounded-2xl border-2 transition-all ${
                  status.completed
                    ? 'border-green-300 bg-green-50'
                    : isNext
                    ? 'border-[#AC1A5B] bg-white shadow-lg ring-2 ring-[#AC1A5B]/20'
                    : status.locked
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* "Up Next" ribbon */}
                {isNext && (
                  <div className="absolute -top-3 left-4">
                    <span className="bg-[#AC1A5B] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      👉 Do This Next
                    </span>
                  </div>
                )}

                <div className="p-5 flex items-start gap-4">
                  {/* Step number / check */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                    style={{ backgroundColor: status.completed ? '#16A34A' : status.locked ? '#CBD5E1' : step.color }}
                  >
                    {status.completed ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className={`font-bold text-base ${status.completed ? 'text-green-800' : 'text-slate-900'}`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{step.description}</p>
                        {step.id === 'readiness' && status.locked && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-amber-700">
                            <Clock className="w-3.5 h-3.5" />
                            Available after Session 2 (March 5, 2026 at 7:30 PM)
                          </div>
                        )}
                        {/* Readiness history dropdown */}
                        {step.id === 'readiness' && hasReadiness && (
                          <div className="mt-3">
                            <button
                              onClick={() => setReadinessHistoryOpen(o => !o)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                            >
                              {readinessHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              {readinessHistory.length} previous attempt{readinessHistory.length !== 1 ? 's' : ''}
                            </button>
                            {readinessHistoryOpen && (
                              <div className="mt-2 space-y-2">
                                {readinessHistory
                                  .sort((a, b) => new Date(b.assessment_date) - new Date(a.assessment_date))
                                  .map((r, i) => (
                                    <div key={r.id} className="p-2 rounded bg-white border text-xs flex items-center gap-3">
                                      <span className="text-slate-500 font-medium">#{readinessHistory.length - i}</span>
                                      <div className="flex-1">
                                        <span className="font-medium text-slate-700">
                                          Score: {r.overall_score ?? '—'}
                                          {r.readiness_level && (
                                            <span className="ml-2 capitalize text-slate-500">({r.readiness_level.replace(/_/g, ' ')})</span>
                                          )}
                                        </span>
                                        <p className="text-slate-400">{new Date(r.assessment_date).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StepStatus {...status} isNext={isNext} />
                        {!status.locked && step.id !== 'readiness' && (
                          <Link to={createPageUrl(step.page)}>
                            <Button
                              size="sm"
                              style={isNext ? { backgroundColor: '#AC1A5B', color: '#fff' } : status.completed ? { backgroundColor: '#16A34A', color: '#fff' } : { backgroundColor: step.color, color: '#fff' }}
                            >
                              {status.completed ? 'Review' : status.inProgress ? 'Resume' : 'Start'}
                              {isNext && <ArrowRight className="w-4 h-4 ml-1" />}
                            </Button>
                          </Link>
                        )}
                        {!status.locked && step.id === 'readiness' && (
                          <Button
                            size="sm"
                            style={{ backgroundColor: step.color, color: '#fff' }}
                            onClick={() => {
                              if (hasReadiness) {
                                setShowRetakeWarning(true);
                              } else {
                                navigate(createPageUrl(step.page));
                              }
                            }}
                          >
                            {hasReadiness ? 'Retake' : 'Start'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connector line to next step (not on last) */}
                {idx < STEPS.length - 1 && (
                  <div className="absolute -bottom-5 left-[2.35rem] w-0.5 h-5 bg-slate-300 z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* All done — next steps panel */}
        {requiredCompleted === 3 && (
          <div className="space-y-4">
            <Card className="border-2 border-green-400 bg-green-50">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">You've Completed All Required Steps!</h3>
                <p className="text-green-700 text-sm">You've been automatically entered into the giveaway pool. See below for your next steps.</p>
                <Link to={createPageUrl('IncubateHerCompletion')} className="inline-block mt-4">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">View My Completion Status →</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Giveaway auto-entry notice */}
            <Card className="border-2 border-[#E5C089] bg-gradient-to-r from-yellow-50 to-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <Gift className="w-9 h-9 text-[#AC1A5B] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">🎁 You're In the Giveaway Pool!</h4>
                    <p className="text-sm text-slate-600">
                      Because you've completed all 3 assessments, you've been automatically entered into the giveaway. If you don't wish to participate, you can opt out on the Giveaway page.
                    </p>
                    <Link to={createPageUrl('IncubateHerGiveaway')} className="inline-block mt-3">
                      <Button size="sm" className="bg-[#AC1A5B] hover:bg-[#8e1549] text-white">View Giveaway Details →</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Book consultation CTA */}
            <Card className="border-2 border-[#143A50] bg-gradient-to-r from-[#143A50]/5 to-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <Calendar className="w-9 h-9 text-[#143A50] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">📅 Don't Miss Your One-on-One Consultation!</h4>
                    <p className="text-sm text-slate-600">
                      Now that you've finished all required assessments, your next step is to book your individual funding readiness consultation with Dr. Shawnte. <strong>Spots are limited — book yours now.</strong>
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <a
                        href="https://calendly.com/drshawnte/incubateher-individual-funding-readiness-consultation?back=1&month=2026-03"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] text-white">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          Book on Calendly
                        </Button>
                      </a>
                      <Link to={createPageUrl('IncubateHerConsultations')}>
                        <Button size="sm" variant="outline" className="border-[#143A50] text-[#143A50]">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
      <CoBrandedFooter />
    </div>
  );
}