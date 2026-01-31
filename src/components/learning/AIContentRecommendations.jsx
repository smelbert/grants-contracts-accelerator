import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Loader2, BookOpen, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIContentRecommendations({ user, organization, userProgress = [], allContent = [] }) {
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      // Analyze user performance
      const completedModules = userProgress.filter(p => p.completed);
      const avgQuizScore = userProgress.length > 0
        ? userProgress.reduce((acc, p) => {
            const scores = p.quiz_scores || [];
            const moduleAvg = scores.length > 0
              ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
              : 0;
            return acc + moduleAvg;
          }, 0) / userProgress.length
        : 0;

      const completedContentIds = completedModules.map(p => p.learning_content_id);
      const completedContentDetails = allContent.filter(c => completedContentIds.includes(c.id));
      
      const preferredLanes = {};
      completedContentDetails.forEach(c => {
        preferredLanes[c.funding_lane] = (preferredLanes[c.funding_lane] || 0) + 1;
      });
      const topLane = Object.keys(preferredLanes).sort((a, b) => preferredLanes[b] - preferredLanes[a])[0];

      const weakAreas = userProgress.filter(p => {
        const avg = p.quiz_scores?.length > 0
          ? p.quiz_scores.reduce((sum, s) => sum + s.score, 0) / p.quiz_scores.length
          : null;
        return avg && avg < 70;
      }).map(p => allContent.find(c => c.id === p.learning_content_id)?.title).filter(Boolean);

      const prompt = `You are an expert learning advisor for grant writing and nonprofit capacity building. Analyze this user's learning profile and recommend the next 3-5 modules they should take.

User Profile:
- Organization Type: ${organization?.type || 'unknown'}
- Organization Stage: ${organization?.stage || 'unknown'}
- Readiness Status: ${organization?.readiness_status || 'unknown'}
- Interest Areas: ${organization?.interest_areas?.join(', ') || 'general'}
- Annual Budget: ${organization?.annual_budget || 'unknown'}

Learning History:
- Completed Modules: ${completedModules.length}
- Average Quiz Score: ${Math.round(avgQuizScore)}%
- Preferred Funding Lane: ${topLane || 'none yet'}
- Modules Completed: ${completedContentDetails.map(c => c.title).join(', ') || 'none'}
- Weak Areas (scored <70%): ${weakAreas.join(', ') || 'none identified'}

Available Content:
${allContent.filter(c => !completedContentIds.includes(c.id)).map(c => 
  `- ${c.title} (${c.funding_lane}, ${c.content_type})`
).join('\n')}

Provide recommendations in this exact JSON format:
{
  "recommendations": [
    {
      "content_id": "exact id from available content",
      "priority": "high/medium/low",
      "reason": "brief explanation why this is recommended for this specific user"
    }
  ],
  "learning_path_summary": "1-2 sentence personalized message about their learning journey"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  content_id: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            learning_path_summary: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setRecommendations(data);
    }
  });

  const getRecommendedContent = () => {
    if (!recommendations?.recommendations) return [];
    return recommendations.recommendations
      .map(rec => ({
        ...allContent.find(c => c.id === rec.content_id),
        priority: rec.priority,
        reason: rec.reason
      }))
      .filter(c => c.id); // Filter out any that didn't match
  };

  const recommendedContent = getRecommendedContent();

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI-Powered Learning Path
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recommendations ? (
          <div className="text-center py-6">
            <p className="text-slate-600 mb-4">
              Get personalized module recommendations based on your performance and goals
            </p>
            <Button
              onClick={() => generateRecommendationsMutation.mutate()}
              disabled={generateRecommendationsMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateRecommendationsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate My Learning Path
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {recommendations.learning_path_summary && (
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-slate-700 italic">
                  "{recommendations.learning_path_summary}"
                </p>
              </div>
            )}

            <div className="space-y-3">
              {recommendedContent.map((content, idx) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={createPageUrl('LearningModule') + '?id=' + content.id}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-100">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                className={
                                  content.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  content.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }
                              >
                                {content.priority} priority
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {content.funding_lane}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-slate-900 mb-1">
                              {content.title}
                            </h4>
                            <p className="text-xs text-slate-600 mb-2">
                              {content.reason}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateRecommendationsMutation.mutate()}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Recommendations
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}