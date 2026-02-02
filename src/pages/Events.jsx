import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Video, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import RSVPButton from '@/components/events/RSVPButton';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

export default function EventsPage() {
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myRegistrations = [] } = useQuery({
    queryKey: ['myUpcomingEvents', user?.email],
    queryFn: async () => {
      const regs = await base44.entities.EventRegistration.filter({
        attendee_email: user.email,
        registration_status: 'registered'
      });
      const eventIds = regs.map(r => r.event_id);
      const registeredEvents = events.filter(e => eventIds.includes(e.id));
      return registeredEvents.filter(e => new Date(e.start_date) > new Date());
    },
    enabled: !!user?.email && events.length > 0,
  });

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const liveEvents = events.filter(e => e.status === 'live');
  const canCreateEvents = hasPermission(user?.role, PERMISSIONS.CREATE_EVENTS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              Events
            </h1>
            <p className="text-slate-600 mt-2">Join workshops, webinars, and networking events</p>
          </div>
          {canCreateEvents && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="my-events">My Events ({myRegistrations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {liveEvents.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">🔴 Live Now</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {liveEvents.map(event => (
                    <EventCard key={event.id} event={event} userEmail={user?.email} isLive />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} userEmail={user?.email} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-events">
            {myRegistrations.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRegistrations.map(event => (
                  <EventCard key={event.id} event={event} userEmail={user?.email} isRegistered />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">You haven't registered for any events yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EventCard({ event, userEmail, isLive, isRegistered }) {
  return (
    <Card className={isLive ? 'border-red-500 border-2' : isRegistered ? 'border-emerald-500 border-2' : ''}>
      {event.cover_image_url && (
        <img src={event.cover_image_url} alt={event.event_name} className="w-full h-40 object-cover rounded-t-xl" />
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{event.event_name}</CardTitle>
          <div className="flex gap-2">
            {isLive && <Badge className="bg-red-500">Live</Badge>}
            {isRegistered && <Badge className="bg-emerald-500">Registered</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4" />
            {format(new Date(event.start_date), 'MMM d, yyyy h:mm a')}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            {event.location_type === 'virtual' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            {event.location_type === 'virtual' ? 'Virtual Event' : event.location_details}
          </div>
          {event.max_attendees && (
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4" />
              {event.total_registered || 0} / {event.max_attendees} registered
            </div>
          )}
        </div>
        {isLive && event.meeting_url ? (
          <Button className="w-full" asChild>
            <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
              Join Now
            </a>
          </Button>
        ) : (
          <RSVPButton event={event} userEmail={userEmail} />
        )}
      </CardContent>
    </Card>
  );
}