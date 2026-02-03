import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { CheckCircle2, XCircle, Search, Award } from 'lucide-react';

export default function IncubateHerParticipants() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: cohort } = useQuery({
    queryKey: ['incubateher-cohort'],
    queryFn: async () => {
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      return cohorts[0];
    }
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      if (!cohort?.id) return [];
      return await base44.entities.ProgramEnrollment.filter({
        cohort_id: cohort.id
      });
    },
    enabled: !!cohort?.id
  });

  const filteredEnrollments = enrollments.filter(e => 
    e.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.participant_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="Participant Management"
        subtitle="Track individual progress and completion"
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>
              All Participants ({filteredEnrollments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <div 
                  key={enrollment.id}
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: BRAND_COLORS.neutralLight }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: BRAND_COLORS.neutralDark }}>
                        {enrollment.participant_name}
                      </h3>
                      <p className="text-sm text-slate-600">{enrollment.participant_email}</p>
                      <Badge className="mt-1" style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                        {enrollment.role}
                      </Badge>
                    </div>
                    
                    {enrollment.giveaway_eligible && (
                      <Badge style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                        <Award className="w-3 h-3 mr-1" />
                        Giveaway Eligible
                      </Badge>
                    )}
                  </div>

                  {/* Progress Checklist */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="flex items-center gap-2">
                      {enrollment.pre_assessment_completed ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Pre-Assessment</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.attendance_complete ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Attendance</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.consultation_completed ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">1:1 Consultation</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.documents_uploaded ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Documents</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.post_assessment_completed ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Post-Assessment</span>
                    </div>
                  </div>

                  {/* Overall Status */}
                  <div className="mt-3 pt-3 border-t">
                    {enrollment.program_completed ? (
                      <Badge style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Program Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}
                  </div>
                </div>
              ))}

              {filteredEnrollments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">No participants found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}