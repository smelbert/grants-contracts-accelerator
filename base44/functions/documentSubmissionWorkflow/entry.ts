import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    console.log('Document submission workflow triggered:', event.type);

    if (event.type === 'create') {
      const ownerEmail = data.owner_email;
      const documentTitle = data.title;
      const templateUsed = data.template_id;

      // If grant writing template was used, recommend next steps
      if (templateUsed) {
        const template = await base44.asServiceRole.entities.Template.filter({
          id: templateUsed
        });

        if (template[0] && template[0].category === 'grant_writing') {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: ownerEmail,
            subject: 'Next Steps for Your Grant Proposal',
            body: `Great progress on "${documentTitle}"!

You've completed a grant writing document. Here are your recommended next steps:

1. Review & Refine
   - Use our AI Document Analyzer to check for clarity and impact
   - Request peer review in the community
   - Consider our Document Review service for expert feedback

2. Strengthen Your Proposal
   - Add supporting documents (budget, timeline, letters of support)
   - Ensure alignment with funder priorities
   - Review our "Common Grant Writing Mistakes" guide

3. Prepare for Submission
   - Double-check all requirements
   - Gather necessary attachments
   - Submit early to avoid technical issues

4. After Submission
   - Note the decision timeline
   - Prepare follow-up communications
   - Start your next application!

Resources:
- Template Library: Additional supporting documents
- Community: Share your experience and get advice
- Boutique Services: Expert review and strategy sessions

You're making excellent progress. Keep it up!

The EIS Team`
          });
        }
      }

      // Track document creation patterns
      const userDocuments = await base44.asServiceRole.entities.Document.filter({
        owner_email: ownerEmail
      });

      if (userDocuments.length === 3) {
        // Active user - offer advanced services
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          subject: 'You\'re Building Momentum! 🚀',
          body: `You've created 3 documents - you're building real momentum in your funding journey!

Your progress shows commitment and action. Keep this energy going!

Ready to Level Up?
With your active engagement, you might benefit from:
- 1-on-1 coaching to refine your strategy
- Grant Readiness Intensive for comprehensive review
- Access to exclusive funding opportunities

Schedule a free 15-minute strategy call to discuss how we can accelerate your success.

Keep up the excellent work!

The EIS Team`
        });
      }

      console.log('Document workflow completed:', {
        owner: ownerEmail,
        total_documents: userDocuments.length
      });

      return Response.json({ success: true, documents_count: userDocuments.length });
    }

    return Response.json({ success: true, message: 'No action needed' });

  } catch (error) {
    console.error('Document submission workflow error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});