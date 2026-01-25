import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, Palette, Users, CreditCard, 
  Save, Upload, CheckCircle2, Settings
} from 'lucide-react';

export default function OrganizationSettingsPage() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const organization = organizations[0];

  const updateOrgMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Organization.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['organizations'])
  });

  if (!organization) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Organization Settings
          </h1>
          <p className="text-slate-600 mt-2">Manage your organization's profile and preferences</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">
              <Building2 className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users & Roles
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab organization={organization} onUpdate={updateOrgMutation.mutate} />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingTab organization={organization} onUpdate={updateOrgMutation.mutate} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab organization={organization} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab organization={organization} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProfileTab({ organization, onUpdate }) {
  const [formData, setFormData] = useState(organization);

  const handleSave = () => {
    onUpdate({ id: organization.id, data: formData });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Organization Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Organization Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="nonprofit">Nonprofit</option>
                <option value="for_profit">For-Profit</option>
                <option value="solopreneur">Solopreneur</option>
                <option value="community_based">Community-Based</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Development Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({...formData, stage: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="idea">Idea</option>
                <option value="early">Early</option>
                <option value="operating">Operating</option>
                <option value="scaling">Scaling</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Mission Statement</label>
            <Textarea
              value={formData.mission_statement || ''}
              onChange={(e) => setFormData({...formData, mission_statement: e.target.value})}
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Input
                value={formData.city || ''}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Input
                value={formData.state || ''}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Website</label>
              <Input
                value={formData.website || ''}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="bg-blue-600">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Preferences</CardTitle>
          <CardDescription>Set default funding lanes and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Enabled Funding Lanes</label>
            <div className="grid grid-cols-2 gap-3">
              {['grants', 'contracts', 'donors', 'public_funds'].map(lane => (
                <label key={lane} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.funding_lanes_enabled?.includes(lane)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...(formData.funding_lanes_enabled || []), lane]
                        : (formData.funding_lanes_enabled || []).filter(l => l !== lane);
                      setFormData({...formData, funding_lanes_enabled: updated});
                    }}
                    className="w-4 h-4"
                  />
                  <span className="capitalize">{lane.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} className="bg-blue-600">
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function BrandingTab({ organization, onUpdate }) {
  const [logoUrl, setLogoUrl] = useState(organization.custom_logo_url || '');
  const [brandColors, setBrandColors] = useState({
    primary: organization.brand_primary_color || '#143A50',
    secondary: organization.brand_secondary_color || '#E5C089'
  });

  const handleSave = () => {
    onUpdate({
      id: organization.id,
      data: {
        custom_logo_url: logoUrl,
        brand_primary_color: brandColors.primary,
        brand_secondary_color: brandColors.secondary
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Branding</CardTitle>
        <CardDescription>Customize how your organization appears in templates and documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Custom branding will be applied to all templates and documents you generate.
          </AlertDescription>
        </Alert>

        <div>
          <label className="text-sm font-medium mb-2 block">Organization Logo URL</label>
          <div className="flex gap-2">
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <Button variant="outline">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Primary Brand Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={brandColors.primary}
                onChange={(e) => setBrandColors({...brandColors, primary: e.target.value})}
                className="w-16 h-10 rounded cursor-pointer"
              />
              <Input
                value={brandColors.primary}
                onChange={(e) => setBrandColors({...brandColors, primary: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Secondary Brand Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={brandColors.secondary}
                onChange={(e) => setBrandColors({...brandColors, secondary: e.target.value})}
                className="w-16 h-10 rounded cursor-pointer"
              />
              <Input
                value={brandColors.secondary}
                onChange={(e) => setBrandColors({...brandColors, secondary: e.target.value})}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="bg-blue-600">
          <Save className="w-4 h-4 mr-2" />
          Save Branding
        </Button>
      </CardContent>
    </Card>
  );
}

function UsersTab({ organization }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Manage users and their roles within your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertDescription>
            User management features coming soon. Contact support to add or remove team members.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function BillingTab({ organization }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Subscription</CardTitle>
        <CardDescription>View and manage your subscription details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Current Plan</p>
            <p className="text-xl font-bold text-slate-900">Free Trial</p>
          </div>
          <Alert>
            <AlertDescription>
              Billing features coming soon. Contact sales for enterprise pricing.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}