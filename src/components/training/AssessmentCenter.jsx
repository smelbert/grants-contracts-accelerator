import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, CheckCircle2, XCircle, Clock, 
  AlertTriangle, Award, TrendingUp 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const assessmentTypeLabels = {
  compliance_quiz: 'Compliance Quiz',
  reviewer_simulation: 'Reviewer Simulation',
  strategy_brief: 'Strategy Brief',
  budget_alignment_simulation: 'Budget Alignment',
  ethics_scenario: 'Ethics Scenario',
  clean_draft_submission: 'Clean Draft',
  qa_calibration_test: 'QA Calibration',
  mentorship_evaluation: 'Mentorship Eval',
  final_authority_simulation: 'Final Authority Sim',
  trainer_certification: 'Trainer Certification'
};

export default function AssessmentCenter({ consultantEmail, currentLevel }) {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const queryClient = useQueryClient();

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments', consultantEmail],
    queryFn: () => base44.entities.CompetencyAssessment.filter({ 
      consultant_email: consultantEmail 
    }),
    enabled: !!consultantEmail
  });

  // Real-time subscription for live updates
  React.useEffect(() => {
    const unsubscribe = base44.entities.CompetencyAssessment.subscribe((event) => {
      if (event.data?.consultant_email === consultantEmail) {
        queryClient.invalidateQueries(['assessments', consultantEmail]);
      }
    });
    return unsubscribe;
  }, [consultantEmail]);

  const { data: availableAssessments = [] } = useQuery({
    queryKey: ['availableAssessments', currentLevel],
    queryFn: () => base44.entities.CompetencyAssessment.filter({ 
      level_requirement: currentLevel,
      consultant_email: { $exists: false }
    }),
    enabled: !!currentLevel
  });

  const startAssessmentMutation = useMutation({
    mutationFn: (assessmentTemplate) => {
      return base44.entities.CompetencyAssessment.create({
        ...assessmentTemplate,
        consultant_email: consultantEmail,
        status: 'in_progress',
        attempts: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assessments']);
      toast.success('Assessment started');
    }
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: ({ assessmentId, submissionUrl }) => {
      return base44.entities.CompetencyAssessment.update(assessmentId, {
        status: 'submitted',
        submission_url: submissionUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assessments']);
      toast.success('Assessment submitted for review');
      setSelectedAssessment(null);
    }
  });

  const notStarted = assessments.filter(a => a.status === 'not_started');
  const inProgress = assessments.filter(a => a.status === 'in_progress');
  const submitted = assessments.filter(a => a.status === 'submitted');
  const passed = assessments.filter(a => a.status === 'passed');
  const failed = assessments.filter(a => a.status === 'failed');

  const passRate = assessments.length > 0 
    ? (passed.length / assessments.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(passRate)}%</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Passed</p>
                <p className="text-2xl font-bold text-slate-900">{passed.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-slate-900">{inProgress.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-slate-900">{submitted.length}</p>
              </div>
              <FileText className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active ({inProgress.length + submitted.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({passed.length})</TabsTrigger>
              <TabsTrigger value="failed">Needs Retake ({failed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3 mt-4">
              {[...inProgress, ...submitted].map((assessment) => (
                <div
                  key={assessment.id}
                  className={`p-4 rounded-lg border-2 ${
                    assessment.status === 'submitted'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{assessment.assessment_title}</h3>
                        <Badge variant="outline">
                          {assessmentTypeLabels[assessment.assessment_type]}
                        </Badge>
                        {assessment.required_for_promotion && (
                          <Badge className="bg-red-600">Required</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        {assessment.status === 'in_progress' ? (
                          <Badge className="bg-blue-600">In Progress</Badge>
                        ) : (
                          <Badge className="bg-amber-600">Awaiting Review</Badge>
                        )}
                        {assessment.attempts && assessment.attempts.length > 0 && (
                          <span>Attempt {assessment.attempts.length}/{assessment.max_attempts}</span>
                        )}
                      </div>

                      {assessment.submission_url && (
                        <a 
                          href={assessment.submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Submission →
                        </a>
                      )}
                    </div>

                    {assessment.status === 'in_progress' && (
                      <Button 
                        size="sm"
                        onClick={() => setSelectedAssessment(assessment)}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {inProgress.length === 0 && submitted.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No active assessments</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {passed.map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 rounded-lg bg-green-50 border-2 border-green-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-slate-900">{assessment.assessment_title}</h3>
                        <Badge className="bg-green-600">{assessment.score}%</Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-2">
                        Completed {assessment.completed_date && format(new Date(assessment.completed_date), 'MMM d, yyyy')}
                      </p>

                      {assessment.evaluator_feedback && (
                        <div className="mt-2 p-3 bg-white/50 rounded text-sm text-slate-700">
                          <p className="font-medium mb-1">Evaluator Feedback:</p>
                          <p>{assessment.evaluator_feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {passed.length === 0 && (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No completed assessments yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="failed" className="space-y-3 mt-4">
              {failed.map((assessment) => {
                const attemptsLeft = assessment.max_attempts - (assessment.attempts?.length || 0);
                const canRetake = assessment.retake_allowed && attemptsLeft > 0;

                return (
                  <div
                    key={assessment.id}
                    className="p-4 rounded-lg bg-red-50 border-2 border-red-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <h3 className="font-semibold text-slate-900">{assessment.assessment_title}</h3>
                          <Badge className="bg-red-600">{assessment.score}% (Need {assessment.passing_score}%)</Badge>
                        </div>
                        
                        {assessment.evaluator_feedback && (
                          <div className="mt-2 p-3 bg-white/50 rounded text-sm text-slate-700">
                            <p className="font-medium mb-1">Feedback:</p>
                            <p>{assessment.evaluator_feedback}</p>
                          </div>
                        )}

                        <div className="mt-2 text-sm text-slate-600">
                          {canRetake ? (
                            <p className="text-amber-600">{attemptsLeft} attempt{attemptsLeft > 1 ? 's' : ''} remaining</p>
                          ) : (
                            <p className="text-red-600">Maximum attempts reached</p>
                          )}
                        </div>
                      </div>

                      {canRetake && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => startAssessmentMutation.mutate(assessment)}
                        >
                          Retake
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {failed.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No failed assessments</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedAssessment && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Submit Assessment: {selectedAssessment.assessment_title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Submission URL or File Link
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  onBlur={(e) => {
                    if (e.target.value) {
                      submitAssessmentMutation.mutate({
                        assessmentId: selectedAssessment.id,
                        submissionUrl: e.target.value
                      });
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedAssessment(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}