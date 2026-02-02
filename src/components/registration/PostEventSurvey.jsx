import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, ThumbsUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PostEventSurvey({ registrationSubmissionId, userEmail, eventType, onComplete }) {
  const [formData, setFormData] = useState({
    registration_submission_id: registrationSubmissionId,
    user_email: userEmail,
    event_type: eventType,
    satisfaction_rating: 0,
    content_quality: 0,
    instructor_effectiveness: 0,
    would_recommend: null,
    what_worked_well: '',
    what_could_improve: '',
    additional_feedback: '',
    interested_in_upsell: false,
    upsell_interest_type: 'none'
  });

  const queryClient = useQueryClient();

  const submitSurvey = useMutation({
    mutationFn: (data) => base44.entities.PostEventSurvey.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['postEventSurveys']);
      toast.success('Thank you for your feedback!');
      if (onComplete) onComplete();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitSurvey.mutate(formData);
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                rating <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>We'd Love Your Feedback!</CardTitle>
        <CardDescription>
          Help us improve by sharing your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <StarRating
            label="Overall Satisfaction"
            value={formData.satisfaction_rating}
            onChange={(rating) => setFormData({ ...formData, satisfaction_rating: rating })}
          />

          <StarRating
            label="Content Quality"
            value={formData.content_quality}
            onChange={(rating) => setFormData({ ...formData, content_quality: rating })}
          />

          <StarRating
            label="Instructor Effectiveness"
            value={formData.instructor_effectiveness}
            onChange={(rating) => setFormData({ ...formData, instructor_effectiveness: rating })}
          />

          <div className="space-y-2">
            <Label>Would you recommend this to others?</Label>
            <RadioGroup
              value={formData.would_recommend?.toString()}
              onValueChange={(value) => setFormData({ ...formData, would_recommend: value === 'true' })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="yes" />
                <label htmlFor="yes" className="text-sm cursor-pointer">Yes, definitely</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="no" />
                <label htmlFor="no" className="text-sm cursor-pointer">Not likely</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>What worked well?</Label>
            <Textarea
              value={formData.what_worked_well}
              onChange={(e) => setFormData({ ...formData, what_worked_well: e.target.value })}
              placeholder="Share what you enjoyed or found valuable..."
              rows={3}
            />
          </div>

          <div>
            <Label>What could we improve?</Label>
            <Textarea
              value={formData.what_could_improve}
              onChange={(e) => setFormData({ ...formData, what_could_improve: e.target.value })}
              placeholder="Any suggestions for improvement..."
              rows={3}
            />
          </div>

          <div>
            <Label>Additional Feedback</Label>
            <Textarea
              value={formData.additional_feedback}
              onChange={(e) => setFormData({ ...formData, additional_feedback: e.target.value })}
              placeholder="Anything else you'd like to share..."
              rows={2}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium text-slate-900 mb-4">Interested in More?</h3>
            <div className="space-y-2">
              <Label>Would you be interested in:</Label>
              <RadioGroup
                value={formData.upsell_interest_type}
                onValueChange={(value) => setFormData({
                  ...formData,
                  upsell_interest_type: value,
                  interested_in_upsell: value !== 'none'
                })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="coaching" id="coaching" />
                  <label htmlFor="coaching" className="text-sm cursor-pointer">
                    One-on-One Coaching
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full_platform" id="full_platform" />
                  <label htmlFor="full_platform" className="text-sm cursor-pointer">
                    Full Platform Access
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other_workshops" id="other_workshops" />
                  <label htmlFor="other_workshops" className="text-sm cursor-pointer">
                    Other Workshops/Trainings
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <label htmlFor="none" className="text-sm cursor-pointer">
                    Not at this time
                  </label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitSurvey.isPending}>
            {submitSurvey.isPending ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}