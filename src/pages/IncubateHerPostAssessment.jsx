import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import jsPDF from 'jspdf';
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
import { CheckCircle2, AlertCircle, TrendingUp, Award, Download, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QUESTIONS = {
  grants_vs_contracts: [
    {
      id: 'q1',
      question: 'Which of the following documents is required to demonstrate legal fundability?',
      options: [
        { value: 'a', text: 'Articles of Incorporation or Organization', points: 100 },
        { value: 'b', text: 'Social media following list', points: 0 },
        { value: 'c', text: 'Informal partnership agreement', points: 25 },
        { value: 'd', text: 'Only a business name', points: 0 }
      ]
    },
    {
      id: 'q2',
      question: 'What is the primary purpose of having an up-to-date Board Resolution or Bylaws?',
      options: [
        { value: 'a', text: 'To show funders that your organization has formal governance structure', points: 100 },
        { value: 'b', text: 'To make your website look more professional', points: 0 },
        { value: 'c', text: 'Only nonprofits need these documents', points: 25 },
        { value: 'd', text: 'They are not really important', points: 0 }
      ]
    }
  ],
  legal_readiness: [
    {
      id: 'q1',
      question: 'Which of the following documents is required to demonstrate legal fundability?',
      options: [
        { value: 'a', text: 'Articles of Incorporation or Organization', points: 100 },
        { value: 'b', text: 'Social media following list', points: 0 },
        { value: 'c', text: 'Informal partnership agreement', points: 25 },
        { value: 'd', text: 'Only a business name', points: 0 }
      ]
    },
    {
      id: 'q2',
      question: 'What is the primary purpose of having an up-to-date Board Resolution or Bylaws?',
      options: [
        { value: 'a', text: 'To show funders that your organization has formal governance structure', points: 100 },
        { value: 'b', text: 'To make your website look more professional', points: 0 },
        { value: 'c', text: 'Only nonprofits need these documents', points: 25 },
        { value: 'd', text: 'They are not really important', points: 0 }
      ]
    }
  ],
  financial_readiness: [
    {
      id: 'q3',
      question: 'Why is tracking expenses by program or project important for funders?',
      options: [
        { value: 'a', text: 'It proves you can manage money and deliver on promises', points: 100 },
        { value: 'b', text: 'It is just a nice-to-have administrative task', points: 0 },
        { value: 'c', text: 'Only large organizations need to do this', points: 25 },
        { value: 'd', text: 'Funders do not actually care about expense tracking', points: 0 }
      ]
    },
    {
      id: 'q4',
      question: 'What should your financial documentation include to be funding-ready?',
      options: [
        { value: 'a', text: 'Program-level budgets, expense tracking system, and a method to match spending to funding sources', points: 100 },
        { value: 'b', text: 'Just a general estimate of spending', points: 0 },
        { value: 'c', text: 'Personal bank statements', points: 25 },
        { value: 'd', text: 'Monthly receipts in a shoebox', points: 0 }
      ]
    }
  ],
  financial_systems: [
    {
      id: 'q3',
      question: 'Why is tracking expenses by program or project important for funders?',
      options: [
        { value: 'a', text: 'It proves you can manage money and deliver on promises', points: 100 },
        { value: 'b', text: 'It is just a nice-to-have administrative task', points: 0 },
        { value: 'c', text: 'Only large organizations need to do this', points: 25 },
        { value: 'd', text: 'Funders do not actually care about expense tracking', points: 0 }
      ]
    },
    {
      id: 'q4',
      question: 'What should your financial documentation include to be funding-ready?',
      options: [
        { value: 'a', text: 'Program-level budgets, expense tracking system, and a method to match spending to funding sources', points: 100 },
        { value: 'b', text: 'Just a general estimate of spending', points: 0 },
        { value: 'c', text: 'Personal bank statements', points: 25 },
        { value: 'd', text: 'Monthly receipts in a shoebox', points: 0 }
      ]
    }
  ],
  data_measurement: [
    {
      id: 'q5',
      question: 'What is the relationship between data collection and funding renewal?',
      options: [
        { value: 'a', text: 'You cannot get renewed if you cannot report measurable outcomes', points: 100 },
        { value: 'b', text: 'Data collection is optional', points: 0 },
        { value: 'c', text: 'You can collect data after you get funded', points: 25 },
        { value: 'd', text: 'Funders only care about money spent, not results', points: 0 }
      ]
    },
    {
      id: 'q6',
      question: 'Which of the following is a critical component of a data collection system?',
      options: [
        { value: 'a', text: 'A clear method to track who you serve, what services they receive, and what changes occur', points: 100 },
        { value: 'b', text: 'Just counting how many people attend events', points: 25 },
        { value: 'c', text: 'Collecting data only when a grant requires it', points: 0 },
        { value: 'd', text: 'Keeping everything in email threads', points: 0 }
      ]
    }
  ],
  confidence: [
    {
      id: 'q7',
      question: 'How confident are you in preparing your organizational legal and governance documents for a funder?',
      type: 'scale',
      scale: { min: 1, max: 10 }
    },
    {
      id: 'q8',
      question: 'How confident are you in setting up and maintaining a financial tracking system by program?',
      type: 'scale',
      scale: { min: 1, max: 10 }
    }
  ]
};

const AUTOSAVE_KEY = 'eis_post_assessment_draft';

export default function IncubateHerPostAssessment() {
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState(() => {
    try { const d = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || '{}'); return d.responses || {}; } catch { return {}; }
  });
  const [nextSteps, setNextSteps] = useState(() => {
    try { const d = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || '{}'); return d.nextSteps || ''; } catch { return ''; }
  });
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

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      // Get the active cohort first, then find enrollment in it
      const cohorts = await base44.entities.ProgramCohort.filter({ is_active: true });
      const activeCohort = cohorts[0];
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email,
        ...(activeCohort?.id ? { cohort_id: activeCohort.id } : {})
      });
      return enrollments[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: preAssessment, isLoading: preAssessmentLoading } = useQuery({
    queryKey: ['pre-assessment', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return null;
      const assessments = await base44.entities.ProgramAssessment.filter({
        enrollment_id: enrollment.id,
        assessment_type: 'pre'
      });
      // Prefer the submitted (non-draft) record; fall back to any record
      return assessments.find(a => !a.is_draft) || assessments[0] || null;
    },
    enabled: !!enrollment?.id
  });

  const { data: existingPostAssessment } = useQuery({
    queryKey: ['post-assessment', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return null;
      const assessments = await base44.entities.ProgramAssessment.filter({
        enrollment_id: enrollment.id,
        assessment_type: 'post'
      });
      return assessments[0];
    },
    enabled: !!enrollment?.id
  });

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment) return;
      const draftData = {
        enrollment_id: enrollment.id,
        participant_email: user.email,
        assessment_type: 'post',
        responses: responses,
        next_steps: nextSteps,
        is_draft: true
      };
      if (existingPostAssessment) {
        await base44.entities.ProgramAssessment.update(existingPostAssessment.id, draftData);
      } else {
        await base44.entities.ProgramAssessment.create(draftData);
      }
      queryClient.invalidateQueries({ queryKey: ['post-assessment'] });
    },
    onSuccess: () => {
      toast.success('Draft saved! You can come back and finish later.');
    }
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (data) => {
      if (existingPostAssessment) {
        await base44.entities.ProgramAssessment.update(existingPostAssessment.id, data);
      } else {
        await base44.entities.ProgramAssessment.create(data);
      }
      
      if (enrollment) {
        await base44.entities.ProgramEnrollment.update(enrollment.id, {
          post_assessment_completed: true,
          post_assessment_date: new Date().toISOString(),
          post_assessment_score: data.total_score
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment'] });
      queryClient.invalidateQueries({ queryKey: ['post-assessment'] });
      toast.success('Post-assessment submitted successfully!');
    }
  });

  // Load saved draft responses from DB when assessment loads
  useEffect(() => {
    if (existingPostAssessment?.is_draft && existingPostAssessment?.responses && Object.keys(responses).length === 0) {
      setResponses(existingPostAssessment.responses);
      if (existingPostAssessment.next_steps) setNextSteps(existingPostAssessment.next_steps);
      toast('Draft loaded — pick up where you left off.', { icon: '💾', duration: 4000 });
    }
  }, [existingPostAssessment]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => {
      const next = { ...prev, [questionId]: value };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ responses: next, nextSteps }));
      return next;
    });
  };

  const handleNextStepsChange = (value) => {
    setNextSteps(value);
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ responses, nextSteps: value }));
  };

  const handleDownloadPDF = (respData, scoreData, steps) => {
    const doc = new jsPDF('p', 'mm', 'letter');
    const margin = 20;
    let y = 30;
    doc.setFontSize(18); doc.setTextColor(20, 58, 80);
    doc.text('IncubateHer Post-Assessment', margin, y); y += 10;
    doc.setFontSize(11); doc.setTextColor(100, 100, 100);
    doc.text(`Participant: ${user?.full_name || user?.email || ''}`, margin, y); y += 7;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y); y += 12;
    doc.setDrawColor(229, 192, 137); doc.line(margin, y, 196, y); y += 8;
    if (scoreData) {
      doc.setFontSize(13); doc.setTextColor(20, 58, 80);
      doc.text(`Total Score: ${scoreData.total_score || scoreData.total_score}`, margin, y); y += 12;
    }
    const allQs = [...(QUESTIONS.grants_vs_contracts || []), ...(QUESTIONS.legal_readiness || []), ...(QUESTIONS.financial_readiness || []), ...(QUESTIONS.confidence || [])];
    allQs.forEach((q) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(10); doc.setTextColor(20, 58, 80); doc.setFont(undefined, 'bold');
      const qLines = doc.splitTextToSize(q.question, 170);
      qLines.forEach(l => { doc.text(l, margin, y); y += 6; });
      doc.setFont(undefined, 'normal'); doc.setTextColor(60, 60, 60);
      const ans = respData[q.id];
      const ansText = q.options ? (q.options.find(o => o.value === ans)?.text || ans || '(no answer)') : (ans || '(no answer)');
      doc.text(`  → ${ansText}`, margin, y); y += 8;
    });
    if (steps) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(12); doc.setTextColor(20, 58, 80); doc.setFont(undefined, 'bold');
      doc.text('My Next 3 Steps:', margin, y); y += 8;
      doc.setFont(undefined, 'normal'); doc.setTextColor(60, 60, 60);
      const stepLines = doc.splitTextToSize(steps, 170);
      stepLines.forEach(l => { doc.text(l, margin, y); y += 6; });
    }
    doc.setFontSize(8); doc.setTextColor(130, 130, 130);
    doc.text('Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions', 108, 280, { align: 'center' });
    doc.save(`IncubateHer_Post_Assessment_${user?.full_name?.replace(/\s+/g, '_') || 'Participant'}.pdf`);
  };

  const calculateScores = () => {
    let grantsContractsScore = 0;
    let legalReadinessScore = 0;
    let financialReadinessScore = 0;
    let confidenceScore = 0;

    QUESTIONS.grants_vs_contracts.forEach(q => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option) grantsContractsScore += option.points;
      }
    });
    grantsContractsScore = (grantsContractsScore / 200) * 100;

    QUESTIONS.legal_readiness.forEach(q => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option) legalReadinessScore += option.points;
      }
    });
    legalReadinessScore = (legalReadinessScore / 200) * 100;

    QUESTIONS.financial_readiness.forEach(q => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option) financialReadinessScore += option.points;
      }
    });
    financialReadinessScore = (financialReadinessScore / 200) * 100;

    const confidenceResponses = QUESTIONS.confidence.map(q => parseInt(responses[q.id]) || 0);
    confidenceScore = (confidenceResponses.reduce((a, b) => a + b, 0) / confidenceResponses.length) * 10;

    const totalScore = Math.round((grantsContractsScore + legalReadinessScore + financialReadinessScore + confidenceScore) / 4);

    return {
      grants_vs_contracts_score: Math.round(grantsContractsScore),
      legal_readiness_score: Math.round(legalReadinessScore),
      financial_readiness_score: Math.round(financialReadinessScore),
      confidence_score: Math.round(confidenceScore),
      total_score: totalScore
    };
  };

  const handleSubmit = async () => {
    const calculatedScores = calculateScores();
    setScores(calculatedScores);
    setSubmitted(true);

    localStorage.removeItem(AUTOSAVE_KEY);
    if (enrollment) {
      await submitAssessmentMutation.mutateAsync({
        enrollment_id: enrollment.id,
        participant_email: user.email,
        assessment_type: 'post',
        responses: responses,
        next_steps: nextSteps,
        ...calculatedScores
      });
    }
  };

  // Still loading — don't gate yet
  const isStillLoading = !user || enrollmentLoading || (!!enrollment?.id && preAssessmentLoading);

  // Only require the enrollment flag — trust it as source of truth
  const preAssessmentMissing = !isStillLoading && !enrollment?.pre_assessment_completed;

  if (isStillLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#143A50] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (preAssessmentMissing) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="Post-Assessment" />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card>
            <CardContent className="pt-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.culRed }} />
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.neutralDark }}>
                Pre-Assessment Required
              </h2>
              <p className="mb-6" style={{ color: BRAND_COLORS.eisNavy }}>
                You must complete the Pre-Assessment before taking the Post-Assessment.
              </p>
              <Button
                onClick={() => window.location.href = '/IncubateHerPreAssessment'}
                style={{ backgroundColor: BRAND_COLORS.eisGold, color: BRAND_COLORS.neutralLight }}
              >
                Go to Pre-Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  if (existingPostAssessment && !existingPostAssessment.is_draft && !submitted) {
     const delta = (existingPostAssessment.total_score || 0) - (preAssessment?.total_score || enrollment?.pre_assessment_score || 0);

     return (
       <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
         <CoBrandedHeader title="Post-Assessment Results" />
         <div className="max-w-4xl mx-auto px-6 py-12">
           <Card className="mb-6" style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2, backgroundColor: '#fffbf0' }}>
             <CardContent className="pt-6">
               <div className="flex items-start gap-3">
                 <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
                 <div>
                   <p className="font-semibold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                     Assessment Updated
                   </p>
                   <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                     We've updated the post-assessment to better measure what you've learned during the program. Would you like to retake it to get a more accurate picture of your growth?
                   </p>
                   <Button 
                     size="sm" 
                     className="mt-3"
                     style={{ backgroundColor: BRAND_COLORS.eisGold, color: '#fff' }}
                     onClick={async () => {
                       setResponses({});
                       setSubmitted(false);
                       setNextSteps('');
                       localStorage.removeItem(AUTOSAVE_KEY);
                       if (existingPostAssessment?.id) {
                         await base44.entities.ProgramAssessment.update(existingPostAssessment.id, {
                           is_draft: true,
                           responses: {},
                           next_steps: ''
                         });
                       }
                       queryClient.invalidateQueries({ queryKey: ['post-assessment'] });
                     }}
                   >
                     Retake Assessment
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card>
             <CardContent className="pt-8 text-center">
               <Award className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
               <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.neutralDark }}>
                 Your Previous Results
               </h2>
               <div className="flex justify-center items-center gap-8 mb-6">
                 <div>
                   <p className="text-sm text-slate-600 mb-1">Pre-Assessment</p>
                   <p className="text-4xl font-bold" style={{ color: BRAND_COLORS.eisNavy }}>
                     {preAssessment.total_score}
                   </p>
                 </div>
                 <TrendingUp className="w-12 h-12" style={{ color: BRAND_COLORS.eisGold }} />
                 <div>
                   <p className="text-sm text-slate-600 mb-1">Post-Assessment</p>
                   <p className="text-4xl font-bold" style={{ color: BRAND_COLORS.culRed }}>
                     {existingPostAssessment.total_score}
                   </p>
                 </div>
               </div>
               <Badge style={{ backgroundColor: BRAND_COLORS.eisGold, color: BRAND_COLORS.neutralLight, fontSize: '1.2rem', padding: '0.5rem 1rem' }}>
                 Growth: +{delta} points
               </Badge>
               <div className="mt-4 flex flex-wrap gap-3 justify-center">
                 <Button variant="outline" onClick={() => handleDownloadPDF(existingPostAssessment.responses || {}, existingPostAssessment, existingPostAssessment.next_steps)}>
                   <Download className="w-4 h-4 mr-2" /> Download PDF
                 </Button>
                 <Link to={createPageUrl('IncubateHerEvaluation')}>
                   <Button style={{ backgroundColor: BRAND_COLORS.eisGold, color: '#fff' }}>
                     Go to Program Evaluation <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
                 </Link>
                 <Button 
                   variant="outline"
                   onClick={async () => {
                     setResponses({});
                     setSubmitted(false);
                     setNextSteps('');
                     localStorage.removeItem(AUTOSAVE_KEY);
                     if (existingPostAssessment?.id) {
                       await base44.entities.ProgramAssessment.update(existingPostAssessment.id, {
                         is_draft: true,
                         responses: {},
                         next_steps: ''
                       });
                     }
                     queryClient.invalidateQueries({ queryKey: ['post-assessment'] });
                   }}
                 >
                   Retake Assessment
                 </Button>
               </div>
             </CardContent>
           </Card>
         </div>
         <CoBrandedFooter />
       </div>
     );
   }

  if (submitted && scores) {
    const delta = scores.total_score - (preAssessment?.total_score || 0);

    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="Your Growth Journey" />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="mb-6">
            <CardContent className="pt-8 text-center">
              <Award className="w-20 h-20 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
              <h2 className="text-3xl font-bold mb-6" style={{ color: BRAND_COLORS.neutralDark }}>
                Congratulations on Completing the Program!
              </h2>
              
              <div className="flex justify-center items-center gap-12 mb-8">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Before</p>
                  <p className="text-6xl font-bold" style={{ color: BRAND_COLORS.eisNavy }}>
                    {preAssessment.total_score}
                  </p>
                </div>
                
                <TrendingUp className="w-16 h-16" style={{ color: BRAND_COLORS.eisGold }} />
                
                <div>
                  <p className="text-sm text-slate-600 mb-2">After</p>
                  <p className="text-6xl font-bold" style={{ color: BRAND_COLORS.culRed }}>
                    {scores.total_score}
                  </p>
                </div>
              </div>

              <Badge className="text-xl px-6 py-3" style={{ backgroundColor: BRAND_COLORS.eisGold, color: BRAND_COLORS.neutralLight }}>
                Your Growth: +{delta} points
              </Badge>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Button variant="outline" onClick={() => handleDownloadPDF(responses, scores, nextSteps)}>
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Link to={createPageUrl('IncubateHerEvaluation')}>
                  <Button style={{ backgroundColor: BRAND_COLORS.eisGold, color: '#fff' }}>
                    Go to Program Evaluation <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle style={{ color: BRAND_COLORS.culRed }}>Your Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2" style={{ color: BRAND_COLORS.eisNavy }}>
                You shared these as your next 3 steps:
              </p>
              <p className="whitespace-pre-wrap" style={{ color: BRAND_COLORS.neutralDark }}>
                {nextSteps}
              </p>
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
        title="Post-Assessment"
        subtitle="Measure your growth and plan your next steps"
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="mb-6" style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
              <div>
                <p className="font-semibold mb-2" style={{ color: BRAND_COLORS.neutralDark }}>
                  Let's measure your growth!
                </p>
                <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                  Answer the same questions from the Pre-Assessment so we can see how much you've learned.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Same questions as pre-assessment */}
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Financial Systems & Tracking (Day 2)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTIONS.financial_systems.map((q) => (
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Data & Outcome Measurement (Day 2)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTIONS.data_measurement.map((q) => (
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

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>My Next 3 Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-base mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
              What are your next 3 action steps based on what you've learned?
            </Label>
            <Textarea
              value={nextSteps}
              onChange={(e) => handleNextStepsChange(e.target.value)}
              placeholder="1. &#10;2. &#10;3. "
              rows={6}
              className="w-full"
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => saveDraftMutation.mutate()}
            size="lg"
            variant="outline"
            className="flex-1 text-lg"
            disabled={Object.keys(responses).length === 0 || saveDraftMutation.isPending}
          >
            {saveDraftMutation.isPending ? 'Saving...' : '💾 Save & Come Back Later'}
          </Button>
          <Button
            onClick={handleSubmit}
            size="lg"
            className="flex-1 text-white text-lg"
            style={{ backgroundColor: BRAND_COLORS.eisGold }}
            disabled={Object.keys(responses).length < 8 || !nextSteps.trim() || submitAssessmentMutation.isPending}
          >
            {submitAssessmentMutation.isPending ? 'Submitting...' : 'Submit Post-Assessment'}
          </Button>
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}