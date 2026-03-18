import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This can be called by a scheduled automation — no user auth required
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlines = await base44.asServiceRole.entities.InternalDeadline.filter({
      is_completed: false
    });

    let sent = 0;

    for (const deadline of deadlines) {
      if (!deadline.due_date || !deadline.user_email) continue;

      const dueDate = new Date(deadline.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const daysUntil = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
      const reminderIntervals = deadline.reminder_days_before || [7, 3, 1];
      const alreadySent = deadline.reminders_sent || [];

      if (!reminderIntervals.includes(daysUntil)) continue;
      if (alreadySent.includes(daysUntil)) continue;

      const typeLabels = {
        draft_review: 'Draft Review',
        final_assembly: 'Final Document Assembly',
        submission_prep: 'Submission Preparation',
        other: 'Internal Deadline'
      };
      const typeLabel = typeLabels[deadline.deadline_type] || 'Deadline';

      const urgencyWord = daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;

      const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #143A50; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="color: white; margin: 0;">⏰ Deadline Reminder</h2>
    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">${typeLabel} — ${urgencyWord}</p>
  </div>
  <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
    <h3 style="color: #143A50; margin-top: 0;">${deadline.title}</h3>
    <p style="color: #475569;"><strong>Due Date:</strong> ${new Date(deadline.due_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p style="color: #475569;"><strong>Days Remaining:</strong> ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}</p>
    ${deadline.linked_opportunity_title ? `<p style="color: #475569;"><strong>Related Opportunity:</strong> ${deadline.linked_opportunity_title}</p>` : ''}
    ${deadline.notes ? `<p style="color: #475569;"><strong>Notes:</strong> ${deadline.notes}</p>` : ''}
    <div style="margin-top: 20px; padding: 16px; background: ${daysUntil <= 2 ? '#fef2f2' : '#fffbeb'}; border-radius: 8px; border: 1px solid ${daysUntil <= 2 ? '#fecaca' : '#fde68a'};">
      <p style="margin: 0; color: ${daysUntil <= 2 ? '#991b1b' : '#92400e'}; font-weight: 600;">
        ${daysUntil <= 2 ? '🚨 Action required soon!' : '📋 Plan your next steps now.'}
      </p>
    </div>
    <p style="margin-top: 20px; font-size: 13px; color: #94a3b8;">Log in to your EIS portal to manage your deadlines and documents.</p>
  </div>
</div>`.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: deadline.user_email,
        subject: `⏰ ${urgencyWord}: "${deadline.title}" — ${typeLabel}`,
        body: emailBody
      });

      // Mark this interval as sent
      await base44.asServiceRole.entities.InternalDeadline.update(deadline.id, {
        reminders_sent: [...alreadySent, daysUntil]
      });

      sent++;
      console.log(`Reminder sent to ${deadline.user_email} for "${deadline.title}" (${daysUntil} days)`);
    }

    return Response.json({ success: true, reminders_sent: sent });
  } catch (error) {
    console.error('deadlineReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});