import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { limit = 10, only_unvetted = true } = await req.json();

    // Get opportunities to vet
    let opportunities = await base44.asServiceRole.entities.FundingOpportunity.list();

    if (only_unvetted) {
      opportunities = opportunities.filter(opp => !opp.ai_vetted);
    }

    opportunities = opportunities.slice(0, limit);

    console.log(`🔍 Starting bulk vetting of ${opportunities.length} opportunities...`);

    const results = [];

    for (const opportunity of opportunities) {
      try {
        // Call the individual vetting function
        const vettingResponse = await base44.asServiceRole.functions.invoke('vetOpportunity', {
          opportunity_id: opportunity.id
        });

        results.push({
          opportunity_id: opportunity.id,
          title: opportunity.title,
          success: true,
          result: vettingResponse.data
        });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to vet opportunity ${opportunity.id}:`, error);
        results.push({
          opportunity_id: opportunity.id,
          title: opportunity.title,
          success: false,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Bulk vetting completed: ${successful} successful, ${failed} failed`);

    return Response.json({
      success: true,
      total: opportunities.length,
      successful,
      failed,
      results
    });

  } catch (error) {
    console.error('❌ Error in bulk vetting:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});