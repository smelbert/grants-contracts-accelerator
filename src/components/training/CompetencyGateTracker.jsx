import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Lock, AlertCircle, Clock } from 'lucide-react';

export default function CompetencyGateTracker({ consultantEmail, currentLevel }) {
  const targetLevel = currentLevel === 'level-1' ? 'level-2' : currentLevel === 'level-2' ? 'level-3' : null;

  const { data: gates = [] } = useQuery({
    queryKey: ['promotionGates', currentLevel],
    queryFn: () => base44.entities.LevelPromotionGate.filter({ from_level: currentLevel }),
    enabled: !!targetLevel
  });

  const { data: onboarding } = useQuery({
    queryKey: ['consultant-onboarding', consultantEmail],
    queryFn: () => base44.entities.ConsultantOnboarding.filter({ consultant_email: consultantEmail }).then(r => r[0]),
    enabled: !!consultantEmail
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments', consultantEmail],
    queryFn: () => base44.entities.CompetencyAssessment.filter({ consultant_email: consultantEmail }),
    enabled: !!consultantEmail
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['liveSessions', consultantEmail],
    queryFn: async () => {
      const allSessions = await base44.entities.LiveTrainingSession.list();
      return allSessions.filter(s => 
        s.participants?.some(p => p.email === consultantEmail && p.attendance_status === 'attended')
      );
    },
    enabled: !!consultantEmail
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['consultantSkills', consultantEmail],
    queryFn: () => base44.entities.ConsultantSkill.filter({ consultant_email: consultantEmail }),
    enabled: !!consultantEmail
  });

  const checkGateStatus = (gate) => {
    switch (gate.gate_type) {
      case 'module_completion':
        const completedModules = onboarding?.modules_completed || [];
        const requiredModules = gate.requirement_details?.module_ids || [];
        const completed = requiredModules.filter(m => completedModules.includes(m)).length;
        return {
          met: completed >= requiredModules.length,
          progress: requiredModules.length > 0 ? (completed / requiredModules.length) * 100 : 0,
          current: completed,
          required: requiredModules.length
        };

      case 'assessment_pass':
        const requiredAssessments = gate.requirement_details?.assessment_types || [];
        const passedAssessments = assessments.filter(a => 
          requiredAssessments.includes(a.assessment_type) && 
          a.status === 'passed' &&
          a.score >= (gate.requirement_details?.minimum_score || 80)
        );
        return {
          met: passedAssessments.length >= requiredAssessments.length,
          progress: requiredAssessments.length > 0 ? (passedAssessments.length / requiredAssessments.length) * 100 : 0,
          current: passedAssessments.length,
          required: requiredAssessments.length
        };

      case 'live_session_attendance':
        const requiredTypes = gate.requirement_details?.session_types || [];
        const attendedSessions = sessions.filter(s => requiredTypes.includes(s.session_type));
        const required = gate.requirement_details?.required_count || 1;
        return {
          met: attendedSessions.length >= required,
          progress: (attendedSessions.length / required) * 100,
          current: attendedSessions.length,
          required
        };

      case 'clean_draft_count':
        const draftsApproved = onboarding?.drafts_approved || 0;
        const requiredDrafts = gate.requirement_details?.required_count || 2;
        return {
          met: draftsApproved >= requiredDrafts,
          progress: (draftsApproved / requiredDrafts) * 100,
          current: draftsApproved,
          required: requiredDrafts
        };

      case 'funded_proposal':
        const fundedCount = onboarding?.funded_proposals_count || 0;
        const requiredFunded = gate.requirement_details?.required_count || 1;
        return {
          met: fundedCount >= requiredFunded,
          progress: (fundedCount / requiredFunded) * 100,
          current: fundedCount,
          required: requiredFunded
        };

      case 'skill_validation':
        const requiredCategories = gate.requirement_details?.skill_categories || [];
        const minLevel = gate.requirement_details?.minimum_skill_level || 3;
        const validatedSkills = skills.filter(s => 
          requiredCategories.includes(s.skill_category) && 
          s.coach_validated_level >= minLevel
        );
        return {
          met: validatedSkills.length >= requiredCategories.length,
          progress: requiredCategories.length > 0 ? (validatedSkills.length / requiredCategories.length) * 100 : 0,
          current: validatedSkills.length,
          required: requiredCategories.length
        };

      default:
        return { met: false, progress: 0, current: 0, required: 1 };
    }
  };

  if (!targetLevel) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-900">Maximum Level Achieved</p>
          <p className="text-sm text-slate-600">You are at Senior Consultant level</p>
        </CardContent>
      </Card>
    );
  }

  const mandatoryGates = gates.filter(g => g.is_mandatory);
  const gatesWithStatus = mandatoryGates.map(gate => ({
    ...gate,
    status: checkGateStatus(gate)
  }));

  const completedGates = gatesWithStatus.filter(g => g.status.met).length;
  const overallProgress = mandatoryGates.length > 0 ? (completedGates / mandatoryGates.length) * 100 : 0;
  const allGatesMet = completedGates === mandatoryGates.length;

  return (
    <Card className={allGatesMet ? 'border-2 border-green-500' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Promotion Requirements: {currentLevel} → {targetLevel}</CardTitle>
          <Badge className={allGatesMet ? 'bg-green-600' : 'bg-slate-400'}>
            {completedGates} / {mandatoryGates.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Progress</span>
            <span className="text-sm text-slate-600">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        <div className="space-y-4">
          {gatesWithStatus.map((gate) => (
            <div
              key={gate.id}
              className={`p-4 rounded-lg border-2 ${
                gate.status.met
                  ? 'bg-green-50 border-green-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {gate.status.met ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : gate.status.progress > 0 ? (
                    <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{gate.gate_name}</p>
                    {gate.description && (
                      <p className="text-sm text-slate-600 mt-1">{gate.description}</p>
                    )}
                  </div>
                </div>
                <Badge variant={gate.status.met ? 'default' : 'outline'}>
                  {gate.status.current} / {gate.status.required}
                </Badge>
              </div>
              
              {!gate.status.met && (
                <Progress value={gate.status.progress} className="h-2" />
              )}
            </div>
          ))}
        </div>

        {allGatesMet && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Ready for Promotion Review!</p>
                <p className="text-sm text-green-700">
                  You've met all requirements. Your coach will schedule a promotion review.
                </p>
              </div>
            </div>
          </div>
        )}

        {!allGatesMet && completedGates > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {mandatoryGates.length - completedGates} requirement{mandatoryGates.length - completedGates > 1 ? 's' : ''} remaining
                </p>
                <p className="text-xs text-blue-700">
                  Focus on completing the locked requirements above
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}