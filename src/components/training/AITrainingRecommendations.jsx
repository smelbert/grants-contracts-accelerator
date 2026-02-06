import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, Target, BookOpen, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AITrainingRecommendations({ consultantEmail }) {
  const [recommendations, setRecommendations] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: onboarding } = useQuery({
    queryKey: ['onboarding', consultantEmail],
    queryFn: () => base44.entities.ConsultantOnboarding.filter({ consultant_email: consultantEmail }),
  });

  const { data: assessment } = useQuery({
    queryKey: ['assessment', consultantEmail],
    queryFn: () => base44.entities.CoachIntakeAssessment.filter({ coach_email: consultantEmail }),
  });

  const { data: trainings } = useQuery({
    queryKey: ['trainings'],
    queryFn: () => base44.entities.CoachTraining.filter({ is_published: true }),
  });

  const handleGenerateRecommendations = async () => {
    setGenerating(true);
    try {
      const currentOnboarding = onboarding?.[0] || {};
      const currentAssessment = assessment?.[0] || {};

      const prompt = `You are an AI training advisor for EIS consultant development. Analyze this consultant's profile and create a personalized training pathway.

CONSULTANT PROFILE:
Current Level: ${currentOnboarding.current_level || 'level-1'}
Onboarding Phase: ${currentOnboarding.onboarding_phase || 'days_0_30'}
Modules Completed: ${currentOnboarding.modules_completed?.length || 0}
Drafts Submitted: ${currentOnboarding.drafts_submitted || 0}
Drafts Approved: ${currentOnboarding.drafts_approved || 0}
Funded Proposals: ${currentOnboarding.funded_proposals_count || 0}

SKILL ASSESSMENT:
Grant Writing: ${currentAssessment.grant_writing_level || 'beginner'} (${currentAssessment.grant_writing_experience_years || 0} years)
Contract Management: ${currentAssessment.contract_management_level || 'beginner'}
Proposal Development: ${currentAssessment.proposal_development_level || 'beginner'}
Pitch Coaching: ${currentAssessment.pitch_coaching_level || 'beginner'}
Budget Development: ${currentAssessment.budget_development_level || 'beginner'}
Compliance: ${currentAssessment.compliance_expertise_level || 'beginner'}

Areas for Development: ${currentAssessment.areas_for_development?.join(', ') || 'Not specified'}
Training Priorities: ${currentAssessment.training_priorities || 'Not specified'}

EIS TRAINING LEVELS:
- Level 1 (Foundation): Shadow sessions, use templates only, no client contact
- Level 2 (Intermediate): Draft independently with review, limited pitch support
- Level 3 (Senior): Lead strategy, QA others' work, mentor Level 1-2

Provide personalized recommendations including:
1. Priority training modules (3-4 specific topics)
2. Recommended exercises (2-3 practical activities)
3. Skill development focus (key areas to improve)
4. Next milestone (what they should achieve next)
5. Mentorship needs (what kind of support they need)
6. Estimated timeline to next level (weeks)

Be specific, actionable, and aligned with their current level and goals.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            priority_modules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  reason: { type: 'string' },
                  urgency: { type: 'string', enum: ['high', 'medium', 'low'] }
                }
              }
            },
            recommended_exercises: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            skill_focus: {
              type: 'array',
              items: { type: 'string' }
            },
            next_milestone: { type: 'string' },
            mentorship_needs: { type: 'string' },
            timeline_weeks: { type: 'number' }
          }
        }
      });

      setRecommendations(result);
      toast.success('Training pathway generated');
    } catch (error) {
      toast.error('Failed to generate recommendations: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const urgencyColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  return (
    <Card className="shadow-lg border-2 border-[#AC1A5B]">
      <CardHeader className="bg-gradient-to-r from-[#AC1A5B]/10 to-[#E5C089]/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#AC1A5B]" />
              AI Personalized Training Pathway
            </CardTitle>
            <CardDescription>
              Tailored recommendations based on skills and performance
            </CardDescription>
          </div>
          <Button 
            onClick={handleGenerateRecommendations} 
            disabled={generating}
            className="bg-[#AC1A5B] hover:bg-[#A65D40]"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Pathway
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!recommendations ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">
              Generate a personalized training pathway using AI
            </p>
            <p className="text-sm text-slate-500">
              AI will analyze assessment data, current progress, and career goals
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline to Next Level */}
            <Card className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Next Level Projection</span>
                  <Badge className="bg-white text-[#143A50]">
                    {recommendations.timeline_weeks} weeks
                  </Badge>
                </div>
                <Progress value={33} className="h-2 bg-white/20" />
                <p className="text-sm text-white/80 mt-2">{recommendations.next_milestone}</p>
              </CardContent>
            </Card>

            {/* Priority Modules */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1E4F58]" />
                Priority Training Modules
              </h3>
              <div className="space-y-3">
                {recommendations.priority_modules?.map((module, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-l-4 border-l-[#1E4F58]">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{module.title}</h4>
                          <Badge className={urgencyColors[module.urgency]}>
                            {module.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{module.reason}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recommended Exercises */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#E5C089]" />
                Recommended Exercises
              </h3>
              <div className="space-y-2">
                {recommendations.recommended_exercises?.map((exercise, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <h4 className="font-medium text-slate-900 mb-1">{exercise.title}</h4>
                      <p className="text-sm text-slate-600">{exercise.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Skill Development Focus */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#AC1A5B]" />
                Skill Development Focus
              </h3>
              <div className="flex flex-wrap gap-2">
                {recommendations.skill_focus?.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="border-[#AC1A5B] text-[#AC1A5B]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mentorship Needs */}
            <Card className="bg-[#E5C089]/10 border-[#E5C089]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#A65D40]" />
                  Recommended Mentorship
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{recommendations.mentorship_needs}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}