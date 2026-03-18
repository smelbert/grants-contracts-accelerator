import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const {
      participantEmail,
      participantName,
      availability,
      preference,
      duration,
      documentLink,
      notes,
      facilitatorEmail
    } = payload;

    // Send email notification to Charles Watterson
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'IncubateHer Program',
      to: facilitatorEmail,
      subject: `New Consultation Request - ${participantName}`,
      body: `
        <h2>New Consultation Request</h2>
        
        <p><strong>Participant:</strong> ${participantName} (${participantEmail})</p>
        
        <h3>Meeting Details</h3>
        <ul>
          <li><strong>Duration:</strong> ${duration} minutes</li>
          <li><strong>Preference:</strong> ${preference === 'online' ? 'Online (Video Call)' : 'In-Person / Face-to-Face'}</li>
        </ul>
        
        <h3>Availability Options</h3>
        <ol>
          <li>${availability[0]}</li>
          <li>${availability[1]}</li>
          <li>${availability[2]}</li>
        </ol>
        
        ${documentLink ? `<p><strong>Documents:</strong> <a href="${documentLink}">${documentLink}</a></p>` : ''}
        
        ${notes ? `<h3>Additional Notes</h3><p>${notes}</p>` : ''}
        
        <hr />
        <p>Please review the participant's availability and confirm a time slot by reaching out to them at <a href="mailto:${participantEmail}">${participantEmail}</a>.</p>
      `
    });

    // Send confirmation to participant
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'IncubateHer Program',
      to: participantEmail,
      subject: 'Consultation Request Received',
      body: `
        <h2>Your Consultation Request Has Been Received</h2>
        
        <p>Dear ${participantName},</p>
        
        <p>Thank you for submitting your consultation request! Charles Watterson, our program facilitator, has received your availability and will reach out to you within 1-2 business days to confirm your consultation with Dr. Elbert.</p>
        
        <h3>Your Submitted Availability</h3>
        <ol>
          <li>${availability[0]}</li>
          <li>${availability[1]}</li>
          <li>${availability[2]}</li>
        </ol>
        
        <p><strong>Meeting Preference:</strong> ${preference === 'online' ? 'Online (Video Call)' : 'In-Person / Face-to-Face'}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        
        <p>If you have any questions in the meantime, please don't hesitate to reach out to Charles at <a href="mailto:${facilitatorEmail}">${facilitatorEmail}</a>.</p>
        
        <p>Best regards,<br>The IncubateHer Team</p>
      `
    });

    return Response.json({ 
      success: true, 
      message: 'Consultation request notifications sent successfully' 
    });

  } catch (error) {
    console.error('Error sending consultation request:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});