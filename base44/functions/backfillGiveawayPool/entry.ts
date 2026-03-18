import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// One-time backfill: adds all IncubateHer participants who completed all 3 assessments
// to the GiveawayEligiblePool if not already there.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all active participant enrollments
    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({ role: 'participant' });
    console.log(`Found ${enrollments.length} participant enrollments`);

    const results = { added: [], already_in_pool: [], incomplete: [], errors: [] };

    for (const enrollment of enrollments) {
      try {
        // Check assessments
        const assessments = await base44.asServiceRole.entities.ProgramAssessment.filter({ enrollment_id: enrollment.id });
        const preCompleted = enrollment.pre_assessment_completed || assessments.some(a => a.assessment_type === 'pre' && !a.is_draft);
        const postCompleted = enrollment.post_assessment_completed || assessments.some(a => a.assessment_type === 'post' && !a.is_draft);
        const evalCompleted = assessments.some(a => a._form_type === 'evaluation' || a.assessment_type === 'evaluation');

        if (!preCompleted || !postCompleted || !evalCompleted) {
          results.incomplete.push(enrollment.participant_email);
          continue;
        }

        // Check if already in pool
        const existingPool = await base44.asServiceRole.entities.GiveawayEligiblePool.filter({ enrollment_id: enrollment.id });
        if (existingPool.length > 0) {
          results.already_in_pool.push(enrollment.participant_email);
          // Still ensure giveaway_eligible is set
          if (!enrollment.giveaway_eligible) {
            await base44.asServiceRole.entities.ProgramEnrollment.update(enrollment.id, { giveaway_eligible: true });
          }
          continue;
        }

        // Add to pool
        await base44.asServiceRole.entities.GiveawayEligiblePool.create({
          participant_email: enrollment.participant_email,
          participant_name: enrollment.participant_name,
          enrollment_id: enrollment.id,
          pre_assessment_completed: preCompleted,
          post_assessment_completed: postCompleted,
          program_evaluation_completed: evalCompleted,
          applied_date: new Date().toISOString(),
          status: 'pending_review'
        });

        await base44.asServiceRole.entities.ProgramEnrollment.update(enrollment.id, { giveaway_eligible: true });

        results.added.push(enrollment.participant_email);
        console.log(`Added ${enrollment.participant_email} to giveaway pool`);

      } catch (err) {
        results.errors.push({ email: enrollment.participant_email, error: err.message });
        console.error(`Error processing ${enrollment.participant_email}:`, err.message);
      }
    }

    console.log('Backfill complete:', results);
    return Response.json({
      success: true,
      summary: {
        newly_added: results.added.length,
        already_in_pool: results.already_in_pool.length,
        incomplete: results.incomplete.length,
        errors: results.errors.length
      },
      details: results
    });

  } catch (error) {
    console.error('backfillGiveawayPool error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});