import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Plus, Edit, Trash2, Clock, Award, ArrowLeft, Sparkles, CheckSquare, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import CourseBuilder from '@/components/learning/CourseBuilder';
import AIContentAssistant from '@/components/learning/AIContentAssistant';
import BulkContentEditor from '@/components/admin/BulkContentEditor';
import ContentReviewWorkflow from '@/components/admin/ContentReviewWorkflow';

export default function LearningContentManagement() {
  const queryClient = useQueryClient();
  const [builderMode, setBuilderMode] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterLane, setFilterLane] = useState('all');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [reviewingContent, setReviewingContent] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['learning-content-admin'],
    queryFn: () => base44.entities.LearningContent.list('-created_date')
  });

  const saveMutation = useMutation({
    mutationFn: async (courseData) => {
      if (editingContent?.id) {
        return await base44.entities.LearningContent.update(editingContent.id, courseData);
      } else {
        return await base44.entities.LearningContent.create(courseData);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learning-content-admin'] });
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      const wasEditing = !!editingContent?.id;
      setBuilderMode(false);
      setEditingContent(null);
      toast.success(wasEditing ? 'Course updated successfully' : 'Course created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to save course: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LearningContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-content-admin'] });
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      toast.success('Content deleted');
    }
  });

  const handleSaveCourse = (courseData) => {
    saveMutation.mutate(courseData);
  };

  const handleApplyAiContent = (content, type) => {
    if (type === 'outline') {
      setEditingContent({
        title: content.title,
        description: content.description,
        curriculum_sections: content.sections?.map(s => ({
          id: `ai-${Date.now()}-${Math.random()}`,
          title: s.title,
          description: s.description,
          duration_minutes: s.duration_minutes,
          content: s.topics ? `<ul>${s.topics.map(t => `<li>${t}</li>`).join('')}</ul>` : ''
        }))
      });
      setBuilderMode(true);
      setAiAssistantOpen(false);
    }
  };

  const filteredContent = allContent.filter(content => {
    const typeMatch = filterType === 'all' || content.content_type === filterType;
    const laneMatch = filterLane === 'all' || content.funding_lane === filterLane;
    return typeMatch && laneMatch;
  });

  const incubateHerContent = filteredContent.filter(c => c.incubateher_only);
  const generalContent = filteredContent.filter(c => !c.incubateher_only);

  const toggleSelectContent = (content) => {
    setSelectedContent(prev => 
      prev.find(c => c.id === content.id)
        ? prev.filter(c => c.id !== content.id)
        : [...prev, content]
    );
  };

  const selectAll = (contentList) => {
    setSelectedContent(contentList);
  };

  const deselectAll = () => {
    setSelectedContent([]);
  };

  if (builderMode) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => {
                setBuilderMode(false);
                setEditingContent(null);
              }}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course List
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">
              {editingContent ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className="text-slate-600 mt-1">Build your comprehensive course curriculum</p>
          </div>

          <CourseBuilder
            course={editingContent}
            onSave={handleSaveCourse}
            onCancel={() => {
              setBuilderMode(false);
              setEditingContent(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Learning Hub Content Management</h1>
            <p className="text-slate-600 mt-1">Manage courses, webinars, workshops, and guides</p>
          </div>
          <div className="flex gap-2">
            {selectedContent.length > 0 && (
              <>
                <Badge className="bg-blue-600 text-white px-3 py-1">
                  {selectedContent.length} selected
                </Badge>
                <Button 
                  variant="outline"
                  onClick={() => setBulkEditOpen(true)}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button 
                  variant="ghost"
                  onClick={deselectAll}
                  size="sm"
                >
                  Clear Selection
                </Button>
              </>
            )}
            <Button 
              variant="outline"
              onClick={() => setAiAssistantOpen(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button 
              onClick={() => { 
                setEditingContent(null); 
                setBuilderMode(true); 
              }} 
              className="bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="course">Courses</SelectItem>
                  <SelectItem value="webinar">Webinars</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLane} onValueChange={setFilterLane}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Funding Lane" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lanes</SelectItem>
                  <SelectItem value="grants">Grants</SelectItem>
                  <SelectItem value="contracts">Contracts</SelectItem>
                  <SelectItem value="donors">Donors</SelectItem>
                  <SelectItem value="public_funds">Public Funds</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="incubateher" className="space-y-4">
          <TabsList>
            <TabsTrigger value="incubateher" className="data-[state=active]:bg-[#AC1A5B] data-[state=active]:text-white">
              <Award className="w-4 h-4 mr-2" />
              IncubateHer Courses ({incubateHerContent.length})
            </TabsTrigger>
            <TabsTrigger value="general" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              General Content ({generalContent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incubateher">
            {incubateHerContent.length > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={() => selectAll(incubateHerContent)}>
                  Select All
                </Button>
                <Button size="sm" variant="ghost" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            )}
            <div className="grid gap-4">
              {incubateHerContent.length === 0 ? (
                <Card>
                <CardContent className="py-12 text-center">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No IncubateHer content created yet</p>
                  <Button onClick={() => { setEditingContent(null); setBuilderMode(true); }} className="mt-4 bg-[#AC1A5B]">
                    Create First IncubateHer Course
                  </Button>
                </CardContent>
                </Card>
              ) : (
                incubateHerContent.map(content => (
                  <Card key={content.id} className={`border-l-4 border-l-[#AC1A5B] ${selectedContent.find(c => c.id === content.id) ? 'bg-blue-50 border-2 border-blue-500' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={!!selectedContent.find(c => c.id === content.id)}
                          onCheckedChange={() => toggleSelectContent(content)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-slate-900">{content.title}</h3>
                            <Badge className="bg-[#AC1A5B] text-white">IncubateHer</Badge>
                            <Badge variant="outline">{content.content_type}</Badge>
                            <Badge variant="outline">{content.funding_lane}</Badge>
                          </div>
                          <p className="text-slate-600 mb-3">{content.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            {content.duration_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {content.duration_minutes} min
                              </span>
                            )}
                            {content.agenda_section && (
                              <span>Section: {content.agenda_section}</span>
                            )}
                            <span>Order: {content.order || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setReviewingContent(content)}>
                            <GitBranch className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingContent(content); 
                            setBuilderMode(true); 
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => {
                            if (confirm('Delete this content?')) deleteMutation.mutate(content.id);
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="general">
            {generalContent.length > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={() => selectAll(generalContent)}>
                  Select All
                </Button>
                <Button size="sm" variant="ghost" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            )}
            <div className="grid gap-4">
              {generalContent.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No general content created yet</p>
                  </CardContent>
                </Card>
              ) : (
                generalContent.map(content => (
                  <Card key={content.id} className={selectedContent.find(c => c.id === content.id) ? 'bg-blue-50 border-2 border-blue-500' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={!!selectedContent.find(c => c.id === content.id)}
                          onCheckedChange={() => toggleSelectContent(content)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-slate-900">{content.title}</h3>
                            <Badge variant="outline">{content.content_type}</Badge>
                            <Badge variant="outline">{content.funding_lane}</Badge>
                            {content.is_premium && <Badge className="bg-amber-500">Premium</Badge>}
                          </div>
                          <p className="text-slate-600 mb-3">{content.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            {content.duration_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {content.duration_minutes} min
                              </span>
                            )}
                            <span>Order: {content.order || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setReviewingContent(content)}>
                            <GitBranch className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingContent(content); 
                            setBuilderMode(true); 
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => {
                            if (confirm('Delete this content?')) deleteMutation.mutate(content.id);
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        </div>
                        </CardContent>
                        </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <AIContentAssistant
          open={aiAssistantOpen}
          onOpenChange={setAiAssistantOpen}
          onApplyContent={handleApplyAiContent}
          mode="create"
        />

        {bulkEditOpen && selectedContent.length > 0 && (
          <BulkContentEditor
            selectedContent={selectedContent}
            onClose={() => {
              setBulkEditOpen(false);
              setSelectedContent([]);
            }}
          />
        )}

        {reviewingContent && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
              <ContentReviewWorkflow
                contentId={reviewingContent.id}
                onClose={() => setReviewingContent(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}