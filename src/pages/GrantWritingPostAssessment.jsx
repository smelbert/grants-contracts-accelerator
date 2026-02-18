import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SKILLS_TO_RATE = [
  { id: 'needs_assessment', label: 'Conducting Needs Assessments' },
  { id: 'goals_objectives', label: 'Writing SMART Goals & Objectives' },
  { id: 'methods_strategies', label: 'Program Design & Methods' },
  { id: 'evaluation_plan', label: 'Evaluation Planning' },
  { id: 'budget_development', label: 'Budget Development' },
  { id: 'sustainability', label: 'Sustainability Planning' },
  { id: 'organizational_capacity', label: 'Demonstrating Organizational Capacity' },
  { id: 'narrative_writing', label: 'Compelling Narrative Writing' },
  { id: 'compliance_requirements', label: 'Understanding Compliance' },
  { id: 'research_funder_alignment', label: 'Funder Research & Alignment' }
];

const POST_SCENARIOS = [
  {
    id: 'post_scenario_1',
    title: 'Complex Needs Assessment',
    prompt: 'You\'re applying for a $500K federal grant to address youth homelessness. Design a comprehensive needs assessment that demonstrates both quantitative and qualitative evidence of the problem in your community.'
  },
  {
    id: 'post_scenario_2',
    title: 'Multi-Year Budget',
    prompt: 'Create a budget narrative justifying a 3-year program with increasing costs each year, including staff raises, expanding services, and building organizational capacity.'
  },
  {
    id: 'post_scenario_3',
    title: 'Outcome Evaluation',
    prompt: 'Design an outcome-based evaluation plan for a workforce development program that tracks participants for 12 months post-program. Include specific metrics, data collection methods, and reporting timeline.'
  },
  {
    id: 'post_scenario_4',
    title: 'Funder Alignment Strategy',
    prompt: 'You have a new mental health program idea. Walk through your process for identifying appropriate funders, researching their priorities, and tailoring your proposal to align with their mission.'
  }
];

export default function GrantWritingPostAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    grants_written_during_training: 0,
    grants_submitted: 0,
    skill_ratings: SKILLS_TO_RATE.map(skill => ({ skill: skill.id, rating: 3 })),
    scenario_responses: POST_SCENARIOS.map(s => ({ scenario_id: s.id, response: '' })),
    key_learnings: '',
    confidence_improvement: '',
    most_valuable_modules: [],
    areas_still_developing: [],
    next_steps: ''
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: preAssessment } = useQuery({
    queryKey: ['pre-assessment', user?.email],
    queryFn: async () => {
      const assessments = await base44.entities.GrantWritingAssessment.filter({
        user_email: user.email,
        assessment_type: 'pre'
      });
      return assessments[0];
    },
    enabled: !!user?.email
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: (data) => base44.entities.GrantWritingAssessment.create({
      user_email: user.email,
      user_name: user.full_name,
      assessment_type: 'post',
      assessment_date: new Date().toISOString(),
      responses: data,
      overall_score: calculateScore(data),
      completed: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['grant-assessments']);
      toast.success('Post-assessment submitted successfully!');
    }
  });

  const calculateScore = (data) => {
    const skillAvg = data.skill_ratings.reduce((sum, s) => sum + s.rating, 0) / data.skill_ratings.length;
    return Math.round((skillAvg / 5) * 100);
  };

  const calculateImprovement = (skillId) => {
    if (!preAssessment) return null;
    const preRating = preAssessment.responses.skill_ratings?.find(s => s.skill === skillId)?.rating || 0;
    const postRating = formData.skill_ratings.find(s => s.skill === skillId)?.rating || 0;
    return postRating - preRating;
  };

  const handleSubmit = () => {
    submitAssessmentMutation.mutate(formData);
  };

  const updateSkillRating = (skillId, rating) => {
    setFormData({
      ...formData,
      skill_ratings: formData.skill_ratings.map(s =>
        s.skill === skillId ? { ...s, rating } : s
      )
    });
  };

  const updateScenarioResponse = (scenarioId, response) => {
    setFormData({
      ...formData,
      scenario_responses: formData.scenario_responses.map(s =>
        s.scenario_id === scenarioId ? { ...s, response } : s
      )
    });
  };

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Grant Writing Post-Assessment</h1>
          <p className="text-slate-600">Measure your growth and identify areas for continued development</p>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-slate-600 mt-2">Step {currentStep} of {totalSteps}</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Training Activity Summary</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Grants Written During Training</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.grants_written_during_training}
                      onChange={(e) => setFormData({ ...formData, grants_written_during_training: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Grants Actually Submitted</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.grants_submitted}
                      onChange={(e) => setFormData({ ...formData, grants_submitted: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Key Learnings from Training</Label>
                  <Textarea
                    value={formData.key_learnings}
                    onChange={(e) => setFormData({ ...formData, key_learnings: e.target.value })}
                    placeholder="What were the most important things you learned?"
                    rows={5}
                  />
                </div>

                <div>
                  <Label>How has your confidence in grant writing changed?</Label>
                  <Textarea
                    value={formData.confidence_improvement}
                    onChange={(e) => setFormData({ ...formData, confidence_improvement: e.target.value })}
                    placeholder="Describe how you feel about your grant writing skills now compared to before training"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Skill Re-Assessment</h2>
                  <p className="text-sm text-slate-600 mb-6">Rate your current skill level after completing the training</p>
                  {preAssessment && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <AlertCircle className="w-4 h-4 text-blue-600 inline mr-2" />
                      <span className="text-sm text-blue-900">We'll compare these ratings to your pre-assessment to track your growth</span>
                    </div>
                  )}
                </div>

                {SKILLS_TO_RATE.map(skill => {
                  const rating = formData.skill_ratings.find(s => s.skill === skill.id)?.rating || 3;
                  const improvement = calculateImprovement(skill.id);
                  return (
                    <div key={skill.id} className="border-b pb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Label className="font-semibold">{skill.label}</Label>
                        {improvement !== null && improvement !== 0 && (
                          <span className={`text-sm font-medium flex items-center gap-1 ${improvement > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                            <TrendingUp className="w-4 h-4" />
                            {improvement > 0 ? '+' : ''}{improvement} from pre-assessment
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            onClick={() => updateSkillRating(skill.id, num)}
                            className={`w-12 h-12 rounded-lg font-semibold transition ${
                              rating >= num
                                ? 'bg-[#143A50] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                        <span className="ml-3 text-sm text-slate-600">
                          {rating === 1 && 'Novice'}
                          {rating === 2 && 'Basic'}
                          {rating === 3 && 'Intermediate'}
                          {rating === 4 && 'Proficient'}
                          {rating === 5 && 'Expert'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Advanced Scenario Responses</h2>
                  <p className="text-sm text-slate-600 mb-6">Apply your training to these complex scenarios</p>
                </div>

                {POST_SCENARIOS.map((scenario, index) => {
                  const response = formData.scenario_responses.find(s => s.scenario_id === scenario.id)?.response || '';
                  return (
                    <div key={scenario.id} className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Scenario {index + 1}: {scenario.title}</h3>
                      <p className="text-slate-700 mb-3">{scenario.prompt}</p>
                      <Textarea
                        value={response}
                        onChange={(e) => updateScenarioResponse(scenario.id, e.target.value)}
                        placeholder="Type your detailed response here..."
                        rows={6}
                        className="bg-white"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Reflection & Next Steps</h2>
                </div>

                <div>
                  <Label>Which training modules were most valuable to you?</Label>
                  <Textarea
                    value={formData.most_valuable_modules.join('\n')}
                    onChange={(e) => setFormData({ ...formData, most_valuable_modules: e.target.value.split('\n').filter(s => s.trim()) })}
                    placeholder="List the most valuable modules (one per line)"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>What areas do you still need to develop?</Label>
                  <Textarea
                    value={formData.areas_still_developing.join('\n')}
                    onChange={(e) => setFormData({ ...formData, areas_still_developing: e.target.value.split('\n').filter(s => s.trim()) })}
                    placeholder="List areas where you want continued development (one per line)"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>What are your next steps in grant writing?</Label>
                  <Textarea
                    value={formData.next_steps}
                    onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
                    placeholder="Describe your action plan for applying what you've learned"
                    rows={5}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Ready to Submit</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Your responses will help us measure training effectiveness and provide personalized recommendations
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)} className="ml-auto bg-[#143A50] hover:bg-[#1E4F58]">
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitAssessmentMutation.isPending}
                  className="ml-auto bg-[#143A50] hover:bg-[#1E4F58]"
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}