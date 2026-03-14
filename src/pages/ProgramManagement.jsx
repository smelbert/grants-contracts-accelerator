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
import { Plus, Edit, Users, Trash2, UserPlus, Eye, Briefcase, AlertTriangle, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ── Cohort Management Tab ─────────────────────────────────────────────────────
function CohortManagement({ programs, enrollments, queryClient }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '', role: 'funder_viewer' });
  const [formData, setFormData] = useState({
    program_name: '', program_code: '', funder_organization: '',
    delivery_organization: '', description: '', is_active: true, facilitators: []
  });
  const [newFacilitator, setNewFacilitator] = useState({ name: '', email: '', role: 'co-facilitator' });

  const createProgramMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgramCohort.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-programs']);
      setShowCreateModal(false);
      resetForm();
      toast.success('Program created successfully');
    }
  });

  const updateProgramMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProgramCohort.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-programs']);
      setEditingProgram(null);
      setShowCreateModal(false);
      toast.success('Program updated successfully');
    }
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId) => {
      const enr = await base44.entities.ProgramEnrollment.filter({ cohort_id: programId });
      await Promise.all(enr.map(e => base44.entities.ProgramEnrollment.delete(e.id)));
      await base44.entities.ProgramCohort.delete(programId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-programs']);
      queryClient.invalidateQueries(['all-enrollments']);
      setDeleteConfirmation(null);
      toast.success('Program deleted');
    }
  });

  const addParticipantMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgramEnrollment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
      setNewParticipant({ name: '', email: '', role: 'funder_viewer' });
      toast.success('Participant added');
    }
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (id) => base44.entities.ProgramEnrollment.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['all-enrollments']); toast.success('Participant removed'); }
  });

  const resetForm = () => setFormData({ program_name: '', program_code: '', funder_organization: '', delivery_organization: '', description: '', is_active: true, facilitators: [] });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProgram) updateProgramMutation.mutate({ id: editingProgram.id, data: formData });
    else createProgramMutation.mutate(formData);
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({ program_name: program.program_name, program_code: program.program_code, funder_organization: program.funder_organization, delivery_organization: program.delivery_organization, description: program.description, is_active: program.is_active, facilitators: program.facilitators || [] });
    setShowCreateModal(true);
  };

  const addFacilitator = () => {
    if (!newFacilitator.name || !newFacilitator.email) { toast.error('Please enter both name and email'); return; }
    setFormData({ ...formData, facilitators: [...(formData.facilitators || []), { ...newFacilitator }] });
    setNewFacilitator({ name: '', email: '', role: 'co-facilitator' });
  };

  const getProgramParticipants = (programId) => enrollments?.filter(e => e.cohort_id === programId) || [];
  const getProgramEnrollmentCount = (programId) => enrollments?.filter(e => e.cohort_id === programId).length || 0;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { resetForm(); setEditingProgram(null); setShowCreateModal(true); }} className="bg-[#143A50]">
          <Plus className="w-4 h-4 mr-2" /> Create Program / Cohort
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs?.map((program) => {
          const count = getProgramEnrollmentCount(program.id);
          return (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{program.program_name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{program.program_code}</p>
                  </div>
                  <Badge variant={program.is_active ? 'default' : 'outline'}>{program.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div><p className="text-xs text-slate-500">Funded By</p><p className="font-medium">{program.funder_organization}</p></div>
                  <div><p className="text-xs text-slate-500">Delivered By</p><p className="font-medium">{program.delivery_organization}</p></div>
                  {program.description && <div><p className="text-xs text-slate-500">Description</p><p className="text-sm">{program.description}</p></div>}
                  {program.facilitators?.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-slate-500 mb-2">Facilitators</p>
                      <div className="flex flex-wrap gap-2">{program.facilitators.map((f, i) => <Badge key={i} variant="outline" className="text-xs">{f.name}</Badge>)}</div>
                    </div>
                  )}
                  <div className="pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-500" /><span className="text-sm text-slate-600">{count} enrolled</span></div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedProgram(program); setShowParticipantsModal(true); }}><Users className="w-3 h-3 mr-1" />Manage</Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(program)}><Edit className="w-3 h-3 mr-1" />Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteConfirmation({ program, enrollmentCount: count })} className="text-red-600 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button>
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
            <CardHeader><CardTitle>{editingProgram ? 'Edit Program' : 'Create New Program / Cohort'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Program Name *</Label><Input required value={formData.program_name} onChange={(e) => setFormData({ ...formData, program_name: e.target.value })} placeholder="e.g., IncubateHer – Funding Readiness" /></div>
                <div><Label>Program Code *</Label><Input required value={formData.program_code} onChange={(e) => setFormData({ ...formData, program_code: e.target.value })} placeholder="e.g., incubateher_2026" /><p className="text-xs text-slate-500 mt-1">Unique identifier (no spaces)</p></div>
                <div><Label>Funder Organization *</Label><Input required value={formData.funder_organization} onChange={(e) => setFormData({ ...formData, funder_organization: e.target.value })} placeholder="e.g., Columbus Urban League" /></div>
                <div><Label>Delivery Organization *</Label><Input required value={formData.delivery_organization} onChange={(e) => setFormData({ ...formData, delivery_organization: e.target.value })} placeholder="e.g., Elbert Innovative Solutions" /></div>
                <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div><Label>Program Active</Label><p className="text-xs text-slate-500">Enable enrollment and access</p></div>
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                </div>
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-semibold">Program Facilitators</Label>
                  {formData.facilitators?.length > 0 && (
                    <div className="space-y-2">
                      {formData.facilitators.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div><p className="font-medium text-sm">{f.name}</p><p className="text-xs text-slate-600">{f.email}</p><Badge variant="outline" className="mt-1 text-xs">{f.role}</Badge></div>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setFormData({ ...formData, facilitators: formData.facilitators.filter((_, idx) => idx !== i) })}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2"><UserPlus className="w-4 h-4" />Add Facilitator</Label>
                    <Input value={newFacilitator.name} onChange={(e) => setNewFacilitator({ ...newFacilitator, name: e.target.value })} placeholder="Full name" />
                    <Input value={newFacilitator.email} onChange={(e) => setNewFacilitator({ ...newFacilitator, email: e.target.value })} placeholder="email@example.com" type="email" />
                    <Select value={newFacilitator.role} onValueChange={(v) => setNewFacilitator({ ...newFacilitator, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead Facilitator</SelectItem>
                        <SelectItem value="co-facilitator">Co-Facilitator</SelectItem>
                        <SelectItem value="guest">Guest Speaker</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" size="sm" variant="outline" onClick={addFacilitator} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Facilitator</Button>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowCreateModal(false); setEditingProgram(null); resetForm(); }}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-[#143A50]" disabled={createProgramMutation.isPending || updateProgramMutation.isPending}>{editingProgram ? 'Update Program' : 'Create Program'}</Button>
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
              <CardTitle>Manage Participants — {selectedProgram.program_name}</CardTitle>
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
                    <div className="text-center py-8 text-slate-500"><Users className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No participants yet</p></div>
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
                            <Badge variant="outline" className="mt-1 text-xs">{enrollment.role.replace(/_/g, ' ')}</Badge>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeParticipantMutation.mutate(enrollment.id)} disabled={removeParticipantMutation.isPending}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="add" className="space-y-4">
                  <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <div><Label>Full Name *</Label><Input value={newParticipant.name} onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })} placeholder="Enter full name" /></div>
                    <div><Label>Email *</Label><Input value={newParticipant.email} onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })} placeholder="email@example.com" type="email" /></div>
                    <div>
                      <Label>Role *</Label>
                      <Select value={newParticipant.role} onValueChange={(v) => setNewParticipant({ ...newParticipant, role: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="participant">Participant</SelectItem>
                          <SelectItem value="funder_viewer">Funder Viewer (View Only)</SelectItem>
                          <SelectItem value="cul_observer">CUL Observer</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="facilitator">Facilitator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => { if (!newParticipant.name || !newParticipant.email) { toast.error('Please enter name and email'); return; } addParticipantMutation.mutate({ cohort_id: selectedProgram.id, participant_email: newParticipant.email, participant_name: newParticipant.name, role: newParticipant.role }); }} disabled={addParticipantMutation.isPending} className="w-full bg-[#143A50]"><UserPlus className="w-4 h-4 mr-2" />Add Participant</Button>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end pt-4 border-t mt-4">
                <Button variant="outline" onClick={() => { setShowParticipantsModal(false); setSelectedProgram(null); }}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmation && (
        <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" />Delete Program</DialogTitle></DialogHeader>
            <p>Are you sure you want to delete <strong>{deleteConfirmation.program.program_name}</strong>?</p>
            {deleteConfirmation.enrollmentCount > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800"><strong>Warning:</strong> This will also delete {deleteConfirmation.enrollmentCount} enrollment(s).</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteProgramMutation.mutate(deleteConfirmation.program.id)} disabled={deleteProgramMutation.isPending}>{deleteProgramMutation.isPending ? 'Deleting...' : 'Delete Program'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// ── Enrollment Master List Tab ────────────────────────────────────────────────
function EnrollmentMasterList({ enrollments, programs }) {
  const [filterCohort, setFilterCohort] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const programMap = Object.fromEntries((programs || []).map(p => [p.id, p.program_name]));

  const filtered = (enrollments || []).filter(e => {
    if (filterCohort !== 'all' && e.cohort_id !== filterCohort) return false;
    if (filterStatus !== 'all' && e.enrollment_status !== filterStatus) return false;
    if (search && !e.participant_name?.toLowerCase().includes(search.toLowerCase()) && !e.participant_email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Cohort', 'Role', 'Status', 'Pre-Assessment', 'Post-Assessment', 'Consultation', 'Attendance Complete', 'Program Completed', 'Enrolled Date'];
    const rows = filtered.map(e => [
      e.participant_name || '',
      e.participant_email || '',
      programMap[e.cohort_id] || e.cohort_id || '',
      e.role || '',
      e.enrollment_status || '',
      e.pre_assessment_completed ? 'Yes' : 'No',
      e.post_assessment_completed ? 'Yes' : 'No',
      e.consultation_completed ? 'Yes' : 'No',
      e.attendance_complete ? 'Yes' : 'No',
      e.program_completed ? 'Yes' : 'No',
      e.enrolled_date ? new Date(e.enrolled_date).toLocaleDateString() : ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'enrollment_master_list.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const statusIcon = (val) => val
    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
    : <XCircle className="w-4 h-4 text-slate-300" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <Input className="w-56" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={filterCohort} onValueChange={setFilterCohort}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All Cohorts" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cohorts</SelectItem>
              {(programs || []).map(p => <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
      </div>

      <div className="text-sm text-slate-500">{filtered.length} participant{filtered.length !== 1 ? 's' : ''}</div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Name / Email', 'Cohort', 'Role', 'Status', 'Pre', 'Post', 'Consult', 'Attend.', 'Completed'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-slate-400">No participants found</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{e.participant_name}</p>
                  <p className="text-xs text-slate-500">{e.participant_email}</p>
                </td>
                <td className="px-4 py-3 text-slate-700 text-xs">{programMap[e.cohort_id] || '—'}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{(e.role || '').replace(/_/g, ' ')}</Badge></td>
                <td className="px-4 py-3">
                  <Badge className={e.enrollment_status === 'active' ? 'bg-green-100 text-green-800' : e.enrollment_status === 'withdrawn' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}>
                    {e.enrollment_status || 'active'}
                  </Badge>
                </td>
                <td className="px-4 py-3">{statusIcon(e.pre_assessment_completed)}</td>
                <td className="px-4 py-3">{statusIcon(e.post_assessment_completed)}</td>
                <td className="px-4 py-3">{statusIcon(e.consultation_completed)}</td>
                <td className="px-4 py-3">{statusIcon(e.attendance_complete)}</td>
                <td className="px-4 py-3">{statusIcon(e.program_completed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Assessment Data Export Tab ────────────────────────────────────────────────
function AssessmentDataExport({ programs }) {
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['all-program-assessments'],
    queryFn: () => base44.entities.ProgramAssessment.list()
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  const enrollmentMap = Object.fromEntries(enrollments.map(e => [e.id, e]));
  const programMap = Object.fromEntries((programs || []).map(p => [p.id, p.program_name]));

  const filtered = assessments.filter(a => {
    if (a.is_draft) return false;
    if (selectedType !== 'all' && a.assessment_type !== selectedType) return false;
    if (selectedCohort !== 'all') {
      const enr = enrollmentMap[a.enrollment_id];
      if (!enr || enr.cohort_id !== selectedCohort) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Participant Name', 'Participant Email', 'Cohort', 'Assessment Type', 'Submission Date',
      'Grants/Contracts Score', 'Legal Readiness Score', 'Financial Readiness Score', 'Confidence Score', 'Total Score', 'Next Steps'];
    const rows = filtered.map(a => {
      const enr = enrollmentMap[a.enrollment_id] || {};
      return [
        enr.participant_name || '',
        a.participant_email || enr.participant_email || '',
        programMap[enr.cohort_id] || enr.cohort_id || '',
        a._form_type === 'evaluation' ? 'evaluation' : a.assessment_type || '',
        a.created_date ? new Date(a.created_date).toLocaleDateString() : '',
        a.grants_vs_contracts_score ?? '',
        a.legal_readiness_score ?? '',
        a.financial_readiness_score ?? '',
        a.confidence_score ?? '',
        a.total_score ?? '',
        a.next_steps || ''
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a2 = document.createElement('a'); a2.href = url; a2.download = `assessment_data_${selectedType}_${selectedCohort}.csv`; a2.click();
    URL.revokeObjectURL(url);
    toast.success('Assessment data exported');
  };

  // Aggregate stats
  const avgScore = (field) => {
    const vals = filtered.map(a => a[field]).filter(v => v != null && !isNaN(v));
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <Select value={selectedCohort} onValueChange={setSelectedCohort}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All Cohorts" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cohorts</SelectItem>
              {(programs || []).map(p => <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-44"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pre">Pre-Assessment</SelectItem>
              <SelectItem value="post">Post-Assessment</SelectItem>
              <SelectItem value="evaluation">Program Evaluation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCSV} className="bg-[#143A50]"><Download className="w-4 h-4 mr-2" />Export to CSV</Button>
      </div>

      {/* Aggregate Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Submissions', value: filtered.length },
          { label: 'Avg Confidence Score', value: avgScore('confidence_score') },
          { label: 'Avg Legal Readiness', value: avgScore('legal_readiness_score') },
          { label: 'Avg Financial Readiness', value: avgScore('financial_readiness_score') },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-[#143A50]">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Loading assessment data...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Participant', 'Cohort', 'Type', 'Date', 'Confidence', 'Legal', 'Financial', 'Total'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No assessment submissions found</td></tr>
              ) : filtered.map(a => {
                const enr = enrollmentMap[a.enrollment_id] || {};
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{enr.participant_name || '—'}</p>
                      <p className="text-xs text-slate-500">{a.participant_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{programMap[enr.cohort_id] || '—'}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{a._form_type === 'evaluation' ? 'Evaluation' : a.assessment_type === 'pre' ? 'Pre' : 'Post'}</Badge></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{a.created_date ? new Date(a.created_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-center">{a.confidence_score ?? '—'}</td>
                    <td className="px-4 py-3 text-center">{a.legal_readiness_score ?? '—'}</td>
                    <td className="px-4 py-3 text-center">{a.financial_readiness_score ?? '—'}</td>
                    <td className="px-4 py-3 text-center font-semibold">{a.total_score ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProgramManagementPage() {
  const queryClient = useQueryClient();

  const { data: programs } = useQuery({
    queryKey: ['all-programs'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const { data: enrollments } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.ProgramEnrollment.list()
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Program Management</h1>
        <p className="text-slate-600 mt-1">Manage cohorts, track enrollment, and export assessment data</p>
      </div>

      <Tabs defaultValue="cohorts">
        <TabsList className="mb-6">
          <TabsTrigger value="cohorts">Cohort Management</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollment Master List</TabsTrigger>
          <TabsTrigger value="assessments">Assessment Data Export</TabsTrigger>
        </TabsList>

        <TabsContent value="cohorts">
          <CohortManagement programs={programs} enrollments={enrollments} queryClient={queryClient} />
        </TabsContent>

        <TabsContent value="enrollments">
          <EnrollmentMasterList enrollments={enrollments} programs={programs} />
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentDataExport programs={programs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}