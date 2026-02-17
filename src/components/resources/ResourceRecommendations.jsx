import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, BookOpen, FileText, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResourceRecommendations({ userEmail, onResourceClick }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: organization } = useQuery({
    queryKey: ['organization', user?.email],
    queryFn: async () => {
      const orgs = await base44.entities.Organization.filter({ 
        created_by: user.email 
      });
      return orgs[0];
    },
    enabled: !!user?.email,
  });

  const { data: readinessAssessment } = useQuery({
    queryKey: ['readiness-assessment', user?.email],
    queryFn: async () => {
      const assessments = await base44.entities.FundingReadinessAssessment.filter({
        user_email: user.email
      });
      return assessments.sort((a, b) => 
        new Date(b.assessment_date) - new Date(a.assessment_date)
      )[0];
    },
    enabled: !!user?.email,
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['user-activity', user?.email],
    queryFn: async () => {
      const activities = await base44.entities.UserActivity.filter({
        user_email: user.email
      });
      return activities.slice(0, 10);
    },
    enabled: !!user?.email,
  });

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['resource-recommendations', user?.email, organization?.id, readinessAssessment?.id],
    queryFn: async () => {
      // Gather context for AI recommendations
      const context = {
        funding_lane: organization?.funding_lane || 'general',
        organization_stage: organization?.organization_stage || 'exploring',
        readiness_level: readinessAssessment?.readiness_level || 'building_readiness',
        recent_activities: recentActivity?.map(a => a.activity_type).join(', ') || 'none',
        focus_areas: readinessAssessment?.score_breakdown || {}
      };

      const prompt = `As a funding readiness advisor, recommend 5 specific resources for this nonprofit:

Context:
- Funding Lane: ${context.funding_lane}
- Organization Stage: ${context.organization_stage}
- Readiness Level: ${context.readiness_level}
- Recent Activity: ${context.recent_activities}

Provide recommendations in this JSON format:
{
  "recommendations": [
    {
      "title": "Resource Title",
      "type": "course|template|guide|article",
      "reason": "Brief explanation why this is recommended",
      "stage": "research|proposal_writing|budgeting|reporting",
      "priority": "high|medium|low"
    }
  ]
}

Focus on their specific needs based on readiness level and funding lane.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  reason: { type: "string" },
                  stage: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      return result.recommendations || [];
    },
    enabled: !!user?.email && !!organization,
  });

  if (isLoading || !recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-2 border-[#E5C089] bg-gradient-to-br from-[#E5C089]/5 to-[#143A50]/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#143A50] to-[#1E4F58] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#E5C089]" />
          </div>
          <div>
            <CardTitle className="text-xl text-[#143A50]">Recommended For You</CardTitle>
            <CardDescription>
              Based on your funding lane, readiness level, and recent activity
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all border hover:border-[#143A50]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge 
                      className={
                        rec.priority === 'high' 
                          ? 'bg-[#AC1A5B] text-white' 
                          : rec.priority === 'medium'
                          ? 'bg-[#E5C089] text-[#143A50]'
                          : 'bg-slate-200 text-slate-700'
                      }
                    >
                      {rec.priority} priority
                    </Badge>
                    {rec.type === 'course' && <BookOpen className="w-5 h-5 text-blue-600" />}
                    {rec.type === 'template' && <FileText className="w-5 h-5 text-green-600" />}
                    {rec.type === 'guide' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                  </div>
                  <CardTitle className="text-base text-slate-900">
                    {rec.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {rec.stage?.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rec.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-600 mb-3">{rec.reason}</p>
                  <Button 
                    size="sm" 
                    className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
                    onClick={() => onResourceClick && onResourceClick(rec)}
                  >
                    Explore Resource
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}