import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { funder_name, ein } = await req.json();

    if (!funder_name && !ein) {
      return Response.json({ error: 'funder_name or ein required' }, { status: 400 });
    }

    console.log(`Pulling 990 data for: ${funder_name || ein}`);

    // Use AI to search and extract 990 data
    const prompt = ein 
      ? `Search for IRS Form 990 data for organization with EIN: ${ein}

Visit nonprofit databases like ProPublica Nonprofit Explorer, GuideStar, or IRS 990 databases.`
      : `Search for IRS Form 990 data for: ${funder_name}

Visit nonprofit databases like ProPublica Nonprofit Explorer, GuideStar, or IRS 990 databases.`;

    const fullPrompt = `${prompt}

Extract the following information from their most recent Form 990:
1. Organization name
2. EIN (Employer Identification Number)
3. Total revenue
4. Total assets
5. Total expenses
6. Grant amounts distributed (if applicable)
7. Program service revenue
8. Mission statement
9. Key programs/activities
10. Geographic areas served
11. Website
12. Contact information

Return structured data about this organization's financial health and grantmaking capacity.
`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          organization_name: { type: "string" },
          ein: { type: "string" },
          total_revenue: { type: "number" },
          total_assets: { type: "number" },
          total_expenses: { type: "number" },
          grants_distributed: { type: "number" },
          program_service_revenue: { type: "number" },
          mission: { type: "string" },
          programs: {
            type: "array",
            items: { type: "string" }
          },
          geographic_areas: {
            type: "array",
            items: { type: "string" }
          },
          website: { type: "string" },
          contact_info: { type: "string" },
          filing_year: { type: "string" }
        }
      }
    });

    console.log('990 data extracted');

    // Check if Funder990 entity exists, if not just return data
    let stored = null;
    try {
      // Try to store in Funder990 entity
      stored = await base44.asServiceRole.entities.Funder990.create({
        funder_name: response.organization_name || funder_name,
        ein: response.ein || ein,
        total_revenue: response.total_revenue || 0,
        total_assets: response.total_assets || 0,
        total_expenses: response.total_expenses || 0,
        grants_distributed: response.grants_distributed || 0,
        program_service_revenue: response.program_service_revenue || 0,
        mission: response.mission,
        key_programs: response.programs || [],
        geographic_areas: response.geographic_areas || [],
        website: response.website,
        contact_info: response.contact_info,
        filing_year: response.filing_year,
        last_updated: new Date().toISOString()
      });
    } catch (err) {
      console.log('Could not store in Funder990 entity (may not exist):', err.message);
    }

    return Response.json({
      success: true,
      data: response,
      stored: !!stored
    });

  } catch (error) {
    console.error('Pull 990 data error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});