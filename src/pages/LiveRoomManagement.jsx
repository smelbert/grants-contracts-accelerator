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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Video className="w-8 h-8 text-purple-600" />
            Live Rooms
          </h1>
          <p className="text-slate-600 mt-2">Interactive video sessions for your community</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Room
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold">{upcomingRooms.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Live Now</p>
                <p className="text-2xl font-bold">{rooms.filter(r => r.status === 'live').length}</p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Recordings</p>
                <p className="text-2xl font-bold">{rooms.filter(r => r.recording_url).length}</p>
              </div>
              <Square className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Rooms */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
        {upcomingRooms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No upcoming sessions scheduled</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingRooms.map(room => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(room)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteRoomMutation.mutate(room.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{room.room_name}</CardTitle>
                  <p className="text-sm text-slate-600">{room.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{format(new Date(room.scheduled_start), 'MMM d, yyyy • h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{room.participants?.length || 0} / {room.max_participants} participants</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline">{room.room_type}</Badge>
                      {room.recording_enabled && <Badge variant="outline">Recording</Badge>}
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
          <h2 className="text-xl font-semibold mb-4">Past Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastRooms.slice(0, 6).map(room => (
              <Card key={room.id}>
                <CardHeader>
                  <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
                  <CardTitle className="text-lg mt-2">{room.room_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600">{format(new Date(room.scheduled_start), 'MMM d, yyyy')}</p>
                    {room.recording_url && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={room.recording_url} target="_blank" rel="noopener noreferrer">
                          View Recording
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
            <DialogTitle>{editingRoom ? 'Edit Live Room' : 'Schedule Live Room'}</DialogTitle>
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
  );
}