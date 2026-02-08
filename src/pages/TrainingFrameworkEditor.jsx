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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const sectionTypes = {
  philosophy: 'Philosophy',
  level_definition: 'Level Definition',
  module: 'Module',
  expectations: 'Expectations',
  format: 'Format'
};

export default function TrainingFrameworkEditorPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [activeTab, setActiveTab] = useState('modules');
  const queryClient = useQueryClient();
  
  // Rich text editors state
  const [content, setContent] = useState('');
  const [purpose, setPurpose] = useState('');
  const [rationale, setRationale] = useState('');
  
  // Dynamic lists state
  const [exercises, setExercises] = useState([]);
  const [requiredOutputs, setRequiredOutputs] = useState([]);
  const [levelExpectations, setLevelExpectations] = useState({
    level1: '',
    level2: '',
    level3: ''
  });

  const { data: frameworkContent = [] } = useQuery({
    queryKey: ['training-framework-all'],
    queryFn: () => base44.entities.TrainingFrameworkContent.list('display_order')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TrainingFrameworkContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['training-framework-all']);
      toast.success('Content created');
      setShowDialog(false);
      setEditingContent(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TrainingFrameworkContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['training-framework-all']);
      toast.success('Content updated');
      setShowDialog(false);
      setEditingContent(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TrainingFrameworkContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['training-framework-all']);
      toast.success('Content deleted');
    }
  });

  const handleOpenDialog = (content = null) => {
    setEditingContent(content);
    setContent(content?.content || '');
    setPurpose(content?.purpose || '');
    setRationale(content?.rationale || '');
    setExercises(content?.exercises || []);
    setRequiredOutputs(content?.required_outputs || []);
    setLevelExpectations({
      level1: content?.level_expectations?.level1 || '',
      level2: content?.level_expectations?.level2 || '',
      level3: content?.level_expectations?.level3 || ''
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const keyPoints = formData.get('keyPoints')?.split('\n').filter(p => p.trim());
    
    const data = {
      section_id: formData.get('sectionId'),
      section_type: formData.get('sectionType'),
      title: formData.get('title'),
      subtitle: formData.get('subtitle') || undefined,
      level: formData.get('level') || 'all',
      module_number: formData.get('moduleNumber') ? parseInt(formData.get('moduleNumber')) : undefined,
      content: content,
      purpose: purpose || undefined,
      rationale: rationale || undefined,
      key_points: keyPoints,
      exercises: exercises.filter(ex => ex.title || ex.description),
      required_outputs: requiredOutputs.filter(o => o.trim()),
      level_expectations: (levelExpectations.level1 || levelExpectations.level2 || levelExpectations.level3) 
        ? levelExpectations 
        : undefined,
      display_order: parseInt(formData.get('displayOrder')),
      is_published: formData.get('published') === 'on'
    };

    if (editingContent) {
      updateMutation.mutate({ id: editingContent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const modules = frameworkContent.filter(c => c.section_type === 'module').sort((a, b) => (a.module_number || 0) - (b.module_number || 0));
  const philosophy = frameworkContent.filter(c => c.section_type === 'philosophy');
  const levels = frameworkContent.filter(c => c.section_type === 'level_definition');
  const expectations = frameworkContent.filter(c => c.section_type === 'expectations');
  const format = frameworkContent.filter(c => c.section_type === 'format');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Training Framework Editor</h1>
            <p className="text-slate-600">Manage training modules and content</p>
          </div>
          <Button onClick={() => handleOpenDialog(null)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="modules">Modules ({modules.length})</TabsTrigger>
            <TabsTrigger value="philosophy">Philosophy ({philosophy.length})</TabsTrigger>
            <TabsTrigger value="levels">Levels ({levels.length})</TabsTrigger>
            <TabsTrigger value="expectations">Expectations ({expectations.length})</TabsTrigger>
            <TabsTrigger value="format">Format ({format.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-3 mt-6">
            {modules.map((content) => (
              <Card key={content.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>Module {content.module_number}</Badge>
                        <Badge variant="outline">{content.level}</Badge>
                        {!content.is_published && <Badge className="bg-amber-600">Draft</Badge>}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{content.title}</h3>
                      {content.subtitle && <p className="text-sm text-slate-600">{content.subtitle}</p>}
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{content.content}</p>
                      {content.key_points?.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">{content.key_points.length} key points</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingContent(content); setShowDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(content.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="philosophy" className="space-y-3 mt-6">
            {philosophy.map((content) => (
              <Card key={content.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{content.title}</h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{content.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingContent(content); setShowDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(content.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="levels" className="space-y-3 mt-6">
            {levels.map((content) => (
              <Card key={content.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{content.level}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{content.title}</h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{content.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingContent(content); setShowDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(content.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="expectations" className="space-y-3 mt-6">
            {expectations.map((content) => (
              <Card key={content.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{content.title}</h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{content.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingContent(content); setShowDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(content.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="format" className="space-y-3 mt-6">
            {format.map((content) => (
              <Card key={content.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{content.title}</h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{content.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingContent(content); setShowDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(content.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingContent ? 'Edit' : 'Add'} Training Content</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Section Type</Label>
                  <Select name="sectionType" defaultValue={editingContent?.section_type} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sectionTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Section ID</Label>
                  <Input name="sectionId" defaultValue={editingContent?.section_id} placeholder="e.g., module-1" required />
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <Input name="title" defaultValue={editingContent?.title} required />
              </div>

              <div>
                <Label>Subtitle (optional)</Label>
                <Input name="subtitle" defaultValue={editingContent?.subtitle} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Level</Label>
                  <Select name="level" defaultValue={editingContent?.level || 'all'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="level-1">Level 1</SelectItem>
                      <SelectItem value="level-2">Level 2</SelectItem>
                      <SelectItem value="level-3">Level 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Module Number (if module)</Label>
                  <Input type="number" name="moduleNumber" defaultValue={editingContent?.module_number} />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" name="displayOrder" defaultValue={editingContent?.display_order || 0} required />
                </div>
              </div>

              <div>
                <Label>Content (Rich Text)</Label>
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill theme="snow" value={content} onChange={setContent} />
                </div>
              </div>

              <div>
                <Label>Purpose (Optional - for modules)</Label>
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill theme="snow" value={purpose} onChange={setPurpose} />
                </div>
              </div>

              <div>
                <Label>Rationale (Optional - for modules)</Label>
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill theme="snow" value={rationale} onChange={setRationale} />
                </div>
              </div>

              <div>
                <Label>Key Points (one per line)</Label>
                <Textarea 
                  name="keyPoints" 
                  rows={4} 
                  defaultValue={editingContent?.key_points?.join('\n')} 
                  placeholder="Enter each key point on a new line"
                />
              </div>

              {/* Exercises Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Exercises</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setExercises([...exercises, { title: '', description: '' }])}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Exercise
                  </Button>
                </div>
                {exercises.map((exercise, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
                          <Input
                            placeholder="Exercise Title"
                            value={exercise.title}
                            onChange={(e) => {
                              const updated = [...exercises];
                              updated[idx].title = e.target.value;
                              setExercises(updated);
                            }}
                          />
                          <Textarea
                            placeholder="Exercise Description"
                            rows={2}
                            value={exercise.description}
                            onChange={(e) => {
                              const updated = [...exercises];
                              updated[idx].description = e.target.value;
                              setExercises(updated);
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setExercises(exercises.filter((_, i) => i !== idx))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Level-Based Expectations */}
              <div className="space-y-3">
                <Label>Level-Based Expectations (for modules)</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-green-700">Level 1 Expectation</Label>
                    <Input
                      placeholder="What Level 1 consultants should achieve"
                      value={levelExpectations.level1}
                      onChange={(e) => setLevelExpectations({ ...levelExpectations, level1: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-blue-700">Level 2 Expectation</Label>
                    <Input
                      placeholder="What Level 2 consultants should achieve"
                      value={levelExpectations.level2}
                      onChange={(e) => setLevelExpectations({ ...levelExpectations, level2: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-purple-700">Level 3 Expectation</Label>
                    <Input
                      placeholder="What Level 3 consultants should achieve"
                      value={levelExpectations.level3}
                      onChange={(e) => setLevelExpectations({ ...levelExpectations, level3: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Required Outputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Required Outputs (for modules)</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setRequiredOutputs([...requiredOutputs, ''])}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Output
                  </Button>
                </div>
                {requiredOutputs.map((output, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Required output or deliverable"
                      value={output}
                      onChange={(e) => {
                        const updated = [...requiredOutputs];
                        updated[idx] = e.target.value;
                        setRequiredOutputs(updated);
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setRequiredOutputs(requiredOutputs.filter((_, i) => i !== idx))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" name="published" defaultChecked={editingContent?.is_published ?? true} />
                <Label>Published</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Save Content
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}