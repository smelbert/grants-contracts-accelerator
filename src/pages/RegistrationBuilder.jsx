import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Sparkles, Copy, Eye, Trash2, Edit, Wand2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RegistrationBuilder() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    page_name: '',
    slug: '',
    registration_type: 'workshop',
    title: '',
    description: '',
    hero_image_url: '',
    offering_details: {},
    pricing: { type: 'free', amount: 0, currency: 'USD' },
    access_level: 'community_only',
    community_space_id: '',
    requires_intake_form: false,
    custom_questions: [],
    post_registration_survey_enabled: true,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: registrationPages = [] } = useQuery({
    queryKey: ['registrationPages'],
    queryFn: () => base44.entities.RegistrationPage.list()
  });

  const { data: communitySpaces = [] } = useQuery({
    queryKey: ['communitySpaces'],
    queryFn: () => base44.entities.CommunitySpace.list()
  });

  const createPageMutation = useMutation({
    mutationFn: (data) => base44.entities.RegistrationPage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['registrationPages']);
      toast.success('Registration page created!');
      setIsCreating(false);
      resetForm();
    }
  });

  const updatePageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RegistrationPage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['registrationPages']);
      toast.success('Registration page updated!');
      setEditingPage(null);
      resetForm();
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: (id) => base44.entities.RegistrationPage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['registrationPages']);
      toast.success('Registration page deleted');
    }
  });

  const resetForm = () => {
    setFormData({
      page_name: '',
      slug: '',
      registration_type: 'workshop',
      title: '',
      description: '',
      hero_image_url: '',
      offering_details: {},
      pricing: { type: 'free', amount: 0, currency: 'USD' },
      access_level: 'community_only',
      community_space_id: '',
      requires_intake_form: false,
      custom_questions: [],
      post_registration_survey_enabled: true,
      is_active: true
    });
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = () => {
    if (editingPage) {
      updatePageMutation.mutate({ id: editingPage.id, data: formData });
    } else {
      createPageMutation.mutate(formData);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData(page);
    setIsCreating(true);
  };

  const copyRegistrationLink = (slug) => {
    const url = `${window.location.origin}/register/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const generateWithAI = async () => {
    if (!formData.page_name || !formData.registration_type) {
      toast.error('Please enter a page name and select registration type first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create compelling registration page content for "${formData.page_name}" which is a ${formData.registration_type} offering by Elbert Innovative Solutions (EIS), a nonprofit consulting firm specializing in grant writing, capacity building, and funding strategy.

Generate:
1. A compelling title (10 words max)
2. A description (2-3 sentences explaining value and benefits)
3. Offering details including suggested duration, format, and what participants will gain

Keep the tone professional, empowering, and focused on outcomes. Emphasize EIS's expertise in helping nonprofits and social impact organizations secure funding and build capacity.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            suggested_duration: { type: "string" },
            suggested_format: { type: "string" },
            key_outcomes: { type: "string" }
          }
        }
      });

      setFormData({
        ...formData,
        title: response.title,
        description: response.description,
        offering_details: {
          ...formData.offering_details,
          duration: response.suggested_duration,
          format: response.suggested_format
        }
      });

      toast.success('AI content generated!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const typeColors = {
    workshop: 'bg-blue-100 text-blue-800',
    training: 'bg-green-100 text-green-800',
    coaching: 'bg-purple-100 text-purple-800',
    community_only: 'bg-pink-100 text-pink-800',
    course: 'bg-amber-100 text-amber-800'
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {editingPage ? 'Edit' : 'Create'} Registration Page
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={generateWithAI}
                disabled={isGenerating || !formData.page_name || !formData.registration_type}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'AI Assist'}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingPage(null);
                resetForm();
              }}>
                Cancel
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <Tabs defaultValue="basic">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Offering Details</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="access">Access & Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div>
                    <Label>Page Name</Label>
                    <Input
                      value={formData.page_name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData({
                          ...formData,
                          page_name: name,
                          slug: generateSlug(name)
                        });
                      }}
                      placeholder="Grant Writing Workshop"
                    />
                  </div>

                  <div>
                    <Label>URL Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="grant-writing-workshop"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Registration link: /register/{formData.slug}
                    </p>
                  </div>

                  <div>
                    <Label>Registration Type</Label>
                    <Select
                      value={formData.registration_type}
                      onValueChange={(value) => setFormData({ ...formData, registration_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="coaching">Coaching</SelectItem>
                        <SelectItem value="community_only">Community Only</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Master Grant Writing in 6 Weeks"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Learn proven strategies for successful grant proposals..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Hero Image URL</Label>
                    <Input
                      value={formData.hero_image_url}
                      onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={formData.offering_details.duration || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        offering_details: { ...formData.offering_details, duration: e.target.value }
                      })}
                      placeholder="6 weeks"
                    />
                  </div>

                  <div>
                    <Label>Format</Label>
                    <Input
                      value={formData.offering_details.format || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        offering_details: { ...formData.offering_details, format: e.target.value }
                      })}
                      placeholder="Virtual/In-person/Hybrid"
                    />
                  </div>

                  <div>
                    <Label>Dates</Label>
                    <Input
                      value={formData.offering_details.dates || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        offering_details: { ...formData.offering_details, dates: e.target.value }
                      })}
                      placeholder="March 15 - April 26, 2026"
                    />
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      value={formData.offering_details.location || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        offering_details: { ...formData.offering_details, location: e.target.value }
                      })}
                      placeholder="Zoom/Address"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4 mt-4">
                  <div>
                    <Label>Pricing Type</Label>
                    <Select
                      value={formData.pricing.type}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, type: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="one_time">One-Time Payment</SelectItem>
                        <SelectItem value="package">Package</SelectItem>
                        <SelectItem value="per_session">Per Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.pricing.type !== 'free' && (
                    <>
                      <div>
                        <Label>Amount ($)</Label>
                        <Input
                          type="number"
                          value={formData.pricing.amount}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, amount: parseFloat(e.target.value) }
                          })}
                          placeholder="99.00"
                        />
                      </div>

                      <div>
                        <Label>Stripe Price ID (optional)</Label>
                        <Input
                          value={formData.pricing.stripe_price_id || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, stripe_price_id: e.target.value }
                          })}
                          placeholder="price_xxx"
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="access" className="space-y-4 mt-4">
                  <div>
                    <Label>Access Level After Registration</Label>
                    <Select
                      value={formData.access_level}
                      onValueChange={(value) => setFormData({ ...formData, access_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="community_only">Community Only</SelectItem>
                        <SelectItem value="coaching_portal">Coaching Portal</SelectItem>
                        <SelectItem value="full_platform">Full Platform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Assign to Community Space</Label>
                    <Select
                      value={formData.community_space_id}
                      onValueChange={(value) => setFormData({ ...formData, community_space_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select space..." />
                      </SelectTrigger>
                      <SelectContent>
                        {communitySpaces.map((space) => (
                          <SelectItem key={space.id} value={space.id}>
                            {space.space_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Require Intake Form (Coaching)</Label>
                    <Switch
                      checked={formData.requires_intake_form}
                      onCheckedChange={(checked) => setFormData({ ...formData, requires_intake_form: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Post-Event Survey</Label>
                    <Switch
                      checked={formData.post_registration_survey_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, post_registration_survey_enabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setIsCreating(false);
                  setEditingPage(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingPage ? 'Update' : 'Create'} Registration Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Registration Pages</h1>
            <p className="text-slate-600">Create custom registration flows for workshops, coaching, and more</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Registration Page
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrationPages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={typeColors[page.registration_type]}>
                      {page.registration_type}
                    </Badge>
                    <CardTitle className="mt-2">{page.page_name}</CardTitle>
                    <CardDescription className="text-xs">/register/{page.slug}</CardDescription>
                  </div>
                  {!page.is_active && (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{page.description}</p>
                
                <div className="space-y-2 text-xs text-slate-500 mb-4">
                  <div>Access: {page.access_level}</div>
                  <div>Pricing: {page.pricing.type === 'free' ? 'Free' : `$${page.pricing.amount}`}</div>
                  {page.max_registrations && (
                    <div>Spots: {page.current_registrations || 0}/{page.max_registrations}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyRegistrationLink(page.slug)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(page)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePageMutation.mutate(page.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}