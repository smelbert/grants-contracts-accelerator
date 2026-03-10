import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Wand2, Download, ChevronRight, FileText, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = {
  SELECT_PROJECT: 'select',
  CHOOSE_TEMPLATE: 'template',
  CUSTOMIZE: 'customize',
  GENERATE: 'generate'
};

export default function DocumentAssemblyPage() {
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_PROJECT);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizations, setCustomizations] = useState({
    projectDescription: '',
    specificFocus: '',
    additionalDetails: ''
  });
  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: organization } = useQuery({
    queryKey: ['org-for-assembly', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const orgs = await base44.entities.Organization.filter({ primary_contact_email: user.email });
      return orgs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-for-assembly', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const projs = await base44.entities.Project.filter({ organization_id: organization.id }, '-created_date');
      return projs.filter(p => p.proposal_stage === 'drafting' || p.proposal_stage === 'sent');
    },
    enabled: !!organization?.id
  });

  const { data: awardedProjects = [] } = useQuery({
    queryKey: ['awarded-projects', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const projs = await base44.entities.Project.filter({ organization_id: organization.id });
      return projs.filter(p => p.proposal_stage === 'awarded');
    },
    enabled: !!organization?.id
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const temps = await base44.entities.Template.list('-created_date', 50);
      return temps.filter(t => t.is_published && t.is_active);
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      try {
        const response = await base44.functions.invoke('assembleProposal', {
          project_id: selectedProject.id,
          template_id: selectedTemplate.id,
          organization_id: organization.id,
          customizations,
          user_email: user.email
        });
        return response.data;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: (data) => {
      setGeneratedDocument(data);
      setCurrentStep(STEPS.GENERATE);
      toast.success('Proposal generated successfully!');
    },
    onError: (err) => {
      toast.error('Generation failed: ' + err.message);
    }
  });

  const saveDocumentMutation = useMutation({
    mutationFn: async (docData) => {
      return base44.entities.Document.create({
        doc_name: `${selectedProject.project_name} - Proposal`,
        doc_type: 'proposal',
        content: docData.content,
        file_url: docData.file_url,
        status: 'draft',
        ai_assisted: true
      });
    },
    onSuccess: () => {
      toast.success('Document saved to your library!');
      setTimeout(() => window.location.href = '/documents', 1500);
    }
  });

  const downloadProposal = async () => {
    if (!generatedDocument?.file_url) {
      toast.error('No file available for download');
      return;
    }
    window.open(generatedDocument.file_url, '_blank');
  };

  const handleNext = () => {
    if (currentStep === STEPS.SELECT_PROJECT && !selectedProject) {
      toast.error('Please select a project');
      return;
    }
    if (currentStep === STEPS.CHOOSE_TEMPLATE && !selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    if (currentStep === STEPS.CUSTOMIZE) {
      generateMutation.mutate();
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#143A50] flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-[#E5C089]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Document Assembly</h1>
              <p className="text-slate-600">Auto-generate proposals by merging templates, org data & past successes</p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {[STEPS.SELECT_PROJECT, STEPS.CHOOSE_TEMPLATE, STEPS.CUSTOMIZE, STEPS.GENERATE].map((step, idx) => (
              <React.Fragment key={step}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep === step
                      ? 'bg-[#143A50] text-white'
                      : [STEPS.SELECT_PROJECT, STEPS.CHOOSE_TEMPLATE, STEPS.CUSTOMIZE].indexOf(step) < [STEPS.SELECT_PROJECT, STEPS.CHOOSE_TEMPLATE, STEPS.CUSTOMIZE, STEPS.GENERATE].indexOf(currentStep)
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < 3 && <div className="flex-1 h-1 bg-slate-200" />}
              </React.Fragment>
            ))}
          </div>
          <div className="flex gap-4 text-xs">
            <span className={currentStep === STEPS.SELECT_PROJECT ? 'font-bold' : ''}>Select Project</span>
            <span className={currentStep === STEPS.CHOOSE_TEMPLATE ? 'font-bold' : ''}>Choose Template</span>
            <span className={currentStep === STEPS.CUSTOMIZE ? 'font-bold' : ''}>Customize</span>
            <span className={currentStep === STEPS.GENERATE ? 'font-bold' : ''}>Generate</span>
          </div>
        </div>

        {/* Step 1: Select Project */}
        {currentStep === STEPS.SELECT_PROJECT && (
          <div className="space-y-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Select a Project to Generate Proposal For</CardTitle>
                <CardDescription>Choose an active project that needs a proposal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No active projects found. Create a project first.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProject(proj)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedProject?.id === proj.id
                            ? 'border-[#143A50] bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{proj.project_name}</h3>
                            <p className="text-sm text-slate-600 mt-1">{proj.funder_name || 'Funder TBD'}</p>
                            {proj.amount_asked && (
                              <div className="flex items-center gap-1 mt-2">
                                <DollarSign className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-700">${(proj.amount_asked / 1000000).toFixed(1)}M asked</span>
                              </div>
                            )}
                          </div>
                          <Badge variant="outline">{proj.proposal_stage}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {awardedProjects.length > 0 && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader>
                  <CardTitle className="text-base">Recent Successes</CardTitle>
                  <CardDescription>These projects were awarded and their narratives will help inform your proposal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {awardedProjects.slice(0, 3).map((proj) => (
                      <div key={proj.id} className="text-sm text-slate-700">
                        ✓ {proj.project_name} ({proj.amount_awarded ? `$${(proj.amount_awarded / 1000000).toFixed(1)}M` : 'awarded'})
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Choose Template */}
        {currentStep === STEPS.CHOOSE_TEMPLATE && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select a Template</CardTitle>
              <CardDescription>Choose which template structure to use for your proposal</CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No templates available.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-[#143A50] bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <h3 className="font-semibold text-slate-900">{template.template_name}</h3>
                      <p className="text-xs text-slate-500 mt-1 capitalize">{template.category}</p>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{template.purpose}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Customize */}
        {currentStep === STEPS.CUSTOMIZE && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Customize Your Proposal</CardTitle>
              <CardDescription>Add specific details to personalize the generated document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project Description (Optional)</label>
                <Textarea
                  value={customizations.projectDescription}
                  onChange={(e) => setCustomizations({...customizations, projectDescription: e.target.value})}
                  placeholder="Additional context about this project or proposal..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Specific Focus Areas (Optional)</label>
                <Textarea
                  value={customizations.specificFocus}
                  onChange={(e) => setCustomizations({...customizations, specificFocus: e.target.value})}
                  placeholder="e.g., 'Focus on youth engagement and outcomes measurement'"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Additional Details (Optional)</label>
                <Textarea
                  value={customizations.additionalDetails}
                  onChange={(e) => setCustomizations({...customizations, additionalDetails: e.target.value})}
                  placeholder="Any other information to include..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Generated Document */}
        {currentStep === STEPS.GENERATE && generatedDocument && (
          <Card className="mb-8">
            <CardHeader className="bg-emerald-50 border-b border-emerald-200">
              <CardTitle className="text-emerald-900">Proposal Generated Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700 mb-3">
                  Your proposal has been assembled using {organization?.organization_name}, your templates, and past successful projects.
                </p>
                <div className="space-y-2 text-sm">
                  <div><strong>Project:</strong> {selectedProject.project_name}</div>
                  <div><strong>Funder:</strong> {selectedProject.funder_name}</div>
                  <div><strong>Amount Requested:</strong> ${selectedProject.amount_asked ? (selectedProject.amount_asked / 1000000).toFixed(2) : '0'}M</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={downloadProposal} className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Download className="w-4 h-4" /> Download Proposal
                </Button>
                <Button
                  onClick={() => saveDocumentMutation.mutate(generatedDocument)}
                  disabled={saveDocumentMutation.isPending}
                  className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
                >
                  {saveDocumentMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                  ) : (
                    'Save to Library'
                  )}
                </Button>
              </div>

              <Button variant="outline" onClick={() => {
                setCurrentStep(STEPS.SELECT_PROJECT);
                setSelectedProject(null);
                setSelectedTemplate(null);
                setGeneratedDocument(null);
                setCustomizations({ projectDescription: '', specificFocus: '', additionalDetails: '' });
              }} className="w-full">
                Generate Another Proposal
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {currentStep !== STEPS.SELECT_PROJECT && (
            <Button
              variant="outline"
              onClick={() => {
                const steps = [STEPS.SELECT_PROJECT, STEPS.CHOOSE_TEMPLATE, STEPS.CUSTOMIZE, STEPS.GENERATE];
                const currentIdx = steps.indexOf(currentStep);
                if (currentIdx > 0) setCurrentStep(steps[currentIdx - 1]);
              }}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {currentStep !== STEPS.GENERATE && (
            <Button
              onClick={handleNext}
              disabled={isGenerating}
              className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <>
                  {currentStep === STEPS.CUSTOMIZE ? 'Generate Proposal' : 'Next'} <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}