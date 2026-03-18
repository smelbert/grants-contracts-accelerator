import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all upcoming events in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    
    const events = await base44.asServiceRole.entities.Event.list();
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.event_date);
      const now = new Date();
      const timeDiff = eventDate - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Events happening in 24 hours
      return hoursDiff > 0 && hoursDiff <= 24;
    });
    
    let notificationsSent = 0;
    
    for (const event of upcomingEvents) {
      // Get all confirmed registrations for this event
      const registrations = await base44.asServiceRole.entities.EventRegistration.filter({
        event_id: event.id,
        status: 'confirmed'
      });
      
      for (const registration of registrations) {
        // Check if notification already sent
        const existingNotifications = await base44.asServiceRole.entities.UserNotification.filter({
          user_email: registration.user_email,
          related_entity_type: 'Event',
          related_entity_id: event.id,
          notification_type: 'session_reminder'
        });
        
        if (existingNotifications.length === 0) {
          // Create notification
          await base44.asServiceRole.entities.UserNotification.create({
            user_email: registration.user_email,
            notification_type: 'session_reminder',
            title: `Event Reminder: ${event.title}`,
            message: `Your event "${event.title}" starts tomorrow at ${event.event_time}. Don't forget to join!`,
            link: `/events`,
            priority: 'high',
            related_entity_type: 'Event',
            related_entity_id: event.id
          });
          
          notificationsSent++;
        }
      }
    }
    
    return Response.json({ 
      success: true, 
      message: `Processed ${upcomingEvents.length} upcoming events, sent ${notificationsSent} reminders`
    });
    
  } catch (error) {
    console.error('Event reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});