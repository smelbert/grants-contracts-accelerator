import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkEnrolleAccessManager({ enrollments = [] }) {
  const queryClient = useQueryClient();
  const [bulkAccessDialogOpen, setBulkAccessDialogOpen] = useState(false);
  const [bulkEmailDialogOpen, setBulkEmailDialogOpen] = useState(false);
  const [selectedEnrollees, setSelectedEnrollees] = useState(new Set());
  const [emailContent, setEmailContent] = useState({
    subject: 'Welcome to IncubateHer',
    body: ''
  });

  const grantAccessMutation = useMutation({
    mutationFn: async () => {
      const enrolleesToUpdate = Array.from(selectedEnrollees).map(id => 
        enrollments.find(e => e.id === id)
      ).filter(Boolean);

      for (const enrollee of enrolleesToUpdate) {
        const userAccessRecords = await base44.entities.UserAccessLevel.filter({
          user_email: enrollee.participant_email
        });

        if (userAccessRecords.length > 0) {
          await base44.entities.UserAccessLevel.update(userAccessRecords[0].id, {
            access_level: 'full_access',
            learning_hub_access: true,
            disabled_tabs: {}
          });
        } else {
          await base44.entities.UserAccessLevel.create({
            user_email: enrollee.participant_email,
            access_level: 'full_access',
            learning_hub_access: true,
            disabled_tabs: {}
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
      toast.success(`Access granted to ${selectedEnrollees.size} enrollees`);
      setSelectedEnrollees(new Set());
      setBulkAccessDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to grant access: ${error.message}`);
    }
  });

  const sendBulkEmailMutation = useMutation({
    mutationFn: async () => {
      const enrolleesToEmail = Array.from(selectedEnrollees).map(id => 
        enrollments.find(e => e.id === id)
      ).filter(Boolean);

      for (const enrollee of enrolleesToEmail) {
        await base44.integrations.Core.SendEmail({
          to: enrollee.participant_email,
          subject: emailContent.subject,
          body: emailContent.body
            .replace(/{{participant_name}}/g, enrollee.participant_name)
            .replace(/{{email}}/g, enrollee.participant_email)
        });
      }
    },
    onSuccess: () => {
      toast.success(`Email sent to ${selectedEnrollees.size} enrollees`);
      setSelectedEnrollees(new Set());
      setBulkEmailDialogOpen(false);
      setEmailContent({ subject: 'Welcome to IncubateHer', body: '' });
    },
    onError: (error) => {
      toast.error(`Failed to send emails: ${error.message}`);
    }
  });

  const toggleSelectAll = () => {
    if (selectedEnrollees.size === enrollments.length) {
      setSelectedEnrollees(new Set());
    } else {
      setSelectedEnrollees(new Set(enrollments.map(e => e.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedEnrollees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEnrollees(newSelected);
  };

  if (!enrollments.length) {
    return null;
  }

  return (
    <>
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Bulk Access & Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              Select enrollees below and grant them full app access or send bulk emails.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant={selectedEnrollees.size === enrollments.length ? 'default' : 'outline'}
                onClick={toggleSelectAll}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {selectedEnrollees.size === enrollments.length ? 'Deselect All' : 'Select All'} ({enrollments.length})
              </Button>
              
              {selectedEnrollees.size > 0 && (
                <>
                  <Badge variant="default" className="bg-slate-700">
                    {selectedEnrollees.size} selected
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => setBulkAccessDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Grant Full Access
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setBulkEmailDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                </>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {enrollments.map((enrollee) => (
                <label
                  key={enrollee.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEnrollees.has(enrollee.id)}
                    onChange={() => toggleSelect(enrollee.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{enrollee.participant_name}</p>
                    <p className="text-xs text-slate-600">{enrollee.participant_email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grant Access Dialog */}
      <Dialog open={bulkAccessDialogOpen} onOpenChange={setBulkAccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Grant Full Access
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900">
                This will grant <strong>full app access</strong> (all features, all tabs) to {selectedEnrollees.size} selected enrollee{selectedEnrollees.size !== 1 ? 's' : ''}.
              </p>
            </div>
            <div className="space-y-2">
              {Array.from(selectedEnrollees).slice(0, 5).map(id => {
                const enrollee = enrollments.find(e => e.id === id);
                return (
                  <div key={id} className="text-xs text-slate-600">
                    ✓ {enrollee.participant_email}
                  </div>
                );
              })}
              {selectedEnrollees.size > 5 && (
                <div className="text-xs text-slate-600">
                  + {selectedEnrollees.size - 5} more
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setBulkAccessDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => grantAccessMutation.mutate()}
                disabled={grantAccessMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {grantAccessMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Granting...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Grant Access</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={bulkEmailDialogOpen} onOpenChange={setBulkEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Email to {selectedEnrollees.size} Enrollee{selectedEnrollees.size !== 1 ? 's' : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject Line</Label>
              <Input
                value={emailContent.subject}
                onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label>Email Body</Label>
              <Textarea
                value={emailContent.body}
                onChange={(e) => setEmailContent({ ...emailContent, body: e.target.value })}
                placeholder="Email content (use {{participant_name}} and {{email}} for variables)"
                rows={6}
              />
              <p className="text-xs text-slate-500 mt-1">
                Available: {'{{participant_name}}'}, {'{{email}}'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setBulkEmailDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => sendBulkEmailMutation.mutate()}
                disabled={sendBulkEmailMutation.isPending || !emailContent.body}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {sendBulkEmailMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Mail className="w-4 h-4 mr-2" /> Send to All</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}