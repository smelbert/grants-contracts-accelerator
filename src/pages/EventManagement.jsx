import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Video, Users, Plus, Edit, Trash2, Copy, Send, Clock, FileText, CheckCircle2, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, isBefore, startOfDay, addDays } from 'date-fns';
import RecurringEventForm from '@/components/events/RecurringEventForm';
import TicketingForm from '@/components/events/TicketingForm';
import PostEventSurveyForm from '@/components/events/PostEventSurveyForm';

export default function EventManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    event_name: '',
    description: '',
    event_type: 'webinar',
    start_date: '',
    end_date: '',
    timezone: 'America/New_York',
    location_type: 'virtual',
    location_details: '',
    meeting_url: '',
    max_attendees: null,
    registration_required: true,
    status: 'upcoming',
    is_recurring: false,
    recurrence_pattern: null,
    ticketing_enabled: false,
    ticket_tiers: [],
    post_event_survey: {
      enabled: false,
      questions: []
    },
    calendar_integration: {
      google_calendar_enabled: true,
      outlook_enabled: true
    }
  });

  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_date')
  });

  const { data: surveyResponses = [] } = useQuery({
    queryKey: ['event-survey-responses'],
    queryFn: () => base44.entities.EventSurveyResponse.list()
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations'],
    queryFn: () => base44.entities.EventRegistration.list()
  });

  const createEventMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event created successfully');
      setIsCreating(false);
      resetForm();
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event updated successfully');
      setEditingEvent(null);
      setIsCreating(false);
      resetForm();
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event deleted');
    }
  });

  const sendSurveyMutation = useMutation({
    mutationFn: async (eventId) => {
      const event = events.find(e => e.id === eventId);
      const attendees = registrations.filter(r => r.event_id === eventId && r.status === 'confirmed');
      
      for (const attendee of attendees) {
        await base44.integrations.Core.SendEmail({
          to: attendee.user_email,
          subject: `${event.post_event_survey.survey_title || 'Event Feedback'} - ${event.event_name}`,
          body: `Thank you for attending ${event.event_name}! We'd love to hear your feedback. Please complete our survey.`
        });
      }
    },
    onSuccess: () => {
      toast.success('Surveys sent to all attendees');
    }
  });

  const resetForm = () => {
    setFormData({
      event_name: '',
      description: '',
      event_type: 'webinar',
      start_date: '',
      end_date: '',
      timezone: 'America/New_York',
      location_type: 'virtual',
      location_details: '',
      meeting_url: '',
      max_attendees: null,
      registration_required: true,
      status: 'upcoming',
      is_recurring: false,
      recurrence_pattern: null,
      ticketing_enabled: false,
      ticket_tiers: [],
      post_event_survey: {
        enabled: false,
        questions: []
      },
      calendar_integration: {
        google_calendar_enabled: true,
        outlook_enabled: true
      }
    });
  };

  const handleSubmit = () => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createEventMutation.mutate(formData);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData(event);
    setIsCreating(true);
  };

  const getEventRegistrationCount = (eventId) => {
    return registrations.filter(r => r.event_id === eventId && r.status === 'confirmed').length;
  };

  // --- Program Calendar Data ---
  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['all-enrollments-admin'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['program-cohorts'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const { data: consultations = [] } = useQuery({
    queryKey: ['all-consultations-admin'],
    queryFn: () => base44.entities.ConsultationBooking.list()
  });

  const [calFilterType, setCalFilterType] = useState('all');
  const [calViewMode, setCalViewMode] = useState('upcoming');

  const programEvents = useMemo(() => {
    const evts = [];
    const today = startOfDay(new Date());
    const seen = new Set();

    cohorts.forEach(cohort => {
      if (!cohort.session_days) return;
      cohort.session_days.forEach((session, idx) => {
        const key = `session-${cohort.id}-${idx}`;
        if (seen.has(key)) return;
        seen.add(key);
        const sessionDate = session.date ? parseISO(session.date) : null;
        if (!sessionDate) return;
        evts.push({
          id: key,
          type: 'session',
          title: `${cohort.program_name} – Session ${idx + 1}`,
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

    consultations.forEach(c => {
      if (!c.scheduled_date) return;
      const d = parseISO(c.scheduled_date);
      evts.push({
        id: `consultation-${c.id}`,
        type: 'consultation',
        title: `Consultation – ${c.participant_email || 'Participant'}`,
        date: d,
        time: c.scheduled_time || 'TBD',
        location: c.location || 'Virtual',
        meetingLink: c.meeting_link,
        description: c.notes,
        isPast: isBefore(d, today),
        status: c.status
      });
    });

    return evts.sort((a, b) => a.date - b.date);
  }, [cohorts, consultations]);

  const filteredProgramEvents = useMemo(() => {
    let filtered = programEvents;
    if (calFilterType !== 'all') filtered = filtered.filter(e => e.type === calFilterType);
    const today = startOfDay(new Date());
    if (calViewMode === 'upcoming') filtered = filtered.filter(e => !e.isPast);
    else if (calViewMode === 'past') filtered = filtered.filter(e => e.isPast);
    else if (calViewMode === 'this-week') filtered = filtered.filter(e => !isBefore(e.date, today) && isBefore(e.date, addDays(today, 7)));
    return filtered;
  }, [programEvents, calFilterType, calViewMode]);

  const getProgramEventColor = (type) => {
    if (type === 'session') return 'bg-blue-100 text-blue-800';
    if (type === 'consultation') return 'bg-purple-100 text-purple-800';
    return 'bg-slate-100 text-slate-800';
  };

  const eventTypeColors = {
    webinar: 'bg-blue-100 text-blue-800',
    workshop: 'bg-green-100 text-green-800',
    meetup: 'bg-purple-100 text-purple-800',
    training: 'bg-amber-100 text-amber-800',
    conference: 'bg-pink-100 text-pink-800'
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h1>
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setEditingEvent(null);
              resetForm();
            }}>
              Cancel
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label>Event Name</Label>
                <Input
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  placeholder="Grant Writing Workshop"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Learn effective strategies for writing compelling grant proposals..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Type</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="meetup">Meetup</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Location Type</Label>
                  <Select
                    value={formData.location_type}
                    onValueChange={(value) => setFormData({ ...formData, location_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              {(formData.location_type === 'virtual' || formData.location_type === 'hybrid') && (
                <div>
                  <Label>Meeting Link</Label>
                  <Input
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              )}

              {(formData.location_type === 'in_person' || formData.location_type === 'hybrid') && (
                <div>
                  <Label>Location Details</Label>
                  <Textarea
                    value={formData.location_details}
                    onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                    placeholder="Address or venue details..."
                    rows={2}
                  />
                </div>
              )}

              <div>
                <Label>Max Attendees (leave empty for unlimited)</Label>
                <Input
                  type="number"
                  value={formData.max_attendees || ''}
                  onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="50"
                />
              </div>

              <RecurringEventForm formData={formData} setFormData={setFormData} />
              <TicketingForm formData={formData} setFormData={setFormData} />
              <PostEventSurveyForm formData={formData} setFormData={setFormData} />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setIsCreating(false);
                  setEditingEvent(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-[#143A50] hover:bg-[#1E4F58]">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Events & Program Calendar</h1>
          <p className="text-slate-600">Manage platform events and view program sessions</p>
        </div>

        <Tabs defaultValue="events">
          <TabsList className="mb-6">
            <TabsTrigger value="events">Event Management</TabsTrigger>
            <TabsTrigger value="calendar">Program Calendar</TabsTrigger>
          </TabsList>

          {/* ---- Event Management Tab ---- */}
          <TabsContent value="events">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsCreating(true)} className="bg-[#143A50] hover:bg-[#1E4F58]">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
            <div className="grid gap-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No events created yet</p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => {
                  const registrationCount = getEventRegistrationCount(event.id);
                  const isFull = event.max_attendees && registrationCount >= event.max_attendees;
                  const isPast = new Date(event.start_date) < new Date();
                  const surveyCount = surveyResponses.filter(s => s.event_id === event.id).length;

                  return (
                    <Card key={event.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={eventTypeColors[event.event_type]}>
                                {event.event_type}
                              </Badge>
                              {isPast && <Badge variant="outline">Past</Badge>}
                              {isFull && <Badge className="bg-red-100 text-red-800">Full</Badge>}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{event.event_name}</h3>
                            <p className="text-slate-600 mb-4">{event.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>{new Date(event.start_date).toLocaleDateString()}</span>
                              </div>
                              {event.location_type === 'virtual' && (
                                <div className="flex items-center gap-2">
                                  <Video className="w-4 h-4 text-slate-400" />
                                  <span>Virtual</span>
                                </div>
                              )}
                              {event.location_type === 'in_person' && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                  <span>In Person</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span>
                                  {registrationCount}
                                  {event.max_attendees ? `/${event.max_attendees}` : ''} attendees
                                </span>
                              </div>
                              {event.is_recurring && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">Recurring</Badge>
                                </div>
                              )}
                              {event.ticketing_enabled && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">Ticketing</Badge>
                                </div>
                              )}
                            </div>
                            {isPast && event.post_event_survey?.enabled && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">
                                    Survey responses: {surveyCount}/{registrationCount}
                                  </span>
                                  <Button size="sm" variant="outline" onClick={() => sendSurveyMutation.mutate(event.id)}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Survey
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteEventMutation.mutate(event.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* ---- Program Calendar Tab ---- */}
          <TabsContent value="calendar">
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <Select value={calViewMode} onValueChange={setCalViewMode}>
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
                  <Select value={calFilterType} onValueChange={setCalFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="session">Program Sessions</SelectItem>
                      <SelectItem value="consultation">Consultations</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-slate-600">
                      {filteredProgramEvents.length} event{filteredProgramEvents.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredProgramEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No events found. Try adjusting your filters.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredProgramEvents.map((event) => (
                  <Card key={event.id} className={event.isPast ? 'opacity-60' : ''}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Badge className={getProgramEventColor(event.type)}>{event.type}</Badge>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900">{event.title}</p>
                              {event.isPast && <Badge variant="outline" className="text-xs">Past</Badge>}
                            </div>
                            <div className="space-y-1 text-sm text-slate-600">
                              {event.date instanceof Date && !isNaN(event.date) && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{format(event.date, 'EEEE, MMMM d, yyyy')}</span>
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
                              {event.cohortName && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>{event.cohortName}</span>
                                </div>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                            )}
                          </div>
                        </div>
                        {event.meetingLink && (
                          <Button size="sm" variant="outline" onClick={() => window.open(event.meetingLink, '_blank')}>
                            <Video className="w-4 h-4 mr-2" />
                            Join
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}