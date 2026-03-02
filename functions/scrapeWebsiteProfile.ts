import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { website_url } = await req.json();

    if (!website_url || !website_url.trim()) {
      return Response.json({ error: 'Website URL is required.' }, { status: 400 });
    }

    console.log(`Scraping website profile from: ${website_url}`);

    const profileData = await base44.integrations.Core.InvokeLLM({
      prompt: `You are analyzing an organization's website to extract key profile information. 
      
Please extract and return the following information from the website:
- organization_name: The official name of the organization
- mission_statement: Their mission statement or core purpose
- vision_statement: Their vision for the future
- description: A brief description of what the organization does
- programs_offered: What programs or services they offer
- target_population: Who they serve or target
- geographic_service_area: Geographic area(s) they serve
- organizational_values: Core values or principles
- annual_people_served: If available, how many people they serve annually
- website: The website URL

Return only the extracted data. If a field is not available on the website, leave it as an empty string.`,
      add_context_from_internet: true,
      file_urls: [website_url],
      response_json_schema: {
        type: 'object',
        properties: {
          organization_name: { type: 'string' },
          mission_statement: { type: 'string' },
          vision_statement: { type: 'string' },
          description: { type: 'string' },
          programs_offered: { type: 'string' },
          target_population: { type: 'string' },
          geographic_service_area: { type: 'string' },
          organizational_values: { type: 'string' },
          annual_people_served: { type: 'string' },
          website: { type: 'string' }
        }
      }
    });

    console.log('Successfully scraped website profile:', profileData);

    return Response.json({
      success: true,
      profile_data: profileData,
      message: 'Profile data extracted successfully from website'
    });

  } catch (error) {
    console.error('Error scraping website profile:', error);
    return Response.json(
      { error: error.message || 'Failed to extract profile data from website' },
      { status: 500 }
    );
  }
});