import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all participant enrollments
    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({ role: 'participant' });

    // Get all assessments
    const allAssessments = await base44.asServiceRole.entities.ProgramAssessment.list();

    const results = { sent: [], skipped: [] };

    for (const enrollment of enrollments) {
      const email = enrollment.participant_email;
      if (!email) continue;

      const participantAssessments = allAssessments.filter(a => a.participant_email === email && !a.is_draft);
      const hasPreAssessment = participantAssessments.some(a => a.assessment_type === 'pre');
      const hasPostAssessment = participantAssessments.some(a => a.assessment_type === 'post');
      const hasEvaluation = participantAssessments.some(a => a.assessment_type === 'evaluation');

      // Only target: completed pre, but missing post OR evaluation
      if (!hasPreAssessment) {
        results.skipped.push({ email, reason: 'No pre-assessment' });
        continue;
      }
      if (hasPostAssessment && hasEvaluation) {
        results.skipped.push({ email, reason: 'All complete' });
        continue;
      }

      const missingItems = [];
      if (!hasPostAssessment) missingItems.push('Post-Assessment');
      if (!hasEvaluation) missingItems.push('Program Evaluation');

      const missingList = missingItems.map(item => `<li style="margin-bottom:8px;">✅ Pre-Assessment — <strong>Complete</strong></li><li style="margin-bottom:8px;">⏳ ${item} — <strong>Not Yet Submitted</strong></li>`).join('');

      const subject = `You're almost there! Complete your IncubateHer ${missingItems.join(' & ')}`;

      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #143A50;">
          <div style="background: #143A50; padding: 24px; text-align: center;">
            <h1 style="color: #E5C089; margin: 0; font-size: 24px;">IncubateHer Program</h1>
            <p style="color: #ffffff99; margin: 8px 0 0;">Columbus Urban League × Elbert Innovative Solutions</p>
          </div>

          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; margin-bottom: 16px;">Hi${enrollment.participant_name ? ' ' + enrollment.participant_name : ''},</p>

            <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
              Great news — you've already completed your <strong>Pre-Assessment</strong>, which means you're making real progress in the IncubateHer program! 🎉
            </p>

            <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
              We noticed you still have ${missingItems.length === 1 ? 'one step' : 'a few steps'} left to finish your program journey:
            </p>

            <div style="background: #f9f5ef; border-left: 4px solid #E5C089; padding: 16px 20px; margin-bottom: 24px; border-radius: 4px;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 8px;">✅ Pre-Assessment — <strong>Complete</strong></li>
                ${missingItems.map(item => `<li style="margin-bottom: 8px;">⏳ ${item} — <strong style="color:#AC1A5B;">Not Yet Submitted</strong></li>`).join('')}
              </ul>
            </div>

            <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              Completing these helps us measure your growth, improves future cohorts, and — importantly — <strong>makes you eligible for the IncubateHer Giveaway</strong> (grant writing support valued at hundreds of dollars)!
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="https://hub.elbertinnovativesolutions.org" 
                 style="background: #AC1A5B; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                Complete My Assessments →
              </a>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If you have any questions or are experiencing technical issues, please reach out to us. We're here to help you finish strong!
            </p>
          </div>

          <div style="background: #f1ede6; padding: 20px 24px; text-align: center; font-size: 12px; color: #999;">
            <p style="margin: 0;">Elbert Innovative Solutions · Columbus Urban League</p>
            <p style="margin: 4px 0 0;"><a href="https://www.elbertinnovativesolutions.org" style="color: #AC1A5B;">elbertinnovativesolutions.org</a></p>
          </div>
        </div>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        from_name: 'IncubateHer Program',
        subject,
        body
      });

      console.log(`Nudge sent to ${email} — missing: ${missingItems.join(', ')}`);
      results.sent.push({ email, missing: missingItems });
    }

    return Response.json({
      success: true,
      summary: `Sent ${results.sent.length} nudge emails, skipped ${results.skipped.length} participants.`,
      sent: results.sent,
      skipped: results.skipped
    });

  } catch (error) {
    console.error('nudgeIncompleteAssessments error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});