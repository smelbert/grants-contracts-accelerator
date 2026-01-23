import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Lightbulb, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIGuidanceAssistant({ 
  templateId, 
  userContent = '', 
  context = 'general',
  onSuggestionApply 
}) {
  const [expanded, setExpanded] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const { data: template } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const templates = await base44.entities.Template.list();
      return templates.find(t => t.id === templateId);
    },
    enabled: !!templateId,
  });

  const analyzeContentMutation = useMutation({
    mutationFn: async ({ content, templateData }) => {
      const prompt = `You are an expert grant writing and funding advisor. Analyze this user's content for a ${templateData.template_name}.

TEMPLATE CONTEXT:
- Purpose: ${templateData.purpose}
- What Funders Look For: ${templateData.what_funders_look_for}
- Common Mistakes: ${templateData.common_mistakes}
- When Not to Use: ${templateData.when_not_to_use}

USER'S CONTENT:
${content || '(No content yet)'}

Provide a JSON response with:
{
  "overall_assessment": "brief 1-2 sentence assessment",
  "strengths": ["strength 1", "strength 2"],
  "gaps": ["gap 1", "gap 2", "gap 3"],
  "funder_alignment": "how well this aligns with what funders look for",
  "common_mistakes_found": ["mistake 1 if found", "mistake 2 if found"],
  "suggestions": [
    {"area": "area name", "suggestion": "specific suggestion", "priority": "high|medium|low"}
  ]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_assessment: { type: 'string' },
            strengths: { type: 'array', items: { type: 'string' } },
            gaps: { type: 'array', items: { type: 'string' } },
            funder_alignment: { type: 'string' },
            common_mistakes_found: { type: 'array', items: { type: 'string' } },
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  area: { type: 'string' },
                  suggestion: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            }
          }
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setAnalyzing(false);
    },
  });

  const handleAnalyze = () => {
    if (!template) return;
    setAnalyzing(true);
    analyzeContentMutation.mutate({ content: userContent, templateData: template });
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800'
  };

  return (
    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-base">AI Guidance Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="space-y-4">
              {/* Best Practices Section */}
              {template && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 mb-1">What Funders Look For</p>
                      <p className="text-sm text-slate-600">{template.what_funders_look_for}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 mb-1">Common Mistakes to Avoid</p>
                      <p className="text-sm text-slate-600">{template.common_mistakes}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 mb-1">When to Use This</p>
                      <p className="text-sm text-slate-600">{template.when_to_use}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Analysis */}
              {userContent && (
                <div className="pt-3 border-t">
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {analyzing ? 'Analyzing Your Content...' : 'Analyze My Content'}
                  </Button>
                </div>
              )}

              {/* Analysis Results */}
              {analysis && (
                <div className="space-y-3 pt-3 border-t">
                  <Alert>
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      {analysis.overall_assessment}
                    </AlertDescription>
                  </Alert>

                  {analysis.strengths?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">✓ Strengths</p>
                      <ul className="space-y-1">
                        {analysis.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.gaps?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">⚠ Gaps to Address</p>
                      <ul className="space-y-1">
                        {analysis.gaps.map((gap, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.common_mistakes_found?.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-sm">
                        <p className="font-medium mb-1">Common Mistakes Detected:</p>
                        <ul className="space-y-1">
                          {analysis.common_mistakes_found.map((mistake, idx) => (
                            <li key={idx}>• {mistake}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysis.suggestions?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">💡 Suggestions</p>
                      <div className="space-y-2">
                        {analysis.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium text-slate-700">{suggestion.area}</p>
                              <Badge className={priorityColors[suggestion.priority] || priorityColors.medium}>
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{suggestion.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-emerald-900 mb-1">Funder Alignment</p>
                    <p className="text-sm text-emerald-700">{analysis.funder_alignment}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}