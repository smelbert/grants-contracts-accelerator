import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Building2, 
  DollarSign, 
  MapPin, 
  Target,
  FileText,
  TrendingUp,
  Sparkles,
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

export default function FunderProfilePage() {
  const [searchParams] = useSearchParams();
  const funderId = searchParams.get('id');
  const funderName = searchParams.get('name');
  const queryClient = useQueryClient();

  const { data: funder, isLoading } = useQuery({
    queryKey: ['funder', funderId],
    queryFn: async () => {
      if (funderId) {
        const result = await base44.entities.Funder.filter({ id: funderId });
        return result[0];
      }
      return null;
    },
    enabled: !!funderId,
  });

  const enrichFunderMutation = useMutation({
    mutationFn: async (name) => {
      const prompt = `Research the funder "${name}" and provide comprehensive information in the following JSON format:
{
  "mission_statement": "The funder's mission statement",
  "priority_areas": ["area1", "area2", "area3"],
  "typical_award_min": 10000,
  "typical_award_max": 100000,
  "geographic_focus": ["region1", "region2"],
  "past_grants_summary": "Summary of notable past grants and patterns",
  "irs_990_summary": "Summary of 990 data if available, including total assets and annual giving",
  "total_assets": 5000000,
  "annual_giving": 500000,
  "website": "https://example.org",
  "data_sources": ["source1", "source2"]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            mission_statement: { type: "string" },
            priority_areas: { type: "array", items: { type: "string" } },
            typical_award_min: { type: "number" },
            typical_award_max: { type: "number" },
            geographic_focus: { type: "array", items: { type: "string" } },
            past_grants_summary: { type: "string" },
            irs_990_summary: { type: "string" },
            total_assets: { type: "number" },
            annual_giving: { type: "number" },
            website: { type: "string" },
            data_sources: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    },
    onSuccess: async (data) => {
      if (funderId) {
        await base44.entities.Funder.update(funderId, {
          ...data,
          ai_research_completed: true,
          ai_research_date: new Date().toISOString()
        });
      } else {
        await base44.entities.Funder.create({
          name: funderName,
          ...data,
          ai_research_completed: true,
          ai_research_date: new Date().toISOString()
        });
      }
      queryClient.invalidateQueries({ queryKey: ['funder', funderId] });
    }
  });

  const handleEnrichProfile = () => {
    enrichFunderMutation.mutate(funder?.name || funderName);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const showEnrichOption = !funder || !funder.ai_research_completed;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Button asChild variant="ghost" className="mb-6">
          <Link to={createPageUrl('Opportunities')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Opportunities
          </Link>
        </Button>

        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-8 h-8 text-emerald-600" />
                  <CardTitle className="text-3xl">{funder?.name || funderName}</CardTitle>
                </div>
                {funder?.ai_research_completed && funder?.ai_research_date && (
                  <p className="text-sm text-slate-500">
                    Profile enriched on {format(new Date(funder.ai_research_date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
              {showEnrichOption && (
                <Button 
                  onClick={handleEnrichProfile}
                  disabled={enrichFunderMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {enrichFunderMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {funder ? 'Refresh Profile with AI' : 'Generate Profile with AI'}
                </Button>
              )}
              {funder?.ai_research_completed && (
                <Button 
                  onClick={handleEnrichProfile}
                  disabled={enrichFunderMutation.isPending}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Data
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {enrichFunderMutation.isPending && (
          <Alert className="mb-6">
            <Sparkles className="w-4 h-4" />
            <AlertDescription>
              AI is researching {funder?.name || funderName} from public sources. This may take 20-30 seconds...
            </AlertDescription>
          </Alert>
        )}

        {!funder || !funder.ai_research_completed ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Sparkles className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                AI-Powered Funder Research
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Click "Generate Profile with AI" to automatically research and populate this funder's profile with mission, priorities, award ranges, and 990 data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {funder.total_assets && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="text-sm text-slate-600">Total Assets</p>
                        <p className="text-xl font-bold text-slate-900">
                          ${(funder.total_assets / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {funder.annual_giving && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="text-sm text-slate-600">Annual Giving</p>
                        <p className="text-xl font-bold text-slate-900">
                          ${(funder.annual_giving / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {(funder.typical_award_min || funder.typical_award_max) && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Target className="w-8 h-8 text-emerald-600" />
                      <div>
                        <p className="text-sm text-slate-600">Award Range</p>
                        <p className="text-lg font-bold text-slate-900">
                          ${(funder.typical_award_min / 1000).toFixed(0)}K - ${(funder.typical_award_max / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Mission Statement */}
            {funder.mission_statement && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Mission Statement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{funder.mission_statement}</p>
                </CardContent>
              </Card>
            )}

            {/* Priority Areas */}
            {funder.priority_areas && funder.priority_areas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Priority Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {funder.priority_areas.map((area, idx) => (
                      <Badge key={idx} className="bg-emerald-100 text-emerald-800">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Geographic Focus */}
            {funder.geographic_focus && funder.geographic_focus.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Geographic Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {funder.geographic_focus.map((region, idx) => (
                      <Badge key={idx} variant="outline">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Past Grants */}
            {funder.past_grants_summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Past Grants Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-line">{funder.past_grants_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* IRS 990 Data */}
            {funder.irs_990_summary && (
              <Card>
                <CardHeader>
                  <CardTitle>IRS 990 Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-line">{funder.irs_990_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Data Sources */}
            {funder.data_sources && funder.data_sources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {funder.data_sources.map((source, idx) => (
                      <p key={idx} className="text-sm text-slate-600">• {source}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Website Link */}
            {funder.website && (
              <div className="flex justify-center pt-4">
                <Button asChild variant="outline">
                  <a href={funder.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Funder Website
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}