import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Bell, Sparkles, TrendingUp, X, Plus, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OpportunityMatchingProfile() {
  const queryClient = useQueryClient();
  const [newKeyword, setNewKeyword] = useState('');
  const [newExcluded, setNewExcluded] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newGeo, setNewGeo] = useState('');
  const [testingMatches, setTestingMatches] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['opportunity-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserOpportunityProfile.filter({
        user_email: user.email
      });
      return profiles[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: testMatches } = useQuery({
    queryKey: ['test-matches', user?.email],
    queryFn: async () => {
      if (!user?.email || !profile) return null;
      const response = await base44.functions.invoke('matchOpportunities', {});
      return response.data;
    },
    enabled: testingMatches && !!profile
  });

  const [formData, setFormData] = useState({
    organization_mission: '',
    sector_focus: [],
    geographic_focus: [],
    keywords: [],
    excluded_keywords: [],
    organization_type: '501c3',
    annual_budget: 'under_100k',
    funding_preferences: {
      min_amount: 0,
      max_amount: 0,
      preferred_lanes: [],
      preferred_types: []
    },
    notification_frequency: 'weekly',
    notification_enabled: true,
    minimum_match_score: 70
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        organization_mission: profile.organization_mission || '',
        sector_focus: profile.sector_focus || [],
        geographic_focus: profile.geographic_focus || [],
        keywords: profile.keywords || [],
        excluded_keywords: profile.excluded_keywords || [],
        organization_type: profile.organization_type || '501c3',
        annual_budget: profile.annual_budget || 'under_100k',
        funding_preferences: profile.funding_preferences || {
          min_amount: 0,
          max_amount: 0,
          preferred_lanes: [],
          preferred_types: []
        },
        notification_frequency: profile.notification_frequency || 'weekly',
        notification_enabled: profile.notification_enabled !== false,
        minimum_match_score: profile.minimum_match_score || 70
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return await base44.entities.UserOpportunityProfile.update(profile.id, data);
      } else {
        return await base44.entities.UserOpportunityProfile.create({
          ...data,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['opportunity-profile']);
      toast.success('Profile saved successfully!');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const addItem = (field, value, setterFn) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
    setterFn('');
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const togglePreference = (field, value) => {
    setFormData(prev => {
      const current = prev.funding_preferences[field] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return {
        ...prev,
        funding_preferences: {
          ...prev.funding_preferences,
          [field]: updated
        }
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#143A50]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#143A50]">Opportunity Matching Profile</h1>
              <p className="text-slate-600">Get personalized funding recommendations</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Setup</TabsTrigger>
            <TabsTrigger value="preview">
              <Sparkles className="w-4 h-4 mr-2" />
              Preview Matches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>Tell us about your organization's mission and focus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Mission Statement</Label>
                  <Textarea
                    value={formData.organization_mission}
                    onChange={(e) => setFormData({ ...formData, organization_mission: e.target.value })}
                    placeholder="Describe your organization's mission and goals..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Type</Label>
                    <Select value={formData.organization_type} onValueChange={(v) => setFormData({ ...formData, organization_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="501c3">501(c)(3) Nonprofit</SelectItem>
                        <SelectItem value="nonprofit">Other Nonprofit</SelectItem>
                        <SelectItem value="school">School/K-12</SelectItem>
                        <SelectItem value="university">University/College</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="faith_based">Faith-Based</SelectItem>
                        <SelectItem value="community_org">Community Organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Annual Budget</Label>
                    <Select value={formData.annual_budget} onValueChange={(v) => setFormData({ ...formData, annual_budget: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_100k">Under $100K</SelectItem>
                        <SelectItem value="100k_500k">$100K - $500K</SelectItem>
                        <SelectItem value="500k_1m">$500K - $1M</SelectItem>
                        <SelectItem value="1m_5m">$1M - $5M</SelectItem>
                        <SelectItem value="5m_plus">$5M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Sector Focus Areas</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSector}
                      onChange={(e) => setNewSector(e.target.value)}
                      placeholder="e.g., Education, Health, Environment"
                      onKeyPress={(e) => e.key === 'Enter' && addItem('sector_focus', newSector, setNewSector)}
                    />
                    <Button onClick={() => addItem('sector_focus', newSector, setNewSector)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.sector_focus.map((sector, idx) => (
                      <Badge key={idx} variant="outline" className="gap-2">
                        {sector}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('sector_focus', idx)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Geographic Focus</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newGeo}
                      onChange={(e) => setNewGeo(e.target.value)}
                      placeholder="e.g., Ohio, Columbus, Midwest"
                      onKeyPress={(e) => e.key === 'Enter' && addItem('geographic_focus', newGeo, setNewGeo)}
                    />
                    <Button onClick={() => addItem('geographic_focus', newGeo, setNewGeo)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.geographic_focus.map((geo, idx) => (
                      <Badge key={idx} variant="outline" className="gap-2">
                        {geo}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('geographic_focus', idx)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funding Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Minimum Award Amount</Label>
                    <Input
                      type="number"
                      value={formData.funding_preferences.min_amount}
                      onChange={(e) => setFormData({
                        ...formData,
                        funding_preferences: { ...formData.funding_preferences, min_amount: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Maximum Award Amount</Label>
                    <Input
                      type="number"
                      value={formData.funding_preferences.max_amount}
                      onChange={(e) => setFormData({
                        ...formData,
                        funding_preferences: { ...formData.funding_preferences, max_amount: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Preferred Funding Lanes</Label>
                  <div className="flex flex-wrap gap-2">
                    {['grants', 'contracts', 'donors', 'public_funds'].map(lane => (
                      <Badge
                        key={lane}
                        variant={formData.funding_preferences.preferred_lanes?.includes(lane) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => togglePreference('preferred_lanes', lane)}
                      >
                        {lane.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Preferred Opportunity Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {['grant', 'contract', 'rfp', 'rfq', 'donor_program'].map(type => (
                      <Badge
                        key={type}
                        variant={formData.funding_preferences.preferred_types?.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => togglePreference('preferred_types', type)}
                      >
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Keywords & Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Include Keywords</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="e.g., youth, training, capacity building"
                      onKeyPress={(e) => e.key === 'Enter' && addItem('keywords', newKeyword, setNewKeyword)}
                    />
                    <Button onClick={() => addItem('keywords', newKeyword, setNewKeyword)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.keywords.map((kw, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-800 gap-2">
                        {kw}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('keywords', idx)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Exclude Keywords</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newExcluded}
                      onChange={(e) => setNewExcluded(e.target.value)}
                      placeholder="e.g., research, clinical trials"
                      onKeyPress={(e) => e.key === 'Enter' && addItem('excluded_keywords', newExcluded, setNewExcluded)}
                    />
                    <Button onClick={() => addItem('excluded_keywords', newExcluded, setNewExcluded)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.excluded_keywords.map((kw, idx) => (
                      <Badge key={idx} className="bg-red-100 text-red-800 gap-2">
                        {kw}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('excluded_keywords', idx)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Digest Notifications</Label>
                    <p className="text-sm text-slate-500">Receive email summaries of matched opportunities</p>
                  </div>
                  <Switch
                    checked={formData.notification_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, notification_enabled: checked })}
                  />
                </div>

                <div>
                  <Label>Digest Frequency</Label>
                  <Select value={formData.notification_frequency} onValueChange={(v) => setFormData({ ...formData, notification_frequency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Minimum Match Score: {formData.minimum_match_score}%</Label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={formData.minimum_match_score}
                    onChange={(e) => setFormData({ ...formData, minimum_match_score: parseInt(e.target.value) })}
                    className="w-full mt-2"
                  />
                  <p className="text-sm text-slate-500 mt-1">Only opportunities scoring above this threshold will be included</p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} size="lg" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save Profile
            </Button>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview Your Matches</CardTitle>
                <CardDescription>See what opportunities match your current profile</CardDescription>
              </CardHeader>
              <CardContent>
                {!profile ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 mb-4">Save your profile first to see matches</p>
                    <Button onClick={() => document.querySelector('[value="profile"]').click()}>
                      Go to Profile Setup
                    </Button>
                  </div>
                ) : !testingMatches ? (
                  <Button onClick={() => setTestingMatches(true)}>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Find My Matches
                  </Button>
                ) : !testMatches ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#143A50]" />
                    <p className="text-slate-600 mt-4">Finding your perfect matches...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-lg font-semibold">
                        Found {testMatches.matches.length} matches out of {testMatches.total_opportunities} opportunities
                      </p>
                      <Button variant="outline" onClick={() => setTestingMatches(false)}>
                        Refresh
                      </Button>
                    </div>
                    {testMatches.matches.slice(0, 5).map((match, idx) => (
                      <Card key={idx} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{match.opportunity.title}</h3>
                            <Badge className="bg-green-100 text-green-800">
                              {match.score}% Match
                            </Badge>
                          </div>
                          <p className="text-slate-600 text-sm mb-3">{match.opportunity.funder_name}</p>
                          <div className="space-y-1">
                            {match.reasons.map((reason, ridx) => (
                              <p key={ridx} className="text-sm text-slate-700">✓ {reason}</p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}