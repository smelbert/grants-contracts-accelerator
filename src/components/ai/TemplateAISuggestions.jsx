import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, FileText, Target } from 'lucide-react';

export default function TemplateAISuggestions({ onTemplateSelect, organization }) {
  const [projectDescription, setProjectDescription] = useState('');
  const [suggestions, setSuggestions] = useState(null);

  const getSuggestionsMutation = useMutation({
    mutationFn: async (description) => {
      const prompt = `You are a grant and funding expert. Based on this project description, suggest the top 3 most relevant template types they should use.

Organization Info:
- Type: ${organization?.type || 'Not specified'}
- Stage: ${organization?.stage || 'Not specified'}
- Funding lanes: ${organization?.funding_lanes_enabled?.join(', ') || 'All'}

Project Description:
${description}

Suggest 3 specific template types (e.g., "Logic Model", "Budget Narrative", "Statement of Need") with a brief reason why each is important for this project.

Return as JSON: {"suggestions": [{"template_name": "...", "reason": "...", "priority": "high|medium|low"}]}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  template_name: { type: 'string' },
                  reason: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => setSuggestions(data.suggestions)
  });

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Template Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Describe your project or funding goal:</label>
          <Textarea
            placeholder="e.g., We're seeking $50K to launch a youth mentorship program in rural communities..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={() => getSuggestionsMutation.mutate(projectDescription)}
          disabled={!projectDescription.trim() || getSuggestionsMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {getSuggestionsMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Suggestions
            </>
          )}
        </Button>

        {suggestions && (
          <div className="space-y-3 pt-4 border-t border-purple-200">
            <p className="text-sm font-semibold text-purple-900">Recommended Templates:</p>
            {suggestions.map((suggestion, idx) => (
              <Card key={idx} className="border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-slate-900">{suggestion.template_name}</span>
                    </div>
                    <Badge className={
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{suggestion.reason}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onTemplateSelect?.(suggestion.template_name)}
                    className="w-full"
                  >
                    <Target className="w-3 h-3 mr-2" />
                    Find This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}