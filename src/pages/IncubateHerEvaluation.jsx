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
import { CheckCircle2, Star, MessageSquare, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';
import SubmitTestimonialForm from '@/components/testimonials/SubmitTestimonialForm';

const AUTOSAVE_KEY = 'eis_evaluation_draft';
const DEFAULT_RESPONSES = {
  overall_rating: '', content_quality: '', facilitation_effectiveness: '',
  materials_usefulness: '', workbook_quality: '', schedule_format: '',
  consultation_experience: '', most_valuable: '', suggestions: '',
  facilitator_feedback: '', would_recommend: '', additional_comments: '',
  post_support: '', participation_frequency: '', implementation_challenges: '',
  ongoing_topics: '', community_interest: '', community_entailment: ''
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
        assessment_type: 'post'
      });
      // Filter to only program evaluations (not post-assessments)
      const evaluations = evals.filter(e => e.responses?._form_type === 'program_evaluation');
      return evaluations[0] || null;
    },
    enabled: !!enrollment?.id
  });

  const submitEvaluationMutation = useMutation({
    mutationFn: async (data) => {
      if (existingEvaluation) {
        await base44.entities.ProgramAssessment.update(existingEvaluation.id, data);
      } else {
        await base44.entities.ProgramAssessment.create(data);
      }
      
      if (enrollment) {
        await base44.entities.ProgramEnrollment.update(enrollment.id, {
          program_evaluation_completed: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment'] });
      queryClient.invalidateQueries({ queryKey: ['evaluation'] });
      toast.success('Thank you for your feedback!');
      setSubmitted(true);
    }
  });

  const handleChange = (field, value) => {
    setResponses(prev => {
      const next = { ...prev, [field]: value };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleDownloadPDF = (respData) => {
    const doc = new jsPDF('p', 'mm', 'letter');
    const margin = 20;
    let y = 30;
    doc.setFontSize(18); doc.setTextColor(20, 58, 80);
    doc.text('IncubateHer Program Evaluation', margin, y); y += 10;
    doc.setFontSize(11); doc.setTextColor(100, 100, 100);
    doc.text(`Participant: ${user?.full_name || user?.email || ''}`, margin, y); y += 7;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y); y += 12;
    doc.setDrawColor(229, 192, 137); doc.line(margin, y, 196, y); y += 8;
    const fields = [
      ['Overall Rating', respData.overall_rating],
      ['Content Quality', respData.content_quality],
      ['Facilitation Effectiveness', respData.facilitation_effectiveness],
      ['Materials Usefulness', respData.materials_usefulness],
      ['Workbook Quality', respData.workbook_quality],
      ['Schedule Format', respData.schedule_format],
      ['Consultation Experience', respData.consultation_experience],
      ['Would Recommend', respData.would_recommend],
      ['Most Valuable', respData.most_valuable],
      ['Suggestions', respData.suggestions],
      ['Facilitator Feedback', respData.facilitator_feedback],
      ['Additional Comments', respData.additional_comments],
    ];
    fields.forEach(([label, val]) => {
      if (!val) return;
      if (y > 255) { doc.addPage(); y = 20; }
      doc.setFontSize(10); doc.setTextColor(20, 58, 80); doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, margin, y); y += 6;
      doc.setFont(undefined, 'normal'); doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(String(val), 170);
      lines.forEach(l => { doc.text(`  ${l}`, margin, y); y += 6; });
      y += 2;
    });
    doc.setFontSize(8); doc.setTextColor(130, 130, 130);
    doc.text('Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions', 108, 280, { align: 'center' });
    doc.save(`IncubateHer_Evaluation_${user?.full_name?.replace(/\s+/g, '_') || 'Participant'}.pdf`);
  };

  const handleSubmit = async () => {
    if (!enrollment) {
      toast.error('Unable to find your enrollment. Please refresh the page and try again.');
      return;
    }
    localStorage.removeItem(AUTOSAVE_KEY);
    await submitEvaluationMutation.mutateAsync({
      enrollment_id: enrollment.id,
      participant_email: user.email,
      assessment_type: 'post',
      responses: { ...responses, _form_type: 'program_evaluation' },
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
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                <Button variant="outline" onClick={() => handleDownloadPDF((existingEvaluation || { responses: {} }).responses)}>
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial CTA */}
          <Card className="mt-6" style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
            <CardContent className="pt-6 text-center">
              <Star className="w-10 h-10 mx-auto mb-3" style={{ color: BRAND_COLORS.eisGold }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                Would You Share Your Story?
              </h3>
              <p className="text-sm mb-4" style={{ color: BRAND_COLORS.eisNavy }}>
                Help other entrepreneurs discover IncubateHer by sharing a testimonial. You can include your name and photo, or stay anonymous.
              </p>
              <SubmitTestimonialForm
                trigger={
                  <Button style={{ backgroundColor: BRAND_COLORS.eisGold, color: '#fff' }}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Share My Testimonial
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  const hasPostSupport = Array.isArray(responses.post_support) ? responses.post_support.length > 0 : !!responses.post_support;
  const hasImplementationChallenges = Array.isArray(responses.implementation_challenges) ? responses.implementation_challenges.length > 0 : !!responses.implementation_challenges;
  const hasOngoingTopics = Array.isArray(responses.ongoing_topics) ? responses.ongoing_topics.length > 0 : !!responses.ongoing_topics;

  const isComplete = responses.overall_rating && responses.content_quality && 
                     responses.facilitation_effectiveness && responses.materials_usefulness &&
                     responses.workbook_quality && responses.schedule_format && 
                     responses.consultation_experience && responses.would_recommend &&
                     hasPostSupport && responses.participation_frequency &&
                     hasImplementationChallenges && hasOngoingTopics &&
                     responses.community_interest;

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

        {/* Post-Incubator Support */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Post-Incubator Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                After completing the incubator, what support would help you most?
              </Label>
              <div className="space-y-2">
                {['Accountability sessions', 'Working sessions', 'Expert workshops', 'Funding support', 'Networking', 'Emotional support/community', 'Mentorship'].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`support-${option}`}
                      checked={(responses.post_support || []).includes(option)}
                      onChange={(e) => {
                        const current = responses.post_support || [];
                        const updated = e.target.checked ? [...current, option] : current.filter(v => v !== option);
                        handleChange('post_support', updated);
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`support-${option}`} className="cursor-pointer">{option}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                How often would you participate in ongoing support sessions?
              </Label>
              <RadioGroup value={responses.participation_frequency} onValueChange={(val) => handleChange('participation_frequency', val)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="monthly" id="freq-monthly" />
                  <Label htmlFor="freq-monthly" className="cursor-pointer">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="quarterly" id="freq-quarterly" />
                  <Label htmlFor="freq-quarterly" className="cursor-pointer">Quarterly</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="as_needed" id="freq-needed" />
                  <Label htmlFor="freq-needed" className="cursor-pointer">Only when I need it</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                What are your biggest challenges implementing what you learned?
              </Label>
              <div className="space-y-2">
                {['Time', 'Systems', 'Funding', 'Marketing', 'Strategy', 'Confidence', 'Accountability'].map((challenge) => (
                  <div key={challenge} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`challenge-${challenge}`}
                      checked={(responses.implementation_challenges || []).includes(challenge)}
                      onChange={(e) => {
                        const current = responses.implementation_challenges || [];
                        const updated = e.target.checked ? [...current, challenge] : current.filter(v => v !== challenge);
                        handleChange('implementation_challenges', updated);
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`challenge-${challenge}`} className="cursor-pointer">{challenge}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                What topics would you want covered in ongoing sessions?
              </Label>
              <div className="space-y-2 mb-3">
                {['Grant writing and compliance', 'Financial management and systems', 'Strategic planning', 'Marketing and fundraising', 'Team building and leadership', 'Operations and scaling', 'Social impact measurement', 'Legal and governance'].map((topic) => (
                  <div key={topic} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`topic-${topic}`}
                      checked={(responses.ongoing_topics || []).includes(topic)}
                      onChange={(e) => {
                        const current = responses.ongoing_topics || [];
                        const updated = e.target.checked ? [...current, topic] : current.filter(v => v !== topic);
                        handleChange('ongoing_topics', updated);
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={`topic-${topic}`} className="cursor-pointer">{topic}</Label>
                  </div>
                ))}
              </div>
              <Textarea
                value={responses.ongoing_topics_custom || ''}
                onChange={(e) => handleChange('ongoing_topics_custom', e.target.value)}
                placeholder="Other topics not listed above..."
                rows={2}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Community Interest */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Ongoing Community</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                Would you be interested in joining an ongoing entrepreneurial community after the incubator ends?
              </Label>
              <RadioGroup value={responses.community_interest} onValueChange={(val) => handleChange('community_interest', val)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="yes" id="community-yes" />
                  <Label htmlFor="community-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="no" id="community-no" />
                  <Label htmlFor="community-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>

            {responses.community_interest === 'yes' && (
              <div>
                <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                  What should an ongoing entrepreneurial community entail?
                </Label>
                <div className="space-y-2">
                  {['Monthly virtual meetups', 'Peer mentoring partnerships', 'Resource library access', 'Expert speaker series', 'Accountability partnerships', 'Funding opportunities board', 'Collaborative projects', 'Social events and networking'].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`community-${item}`}
                        checked={(responses.community_entailment || []).includes(item)}
                        onChange={(e) => {
                          const current = responses.community_entailment || [];
                          const updated = e.target.checked ? [...current, item] : current.filter(v => v !== item);
                          handleChange('community_entailment', updated);
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor={`community-${item}`} className="cursor-pointer">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
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