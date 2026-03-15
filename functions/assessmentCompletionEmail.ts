import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { enrollment_id } = body;

    if (!enrollment_id) {
      return Response.json({ error: 'enrollment_id required' }, { status: 400 });
    }

    // Get enrollment
    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({ id: enrollment_id });
    const enrollment = enrollments[0];
    if (!enrollment) {
      return Response.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Check all 3 assessments are complete
    const assessments = await base44.asServiceRole.entities.ProgramAssessment.filter({ enrollment_id });
    const preCompleted = enrollment.pre_assessment_completed || assessments.some(a => a.assessment_type === 'pre' && !a.is_draft);
    const postCompleted = enrollment.post_assessment_completed || assessments.some(a => a.assessment_type === 'post' && !a.is_draft);
    const evalCompleted = assessments.some(a => a._form_type === 'evaluation' || a.assessment_type === 'evaluation');

    if (!preCompleted || !postCompleted || !evalCompleted) {
      return Response.json({ message: 'Not all assessments complete yet — email not sent.' });
    }

    const toEmail = enrollment.login_email || enrollment.participant_email;
    const name = enrollment.participant_name || 'Participant';
    const firstName = name.split(' ')[0];

    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #AC1A5B, #143A50); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #E5C089; margin: 0; font-size: 28px;">🎉 Congratulations, ${firstName}!</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0; font-size: 16px;">You've completed all three IncubateHer assessments!</p>
  </div>

  <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
      Hi ${firstName},
    </p>
    <p style="color: #475569; font-size: 15px; line-height: 1.7;">
      You have successfully completed your <strong>Pre-Assessment, Post-Assessment, and Program Evaluation</strong> — a major milestone in the IncubateHer program. You've also been automatically added to the <strong>giveaway pool</strong>!
    </p>

    <div style="background: #fff; border: 2px solid #E5C089; border-radius: 10px; padding: 20px; margin: 24px 0;">
      <h3 style="color: #143A50; margin: 0 0 12px; font-size: 16px;">✅ Your completed milestones:</h3>
      <ul style="color: #475569; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
        <li>Pre-Program Assessment</li>
        <li>Post-Program Assessment</li>
        <li>Program Evaluation</li>
      </ul>
    </div>

    <div style="background: linear-gradient(135deg, #143A50, #1E4F58); border-radius: 10px; padding: 24px; margin: 24px 0; text-align: center;">
      <h3 style="color: #E5C089; margin: 0 0 8px; font-size: 18px;">📅 Your Next Step: Book Your One-on-One Consultation</h3>
      <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 18px; line-height: 1.6;">
        You're now eligible for your individual Funding Readiness Consultation with Dr. Shawnte. 
        <strong style="color: #E5C089;">Spots are limited</strong> — book yours now before they fill up.
      </p>
      <a href="https://calendly.com/drshawnte/incubateher-individual-funding-readiness-consultation?back=1&month=2026-03"
         style="display: inline-block; background: #AC1A5B; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 15px;">
        📅 Book My Consultation Now
      </a>
    </div>

    <p style="color: #475569; font-size: 14px; line-height: 1.7;">
      During your consultation, you'll receive personalized strategic guidance on your funding readiness, 
      feedback on your documents, and tailored next-step recommendations. Come prepared with your top 2–3 questions!
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px;">
      <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
        You can also log into your portal to view your giveaway status and completion tracker.<br/>
        Questions? Reply to this email or contact us at 
        <a href="mailto:info@elbertinnovativesolutions.org" style="color: #143A50;">info@elbertinnovativesolutions.org</a>
      </p>
    </div>
  </div>

  <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 12px;">
    © ${new Date().getFullYear()} Elbert Innovative Solutions · IncubateHer Program
  </div>
</div>
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: toEmail,
      subject: `🎉 You've Completed All Assessments — Book Your Consultation Now, ${firstName}!`,
      body: emailBody,
      from_name: 'IncubateHer Program'
    });

    console.log(`Assessment completion email sent to ${toEmail}`);
    return Response.json({ success: true, sent_to: toEmail });

  } catch (error) {
    console.error('assessmentCompletionEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});