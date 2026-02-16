import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import AIFeedbackPanel from '@/components/workbook/AIFeedbackPanel';
import CollaborationPanel from '@/components/workbook/CollaborationPanel';
import { 
  Save, 
  Download, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Sparkles,
  Users
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const GUIDEBOOK_SECTIONS = [
  {
    id: 'problem',
    title: 'The Problem',
    description: 'Define the problem your organization addresses',
    fields: [
      { id: 'problem_statement', label: 'Problem Statement', type: 'textarea', rows: 4, placeholder: 'Describe the core problem or need in your community...' },
      { id: 'who_affected', label: 'Who is Affected?', type: 'textarea', rows: 3, placeholder: 'Describe the population impacted by this problem...' },
      { id: 'statistics', label: 'Supporting Statistics', type: 'textarea', rows: 3, placeholder: 'Include relevant data and statistics...' }
    ]
  },
  {
    id: 'organization',
    title: 'About Your Organization',
    description: 'Tell your organization\'s story',
    fields: [
      { id: 'org_name', label: 'Organization Name', type: 'input', placeholder: 'Your organization name' },
      { id: 'mission', label: 'Mission Statement', type: 'textarea', rows: 3, placeholder: 'Your organization\'s mission...' },
      { id: 'history', label: 'History & Background', type: 'textarea', rows: 4, placeholder: 'When was your organization founded and why?...' },
      { id: 'achievements', label: 'Key Achievements', type: 'textarea', rows: 3, placeholder: 'Major milestones and accomplishments...' }
    ]
  },
  {
    id: 'programs',
    title: 'Programs and Approach',
    description: 'Describe your programs and methodology',
    fields: [
      { id: 'program_overview', label: 'Program Overview', type: 'textarea', rows: 4, placeholder: 'Describe your main programs and services...' },
      { id: 'approach', label: 'Your Approach', type: 'textarea', rows: 4, placeholder: 'How do you deliver your services? What makes your approach unique?...' },
      { id: 'target_population', label: 'Target Population', type: 'textarea', rows: 3, placeholder: 'Who do you serve?...' }
    ]
  },
  {
    id: 'program_details',
    title: 'Program Details',
    description: 'Detailed program information',
    fields: [
      { id: 'program_activities', label: 'Key Activities', type: 'textarea', rows: 4, placeholder: 'List your main program activities...' },
      { id: 'timeline', label: 'Timeline', type: 'textarea', rows: 3, placeholder: 'Program schedule and timeline...' },
      { id: 'capacity', label: 'Current Capacity', type: 'textarea', rows: 3, placeholder: 'How many people do you currently serve?...' }
    ]
  },
  {
    id: 'impact',
    title: 'Impact',
    description: 'Demonstrate your results and outcomes',
    fields: [
      { id: 'outcomes', label: 'Key Outcomes', type: 'textarea', rows: 4, placeholder: 'What measurable outcomes have you achieved?...' },
      { id: 'success_metrics', label: 'Success Metrics', type: 'textarea', rows: 3, placeholder: 'How do you measure success?...' },
      { id: 'beneficiaries_served', label: 'Beneficiaries Served', type: 'input', placeholder: 'Number of people served...' },
      { id: 'impact_stories', label: 'Impact Stories', type: 'textarea', rows: 4, placeholder: 'Share brief stories of impact...' }
    ]
  },
  {
    id: 'testimonial',
    title: 'Testimonial',
    description: 'Share a powerful testimonial',
    fields: [
      { id: 'testimonial_quote', label: 'Testimonial Quote', type: 'textarea', rows: 4, placeholder: 'A powerful quote from a beneficiary, partner, or supporter...' },
      { id: 'testimonial_name', label: 'Name', type: 'input', placeholder: 'Name of person providing testimonial' },
      { id: 'testimonial_title', label: 'Title/Relationship', type: 'input', placeholder: 'Program participant, Board Member, etc.' }
    ]
  },
  {
    id: 'financials',
    title: 'Financials',
    description: 'Financial overview and needs',
    fields: [
      { id: 'annual_budget', label: 'Annual Operating Budget', type: 'input', placeholder: '$XXX,XXX' },
      { id: 'funding_sources', label: 'Current Funding Sources', type: 'textarea', rows: 3, placeholder: 'List your major funding sources...' },
      { id: 'funding_need', label: 'Funding Need', type: 'input', placeholder: '$XX,XXX' },
      { id: 'use_of_funds', label: 'How Funds Will Be Used', type: 'textarea', rows: 4, placeholder: 'Describe how the requested funding will be allocated...' }
    ]
  },
  {
    id: 'call_to_action',
    title: 'Call to Action',
    description: 'Make a compelling ask',
    fields: [
      { id: 'ask_statement', label: 'The Ask', type: 'textarea', rows: 3, placeholder: 'We are seeking $XX,XXX to...' },
      { id: 'impact_of_support', label: 'Impact of Support', type: 'textarea', rows: 4, placeholder: 'Describe what will be possible with this support...' },
      { id: 'urgency', label: 'Why Now?', type: 'textarea', rows: 3, placeholder: 'Why is this support needed now?...' }
    ]
  },
  {
    id: 'contact',
    title: 'Thank You & Contact',
    description: 'Contact information and closing',
    fields: [
      { id: 'closing_statement', label: 'Closing Statement', type: 'textarea', rows: 3, placeholder: 'Thank you message...' },
      { id: 'contact_name', label: 'Contact Name', type: 'input', placeholder: 'Primary contact person' },
      { id: 'contact_title', label: 'Contact Title', type: 'input', placeholder: 'Executive Director, etc.' },
      { id: 'contact_email', label: 'Email', type: 'input', placeholder: 'email@organization.org' },
      { id: 'contact_phone', label: 'Phone', type: 'input', placeholder: '(XXX) XXX-XXXX' },
      { id: 'website', label: 'Website', type: 'input', placeholder: 'www.yourorganization.org' }
    ]
  }
];

export default function CaseForSupport() {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [activeAIField, setActiveAIField] = useState(null);
  const [activeCollabField, setActiveCollabField] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Load existing responses
  const { data: savedResponses } = useQuery({
    queryKey: ['case-for-support', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const docs = await base44.entities.Document.filter({
        owner_email: user.email,
        document_type: 'case_for_support'
      });
      return docs[0];
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (savedResponses?.content) {
      try {
        setResponses(JSON.parse(savedResponses.content));
      } catch (e) {
        console.error('Failed to parse saved responses');
      }
    }
  }, [savedResponses]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (savedResponses?.id) {
        return await base44.entities.Document.update(savedResponses.id, {
          content: JSON.stringify(data),
          title: 'Case for Support Guidebook'
        });
      } else {
        return await base44.entities.Document.create({
          title: 'Case for Support Guidebook',
          document_type: 'case_for_support',
          content: JSON.stringify(data),
          owner_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['case-for-support', user?.email]);
      setLastSaved(new Date());
      toast.success('Progress saved!');
    }
  });

  const handleFieldChange = (sectionId, fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldId]: value
      }
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(responses);
  };

  const calculateProgress = () => {
    let totalFields = 0;
    let filledFields = 0;

    GUIDEBOOK_SECTIONS.forEach(section => {
      section.fields.forEach(field => {
        totalFields++;
        const value = responses[section.id]?.[field.id];
        if (value && value.trim() !== '') {
          filledFields++;
        }
      });
    });

    return Math.round((filledFields / totalFields) * 100);
  };

  const isSectionComplete = (sectionId) => {
    const section = GUIDEBOOK_SECTIONS.find(s => s.id === sectionId);
    if (!section) return false;

    return section.fields.every(field => {
      const value = responses[sectionId]?.[field.id];
      return value && value.trim() !== '';
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title page
    doc.setFontSize(24);
    doc.text('Case for Support', 105, 40, { align: 'center' });
    
    doc.setFontSize(14);
    const orgName = responses['organization']?.['org_name'] || 'Your Organization';
    doc.text(orgName, 105, 55, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 70, { align: 'center' });

    // Content pages
    GUIDEBOOK_SECTIONS.forEach(section => {
      doc.addPage();
      yPosition = 20;

      // Section title
      doc.setFontSize(18);
      doc.setTextColor(68, 58, 80);
      doc.text(section.title, 20, yPosition);
      yPosition += 10;

      // Section content
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      section.fields.forEach(field => {
        const value = responses[section.id]?.[field.id] || '';
        
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont(undefined, 'bold');
        doc.text(field.label + ':', 20, yPosition);
        yPosition += 6;

        doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(value || '[Not completed]', 170);
        doc.text(lines, 20, yPosition);
        yPosition += (lines.length * 5) + 8;
      });
    });

    doc.save('Case-for-Support.pdf');
    toast.success('PDF downloaded!');
  };

  const progress = calculateProgress();
  const currentSectionData = GUIDEBOOK_SECTIONS[currentSection];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Case for Support Guidebook</h1>
              <p className="text-slate-600 mt-1">Create a compelling case for support document</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Progress'}
              </Button>
              <Button
                onClick={generatePDF}
                className="bg-[#143A50] hover:bg-[#1E4F58]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="border-2 border-[#E5C089]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                <span className="text-sm font-bold text-[#143A50]">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              {lastSaved && (
                <p className="text-xs text-slate-500 mt-2">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {GUIDEBOOK_SECTIONS.map((section, index) => {
                const isComplete = isSectionComplete(section.id);
                const isCurrent = index === currentSection;

                return (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(index)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isCurrent
                        ? 'bg-[#E5C089]/20 border-l-4 border-[#143A50]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isCurrent ? 'text-[#143A50]' : 'text-slate-700'}`}>
                        {section.title}
                      </p>
                    </div>
                    {isCurrent && <ChevronRight className="w-4 h-4 text-[#143A50]" />}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] text-white">
                <CardTitle className="text-2xl">{currentSectionData.title}</CardTitle>
                <CardDescription className="text-white/80">
                  {currentSectionData.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {currentSectionData.fields.map((field) => {
                    const fieldValue = responses[currentSectionData.id]?.[field.id] || '';
                    return (
                      <div key={field.id} className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={field.id} className="text-base font-medium">
                              {field.label}
                            </Label>
                            {field.type === 'textarea' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setActiveAIField(activeAIField === field.id ? null : field.id)}
                                  className="text-purple-600 hover:text-purple-700 h-8 px-2"
                                >
                                  <Sparkles className="w-4 h-4 mr-1" />
                                  AI Feedback
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setActiveCollabField(activeCollabField === field.id ? null : field.id)}
                                  className="text-blue-600 hover:text-blue-700 h-8 px-2"
                                >
                                  <Users className="w-4 h-4 mr-1" />
                                  Collaborate
                                </Button>
                              </div>
                            )}
                          </div>
                          {field.type === 'textarea' ? (
                            <Textarea
                              id={field.id}
                              rows={field.rows || 4}
                              placeholder={field.placeholder}
                              value={fieldValue}
                              onChange={(e) => handleFieldChange(currentSectionData.id, field.id, e.target.value)}
                              className="mt-2"
                            />
                          ) : (
                            <Input
                              id={field.id}
                              placeholder={field.placeholder}
                              value={fieldValue}
                              onChange={(e) => handleFieldChange(currentSectionData.id, field.id, e.target.value)}
                              className="mt-2"
                            />
                          )}
                        </div>
                        {activeAIField === field.id && (
                          <AIFeedbackPanel
                            fieldLabel={field.label}
                            userResponse={fieldValue}
                            onClose={() => setActiveAIField(null)}
                          />
                        )}
                        {activeCollabField === field.id && (
                          <CollaborationPanel
                            pageId={currentSectionData.id}
                            fieldId={field.id}
                            responses={responses[currentSectionData.id] || {}}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                    disabled={currentSection === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="text-sm text-slate-600">
                    Section {currentSection + 1} of {GUIDEBOOK_SECTIONS.length}
                  </div>

                  <Button
                    onClick={() => {
                      if (currentSection < GUIDEBOOK_SECTIONS.length - 1) {
                        setCurrentSection(prev => prev + 1);
                      }
                    }}
                    disabled={currentSection === GUIDEBOOK_SECTIONS.length - 1}
                    className="bg-[#143A50] hover:bg-[#1E4F58]"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Tips for this section:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {currentSectionData.id === 'problem' && (
                        <>
                          <li>• Be specific about the problem and its scope</li>
                          <li>• Use data and statistics when possible</li>
                          <li>• Focus on the need, not your solution (yet)</li>
                        </>
                      )}
                      {currentSectionData.id === 'organization' && (
                        <>
                          <li>• Keep your mission statement concise and clear</li>
                          <li>• Highlight what makes your organization unique</li>
                          <li>• Include relevant credentials and track record</li>
                        </>
                      )}
                      {currentSectionData.id === 'impact' && (
                        <>
                          <li>• Use specific, measurable outcomes</li>
                          <li>• Include both quantitative and qualitative data</li>
                          <li>• Share concrete examples of success</li>
                        </>
                      )}
                      {currentSectionData.id === 'financials' && (
                        <>
                          <li>• Be transparent about your budget</li>
                          <li>• Show fiscal responsibility</li>
                          <li>• Explain exactly how funds will be used</li>
                        </>
                      )}
                      {currentSectionData.id === 'call_to_action' && (
                        <>
                          <li>• Make a specific, clear ask</li>
                          <li>• Connect the ask to tangible impact</li>
                          <li>• Create a sense of urgency</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}