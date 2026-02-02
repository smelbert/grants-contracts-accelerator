import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIDocumentAnalyzer({ document, onTemplateSuggested }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeDocument = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document for:
1. Key summary (2-3 sentences)
2. Main topics and themes
3. Critical data points extracted
4. Compliance issues (formatting, required sections, tone)
5. Suggested template type based on content

Document Title: ${document.doc_name}
Document Type: ${document.doc_type}
Content: ${document.content}`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            topics: { type: "array", items: { type: "string" } },
            data_points: { type: "array", items: { 
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" }
              }
            }},
            compliance_issues: { type: "array", items: {
              type: "object",
              properties: {
                type: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" },
                suggestion: { type: "string" }
              }
            }},
            suggested_template_category: { type: "string" },
            recommended_improvements: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysis(response);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze document');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Document Analysis
          </CardTitle>
          {!analysis && (
            <Button 
              onClick={analyzeDocument}
              disabled={analyzing || !document.content}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {analysis && (
        <CardContent className="space-y-4">
          {/* Summary */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Summary
            </h4>
            <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border">
              {analysis.summary}
            </p>
          </div>

          {/* Topics */}
          {analysis.topics?.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Key Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.topics.map((topic, idx) => (
                  <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Data Points */}
          {analysis.data_points?.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Extracted Data Points
              </h4>
              <div className="bg-white p-3 rounded-lg border space-y-2">
                {analysis.data_points.map((point, idx) => (
                  <div key={idx} className="flex items-start justify-between text-sm">
                    <span className="font-medium text-slate-600">{point.label}:</span>
                    <span className="text-slate-900 text-right">{point.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Compliance Issues */}
          {analysis.compliance_issues?.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Compliance & Formatting Issues
              </h4>
              <div className="space-y-2">
                {analysis.compliance_issues.map((issue, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border-2 ${getSeverityColor(issue.severity)}`}>
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-sm capitalize">{issue.type}</span>
                      <Badge variant="outline" className="text-xs">{issue.severity}</Badge>
                    </div>
                    <p className="text-sm mb-2">{issue.description}</p>
                    <p className="text-xs font-medium flex items-start gap-1">
                      <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{issue.suggestion}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template Suggestion */}
          {analysis.suggested_template_category && (
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Suggested Template Category
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Based on your content, we recommend using a <strong>{analysis.suggested_template_category}</strong> template.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onTemplateSuggested?.(analysis.suggested_template_category)}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                View Templates
              </Button>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommended_improvements?.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Recommended Improvements
              </h4>
              <ul className="space-y-2">
                {analysis.recommended_improvements.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-600 mt-1">•</span>
                    <span className="text-slate-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setAnalysis(null)}
            className="w-full"
          >
            Run New Analysis
          </Button>
        </CardContent>
      )}
    </Card>
  );
}