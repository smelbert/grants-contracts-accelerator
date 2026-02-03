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
import { Plus, Edit, Users, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProgramManagementPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    program_name: '',
    program_code: '',
    funder_organization: '',
    delivery_organization: '',
    description: '',
    is_active: true
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
        is_active: true
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
      is_active: program.is_active
    });
    setShowCreateModal(true);
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
                  <div className="pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{enrollmentCount} enrolled</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(program)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
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
                        is_active: true
                      });
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
    </div>
  );
}