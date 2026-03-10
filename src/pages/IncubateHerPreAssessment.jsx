import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { CheckCircle2, AlertCircle, Sparkles, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QUESTIONS = {
  legal_structure: [
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

// Map JotForm data fields to pre-assessment question answers
function inferResponsesFromJotform(jotformData) {
  if (!jotformData) return {};
  const inferred = {};

  const orgType = (jotformData.org_type || '').toLowerCase();
  const grantExp = (jotformData.grant_experience || '').toLowerCase();
  const revenue = (jotformData.annual_revenue || '').toLowerCase();
  const existingItems = (jotformData.existing_items || '').toLowerCase();
  const fundingBarrier = (jotformData.funding_barrier || '').toLowerCase();
  const documents = (jotformData.documents_needed || '').toLowerCase();
  const participationPlan = (jotformData.participation_plan || '').toLowerCase();

  // ─── q1: Grants vs Contracts primary difference ───────────────────────────
  // If they have grant experience, they likely understand the difference
  if (grantExp.includes('advanced') || grantExp.includes('experienced') || grantExp.includes('applied many') || grantExp.includes('awarded')) {
    inferred['q1'] = 'b'; // Correct: grants fund mission, contracts pay for deliverables
  } else if (grantExp.includes('some') || grantExp.includes('intermediate') || grantExp.includes('applied')) {
    inferred['q1'] = 'b'; // Still likely to know this
  }
  // Beginners left blank — let them answer honestly

  // ─── q2: Who reviews grant applications ───────────────────────────────────
  // Similarly, experienced applicants know this
  if (grantExp.includes('advanced') || grantExp.includes('experienced') || grantExp.includes('applied many') || grantExp.includes('awarded')) {
    inferred['q2'] = 'b'; // Program officers and review committees
  }

  // ─── q3: Legal structure ──────────────────────────────────────────────────
  if (orgType.includes('501') || orgType.includes('nonprofit') || orgType.includes('non-profit')) {
    inferred['q3'] = 'a'; // 501(c)(3) nonprofit with EIN
  } else if (orgType.includes('llc') || orgType.includes('corporation') || orgType.includes('corp') || orgType.includes('inc')) {
    inferred['q3'] = 'b'; // LLC or Corporation with EIN
  } else if (orgType.includes('sole') || orgType.includes('proprietor') || orgType.includes('individual')) {
    inferred['q3'] = 'c'; // Sole proprietor with EIN
  } else if (orgType.includes('no') || orgType.includes('none') || orgType.includes('not yet') || orgType.includes('informal')) {
    inferred['q3'] = 'd'; // No formal structure
  }

  // ─── q4: Governing board ──────────────────────────────────────────────────
  // Nonprofits are required to have boards
  if (orgType.includes('501') || orgType.includes('nonprofit') || orgType.includes('non-profit')) {
    // Check existing_items for board-related mentions
    if (existingItems.includes('board') && (existingItems.includes('minutes') || existingItems.includes('bylaws') || existingItems.includes('formal'))) {
      inferred['q4'] = 'a'; // Yes, with regular meetings and minutes
    } else if (existingItems.includes('board')) {
      inferred['q4'] = 'b'; // Yes, but informal
    } else {
      inferred['q4'] = 'b'; // Default for nonprofits — likely have some form of board
    }
  } else if (orgType.includes('llc') || orgType.includes('corp')) {
    if (existingItems.includes('board') || existingItems.includes('advisory')) {
      inferred['q4'] = 'b'; // Yes, informal advisory
    } else {
      inferred['q4'] = 'c'; // Working on forming one
    }
  }

  // ─── q5: Financial statements ─────────────────────────────────────────────
  // Use existing_items (what they already have) + revenue level
  const hasFinancials = existingItems.includes('financial') || existingItems.includes('budget') || existingItems.includes('audit') || existingItems.includes('balance sheet') || existingItems.includes('990');
  const needsFinancials = documents.includes('financial') || documents.includes('audit') || documents.includes('budget') || documents.includes('990');

  const highRevenue = revenue.includes('250k') || revenue.includes('500k') || revenue.includes('1m') || revenue.includes('750k') || revenue.includes('million') || revenue.match(/\$[2-9]\d{2}/) || revenue.match(/\$\d{1,3}[,.]?\d{3}k?/);
  const someRevenue = revenue.includes('100k') || revenue.includes('50k') || revenue.includes('25k') || (revenue && revenue !== 'none' && revenue !== '$0' && revenue !== '0' && revenue !== 'n/a');

  if (hasFinancials && !needsFinancials && (highRevenue || someRevenue)) {
    inferred['q5'] = 'a'; // Professionally prepared and current
  } else if (hasFinancials || (someRevenue && !needsFinancials)) {
    inferred['q5'] = 'b'; // Yes, but need updating
  } else if (someRevenue || needsFinancials) {
    inferred['q5'] = 'c'; // Basic tracking
  } else if (!someRevenue || revenue === '$0' || revenue === '0' || revenue === 'none') {
    inferred['q5'] = 'd'; // No formal documents
  }

  // ─── q6: Expense tracking by program/project ──────────────────────────────
  const hasAccounting = existingItems.includes('quickbooks') || existingItems.includes('accounting') || existingItems.includes('software') || existingItems.includes('bookkeep');
  const hasSpreadsheet = existingItems.includes('spreadsheet') || existingItems.includes('excel') || existingItems.includes('google sheet');

  if (hasAccounting) {
    inferred['q6'] = 'a'; // Accounting software
  } else if (hasSpreadsheet) {
    inferred['q6'] = 'b'; // Spreadsheets
  } else if (grantExp.includes('advanced') || grantExp.includes('experienced') || grantExp.includes('awarded')) {
    inferred['q6'] = 'b'; // Likely has tracking if experienced with grants
  } else if (grantExp.includes('some') || grantExp.includes('intermediate') || grantExp.includes('applied')) {
    inferred['q6'] = 'c'; // Somewhat
  } else if (grantExp.includes('never') || grantExp.includes('none') || grantExp.includes('no experience') || grantExp.includes('beginner') || grantExp.includes('new')) {
    inferred['q6'] = 'd'; // No tracking
  }

  // ─── q7: Confidence explaining mission ────────────────────────────────────
  // Use grant_experience + years_in_business + org maturity
  const years = parseInt(jotformData.years_in_business) || 0;
  const matureOrg = years >= 5 || highRevenue;
  const establishedOrg = years >= 2 || someRevenue;

  if ((grantExp.includes('advanced') || grantExp.includes('experienced') || grantExp.includes('awarded')) && matureOrg) {
    inferred['q7'] = '9';
  } else if ((grantExp.includes('advanced') || grantExp.includes('experienced')) || matureOrg) {
    inferred['q7'] = '8';
  } else if ((grantExp.includes('some') || grantExp.includes('intermediate') || grantExp.includes('applied')) && establishedOrg) {
    inferred['q7'] = '7';
  } else if (grantExp.includes('some') || grantExp.includes('intermediate') || establishedOrg) {
    inferred['q7'] = '6';
  } else if (grantExp.includes('little') || grantExp.includes('beginner') || grantExp.includes('new')) {
    inferred['q7'] = '4';
  } else if (grantExp.includes('never') || grantExp.includes('none') || grantExp.includes('no experience')) {
    inferred['q7'] = '3';
  }

  // ─── q8: Confidence preparing a grant proposal ────────────────────────────
  // More specific to grant writing skill — typically one level below mission confidence
  if (grantExp.includes('advanced') || grantExp.includes('experienced') || grantExp.includes('awarded') || grantExp.includes('applied many')) {
    inferred['q8'] = '8';
  } else if (grantExp.includes('some') || grantExp.includes('intermediate') || grantExp.includes('applied')) {
    inferred['q8'] = '6';
  } else if (grantExp.includes('little') || grantExp.includes('beginner') || grantExp.includes('new')) {
    inferred['q8'] = '3';
  } else if (grantExp.includes('never') || grantExp.includes('none') || grantExp.includes('no experience')) {
    inferred['q8'] = '2';
  }

  return inferred;
}

const AUTOSAVE_KEY = 'eis_pre_assessment_draft';

export default function IncubateHerPreAssessment() {
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || '{}'); } catch { return {}; }
  });
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState(null);
  const [prefilled, setPrefilled] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        is_active: true
      });
      return cohorts[0];
    }
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      // Prefer active enrollment, fallback to first found
      return enrollments.find(e => e.enrollment_status === 'active') || enrollments[0] || null;
    },
    enabled: !!user?.email
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

  // Load saved draft responses from DB when assessment loads (overrides localStorage)
  React.useEffect(() => {
    if (existingAssessment?.is_draft && existingAssessment?.responses && Object.keys(responses).length === 0) {
      setResponses(existingAssessment.responses);
      toast('Draft loaded — pick up where you left off.', { icon: '💾', duration: 4000 });
    }
  }, [existingAssessment]);

  // Pre-fill responses from JotForm data when enrollment loads
  React.useEffect(() => {
    if (enrollment?.jotform_data && !prefilled && Object.keys(responses).length === 0) {
      const inferred = inferResponsesFromJotform(enrollment.jotform_data);
      if (Object.keys(inferred).length > 0) {
        setResponses(inferred);
        setPrefilled(true);
        toast.success('Some answers pre-filled from your registration form — review and adjust as needed.', { duration: 5000 });
      }
    }
  }, [enrollment]);

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment) return;
      const draftData = {
        enrollment_id: enrollment.id,
        participant_email: user.email,
        assessment_type: 'pre',
        responses: responses,
        is_draft: true
      };
      if (existingAssessment?.data) {
        await base44.entities.ProgramAssessment.update(existingAssessment.id, draftData);
      } else {
        await base44.entities.ProgramAssessment.create(draftData);
      }
      queryClient.invalidateQueries({ queryKey: ['pre-assessment'] });
    },
    onSuccess: () => {
      toast.success('Draft saved! You can come back and finish later.');
    }
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (data) => {
      if (existingAssessment) {
        await base44.entities.ProgramAssessment.update(existingAssessment.id, data);
      } else {
        await base44.entities.ProgramAssessment.create(data);
      }
      
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment'] });
      queryClient.invalidateQueries({ queryKey: ['pre-assessment'] });
      toast.success('Assessment submitted successfully!');
    }
  });

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => {
      const next = { ...prev, [questionId]: value };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const calculateScores = () => {
    let legalStructureScore = 0;
    let financialSystemsScore = 0;
    let dataScore = 0;
    let confidenceScore = 0;

    // Legal Structure
    QUESTIONS.legal_structure.forEach(q => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option) legalStructureScore += option.points;
      }
    });
    legalStructureScore = (legalStructureScore / 200) * 100;

    // Financial Systems
    QUESTIONS.financial_systems.forEach(q => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option) financialSystemsScore += option.points;
      }
    });
    financialSystemsScore = (financialSystemsScore / 200) * 100;

    // Data Measurement
    QUESTIONS.data_measurement.forEach(q => {
      const answer = responses[q.id];
      if (answer) {
        const option = q.options.find(o => o.value === answer);
        if (option) dataScore += option.points;
      }
    });
    dataScore = (dataScore / 200) * 100;

    // Confidence (average of 1-10 scale)
    const confidenceResponses = QUESTIONS.confidence.map(q => parseInt(responses[q.id]) || 0);
    confidenceScore = (confidenceResponses.reduce((a, b) => a + b, 0) / confidenceResponses.length) * 10;

    const totalScore = Math.round((legalStructureScore + financialSystemsScore + dataScore + confidenceScore) / 4);

    return {
      legal_structure_score: Math.round(legalStructureScore),
      financial_systems_score: Math.round(financialSystemsScore),
      data_measurement_score: Math.round(dataScore),
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
        assessment_type: 'pre',
        responses: responses,
        ...calculatedScores
      });
    }
  };

  const handleDownloadPDF = (data, scoreData) => {
    const doc = new jsPDF('p', 'mm', 'letter');
    const margin = 20;
    let y = 30;

    doc.setFontSize(18); doc.setTextColor(20, 58, 80);
    doc.text('IncubateHer Pre-Assessment', margin, y); y += 10;
    doc.setFontSize(11); doc.setTextColor(100, 100, 100);
    doc.text(`Participant: ${user?.full_name || user?.email || ''}`, margin, y); y += 7;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y); y += 12;

    doc.setDrawColor(229, 192, 137); doc.line(margin, y, 196, y); y += 8;

    if (scoreData) {
      doc.setFontSize(13); doc.setTextColor(20, 58, 80);
      doc.text(`Total Score: ${scoreData.total_score}`, margin, y); y += 8;
      [
        ['Grants vs Contracts Knowledge', scoreData.grants_vs_contracts_score],
        ['Legal Readiness', scoreData.legal_readiness_score],
        ['Financial Readiness', scoreData.financial_readiness_score],
        ['Confidence Level', scoreData.confidence_score],
      ].forEach(([label, val]) => {
        doc.setFontSize(10); doc.setTextColor(60, 60, 60);
        doc.text(`  ${label}: ${val}`, margin, y); y += 7;
      });
      y += 5;
    }

    const allQs = [...QUESTIONS.grants_vs_contracts, ...QUESTIONS.legal_readiness, ...QUESTIONS.financial_readiness, ...QUESTIONS.confidence];
    allQs.forEach((q) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(10); doc.setTextColor(20, 58, 80); doc.setFont(undefined, 'bold');
      const qLines = doc.splitTextToSize(q.question, 170);
      qLines.forEach(l => { doc.text(l, margin, y); y += 6; });
      doc.setFont(undefined, 'normal'); doc.setTextColor(60, 60, 60);
      const ans = data[q.id];
      const ansText = q.options ? (q.options.find(o => o.value === ans)?.text || ans || '(no answer)') : (ans || '(no answer)');
      doc.text(`  → ${ansText}`, margin, y); y += 8;
    });

    doc.setFontSize(8); doc.setTextColor(130, 130, 130);
    doc.text('Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions', 108, 280, { align: 'center' });
    doc.save(`IncubateHer_Pre_Assessment_${user?.full_name?.replace(/\s+/g, '_') || 'Participant'}.pdf`);
  };

  const getReadinessProfile = (totalScore) => {
    if (totalScore >= 80) return { level: 'Strong', color: BRAND_COLORS.eisGold, message: 'You have strong funding readiness foundations!' };
    if (totalScore >= 60) return { level: 'Developing', color: BRAND_COLORS.eisNavy, message: 'You\'re building good foundations—keep going!' };
    if (totalScore >= 40) return { level: 'Emerging', color: '#F5A623', message: 'You\'re on the right track—this program will help!' };
    return { level: 'Building', color: BRAND_COLORS.culRed, message: 'Perfect timing to build your funding readiness!' };
  };

  if (existingAssessment && !existingAssessment.is_draft && !submitted) {
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
               <div className="flex gap-3 justify-center">
                 <Button variant="outline" onClick={() => handleDownloadPDF(existingAssessment.responses || {}, existingAssessment)}>
                   <Download className="w-4 h-4 mr-2" /> Download PDF
                 </Button>
                 <Button 
                   onClick={() => {
                     setResponses({});
                     setSubmitted(false);
                     setPrefilled(false);
                     localStorage.removeItem(AUTOSAVE_KEY);
                   }}
                   style={{ backgroundColor: BRAND_COLORS.eisGold, color: BRAND_COLORS.neutralLight }}
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
              <Button variant="outline" className="mt-4" onClick={() => handleDownloadPDF(responses, scores)}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle style={{ color: BRAND_COLORS.culRed }}>Your Scores Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: BRAND_COLORS.neutralDark }}>Legal Structure & Documents</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                    {scores.legal_structure_score}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: BRAND_COLORS.neutralDark }}>Financial Systems & Tracking</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                    {scores.financial_systems_score}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: BRAND_COLORS.neutralDark }}>Data & Outcome Measurement</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                    {scores.data_measurement_score}
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

        {prefilled && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Some answers pre-filled from your registration</p>
                  <p className="text-sm text-blue-700 mt-1">
                    We've used information from your registration form to suggest answers. Please review each question carefully and adjust any responses that don't accurately reflect your current situation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legal Structure Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Legal Structure & Documents (Day 1)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {QUESTIONS.legal_structure.map((q) => (
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

        {/* Financial Systems Section */}
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

        {/* Data Measurement Section */}
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
            disabled={Object.keys(responses).length < 8 || submitAssessmentMutation.isPending}
          >
            {submitAssessmentMutation.isPending ? 'Submitting...' : 'Submit Pre-Assessment'}
          </Button>
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}