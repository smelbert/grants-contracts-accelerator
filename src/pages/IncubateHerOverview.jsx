import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { CheckCircle2, Calendar, FileText, Users, Award } from 'lucide-react';

export default function IncubateHerOverview() {
  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="IncubateHer – Funding Readiness"
        subtitle="Preparing for Grants & Contracts"
      />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <Card className="mb-8 border-2" style={{ borderColor: BRAND_COLORS.culRed }}>
          <CardContent className="pt-8 pb-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.neutralDark }}>
                Build the Foundation for Funding Success
              </h2>
              <p className="text-lg mb-6" style={{ color: BRAND_COLORS.eisNavy }}>
                This intensive program helps entrepreneurs—especially women of color building nonprofit and for-profit businesses—understand what funders need to see before they say yes. Learn the difference between grants and contracts, assess your readiness, and build the credibility systems that open doors.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link to={createPageUrl('IncubateHerPreAssessment')}>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-white hover:opacity-90"
                    style={{ backgroundColor: BRAND_COLORS.eisGold }}
                  >
                    {enrollment?.pre_assessment_completed ? 'View Pre-Assessment' : 'Start Pre-Assessment'}
                  </Button>
                </Link>
                <Link to={createPageUrl('IncubateHerSchedule')}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    style={{ 
                      borderColor: BRAND_COLORS.eisNavy,
                      color: BRAND_COLORS.eisNavy
                    }}
                  >
                    View Schedule Options
                  </Button>
                </Link>
                <Link to={createPageUrl('IncubateHerEvaluation')}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    style={{ 
                      borderColor: BRAND_COLORS.culRed,
                      color: BRAND_COLORS.culRed
                    }}
                  >
                    {enrollment?.evaluation_completed ? 'View Evaluation' : 'Program Evaluation'}
                  </Button>
                </Link>
              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.neutralLight, border: `1px solid ${BRAND_COLORS.eisNavy}` }}>
                <p className="text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                  <strong>Note:</strong> This program supports funding readiness and preparation. It does not include grant searches, application writing during sessions, or funding guarantees.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Outcomes */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.culRed }}>
              <Award className="w-6 h-6" />
              What You'll Learn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'The real difference between grants and contracts',
                'How to assess your funding readiness honestly',
                'What documents and systems funders expect to see',
                'How to align your business story for funding',
                'Common pitfalls that cost entrepreneurs time and reputation',
                'How to read and respond to RFPs and contract solicitations'
              ].map((outcome, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: BRAND_COLORS.eisGold }} />
                  <span style={{ color: BRAND_COLORS.neutralDark }}>{outcome}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How Success Is Measured */}
        <Card style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
          <CardContent className="pt-8 pb-8">
            <h3 className="text-xl font-bold mb-6 text-center">How Success Is Measured</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.eisGold }} />
                <h4 className="font-semibold mb-2">Attendance</h4>
                <p className="text-sm opacity-90">Complete all sessions</p>
              </div>
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.eisGold }} />
                <h4 className="font-semibold mb-2">Pre/Post Assessment</h4>
                <p className="text-sm opacity-90">Measure your growth</p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.eisGold }} />
                <h4 className="font-semibold mb-2">1:1 Consultation</h4>
                <p className="text-sm opacity-90">Personalized guidance</p>
              </div>
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.eisGold }} />
                <h4 className="font-semibold mb-2">Document Completion</h4>
                <p className="text-sm opacity-90">Build your portfolio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}