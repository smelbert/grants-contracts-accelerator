import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import WorkbookPage from '@/components/incubateher/WorkbookPage';
import { WORKBOOK_PAGES, getSections } from '@/components/incubateher/workbookContent';
import { ChevronLeft, ChevronRight, Save, Download, Check } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function IncubateHerWorkbook() {
  const queryClient = useQueryClient();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [allResponses, setAllResponses] = useState({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email || !cohort?.id) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email,
        cohort_id: cohort.id
      });
      return enrollments[0];
    },
    enabled: !!user?.email && !!cohort?.id
  });

  // Load assessment results for personalized guidance
  const { data: assessmentResults } = useQuery({
    queryKey: ['assessment-results', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return null;
      const assessments = await base44.entities.ProgramAssessment.filter({
        enrollment_id: enrollment.id,
        assessment_type: 'pre'
      });
      return assessments[0];
    },
    enabled: !!enrollment?.id
  });

  // Load saved responses
  const { data: savedResponses } = useQuery({
    queryKey: ['workbook-responses', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return [];
      return await base44.entities.WorkbookResponse.filter({
        enrollment_id: enrollment.id
      });
    },
    enabled: !!enrollment?.id
  });

  // Initialize responses from saved data
  useEffect(() => {
    if (savedResponses) {
      const responsesMap = {};
      savedResponses.forEach(resp => {
        responsesMap[resp.page_id] = resp.responses;
      });
      setAllResponses(responsesMap);
    }
  }, [savedResponses]);

  const saveResponsesMutation = useMutation({
    mutationFn: async ({ pageId, responses }) => {
      const existing = savedResponses?.find(r => r.page_id === pageId);
      
      if (existing) {
        return await base44.entities.WorkbookResponse.update(existing.id, {
          responses,
          last_saved: new Date().toISOString()
        });
      } else {
        return await base44.entities.WorkbookResponse.create({
          enrollment_id: enrollment.id,
          participant_email: user.email,
          page_id: pageId,
          responses,
          last_saved: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workbook-responses']);
      setLastSaved(new Date());
      toast.success('Progress saved');
    },
    onError: () => {
      toast.error('Failed to save progress');
    }
  });

  const handleResponseChange = (pageId, fieldId, value) => {
    setAllResponses(prev => ({
      ...prev,
      [pageId]: {
        ...(prev[pageId] || {}),
        [fieldId]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const currentPage = WORKBOOK_PAGES[currentPageIndex];
    
    if (currentPage.fields && allResponses[currentPage.id]) {
      await saveResponsesMutation.mutateAsync({
        pageId: currentPage.id,
        responses: allResponses[currentPage.id]
      });
    }
    
    setSaving(false);
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Cover page
    doc.setFontSize(24);
    doc.text('IncubateHer Funding Readiness Workbook', 105, yPos, { align: 'center' });
    yPos += 15;
    doc.setFontSize(16);
    doc.text('Preparing for Grants & Contracts', 105, yPos, { align: 'center' });
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`${user?.full_name || 'Participant'}`, 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text(new Date().toLocaleDateString(), 105, yPos, { align: 'center' });
    
    // Process each page
    WORKBOOK_PAGES.forEach((page, idx) => {
      if (idx > 0) doc.addPage();
      yPos = 20;
      
      // Page title
      doc.setFontSize(16);
      doc.text(page.title, 20, yPos);
      yPos += 10;
      
      // Add responses if this is a worksheet
      if (page.fields && allResponses[page.id]) {
        doc.setFontSize(10);
        page.fields.forEach(field => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont(undefined, 'bold');
          doc.text(field.label, 20, yPos);
          yPos += 7;
          
          doc.setFont(undefined, 'normal');
          const response = allResponses[page.id][field.id];
          
          if (response) {
            if (typeof response === 'string') {
              const lines = doc.splitTextToSize(response, 170);
              lines.forEach(line => {
                if (yPos > 280) {
                  doc.addPage();
                  yPos = 20;
                }
                doc.text(line, 25, yPos);
                yPos += 5;
              });
            } else if (Array.isArray(response)) {
              response.forEach(item => {
                if (yPos > 280) {
                  doc.addPage();
                  yPos = 20;
                }
                doc.text(`• ${item}`, 25, yPos);
                yPos += 5;
              });
            }
          } else {
            doc.text('(No response)', 25, yPos);
            yPos += 5;
          }
          
          yPos += 5;
        });
      }
    });

    doc.save(`IncubateHer_Workbook_${user?.full_name || 'Participant'}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Workbook downloaded');
  };

  const currentPage = WORKBOOK_PAGES[currentPageIndex];
  const sections = getSections();

  const goToPage = (index) => {
    if (index >= 0 && index < WORKBOOK_PAGES.length) {
      setCurrentPageIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <CoBrandedHeader 
        title="Interactive Workbook"
        subtitle="Your comprehensive funding readiness guide"
      />

      <div className="max-w-[900px] mx-auto py-8 space-y-6">
        {/* Controls */}
        <Card className="sticky top-0 z-10 shadow-xl border-2 border-[#E5C089]">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPageIndex - 1)}
                  disabled={currentPageIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Select
                  value={currentPageIndex.toString()}
                  onValueChange={(val) => goToPage(parseInt(val))}
                >
                  <SelectTrigger className="w-80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <div key={section.id}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">
                          {section.name}
                        </div>
                        {section.pages.map((page) => {
                          const idx = WORKBOOK_PAGES.findIndex(p => p.id === page.id);
                          return (
                            <SelectItem key={page.id} value={idx.toString()}>
                              {page.title}
                            </SelectItem>
                          );
                        })}
                      </div>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPageIndex + 1)}
                  disabled={currentPageIndex === WORKBOOK_PAGES.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {lastSaved && (
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                
                {currentPage.fields && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Progress
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="bg-[#143A50]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <span>Page {currentPageIndex + 1} of {WORKBOOK_PAGES.length}</span>
              <span>•</span>
              <span>{Math.round(((currentPageIndex + 1) / WORKBOOK_PAGES.length) * 100)}% Complete</span>
            </div>
          </CardContent>
        </Card>

        {/* Page Content - No Card Wrapper */}
        <WorkbookPage
          page={currentPage}
          responses={allResponses[currentPage.id] || {}}
          onResponseChange={handleResponseChange}
          assessmentResults={assessmentResults}
        />

        {/* Navigation Footer */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => goToPage(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={() => goToPage(currentPageIndex + 1)}
            disabled={currentPageIndex === WORKBOOK_PAGES.length - 1}
            className="bg-[#143A50]"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}