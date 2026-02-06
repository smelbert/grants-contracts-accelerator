import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIPreliminaryFeedback({ documentContent, documentType = 'grant_proposal', consultantLevel = 'level-1' }) {
  const [feedback, setFeedback] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const prompt = `You are an expert grant writing coach at EIS reviewing a ${documentType} draft submitted by a ${consultantLevel} consultant.

EIS QUALITY STANDARDS:
- Clear, compelling narrative
- Alignment with funder priorities
- Strong need statement with data
- Realistic budget and timeline
- Compliance with all requirements
- Professional formatting
- No jargon, accessible language

CONSULTANT LEVEL EXPECTATIONS:
- Level 1: Basic structure, template adherence, needs significant editing
- Level 2: Solid drafts, minor revisions needed, good research
- Level 3: Publication-ready, strategic insight, minimal edits

DOCUMENT CONTENT:
${documentContent.substring(0, 8000)}

Provide preliminary feedback including:
1. Overall quality score (1-10)
2. Strengths (2-3 specific positive points)
3. Areas for improvement (3-5 specific actionable items)
4. Critical issues (compliance, structure, clarity problems)
5. Quick wins (easy fixes that improve quality)
6. Ready for human review? (yes/no with reason)

Be constructive, specific, and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            quality_score: { type: 'number' },
            strengths: {
              type: 'array',
              items: { type: 'string' }
            },
            improvements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  issue: { type: 'string' },
                  suggestion: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                }
              }
            },
            critical_issues: {
              type: 'array',
              items: { type: 'string' }
            },
            quick_wins: {
              type: 'array',
              items: { type: 'string' }
            },
            ready_for_review: { type: 'boolean' },
            review_reason: { type: 'string' }
          }
        }
      });

      setFeedback(result);
      toast.success('AI analysis complete');
    } catch (error) {
      toast.error('Failed to analyze: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  return (
    <Card className="border-2 border-[#AC1A5B] shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#AC1A5B]/10 to-[#E5C089]/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#AC1A5B]" />
              AI Preliminary Feedback
            </CardTitle>
            <CardDescription>
              Automated quality check before human review
            </CardDescription>
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={analyzing || !documentContent}
            className="bg-[#AC1A5B] hover:bg-[#A65D40]"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Draft
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!feedback ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              Run AI analysis to get preliminary feedback on this draft
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quality Score */}
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(feedback.quality_score)}`}>
                {feedback.quality_score}/10
              </div>
              <p className="text-sm text-slate-600 mt-1">Overall Quality Score</p>
            </div>

            {/* Ready for Review Status */}
            <Alert className={feedback.ready_for_review ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
              <AlertDescription className="flex items-center gap-2">
                {feedback.ready_for_review ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="font-medium">
                  {feedback.ready_for_review ? 'Ready for human review' : 'Needs revision before review'}
                </span>
              </AlertDescription>
              <p className="text-sm text-slate-600 mt-2">{feedback.review_reason}</p>
            </Alert>

            {/* Critical Issues */}
            {feedback.critical_issues?.length > 0 && (
              <Card className="border-red-500 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feedback.critical_issues.map((issue, idx) => (
                      <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Areas for Improvement */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Areas for Improvement</h3>
              <div className="space-y-3">
                {feedback.improvements?.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-slate-900">{item.issue}</p>
                          <Badge className={priorityColors[item.priority]}>
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{item.suggestion}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.strengths?.map((strength, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Quick Wins */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                  <Sparkles className="w-4 h-4" />
                  Quick Wins (Easy Fixes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.quick_wins?.map((win, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">→</span>
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}