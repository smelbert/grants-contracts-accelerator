import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Award, 
  BookOpen, 
  Users, 
  Heart,
  ArrowRight,
  GraduationCap,
  Target,
  Sparkles,
  Building2
} from 'lucide-react';

export default function AboutEISPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
                alt="Elbert Innovative Solutions" 
                className="h-12 w-auto"
              />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl('PublicHome')} className="text-slate-700 hover:text-[#143A50] font-medium">Home</Link>
              <Link to={createPageUrl('AboutEIS')} className="text-slate-700 hover:text-[#143A50] font-medium">About</Link>
              <a href="https://www.elbertinnovativesolutions.org/" className="text-slate-700 hover:text-[#143A50] font-medium" target="_blank" rel="noopener noreferrer">Website</a>
              <Link to={createPageUrl('IncubateHerPublic')} className="text-[#B21F2D] hover:text-[#9A1826] font-semibold">
                IncubateHer
              </Link>
              <Link to={createPageUrl('Register')}>
                <Button className="bg-[#143A50] hover:bg-[#1E4F58]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#E5C089]/10 via-[#B5A698]/10 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#E5C089]/20 text-[#143A50] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Our Story
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              About EIS
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Empowering organizations of all types—nonprofits, for-profits, solopreneurs, and enterprises—to achieve their missions through strategic funding, capacity building, and expert guidance
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                EIS exists to bridge the gap between passionate changemakers and the resources they need to create lasting impact. We believe that every organization—whether nonprofit, for-profit, solopreneur, or LLC—deserves access to expert guidance and proven strategies for sustainable funding.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Through personalized coaching, comprehensive training, and strategic support, we help organizations build the capacity and confidence to secure grants, RFPs, contracts, bids, and funding relationships that fuel their growth.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#E5C089]/20 border-[#E5C089]">
                <CardContent className="pt-6">
                  <Building2 className="w-10 h-10 text-[#143A50] mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">500+</h3>
                  <p className="text-sm text-slate-600">Organizations Supported</p>
                </CardContent>
              </Card>
              <Card className="bg-[#AC1A5B]/10 border-[#AC1A5B]">
                <CardContent className="pt-6">
                  <Award className="w-10 h-10 text-[#AC1A5B] mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">$50M+</h3>
                  <p className="text-sm text-slate-600">Funding Secured</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1E4F58]/10 border-[#1E4F58]">
                <CardContent className="pt-6">
                  <GraduationCap className="w-10 h-10 text-[#1E4F58] mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">1000+</h3>
                  <p className="text-sm text-slate-600">Training Sessions</p>
                </CardContent>
              </Card>
              <Card className="bg-[#A65D40]/10 border-[#A65D40]">
                <CardContent className="pt-6">
                  <Target className="w-10 h-10 text-[#A65D40] mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">95%</h3>
                  <p className="text-sm text-slate-600">Success Rate</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Dr. Elbert Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-[#E5C089]/20 text-[#143A50] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Founder & Lead Consultant
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Meet Dr. Shawnté Elbert</h2>
              
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                <p>
                  Dr. Shawnté Elbert is a dynamic leader with a distinctive mix of experience in public health, higher education, and leadership development. Through Elbert Innovative Solutions (EIS) and Dr. E Speaks!, she believes that everyone is perfectly positioned for transformation.
                </p>
                <p>
                  With a personalized, evidence-based approach, Dr. Elbert delivers comprehensive solutions that place your goals and well-being at the core of every interaction. Her strategies are grounded in research and data, ensuring that the guidance provided is both reliable and impactful.
                </p>
                <p>
                  From strategic consulting and grant writing to executive wellness programs and powerful speaking engagements, Dr. Elbert uses words to heal and inspire, helping individuals and organizations thrive. Her work spans higher education, public health, DEIB initiatives, and organizational development—empowering leaders to create lasting impact.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E5C089]/30 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#143A50]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Multifaceted Expertise</h4>
                    <p className="text-sm text-slate-600">Distinctive mix of experience in public health, higher education, and leadership</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#AC1A5B]/20 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-[#AC1A5B]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Evidence-Based Approach</h4>
                    <p className="text-sm text-slate-600">Strategies grounded in research and data for reliable, impactful results</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E4F58]/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-[#1E4F58]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Personalized Experience</h4>
                    <p className="text-sm text-slate-600">Deeply personalized approach with your goals and well-being at the core</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative flex items-center justify-center">
                {/* Layered 3D backdrop */}
                <div className="absolute w-80 h-96 bg-[#B5A698]/40 rounded-2xl -rotate-6 translate-x-4 translate-y-4"></div>
                <div className="absolute w-80 h-96 bg-[#E5C089]/50 rounded-2xl -rotate-3 translate-x-2 translate-y-2"></div>
                
                {/* Main photo */}
                <div className="relative z-10">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/db3464ad4_Dreamwave-Photo9.png"
                    alt="Dr. Shawnté Elbert"
                    className="w-72 h-96 object-cover rounded-2xl shadow-2xl"
                  />
                </div>
                
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl border border-[#E5C089] max-w-xs z-20">
                  <p className="text-sm font-medium text-slate-900 mb-2">
                    "Perfectly Positioned to Empower, Lead, and Thrive."
                  </p>
                  <p className="text-xs text-[#143A50]">- Dr. Shawnté Elbert</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Approach</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We combine proven methodologies with personalized support to help you achieve funding success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-[#E5C089]/30 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[#143A50]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Personalized Strategy</h3>
                <p className="text-slate-600">
                  Every organization is unique. We develop customized funding strategies that align with your mission, capacity, and growth stage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-[#AC1A5B]/20 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#AC1A5B]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Expert Coaching</h3>
                <p className="text-slate-600">
                  Work directly with experienced consultants who provide hands-on guidance, feedback, and support throughout your journey.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-[#1E4F58]/20 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-[#1E4F58]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Comprehensive Resources</h3>
                <p className="text-slate-600">
                  Access our library of templates, toolkits, training modules, and proven frameworks that accelerate your success.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Work Together?</h2>
          <p className="text-xl text-[#E5C089]/80 mb-8">
            Join the EIS community and start building your sustainable funding future today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Register')}>
              <Button size="lg" className="bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90 text-lg px-8">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('BoutiqueServices')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                Explore Premium Services
              </Button>
            </Link>
            <Link to={createPageUrl('IncubateHerPublic')}>
              <Button size="lg" variant="outline" className="border-[#B21F2D] bg-[#B21F2D] text-white hover:bg-[#9A1826] text-lg px-8">
                IncubateHer Program
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#143A50] text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
                alt="EIS" 
                className="h-10 w-auto mb-4"
              />
              <p className="text-sm">
                Empowering all organizations to achieve sustainable growth through strategic funding, capacity building, and leadership development.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('PublicHome')} className="hover:text-[#E5C089]">Home</Link></li>
                <li><Link to={createPageUrl('AboutEIS')} className="hover:text-[#E5C089]">About EIS</Link></li>
                <li><a href="https://www.elbertinnovativesolutions.org/" className="hover:text-[#E5C089]" target="_blank" rel="noopener noreferrer">Website</a></li>
                <li><Link to={createPageUrl('Register')} className="hover:text-[#E5C089]">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">
                Visit: <a href="https://www.elbertinnovativesolutions.org/" className="hover:text-[#E5C089]" target="_blank" rel="noopener noreferrer">elbertinnovativesolutions.org</a>
              </p>
            </div>
          </div>
          <div className="border-t border-[#1E4F58] mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 Elbert Innovative Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}