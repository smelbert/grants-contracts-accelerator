import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('Starting 990 enrichment for all opportunities...');

    // Get all active opportunities with funder names
    const opportunities = await base44.asServiceRole.entities.FundingOpportunity.filter({
      status: 'active'
    });

    console.log(`Found ${opportunities.length} active opportunities`);

    // Group by funder to avoid duplicate lookups
    const funderNames = [...new Set(opportunities.map(o => o.funder_name).filter(Boolean))];
    console.log(`Unique funders to enrich: ${funderNames.length}`);

    const enriched = [];
    const failed = [];

    // Limit to 10 per run to avoid rate limits
    const limit = 10;
    for (const funderName of funderNames.slice(0, limit)) {
      try {
        console.log(`Fetching 990 data for: ${funderName}`);
        
        // Check if we already have this data
        const existing = await base44.asServiceRole.entities.Funder990.filter({
          funder_name: funderName
        });

        if (existing.length > 0) {
          console.log(`Already have 990 data for ${funderName}, skipping`);
          continue;
        }

        // Call the pull990Data function
        const response = await base44.asServiceRole.functions.invoke('pull990Data', {
          funder_name: funderName
        });

        if (response.data.success) {
          enriched.push(funderName);
        } else {
          failed.push({ funder: funderName, error: 'Failed to fetch' });
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (err) {
        console.error(`Error enriching ${funderName}:`, err);
        failed.push({ funder: funderName, error: err.message });
      }
    }

    return Response.json({
      success: true,
      total_funders: funderNames.length,
      enriched: enriched.length,
      failed: failed.length,
      enriched_list: enriched,
      failed_list: failed,
      remaining: Math.max(0, funderNames.length - limit)
    });

  } catch (error) {
    console.error('Enrich 990 data error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});