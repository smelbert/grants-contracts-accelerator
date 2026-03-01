import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';

const FIELD_LABELS = {
  submission_date: 'Submission Date',
  cohort: 'Cohort / Group',
  participation_plan: 'Participation Plan',
  attend_in_person: 'In-Person Attendance',
  interested_in_consultation: '1:1 Consultation Interest',
  documents_needed: 'Documents Still Needed',
  funding_barrier: 'Primary Funding Barrier',
  existing_items: 'Items Already Have',
  goals: 'Program Goals',
  org_type: 'Organization Type',
  years_in_business: 'Years in Business',
  annual_revenue: 'Annual Revenue / Budget',
  employees: 'Number of Employees',
  grant_experience: 'Grant Experience',
  how_heard: 'How They Heard About Program',
};

// Fields that are useful for training prep — highlighted
const TRAINING_FIELDS = ['funding_barrier', 'documents_needed', 'existing_items', 'goals', 'grant_experience', 'interested_in_consultation'];

export default function JotFormProfile({ enrollment }) {
  const data = enrollment?.jotform_data;

  // Also try to parse from enrollment_notes if jotform_data not yet populated
  const hasJotformData = data && Object.values(data).some(v => v);

  if (!hasJotformData) {
    // Fallback: show enrollment_notes in a simple format
    if (!enrollment?.enrollment_notes) return null;
    return (
      <Card className="border border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
            <ClipboardList className="w-4 h-4" />
            Registration Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{enrollment.enrollment_notes}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
          <ClipboardList className="w-4 h-4" />
          JotForm Registration Profile
          <Badge className="ml-auto text-xs" style={{ backgroundColor: BRAND_COLORS.eisGold, color: '#333' }}>
            Training Intel
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(FIELD_LABELS).map(([key, label]) => {
            const value = data[key];
            if (!value) return null;
            const isTraining = TRAINING_FIELDS.includes(key);
            return (
              <div
                key={key}
                className={`p-3 rounded-lg border text-sm ${isTraining ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}
              >
                <p className={`text-xs font-semibold mb-1 ${isTraining ? 'text-amber-700' : 'text-slate-500'}`}>
                  {label}
                  {isTraining && <span className="ml-1 text-amber-500">★</span>}
                </p>
                <p className="text-slate-800">{value}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">★ Highlighted fields are key training preparation data</p>
      </CardContent>
    </Card>
  );
}