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

        <Tabs defaultValue="schedule">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-6">
            <div className="space-y-6">
              {sessionDays.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No sessions scheduled yet</p>
                  </CardContent>
                </Card>
              ) : (
                sessionDays.map((day, dayIndex) => {
                  const hasVideo = day.video_url;
                  const isVirtual = day.time?.toLowerCase().includes('virtual');
                  
                  return (
                    <Card key={dayIndex} className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl mb-2">{day.date}</CardTitle>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{day.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isVirtual ? (
                                  <>
                                    <Video className="w-4 h-4" />
                                    <span>Virtual</span>
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="w-4 h-4" />
                                    <span>In Person</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="space-y-6">
                          {/* Topics Covered */}
                          <div>
                            <h3 className="font-semibold text-lg mb-3">Topics Covered</h3>
                            <div className="space-y-3">
                              {day.sections?.map((section, idx) => (
                                <div key={idx} className="border-l-4 border-[#E5C089] pl-4">
                                  <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="mt-1">
                                      {idx + 1}
                                    </Badge>
                                    <div className="flex-1">
                                      <p className="font-medium text-lg">{section.title}</p>
                                      <p className="text-sm text-slate-500 mb-2">{section.duration_minutes} minutes</p>
                                      {section.topics && (
                                        <ul className="space-y-1 mt-2">
                                          {section.topics.map((topic, topicIdx) => (
                                            <li key={topicIdx} className="text-sm text-slate-600 flex items-start gap-2">
                                              <span className="text-[#AC1A5B] mt-1">•</span>
                                              <span>{topic}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Video Recording */}
                          {hasVideo && (
                            <div>
                              <h3 className="font-semibold text-lg mb-3">Session Recording</h3>
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
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="recordings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessionDays.filter(day => day.video_url).map((day, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-slate-900 rounded-lg mb-3 relative overflow-hidden">
                      <video src={day.video_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-1">{day.date}</h3>
                    <p className="text-sm text-slate-600">{day.time}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}