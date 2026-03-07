import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, Target, Users, DollarSign, Save, CheckCircle2, 
  Sparkles, ChevronRight, Loader2, Plus, X, Globe, Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import CoBrandedHeader from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import SignatureField from '@/components/legal/SignatureField';
import JotFormProfile from '@/components/incubateher/JotFormProfile';

const ORG_TYPES = [
  '501(c)(3) Nonprofit', '501(c)(4) Social Welfare', 'LLC', 'Sole Proprietor',
  'S-Corp', 'C-Corp', 'Partnership', 'Cooperative', 'Fiscal Sponsee',
  'Community-Based Organization (unincorporated)', 'Other'
];

export default function IncubateHerProfileIntake() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');
  const [aiGenerating, setAiGenerating] = useState({});
  const hasLoadedInitialData = React.useRef(false);
  const [aiAutoFilling, setAiAutoFilling] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimerRef = useRef(null);
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: '',
    ein: '',
    founding_year: '',
    website: '',
    mission_statement: '',
    vision_statement: '',
    organizational_values: '',
    programs_offered: '',
    target_population: '',
    geographic_service_area: '',
    annual_people_served: '',
    // Inclusive leadership fields
    primary_leader_name: '',
    primary_leader_title: '',
    secondary_leader_name: '',
    secondary_leader_title: '',
    staff_count: '',
    volunteer_count: '',
    board_size: '',
    executive_director: '',
    board_chair: '',
    // Financial
    annual_budget: '',
    revenue_stage: '',
    funding_sources: '',
    largest_grant_amount: '',
    grant_experience_level: '',
    has_strategic_plan: false,
    has_financial_systems: false,
    has_evaluation_system: false,
    has_data_tracking: false,
    // Contact
    mailing_address: '',
    phone: '',
    social_media: '',
    social_media_handles: [],
    // Goals
    funding_goals: '',
    capacity_building_needs: '',
    technical_assistance_needed: ''
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollment } = useQuery({
    queryKey: ['incubateher-enrollment', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const enrollments = await base44.entities.ProgramEnrollment.filter({
        participant_email: user.email, role: 'participant'
      });
      return enrollments.find(e => e.cohort_id);
    },
    enabled: !!user?.email
  });

  const { data: existingProfile, isLoading } = useQuery({
    queryKey: ['organization-profile', enrollment?.id, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      if (enrollment?.id) {
        const enrollmentProfiles = await base44.entities.Organization.filter({ enrollment_id: enrollment.id });
        if (enrollmentProfiles[0]) return enrollmentProfiles[0];
      }
      const userProfiles = await base44.entities.Organization.filter({ primary_contact_email: user.email });
      return userProfiles[0] || null;
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (existingProfile && !hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true;
      setFormData(prev => ({ ...prev, ...existingProfile }));
      setLastSaved(new Date(existingProfile.updated_date));
    } else if (!existingProfile && enrollment && !hasLoadedInitialData.current) {
      // Pre-fill from JotForm registration data if no org profile yet
      const jd = enrollment.jotform_data || {};
      const prefill = {};
      if (enrollment.organization_name) prefill.organization_name = enrollment.organization_name;
      if (enrollment.participant_name) prefill.executive_director = enrollment.participant_name;
      if (enrollment.phone_number) prefill.phone = enrollment.phone_number;
      if (jd.org_type) prefill.organization_type = jd.org_type;
      if (jd.annual_revenue) prefill.annual_budget = jd.annual_revenue;
      if (jd.goals) prefill.funding_goals = jd.goals;
      if (jd.existing_items) prefill.programs_offered = jd.existing_items;
      if (jd.funding_barrier) prefill.capacity_building_needs = jd.funding_barrier;
      if (jd.employees) prefill.staff_count = jd.employees;
      if (Object.keys(prefill).length > 0) {
        setFormData(prev => ({ ...prev, ...prefill }));
      }
    }
  }, [existingProfile, enrollment]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (existingProfile?.id) {
        return await base44.entities.Organization.update(existingProfile.id, data);
      } else {
        return await base44.entities.Organization.create({
          ...data,
          ...(enrollment?.id ? { enrollment_id: enrollment.id } : {}),
          primary_contact_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-profile'] });
      setLastSaved(new Date());
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save profile');
    }
  });

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Auto-save after 2s of inactivity
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setFormData(current => {
        saveProfileMutation.mutate(current);
        return current;
      });
    }, 2000);
  }, []);

  const handleSave = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    await saveProfileMutation.mutateAsync(formData);
    toast.success('Profile saved!');
    await handleAutoFillFromWebsite(formData);
  };

  const handleAutoFillFromWebsite = async (savedFormData) => {
    const website = savedFormData.website;
    const orgName = savedFormData.organization_name;
    if (!website && !orgName) return;

    const fieldsToFill = [];
    if (!savedFormData.mission_statement) fieldsToFill.push('mission_statement');
    if (!savedFormData.vision_statement) fieldsToFill.push('vision_statement');
    if (!savedFormData.organizational_values) fieldsToFill.push('organizational_values');
    if (!savedFormData.programs_offered) fieldsToFill.push('programs_offered');
    if (!savedFormData.target_population) fieldsToFill.push('target_population');
    if (!savedFormData.funding_goals) fieldsToFill.push('funding_goals');
    if (fieldsToFill.length === 0) return;

    setAiAutoFilling(true);
    try {
      const socialHandles = (savedFormData.social_media_handles || []).filter(Boolean).join(', ');
      const prompt = `You are helping an organization complete their profile for a funding readiness program.
Organization Name: ${orgName || 'Not provided'}
Website: ${website || 'Not provided'}
Social Media: ${socialHandles || 'Not provided'}
${website ? `Please search for information about this organization at ${website}.` : ''}
Generate professional, accurate content for:
${fieldsToFill.includes('mission_statement') ? '- mission_statement: A 1-2 sentence mission statement' : ''}
${fieldsToFill.includes('vision_statement') ? '- vision_statement: A 1-2 sentence vision statement' : ''}
${fieldsToFill.includes('organizational_values') ? '- organizational_values: 3-4 core values with brief explanations' : ''}
${fieldsToFill.includes('programs_offered') ? '- programs_offered: Description of programs and services offered' : ''}
${fieldsToFill.includes('target_population') ? '- target_population: Who the organization primarily serves' : ''}
${fieldsToFill.includes('funding_goals') ? '- funding_goals: 2-3 realistic funding goals for the next 12 months' : ''}
Return ONLY a JSON object with these exact field names and string values.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: !!website,
        response_json_schema: {
          type: 'object',
          properties: {
            mission_statement: { type: 'string' },
            vision_statement: { type: 'string' },
            organizational_values: { type: 'string' },
            programs_offered: { type: 'string' },
            target_population: { type: 'string' },
            funding_goals: { type: 'string' }
          }
        }
      });

      const updates = {};
      fieldsToFill.forEach(field => { if (result[field]) updates[field] = result[field]; });
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }));
        const mergedData = { ...savedFormData, ...updates };
        if (existingProfile?.id) {
          await base44.entities.Organization.update(existingProfile.id, mergedData);
        }
        queryClient.invalidateQueries({ queryKey: ['organization-profile'] });
        toast.success(`AI filled in ${Object.keys(updates).length} fields!`);
        setActiveTab('mission');
      }
    } catch (error) {
      // silent fail
    } finally {
      setAiAutoFilling(false);
    }
  };

  const handleAIAssist = async (field, prompt) => {
    setAiGenerating(prev => ({ ...prev, [field]: true }));
    try {
      const orgType = formData.organization_type || 'organization';
      const contextPrompt = `Help this ${orgType} complete their organizational profile for a funding readiness program.
Organization: ${formData.organization_name || 'unnamed organization'}
Type: ${orgType}
${formData.mission_statement ? `Mission: ${formData.mission_statement}` : ''}
${formData.programs_offered ? `Programs: ${formData.programs_offered}` : ''}
${formData.revenue_stage ? `Stage: ${formData.revenue_stage}` : ''}
${prompt}
Provide a concise, professional response. Be inclusive — this could be a nonprofit, small business, consultant, or startup.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt: contextPrompt, add_context_from_internet: false });
      handleChange(field, response);
      toast.success('AI suggestion generated!');
    } catch (error) {
      toast.error('Failed to generate AI suggestion');
    } finally {
      setAiGenerating(prev => ({ ...prev, [field]: false }));
    }
  };

  const AIButton = ({ field, prompt }) => (
    <Button variant="outline" size="sm" onClick={() => handleAIAssist(field, prompt)} disabled={aiGenerating[field]}>
      {aiGenerating[field] ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-1" />AI Assist</>}
    </Button>
  );

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
      <CoBrandedHeader title="Organization Profile" subtitle="Complete your profile to auto-fill workbook responses" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Progress Card */}
        <Card className="mb-6 border-2 border-[#E5C089]">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#143A50]">Profile Completion</h2>
                <p className="text-slate-600 mt-1">Your profile auto-saves as you type. Click Save to also trigger AI fill.</p>
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
                {saveProfileMutation.isPending && <span className="text-slate-400 ml-2">(saving...)</span>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Auto-Fill Banner */}
        {aiAutoFilling && (
          <div className="mb-6 p-4 bg-[#143A50] text-white rounded-lg flex items-center gap-3 animate-pulse">
            <Wand2 className="w-5 h-5 text-[#E5C089] flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">AI is researching your organization...</p>
              <p className="text-xs text-white/80">Using your website to fill in mission, vision, and programs</p>
            </div>
            <Loader2 className="w-5 h-5 animate-spin ml-auto" />
          </div>
        )}

        {/* JotForm Registration Data */}
        {enrollment && (enrollment.jotform_data || enrollment.enrollment_notes) && (
          <div className="mb-6"><JotFormProfile enrollment={enrollment} /></div>
        )}

        <Card className="mb-6 bg-gradient-to-r from-[#143A50]/5 to-[#E5C089]/10 border-2 border-[#E5C089]">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Wand2 className="w-5 h-5 text-[#143A50] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-[#143A50] mb-1">Your profile auto-saves as you type</h3>
                <p className="text-sm text-slate-700">
                  Enter your <strong>website</strong> on the Basic tab, then click <strong>Save Profile</strong> — AI will research your organization and auto-fill empty fields. Use the <strong>AI Assist</strong> buttons on any field for additional help.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Form */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic"><Building2 className="w-4 h-4 mr-1 hidden sm:inline" />Basic</TabsTrigger>
            <TabsTrigger value="mission"><Target className="w-4 h-4 mr-1 hidden sm:inline" />Mission</TabsTrigger>
            <TabsTrigger value="programs"><Users className="w-4 h-4 mr-1 hidden sm:inline" />Programs</TabsTrigger>
            <TabsTrigger value="financial"><DollarSign className="w-4 h-4 mr-1 hidden sm:inline" />Financial</TabsTrigger>
            <TabsTrigger value="goals"><ChevronRight className="w-4 h-4 mr-1 hidden sm:inline" />Goals</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Organization Information</CardTitle>
                <CardDescription>Legal and contact details for your organization or business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Organization / Business Name *</Label>
                  <Input value={formData.organization_name} onChange={(e) => handleChange('organization_name', e.target.value)} placeholder="e.g., Community Care Nonprofit or Jane's Consulting LLC" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Type</Label>
                    <select value={formData.organization_type} onChange={(e) => handleChange('organization_type', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
                      <option value="">Select type...</option>
                      {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>EIN / Tax ID (if applicable)</Label>
                    <Input value={formData.ein} onChange={(e) => handleChange('ein', e.target.value)} placeholder="e.g., 12-3456789" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Year Founded / Established</Label>
                    <Input type="number" value={formData.founding_year} onChange={(e) => handleChange('founding_year', e.target.value)} placeholder="e.g., 2015" />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input value={formData.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://yourwebsite.org" />
                  </div>
                </div>

                <div>
                  <Label>Mailing Address</Label>
                  <Textarea value={formData.mailing_address} onChange={(e) => handleChange('mailing_address', e.target.value)} placeholder="Full mailing address" rows={2} />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="(555) 123-4567" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Social Media Handles</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      const handles = Array.isArray(formData.social_media_handles) ? formData.social_media_handles : [];
                      handleChange('social_media_handles', [...handles, '']);
                    }} className="text-[#143A50] h-7 px-2">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(Array.isArray(formData.social_media_handles) && formData.social_media_handles.length > 0
                      ? formData.social_media_handles : ['']
                    ).map((handle, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <Input
                          value={handle}
                          onChange={(e) => {
                            const handles = [...(formData.social_media_handles || [''])];
                            handles[idx] = e.target.value;
                            handleChange('social_media_handles', handles);
                          }}
                          placeholder="e.g., https://facebook.com/yourorg or @yourorg"
                          className="flex-1"
                        />
                        {(formData.social_media_handles || []).length > 1 && (
                          <button type="button" onClick={() => {
                            const handles = [...formData.social_media_handles];
                            handles.splice(idx, 1);
                            handleChange('social_media_handles', handles);
                          }} className="text-slate-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
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
                <CardDescription>Define your organization's purpose and guiding principles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { field: 'mission_statement', label: 'Mission Statement *', placeholder: 'Our mission is to...', rows: 4, hint: 'What you do, who you serve, and why it matters', prompt: 'Write a compelling mission statement. Focus on WHO they serve, WHAT they do, and WHY it matters.' },
                  { field: 'vision_statement', label: 'Vision Statement', placeholder: 'We envision a world where...', rows: 3, hint: 'The future you are working to create', prompt: 'Write an inspiring vision statement describing the ideal future this organization is working toward.' },
                  { field: 'organizational_values', label: 'Organizational Values', placeholder: 'Our core values include...', rows: 4, hint: 'Principles that guide your work and decisions', prompt: 'List 3-5 core values that guide this organization\'s work, with a brief explanation of each.' },
                ].map(({ field, label, placeholder, rows, hint, prompt }) => (
                  <div key={field}>
                    <div className="flex items-center justify-between mb-2">
                      <Label>{label}</Label>
                      <AIButton field={field} prompt={prompt} />
                    </div>
                    <Textarea value={formData[field]} onChange={(e) => handleChange(field, e.target.value)} placeholder={placeholder} rows={rows} />
                    <p className="text-xs text-slate-500 mt-1">{hint}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle>Programs, Services & Team</CardTitle>
                <CardDescription>Describe what you do, who you serve, and your team structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Programs & Services Offered *</Label>
                    <AIButton field="programs_offered" prompt="Describe the key programs and services this organization or business offers. List each with a brief description." />
                  </div>
                  <Textarea value={formData.programs_offered} onChange={(e) => handleChange('programs_offered', e.target.value)} placeholder="We offer the following programs/services..." rows={5} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Target Population / Clients</Label>
                    <AIButton field="target_population" prompt="Describe who this organization primarily serves or who their target clients/customers are." />
                  </div>
                  <Textarea value={formData.target_population} onChange={(e) => handleChange('target_population', e.target.value)} placeholder="We serve..." rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Geographic Service Area</Label>
                    <Input value={formData.geographic_service_area} onChange={(e) => handleChange('geographic_service_area', e.target.value)} placeholder="e.g., Franklin County, OH or Nationwide" />
                  </div>
                  <div>
                    <Label>People / Clients Served Annually</Label>
                    <Input type="number" value={formData.annual_people_served} onChange={(e) => handleChange('annual_people_served', e.target.value)} placeholder="e.g., 500" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Leadership & Team</p>
                  <p className="text-xs text-slate-500 mb-4">Fill in what applies to your org structure — nonprofit, business, solo practice, etc.</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Primary Leader Name</Label>
                      <Input value={formData.primary_leader_name} onChange={(e) => handleChange('primary_leader_name', e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <Label>Primary Leader Title</Label>
                      <Input value={formData.primary_leader_title} onChange={(e) => handleChange('primary_leader_title', e.target.value)} placeholder="e.g., CEO, Owner, Executive Director, Founder" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Secondary Leader Name (optional)</Label>
                      <Input value={formData.secondary_leader_name} onChange={(e) => handleChange('secondary_leader_name', e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <Label>Secondary Leader Title (optional)</Label>
                      <Input value={formData.secondary_leader_title} onChange={(e) => handleChange('secondary_leader_title', e.target.value)} placeholder="e.g., COO, Board Chair, Co-Founder, Consultant" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Staff / Employees</Label>
                      <Input type="number" value={formData.staff_count} onChange={(e) => handleChange('staff_count', e.target.value)} placeholder="e.g., 5 (or 0)" />
                    </div>
                    <div>
                      <Label>Volunteers / Contractors</Label>
                      <Input type="number" value={formData.volunteer_count} onChange={(e) => handleChange('volunteer_count', e.target.value)} placeholder="e.g., 10 (or 0)" />
                    </div>
                    <div>
                      <Label>Board Size (if applicable)</Label>
                      <Input type="number" value={formData.board_size} onChange={(e) => handleChange('board_size', e.target.value)} placeholder="e.g., 9 (or N/A)" />
                    </div>
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
                <CardDescription>Help us understand where you are financially — from pre-revenue to established</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Revenue / Funding Stage</Label>
                  <select value={formData.revenue_stage} onChange={(e) => handleChange('revenue_stage', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
                    <option value="">Select your current stage...</option>
                    <option value="pre_revenue">Pre-Revenue / Just Starting — no income yet</option>
                    <option value="early_stage">Early Stage — some revenue or small grants (under $25K)</option>
                    <option value="growing">Growing — $25K–$100K annual revenue/funding</option>
                    <option value="established_small">Established Small — $100K–$500K</option>
                    <option value="established_mid">Established Mid-Size — $500K–$1M</option>
                    <option value="scaling">Scaling — over $1M</option>
                  </select>
                </div>

                <div>
                  <Label>Annual Operating Budget (approximate)</Label>
                  <Input value={formData.annual_budget} onChange={(e) => handleChange('annual_budget', e.target.value)} placeholder="e.g., $50,000 or 'Not yet established'" />
                  <p className="text-xs text-slate-500 mt-1">Estimate is fine — leave blank if pre-revenue</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Current / Projected Funding Sources</Label>
                    <AIButton field="funding_sources" prompt="Based on this organization's type, stage, and programs, suggest realistic funding sources they may have or could pursue (grants, contracts, donations, earned revenue, self-funded, etc.)." />
                  </div>
                  <Textarea value={formData.funding_sources} onChange={(e) => handleChange('funding_sources', e.target.value)} placeholder="e.g., Self-funded, family grants, earned revenue from services, government contracts, individual donors..." rows={3} />
                </div>

                <div>
                  <Label>Largest Grant or Contract Received (if any)</Label>
                  <Input value={formData.largest_grant_amount} onChange={(e) => handleChange('largest_grant_amount', e.target.value)} placeholder="e.g., $25,000 or 'None yet'" />
                </div>

                <div>
                  <Label>Grant / Contract Writing Experience</Label>
                  <select value={formData.grant_experience_level} onChange={(e) => handleChange('grant_experience_level', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
                    <option value="">Select experience level...</option>
                    <option value="beginner">Beginner — Never written a grant or proposal</option>
                    <option value="some_attempts">Some Attempts — Tried a few, not yet successful</option>
                    <option value="intermediate">Intermediate — Some successful grants or contracts</option>
                    <option value="advanced">Advanced — Regular grant / contract writer</option>
                    <option value="expert">Expert — Extensive track record</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label>Organizational Systems (Check all that apply)</Label>
                  {[
                    { field: 'has_strategic_plan', label: 'Strategic Plan (written goals for 1–3+ years)' },
                    { field: 'has_financial_systems', label: 'Financial Management System (QuickBooks, spreadsheets, accountant, etc.)' },
                    { field: 'has_evaluation_system', label: 'Program Evaluation / Impact Tracking System' },
                    { field: 'has_data_tracking', label: 'Data Tracking & Reporting (client data, outcomes, metrics)' },
                  ].map(({ field, label }) => (
                    <label key={field} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" checked={formData[field]} onChange={(e) => handleChange(field, e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Goals & Development Needs</CardTitle>
                <CardDescription>What are you hoping to achieve through IncubateHer?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Funding Goals</Label>
                    <AIButton field="funding_goals" prompt="Based on this organization's information, suggest 2-3 specific, achievable funding goals they could pursue in the next 12 months. Be realistic and specific to their stage and type." />
                  </div>
                  <Textarea value={formData.funding_goals} onChange={(e) => handleChange('funding_goals', e.target.value)} placeholder="What funding are you seeking? What do you hope to achieve financially?" rows={4} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Capacity Building Needs</Label>
                    <AIButton field="capacity_building_needs" prompt="Based on this organization's information, identify 2-3 key capacity building needs they likely have. Consider their stage, type, and programs." />
                  </div>
                  <Textarea value={formData.capacity_building_needs} onChange={(e) => handleChange('capacity_building_needs', e.target.value)} placeholder="What areas does your organization need to strengthen? (e.g., board development, financial systems, HR, marketing)" rows={4} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Technical Assistance Needed</Label>
                    <AIButton field="technical_assistance_needed" prompt="Based on this organization's profile, suggest what specific technical assistance or training would be most valuable for them right now." />
                  </div>
                  <Textarea value={formData.technical_assistance_needed} onChange={(e) => handleChange('technical_assistance_needed', e.target.value)} placeholder="What specific help or training would be most valuable? (e.g., grant writing, financial management, strategic planning)" rows={4} />
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

        {/* Save Button */}
        <div className="sticky bottom-6 mt-8 flex justify-between items-center bg-white p-4 rounded-lg shadow-xl border-2 border-[#E5C089]">
          <div className="flex items-center gap-3">
            <Progress value={progress} className="w-32 h-2" />
            <span className="text-sm text-slate-600">{progress}% Complete</span>
            {saveProfileMutation.isPending && <span className="text-xs text-slate-400">Saving...</span>}
          </div>
          <Button onClick={handleSave} disabled={saveProfileMutation.isPending || aiAutoFilling} className="bg-[#143A50] hover:bg-[#1E4F58]" size="lg">
            {saveProfileMutation.isPending || aiAutoFilling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {aiAutoFilling ? 'AI Filling...' : 'Save Profile'}
          </Button>
        </div>
      </div>
      <CoBrandedFooter />
    </div>
  );
}