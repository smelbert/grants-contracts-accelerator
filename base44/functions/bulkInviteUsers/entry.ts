import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Authentication & authorization
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and coaches can invite
    if (user.role !== 'admin' && user.role !== 'coach') {
      return Response.json(
        { error: 'Forbidden: Only admins and coaches can invite users.' },
        { status: 403 }
      );
    }

    // Non-admin users cannot invite other admins
    const { emails, role, custom_message, program_cohort_id } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return Response.json({ error: 'At least one email is required.' }, { status: 400 });
    }

    if (!role || !['user', 'coach', 'admin'].includes(role)) {
      return Response.json({ error: 'Valid role is required.' }, { status: 400 });
    }

    if (user.role !== 'admin' && role === 'admin') {
      return Response.json(
        { error: 'Forbidden: Only admins can invite other admins.' },
        { status: 403 }
      );
    }

    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const invitationResults = [];

    for (const email of emails) {
      try {
        // Create invitation record
        const invitation = await base44.entities.UserInvitation.create({
          recipient_email: email.toLowerCase().trim(),
          invited_by_email: user.email,
          invited_by_name: user.full_name || user.email,
          role,
          custom_message: custom_message || '',
          program_cohort_id: program_cohort_id || null,
          status: 'pending',
          invitation_token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          expires_at: expiresAt,
          bulk_invitation_id: batchId
        });

        // Send invitation via backend function
        await base44.asServiceRole.functions.invoke('sendInvitationEmail', {
          invitation_id: invitation.id,
          recipient_email: email.toLowerCase().trim(),
          recipient_name: email.split('@')[0],
          invited_by_name: user.full_name || user.email,
          custom_message,
          program_cohort_id
        });

        // Mark as sent
        await base44.entities.UserInvitation.update(invitation.id, {
          status: 'sent',
          sent_at: new Date().toISOString(),
          email_sent: true,
          email_sent_at: new Date().toISOString()
        });

        console.log(`Successfully invited ${email} with role ${role}`);
        invitationResults.push({ email, status: 'sent', invitation_id: invitation.id });
      } catch (error) {
        console.error(`Failed to invite ${email}: ${error.message}`);
        invitationResults.push({ email, status: 'failed', error: error.message });
      }
    }

    const successful = invitationResults.filter(r => r.status === 'sent').length;
    const failed = invitationResults.filter(r => r.status === 'failed').length;

    return Response.json({
      message: `Bulk invitations processed: ${successful} sent, ${failed} failed`,
      batch_id: batchId,
      summary: { total: emails.length, sent: successful, failed },
      results: invitationResults
    });

  } catch (error) {
    console.error('Error in bulkInviteUsers function:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});