import React, { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import WorkbookPage from '@/components/incubateher/WorkbookPage';
import WorkbookProgressTracker from '@/components/incubateher/WorkbookProgressTracker';
import { WORKBOOK_PAGES, getSections } from '@/components/incubateher/workbookContent';
import { ChevronLeft, ChevronRight, Save, Download, Check, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
        is_active: true
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

  // Track manually completed pages
  const completedPages = React.useMemo(() => {
    if (!savedResponses) return {};
    const map = {};
    savedResponses.forEach(r => { if (r.is_completed) map[r.page_id] = true; });
    return map;
  }, [savedResponses]);

  const togglePageComplete = async (pageId) => {
    if (!enrollment?.id || !user?.email) return;
    const existing = savedResponses?.find(r => r.page_id === pageId);
    const newVal = !completedPages[pageId];
    if (existing) {
      await base44.entities.WorkbookResponse.update(existing.id, { is_completed: newVal });
    } else {
      await base44.entities.WorkbookResponse.create({
        enrollment_id: enrollment.id,
        participant_email: user.email,
        page_id: pageId,
        responses: {},
        is_completed: newVal,
        last_saved: new Date().toISOString()
      });
    }
    queryClient.invalidateQueries(['workbook-responses']);
    toast.success(newVal ? 'Page marked as complete!' : 'Page marked as incomplete');
  };

  const { data: customPages = [] } = useQuery({
    queryKey: ['workbook-custom-pages'],
    queryFn: () => base44.entities.WorkbookPageContent.list(),
  });

  const { data: customHeaders = [] } = useQuery({
    queryKey: ['workbook-section-headers'],
    queryFn: () => base44.entities.WorkbookSectionHeader.list(),
  });

  const { data: organizationProfile } = useQuery({
    queryKey: ['organization-profile', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return null;
      const profiles = await base44.entities.Organization.filter({
        enrollment_id: enrollment.id
      });
      return profiles[0];
    },
    enabled: !!enrollment?.id
  });

  useEffect(() => {
    const unsubscribe = base44.entities.WorkbookPageContent.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['workbook-custom-pages'] });
    });
    return unsubscribe;
  }, [queryClient]);

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

  // Debounced autosave ref
  const autosaveTimer = React.useRef(null);

  const handleResponseChange = (pageId, fieldId, value) => {
    setAllResponses(prev => {
      const next = {
        ...prev,
        [pageId]: {
          ...(prev[pageId] || {}),
          [fieldId]: value
        }
      };

      // Debounce autosave: save 1.5s after last change
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        const pageResponses = next[pageId];
        if (pageResponses && enrollment?.id && user?.email) {
          const existing = savedResponses?.find(r => r.page_id === pageId);
          if (existing) {
            base44.entities.WorkbookResponse.update(existing.id, {
              responses: pageResponses,
              last_saved: new Date().toISOString()
            }).then(() => {
              setLastSaved(new Date());
              queryClient.invalidateQueries(['workbook-responses']);
            });
          } else {
            base44.entities.WorkbookResponse.create({
              enrollment_id: enrollment.id,
              participant_email: user.email,
              page_id: pageId,
              responses: pageResponses,
              last_saved: new Date().toISOString()
            }).then(() => {
              setLastSaved(new Date());
              queryClient.invalidateQueries(['workbook-responses']);
            });
          }
        }
      }, 1500);

      return next;
    });
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
    const doc = new jsPDF('p', 'mm', 'letter');
    const pageWidth = 216;
    const pageHeight = 279;
    const margin = 20;
    let pageCount = 1;

    const addHeader = (pageNum) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('IncubateHer Funding Readiness Workbook', margin, 10);
      doc.text(`Page ${pageNum}`, pageWidth - margin, 10, { align: 'right' });
      doc.setDrawColor(229, 192, 137);
      doc.line(margin, 12, pageWidth - margin, 12);
    };

    const addFooter = (pageNum) => {
      doc.setDrawColor(229, 192, 137);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text('Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions', pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    doc.setFontSize(28);
    doc.setTextColor(20, 58, 80);
    doc.text('IncubateHer', pageWidth / 2, 60, { align: 'center' });
    doc.setFontSize(20);
    doc.text('Funding Readiness Workbook', pageWidth / 2, 75, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Preparing for Grants & Contracts', pageWidth / 2, 90, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(20, 58, 80);
    doc.text(`${user?.full_name || 'Participant'}`, pageWidth / 2, 120, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, 135, { align: 'center' });
    
    addFooter(pageCount);
    
    WORKBOOK_PAGES.forEach((page) => {
      const customPage = customPages.find(p => p.page_id === page.id);
      const displayContent = customPage?.content || page.content;
      
      doc.addPage();
      pageCount++;
      let yPos = 20;
      
      addHeader(pageCount);
      yPos = 20;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(page.section, margin, yPos);
      yPos += 8;
      
      doc.setFontSize(16);
      doc.setTextColor(20, 58, 80);
      const titleLines = doc.splitTextToSize(page.title, pageWidth - 2 * margin);
      titleLines.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 7;
      });
      yPos += 5;
      
      if (displayContent) {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const cleanContent = displayContent.replace(/<[^>]*>/g, '').trim();
        if (cleanContent) {
          const contentLines = doc.splitTextToSize(cleanContent.substring(0, 500), pageWidth - 2 * margin);
          contentLines.slice(0, 15).forEach(line => {
            if (yPos > pageHeight - 25) {
              addFooter(pageCount);
              doc.addPage();
              pageCount++;
              addHeader(pageCount);
              yPos = 20;
            }
            doc.text(line, margin, yPos);
            yPos += 5;
          });
          yPos += 5;
        }
      }
      
      if (page.fields && allResponses[page.id]) {
        doc.setFontSize(10);
        page.fields.forEach(field => {
          if (yPos > pageHeight - 30) {
            addFooter(pageCount);
            doc.addPage();
            pageCount++;
            addHeader(pageCount);
            yPos = 20;
          }
          
          doc.setFont(undefined, 'bold');
          doc.setTextColor(20, 58, 80);
          const labelLines = doc.splitTextToSize(field.label, pageWidth - 2 * margin - 5);
          labelLines.forEach(line => {
            doc.text(line, margin + 5, yPos);
            yPos += 5;
          });
          yPos += 2;
          
          doc.setFont(undefined, 'normal');
          doc.setTextColor(60, 60, 60);
          const response = allResponses[page.id][field.id];
          
          if (response) {
            if (typeof response === 'string') {
              const lines = doc.splitTextToSize(response || '(No response)', pageWidth - 2 * margin - 10);
              lines.forEach(line => {
                if (yPos > pageHeight - 25) {
                  addFooter(pageCount);
                  doc.addPage();
                  pageCount++;
                  addHeader(pageCount);
                  yPos = 20;
                }
                doc.text(line, margin + 10, yPos);
                yPos += 5;
              });
            } else if (Array.isArray(response)) {
              response.forEach(item => {
                if (yPos > pageHeight - 25) {
                  addFooter(pageCount);
                  doc.addPage();
                  pageCount++;
                  addHeader(pageCount);
                  yPos = 20;
                }
                doc.text(`• ${item}`, margin + 10, yPos);
                yPos += 5;
              });
            }
          } else {
            doc.text('(No response)', margin + 10, yPos);
            yPos += 5;
          }
          
          yPos += 3;
        });
      }
      
      addFooter(pageCount);
    });

    doc.save(`IncubateHer_Workbook_${user?.full_name?.replace(/\s+/g, '_') || 'Participant'}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Workbook downloaded with all content');
  };

  const currentPage = WORKBOOK_PAGES[currentPageIndex];
  const sections = getSections(customHeaders);

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

      <div className="max-w-[1920px] mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-4">
              <WorkbookProgressTracker
                responses={allResponses}
                currentPageId={currentPage.id}
                customHeaders={customHeaders}
                onPageSelect={(pageId) => {
                  const idx = WORKBOOK_PAGES.findIndex(p => p.id === pageId);
                  if (idx >= 0) goToPage(idx);
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="sticky top-4 z-10 shadow-xl border-2 border-[#E5C089]">
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
                            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
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

            <WorkbookPage
              page={currentPage}
              responses={allResponses[currentPage.id] || {}}
              onResponseChange={handleResponseChange}
              assessmentResults={assessmentResults}
              customContent={customPages.find(p => p.page_id === currentPage.id)}
              organizationProfile={organizationProfile}
              enrollment={enrollment}
            />

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
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}