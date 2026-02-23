import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Video, MapPin, Users, CheckCircle, FileText, Upload, Play } from 'lucide-react';
import { toast } from 'sonner';

const PROGRAM_SCHEDULE = [
  {
    date: 'Monday, March 2, 2026',
    time: '5:30–7:30 PM',
    duration: '2 Hours',
    format: 'Virtual – Google Meet',
    location: 'Google Meet',
    sessionTitle: 'Session 1: Funding Foundations & Readiness',
    topics: [
      {
        section: 'Program Orientation & Expectations',
        items: [
          'Completion requirements',
          'Consultation cap explanation',
          'Pre- & post-assessment overview',
          'How this series supports early-stage and growth-phase businesses'
        ]
      },
      {
        section: 'Understanding Funding Pathways',
        items: [
          'Grants vs. Proposals vs. Contracts',
          'Revenue vs. reimbursement models',
          'Public vs. private funding realities'
        ]
      },
      {
        section: 'Legal Structure & Organizational Readiness',
        items: [
          'Business structure eligibility (LLC, nonprofit, sole prop, etc.)',
          'Formation vs. operational readiness',
          'Required documentation fundamentals',
          'Compliance basics and common structural mistakes'
        ]
      },
      {
        section: 'Funding Readiness Reality Check',
        items: [
          'What "ready" actually means',
          'Identifying documentation gaps',
          'Capacity alignment',
          'When NOT to pursue funding'
        ]
      }
    ]
  },
  {
    date: 'Thursday, March 5, 2026',
    time: '5:30–7:30 PM',
    duration: '2 Hours',
    format: 'Virtual – Google Meet',
    location: 'Google Meet',
    sessionTitle: 'Session 2: Financial Systems & Funding Mechanics',
    topics: [
      {
        section: 'Financial Management & Budget Development',
        items: [
          'Basic financial systems for entrepreneurs',
          'Budget building fundamentals',
          'Cash flow awareness',
          'Indirect cost concepts (simplified)',
          'Common financial red flags'
        ]
      },
      {
        section: 'Grants, Proposals & RFP Fundamentals',
        items: [
          'How to find funding opportunities',
          'Reading guidelines correctly',
          'RFP structure overview',
          'Deliverables vs. measurable outcomes',
          'Avoiding common application mistakes'
        ]
      }
    ]
  },
  {
    date: 'Saturday, March 7, 2026',
    time: '9:00 AM–12:00 PM',
    duration: '3 Hours',
    format: 'In Person',
    location: 'Columbus Metropolitan Library – Shepard Location, Meeting Room 1',
    sessionTitle: 'Session 3: Application Strategy & Integration',
    topics: [
      {
        section: 'Grant Writing Fundamentals (Applied)',
        items: [
          'Narrative components',
          'Writing strong problem statements',
          'Goals & measurable outcomes',
          'Logic model basics (practical)',
          'Alignment language'
        ]
      },
      {
        section: 'RFPs & Contract Proposals in Practice',
        items: [
          'Competitive positioning',
          'Pricing considerations',
          'Capability statements',
          'Past performance documentation',
          'Evaluating bid feasibility'
        ]
      },
      {
        section: 'Funding Strategy & Sustainability',
        items: [
          'Diversified funding portfolios',
          'Contracts vs. grants in growth strategy',
          'Relationship building',
          'Understanding the grant lifecycle'
        ]
      },
      {
        section: 'Consultation Preparation Lab',
        items: [
          'What to bring to your 1:1',
          'Document checklist',
          'How to maximize advisory time',
          'Booking instructions'
        ]
      }
    ]
  }
];

export default function IncubateHerSchedule() {
  const [editingSession, setEditingSession] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['incubateher-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.filter({ program_code: 'incubateher_funding_readiness' })
  });

  const cohort = cohorts[0];
  const sessionDays = cohort?.session_days || [];

  const { data: enrollment } = useQuery({
    queryKey: ['my-enrollment', user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!user?.email
  });

  const updateCohortMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgramCohort.update(cohort.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['incubateher-cohorts']);
      toast.success('Session updated');
    }
  });

  const handleVideoUpload = async (dayIndex) => {
    if (!videoFile || !cohort) return;

    setUploadingVideo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });
      
      const updatedSessionDays = [...sessionDays];
      updatedSessionDays[dayIndex] = {
        ...updatedSessionDays[dayIndex],
        video_url: file_url
      };
      
      await updateCohortMutation.mutateAsync({
        session_days: updatedSessionDays
      });
      
      setVideoFile(null);
      toast.success('Video uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || Array.isArray(user?.role) && (user.role.includes('admin') || user.role.includes('coach'));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">IncubateHer Schedule</h1>
          <p className="text-slate-600">View sessions, watch recordings, and track attendance</p>
        </div>

        {/* Program Schedule Overview */}
        <Card className="mb-8 border-[#AC1A5B] bg-gradient-to-r from-[#AC1A5B]/5 to-[#E5C089]/5">
          <CardHeader>
            <CardTitle className="text-2xl text-[#143A50] flex items-center gap-2">
              📅 PROGRAM SCHEDULE OVERVIEW
            </CardTitle>
            <p className="text-slate-600 mt-2">
              The IncubateHer Funding Readiness Series is delivered across three structured sessions combining virtual instruction and in-person application.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {PROGRAM_SCHEDULE.map((session, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#143A50]">{session.date}</h3>
                    <p className="text-lg text-slate-700 mt-1">{session.time}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <Badge className="bg-[#E5C089] text-[#143A50]">
                        {session.duration}
                      </Badge>
                      <Badge variant="outline" className="border-[#AC1A5B] text-[#AC1A5B]">
                        {session.format}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 mb-4">
                  <strong>Location:</strong> {session.location}
                </p>

                <h4 className="font-semibold text-[#AC1A5B] mb-3 text-lg">
                  {session.sessionTitle}
                </h4>

                <div className="space-y-4">
                  {session.topics.map((topic, topicIdx) => (
                    <div key={topicIdx} className="pl-4 border-l-2 border-[#E5C089]">
                      <h5 className="font-semibold text-slate-900 mb-2">{topic.section}</h5>
                      <ul className="space-y-1">
                        {topic.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-[#E5C089] mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-[#143A50] text-white p-6 rounded-lg">
              <h4 className="text-lg font-bold mb-3">⏱ Program Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-[#E5C089] mb-1">Instructional Total: 7 Hours</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Monday: 2 Hours</li>
                    <li>• Thursday: 2 Hours</li>
                    <li>• Saturday: 3 Hours</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-[#E5C089] mb-1">Individual Consultations</p>
                  <p>45–60 Minutes (first 20 eligible participants)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Recordings Section */}
        {sessionDays.length > 0 && sessionDays.some(day => day.video_url) && (
          <div className="space-y-6">
            {sessionDays.filter(day => day.video_url).map((day, dayIndex) => {
              const sessionData = PROGRAM_SCHEDULE[dayIndex];
              
              return (
                <Card key={dayIndex} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{sessionData?.sessionTitle || day.date}</CardTitle>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{sessionData?.date || day.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            <span>Recording Available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Session Recording */}
                      <div>
                        <div className="bg-slate-900 rounded-lg overflow-hidden">
                          <video
                            controls
                            className="w-full"
                            src={day.video_url}
                          >
                            Your browser does not support video playback.
                          </video>
                        </div>
                      </div>

                      {/* Topics Covered - from original schedule */}
                      {sessionData?.topics && (
                        <div>
                          <h3 className="font-semibold text-[#AC1A5B] text-lg mb-3">Topics Covered</h3>
                          <div className="space-y-4">
                            {sessionData.topics.map((topic, topicIdx) => (
                              <div key={topicIdx} className="pl-4 border-l-2 border-[#E5C089]">
                                <h5 className="font-semibold text-slate-900 mb-2">{topic.section}</h5>
                                <ul className="space-y-1">
                                  {topic.items.map((item, itemIdx) => (
                                    <li key={itemIdx} className="text-sm text-slate-600 flex items-start gap-2">
                                      <span className="text-[#E5C089] mt-1">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Join/Access Info */}
                      {day.meeting_link && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <Button
                            className="w-full bg-[#AC1A5B] hover:bg-[#A65D40]"
                            onClick={() => window.open(day.meeting_link, '_blank')}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Virtual Session
                          </Button>
                        </div>
                      )}

                      {day.location && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-amber-900">In-Person Location</p>
                              <p className="text-sm text-amber-800 mt-1">{day.location}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}