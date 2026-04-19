import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId, learnerEmail, learnerName, expiresInDays } = await req.json();
    if (!courseId) return Response.json({ error: 'courseId required' }, { status: 400 });

    // Generate a unique token
    const tokenArray = new Uint8Array(24);
    crypto.getRandomValues(tokenArray);
    const token = Array.from(tokenArray).map(b => b.toString(16).padStart(2, '0')).join('');

    const course = await base44.entities.LearningContent.get(courseId);
    if (!course) return Response.json({ error: 'Course not found' }, { status: 404 });

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
      : null;

    const link = await base44.asServiceRole.entities.CourseShareableLink.create({
      course_id: courseId,
      course_title: course.title,
      learner_email: learnerEmail || null,
      learner_name: learnerName || null,
      token,
      expires_at: expiresAt,
      open_count: 0,
      is_active: true,
      created_by_email: user.email
    });

    return Response.json({ success: true, token, linkId: link.id });
  } catch (error) {
    console.error('generateShareableLink error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});