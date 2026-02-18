import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, BookOpen, Award, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LearningPathManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const [formData, setFormData] = useState({
    path_name: '',
    description: '',
    skill_track: 'grant_writing_mastery',
    difficulty_level: 'beginner',
    estimated_hours: 0,
    module_sequence: [],
    completion_badge: '',
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: paths = [], isLoading } = useQuery({
    queryKey: ['curated-paths-admin'],
    queryFn: () => base44.entities.CuratedPath.list('-updated_date')
  });

  const { data: learningContent = [] } = useQuery({
    queryKey: ['learning-content-all'],
    queryFn: () => base44.entities.LearningContent.filter({ is_standalone_resource: false })
  });

  const createPathMutation = useMutation({
    mutationFn: (data) => base44.entities.CuratedPath.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['curated-paths-admin']);
      toast.success('Learning path created');
      resetForm();
    }
  });

  const updatePathMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CuratedPath.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['curated-paths-admin']);
      toast.success('Learning path updated');
      setEditingPath(null);
      resetForm();
    }
  });

  const deletePathMutation = useMutation({
    mutationFn: (id) => base44.entities.CuratedPath.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['curated-paths-admin']);
      toast.success('Learning path deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      path_name: '',
      description: '',
      skill_track: 'grant_writing_mastery',
      difficulty_level: 'beginner',
      estimated_hours: 0,
      module_sequence: [],
      completion_badge: '',
      is_active: true
    });
    setIsCreating(false);
    setEditingPath(null);
  };

  const handleEdit = (path) => {
    setEditingPath(path);
    setFormData({
      path_name: path.path_name,
      description: path.description,
      skill_track: path.skill_track,
      difficulty_level: path.difficulty_level,
      estimated_hours: path.estimated_hours,
      module_sequence: path.module_sequence || [],
      completion_badge: path.completion_badge || '',
      is_active: path.is_active
    });
    setIsCreating(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPath) {
      updatePathMutation.mutate({ id: editingPath.id, data: formData });
    } else {
      createPathMutation.mutate(formData);
    }
  };

  const addModule = (contentId) => {
    const content = learningContent.find(c => c.id === contentId);
    if (!content) return;

    setFormData({
      ...formData,
      module_sequence: [
        ...formData.module_sequence,
        {
          learning_content_id: contentId,
          order: formData.module_sequence.length + 1,
          is_required: true
        }
      ]
    });
  };

  const removeModule = (index) => {
    setFormData({
      ...formData,
      module_sequence: formData.module_sequence
        .filter((_, i) => i !== index)
        .map((mod, i) => ({ ...mod, order: i + 1 }))
    });
  };

  const moveModule = (index, direction) => {
    const newSequence = [...formData.module_sequence];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSequence.length) return;
    
    [newSequence[index], newSequence[targetIndex]] = [newSequence[targetIndex], newSequence[index]];
    
    setFormData({
      ...formData,
      module_sequence: newSequence.map((mod, i) => ({ ...mod, order: i + 1 }))
    });
  };

  const toggleRequired = (index) => {
    const newSequence = [...formData.module_sequence];
    newSequence[index].is_required = !newSequence[index].is_required;
    setFormData({ ...formData, module_sequence: newSequence });
  };

  const skillTracks = {
    grant_writing_mastery: 'Grant Writing Mastery',
    contract_excellence: 'Contract Excellence',
    donor_relations: 'Donor Relations',
    nonprofit_leadership: 'Nonprofit Leadership',
    evaluation_impact: 'Evaluation & Impact',
    budget_finance: 'Budget & Finance'
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Learning Path Manager</h1>
            <p className="text-slate-600 mt-1">Create and manage curated learning paths with prerequisites</p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Learning Path
          </Button>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreating} onOpenChange={(open) => {
          setIsCreating(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPath ? 'Edit Learning Path' : 'Create New Learning Path'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Path Name *</Label>
                  <Input
                    value={formData.path_name}
                    onChange={(e) => setFormData({ ...formData, path_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Skill Track *</Label>
                  <Select value={formData.skill_track} onValueChange={(val) => setFormData({ ...formData, skill_track: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(skillTracks).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Difficulty Level *</Label>
                  <Select value={formData.difficulty_level} onValueChange={(val) => setFormData({ ...formData, difficulty_level: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Completion Badge</Label>
                <Input
                  value={formData.completion_badge}
                  onChange={(e) => setFormData({ ...formData, completion_badge: e.target.value })}
                  placeholder="e.g., Grant Writing Master"
                />
              </div>

              {/* Module Sequence */}
              <div className="border-t pt-6">
                <Label className="text-lg mb-4 block">Course Sequence</Label>
                
                <div className="mb-4">
                  <Select onValueChange={addModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add course to path" />
                    </SelectTrigger>
                    <SelectContent>
                      {learningContent.map(content => (
                        <SelectItem key={content.id} value={content.id}>
                          {content.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {formData.module_sequence.map((module, index) => {
                    const content = learningContent.find(c => c.id === module.learning_content_id);
                    return (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div className="flex-1">
                              <p className="font-medium">{content?.title}</p>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{content?.duration_minutes} min</span>
                                {module.is_required && (
                                  <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => moveModule(index, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => moveModule(index, 'down')}
                                disabled={index === formData.module_sequence.length - 1}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleRequired(index)}
                              >
                                <CheckCircle2 className={`w-4 h-4 ${module.is_required ? 'text-red-600' : 'text-slate-400'}`} />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeModule(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingPath ? 'Update Path' : 'Create Path'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Paths List */}
        <div className="grid gap-6">
          {paths.map(path => (
            <Card key={path.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{path.path_name}</CardTitle>
                      <Badge className={path.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                        {path.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800">
                        {skillTracks[path.skill_track]}
                      </Badge>
                      <Badge variant="outline">{path.difficulty_level}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{path.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {path.module_sequence?.length || 0} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {path.estimated_hours}h
                      </span>
                      {path.completion_badge && (
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {path.completion_badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(path)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Delete this learning path?')) {
                          deletePathMutation.mutate(path.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {path.module_sequence?.length > 0 && (
                <CardContent>
                  <p className="text-sm font-medium text-slate-700 mb-3">Course Sequence:</p>
                  <div className="space-y-2">
                    {path.module_sequence.map((module, idx) => {
                      const content = learningContent.find(c => c.id === module.learning_content_id);
                      return (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <Badge variant="outline" className="w-8 justify-center">{idx + 1}</Badge>
                          <span className="flex-1">{content?.title || 'Unknown Course'}</span>
                          {module.is_required && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}