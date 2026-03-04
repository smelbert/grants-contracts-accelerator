import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, CheckCircle2, Sparkles, Users, Calendar, BookOpen, ClipboardList, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import ParticipantOverviewReport from '@/components/incubateher/ParticipantOverviewReport';
import RegistrationInsightsBrief from '@/components/incubateher/RegistrationInsightsBrief';

export default function IncubateHerReportPage() {
  const [reportData, setReportData] = useState({
    program_name: 'IncubateHer – Funding Readiness: Preparing for Grants & Contracts',
    program_description: `The IncubateHer Funding Readiness workshop series was designed to strengthen participants' capacity to pursue future funding opportunities by improving their understanding of grants and contracts, clarifying readiness requirements, and identifying key operational and documentation gaps. The program emphasized preparation rather than application writing, supporting both nonprofit and for-profit entrepreneurs in making informed, strategic decisions aligned with their business structure, stage of growth, and capacity.

The program was delivered through a short, intensive learning format and included structured group instruction, readiness assessments, and individualized one-on-one consultations. Content was aligned with IncubateHer's Business Operations and Business Organization curriculum areas and tailored to the needs of women entrepreneurs, many of whom are early-stage or growth-phase business owners.`,
    equity_narrative: `The program centered equity by meeting participants where they were, avoiding assumptions about readiness, and reducing harm caused by premature or misaligned funding pursuits. By emphasizing preparation, clarity, and informed decision-making, the program supported sustainable business growth and reduced common barriers faced by women entrepreneurs navigating complex funding systems.`,
    compliance_statement: `This program focused on funding readiness and preparation. It did not include grant searches, application drafting during sessions, or guarantees of funding. Any additional grant-writing support offered outside of the program was not funded through Columbus Urban League grant resources.`,
    incentive_language: `As an engagement incentive, participants who completed all program requirements were eligible for a randomized drawing for a complimentary grant-writing session for one non-federal grant. This incentive was not tied to program outcomes and did not guarantee funding.`,
    outcomes_narrative: ''
  });

  const [generatingAI, setGeneratingAI] = useState(false);

  // ─── Data fetching ───────────────────────────────────────────────
  const { data: cohorts } = useQuery({
    queryKey: ['incubateher-cohorts'],
    queryFn: async () => {
      const all = await base44.entities.ProgramCohort.list();
      return all.filter(c => c.program_code?.includes('incubateher'));
    }
  });
  const activeCohort = cohorts?.[0];

  const { data: enrollments = [] } = useQuery({
    queryKey: ['incubateher-enrollments', activeCohort?.id],
    queryFn: () => base44.entities.ProgramEnrollment.filter({ cohort_id: activeCohort.id }),
    enabled: !!activeCohort?.id
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['program-sessions-report'],
    queryFn: () => base44.entities.ProgramSession.list('session_order')
  });

  const { data: allAttendance = [] } = useQuery({
    queryKey: ['session-attendance-report'],
    queryFn: () => base44.entities.SessionAttendance.list()
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['incubateher-assessments'],
    queryFn: () => base44.entities.ProgramAssessment.list()
  });

  const { data: workbookResponses = [] } = useQuery({
    queryKey: ['workbook-responses-report'],
    queryFn: () => base44.entities.WorkbookResponse.list()
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations-report'],
    queryFn: () => base44.entities.ConsultationBooking.list()
  });

  const { data: docSubmissions = [] } = useQuery({
    queryKey: ['doc-submissions-report'],
    queryFn: () => base44.entities.DocumentSubmission.list()
  });

  // ─── Computed metrics ─────────────────────────────────────────────
  const participants = enrollments.filter(e => e.role === 'participant');
  const totalEnrolled = participants.length;

  // Attendance
  const getAttendanceRate = (enrollmentId) => {
    if (!sessions.length) return 0;
    const attended = allAttendance.filter(a => a.enrollment_id === enrollmentId && (a.attended || a.watched_recording)).length;
    return Math.round((attended / sessions.length) * 100);
  };

  const attended80Plus = participants.filter(e => getAttendanceRate(e.id) >= 80).length;
  const attended60Plus = participants.filter(e => getAttendanceRate(e.id) >= 60).length;
  const attendedAtLeastOne = participants.filter(e =>
    allAttendance.some(a => a.enrollment_id === e.id && (a.attended || a.watched_recording))
  ).length;

  // Per-session attendance
  const sessionStats = sessions.map(s => ({
    ...s,
    liveCount: allAttendance.filter(a => a.session_id === s.id && a.attended).length,
    recordingCount: allAttendance.filter(a => a.session_id === s.id && a.watched_recording && !a.attended).length,
  }));

  // Assessments
  const preAssessments = assessments.filter(a => a.assessment_type === 'pre');
  const postAssessments = assessments.filter(a => a.assessment_type === 'post');
  const avgPreScore = preAssessments.length > 0
    ? (preAssessments.reduce((s, a) => s + (a.total_score || 0), 0) / preAssessments.length).toFixed(1) : 0;
  const avgPostScore = postAssessments.length > 0
    ? (postAssessments.reduce((s, a) => s + (a.total_score || 0), 0) / postAssessments.length).toFixed(1) : 0;
  const avgImprovement = (parseFloat(avgPostScore) - parseFloat(avgPreScore)).toFixed(1);

  // Completions
  const completedPre = participants.filter(e => e.pre_assessment_completed).length;
  const completedPost = participants.filter(e => e.post_assessment_completed).length;
  const completedConsultation = participants.filter(e => e.consultation_completed).length;
  const completedDocs = participants.filter(e => e.documents_uploaded).length;
  const completedAll = participants.filter(e =>
    e.pre_assessment_completed && e.attendance_complete && e.consultation_completed && e.post_assessment_completed
  ).length;

  // Workbook
  const uniqueWorkbookParticipants = new Set(workbookResponses.map(w => w.participant_email)).size;

  // Org types from jotform data
  const orgTypeCounts = {};
  participants.forEach(e => {
    const type = e.jotform_data?.org_type;
    if (type) orgTypeCounts[type] = (orgTypeCounts[type] || 0) + 1;
  });

  // Individual participant rows for detailed table
  const participantRows = participants.map(e => {
    const rate = getAttendanceRate(e.id);
    const preA = preAssessments.find(a => a.participant_email === e.participant_email || a.created_by === e.participant_email);
    const postA = postAssessments.find(a => a.participant_email === e.participant_email || a.created_by === e.participant_email);
    const hasWorkbook = workbookResponses.some(w => w.participant_email === e.participant_email);
    return {
      name: e.participant_name,
      email: e.participant_email,
      org: e.organization_name || e.jotform_data?.org_type || '—',
      attendanceRate: rate,
      pre: preA?.total_score ?? '—',
      post: postA?.total_score ?? '—',
      gain: preA?.total_score != null && postA?.total_score != null ? postA.total_score - preA.total_score : '—',
      preComplete: e.pre_assessment_completed,
      postComplete: e.post_assessment_completed,
      consultation: e.consultation_completed,
      docs: e.documents_uploaded,
      workbook: hasWorkbook,
      allComplete: e.program_completed,
    };
  });

  // ─── AI Narrative ──────────────────────────────────────────────────
  const generateAINarrative = async (section) => {
    setGeneratingAI(true);
    try {
      let prompt = '';
      if (section === 'outcomes') {
        prompt = `Write a professional outcomes narrative for a funding readiness program (IncubateHer) with these results:
- ${totalEnrolled} participants enrolled
- ${attendedAtLeastOne} attended at least one session
- ${attended80Plus} participants had ≥80% attendance rate
- ${completedPre} completed pre-assessment (avg score: ${avgPreScore}/100)
- ${completedPost} completed post-assessment (avg score: ${avgPostScore}/100)
- Average score improvement: +${avgImprovement} points
- ${completedConsultation} completed one-on-one consultations
- ${completedDocs} uploaded required documents
- ${uniqueWorkbookParticipants} engaged with the digital workbook
- ${completedAll} completed all requirements

Write 3 paragraphs covering: (1) participation & engagement, (2) learning gains & assessment results, (3) practical readiness outcomes. Professional tone for a funder report.`;
      } else if (section === 'equity') {
        prompt = `Write a compelling equity and capacity-building impact statement for a program serving women entrepreneurs through Columbus Urban League's IncubateHer initiative. Emphasize how the program met participants where they were, reduced barriers to funding access, centered women of color and early-stage entrepreneurs, and supported sustainable growth without shaming financial or operational gaps. Write 2 paragraphs.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      if (section === 'outcomes') setReportData(prev => ({ ...prev, outcomes_narrative: response }));
      else if (section === 'equity') setReportData(prev => ({ ...prev, equity_narrative: response }));
      toast.success('AI narrative generated');
    } catch {
      toast.error('Failed to generate narrative');
    } finally {
      setGeneratingAI(false);
    }
  };

  // ─── PDF Export ────────────────────────────────────────────────────
  const exportToPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    const addPage = () => { doc.addPage(); y = margin; };
    const checkPage = (needed = 20) => { if (y + needed > 275) addPage(); };
    const addText = (text, size = 11, bold = false, color = [0,0,0]) => {
      doc.setFontSize(size);
      doc.setFont(undefined, bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, 170);
      checkPage(lines.length * (size * 0.4 + 1));
      doc.text(lines, margin, y);
      y += lines.length * (size * 0.4 + 1) + 2;
    };
    const addSection = (title) => {
      checkPage(14);
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(20, 58, 80);
      doc.text(title, margin, y);
      y += 8;
      doc.setDrawColor(20, 58, 80);
      doc.line(margin, y - 2, 190, y - 2);
      y += 4;
    };

    // Cover
    doc.setFillColor(20, 58, 80);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('IncubateHer Program Report', margin, 20);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Columbus Urban League | Elbert Innovative Solutions', margin, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 38);
    y = 55;

    // 1. Program Overview
    addSection('1. Program Overview');
    addText('Program Name', 11, true);
    addText(reportData.program_name);
    y += 3;
    addText('Program Description', 11, true);
    addText(reportData.program_description);

    // 2. Participant Metrics
    addSection('2. Participant Engagement Metrics');
    const metrics = [
      ['Total Participants Enrolled', totalEnrolled],
      ['Attended At Least One Session', attendedAtLeastOne],
      ['≥80% Session Attendance Rate', attended80Plus],
      ['Completed Pre-Assessment', completedPre],
      ['Completed Post-Assessment', completedPost],
      ['Completed 1-on-1 Consultation', completedConsultation],
      ['Uploaded Required Documents', completedDocs],
      ['Engaged with Digital Workbook', uniqueWorkbookParticipants],
      ['Completed ALL Requirements', completedAll],
    ];
    metrics.forEach(([label, val]) => {
      checkPage(7);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`• ${label}: ${val}`, margin + 4, y);
      y += 6;
    });

    // 3. Session Attendance
    addSection('3. Session-by-Session Attendance');
    sessionStats.forEach((s, i) => {
      checkPage(8);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Day ${i + 1}: ${s.session_title}`, margin + 4, y);
      y += 5;
      doc.setFont(undefined, 'normal');
      doc.text(`   Date: ${new Date(s.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`, margin + 4, y);
      y += 5;
      doc.text(`   Live Attendance: ${s.liveCount}  |  Watched Recording: ${s.recordingCount}  |  Total: ${s.liveCount + s.recordingCount} of ${totalEnrolled}`, margin + 4, y);
      y += 7;
    });

    // 4. Assessment Results
    addSection('4. Assessment Results');
    const aMetrics = [
      [`Pre-Assessment Average (n=${preAssessments.length})`, `${avgPreScore}/100`],
      [`Post-Assessment Average (n=${postAssessments.length})`, `${avgPostScore}/100`],
      ['Average Score Improvement', `+${avgImprovement} points`],
    ];
    aMetrics.forEach(([label, val]) => {
      checkPage(7);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`• ${label}: ${val}`, margin + 4, y);
      y += 6;
    });
    if (reportData.outcomes_narrative) {
      y += 4;
      addText('Outcomes Narrative', 11, true);
      addText(reportData.outcomes_narrative);
    }

    // 5. Equity
    addSection('5. Equity & Capacity-Building Impact');
    addText(reportData.equity_narrative);

    // 6. Compliance
    addSection('6. Compliance & Scope Statement');
    addText(reportData.compliance_statement);

    // 7. Incentive
    addSection('7. Completion Incentive');
    addText(reportData.incentive_language);

    // 8. Individual Participant Detail
    addSection('8. Individual Participant Summary');
    participantRows.forEach((p, i) => {
      checkPage(18);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${i + 1}. ${p.name} — ${p.org}`, margin + 2, y);
      y += 5;
      doc.setFont(undefined, 'normal');
      const detail = `   Attendance: ${p.attendanceRate}%  |  Pre: ${p.pre}  Post: ${p.post}  Gain: ${typeof p.gain === 'number' ? '+' + p.gain : p.gain}  |  Consultation: ${p.consultation ? 'Yes' : 'No'}  |  Docs: ${p.docs ? 'Yes' : 'No'}  |  Workbook: ${p.workbook ? 'Yes' : 'No'}`;
      doc.text(detail, margin + 2, y);
      y += 7;
    });

    doc.save(`IncubateHer-CUL-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Comprehensive report exported to PDF');
  };

  const isLoading = !enrollments.length && !sessions.length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">IncubateHer Program Report</h1>
          <p className="text-slate-600 mt-1">Comprehensive CUL submission report — all data pulled live</p>
        </div>
        <Button onClick={exportToPDF} className="bg-[#143A50]">
          <Download className="w-4 h-4 mr-2" />
          Export Full PDF Report
        </Button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Enrolled', value: totalEnrolled, icon: Users, color: 'text-[#143A50]' },
          { label: 'Completed All Req.', value: completedAll, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Pre→Post Gain', value: `+${avgImprovement}`, icon: TrendingUp, color: 'text-[#AC1A5B]' },
          { label: '≥80% Attendance', value: attended80Plus, icon: Calendar, color: 'text-blue-600' },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-5 flex items-center gap-3">
              <m.icon className={`w-8 h-8 ${m.color}`} />
              <div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-slate-500">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto h-auto flex-wrap gap-1 justify-start bg-muted p-1">
          <TabsTrigger value="summary">📊 Data Summary</TabsTrigger>
          <TabsTrigger value="attendance">📅 Attendance</TabsTrigger>
          <TabsTrigger value="participants">👥 Participants</TabsTrigger>
          <TabsTrigger value="assessments">📋 Assessments</TabsTrigger>
          <TabsTrigger value="participant_overview">🔍 Reg. Insights</TabsTrigger>
          <TabsTrigger value="registration_insights">📌 Brief</TabsTrigger>
          <TabsTrigger value="narrative">✍️ Narratives</TabsTrigger>
        </TabsList>

        {/* DATA SUMMARY */}
        <TabsContent value="summary">
          <div className="space-y-6">
            {/* Completion Funnel */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#143A50]" /> Program Completion Funnel</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Enrolled', count: totalEnrolled, color: 'bg-slate-600' },
                  { label: 'Attended ≥1 Session', count: attendedAtLeastOne, color: 'bg-blue-500' },
                  { label: 'Completed Pre-Assessment', count: completedPre, color: 'bg-amber-500' },
                  { label: 'Completed Consultation', count: completedConsultation, color: 'bg-[#1E4F58]' },
                  { label: 'Uploaded Documents', count: completedDocs, color: 'bg-purple-500' },
                  { label: 'Completed Post-Assessment', count: completedPost, color: 'bg-green-500' },
                  { label: 'Completed ALL Requirements', count: completedAll, color: 'bg-[#AC1A5B]' },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-semibold">{item.count} / {totalEnrolled} ({totalEnrolled > 0 ? Math.round(item.count / totalEnrolled * 100) : 0}%)</span>
                    </div>
                    <Progress value={totalEnrolled > 0 ? (item.count / totalEnrolled) * 100 : 0} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Org Types */}
            {Object.keys(orgTypeCounts).length > 0 && (
              <Card>
                <CardHeader><CardTitle>Organization Types</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {Object.entries(orgTypeCounts).map(([type, count]) => (
                    <Badge key={type} className="bg-[#143A50] text-white text-sm px-3 py-1">{type}: {count}</Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Assessment Summary */}
            <Card>
              <CardHeader><CardTitle>Assessment Results Summary</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Pre-Assessment Avg', value: `${avgPreScore}/100`, sub: `n=${preAssessments.length}` },
                  { label: 'Post-Assessment Avg', value: `${avgPostScore}/100`, sub: `n=${postAssessments.length}` },
                  { label: 'Avg Score Gain', value: `+${avgImprovement} pts`, sub: 'pre→post' },
                  { label: 'Workbook Engaged', value: uniqueWorkbookParticipants, sub: 'participants' },
                ].map(m => (
                  <div key={m.label} className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#143A50]">{m.value}</p>
                    <p className="text-sm text-slate-600">{m.label}</p>
                    <p className="text-xs text-slate-400">{m.sub}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ATTENDANCE TAB */}
        <TabsContent value="attendance">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-[#143A50]" /> Session Attendance Breakdown</CardTitle></CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No sessions found.</p>
                ) : (
                  <div className="space-y-4">
                    {sessionStats.map((s, i) => {
                      const total = s.liveCount + s.recordingCount;
                      const pct = totalEnrolled > 0 ? Math.round(total / totalEnrolled * 100) : 0;
                      return (
                        <div key={s.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">Day {i + 1}: {s.session_title}</p>
                              <p className="text-sm text-slate-500">
                                {new Date(s.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                            <Badge className={pct >= 70 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                              {pct}% total
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm mt-3">
                            <div className="text-center p-2 bg-green-50 rounded">
                              <p className="text-xl font-bold text-green-700">{s.liveCount}</p>
                              <p className="text-xs text-slate-600">Attended Live</p>
                            </div>
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <p className="text-xl font-bold text-blue-700">{s.recordingCount}</p>
                              <p className="text-xs text-slate-600">Watched Recording</p>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded">
                              <p className="text-xl font-bold text-slate-500">{totalEnrolled - total}</p>
                              <p className="text-xs text-slate-600">Absent</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance Distribution */}
            <Card>
              <CardHeader><CardTitle>Attendance Rate Distribution</CardTitle></CardHeader>
              <CardContent>
                {[
                  { label: '100% (All sessions)', count: participants.filter(e => getAttendanceRate(e.id) === 100).length, color: 'bg-green-600' },
                  { label: '80–99%', count: participants.filter(e => { const r = getAttendanceRate(e.id); return r >= 80 && r < 100; }).length, color: 'bg-green-400' },
                  { label: '60–79%', count: participants.filter(e => { const r = getAttendanceRate(e.id); return r >= 60 && r < 80; }).length, color: 'bg-amber-400' },
                  { label: '1–59%', count: participants.filter(e => { const r = getAttendanceRate(e.id); return r > 0 && r < 60; }).length, color: 'bg-orange-400' },
                  { label: '0% (No attendance)', count: participants.filter(e => getAttendanceRate(e.id) === 0).length, color: 'bg-red-400' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3 mb-2 text-sm">
                    <div className="w-36 shrink-0 text-slate-700">{row.label}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div className={`${row.color} h-5 rounded-full transition-all`} style={{ width: totalEnrolled > 0 ? `${(row.count / totalEnrolled) * 100}%` : '0%' }} />
                    </div>
                    <div className="w-8 text-right font-semibold">{row.count}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PARTICIPANTS TABLE */}
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#143A50]" />
                Individual Participant Data ({participantRows.length})
              </CardTitle>
              <p className="text-sm text-slate-500">All completion data pulled live from the database</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2 font-semibold">Name / Org</th>
                    <th className="text-center p-2 font-semibold text-xs">Attend %</th>
                    <th className="text-center p-2 font-semibold text-xs">Pre</th>
                    <th className="text-center p-2 font-semibold text-xs">Post</th>
                    <th className="text-center p-2 font-semibold text-xs">Gain</th>
                    <th className="text-center p-2 font-semibold text-xs">Consult</th>
                    <th className="text-center p-2 font-semibold text-xs">Docs</th>
                    <th className="text-center p-2 font-semibold text-xs">Workbook</th>
                    <th className="text-center p-2 font-semibold text-xs">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {participantRows.map((p, i) => (
                    <tr key={i} className={`border-b hover:bg-slate-50 ${p.allComplete ? 'bg-green-50' : ''}`}>
                      <td className="p-2">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.org}</p>
                      </td>
                      <td className="text-center p-2">
                        <Badge className={p.attendanceRate >= 80 ? 'bg-green-100 text-green-800' : p.attendanceRate >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}>
                          {p.attendanceRate}%
                        </Badge>
                      </td>
                      <td className="text-center p-2 font-mono">{p.pre}</td>
                      <td className="text-center p-2 font-mono">{p.post}</td>
                      <td className="text-center p-2 font-mono font-bold text-green-700">
                        {typeof p.gain === 'number' ? `+${p.gain}` : '—'}
                      </td>
                      <td className="text-center p-2">{p.consultation ? '✅' : '⬜'}</td>
                      <td className="text-center p-2">{p.docs ? '✅' : '⬜'}</td>
                      <td className="text-center p-2">{p.workbook ? '✅' : '⬜'}</td>
                      <td className="text-center p-2">{p.allComplete ? '🏆' : '⬜'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {participantRows.length === 0 && (
                <p className="text-center py-8 text-slate-500">No participant data available yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSESSMENTS */}
        <TabsContent value="assessments">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Pre vs. Post Assessment Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 text-center mb-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-3xl font-bold text-slate-700">{avgPreScore}</p>
                    <p className="text-sm text-slate-500">Avg Pre-Score</p>
                    <p className="text-xs text-slate-400">n={preAssessments.length}</p>
                  </div>
                  <div className="p-4 bg-[#AC1A5B]/10 rounded-lg">
                    <p className="text-3xl font-bold text-[#AC1A5B]">+{avgImprovement}</p>
                    <p className="text-sm text-slate-500">Avg Gain</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-700">{avgPostScore}</p>
                    <p className="text-sm text-slate-500">Avg Post-Score</p>
                    <p className="text-xs text-slate-400">n={postAssessments.length}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {participantRows.filter(p => p.pre !== '—' || p.post !== '—').map((p, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm p-2 border rounded">
                      <div className="w-40 shrink-0">
                        <p className="font-medium truncate">{p.name}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">Pre: {p.pre}</Badge>
                        {p.post !== '—' && <Badge className="bg-green-100 text-green-800">Post: {p.post}</Badge>}
                        {typeof p.gain === 'number' && (
                          <Badge className={p.gain >= 0 ? 'bg-[#AC1A5B] text-white' : 'bg-red-100 text-red-800'}>
                            {p.gain >= 0 ? '+' : ''}{p.gain}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Participant Overview (AI Synthesis) */}
        <TabsContent value="participant_overview">
          <ParticipantOverviewReport enrollments={participants} />
        </TabsContent>

        {/* Registration Insights Brief */}
        <TabsContent value="registration_insights">
          <RegistrationInsightsBrief />
        </TabsContent>

        {/* NARRATIVES */}
        <TabsContent value="narrative">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Program Overview Text</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Program Name</Label>
                  <Input value={reportData.program_name} onChange={e => setReportData(p => ({ ...p, program_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Program Description</Label>
                  <Textarea rows={8} value={reportData.program_description} onChange={e => setReportData(p => ({ ...p, program_description: e.target.value }))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Outcomes Narrative</CardTitle>
                  <Button size="sm" className="bg-[#AC1A5B]" onClick={() => generateAINarrative('outcomes')} disabled={generatingAI}>
                    {generatingAI ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> AI Generate</>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea rows={8} placeholder="Describe learning outcomes, assessment gains, and participant growth..." value={reportData.outcomes_narrative} onChange={e => setReportData(p => ({ ...p, outcomes_narrative: e.target.value }))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Equity & Capacity-Building Impact</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => generateAINarrative('equity')} disabled={generatingAI}>
                    <Sparkles className="w-4 h-4 mr-2" /> AI Generate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea rows={6} value={reportData.equity_narrative} onChange={e => setReportData(p => ({ ...p, equity_narrative: e.target.value }))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Compliance & Scope Statement</CardTitle></CardHeader>
              <CardContent>
                <Textarea rows={5} value={reportData.compliance_statement} onChange={e => setReportData(p => ({ ...p, compliance_statement: e.target.value }))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Completion Incentive Language</CardTitle></CardHeader>
              <CardContent>
                <Textarea rows={4} value={reportData.incentive_language} onChange={e => setReportData(p => ({ ...p, incentive_language: e.target.value }))} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* CUL Submission Checklist */}
      <Card className="mt-6 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            CUL Submission Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              'Program description & overview',
              'Agenda/curriculum summary',
              'Session-by-session attendance',
              'Attendance rate distribution',
              'Pre/Post assessment results',
              'Individual participant data',
              'Completion metrics funnel',
              'Outcomes narrative',
              'Equity-centered narrative',
              'Scope & compliance statement',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <Badge className="bg-green-600">✓</Badge>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}