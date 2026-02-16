import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIFeedbackPanel({ fieldLabel, userResponse, onClose }) {
  const [feedback, setFeedback] = useState(null);

  const generateFeedbackMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful funding readiness coach providing constructive feedback on workbook responses.

Field: ${fieldLabel}
User's Response: ${userResponse}

Provide brief, constructive feedback that:
1. Acknowledges what they did well
2. Offers 1-2 specific suggestions for improvement
3. Encourages them to think deeper if the response is too brief

Keep your feedback encouraging, actionable, and under 150 words. Format as JSON with these fields:
- strengths (string): What they did well
- suggestions (array of strings): Specific improvements
- overall_quality (string): "excellent", "good", or "needs_work"`,
        response_json_schema: {
          type: "object",
          properties: {
            strengths: { type: "string" },
            suggestions: { type: "array", items: { type: "string" } },
            overall_quality: { type: "string", enum: ["excellent", "good", "needs_work"] }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setFeedback(data);
    }
  });

  const qualityBadges = {
    excellent: { bg: 'bg-green-100', text: 'text-green-800', label: 'Excellent!' },
    good: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Good Work!' },
    needs_work: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Room to Improve' }
  };

  return (
    <Card className="border-2 border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Feedback
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!feedback && !generateFeedbackMutation.isPending && (
          <div className="text-center py-4">
            <p className="text-sm text-slate-600 mb-4">Get AI-powered feedback on your response</p>
            <Button
              onClick={() => generateFeedbackMutation.mutate()}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!userResponse || userResponse.trim().length < 10}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Feedback
            </Button>
            {(!userResponse || userResponse.trim().length < 10) && (
              <p className="text-xs text-slate-500 mt-2">Write at least 10 characters to get feedback</p>
            )}
          </div>
        )}

        {generateFeedbackMutation.isPending && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600">Analyzing your response...</p>
          </div>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <Badge className={`${qualityBadges[feedback.overall_quality]?.bg} ${qualityBadges[feedback.overall_quality]?.text}`}>
                  {qualityBadges[feedback.overall_quality]?.label}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => generateFeedbackMutation.mutate()}
                  className="text-purple-600"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>

              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-900 text-sm mb-1">Strengths</h4>
                      <p className="text-sm text-green-800">{feedback.strengths}</p>
                    </div>
                  </div>
                </div>

                {feedback.suggestions && feedback.suggestions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm mb-2">Suggestions for Improvement</h4>
                        <ul className="space-y-1">
                          {feedback.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500 text-center pt-2">
                AI feedback is a helpful guide, not a requirement. Use it to improve your thinking!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {generateFeedbackMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-800">Failed to generate feedback. Please try again.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}