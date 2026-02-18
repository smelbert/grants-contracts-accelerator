import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Users, Settings, Trash2, UserPlus, Eye, Briefcase, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProgramManagementPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    role: 'funder_viewer'
  });
  const [formData, setFormData] = useState({
    program_name: '',
    program_code: '',
    funder_organization: '',
    delivery_organization: '',
    description: '',
    is_active: true,
    facilitators: []
  });
  const [newFacilitator, setNewFacilitator] = useState({
    name: '',
    email: '',
    role: 'co-facilitator'
  });

  const { data: programs } = useQuery({
    queryKey: ['all-programs'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const { data: enrollments } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const createProgramMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgramCohort.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-programs']);
      setShowCreateModal(false);
      setFormData({
        program_name: '',
        program_code: '',
        funder_organization: '',
        delivery_organization: '',
        description: '',
        is_active: true,
        facilitators: []
      });
      toast.success('Program created successfully');
    }
  });

  const updateProgramMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProgramCohort.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-programs']);
      setEditingProgram(null);
      toast.success('Program updated successfully');
    }
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId) => {
      // First delete all enrollments
      const enrollments = await base44.entities.ProgramEnrollment.filter({ cohort_id: programId });
      await Promise.all(enrollments.map(e => base44.entities.ProgramEnrollment.delete(e.id)));
      // Then delete the program
      await base44.entities.ProgramCohort.delete(programId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-programs']);
      queryClient.invalidateQueries(['all-enrollments']);
      setDeleteConfirmation(null);
      toast.success('Program deleted successfully');
    }
  });

  const addParticipantMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgramEnrollment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      setNewParticipant({ name: '', email: '', role: 'funder_viewer' });
      toast.success('Participant added successfully');
    }
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (id) => base44.entities.ProgramEnrollment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      toast.success('Participant removed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProgram) {
      updateProgramMutation.mutate({ id: editingProgram.id, data: formData });
    } else {
      createProgramMutation.mutate(formData);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      program_name: program.program_name,
      program_code: program.program_code,
      funder_organization: program.funder_organization,
      delivery_organization: program.delivery_organization,
      description: program.description,
      is_active: program.is_active,
      facilitators: program.facilitators || []
    });
    setShowCreateModal(true);
  };

  const addFacilitator = () => {
    if (!newFacilitator.name || !newFacilitator.email) {
      toast.error('Please enter both name and email');
      return;
    }
    setFormData({
      ...formData,
      facilitators: [...(formData.facilitators || []), { ...newFacilitator }]
    });
    setNewFacilitator({ name: '', email: '', role: 'co-facilitator' });
    toast.success('Facilitator added');
  };

  const removeFacilitator = (index) => {
    setFormData({
      ...formData,
      facilitators: formData.facilitators.filter((_, i) => i !== index)
    });
  };

  const handleManageParticipants = (program) => {
    setSelectedProgram(program);
    setShowParticipantsModal(true);
  };

  const handleAddParticipant = () => {
    if (!newParticipant.name || !newParticipant.email) {
      toast.error('Please enter both name and email');
      return;
    }
    addParticipantMutation.mutate({
      cohort_id: selectedProgram.id,
      participant_email: newParticipant.email,
      participant_name: newParticipant.name,
      role: newParticipant.role
    });
  };

  const getProgramParticipants = (programId) => {
    return enrollments?.filter(e => e.cohort_id === programId) || [];
  };

  const handleDeleteProgram = (program) => {
    const enrollmentCount = getProgramEnrollmentCount(program.id);
    setDeleteConfirmation({ program, enrollmentCount });
  };

  const getProgramEnrollmentCount = (programId) => {
    return enrollments?.filter(e => e.cohort_id === programId).length || 0;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Program Management</h1>
            <p className="text-slate-600 mt-1">Create and manage programs, cohorts, and enrollment workflows</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-[#143A50]">
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs?.map((program) => {
          const enrollmentCount = getProgramEnrollmentCount(program.id);
          return (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{program.program_name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{program.program_code}</p>
                  </div>
                  <Badge variant={program.is_active ? 'default' : 'outline'}>
                    {program.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Funded By</p>
                    <p className="font-medium">{program.funder_organization}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Delivered By</p>
                    <p className="font-medium">{program.delivery_organization}</p>
                  </div>
                  {program.description && (
                    <div>
                      <p className="text-xs text-slate-500">Description</p>
                      <p className="text-sm">{program.description}</p>
                    </div>
                  )}
                  {program.facilitators && program.facilitators.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-500 mb-2">Facilitators</p>
                      <div className="flex flex-wrap gap-2">
                        {program.facilitators.map((facilitator, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {facilitator.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{enrollmentCount} enrolled</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleManageParticipants(program)}>
                        <Users className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(program)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteProgram(program)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingProgram ? 'Edit Program' : 'Create New Program'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Program Name *</Label>
                  <Input
                    required
                    value={formData.program_name}
                    onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                    placeholder="e.g., IncubateHer – Funding Readiness"
                  />
                </div>
                <div>
                  <Label>Program Code *</Label>
                  <Input
                    required
                    value={formData.program_code}
                    onChange={(e) => setFormData({ ...formData, program_code: e.target.value })}
                    placeholder="e.g., incubateher_funding_readiness"
                  />
                  <p className="text-xs text-slate-500 mt-1">Unique identifier (no spaces, use underscores)</p>
                </div>
                <div>
                  <Label>Funder Organization *</Label>
                  <Input
                    required
                    value={formData.funder_organization}
                    onChange={(e) => setFormData({ ...formData, funder_organization: e.target.value })}
                    placeholder="e.g., Columbus Urban League"
                  />
                </div>
                <div>
                  <Label>Delivery Organization *</Label>
                  <Input
                    required
                    value={formData.delivery_organization}
                    onChange={(e) => setFormData({ ...formData, delivery_organization: e.target.value })}
                    placeholder="e.g., Elbert Innovative Solutions"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Brief description of the program..."
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label>Program Active</Label>
                    <p className="text-xs text-slate-500">Enable enrollment and access</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
                
                {/* Facilitators Section */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-semibold">Program Facilitators</Label>
                  
                  {/* Existing Facilitators */}
                  {formData.facilitators?.length > 0 && (
                    <div className="space-y-2">
                      {formData.facilitators.map((facilitator, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{facilitator.name}</p>
                            <p className="text-xs text-slate-600">{facilitator.email}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {facilitator.role}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFacilitator(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add New Facilitator */}
                  <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Add Facilitator
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={newFacilitator.name}
                          onChange={(e) => setNewFacilitator({ ...newFacilitator, name: e.target.value })}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          value={newFacilitator.email}
                          onChange={(e) => setNewFacilitator({ ...newFacilitator, email: e.target.value })}
                          placeholder="email@example.com"
                          type="email"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Role</Label>
                        <Select
                          value={newFacilitator.role}
                          onValueChange={(value) => setNewFacilitator({ ...newFacilitator, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead">Lead Facilitator</SelectItem>
                            <SelectItem value="co-facilitator">Co-Facilitator</SelectItem>
                            <SelectItem value="guest">Guest Speaker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addFacilitator}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Facilitator
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingProgram(null);
                      setFormData({
                        program_name: '',
                        program_code: '',
                        funder_organization: '',
                        delivery_organization: '',
                        description: '',
                        is_active: true,
                        facilitators: []
                      });
                      setNewFacilitator({ name: '', email: '', role: 'co-facilitator' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#143A50]"
                    disabled={createProgramMutation.isPending || updateProgramMutation.isPending}
                  >
                    {editingProgram ? 'Update Program' : 'Create Program'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manage Participants Modal */}
      {showParticipantsModal && selectedProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Manage Participants - {selectedProgram.program_name}</CardTitle>
              <p className="text-sm text-slate-600">Add viewers, contractors, and other participants</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="participants" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="participants">All Participants</TabsTrigger>
                  <TabsTrigger value="add">Add Participant</TabsTrigger>
                </TabsList>

                <TabsContent value="participants" className="space-y-3">
                  {getProgramParticipants(selectedProgram.id).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No participants added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getProgramParticipants(selectedProgram.id).map((enrollment) => (
                        <div key={enrollment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{enrollment.participant_name}</p>
                              {enrollment.role === 'funder_viewer' && <Eye className="w-3 h-3 text-blue-500" />}
                              {enrollment.role === 'contractor' && <Briefcase className="w-3 h-3 text-purple-500" />}
                              {enrollment.role === 'cul_observer' && <Eye className="w-3 h-3 text-green-500" />}
                            </div>
                            <p className="text-xs text-slate-600">{enrollment.participant_email}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {enrollment.role.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeParticipantMutation.mutate(enrollment.id)}
                            disabled={removeParticipantMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="add" className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        value={newParticipant.email}
                        onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                        placeholder="email@example.com"
                        type="email"
                      />
                    </div>
                    <div>
                      <Label>Role *</Label>
                      <Select
                        value={newParticipant.role}
                        onValueChange={(value) => setNewParticipant({ ...newParticipant, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="participant">Participant</SelectItem>
                          <SelectItem value="funder_viewer">Funder Viewer (View Only)</SelectItem>
                          <SelectItem value="cul_observer">CUL Observer</SelectItem>
                          <SelectItem value="contractor">Contractor (Provides Content)</SelectItem>
                          <SelectItem value="facilitator">Facilitator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">
                        {newParticipant.role === 'funder_viewer' && 'Can view program content but not participate'}
                        {newParticipant.role === 'contractor' && 'Provides course content and resources'}
                        {newParticipant.role === 'cul_observer' && 'Can participate without completion requirements'}
                        {newParticipant.role === 'participant' && 'Full program participant'}
                      </p>
                    </div>
                    <Button
                      onClick={handleAddParticipant}
                      disabled={addParticipantMutation.isPending}
                      className="w-full bg-[#143A50]"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Participant
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowParticipantsModal(false);
                    setSelectedProgram(null);
                    setNewParticipant({ name: '', email: '', role: 'funder_viewer' });
                  }}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Delete Program
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p>Are you sure you want to delete <strong>{deleteConfirmation.program.program_name}</strong>?</p>
              {deleteConfirmation.enrollmentCount > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This program has {deleteConfirmation.enrollmentCount} enrolled participant(s). 
                    All enrollments will be permanently deleted.
                  </p>
                </div>
              )}
              <p className="text-sm text-slate-600">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteProgramMutation.mutate(deleteConfirmation.program.id)}
                disabled={deleteProgramMutation.isPending}
              >
                {deleteProgramMutation.isPending ? 'Deleting...' : 'Delete Program'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}