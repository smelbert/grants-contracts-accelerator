import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { Users, CheckCircle2, TrendingUp, Award, FileText, Calendar } from 'lucide-react';

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
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      return await base44.entities.ProgramEnrollment.filter({
        role: 'participant'
      });
    }
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['all-assessments'],
    queryFn: async () => {
      return await base44.entities.ProgramAssessment.list();
    }
  });

  // Calculate metrics
  const totalParticipants = enrollments.length;
  const completedPreAssessment = enrollments.filter(e => e.pre_assessment_completed).length;
  const completedPostAssessment = enrollments.filter(e => e.post_assessment_completed).length;
  const completedConsultations = enrollments.filter(e => e.consultation_completed).length;
  const completedProgram = enrollments.filter(e => e.program_completed).length;
  const giveawayEligible = enrollments.filter(e => e.giveaway_eligible).length;

  // Calculate average scores
  const preAssessments = assessments.filter(a => a.assessment_type === 'pre');
  const postAssessments = assessments.filter(a => a.assessment_type === 'post');
  
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <FileText className="w-10 h-10 mx-auto mb-2" style={{ color: BRAND_COLORS.eisNavy }} />
                <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.neutralDark }}>
                  {completedPreAssessment}
                </p>
                <p className="text-sm text-slate-600">Pre-Assessments</p>
                <Badge className="mt-2" style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                  {totalParticipants > 0 ? Math.round((completedPreAssessment / totalParticipants) * 100) : 0}%
                </Badge>
              </div>

              <div className="text-center">
                <Calendar className="w-10 h-10 mx-auto mb-2" style={{ color: BRAND_COLORS.eisNavy }} />
                <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.neutralDark }}>
                  {completedConsultations}
                </p>
                <p className="text-sm text-slate-600">1:1 Consultations</p>
                <Badge className="mt-2" style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                  {totalParticipants > 0 ? Math.round((completedConsultations / totalParticipants) * 100) : 0}%
                </Badge>
              </div>

              <div className="text-center">
                <FileText className="w-10 h-10 mx-auto mb-2" style={{ color: BRAND_COLORS.eisNavy }} />
                <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.neutralDark }}>
                  {completedPostAssessment}
                </p>
                <p className="text-sm text-slate-600">Post-Assessments</p>
                <Badge className="mt-2" style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                  {totalParticipants > 0 ? Math.round((completedPostAssessment / totalParticipants) * 100) : 0}%
                </Badge>
              </div>

              <div className="text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" style={{ color: BRAND_COLORS.eisNavy }} />
                <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.neutralDark }}>
                  {completedProgram}
                </p>
                <p className="text-sm text-slate-600">Completed Program</p>
                <Badge className="mt-2" style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                  {totalParticipants > 0 ? Math.round((completedProgram / totalParticipants) * 100) : 0}%
                </Badge>
              </div>
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