import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import { toast } from 'react-hot-toast';

const PROGRAMS = [
  {
    id: 'incubateher',
    label: 'IncubateHer – Funding Readiness',
    description: 'Preparing entrepreneurs for grants & contracts. Free program funded by Columbus Urban League.',
    cohort_code: 'incubateher_funding_readiness',
    cohort_name: 'IncubateHer – Funding Readiness: Preparing for Grants & Contracts',
  },
  {
    id: 'accelerateher',
    label: 'AccelerateHer',
    description: 'Advanced program for entrepreneurs ready to scale their funding strategy.',
    cohort_code: 'accelerateher',
    cohort_name: 'AccelerateHer Program',
  },
];

const PARTICIPATION_OPTIONS = [
  'I plan to attend all sessions virtually',
  'I plan to attend Saturday in-person only',
  'I plan to attend all sessions (virtual + in-person)',
  'I cannot attend live but want access to workbook and recordings',
];

const DOCUMENT_SUPPORT_OPTIONS = [
  'Organizational Overview',
  'Mission & Vision Statement',
  'Funding Pathway Strategy',
  'Statement of Need',
  'Budget / Financial Documents',
  'I am not sure yet',
];

const EXISTING_ITEMS_OPTIONS = [
  'Registered business / nonprofit',
  'EIN / Tax ID',
  'Bank account in the org name',
  'Board of Directors (nonprofits)',
  'Financial tracking system',
  'Written strategic plan',
  'None of the above',
];

export default function ProgramRegistrationForm() {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    organization_name: '',
    participation_plan: '',
    attend_in_person: '',
    interested_in_consultation: '',
    documents_needed: [],
    funding_barrier: '',
    existing_items: [],
    org_type: '',
    years_in_business: '',
    annual_revenue: '',
    employees: '',
    grant_experience: '',
    how_heard: '',
    goals: '',
    understood_terms: false,
  });

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleArray = (field, value) => {
    setForm(prev => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const program = PROGRAMS.find(p => p.id === selectedProgram);

      // Create a RegistrationSubmission record (pending admin approval)
      await base44.entities.RegistrationSubmission.create({
        registration_page_id: program.cohort_code,
        user_email: form.email,
        user_name: form.full_name,
        entry_point: selectedProgram,
        access_granted: false,
        registration_data: {
          program: program.label,
          program_id: selectedProgram,
          phone: form.phone,
          organization_name: form.organization_name,
          participation_plan: form.participation_plan,
          attend_in_person: form.attend_in_person,
          interested_in_consultation: form.interested_in_consultation,
          documents_needed: form.documents_needed,
          funding_barrier: form.funding_barrier,
          existing_items: form.existing_items,
          org_type: form.org_type,
          years_in_business: form.years_in_business,
          annual_revenue: form.annual_revenue,
          employees: form.employees,
          grant_experience: form.grant_experience,
          how_heard: form.how_heard,
          goals: form.goals,
          submission_date: new Date().toISOString(),
        },
      });

      // Send confirmation email to applicant
      await base44.integrations.Core.SendEmail({
        from_name: 'Elbert Innovative Solutions',
        to: form.email,
        subject: `Application Received – ${program.label} 🎉`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #143A50; padding: 30px; text-align: center;">
              <h1 style="color: #E5C089; margin: 0;">Application Received!</h1>
              <p style="color: #fff; margin-top: 8px;">${program.label}</p>
            </div>
            <div style="padding: 30px;">
              <p>Hi ${form.full_name},</p>
              <p>Thank you for applying to <strong>${program.label}</strong>! We've received your registration and our team will review it shortly.</p>
              <p>Once your enrollment is approved, you will receive a separate email with your platform login link and next steps.</p>
              <p><strong>Questions?</strong> Email us at <a href="mailto:info@elbertinnovativesolutions.org" style="color: #AC1A5B;">info@elbertinnovativesolutions.org</a></p>
              <p>We look forward to having you in the program!</p>
              <p>Warm regards,<br><strong>Dr. Shawnté Elbert</strong><br>Elbert Innovative Solutions</p>
            </div>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} Elbert Innovative Solutions. All rights reserved.
            </div>
          </div>
        `,
      });

      // Notify admin
      await base44.integrations.Core.SendEmail({
        from_name: 'IncubateHer Platform',
        to: 'info@elbertinnovativesolutions.org',
        subject: `New Registration: ${form.full_name} – ${program.label}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px;">
            <h2 style="color: #143A50;">New Program Registration</h2>
            <p><strong>Program:</strong> ${program.label}</p>
            <p><strong>Name:</strong> ${form.full_name}</p>
            <p><strong>Email:</strong> ${form.email}</p>
            <p><strong>Phone:</strong> ${form.phone}</p>
            <p><strong>Organization:</strong> ${form.organization_name}</p>
            <p><strong>Participation Plan:</strong> ${form.participation_plan}</p>
            <p><strong>Consultation Interest:</strong> ${form.interested_in_consultation}</p>
            <p><strong>Funding Barrier:</strong> ${form.funding_barrier}</p>
            <p><strong>Documents Needed:</strong> ${form.documents_needed.join(', ')}</p>
            <p><strong>Existing Items:</strong> ${form.existing_items.join(', ')}</p>
            <p><strong>Grant Experience:</strong> ${form.grant_experience}</p>
            <hr/>
            <p style="color: #888; font-size: 13px;">Log in to the admin panel to review and approve this registration.</p>
          </div>
        `,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error(err.message || 'Submission failed. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProgram) return toast.error('Please select a program first.');
    if (!form.understood_terms) return toast.error('Please confirm you understand the program terms.');
    submitMutation.mutate();
  };

  if (submitted) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: BRAND_COLORS.eisGold + '30' }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: BRAND_COLORS.eisGold }} />
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: BRAND_COLORS.neutralDark }}>Application Submitted!</h2>
        <p className="text-lg max-w-lg mx-auto" style={{ color: BRAND_COLORS.eisNavy }}>
          Thank you, <strong>{form.full_name}</strong>! We've received your application for <strong>{PROGRAMS.find(p => p.id === selectedProgram)?.label}</strong>.
        </p>
        <p className="text-base mt-4 max-w-lg mx-auto" style={{ color: BRAND_COLORS.eisNavy }}>
          Check your email at <strong>{form.email}</strong> for a confirmation. Once an admin reviews and approves your enrollment, you'll receive your platform login link.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>Program Registration</h2>
        <p className="text-base" style={{ color: BRAND_COLORS.eisNavy }}>Complete the form below to apply. An admin will review and approve your enrollment.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl p-8 shadow-lg border border-slate-100">

        {/* Program Selector */}
        <div>
          <Label className="text-base font-semibold mb-3 block" style={{ color: BRAND_COLORS.neutralDark }}>
            Which program are you applying for? *
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROGRAMS.map(program => (
              <button
                key={program.id}
                type="button"
                onClick={() => setSelectedProgram(program.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${selectedProgram === program.id ? 'border-[#E5C089] bg-[#E5C089]/10' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <p className="font-semibold text-sm mb-1" style={{ color: BRAND_COLORS.neutralDark }}>{program.label}</p>
                <p className="text-xs" style={{ color: BRAND_COLORS.eisNavy }}>{program.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2" style={{ color: BRAND_COLORS.neutralDark }}>Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input required value={form.full_name} onChange={e => setField('full_name', e.target.value)} placeholder="First Last" />
            </div>
            <div>
              <Label>Email Address *</Label>
              <Input required type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="(614) 000-0000" />
            </div>
            <div>
              <Label>Organization / Business Name</Label>
              <Input value={form.organization_name} onChange={e => setField('organization_name', e.target.value)} placeholder="Your Org Name" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Organization Type</Label>
              <Input value={form.org_type} onChange={e => setField('org_type', e.target.value)} placeholder="e.g. Nonprofit, LLC, Sole Proprietor" />
            </div>
            <div>
              <Label>Years in Business</Label>
              <Input value={form.years_in_business} onChange={e => setField('years_in_business', e.target.value)} placeholder="e.g. 2 years" />
            </div>
            <div>
              <Label>Annual Revenue (approx.)</Label>
              <Input value={form.annual_revenue} onChange={e => setField('annual_revenue', e.target.value)} placeholder="e.g. Under $50K" />
            </div>
            <div>
              <Label>Number of Employees</Label>
              <Input value={form.employees} onChange={e => setField('employees', e.target.value)} placeholder="e.g. 0, 1–5, 6–10" />
            </div>
          </div>
        </div>

        {/* Participation Plan */}
        <div>
          <Label className="font-semibold text-base block mb-3" style={{ color: BRAND_COLORS.neutralDark }}>How do you plan to participate? *</Label>
          <RadioGroup value={form.participation_plan} onValueChange={v => setField('participation_plan', v)} className="space-y-2">
            {PARTICIPATION_OPTIONS.map(opt => (
              <div key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <RadioGroupItem value={opt} id={`part-${opt}`} />
                <Label htmlFor={`part-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* In-Person */}
        <div>
          <Label className="font-semibold text-base block mb-3" style={{ color: BRAND_COLORS.neutralDark }}>Will you attend in person on Saturday? *</Label>
          <RadioGroup value={form.attend_in_person} onValueChange={v => setField('attend_in_person', v)} className="space-y-2">
            {['Yes, I will attend in person', 'No, I will attend virtually or watch recordings'].map(opt => (
              <div key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <RadioGroupItem value={opt} id={`inperson-${opt}`} />
                <Label htmlFor={`inperson-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Consultation Interest */}
        <div>
          <Label className="font-semibold text-base block mb-3" style={{ color: BRAND_COLORS.neutralDark }}>Are you interested in a 1-on-1 document review consultation? *</Label>
          <RadioGroup value={form.interested_in_consultation} onValueChange={v => setField('interested_in_consultation', v)} className="space-y-2">
            {['Yes – I want to be considered for one of the 20 spots', 'No – I do not need a consultation at this time'].map(opt => (
              <div key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <RadioGroupItem value={opt} id={`consult-${opt}`} />
                <Label htmlFor={`consult-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Documents Needed */}
        <div>
          <Label className="font-semibold text-base block mb-3" style={{ color: BRAND_COLORS.neutralDark }}>Which documents do you need the most support building or refining? (Select all that apply)</Label>
          <div className="space-y-2">
            {DOCUMENT_SUPPORT_OPTIONS.map(opt => (
              <div key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <Checkbox
                  id={`doc-${opt}`}
                  checked={form.documents_needed.includes(opt)}
                  onCheckedChange={() => toggleArray('documents_needed', opt)}
                />
                <Label htmlFor={`doc-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Items */}
        <div>
          <Label className="font-semibold text-base block mb-3" style={{ color: BRAND_COLORS.neutralDark }}>Do you currently have the following in place? (Select all that apply)</Label>
          <div className="space-y-2">
            {EXISTING_ITEMS_OPTIONS.map(opt => (
              <div key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <Checkbox
                  id={`exist-${opt}`}
                  checked={form.existing_items.includes(opt)}
                  onCheckedChange={() => toggleArray('existing_items', opt)}
                />
                <Label htmlFor={`exist-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Funding Barrier */}
        <div>
          <Label className="font-semibold text-base block mb-2" style={{ color: BRAND_COLORS.neutralDark }}>What is your biggest barrier to funding right now?</Label>
          <textarea
            className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#143A50]"
            rows={3}
            value={form.funding_barrier}
            onChange={e => setField('funding_barrier', e.target.value)}
            placeholder="Describe your biggest challenge..."
          />
        </div>

        {/* Grant Experience */}
        <div>
          <Label className="font-semibold text-base block mb-3" style={{ color: BRAND_COLORS.neutralDark }}>How would you describe your grant/contract experience?</Label>
          <RadioGroup value={form.grant_experience} onValueChange={v => setField('grant_experience', v)} className="space-y-2">
            {['Complete beginner – never applied', 'Some experience – applied but not awarded', 'Intermediate – awarded 1–2 grants', 'Experienced – regularly receives funding'].map(opt => (
              <div key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <RadioGroupItem value={opt} id={`exp-${opt}`} />
                <Label htmlFor={`exp-${opt}`} className="cursor-pointer text-sm">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Goals */}
        <div>
          <Label className="font-semibold text-base block mb-2" style={{ color: BRAND_COLORS.neutralDark }}>What are your top goals for this program?</Label>
          <textarea
            className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#143A50]"
            rows={3}
            value={form.goals}
            onChange={e => setField('goals', e.target.value)}
            placeholder="What do you hope to achieve or walk away with?"
          />
        </div>

        {/* How Heard */}
        <div>
          <Label className="font-semibold text-base block mb-2" style={{ color: BRAND_COLORS.neutralDark }}>How did you hear about this program?</Label>
          <Input value={form.how_heard} onChange={e => setField('how_heard', e.target.value)} placeholder="e.g. Social media, friend, email, Columbus Urban League..." />
        </div>

        {/* Terms */}
        <div className="p-4 rounded-xl border-2" style={{ borderColor: BRAND_COLORS.eisGold, backgroundColor: BRAND_COLORS.eisGold + '15' }}>
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={form.understood_terms}
              onCheckedChange={v => setField('understood_terms', v)}
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed" style={{ color: BRAND_COLORS.neutralDark }}>
              I understand that: Consultation spots are limited to 20 participants • Completion of sessions and documents is required for consultation eligibility • Giveaway opportunity applies only to eligible non-federal opportunities • My enrollment is subject to admin review and approval.
            </Label>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full text-white text-lg py-6"
          style={{ backgroundColor: BRAND_COLORS.eisNavy }}
          disabled={submitMutation.isPending || !selectedProgram}
        >
          {submitMutation.isPending ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
          ) : (
            <><ArrowRight className="w-5 h-5 mr-2" /> Submit Application</>
          )}
        </Button>
      </form>
    </div>
  );
}