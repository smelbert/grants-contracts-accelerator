import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Mail, Users, Send, BarChart3, Plus, Calendar, CheckCircle2,
  TrendingUp, UserPlus, Zap, Filter, Download, Upload, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function EmailHubPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showNewAutomation, setShowNewAutomation] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('all');

  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date'),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: () => base44.entities.EmailCampaign.list('-created_date'),
  });

  const { data: automations = [] } = useQuery({
    queryKey: ['email-automations'],
    queryFn: () => base44.entities.EmailAutomation.list('-created_date'),
  });

  const { data: forms = [] } = useQuery({
    queryKey: ['contact-forms'],
    queryFn: () => base44.entities.ContactForm.list('-created_date'),
  });

  const subscribedContacts = contacts.filter(c => c.status === 'subscribed');
  const allSegments = [...new Set(contacts.flatMap(c => c.segments || []))];

  const filteredContacts = selectedSegment === 'all' 
    ? subscribedContacts 
    : subscribedContacts.filter(c => c.segments?.includes(selectedSegment));

  const totalSent = campaigns.reduce((sum, c) => sum + (c.total_recipients || 0), 0);
  const avgOpenRate = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaigns.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8 text-blue-600" />
            Email Hub
          </h1>
          <p className="text-slate-600">Unify your audience and community with email marketing</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{subscribedContacts.length}</p>
              <p className="text-xs text-slate-600">Active Contacts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Send className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'sent').length}</p>
              <p className="text-xs text-slate-600">Campaigns Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{Math.round(avgOpenRate)}%</p>
              <p className="text-xs text-slate-600">Avg Open Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{automations.filter(a => a.is_active).length}</p>
              <p className="text-xs text-slate-600">Active Automations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="campaigns">
              <Send className="w-4 h-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Users className="w-4 h-4 mr-2" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="automations">
              <Zap className="w-4 h-4 mr-2" />
              Automations
            </TabsTrigger>
            <TabsTrigger value="forms">
              <UserPlus className="w-4 h-4 mr-2" />
              Forms
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Email Campaigns</h2>
              <Button onClick={() => setShowNewCampaign(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
            <div className="grid gap-4">
              {campaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
              {campaigns.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-slate-500">
                    No campaigns yet. Create your first email campaign!
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">Contact Management</h2>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="all">All Contacts</option>
                  {allSegments.map(seg => (
                    <option key={seg} value={seg}>{seg}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <ContactsTable contacts={filteredContacts} />
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Marketing Automation</h2>
              <Button onClick={() => setShowNewAutomation(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Automation
              </Button>
            </div>
            <div className="grid gap-4">
              {automations.map(auto => (
                <AutomationCard key={auto.id} automation={auto} />
              ))}
              {automations.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-slate-500">
                    No automations yet. Set up automated email workflows!
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Contact Forms</h2>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Form
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {forms.map(form => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard campaigns={campaigns} contacts={contacts} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {showNewCampaign && (
          <CampaignDialog
            onClose={() => setShowNewCampaign(false)}
            segments={allSegments}
          />
        )}
        {showNewAutomation && (
          <AutomationDialog onClose={() => setShowNewAutomation(false)} />
        )}
        {showNewForm && (
          <FormDialog onClose={() => setShowNewForm(false)} />
        )}
      </div>
    </div>
  );
}

function CampaignCard({ campaign }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{campaign.campaign_name}</h3>
            <p className="text-sm text-slate-600">{campaign.subject_line}</p>
          </div>
          <Badge variant={campaign.status === 'sent' ? 'default' : 'outline'}>
            {campaign.status}
          </Badge>
        </div>
        {campaign.status === 'sent' && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-xs text-slate-600">Recipients</p>
              <p className="text-lg font-semibold">{campaign.total_recipients}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Open Rate</p>
              <p className="text-lg font-semibold">{Math.round(campaign.open_rate || 0)}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Click Rate</p>
              <p className="text-lg font-semibold">{Math.round(campaign.click_rate || 0)}%</p>
            </div>
          </div>
        )}
        {campaign.scheduled_date && campaign.status === 'scheduled' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            Scheduled for {format(new Date(campaign.scheduled_date), 'MMM d, yyyy h:mm a')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactsTable({ contacts }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Email</th>
                <th className="text-left p-3 text-sm font-medium">Name</th>
                <th className="text-left p-3 text-sm font-medium">Segments</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 text-sm">{contact.email}</td>
                  <td className="p-3 text-sm">
                    {contact.first_name} {contact.last_name}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-1 flex-wrap">
                      {contact.segments?.map(seg => (
                        <Badge key={seg} variant="outline" className="text-xs">{seg}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <Badge variant={contact.status === 'subscribed' ? 'default' : 'outline'}>
                      {contact.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">
                    {contact.total_emails_sent > 0 
                      ? `${Math.round((contact.total_emails_opened / contact.total_emails_sent) * 100)}%`
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AutomationCard({ automation }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{automation.automation_name}</h3>
            <p className="text-sm text-slate-600">Trigger: {automation.trigger_type}</p>
            <p className="text-sm text-slate-500 mt-2">
              {automation.email_sequence?.length || 0} emails in sequence
            </p>
          </div>
          <Badge variant={automation.is_active ? 'default' : 'outline'}>
            {automation.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-slate-600">Total Triggered</p>
          <p className="text-lg font-semibold">{automation.total_triggered}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FormCard({ form }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-2">{form.form_name}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">{form.form_fields?.length || 0} fields</span>
          <Badge variant={form.is_active ? 'default' : 'outline'}>
            {form.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-slate-600">Submissions</p>
          <p className="text-lg font-semibold">{form.total_submissions}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsDashboard({ campaigns, contacts }) {
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const totalRecipients = sentCampaigns.reduce((sum, c) => sum + (c.total_recipients || 0), 0);
  const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.total_opened || 0), 0);
  const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.total_clicked || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalRecipients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overall Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalRecipients > 0 ? Math.round((totalOpened / totalRecipients) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overall Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalRecipients > 0 ? Math.round((totalClicked / totalRecipients) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sentCampaigns.map(campaign => (
              <div key={campaign.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{campaign.campaign_name}</p>
                  <p className="text-xs text-slate-600">
                    {format(new Date(campaign.sent_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Open Rate</p>
                    <p className="font-semibold">{Math.round(campaign.open_rate || 0)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Click Rate</p>
                    <p className="font-semibold">{Math.round(campaign.click_rate || 0)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignDialog({ onClose, segments }) {
  const [formData, setFormData] = useState({
    campaign_name: '',
    subject_line: '',
    preview_text: '',
    email_body: '',
    target_segments: [],
    scheduled_date: ''
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailCampaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['email-campaigns']);
      toast.success('Campaign created!');
      onClose();
    }
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Email Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Campaign Name</label>
            <Input
              value={formData.campaign_name}
              onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Subject Line</label>
            <Input
              value={formData.subject_line}
              onChange={(e) => setFormData({...formData, subject_line: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email Body</label>
            <ReactQuill
              value={formData.email_body}
              onChange={(content) => setFormData({...formData, email_body: content})}
              className="h-64 mb-12"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(formData)}>
              Create Campaign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AutomationDialog({ onClose }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Automation</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">Automation builder coming soon!</p>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}

function FormDialog({ onClose }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Contact Form</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">Form builder coming soon!</p>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}