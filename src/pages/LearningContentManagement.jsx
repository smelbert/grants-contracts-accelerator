import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Edit, Trash2, Eye, Clock, Award, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function LearningContentManagement() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterLane, setFilterLane] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: allContent = [], isLoading } = useQuery({
    queryKey: ['learning-content-admin'],
    queryFn: () => base44.entities.LearningContent.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LearningContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-content-admin']);
      setDialogOpen(false);
      setEditingContent(null);
      toast.success('Content created successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LearningContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-content-admin']);
      setDialogOpen(false);
      setEditingContent(null);
      toast.success('Content updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LearningContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-content-admin']);
      toast.success('Content deleted');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      content_type: formData.get('content_type'),
      funding_lane: formData.get('funding_lane'),
      duration_minutes: parseInt(formData.get('duration_minutes')) || null,
      content_url: formData.get('content_url') || null,
      thumbnail_url: formData.get('thumbnail_url') || null,
      is_premium: formData.get('is_premium') === 'true',
      incubateher_only: formData.get('incubateher_only') === 'true',
      agenda_section: formData.get('agenda_section') || null,
      order: parseInt(formData.get('order')) || 0,
    };

    if (editingContent) {
      updateMutation.mutate({ id: editingContent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredContent = allContent.filter(content => {
    const typeMatch = filterType === 'all' || content.content_type === filterType;
    const laneMatch = filterLane === 'all' || content.funding_lane === filterLane;
    return typeMatch && laneMatch;
  });

  const incubateHerContent = filteredContent.filter(c => c.incubateher_only);
  const generalContent = filteredContent.filter(c => !c.incubateher_only);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Learning Hub Content Management</h1>
            <p className="text-slate-600 mt-1">Manage courses, webinars, workshops, and guides</p>
          </div>
          <Button onClick={() => { setEditingContent(null); setDialogOpen(true); }} className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add New Content
          </Button>
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
            <div className="grid gap-4">
              {incubateHerContent.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No IncubateHer content created yet</p>
                    <Button onClick={() => { setEditingContent(null); setDialogOpen(true); }} className="mt-4 bg-[#AC1A5B]">
                      Create First IncubateHer Course
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                incubateHerContent.map(content => (
                  <Card key={content.id} className="border-l-4 border-l-[#AC1A5B]">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
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
                          <Button size="sm" variant="ghost" onClick={() => { setEditingContent(content); setDialogOpen(true); }}>
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
                  <Card key={content.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
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
                          <Button size="sm" variant="ghost" onClick={() => { setEditingContent(content); setDialogOpen(true); }}>
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
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContent ? 'Edit Content' : 'Add New Content'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input name="title" defaultValue={editingContent?.title} required />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea name="description" defaultValue={editingContent?.description} required rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content Type *</label>
                <Select name="content_type" defaultValue={editingContent?.content_type || 'course'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Funding Lane *</label>
                <Select name="funding_lane" defaultValue={editingContent?.funding_lane || 'general'}>
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

              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <Input name="duration_minutes" type="number" defaultValue={editingContent?.duration_minutes} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <Input name="order" type="number" defaultValue={editingContent?.order || 0} />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Content URL (Gamma, YouTube, etc.)</label>
                <Input name="content_url" type="url" defaultValue={editingContent?.content_url} />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                <Input name="thumbnail_url" type="url" defaultValue={editingContent?.thumbnail_url} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Premium Content?</label>
                <Select name="is_premium" defaultValue={editingContent?.is_premium ? 'true' : 'false'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No - Free for All</SelectItem>
                    <SelectItem value="true">Yes - Premium Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IncubateHer Only?</label>
                <Select name="incubateher_only" defaultValue={editingContent?.incubateher_only ? 'true' : 'false'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No - General Content</SelectItem>
                    <SelectItem value="true">Yes - IncubateHer Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Agenda Section (for IncubateHer)</label>
                <Select name="agenda_section" defaultValue={editingContent?.agenda_section || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    <SelectItem value="intro">Introduction & Orientation</SelectItem>
                    <SelectItem value="legal">Legal & Organizational Readiness</SelectItem>
                    <SelectItem value="financial">Financial Management & Budgeting</SelectItem>
                    <SelectItem value="grants">Grant Writing Fundamentals</SelectItem>
                    <SelectItem value="contracts">RFPs and Contract Proposals</SelectItem>
                    <SelectItem value="strategy">Funding Strategy & Sustainability</SelectItem>
                    <SelectItem value="consultation">One-on-One Consultations</SelectItem>
                    <SelectItem value="wrap">Wrap-Up & Next Steps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingContent ? 'Update' : 'Create'} Content
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}