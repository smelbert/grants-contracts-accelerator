import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization_id, project_description, funding_amount_needed, sector_focus } = await req.json();

    console.log('Starting AI funder matching...');

    // Fetch organization profile
    const organization = organization_id 
      ? await base44.entities.Organization.get(organization_id)
      : (await base44.entities.Organization.filter({ created_by: user.email }))[0];

    if (!organization) {
      return Response.json({ error: 'Organization profile not found. Please complete your profile first.' }, { status: 404 });
    }

    // Fetch all funders (prioritize AI-researched ones)
    const allFunders = await base44.asServiceRole.entities.Funder.list();
    console.log(`Analyzing ${allFunders.length} funders...`);

    // Fetch past funding successes for this organization
    const pastGrants = await base44.entities.GrantApplication.filter({
      organization_id: organization.id,
      status: 'awarded'
    }).catch(() => []);

    // Fetch organization's 990 data if available
    const org990Data = await base44.entities.Funder990.filter({
      funder_name: organization.organization_name
    }).catch(() => []);

    // Build comprehensive organization context
    const organizationContext = {
      name: organization.organization_name,
      mission: organization.mission_statement,
      budget_size: organization.annual_budget,
      geographic_location: organization.location,
      sector: organization.sector || sector_focus,
      focus_areas: organization.focus_areas || [],
      organization_type: organization.organization_type,
      project_description: project_description,
      funding_needed: funding_amount_needed,
      past_successes: pastGrants.map(g => ({
        funder: g.funder_name,
        amount: g.amount_requested,
        purpose: g.project_title
      })),
      staff_capacity: organization.staff_count,
      years_in_operation: organization.years_in_operation
    };

    console.log('Organization context built:', organizationContext);

    // Process funders in batches to avoid token limits
    const batchSize = 10;
    const allMatches = [];

    for (let i = 0; i < allFunders.length; i += batchSize) {
      const funderBatch = allFunders.slice(i, i + batchSize);
      
      const matchingPrompt = `You are an expert grant matching consultant. Analyze the following organization and funders to identify the best matches.

ORGANIZATION PROFILE:
${JSON.stringify(organizationContext, null, 2)}

FUNDERS TO ANALYZE:
${funderBatch.map((f, idx) => `
${idx + 1}. ${f.name}
   - Mission: ${f.mission_statement || 'Not available'}
   - Geographic Focus: ${Array.isArray(f.geographic_focus) ? f.geographic_focus.join(', ') : f.geographic_focus || 'Not specified'}
   - Sector Focus: ${f.sector_focus?.join(', ') || 'Not specified'}
   - Priority Areas: ${f.priority_areas?.join(', ') || 'Not specified'}
   - Award Range: $${f.typical_award_min?.toLocaleString() || '?'} - $${f.typical_award_max?.toLocaleString() || '?'}
   - Application Requirements: ${f.application_requirements || 'Not specified'}
   - Organization Type Eligibility: ${f.eligible_org_types?.join(', ') || 'Not specified'}
`).join('\n')}

For EACH funder, provide:
1. Match Score (0-100): How well aligned is this funder with the organization?
2. Alignment Factors: Specific reasons for the match (mission, geography, sector, award size, etc.)
3. Success Probability (low/medium/high): Likelihood of winning funding
4. Approach Strategy: 2-3 specific, actionable recommendations for approaching this funder
5. Red Flags: Any concerns or misalignments
6. Recommended Ask Amount: Specific amount to request based on their typical awards and project needs

Be specific, strategic, and honest. If a funder is a poor match, say so clearly.`;

      const batchResults = await base44.integrations.Core.InvokeLLM({
        prompt: matchingPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  funder_name: { type: "string" },
                  match_score: { type: "number" },
                  alignment_factors: { type: "array", items: { type: "string" } },
                  success_probability: { type: "string" },
                  approach_strategy: { type: "array", items: { type: "string" } },
                  red_flags: { type: "array", items: { type: "string" } },
                  recommended_ask_amount: { type: "number" },
                  key_insights: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Merge with funder data
      const enrichedMatches = batchResults.matches.map(match => {
        const funder = funderBatch.find(f => f.name === match.funder_name);
        return {
          ...match,
          funder_id: funder?.id,
          funder_data: funder
        };
      });

      allMatches.push(...enrichedMatches);
      console.log(`Processed batch ${i / batchSize + 1}, found ${enrichedMatches.length} matches`);
    }

    // Sort by match score
    allMatches.sort((a, b) => b.match_score - a.match_score);

    // Generate overall strategy recommendation
    const topMatches = allMatches.slice(0, 5);
    const strategyPrompt = `Based on these top 5 funder matches for ${organization.organization_name}, provide a strategic funding approach plan:

TOP MATCHES:
${topMatches.map((m, idx) => `${idx + 1}. ${m.funder_name} (${m.match_score}/100) - ${m.success_probability} probability`).join('\n')}

ORGANIZATION NEEDS:
- Project: ${project_description || 'General operating support'}
- Funding Needed: $${funding_amount_needed?.toLocaleString() || 'Not specified'}

Provide:
1. Overall Strategy: High-level approach for this funding campaign
2. Application Timeline: Suggested order and timing for applications
3. Diversification Advice: Mix of funder types to pursue
4. Capacity Considerations: Resource requirements for applying`;

    const strategyRecommendation = await base44.integrations.Core.InvokeLLM({
      prompt: strategyPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_strategy: { type: "string" },
          application_timeline: { type: "array", items: { type: "string" } },
          diversification_advice: { type: "string" },
          capacity_considerations: { type: "string" }
        }
      }
    });

    console.log(`Matching complete. Found ${allMatches.length} total matches`);

    return Response.json({
      success: true,
      organization_name: organization.organization_name,
      total_funders_analyzed: allFunders.length,
      matches: allMatches,
      top_recommendations: topMatches,
      strategic_plan: strategyRecommendation,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in funder matching:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});