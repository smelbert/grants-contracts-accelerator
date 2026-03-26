import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC'
];

const SOURCES = [
  { value: 'federal', label: 'Federal' },
  { value: 'state', label: 'State' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'international', label: 'International' },
];

const ORG_TYPES = [
  { value: 'Nonprofit', label: 'Nonprofit' },
  { value: 'Small Business', label: 'Small Business' },
  { value: 'University', label: 'University' },
  { value: 'Tribal', label: 'Tribal Organization' },
  { value: 'Government', label: 'Government' },
];

export default function GrantSearchForm({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('');
  const [source, setSource] = useState('');
  const [orgType, setOrgType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 3) return;
    onSearch({
      query: query.trim(),
      state: state || undefined,
      source: source || undefined,
      org_type: orgType || undefined,
      limit: 15,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you're looking for... e.g. 'grants for women-led nonprofits in Ohio'"
          className="pl-12 h-14 text-base rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-[#143A50]/20"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_states">All States</SelectItem>
            {US_STATES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder="Source Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_sources">All Sources</SelectItem>
            {SOURCES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={orgType} onValueChange={setOrgType}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Organization Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_orgs">All Types</SelectItem>
            {ORG_TYPES.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="submit"
          disabled={isLoading || !query.trim() || query.trim().length < 3}
          className="bg-[#143A50] hover:bg-[#1E4F58] text-white px-6 h-10"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Discover Grants
            </>
          )}
        </Button>
      </div>
    </form>
  );
}