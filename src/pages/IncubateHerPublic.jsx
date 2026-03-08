import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import ProgramRegistrationForm from '@/components/incubateher/ProgramRegistrationForm';
import { CheckCircle2, Users, Target, Calendar, Award, ArrowRight, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function IncubateHerPublic() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const scrollToForm = () => {
    document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
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
            onClick={scrollToForm}
            className="text-white text-lg px-8 py-6"
            style={{ backgroundColor: BRAND_COLORS.eisGold }}
          >
            Apply Now – Free Program
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
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
            <Button
              size="lg"
              onClick={scrollToForm}
              className="text-lg px-8 py-6"
              style={{ backgroundColor: BRAND_COLORS.eisGold, color: BRAND_COLORS.neutralDark }}
            >
              Apply Now
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

        {/* Registration Form */}
        <div id="registration-form" className="mt-16 scroll-mt-8">
          <div className="text-center mb-2">
            <Badge style={{ backgroundColor: BRAND_COLORS.culRed, color: BRAND_COLORS.neutralLight }}>
              Now Accepting Applications
            </Badge>
          </div>
          <ProgramRegistrationForm />
        </div>
      </div>

      {user && (
        <div className="bg-[#143A50] text-center py-8">
          <Link to={createPageUrl('Home')}>
            <Button className="bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90 flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      )}
      
      <CoBrandedFooter />
    </div>
  );
}