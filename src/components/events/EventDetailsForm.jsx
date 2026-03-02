import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Clock, User, FileText } from 'lucide-react';

/**
 * Editors for Agenda, Speakers, and Materials fields
 * Props: formData, setFormData
 */
export default function EventDetailsForm({ formData, setFormData }) {
  const [newAgenda, setNewAgenda] = useState({ time: '', title: '', description: '' });
  const [newSpeaker, setNewSpeaker] = useState({ name: '', title: '', bio: '', photo_url: '' });
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '' });

  const addAgenda = () => {
    if (!newAgenda.title.trim()) return;
    setFormData({ ...formData, agenda: [...(formData.agenda || []), newAgenda] });
    setNewAgenda({ time: '', title: '', description: '' });
  };

  const removeAgenda = (i) => setFormData({ ...formData, agenda: formData.agenda.filter((_, idx) => idx !== i) });

  const addSpeaker = () => {
    if (!newSpeaker.name.trim()) return;
    setFormData({ ...formData, speakers: [...(formData.speakers || []), newSpeaker] });
    setNewSpeaker({ name: '', title: '', bio: '', photo_url: '' });
  };

  const removeSpeaker = (i) => setFormData({ ...formData, speakers: formData.speakers.filter((_, idx) => idx !== i) });

  const addMaterial = () => {
    if (!newMaterial.title.trim() || !newMaterial.url.trim()) return;
    setFormData({ ...formData, materials: [...(formData.materials || []), newMaterial] });
    setNewMaterial({ title: '', url: '' });
  };

  const removeMaterial = (i) => setFormData({ ...formData, materials: formData.materials.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-8">
      {/* Agenda */}
      <div>
        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4" /> Agenda
        </Label>
        {(formData.agenda || []).map((item, i) => (
          <div key={i} className="flex items-start gap-2 mb-2 p-3 bg-slate-50 rounded-lg">
            {item.time && <span className="text-xs font-mono text-slate-500 pt-0.5 w-16 flex-shrink-0">{item.time}</span>}
            <div className="flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeAgenda(i)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
          </div>
        ))}
        <div className="grid grid-cols-12 gap-2 mt-2">
          <Input className="col-span-2" placeholder="Time" value={newAgenda.time}
            onChange={e => setNewAgenda({ ...newAgenda, time: e.target.value })} />
          <Input className="col-span-4" placeholder="Agenda item title" value={newAgenda.title}
            onChange={e => setNewAgenda({ ...newAgenda, title: e.target.value })} />
          <Input className="col-span-4" placeholder="Description (optional)" value={newAgenda.description}
            onChange={e => setNewAgenda({ ...newAgenda, description: e.target.value })} />
          <Button className="col-span-2 bg-[#143A50] hover:bg-[#1E4F58]" onClick={addAgenda}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
      </div>

      {/* Speakers */}
      <div>
        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
          <User className="w-4 h-4" /> Speakers
        </Label>
        {(formData.speakers || []).map((s, i) => (
          <div key={i} className="flex items-start gap-2 mb-2 p-3 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium">{s.name}{s.title ? ` – ${s.title}` : ''}</p>
              {s.bio && <p className="text-xs text-slate-500 mt-0.5">{s.bio}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeSpeaker(i)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
          </div>
        ))}
        <Card className="mt-2 border-dashed">
          <CardContent className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Name" value={newSpeaker.name} onChange={e => setNewSpeaker({ ...newSpeaker, name: e.target.value })} />
              <Input placeholder="Title / Role" value={newSpeaker.title} onChange={e => setNewSpeaker({ ...newSpeaker, title: e.target.value })} />
            </div>
            <Textarea placeholder="Bio" rows={2} value={newSpeaker.bio} onChange={e => setNewSpeaker({ ...newSpeaker, bio: e.target.value })} />
            <Input placeholder="Photo URL (optional)" value={newSpeaker.photo_url} onChange={e => setNewSpeaker({ ...newSpeaker, photo_url: e.target.value })} />
            <Button className="w-full bg-[#143A50] hover:bg-[#1E4F58]" onClick={addSpeaker}><Plus className="w-4 h-4 mr-1" /> Add Speaker</Button>
          </CardContent>
        </Card>
      </div>

      {/* Materials */}
      <div>
        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4" /> Presentation Materials
        </Label>
        {(formData.materials || []).map((m, i) => (
          <div key={i} className="flex items-center gap-2 mb-2 p-3 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium">{m.title}</p>
              <p className="text-xs text-slate-500 truncate">{m.url}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeMaterial(i)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
          </div>
        ))}
        <div className="grid grid-cols-12 gap-2 mt-2">
          <Input className="col-span-4" placeholder="Material title" value={newMaterial.title}
            onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })} />
          <Input className="col-span-6" placeholder="URL" value={newMaterial.url}
            onChange={e => setNewMaterial({ ...newMaterial, url: e.target.value })} />
          <Button className="col-span-2 bg-[#143A50] hover:bg-[#1E4F58]" onClick={addMaterial}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
      </div>
    </div>
  );
}