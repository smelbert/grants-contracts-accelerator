import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Send, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RequestMentorReview({ document, onClose, onSubmitted }) {
  const queryClient = useQueryClient();
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [message, setMessage] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Find the user's active mentorship to get their mentor
  const { data: mentorships = [] } = useQuery({
    queryKey: ['my-mentorships', user?.email],
    queryFn: () => base44.entities.Mentorship.filter({ mentee_email: user.email, status: 'active' }),
    enabled: !!user?.email,
  });

  // Also get coaches (users with coach role)
  const { data: mentors = [] } = useQuery({
    queryKey: ['active-mentors'],
    queryFn: () => base44.entities.Mentor.filter({ is_active: true }),
    enabled: !!user?.email,
  });

  // Check for existing pending review request on this document
  const { data: existingRequests = [] } = useQuery({
    queryKey: ['review-requests', document?.id],
    queryFn: () => base44.entities.DocumentReviewRequest.filter({ document_id: document.id }),
    enabled: !!document?.id,
  });

  const activeRequest = existingRequests.find(r => r.status === 'pending' || r.status === 'in_review');

  const submitMutation = useMutation({
    mutationFn: async () => {
      const reviewer = reviewerOptions.find(r => r.email === selectedReviewer);
      // Create the review request
      await base44.entities.DocumentReviewRequest.create({
        document_id: document.id,
        document_name: document.doc_name,
        requester_email: user.email,
        requester_name: user.full_name || user.email,
        reviewer_email: reviewer.email,
        reviewer_name: reviewer.name,
        reviewer_role: reviewer.role,
        status: 'pending',
        request_message: message,
        requested_at: new Date().toISOString(),
      });
      // Update the document status
      await base44.entities.Document.update(document.id, {
        status: 'submitted_for_review',
        shared_for_review: true,
        reviewer_id: reviewer.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      queryClient.invalidateQueries(['review-requests', document?.id]);
      toast.success('Review request sent!');
      onSubmitted?.();
      onClose();
    },
    onError: (err) => toast.error('Failed to submit: ' + err.message),
  });

  // Build list of available reviewers from mentorships + mentor profiles
  const reviewerOptions = [
    ...mentorships.map(m => ({ email: m.mentor_email, name: m.mentor_name || m.mentor_email, role: 'mentor' })),
    ...mentors
      .filter(m => !mentorships.find(ms => ms.mentor_email === m.mentor_email))
      .map(m => ({ email: m.mentor_email, name: m.mentor_name, role: 'mentor' })),
  ].filter((v, i, arr) => arr.findIndex(x => x.email === v.email) === i); // dedupe

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#143A50]" />
            Request Mentor / Coach Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">Document</p>
            <p className="font-medium text-slate-900 text-sm">{document?.doc_name}</p>
          </div>

          {activeRequest ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Review Already Pending</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Waiting for feedback from <strong>{activeRequest.reviewer_name || activeRequest.reviewer_email}</strong>.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Select Reviewer</label>
                {reviewerOptions.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No mentors or coaches are currently assigned to you. Ask your program administrator to assign a mentor.</p>
                ) : (
                  <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a mentor or coach..." />
                    </SelectTrigger>
                    <SelectContent>
                      {reviewerOptions.map(r => (
                        <SelectItem key={r.email} value={r.email}>
                          <div className="flex items-center gap-2">
                            <span>{r.name}</span>
                            <Badge className="text-xs bg-slate-100 text-slate-600 capitalize">{r.role}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">What would you like feedback on? <span className="text-slate-400 font-normal">(optional)</span></label>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="e.g. Please focus on the narrative clarity and budget justification sections..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button
                  className="flex-1 bg-[#143A50] hover:bg-[#1E4F58] gap-2"
                  disabled={!selectedReviewer || submitMutation.isPending}
                  onClick={() => submitMutation.mutate()}
                >
                  {submitMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><Send className="w-4 h-4" /> Send Request</>
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}