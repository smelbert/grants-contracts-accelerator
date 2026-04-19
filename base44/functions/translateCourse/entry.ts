import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'owner') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { courseId, targetLanguage } = await req.json();
    if (!courseId || !targetLanguage) {
      return Response.json({ error: 'courseId and targetLanguage required' }, { status: 400 });
    }

    const course = await base44.entities.LearningContent.get(courseId);
    if (!course) return Response.json({ error: 'Course not found' }, { status: 404 });

    console.log(`Translating course "${course.title}" to ${targetLanguage}`);

    // Build a translation payload from the course content
    const translationPayload = {
      title: course.title,
      description: course.description,
      curriculum_sections: course.curriculum_sections?.map(s => ({
        title: s.title,
        description: s.description,
        content: s.content
      })),
      lessons: course.lessons?.map(l => ({
        title: l.title,
        description: l.description,
        text_content: l.text_content
      })),
      tips: course.tips?.map(t => ({ title: t.title, content: t.content })),
      handouts: course.handouts?.map(h => ({ title: h.title, description: h.description }))
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Translate the following course content to ${targetLanguage}. Preserve all formatting, structure, and meaning. Return a JSON object with the same structure as the input, with all text fields translated. Do not translate URLs, IDs, or enum values. Input: ${JSON.stringify(translationPayload)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          curriculum_sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                content: { type: 'string' }
              }
            }
          },
          lessons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                text_content: { type: 'string' }
              }
            }
          },
          tips: {
            type: 'array',
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, content: { type: 'string' } }
            }
          },
          handouts: {
            type: 'array',
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, description: { type: 'string' } }
            }
          }
        }
      }
    });

    // Build new course data merging translated fields back
    const newCourseData = {
      ...course,
      title: `${result.title} (${targetLanguage})`,
      description: result.description || course.description,
      curriculum_sections: course.curriculum_sections?.map((s, i) => ({
        ...s,
        title: result.curriculum_sections?.[i]?.title || s.title,
        description: result.curriculum_sections?.[i]?.description || s.description,
        content: result.curriculum_sections?.[i]?.content || s.content
      })),
      lessons: course.lessons?.map((l, i) => ({
        ...l,
        title: result.lessons?.[i]?.title || l.title,
        description: result.lessons?.[i]?.description || l.description,
        text_content: result.lessons?.[i]?.text_content || l.text_content
      })),
      tips: course.tips?.map((t, i) => ({
        ...t,
        title: result.tips?.[i]?.title || t.title,
        content: result.tips?.[i]?.content || t.content
      })),
      handouts: course.handouts?.map((h, i) => ({
        ...h,
        title: result.handouts?.[i]?.title || h.title,
        description: result.handouts?.[i]?.description || h.description
      })),
      is_published: false, // new copy starts unpublished
    };

    // Remove id and system fields before creating
    delete newCourseData.id;
    delete newCourseData.created_date;
    delete newCourseData.updated_date;
    delete newCourseData.created_by;

    const created = await base44.asServiceRole.entities.LearningContent.create(newCourseData);
    console.log(`Created translated course: ${created.id}`);

    return Response.json({ success: true, newCourseId: created.id, title: newCourseData.title });
  } catch (error) {
    console.error('translateCourse error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});