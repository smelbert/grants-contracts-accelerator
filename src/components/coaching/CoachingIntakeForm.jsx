import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';

export default function CoachingIntakeForm({ userEmail, userName, onComplete }) {
  const [formData, setFormData] = useState({
    user_email: userEmail,
    user_name: userName,
    coaching_type: '',
    organization_name: '',
    current_role: '',
    goals: '',
    challenges: '',
    timeline: '',
    prior_coaching_experience: '',
    preferred_meeting_times: [],
    package_selected: '',
    additional_notes: ''
  });

  const queryClient = useQueryClient();

  const submitIntake = useMutation({
    mutationFn: (data) => base44.entities.CoachingIntake.create({
      ...data,
      intake_completed: true,
      intake_completed_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingIntakes']);
      toast.success('Intake form submitted!');
      if (onComplete) onComplete();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitIntake.mutate(formData);
  };

  const meetingTimeOptions = [
    'Weekday Mornings (9am-12pm)',
    'Weekday Afternoons (12pm-5pm)',
    'Weekday Evenings (5pm-8pm)',
    'Weekend Mornings',
    'Weekend Afternoons'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coaching Intake Form</CardTitle>
        <CardDescription>
          Help us understand your goals and how we can best support you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Type of Coaching *</Label>
            <Select
              required
              value={formData.coaching_type}
              onValueChange={(value) => setFormData({ ...formData, coaching_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select coaching type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grant_writing">Grant Writing & Development</SelectItem>
                <SelectItem value="professional_development">Professional Development</SelectItem>
                <SelectItem value="career_advancement">Career Advancement</SelectItem>
                <SelectItem value="resume_cover_letter">Resume & Cover Letter</SelectItem>
                <SelectItem value="organizational_capacity">Organizational Capacity Building</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Organization Name</Label>
              <Input
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                placeholder="Your organization"
              />
            </div>

            <div>
              <Label>Current Role/Position</Label>
              <Input
                value={formData.current_role}
                onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                placeholder="Executive Director, Program Manager, etc."
              />
            </div>
          </div>

          <div>
            <Label>What are your primary goals for coaching? *</Label>
            <Textarea
              required
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="Describe what you hope to achieve through coaching..."
              rows={4}
            />
          </div>

          <div>
            <Label>What challenges are you currently facing?</Label>
            <Textarea
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              placeholder="Share any obstacles or difficulties you're experiencing..."
              rows={3}
            />
          </div>

          <div>
            <Label>Desired Timeline</Label>
            <Input
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              placeholder="e.g., 3 months, by end of year"
            />
          </div>

          <div>
            <Label>Prior Coaching Experience</Label>
            <Textarea
              value={formData.prior_coaching_experience}
              onChange={(e) => setFormData({ ...formData, prior_coaching_experience: e.target.value })}
              placeholder="Have you worked with a coach before? What was your experience?"
              rows={2}
            />
          </div>

          <div>
            <Label>Preferred Meeting Times</Label>
            <div className="space-y-2 mt-2">
              {meetingTimeOptions.map((time) => (
                <div key={time} className="flex items-center space-x-2">
                  <Checkbox
                    id={time}
                    checked={formData.preferred_meeting_times.includes(time)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          preferred_meeting_times: [...formData.preferred_meeting_times, time]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          preferred_meeting_times: formData.preferred_meeting_times.filter(t => t !== time)
                        });
                      }
                    }}
                  />
                  <label htmlFor={time} className="text-sm text-slate-700 cursor-pointer">
                    {time}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Select Package *</Label>
            <Select
              required
              value={formData.package_selected}
              onValueChange={(value) => setFormData({ ...formData, package_selected: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a coaching package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">One-Time Session</SelectItem>
                <SelectItem value="3_session">3-Session Package</SelectItem>
                <SelectItem value="6_session">6-Session Package</SelectItem>
                <SelectItem value="monthly_ongoing">Monthly Ongoing Coaching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Additional Notes</Label>
            <Textarea
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              placeholder="Anything else you'd like us to know?"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitIntake.isPending}>
            {submitIntake.isPending ? 'Submitting...' : 'Submit Intake Form'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}