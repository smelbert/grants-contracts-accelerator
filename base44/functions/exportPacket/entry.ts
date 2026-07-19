import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@4.0.0';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { items, zipName } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    // Generate a PDF for each structured-content item using jsPDF
    const pdfs = [];
    for (const item of items) {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let y = margin;

      const addNewPageIfNeeded = (neededHeight) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(20, 58, 80); // #143A50
      const titleLines = doc.splitTextToSize(item.title || 'Untitled', maxWidth);
      titleLines.forEach((line) => {
        addNewPageIfNeeded(8);
        doc.text(line, margin, y);
        y += 8;
      });
      y += 3;

      // Subtitle
      if (item.subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const subLines = doc.splitTextToSize(item.subtitle, maxWidth);
        subLines.forEach((line) => {
          addNewPageIfNeeded(6);
          doc.text(line, margin, y);
          y += 6;
        });
        y += 3;
      }

      // Meta line
      if (item.meta) {
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        const metaLines = doc.splitTextToSize(item.meta, maxWidth);
        metaLines.forEach((line) => {
          addNewPageIfNeeded(5);
          doc.text(line, margin, y);
          y += 5;
        });
        y += 5;
      }

      // Badges
      if (item.badges && item.badges.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 58, 80);
        let badgeX = margin;
        item.badges.forEach((badge) => {
          const badgeText = `  ${badge}  `;
          const badgeWidth = doc.getTextWidth(badgeText) + 6;
          addNewPageIfNeeded(8);
          doc.setFillColor(229, 192, 137); // #E5C089
          doc.roundedRect(badgeX, y - 4, badgeWidth, 6, 1, 1, 'F');
          doc.setTextColor(20, 58, 80);
          doc.text(badgeText, badgeX + 3, y);
          badgeX += badgeWidth + 3;
        });
        y += 10;
      }

      // Sections
      if (item.sections) {
        for (const section of item.sections) {
          // Section heading
          addNewPageIfNeeded(10);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(20, 58, 80);
          const headingLines = doc.splitTextToSize(section.heading, maxWidth);
          headingLines.forEach((line) => {
            addNewPageIfNeeded(7);
            doc.text(line, margin, y);
            y += 7;
          });
          y += 2;

          // Section body
          if (section.body) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(51, 51, 51);
            const bodyLines = doc.splitTextToSize(section.body, maxWidth);
            bodyLines.forEach((line) => {
              addNewPageIfNeeded(6);
              doc.text(line, margin, y);
              y += 6;
            });
            y += 2;
          }

          // List items
          if (section.listItems && section.listItems.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(51, 51, 51);
            for (const li of section.listItems) {
              const itemLines = doc.splitTextToSize(`• ${li}`, maxWidth - 5);
              addNewPageIfNeeded(itemLines.length * 6);
              itemLines.forEach((line, idx) => {
                addNewPageIfNeeded(6);
                doc.text(line, margin + (idx === 0 ? 0 : 5), y);
                y += 6;
              });
            }
            y += 3;
          }

          // Checkbox list items
          if (section.checklistItems && section.checklistItems.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(51, 51, 51);
            for (const li of section.checklistItems) {
              const itemLines = doc.splitTextToSize(li, maxWidth - 8);
              addNewPageIfNeeded(itemLines.length * 6);
              doc.rect(margin, y - 3.5, 4, 4);
              itemLines.forEach((line, idx) => {
                addNewPageIfNeeded(6);
                doc.text(line, margin + 8, y);
                y += 6;
              });
            }
            y += 3;
          }

          y += 3;
        }
      }

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(153, 153, 153);
      doc.text('© Elbert Innovative Solutions', pageWidth / 2, pageHeight - 8, { align: 'center' });

      const pdfBytes = doc.output('arraybuffer');
      pdfs.push({ name: item.name || 'document', data: pdfBytes });
    }

    // Single item → return PDF directly
    if (pdfs.length === 1) {
      return new Response(pdfs[0].data, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfs[0].name.replace(/\s+/g, '_')}.pdf"`
        }
      });
    }

    // Multiple items → zip them
    const zip = new JSZip();
    for (const pdf of pdfs) {
      zip.file(`${pdf.name.replace(/\s+/g, '_')}.pdf`, pdf.data);
    }
    const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });

    return new Response(zipBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${(zipName || 'packet').replace(/\s+/g, '_')}.zip"`
      }
    });
  } catch (error) {
    console.error('Export packet error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});