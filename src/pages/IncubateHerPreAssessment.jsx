import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QUESTIONS = {
  grants_vs_contracts: [
    {
      id: 'q1',
      question: 'What is the primary difference between grants and contracts?',
      options: [
        { value: 'a', text: 'Grants are for nonprofits only, contracts are for businesses', points: 25 },
        { value: 'b', text: 'Grants fund your mission, contracts pay for specific deliverables', points: 100 },
        { value: 'c', text: 'Grants are easier to get than contracts', points: 0 },
        { value: 'd', text: 'There is no real difference', points: 0 }
      ]
    },
    {
      id: 'q2',
      question: 'Who typically reviews grant applications?',
      options: [
        { value: 'a', text: 'Procurement officers', points: 0 },
        { value: 'b', text: 'Program officers and review committees', points: 100 },
        { value: 'c', text: 'Legal departments', points: 25 },
        { value: 'd', text: 'Not sure', points: 0 }
      ]
    }
  ],
  legal_readiness: [
    {
      id: 'q3',
      question: 'What is your current business legal structure?',
      options: [
        { value: 'a', text: '501(c)(3) nonprofit with EIN', points: 100 },
        { value: 'b', text: 'LLC or Corporation with EIN', points: 75 },
        { value: 'c', text: 'Sole proprietor with EIN', points: 50 },
        { value: 'd', text: 'No formal structure yet', points: 0 }
      ]
    },
    {
      id: 'q4',
      question: 'Do you have a governing board or advisory committee?',
      options: [
        { value: 'a', text: 'Yes, with regular meetings and minutes', points: 100 },
        { value: 'b', text: 'Yes, but informal', points: 50 },
        { value: 'c', text: 'Working on forming one', points: 25 },
        { value: 'd', text: 'No', points: 0 }
      ]
    }
  ],
  financial_readiness: [
    {
      id: 'q5',
      question: 'Do you have financial statements (budget, balance sheet)?',
      options: [
        { value: 'a', text: 'Yes, professionally prepared and current', points: 100 },
        { value: 'b', text: 'Yes, but need updating', points: 50 },
        { value: 'c', text: 'I have basic tracking', points: 25 },
        { value: 'd', text: 'No formal financial documents', points: 0 }
      ]
    },
    {
      id: 'q6',
      question: 'Can you track expenses by program or project?',
      options: [
        { value: 'a', text: 'Yes, with accounting software', points: 100 },
        { value: 'b', text: 'Yes, using spreadsheets', points: 75 },
        { value: 'c', text: 'Somewhat', points: 25 },
        { value: 'd', text: 'No', points: 0 }
      ]
    }
  ],
  confidence: [
    {
      id: 'q7',
      question: 'How confident are you in explaining your business mission to a funder?',
      type: 'scale',
      scale: { min: 1, max: 10 }
    },
    {
      id: 'q8',
      question: 'How confident are you in preparing a grant proposal?',
      type: 'scale',
      scale: { min: 1, max: 10 }
    }
  ]
};

export default function IncubateHerPreAssessment() {
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState(null);

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

  const { data: existingAssessment } = useQuery({
    queryKey: ['pre-assessment', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return null;
      const assessments = await base44.entities.ProgramAssessment.filter({
        enrollment_id: enrollment.id,
        assessment_type: 'pre'
      });
      return assessments[0];
    },
    enabled: !!enrollment?.id
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (data) => {
      const assessment = await base44.entities.ProgramAssessment.create(data);
      
      if (enrollment) {
        await base44.entities.ProgramEnrollment.update(enrollment.id, {
          pre_assessment_completed: true,
          pre_assessment_date: new Date().toISOString(),
          pre_assessment_score: data.total_score
        });

        // Automatically send consultation invitation email
        try {
          await base44.functions.invoke('sendConsultationInvite', {
            enrollment_id: enrollment.id
          });
        } catch (emailError) {
          console.error('Failed to send consultation invite email:', emailError);
          // Continue even if email fails
        }
      }
      
      return assessment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment']);
      queryClient.invalidateQueries(['pre-assessment']);
      toast.success('Assessment submitted successfully!');
    }
  });

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateScores = () => {
    let grantsContractsScore = 0;
    let legalScore = 0;
    let financialScore = 0;
    let confidenceScore = 0;

    // Grants vs Contracts
    QUESTIONS.grants_vs_contracts.forEach(q => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option) grantsContractsScore += option.points;
      }
    });
    grantsContractsScore = (grantsContractsScore / 200) * 100; // Normalize to 100

    // Legal Readiness
    QUESTIONS.legal_readiness.forEach(q => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option) legalScore += option.points;
      }
    });
    legalScore = (legalScore / 200) * 100;

    // Financial Readiness
    QUESTIONS.financial_readiness.forEach(q => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option) financialScore += option.points;
      }
    });
    financialScore = (financialScore / 200) * 100;

    // Confidence (average of 1-10 scale)
    const confidenceResponses = QUESTIONS.confidence.map(q => parseInt(responses[q.id]) || 0);
    confidenceScore = (confidenceResponses.reduce((a, b) => a + b, 0) / confidenceResponses.length) * 10;

    const totalScore = Math.round((grantsContractsScore + legalScore + financialScore + confidenceScore) / 4);

    return {
      grants_vs_contracts_score: Math.round(grantsContractsScore),
      legal_readiness_score: Math.round(legalScore),
      financial_readiness_score: Math.round(financialScore),
      confidence_score: Math.round(confidenceScore),
      total_score: totalScore
    };
  };

  const handleSubmit = async () => {
    const calculatedScores = calculateScores();
    setScores(calculatedScores);
    setSubmitted(true);

    if (enrollment) {
      await submitAssessmentMutation.mutateAsync({
        enrollment_id: enrollment.id,
        participant_email: user.email,
        assessment_type: 'pre',
        responses: responses,
        ...calculatedScores
      });
    }
  };

  const getReadinessProfile = (totalScore) => {
    if (totalScore >= 80) return { level: 'Strong', color: BRAND_COLORS.eisGold, message: 'You have strong funding readiness foundations!' };
    if (totalScore >= 60) return { level: 'Developing', color: BRAND_COLORS.eisNavy, message: 'You\'re building good foundations—keep going!' };
    if (totalScore >= 40) return { level: 'Emerging', color: '#F5A623', message: 'You\'re on the right track—this program will help!' };
    return { level: 'Building', color: BRAND_COLORS.culRed, message: 'Perfect timing to build your funding readiness!' };
  };

  if (existingAssessment && !submitted) {
    const profile = getReadinessProfile(existingAssessment.total_score);
    
    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="Pre-Assessment Results" />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card>
            <CardContent className="pt-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.neutralDark }}>
                You've already completed the Pre-Assessment
              </h2>
              <div className="mb-6">
                <p className="text-6xl font-bold mb-2" style={{ color: profile.color }}>
                  {existingAssessment.total_score}
                </p>
                <Badge style={{ backgroundColor: profile.color, color: BRAND_COLORS.neutralLight }}>
                  {profile.level} Readiness
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  if (submitted && scores) {
    const profile = getReadinessProfile(scores.total_score);

    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="Your Readiness Profile" />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="mb-6">
            <CardContent className="pt-8 text-center">
              <CheckCircle2 className="w-20 h-20 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
              <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                Assessment Complete!
              </h2>
              <p className="text-lg mb-6" style={{ color: BRAND_COLORS.eisNavy }}>
                {profile.message}
              </p>
              
              <div className="mb-6">
                <p className="text-7xl font-bold mb-3" style={{ color: profile.color }}>
                  {scores.total_score}
                </p>
                <Badge className="text-lg px-4 py-2" style={{ backgroundColor: profile.color, color: BRAND_COLORS.neutralLight }}>
                  {profile.level} Readiness
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle style={{ color: BRAND_COLORS.culRed }}>Your Scores Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: BRAND_COLORS.neutralDark }}>Grants vs Contracts Knowledge</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                    {scores.grants_vs_contracts_score}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: BRAND_COLORS.neutralDark }}>Legal Readiness</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                    {scores.legal_readiness_score}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: BRAND_COLORS.neutralDark }}>Financial Readiness</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                    {scores.financial_readiness_score}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: BRAND_COLORS.neutralDark }}>Confidence Level</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                    {scores.confidence_score}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="Pre-Assessment"
        subtitle="Let's establish your funding readiness baseline"
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="mb-6" style={{ borderColor: BRAND_COLORS.culRed, borderWidth: 2 }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
              <div>
                <p className="font-semibold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                  This assessment helps us understand where you are now
                </p>
                <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                  There are no wrong answers. Be honest so we can provide the best support for your journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grants vs Contracts Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Grants vs Contracts Knowledge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTIONS.grants_vs_contracts.map((q) => (
              <div key={q.id}>
                <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                  {q.question}
                </Label>
                <RadioGroup value={responses[q.id]} onValueChange={(val) => handleResponseChange(q.id, val)}>
                  {q.options.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} />
                      <Label htmlFor={`${q.id}-${opt.value}`} className="cursor-pointer">
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Legal Readiness Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Legal Structure Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTIONS.legal_readiness.map((q) => (
              <div key={q.id}>
                <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                  {q.question}
                </Label>
                <RadioGroup value={responses[q.id]} onValueChange={(val) => handleResponseChange(q.id, val)}>
                  {q.options.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} />
                      <Label htmlFor={`${q.id}-${opt.value}`} className="cursor-pointer">
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Financial Readiness Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Financial & Document Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTIONS.financial_readiness.map((q) => (
              <div key={q.id}>
                <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                  {q.question}
                </Label>
                <RadioGroup value={responses[q.id]} onValueChange={(val) => handleResponseChange(q.id, val)}>
                  {q.options.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} />
                      <Label htmlFor={`${q.id}-${opt.value}`} className="cursor-pointer">
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Confidence Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Confidence Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTIONS.confidence.map((q) => (
              <div key={q.id}>
                <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
                  {q.question}
                </Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Not Confident</span>
                  <RadioGroup 
                    value={responses[q.id]} 
                    onValueChange={(val) => handleResponseChange(q.id, val)}
                    className="flex gap-2"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <div key={num} className="flex flex-col items-center">
                        <RadioGroupItem value={num.toString()} id={`${q.id}-${num}`} />
                        <Label htmlFor={`${q.id}-${num}`} className="text-xs cursor-pointer">{num}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <span className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Very Confident</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          size="lg"
          className="w-full text-white text-lg"
          style={{ backgroundColor: BRAND_COLORS.eisGold }}
          disabled={Object.keys(responses).length < 8}
        >
          Submit Pre-Assessment
        </Button>
      </div>

      <CoBrandedFooter />
    </div>
  );
}