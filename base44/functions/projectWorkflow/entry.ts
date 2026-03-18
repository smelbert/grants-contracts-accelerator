import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    console.log('Project workflow triggered:', event.type, event.entity_id);

    if (event.type === 'create') {
      const ownerEmail = data.owner_email;
      const projectName = data.name || 'your project';
      const projectType = data.project_type;

      // Fetch relevant funding opportunities based on project type
      let fundingLane = 'grants';
      if (projectType === 'contract' || projectType === 'rfp') {
        fundingLane = 'contracts';
      }

      const opportunities = await base44.asServiceRole.entities.FundingOpportunity.filter({
        funding_lane: fundingLane,
        status: 'open'
      }, '-posted_date', 5);

      // Send email with relevant opportunities
      const opportunitiesList = opportunities.map(opp => 
        `- ${opp.title} (${opp.funder_name})
  Amount: $${opp.amount_min?.toLocaleString() || 'N/A'}${opp.amount_max ? ' - $' + opp.amount_max.toLocaleString() : ''}
  Deadline: ${opp.deadline || 'Rolling'}
  ${opp.url || ''}`
      ).join('\n\n');

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: ownerEmail,
        subject: `Funding Opportunities for ${projectName}`,
        body: `Great job creating a new project!

We've identified ${opportunities.length} funding opportunities that match your project focus:

${opportunitiesList || 'Check the Funding Opportunities page for more options.'}

Tips for Success:
1. Review each opportunity's eligibility requirements carefully
2. Use our templates to draft strong proposals
3. Join community discussions to learn from others' experiences
4. Consider our RFP Rapid Response service for time-sensitive opportunities

Access your project workspace to continue building your proposal.

Good luck!

The EIS Team`
      });

      // Track project creation for analytics
      console.log('Project workflow completed:', {
        owner: ownerEmail,
        type: projectType,
        opportunities_sent: opportunities.length
      });

      return Response.json({ 
        success: true, 
        opportunities_sent: opportunities.length 
      });
    }

    return Response.json({ success: true, message: 'No action needed' });

  } catch (error) {
    console.error('Project workflow error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});