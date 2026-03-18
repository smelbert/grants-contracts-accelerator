import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Sends targeted, stage-aware reminder emails to participants based on where they are in the assessment journey.
// Stage logic:
//   Stage 1 - No pre-assessment: nudge to start
//   Stage 2 - Has pre, no post: nudge to do post
//   Stage 3 - Has pre + post, no evaluation: nudge to do evaluation
//   All done: skip

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({ role: 'participant' });
    const allAssessments = await base44.asServiceRole.entities.ProgramAssessment.list();

    const results = { sent: [], skipped: [] };

    for (const enrollment of enrollments) {
      const email = enrollment.participant_email;
      if (!email) continue;

      const pa = allAssessments.filter(a => a.enrollment_id === enrollment.id && !a.is_draft);
      const hasPreAssessment = !!enrollment.pre_assessment_completed || pa.some(a => a.assessment_type === 'pre');
      const hasPostAssessment = !!enrollment.post_assessment_completed || pa.some(a => a.assessment_type === 'post');
      const hasEvaluation = pa.some(a => a._form_type === 'evaluation' || a.assessment_type === 'evaluation');

      if (hasPreAssessment && hasPostAssessment && hasEvaluation) {
        results.skipped.push({ email, reason: 'All complete' });
        continue;
      }

      // Determine exact stage and craft targeted message
      let stage, subject, stageHtml, ctaLabel, ctaUrl;
      const name = enrollment.participant_name ? ` ${enrollment.participant_name}` : '';
      const baseUrl = 'https://hub.elbertinnovativesolutions.org';

      if (!hasPreAssessment) {
        stage = 1;
        subject = '⚡ Action Required: Start Your IncubateHer Pre-Assessment';
        stageHtml = `
          <p style="font-size:15px;line-height:1.6;margin-bottom:20px;">
            Your IncubateHer journey has started — but we're missing your <strong>Pre-Program Assessment</strong>. 
            This is the very first step and takes about 10 minutes to complete.
          </p>
          <div style="background:#f9f5ef;border-left:4px solid #E5C089;padding:16px 20px;margin-bottom:24px;border-radius:4px;">
            <p style="font-weight:bold;margin:0 0 8px;color:#143A50;">Your Current Progress:</p>
            <ul style="list-style:none;padding:0;margin:0;">
              <li style="margin-bottom:8px;">⏳ <strong>Step 1:</strong> Pre-Program Assessment — <span style="color:#AC1A5B;font-weight:bold;">Not Started</span></li>
              <li style="margin-bottom:8px;color:#999;">⬜ Step 2: Post-Program Assessment</li>
              <li style="margin-bottom:8px;color:#999;">⬜ Step 3: Program Evaluation</li>
            </ul>
          </div>
          <p style="font-size:15px;line-height:1.6;margin-bottom:20px;">
            Completing your Pre-Assessment helps us measure <strong>your growth</strong> throughout the program and is required to be eligible for the IncubateHer Giveaway.
          </p>`;
        ctaLabel = 'Start My Pre-Assessment →';
        ctaUrl = `${baseUrl}/IncubateHerPreAssessment`;

      } else if (!hasPostAssessment) {
        stage = 2;
        subject = '🎯 You\'re Halfway There! Complete Your Post-Assessment';
        stageHtml = `
          <p style="font-size:15px;line-height:1.6;margin-bottom:20px;">
            Fantastic work — you've completed your <strong>Pre-Program Assessment</strong>! 🎉 
            Now it's time to take the next step: your <strong>Post-Program Assessment</strong>.
          </p>
          <div style="background:#f9f5ef;border-left:4px solid #E5C089;padding:16px 20px;margin-bottom:24px;border-radius:4px;">
            <p style="font-weight:bold;margin:0 0 8px;color:#143A50;">Your Current Progress:</p>
            <ul style="list-style:none;padding:0;margin:0;">
              <li style="margin-bottom:8px;">✅ <strong>Step 1:</strong> Pre-Program Assessment — <span style="color:#16A34A;font-weight:bold;">Complete</span></li>
              <li style="margin-bottom:8px;">⏳ <strong>Step 2:</strong> Post-Program Assessment — <span style="color:#AC1A5B;font-weight:bold;">Action Required</span></li>
              <li style="margin-bottom:8px;color:#999;">⬜ Step 3: Program Evaluation</li>
            </ul>
          </div>
          <p style="font-size:15px;line-height:1.6;margin-bottom:20px;">
            The Post-Assessment measures <strong>how much you've grown</strong> since the program began. It takes about 10 minutes and is required to be eligible for the IncubateHer Giveaway.
          </p>`;
        ctaLabel = 'Take My Post-Assessment →';
        ctaUrl = `${baseUrl}/IncubateHerPostAssessment`;

      } else {
        // Has pre + post, missing evaluation
        stage = 3;
        subject = '🏁 One Last Step: Complete Your Program Evaluation!';
        stageHtml = `
          <p style="font-size:15px;line-height:1.6;margin-bottom:20px;">
            You are <strong>so close</strong> to finishing! You've completed both your Pre and Post Assessments — all that's left is the <strong>Program Evaluation</strong>.
          </p>
          <div style="background:#f9f5ef;border-left:4px solid #E5C089;padding:16px 20px;margin-bottom:24px;border-radius:4px;">
            <p style="font-weight:bold;margin:0 0 8px;color:#143A50;">Your Current Progress:</p>
            <ul style="list-style:none;padding:0;margin:0;">
              <li style="margin-bottom:8px;">✅ <strong>Step 1:</strong> Pre-Program Assessment — <span style="color:#16A34A;font-weight:bold;">Complete</span></li>
              <li style="margin-bottom:8px;">✅ <strong>Step 2:</strong> Post-Program Assessment — <span style="color:#16A34A;font-weight:bold;">Complete</span></li>
              <li style="margin-bottom:8px;">⏳ <strong>Step 3:</strong> Program Evaluation — <span style="color:#AC1A5B;font-weight:bold;">Action Required</span></li>
            </ul>
          </div>
          <p style="font-size:15px;line-height:1.6;margin-bottom:20px;">
            The Program Evaluation is your chance to share feedback that shapes future cohorts. It takes just 5 minutes and <strong>completes your program journey</strong>, making you fully eligible for the IncubateHer Giveaway.
          </p>`;
        ctaLabel = 'Complete My Program Evaluation →';
        ctaUrl = `${baseUrl}/IncubateHerEvaluation`;
      }

      const body = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#143A50;">
          <div style="background:#143A50;padding:24px;text-align:center;">
            <h1 style="color:#E5C089;margin:0;font-size:24px;">IncubateHer Program</h1>
            <p style="color:#ffffff99;margin:8px 0 0;">Columbus Urban League × Elbert Innovative Solutions</p>
          </div>
          <div style="padding:32px 24px;">
            <p style="font-size:16px;margin-bottom:16px;">Hi${name},</p>
            ${stageHtml}
            <p style="font-size:14px;line-height:1.6;margin-bottom:24px;background:#fff3cd;border:1px solid #ffc107;padding:12px 16px;border-radius:6px;">
              ⏰ <strong>Deadline: March 10, 2026 at 5:00 PM</strong> — Please don't wait, complete this today!
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${ctaUrl}" style="background:#AC1A5B;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
                ${ctaLabel}
              </a>
            </div>
            <p style="font-size:14px;color:#666;line-height:1.6;">
              Having trouble? Reply to this email or visit <a href="${baseUrl}" style="color:#AC1A5B;">${baseUrl}</a> and navigate to <em>Assessments & Evaluations</em>.
            </p>
          </div>
          <div style="background:#f1ede6;padding:20px 24px;text-align:center;font-size:12px;color:#999;">
            <p style="margin:0;">Elbert Innovative Solutions · Columbus Urban League</p>
            <p style="margin:4px 0 0;"><a href="https://www.elbertinnovativesolutions.org" style="color:#AC1A5B;">elbertinnovativesolutions.org</a></p>
          </div>
        </div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        from_name: 'IncubateHer Program',
        subject,
        body
      });

      console.log(`Stage-${stage} nudge sent to ${email}`);
      results.sent.push({ email, stage, name: enrollment.participant_name });
    }

    return Response.json({
      success: true,
      summary: `Sent ${results.sent.length} nudge emails, skipped ${results.skipped.length}.`,
      sent: results.sent,
      skipped: results.skipped
    });

  } catch (error) {
    console.error('nudgeIncompleteAssessments error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});