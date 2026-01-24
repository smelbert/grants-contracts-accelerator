import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Upload, Loader2, Save, CheckCircle2, X } from 'lucide-react';

const SPECIALTIES = [
  'Grant Writing',
  'Contract Management',
  'Budget Development',
  'Program Evaluation',
  'Strategic Planning',
  'Nonprofit Management',
  'Fundraising',
  'Compliance',
  'Report Writing',
  'Community Engagement'
];

export default function CoachProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['coach-profile', user?.email],
    queryFn: () => base44.entities.CoachProfile.filter({ user_email: user.email }).then(r => r[0]),
    enabled: !!user?.email,
  });

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.CoachProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
      setEditMode(false);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CoachProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
      setEditMode(false);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, headshot_url: file_url });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (profile) {
      updateProfileMutation.mutate({ id: profile.id, data: formData });
    } else {
      createProfileMutation.mutate({ ...formData, user_email: user.email });
    }
  };

  const handleEdit = () => {
    setFormData(profile || {
      full_name: user.full_name || '',
      role: 'coach',
      title: '',
      bio: '',
      specialties: [],
      certifications: [],
      years_experience: 0,
      availability_status: 'available',
      max_clients: 10,
    });
    setEditMode(true);
  };

  const addSpecialty = (specialty) => {
    if (!formData.specialties?.includes(specialty)) {
      setFormData({ ...formData, specialties: [...(formData.specialties || []), specialty] });
    }
  };

  const removeSpecialty = (specialty) => {
    setFormData({ 
      ...formData, 
      specialties: formData.specialties.filter(s => s !== specialty) 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!profile && !editMode) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
              <p className="text-slate-600 mb-6">
                Create your coach profile to be visible to clients and administrators
              </p>
              <Button onClick={handleEdit} className="bg-emerald-600 hover:bg-emerald-700">
                <User className="w-4 h-4 mr-2" />
                Create Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600">Manage your professional information</p>
          </div>
          {!editMode && (
            <Button onClick={handleEdit} className="bg-emerald-600 hover:bg-emerald-700">
              Edit Profile
            </Button>
          )}
        </div>

        {editMode ? (
          /* Edit Mode */
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Headshot */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  {formData?.headshot_url && (
                    <img
                      src={formData.headshot_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="headshot-upload"
                    />
                    <label htmlFor="headshot-upload">
                      <Button asChild variant="outline" disabled={uploading}>
                        <span>
                          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          Upload Photo
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <Input
                    value={formData?.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <Input
                    placeholder="e.g., Senior Grant Coach"
                    value={formData?.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <Select
                    value={formData?.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                  <Input
                    type="number"
                    value={formData?.years_experience || 0}
                    onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <Textarea
                  rows={4}
                  placeholder="Share your background, experience, and approach..."
                  value={formData?.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData?.specialties?.map((spec) => (
                    <Badge key={spec} className="bg-emerald-600">
                      {spec}
                      <button
                        onClick={() => removeSpecialty(spec)}
                        className="ml-2 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add specialty..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact & Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <Input
                    value={formData?.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn URL</label>
                  <Input
                    value={formData?.linkedin_url || ''}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Calendar Link</label>
                  <Input
                    placeholder="https://calendly.com/..."
                    value={formData?.calendar_link || ''}
                    onChange={(e) => setFormData({ ...formData, calendar_link: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                  <Select
                    value={formData?.availability_status}
                    onValueChange={(value) => setFormData({ ...formData, availability_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="limited">Limited Availability</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {(createProfileMutation.isPending || updateProfileMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* View Mode */
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  {profile?.headshot_url ? (
                    <img
                      src={profile.headshot_url}
                      alt={profile.full_name}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900">{profile?.full_name}</h2>
                    <p className="text-lg text-slate-600">{profile?.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-emerald-600">{profile?.role}</Badge>
                      <Badge variant="outline">{profile?.years_experience} years experience</Badge>
                      <Badge 
                        className={
                          profile?.availability_status === 'available' ? 'bg-green-600' :
                          profile?.availability_status === 'limited' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }
                      >
                        {profile?.availability_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {profile?.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {profile?.specialties?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((spec) => (
                      <Badge key={spec} className="bg-emerald-600">{spec}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="text-slate-900">{user?.email}</p>
                </div>
                {profile?.phone && (
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="text-slate-900">{profile.phone}</p>
                  </div>
                )}
                {profile?.linkedin_url && (
                  <div>
                    <p className="text-sm text-slate-500">LinkedIn</p>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      View Profile
                    </a>
                  </div>
                )}
                {profile?.calendar_link && (
                  <div>
                    <p className="text-sm text-slate-500">Schedule a Meeting</p>
                    <a href={profile.calendar_link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      Book Time
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}