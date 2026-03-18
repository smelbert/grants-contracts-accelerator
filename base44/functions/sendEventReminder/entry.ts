import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Runs hourly via scheduled automation.
// Sends a 24-hour reminder email to all registered participants for upcoming events.
// Uses UserNotification to deduplicate — one reminder per person per event.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23h from now
    const windowEnd   = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25h from now

    const events = await base44.asServiceRole.entities.Event.list();
    const upcomingEvents = events.filter(e => {
      const start = new Date(e.start_date);
      return start >= windowStart && start <= windowEnd && e.status === 'upcoming';
    });

    console.log(`Found ${upcomingEvents.length} events in the 24-hour window`);

    let sent = 0;
    let skipped = 0;

    for (const event of upcomingEvents) {
      const registrations = await base44.asServiceRole.entities.EventRegistration.filter({
        event_id: event.id,
        registration_status: 'registered'
      });

      for (const reg of registrations) {
        // Dedup: check if reminder already sent
        const existing = await base44.asServiceRole.entities.UserNotification.filter({
          user_email: reg.attendee_email,
          related_entity_id: event.id,
          notification_type: '24h_event_reminder'
        });

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        const eventDate = new Date(event.start_date);
        const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

        const locationLine = event.location_type === 'virtual'
          ? `<p><strong>Format:</strong> Virtual</p>${event.meeting_url ? `<p><a href="${event.meeting_url}" style="color:#143A50">Click here to join</a></p>` : ''}`
          : `<p><strong>Location:</strong> ${event.location_details || 'See event details'}</p>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: reg.attendee_email,
          subject: `Reminder: "${event.event_name}" is tomorrow!`,
          body: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#143A50;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="color:#E5C089;margin:0;font-size:22px">Event Reminder</h1>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 8px 8px">
    <p>Hi ${reg.attendee_name || 'there'},</p>
    <p>Just a friendly reminder that you're registered for an event happening <strong>tomorrow</strong>!</p>
    <div style="background:#f8fafc;border-left:4px solid #E5C089;padding:16px;margin:16px 0;border-radius:4px">
      <h2 style="margin:0 0 8px 0;color:#143A50;font-size:18px">${event.event_name}</h2>
      <p style="margin:4px 0"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin:4px 0"><strong>Time:</strong> ${timeStr}</p>
      ${locationLine}
    </div>
    ${event.description ? `<p>${event.description}</p>` : ''}
    <p>We look forward to seeing you there!</p>
    <p style="color:#64748b;font-size:12px;margin-top:32px">© Elbert Innovative Solutions</p>
  </div>
</div>`
        });

        // Record notification so we don't send it again
        await base44.asServiceRole.entities.UserNotification.create({
          user_email: reg.attendee_email,
          notification_type: '24h_event_reminder',
          title: `Reminder: ${event.event_name} is tomorrow`,
          message: `Your event is on ${dateStr} at ${timeStr}.`,
          related_entity_type: 'Event',
          related_entity_id: event.id,
          priority: 'high',
          is_read: false
        });

        sent++;
      }
    }

    console.log(`Reminders sent: ${sent}, skipped (already sent): ${skipped}`);
    return Response.json({ success: true, events_checked: upcomingEvents.length, reminders_sent: sent, skipped });

  } catch (error) {
    console.error('sendEventReminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});