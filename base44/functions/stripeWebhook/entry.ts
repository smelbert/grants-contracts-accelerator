import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    console.log('Webhook event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(base44, event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(base44, event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(base44, event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(base44, event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(base44, event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});

async function handleCheckoutCompleted(base44, session) {
  const userEmail = session.customer_email || session.metadata?.user_email;
  const checkoutType = session.metadata?.checkout_type;

  console.log('Checkout completed for:', userEmail, 'Type:', checkoutType);

  // Handle workshop registration
  if (checkoutType === 'workshop' && session.metadata?.registration_page_id) {
    const submissions = await base44.asServiceRole.entities.RegistrationSubmission.filter({
      user_email: userEmail,
      registration_page_id: session.metadata.registration_page_id,
    });

    if (submissions.length > 0) {
      const submission = submissions[0];
      await base44.asServiceRole.entities.RegistrationSubmission.update(submission.id, {
        payment_status: 'paid',
        stripe_payment_intent_id: session.payment_intent,
        access_granted: true,
        access_granted_date: new Date().toISOString(),
      });

      // Grant access
      const accessLevels = await base44.asServiceRole.entities.UserAccessLevel.filter({
        user_email: userEmail,
      });

      if (accessLevels.length > 0) {
        await base44.asServiceRole.entities.UserAccessLevel.update(accessLevels[0].id, {
          access_level: session.metadata.access_level || 'community_only',
        });
      } else {
        await base44.asServiceRole.entities.UserAccessLevel.create({
          user_email: userEmail,
          access_level: session.metadata.access_level || 'community_only',
          entry_point: 'workshop',
        });
      }

      // Send personalized welcome email for workshop/registration payment
      const userName = submission.user_name || session.metadata?.user_name || 'Participant';
      const entryPoint = submission.entry_point || 'workshop';
      await sendRegistrationWelcomeEmail(base44, userEmail, userName, entryPoint);
    }
  }

  // Handle coaching enrollment
  if (checkoutType === 'coaching' && session.metadata?.coaching_package) {
    await base44.asServiceRole.entities.CoachingIntake.create({
      user_email: userEmail,
      user_name: session.metadata.user_name,
      coaching_type: session.metadata.coaching_type || 'professional_development',
      package_selected: session.metadata.coaching_package,
      goals: 'To be completed in intake form',
      intake_completed: false,
    });

    // Grant coaching access
    const accessLevels = await base44.asServiceRole.entities.UserAccessLevel.filter({
      user_email: userEmail,
    });

    if (accessLevels.length > 0) {
      await base44.asServiceRole.entities.UserAccessLevel.update(accessLevels[0].id, {
        access_level: 'coaching_portal',
        coaching_access: true,
      });
    } else {
      await base44.asServiceRole.entities.UserAccessLevel.create({
        user_email: userEmail,
        access_level: 'coaching_portal',
        coaching_access: true,
        entry_point: 'coaching',
      });
    }

    // Send welcome email
    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: 'Welcome to EIS Coaching! Next Steps',
      body: `
        <h2>Thank you for enrolling in coaching!</h2>
        <p>We're excited to support your journey.</p>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Complete your coaching intake form</li>
          <li>Schedule your first session</li>
          <li>Access your coaching portal</li>
        </ol>
        <p>You'll receive a separate email with your intake form link shortly.</p>
      `,
    });
  }

  // Handle subscription
  if (session.mode === 'subscription') {
    await base44.asServiceRole.entities.Subscription.create({
      user_email: userEmail,
      stripe_subscription_id: session.subscription,
      stripe_customer_id: session.customer,
      status: 'active',
      plan_name: session.metadata?.plan_name,
      amount: session.amount_total,
    });
  }
}

async function handleSubscriptionUpdate(base44, subscription) {
  const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
    stripe_subscription_id: subscription.id,
  });

  if (subscriptions.length > 0) {
    await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
      status: subscription.status,
    });

    // Update user access based on subscription status
    if (subscription.status === 'active') {
      const userEmail = subscriptions[0].user_email;
      const accessLevels = await base44.asServiceRole.entities.UserAccessLevel.filter({
        user_email: userEmail,
      });

      const planMetadata = subscription.metadata;
      const accessLevel = planMetadata?.access_level || 'community_only';

      if (accessLevels.length > 0) {
        await base44.asServiceRole.entities.UserAccessLevel.update(accessLevels[0].id, {
          access_level: accessLevel,
        });
      }
    }
  }
}

async function handleSubscriptionCancelled(base44, subscription) {
  const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
    stripe_subscription_id: subscription.id,
  });

  if (subscriptions.length > 0) {
    await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
      status: 'cancelled',
      cancelled_date: new Date().toISOString(),
    });
  }
}

async function handleInvoicePaid(base44, invoice) {
  console.log('Invoice paid:', invoice.id);
  
  await base44.asServiceRole.entities.Invoice.create({
    stripe_invoice_id: invoice.id,
    user_email: invoice.customer_email,
    amount: invoice.amount_paid,
    status: 'paid',
    paid_date: new Date().toISOString(),
  });
}

async function handlePaymentFailed(base44, invoice) {
  console.log('Payment failed:', invoice.id);

  // Notify user
  if (invoice.customer_email) {
    await base44.integrations.Core.SendEmail({
      to: invoice.customer_email,
      subject: 'Payment Failed - Action Required',
      body: `
        <h2>Payment Issue</h2>
        <p>We were unable to process your recent payment.</p>
        <p>Please update your payment method to continue your access.</p>
      `,
    });
  }
}

async function sendRegistrationWelcomeEmail(base44, userEmail, userName, entryPoint) {
  const isIncubateHer = entryPoint === 'incubateher_program';

  let subject, body;

  if (isIncubateHer) {
    subject = `Welcome to IncubateHer! 🎉 Here's What to Do Next`;
    body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #143A50; padding: 30px; text-align: center;">
          <h1 style="color: #E5C089; margin: 0;">Welcome to IncubateHer!</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi ${userName},</p>
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
          <p>Don't hesitate to reach out. We're here to support you every step of the way.</p>
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
  } else {
    // Generic workshop/registration welcome
    subject = `Welcome to Elbert Innovative Solutions! Here's What's Next`;
    body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #143A50; padding: 30px; text-align: center;">
          <h1 style="color: #E5C089; margin: 0;">Welcome to EIS!</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi ${userName},</p>
          <p>Your registration is confirmed and payment received. We're thrilled to have you join the Elbert Innovative Solutions community!</p>

          <h3 style="color: #143A50;">📋 Your Next Steps</h3>
          <ol>
            <li><strong>Log in to your portal</strong> to access your dashboard</li>
            <li><strong>Complete your organization profile</strong> for a personalized experience</li>
            <li><strong>Explore the Resource Library</strong> for tools to support your funding journey</li>
            <li><strong>Check the Events calendar</strong> for upcoming workshops and webinars</li>
          </ol>

          <h3 style="color: #143A50;">🔗 Quick Links</h3>
          <ul>
            <li><a href="https://fundher.base44.app/Home" style="color: #AC1A5B;">Your Dashboard</a></li>
            <li><a href="https://fundher.base44.app/ResourceLibrary" style="color: #AC1A5B;">Resource Library</a></li>
            <li><a href="https://fundher.base44.app/Events" style="color: #AC1A5B;">Events & Workshops</a></li>
            <li><a href="https://fundher.base44.app/Community" style="color: #AC1A5B;">Community Spaces</a></li>
          </ul>

          <h3 style="color: #143A50;">📬 Need Help?</h3>
          <p><strong>Email:</strong> <a href="mailto:info@elbertinnovativesolutions.org" style="color: #AC1A5B;">info@elbertinnovativesolutions.org</a><br>
          <strong>Website:</strong> <a href="https://www.elbertinnovativesolutions.org" style="color: #AC1A5B;">www.elbertinnovativesolutions.org</a></p>

          <p>We look forward to supporting your mission!</p>
          <p>Warm regards,<br>
          <strong>Dr. Shawnté Elbert</strong><br>
          Elbert Innovative Solutions</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          © ${new Date().getFullYear()} Elbert Innovative Solutions. All rights reserved.
        </div>
      </div>
    `;
  }

  await base44.integrations.Core.SendEmail({
    from_name: 'Elbert Innovative Solutions',
    to: userEmail,
    subject,
    body,
  });

  console.log(`Welcome email sent to ${userEmail} for entry point: ${entryPoint}`);
}