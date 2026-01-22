import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, Download, Copy, CheckCircle2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const PROPOSAL_SECTIONS = [
  { id: 'executive_summary', label: 'Executive Summary', description: 'Brief overview of the proposal' },
  { id: 'problem_statement', label: 'Problem Statement', description: 'What issue are you addressing?' },
  { id: 'goals_objectives', label: 'Goals & Objectives', description: 'What do you aim to achieve?' },
  { id: 'methodology', label: 'Methodology/Approach', description: 'How will you accomplish this?' },
  { id: 'evaluation', label: 'Evaluation Plan', description: 'How will you measure success?' },
  { id: 'budget_narrative', label: 'Budget Narrative', description: 'Explanation of budget items' },
  { id: 'sustainability', label: 'Sustainability Plan', description: 'Long-term continuation strategy' },
  { id: 'organizational_capacity', label: 'Organizational Capacity', description: 'Why your org is qualified' }
];

export default function ProposalGenerator({ organization, fundingOpportunity, onSave }) {
  const [generating, setGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState(PROPOSAL_SECTIONS.map(s => s.id));
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedProposal, setGeneratedProposal] = useState(null);
  const [copied, setCopied] = useState(false);

  const toggleSection = (sectionId) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const generateProposal = async () => {
    if (selectedSections.length === 0) return;

    setGenerating(true);
    try {
      const sectionsToGenerate = PROPOSAL_SECTIONS.filter(s => selectedSections.includes(s.id));
      
      const prompt = `You are an expert grant proposal writer. Generate a comprehensive, professional grant proposal based on the following information.

ORGANIZATION PROFILE:
- Name: ${organization.name}
- Type: ${organization.type}
- Stage: ${organization.stage}
- Mission: ${organization.mission_statement || 'Not provided'}
- Programs: ${organization.programs_description || 'Not provided'}
- Target Population: ${organization.target_population || 'Not provided'}
- Geographic Reach: ${organization.geographic_reach || organization.city + ', ' + organization.state}
- Annual Budget: ${organization.annual_budget}
- Staff Structure: ${organization.staff_structure}

${fundingOpportunity ? `
FUNDING OPPORTUNITY:
- Funder: ${fundingOpportunity.funder_name}
- Title: ${fundingOpportunity.title}
- Type: ${fundingOpportunity.type}
- Amount Range: $${fundingOpportunity.amount_min}-$${fundingOpportunity.amount_max}
- Focus Areas: ${fundingOpportunity.sector_focus?.join(', ') || 'General'}
- Eligibility: ${fundingOpportunity.eligibility_summary || 'See guidelines'}
` : ''}

ADDITIONAL CONTEXT:
${additionalContext || 'None provided'}

Generate the following sections with professional, compelling content:
${sectionsToGenerate.map(s => `- ${s.label}: ${s.description}`).join('\n')}

Requirements:
- Use clear, concise language appropriate for grant proposals
- Include specific, measurable outcomes where applicable
- Demonstrate impact and community benefit
- Maintain professional tone throughout
- Ensure logical flow between sections
- Include realistic timelines and budgets where relevant
- Address funder priorities if opportunity is specified

Format each section with a clear heading and well-structured content.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            proposal_sections: {
              type: 'object',
              additionalProperties: { type: 'string' }
            },
            overall_strength: { type: 'string' },
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setGeneratedProposal(response);
    } catch (error) {
      console.error('Proposal generation failed:', error);
    }
    setGenerating(false);
  };

  const copyToClipboard = () => {
    if (!generatedProposal) return;
    
    const fullText = Object.entries(generatedProposal.proposal_sections)
      .map(([section, content]) => {
        const sectionData = PROPOSAL_SECTIONS.find(s => s.id === section);
        return `${sectionData?.label || section}\n\n${content}`;
      })
      .join('\n\n---\n\n');
    
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveProposal = async () => {
    if (!generatedProposal) return;
    
    const fullText = Object.entries(generatedProposal.proposal_sections)
      .map(([section, content]) => {
        const sectionData = PROPOSAL_SECTIONS.find(s => s.id === section);
        return `${sectionData?.label || section}\n\n${content}`;
      })
      .join('\n\n---\n\n');

    await base44.entities.Document.create({
      doc_name: `AI Generated Proposal - ${fundingOpportunity?.title || 'Draft'}`,
      doc_type: 'proposal',
      content: fullText,
      ai_assisted: true,
      status: 'draft'
    });

    if (onSave) {
      onSave();
    }
  };

  return (
    <div className="space-y-6">
      {!generatedProposal ? (
        <>
          {/* Section Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                Select Proposal Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROPOSAL_SECTIONS.map(section => (
                  <label
                    key={section.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSections.includes(section.id)
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{section.label}</p>
                      <p className="text-xs text-slate-600">{section.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Context (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Add any specific details, requirements, or focus areas you want emphasized in the proposal..."
                rows={4}
                className="mb-3"
              />
              <p className="text-xs text-slate-500">
                Examples: specific programs to highlight, target populations, partnership details, timeline constraints, etc.
              </p>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateProposal}
            disabled={generating || selectedSections.length === 0}
            size="lg"
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Proposal...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Proposal ({selectedSections.length} sections)
              </>
            )}
          </Button>

          {fundingOpportunity && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-800">
                <strong>Tailored to:</strong> {fundingOpportunity.title} by {fundingOpportunity.funder_name}
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <>
          {/* Generated Proposal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header Actions */}
            <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-900">Proposal Generated!</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy All
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveProposal}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save to Documents
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{generatedProposal.overall_strength}</p>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {generatedProposal.recommendations?.length > 0 && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription>
                  <p className="font-medium text-amber-900 mb-2">AI Recommendations:</p>
                  <ul className="space-y-1">
                    {generatedProposal.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="text-amber-600 font-bold">{i + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Proposal Sections */}
            {Object.entries(generatedProposal.proposal_sections).map(([sectionId, content]) => {
              const sectionData = PROPOSAL_SECTIONS.find(s => s.id === sectionId);
              return (
                <Card key={sectionId}>
                  <CardHeader className="bg-slate-50">
                    <CardTitle className="text-base">{sectionData?.label || sectionId}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{content}</p>
                  </CardContent>
                </Card>
              );
            })}

            {/* Generate New */}
            <Button
              variant="outline"
              onClick={() => setGeneratedProposal(null)}
              className="w-full"
            >
              Generate New Proposal
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
}