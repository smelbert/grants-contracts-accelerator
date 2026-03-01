import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Users, Lightbulb, BookOpen, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Synthesizes all JotForm registration data from enrollments into a facilitator-facing overview:
 * - Group profile summary (org types, experience, goals)
 * - Recurring themes
 * - AI synthesis + facilitator prep notes
 * - Areas of concern / things to be aware of
 */
export default function ParticipantOverviewReport({ enrollments = [] }) {
  const [synthesis, setSynthesis] = useState(null);
  const [loading, setLoading] = useState(false);

  const jotformEnrollments = enrollments.filter(e => e.jotform_data && Object.keys(e.jotform_data).length > 0);

  // --- Aggregate raw data for display ---
  const countBy = (key) => {
    const counts = {};
    jotformEnrollments.forEach(e => {
      const val = e.jotform_data?.[key];
      if (val) {
        const v = String(val).trim();
        counts[v] = (counts[v] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const orgTypes = countBy('org_type');
  const yearsInBiz = countBy('years_in_business');
  const annualRevenue = countBy('annual_revenue');
  const grantExperience = countBy('grant_experience');
  const fundingBarriers = countBy('funding_barrier');
  const existingItems = countBy('existing_items');
  const participationPlans = countBy('participation_plan');

  // Collect free-text goals
  const allGoals = jotformEnrollments
    .map(e => e.jotform_data?.goals)
    .filter(Boolean);

  const allDocumentsNeeded = jotformEnrollments
    .map(e => e.jotform_data?.documents_needed)
    .filter(Boolean);

  const generateSynthesis = async () => {
    if (jotformEnrollments.length === 0) {
      toast.error('No JotForm data available yet. Upload registration PDFs first.');
      return;
    }

    setLoading(true);
    try {
      const dataSnapshot = jotformEnrollments.map(e => ({
        name: e.participant_name,
        org: e.organization_name,
        jot: e.jotform_data
      }));

      const prompt = `You are a program facilitator preparing to teach a cohort in the IncubateHer Funding Readiness program.

Below is the aggregated registration data from ${jotformEnrollments.length} participants.

PARTICIPANT DATA:
${JSON.stringify(dataSnapshot, null, 2)}

Based on this data, provide a comprehensive facilitator preparation overview. Return a JSON object with these exact keys:

{
  "group_profile_summary": "2-3 paragraph narrative describing who this cohort is — org types, experience levels, revenue ranges, and overall readiness as a group",
  "recurring_themes": ["Theme 1 (with brief explanation)", "Theme 2", "Theme 3", "Theme 4", "Theme 5"],
  "funding_barriers_synthesis": "1-2 paragraphs synthesizing the most common barriers participants cited and what they mean for instruction",
  "goals_synthesis": "1-2 paragraphs about what participants want to achieve and how to frame the content around their goals",
  "documents_gap_analysis": "A summary of what documents participants already have vs. what they're missing — and what that means for readiness",
  "facilitator_prep_notes": ["Concrete action/note 1 for the facilitator", "Note 2", "Note 3", "Note 4", "Note 5"],
  "areas_of_concern": ["Concern 1 with brief explanation", "Concern 2", "Concern 3"],
  "instructional_recommendations": "2-3 sentences on how to adjust pacing, tone, or content based on this cohort's profile",
  "equity_considerations": "1 paragraph on equity considerations specific to this cohort based on their responses"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            group_profile_summary: { type: 'string' },
            recurring_themes: { type: 'array', items: { type: 'string' } },
            funding_barriers_synthesis: { type: 'string' },
            goals_synthesis: { type: 'string' },
            documents_gap_analysis: { type: 'string' },
            facilitator_prep_notes: { type: 'array', items: { type: 'string' } },
            areas_of_concern: { type: 'array', items: { type: 'string' } },
            instructional_recommendations: { type: 'string' },
            equity_considerations: { type: 'string' }
          }
        }
      });

      setSynthesis(result);
      toast.success('AI synthesis generated!');
    } catch (err) {
      toast.error('Failed to generate synthesis');
    } finally {
      setLoading(false);
    }
  };

  const StatRow = ({ label, items, colorClass = 'bg-slate-100 text-slate-700' }) => (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.length === 0 && <span className="text-xs text-slate-400 italic">No data</span>}
        {items.map(([val, count]) => (
          <span key={val} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
            {val} <span className="opacity-60">({count})</span>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Participant Overview</h2>
          <p className="text-sm text-slate-500">
            {jotformEnrollments.length} of {enrollments.length} participants have JotForm data
          </p>
        </div>
        <Button
          onClick={generateSynthesis}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
          ) : synthesis ? (
            <><RefreshCw className="w-4 h-4 mr-2" /> Regenerate Synthesis</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate AI Synthesis</>
          )}
        </Button>
      </div>

      {jotformEnrollments.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <p className="text-amber-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              No JotForm registration data found. Upload participant registration PDFs from the Participants page to populate this overview.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Raw Aggregate Stats */}
      {jotformEnrollments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-[#143A50]" />
              Registration Data Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StatRow label="Organization Types" items={orgTypes} colorClass="bg-blue-100 text-blue-800" />
            <StatRow label="Years in Business" items={yearsInBiz} colorClass="bg-teal-100 text-teal-800" />
            <StatRow label="Annual Revenue" items={annualRevenue} colorClass="bg-green-100 text-green-800" />
            <StatRow label="Grant Experience" items={grantExperience} colorClass="bg-amber-100 text-amber-800" />
            <StatRow label="Funding Barriers" items={fundingBarriers} colorClass="bg-red-100 text-red-700" />
            <StatRow label="Participation Plans" items={participationPlans} colorClass="bg-slate-100 text-slate-700" />
            <div className="md:col-span-2">
              <StatRow label="Documents Already Have" items={existingItems} colorClass="bg-purple-100 text-purple-800" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals & Documents Needed (free text) */}
      {(allGoals.length > 0 || allDocumentsNeeded.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allGoals.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">Participant Goals (Verbatim)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {allGoals.map((g, i) => (
                    <li key={i} className="text-xs text-slate-600 border-l-2 border-[#E5C089] pl-2">{g}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {allDocumentsNeeded.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">Documents Needed (Verbatim)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {allDocumentsNeeded.map((d, i) => (
                    <li key={i} className="text-xs text-slate-600 border-l-2 border-[#AC1A5B] pl-2">{d}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* AI Synthesis Output */}
      {synthesis && (
        <div className="space-y-4">
          {/* Group Profile */}
          <Card className="border-[#143A50]/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-[#143A50]">
                <Users className="w-4 h-4" />
                Group Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{synthesis.group_profile_summary}</p>
            </CardContent>
          </Card>

          {/* Recurring Themes */}
          <Card className="border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-purple-800">
                <TrendingUp className="w-4 h-4" />
                Recurring Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {synthesis.recurring_themes?.map((theme, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 bg-purple-50 rounded-lg">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-slate-700">{theme}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Two column: barriers + goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-red-700">Funding Barriers Synthesis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{synthesis.funding_barriers_synthesis}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-green-700">Goals Synthesis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{synthesis.goals_synthesis}</p>
              </CardContent>
            </Card>
          </div>

          {/* Document Gap Analysis */}
          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <BookOpen className="w-4 h-4" />
                Document Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{synthesis.documents_gap_analysis}</p>
            </CardContent>
          </Card>

          {/* Areas of Concern */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-red-800">
                <AlertTriangle className="w-4 h-4" />
                Areas to Be Aware Of
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {synthesis.areas_of_concern?.map((concern, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-white rounded border border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">{concern}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Facilitator Prep Notes */}
          <Card className="border-[#1E4F58]/20 bg-[#1E4F58]/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-[#1E4F58]">
                <Lightbulb className="w-4 h-4" />
                Facilitator Prep Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {synthesis.facilitator_prep_notes?.map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E4F58] mt-2 shrink-0" />
                  <p className="text-sm text-slate-700">{note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Instructional Recs + Equity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">Instructional Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{synthesis.instructional_recommendations}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[#AC1A5B]">Equity Considerations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{synthesis.equity_considerations}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}