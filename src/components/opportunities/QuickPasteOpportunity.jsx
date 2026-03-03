import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ClipboardPaste, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickPasteOpportunity({ open, onClose, onCreated }) {
  const [step, setStep] = useState('paste'); // 'paste' | 'review' | 'saving'
  const [pastedText, setPastedText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);

  const handleParse = async () => {
    if (!pastedText.trim()) return;
    setParsing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a grant research assistant. Extract structured information from the following grant/funding opportunity text. Be thorough — extract all available details. If a field is not mentioned, leave it empty/null.

Text:
${pastedText}

Extract into the JSON schema provided.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            funder_name: { type: 'string' },
            type: { type: 'string', enum: ['grant', 'contract', 'rfp', 'rfq', 'donor_program', 'public_fund'] },
            funding_lane: { type: 'string', enum: ['grants', 'contracts', 'donors', 'public_funds'] },
            amount_min: { type: 'number' },
            amount_max: { type: 'number' },
            deadline: { type: 'string', description: 'ISO date format YYYY-MM-DD' },
            rolling_deadline: { type: 'boolean' },
            description: { type: 'string' },
            eligibility_summary: { type: 'string' },
            geographic_focus: { type: 'string' },
            application_url: { type: 'string' },
            source_url: { type: 'string' },
            sector_focus: { type: 'array', items: { type: 'string' } },
          }
        }
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
      toast.success('Opportunity added to Funding Opportunities!');
      onCreated && onCreated(opp);
      handleClose();
    } catch (err) {
      toast.error('Failed to save opportunity.');
      setStep('review');
    }
  };

  const handleClose = () => {
    setPastedText('');
    setParsed(null);
    setStep('paste');
    onClose();
  };

  const updateField = (field, value) => {
    setParsed(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-emerald-600" />
            Quick Paste Grant Opportunity
          </DialogTitle>
        </DialogHeader>

        {step === 'paste' && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
              <strong>How it works:</strong> Paste any grant description, email, or website text and our AI will automatically extract the key details and add it to Funding Opportunities.
            </div>
            <div>
              <Label>Paste grant text here</Label>
              <Textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the full grant announcement, email, or description here..."
                rows={10}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button
                onClick={handleParse}
                disabled={!pastedText.trim() || parsing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {parsing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Parsing with AI...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Parse with AI</>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && parsed && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Review and edit the extracted details before saving.
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Title *</Label>
                <Input value={parsed.title || ''} onChange={e => updateField('title', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Funder Name</Label>
                  <Input value={parsed.funder_name || ''} onChange={e => updateField('funder_name', e.target.value)} />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={parsed.type || 'grant'} onValueChange={v => updateField('type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grants">Grants</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="donors">Donors</SelectItem>
                      <SelectItem value="public_funds">Public Funds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deadline (YYYY-MM-DD)</Label>
                  <Input
                    type="date"
                    value={parsed.deadline || ''}
                    onChange={e => updateField('deadline', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Min Amount ($)</Label>
                  <Input
                    type="number"
                    value={parsed.amount_min || ''}
                    onChange={e => updateField('amount_min', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Max Amount ($)</Label>
                  <Input
                    type="number"
                    value={parsed.amount_max || ''}
                    onChange={e => updateField('amount_max', Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label>Geographic Focus</Label>
                <Input value={parsed.geographic_focus || ''} onChange={e => updateField('geographic_focus', e.target.value)} />
              </div>
              <div>
                <Label>Application URL</Label>
                <Input value={parsed.application_url || ''} onChange={e => updateField('application_url', e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={parsed.description || ''} onChange={e => updateField('description', e.target.value)} rows={4} />
              </div>
              <div>
                <Label>Eligibility Summary</Label>
                <Textarea value={parsed.eligibility_summary || ''} onChange={e => updateField('eligibility_summary', e.target.value)} rows={3} />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setStep('paste')} className="flex-1">
                ← Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={!parsed.title}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Save to Funding Opportunities
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