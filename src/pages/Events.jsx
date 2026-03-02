import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Video, Clock, Users, CheckCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import CalendarExportButtons from '@/components/events/CalendarExportButtons';
import CalendarSyncButton from '@/components/events/CalendarSyncButton';

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.filter({ is_public: true }, '-event_date')
  });

  const { data: myRegistrations = [] } = useQuery({
    queryKey: ['my-registrations', user?.email],
    queryFn: () => base44.entities.EventRegistration.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const registerMutation = useMutation({
    mutationFn: (eventId) => base44.entities.EventRegistration.create({
      event_id: eventId,
      user_email: user.email,
      user_name: user.full_name,
      status: 'confirmed'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-registrations']);
      toast.success('Successfully registered for event!');
    }
  });

  const cancelRegistrationMutation = useMutation({
    mutationFn: (registrationId) => base44.entities.EventRegistration.update(registrationId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-registrations']);
      toast.success('Registration cancelled');
    }
  });

  const isRegistered = (eventId) => {
    return myRegistrations.some(r => r.event_id === eventId && r.status === 'confirmed');
  };

  const getMyRegistration = (eventId) => {
    return myRegistrations.find(r => r.event_id === eventId && r.status === 'confirmed');
  };

  const upcomingEvents = events.filter(e => new Date(e.start_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.start_date) < new Date());
  const myEvents = events.filter(e => isRegistered(e.id));

  const eventTypeColors = {
    webinar: 'bg-blue-100 text-blue-800',
    workshop: 'bg-green-100 text-green-800',
    meetup: 'bg-purple-100 text-purple-800',
    training: 'bg-amber-100 text-amber-800',
    conference: 'bg-pink-100 text-pink-800'
  };

  const EventCard = ({ event }) => {
    const registered = isRegistered(event.id);
    const registration = getMyRegistration(event.id);
    const isPast = new Date(event.start_date) < new Date();
    const hasPaidTiers = event.ticket_tiers?.some(t => t.price > 0);

    return (
      <Card className="hover:shadow-lg transition">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className={eventTypeColors[event.event_type]}>
                {event.event_type}
              </Badge>
              {registered && <Badge className="ml-2 bg-green-100 text-green-800">Registered</Badge>}
              {isPast && <Badge variant="outline" className="ml-2">Past</Badge>}
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">{event.event_name}</h3>
          <p className="text-slate-600 mb-4 line-clamp-2">{event.description}</p>

          <div className="space-y-2 text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.start_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}</span>
            </div>
            {event.location_type === 'virtual' && (
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>Virtual Event</span>
              </div>
            )}
            {event.location_type === 'in_person' && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location_details?.split('\n')[0]}</span>
              </div>
            )}
            {event.is_recurring && (
              <div>
                <Badge variant="outline" className="text-xs">Recurring Event</Badge>
              </div>
            )}
            {hasPaidTiers && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Paid Event - Multiple tiers available</span>
              </div>
            )}
          </div>

          {!isPast && !registered && (
            <div className="mb-3">
              <CalendarExportButtons event={event} />
            </div>
          )}

          {!isPast && (
            <div>
              {registered ? (
                <div className="space-y-2">
                  {event.meeting_link && (
                    <Button 
                      className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
                      onClick={() => window.open(event.meeting_link, '_blank')}
                    >
                      Join Event
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => cancelRegistrationMutation.mutate(registration.id)}
                  >
                    Cancel Registration
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
                  onClick={() => registerMutation.mutate(event.id)}
                >
                  Register Now
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Events</h1>
          <p className="text-slate-600">Discover and register for upcoming events</p>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No upcoming events</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-events" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No registered events</p>
                  </CardContent>
                </Card>
              ) : (
                myEvents.map(event => <EventCard key={event.id} event={event} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No past events</p>
                  </CardContent>
                </Card>
              ) : (
                pastEvents.map(event => <EventCard key={event.id} event={event} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}