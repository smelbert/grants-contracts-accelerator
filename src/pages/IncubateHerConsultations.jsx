import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, AlertCircle, Upload, ExternalLink } from 'lucide-react';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { toast } from 'sonner';

export default function IncubateHerConsultations() {
  const queryClient = useQueryClient();
  const [checklist, setChecklist] = useState({
    preAssessment: false,
    documents: false,
    questions: false
  });
  const [documentLink, setDocumentLink] = useState('');
  const [notes, setNotes] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!user?.email
  });

  // Check workbook completion
  const { data: workbookPages = [] } = useQuery({
    queryKey: ['workbook-pages'],
    queryFn: () => base44.entities.WorkbookPageContent.list()
  });

  const { data: workbookResponses = [] } = useQuery({
    queryKey: ['workbook-responses', user?.email],
    queryFn: async () => {
      return base44.entities.WorkbookResponse.filter({
        user_email: user.email
      });
    },
    enabled: !!user?.email
  });

  // Calculate workbook completion percentage
  const requiredPages = workbookPages.filter(p => p.required_for_consultation);
  const completedRequiredPages = requiredPages.filter(page => 
    workbookResponses.some(r => r.page_id === page.page_id && r.responses && Object.keys(r.responses).length > 0)
  );
  const workbookCompletionPercent = requiredPages.length > 0 
    ? Math.round((completedRequiredPages.length / requiredPages.length) * 100)
    : 0;
  const workbookRequirementMet = workbookCompletionPercent >= 50;

  const allChecklistComplete = enrollment?.pre_assessment_completed && 
    workbookRequirementMet &&
    Object.values(checklist).every(v => v);

  const saveChecklistMutation = useMutation({
    mutationFn: async () => {
      // Update or create checklist record
      const existing = await base44.entities.ConsultationIntakeChecklist.filter({
        enrollment_id: enrollment.id
      });
      
      if (existing.length > 0) {
        await base44.entities.ConsultationIntakeChecklist.update(existing[0].id, {
          documents_uploaded: checklist.documents,
          questions_prepared: checklist.questions,
          all_items_complete: allChecklistComplete,
          completed_date: allChecklistComplete ? new Date().toISOString() : null
        });
      } else {
        await base44.entities.ConsultationIntakeChecklist.create({
          enrollment_id: enrollment.id,
          participant_email: user.email,
          pre_assessment_reviewed: enrollment.pre_assessment_completed,
          documents_uploaded: checklist.documents,
          questions_prepared: checklist.questions,
          all_items_complete: allChecklistComplete,
          completed_date: allChecklistComplete ? new Date().toISOString() : null
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment']);
      toast.success('Checklist saved!');
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="One-on-One Consultations"
        subtitle="Personalized guidance for your funding readiness"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="border-l-4 border-l-[#143A50]">
          <CardHeader>
            <CardTitle>What the One-on-One Includes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Review of existing documents (e.g., business overview, draft project description, budget outline, or capability statement)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Strategic feedback on funding readiness and alignment (grants vs. contracts)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Clarification of next steps and recommended areas for strengthening</span>
              </li>
            </ul>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">What the One-on-One Does NOT Include:</h4>
              <ul className="space-y-1 text-amber-800 text-sm">
                <li>• Writing or rewriting grant applications or contracts</li>
                <li>• Conducting grant searches or identifying specific funding opportunities</li>
                <li>• Ongoing consulting beyond the scheduled session</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">How to Prepare:</h4>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• Bring 1–2 documents you would like reviewed (drafts are acceptable)</li>
                <li>• Be prepared to discuss your business structure, current capacity, and funding goals</li>
                <li>• Come with specific questions you want to prioritize during the session</li>
              </ul>
              <p className="text-sm text-blue-900 font-medium mt-3">
                Participants who arrive prepared will get the most value from their consultation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>Required: Pre-Consultation Checklist</CardTitle>
            <CardDescription>
              Complete these items before scheduling your consultation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-700">Business & Structure</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Legal structure identified (LLC, nonprofit, sole proprietor, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Business or organization is registered and in good standing</span>
                </li>
              </ul>

              <h4 className="font-semibold text-slate-700 mt-4">Funding Readiness</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Clear understanding of funding goals (grants, contracts, or both)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Basic financial records available (budget, revenue/expense summary, or projections)</span>
                </li>
              </ul>

              <h4 className="font-semibold text-slate-700 mt-4">Documents for Review</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Business or organizational overview (1–2 pages preferred)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Draft project description, scope of work, or service summary</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Budget outline or budget narrative (if available)</span>
                </li>
              </ul>

              <h4 className="font-semibold text-slate-700 mt-4">Preparation</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>2–3 specific questions identified for the session</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">☐</span>
                  <span>Understanding that the session focuses on strategy and readiness, not application writing</span>
                </li>
              </ul>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900 font-medium">
                  ⚠️ Participants who have not completed this checklist may be asked to reschedule.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(!enrollment?.pre_assessment_completed || !workbookRequirementMet) && (
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5" />
                Requirements Not Met
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!enrollment?.pre_assessment_completed && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="font-medium text-slate-900">Pre-Assessment Required</p>
                  </div>
                  <p className="text-slate-700 text-sm mb-3">
                    You must complete the pre-assessment before booking your consultation.
                  </p>
                  <Button className="bg-[#143A50]">
                    Complete Pre-Assessment
                  </Button>
                </div>
              )}
              
              {!workbookRequirementMet && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <p className="font-medium text-slate-900">Workbook Completion Required</p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      {workbookCompletionPercent}% Complete
                    </Badge>
                  </div>
                  <p className="text-slate-700 text-sm mb-3">
                    Complete at least 50% of the required workbook pages ({completedRequiredPages.length} of {requiredPages.length} completed).
                  </p>
                  <Button className="bg-[#143A50]">
                    Continue Workbook
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {enrollment?.pre_assessment_completed && workbookRequirementMet && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Ready to Schedule? Confirm Your Preparation</CardTitle>
                <CardDescription>
                  Check off these items to unlock booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={enrollment.pre_assessment_completed}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">Pre-Assessment Completed</p>
                      <p className="text-sm text-slate-500">Required to book consultation</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Complete
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={workbookRequirementMet}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">Workbook Completion</p>
                      <p className="text-sm text-slate-500">
                        {completedRequiredPages.length} of {requiredPages.length} required pages completed ({workbookCompletionPercent}%)
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Complete
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={checklist.documents}
                      onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, documents: checked }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">Documents Prepared</p>
                      <p className="text-sm text-slate-500">Business overview, project description, and budget outline ready</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={checklist.questions}
                      onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, questions: checked }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">Questions Prepared</p>
                      <p className="text-sm text-slate-500">2-3 specific questions identified for your session</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Share any documents you'd like reviewed during your consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Paste Google Drive or Dropbox link..."
                  value={documentLink}
                  onChange={(e) => setDocumentLink(e.target.value)}
                />
                <Textarea
                  placeholder="Add any notes or specific questions for your consultant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Book Your Consultation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!allChecklistComplete ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-600">
                      Complete the checklist above to unlock booking
                    </p>
                  </div>
                ) : enrollment?.consultation_completed ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-green-800 font-medium mb-2">Consultation Completed</p>
                    <p className="text-green-700 text-sm">
                      {enrollment.consultation_date && `Completed on ${new Date(enrollment.consultation_date).toLocaleDateString()}`}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-green-900">You're Ready to Schedule!</p>
                      </div>
                      <p className="text-sm text-green-800">
                        All checklist items are complete. Click below to book your consultation with Dr. Elbert.
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full bg-[#143A50]"
                      onClick={async () => {
                        await saveChecklistMutation.mutateAsync();
                        window.open('https://calendly.com/drshawnte/incubateher-individual-funding-readiness-consultation', '_blank');
                      }}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Schedule on Calendly
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <CoBrandedFooter />
    </div>
  );
}