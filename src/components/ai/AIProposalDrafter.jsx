import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';

export default function AIProposalDrafter({ opportunity, organization, onDraftGenerated }) {
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [copied, setCopied] = useState(false);

  const generateDraftMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Generate a draft proposal section for the following grant opportunity based on the organization's profile:

ORGANIZATION:
- Name: ${organization.name}
- Mission: ${organization.mission_statement || 'Not provided'}
- Programs: ${organization.programs_description || 'Not provided'}
- Target Population: ${organization.target_population || 'Not provided'}
- Geographic Reach: ${organization.geographic_reach || 'Not provided'}

OPPORTUNITY:
- Title: ${opportunity.title}
- Funder: ${opportunity.funder_name}
- Description: ${opportunity.description || 'Not provided'}
- Eligibility: ${opportunity.eligibility_summary || 'Not provided'}
- Geographic Focus: ${opportunity.geographic_focus || 'Not specified'}

Generate a compelling 2-3 paragraph draft for the "Statement of Need" or "Program Description" section. Make it specific to this organization and opportunity, using the organization's data. Keep it professional and grant-ready.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      return result;
    },
    onSuccess: (data) => {
      setGeneratedDraft(data);
      onDraftGenerated?.(data);
    }
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          AI Proposal Drafter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedDraft ? (
          <>
            <p className="text-sm text-slate-600">
              Let AI draft a proposal section tailored to this opportunity and your organization's profile.
            </p>
            <Button
              onClick={() => generateDraftMutation.mutate()}
              disabled={generateDraftMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 w-full"
            >
              {generateDraftMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Draft...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Draft
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Alert className="bg-emerald-100 border-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <AlertDescription className="text-emerald-900">
                AI has generated a draft based on your organization's profile. Review and edit as needed.
              </AlertDescription>
            </Alert>
            <Textarea
              value={generatedDraft}
              onChange={(e) => setGeneratedDraft(e.target.value)}
              rows={10}
              className="font-sans"
            />
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button
                onClick={() => generateDraftMutation.mutate()}
                variant="outline"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}