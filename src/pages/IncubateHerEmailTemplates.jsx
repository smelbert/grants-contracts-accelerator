import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Send, Eye, Copy, CheckCircle2, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function IncubateHerEmailTemplates() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState('session_reminder');
  const [testRecipient, setTestRecipient] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: emailTemplates = [], isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: async () => {
      return await base44.entities.EmailTemplate.filter({ category: 'incubateher' });
    }
  });

  const defaultTemplates = {
    'session_reminder': {
      template_id: 'session_reminder',
      template_name: 'Session Reminder',
      description: 'Sent 24 hours before group sessions',
      subject: 'Reminder: IncubateHer Session Tomorrow',
      body_html: `<p>Hello {{participant_name}},</p>

<p>This is a friendly reminder about your upcoming IncubateHer session:</p>

<p><strong>Monday, March 2 | 5:30–7:30 PM (Virtual – Google Meet)</strong><br/>
<strong>Thursday, March 5 | 5:30–7:30 PM (Virtual – Google Meet)</strong><br/>
<strong>Saturday, March 7 | 9:00 AM–12:00 PM (In Person)</strong><br/>
Columbus Metropolitan Library – Shepard Location, Meeting Room 1</p>

<p><strong>Before the session:</strong></p>
<ul>
  <li>Review any materials shared in advance</li>
  <li>Bring questions or challenges you'd like to discuss</li>
  <li>Have your workbook ready for exercises</li>
</ul>

<p>See you soon!</p>

<p>Warm regards,<br/>
Dr. Shawnté Elbert<br/>
Elbert Innovative Solutions</p>`,
      available_variables: ['participant_name', 'session_date', 'session_title', 'location_or_link']
    },
    'consultation_invitation': {
      template_id: 'consultation_invitation',
      template_name: 'Consultation Invitation',
      description: 'Initial invitation to schedule consultation',
      subject: 'Next Steps: Schedule Your IncubateHer Funding Readiness Consultation',
      body_html: `<p>Hello {{participant_name}},</p>

<p>Thank you for attending the Funding Readiness: Preparing for Grants and Contracts workshop as part of IncubateHer.</p>

<p>Following the group workshop, you have the opportunity to schedule one individual consultation with the facilitator.</p>

<h3>What the One-on-One Includes:</h3>
<ul>
  <li>Review of existing documents (e.g., business overview, draft project description, budget outline)</li>
  <li>Strategic feedback on funding readiness and alignment (grants vs. contracts)</li>
  <li>Clarification of next steps and recommended areas for strengthening</li>
</ul>

<h3>What the One-on-One Does NOT Include:</h3>
<ul>
  <li>Writing or rewriting grant applications or contracts</li>
  <li>Conducting grant searches or identifying specific funding opportunities</li>
  <li>Ongoing consulting beyond the scheduled session</li>
</ul>

<p><strong>Schedule your consultation here:</strong><br/>
<a href="https://calendly.com/drshawnte/incubateher-individual-funding-readiness-consultation">Book Your Session</a></p>

<p>Warm regards,<br/>
Dr. Shawnté Elbert</p>`,
      available_variables: ['participant_name']
    },
    'welcome': {
      template_id: 'welcome',
      template_name: 'Welcome Email',
      description: 'Sent upon registration',
      subject: 'Welcome to IncubateHer Funding Readiness Series',
      body_html: `<p>Hello {{participant_name}},</p>

<p>Thank you for registering for the <strong>IncubateHer Funding Readiness Series: Preparing for Grants, Proposals & Contracts</strong>.</p>

<h3>Session Schedule</h3>
<ul>
  <li><strong>Monday, March 2</strong> | 5:30–7:30 PM (Virtual – Google Meet)</li>
  <li><strong>Thursday, March 5</strong> | 5:30–7:30 PM (Virtual – Google Meet)</li>
  <li><strong>Saturday, March 7</strong> | 9:00 AM–12:00 PM (In Person)<br/>
      Columbus Metropolitan Library – Shepard Location, Meeting Room 1</li>
</ul>

<p>You will receive the Google Meet link 24 hours before each virtual session.</p>

<p>We're excited to support your funding readiness journey!</p>

<p>Warm regards,<br/>
Dr. Shawnté Elbert<br/>
Elbert Innovative Solutions</p>`,
      available_variables: ['participant_name']
    }
  };

  // Get template (from database or default)
  const getTemplate = (templateId) => {
    const dbTemplate = emailTemplates.find(t => t.template_id === templateId);
    return dbTemplate || defaultTemplates[templateId];
  };

  const currentTemplate = getTemplate(selectedTemplate);

  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData) => {
      const existing = emailTemplates.find(t => t.template_id === templateData.template_id);
      
      if (existing) {
        await base44.entities.EmailTemplate.update(existing.id, {
          ...templateData,
          last_edited_by: user.email
        });
      } else {
        await base44.entities.EmailTemplate.create({
          ...templateData,
          category: 'incubateher',
          last_edited_by: user.email,
          is_active: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['emailTemplates']);
      setEditDialogOpen(false);
      toast.success('Template saved successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    }
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      if (!testRecipient) {
        throw new Error('Please enter a recipient email');
      }

      const template = getTemplate(selectedTemplate);
      
      await base44.integrations.Core.SendEmail({
        from_name: 'IncubateHer Program',
        to: testRecipient,
        subject: template.subject,
        body: template.body_html
          .replace(/\{\{participant_name\}\}/g, 'Test User')
          .replace(/\{\{session_title\}\}/g, 'Sample Session')
          .replace(/\{\{session_date\}\}/g, new Date().toLocaleDateString())
      });
    },
    onSuccess: () => {
      toast.success('Test email sent successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to send: ${error.message}`);
    }
  });

  const handleEditTemplate = (template) => {
    setEditingTemplate({
      template_id: template.template_id,
      template_name: template.template_name,
      subject: template.subject,
      body_html: template.body_html,
      available_variables: template.available_variables
    });
    setEditDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      saveTemplateMutation.mutate(editingTemplate);
    }
  };

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
              <CardDescription>Select a template to preview and edit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.values(defaultTemplates).map((template) => {
                  const hasCustomVersion = emailTemplates.some(t => t.template_id === template.template_id);
                  return (
                    <button
                      key={template.template_id}
                      onClick={() => setSelectedTemplate(template.template_id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTemplate === template.template_id
                          ? 'border-[#143A50] bg-[#143A50]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{template.template_name}</p>
                          <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                        </div>
                        {hasCustomVersion && (
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Template Preview & Testing */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Template Preview
                    </CardTitle>
                    <CardDescription>
                      {currentTemplate?.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(currentTemplate)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-slate-600 mb-1">Subject:</p>
                    <p className="font-medium">{currentTemplate?.subject}</p>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: currentTemplate?.body_html
                        ?.replace(/\{\{participant_name\}\}/g, 'Jane Doe')
                        ?.replace(/\{\{session_title\}\}/g, 'Session 1')
                        ?.replace(/\{\{session_date\}\}/g, new Date().toLocaleDateString()) || ''
                    }}
                  />
                </div>

                {currentTemplate?.available_variables?.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">Available Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentTemplate.available_variables.map((v) => (
                        <Badge key={v} variant="outline" className="text-xs">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

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

        {/* Edit Template Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Email Template</DialogTitle>
            </DialogHeader>
            {editingTemplate && (
              <div className="space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={editingTemplate.template_name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, template_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Subject Line</Label>
                  <Input
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email Body (HTML)</Label>
                  <Textarea
                    value={editingTemplate.body_html}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body_html: e.target.value })}
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Use <code>{'{{variable_name}}'}</code> for dynamic content. Available: {editingTemplate.available_variables?.join(', ')}
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={saveTemplateMutation.isPending}
                    className="bg-[#143A50]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}