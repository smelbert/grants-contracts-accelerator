import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { Users, CheckCircle2, TrendingUp, Award, FileText, Calendar, Star, MessageSquare } from 'lucide-react';

export default function IncubateHerAdmin() {
  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0] || null;
    }
  });

  // Match the same query used in IncubateHerParticipants for accuracy
  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments', cohort?.id],
    queryFn: async () => {
      const filter = { role: 'participant' };
      if (cohort?.id) filter.cohort_id = cohort.id;
      return await base44.entities.ProgramEnrollment.filter(filter);
    },
    enabled: cohort !== undefined // wait for cohort query to resolve
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['all-assessments'],
    queryFn: async () => {
      return await base44.entities.ProgramAssessment.list();
    }
  });

  // Calculate metrics — filtered to active participants only
  const activeEnrollments = enrollments.filter(e => e.enrollment_status !== 'withdrawn' && e.enrollment_status !== 'inactive');
  const totalParticipants = activeEnrollments.length;
  const completedPreAssessment = activeEnrollments.filter(e => e.pre_assessment_completed).length;
  const completedPostAssessment = activeEnrollments.filter(e => e.post_assessment_completed).length;
  const completedConsultations = activeEnrollments.filter(e => e.consultation_completed).length;
  const completedAttendance = activeEnrollments.filter(e => e.attendance_complete).length;
  const completedDocuments = activeEnrollments.filter(e => e.documents_uploaded).length;
  const completedProgram = activeEnrollments.filter(e => e.program_completed).length;
  const giveawayEligible = activeEnrollments.filter(e => e.giveaway_eligible).length;

  // Use ALL assessments (users may have different emails on file)
  const preAssessments = assessments.filter(a => a.assessment_type === 'pre');
  const postAssessments = assessments.filter(a => a.assessment_type === 'post');
  const evalAssessments = assessments.filter(a => a.assessment_type === 'evaluation');
  
  const avgPreScore = preAssessments.length > 0 
    ? Math.round(preAssessments.reduce((sum, a) => sum + (a.total_score || 0), 0) / preAssessments.length)
    : 0;
  
  const avgPostScore = postAssessments.length > 0
    ? Math.round(postAssessments.reduce((sum, a) => sum + (a.total_score || 0), 0) / postAssessments.length)
    : 0;

  const growthDelta = avgPostScore - avgPreScore;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="IncubateHer Admin Dashboard"
        subtitle="Program Management & Reporting"
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Participants</p>
                  <p className="text-4xl font-bold" style={{ color: BRAND_COLORS.culRed }}>
                    {totalParticipants}
                  </p>
                </div>
                <Users className="w-12 h-12" style={{ color: BRAND_COLORS.eisGold }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Program Completion</p>
                  <p className="text-4xl font-bold" style={{ color: BRAND_COLORS.eisNavy }}>
                    {totalParticipants > 0 ? Math.round((completedProgram / totalParticipants) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12" style={{ color: BRAND_COLORS.eisGold }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Giveaway Eligible</p>
                  <p className="text-4xl font-bold" style={{ color: BRAND_COLORS.eisGold }}>
                    {giveawayEligible}
                  </p>
                </div>
                <Award className="w-12 h-12" style={{ color: BRAND_COLORS.culRed }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Completion Metrics</CardTitle>
            <CardDescription>Track participant progress through program requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Pre-Assessments', count: completedPreAssessment, icon: FileText },
                { label: 'Attendance', count: completedAttendance, icon: Calendar },
                { label: '1:1 Consultations', count: completedConsultations, icon: Calendar },
                { label: 'Documents', count: completedDocuments, icon: FileText },
                { label: 'Post-Assessments', count: completedPostAssessment, icon: CheckCircle2 },
              ].map(({ label, count, icon: Icon }) => (
                <div key={label} className="text-center p-4 rounded-lg bg-slate-50">
                  <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: BRAND_COLORS.eisNavy }} />
                  <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.neutralDark }}>
                    {count}
                  </p>
                  <p className="text-xs text-slate-600 mb-2">{label}</p>
                  <Badge className="text-xs" style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                    {totalParticipants > 0 ? Math.round((count / totalParticipants) * 100) : 0}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Readiness Growth */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>Readiness Growth</CardTitle>
            <CardDescription>Aggregate pre/post assessment comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-12">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Pre-Assessment Avg</p>
                <p className="text-5xl font-bold" style={{ color: BRAND_COLORS.eisNavy }}>
                  {avgPreScore}
                </p>
              </div>

              <TrendingUp className="w-16 h-16" style={{ color: BRAND_COLORS.eisGold }} />

              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Post-Assessment Avg</p>
                <p className="text-5xl font-bold" style={{ color: BRAND_COLORS.culRed }}>
                  {avgPostScore}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Growth</p>
                <p className="text-5xl font-bold" style={{ color: growthDelta > 0 ? BRAND_COLORS.eisGold : BRAND_COLORS.neutralDark }}>
                  +{growthDelta}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.culRed }}>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start text-white"
                  style={{ backgroundColor: BRAND_COLORS.eisGold }}
                  onClick={() => window.location.href = '/IncubateHerParticipants'}
                >
                  View All Participants
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  style={{ borderColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.eisNavy }}
                >
                  Export Reports
                </Button>
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  style={{ borderColor: BRAND_COLORS.culRed, color: BRAND_COLORS.culRed }}
                >
                  Manage Giveaway
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4">Program Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Cohort Active</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                    {cohort?.is_active ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Giveaway Enabled</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                    {cohort?.giveaway_enabled ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Giveaway Revealed</span>
                  <Badge style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                    {cohort?.giveaway_revealed ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}