import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Calendar, Users, FileText, MessageSquare, 
  Edit, Save, Plus, BookOpen, File
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function ProjectDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }).then(r => r[0]),
    enabled: !!projectId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: () => base44.entities.ProjectComment.filter({ project_id: projectId }, '-created_date'),
    enabled: !!projectId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list(),
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      setIsEditing(false);
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project-comments', projectId]);
      setNewComment('');
    }
  });

  const handleEdit = () => {
    setEditData(project);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProjectMutation.mutate({ id: projectId, data: editData });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate({
      project_id: projectId,
      comment_text: newComment,
      author_email: user?.email,
      author_name: user?.full_name,
      comment_type: 'note'
    });
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to={createPageUrl('Projects')} className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editData.project_name}
                        onChange={(e) => setEditData({...editData, project_name: e.target.value})}
                        className="text-2xl font-bold mb-2"
                      />
                    ) : (
                      <CardTitle className="text-2xl mb-2">{project.project_name}</CardTitle>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge>{project.project_type.replace('_', ' ')}</Badge>
                      <Badge variant="outline">{project.status.replace('_', ' ')}</Badge>
                      <Badge variant="outline">{project.priority}</Badge>
                    </div>
                  </div>
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <Button onClick={handleSave} size="sm" className="bg-emerald-600">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-700">{project.description}</p>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Progress</span>
                    <span className="text-sm font-bold">{project.progress_percentage}%</span>
                  </div>
                  <Progress value={project.progress_percentage} className="h-3" />
                </div>

                {project.deadline && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {format(new Date(project.deadline), 'MMMM d, yyyy')}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{project.team_members?.length || 0} team members</span>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Templates/Documents/Comments */}
            <Tabs defaultValue="comments">
              <TabsList>
                <TabsTrigger value="comments">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <File className="w-4 h-4 mr-2" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a comment or note..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddComment} className="bg-emerald-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-slate-900">
                              {comment.author_name || comment.author_email}
                            </span>
                            <span className="text-xs text-slate-500">
                              {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.comment_text}</p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-center text-slate-500 py-8">No comments yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-500 text-center py-8">
                      Template linking coming soon. View templates in the Template Library.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-500 text-center py-8">
                      Document linking coming soon. View documents in the Documents section.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Add Template
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Team
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Created</p>
                  <p className="font-medium">{format(new Date(project.created_date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-slate-600">Created By</p>
                  <p className="font-medium">{project.created_by}</p>
                </div>
                <div>
                  <p className="text-slate-600">Last Updated</p>
                  <p className="font-medium">{format(new Date(project.updated_date), 'MMM d, yyyy')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}