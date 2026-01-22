import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Building2, MapPin, Users, Wallet, Target, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 'org_type', title: 'Organization Type', icon: Building2 },
  { id: 'stage', title: 'Development Stage', icon: Target },
  { id: 'geography', title: 'Location', icon: MapPin },
  { id: 'structure', title: 'Team & Governance', icon: Users },
  { id: 'experience', title: 'Funding Experience', icon: Wallet },
  { id: 'interests', title: 'Funding Interests', icon: Target },
];

export default function OnboardingWizard({ onComplete, initialData = {} }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: initialData.name || '',
    type: initialData.type || '',
    stage: initialData.stage || '',
    city: initialData.city || '',
    county: initialData.county || '',
    state: initialData.state || '',
    annual_budget: initialData.annual_budget || '',
    staff_structure: initialData.staff_structure || '',
    governance_status: initialData.governance_status || '',
    funding_experience: initialData.funding_experience || '',
    interest_areas: initialData.interest_areas || [],
    ...initialData
  });

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setData(prev => ({
      ...prev,
      interest_areas: prev.interest_areas.includes(interest)
        ? prev.interest_areas.filter(i => i !== interest)
        : [...prev.interest_areas, interest]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.name && data.type;
      case 1: return data.stage;
      case 2: return data.state;
      case 3: return data.staff_structure && data.governance_status;
      case 4: return data.funding_experience && data.annual_budget;
      case 5: return data.interest_areas.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Organization Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => updateData('name', e.target.value)}
                placeholder="Enter your organization name"
                className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Organization Type</Label>
              <RadioGroup value={data.type} onValueChange={(v) => updateData('type', v)} className="grid grid-cols-1 gap-3">
                {[
                  { value: 'nonprofit', label: '501(c)(3) Nonprofit', desc: 'Tax-exempt charitable organization' },
                  { value: 'for_profit', label: 'For-Profit Business', desc: 'LLC, Corporation, or other business entity' },
                  { value: 'solopreneur', label: 'Solopreneur / Startup', desc: 'Individual or early-stage venture' },
                  { value: 'community_based', label: 'Community-Based Org', desc: 'Grassroots or unincorporated group' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${data.type === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <RadioGroupItem value={opt.value} className="mt-1 text-emerald-600" />
                    <div className="ml-3">
                      <p className="font-medium text-slate-900">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-slate-700">Where are you in your journey?</Label>
            <RadioGroup value={data.stage} onValueChange={(v) => updateData('stage', v)} className="grid grid-cols-1 gap-3">
              {[
                { value: 'idea', label: 'Idea Stage', desc: 'Planning or researching, not yet operational' },
                { value: 'early', label: 'Early Stage', desc: 'Just launched, building initial programs' },
                { value: 'operating', label: 'Operating', desc: 'Running programs, established operations' },
                { value: 'scaling', label: 'Scaling', desc: 'Growing reach, diversifying funding' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${data.stage === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <RadioGroupItem value={opt.value} className="mt-1 text-emerald-600" />
                  <div className="ml-3">
                    <p className="font-medium text-slate-900">{opt.label}</p>
                    <p className="text-sm text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">City</Label>
                <Input
                  value={data.city}
                  onChange={(e) => updateData('city', e.target.value)}
                  placeholder="City"
                  className="h-12 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">County</Label>
                <Input
                  value={data.county}
                  onChange={(e) => updateData('county', e.target.value)}
                  placeholder="County"
                  className="h-12 border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">State *</Label>
              <Select value={data.state} onValueChange={(v) => updateData('state', v)}>
                <SelectTrigger className="h-12 border-slate-200">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Staff Structure</Label>
              <RadioGroup value={data.staff_structure} onValueChange={(v) => updateData('staff_structure', v)} className="grid grid-cols-1 gap-3">
                {[
                  { value: 'all_volunteer', label: 'All Volunteer', desc: 'No paid staff' },
                  { value: 'contractors_only', label: 'Contractors Only', desc: 'No W-2 employees' },
                  { value: 'mixed', label: 'Mixed', desc: 'Combination of volunteers, contractors, employees' },
                  { value: 'employees_only', label: 'Employees Only', desc: 'Paid W-2 staff' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${data.staff_structure === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <RadioGroupItem value={opt.value} className="mt-1 text-emerald-600" />
                    <div className="ml-3">
                      <p className="font-medium text-slate-900">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Governance Status</Label>
              <RadioGroup value={data.governance_status} onValueChange={(v) => updateData('governance_status', v)} className="grid grid-cols-1 gap-3">
                {[
                  { value: 'no_board', label: 'No Board', desc: 'No formal governance structure' },
                  { value: 'advisory_only', label: 'Advisory Board Only', desc: 'Advisors but no governing board' },
                  { value: 'formal_board', label: 'Formal Board', desc: 'Active governing board of directors' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${data.governance_status === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <RadioGroupItem value={opt.value} className="mt-1 text-emerald-600" />
                    <div className="ml-3">
                      <p className="font-medium text-slate-900">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Annual Budget</Label>
              <RadioGroup value={data.annual_budget} onValueChange={(v) => updateData('annual_budget', v)} className="grid grid-cols-2 gap-3">
                {[
                  { value: 'under_25k', label: 'Under $25K' },
                  { value: '25k_100k', label: '$25K - $100K' },
                  { value: '100k_500k', label: '$100K - $500K' },
                  { value: '500k_1m', label: '$500K - $1M' },
                  { value: '1m_5m', label: '$1M - $5M' },
                  { value: 'over_5m', label: 'Over $5M' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${data.annual_budget === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <RadioGroupItem value={opt.value} className="sr-only" />
                    <span className={`font-medium ${data.annual_budget === opt.value ? 'text-emerald-700' : 'text-slate-700'}`}>{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Prior Funding Experience</Label>
              <RadioGroup value={data.funding_experience} onValueChange={(v) => updateData('funding_experience', v)} className="grid grid-cols-1 gap-3">
                {[
                  { value: 'none', label: 'No Experience', desc: 'Never applied for or received grants/contracts' },
                  { value: 'some', label: 'Some Experience', desc: 'Applied for or received a few grants' },
                  { value: 'advanced', label: 'Advanced', desc: 'Regularly pursue and manage multiple funding sources' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${data.funding_experience === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <RadioGroupItem value={opt.value} className="mt-1 text-emerald-600" />
                    <div className="ml-3">
                      <p className="font-medium text-slate-900">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-slate-700">What funding types interest you? (Select all that apply)</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'grants', label: 'Grants & Foundations', desc: 'Foundation grants, government grants, fellowships' },
                { value: 'contracts', label: 'Contracts & RFPs', desc: 'Government contracts, procurement opportunities' },
                { value: 'donors', label: 'Donors & Philanthropy', desc: 'Individual donors, major gifts, fundraising' },
                { value: 'public_funds', label: 'Public Funding & Civic', desc: 'City/county funding, earmarks, civic engagement' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${data.interest_areas.includes(opt.value) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <Checkbox
                    checked={data.interest_areas.includes(opt.value)}
                    onCheckedChange={() => toggleInterest(opt.value)}
                    className="mt-1 text-emerald-600 border-slate-300"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-slate-900">{opt.label}</p>
                    <p className="text-sm text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Progress */}
          <div className="px-8 pt-8">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50' : 'bg-slate-100 text-slate-400'}`}>
                    {i < step ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`hidden md:block w-12 h-0.5 mx-1 ${i < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-4">Step {step + 1} of {STEPS.length}</p>
            <h2 className="text-2xl font-semibold text-slate-900 mt-1">{STEPS[step].title}</h2>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="text-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
            >
              {step === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}