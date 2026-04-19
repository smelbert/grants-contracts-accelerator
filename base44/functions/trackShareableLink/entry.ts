import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();
    if (!token) return Response.json({ error: 'token required' }, { status: 400 });

    const links = await base44.asServiceRole.entities.CourseShareableLink.filter({ token });
    if (!links.length) return Response.json({ error: 'Link not found' }, { status: 404 });

    const link = links[0];

    if (!link.is_active) return Response.json({ error: 'Link is no longer active' }, { status: 403 });
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return Response.json({ error: 'Link has expired' }, { status: 403 });
    }

    // Track open
    const updateData = {
      open_count: (link.open_count || 0) + 1
    };
    if (!link.opened_at) {
      updateData.opened_at = new Date().toISOString();
    }
    await base44.asServiceRole.entities.CourseShareableLink.update(link.id, updateData);

    // Return course info
    const course = await base44.asServiceRole.entities.LearningContent.get(link.course_id);

    return Response.json({
      success: true,
      course,
      learnerName: link.learner_name,
      learnerEmail: link.learner_email
    });
  } catch (error) {
    console.error('trackShareableLink error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});