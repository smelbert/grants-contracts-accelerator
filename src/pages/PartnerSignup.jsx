import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Target,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Calendar,
  Users,
} from 'lucide-react';

const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const ORG_TYPES = [
  'Nonprofit',
  'For-profit',
  'Faith-based',
  'Community-based',
  'Government / Public',
  'Education',
  'Other',
];

const STEPS = [
  { id: 1, label: 'Organization', icon: Building2 },
  { id: 2, label: 'Program', icon: Target },
  { id: 3, label: 'Branding', icon: Palette },
  { id: 4, label: 'Review', icon: CheckCircle2 },
];

const DEFAULTS = {
  // org
  organization_name: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  website: '',
  org_type: 'Nonprofit',
  mission: '',
  // program
  program_name: '',
  program_type: 'cohort_based',
  description: '',
  target_audience: '',
  expected_participants: '',
  proposed_start_date: '',
  learning_outcomes: [],
  // branding
  primary_color: '#143A50',
  accent_color: '#E5C089',
  secondary_color: '#1E4F58',
  logo_url: '',
  header_subtitle: '',
};

export default function PartnerSignup() {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(DEFAULTS);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addOutcome = () => {
    if (!outcomeInput.trim()) return;
    setForm((f) => ({ ...f, learning_outcomes: [...f.learning_outcomes, outcomeInput.trim()] }));
    setOutcomeInput('');
  };
  const removeOutcome = (i) =>
    setForm((f) => ({ ...f, learning_outcomes: f.learning_outcomes.filter((_, idx) => idx !== i) }));

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!form.organization_name || !form.contact_name || !form.contact_email) {
        setError('Organization name, contact name, and contact email are required.');
        return false;
      }
    }
    if (step === 2) {
      if (!form.program_name || !form.description) {
        setError('Program name and description are required.');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 4));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    setError('');
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      // Generate a unique program code
      const base = `${slugify(form.program_name)}_${slugify(form.organization_name)}`;
      let code = base || `program_${Date.now()}`;
      const existing = await base44.entities.ProgramCohort.filter({ program_code: code });
      if (existing.length > 0) {
        code = `${code}_${Math.floor(Math.random() * 9000 + 1000)}`;
      }

      const cohort = await base44.entities.ProgramCohort.create({
        program_name: form.program_name,
        program_code: code,
        funder_organization: form.organization_name,
        delivery_organization: form.organization_name,
        description: form.description,
        program_type: form.program_type,
        is_active: false, // pending admin approval
        start_date: form.proposed_start_date ? new Date(form.proposed_start_date).toISOString() : null,
        learning_outcomes: form.learning_outcomes,
        facilitators: [
          { name: form.contact_name, email: form.contact_email, role: 'lead' },
        ],
        brand_config: {
          primary_color: form.primary_color,
          secondary_color: form.secondary_color,
          accent_color: form.accent_color,
          logo_url: form.logo_url,
          header_title: form.program_name,
          header_subtitle: form.header_subtitle,
          footer_text: `${form.organization_name} · Powered by Elbert Innovative Solutions`,
        },
        curriculum_topics: [],
      });

      // Enroll the contact as the program facilitator
      await base44.entities.ProgramEnrollment.create({
        cohort_id: cohort.id,
        participant_email: form.contact_email,
        participant_name: form.contact_name,
        phone_number: form.contact_phone,
        organization_name: form.organization_name,
        role: 'facilitator',
        enrollment_status: 'active',
        enrolled_date: new Date().toISOString(),
        enrollment_notes: `Self-registered partner. Org type: ${form.org_type}. Target audience: ${form.target_audience}. Expected participants: ${form.expected_participants}. Mission: ${form.mission}`,
      });

      qc.invalidateQueries({ queryKey: ['all-cohorts-admin'] });
      qc.invalidateQueries({ queryKey: ['all-active-cohorts'] });
      setCreated({ ...cohort, _code: code });
      setStep(5); // success screen
    } catch (e) {
      setError(e?.message || 'Something went wrong submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Success screen ----------
  if (step === 5 && created) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Application received!</h1>
            <p className="text-slate-600 mb-6">
              Your program <strong>{created.program_name}</strong> has been submitted for review.
              Our team will activate it and follow up at <strong>{form.contact_email}</strong> within
              a few business days.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 text-left text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Program code</span>
                <span className="font-mono text-slate-900">{created._code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Organization</span>
                <span className="text-slate-900">{form.organization_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <Badge variant="outline" className="text-xs">Pending review</Badge>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={createPageUrl('ProgramOverview')}>
                <Button variant="outline" className="w-full sm:w-auto">
                  Browse Programs
                </Button>
              </Link>
              <Link to={createPageUrl('Home')}>
                <Button className="w-full sm:w-auto">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- Wizard ----------
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-[#143A50] text-white">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <Badge className="bg-[#E5C089]/20 text-[#E5C089] border-0 mb-3">
            <Sparkles className="w-3 h-3 mr-1" /> Partner Registration
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Register your program</h1>
          <p className="text-white/70 max-w-xl">
            Bring a funding-readiness cohort to your community. Tell us about your organization and
            the program you'd like to run — we'll set everything up for you.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return [
              <div key={`step-${s.id}`} className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    active
                      ? 'bg-[#143A50] border-[#143A50] text-white'
                      : done
                      ? 'bg-green-100 border-green-200 text-green-700'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-medium ${active ? 'text-[#143A50]' : 'text-slate-400'}`}
                >
                  {s.label}
                </span>
              </div>,
              i < STEPS.length - 1 && (
                <div
                  key={`conn-${s.id}`}
                  className={`flex-1 h-0.5 mx-2 ${done ? 'bg-green-200' : 'bg-slate-200'}`}
                />
              ),
            ];
          })}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-5">
            {/* STEP 1: Organization */}
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#143A50]" /> Your organization
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Organization name *</Label>
                    <Input
                      value={form.organization_name}
                      onChange={(e) => set('organization_name', e.target.value)}
                      placeholder="e.g. Community Partner Foundation"
                    />
                  </div>
                  <div>
                    <Label>Contact name *</Label>
                    <Input
                      value={form.contact_name}
                      onChange={(e) => set('contact_name', e.target.value)}
                      placeholder="Program lead"
                    />
                  </div>
                  <div>
                    <Label>Contact email *</Label>
                    <Input
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => set('contact_email', e.target.value)}
                      placeholder="you@organization.org"
                    />
                  </div>
                  <div>
                    <Label>Contact phone</Label>
                    <Input
                      value={form.contact_phone}
                      onChange={(e) => set('contact_phone', e.target.value)}
                      placeholder="(555) 555-5555"
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={form.website}
                      onChange={(e) => set('website', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Organization type</Label>
                    <select
                      value={form.org_type}
                      onChange={(e) => set('org_type', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white"
                    >
                      {ORG_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Mission / brief description</Label>
                    <Textarea
                      rows={3}
                      value={form.mission}
                      onChange={(e) => set('mission', e.target.value)}
                      placeholder="What does your organization do, and who do you serve?"
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Program */}
            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#143A50]" /> Program details
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Program name *</Label>
                    <Input
                      value={form.program_name}
                      onChange={(e) => set('program_name', e.target.value)}
                      placeholder="e.g. Faith-Based Funding Readiness"
                    />
                  </div>
                  <div>
                    <Label>Program type</Label>
                    <select
                      value={form.program_type}
                      onChange={(e) => set('program_type', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white"
                    >
                      <option value="cohort_based">Cohort-based (scheduled sessions)</option>
                      <option value="self_paced">Self-paced</option>
                    </select>
                  </div>
                  <div>
                    <Label>Expected participants</Label>
                    <Input
                      type="number"
                      value={form.expected_participants}
                      onChange={(e) => set('expected_participants', e.target.value)}
                      placeholder="e.g. 25"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description *</Label>
                    <Textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      placeholder="What will participants learn or accomplish?"
                    />
                  </div>
                  <div>
                    <Label>Target audience</Label>
                    <Input
                      value={form.target_audience}
                      onChange={(e) => set('target_audience', e.target.value)}
                      placeholder="e.g. Faith-based nonprofit leaders"
                    />
                  </div>
                  <div>
                    <Label>Proposed start date</Label>
                    <Input
                      type="date"
                      value={form.proposed_start_date}
                      onChange={(e) => set('proposed_start_date', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Learning outcomes (optional)</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={outcomeInput}
                        onChange={(e) => setOutcomeInput(e.target.value)}
                        placeholder="Add an outcome, press Enter..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOutcome();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addOutcome}>
                        Add
                      </Button>
                    </div>
                    <ul className="space-y-1">
                      {form.learning_outcomes.map((o, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between bg-slate-50 rounded px-3 py-2 text-sm"
                        >
                          <span>{o}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOutcome(i)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            ×
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Branding */}
            {step === 3 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#143A50]" /> Branding (optional)
                </h2>
                <p className="text-sm text-slate-500">
                  Customize how your program looks to participants. Defaults use the EIS brand.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Primary color</Label>
                    <Input
                      type="color"
                      value={form.primary_color}
                      onChange={(e) => set('primary_color', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Accent color</Label>
                    <Input
                      type="color"
                      value={form.accent_color}
                      onChange={(e) => set('accent_color', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Secondary color</Label>
                    <Input
                      type="color"
                      value={form.secondary_color}
                      onChange={(e) => set('secondary_color', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label className="text-xs">Logo URL</Label>
                    <Input
                      value={form.logo_url}
                      onChange={(e) => set('logo_url', e.target.value)}
                      placeholder="https://... (leave blank to use EIS logo)"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label className="text-xs">Header subtitle</Label>
                    <Input
                      value={form.header_subtitle}
                      onChange={(e) => set('header_subtitle', e.target.value)}
                      placeholder="e.g. A funding-readiness accelerator"
                    />
                  </div>
                </div>
                {/* Preview */}
                <div
                  className="rounded-lg p-4 text-white mt-2"
                  style={{ backgroundColor: form.primary_color }}
                >
                  <p className="text-xs uppercase tracking-wider opacity-70">Program preview</p>
                  <h3 className="text-xl font-bold">{form.program_name || 'Your Program'}</h3>
                  <p className="text-sm opacity-90">{form.header_subtitle || 'Funding readiness training'}</p>
                </div>
              </>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#143A50]" /> Review & submit
                </h2>
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Organization
                    </p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <dt className="text-slate-500">Name</dt>
                      <dd className="text-slate-900">{form.organization_name || '—'}</dd>
                      <dt className="text-slate-500">Contact</dt>
                      <dd className="text-slate-900">
                        {form.contact_name || '—'} · {form.contact_email || '—'}
                      </dd>
                      <dt className="text-slate-500">Type</dt>
                      <dd className="text-slate-900">{form.org_type}</dd>
                    </dl>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> Program
                    </p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <dt className="text-slate-500">Name</dt>
                      <dd className="text-slate-900">{form.program_name || '—'}</dd>
                      <dt className="text-slate-500">Type</dt>
                      <dd className="text-slate-900">
                        {form.program_type === 'self_paced' ? 'Self-paced' : 'Cohort-based'}
                      </dd>
                      <dt className="text-slate-500">Participants</dt>
                      <dd className="text-slate-900">{form.expected_participants || '—'}</dd>
                      <dt className="text-slate-500">Start date</dt>
                      <dd className="text-slate-900">{form.proposed_start_date || '—'}</dd>
                    </dl>
                    {form.learning_outcomes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {form.learning_outcomes.map((o, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {o}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    On submission, your program is created as <strong>pending review</strong>. Our team
                    will activate it and follow up by email.
                  </p>
                </div>
              </>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={back} disabled={step === 1 || submitting}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              {step < 4 ? (
                <Button onClick={next}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Submit application
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Already have a program?{' '}
          <Link to={createPageUrl('ProgramOverview')} className="text-[#143A50] underline">
            View programs
          </Link>
        </p>
      </div>
    </div>
  );
}