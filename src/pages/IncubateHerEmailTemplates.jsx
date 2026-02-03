import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Eye, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function IncubateHerEmailTemplates() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState('consultation_invitation');
  const [testRecipient, setTestRecipient] = useState('');
  const [previewData, setPreviewData] = useState({
    participant_name: 'Jane Doe',
    session_title: 'Session 1: Understanding Grants & Contracts',
    session_date: new Date().toISOString(),
    start_time: '10:00 AM',
    location_or_link: 'https://zoom.us/example'
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const templates = [
    { 
      id: 'session_reminder', 
      name: 'Session Reminder',
      description: 'Sent 24 hours before group sessions'
    },
    { 
      id: 'consultation_reminder', 
      name: 'Consultation Reminder',
      description: 'Sent 24 hours before consultation appointments'
    },
    { 
      id: 'consultation_invitation', 
      name: 'Consultation Invitation',
      description: 'Initial invitation to schedule consultation'
    },
    { 
      id: 'consultation_followup', 
      name: 'Consultation Follow-up',
      description: 'Sent after consultation with summary and next steps'
    },
    { 
      id: 'workbook_reminder', 
      name: 'Workbook Reminder',
      description: 'Reminder for incomplete workbook sections'
    },
    { 
      id: 'assessment_reminder', 
      name: 'Assessment Reminder',
      description: 'Reminder for incomplete pre/post assessments'
    }
  ];

  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      if (!testRecipient) {
        throw new Error('Please enter a recipient email');
      }

      await base44.functions.invoke('incubateHerEmailNotifications', {
        notification_type: selectedTemplate,
        recipient_email: testRecipient,
        data: previewData
      });
    },
    onSuccess: () => {
      toast.success('Test email sent successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to send: ${error.message}`);
    }
  });

  const copyTemplateUrl = () => {
    const url = 'https://calendly.com/drshawnte/incubateher-individual-funding-readiness-consultation';
    navigator.clipboard.writeText(url);
    toast.success('Calendly link copied!');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Email Templates</h1>
            <p className="text-slate-600 mt-1">Manage automated notifications for IncubateHer</p>
          </div>
          <Badge className="bg-[#143A50]">Admin Only</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Select a template to preview and test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedTemplate === template.id
                        ? 'border-[#143A50] bg-[#143A50]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-medium text-slate-900">{template.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Preview & Testing */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Template Preview
                </CardTitle>
                <CardDescription>
                  {templates.find(t => t.id === selectedTemplate)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-slate-600 mb-1">Subject:</p>
                    <p className="font-medium">
                      {selectedTemplate === 'session_reminder' && 'Reminder: IncubateHer Session Tomorrow'}
                      {selectedTemplate === 'consultation_reminder' && 'Reminder: Your IncubateHer Consultation is Tomorrow'}
                      {selectedTemplate === 'consultation_invitation' && 'Next Steps: Schedule Your IncubateHer Consultation'}
                      {selectedTemplate === 'consultation_followup' && 'Your IncubateHer Consultation Summary & Next Steps'}
                      {selectedTemplate === 'workbook_reminder' && 'IncubateHer: Complete Your Workbook'}
                      {selectedTemplate === 'assessment_reminder' && 'IncubateHer: Complete Your Assessment'}
                    </p>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p>Hello {previewData.participant_name},</p>
                    {selectedTemplate === 'consultation_invitation' && (
                      <>
                        <p>Thank you for attending the Funding Readiness: Preparing for Grants and Contracts workshop as part of IncubateHer.</p>
                        <p>As a next step, you are invited to schedule one individual funding readiness consultation...</p>
                        <p><strong>Before booking your session, please:</strong></p>
                        <ul>
                          <li>Review the consultation expectations</li>
                          <li>Complete the required pre-session checklist</li>
                          <li>Prepare 1–2 documents for review</li>
                        </ul>
                      </>
                    )}
                    {selectedTemplate === 'session_reminder' && (
                      <>
                        <p>This is a friendly reminder about your upcoming IncubateHer session:</p>
                        <p><strong>Session:</strong> {previewData.session_title}<br/>
                        <strong>Date:</strong> {new Date(previewData.session_date).toLocaleDateString()}<br/>
                        <strong>Time:</strong> {previewData.start_time}</p>
                      </>
                    )}
                    <p className="text-slate-500 text-xs mt-4">[Full email content will be shown when sent]</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTemplateUrl}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Calendly Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Test Email
                </CardTitle>
                <CardDescription>
                  Send this template to an email address for testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Test recipient email address"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  type="email"
                />
                <Button
                  onClick={() => sendTestEmailMutation.mutate()}
                  disabled={sendTestEmailMutation.isPending}
                  className="w-full bg-[#143A50]"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Automation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Session Reminders</p>
                      <p className="text-sm text-green-700">Sent 24h before sessions</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Consultation Reminders</p>
                      <p className="text-sm text-green-700">Sent 24h before consultations</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-700">Follow-up Emails</p>
                      <p className="text-sm text-slate-500">Triggered manually after consultations</p>
                    </div>
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