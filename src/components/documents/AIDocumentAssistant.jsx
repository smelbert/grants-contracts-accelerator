import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, Loader2, CheckCircle2, AlertTriangle, 
  Lightbulb, Target, FileCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIDocumentAssistant({ document, onApplySuggestion }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedImprovement, setSelectedImprovement] = useState(null);

  const analyzeDraft = async () => {
    setAnalyzing(true);
    try {
      const prompt = `You are an expert grant writer and funding proposal consultant. Analyze this document and provide comprehensive improvement suggestions.

DOCUMENT CONTENT:
${document.content}

DOCUMENT TYPE: ${document.doc_type}
CURRENT STATUS: ${document.status}

Provide detailed feedback on:
1. Clarity: Is the message clear and concise?
2. Tone: Is the tone appropriate for funding applications?
3. Compliance: Are there any red flags for grant/funding compliance?
4. Impact: Does it effectively communicate impact and value?
5. Structure: Is the content well-organized?

For each area, provide:
- A score (0-100)
- Specific issues found
- Concrete improvement suggestions
- Example rewrites for key sections that need work

Also provide an overall assessment and 3-5 priority action items.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_score: { type: 'number' },
            overall_assessment: { type: 'string' },
            areas: {
              type: 'object',
              properties: {
                clarity: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    issues: { type: 'array', items: { type: 'string' } },
                    suggestions: { type: 'array', items: { type: 'string' } }
                  }
                },
                tone: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    issues: { type: 'array', items: { type: 'string' } },
                    suggestions: { type: 'array', items: { type: 'string' } }
                  }
                },
                compliance: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    issues: { type: 'array', items: { type: 'string' } },
                    suggestions: { type: 'array', items: { type: 'string' } }
                  }
                },
                impact: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    issues: { type: 'array', items: { type: 'string' } },
                    suggestions: { type: 'array', items: { type: 'string' } }
                  }
                },
                structure: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    issues: { type: 'array', items: { type: 'string' } },
                    suggestions: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            },
            priority_actions: {
              type: 'array',
              items: { type: 'string' }
            },
            improved_sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  section_name: { type: 'string' },
                  original: { type: 'string' },
                  improved: { type: 'string' },
                  rationale: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
    setAnalyzing(false);
  };

  const generateImprovedDraft = async () => {
    setAnalyzing(true);
    try {
      const prompt = `You are an expert grant writer. Rewrite this entire document to improve clarity, tone, compliance, and impact.

ORIGINAL DOCUMENT:
${document.content}

DOCUMENT TYPE: ${document.doc_type}

Create a comprehensive rewrite that:
- Uses clear, concise language
- Maintains an appropriate professional tone for funding applications
- Emphasizes measurable impact and outcomes
- Follows grant writing best practices
- Preserves all factual information
- Improves organization and flow

Provide the complete rewritten document.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      setSelectedImprovement({
        type: 'full_rewrite',
        content: response,
        rationale: 'Complete AI-powered rewrite focusing on clarity, tone, and impact'
      });
    } catch (error) {
      console.error('Draft generation failed:', error);
    }
    setAnalyzing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'amber';
    return 'red';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return CheckCircle2;
    if (score >= 60) return AlertTriangle;
    return AlertTriangle;
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      {!suggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              AI Document Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              Get AI-powered suggestions to improve clarity, tone, compliance, and impact of your document.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={analyzeDraft}
                disabled={analyzing || !document.content}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Analyze Document
                  </>
                )}
              </Button>
              <Button
                onClick={generateImprovedDraft}
                disabled={analyzing || !document.content}
                variant="outline"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Improved Draft
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {suggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Overall Score */}
            <Card className={`border-2 border-${getScoreColor(suggestions.overall_score)}-200`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full bg-${getScoreColor(suggestions.overall_score)}-100`}>
                    {React.createElement(getScoreIcon(suggestions.overall_score), {
                      className: `w-6 h-6 text-${getScoreColor(suggestions.overall_score)}-600`
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">Overall Assessment</h3>
                      <Badge className={`bg-${getScoreColor(suggestions.overall_score)}-100 text-${getScoreColor(suggestions.overall_score)}-700`}>
                        {suggestions.overall_score}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{suggestions.overall_assessment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priority Actions */}
            <Alert className="bg-blue-50 border-blue-200">
              <Target className="w-4 h-4 text-blue-600" />
              <AlertDescription>
                <p className="font-medium text-blue-900 mb-2">Priority Actions:</p>
                <ul className="space-y-1">
                  {suggestions.priority_actions?.map((action, i) => (
                    <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">{i + 1}.</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>

            {/* Area Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(suggestions.areas || {}).map(([areaName, areaData]) => {
                const color = getScoreColor(areaData.score);
                return (
                  <Card key={areaName}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base capitalize">{areaName}</CardTitle>
                        <Badge className={`bg-${color}-100 text-${color}-700`}>
                          {areaData.score}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {areaData.issues?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-700 mb-1">Issues Found:</p>
                          <ul className="space-y-1">
                            {areaData.issues.slice(0, 2).map((issue, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                <span className="text-red-500 mt-0.5">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {areaData.suggestions?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-700 mb-1">Suggestions:</p>
                          <ul className="space-y-1">
                            {areaData.suggestions.slice(0, 2).map((suggestion, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Improved Sections */}
            {suggestions.improved_sections?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Improvements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestions.improved_sections.map((section, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{section.section_name}</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedImprovement(section)}
                        >
                          View Rewrite
                        </Button>
                      </div>
                      <p className="text-xs text-slate-600 italic">{section.rationale}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button
              variant="outline"
              onClick={() => setSuggestions(null)}
              className="w-full"
            >
              Run New Analysis
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Improvement Preview Modal */}
      {selectedImprovement && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">
                {selectedImprovement.type === 'full_rewrite' ? 'AI-Generated Draft' : selectedImprovement.section_name}
              </h3>
              <p className="text-sm text-slate-600 mt-1">{selectedImprovement.rationale}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedImprovement.original && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-2">Original</p>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {selectedImprovement.original}
                      </p>
                    </div>
                  </div>
                )}
                <div className={selectedImprovement.original ? '' : 'md:col-span-2'}>
                  <p className="text-xs font-medium text-slate-700 mb-2">Improved Version</p>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedImprovement.improved || selectedImprovement.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-2">
              <Button
                onClick={() => {
                  onApplySuggestion(selectedImprovement.improved || selectedImprovement.content);
                  setSelectedImprovement(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Apply This Improvement
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedImprovement(null)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}