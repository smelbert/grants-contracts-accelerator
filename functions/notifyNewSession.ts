import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Triggered when a new ProgramSession is created
// Notifies all active participants in that cohort
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const session = payload.data;
    if (!session?.cohort_id) {
      return Response.json({ skipped: true, reason: 'No cohort_id on session' });
    }

    // Get all active enrollments for this cohort
    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({
      cohort_id: session.cohort_id,
      enrollment_status: 'active'
    });

    if (!enrollments.length) {
      return Response.json({ notified: 0 });
    }

    const sessionDate = session.session_date
      ? new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'TBD';

    const notifications = enrollments.map(enrollment => ({
      user_email: enrollment.participant_email,
      notification_type: 'new_session_scheduled',
      title: `📅 New Session Added: ${session.session_title || 'Program Session'}`,
      message: `A new session has been scheduled for ${sessionDate}${session.location_or_link ? ' — ' + session.location_or_link : ''}. Check your program calendar for details.`,
      link: '/IncubateHerOverview',
      priority: 'high',
      is_read: false,
      related_entity_type: 'ProgramSession',
      related_entity_id: session.id
    }));

    await Promise.all(
      notifications.map(n => base44.asServiceRole.entities.UserNotification.create(n))
    );

    console.log(`Notified ${notifications.length} participants of new session: ${session.session_title}`);
    return Response.json({ notified: notifications.length });
  } catch (error) {
    console.error('notifyNewSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});