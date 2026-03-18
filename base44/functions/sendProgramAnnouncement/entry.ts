import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { cohort_id, recipient_type, title, message, priority } = await req.json();

    if (!cohort_id || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`📢 Sending announcement to ${recipient_type} in cohort ${cohort_id}`);

    // Get all enrollments for the cohort
    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({
      cohort_id
    });

    // Filter recipients based on type
    let recipients = [];
    
    if (recipient_type === 'all') {
      recipients = enrollments.map(e => e.participant_email);
    } else if (recipient_type === 'participants') {
      recipients = enrollments.filter(e => e.role === 'participant').map(e => e.participant_email);
    } else if (recipient_type === 'facilitators') {
      recipients = enrollments.filter(e => e.role === 'facilitator').map(e => e.participant_email);
    } else if (recipient_type === 'contractors') {
      recipients = enrollments.filter(e => e.role === 'contractor').map(e => e.participant_email);
    } else if (recipient_type === 'viewers') {
      recipients = enrollments.filter(e => 
        e.role === 'funder_viewer' || e.role === 'cul_observer'
      ).map(e => e.participant_email);
    }

    // Remove duplicates
    recipients = [...new Set(recipients)];

    console.log(`📧 Sending to ${recipients.length} recipients`);

    // Create notifications for all recipients
    const notifications = await Promise.all(
      recipients.map(email => 
        base44.asServiceRole.entities.UserNotification.create({
          user_email: email,
          notification_type: 'program_announcement',
          title,
          message,
          priority: priority || 'normal',
          is_read: false
        })
      )
    );

    console.log(`✅ ${notifications.length} notifications created`);

    return Response.json({
      success: true,
      recipients_count: recipients.length,
      notifications_created: notifications.length
    });

  } catch (error) {
    console.error('❌ Error sending announcement:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});