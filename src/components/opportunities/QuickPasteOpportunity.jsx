import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ClipboardPaste, Check, AlertCircle, Loader2, Link2, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const EXTRACT_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    funder_name: { type: 'string' },
    type: { type: 'string', enum: ['grant', 'contract', 'rfp', 'rfq', 'donor_program', 'public_fund'] },
    funding_lane: { type: 'string', enum: ['grants', 'contracts', 'donors', 'public_funds'] },
    amount_min: { type: 'number' },
    amount_max: { type: 'number' },
    deadline: { type: 'string', description: 'ISO date YYYY-MM-DD' },
    rolling_deadline: { type: 'boolean' },
    description: { type: 'string' },
    eligibility_summary: { type: 'string' },
    geographic_focus: { type: 'string' },
    application_url: { type: 'string' },
    source_url: { type: 'string' },
    sector_focus: { type: 'array', items: { type: 'string' } },
  }
};

const EXTRACT_PROMPT = (content) => `You are a grant research assistant. Extract ALL structured information about this funding opportunity. Be thorough. If a field is not available, leave it null. For "type" use: grant, contract, rfp, rfq, donor_program, or public_fund. For "funding_lane" use: grants, contracts, donors, or public_funds. For deadline use ISO date format YYYY-MM-DD.\n\nContent:\n${content}`;

export default function QuickPasteOpportunity({ open, onClose, onCreated }) {
  const [mode, setMode] = useState('url'); // 'url' | 'paste'
  const [url, setUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'review' | 'saving'
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);

  const handleParseUrl = async () => {
    if (!url.trim()) return;
    setParsing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Go to this URL and extract all details about the funding opportunity / grant / RFP / contract listed on that page: ${url}\n\n${EXTRACT_PROMPT('(Use the page content from the URL above)')}`,
        add_context_from_internet: true,
        response_json_schema: EXTRACT_SCHEMA
      });
      if (!result || !result.title) throw new Error('Could not extract opportunity details from that URL.');
      // Auto-fill source_url if not set
      if (!result.source_url) result.source_url = url;
      if (!result.application_url) result.application_url = url;
      setParsed(result);
      setStep('review');
    } catch (err) {
      toast.error(err.message || 'Failed to extract from URL. Try pasting the text instead.');
    } finally {
      setParsing(false);
    }
  };

  const handleParseText = async () => {
    if (!pastedText.trim()) return;
    setParsing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: EXTRACT_PROMPT(pastedText),
        response_json_schema: EXTRACT_SCHEMA
      });
      setParsed(result);
      setStep('review');
    } catch (err) {
      toast.error('Failed to parse. Please try again.');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    setStep('saving');
    try {
      const opp = await base44.entities.FundingOpportunity.create({
        ...parsed,
        status: 'active',
        is_active: true,
        ai_scanned: false,
      });
      toast.success('Opportunity added!');
      onCreated && onCreated(opp);
      handleClose();
    } catch (err) {
      toast.error('Failed to save opportunity.');
      setStep('review');
    }
  };

  const handleClose = () => {
    setUrl('');
    setPastedText('');
    setParsed(null);
    setStep('input');
    setMode('url');
    onClose();
  };

  const updateField = (field, value) => setParsed(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#143A50]">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Add Funding Opportunity via AI
          </DialogTitle>
        </DialogHeader>

        {/* Input Step */}
        {step === 'input' && (
          <div className="space-y-5">
            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setMode('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'url' ? 'bg-white shadow text-[#143A50]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Link2 className="w-4 h-4" /> Paste a URL
              </button>
              <button
                onClick={() => setMode('paste')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'paste' ? 'bg-white shadow text-[#143A50]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FileText className="w-4 h-4" /> Paste Text
              </button>
            </div>

            {mode === 'url' ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                  <strong>Just paste a URL</strong> — AI will visit the grant page and extract all the details automatically.
                </div>
                <div>
                  <Label>Grant / RFP / Opportunity URL</Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.grantexample.com/apply"
                    className="mt-1.5"
                    onKeyDown={(e) => e.key === 'Enter' && handleParseUrl()}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
                  <Button onClick={handleParseUrl} disabled={!url.trim() || parsing} className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]">
                    {parsing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Extracting...</> : <><Sparkles className="w-4 h-4 mr-2" />Extract with AI</>}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  Paste any grant announcement, email, or description and AI will extract the key details.
                </div>
                <div>
                  <Label>Paste grant text</Label>
                  <Textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste the full grant announcement, email, or description here..."
                    rows={10}
                    className="mt-1.5 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
                  <Button onClick={handleParseText} disabled={!pastedText.trim() || parsing} className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]">
                    {parsing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Parsing...</> : <><Sparkles className="w-4 h-4 mr-2" />Parse with AI</>}
                  </Button>
                </div>
              </div>
            )}

            {parsing && (
              <div className="py-8 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
                <p className="text-slate-700 font-medium">{mode === 'url' ? 'Visiting the page and extracting details...' : 'Analyzing grant text...'}</p>
                <p className="text-slate-500 text-sm mt-1">This may take a few seconds</p>
              </div>
            )}
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && parsed && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              AI extracted the details below. Review and edit anything before saving.
            </div>

            <div className="space-y-3">
              <div>
                <Label>Title *</Label>
                <Input value={parsed.title || ''} onChange={e => updateField('title', e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Funder / Organization</Label>
                  <Input value={parsed.funder_name || ''} onChange={e => updateField('funder_name', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={parsed.type || 'grant'} onValueChange={v => updateField('type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grant">Grant</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="rfp">RFP</SelectItem>
                      <SelectItem value="rfq">RFQ</SelectItem>
                      <SelectItem value="donor_program">Donor Program</SelectItem>
                      <SelectItem value="public_fund">Public Fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Funding Lane</Label>
                  <Select value={parsed.funding_lane || 'grants'} onValueChange={v => updateField('funding_lane', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grants">Grants</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="donors">Donors</SelectItem>
                      <SelectItem value="public_funds">Public Funds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input type="date" value={parsed.deadline || ''} onChange={e => updateField('deadline', e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Min Amount ($)</Label>
                  <Input type="number" value={parsed.amount_min || ''} onChange={e => updateField('amount_min', Number(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label>Max Amount ($)</Label>
                  <Input type="number" value={parsed.amount_max || ''} onChange={e => updateField('amount_max', Number(e.target.value))} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Geographic Focus</Label>
                <Input value={parsed.geographic_focus || ''} onChange={e => updateField('geographic_focus', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Application URL</Label>
                <Input value={parsed.application_url || ''} onChange={e => updateField('application_url', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={parsed.description || ''} onChange={e => updateField('description', e.target.value)} rows={4} className="mt-1" />
              </div>
              <div>
                <Label>Eligibility Summary</Label>
                <Textarea value={parsed.eligibility_summary || ''} onChange={e => updateField('eligibility_summary', e.target.value)} rows={3} className="mt-1" />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">← Back</Button>
              <Button onClick={handleSave} disabled={!parsed.title} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Check className="w-4 h-4 mr-2" /> Save to Opportunities
              </Button>
            </div>
          </div>
        )}

        {step === 'saving' && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-slate-600">Saving opportunity...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}