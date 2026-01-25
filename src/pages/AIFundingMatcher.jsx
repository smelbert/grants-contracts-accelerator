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

  const { data: readinessAssessments = [] } = useQuery({
    queryKey: ['readiness-assessments'],
    queryFn: () => base44.entities.GrantReadinessAssessment.list('-assessment_date'),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['grant-applications'],
    queryFn: () => base44.entities.GrantApplication.list(),
  });

  const organization = organizations[0];
  const latestAssessment = readinessAssessments[0];

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `You are an expert funding opportunity matcher with deep knowledge of grant readiness, funder priorities, and nonprofit capacity. Analyze the following organization profile and compare it against available funding opportunities to identify the best matches.

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

GRANT READINESS ASSESSMENT:
${latestAssessment ? `
- Assessment Date: ${new Date(latestAssessment.assessment_date).toLocaleDateString()}
- Total Score: ${latestAssessment.total_score}/55
- Readiness Level: ${latestAssessment.readiness_level}
- Level 1 (Foundational): ${latestAssessment.level_1_score}/16
- Level 2 (Fundability): ${latestAssessment.level_2_score}/20
- Level 3 (Competitive): ${latestAssessment.level_3_score}/19
` : 'No readiness assessment completed yet'}

ACTIVE APPLICATIONS & CONTEXT:
${applications.length > 0 ? applications.map(app => `
- ${app.application_name} (Status: ${app.status})
  Amount Requested: $${app.requested_amount || 'TBD'}
`).join('\n') : 'No active applications'}

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

MATCHING CRITERIA:
- Prioritize opportunities that align with the organization's readiness level
- Consider geographic fit, sector alignment, and budget size appropriateness
- Factor in the organization's stage and capacity
- Avoid recommending opportunities that are clearly beyond current capacity
- Consider timing and deadline feasibility

TASK: Return a JSON array of the top 5-10 best matching opportunities with detailed, actionable insights. For each match, provide:
1. opportunity_title (exact match from list)
2. match_score (0-100, be realistic and honest)
3. match_reason (2-3 sentences explaining WHY this is a strong match based on specific alignments)
4. readiness_assessment (honest assessment - are they ready NOW, need 30-60 days prep, or need foundational work first?)
5. key_strengths (2-4 specific bullet points of organizational strengths for THIS opportunity)
6. potential_concerns (1-3 realistic challenges, gaps, or risks they should address)
7. recommended_action (specific, actionable next step with timeline)
8. priority_level (high/medium/low based on fit + readiness + timing)
9. estimated_prep_time (e.g., "Ready now", "2-4 weeks", "2-3 months")

Sort by match_score descending. Be honest about readiness - don't oversell poor matches.`;

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
                  recommended_action: { type: "string" },
                  priority_level: { type: "string" },
                  estimated_prep_time: { type: "string" }
                }
              }
            },
            overall_recommendation: { type: "string" }
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Your Top {matches.length} Funding Matches
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  AI-analyzed based on your profile, readiness level, and active context
                </p>
              </div>
              <Button onClick={runAIAnalysis} variant="outline" size="sm" disabled={isAnalyzing}>
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {matches.map((match, idx) => {
              const opportunity = opportunities.find(o => o.title === match.opportunity_title);
              const priorityColors = {
                high: 'bg-red-100 text-red-800 border-red-300',
                medium: 'bg-amber-100 text-amber-800 border-amber-300',
                low: 'bg-blue-100 text-blue-800 border-blue-300'
              };
              return (
                <Card key={idx} className={`border-2 transition-all shadow-lg hover:shadow-xl ${match.match_score >= 80 ? 'border-emerald-400' : match.match_score >= 60 ? 'border-blue-400' : 'border-slate-300'}`}>
                  <div className={`h-2 ${match.match_score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : match.match_score >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-slate-400 to-slate-500'}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge className="text-lg px-3 py-1 bg-slate-900">#{idx + 1}</Badge>
                          <h3 className="text-xl font-bold text-slate-900">
                            {match.opportunity_title}
                          </h3>
                          {match.priority_level && (
                            <Badge className={priorityColors[match.priority_level] || priorityColors.medium}>
                              {match.priority_level} priority
                            </Badge>
                          )}
                        </div>
                        {opportunity && (
                          <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                            <p className="font-medium">{opportunity.funder_name}</p>
                            <Badge variant="outline" className="text-xs">{opportunity.type}</Badge>
                            {match.estimated_prep_time && (
                              <span className="flex items-center gap-1 text-xs">
                                <Calendar className="w-3 h-3" />
                                {match.estimated_prep_time}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-center ml-4">
                        <div className={`text-4xl font-black ${getScoreColor(match.match_score)}`}>
                          {match.match_score}
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-1">MATCH</p>
                      </div>
                    </div>

                    <Progress value={match.match_score} className={`h-3 mb-4 ${getScoreBgColor(match.match_score)}`} />

                    {/* Match Reason */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-600 rounded-lg">
                          <Target className="w-5 h-5 text-white flex-shrink-0" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-emerald-900 mb-2">Why This Is A Strong Match</p>
                          <p className="text-slate-800 leading-relaxed">{match.match_reason}</p>
                        </div>
                      </div>
                    </div>

                    {/* Readiness Assessment */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-blue-900 mb-2">Your Readiness for This Opportunity</p>
                          <p className="text-slate-800 leading-relaxed">{match.readiness_assessment}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {/* Key Strengths */}
                      <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                        <p className="font-bold text-green-900 mb-3 flex items-center gap-2">
                          <div className="p-1.5 bg-green-600 rounded">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          Your Competitive Advantages
                        </p>
                        <ul className="space-y-2">
                          {match.key_strengths?.map((strength, i) => (
                            <li key={i} className="text-sm text-slate-800 flex items-start gap-2 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Potential Concerns */}
                      <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                        <p className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                          <div className="p-1.5 bg-amber-600 rounded">
                            <AlertCircle className="w-4 h-4 text-white" />
                          </div>
                          Areas to Address
                        </p>
                        <ul className="space-y-2">
                          {match.potential_concerns?.map((concern, i) => (
                            <li key={i} className="text-sm text-slate-800 flex items-start gap-2 leading-relaxed">
                              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span>{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300 mb-4">
                      <p className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        Your Next Step
                      </p>
                      <p className="text-slate-800 leading-relaxed font-medium">{match.recommended_action}</p>
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