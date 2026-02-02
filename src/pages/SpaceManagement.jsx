import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  Users, 
  Image as ImageIcon,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Edit
} from 'lucide-react';

const SPACE_TYPES = [
  { value: 'posts', label: 'Posts', icon: MessageSquare, description: 'Discussion forum for community posts', color: 'bg-blue-500' },
  { value: 'events', label: 'Events', icon: Calendar, description: 'Calendar of upcoming events and webinars', color: 'bg-purple-500' },
  { value: 'chat', label: 'Chat', icon: MessageCircle, description: 'Real-time messaging channels', color: 'bg-green-500' },
  { value: 'course', label: 'Course', icon: BookOpen, description: 'Learning content and curriculum', color: 'bg-orange-500' },
  { value: 'members', label: 'Members', icon: Users, description: 'Member directory and profiles', color: 'bg-pink-500' },
  { value: 'images', label: 'Images', icon: ImageIcon, description: 'Photo gallery and media library', color: 'bg-teal-500' }
];

export default function SpaceManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editingSpace, setEditingSpace] = useState(null);
  const [formData, setFormData] = useState({
    space_name: '',
    slug: '',
    description: '',
    space_type: '',
    visibility: 'public',
    icon: '',
    cover_image_url: '',
    settings: {
      allow_member_posts: true,
      moderation_required: false,
      notifications_enabled: true
    }
  });

  const queryClient = useQueryClient();

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ['communitySpaces'],
    queryFn: () => base44.entities.CommunitySpace.list('-display_order')
  });

  const createSpaceMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunitySpace.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communitySpaces'] });
      resetForm();
    }
  });

  const updateSpaceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CommunitySpace.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communitySpaces'] });
      resetForm();
    }
  });

  const deleteSpaceMutation = useMutation({
    mutationFn: (id) => base44.entities.CommunitySpace.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communitySpaces'] });
    }
  });

  const resetForm = () => {
    setFormData({
      space_name: '',
      slug: '',
      description: '',
      space_type: '',
      visibility: 'public',
      icon: '',
      cover_image_url: '',
      settings: {
        allow_member_posts: true,
        moderation_required: false,
        notifications_enabled: true
      }
    });
    setSelectedType(null);
    setEditingSpace(null);
    setShowCreateDialog(false);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData({ ...formData, space_type: type });
  };

  const handleSubmit = () => {
    if (editingSpace) {
      updateSpaceMutation.mutate({ id: editingSpace.id, data: formData });
    } else {
      createSpaceMutation.mutate(formData);
    }
  };

  const handleEdit = (space) => {
    setEditingSpace(space);
    setFormData(space);
    setSelectedType(space.space_type);
    setShowCreateDialog(true);
  };

  const getSpaceTypeConfig = (type) => {
    return SPACE_TYPES.find(t => t.value === type) || SPACE_TYPES[0];
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Community Spaces</h1>
          <p className="text-slate-600 mt-2">Organize your community with different space types</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Space
        </Button>
      </div>

      {spaces.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No spaces yet</h3>
            <p className="text-slate-600 mb-6">Create your first community space to get started</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
              Create Your First Space
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map(space => {
            const typeConfig = getSpaceTypeConfig(space.space_type);
            const Icon = typeConfig.icon;
            return (
              <Card key={space.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${typeConfig.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(space)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSpaceMutation.mutate(space.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{space.space_name}</CardTitle>
                  <CardDescription>{space.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{typeConfig.label}</Badge>
                    <Badge variant={space.visibility === 'public' ? 'default' : 'secondary'}>
                      {space.visibility === 'public' ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                      {space.visibility}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{space.member_count || 0} members</span>
                    <span>{space.content_count || 0} items</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Space Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSpace ? 'Edit Space' : 'Create New Space'}</DialogTitle>
            <DialogDescription>
              {!selectedType ? 'Choose a space type to get started' : 'Configure your community space'}
            </DialogDescription>
          </DialogHeader>

          {!selectedType ? (
            <div className="grid grid-cols-2 gap-4 py-4">
              {SPACE_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelect(type.value)}
                    className="p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                  >
                    <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
                    <p className="text-sm text-slate-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div>
                <Label>Space Name *</Label>
                <Input
                  value={formData.space_name}
                  onChange={(e) => setFormData({ ...formData, space_name: e.target.value })}
                  placeholder="e.g., General Discussion"
                />
              </div>

              <div>
                <Label>URL Slug *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., general-discussion"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this space is for..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => setFormData({ ...formData, visibility: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="members_only">Members Only - Logged in users</SelectItem>
                    <SelectItem value="private">Private - Invite only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Settings</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Allow member posts</Label>
                  <Switch
                    checked={formData.settings.allow_member_posts}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, allow_member_posts: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Require moderation</Label>
                  <Switch
                    checked={formData.settings.moderation_required}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, moderation_required: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable notifications</Label>
                  <Switch
                    checked={formData.settings.notifications_enabled}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, notifications_enabled: checked }
                    })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!formData.space_name || !formData.slug}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {editingSpace ? 'Update Space' : 'Create Space'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}