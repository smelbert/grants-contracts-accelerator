import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    const { templateId, templateName, templateContent, whenToUse, whenNotToUse, whatFundersLookFor, commonMistakes } = await req.json();

    if (!templateId || !templateName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the full template from Base44
    const templates = await base44.entities.Template.filter({ id: templateId });
    const template = templates[0];

    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create HTML for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${templateName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .header {
            border-bottom: 3px solid #143A50;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #143A50;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
            font-size: 14px;
          }
          .metadata {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .badge {
            background: #E5C089;
            color: #143A50;
            padding: 5px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .guidance-boxes {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 30px 0;
          }
          .guidance-box {
            padding: 15px;
            border-left: 4px solid #999;
            background: #f9f9f9;
            page-break-inside: avoid;
          }
          .guidance-box.when-to-use {
            border-left-color: #10b981;
            background: #f0fdf4;
          }
          .guidance-box.when-not {
            border-left-color: #ef4444;
            background: #fef2f2;
          }
          .guidance-box.funders {
            border-left-color: #3b82f6;
            background: #eff6ff;
          }
          .guidance-box.mistakes {
            border-left-color: #f59e0b;
            background: #fffbeb;
          }
          .guidance-box h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .guidance-box p {
            margin: 0;
            font-size: 13px;
          }
          .template-content-header {
            background: linear-gradient(to right, #143A50, #1E4F58);
            color: white;
            padding: 12px 15px;
            margin: 30px 0 0 0;
            border-radius: 4px 4px 0 0;
            font-weight: bold;
          }
          .template-content {
            border: 2px solid #143A50;
            border-top: none;
            padding: 20px;
            background: white;
            border-radius: 0 0 4px 4px;
          }
          .template-content h1, .template-content h2, .template-content h3 {
            color: #143A50;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          table th, table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          table th {
            background: #f5f5f5;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .guidance-boxes { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${template.template_name}</h1>
          <p><strong>${template.purpose || ''}</strong></p>
          <p>Exported: ${new Date().toLocaleDateString()} | From: Elbert Innovative Solutions</p>
        </div>

        <div class="metadata">
          <span class="badge">${template.category || 'General'}</span>
          <span class="badge">${template.maturity_level || 'All'}</span>
          <span class="badge">${template.funding_lane || 'General'}</span>
        </div>

        ${
          (template.when_to_use || template.when_not_to_use || template.what_funders_look_for || template.common_mistakes) 
            ? `<div class="guidance-boxes">
                ${template.when_to_use ? `<div class="guidance-box when-to-use"><h3>✓ When to Use</h3><p>${template.when_to_use}</p></div>` : ''}
                ${template.when_not_to_use ? `<div class="guidance-box when-not"><h3>✗ When NOT to Use</h3><p>${template.when_not_to_use}</p></div>` : ''}
                ${template.what_funders_look_for ? `<div class="guidance-box funders"><h3>👁 What Funders Look For</h3><p>${template.what_funders_look_for}</p></div>` : ''}
                ${template.common_mistakes ? `<div class="guidance-box mistakes"><h3>⚠ Common Mistakes</h3><p>${template.common_mistakes}</p></div>` : ''}
              </div>`
            : ''
        }

        ${
          template.template_content
            ? `<div class="template-content-header">Template Content</div>
               <div class="template-content">${template.template_content}</div>`
            : ''
        }

        <div class="footer">
          <p>© Elbert Innovative Solutions | Funding Readiness Resource Library</p>
          <p>For questions or support, contact your EIS advisor</p>
        </div>
      </body>
      </html>
    `;

    // Convert HTML to PDF using html2pdf
    const response = await fetch('https://html2pdf.app/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          margin: [10, 10, 10, 10],
          filename: `${template.template_name.replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.statusText}`);
    }

    const pdfBlob = await response.blob();
    return new Response(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${template.template_name.replace(/\s+/g, '_')}.pdf"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});