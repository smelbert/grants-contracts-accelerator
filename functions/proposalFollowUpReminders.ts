import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function is typically called by automation, not user action
    // Verify if there's a user (optional for automated context)
    const user = await base44.auth.me().catch(() => null);

    // Fetch all pending projects that need follow-up reminders
    const allProjects = await base44.asServiceRole.entities.Project.list('-created_date', 1000);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const projectsNeedingReminder = [];

    for (const project of allProjects) {
      // Skip if not in pending stage
      if (project.proposal_stage !== 'pending') continue;

      // Skip if no follow-up date set
      if (!project.next_follow_up_date) continue;

      const nextFollowUp = new Date(project.next_follow_up_date);
      nextFollowUp.setHours(0, 0, 0, 0);

      // Check if follow-up date is today or has passed
      if (nextFollowUp <= today) {
        projectsNeedingReminder.push(project);
      }
    }

    // Create notifications for each project needing a reminder
    const notifications = [];

    for (const project of projectsNeedingReminder) {
      try {
        // Get organization for email
        const org = await base44.asServiceRole.entities.Organization.filter({
          id: project.organization_id
        });

        if (org.length === 0) continue;

        const userEmail = org[0].primary_contact_email;
        if (!userEmail) continue;

        // Create notification
        const notification = await base44.asServiceRole.entities.UserNotification.create({
          user_email: userEmail,
          notification_type: 'project_update',
          title: `Follow-up Reminder: ${project.project_name}`,
          message: `Time to follow up with ${project.funder_name || 'funder'} on your ${project.proposal_stage} proposal. Amount asked: $${(project.amount_asked / 1000000).toFixed(1)}M. Last follow-up: ${project.last_follow_up_date ? new Date(project.last_follow_up_date).toLocaleDateString() : 'Not recorded'}.`,
          link: `/projects?id=${project.id}`,
          priority: 'normal'
        });

        notifications.push(notification);

        // Schedule next follow-up (if follow_up_frequency_days is set)
        if (project.follow_up_frequency_days && project.follow_up_frequency_days > 0) {
          const nextDate = new Date(today);
          nextDate.setDate(nextDate.getDate() + project.follow_up_frequency_days);

          await base44.asServiceRole.entities.Project.update(project.id, {
            next_follow_up_date: nextDate.toISOString().split('T')[0],
            last_follow_up_date: new Date().toISOString()
          });
        }
      } catch (projErr) {
        console.error(`Error processing project ${project.id}:`, projErr);
      }
    }

    return Response.json({
      success: true,
      reminders_created: notifications.length,
      projects_processed: projectsNeedingReminder.length
    });
  } catch (error) {
    console.error('proposalFollowUpReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});