import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Runs hourly via scheduled automation.
// Sends a follow-up email to registered participants ~2 hours after an event ends.
// Uses UserNotification to deduplicate.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    // Look for events that ended between 1.5h and 3h ago
    const windowStart = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const windowEnd   = new Date(now.getTime() - 1.5 * 60 * 60 * 1000);

    const events = await base44.asServiceRole.entities.Event.list();
    const recentlyEndedEvents = events.filter(e => {
      // Use end_date if available, otherwise assume 2h after start_date
      const endTime = e.end_date
        ? new Date(e.end_date)
        : new Date(new Date(e.start_date).getTime() + 2 * 60 * 60 * 1000);
      return endTime >= windowStart && endTime <= windowEnd;
    });

    console.log(`Found ${recentlyEndedEvents.length} recently ended events`);

    let sent = 0;
    let skipped = 0;

    for (const event of recentlyEndedEvents) {
      const registrations = await base44.asServiceRole.entities.EventRegistration.filter({
        event_id: event.id,
        registration_status: 'registered'
      });

      for (const reg of registrations) {
        // Dedup check
        const existing = await base44.asServiceRole.entities.UserNotification.filter({
          user_email: reg.attendee_email,
          related_entity_id: event.id,
          notification_type: 'post_event_followup'
        });

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        const eventDate = new Date(event.start_date);
        const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // Build post-event survey link if available
        const surveySection = event.post_event_survey?.enabled
          ? `<div style="text-align:center;margin:24px 0">
              <a href="${globalThis.location?.origin || 'https://app.elbertinnovativesolutions.org'}/events?survey=${event.id}"
                 style="background:#AC1A5B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
                Share Your Feedback
              </a>
             </div>`
          : '';

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: reg.attendee_email,
          subject: `Thank you for attending "${event.event_name}"!`,
          body: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#143A50;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="color:#E5C089;margin:0;font-size:22px">Thanks for Joining Us!</h1>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 8px 8px">
    <p>Hi ${reg.attendee_name || 'there'},</p>
    <p>Thank you for attending <strong>${event.event_name}</strong> on ${dateStr}. We hope it was valuable for your journey!</p>

    ${event.description ? `
    <div style="background:#f8fafc;border-left:4px solid #143A50;padding:16px;margin:16px 0;border-radius:4px">
      <h3 style="margin:0 0 8px 0;color:#143A50">Event Summary</h3>
      <p style="margin:0">${event.description}</p>
    </div>` : ''}

    ${surveySection ? `
    <div style="background:#FFF8EE;border:1px solid #E5C089;padding:16px;margin:16px 0;border-radius:6px;text-align:center">
      <h3 style="color:#143A50;margin:0 0 8px 0">We'd love your feedback!</h3>
      <p style="margin:0 0 16px 0;color:#64748b">Your input helps us improve future events.</p>
      ${surveySection}
    </div>` : ''}

    <p>Stay connected with Elbert Innovative Solutions for upcoming events and opportunities.</p>
    <p>Warm regards,<br><strong>The EIS Team</strong></p>
    <p style="color:#64748b;font-size:12px;margin-top:32px">© Elbert Innovative Solutions</p>
  </div>
</div>`
        });

        await base44.asServiceRole.entities.UserNotification.create({
          user_email: reg.attendee_email,
          notification_type: 'post_event_followup',
          title: `Thanks for attending: ${event.event_name}`,
          message: `Follow-up sent for the event on ${dateStr}.`,
          related_entity_type: 'Event',
          related_entity_id: event.id,
          priority: 'normal',
          is_read: false
        });

        sent++;
      }

      // Mark event as completed if status is still 'upcoming'
      if (event.status === 'upcoming') {
        await base44.asServiceRole.entities.Event.update(event.id, { status: 'completed' });
      }
    }

    console.log(`Follow-ups sent: ${sent}, skipped: ${skipped}`);
    return Response.json({ success: true, events_checked: recentlyEndedEvents.length, followups_sent: sent, skipped });

  } catch (error) {
    console.error('sendEventFollowUp error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});