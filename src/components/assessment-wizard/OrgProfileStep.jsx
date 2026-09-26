import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { STRUCTURES, YEARS_OPTIONS, BUDGET_OPTIONS, LARGEST_AWARD_OPTIONS, FEDERAL_EXPERIENCE_OPTIONS, TARGET_AMOUNT_OPTIONS, TIMELINE_OPTIONS, PROPOSAL_WRITER_OPTIONS, FUNDING_SOURCES_OPTIONS } from '@/lib/assessmentConfig';

export default function OrgProfileStep({ form, setForm }) {
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleFundingSource = (source) => {
    const current = form.funding_sources || [];
    set('funding_sources', current.includes(source) ? current.filter(s => s !== source) : [...current, source]);
  };

  return (
    <div>
      <h2 className="text-2xl font-serif text-[#143A50] mb-1">Organization profile</h2>
      <p className="text-sm text-slate-600 mb-6">Tell us about your organization. This information is not scored — it helps us tailor your results.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label className="text-[#143A50]">Legal structure *</Label>
          <Select value={form.structure || ''} onValueChange={v => set('structure', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select your legal structure" /></SelectTrigger>
            <SelectContent>
              {Object.entries(STRUCTURES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#143A50]">Years in operation</Label>
          <Select value={form.years || ''} onValueChange={v => set('years', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger>
            <SelectContent>{YEARS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#143A50]">Annual operating budget</Label>
          <Select value={form.budget || ''} onValueChange={v => set('budget', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger>
            <SelectContent>{BUDGET_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#143A50]">Largest single award to date</Label>
          <Select value={form.largest_award || ''} onValueChange={v => set('largest_award', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger>
            <SelectContent>{LARGEST_AWARD_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#143A50]">Federal award experience</Label>
          <Select value={form.federal_experience || ''} onValueChange={v => set('federal_experience', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select experience" /></SelectTrigger>
            <SelectContent>{FEDERAL_EXPERIENCE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#143A50]">Target award size</Label>
          <Select value={form.target_amount || ''} onValueChange={v => set('target_amount', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger>
            <SelectContent>{TARGET_AMOUNT_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#143A50]">Funding timeline</Label>
          <Select value={form.timeline || ''} onValueChange={v => set('timeline', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select timeline" /></SelectTrigger>
            <SelectContent>{TIMELINE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-[#143A50]">Who currently writes proposals?</Label>
          <Select value={form.proposal_writer || ''} onValueChange={v => set('proposal_writer', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select option" /></SelectTrigger>
            <SelectContent>{PROPOSAL_WRITER_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-[#143A50] mb-2 block">Current funding sources</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FUNDING_SOURCES_OPTIONS.map(source => (
            <label key={source} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
              <Checkbox
                checked={(form.funding_sources || []).includes(source)}
                onCheckedChange={() => toggleFundingSource(source)}
              />
              <span className="text-sm text-slate-700">{source}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}