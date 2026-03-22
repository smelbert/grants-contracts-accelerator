import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Target, FileText, BookOpen, TrendingUp, Award, 
  CheckCircle2, Clock, ArrowRight, Sparkles, Calendar, Gift, MessageSquare
} from 'lucide-react';

export default function PersonalizedDashboard({ user, userAccess }) {
  const entryPoint = userAccess?.entry_point;

  const { data: enrollment } = useQuery({
    queryKey: ['user-enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!user?.email
  });

  const { data: giveawayWinners = [] } = useQuery({
    queryKey: ['giveaway-winners-dashboard'],
    queryFn: () => base44.entities.GiveawayWinner.list(),
    enabled: entryPoint === 'incubateher_program'
  });

  const { data: assessments } = useQuery({
    queryKey: ['user-assessments', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return [];
      return await base44.entities.ProgramAssessment.filter({
        enrollment_id: enrollment.id
      });
    },
    enabled: !!enrollment?.id
  });

  const { data: userProjects } = useQuery({
    queryKey: ['user-projects', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Project.filter({
        owner_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: templates } = useQuery({
    queryKey: ['recommended-templates'],
    queryFn: () => base44.entities.Template.list()
  });

  // Calculate progress
  const preAssessment = assessments?.find(a => a.assessment_type === 'pre');
  const postAssessment = assessments?.find(a => a.assessment_type === 'post');
  const hasCompletedProgram = enrollment?.program_completed;

  // Get recommended templates based on assessment scores
  const getRecommendedTemplates = () => {
    if (!preAssessment || !templates) return [];
    
    const score = preAssessment.total_score;
    if (score < 40) {
      return templates.filter(t => 
        t.category === 'foundational' || t.maturity_level === 'seed'
      ).slice(0, 3);
    } else if (score < 70) {
      return templates.filter(t => 
        t.category === 'grant_writing' || t.maturity_level === 'growth'
      ).slice(0, 3);
    } else {
      return templates.filter(t => 
        t.category === 'contracts_rfp' || t.maturity_level === 'scale'
      ).slice(0, 3);
    }
  };

  const recommendedTemplates = getRecommendedTemplates();

  // IncubateHer Specific Dashboard
  if (entryPoint === 'incubateher_program') {
    return (
      <div className="space-y-6">
        {/* Welcome Hero */}
        <Card className="bg-gradient-to-br from-[#AC1A5B] to-[#8A1548] text-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="bg-white/20 text-white mb-3">IncubateHer Program</Badge>
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user.full_name}!</h2>
                <p className="text-white/90">
                  Continue building your funding readiness foundation
                </p>
              </div>
              <Target className="w-12 h-12 text-[#E5C089]" />
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#AC1A5B]" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const evalRecord = assessments?.find(a => a._form_type === 'evaluation' || a.assessment_type === 'evaluation');
              const evalCompleted = !!evalRecord && !evalRecord?.is_draft;
              const preCompleted = !!enrollment?.pre_assessment_completed;
              const postCompleted = !!enrollment?.post_assessment_completed;
              const consultCompleted = !!enrollment?.consultation_completed;
              const sessionsComplete = !!enrollment?.attendance_complete;

              const steps = [
                {
                  label: 'Pre-Assessment',
                  done: preCompleted,
                  icon: Target,
                  action: !preCompleted ? { label: 'Start', page: 'IncubateHerPreAssessment' } : null,
                },
                {
                  label: 'Program Sessions (3)',
                  done: sessionsComplete,
                  icon: BookOpen,
                  action: !sessionsComplete ? { label: 'View Schedule', page: 'IncubateHerLearning' } : null,
                },
                {
                  label: 'Post-Assessment',
                  done: postCompleted,
                  icon: TrendingUp,
                  action: preCompleted && !postCompleted ? { label: 'Start', page: 'IncubateHerPostAssessment' } : null,
                },
                {
                  label: 'Program Evaluation',
                  done: evalCompleted,
                  icon: MessageSquare,
                  action: postCompleted && !evalCompleted ? { label: 'Complete', page: 'IncubateHerEvaluation' } : null,
                },
                {
                  label: '1-on-1 Consultation',
                  done: consultCompleted,
                  icon: Calendar,
                  externalLink: !consultCompleted && preCompleted && postCompleted && evalCompleted
                    ? 'https://calendly.com/drshawnte/incubateher-individual-funding-readiness-consultation?back=1&month=2026-03'
                    : null,
                  actionLabel: 'Book Now',
                },
                {
                  label: 'Giveaway Entry',
                  done: !!enrollment?.giveaway_eligible,
                  icon: Gift,
                  note: preCompleted && postCompleted && evalCompleted ? 'Auto-enrolled ✓' : 'Complete all assessments first',
                },
              ];

              const completedCount = steps.filter(s => s.done).length;

              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-500">{completedCount} of {steps.length} complete</span>
                    <span className="text-sm font-bold text-[#AC1A5B]">{Math.round((completedCount / steps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / steps.length) * 100}%`, backgroundColor: completedCount === steps.length ? '#16A34A' : '#AC1A5B' }}
                    />
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, i) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            step.done
                              ? 'bg-green-50 border-green-200'
                              : step.action || step.externalLink
                              ? 'bg-[#AC1A5B]/5 border-[#AC1A5B]/30'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {step.done
                              ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              : <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            }
                            <div>
                              <span className={`font-medium text-sm ${step.done ? 'text-green-800' : 'text-slate-800'}`}>{step.label}</span>
                              {step.note && <p className="text-xs text-slate-500 mt-0.5">{step.note}</p>}
                            </div>
                          </div>
                          {step.action && (
                            <Link to={createPageUrl(step.action.page)}>
                              <Button size="sm" className="bg-[#AC1A5B] hover:bg-[#8e1549] text-white text-xs">
                                {step.action.label} <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                          {step.externalLink && (
                            <a href={step.externalLink} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] text-white text-xs">
                                {step.actionLabel} <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Personalized Recommendations */}
        {preAssessment && recommendedTemplates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E5C089]" />
                Recommended for You
              </CardTitle>
              <p className="text-sm text-slate-600">
                Based on your assessment score of {preAssessment.total_score}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedTemplates.map((template) => (
                  <Link key={template.id} to={createPageUrl('Templates')}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-[#143A50]" />
                        <div>
                          <p className="font-medium text-sm">{template.template_name}</p>
                          <p className="text-xs text-slate-500">{template.category.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={createPageUrl('Projects')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <FileText className="w-8 h-8 text-[#143A50] mb-3" />
                <p className="font-semibold mb-1">Start a Project</p>
                <p className="text-sm text-slate-600">Apply what you learned</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('Templates')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <BookOpen className="w-8 h-8 text-[#AC1A5B] mb-3" />
                <p className="font-semibold mb-1">Browse Templates</p>
                <p className="text-sm text-slate-600">Professional resources</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('Community')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <Target className="w-8 h-8 text-[#E5C089] mb-3" />
                <p className="font-semibold mb-1">Join Community</p>
                <p className="text-sm text-slate-600">Connect with peers</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Growth Showcase */}
        {preAssessment && postAssessment && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Your Growth</p>
                  <p className="text-3xl font-bold text-green-600">
                    +{postAssessment.total_score - preAssessment.total_score} points
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    From {preAssessment.total_score} to {postAssessment.total_score}
                  </p>
                </div>
                <TrendingUp className="w-16 h-16 text-green-600" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Default Dashboard for other users
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.full_name}!</h2>
          <p className="text-slate-600">Your personalized workspace</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={createPageUrl('Projects')}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <FileText className="w-8 h-8 text-[#143A50] mb-3" />
              <p className="font-semibold mb-1">Projects</p>
              <p className="text-sm text-slate-600">{userProjects?.length || 0} active</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl('Templates')}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <BookOpen className="w-8 h-8 text-[#AC1A5B] mb-3" />
              <p className="font-semibold mb-1">Templates</p>
              <p className="text-sm text-slate-600">Professional resources</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl('Opportunities')}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-[#E5C089] mb-3" />
              <p className="font-semibold mb-1">Opportunities</p>
              <p className="text-sm text-slate-600">Find funding</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}