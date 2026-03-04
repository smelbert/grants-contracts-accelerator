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
    is_standalone_resource: false,
    file_url: '',
    content_url: '',
    ...course
  });

  const [expandedSection, setExpandedSection] = useState(null);
  const [sectionDialog, setSectionDialog] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [handoutDialog, setHandoutDialog] = useState(false);
  const [editingHandout, setEditingHandout] = useState(null);
  const [editingHandoutIdx, setEditingHandoutIdx] = useState(null);
  const [tipDialog, setTipDialog] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [editingTipIdx, setEditingTipIdx] = useState(null);
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
    if (editingHandoutIdx !== null) {
      const updated = [...(courseData.handouts || [])];
      updated[editingHandoutIdx] = handoutData;
      setCourseData({ ...courseData, handouts: updated });
    } else {
      setCourseData({ ...courseData, handouts: [...(courseData.handouts || []), handoutData] });
    }
    setHandoutDialog(false);
    setEditingHandout(null);
    setEditingHandoutIdx(null);
  };

  const addTip = (tipData) => {
    if (editingTipIdx !== null) {
      const updated = [...(courseData.tips || [])];
      updated[editingTipIdx] = tipData;
      setCourseData({ ...courseData, tips: updated });
    } else {
      setCourseData({ ...courseData, tips: [...(courseData.tips || []), tipData] });
    }
    setTipDialog(false);
    setEditingTip(null);
    setEditingTipIdx(null);
  };

  const generateHandoutsWithAI = async () => {
    const topic = courseData.title || 'this course topic';
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert instructional designer. Generate 3 practical handout resources for a course titled "${topic}". Each handout should be a self-contained reference guide written in clean HTML. Focus on actionable checklists, templates, or reference sheets that learners can use immediately.`,
      response_json_schema: {
        type: 'object',
        properties: {
          handouts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                source_type: { type: 'string' },
                html_content: { type: 'string' }
              }
            }
          }
        }
      }
    });
    if (result?.handouts?.length > 0) {
      const aiHandouts = result.handouts.map(h => ({ ...h, source_type: 'html' }));
      setCourseData(prev => ({ ...prev, handouts: [...(prev.handouts || []), ...aiHandouts] }));
      toast.success(`Generated ${aiHandouts.length} handouts with AI`);
    }
  };

  const generateTipsWithAI = async () => {
    const topic = courseData.title || 'this course topic';
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 practical tips for a course titled "${topic}". Mix categories: best_practice, common_mistake, pro_tip, and warning. Keep each tip concise and actionable.`,
      response_json_schema: {
        type: 'object',
        properties: {
          tips: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                category: { type: 'string', enum: ['best_practice', 'common_mistake', 'pro_tip', 'warning'] }
              }
            }
          }
        }
      }
    });
    if (result?.tips?.length > 0) {
      setCourseData(prev => ({ ...prev, tips: [...(prev.tips || []), ...result.tips] }));
      toast.success(`Generated ${result.tips.length} tips with AI`);
    }
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

    // Sanitize numeric fields to avoid validation errors
    const sanitized = {
      ...courseData,
      duration_minutes: courseData.duration_minutes || null,
      curriculum_sections: (courseData.curriculum_sections || []).map(s => ({
        ...s,
        duration_minutes: s.duration_minutes === '' || s.duration_minutes === undefined ? null : Number(s.duration_minutes) || null
      }))
    };

    onSave(sanitized);
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

            {courseData.is_standalone_resource && (
              <div className="col-span-2">
                <Label>File URL (for download) *</Label>
                <Input
                  value={courseData.file_url || ''}
                  onChange={(e) => setCourseData({ ...courseData, file_url: e.target.value })}
                  placeholder="https://... (PDF, document, or other file)"
                />
              </div>
            )}

            <div>
              <Label>Order (for sorting)</Label>
              <Input
                type="number"
                value={courseData.order || ''}
                onChange={(e) => setCourseData({ ...courseData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Meeting Link (Google Meet/Zoom)</Label>
              <Input
                value={courseData.meeting_link || ''}
                onChange={(e) => setCourseData({ ...courseData, meeting_link: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="col-span-2">
              <Label>Gamma / Embed URL (course-level presentation)</Label>
              <Input
                value={courseData.content_url || ''}
                onChange={(e) => setCourseData({ ...courseData, content_url: e.target.value })}
                placeholder="https://gamma.app/embed/..."
              />
              <p className="text-xs text-slate-500 mt-1">Paste the Gamma embed URL (from the src attribute of the iframe code)</p>
            </div>

            {courseData.incubateher_only && (
              <div className="col-span-2">
                <Label>Agenda Section ID</Label>
                <Select 
                  value={courseData.agenda_section || ''} 
                  onValueChange={(val) => setCourseData({ ...courseData, agenda_section: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Link to agenda section (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    <SelectItem value="intro">Intro / Orientation</SelectItem>
                    <SelectItem value="legal">Legal Structure</SelectItem>
                    <SelectItem value="financial">Financial Management</SelectItem>
                    <SelectItem value="grants">Grants</SelectItem>
                    <SelectItem value="contracts">Contracts / RFPs</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="consultation">Consultation Prep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="col-span-2 space-y-3">
              <label className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <input
                  type="checkbox"
                  checked={courseData.is_published === true}
                  onChange={(e) => setCourseData({ ...courseData, is_published: e.target.checked })}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900 block">✅ Published (visible to users)</span>
                  <span className="text-xs text-slate-600">Must be checked for non-IncubateHer content to appear in the Learning Hub</span>
                </div>
              </label>

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

              <label className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  checked={courseData.is_standalone_resource}
                  onChange={(e) => setCourseData({ ...courseData, is_standalone_resource: e.target.checked })}
                  className="rounded"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900 block">Standalone Resource</span>
                  <span className="text-xs text-slate-600">Appears in Resource Library, not Learning Hub</span>
                </div>
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
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={generateHandoutsWithAI} className="text-purple-600 border-purple-300 hover:bg-purple-50">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
              <Button size="sm" onClick={() => setHandoutDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Handout
              </Button>
            </div>
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
                      <p className="text-xs text-slate-500">{handout.source_type === 'html' ? 'HTML content' : handout.file_url || handout.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingHandout(handout); setEditingHandoutIdx(idx); setHandoutDialog(true); }}>
                      <Edit className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setCourseData({ ...courseData, handouts: courseData.handouts.filter((_, i) => i !== idx) })}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
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
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={generateTipsWithAI} className="text-purple-600 border-purple-300 hover:bg-purple-50">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
              <Button size="sm" onClick={() => setTipDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tip
              </Button>
            </div>
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
                  <div className="flex gap-1 shrink-0 ml-2">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingTip(tip); setEditingTipIdx(idx); setTipDialog(true); }}>
                      <Edit className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setCourseData({ ...courseData, tips: courseData.tips.filter((_, i) => i !== idx) })}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
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
    content_url: '',
    embed_code: '',
    show_content: true,
    show_video: false,
    show_presentation: false,
    show_embed: false
  });

  useEffect(() => {
    if (section) {
      setFormData({
        ...section,
        show_content: section.show_content ?? true,
        show_video: section.show_video ?? false,
        show_presentation: section.show_presentation ?? false,
        show_embed: section.show_embed ?? false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        duration_minutes: '',
        content: '',
        video_url: '',
        presentation_url: '',
        content_url: '',
        embed_code: '',
        show_content: true,
        show_video: false,
        show_presentation: false,
        show_embed: false
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

          <div className="border rounded-lg p-4 bg-slate-50 mb-4">
            <Label className="text-sm font-semibold mb-3 block">What should display in this section?</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.show_content}
                  onChange={(e) => setFormData({ ...formData, show_content: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Content (HTML/Text)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.show_video}
                  onChange={(e) => setFormData({ ...formData, show_video: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Video</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.show_presentation}
                  onChange={(e) => setFormData({ ...formData, show_presentation: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Presentation/PowerPoint</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.show_embed}
                  onChange={(e) => setFormData({ ...formData, show_embed: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Embed Code (iframe)</span>
              </label>
            </div>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              {formData.show_content && <TabsTrigger value="content">Content</TabsTrigger>}
              {formData.show_video && <TabsTrigger value="video">Video</TabsTrigger>}
              {formData.show_presentation && <TabsTrigger value="presentation">Presentation</TabsTrigger>}
              {formData.show_embed && <TabsTrigger value="embed">Embed Code</TabsTrigger>}
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

            <TabsContent value="video" className="space-y-3">
              <Label>Video URL</Label>
              <Input
                value={formData.video_url || ''}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="Paste YouTube, Google Drive share link, or direct .mp4 URL"
              />
              {/* Live preview */}
              {formData.video_url && (() => {
                const vUrl = formData.video_url;
                const isDirect = vUrl.match(/\.(mp4|webm|ogg)(\?|$)/i);
                const isDrive = vUrl.includes('drive.google.com');
                const isYoutube = vUrl.includes('youtube.com') || vUrl.includes('youtu.be');
                const isVimeo = vUrl.includes('vimeo.com');
                let embedSrc = null;
                if (isDrive) {
                  const idMatch = vUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                  if (idMatch) embedSrc = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
                } else if (isYoutube) {
                  let vid = null;
                  if (vUrl.includes('youtu.be/')) vid = vUrl.split('youtu.be/')[1]?.split(/[?&]/)[0];
                  else if (vUrl.includes('watch?v=')) vid = new URLSearchParams(vUrl.split('?')[1]).get('v');
                  else if (vUrl.includes('/embed/')) vid = vUrl.split('/embed/')[1]?.split(/[?&]/)[0];
                  if (vid) embedSrc = `https://www.youtube.com/embed/${vid}?rel=0`;
                } else if (isVimeo) {
                  const vid = vUrl.split('vimeo.com/')[1]?.split(/[?&]/)[0];
                  if (vid) embedSrc = `https://player.vimeo.com/video/${vid}`;
                }
                if (isDirect) return (
                  <video controls className="w-full rounded border" style={{ maxHeight: '300px' }}>
                    <source src={vUrl} />
                  </video>
                );
                if (embedSrc) return (
                  <div className="rounded border overflow-hidden">
                    <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 border-b border-emerald-100">✅ Preview</p>
                    <iframe src={embedSrc} className="w-full" style={{ height: '280px', border: 'none' }} allowFullScreen />
                  </div>
                );
                return <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">⚠️ Could not detect video type — link will open in new tab as fallback.</p>;
              })()}
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  onClick={() => document.getElementById('video-upload').click()} 
                  disabled={uploadingFile}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingFile ? 'Uploading...' : 'Upload Video File'}
                </Button>
                <input
                  id="video-upload"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = await onFileUpload(file);
                      if (url) {
                        setFormData({ ...formData, video_url: url });
                        toast.success('Video uploaded!');
                      }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Supports Google Drive share links (auto-converted), YouTube, Vimeo, or direct .mp4 URLs
              </p>
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

            <TabsContent value="embed" className="space-y-4">
              <div>
                <Label>Gamma / Embed URL</Label>
                <Input
                  value={formData.content_url || ''}
                  onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                  placeholder="https://gamma.app/embed/..."
                />
                <p className="text-xs text-slate-500 mt-1">Paste the URL from the src attribute of the Gamma iframe code</p>
              </div>
              <div>
                <Label>Custom Embed Code (optional fallback)</Label>
                <Textarea
                  value={formData.embed_code || ''}
                  onChange={(e) => setFormData({ ...formData, embed_code: e.target.value })}
                  placeholder='<iframe src="..." ...></iframe>'
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>
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
    source_type: 'file_url',
    file_url: '',
    file_type: '',
    html_content: ''
  });

  useEffect(() => {
    if (!open) {
      setFormData({ title: '', description: '', source_type: 'file_url', file_url: '', file_type: '', html_content: '' });
    }
  }, [open]);

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
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <Label>Resource Type</Label>
            <div className="flex gap-2 mt-1">
              {[
                { value: 'file_url', label: 'Link / URL' },
                { value: 'upload', label: 'Upload File' },
                { value: 'html', label: 'HTML Content' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, source_type: opt.value })}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${formData.source_type === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {formData.source_type === 'file_url' && (
            <div>
              <Label>URL</Label>
              <Input
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                placeholder="https://docs.google.com/... or any link"
              />
            </div>
          )}

          {formData.source_type === 'upload' && (
            <div>
              <Label>Upload File</Label>
              <div className="flex gap-2">
                <Input value={formData.file_url} readOnly placeholder="No file uploaded yet" className="bg-slate-50" />
                <Button type="button" variant="outline" onClick={() => document.getElementById('handout-upload').click()} disabled={uploadingFile}>
                  <Upload className="w-4 h-4 mr-1" />
                  {uploadingFile ? 'Uploading...' : 'Browse'}
                </Button>
              </div>
              <input id="handout-upload" type="file" className="hidden" onChange={handleFileSelect} />
            </div>
          )}

          {formData.source_type === 'html' && (
            <div>
              <Label>HTML Content</Label>
              <Textarea
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                placeholder="<h2>Resource Title</h2><p>Your content here...</p>"
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Write HTML directly — checklists, tables, formatted guides all work great here.</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600">Add Handout</Button>
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