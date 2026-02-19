import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ASSESSMENT_QUESTIONS = [
  {
    id: 'experience',
    question: 'How would you describe your current grant writing experience?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No experience' },
      { value: 'beginner', label: 'Beginner (0-2 years)' },
      { value: 'intermediate', label: 'Intermediate (3-5 years)' },
      { value: 'advanced', label: 'Advanced (5+ years)' }
    ]
  },
  {
    id: 'grants_written',
    question: 'Approximately how many grants have you written in total?',
    type: 'radio',
    options: [
      { value: '0', label: 'None' },
      { value: '1-5', label: '1-5 grants' },
      { value: '6-15', label: '6-15 grants' },
      { value: '16-30', label: '16-30 grants' },
      { value: '30+', label: '30+ grants' }
    ]
  },
  {
    id: 'funding_success',
    question: 'What percentage of your grants have been funded?',
    type: 'radio',
    options: [
      { value: '0', label: '0%' },
      { value: '1-25', label: '1-25%' },
      { value: '26-50', label: '26-50%' },
      { value: '51-75', label: '51-75%' },
      { value: '76-100', label: '76-100%' }
    ]
  },
  {
    id: 'needs_assessment',
    question: 'How confident are you in writing compelling needs assessments?',
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
    id: 'budget_development',
    question: 'How confident are you in developing accurate and aligned budgets?',
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
    id: 'evaluation_plan',
    question: 'How confident are you in creating evaluation plans?',
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
    id: 'funder_research',
    question: 'How confident are you in researching and aligning with funders?',
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
    id: 'goals',
    question: 'What are your main goals for this training program?',
    type: 'textarea'
  },
  {
    id: 'challenges',
    question: 'What are the biggest challenges you face in grant writing?',
    type: 'textarea'
  }
];

export default function TrainingPreAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: existingAssessment } = useQuery({
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

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.GrantWritingAssessment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pre-assessment']);
      toast.success('Pre-assessment submitted successfully!');
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
      assessment_type: 'pre',
      assessment_date: new Date().toISOString(),
      responses: {
        experience_level: responses.experience || 'none',
        grants_written: responses.grants_written || '0',
        funding_success_rate: responses.funding_success || '0',
        skill_ratings: [
          { skill: 'Needs Assessment', rating: parseInt(responses.needs_assessment || '1') },
          { skill: 'Budget Development', rating: parseInt(responses.budget_development || '1') },
          { skill: 'Evaluation Plan', rating: parseInt(responses.evaluation_plan || '1') },
          { skill: 'Funder Research', rating: parseInt(responses.funder_research || '1') }
        ],
        goals: responses.goals || '',
        challenges: responses.challenges || ''
      },
      overall_score: 0,
      completed: true
    };

    submitMutation.mutate(assessmentData);
  };

  if (existingAssessment) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pre-Assessment Complete</h2>
              <p className="text-slate-600 mb-6">
                You've already completed your pre-assessment. You can now proceed with the training.
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
            <CardTitle>Training Pre-Assessment</CardTitle>
            <CardDescription>
              Help us understand your current experience level to provide the best training experience
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