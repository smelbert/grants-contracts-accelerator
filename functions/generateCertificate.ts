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
      <div style="display:flex;justify-content:center;gap:64px;margin-top:28px;flex-wrap:wrap;">
        ${sigs.map(sig => `
          <div style="text-align:center;">
            ${sig.signature_image_url ? `<img src="${sig.signature_image_url}" style="height:40px;object-fit:contain;margin-bottom:4px;display:block;margin-left:auto;margin-right:auto;" />` : '<div style="height:40px;"></div>'}
            <div style="width:180px;border-top:2px solid ${primary};margin-bottom:6px;"></div>
            <p style="margin:0;font-size:13px;font-weight:700;color:${textColor};letter-spacing:0.5px;">${sig.name}</p>
            <p style="margin:2px 0 0;font-size:10px;color:${primary};text-transform:uppercase;letter-spacing:1px;">${sig.title}</p>
          </div>`).join('')}
      </div>` : '';

    const logoHtml = template?.logo_url || template?.co_logo_url ? `
      <div style="display:flex;justify-content:center;align-items:center;gap:48px;margin-bottom:20px;">
        ${template?.logo_url ? `<img src="${template.logo_url}" style="height:56px;max-width:180px;object-fit:contain;" />` : ''}
        ${template?.logo_url && template?.co_logo_url ? `<div style="width:1px;height:48px;background:${secondary};opacity:0.5;"></div>` : ''}
        ${template?.co_logo_url ? `<img src="${template.co_logo_url}" style="height:56px;max-width:180px;object-fit:contain;" />` : ''}
      </div>` : '';

    const isPortrait = ['blue_wave_portrait', 'gold_ribbon_portrait', 'red_geometric_portrait'].includes(layout);

    // Build layout-specific HTML
    let bodyHtml = '';

    if (layout === 'gold_ribbon_landscape') {
      bodyHtml = `
        <div style="width:1100px;height:778px;position:relative;overflow:hidden;background:${bgColor};font-family:'Georgia',serif;">
          <!-- Top bar -->
          <div style="position:absolute;top:0;left:0;right:0;height:72px;background:linear-gradient(90deg,${primary} 0%,${secondary} 40%,${primary} 100%);"></div>
          <!-- Bottom bar -->
          <div style="position:absolute;bottom:0;left:0;right:0;height:52px;background:linear-gradient(90deg,${primary} 0%,${secondary} 40%,${primary} 100%);display:flex;align-items:center;justify-content:center;">
            <p style="color:rgba(255,255,255,0.85);font-size:10px;margin:0;font-family:Arial,sans-serif;letter-spacing:1px;">${resolvedFooter} &nbsp;·&nbsp; Certificate No: ${certificateNumber}</p>
          </div>
          <!-- Ribbon decoration left -->
          <div style="position:absolute;top:72px;left:40px;width:28px;height:180px;background:linear-gradient(180deg,${secondary},#B8860B);box-shadow:4px 0 12px rgba(0,0,0,0.15);"></div>
          <div style="position:absolute;top:252px;left:26px;width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:24px solid ${secondary};"></div>
          <!-- Inner frame -->
          <div style="position:absolute;top:92px;left:88px;right:40px;bottom:72px;border:2px solid ${secondary};border-radius:4px;"></div>
          <div style="position:absolute;top:100px;left:96px;right:48px;bottom:80px;border:1px solid rgba(0,0,0,0.08);border-radius:2px;"></div>
          <!-- Content -->
          <div style="position:absolute;top:92px;left:88px;right:40px;bottom:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 56px;text-align:center;">
            ${logoHtml}
            <h1 style="font-size:42px;font-weight:700;color:${primary};margin:0 0 6px;letter-spacing:-0.5px;">${headerText}</h1>
            <div style="display:flex;align-items:center;gap:16px;margin:10px 0 18px;width:80%;">
              <div style="flex:1;height:1px;background:${secondary};"></div>
              <span style="color:${secondary};font-size:20px;">✦</span>
              <div style="flex:1;height:1px;background:${secondary};"></div>
            </div>
            <p style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:${primary};margin:0 0 10px;font-family:Arial,sans-serif;">This Certificate is Proudly Presented to</p>
            <h2 style="font-size:48px;font-style:italic;font-weight:400;color:${primary};margin:0 0 14px;">${enrollment.participant_name}</h2>
            <p style="font-size:13px;line-height:1.7;color:${textColor};max-width:560px;font-family:Arial,sans-serif;">${bodyText}</p>
            ${signatureHtml}
          </div>
        </div>`;
    } else if (layout === 'teal_geometric_landscape') {
      bodyHtml = `
        <div style="width:1100px;height:778px;position:relative;overflow:hidden;background:white;font-family:'Georgia',serif;">
          <!-- SVG geometric background -->
          <svg style="position:absolute;inset:0;width:100%;height:100%;" viewBox="0 0 1100 778" preserveAspectRatio="none">
            <polygon points="1100,0 1100,340 550,0" fill="${primary}" opacity="0.06"/>
            <polygon points="0,778 0,440 550,778" fill="${secondary}" opacity="0.08"/>
          </svg>
          <!-- Top gradient bar -->
          <div style="position:absolute;top:0;left:0;right:0;height:88px;background:linear-gradient(90deg,${primary} 0%,${secondary} 100%);display:flex;align-items:center;justify-content:center;">
            <div style="width:64px;height:64px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
              <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,${secondary},#B8860B);display:flex;align-items:center;justify-content:center;">
                <span style="font-size:22px;color:white;">★</span>
              </div>
            </div>
          </div>
          <!-- Bottom gradient bar -->
          <div style="position:absolute;bottom:0;left:0;right:0;height:64px;background:linear-gradient(90deg,${secondary} 0%,${primary} 100%);display:flex;align-items:center;justify-content:center;">
            <p style="color:rgba(255,255,255,0.85);font-size:10px;margin:0;font-family:Arial,sans-serif;letter-spacing:1px;">${resolvedFooter} &nbsp;·&nbsp; Certificate No: ${certificateNumber}</p>
          </div>
          <!-- Content -->
          <div style="position:absolute;top:88px;left:0;right:0;bottom:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 88px;text-align:center;">
            ${logoHtml}
            <h1 style="font-size:46px;font-weight:700;color:${primary};margin:0 4px 0 0;letter-spacing:-1px;display:inline;">${headerText.split(' ')[0]} </h1><span style="font-size:18px;letter-spacing:5px;color:${secondary};text-transform:uppercase;font-family:Arial,sans-serif;">${headerText.split(' ').slice(1).join(' ')}</span>
            <p style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:${primary};margin:14px 0 8px;font-family:Arial,sans-serif;">This Certificate is Proudly Presented to</p>
            <h2 style="font-size:48px;font-style:italic;font-weight:400;color:${primary};margin:0 0 14px;">${enrollment.participant_name}</h2>
            <p style="font-size:13px;line-height:1.7;color:${textColor};max-width:580px;font-family:Arial,sans-serif;">${bodyText}</p>
            ${signatureHtml}
          </div>
        </div>`;
    } else if (isPortrait) {
      const bgGrad = layout === 'red_geometric_portrait' ? `linear-gradient(160deg, #fff5f5 0%, #fff 60%)` : bgColor;
      const topBarColor = layout === 'red_geometric_portrait'
        ? `linear-gradient(90deg,${primary} 0%,${secondary} 50%,${primary} 100%)`
        : `linear-gradient(135deg,${primary} 0%,${secondary} 100%)`;
      bodyHtml = `
        <div style="width:850px;height:1100px;position:relative;overflow:hidden;background:${bgGrad};font-family:'Georgia',serif;">
          <!-- Top bar -->
          <div style="position:absolute;top:0;left:0;right:0;height:88px;background:${topBarColor};"></div>
          <!-- Bottom bar -->
          <div style="position:absolute;bottom:0;left:0;right:0;height:64px;background:${topBarColor};display:flex;align-items:center;justify-content:center;">
            <p style="color:rgba(255,255,255,0.85);font-size:9px;margin:0;font-family:Arial,sans-serif;letter-spacing:1px;">${resolvedFooter} &nbsp;·&nbsp; Cert No: ${certificateNumber}</p>
          </div>
          <!-- Outer border frame -->
          <div style="position:absolute;top:104px;left:28px;right:28px;bottom:80px;border:2px solid ${secondary};border-radius:4px;"></div>
          <div style="position:absolute;top:112px;left:36px;right:36px;bottom:88px;border:1px solid rgba(0,0,0,0.07);border-radius:2px;"></div>
          <!-- Corner ornaments -->
          <div style="position:absolute;top:104px;left:28px;width:32px;height:32px;border-top:4px solid ${secondary};border-left:4px solid ${secondary};border-radius:4px 0 0 0;"></div>
          <div style="position:absolute;top:104px;right:28px;width:32px;height:32px;border-top:4px solid ${secondary};border-right:4px solid ${secondary};border-radius:0 4px 0 0;"></div>
          <div style="position:absolute;bottom:80px;left:28px;width:32px;height:32px;border-bottom:4px solid ${secondary};border-left:4px solid ${secondary};border-radius:0 0 0 4px;"></div>
          <div style="position:absolute;bottom:80px;right:28px;width:32px;height:32px;border-bottom:4px solid ${secondary};border-right:4px solid ${secondary};border-radius:0 0 4px 0;"></div>
          <!-- Seal badge -->
          <div style="position:absolute;top:72px;left:50%;transform:translateX(-50%);width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,${secondary},#B8860B);border:4px solid white;box-shadow:0 4px 20px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;z-index:10;">
            <span style="font-size:28px;color:white;">★</span>
          </div>
          <!-- Content -->
          <div style="position:absolute;top:152px;left:0;right:0;bottom:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 56px;text-align:center;gap:14px;">
            ${logoHtml}
            <h1 style="font-size:36px;font-weight:700;color:${primary};margin:0;letter-spacing:-0.5px;">${headerText}</h1>
            <div style="display:flex;align-items:center;gap:12px;width:70%;">
              <div style="flex:1;height:1px;background:${secondary};"></div>
              <span style="color:${secondary};font-size:14px;">✦</span>
              <div style="flex:1;height:1px;background:${secondary};"></div>
            </div>
            <p style="font-size:10px;text-transform:uppercase;letter-spacing:2.5px;color:${primary};margin:0;font-family:Arial,sans-serif;">This Certificate is Presented to</p>
            <h2 style="font-size:44px;font-style:italic;font-weight:400;color:${primary};margin:0;">${enrollment.participant_name}</h2>
            <p style="font-size:12px;line-height:1.8;color:${textColor};max-width:480px;font-family:Arial,sans-serif;">${bodyText}</p>
            ${signatureHtml}
          </div>
        </div>`;
    } else {
      // blue_wave_landscape (default)
      bodyHtml = `
        <div style="width:1100px;height:778px;position:relative;overflow:hidden;background:linear-gradient(150deg,#f7f9fc 0%,#edf1f7 100%);font-family:'Georgia',serif;">
          <!-- Top wave -->
          <div style="position:absolute;top:0;left:0;right:0;height:130px;overflow:hidden;">
            <svg viewBox="0 0 1100 130" style="width:100%;height:100%;" preserveAspectRatio="none">
              <path d="M0,0 L1100,0 L1100,90 Q880,130 550,90 Q220,50 0,100 Z" fill="${primary}"/>
              <path d="M0,0 L1100,0 L1100,60 Q880,100 550,60 Q220,20 0,70 Z" fill="${secondary}" opacity="0.35"/>
            </svg>
            <!-- Medal in top bar -->
            <div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${secondary},#B8860B);border:4px solid rgba(255,255,255,0.8);box-shadow:0 6px 24px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
              <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#FFE566,${secondary});border:3px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;">
                <span style="font-size:24px;">🏅</span>
              </div>
            </div>
          </div>
          <!-- Bottom wave -->
          <div style="position:absolute;bottom:0;left:0;right:0;height:80px;overflow:hidden;">
            <svg viewBox="0 0 1100 80" style="width:100%;height:100%;" preserveAspectRatio="none">
              <path d="M0,80 L1100,80 L1100,30 Q880,0 550,30 Q220,60 0,10 Z" fill="${primary}"/>
            </svg>
            <div style="position:absolute;bottom:12px;left:0;right:0;text-align:center;">
              <p style="color:rgba(255,255,255,0.8);font-size:10px;margin:0;font-family:Arial,sans-serif;letter-spacing:1px;">${resolvedFooter} &nbsp;·&nbsp; Certificate No: ${certificateNumber}</p>
            </div>
          </div>
          <!-- Content -->
          <div style="position:absolute;top:130px;left:0;right:0;bottom:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 88px;text-align:center;gap:10px;">
            ${logoHtml}
            <div>
              <h1 style="font-size:46px;font-weight:700;color:${primary};margin:0;letter-spacing:-1px;display:inline;">${headerText.split(' ')[0]} </h1><span style="font-size:22px;color:${secondary};font-family:Arial,sans-serif;">${headerText.split(' ').slice(1).join(' ')}</span>
            </div>
            <p style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:${primary};margin:0;font-family:Arial,sans-serif;">This Certificate is Presented To</p>
            <h2 style="font-size:48px;font-style:italic;font-weight:400;color:${primary};margin:0;">${enrollment.participant_name}</h2>
            <p style="font-size:13px;line-height:1.7;color:${textColor};max-width:620px;font-family:Arial,sans-serif;">${bodyText}</p>
            ${signatureHtml}
          </div>
        </div>`;
    }

    const pageSize = isPortrait ? 'size: 8.5in 11in portrait;' : 'size: 11in 8.5in landscape;';

    const htmlCertificate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate - ${enrollment.participant_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #d0d0d0; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 32px; }
    .certificate-wrap { background: white; box-shadow: 0 12px 48px rgba(0,0,0,0.22); overflow: hidden; display: inline-block; }
    @media print {
      @page { ${pageSize} margin: 0; }
      body { background: white; padding: 0; display: block; }
      .certificate-wrap { box-shadow: none; width: 100%; }
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
      program_name: cohort?.program_name || '',
      issue_date: new Date().toISOString(),
      completion_date: new Date().toISOString(),
      certificate_number: certificateNumber,
      total_hours: totalHours,
      modules_completed: completedModuleIds,
      certificate_url: uploadResponse.file_url,
      certificate_html: htmlCertificate,
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