import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Video, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const sessionTypeLabels = {
  strategy_lab: 'Strategy Lab',
  simulation: 'Simulation',
  qa_calibration: 'QA Calibration',
  coaching_roleplay: 'Coaching Role-Play',
  budget_workshop: 'Budget Workshop',
  reviewer_scoring: 'Reviewer Scoring',
  discovery_debrief: 'Discovery Debrief',
  escalation_training: 'Escalation Training'
};

export default function LiveSessionsCalendar({ consultantEmail, currentLevel }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['liveSessions', currentLevel],
    queryFn: () => base44.entities.LiveTrainingSession.filter({ 
      level_required: currentLevel,
      session_date: { $gte: new Date().toISOString() }
    }),
    enabled: !!currentLevel
  });

  // Real-time subscription for live updates
  React.useEffect(() => {
    const unsubscribe = base44.entities.LiveTrainingSession.subscribe((event) => {
      queryClient.invalidateQueries(['liveSessions']);
      queryClient.invalidateQueries(['pastSessions']);
    });
    return unsubscribe;
  }, []);

  const { data: pastSessions = [] } = useQuery({
    queryKey: ['pastSessions', consultantEmail],
    queryFn: async () => {
      const allSessions = await base44.entities.LiveTrainingSession.list();
      return allSessions.filter(s => 
        new Date(s.session_date) < new Date() &&
        s.participants?.some(p => p.email === consultantEmail)
      );
    },
    enabled: !!consultantEmail
  });

  const registerMutation = useMutation({
    mutationFn: async (session) => {
      const currentParticipants = session.participants || [];
      const alreadyRegistered = currentParticipants.some(p => p.email === consultantEmail);
      
      if (alreadyRegistered) {
        throw new Error('Already registered');
      }

      if (currentParticipants.length >= session.max_participants) {
        throw new Error('Session is full');
      }

      const updatedParticipants = [
        ...currentParticipants,
        {
          email: consultantEmail,
          attendance_status: 'registered',
          participation_score: 0,
          notes: ''
        }
      ];

      return base44.entities.LiveTrainingSession.update(session.id, {
        participants: updatedParticipants
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['liveSessions']);
      toast.success('Successfully registered for session');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const isRegistered = (session) => {
    return session.participants?.some(p => p.email === consultantEmail);
  };

  const getAttendanceStatus = (session) => {
    const participant = session.participants?.find(p => p.email === consultantEmail);
    return participant?.attendance_status;
  };

  const upcomingSessions = sessions.sort((a, b) => 
    new Date(a.session_date) - new Date(b.session_date)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Live Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No upcoming sessions scheduled</p>
            </div>
          ) : (
            upcomingSessions.map((session) => {
              const registered = isRegistered(session);
              const spotsLeft = session.max_participants - (session.participants?.length || 0);
              
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border-2 ${
                    registered ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{session.session_title}</h3>
                        <Badge variant="outline">
                          {sessionTypeLabels[session.session_type]}
                        </Badge>
                        {session.is_mandatory && (
                          <Badge className="bg-red-600">Required</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(session.session_date), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(session.session_date), 'h:mm a')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {session.participants?.length || 0} / {session.max_participants}
                        </div>
                      </div>

                      {session.description && (
                        <p className="text-sm text-slate-600 mb-2">{session.description}</p>
                      )}

                      {session.learning_objectives && session.learning_objectives.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-slate-700 mb-1">Learning Objectives:</p>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {session.learning_objectives.map((obj, idx) => (
                              <li key={idx}>• {obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {registered ? (
                        <Badge className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Registered
                        </Badge>
                      ) : spotsLeft > 0 ? (
                        <Button 
                          size="sm" 
                          onClick={() => registerMutation.mutate(session)}
                          disabled={registerMutation.isPending}
                        >
                          Register
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          Full
                        </Badge>
                      )}
                      
                      {spotsLeft <= 3 && spotsLeft > 0 && !registered && (
                        <span className="text-xs text-amber-600">{spotsLeft} spots left</span>
                      )}
                    </div>
                  </div>

                  {session.session_materials_url && registered && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <a 
                        href={session.session_materials_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Session Materials →
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {pastSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Completed Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastSessions.map((session) => {
              const status = getAttendanceStatus(session);
              const participant = session.participants?.find(p => p.email === consultantEmail);
              
              return (
                <div key={session.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-900">{session.session_title}</p>
                        {status === 'attended' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : status === 'absent' ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-600">
                        {format(new Date(session.session_date), 'MMM d, yyyy')}
                      </p>
                      {participant?.participation_score > 0 && (
                        <p className="text-xs text-slate-600 mt-1">
                          Participation: {participant.participation_score}/5
                        </p>
                      )}
                    </div>
                    {session.recording_url && (
                      <a
                        href={session.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Watch Recording
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}