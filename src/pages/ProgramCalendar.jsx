import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  FileText,
  Users,
  Filter,
  CheckCircle2,
  DollarSign,
  Ticket
} from 'lucide-react';
import { format, parseISO, isBefore, startOfDay, addDays } from 'date-fns';
import CalendarSyncButton from '@/components/events/CalendarSyncButton';
import { toast } from 'sonner';
import EventDetailView from '@/components/events/EventDetailView';

export default function ProgramCalendar() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('upcoming');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Platform Events
  const { data: platformEvents = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_date')
  });

  const { data: myRegistrations = [] } = useQuery({
    queryKey: ['my-registrations', user?.email],
    queryFn: () => base44.entities.EventRegistration.filter({ attendee_email: user.email }),
    enabled: !!user?.email
  });

  const registerMutation = useMutation({
    mutationFn: (event) => base44.entities.EventRegistration.create({
      event_id: event.id,
      attendee_email: user.email,
      attendee_name: user.full_name,
      registration_status: 'registered',
      payment_status: 'pending'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-registrations']);
      toast.success('Successfully registered!');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (regId) => base44.entities.EventRegistration.update(regId, { registration_status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-registrations']);
      toast.success('Registration cancelled');
    }
  });

  // Program data
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: () => base44.entities.ProgramEnrollment.filter({ participant_email: user.email }),
    enabled: !!user?.email
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['program-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations', user?.email],
    queryFn: () => base44.entities.ConsultationBooking.filter({ participant_email: user.email }),
    enabled: !!user?.email
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['user-assessments', user?.email],
    queryFn: () => base44.entities.ProgramAssessment.filter({ participant_email: user.email }),
    enabled: !!user?.email
  });

  const isRegistered = (eventId) =>
    myRegistrations.some(r => r.event_id === eventId && r.registration_status === 'registered');
  const getRegistration = (eventId) =>
    myRegistrations.find(r => r.event_id === eventId && r.registration_status === 'registered');

  // Merge all events
  const allEvents = useMemo(() => {
    const today = startOfDay(new Date());
    const events = [];

    // Platform events
    platformEvents.forEach(e => {
      if (!e.start_date) return;
      const date = new Date(e.start_date);
      events.push({
        id: `event-${e.id}`,
        rawId: e.id,
        type: 'event',
        subtype: e.event_type,
        title: e.event_name,
        date,
        description: e.description,
        location: e.location_type === 'virtual' ? 'Virtual' : e.location_details,
        meetingLink: e.meeting_url,
        isPast: isBefore(date, today),
        raw: e,
        isRegistered: isRegistered(e.id),
        registration: getRegistration(e.id),
        hasPaidTiers: e.ticket_tiers?.some(t => t.price > 0)
      });
    });

    // Program sessions
    enrollments.forEach(enrollment => {
      const cohort = cohorts.find(c => c.id === enrollment.cohort_id);
      if (!cohort?.session_days) return;
      cohort.session_days.forEach((session, idx) => {
        if (!session.date) return;
        const date = parseISO(session.date);
        events.push({
          id: `session-${cohort.id}-${idx}`,
          type: 'session',
          title: `${cohort.program_name} – Session ${idx + 1}`,
          date,
          time: session.time,
          location: session.location || 'TBD',
          meetingLink: session.meeting_link,
          description: session.sections?.map(s => s.title).join(', '),
          isPast: isBefore(date, today)
        });
      });
    });

    // Consultations
    consultations.forEach(c => {
      if (!c.scheduled_date) return;
      const date = parseISO(c.scheduled_date);
      events.push({
        id: `consultation-${c.id}`,
        type: 'consultation',
        title: 'One-on-One Consultation',
        date,
        time: c.scheduled_time || '',
        location: c.location || 'Virtual',
        meetingLink: c.meeting_link,
        description: c.notes,
        isPast: isBefore(date, today),
        status: c.status
      });
    });

    // Assessment deadlines
    assessments.forEach(a => {
      if (!a.due_date) return;
      const date = parseISO(a.due_date);
      events.push({
        id: `assessment-${a.id}`,
        type: 'assessment',
        title: `${a.assessment_type === 'pre' ? 'Pre' : 'Post'}-Assessment`,
        date,
        description: `Complete your ${a.assessment_type}-assessment`,
        isPast: isBefore(date, today),
        isCompleted: a.is_completed
      });
    });

    return events.sort((a, b) => a.date - b.date);
  }, [platformEvents, enrollments, cohorts, consultations, assessments, myRegistrations]);

  const filteredEvents = useMemo(() => {
    let list = allEvents;
    if (filterType !== 'all') list = list.filter(e => e.type === filterType);
    const today = startOfDay(new Date());
    if (viewMode === 'upcoming') list = list.filter(e => !e.isPast);
    else if (viewMode === 'past') list = list.filter(e => e.isPast);
    else if (viewMode === 'this-week') list = list.filter(e => !isBefore(e.date, today) && isBefore(e.date, addDays(today, 7)));
    return list;
  }, [allEvents, filterType, viewMode]);

  const typeConfig = {
    event:        { color: 'bg-[#143A50]/10 text-[#143A50] border-[#143A50]/20', label: 'Event', icon: <Ticket className="w-4 h-4" /> },
    session:      { color: 'bg-blue-100 text-blue-800 border-blue-200',           label: 'Session', icon: <Users className="w-4 h-4" /> },
    consultation: { color: 'bg-purple-100 text-purple-800 border-purple-200',     label: 'Consultation', icon: <Video className="w-4 h-4" /> },
    course:       { color: 'bg-green-100 text-green-800 border-green-200',         label: 'Course', icon: <FileText className="w-4 h-4" /> },
    assessment:   { color: 'bg-amber-100 text-amber-800 border-amber-200',         label: 'Assessment', icon: <CheckCircle2 className="w-4 h-4" /> },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#143A50] mb-1">Calendar</h1>
          <p className="text-slate-600">All your upcoming events, sessions, consultations, and deadlines in one place</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="event">Platform Events</SelectItem>
                  <SelectItem value="session">Program Sessions</SelectItem>
                  <SelectItem value="consultation">Consultations</SelectItem>
                  <SelectItem value="assessment">Assessments</SelectItem>
                </SelectContent>
              </Select>

              <span className="ml-auto text-sm text-slate-500">
                {filteredEvents.length} item{filteredEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        <div className="space-y-3">
          {filteredEvents.map(event => {
            const cfg = typeConfig[event.type] || typeConfig.event;
            return (
              <Card key={event.id} className={`border-l-4 ${event.isPast ? 'opacity-60' : ''}`}
                style={{ borderLeftColor: event.type === 'event' ? '#143A50' : undefined }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg border flex-shrink-0 ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{event.title}</h3>
                          <Badge variant="outline" className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                          {event.subtype && <Badge variant="outline" className="text-xs capitalize">{event.subtype}</Badge>}
                          {event.isPast && <Badge variant="outline" className="text-xs">Past</Badge>}
                          {event.isCompleted && <Badge className="bg-green-600 text-xs text-white">Completed</Badge>}
                          {event.isRegistered && <Badge className="bg-green-100 text-green-800 text-xs">Registered</Badge>}
                        </div>
                        <div className="space-y-1 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{format(event.date, 'EEEE, MMMM d, yyyy')}{event.time ? ` at ${event.time}` : ''}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.hasPaidTiers && (
                            <div className="flex items-center gap-2 text-amber-700">
                              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Paid event</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {event.meetingLink && !event.isPast && (
                        <Button size="sm" variant="outline" onClick={() => window.open(event.meetingLink, '_blank')}>
                          <Video className="w-3.5 h-3.5 mr-1" /> Join
                        </Button>
                      )}
                      {!event.isPast && (
                        <CalendarSyncButton
                          title={event.title}
                          date={event.date}
                          description={event.description}
                          location={event.location || event.meetingLink}
                        />
                      )}
                      {/* Register/Cancel for platform events */}
                      {event.type === 'event' && !event.isPast && (
                        event.isRegistered ? (
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => cancelMutation.mutate(event.registration.id)}>
                            Cancel
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58] text-white"
                            onClick={() => registerMutation.mutate(event.raw)}>
                            Register
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredEvents.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <CalendarIcon className="w-14 h-14 mx-auto mb-4 text-slate-200" />
                <p className="text-slate-500">No events found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}