import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Target, 
  Users, 
  DollarSign, 
  MapPin, 
  Save, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import SignatureField from '@/components/legal/SignatureField';
import JotFormProfile from '@/components/incubateher/JotFormProfile';

export default function IncubateHerProfileIntake() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');
  const [aiGenerating, setAiGenerating] = useState({});
  const [formData, setFormData] = useState({
    // Basic Organization Info
    organization_name: '',
    organization_type: '',
    ein: '',
    founding_year: '',
    website: '',
    
    // Mission & Vision
    mission_statement: '',
    vision_statement: '',
    organizational_values: '',
    
    // Programs & Services
    programs_offered: '',
    target_population: '',
    geographic_service_area: '',
    annual_people_served: '',
    
    // Leadership & Team
    executive_director: '',
    board_chair: '',
    staff_count: '',
    volunteer_count: '',
    board_size: '',
    
    // Financial Information
    annual_budget: '',
    funding_sources: '',
    largest_grant_amount: '',
    grant_experience_level: '',
    
    // Organizational Capacity
    has_strategic_plan: false,
    has_financial_systems: false,
    has_evaluation_system: false,
    has_data_tracking: false,
    
    // Contact & Social
    mailing_address: '',
    phone: '',
    social_media: '',
    
    // Goals & Needs
    funding_goals: '',
    capacity_building_needs: '',
    technical_assistance_needed: ''
  });
  const [lastSaved, setLastSaved] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollment } = useQuery({
    queryKey: ['incubateher-enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email,
        role: 'participant'
      });
      return enrollments.find(e => e.cohort_id);
    },
    enabled: !!user?.email
  });

  const { data: existingProfile, isLoading } = useQuery({
    queryKey: ['organization-profile', enrollment?.id],
    queryFn: async () => {
      if (!enrollment?.id) return null;
      const profiles = await base44.entities.Organization.filter({
        enrollment_id: enrollment.id
      });
      return profiles[0];
    },
    enabled: !!enrollment?.id
  });

  useEffect(() => {
    if (existingProfile) {
      setFormData(prev => ({
        ...prev,
        ...existingProfile
      }));
      setLastSaved(new Date(existingProfile.updated_date));
    }
  }, [existingProfile]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (existingProfile?.id) {
        return await base44.entities.Organization.update(existingProfile.id, data);
      } else {
        return await base44.entities.Organization.create({
          ...data,
          enrollment_id: enrollment.id,
          primary_contact_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-profile'] });
      setLastSaved(new Date());
      toast.success('Profile saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save profile');
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    await saveProfileMutation.mutateAsync(formData);
  };

  const handleAIAssist = async (field, prompt) => {
    setAiGenerating(prev => ({ ...prev, [field]: true }));
    
    try {
      const contextPrompt = `Help this nonprofit organization complete their profile. 
      
Organization: ${formData.organization_name || 'unnamed organization'}
${formData.mission_statement ? `Mission: ${formData.mission_statement}` : ''}
${formData.programs_offered ? `Programs: ${formData.programs_offered}` : ''}

${prompt}

Provide a concise, professional response (2-3 sentences max for short fields, 1-2 paragraphs for longer fields).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });

      handleChange(field, response);
      toast.success('AI suggestion generated!');
    } catch (error) {
      toast.error('Failed to generate AI suggestion');
    } finally {
      setAiGenerating(prev => ({ ...prev, [field]: false }));
    }
  };

  const calculateProgress = () => {
    const fields = Object.keys(formData);
    const filledFields = fields.filter(key => {
      const value = formData[key];
      if (typeof value === 'boolean') return true;
      return value && value.toString().trim().length > 0;
    });
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const progress = calculateProgress();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#143A50]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <CoBrandedHeader 
        title="Organization Profile"
        subtitle="Complete your profile to auto-fill workbook responses"
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        <Card className="mb-6 border-2 border-[#E5C089]">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#143A50]">Profile Completion</h2>
                <p className="text-slate-600 mt-1">
                  Complete your profile to automatically populate your workbook responses
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-[#143A50]">{progress}%</div>
                <div className="text-sm text-slate-600">Complete</div>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
            
            {lastSaved && (
              <div className="flex items-center gap-2 mt-4 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Last saved: {lastSaved.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* JotForm Registration Data */}
        {enrollment && (enrollment.jotform_data || enrollment.enrollment_notes) && (
          <div className="mb-6">
            <JotFormProfile enrollment={enrollment} />
          </div>
        )}

        {/* Alert: Why this matters */}
        <Card className="mb-6 bg-blue-50 border-2 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Why complete your profile?</h3>
                <p className="text-sm text-blue-800">
                  Your profile information will automatically populate throughout your workbook, saving you time 
                  and ensuring consistency across all your documents. You can always come back and update it later!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Form */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">
              <Building2 className="w-4 h-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="mission">
              <Target className="w-4 h-4 mr-2" />
              Mission
            </TabsTrigger>
            <TabsTrigger value="programs">
              <Users className="w-4 h-4 mr-2" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="financial">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="goals">
              <ChevronRight className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Organization Information</CardTitle>
                <CardDescription>
                  Tell us about your organization's legal and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Organization Name *</Label>
                  <Input
                    value={formData.organization_name}
                    onChange={(e) => handleChange('organization_name', e.target.value)}
                    placeholder="e.g., Community Care Nonprofit"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Type</Label>
                    <Input
                      value={formData.organization_type}
                      onChange={(e) => handleChange('organization_type', e.target.value)}
                      placeholder="e.g., 501(c)(3)"
                    />
                  </div>
                  <div>
                    <Label>EIN (Tax ID)</Label>
                    <Input
                      value={formData.ein}
                      onChange={(e) => handleChange('ein', e.target.value)}
                      placeholder="e.g., 12-3456789"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Year Founded</Label>
                    <Input
                      type="number"
                      value={formData.founding_year}
                      onChange={(e) => handleChange('founding_year', e.target.value)}
                      placeholder="e.g., 2015"
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://yourwebsite.org"
                    />
                  </div>
                </div>

                <div>
                  <Label>Mailing Address</Label>
                  <Textarea
                    value={formData.mailing_address}
                    onChange={(e) => handleChange('mailing_address', e.target.value)}
                    placeholder="Full mailing address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label>Social Media Handles</Label>
                    <Input
                      value={formData.social_media}
                      onChange={(e) => handleChange('social_media', e.target.value)}
                      placeholder="@yourorg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mission Tab */}
          <TabsContent value="mission">
            <Card>
              <CardHeader>
                <CardTitle>Mission, Vision & Values</CardTitle>
                <CardDescription>
                  Define your organization's purpose and guiding principles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Mission Statement *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIAssist('mission_statement', 'Write a compelling mission statement for this organization based on the information provided. Focus on WHO they serve, WHAT they do, and WHY it matters.')}
                      disabled={aiGenerating.mission_statement}
                    >
                      {aiGenerating.mission_statement ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Assist
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={formData.mission_statement}
                    onChange={(e) => handleChange('mission_statement', e.target.value)}
                    placeholder="Our mission is to..."
                    rows={4}
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    What your organization does and why it exists
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Vision Statement</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIAssist('vision_statement', 'Write an inspiring vision statement that describes the ideal future state this organization is working toward.')}
                      disabled={aiGenerating.vision_statement}
                    >
                      {aiGenerating.vision_statement ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Assist
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={formData.vision_statement}
                    onChange={(e) => handleChange('vision_statement', e.target.value)}
                    placeholder="We envision a world where..."
                    rows={3}
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    The future you're working to create
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Organizational Values</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIAssist('organizational_values', 'List 3-5 core values that guide this organization\'s work, with a brief explanation of each.')}
                      disabled={aiGenerating.organizational_values}
                    >
                      {aiGenerating.organizational_values ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Assist
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={formData.organizational_values}
                    onChange={(e) => handleChange('organizational_values', e.target.value)}
                    placeholder="Our core values include..."
                    rows={4}
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    The principles that guide your work and decisions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle>Programs & Impact</CardTitle>
                <CardDescription>
                  Describe what you do and who you serve
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Programs & Services Offered *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIAssist('programs_offered', 'Describe the key programs and services this organization offers. List each program with a brief description.')}
                      disabled={aiGenerating.programs_offered}
                    >
                      {aiGenerating.programs_offered ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Assist
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={formData.programs_offered}
                    onChange={(e) => handleChange('programs_offered', e.target.value)}
                    placeholder="We offer the following programs..."
                    rows={5}
                  />
                </div>

                <div>
                  <Label>Target Population</Label>
                  <Textarea
                    value={formData.target_population}
                    onChange={(e) => handleChange('target_population', e.target.value)}
                    placeholder="We serve..."
                    rows={3}
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    Who are the primary beneficiaries of your work?
                  </p>
                </div>

                <div>
                  <Label>Geographic Service Area</Label>
                  <Input
                    value={formData.geographic_service_area}
                    onChange={(e) => handleChange('geographic_service_area', e.target.value)}
                    placeholder="e.g., Franklin County, Ohio or Columbus Metro Area"
                  />
                </div>

                <div>
                  <Label>People Served Annually</Label>
                  <Input
                    type="number"
                    value={formData.annual_people_served}
                    onChange={(e) => handleChange('annual_people_served', e.target.value)}
                    placeholder="e.g., 500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Staff Count</Label>
                    <Input
                      type="number"
                      value={formData.staff_count}
                      onChange={(e) => handleChange('staff_count', e.target.value)}
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <Label>Volunteer Count</Label>
                    <Input
                      type="number"
                      value={formData.volunteer_count}
                      onChange={(e) => handleChange('volunteer_count', e.target.value)}
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div>
                    <Label>Board Size</Label>
                    <Input
                      type="number"
                      value={formData.board_size}
                      onChange={(e) => handleChange('board_size', e.target.value)}
                      placeholder="e.g., 9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Executive Director</Label>
                    <Input
                      value={formData.executive_director}
                      onChange={(e) => handleChange('executive_director', e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <Label>Board Chair</Label>
                    <Input
                      value={formData.board_chair}
                      onChange={(e) => handleChange('board_chair', e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Financial & Capacity</CardTitle>
                <CardDescription>
                  Help us understand your organization's financial health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Annual Operating Budget</Label>
                  <Input
                    value={formData.annual_budget}
                    onChange={(e) => handleChange('annual_budget', e.target.value)}
                    placeholder="e.g., $250,000"
                  />
                </div>

                <div>
                  <Label>Current Funding Sources</Label>
                  <Textarea
                    value={formData.funding_sources}
                    onChange={(e) => handleChange('funding_sources', e.target.value)}
                    placeholder="List your main funding sources (grants, donations, earned revenue, etc.)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Largest Grant Amount Received</Label>
                  <Input
                    value={formData.largest_grant_amount}
                    onChange={(e) => handleChange('largest_grant_amount', e.target.value)}
                    placeholder="e.g., $50,000"
                  />
                </div>

                <div>
                  <Label>Grant Writing Experience Level</Label>
                  <select
                    value={formData.grant_experience_level}
                    onChange={(e) => handleChange('grant_experience_level', e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner - Little to no experience</option>
                    <option value="intermediate">Intermediate - Some successful grants</option>
                    <option value="advanced">Advanced - Regular grant writer</option>
                    <option value="expert">Expert - Extensive track record</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label>Organizational Systems (Check all that apply)</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={formData.has_strategic_plan}
                        onChange={(e) => handleChange('has_strategic_plan', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Strategic Plan (3-5 years)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={formData.has_financial_systems}
                        onChange={(e) => handleChange('has_financial_systems', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Financial Management Systems</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={formData.has_evaluation_system}
                        onChange={(e) => handleChange('has_evaluation_system', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Program Evaluation System</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={formData.has_data_tracking}
                        onChange={(e) => handleChange('has_data_tracking', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Data Tracking & Reporting</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Goals & Development Needs</CardTitle>
                <CardDescription>
                  What are you hoping to achieve through IncubateHer?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Funding Goals</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIAssist('funding_goals', 'Based on this organization\'s information, suggest 2-3 specific, achievable funding goals they could pursue in the next 12 months.')}
                      disabled={aiGenerating.funding_goals}
                    >
                      {aiGenerating.funding_goals ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Assist
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={formData.funding_goals}
                    onChange={(e) => handleChange('funding_goals', e.target.value)}
                    placeholder="What funding are you seeking? What do you hope to achieve?"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Capacity Building Needs</Label>
                  <Textarea
                    value={formData.capacity_building_needs}
                    onChange={(e) => handleChange('capacity_building_needs', e.target.value)}
                    placeholder="What areas does your organization need to strengthen?"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Technical Assistance Needed</Label>
                  <Textarea
                    value={formData.technical_assistance_needed}
                    onChange={(e) => handleChange('technical_assistance_needed', e.target.value)}
                    placeholder="What specific help or training would be most valuable?"
                    rows={4}
                  />
                </div>

                {/* Signature Field */}
                <SignatureField
                  value={formData.signature || {}}
                  onChange={(value) => handleChange('signature', value)}
                  required={true}
                  label="Profile Certification & Acknowledgement"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button - Fixed at Bottom */}
        <div className="sticky bottom-6 mt-8 flex justify-between items-center bg-white p-4 rounded-lg shadow-xl border-2 border-[#E5C089]">
          <div className="flex items-center gap-3">
            <Progress value={progress} className="w-32 h-2" />
            <span className="text-sm text-slate-600">{progress}% Complete</span>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveProfileMutation.isPending}
            className="bg-[#143A50] hover:bg-[#1E4F58]"
            size="lg"
          >
            {saveProfileMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Profile
          </Button>
        </div>
      </div>

      <CoBrandedFooter />
    </div>
  );
}