import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Clock, Target, TrendingUp, MessageSquare, AlertTriangle, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';

export default function IncubateHerAssessments() {
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

  const { data: assessmentRecords = [] } = useQuery({
    queryKey: ['all-assessments', enrollment?.id],
    queryFn: () => base44.entities.ProgramAssessment.filter({ enrollment_id: enrollment.id }),
    enabled: !!enrollment?.id
  });

  const preRecord = assessmentRecords.find(a => a.assessment_type === 'pre');
  const postRecord = assessmentRecords.find(a => a.assessment_type === 'post');
  // Evaluation is stored as post type with _form_type = evaluation, or check enrollment flag
  const evaluationRecord = assessmentRecords.find(a => a._form_type === 'evaluation' || a.assessment_type === 'evaluation');
  const evaluationCompleted = !!evaluationRecord && !evaluationRecord.is_draft;

  const preInProgress = preRecord?.is_draft && !enrollment?.pre_assessment_completed;
  const postInProgress = postRecord?.is_draft && !enrollment?.post_assessment_completed;

  // Check if readiness assessment is unlocked (after March 5, 2026)
  const currentDate = new Date();
  const unlockDate = new Date('2026-03-05T19:30:00'); // After Thursday session ends
  const isReadinessUnlocked = currentDate >= unlockDate;

  const assessments = [
    {
      id: 'pre-assessment',
      title: 'Pre-Program Assessment',
      description: 'Complete this before the program begins to help us understand your starting point.',
      icon: Target,
      page: 'IncubateHerPreAssessment',
      color: 'bg-blue-600',
      isCompleted: enrollment?.pre_assessment_completed,
      isInProgress: preInProgress,
      isLocked: false,
      availableNow: true
    },
    {
      id: 'readiness-assessment',
      title: 'Funding Readiness Assessment',
      description: 'Comprehensive assessment of your readiness for grants and contracts. Available after Session 2 (March 5).',
      icon: TrendingUp,
      page: 'FundingReadinessAssessment',
      color: 'bg-[#143A50]',
      isCompleted: false,
      isInProgress: false,
      isLocked: !isReadinessUnlocked,
      availableNow: isReadinessUnlocked,
      unlockDate: 'March 5, 2026 at 7:30 PM'
    },
    {
      id: 'post-assessment',
      title: 'Post-Program Assessment',
      description: 'Complete this after finishing all sessions to measure your progress and learning.',
      icon: CheckCircle2,
      page: 'IncubateHerPostAssessment',
      color: 'bg-green-600',
      isCompleted: enrollment?.post_assessment_completed,
      isInProgress: postInProgress,
      isLocked: false,
      availableNow: true
    },
    {
      id: 'program-evaluation',
      title: 'Program Evaluation',
      description: 'Share your feedback about the IncubateHer program experience.',
      icon: MessageSquare,
      page: 'IncubateHerEvaluation',
      color: 'bg-purple-600',
      isCompleted: evaluationCompleted,
      isInProgress: false,
      isLocked: false,
      availableNow: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Assessments & Evaluations"
        subtitle="Track your progress and provide feedback"
      />

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Deadline Banner */}
        <div className="bg-red-600 text-white rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-100" />
          <div>
            <p className="font-bold text-base">⏰ Assessment Deadline: March 10, 2026 at 5:00 PM</p>
            <p className="text-red-100 text-sm mt-1">
              All pre-assessments, post-assessments, and program evaluations must be completed by <strong>March 10th at 5:00 PM</strong>. Please do not wait — submit yours today!
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#143A50]" />
              Assessment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">
              Complete these assessments to help measure your progress and provide valuable feedback about the program.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-green-100 text-green-800">
                {assessments.filter(a => a.isCompleted).length} of {assessments.length} completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {assessments.map((assessment) => {
            const Icon = assessment.icon;
            
            return (
              <Card 
                key={assessment.id} 
                className={`overflow-hidden ${assessment.isLocked ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${assessment.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{assessment.title}</CardTitle>
                          {assessment.isCompleted && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {assessment.isLocked && (
                            <Badge className="bg-slate-100 text-slate-800">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-slate-600">
                          {assessment.description}
                        </CardDescription>
                        {assessment.isLocked && assessment.unlockDate && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-amber-800">
                              Available after: {assessment.unlockDate}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {assessment.isLocked ? (
                        <Button disabled variant="outline">
                          <Lock className="w-4 h-4 mr-2" />
                          Locked
                        </Button>
                      ) : (
                        <Link to={createPageUrl(assessment.page)}>
                          <Button className={assessment.color}>
                            {assessment.isCompleted ? 'Review' : 'Start'} Assessment
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}