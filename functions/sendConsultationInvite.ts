import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Automatically send consultation invitation after pre-assessment completion
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enrollment_id } = await req.json();

    // Get enrollment details
    const enrollment = await base44.entities.ProgramEnrollment.get(enrollment_id);
    
    if (!enrollment) {
      return Response.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Check if pre-assessment is completed
    if (!enrollment.pre_assessment_completed) {
      return Response.json({ error: 'Pre-assessment not completed' }, { status: 400 });
    }

    // Check if invitation already sent
    if (enrollment.consultation_invite_sent) {
      return Response.json({ message: 'Invitation already sent' }, { status: 200 });
    }

    // Send the consultation invitation email
    await base44.functions.invoke('incubateHerEmailNotifications', {
      notification_type: 'consultation_invitation',
      recipient_email: enrollment.participant_email,
      data: {
        participant_name: enrollment.participant_name
      }
    });

    // Update enrollment to mark invitation as sent
    await base44.asServiceRole.entities.ProgramEnrollment.update(enrollment_id, {
      consultation_invite_sent: true,
      consultation_invite_date: new Date().toISOString()
    });

    console.log(`Consultation invitation sent to ${enrollment.participant_email}`);

    return Response.json({ 
      success: true,
      message: 'Consultation invitation sent successfully',
      recipient: enrollment.participant_email
    });

  } catch (error) {
    console.error('Send consultation invite error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});