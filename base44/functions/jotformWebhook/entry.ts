import { createClient } from 'npm:@base44/sdk@0.8.6';

const base44 = createClient({ appId: Deno.env.get("BASE44_APP_ID") });

Deno.serve(async (req) => {
  try {
    // Parse the incoming JotForm submission
    const formData = await req.formData();
    const rawSubmission = formData.get('rawRequest');
    const submission = rawSubmission ? JSON.parse(rawSubmission) : null;

    if (!submission) {
      console.error('No submission data received');
      return Response.json({ error: 'No submission data' }, { status: 400 });
    }

    console.log('JotForm submission received:', JSON.stringify(submission).substring(0, 500));

    const answers = submission.answers || {};
    
    let email = '';
    let firstName = '';
    let lastName = '';
    let phone = '';
    let organization = '';
    
    Object.values(answers).forEach(answer => {
      const text = Array.isArray(answer.answer) ? answer.answer.join(' ') : (answer.answer || answer.text || '');
      const name = (answer.name || '').toLowerCase();
      const type = (answer.type || '').toLowerCase();
      
      if (name.includes('email') || type === 'control_email') {
        email = typeof text === 'string' ? text.trim() : '';
      } else if ((name.includes('first') && name.includes('name')) || name === 'firstname') {
        firstName = typeof text === 'string' ? text.trim() : '';
      } else if ((name.includes('last') && name.includes('name')) || name === 'lastname') {
        lastName = typeof text === 'string' ? text.trim() : '';
      } else if (name.includes('name') && !firstName && !lastName && type === 'control_fullname') {
        // Handle full name field
        if (answer.answer && typeof answer.answer === 'object') {
          firstName = answer.answer.first || '';
          lastName = answer.answer.last || '';
        } else {
          const parts = text.split(' ');
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        }
      } else if (name.includes('phone')) {
        phone = typeof text === 'string' ? text.trim() : '';
      } else if (name.includes('organization') || name.includes('company') || name.includes('org')) {
        organization = typeof text === 'string' ? text.trim() : '';
      }
    });

    const fullName = `${firstName} ${lastName}`.trim();

    if (!email) {
      console.error('No email found in submission. Answers:', JSON.stringify(answers));
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Processing enrollment for: ${fullName} (${email})`);

    // Find or create the IncubateHer program cohort
    const cohorts = await base44.asServiceRole.entities.ProgramCohort.filter({
      program_code: 'incubateher-2024'
    });
    
    let cohort = cohorts[0];
    if (!cohort) {
      console.log('Creating new IncubateHer cohort');
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
      console.log('Creating IncubateHer community space');
      communitySpace = await base44.asServiceRole.entities.CommunitySpace.create({
        space_name: 'IncubateHER Community',
        slug: 'incubateher-cohort',
        description: 'Private community space for IncubateHER participants',
        space_type: 'posts',
        visibility: 'members_only',
        is_active: true
      });
    }

    // Invite user to the platform
    console.log(`Inviting user: ${email}`);
    try {
      await base44.asServiceRole.users.inviteUser(email, 'user');
    } catch (inviteError) {
      console.log('User invite error (may already exist):', inviteError.message);
    }

    // Check if enrollment already exists
    const existingEnrollments = await base44.asServiceRole.entities.ProgramEnrollment.filter({
      participant_email: email,
      cohort_id: cohort.id
    });

    let enrollment;
    if (existingEnrollments.length === 0) {
      console.log('Creating new enrollment');
      enrollment = await base44.asServiceRole.entities.ProgramEnrollment.create({
        cohort_id: cohort.id,
        participant_email: email,
        participant_name: fullName,
        role: 'participant',
        enrollment_status: 'active',
        enrolled_date: new Date().toISOString(),
        phone_number: phone,
        organization_name: organization
      });
    } else {
      enrollment = existingEnrollments[0];
      console.log('Enrollment already exists, updating...');
      await base44.asServiceRole.entities.ProgramEnrollment.update(enrollment.id, {
        participant_name: fullName,
        phone_number: phone,
        organization_name: organization
      });
    }

    // Set user access level
    const existingAccess = await base44.asServiceRole.entities.UserAccessLevel.filter({
      user_email: email
    });

    if (existingAccess.length === 0) {
      console.log('Creating user access level');
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
      console.log('Updating user access level');
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
            <li>Join your cohort's community space</li>
          </ol>
          
          <p>If you have any questions, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br>
          The EIS Team</p>
          
          <hr>
          <p style="font-size: 12px; color: #666;">
            Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions
          </p>
        `
      });
      console.log('Welcome email sent');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    console.log('Enrollment completed successfully');
    
    return Response.json({ 
      success: true, 
      message: 'Participant enrolled successfully',
      enrollment_id: enrollment.id,
      email: email
    });

  } catch (error) {
    console.error('JotForm webhook error:', error.message, error.stack);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});