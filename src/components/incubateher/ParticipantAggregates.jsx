import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

function parseNotes(notes) {
  if (!notes) return {};
  const result = {};
  notes.split(' | ').forEach(part => {
    const colonIdx = part.indexOf(': ');
    if (colonIdx > -1) {
      const key = part.substring(0, colonIdx).trim();
      const val = part.substring(colonIdx + 2).trim();
      result[key] = val;
    }
  });
  return result;
}

function countBy(enrollments, extractor) {
  const counts = {};
  enrollments.forEach(e => {
    const val = extractor(e) || 'Unknown';
    counts[val] = (counts[val] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

const COLORS = [
  BRAND_COLORS.eisNavy,
  BRAND_COLORS.culRed,
  BRAND_COLORS.eisGold,
  BRAND_COLORS.eisTeal,
  '#A65D40',
  '#6B8E9F',
  '#8B5E83',
];

function AggregateChart({ title, data, onFilter, activeFilter }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(p => !p)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold" style={{ color: BRAND_COLORS.eisNavy }}>{title}</CardTitle>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {data.map((item, i) => (
              <button
                key={item.name}
                onClick={() => onFilter(activeFilter === item.name ? null : item.name)}
                className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 transition-colors ${activeFilter === item.name ? 'ring-2 ring-offset-1' : ''}`}
                style={activeFilter === item.name ? { ringColor: BRAND_COLORS.eisNavy } : {}}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs flex-1 truncate text-slate-700">{item.name}</span>
                <Badge
                  className="text-xs ml-auto"
                  style={{ backgroundColor: activeFilter === item.name ? BRAND_COLORS.eisNavy : '#e2e8f0', color: activeFilter === item.name ? 'white' : '#475569' }}
                >
                  {item.count}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ParticipantAggregates({ enrollments, onFilter, activeFilters, onClearFilters }) {
  const parsed = enrollments.map(e => ({
    ...e,
    _notes: parseNotes(e.enrollment_notes)
  }));

  const groups = [
    {
      key: 'in_person',
      title: 'In-Person Attendance',
      data: countBy(parsed, e => {
        const v = e._notes['In-Person'] || '';
        if (v.toLowerCase().includes('yes')) return 'Yes';
        if (v.toLowerCase().includes('no')) return 'No';
        return 'Unknown';
      }),
      extractor: e => {
        const v = (parseNotes(e.enrollment_notes)['In-Person'] || '');
        if (v.toLowerCase().includes('yes')) return 'Yes';
        if (v.toLowerCase().includes('no')) return 'No';
        return 'Unknown';
      }
    },
    {
      key: 'consultation',
      title: 'Consultation Interest',
      data: countBy(parsed, e => {
        const v = e._notes['Consultation Interest'] || '';
        if (v.toLowerCase().startsWith('yes')) return 'Interested';
        if (v.toLowerCase().startsWith('no')) return 'Not Interested';
        return v || 'Unknown';
      }),
      extractor: e => {
        const v = (parseNotes(e.enrollment_notes)['Consultation Interest'] || '');
        if (v.toLowerCase().startsWith('yes')) return 'Interested';
        if (v.toLowerCase().startsWith('no')) return 'Not Interested';
        return v || 'Unknown';
      }
    },
    {
      key: 'funding_barrier',
      title: 'Funding Barrier',
      data: countBy(parsed, e => e._notes['Funding Barrier'] || 'Unknown'),
      extractor: e => parseNotes(e.enrollment_notes)['Funding Barrier'] || 'Unknown'
    },
    {
      key: 'program_status',
      title: 'Program Completion Status',
      data: countBy(parsed, e => e.program_completed ? 'Completed' : e.pre_assessment_completed ? 'In Progress' : 'Not Started'),
      extractor: e => e.program_completed ? 'Completed' : e.pre_assessment_completed ? 'In Progress' : 'Not Started'
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Participant Breakdown — {enrollments.length} total
        </h2>
        {Object.values(activeFilters).some(Boolean) && (
          <button
            onClick={onClearFilters}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            Clear all filters
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {groups.map(group => (
          <AggregateChart
            key={group.key}
            title={group.title}
            data={group.data}
            activeFilter={activeFilters[group.key]}
            onFilter={(val) => onFilter(group.key, val, group.extractor)}
          />
        ))}
      </div>
    </div>
  );
}