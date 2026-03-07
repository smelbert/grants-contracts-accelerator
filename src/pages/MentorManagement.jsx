import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Users, Star, Calendar, Edit, Trash2, UserPlus, 
  CheckCircle2, XCircle, Search, Mail, Phone, Award, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const SPECIALTIES = [
  'grant_writing', 'contracts_rfp', 'financial_management', 'organizational_capacity',
  'fundraising_strategy', 'nonprofit_governance', 'business_planning', 'legal_compliance'
];

const SPECIALTY_LABELS = {
  grant_writing: 'Grant Writing',
  contracts_rfp: 'Contracts / RFP',
  financial_management: 'Financial Management',
  organizational_capacity: 'Org Capacity',
  fundraising_strategy: 'Fundraising Strategy',
  nonprofit_governance: 'Nonprofit Governance',
  business_planning: 'Business Planning',
  legal_compliance: 'Legal Compliance',
};

const emptyMentor = {
  mentor_name: '', mentor_email: '', bio: '', availability: '',
  max_mentees: 5, is_active: true, specialties: []
};

export default function MentorManagement() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('mentors');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const [mentorForm, setMentorForm] = useState(emptyMentor);
  const [selectedMentorForAssign, setSelectedMentorForAssign] = useState(null);
  const [selectedMenteeEmail, setSelectedMenteeEmail] = useState('');
  const [focusAreas, setFocusAreas] = useState('');

  const { data: mentors = [] } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => base44.entities.Mentor.list()
  });

  const { data: mentorships = [] } = useQuery({
    queryKey: ['mentorships'],
    queryFn: () => base44.entities.Mentorship.list('-created_date')
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments-mentor'],
    queryFn: () => base44.entities.ProgramEnrollment.filter({ role: 'participant' })
  });

  const { data: allSessions = [] } = useQuery({
    queryKey: ['all-sessions'],
    queryFn: () => base44.entities.MentorshipSession.list('-scheduled_date', 200)
  });

  const saveMentorMutation = useMutation({
    mutationFn: async (data) => {
      if (editingMentor?.id) return base44.entities.Mentor.update(editingMentor.id, data);
      return base44.entities.Mentor.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentors']);
      setShowMentorModal(false);
      setEditingMentor(null);
      setMentorForm(emptyMentor);
      toast.success(editingMentor ? 'Mentor updated' : 'Mentor added');
    }
  });

  const deleteMentorMutation = useMutation({
    mutationFn: (id) => base44.entities.Mentor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['mentors']);
      toast.success('Mentor removed');
    }
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const enrollment = enrollments.find(e => e.participant_email === selectedMenteeEmail);
      const mentorship = await base44.entities.Mentorship.create({
        mentor_email: selectedMentorForAssign.mentor_email,
        mentee_email: selectedMenteeEmail,
        mentee_name: enrollment?.participant_name || selectedMenteeEmail,
        program_context: enrollment?.cohort_id || 'general',
        focus_areas: focusAreas ? focusAreas.split(',').map(s => s.trim()).filter(Boolean) : [],
        status: 'active',
        start_date: new Date().toISOString()
      });
      await base44.entities.Mentor.update(selectedMentorForAssign.id, {
        current_mentees: (selectedMentorForAssign.current_mentees || 0) + 1
      });
      return mentorship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentorships', 'mentors']);
      setShowAssignModal(false);
      setSelectedMentorForAssign(null);
      setSelectedMenteeEmail('');
      setFocusAreas('');
      toast.success('Mentee assigned successfully');
    }
  });

  const unassignMutation = useMutation({
    mutationFn: async (mentorship) => {
      await base44.entities.Mentorship.update(mentorship.id, { status: 'completed', end_date: new Date().toISOString() });
      const mentor = mentors.find(m => m.mentor_email === mentorship.mentor_email);
      if (mentor) {
        await base44.entities.Mentor.update(mentor.id, {
          current_mentees: Math.max(0, (mentor.current_mentees || 1) - 1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentorships', 'mentors']);
      toast.success('Mentorship ended');
    }
  });

  const openEdit = (mentor) => {
    setEditingMentor(mentor);
    setMentorForm({ ...mentor });
    setShowMentorModal(true);
  };

  const toggleSpecialty = (s) => {
    setMentorForm(prev => ({
      ...prev,
      specialties: prev.specialties?.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...(prev.specialties || []), s]
    }));
  };

  const filteredMentors = mentors.filter(m =>
    !searchTerm ||
    m.mentor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.mentor_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMentorships = mentorships.filter(m => m.status === 'active');
  const unassignedEnrollments = enrollments.filter(e =>
    !mentorships.some(m => m.mentee_email === e.participant_email && m.status === 'active')
  );

  const getSessionsForMentorship = (id) => allSessions.filter(s => s.mentorship_id === id);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mentor Management</h1>
            <p className="text-slate-500 text-sm">Manage mentors, assign mentees, and track relationships</p>
          </div>
          <Button className="bg-[#143A50] hover:bg-[#1E4F58] gap-2" onClick={() => { setEditingMentor(null); setMentorForm(emptyMentor); setShowMentorModal(true); }}>
            <Plus className="w-4 h-4" /> Add Mentor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Mentors', value: mentors.length, color: 'text-[#143A50]', icon: Users },
            { label: 'Active Mentors', value: mentors.filter(m => m.is_active).length, color: 'text-emerald-700', icon: CheckCircle2 },
            { label: 'Active Pairs', value: activeMentorships.length, color: 'text-[#AC1A5B]', icon: Award },
            { label: 'Unassigned', value: unassignedEnrollments.length, color: 'text-amber-600', icon: UserPlus },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`w-8 h-8 ${color}`} />
                <div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="mentors">Mentors ({filteredMentors.length})</TabsTrigger>
            <TabsTrigger value="assignments">Active Assignments ({activeMentorships.length})</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned ({unassignedEnrollments.length})</TabsTrigger>
          </TabsList>

          {/* Mentors Tab */}
          <TabsContent value="mentors">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMentors.map(mentor => {
                const myMentorships = mentorships.filter(m => m.mentor_email === mentor.mentor_email && m.status === 'active');
                const availability = (mentor.max_mentees || 5) - (mentor.current_mentees || 0);
                return (
                  <Card key={mentor.id} className="border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#143A50] flex items-center justify-center text-white font-bold">
                            {mentor.mentor_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{mentor.mentor_name}</p>
                            <p className="text-xs text-slate-500">{mentor.mentor_email}</p>
                          </div>
                        </div>
                        <Badge className={mentor.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}>
                          {mentor.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {mentor.bio && <p className="text-xs text-slate-600 mb-3 line-clamp-2">{mentor.bio}</p>}

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Users className="w-3.5 h-3.5" />
                          <span>{myMentorships.length} / {mentor.max_mentees || 5} mentees</span>
                          <span className={`ml-auto font-medium ${availability > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {availability > 0 ? `${availability} open` : 'Full'}
                          </span>
                        </div>
                        {mentor.rating && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>{mentor.rating.toFixed(1)} avg rating</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{mentor.total_sessions_completed || 0} sessions completed</span>
                        </div>
                      </div>

                      {mentor.specialties?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {mentor.specialties.slice(0, 3).map(s => (
                            <Badge key={s} variant="outline" className="text-xs">{SPECIALTY_LABELS[s] || s}</Badge>
                          ))}
                          {mentor.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{mentor.specialties.length - 3}</Badge>
                          )}
                        </div>
                      )}

                      {myMentorships.length > 0 && (
                        <div className="mb-4 p-2 bg-slate-50 rounded-lg">
                          <p className="text-xs font-semibold text-slate-600 mb-1">Current Mentees:</p>
                          {myMentorships.map(m => (
                            <p key={m.id} className="text-xs text-slate-700">• {m.mentee_name}</p>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-[#143A50] hover:bg-[#1E4F58] text-xs"
                          disabled={availability <= 0 || !mentor.is_active}
                          onClick={() => { setSelectedMentorForAssign(mentor); setShowAssignModal(true); }}
                        >
                          <UserPlus className="w-3.5 h-3.5 mr-1" /> Assign Mentee
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEdit(mentor)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => deleteMentorMutation.mutate(mentor.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredMentors.length === 0 && (
                <div className="col-span-3 py-16 text-center text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p>No mentors yet. Add your first mentor above.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <div className="space-y-3">
              {activeMentorships.map(mentorship => {
                const mentor = mentors.find(m => m.mentor_email === mentorship.mentor_email);
                const sessions = getSessionsForMentorship(mentorship.id);
                const upcoming = sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduled_date) > new Date());
                const completed = sessions.filter(s => s.status === 'completed');
                return (
                  <Card key={mentorship.id} className="border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900">{mentorship.mentee_name}</span>
                              <span className="text-slate-400">→</span>
                              <span className="font-semibold text-[#143A50]">{mentor?.mentor_name || mentorship.mentor_email}</span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Started {mentorship.start_date ? format(new Date(mentorship.start_date), 'MMM d, yyyy') : 'N/A'}
                            </p>
                            {mentorship.focus_areas?.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {mentorship.focus_areas.map(a => (
                                  <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right text-xs text-slate-600">
                            <p>{upcoming.length} upcoming</p>
                            <p>{completed.length} completed</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-700 text-xs"
                            onClick={() => unassignMutation.mutate(mentorship)}
                          >
                            End
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {activeMentorships.length === 0 && (
                <div className="py-16 text-center text-slate-500">No active mentorship pairs yet.</div>
              )}
            </div>
          </TabsContent>

          {/* Unassigned */}
          <TabsContent value="unassigned">
            <div className="space-y-3">
              {unassignedEnrollments.map(e => (
                <Card key={e.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{e.participant_name}</p>
                      <p className="text-sm text-slate-500">{e.participant_email}</p>
                      {e.organization_name && <p className="text-xs text-slate-400">{e.organization_name}</p>}
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#143A50] hover:bg-[#1E4F58] text-xs gap-1"
                      onClick={() => {
                        setSelectedMenteeEmail(e.participant_email);
                        setTab('mentors');
                      }}
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Assign Mentor
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {unassignedEnrollments.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                  <p>All participants have been assigned a mentor!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Mentor Modal */}
      <Dialog open={showMentorModal} onOpenChange={setShowMentorModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMentor ? 'Edit Mentor' : 'Add New Mentor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={mentorForm.mentor_name} onChange={e => setMentorForm(p => ({ ...p, mentor_name: e.target.value }))} placeholder="Jane Smith" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input value={mentorForm.mentor_email} onChange={e => setMentorForm(p => ({ ...p, mentor_email: e.target.value }))} placeholder="jane@example.com" />
              </div>
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={mentorForm.bio} onChange={e => setMentorForm(p => ({ ...p, bio: e.target.value }))} placeholder="Background and expertise..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Availability</Label>
                <Input value={mentorForm.availability} onChange={e => setMentorForm(p => ({ ...p, availability: e.target.value }))} placeholder="e.g., Weekdays evenings" />
              </div>
              <div>
                <Label>Max Mentees</Label>
                <Input type="number" value={mentorForm.max_mentees} onChange={e => setMentorForm(p => ({ ...p, max_mentees: parseInt(e.target.value) }))} />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Specialties</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      mentorForm.specialties?.includes(s)
                        ? 'bg-[#143A50] text-white border-[#143A50]'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-[#143A50]'
                    }`}
                  >
                    {SPECIALTY_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={mentorForm.is_active} onChange={e => setMentorForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4" />
              <Label htmlFor="isActive">Active (can be assigned mentees)</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowMentorModal(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
                onClick={() => saveMentorMutation.mutate(mentorForm)}
                disabled={!mentorForm.mentor_name || !mentorForm.mentor_email || saveMentorMutation.isPending}
              >
                {saveMentorMutation.isPending ? 'Saving...' : (editingMentor ? 'Save Changes' : 'Add Mentor')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Mentee Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Mentee to {selectedMentorForAssign?.mentor_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Select Participant *</Label>
              <Select value={selectedMenteeEmail} onValueChange={setSelectedMenteeEmail}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a participant..." />
                </SelectTrigger>
                <SelectContent>
                  {enrollments.map(e => {
                    const alreadyAssigned = mentorships.some(m => m.mentee_email === e.participant_email && m.status === 'active');
                    return (
                      <SelectItem key={e.id} value={e.participant_email} disabled={alreadyAssigned}>
                        {e.participant_name} {alreadyAssigned ? '(already assigned)' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Focus Areas (comma separated, optional)</Label>
              <Input
                className="mt-1"
                value={focusAreas}
                onChange={e => setFocusAreas(e.target.value)}
                placeholder="e.g., grant writing, financial management"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]"
                onClick={() => assignMutation.mutate()}
                disabled={!selectedMenteeEmail || assignMutation.isPending}
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign Mentor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}