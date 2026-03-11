import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    // Build HTML certificate
    const primary = template?.primary_color || '#143A50';
    const secondary = template?.secondary_color || '#E5C089';
    const bgColor = template?.background_color || '#FFFFFF';
    const textColor = template?.text_color || '#000000';
    const headerText = template?.header_text || 'Certificate of Completion';
    const footerText = template?.footer_text || '';
    const layout = template?.template_layout || 'blue_wave_landscape';

    const completionDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    let bodyText = template?.body_template || 'This certifies that {participant_name} has successfully completed {program_name} on {completion_date}.';
    const replacements = {
      participant_name: enrollment.participant_name,
      program_name: cohort?.program_name || '',
      completion_date: completionDate,
      total_hours: totalHours.toString(),
      funder_organization: cohort?.funder_organization || '',
      delivery_organization: cohort?.delivery_organization || ''
    };
    Object.keys(replacements).forEach(k => {
      bodyText = bodyText.replace(new RegExp(`{${k}}`, 'g'), replacements[k]);
    });
    let resolvedFooter = footerText;
    Object.keys(replacements).forEach(k => {
      resolvedFooter = resolvedFooter.replace(new RegExp(`{${k}}`, 'g'), replacements[k]);
    });

    const sigs = template?.signature_fields || [];

    const signatureHtml = sigs.length > 0 ? `
      <div style="display:flex;justify-content:center;gap:80px;margin-top:24px;">
        ${sigs.map(sig => `
          <div style="text-align:center;">
            <div style="width:160px;border-top:2px solid ${primary};margin-bottom:6px;"></div>
            <p style="margin:0;font-size:13px;font-weight:600;color:${textColor};">${sig.name}</p>
            <p style="margin:0;font-size:11px;color:${primary};">${sig.title}</p>
          </div>`).join('')}
      </div>` : '';

    const logoHtml = template?.logo_url || template?.co_logo_url ? `
      <div style="display:flex;justify-content:center;gap:40px;align-items:center;margin-bottom:16px;">
        ${template?.logo_url ? `<img src="${template.logo_url}" style="height:48px;object-fit:contain;" />` : ''}
        ${template?.co_logo_url ? `<img src="${template.co_logo_url}" style="height:48px;object-fit:contain;" />` : ''}
      </div>` : '';

    // Build layout-specific HTML
    let bodyHtml = '';

    if (layout === 'gold_ribbon_landscape') {
      bodyHtml = `
        <div style="position:relative;width:100%;padding-top:56.25%;overflow:hidden;background:${bgColor};">
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;">
            <div style="height:80px;background:linear-gradient(90deg,${primary} 0%,${secondary} 50%,${primary} 100%);"></div>
            <div style="flex:1;display:flex;align-items:center;padding:0 48px;">
              <div style="border:3px solid ${primary};border-radius:8px;padding:32px 40px;width:100%;background:rgba(255,255,255,0.85);">
                ${logoHtml}
                <h1 style="text-align:center;font-size:38px;font-family:Georgia,serif;color:${primary};margin:0 0 8px;">${headerText}</h1>
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                  <div style="flex:1;height:1px;background:${secondary};"></div>
                  <span style="color:${secondary};font-size:18px;">★</span>
                  <div style="flex:1;height:1px;background:${secondary};"></div>
                </div>
                <p style="text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:${primary};margin:0 0 8px;">This certificate is proudly presented to</p>
                <h2 style="text-align:center;font-size:42px;font-family:Georgia,serif;font-style:italic;color:${primary};margin:0 0 12px;">${enrollment.participant_name}</h2>
                <p style="text-align:center;font-size:13px;line-height:1.6;color:${textColor};margin:0 0 16px;">${bodyText}</p>
                ${signatureHtml}
              </div>
            </div>
            <div style="height:56px;background:linear-gradient(90deg,${primary} 0%,${secondary} 50%,${primary} 100%);"></div>
          </div>
        </div>`;
    } else if (layout === 'teal_geometric_landscape') {
      bodyHtml = `
        <div style="position:relative;width:100%;padding-top:56.25%;overflow:hidden;background:white;">
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;">
            <div style="height:96px;background:linear-gradient(90deg,${primary} 0%,${secondary} 100%);display:flex;align-items:center;justify-content:center;">
              <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,${secondary},#FFD700);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,0.2);">
                <span style="font-size:32px;">★</span>
              </div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 80px;gap:16px;text-align:center;">
              ${logoHtml}
              <div>
                <h1 style="font-size:44px;font-weight:700;color:${primary};margin:0;">${headerText.split(' ')[0]}</h1>
                <h2 style="font-size:18px;letter-spacing:4px;color:${secondary};margin:4px 0 0;text-transform:uppercase;">${headerText.split(' ').slice(1).join(' ')}</h2>
              </div>
              <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:${primary};margin:0;">This certificate is proudly presented to</p>
              <h2 style="font-size:42px;font-family:Georgia,serif;font-style:italic;color:${primary};margin:0;">${enrollment.participant_name}</h2>
              <p style="font-size:13px;line-height:1.6;color:${textColor};max-width:600px;margin:0;">${bodyText}</p>
              ${signatureHtml}
            </div>
            <div style="height:72px;background:linear-gradient(90deg,${secondary} 0%,${primary} 100%);"></div>
          </div>
        </div>`;
    } else if (layout === 'blue_wave_portrait' || layout === 'gold_ribbon_portrait' || layout === 'red_geometric_portrait') {
      bodyHtml = `
        <div style="position:relative;width:100%;padding-top:129%;overflow:hidden;background:${bgColor};">
          <div style="position:absolute;inset:0;border:3px solid ${primary};margin:24px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:48px 40px 32px;">
            <div style="text-align:center;">
              ${logoHtml}
              <h1 style="font-size:34px;font-weight:700;color:${primary};margin:0 0 8px;">${headerText}</h1>
              <div style="width:100%;height:2px;background:linear-gradient(90deg,transparent,${secondary},transparent);margin-bottom:16px;"></div>
            </div>
            <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center;gap:12px;">
              <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:${primary};margin:0;">This certificate is presented to</p>
              <h2 style="font-size:38px;font-family:Georgia,serif;font-style:italic;color:${primary};margin:0;">${enrollment.participant_name}</h2>
              <p style="font-size:12px;line-height:1.7;color:${textColor};margin:0;">${bodyText}</p>
            </div>
            <div style="width:100%;text-align:center;">
              ${signatureHtml}
              ${resolvedFooter ? `<p style="margin-top:16px;font-size:10px;color:${primary};">${resolvedFooter}</p>` : ''}
              <p style="margin-top:8px;font-size:9px;color:#999;">Certificate No: ${certificateNumber}</p>
            </div>
          </div>
        </div>`;
    } else {
      // blue_wave_landscape (default)
      bodyHtml = `
        <div style="position:relative;width:100%;padding-top:56.25%;overflow:hidden;background:linear-gradient(135deg,#f8f9fa,#e9ecef);">
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;">
            <div style="height:120px;background:${primary};clip-path:ellipse(110% 100% at 50% 0%);display:flex;align-items:flex-start;justify-content:center;padding-top:16px;">
              <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${secondary},#FFD700);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,0.25);">
                <span style="font-size:36px;">🏅</span>
              </div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px 80px;gap:12px;">
              ${logoHtml}
              <div>
                <h1 style="font-size:44px;font-weight:700;color:${primary};margin:0;">${headerText.split(' ')[0]}</h1>
                <h2 style="font-size:20px;color:${secondary};margin:4px 0 0;">${headerText.split(' ').slice(1).join(' ')}</h2>
              </div>
              <p style="font-size:11px;text-transform:uppercase;letter-spacing:3px;color:${primary};margin:0;">This Certificate is Presented To</p>
              <h2 style="font-size:40px;font-family:Georgia,serif;font-style:italic;color:${primary};margin:0;">${enrollment.participant_name}</h2>
              <p style="font-size:13px;line-height:1.6;color:${textColor};max-width:640px;margin:0;">${bodyText}</p>
              ${signatureHtml}
            </div>
            <div style="height:80px;background:${primary};clip-path:ellipse(110% 100% at 50% 100%);display:flex;align-items:flex-end;justify-content:center;padding-bottom:12px;">
              <p style="color:rgba(255,255,255,0.7);font-size:10px;margin:0;">
                ${resolvedFooter} &nbsp;|&nbsp; Certificate No: ${certificateNumber}
              </p>
            </div>
          </div>
        </div>`;
    }

    const htmlCertificate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate - ${enrollment.participant_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Georgia&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #e8e8e8; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .certificate-wrap { width: 100%; max-width: 1100px; background: white; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
    @media print {
      body { background: white; }
      .certificate-wrap { max-width: 100%; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="certificate-wrap">
    ${bodyHtml}
  </div>
</body>
</html>`;

    // Upload HTML file to storage
    const htmlBlob = new Blob([htmlCertificate], { type: 'text/html' });
    const uploadResponse = await base44.asServiceRole.integrations.Core.UploadFile({
      file: htmlBlob
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