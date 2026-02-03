import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Star, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MentorManagementPage() {
  const queryClient = useQueryClient();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedMentee, setSelectedMentee] = useState('');

  const { data: mentors } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => base44.entities.Mentor.list()
  });

  const { data: mentorships } = useQuery({
    queryKey: ['mentorships'],
    queryFn: () => base44.entities.Mentorship.list()
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const assignMentorMutation = useMutation({
    mutationFn: async (data) => {
      const mentorship = await base44.entities.Mentorship.create(data);
      await base44.entities.Mentor.update(selectedMentor.id, {
        current_mentees: (selectedMentor.current_mentees || 0) + 1
      });
      return mentorship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentorships']);
      queryClient.invalidateQueries(['mentors']);
      setShowAssignModal(false);
      setSelectedMentor(null);
      setSelectedMentee('');
      toast.success('Mentor assigned successfully');
    }
  });

  const handleAssign = () => {
    if (!selectedMentor || !selectedMentee) return;

    const menteeUser = users?.find(u => u.email === selectedMentee);
    const enrollment = enrollments?.find(e => e.participant_email === selectedMentee);

    assignMentorMutation.mutate({
      mentor_email: selectedMentor.mentor_email,
      mentee_email: selectedMentee,
      mentee_name: menteeUser?.full_name || selectedMentee,
      program_context: enrollment?.cohort_id || 'general',
      status: 'active',
      start_date: new Date().toISOString()
    });
  };

  const getMentorMentees = (mentorEmail) => {
    return mentorships?.filter(m => m.mentor_email === mentorEmail && m.status === 'active') || [];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mentor Management</h1>
        <p className="text-slate-600 mt-1">Manage mentors and assign them to program participants</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {mentors?.map((mentor) => {
          const activeMentees = getMentorMentees(mentor.mentor_email);
          const availability = (mentor.max_mentees || 5) - (mentor.current_mentees || 0);

          return (
            <Card key={mentor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{mentor.mentor_name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{mentor.mentor_email}</p>
                  </div>
                  <Badge variant={mentor.is_active ? 'default' : 'outline'}>
                    {mentor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{mentor.current_mentees || 0} / {mentor.max_mentees || 5} mentees</span>
                  </div>

                  {mentor.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{mentor.rating.toFixed(1)} rating</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{mentor.total_sessions_completed || 0} sessions</span>
                  </div>

                  {mentor.specialties && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mentor.specialties.slice(0, 3).map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    className="w-full mt-4"
                    disabled={availability <= 0}
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setShowAssignModal(true);
                    }}
                  >
                    Assign Mentee
                  </Button>

                  {activeMentees.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-slate-600 mb-2">Current Mentees:</p>
                      <div className="space-y-1">
                        {activeMentees.map((m) => (
                          <p key={m.id} className="text-xs text-slate-600">{m.mentee_name}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assign Mentee Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Mentee to {selectedMentor?.mentor_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Participant</Label>
              <Select value={selectedMentee} onValueChange={setSelectedMentee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a participant..." />
                </SelectTrigger>
                <SelectContent>
                  {enrollments?.map((enrollment) => {
                    const alreadyAssigned = mentorships?.some(
                      m => m.mentee_email === enrollment.participant_email && m.status === 'active'
                    );
                    return (
                      <SelectItem
                        key={enrollment.id}
                        value={enrollment.participant_email}
                        disabled={alreadyAssigned}
                      >
                        {enrollment.participant_name} {alreadyAssigned && '(Already assigned)'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#143A50]"
                onClick={handleAssign}
                disabled={!selectedMentee}
              >
                Assign Mentor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}