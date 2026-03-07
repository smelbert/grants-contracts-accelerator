import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only function
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all IncubateHer-only learning content
    const incubateHerContent = await base44.entities.LearningContent.filter({
      incubateher_only: true
    });

    if (incubateHerContent.length === 0) {
      return Response.json({ message: 'No IncubateHer documents found to duplicate', duplicated: [] });
    }

    // Duplicate each document into the Resource Library
    const duplicatedDocs = [];
    for (const doc of incubateHerContent) {
      const newDoc = {
        title: doc.title,
        description: doc.description,
        content_type: doc.content_type,
        is_standalone_resource: true,
        is_published: true,
        incubateher_only: false,
        program_cohort_id: null,
        funding_lane: doc.funding_lane || 'general',
        facilitators: doc.facilitators,
        duration_minutes: doc.duration_minutes,
        thumbnail_url: doc.thumbnail_url,
        content_url: doc.content_url,
        file_url: doc.file_url,
        handouts: doc.handouts,
        tips: doc.tips,
        lessons: doc.lessons,
        curriculum_sections: doc.curriculum_sections,
        target_stages: doc.target_stages,
        target_org_types: doc.target_org_types,
        order: doc.order
      };

      const created = await base44.entities.LearningContent.create(newDoc);
      duplicatedDocs.push({
        original_id: doc.id,
        original_title: doc.title,
        new_id: created.id,
        new_title: created.title
      });
    }

    return Response.json({ 
      message: `Successfully duplicated ${duplicatedDocs.length} documents to Resource Library`,
      duplicated: duplicatedDocs 
    });
  } catch (error) {
    console.error('Duplication error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});