import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Handles automated workflows for IncubateHer program
 * Triggered by entity automations
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const { event, data, old_data } = payload;
    console.log('Workflow triggered:', event);

    // Pre-Assessment Completion → Trigger consultation booking reminder
    if (event.entity_name === 'ProgramEnrollment' && event.type === 'update') {
      const enrollment = data;
      const oldEnrollment = old_data;

      // Just completed pre-assessment
      if (enrollment.pre_assessment_completed && !oldEnrollment?.pre_assessment_completed) {
        console.log('Pre-assessment completed, sending consultation booking email');
        
        await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
          type: 'pre_assessment_complete',
          enrollmentId: enrollment.id,
          participantEmail: enrollment.participant_email,
          participantName: enrollment.participant_name
        });
      }

      // Just completed consultation
      if (enrollment.consultation_completed && !oldEnrollment?.consultation_completed) {
        console.log('Consultation completed');
        // Could trigger follow-up email or next steps
      }

      // All milestones met → Program complete
      if (enrollment.program_completed && !oldEnrollment?.program_completed) {
        console.log('Program completed, sending completion email');
        
        await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
          type: 'program_complete',
          enrollmentId: enrollment.id,
          participantEmail: enrollment.participant_email,
          participantName: enrollment.participant_name
        });

        // Check giveaway eligibility
        if (enrollment.giveaway_eligible) {
          await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
            type: 'giveaway_eligible',
            enrollmentId: enrollment.id,
            participantEmail: enrollment.participant_email,
            participantName: enrollment.participant_name
          });
        }
      }

      // Giveaway eligibility achieved
      if (enrollment.giveaway_eligible && !oldEnrollment?.giveaway_eligible) {
        console.log('Participant now eligible for giveaway');
        
        await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
          type: 'giveaway_eligible',
          enrollmentId: enrollment.id,
          participantEmail: enrollment.participant_email,
          participantName: enrollment.participant_name
        });
      }
    }

    // New Enrollment → Send welcome email
    if (event.entity_name === 'ProgramEnrollment' && event.type === 'create') {
      const enrollment = data;
      
      if (enrollment.role === 'participant') {
        console.log('New participant enrolled, sending welcome email');
        
        await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
          type: 'welcome',
          enrollmentId: enrollment.id,
          participantEmail: enrollment.participant_email,
          participantName: enrollment.participant_name
        });
      }
    }

    // Consultation Booking → Send confirmation & prep instructions
    if (event.entity_name === 'ConsultationBooking' && event.type === 'create') {
      const booking = data;
      
      console.log('Consultation booked, sending confirmation');
      
      await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
        type: 'consultation_booked',
        enrollmentId: booking.enrollment_id,
        participantEmail: booking.participant_email,
        participantName: booking.participant_name
      });
    }

    return Response.json({ 
      success: true,
      message: 'Workflow processed successfully'
    });

  } catch (error) {
    console.error('Workflow error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});