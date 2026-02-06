import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Plus, Edit, Save, X, Trash2, BookOpen, 
  Target, Award, FileText, Settings, AlertTriangle, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingFrameworkEditorPage() {
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('philosophy');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: frameworkContent = [], isLoading } = useQuery({
    queryKey: ['training-framework'],
    queryFn: () => base44.entities.TrainingFrameworkContent.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TrainingFrameworkContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-framework'] });
      setEditingSection(null);
      setFormData({});
      toast.success('Section created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TrainingFrameworkContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-framework'] });
      setEditingSection(null);
      setFormData({});
      toast.success('Section updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TrainingFrameworkContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-framework'] });
      toast.success('Section deleted successfully');
    },
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E4F58]" />
      </div>
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = (section) => {
    setEditingSection(section.id);
    setFormData({
      ...section,
      key_points: section.key_points?.join('\n') || '',
      promotion_gates: section.promotion_gates?.join('\n') || '',
      exercises_json: section.exercises ? JSON.stringify(section.exercises, null, 2) : ''
    });
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      key_points: formData.key_points ? formData.key_points.split('\n').filter(p => p.trim()) : [],
      promotion_gates: formData.promotion_gates ? formData.promotion_gates.split('\n').filter(p => p.trim()) : [],
      exercises: formData.exercises_json ? JSON.parse(formData.exercises_json) : [],
      last_edited_by: user.email
    };

    if (editingSection === 'new') {
      createMutation.mutate(dataToSave);
    } else {
      updateMutation.mutate({ id: editingSection, data: dataToSave });
    }
  };

  const handleCreate = (sectionType) => {
    setEditingSection('new');
    setFormData({
      section_id: `${sectionType}_${Date.now()}`,
      section_type: sectionType,
      title: '',
      level: 'all',
      is_published: true
    });
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please provide a description for AI generation');
      return;
    }

    setAiGenerating(true);
    try {
      const prompt = `You are creating training content for EIS (Elbert Innovative Solutions) consultant training framework.

Context: EIS trains consultants in grant writing, proposals, and contracts. Consultants progress through 3 levels:
- Level 1: Foundation (shadowing, templates only)
- Level 2: Intermediate (independent drafting with review)
- Level 3: Senior (strategy leadership, QA, mentoring)

Current section type: ${formData.section_type}
Current level: ${formData.level}
Module title: ${formData.title || 'Not set'}

User description: ${aiPrompt}

Generate structured training content including:
1. Main content (HTML formatted, professional tone)
2. 4-6 key bullet points (actionable takeaways)
3. 2-3 practical exercises with titles and descriptions
${formData.section_type === 'level_definition' ? '4. 2-3 promotion gate requirements' : ''}

Return JSON format with: content, key_points (array), exercises (array of {title, description}), promotion_gates (array if applicable)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            key_points: { 
              type: 'array',
              items: { type: 'string' }
            },
            exercises: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            promotion_gates: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setFormData({
        ...formData,
        content: result.content,
        key_points: result.key_points?.join('\n') || '',
        exercises_json: result.exercises ? JSON.stringify(result.exercises, null, 2) : '',
        promotion_gates: result.promotion_gates?.join('\n') || ''
      });

      toast.success('AI content generated! Review and edit as needed.');
      setAiPrompt('');
    } catch (error) {
      toast.error('Failed to generate content: ' + error.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const philosophyContent = frameworkContent.filter(c => c.section_type === 'philosophy').sort((a, b) => a.display_order - b.display_order);
  const modules = frameworkContent.filter(c => c.section_type === 'module').sort((a, b) => (a.module_number || 0) - (b.module_number || 0));
  const levelDefinitions = frameworkContent.filter(c => c.section_type === 'level_definition').sort((a, b) => a.display_order - b.display_order);
  const expectations = frameworkContent.filter(c => c.section_type === 'expectations').sort((a, b) => a.display_order - b.display_order);
  const formatContent = frameworkContent.filter(c => c.section_type === 'format').sort((a, b) => a.display_order - b.display_order);

  const renderSectionList = (sections, sectionType) => (
    <div className="space-y-4">
      <Button onClick={() => handleCreate(sectionType)} className="mb-4 bg-[#1E4F58]">
        <Plus className="w-4 h-4 mr-2" />
        Add Section
      </Button>

      {sections.map((section) => (
        <Card key={section.id} className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg text-[#143A50]">{section.title}</CardTitle>
                {section.subtitle && <CardDescription className="mt-1">{section.subtitle}</CardDescription>}
                <div className="flex items-center gap-2 mt-2">
                  {section.module_number && (
                    <Badge variant="outline">Module {section.module_number}</Badge>
                  )}
                  {section.level && section.level !== 'all' && (
                    <Badge className={
                      section.level === 'level-1' ? 'bg-green-600' :
                      section.level === 'level-2' ? 'bg-blue-600' :
                      'bg-purple-600'
                    }>
                      {section.level}
                    </Badge>
                  )}
                  <Badge variant={section.is_published ? 'default' : 'secondary'}>
                    {section.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(section)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('Delete this section?')) {
                      deleteMutation.mutate(section.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );

  const renderEditor = () => (
    <Card className="shadow-lg">
      <CardHeader className="bg-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-[#143A50]">
            {editingSection === 'new' ? 'Create New Section' : 'Edit Section'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setEditingSection(null)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* AI Generation Section */}
        <Card className="border-2 border-[#AC1A5B] bg-gradient-to-br from-[#AC1A5B]/5 to-[#E5C089]/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#AC1A5B]" />
              <CardTitle className="text-lg">AI Content Generator</CardTitle>
            </div>
            <CardDescription>
              Describe what you want to teach and let AI draft the content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Example: Create a module about understanding the difference between grants and contracts, focusing on compliance requirements and payment structures. Include exercises for reviewing RFP documents."
              rows={4}
            />
            <Button 
              onClick={handleAIGenerate} 
              disabled={aiGenerating || !aiPrompt.trim()}
              className="w-full bg-[#AC1A5B] hover:bg-[#A65D40]"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content with AI
                </>
              )}
            </Button>
            <p className="text-xs text-slate-500">
              AI will generate content, key points, and exercises based on your description. You can edit everything after generation.
            </p>
          </CardContent>
        </Card>

        {/* Manual Form Fields */}
        <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Section ID</Label>
            <Input
              value={formData.section_id || ''}
              onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
              placeholder="unique_section_id"
            />
          </div>

          <div>
            <Label>Section Type</Label>
            <Select
              value={formData.section_type}
              onValueChange={(value) => setFormData({ ...formData, section_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="philosophy">Philosophy</SelectItem>
                <SelectItem value="level_definition">Level Definition</SelectItem>
                <SelectItem value="module">Module</SelectItem>
                <SelectItem value="expectations">Expectations</SelectItem>
                <SelectItem value="format">Format</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Title</Label>
          <Input
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Section Title"
          />
        </div>

        <div>
          <Label>Subtitle (optional)</Label>
          <Input
            value={formData.subtitle || ''}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Subtitle or tagline"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {formData.section_type === 'module' && (
            <div>
              <Label>Module Number</Label>
              <Input
                type="number"
                value={formData.module_number || ''}
                onChange={(e) => setFormData({ ...formData, module_number: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div>
            <Label>Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData({ ...formData, level: value })}
            >
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
            <Label>Display Order</Label>
            <Input
              type="number"
              value={formData.display_order || 0}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <Label>Main Content (HTML supported)</Label>
          <Textarea
            value={formData.content || ''}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={8}
            placeholder="Main section content..."
          />
        </div>

        <div>
          <Label>Key Points (one per line)</Label>
          <Textarea
            value={formData.key_points || ''}
            onChange={(e) => setFormData({ ...formData, key_points: e.target.value })}
            rows={5}
            placeholder="• Point 1&#10;• Point 2&#10;• Point 3"
          />
        </div>

        {(formData.level && formData.level !== 'all') && (
          <div>
            <Label>Promotion Gates (one per line)</Label>
            <Textarea
              value={formData.promotion_gates || ''}
              onChange={(e) => setFormData({ ...formData, promotion_gates: e.target.value })}
              rows={4}
              placeholder="Complete 2+ clean drafts&#10;Shadow discovery calls"
            />
          </div>
        )}

        {formData.section_type === 'module' && (
          <div>
            <Label>Exercises (JSON format)</Label>
            <Textarea
              value={formData.exercises_json || ''}
              onChange={(e) => setFormData({ ...formData, exercises_json: e.target.value })}
              rows={6}
              placeholder='[{"title": "Exercise name", "description": "What to do"}]'
              className="font-mono text-sm"
            />
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t">
          <Button onClick={handleSave} className="bg-[#1E4F58]">
            <Save className="w-4 h-4 mr-2" />
            Save Section
          </Button>
          <Button variant="outline" onClick={() => setEditingSection(null)}>
            Cancel
          </Button>
        </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-10 h-10 text-[#AC1A5B]" />
            <div>
              <h1 className="text-4xl font-bold text-[#143A50]">Training Framework Editor</h1>
              <p className="text-slate-600">Manage consultant training content</p>
            </div>
          </div>
        </div>

        {editingSection ? (
          renderEditor()
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
              <TabsTrigger value="levels">Levels</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="expectations">Expectations</TabsTrigger>
              <TabsTrigger value="format">Format</TabsTrigger>
            </TabsList>

            <TabsContent value="philosophy">
              {renderSectionList(philosophyContent, 'philosophy')}
            </TabsContent>

            <TabsContent value="levels">
              {renderSectionList(levelDefinitions, 'level_definition')}
            </TabsContent>

            <TabsContent value="modules">
              {renderSectionList(modules, 'module')}
            </TabsContent>

            <TabsContent value="expectations">
              {renderSectionList(expectations, 'expectations')}
            </TabsContent>

            <TabsContent value="format">
              {renderSectionList(formatContent, 'format')}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}