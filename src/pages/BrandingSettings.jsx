import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Upload, Save, CheckCircle2, Code } from 'lucide-react';

export default function BrandingSettings() {
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  const { data: themes = [] } = useQuery({
    queryKey: ['websiteThemes'],
    queryFn: () => base44.entities.WebsiteTheme.list()
  });

  const organization = organizations?.[0];
  const activeTheme = themes.find(t => t.is_active) || themes[0];

  const [orgData, setOrgData] = useState({
    custom_logo_url: '',
    brand_primary_color: '',
    brand_secondary_color: ''
  });

  const [themeData, setThemeData] = useState({
    theme_name: '',
    primary_color: '',
    secondary_color: '',
    accent_color: '',
    font_family: '',
    heading_font_family: '',
    logo_url: '',
    custom_css: '',
    custom_js: '',
    custom_head_html: ''
  });

  React.useEffect(() => {
    if (organization) {
      setOrgData({
        custom_logo_url: organization.custom_logo_url || '',
        brand_primary_color: organization.brand_primary_color || '#10b981',
        brand_secondary_color: organization.brand_secondary_color || '#14b8a6'
      });
    }
  }, [organization]);

  React.useEffect(() => {
    if (activeTheme) {
      setThemeData(activeTheme);
    }
  }, [activeTheme]);

  const updateOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.update(organization.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: (data) => activeTheme
      ? base44.entities.WebsiteTheme.update(activeTheme.id, data)
      : base44.entities.WebsiteTheme.create({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteThemes'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const handleSaveOrg = () => {
    updateOrgMutation.mutate(orgData);
  };

  const handleSaveTheme = () => {
    updateThemeMutation.mutate(themeData);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Palette className="w-8 h-8 text-emerald-600" />
          Branding & Customization
        </h1>
        <p className="text-slate-600 mt-2">Customize your platform's look and feel</p>
      </div>

      <Tabs defaultValue="organization">
        <TabsList>
          <TabsTrigger value="organization">Organization Branding</TabsTrigger>
          <TabsTrigger value="theme">Website Theme</TabsTrigger>
          <TabsTrigger value="custom">Custom Code</TabsTrigger>
        </TabsList>

        {/* Organization Branding */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Colors</CardTitle>
              <CardDescription>Your organization's visual identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Organization Logo URL</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    value={orgData.custom_logo_url}
                    onChange={(e) => setOrgData({ ...orgData, custom_logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {orgData.custom_logo_url && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <img src={orgData.custom_logo_url} alt="Logo preview" className="h-16 object-contain" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Primary Brand Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      type="color"
                      value={orgData.brand_primary_color}
                      onChange={(e) => setOrgData({ ...orgData, brand_primary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={orgData.brand_primary_color}
                      onChange={(e) => setOrgData({ ...orgData, brand_primary_color: e.target.value })}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Brand Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      type="color"
                      value={orgData.brand_secondary_color}
                      onChange={(e) => setOrgData({ ...orgData, brand_secondary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={orgData.brand_secondary_color}
                      onChange={(e) => setOrgData({ ...orgData, brand_secondary_color: e.target.value })}
                      placeholder="#14b8a6"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveOrg} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Organization Branding
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Theme */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize your website's appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Theme Name</Label>
                <Input
                  value={themeData.theme_name}
                  onChange={(e) => setThemeData({ ...themeData, theme_name: e.target.value })}
                  placeholder="My Custom Theme"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={themeData.primary_color || '#10b981'}
                      onChange={(e) => setThemeData({ ...themeData, primary_color: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeData.primary_color}
                      onChange={(e) => setThemeData({ ...themeData, primary_color: e.target.value })}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={themeData.secondary_color || '#14b8a6'}
                      onChange={(e) => setThemeData({ ...themeData, secondary_color: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeData.secondary_color}
                      onChange={(e) => setThemeData({ ...themeData, secondary_color: e.target.value })}
                      placeholder="#14b8a6"
                    />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={themeData.accent_color || '#f59e0b'}
                      onChange={(e) => setThemeData({ ...themeData, accent_color: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeData.accent_color}
                      onChange={(e) => setThemeData({ ...themeData, accent_color: e.target.value })}
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Body Font</Label>
                  <Input
                    value={themeData.font_family}
                    onChange={(e) => setThemeData({ ...themeData, font_family: e.target.value })}
                    placeholder="Inter, sans-serif"
                  />
                </div>
                <div>
                  <Label>Heading Font</Label>
                  <Input
                    value={themeData.heading_font_family}
                    onChange={(e) => setThemeData({ ...themeData, heading_font_family: e.target.value })}
                    placeholder="Poppins, sans-serif"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveTheme} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Code */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Code Snippets</CardTitle>
              <CardDescription>Add custom CSS, JavaScript, and tracking codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Custom CSS</Label>
                <Textarea
                  value={themeData.custom_css}
                  onChange={(e) => setThemeData({ ...themeData, custom_css: e.target.value })}
                  placeholder=".custom-class { color: red; }"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>Custom JavaScript</Label>
                <Textarea
                  value={themeData.custom_js}
                  onChange={(e) => setThemeData({ ...themeData, custom_js: e.target.value })}
                  placeholder="console.log('Hello');"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>Custom Head HTML (Tracking codes, etc.)</Label>
                <Textarea
                  value={themeData.custom_head_html}
                  onChange={(e) => setThemeData({ ...themeData, custom_head_html: e.target.value })}
                  placeholder="<script>/* Google Analytics */</script>"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <Alert>
                <Code className="w-4 h-4" />
                <AlertDescription>
                  Custom code will be applied globally across your platform. Test thoroughly before deploying.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button onClick={handleSaveTheme} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Custom Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {saved && (
        <Alert className="mt-6 bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700">
            Changes saved successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}