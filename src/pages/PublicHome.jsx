import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import { 
  Award, 
  BookOpen, 
  Users, 
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Target,
  TrendingUp,
  Star,
  Quote
} from 'lucide-react';

function TestimonialsSection() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ['featured-testimonials'],
    queryFn: async () => {
      const all = await base44.entities.Testimonial.filter({ 
        is_featured: true,
        admin_approved: true 
      });
      return all.slice(0, 3);
    }
  });

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
          <p className="text-xl text-slate-600">Real results from real organizations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-[#E5C089] mb-4" />
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.testimonial_text}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-slate-900">{testimonial.user_name}</p>
                  <p className="text-sm text-slate-500">{testimonial.organization_name}</p>
                  {testimonial.program_type === 'incubateher' && (
                    <p className="text-xs text-[#B21F2D] mt-1 font-medium">IncubateHer Graduate</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PublicHomePage() {
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
              <Link to={createPageUrl('Blog')} className="text-slate-700 hover:text-[#143A50] font-medium">Blog</Link>
              <Link to={createPageUrl('IncubateHerPublic')} className="text-[#B21F2D] hover:text-[#9A1826] font-semibold">
                IncubateHer
              </Link>
              <a href="https://www.elbertinnovativesolutions.org/" className="text-slate-700 hover:text-[#143A50] font-medium" target="_blank" rel="noopener noreferrer">EIS Website</a>
              {useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() }).data ? (
                <Link to={createPageUrl('Home')}>
                  <Button className="bg-[#1E4F58] hover:bg-[#143A50] flex items-center gap-2">
                    <span>←</span> Back to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to={createPageUrl('Register')}>
                  <Button className="bg-[#143A50] hover:bg-[#1E4F58]">Get Started</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#E5C089]/10 via-[#B5A698]/10 to-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E5C089]/20 text-[#143A50] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                Strategic Funding for Every Organization
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Transform Your Organization with Strategic Funding Solutions
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Whether you're a nonprofit, for-profit, solopreneur, or established business—unlock sustainable growth through expert-guided grants, RFPs, contracts, and comprehensive funding strategies tailored to your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl('Register')}>
                  <Button size="lg" className="bg-[#143A50] hover:bg-[#1E4F58] text-lg px-8">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl('AboutEIS')}>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E5C089]/30 flex items-center justify-center">
                      <Target className="w-6 h-6 text-[#143A50]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Strategic Planning</h3>
                      <p className="text-sm text-slate-600">Build winning funding strategies</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#AC1A5B]/20 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-[#AC1A5B]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Expert Training</h3>
                      <p className="text-sm text-slate-600">Learn from industry leaders</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#A65D40]/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#A65D40]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Proven Results</h3>
                      <p className="text-sm text-slate-600">Track record of success</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#143A50] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-[#E5C089] mb-2">$50M+</p>
              <p className="text-slate-300">In Funding Secured</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-[#E5C089] mb-2">500+</p>
              <p className="text-slate-300">Organizations Served</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-[#E5C089] mb-2">95%</p>
              <p className="text-slate-300">Client Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Comprehensive Support for Every Organization Type</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From startups to established enterprises—nonprofits, for-profits, solopreneurs, and LLCs—we provide the tools, training, and expertise you need to secure sustainable funding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Grant Writing Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Master the art of compelling proposals with expert guidance, templates, and feedback
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    Professional templates
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    1-on-1 coaching
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    Review & feedback
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Capacity Building</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Strengthen your organization's infrastructure for long-term sustainability
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                    Strategic planning
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                    Board development
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                    Systems optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Funding Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Develop diversified funding streams tailored to your organization's stage
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5" />
                    Funder matching
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5" />
                    Donor cultivation
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5" />
                    Revenue planning
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#143A50] to-[#1E4F58] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Funding Future?</h2>
          <p className="text-xl text-[#E5C089]/80 mb-8">
            Join hundreds of organizations—nonprofits, for-profits, and entrepreneurs—who have successfully secured sustainable funding with EIS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Register')}>
              <Button size="lg" className="bg-[#E5C089] text-[#143A50] hover:bg-[#E5C089]/90 text-lg px-8">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('BoutiqueServices')}>
              <Button size="lg" variant="outline" className="border-white bg-white text-[#143A50] hover:bg-slate-100 text-lg px-8">
                Premium Services
              </Button>
            </Link>
            <Link to={createPageUrl('IncubateHerPublic')}>
              <Button size="lg" variant="outline" className="border-[#B21F2D] bg-[#B21F2D] text-white hover:bg-[#9A1826] text-lg px-8">
                IncubateHer Program
              </Button>
            </Link>
            <Link to={createPageUrl('AboutEIS')}>
              <Button size="lg" variant="outline" className="border-white bg-white text-[#143A50] hover:bg-slate-100 text-lg px-8">
                Meet Dr. Elbert
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