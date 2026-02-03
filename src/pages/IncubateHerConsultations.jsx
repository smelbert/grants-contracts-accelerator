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

  const allChecklistComplete = enrollment?.pre_assessment_completed && 
    Object.values(checklist).every(v => v);

  const bookConsultationMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ProgramEnrollment.update(enrollment.id, {
        consultation_completed: false,
        documents_uploaded: !!documentLink
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment']);
      toast.success('Consultation checklist updated!');
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
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Your consultation will include:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Review of your pre-assessment results and readiness profile</span>
                </li>
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Document review and feedback on key organizational materials</span>
                </li>
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Personalized action plan with specific next steps</span>
                </li>
                <li className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Q&A time for your specific organizational needs</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">What This is NOT:</h4>
              <ul className="space-y-1 text-amber-800 text-sm">
                <li>• Not a grant writing session</li>
                <li>• Not a guarantee of funding</li>
                <li>• Not a replacement for professional legal or financial advice</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {!enrollment?.pre_assessment_completed && (
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5" />
                Pre-Assessment Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                You must complete the pre-assessment before booking your consultation. This helps us understand your current readiness level.
              </p>
              <Button className="bg-[#143A50]">
                Complete Pre-Assessment
              </Button>
            </CardContent>
          </Card>
        )}

        {enrollment?.pre_assessment_completed && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Pre-Consultation Checklist</CardTitle>
                <CardDescription>
                  Please complete these items before your scheduled consultation
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
                      checked={checklist.documents}
                      onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, documents: checked }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">Upload Key Documents</p>
                      <p className="text-sm text-slate-500">Mission statement, budget, board list (if available)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={checklist.questions}
                      onCheckedChange={(checked) => setChecklist(prev => ({ ...prev, questions: checked }))}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">Prepare Your Questions</p>
                      <p className="text-sm text-slate-500">Think about specific challenges or goals</p>
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
                  <Button 
                    size="lg" 
                    className="w-full bg-[#143A50]"
                    onClick={() => window.open('https://calendly.com/your-link', '_blank')}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule on Calendly
                  </Button>
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