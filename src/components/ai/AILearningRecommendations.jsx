import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, BookOpen, TrendingUp, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AILearningRecommendations({ organization, learningContent, fundingGaps }) {
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const prompt = `You are a learning path advisor for a funding readiness platform. Analyze the organization's profile and recommend the most relevant learning content.

ORGANIZATION PROFILE:
- Type: ${organization.type}
- Stage: ${organization.stage}
- Readiness Status: ${organization.readiness_status || 'Not assessed'}
- Governance: ${organization.governance_status}
- Funding Experience: ${organization.funding_experience}
- Interest Areas: ${organization.interest_areas?.join(', ') || 'None specified'}

IDENTIFIED GAPS:
${fundingGaps || 'No specific gaps identified yet'}

AVAILABLE LEARNING CONTENT:
${learningContent.map((content, idx) => `
${idx + 1}. ${content.title} (${content.content_type})
   - Lane: ${content.funding_lane}
   - Duration: ${content.duration_minutes} min
   - Description: ${content.description?.substring(0, 150)}...
`).join('\n')}

TASK: Return a JSON object with personalized learning recommendations. Include:
1. priority_courses: array of 3-5 course titles that are most critical for this organization's current stage
2. quick_wins: array of 2-3 short guides/webinars (under 60 min) they can complete quickly
3. long_term_development: array of 2-3 courses for future growth
4. reasoning: 2-3 sentences explaining why these recommendations match their profile

For each recommendation, include the exact title from the available content list.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            priority_courses: { type: "array", items: { type: "string" } },
            quick_wins: { type: "array", items: { type: "string" } },
            long_term_development: { type: "array", items: { type: "string" } },
            reasoning: { type: "string" }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setRecommendations(data);
    }
  });

  useEffect(() => {
    if (organization && learningContent.length > 0 && !recommendations) {
      generateRecommendationsMutation.mutate();
    }
  }, [organization, learningContent]);

  const findContent = (title) => {
    return learningContent.find(c => c.title === title);
  };

  if (generateRecommendationsMutation.isPending) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="pt-6 text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">AI is analyzing your profile to recommend learning content...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Your Personalized Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-emerald-100 border-emerald-300 mb-4">
            <Target className="w-4 h-4 text-emerald-700" />
            <AlertDescription className="text-emerald-900">
              {recommendations.reasoning}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Priority Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            Priority Courses - Start Here
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.priority_courses?.map((title, idx) => {
              const content = findContent(title);
              return content ? (
                <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-red-600 text-white">Priority</Badge>
                        <Badge variant="outline">{content.content_type}</Badge>
                        <Badge variant="outline">{content.duration_minutes} min</Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">{content.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{content.description}</p>
                    </div>
                    <Button asChild size="sm" className="ml-4 bg-red-600 hover:bg-red-700">
                      <Link to={createPageUrl('LearningModule') + '?id=' + content.id}>
                        Start
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Quick Wins - Complete Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.quick_wins?.map((title, idx) => {
              const content = findContent(title);
              return content ? (
                <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-600 text-white">Quick Win</Badge>
                        <Badge variant="outline">{content.content_type}</Badge>
                        <Badge variant="outline">{content.duration_minutes} min</Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">{content.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{content.description}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="ml-4">
                      <Link to={createPageUrl('LearningModule') + '?id=' + content.id}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Long-term Development */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Long-term Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.long_term_development?.map((title, idx) => {
              const content = findContent(title);
              return content ? (
                <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-purple-600 text-white">Future Growth</Badge>
                        <Badge variant="outline">{content.content_type}</Badge>
                        <Badge variant="outline">{content.duration_minutes} min</Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">{content.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{content.description}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="ml-4">
                      <Link to={createPageUrl('LearningModule') + '?id=' + content.id}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}