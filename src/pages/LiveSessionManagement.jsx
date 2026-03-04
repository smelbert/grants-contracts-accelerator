import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, Users, Video, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const sessionTypes = {
  strategy_lab: 'Strategy Lab',
  simulation: 'Simulation',
  qa_calibration: 'QA Calibration',
  coaching_roleplay: 'Coaching Role-Play',
  budget_workshop: 'Budget Workshop',
  reviewer_scoring: 'Reviewer Scoring',
  discovery_debrief: 'Discovery Debrief',
  escalation_training: 'Escalation Training'
};

export default function LiveSessionManagementPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['liveSessions'],
    queryFn: () => base44.entities.LiveTrainingSession.list('-session_date')
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['trainingModules'],
    queryFn: () => base44.entities.CoachTraining.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LiveTrainingSession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['liveSessions']);
      toast.success('Session created');
      setShowDialog(false);
      setEditingSession(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LiveTrainingSession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['liveSessions']);
      toast.success('Session updated');
      setShowDialog(false);
      setEditingSession(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LiveTrainingSession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['liveSessions']);
      toast.success('Session deleted');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      session_title: formData.get('title'),
      session_type: formData.get('type'),
      level_required: formData.get('level'),
      session_date: new Date(formData.get('date') + 'T' + formData.get('time')).toISOString(),
      duration_minutes: parseInt(formData.get('duration')),
      facilitator_email: formData.get('facilitator'),
      max_participants: parseInt(formData.get('maxParticipants')),
      description: formData.get('description'),
      is_mandatory: formData.get('mandatory') === 'on'
    };

    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Live Training Sessions</h1>
            <p className="text-slate-600">Manage strategy labs, simulations, and workshops</p>
          </div>
          <Button onClick={() => { setEditingSession(null); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Session
          </Button>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Video className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-500">No live sessions yet</p>
            <p className="text-sm mt-1">Click "Create Session" to schedule your first live training session.</p>
          </div>
        )}

        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{session.session_title}</h3>
                      <Badge>{sessionTypes[session.session_type]}</Badge>
                      <Badge variant="outline">{session.level_required}</Badge>
                      {session.is_mandatory && <Badge className="bg-red-600">Required</Badge>}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(session.session_date), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.duration_minutes} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.participants?.length || 0} / {session.max_participants}
                      </div>
                    </div>

                    {session.description && (
                      <p className="text-sm text-slate-600">{session.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingSession(session); setShowDialog(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(session.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSession ? 'Edit' : 'Create'} Live Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Session Title</Label>
                <Input name="title" defaultValue={editingSession?.session_title} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Session Type</Label>
                  <Select name="type" defaultValue={editingSession?.session_type} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sessionTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level Required</Label>
                  <Select name="level" defaultValue={editingSession?.level_required} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="level-1">Level 1</SelectItem>
                      <SelectItem value="level-2">Level 2</SelectItem>
                      <SelectItem value="level-3">Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    name="date" 
                    defaultValue={editingSession ? format(new Date(editingSession.session_date), 'yyyy-MM-dd') : ''} 
                    required 
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input 
                    type="time" 
                    name="time" 
                    defaultValue={editingSession ? format(new Date(editingSession.session_date), 'HH:mm') : ''} 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" name="duration" defaultValue={editingSession?.duration_minutes || 60} required />
                </div>
                <div>
                  <Label>Max Participants</Label>
                  <Input type="number" name="maxParticipants" defaultValue={editingSession?.max_participants || 12} required />
                </div>
              </div>
              <div>
                <Label>Facilitator Email</Label>
                <Input type="email" name="facilitator" defaultValue={editingSession?.facilitator_email} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingSession?.description} rows={3} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="mandatory" defaultChecked={editingSession?.is_mandatory} />
                <Label>Mandatory for level progression</Label>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit">Save Session</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}