import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled (unauthenticated) calls and admin calls
    let isScheduled = false;
    try {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      // Unauthenticated = scheduled call, allow via service role
      isScheduled = true;
    }

    const client = base44.asServiceRole;

    // Fetch all active (non-archived) opportunities
    const opportunities = await client.entities.FundingOpportunity.filter({
      is_active: true
    });

    const now = new Date();
    const toArchive = opportunities.filter(opp => {
      if (opp.status === 'archived') return false;
      if (opp.rolling_deadline) return false;
      const deadline = opp.deadline || opp.deadline_full;
      if (!deadline) return false;
      return new Date(deadline) < now;
    });

    console.log(`Found ${toArchive.length} opportunities past deadline to archive.`);

    let archived = 0;
    for (const opp of toArchive) {
      await client.entities.FundingOpportunity.update(opp.id, { status: 'archived' });
      archived++;
    }

    return Response.json({
      success: true,
      archived,
      message: `Archived ${archived} past-deadline opportunities.`
    });
  } catch (error) {
    console.error('autoArchiveOpportunities error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});