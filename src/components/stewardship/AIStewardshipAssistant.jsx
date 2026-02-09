import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AIStewardshipAssistant({ onPlanGenerated }) {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const handleGenerateFromPrompt = async () => {
    if (!prompt) {
      toast.error('Please describe your stewardship needs');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a donor stewardship expert. Based on the following description, create a comprehensive donor stewardship plan.

Organization Description: ${prompt}

Generate a complete stewardship plan including:
1. Appropriate donor segments based on giving levels
2. Recommended touchpoints for each segment
3. Suggested annual calendar of activities
4. Key stewardship principles

Format as a structured plan ready for implementation.`,
        response_json_schema: {
          type: 'object',
          properties: {
            plan_name: { type: 'string' },
            donor_segments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  segment_name: { type: 'string' },
                  criteria: { type: 'string' },
                  gift_range_min: { type: 'number' },
                  gift_range_max: { type: 'number' }
                }
              }
            },
            recommended_touchpoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  category: { type: 'string' },
                  timing: { type: 'string' },
                  segments: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            annual_highlights: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      onPlanGenerated(response);
      toast.success('Stewardship plan generated!');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePDF = async () => {
    if (!pdfUrl) {
      toast.error('Please provide a PDF URL');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this donor stewardship plan document and extract the key components: donor segments, touchpoints, calendar activities, and stewardship matrix. Structure the information for database storage.`,
        add_context_from_internet: false,
        file_urls: [pdfUrl],
        response_json_schema: {
          type: 'object',
          properties: {
            plan_name: { type: 'string' },
            donor_segments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  segment_name: { type: 'string' },
                  criteria: { type: 'string' }
                }
              }
            },
            touchpoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  touchpoint_name: { type: 'string' },
                  category: { type: 'string' },
                  timing: { type: 'string' }
                }
              }
            }
          }
        }
      });

      onPlanGenerated(response);
      toast.success('PDF analyzed successfully!');
    } catch (error) {
      console.error('PDF analysis error:', error);
      toast.error('Failed to analyze PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="w-5 h-5" />
            AI Stewardship Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Generate Plan from Description</h3>
            <Textarea
              placeholder="Describe your organization and stewardship needs... (e.g., 'We're a youth development nonprofit with 500 donors ranging from $25 to $50,000. We need a comprehensive stewardship plan with personalized touchpoints for major donors.')"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              onClick={handleGenerateFromPrompt}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Stewardship Plan
                </>
              )}
            </Button>
          </div>

          <div className="border-t pt-6 space-y-3">
            <h3 className="font-semibold text-slate-900">Analyze Existing PDF Plan</h3>
            <input
              type="text"
              placeholder="Paste PDF URL here..."
              className="w-full px-3 py-2 border rounded-lg"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
            />
            <Button
              onClick={handleAnalyzePDF}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Analyze PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}