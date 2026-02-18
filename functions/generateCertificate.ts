import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enrollment_id } = await req.json();

    if (!enrollment_id) {
      return Response.json({ error: 'enrollment_id is required' }, { status: 400 });
    }

    // Get enrollment details
    const enrollment = await base44.asServiceRole.entities.ProgramEnrollment.get(enrollment_id);
    if (!enrollment) {
      return Response.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Get cohort details
    const cohort = await base44.asServiceRole.entities.ProgramCohort.get(enrollment.cohort_id);
    
    // Get all modules for this cohort
    const modules = await base44.asServiceRole.entities.ProgramModule.filter({
      cohort_id: enrollment.cohort_id,
      is_active: true
    });

    // Get module completions
    const completions = await base44.asServiceRole.entities.ModuleCompletion.filter({
      enrollment_id: enrollment_id,
      is_completed: true
    });

    // Check if all required modules are completed
    const requiredModules = modules.filter(m => m.required_for_completion);
    const completedModuleIds = completions.map(c => c.module_id);
    const allRequiredCompleted = requiredModules.every(m => completedModuleIds.includes(m.id));

    if (!allRequiredCompleted) {
      return Response.json({ 
        error: 'Not all required modules completed',
        required: requiredModules.length,
        completed: completions.length
      }, { status: 400 });
    }

    // Calculate total hours
    const totalHours = modules
      .filter(m => completedModuleIds.includes(m.id))
      .reduce((sum, m) => sum + (m.duration_hours || 0), 0);

    // Generate certificate number
    const certificateNumber = `${cohort.program_code}-${Date.now()}-${enrollment.participant_email.substring(0, 3).toUpperCase()}`;

    // Get certificate template
    const templates = await base44.asServiceRole.entities.CertificateTemplate.filter({
      cohort_id: enrollment.cohort_id,
      is_active: true
    });
    
    let template = templates[0];
    if (!template) {
      // Try to get default template
      const defaultTemplates = await base44.asServiceRole.entities.CertificateTemplate.filter({
        is_default: true,
        is_active: true
      });
      template = defaultTemplates[0];
    }

    // Create PDF certificate
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    if (template) {
      // Use custom template
      const bgColor = template.background_color || '#FFFFFF';
      const borderColor = template.border_color || '#143A50';
      const textColor = template.text_color || '#000000';
      const accentColor = template.accent_color || '#E5C089';

      // Parse hex colors to RGB
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
      };

      const bg = hexToRgb(bgColor);
      const border = hexToRgb(borderColor);
      const text = hexToRgb(textColor);
      const accent = hexToRgb(accentColor);

      // Background
      doc.setFillColor(bg.r, bg.g, bg.b);
      doc.rect(0, 0, 297, 210, 'F');

      // Border
      doc.setDrawColor(border.r, border.g, border.b);
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, 267, 180);

      // Title
      doc.setFontSize(36);
      doc.setTextColor(accent.r, accent.g, accent.b);
      doc.text(template.header_text || 'Certificate of Completion', 148.5, 50, { align: 'center' });

      // Body text with placeholder replacement
      let bodyText = template.body_template || 'This certifies that {participant_name} has successfully completed {program_name} on {completion_date}.';
      bodyText = bodyText.replace('{participant_name}', enrollment.participant_name);
      bodyText = bodyText.replace('{program_name}', cohort.program_name);
      bodyText = bodyText.replace('{completion_date}', new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      bodyText = bodyText.replace('{total_hours}', totalHours.toString());
      bodyText = bodyText.replace('{funder_organization}', cohort.funder_organization || '');
      bodyText = bodyText.replace('{delivery_organization}', cohort.delivery_organization || '');

      doc.setFontSize(14);
      doc.setTextColor(text.r, text.g, text.b);
      const splitBody = doc.splitTextToSize(bodyText, 240);
      doc.text(splitBody, 148.5, 90, { align: 'center' });

      // Signatures
      if (template.signature_fields && template.signature_fields.length > 0) {
        const sigY = 150;
        const spacing = 240 / (template.signature_fields.length + 1);
        template.signature_fields.forEach((sig, idx) => {
          const x = 30 + (spacing * (idx + 1));
          doc.setLineWidth(0.5);
          doc.line(x - 30, sigY, x + 30, sigY);
          doc.setFontSize(10);
          doc.setTextColor(text.r, text.g, text.b);
          doc.text(sig.name, x, sigY + 7, { align: 'center' });
          doc.setFontSize(8);
          doc.text(sig.title, x, sigY + 12, { align: 'center' });
        });
      }

      // Footer
      if (template.footer_text) {
        let footerText = template.footer_text;
        footerText = footerText.replace('{funder_organization}', cohort.funder_organization || '');
        footerText = footerText.replace('{delivery_organization}', cohort.delivery_organization || '');
        doc.setFontSize(10);
        doc.setTextColor(text.r, text.g, text.b);
        doc.text(footerText, 148.5, 185, { align: 'center' });
      }

      // Certificate number
      doc.setFontSize(8);
      doc.text(`Certificate No: ${certificateNumber}`, 148.5, 195, { align: 'center' });
    } else {
      // Default template (existing code)
      doc.setFillColor(245, 245, 250);
      doc.rect(0, 0, 297, 210, 'F');
      doc.setDrawColor(20, 58, 80);
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, 267, 180);
      doc.setFontSize(36);
      doc.setTextColor(20, 58, 80);
      doc.text('Certificate of Completion', 148.5, 50, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('This certifies that', 148.5, 70, { align: 'center' });
      doc.setFontSize(28);
      doc.setTextColor(20, 58, 80);
      doc.text(enrollment.participant_name, 148.5, 90, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('has successfully completed', 148.5, 105, { align: 'center' });
      doc.setFontSize(20);
      doc.setTextColor(20, 58, 80);
      doc.text(cohort.program_name, 148.5, 120, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`${totalHours} Total Hours • Completed ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 148.5, 135, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Certificate No: ${certificateNumber}`, 148.5, 175, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(60, 160, 120, 160);
      doc.setFontSize(10);
      doc.text('Program Director', 90, 167, { align: 'center' });
    }

    // Convert to base64
    const pdfBase64 = doc.output('datauristring');

    // Upload to storage
    const pdfBlob = await fetch(pdfBase64).then(r => r.blob());
    const formData = new FormData();
    formData.append('file', pdfBlob, `certificate-${certificateNumber}.pdf`);

    const uploadResponse = await base44.asServiceRole.integrations.Core.UploadFile({
      file: pdfBlob
    });

    // Create certificate record
    const certificate = await base44.asServiceRole.entities.ProgramCertificate.create({
      enrollment_id: enrollment_id,
      cohort_id: enrollment.cohort_id,
      participant_email: enrollment.participant_email,
      participant_name: enrollment.participant_name,
      program_name: cohort.program_name,
      issue_date: new Date().toISOString(),
      completion_date: new Date().toISOString(),
      certificate_number: certificateNumber,
      total_hours: totalHours,
      modules_completed: completedModuleIds,
      certificate_url: uploadResponse.file_url,
      verification_url: `${Deno.env.get('BASE44_APP_URL')}/verify-certificate/${certificateNumber}`,
      is_verified: true
    });

    // Update enrollment
    await base44.asServiceRole.entities.ProgramEnrollment.update(enrollment_id, {
      program_completed: true,
      completion_date: new Date().toISOString()
    });

    console.log(`✅ Certificate generated for ${enrollment.participant_email}`);

    return Response.json({
      success: true,
      certificate,
      certificate_url: uploadResponse.file_url
    });

  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});