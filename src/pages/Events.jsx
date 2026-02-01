import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Video, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function EventsPage() {
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const liveEvents = events.filter(e => e.status === 'live');

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
          {user?.role === 'admin' && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {liveEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">🔴 Live Now</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {liveEvents.map(event => (
                <EventCard key={event.id} event={event} isLive />
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, isLive }) {
  return (
    <Card className={isLive ? 'border-red-500 border-2' : ''}>
      {event.cover_image_url && (
        <img src={event.cover_image_url} alt={event.event_name} className="w-full h-40 object-cover rounded-t-xl" />
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{event.event_name}</CardTitle>
          {isLive && <Badge className="bg-red-500">Live</Badge>}
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
              {event.total_registered} / {event.max_attendees} registered
            </div>
          )}
        </div>
        <Button className="w-full" variant={isLive ? 'default' : 'outline'}>
          {isLive ? 'Join Now' : 'Register'}
        </Button>
      </CardContent>
    </Card>
  );
}