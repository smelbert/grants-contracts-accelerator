import React, { useState } from 'react';
import ReadinessBadge from '@/components/readiness/ReadinessBadge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, Save, CheckCircle2 } from 'lucide-react';
import ReadinessIndicator from '@/components/dashboard/ReadinessIndicator';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [userFormData, setUserFormData] = useState(null);

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      // Try primary_contact_email first (canonical field used by IncubateHer profile)
      const byEmail = await base44.entities.Organization.filter({ primary_contact_email: user.email });
      if (byEmail.length > 0) return byEmail;
      // Fallback to created_by
      return base44.entities.Organization.filter({ created_by: user.email });
    },
    enabled: !!user?.email,
  });

  const organization = organizations?.[0];
  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (organization && !formData) {
      setFormData(organization);
    }
    if (user && !userFormData) {
      setUserFormData(user);
    }
  }, [organization, user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.update(organization.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync(formData);
    if (userFormData) {
      await updateUserMutation.mutateAsync(userFormData);
    }
  };

  const handleUserChange = (field, value) => {
    setUserFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  if (userLoading || orgsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!organization || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Organization Profile
            </h1>
          </div>
          <p className="text-slate-500">
            Keep your information up to date for accurate AI content generation
          </p>
        </motion.div>

        {/* Readiness Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ReadinessIndicator status={organization.readiness_status} />
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Personal Info */}
          {userFormData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={userFormData.bio || ''}
                      onChange={(e) => handleUserChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={userFormData.location || ''}
                      onChange={(e) => handleUserChange('location', e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      value={userFormData.job_title || ''}
                      onChange={(e) => handleUserChange('job_title', e.target.value)}
                      placeholder="Your role"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={userFormData.phone_number || ''}
                      onChange={(e) => handleUserChange('phone_number', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={userFormData.linkedin_url || ''}
                      onChange={(e) => handleUserChange('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={userFormData.website || ''}
                      onChange={(e) => handleUserChange('website', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={formData.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>EIN Number</Label>
                  <Input
                    value={formData.ein_number || ''}
                    onChange={(e) => handleChange('ein_number', e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year Founded</Label>
                  <Input
                    type="number"
                    value={formData.year_founded || ''}
                    onChange={(e) => handleChange('year_founded', parseInt(e.target.value))}
                    placeholder="2020"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission & Programs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mission & Programs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mission Statement</Label>
                <Textarea
                  value={formData.mission_statement || ''}
                  onChange={(e) => handleChange('mission_statement', e.target.value)}
                  placeholder="What is your organization's purpose?"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Programs Description</Label>
                <Textarea
                  value={formData.programs_description || ''}
                  onChange={(e) => handleChange('programs_description', e.target.value)}
                  placeholder="Describe your key programs and services..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Population</Label>
                  <Input
                    value={formData.target_population || ''}
                    onChange={(e) => handleChange('target_population', e.target.value)}
                    placeholder="Who do you serve?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Geographic Reach</Label>
                  <Input
                    value={formData.geographic_reach || ''}
                    onChange={(e) => handleChange('geographic_reach', e.target.value)}
                    placeholder="Local, regional, national?"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>County</Label>
                  <Input
                    value={formData.county || ''}
                    onChange={(e) => handleChange('county', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Structure & Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Type</Label>
                  <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nonprofit">Nonprofit</SelectItem>
                      <SelectItem value="for_profit">For-Profit</SelectItem>
                      <SelectItem value="solopreneur">Solopreneur</SelectItem>
                      <SelectItem value="community_based">Community-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select value={formData.stage} onValueChange={(v) => handleChange('stage', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea Stage</SelectItem>
                      <SelectItem value="early">Early Stage</SelectItem>
                      <SelectItem value="operating">Operating</SelectItem>
                      <SelectItem value="scaling">Scaling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Annual Budget</Label>
                  <Select value={formData.annual_budget} onValueChange={(v) => handleChange('annual_budget', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_25k">Under $25K</SelectItem>
                      <SelectItem value="25k_100k">$25K - $100K</SelectItem>
                      <SelectItem value="100k_500k">$100K - $500K</SelectItem>
                      <SelectItem value="500k_1m">$500K - $1M</SelectItem>
                      <SelectItem value="1m_5m">$1M - $5M</SelectItem>
                      <SelectItem value="over_5m">Over $5M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Funding Experience</Label>
                  <Select value={formData.funding_experience} onValueChange={(v) => handleChange('funding_experience', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Experience</SelectItem>
                      <SelectItem value="some">Some Experience</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            {saved && (
              <Alert className="bg-emerald-50 border-emerald-200 flex-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <AlertDescription className="text-emerald-700">
                  Changes saved successfully!
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}