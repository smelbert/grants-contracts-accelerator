import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, Award, FileText, TrendingUp, CheckCircle2, 
  Loader2, Save, ArrowRight, ArrowLeft, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const EXPERTISE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Limited experience, learning the basics' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience, comfortable with fundamentals' },
  { value: 'advanced', label: 'Advanced', description: 'Extensive experience, can handle complex situations' },
  { value: 'expert', label: 'Expert', description: 'Master level, can teach and mentor others' }
];

const GRANT_SIZE_OPTIONS = [
  { value: 'under_10k', label: 'Under $10,000' },
  { value: '10k_50k', label: '$10,000 - $50,000' },
  { value: '50k_100k', label: '$50,000 - $100,000' },
  { value: '100k_500k', label: '$100,000 - $500,000' },
  { value: '500k_plus', label: '$500,000+' }
];

export default function CoachIntakeAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingAssessment, isLoading } = useQuery({
    queryKey: ['coach-assessment', user?.email],
    queryFn: () => base44.entities.CoachIntakeAssessment.filter({ coach_email: user.email }).then(r => r[0]),
    enabled: !!user?.email,
  });

  React.useEffect(() => {
    if (existingAssessment) {
      setFormData(existingAssessment);
    } else if (user) {
      setFormData({ coach_email: user.email, coach_name: user.full_name });
    }
  }, [existingAssessment, user]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingAssessment) {
        return base44.entities.CoachIntakeAssessment.update(existingAssessment.id, data);
      } else {
        return base44.entities.CoachIntakeAssessment.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-assessment'] });
      toast.success('Assessment saved successfully!');
    },
  });

  const handleSave = (status = 'in_progress') => {
    saveMutation.mutate({
      ...formData,
      status,
      ...(status === 'completed' && { completed_date: new Date().toISOString() })
    });
  };

  const handleSubmit = () => {
    handleSave('completed');
    toast.success('Assessment submitted! Your profile has been updated.');
  };

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E4F58]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1E4F58] text-white mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-[#143A50] mb-2">Coach Skills Assessment</h1>
          <p className="text-slate-600">Help us understand your expertise and training needs</p>
        </div>

        {/* Progress */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-medium text-[#1E4F58]">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Step 1: Grant Writing */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#143A50] mb-2 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Grant Writing Experience
                  </h2>
                  <p className="text-slate-600">Tell us about your grant writing background</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Expertise Level</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPERTISE_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, grant_writing_level: level.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.grant_writing_level === level.value
                            ? 'border-[#1E4F58] bg-[#1E4F58]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900 mb-1">{level.label}</div>
                        <div className="text-xs text-slate-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grant_years">Years of Experience</Label>
                    <Input
                      id="grant_years"
                      type="number"
                      value={formData.grant_writing_experience_years || ''}
                      onChange={(e) => setFormData({ ...formData, grant_writing_experience_years: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_grants">Total Grants Written</Label>
                    <Input
                      id="total_grants"
                      type="number"
                      value={formData.total_grants_written || ''}
                      onChange={(e) => setFormData({ ...formData, total_grants_written: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="grant_notes">Additional Notes / Specific Experience</Label>
                  <Textarea
                    id="grant_notes"
                    rows={3}
                    placeholder="Types of grants you've written, notable successes, etc."
                    value={formData.grant_writing_notes || ''}
                    onChange={(e) => setFormData({ ...formData, grant_writing_notes: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contracts & Proposals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#143A50] mb-2 flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Contracts & Proposals
                  </h2>
                  <p className="text-slate-600">Your experience with contracts and proposal development</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Contract Management Level</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPERTISE_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, contract_management_level: level.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.contract_management_level === level.value
                            ? 'border-[#1E4F58] bg-[#1E4F58]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900 mb-1">{level.label}</div>
                        <div className="text-xs text-slate-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="contract_years">Years of Contract Experience</Label>
                  <Input
                    id="contract_years"
                    type="number"
                    value={formData.contract_experience_years || ''}
                    onChange={(e) => setFormData({ ...formData, contract_experience_years: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Proposal Development Level</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPERTISE_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, proposal_development_level: level.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.proposal_development_level === level.value
                            ? 'border-[#1E4F58] bg-[#1E4F58]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900 mb-1">{level.label}</div>
                        <div className="text-xs text-slate-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="proposal_years">Years of Proposal Experience</Label>
                  <Input
                    id="proposal_years"
                    type="number"
                    value={formData.proposal_experience_years || ''}
                    onChange={(e) => setFormData({ ...formData, proposal_experience_years: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Pitches & Other Skills */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#143A50] mb-2 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Pitches & Additional Skills
                  </h2>
                  <p className="text-slate-600">Your experience with pitch coaching and related areas</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Pitch Coaching Level</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPERTISE_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, pitch_coaching_level: level.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.pitch_coaching_level === level.value
                            ? 'border-[#1E4F58] bg-[#1E4F58]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900 mb-1">{level.label}</div>
                        <div className="text-xs text-slate-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Budget Development Level</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPERTISE_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, budget_development_level: level.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.budget_development_level === level.value
                            ? 'border-[#1E4F58] bg-[#1E4F58]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900 mb-1">{level.label}</div>
                        <div className="text-xs text-slate-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">Compliance Expertise Level</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPERTISE_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, compliance_expertise_level: level.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.compliance_expertise_level === level.value
                            ? 'border-[#1E4F58] bg-[#1E4F58]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900 mb-1">{level.label}</div>
                        <div className="text-xs text-slate-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preferences & Goals */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#143A50] mb-2 flex items-center gap-2">
                    <User className="w-6 h-6" />
                    Preferences & Development Goals
                  </h2>
                  <p className="text-slate-600">Help us tailor your training and coaching assignments</p>
                </div>

                <div>
                  <Label htmlFor="avg_grant_size">Average Grant Size You Work With</Label>
                  <select
                    id="avg_grant_size"
                    value={formData.average_grant_size || ''}
                    onChange={(e) => setFormData({ ...formData, average_grant_size: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">Select...</option>
                    {GRANT_SIZE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="total_funding">Total Funding Secured (USD)</Label>
                  <Input
                    id="total_funding"
                    type="number"
                    placeholder="e.g., 1000000"
                    value={formData.total_funding_secured || ''}
                    onChange={(e) => setFormData({ ...formData, total_funding_secured: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="availability">Availability (hours per week)</Label>
                  <Input
                    id="availability"
                    type="number"
                    placeholder="e.g., 20"
                    value={formData.availability_hours_per_week || ''}
                    onChange={(e) => setFormData({ ...formData, availability_hours_per_week: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="training_priorities">Training Priorities</Label>
                  <Textarea
                    id="training_priorities"
                    rows={3}
                    placeholder="What areas would you like to develop or improve?"
                    value={formData.training_priorities || ''}
                    onChange={(e) => setFormData({ ...formData, training_priorities: e.target.value })}
                  />
                </div>

                {existingAssessment?.status === 'completed' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Assessment completed on {new Date(existingAssessment.completed_date).toLocaleDateString()}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleSave('in_progress')}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Progress
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-[#1E4F58] hover:bg-[#143A50]"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={saveMutation.isPending}
                  className="bg-[#AC1A5B] hover:bg-[#8B1549]"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
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