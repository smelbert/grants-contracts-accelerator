import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ROLE_OPTIONS, HEARD_ABOUT_OPTIONS, OUTREACH_OPTIONS, CALENDLY_URL } from '@/lib/assessmentConfig';

export default function ContactStep({ form, setForm }) {
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <h2 className="text-2xl font-serif text-[#143A50] mb-1">Your contact information</h2>
      <p className="text-sm text-slate-600 mb-6">We'll email your results to you. Required fields are marked with *.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-[#143A50]">First name *</Label>
          <Input value={form.first_name || ''} onChange={e => set('first_name', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-[#143A50]">Last name *</Label>
          <Input value={form.last_name || ''} onChange={e => set('last_name', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-[#143A50]">Email *</Label>
          <Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-[#143A50]">Phone</Label>
          <Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-[#143A50]">Organization *</Label>
          <Input value={form.organization || ''} onChange={e => set('organization', e.target.value)} className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-[#143A50]">Website</Label>
          <Input value={form.website || ''} onChange={e => set('website', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-[#143A50]">Your role</Label>
          <Select value={form.role || ''} onValueChange={v => set('role', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>{ROLE_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[#143A50]">How did you hear about us?</Label>
          <Select value={form.heard_about || ''} onValueChange={v => set('heard_about', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>{HEARD_ABOUT_OPTIONS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="font-semibold text-[#143A50] mb-1">Would you like Dr. Elbert to reach out?</h3>
        <p className="text-sm text-slate-600 mb-4">This helps us respect your time — choose what feels right.</p>
        <div className="space-y-2">
          {OUTREACH_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => set('outreach_preference', opt.value)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                form.outreach_preference === opt.value
                  ? 'border-[#143A50] bg-[#143A50]/5'
                  : 'border-slate-200 hover:border-[#E5C089]'
              }`}
            >
              <p className="font-medium text-sm text-[#143A50]">{opt.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
        {(form.outreach_preference === 'consultation' || form.outreach_preference === 'calendly_booked') && (
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-[#143A50] underline">
            Open Calendly booking page →
          </a>
        )}
      </div>

      <div className="mt-6 flex items-start gap-3">
        <Checkbox
          checked={form.consent || false}
          onCheckedChange={v => set('consent', v)}
          className="mt-0.5"
        />
        <Label className="text-sm text-slate-600 font-normal cursor-pointer" onClick={() => set('consent', !form.consent)}>
          I consent to Elbert Innovative Solutions storing my assessment responses to generate and deliver my results. I have reviewed the Terms & Privacy page.
        </Label>
      </div>
    </div>
  );
}