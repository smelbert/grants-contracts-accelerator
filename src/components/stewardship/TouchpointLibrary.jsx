import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Heart, Gift, Target, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const TOUCHPOINT_CATEGORIES = {
  ways_to_thank: { label: 'Ways to Thank', icon: Heart, color: 'bg-red-500' },
  ways_to_recognize: { label: 'Ways to Recognize', icon: Gift, color: 'bg-amber-500' },
  gift_impact: { label: 'Gift Impact', icon: Target, color: 'bg-green-500' },
  mission_experience: { label: 'Mission Experience', icon: Sparkles, color: 'bg-blue-500' },
  community_experience: { label: 'Community Experience', icon: Users, color: 'bg-purple-500' },
  relationship_management: { label: 'Relationship Management', icon: Heart, color: 'bg-pink-500' }
};

export default function TouchpointLibrary({ touchpoints = [] }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTouchpoint, setEditingTouchpoint] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingTouchpoint) {
        return base44.entities.StewardshipTouchpoint.update(editingTouchpoint.id, data);
      }
      return base44.entities.StewardshipTouchpoint.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stewardship-touchpoints']);
      toast.success('Touchpoint saved');
      setShowDialog(false);
      setEditingTouchpoint(null);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMutation.mutate({
      touchpoint_name: formData.get('touchpoint_name'),
      category: formData.get('category'),
      description: formData.get('description'),
      timing: formData.get('timing'),
      responsible_role: formData.get('responsible_role'),
      frequency: formData.get('frequency'),
      template_content: formData.get('template_content'),
      is_active: true
    });
  };

  const filteredTouchpoints = selectedCategory === 'all'
    ? touchpoints
    : touchpoints.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Touchpoint Library</CardTitle>
            <Button onClick={() => { setEditingTouchpoint(null); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Touchpoint
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap mb-6">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All ({touchpoints.length})
            </Button>
            {Object.entries(TOUCHPOINT_CATEGORIES).map(([key, { label, icon: Icon, color }]) => (
              <Button
                key={key}
                size="sm"
                variant={selectedCategory === key ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(key)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {label} ({touchpoints.filter(t => t.category === key).length})
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTouchpoints.map((touchpoint) => {
              const category = TOUCHPOINT_CATEGORIES[touchpoint.category];
              const Icon = category?.icon || Heart;
              return (
                <Card key={touchpoint.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-500'} text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{touchpoint.touchpoint_name}</h4>
                          <Badge variant="outline" className="mt-1">
                            {category?.label}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingTouchpoint(touchpoint); setShowDialog(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    {touchpoint.description && (
                      <p className="text-sm text-slate-600 mb-2">{touchpoint.description}</p>
                    )}
                    <div className="text-xs text-slate-500 space-y-1">
                      {touchpoint.timing && <div>Timing: {touchpoint.timing}</div>}
                      {touchpoint.responsible_role && <div>Responsible: {touchpoint.responsible_role}</div>}
                      {touchpoint.frequency && <div>Frequency: {touchpoint.frequency}</div>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTouchpoint ? 'Edit' : 'Add'} Touchpoint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Touchpoint Name</Label>
              <Input
                name="touchpoint_name"
                defaultValue={editingTouchpoint?.touchpoint_name}
                placeholder="e.g., Thank you call from CEO"
                required
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                name="category"
                defaultValue={editingTouchpoint?.category}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                {Object.entries(TOUCHPOINT_CATEGORIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                defaultValue={editingTouchpoint?.description}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Timing</Label>
                <select
                  name="timing"
                  defaultValue={editingTouchpoint?.timing || 'custom'}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="immediate">Immediate</option>
                  <option value="within_24_hours">Within 24 Hours</option>
                  <option value="within_1_week">Within 1 Week</option>
                  <option value="within_1_month">Within 1 Month</option>
                  <option value="within_1_year">Within 1 Year</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Input
                  name="frequency"
                  defaultValue={editingTouchpoint?.frequency}
                  placeholder="e.g., 1x per year"
                />
              </div>
            </div>

            <div>
              <Label>Responsible Role</Label>
              <Input
                name="responsible_role"
                defaultValue={editingTouchpoint?.responsible_role}
                placeholder="e.g., Stewardship Staff"
              />
            </div>

            <div>
              <Label>Template/Notes</Label>
              <Textarea
                name="template_content"
                defaultValue={editingTouchpoint?.template_content}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Touchpoint'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}