import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Triggered when a DocumentSubmission is updated with reviewer_notes
// Notifies the participant that feedback has been left
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const current = payload.data;
    const previous = payload.old_data;

    if (!current?.participant_email) {
      return Response.json({ skipped: true, reason: 'No participant_email' });
    }

    // Only fire if reviewer_notes were newly added or changed
    const notesAdded = current.reviewer_notes && current.reviewer_notes !== previous?.reviewer_notes;
    const statusChanged = current.submission_status !== previous?.submission_status;

    if (!notesAdded && !statusChanged) {
      return Response.json({ skipped: true, reason: 'No relevant change' });
    }

    const statusLabels = {
      reviewed: 'Your submission has been reviewed.',
      needs_revision: 'Your submission needs revision.',
      approved: 'Your submission has been approved! 🎉'
    };

    const statusLabel = statusLabels[current.submission_status] || 'Your submission status has been updated.';

    const hasFeedback = notesAdded && current.reviewer_notes;

    await base44.asServiceRole.entities.UserNotification.create({
      user_email: current.participant_email,
      notification_type: 'evaluation_feedback',
      title: hasFeedback ? '💬 Feedback Left on Your Submission' : '📄 Submission Status Updated',
      message: hasFeedback
        ? `${statusLabel} Your reviewer left feedback on your program submission. Log in to view their comments.`
        : `${statusLabel} Log in to your portal to view the update.`,
      link: '/IncubateHerAssessments',
      priority: current.submission_status === 'needs_revision' ? 'high' : 'normal',
      is_read: false,
      related_entity_type: 'DocumentSubmission',
      related_entity_id: current.id
    });

    console.log(`Evaluation feedback notification sent to ${current.participant_email}`);
    return Response.json({ notified: true });
  } catch (error) {
    console.error('notifyEvaluationFeedback error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});