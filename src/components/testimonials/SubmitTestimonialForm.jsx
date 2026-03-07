import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, MessageSquare, Upload, User } from 'lucide-react';
import { toast } from 'sonner';

export default function SubmitTestimonialForm({ trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [approvedForWebsite, setApprovedForWebsite] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: organization } = useQuery({
    queryKey: ['user-organization', user?.email],
    queryFn: async () => {
      const orgs = await base44.entities.Organization.filter({ primary_contact: user.email });
      return orgs[0] || null;
    },
    enabled: !!user?.email
  });

  const submitTestimonialMutation = useMutation({
    mutationFn: (data) => base44.entities.Testimonial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['testimonials']);
      toast.success('Thank you for your feedback!');
      setIsOpen(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    submitTestimonialMutation.mutate({
      user_email: user.email,
      user_name: user.full_name || formData.get('user_name'),
      organization_name: organization?.name || formData.get('organization_name'),
      testimonial_text: formData.get('testimonial_text'),
      rating: rating,
      program_type: formData.get('program_type'),
      approved_for_website: approvedForWebsite,
      submitted_date: new Date().toISOString()
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Share Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Your Name</Label>
            <Input name="user_name" defaultValue={user?.full_name} required />
          </div>

          <div>
            <Label>Organization Name</Label>
            <Input name="organization_name" defaultValue={organization?.name} />
          </div>

          <div>
            <Label>Which program or service?</Label>
            <Select name="program_type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incubateher">IncubateHer Program</SelectItem>
                <SelectItem value="coaching">Coaching Services</SelectItem>
                <SelectItem value="boutique_services">Boutique Services</SelectItem>
                <SelectItem value="learning_hub">Learning Hub</SelectItem>
                <SelectItem value="general">General Platform</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Your Rating</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      value <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Your Testimonial</Label>
            <Textarea
              name="testimonial_text"
              rows={6}
              placeholder="Share your experience with EIS..."
              required
            />
          </div>

          <div className="flex items-start gap-3 bg-[#E5C089]/10 p-4 rounded-lg">
            <Checkbox
              id="website_approval"
              checked={approvedForWebsite}
              onCheckedChange={setApprovedForWebsite}
            />
            <div className="flex-1">
              <label htmlFor="website_approval" className="text-sm font-medium cursor-pointer">
                I give permission for this testimonial to be displayed on the EIS website
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Your testimonial may be featured on our public website to help other organizations learn about EIS.
              </p>
            </div>
          </div>

          <Button type="submit" disabled={submitTestimonialMutation.isPending}>
            {submitTestimonialMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}