import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    console.log('Community engagement workflow triggered:', event.type);

    if (event.type === 'create') {
      const authorEmail = data.author_email;
      const authorName = data.author_name;

      // Count user's total discussions
      const userDiscussions = await base44.asServiceRole.entities.Discussion.filter({
        author_email: authorEmail
      });

      // Milestone rewards
      if (userDiscussions.length === 1) {
        // First post milestone
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: authorEmail,
          subject: '🎉 Welcome to the Community!',
          body: `Hi ${authorName},

Congratulations on your first community post! You've taken an important step in building connections and sharing knowledge.

Community Benefits:
- Learn from peers facing similar challenges
- Get feedback on your strategies and proposals
- Discover opportunities others have found
- Build a support network for your funding journey

Keep engaging! Active community members see 40% more success in securing funding.

Looking forward to your continued participation!

The EIS Community Team`
        });
      } else if (userDiscussions.length === 5) {
        // Active member milestone
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: authorEmail,
          subject: '⭐ You\'re an Active Community Member!',
          body: `Hi ${authorName},

You've made 5 community posts - you're now an active member of our community!

Your engagement is making a difference. Keep sharing your insights and asking questions.

Exclusive Benefit Unlocked:
As an active member, you now have priority access to our monthly "Ask the Expert" sessions.

Thank you for contributing to our thriving community!

The EIS Team`
        });
      } else if (userDiscussions.length === 10) {
        // Community leader milestone
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: authorEmail,
          subject: '🌟 Community Leader Recognition',
          body: `Hi ${authorName},

You've reached 10 community posts - you're now a Community Leader!

Your contributions are helping others succeed in their funding journeys. Thank you for your dedication to peer support and knowledge sharing.

Special Recognition:
- Community Leader badge on your profile
- Invitation to join our Advisory Circle
- 15% discount on boutique services

We value your leadership and look forward to your continued impact!

With gratitude,
The EIS Team`
        });
      }

      console.log('Community workflow completed:', {
        author: authorEmail,
        total_posts: userDiscussions.length
      });

      return Response.json({ 
        success: true, 
        milestone_reached: userDiscussions.length === 1 || userDiscussions.length === 5 || userDiscussions.length === 10
      });
    }

    return Response.json({ success: true, message: 'No action needed' });

  } catch (error) {
    console.error('Community engagement workflow error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});