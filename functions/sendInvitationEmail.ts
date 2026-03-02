import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      invitation_id,
      recipient_email,
      recipient_name,
      invited_by_name,
      custom_message,
      program_cohort_id
    } = await req.json();

    if (!recipient_email || !invitation_id) {
      return Response.json(
        { error: 'recipient_email and invitation_id are required.' },
        { status: 400 }
      );
    }

    console.log(`Sending invitation email to ${recipient_email}`);

    const roleDisplay = {
      user: 'Community Member',
      coach: 'Coach',
      admin: 'Administrator'
    };

    const cohortDisplay = program_cohort_id === 'incubateher' ? ' the IncubateHer Program' : '';

    const emailBody = `
Dear ${recipient_name || recipient_email},

You have been invited by ${invited_by_name} to join${cohortDisplay} on our platform!

${custom_message ? `\n${invited_by_name} wrote:\n"${custom_message}"\n` : ''}

Your role will be: ${roleDisplay[program_cohort_id === 'incubateher' ? 'participant' : 'user'] || 'Community Member'}

Click the link below to accept your invitation:
[Accept Invitation Button]

This invitation will expire in 30 days.

If you have any questions, please contact ${invited_by_name}.

Best regards,
The EIS Community Team
`;

    // Send email via integration
    const emailResult = await base44.integrations.Core.SendEmail({
      to: recipient_email,
      subject: `You're invited to join${cohortDisplay}!`,
      body: emailBody,
      from_name: 'Elbert Innovative Solutions'
    });

    console.log(`Email sent successfully to ${recipient_email}`);

    return Response.json({
      success: true,
      message: `Invitation email sent to ${recipient_email}`,
      invitation_id
    });

  } catch (error) {
    console.error('Error sending invitation email:', error);
    return Response.json(
      { error: error.message || 'Failed to send invitation email' },
      { status: 500 }
    );
  }
});