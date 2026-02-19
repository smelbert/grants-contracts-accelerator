import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Award } from 'lucide-react';
import { toast } from 'sonner';

const ASSESSMENT_QUESTIONS = [
  {
    id: 'experience_change',
    question: 'After completing the training, how would you now describe your grant writing experience?',
    type: 'radio',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'expert', label: 'Expert' }
    ]
  },
  {
    id: 'needs_assessment_post',
    question: 'How confident are you NOW in writing compelling needs assessments?',
    type: 'radio',
    options: [
      { value: '1', label: 'Not confident at all' },
      { value: '2', label: 'Somewhat confident' },
      { value: '3', label: 'Moderately confident' },
      { value: '4', label: 'Very confident' },
      { value: '5', label: 'Extremely confident' }
    ]
  },
  {
    id: 'budget_development_post',
    question: 'How confident are you NOW in developing accurate and aligned budgets?',
    type: 'radio',
    options: [
      { value: '1', label: 'Not confident at all' },
      { value: '2', label: 'Somewhat confident' },
      { value: '3', label: 'Moderately confident' },
      { value: '4', label: 'Very confident' },
      { value: '5', label: 'Extremely confident' }
    ]
  },
  {
    id: 'evaluation_plan_post',
    question: 'How confident are you NOW in creating evaluation plans?',
    type: 'radio',
    options: [
      { value: '1', label: 'Not confident at all' },
      { value: '2', label: 'Somewhat confident' },
      { value: '3', label: 'Moderately confident' },
      { value: '4', label: 'Very confident' },
      { value: '5', label: 'Extremely confident' }
    ]
  },
  {
    id: 'funder_research_post',
    question: 'How confident are you NOW in researching and aligning with funders?',
    type: 'radio',
    options: [
      { value: '1', label: 'Not confident at all' },
      { value: '2', label: 'Somewhat confident' },
      { value: '3', label: 'Moderately confident' },
      { value: '4', label: 'Very confident' },
      { value: '5', label: 'Extremely confident' }
    ]
  },
  {
    id: 'training_value',
    question: 'How valuable was this training program to your professional development?',
    type: 'radio',
    options: [
      { value: '1', label: 'Not valuable' },
      { value: '2', label: 'Somewhat valuable' },
      { value: '3', label: 'Moderately valuable' },
      { value: '4', label: 'Very valuable' },
      { value: '5', label: 'Extremely valuable' }
    ]
  },
  {
    id: 'key_learnings',
    question: 'What were the most valuable things you learned during this training?',
    type: 'textarea'
  },
  {
    id: 'improvements',
    question: 'What improvements would you suggest for this training program?',
    type: 'textarea'
  },
  {
    id: 'next_steps',
    question: 'What are your next steps in applying what you\'ve learned?',
    type: 'textarea'
  }
];

export default function TrainingPostAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
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

  const { data: existingPostAssessment } = useQuery({
    queryKey: ['post-assessment', user?.email],
    queryFn: async () => {
      const assessments = await base44.entities.GrantWritingAssessment.filter({
        user_email: user.email,
        assessment_type: 'post'
      });
      return assessments[0];
    },
    enabled: !!user?.email
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.GrantWritingAssessment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['post-assessment']);
      toast.success('Post-assessment submitted successfully!');
    }
  });

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const assessmentData = {
      user_email: user.email,
      user_name: user.full_name,
      assessment_type: 'post',
      assessment_date: new Date().toISOString(),
      responses: {
        experience_level: responses.experience_change || 'intermediate',
        skill_ratings: [
          { skill: 'Needs Assessment', rating: parseInt(responses.needs_assessment_post || '3') },
          { skill: 'Budget Development', rating: parseInt(responses.budget_development_post || '3') },
          { skill: 'Evaluation Plan', rating: parseInt(responses.evaluation_plan_post || '3') },
          { skill: 'Funder Research', rating: parseInt(responses.funder_research_post || '3') }
        ],
        training_value: parseInt(responses.training_value || '5'),
        key_learnings: responses.key_learnings || '',
        improvements: responses.improvements || '',
        next_steps: responses.next_steps || ''
      },
      overall_score: 0,
      completed: true
    };

    submitMutation.mutate(assessmentData);
  };

  if (!preAssessment) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pre-Assessment Required</h2>
              <p className="text-slate-600 mb-6">
                You need to complete the pre-assessment before taking the post-assessment.
              </p>
              <Button onClick={() => window.location.href = '/TrainingPreAssessment'}>
                Take Pre-Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (existingPostAssessment) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Post-Assessment Complete</h2>
              <p className="text-slate-600 mb-6">
                You've already completed your post-assessment. Thank you for your feedback!
              </p>
              <Button onClick={() => window.location.href = '/TrainingFramework'}>
                Go to Training Framework
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = ASSESSMENT_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Training Post-Assessment</CardTitle>
            <CardDescription>
              Help us measure your progress and improve our training program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-6" />
            <div className="mb-4">
              <span className="text-sm text-slate-600">
                Question {currentStep + 1} of {ASSESSMENT_QUESTIONS.length}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-4 block">
                  {currentQuestion.question}
                </Label>

                {currentQuestion.type === 'radio' && (
                  <RadioGroup
                    value={responses[currentQuestion.id]}
                    onValueChange={(value) => handleResponse(currentQuestion.id, value)}
                  >
                    <div className="space-y-3">
                      {currentQuestion.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.type === 'textarea' && (
                  <Textarea
                    value={responses[currentQuestion.id] || ''}
                    onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                    rows={5}
                    placeholder="Type your response here..."
                    className="w-full"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              {currentStep < ASSESSMENT_QUESTIONS.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}