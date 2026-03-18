import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { funder_name, funder_website, ein } = await req.json();

    if (!funder_name) {
      return Response.json({ error: 'Funder name is required' }, { status: 400 });
    }

    console.log(`Researching funder: ${funder_name}`);

    // Step 1: Research funder website and general information
    const funderResearchPrompt = `Research the following funder organization and extract key information:

Funder Name: ${funder_name}
${funder_website ? `Website: ${funder_website}` : ''}
${ein ? `EIN: ${ein}` : ''}

Extract and provide the following information in a structured format:
1. Mission Statement (full text if available)
2. Geographic Focus (states, regions, or national/international)
3. Sector Focus (education, health, arts, environment, etc.)
4. Typical Award Amount Range (minimum and maximum)
5. Application Requirements (brief summary)
6. Eligible Organization Types (501c3, for-profit, etc.)
7. Priority Areas (specific programs or initiatives they fund)
8. Application Deadlines (if they have rolling or specific deadlines)
9. Contact Information (email, phone if available)
10. Organization Type (private foundation, corporate foundation, community foundation, etc.)

Be thorough and extract as much accurate information as possible from their website and public sources.`;

    const funderData = await base44.integrations.Core.InvokeLLM({
      prompt: funderResearchPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          mission_statement: { type: "string" },
          geographic_focus: { type: "string" },
          sector_focus: { type: "array", items: { type: "string" } },
          min_award_amount: { type: "number" },
          max_award_amount: { type: "number" },
          application_requirements: { type: "string" },
          eligible_org_types: { type: "array", items: { type: "string" } },
          priority_areas: { type: "array", items: { type: "string" } },
          application_deadlines: { type: "string" },
          contact_email: { type: "string" },
          contact_phone: { type: "string" },
          organization_type: { type: "string" },
          website: { type: "string" },
          summary: { type: "string" }
        }
      }
    });

    console.log('Funder data extracted:', funderData);

    // Step 2: Research 990 data if EIN is provided
    let form990Data = null;
    if (ein) {
      console.log(`Researching 990 data for EIN: ${ein}`);
      
      const form990Prompt = `Research IRS Form 990 data for the following organization:

Organization: ${funder_name}
EIN: ${ein}

Find and extract the following information from their most recent Form 990:
1. Fiscal Year of the filing
2. Total Assets
3. Total Giving (grants/contributions paid)
4. Number of grants awarded
5. Median grant amount
6. Average grant amount
7. List of recent grantees (names, locations, amounts, purposes)
8. Link to the 990 PDF if available

Search public databases like ProPublica Nonprofit Explorer, Foundation Directory, or other sources that provide 990 data.`;

      try {
        form990Data = await base44.integrations.Core.InvokeLLM({
          prompt: form990Prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              fiscal_year: { type: "number" },
              total_assets: { type: "number" },
              total_giving: { type: "number" },
              number_of_grants: { type: "number" },
              median_grant_amount: { type: "number" },
              average_grant_amount: { type: "number" },
              pdf_url: { type: "string" },
              past_grantees: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    location: { type: "string" },
                    amount: { type: "number" },
                    purpose: { type: "string" },
                    year: { type: "number" }
                  }
                }
              }
            }
          }
        });
        console.log('990 data extracted:', form990Data);
      } catch (error) {
        console.error('Error extracting 990 data:', error);
        form990Data = { error: 'Could not retrieve 990 data' };
      }
    }

    // Step 3: Create or update Funder entity
    const existingFunders = await base44.asServiceRole.entities.Funder.filter({ name: funder_name });
    let funder;

    const funderEntityData = {
      name: funder_name,
      website: funderData.website || funder_website,
      ein: ein || null,
      mission_statement: funderData.mission_statement,
      geographic_focus: funderData.geographic_focus,
      sector_focus: funderData.sector_focus || [],
      typical_award_min: funderData.min_award_amount || null,
      typical_award_max: funderData.max_award_amount || null,
      application_requirements: funderData.application_requirements,
      eligible_org_types: funderData.eligible_org_types || [],
      priority_areas: funderData.priority_areas || [],
      application_deadlines: funderData.application_deadlines,
      contact_email: funderData.contact_email,
      contact_phone: funderData.contact_phone,
      organization_type: funderData.organization_type,
      ai_researched: true,
      last_researched_date: new Date().toISOString()
    };

    if (existingFunders.length > 0) {
      funder = await base44.asServiceRole.entities.Funder.update(existingFunders[0].id, funderEntityData);
      console.log('Updated existing funder');
    } else {
      funder = await base44.asServiceRole.entities.Funder.create(funderEntityData);
      console.log('Created new funder');
    }

    // Step 4: Create Funder990 entity if 990 data was found
    if (form990Data && !form990Data.error && form990Data.fiscal_year) {
      const existing990 = await base44.asServiceRole.entities.Funder990.filter({
        funder_id: funder.id,
        fiscal_year: form990Data.fiscal_year
      });

      const form990EntityData = {
        funder_id: funder.id,
        funder_name: funder_name,
        fiscal_year: form990Data.fiscal_year,
        total_assets: form990Data.total_assets,
        total_giving: form990Data.total_giving,
        number_of_grants: form990Data.number_of_grants,
        median_grant_amount: form990Data.median_grant_amount,
        average_grant_amount: form990Data.average_grant_amount,
        pdf_url: form990Data.pdf_url,
        past_grantees: form990Data.past_grantees || [],
        data_source: 'AI Research'
      };

      if (existing990.length > 0) {
        await base44.asServiceRole.entities.Funder990.update(existing990[0].id, form990EntityData);
        console.log('Updated existing 990 data');
      } else {
        await base44.asServiceRole.entities.Funder990.create(form990EntityData);
        console.log('Created new 990 data');
      }
    }

    return Response.json({
      success: true,
      funder_id: funder.id,
      funder_data: funderData,
      form_990_data: form990Data,
      message: 'Funder research completed successfully'
    });

  } catch (error) {
    console.error('Error in funder research:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});