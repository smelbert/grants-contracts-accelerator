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
    queryFn: () => base44.entities.ProgramCohort.filter({ program_code: 'incubateher' })
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['program-sessions'],
    queryFn: () => base44.entities.ProgramSession.list('-session_date')
  });

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

  const { data: attendance = [] } = useQuery({
    queryKey: ['my-attendance', enrollment?.id],
    queryFn: () => base44.entities.SessionAttendance.filter({
      enrollment_id: enrollment.id
    }),
    enabled: !!enrollment?.id
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProgramSession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['program-sessions']);
      toast.success('Session updated');
      setEditingSession(null);
    }
  });

  const handleVideoUpload = async (sessionId) => {
    if (!videoFile) return;

    setUploadingVideo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });
      
      await updateSessionMutation.mutateAsync({
        id: sessionId,
        data: { video_url: file_url }
      });
      
      setVideoFile(null);
      toast.success('Video uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const isAttended = (sessionId) => {
    return attendance.some(a => a.session_id === sessionId && a.attended);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || user?.role === 'coach';

  const groupSessionsByDay = (sessions) => {
    const grouped = {};
    sessions.forEach(session => {
      const date = new Date(session.session_date).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  const sessionsByDay = groupSessionsByDay(sessions);

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
            {isAdmin && <TabsTrigger value="manage">Manage Sessions</TabsTrigger>}
          </TabsList>

          <TabsContent value="schedule" className="mt-6">
            <div className="space-y-6">
              {Object.entries(sessionsByDay).map(([date, daySessions]) => {
                const primarySession = daySessions[0];
                const hasVideo = primarySession?.video_url;
                const sessionDate = new Date(primarySession.session_date);
                const isPast = sessionDate < new Date();
                
                return (
                  <Card key={date} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#AC1A5B] to-[#A65D40] text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl mb-2">{date}</CardTitle>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{sessionDate.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {primarySession.format === 'virtual' ? (
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
                            <div className="flex items-center gap-2">
                              <span>{primarySession.start_time}</span>
                            </div>
                          </div>
                        </div>
                        {isAttended(primarySession.id) && (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Attended
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Topics Covered */}
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Topics Covered</h3>
                          <div className="space-y-2">
                            {daySessions.map((session, idx) => (
                              <div key={session.id} className="flex items-start gap-3">
                                <Badge variant="outline" className="mt-1">
                                  {idx + 1}
                                </Badge>
                                <div className="flex-1">
                                  <p className="font-medium">{session.topic}</p>
                                  {session.description && (
                                    <p className="text-sm text-slate-600 mt-1">{session.description}</p>
                                  )}
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
                                src={primarySession.video_url}
                              >
                                Your browser does not support video playback.
                              </video>
                            </div>
                          </div>
                        )}

                        {/* Handouts & Resources */}
                        {primarySession.handouts?.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-lg mb-3">Handouts & Resources</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {primarySession.handouts.map((handout, idx) => (
                                <a
                                  key={idx}
                                  href={handout.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition"
                                >
                                  <FileText className="w-5 h-5 text-[#AC1A5B]" />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{handout.title}</p>
                                    <p className="text-xs text-slate-600">{handout.description}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Join/Access Info */}
                        {!isPast && primarySession.format === 'virtual' && primarySession.meeting_link && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <Button
                              className="w-full bg-[#AC1A5B] hover:bg-[#A65D40]"
                              onClick={() => window.open(primarySession.meeting_link, '_blank')}
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Virtual Session
                            </Button>
                          </div>
                        )}

                        {!isPast && primarySession.format === 'in_person' && primarySession.location && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                              <div>
                                <p className="font-semibold text-amber-900">In-Person Location</p>
                                <p className="text-sm text-amber-800 mt-1">{primarySession.location}</p>
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
          </TabsContent>

          <TabsContent value="recordings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.filter(s => s.video_url).map(session => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-slate-900 rounded-lg mb-3 relative overflow-hidden">
                      <video src={session.video_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-1">{session.topic}</h3>
                    <p className="text-sm text-slate-600">
                      {new Date(session.session_date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="manage" className="mt-6">
              <div className="space-y-4">
                {sessions.map(session => (
                  <Card key={session.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{session.topic}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Upload Session Video</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={(e) => setVideoFile(e.target.files[0])}
                            />
                            <Button
                              onClick={() => handleVideoUpload(session.id)}
                              disabled={!videoFile || uploadingVideo}
                              className="bg-[#AC1A5B] hover:bg-[#A65D40]"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingVideo ? 'Uploading...' : 'Upload'}
                            </Button>
                          </div>
                        </div>
                        {session.video_url && (
                          <div className="text-sm text-green-600 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Video uploaded
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}