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
import { ChevronLeft, ChevronRight, Save, Check, CheckCircle2 } from 'lucide-react';
import PDFExporter from '@/components/export/PDFExporter';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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

                  <div className="flex items-center gap-2 flex-wrap justify-end">
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
                        Save
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant={completedPages[currentPage.id] ? 'default' : 'outline'}
                      onClick={() => togglePageComplete(currentPage.id)}
                      className={completedPages[currentPage.id] ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-700 hover:bg-green-50'}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {completedPages[currentPage.id] ? 'Completed' : 'Mark Complete'}
                    </Button>

                    <PDFExporter
                      type="workbook"
                      workbookData={{
                        pages: WORKBOOK_PAGES,
                        responses: allResponses,
                        customPages: customPages,
                      }}
                      organizationName={organizationProfile?.organization_name || enrollment?.organization_name}
                      userName={user?.full_name}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 text-sm text-slate-600 flex-wrap">
                  <span>Page {currentPageIndex + 1} of {WORKBOOK_PAGES.length}</span>
                  <span>•</span>
                  <span>{Object.keys(completedPages).length} of {WORKBOOK_PAGES.length} pages marked complete</span>
                  {completedPages[currentPage.id] && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      This page is complete
                    </Badge>
                  )}
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