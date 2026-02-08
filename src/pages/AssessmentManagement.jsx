import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Edit, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const assessmentTypes = {
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

export default function AssessmentManagementPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const queryClient = useQueryClient();

  const { data: assessments = [] } = useQuery({
    queryKey: ['allAssessments'],
    queryFn: () => base44.entities.CompetencyAssessment.list('-created_date')
  });

  const { data: consultants = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: () => base44.entities.ConsultantOnboarding.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CompetencyAssessment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allAssessments']);
      toast.success('Assessment updated');
      setSelectedConsultant(null);
    }
  });

  const handleScore = (assessment, score, feedback) => {
    const status = score >= assessment.passing_score ? 'passed' : 'failed';
    const attempt = {
      attempt_date: new Date().toISOString(),
      score,
      feedback,
      evaluator_email: 'admin@eis.com'
    };

    updateMutation.mutate({
      id: assessment.id,
      data: {
        status,
        score,
        evaluator_feedback: feedback,
        completed_date: new Date().toISOString(),
        attempts: [...(assessment.attempts || []), attempt]
      }
    });
  };

  const submitted = assessments.filter(a => a.status === 'submitted');
  const scored = assessments.filter(a => a.status === 'passed' || a.status === 'failed');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Assessment Management</h1>
            <p className="text-slate-600">Review and score consultant assessments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Review</p>
                  <p className="text-2xl font-bold text-slate-900">{submitted.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Scored</p>
                  <p className="text-2xl font-bold text-slate-900">{scored.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {scored.length > 0 ? Math.round((assessments.filter(a => a.status === 'passed').length / scored.length) * 100) : 0}%
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending Review ({submitted.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submitted.map((assessment) => (
              <div key={assessment.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{assessment.assessment_title}</h3>
                      <Badge>{assessmentTypes[assessment.assessment_type]}</Badge>
                      <Badge variant="outline">{assessment.level_requirement}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Consultant: {assessment.consultant_email}
                    </p>
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
                  <Button size="sm" onClick={() => setSelectedConsultant(assessment)}>
                    Score Assessment
                  </Button>
                </div>
              </div>
            ))}
            {submitted.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No assessments pending review</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Scored</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scored.slice(0, 10).map((assessment) => (
              <div 
                key={assessment.id} 
                className={`p-3 rounded-lg ${assessment.status === 'passed' ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{assessment.assessment_title}</p>
                    <p className="text-sm text-slate-600">{assessment.consultant_email}</p>
                  </div>
                  <Badge className={assessment.status === 'passed' ? 'bg-green-600' : 'bg-red-600'}>
                    {assessment.score}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {selectedConsultant && (
          <Dialog open onOpenChange={() => setSelectedConsultant(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Score Assessment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-slate-900">{selectedConsultant.assessment_title}</p>
                  <p className="text-sm text-slate-600">{selectedConsultant.consultant_email}</p>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleScore(
                    selectedConsultant,
                    parseInt(formData.get('score')),
                    formData.get('feedback')
                  );
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label>Score (0-100)</Label>
                      <Input type="number" name="score" min="0" max="100" required />
                      <p className="text-xs text-slate-600 mt-1">
                        Passing score: {selectedConsultant.passing_score}%
                      </p>
                    </div>
                    <div>
                      <Label>Feedback</Label>
                      <Textarea name="feedback" rows={4} required />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setSelectedConsultant(null)}>
                        Cancel
                      </Button>
                      <Button type="submit">Submit Score</Button>
                    </div>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}