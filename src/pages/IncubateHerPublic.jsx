import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import { CheckCircle2, Users, Target, Calendar, Award, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'react-hot-toast';

export default function IncubateHerPublic() {
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: ''
  });

  const enrollMutation = useMutation({
    mutationFn: async (data) => {
      // Get or create cohort
      const cohorts = await base44.entities.ProgramCohort.filter({
        program_code: 'incubateher_funding_readiness'
      });
      
      let cohort = cohorts[0];
      if (!cohort) {
        cohort = await base44.entities.ProgramCohort.create({
          program_name: 'IncubateHer – Funding Readiness: Preparing for Grants & Contracts',
          program_code: 'incubateher_funding_readiness',
          funder_organization: 'Columbus Urban League',
          delivery_organization: 'Elbert Innovative Solutions',
          is_active: true
        });
      }

      // Get or create IncubateHer community space
      const spaces = await base44.entities.CommunitySpace.filter({
        slug: 'incubateher'
      });
      
      let communitySpace = spaces[0];
      if (!communitySpace) {
        communitySpace = await base44.entities.CommunitySpace.create({
          space_name: 'IncubateHer Program',
          slug: 'incubateher',
          description: 'Exclusive community for IncubateHer – Funding Readiness participants',
          space_type: 'posts',
          visibility: 'private',
          icon: 'Target',
          is_active: true
        });
      }

      // Invite user to the platform
      await base44.users.inviteUser(data.email, 'user');

      // Create enrollment
      await base44.entities.ProgramEnrollment.create({
        cohort_id: cohort.id,
        participant_email: data.email,
        participant_name: data.name,
        role: 'participant'
      });

      // Set up user access level - full platform except Learning Hub
      const existingAccess = await base44.entities.UserAccessLevel.filter({
        user_email: data.email
      });

      if (existingAccess.length > 0) {
        await base44.entities.UserAccessLevel.update(existingAccess[0].id, {
          access_level: 'full_platform',
          entry_point: 'incubateher_program',
          allowed_community_spaces: [communitySpace.id]
        });
      } else {
        await base44.entities.UserAccessLevel.create({
          user_email: data.email,
          access_level: 'full_platform',
          entry_point: 'incubateher_program',
          allowed_community_spaces: [communitySpace.id]
        });
      }

      // Send personalized welcome email
      await base44.integrations.Core.SendEmail({
        from_name: 'IncubateHer Program',
        to: data.email,
        subject: `Welcome to IncubateHer! 🎉 Here's What to Do Next`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #143A50; padding: 30px; text-align: center;">
              <h1 style="color: #E5C089; margin: 0;">Welcome to IncubateHer!</h1>
            </div>
            <div style="padding: 30px;">
              <p>Hi ${data.name},</p>
              <p>We are so excited to have you in the <strong>IncubateHer: Funding Readiness for Entrepreneurs</strong> program. Your enrollment is confirmed and your journey begins now!</p>

              <h3 style="color: #143A50;">📋 Your Next Steps</h3>
              <ol>
                <li><strong>Check your email</strong> for your platform invitation and log in</li>
                <li><strong>Complete your profile intake</strong> so we can personalize your experience</li>
                <li><strong>Start your Pre-Assessment</strong> to help us understand your current readiness level</li>
                <li><strong>Review the program schedule</strong> and mark your calendar for upcoming sessions</li>
                <li><strong>Join the community</strong> — introduce yourself in the Community Spaces</li>
              </ol>

              <h3 style="color: #143A50;">📅 Program Schedule</h3>
              <ul>
                <li><strong>Monday, March 2 | 5:30–7:30 PM</strong> — Virtual (Google Meet)</li>
                <li><strong>Thursday, March 5 | 5:30–7:30 PM</strong> — Virtual (Google Meet)</li>
                <li><strong>Saturday, March 7 | 9:00 AM–12:00 PM</strong> — In-Person<br>
                  Columbus Metropolitan Library, Shepard Location, Meeting Room 1</li>
              </ul>
              <p><em>You will receive the Google Meet link 24 hours before each virtual session.</em></p>

              <h3 style="color: #143A50;">🔗 Key Resources (after logging in)</h3>
              <ul>
                <li><a href="https://fundher.base44.app/IncubateHerOverview" style="color: #AC1A5B;">Program Overview</a></li>
                <li><a href="https://fundher.base44.app/IncubateHerSchedule" style="color: #AC1A5B;">Schedule & Videos</a></li>
                <li><a href="https://fundher.base44.app/IncubateHerWorkbook" style="color: #AC1A5B;">Your Workbook</a></li>
                <li><a href="https://fundher.base44.app/IncubateHerPreAssessment" style="color: #AC1A5B;">Pre-Assessment</a></li>
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
        `
      });

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Enrollment successful! Check your email for login instructions and session details.');
      setFormData({ name: '', email: '', organization: '', phone: '' });
      setShowEnrollment(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Enrollment failed. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    enrollMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="IncubateHer – Funding Readiness"
        subtitle="Preparing for Grants & Contracts"
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4" style={{ backgroundColor: BRAND_COLORS.culRed, color: BRAND_COLORS.neutralLight }}>
            Women Entrepreneurs of Color
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: BRAND_COLORS.neutralDark }}>
            Build the Foundation for Funding Success
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: BRAND_COLORS.eisNavy }}>
            An intensive program helping entrepreneurs—especially women of color building nonprofit and for-profit businesses—understand what funders need to see before they say yes.
          </p>
          <a href="https://form.jotform.com/260497242186058" target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="text-white text-lg px-8 py-6"
              style={{ backgroundColor: BRAND_COLORS.eisGold }}
            >
              Enroll Now – Free Program
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.eisGold }} />
              <p className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>3 Sessions</p>
              <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Two virtual and one in-person</p>
            </CardContent>
          </Card>
          <Card style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
            <CardContent className="pt-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.eisGold }} />
              <p className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>1:1 Support</p>
              <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Personalized consultation included</p>
            </CardContent>
          </Card>
          <Card style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
            <CardContent className="pt-6 text-center">
              <Award className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.eisGold }} />
              <p className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>Certificate</p>
              <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Earn your completion certificate</p>
            </CardContent>
          </Card>
        </div>

        {/* What You'll Learn */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: BRAND_COLORS.culRed }}>
              What You'll Learn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'The real difference between grants and contracts',
                'How to assess your funding readiness honestly',
                'What documents and systems funders expect to see',
                'How to align your business story for funding',
                'Common pitfalls that cost entrepreneurs time and reputation',
                'How to read and respond to RFPs and contract solicitations'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: BRAND_COLORS.eisGold }} />
                  <span className="text-lg" style={{ color: BRAND_COLORS.neutralDark }}>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: BRAND_COLORS.culRed }}>
              Program Schedule
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="p-8 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.neutralLight, border: `3px solid ${BRAND_COLORS.eisGold}` }}>
                <h3 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.eisNavy }}>March 2, 5 & 7, 2026</h3>
                <p className="text-lg mb-6" style={{ color: BRAND_COLORS.neutralDark }}>In-Person & Virtual Sessions</p>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Calendar className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: BRAND_COLORS.eisGold }} />
                    <div>
                      <span className="font-medium block" style={{ color: BRAND_COLORS.neutralDark }}>Monday, March 2 | 5:30–7:30 PM</span>
                      <span className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Virtual – Google Meet</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Calendar className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: BRAND_COLORS.eisGold }} />
                    <div>
                      <span className="font-medium block" style={{ color: BRAND_COLORS.neutralDark }}>Thursday, March 5 | 5:30–7:30 PM</span>
                      <span className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Virtual – Google Meet</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Calendar className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: BRAND_COLORS.culRed }} />
                    <div>
                      <span className="font-medium block" style={{ color: BRAND_COLORS.neutralDark }}>Saturday, March 7 | 9:00 AM–12:00 PM</span>
                      <span className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>In-Person – Columbus Metropolitan Library</span>
                      <span className="text-sm block" style={{ color: BRAND_COLORS.eisNavy }}>Shepard Location, Meeting Room 1</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm mt-6" style={{ color: BRAND_COLORS.eisNavy }}>
                  After you register, you will receive a confirmation email with the Google Meet link and next steps.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
          <CardContent className="pt-8 pb-8 text-center">
            <Target className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.eisGold }} />
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your Funding Foundation?</h2>
            <p className="text-lg mb-6 opacity-90">
              This free program is funded by Columbus Urban League and delivered by Elbert Innovative Solutions
            </p>
            <a href="https://form.jotform.com/260497242186058" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                style={{ backgroundColor: BRAND_COLORS.eisGold, color: BRAND_COLORS.neutralDark }}
              >
                Enroll Now
              </Button>
            </a>
            <p className="text-sm mt-4 opacity-75">
              Limited spots available for this cohort
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <p className="text-sm text-center" style={{ color: BRAND_COLORS.neutralDark }}>
              <strong>Important:</strong> This program supports funding readiness and preparation. It does not include grant searches, application writing during sessions, or funding guarantees.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Modal */}
      {showEnrollment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4" style={{ color: BRAND_COLORS.culRed }}>
                Enroll in IncubateHer
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Organization/Business Name</Label>
                  <Input
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEnrollment(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 text-white"
                    style={{ backgroundColor: BRAND_COLORS.eisGold }}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? 'Enrolling...' : 'Complete Enrollment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <CoBrandedFooter />
    </div>
  );
}