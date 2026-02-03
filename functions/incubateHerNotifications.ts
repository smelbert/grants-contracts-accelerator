import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { type, enrollmentId, participantEmail, participantName } = await req.json();

    let emailSubject = '';
    let emailBody = '';

    // Email templates based on notification type
    switch (type) {
      case 'welcome':
        emailSubject = 'Welcome to IncubateHer – Funding Readiness Program';
        emailBody = `
          <h2>Welcome to IncubateHer, ${participantName}!</h2>
          <p>You're officially enrolled in the <strong>Funding Readiness: Preparing for Grants & Contracts</strong> program, a collaboration between <strong>Elbert Innovative Solutions</strong> and <strong>Columbus Urban League</strong>.</p>
          
          <h3>Next Steps:</h3>
          <ul>
            <li>Complete your Pre-Assessment to establish your funding readiness baseline</li>
            <li>Select your preferred schedule option</li>
            <li>Review the program agenda and workbook materials</li>
          </ul>
          
          <p><a href="${Deno.env.get('BASE44_APP_URL')}/IncubateHerOverview">Access Your Program Dashboard</a></p>
          
          <p>Questions? Contact us at support@elbertinnovativesolutions.org</p>
        `;
        break;

      case 'pre_assessment_reminder':
        emailSubject = 'Reminder: Complete Your Pre-Assessment';
        emailBody = `
          <h2>Hi ${participantName},</h2>
          <p>We noticed you haven't completed your Pre-Assessment yet. This is an important first step to measure your funding readiness baseline and customize your program experience.</p>
          
          <p>The assessment takes about 10-15 minutes and will help us understand your current knowledge and needs.</p>
          
          <p><a href="${Deno.env.get('BASE44_APP_URL')}/IncubateHerPreAssessment">Complete Your Pre-Assessment Now</a></p>
        `;
        break;

      case 'pre_assessment_complete':
        emailSubject = 'Pre-Assessment Complete – Book Your Consultation';
        emailBody = `
          <h2>Great work, ${participantName}!</h2>
          <p>You've completed your Pre-Assessment and established your funding readiness baseline. Now it's time to schedule your one-on-one consultation with our expert coaches.</p>
          
          <h3>Next Steps:</h3>
          <ul>
            <li>Review your readiness profile on your dashboard</li>
            <li>Book your 1:1 consultation at a convenient time</li>
            <li>Prepare any questions or documents for review</li>
          </ul>
          
          <p><a href="${Deno.env.get('BASE44_APP_URL')}/IncubateHerConsultations">Book Your Consultation</a></p>
        `;
        break;

      case 'consultation_booked':
        emailSubject = 'Consultation Scheduled – Prepare for Success';
        emailBody = `
          <h2>Your consultation is confirmed!</h2>
          <p>Hi ${participantName}, your one-on-one funding readiness consultation is scheduled.</p>
          
          <h3>Before Your Consultation:</h3>
          <ul>
            <li>Complete the consultation intake checklist</li>
            <li>Upload required organizational documents</li>
            <li>Prepare your questions about grants, contracts, or funding readiness</li>
          </ul>
          
          <p><a href="${Deno.env.get('BASE44_APP_URL')}/IncubateHerConsultations">Access Your Consultation Prep Materials</a></p>
        `;
        break;

      case 'session_reminder':
        emailSubject = 'Reminder: IncubateHer Session Tomorrow';
        emailBody = `
          <h2>Session Reminder</h2>
          <p>Hi ${participantName}, your IncubateHer session is coming up tomorrow!</p>
          
          <p>Make sure you're ready:</p>
          <ul>
            <li>Review the agenda and pre-session materials</li>
            <li>Prepare questions for the facilitator</li>
            <li>Log in a few minutes early to test your connection</li>
          </ul>
          
          <p><a href="${Deno.env.get('BASE44_APP_URL')}/IncubateHerAgenda">View Session Agenda</a></p>
        `;
        break;

      case 'documents_reminder':
        emailSubject = 'Action Required: Upload Program Documents';
        emailBody = `
          <h2>Document Upload Reminder</h2>
          <p>Hi ${participantName}, we're missing some required documents for your program completion.</p>
          
          <p>Please upload the following organizational documents:</p>
          <ul>
            <li>Mission statement</li>
            <li>Budget or financial statements</li>
            <li>Board list</li>
            <li>Any other required documents listed in your workbook</li>
          </ul>
          
          <p><a href="${Deno.env.get('BASE44_APP_URL')}/IncubateHerWorkbook">Upload Documents</a></p>
        `;
        break;

      case 'post_assessment_available':
        emailSubject = 'Time to Measure Your Growth – Post-Assessment Available';
        emailBody = `
          <h2>You're almost done, ${participantName}!</h2>
          <p>You've completed all program sessions and it's time to measure your growth. The Post-Assessment is now available.</p>
          
          <p>This assessment will show you how much you've learned and improved your funding readiness. Plus, completing it is required for:</p>
          <ul>
            <li>Program completion certificate</li>
            <li>Giveaway eligibility</li>
            <li>Final consultation recap</li>
          </ul>
          
          <p><a href="${Deno.env.get('BASE44_APP_URL')}/IncubateHerPostAssessment">Complete Your Post-Assessment</a></p>
        `;
        break;

      case 'program_complete':
        emailSubject = 'Congratulations! IncubateHer Program Complete';
        emailBody = `
          <h2>Congratulations, ${participantName}! 🎉</h2>
          <p>You've successfully completed the <strong>IncubateHer – Funding Readiness</strong> program!</p>
          
          <h3>Your Achievements:</h3>
          <ul>
            <li>Completed all program sessions</li>
            <li>Finished pre and post assessments</li>
            <li>Participated in one-on-one consultation</li>
            <li>Submitted organizational documents</li>
          </ul>
          
          <p><strong>Next Steps:</strong> Review your growth metrics, consultation recap, and next action steps on your dashboard.</p>
          
          <p><a href="${Deno.env.get('BASE44_APP_URL')}/IncubateHerCompletion">View Your Completion Dashboard</a></p>
          
          <p>Thank you for your dedication and commitment. We're excited to see your funding success!</p>
        `;
        break;

      case 'giveaway_eligible':
        emailSubject = 'You\'re Eligible for the Program Giveaway!';
        emailBody = `
          <h2>Exciting News, ${participantName}!</h2>
          <p>By completing all program requirements, you're now <strong>eligible for the program giveaway</strong>!</p>
          
          <p>Your name has been added to the eligible pool for the random drawing. Winners will be announced soon.</p>
          
          <p><a href="${Deno.env.get('BASE44_APP_URL')}/IncubateHerGiveaway">Check Giveaway Details</a></p>
          
          <p><em>Note: Federal grants are excluded. This giveaway is subject to program rules and eligibility requirements.</em></p>
        `;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    // Send email via Base44 Core integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: participantEmail,
      subject: emailSubject,
      body: emailBody,
      from_name: 'IncubateHer Program'
    });

    return Response.json({ 
      success: true, 
      message: `${type} notification sent to ${participantEmail}` 
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});