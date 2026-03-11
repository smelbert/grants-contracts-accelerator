import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body_json = await req.json();
    const { notification_type, recipient_email, data } = body_json;

    // Handle bulk pre-assessment reminders
    if (notification_type === 'pre_assessment_reminder') {
      const participants = body_json.participants || [];
      let sent = 0;
      for (const p of participants) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'IncubateHer Program',
          to: p.email,
          subject: 'Action Required: Complete Your IncubateHer Pre-Assessment',
          body: `<p>Hi ${p.name || 'Participant'},</p><p>This is a friendly reminder to complete your IncubateHer Pre-Assessment as soon as possible. The pre-assessment helps us understand your starting point and is required to unlock consultations and the giveaway.</p><p>Log in to your portal and navigate to <strong>Assessments & Evaluations → Pre-Assessment</strong> to complete it.</p><p>It only takes 10–15 minutes.</p><p>Thank you!<br>Elbert Innovative Solutions</p>`
        });
        sent++;
      }
      return Response.json({ success: true, sent });
    }

    // Get participant and cohort details
    const enrollments = await base44.entities.ProgramEnrollment.filter({
      participant_email: recipient_email
    });
    const enrollment = enrollments[0];

    if (!enrollment) {
      return Response.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    const cohorts = await base44.entities.ProgramCohort.filter({
      id: enrollment.cohort_id
    });
    const cohort = cohorts[0];

    // Build email based on notification type
    let subject = '';
    let body = '';

    switch (notification_type) {
      case 'session_reminder':
        subject = `Reminder: IncubateHer Session Tomorrow - ${data.session_title}`;
        const sessionDetails = {
          'March 2': 'Monday, March 2 | 5:30–7:30 PM (Virtual – Google Meet)',
          'March 5': 'Thursday, March 5 | 5:30–7:30 PM (Virtual – Google Meet)',
          'March 7': 'Saturday, March 7 | 9:00 AM–12:00 PM (In Person) - Columbus Metropolitan Library, Shepard Location, Meeting Room 1'
        };
        body = `
          <p>Hello ${enrollment.participant_name},</p>
          
          <p>This is a friendly reminder about your upcoming IncubateHer session:</p>
          
          <p><strong>${sessionDetails[data.session_date] || data.session_title}</strong></p>
          ${data.location_or_link ? `<p><strong>Meeting Link:</strong> ${data.location_or_link}</p>` : ''}
          
          <p><strong>Before the session:</strong></p>
          <ul>
            <li>Review any materials shared in advance</li>
            <li>Bring questions or challenges you'd like to discuss</li>
            <li>Have your workbook ready for exercises</li>
          </ul>
          
          <p>See you soon!</p>
          
          <p>Warm regards,<br>
          Dr. Shawnté Elbert<br>
          Elbert Innovative Solutions</p>
        `;
        break;

      case 'consultation_reminder':
        subject = `Reminder: Your IncubateHer Consultation is Tomorrow`;
        body = `
          <p>Hello ${enrollment.participant_name},</p>
          
          <p>Your one-on-one funding readiness consultation is scheduled for tomorrow:</p>
          
          <p><strong>Date:</strong> ${new Date(data.scheduled_date).toLocaleDateString()}<br>
          <strong>Time:</strong> ${new Date(data.scheduled_date).toLocaleTimeString()}<br>
          <strong>Meeting Link:</strong> <a href="${data.meeting_link}">${data.meeting_link}</a></p>
          
          <p><strong>Please bring:</strong></p>
          <ul>
            <li>1-2 key documents for review</li>
            <li>Your pre-assessment results</li>
            <li>2-3 specific questions prepared</li>
          </ul>
          
          <p><strong>Remember:</strong> This session focuses on readiness and strategy, not application writing.</p>
          
          <p>Looking forward to our conversation!</p>
          
          <p>Best,<br>
          Dr. Shawnte Elbert</p>
        `;
        break;

      case 'consultation_followup':
        subject = `Your IncubateHer Consultation Summary & Next Steps`;
        body = `
          <p>Hello ${enrollment.participant_name},</p>
          
          <p>Thank you for your time during our consultation session. Here's a summary of what we discussed:</p>
          
          <p><strong>Key Strengths Identified:</strong></p>
          ${data.strengths_identified ? `<p>${data.strengths_identified}</p>` : '<p>To be added</p>'}
          
          <p><strong>Areas for Development:</strong></p>
          ${data.gaps_identified ? `<p>${data.gaps_identified}</p>` : '<p>To be added</p>'}
          
          <p><strong>Your Readiness Level:</strong> ${data.readiness_level || 'Assessment in progress'}</p>
          
          <p><strong>Recommended Next Steps:</strong></p>
          ${data.recommended_next_steps ? `<p>${data.recommended_next_steps}</p>` : '<p>To be added</p>'}
          
          <p><strong>Action Items:</strong></p>
          <ul>
            <li>Complete any remaining workbook sections</li>
            <li>Finalize your post-assessment</li>
            <li>Begin implementing the recommendations we discussed</li>
          </ul>
          
          <p>Remember: Funding readiness is a journey. Focus on building your systems and documentation step by step.</p>
          
          <p>If you have questions as you move forward, don't hesitate to reach out.</p>
          
          <p>Warm regards,<br>
          Dr. Shawnte Elbert<br>
          Elbert Innovative Solutions</p>
        `;
        break;

      case 'workbook_reminder':
        subject = `IncubateHer: Complete Your Workbook`;
        body = `
          <p>Hello ${enrollment.participant_name},</p>
          
          <p>We noticed you haven't completed all sections of your IncubateHer workbook yet. Completing the workbook is essential for:</p>
          
          <ul>
            <li>Maximizing your consultation session</li>
            <li>Meeting program completion requirements</li>
            <li>Eligibility for the completion giveaway</li>
          </ul>
          
          <p><strong>Incomplete Sections:</strong></p>
          ${data.incomplete_sections ? `<ul>${data.incomplete_sections.map(s => `<li>${s}</li>`).join('')}</ul>` : '<p>Please review your workbook</p>'}
          
          <p><a href="${data.workbook_link || '#'}">Access Your Workbook</a></p>
          
          <p>Need help? Reach out anytime.</p>
          
          <p>Best,<br>
          The IncubateHer Team</p>
        `;
        break;

      case 'assessment_reminder':
        subject = `IncubateHer: Complete Your ${data.assessment_type === 'pre' ? 'Pre' : 'Post'}-Assessment`;
        body = `
          <p>Hello ${enrollment.participant_name},</p>
          
          <p>Your ${data.assessment_type === 'pre' ? 'pre' : 'post'}-assessment is still pending. This assessment is required to:</p>
          
          <ul>
            ${data.assessment_type === 'pre' ? 
              '<li>Schedule your one-on-one consultation</li>' : 
              '<li>Complete the program requirements</li>'}
            <li>Track your learning progress</li>
            <li>Help us improve the program</li>
          </ul>
          
          <p><a href="${data.assessment_link || '#'}">Complete Your Assessment</a></p>
          
          <p>It only takes 10-15 minutes.</p>
          
          <p>Thank you,<br>
          The IncubateHer Team</p>
        `;
        break;

      case 'consultation_invitation':
        subject = `Next Steps: Schedule Your IncubateHer Funding Readiness Consultation`;
        body = `
          <p>Hello ${enrollment.participant_name},</p>
          
          <p>Thank you for attending the Funding Readiness: Preparing for Grants and Contracts workshop as part of IncubateHer.</p>
          
          <p>Following the group workshop, you have the opportunity to schedule one individual consultation with the facilitator.</p>
          
          <h3 style="margin-top: 20px; margin-bottom: 10px;">What the One-on-One Includes:</h3>
          <ul>
            <li>Review of existing documents (e.g., business overview, draft project description, budget outline, or capability statement)</li>
            <li>Strategic feedback on funding readiness and alignment (grants vs. contracts)</li>
            <li>Clarification of next steps and recommended areas for strengthening</li>
          </ul>
          
          <h3 style="margin-top: 20px; margin-bottom: 10px;">What the One-on-One Does NOT Include:</h3>
          <ul>
            <li>Writing or rewriting grant applications or contracts</li>
            <li>Conducting grant searches or identifying specific funding opportunities</li>
            <li>Ongoing consulting beyond the scheduled session</li>
          </ul>
          
          <h3 style="margin-top: 20px; margin-bottom: 10px;">How to Prepare:</h3>
          <ul>
            <li>Bring 1–2 documents you would like reviewed (drafts are acceptable)</li>
            <li>Be prepared to discuss your business structure, current capacity, and funding goals</li>
            <li>Come with specific questions you want to prioritize during the session</li>
          </ul>
          
          <p style="margin-top: 15px;"><em>Participants who arrive prepared will get the most value from their consultation.</em></p>
          
          <p style="margin-top: 20px;"><strong>👉 Schedule your consultation here:</strong><br>
          <a href="https://calendly.com/drshawnte/incubateher-individual-funding-readiness-consultation">https://calendly.com/drshawnte/incubateher-individual-funding-readiness-consultation</a></p>
          
          <p>If you have any questions or need assistance scheduling, feel free to reach out.</p>
          
          <p>We look forward to supporting your continued growth.</p>
          
          <p>Warm regards,<br>
          DR. E</p>
        `;
        break;

      case 'program_welcome':
        subject = `Welcome to IncubateHer! 🎉 Here's What to Do Next`;
        body = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #143A50; padding: 30px; text-align: center;">
              <h1 style="color: #E5C089; margin: 0;">Welcome to IncubateHer!</h1>
            </div>
            <div style="padding: 30px;">
              <p>Hi ${enrollment.participant_name},</p>
              <p>We are so excited to have you in the <strong>IncubateHer: Funding Readiness for Entrepreneurs</strong> program. Your enrollment is confirmed and your journey begins now!</p>

              <h3 style="color: #143A50;">📋 Your Next Steps</h3>
              <ol>
                <li><strong>Log in to your portal</strong> and explore the Program Overview page</li>
                <li><strong>Complete your profile intake</strong> so we can personalize your experience</li>
                <li><strong>Start your Pre-Assessment</strong> to help us understand your current readiness level</li>
                <li><strong>Review the program schedule</strong> and mark your calendar for upcoming sessions</li>
                <li><strong>Join the community</strong> — introduce yourself in the Community Spaces</li>
              </ol>

              <h3 style="color: #143A50;">🔗 Key Resources</h3>
              <ul>
                <li><a href="https://fundher.base44.app/IncubateHerOverview" style="color: #AC1A5B;">Program Overview</a></li>
                <li><a href="https://fundher.base44.app/IncubateHerSchedule" style="color: #AC1A5B;">Schedule & Videos</a></li>
                <li><a href="https://fundher.base44.app/IncubateHerWorkbook" style="color: #AC1A5B;">Your Workbook</a></li>
                <li><a href="https://fundher.base44.app/IncubateHerPreAssessment" style="color: #AC1A5B;">Pre-Assessment</a></li>
              </ul>

              <h3 style="color: #143A50;">📅 Program Schedule (Quick Reference)</h3>
              <ul>
                <li><strong>Session 1 – March 2:</strong> Virtual | 5:30–7:30 PM</li>
                <li><strong>Session 2 – March 5:</strong> Virtual | 5:30–7:30 PM</li>
                <li><strong>Session 3 – March 7:</strong> In-Person | 9:00 AM–12:00 PM (Columbus Metropolitan Library)</li>
              </ul>

              <h3 style="color: #143A50;">📬 Questions?</h3>
              <p><strong>Email:</strong> <a href="mailto:info@elbertinnovativesolutions.org" style="color: #AC1A5B;">info@elbertinnovativesolutions.org</a><br>
              <strong>Website:</strong> <a href="https://www.elbertinnovativesolutions.org" style="color: #AC1A5B;">www.elbertinnovativesolutions.org</a></p>

              <p>We are rooting for you!</p>
              <p>Warm regards,<br>
              <strong>Dr. Shawnté Elbert</strong><br>
              Elbert Innovative Solutions</p>
            </div>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} Elbert Innovative Solutions. All rights reserved.
            </div>
          </div>
        `;
        break;

      default:
        return Response.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Send email via Core integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'IncubateHer Program',
      to: recipient_email,
      subject: subject,
      body: body
    });

    // Log the notification
    console.log(`Sent ${notification_type} email to ${recipient_email}`);

    return Response.json({ 
      success: true, 
      notification_type,
      recipient: recipient_email 
    });

  } catch (error) {
    console.error('Email notification error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});