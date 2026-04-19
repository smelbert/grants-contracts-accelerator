import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId, lessonIndex } = await req.json();
    if (!courseId) return Response.json({ error: 'courseId required' }, { status: 400 });

    const course = await base44.entities.LearningContent.get(courseId);
    if (!course) return Response.json({ error: 'Course not found' }, { status: 404 });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    let y = 20;

    const addText = (text, size, style = 'normal', color = [30, 30, 30]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || ''), maxWidth);
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += size * 0.5;
      });
      y += 4;
    };

    const addDivider = () => {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    };

    // Header band
    doc.setFillColor(20, 58, 80);
    doc.rect(0, 0, pageWidth, 14, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(229, 192, 137);
    doc.text('Elbert Innovative Solutions — Learning Hub', margin, 9);
    y = 24;

    // Title
    addText(course.title, 22, 'bold', [20, 58, 80]);

    if (course.description) {
      addText(course.description, 11, 'normal', [80, 80, 80]);
    }

    // Meta info
    const meta = [];
    if (course.content_type) meta.push(`Type: ${course.content_type}`);
    if (course.funding_lane) meta.push(`Lane: ${course.funding_lane}`);
    if (course.duration_minutes) meta.push(`Duration: ${course.duration_minutes} min`);
    if (meta.length > 0) addText(meta.join('  •  '), 10, 'normal', [100, 100, 100]);

    addDivider();

    // Determine what to export
    const sections = lessonIndex !== undefined
      ? [course.curriculum_sections?.[lessonIndex]].filter(Boolean)
      : (course.curriculum_sections || []);

    const lessons = lessonIndex !== undefined
      ? [course.lessons?.[lessonIndex]].filter(Boolean)
      : (course.lessons || []);

    // Curriculum sections
    if (sections.length > 0) {
      addText('Course Content', 16, 'bold', [20, 58, 80]);
      sections.forEach((section, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        addText(`${i + 1}. ${section.title || 'Section'}`, 13, 'bold', [30, 30, 30]);
        if (section.description) addText(section.description, 10, 'normal', [80, 80, 80]);
        if (section.duration_minutes) addText(`Duration: ${section.duration_minutes} min`, 9, 'italic', [120, 120, 120]);
        if (section.content) {
          const clean = section.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          addText(clean, 10, 'normal', [50, 50, 50]);
        }
        y += 4;
      });
      addDivider();
    }

    // Lessons
    if (lessons.length > 0) {
      addText('Lessons', 16, 'bold', [20, 58, 80]);
      lessons.forEach((lesson, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        addText(`Lesson ${i + 1}: ${lesson.title || 'Untitled'}`, 13, 'bold', [30, 30, 30]);
        if (lesson.description) addText(lesson.description, 10, 'normal', [80, 80, 80]);
        if (lesson.content_type) addText(`Format: ${lesson.content_type}`, 9, 'italic', [120, 120, 120]);
        if (lesson.text_content) {
          const clean = lesson.text_content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          addText(clean, 10, 'normal', [50, 50, 50]);
        }
        if (lesson.resources?.length > 0) {
          addText('Resources:', 10, 'bold', [20, 58, 80]);
          lesson.resources.forEach(r => addText(`• ${r.title}${r.url ? ': ' + r.url : ''}`, 9, 'normal', [60, 60, 60]));
        }
        y += 4;
      });
      addDivider();
    }

    // Handouts
    if (course.handouts?.length > 0 && lessonIndex === undefined) {
      addText('Handouts & Resources', 14, 'bold', [20, 58, 80]);
      course.handouts.forEach(h => {
        addText(`• ${h.title}`, 10, 'normal', [50, 50, 50]);
        if (h.description) addText(`  ${h.description}`, 9, 'italic', [100, 100, 100]);
        if (h.file_url) addText(`  Download: ${h.file_url}`, 9, 'normal', [0, 80, 160]);
      });
      addDivider();
    }

    // Tips
    if (course.tips?.length > 0 && lessonIndex === undefined) {
      addText('Tips & Best Practices', 14, 'bold', [20, 58, 80]);
      course.tips.forEach(tip => {
        addText(`${tip.category?.replace('_', ' ').toUpperCase() || 'TIP'}: ${tip.title}`, 10, 'bold', [50, 50, 50]);
        if (tip.content) addText(tip.content, 10, 'normal', [70, 70, 70]);
      });
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth / 2, 290, { align: 'center' });
      doc.text(`Generated ${new Date().toLocaleDateString()} — Elbert Innovative Solutions`, margin, 290);
    }

    const pdfBytes = doc.output('arraybuffer');
    const filename = `${course.title?.replace(/[^a-z0-9]/gi, '_') || 'course'}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('exportCoursePDF error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});