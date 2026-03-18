import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { keyword = '', max_results = 25 } = await req.json();

    console.log(`Pulling grants from Grants.gov: ${keyword || 'all'}`);

    // Use AI to search and extract grants.gov opportunities
    const prompt = `
Search grants.gov for current federal grant opportunities.

${keyword ? `Focus on: ${keyword}` : 'Get a diverse mix of federal grants'}

For each opportunity, extract:
1. Opportunity title
2. Agency/department name
3. Opportunity number (CFDA number if available)
4. Award ceiling (max amount)
5. Award floor (min amount)
6. Close date
7. Program description
8. Eligibility summary
9. Link to full announcement

Visit grants.gov and return up to ${max_results} currently open opportunities.
Only include opportunities that are open NOW (not closed or upcoming).
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
                agency: { type: "string" },
                opportunity_number: { type: "string" },
                award_ceiling: { type: "number" },
                award_floor: { type: "number" },
                close_date: { type: "string" },
                description: { type: "string" },
                eligibility: { type: "string" },
                url: { type: "string" },
                cfda_numbers: { 
                  type: "array",
                  items: { type: "string" }
                },
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
    console.log(`Found ${opportunities.length} opportunities from Grants.gov`);

    // Store as pending approval
    const created = [];
    for (const opp of opportunities) {
      try {
        // Check if already exists by opportunity number
        if (opp.opportunity_number) {
          const existing = await base44.asServiceRole.entities.FundingOpportunity.filter({
            source_id: opp.opportunity_number
          });
          if (existing.length > 0) {
            console.log(`Skipping duplicate: ${opp.opportunity_number}`);
            continue;
          }
        }

        const newOpp = await base44.asServiceRole.entities.FundingOpportunity.create({
          title: opp.title,
          funder_name: opp.agency,
          type: 'grant',
          funding_lane: 'public_funds',
          amount_min: opp.award_floor || 0,
          amount_max: opp.award_ceiling || 0,
          deadline: opp.close_date,
          description: opp.description,
          eligibility_summary: opp.eligibility,
          application_url: opp.url,
          source_url: opp.url,
          source_platform: 'grants.gov',
          source_id: opp.opportunity_number,
          categories: opp.categories || [],
          sector_focus: opp.categories || [],
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
      skipped: opportunities.length - created.length,
      opportunities: created
    });

  } catch (error) {
    console.error('Pull Grants.gov error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});