import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DirectoryOptIn({ user, organization }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    organization_name: organization?.organization_name || '',
    location: '',
    website: organization?.website || '',
    phone: organization?.phone || '',
    service_overview: '',
    bio: '',
    shared_fields: []
  });

  // Fetch existing directory profile
  const { data: dirProfile } = useQuery({
    queryKey: ['directory-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.AppDirectoryProfile.filter({
        user_email: user.email
      });
      return profiles[0] || null;
    },
    enabled: !!user?.email
  });

  // Create/update directory profile mutation
  const updateDirectoryMutation = useMutation({
    mutationFn: async (data) => {
      if (dirProfile?.id) {
        return await base44.entities.AppDirectoryProfile.update(dirProfile.id, data);
      } else {
        return await base44.entities.AppDirectoryProfile.create(data);
      }
    },
    onSuccess: (response, variables) => {
      toast.success(variables.is_visible ? 'Added to App Directory!' : 'Removed from App Directory');
      setShowForm(false);
    },
    onError: (error) => {
      toast.error('Failed to update directory profile');
      console.error(error);
    }
  });

  const availableFields = [
    { key: 'name', label: 'Full Name', description: 'Your name' },
    { key: 'organization_name', label: 'Organization/Business Name', description: 'Your company or organization' },
    { key: 'location', label: 'Location(s)', description: 'Where you serve' },
    { key: 'website', label: 'Website', description: 'Your website URL' },
    { key: 'phone', label: 'Phone', description: 'Contact phone number' },
    { key: 'service_overview', label: 'Service Overview', description: 'Brief description of what you offer' },
    { key: 'bio', label: 'Professional Bio', description: 'About you and your expertise' }
  ];

  const handleAddToDirectory = () => {
    setFormData({
      name: user?.full_name || '',
      organization_name: organization?.organization_name || '',
      location: '',
      website: organization?.website || '',
      phone: organization?.phone || '',
      service_overview: '',
      bio: '',
      shared_fields: []
    });
    setShowForm(true);
  };

  const handleShare = () => {
    if (formData.shared_fields.length === 0) {
      toast.error('Please select at least one field to share');
      return;
    }

    updateDirectoryMutation.mutate({
      user_email: user.email,
      user_name: formData.name,
      organization_name: formData.organization_name,
      location: formData.location,
      website: formData.website,
      phone: formData.phone,
      service_overview: formData.service_overview,
      bio: formData.bio,
      shared_fields: formData.shared_fields,
      is_visible: true,
      visibility_added_date: new Date().toISOString()
    });
  };

  const handleRemove = () => {
    if (!dirProfile?.id) return;
    updateDirectoryMutation.mutate({
      is_visible: false
    });
  };

  const toggleFieldShare = (fieldKey) => {
    setFormData(prev => ({
      ...prev,
      shared_fields: prev.shared_fields.includes(fieldKey)
        ? prev.shared_fields.filter(f => f !== fieldKey)
        : [...prev.shared_fields, fieldKey]
    }));
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Globe className="w-5 h-5" />
          App Directory
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!dirProfile?.is_visible ? (
          <div className="space-y-4">
            <p className="text-sm text-blue-800">
              Share your profile in our community directory so others can discover and connect with you.
            </p>

            {!showForm ? (
              <Button 
                onClick={handleAddToDirectory}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Yourself to Directory
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-lg border">
                  <label className="text-sm font-medium mb-3 block">What would you like to share?</label>
                  <div className="space-y-2">
                    {availableFields.map(field => (
                      <label key={field.key} className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
                        <Checkbox
                          checked={formData.shared_fields.includes(field.key)}
                          onCheckedChange={() => toggleFieldShare(field.key)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">{field.label}</div>
                          <div className="text-xs text-slate-500">{field.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.shared_fields.includes('service_overview') && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Service Overview</label>
                    <Textarea
                      placeholder="Brief description of your services/expertise"
                      value={formData.service_overview}
                      onChange={(e) => setFormData({ ...formData, service_overview: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}

                {formData.shared_fields.includes('bio') && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Professional Bio</label>
                    <Textarea
                      placeholder="Tell others about your background and expertise"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}

                {formData.shared_fields.includes('location') && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Location(s) Served</label>
                    <Input
                      placeholder="e.g., New York, National"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                )}

                {formData.shared_fields.includes('phone') && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                    <Input
                      placeholder="Contact phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                )}

                {formData.shared_fields.includes('website') && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Website</label>
                    <Input
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleShare}
                    disabled={updateDirectoryMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updateDirectoryMutation.isPending ? 'Adding...' : 'Add to Directory'}
                  </Button>
                  <Button 
                    onClick={() => setShowForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200 bg-green-50">
              <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-green-900">You're in the App Directory</p>
                <p className="text-sm text-green-800 mt-0.5">
                  Your profile is visible to other community members.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border">
              <p className="text-xs font-medium text-slate-500 mb-2">Currently sharing:</p>
              <div className="flex flex-wrap gap-1.5">
                {dirProfile?.shared_fields?.map(field => {
                  const fieldLabel = availableFields.find(f => f.key === field)?.label;
                  return (
                    <Badge key={field} variant="outline" className="text-xs">
                      {fieldLabel}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Button 
              onClick={handleRemove}
              disabled={updateDirectoryMutation.isPending}
              variant="outline"
              className="text-red-600 hover:bg-red-50 border-red-200"
            >
              Remove from Directory
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}