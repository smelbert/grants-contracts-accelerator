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
import {
  FileText, Download, CheckCircle2, Sparkles, Users, Calendar, BookOpen,
  TrendingUp, BarChart3, Loader2, MessageSquare, Award, Target, Brain,
  Building2, Clock, Star
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import ParticipantOverviewReport from '@/components/incubateher/ParticipantOverviewReport';
import RegistrationInsightsBrief from '@/components/incubateher/RegistrationInsightsBrief';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const avg = (arr, key) => {
  const vals = arr.map(x => x[key]).filter(v => v != null && !isNaN(v));
  return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : '—';
};

const countBy = (arr, fn) => {
  const counts = {};
  arr.forEach(item => {
    const key = fn(item) || 'Not Specified';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
};

const pct = (n, total) => total > 0 ? Math.round((n / total) * 100) : 0;

// ─── Sub-components ───────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color = 'text-[#143A50]', icon: Icon }) {
  return (
    <Card>
      <CardContent className="pt-5 flex items-center gap-3">
        {Icon && <Icon className={`w-8 h-8 ${color} opacity-80 shrink-0`} />}
        <div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs font-medium text-slate-700">{label}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelRow({ label, count, total, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-semibold">{count} / {total} ({pct(count, total)}%)</span>
      </div>
      <Progress value={pct(count, total)} className="h-2" style={{ '--progress-fill': color }} />
    </div>
  );
}

function DemoTable({ title, data }) {
  if (!data.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1">
        {data.map(([label, count]) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full bg-[#143A50]"
                style={{ width: `${pct(count, data.reduce((s, [, c]) => s + c, 0))}%` }}
              />
            </div>
            <span className="w-32 text-slate-600 truncate text-xs">{label}</span>
            <span className="w-8 text-right font-bold text-xs">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IncubateHerReportPage() {
  const [narratives, setNarratives] = useState({
    program_name: 'IncubateHer – Funding Readiness: Preparing for Grants & Contracts',
    program_description: `The IncubateHer Funding Readiness workshop series was designed to strengthen participants' capacity to pursue future funding opportunities by improving their understanding of grants and contracts, clarifying readiness requirements, and identifying key operational and documentation gaps. The program emphasized preparation rather than application writing, supporting both nonprofit and for-profit entrepreneurs in making informed, strategic decisions aligned with their business structure, stage of growth, and capacity.\n\nThe program was delivered through a short, intensive learning format and included structured group instruction, readiness assessments, and individualized one-on-one consultations. Content was aligned with IncubateHer's Business Operations and Business Organization curriculum areas and tailored to the needs of women entrepreneurs, many of whom are early-stage or growth-phase business owners.`,
    equity_narrative: `The program centered equity by meeting participants where they were, avoiding assumptions about readiness, and reducing harm caused by premature or misaligned funding pursuits. By emphasizing preparation, clarity, and informed decision-making, the program supported sustainable business growth and reduced common barriers faced by women entrepreneurs navigating complex funding systems.`,
    compliance_statement: `This program focused on funding readiness and preparation. It did not include grant searches, application drafting during sessions, or guarantees of funding. Any additional grant-writing support offered outside of the program was not funded through Columbus Urban League grant resources.`,
    incentive_language: `As an engagement incentive, participants who completed all program requirements were eligible for a randomized drawing for a complimentary grant-writing session for one non-federal grant. This incentive was not tied to program outcomes and did not guarantee funding.`,
    outcomes_narrative: ''
  });
  const [generatingAI, setGeneratingAI] = useState(false);

  // ─── Data ─────────────────────────────────────────────────────────────────
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
    queryFn: () => base44.entities.ProgramEnrollment.filter({ cohort_id: activeCohort.id, role: 'participant' }),
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

  const { data: evaluations = [] } = useQuery({
    queryKey: ['incubateher-evaluations'],
    queryFn: () => base44.entities.ProgramAssessment.filter({ assessment_type: 'evaluation' })
  });

  // ─── Core metrics ─────────────────────────────────────────────────────────
  const totalEnrolled = enrollments.length;
  const participantEmails = new Set(enrollments.map(e => e.participant_email));

  // Attendance
  const getAttendanceRate = (enrollmentId) => {
    if (!sessions.length) return 0;
    const attended = allAttendance.filter(a => a.enrollment_id === enrollmentId && (a.attended || a.watched_recording)).length;
    return Math.round((attended / sessions.length) * 100);
  };
  const attended100 = enrollments.filter(e => getAttendanceRate(e.id) === 100).length;
  const attended80Plus = enrollments.filter(e => getAttendanceRate(e.id) >= 80).length;
  const attended60Plus = enrollments.filter(e => getAttendanceRate(e.id) >= 60).length;
  const attendedAtLeastOne = enrollments.filter(e =>
    allAttendance.some(a => a.enrollment_id === e.id && (a.attended || a.watched_recording))
  ).length;

  const sessionStats = sessions.map(s => ({
    ...s,
    liveCount: allAttendance.filter(a => a.session_id === s.id && a.attended).length,
    recordingCount: allAttendance.filter(a => a.session_id === s.id && a.watched_recording && !a.attended).length,
  }));

  // Assessments (non-draft, scoped to enrolled participants)
  const preAssessments = assessments.filter(a => a.assessment_type === 'pre' && !a.is_draft && participantEmails.has(a.participant_email));
  const postAssessments = assessments.filter(a => a.assessment_type === 'post' && !a.is_draft && participantEmails.has(a.participant_email));
  const avgPreScore = avg(preAssessments, 'total_score');
  const avgPostScore = avg(postAssessments, 'total_score');
  const avgImprovement = (avgPreScore !== '—' && avgPostScore !== '—')
    ? (parseFloat(avgPostScore) - parseFloat(avgPreScore)).toFixed(1) : '—';

  // Subscores
  const avgPreGrants = avg(preAssessments, 'grants_vs_contracts_score');
  const avgPostGrants = avg(postAssessments, 'grants_vs_contracts_score');
  const avgPreLegal = avg(preAssessments, 'legal_readiness_score');
  const avgPostLegal = avg(postAssessments, 'legal_readiness_score');
  const avgPreFinancial = avg(preAssessments, 'financial_readiness_score');
  const avgPostFinancial = avg(postAssessments, 'financial_readiness_score');
  const avgPreConfidence = avg(preAssessments, 'confidence_score');
  const avgPostConfidence = avg(postAssessments, 'confidence_score');

  // Completion flags
  const completedPre = enrollments.filter(e => e.pre_assessment_completed).length;
  const completedPost = enrollments.filter(e => e.post_assessment_completed).length;
  const completedConsultation = enrollments.filter(e => e.consultation_completed).length;
  const completedDocs = enrollments.filter(e => e.documents_uploaded).length;
  const completedAll = enrollments.filter(e =>
    e.pre_assessment_completed && e.attendance_complete && e.consultation_completed && e.post_assessment_completed
  ).length;

  // Consultations
  const completedConsultationBookings = consultations.filter(c => c.status === 'completed' && participantEmails.has(c.participant_email));
  const onlineConsults = completedConsultationBookings.filter(c => c.meeting_preference === 'online').length;
  const inPersonConsults = completedConsultationBookings.filter(c => c.meeting_preference === 'in-person').length;
  const avg45 = completedConsultationBookings.filter(c => c.meeting_duration === 45).length;
  const avg60 = completedConsultationBookings.filter(c => c.meeting_duration === 60).length;

  // Workbook
  const uniqueWorkbookParticipants = new Set(workbookResponses.filter(w => participantEmails.has(w.participant_email)).map(w => w.participant_email)).size;
  const workbookBySection = countBy(workbookResponses.filter(w => participantEmails.has(w.participant_email)), w => w.section_title || w.section);

  // Document submissions
  const submittedDocEmails = new Set(docSubmissions.filter(d => participantEmails.has(d.participant_email)).map(d => d.participant_email));
  const docSubCount = submittedDocEmails.size;
  const docStatusBreakdown = countBy(docSubmissions.filter(d => participantEmails.has(d.participant_email)), d => d.submission_status);

  // Evaluations
  const evalResponses = evaluations.filter(e => participantEmails.has(e.participant_email));
  const nextStepsList = postAssessments.map(a => a.next_steps).filter(Boolean);

  // Evaluation aggregates — overall_rating stored as string "1"–"10"
  const evalAvgOverall = evalResponses.length > 0
    ? (evalResponses.reduce((s, e) => s + (parseInt(e.responses?.overall_rating) || 0), 0) / evalResponses.length).toFixed(1)
    : '—';

  // would_recommend is categorical; map to numeric for a composite score
  const recommendMap = { definitely: 10, probably: 7, maybe: 5, no: 2 };
  const evalAvgRecommend = evalResponses.length > 0
    ? (evalResponses.reduce((s, e) => s + (recommendMap[e.responses?.would_recommend] ?? 0), 0) / evalResponses.length).toFixed(1)
    : '—';

  const recommendDist = Object.entries(
    evalResponses.reduce((acc, e) => {
      const val = e.responses?.would_recommend || 'no_response';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  // Attendance consistency — per-session presence
  const consistentAttendees = enrollments.filter(e => {
    const attendedSessions = sessions.filter(s =>
      allAttendance.some(a => a.enrollment_id === e.id && a.session_id === s.id && (a.attended || a.watched_recording))
    ).length;
    return attendedSessions === sessions.length && sessions.length > 0;
  }).length;

  const attendedExactly = (n) => enrollments.filter(e => {
    const count = sessions.filter(s =>
      allAttendance.some(a => a.enrollment_id === e.id && a.session_id === s.id && (a.attended || a.watched_recording))
    ).length;
    return count === n;
  }).length;

  // Demographics from jotform_data
  const orgTypes = countBy(enrollments, e => e.jotform_data?.org_type);
  const yearsInBusiness = countBy(enrollments, e => e.jotform_data?.years_in_business);
  const grantExp = countBy(enrollments, e => e.jotform_data?.grant_experience);
  const fundingBarriers = countBy(enrollments, e => e.jotform_data?.funding_barrier);
  const goals = countBy(enrollments, e => e.jotform_data?.goals);
  const participationPlans = countBy(enrollments, e => e.jotform_data?.participation_plan);
  const howHeard = countBy(enrollments, e => e.jotform_data?.how_heard);
  const interestedInConsultation = countBy(enrollments, e => e.jotform_data?.interested_in_consultation);

  // Per-participant rows
  const participantRows = enrollments.map(e => {
    const rate = getAttendanceRate(e.id);
    const preA = preAssessments.find(a => a.participant_email === e.participant_email);
    const postA = postAssessments.find(a => a.participant_email === e.participant_email);
    const hasWorkbook = workbookResponses.some(w => w.participant_email === e.participant_email);
    const hasConsult = completedConsultationBookings.some(c => c.participant_email === e.participant_email);
    const hasDocs = docSubmissions.some(d => d.participant_email === e.participant_email);
    return {
      name: e.participant_name,
      email: e.participant_email,
      org: e.organization_name || e.jotform_data?.org_type || '—',
      orgType: e.jotform_data?.org_type || '—',
      grantExp: e.jotform_data?.grant_experience || '—',
      attendanceRate: rate,
      pre: preA?.total_score ?? '—',
      post: postA?.total_score ?? '—',
      gain: preA?.total_score != null && postA?.total_score != null ? postA.total_score - preA.total_score : '—',
      preConfidence: preA?.confidence_score ?? '—',
      postConfidence: postA?.confidence_score ?? '—',
      consultation: e.consultation_completed || hasConsult,
      docs: e.documents_uploaded || hasDocs,
      workbook: hasWorkbook,
      allComplete: e.program_completed,
      giveaway: e.giveaway_eligible,
      nextSteps: postA?.next_steps || '',
    };
  });

  // ─── AI Narrative ──────────────────────────────────────────────────────────
  const generateAINarrative = async (section) => {
    setGeneratingAI(true);
    try {
      let prompt = '';
      if (section === 'outcomes') {
        prompt = `Write a professional outcomes narrative for a funding readiness program (IncubateHer) with these results:
- ${totalEnrolled} participants enrolled
- ${attendedAtLeastOne} attended at least one session; ${attended80Plus} had ≥80% attendance
- ${completedPre} completed pre-assessment (avg score: ${avgPreScore}/100)
- ${completedPost} completed post-assessment (avg score: ${avgPostScore}/100)
- Average score improvement: +${avgImprovement} points
- Subscore gains: Grants/Contracts ${avgPreGrants}→${avgPostGrants}, Legal ${avgPreLegal}→${avgPostLegal}, Financial ${avgPreFinancial}→${avgPostFinancial}
- Average confidence score: ${avgPreConfidence}→${avgPostConfidence} (scale 1-10)
- ${completedConsultation} completed one-on-one consultations
- ${completedDocs} uploaded required documents; ${uniqueWorkbookParticipants} engaged with digital workbook
- ${completedAll} completed all requirements
Write 3 paragraphs: (1) participation & engagement, (2) learning gains & assessment results, (3) practical readiness outcomes. Professional tone for a funder report.`;
      } else if (section === 'equity') {
        prompt = `Write a compelling equity and capacity-building impact statement for a program serving women entrepreneurs through Columbus Urban League's IncubateHer initiative. Emphasize how the program met participants where they were, reduced barriers to funding access, centered women of color and early-stage entrepreneurs, and supported sustainable growth. 2 paragraphs.`;
      }
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setNarratives(prev => ({ ...prev, [section === 'outcomes' ? 'outcomes_narrative' : 'equity_narrative']: response }));
      toast.success('AI narrative generated');
    } catch {
      toast.error('Failed to generate narrative');
    } finally {
      setGeneratingAI(false);
    }
  };

  // ─── PDF Export ────────────────────────────────────────────────────────────
  const exportToPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    const addPage = () => { doc.addPage(); y = margin; };
    const checkPage = (needed = 20) => { if (y + needed > 275) addPage(); };
    const addText = (text, size = 11, bold = false, color = [0, 0, 0]) => {
      if (!text) return;
      doc.setFontSize(size);
      doc.setFont(undefined, bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text), 170);
      checkPage(lines.length * (size * 0.4 + 1));
      doc.text(lines, margin, y);
      y += lines.length * (size * 0.4 + 1) + 2;
    };
    const addSection = (title) => {
      checkPage(16);
      y += 4;
      doc.setFillColor(20, 58, 80);
      doc.rect(margin - 2, y - 6, 174, 10, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin, y);
      y += 8;
    };
    const addSubSection = (title) => {
      checkPage(12);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(172, 26, 91);
      doc.text(title, margin, y);
      y += 7;
    };
    const addBullet = (label, val) => {
      checkPage(7);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`• ${label}: ${val}`, margin + 4, y);
      y += 6;
    };

    // ── Cover ──
    doc.setFillColor(20, 58, 80);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('IncubateHer Program Report', margin, 22);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Columbus Urban League | Elbert Innovative Solutions', margin, 33);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 42);
    y = 60;

    // ── 1. Program Overview ──
    addSection('1. Program Overview');
    addText(narratives.program_name, 11, true);
    y += 2;
    addText(narratives.program_description);

    // ── 2. Executive Summary ──
    addSection('2. Executive Summary');
    addBullet('Total Participants Enrolled', totalEnrolled);
    addBullet('Attended At Least One Session', `${attendedAtLeastOne} (${pct(attendedAtLeastOne, totalEnrolled)}%)`);
    addBullet('≥80% Session Attendance', `${attended80Plus} (${pct(attended80Plus, totalEnrolled)}%)`);
    addBullet('Completed Pre-Assessment', `${completedPre} (${pct(completedPre, totalEnrolled)}%)`);
    addBullet('Completed Post-Assessment', `${completedPost} (${pct(completedPost, totalEnrolled)}%)`);
    addBullet('Average Score Improvement', `${avgPreScore} → ${avgPostScore} pts (+${avgImprovement})`);
    addBullet('Completed 1-on-1 Consultation', `${completedConsultation} (${pct(completedConsultation, totalEnrolled)}%)`);
    addBullet('Uploaded Required Documents', `${completedDocs} (${pct(completedDocs, totalEnrolled)}%)`);
    addBullet('Engaged with Workbook', `${uniqueWorkbookParticipants} participants`);
    addBullet('Completed ALL Requirements', `${completedAll} (${pct(completedAll, totalEnrolled)}%)`);
    addBullet('Giveaway Eligible', `${enrollments.filter(e => e.giveaway_eligible).length}`);

    // ── 3. Session Attendance ──
    addSection('3. Session-by-Session Attendance');
    sessionStats.forEach((s, i) => {
      const total = s.liveCount + s.recordingCount;
      checkPage(16);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Day ${i + 1}: ${s.session_title}`, margin + 2, y);
      y += 5;
      doc.setFont(undefined, 'normal');
      const dateStr = s.session_date ? new Date(s.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Date TBD';
      doc.text(`   Date: ${dateStr}`, margin + 2, y); y += 5;
      doc.text(`   Attended Live: ${s.liveCount}  |  Watched Recording: ${s.recordingCount}  |  Total: ${total}/${totalEnrolled} (${pct(total, totalEnrolled)}%)`, margin + 2, y);
      y += 7;
    });
    y += 3;
    addSubSection('Attendance Rate Distribution');
    [
      ['100% (Perfect)', enrolled => getAttendanceRate(enrolled.id) === 100],
      ['80–99%', enrolled => { const r = getAttendanceRate(enrolled.id); return r >= 80 && r < 100; }],
      ['60–79%', enrolled => { const r = getAttendanceRate(enrolled.id); return r >= 60 && r < 80; }],
      ['1–59%', enrolled => { const r = getAttendanceRate(enrolled.id); return r > 0 && r < 60; }],
      ['0% (No attendance)', enrolled => getAttendanceRate(enrolled.id) === 0],
    ].forEach(([label, fn]) => addBullet(label, enrollments.filter(fn).length));

    // ── 4. Assessment Results ──
    addSection('4. Assessment Results (Pre vs. Post)');
    addSubSection('Overall Scores');
    addBullet('Pre-Assessment Average', `${avgPreScore}/100 (n=${preAssessments.length})`);
    addBullet('Post-Assessment Average', `${avgPostScore}/100 (n=${postAssessments.length})`);
    addBullet('Average Score Gain', `+${avgImprovement} points`);
    y += 3;
    addSubSection('Subscore Breakdown');
    addBullet('Grants vs. Contracts Understanding', `Pre: ${avgPreGrants}  →  Post: ${avgPostGrants}`);
    addBullet('Legal Readiness', `Pre: ${avgPreLegal}  →  Post: ${avgPostLegal}`);
    addBullet('Financial Readiness', `Pre: ${avgPreFinancial}  →  Post: ${avgPostFinancial}`);
    addBullet('Confidence Score (1–10)', `Pre: ${avgPreConfidence}  →  Post: ${avgPostConfidence}`);
    y += 3;
    addSubSection('Individual Participant Assessment Data');
    participantRows.forEach((p, i) => {
      checkPage(14);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${i + 1}. ${p.name} (${p.org})`, margin + 2, y); y += 5;
      doc.setFont(undefined, 'normal');
      doc.text(`   Pre: ${p.pre}  |  Post: ${p.post}  |  Gain: ${typeof p.gain === 'number' ? '+' + p.gain : p.gain}  |  Pre Confidence: ${p.preConfidence}  |  Post Confidence: ${p.postConfidence}`, margin + 2, y);
      y += 7;
    });

    if (narratives.outcomes_narrative) {
      y += 3;
      addSubSection('Outcomes Narrative');
      addText(narratives.outcomes_narrative);
    }

    // ── 5. Consultations ──
    addSection('5. One-on-One Consultations');
    addBullet('Consultations Completed (enrollment flag)', completedConsultation);
    addBullet('Confirmed Completed Bookings', completedConsultationBookings.length);
    addBullet('Online Format', onlineConsults);
    addBullet('In-Person Format', inPersonConsults);
    addBullet('45-Minute Sessions', avg45);
    addBullet('60-Minute Sessions', avg60);
    y += 3;
    addSubSection('Consultation Notes (Selected)');
    completedConsultationBookings.filter(c => c.facilitator_notes).slice(0, 5).forEach((c, i) => {
      checkPage(12);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${i + 1}. ${c.participant_name}`, margin + 2, y); y += 5;
      doc.setFont(undefined, 'normal');
      const noteLines = doc.splitTextToSize(`   Notes: ${c.facilitator_notes}`, 165);
      checkPage(noteLines.length * 5);
      doc.text(noteLines, margin + 2, y);
      y += noteLines.length * 5 + 3;
    });

    // ── 6. Documents & Workbook ──
    addSection('6. Documents & Workbook Engagement');
    addBullet('Participants Who Uploaded Documents', `${completedDocs} (flag) / ${docSubCount} (submissions)`);
    docStatusBreakdown.forEach(([status, count]) => addBullet(`  Status: ${status}`, count));
    y += 3;
    addBullet('Workbook Participants', uniqueWorkbookParticipants);
    workbookBySection.slice(0, 8).forEach(([section, count]) => addBullet(`  Section: ${section}`, count));

    // ── 7. Cohort Demographics ──
    addSection('7. Cohort Demographics (Registration Data)');
    addSubSection('Organization Types');
    orgTypes.forEach(([label, count]) => addBullet(label, `${count} (${pct(count, totalEnrolled)}%)`));
    y += 3;
    addSubSection('Years in Business');
    yearsInBusiness.forEach(([label, count]) => addBullet(label, count));
    y += 3;
    addSubSection('Grant Experience Level');
    grantExp.forEach(([label, count]) => addBullet(label, count));
    y += 3;
    addSubSection('Funding Barriers Identified');
    fundingBarriers.slice(0, 8).forEach(([label, count]) => addBullet(label, count));
    y += 3;
    addSubSection('Primary Goals');
    goals.slice(0, 8).forEach(([label, count]) => addBullet(label, count));
    y += 3;
    addSubSection('How Participants Heard About the Program');
    howHeard.forEach(([label, count]) => addBullet(label, count));

    // ── 8. Participant Next Steps ──
    if (nextStepsList.length > 0) {
      addSection('8. Participant Next Steps (from Post-Assessment)');
      nextStepsList.slice(0, 20).forEach((step, i) => {
        checkPage(12);
        const lines = doc.splitTextToSize(`${i + 1}. ${step}`, 165);
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(lines, margin + 2, y);
        y += lines.length * 5 + 2;
      });
    }

    // ── 9. Program Evaluations ──
    if (evalResponses.length > 0) {
      addSection(`${nextStepsList.length > 0 ? 9 : 8}. Program Evaluations`);
      const avgOverall = (evalResponses.reduce((s, e) => s + (e.responses?.overall_rating || 0), 0) / evalResponses.length).toFixed(1);
      const avgRecommend = (evalResponses.reduce((s, e) => s + (e.responses?.recommend_rating || 0), 0) / evalResponses.length).toFixed(1);
      addBullet('Evaluations Submitted', `${evalResponses.length} (${pct(evalResponses.length, totalEnrolled)}%)`);
      addBullet('Average Overall Rating', `${avgOverall}/10`);
      addBullet('Average Recommend Score', `${avgRecommend}/10`);
      y += 3;
      addSubSection('Participant Feedback');
      evalResponses.forEach((ev, i) => {
        checkPage(20);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`${i + 1}. ${ev.participant_email}  |  Overall: ${ev.responses?.overall_rating ?? '—'}/10  |  Recommend: ${ev.responses?.recommend_rating ?? '—'}/10`, margin + 2, y);
        y += 5;
        doc.setFont(undefined, 'normal');
        ['most_valuable', 'improvements', 'additional_comments', 'next_steps'].forEach(field => {
          if (ev.responses?.[field]) {
            const label = { most_valuable: 'Most Valuable', improvements: 'Suggestions', additional_comments: 'Comments', next_steps: 'Next Steps' }[field];
            const lines = doc.splitTextToSize(`   ${label}: ${ev.responses[field]}`, 165);
            checkPage(lines.length * 5);
            doc.text(lines, margin + 2, y);
            y += lines.length * 5 + 2;
          }
        });
        y += 3;
      });
    }

    // ── Full Participant Table ──
    const sectionOffset = (nextStepsList.length > 0 ? 1 : 0) + (evalResponses.length > 0 ? 1 : 0);
    addSection(`${8 + sectionOffset}. Comprehensive Participant Completion Table`);
    participantRows.forEach((p, i) => {
      checkPage(18);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${i + 1}. ${p.name}  |  ${p.org}  |  Grant Exp: ${p.grantExp}`, margin + 2, y); y += 5;
      doc.setFont(undefined, 'normal');
      doc.text(
        `   Attend: ${p.attendanceRate}%  Pre: ${p.pre}  Post: ${p.post}  Gain: ${typeof p.gain === 'number' ? '+' + p.gain : p.gain}  Confidence: ${p.preConfidence}→${p.postConfidence}  Consult: ${p.consultation ? 'Yes' : 'No'}  Docs: ${p.docs ? 'Yes' : 'No'}  Workbook: ${p.workbook ? 'Yes' : 'No'}  Complete: ${p.allComplete ? 'YES' : 'No'}`,
        margin + 2, y
      ); y += 7;
    });

    // ── Equity & Compliance ──
    addSection(`${9 + sectionOffset}. Equity & Compliance`);
    addSubSection('Equity & Capacity-Building Impact');
    addText(narratives.equity_narrative);
    y += 3;
    addSubSection('Compliance & Scope Statement');
    addText(narratives.compliance_statement);
    y += 3;
    addSubSection('Completion Incentive Language');
    addText(narratives.incentive_language);

    doc.save(`IncubateHer-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Comprehensive report exported to PDF');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">IncubateHer Program Report</h1>
          <p className="text-slate-500 mt-1">Comprehensive CUL submission report — all data pulled live · {activeCohort?.cohort_name || 'Active Cohort'}</p>
        </div>
        <Button onClick={exportToPDF} className="bg-[#143A50]">
          <Download className="w-4 h-4 mr-2" />
          Export Full PDF
        </Button>
      </div>

      {/* ── EXECUTIVE SNAPSHOT ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Enrolled" value={totalEnrolled} icon={Users} />
        <MetricCard label="Completed All" value={completedAll} sub={`${pct(completedAll, totalEnrolled)}% rate`} icon={Award} color="text-green-600" />
        <MetricCard label="Pre→Post Gain" value={`+${avgImprovement}`} sub={`${avgPreScore} → ${avgPostScore}`} icon={TrendingUp} color="text-[#AC1A5B]" />
        <MetricCard label="≥80% Attendance" value={attended80Plus} sub={`${pct(attended80Plus, totalEnrolled)}% of cohort`} icon={Calendar} color="text-blue-600" />
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto h-auto flex-wrap gap-1 justify-start bg-muted p-1">
          <TabsTrigger value="summary">📊 Overview</TabsTrigger>
          <TabsTrigger value="attendance">📅 Attendance</TabsTrigger>
          <TabsTrigger value="assessments">📋 Assessments</TabsTrigger>
          <TabsTrigger value="consultations">💬 Consultations</TabsTrigger>
          <TabsTrigger value="documents">📁 Docs & Workbook</TabsTrigger>
          <TabsTrigger value="demographics">🏢 Demographics</TabsTrigger>
          <TabsTrigger value="participants">👥 All Participants</TabsTrigger>
          <TabsTrigger value="participant_overview">🔍 Reg. Insights</TabsTrigger>
          <TabsTrigger value="registration_insights">📌 Brief</TabsTrigger>
          <TabsTrigger value="narrative">✍️ Narratives</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="summary">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#143A50]" />Program Completion Funnel</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Enrolled', count: totalEnrolled, color: 'bg-slate-600' },
                  { label: 'Attended ≥1 Session', count: attendedAtLeastOne },
                  { label: 'Completed Pre-Assessment', count: completedPre },
                  { label: 'Completed Consultation', count: completedConsultation },
                  { label: 'Uploaded Documents', count: completedDocs },
                  { label: 'Engaged with Workbook', count: uniqueWorkbookParticipants },
                  { label: 'Completed Post-Assessment', count: completedPost },
                  { label: 'Completed ALL Requirements', count: completedAll },
                ].map(item => (
                  <FunnelRow key={item.label} label={item.label} count={item.count} total={totalEnrolled} />
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Pre-Assess Avg" value={`${avgPreScore}/100`} sub={`n=${preAssessments.length}`} icon={Brain} />
              <MetricCard label="Post-Assess Avg" value={`${avgPostScore}/100`} sub={`n=${postAssessments.length}`} icon={Brain} color="text-green-600" />
              <MetricCard label="Giveaway Eligible" value={enrollments.filter(e => e.giveaway_eligible).length} icon={Star} color="text-amber-500" />
              <MetricCard label="Consultations Done" value={completedConsultation} sub={`${completedConsultationBookings.length} confirmed bookings`} icon={MessageSquare} color="text-[#AC1A5B]" />
            </div>

            <Card>
              <CardHeader><CardTitle>Assessment Subscore Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Grants vs. Contracts', pre: avgPreGrants, post: avgPostGrants },
                    { label: 'Legal Readiness', pre: avgPreLegal, post: avgPostLegal },
                    { label: 'Financial Readiness', pre: avgPreFinancial, post: avgPostFinancial },
                    { label: 'Confidence (1–10)', pre: avgPreConfidence, post: avgPostConfidence },
                  ].map(s => (
                    <div key={s.label} className="p-4 bg-slate-50 rounded-lg text-center">
                      <p className="text-xs font-semibold text-slate-500 mb-2">{s.label}</p>
                      <p className="text-lg font-bold text-slate-700">{s.pre} → <span className="text-[#143A50]">{s.post}</span></p>
                      <p className="text-xs text-slate-400">pre → post</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── ATTENDANCE ── */}
        <TabsContent value="attendance">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-[#143A50]" />Session-by-Session Breakdown</CardTitle></CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No sessions found.</p>
                ) : (
                  <div className="space-y-4">
                    {sessionStats.map((s, i) => {
                      const total = s.liveCount + s.recordingCount;
                      return (
                        <div key={s.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <p className="font-semibold text-slate-900">Day {i + 1}: {s.session_title}</p>
                              <p className="text-sm text-slate-500">{s.session_date ? new Date(s.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}</p>
                            </div>
                            <Badge className={pct(total, totalEnrolled) >= 70 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                              {pct(total, totalEnrolled)}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="text-center p-2 bg-green-50 rounded"><p className="text-xl font-bold text-green-700">{s.liveCount}</p><p className="text-xs text-slate-600">Live</p></div>
                            <div className="text-center p-2 bg-blue-50 rounded"><p className="text-xl font-bold text-blue-700">{s.recordingCount}</p><p className="text-xs text-slate-600">Recording</p></div>
                            <div className="text-center p-2 bg-slate-50 rounded"><p className="text-xl font-bold text-slate-500">{totalEnrolled - total}</p><p className="text-xs text-slate-600">Absent</p></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Attendance Rate Distribution</CardTitle></CardHeader>
              <CardContent>
                {[
                  { label: '100%', fn: e => getAttendanceRate(e.id) === 100, color: 'bg-green-600' },
                  { label: '80–99%', fn: e => { const r = getAttendanceRate(e.id); return r >= 80 && r < 100; }, color: 'bg-green-400' },
                  { label: '60–79%', fn: e => { const r = getAttendanceRate(e.id); return r >= 60 && r < 80; }, color: 'bg-amber-400' },
                  { label: '1–59%', fn: e => { const r = getAttendanceRate(e.id); return r > 0 && r < 60; }, color: 'bg-orange-400' },
                  { label: '0%', fn: e => getAttendanceRate(e.id) === 0, color: 'bg-red-400' },
                ].map(row => {
                  const count = enrollments.filter(row.fn).length;
                  return (
                    <div key={row.label} className="flex items-center gap-3 mb-2 text-sm">
                      <div className="w-20 shrink-0 text-slate-700">{row.label}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                        <div className={`${row.color} h-5 rounded-full`} style={{ width: `${pct(count, totalEnrolled)}%` }} />
                      </div>
                      <div className="w-8 text-right font-bold">{count}</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── ASSESSMENTS ── */}
        <TabsContent value="assessments">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 bg-slate-50 rounded-lg text-center border">
                <p className="text-3xl font-bold text-slate-700">{avgPreScore}</p>
                <p className="text-sm text-slate-500">Avg Pre-Score</p>
                <p className="text-xs text-slate-400">n={preAssessments.length}</p>
              </div>
              <div className="p-6 bg-[#AC1A5B]/10 rounded-lg text-center border border-[#AC1A5B]/20">
                <p className="text-3xl font-bold text-[#AC1A5B]">+{avgImprovement}</p>
                <p className="text-sm text-slate-500">Avg Gain</p>
              </div>
              <div className="p-6 bg-green-50 rounded-lg text-center border border-green-200">
                <p className="text-3xl font-bold text-green-700">{avgPostScore}</p>
                <p className="text-sm text-slate-500">Avg Post-Score</p>
                <p className="text-xs text-slate-400">n={postAssessments.length}</p>
              </div>
            </div>

            <Card>
              <CardHeader><CardTitle>Subscore Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Grants vs. Contracts Understanding', pre: avgPreGrants, post: avgPostGrants },
                    { label: 'Legal Readiness', pre: avgPreLegal, post: avgPostLegal },
                    { label: 'Financial Readiness', pre: avgPreFinancial, post: avgPostFinancial },
                    { label: 'Confidence Score (1–10 scale)', pre: avgPreConfidence, post: avgPostConfidence },
                  ].map(s => (
                    <div key={s.label} className="p-4 border rounded-lg">
                      <p className="font-semibold text-sm text-slate-700 mb-2">{s.label}</p>
                      <div className="flex items-center gap-4">
                        <div className="text-center"><p className="text-2xl font-bold text-slate-500">{s.pre}</p><p className="text-xs text-slate-400">Pre</p></div>
                        <TrendingUp className="w-5 h-5 text-[#AC1A5B]" />
                        <div className="text-center"><p className="text-2xl font-bold text-[#143A50]">{s.post}</p><p className="text-xs text-slate-400">Post</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Individual Assessment Results</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-slate-50">
                    <th className="text-left p-2">Participant</th>
                    <th className="text-center p-2 text-xs">Pre</th>
                    <th className="text-center p-2 text-xs">Post</th>
                    <th className="text-center p-2 text-xs">Gain</th>
                    <th className="text-center p-2 text-xs">Confidence Pre</th>
                    <th className="text-center p-2 text-xs">Confidence Post</th>
                  </tr></thead>
                  <tbody>
                    {participantRows.map((p, i) => (
                      <tr key={i} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-medium">{p.name}</td>
                        <td className="text-center p-2 font-mono">{p.pre}</td>
                        <td className="text-center p-2 font-mono">{p.post}</td>
                        <td className="text-center p-2 font-bold text-green-700">{typeof p.gain === 'number' ? `+${p.gain}` : '—'}</td>
                        <td className="text-center p-2 font-mono">{p.preConfidence}</td>
                        <td className="text-center p-2 font-mono">{p.postConfidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {nextStepsList.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Participant Next Steps (from Post-Assessment)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {nextStepsList.map((step, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm border-l-4 border-l-[#143A50]">
                        <p className="text-slate-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Program Evaluations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> Program Evaluations
                  <Badge className="ml-1 bg-purple-100 text-purple-800">{evalResponses.length} submitted</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {evalResponses.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">No evaluations submitted yet.</p>
                ) : (
                  <>
                    {/* Aggregate ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                        <p className="text-xs text-slate-500 mb-1">Avg Overall Rating</p>
                        <p className="text-3xl font-bold text-amber-700">
                          {(evalResponses.reduce((s, e) => s + (e.responses?.overall_rating || 0), 0) / evalResponses.length).toFixed(1)}
                          <span className="text-sm font-normal text-slate-400">/10</span>
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                        <p className="text-xs text-slate-500 mb-1">Avg Recommend Score</p>
                        <p className="text-3xl font-bold text-green-700">
                          {(evalResponses.reduce((s, e) => s + (e.responses?.recommend_rating || 0), 0) / evalResponses.length).toFixed(1)}
                          <span className="text-sm font-normal text-slate-400">/10</span>
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                        <p className="text-xs text-slate-500 mb-1">Evaluations Submitted</p>
                        <p className="text-3xl font-bold text-purple-700">{evalResponses.length}</p>
                        <p className="text-xs text-slate-400">{pct(evalResponses.length, totalEnrolled)}% of cohort</p>
                      </div>
                    </div>

                    {/* Per-participant feedback */}
                    <div className="space-y-4">
                      {evalResponses.map((ev, i) => {
                        const hasText = ev.responses?.most_valuable || ev.responses?.improvements || ev.responses?.additional_comments || ev.responses?.next_steps;
                        return (
                          <div key={ev.id || i} className="border rounded-xl p-4 bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-sm font-semibold text-slate-700">{ev.participant_email}</p>
                              <div className="flex gap-2">
                                {ev.responses?.overall_rating != null && (
                                  <Badge className="bg-amber-100 text-amber-800">Overall: {ev.responses.overall_rating}/10</Badge>
                                )}
                                {ev.responses?.recommend_rating != null && (
                                  <Badge className="bg-green-100 text-green-800">Recommend: {ev.responses.recommend_rating}/10</Badge>
                                )}
                              </div>
                            </div>
                            {hasText && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {ev.responses?.most_valuable && (
                                  <div className="bg-white rounded-lg p-3 border">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Most Valuable</p>
                                    <p className="text-slate-700">{ev.responses.most_valuable}</p>
                                  </div>
                                )}
                                {ev.responses?.improvements && (
                                  <div className="bg-white rounded-lg p-3 border">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Suggestions</p>
                                    <p className="text-slate-700">{ev.responses.improvements}</p>
                                  </div>
                                )}
                                {ev.responses?.additional_comments && (
                                  <div className="bg-white rounded-lg p-3 border md:col-span-2">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Additional Comments</p>
                                    <p className="text-slate-700">{ev.responses.additional_comments}</p>
                                  </div>
                                )}
                                {ev.responses?.next_steps && (
                                  <div className="bg-white rounded-lg p-3 border md:col-span-2">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Next Steps</p>
                                    <p className="text-slate-700">{ev.responses.next_steps}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {!hasText && <p className="text-xs text-slate-400 italic">Ratings only, no open-ended responses.</p>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── CONSULTATIONS ── */}
        <TabsContent value="consultations">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Completed (flag)" value={completedConsultation} icon={CheckCircle2} />
              <MetricCard label="Confirmed Bookings" value={completedConsultationBookings.length} icon={Calendar} color="text-green-600" />
              <MetricCard label="Online" value={onlineConsults} icon={MessageSquare} color="text-blue-600" />
              <MetricCard label="In-Person" value={inPersonConsults} icon={Users} color="text-[#AC1A5B]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Session Duration Split</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <FunnelRow label="45-minute sessions" count={avg45} total={completedConsultationBookings.length} />
                  <FunnelRow label="60-minute sessions" count={avg60} total={completedConsultationBookings.length} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Participants Interested in Consultation (Registration)</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {interestedInConsultation.map(([label, count]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{label}</span>
                      <Badge>{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Consultation Details</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                {completedConsultationBookings.length === 0 ? (
                  <p className="text-slate-500 text-center py-6">No completed consultation bookings found.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-slate-50">
                      <th className="text-left p-2">Participant</th>
                      <th className="text-center p-2 text-xs">Format</th>
                      <th className="text-center p-2 text-xs">Duration</th>
                      <th className="text-left p-2 text-xs">Facilitator Notes</th>
                    </tr></thead>
                    <tbody>
                      {completedConsultationBookings.map((c, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="p-2 font-medium">{c.participant_name}</td>
                          <td className="text-center p-2"><Badge variant="outline">{c.meeting_preference}</Badge></td>
                          <td className="text-center p-2">{c.meeting_duration} min</td>
                          <td className="p-2 text-slate-600 text-xs max-w-xs">{c.facilitator_notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── DOCUMENTS & WORKBOOK ── */}
        <TabsContent value="documents">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Docs Uploaded (flag)" value={completedDocs} icon={FileText} />
              <MetricCard label="Unique Doc Submitters" value={docSubCount} icon={FileText} color="text-green-600" />
              <MetricCard label="Workbook Participants" value={uniqueWorkbookParticipants} icon={BookOpen} color="text-blue-600" />
              <MetricCard label="Workbook Responses" value={workbookResponses.filter(w => participantEmails.has(w.participant_email)).length} icon={BookOpen} color="text-[#AC1A5B]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Document Submission Status</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {docStatusBreakdown.length > 0 ? docStatusBreakdown.map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                      <span className="text-slate-700 capitalize">{status.replace(/_/g, ' ')}</span>
                      <Badge>{count}</Badge>
                    </div>
                  )) : <p className="text-slate-400 text-sm">No document submission data</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Workbook Engagement by Section</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {workbookBySection.length > 0 ? workbookBySection.map(([section, count]) => (
                    <div key={section} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                      <span className="text-slate-700 truncate max-w-xs">{section}</span>
                      <Badge>{count}</Badge>
                    </div>
                  )) : <p className="text-slate-400 text-sm">No workbook data</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── DEMOGRAPHICS ── */}
        <TabsContent value="demographics">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-[#143A50]" />Registration Demographics</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <DemoTable title="Organization Type" data={orgTypes} />
                  <DemoTable title="Years in Business" data={yearsInBusiness} />
                  <DemoTable title="Grant Experience Level" data={grantExp} />
                  <DemoTable title="Primary Funding Barrier" data={fundingBarriers} />
                  <DemoTable title="Primary Goal" data={goals} />
                  <DemoTable title="How They Heard About Program" data={howHeard} />
                  <DemoTable title="Participation Plan" data={participationPlans} />
                  <DemoTable title="Interested in Consultation?" data={interestedInConsultation} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── ALL PARTICIPANTS ── */}
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-[#143A50]" />All Participants ({participantRows.length})</CardTitle>
              <p className="text-sm text-slate-500">Complete data across all program components</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2">Name / Org</th>
                    <th className="text-center p-2 text-xs">Attend%</th>
                    <th className="text-center p-2 text-xs">Pre</th>
                    <th className="text-center p-2 text-xs">Post</th>
                    <th className="text-center p-2 text-xs">Gain</th>
                    <th className="text-center p-2 text-xs">Conf↑</th>
                    <th className="text-center p-2 text-xs">Consult</th>
                    <th className="text-center p-2 text-xs">Docs</th>
                    <th className="text-center p-2 text-xs">Wkbk</th>
                    <th className="text-center p-2 text-xs">Done</th>
                    <th className="text-center p-2 text-xs">🎁</th>
                  </tr>
                </thead>
                <tbody>
                  {participantRows.map((p, i) => (
                    <tr key={i} className={`border-b hover:bg-slate-50 ${p.allComplete ? 'bg-green-50' : ''}`}>
                      <td className="p-2">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.org} · {p.grantExp}</p>
                      </td>
                      <td className="text-center p-2">
                        <Badge className={p.attendanceRate >= 80 ? 'bg-green-100 text-green-800' : p.attendanceRate >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}>
                          {p.attendanceRate}%
                        </Badge>
                      </td>
                      <td className="text-center p-2 font-mono">{p.pre}</td>
                      <td className="text-center p-2 font-mono">{p.post}</td>
                      <td className="text-center p-2 font-bold text-green-700">{typeof p.gain === 'number' ? `+${p.gain}` : '—'}</td>
                      <td className="text-center p-2 font-mono text-xs">{p.preConfidence}→{p.postConfidence}</td>
                      <td className="text-center p-2">{p.consultation ? '✅' : '⬜'}</td>
                      <td className="text-center p-2">{p.docs ? '✅' : '⬜'}</td>
                      <td className="text-center p-2">{p.workbook ? '✅' : '⬜'}</td>
                      <td className="text-center p-2">{p.allComplete ? '🏆' : '⬜'}</td>
                      <td className="text-center p-2">{p.giveaway ? '🎁' : '—'}</td>
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

        {/* ── REG INSIGHTS ── */}
        <TabsContent value="participant_overview">
          <ParticipantOverviewReport enrollments={enrollments} />
        </TabsContent>
        <TabsContent value="registration_insights">
          <RegistrationInsightsBrief />
        </TabsContent>

        {/* ── NARRATIVES ── */}
        <TabsContent value="narrative">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Program Overview</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Program Name</Label><Input value={narratives.program_name} onChange={e => setNarratives(p => ({ ...p, program_name: e.target.value }))} /></div>
                <div><Label>Program Description</Label><Textarea rows={8} value={narratives.program_description} onChange={e => setNarratives(p => ({ ...p, program_description: e.target.value }))} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Outcomes Narrative</CardTitle>
                  <Button size="sm" className="bg-[#AC1A5B]" onClick={() => generateAINarrative('outcomes')} disabled={generatingAI}>
                    {generatingAI ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />AI Generate</>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea rows={8} placeholder="Describe learning outcomes, assessment gains, and participant growth..." value={narratives.outcomes_narrative} onChange={e => setNarratives(p => ({ ...p, outcomes_narrative: e.target.value }))} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Equity & Capacity-Building Impact</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => generateAINarrative('equity')} disabled={generatingAI}><Sparkles className="w-4 h-4 mr-2" />AI Generate</Button>
                </div>
              </CardHeader>
              <CardContent><Textarea rows={6} value={narratives.equity_narrative} onChange={e => setNarratives(p => ({ ...p, equity_narrative: e.target.value }))} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Compliance & Scope Statement</CardTitle></CardHeader>
              <CardContent><Textarea rows={5} value={narratives.compliance_statement} onChange={e => setNarratives(p => ({ ...p, compliance_statement: e.target.value }))} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Completion Incentive Language</CardTitle></CardHeader>
              <CardContent><Textarea rows={4} value={narratives.incentive_language} onChange={e => setNarratives(p => ({ ...p, incentive_language: e.target.value }))} /></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* CUL Checklist */}
      <Card className="mt-6 border-green-200 bg-green-50">
        <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" />CUL Submission Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {[
              'Program description & overview',
              'Session-by-session attendance',
              'Attendance rate distribution',
              'Pre/Post assessment results',
              'Assessment subscores (Grants, Legal, Financial)',
              'Confidence score tracking',
              'Individual participant data',
              'Consultation details & notes',
              'Document submission status',
              'Workbook engagement by section',
              'Cohort demographics (8 fields)',
              'Participant next steps',
              'Completion metrics funnel',
              'Outcomes narrative (AI-assisted)',
              'Equity-centered narrative',
              'Scope & compliance statement',
              'Program evaluation scores & feedback',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <Badge className="bg-green-600 shrink-0">✓</Badge>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}