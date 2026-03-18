import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { query, funding_type = 'all', max_results = 10 } = await req.json();

    console.log(`Scanning for opportunities: ${query || 'general search'}`);

    // Build search query
    const searchQueries = [];
    
    if (funding_type === 'all' || funding_type === 'grant') {
      searchQueries.push(`federal grants ${query || ''}`);
      searchQueries.push(`foundation grants ${query || ''}`);
    }
    if (funding_type === 'all' || funding_type === 'rfp') {
      searchQueries.push(`government RFP ${query || ''}`);
    }
    if (funding_type === 'all' || funding_type === 'contract') {
      searchQueries.push(`government contracts ${query || ''}`);
    }

    const prompt = `
You are a funding opportunity researcher. Search the web for current funding opportunities including grants, RFPs, RFIs, and RFQs.

Search criteria:
- Type: ${funding_type === 'all' ? 'grants, RFPs, contracts' : funding_type}
- Focus: ${query || 'general opportunities for nonprofits and small businesses'}
- Only include opportunities that are currently open (not closed)
- Include government and foundation opportunities

For each opportunity found, extract:
1. Opportunity title
2. Funder/Agency name
3. Opportunity type (grant, rfp, contract, etc.)
4. Award amount or range
5. Application deadline
6. Brief description
7. Eligibility requirements
8. Source URL

Return up to ${max_results} opportunities.
`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                funder_name: { type: "string" },
                opportunity_type: { type: "string" },
                award_amount_min: { type: "number" },
                award_amount_max: { type: "number" },
                deadline: { type: "string" },
                description: { type: "string" },
                eligibility: { type: "string" },
                source_url: { type: "string" },
                categories: { 
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });

    const opportunities = response.opportunities || [];
    console.log(`Found ${opportunities.length} opportunities`);

    // Store opportunities as pending approval
    const created = [];
    for (const opp of opportunities) {
      try {
        const newOpp = await base44.asServiceRole.entities.FundingOpportunity.create({
          title: opp.title,
          funder_name: opp.funder_name,
          opportunity_type: opp.opportunity_type || 'grant',
          award_amount_min: opp.award_amount_min || 0,
          award_amount_max: opp.award_amount_max || 0,
          deadline: opp.deadline,
          description: opp.description,
          eligibility_requirements: opp.eligibility,
          application_url: opp.source_url,
          categories: opp.categories || [],
          status: 'pending_approval',
          ai_scanned: true,
          scanned_date: new Date().toISOString()
        });
        created.push(newOpp);
      } catch (err) {
        console.error('Failed to create opportunity:', err);
      }
    }

    return Response.json({
      success: true,
      found: opportunities.length,
      created: created.length,
      opportunities: created
    });

  } catch (error) {
    console.error('Scan opportunities error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});