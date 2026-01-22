import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, AlertTriangle, CheckCircle2, Copy, RefreshCw, Save, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CONTENT_TYPES = [
  { value: 'mission_statement', label: 'Mission Statement', description: 'A clear, compelling statement of your purpose' },
  { value: 'org_background', label: 'Organizational Background', description: 'History and context of your organization' },
  { value: 'program_description', label: 'Program Description', description: 'Detailed description of your programs or services' },
  { value: 'statement_of_need', label: 'Statement of Need', description: 'Why your work matters and who it serves' },
  { value: 'equity_narrative', label: 'Equity & Impact Narrative', description: 'Your commitment to equity and community impact' },
  { value: 'capability_statement', label: 'Capability Statement', description: 'Your qualifications for contracts (for-profit/contracts)' },
  { value: 'community_impact', label: 'Community Impact Statement', description: 'The tangible impact of your work' },
];

export default function ContentGenerator({ organization, onSave }) {
  const [contentType, setContentType] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [missingData, setMissingData] = useState([]);
  const [isApproved, setIsApproved] = useState(false);

  const checkMissingData = () => {
    const missing = [];
    if (!organization?.name) missing.push('Organization name');
    if (!organization?.type) missing.push('Organization type');
    if (!organization?.mission_statement && contentType !== 'mission_statement') missing.push('Mission statement');
    if (!organization?.programs_description && ['program_description', 'community_impact'].includes(contentType)) missing.push('Programs description');
    if (!organization?.target_population) missing.push('Target population');
    if (!organization?.geographic_reach) missing.push('Geographic reach');
    return missing;
  };

  const generateContent = async () => {
    if (!contentType) return;

    const missing = checkMissingData();
    setMissingData(missing);

    setIsGenerating(true);
    setWarnings([]);
    setIsApproved(false);

    try {
      const selectedType = CONTENT_TYPES.find(t => t.value === contentType);
      
      const prompt = `You are an ethical grant writing assistant. Generate a ${selectedType.label} for the following organization.

IMPORTANT GUIDELINES:
- Only use factual information provided below
- Do NOT fabricate outcomes, statistics, or partnerships
- If information is missing, note it rather than inventing it
- Use professional, clear language without exaggeration
- Avoid "grant speak" clichés like "leverage synergies" or "move the needle"

Organization Information:
- Name: ${organization?.name || '[NAME MISSING]'}
- Type: ${organization?.type || '[TYPE MISSING]'}
- Stage: ${organization?.stage || '[STAGE MISSING]'}
- Location: ${organization?.city || ''}, ${organization?.state || '[LOCATION MISSING]'}
- Mission: ${organization?.mission_statement || '[MISSION MISSING - will create one]'}
- Programs: ${organization?.programs_description || '[PROGRAMS NOT YET DEFINED]'}
- Target Population: ${organization?.target_population || '[NOT SPECIFIED]'}
- Geographic Reach: ${organization?.geographic_reach || '[NOT SPECIFIED]'}
- Year Founded: ${organization?.year_founded || '[NOT SPECIFIED]'}

Generate a ${selectedType.description}. Be authentic and grounded in the actual information provided.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            warnings: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Any concerns about the content or missing information'
            },
            confidence_level: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Confidence in the generated content based on available data'
            }
          }
        }
      });

      setGeneratedContent(response.content);
      
      const allWarnings = [...(response.warnings || [])];
      if (missing.length > 0) {
        allWarnings.unshift(`Missing data: ${missing.join(', ')}. Content may be incomplete.`);
      }
      if (response.confidence_level === 'low') {
        allWarnings.unshift('Low confidence: Not enough organizational data to generate accurate content.');
      }
      setWarnings(allWarnings);
    } catch (error) {
      console.error('Generation error:', error);
      setWarnings(['Failed to generate content. Please try again.']);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave({
        content_type: contentType,
        content: generatedContent,
        is_approved: true,
        ai_warnings: warnings,
        missing_data_flags: missingData,
      });
    }
    setIsApproved(true);
  };

  return (
    <div className="space-y-6">
      {/* Content Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">What would you like to generate?</label>
        <Select value={contentType} onValueChange={setContentType}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <div className="py-1">
                  <p className="font-medium">{type.label}</p>
                  <p className="text-xs text-slate-500">{type.description}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateContent}
        disabled={!contentType || isGenerating}
        className="w-full bg-violet-600 hover:bg-violet-700 h-12"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Content
          </>
        )}
      </Button>

      {/* Warnings */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Content */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative">
              <Textarea
                value={generatedContent}
                onChange={(e) => {
                  setGeneratedContent(e.target.value);
                  setIsApproved(false);
                }}
                className="min-h-[200px] pr-12"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Confirmation required notice */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700 text-sm">
                Please review and edit the content above before saving. AI-generated content should be verified for accuracy.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={generateContent}
                disabled={isGenerating}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={handleSave}
                disabled={isApproved}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isApproved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Confirm & Save
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}