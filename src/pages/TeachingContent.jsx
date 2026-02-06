import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Calendar, Plus, Edit, Save, X, 
  Clock, Users, FileText, Loader2, StickyNote
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TeachingContentPage() {
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', session_id: '' });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['program-sessions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allSessions = await base44.entities.ProgramSession.list();
      return allSessions.filter(s => s.facilitator_email === user.email);
    },
    enabled: !!user?.email
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['teaching-notes', user?.email],
    queryFn: () => base44.entities.CoachTraining.filter({ 
      content_type: 'document',
      category: 'platform_tools',
      created_by: user?.email
    }),
    enabled: !!user?.email
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.CoachTraining.create({
      ...data,
      content_type: 'document',
      category: 'platform_tools',
      is_published: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teaching-notes'] });
      setEditingNote(null);
      setNoteForm({ title: '', content: '', session_id: '' });
      toast.success('Note saved');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CoachTraining.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teaching-notes'] });
      setEditingNote(null);
      setNoteForm({ title: '', content: '', session_id: '' });
      toast.success('Note updated');
    },
  });

  const upcomingSessions = sessions
    .filter(s => new Date(s.session_date) >= new Date())
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date));

  const pastSessions = sessions
    .filter(s => new Date(s.session_date) < new Date())
    .sort((a, b) => new Date(b.session_date) - new Date(a.session_date));

  const handleSaveNote = () => {
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote, data: { 
        title: noteForm.title,
        description: noteForm.content,
        tags: noteForm.session_id ? [noteForm.session_id] : []
      }});
    } else {
      createNoteMutation.mutate({ 
        title: noteForm.title,
        description: noteForm.content,
        tags: noteForm.session_id ? [noteForm.session_id] : []
      });
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note.id);
    setNoteForm({
      title: note.title,
      content: note.description || '',
      session_id: note.tags?.[0] || ''
    });
  };

  if (sessionsLoading || notesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E4F58]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Teaching & Content</h1>
          <p className="text-slate-600">Manage your classes, calendar, and teaching prep notes</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Classes I Teach */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1E4F58]" />
                Classes & Sessions
              </CardTitle>
              <CardDescription>Your scheduled teaching sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 && pastSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No classes scheduled yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Upcoming Sessions</h3>
                      <div className="space-y-3">
                        {upcomingSessions.map((session) => (
                          <div key={session.id} className="border border-[#1E4F58] bg-[#1E4F58]/5 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-[#143A50]">{session.session_title}</h4>
                                <p className="text-sm text-slate-600 mt-1">{session.description}</p>
                              </div>
                              <Badge className="bg-[#1E4F58]">Upcoming</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mt-3">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(session.session_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </div>
                              {session.duration_minutes && (
                                <span>{session.duration_minutes} min</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pastSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Past Sessions</h3>
                      <div className="space-y-2">
                        {pastSessions.slice(0, 3).map((session) => (
                          <div key={session.id} className="border border-slate-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-slate-900 text-sm">{session.session_title}</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(session.session_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <Badge variant="outline">Completed</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#143A50]">{upcomingSessions.length}</p>
                  <p className="text-sm text-slate-600">Upcoming Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1E4F58]">{pastSessions.length}</p>
                  <p className="text-sm text-slate-600">Sessions Taught</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#AC1A5B]">{notes.length}</p>
                  <p className="text-sm text-slate-600">Prep Notes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Teaching Prep Notes */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-[#E5C089]" />
                  Teaching Prep Notes
                </CardTitle>
                <CardDescription>Build notes to prepare for your sessions</CardDescription>
              </div>
              <Button onClick={() => {
                setEditingNote('new');
                setNoteForm({ title: '', content: '', session_id: '' });
              }} className="bg-[#1E4F58]">
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingNote && (
              <Card className="mb-6 border-2 border-[#1E4F58]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{editingNote === 'new' ? 'Create Note' : 'Edit Note'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setEditingNote(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Title</label>
                    <Input
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      placeholder="e.g., Module 3 Key Points"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Link to Session (optional)</label>
                    <select
                      value={noteForm.session_id}
                      onChange={(e) => setNoteForm({ ...noteForm, session_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="">No session</option>
                      {upcomingSessions.map(s => (
                        <option key={s.id} value={s.id}>{s.session_title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
                    <Textarea
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                      rows={8}
                      placeholder="Add your prep notes, key points, reminders..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNote} className="bg-[#1E4F58]">
                      <Save className="w-4 h-4 mr-2" />
                      Save Note
                    </Button>
                    <Button variant="outline" onClick={() => setEditingNote(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {notes.length === 0 && !editingNote ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">No prep notes yet</p>
                <Button onClick={() => {
                  setEditingNote('new');
                  setNoteForm({ title: '', content: '', session_id: '' });
                }} variant="outline">
                  Create Your First Note
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{note.title}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleEditNote(note)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 line-clamp-3">{note.description}</p>
                      {note.tags?.[0] && (
                        <Badge variant="outline" className="mt-3">
                          Linked Session
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}