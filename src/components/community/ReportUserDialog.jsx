import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportUserDialog({ open, onOpenChange, reportedUserEmail, reportedUserName, contentType, contentId }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.UserReport.create({
        reported_user_email: reportedUserEmail,
        reporter_email: user.email,
        reason: data.reason,
        description: data.description,
        related_content_type: contentType,
        related_content_id: contentId
      });
    },
    onSuccess: () => {
      toast.success('Report submitted. Our team will review it shortly.');
      onOpenChange(false);
      setReason('');
      setDescription('');
    },
    onError: () => {
      toast.error('Failed to submit report. Please try again.');
    }
  });

  const handleSubmit = () => {
    if (!reason || !description.trim()) {
      toast.error('Please provide a reason and description');
      return;
    }
    reportMutation.mutate({ reason, description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Report User
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600">
            You are reporting <span className="font-semibold">{reportedUserName || reportedUserEmail}</span>
          </p>

          <div>
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">Harassment or bullying</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate content</SelectItem>
                <SelectItem value="spam">Spam or advertising</SelectItem>
                <SelectItem value="hate_speech">Hate speech</SelectItem>
                <SelectItem value="impersonation">Impersonation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about what happened..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-slate-500 mt-1">
              Include specific details to help us investigate
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <p className="text-amber-800">
              False reports may result in action against your account. All reports are confidential and reviewed by our team.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={reportMutation.isPending || !reason || !description.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}