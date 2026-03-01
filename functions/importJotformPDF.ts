import { createClient } from 'npm:@base44/sdk@0.8.6';

const base44 = createClient({ appId: Deno.env.get("BASE44_APP_ID") });

Deno.serve(async (req) => {
  try {
    const { file_url, file_name } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Use AI to extract data from the PDF
    const extracted = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          full_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          cohort: { type: "string" },
          participation_plan: { type: "string" },
          attend_in_person: { type: "string" },
          interested_in_consultation: { type: "string" },
          documents_needed: { type: "string" },
          funding_barrier: { type: "string" },
          existing_items: { type: "string" },
          submission_date: { type: "string" }
        }
      }
    });

    if (extracted.status !== 'success' || !extracted.output) {
      return Response.json({ error: 'Failed to extract data from PDF', details: extracted.details }, { status: 500 });
    }

    const data = Array.isArray(extracted.output) ? extracted.output[0] : extracted.output;
    console.log('Extracted data:', JSON.stringify(data));

    const email = data.email?.trim();
    const fullName = data.full_name?.trim();

    if (!email) {
      return Response.json({ error: 'Could not extract email from PDF' }, { status: 400 });
    }

    // Find or create the cohort
    const cohorts = await base44.asServiceRole.entities.ProgramCohort.filter({
      program_code: 'incubateher-2024'
    });

    let cohort = cohorts[0];
    if (!cohort) {
      cohort = await base44.asServiceRole.entities.ProgramCohort.create({
        program_name: 'IncubateHER Program',
        program_code: 'incubateher-2024',
        funder_organization: 'Columbus Urban League',
        delivery_organization: 'Elbert Innovative Solutions',
        description: 'Comprehensive funding readiness program for women entrepreneurs',
        is_active: true
      });
    }

    // Find or create community space
    const communitySpaces = await base44.asServiceRole.entities.CommunitySpace.filter({
      slug: 'incubateher-cohort'
    });
    let communitySpace = communitySpaces[0];
    if (!communitySpace) {
      communitySpace = await base44.asServiceRole.entities.CommunitySpace.create({
        space_name: 'IncubateHER Community',
        slug: 'incubateher-cohort',
        description: 'Private community space for IncubateHER participants',
        space_type: 'posts',
        visibility: 'members_only',
        is_active: true
      });
    }

    // Invite user
    try {
      await base44.asServiceRole.users.inviteUser(email, 'user');
      console.log(`Invited user: ${email}`);
    } catch (e) {
      console.log('Invite error (may already exist):', e.message);
    }

    // Check/create enrollment
    const existingEnrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({
      participant_email: email,
      cohort_id: cohort.id
    });

    let enrollment;
    const nameParts = (fullName || '').split(' ');
    const firstName = nameParts[0] || '';

    const enrollmentData = {
      cohort_id: cohort.id,
      participant_email: email,
      participant_name: fullName || email,
      role: 'participant',
      enrollment_status: 'active',
      enrolled_date: new Date().toISOString(),
      phone_number: data.phone || '',
      organization_name: data.cohort || ''
    };

    if (existingEnrollments.length === 0) {
      enrollment = await base44.asServiceRole.entities.ProgramEnrollment.create(enrollmentData);
    } else {
      enrollment = existingEnrollments[0];
      await base44.asServiceRole.entities.ProgramEnrollment.update(enrollment.id, {
        participant_name: fullName || enrollment.participant_name,
        phone_number: data.phone || enrollment.phone_number
      });
    }

    // Set user access level
    const existingAccess = await base44.asServiceRole.entities.UserAccessLevel.filter({
      user_email: email
    });

    if (existingAccess.length === 0) {
      await base44.asServiceRole.entities.UserAccessLevel.create({
        user_email: email,
        access_level: 'full_platform',
        entry_point: 'incubateher_program',
        allowed_community_spaces: [communitySpace.id],
        coaching_access: false,
        learning_hub_access: true,
        active_registrations: ['incubateher-program'],
        feature_unlocks: {}
      });
    } else {
      await base44.asServiceRole.entities.UserAccessLevel.update(existingAccess[0].id, {
        entry_point: 'incubateher_program',
        allowed_community_spaces: [communitySpace.id],
        learning_hub_access: true,
        active_registrations: ['incubateher-program']
      });
    }

    // Send welcome email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: 'Welcome to the IncubateHER Program!',
        from_name: 'Elbert Innovative Solutions',
        body: `
          <h2>Welcome to IncubateHER, ${firstName || fullName}!</h2>
          <p>We're thrilled to have you join the IncubateHER Program. Your journey to funding readiness starts now!</p>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Check your email for your platform invitation link</li>
            <li>Complete your profile setup</li>
            <li>Explore the program overview and schedule</li>
          </ol>
          <p>Best regards,<br>The EIS Team</p>
          <hr>
          <p style="font-size: 12px; color: #666;">Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions</p>
        `
      });
    } catch (e) {
      console.error('Email error:', e.message);
    }

    return Response.json({
      success: true,
      email,
      name: fullName,
      enrollment_id: enrollment.id,
      extracted_data: data
    });

  } catch (error) {
    console.error('importJotformPDF error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});