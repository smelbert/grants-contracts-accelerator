import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    console.log('Assessment workflow triggered:', event.type, event.entity_id);

    if (event.type === 'create' && data.assessment_type === 'pre') {
      const score = data.total_score;
      const participantEmail = data.participant_email;

      // Get participant info
      const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({
        participant_email: participantEmail
      });
      const enrollment = enrollments[0];

      if (!enrollment) {
        console.log('No enrollment found for participant');
        return Response.json({ success: false, reason: 'No enrollment found' });
      }

      // Update enrollment with assessment completion
      await base44.asServiceRole.entities.ProgramEnrollment.update(enrollment.id, {
        pre_assessment_completed: true,
        pre_assessment_date: new Date().toISOString(),
        pre_assessment_score: score
      });

      // Conditional workflows based on score
      if (score < 50) {
        // Low score: Enroll in foundational skills
        await base44.asServiceRole.entities.UserAccessLevel.update(
          (await base44.asServiceRole.entities.UserAccessLevel.filter({ user_email: participantEmail }))[0].id,
          {
            allowed_community_spaces: ['foundational_skills']
          }
        );

        // Send encouragement email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: participantEmail,
          subject: 'Your Learning Path: Building Strong Foundations',
          body: `Hi ${enrollment.participant_name},

Thank you for completing your pre-assessment! Based on your results, we've created a personalized learning path focused on building strong foundational skills.

Your Score: ${score}/100

We've enrolled you in our Foundational Skills module, which includes:
- Essential grant writing basics
- Understanding the funding landscape
- Building organizational capacity
- Legal and financial fundamentals

These resources will help you build the strong foundation needed for funding success.

Next Steps:
1. Explore the Foundational Skills community space
2. Complete the recommended templates
3. Connect with your cohort for peer support

Remember, everyone starts somewhere, and you've taken the important first step!

Best regards,
The EIS Team`
        });

      } else if (score >= 50 && score < 70) {
        // Mid score: Focus on grant writing
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: participantEmail,
          subject: 'Great Start! Your Personalized Learning Path',
          body: `Hi ${enrollment.participant_name},

Excellent work on your pre-assessment! You scored ${score}/100, showing solid foundational knowledge.

Your Personalized Recommendations:
- Focus on grant writing templates and strategies
- Explore our contract/RFP resources
- Join advanced workshops and community discussions

We've curated resources specifically matched to your current skill level to help you continue growing.

Access your personalized dashboard to see your recommended templates and next steps.

Keep up the great work!

Best regards,
The EIS Team`
        });

      } else {
        // High score: Advanced resources
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: participantEmail,
          subject: 'Outstanding! Advanced Resources Await',
          body: `Hi ${enrollment.participant_name},

Impressive work! You scored ${score}/100 on your pre-assessment, demonstrating strong expertise in funding readiness.

Your Advanced Path:
- Contract and RFP response strategies
- Scaling organizational capacity
- Strategic partnerships and diversification
- Thought leadership opportunities

You're positioned to tackle more complex funding opportunities. We've unlocked advanced templates and strategic resources for you.

Consider our boutique services for personalized strategy sessions to take your organization to the next level.

Congratulations on your expertise!

Best regards,
The EIS Team`
        });
      }

      console.log('Assessment workflow completed for score:', score);
      return Response.json({ success: true, score, action: 'workflow_triggered' });
    }

    return Response.json({ success: true, message: 'No action needed' });

  } catch (error) {
    console.error('Assessment workflow error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});