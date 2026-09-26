import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Lock, Loader2 } from 'lucide-react';
import { STRUCTURES, LEVEL_NAMES } from '@/lib/assessmentConfig';

const ALL_STRUCTURES = Object.keys(STRUCTURES);

export default function AssessmentItemsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.AssessmentItem.list('sort_order', 200);
      setItems(data);
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const handleSave = async (item) => {
    if (item.id) {
      await base44.entities.AssessmentItem.update(item.id, item);
    } else {
      await base44.entities.AssessmentItem.create(item);
    }
    setEditing(null);
    setShowAdd(false);
    loadItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await base44.entities.AssessmentItem.delete(id);
    loadItems();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#143A50]" />
      </div>
    );
  }

  const grantItems = items.filter(i => i.track === 'grant');
  const proposalItems = items.filter(i => i.track === 'proposal');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-[#143A50]">Assessment Items</h1>
          <p className="text-sm text-slate-500 mt-1">{items.length} items across both tracks. Edit text, points, gate status, and structure applicability.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-[#143A50] hover:bg-[#1E4F58] text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {['grant', 'proposal'].map(trackKey => {
        const trackItems = trackKey === 'grant' ? grantItems : proposalItems;
        const trackLabel = trackKey === 'grant' ? 'Grant Funding' : 'Proposals & Contracts';
        return (
          <div key={trackKey} className="mb-8">
            <h2 className="text-lg font-serif text-[#143A50] mb-3 pb-2 border-b border-slate-200">{trackLabel}</h2>
            {[1, 2, 3].map(level => {
              const levelItems = trackItems.filter(i => i.level === level).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
              return (
                <div key={level} className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Level {level} · {LEVEL_NAMES[trackKey]?.[level]}</h3>
                  <div className="space-y-1.5">
                    {levelItems.map(item => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-[#E5C089] transition-all">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-slate-800">{item.text}</span>
                            {item.is_gate && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#E5C089]/20 text-[#7E5F22]"><Lock className="w-2.5 h-2.5" /> gate</span>
                            )}
                            <span className="text-xs text-slate-400">{item.points}pt{item.points > 1 ? 's' : ''}</span>
                          </div>
                          {(item.na_structures?.length > 0 || item.applies_to?.length > 0) && (
                            <p className="text-xs text-slate-400 mt-1">
                              {item.applies_to?.length > 0
                                ? `Applies to: ${item.applies_to.map(s => STRUCTURES[s]).join(', ')}`
                                : `Excludes: ${item.na_structures.map(s => STRUCTURES[s]).join(', ')}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => setEditing(item)} className="h-8 w-8">
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8">
                            <Trash2 className="w-3.5 h-3.5 text-[#AC1A5B]" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {(editing || showAdd) && (
        <ItemEditor
          item={editing}
          onSave={handleSave}
          onClose={() => { setEditing(null); setShowAdd(false); }}
        />
      )}
    </div>
  );
}

function ItemEditor({ item, onSave, onClose }) {
  const [form, setForm] = useState(item || { track: 'grant', level: 1, text: '', points: 1, is_gate: false, level_name: '', item_index: 1, sort_order: 101 });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleStructure = (struct, field) => {
    const current = form[field] || [];
    set(field, current.includes(struct) ? current.filter(s => s !== struct) : [...current, struct]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#143A50]">{item ? 'Edit Item' : 'Add Item'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Track</Label>
              <Select value={form.track} onValueChange={v => set('track', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grant">Grant</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={String(form.level)} onValueChange={v => set('level', Number(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Item Text</Label>
            <Input value={form.text} onChange={e => set('text', e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Points</Label>
              <Select value={String(form.points)} onValueChange={v => set('points', Number(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (regular)</SelectItem>
                  <SelectItem value="2">2 (gate weight)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order || 0} onChange={e => set('sort_order', Number(e.target.value))} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={form.is_gate || false} onCheckedChange={v => set('is_gate', v)} />
            <Label className="text-sm cursor-pointer" onClick={() => set('is_gate', !form.is_gate)}>Gate item (weighted double, shown in "Fix first")</Label>
          </div>
          <div>
            <Label>Level Name</Label>
            <Input value={form.level_name || ''} onChange={e => set('level_name', e.target.value)} className="mt-1" placeholder={LEVEL_NAMES[form.track]?.[form.level] || ''} />
          </div>
          <div>
            <Label className="text-sm">Does NOT apply to (na_structures)</Label>
            <p className="text-xs text-slate-500 mb-2">Item will be hidden for these structures. Leave both lists empty to apply to all.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_STRUCTURES.map(s => (
                <label key={s} className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={(form.na_structures || []).includes(s)} onCheckedChange={() => toggleStructure(s, 'na_structures')} />
                  {STRUCTURES[s]}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm">Applies ONLY to (applies_to)</Label>
            <p className="text-xs text-slate-500 mb-2">If populated, item only shows for these structures. Overrides na_structures.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_STRUCTURES.map(s => (
                <label key={s} className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={(form.applies_to || []).includes(s)} onCheckedChange={() => toggleStructure(s, 'applies_to')} />
                  {STRUCTURES[s]}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.text} className="bg-[#143A50] hover:bg-[#1E4F58] text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}