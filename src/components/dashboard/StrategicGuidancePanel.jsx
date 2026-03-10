import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StrategicGuidancePanel({ organization, readinessScore = 0 }) {
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);

  const getGuidance = async () => {
    setLoading(true);
    try {
      const recommendations = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this organization profile, provide 3-4 strategic recommendations to improve grant readiness:
        
Organization: ${organization.organization_name}
Type: ${organization.organization_type}
Experience Level: ${organization.grant_experience_level}
Current Readiness Score: ${readinessScore}/100
Annual Budget: ${organization.annual_budget}
Staff Count: ${organization.staff_count}
Has Strategic Plan: ${organization.has_strategic_plan}
Has Financial Systems: ${organization.has_financial_systems}
Has Evaluation System: ${organization.has_evaluation_system}

Provide specific, actionable recommendations that address gaps and build on strengths. Format as a brief JSON array with {"priority": "high/medium", "recommendation": "...", "impact": "..."} objects.`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  priority: { type: 'string' },
                  recommendation: { type: 'string' },
                  impact: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setGuidance(recommendations);
    } catch (error) {
      console.error('Error getting guidance:', error);
    }
    setLoading(false);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-blue-100 text-blue-700'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#E5C089]" />
          Strategic Guidance
        </CardTitle>
        <CardDescription>Personalized recommendations to improve your grant readiness</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {guidance ? (
          <div className="space-y-3">
            {guidance.recommendations?.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                  </Badge>
                </div>
                <p className="font-medium text-slate-900 mb-2">{rec.recommendation}</p>
                <p className="text-sm text-slate-600">Impact: {rec.impact}</p>
              </div>
            ))}

            <Button
              onClick={() => setGuidance(null)}
              variant="outline"
              className="w-full"
            >
              Get New Recommendations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 text-center py-4">
              Get AI-powered recommendations tailored to your organization's profile and readiness level.
            </p>
            <Button
              onClick={getGuidance}
              disabled={loading}
              className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? 'Analyzing...' : 'Generate Recommendations'}
            </Button>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200">
          <Link to={createPageUrl('GrantAssistant')}>
            <Button variant="outline" size="sm" className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Talk to Grant Assistant
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}