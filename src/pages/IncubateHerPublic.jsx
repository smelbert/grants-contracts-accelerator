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

      // Send welcome email
      await base44.integrations.Core.SendEmail({
        to: data.email,
        subject: 'Welcome to IncubateHer Funding Readiness Program',
        body: `Hi ${data.name},\n\nWelcome to the IncubateHer Funding Readiness Program!\n\nYou're now enrolled in this transformative program funded by Columbus Urban League and delivered by Elbert Innovative Solutions.\n\nNext Steps:\n1. Log in to the platform to complete your pre-assessment\n2. Choose your schedule option\n3. Access your program materials\n\nYou now have full access to:\n- IncubateHer community space\n- Projects and documents workspace\n- Templates and resources\n- Funding opportunities library\n- Direct messaging\n\nWe're excited to support your funding readiness journey!\n\nBest regards,\nElbert Innovative Solutions Team`
      });

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Enrollment successful! Check your email for next steps.');
      setFormData({ name: '', email: '', organization: '', phone: '' });
      setShowEnrollment(false);
    },
    onError: () => {
      toast.error('Enrollment failed. Please try again.');
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
          <Button
            size="lg"
            onClick={() => setShowEnrollment(true)}
            className="text-white text-lg px-8 py-6"
            style={{ backgroundColor: BRAND_COLORS.eisGold }}
          >
            Enroll Now – Free Program
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card style={{ borderColor: BRAND_COLORS.eisGold, borderWidth: 2 }}>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.eisGold }} />
              <p className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.culRed }}>3 Formats</p>
              <p className="text-sm" style={{ color: BRAND_COLORS.eisNavy }}>Choose the schedule that fits your life</p>
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

        {/* Schedule Options */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: BRAND_COLORS.culRed }}>
              Choose Your Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: BRAND_COLORS.neutralLight, border: `2px solid ${BRAND_COLORS.eisNavy}` }}>
                <h3 className="text-xl font-bold mb-3" style={{ color: BRAND_COLORS.eisNavy }}>Option A</h3>
                <p className="text-sm mb-4" style={{ color: BRAND_COLORS.neutralDark }}>3 Evenings</p>
                <ul className="space-y-2 text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                  <li>Mon 5:30 PM – 7:30 PM</li>
                  <li>Tue 5:30 PM – 7:30 PM</li>
                  <li>Thu 5:30 PM – 7:30 PM</li>
                </ul>
              </div>
              <div className="p-6 rounded-lg" style={{ backgroundColor: BRAND_COLORS.neutralLight, border: `2px solid ${BRAND_COLORS.eisNavy}` }}>
                <h3 className="text-xl font-bold mb-3" style={{ color: BRAND_COLORS.eisNavy }}>Option B</h3>
                <p className="text-sm mb-4" style={{ color: BRAND_COLORS.neutralDark }}>2 Extended Evenings</p>
                <ul className="space-y-2 text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                  <li>Mon 5:30 PM – 8:00 PM</li>
                  <li>Thu 5:30 PM – 8:00 PM</li>
                </ul>
              </div>
              <div className="p-6 rounded-lg" style={{ backgroundColor: BRAND_COLORS.neutralLight, border: `2px solid ${BRAND_COLORS.eisNavy}` }}>
                <h3 className="text-xl font-bold mb-3" style={{ color: BRAND_COLORS.eisNavy }}>Option C</h3>
                <p className="text-sm mb-4" style={{ color: BRAND_COLORS.neutralDark }}>2 Evenings + Saturday</p>
                <ul className="space-y-2 text-sm" style={{ color: BRAND_COLORS.neutralDark }}>
                  <li>Mon 5:30 PM – 7:30 PM</li>
                  <li>Thu 5:30 PM – 7:30 PM</li>
                  <li>Sat 9:30 AM – 12:30 PM (In-Person)</li>
                </ul>
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
            <Button
              size="lg"
              onClick={() => setShowEnrollment(true)}
              className="text-lg px-8 py-6"
              style={{ backgroundColor: BRAND_COLORS.eisGold, color: BRAND_COLORS.neutralDark }}
            >
              Enroll Now
            </Button>
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