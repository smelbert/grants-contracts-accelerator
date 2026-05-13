import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, BookmarkPlus, Bookmark, ChevronDown } from 'lucide-react';

const DOC_TYPES = ['governance', 'finance', 'proposal', 'contract', 'narrative', 'budget', 'other'];
const DOC_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted_for_review', label: 'Submitted' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'needs_revision', label: 'Needs Revision' },
  { value: 'archived', label: 'Archived' },
];

const STORAGE_KEY = 'doc_filter_presets';

function loadPresets() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function savePresets(presets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export default function DocumentSearchBar({ filters, onChange }) {
  const [presets, setPresets] = useState(loadPresets);
  const [presetName, setPresetName] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);
  const [open, setOpen] = useState(false);

  const hasActiveFilters = filters.keyword || filters.type || filters.status || filters.reviewer;

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const clear = () => onChange({ keyword: '', type: '', status: '', reviewer: '' });

  const activeCount = [filters.type, filters.status, filters.reviewer].filter(Boolean).length;

  const savePreset = () => {
    if (!presetName.trim()) return;
    const updated = [...presets, { name: presetName.trim(), filters }];
    setPresets(updated);
    savePresets(updated);
    setPresetName('');
    setShowPresetInput(false);
  };

  const applyPreset = (preset) => {
    onChange(preset.filters);
    setOpen(false);
  };

  const deletePreset = (idx, e) => {
    e.stopPropagation();
    const updated = presets.filter((_, i) => i !== idx);
    setPresets(updated);
    savePresets(updated);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm space-y-3">
      {/* Search + Filter row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Keyword search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or content…"
            value={filters.keyword}
            onChange={(e) => update('keyword', e.target.value)}
            className="pl-9"
          />
          {filters.keyword && (
            <button onClick={() => update('keyword', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 relative">
              <Filter className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#AC1A5B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {activeCount}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 space-y-4 p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Document Type</p>
              <Select value={filters.type || ''} onValueChange={(v) => update('type', v === '__all__' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All types</SelectItem>
                  {DOC_TYPES.map(t => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
              <Select value={filters.status || ''} onValueChange={(v) => update('status', v === '__all__' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All statuses</SelectItem>
                  {DOC_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reviewer Email</p>
              <Input
                placeholder="e.g. coach@example.com"
                value={filters.reviewer}
                onChange={(e) => update('reviewer', e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-1 border-t">
              <Button size="sm" variant="ghost" onClick={clear} className="flex-1">Clear all</Button>
              <Button size="sm" onClick={() => setOpen(false)} className="flex-1 bg-[#143A50] hover:bg-[#1E4F58]">Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-slate-500">Active:</span>
          {filters.keyword && (
            <Badge variant="outline" className="gap-1 text-xs">
              "{filters.keyword}"
              <button onClick={() => update('keyword', '')}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {filters.type && (
            <Badge variant="outline" className="gap-1 text-xs capitalize">
              {filters.type}
              <button onClick={() => update('type', '')}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="outline" className="gap-1 text-xs">
              {DOC_STATUSES.find(s => s.value === filters.status)?.label || filters.status}
              <button onClick={() => update('status', '')}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {filters.reviewer && (
            <Badge variant="outline" className="gap-1 text-xs">
              Reviewer: {filters.reviewer}
              <button onClick={() => update('reviewer', '')}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          <button onClick={clear} className="text-xs text-slate-400 hover:text-slate-600 ml-1 underline">Clear all</button>
        </div>
      )}

      {/* Presets row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
        <span className="text-xs text-slate-400 flex items-center gap-1"><Bookmark className="w-3 h-3" /> Presets:</span>
        {presets.map((p, idx) => (
          <Badge
            key={idx}
            variant="outline"
            className="cursor-pointer hover:bg-slate-100 gap-1 text-xs"
            onClick={() => applyPreset(p)}
          >
            {p.name}
            <button onClick={(e) => deletePreset(idx, e)} className="text-slate-400 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {hasActiveFilters && !showPresetInput && (
          <button
            onClick={() => setShowPresetInput(true)}
            className="text-xs text-[#143A50] hover:underline flex items-center gap-1"
          >
            <BookmarkPlus className="w-3.5 h-3.5" /> Save current
          </button>
        )}
        {showPresetInput && (
          <div className="flex items-center gap-1">
            <Input
              placeholder="Preset name…"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="h-7 text-xs w-32"
              onKeyDown={(e) => e.key === 'Enter' && savePreset()}
              autoFocus
            />
            <Button size="sm" onClick={savePreset} className="h-7 px-2 text-xs bg-[#143A50] hover:bg-[#1E4F58]">Save</Button>
            <button onClick={() => setShowPresetInput(false)}><X className="w-3.5 h-3.5 text-slate-400" /></button>
          </div>
        )}
      </div>
    </div>
  );
}