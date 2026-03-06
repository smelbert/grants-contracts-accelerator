import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Video, Calendar, Users, Plus, Edit, Trash2, Play, Square } from 'lucide-react';
import { format } from 'date-fns';

export default function LiveRoomManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_name: '',
    description: '',
    room_type: 'webinar',
    scheduled_start: '',
    scheduled_end: '',
    max_participants: 100,
    meeting_url: '',
    recording_enabled: true,
    is_public: true,
    space_id: ''
  });

  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['liveRooms'],
    queryFn: () => base44.entities.LiveRoom.list('-scheduled_start')
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ['communitySpaces'],
    queryFn: () => base44.entities.CommunitySpace.list()
  });

  const createRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.LiveRoom.create({
      ...data,
      host_email: user?.email,
      host_name: user?.full_name
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveRooms'] });
      resetForm();
    }
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LiveRoom.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveRooms'] });
      resetForm();
    }
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id) => base44.entities.LiveRoom.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveRooms'] });
    }
  });

  const resetForm = () => {
    setFormData({
      room_name: '',
      description: '',
      room_type: 'webinar',
      scheduled_start: '',
      scheduled_end: '',
      max_participants: 100,
      meeting_url: '',
      recording_enabled: true,
      is_public: true,
      space_id: ''
    });
    setEditingRoom(null);
    setShowDialog(false);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData(room);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingRoom) {
      updateRoomMutation.mutate({ id: editingRoom.id, data: formData });
    } else {
      createRoomMutation.mutate(formData);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      live: 'bg-green-100 text-green-700',
      ended: 'bg-slate-100 text-slate-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.scheduled;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const upcomingRooms = rooms.filter(r => r.status === 'scheduled' || r.status === 'live');
  const pastRooms = rooms.filter(r => r.status === 'ended');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2.5 rounded-lg">
                <Video className="w-7 h-7 text-white" />
              </div>
              Live Rooms
            </h1>
            <p className="text-slate-600 mt-2">Create and manage interactive video sessions</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-purple-600 hover:bg-purple-700 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Room
          </Button>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{upcomingRooms.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Live Now</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{rooms.filter(r => r.status === 'live').length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Recordings</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{rooms.filter(r => r.recording_url).length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Square className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Rooms */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-purple-600 rounded"></div>
          Upcoming Sessions
        </h2>
        {upcomingRooms.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No upcoming sessions scheduled</p>
              <p className="text-sm text-slate-500 mt-1">Create your first live room to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingRooms.map(room => (
              <Card key={room.id} className="border-0 shadow-md hover:shadow-xl transition-all overflow-hidden">
                <div className={`h-1 ${room.status === 'live' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${getStatusColor(room.status)} capitalize font-medium`}>{room.status}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(room)} className="hover:bg-slate-100">
                        <Edit className="w-4 h-4 text-slate-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteRoomMutation.mutate(room.id)} className="hover:bg-red-50">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-slate-900">{room.room_name}</CardTitle>
                  {room.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{room.description}</p>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="font-medium">{format(new Date(room.scheduled_start), 'MMM d, yyyy • h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="font-medium">{room.participants?.length || 0} / {room.max_participants} participants</span>
                    </div>
                    <div className="flex gap-2 flex-wrap pt-2">
                      <Badge variant="outline" className="text-xs">{room.room_type}</Badge>
                      {room.recording_enabled && <Badge variant="outline" className="text-xs bg-purple-50">🎥 Recording</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Rooms */}
      {pastRooms.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-slate-400 rounded"></div>
            Past Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastRooms.slice(0, 6).map(room => (
              <Card key={room.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="h-1 bg-slate-400"></div>
                <CardHeader>
                  <Badge className={`${getStatusColor(room.status)} capitalize font-medium w-fit`}>{room.status}</Badge>
                  <CardTitle className="text-lg text-slate-900 mt-3">{room.room_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">{format(new Date(room.scheduled_start), 'MMM d, yyyy')}</p>
                    {room.recording_url && (
                      <Button variant="outline" size="sm" className="w-full hover:bg-purple-50 border-purple-200" asChild>
                        <a href={room.recording_url} target="_blank" rel="noopener noreferrer">
                          📹 View Recording
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingRoom ? 'Edit Live Room' : 'Schedule New Live Room'}</DialogTitle>
            <p className="text-sm text-slate-600 mt-1">{editingRoom ? 'Update session details' : 'Create a new interactive video session'}</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Room Name *</Label>
              <Input
                value={formData.room_name}
                onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                placeholder="Weekly Office Hours"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will be covered in this session?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Room Type</Label>
                <Select value={formData.room_type} onValueChange={(v) => setFormData({ ...formData, room_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="office_hours">Office Hours</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_end}
                  onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Meeting URL</Label>
              <Input
                value={formData.meeting_url}
                onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                placeholder="https://zoom.us/j/..."
              />
            </div>
            <div>
              <Label>Community Space (Optional)</Label>
              <Select value={formData.space_id} onValueChange={(v) => setFormData({ ...formData, space_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a space" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No space</SelectItem>
                  {spaces.map(space => (
                    <SelectItem key={space.id} value={space.id}>{space.space_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Recording</Label>
              <Switch
                checked={formData.recording_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, recording_enabled: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Public Session</Label>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.room_name || !formData.scheduled_start}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {editingRoom ? 'Update Room' : 'Schedule Room'}
              </Button>
            </div>
          </div>
          </DialogContent>
          </Dialog>
          </div>
          </div>
          );
          }