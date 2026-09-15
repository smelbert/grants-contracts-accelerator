import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Plus, Pencil, Trash2, X, Save, Palette, BookOpen,
} from 'lucide-react';

const EMPTY_COHORT = {
  program_name: '',
  program_code: '',
  funder_organization: '',
  delivery_organization: '',
  description: '',
  learning_outcomes: [],
  program_type: 'cohort_based',
  is_active: true,
  brand_config: {
    primary_color: '#143A50',
    secondary_color: '#1E4F58',
    accent_color: '#E5C089',
    logo_url: '',
    header_title: '',
    header_subtitle: '',
    footer_text: '',
  },
  curriculum_topics: [],
};

export default function ProgramCohortManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // null | 'new' | cohort object
  const [form, setForm] = useState(EMPTY_COHORT);
  const [saving, setSaving] = useState(false);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [topicInput, setTopicInput] = useState({ id: '', label: '', description: '' });

  const { data: cohorts = [], isLoading } = useQuery({
    queryKey: ['all-cohorts-admin'],
    queryFn: () => base44.entities.ProgramCohort.list(),
  });

  const startNew = () => {
    setForm(EMPTY_COHORT);
    setEditing('new');
  };

  const startEdit = (c) => {
    setForm({
      ...EMPTY_COHORT,
      ...c,
      brand_config: { ...EMPTY_COHORT.brand_config, ...(c.brand_config || {}) },
      curriculum_topics: c.curriculum_topics || [],
      learning_outcomes: c.learning_outcomes || [],
    });
    setEditing(c);
  };

  const cancel = () => {
    setEditing(null);
    setForm(EMPTY_COHORT);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await base44.entities.ProgramCohort.create(form);
      } else {
        await base44.entities.ProgramCohort.update(editing.id, form);
      }
      qc.invalidateQueries({ queryKey: ['all-cohorts-admin'] });
      qc.invalidateQueries({ queryKey: ['all-active-cohorts'] });
      cancel();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete program "${c.program_name}"? This cannot be undone.`)) return;
    await base44.entities.ProgramCohort.delete(c.id);
    qc.invalidateQueries({ queryKey: ['all-cohorts-admin'] });
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setBrand = (k, v) => setForm((f) => ({ ...f, brand_config: { ...f.brand_config, [k]: v } }));

  const addOutcome = () => {
    if (!outcomeInput.trim()) return;
    setForm((f) => ({ ...f, learning_outcomes: [...f.learning_outcomes, outcomeInput.trim()] }));
    setOutcomeInput('');
  };
  const removeOutcome = (i) =>
    setForm((f) => ({ ...f, learning_outcomes: f.learning_outcomes.filter((_, idx) => idx !== i) }));

  const addTopic = () => {
    if (!topicInput.id.trim() || !topicInput.label.trim()) return;
    setForm((f) => ({
      ...f,
      curriculum_topics: [
        ...f.curriculum_topics,
        {
          id: topicInput.id.trim(),
          label: topicInput.label.trim(),
          description: topicInput.description.trim(),
          order: f.curriculum_topics.length,
        },
      ],
    }));
    setTopicInput({ id: '', label: '', description: '' });
  };
  const removeTopic = (i) =>
    setForm((f) => ({ ...f, curriculum_topics: f.curriculum_topics.filter((_, idx) => idx !== i) }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Program Cohorts</h1>
          <p className="text-sm text-slate-500">
            Create and manage funding-readiness programs for any partner or audience.
          </p>
        </div>
        {!editing && (
          <Button onClick={startNew}>
            <Plus className="w-4 h-4 mr-2" /> New Program
          </Button>
        )}
      </div>

      {editing ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing === 'new' ? 'Create Program' : `Edit: ${editing.program_name}`}
              </h2>
              <Button variant="ghost" size="sm" onClick={cancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Basics */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Program Name *</Label>
                <Input value={form.program_name} onChange={(e) => setField('program_name', e.target.value)} />
              </div>
              <div>
                <Label>
                  Program Code * <span className="text-xs text-slate-400">(unique, e.g. faith_based_2026)</span>
                </Label>
                <Input value={form.program_code} onChange={(e) => setField('program_code', e.target.value)} />
              </div>
              <div>
                <Label>Funder Organization *</Label>
                <Input
                  value={form.funder_organization}
                  onChange={(e) => setField('funder_organization', e.target.value)}
                />
              </div>
              <div>
                <Label>Delivery Organization *</Label>
                <Input
                  value={form.delivery_organization}
                  onChange={(e) => setField('delivery_organization', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div>
                <Label>Program Type</Label>
                <select
                  value={form.program_type}
                  onChange={(e) => setField('program_type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="cohort_based">Cohort-based (scheduled)</option>
                  <option value="self_paced">Self-paced</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_active} onCheckedChange={(v) => setField('is_active', v)} />
                <Label className="font-normal">Active</Label>
              </div>
            </div>

            {/* Learning outcomes */}
            <div>
              <Label>Learning Outcomes</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={outcomeInput}
                  onChange={(e) => setOutcomeInput(e.target.value)}
                  placeholder="Add an outcome..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOutcome();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addOutcome}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <ul className="space-y-1">
                {form.learning_outcomes.map((o, i) => (
                  <li key={i} className="flex items-center justify-between bg-slate-50 rounded px-3 py-2 text-sm">
                    <span>{o}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeOutcome(i)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Curriculum topics */}
            <div>
              <Label className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Curriculum Topics
              </Label>
              <p className="text-xs text-slate-500 mb-2">
                Define the topics courses are organized by (e.g. "Legal Structure", "Financial Systems").
              </p>
              <div className="grid md:grid-cols-3 gap-2 mb-2">
                <Input
                  value={topicInput.id}
                  onChange={(e) => setTopicInput((t) => ({ ...t, id: e.target.value }))}
                  placeholder="id (e.g. legal)"
                />
                <Input
                  value={topicInput.label}
                  onChange={(e) => setTopicInput((t) => ({ ...t, label: e.target.value }))}
                  placeholder="Label (e.g. Legal Structure)"
                />
                <div className="flex gap-2">
                  <Input
                    value={topicInput.description}
                    onChange={(e) => setTopicInput((t) => ({ ...t, description: e.target.value }))}
                    placeholder="Description (optional)"
                  />
                  <Button type="button" variant="outline" onClick={addTopic}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <ul className="space-y-1">
                {form.curriculum_topics.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-slate-50 rounded px-3 py-2 text-sm"
                  >
                    <span>
                      <Badge variant="outline" className="mr-2 text-xs">
                        {t.id}
                      </Badge>
                      {t.label}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeTopic(i)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Branding */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4" /> Branding
              </Label>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Primary Color</Label>
                  <Input
                    type="color"
                    value={form.brand_config.primary_color}
                    onChange={(e) => setBrand('primary_color', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Accent Color</Label>
                  <Input
                    type="color"
                    value={form.brand_config.accent_color}
                    onChange={(e) => setBrand('accent_color', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Secondary Color</Label>
                  <Input
                    type="color"
                    value={form.brand_config.secondary_color}
                    onChange={(e) => setBrand('secondary_color', e.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <Label className="text-xs">Logo URL</Label>
                  <Input
                    value={form.brand_config.logo_url}
                    onChange={(e) => setBrand('logo_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-xs">Header Title</Label>
                  <Input
                    value={form.brand_config.header_title}
                    onChange={(e) => setBrand('header_title', e.target.value)}
                    placeholder="(uses program name if empty)"
                  />
                </div>
                <div>
                  <Label className="text-xs">Header Subtitle</Label>
                  <Input
                    value={form.brand_config.header_subtitle}
                    onChange={(e) => setBrand('header_subtitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Footer Text</Label>
                  <Input
                    value={form.brand_config.footer_text}
                    onChange={(e) => setBrand('footer_text', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={cancel}>
                Cancel
              </Button>
              <Button
                onClick={save}
                disabled={saving || !form.program_name || !form.program_code}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Program'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-200 rounded-xl animate-pulse" />)
          ) : cohorts.length === 0 ? (
            <Card className="md:col-span-3">
              <CardContent className="py-12 text-center text-slate-500">
                No programs yet. Click "New Program" to create one.
              </CardContent>
            </Card>
          ) : (
            cohorts.map((c) => (
              <Card key={c.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{c.program_name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {c.program_type === 'self_paced' ? 'Self-Paced' : 'Cohort'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-1 font-mono">{c.program_code}</p>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {c.description || 'No description.'}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {c.funder_organization}
                    </Badge>
                    {c.is_active ? (
                      <Badge className="text-xs bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(c)} className="text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}