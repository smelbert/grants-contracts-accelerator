import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Authenticate and authorize the user
    if (!user || (user.role !== 'admin' && user.role !== 'coach')) {
      return Response.json(
        { error: 'Unauthorized: Only admin or coach can invite users.' },
        { status: 403 }
      );
    }

    const { cohort_id, enrollment_status, emails, role } = await req.json();

    if (!role) {
      return Response.json({ error: 'Role is required.' }, { status: 400 });
    }

    // Ensure non-admins cannot invite other admins
    if (user.role !== 'admin' && role === 'admin') {
      return Response.json(
        { error: 'Forbidden: Only admin users can invite other admins.' },
        { status: 403 }
      );
    }

    let usersToInvite = [];

    if (emails && emails.length > 0) {
      usersToInvite = emails;
    } else if (cohort_id || enrollment_status) {
      const query = {};
      if (cohort_id) query.cohort_id = cohort_id;
      if (enrollment_status) query.enrollment_status = enrollment_status;

      const enrollments = await base44.entities.ProgramEnrollment.filter(query);
      usersToInvite = enrollments.map(e => e.participant_email).filter(Boolean);
    } else {
      return Response.json(
        { error: 'Either specific emails or cohort_id/enrollment_status criteria must be provided.' },
        { status: 400 }
      );
    }

    if (usersToInvite.length === 0) {
      return Response.json({ message: 'No users found matching the criteria.', results: [] });
    }

    const invitationResults = await Promise.all(
      usersToInvite.map(async (email) => {
        try {
          await base44.users.inviteUser(email, role);
          console.log(`Successfully invited ${email} with role ${role}`);
          return { email, status: 'success' };
        } catch (error) {
          console.error(`Failed to invite ${email}: ${error.message}`);
          return { email, status: 'failed', error: error.message };
        }
      })
    );

    const successful = invitationResults.filter(r => r.status === 'success').length;
    const failed = invitationResults.filter(r => r.status === 'failed').length;

    return Response.json({
      message: `Invitations processed: ${successful} successful, ${failed} failed`,
      summary: { total: usersToInvite.length, successful, failed },
      results: invitationResults
    });

  } catch (error) {
    console.error('Error in inviteIncubateHerUsers function:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});