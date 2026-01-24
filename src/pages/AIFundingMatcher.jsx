import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Sparkles, 
  Loader2, 
  TrendingUp, 
  Target,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function AIFundingMatcherPage() {
  const [matches, setMatches] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['funding-opportunities'],
    queryFn: () => base44.entities.FundingOpportunity.filter({ is_active: true }),
  });

  const organization = organizations[0];

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `You are a funding opportunity matcher. Analyze the following organization profile and compare it against available funding opportunities to identify the best matches.

ORGANIZATION PROFILE:
- Name: ${organization.name}
- Type: ${organization.type}
- Stage: ${organization.stage}
- Mission: ${organization.mission_statement || 'Not provided'}
- Programs: ${organization.programs_description || 'Not provided'}
- Target Population: ${organization.target_population || 'Not provided'}
- Geographic Reach: ${organization.geographic_reach || 'Not provided'}
- Annual Budget: ${organization.annual_budget || 'Not provided'}
- Governance: ${organization.governance_status || 'Not provided'}
- Funding Experience: ${organization.funding_experience || 'Not provided'}
- Interest Areas: ${organization.interest_areas?.join(', ') || 'Not provided'}
- Readiness Status: ${organization.readiness_status || 'Not provided'}

AVAILABLE OPPORTUNITIES:
${opportunities.map((opp, idx) => `
${idx + 1}. ${opp.title}
   - Funder: ${opp.funder_name}
   - Type: ${opp.type}
   - Funding Lane: ${opp.funding_lane}
   - Amount Range: $${opp.amount_min || 0} - $${opp.amount_max || 0}
   - Deadline: ${opp.deadline || opp.deadline_full || 'Rolling'}
   - Description: ${opp.description || 'Not provided'}
   - Eligibility: ${opp.eligibility_summary || 'Not provided'}
   - Geographic Focus: ${opp.geographic_focus || 'Not specified'}
   - Sectors: ${opp.sector_focus?.join(', ') || 'Not specified'}
`).join('\n')}

TASK: Return a JSON array of the top 5-10 best matching opportunities with detailed explanations. For each match, provide:
1. opportunity_title (exact match from list)
2. match_score (0-100)
3. match_reason (2-3 sentences explaining WHY this is a good match)
4. readiness_assessment (is the org ready now, or what gaps exist)
5. key_strengths (2-3 bullet points of org strengths for this opportunity)
6. potential_concerns (1-2 potential challenges or gaps)
7. recommended_action (specific next step)

Sort by match_score descending.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  opportunity_title: { type: "string" },
                  match_score: { type: "number" },
                  match_reason: { type: "string" },
                  readiness_assessment: { type: "string" },
                  key_strengths: { type: "array", items: { type: "string" } },
                  potential_concerns: { type: "array", items: { type: "string" } },
                  recommended_action: { type: "string" }
                }
              }
            }
          }
        }
      });

      setMatches(result.matches);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-slate-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-amber-100';
    return 'bg-slate-100';
  };

  if (!organization) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Please complete your organization profile first to use the AI Funding Matcher.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            AI Funding Matcher
          </h1>
          <p className="text-slate-600 mt-2">
            AI-powered analysis to identify your best funding opportunities and explain why they're a match
          </p>
        </div>

        {/* Organization Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Organization Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Type</p>
                <Badge variant="outline">{organization.type}</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Stage</p>
                <Badge variant="outline">{organization.stage}</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Readiness</p>
                <Badge className="bg-emerald-100 text-emerald-800">
                  {organization.readiness_status?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Interest Areas</p>
                <p className="text-sm font-medium text-slate-900">
                  {organization.interest_areas?.length || 0} lanes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Action */}
        {!matches && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Sparkles className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Ready to Find Your Best Matches?
              </h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Our AI will analyze your organization profile against {opportunities.length} active funding opportunities 
                to identify the best matches and explain why they're right for you.
              </p>
              <Button
                onClick={runAIAnalysis}
                disabled={isAnalyzing}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Opportunities...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>
              {isAnalyzing && (
                <p className="text-sm text-slate-500 mt-4">
                  This may take 20-30 seconds. The AI is reviewing your profile and matching it against all opportunities.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {matches && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Top {matches.length} Matches
              </h2>
              <Button onClick={runAIAnalysis} variant="outline" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>

            {matches.map((match, idx) => {
              const opportunity = opportunities.find(o => o.title === match.opportunity_title);
              return (
                <Card key={idx} className="border-2 hover:border-emerald-500 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="text-lg px-3 py-1">#{idx + 1}</Badge>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {match.opportunity_title}
                          </h3>
                        </div>
                        {opportunity && (
                          <p className="text-slate-600 mb-2">{opportunity.funder_name}</p>
                        )}
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(match.match_score)}`}>
                          {match.match_score}
                        </div>
                        <p className="text-xs text-slate-500">Match Score</p>
                      </div>
                    </div>

                    <Progress value={match.match_score} className="h-2 mb-4" />

                    {/* Match Reason */}
                    <div className="mb-4 p-4 bg-emerald-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Target className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 mb-1">Why This Match?</p>
                          <p className="text-slate-700 text-sm">{match.match_reason}</p>
                        </div>
                      </div>
                    </div>

                    {/* Readiness Assessment */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 mb-1">Readiness Assessment</p>
                          <p className="text-slate-700 text-sm">{match.readiness_assessment}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {/* Key Strengths */}
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          Your Strengths
                        </p>
                        <ul className="space-y-1">
                          {match.key_strengths?.map((strength, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Potential Concerns */}
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Potential Challenges
                        </p>
                        <ul className="space-y-1">
                          {match.potential_concerns?.map((concern, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5">•</span>
                              <span>{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="p-4 bg-slate-50 rounded-lg mb-4">
                      <p className="font-medium text-slate-900 mb-1">Recommended Next Step</p>
                      <p className="text-slate-700 text-sm">{match.recommended_action}</p>
                    </div>

                    {/* Opportunity Details */}
                    {opportunity && (
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                        {opportunity.amount_max && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <DollarSign className="w-4 h-4" />
                            <span>Up to ${(opportunity.amount_max / 1000).toFixed(0)}K</span>
                          </div>
                        )}
                        {opportunity.deadline && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                        <Button asChild size="sm" className="ml-auto">
                          <Link to={createPageUrl('Opportunities')}>
                            View Opportunity
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}