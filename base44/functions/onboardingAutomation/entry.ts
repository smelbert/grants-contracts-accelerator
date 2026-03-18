import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only process new registrations
    if (event.type !== 'create') {
      return Response.json({ message: 'Not a create event' });
    }

    const submission = data;
    const registrationPage = await base44.asServiceRole.entities.RegistrationPage.filter({ 
      id: submission.registration_page_id 
    });

    if (!registrationPage.length) {
      return Response.json({ error: 'Registration page not found' }, { status: 404 });
    }

    const page = registrationPage[0];
    
    // Grant access immediately
    await base44.asServiceRole.entities.UserAccessLevel.create({
      user_email: submission.user_email,
      access_level: page.access_level,
      entry_point: submission.entry_point,
      allowed_community_spaces: page.community_space_id ? [page.community_space_id] : [],
      coaching_access: page.registration_type === 'coaching',
      coaching_type: page.registration_type === 'coaching' ? 'grant_writing' : null,
      active_registrations: [page.id]
    });

    // Update submission to mark access granted
    await base44.asServiceRole.entities.RegistrationSubmission.update(submission.id, {
      access_granted: true,
      access_granted_date: new Date().toISOString()
    });

    // Send onboarding email based on registration type
    const emailContent = getOnboardingEmail(page.registration_type, page.page_name, submission.user_name);
    
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: submission.user_email,
      subject: emailContent.subject,
      body: emailContent.body
    });

    // Create onboarding checklist
    const checklistItems = getChecklistItems(page.registration_type);
    
    await base44.asServiceRole.entities.OnboardingChecklist.create({
      user_email: submission.user_email,
      user_role: 'user',
      checklist_items: checklistItems,
      current_step: 0,
      completed: false,
      welcome_email_sent: true
    });

    // Schedule post-event survey if enabled
    if (page.post_registration_survey_enabled && page.registration_type !== 'community_only') {
      // Survey will be sent 24 hours after the event/session
      const surveyDate = new Date();
      surveyDate.setDate(surveyDate.getDate() + 1);
      
      await base44.asServiceRole.entities.RegistrationSubmission.update(submission.id, {
        survey_sent_date: surveyDate.toISOString()
      });
    }

    return Response.json({ 
      success: true,
      message: 'Onboarding workflow completed',
      actions: {
        access_granted: true,
        email_sent: true,
        checklist_created: true
      }
    });

  } catch (error) {
    console.error('Onboarding automation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getOnboardingEmail(registrationType, pageName, userName) {
  const emails = {
    workshop: {
      subject: `Welcome to ${pageName}! 🎉`,
      body: `
Hi ${userName},

Welcome to ${pageName}! We're thrilled to have you join us.

<strong>What's Next:</strong>
✓ Check your email for workshop details and joining instructions
✓ Access your pre-workshop materials in the Learning Hub
✓ Join our community space to connect with fellow participants
✓ Review the workshop agenda and prepare any questions

<strong>Getting Started:</strong>
1. Log into your EIS platform account
2. Navigate to the Learning Hub
3. Find your workshop materials under "My Enrollments"

We look forward to working with you!

Best regards,
The EIS Team

---
Elbert Innovative Solutions
www.elbertinnovativesolutions.org
      `
    },
    training: {
      subject: `Welcome to ${pageName}! 🚀`,
      body: `
Hi ${userName},

Thank you for registering for ${pageName}. You're taking an important step in advancing your skills!

<strong>What's Included:</strong>
✓ Complete training curriculum
✓ Downloadable resources and templates
✓ Community access for peer learning
✓ Certificate of completion

<strong>Your Next Steps:</strong>
1. Complete your learner profile
2. Review the training overview
3. Introduce yourself in the community
4. Set your learning goals

Access everything through your dashboard at elbertinnovativesolutions.org

See you soon!

The EIS Training Team
      `
    },
    coaching: {
      subject: `Your Coaching Journey Begins! 🌟`,
      body: `
Hi ${userName},

Welcome to your personalized coaching experience with Elbert Innovative Solutions!

<strong>What Happens Now:</strong>
1. Complete your coaching intake form (check your dashboard)
2. Your coach will review your goals and challenges
3. We'll schedule your first session within 3-5 business days
4. You'll receive a calendar invitation with session details

<strong>Before Your First Session:</strong>
✓ Complete the intake form
✓ Review your goals and desired outcomes
✓ Prepare any materials or questions you'd like to discuss
✓ Set up your preferred meeting times in your profile

<strong>Access Your Coaching Portal:</strong>
Log in to your dashboard to access:
- Session scheduling
- Shared documents and resources
- Progress tracking
- Direct messaging with your coach

We're excited to support your growth!

Your EIS Coaching Team
      `
    },
    community_only: {
      subject: `Welcome to the EIS Community! 👋`,
      body: `
Hi ${userName},

Welcome to the Elbert Innovative Solutions community!

<strong>Your Community Benefits:</strong>
✓ Connect with nonprofit professionals and social impact leaders
✓ Share insights and learn from peers
✓ Access exclusive community resources
✓ Participate in discussions and events
✓ Stay updated on funding opportunities

<strong>Get Started:</strong>
1. Complete your member profile
2. Introduce yourself in the community
3. Browse and join relevant discussion groups
4. Explore upcoming events and workshops

<strong>Community Guidelines:</strong>
Please review our community guidelines to ensure a positive, supportive environment for all members.

Ready to dive in? Visit your dashboard at elbertinnovativesolutions.org

Welcome aboard!

The EIS Community Team
      `
    },
    course: {
      subject: `Welcome to ${pageName}! 📚`,
      body: `
Hi ${userName},

Congratulations on enrolling in ${pageName}!

<strong>Course Access:</strong>
Your course is now available in the Learning Hub. You can start immediately and learn at your own pace.

<strong>What You'll Get:</strong>
✓ Complete course curriculum with video lessons
✓ Downloadable templates and resources
✓ Interactive activities and assessments
✓ Community forum for peer discussion
✓ Certificate upon completion

<strong>Getting Started:</strong>
1. Visit your Learning Hub
2. Review the course overview
3. Start with Module 1
4. Join the course community to connect with peers

<strong>Pro Tips:</strong>
- Set aside dedicated time for learning
- Take notes and apply concepts to your work
- Engage in community discussions
- Complete activities to reinforce learning

Let's get started! Log in at elbertinnovativesolutions.org

Happy Learning!

The EIS Team
      `
    }
  };

  return emails[registrationType] || emails.community_only;
}

function getChecklistItems(registrationType) {
  const baseItems = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your bio, expertise, and interests',
      completed: false,
      action_url: '/Profile'
    }
  ];

  const typeSpecificItems = {
    workshop: [
      {
        id: 'materials',
        title: 'Review Pre-Workshop Materials',
        description: 'Access preparation materials in the Learning Hub',
        completed: false,
        action_url: '/Learning'
      },
      {
        id: 'community',
        title: 'Join Workshop Community',
        description: 'Connect with other participants',
        completed: false,
        action_url: '/Community'
      }
    ],
    training: [
      {
        id: 'overview',
        title: 'Review Training Overview',
        description: 'Understand the curriculum and learning path',
        completed: false,
        action_url: '/Learning'
      },
      {
        id: 'goals',
        title: 'Set Learning Goals',
        description: 'Define what you want to achieve',
        completed: false,
        action_url: '/Learning'
      }
    ],
    coaching: [
      {
        id: 'intake',
        title: 'Complete Coaching Intake Form',
        description: 'Help your coach understand your goals',
        completed: false,
        action_url: '/CoachDashboard'
      },
      {
        id: 'schedule',
        title: 'Schedule First Session',
        description: 'Book your initial coaching session',
        completed: false,
        action_url: '/CoachDashboard'
      }
    ],
    community_only: [
      {
        id: 'introduce',
        title: 'Introduce Yourself',
        description: 'Share your background with the community',
        completed: false,
        action_url: '/Community'
      },
      {
        id: 'guidelines',
        title: 'Review Community Guidelines',
        description: 'Understand our community standards',
        completed: false,
        action_url: '/Community'
      }
    ],
    course: [
      {
        id: 'start',
        title: 'Start Course Module 1',
        description: 'Begin your learning journey',
        completed: false,
        action_url: '/Learning'
      },
      {
        id: 'forum',
        title: 'Join Course Forum',
        description: 'Connect with fellow learners',
        completed: false,
        action_url: '/Community'
      }
    ]
  };

  return [...baseItems, ...(typeSpecificItems[registrationType] || [])];
}