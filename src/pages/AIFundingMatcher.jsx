import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Loader2, Target, TrendingUp, AlertTriangle, 
  CheckCircle2, DollarSign, MapPin, Calendar, Lightbulb 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIFundingMatcher() {
  const [matchResults, setMatchResults] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: () => base44.entities.Organization.filter({ created_by: user.email }),
    enabled: !!user?.email
  });

  const matchMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('matchFunders', data);
      return response.data;
    },
    onSuccess: (data) => {
      setMatchResults(data);
      toast.success(`Found ${data.matches.length} potential funders!`);
      setIsMatching(false);
    },
    onError: (error) => {
      toast.error(`Matching failed: ${error.message}`);
      setIsMatching(false);
    }
  });

  const handleMatch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    setIsMatching(true);
    setMatchResults(null);

    matchMutation.mutate({
      organization_id: organizations[0]?.id,
      project_description: formData.get('project_description'),
      funding_amount_needed: parseFloat(formData.get('funding_amount')) || null,
      sector_focus: formData.get('sector_focus')
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getProbabilityBadge = (probability) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-orange-100 text-orange-800'
    };
    return colors[probability] || colors.medium;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-[#AC1A5B]" />
          AI Funder Matching
        </h1>
        <p className="text-slate-600 mt-2">
          Advanced matching algorithm analyzes your organization and recommends the best funding opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Your Project</CardTitle>
              <CardDescription>Tell us what you need funding for</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMatch} className="space-y-4">
                <div>
                  <Label htmlFor="project_description">Project Description *</Label>
                  <Textarea
                    id="project_description"
                    name="project_description"
                    placeholder="Describe your project, its goals, and intended impact..."
                    rows={4}
                    required
                    disabled={isMatching}
                  />
                </div>
                <div>
                  <Label htmlFor="funding_amount">Funding Amount Needed</Label>
                  <Input
                    id="funding_amount"
                    name="funding_amount"
                    type="number"
                    placeholder="50000"
                    disabled={isMatching}
                  />
                </div>
                <div>
                  <Label htmlFor="sector_focus">Primary Sector</Label>
                  <Input
                    id="sector_focus"
                    name="sector_focus"
                    placeholder="e.g., Education, Health, Arts"
                    disabled={isMatching}
                  />
                </div>
                <Button type="submit" disabled={isMatching || organizations.length === 0} className="w-full">
                  {isMatching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Find Matches
                    </>
                  )}
                </Button>
                {organizations.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Please complete your organization profile first
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!matchResults && !isMatching && (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Find Funding?</h3>
                <p className="text-slate-600">
                  Enter your project details and we'll analyze hundreds of funders to find your best matches
                </p>
              </CardContent>
            </Card>
          )}

          {isMatching && (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-16 h-16 text-[#AC1A5B] mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Analyzing Funders...</h3>
                <p className="text-slate-600 mb-4">
                  AI is comparing your organization against our entire funder database
                </p>
                <p className="text-sm text-slate-500">This may take 1-2 minutes</p>
              </CardContent>
            </Card>
          )}

          {matchResults && (
            <div className="space-y-6">
              {/* Strategic Plan Overview */}
              {matchResults.strategic_plan && (
                <Card className="border-[#AC1A5B] bg-gradient-to-br from-[#AC1A5B]/5 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-[#AC1A5B]" />
                      Strategic Funding Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-semibold text-slate-900">Overall Strategy</Label>
                      <p className="text-slate-700 mt-1">{matchResults.strategic_plan.overall_strategy}</p>
                    </div>
                    {matchResults.strategic_plan.application_timeline?.length > 0 && (
                      <div>
                        <Label className="font-semibold text-slate-900">Application Timeline</Label>
                        <ul className="mt-2 space-y-1">
                          {matchResults.strategic_plan.application_timeline.map((item, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-[#AC1A5B] mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <Label className="font-semibold text-slate-900">Diversification Advice</Label>
                      <p className="text-slate-700 mt-1">{matchResults.strategic_plan.diversification_advice}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Match Results Tabs */}
              <Tabs defaultValue="top">
                <TabsList>
                  <TabsTrigger value="top">Top Matches ({matchResults.top_recommendations?.length})</TabsTrigger>
                  <TabsTrigger value="all">All Results ({matchResults.matches.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="top" className="mt-6 space-y-4">
                  {matchResults.top_recommendations?.map((match, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">{match.funder_name}</CardTitle>
                              <Badge className={getProbabilityBadge(match.success_probability)}>
                                {match.success_probability} probability
                              </Badge>
                            </div>
                            <CardDescription>{match.funder_data?.organization_type}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className={`text-4xl font-bold ${getScoreColor(match.match_score)}`}>
                              {match.match_score}
                            </div>
                            <div className="text-xs text-slate-500">Match Score</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Progress value={match.match_score} className="h-2" />

                        {/* Key Insights */}
                        {match.key_insights && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900 font-medium mb-1">💡 Key Insight</p>
                            <p className="text-sm text-blue-800">{match.key_insights}</p>
                          </div>
                        )}

                        {/* Recommended Ask */}
                        {match.recommended_ask_amount && (
                          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Recommended Ask: ${match.recommended_ask_amount.toLocaleString()}
                          </div>
                        )}

                        {/* Alignment Factors */}
                        {match.alignment_factors?.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                              Why This is a Great Match
                            </Label>
                            <div className="space-y-1">
                              {match.alignment_factors.map((factor, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  {factor}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Approach Strategy */}
                        {match.approach_strategy?.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                              Recommended Approach
                            </Label>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                              {match.approach_strategy.map((strategy, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                  <span className="text-[#AC1A5B] font-bold">{i + 1}.</span>
                                  {strategy}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Red Flags */}
                        {match.red_flags?.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                              Important Considerations
                            </Label>
                            <div className="space-y-1">
                              {match.red_flags.map((flag, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-amber-700">
                                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  {flag}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="all" className="mt-6 space-y-3">
                  {matchResults.matches.map((match, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{match.funder_name}</CardTitle>
                            <CardDescription className="text-sm">
                              {match.funder_data?.geographic_focus && Array.isArray(match.funder_data.geographic_focus) 
                                ? match.funder_data.geographic_focus.join(', ')
                                : match.funder_data?.geographic_focus}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(match.match_score)}`}>
                              {match.match_score}
                            </div>
                            <Badge className={getProbabilityBadge(match.success_probability)} variant="outline">
                              {match.success_probability}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {match.recommended_ask_amount && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${match.recommended_ask_amount.toLocaleString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {match.alignment_factors?.length || 0} alignments
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}