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
    if (organization?.id) {
      await updateMutation.mutateAsync(formData);
    } else if (user?.email) {
      // Create new org record with canonical field names
      const newOrg = await base44.entities.Organization.create({
        ...formData,
        primary_contact_email: user.email
      });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
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

  // Initialize empty form if no org exists yet (new user)
  if (!formData && !orgsLoading && !userLoading) {
    setFormData({});
  }

  if (!formData) return null;

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
                  <Label>Organization / Business Name</Label>
                  <Input
                    value={formData.organization_name || ''}
                    onChange={(e) => handleChange('organization_name', e.target.value)}
                    placeholder="e.g., Community Care Nonprofit or Jane's LLC"
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
                  <Label>EIN / Tax ID</Label>
                  <Input
                    value={formData.ein || ''}
                    onChange={(e) => handleChange('ein', e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year Founded</Label>
                  <Input
                    type="number"
                    value={formData.founding_year || ''}
                    onChange={(e) => handleChange('founding_year', e.target.value)}
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
                <Label>Programs &amp; Services</Label>
                <Textarea
                  value={formData.programs_offered || ''}
                  onChange={(e) => handleChange('programs_offered', e.target.value)}
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
                  <Label>Geographic Service Area</Label>
                  <Input
                    value={formData.geographic_service_area || ''}
                    onChange={(e) => handleChange('geographic_service_area', e.target.value)}
                    placeholder="e.g., Franklin County, OH or Nationwide"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact &amp; Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mailing Address</Label>
                <Textarea
                  value={formData.mailing_address || ''}
                  onChange={(e) => handleChange('mailing_address', e.target.value)}
                  placeholder="Full mailing address"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Leader Name</Label>
                  <Input
                    value={formData.primary_leader_name || ''}
                    onChange={(e) => handleChange('primary_leader_name', e.target.value)}
                    placeholder="CEO, Owner, Executive Director"
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
                  <Input
                    value={formData.organization_type || ''}
                    onChange={(e) => handleChange('organization_type', e.target.value)}
                    placeholder="e.g., 501(c)(3) Nonprofit, LLC, Sole Proprietor"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Revenue / Funding Stage</Label>
                  <Select value={formData.revenue_stage || ''} onValueChange={(v) => handleChange('revenue_stage', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre_revenue">Pre-Revenue / Just Starting</SelectItem>
                      <SelectItem value="early_stage">Early Stage (under $25K)</SelectItem>
                      <SelectItem value="growing">Growing ($25K–$100K)</SelectItem>
                      <SelectItem value="established_small">Established Small ($100K–$500K)</SelectItem>
                      <SelectItem value="established_mid">Established Mid-Size ($500K–$1M)</SelectItem>
                      <SelectItem value="scaling">Scaling (over $1M)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Annual Budget (approximate)</Label>
                  <Input
                    value={formData.annual_budget || ''}
                    onChange={(e) => handleChange('annual_budget', e.target.value)}
                    placeholder="e.g., $50,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grant / Contract Writing Experience</Label>
                  <Select value={formData.grant_experience_level || ''} onValueChange={(v) => handleChange('grant_experience_level', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner — Never written a grant</SelectItem>
                      <SelectItem value="some_attempts">Some Attempts — Not yet successful</SelectItem>
                      <SelectItem value="intermediate">Intermediate — Some successes</SelectItem>
                      <SelectItem value="advanced">Advanced — Regular grant writer</SelectItem>
                      <SelectItem value="expert">Expert — Extensive track record</SelectItem>
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