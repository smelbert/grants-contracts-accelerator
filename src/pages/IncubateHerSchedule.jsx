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
    id: 'option_c',
    title: 'Two Evenings + Saturday Half-Day (Face-to-Face Option)',
    sessions: [
      { 
        day: 'Monday Evening', 
        time: '5:30 PM – 7:30 PM',
        topic: 'Funding Foundations',
        description: 'Grants vs. contracts; Funding mindset and readiness overview'
      },
      { 
        day: 'Thursday Evening', 
        time: '5:30 PM – 7:30 PM',
        topic: 'Documents & RFP Orientation',
        description: 'Core documents and systems; Budget basics; Preparing to evaluate opportunities'
      },
      { 
        day: 'Saturday (In-Person)', 
        time: '9:30 AM – 12:30 PM', 
        inPerson: true,
        topic: 'Integration & Application',
        description: 'Case examples and discussion; Small-group exercises; "Is this fundable yet?" readiness mapping; Q&A and next-step planning'
      }
    ],
    bestFor: 'Participants who want interactive in-person collaboration',
    totalHours: 7,
    topics: ['Funding Foundations', 'Documents & RFP Orientation', 'Integration & Application Workshop']
  }
];

export default function IncubateHerSchedule() {
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRedirecting, setIsRedirecting] = React.useState(false);

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

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
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

  // Redirect if already enrolled with a schedule selected
  React.useEffect(() => {
    if (enrollment?.selected_schedule_option && !isRedirecting) {
      setIsRedirecting(true);
      window.location.href = '/app/IncubateHerLearning';
    }
  }, [enrollment, isRedirecting]);

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
      toast.success('Schedule selected! Redirecting to Learning Hub...');
      setTimeout(() => {
        window.location.href = '/app/IncubateHerLearning';
      }, 1500);
    }
  });

  const handleSelect = (optionId) => {
    setSelectedOption(optionId);
    selectScheduleMutation.mutate(optionId);
  };

  // Show loading while checking enrollment
  if (enrollmentLoading || isRedirecting) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="Loading..." />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-slate-600">
            {isRedirecting ? 'Redirecting to Learning Hub...' : 'Checking your enrollment status...'}
          </p>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="Choose Your Schedule"
        subtitle="Select the option that works best for you"
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-center">
          {SCHEDULE_OPTIONS.map((option) => {
            const isSelected = enrollment?.selected_schedule_option === option.id || selectedOption === option.id;
            
            return (
              <Card 
                key={option.id}
                className={`transition-all hover:shadow-lg max-w-2xl w-full ${isSelected ? 'ring-2' : ''}`}
                style={{ 
                  borderColor: isSelected ? BRAND_COLORS.eisGold : BRAND_COLORS.neutralGray,
                  ringColor: isSelected ? BRAND_COLORS.eisGold : 'transparent'
                }}
              >
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: BRAND_COLORS.culRed }}>
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
                  <div className="space-y-3 mb-6">
                    {option.sessions.map((session, idx) => (
                      <div key={idx} className="p-4 rounded-lg border-2" style={{ backgroundColor: BRAND_COLORS.neutralLight, borderColor: BRAND_COLORS.eisGold }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-base" style={{ color: BRAND_COLORS.eisNavy }}>
                              {session.day}
                            </p>
                            <p className="text-sm font-medium" style={{ color: BRAND_COLORS.culRed }}>
                              {session.time}
                            </p>
                          </div>
                          {session.inPerson && (
                            <Badge style={{ backgroundColor: BRAND_COLORS.culRed, color: 'white' }}>
                              <MapPin className="w-3 h-3 mr-1" />
                              In-Person
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-semibold mb-1" style={{ color: BRAND_COLORS.eisNavy }}>
                            {session.topic}
                          </p>
                          <p className="text-xs" style={{ color: BRAND_COLORS.neutralDark }}>
                            {session.description}
                          </p>
                        </div>
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