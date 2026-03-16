import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';

export default function CommunityAdmin() {
  const queryClient = useQueryClient();
  const [editingSpace, setEditingSpace] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    space_name: '',
    slug: '',
    description: '',
    welcome_message: '',
    space_type: 'posts',
    visibility: 'public',
    icon: 'Users',
    allow_member_posts: true,
    moderation_required: false,
    notifications_enabled: true
  });

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ['allCommunitySpaces'],
    queryFn: () => base44.entities.CommunitySpace.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunitySpace.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCommunitySpaces'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunitySpace.update(editingSpace.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCommunitySpaces'] });
      setEditingSpace(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CommunitySpace.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCommunitySpaces'] });
      setDeleteConfirm(null);
    }
  });

  const resetForm = () => {
    setFormData({
      space_name: '',
      slug: '',
      description: '',
      welcome_message: '',
      space_type: 'posts',
      visibility: 'public',
      icon: 'Users',
      allow_member_posts: true,
      moderation_required: false,
      notifications_enabled: true
    });
  };

  const handleEdit = (space) => {
    setEditingSpace(space);
    setFormData(space);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSpace) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-2 border-[#143A50] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#143A50]">Community Spaces Manager</h1>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#143A50] hover:bg-[#1E4F58] flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Space
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Community Space</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Space Name</label>
                    <Input name="space_name" value={formData.space_name} onChange={handleInputChange} placeholder="e.g., Grant Writers Community" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                    <Input name="slug" value={formData.slug} onChange={handleInputChange} placeholder="e.g., grant-writers" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="What is this space about?" rows={3} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Welcome Message</label>
                  <Textarea name="welcome_message" value={formData.welcome_message} onChange={handleInputChange} placeholder="Welcome message when members enter" rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select name="space_type" value={formData.space_type} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option value="posts">Posts/Discussions</option>
                      <option value="events">Events</option>
                      <option value="chat">Chat</option>
                      <option value="course">Course</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                    <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="members_only">Members Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="allow_member_posts" checked={formData.allow_member_posts} onChange={handleInputChange} className="w-4 h-4" />
                    <span className="text-sm">Allow member posts</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="moderation_required" checked={formData.moderation_required} onChange={handleInputChange} className="w-4 h-4" />
                    <span className="text-sm">Require moderation</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="notifications_enabled" checked={formData.notifications_enabled} onChange={handleInputChange} className="w-4 h-4" />
                    <span className="text-sm">Enable notifications</span>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="bg-[#143A50] hover:bg-[#1E4F58]">Create Space</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {spaces.map(space => (
            <Card key={space.id} className="hover:shadow-md transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{space.space_name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{space.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline">{space.space_type}</Badge>
                      <Badge className={space.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{space.visibility}</Badge>
                      <Badge className={space.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                        {space.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex gap-6 mt-4 text-sm text-slate-600">
                      <span>👥 {space.member_count || 0} members</span>
                      <span>💬 {space.content_count || 0} posts</span>
                      <span>Settings: {space.settings?.allow_member_posts ? '✓' : '✗'} posts, {space.settings?.moderation_required ? '✓' : '✗'} moderation</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(space)} className="gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Space</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Space Name</label>
                              <Input name="space_name" value={formData.space_name} onChange={handleInputChange} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                              <Input name="slug" value={formData.slug} onChange={handleInputChange} />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Welcome Message</label>
                            <Textarea name="welcome_message" value={formData.welcome_message} onChange={handleInputChange} rows={2} />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                              <select name="space_type" value={formData.space_type} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                <option value="posts">Posts/Discussions</option>
                                <option value="events">Events</option>
                                <option value="chat">Chat</option>
                                <option value="course">Course</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                              <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="members_only">Members Only</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="allow_member_posts" checked={formData.allow_member_posts} onChange={handleInputChange} className="w-4 h-4" />
                              <span className="text-sm">Allow member posts</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="moderation_required" checked={formData.moderation_required} onChange={handleInputChange} className="w-4 h-4" />
                              <span className="text-sm">Require moderation</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="notifications_enabled" checked={formData.notifications_enabled} onChange={handleInputChange} className="w-4 h-4" />
                              <span className="text-sm">Enable notifications</span>
                            </label>
                          </div>

                          <div className="flex gap-3 mt-6">
                            <Button type="submit" className="bg-[#143A50] hover:bg-[#1E4F58]">Save Changes</Button>
                            <Button type="button" variant="outline" onClick={() => setEditingSpace(null)}>Cancel</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(space)} className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {spaces.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-slate-600">No community spaces yet. Create one to get started!</p>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Space</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{deleteConfirm?.space_name}"? This cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteConfirm.id)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}