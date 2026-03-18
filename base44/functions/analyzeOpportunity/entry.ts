import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_urls, source_url, text_content } = await req.json();

    let contentToAnalyze = '';

    // Prepare content for LLM
    if (text_content) {
      contentToAnalyze = text_content;
    }

    if (source_url) {
      contentToAnalyze = source_url;
    }

    if (!contentToAnalyze && !file_urls?.length) {
      return Response.json({ error: 'No content to analyze' }, { status: 400 });
    }

    // Call LLM to extract opportunities
    const prompt = `You are an expert at identifying and extracting funding opportunities from documents, URLs, and text.

Analyze the provided content and extract ALL funding opportunities (grants, RFPs, RFQs, RFIs, contracts, donor programs, public funds, etc.).

For EACH opportunity found, extract and return a JSON object with these fields:
{
  "title": "Opportunity name/title",
  "funder_name": "Name of funder/organization issuing this",
  "type": "grant|contract|rfp|rfq|rfi|donor_program|public_fund",
  "funding_lane": "grants|contracts|donors|public_funds",
  "description": "2-3 sentence summary of what this funds",
  "eligibility_summary": "Who can apply (org type, stage, requirements)",
  "eligibility_requirements": "Detailed eligibility criteria if available",
  "amount_min": number or null,
  "amount_max": number or null,
  "deadline": "YYYY-MM-DD format or null",
  "deadline_full": "YYYY-MM-DD format if different from LOI deadline",
  "rolling_deadline": boolean,
  "geographic_focus": "Geographic area or 'National/International' or null",
  "geographic_restrictions": "Any geographic restrictions or null",
  "sector_focus": ["array of sectors if specified"],
  "required_org_types": ["nonprofit", "for_profit", etc],
  "required_stages": ["seed", "growth", "scale", etc],
  "source_url": "URL if available or null",
  "application_url": "Direct application URL if available or null"
}

IMPORTANT:
- Extract EVERY opportunity mentioned, don't be selective
- Use null for fields you can't find
- Be conservative: only extract amounts explicitly stated
- If there's a URL provided, it is likely the source_url
- Return as valid JSON array: [{ ...opportunity1 }, { ...opportunity2 }]
- DO NOT include any text before or after the JSON

Content to analyze:
${contentToAnalyze}
${file_urls?.length ? `\n\nFile URLs (process as attachments/context): ${file_urls.join(', ')}` : ''}`;

    let response;

    if (file_urls?.length) {
      response = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        file_urls,
        response_json_schema: {
          type: 'object',
          properties: {
            opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  funder_name: { type: 'string' },
                  type: { type: 'string' },
                  funding_lane: { type: 'string' },
                  description: { type: 'string' },
                  eligibility_summary: { type: 'string' },
                  amount_min: { type: 'number' },
                  amount_max: { type: 'number' },
                  deadline: { type: 'string' },
                  rolling_deadline: { type: 'boolean' },
                  geographic_focus: { type: 'string' },
                  sector_focus: { type: 'array', items: { type: 'string' } },
                  required_org_types: { type: 'array', items: { type: 'string' } },
                  source_url: { type: 'string' }
                }
              }
            }
          }
        }
      });
    } else {
      response = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: source_url ? true : false,
        model: source_url ? 'gemini_3_flash' : undefined,
        response_json_schema: {
          type: 'object',
          properties: {
            opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  funder_name: { type: 'string' },
                  type: { type: 'string' },
                  funding_lane: { type: 'string' },
                  description: { type: 'string' },
                  eligibility_summary: { type: 'string' },
                  amount_min: { type: 'number' },
                  amount_max: { type: 'number' },
                  deadline: { type: 'string' },
                  rolling_deadline: { type: 'boolean' },
                  geographic_focus: { type: 'string' },
                  sector_focus: { type: 'array', items: { type: 'string' } },
                  required_org_types: { type: 'array', items: { type: 'string' } },
                  source_url: { type: 'string' }
                }
              }
            }
          }
        }
      });
    }

    const opportunities = response?.opportunities || [];

    // Validate and clean opportunities
    const validated = opportunities
      .filter(opp => opp.title && opp.type && opp.funding_lane)
      .map(opp => ({
        ...opp,
        source_url: source_url || opp.source_url || null,
        rolling_deadline: opp.rolling_deadline || false
      }));

    return Response.json({ opportunities: validated });
  } catch (error) {
    console.error('analyzeOpportunity error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});