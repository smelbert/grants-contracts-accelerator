import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Loader2, Copy, CheckCircle2, Lightbulb, 
  TrendingUp, FileText, RefreshCw, Wand2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIProposalDrafter() {
  const [mode, setMode] = useState('generate'); // generate, refine, keywords, strengthen
  const [projectDescription, setProjectDescription] = useState('');
  const [existingText, setExistingText] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [characterLimit, setCharacterLimit] = useState('');
  const [rfpGuidelines, setRfpGuidelines] = useState('');
  const [result, setResult] = useState(null);

  const aiWriterMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('aiGrantWriter', data);
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('AI processing complete!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleGenerate = () => {
    if (!projectDescription.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    aiWriterMutation.mutate({
      action: 'generate',
      project_description: projectDescription,
      section_name: sectionName || 'Project Narrative',
      character_limit: characterLimit ? parseInt(characterLimit) : null,
      rfp_guidelines: rfpGuidelines || null,
      tone_preference: 'professional yet passionate'
    });
  };

  const handleRefine = () => {
    if (!existingText.trim()) {
      toast.error('Please enter text to refine');
      return;
    }

    aiWriterMutation.mutate({
      action: 'refine',
      existing_text: existingText,
      character_limit: characterLimit ? parseInt(characterLimit) : null,
      rfp_guidelines: rfpGuidelines || null
    });
  };

  const handleSuggestKeywords = () => {
    const textToAnalyze = existingText.trim() || projectDescription.trim();
    if (!textToAnalyze) {
      toast.error('Please enter text to analyze');
      return;
    }

    aiWriterMutation.mutate({
      action: 'suggest_keywords',
      existing_text: existingText || null,
      project_description: projectDescription || null,
      rfp_guidelines: rfpGuidelines || null
    });
  };

  const handleStrengthen = () => {
    if (!existingText.trim()) {
      toast.error('Please enter text to strengthen');
      return;
    }

    aiWriterMutation.mutate({
      action: 'strengthen',
      existing_text: existingText,
      section_name: sectionName || 'Section',
      character_limit: characterLimit ? parseInt(characterLimit) : null,
      rfp_guidelines: rfpGuidelines || null
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const isLoading = aiWriterMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#AC1A5B]" />
            AI Grant Writing Assistant
          </CardTitle>
          <CardDescription>
            Generate compelling proposals, refine text, and get strategic suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="refine">Refine</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="strengthen">Strengthen</TabsTrigger>
            </TabsList>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-4">
              <div>
                <Label htmlFor="project-desc">Project Description *</Label>
                <Textarea
                  id="project-desc"
                  placeholder="Describe your project, its goals, target population, expected outcomes..."
                  rows={5}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="section-name">Section Name</Label>
                  <Input
                    id="section-name"
                    placeholder="e.g., Project Narrative, Goals & Objectives"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="char-limit">Character Limit</Label>
                  <Input
                    id="char-limit"
                    type="number"
                    placeholder="e.g., 3000"
                    value={characterLimit}
                    onChange={(e) => setCharacterLimit(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rfp-guidelines">RFP Guidelines (Optional)</Label>
                <Textarea
                  id="rfp-guidelines"
                  placeholder="Paste specific RFP requirements, evaluation criteria, or funder priorities..."
                  rows={3}
                  value={rfpGuidelines}
                  onChange={(e) => setRfpGuidelines(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Draft
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Refine Tab */}
            <TabsContent value="refine" className="space-y-4">
              <div>
                <Label htmlFor="existing-text">Existing Text *</Label>
                <Textarea
                  id="existing-text"
                  placeholder="Paste your existing grant text here..."
                  rows={8}
                  value={existingText}
                  onChange={(e) => setExistingText(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Current: {existingText.length} characters
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="char-limit-refine">Character Limit</Label>
                  <Input
                    id="char-limit-refine"
                    type="number"
                    placeholder="e.g., 3000"
                    value={characterLimit}
                    onChange={(e) => setCharacterLimit(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="rfp-refine">RFP Guidelines</Label>
                  <Input
                    id="rfp-refine"
                    placeholder="Optional"
                    value={rfpGuidelines}
                    onChange={(e) => setRfpGuidelines(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button onClick={handleRefine} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refine Text
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="space-y-4">
              <div>
                <Label htmlFor="text-analyze">Text to Analyze *</Label>
                <Textarea
                  id="text-analyze"
                  placeholder="Paste your proposal text or project description..."
                  rows={6}
                  value={existingText}
                  onChange={(e) => setExistingText(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="rfp-keywords">RFP Guidelines (Optional)</Label>
                <Textarea
                  id="rfp-keywords"
                  placeholder="Paste RFP requirements to get targeted keyword suggestions..."
                  rows={3}
                  value={rfpGuidelines}
                  onChange={(e) => setRfpGuidelines(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleSuggestKeywords} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get Suggestions
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Strengthen Tab */}
            <TabsContent value="strengthen" className="space-y-4">
              <div>
                <Label htmlFor="text-strengthen">Text to Strengthen *</Label>
                <Textarea
                  id="text-strengthen"
                  placeholder="Paste the section you want to make more compelling..."
                  rows={6}
                  value={existingText}
                  onChange={(e) => setExistingText(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="section-strengthen">Section Name</Label>
                  <Input
                    id="section-strengthen"
                    placeholder="e.g., Impact Statement"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="char-limit-strengthen">Character Limit</Label>
                  <Input
                    id="char-limit-strengthen"
                    type="number"
                    placeholder="Optional"
                    value={characterLimit}
                    onChange={(e) => setCharacterLimit(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button onClick={handleStrengthen} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Strengthening...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Strengthen Section
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Display */}
      {result && (
        <Card className="border-[#AC1A5B]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                AI Results
              </span>
              {(result.draft_text || result.refined_text || result.strengthened_text) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(result.draft_text || result.refined_text || result.strengthened_text)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Generated/Refined/Strengthened Text */}
            {(result.draft_text || result.refined_text || result.strengthened_text) && (
              <div>
                <Label className="font-semibold mb-2 block">
                  {result.draft_text ? 'Generated Draft' : result.refined_text ? 'Refined Text' : 'Strengthened Text'}
                </Label>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {result.draft_text || result.refined_text || result.strengthened_text}
                  </p>
                </div>
                {result.character_count && (
                  <p className="text-sm text-slate-600 mt-2">
                    {result.character_count} characters
                    {characterLimit && ` (${((result.character_count / parseInt(characterLimit)) * 100).toFixed(1)}% of limit)`}
                  </p>
                )}
              </div>
            )}

            {/* Key Strengths */}
            {result.key_strengths?.length > 0 && (
              <div>
                <Label className="font-semibold mb-2 block">Key Strengths</Label>
                <div className="space-y-1">
                  {result.key_strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changes Made */}
            {result.changes_made?.length > 0 && (
              <div>
                <Label className="font-semibold mb-2 block">Changes Made</Label>
                <div className="space-y-1">
                  {result.changes_made.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <RefreshCw className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {change}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Suggestions */}
            {result.suggested_keywords?.length > 0 && (
              <div>
                <Label className="font-semibold mb-2 block">Suggested Keywords</Label>
                <div className="flex flex-wrap gap-2">
                  {result.suggested_keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Data Points */}
            {result.recommended_data_points?.length > 0 && (
              <div>
                <Label className="font-semibold mb-2 block">Recommended Data Points</Label>
                <div className="space-y-1">
                  {result.recommended_data_points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <TrendingUp className="w-4 h-4 text-[#AC1A5B] mt-0.5 flex-shrink-0" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Impact Phrases */}
            {result.impact_phrases?.length > 0 && (
              <div>
                <Label className="font-semibold mb-2 block">Powerful Impact Phrases</Label>
                <div className="flex flex-wrap gap-2">
                  {result.impact_phrases.map((phrase, idx) => (
                    <Badge key={idx} className="bg-[#AC1A5B] text-white">{phrase}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Elements */}
            {result.missing_elements?.length > 0 && (
              <div>
                <Label className="font-semibold mb-2 block">Missing Elements</Label>
                <div className="space-y-1">
                  {result.missing_elements.map((element, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                      <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {element}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Improvements */}
            {result.key_improvements?.length > 0 && (
              <div>
                <Label className="font-semibold mb-2 block">Key Improvements</Label>
                <div className="space-y-1">
                  {result.key_improvements.map((improvement, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <Sparkles className="w-4 h-4 text-[#AC1A5B] mt-0.5 flex-shrink-0" />
                      {improvement}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Summary */}
            {result.improvement_summary && (
              <div>
                <Label className="font-semibold mb-2 block">Improvement Summary</Label>
                <p className="text-sm text-slate-700">{result.improvement_summary}</p>
              </div>
            )}

            {/* Impact Analysis */}
            {result.impact_analysis && (
              <div>
                <Label className="font-semibold mb-2 block">Impact Analysis</Label>
                <p className="text-sm text-slate-700">{result.impact_analysis}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}