import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Download, Info } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = { vol_id: '', volunteer_name: '', email: '', phone: '', date: '', activity: '', program_event: '', hours: '', is_specialized: false, profession_if_specialized: '', fmv_hourly_rate: '', mileage: '', notes: '' };

export default function InKindVolunteerLog({ volunteers, onRefresh, userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const totalHours = volunteers.reduce((s, v) => s + (v.hours || 0), 0);
  const specializedHours = volunteers.filter(v => v.is_specialized).reduce((s, v) => s + (v.hours || 0), 0);
  const totalGAAP = volunteers.filter(v => v.is_specialized).reduce((s, v) => s + ((v.fmv_hourly_rate || 0) * (v.hours || 0)), 0);

  const handleOpen = (vol = null) => {
    if (vol) { setForm({ ...EMPTY, ...vol }); setEditingId(vol.id); }
    else { setForm({ ...EMPTY, vol_id: `V-${String(volunteers.length + 1).padStart(3, '0')}` }); setEditingId(null); }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.volunteer_name || !form.date || !form.activity || !form.hours) { toast.error('Fill in required fields'); return; }
    setSaving(true);
    const gaap_value = form.is_specialized ? (parseFloat(form.fmv_hourly_rate) || 0) * (parseFloat(form.hours) || 0) : 0;
    const data = { ...form, hours: parseFloat(form.hours) || 0, fmv_hourly_rate: parseFloat(form.fmv_hourly_rate) || 0, mileage: parseFloat(form.mileage) || 0, gaap_value };
    if (editingId) { await base44.entities.InKindVolunteer.update(editingId, data); toast.success('Updated'); }
    else { await base44.entities.InKindVolunteer.create(data); toast.success('Volunteer hours logged'); }
    setSaving(false); setShowForm(false); onRefresh();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    await base44.entities.InKindVolunteer.delete(id);
    toast.success('Deleted'); onRefresh();
  };

  const exportCSV = () => {
    const headers = ['Vol ID','Name','Email','Date','Activity','Program/Event','Hours','Specialized?','Profession','FMV Rate','GAAP Value','Mileage','Notes'];
    const rows = volunteers.map(v => [v.vol_id, v.volunteer_name, v.email, v.date, v.activity, v.program_event, v.hours, v.is_specialized ? 'Yes' : 'No', v.profession_if_specialized, v.fmv_hourly_rate, v.gaap_value, v.mileage, v.notes]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'volunteer-hours.csv'; a.click();
    toast.success('Exported');
  };

  const f = form;
  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#143A50]">Volunteer Hours Log</h2>
          <p className="text-sm text-slate-500">All volunteer time. Only specialized professional services count as GAAP revenue (FASB ASU 2020-07).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={volunteers.length === 0}><Download className="w-4 h-4 mr-1" /> Export</Button>
          <Button size="sm" className="bg-[#143A50] hover:bg-[#1E4F58]" onClick={() => handleOpen()}><Plus className="w-4 h-4 mr-1" /> Log Hours</Button>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>FASB ASU 2020-07 Rule:</strong> Only <em>specialized professional services</em> (e.g., lawyer, accountant, designer performing their professional skill) count as GAAP revenue. General volunteer time (coaching, setup, event help) does NOT count as GAAP revenue — but should still be tracked here for program management and impact reporting.
        </AlertDescription>
      </Alert>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-[#143A50]">{totalHours}</p>
          <p className="text-xs text-slate-500">Total Volunteer Hours</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{specializedHours}</p>
          <p className="text-xs text-slate-500">Specialized Hours (GAAP)</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">${totalGAAP.toLocaleString()}</p>
          <p className="text-xs text-slate-500">GAAP Revenue Value</p>
        </CardContent></Card>
      </div>

      {volunteers.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-slate-500">No volunteer hours logged yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 uppercase">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Activity</div>
            <div className="col-span-1">Hours</div>
            <div className="col-span-2">GAAP Value</div>
            <div className="col-span-1">Actions</div>
          </div>
          {volunteers.map(v => (
            <Card key={v.id}>
              <div className="grid grid-cols-2 md:grid-cols-12 gap-2 px-4 py-3 items-center">
                <div className="col-span-1 text-xs font-mono text-slate-400">{v.vol_id || '—'}</div>
                <div className="col-span-2 font-medium text-sm">{v.volunteer_name}</div>
                <div className="col-span-2 text-sm text-slate-600">{v.date}</div>
                <div className="col-span-3">
                  <p className="text-sm truncate">{v.activity}</p>
                  <p className="text-xs text-slate-400">{v.program_event}</p>
                </div>
                <div className="col-span-1 text-sm font-medium">{v.hours}h</div>
                <div className="col-span-2">
                  {v.is_specialized ? (
                    <Badge className="bg-blue-100 text-blue-800">${((v.fmv_hourly_rate || 0) * (v.hours || 0)).toLocaleString()} GAAP</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500">Non-GAAP</Badge>
                  )}
                </div>
                <div className="col-span-1 flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpen(v)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(v.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Volunteer Record' : 'Log Volunteer Hours'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vol ID</Label><Input value={f.vol_id} onChange={e => setF('vol_id', e.target.value)} /></div>
              <div><Label>Date *</Label><Input type="date" value={f.date} onChange={e => setF('date', e.target.value)} /></div>
              <div><Label>Volunteer Name *</Label><Input value={f.volunteer_name} onChange={e => setF('volunteer_name', e.target.value)} /></div>
              <div><Label>Email</Label><Input value={f.email} onChange={e => setF('email', e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={f.phone} onChange={e => setF('phone', e.target.value)} /></div>
              <div><Label>Hours *</Label><Input type="number" value={f.hours} onChange={e => setF('hours', e.target.value)} /></div>
              <div className="col-span-2"><Label>Activity *</Label><Input value={f.activity} onChange={e => setF('activity', e.target.value)} /></div>
              <div className="col-span-2"><Label>Program / Event</Label><Input value={f.program_event} onChange={e => setF('program_event', e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-3 py-2 bg-blue-50 rounded-lg px-3">
              <Switch checked={f.is_specialized} onCheckedChange={v => setF('is_specialized', v)} />
              <Label>Specialized Professional Service? (counts as GAAP revenue)</Label>
            </div>
            {f.is_specialized && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Profession</Label><Input value={f.profession_if_specialized} onChange={e => setF('profession_if_specialized', e.target.value)} placeholder="e.g. Attorney, CPA, Graphic Designer" /></div>
                <div><Label>FMV Hourly Rate ($)</Label><Input type="number" value={f.fmv_hourly_rate} onChange={e => setF('fmv_hourly_rate', e.target.value)} /></div>
              </div>
            )}
            <div><Label>Mileage (if claimed)</Label><Input type="number" value={f.mileage} onChange={e => setF('mileage', e.target.value)} /></div>
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