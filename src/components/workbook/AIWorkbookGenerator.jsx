import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * AI Workbook Generator
 * Generates responses for all fields on a workbook page using enrollment + org profile context.
 * Props:
 *   page - the workbook page definition (with .fields array)
 *   enrollment - ProgramEnrollment record
 *   organizationProfile - Organization record
 *   onApply - callback(fieldId, value) called for each generated field
 */
export default function AIWorkbookGenerator({ page, enrollment, organizationProfile, onApply }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [expanded, setExpanded] = useState(false);

  if (!page?.fields?.length) return null;

  const buildContext = () => {
    const org = organizationProfile || {};
    const jot = enrollment?.jotform_data || {};
    return `
Organization Name: ${org.organization_name || enrollment?.organization_name || 'N/A'}
Organization Type: ${org.organization_type || jot.org_type || 'N/A'}
Mission Statement: ${org.mission_statement || 'N/A'}
Vision Statement: ${org.vision_statement || 'N/A'}
Organizational Values: ${org.organizational_values || 'N/A'}
Programs Offered: ${org.programs_offered || 'N/A'}
Target Population: ${org.target_population || 'N/A'}
Geographic Service Area: ${org.geographic_service_area || 'N/A'}
Annual People Served: ${org.annual_people_served || 'N/A'}
Annual Budget: ${org.annual_budget || jot.annual_revenue || 'N/A'}
Funding Sources: ${org.funding_sources || 'N/A'}
Grant Experience: ${org.grant_experience_level || jot.grant_experience || 'N/A'}
Funding Goals: ${org.funding_goals || jot.goals || 'N/A'}
Capacity Building Needs: ${org.capacity_building_needs || 'N/A'}
Technical Assistance Needed: ${org.technical_assistance_needed || 'N/A'}
Years in Business: ${org.founding_year || jot.years_in_business || 'N/A'}
Staff Count: ${org.staff_count || jot.employees || 'N/A'}
Executive Director: ${org.executive_director || 'N/A'}
Funding Barrier: ${jot.funding_barrier || 'N/A'}
Documents Needed: ${jot.documents_needed || 'N/A'}
Existing Documents: ${jot.existing_items || 'N/A'}
Participation Plan: ${jot.participation_plan || 'N/A'}
    `.trim();
  };

  const buildFieldDescriptions = () => {
    return page.fields
      .filter(f => ['textarea', 'input'].includes(f.type))
      .map(f => `- Field ID: "${f.id}" | Label: "${f.label}" | Type: ${f.type}${f.description ? ` | Hint: ${f.description}` : ''}`)
      .join('\n');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(null);
    try {
      const fieldDescriptions = buildFieldDescriptions();
      if (!fieldDescriptions) {
        toast.info('No text fields to generate for this page.');
        setLoading(false);
        return;
      }

      const prompt = `You are helping a nonprofit participant complete a funding readiness workbook section.

WORKBOOK SECTION: "${page.title}"
${page.subtitle ? `Section subtitle: "${page.subtitle}"` : ''}

PARTICIPANT ORGANIZATION CONTEXT:
${buildContext()}

FIELDS TO POPULATE (return ONLY a JSON object with field IDs as keys and generated text as values):
${fieldDescriptions}

Instructions:
- Use the organization context to write specific, professional, grant-ready responses
- Match the tone and length to each field type (input = short/concise, textarea = 2-4 sentences)
- If context is "N/A" for a relevant field, write a helpful placeholder the participant can edit
- Do NOT include any extra commentary, just the JSON object`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          additionalProperties: { type: 'string' }
        }
      });

      setGenerated(result);
      setExpanded(true);
      toast.success('AI responses generated! Review and apply below.');
    } catch (err) {
      toast.error('Failed to generate responses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAll = () => {
    if (!generated) return;
    Object.entries(generated).forEach(([fieldId, value]) => {
      onApply(fieldId, value);
    });
    toast.success('All AI responses applied to the workbook!');
    setGenerated(null);
    setExpanded(false);
  };

  const handleApplyOne = (fieldId, value) => {
    onApply(fieldId, value);
    setGenerated(prev => {
      const next = { ...prev };
      delete next[fieldId];
      if (Object.keys(next).length === 0) setExpanded(false);
      return Object.keys(next).length ? next : null;
    });
  };

  // Get field label from page definition
  const getFieldLabel = (fieldId) => {
    const field = page.fields?.find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  return (
    <div className="mb-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/30 overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-purple-900">AI Auto-Fill</span>
            <span className="text-xs text-purple-600 ml-2">Uses your organization profile to generate responses</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {generated && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-purple-600 hover:text-purple-800"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3"
          >
            {loading ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-3 h-3 mr-1" /> Generate All Fields</>
            )}
          </Button>
        </div>
      </div>

      {generated && expanded && (
        <div className="border-t border-purple-200 p-3 space-y-3 bg-white/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-purple-800">Review generated responses:</span>
            <Button
              size="sm"
              onClick={handleApplyAll}
              className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Apply All
            </Button>
          </div>
          {Object.entries(generated).map(([fieldId, value]) => (
            <div key={fieldId} className="bg-white rounded-lg border border-purple-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-500 mb-1">{getFieldLabel(fieldId)}</div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{value}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplyOne(fieldId, value)}
                  className="shrink-0 h-7 px-2 text-xs border-green-300 text-green-700 hover:bg-green-50"
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}