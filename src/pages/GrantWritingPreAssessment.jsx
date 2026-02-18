import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SKILLS_TO_RATE = [
  { id: 'needs_assessment', label: 'Conducting Needs Assessments', description: 'Identifying community problems and documenting evidence' },
  { id: 'goals_objectives', label: 'Writing SMART Goals & Objectives', description: 'Creating specific, measurable, achievable goals' },
  { id: 'methods_strategies', label: 'Program Design & Methods', description: 'Developing strategies and activities to meet objectives' },
  { id: 'evaluation_plan', label: 'Evaluation Planning', description: 'Creating logic models and measurement plans' },
  { id: 'budget_development', label: 'Budget Development', description: 'Creating accurate, detailed budgets with justifications' },
  { id: 'sustainability', label: 'Sustainability Planning', description: 'Planning for program continuation beyond grant period' },
  { id: 'organizational_capacity', label: 'Demonstrating Organizational Capacity', description: 'Showcasing organizational readiness and track record' },
  { id: 'narrative_writing', label: 'Compelling Narrative Writing', description: 'Writing clear, persuasive, and engaging narratives' },
  { id: 'compliance_requirements', label: 'Understanding Compliance', description: 'Knowledge of reporting, regulations, and requirements' },
  { id: 'research_funder_alignment', label: 'Funder Research & Alignment', description: 'Matching projects with appropriate funding sources' }
];

const SCENARIOS = [
  {
    id: 'scenario_1',
    title: 'Needs Assessment Challenge',
    prompt: 'A local nonprofit wants to address food insecurity in their community. They have anecdotal evidence but no hard data. How would you help them conduct and document a needs assessment for a grant proposal?'
  },
  {
    id: 'scenario_2',
    title: 'Budget Justification',
    prompt: 'A funder questions why your budget includes $50,000 for staff salaries when the program is only 6 months long. How would you justify this cost?'
  },
  {
    id: 'scenario_3',
    title: 'Evaluation Design',
    prompt: 'You\'re writing a grant for a job training program. The funder wants to know how you\'ll measure success beyond completion rates. Describe an evaluation plan.'
  },
  {
    id: 'scenario_4',
    title: 'Sustainability Planning',
    prompt: 'A one-year grant will fund a new after-school program. How would you address sustainability in the proposal to show the program will continue after the grant ends?'
  }
];

export default function GrantWritingPreAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    experience_level: '',
    years_experience: 0,
    grants_written: 0,
    grants_funded: 0,
    funding_sources_familiarity: [],
    section_scores: {},
    skill_ratings: SKILLS_TO_RATE.map(skill => ({ skill: skill.id, rating: 3 })),
    scenario_responses: SCENARIOS.map(s => ({ scenario_id: s.id, response: '' })),
    writing_sample_url: '',
    areas_for_improvement: [],
    strengths: []
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: (data) => base44.entities.GrantWritingAssessment.create({
      user_email: user.email,
      user_name: user.full_name,
      assessment_type: 'pre',
      assessment_date: new Date().toISOString(),
      responses: data,
      overall_score: calculateScore(data),
      completed: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['grant-assessments']);
      toast.success('Pre-assessment submitted successfully!');
    }
  });

  const calculateScore = (data) => {
    const skillAvg = data.skill_ratings.reduce((sum, s) => sum + s.rating, 0) / data.skill_ratings.length;
    return Math.round((skillAvg / 5) * 100);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, writing_sample_url: file_url });
      toast.success('Writing sample uploaded');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
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

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Grant Writing Pre-Assessment</h1>
          <p className="text-slate-600">Help us understand your current grant writing knowledge and experience</p>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-slate-600 mt-2">Step {currentStep} of {totalSteps}</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Background & Experience</h2>
                </div>

                <div>
                  <Label>Current Experience Level</Label>
                  <Select value={formData.experience_level} onValueChange={(value) => setFormData({ ...formData, experience_level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No experience</SelectItem>
                      <SelectItem value="beginner">Beginner (1-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Total Grants Written</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.grants_written}
                      onChange={(e) => setFormData({ ...formData, grants_written: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Grants That Received Funding</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.grants_funded}
                    onChange={(e) => setFormData({ ...formData, grants_funded: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Types of Funders You've Worked With (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {['Federal Grants', 'State Grants', 'Foundation Grants', 'Corporate Giving', 'Individual Donors', 'Contracts/RFPs'].map(source => (
                      <label key={source} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.funding_sources_familiarity.includes(source)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                funding_sources_familiarity: [...formData.funding_sources_familiarity, source]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                funding_sources_familiarity: formData.funding_sources_familiarity.filter(s => s !== source)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Skill Self-Assessment</h2>
                  <p className="text-sm text-slate-600 mb-6">Rate your current skill level in each area (1 = Novice, 5 = Expert)</p>
                </div>

                {SKILLS_TO_RATE.map(skill => {
                  const rating = formData.skill_ratings.find(s => s.skill === skill.id)?.rating || 3;
                  return (
                    <div key={skill.id} className="border-b pb-4">
                      <div className="mb-2">
                        <Label className="font-semibold">{skill.label}</Label>
                        <p className="text-sm text-slate-600">{skill.description}</p>
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
                  <h2 className="text-xl font-semibold mb-2">Scenario-Based Questions</h2>
                  <p className="text-sm text-slate-600 mb-6">Respond to these real-world grant writing scenarios</p>
                </div>

                {SCENARIOS.map((scenario, index) => {
                  const response = formData.scenario_responses.find(s => s.scenario_id === scenario.id)?.response || '';
                  return (
                    <div key={scenario.id} className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Scenario {index + 1}: {scenario.title}</h3>
                      <p className="text-slate-700 mb-3">{scenario.prompt}</p>
                      <Textarea
                        value={response}
                        onChange={(e) => updateScenarioResponse(scenario.id, e.target.value)}
                        placeholder="Type your response here..."
                        rows={5}
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
                  <h2 className="text-xl font-semibold mb-2">Writing Sample</h2>
                  <p className="text-sm text-slate-600 mb-6">Upload a sample of your grant writing (optional but recommended)</p>
                </div>

                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  {formData.writing_sample_url ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                      <p className="text-sm text-slate-600">Writing sample uploaded</p>
                      <Button variant="outline" onClick={() => setFormData({ ...formData, writing_sample_url: '' })}>
                        Upload Different File
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" disabled={uploadingFile} asChild>
                          <span>{uploadingFile ? 'Uploading...' : 'Choose File'}</span>
                        </Button>
                      </Label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                      <p className="text-xs text-slate-500 mt-2">PDF or Word document</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <AlertCircle className="w-5 h-5 text-blue-600 inline mr-2" />
                  <span className="text-sm text-blue-900">
                    Your writing sample will be reviewed to assess clarity, structure, and persuasiveness
                  </span>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Self-Reflection</h2>
                  <p className="text-sm text-slate-600 mb-6">Help us understand your development goals</p>
                </div>

                <div>
                  <Label>What do you consider your strengths in grant writing?</Label>
                  <Textarea
                    value={formData.strengths.join('\n')}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value.split('\n').filter(s => s.trim()) })}
                    placeholder="List your strengths (one per line)"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>What areas would you most like to improve?</Label>
                  <Textarea
                    value={formData.areas_for_improvement.join('\n')}
                    onChange={(e) => setFormData({ ...formData, areas_for_improvement: e.target.value.split('\n').filter(s => s.trim()) })}
                    placeholder="List areas for improvement (one per line)"
                    rows={4}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Ready to Submit</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Your assessment will be reviewed to determine the best training level for you
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