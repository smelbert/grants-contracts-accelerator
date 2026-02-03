import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Send automated reminders for incomplete tasks
 * Called by scheduled automation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.list();
    let remindersSent = 0;

    for (const enrollment of enrollments) {
      // Skip if program already complete
      if (enrollment.program_completed) continue;

      // Reminder: Pre-assessment not complete (enrolled > 3 days ago)
      const enrolledDaysAgo = (Date.now() - new Date(enrollment.created_date).getTime()) / (1000 * 60 * 60 * 24);
      
      if (!enrollment.pre_assessment_completed && enrolledDaysAgo > 3) {
        console.log(`Sending pre-assessment reminder to ${enrollment.participant_email}`);
        
        await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
          type: 'pre_assessment_reminder',
          enrollmentId: enrollment.id,
          participantEmail: enrollment.participant_email,
          participantName: enrollment.participant_name
        });
        
        remindersSent++;
      }

      // Reminder: Documents not uploaded (pre-assessment complete but no docs)
      if (enrollment.pre_assessment_completed && !enrollment.documents_uploaded && enrolledDaysAgo > 7) {
        console.log(`Sending documents reminder to ${enrollment.participant_email}`);
        
        await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
          type: 'documents_reminder',
          enrollmentId: enrollment.id,
          participantEmail: enrollment.participant_email,
          participantName: enrollment.participant_name
        });
        
        remindersSent++;
      }

      // Reminder: Post-assessment available (attendance complete but no post test)
      if (enrollment.attendance_complete && !enrollment.post_assessment_completed) {
        console.log(`Sending post-assessment reminder to ${enrollment.participant_email}`);
        
        await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
          type: 'post_assessment_available',
          enrollmentId: enrollment.id,
          participantEmail: enrollment.participant_email,
          participantName: enrollment.participant_name
        });
        
        remindersSent++;
      }
    }

    return Response.json({
      success: true,
      message: `Sent ${remindersSent} reminder emails`
    });

  } catch (error) {
    console.error('Reminders error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});