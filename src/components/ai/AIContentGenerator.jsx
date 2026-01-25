import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AIContentGenerator({ section, organization, onInsert }) {
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async ({ section, context }) => {
      const prompts = {
        statement_of_need: `Write a compelling Statement of Need for a grant proposal. 

Organization: ${organization?.name}
Mission: ${organization?.mission_statement}
Context: ${context}

Create a 2-3 paragraph statement that:
1. Identifies the community problem/need
2. Provides relevant data/statistics
3. Shows urgency and impact
4. Connects to the organization's mission

Return plain text, professional grant writing style.`,

        budget_narrative: `Create a Budget Narrative explanation.

Context: ${context}

Explain the budget items clearly and justify costs. Show how expenses directly support program activities and outcomes. Be specific and transparent.`,

        program_description: `Write a Program Description.

Organization: ${organization?.name}
Context: ${context}

Describe:
1. Program overview and goals
2. Target population and geographic area
3. Key activities and timeline
4. Expected outcomes and impact measures`
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[section] || `Generate content for: ${section}\n\nContext: ${context}`
      });

      return response;
    },
    onSuccess: (data) => setGeneratedContent(data)
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-violet-900">
          <Sparkles className="w-5 h-5 text-violet-600" />
          AI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            AI-generated content is a starting point. Always review, customize, and verify accuracy.
          </AlertDescription>
        </Alert>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Provide context for "{section?.replace(/_/g, ' ')}"
          </label>
          <Textarea
            placeholder="e.g., Our program serves 50 high school students annually with dropout rates 30% above state average..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={() => generateMutation.mutate({ section, context })}
          disabled={!context.trim() || generateMutation.isPending}
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>

        {generatedContent && (
          <div className="space-y-3">
            <div className="p-4 bg-white border-2 border-violet-200 rounded-lg">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{generatedContent}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              {onInsert && (
                <Button onClick={() => onInsert(generatedContent)} className="flex-1 bg-violet-600">
                  Insert into Template
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}