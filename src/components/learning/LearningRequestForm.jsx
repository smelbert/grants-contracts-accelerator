import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquarePlus, Loader2, CheckCircle2, Lightbulb } from 'lucide-react';

export default function LearningRequestForm({ organization }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    request_type: 'course',
    topic: '',
    description: '',
    urgency: 'medium'
  });
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createRequestMutation = useMutation({
    mutationFn: (data) => base44.entities.LearningRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-requests'] });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setFormData({
          request_type: 'course',
          topic: '',
          description: '',
          urgency: 'medium'
        });
      }, 2000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createRequestMutation.mutate({
      ...formData,
      organization_id: organization?.id,
      requester_email: user?.email,
      requester_name: user?.full_name || user?.email
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Request Custom Content
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            Request Learning Content
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-900">
              Your request has been submitted! Our team will review it and create content to address your needs.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="bg-purple-50 border-purple-200">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-purple-900">
                Tell us what you need help with! We'll create courses, workshops, or guides tailored to your organization's needs.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Content Type
                </label>
                <Select
                  value={formData.request_type}
                  onValueChange={(value) => setFormData({ ...formData, request_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Full Course</SelectItem>
                    <SelectItem value="webinar">Live Webinar</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="training">Training Session</SelectItem>
                    <SelectItem value="handout">Handout/Guide</SelectItem>
                    <SelectItem value="guide">Step-by-Step Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Urgency
                </label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Nice to have</SelectItem>
                    <SelectItem value="medium">Medium - Helpful soon</SelectItem>
                    <SelectItem value="high">High - Need ASAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Topic <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., Writing a logic model for youth programs"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What do you need help with?
              </label>
              <Textarea
                rows={4}
                placeholder="Describe what you're trying to accomplish, any specific challenges, or what you'd like to learn..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">
                The more detail you provide, the better we can tailor the content to your needs
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRequestMutation.isPending || !formData.topic}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {createRequestMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}