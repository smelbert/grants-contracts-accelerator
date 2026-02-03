import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SCHEDULE_OPTIONS = [
  {
    id: 'option_a',
    title: 'Option A – 3 Evenings',
    sessions: [
      { day: 'Monday', time: '17:30–19:30' },
      { day: 'Tuesday', time: '17:30–19:30' },
      { day: 'Thursday', time: '17:30–19:30' }
    ],
    bestFor: 'Those who prefer shorter, more frequent sessions',
    totalHours: 6,
    topics: ['Funding basics', 'Readiness assessment', 'Document preparation', 'RFP/contract overview']
  },
  {
    id: 'option_b',
    title: 'Option B – 2 Extended Evenings',
    sessions: [
      { day: 'Monday', time: '17:30–20:00' },
      { day: 'Thursday', time: '17:30–20:00' }
    ],
    bestFor: 'Busy schedules needing fewer meeting days',
    totalHours: 5,
    topics: ['Intensive funding readiness', 'Deep-dive document work', 'Advanced contract strategies']
  },
  {
    id: 'option_c',
    title: 'Option C – 2 Evenings + Saturday (In-Person)',
    sessions: [
      { day: 'Monday', time: '17:30–19:30' },
      { day: 'Thursday', time: '17:30–19:30' },
      { day: 'Saturday', time: '09:30–12:30', inPerson: true }
    ],
    bestFor: 'Those who want in-person collaboration',
    totalHours: 7,
    topics: ['Virtual kickoff', 'Midweek check-in', 'In-person workshop & networking']
  }
];

export default function IncubateHerSchedule() {
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState(null);

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

  const selectScheduleMutation = useMutation({
    mutationFn: async (optionId) => {
      if (enrollment) {
        return await base44.entities.ProgramEnrollment.update(enrollment.id, {
          selected_schedule_option: optionId
        });
      } else {
        return await base44.entities.ProgramEnrollment.create({
          cohort_id: cohort.id,
          participant_email: user.email,
          participant_name: user.full_name,
          selected_schedule_option: optionId,
          role: 'participant'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment']);
      toast.success('Schedule option saved!');
    }
  });

  const handleSelect = (optionId) => {
    setSelectedOption(optionId);
    selectScheduleMutation.mutate(optionId);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="Choose Your Schedule"
        subtitle="Select the option that works best for you"
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCHEDULE_OPTIONS.map((option) => {
            const isSelected = enrollment?.selected_schedule_option === option.id || selectedOption === option.id;
            
            return (
              <Card 
                key={option.id}
                className={`transition-all hover:shadow-lg ${isSelected ? 'ring-2' : ''}`}
                style={{ 
                  borderColor: isSelected ? BRAND_COLORS.eisGold : BRAND_COLORS.neutralGray,
                  ringColor: isSelected ? BRAND_COLORS.eisGold : 'transparent'
                }}
              >
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>
                      {option.title}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: BRAND_COLORS.neutralDark }}>
                      <strong>Best for:</strong> {option.bestFor}
                    </p>
                    <Badge style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                      <Clock className="w-3 h-3 mr-1" />
                      {option.totalHours} hours total
                    </Badge>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-2 mb-4">
                    {option.sessions.map((session, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: BRAND_COLORS.neutralLight }}>
                        <div>
                          <p className="font-medium text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                            {session.day}
                          </p>
                          <p className="text-xs" style={{ color: BRAND_COLORS.eisNavy }}>
                            {session.time}
                          </p>
                        </div>
                        {session.inPerson && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            In-Person
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Topics */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold mb-2" style={{ color: BRAND_COLORS.eisNavy }}>
                      CORE TOPICS
                    </p>
                    <ul className="space-y-1">
                      {option.topics.map((topic, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: BRAND_COLORS.neutralDark }}>
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.eisGold }} />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleSelect(option.id)}
                    className="w-full text-white"
                    disabled={isSelected}
                    style={{ 
                      backgroundColor: isSelected ? BRAND_COLORS.eisNavy : BRAND_COLORS.eisGold,
                      opacity: isSelected ? 0.8 : 1
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select This Option'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}