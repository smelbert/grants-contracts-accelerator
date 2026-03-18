import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all completed enrollments with evaluation_completed = true
    const completedEnrollments = await base44.entities.ProgramEnrollment.filter({
      evaluation_completed: true
    });

    if (!completedEnrollments.length) {
      return Response.json({ 
        success: true, 
        message: 'No participants found with completed evaluations'
      });
    }

    // Create notifications for each participant
    const notifications = await Promise.all(
      completedEnrollments.map(enrollment =>
        base44.entities.UserNotification.create({
          user_email: enrollment.participant_email,
          notification_type: 'evaluation_feedback',
          title: 'Update Your IncubateHer Feedback',
          message: 'We\'ve added new questions to the evaluation survey covering suggestions discussed at today\'s session. Please take a few minutes to update your feedback.',
          link: '/IncubateHerEvaluation',
          priority: 'normal',
          related_entity_type: 'ProgramEnrollment',
          related_entity_id: enrollment.id
        })
      )
    );

    return Response.json({ 
      success: true, 
      message: `Sent ${notifications.length} nudge notifications to participants`
    });
  } catch (error) {
    console.error('Error nudging evaluation updates:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});