import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { CheckCircle2, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function IncubateHerRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    preferred_pronouns: '',
    
    // Organization Information
    organization_name: '',
    organization_type: '',
    organization_stage: '',
    years_in_operation: '',
    mission_statement: '',
    
    // Program Interest
    primary_funding_goal: '',
    biggest_challenge: '',
    current_funding_sources: [],
    prior_grant_experience: '',
    
    // Background
    how_heard_about: '',
    previous_training: '',
    expectations: '',
    
    // Demographics (optional)
    identify_as_woman: '',
    identify_as_person_of_color: '',
    age_range: '',
    
    // Commitment
    schedule_acknowledgment: false,
    attendance_commitment: false,
    consent_to_share: false
  });

  const [errors, setErrors] = useState({});

  const enrollMutation = useMutation({
    mutationFn: async (data) => {
      // Get or create cohort
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      
      let cohort = cohorts[0];
      if (!cohort) {
        cohort = await base44.entities.ProgramCohort.create({
          program_name: 'IncubateHer – Funding Readiness: Preparing for Grants & Contracts',
          program_code: 'incubateher_funding_readiness',
          funder_organization: 'Columbus Urban League',
          delivery_organization: 'Elbert Innovative Solutions',
          is_active: true
        });
      }

      // Get or create community space
      const spaces = await base44.entities.CommunitySpace.filter({
        slug: 'incubateher'
      });
      
      let communitySpace = spaces[0];
      if (!communitySpace) {
        communitySpace = await base44.entities.CommunitySpace.create({
          space_name: 'IncubateHer Program',
          slug: 'incubateher',
          description: 'Exclusive community for IncubateHer – Funding Readiness participants',
          space_type: 'posts',
          visibility: 'private',
          icon: 'Target',
          is_active: true
        });
      }

      // Invite user
      await base44.users.inviteUser(data.email, 'user');

      // Create enrollment with extended data
      await base44.entities.ProgramEnrollment.create({
        cohort_id: cohort.id,
        participant_email: data.email,
        participant_name: data.full_name,
        role: 'participant'
      });

      // Store registration data
      await base44.entities.RegistrationSubmission.create({
        email: data.email,
        page_id: 'incubateher_registration',
        form_data: data,
        submission_date: new Date().toISOString()
      });

      // Set up user access
      const existingAccess = await base44.entities.UserAccessLevel.filter({
        user_email: data.email
      });

      if (existingAccess.length > 0) {
        await base44.entities.UserAccessLevel.update(existingAccess[0].id, {
          access_level: 'full_platform',
          entry_point: 'incubateher_program',
          allowed_community_spaces: [communitySpace.id]
        });
      } else {
        await base44.entities.UserAccessLevel.create({
          user_email: data.email,
          access_level: 'full_platform',
          entry_point: 'incubateher_program',
          allowed_community_spaces: [communitySpace.id]
        });
      }

      // Send welcome email
      await base44.integrations.Core.SendEmail({
        to: data.email,
        subject: 'Welcome to IncubateHer Funding Readiness Program',
        body: `Hi ${data.full_name},

Welcome to the IncubateHer Funding Readiness Program!

You're now enrolled in this transformative program funded by Columbus Urban League and delivered by Elbert Innovative Solutions.

SESSION SCHEDULE:
• Monday, March 2 | 5:30–7:30 PM (Virtual – Google Meet)
• Thursday, March 5 | 5:30–7:30 PM (Virtual – Google Meet)
• Saturday, March 7 | 9:00 AM–12:00 PM (In-Person)
  Columbus Metropolitan Library – Shepard Location, Meeting Room 1

You will receive the Google Meet link 24 hours before each virtual session.

NEXT STEPS:
1. Check your email for your platform invitation
2. Set up your account and log in
3. Complete your pre-assessment
4. Access your program materials

You now have full access to:
• IncubateHer community space
• Projects and documents workspace
• Templates and resources
• Funding opportunities library
• Direct messaging

We're excited to support your funding readiness journey!

Best regards,
Elbert Innovative Solutions Team`
      });

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Registration successful! Check your email for login instructions.');
    },
    onError: (err) => {
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  });

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.full_name) newErrors.full_name = 'Required';
      if (!formData.email) newErrors.email = 'Required';
      if (!formData.phone) newErrors.phone = 'Required';
    }

    if (step === 2) {
      if (!formData.organization_name) newErrors.organization_name = 'Required';
      if (!formData.organization_type) newErrors.organization_type = 'Required';
      if (!formData.organization_stage) newErrors.organization_stage = 'Required';
    }

    if (step === 3) {
      if (!formData.primary_funding_goal) newErrors.primary_funding_goal = 'Required';
      if (!formData.biggest_challenge) newErrors.biggest_challenge = 'Required';
    }

    if (step === 5) {
      if (!formData.schedule_acknowledgment) newErrors.schedule_acknowledgment = 'Required';
      if (!formData.attendance_commitment) newErrors.attendance_commitment = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(5)) {
      await enrollMutation.mutateAsync(formData);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Organization' },
    { num: 3, label: 'Program Goals' },
    { num: 4, label: 'Background' },
    { num: 5, label: 'Commitment' }
  ];

  if (enrollMutation.isSuccess) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
        <CoBrandedHeader title="Registration Complete" />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Card>
            <CardContent className="pt-8 text-center">
              <CheckCircle2 className="w-20 h-20 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
              <h2 className="text-3xl font-bold mb-4" style={{ color: BRAND_COLORS.culRed }}>
                Welcome to IncubateHer!
              </h2>
              <p className="text-lg mb-6" style={{ color: BRAND_COLORS.eisNavy }}>
                Your registration is complete. Check your email for your platform invitation and next steps.
              </p>
              <div className="bg-slate-50 rounded-lg p-6 text-left mb-6">
                <h3 className="font-semibold mb-3" style={{ color: BRAND_COLORS.neutralDark }}>
                  Session Schedule:
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                  <li>• Monday, March 2 | 5:30–7:30 PM (Virtual – Google Meet)</li>
                  <li>• Thursday, March 5 | 5:30–7:30 PM (Virtual – Google Meet)</li>
                  <li>• Saturday, March 7 | 9:00 AM–12:00 PM (In-Person)</li>
                  <li className="pl-4">Columbus Metropolitan Library – Shepard Location, Meeting Room 1</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <CoBrandedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="IncubateHer Registration"
        subtitle="Complete your registration to secure your spot"
      />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep >= step.num
                      ? 'text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`} style={currentStep >= step.num ? { backgroundColor: BRAND_COLORS.eisGold } : {}}>
                    {currentStep > step.num ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${
                    currentStep >= step.num ? '' : 'text-slate-400'
                  }`} style={currentStep >= step.num ? { color: BRAND_COLORS.eisNavy } : {}}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    currentStep > step.num ? '' : 'bg-slate-200'
                  }`} style={currentStep > step.num ? { backgroundColor: BRAND_COLORS.eisGold } : {}} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => updateField('full_name', e.target.value)}
                        placeholder="Your full name"
                      />
                      {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>}
                    </div>
                    <div>
                      <Label>Email Address *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                      {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <Label>Preferred Pronouns (Optional)</Label>
                      <Input
                        value={formData.preferred_pronouns}
                        onChange={(e) => updateField('preferred_pronouns', e.target.value)}
                        placeholder="she/her, they/them, etc."
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Organization Information */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Organization Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Organization/Business Name *</Label>
                      <Input
                        value={formData.organization_name}
                        onChange={(e) => updateField('organization_name', e.target.value)}
                        placeholder="Your organization name"
                      />
                      {errors.organization_name && <p className="text-sm text-red-600 mt-1">{errors.organization_name}</p>}
                    </div>
                    <div>
                      <Label>Organization Type *</Label>
                      <Select value={formData.organization_type} onValueChange={(v) => updateField('organization_type', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nonprofit_501c3">501(c)(3) Nonprofit</SelectItem>
                          <SelectItem value="nonprofit_other">Other Nonprofit Structure</SelectItem>
                          <SelectItem value="for_profit">For-Profit Business</SelectItem>
                          <SelectItem value="social_enterprise">Social Enterprise</SelectItem>
                          <SelectItem value="community_based">Community-Based Organization</SelectItem>
                          <SelectItem value="startup">Startup/In Formation</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.organization_type && <p className="text-sm text-red-600 mt-1">{errors.organization_type}</p>}
                    </div>
                    <div>
                      <Label>Organization Stage *</Label>
                      <Select value={formData.organization_stage} onValueChange={(v) => updateField('organization_stage', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">Idea Stage</SelectItem>
                          <SelectItem value="startup">Startup (0-2 years)</SelectItem>
                          <SelectItem value="early">Early Stage (2-5 years)</SelectItem>
                          <SelectItem value="established">Established (5+ years)</SelectItem>
                          <SelectItem value="scaling">Growth/Scaling</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.organization_stage && <p className="text-sm text-red-600 mt-1">{errors.organization_stage}</p>}
                    </div>
                    <div>
                      <Label>Years in Operation</Label>
                      <Input
                        value={formData.years_in_operation}
                        onChange={(e) => updateField('years_in_operation', e.target.value)}
                        placeholder="e.g., 2"
                      />
                    </div>
                    <div>
                      <Label>Mission Statement (Brief)</Label>
                      <Textarea
                        value={formData.mission_statement}
                        onChange={(e) => updateField('mission_statement', e.target.value)}
                        placeholder="What is your organization's mission?"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Program Goals */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Your Funding Goals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Primary Funding Goal *</Label>
                      <Select value={formData.primary_funding_goal} onValueChange={(v) => updateField('primary_funding_goal', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="What do you hope to achieve?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="learn_grants">Learn about grants and how to apply</SelectItem>
                          <SelectItem value="learn_contracts">Learn about government contracts</SelectItem>
                          <SelectItem value="build_readiness">Build organizational readiness for funding</SelectItem>
                          <SelectItem value="understand_requirements">Understand funder requirements</SelectItem>
                          <SelectItem value="diversify_funding">Diversify funding sources</SelectItem>
                          <SelectItem value="improve_writing">Improve grant writing skills</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.primary_funding_goal && <p className="text-sm text-red-600 mt-1">{errors.primary_funding_goal}</p>}
                    </div>
                    <div>
                      <Label>Biggest Challenge *</Label>
                      <Textarea
                        value={formData.biggest_challenge}
                        onChange={(e) => updateField('biggest_challenge', e.target.value)}
                        placeholder="What's your biggest challenge in pursuing funding?"
                        rows={3}
                      />
                      {errors.biggest_challenge && <p className="text-sm text-red-600 mt-1">{errors.biggest_challenge}</p>}
                    </div>
                    <div>
                      <Label>Current Funding Sources (Select all that apply)</Label>
                      <div className="space-y-2">
                        {['Individual Donors', 'Foundation Grants', 'Government Grants', 'Contracts', 'Earned Income', 'Crowdfunding', 'Corporate Sponsorships', 'None Yet'].map((source) => (
                          <div key={source} className="flex items-center gap-2">
                            <Checkbox
                              id={source}
                              checked={formData.current_funding_sources.includes(source)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateField('current_funding_sources', [...formData.current_funding_sources, source]);
                                } else {
                                  updateField('current_funding_sources', formData.current_funding_sources.filter(s => s !== source));
                                }
                              }}
                            />
                            <Label htmlFor={source} className="cursor-pointer">{source}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Prior Grant/Contract Experience</Label>
                      <Select value={formData.prior_grant_experience} onValueChange={(v) => updateField('prior_grant_experience', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No experience</SelectItem>
                          <SelectItem value="some">Applied but not successful</SelectItem>
                          <SelectItem value="moderate">Received 1-2 grants/contracts</SelectItem>
                          <SelectItem value="experienced">Received multiple grants/contracts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Background */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Background Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>How did you hear about IncubateHer?</Label>
                      <Input
                        value={formData.how_heard_about}
                        onChange={(e) => updateField('how_heard_about', e.target.value)}
                        placeholder="Columbus Urban League, friend, social media, etc."
                      />
                    </div>
                    <div>
                      <Label>Previous Training/Workshops</Label>
                      <Textarea
                        value={formData.previous_training}
                        onChange={(e) => updateField('previous_training', e.target.value)}
                        placeholder="Have you attended any grant writing or business development training?"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>What do you hope to gain from this program?</Label>
                      <Textarea
                        value={formData.expectations}
                        onChange={(e) => updateField('expectations', e.target.value)}
                        placeholder="Share your expectations and what success looks like for you"
                        rows={3}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm mb-4" style={{ color: BRAND_COLORS.eisNavy }}>
                        <strong>Optional:</strong> This program specifically supports women entrepreneurs of color. 
                        This information helps us understand our community and improve our programming.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <Label>Do you identify as a woman?</Label>
                          <RadioGroup value={formData.identify_as_woman} onValueChange={(v) => updateField('identify_as_woman', v)}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="woman-yes" />
                              <Label htmlFor="woman-yes" className="cursor-pointer">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="woman-no" />
                              <Label htmlFor="woman-no" className="cursor-pointer">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="prefer_not_to_say" id="woman-prefer" />
                              <Label htmlFor="woman-prefer" className="cursor-pointer">Prefer not to say</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label>Do you identify as a person of color?</Label>
                          <RadioGroup value={formData.identify_as_person_of_color} onValueChange={(v) => updateField('identify_as_person_of_color', v)}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="poc-yes" />
                              <Label htmlFor="poc-yes" className="cursor-pointer">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="poc-no" />
                              <Label htmlFor="poc-no" className="cursor-pointer">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="prefer_not_to_say" id="poc-prefer" />
                              <Label htmlFor="poc-prefer" className="cursor-pointer">Prefer not to say</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label>Age Range (Optional)</Label>
                          <Select value={formData.age_range} onValueChange={(v) => updateField('age_range', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="18-24">18-24</SelectItem>
                              <SelectItem value="25-34">25-34</SelectItem>
                              <SelectItem value="35-44">35-44</SelectItem>
                              <SelectItem value="45-54">45-54</SelectItem>
                              <SelectItem value="55-64">55-64</SelectItem>
                              <SelectItem value="65+">65+</SelectItem>
                              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 5: Commitment */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Program Commitment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Session Schedule:</strong>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li>• Monday, March 2 | 5:30–7:30 PM (Virtual – Google Meet)</li>
                          <li>• Thursday, March 5 | 5:30–7:30 PM (Virtual – Google Meet)</li>
                          <li>• Saturday, March 7 | 9:00 AM–12:00 PM (In-Person)</li>
                          <li className="pl-4">Columbus Metropolitan Library – Shepard Location, Meeting Room 1</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="schedule"
                          checked={formData.schedule_acknowledgment}
                          onCheckedChange={(checked) => updateField('schedule_acknowledgment', checked)}
                        />
                        <Label htmlFor="schedule" className="cursor-pointer leading-relaxed">
                          I acknowledge the session dates and times and confirm I can attend all three sessions *
                        </Label>
                      </div>
                      {errors.schedule_acknowledgment && <p className="text-sm text-red-600">{errors.schedule_acknowledgment}</p>}

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="attendance"
                          checked={formData.attendance_commitment}
                          onCheckedChange={(checked) => updateField('attendance_commitment', checked)}
                        />
                        <Label htmlFor="attendance" className="cursor-pointer leading-relaxed">
                          I commit to full participation and completing program requirements (pre-assessment, workbook, consultation) *
                        </Label>
                      </div>
                      {errors.attendance_commitment && <p className="text-sm text-red-600">{errors.attendance_commitment}</p>}

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent"
                          checked={formData.consent_to_share}
                          onCheckedChange={(checked) => updateField('consent_to_share', checked)}
                        />
                        <Label htmlFor="consent" className="cursor-pointer leading-relaxed">
                          I consent to sharing my feedback and success stories (anonymously if preferred) to help improve the program
                        </Label>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                        <strong>Please Note:</strong> This program supports funding readiness and preparation. 
                        It does not include grant searches, application writing during sessions, or funding guarantees. 
                        Limited spots available.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 text-white"
                style={{ backgroundColor: BRAND_COLORS.eisGold }}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={enrollMutation.isPending}
                className="flex-1 text-white"
                style={{ backgroundColor: BRAND_COLORS.culRed }}
              >
                {enrollMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      <CoBrandedFooter />
    </div>
  );
}