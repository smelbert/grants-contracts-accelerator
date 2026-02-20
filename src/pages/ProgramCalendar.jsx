import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  FileText,
  Users,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format, parseISO, isBefore, isAfter, startOfDay, addDays } from 'date-fns';

export default function ProgramCalendar() {
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('upcoming');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['program-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ConsultationBooking.filter({
        participant_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: learningContent = [] } = useQuery({
    queryKey: ['learning-content-scheduled'],
    queryFn: async () => {
      const content = await base44.entities.LearningContent.list();
      return content.filter(c => c.scheduled_start_date);
    }
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['user-assessments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ProgramAssessment.filter({
        participant_email: user.email
      });
    },
    enabled: !!user?.email
  });

  // Compile all events
  const allEvents = useMemo(() => {
    const events = [];
    const today = startOfDay(new Date());

    // Program sessions from enrolled cohorts
    enrollments.forEach(enrollment => {
      const cohort = cohorts.find(c => c.id === enrollment.cohort_id);
      if (!cohort?.session_days) return;

      cohort.session_days.forEach((session, idx) => {
        const sessionDate = session.date ? parseISO(session.date) : null;
        if (!sessionDate) return;

        events.push({
          id: `session-${cohort.id}-${idx}`,
          type: 'session',
          title: `${cohort.program_name} - Session ${idx + 1}`,
          date: sessionDate,
          time: session.time,
          location: session.location || 'TBD',
          meetingLink: session.meeting_link,
          description: session.sections?.map(s => s.title).join(', '),
          isPast: isBefore(sessionDate, today),
          cohortName: cohort.program_name
        });
      });
    });

    // Consultations
    consultations.forEach(consultation => {
      if (!consultation.scheduled_date) return;
      const consultDate = parseISO(consultation.scheduled_date);

      events.push({
        id: `consultation-${consultation.id}`,
        type: 'consultation',
        title: 'One-on-One Consultation',
        date: consultDate,
        time: consultation.scheduled_time || 'TBD',
        location: consultation.location || 'Virtual',
        meetingLink: consultation.meeting_link,
        description: consultation.notes,
        isPast: isBefore(consultDate, today),
        status: consultation.status
      });
    });

    // Scheduled learning content
    learningContent.forEach(content => {
      if (!content.scheduled_start_date) return;
      const contentDate = parseISO(content.scheduled_start_date);

      events.push({
        id: `content-${content.id}`,
        type: 'course',
        title: content.title,
        date: contentDate,
        description: content.description,
        isPast: isBefore(contentDate, today),
        duration: content.duration_minutes
      });
    });

    // Assessment deadlines
    assessments.forEach(assessment => {
      if (!assessment.due_date) return;
      const dueDate = parseISO(assessment.due_date);

      events.push({
        id: `assessment-${assessment.id}`,
        type: 'assessment',
        title: `${assessment.assessment_type === 'pre' ? 'Pre' : 'Post'}-Assessment`,
        date: dueDate,
        description: `Complete your ${assessment.assessment_type}-assessment`,
        isPast: isBefore(dueDate, today),
        isCompleted: assessment.is_completed
      });
    });

    return events.sort((a, b) => a.date - b.date);
  }, [enrollments, cohorts, consultations, learningContent, assessments]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }

    // Filter by view mode
    const today = startOfDay(new Date());
    const nextWeek = addDays(today, 7);

    if (viewMode === 'upcoming') {
      filtered = filtered.filter(e => !e.isPast);
    } else if (viewMode === 'past') {
      filtered = filtered.filter(e => e.isPast);
    } else if (viewMode === 'this-week') {
      filtered = filtered.filter(e => 
        !isBefore(e.date, today) && isBefore(e.date, nextWeek)
      );
    }

    return filtered;
  }, [allEvents, filterType, viewMode]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'session': return <Users className="w-5 h-5" />;
      case 'consultation': return <Video className="w-5 h-5" />;
      case 'course': return <FileText className="w-5 h-5" />;
      case 'assessment': return <CheckCircle2 className="w-5 h-5" />;
      default: return <CalendarIcon className="w-5 h-5" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'session': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consultation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'course': return 'bg-green-100 text-green-800 border-green-200';
      case 'assessment': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const downloadICS = (event) => {
    if (!event.date) return;
    
    const startDate = format(event.date, "yyyyMMdd'T'HHmmss");
    const endDate = format(addDays(event.date, 0), "yyyyMMdd'T'HHmmss");
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EIS//Program Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@eis.org`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#143A50] mb-2">Program Calendar</h1>
          <p className="text-slate-600">View all your upcoming sessions, deadlines, and events</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="past">Past Events</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="session">Program Sessions</SelectItem>
                  <SelectItem value="consultation">Consultations</SelectItem>
                  <SelectItem value="course">Courses</SelectItem>
                  <SelectItem value="assessment">Assessments</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto">
                <Badge variant="outline" className="text-slate-600">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className={`border-l-4 ${event.isPast ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        {event.isPast && (
                          <Badge variant="outline" className="text-xs">Past</Badge>
                        )}
                        {event.isCompleted && (
                          <Badge className="bg-green-600 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-slate-600">
                       {event.date && event.date instanceof Date && !isNaN(event.date) && (
                         <div className="flex items-center gap-2">
                           <CalendarIcon className="w-4 h-4" />
                           <span className="font-medium">
                             {format(event.date, 'EEEE, MMMM d, yyyy')}
                           </span>
                         </div>
                       )}
                        
                        {event.time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.duration} minutes</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-slate-600 mt-2">{event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {event.meetingLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(event.meetingLink, '_blank')}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadICS(event)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {filteredEvents.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 mb-2">No events found</p>
                <p className="text-sm text-slate-400">
                  Try adjusting your filters to see more events
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}