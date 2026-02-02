import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Linkedin, 
  Globe, 
  MessageCircle,
  Shield,
  AlertCircle,
  Save,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfilePage() {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newExpertise, setNewExpertise] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const [formData, setFormData] = useState({
    bio: '',
    expertise: [],
    interests: [],
    social_links: {},
    visibility: 'members_only',
    allow_dms: true,
    notification_preferences: {
      email_notifications: true,
      event_reminders: true,
      discussion_replies: true
    }
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        expertise: profile.expertise || [],
        interests: profile.interests || [],
        social_links: profile.social_links || {},
        visibility: profile.visibility || 'members_only',
        allow_dms: profile.allow_dms !== false,
        notification_preferences: profile.notification_preferences || {
          email_notifications: true,
          event_reminders: true,
          discussion_replies: true
        }
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return base44.entities.UserProfile.update(profile.id, data);
      } else {
        return base44.entities.UserProfile.create({
          user_email: user.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setEditMode(false);
      toast.success('Profile updated successfully');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const addItem = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
      if (field === 'interests') setNewInterest('');
      if (field === 'expertise') setNewExpertise('');
    }
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#143A50] flex items-center justify-center text-white text-2xl font-bold">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{user?.full_name}</h1>
                <p className="text-slate-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => editMode ? handleSave() : setEditMode(true)}
              disabled={saveMutation.isPending}
              className="bg-[#143A50] hover:bg-[#1E4F58]"
            >
              {editMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              ) : (
                'Edit Profile'
              )}
            </Button>
          </div>

          {/* Bio */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-slate-700">{formData.bio || 'No bio added yet.'}</p>
              )}
            </CardContent>
          </Card>

          {/* Expertise & Interests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.expertise?.map((item, idx) => (
                    <Badge key={idx} className="bg-[#143A50] text-white">
                      {item}
                      {editMode && (
                        <button 
                          onClick={() => removeItem('expertise', idx)}
                          className="ml-1 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {editMode && (
                  <div className="flex gap-2">
                    <Input
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      placeholder="Add expertise"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('expertise', newExpertise))}
                    />
                    <Button size="icon" onClick={() => addItem('expertise', newExpertise)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.interests?.map((item, idx) => (
                    <Badge key={idx} variant="outline">
                      {item}
                      {editMode && (
                        <button 
                          onClick={() => removeItem('interests', idx)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {editMode && (
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add interest"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('interests', newInterest))}
                    />
                    <Button size="icon" onClick={() => addItem('interests', newInterest)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Social Links */}
          {editMode && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    value={formData.social_links?.linkedin || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, linkedin: e.target.value }
                    })}
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    value={formData.social_links?.website || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, website: e.target.value }
                    })}
                    placeholder="yourwebsite.com"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-xs text-slate-500">Who can see your profile</p>
                    </div>
                    <Select 
                      value={formData.visibility} 
                      onValueChange={(v) => setFormData({ ...formData, visibility: v })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="members_only">Members Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Direct Messages</Label>
                      <p className="text-xs text-slate-500">Let others message you</p>
                    </div>
                    <Switch
                      checked={formData.allow_dms}
                      onCheckedChange={(v) => setFormData({ ...formData, allow_dms: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <Switch
                      checked={formData.notification_preferences?.email_notifications}
                      onCheckedChange={(v) => setFormData({
                        ...formData,
                        notification_preferences: { ...formData.notification_preferences, email_notifications: v }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Event Reminders</Label>
                    <Switch
                      checked={formData.notification_preferences?.event_reminders}
                      onCheckedChange={(v) => setFormData({
                        ...formData,
                        notification_preferences: { ...formData.notification_preferences, event_reminders: v }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Discussion Replies</Label>
                    <Switch
                      checked={formData.notification_preferences?.discussion_replies}
                      onCheckedChange={(v) => setFormData({
                        ...formData,
                        notification_preferences: { ...formData.notification_preferences, discussion_replies: v }
                      })}
                    />
                  </div>
                </>
              )}
              
              {!editMode && (
                <div className="space-y-2 text-sm text-slate-600">
                  <p>Visibility: <span className="font-medium capitalize">{formData.visibility?.replace('_', ' ')}</span></p>
                  <p>Direct Messages: <span className="font-medium">{formData.allow_dms ? 'Enabled' : 'Disabled'}</span></p>
                </div>
              )}
            </CardContent>
          </Card>

          {editMode && (
            <Button 
              variant="outline" 
              onClick={() => setEditMode(false)}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}