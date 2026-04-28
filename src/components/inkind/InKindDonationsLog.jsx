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
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Download, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Facility/Space', 'Food/Bev', 'Equipment', 'Apparel/Uniforms', 'Printing/Marketing', 'Professional Services', 'Technology', 'Transportation', 'Other Goods', 'Other Services'];
const GAAP_CATS = ['Donated Goods - Equipment', 'Donated Goods - Food', 'Donated Goods - Apparel/Uniforms', 'Donated Goods - Other', 'Donated Facility Use', 'Donated Professional Services', 'Donated General Services (Non-GAAP)', 'Other'];
const DONOR_TYPES = ['Individual', 'Corporate', 'Faith Community', 'Foundation', 'Government', 'Other'];
const GIFT_KINDS = ['Goods', 'Services - Specialized', 'Services - General', 'Facility/Space Use'];
const VALUATION_METHODS = ['Donor-provided receipt', 'Comparable sales', 'FMV benchmark/library', 'Professional appraisal', 'Published rate', 'Other'];

const EMPTY_FORM = {
  gift_id: '', date_received: '', donor_name: '', donor_type: '', donor_email: '', donor_phone: '',
  donor_address: '', gift_kind: '', item_description: '', category: '', quantity: '', unit: '',
  fmv_per_unit: '', total_fmv: '', valuation_method: '', valuation_notes: '', is_restricted: false,
  restriction_description: '', program_project: '', acknowledgment_required: false, form_8283_required: '',
  acknowledgment_sent_date: '', recurring_gift_id: '', documentation_filed: '', gaap_category: '', notes: ''
};

export default function InKindDonationsLog({ donations, recurring, onRefresh, userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const nextGiftId = `IK-${String(donations.length + 1).padStart(3, '0')}`;

  const filtered = donations.filter(d =>
    (d.donor_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.item_description || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (donation = null) => {
    if (donation) {
      setForm({ ...EMPTY_FORM, ...donation });
      setEditingId(donation.id);
    } else {
      setForm({ ...EMPTY_FORM, gift_id: nextGiftId });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.donor_name || !form.date_received || !form.gift_kind || !form.item_description || !form.total_fmv) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    const data = { ...form, total_fmv: parseFloat(form.total_fmv) || 0, fmv_per_unit: parseFloat(form.fmv_per_unit) || 0, quantity: parseFloat(form.quantity) || 0 };
    if (editingId) {
      await base44.entities.InKindDonation.update(editingId, data);
      toast.success('Gift updated');
    } else {
      await base44.entities.InKindDonation.create(data);
      toast.success('Gift logged');
    }
    setSaving(false);
    setShowForm(false);
    onRefresh();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this gift record?')) return;
    await base44.entities.InKindDonation.delete(id);
    toast.success('Deleted');
    onRefresh();
  };

  const exportCSV = () => {
    const headers = ['Gift ID','Date','Donor','Type','Description','Category','Qty','Unit','FMV/Unit','Total FMV','Valuation Method','Restricted?','Program','Ack Required?','Ack Sent','GAAP Category','Notes'];
    const rows = donations.map(d => [
      d.gift_id, d.date_received, d.donor_name, d.donor_type, d.item_description, d.category,
      d.quantity, d.unit, d.fmv_per_unit, d.total_fmv, d.valuation_method,
      d.is_restricted ? 'Yes' : 'No', d.program_project,
      d.acknowledgment_required ? 'Yes' : 'No', d.acknowledgment_sent_date || '',
      d.gaap_category, d.notes
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `inkind-donations-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success('Exported');
  };

  const f = form;
  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#143A50]">In-Kind Donations Log</h2>
          <p className="text-sm text-slate-500">Every individual non-cash gift. Goods are donor-deductible at FMV; specialized services count as GAAP revenue.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={donations.length === 0}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
          <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58]" onClick={() => handleOpen()}>
            <Plus className="w-4 h-4 mr-1" /> Log Gift
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search by donor, description, or category..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-slate-500">
          No gifts logged yet. Click "Log Gift" to add your first in-kind contribution.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 uppercase tracking-wide">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Donor</div>
            <div className="col-span-3">Item / Description</div>
            <div className="col-span-2">Total FMV</div>
            <div className="col-span-1">Actions</div>
          </div>
          {filtered.map(d => (
            <Card key={d.id} className="overflow-hidden">
              <div
                className="grid grid-cols-2 md:grid-cols-12 gap-2 px-4 py-3 cursor-pointer hover:bg-slate-50 items-center"
                onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
              >
                <div className="col-span-1 text-xs font-mono text-slate-500">{d.gift_id || '—'}</div>
                <div className="col-span-2 text-sm text-slate-600">{d.date_received}</div>
                <div className="col-span-3">
                  <p className="font-medium text-sm text-slate-900 truncate">{d.donor_name}</p>
                  <Badge variant="outline" className="text-xs mt-0.5">{d.donor_type}</Badge>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-slate-700 truncate">{d.item_description}</p>
                  <Badge variant="secondary" className="text-xs mt-0.5">{d.category}</Badge>
                </div>
                <div className="col-span-2">
                  <p className="font-bold text-emerald-700">${(d.total_fmv || 0).toLocaleString()}</p>
                  {d.acknowledgment_required && !d.acknowledgment_sent_date && (
                    <Badge className="bg-red-100 text-red-700 text-xs mt-0.5">Ack Pending</Badge>
                  )}
                </div>
                <div className="col-span-1 flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleOpen(d); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleDelete(d.id); }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                  {expandedId === d.id ? <ChevronUp className="w-4 h-4 text-slate-400 self-center" /> : <ChevronDown className="w-4 h-4 text-slate-400 self-center" />}
                </div>
              </div>
              {expandedId === d.id && (
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-xs text-slate-400">Gift Kind</p><p>{d.gift_kind}</p></div>
                  <div><p className="text-xs text-slate-400">Qty / Unit</p><p>{d.quantity} {d.unit}</p></div>
                  <div><p className="text-xs text-slate-400">FMV/Unit</p><p>${d.fmv_per_unit}</p></div>
                  <div><p className="text-xs text-slate-400">Valuation Method</p><p>{d.valuation_method}</p></div>
                  <div><p className="text-xs text-slate-400">Restricted?</p><p>{d.is_restricted ? 'Yes' : 'No'} {d.restriction_description && `— ${d.restriction_description}`}</p></div>
                  <div><p className="text-xs text-slate-400">Program/Project</p><p>{d.program_project || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">GAAP Category</p><p>{d.gaap_category || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Recurring ID</p><p>{d.recurring_gift_id || '—'}</p></div>
                  {d.valuation_notes && <div className="col-span-2"><p className="text-xs text-slate-400">Valuation Notes</p><p>{d.valuation_notes}</p></div>}
                  {d.notes && <div className="col-span-2"><p className="text-xs text-slate-400">Notes</p><p>{d.notes}</p></div>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Gift' : 'Log New In-Kind Gift'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Section: Donor Info */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-3 pb-1 border-b">Donor Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Gift ID</Label><Input value={f.gift_id} onChange={e => setF('gift_id', e.target.value)} placeholder="IK-001" /></div>
                <div><Label>Date Received *</Label><Input type="date" value={f.date_received} onChange={e => setF('date_received', e.target.value)} /></div>
                <div><Label>Donor Name *</Label><Input value={f.donor_name} onChange={e => setF('donor_name', e.target.value)} /></div>
                <div><Label>Donor Type</Label>
                  <Select value={f.donor_type} onValueChange={v => setF('donor_type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{DONOR_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Donor Email</Label><Input value={f.donor_email} onChange={e => setF('donor_email', e.target.value)} /></div>
                <div><Label>Donor Phone</Label><Input value={f.donor_phone} onChange={e => setF('donor_phone', e.target.value)} /></div>
                <div className="col-span-2"><Label>Donor Address</Label><Input value={f.donor_address} onChange={e => setF('donor_address', e.target.value)} /></div>
              </div>
            </div>

            {/* Section: Gift Details */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-3 pb-1 border-b">Gift Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Goods or Services? *</Label>
                  <Select value={f.gift_kind} onValueChange={v => setF('gift_kind', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{GIFT_KINDS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Category</Label>
                  <Select value={f.category} onValueChange={v => setF('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2"><Label>Item / Service Description *</Label><Textarea rows={2} value={f.item_description} onChange={e => setF('item_description', e.target.value)} /></div>
                <div><Label>Quantity</Label><Input type="number" value={f.quantity} onChange={e => setF('quantity', e.target.value)} /></div>
                <div><Label>Unit (e.g. hours, items, lbs)</Label><Input value={f.unit} onChange={e => setF('unit', e.target.value)} /></div>
                <div><Label>FMV per Unit ($)</Label><Input type="number" value={f.fmv_per_unit} onChange={e => setF('fmv_per_unit', e.target.value)} /></div>
                <div><Label>Total FMV ($) *</Label><Input type="number" value={f.total_fmv} onChange={e => setF('total_fmv', e.target.value)} /></div>
              </div>
            </div>

            {/* Section: Valuation */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-3 pb-1 border-b">Valuation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Valuation Method</Label>
                  <Select value={f.valuation_method} onValueChange={v => setF('valuation_method', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{VALUATION_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>GAAP Category</Label>
                  <Select value={f.gaap_category} onValueChange={v => setF('gaap_category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{GAAP_CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2"><Label>Valuation Notes / Source</Label><Textarea rows={2} value={f.valuation_notes} onChange={e => setF('valuation_notes', e.target.value)} placeholder="e.g. Local YMCA gym rate $75/hr, documented Jan 2026" /></div>
              </div>
            </div>

            {/* Section: Compliance */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-3 pb-1 border-b">Compliance & Acknowledgment</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 py-2">
                  <Switch checked={f.acknowledgment_required} onCheckedChange={v => setF('acknowledgment_required', v)} />
                  <Label>Acknowledgment Required? (gifts $250+)</Label>
                </div>
                <div><Label>Acknowledgment Sent Date</Label><Input type="date" value={f.acknowledgment_sent_date} onChange={e => setF('acknowledgment_sent_date', e.target.value)} /></div>
                <div><Label>Form 8283 Required?</Label><Input value={f.form_8283_required} onChange={e => setF('form_8283_required', e.target.value)} placeholder="e.g. Section A (donor files)" /></div>
                <div className="flex items-center gap-3 py-2">
                  <Switch checked={f.is_restricted} onCheckedChange={v => setF('is_restricted', v)} />
                  <Label>Restricted Use?</Label>
                </div>
                {f.is_restricted && <div className="col-span-2"><Label>Restriction Description</Label><Input value={f.restriction_description} onChange={e => setF('restriction_description', e.target.value)} /></div>}
              </div>
            </div>

            {/* Section: Other */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-3 pb-1 border-b">Program & Documentation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Program / Project</Label><Input value={f.program_project} onChange={e => setF('program_project', e.target.value)} /></div>
                <div><Label>Linked Recurring Gift ID</Label>
                  <Select value={f.recurring_gift_id} onValueChange={v => setF('recurring_gift_id', v)}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {(recurring || []).map(r => <SelectItem key={r.id} value={r.recurring_id || r.id}>{r.recurring_id} — {r.donor_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Documentation Filed</Label><Input value={f.documentation_filed} onChange={e => setF('documentation_filed', e.target.value)} placeholder="e.g. Yes — photos in Drive /InKind/2026/" /></div>
                <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={f.notes} onChange={e => setF('notes', e.target.value)} /></div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Log Gift'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}