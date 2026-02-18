import React, { useState } from 'react';
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
import { Calendar, MapPin, Video, Users, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function EventManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'webinar',
    event_date: '',
    event_time: '',
    duration_minutes: 60,
    location_type: 'virtual',
    location_details: '',
    meeting_link: '',
    max_attendees: null,
    registration_required: true,
    is_public: true,
    tags: []
  });

  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-event_date')
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'webinar',
      event_date: '',
      event_time: '',
      duration_minutes: 60,
      location_type: 'virtual',
      location_details: '',
      meeting_link: '',
      max_attendees: null,
      registration_required: true,
      is_public: true,
      tags: []
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
                <Label>Event Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Event Date</Label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Event Time</Label>
                  <Input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Event Management</h1>
            <p className="text-slate-600">Create and manage platform events</p>
          </div>
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
              const isPast = new Date(event.event_date) < new Date();

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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                        <p className="text-slate-600 mb-4">{event.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{new Date(event.event_date).toLocaleDateString()}</span>
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
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteEventMutation.mutate(event.id)}
                        >
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
      </div>
    </div>
  );
}