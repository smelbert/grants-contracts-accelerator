import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { CheckCircle2, Star, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AUTOSAVE_KEY = 'eis_evaluation_draft';
const DEFAULT_RESPONSES = {
  overall_rating: '', content_quality: '', facilitation_effectiveness: '',
  materials_usefulness: '', workbook_quality: '', schedule_format: '',
  consultation_experience: '', most_valuable: '', suggestions: '',
  facilitator_feedback: '', would_recommend: '', additional_comments: ''
};

export default function IncubateHerEvaluation() {
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState(() => {
    try { return { ...DEFAULT_RESPONSES, ...JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || '{}') }; } catch { return DEFAULT_RESPONSES; }
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email || !cohort?.id) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email,
        cohort_id: cohort.id
      });
      return enrollments[0];
    },
    enabled: !!user?.email && !!cohort?.id
  });

  const { data: existingEvaluation } = useQuery({
    queryKey: ['evaluation', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return null;
      const evals = await base44.entities.ProgramAssessment.filter({
        enrollment_id: enrollment.id,
        assessment_type: 'evaluation'
      });
      return evals[0];
    },
    enabled: !!enrollment?.id
  });

  const submitEvaluationMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ProgramAssessment.create(data);
      
      if (enrollment) {
        await base44.entities.ProgramEnrollment.update(enrollment.id, {
          evaluation_completed: true,
          evaluation_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment']);
      queryClient.invalidateQueries(['evaluation']);
      toast.success('Thank you for your feedback!');
      setSubmitted(true);
    }
  });

  const handleChange = (field, value) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!enrollment) return;

    await submitEvaluationMutation.mutateAsync({
      enrollment_id: enrollment.id,
      participant_email: user.email,
      assessment_type: 'evaluation',
      responses: responses,
      total_score: parseInt(responses.overall_rating) * 10 || 0
    });
  };

  if (existingEvaluation || submitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="Program Evaluation" />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card>
            <CardContent className="pt-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.neutralDark }}>
                Thank You for Your Feedback!
              </h2>
              <p className="mb-6" style={{ color: BRAND_COLORS.eisNavy }}>
                Your evaluation has been submitted. Your feedback helps us improve future training sessions.
              </p>
              {existingEvaluation && (
                <Badge style={{ backgroundColor: BRAND_COLORS.culRed, color: BRAND_COLORS.neutralLight, fontSize: '1.2rem', padding: '0.5rem 1rem' }}>
                  Rating: {existingEvaluation.responses?.overall_rating}/10
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  const isComplete = responses.overall_rating && responses.content_quality && 
                     responses.facilitation_effectiveness && responses.materials_usefulness &&
                     responses.workbook_quality && responses.schedule_format && 
                     responses.consultation_experience && responses.would_recommend;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="Training Evaluation"
        subtitle="Share your feedback on this training session"
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="mb-6" style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-6 h-6 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
              <div>
                <p className="font-semibold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                  Your Feedback Matters
                </p>
                <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                  Please take a few minutes to evaluate this training session. Your honest feedback helps us improve future training experiences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Rating */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Overall Training Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
              How would you rate this training session overall?
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Poor</span>
              <RadioGroup 
                value={responses.overall_rating} 
                onValueChange={(val) => handleChange('overall_rating', val)}
                className="flex gap-2"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div key={num} className="flex flex-col items-center">
                    <RadioGroupItem value={num.toString()} id={`overall-${num}`} />
                    <Label htmlFor={`overall-${num}`} className="text-xs cursor-pointer">{num}</Label>
                  </div>
                ))}
              </RadioGroup>
              <span className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Excellent</span>
            </div>
          </CardContent>
        </Card>

        {/* Content Quality */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Content & Learning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                How would you rate the quality and relevance of the content?
              </Label>
              <RadioGroup value={responses.content_quality} onValueChange={(val) => handleChange('content_quality', val)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="excellent" id="content-excellent" />
                  <Label htmlFor="content-excellent" className="cursor-pointer">Excellent - Highly relevant and valuable</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="good" id="content-good" />
                  <Label htmlFor="content-good" className="cursor-pointer">Good - Mostly relevant and useful</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="fair" id="content-fair" />
                  <Label htmlFor="content-fair" className="cursor-pointer">Fair - Some useful information</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="poor" id="content-poor" />
                  <Label htmlFor="content-poor" className="cursor-pointer">Poor - Not very relevant or useful</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                How effective was Dr. Shawnte Elbert's facilitation?
              </Label>
              <RadioGroup value={responses.facilitation_effectiveness} onValueChange={(val) => handleChange('facilitation_effectiveness', val)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="excellent" id="facilitation-excellent" />
                  <Label htmlFor="facilitation-excellent" className="cursor-pointer">Excellent - Very engaging, knowledgeable, and clear</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="good" id="facilitation-good" />
                  <Label htmlFor="facilitation-good" className="cursor-pointer">Good - Clear and helpful</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="fair" id="facilitation-fair" />
                  <Label htmlFor="facilitation-fair" className="cursor-pointer">Fair - Adequate but could improve</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="poor" id="facilitation-poor" />
                  <Label htmlFor="facilitation-poor" className="cursor-pointer">Poor - Unclear or confusing</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Materials & Resources */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Materials & Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                How useful were the learning materials and resources?
              </Label>
              <RadioGroup value={responses.materials_usefulness} onValueChange={(val) => handleChange('materials_usefulness', val)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="very_useful" id="materials-very" />
                  <Label htmlFor="materials-very" className="cursor-pointer">Very useful - Will use regularly</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="useful" id="materials-useful" />
                  <Label htmlFor="materials-useful" className="cursor-pointer">Useful - Good reference materials</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="somewhat" id="materials-somewhat" />
                  <Label htmlFor="materials-somewhat" className="cursor-pointer">Somewhat useful - Limited application</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="not_useful" id="materials-not" />
                  <Label htmlFor="materials-not" className="cursor-pointer">Not useful</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                How helpful was the workbook?
              </Label>
              <RadioGroup value={responses.workbook_quality} onValueChange={(val) => handleChange('workbook_quality', val)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="excellent" id="workbook-excellent" />
                  <Label htmlFor="workbook-excellent" className="cursor-pointer">Excellent - Very comprehensive and helpful</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="good" id="workbook-good" />
                  <Label htmlFor="workbook-good" className="cursor-pointer">Good - Helpful guide</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="fair" id="workbook-fair" />
                  <Label htmlFor="workbook-fair" className="cursor-pointer">Fair - Some useful sections</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="poor" id="workbook-poor" />
                  <Label htmlFor="workbook-poor" className="cursor-pointer">Poor - Not very helpful</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Program Format */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Program Format & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                How well did the schedule format work for you?
              </Label>
              <RadioGroup value={responses.schedule_format} onValueChange={(val) => handleChange('schedule_format', val)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="perfect" id="schedule-perfect" />
                  <Label htmlFor="schedule-perfect" className="cursor-pointer">Perfect - Easy to attend all sessions</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="good" id="schedule-good" />
                  <Label htmlFor="schedule-good" className="cursor-pointer">Good - Worked well overall</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="challenging" id="schedule-challenging" />
                  <Label htmlFor="schedule-challenging" className="cursor-pointer">Challenging - Had to miss some sessions</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="difficult" id="schedule-difficult" />
                  <Label htmlFor="schedule-difficult" className="cursor-pointer">Difficult - Hard to attend regularly</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                How was your consultation experience?
              </Label>
              <RadioGroup value={responses.consultation_experience} onValueChange={(val) => handleChange('consultation_experience', val)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="excellent" id="consult-excellent" />
                  <Label htmlFor="consult-excellent" className="cursor-pointer">Excellent - Very valuable and personalized</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="good" id="consult-good" />
                  <Label htmlFor="consult-good" className="cursor-pointer">Good - Helpful guidance</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="fair" id="consult-fair" />
                  <Label htmlFor="consult-fair" className="cursor-pointer">Fair - Some helpful insights</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="poor" id="consult-poor" />
                  <Label htmlFor="consult-poor" className="cursor-pointer">Poor - Not very helpful</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="na" id="consult-na" />
                  <Label htmlFor="consult-na" className="cursor-pointer">Did not attend consultation</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Open Feedback */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Your Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                What was most valuable about this training?
              </Label>
              <Textarea
                value={responses.most_valuable}
                onChange={(e) => handleChange('most_valuable', e.target.value)}
                placeholder="Share what you found most helpful..."
                rows={3}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                What other training topics would you like to see?
              </Label>
              <Textarea
                value={responses.suggestions}
                onChange={(e) => handleChange('suggestions', e.target.value)}
                placeholder="Suggest future training topics you'd be interested in..."
                rows={3}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                Feedback for Dr. Shawnte Elbert (facilitator)
              </Label>
              <Textarea
                value={responses.facilitator_feedback}
                onChange={(e) => handleChange('facilitator_feedback', e.target.value)}
                placeholder="Share feedback about the facilitation style, presentation, expertise, etc..."
                rows={3}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                Additional comments
              </Label>
              <Textarea
                value={responses.additional_comments}
                onChange={(e) => handleChange('additional_comments', e.target.value)}
                placeholder="Any other feedback you'd like to share..."
                rows={3}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
              Would you recommend this training to other entrepreneurs?
            </Label>
            <RadioGroup value={responses.would_recommend} onValueChange={(val) => handleChange('would_recommend', val)}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="definitely" id="recommend-definitely" />
                <Label htmlFor="recommend-definitely" className="cursor-pointer">Definitely - Highly recommend</Label>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="probably" id="recommend-probably" />
                <Label htmlFor="recommend-probably" className="cursor-pointer">Probably - Would recommend</Label>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="maybe" id="recommend-maybe" />
                <Label htmlFor="recommend-maybe" className="cursor-pointer">Maybe - Depends on their situation</Label>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="no" id="recommend-no" />
                <Label htmlFor="recommend-no" className="cursor-pointer">No - Would not recommend</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          size="lg"
          className="w-full text-white text-lg"
          style={{ backgroundColor: BRAND_COLORS.eisGold }}
          disabled={!isComplete || submitEvaluationMutation.isPending}
        >
          {submitEvaluationMutation.isPending ? 'Submitting...' : 'Submit Evaluation'}
        </Button>
      </div>

      <CoBrandedFooter />
    </div>
  );
}