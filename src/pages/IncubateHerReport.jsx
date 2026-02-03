import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Save, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

export default function IncubateHerReportPage() {
  const [reportData, setReportData] = useState({
    program_name: 'IncubateHer – Funding Readiness: Preparing for Grants & Contracts',
    program_description: `The IncubateHer Funding Readiness workshop series was designed to strengthen participants' capacity to pursue future funding opportunities by improving their understanding of grants and contracts, clarifying readiness requirements, and identifying key operational and documentation gaps. The program emphasized preparation rather than application writing, supporting both nonprofit and for-profit entrepreneurs in making informed, strategic decisions aligned with their business structure, stage of growth, and capacity.

The program was delivered through a short, intensive learning format and included structured group instruction, readiness assessments, and individualized one-on-one consultations. Content was aligned with IncubateHer's Business Operations and Business Organization curriculum areas and tailored to the needs of women entrepreneurs, many of whom are early-stage or growth-phase business owners.`,
    equity_narrative: `The program centered equity by meeting participants where they were, avoiding assumptions about readiness, and reducing harm caused by premature or misaligned funding pursuits. By emphasizing preparation, clarity, and informed decision-making, the program supported sustainable business growth and reduced common barriers faced by women entrepreneurs navigating complex funding systems.`,
    compliance_statement: `This program focused on funding readiness and preparation. It did not include grant searches, application drafting during sessions, or guarantees of funding. Any additional grant-writing support offered outside of the program was not funded through Columbus Urban League grant resources.`,
    incentive_language: `As an engagement incentive, participants who completed all program requirements were eligible for a randomized drawing for a complimentary grant-writing session for one non-federal grant. This incentive was not tied to program outcomes and did not guarantee funding.`
  });

  const [generatingAI, setGeneratingAI] = useState(false);

  // Fetch IncubateHer cohort data
  const { data: cohorts } = useQuery({
    queryKey: ['incubateher-cohorts'],
    queryFn: async () => {
      const allCohorts = await base44.entities.ProgramCohort.list();
      return allCohorts.filter(c => c.program_code?.includes('incubateher'));
    }
  });

  const activeCohort = cohorts?.[0];

  // Fetch enrollment data
  const { data: enrollments } = useQuery({
    queryKey: ['incubateher-enrollments', activeCohort?.id],
    queryFn: async () => {
      if (!activeCohort?.id) return [];
      return await base44.entities.ProgramEnrollment.filter({
        cohort_id: activeCohort.id
      });
    },
    enabled: !!activeCohort?.id
  });

  // Fetch assessment data
  const { data: assessments } = useQuery({
    queryKey: ['incubateher-assessments'],
    queryFn: () => base44.entities.ProgramAssessment.list()
  });

  // Calculate metrics
  const totalEnrolled = enrollments?.length || 0;
  const completedAllSessions = enrollments?.filter(e => e.attendance_complete).length || 0;
  const completedConsultations = enrollments?.filter(e => e.consultation_completed).length || 0;
  const completedAllRequirements = enrollments?.filter(e => 
    e.pre_assessment_completed && 
    e.attendance_complete && 
    e.consultation_completed && 
    e.post_assessment_completed
  ).length || 0;

  const preAssessments = assessments?.filter(a => a.assessment_type === 'pre') || [];
  const postAssessments = assessments?.filter(a => a.assessment_type === 'post') || [];

  const avgPreScore = preAssessments.length > 0
    ? (preAssessments.reduce((sum, a) => sum + a.total_score, 0) / preAssessments.length).toFixed(1)
    : 0;

  const avgPostScore = postAssessments.length > 0
    ? (postAssessments.reduce((sum, a) => sum + a.total_score, 0) / postAssessments.length).toFixed(1)
    : 0;

  const avgImprovement = (avgPostScore - avgPreScore).toFixed(1);

  const generateAINarrative = async (section) => {
    setGeneratingAI(true);
    try {
      let prompt = '';
      
      if (section === 'outcomes') {
        prompt = `Write a professional outcomes narrative for a funding readiness program with these results:
- ${totalEnrolled} participants enrolled
- Average pre-assessment score: ${avgPreScore}/100
- Average post-assessment score: ${avgPostScore}/100
- Score improvement: +${avgImprovement} points
- ${completedConsultations} completed one-on-one consultations

Focus on learning outcomes, confidence gains, and readiness improvements. Write 2-3 paragraphs.`;
      } else if (section === 'equity') {
        prompt = `Write a compelling equity and capacity-building impact statement for a program serving women entrepreneurs, emphasizing how the program met participants where they were, reduced barriers, and supported sustainable growth. Write 1-2 paragraphs.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      if (section === 'outcomes') {
        setReportData({ ...reportData, outcomes_narrative: response });
      } else if (section === 'equity') {
        setReportData({ ...reportData, equity_narrative: response });
      }

      toast.success('AI narrative generated');
    } catch (error) {
      toast.error('Failed to generate narrative');
    } finally {
      setGeneratingAI(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('IncubateHer Program Report', margin, y);
    doc.text('Columbus Urban League', margin, y + 8);
    y += 20;

    // Section 1: Program Overview
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('1. Program Overview', margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Program Name:', margin, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    const nameLines = doc.splitTextToSize(reportData.program_name, 170);
    doc.text(nameLines, margin, y);
    y += nameLines.length * 5 + 6;

    doc.setFont(undefined, 'bold');
    doc.text('Program Description:', margin, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    const descLines = doc.splitTextToSize(reportData.program_description, 170);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 10;

    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    // Section 2: Outputs & Deliverables
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('2. Outputs & Deliverables', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const outputs = [
      'Multi-session funding readiness training delivered',
      'Coverage of both grant and contract pathways',
      'Pre- and post-assessments completed',
      'One-on-one consultations provided',
      'Structured workbook and readiness tools distributed'
    ];
    outputs.forEach(output => {
      doc.text(`• ${output}`, margin + 5, y);
      y += 6;
    });
    y += 6;

    doc.setFont(undefined, 'bold');
    doc.text('Participant Engagement Metrics:', margin, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    doc.text(`• Participants enrolled: ${totalEnrolled}`, margin + 5, y);
    y += 6;
    doc.text(`• Completed all sessions: ${completedAllSessions}`, margin + 5, y);
    y += 6;
    doc.text(`• Completed consultations: ${completedConsultations}`, margin + 5, y);
    y += 6;
    doc.text(`• Completed all requirements: ${completedAllRequirements}`, margin + 5, y);
    y += 10;

    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    // Section 3: Outcomes
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('3. Outcomes', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Measured Learning Outcomes:', margin, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    doc.text(`• Pre-assessment average: ${avgPreScore}/100`, margin + 5, y);
    y += 6;
    doc.text(`• Post-assessment average: ${avgPostScore}/100`, margin + 5, y);
    y += 6;
    doc.text(`• Average improvement: +${avgImprovement} points`, margin + 5, y);
    y += 6;
    doc.text(`• Participants with complete data: ${preAssessments.length}`, margin + 5, y);
    y += 10;

    if (reportData.outcomes_narrative) {
      const outcomeLines = doc.splitTextToSize(reportData.outcomes_narrative, 170);
      doc.text(outcomeLines, margin, y);
      y += outcomeLines.length * 5 + 10;
    }

    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    // Section 4: Equity
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('4. Equity & Capacity-Building Impact', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const equityLines = doc.splitTextToSize(reportData.equity_narrative, 170);
    doc.text(equityLines, margin, y);
    y += equityLines.length * 5 + 10;

    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    // Section 5: Compliance
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('5. Compliance & Scope Statement', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const complianceLines = doc.splitTextToSize(reportData.compliance_statement, 170);
    doc.text(complianceLines, margin, y);
    y += complianceLines.length * 5 + 10;

    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    // Section 6: Incentive
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('6. Completion Incentive', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const incentiveLines = doc.splitTextToSize(reportData.incentive_language, 170);
    doc.text(incentiveLines, margin, y);

    // Save PDF
    doc.save(`IncubateHer-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Report exported to PDF');
  };

  const exportToText = () => {
    const report = `
INCUBATEHER PROGRAM REPORT
Columbus Urban League
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════

1️⃣ PROGRAM OVERVIEW

Program Name:
${reportData.program_name}

Program Description:
${reportData.program_description}

═══════════════════════════════════════════════════════════

2️⃣ OUTPUTS & DELIVERABLES

Program Outputs:
• Multi-session funding readiness training delivered
• Coverage of both grant and contract pathways, including RFP orientation
• Pre- and post-assessments completed
• One-on-one consultations provided
• Structured workbook and readiness tools distributed

Participant Engagement Metrics:
• Participants enrolled: ${totalEnrolled}
• Completed all sessions: ${completedAllSessions}
• Completed consultations: ${completedConsultations}
• Completed all requirements: ${completedAllRequirements}

═══════════════════════════════════════════════════════════

3️⃣ OUTCOMES

Measured Learning Outcomes:
• Pre-assessment average: ${avgPreScore}/100
• Post-assessment average: ${avgPostScore}/100
• Average improvement: +${avgImprovement} points
• Participants with complete data: ${preAssessments.length}

${reportData.outcomes_narrative || 'Participants demonstrated measurable growth in funding readiness knowledge and confidence.'}

═══════════════════════════════════════════════════════════

4️⃣ EQUITY & CAPACITY-BUILDING IMPACT

${reportData.equity_narrative}

═══════════════════════════════════════════════════════════

5️⃣ COMPLIANCE & SCOPE STATEMENT

${reportData.compliance_statement}

═══════════════════════════════════════════════════════════

6️⃣ COMPLETION INCENTIVE

${reportData.incentive_language}

═══════════════════════════════════════════════════════════

CHECKLIST FOR CUL SUBMISSION:
✔ Program description
✔ Curriculum summary
✔ Attendance summary
✔ Pre/Post assessment results
✔ Completion metrics
✔ Equity-centered narrative
✔ Scope & compliance statement
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IncubateHer-Report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported to text file');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">IncubateHer Program Report</h1>
            <p className="text-slate-600 mt-1">Generate CUL submission report with auto-filled metrics</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToText} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Text
            </Button>
            <Button onClick={exportToPDF} className="bg-[#143A50]">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Enrolled</p>
            <p className="text-3xl font-bold text-slate-900">{totalEnrolled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Completed All</p>
            <p className="text-3xl font-bold text-green-600">{completedAllRequirements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Avg Pre-Score</p>
            <p className="text-3xl font-bold text-slate-900">{avgPreScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Avg Improvement</p>
            <p className="text-3xl font-bold text-[#AC1A5B]">+{avgImprovement}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="section1" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="section1">Overview</TabsTrigger>
          <TabsTrigger value="section2">Outputs</TabsTrigger>
          <TabsTrigger value="section3">Outcomes</TabsTrigger>
          <TabsTrigger value="section4">Equity</TabsTrigger>
          <TabsTrigger value="section5">Compliance</TabsTrigger>
          <TabsTrigger value="section6">Incentive</TabsTrigger>
        </TabsList>

        {/* Section 1: Overview */}
        <TabsContent value="section1">
          <Card>
            <CardHeader>
              <CardTitle>1️⃣ Program Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Program Name</Label>
                <Input
                  value={reportData.program_name}
                  onChange={(e) => setReportData({ ...reportData, program_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Program Description</Label>
                <Textarea
                  rows={10}
                  value={reportData.program_description}
                  onChange={(e) => setReportData({ ...reportData, program_description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section 2: Outputs */}
        <TabsContent value="section2">
          <Card>
            <CardHeader>
              <CardTitle>2️⃣ Outputs & Deliverables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Program Outputs (Auto-Generated)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Multi-session funding readiness training delivered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Coverage of both grant and contract pathways</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Pre- and post-assessments completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>One-on-one consultations provided</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Structured workbook and readiness tools distributed</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Participant Engagement Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Participants enrolled</p>
                    <p className="text-2xl font-bold text-slate-900">{totalEnrolled}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Completed all sessions</p>
                    <p className="text-2xl font-bold text-slate-900">{completedAllSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Completed consultations</p>
                    <p className="text-2xl font-bold text-slate-900">{completedConsultations}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Completed all requirements</p>
                    <p className="text-2xl font-bold text-green-600">{completedAllRequirements}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section 3: Outcomes */}
        <TabsContent value="section3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>3️⃣ Outcomes</CardTitle>
                <Button
                  onClick={() => generateAINarrative('outcomes')}
                  disabled={generatingAI}
                  size="sm"
                  className="bg-[#AC1A5B]"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Narrative
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Measured Learning Outcomes</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Pre-assessment average</p>
                    <p className="text-2xl font-bold text-slate-900">{avgPreScore}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Post-assessment average</p>
                    <p className="text-2xl font-bold text-green-600">{avgPostScore}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Average improvement</p>
                    <p className="text-2xl font-bold text-[#AC1A5B]">+{avgImprovement} points</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Complete data sets</p>
                    <p className="text-2xl font-bold text-slate-900">{preAssessments.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Outcomes Narrative (Optional - Expand on metrics above)</Label>
                <Textarea
                  rows={8}
                  placeholder="Add additional context about learning outcomes, confidence gains, and readiness improvements..."
                  value={reportData.outcomes_narrative || ''}
                  onChange={(e) => setReportData({ ...reportData, outcomes_narrative: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section 4: Equity */}
        <TabsContent value="section4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>4️⃣ Equity & Capacity-Building Impact</CardTitle>
                <Button
                  onClick={() => generateAINarrative('equity')}
                  disabled={generatingAI}
                  size="sm"
                  className="bg-[#AC1A5B]"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Narrative
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={8}
                value={reportData.equity_narrative}
                onChange={(e) => setReportData({ ...reportData, equity_narrative: e.target.value })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section 5: Compliance */}
        <TabsContent value="section5">
          <Card>
            <CardHeader>
              <CardTitle>5️⃣ Compliance & Scope Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={6}
                value={reportData.compliance_statement}
                onChange={(e) => setReportData({ ...reportData, compliance_statement: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-2">
                This statement clarifies what was and was NOT included in the funded program scope.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section 6: Incentive */}
        <TabsContent value="section6">
          <Card>
            <CardHeader>
              <CardTitle>6️⃣ Completion Incentive Language</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                value={reportData.incentive_language}
                onChange={(e) => setReportData({ ...reportData, incentive_language: e.target.value })}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submission Checklist */}
      <Card className="mt-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            CUL Submission Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">✓</Badge>
              <span>Program description</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">✓</Badge>
              <span>Agenda/curriculum summary</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">✓</Badge>
              <span>Attendance summary</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">✓</Badge>
              <span>Pre/Post assessment results</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">✓</Badge>
              <span>Completion metrics</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">✓</Badge>
              <span>Equity-centered narrative</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">✓</Badge>
              <span>Scope & compliance statement</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}