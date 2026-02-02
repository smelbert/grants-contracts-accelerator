import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lightbulb, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function SuggestSpaceButton() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    space_name: '',
    description: '',
    reason: ''
  });

  const queryClient = useQueryClient();

  const submitSuggestion = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      // Send email to admins with suggestion
      await base44.integrations.Core.SendEmail({
        to: 'drelbert@elbertinnovativesolutions.org',
        subject: `New Community Space Suggestion from ${user.full_name}`,
        body: `
          <h2>New Community Space Suggestion</h2>
          <p><strong>From:</strong> ${user.full_name} (${user.email})</p>
          <p><strong>Suggested Space Name:</strong> ${data.space_name}</p>
          <p><strong>Description:</strong> ${data.description}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
        `
      });
    },
    onSuccess: () => {
      toast.success('Space suggestion submitted! Admins will review it shortly.');
      setOpen(false);
      setFormData({ space_name: '', description: '', reason: '' });
    },
    onError: () => {
      toast.error('Failed to submit suggestion. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.space_name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    submitSuggestion.mutate(formData);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="border-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/10"
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        Suggest a Space
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#AC1A5B]" />
              Suggest a New Community Space
            </DialogTitle>
            <DialogDescription>
              Have an idea for a new community space? Share it with our admins!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="space_name">Space Name *</Label>
              <Input
                id="space_name"
                value={formData.space_name}
                onChange={(e) => setFormData({ ...formData, space_name: e.target.value })}
                placeholder="e.g., Small Business Owners Network"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What would this space be about? Who would benefit from it?"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="reason">Why is this space needed?</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Optional: Tell us why this would add value to the community"
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitSuggestion.isPending}
                className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
              >
                {submitSuggestion.isPending ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Suggestion
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}