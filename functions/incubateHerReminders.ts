import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Send automated reminders for:
 * 1. Participants who haven't logged in for 7+ days
 * 2. Pre-assessment not completed (3+ days after enrollment)
 * 3. Documents not uploaded (7+ days after enrollment)
 * 4. Learning content not started (5+ days after enrollment)
 * 5. Workbook not started (7+ days after enrollment)
 * 6. Post-assessment available but not done
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;

    // Fetch all active enrollments (participants only, not completed)
    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({
      role: 'participant'
    });

    // Fetch last login data from UserAccessLevel
    const accessLevels = await base44.asServiceRole.entities.UserAccessLevel.list();
    const accessByEmail = {};
    for (const a of accessLevels) {
      if (a.user_email) accessByEmail[a.user_email] = a;
    }

    // Fetch UserProgress to know who has started learning content
    const allProgress = await base44.asServiceRole.entities.UserProgress.list();
    const progressByEmail = {};
    for (const p of allProgress) {
      const email = p.participant_email || p.created_by;
      if (email) {
        if (!progressByEmail[email]) progressByEmail[email] = [];
        progressByEmail[email].push(p);
      }
    }

    // Fetch WorkbookResponses to know who has started the workbook
    const workbookResponses = await base44.asServiceRole.entities.WorkbookResponse.list();
    const workbookByEmail = {};
    for (const w of workbookResponses) {
      if (w.participant_email) workbookByEmail[w.participant_email] = true;
    }

    let remindersSent = 0;
    const results = [];

    for (const enrollment of enrollments) {
      // Skip completed participants
      if (enrollment.program_completed) continue;

      const email = enrollment.participant_email;
      const name = enrollment.participant_name || email;
      const enrolledDaysAgo = (now - new Date(enrollment.created_date).getTime()) / dayMs;

      const send = async (type) => {
        await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
          type,
          enrollmentId: enrollment.id,
          participantEmail: email,
          participantName: name
        });
        remindersSent++;
        results.push({ email, type });
        console.log(`Sent ${type} to ${email}`);
      };

      // 1. NOT LOGGED IN — check last_login from UserAccessLevel or ClientStage
      const access = accessByEmail[email];
      const lastLogin = access?.last_login ? new Date(access.last_login).getTime() : null;
      const daysSinceLogin = lastLogin ? (now - lastLogin) / dayMs : enrolledDaysAgo;

      if (daysSinceLogin >= 7 && enrolledDaysAgo >= 3) {
        await send('inactive_login_reminder');
        continue; // Don't pile on — one nudge per cycle
      }

      // 2. Pre-assessment not completed (3+ days enrolled)
      if (!enrollment.pre_assessment_completed && enrolledDaysAgo > 3) {
        await send('pre_assessment_reminder');
        continue;
      }

      // 3. Learning content not started (5+ days enrolled)
      const hasStartedLearning = (progressByEmail[email] || []).length > 0;
      if (!hasStartedLearning && enrolledDaysAgo > 5) {
        await send('learning_not_started');
        continue;
      }

      // 4. Documents not uploaded (7+ days enrolled)
      if (enrollment.pre_assessment_completed && !enrollment.documents_uploaded && enrolledDaysAgo > 7) {
        await send('documents_reminder');
        continue;
      }

      // 5. Workbook not started (7+ days enrolled)
      if (!workbookByEmail[email] && enrolledDaysAgo > 7) {
        await send('workbook_not_started');
        continue;
      }

      // 6. Post-assessment available but not done
      if (enrollment.attendance_complete && !enrollment.post_assessment_completed) {
        await send('post_assessment_available');
        continue;
      }
    }

    return Response.json({
      success: true,
      message: `Sent ${remindersSent} reminder emails`,
      results
    });

  } catch (error) {
    console.error('Reminders error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});