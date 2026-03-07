import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Triggered when a GiveawayEligiblePool record is updated
// Notifies the participant if their status changed
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const current = payload.data;
    const previous = payload.old_data;

    // Only fire if status actually changed
    if (!current?.participant_email || current.status === previous?.status) {
      return Response.json({ skipped: true, reason: 'No status change' });
    }

    const statusMessages = {
      eligible: {
        title: '🎉 You\'re Eligible for the Giveaway!',
        message: 'Congratulations! Your giveaway application has been reviewed and you are confirmed eligible. Stay tuned for the draw announcement.',
        priority: 'urgent'
      },
      disqualified: {
        title: 'Giveaway Application Update',
        message: 'Your giveaway application has been reviewed. Unfortunately, you did not meet all eligibility requirements at this time. Please reach out to the program team if you have questions.',
        priority: 'high'
      },
      pending_review: {
        title: '📋 Giveaway Application Received',
        message: 'Your giveaway application is now under review by the EIS team. You\'ll be notified once a decision has been made.',
        priority: 'normal'
      }
    };

    const config = statusMessages[current.status];
    if (!config) {
      return Response.json({ skipped: true, reason: 'Unknown status' });
    }

    await base44.asServiceRole.entities.UserNotification.create({
      user_email: current.participant_email,
      notification_type: 'giveaway_status_change',
      title: config.title,
      message: config.message,
      link: '/IncubateHerGiveaway',
      priority: config.priority,
      is_read: false,
      related_entity_type: 'GiveawayEligiblePool',
      related_entity_id: current.id
    });

    console.log(`Giveaway status notification sent to ${current.participant_email}: ${current.status}`);
    return Response.json({ notified: true });
  } catch (error) {
    console.error('notifyGiveawayStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});