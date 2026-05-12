import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, RefreshCw, DollarSign, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

const LANE_COLORS = {
  grants: 'bg-emerald-100 text-emerald-700',
  contracts: 'bg-blue-100 text-blue-700',
  donors: 'bg-purple-100 text-purple-700',
  public_funds: 'bg-amber-100 text-amber-700',
};

export default function OpportunityMatcherWidget({ userEmail }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(null);

  // Fetch org profile
  const { data: orgProfile } = useQuery({
    queryKey: ['org-profile', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const orgs = await base44.entities.Organization.filter({ primary_contact_email: userEmail });
      return orgs[0] || null;
    },
    enabled: !!userEmail,
  });

  // Fetch funding readiness assessment (strategy worksheet)
  const { data: readinessAssessment } = useQuery({
    queryKey: ['funding-readiness', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const assessments = await base44.entities.FundingReadinessAssessment.filter({ user_email: userEmail });
      return assessments[0] || null;
    },
    enabled: !!userEmail,
  });

  // Fetch active opportunities
  const { data: opportunities = [], isLoading: oppsLoading } = useQuery({
    queryKey: ['active-opportunities-matcher'],
    queryFn: () => base44.entities.FundingOpportunity.filter({ is_active: true, status: 'active' }, '-deadline', 50),
  });

  const hasProfile = orgProfile && (orgProfile.mission_statement || orgProfile.programs_offered || orgProfile.organization_type);

  const runMatcher = async () => {
    if (!opportunities.length) return;
    setIsGenerating(true);
    setError(null);

    try {
      const orgContext = orgProfile ? `
Organization: ${orgProfile.organization_name || 'Unknown'}
Type: ${orgProfile.organization_type || 'Unknown'}
Mission: ${orgProfile.mission_statement || 'Not provided'}
Programs: ${orgProfile.programs_offered || 'Not provided'}
Target Population: ${orgProfile.target_population || 'Not provided'}
Geographic Area: ${orgProfile.geographic_service_area || 'Not provided'}
Annual Budget: ${orgProfile.annual_budget || 'Not provided'}
Grant Experience: ${orgProfile.grant_experience_level || 'Not provided'}
Revenue Stage: ${orgProfile.revenue_stage || 'Not provided'}
Has Strategic Plan: ${orgProfile.has_strategic_plan ? 'Yes' : 'No'}
Has Financial Systems: ${orgProfile.has_financial_systems ? 'Yes' : 'No'}
Funding Goals: ${orgProfile.funding_goals || 'Not provided'}
`.trim() : 'No organizational profile completed yet.';

      const readinessContext = readinessAssessment ? `
Legal Status: ${readinessAssessment.legal_status || 'unknown'}
Financial Records: ${readinessAssessment.financial_records || 'unknown'}
Program Clarity: ${readinessAssessment.program_clarity || 'unknown'}
Capacity: ${readinessAssessment.capacity || 'unknown'}
Readiness Level: ${readinessAssessment.readiness_level || 'unknown'}
Overall Score: ${readinessAssessment.overall_score || 'unknown'}
`.trim() : 'No funding readiness assessment completed.';

      const oppsContext = opportunities.slice(0, 30).map(o =>
        `ID:${o.id}|Title:${o.title}|Funder:${o.funder_name || ''}|Type:${o.type}|Lane:${o.funding_lane}|Min:${o.amount_min || 0}|Max:${o.amount_max || 0}|Deadline:${o.deadline || o.deadline_full || 'rolling'}|Eligibility:${o.eligibility_summary || ''}|Sector:${(o.sector_focus || []).join(',')}|Geo:${o.geographic_focus || ''}|Desc:${(o.description || '').slice(0, 200)}`
      ).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert grant writer and funding strategist. Analyze this organization's profile and readiness assessment, then identify the TOP 3 best-fit funding opportunities from the list provided.

=== ORGANIZATION PROFILE ===
${orgContext}

=== FUNDING READINESS ===
${readinessContext}

=== AVAILABLE OPPORTUNITIES ===
${oppsContext}

Return EXACTLY 3 matches. For each, provide a compelling, specific explanation (2-3 sentences) of WHY this is a strong fit based on the org's profile, mission, target population, geographic area, and readiness level. Be specific — reference actual details from both the org profile and the opportunity. Do not be generic.

If the org profile is incomplete, make reasonable inferences but note what additional info would strengthen the match.`,
        response_json_schema: {
          type: 'object',
          properties: {
            matches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  opportunity_id: { type: 'string' },
                  match_score: { type: 'number', description: '0-100 fit score' },
                  fit_reason: { type: 'string', description: '2-3 sentence explanation of why this is a strong fit' },
                  key_strengths: { type: 'array', items: { type: 'string' }, description: '2-3 specific alignment points' },
                },
              },
            },
          },
        },
      });

      // Hydrate with full opportunity data
      const hydrated = (result.matches || []).map(match => {
        const opp = opportunities.find(o => o.id === match.opportunity_id);
        return opp ? { ...match, opportunity: opp } : null;
      }).filter(Boolean).slice(0, 3);

      setMatches(hydrated);
    } catch (err) {
      console.error('Opportunity matcher error:', err);
      setError('Unable to generate matches. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (oppsLoading) return null;

  return (
    <Card className="border-2 border-[#143A50]/20 bg-gradient-to-br from-[#143A50]/5 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#143A50] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#E5C089]" />
            </div>
            <div>
              <CardTitle className="text-[#143A50]">AI Opportunity Matcher</CardTitle>
              <CardDescription>
                {matches
                  ? 'Top 3 opportunities matched to your profile'
                  : 'Scan opportunities against your org profile for AI-powered matches'}
              </CardDescription>
            </div>
          </div>
          {matches && (
            <Button
              variant="ghost"
              size="sm"
              onClick={runMatcher}
              disabled={isGenerating}
              className="text-[#143A50]"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* No profile warning */}
        {!hasProfile && !matches && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Complete your org profile for better matches</p>
              <p className="text-xs text-amber-700 mt-1">Add your mission, programs, and target population to get highly specific AI recommendations.</p>
            </div>
            <Link to={createPageUrl('Profile')}>
              <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50">
                Complete Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Initial state — run button */}
        {!matches && !isGenerating && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#143A50]/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#143A50]" />
            </div>
            <p className="text-sm text-slate-600 mb-4 max-w-xs mx-auto">
              AI will analyze {opportunities.length} active opportunities and surface your top 3 matches with a personal fit explanation.
            </p>
            <Button
              onClick={runMatcher}
              className="bg-[#143A50] hover:bg-[#1E4F58] text-white gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Find My Top Matches
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isGenerating && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-[#143A50]/20 border-t-[#143A50] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-700">Analyzing {opportunities.length} opportunities...</p>
            <p className="text-xs text-slate-500 mt-1">Comparing against your org profile and readiness assessment</p>
          </div>
        )}

        {/* Error state */}
        {error && !isGenerating && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 mt-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <Button size="sm" variant="outline" onClick={runMatcher} className="ml-auto">Retry</Button>
          </div>
        )}

        {/* Matches */}
        {matches && !isGenerating && (
          <div className="space-y-4">
            {matches.map((match, idx) => {
              const opp = match.opportunity;
              const amount = opp.amount_max
                ? `$${opp.amount_min ? opp.amount_min.toLocaleString() + '–' : ''}${opp.amount_max.toLocaleString()}`
                : opp.amount_min
                ? `$${opp.amount_min.toLocaleString()}+`
                : null;

              return (
                <div
                  key={opp.id}
                  className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Rank badge */}
                    <div className="w-8 h-8 rounded-full bg-[#143A50] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 line-clamp-1">{opp.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {opp.funder_name && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />{opp.funder_name}
                          </span>
                        )}
                        {opp.funding_lane && (
                          <Badge className={`text-xs ${LANE_COLORS[opp.funding_lane] || 'bg-slate-100 text-slate-700'}`}>
                            {opp.funding_lane}
                          </Badge>
                        )}
                        {amount && (
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />{amount}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Fit score */}
                    <div className="flex-shrink-0 text-center">
                      <div className="text-lg font-bold text-[#143A50]">{match.match_score}%</div>
                      <div className="text-xs text-slate-500">fit</div>
                    </div>
                  </div>

                  {/* Why it fits */}
                  <div className="bg-[#143A50]/5 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-[#143A50] mb-1 uppercase tracking-wide">Why this is a strong fit</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{match.fit_reason}</p>
                  </div>

                  {/* Key strengths */}
                  {match.key_strengths?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {match.key_strengths.map((strength, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          {strength}
                        </div>
                      ))}
                    </div>
                  )}

                  <Link to={createPageUrl('Opportunities')}>
                    <Button size="sm" variant="outline" className="w-full border-[#143A50] text-[#143A50] hover:bg-[#143A50] hover:text-white gap-1">
                      View Opportunity <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              );
            })}

            <div className="text-center pt-2">
              <Link to={createPageUrl('Opportunities')}>
                <Button variant="ghost" size="sm" className="text-[#143A50] gap-1">
                  Browse all {opportunities.length} opportunities <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}