import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { event_type, cohort_id, data } = await req.json();

    console.log(`🔔 Processing program event: ${event_type}`);

    if (event_type === 'new_content_released') {
      // Notify participants about new content
      const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({
        cohort_id,
        role: 'participant'
      });

      const cohort = await base44.asServiceRole.entities.ProgramCohort.get(cohort_id);

      await Promise.all(
        enrollments.map(enrollment =>
          base44.asServiceRole.entities.UserNotification.create({
            user_email: enrollment.participant_email,
            notification_type: 'new_learning_content',
            title: '📚 New Content Available',
            message: `New content has been added to ${cohort.program_name}: ${data.content_title}`,
            link: data.content_link || '/learning',
            priority: 'normal'
          })
        )
      );

      console.log(`✅ Sent content notifications to ${enrollments.length} participants`);
    }

    if (event_type === 'upcoming_deadline') {
      // Notify participants about upcoming deadlines
      const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({
        cohort_id,
        role: 'participant'
      });

      await Promise.all(
        enrollments.map(enrollment =>
          base44.asServiceRole.entities.UserNotification.create({
            user_email: enrollment.participant_email,
            notification_type: 'session_reminder',
            title: '⏰ Upcoming Deadline',
            message: data.deadline_message,
            link: data.link || '/incubateher-completion',
            priority: 'high'
          })
        )
      );

      console.log(`✅ Sent deadline reminders to ${enrollments.length} participants`);
    }

    if (event_type === 'session_reminder') {
      // Notify participants about upcoming sessions
      const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({
        cohort_id,
        role: 'participant'
      });

      await Promise.all(
        enrollments.map(enrollment =>
          base44.asServiceRole.entities.UserNotification.create({
            user_email: enrollment.participant_email,
            notification_type: 'session_reminder',
            title: '📅 Upcoming Session',
            message: data.session_message,
            link: data.meeting_link || '/program-calendar',
            priority: 'high'
          })
        )
      );

      console.log(`✅ Sent session reminders to ${enrollments.length} participants`);
    }

    if (event_type === 'module_unlocked') {
      // Notify participant that a new module is unlocked
      await base44.asServiceRole.entities.UserNotification.create({
        user_email: data.participant_email,
        notification_type: 'new_learning_content',
        title: '🔓 New Module Unlocked',
        message: `Module ${data.module_number}: ${data.module_title} is now available!`,
        link: data.module_link || '/learning',
        priority: 'normal'
      });

      console.log(`✅ Sent module unlock notification to ${data.participant_email}`);
    }

    return Response.json({
      success: true,
      event_type,
      message: 'Notifications sent'
    });

  } catch (error) {
    console.error('❌ Error in program event notifications:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});