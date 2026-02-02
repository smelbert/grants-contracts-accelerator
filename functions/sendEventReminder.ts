import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all upcoming events in the next 24 hours
    const events = await base44.asServiceRole.entities.Event.list();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate > now && eventDate <= tomorrow && event.status === 'upcoming';
    });
    
    // Send reminders to registered attendees
    for (const event of upcomingEvents) {
      const registrations = await base44.asServiceRole.entities.EventRegistration.filter({
        event_id: event.id,
        registration_status: 'registered'
      });
      
      for (const registration of registrations) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: registration.attendee_email,
          subject: `Reminder: ${event.event_name} is tomorrow!`,
          body: `
            <h2>Event Reminder</h2>
            <p>This is a friendly reminder that you're registered for:</p>
            <h3>${event.event_name}</h3>
            <p><strong>Date:</strong> ${new Date(event.start_date).toLocaleString()}</p>
            <p><strong>Location:</strong> ${event.location_type === 'virtual' ? 'Virtual Event' : event.location_details}</p>
            ${event.meeting_url ? `<p><a href="${event.meeting_url}">Join Meeting</a></p>` : ''}
            <p>We look forward to seeing you there!</p>
          `
        });
      }
    }
    
    return Response.json({ 
      success: true, 
      reminders_sent: upcomingEvents.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});