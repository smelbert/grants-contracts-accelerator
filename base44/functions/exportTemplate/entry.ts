import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, templateName } = await req.json();

    if (!templateId || !templateName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the full template from Base44
    const templates = await base44.entities.Template.filter({ id: templateId });
    const template = templates[0];

    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Build structured content from the template entity
    const formatDate = () =>
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const badges = [
      template.category || 'General',
      template.maturity_level || 'All',
      template.funding_lane || 'General',
    ].filter(Boolean);

    const sections: Array<{ heading: string; body?: string; listItems?: string[] }> = [];
    if (template.when_to_use) sections.push({ heading: '✓ When to Use', body: template.when_to_use });
    if (template.when_not_to_use) sections.push({ heading: '✗ When NOT to Use', body: template.when_not_to_use });
    if (template.what_funders_look_for) sections.push({ heading: '👁 What Funders Look For', body: template.what_funders_look_for });
    if (template.common_mistakes) sections.push({ heading: '⚠ Common Mistakes to Avoid', body: template.common_mistakes });

    if (template.template_content) {
      const plainContent = template.template_content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (plainContent) sections.push({ heading: 'Template Content', body: plainContent });
    }

    // Render the structured content to a PDF with jsPDF
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    const addNewPageIfNeeded = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 58, 80);
    const titleLines = doc.splitTextToSize(template.template_name || 'Untitled', maxWidth);
    titleLines.forEach((line: string) => {
      addNewPageIfNeeded(8);
      doc.text(line, margin, y);
      y += 8;
    });
    y += 3;

    // Subtitle (purpose)
    if (template.purpose) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const subLines = doc.splitTextToSize(template.purpose, maxWidth);
      subLines.forEach((line: string) => {
        addNewPageIfNeeded(6);
        doc.text(line, margin, y);
        y += 6;
      });
      y += 3;
    }

    // Meta line
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    const metaText = `Exported: ${formatDate()} | From: Elbert Innovative Solutions`;
    doc.text(metaText, margin, y);
    y += 8;

    // Badges
    if (badges.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 58, 80);
      let badgeX = margin;
      badges.forEach((badge) => {
        const badgeText = `  ${badge}  `;
        const badgeWidth = doc.getTextWidth(badgeText) + 6;
        addNewPageIfNeeded(8);
        doc.setFillColor(229, 192, 137);
        doc.roundedRect(badgeX, y - 4, badgeWidth, 6, 1, 1, 'F');
        doc.setTextColor(20, 58, 80);
        doc.text(badgeText, badgeX + 3, y);
        badgeX += badgeWidth + 3;
      });
      y += 10;
    }

    // Sections
    for (const section of sections) {
      addNewPageIfNeeded(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(20, 58, 80);
      const headingLines = doc.splitTextToSize(section.heading, maxWidth);
      headingLines.forEach((line: string) => {
        addNewPageIfNeeded(7);
        doc.text(line, margin, y);
        y += 7;
      });
      y += 2;

      if (section.body) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(51, 51, 51);
        const bodyLines = doc.splitTextToSize(section.body, maxWidth);
        bodyLines.forEach((line: string) => {
          addNewPageIfNeeded(6);
          doc.text(line, margin, y);
          y += 6;
        });
        y += 4;
      }
      y += 3;
    }

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(153, 153, 153);
    doc.text('© Elbert Innovative Solutions', pageWidth / 2, pageHeight - 8, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(template.template_name || 'template').replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Export template error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});