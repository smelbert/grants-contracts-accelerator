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
    // Participant Information
    full_name: '',
    email: '',
    phone: '',
    business_name: '',
    business_website: '',
    
    // Entrepreneurship Stage
    current_stage: '',
    industry_focus: '',
    
    // Business Structure
    business_structure: '',
    business_structure_other: '',
    has_ein: '',
    has_business_bank: '',
    
    // Funding Interest
    funding_pathway: '',
    primary_funding_goal: '',
    prior_funding_experience: '',
    
    // Readiness Snapshot
    existing_materials: [],
    most_helpful: [],
    
    // Session Commitment
    session_march_2: false,
    session_march_5: false,
    session_march_7: false,
    
    // Consultation
    consultation_interest: '',
    consultation_understanding: false,
    consultation_focus: '',
    
    // Program Expectations
    readiness_understanding: false,
    funding_not_guaranteed: false,
    giveaway_understanding: false,
    
    // Recording Consent
    recording_consent: '',
    
    // Signature
    electronic_signature: ''
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
        from_name: 'IncubateHer Program',
        subject: 'Welcome to IncubateHer Funding Readiness Series',
        body: `
          <p>Hello ${data.full_name},</p>
          
          <p>Thank you for registering for the <strong>IncubateHer Funding Readiness Series: Preparing for Grants, Proposals & Contracts</strong>.</p>
          
          <p>This program is hosted by <strong>Columbus Urban League</strong> and delivered by <strong>Elbert Innovative Solutions (EIS)</strong>.</p>
          
          <h3 style="margin-top: 20px; margin-bottom: 10px;">Session Schedule</h3>
          <ul>
            <li><strong>Monday, March 2</strong> | 5:30–7:30 PM (Virtual – Google Meet)</li>
            <li><strong>Thursday, March 5</strong> | 5:30–7:30 PM (Virtual – Google Meet)</li>
            <li><strong>Saturday, March 7</strong> | 9:00 AM–12:00 PM (In Person)<br/>
                Columbus Metropolitan Library – Shepard Location, Meeting Room 1</li>
          </ul>
          
          <p>You will receive the Google Meet link 24 hours before each virtual session.</p>
          
          <h3 style="margin-top: 20px; margin-bottom: 10px;">Next Steps</h3>
          <ol>
            <li>Check your email for your platform invitation</li>
            <li>Set up your account and log in</li>
            <li>Complete your pre-assessment</li>
            <li>Access your program materials and workbook</li>
          </ol>
          
          <h3 style="margin-top: 20px; margin-bottom: 10px;">You Now Have Access To:</h3>
          <ul>
            <li>IncubateHer community space</li>
            <li>Projects and documents workspace</li>
            <li>Templates and resources</li>
            <li>Funding opportunities library</li>
            <li>Direct messaging with facilitators and peers</li>
          </ul>
          
          <p style="margin-top: 20px;"><strong>Consultation Eligibility:</strong><br/>
          Up to twenty (20) participants who complete all sessions and required assessments will be eligible to schedule a one-hour individual consultation with Dr. Shawnté Elbert on a first-come, first-served basis.</p>
          
          <p>We're excited to support your funding readiness journey!</p>
          
          <p>Warm regards,<br/>
          Dr. Shawnté Elbert<br/>
          Elbert Innovative Solutions<br/>
          <em>On behalf of Columbus Urban League</em></p>
        `
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
      if (!formData.business_name) newErrors.business_name = 'Required';
    }

    if (step === 2) {
      if (!formData.current_stage) newErrors.current_stage = 'Required';
      if (!formData.industry_focus) newErrors.industry_focus = 'Required';
      if (!formData.business_structure) newErrors.business_structure = 'Required';
      if (!formData.has_ein) newErrors.has_ein = 'Required';
      if (!formData.has_business_bank) newErrors.has_business_bank = 'Required';
    }

    if (step === 3) {
      if (!formData.funding_pathway) newErrors.funding_pathway = 'Required';
      if (!formData.primary_funding_goal) newErrors.primary_funding_goal = 'Required';
      if (!formData.prior_funding_experience) newErrors.prior_funding_experience = 'Required';
      if (formData.existing_materials.length === 0) newErrors.existing_materials = 'Required';
      if (formData.most_helpful.length === 0) newErrors.most_helpful = 'Required';
    }

    if (step === 4) {
      if (!formData.session_march_2 || !formData.session_march_5 || !formData.session_march_7) {
        newErrors.session_commitment = 'All sessions required';
      }
      if (!formData.consultation_interest) newErrors.consultation_interest = 'Required';
      if (!formData.consultation_understanding) newErrors.consultation_understanding = 'Required';
      if (!formData.consultation_focus) newErrors.consultation_focus = 'Required';
    }

    if (step === 5) {
      if (!formData.readiness_understanding) newErrors.readiness_understanding = 'Required';
      if (!formData.funding_not_guaranteed) newErrors.funding_not_guaranteed = 'Required';
      if (!formData.giveaway_understanding) newErrors.giveaway_understanding = 'Required';
      if (!formData.recording_consent) newErrors.recording_consent = 'Required';
      if (!formData.electronic_signature) newErrors.electronic_signature = 'Required';
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
    { num: 1, label: 'Participant Info' },
    { num: 2, label: 'Business Details' },
    { num: 3, label: 'Funding & Readiness' },
    { num: 4, label: 'Session Commitment' },
    { num: 5, label: 'Final Confirmations' }
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
        {/* Introduction */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="mb-4" style={{ color: BRAND_COLORS.eisNavy }}>
              IncubateHer supports entrepreneurs in the early stages of entrepreneurship or in the growth phase of an existing business.
            </p>
            <p className="mb-4" style={{ color: BRAND_COLORS.eisNavy }}>
              This Funding Readiness Series will help you understand and prepare for grants, competitive proposals, and contract opportunities based on your business structure, stage, and capacity.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-3" style={{ color: BRAND_COLORS.culRed }}>Session Schedule</h3>
              <ul className="space-y-2 text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                <li>• <strong>Monday, March 2</strong> | 5:30–7:30 PM (Virtual – Google Meet)</li>
                <li>• <strong>Thursday, March 5</strong> | 5:30–7:30 PM (Virtual – Google Meet)</li>
                <li>• <strong>Saturday, March 7</strong> | 9:00 AM–12:00 PM (In Person)<br/>
                    <span className="pl-4">Columbus Metropolitan Library – Shepard Location, Meeting Room 1</span>
                </li>
              </ul>
            </div>
            <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
              Upon registration, you will receive a confirmation email with the Google Meet link and next steps.
            </p>
            <p className="text-sm mt-3 font-medium" style={{ color: BRAND_COLORS.culRed }}>
              Up to twenty (20) participants who complete all sessions and required assessments will be eligible to schedule a one-hour individual consultation with Dr. Shawnté Elbert on a first-come, first-served basis.
            </p>
          </CardContent>
        </Card>
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
            {/* Step 1: Participant Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Participant Information</CardTitle>
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
                      <Label>Business Name (or type "In Formation") *</Label>
                      <Input
                        value={formData.business_name}
                        onChange={(e) => updateField('business_name', e.target.value)}
                        placeholder="Your business name or 'In Formation'"
                      />
                      {errors.business_name && <p className="text-sm text-red-600 mt-1">{errors.business_name}</p>}
                    </div>
                    <div>
                      <Label>Business Website or Social Media (if applicable)</Label>
                      <Input
                        value={formData.business_website}
                        onChange={(e) => updateField('business_website', e.target.value)}
                        placeholder="https://... or @socialmedia"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Entrepreneurship Stage & Business Structure */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Entrepreneurship Stage & Business Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        ENTREPRENEURSHIP STAGE
                      </h3>
                      <div>
                        <Label>Which best describes your current stage? *</Label>
                        <Select value={formData.current_stage} onValueChange={(v) => updateField('current_stage', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="idea">Idea Stage (exploring a concept)</SelectItem>
                            <SelectItem value="formation">Formation Stage (registering or setting up)</SelectItem>
                            <SelectItem value="early">Early-Stage Business (launched and building foundation)</SelectItem>
                            <SelectItem value="growth">Growth Phase Business (established and scaling)</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.current_stage && <p className="text-sm text-red-600 mt-1">{errors.current_stage}</p>}
                      </div>
                      <div>
                        <Label>Industry or Business Focus *</Label>
                        <Input
                          value={formData.industry_focus}
                          onChange={(e) => updateField('industry_focus', e.target.value)}
                          placeholder="e.g., Healthcare, Education, Technology"
                        />
                        {errors.industry_focus && <p className="text-sm text-red-600 mt-1">{errors.industry_focus}</p>}
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        BUSINESS STRUCTURE
                      </h3>
                      <div>
                        <Label>Current Business Structure *</Label>
                        <Select value={formData.business_structure} onValueChange={(v) => updateField('business_structure', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select structure" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_registered">Not yet registered</SelectItem>
                            <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                            <SelectItem value="llc">LLC</SelectItem>
                            <SelectItem value="scorp_ccorp">S-Corp / C-Corp</SelectItem>
                            <SelectItem value="nonprofit_501c3">Nonprofit (501c3)</SelectItem>
                            <SelectItem value="fiscal_sponsor">Fiscal Sponsor</SelectItem>
                            <SelectItem value="other">Other (please specify)</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.business_structure && <p className="text-sm text-red-600 mt-1">{errors.business_structure}</p>}
                      </div>
                      {formData.business_structure === 'other' && (
                        <div>
                          <Label>Please specify</Label>
                          <Input
                            value={formData.business_structure_other}
                            onChange={(e) => updateField('business_structure_other', e.target.value)}
                            placeholder="Specify your business structure"
                          />
                        </div>
                      )}
                      <div>
                        <Label>Do you currently have an EIN? *</Label>
                        <RadioGroup value={formData.has_ein} onValueChange={(v) => updateField('has_ein', v)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="ein-yes" />
                            <Label htmlFor="ein-yes" className="cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="ein-no" />
                            <Label htmlFor="ein-no" className="cursor-pointer">No</Label>
                          </div>
                        </RadioGroup>
                        {errors.has_ein && <p className="text-sm text-red-600 mt-1">{errors.has_ein}</p>}
                      </div>
                      <div>
                        <Label>Do you have a separate business bank account? *</Label>
                        <RadioGroup value={formData.has_business_bank} onValueChange={(v) => updateField('has_business_bank', v)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="bank-yes" />
                            <Label htmlFor="bank-yes" className="cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="bank-no" />
                            <Label htmlFor="bank-no" className="cursor-pointer">No</Label>
                          </div>
                        </RadioGroup>
                        {errors.has_business_bank && <p className="text-sm text-red-600 mt-1">{errors.has_business_bank}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Funding Interest & Readiness */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Funding Interest & Readiness Snapshot</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        FUNDING INTEREST
                      </h3>
                      <div>
                        <Label>Which funding pathway are you most interested in right now? *</Label>
                        <Select value={formData.funding_pathway} onValueChange={(v) => updateField('funding_pathway', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pathway" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grants">Grants</SelectItem>
                            <SelectItem value="proposals">Competitive Proposals</SelectItem>
                            <SelectItem value="contracts">Government or Corporate Contracts</SelectItem>
                            <SelectItem value="unsure">I'm unsure and need help determining</SelectItem>
                            <SelectItem value="multiple">Multiple pathways</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.funding_pathway && <p className="text-sm text-red-600 mt-1">{errors.funding_pathway}</p>}
                      </div>
                      <div>
                        <Label>What is your primary funding goal within the next 6–12 months? *</Label>
                        <Textarea
                          value={formData.primary_funding_goal}
                          onChange={(e) => updateField('primary_funding_goal', e.target.value)}
                          placeholder="Describe your funding goals..."
                          rows={3}
                        />
                        {errors.primary_funding_goal && <p className="text-sm text-red-600 mt-1">{errors.primary_funding_goal}</p>}
                      </div>
                      <div>
                        <Label>Have you previously applied for funding? *</Label>
                        <Select value={formData.prior_funding_experience} onValueChange={(v) => updateField('prior_funding_experience', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="funded">Yes – Successfully funded</SelectItem>
                            <SelectItem value="not_funded">Yes – Not funded</SelectItem>
                            <SelectItem value="first_time">No – First time applying</SelectItem>
                            <SelectItem value="assisted">Assisted someone else but not my own business</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.prior_funding_experience && <p className="text-sm text-red-600 mt-1">{errors.prior_funding_experience}</p>}
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        READINESS SNAPSHOT
                      </h3>
                      <div>
                        <Label>Which of the following do you already have? (Select all that apply) *</Label>
                        <div className="space-y-2 mt-2">
                          {[
                            'Business overview or executive summary',
                            'Budget (even if basic)',
                            'Defined services or program description',
                            'Defined target market',
                            'Impact metrics or outcomes',
                            'Capability statement (for contracts)',
                            'None of the above yet'
                          ].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <Checkbox
                                id={item}
                                checked={formData.existing_materials.includes(item)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateField('existing_materials', [...formData.existing_materials, item]);
                                  } else {
                                    updateField('existing_materials', formData.existing_materials.filter(s => s !== item));
                                  }
                                }}
                              />
                              <Label htmlFor={item} className="cursor-pointer">{item}</Label>
                            </div>
                          ))}
                        </div>
                        {errors.existing_materials && <p className="text-sm text-red-600 mt-1">{errors.existing_materials}</p>}
                      </div>
                      <div>
                        <Label>What would be most helpful for you during this series? (Select all that apply) *</Label>
                        <div className="space-y-2 mt-2">
                          {[
                            'Understanding funding eligibility',
                            'Clarifying readiness gaps',
                            'Organizing documents',
                            'Learning budgeting basics',
                            'Understanding RFPs and contracts',
                            'Identifying next steps'
                          ].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <Checkbox
                                id={item}
                                checked={formData.most_helpful.includes(item)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateField('most_helpful', [...formData.most_helpful, item]);
                                  } else {
                                    updateField('most_helpful', formData.most_helpful.filter(s => s !== item));
                                  }
                                }}
                              />
                              <Label htmlFor={item} className="cursor-pointer">{item}</Label>
                            </div>
                          ))}
                        </div>
                        {errors.most_helpful && <p className="text-sm text-red-600 mt-1">{errors.most_helpful}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Session Commitment & Consultation */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Session Commitment & Consultation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        SESSION COMMITMENT
                      </h3>
                      <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                        Please confirm your availability for the following sessions: *
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="session1"
                            checked={formData.session_march_2}
                            onCheckedChange={(checked) => updateField('session_march_2', checked)}
                          />
                          <Label htmlFor="session1" className="cursor-pointer leading-relaxed">
                            Monday, March 2 | 5:30–7:30 PM (Virtual)
                          </Label>
                        </div>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="session2"
                            checked={formData.session_march_5}
                            onCheckedChange={(checked) => updateField('session_march_5', checked)}
                          />
                          <Label htmlFor="session2" className="cursor-pointer leading-relaxed">
                            Thursday, March 5 | 5:30–7:30 PM (Virtual)
                          </Label>
                        </div>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="session3"
                            checked={formData.session_march_7}
                            onCheckedChange={(checked) => updateField('session_march_7', checked)}
                          />
                          <Label htmlFor="session3" className="cursor-pointer leading-relaxed">
                            Saturday, March 7 | 9:00 AM–12:00 PM (In Person – CML Shepard)
                          </Label>
                        </div>
                      </div>
                      {errors.session_commitment && <p className="text-sm text-red-600 mt-1">{errors.session_commitment}</p>}
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        ONE-ON-ONE CONSULTATION
                      </h3>
                      <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                        Up to twenty (20) participants who complete all sessions and required assessments will be eligible to schedule a one-hour advisory consultation on a first-come, first-served basis.
                      </p>
                      <div>
                        <Label>Are you interested in scheduling a consultation if eligible? *</Label>
                        <Select value={formData.consultation_interest} onValueChange={(v) => updateField('consultation_interest', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="maybe">Maybe</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.consultation_interest && <p className="text-sm text-red-600 mt-1">{errors.consultation_interest}</p>}
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consult-understand"
                          checked={formData.consultation_understanding}
                          onCheckedChange={(checked) => updateField('consultation_understanding', checked)}
                        />
                        <Label htmlFor="consult-understand" className="cursor-pointer leading-relaxed">
                          I understand that consultations are limited to the first 20 eligible participants and are first-come, first-served. *
                        </Label>
                      </div>
                      {errors.consultation_understanding && <p className="text-sm text-red-600 mt-1">{errors.consultation_understanding}</p>}
                      <div>
                        <Label>Briefly describe what you would most like to focus on during your consultation. *</Label>
                        <Textarea
                          value={formData.consultation_focus}
                          onChange={(e) => updateField('consultation_focus', e.target.value)}
                          placeholder="What would you like to discuss?"
                          rows={3}
                        />
                        {errors.consultation_focus && <p className="text-sm text-red-600 mt-1">{errors.consultation_focus}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 5: Final Confirmations */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: BRAND_COLORS.culRed }}>Program Expectations & Consent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        PROGRAM EXPECTATIONS
                      </h3>
                      <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                        This program focuses on readiness and preparation. It does not include full drafting, editing, or submission services (except the completion-based non-federal giveaway opportunity described below).
                      </p>
                      <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                        Funding approval is determined by external agencies and is not guaranteed.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="readiness"
                            checked={formData.readiness_understanding}
                            onCheckedChange={(checked) => updateField('readiness_understanding', checked)}
                          />
                          <Label htmlFor="readiness" className="cursor-pointer leading-relaxed">
                            I understand this series focuses on readiness and advisory support, not full drafting or submission services. *
                          </Label>
                        </div>
                        {errors.readiness_understanding && <p className="text-sm text-red-600">{errors.readiness_understanding}</p>}
                        
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="not-guaranteed"
                            checked={formData.funding_not_guaranteed}
                            onCheckedChange={(checked) => updateField('funding_not_guaranteed', checked)}
                          />
                          <Label htmlFor="not-guaranteed" className="cursor-pointer leading-relaxed">
                            I understand that funding awards are not guaranteed. *
                          </Label>
                        </div>
                        {errors.funding_not_guaranteed && <p className="text-sm text-red-600">{errors.funding_not_guaranteed}</p>}
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        COMPLETION INCENTIVE
                      </h3>
                      <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                        Participants who:
                      </p>
                      <ul className="text-sm ml-4 space-y-1" style={{ color: BRAND_COLORS.eisNavy }}>
                        <li>• Attend all sessions</li>
                        <li>• Complete required assessments</li>
                        <li>• Complete their consultation</li>
                      </ul>
                      <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>
                        Will be entered into a randomized drawing for one complimentary grant-writing session for a non-federal opportunity.
                      </p>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="giveaway"
                          checked={formData.giveaway_understanding}
                          onCheckedChange={(checked) => updateField('giveaway_understanding', checked)}
                        />
                        <Label htmlFor="giveaway" className="cursor-pointer leading-relaxed">
                          I understand the giveaway applies only to non-federal funding opportunities and requires full program completion. *
                        </Label>
                      </div>
                      {errors.giveaway_understanding && <p className="text-sm text-red-600 mt-1">{errors.giveaway_understanding}</p>}
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        RECORDING & CONSENT
                      </h3>
                      <div>
                        <Label>I consent to virtual sessions being recorded for educational purposes within the cohort. *</Label>
                        <RadioGroup value={formData.recording_consent} onValueChange={(v) => updateField('recording_consent', v)} className="mt-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="record-yes" />
                            <Label htmlFor="record-yes" className="cursor-pointer">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="record-no" />
                            <Label htmlFor="record-no" className="cursor-pointer">No</Label>
                          </div>
                        </RadioGroup>
                        {errors.recording_consent && <p className="text-sm text-red-600 mt-1">{errors.recording_consent}</p>}
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                        ELECTRONIC SIGNATURE
                      </h3>
                      <div>
                        <Label>Electronic Signature *</Label>
                        <Input
                          value={formData.electronic_signature}
                          onChange={(e) => updateField('electronic_signature', e.target.value)}
                          placeholder="Type your full name"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          By typing your name, you agree to the terms and conditions stated above.
                        </p>
                        {errors.electronic_signature && <p className="text-sm text-red-600 mt-1">{errors.electronic_signature}</p>}
                      </div>
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