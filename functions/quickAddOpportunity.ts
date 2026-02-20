import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { input_text, url } = await req.json();

    if (!input_text && !url) {
      return Response.json({ error: 'Either input_text or url required' }, { status: 400 });
    }

    console.log('Quick add opportunity from:', url || 'text input');

    const prompt = url 
      ? `Extract funding opportunity details from this URL: ${url}

Visit the URL and extract all relevant information about this funding opportunity.`
      : `Extract funding opportunity details from this text:

${input_text}`;

    const fullPrompt = `${prompt}

Extract the following information:
- Title of the opportunity
- Funder/Agency name
- Opportunity type (grant, rfp, rfi, rfq, contract)
- Award amount (min and max if range provided)
- Application deadline
- Description
- Eligibility requirements
- Application URL
- Geographic restrictions (if any)
- Categories/focus areas

If information is not available, use null or empty string.
`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      add_context_from_internet: !!url,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          funder_name: { type: "string" },
          opportunity_type: { type: "string" },
          award_amount_min: { type: "number" },
          award_amount_max: { type: "number" },
          deadline: { type: "string" },
          description: { type: "string" },
          eligibility_requirements: { type: "string" },
          application_url: { type: "string" },
          geographic_restrictions: { type: "string" },
          categories: { 
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    console.log('Extracted opportunity data');

    return Response.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Quick add opportunity error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});