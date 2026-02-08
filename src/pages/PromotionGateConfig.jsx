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
import { Target, Plus, Edit, Trash2, Lock } from 'lucide-react';
import { toast } from 'sonner';

const gateTypes = {
  module_completion: 'Module Completion',
  assessment_pass: 'Assessment Pass',
  live_session_attendance: 'Live Session Attendance',
  clean_draft_count: 'Clean Draft Count',
  funded_proposal: 'Funded Proposal',
  mentorship_completion: 'Mentorship Completion',
  skill_validation: 'Skill Validation'
};

export default function PromotionGateConfigPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingGate, setEditingGate] = useState(null);
  const queryClient = useQueryClient();

  const { data: gates = [] } = useQuery({
    queryKey: ['promotionGates'],
    queryFn: () => base44.entities.LevelPromotionGate.list('display_order')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LevelPromotionGate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['promotionGates']);
      toast.success('Gate created');
      setShowDialog(false);
      setEditingGate(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LevelPromotionGate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['promotionGates']);
      toast.success('Gate updated');
      setShowDialog(false);
      setEditingGate(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LevelPromotionGate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['promotionGates']);
      toast.success('Gate deleted');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      gate_name: formData.get('name'),
      from_level: formData.get('fromLevel'),
      to_level: formData.get('toLevel'),
      gate_type: formData.get('type'),
      description: formData.get('description'),
      is_mandatory: formData.get('mandatory') === 'on',
      display_order: parseInt(formData.get('order')),
      requirement_details: {
        required_count: parseInt(formData.get('count')) || undefined
      }
    };

    if (editingGate) {
      updateMutation.mutate({ id: editingGate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const level1Gates = gates.filter(g => g.from_level === 'level-1');
  const level2Gates = gates.filter(g => g.from_level === 'level-2');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Promotion Gate Configuration</h1>
            <p className="text-slate-600">Define requirements for level advancement</p>
          </div>
          <Button onClick={() => { setEditingGate(null); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Gate
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Level 1 → Level 2 Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {level1Gates.map((gate) => (
                <div key={gate.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-slate-500" />
                        <h3 className="font-semibold text-slate-900">{gate.gate_name}</h3>
                        <Badge>{gateTypes[gate.gate_type]}</Badge>
                        {gate.is_mandatory && <Badge className="bg-red-600">Mandatory</Badge>}
                      </div>
                      {gate.description && (
                        <p className="text-sm text-slate-600">{gate.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingGate(gate); setShowDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(gate.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {level1Gates.length === 0 && (
                <p className="text-center text-slate-500 py-8">No gates configured</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Level 2 → Level 3 Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {level2Gates.map((gate) => (
                <div key={gate.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-slate-500" />
                        <h3 className="font-semibold text-slate-900">{gate.gate_name}</h3>
                        <Badge>{gateTypes[gate.gate_type]}</Badge>
                        {gate.is_mandatory && <Badge className="bg-red-600">Mandatory</Badge>}
                      </div>
                      {gate.description && (
                        <p className="text-sm text-slate-600">{gate.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingGate(gate); setShowDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(gate.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {level2Gates.length === 0 && (
                <p className="text-center text-slate-500 py-8">No gates configured</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGate ? 'Edit' : 'Add'} Promotion Gate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Gate Name</Label>
                <Input name="name" defaultValue={editingGate?.gate_name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Level</Label>
                  <Select name="fromLevel" defaultValue={editingGate?.from_level} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="level-1">Level 1</SelectItem>
                      <SelectItem value="level-2">Level 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Level</Label>
                  <Select name="toLevel" defaultValue={editingGate?.to_level} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="level-2">Level 2</SelectItem>
                      <SelectItem value="level-3">Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Gate Type</Label>
                <Select name="type" defaultValue={editingGate?.gate_type} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(gateTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Required Count</Label>
                <Input type="number" name="count" defaultValue={editingGate?.requirement_details?.required_count || 1} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editingGate?.description} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" name="order" defaultValue={editingGate?.display_order || 0} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" name="mandatory" defaultChecked={editingGate?.is_mandatory ?? true} />
                  <Label>Mandatory</Label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit">Save Gate</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}