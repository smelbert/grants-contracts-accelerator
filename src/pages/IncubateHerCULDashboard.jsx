import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { Users, TrendingUp, Award, FileText, Shield, CheckCircle2 } from 'lucide-react';

export default function IncubateHerCULDashboard() {
  const { data: enrollments } = useQuery({
    queryKey: ['cul-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const { data: assessments } = useQuery({
    queryKey: ['cul-assessments'],
    queryFn: () => base44.entities.ProgramAssessment.list()
  });

  // Aggregate calculations (no PII)
  const totalEnrolled = enrollments?.length || 0;
  const completedProgram = enrollments?.filter(e => e.program_completed).length || 0;
  const attendanceComplete = enrollments?.filter(e => e.attendance_complete).length || 0;
  const consultationsComplete = enrollments?.filter(e => e.consultation_completed).length || 0;
  const documentsSubmitted = enrollments?.filter(e => e.documents_uploaded).length || 0;

  // Assessment scores (aggregate only)
  const preAssessments = assessments?.filter(a => a.assessment_type === 'pre') || [];
  const postAssessments = assessments?.filter(a => a.assessment_type === 'post') || [];

  const avgPreScore = preAssessments.length > 0
    ? Math.round(preAssessments.reduce((sum, a) => sum + a.total_score, 0) / preAssessments.length)
    : 0;

  const avgPostScore = postAssessments.length > 0
    ? Math.round(postAssessments.reduce((sum, a) => sum + a.total_score, 0) / postAssessments.length)
    : 0;

  const avgDelta = avgPostScore - avgPreScore;

  // Readiness distribution
  const readinessDistribution = {
    not_ready: preAssessments.filter(a => a.total_score < 40).length,
    emerging: preAssessments.filter(a => a.total_score >= 40 && a.total_score < 60).length,
    competitive: preAssessments.filter(a => a.total_score >= 60 && a.total_score < 80).length,
    highly_competitive: preAssessments.filter(a => a.total_score >= 80).length
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="CUL Aggregate Dashboard"
        subtitle="Columbus Urban League View - Aggregate Data Only"
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Privacy Notice */}
        <Card className="border-l-4 border-l-[#AC1A5B]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-[#AC1A5B] flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Data Privacy Notice</h3>
                <p className="text-sm text-slate-600">
                  This dashboard displays <strong>aggregate data only</strong>. No individual participant information, 
                  names, emails, open responses, or consultation notes are visible. All data is anonymized in compliance 
                  with program agreements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment & Completion Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Enrolled</p>
                  <p className="text-4xl font-bold text-[#143A50]">{totalEnrolled}</p>
                </div>
                <Users className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed Program</p>
                  <p className="text-4xl font-bold text-green-600">{completedProgram}</p>
                </div>
                <Award className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completion Rate</p>
                  <p className="text-4xl font-bold text-[#AC1A5B]">
                    {totalEnrolled > 0 ? Math.round((completedProgram / totalEnrolled) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Score Increase</p>
                  <p className="text-4xl font-bold text-[#E5C089]">+{avgDelta}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Component Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Program Component Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Attendance Complete</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#143A50]">{attendanceComplete}</p>
                  <p className="text-sm text-slate-600">
                    {totalEnrolled > 0 ? Math.round((attendanceComplete / totalEnrolled) * 100) : 0}% of participants
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Consultations Complete</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#143A50]">{consultationsComplete}</p>
                  <p className="text-sm text-slate-600">
                    {totalEnrolled > 0 ? Math.round((consultationsComplete / totalEnrolled) * 100) : 0}% of participants
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Documents Submitted</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#143A50]">{documentsSubmitted}</p>
                  <p className="text-sm text-slate-600">
                    {totalEnrolled > 0 ? Math.round((documentsSubmitted / totalEnrolled) * 100) : 0}% of participants
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pre vs Post Assessment Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Average Pre-Assessment Score</p>
                  <p className="text-5xl font-bold text-[#143A50]">{avgPreScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Average Post-Assessment Score</p>
                  <p className="text-5xl font-bold text-[#AC1A5B]">{avgPostScore}</p>
                </div>
                <div className="text-center p-4 bg-[#E5C089] bg-opacity-20 rounded-lg">
                  <p className="text-sm text-slate-700 mb-1">Average Improvement</p>
                  <p className="text-4xl font-bold text-[#E5C089]">+{avgDelta} points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Initial Readiness Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-800">Not Ready (&lt;40)</span>
                  <Badge className="bg-red-600">{readinessDistribution.not_ready}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="font-medium text-amber-800">Emerging (40-59)</span>
                  <Badge className="bg-amber-600">{readinessDistribution.emerging}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">Competitive (60-79)</span>
                  <Badge className="bg-blue-600">{readinessDistribution.competitive}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Highly Competitive (80+)</span>
                  <Badge className="bg-green-600">{readinessDistribution.highly_competitive}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Outcomes Narrative */}
        <Card>
          <CardHeader>
            <CardTitle>Program Outcomes Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none">
              <p className="mb-4">
                The IncubateHer Funding Readiness program successfully enrolled <strong>{totalEnrolled} participants</strong>, 
                with <strong>{completedProgram} completing</strong> all program requirements for a completion rate of{' '}
                <strong>{totalEnrolled > 0 ? Math.round((completedProgram / totalEnrolled) * 100) : 0}%</strong>.
              </p>
              <p className="mb-4">
                Participants demonstrated significant growth in funding readiness, with average assessment scores 
                increasing from <strong>{avgPreScore} to {avgPostScore}</strong>, representing an average improvement 
                of <strong>+{avgDelta} points</strong>.
              </p>
              <p className="mb-4">
                Program engagement was strong, with <strong>{Math.round((consultationsComplete / totalEnrolled) * 100)}%</strong> of 
                participants completing one-on-one consultations and <strong>{Math.round((documentsSubmitted / totalEnrolled) * 100)}%</strong> submitting 
                required organizational documents.
              </p>
              <p>
                These outcomes demonstrate the program's effectiveness in building capacity and readiness among 
                women-led organizations pursuing funding opportunities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}