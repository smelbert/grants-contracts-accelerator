import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertTriangle, Info, Download, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function InKindAcknowledgments({ donations }) {
  const [markingId, setMarkingId] = useState(null);
  const [sentDate, setSentDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const gifts250Plus = donations.filter(d => (d.total_fmv || 0) >= 250);
  const notSent = gifts250Plus.filter(d => d.acknowledgment_required && !d.acknowledgment_sent_date);
  const sent = gifts250Plus.filter(d => d.acknowledgment_sent_date);
  const gifts500Plus = donations.filter(d => (d.total_fmv || 0) >= 500);
  const gifts5000Plus = donations.filter(d => (d.total_fmv || 0) >= 5000);

  const handleMarkSent = async () => {
    if (!markingId || !sentDate) return;
    setSaving(true);
    await base44.entities.InKindDonation.update(markingId, { acknowledgment_sent_date: sentDate });
    setSaving(false);
    setMarkingId(null);
    toast.success('Acknowledgment date recorded');
  };

  const exportCSV = () => {
    const headers = ['Gift ID','Donor Name','Date Received','FMV','Ack Required?','Ack Sent Date','Form 8283 Required?','Notes'];
    const rows = gifts250Plus.map(d => [d.gift_id, d.donor_name, d.date_received, d.total_fmv, d.acknowledgment_required ? 'Yes' : 'No', d.acknowledgment_sent_date || 'NOT SENT', d.form_8283_required || '', d.notes || '']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'acknowledgment-tracker.csv'; a.click();
    toast.success('Exported');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#143A50]">Acknowledgment & Tax Form Tracker</h2>
          <p className="text-sm text-slate-500">IRS-required donor acknowledgments and Form 8283 compliance tracking.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={gifts250Plus.length === 0}><Download className="w-4 h-4 mr-1" /> Export</Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm space-y-1">
          <p><strong>IRS Thresholds:</strong></p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li><strong>$250+:</strong> Donor needs written acknowledgment from your org before filing their tax return.</li>
            <li><strong>$500+:</strong> Donor must file Form 8283 Section A on their return (your org does not sign).</li>
            <li><strong>$5,000+:</strong> Requires qualified appraisal AND your org must sign Form 8283 Section B.</li>
            <li><strong>Sold donated property within 3 years?</strong> Your org must file Form 8282.</li>
            <li><strong>For-Profits / Entrepreneurs:</strong> These IRS thresholds apply to donors claiming deductions. Track barter/in-kind agreements separately.</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className={notSent.length > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${notSent.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{notSent.length}</p>
            <p className="text-xs text-slate-500">Ack. NOT Sent 🚨</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-700">{sent.length}</p>
            <p className="text-xs text-slate-500">Ack. Sent ✓</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{gifts500Plus.length}</p>
            <p className="text-xs text-slate-500">Need Form 8283-A</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-700">{gifts5000Plus.length}</p>
            <p className="text-xs text-slate-500">Need Form 8283-B + Appraisal</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Acknowledgments */}
      {notSent.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Acknowledgments Needed ({notSent.length})
          </h3>
          <div className="space-y-2">
            {notSent.map(d => (
              <Card key={d.id} className="border-red-200 bg-red-50">
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{d.donor_name}</p>
                      <p className="text-sm text-slate-600">{d.item_description}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-emerald-100 text-emerald-800">${(d.total_fmv || 0).toLocaleString()} FMV</Badge>
                        <Badge variant="outline">{d.date_received}</Badge>
                        {(d.total_fmv || 0) >= 5000 && <Badge className="bg-red-600 text-white">$5K+ Requires Appraisal</Badge>}
                        {(d.total_fmv || 0) >= 500 && (d.total_fmv || 0) < 5000 && <Badge className="bg-amber-100 text-amber-800">8283-A Required</Badge>}
                      </div>
                      {d.form_8283_required && <p className="text-xs text-slate-400 mt-1">Form 8283: {d.form_8283_required}</p>}
                    </div>
                    <Button size="sm" className="bg-[#143A50] flex-shrink-0" onClick={() => { setMarkingId(d.id); setSentDate(new Date().toISOString().split('T')[0]); }}>
                      <Mail className="w-3.5 h-3.5 mr-1" /> Mark Sent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sent Acknowledgments */}
      {sent.length > 0 && (
        <div>
          <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Acknowledgments Sent ({sent.length})
          </h3>
          <div className="space-y-2">
            {sent.map(d => (
              <Card key={d.id} className="border-green-200">
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="font-medium text-slate-900">{d.donor_name}</p>
                      </div>
                      <p className="text-sm text-slate-600 ml-6">{d.item_description}</p>
                      <div className="flex gap-2 mt-1 ml-6">
                        <Badge className="bg-emerald-100 text-emerald-800">${(d.total_fmv || 0).toLocaleString()}</Badge>
                        <Badge variant="outline" className="bg-green-50">Sent: {d.acknowledgment_sent_date}</Badge>
                        {(d.total_fmv || 0) >= 500 && <Badge variant="outline">{d.form_8283_required || 'Form 8283'}</Badge>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setMarkingId(d.id); setSentDate(d.acknowledgment_sent_date || ''); }}>
                      Edit Date
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {gifts250Plus.length === 0 && (
        <Card><CardContent className="py-16 text-center text-slate-500">
          No gifts of $250+ logged yet. Gifts at this level require written acknowledgment.
        </CardContent></Card>
      )}

      {/* Letter Template Guidance */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm text-slate-700">Required Acknowledgment Letter Language</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-600 space-y-2">
          <p>Your written acknowledgment letter must include:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Name of the donee organization</li>
            <li>Date and description of the donated property (NOT the value — that's the donor's job)</li>
            <li>Statement of whether goods or services were provided in exchange and, if so, a good faith estimate of their value</li>
            <li>For services (volunteer labor): must state that "no goods or services were provided in exchange for the contribution" (since volunteer services are generally not deductible)</li>
          </ul>
          <p className="mt-2 text-amber-700"><strong>Note:</strong> For in-kind gifts, your org does NOT assign value in the acknowledgment letter. The donor is responsible for determining and documenting the FMV for their own tax purposes.</p>
        </CardContent>
      </Card>

      {/* Mark Sent Dialog */}
      <Dialog open={!!markingId} onOpenChange={() => setMarkingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Record Acknowledgment Date</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Date Acknowledgment Was Sent</Label><Input type="date" value={sentDate} onChange={e => setSentDate(e.target.value)} /></div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setMarkingId(null)}>Cancel</Button>
              <Button className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]" onClick={handleMarkSent} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}