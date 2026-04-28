import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = ['Active', 'Pending Renewal', 'Expired', 'Inactive'];
const FREQUENCIES = ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'One-time recurring'];
const DONOR_TYPES = ['Individual', 'Corporate', 'Faith Community', 'Foundation', 'Government', 'Other'];

const EMPTY = { recurring_id: '', donor_name: '', donor_type: '', contact_name: '', contact_email: '', contact_phone: '', description: '', frequency: '', estimated_annual_fmv: '', start_date: '', end_date: '', written_agreement: '', renewal_stewardship_plan: '', status: 'Active', notes: '' };

export default function InKindRecurringGifts({ recurring, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const totalAnnualFMV = recurring.filter(r => r.status === 'Active').reduce((s, r) => s + (r.estimated_annual_fmv || 0), 0);

  const handleOpen = (r = null) => {
    if (r) { setForm({ ...EMPTY, ...r }); setEditingId(r.id); }
    else { setForm({ ...EMPTY, recurring_id: `RG-${String(recurring.length + 1).padStart(3, '0')}` }); setEditingId(null); }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.donor_name || !form.description || !form.frequency || !form.estimated_annual_fmv) { toast.error('Fill in required fields'); return; }
    setSaving(true);
    const data = { ...form, estimated_annual_fmv: parseFloat(form.estimated_annual_fmv) || 0 };
    if (editingId) { await base44.entities.InKindRecurringGift.update(editingId, data); toast.success('Updated'); }
    else { await base44.entities.InKindRecurringGift.create(data); toast.success('Recurring gift saved'); }
    setSaving(false); setShowForm(false); onRefresh();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    await base44.entities.InKindRecurringGift.delete(id); toast.success('Deleted'); onRefresh();
  };

  const f = form;
  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const statusColor = { Active: 'bg-green-100 text-green-800', 'Pending Renewal': 'bg-amber-100 text-amber-800', Expired: 'bg-red-100 text-red-800', Inactive: 'bg-slate-100 text-slate-700' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#143A50]">Recurring In-Kind Gifts</h2>
          <p className="text-sm text-slate-500">Track ongoing partnerships. Log each occurrence in the Donations Log linked by Recurring ID.</p>
        </div>
        <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58]" onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-1" /> Add Recurring Gift
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-[#143A50]">{recurring.filter(r => r.status === 'Active').length}</p>
          <p className="text-xs text-slate-500">Active Recurring Gifts</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">${totalAnnualFMV.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Projected Annual FMV</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{recurring.filter(r => r.status === 'Pending Renewal').length}</p>
          <p className="text-xs text-slate-500">Pending Renewal</p>
        </CardContent></Card>
      </div>

      {recurring.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-slate-500">No recurring gifts yet. Add your ongoing partnerships here.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {recurring.map(r => (
            <Card key={r.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">{r.recurring_id}</span>
                      <Badge className={statusColor[r.status] || 'bg-slate-100'}>{r.status}</Badge>
                      <Badge variant="outline">{r.frequency}</Badge>
                    </div>
                    <CardTitle className="text-lg">{r.donor_name}</CardTitle>
                    {r.contact_name && <p className="text-sm text-slate-500">Contact: {r.contact_name} {r.contact_email && `· ${r.contact_email}`}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-700">${(r.estimated_annual_fmv || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">est. annual FMV</p>
                    <div className="flex gap-1 mt-2 justify-end">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpen(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-700 mb-3">{r.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div><p className="text-slate-400">Start</p><p>{r.start_date || '—'}</p></div>
                  <div><p className="text-slate-400">End / Renewal</p><p>{r.end_date || '—'}</p></div>
                  <div><p className="text-slate-400">Written Agreement</p><p>{r.written_agreement || '—'}</p></div>
                  <div><p className="text-slate-400">Donor Type</p><p>{r.donor_type || '—'}</p></div>
                </div>
                {r.renewal_stewardship_plan && (
                  <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-800">
                    <strong>Stewardship Plan:</strong> {r.renewal_stewardship_plan}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Recurring Gift' : 'Add Recurring In-Kind Gift'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Recurring ID</Label><Input value={f.recurring_id} onChange={e => setF('recurring_id', e.target.value)} /></div>
              <div><Label>Status</Label>
                <Select value={f.status} onValueChange={v => setF('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Donor Name *</Label><Input value={f.donor_name} onChange={e => setF('donor_name', e.target.value)} /></div>
              <div><Label>Donor Type</Label>
                <Select value={f.donor_type} onValueChange={v => setF('donor_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{DONOR_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Contact Name</Label><Input value={f.contact_name} onChange={e => setF('contact_name', e.target.value)} /></div>
              <div><Label>Contact Email</Label><Input value={f.contact_email} onChange={e => setF('contact_email', e.target.value)} /></div>
              <div><Label>Contact Phone</Label><Input value={f.contact_phone} onChange={e => setF('contact_phone', e.target.value)} /></div>
              <div><Label>Frequency *</Label>
                <Select value={f.frequency} onValueChange={v => setF('frequency', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map(fr => <SelectItem key={fr} value={fr}>{fr}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description of Ongoing Gift *</Label><Textarea rows={2} value={f.description} onChange={e => setF('description', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Estimated Annual FMV ($) *</Label><Input type="number" value={f.estimated_annual_fmv} onChange={e => setF('estimated_annual_fmv', e.target.value)} /></div>
              <div><Label>Written Agreement?</Label><Input value={f.written_agreement} onChange={e => setF('written_agreement', e.target.value)} placeholder="Yes / Verbal / No" /></div>
              <div><Label>Start Date</Label><Input type="date" value={f.start_date} onChange={e => setF('start_date', e.target.value)} /></div>
              <div><Label>End Date / Renewal</Label><Input type="date" value={f.end_date} onChange={e => setF('end_date', e.target.value)} /></div>
            </div>
            <div><Label>Renewal Stewardship Plan</Label><Textarea rows={2} value={f.renewal_stewardship_plan} onChange={e => setF('renewal_stewardship_plan', e.target.value)} placeholder="e.g. Quarterly thank-you note, annual recognition, social media tags..." /></div>
            <div><Label>Notes</Label><Textarea rows={2} value={f.notes} onChange={e => setF('notes', e.target.value)} /></div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}