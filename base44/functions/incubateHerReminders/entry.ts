import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * IncubateHer Re-Engagement Reminders
 *
 * Reminder windows are computed relative to the cohort's actual start_date
 * and total program length (derived from session count / end_date when available).
 *
 * Logic:
 *  - programLengthDays: end_date - start_date, or fallback to session_days length × 7 days, or 42 days default
 *  - earlyWindow  = first 20% of program
 *  - midWindow    = first 50% of program
 *  - lateWindow   = first 75% of program
 *
 * Checks (highest priority first — only one email per participant per run):
 *  1. No login for > 10% of program length (min 3 days)
 *  2. Pre-assessment not done & past earlyWindow start
 *  3. Learning content not started & past earlyWindow
 *  4. Documents not uploaded & past midWindow
 *  5. Workbook not started & past midWindow
 *  6. Post-assessment available but not done
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;

    // --- Load cohort to determine program length ---
    const cohorts = await base44.asServiceRole.entities.ProgramCohort.list();
    // Find the active IncubateHer cohort
    const cohort = cohorts.find(c => c.is_active && (c.program_code?.includes('incubateher') || c.program_name?.toLowerCase().includes('incubate'))) || cohorts[0];

    let programLengthDays = 42; // sensible fallback (6-week program)
    let programStartDate = null;

    if (cohort) {
      const startDate = cohort.start_date ? new Date(cohort.start_date) : null;
      const endDate = cohort.end_date ? new Date(cohort.end_date) : null;
      programStartDate = startDate;

      if (startDate && endDate) {
        programLengthDays = Math.max(7, (endDate.getTime() - startDate.getTime()) / dayMs);
      } else if (cohort.session_days && cohort.session_days.length > 0) {
        // Estimate: number of unique session weeks × 7
        programLengthDays = Math.max(7, cohort.session_days.length * 7);
      }
    }

    // Proportional windows based on actual program length
    const earlyWindowDays  = Math.max(2, Math.round(programLengthDays * 0.20)); // 20% mark
    const midWindowDays    = Math.max(5, Math.round(programLengthDays * 0.50)); // 50% mark
    const inactiveGapDays  = Math.max(3, Math.round(programLengthDays * 0.10)); // 10% of program

    console.log(`Program: ${cohort?.program_name || 'unknown'} | Length: ${programLengthDays} days | earlyWindow: ${earlyWindowDays}d | midWindow: ${midWindowDays}d | inactiveGap: ${inactiveGapDays}d`);

    // --- Load supporting data ---
    const enrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({ role: 'participant' });

    const accessLevels = await base44.asServiceRole.entities.UserAccessLevel.list();
    const accessByEmail = {};
    for (const a of accessLevels) {
      if (a.user_email) accessByEmail[a.user_email] = a;
    }

    const allProgress = await base44.asServiceRole.entities.UserProgress.list();
    const progressByEmail = {};
    for (const p of allProgress) {
      const email = p.participant_email || p.created_by;
      if (email) {
        if (!progressByEmail[email]) progressByEmail[email] = [];
        progressByEmail[email].push(p);
      }
    }

    const workbookResponses = await base44.asServiceRole.entities.WorkbookResponse.list();
    const workbookByEmail = {};
    for (const w of workbookResponses) {
      if (w.participant_email) workbookByEmail[w.participant_email] = true;
    }

    let remindersSent = 0;
    const results = [];

    for (const enrollment of enrollments) {
      if (enrollment.program_completed) continue;

      const email = enrollment.participant_email;
      const name  = enrollment.participant_name || email;

      // Days since enrollment (or program start, whichever is later / more meaningful)
      const enrolledAt = enrollment.enrolled_date
        ? new Date(enrollment.enrolled_date).getTime()
        : new Date(enrollment.created_date).getTime();
      const programStartAt = programStartDate ? programStartDate.getTime() : enrolledAt;
      const refStart = Math.min(enrolledAt, programStartAt); // use whichever came first
      const daysInProgram = (now - refStart) / dayMs;

      // Last login
      const access = accessByEmail[email];
      const lastLogin = access?.last_login ? new Date(access.last_login).getTime() : null;
      const daysSinceLogin = lastLogin ? (now - lastLogin) / dayMs : daysInProgram;

      const send = async (type) => {
        await base44.asServiceRole.functions.invoke('incubateHerNotifications', {
          type,
          enrollmentId: enrollment.id,
          participantEmail: email,
          participantName: name
        });
        remindersSent++;
        results.push({ email, type, daysInProgram: Math.round(daysInProgram) });
        console.log(`Sent [${type}] to ${email} (${Math.round(daysInProgram)} days into program)`);
      };

      // 1. Inactive — hasn't logged in for ≥ 10% of program length
      if (daysSinceLogin >= inactiveGapDays && daysInProgram >= inactiveGapDays) {
        await send('inactive_login_reminder');
        continue;
      }

      // 2. Pre-assessment not done — past 20% of program
      if (!enrollment.pre_assessment_completed && daysInProgram > earlyWindowDays) {
        await send('pre_assessment_reminder');
        continue;
      }

      // 3. Learning content not started — past 20% of program
      const hasStartedLearning = (progressByEmail[email] || []).length > 0;
      if (!hasStartedLearning && daysInProgram > earlyWindowDays) {
        await send('learning_not_started');
        continue;
      }

      // 4. Documents not uploaded — past 50% of program
      if (enrollment.pre_assessment_completed && !enrollment.documents_uploaded && daysInProgram > midWindowDays) {
        await send('documents_reminder');
        continue;
      }

      // 5. Workbook not started — past 50% of program
      if (!workbookByEmail[email] && daysInProgram > midWindowDays) {
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
      programLengthDays,
      earlyWindowDays,
      midWindowDays,
      inactiveGapDays,
      message: `Sent ${remindersSent} reminder emails`,
      results
    });

  } catch (error) {
    console.error('Reminders error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});