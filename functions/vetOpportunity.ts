import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { opportunity_id } = await req.json();

    if (!opportunity_id) {
      return Response.json({ error: 'opportunity_id is required' }, { status: 400 });
    }

    // Get the opportunity
    const opportunity = await base44.asServiceRole.entities.FundingOpportunity.get(opportunity_id);

    if (!opportunity) {
      return Response.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Use AI to vet the opportunity
    const vettingPrompt = `You are a fraud detection expert reviewing funding opportunities for legitimacy. Analyze this opportunity and determine if it appears legitimate or potentially fraudulent.

Opportunity Details:
- Title: ${opportunity.title || 'N/A'}
- Funder: ${opportunity.funder_name || 'N/A'}
- Type: ${opportunity.type || 'N/A'}
- Amount Range: $${opportunity.amount_min || 0} - $${opportunity.amount_max || 0}
- Description: ${opportunity.description || 'N/A'}
- Source: ${opportunity.source_platform || 'Unknown'}
- Application URL: ${opportunity.application_url || 'N/A'}
- Eligibility: ${opportunity.eligibility_summary || 'N/A'}

Red flags to check for:
1. Unrealistic funding amounts (e.g., $1M+ for small grants)
2. Vague or generic descriptions
3. Missing or suspicious contact information
4. Requests for upfront fees or personal financial information
5. Poor grammar or unprofessional language
6. Unverifiable funder names or organizations
7. Too-good-to-be-true promises
8. Suspicious URLs or domains

Provide:
1. legitimacy_score (0-100, where 100 is definitely legitimate)
2. is_legitimate (boolean)
3. red_flags (array of specific concerns found)
4. verification_notes (summary of your analysis)
5. recommended_action (approve/flag_review/reject)`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: vettingPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          legitimacy_score: { type: 'number' },
          is_legitimate: { type: 'boolean' },
          red_flags: { 
            type: 'array',
            items: { type: 'string' }
          },
          verification_notes: { type: 'string' },
          recommended_action: { 
            type: 'string',
            enum: ['approve', 'flag_review', 'reject']
          }
        }
      }
    });

    // Update the opportunity with vetting results
    const updateData = {
      ai_vetted: true,
      ai_vetting_date: new Date().toISOString(),
      ai_vetting_notes: JSON.stringify({
        score: aiResponse.legitimacy_score,
        red_flags: aiResponse.red_flags,
        notes: aiResponse.verification_notes,
        action: aiResponse.recommended_action,
        is_legitimate: aiResponse.is_legitimate
      })
    };

    await base44.asServiceRole.entities.FundingOpportunity.update(opportunity_id, updateData);

    console.log(`✅ Vetted opportunity ${opportunity_id}: ${aiResponse.recommended_action} (score: ${aiResponse.legitimacy_score})`);

    return Response.json({
      success: true,
      vetting_result: aiResponse,
      opportunity_id
    });

  } catch (error) {
    console.error('❌ Error vetting opportunity:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});