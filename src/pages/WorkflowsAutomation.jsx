import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Plus, 
  Clock, 
  Mail, 
  Users, 
  FileText,
  Play,
  Pause,
  Edit,
  Trash2,
  Sparkles,
  CalendarClock,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowsAutomationPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'user_registration',
    actions: [],
    is_active: true
  });

  const queryClient = useQueryClient();

  // Fetch workflows (using EmailAutomation entity as a proxy for now)
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.EmailAutomation.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailAutomation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast.success('Workflow created successfully');
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailAutomation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast.success('Workflow updated successfully');
      setEditingWorkflow(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailAutomation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast.success('Workflow deleted');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.EmailAutomation.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: 'user_registration',
      actions: [],
      is_active: true
    });
  };

  const handleSubmit = () => {
    if (editingWorkflow) {
      updateMutation.mutate({ id: editingWorkflow.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (workflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      trigger_type: workflow.trigger_type,
      actions: workflow.actions || [],
      is_active: workflow.is_active
    });
    setIsCreateOpen(true);
  };

  const triggerTypes = [
    { value: 'user_registration', label: 'User Registration', icon: UserPlus },
    { value: 'enrollment_complete', label: 'Course Enrollment', icon: CheckCircle2 },
    { value: 'document_submitted', label: 'Document Submitted', icon: FileText },
    { value: 'event_registration', label: 'Event Registration', icon: CalendarClock },
    { value: 'weekly_digest', label: 'Weekly Digest', icon: Mail },
    { value: 'readiness_milestone', label: 'Readiness Milestone', icon: Sparkles },
  ];

  const getTriggerIcon = (type) => {
    const trigger = triggerTypes.find(t => t.value === type);
    return trigger?.icon || Zap;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Workflows & Automation</h1>
                <p className="text-slate-500">Automate repetitive tasks and streamline your operations</p>
              </div>
            </div>
            <Button 
              onClick={() => {
                resetForm();
                setEditingWorkflow(null);
                setIsCreateOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Workflows</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {workflows.filter(w => w.is_active).length}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Play className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Workflows</p>
                    <p className="text-2xl font-bold text-slate-900">{workflows.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Paused</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {workflows.filter(w => !w.is_active).length}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Pause className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Workflows List */}
        <div className="grid gap-4">
          {workflows.map((workflow, index) => {
            const TriggerIcon = getTriggerIcon(workflow.trigger_type);
            return (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${workflow.is_active ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-slate-300'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${workflow.is_active ? 'bg-purple-100' : 'bg-slate-100'}`}>
                          <TriggerIcon className={`w-5 h-5 ${workflow.is_active ? 'text-purple-600' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{workflow.name}</CardTitle>
                            {workflow.is_active ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                <Play className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-500">
                                <Pause className="w-3 h-3 mr-1" />
                                Paused
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{workflow.description}</CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Trigger: {triggerTypes.find(t => t.value === workflow.trigger_type)?.label || workflow.trigger_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={workflow.is_active}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: workflow.id, is_active: checked })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(workflow)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(workflow.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}

          {workflows.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No workflows created yet. Create your first automation to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Welcome New Users"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this workflow do?"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Trigger Event</Label>
                <Select 
                  value={formData.trigger_type} 
                  onValueChange={(v) => setFormData({ ...formData, trigger_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map(trigger => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">When should this workflow be triggered?</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-slate-500">Enable this workflow immediately</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}