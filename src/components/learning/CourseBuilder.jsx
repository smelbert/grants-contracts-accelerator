import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AIContentAssistant from './AIContentAssistant';
import EnhancedAICourseAssistant from './EnhancedAICourseAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { 
  GripVertical, Plus, Trash2, Edit, Upload, Link2, Video, FileText, 
  Calendar, Clock, Sparkles, ChevronDown, ChevronUp, Save, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function CourseBuilder({ course, onSave, onCancel }) {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    content_type: 'course',
    course_type: 'self_paced',
    funding_lane: 'general',
    duration_minutes: null,
    thumbnail_url: null,
    scheduled_start_date: null,
    curriculum_sections: [],
    handouts: [],
    tips: [],
    drip_schedule: [],
    is_premium: false,
    incubateher_only: false,
    ...course
  });

  const [expandedSection, setExpandedSection] = useState(null);
  const [sectionDialog, setSectionDialog] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [handoutDialog, setHandoutDialog] = useState(false);
  const [tipDialog, setTipDialog] = useState(false);
  const [aiDialog, setAiDialog] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [enhancedAiOpen, setEnhancedAiOpen] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(courseData.curriculum_sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCourseData({ ...courseData, curriculum_sections: items });
  };

  const addSection = (sectionData) => {
    const newSection = {
      id: Date.now().toString(),
      ...sectionData
    };

    if (editingSection) {
      const updatedSections = courseData.curriculum_sections.map(s => 
        s.id === editingSection.id ? { ...s, ...sectionData } : s
      );
      setCourseData({ ...courseData, curriculum_sections: updatedSections });
    } else {
      setCourseData({
        ...courseData,
        curriculum_sections: [...courseData.curriculum_sections, newSection]
      });
    }

    setSectionDialog(false);
    setEditingSection(null);
  };

  const removeSection = (id) => {
    setCourseData({
      ...courseData,
      curriculum_sections: courseData.curriculum_sections.filter(s => s.id !== id)
    });
  };

  const addHandout = (handoutData) => {
    setCourseData({
      ...courseData,
      handouts: [...courseData.handouts, handoutData]
    });
    setHandoutDialog(false);
  };

  const addTip = (tipData) => {
    setCourseData({
      ...courseData,
      tips: [...courseData.tips, tipData]
    });
    setTipDialog(false);
  };

  const handleApplyAiContent = (content, type) => {
    if (type === 'outline' && content.sections) {
      setCourseData(prev => ({
        ...prev,
        title: content.title || prev.title,
        description: content.description || prev.description,
        curriculum_sections: content.sections.map(section => ({
          id: `ai-${Date.now()}-${Math.random()}`,
          title: section.title,
          description: section.description,
          duration_minutes: section.duration_minutes,
          content: section.topics ? `<ul>${section.topics.map(t => `<li>${t}</li>`).join('')}</ul>` : ''
        }))
      }));
      toast.success('Course outline applied!');
      setAiAssistantOpen(false);
    }
  };

  const handleFileUpload = async (file, type = 'handout') => {
    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      toast.success('File uploaded successfully');
      return file_url;
    } catch (error) {
      toast.error('Failed to upload file');
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const generateWithAI = async (prompt) => {
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a course curriculum designer. ${prompt}
        
Generate a detailed response in JSON format with sections, each containing:
- title: Section title
- description: Brief description
- duration_minutes: Estimated duration
- content: Detailed HTML content for the section
- learning_objectives: Array of learning objectives

Return ONLY valid JSON, no additional text.`,
        response_json_schema: {
          type: 'object',
          properties: {
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  duration_minutes: { type: 'number' },
                  content: { type: 'string' },
                  learning_objectives: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      });

      if (result.sections && result.sections.length > 0) {
        const newSections = result.sections.map((section, idx) => ({
          id: `ai-${Date.now()}-${idx}`,
          ...section
        }));
        
        setCourseData({
          ...courseData,
          curriculum_sections: [...courseData.curriculum_sections, ...newSections]
        });
        
        toast.success(`Generated ${newSections.length} sections`);
        setAiDialog(false);
      }
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = () => {
    if (!courseData.title || !courseData.description) {
      toast.error('Please fill in title and description');
      return;
    }

    onSave(courseData);
  };

  return (
    <div className="space-y-6">
      {/* Course Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Course Type & Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Course Title *</Label>
              <Input
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                placeholder="e.g., Grant Writing Fundamentals"
              />
            </div>

            <div className="col-span-2">
              <Label>Description *</Label>
              <Textarea
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                placeholder="Brief overview of what students will learn"
                rows={3}
              />
            </div>

            <div>
              <Label>Course Type *</Label>
              <Select 
                value={courseData.course_type} 
                onValueChange={(val) => setCourseData({ ...courseData, course_type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self_paced">
                    <div>
                      <div className="font-medium">Self-Paced</div>
                      <div className="text-xs text-slate-500">All content available immediately</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="structured">
                    <div>
                      <div className="font-medium">Structured</div>
                      <div className="text-xs text-slate-500">Content drips relative to enrollment</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="scheduled">
                    <div>
                      <div className="font-medium">Scheduled</div>
                      <div className="text-xs text-slate-500">Content drips on specific dates</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Funding Lane *</Label>
              <Select 
                value={courseData.funding_lane} 
                onValueChange={(val) => setCourseData({ ...courseData, funding_lane: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grants">Grants</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="donors">Donors</SelectItem>
                  <SelectItem value="public_funds">Public Funds</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {courseData.course_type === 'scheduled' && (
              <div className="col-span-2">
                <Label>Course Start Date *</Label>
                <Input
                  type="datetime-local"
                  value={courseData.scheduled_start_date || ''}
                  onChange={(e) => setCourseData({ ...courseData, scheduled_start_date: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label>Total Duration (minutes)</Label>
              <Input
                type="number"
                value={courseData.duration_minutes || ''}
                onChange={(e) => setCourseData({ ...courseData, duration_minutes: parseInt(e.target.value) })}
                placeholder="e.g., 120"
              />
            </div>

            <div>
              <Label>Thumbnail URL</Label>
              <Input
                value={courseData.thumbnail_url || ''}
                onChange={(e) => setCourseData({ ...courseData, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={courseData.is_premium}
                  onChange={(e) => setCourseData({ ...courseData, is_premium: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Premium Only</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={courseData.incubateher_only}
                  onChange={(e) => setCourseData({ ...courseData, incubateher_only: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">IncubateHer Only</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Curriculum</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEnhancedAiOpen(true)}
                className="text-purple-600 border-purple-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Course Builder
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingSection(null);
                  setSectionDialog(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {courseData.curriculum_sections.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">No sections added yet</p>
              <Button onClick={() => setSectionDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Section
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {courseData.curriculum_sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white border rounded-lg"
                          >
                            <div className="flex items-center gap-3 p-4">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">Section {index + 1}</Badge>
                                  {section.duration_minutes && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {section.duration_minutes} min
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-medium text-slate-900">{section.title}</h4>
                                <p className="text-sm text-slate-600">{section.description}</p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                                >
                                  {expandedSection === index ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingSection(section);
                                    setSectionDialog(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => removeSection(section.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {expandedSection === index && (
                              <div className="border-t p-4 bg-slate-50">
                                <div className="prose prose-sm max-w-none">
                                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Handouts & Resources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Handouts & Resources</CardTitle>
            <Button size="sm" onClick={() => setHandoutDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Handout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {courseData.handouts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No handouts added yet</p>
          ) : (
            <div className="space-y-2">
              {courseData.handouts.map((handout, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-sm">{handout.title}</p>
                      <p className="text-xs text-slate-500">{handout.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => {
                      setCourseData({
                        ...courseData,
                        handouts: courseData.handouts.filter((_, i) => i !== idx)
                      });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tips & Best Practices</CardTitle>
            <Button size="sm" onClick={() => setTipDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tip
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {courseData.tips.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No tips added yet</p>
          ) : (
            <div className="space-y-2">
              {courseData.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <Badge className="mb-2">{tip.category}</Badge>
                    <p className="font-medium text-sm mb-1">{tip.title}</p>
                    <p className="text-xs text-slate-600">{tip.content}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => {
                      setCourseData({
                        ...courseData,
                        tips: courseData.tips.filter((_, i) => i !== idx)
                      });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-blue-600">
          <Save className="w-4 h-4 mr-2" />
          {course ? 'Update Course' : 'Create Course'}
        </Button>
      </div>

      {/* Section Dialog */}
      <SectionDialog
        open={sectionDialog}
        onClose={() => {
          setSectionDialog(false);
          setEditingSection(null);
        }}
        section={editingSection}
        onSave={addSection}
        onFileUpload={handleFileUpload}
        uploadingFile={uploadingFile}
      />

      {/* Handout Dialog */}
      <HandoutDialog
        open={handoutDialog}
        onClose={() => setHandoutDialog(false)}
        onSave={addHandout}
        onFileUpload={handleFileUpload}
        uploadingFile={uploadingFile}
      />

      {/* Tip Dialog */}
      <TipDialog
        open={tipDialog}
        onClose={() => setTipDialog(false)}
        onSave={addTip}
      />

      {/* AI Generation Dialog */}
      <AIGenerationDialog
        open={aiDialog}
        onClose={() => setAiDialog(false)}
        onGenerate={generateWithAI}
        generating={aiGenerating}
      />

      {/* AI Content Assistant */}
      <AIContentAssistant
        open={aiAssistantOpen}
        onOpenChange={setAiAssistantOpen}
        onApplyContent={handleApplyAiContent}
        mode="create"
      />

      {/* Enhanced AI Course Assistant */}
      <EnhancedAICourseAssistant
        open={enhancedAiOpen}
        onClose={() => setEnhancedAiOpen(false)}
        onApplyContent={handleApplyAiContent}
        existingCourse={courseData}
      />
    </div>
  );
}

function SectionDialog({ open, onClose, section, onSave, onFileUpload, uploadingFile }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: '',
    content: '',
    video_url: '',
    presentation_url: '',
    embed_code: ''
  });

  useEffect(() => {
    if (section) {
      setFormData(section);
    } else {
      setFormData({
        title: '',
        description: '',
        duration_minutes: '',
        content: '',
        video_url: '',
        presentation_url: '',
        embed_code: ''
      });
    }
  }, [section, open]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await onFileUpload(file);
      if (url) {
        setFormData({ ...formData, presentation_url: url });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{section ? 'Edit Section' : 'Add Section'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Section Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Grant Writing"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief overview of this section"
              rows={2}
            />
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              placeholder="e.g., 30"
            />
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="presentation">Presentation</TabsTrigger>
              <TabsTrigger value="embed">Embed Code</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-2">
              <Label>HTML Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<h2>Section content here...</h2>"
                rows={10}
                className="font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="video" className="space-y-2">
              <Label>Video URL (YouTube, Vimeo, or direct link)</Label>
              <Input
                value={formData.video_url || ''}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </TabsContent>

            <TabsContent value="presentation" className="space-y-2">
              <Label>PowerPoint / Presentation</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.presentation_url || ''}
                  onChange={(e) => setFormData({ ...formData, presentation_url: e.target.value })}
                  placeholder="https://... or upload file"
                />
                <Button type="button" onClick={() => document.getElementById('presentation-upload').click()} disabled={uploadingFile}>
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <input
                id="presentation-upload"
                type="file"
                className="hidden"
                accept=".ppt,.pptx,.pdf"
                onChange={handleFileSelect}
              />
            </TabsContent>

            <TabsContent value="embed" className="space-y-2">
              <Label>Embed Code (iframe, etc.)</Label>
              <Textarea
                value={formData.embed_code || ''}
                onChange={(e) => setFormData({ ...formData, embed_code: e.target.value })}
                placeholder='<iframe src="..." ...></iframe>'
                rows={5}
                className="font-mono text-sm"
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600">
              {section ? 'Update' : 'Add'} Section
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function HandoutDialog({ open, onClose, onSave, onFileUpload, uploadingFile }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: 'pdf'
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await onFileUpload(file);
      if (url) {
        setFormData({ ...formData, file_url: url, file_type: file.type });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ title: '', description: '', file_url: '', file_type: 'pdf' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Handout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Grant Budget Template"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description"
              rows={2}
            />
          </div>

          <div>
            <Label>File URL or Upload</Label>
            <div className="flex gap-2">
              <Input
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                placeholder="https://... or upload"
              />
              <Button type="button" onClick={() => document.getElementById('handout-upload').click()} disabled={uploadingFile}>
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            <input
              id="handout-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600">
              Add Handout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TipDialog({ open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'best_practice'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ title: '', content: '', category: 'best_practice' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best_practice">Best Practice</SelectItem>
                <SelectItem value="common_mistake">Common Mistake</SelectItem>
                <SelectItem value="pro_tip">Pro Tip</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Review Guidelines Carefully"
              required
            />
          </div>

          <div>
            <Label>Content *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Tip content..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600">
              Add Tip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AIGenerationDialog({ open, onClose, onGenerate, generating }) {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
      setPrompt('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Course Generation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Describe your course curriculum</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a 5-section course on grant writing fundamentals covering: 1) Understanding grants 2) Research & planning 3) Budget development 4) Writing compelling narratives 5) Submission best practices"
              rows={6}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="bg-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}